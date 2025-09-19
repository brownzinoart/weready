#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
LOG_DIR="${PROJECT_ROOT}/logs"
LOG_FILE="${LOG_DIR}/environment_setup.log"
ENV_TEMPLATE="${PROJECT_ROOT}/.env.example"
TARGET_ENV="${PROJECT_ROOT}/.env.business"
MODE="prod"

mkdir -p "${LOG_DIR}"

log() {
  local message="$1"
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "${message}" | tee -a "${LOG_FILE}"
}

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--mode dev|prod] [--env-file <path>]

Options:
  --mode <mode>      Target environment profile (dev or prod). Default: prod.
  --env-file <path>  Output .env file path. Default: ${TARGET_ENV}
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
      TARGET_ENV="$2"
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

required_vars=(
  "SESSION_SECRET"
  "REDIS_URL"
  "BEA_API_KEY"
  "OECD_APP_ID"
  "PRODUCT_HUNT_TOKEN"
  "STACKEXCHANGE_KEY"
  "OPENALEX_BASE_URL"
  "WORLD_BANK_SOURCE"
)

optional_vars=(
  "FRED_API_KEY"
  "BLS_API_KEY"
  "GITHUB_TOKEN"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
)

ensure_template() {
  if [[ ! -f "${ENV_TEMPLATE}" ]]; then
    log "WARNING: ${ENV_TEMPLATE} not found. A fresh template will be generated."
    cat >"${ENV_TEMPLATE}" <<'TEMPLATE'
# Base environment template for WeReady
SESSION_SECRET=
REDIS_URL=
TEMPLATE
  fi
}

generate_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
  else
    python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
  fi
}

collect_value() {
  local var_name="$1"
  local default_value="$2"
  local value
  value="${!var_name:-}"  # Use exported variable if present
  if [[ -z "${value}" ]]; then
    case "${var_name}" in
      SESSION_SECRET)
        value=$(generate_secret)
        ;;
      REDIS_URL)
        value="redis://localhost:6379/0"
        ;;
      OPENALEX_BASE_URL)
        value="https://api.openalex.org"
        ;;
      WORLD_BANK_SOURCE)
        value="IC.BUS.NREG"
        ;;
      *)
        value="${default_value}"
        ;;
    esac
  fi
  printf '%s\n' "${value}"
}

write_env_file() {
  log "Writing environment configuration to ${TARGET_ENV}."
  {
    echo "# Generated $(date '+%Y-%m-%d %H:%M:%S')"
    echo "# Mode: ${MODE}"
    echo
    echo "# Core application"
    echo "SESSION_SECRET=$(collect_value SESSION_SECRET '')"
    echo "REDIS_URL=$(collect_value REDIS_URL '')"
    echo "BUSINESS_FORMATION_CACHE_TTL=7200"
    echo "INTERNATIONAL_MARKET_CACHE_TTL=21600"
    echo "TECH_TRENDS_CACHE_TTL=3600"
    echo "INTELLIGENCE_RATE_LIMIT_PER_MIN=60"
    echo
    echo "# External data sources"
    echo "BEA_API_KEY=$(collect_value BEA_API_KEY 'set-me')"
    echo "OECD_APP_ID=$(collect_value OECD_APP_ID 'set-me')"
    echo "PRODUCT_HUNT_TOKEN=$(collect_value PRODUCT_HUNT_TOKEN 'set-me')"
    echo "STACKEXCHANGE_KEY=$(collect_value STACKEXCHANGE_KEY 'set-me')"
    echo "OPENALEX_BASE_URL=$(collect_value OPENALEX_BASE_URL '')"
    echo "WORLD_BANK_SOURCE=$(collect_value WORLD_BANK_SOURCE '')"
    echo "FRED_API_KEY=$(collect_value FRED_API_KEY '')"
    echo "BLS_API_KEY=$(collect_value BLS_API_KEY '')"
    echo
    echo "# Frontend configuration"
    if [[ "${MODE}" == "dev" ]]; then
      echo "NEXTAUTH_URL=http://localhost:3000"
      echo "API_BASE_URL=http://127.0.0.1:8000"
      echo "FRONTEND_BASE_URL=http://localhost:3000"
    else
      echo "NEXTAUTH_URL=https://weready.dev"
      echo "API_BASE_URL=https://api.weready.dev"
      echo "FRONTEND_BASE_URL=https://weready.dev"
    fi
    echo "NEXTAUTH_SECRET=$(collect_value NEXTAUTH_SECRET '')"
    echo
    echo "# Monitoring"
    echo "BUSINESS_INTELLIGENCE_ALERT_THRESHOLD=3"
    echo "CACHE_MISS_ALERT_THRESHOLD=30"
    echo
    echo "# Optional tokens"
    for var in "${optional_vars[@]}"; do
      if [[ " ${required_vars[*]} " == *" ${var} "* ]]; then
        continue
      fi
      value=$(collect_value "${var}" '')
      [[ -n "${value}" ]] && echo "${var}=${value}" || echo "${var}="
    done
  } >"${TARGET_ENV}"
}

validate_env() {
  log "Validating required environment variables."
  local missing=()
  for var in "${required_vars[@]}"; do
    local value
    value=$(grep -E "^${var}=" "${TARGET_ENV}" | cut -d= -f2-)
    if [[ -z "${value}" || "${value}" == "set-me" ]]; then
      missing+=("${var}")
    fi
  done
  if (( ${#missing[@]} > 0 )); then
    log "WARNING: The following variables need values: ${missing[*]}"
  else
    log "All required variables populated."
  fi
}

main() {
  ensure_template
  write_env_file
  validate_env
  log "Environment setup complete. Review ${TARGET_ENV} before deployment."
}

main "$@"
