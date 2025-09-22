#!/usr/bin/env python3
"""Comprehensive WeReady backend health validator.

This script validates that the FastAPI backend is reachable on the expected port,
checks critical API endpoints, inspects configuration alignment with the frontend,
performs lightweight dependency checks, and emits a human-readable or JSON report.
"""

from __future__ import annotations

import argparse
import json
import os
import socket
import sys
import time
from dataclasses import dataclass, asdict
from typing import Any, Dict, Iterable, List, Optional, Tuple
from urllib.error import URLError, HTTPError
from urllib.request import Request, urlopen

DEFAULT_HOST = os.environ.get("BACKEND_HOST", "localhost")
DEFAULT_PORT = int(os.environ.get("BACKEND_PORT", "8000"))
EXPECTED_PORT = 8000
DEFAULT_TIMEOUT = 5.0

@dataclass
class CheckResult:
    name: str
    passed: bool
    detail: str
    duration: Optional[float] = None
    payload: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        if self.duration is not None:
            data["duration_ms"] = round(self.duration * 1000, 2)
        return data


def format_duration(duration: Optional[float]) -> str:
    if duration is None:
        return "—"
    if duration >= 1:
        return f"{duration:.2f}s"
    return f"{duration * 1000:.0f}ms"


def check_port(host: str, port: int, timeout: float) -> CheckResult:
    start = time.perf_counter()
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(timeout)
    try:
        sock.connect((host, port))
        detail = f"Port {port} is accepting TCP connections"
        return CheckResult("port-listen", True, detail, time.perf_counter() - start)
    except OSError as exc:
        return CheckResult(
            "port-listen",
            False,
            f"Unable to connect to {host}:{port} ({exc})",
            time.perf_counter() - start,
        )
    finally:
        sock.close()


def http_get(url: str, timeout: float) -> Tuple[int, bytes, Dict[str, str], float]:
    req = Request(url, headers={"Accept": "application/json"})
    start = time.perf_counter()
    with urlopen(req, timeout=timeout) as response:  # nosec - url comes from local config
        body = response.read()
        headers = {key.lower(): value for key, value in response.getheaders()}
        status = response.getcode()
    return status, body, headers, time.perf_counter() - start


def check_endpoint(base_url: str, endpoint: str, timeout: float) -> CheckResult:
    url = f"{base_url}{endpoint}"
    try:
        status, body, headers, duration = http_get(url, timeout)
        if 200 <= status < 300:
            detail = f"{endpoint} responded {status} in {format_duration(duration)}"
            payload: Optional[Dict[str, Any]] = None
            if body:
                try:
                    payload = json.loads(body.decode("utf-8"))
                except json.JSONDecodeError:
                    detail += " (non-JSON payload)"
            return CheckResult(endpoint, True, detail, duration, payload)
        detail = f"{endpoint} returned HTTP {status}"
        return CheckResult(endpoint, False, detail, duration)
    except HTTPError as exc:  # pragma: no cover - handled at runtime
        return CheckResult(endpoint, False, f"{endpoint} returned HTTP {exc.code}", None)
    except URLError as exc:
        return CheckResult(endpoint, False, f"{endpoint} unreachable ({exc.reason})", None)
    except Exception as exc:  # pragma: no cover - safety net
        return CheckResult(endpoint, False, f"{endpoint} failed ({exc})", None)


def evaluate_configuration(health_payload: Dict[str, Any]) -> List[CheckResult]:
    results: List[CheckResult] = []
    config = health_payload.get("configuration_validation") if isinstance(health_payload, dict) else None
    if config:
        matches = config.get("matches_frontend")
        detail = "Frontend and backend ports aligned" if matches else "Port mismatch detected"
        results.append(
            CheckResult("config-alignment", bool(matches), detail, payload=config)
        )
        detected = config.get("frontend_expected_port")
        if detected and detected != EXPECTED_PORT:
            results.append(
                CheckResult(
                    "config-frontend-port",
                    False,
                    f"Frontend expects port {detected}; expected {EXPECTED_PORT}",
                )
            )
    else:
        results.append(
            CheckResult("config-alignment", False, "Health payload missing configuration_validation")
        )
    return results


def evaluate_dependencies(health_payload: Dict[str, Any]) -> List[CheckResult]:
    results: List[CheckResult] = []
    deps = health_payload.get("dependency_health") if isinstance(health_payload, dict) else None
    if not deps:
        return results
    for name, info in deps.items():
        status = str(info.get("status", "unknown")).lower()
        passed = status in {"healthy", "ok", "active"}
        detail = f"{name} status: {status}"
        if status == "degraded":
            detail += f" (info: {info})"
        results.append(CheckResult(f"dependency:{name}", passed, detail, payload=info))
    return results


def check_database_connectivity(database_url: Optional[str], timeout: float) -> CheckResult:
    if not database_url:
        return CheckResult("database", True, "DATABASE_URL not set; skipping connectivity check")

    try:
        scheme, rest = database_url.split("://", 1)
    except ValueError:
        return CheckResult("database", False, "DATABASE_URL is malformed")

    host_port = rest.split("@")[-1].split("/")[0]
    if ":" in host_port:
        host, port_str = host_port.split(":", 1)
        try:
            port = int(port_str)
        except ValueError:
            port = 5432
    else:
        host, port = host_port, 5432

    start = time.perf_counter()
    try:
        sock = socket.create_connection((host, port), timeout=timeout)
        sock.close()
        return CheckResult("database", True, f"Database socket reachable at {host}:{port}", time.perf_counter() - start)
    except OSError as exc:
        return CheckResult("database", False, f"Cannot reach database at {host}:{port} ({exc})", time.perf_counter() - start)


def build_report(results: Iterable[CheckResult], as_json: bool) -> int:
    results = list(results)
    if as_json:
        output = {
            "checks": [result.to_dict() for result in results],
            "summary": {
                "passed": sum(1 for r in results if r.passed),
                "failed": sum(1 for r in results if not r.passed),
            },
        }
        json.dump(output, sys.stdout, indent=2)
        sys.stdout.write("\n")
    else:
        header = f"{'STATUS':<8} {'CHECK':<28} {'DETAIL'}"
        print(header)
        print("-" * len(header))
        for result in results:
            status = "PASS" if result.passed else "FAIL"
            detail = result.detail
            if result.duration is not None:
                detail = f"{detail} ({format_duration(result.duration)})"
            print(f"{status:<8} {result.name:<28} {detail}")

        passed = sum(1 for r in results if r.passed)
        failed = sum(1 for r in results if not r.passed)
        print("\nSummary: %s passed · %s failed" % (passed, failed))
    return 0 if all(r.passed for r in results) else 1


def run_checks(host: str, port: int, timeout: float) -> List[CheckResult]:
    base_url = f"http://{host}:{port}"
    results: List[CheckResult] = []

    results.append(check_port(host, port, timeout))

    endpoints = ["/health", "/github/trending-intelligence", "/github/repository-analysis?repo_url=https://github.com/openai/whisper"]
    health_payload: Optional[Dict[str, Any]] = None

    for endpoint in endpoints:
        result = check_endpoint(base_url, endpoint, timeout)
        results.append(result)
        if endpoint == "/health" and result.passed and isinstance(result.payload, dict):
            health_payload = result.payload

    if health_payload:
        results.extend(evaluate_configuration(health_payload))
        results.extend(evaluate_dependencies(health_payload))
        rate_info = health_payload.get("rate_limiting", {}).get("github")
        if rate_info:
            remaining = rate_info.get("remaining")
            detail = f"GitHub rate limit remaining: {remaining}" if remaining is not None else "GitHub rate limit unavailable"
            results.append(CheckResult("github-rate-limit", remaining is None or remaining > 0, detail, payload=rate_info))
    else:
        results.append(CheckResult("health-payload", False, "Unable to parse /health payload"))

    database_url = os.environ.get("DATABASE_URL")
    results.append(check_database_connectivity(database_url, timeout))

    if port != EXPECTED_PORT:
        results.append(
            CheckResult(
                "expected-port",
                False,
                f"Backend running on port {port}, expected {EXPECTED_PORT}",
            )
        )

    return results


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate WeReady backend health and configuration")
    parser.add_argument("--host", default=DEFAULT_HOST, help="Backend host (default: %(default)s)")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Backend port (default: %(default)s)")
    parser.add_argument("--timeout", type=float, default=DEFAULT_TIMEOUT, help="Request timeout in seconds")
    parser.add_argument("--json", action="store_true", help="Emit JSON instead of table output")
    return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)
    try:
        results = run_checks(args.host, args.port, args.timeout)
    except KeyboardInterrupt:  # pragma: no cover
        print("\nInterrupted", file=sys.stderr)
        return 130
    return build_report(results, args.json)


if __name__ == "__main__":
    sys.exit(main())
