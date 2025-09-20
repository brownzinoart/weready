#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
VENV_PATH="${PROJECT_ROOT}/backend/venv"
REQUIREMENTS_FILE="${PROJECT_ROOT}/backend/requirements.txt"
LOG_DIR="${PROJECT_ROOT}/logs"
LOG_FILE="${LOG_DIR}/install_dependencies.log"

mkdir -p "${LOG_DIR}"

log() {
  local message="$1"
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "${message}" | tee -a "${LOG_FILE}"
}

handle_error() {
  local exit_code=$?
  log "ERROR: Dependency installation failed with exit code ${exit_code}. Check ${LOG_FILE} for details."
  log "TIP: Run 'pip check' and inspect conflicting packages if the issue persists."
  exit ${exit_code}
}

trap handle_error ERR

ensure_python() {
  if command -v python3 >/dev/null 2>&1; then
    PYTHON_BIN="python3"
  elif command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
  else
    log "ERROR: Python 3 is required but was not found on PATH."
    exit 1
  fi
}

create_or_activate_venv() {
  if [[ ! -d "${VENV_PATH}" ]]; then
    log "Virtual environment not found. Creating at ${VENV_PATH}."
    "${PYTHON_BIN}" -m venv "${VENV_PATH}"
  fi

  # shellcheck disable=SC1090
  source "${VENV_PATH}/bin/activate"
  log "Activated virtual environment at ${VENV_PATH}."
}

upgrade_pip() {
  log "Upgrading pip and tooling."
  python -m pip install --upgrade pip setuptools wheel >/tmp/pip-upgrade.log 2>&1 || {
    log "WARNING: pip upgrade emitted warnings. Review /tmp/pip-upgrade.log if builds fail."
  }
}

install_requirements() {
  if [[ ! -f "${REQUIREMENTS_FILE}" ]]; then
    log "ERROR: requirements file not found at ${REQUIREMENTS_FILE}."
    exit 1
  fi

  log "Installing dependencies from ${REQUIREMENTS_FILE}."
  python -m pip install -r "${REQUIREMENTS_FILE}" | tee -a "${LOG_FILE}"
}

resolve_conflicts() {
  log "Running pip check for dependency conflicts."
  if ! python -m pip check >>"${LOG_FILE}" 2>&1; then
    log "WARNING: pip reported dependency conflicts. Review ${LOG_FILE} for the dependency graph."
  else
    log "No dependency conflicts detected."
  fi
}

verify_modules() {
  log "Verifying critical Business Pillar dependencies."
  python - <<'PY'
import importlib
import sys

required = {
    "pydantic": "2.0.0",
    "requests_cache": "1.0.0",
    "pandas": "2.0.0",
    "xmltodict": "0.13.0",
    "dateutil": "2.8.0",
    "redis": "4.5.0",
    "backoff": "2.2.0",
}

missing = []
for module_name, minimum in required.items():
    try:
        module = importlib.import_module(module_name)
    except ImportError:
        missing.append(module_name)
        continue
    version = getattr(module, "__version__", getattr(module, "VERSION", "0"))
    if version and tuple(int(part) for part in version.split(".")[:2] if part.isdigit()) < tuple(int(part) for part in minimum.split(".")[:2]):
        print(f"WARNING: {module_name} version {version} is below recommended {minimum}.")

if missing:
    print("ERROR: Missing modules detected: " + ", ".join(missing))
    sys.exit(1)
PY
}

ensure_redis_running() {
  local redis_url
  redis_url="${REDIS_URL:-redis://localhost:6379/0}"
  local redis_cli

  if command -v redis-cli >/dev/null 2>&1; then
    redis_cli="redis-cli"
  else
    redis_cli=""
  fi

  if [[ -n "${redis_cli}" ]]; then
    if ! pgrep -x redis-server >/dev/null 2>&1; then
      log "Redis server not detected. Attempting to start redis-server in the background."
      if command -v redis-server >/dev/null 2>&1; then
        redis-server --daemonize yes >>"${LOG_FILE}" 2>&1 || log "WARNING: Unable to start redis-server automatically. Ensure Redis is running manually."
      else
        log "WARNING: redis-server binary not found on PATH. Skipping automatic start."
      fi
    fi
  else
    log "redis-cli not available; relying on Python client check."
  fi

  log "Validating Redis connectivity at ${redis_url}."
  python - <<'PY'
import os
import sys
from urllib.parse import urlparse

try:
    from redis import asyncio as aioredis
except ImportError:
    print("ERROR: redis package is required for connectivity checks.")
    sys.exit(1)

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

async def main():
    client = aioredis.from_url(redis_url)
    try:
        pong = await client.ping()
        if pong is True:
            print(f"Redis connectivity verified at {redis_url}.")
    finally:
        await client.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
PY
}

summarize() {
  log "Dependency installation complete. Log available at ${LOG_FILE}."
}

main() {
  ensure_python
  create_or_activate_venv
  upgrade_pip
  install_requirements
  resolve_conflicts
  verify_modules
  ensure_redis_running
  summarize
}

main "$@"
