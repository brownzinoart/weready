#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${SCRIPT_DIR}"
BACKEND_DIR="${PROJECT_ROOT}/backend"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"
LOG_DIR="${PROJECT_ROOT}/logs"
LOG_FILE="${LOG_DIR}/run_enhanced.log"
MODE="prod"
BASE_URL="http://127.0.0.1:8000"

mkdir -p "${LOG_DIR}"

log() {
  local message="$1"
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "${message}" | tee -a "${LOG_FILE}"
}

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--mode dev|prod] [--base-url <url>] [--skip-monitoring]

Runs the end-to-end Business Pillar deployment pipeline.
USAGE
  exit 1
}

SKIP_MONITORING=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="$2"
      shift 2
      ;;
    --base-url)
      BASE_URL="$2"
      shift 2
      ;;
    --skip-monitoring)
      SKIP_MONITORING=true
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

handle_failure() {
  local exit_code=$?
  log "ERROR: run_enhanced.sh failed with exit code ${exit_code}. See ${LOG_FILE}."
  exit ${exit_code}
}

trap handle_failure ERR

run_environment_setup() {
  log "Configuring environment variables (${MODE})."
  "${PROJECT_ROOT}/environment_setup.sh" --mode "${MODE}" --env-file "${PROJECT_ROOT}/.env.business" >>"${LOG_FILE}" 2>&1
}

install_backend_dependencies() {
  log "Installing backend dependencies."
  (cd "${BACKEND_DIR}" && ./install_dependencies.sh) >>"${LOG_FILE}" 2>&1
}

setup_redis() {
  log "Configuring Redis cache."
  "${PROJECT_ROOT}/redis_setup.sh" >>"${LOG_FILE}" 2>&1
}

restart_backend() {
  log "Restarting FastAPI service (${MODE})."
  (cd "${BACKEND_DIR}" && ./restart_service.sh --mode "${MODE}" --env-file "${PROJECT_ROOT}/.env.business") >>"${LOG_FILE}" 2>&1
}

rebuild_frontend() {
  log "Rebuilding frontend (${MODE})."
  (cd "${FRONTEND_DIR}" && ./rebuild_frontend.sh --mode "${MODE}") >>"${LOG_FILE}" 2>&1
}

run_health_verification() {
  log "Running backend health verification."
  python3 "${BACKEND_DIR}/health_check.py" --json --base-url "${BASE_URL}" >"${LOG_DIR}/health_report.json" || log "WARNING: health_check.py reported issues."
  python3 "${BACKEND_DIR}/validate_apis.py" --json --base-url "${BASE_URL}" >"${LOG_DIR}/api_report.json" || log "WARNING: validate_apis.py reported issues."
}

run_frontend_validation() {
  log "Running frontend component validation."
  (cd "${FRONTEND_DIR}" && npm run validate:components) >>"${LOG_FILE}" 2>&1 || log "WARNING: Component validation returned non-zero status."
}

run_monitoring_setup() {
  if [[ "${SKIP_MONITORING}" == true ]]; then
    log "Skipping monitoring setup per flag."
    return
  fi
  log "Generating monitoring assets."
  "${PROJECT_ROOT}/monitoring_setup.sh" >>"${LOG_FILE}" 2>&1 || log "WARNING: monitoring_setup encountered issues."
}

summarize() {
  log "Business Pillar deployment pipeline completed."
  log "Reports:"
  log "  - ${LOG_DIR}/health_report.json"
  log "  - ${LOG_DIR}/api_report.json"
  log "  - ${LOG_FILE}"
}

main() {
  run_environment_setup
  install_backend_dependencies
  setup_redis
  restart_backend
  rebuild_frontend
  run_health_verification
  run_frontend_validation
  run_monitoring_setup
  trap - ERR
  summarize
}

main "$@"
