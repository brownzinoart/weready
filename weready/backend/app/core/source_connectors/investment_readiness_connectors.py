"""Investment readiness connectors for venture benchmarks."""

from __future__ import annotations

import logging
import xml.etree.ElementTree as ET
from typing import List

from .base import BaileyConnector
from ..bailey import DataFreshness


class _RSSConnector(BaileyConnector):
    feed_url: str = ""
    category: str = "investment_readiness"

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
                summary = (item.findtext("description") or "").strip()
                content = f"{self.source_id} investment insight: {title}"
                metadata = {
                    "link": link,
                    "summary": summary,
                }
                point_id = await self._ingest_point(
                    content=content,
                    category=self.category,
                    freshness=DataFreshness.WEEKLY,
                    confidence=0.72,
                    metadata=metadata,
                )
                knowledge_ids.append(point_id)
        except Exception as exc:  # pragma: no cover
            logging.error("%s RSS ingestion failed: %s", self.__class__.__name__, exc)

        return knowledge_ids


class SequoiaCapitalConnector(_RSSConnector):
    feed_url = "https://www.sequoiacap.com/feed/"

    def __init__(self) -> None:
        super().__init__("sequoia_capital")


class BessemerVenturePartnersConnector(_RSSConnector):
    feed_url = "https://www.bvp.com/feed"

    def __init__(self) -> None:
        super().__init__("bessemer_venture_partners")


class MITEntrepreneurshipConnector(_RSSConnector):
    feed_url = "https://entrepreneurship.mit.edu/feed/"

    def __init__(self) -> None:
        super().__init__("mit_entrepreneurship")


class NVCAConnector(_RSSConnector):
    feed_url = "https://nvca.org/feed/"

    def __init__(self) -> None:
        super().__init__("nvca")


class CBInsightsConnector(_RSSConnector):
    feed_url = "https://www.cbinsights.com/research-feed"

    def __init__(self) -> None:
        super().__init__("cb_insights")


class AngelListConnector(_RSSConnector):
    feed_url = "https://angel.co/blog/rss"

    def __init__(self) -> None:
        super().__init__("angellist")


__all__ = [
    "SequoiaCapitalConnector",
    "BessemerVenturePartnersConnector",
    "MITEntrepreneurshipConnector",
    "NVCAConnector",
    "CBInsightsConnector",
    "AngelListConnector",
]
