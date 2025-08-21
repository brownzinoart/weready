"""
Portfolio Mock Data Service
==========================
Provides realistic multi-project portfolio data for investor demos.
"""

from datetime import datetime, timedelta
import random

def get_demo_investor():
    """Returns a demo investor profile"""
    return {
        "id": "investor_001",
        "name": "Alex Chen",
        "firm": "Future Ventures",
        "email": "alex@futurevc.com",
        "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        "portfolio_count": 5,
        "total_invested": "$12.5M",
        "successful_exits": 2,
        "current_stage": "Managing Partner",
        "areas_of_focus": ["AI/ML", "SaaS", "FinTech", "HealthTech"],
        "joined_date": (datetime.now() - timedelta(days=365)).isoformat()
    }

def get_portfolio_projects():
    """Returns array of portfolio companies"""
    return [
        {
            "id": "proj_001",
            "name": "AI Startup Alpha",
            "company_name": "DeepCode AI",
            "founder": "Sarah Johnson",
            "founder_email": "sarah@deepcode.ai",
            "founder_avatar": "https://images.unsplash.com/photo-1494790108755-2616b9c3c4b4?w=150&h=150&fit=crop&crop=face",
            "description": "AI-powered code analysis for enterprise teams",
            "stage": "Series A",
            "investment_amount": "$3.2M",
            "investment_date": (datetime.now() - timedelta(days=180)).isoformat(),
            "last_score": 91,
            "previous_score": 78,
            "trend": "improving",
            "trend_direction": "+13",
            "last_updated": (datetime.now() - timedelta(hours=6)).isoformat(),
            "update_count": 8,
            "unread_updates": 2,
            "next_milestone": "Reach $100K MRR",
            "runway_months": 18,
            "status": "on_track",
            "tags": ["AI", "Enterprise", "High Growth"],
            "metrics": {
                "mrr": "$45K",
                "growth_rate": "18%",
                "burn_rate": "$85K/month",
                "team_size": 12,
                "customers": 34
            }
        },
        {
            "id": "proj_002",
            "name": "FinTech Revolution",
            "company_name": "PayFlow",
            "founder": "Marcus Rodriguez",
            "founder_email": "marcus@payflow.com",
            "founder_avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
            "description": "Cross-border payments for emerging markets",
            "stage": "Seed",
            "investment_amount": "$1.8M",
            "investment_date": (datetime.now() - timedelta(days=90)).isoformat(),
            "last_score": 85,
            "previous_score": 82,
            "trend": "stable",
            "trend_direction": "+3",
            "last_updated": (datetime.now() - timedelta(days=2)).isoformat(),
            "update_count": 4,
            "unread_updates": 0,
            "next_milestone": "First enterprise client",
            "runway_months": 24,
            "status": "on_track",
            "tags": ["FinTech", "Payments", "International"],
            "metrics": {
                "mrr": "$18K",
                "growth_rate": "25%",
                "burn_rate": "$45K/month",
                "team_size": 8,
                "customers": 156
            }
        },
        {
            "id": "proj_003",
            "name": "HealthTech Innovator",
            "company_name": "MediCore",
            "founder": "Dr. Emily Chen",
            "founder_email": "emily@medicore.health",
            "founder_avatar": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
            "description": "AI diagnostics for rural healthcare providers",
            "stage": "Pre-Seed",
            "investment_amount": "$750K",
            "investment_date": (datetime.now() - timedelta(days=45)).isoformat(),
            "last_score": 78,
            "previous_score": 68,
            "trend": "improving",
            "trend_direction": "+10",
            "last_updated": (datetime.now() - timedelta(hours=18)).isoformat(),
            "update_count": 3,
            "unread_updates": 1,
            "next_milestone": "FDA approval pathway",
            "runway_months": 20,
            "status": "needs_attention",
            "tags": ["HealthTech", "AI", "Regulatory"],
            "metrics": {
                "mrr": "$5K",
                "growth_rate": "35%",
                "burn_rate": "$25K/month",
                "team_size": 5,
                "customers": 12
            }
        },
        {
            "id": "proj_004",
            "name": "E-commerce Platform",
            "company_name": "ShopSmart",
            "founder": "David Kim",
            "founder_email": "david@shopsmart.io",
            "founder_avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            "description": "AI-powered inventory management for SMB retailers",
            "stage": "Series A",
            "investment_amount": "$4.5M",
            "investment_date": (datetime.now() - timedelta(days=300)).isoformat(),
            "last_score": 94,
            "previous_score": 89,
            "trend": "improving",
            "trend_direction": "+5",
            "last_updated": (datetime.now() - timedelta(days=1)).isoformat(),
            "update_count": 12,
            "unread_updates": 0,
            "next_milestone": "Series B preparation",
            "runway_months": 22,
            "status": "exceeding_expectations",
            "tags": ["E-commerce", "AI", "SMB"],
            "metrics": {
                "mrr": "$180K",
                "growth_rate": "22%",
                "burn_rate": "$120K/month",
                "team_size": 28,
                "customers": 450
            }
        },
        {
            "id": "proj_005",
            "name": "CleanTech Venture",
            "company_name": "GreenPower",
            "founder": "Lisa Wang",
            "founder_email": "lisa@greenpower.tech",
            "founder_avatar": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
            "description": "Smart grid optimization for renewable energy",
            "stage": "Seed",
            "investment_amount": "$2.2M",
            "investment_date": (datetime.now() - timedelta(days=120)).isoformat(),
            "last_score": 73,
            "previous_score": 76,
            "trend": "declining",
            "trend_direction": "-3",
            "last_updated": (datetime.now() - timedelta(days=5)).isoformat(),
            "update_count": 6,
            "unread_updates": 0,
            "next_milestone": "Pilot program completion",
            "runway_months": 16,
            "status": "needs_attention",
            "tags": ["CleanTech", "Energy", "B2B"],
            "metrics": {
                "mrr": "$8K",
                "growth_rate": "12%",
                "burn_rate": "$65K/month",
                "team_size": 9,
                "customers": 8
            }
        }
    ]

def get_portfolio_overview():
    """Returns complete portfolio overview"""
    investor = get_demo_investor()
    projects = get_portfolio_projects()
    
    # Calculate portfolio metrics
    total_mrr = sum([int(p["metrics"]["mrr"].replace("$", "").replace("K", "")) for p in projects]) * 1000
    avg_score = sum([p["last_score"] for p in projects]) / len(projects)
    total_updates = sum([p["unread_updates"] for p in projects])
    
    return {
        "investor": investor,
        "projects": projects,
        "portfolio_metrics": {
            "total_companies": len(projects),
            "total_invested": investor["total_invested"],
            "portfolio_mrr": f"${total_mrr/1000:.0f}K",
            "avg_score": round(avg_score, 1),
            "unread_updates": total_updates,
            "companies_on_track": len([p for p in projects if p["status"] in ["on_track", "exceeding_expectations"]]),
            "companies_need_attention": len([p for p in projects if p["status"] == "needs_attention"])
        },
        "recent_activity": [
            {
                "project_id": "proj_001",
                "project_name": "DeepCode AI",
                "activity": "Submitted new analysis - Score improved to 91",
                "timestamp": (datetime.now() - timedelta(hours=6)).isoformat(),
                "type": "score_improvement"
            },
            {
                "project_id": "proj_003",
                "project_name": "MediCore",
                "activity": "Reached FDA milestone ahead of schedule",
                "timestamp": (datetime.now() - timedelta(hours=18)).isoformat(),
                "type": "milestone"
            },
            {
                "project_id": "proj_004",
                "project_name": "ShopSmart", 
                "activity": "Monthly report: 22% growth in MRR",
                "timestamp": (datetime.now() - timedelta(days=1)).isoformat(),
                "type": "monthly_report"
            },
            {
                "project_id": "proj_005",
                "project_name": "GreenPower",
                "activity": "Score declined - needs check-in",
                "timestamp": (datetime.now() - timedelta(days=5)).isoformat(),
                "type": "alert"
            }
        ]
    }

def get_project_details(project_id: str):
    """Get detailed information for a specific project"""
    projects = get_portfolio_projects()
    project = next((p for p in projects if p["id"] == project_id), None)
    
    if not project:
        return None
    
    # Add detailed timeline and analysis history
    project["analysis_history"] = [
        {
            "id": f"analysis_{project_id}_004",
            "date": (datetime.now() - timedelta(hours=6)).isoformat(),
            "score": project["last_score"],
            "verdict": "investment_ready",
            "changes": [
                "Improved code quality (+8 points)",
                "Enhanced business model validation",
                "Completed security audit"
            ],
            "founder_notes": "Implemented all suggested improvements from last review."
        },
        {
            "id": f"analysis_{project_id}_003",
            "date": (datetime.now() - timedelta(days=30)).isoformat(),
            "score": project["previous_score"],
            "verdict": "needs_work",
            "changes": [
                "Added automated testing",
                "Improved API documentation"
            ],
            "founder_notes": "Working on technical debt reduction."
        }
    ]
    
    project["investor_notes"] = [
        {
            "date": (datetime.now() - timedelta(hours=8)).isoformat(),
            "note": "Excellent progress on technical improvements. Ready for next funding round.",
            "author": "Alex Chen"
        },
        {
            "date": (datetime.now() - timedelta(days=15)).isoformat(),
            "note": "Need to focus on customer acquisition metrics.",
            "author": "Alex Chen"
        }
    ]
    
    return project

def get_project_comparison(project_ids: list):
    """Compare multiple projects side by side"""
    projects = get_portfolio_projects()
    comparison_projects = [p for p in projects if p["id"] in project_ids]
    
    # Add comparison metrics
    comparison = {
        "projects": comparison_projects,
        "comparison_matrix": {
            "scores": {proj["id"]: proj["last_score"] for proj in comparison_projects},
            "growth_rates": {proj["id"]: proj["metrics"]["growth_rate"] for proj in comparison_projects},
            "runway": {proj["id"]: proj["runway_months"] for proj in comparison_projects},
            "team_size": {proj["id"]: proj["metrics"]["team_size"] for proj in comparison_projects},
            "mrr": {proj["id"]: proj["metrics"]["mrr"] for proj in comparison_projects}
        },
        "recommendation": "DeepCode AI shows highest score and growth potential for next round of investment."
    }
    
    return comparison