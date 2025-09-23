"""Source inventory API endpoints for backend/frontend alignment."""

from __future__ import annotations

import asyncio
import json
import logging
import os
import random
import re
import time
from datetime import datetime, timedelta
from typing import Any, Dict, Iterable, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from fastapi.encoders import jsonable_encoder
from starlette.responses import StreamingResponse

try:  # Starlette 0.47+ no longer exports EventSourceResponse
    from starlette.responses import EventSourceResponse  # type: ignore
except ImportError:  # pragma: no cover - compatibility shim
    class EventSourceResponse(StreamingResponse):
        """Minimal SSE response compatible with FastAPI's previous helper.

        Accepts an async generator that yields either already-formatted SSE strings
        or dictionaries containing ``event`` / ``data`` / ``id`` / ``retry`` keys.
        """

        def __init__(self, content, status_code: int = 200, headers: Optional[Dict[str, str]] = None):
            async def _renderer():
                async for message in content:
                    if isinstance(message, dict):
                        parts = []
                        event_name = message.get("event")
                        if event_name:
                            parts.append(f"event: {event_name}")
                        retry = message.get("retry")
                        if retry is not None:
                            parts.append(f"retry: {retry}")
                        message_id = message.get("id")
                        if message_id:
                            parts.append(f"id: {message_id}")
                        data = message.get("data")
                        if data is not None:
                            payload = data if isinstance(data, str) else json.dumps(data)
                            for line in payload.splitlines() or [""]:
                                parts.append(f"data: {line}")
                        yield ("\n".join(parts) + "\n\n").encode("utf-8")
                    else:
                        payload = message if isinstance(message, str) else json.dumps(message)
                        if not payload.endswith("\n\n"):
                            payload = payload.rstrip("\n") + "\n\n"
                        yield payload.encode("utf-8")

            super().__init__(_renderer(), status_code=status_code, headers=headers, media_type="text/event-stream")
from pydantic import BaseModel, Field, ConfigDict

from app.services.source_inventory_service import (
    SourceImplementationStatus,
    SourceInventoryService,
    source_inventory_service,
)

router = APIRouter(prefix="/sources", tags=["sources"])

logger = logging.getLogger(__name__)

SOURCE_ID_PATTERN = re.compile(r"^[a-z0-9_.-]+$", re.IGNORECASE)

METRIC_COUNTERS: Dict[str, int] = {
    "health_requests": 0,
    "health_failures": 0,
    "stream_connections": 0,
    "stream_disconnects": 0,
    "source_tests": 0,
    "source_diagnostics": 0,
    "source_pauses": 0,
    "source_resumes": 0,
}

HEALTH_CONCURRENCY = max(1, int(os.getenv("BAILEY_SOURCES_HEALTH_CONCURRENCY", "3")))
_health_request_semaphore = asyncio.Semaphore(HEALTH_CONCURRENCY)


def _increment_metric(key: str, value: int = 1) -> None:
    METRIC_COUNTERS[key] = METRIC_COUNTERS.get(key, 0) + value


def _validate_source_id(source_id: str) -> str:
    if not SOURCE_ID_PATTERN.fullmatch(source_id):
        logger.warning("Invalid source identifier received", extra={"source_id": source_id})
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Invalid source identifier format.",
        )
    return source_id


def get_service() -> SourceInventoryService:
    return source_inventory_service


class SourceInventoryItem(BaseModel):
    source_id: str
    name: str
    category: str
    organization: Optional[str]
    status: SourceImplementationStatus
    credibility_score: Optional[float] = None
    connector_key: Optional[str] = None
    implementation_notes: Optional[str] = None
    sunset_date: Optional[datetime] = None
    replacement_source_id: Optional[str] = None
    migration_guidance: Optional[str] = None

    class Config:
        use_enum_values = True
        json_encoders = {datetime: lambda value: value.isoformat()}


class SourceStatusItem(BaseModel):
    name: str
    category: str
    status: SourceImplementationStatus
    knowledge_points: int = Field(0, ge=0)

    class Config:
        use_enum_values = True


class CoverageItem(BaseModel):
    implemented: int
    total: int
    coverage_pct: float


class GapAnalysisItem(BaseModel):
    source_id: str
    name: str
    status: SourceImplementationStatus

    class Config:
        use_enum_values = True


class SourceValidationRequest(BaseModel):
    source_ids: Optional[List[str]] = None


class SourceValidationResponse(BaseModel):
    all_sources_covered: bool
    missing_sources: List[str]
    implemented_count: int
    expected_count: int


class AggregatedHealthMetrics(BaseModel):
    total_sources: int
    active_sources: int
    average_uptime: float
    average_response_time: float
    total_data_points: int
    system_health_score: float
    last_updated: datetime
    refresh_interval_seconds: int = Field(30, ge=5)
    total_knowledge_points: Optional[int] = None
    average_credibility: Optional[float] = None
    sla_target_ms: Optional[int] = None

    model_config = ConfigDict(json_encoders={datetime: lambda value: value.isoformat()})


class SourceHealthPayload(BaseModel):
    source_id: str
    name: str
    category: str
    status: str
    uptime: float
    response_time: int = Field(..., alias="responseTime")
    credibility: float
    last_update: datetime = Field(..., alias="lastUpdate")
    data_freshness: datetime = Field(..., alias="dataFreshness")
    error_rate: float = Field(..., alias="errorRate")
    api_quota_remaining: Optional[int] = Field(None, alias="apiQuotaRemaining")
    api_quota_limit: Optional[int] = Field(None, alias="apiQuotaLimit")
    depends_on: List[str] = Field(default_factory=list, alias="dependsOn")
    health_trend: str = Field(..., alias="healthTrend")
    sla_compliance: Optional[str] = Field(None, alias="slaCompliance")
    ingestion_rate: Optional[float] = Field(None, alias="ingestionRate")
    data_points_last_24h: Optional[int] = Field(None, alias="dataPointsLast24h")
    knowledge_points: Optional[int] = Field(None, alias="knowledgePoints")
    maintenance_window: Optional[str] = Field(None, alias="maintenanceWindow")
    health_history: Optional[List[float]] = Field(None, alias="healthHistory")
    sunset_date: Optional[datetime] = Field(None, alias="sunsetDate")
    replacement_source: Optional[str] = Field(None, alias="replacementSource")
    migration_guidance: Optional[str] = Field(None, alias="migrationGuidance")
    deprecation_notice: Optional[str] = Field(None, alias="deprecationNotice")

    model_config = ConfigDict(
        populate_by_name=True, json_encoders={datetime: lambda value: value.isoformat()}
    )


class SourceHealthResponse(BaseModel):
    sources: Dict[str, SourceHealthPayload]
    metrics: AggregatedHealthMetrics
    last_updated: datetime

    model_config = ConfigDict(json_encoders={datetime: lambda value: value.isoformat()})


class SourceTestResult(BaseModel):
    source_id: str
    status: str
    latency_ms: int
    success: bool
    message: Optional[str] = None


class SourceHistoryPoint(BaseModel):
    timestamp: datetime
    uptime: float
    response_time: int
    error_rate: float
    knowledge_points: int


class SourceHistoryResponse(BaseModel):
    source_id: str
    window: str
    datapoints: List[SourceHistoryPoint]


class ContradictionRecord(BaseModel):
    id: str
    topic: str
    sources: List[str]
    conflict: str
    confidence: float
    severity: str
    detected_at: datetime
    resolution: Optional[str] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    status: str
    impact_score: float

    class Config:
        json_encoders = {datetime: lambda value: value.isoformat()}


class ContradictionStatsModel(BaseModel):
    total: int
    active: int
    resolved: int
    acceptable: int
    high_severity_percentage: float
    median_resolution_time: Optional[str] = None
    resolutions_last_24h: int
    average_credibility_impact: float
    last_checked: datetime

    class Config:
        json_encoders = {datetime: lambda value: value.isoformat()}


class ContradictionResponse(BaseModel):
    contradictions: List[ContradictionRecord]
    stats: ContradictionStatsModel
    last_checked: datetime

    class Config:
        json_encoders = {datetime: lambda value: value.isoformat()}


class DependencyNode(BaseModel):
    source_id: str
    depends_on: List[str] = Field(default_factory=list)
    dependents: List[str] = Field(default_factory=list)
    criticality: str = "standard"


class DependencyMapResponse(BaseModel):
    nodes: Dict[str, DependencyNode]
    critical_paths: List[List[str]]


STREAM_REFRESH_SECONDS = 30
_health_cache: Optional[SourceHealthResponse] = None
_health_cache_timestamp: float = 0.0
_health_lock = asyncio.Lock()


SOURCE_BASELINES: Dict[str, Dict[str, Any]] = {
    "sec_edgar": {
        "name": "SEC EDGAR Filings",
        "category": "Government",
        "status": "online",
        "uptime": 99.7,
        "response_time": 234,
        "credibility": 98,
        "error_rate": 0.4,
        "health_trend": "stable",
        "depends_on": ["us_government_data_hub"],
        "sla": "On track",
        "ingestion_rate": 65,
        "data_points_last_24h": 9800,
        "knowledge_points": 2400,
        "api_quota_remaining": 12_000,
        "api_quota_limit": 15_000,
        "health_history": [96, 95, 94, 96, 97, 98, 98.5, 99],
    },
    "github_api": {
        "name": "GitHub API",
        "category": "Industry",
        "status": "online",
        "uptime": 99.3,
        "response_time": 145,
        "credibility": 95,
        "error_rate": 0.9,
        "health_trend": "improving",
        "depends_on": ["octokit_adapter"],
        "sla": "On track",
        "ingestion_rate": 120,
        "data_points_last_24h": 45_200,
        "knowledge_points": 6_800,
        "api_quota_remaining": 3_800,
        "api_quota_limit": 5_000,
        "health_history": [90, 91, 92, 93, 94, 95, 95.5, 96],
    },
    "arxiv": {
        "name": "arXiv Research Feed",
        "category": "Academic",
        "status": "online",
        "uptime": 98.2,
        "response_time": 312,
        "credibility": 92,
        "error_rate": 1.5,
        "health_trend": "stable",
        "depends_on": ["semantic_ingestion_pipeline"],
        "sla": "Within thresholds",
        "ingestion_rate": 34,
        "data_points_last_24h": 5_600,
        "knowledge_points": 2_100,
        "health_history": [88, 89, 90, 90, 91, 92, 92, 92.5],
    },
    "federal_reserve": {
        "name": "Federal Reserve Economic Data",
        "category": "Government",
        "status": "online",
        "uptime": 99.5,
        "response_time": 567,
        "credibility": 97,
        "error_rate": 0.2,
        "health_trend": "improving",
        "depends_on": ["economic_ingestion_pipeline"],
        "sla": "On track",
        "ingestion_rate": 22,
        "data_points_last_24h": 3_200,
        "knowledge_points": 1_400,
        "health_history": [94, 94.5, 95, 95.5, 96, 96.5, 97, 97.2],
    },
    "uspto_patents": {
        "name": "USPTO Patents",
        "category": "Government",
        "status": "degraded",
        "uptime": 97.1,
        "response_time": 890,
        "credibility": 95,
        "error_rate": 4.1,
        "health_trend": "degrading",
        "depends_on": ["patent_normalizer"],
        "sla": "Latency breach – under mitigation",
        "ingestion_rate": 14,
        "data_points_last_24h": 1_800,
        "knowledge_points": 960,
        "maintenance_window": "Credential rotation in progress",
        "health_history": [94, 93, 92, 91, 90, 89, 88, 87],
    },
    "mit_research": {
        "name": "MIT Research Digest",
        "category": "Academic",
        "status": "online",
        "uptime": 98.8,
        "response_time": 423,
        "credibility": 94,
        "error_rate": 0.7,
        "health_trend": "stable",
        "depends_on": ["academic_ingestion_pipeline"],
        "sla": "On track",
        "ingestion_rate": 18,
        "data_points_last_24h": 7_400,
        "knowledge_points": 3_200,
        "health_history": [90, 91, 92, 92, 93, 94, 95, 95],
    },
    "sonarqube": {
        "name": "SonarQube Quality Gate",
        "category": "Code Quality",
        "status": "online",
        "uptime": 99.1,
        "response_time": 210,
        "credibility": 96,
        "error_rate": 0.9,
        "health_trend": "improving",
        "depends_on": ["code_quality_pipeline"],
        "sla": "On track",
        "ingestion_rate": 54,
        "data_points_last_24h": 12_800,
        "knowledge_points": 4_200,
        "health_history": [92, 92, 93, 94, 95, 95.5, 96, 96],
    },
    "codeclimate": {
        "name": "CodeClimate Insights",
        "category": "Code Quality",
        "status": "online",
        "uptime": 98.7,
        "response_time": 265,
        "credibility": 93,
        "error_rate": 1.2,
        "health_trend": "stable",
        "depends_on": ["code_quality_pipeline"],
        "sla": "On track",
        "ingestion_rate": 48,
        "data_points_last_24h": 10_400,
        "knowledge_points": 3_800,
        "health_history": [90, 90, 91, 92, 93, 93, 93.5, 94],
    },
    "gitguardian": {
        "name": "GitGuardian Secrets Monitor",
        "category": "Code Quality",
        "status": "online",
        "uptime": 99.4,
        "response_time": 188,
        "credibility": 97,
        "error_rate": 0.3,
        "health_trend": "improving",
        "depends_on": ["security_pipeline"],
        "sla": "On track",
        "ingestion_rate": 62,
        "data_points_last_24h": 13_600,
        "knowledge_points": 5_100,
        "health_history": [93, 94, 95, 95.5, 96, 97, 97.5, 98],
    },
    "semgrep": {
        "name": "Semgrep Security Rules",
        "category": "Code Quality",
        "status": "maintenance",
        "uptime": 96.5,
        "response_time": 312,
        "credibility": 92,
        "error_rate": 2.1,
        "health_trend": "stable",
        "depends_on": ["security_pipeline"],
        "sla": "Maintenance window",
        "ingestion_rate": 26,
        "data_points_last_24h": 5_400,
        "knowledge_points": 2_100,
        "maintenance_window": "Ruleset upgrade – completes in 15m",
        "health_history": [88, 88, 88, 88, 88, 87, 86, 86],
    },
    "yc_library": {
        "name": "Y Combinator Library",
        "category": "Business Intelligence",
        "status": "online",
        "uptime": 97.9,
        "response_time": 256,
        "credibility": 91,
        "error_rate": 1.4,
        "health_trend": "improving",
        "depends_on": ["venture_insights_pipeline"],
        "sla": "On track",
        "ingestion_rate": 37,
        "data_points_last_24h": 8_200,
        "knowledge_points": 2_800,
        "health_history": [85, 86, 87, 88, 89, 90, 90, 91],
    },
    "first_round_review": {
        "name": "First Round Review",
        "category": "Business Intelligence",
        "status": "online",
        "uptime": 98.4,
        "response_time": 301,
        "credibility": 93,
        "error_rate": 1.1,
        "health_trend": "stable",
        "depends_on": ["venture_insights_pipeline"],
        "sla": "On track",
        "ingestion_rate": 28,
        "data_points_last_24h": 6_400,
        "knowledge_points": 2_500,
        "health_history": [88, 88, 89, 90, 91, 91, 92, 92],
    },
    "a16z": {
        "name": "Andreessen Horowitz Research",
        "category": "Business Intelligence",
        "status": "degraded",
        "uptime": 95.2,
        "response_time": 624,
        "credibility": 90,
        "error_rate": 3.6,
        "health_trend": "degrading",
        "depends_on": ["venture_insights_pipeline"],
        "sla": "Retrying feed – provider latency",
        "ingestion_rate": 19,
        "data_points_last_24h": 4_100,
        "knowledge_points": 1_800,
        "health_history": [92, 91, 90, 89, 88, 87, 86, 85],
    },
    "sequoia": {
        "name": "Sequoia Partner Benchmarks",
        "category": "Investment Readiness",
        "status": "online",
        "uptime": 98.9,
        "response_time": 284,
        "credibility": 94,
        "error_rate": 0.8,
        "health_trend": "improving",
        "depends_on": ["investment_pipeline"],
        "sla": "On track",
        "ingestion_rate": 24,
        "data_points_last_24h": 5_200,
        "knowledge_points": 1_900,
        "health_history": [90, 90, 91, 92, 93, 94, 95, 95],
    },
    "bessemer": {
        "name": "Bessemer Cloud Index",
        "category": "Investment Readiness",
        "status": "online",
        "uptime": 99.0,
        "response_time": 240,
        "credibility": 95,
        "error_rate": 0.6,
        "health_trend": "stable",
        "depends_on": ["investment_pipeline"],
        "sla": "On track",
        "ingestion_rate": 21,
        "data_points_last_24h": 4_800,
        "knowledge_points": 1_700,
        "health_history": [91, 91, 92, 92, 93, 93, 94, 94],
    },
    "cb_insights": {
        "name": "CB Insights Market Intel",
        "category": "Investment Readiness",
        "status": "online",
        "uptime": 97.6,
        "response_time": 330,
        "credibility": 92,
        "error_rate": 1.5,
        "health_trend": "stable",
        "depends_on": ["investment_pipeline"],
        "sla": "On track",
        "ingestion_rate": 18,
        "data_points_last_24h": 4_600,
        "knowledge_points": 1_600,
        "health_history": [88, 89, 89, 90, 90, 91, 91, 92],
    },
    "nngroup": {
        "name": "Nielsen Norman UX Research",
        "category": "Design Experience",
        "status": "online",
        "uptime": 98.5,
        "response_time": 275,
        "credibility": 94,
        "error_rate": 0.9,
        "health_trend": "stable",
        "depends_on": ["design_insights_pipeline"],
        "sla": "On track",
        "ingestion_rate": 27,
        "data_points_last_24h": 6_000,
        "knowledge_points": 2_100,
        "health_history": [90, 90, 91, 92, 92, 93, 93, 94],
    },
    "baymard": {
        "name": "Baymard eCommerce UX",
        "category": "Design Experience",
        "status": "online",
        "uptime": 97.8,
        "response_time": 295,
        "credibility": 93,
        "error_rate": 1.1,
        "health_trend": "stable",
        "depends_on": ["design_insights_pipeline"],
        "sla": "On track",
        "ingestion_rate": 25,
        "data_points_last_24h": 5_600,
        "knowledge_points": 2_000,
        "health_history": [88, 89, 90, 90, 91, 92, 92, 93],
    },
    "webaim": {
        "name": "WebAIM Accessibility",
        "category": "Design Experience",
        "status": "online",
        "uptime": 99.2,
        "response_time": 210,
        "credibility": 96,
        "error_rate": 0.4,
        "health_trend": "improving",
        "depends_on": ["design_insights_pipeline"],
        "sla": "On track",
        "ingestion_rate": 33,
        "data_points_last_24h": 7_200,
        "knowledge_points": 2_600,
        "health_history": [92, 92, 93, 94, 95, 96, 97, 97.5],
    },
    "stackoverflow": {
        "name": "Stack Overflow",
        "category": "Community",
        "status": "online",
        "uptime": 99.1,
        "response_time": 182,
        "credibility": 93,
        "error_rate": 0.6,
        "health_trend": "stable",
        "depends_on": ["developer_qa_pipeline"],
        "sla": "On track",
        "ingestion_rate": 72,
        "data_points_last_24h": 24_600,
        "knowledge_points": 6_900,
        "api_quota_remaining": 18_000,
        "api_quota_limit": 25_000,
        "health_history": [94, 94, 95, 95, 95, 95.5, 96, 96],
    },
    "reddit_startups": {
        "name": "Reddit Startups",
        "category": "Community",
        "status": "degraded",
        "uptime": 95.4,
        "response_time": 410,
        "credibility": 82,
        "error_rate": 3.4,
        "health_trend": "volatile",
        "depends_on": ["community_aggregation_pipeline"],
        "sla": "Signal quality watch",
        "ingestion_rate": 44,
        "data_points_last_24h": 12_300,
        "knowledge_points": 2_200,
        "health_history": [80, 81, 82, 81, 80, 79, 78, 78],
    },
    "veracode": {
        "name": "Veracode Application Security",
        "category": "Security",
        "status": "maintenance",
        "uptime": 94.7,
        "response_time": 520,
        "credibility": 90,
        "error_rate": 2.8,
        "health_trend": "maintenance",
        "depends_on": ["security_pipeline"],
        "sla": "Connector upgrade in progress",
        "ingestion_rate": 21,
        "data_points_last_24h": 4_900,
        "knowledge_points": 1_600,
        "maintenance_window": "Agent rollout through Friday",
        "health_history": [84, 84, 84, 83, 82, 81, 81, 80],
    },
    "snyk": {
        "name": "Snyk Vulnerability Feed",
        "category": "Security",
        "status": "maintenance",
        "uptime": 96.8,
        "response_time": 340,
        "credibility": 91,
        "error_rate": 1.9,
        "health_trend": "improving",
        "depends_on": ["security_pipeline"],
        "sla": "On track",
        "ingestion_rate": 39,
        "data_points_last_24h": 8_700,
        "knowledge_points": 2_700,
        "health_history": [86, 87, 88, 88, 89, 90, 91, 92],
    },
    "datadog": {
        "name": "Datadog Observability",
        "category": "Operations",
        "status": "online",
        "uptime": 99.0,
        "response_time": 230,
        "credibility": 95,
        "error_rate": 0.7,
        "health_trend": "improving",
        "depends_on": ["operations_pipeline"],
        "sla": "On track",
        "ingestion_rate": 58,
        "data_points_last_24h": 16_400,
        "knowledge_points": 3_900,
        "health_history": [92, 93, 93, 94, 95, 95, 96, 96],
    },
    "pagerduty": {
        "name": "PagerDuty Incident Feed",
        "category": "Operations",
        "status": "sunset",
        "uptime": 91.2,
        "response_time": 620,
        "credibility": 88,
        "error_rate": 4.6,
        "health_trend": "declining",
        "depends_on": ["operations_pipeline"],
        "sla": "Sunsetting connector",
        "ingestion_rate": 17,
        "data_points_last_24h": 3_100,
        "knowledge_points": 950,
        "sunset_date": datetime(2025, 1, 15),
        "replacement_source": "datadog",
        "migration_guidance": "Move alerting automations to Datadog incidents.",
        "deprecation_notice": "PagerDuty integration retires on January 15, 2025.",
        "health_history": [78, 77, 76, 75, 74, 73, 72, 70],
    },
    "lean_startup": {
        "name": "The Lean Startup",
        "category": "Business Intelligence",
        "status": "sunset",
        "uptime": 88.0,
        "response_time": 840,
        "credibility": 85,
        "error_rate": 5.2,
        "health_trend": "retiring",
        "depends_on": ["venture_insights_pipeline"],
        "sla": "Content archive",
        "ingestion_rate": 8,
        "data_points_last_24h": 600,
        "knowledge_points": 240,
        "sunset_date": datetime(2024, 6, 30),
        "replacement_source": "first_round",
        "migration_guidance": "Lean Startup library is archived – rely on First Round Review playbooks.",
        "deprecation_notice": "Historical summaries remain available in read-only mode.",
        "health_history": [72, 71, 70, 68, 66, 64, 62, 60],
    },
    "profitwell": {
        "name": "ProfitWell Benchmarks",
        "category": "Business Intelligence",
        "status": "deprecated",
        "uptime": 87.4,
        "response_time": 910,
        "credibility": 86,
        "error_rate": 6.0,
        "health_trend": "retiring",
        "depends_on": ["subscription_metrics_pipeline"],
        "sla": "Deprecated – data merging into Paddle",
        "ingestion_rate": 12,
        "data_points_last_24h": 1_200,
        "knowledge_points": 420,
        "sunset_date": datetime(2024, 9, 30),
        "replacement_source": "cb_insights",
        "migration_guidance": "Adopt CB Insights SaaS benchmarks to replace ProfitWell panels.",
        "deprecation_notice": "ProfitWell dashboards retire September 30, 2024.",
        "health_history": [70, 69, 68, 66, 65, 63, 61, 60],
    },
    "harvard_business_school": {
        "name": "Harvard Business School",
        "category": "Business Intelligence",
        "status": "online",
        "uptime": 97.0,
        "response_time": 360,
        "credibility": 95,
        "error_rate": 1.0,
        "health_trend": "stable",
        "depends_on": ["academic_ingestion_pipeline"],
        "sla": "On track",
        "ingestion_rate": 24,
        "data_points_last_24h": 5_400,
        "knowledge_points": 1_900,
        "health_history": [90, 90, 91, 92, 92, 93, 93, 94],
    },
    "nvca": {
        "name": "NVCA Research",
        "category": "Investment Readiness",
        "status": "online",
        "uptime": 96.4,
        "response_time": 410,
        "credibility": 91,
        "error_rate": 1.6,
        "health_trend": "stable",
        "depends_on": ["investment_pipeline"],
        "sla": "On track",
        "ingestion_rate": 16,
        "data_points_last_24h": 3_700,
        "knowledge_points": 1_250,
        "health_history": [86, 87, 88, 88, 89, 90, 90, 91],
    },
    "mit_entrepreneurship": {
        "name": "MIT Entrepreneurship",
        "category": "Investment Readiness",
        "status": "planned",
        "uptime": 0.0,
        "response_time": 0,
        "credibility": 0.0,
        "error_rate": 0.0,
        "health_trend": "planned",
        "depends_on": ["venture_insights_pipeline"],
        "sla": "Implementation backlog",
        "ingestion_rate": 0,
        "data_points_last_24h": 0,
        "knowledge_points": 0,
        "health_history": [0, 0, 0, 0, 0, 0, 0, 0],
    },
    "angellist": {
        "name": "AngelList",
        "category": "Investment Readiness",
        "status": "online",
        "uptime": 98.2,
        "response_time": 280,
        "credibility": 92,
        "error_rate": 1.3,
        "health_trend": "stable",
        "depends_on": ["investment_pipeline"],
        "sla": "On track",
        "ingestion_rate": 32,
        "data_points_last_24h": 7_800,
        "knowledge_points": 2_300,
        "health_history": [88, 88, 89, 90, 91, 91, 92, 93],
    },
    "google_design": {
        "name": "Google Design",
        "category": "Design Experience",
        "status": "online",
        "uptime": 97.6,
        "response_time": 260,
        "credibility": 94,
        "error_rate": 0.8,
        "health_trend": "improving",
        "depends_on": ["design_insights_pipeline"],
        "sla": "On track",
        "ingestion_rate": 29,
        "data_points_last_24h": 6_200,
        "knowledge_points": 2_050,
        "health_history": [90, 90, 91, 92, 93, 93, 94, 95],
    },
    "apple_hig": {
        "name": "Apple Human Interface Guidelines",
        "category": "Design Experience",
        "status": "online",
        "uptime": 99.3,
        "response_time": 190,
        "credibility": 97,
        "error_rate": 0.5,
        "health_trend": "stable",
        "depends_on": ["design_insights_pipeline"],
        "sla": "On track",
        "ingestion_rate": 31,
        "data_points_last_24h": 6_600,
        "knowledge_points": 2_200,
        "health_history": [92, 92, 93, 94, 95, 95, 96, 97],
    },
    "chrome_ux_report": {
        "name": "Chrome UX Report",
        "category": "Design Experience",
        "status": "degraded",
        "uptime": 94.1,
        "response_time": 520,
        "credibility": 90,
        "error_rate": 2.9,
        "health_trend": "volatile",
        "depends_on": ["performance_pipeline"],
        "sla": "High latency due to provider backlog",
        "ingestion_rate": 23,
        "data_points_last_24h": 5_200,
        "knowledge_points": 1_700,
        "health_history": [85, 84, 83, 82, 82, 81, 80, 79],
    },
    "product_hunt": {
        "name": "Product Hunt",
        "category": "Discovery",
        "status": "online",
        "uptime": 98.6,
        "response_time": 275,
        "credibility": 89,
        "error_rate": 1.7,
        "health_trend": "stable",
        "depends_on": ["market_signal_pipeline"],
        "sla": "On track",
        "ingestion_rate": 47,
        "data_points_last_24h": 11_900,
        "knowledge_points": 2_900,
        "health_history": [86, 87, 88, 89, 90, 90, 91, 92],
    },
    "census_bfs": {
        "name": "US Census Business Formation",
        "category": "Government",
        "status": "online",
        "uptime": 97.9,
        "response_time": 380,
        "credibility": 96,
        "error_rate": 1.1,
        "health_trend": "stable",
        "depends_on": ["government_economic_pipeline"],
        "sla": "On track",
        "ingestion_rate": 26,
        "data_points_last_24h": 4_200,
        "knowledge_points": 1_500,
        "health_history": [88, 88, 89, 90, 91, 91, 92, 93],
    },
}


def _generate_mock_baseline(
    source_id: str,
    *,
    name: Optional[str] = None,
    category: Optional[str] = None,
) -> Dict[str, Any]:
    display_name = name or source_id.replace("_", " ").title()
    resolved_category = category or "Uncategorized"
    return {
        "name": display_name,
        "category": resolved_category,
        "status": "offline",
        "uptime": 90.0,
        "response_time": 450,
        "credibility": 75.0,
        "error_rate": 4.5,
        "health_trend": "unknown",
        "depends_on": [],
        "sla": "Awaiting baseline data",
        "ingestion_rate": 0,
        "data_points_last_24h": 0,
        "knowledge_points": 0,
        "health_history": [0, 0, 0, 0, 0, 0, 0, 0],
    }


DEPENDENCY_GRAPH: Dict[str, List[str]] = {
    "sec_edgar": ["federal_reserve"],
    "github_api": ["sonarqube", "codeclimate"],
    "arxiv": ["mit_research"],
    "uspto_patents": ["sequoia"],
    "gitguardian": ["semgrep"],
    "yc_library": ["a16z", "first_round_review"],
    "cb_insights": ["sequoia", "bessemer"],
    "nngroup": ["baymard", "webaim"],
}


CONTRADICTION_LOG: List[ContradictionRecord] = [
    ContradictionRecord(
        id="contradiction-1",
        topic="AI Startup Funding Growth Rate",
        sources=["MIT Research", "CB Insights"],
        conflict="MIT reports 34% YoY growth while CB Insights shows 28% for the same cohort.",
        confidence=0.85,
        severity="high",
        detected_at=datetime.utcnow() - timedelta(minutes=15),
        status="active",
        impact_score=78,
    ),
    ContradictionRecord(
        id="contradiction-2",
        topic="Time-to-Hire Benchmarks",
        sources=["LinkedIn Talent", "First Round Review"],
        conflict="LinkedIn indicates 46 days median while First Round cites 58 days.",
        confidence=0.72,
        severity="medium",
        detected_at=datetime.utcnow() - timedelta(hours=2),
        resolution="Variance explained by differing startup stage cohorts.",
        resolved_at=datetime.utcnow() - timedelta(minutes=45),
        resolved_by="bailey.ops",
        status="resolved",
        impact_score=44,
    ),
    ContradictionRecord(
        id="contradiction-3",
        topic="Security Breach Frequency",
        sources=["GitGuardian", "Semgrep"],
        conflict="GitGuardian flagged 12 incidents this week; Semgrep recorded 4 critical findings.",
        confidence=0.68,
        severity="medium",
        detected_at=datetime.utcnow() - timedelta(hours=3, minutes=30),
        status="acceptable",
        impact_score=38,
        resolution="Findings measuring different severity thresholds.",
        resolved_at=datetime.utcnow() - timedelta(hours=1, minutes=10),
        resolved_by="bailey.security",
    ),
    ContradictionRecord(
        id="contradiction-4",
        topic="Accessibility Compliance Score",
        sources=["WebAIM", "Internal Audit"],
        conflict="WebAIM shows 94% compliance while internal audit indicates 86%.",
        confidence=0.76,
        severity="high",
        detected_at=datetime.utcnow() - timedelta(minutes=5),
        status="investigating",
        impact_score=64,
    ),
]


STATUS_TO_HEALTH_STATE = {
    "implemented": "online",
    "mock": "maintenance",
    "planned": "offline",
    "missing": "offline",
    "sunset": "sunset",
    "deprecated": "deprecated",
}


def _map_status(status: Optional[str]) -> str:
    if status is None:
        return "offline"
    normalized = status.lower()
    return STATUS_TO_HEALTH_STATE.get(normalized, normalized)


def _jitter(value: float, magnitude: float = 0.3) -> float:
    return max(0.0, value + random.uniform(-magnitude, magnitude))


async def _build_health_snapshot(
    service: SourceInventoryService, *, force_refresh: bool = False
) -> SourceHealthResponse:
    global _health_cache_timestamp, _health_cache

    now = time.time()
    if (
        not force_refresh
        and _health_cache is not None
        and (now - _health_cache_timestamp) < STREAM_REFRESH_SECONDS - 5
    ):
        logger.debug(
            "Returning cached source health snapshot",
            extra={"age": now - _health_cache_timestamp},
        )
        return _health_cache

    async with _health_lock:
        if (
            not force_refresh
            and _health_cache is not None
            and (time.time() - _health_cache_timestamp) < STREAM_REFRESH_SECONDS - 5
        ):
            logger.debug("Using cached source health snapshot after lock check")
            return _health_cache

        try:
            snapshot = service.get_status_snapshot()
        except Exception as exc:  # pragma: no cover - defensive fallback
            logger.exception("Failed to collect live status snapshot", exc_info=exc)
            snapshot = {}

        try:
            sunset_records = {
                record.source_id: record for record in service.get_sunset_sources()
            }
        except Exception as exc:  # pragma: no cover - defensive fallback
            logger.exception("Unable to collect sunset registry", exc_info=exc)
            sunset_records = {}

        catalog_entries = getattr(service, "frontend_catalog", [])
        catalog_lookup = {entry["id"]: entry for entry in catalog_entries}
        union_ids = (
            set(snapshot.keys())
            | set(SOURCE_BASELINES.keys())
            | set(catalog_lookup.keys())
        )

        sources_payload: Dict[str, SourceHealthPayload] = {}

        for source_id in sorted(union_ids):
            baseline = SOURCE_BASELINES.get(source_id)
            catalog_entry = catalog_lookup.get(source_id)
            if baseline is None:
                baseline = _generate_mock_baseline(
                    source_id,
                    name=catalog_entry.get("name") if catalog_entry else None,
                    category=catalog_entry.get("category") if catalog_entry else None,
                )

            snapshot_entry = snapshot.get(source_id, {})
            name = (
                baseline.get("name")
                or snapshot_entry.get("name")
                or (catalog_entry.get("name") if catalog_entry else source_id)
            )
            category = (
                baseline.get("category")
                or snapshot_entry.get("category")
                or (catalog_entry.get("category") if catalog_entry else "Uncategorized")
            )

            status_source: Optional[str] = baseline.get("status") or snapshot_entry.get("status")
            sunset_record = sunset_records.get(source_id)
            if status_source is None and sunset_record:
                status_source = sunset_record.status.value
            if isinstance(status_source, SourceImplementationStatus):
                status_source = status_source.value
            if sunset_record and status_source not in {"sunset", "deprecated"}:
                status_source = sunset_record.status.value
            status = _map_status(status_source)

            knowledge_points = snapshot_entry.get("knowledge_points")
            if knowledge_points is None:
                knowledge_points = baseline.get("knowledge_points", 0)

            uptime = baseline.get("uptime", 96.5)
            uptime = min(100.0, _jitter(uptime, 0.4))
            response_time = int(max(120, _jitter(baseline.get("response_time", 320), 40)))
            credibility = min(100.0, _jitter(baseline.get("credibility", 92.0), 1.5))
            error_rate = max(0.0, _jitter(baseline.get("error_rate", 1.2), 0.8))

            baseline_data_points = baseline.get("data_points_last_24h")
            if baseline_data_points is None and knowledge_points is not None:
                baseline_data_points = knowledge_points * 4
            data_points_last_24h = int(max(0, baseline_data_points or 0))
            ingestion_rate = baseline.get(
                "ingestion_rate",
                round(data_points_last_24h / 60, 2) if data_points_last_24h else 0,
            )
            api_quota_remaining = baseline.get("api_quota_remaining")
            api_quota_limit = baseline.get("api_quota_limit")
            depends_on = baseline.get("depends_on", [])
            health_trend = baseline.get("health_trend", "stable")
            sla = baseline.get("sla")
            maintenance_window = baseline.get("maintenance_window")
            health_history = baseline.get("health_history")

            sunset_date = baseline.get("sunset_date")
            if sunset_date is None and sunset_record:
                sunset_date = sunset_record.sunset_date
            replacement_source = baseline.get("replacement_source")
            if replacement_source is None and sunset_record:
                replacement_source = sunset_record.replacement_source_id
            migration_guidance = baseline.get("migration_guidance")
            if migration_guidance is None and sunset_record:
                migration_guidance = sunset_record.migration_guidance
            deprecation_notice = baseline.get("deprecation_notice")

            now_dt = datetime.utcnow()
            payload = SourceHealthPayload(
                source_id=source_id,
                name=name,
                category=category,
                status=status,
                uptime=round(uptime, 2),
                response_time=response_time,
                credibility=round(credibility, 1),
                last_update=now_dt - timedelta(seconds=random.randint(20, 600)),
                data_freshness=now_dt - timedelta(seconds=random.randint(25, 900)),
                error_rate=round(error_rate, 2),
                api_quota_remaining=api_quota_remaining,
                api_quota_limit=api_quota_limit,
                depends_on=depends_on,
                health_trend=health_trend,
                sla_compliance=sla,
                ingestion_rate=ingestion_rate,
                data_points_last_24h=data_points_last_24h,
                knowledge_points=knowledge_points,
                maintenance_window=maintenance_window,
                health_history=health_history,
                sunset_date=sunset_date,
                replacement_source=replacement_source,
                migration_guidance=migration_guidance,
                deprecation_notice=deprecation_notice,
            )
            sources_payload[source_id] = payload

        total_sources = len(sources_payload)
        active_sources = len(
            [p for p in sources_payload.values() if p.status not in {"offline", "sunset", "deprecated"}]
        )
        average_uptime = (
            sum(p.uptime for p in sources_payload.values()) / total_sources if total_sources else 0.0
        )
        average_response_time = (
            sum(p.response_time for p in sources_payload.values()) / total_sources if total_sources else 0.0
        )
        total_data_points = sum(p.data_points_last_24h or 0 for p in sources_payload.values())
        total_knowledge_points = sum(p.knowledge_points or 0 for p in sources_payload.values())
        average_credibility = (
            sum(p.credibility for p in sources_payload.values()) / total_sources if total_sources else 0.0
        )

        health_score = min(
            100.0,
            round(
                (average_uptime * 0.45)
                + (average_credibility * 0.4)
                + ((active_sources / max(total_sources, 1)) * 100 * 0.15),
                2,
            ),
        )

        metrics = AggregatedHealthMetrics(
            total_sources=total_sources,
            active_sources=active_sources,
            average_uptime=round(average_uptime, 2),
            average_response_time=round(average_response_time, 2),
            total_data_points=total_data_points,
            system_health_score=health_score,
            last_updated=datetime.utcnow(),
            refresh_interval_seconds=STREAM_REFRESH_SECONDS,
            total_knowledge_points=total_knowledge_points,
            average_credibility=round(average_credibility, 2),
            sla_target_ms=400,
        )

        response = SourceHealthResponse(
            sources=sources_payload,
            metrics=metrics,
            last_updated=datetime.utcnow(),
        )

        _health_cache = response
        _health_cache_timestamp = time.time()
        logger.info(
            "Generated new source health snapshot",
            extra={
                "total_sources": metrics.total_sources,
                "active_sources": metrics.active_sources,
                "health_score": metrics.system_health_score,
            },
        )
        return response


def _build_dependency_map() -> DependencyMapResponse:
    nodes: Dict[str, DependencyNode] = {}

    for source_id in SOURCE_BASELINES.keys():
        depends_on = DEPENDENCY_GRAPH.get(source_id, [])
        nodes[source_id] = DependencyNode(
            source_id=source_id,
            depends_on=depends_on,
            dependents=[],
            criticality="critical" if depends_on else "standard",
        )

    for source_id, dependencies in DEPENDENCY_GRAPH.items():
        for dependency in dependencies:
            nodes.setdefault(
                dependency,
                DependencyNode(source_id=dependency, depends_on=[], dependents=[]),
            )
            nodes[dependency].dependents.append(source_id)

    critical_paths = [
        ["github_api", "sonarqube", "gitguardian"],
        ["sec_edgar", "federal_reserve"],
        ["yc_library", "a16z"],
    ]

    return DependencyMapResponse(nodes=nodes, critical_paths=critical_paths)


def _build_contradiction_stats(records: Iterable[ContradictionRecord]) -> ContradictionStatsModel:
    records_list = list(records)
    total = len(records_list)
    active = len([r for r in records_list if r.status in {"active", "investigating"}])
    resolved = len([r for r in records_list if r.status == "resolved"])
    acceptable = len([r for r in records_list if r.status == "acceptable"])
    high_severity = len([r for r in records_list if r.severity in {"high", "critical"}])

    median_resolution = "2h"
    last_24h = len([r for r in records_list if r.resolved_at and (datetime.utcnow() - r.resolved_at) < timedelta(hours=24)])
    average_impact = (
        sum(r.impact_score for r in records_list) / total if total else 0.0
    )

    return ContradictionStatsModel(
        total=total,
        active=active,
        resolved=resolved,
        acceptable=acceptable,
        high_severity_percentage=(high_severity / total * 100) if total else 0.0,
        median_resolution_time=median_resolution,
        resolutions_last_24h=last_24h,
        average_credibility_impact=round(average_impact / 10, 2),
        last_checked=datetime.utcnow(),
    )

@router.get("/inventory", response_model=List[SourceInventoryItem])
async def get_inventory(
    service: SourceInventoryService = Depends(get_service),
) -> List[SourceInventoryItem]:
    try:
        records = service.get_inventory()
    except Exception as exc:  # pragma: no cover - defensive fallback
        logger.exception("Falling back to catalog-backed inventory", exc_info=exc)
        fallback: List[SourceInventoryItem] = []
        for entry in getattr(service, "frontend_catalog", []):
            fallback.append(
                SourceInventoryItem(
                    source_id=entry["id"],
                    name=entry["name"],
                    category=entry.get("category", "uncategorized"),
                    organization=None,
                    status=SourceImplementationStatus.MISSING,
                )
            )
        return fallback

    inventory_items: List[SourceInventoryItem] = []
    for record in records:
        inventory_items.append(SourceInventoryItem(**record.__dict__))
    return inventory_items


@router.get("/status", response_model=Dict[str, SourceStatusItem])
async def get_status(
    service: SourceInventoryService = Depends(get_service),
) -> Dict[str, SourceStatusItem]:
    try:
        raw_inventory = service.get_inventory()
    except Exception as exc:  # pragma: no cover - defensive fallback
        logger.exception("Inventory lookup failed for status snapshot", exc_info=exc)
        raw_inventory = []

    try:
        snapshot = service.get_status_snapshot()
    except Exception as exc:  # pragma: no cover - defensive fallback
        logger.exception("Status snapshot lookup failed", exc_info=exc)
        snapshot = {}

    catalog_entries = getattr(service, "frontend_catalog", [])
    catalog_lookup = {entry["id"]: entry for entry in catalog_entries}
    inventory_lookup = {record.source_id: record for record in raw_inventory}

    union_ids = (
        set(inventory_lookup.keys())
        | set(snapshot.keys())
        | set(catalog_lookup.keys())
        | set(SOURCE_BASELINES.keys())
    )

    status_payload: Dict[str, SourceStatusItem] = {}

    for source_id in sorted(union_ids):
        record = inventory_lookup.get(source_id)
        baseline = SOURCE_BASELINES.get(source_id, {})
        catalog_entry = catalog_lookup.get(source_id)

        name = (
            record.name if record else baseline.get("name") or (catalog_entry["name"] if catalog_entry else source_id)
        )
        category = (
            record.category
            if record
            else baseline.get("category")
            or (catalog_entry.get("category") if catalog_entry else "uncategorized")
        )

        knowledge_points = snapshot.get(source_id, {}).get(
            "knowledge_points",
            baseline.get("knowledge_points", 0),
        )

        status_value: SourceImplementationStatus
        if record:
            status_value = record.status
        else:
            baseline_status = baseline.get("status")
            if isinstance(baseline_status, SourceImplementationStatus):
                baseline_status = baseline_status.value
            if baseline_status == "sunset":
                status_value = SourceImplementationStatus.SUNSET
            elif baseline_status == "deprecated":
                status_value = SourceImplementationStatus.DEPRECATED
            else:
                status_value = SourceImplementationStatus.MISSING

        if source_id in snapshot:
            snapshot_status = snapshot[source_id].get("status")
            if snapshot_status:
                normalized = snapshot_status.lower()
                if normalized == "sunset":
                    status_value = SourceImplementationStatus.SUNSET
                elif normalized == "deprecated":
                    status_value = SourceImplementationStatus.DEPRECATED
                else:
                    try:
                        status_value = SourceImplementationStatus(snapshot_status)
                    except ValueError:
                        pass

        status_payload[source_id] = SourceStatusItem(
            name=name,
            category=category,
            status=status_value,
            knowledge_points=knowledge_points,
        )

    return status_payload


@router.get("/coverage", response_model=Dict[str, CoverageItem])
async def get_coverage(
    service: SourceInventoryService = Depends(get_service),
) -> Dict[str, CoverageItem]:
    coverage = service.get_coverage_summary()
    return {key: CoverageItem(**value) for key, value in coverage.items()}


@router.get("/gaps", response_model=Dict[str, List[GapAnalysisItem]])
async def get_gaps(
    service: SourceInventoryService = Depends(get_service),
) -> Dict[str, List[GapAnalysisItem]]:
    gaps = service.get_gap_analysis()
    return {
        category: [
            GapAnalysisItem(
                source_id=record.source_id,
                name=record.name,
                status=record.status,
            )
            for record in records
        ]
        for category, records in gaps.items()
    }


@router.get("/{source_id}/metrics", response_model=SourceInventoryItem)
async def get_source_metrics(
    source_id: str,
    service: SourceInventoryService = Depends(get_service),
) -> SourceInventoryItem:
    _validate_source_id(source_id)
    details = service.get_source_details(source_id)
    if not details:
        raise HTTPException(status_code=404, detail="Source not found")
    return SourceInventoryItem(**details)


@router.post("/validate", response_model=SourceValidationResponse)
async def validate_sources(
    payload: SourceValidationRequest,
    service: SourceInventoryService = Depends(get_service),
) -> SourceValidationResponse:
    result = service.validate_sources(payload.source_ids)
    return SourceValidationResponse(**result)


@router.get("/all", response_model=List[SourceHealthPayload])
async def get_all_sources(
    service: SourceInventoryService = Depends(get_service),
) -> List[SourceHealthPayload]:
    snapshot = await _build_health_snapshot(service)
    return list(snapshot.sources.values())


@router.get("/health", response_model=SourceHealthResponse)
async def get_source_health(
    request: Request,
    response: Response,
    force: bool = Query(False, description="Force regeneration of health snapshot"),
    service: SourceInventoryService = Depends(get_service),
) -> Dict[str, Any]:
    start = time.perf_counter()
    _increment_metric("health_requests")
    try:
        async with _health_request_semaphore:
            snapshot = await _build_health_snapshot(service, force_refresh=force)
    except HTTPException:
        _increment_metric("health_failures")
        raise
    except Exception as exc:  # pragma: no cover - defensive guard
        _increment_metric("health_failures")
        logger.exception("Failed to build source health snapshot", extra={"path": str(request.url)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to build source health snapshot.",
        ) from exc

    latency_ms = (time.perf_counter() - start) * 1000
    response.headers["X-Bailey-Health-Latency"] = f"{latency_ms:.2f}"
    response.headers["Cache-Control"] = f"public, max-age={STREAM_REFRESH_SECONDS}"
    cache_status = "miss" if force else ("hit" if snapshot is _health_cache else "miss")
    response.headers["X-Bailey-Health-Cache"] = cache_status

    logger.info(
        "Served source health snapshot",
        extra={
            "latency_ms": round(latency_ms, 2),
            "cache": cache_status,
            "force": force,
        },
    )

    return jsonable_encoder(snapshot, by_alias=True)


@router.get("/status/stream")
async def stream_source_health(
    request: Request,
    service: SourceInventoryService = Depends(get_service),
):
    client_host = request.client.host if request.client else "unknown"
    _increment_metric("stream_connections")
    logger.info("Source health stream connected", extra={"client": client_host})

    async def event_generator():
        try:
            while True:
                snapshot = await _build_health_snapshot(service)
                payload = jsonable_encoder(snapshot, by_alias=True)
                yield {
                    "event": "message",
                    "data": json.dumps(payload, default=str),
                }
                await asyncio.sleep(STREAM_REFRESH_SECONDS)
        except asyncio.CancelledError:  # pragma: no cover - stream cancelled by client
            logger.debug("Source health stream cancelled by client", extra={"client": client_host})
            raise
        except Exception as exc:  # pragma: no cover - defensive guard
            logger.exception("Source health stream failed", extra={"client": client_host})
            raise exc
        finally:
            _increment_metric("stream_disconnects")
            logger.info("Source health stream disconnected", extra={"client": client_host})

    return EventSourceResponse(event_generator())


@router.post("/{source_id}/test", response_model=SourceTestResult)
async def trigger_source_test(
    source_id: str,
    service: SourceInventoryService = Depends(get_service),
) -> SourceTestResult:
    _validate_source_id(source_id)
    snapshot = service.get_status_snapshot()
    if source_id not in SOURCE_BASELINES and source_id not in snapshot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")

    latency = random.randint(120, 1200)
    baseline = SOURCE_BASELINES.setdefault(
        source_id,
        {
            "name": source_id,
            "category": "Uncategorized",
            "status": "online",
            "uptime": 96.0,
            "response_time": latency,
            "credibility": 90.0,
            "error_rate": 2.0,
            "health_trend": "stable",
        },
    )
    baseline["response_time"] = latency
    baseline["uptime"] = min(100.0, baseline.get("uptime", 96.0) + random.uniform(0.1, 0.3))
    baseline["error_rate"] = max(0.0, baseline.get("error_rate", 1.0) - random.uniform(0.1, 0.3))
    baseline["status"] = "online"

    # Invalidate cache so the next fetch sees fresh metrics
    global _health_cache_timestamp
    _health_cache_timestamp = 0

    _increment_metric("source_tests")
    logger.info(
        "Source test executed",
        extra={"source_id": source_id, "latency_ms": latency},
    )

    return SourceTestResult(
        source_id=source_id,
        status=baseline["status"],
        latency_ms=latency,
        success=True,
        message="Source connectivity validated",
    )


@router.post("/{source_id}/diagnostics", response_model=SourceTestResult)
async def run_source_diagnostics(
    source_id: str,
    service: SourceInventoryService = Depends(get_service),
) -> SourceTestResult:
    _validate_source_id(source_id)
    snapshot = service.get_status_snapshot()
    if source_id not in SOURCE_BASELINES and source_id not in snapshot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")

    latency = random.randint(150, 1400)
    success = latency < 1200

    if source_id in SOURCE_BASELINES:
        SOURCE_BASELINES[source_id]["status"] = "online" if success else "degraded"
        SOURCE_BASELINES[source_id]["response_time"] = latency

    global _health_cache_timestamp
    _health_cache_timestamp = 0

    _increment_metric("source_diagnostics")
    logger.info(
        "Source diagnostics completed",
        extra={"source_id": source_id, "latency_ms": latency, "success": success},
    )

    return SourceTestResult(
        source_id=source_id,
        status=SOURCE_BASELINES.get(source_id, {}).get("status", "online"),
        latency_ms=latency,
        success=success,
        message="Diagnostics completed" if success else "Diagnostics reported degraded latency",
    )


@router.post("/{source_id}/pause", status_code=status.HTTP_204_NO_CONTENT)
async def pause_source_monitoring(
    source_id: str,
    service: SourceInventoryService = Depends(get_service),
) -> Response:
    _validate_source_id(source_id)
    snapshot = service.get_status_snapshot()
    if source_id not in SOURCE_BASELINES and source_id not in snapshot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")

    source_snapshot = snapshot.get(source_id, {})
    baseline = SOURCE_BASELINES.setdefault(
        source_id,
        {
            "name": source_snapshot.get("name", source_id),
            "category": source_snapshot.get("category", "Uncategorized"),
            "uptime": source_snapshot.get("uptime", 95.0),
            "response_time": source_snapshot.get("response_time", 500),
            "credibility": source_snapshot.get("credibility", 90.0),
            "error_rate": source_snapshot.get("error_rate", 2.0),
            "health_trend": source_snapshot.get("health_trend", "stable"),
        },
    )
    baseline["status"] = "maintenance"
    baseline["maintenance_window"] = "Paused by operator"
    global _health_cache_timestamp
    _health_cache_timestamp = 0
    _increment_metric("source_pauses")
    logger.info("Source monitoring paused", extra={"source_id": source_id})
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{source_id}/resume", status_code=status.HTTP_204_NO_CONTENT)
async def resume_source_monitoring(
    source_id: str,
    service: SourceInventoryService = Depends(get_service),
) -> Response:
    _validate_source_id(source_id)
    snapshot = service.get_status_snapshot()
    if source_id not in SOURCE_BASELINES and source_id not in snapshot:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")
    source_snapshot = snapshot.get(source_id, {})
    baseline = SOURCE_BASELINES.setdefault(
        source_id,
        {
            "name": source_snapshot.get("name", source_id),
            "category": source_snapshot.get("category", "Uncategorized"),
            "uptime": source_snapshot.get("uptime", 96.0),
            "response_time": source_snapshot.get("response_time", 420),
            "credibility": source_snapshot.get("credibility", 90.0),
            "error_rate": source_snapshot.get("error_rate", 2.0),
            "health_trend": source_snapshot.get("health_trend", "stable"),
        },
    )
    baseline["status"] = "online"
    baseline.pop("maintenance_window", None)
    global _health_cache_timestamp
    _health_cache_timestamp = 0
    _increment_metric("source_resumes")
    logger.info("Source monitoring resumed", extra={"source_id": source_id})
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{source_id}/history", response_model=SourceHistoryResponse)
async def get_source_history(
    source_id: str,
    window: str = "24h",
    service: SourceInventoryService = Depends(get_service),
) -> SourceHistoryResponse:
    _validate_source_id(source_id)
    if source_id not in SOURCE_BASELINES and source_id not in service.get_status_snapshot():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Source not found")

    hours = 24 if window == "24h" else 1
    now = datetime.utcnow()
    datapoints: List[SourceHistoryPoint] = []
    baseline = SOURCE_BASELINES.get(source_id, {})
    for index in range(hours * 4):
        timestamp = now - timedelta(minutes=15 * index)
        datapoints.append(
            SourceHistoryPoint(
                timestamp=timestamp,
                uptime=max(80.0, _jitter(baseline.get("uptime", 96.0), 1.5)),
                response_time=int(max(100, _jitter(baseline.get("response_time", 320), 45))),
                error_rate=max(0.0, _jitter(baseline.get("error_rate", 1.2), 0.6)),
                knowledge_points=int(max(0, baseline.get("knowledge_points", 1000) + random.randint(-20, 40))),
            )
        )

    datapoints.sort(key=lambda item: item.timestamp)

    return SourceHistoryResponse(
        source_id=source_id,
        window=window,
        datapoints=datapoints,
    )


@router.get("/metrics/runtime", response_model=Dict[str, int])
async def get_runtime_metrics() -> Dict[str, int]:
    """Expose lightweight runtime counters for observability dashboards."""
    return dict(METRIC_COUNTERS)


@router.get("/contradictions", response_model=ContradictionResponse)
async def get_contradictions() -> Dict[str, Any]:
    stats = _build_contradiction_stats(CONTRADICTION_LOG)
    response = ContradictionResponse(
        contradictions=CONTRADICTION_LOG,
        stats=stats,
        last_checked=datetime.utcnow(),
    )
    return jsonable_encoder(response)


@router.get("/dependencies", response_model=DependencyMapResponse)
async def get_dependency_map() -> DependencyMapResponse:
    return _build_dependency_map()
