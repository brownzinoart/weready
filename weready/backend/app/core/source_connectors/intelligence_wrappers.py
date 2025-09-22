"""Connector wrappers for standalone intelligence modules."""

from __future__ import annotations

import asyncio
import logging
from typing import Any, Dict, List

from ..bailey import DataFreshness
from ..academic_research_integrator import academic_integrator
from ..design_intelligence import design_intelligence
from ..funding_tracker import funding_tracker
from ..github_intelligence import github_intelligence
from ..government_data_integrator import government_integrator
from .base import BaileyConnector


class _BaseIntegratorConnector(BaileyConnector):
    """Shared helpers for connectors that wrap existing integrator modules."""

    def __init__(self, source_id: str) -> None:
        super().__init__(source_id)

    async def _run_sync(self, func, *args, **kwargs):
        return await asyncio.to_thread(func, *args, **kwargs)


class GovernmentDataIntegratorConnector(_BaseIntegratorConnector):
    def __init__(self) -> None:
        super().__init__("government_data_integrator")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []

        try:
            report = await self._run_sync(government_integrator.get_government_credibility_report)
            status = report.get("integration_status", {})
            metrics = report.get("data_sources", {})

            for source, state in status.items():
                content = f"Government source {source} status: {state}"
                point_id = await self._ingest_point(
                    content=content,
                    category="government_data_status",
                    freshness=DataFreshness.REAL_TIME,
                    confidence=0.92,
                    metadata={"state": state},
                )
                knowledge_ids.append(point_id)

            credibility = metrics.get("credibility_score")
            if credibility:
                content = f"Government data coverage at {credibility}% credibility across {metrics.get('total_sources', 0)} sources"
                point_id = await self._ingest_point(
                    content=content,
                    category="government_data_overview",
                    freshness=DataFreshness.DAILY,
                    confidence=0.9,
                    numerical_value=float(credibility),
                )
                knowledge_ids.append(point_id)

        except Exception as exc:  # pragma: no cover - defensive
            logging.error("Government data integrator ingestion failed: %s", exc)

        return knowledge_ids


class AcademicResearchConnector(_BaseIntegratorConnector):
    def __init__(self) -> None:
        super().__init__("academic_research_integrator")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []

        try:
            papers = await academic_integrator.search_arxiv("startup OR entrepreneurship", max_results=5)
            for paper in papers:
                content = f"{paper.title} ({paper.published_date.date()}) — relevance {paper.relevance_score:.2f}"
                metadata = {
                    "authors": paper.authors,
                    "source": paper.source.value,
                    "doi": paper.doi,
                }
                point_id = await self._ingest_point(
                    content=content,
                    category="academic_research_trends",
                    freshness=DataFreshness.DAILY,
                    confidence=0.85,
                    metadata=metadata,
                )
                knowledge_ids.append(point_id)

            report = await self._run_sync(academic_integrator.get_academic_credibility_report)
            metrics = report.get("research_metrics", {})
            if metrics:
                content = (
                    f"Academic research coverage analyzing {metrics.get('papers_analyzed', 0)} papers with "
                    f"peer review ratio {metrics.get('peer_review_ratio', 0.0):.2f}"
                )
                point_id = await self._ingest_point(
                    content=content,
                    category="academic_research_overview",
                    freshness=DataFreshness.DAILY,
                    confidence=0.8,
                    metadata=metrics,
                )
                knowledge_ids.append(point_id)

        except Exception as exc:  # pragma: no cover
            logging.error("Academic research ingestion failed: %s", exc)

        return knowledge_ids


class DesignIntelligenceConnector(_BaseIntegratorConnector):
    def __init__(self) -> None:
        super().__init__("design_intelligence")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []

        try:
            benchmarks = await self._run_sync(design_intelligence.get_competitive_benchmarks, "accessibility")
            if benchmarks:
                content = (
                    "Accessibility benchmarks: industry average errors "
                    f"{benchmarks.get('industry_average')} with best practice {benchmarks.get('best_practice')}"
                )
                point_id = await self._ingest_point(
                    content=content,
                    category="design_benchmarks",
                    freshness=DataFreshness.MONTHLY,
                    confidence=0.82,
                    metadata=benchmarks,
                )
                knowledge_ids.append(point_id)

            roi = await self._run_sync(design_intelligence.calculate_roi_impact, "accessibility_fix", {})
            content = (
                "Accessibility ROI: mitigate legal risk of ${} with {} payback".format(
                    roi.get("legal_risk_mitigation"), roi.get("payback_period")
                )
            )
            point_id = await self._ingest_point(
                content=content,
                category="design_roi",
                freshness=DataFreshness.MONTHLY,
                confidence=0.78,
                metadata=roi,
            )
            knowledge_ids.append(point_id)

        except Exception as exc:  # pragma: no cover
            logging.error("Design intelligence ingestion failed: %s", exc)

        return knowledge_ids


class GitHubIntelligenceConnector(_BaseIntegratorConnector):
    def __init__(self) -> None:
        super().__init__("github_intelligence")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []

        try:
            report = await self._run_sync(github_intelligence.get_intelligence_report)
            if report:
                metrics = report.get("performance_metrics", {})
                content = (
                    "GitHub intelligence capabilities active. {} repositories analysed with {} API calls.".format(
                        metrics.get("repositories_analyzed", 0), metrics.get("api_calls_made", 0)
                    )
                )
                point_id = await self._ingest_point(
                    content=content,
                    category="github_intelligence",
                    freshness=DataFreshness.DAILY,
                    confidence=0.84,
                    metadata=report,
                )
                knowledge_ids.append(point_id)

        except Exception as exc:  # pragma: no cover
            logging.error("GitHub intelligence ingestion failed: %s", exc)

        return knowledge_ids


class FundingTrackerConnector(_BaseIntegratorConnector):
    def __init__(self) -> None:
        super().__init__("funding_tracker")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []

        try:
            temperatures = await funding_tracker.get_funding_temperature()
            for sector, temp in list(temperatures.items())[:3]:
                content = (
                    f"Funding temperature for {sector}: {temp.temperature:.1f} with {temp.recent_deals} recent deals"
                )
                metadata = {
                    "sector": sector,
                    "temperature": temp.temperature,
                    "recent_deals": temp.recent_deals,
                    "trend": temp.trend_direction,
                    "vc_activity": temp.vc_activity_score,
                }
                point_id = await self._ingest_point(
                    content=content,
                    category="funding_landscape",
                    freshness=DataFreshness.HOURLY,
                    confidence=0.83,
                    metadata=metadata,
                    numerical_value=float(temp.temperature),
                )
                knowledge_ids.append(point_id)

        except Exception as exc:  # pragma: no cover
            logging.error("Funding tracker ingestion failed: %s", exc)

        return knowledge_ids


class MarketTimingConnector(_BaseIntegratorConnector):
    def __init__(self) -> None:
        super().__init__("market_timing_advisor")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []

        try:
            from ..market_timing_advisor import market_timing_advisor  # Local import to avoid circular dependency

            report = await market_timing_advisor.generate_market_timing_report()
            if report:
                content = (
                    "Market timing: overall temperature {0:.1f} with urgency {1}".format(
                        report.get("overall_market_temperature", 0.0), report.get("timing_urgency", "unknown")
                    )
                )
                point_id = await self._ingest_point(
                    content=content,
                    category="market_timing",
                    freshness=DataFreshness.HOURLY,
                    confidence=0.8,
                    metadata=report,
                    numerical_value=float(report.get("overall_market_temperature", 0.0)),
                )
                knowledge_ids.append(point_id)

        except Exception as exc:  # pragma: no cover
            logging.error("Market timing ingestion failed: %s", exc)

        return knowledge_ids


__all__ = [
    "GovernmentDataIntegratorConnector",
    "AcademicResearchConnector",
    "DesignIntelligenceConnector",
    "GitHubIntelligenceConnector",
    "FundingTrackerConnector",
    "MarketTimingConnector",
]
