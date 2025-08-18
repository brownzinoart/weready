"""
Analysis Tracking Models
========================
Track user analyses and progress over time for business improvement.
"""

from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Float, ForeignKey
from sqlalchemy.sql import func
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum as PyEnum
from app.models.user import Base

class Analysis(Base):
    """Track each WeReady analysis for progress monitoring"""
    
    __tablename__ = "analyses"
    
    # Primary identification
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True)  # Null for anonymous analyses
    
    # Analysis input
    repository_url = Column(String(500), nullable=True)
    code_snippet = Column(Text, nullable=True)
    analysis_type = Column(String(20), default="repository")  # "repository" or "code"
    
    # WeReady scores
    overall_score = Column(Float, nullable=False)
    code_quality_score = Column(Float, nullable=False)
    business_model_score = Column(Float, nullable=False)
    investment_ready_score = Column(Float, nullable=False)
    
    # Analysis results
    verdict = Column(String(50), nullable=False)  # "ready_to_ship", "needs_work", "critical_issues"
    weready_stamp_eligible = Column(Boolean, default=False)
    success_probability = Column(Float, nullable=True)
    funding_timeline = Column(String(100), nullable=True)
    credibility_score = Column(Float, nullable=True)
    market_percentile = Column(Integer, nullable=True)
    
    # Detailed results
    issues_found = Column(JSON, nullable=True)  # List of issues by category
    recommendations = Column(JSON, nullable=True)  # Bailey recommendations
    brain_recommendations = Column(JSON, nullable=True)  # WeReady Brain suggestions
    improvement_roadmap = Column(JSON, nullable=True)  # Immediate, short-term, long-term
    competitive_moats = Column(JSON, nullable=True)
    category_issues = Column(JSON, nullable=True)  # Issues by category
    
    # Progress tracking
    is_baseline = Column(Boolean, default=False)  # First analysis for this repo
    previous_analysis_id = Column(Integer, nullable=True)  # Reference to previous analysis
    score_change = Column(Float, nullable=True)  # Change from previous analysis
    issues_resolved_count = Column(Integer, default=0)  # Issues fixed since last analysis
    
    # Metadata
    files_analyzed = Column(Integer, default=0)
    processing_time_ms = Column(Integer, nullable=True)
    analysis_engine_version = Column(String(20), default="v1.0")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert analysis to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "repository_url": self.repository_url,
            "overall_score": self.overall_score,
            "code_quality_score": self.code_quality_score,
            "business_model_score": self.business_model_score,
            "investment_ready_score": self.investment_ready_score,
            "verdict": self.verdict,
            "weready_stamp_eligible": self.weready_stamp_eligible,
            "success_probability": self.success_probability,
            "funding_timeline": self.funding_timeline,
            "credibility_score": self.credibility_score,
            "market_percentile": self.market_percentile,
            "issues_found": self.issues_found,
            "recommendations": self.recommendations,
            "brain_recommendations": self.brain_recommendations,
            "improvement_roadmap": self.improvement_roadmap,
            "competitive_moats": self.competitive_moats,
            "category_issues": self.category_issues,
            "is_baseline": self.is_baseline,
            "score_change": self.score_change,
            "issues_resolved_count": self.issues_resolved_count,
            "files_analyzed": self.files_analyzed,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
    
    def calculate_progress(self, previous_analysis: 'Analysis') -> Dict[str, Any]:
        """Calculate progress metrics compared to previous analysis"""
        if not previous_analysis:
            return {"is_first_analysis": True}
        
        return {
            "is_first_analysis": False,
            "score_change": self.overall_score - previous_analysis.overall_score,
            "code_quality_change": self.code_quality_score - previous_analysis.code_quality_score,
            "business_model_change": self.business_model_score - previous_analysis.business_model_score,
            "investment_ready_change": self.investment_ready_score - previous_analysis.investment_ready_score,
            "days_between": (self.created_at - previous_analysis.created_at).days,
            "verdict_improved": self._verdict_improved(previous_analysis.verdict, self.verdict),
            "issues_resolved": self._count_resolved_issues(previous_analysis.issues_found, self.issues_found)
        }
    
    def _verdict_improved(self, old_verdict: str, new_verdict: str) -> bool:
        """Check if verdict improved"""
        verdict_hierarchy = {
            "critical_issues": 0,
            "needs_work": 1,
            "good_progress": 2,
            "ready_to_ship": 3
        }
        return verdict_hierarchy.get(new_verdict, 0) > verdict_hierarchy.get(old_verdict, 0)
    
    def _count_resolved_issues(self, old_issues: List, new_issues: List) -> int:
        """Count how many issues were resolved"""
        if not old_issues or not new_issues:
            return 0
        
        old_issue_keys = set()
        new_issue_keys = set()
        
        # Extract issue identifiers (simplified)
        for category, issues in old_issues.items():
            for issue in issues:
                old_issue_keys.add(f"{category}:{issue}")
        
        for category, issues in new_issues.items():
            for issue in issues:
                new_issue_keys.add(f"{category}:{issue}")
        
        return len(old_issue_keys - new_issue_keys)

class IssueTracking(Base):
    """Track specific issues and their resolution status"""
    
    __tablename__ = "issue_tracking"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    analysis_id = Column(Integer, ForeignKey('analyses.id'), nullable=False)
    
    # Issue details
    issue_id = Column(String(100), nullable=False)  # Unique identifier for this issue type
    issue_category = Column(String(50), nullable=False)  # "code_quality", "business_model", "investment_ready"
    issue_type = Column(String(100), nullable=False)  # "security_vulnerability", "no_testing", etc.
    severity = Column(String(20), nullable=False)  # "critical", "high", "medium", "low"
    description = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=True)
    
    # Progress tracking
    first_detected = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    is_resolved = Column(Boolean, default=False)
    
    # Impact tracking
    points_impact = Column(Float, nullable=True)  # How many points fixing this would add
    estimated_effort_hours = Column(Integer, nullable=True)
    business_impact = Column(String(200), nullable=True)  # Brief description of business impact
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ProgressSnapshot(Base):
    """Periodic snapshots of user progress for analytics"""
    
    __tablename__ = "progress_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Snapshot data
    current_score = Column(Float, nullable=False)
    score_30_days_ago = Column(Float, nullable=True)
    total_analyses = Column(Integer, default=0)
    total_issues_resolved = Column(Integer, default=0)
    current_verdict = Column(String(50), nullable=True)
    
    # Progress metrics
    weekly_score_change = Column(Float, nullable=True)
    monthly_score_change = Column(Float, nullable=True)
    issues_resolved_this_week = Column(Integer, default=0)
    issues_resolved_this_month = Column(Integer, default=0)
    
    # Business metrics
    funding_readiness_level = Column(String(50), nullable=True)  # "pre_seed", "seed", "series_a", etc.
    estimated_funding_timeline = Column(String(100), nullable=True)
    
    # Timestamps
    snapshot_date = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AnalysisComparison(Base):
    """Store comparison results between analyses"""
    
    __tablename__ = "analysis_comparisons"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    before_analysis_id = Column(Integer, ForeignKey('analyses.id'), nullable=False)
    after_analysis_id = Column(Integer, ForeignKey('analyses.id'), nullable=False)
    
    # Comparison results
    score_improvement = Column(Float, nullable=False)
    issues_resolved = Column(JSON, nullable=True)  # List of resolved issues
    new_issues = Column(JSON, nullable=True)  # New issues that appeared
    recommendations_completed = Column(JSON, nullable=True)  # Which recommendations were followed
    
    # Time metrics
    days_between_analyses = Column(Integer, nullable=False)
    improvement_velocity = Column(Float, nullable=True)  # Points improved per day
    
    # Business impact
    funding_readiness_change = Column(String(100), nullable=True)
    investment_score_change = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())