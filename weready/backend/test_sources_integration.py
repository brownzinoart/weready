"""Integration tests for Bailey Intelligence sources endpoints."""

from __future__ import annotations

from typing import Iterator

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def api_client() -> Iterator[TestClient]:
    with TestClient(app) as client:
        yield client


def test_health_endpoint_returns_metrics(api_client: TestClient) -> None:
    response = api_client.get("/api/sources/health")
    assert response.status_code == 200

    payload = response.json()
    assert "metrics" in payload
    assert "sources" in payload
    assert isinstance(payload["sources"], dict)
    assert payload["metrics"]["total_sources"] >= len(payload["sources"])
    assert "X-Bailey-Health-Latency" in response.headers


def test_health_endpoint_reports_cache_headers(api_client: TestClient) -> None:
    first = api_client.get("/api/sources/health")
    second = api_client.get("/api/sources/health")
    forced = api_client.get("/api/sources/health", params={"force": "true"})

    assert first.headers.get("X-Bailey-Health-Cache") in {"hit", "miss"}
    assert second.headers.get("X-Bailey-Health-Cache") in {"hit", "miss"}
    assert forced.headers.get("X-Bailey-Health-Cache") == "miss"


def test_status_stream_emits_events(api_client: TestClient) -> None:
    with api_client.stream("GET", "/api/sources/status/stream") as stream:
        first_chunk = None
        for line in stream.iter_lines():
            if line:
                first_chunk = line
                break

    assert first_chunk is not None
    assert isinstance(first_chunk, str)
    assert first_chunk.startswith("data:")


def test_trigger_source_test_validates_and_returns_payload(api_client: TestClient) -> None:
    response = api_client.post("/api/sources/github_api/test")
    assert response.status_code == 200

    payload = response.json()
    assert payload["source_id"] == "github_api"
    assert payload["success"] is True


def test_trigger_source_test_rejects_invalid_identifier(api_client: TestClient) -> None:
    response = api_client.post("/api/sources/invalid id/test")
    assert response.status_code == 422


def test_pause_and_resume_cycle(api_client: TestClient) -> None:
    pause = api_client.post("/api/sources/github_api/pause")
    assert pause.status_code == 204

    resume = api_client.post("/api/sources/github_api/resume")
    assert resume.status_code == 204


def test_runtime_metrics_endpoint_exposes_counters(api_client: TestClient) -> None:
    response = api_client.get("/api/sources/metrics/runtime")
    assert response.status_code == 200

    metrics = response.json()
    assert "health_requests" in metrics
    assert metrics["health_requests"] >= 1
