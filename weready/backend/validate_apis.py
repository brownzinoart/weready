#!/usr/bin/env python3
"""Validate FastAPI Business Pillar endpoints for schema and performance."""

from __future__ import annotations

import argparse
import asyncio
import json
import time
from dataclasses import dataclass
from typing import Any, Callable, Dict, List, Optional, Tuple, Type

import httpx
from dateutil import parser as date_parser
from pydantic import BaseModel, Field, ValidationError


class BaseHealthModel(BaseModel):
    """Common Pydantic configuration that tolerates extra fields."""

    model_config = {"extra": "allow"}


class FormationSignal(BaseHealthModel):
    name: str
    current_value: float
    change_percent: float
    timeframe: str
    source_id: str
    context: str


class BusinessFormationResponse(BaseHealthModel):
    sector: str
    region: str
    momentum_score: float
    signals: List[FormationSignal]
    sources: List[str]
    last_updated: str


class MarketSignal(BaseHealthModel):
    metric: str
    value: float
    delta: float
    unit: str
    source_id: str
    commentary: str


class InternationalMarketResponse(BaseHealthModel):
    country: str
    industry: str
    opportunity_score: float
    risk_score: float
    signals: List[MarketSignal]
    sources: List[str]
    last_updated: str


class ProcurementAgency(BaseHealthModel):
    name: str
    award_volume: Optional[float] = Field(default=None, alias="value")
    description: Optional[str] = None


class ProcurementResponse(BaseHealthModel):
    naics_code: str
    sector: str
    opportunities: List[Dict[str, Any]] = Field(default_factory=list)
    top_agencies: List[ProcurementAgency] = Field(default_factory=list)
    last_updated: str


class TechnologyTrend(BaseHealthModel):
    label: str
    score: float
    change_percent: float
    source_id: str
    evidence: str
    timestamp: str


class TechnologyTrendsResponse(BaseHealthModel):
    category: str
    adoption_index: float
    trends: List[TechnologyTrend]
    sources: List[str]
    last_updated: str


class DashboardResponse(BaseHealthModel):
    sector: str
    country: str
    naics_code: str
    business_formation: Dict[str, Any]
    international_market: Dict[str, Any]
    procurement: Dict[str, Any]
    technology_trends: Dict[str, Any]
    economic_context: Dict[str, Any]
    updated_at: str


ValidatorFunc = Callable[[BaseModel, Dict[str, Any]], Tuple[str, str]]


@dataclass
class APITestCase:
    name: str
    path: str
    model: Type[BaseModel]
    validator: Optional[ValidatorFunc] = None
    requires_auth: bool = False


@dataclass
class APITestResult:
    name: str
    status: str
    latency_ms: float
    cache_latency_ms: float
    details: str
    rate_limit_remaining: Optional[str]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "status": self.status,
            "latency_ms": round(self.latency_ms, 2),
            "cache_latency_ms": round(self.cache_latency_ms, 2),
            "details": self.details,
            "rate_limit_remaining": self.rate_limit_remaining,
        }


STATUS_PASS = "pass"
STATUS_WARN = "warn"
STATUS_FAIL = "fail"


def _validate_freshness(timestamp: str, max_minutes: int = 180) -> bool:
    try:
        dt = date_parser.isoparse(timestamp)
    except (ValueError, TypeError):
        return False
    age_minutes = (time.time() - dt.timestamp()) / 60
    return age_minutes <= max_minutes


def _formation_validator(model: BaseModel, raw: Dict[str, Any]) -> Tuple[str, str]:
    freshness = _validate_freshness(raw.get("last_updated"), 180)
    status = STATUS_PASS if model.signals and freshness else STATUS_WARN
    details = f"signals={len(model.signals)} freshness={'ok' if freshness else 'stale'} momentum={model.momentum_score}"
    return status, details


def _international_validator(model: BaseModel, raw: Dict[str, Any]) -> Tuple[str, str]:
    freshness = _validate_freshness(raw.get("last_updated"), 720)
    status = STATUS_PASS if model.signals and freshness else STATUS_WARN
    details = f"signals={len(model.signals)} opportunity={model.opportunity_score} risk={model.risk_score}"
    return status, details


def _procurement_validator(model: BaseModel, raw: Dict[str, Any]) -> Tuple[str, str]:
    agencies = getattr(model, "top_agencies", [])
    status = STATUS_PASS if agencies else STATUS_WARN
    details = f"opportunities={len(model.opportunities)} agencies={len(agencies)}"
    return status, details


def _technology_validator(model: BaseModel, raw: Dict[str, Any]) -> Tuple[str, str]:
    sources = set(model.sources)
    expected = {"product_hunt", "stack_exchange", "openalex"}
    coverage = expected.intersection({s.lower() for s in sources})
    status = STATUS_PASS if model.trends and len(coverage) >= 2 else STATUS_WARN
    details = f"trends={len(model.trends)} adoption_index={model.adoption_index} coverage={sorted(coverage)}"
    return status, details


def _dashboard_validator(model: BaseModel, raw: Dict[str, Any]) -> Tuple[str, str]:
    required_keys = {"business_formation", "international_market", "technology_trends", "procurement", "economic_context"}
    missing = [key for key in required_keys if key not in raw or not raw.get(key)]
    freshness = _validate_freshness(raw.get("updated_at"), 30)
    if missing:
        status = STATUS_FAIL
        details = f"missing={missing}"
    elif not freshness:
        status = STATUS_WARN
        details = "dashboard stale"
    else:
        status = STATUS_PASS
        details = "dashboard healthy"
    return status, details


TEST_CASES: List[APITestCase] = [
    APITestCase("business-formation", "/api/business-formation/software", BusinessFormationResponse, _formation_validator),
    APITestCase("international-markets", "/api/international-markets/us", InternationalMarketResponse, _international_validator),
    APITestCase("procurement", "/api/procurement/541511", ProcurementResponse, _procurement_validator),
    APITestCase("technology-trends", "/api/technology-trends/ai", TechnologyTrendsResponse, _technology_validator),
    APITestCase("business-intelligence-dashboard", "/api/business-intelligence/dashboard", DashboardResponse, _dashboard_validator),
]


async def execute_test(client: httpx.AsyncClient, base_url: str, case: APITestCase, auth_header: Optional[str]) -> APITestResult:
    url = f"{base_url.rstrip('/')}{case.path}"
    headers = {"Authorization": auth_header} if auth_header else {}

    # Primary request
    start = time.perf_counter()
    response = await client.get(url, headers=headers)
    primary_latency = (time.perf_counter() - start) * 1000

    cache_start = time.perf_counter()
    cached_response = await client.get(url, headers=headers)
    cache_latency = (time.perf_counter() - cache_start) * 1000

    rate_limit_remaining = response.headers.get("x-ratelimit-remaining") or response.headers.get("X-RateLimit-Remaining")

    status = STATUS_PASS
    details = ""

    if case.requires_auth and not auth_header:
        status = STATUS_WARN
        details = "authentication token not provided"
        return APITestResult(case.name, status, primary_latency, cache_latency, details, rate_limit_remaining)

    if response.status_code != 200:
        status = STATUS_FAIL
        details = f"status={response.status_code}"
        return APITestResult(case.name, status, primary_latency, cache_latency, details, rate_limit_remaining)

    try:
        payload = response.json()
    except json.JSONDecodeError:
        status = STATUS_FAIL
        details = "invalid JSON payload"
        return APITestResult(case.name, status, primary_latency, cache_latency, details, rate_limit_remaining)

    try:
        model_instance = case.model.model_validate(payload)
    except ValidationError as exc:  # pragma: no cover - validation failure path
        status = STATUS_FAIL
        details = f"schema validation error: {exc.errors()[:2]}"
        return APITestResult(case.name, status, primary_latency, cache_latency, details, rate_limit_remaining)

    if case.validator:
        validator_status, validator_details = case.validator(model_instance, payload)
        status = validator_status
        details = validator_details

    if cache_latency > primary_latency * 1.25:
        details += " | cache-miss"
        if status == STATUS_PASS:
            status = STATUS_WARN

    if rate_limit_remaining is not None and rate_limit_remaining.isdigit() and int(rate_limit_remaining) < 2:
        details += " | rate-limit-low"
        status = STATUS_WARN if status == STATUS_PASS else status

    return APITestResult(case.name, status, primary_latency, cache_latency, details, rate_limit_remaining)


async def run_suite(base_url: str, auth_header: Optional[str]) -> List[APITestResult]:
    async with httpx.AsyncClient(timeout=20.0) as client:
        tasks = [execute_test(client, base_url, case, auth_header) for case in TEST_CASES]
        return await asyncio.gather(*tasks)


def summarize(results: List[APITestResult]) -> Dict[str, Any]:
    return {
        "total": len(results),
        "pass": sum(1 for r in results if r.status == STATUS_PASS),
        "warn": sum(1 for r in results if r.status == STATUS_WARN),
        "fail": sum(1 for r in results if r.status == STATUS_FAIL),
        "avg_latency_ms": round(sum(r.latency_ms for r in results) / max(len(results), 1), 2),
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate Business Pillar API endpoints.")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000", help="FastAPI base URL.")
    parser.add_argument("--auth-token", help="Bearer token for protected endpoints.")
    parser.add_argument("--json", action="store_true", help="Emit JSON report.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    auth_header = f"Bearer {args.auth_token}" if args.auth_token else None

    results = asyncio.run(run_suite(args.base_url, auth_header))
    summary = summarize(results)

    if args.json:
        print(json.dumps({"summary": summary, "results": [r.to_dict() for r in results]}, indent=2))
    else:
        print("Business Pillar API Validation")
        print("================================")
        for result in results:
            print(f"- {result.name:28s} {result.status.upper():4s} {result.latency_ms:7.2f}ms (cache {result.cache_latency_ms:7.2f}ms) :: {result.details}")
        print("\nSummary:")
        print(f"  Pass: {summary['pass']}  Warn: {summary['warn']}  Fail: {summary['fail']}  Avg latency: {summary['avg_latency_ms']}ms")

    return 0 if summary["fail"] == 0 else 1


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
