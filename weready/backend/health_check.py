#!/usr/bin/env python3
"""Business Pillar health checks for external data sources and internal APIs."""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
import time
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx

# Ensure backend package imports resolve when executed directly.
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from app.core.bailey import bailey  # pylint: disable=wrong-import-position
from app.core.business_formation_tracker import business_formation_tracker  # pylint: disable=wrong-import-position
from app.core.international_market_intelligence import international_market_intelligence  # pylint: disable=wrong-import-position
from app.core.technology_trend_analyzer import technology_trend_analyzer  # pylint: disable=wrong-import-position

try:
    from redis import asyncio as aioredis
except ImportError:  # pragma: no cover - handled in install script
    aioredis = None


@dataclass
class CheckResult:
    """Represents the outcome of a single subsystem check."""

    name: str
    status: str
    latency_ms: float
    details: str
    metadata: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


STATUS_PASS = "pass"
STATUS_WARN = "warn"
STATUS_FAIL = "fail"


async def _check_redis(url: str) -> CheckResult:
    start = time.perf_counter()
    if aioredis is None:
        return CheckResult(
            name="redis",
            status=STATUS_FAIL,
            latency_ms=0.0,
            details="redis package not installed",
            metadata={"url": url},
        )

    try:
        client = aioredis.from_url(url)
        pong = await client.ping()
        await client.close()
        latency = (time.perf_counter() - start) * 1000
        status = STATUS_PASS if pong is True else STATUS_WARN
        return CheckResult(
            name="redis",
            status=status,
            latency_ms=latency,
            details="Redis ping successful" if pong else "Redis ping returned unexpected value",
            metadata={"url": url},
        )
    except Exception as exc:  # pragma: no cover - network failure path
        latency = (time.perf_counter() - start) * 1000
        return CheckResult(
            name="redis",
            status=STATUS_FAIL,
            latency_ms=latency,
            details=f"Redis connectivity failure: {exc}",
            metadata={"url": url},
        )


async def _check_business_formation() -> CheckResult:
    sector = "software"
    region = "US"
    start = time.perf_counter()
    data = await business_formation_tracker.get_business_formation_trends(sector=sector, region=region)
    primary_latency = (time.perf_counter() - start) * 1000

    cache_start = time.perf_counter()
    cached = await business_formation_tracker.get_business_formation_trends(sector=sector, region=region)
    cache_latency = (time.perf_counter() - cache_start) * 1000

    signals = data.get("signals", [])
    status = STATUS_PASS if signals else STATUS_WARN
    details = f"{len(signals)} signals; momentum={data.get('momentum_score')}"
    metadata = {
        "sector": sector,
        "region": region,
        "cache_latency_ms": round(cache_latency, 2),
        "cache_hit": cache_latency <= primary_latency,
        "sources": data.get("sources", []),
    }
    return CheckResult(
        name="census_bfs_bundle",
        status=status,
        latency_ms=round(primary_latency, 2),
        details=details,
        metadata=metadata,
    )


async def _check_international_markets() -> CheckResult:
    country = "us"
    start = time.perf_counter()
    data = await international_market_intelligence.get_global_market_context(country=country, industry="software")
    latency = (time.perf_counter() - start) * 1000
    signals = data.get("signals", [])
    has_sources = "world_bank_indicators" in data.get("sources", [])
    status = STATUS_PASS if signals and has_sources else STATUS_WARN
    details = f"{len(signals)} signals; opportunity={data.get('opportunity_score')} risk={data.get('risk_score')}"
    metadata = {
        "country": country,
        "sources": data.get("sources", []),
    }
    return CheckResult(
        name="international_markets",
        status=status,
        latency_ms=round(latency, 2),
        details=details,
        metadata=metadata,
    )


async def _check_technology_trends() -> CheckResult:
    category = "ai"
    start = time.perf_counter()
    report = await technology_trend_analyzer.get_trend_report(category)
    latency = (time.perf_counter() - start) * 1000
    trends = report.get("trends", [])
    sources = report.get("sources", [])
    status = STATUS_PASS if trends and {"product_hunt", "stack_exchange", "openalex"}.intersection(sources) else STATUS_WARN
    details = f"{len(trends)} trends; adoption_index={report.get('adoption_index')}"
    metadata = {
        "category": category,
        "sources": sources,
    }
    return CheckResult(
        name="technology_trends",
        status=status,
        latency_ms=round(latency, 2),
        details=details,
        metadata=metadata,
    )


def _check_bailey_status() -> CheckResult:
    start = time.perf_counter()
    source_count = len(bailey.knowledge_sources)
    active_sources = bailey.ingestion_stats.get("active_sources", 0)
    latency = (time.perf_counter() - start) * 1000
    status = STATUS_PASS if source_count and active_sources else STATUS_WARN
    details = f"sources={source_count} active={active_sources}"
    metadata = {
        "categories": list(bailey.category_metadata.keys()),
        "credibility_thresholds": bailey.credibility_thresholds,
    }
    return CheckResult(
        name="bailey_intelligence",
        status=status,
        latency_ms=round(latency, 2),
        details=details,
        metadata=metadata,
    )


async def _check_internal_endpoint(base_url: str, path: str) -> CheckResult:
    url = f"{base_url.rstrip('/')}{path}"
    start = time.perf_counter()
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(url)
            latency = (time.perf_counter() - start) * 1000
            payload: Dict[str, Any] = response.json() if response.headers.get("Content-Type", "").startswith("application/json") else {}
            if response.status_code == 200:
                status = STATUS_PASS
                details = f"HTTP 200; keys={list(payload.keys())[:5]}"
            else:
                status = STATUS_FAIL
                details = f"Unexpected status {response.status_code}"
        except Exception as exc:  # pragma: no cover - network failure path
            latency = (time.perf_counter() - start) * 1000
            status = STATUS_FAIL
            payload = {}
            details = f"Request error: {exc}"
    metadata = {"url": url, "status_code": payload.get("status") if payload else None}
    return CheckResult(
        name=f"api:{path}",
        status=status,
        latency_ms=round(latency, 2),
        details=details,
        metadata=metadata,
    )


async def run_checks(base_url: str, include_api: bool) -> List[CheckResult]:
    tasks = [
        _check_business_formation(),
        _check_international_markets(),
        _check_technology_trends(),
    ]

    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    tasks.append(_check_redis(redis_url))

    results = await asyncio.gather(*tasks)
    results.append(_check_bailey_status())

    if include_api:
        api_paths = [
            "/api/business-formation/software",
            "/api/international-markets/us",
            "/api/technology-trends/ai",
            "/api/business-intelligence/dashboard",
            "/api/procurement/541511",
        ]
        api_results = await asyncio.gather(*[_check_internal_endpoint(base_url, path) for path in api_paths])
        results.extend(api_results)

    return results


def summarize(results: List[CheckResult]) -> Dict[str, Any]:
    summary = {
        "total": len(results),
        "pass": sum(1 for r in results if r.status == STATUS_PASS),
        "warn": sum(1 for r in results if r.status == STATUS_WARN),
        "fail": sum(1 for r in results if r.status == STATUS_FAIL),
    }
    return summary


def parse_args(argv: Optional[List[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate Business Pillar external integrations.")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000", help="FastAPI base URL for endpoint checks.")
    parser.add_argument("--skip-api", action="store_true", help="Skip FastAPI endpoint validation.")
    parser.add_argument("--json", action="store_true", help="Emit machine-readable JSON output.")
    return parser.parse_args(argv)


def main(argv: Optional[List[str]] = None) -> int:
    args = parse_args(argv)

    results = asyncio.run(run_checks(base_url=args.base_url, include_api=not args.skip_api))
    summary = summarize(results)

    if args.json:
        payload = {"summary": summary, "results": [r.to_dict() for r in results]}
        print(json.dumps(payload, indent=2))
    else:
        print("Business Pillar Health Check")
        print("============================")
        for result in results:
            print(f"- {result.name:32s} {result.status.upper():4s} {result.latency_ms:7.2f}ms :: {result.details}")
        print("\nSummary:")
        print(f"  Pass: {summary['pass']}  Warn: {summary['warn']}  Fail: {summary['fail']} (Total {summary['total']})")

    # Close async clients to avoid resource warnings
    close_tasks: List[Any] = []
    if hasattr(business_formation_tracker, "client"):
        close_tasks.append(business_formation_tracker.client.aclose())
    if hasattr(international_market_intelligence, "client"):
        close_tasks.append(international_market_intelligence.client.aclose())
    if hasattr(technology_trend_analyzer, "client"):
        close_tasks.append(technology_trend_analyzer.client.aclose())
    if close_tasks:
        asyncio.run(asyncio.gather(*close_tasks))

    return 0 if summary["fail"] == 0 else 1


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
