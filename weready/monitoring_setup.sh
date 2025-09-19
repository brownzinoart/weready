#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
MONITOR_DIR="${PROJECT_ROOT}/monitoring"
ALERT_DIR="${MONITOR_DIR}/alerts"
LOG_DIR="${PROJECT_ROOT}/logs"
LOG_FILE="${LOG_DIR}/monitoring_setup.log"
HEALTH_JSON="${MONITOR_DIR}/health_baseline.json"
API_JSON="${MONITOR_DIR}/api_baseline.json"
REDIS_STATS_FILE="${MONITOR_DIR}/redis_metrics.json"

mkdir -p "${MONITOR_DIR}" "${ALERT_DIR}" "${LOG_DIR}"

log() {
  local message="$1"
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "${message}" | tee -a "${LOG_FILE}"
}

run_health_checks() {
  log "Capturing baseline external data source health."
  python3 "${PROJECT_ROOT}/backend/health_check.py" --json --skip-api >"${HEALTH_JSON}" || {
    log "WARNING: health_check.py execution failed; inspect backend configuration."
  }
}

run_api_validation() {
  log "Capturing baseline API response metrics."
  python3 "${PROJECT_ROOT}/backend/validate_apis.py" --json >"${API_JSON}" || {
    log "WARNING: validate_apis.py execution failed; ensure FastAPI service is running."
  }
}

collect_redis_metrics() {
  if ! command -v redis-cli >/dev/null 2>&1; then
    log "INFO: redis-cli not available; skipping Redis metrics snapshot."
    return
  fi
  log "Collecting Redis metrics for monitoring baseline."
  redis-cli --raw INFO stats | awk -F: 'NR>1 {gsub("\r","",$2); printf "\"%s\": \"%s\",\n", $1, $2}' | sed '$s/,$//' >"${REDIS_STATS_FILE}.tmp"
  {
    echo '{'
    cat "${REDIS_STATS_FILE}.tmp"
    echo "}"
  } >"${REDIS_STATS_FILE}" || true
  rm -f "${REDIS_STATS_FILE}.tmp"
}

generate_monitoring_blueprint() {
  local blueprint="${MONITOR_DIR}/business_pillar_monitoring.yml"
  log "Writing monitoring blueprint to ${blueprint}."
  cat >"${blueprint}" <<'YML'
# Business Pillar Monitoring Blueprint
checks:
  - name: external-data-health
    description: Verify upstream data sources remain reachable
    command: "python backend/health_check.py --json"
    schedule: "*/30 * * * *"
    thresholds:
      fail_on: "summary.fail > 0"
      warn_on: "summary.warn > 2"
  - name: business-api-latency
    description: Measure API latency and schema validity
    command: "python backend/validate_apis.py --json"
    schedule: "*/15 * * * *"
    thresholds:
      fail_on: "summary.fail > 0"
      warn_on: "summary.avg_latency_ms > 900"
  - name: redis-hit-rate
    description: Track cache efficiency for business_intelligence namespaces
    command: "redis-cli INFO stats"
    schedule: "*/5 * * * *"
    parser: "hit_rate = keyspace_hits / max(keyspace_hits + keyspace_misses, 1)"
    thresholds:
      fail_on: "hit_rate < 0.4"
      warn_on: "hit_rate < 0.7"

notifications:
  - channel: pagerduty
    trigger_on: fail
  - channel: slack
    trigger_on: warn
    template: "Business Pillar alert: {{check}} status={{status}} details={{details}}"

logging:
  dir: logs/business_pillar
  rotation: weekly
  retention_days: 30
YML
}

generate_alert_rules() {
  local alert_file="${ALERT_DIR}/business_pillar.rules.yml"
  log "Generating example alert rules at ${alert_file}."
  cat >"${alert_file}" <<'RULES'
# Prometheus-style alert rules for Business Pillar
apiLatencySLO:
  expr: avg_over_time(business_pillar_api_latency_ms[5m]) > 1200
  for: 10m
  labels:
    severity: warning
  annotations:
    summary: "Business Pillar API latency above SLO"
    description: "Average latency {{ $value }}ms exceeds 1.2s for the last 10 minutes."

cacheMissSpike:
  expr: increase(business_pillar_cache_miss_total[5m]) > 150
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Cache miss spike detected"
    description: "Redis cache misses exceeded 150 over 5 minutes. Investigate redis_setup.sh"

sourceOutage:
  expr: business_pillar_source_health{status="fail"} == 1
  for: 15m
  labels:
    severity: critical
  annotations:
    summary: "External data source outage"
    description: "{{ $labels.source }} has been failing for 15 minutes."
RULES
}

write_dashboard_stub() {
  local dashboard="${MONITOR_DIR}/dashboard_business_pillar.json"
  log "Creating dashboard stub at ${dashboard}."
  cat >"${dashboard}" <<'JSON'
{
  "title": "Business Pillar Intelligence",
  "widgets": [
    {"type": "stat", "title": "API P95 Latency", "query": "histogram_quantile(0.95, sum(rate(business_pillar_api_latency_ms_bucket[5m])) by (le))"},
    {"type": "stat", "title": "Redis Hit Rate", "query": "1 - (increase(business_pillar_cache_miss_total[5m]) / max(increase(business_pillar_cache_total[5m]), 1))"},
    {"type": "table", "title": "External Source Status", "query": "business_pillar_source_health"},
    {"type": "timeseries", "title": "Formation Momentum Score", "query": "business_pillar_business_momentum"}
  ]
}
JSON
}

main() {
  run_health_checks
  run_api_validation
  collect_redis_metrics
  generate_monitoring_blueprint
  generate_alert_rules
  write_dashboard_stub
  log "Monitoring assets generated in ${MONITOR_DIR}."
}

main "$@"
