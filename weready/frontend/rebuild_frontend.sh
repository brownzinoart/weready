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
  (cd "${FRONTEND_DIR}" && npm run typecheck >>"${LOG_FILE}" 2>&1)
}

run_component_validation() {
  log "Validating Business Intelligence components."
  (cd "${FRONTEND_DIR}" && npm run validate:components >>"${LOG_FILE}" 2>&1)
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
}

main() {
  ensure_node
  clean_caches
  install_dependencies
  verify_dependency_versions
  run_typecheck
  run_component_validation
  build_frontend
  post_build_summary
}

main "$@"
