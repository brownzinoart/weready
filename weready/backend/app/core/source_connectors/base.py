"""Common infrastructure for Bailey data connectors."""

from __future__ import annotations

import asyncio
import logging
import os
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

import httpx

from ..bailey import DataFreshness, KnowledgePoint, bailey


class BaileyConnector:
    """Base class that all Bailey connectors extend.

    Provides an async HTTP client, basic rate limiting hooks, and helper
    utilities for ingesting knowledge points and recording health signals.
    """

    #: default timeout value for outbound HTTP requests
    DEFAULT_TIMEOUT = 30.0

    #: default delay in seconds between consecutive requests when a connector
    #: needs to be conservative with rate limits but no explicit "+X per Y"
    #: metadata is available.
    DEFAULT_THROTTLE_SECONDS = 0.1

    def __init__(self, source_id: str, *, timeout: Optional[float] = None) -> None:
        self.source_id = source_id
        self.source = bailey.knowledge_sources.get(source_id)
        if not self.source:
            raise ValueError(f"Unknown source: {source_id}")
        self.timeout = timeout or self.DEFAULT_TIMEOUT
        self._client: Optional[httpx.AsyncClient] = None
        self._last_request_ts: Optional[float] = None
        self._health: Dict[str, Any] = {
            "source_id": source_id,
            "last_run_started": None,
            "last_run_completed": None,
            "last_error": None,
            "data_points": 0,
        }

    async def __aenter__(self) -> "BaileyConnector":
        await self._ensure_client()
        self._health["last_run_started"] = datetime.utcnow().isoformat()
        self._health["last_error"] = None
        self._health["data_points"] = 0
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        if exc_val:
            self._health["last_error"] = str(exc_val)
        self._health["last_run_completed"] = datetime.utcnow().isoformat()
        await self.close()

    async def close(self) -> None:
        if self._client:
            await self._client.aclose()
            self._client = None

    async def ingest_data(self) -> List[str]:
        """Perform ingestion for the connector.

        Subclasses must implement this method and return a list of knowledge
        point IDs that were created/updated during the ingestion.
        """

        raise NotImplementedError

    async def _ensure_client(self) -> None:
        if not self._client:
            self._client = httpx.AsyncClient(timeout=self.timeout)

    @property
    def client(self) -> httpx.AsyncClient:
        """Expose the underlying HTTP client for backwards compatibility."""

        if not self._client:
            raise RuntimeError("HTTP client not initialised; use 'async with connector' context")
        return self._client

    async def _request(self, method: str, url: str, **kwargs: Any) -> httpx.Response:
        await self._ensure_client()
        self._respect_rate_limit()
        assert self._client  # for mypy/static analysis
        response = await self._client.request(method, url, **kwargs)
        self._last_request_ts = time.time()
        response.raise_for_status()
        return response

    async def _get_json(self, url: str, **kwargs: Any) -> Any:
        response = await self._request("GET", url, **kwargs)
        try:
            return response.json()
        except Exception as exc:  # pragma: no cover - defensive
            logging.error("Failed to decode JSON from %s: %s", url, exc)
            raise

    async def _post_json(self, url: str, data: Any = None, **kwargs: Any) -> Any:
        response = await self._request("POST", url, json=data, **kwargs)
        try:
            return response.json()
        except Exception as exc:  # pragma: no cover - defensive
            logging.error("Failed to decode JSON from %s: %s", url, exc)
            raise

    def _respect_rate_limit(self) -> None:
        if self.source.rate_limit:
            limit = self.source.rate_limit.lower()
            if "per second" in limit or "/second" in limit:
                time.sleep(max(1.0, self.DEFAULT_THROTTLE_SECONDS))
            elif "per minute" in limit or "/minute" in limit:
                time.sleep(1.0)
            elif "per hour" in limit or "/hour" in limit:
                time.sleep(3.0)
            else:
                time.sleep(self.DEFAULT_THROTTLE_SECONDS)
        elif self._last_request_ts:
            elapsed = time.time() - self._last_request_ts
            if elapsed < self.DEFAULT_THROTTLE_SECONDS:
                time.sleep(self.DEFAULT_THROTTLE_SECONDS - elapsed)

    async def _ingest_point(
        self,
        *,
        content: str,
        category: str,
        freshness: Optional[DataFreshness] = None,
        confidence: float = 0.8,
        metadata: Optional[Dict[str, Any]] = None,
        numerical_value: Optional[float] = None,
    ) -> str:
        point_id = await bailey.ingest_knowledge_point(
            content=content,
            source_id=self.source_id,
            category=category,
            freshness=freshness,
            confidence=confidence,
            metadata=metadata,
            numerical_value=numerical_value,
        )
        self._health["data_points"] += 1
        return point_id

    def get_health_snapshot(self) -> Dict[str, Any]:
        return dict(self._health)

    @staticmethod
    def get_env(name: str, *, required: bool = False) -> Optional[str]:
        value = os.getenv(name)
        if required and not value:
            raise RuntimeError(f"Environment variable {name} is required for this connector")
        return value


__all__ = ["BaileyConnector"]
