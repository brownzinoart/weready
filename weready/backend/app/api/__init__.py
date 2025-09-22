"""API router registration utilities."""

from __future__ import annotations

from fastapi import FastAPI

from .analysis import router as analysis_router
from .user import router as user_router
from .demo import router as demo_router
from .sources import router as sources_router


def register_api_routes(app: FastAPI) -> None:
    """Register core API routers with the FastAPI application."""

    app.include_router(analysis_router, prefix="/api", tags=["analysis"])
    app.include_router(user_router, prefix="/api", tags=["user"])
    app.include_router(sources_router, prefix="/api", tags=["sources"])
    app.include_router(demo_router, tags=["demo"])


__all__ = ["register_api_routes", "analysis_router", "user_router", "demo_router", "sources_router"]
