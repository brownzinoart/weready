"""
Demo API Router
===============
Provides instant access to demo data without authentication.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
from app.services.mock_data import (
    get_demo_user,
    get_demo_dashboard,
    get_mock_report,
    get_all_mock_reports
)
from app.services.portfolio_mock_data import (
    get_demo_investor,
    get_portfolio_overview,
    get_project_details,
    get_project_comparison
)

router = APIRouter(prefix="/api/demo", tags=["demo"])

@router.get("/")
async def demo_status():
    """Check demo API status"""
    return {
        "status": "ready",
        "message": "Demo mode active",
        "available_reports": [1, 2, 3, 4],
        "endpoints": {
            "dashboard": "/api/demo/dashboard",
            "reports": "/api/demo/report/{id}",
            "all_reports": "/api/demo/reports",
            "user": "/api/demo/user"
        }
    }

@router.get("/user")
async def get_demo_user_profile():
    """Get demo user profile"""
    return get_demo_user()

@router.get("/dashboard")
async def get_demo_dashboard_data():
    """Get complete demo dashboard data"""
    return get_demo_dashboard()

@router.get("/report/{report_id}")
async def get_demo_report(report_id: int):
    """Get a specific demo report (1-4)"""
    if report_id < 1 or report_id > 4:
        raise HTTPException(status_code=404, detail="Report not found. Use 1-4.")
    return get_mock_report(report_id)

@router.get("/reports")
async def get_all_demo_reports():
    """Get all 4 demo reports"""
    return get_all_mock_reports()


@router.post("/analyze")
async def demo_analyze():
    """Instant demo analysis result"""
    return {
        "analysis_id": "demo_instant",
        "overall_score": 85,
        "verdict": "investment_ready",
        "report": get_mock_report(4),
        "message": "Demo analysis completed instantly!"
    }

# Portfolio endpoints
@router.get("/portfolio")
async def get_demo_portfolio():
    """Get complete portfolio overview for investor"""
    return get_portfolio_overview()

@router.get("/portfolio/investor")
async def get_demo_investor_profile():
    """Get demo investor profile"""
    return get_demo_investor()

@router.get("/portfolio/project/{project_id}")
async def get_demo_project(project_id: str):
    """Get detailed project information"""
    project = get_project_details(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/portfolio/compare")
async def compare_demo_projects(project_ids: list[str]):
    """Compare multiple projects side by side"""
    if len(project_ids) > 4:
        raise HTTPException(status_code=400, detail="Cannot compare more than 4 projects")
    return get_project_comparison(project_ids)

@router.get("/portfolio/compare/{project_ids}")
async def compare_demo_projects_get(project_ids: str):
    """Compare projects using GET with comma-separated IDs"""
    ids = project_ids.split(",")
    if len(ids) > 4:
        raise HTTPException(status_code=400, detail="Cannot compare more than 4 projects")
    return get_project_comparison(ids)

# Enhanced quick commands with portfolio
@router.get("/quick/{command}")
async def quick_command(command: str):
    """Quick command interface for demo"""
    command = command.lower()
    
    if command == "mock":
        import random
        return get_mock_report(random.randint(1, 4))
    elif command in ["mock1", "mock 1", "1"]:
        return get_mock_report(1)
    elif command in ["mock2", "mock 2", "2"]:
        return get_mock_report(2)
    elif command in ["mock3", "mock 3", "3"]:
        return get_mock_report(3)
    elif command in ["mock4", "mock 4", "4"]:
        return get_mock_report(4)
    elif command in ["dashboard", "dash"]:
        return get_demo_dashboard()
    elif command in ["user", "profile"]:
        return get_demo_user()
    elif command in ["portfolio", "port"]:
        return get_portfolio_overview()
    elif command in ["investor", "inv"]:
        return get_demo_investor()
    elif command.startswith("project"):
        # Extract project number/id
        parts = command.split()
        if len(parts) > 1:
            project_num = parts[1]
            project_id = f"proj_00{project_num}" if project_num.isdigit() else project_num
            return get_project_details(project_id)
        return {"error": "Specify project number (e.g., 'project 1')"}
    elif command in ["compare", "comp"]:
        return get_project_comparison(["proj_001", "proj_002"])
    else:
        return {
            "error": f"Unknown command: {command}",
            "available_commands": [
                "mock - Random report",
                "mock1-4 - Specific reports",
                "dashboard - Demo dashboard",
                "portfolio - Investor portfolio",
                "project 1-5 - Specific projects",
                "compare - Compare projects",
                "investor - Investor profile"
            ]
        }