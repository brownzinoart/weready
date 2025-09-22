"""Automated checks for backend/frontend source alignment."""

from __future__ import annotations

from typing import List

import pytest

from app.core.bailey import bailey
from app.core.bailey_connectors import BaileyConnector, BaileyDataPipeline, bailey_pipeline
from app.services.source_inventory_service import (
    SourceImplementationStatus,
    SourceInventoryService,
)


@pytest.fixture(scope="module")
def pipeline() -> BaileyDataPipeline:
    return bailey_pipeline


@pytest.fixture(scope="module")
def inventory_service(pipeline: BaileyDataPipeline) -> SourceInventoryService:
    return SourceInventoryService(pipeline=pipeline)


def test_all_connectors_have_registered_sources(pipeline: BaileyDataPipeline) -> None:
    missing: List[str] = []
    for connector_cls in pipeline.connectors.values():
        connector: BaileyConnector = connector_cls()
        if connector.source_id not in bailey.knowledge_sources:
            missing.append(connector.source_id)
    assert not missing, f"Connectors missing knowledge sources: {missing}"


def test_inventory_marks_implemented_sources(pipeline: BaileyDataPipeline, inventory_service: SourceInventoryService) -> None:
    inventory = inventory_service.get_inventory()
    implemented_from_inventory = {
        record.source_id for record in inventory if record.status == SourceImplementationStatus.IMPLEMENTED
    }
    connector_source_ids = {connector_cls().source_id for connector_cls in pipeline.connectors.values()}
    assert connector_source_ids.issubset(implemented_from_inventory)


def test_gap_analysis_highlights_missing_sources(inventory_service: SourceInventoryService) -> None:
    validation = inventory_service.validate_sources()
    missing = set(validation["missing_sources"])
    # Planned ops/security sources should remain in the missing list until implemented
    expected_missing = {"snyk", "datadog", "pagerduty"}
    assert expected_missing.issubset(missing)


def test_coverage_summary_reports_by_category(inventory_service: SourceInventoryService) -> None:
    coverage = inventory_service.get_coverage_summary()
    assert "core_sources" in coverage
    assert "code_quality_sources" in coverage
    # operations_sources contains planned items only and should report zero implementation
    operations = coverage.get("operations_sources")
    assert operations is not None
    assert operations["implemented"] == 0
    assert operations["total"] >= 2
