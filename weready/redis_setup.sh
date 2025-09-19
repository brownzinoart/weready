#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
CONFIG_DIR="${PROJECT_ROOT}/config"
DATA_DIR="${PROJECT_ROOT}/data/redis"
BACKUP_DIR="${PROJECT_ROOT}/backups/redis"
LOG_DIR="${PROJECT_ROOT}/logs"
LOG_FILE="${LOG_DIR}/redis_setup.log"
CONFIG_FILE="${CONFIG_DIR}/redis-business.conf"
MONITOR_FILE="${LOG_DIR}/redis_monitoring.json"
START_REDIS=true

mkdir -p "${CONFIG_DIR}" "${DATA_DIR}" "${BACKUP_DIR}" "${LOG_DIR}"

log() {
  local message="$1"
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "${message}" | tee -a "${LOG_FILE}"
}

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--config <path>] [--no-start]

Options:
  --config <path>  Custom redis configuration file path to generate/update.
  --no-start       Generate configuration but do not start or restart redis-server.
USAGE
  exit 1
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --config)
      CONFIG_FILE="$2"
      shift 2
      ;;
    --no-start)
      START_REDIS=false
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

ensure_redis_installed() {
  if ! command -v redis-server >/dev/null 2>&1; then
    log "ERROR: redis-server is not installed or not on PATH."
    exit 1
  fi
  if ! command -v redis-cli >/dev/null 2>&1; then
    log "ERROR: redis-cli is required for validation."
    exit 1
  fi
  log "redis-server $(redis-server --version) detected."
}

write_config() {
  log "Writing Redis configuration to ${CONFIG_FILE}."
  cat >"${CONFIG_FILE}" <<CONF
###############################################
# WeReady Business Pillar Redis Configuration #
###############################################

# Data directories
port 6379
bind 127.0.0.1
supervised no
dir ${DATA_DIR}

# Memory optimization tuned for analytics caching
maxmemory 512mb
maxmemory-policy allkeys-lru
maxmemory-samples 5

# Persistence settings: snapshot plus append-only
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

# Networking safeguards
tcp-keepalive 60
timeout 0

# Namespaces for Business Pillar caching
notify-keyspace-events Ex

# Logging
loglevel notice
logfile ${LOG_DIR}/redis-business.log

# Slowlog for troubleshooting
slowlog-log-slower-than 10000
slowlog-max-len 128

# Protect memory fragmentation
activedefrag yes

# Enforce keyspace hygiene
latency-monitor-threshold 100
CONF
}

restart_redis() {
  if [[ "${START_REDIS}" == false ]]; then
    log "Skipping redis-server restart per --no-start flag."
    return
  fi

  local existing
  existing=$(pgrep -x redis-server || true)
  if [[ -n "${existing}" ]]; then
    log "Stopping existing redis-server instances: ${existing}."
    pkill -x redis-server || true
    sleep 1
  fi

  log "Starting redis-server with ${CONFIG_FILE}."
  redis-server "${CONFIG_FILE}" >>"${LOG_FILE}" 2>&1 &
  sleep 1
}

seed_keys() {
  log "Seeding cache namespaces for Business Pillar data."
  redis-cli SETEX business_pillar:formation:software 7200 '{"momentum_score":72.4}' >/dev/null
  redis-cli SETEX business_pillar:international:us 7200 '{"opportunity_score":68.2}' >/dev/null
  redis-cli SETEX business_pillar:technology:ai 3600 '{"adoption_index":81.5}' >/dev/null
}

validate_connection() {
  log "Validating redis connectivity and cache hit ratios."
  local ping
  ping=$(redis-cli PING)
  if [[ "${ping}" != "PONG" ]]; then
    log "ERROR: redis-cli ping returned '${ping}'."
    exit 1
  fi

  redis-cli INFO stats >"${LOG_DIR}/redis_info.tmp"
  local hit_rate
  local hits
  local misses
  hits=$(grep -E '^keyspace_hits' "${LOG_DIR}/redis_info.tmp" | cut -d: -f2)
  misses=$(grep -E '^keyspace_misses' "${LOG_DIR}/redis_info.tmp" | cut -d: -f2)
  hits=${hits:-0}
  misses=${misses:-0}
  local total=$((hits + misses))
  if (( total == 0 )); then
    hit_rate=0
  else
    hit_rate=$((hits * 100 / total))
  fi
  log "Redis ping successful; current cache hit rate ${hit_rate}% (hits=${hits}, misses=${misses})."
  rm -f "${LOG_DIR}/redis_info.tmp"
}

export_monitoring_snapshot() {
  log "Capturing monitoring snapshot to ${MONITOR_FILE}."
  redis-cli --raw INFO memory | awk -F: 'NR>1 {gsub("\r","",$2); printf "\"%s\": \"%s\",\n", $1, $2}' | sed '$s/,$//' >"${MONITOR_FILE}.tmp"
  {
    echo '{'
    cat "${MONITOR_FILE}.tmp"
    echo "}"
  } >"${MONITOR_FILE}"
  rm -f "${MONITOR_FILE}.tmp"
}

create_backup() {
  local backup_file="${BACKUP_DIR}/redis-$(date '+%Y%m%d-%H%M%S').rdb"
  log "Generating Redis RDB backup at ${backup_file}."
  redis-cli --rdb "${backup_file}" >/dev/null
}

print_recovery_instructions() {
  cat <<'RECOVERY' | tee -a "${LOG_FILE}"
Recovery Instructions:
  1. Stop redis-server (pkill -x redis-server).
  2. Restore the desired RDB backup into ${DATA_DIR} (cp backups/redis/*.rdb ${DATA_DIR}/dump.rdb).
  3. Restart redis-server with redis_setup.sh (without --no-start).
  4. Run redis_cli --scan 'business_pillar:*' to validate cache hydration.
RECOVERY
}

main() {
  ensure_redis_installed
  write_config
  restart_redis
  seed_keys
  validate_connection
  export_monitoring_snapshot
  create_backup
  print_recovery_instructions
  log "Redis setup completed. Logs available at ${LOG_FILE}."
}

main "$@"
