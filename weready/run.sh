#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"
LOG_DIR="$SCRIPT_DIR/logs"

BACKEND_PORT="${BACKEND_PORT:-8000}"
EXPECTED_BACKEND_PORT=8000
FRONTEND_PORT="${FRONTEND_PORT:-3000}"
HEALTH_ENDPOINT="${HEALTH_ENDPOINT:-http://localhost:${BACKEND_PORT}/health}"
MAX_RESTARTS="${MAX_RESTARTS:-1}"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-45}"

backend_pid=""
frontend_pid=""
backend_restarts=0
frontend_restarts=0
shutting_down=0

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

log_warn() {
  log "WARN  $*"
}

log_error() {
  log "ERROR $*" >&2
}

ensure_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log_error "Required command '$1' not found. Please install it before running this script."
    exit 1
  fi
}

is_port_in_use() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1 && lsof -iTCP:"$port" -sTCP:LISTEN -Pn >/dev/null 2>&1; then
    return 0
  fi
  if command -v nc >/dev/null 2>&1 && nc -z localhost "$port" >/dev/null 2>&1; then
    return 0
  fi
  if command -v netstat >/dev/null 2>&1 && netstat -an | grep -E "[:.]${port}[[:space:]]" | grep LISTEN >/dev/null 2>&1; then
    return 0
  fi
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY' "$port"
import socket
import sys
port = int(sys.argv[1])
s = socket.socket()
s.settimeout(0.5)
try:
    s.connect(("127.0.0.1", port))
except Exception:
    sys.exit(1)
finally:
    s.close()
sys.exit(0)
PY
    local status=$?
    if [ "$status" -eq 0 ]; then
      return 0
    fi
  fi
  return 1
}

prepare_environment() {
  mkdir -p "$LOG_DIR"
  ensure_command python3
  ensure_command npm
  if ! command -v curl >/dev/null 2>&1; then
    log_warn "'curl' not found; falling back to Python for health checks."
  fi

  if [ ! -d "$BACKEND_DIR" ]; then
    log_error "Backend directory not found at $BACKEND_DIR"
    exit 1
  fi
  if [ ! -d "$FRONTEND_DIR" ]; then
    log_error "Frontend directory not found at $FRONTEND_DIR"
    exit 1
  fi

  if [ "$BACKEND_PORT" -ne "$EXPECTED_BACKEND_PORT" ]; then
    log_warn "BACKEND_PORT=$BACKEND_PORT differs from expected port $EXPECTED_BACKEND_PORT. Frontend expects the backend on $EXPECTED_BACKEND_PORT."
  fi

  if is_port_in_use "$BACKEND_PORT"; then
    log_error "Port $BACKEND_PORT is already in use. Set BACKEND_PORT to a free port or stop the conflicting service."
    exit 1
  fi

  if is_port_in_use "$FRONTEND_PORT"; then
    log_error "Port $FRONTEND_PORT is already in use. Set FRONTEND_PORT to a free port or stop the conflicting service."
    exit 1
  fi

  local venv_python="$BACKEND_DIR/venv/bin/python"
  if [ -x "$venv_python" ]; then
    export BACKEND_PYTHON="$venv_python"
  else
    log_warn "Python virtual environment not found at backend/venv. Using system python."
    export BACKEND_PYTHON="python3"
  fi
}

stop_process() {
  local name="$1"
  local pid="$2"
  if [ -n "$pid" ] && kill -0 "$pid" >/dev/null 2>&1; then
    log "Stopping $name (PID $pid)"
    kill "$pid" >/dev/null 2>&1 || true
    wait "$pid" >/dev/null 2>&1 || true
  fi
}

shutdown() {
  local exit_code=${1:-0}
  if [ "$shutting_down" -eq 1 ]; then
    exit "$exit_code"
  fi
  shutting_down=1
  log "Shutting down services..."
  stop_process "frontend" "$frontend_pid"
  stop_process "backend" "$backend_pid"
  exit "$exit_code"
}

trap 'shutdown 0' SIGINT SIGTERM

check_backend_health() {
  if command -v curl >/dev/null 2>&1; then
    curl --silent --show-error --fail --max-time 2 "$HEALTH_ENDPOINT" >/dev/null 2>&1
    return $?
  fi

  python3 - <<'PY' "$HEALTH_ENDPOINT"
import json
import sys
from urllib.request import urlopen
from urllib.error import URLError
url = sys.argv[1]
try:
    with urlopen(url, timeout=2) as response:
        response.read()
    sys.exit(0)
except URLError:
    sys.exit(1)
PY
}

wait_for_backend() {
  log "Waiting for backend health at $HEALTH_ENDPOINT"
  local start_ts="$(date +%s)"
  local attempts=0
  while [ "$attempts" -lt "$HEALTH_TIMEOUT" ]; do
    if check_backend_health; then
      local ready_ts="$(date +%s)"
      log "Backend healthy after $((ready_ts - start_ts))s"
      return 0
    fi
    attempts=$((attempts + 1))
    sleep 1
  done
  log_error "Backend did not become healthy within ${HEALTH_TIMEOUT}s"
  return 1
}

start_backend() {
  log "Starting backend on port $BACKEND_PORT"
  (cd "$BACKEND_DIR" && "$BACKEND_PYTHON" -m uvicorn app.main:app --reload --port "$BACKEND_PORT" --host 0.0.0.0) &
  backend_pid=$!
  sleep 1
  if ! kill -0 "$backend_pid" >/dev/null 2>&1; then
    log_error "Backend failed to start. Check logs for details."
    shutdown 1
  fi
  log "Backend PID $backend_pid"
}

start_frontend() {
  log "Starting frontend dev server on port $FRONTEND_PORT"
  (cd "$FRONTEND_DIR" && npm run dev -- --port "$FRONTEND_PORT") &
  frontend_pid=$!
  sleep 1
  if ! kill -0 "$frontend_pid" >/dev/null 2>&1; then
    log_error "Frontend failed to start."
    shutdown 1
  fi
  log "Frontend PID $frontend_pid"
}

main() {
  local script_start="$(date +%s)"
  prepare_environment

  log "Launching WeReady (backend port $BACKEND_PORT · frontend port $FRONTEND_PORT)"
  start_backend
  if ! wait_for_backend; then
    log_error "Backend failed health validation. See backend logs."
    shutdown 1
  fi

  start_frontend
  log "Services started in $(( $(date +%s) - script_start ))s"

  log "Monitoring services. Press Ctrl+C to stop."
  while [ "$shutting_down" -eq 0 ]; do
    sleep 3

    if [ -n "$backend_pid" ] && ! kill -0 "$backend_pid" >/dev/null 2>&1; then
      if [ "$backend_restarts" -lt "$MAX_RESTARTS" ]; then
        backend_restarts=$((backend_restarts + 1))
        log_warn "Backend exited unexpectedly. Restarting ($backend_restarts/$MAX_RESTARTS)..."
        start_backend
        wait_for_backend || log_warn "Backend restarted but health check failed."
      else
        log_error "Backend exceeded restart budget."
        shutdown 1
      fi
    fi

    if [ -n "$frontend_pid" ] && ! kill -0 "$frontend_pid" >/dev/null 2>&1; then
      if [ "$frontend_restarts" -lt "$MAX_RESTARTS" ]; then
        frontend_restarts=$((frontend_restarts + 1))
        log_warn "Frontend exited unexpectedly. Restarting ($frontend_restarts/$MAX_RESTARTS)..."
        start_frontend
      else
        log_error "Frontend exceeded restart budget."
        shutdown 1
      fi
    fi
  done
}

main "$@"
