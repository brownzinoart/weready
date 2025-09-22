"""Design and user experience data source connectors."""

from __future__ import annotations

import logging
import xml.etree.ElementTree as ET
from typing import List, Optional

import httpx

from .base import BaileyConnector
from ..bailey import DataFreshness


class _RSSConnector(BaileyConnector):
    feed_url: str = ""
    category: str = "design_experience"

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []

        if not self.feed_url:
            logging.error("%s missing feed_url", self.__class__.__name__)
            return knowledge_ids

        try:
            response = await self._request("GET", self.feed_url, headers={"User-Agent": "WeReady Intelligence"})
            root = ET.fromstring(response.text)
            for item in root.findall(".//item")[:5]:
                title = (item.findtext("title") or "").strip()
                link = (item.findtext("link") or "").strip()
                content = f"{self.source_id} UX insight: {title}"
                metadata = {"link": link}
                point_id = await self._ingest_point(
                    content=content,
                    category=self.category,
                    freshness=DataFreshness.WEEKLY,
                    confidence=0.74,
                    metadata=metadata,
                )
                knowledge_ids.append(point_id)
        except Exception as exc:  # pragma: no cover
            logging.error("%s RSS ingestion failed: %s", self.__class__.__name__, exc)

        return knowledge_ids


class NielsenNormanGroupConnector(_RSSConnector):
    feed_url = "https://www.nngroup.com/articles/feed/"

    def __init__(self) -> None:
        super().__init__("nielsen_norman_group")


class BaymardInstituteConnector(_RSSConnector):
    feed_url = "https://baymard.com/blog/feed"

    def __init__(self) -> None:
        super().__init__("baymard_institute")


class WebAIMConnector(_RSSConnector):
    feed_url = "https://webaim.org/blog/feed/"

    def __init__(self) -> None:
        super().__init__("webaim")


class GoogleDesignConnector(_RSSConnector):
    feed_url = "https://design.google/library/feed/"

    def __init__(self) -> None:
        super().__init__("google_design")


class AppleHIGConnector(_RSSConnector):
    feed_url = "https://developer.apple.com/news/rss/news.rss"

    def __init__(self) -> None:
        super().__init__("apple_hig")


class ChromeUXReportConnector(BaileyConnector):
    """Query Chrome UX report API for performance metrics."""

    def __init__(self) -> None:
        super().__init__("chrome_ux_report")
        self.api_key = self.get_env("CHROME_UX_REPORT_API_KEY")
        origins = self.get_env("CHROME_UX_ORIGINS") or "https://weready.ai"
        self.origins = [origin.strip() for origin in origins.split(",") if origin.strip()]
        self.endpoint = "https://chromeuxreport.googleapis.com/v1/records:query"

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []

        if not self.api_key:
            logging.warning("ChromeUXReportConnector requires CHROME_UX_REPORT_API_KEY")
            return knowledge_ids

        headers = {"Content-Type": "application/json"}

        for origin in self.origins:
            payload = {
                "origin": origin,
                "metrics": ["largest_contentful_paint", "first_input_delay", "cumulative_layout_shift"],
            }
            try:
                response = await self._post_json(
                    f"{self.endpoint}?key={self.api_key}",
                    data=payload,
                    headers=headers,
                )
                metrics = response.get("record", {}).get("metrics", {})
                for metric_name, metric in metrics.items():
                    percentiles = metric.get("percentiles", {})
                    p75 = percentiles.get("p75")
                    content = f"Chrome UX {metric_name} p75 for {origin}: {p75}"
                    point_id = await self._ingest_point(
                        content=content,
                        category="performance_metrics",
                        freshness=DataFreshness.MONTHLY,
                        confidence=0.76,
                        metadata={"metric": metric_name, "percentiles": percentiles, "origin": origin},
                        numerical_value=float(p75) if isinstance(p75, (int, float)) else None,
                    )
                    knowledge_ids.append(point_id)
            except httpx.HTTPStatusError as exc:
                logging.error("Chrome UX report API error for %s: %s", origin, exc)
            except Exception as exc:  # pragma: no cover
                logging.error("Chrome UX ingestion failure for %s: %s", origin, exc)

        return knowledge_ids


__all__ = [
    "NielsenNormanGroupConnector",
    "BaymardInstituteConnector",
    "WebAIMConnector",
    "GoogleDesignConnector",
    "AppleHIGConnector",
    "ChromeUXReportConnector",
]
