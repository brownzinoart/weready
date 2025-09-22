"""Connectors for code quality and security intelligence sources."""

from __future__ import annotations

import logging
from typing import List, Optional

import httpx

from .base import BaileyConnector
from ..bailey import DataFreshness



class SonarQubeConnector(BaileyConnector):
    """Fetch quality gate metrics from SonarQube/SonarCloud."""

    def __init__(self) -> None:
        super().__init__("sonarqube")
        base = self.get_env("SONARQUBE_API_BASE") or "https://sonarcloud.io/api"
        self.base_url = base.rstrip("/")
        token = self.get_env("SONARQUBE_API_TOKEN")
        self._auth = httpx.BasicAuth(token, "") if token else None
        projects = self.get_env("SONARQUBE_PROJECTS") or ""
        self.projects = [p.strip() for p in projects.split(",") if p.strip()]

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []

        if not self.projects:
            logging.warning("SonarQubeConnector has no projects configured via SONARQUBE_PROJECTS")
            return knowledge_ids

        for project_key in self.projects:
            try:
                params = {"projectKey": project_key}
                status = await self._get_json(
                    f"{self.base_url}/qualitygates/project_status",
                    params=params,
                    auth=self._auth,
                )
                if not status:
                    continue

                gate = status.get("projectStatus", {})
                conditions = gate.get("conditions", [])
                failing = [c for c in conditions if c.get("status") == "ERROR"]
                content = f"SonarQube quality gate for {project_key}: {gate.get('status')}"
                metadata = {
                    "conditions": conditions,
                    "violations": len(failing),
                }
                point_id = await self._ingest_point(
                    content=content,
                    category="code_quality",
                    freshness=DataFreshness.DAILY,
                    confidence=0.8,
                    metadata=metadata,
                )
                knowledge_ids.append(point_id)

            except httpx.HTTPStatusError as exc:
                logging.error("SonarQube API error for %s: %s", project_key, exc)
            except Exception as exc:  # pragma: no cover - defensive
                logging.error("SonarQube ingestion failure for %s: %s", project_key, exc)

        return knowledge_ids


class CodeClimateConnector(BaileyConnector):
    """Retrieve maintainability metrics from Code Climate repositories."""

    def __init__(self) -> None:
        super().__init__("codeclimate")
        self.base_url = "https://api.codeclimate.com/v1"
        self.token = self.get_env("CODECLIMATE_API_TOKEN")
        repos = self.get_env("CODECLIMATE_REPO_IDS") or ""
        self.repo_ids = [r.strip() for r in repos.split(",") if r.strip()]

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []

        if not self.token or not self.repo_ids:
            logging.warning("CodeClimateConnector requires CODECLIMATE_API_TOKEN and CODECLIMATE_REPO_IDS")
            return knowledge_ids

        headers = {"Authorization": f"Token token={self.token}"}

        for repo_id in self.repo_ids:
            try:
                resp = await self._get_json(
                    f"{self.base_url}/repos/{repo_id}",
                    headers=headers,
                )
                if not resp:
                    continue

                attributes = resp.get("data", {}).get("attributes", {})
                rating = attributes.get("ratings", [{}])[0].get("letter", "unknown")
                debt = attributes.get("technical_debt_ratio")
                content = f"Code Climate repo {repo_id} rating {rating} with debt ratio {debt}"
                metadata = {
                    "ratings": attributes.get("ratings", []),
                    "issues_count": attributes.get("issues_count"),
                }
                point_id = await self._ingest_point(
                    content=content,
                    category="code_quality",
                    freshness=DataFreshness.WEEKLY,
                    confidence=0.78,
                    metadata=metadata,
                )
                knowledge_ids.append(point_id)

            except httpx.HTTPStatusError as exc:
                logging.error("Code Climate API error for %s: %s", repo_id, exc)
            except Exception as exc:  # pragma: no cover
                logging.error("Code Climate ingestion failure for %s: %s", repo_id, exc)

        return knowledge_ids


class GitGuardianConnector(BaileyConnector):
    """Monitor GitGuardian incidents for credential exposure."""

    def __init__(self) -> None:
        super().__init__("gitguardian")
        self.base_url = "https://api.gitguardian.com/v1"
        self.api_key = self.get_env("GITGUARDIAN_API_KEY")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []
        if not self.api_key:
            logging.warning("GitGuardianConnector missing GITGUARDIAN_API_KEY")
            return knowledge_ids

        headers = {"Authorization": f"Token {self.api_key}"}

        try:
            incidents = await self._get_json(
                f"{self.base_url}/incidents",
                headers=headers,
                params={"per_page": 20},
            )
            for incident in incidents.get("incidents", [])[:5]:
                repo = incident.get("repository")
                severity = incident.get("severity")
                content = f"GitGuardian incident detected in {repo} (severity {severity})"
                metadata = {
                    "incident_id": incident.get("id"),
                    "status": incident.get("status"),
                    "detected_at": incident.get("detected_at"),
                }
                point_id = await self._ingest_point(
                    content=content,
                    category="security_intelligence",
                    freshness=DataFreshness.REAL_TIME,
                    confidence=0.82,
                    metadata=metadata,
                )
                knowledge_ids.append(point_id)

        except httpx.HTTPStatusError as exc:
            logging.error("GitGuardian API error: %s", exc)
        except Exception as exc:  # pragma: no cover
            logging.error("GitGuardian ingestion failure: %s", exc)

        return knowledge_ids


class SemgrepConnector(BaileyConnector):
    """Integrate with Semgrep CI findings."""

    def __init__(self) -> None:
        super().__init__("semgrep")
        self.base_url = "https://semgrep.dev/api"
        self.token = self.get_env("SEMGREP_API_TOKEN")
        self.organization = self.get_env("SEMGREP_ORG_SLUG")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []

        if not self.token or not self.organization:
            logging.warning("SemgrepConnector requires SEMGREP_API_TOKEN and SEMGREP_ORG_SLUG")
            return knowledge_ids

        headers = {"Authorization": f"Bearer {self.token}"}

        try:
            findings = await self._get_json(
                f"{self.base_url}/v1/orgs/{self.organization}/findings",
                headers=headers,
                params={"page_size": 20},
            )
            for finding in findings.get("results", [])[:5]:
                rule_id = finding.get("rule_id")
                severity = finding.get("severity")
                content = f"Semgrep finding {rule_id} severity {severity}"
                metadata = {
                    "check_id": finding.get("check_id"),
                    "path": finding.get("path"),
                    "line": finding.get("start", {}).get("line"),
                }
                point_id = await self._ingest_point(
                    content=content,
                    category="security_intelligence",
                    freshness=DataFreshness.DAILY,
                    confidence=0.78,
                    metadata=metadata,
                )
                knowledge_ids.append(point_id)

        except httpx.HTTPStatusError as exc:
            logging.error("Semgrep API error: %s", exc)
        except Exception as exc:  # pragma: no cover
            logging.error("Semgrep ingestion failure: %s", exc)

        return knowledge_ids


class VeracodeConnector(BaileyConnector):
    """Pull policy scan results from Veracode APIs."""

    def __init__(self) -> None:
        super().__init__("veracode")
        self.base_url = "https://analysiscenter.veracode.com/api"
        self.api_id = self.get_env("VERACODE_API_ID")
        self.api_key = self.get_env("VERACODE_API_KEY")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []
        if not self.api_id or not self.api_key:
            logging.warning("VeracodeConnector requires VERACODE_API_ID and VERACODE_API_KEY")
            return knowledge_ids

        auth = httpx.DigestAuth(self.api_id, self.api_key)

        try:
            resp = await self._get_json(
                f"{self.base_url}/5.0/summaryreport.do",
                params={"page": 1},
                auth=auth,
            )
            for app in resp.get("applications", [])[:5]:
                name = app.get("app_name")
                score = app.get("score")
                content = f"Veracode application {name} score {score}"
                metadata = {
                    "policy_name": app.get("policy_name"),
                    "last_scan": app.get("last_completed_scan"),
                    "flaws_open": app.get("flaws_open")
                }
                point_id = await self._ingest_point(
                    content=content,
                    category="security_intelligence",
                    freshness=DataFreshness.WEEKLY,
                    confidence=0.75,
                    metadata=metadata,
                )
                knowledge_ids.append(point_id)

        except httpx.HTTPStatusError as exc:
            logging.error("Veracode API error: %s", exc)
        except Exception as exc:  # pragma: no cover
            logging.error("Veracode ingestion failure: %s", exc)

        return knowledge_ids


__all__ = [
    "SonarQubeConnector",
    "CodeClimateConnector",
    "GitGuardianConnector",
    "SemgrepConnector",
    "VeracodeConnector",
]
