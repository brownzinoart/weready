#!/usr/bin/env python3
"""Standalone diagnostics for the Bailey Intelligence health endpoint."""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import socket
import sys
import time
from dataclasses import asdict, dataclass
from typing import Any, Dict, Optional
from urllib.parse import urlparse

import httpx

# Ensure local backend modules resolve when executed directly
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

try:
    from startup_validator import run_startup_validation
except Exception:  # pragma: no cover - fallback when imports fail
    run_startup_validation = None  # type: ignore


@dataclass
class HealthCheckOutcome:
    ok: bool
    status_code: Optional[int]
    latency_ms: float
    error: Optional[str]
    payload: Optional[Dict[str, Any]]
    headers: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


def _check_port(host: str, port: int, timeout: float) -> Dict[str, Any]:
    diagnostics: Dict[str, Any] = {"host": host, "port": port}
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(timeout)
        start = time.perf_counter()
        try:
            result = sock.connect_ex((host, port))
            diagnostics["latency_ms"] = round((time.perf_counter() - start) * 1000, 2)
            diagnostics["connect_result"] = result
            diagnostics["reachable"] = result == 0
            if result != 0:
                diagnostics["error"] = os.strerror(result)
        except OSError as exc:  # pragma: no cover - defensive path
            diagnostics["reachable"] = False
            diagnostics["error"] = str(exc)
            diagnostics["latency_ms"] = round((time.perf_counter() - start) * 1000, 2)
    return diagnostics


async def _fetch_health(url: str, timeout: float) -> HealthCheckOutcome:
    start = time.perf_counter()
    headers = {}
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.get(url)
        latency = round((time.perf_counter() - start) * 1000, 2)
        headers = dict(response.headers)
        payload: Optional[Dict[str, Any]] = None
        try:
            payload = response.json()
        except json.JSONDecodeError as exc:
            return HealthCheckOutcome(
                ok=False,
                status_code=response.status_code,
                latency_ms=latency,
                error=f"Invalid JSON response: {exc}",
                payload=None,
                headers=headers,
            )
        status = response.status_code == 200 and isinstance(payload, dict)
        return HealthCheckOutcome(
            ok=status,
            status_code=response.status_code,
            latency_ms=latency,
            error=None if status else "Health endpoint returned non-200 status",
            payload=payload,
            headers=headers,
        )
    except Exception as exc:  # pragma: no cover - network failure path
        latency = round((time.perf_counter() - start) * 1000, 2)
        return HealthCheckOutcome(
            ok=False,
            status_code=None,
            latency_ms=latency,
            error=str(exc),
            payload=None,
            headers=headers,
        )


def _check_cors(headers: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "allow_origin": headers.get("access-control-allow-origin"),
        "allow_methods": headers.get("access-control-allow-methods"),
        "allow_headers": headers.get("access-control-allow-headers"),
    }


def _build_report(args: argparse.Namespace, outcome: HealthCheckOutcome, startup_validation: Optional[Dict[str, Any]], port_info: Dict[str, Any]) -> Dict[str, Any]:
    response_payload = outcome.payload or {}
    performance = response_payload.get("performance", {}) if isinstance(response_payload, dict) else {}
    debug = response_payload.get("debug", {}) if isinstance(response_payload, dict) else {}

    report: Dict[str, Any] = {
        "timestamp": int(time.time()),
        "target_url": args.url,
        "backend_port": port_info.get("port"),
        "port_check": port_info,
        "health_request": outcome.to_dict(),
        "cors": _check_cors(outcome.headers),
        "response_status": response_payload.get("status") if isinstance(response_payload, dict) else None,
        "performance_metrics": {
            "reported_processing_ms": performance.get("health_check_processing_ms"),
            "observed_latency_ms": outcome.latency_ms,
        },
        "environment": debug.get("environment"),
        "configuration_validation": response_payload.get("configuration_validation") if isinstance(response_payload, dict) else None,
        "startup_validation": startup_validation,
        "logs_hint": "Check backend/logs or uvicorn console output for detailed stack traces.",
    }
    return report


def _derive_exit_code(outcome: HealthCheckOutcome, port_info: Dict[str, Any]) -> int:
    if not port_info.get("reachable"):
        return 2
    if not outcome.ok:
        return 1
    return 0


async def main_async(args: argparse.Namespace) -> int:
    parsed = urlparse(args.url)
    host = parsed.hostname or "localhost"
    port = parsed.port or (443 if parsed.scheme == "https" else 80)

    port_info = _check_port(host, port, timeout=args.timeout)

    health_outcome = await _fetch_health(args.url, timeout=args.timeout)

    startup_validation = None
    if args.startup_validation and run_startup_validation is not None:
        try:
            startup_validation = run_startup_validation(port)
        except Exception as exc:  # pragma: no cover - defensive path
            startup_validation = {
                "status": "error",
                "details": f"Startup validation failed: {exc}",
            }

    report = _build_report(args, health_outcome, startup_validation, port_info)

    # Pretty-print report for humans
    print("=== Bailey Intelligence Health Diagnostics ===")
    print(f"Target URL: {args.url}")
    print(f"Port reachable: {port_info.get('reachable')} (latency: {port_info.get('latency_ms')} ms)")
    if health_outcome.status_code is not None:
        print(f"HTTP status: {health_outcome.status_code} (latency: {health_outcome.latency_ms} ms)")
    if health_outcome.error:
        print(f"Error: {health_outcome.error}")
    print(f"CORS allow-origin: {report['cors'].get('allow_origin')}")
    if report["response_status"]:
        print(f"Reported health status: {report['response_status']}")
    if startup_validation:
        print(f"Startup validation status: {startup_validation.get('status')}")
    if args.json:
        print(json.dumps(report, indent=2))

    exit_code = _derive_exit_code(health_outcome, port_info)
    if args.json and exit_code != 0:
        json_report = json.dumps(report, indent=2)
        print(json_report)
    return exit_code


def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Bailey Intelligence health endpoint diagnostics")
    parser.add_argument("--url", default=os.getenv("HEALTH_URL", "http://localhost:8000/health"), help="Health endpoint URL")
    parser.add_argument("--timeout", type=float, default=float(os.getenv("HEALTH_TIMEOUT", "10")), help="Request timeout in seconds")
    parser.add_argument("--startup-validation", action="store_true", help="Run backend startup validation checks")
    parser.add_argument("--json", action="store_true", help="Output full diagnostics payload as JSON")
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> int:
    args = parse_args(argv)
    try:
        return asyncio.run(main_async(args))
    except KeyboardInterrupt:  # pragma: no cover - manual cancel
        print("Aborted by user")
        return 130


if __name__ == "__main__":
    sys.exit(main())
