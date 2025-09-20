"""
Analysis API Endpoints
======================
Handle free analysis requests and progress tracking.
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid
import time
import os

from app.database.connection import get_db
from app.models.analysis import Analysis, IssueTracking
from app.models.user import User
from app.core.weready_scorer import WeReadyScorer
from app.core.bailey_intelligence import bailey_intelligence

API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

router = APIRouter()

class FreeAnalysisRequest(BaseModel):
    repository_url: Optional[str] = None
    code_snippet: Optional[str] = None
    language: str = "python"

class AnalysisResponse(BaseModel):
    analysis_id: str
    overall_score: float
    code_quality_score: float
    business_model_score: float
    investment_ready_score: float
    verdict: str
    weready_stamp_eligible: bool
    success_probability: Optional[float]
    funding_timeline: Optional[str]
    credibility_score: Optional[float]
    market_percentile: Optional[int]
    issues_found: Optional[Dict[str, Any]]
    recommendations: Optional[Dict[str, Any]]
    bailey_recommendations: Optional[list]
    improvement_roadmap: Optional[Dict[str, Any]]
    intelligent_roadmap: Optional[Dict[str, List[Dict[str, Any]]]] = None  # Enhanced roadmap
    competitive_moats: Optional[list]
    breakdown: Optional[Dict[str, Any]] = None  # Rich category analysis
    credibility_methodology: Optional[Dict[str, Any]] = None  # Bailey Intelligence credibility data
    files_analyzed: int
    is_free_analysis: bool = True
    signup_prompt: Optional[Dict[str, Any]] = None

@router.post("/analyze/free", response_model=AnalysisResponse)
async def analyze_free(
    request: FreeAnalysisRequest,
    client_request: Request,
    db: Session = Depends(get_db)
):
    """
    Perform free WeReady analysis (no authentication required)
    This is the hook to get users interested
    """
    
    if not request.repository_url and not request.code_snippet:
        raise HTTPException(status_code=400, detail="Either repository_url or code_snippet is required")
    
    start_time = time.time()
    
    try:
        # Determine analysis type
        analysis_type = "repository" if request.repository_url else "code"
        
        # Use existing working endpoints
        import httpx
        
        if analysis_type == "repository":
            # Use the existing working scan/bailey endpoint
            async with httpx.AsyncClient() as client:
                url = f"{API_BASE_URL}/scan/bailey"
                response = await client.post(url, json={
                    "repo_url": request.repository_url,
                    "language": request.language
                })
                if response.status_code == 200:
                    result = response.json()
                else:
                    raise Exception(f"Brain analysis failed: {response.status_code}")
        else:
            # Use the existing working scan/bailey endpoint for code
            async with httpx.AsyncClient() as client:
                url = f"{API_BASE_URL}/scan/bailey"
                response = await client.post(url, json={
                    "code": request.code_snippet,
                    "language": request.language
                })
                if response.status_code == 200:
                    result = response.json()
                else:
                    raise Exception(f"Brain analysis failed: {response.status_code}")
        
        # Store analysis in database (no user_id for free analysis)
        analysis = Analysis(
            user_id=None,  # Anonymous analysis
            repository_url=request.repository_url,
            code_snippet=request.code_snippet,
            analysis_type=analysis_type,
            overall_score=result.get("overall_score", 0),
            code_quality_score=result.get("breakdown", {}).get("code_quality", {}).get("score", 0),
            business_model_score=result.get("breakdown", {}).get("business_model", {}).get("score", 0),
            investment_ready_score=result.get("breakdown", {}).get("investment_ready", {}).get("score", 0),
            verdict=result.get("verdict", "unknown"),
            weready_stamp_eligible=result.get("weready_stamp_eligible", False),
            success_probability=result.get("success_probability"),
            funding_timeline=result.get("funding_timeline"),
            credibility_score=result.get("credibility_score"),
            market_percentile=None,  # Not available in Bailey response
            issues_found=result.get("category_issues"),
            recommendations=result.get("recommendations"),
            brain_recommendations=result.get("brain_recommendations"),
            improvement_roadmap=result.get("improvement_roadmap"),
            competitive_moats=result.get("competitive_moats"),
            is_baseline=True,  # This is their first analysis
            files_analyzed=result.get("files_analyzed", 0),
            processing_time_ms=int((time.time() - start_time) * 1000)
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        # Create signup prompt based on results
        signup_prompt = create_signup_prompt(result)
        
        # Create enhanced free response - show substantial value but lock advanced features
        # Show 2 full recommendations + 1 partial, plus basic success metrics
        limited_recommendations = []
        total_recommendations = len(analysis.brain_recommendations) if analysis.brain_recommendations else 0
        
        if analysis.brain_recommendations and len(analysis.brain_recommendations) > 0:
            # Show first 2 recommendations with full details
            for i, rec in enumerate(analysis.brain_recommendations[:2]):
                limited_recommendations.append({
                    "recommendation": rec.get("recommendation"),
                    "priority": rec.get("priority"),
                    "evidence_source_name": rec.get("evidence_source_name"),
                    "evidence_organization": rec.get("evidence_organization"),
                    "citation": rec.get("citation"),
                    "confidence": rec.get("confidence"),
                    "similar_success_cases": rec.get("similar_success_cases"),
                    "market_context": rec.get("market_context"),
                    "specific_action": rec.get("specific_action"),
                    "timeline": rec.get("timeline"),
                    "supporting_evidence": rec.get("supporting_evidence", [])
                })
            
            # Show third recommendation with partial details (title only, locked specifics)
            if len(analysis.brain_recommendations) > 2:
                third_rec = analysis.brain_recommendations[2]
                limited_recommendations.append({
                    "recommendation": third_rec.get("recommendation"),
                    "priority": third_rec.get("priority"),
                    "evidence_source_name": "🔒 Premium - Unlock for source",
                    "evidence_organization": "Sign up to see evidence",
                    "citation": "Additional insights available after signup",
                    "confidence": None,
                    "similar_success_cases": None,
                    "market_context": "🔒 More context available",
                    "specific_action": "🔒 Sign up for actionable steps",
                    "timeline": "🔒 Premium",
                    "supporting_evidence": []
                })
        
        # Show actual roadmap with some lock indicators
        limited_roadmap = analysis.improvement_roadmap if analysis.improvement_roadmap else {
            "immediate": ["Fix critical security issues", "Improve error handling"],
            "short_term": ["Complete business model validation", "Enhance testing"],
            "long_term": ["Scale for Series A", "Build competitive moats"]
        }
        
        # Convert to response format (ENHANCED FREE VERSION - Show substantial value)
        response = AnalysisResponse(
            analysis_id=str(analysis.id),
            overall_score=analysis.overall_score,
            code_quality_score=analysis.code_quality_score,
            business_model_score=analysis.business_model_score,
            investment_ready_score=analysis.investment_ready_score,
            verdict=analysis.verdict,
            weready_stamp_eligible=analysis.weready_stamp_eligible,  # Show this - it's motivating
            success_probability=analysis.success_probability,  # Show success metrics - high value
            funding_timeline=analysis.funding_timeline,  # Show funding timeline - valuable
            credibility_score=analysis.credibility_score,  # Show credibility - builds trust
            market_percentile=analysis.market_percentile,  # Show percentile - competitive insight
            issues_found=analysis.issues_found,  # Show issues - actionable value
            recommendations=analysis.recommendations,  # Show standard recommendations
            bailey_recommendations=limited_recommendations,  # 2 full + 1 partial
            improvement_roadmap=limited_roadmap,  # Full roadmap (legacy)
            intelligent_roadmap=result.get("intelligent_roadmap"),  # Enhanced roadmap
            competitive_moats=analysis.competitive_moats,  # Show moats - valuable insight
            breakdown=result.get("breakdown"),  # Rich category analysis
            credibility_methodology=result.get("credibility_methodology"),  # Bailey Intelligence
            files_analyzed=analysis.files_analyzed,
            is_free_analysis=True,
            signup_prompt=enhance_signup_prompt_with_premium_features(signup_prompt, total_recommendations)
        )
        
        return response
        
    except Exception as e:
        # Return error analysis but don't fail completely
        error_analysis = Analysis(
            user_id=None,
            repository_url=request.repository_url,
            code_snippet=request.code_snippet,
            analysis_type=analysis_type,
            overall_score=0,
            code_quality_score=0,
            business_model_score=0,
            investment_ready_score=0,
            verdict="error",
            weready_stamp_eligible=False,
            files_analyzed=0,
            processing_time_ms=int((time.time() - start_time) * 1000)
        )
        
        db.add(error_analysis)
        db.commit()
        db.refresh(error_analysis)
        
        raise HTTPException(
            status_code=500, 
            detail=f"Analysis failed: {str(e)}"
        )

@router.get("/results/free/{analysis_id}")
async def get_free_analysis_results(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """
    Get results of a free analysis by ID
    Allows viewing results without authentication
    """
    
    try:
        analysis_id_int = int(analysis_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid analysis ID")
    
    analysis = db.query(Analysis).filter(
        Analysis.id == analysis_id_int,
        Analysis.user_id.is_(None)  # Only free analyses
    ).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    # Create signup prompt
    signup_prompt = create_signup_prompt_from_analysis(analysis)
    
    return {
        "analysis_id": str(analysis.id),
        "overall_score": analysis.overall_score,
        "code_quality_score": analysis.code_quality_score,
        "business_model_score": analysis.business_model_score,
        "investment_ready_score": analysis.investment_ready_score,
        "verdict": analysis.verdict,
        "weready_stamp_eligible": analysis.weready_stamp_eligible,
        "success_probability": analysis.success_probability,
        "funding_timeline": analysis.funding_timeline,
        "credibility_score": analysis.credibility_score,
        "market_percentile": analysis.market_percentile,
        "issues_found": analysis.issues_found,
        "recommendations": analysis.recommendations,
        "bailey_recommendations": analysis.brain_recommendations,
        "improvement_roadmap": analysis.improvement_roadmap,
        "competitive_moats": analysis.competitive_moats,
        "files_analyzed": analysis.files_analyzed,
        "created_at": analysis.created_at.isoformat(),
        "is_free_analysis": True,
        "signup_prompt": signup_prompt
    }

def create_signup_prompt(analysis_result: Dict[str, Any]) -> Dict[str, Any]:
    """Create compelling signup prompt based on analysis results"""
    
    score = analysis_result.get("overall_score", 0)
    issues = analysis_result.get("category_issues", {})
    recommendations = analysis_result.get("brain_recommendations", [])
    
    # Count total issues
    total_issues = sum(len(issue_list) for issue_list in issues.values() if isinstance(issue_list, list))
    
    if score >= 80:
        # High score - focus on maintaining/improving
        return {
            "title": "Great score! Want to track your progress over time?",
            "subtitle": "Your analysis is saved - create an account to monitor improvements",
            "benefits": [
                "Save this analysis to your dashboard",
                "Re-analyze after making changes",
                "Track score improvements over time",
                "Get progress notifications"
            ],
            "cta": "Save Progress",
            "urgency": "See how your score changes as you develop"
        }
    elif score >= 60:
        # Medium score - focus on improvement potential
        return {
            "title": "Want to track your improvements?",
            "subtitle": f"Save this analysis and see your progress toward 80+ score",
            "benefits": [
                "Save this baseline analysis",
                "Re-run analysis after implementing fixes",
                "Track which recommendations helped most",
                "Get before/after score comparisons"
            ],
            "cta": "Track Progress",
            "urgency": "Most founders improve 10-15 points in their first week"
        }
    else:
        # Low score - focus on critical issues
        critical_issues = len([rec for rec in recommendations if rec.get("priority") == "critical"])
        return {
            "title": "Track your improvement journey",
            "subtitle": "Save this analysis and monitor progress as you fix issues",
            "benefits": [
                "Save this baseline analysis",
                "Track which fixes improve your score",
                "Get detailed progress reports",
                "See before/after comparisons"
            ],
            "cta": "Start Tracking",
            "urgency": "Monitor progress as you address critical issues"
        }

def enhance_signup_prompt_with_premium_features(base_prompt: Dict[str, Any], total_recommendations: int) -> Dict[str, Any]:
    """Enhance signup prompt with information about premium features"""
    
    enhanced_prompt = base_prompt.copy()
    
    # Calculate additional recommendations
    additional_recs = max(0, total_recommendations - 2)
    
    # Update title to emphasize additional value
    if additional_recs > 0:
        enhanced_prompt["title"] = f"🚀 Unlock {additional_recs} more recommendations + premium features"
    else:
        enhanced_prompt["title"] = "🚀 Unlock premium tracking & advanced features"
    
    enhanced_prompt["subtitle"] = "You're seeing the core analysis - upgrade for advanced insights"
    
    # Update benefits to show premium features
    enhanced_prompt["benefits"] = [
        "📊 Advanced analytics & trend tracking",
        "🔄 Re-analysis & progress comparison",
        "📧 Weekly improvement notifications", 
        "💡 Personalized next-step recommendations",
        "📈 Benchmark against similar startups",
        "🏆 Priority support & expert review"
    ]
    
    # Update CTA
    enhanced_prompt["cta"] = "Upgrade to Premium"
    enhanced_prompt["urgency"] = "Track your progress and stay ahead of 90% of startups"
    
    return enhanced_prompt

def create_signup_prompt_from_analysis(analysis: Analysis) -> Dict[str, Any]:
    """Create signup prompt from stored analysis"""
    
    score = analysis.overall_score
    issues = analysis.issues_found or {}
    recommendations = analysis.brain_recommendations or []
    
    total_issues = sum(len(issue_list) for issue_list in issues.values() if isinstance(issue_list, list))
    
    if score >= 80:
        return {
            "title": "Track your progress to maintain Series A readiness",
            "subtitle": f"Current score: {score:.0f}/100",
            "benefits": [
                "Monitor score changes over time",
                "Weekly progress tracking",
                "Bailey Intelligence insights",
                "Team collaboration features"
            ],
            "cta": "Start tracking progress",
            "urgency": None
        }
    else:
        return {
            "title": f"Improve your score by fixing {total_issues} issues",
            "subtitle": f"Target: {80 - score:.0f} more points for Series A readiness",
            "benefits": [
                "Detailed improvement roadmap",
                "Track fixes and score improvements",
                "Before/after comparisons",
                "Priority-based issue resolution"
            ],
            "cta": "Start improvement tracking",
            "urgency": "See your score improve in real-time"
        }