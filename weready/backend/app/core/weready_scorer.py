"""
WeReady Score Calculation System
===============================
Calculates the comprehensive WeReady Score based on:
- Code Quality (40%): Hallucination detection, structure, best practices
- Business Model (30%): Revenue model, market validation, unit economics  
- Investment Readiness (30%): Metrics, scalability, fundability

This is the core differentiator that no competitor has.
"""

from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum
import json

class ScoreCategory(Enum):
    CODE_QUALITY = "code_quality"
    BUSINESS_MODEL = "business_model"
    INVESTMENT_READY = "investment_ready"

@dataclass
class ScoreBreakdown:
    category: ScoreCategory
    score: float  # 0-100
    weight: float  # 0-1
    status: str  # "excellent", "good", "needs_work", "critical"
    issues: List[str]
    recommendations: List[str]
    weighted_contribution: float

@dataclass
class WeReadyScore:
    overall_score: int  # 0-100
    breakdown: List[ScoreBreakdown]
    verdict: str  # "ready_to_ship", "needs_work", "critical_issues", "not_ready"
    next_steps: List[str]
    weready_stamp_eligible: bool
    improvement_roadmap: Dict[str, List[str]]

class WeReadyScorer:
    """Calculate comprehensive WeReady Scores for AI-first startups"""
    
    def __init__(self):
        # Scoring weights (must sum to 1.0)
        self.weights = {
            ScoreCategory.CODE_QUALITY: 0.40,      # 40% - Core differentiator
            ScoreCategory.BUSINESS_MODEL: 0.30,    # 30% - Critical for success
            ScoreCategory.INVESTMENT_READY: 0.30   # 30% - VC perspective
        }
        
        # Score thresholds for verdicts
        self.score_thresholds = {
            "ready_to_ship": 85,    # Top 15% - WeReady stamp eligible
            "needs_work": 70,       # Needs improvements but on track
            "critical_issues": 50,  # Major problems to address
            "not_ready": 0          # Significant work required
        }
    
    def calculate_weready_score(
        self, 
        hallucination_result: Dict = None,
        repo_analysis: Dict = None,
        business_data: Dict = None,
        investment_data: Dict = None
    ) -> WeReadyScore:
        """Calculate comprehensive WeReady Score"""
        
        # Calculate individual category scores
        code_score = self._calculate_code_quality_score(hallucination_result, repo_analysis)
        business_score = self._calculate_business_model_score(business_data)
        investment_score = self._calculate_investment_readiness_score(investment_data)
        
        # Calculate weighted overall score
        overall_score = (
            code_score.score * self.weights[ScoreCategory.CODE_QUALITY] +
            business_score.score * self.weights[ScoreCategory.BUSINESS_MODEL] +
            investment_score.score * self.weights[ScoreCategory.INVESTMENT_READY]
        )
        
        # Generate verdict
        verdict = self._determine_verdict(overall_score)
        
        # Check WeReady stamp eligibility
        weready_stamp_eligible = (
            overall_score >= self.score_thresholds["ready_to_ship"] and
            all(breakdown.score >= 70 for breakdown in [code_score, business_score, investment_score])
        )
        
        # Generate next steps and improvement roadmap
        next_steps, improvement_roadmap = self._generate_improvement_plan(
            [code_score, business_score, investment_score], overall_score
        )
        
        return WeReadyScore(
            overall_score=int(overall_score),
            breakdown=[code_score, business_score, investment_score],
            verdict=verdict,
            next_steps=next_steps,
            weready_stamp_eligible=weready_stamp_eligible,
            improvement_roadmap=improvement_roadmap
        )
    
    def _calculate_code_quality_score(self, hallucination_result: Dict = None, repo_analysis: Dict = None) -> ScoreBreakdown:
        """Calculate Code Quality score (40% of overall)"""
        
        if not hallucination_result:
            return ScoreBreakdown(
                category=ScoreCategory.CODE_QUALITY,
                score=50.0,
                weight=self.weights[ScoreCategory.CODE_QUALITY],
                status="needs_work",
                issues=["No code analysis performed"],
                recommendations=["Analyze your codebase for quality assessment"],
                weighted_contribution=50.0 * self.weights[ScoreCategory.CODE_QUALITY]
            )
        
        base_score = 100.0
        issues = []
        recommendations = []
        
        # Hallucination penalty (most critical)
        hallucination_score = hallucination_result.get('hallucination_score', 0)
        if hallucination_score > 0:
            penalty = min(hallucination_score * 100, 60)  # Max 60 point penalty
            base_score -= penalty
            fake_packages = len(hallucination_result.get('hallucinated_packages', []))
            issues.append(f"{fake_packages} hallucinated packages detected")
            recommendations.append(f"Remove or replace {fake_packages} fake packages immediately")
        
        # AI likelihood factor
        ai_likelihood = hallucination_result.get('ai_likelihood', 0)
        if ai_likelihood > 0.7:
            base_score -= 15  # High AI generation penalty
            issues.append(f"High AI-generation likelihood ({ai_likelihood:.0%})")
            recommendations.append("Add comprehensive testing for AI-generated code")
        elif ai_likelihood > 0.4:
            base_score -= 5   # Moderate AI generation penalty
            issues.append(f"Moderate AI-generation detected ({ai_likelihood:.0%})")
            recommendations.append("Review and validate AI-generated code sections")
        
        # Repository structure bonus (if available)
        if repo_analysis:
            files_analyzed = repo_analysis.get('files_analyzed', 0)
            if files_analyzed > 10:
                base_score += 5  # Well-structured project bonus
            elif files_analyzed < 3:
                base_score -= 10
                issues.append("Very small codebase - limited analysis possible")
                recommendations.append("Expand codebase or provide more comprehensive code samples")
        
        # Confidence factor
        confidence = hallucination_result.get('confidence', 0.8)
        if confidence < 0.7:
            base_score -= 5
            issues.append("Low analysis confidence due to parsing issues")
        
        # Ensure score bounds
        final_score = max(0, min(100, base_score))
        
        # Determine status
        if final_score >= 90:
            status = "excellent"
        elif final_score >= 75:
            status = "good"
        elif final_score >= 50:
            status = "needs_work"  
        else:
            status = "critical"
        
        # Default recommendations for good scores
        if final_score >= 80 and not recommendations:
            recommendations.append("Code quality looks good! Ready for business model validation.")
        
        return ScoreBreakdown(
            category=ScoreCategory.CODE_QUALITY,
            score=final_score,
            weight=self.weights[ScoreCategory.CODE_QUALITY],
            status=status,
            issues=issues,
            recommendations=recommendations,
            weighted_contribution=final_score * self.weights[ScoreCategory.CODE_QUALITY]
        )
    
    def _calculate_business_model_score(self, business_data: Dict = None) -> ScoreBreakdown:
        """Calculate Business Model score (30% of overall) - Placeholder for now"""
        
        # Placeholder scoring until we implement business model analysis
        if not business_data:
            return ScoreBreakdown(
                category=ScoreCategory.BUSINESS_MODEL,
                score=60.0,  # Neutral score for MVP
                weight=self.weights[ScoreCategory.BUSINESS_MODEL],
                status="needs_work",
                issues=["Business model analysis not yet implemented"],
                recommendations=[
                    "Define your revenue model and pricing strategy",
                    "Validate market demand with potential customers", 
                    "Calculate unit economics including AI API costs",
                    "Identify your target customer segments"
                ],
                weighted_contribution=60.0 * self.weights[ScoreCategory.BUSINESS_MODEL]
            )
        
        # TODO: Implement actual business model scoring
        # Will include: revenue model clarity, market validation, unit economics, etc.
        
        return ScoreBreakdown(
            category=ScoreCategory.BUSINESS_MODEL,
            score=70.0,
            weight=self.weights[ScoreCategory.BUSINESS_MODEL],
            status="good",
            issues=[],
            recommendations=["Continue developing business model"],
            weighted_contribution=70.0 * self.weights[ScoreCategory.BUSINESS_MODEL]
        )
    
    def _calculate_investment_readiness_score(self, investment_data: Dict = None) -> ScoreBreakdown:
        """Calculate Investment Readiness score (30% of overall) - Placeholder for now"""
        
        # Placeholder scoring until we implement investment readiness analysis
        if not investment_data:
            return ScoreBreakdown(
                category=ScoreCategory.INVESTMENT_READY,
                score=55.0,  # Lower baseline - investment readiness is hard
                weight=self.weights[ScoreCategory.INVESTMENT_READY],
                status="needs_work", 
                issues=["Investment readiness analysis not yet implemented"],
                recommendations=[
                    "Establish key metrics tracking (ARR, CAC, LTV)",
                    "Achieve product-market fit with early customers",
                    "Build a scalable go-to-market strategy",
                    "Prepare financial projections and unit economics",
                    "Document your competitive advantages and moat"
                ],
                weighted_contribution=55.0 * self.weights[ScoreCategory.INVESTMENT_READY]
            )
        
        # TODO: Implement actual investment readiness scoring
        # Will include: metrics, traction, scalability, team, market size, etc.
        
        return ScoreBreakdown(
            category=ScoreCategory.INVESTMENT_READY,
            score=65.0,
            weight=self.weights[ScoreCategory.INVESTMENT_READY],
            status="needs_work",
            issues=[],
            recommendations=["Work on investment readiness metrics"],
            weighted_contribution=65.0 * self.weights[ScoreCategory.INVESTMENT_READY]
        )
    
    def _determine_verdict(self, overall_score: float) -> str:
        """Determine verdict based on overall score"""
        
        if overall_score >= self.score_thresholds["ready_to_ship"]:
            return "ready_to_ship"
        elif overall_score >= self.score_thresholds["needs_work"]:
            return "needs_work"
        elif overall_score >= self.score_thresholds["critical_issues"]:
            return "critical_issues"
        else:
            return "not_ready"
    
    def _generate_improvement_plan(
        self, 
        breakdowns: List[ScoreBreakdown], 
        overall_score: float
    ) -> tuple[List[str], Dict[str, List[str]]]:
        """Generate next steps and improvement roadmap"""
        
        next_steps = []
        improvement_roadmap = {
            "immediate": [],      # 0-2 weeks  
            "short_term": [],     # 2-8 weeks
            "long_term": []       # 2+ months
        }
        
        # Sort categories by score (worst first)
        sorted_breakdowns = sorted(breakdowns, key=lambda x: x.score)
        
        # Generate immediate next steps (focus on worst category)
        worst_category = sorted_breakdowns[0]
        if worst_category.score < 70:
            next_steps.append(f"🚨 Priority: Fix {worst_category.category.value.replace('_', ' ')}")
            improvement_roadmap["immediate"].extend(worst_category.recommendations[:2])
        
        # Add category-specific improvements
        for breakdown in sorted_breakdowns:
            category_name = breakdown.category.value.replace('_', ' ').title()
            
            if breakdown.score < 50:
                improvement_roadmap["immediate"].append(f"Address critical {category_name.lower()} issues")
            elif breakdown.score < 75:
                improvement_roadmap["short_term"].extend(breakdown.recommendations[:1])
            else:
                improvement_roadmap["long_term"].extend(breakdown.recommendations[:1])
        
        # Overall score-based next steps
        if overall_score >= 85:
            next_steps.append("🎉 You're WeReady! Consider applying for the WeReady Stamp")
            improvement_roadmap["short_term"].append("Document your success story")
        elif overall_score >= 70:
            next_steps.append("🚀 Close to WeReady! Focus on your lowest-scoring areas")
        elif overall_score >= 50:
            next_steps.append("⚠️ Significant improvements needed before launch")
        else:
            next_steps.append("🔧 Major work required. Start with code quality basics")
        
        # Remove duplicates and limit recommendations
        for key in improvement_roadmap:
            improvement_roadmap[key] = list(dict.fromkeys(improvement_roadmap[key]))[:3]
        
        return next_steps[:3], improvement_roadmap  # Limit to top 3 next steps
    
    def generate_weready_report(self, score: WeReadyScore) -> Dict:
        """Generate a comprehensive WeReady report"""
        
        return {
            "overall_score": score.overall_score,
            "verdict": score.verdict,
            "weready_stamp_eligible": score.weready_stamp_eligible,
            "breakdown": {
                breakdown.category.value: {
                    "score": int(breakdown.score),
                    "status": breakdown.status,
                    "weight": int(breakdown.weight * 100),
                    "issues": breakdown.issues,
                    "recommendations": breakdown.recommendations
                }
                for breakdown in score.breakdown
            },
            "next_steps": score.next_steps,
            "improvement_roadmap": score.improvement_roadmap,
            "market_context": {
                "percentile": self._calculate_percentile(score.overall_score),
                "comparison": self._generate_market_comparison(score.overall_score)
            }
        }
    
    def _calculate_percentile(self, score: int) -> str:
        """Calculate rough percentile based on score"""
        if score >= 90:
            return "Top 5%"
        elif score >= 80:
            return "Top 20%" 
        elif score >= 70:
            return "Top 40%"
        elif score >= 60:
            return "Top 60%"
        else:
            return "Bottom 40%"
    
    def _generate_market_comparison(self, score: int) -> str:
        """Generate market comparison text"""
        if score >= 85:
            return "Better than most YC startups at Demo Day"
        elif score >= 75:
            return "Above average for seed-stage startups"
        elif score >= 65:
            return "Typical early-stage startup score"
        elif score >= 50:
            return "Below average - needs significant work"
        else:
            return "Far below investment threshold"