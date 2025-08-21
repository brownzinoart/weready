"""
Mock Data Service for Demo Mode
================================
Provides realistic mock data for demonstration purposes.
"""

from datetime import datetime, timedelta
import random

def get_demo_user():
    """Returns a demo user profile"""
    return {
        "id": "demo_user_001",
        "email": "founder@demoStartup.com",
        "name": "Demo Founder",
        "username": "demo_founder",
        "avatar_url": "https://avatars.githubusercontent.com/u/1?v=4",
        "subscription_tier": "premium",
        "trial_days_remaining": 7,
        "created_at": (datetime.now() - timedelta(days=5)).isoformat(),
        "github_connected": True,
        "analyses_count": 5,
        "last_analysis": (datetime.now() - timedelta(hours=2)).isoformat()
    }

def get_demo_dashboard():
    """Returns complete dashboard data"""
    return {
        "user": get_demo_user(),
        "summary": {
            "total_analyses": 5,
            "last_analysis_date": (datetime.now() - timedelta(hours=2)).isoformat(),
            "average_score": 78.8,
            "score_trend": "improving",
            "latest_score": 91
        },
        "history": [
            {
                "id": "analysis_005",
                "created_at": (datetime.now() - timedelta(hours=2)).isoformat(),
                "overall_score": 91,
                "verdict": "investment_ready",
                "github_url": "https://github.com/demo/ai-startup",
                "analysis_type": "GitHub Repository"
            },
            {
                "id": "analysis_004",
                "created_at": (datetime.now() - timedelta(days=1)).isoformat(),
                "overall_score": 85,
                "verdict": "minor_issues",
                "github_url": "https://github.com/demo/saas-platform",
                "analysis_type": "GitHub Repository"
            },
            {
                "id": "analysis_003",
                "created_at": (datetime.now() - timedelta(days=3)).isoformat(),
                "overall_score": 78,
                "verdict": "needs_work",
                "github_url": "https://github.com/demo/mvp-app",
                "analysis_type": "Code Snippet"
            },
            {
                "id": "analysis_002",
                "created_at": (datetime.now() - timedelta(days=4)).isoformat(),
                "overall_score": 72,
                "verdict": "critical_issues",
                "analysis_type": "Code Snippet"
            },
            {
                "id": "analysis_001",
                "created_at": (datetime.now() - timedelta(days=5)).isoformat(),
                "overall_score": 68,
                "verdict": "critical_issues",
                "analysis_type": "Initial Analysis"
            }
        ],
        "metrics": {
            "code_quality_trend": [68, 70, 75, 82, 88],
            "business_model_trend": [60, 65, 72, 80, 85],
            "investment_ready_trend": [55, 62, 70, 78, 90],
            "design_experience_trend": [60, 68, 75, 82, 88]
        }
    }

def get_mock_report(report_id: int):
    """Returns one of 4 comprehensive mock reports"""
    
    reports = {
        1: {  # Bailey Intelligence Report
            "report_type": "Bailey Intelligence",
            "title": "AI-Powered Startup Intelligence Report",
            "overall_score": 88,
            "credibility_score": 94,
            "intelligence_metrics": {
                "repositories_analyzed": 1247,
                "academic_papers_analyzed": 89,
                "government_sources": 23,
                "vc_insights": 156,
                "pattern_matches": 42
            },
            "key_insights": [
                {
                    "insight": "Your tech stack matches 87% of successful Series A startups",
                    "confidence": 0.92,
                    "evidence": "Analysis of 1,247 funded repositories",
                    "action": "Continue with current architecture choices"
                },
                {
                    "insight": "Market timing score: 9.2/10 - Optimal entry window",
                    "confidence": 0.88,
                    "evidence": "Gartner Hype Cycle + VC investment trends",
                    "action": "Accelerate go-to-market within 3 months"
                },
                {
                    "insight": "Team composition needs senior backend engineer",
                    "confidence": 0.85,
                    "evidence": "YC data: 73% higher success with balanced teams",
                    "action": "Prioritize technical co-founder or senior hire"
                }
            ],
            "competitive_moats": [
                "Proprietary AI model with 94% accuracy",
                "First-mover in underserved vertical",
                "Network effects from user-generated data"
            ],
            "funding_prediction": {
                "seed_probability": 0.82,
                "timeline": "3-6 months",
                "recommended_ask": "$1.5M - $2.5M",
                "key_milestones": [
                    "Reach $10K MRR",
                    "Secure 3 enterprise pilots",
                    "Complete SOC 2 Type I"
                ]
            },
            "similar_success_stories": [
                "Stripe (2010) - Similar technical excellence score",
                "Airtable (2013) - Comparable market timing",
                "Notion (2016) - Similar product-market fit signals"
            ]
        },
        2: {  # Market Timing Report
            "report_type": "Market Timing Analysis",
            "title": "Strategic Market Entry & Timing Report",
            "market_score": 85,
            "timing_score": 92,
            "market_size": {
                "tam": "$45.2B",
                "sam": "$8.7B",
                "som": "$127M",
                "growth_rate": "34% CAGR"
            },
            "timing_indicators": {
                "technology_maturity": "Early Majority",
                "regulatory_environment": "Favorable",
                "competitive_density": "Low-Medium",
                "funding_availability": "High",
                "customer_readiness": "Increasing rapidly"
            },
            "trend_analysis": [
                {
                    "trend": "AI adoption in enterprise",
                    "momentum": "Accelerating",
                    "relevance": "Direct",
                    "opportunity_window": "18-24 months"
                },
                {
                    "trend": "No-code/Low-code movement",
                    "momentum": "Peak",
                    "relevance": "Adjacent",
                    "opportunity_window": "12-18 months"
                },
                {
                    "trend": "Privacy-first solutions",
                    "momentum": "Growing",
                    "relevance": "Complementary",
                    "opportunity_window": "24-36 months"
                }
            ],
            "competitive_landscape": {
                "direct_competitors": 3,
                "indirect_competitors": 12,
                "market_leaders": ["CompetitorA ($50M revenue)", "CompetitorB ($30M revenue)"],
                "differentiation_score": 78,
                "defensibility": "Medium-High"
            },
            "go_to_market_recommendations": [
                "Focus on mid-market enterprises (50-500 employees)",
                "Lead with freemium model for rapid adoption",
                "Partner with system integrators for enterprise deals",
                "Build community-driven growth engine"
            ],
            "risk_factors": [
                "Big Tech entry risk: Medium (18-month buffer)",
                "Regulatory changes: Low probability",
                "Technology obsolescence: Low (5+ year horizon)"
            ]
        },
        3: {  # Momentum Report
            "report_type": "Growth Momentum Analysis",
            "title": "Startup Velocity & Momentum Report",
            "momentum_score": 79,
            "growth_velocity": "Accelerating",
            "key_metrics": {
                "monthly_growth_rate": "23%",
                "user_acquisition_velocity": "450 users/month",
                "revenue_run_rate": "$240K ARR",
                "burn_multiple": 1.8,
                "runway_months": 14
            },
            "traction_indicators": {
                "product_market_fit_score": 72,
                "nps_score": 67,
                "user_engagement": "Daily Active",
                "churn_rate": "5.2% monthly",
                "viral_coefficient": 1.3
            },
            "growth_channels": [
                {
                    "channel": "Product-Led Growth",
                    "effectiveness": "High",
                    "cac": "$45",
                    "ltv_cac_ratio": 3.8
                },
                {
                    "channel": "Content Marketing",
                    "effectiveness": "Medium",
                    "cac": "$120",
                    "ltv_cac_ratio": 2.1
                },
                {
                    "channel": "Paid Acquisition",
                    "effectiveness": "Low",
                    "cac": "$280",
                    "ltv_cac_ratio": 0.9
                }
            ],
            "scaling_readiness": {
                "infrastructure": "Ready for 10x",
                "team": "Needs 3-4 key hires",
                "processes": "60% documented",
                "culture": "Strong and defined",
                "capital_efficiency": "Above average"
            },
            "milestone_tracking": {
                "achieved": [
                    "Product launch",
                    "First 100 customers",
                    "$10K MRR",
                    "Key partnership signed"
                ],
                "upcoming": [
                    "$50K MRR (2 months)",
                    "Series A ready (6 months)",
                    "1000 customers (4 months)",
                    "Break-even (12 months)"
                ]
            },
            "investor_signals": {
                "inbound_interest": "High",
                "recent_valuations": "$8M-12M range",
                "comparable_exits": "3 in last 18 months",
                "strategic_interest": "2 corporates engaged"
            }
        },
        4: {  # Comprehensive Results Report
            "report_type": "Comprehensive Analysis",
            "title": "Complete WeReady Investment Readiness Report",
            "overall_score": 82,
            "verdict": "investment_ready",
            "weready_stamp": True,
            "breakdown": {
                "code_quality": {
                    "score": 92,
                    "status": "excellent",
                    "highlights": [
                        "Clean architecture patterns",
                        "95% test coverage",
                        "No security vulnerabilities",
                        "Modern tech stack"
                    ]
                },
                "business_model": {
                    "score": 78,
                    "status": "good",
                    "highlights": [
                        "Clear revenue model",
                        "Strong unit economics",
                        "Proven demand",
                        "Scalable pricing"
                    ]
                },
                "investment_ready": {
                    "score": 85,
                    "status": "ready",
                    "highlights": [
                        "Complete data room",
                        "Financial projections solid",
                        "Legal structure clean",
                        "IP properly assigned"
                    ]
                },
                "design_experience": {
                    "score": 80,
                    "status": "good",
                    "highlights": [
                        "Intuitive UX",
                        "Mobile responsive",
                        "Accessible (WCAG AA)",
                        "Strong brand identity"
                    ]
                }
            },
            "recommendations": {
                "immediate": [
                    "Schedule meetings with warm VC intros",
                    "Prepare 12-slide pitch deck",
                    "Set up data room"
                ],
                "short_term": [
                    "Hire VP of Sales",
                    "Achieve $50K MRR milestone",
                    "Close 2 enterprise pilots"
                ],
                "long_term": [
                    "Build strategic advisory board",
                    "Expand internationally",
                    "Develop platform ecosystem"
                ]
            },
            "investor_package": {
                "pitch_deck_ready": True,
                "financials_ready": True,
                "legal_docs_ready": True,
                "data_room_ready": True,
                "references_ready": True
            },
            "success_probability": 0.84,
            "funding_timeline": "2-4 months",
            "valuation_range": "$10M-15M",
            "testimonial": "This startup shows exceptional promise with strong technical execution and clear market opportunity. Ready for institutional investment. - Bailey AI Analysis"
        }
    }
    
    return reports.get(report_id, reports[1])

def get_all_mock_reports():
    """Returns all 4 reports as a list"""
    return [get_mock_report(i) for i in range(1, 5)]