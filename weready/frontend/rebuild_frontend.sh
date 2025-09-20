#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)/frontend"
LOG_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)/logs"
LOG_FILE="${LOG_DIR}/frontend_rebuild.log"
MODE="prod"
SKIP_INSTALL=false

mkdir -p "${LOG_DIR}"

log() {
  local message="$1"
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "${message}" | tee -a "${LOG_FILE}"
}

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--mode dev|prod] [--skip-install]

Options:
  --mode          Build mode. dev keeps source maps, prod enables optimizations. Default: prod.
  --skip-install  Skip dependency installation (assumes node_modules already up to date).
USAGE
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="$2"
      shift 2
      ;;
    --skip-install)
      SKIP_INSTALL=true
      shift 1
      ;;
    -h|--help)
      usage
      ;;
    *)
      log "Unknown argument: $1"
      usage
      ;;
  esac
done

handle_error() {
  local exit_code=$?
  log "ERROR: Frontend rebuild failed with exit code ${exit_code}. Check ${LOG_FILE} for details."
  exit ${exit_code}
}

trap handle_error ERR

ensure_node() {
  if ! command -v node >/dev/null 2>&1; then
    log "ERROR: Node.js is required but was not found on PATH."
    exit 1
  fi
  if ! command -v npm >/dev/null 2>&1; then
    log "ERROR: npm is required but was not found on PATH."
    exit 1
  fi
  log "Node.js $(node -v) / npm $(npm -v) detected."
}

clean_caches() {
  log "Cleaning Next.js caches and verifying npm cache."
  rm -rf "${FRONTEND_DIR}/.next" "${FRONTEND_DIR}/.turbo" "${FRONTEND_DIR}/node_modules/.cache" || true
  (cd "${FRONTEND_DIR}" && npm cache verify >>"${LOG_FILE}" 2>&1)
}

install_dependencies() {
  if [[ "${SKIP_INSTALL}" == true ]]; then
    log "Skipping dependency installation per flag."
    return
  fi
  log "Installing npm dependencies for Business Pillar enhancements."
  (cd "${FRONTEND_DIR}" && npm install >>"${LOG_FILE}" 2>&1)
}

verify_dependency_versions() {
  log "Verifying critical frontend dependencies."
  node <<'NODE'
const { readFileSync } = require('fs');
const path = require('path');
const packageJson = JSON.parse(readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
const required = {
  recharts: '2.12.5',
  'd3-scale': '4.0.2',
  swr: '2.2.5'
};
const missing = [];
for (const [pkg, expected] of Object.entries(required)) {
  const actual = (packageJson.dependencies && packageJson.dependencies[pkg]) ||
                 (packageJson.devDependencies && packageJson.devDependencies[pkg]);
  if (!actual) {
    missing.push(`${pkg}@${expected}`);
  }
}
if (missing.length) {
  console.error(`Missing required Business Pillar packages: ${missing.join(', ')}`);
  process.exit(1);
}
NODE
}

run_typecheck() {
  log "Running TypeScript compilation check."
  if ! (cd "${FRONTEND_DIR}" && npm run typecheck >>"${LOG_FILE}" 2>&1); then
    log "TypeScript compilation failed. Inspect ${LOG_FILE} for compiler output."
    exit 1
  fi
}

run_component_validation() {
  log "Validating Business Intelligence components."
  if ! (cd "${FRONTEND_DIR}" && npm run validate:components >>"${LOG_FILE}" 2>&1); then
    log "Component validation failed. Review ${LOG_FILE} for import/export issues."
    exit 1
  fi
}

verify_tab_component_registration() {
  log "Ensuring Business tab components are imported and exported correctly."
  if ! (
    cd "${FRONTEND_DIR}" && node <<'NODE' >>"${LOG_FILE}" 2>&1
const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

const checks = [
  {
    file: 'app/components/tabs/BusinessIntelligenceTab.tsx',
    description: 'BusinessIntelligenceTab default export',
    test: (content) => /export default function\s+BusinessIntelligenceTab/.test(content)
  },
  {
    file: 'app/components/tabs/BusinessTab.tsx',
    description: 'BusinessTab default export',
    test: (content) => /export default function\s+BusinessTab/.test(content)
  }
];

const issues = [];

for (const check of checks) {
  const filePath = path.join(projectRoot, check.file);
  if (!fs.existsSync(filePath)) {
    issues.push(`${check.description} missing (file not found: ${check.file})`);
    continue;
  }
  const content = read(check.file);
  if (!check.test(content)) {
    issues.push(`${check.description} missing expected syntax`);
  }
}

const pageFile = 'app/bailey-intelligence/page.tsx';
const pagePath = path.join(projectRoot, pageFile);
if (!fs.existsSync(pagePath)) {
  issues.push('bailey-intelligence/page.tsx not found');
} else {
  const pageContent = read(pageFile);
  if (!/import\s+BusinessIntelligenceTab\s+from\s+"\.\.\/components\/tabs\/BusinessIntelligenceTab"/.test(pageContent)) {
    issues.push('BusinessIntelligenceTab import missing from bailey-intelligence/page.tsx');
  }
  if (!/activeTab\s*===\s*"business"[\s\S]+BusinessIntelligenceTab/.test(pageContent)) {
    issues.push('BusinessIntelligenceTab conditional render missing for business tab');
  }
}

if (issues.length) {
  console.error('Tab component verification failed:');
  for (const issue of issues) {
    console.error(` - ${issue}`);
  }
  process.exit(1);
}

console.log('Tab components verified successfully.');
NODE
  ); then
    log "Tab component registration check failed. See ${LOG_FILE} for details."
    exit 1
  fi
}

refresh_dev_hot_reload() {
  if [[ "${MODE}" == "dev" ]]; then
    log "Priming Next.js hot reload by touching updated tab components."
    (cd "${FRONTEND_DIR}" && touch \
      app/bailey-intelligence/page.tsx \
      app/components/tabs/BusinessIntelligenceTab.tsx \
      app/components/tabs/BusinessTab.tsx >>"${LOG_FILE}" 2>&1)
  fi
}

build_frontend() {
  log "Executing Next.js build in ${MODE} mode."
  if [[ "${MODE}" == "dev" ]]; then
    (cd "${FRONTEND_DIR}" && NEXT_TELEMETRY_DISABLED=1 NODE_ENV=development next build --no-lint >>"${LOG_FILE}" 2>&1)
  else
    (cd "${FRONTEND_DIR}" && NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production next build >>"${LOG_FILE}" 2>&1)
  fi
}

post_build_summary() {
  log "Rebuild complete. Artifacts located in ${FRONTEND_DIR}/.next"
  if [[ "${MODE}" == "dev" ]]; then
    log "Dev mode: restart or resume npm run dev to let hot reload pick up the refreshed tabs."
  fi
}

main() {
  ensure_node
  clean_caches
  install_dependencies
  verify_dependency_versions
  run_typecheck
  run_component_validation
  verify_tab_component_registration
  refresh_dev_hot_reload
  build_frontend
  post_build_summary
}

main "$@"
