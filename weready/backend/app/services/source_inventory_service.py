"""Service layer for managing source inventory and coverage."""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Dict, Iterable, List, Optional

from ..core.bailey import KnowledgeSource, bailey
from ..core.bailey_connectors import BaileyDataPipeline, bailey_pipeline


class SourceImplementationStatus(str, Enum):
    IMPLEMENTED = "implemented"
    MOCK = "mock"
    PLANNED = "planned"
    MISSING = "missing"
    SUNSET = "sunset"
    DEPRECATED = "deprecated"


@dataclass
class SourceRecord:
    source_id: str
    name: str
    category: str
    organization: Optional[str]
    status: SourceImplementationStatus
    implementation_notes: Optional[str] = None
    connector_key: Optional[str] = None
    credibility_score: Optional[float] = None
    sunset_date: Optional[datetime] = None
    replacement_source_id: Optional[str] = None
    migration_guidance: Optional[str] = None


FRONTEND_SOURCE_CATALOG: List[Dict[str, str]] = [
    {"id": "github_api", "name": "GitHub", "category": "core_sources"},
    {"id": "arxiv", "name": "arXiv", "category": "core_sources"},
    {"id": "yc_directory", "name": "Y Combinator Directory", "category": "core_sources"},
    {"id": "stackoverflow", "name": "Stack Overflow", "category": "core_sources"},
    {"id": "reddit_startups", "name": "Reddit Startups", "category": "core_sources"},
    {"id": "sonarqube", "name": "SonarQube", "category": "code_quality_sources"},
    {"id": "codeclimate", "name": "Code Climate", "category": "code_quality_sources"},
    {"id": "gitguardian", "name": "GitGuardian", "category": "code_quality_sources"},
    {"id": "semgrep", "name": "Semgrep", "category": "code_quality_sources"},
    {"id": "veracode", "name": "Veracode", "category": "code_quality_sources"},
    {"id": "snyk", "name": "Snyk", "category": "code_quality_sources"},
    {"id": "datadog", "name": "Datadog", "category": "operations_sources"},
    {"id": "pagerduty", "name": "PagerDuty", "category": "operations_sources"},
    {"id": "first_round", "name": "First Round Review", "category": "business_intelligence_sources"},
    {"id": "andreessen_horowitz", "name": "Andreessen Horowitz", "category": "business_intelligence_sources"},
    {"id": "lean_startup", "name": "Lean Startup", "category": "business_intelligence_sources"},
    {"id": "profitwell", "name": "ProfitWell", "category": "business_intelligence_sources"},
    {"id": "harvard_business_school", "name": "Harvard Business School", "category": "business_intelligence_sources"},
    {"id": "sequoia_capital", "name": "Sequoia Capital", "category": "investment_readiness_sources"},
    {"id": "bessemer_venture_partners", "name": "Bessemer Venture Partners", "category": "investment_readiness_sources"},
    {"id": "mit_entrepreneurship", "name": "MIT Entrepreneurship", "category": "investment_readiness_sources"},
    {"id": "nvca", "name": "NVCA", "category": "investment_readiness_sources"},
    {"id": "cb_insights", "name": "CB Insights", "category": "investment_readiness_sources"},
    {"id": "angellist", "name": "AngelList", "category": "investment_readiness_sources"},
    {"id": "nielsen_norman_group", "name": "Nielsen Norman Group", "category": "design_experience_sources"},
    {"id": "baymard_institute", "name": "Baymard Institute", "category": "design_experience_sources"},
    {"id": "webaim", "name": "WebAIM", "category": "design_experience_sources"},
    {"id": "google_design", "name": "Google Design", "category": "design_experience_sources"},
    {"id": "apple_hig", "name": "Apple HIG", "category": "design_experience_sources"},
    {"id": "chrome_ux_report", "name": "Chrome UX Report", "category": "design_experience_sources"},
    {"id": "product_hunt", "name": "Product Hunt", "category": "core_sources"},
    {"id": "census_bfs", "name": "Census BFS", "category": "core_sources"},
]


SUNSET_SOURCES_REGISTRY: Dict[str, Dict[str, object]] = {
    "lean_startup": {
        "status": SourceImplementationStatus.SUNSET,
        "sunset_date": datetime(2024, 6, 30),
        "replacement_source_id": "first_round",
        "migration_guidance": "Lean Startup playbooks are archived; use First Round Review insights going forward.",
        "category": "business_intelligence_sources",
    },
    "profitwell": {
        "status": SourceImplementationStatus.DEPRECATED,
        "sunset_date": datetime(2024, 9, 30),
        "replacement_source_id": "cb_insights",
        "migration_guidance": "ProfitWell data is merging into Paddle; rely on CB Insights benchmarks instead.",
        "category": "business_intelligence_sources",
    },
    "pagerduty": {
        "status": SourceImplementationStatus.SUNSET,
        "sunset_date": datetime(2025, 1, 15),
        "replacement_source_id": "datadog",
        "migration_guidance": "PagerDuty signals consolidate into Datadog incident streams.",
        "category": "operations_sources",
    },
}


class SourceInventoryService:
    """Aggregate information about backend source implementation and coverage."""

    def __init__(
        self,
        pipeline: Optional[BaileyDataPipeline] = None,
        *,
        frontend_catalog: Optional[List[Dict[str, str]]] = None,
    ) -> None:
        self.pipeline = pipeline or bailey_pipeline
        self.frontend_catalog = frontend_catalog or FRONTEND_SOURCE_CATALOG

    # ------------------------------------------------------------------
    # Inventory and status helpers
    # ------------------------------------------------------------------

    def _collect_connector_index(self) -> Dict[str, Dict[str, str]]:
        index: Dict[str, Dict[str, str]] = {}
        for connector_key, connector_cls in self.pipeline.connectors.items():
            try:
                connector = connector_cls()
                index[connector.source_id] = {
                    "connector_key": connector_key,
                    "group": self.pipeline.connector_metadata.get(connector_key, {}).get("group", "unknown"),
                    "name": self.pipeline.connector_metadata.get(connector_key, {}).get("name", connector_key),
                }
            except Exception:
                continue
        return index

    def _build_source_record(
        self, source_id: str, knowledge: Optional[KnowledgeSource], connector_index: Dict[str, Dict[str, str]]
    ) -> SourceRecord:
        sunset_info = SUNSET_SOURCES_REGISTRY.get(source_id)
        if source_id in connector_index:
            status = SourceImplementationStatus.IMPLEMENTED
            connector_meta = connector_index[source_id]
            connector_key = connector_meta["connector_key"]
            category = connector_meta.get("group", "uncategorized")
        elif knowledge:
            status = SourceImplementationStatus.PLANNED
            connector_key = None
            category = self._guess_category(source_id)
        else:
            status = SourceImplementationStatus.MISSING
            connector_key = None
            category = self._guess_category(source_id)

        if sunset_info:
            status = sunset_info.get("status", SourceImplementationStatus.SUNSET)
            category = sunset_info.get("category", category)

        return SourceRecord(
            source_id=source_id,
            name=knowledge.name if knowledge else source_id,
            organization=knowledge.organization if knowledge else None,
            credibility_score=knowledge.credibility_score if knowledge else None,
            category=category,
            status=status,
            connector_key=connector_key,
            sunset_date=sunset_info.get("sunset_date") if sunset_info else None,
            replacement_source_id=sunset_info.get("replacement_source_id") if sunset_info else None,
            migration_guidance=sunset_info.get("migration_guidance") if sunset_info else None,
        )

    def _guess_category(self, source_id: str) -> str:
        if source_id in SUNSET_SOURCES_REGISTRY:
            return SUNSET_SOURCES_REGISTRY[source_id].get("category", "uncategorized")
        for entry in self.frontend_catalog:
            if entry["id"] == source_id:
                return entry.get("category", "uncategorized")
        return "uncategorized"

    # ------------------------------------------------------------------
    # Public interface
    # ------------------------------------------------------------------

    def get_inventory(self) -> List[SourceRecord]:
        connector_index = self._collect_connector_index()
        records: List[SourceRecord] = []
        seen_ids: set[str] = set()

        for source_id, knowledge in bailey.knowledge_sources.items():
            record = self._build_source_record(source_id, knowledge, connector_index)
            records.append(record)
            seen_ids.add(source_id)

        for entry in self.frontend_catalog:
            source_id = entry["id"]
            if source_id in seen_ids:
                continue
            records.append(
                self._build_source_record(source_id, None, connector_index)
            )
            seen_ids.add(source_id)

        return records

    def get_inventory_by_category(self) -> Dict[str, List[SourceRecord]]:
        inventory = self.get_inventory()
        grouped: Dict[str, List[SourceRecord]] = {}
        for record in inventory:
            grouped.setdefault(record.category, []).append(record)
        return grouped

    def get_status_snapshot(self) -> Dict[str, Dict[str, object]]:
        inventory = self.get_inventory()
        knowledge_counts = Counter(
            point.source.name for point in bailey.knowledge_points.values() if point.source
        )
        snapshot: Dict[str, Dict[str, object]] = {}
        for record in inventory:
            snapshot[record.source_id] = {
                "name": record.name,
                "category": record.category,
                "status": record.status.value,
                "knowledge_points": knowledge_counts.get(record.name, 0),
            }
        return snapshot

    def get_coverage_summary(self) -> Dict[str, Dict[str, float]]:
        grouped = self.get_inventory_by_category()
        coverage: Dict[str, Dict[str, float]] = {}
        for category, records in grouped.items():
            total = len(records)
            implemented = len([r for r in records if r.status == SourceImplementationStatus.IMPLEMENTED])
            coverage[category] = {
                "implemented": implemented,
                "total": total,
                "coverage_pct": round((implemented / total) * 100, 1) if total else 0.0,
            }
        return coverage

    def get_gap_analysis(self) -> Dict[str, List[SourceRecord]]:
        inventory = self.get_inventory()
        gaps = [record for record in inventory if record.status != SourceImplementationStatus.IMPLEMENTED]
        grouped: Dict[str, List[SourceRecord]] = {}
        for record in gaps:
            grouped.setdefault(record.category, []).append(record)
        return grouped

    def get_source_details(self, source_id: str) -> Optional[Dict[str, object]]:
        connector_index = self._collect_connector_index()
        knowledge = bailey.knowledge_sources.get(source_id)
        if not knowledge and source_id not in connector_index:
            return None

        record = self._build_source_record(source_id, knowledge, connector_index)
        return {
            "source_id": record.source_id,
            "name": record.name,
            "category": record.category,
            "status": record.status.value,
            "organization": record.organization,
            "credibility_score": record.credibility_score,
            "connector_key": record.connector_key,
            "sunset_date": record.sunset_date.isoformat() if record.sunset_date else None,
            "replacement_source_id": record.replacement_source_id,
            "migration_guidance": record.migration_guidance,
        }

    def get_sunset_sources(self) -> List[SourceRecord]:
        connector_index = self._collect_connector_index()
        sunset_records: List[SourceRecord] = []
        for source_id in SUNSET_SOURCES_REGISTRY.keys():
            knowledge = bailey.knowledge_sources.get(source_id)
            sunset_records.append(
                self._build_source_record(source_id, knowledge, connector_index)
            )
        return sunset_records

    def validate_sources(self, frontend_sources: Optional[Iterable[str]] = None) -> Dict[str, object]:
        frontend_slugs = set(frontend_sources or [entry["id"] for entry in self.frontend_catalog])
        inventory = self.get_inventory()
        implemented = {record.source_id for record in inventory if record.status == SourceImplementationStatus.IMPLEMENTED}
        missing = sorted(frontend_slugs - implemented)
        return {
            "all_sources_covered": not missing,
            "missing_sources": missing,
            "implemented_count": len(implemented),
            "expected_count": len(frontend_slugs),
        }


# Singleton instance for convenience
source_inventory_service = SourceInventoryService()
