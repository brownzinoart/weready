"""Business intelligence connectors for venture and growth insights."""

from __future__ import annotations

import logging
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List

from .base import BaileyConnector
from ..bailey import DataFreshness


class _RSSConnector(BaileyConnector):
    feed_url: str = ""
    category: str = "business_intelligence"

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
                pub_date = item.findtext("pubDate")
                content = f"{self.source_id} insight: {title}"
                metadata = {
                    "link": link,
                    "published": pub_date,
                }
                point_id = await self._ingest_point(
                    content=content,
                    category=self.category,
                    freshness=DataFreshness.WEEKLY,
                    confidence=0.7,
                    metadata=metadata,
                )
                knowledge_ids.append(point_id)
        except Exception as exc:  # pragma: no cover
            logging.error("%s RSS ingestion failed: %s", self.__class__.__name__, exc)

        return knowledge_ids


class FirstRoundCapitalConnector(_RSSConnector):
    feed_url = "https://firstround.com/review/feed/"

    def __init__(self) -> None:
        super().__init__("first_round")


class AndreessenHorowitzConnector(_RSSConnector):
    feed_url = "https://a16z.com/feed/"

    def __init__(self) -> None:
        super().__init__("andreessen_horowitz")


class LeanStartupConnector(_RSSConnector):
    feed_url = "https://leanstartup.co/blog/feed/"

    def __init__(self) -> None:
        super().__init__("lean_startup")


class ProfitWellConnector(_RSSConnector):
    feed_url = "https://www.profitwell.com/recur/all/rss.xml"

    def __init__(self) -> None:
        super().__init__("profitwell")


class HarvardBusinessSchoolConnector(_RSSConnector):
    feed_url = "https://hbswk.hbs.edu/Handlers/Rss.ashx"

    def __init__(self) -> None:
        super().__init__("harvard_business_school")


__all__ = [
    "FirstRoundCapitalConnector",
    "AndreessenHorowitzConnector",
    "LeanStartupConnector",
    "ProfitWellConnector",
    "HarvardBusinessSchoolConnector",
]
