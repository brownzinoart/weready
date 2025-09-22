#!/usr/bin/env bash
# Quick diagnostics and remediation guidance for the Bailey Intelligence loading pipeline.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PORT="${BACKEND_PORT:-8000}"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend"
HEALTH_URL="${HEALTH_URL:-http://localhost:${BACKEND_PORT}/health}"
CURL_BIN="$(command -v curl || true)"
PYTHON_BIN="${PYTHON_BIN:-$(command -v python3 || command -v python || true)}"
RESULTS_FILE=""

print_section() {
  printf '\n%s\n' "============================================================"
  printf '%s\n' "[Bailey Intelligence] $1"
  printf '%s\n' "============================================================"
}

print_sub() {
  printf '\n-- %s --\n' "$1"
}

record_result() {
  local status="$1"
  local message="$2"
  printf '%-9s %s\n' "$status" "$message"
  if [[ -n "$RESULTS_FILE" ]]; then
    printf '%s %s\n' "$status" "$message" >>"$RESULTS_FILE"
  fi
}

check_command() {
  local name="$1"
  local bin="$2"
  if [[ -z "$bin" ]]; then
    record_result "[WARN]" "Required tool '$name' not found in PATH"
    return 1
  fi
  return 0
}

check_backend_process() {
  print_section "Backend Process & Port Availability"
  local listening
  if command -v lsof >/dev/null 2>&1; then
    listening=$(lsof -nPiTCP:"$BACKEND_PORT" -sTCP:LISTEN || true)
  else
    listening=""
  fi

  if [[ -n "$listening" ]]; then
    printf '%s\n' "$listening"
    record_result "[PASS]" "Port $BACKEND_PORT is listening"
  else
    record_result "[WARN]" "No listener detected on port $BACKEND_PORT"
    if command -v pgrep >/dev/null 2>&1; then
      local uvicorn
      uvicorn=$(pgrep -fl "uvicorn.*${BACKEND_PORT}" || true)
      if [[ -n "$uvicorn" ]]; then
        printf 'Potential uvicorn process:\n%s\n' "$uvicorn"
      else
        record_result "[INFO]" "No uvicorn process found. Run ./run.sh to start services."
      fi
    fi
  fi
}

check_health_endpoint() {
  print_section "Health Endpoint Probe"
  if ! check_command "curl" "$CURL_BIN"; then
    record_result "[FAIL]" "Cannot test health endpoint without curl."
    return
  fi

  local response
  local headers
  local tmp_body
  tmp_body="$(mktemp)"
  headers=$($CURL_BIN -s -D - -o "$tmp_body" --max-time 10 "$HEALTH_URL" || true)
  response=$(cat "$tmp_body")
  rm -f "$tmp_body"

  if [[ -z "$response" ]]; then
    record_result "[FAIL]" "No response from $HEALTH_URL"
    return
  fi

  printf 'Response headers:\n%s\n' "$headers"
  printf 'Payload preview:\n%s\n' "$(echo "$response" | head -c 400)"

  if echo "$headers" | grep -qi "HTTP/1.1 200"; then
    record_result "[PASS]" "Health endpoint responded with HTTP 200"
  else
    record_result "[WARN]" "Health endpoint returned non-200 status"
  fi

  if echo "$headers" | grep -qi "Access-Control-Allow-Origin"; then
    record_result "[PASS]" "CORS headers present"
  else
    record_result "[WARN]" "CORS headers missing on health response"
  fi
}

run_python_debugger() {
  print_section "Python Health Debugger"
  if ! check_command "python" "$PYTHON_BIN"; then
    record_result "[WARN]" "Python interpreter not found; skipping backend diagnostics script"
    return
  fi

  if [[ ! -f "$BACKEND_DIR/debug_health_endpoint.py" ]]; then
    record_result "[WARN]" "Backend debug script not found"
    return
  fi

  "$PYTHON_BIN" "$BACKEND_DIR/debug_health_endpoint.py" --url "$HEALTH_URL" --timeout 5 --startup-validation --json || record_result "[WARN]" "Python diagnostics reported issues"
}

check_python_dependencies() {
  print_section "Backend Dependency Import Check"
  if ! check_command "python" "$PYTHON_BIN"; then
    record_result "[WARN]" "Python interpreter not found"
    return
  fi

  "$PYTHON_BIN" - <<'PY' || exit 0
import importlib
modules = [
    "fastapi",
    "uvicorn",
    "httpx",
    "psutil",
    "redis",
]
missing = []
for module in modules:
    try:
        importlib.import_module(module)
    except Exception as exc:  # pragma: no cover - runtime diagnostics
        missing.append(f"{module}: {exc}")

if missing:
    print("[WARN] Missing Python modules detected:")
    for item in missing:
        print(f"  - {item}")
else:
    print("[PASS] Core Python modules imported successfully")
PY
}

check_environment() {
  print_section "Environment Variables"
  local vars=("BACKEND_PORT" "SESSION_SECRET" "NEXT_PUBLIC_BACKEND_PORT" "NEXT_PUBLIC_API_FALLBACK_URL")
  for var in "${vars[@]}"; do
    if [[ -n "${!var:-}" ]]; then
      record_result "[PASS]" "$var is set"
    else
      record_result "[WARN]" "$var is not set"
    fi
  done
}

inspect_logs() {
  print_section "Recent Backend Logs"
  local log_file="$PROJECT_ROOT/logs/backend.log"
  if [[ -f "$log_file" ]]; then
    tail -n 40 "$log_file"
    record_result "[INFO]" "Displayed tail of backend.log"
  else
    record_result "[WARN]" "No backend log file found at $log_file"
  fi
}

check_frontend_assets() {
  print_section "Frontend Build Indicators"
  if [[ -d "$FRONTEND_DIR/.next" ]]; then
    record_result "[PASS]" "Next.js build artifacts detected (.next directory)"
  else
    record_result "[WARN]" "Next.js build output not found. Run 'npm run dev' or 'npm run build' inside frontend/."
  fi
}

network_diagnostics() {
  print_section "Local Network Diagnostics"
  if ! check_command "python" "$PYTHON_BIN"; then
    record_result "[WARN]" "Python interpreter not found"
    return
  fi

  "$PYTHON_BIN" - <<'PY'
import socket
host = "localhost"
port = int("${BACKEND_PORT}")
try:
    with socket.create_connection((host, port), timeout=2) as conn:
        print(f"[PASS] Able to open TCP connection to {host}:{port}")
except Exception as exc:
    print(f"[WARN] Could not connect to {host}:{port}: {exc}")
PY
}

print_recommendations() {
  print_section "Recommended Next Actions"
  cat <<'EOF'
1. Restart services with ./run.sh if the backend is not listening on the expected port.
2. Inspect backend/debug_health_endpoint.py output above for detailed failure causes (rate limits, dependency gaps).
3. Verify CORS by ensuring HEALTH_CHECK_ALLOWED_ORIGIN aligns with the frontend origin when running locally.
4. Rebuild the frontend (npm install && npm run dev) if .next assets are missing or stale.
5. If dependencies are missing, create/activate the virtualenv and install backend/requirements.txt.
6. When network checks fail, confirm VPN/firewall settings or adjust BACKEND_PORT to an available port.
EOF
}

main() {
  if [[ "${1:-}" == "--capture" ]]; then
    RESULTS_FILE="${2:-$(mktemp)}"
    : >"$RESULTS_FILE"
    shift 2 || true
  fi

  check_backend_process
  check_health_endpoint
  run_python_debugger
  check_python_dependencies
  check_environment
  inspect_logs
  check_frontend_assets
  network_diagnostics
  print_recommendations

  if [[ -n "$RESULTS_FILE" ]]; then
    print_section "Summary"
    cat "$RESULTS_FILE"
  fi
}

main "$@"
