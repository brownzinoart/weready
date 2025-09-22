"""Backend startup validation utilities for Bailey Intelligence services."""
from __future__ import annotations

import importlib
import json
import os
import platform
import socket
import sys
import time
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

try:
    import psutil  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    psutil = None

# Optional dependencies to report on if missing
OPTIONAL_DEPENDENCIES = (
    "psutil",
    "redis",
    "requests_cache",
)

# Core dependencies required for the backend runtime
REQUIRED_DEPENDENCIES = (
    "fastapi",
    "uvicorn",
    "httpx",
    "pydantic",
)

MANDATORY_ENV_VARS = (
    "SESSION_SECRET",
)

CONFIG_FILES = (
    Path("backend/requirements.txt"),
    Path("backend/app/main.py"),
)


@dataclass
class ValidationMessage:
    name: str
    status: str
    details: str
    metadata: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class StartupValidator:
    """Runs a battery of checks to confirm backend readiness."""

    def __init__(self, backend_port: int, hostname: str = "localhost") -> None:
        self.backend_port = backend_port
        self.hostname = hostname

    # --------------------------- public API ---------------------------
    def validate(self) -> Dict[str, Any]:
        checks = [
            self._check_python_version(),
            self._check_dependencies(REQUIRED_DEPENDENCIES, category="dependencies"),
            self._check_dependencies(OPTIONAL_DEPENDENCIES, category="optional_dependencies"),
            self._check_environment(),
            self._check_config_files(),
            self._check_port_availability(),
            self._check_memory_budget(),
            self._check_network_stack(),
            self._check_security_posture(),
            self._check_performance_baseline(),
        ]
        database_result = self._check_database_connectivity()
        if database_result:
            checks.append(database_result)

        external_api = self._check_external_api_tokens()
        if external_api:
            checks.append(external_api)

        overall_status = self._aggregate_status(msg.status for msg in checks if msg)
        timestamp = int(time.time())

        return {
            "status": overall_status,
            "timestamp": timestamp,
            "python": platform.python_version(),
            "platform": platform.platform(),
            "hostname": self.hostname,
            "checks": [msg.to_dict() for msg in checks if msg],
        }

    # ------------------------- check helpers -------------------------
    def _check_python_version(self) -> ValidationMessage:
        major, minor = sys.version_info[:2]
        minimum = (3, 9)
        status = "pass" if (major, minor) >= minimum else "warn"
        details = f"Running Python {platform.python_version()}"
        if status != "pass":
            details += f" (expected >= {minimum[0]}.{minimum[1]})"
        return ValidationMessage(
            name="python_version",
            status=status,
            details=details,
            metadata={"version_tuple": [major, minor]},
        )

    def _check_dependencies(self, modules: Iterable[str], category: str) -> ValidationMessage:
        missing: List[str] = []
        for module in modules:
            try:
                importlib.import_module(module)
            except Exception:  # pragma: no cover - defensive import
                missing.append(module)
        status = "pass" if not missing else ("warn" if category == "optional_dependencies" else "fail")
        return ValidationMessage(
            name=category,
            status=status,
            details="All modules import successfully" if not missing else f"Missing modules: {', '.join(missing)}",
            metadata={"missing": missing},
        )

    def _check_environment(self) -> ValidationMessage:
        missing = [var for var in MANDATORY_ENV_VARS if not os.getenv(var)]
        optional = {
            key: bool(os.getenv(key))
            for key in [
                "DATABASE_URL",
                "GITHUB_TOKEN",
                "OPENAI_API_KEY",
            ]
        }
        status = "pass" if not missing else "warn"
        return ValidationMessage(
            name="environment",
            status=status,
            details="All mandatory environment variables present"
            if status == "pass"
            else f"Missing mandatory variables: {', '.join(missing)}",
            metadata={"optional": optional},
        )

    def _check_config_files(self) -> ValidationMessage:
        missing = [str(path) for path in CONFIG_FILES if not path.exists()]
        status = "pass" if not missing else "fail"
        return ValidationMessage(
            name="config_files",
            status=status,
            details="All configuration files located" if status == "pass" else f"Missing files: {', '.join(missing)}",
            metadata={"checked": [str(path) for path in CONFIG_FILES]},
        )

    def _check_port_availability(self) -> ValidationMessage:
        is_listening, error = self._is_port_listening()
        status = "pass" if is_listening else "fail"
        details = (
            f"Backend is listening on {self.hostname}:{self.backend_port}"
            if status == "pass"
            else f"Unable to connect to {self.hostname}:{self.backend_port}: {error or 'port closed'}"
        )
        return ValidationMessage(
            name="port",
            status=status,
            details=details,
            metadata={"host": self.hostname, "port": self.backend_port},
        )

    def _check_memory_budget(self) -> ValidationMessage:
        if not psutil:
            return ValidationMessage(
                name="memory",
                status="warn",
                details="psutil not available; memory metrics unavailable",
                metadata={},
            )
        vmem = psutil.virtual_memory()
        status = "pass" if vmem.available > 200 * 1024 * 1024 else "warn"
        return ValidationMessage(
            name="memory",
            status=status,
            details=f"Available memory: {vmem.available // (1024 * 1024)} MB",
            metadata={"total": vmem.total, "available": vmem.available, "percent": vmem.percent},
        )

    def _check_network_stack(self) -> ValidationMessage:
        diagnostics: Dict[str, Any] = {}
        status = "pass"
        try:
            diagnostics["localhost"] = socket.gethostbyname("localhost")
        except socket.error as exc:  # pragma: no cover - defensive path
            diagnostics["localhost_error"] = str(exc)
            status = "fail"
        try:
            diagnostics["loopback_interfaces"] = list(self._iter_loopback_interfaces())
        except Exception as exc:  # pragma: no cover - defensive path
            diagnostics["loopback_error"] = str(exc)
            status = "warn"
        return ValidationMessage(
            name="network",
            status=status,
            details="Loopback network stack resolved" if status == "pass" else "Network diagnostics available",
            metadata=diagnostics,
        )

    def _check_security_posture(self) -> ValidationMessage:
        secret = os.getenv("SESSION_SECRET")
        status = "pass"
        details = "Session secret configured"
        if not secret:
            status = "warn"
            details = "SESSION_SECRET not configured; using development default"
        elif len(secret) < 16:
            status = "warn"
            details = "SESSION_SECRET is shorter than 16 characters"
        return ValidationMessage(
            name="security",
            status=status,
            details=details,
            metadata={"has_secret": bool(secret), "length": len(secret or "")},
        )

    def _check_performance_baseline(self) -> ValidationMessage:
        cpu_count = os.cpu_count() or 1
        load_avg: Optional[List[float]] = None
        if hasattr(os, "getloadavg"):
            try:
                load_avg = list(os.getloadavg())
            except OSError:  # pragma: no cover - not supported on Windows
                load_avg = None
        status = "pass"
        details = f"CPU cores detected: {cpu_count}"
        metadata: Dict[str, Any] = {"cpu_count": cpu_count}
        if load_avg:
            metadata["load_average"] = load_avg
            if load_avg[0] > cpu_count * 2:
                status = "warn"
                details = f"High system load (1m avg={load_avg[0]:.2f})"
        return ValidationMessage(
            name="performance",
            status=status,
            details=details,
            metadata=metadata,
        )

    def _check_database_connectivity(self) -> Optional[ValidationMessage]:
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            return None
        status = "pass"
        details = "DATABASE_URL configured"
        metadata: Dict[str, Any] = {"driver": database_url.split(":", 1)[0]}
        if database_url.startswith("sqlite"):
            db_path = database_url.split("///")[-1]
            metadata["path"] = db_path
            if not Path(db_path).exists():
                status = "warn"
                details = "SQLite database file not found"
        else:
            status = "warn"
            details = "Non-SQLite databases not actively validated"
        return ValidationMessage(
            name="database",
            status=status,
            details=details,
            metadata=metadata,
        )

    def _check_external_api_tokens(self) -> Optional[ValidationMessage]:
        tokens = {
            "github": bool(os.getenv("GITHUB_TOKEN")),
            "openai": bool(os.getenv("OPENAI_API_KEY")),
            "anthropic": bool(os.getenv("ANTHROPIC_API_KEY")),
        }
        if not any(tokens.values()):
            return None
        status = "pass" if all(tokens.values()) else "warn"
        missing = [name for name, present in tokens.items() if not present]
        details = "All external API tokens configured" if not missing else f"Missing tokens: {', '.join(missing)}"
        return ValidationMessage(
            name="external_apis",
            status=status,
            details=details,
            metadata=tokens,
        )

    # ------------------------- utility helpers -----------------------
    def _aggregate_status(self, statuses: Iterable[str]) -> str:
        worst = "pass"
        for status in statuses:
            if status == "fail":
                return "fail"
            if status == "warn" and worst != "fail":
                worst = "warn"
        return worst

    def _is_port_listening(self) -> Tuple[bool, Optional[str]]:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(0.5)
            try:
                result = sock.connect_ex((self.hostname, self.backend_port))
                if result == 0:
                    return True, None
                return False, os.strerror(result)
            except OSError as exc:  # pragma: no cover - defensive path
                return False, str(exc)

    def _iter_loopback_interfaces(self) -> Iterable[str]:
        if psutil and hasattr(psutil, "net_if_addrs"):
            for name, addresses in psutil.net_if_addrs().items():  # pragma: no cover - system dependent
                if name.lower().startswith("lo"):
                    for addr in addresses:
                        yield f"{name}:{addr.address}"
        else:
            yield "lo0"


def run_startup_validation(backend_port: int) -> Dict[str, Any]:
    validator = StartupValidator(backend_port=backend_port)
    return validator.validate()


if __name__ == "__main__":  # pragma: no cover - manual execution helper
    port = int(os.getenv("BACKEND_PORT", "8000"))
    results = run_startup_validation(port)
    print(json.dumps(results, indent=2))
    sys.exit(0 if results.get("status") != "fail" else 1)
