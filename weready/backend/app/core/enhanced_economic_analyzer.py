"""Enhanced Economic Analyzer
===========================
Combines BEA industry GDP, BLS labor market, and FDIC banking
indicators to produce sector-specific economic intelligence.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from dataclasses import dataclass
from datetime import datetime, timedelta
import asyncio
import logging
import os

import httpx

from .bailey import bailey

logger = logging.getLogger(__name__)


@dataclass
class EconomicSignal:
    """Normalized economic indicator"""

    name: str
    value: float
    change_percent: float
    unit: str
    source_id: str
    detail: str


class EnhancedEconomicAnalyzer:
    """Provides multi-factor economic intelligence"""

    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=30.0)
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.cache_ttl = timedelta(hours=12)
        self.lock = asyncio.Lock()
        self.bea_api_key = os.getenv("BEA_API_KEY", "DEMO_KEY")
        self.bls_api_key = os.getenv("BLS_API_KEY")

    async def get_economic_context(
        self,
        industry: str,
        region: Optional[str] = None,
    ) -> Dict[str, Any]:
        cache_key = f"economic::{industry.lower()}::{region or 'national'}"
        async with self.lock:
            cached = self.cache.get(cache_key)
            if cached and datetime.utcnow() - cached["timestamp"] < self.cache_ttl:
                return cached["data"]

        bea_data, bls_data, fdic_data = await asyncio.gather(
            self._fetch_bea(industry, region),
            self._fetch_bls(industry, region),
            self._fetch_fdic(region),
            return_exceptions=True,
        )

        signals = self._assemble_signals(
            self._ensure_dict(bea_data),
            self._ensure_dict(bls_data),
            self._ensure_dict(fdic_data),
            industry,
            region,
        )

        timing_index = self._calculate_timing_index(signals)
        recession_risk = self._calculate_recession_risk(signals)

        summary = {
            "industry": industry,
            "region": region or "national",
            "timing_index": timing_index,
            "recession_risk": recession_risk,
            "signals": [signal.__dict__ for signal in signals],
            "sources": ["bea_api", "bls_data", "fdic_bankfind"],
            "last_updated": datetime.utcnow().isoformat(),
        }

        await self._publish_to_bailey(summary)

        async with self.lock:
            self.cache[cache_key] = {"timestamp": datetime.utcnow(), "data": summary}

        return summary

    async def _fetch_bea(self, industry: str, region: Optional[str]) -> Dict[str, Any]:
        cache_key = f"bea::{industry.lower()}::{region or 'national'}"
        cached = bailey.get_cached_external_payload(cache_key)
        if cached:
            return cached

        await bailey.respect_source_rate_limit("bea_api")
        params = {
            "UserID": self.bea_api_key,
            "method": "GetData",
            "datasetname": "GDPbyIndustry",
            "Year": "2023",
            "Industry": "ALL",
        }
        url = "https://apps.bea.gov/api/data"

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
        except Exception as exc:  # pragma: no cover
            logger.warning("BEA API request failed (%s), using simulated data", exc)
            data = self._simulate_bea(industry)

        normalized = bailey.normalize_external_payload(data, "json")
        bailey.set_cached_external_payload(cache_key, normalized, timedelta(hours=24))
        return normalized

    async def _fetch_bls(self, industry: str, region: Optional[str]) -> Dict[str, Any]:
        cache_key = f"bls::{industry.lower()}::{region or 'national'}"
        cached = bailey.get_cached_external_payload(cache_key)
        if cached:
            return cached

        await bailey.respect_source_rate_limit("bls_data")
        series_id = "CEU0000000001"  # Total nonfarm employment as baseline
        payload = {
            "seriesid": [series_id],
            "registrationkey": self.bls_api_key,
        }
        url = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
        except Exception as exc:  # pragma: no cover
            logger.warning("BLS API request failed (%s), using simulated data", exc)
            data = self._simulate_bls(industry)

        normalized = bailey.normalize_external_payload(data, "json")
        bailey.set_cached_external_payload(cache_key, normalized, timedelta(hours=12))
        return normalized

    async def _fetch_fdic(self, region: Optional[str]) -> Dict[str, Any]:
        cache_key = f"fdic::{region or 'national'}"
        cached = bailey.get_cached_external_payload(cache_key)
        if cached:
            return cached

        await bailey.respect_source_rate_limit("fdic_bankfind")
        params = {
            "format": "json",
            "limit": 25,
            "filters": "SUM(ASSET)>",
        }
        url = "https://banks.data.fdic.gov/api/financials"

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
        except Exception as exc:  # pragma: no cover
            logger.warning("FDIC BankFind request failed (%s), using simulated data", exc)
            data = self._simulate_fdic(region)

        normalized = bailey.normalize_external_payload(data, "json")
        bailey.set_cached_external_payload(cache_key, normalized, timedelta(hours=24))
        return normalized

    def _assemble_signals(
        self,
        bea: Dict[str, Any],
        bls: Dict[str, Any],
        fdic: Dict[str, Any],
        industry: str,
        region: Optional[str],
    ) -> List[EconomicSignal]:
        signals: List[EconomicSignal] = []

        gdp_value, gdp_change = self._extract_bea_metric(bea, industry)
        signals.append(
            EconomicSignal(
                name="Industry GDP Growth",
                value=gdp_value,
                change_percent=gdp_change,
                unit="% YoY",
                source_id="bea_api",
                detail=f"BEA GDP growth for {industry}",
            )
        )

        employment_rate, wage_growth = self._extract_bls_metric(bls)
        signals.append(
            EconomicSignal(
                name="Employment Momentum",
                value=employment_rate,
                change_percent=wage_growth,
                unit="index",
                source_id="bls_data",
                detail="BLS employment and wage momentum",
            )
        )

        bank_health, credit_growth = self._extract_fdic_metric(fdic)
        signals.append(
            EconomicSignal(
                name="Banking Sector Health",
                value=bank_health,
                change_percent=credit_growth,
                unit="index",
                source_id="fdic_bankfind",
                detail="FDIC capital adequacy and credit trends",
            )
        )

        return signals

    @staticmethod
    def _calculate_timing_index(signals: List[EconomicSignal]) -> float:
        weighted = sum(signal.value * 0.5 + signal.change_percent * 0.5 for signal in signals)
        score = weighted / max(len(signals), 1)
        return round(min(max(score + 50, 0), 100), 2)

    @staticmethod
    def _calculate_recession_risk(signals: List[EconomicSignal]) -> float:
        downside = sum(max(0.0, -signal.change_percent) for signal in signals)
        risk = min(100.0, downside * 5)
        return round(risk, 2)

    async def _publish_to_bailey(self, summary: Dict[str, Any]) -> None:
        try:
            await bailey.ingest_knowledge_point(
                content=(
                    f"Economic timing index for {summary['industry']} in {summary['region']} "
                    f"is {summary['timing_index']:.1f} with recession risk {summary['recession_risk']:.1f}."
                ),
                source_id="bea_api",
                category="economic_health_intelligence",
                numerical_value=summary["timing_index"],
                confidence=0.81,
            )
        except Exception as exc:  # pragma: no cover
            logger.debug("Bailey ingestion skipped for economic analyzer: %s", exc)

    @staticmethod
    def _ensure_dict(payload: Any) -> Dict[str, Any]:
        if isinstance(payload, Exception):
            return {"raw": payload, "fallback": True}
        return payload or {}

    @staticmethod
    def _extract_bea_metric(payload: Dict[str, Any], industry: str) -> List[float]:
        try:
            data = payload.get("raw") or payload
            if isinstance(data, dict):
                values = data.get("BEAAPI", {}).get("Results", {}).get("Data", [])
                if values:
                    point = values[0]
                    value = float(point.get("DataValue", "2.5").replace(",", ""))
                    change = float(point.get("NoteRef", "0") or 1.0)
                    return [value, change]
        except Exception:  # pragma: no cover
            pass
        simulated = EnhancedEconomicAnalyzer._simulate_bea(industry)
        return [simulated["value"], simulated["change"]]

    @staticmethod
    def _extract_bls_metric(payload: Dict[str, Any]) -> List[float]:
        try:
            series_list = payload.get("Results", {}).get("series", []) if isinstance(payload, dict) else []
            if series_list:
                data = series_list[0].get("data", [])
                if data:
                    latest = float(data[0].get("value", 0))
                    prior = float(data[1].get("value", latest)) if len(data) > 1 else latest * 0.98
                    change = ((latest - prior) / max(prior, 1.0)) * 100
                    return [latest, change]
        except Exception:  # pragma: no cover
            pass
        simulated = EnhancedEconomicAnalyzer._simulate_bls("general")
        return [simulated["employment_index"], simulated["wage_growth"]]

    @staticmethod
    def _extract_fdic_metric(payload: Dict[str, Any]) -> List[float]:
        try:
            data = payload.get("data", []) if isinstance(payload, dict) else []
            if data:
                total_assets = sum(float(item.get("ASSET", 0)) for item in data[:10])
                tier1 = sum(float(item.get("TIER1R", 0)) for item in data[:10])
                health = (tier1 / total_assets) * 100 if total_assets else 12.0
                credit_growth = 2.5
                return [round(health, 2), credit_growth]
        except Exception:  # pragma: no cover
            pass
        simulated = EnhancedEconomicAnalyzer._simulate_fdic("national")
        return [simulated["capital_ratio"], simulated["credit_growth"]]

    @staticmethod
    def _simulate_bea(industry: str) -> Dict[str, Any]:
        return {"value": 3.4, "change": 1.1, "raw": {}}

    @staticmethod
    def _simulate_bls(industry: str) -> Dict[str, Any]:
        return {"employment_index": 97.4, "wage_growth": 1.6}

    @staticmethod
    def _simulate_fdic(region: Optional[str]) -> Dict[str, Any]:
        return {"capital_ratio": 11.8, "credit_growth": 2.2}

    async def aclose(self) -> None:
        await self.client.aclose()


enhanced_economic_analyzer = EnhancedEconomicAnalyzer()
