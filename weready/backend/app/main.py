from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from core.hallucination_detector import HallucinationDetector
from core.weready_scorer import WeReadyScorer
from core.weready_brain import weready_brain, IntelligentWeReadyScore, BrainRecommendation
from core.learning_engine import learning_engine, OutcomeType
from core.bailey import bailey
from core.bailey_connectors import bailey_pipeline
from services.github_analyzer import GitHubAnalyzer

app = FastAPI(title="WeReady API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = HallucinationDetector()
github_analyzer = GitHubAnalyzer()
weready_scorer = WeReadyScorer()
brain = weready_brain

class CodeScanRequest(BaseModel):
    code: Optional[str] = None
    language: str = "python"
    repo_url: Optional[str] = None

class BrainRecommendationResponse(BaseModel):
    recommendation: str
    priority: str
    evidence_source_name: str
    evidence_organization: str
    citation: str
    confidence: float
    similar_success_cases: int
    market_context: str
    specific_action: str
    timeline: str

class WeReadyScoreResponse(BaseModel):
    overall_score: int
    verdict: str
    weready_stamp_eligible: bool
    breakdown: Dict[str, Dict[str, Any]]
    next_steps: List[str]
    improvement_roadmap: Dict[str, List[str]]
    repo_info: Optional[Dict[str, Any]] = None
    files_analyzed: int = 0
    market_context: Dict[str, str]
    
    # Brain enhancements
    credibility_score: Optional[int] = None
    intelligence_boost: Optional[int] = None
    market_timing_score: Optional[int] = None
    competitive_advantage_score: Optional[int] = None
    brain_recommendations: Optional[List[BrainRecommendationResponse]] = None
    success_probability: Optional[float] = None
    funding_timeline_prediction: Optional[str] = None
    key_risks: Optional[List[str]] = None
    competitive_moats: Optional[List[str]] = None
    pattern_matches: Optional[List[Dict[str, Any]]] = None
    learning_confidence: Optional[float] = None
    
    # Legacy fields for backward compatibility
    hallucination_score: float = 0.0
    hallucinated_packages: List[str] = []
    action_required: str = ""

class UserFeedbackRequest(BaseModel):
    scan_id: str
    helpful_recommendations: Optional[List[str]] = None
    unhelpful_recommendations: Optional[List[str]] = None
    general_feedback: Optional[str] = None
    rating: Optional[int] = None  # 1-5 rating

class OutcomeReportRequest(BaseModel):
    scan_id: str
    outcome_type: str  # "funding_success", "funding_failure", "product_launch", etc.
    outcome_details: Dict[str, Any]
    notes: Optional[str] = None

@app.get("/")
async def root():
    return {
        "status": "alive",
        "message": "WeReady API - The evidence-based reality check every AI-first founder needs.",
        "features": ["hallucination_detection", "github_analysis", "weready_score", "intelligent_recommendations", "pattern_learning"],
        "brain_status": "active - learning from every scan",
        "market_stats": {
            "ai_adoption": "76% of developers use AI tools",
            "trust_rate": "Only 33% trust their accuracy",
            "hallucination_rate": "20% of AI code contains fake packages"
        }
    }

@app.post("/scan/brain", response_model=WeReadyScoreResponse)
async def brain_scan(request: CodeScanRequest):
    """Get intelligent WeReady Score with brain-powered insights, credible sources, and learning"""
    
    # Validate input
    if not request.code and not request.repo_url:
        raise HTTPException(status_code=400, detail="Either code or repo_url must be provided")
    
    # Handle GitHub repository analysis
    if request.repo_url:
        try:
            # Analyze GitHub repository
            repo_analysis = await github_analyzer.analyze_repository(request.repo_url, request.language)
            
            if "error" in repo_analysis:
                raise HTTPException(status_code=400, detail=repo_analysis["error"])
            
            # Combine code from all files for analysis
            combined_code = ""
            ai_likelihood_scores = []
            
            for sample in repo_analysis["code_samples"]:
                combined_code += sample["content"] + "\n\n"
                ai_likelihood_scores.append(github_analyzer.estimate_ai_likelihood(sample["content"]))
            
            # Calculate average AI likelihood
            avg_ai_likelihood = sum(ai_likelihood_scores) / len(ai_likelihood_scores) if ai_likelihood_scores else 0.0
            
            # Detect hallucinations if we have code
            hallucination_result = None
            if combined_code.strip():
                hallucination_result = await detector.detect(combined_code, request.language)
                hallucination_data = {
                    "hallucination_score": hallucination_result.score,
                    "hallucinated_packages": hallucination_result.hallucinated_packages,
                    "confidence": hallucination_result.confidence,
                    "ai_likelihood": avg_ai_likelihood
                }
            else:
                hallucination_data = {
                    "hallucination_score": 0.0,
                    "hallucinated_packages": [],
                    "confidence": 0.8,
                    "ai_likelihood": 0.0
                }
            
            # Use brain intelligence for analysis
            intelligent_score = brain.analyze_with_intelligence(
                hallucination_result=hallucination_data,
                repo_analysis=repo_analysis,
                user_context={"language": request.language}
            )
            
            # Convert brain recommendations to response format
            brain_recs = []
            for rec in intelligent_score.brain_recommendations:
                brain_recs.append(BrainRecommendationResponse(
                    recommendation=rec.recommendation,
                    priority=rec.priority,
                    evidence_source_name=rec.evidence_source.name,
                    evidence_organization=rec.evidence_source.organization,
                    citation=rec.citation,
                    confidence=rec.confidence,
                    similar_success_cases=rec.similar_success_cases,
                    market_context=rec.market_context,
                    specific_action=rec.specific_action,
                    timeline=rec.timeline
                ))
            
            # Generate base report for compatibility
            base_report = weready_scorer.generate_weready_report(intelligent_score.base_score)
            
            return WeReadyScoreResponse(
                **base_report,
                repo_info=repo_analysis.get("repo_info"),
                files_analyzed=repo_analysis["files_analyzed"],
                
                # Brain enhancements
                credibility_score=intelligent_score.credibility_score,
                intelligence_boost=intelligent_score.intelligence_boost,
                market_timing_score=intelligent_score.market_timing_score,
                competitive_advantage_score=intelligent_score.competitive_advantage_score,
                brain_recommendations=brain_recs,
                success_probability=intelligent_score.success_probability,
                funding_timeline_prediction=intelligent_score.funding_timeline_prediction,
                key_risks=intelligent_score.key_risks,
                competitive_moats=intelligent_score.competitive_moats,
                pattern_matches=intelligent_score.pattern_matches,
                learning_confidence=intelligent_score.learning_confidence,
                
                # Legacy fields for backward compatibility
                hallucination_score=hallucination_data["hallucination_score"],
                hallucinated_packages=hallucination_data["hallucinated_packages"],
                action_required=intelligent_score.base_score.next_steps[0] if intelligent_score.base_score.next_steps else "Analysis complete"
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Brain analysis failed: {str(e)}")
    
    # Handle manual code analysis
    else:
        try:
            # Detect hallucinations
            hallucination_result = await detector.detect(request.code, request.language)
            ai_likelihood = github_analyzer.estimate_ai_likelihood(request.code)
            
            # Prepare data for brain analysis
            hallucination_data = {
                "hallucination_score": hallucination_result.score,
                "hallucinated_packages": hallucination_result.hallucinated_packages,
                "confidence": hallucination_result.confidence,
                "ai_likelihood": ai_likelihood
            }
            
            # Use brain intelligence for analysis
            intelligent_score = brain.analyze_with_intelligence(
                hallucination_result=hallucination_data,
                user_context={"language": request.language}
            )
            
            # Convert brain recommendations to response format
            brain_recs = []
            for rec in intelligent_score.brain_recommendations:
                brain_recs.append(BrainRecommendationResponse(
                    recommendation=rec.recommendation,
                    priority=rec.priority,
                    evidence_source_name=rec.evidence_source.name,
                    evidence_organization=rec.evidence_source.organization,
                    citation=rec.citation,
                    confidence=rec.confidence,
                    similar_success_cases=rec.similar_success_cases,
                    market_context=rec.market_context,
                    specific_action=rec.specific_action,
                    timeline=rec.timeline
                ))
            
            # Generate base report for compatibility
            base_report = weready_scorer.generate_weready_report(intelligent_score.base_score)
            
            return WeReadyScoreResponse(
                **base_report,
                files_analyzed=1,
                
                # Brain enhancements
                credibility_score=intelligent_score.credibility_score,
                intelligence_boost=intelligent_score.intelligence_boost,
                market_timing_score=intelligent_score.market_timing_score,
                competitive_advantage_score=intelligent_score.competitive_advantage_score,
                brain_recommendations=brain_recs,
                success_probability=intelligent_score.success_probability,
                funding_timeline_prediction=intelligent_score.funding_timeline_prediction,
                key_risks=intelligent_score.key_risks,
                competitive_moats=intelligent_score.competitive_moats,
                pattern_matches=intelligent_score.pattern_matches,
                learning_confidence=intelligent_score.learning_confidence,
                
                # Legacy fields for backward compatibility
                hallucination_score=hallucination_result.score,
                hallucinated_packages=hallucination_result.hallucinated_packages,
                action_required=intelligent_score.base_score.next_steps[0] if intelligent_score.base_score.next_steps else "Analysis complete"
            )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Manual code analysis failed: {str(e)}")

@app.post("/scan/quick", response_model=WeReadyScoreResponse)
async def quick_scan(request: CodeScanRequest):
    """Get comprehensive WeReady Score via manual input or GitHub repo analysis (legacy endpoint)"""
    
    # Validate input
    if not request.code and not request.repo_url:
        raise HTTPException(status_code=400, detail="Either code or repo_url must be provided")
    
    # Handle GitHub repository analysis
    if request.repo_url:
        try:
            # Analyze GitHub repository
            repo_analysis = await github_analyzer.analyze_repository(request.repo_url, request.language)
            
            if "error" in repo_analysis:
                raise HTTPException(status_code=400, detail=repo_analysis["error"])
            
            # Combine code from all files for analysis
            combined_code = ""
            ai_likelihood_scores = []
            
            for sample in repo_analysis["code_samples"]:
                combined_code += sample["content"] + "\n\n"
                ai_likelihood_scores.append(github_analyzer.estimate_ai_likelihood(sample["content"]))
            
            if not combined_code.strip():
                # Return basic response for repos with no analyzable code
                basic_report = weready_scorer.generate_weready_report(
                    weready_scorer.calculate_weready_score()
                )
                return WeReadyScoreResponse(
                    **basic_report,
                    repo_info=repo_analysis.get("repo_info"),
                    files_analyzed=repo_analysis["files_analyzed"],
                    hallucination_score=0.0,
                    hallucinated_packages=[],
                    action_required="No code found to analyze. Make sure the repository contains source files."
                )
            
            # Detect hallucinations in combined code
            hallucination_result = await detector.detect(combined_code, request.language)
            
            # Calculate average AI likelihood
            avg_ai_likelihood = sum(ai_likelihood_scores) / len(ai_likelihood_scores) if ai_likelihood_scores else 0.0
            
            # Prepare data for WeReady Score calculation
            hallucination_data = {
                "hallucination_score": hallucination_result.score,
                "hallucinated_packages": hallucination_result.hallucinated_packages,
                "confidence": hallucination_result.confidence,
                "ai_likelihood": avg_ai_likelihood
            }
            
            # Calculate comprehensive WeReady Score
            weready_score = weready_scorer.calculate_weready_score(
                hallucination_result=hallucination_data,
                repo_analysis=repo_analysis
            )
            
            # Generate comprehensive report
            report = weready_scorer.generate_weready_report(weready_score)
            
            return WeReadyScoreResponse(
                **report,
                repo_info=repo_analysis.get("repo_info"),
                files_analyzed=repo_analysis["files_analyzed"],
                # Legacy fields for backward compatibility
                hallucination_score=hallucination_result.score,
                hallucinated_packages=hallucination_result.hallucinated_packages,
                action_required=weready_score.next_steps[0] if weready_score.next_steps else "Analysis complete"
            )
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Repository analysis failed: {str(e)}")
    
    # Handle manual code analysis
    else:
        # Detect hallucinations
        hallucination_result = await detector.detect(request.code, request.language)
        ai_likelihood = github_analyzer.estimate_ai_likelihood(request.code)
        
        # Prepare data for WeReady Score calculation
        hallucination_data = {
            "hallucination_score": hallucination_result.score,
            "hallucinated_packages": hallucination_result.hallucinated_packages,
            "confidence": hallucination_result.confidence,
            "ai_likelihood": ai_likelihood
        }
        
        # Calculate comprehensive WeReady Score
        weready_score = weready_scorer.calculate_weready_score(
            hallucination_result=hallucination_data
        )
        
        # Generate comprehensive report
        report = weready_scorer.generate_weready_report(weready_score)
        
        return WeReadyScoreResponse(
            **report,
            files_analyzed=1,
            # Legacy fields for backward compatibility
            hallucination_score=hallucination_result.score,
            hallucinated_packages=hallucination_result.hallucinated_packages,
            action_required=weready_score.next_steps[0] if weready_score.next_steps else "Analysis complete"
        )


@app.post("/feedback")
async def submit_feedback(feedback: UserFeedbackRequest):
    """Submit user feedback to improve WeReady's recommendations"""
    
    try:
        result = learning_engine.record_user_feedback(
            record_id=feedback.scan_id,
            feedback={
                "helpful_recommendations": feedback.helpful_recommendations,
                "unhelpful_recommendations": feedback.unhelpful_recommendations,
                "general_feedback": feedback.general_feedback,
                "rating": feedback.rating
            }
        )
        
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
            
        return {
            "status": "success",
            "message": "Thank you! Your feedback helps WeReady learn and improve.",
            "learning_triggered": result.get("learning_triggered", False)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process feedback: {str(e)}")

@app.post("/outcome")
async def report_outcome(outcome: OutcomeReportRequest):
    """Report real-world outcomes to improve WeReady's predictions"""
    
    try:
        # Map string to enum
        outcome_type_map = {
            "funding_success": OutcomeType.FUNDING_SUCCESS,
            "funding_failure": OutcomeType.FUNDING_FAILURE,
            "product_launch": OutcomeType.PRODUCT_LAUNCH,
            "user_growth": OutcomeType.USER_GROWTH
        }
        
        outcome_enum = outcome_type_map.get(outcome.outcome_type)
        if not outcome_enum:
            raise HTTPException(status_code=400, detail="Invalid outcome type")
            
        result = learning_engine.record_outcome(
            record_id=outcome.scan_id,
            outcome_type=outcome_enum,
            outcome_details=outcome.outcome_details
        )
        
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
            
        return {
            "status": "success",
            "message": "Outcome recorded! This helps WeReady predict future success better.",
            "patterns_updated": result.get("patterns_updated", False)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record outcome: {str(e)}")

@app.get("/brain/credibility")
async def get_credibility_report():
    """Get WeReady's credibility report showing evidence sources and learning stats"""
    
    try:
        credibility_report = brain.get_brain_credibility_report()
        return {
            "status": "success",
            "report": credibility_report,
            "summary": "WeReady's intelligence is backed by authoritative sources and continuous learning"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate credibility report: {str(e)}")

@app.get("/brain/stats")
async def get_learning_stats():
    """Get statistics about WeReady's learning and pattern recognition"""
    
    try:
        learning_stats = learning_engine.get_learning_stats()
        return {
            "status": "success",
            "learning_stats": learning_stats,
            "message": "WeReady gets smarter with every scan and outcome report"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get learning stats: {str(e)}")

@app.get("/bailey/stats")
async def get_bailey_stats():
    """Get Bailey's knowledge engine statistics and data sources"""
    
    try:
        bailey_stats = bailey.get_bailey_stats()
        return {
            "status": "success",
            "bailey_stats": bailey_stats,
            "message": "Bailey: WeReady's constantly-learning credibility knowledge engine"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get Bailey stats: {str(e)}")

@app.post("/bailey/ingest")
async def trigger_bailey_ingestion():
    """Trigger Bailey to ingest latest data from all sources"""
    
    try:
        results = await bailey_pipeline.run_full_ingestion()
        return {
            "status": "success",
            "ingestion_results": results,
            "message": f"Bailey ingested {results['knowledge_points_added']} new knowledge points from {results['sources_processed']} sources"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bailey ingestion failed: {str(e)}")

@app.post("/bailey/quick-update")
async def bailey_quick_update():
    """Quick Bailey update from fast sources (GitHub, Reddit)"""
    
    try:
        results = await bailey_pipeline.run_incremental_update(["github", "reddit"])
        return {
            "status": "success",
            "update_results": results,
            "message": f"Bailey quick update: {results['knowledge_points_added']} new knowledge points in {results['duration']:.1f}s"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bailey quick update failed: {str(e)}")

@app.get("/bailey/knowledge/{category}")
async def get_bailey_knowledge(category: str, min_confidence: float = 0.7):
    """Get Bailey's knowledge for a specific category"""
    
    try:
        knowledge_points = bailey.get_knowledge_by_category(category, min_confidence)
        
        formatted_knowledge = []
        for point in knowledge_points:
            formatted_knowledge.append({
                "id": point.id,
                "content": point.content,
                "source_name": point.source.name,
                "source_organization": point.source.organization,
                "confidence": point.confidence,
                "freshness": point.freshness.value,
                "numerical_value": point.numerical_value,
                "last_verified": point.last_verified.isoformat() if point.last_verified else None
            })
        
        return {
            "status": "success",
            "category": category,
            "knowledge_points": formatted_knowledge,
            "total_points": len(knowledge_points),
            "message": f"Found {len(knowledge_points)} knowledge points for {category}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get Bailey knowledge: {str(e)}")

@app.get("/bailey/sources")
async def get_bailey_sources():
    """Get information about Bailey's data sources"""
    
    try:
        sources = []
        for source_id, source in bailey.knowledge_sources.items():
            sources.append({
                "id": source_id,
                "name": source.name,
                "organization": source.organization,
                "tier": source.tier.value,
                "credibility_score": source.credibility_score,
                "cost": source.cost,
                "rate_limit": source.rate_limit,
                "data_categories": source.data_categories
            })
        
        # Sort by credibility score
        sources.sort(key=lambda x: x["credibility_score"], reverse=True)
        
        return {
            "status": "success",
            "sources": sources,
            "total_sources": len(sources),
            "free_sources": len([s for s in sources if s["cost"] == 0]),
            "message": "Bailey's authoritative data sources for maximum credibility"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get Bailey sources: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "detectors": {
            "hallucination": "active",
            "github_analyzer": "active",
            "weready_brain": "active",
            "learning_engine": "active",
            "bailey_knowledge_engine": "active"
        },
        "intelligence": {
            "credible_sources": len(brain.credible_sources.sources),
            "bailey_sources": len(bailey.knowledge_sources),
            "bailey_knowledge_points": len(bailey.knowledge_points),
            "learning_records": len(brain.learning_engine.learning_records),
            "pattern_count": len(brain.learning_engine.patterns)
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3001, reload=True)
