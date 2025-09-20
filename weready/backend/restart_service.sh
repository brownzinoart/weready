#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/backend"
VENV_PATH="${BACKEND_DIR}/venv"
PID_FILE="${PROJECT_ROOT}/logs/uvicorn.pid"
LOG_DIR="${PROJECT_ROOT}/logs"
SERVICE_LOG="${LOG_DIR}/backend_service.log"
ENV_FILE="${PROJECT_ROOT}/.env"
MODE="dev"
UVICORN_BIN="${VENV_PATH}/bin/uvicorn"

mkdir -p "${LOG_DIR}"

log() {
  local message="$1"
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "${message}" | tee -a "${SERVICE_LOG}"
}

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--mode dev|prod] [--env-file path]

Options:
  --mode       Restart mode. dev enables reload, prod enables multi-worker. Default: dev
  --env-file   Path to environment file with Business Pillar secrets. Default: ${ENV_FILE}
USAGE
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="$2"
      shift 2
      ;;
    --env-file)
      ENV_FILE="$2"
      shift 2
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

if [[ -f "${ENV_FILE}" ]]; then
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  log "Loaded environment variables from ${ENV_FILE}."
else
  log "WARNING: Environment file ${ENV_FILE} not found. Relying on current shell variables."
fi

REQUIRED_ENV_VARS=(
  "SESSION_SECRET"
  "REDIS_URL"
  "BEA_API_KEY"
  "OECD_APP_ID"
  "PRODUCT_HUNT_TOKEN"
  "STACKEXCHANGE_KEY"
)

OPTIONAL_WARN_ENV_VARS=(
  "WORLD_BANK_SOURCE"
  "OPENALEX_BASE_URL"
)

validate_env() {
  local missing=()
  for var in "${REQUIRED_ENV_VARS[@]}"; do
    if [[ -z "${!var:-}" ]]; then
      missing+=("$var")
    fi
  done
  if (( ${#missing[@]} > 0 )); then
    log "ERROR: Missing required environment variables: ${missing[*]}"
    exit 1
  fi
  local warn_missing=()
  for var in "${OPTIONAL_WARN_ENV_VARS[@]}"; do
    if [[ -z "${!var:-}" ]]; then
      warn_missing+=("$var")
    fi
  done
  if (( ${#warn_missing[@]} > 0 )); then
    log "WARNING: Optional environment variables not set: ${warn_missing[*]}"
  fi
  log "Environment variables validated."
}

activate_venv() {
  if [[ ! -d "${VENV_PATH}" ]]; then
    log "ERROR: Virtual environment not found at ${VENV_PATH}. Run install_dependencies.sh first."
    exit 1
  fi
  # shellcheck disable=SC1090
  source "${VENV_PATH}/bin/activate"
  log "Activated virtual environment."
}

stop_service() {
  local patterns=("uvicorn app.main:app" "gunicorn app.main:app")
  local stopped=false
  for pattern in "${patterns[@]}"; do
    mapfile -t pids < <(pgrep -f "$pattern" || true)
    if (( ${#pids[@]} > 0 )); then
      stopped=true
      for pid in "${pids[@]}"; do
        log "Stopping process ${pid} (${pattern})."
        kill -TERM "${pid}" || true
      done
    fi
  done

  if [[ "${stopped}" == true ]]; then
    for attempt in {1..10}; do
      if pgrep -f "app.main:app" >/dev/null 2>&1; then
        log "Waiting for service to stop (attempt ${attempt}/10)."
        sleep 1
      else
        break
      fi
    done
    if pgrep -f "app.main:app" >/dev/null 2>&1; then
      mapfile -t remaining < <(pgrep -f "app.main:app")
      for pid in "${remaining[@]}"; do
        log "Force terminating lingering process ${pid}."
        kill -KILL "${pid}" || true
      done
    fi
    log "Previous FastAPI service stopped."
  else
    log "No existing FastAPI service detected."
  fi
}

start_service() {
  local workers=${UVICORN_WORKERS:-4}
  local extra_flags=()

  case "${MODE}" in
    dev)
      extra_flags=("--reload")
      ;;
    prod)
      extra_flags=("--workers" "${workers}" "--proxy-headers")
      ;;
    *)
      log "ERROR: Unsupported mode '${MODE}'."
      exit 1
      ;;
  esac

  if [[ ! -x "${UVICORN_BIN}" ]]; then
    log "ERROR: Uvicorn binary not found at ${UVICORN_BIN}. Ensure dependencies are installed."
    exit 1
  fi

  log "Starting FastAPI service in ${MODE} mode on port ${PORT}."
  nohup "${UVICORN_BIN}" app.main:app --host 0.0.0.0 --port "${PORT}" "${extra_flags[@]}" \
    >"${LOG_DIR}/uvicorn.out" 2>&1 &
  local new_pid=$!
  echo "${new_pid}" > "${PID_FILE}"
  log "FastAPI service started with PID ${new_pid}. Logs: ${LOG_DIR}/uvicorn.out"
}

wait_for_service() {
  local retries=30
  local expected_status=200
  local status
  for attempt in $(seq 1 ${retries}); do
    status=$(curl -ks -o /tmp/backend-health-check.json -w '%{http_code}' "${HEALTH_URL}") || status="000"
    if [[ "${status}" == "${expected_status}" ]]; then
      log "Service responded with ${expected_status} (${HEALTH_URL})."
      rm -f /tmp/backend-health-check.json
      return 0
    fi
    log "Waiting for service readiness (${attempt}/${retries})."
    sleep 1
  done
  log "ERROR: Service did not respond with ${expected_status} within ${retries} seconds."
  return 1
}

check_endpoint() {
  local path="$1"
  local expected_key="$2"
  local url="http://127.0.0.1:${PORT}${path}"
  local response_file
  response_file=$(mktemp)
  local status
  status=$(curl -ks -o "${response_file}" -w '%{http_code}' "${url}") || status="000"
  if [[ "${status}" != "200" ]]; then
    log "ERROR: ${url} returned status ${status}."
    cat "${response_file}" >>"${SERVICE_LOG}"
    rm -f "${response_file}"
    return 1
  fi
  if [[ -n "${expected_key}" ]] && ! grep -q "${expected_key}" "${response_file}"; then
    log "WARNING: ${url} succeeded but did not include expected key '${expected_key}'."
  else
    log "Endpoint ${url} healthy."
  fi
  rm -f "${response_file}"
}

verify_redis() {
  log "Verifying Redis connectivity (${REDIS_URL})."
  python - <<'PY'
import os
import asyncio

try:
    from redis import asyncio as aioredis
except ImportError as exc:
    raise SystemExit(f"redis package required for health check: {exc}")

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

async def main():
    client = aioredis.from_url(redis_url)
    try:
        pong = await client.ping()
        if pong is True:
            print(f"Redis ping successful for {redis_url}.")
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(main())
PY
}

run_health_checks() {
  verify_redis
  check_endpoint "/api/business-formation/software" "momentum_score"
  check_endpoint "/api/international-markets/us" "signals"
  check_endpoint "/api/technology-trends/ai" "signals"
  check_endpoint "/api/business-intelligence/dashboard" "business_formation"
  check_endpoint "/api/procurement/541511" "top_agencies"
}

rollback() {
  log "Attempting rollback by starting service in development mode."
  MODE="dev"
  stop_service || true
  start_service
  if wait_for_service; then
    log "Rollback succeeded. Service running in development mode."
  else
    log "Rollback failed. Manual intervention required."
  fi
}

on_failure() {
  local exit_code=$?
  trap - ERR
  log "Restart failed. Initiating rollback sequence."
  rollback || true
  exit ${exit_code}
}

trap on_failure ERR

main() {
  PORT="${PORT:-8000}"
  HEALTH_URL="http://127.0.0.1:${PORT}/api/business-intelligence/dashboard"

  validate_env
  activate_venv
  stop_service
  start_service
  wait_for_service
  run_health_checks
  trap - ERR
  log "FastAPI service restarted successfully with Business Pillar enhancements."
}

main "$@"
