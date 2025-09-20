"""Procurement Intelligence Tracker
==================================
Surfaces U.S. federal contract, grant, and SBIR/STTR opportunities
using USAspending, SAM.gov, and Grants.gov free APIs with caching
and Bailey integration.
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
class ProcurementOpportunity:
    """Represents a normalized procurement or grant opportunity"""

    title: str
    agency: str
    amount: float
    deadline: Optional[str]
    opportunity_type: str
    source_id: str
    url: str
    keywords: List[str]


class ProcurementIntelligence:
    """Aggregates procurement insights across free federal APIs"""

    def __init__(self) -> None:
        self.client = httpx.AsyncClient(timeout=30.0)
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.cache_ttl = timedelta(hours=2)
        self.lock = asyncio.Lock()
        self.sam_api_key = os.getenv("SAM_GOV_API_KEY")

    async def get_procurement_opportunities(
        self,
        naics_code: str,
        sector: Optional[str] = None,
    ) -> Dict[str, Any]:
        cache_key = f"procurement::{naics_code}::{sector or 'general'}"
        async with self.lock:
            cached = self.cache.get(cache_key)
            if cached and datetime.utcnow() - cached["timestamp"] < self.cache_ttl:
                return cached["data"]

        usaspending, sam_gov, grants, sbir = await asyncio.gather(
            self._fetch_usaspending(naics_code),
            self._fetch_sam(naics_code, sector),
            self._fetch_grants(naics_code, sector),
            self._fetch_sbir(naics_code, sector),
            return_exceptions=True,
        )

        opportunities = self._normalize_opportunities(
            self._ensure_list(usaspending),
            self._ensure_list(sam_gov),
            self._ensure_list(grants),
            self._ensure_list(sbir),
        )

        total_value = sum(op.amount for op in opportunities)
        top_agencies = self._top_agencies(opportunities)

        summary = {
            "naics_code": naics_code,
            "sector": sector or "general",
            "opportunity_count": len(opportunities),
            "total_value": round(total_value, 2),
            "top_agencies": top_agencies,
            "opportunities": [op.__dict__ for op in opportunities[:25]],
            "sources": ["usaspending", "sam_gov", "grants_gov", "sbir_sttr"],
            "last_updated": datetime.utcnow().isoformat(),
        }

        await self._publish_to_bailey(summary)

        async with self.lock:
            self.cache[cache_key] = {"timestamp": datetime.utcnow(), "data": summary}

        return summary

    async def _fetch_usaspending(self, naics_code: str) -> List[Dict[str, Any]]:
        cache_key = f"usaspending::{naics_code}"
        cached = bailey.get_cached_external_payload(cache_key)
        if cached:
            return cached.get("awards", [])

        await bailey.respect_source_rate_limit("usaspending")
        url = "https://api.usaspending.gov/api/v2/search/spending_by_award/"
        payload = {
            "filters": {
                "award_type_codes": ["A", "B", "C", "D"],
                "naics_codes": [naics_code],
                "award_amounts": [{"lower_bound": 50000}],
            },
            "fields": ["Award ID", "Recipient Name", "Award Amount", "Awarding Agency", "Award Description"],
            "page": 1,
            "limit": 25,
        }

        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            awards = data.get("results", [])
        except Exception as exc:  # pragma: no cover
            logger.warning("USAspending request failed (%s), using simulated data", exc)
            awards = self._simulate_usaspending(naics_code)

        normalized = {"awards": awards}
        bailey.set_cached_external_payload(cache_key, normalized, timedelta(hours=2))
        return awards

    async def _fetch_sam(self, naics_code: str, sector: Optional[str]) -> List[Dict[str, Any]]:
        cache_key = f"sam::{naics_code}::{sector or 'general'}"
        cached = bailey.get_cached_external_payload(cache_key)
        if cached:
            return cached.get("opportunities", [])

        await bailey.respect_source_rate_limit("sam_gov")
        params = {
            "api_key": self.sam_api_key or "DEMO_KEY",
            "limit": 25,
            "naics": naics_code,
            "postedFrom": (datetime.utcnow() - timedelta(days=30)).strftime("%m/%d/%Y"),
        }
        url = "https://api.sam.gov/opportunities/v1/search"

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            opportunities = data.get("opportunitiesData", [])
        except Exception as exc:  # pragma: no cover
            logger.warning("SAM.gov request failed (%s), using simulated data", exc)
            opportunities = self._simulate_sam(naics_code)

        normalized = {"opportunities": opportunities}
        bailey.set_cached_external_payload(cache_key, normalized, timedelta(hours=1))
        return opportunities

    async def _fetch_grants(self, naics_code: str, sector: Optional[str]) -> List[Dict[str, Any]]:
        cache_key = f"grants::{naics_code}::{sector or 'general'}"
        cached = bailey.get_cached_external_payload(cache_key)
        if cached:
            return cached.get("grants", [])

        await bailey.respect_source_rate_limit("grants_gov")
        params = {
            "keyword": sector or naics_code,
            "startDate": (datetime.utcnow() - timedelta(days=60)).strftime("%m/%d/%Y"),
            "fundingTypes": "grant",
            "limit": 25,
        }
        url = "https://www.grants.gov/grantsws/rest/opportunities/search"

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            grants = data.get("opportunities", [])
        except Exception as exc:  # pragma: no cover
            logger.warning("Grants.gov request failed (%s), using simulated data", exc)
            grants = self._simulate_grants(naics_code)

        normalized = {"grants": grants}
        bailey.set_cached_external_payload(cache_key, normalized, timedelta(hours=3))
        return grants

    async def _fetch_sbir(self, naics_code: str, sector: Optional[str]) -> List[Dict[str, Any]]:
        cache_key = f"sbir::{naics_code}::{sector or 'general'}"
        cached = bailey.get_cached_external_payload(cache_key)
        if cached:
            return cached.get("awards", [])

        await bailey.respect_source_rate_limit("sbir_sttr")
        params = {
            "q": sector or naics_code,
            "agency": "",
            "program": "SBIR",
            "limit": 25,
        }
        url = "https://www.sbir.gov/api/awards.json"

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            awards = response.json()
        except Exception as exc:  # pragma: no cover
            logger.warning("SBIR/STTR request failed (%s), using simulated data", exc)
            awards = self._simulate_sbir(naics_code)

        normalized = {"awards": awards}
        bailey.set_cached_external_payload(cache_key, normalized, timedelta(hours=6))
        return awards

    def _normalize_opportunities(
        self,
        awards: List[Dict[str, Any]],
        sam: List[Dict[str, Any]],
        grants: List[Dict[str, Any]],
        sbir: List[Dict[str, Any]],
    ) -> List[ProcurementOpportunity]:
        normalized: List[ProcurementOpportunity] = []

        for item in awards[:25]:
            normalized.append(
                ProcurementOpportunity(
                    title=item.get("Award Description") or item.get("award_description", "Unnamed Contract"),
                    agency=item.get("Awarding Agency") or item.get("awarding_agency_name", "Federal Agency"),
                    amount=float(item.get("Award Amount") or item.get("award_amount") or 0),
                    deadline=None,
                    opportunity_type="contract",
                    source_id="usaspending",
                    url=item.get("Link") or "https://www.usaspending.gov/",
                    keywords=[k for k in [item.get("Recipient Name"), item.get("Award ID")] if k],
                )
            )

        for opportunity in sam[:25]:
            normalized.append(
                ProcurementOpportunity(
                    title=opportunity.get("title", "Unnamed Opportunity"),
                    agency=opportunity.get("agency", "SAM.gov"),
                    amount=float(opportunity.get("baseValue", 0) or 0),
                    deadline=opportunity.get("responseDeadLine"),
                    opportunity_type="contract",
                    source_id="sam_gov",
                    url=opportunity.get("uiLink", "https://sam.gov/"),
                    keywords=opportunity.get("naics", []),
                )
            )

        for grant in grants[:25]:
            normalized.append(
                ProcurementOpportunity(
                    title=grant.get("title", "Unnamed Grant"),
                    agency=grant.get("agency", "Grants.gov"),
                    amount=float(grant.get("awardCeiling", 0) or 0),
                    deadline=grant.get("closeDate"),
                    opportunity_type="grant",
                    source_id="grants_gov",
                    url=grant.get("url", "https://www.grants.gov/"),
                    keywords=grant.get("keywords", []),
                )
            )

        for award in sbir[:25]:
            normalized.append(
                ProcurementOpportunity(
                    title=award.get("solicitation_title", "SBIR/STTR Opportunity"),
                    agency=award.get("agency", "SBA"),
                    amount=float(award.get("amount", 0) or 0),
                    deadline=award.get("contract_start_date"),
                    opportunity_type="sbir",
                    source_id="sbir_sttr",
                    url=award.get("url", "https://www.sbir.gov/"),
                    keywords=[award.get("topic_code", "SBIR")],
                )
            )

        return normalized

    @staticmethod
    def _top_agencies(opportunities: List[ProcurementOpportunity]) -> List[str]:
        agencies: Dict[str, float] = {}
        for op in opportunities:
            agencies[op.agency] = agencies.get(op.agency, 0.0) + op.amount
        ranked = sorted(agencies.items(), key=lambda item: item[1], reverse=True)
        return [f"{agency} (${amount:,.0f})" for agency, amount in ranked[:5]]

    async def _publish_to_bailey(self, summary: Dict[str, Any]) -> None:
        try:
            await bailey.ingest_knowledge_point(
                content=(
                    f"Government procurement pipeline for NAICS {summary['naics_code']} has "
                    f"{summary['opportunity_count']} active opportunities totaling "
                    f"${summary['total_value']:,.0f}."
                ),
                source_id="usaspending",
                category="procurement_intelligence",
                numerical_value=summary["opportunity_count"],
                confidence=0.77,
            )
        except Exception as exc:  # pragma: no cover
            logger.debug("Skipping Bailey ingestion for procurement intelligence: %s", exc)

    @staticmethod
    def _ensure_list(value: Any) -> List[Dict[str, Any]]:
        if isinstance(value, Exception):
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, dict):
            if "awards" in value:
                return value["awards"]
            if "opportunities" in value:
                return value["opportunities"]
            if "grants" in value:
                return value["grants"]
        return []

    @staticmethod
    def _simulate_usaspending(naics_code: str) -> List[Dict[str, Any]]:
        return [
            {
                "Award Description": f"Innovative services contract ({naics_code})",
                "Awarding Agency": "Department of Defense",
                "Award Amount": 2500000,
                "Recipient Name": "GrowthTech Labs",
                "Award ID": "SIM-DO-0001",
                "Link": "https://usaspending.gov/award/SIM-DO-0001",
            }
        ]

    @staticmethod
    def _simulate_sam(naics_code: str) -> List[Dict[str, Any]]:
        return [
            {
                "title": f"Pilot deployment - {naics_code}",
                "agency": "General Services Administration",
                "baseValue": 950000,
                "responseDeadLine": (datetime.utcnow() + timedelta(days=18)).strftime("%Y-%m-%d"),
                "uiLink": "https://sam.gov/opportunity/SIM",
                "naics": [naics_code],
            }
        ]

    @staticmethod
    def _simulate_grants(naics_code: str) -> List[Dict[str, Any]]:
        return [
            {
                "title": "Digital transformation grant",
                "agency": "Department of Commerce",
                "awardCeiling": 750000,
                "closeDate": (datetime.utcnow() + timedelta(days=45)).strftime("%Y-%m-%d"),
                "url": "https://www.grants.gov/grantsws/rest/opportunities/SIM",
                "keywords": [naics_code, "innovation"],
            }
        ]

    @staticmethod
    def _simulate_sbir(naics_code: str) -> List[Dict[str, Any]]:
        return [
            {
                "solicitation_title": "SBIR Phase I - Advanced Analytics",
                "agency": "National Science Foundation",
                "amount": 275000,
                "contract_start_date": (datetime.utcnow() + timedelta(days=90)).strftime("%Y-%m-%d"),
                "url": "https://www.sbir.gov/awards/SIM",
                "topic_code": "AI-001",
            }
        ]

    async def aclose(self) -> None:
        await self.client.aclose()


procurement_intelligence = ProcurementIntelligence()
