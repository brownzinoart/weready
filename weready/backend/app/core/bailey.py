"""
BAILEY - WEREADY'S CREDIBILITY KNOWLEDGE ENGINE
===============================================
Bailey is our constantly-learning knowledge sponge that ingests information
from authoritative sources to strengthen our scoring credibility without
becoming an anchor that slows decision-making.

Philosophy: Free-First Intelligence
- 95% of insights from free sources
- <$200/month total data spend  
- 10+ authoritative source citations per recommendation
- Generate viral research content monthly
- Build credibility moat impossible for competitors to replicate

Bailey Capabilities:
1. Multi-tier source ingestion (Government/Academic/Industry/Community)
2. Real-time data validation and credibility scoring
3. Anti-anchor intelligence (recency weighting, contradiction detection)
4. Original research generation for PR value
5. Continuous learning from user outcomes
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import json
import hashlib
import asyncio
import httpx
from collections import defaultdict, Counter
import statistics
import time

class SourceTier(Enum):
    GOVERNMENT = "government"  # SEC, USPTO, Federal Reserve, etc.
    ACADEMIC = "academic"      # MIT, Stanford, arXiv, Google Scholar
    INDUSTRY = "industry"      # YC, GitHub, Stack Overflow, AngelList
    COMMUNITY = "community"    # Reddit, HN, Twitter, Medium
    PROPRIETARY = "proprietary" # Our own research and surveys

class DataFreshness(Enum):
    REAL_TIME = "real_time"    # <1 hour old
    DAILY = "daily"            # <24 hours old  
    WEEKLY = "weekly"          # <7 days old
    MONTHLY = "monthly"        # <30 days old
    QUARTERLY = "quarterly"    # <90 days old
    ANNUAL = "annual"          # <365 days old
    STALE = "stale"           # >365 days old

@dataclass
class KnowledgeSource:
    """A single source of knowledge with credibility metadata"""
    name: str
    organization: str
    tier: SourceTier
    url: str
    api_endpoint: Optional[str] = None
    credibility_score: float = 0.0  # 0-100
    cost: float = 0.0  # $/month
    rate_limit: Optional[str] = None
    auth_required: bool = False
    last_updated: Optional[datetime] = None
    data_categories: List[str] = None  # ["funding", "technology", "market"]
    
@dataclass
class KnowledgePoint:
    """A single piece of knowledge with full provenance"""
    id: str
    content: str
    source: KnowledgeSource
    freshness: DataFreshness
    confidence: float  # 0-1
    supporting_sources: List[KnowledgeSource] = None
    contradicting_sources: List[KnowledgeSource] = None
    category: str = ""  # "funding_benchmark", "technology_trend", etc.
    numerical_value: Optional[float] = None
    last_verified: datetime = None
    usage_count: int = 0
    
@dataclass
class ResearchInsight:
    """An insight generated from multiple knowledge points"""
    insight_id: str
    title: str
    summary: str
    supporting_points: List[KnowledgePoint]
    confidence: float  # 0-1
    viral_potential: float  # 0-1 (how shareable this is)
    pr_value: float  # 0-1 (how much PR value this generates)
    publication_ready: bool = False
    target_audience: str = ""  # "founders", "vcs", "developers"

class Bailey:
    """WeReady's constantly-learning credibility knowledge engine"""
    
    def __init__(self):
        # Knowledge storage
        self.knowledge_sources: Dict[str, KnowledgeSource] = {}
        self.knowledge_points: Dict[str, KnowledgePoint] = {}
        self.research_insights: Dict[str, ResearchInsight] = {}
        
        # Performance tracking
        self.ingestion_stats = {
            "total_sources": 0,
            "active_sources": 0,
            "knowledge_points": 0,
            "last_update": None,
            "update_frequency": "hourly"
        }
        
        # Quality controls
        self.credibility_thresholds = {
            "minimum_source_credibility": 70.0,
            "minimum_knowledge_confidence": 0.6,
            "maximum_source_age_days": 365,
            "minimum_supporting_sources": 2
        }
        
        # Initialize with free sources
        self._initialize_free_sources()
        
    def _initialize_free_sources(self):
        """Initialize Bailey with maximum free authoritative sources"""
        
        # Government/Regulatory Sources (Tier 1 - Highest Credibility)
        self.knowledge_sources.update({
            "sec_edgar": KnowledgeSource(
                name="SEC EDGAR Database",
                organization="U.S. Securities and Exchange Commission", 
                tier=SourceTier.GOVERNMENT,
                url="https://www.sec.gov/edgar",
                api_endpoint="https://data.sec.gov/api/xbrl/companyfacts/",
                credibility_score=98.0,
                cost=0.0,
                rate_limit="10 requests/second",
                data_categories=["funding", "financials", "ipo_data"]
            ),
            
            "uspto_patents": KnowledgeSource(
                name="USPTO Patent Database",
                organization="U.S. Patent and Trademark Office",
                tier=SourceTier.GOVERNMENT,
                url="https://www.uspto.gov/",
                api_endpoint="https://developer.uspto.gov/api-catalog",
                credibility_score=95.0,
                cost=0.0,
                rate_limit="1000 requests/hour",
                data_categories=["innovation", "technology_trends", "competitive_intelligence"]
            ),
            
            "fed_data": KnowledgeSource(
                name="Federal Reserve Economic Data (FRED)",
                organization="Federal Reserve Bank of St. Louis",
                tier=SourceTier.GOVERNMENT,
                url="https://fred.stlouisfed.org/",
                api_endpoint="https://api.stlouisfed.org/fred/",
                credibility_score=97.0,
                cost=0.0,
                rate_limit="120 requests/minute",
                data_categories=["macro_trends", "employment", "economic_indicators"]
            ),
            
            "bls_data": KnowledgeSource(
                name="Bureau of Labor Statistics",
                organization="U.S. Department of Labor",
                tier=SourceTier.GOVERNMENT,
                url="https://www.bls.gov/",
                api_endpoint="https://api.bls.gov/publicAPI/",
                credibility_score=96.0,
                cost=0.0,
                rate_limit="500 requests/day",
                data_categories=["employment", "wage_trends", "industry_growth"]
            )
        })
        
        # Academic Sources (Tier 1 - High Credibility)
        self.knowledge_sources.update({
            "arxiv": KnowledgeSource(
                name="arXiv Preprint Repository",
                organization="Cornell University",
                tier=SourceTier.ACADEMIC,
                url="https://arxiv.org/",
                api_endpoint="http://export.arxiv.org/api/query",
                credibility_score=90.0,
                cost=0.0,
                rate_limit="3 requests/second",
                data_categories=["ai_research", "technology_trends", "innovation"]
            ),
            
            "google_scholar": KnowledgeSource(
                name="Google Scholar",
                organization="Google",
                tier=SourceTier.ACADEMIC,
                url="https://scholar.google.com/",
                credibility_score=85.0,
                cost=0.0,
                data_categories=["academic_research", "citations", "researcher_trends"]
            ),
            
            "mit_research": KnowledgeSource(
                name="MIT Startup Research",
                organization="MIT Sloan School of Management",
                tier=SourceTier.ACADEMIC,
                url="https://entrepreneurship.mit.edu/",
                credibility_score=94.0,
                cost=0.0,
                data_categories=["startup_success", "entrepreneurship", "innovation"]
            ),
            
            "stanford_hai": KnowledgeSource(
                name="Stanford AI Index",
                organization="Stanford Human-Centered AI Institute",
                tier=SourceTier.ACADEMIC,
                url="https://aiindex.stanford.edu/",
                credibility_score=92.0,
                cost=0.0,
                data_categories=["ai_trends", "technology_adoption", "market_growth"]
            )
        })
        
        # Industry Sources (Tier 2 - Good Credibility)
        self.knowledge_sources.update({
            "yc_directory": KnowledgeSource(
                name="Y Combinator Company Directory",
                organization="Y Combinator",
                tier=SourceTier.INDUSTRY,
                url="https://www.ycombinator.com/companies",
                credibility_score=88.0,
                cost=0.0,
                data_categories=["startup_outcomes", "funding", "batch_analysis"]
            ),
            
            "github_api": KnowledgeSource(
                name="GitHub API",
                organization="GitHub (Microsoft)",
                tier=SourceTier.INDUSTRY,
                url="https://github.com/",
                api_endpoint="https://api.github.com/",
                credibility_score=85.0,
                cost=0.0,
                rate_limit="5000 requests/hour",
                data_categories=["developer_trends", "technology_adoption", "open_source"]
            ),
            
            "stackoverflow": KnowledgeSource(
                name="Stack Overflow Public Data",
                organization="Stack Overflow",
                tier=SourceTier.INDUSTRY,
                url="https://stackoverflow.com/",
                api_endpoint="https://api.stackexchange.com/",
                credibility_score=82.0,
                cost=0.0,
                rate_limit="300 requests/day",
                data_categories=["developer_trends", "technology_adoption", "programming_languages"]
            ),
            
            "angellist": KnowledgeSource(
                name="AngelList Public Data",
                organization="AngelList",
                tier=SourceTier.INDUSTRY,
                url="https://angel.co/",
                credibility_score=80.0,
                cost=0.0,
                data_categories=["startup_data", "funding", "team_sizes"]
            )
        })
        
        # Community Sources (Tier 3 - Moderate Credibility)
        self.knowledge_sources.update({
            "reddit_startups": KnowledgeSource(
                name="Reddit Startup Communities",
                organization="Reddit",
                tier=SourceTier.COMMUNITY,
                url="https://www.reddit.com/r/startups",
                api_endpoint="https://www.reddit.com/r/startups/.json",
                credibility_score=65.0,
                cost=0.0,
                rate_limit="60 requests/minute",
                data_categories=["founder_sentiment", "trends", "community_wisdom"]
            ),
            
            "hackernews": KnowledgeSource(
                name="Hacker News",
                organization="Y Combinator",
                tier=SourceTier.COMMUNITY,
                url="https://news.ycombinator.com/",
                api_endpoint="https://hacker-news.firebaseio.com/",
                credibility_score=75.0,
                cost=0.0,
                rate_limit="No official limit",
                data_categories=["tech_trends", "startup_discussions", "developer_sentiment"]
            ),
            
            "twitter_api": KnowledgeSource(
                name="Twitter API v2",
                organization="Twitter/X",
                tier=SourceTier.COMMUNITY,
                url="https://twitter.com/",
                api_endpoint="https://api.twitter.com/2/",
                credibility_score=60.0,
                cost=0.0,
                rate_limit="500K tweets/month free",
                auth_required=True,
                data_categories=["real_time_trends", "founder_insights", "market_sentiment"]
            )
        })
        
        # Update stats
        self.ingestion_stats["total_sources"] = len(self.knowledge_sources)
        self.ingestion_stats["active_sources"] = len([s for s in self.knowledge_sources.values() if s.cost == 0.0])
        self.ingestion_stats["last_update"] = datetime.now()
        
    async def ingest_knowledge_point(self, 
                                   content: str,
                                   source_id: str,
                                   category: str,
                                   numerical_value: Optional[float] = None,
                                   confidence: float = 0.8) -> str:
        """Ingest a new piece of knowledge with full provenance tracking"""
        
        if source_id not in self.knowledge_sources:
            raise ValueError(f"Unknown source: {source_id}")
            
        source = self.knowledge_sources[source_id]
        
        # Generate unique ID
        point_id = hashlib.md5(f"{content}_{source_id}_{category}".encode()).hexdigest()[:16]
        
        # Determine data freshness
        freshness = self._determine_freshness(datetime.now())
        
        # Create knowledge point
        knowledge_point = KnowledgePoint(
            id=point_id,
            content=content,
            source=source,
            freshness=freshness,
            confidence=confidence,
            category=category,
            numerical_value=numerical_value,
            last_verified=datetime.now(),
            usage_count=0
        )
        
        # Validate before storing
        if self._validate_knowledge_point(knowledge_point):
            self.knowledge_points[point_id] = knowledge_point
            self.ingestion_stats["knowledge_points"] += 1
            return point_id
        else:
            raise ValueError("Knowledge point failed validation")
            
    def _determine_freshness(self, timestamp: datetime) -> DataFreshness:
        """Determine data freshness based on timestamp"""
        age = datetime.now() - timestamp
        
        if age < timedelta(hours=1):
            return DataFreshness.REAL_TIME
        elif age < timedelta(days=1):
            return DataFreshness.DAILY
        elif age < timedelta(days=7):
            return DataFreshness.WEEKLY
        elif age < timedelta(days=30):
            return DataFreshness.MONTHLY
        elif age < timedelta(days=90):
            return DataFreshness.QUARTERLY
        elif age < timedelta(days=365):
            return DataFreshness.ANNUAL
        else:
            return DataFreshness.STALE
            
    def _validate_knowledge_point(self, point: KnowledgePoint) -> bool:
        """Validate knowledge point meets quality standards"""
        
        # Check source credibility
        if point.source.credibility_score < self.credibility_thresholds["minimum_source_credibility"]:
            return False
            
        # Check confidence level
        if point.confidence < self.credibility_thresholds["minimum_knowledge_confidence"]:
            return False
            
        # Check data freshness (don't store stale data)
        if point.freshness == DataFreshness.STALE:
            return False
            
        return True
        
    def get_knowledge_by_category(self, category: str, min_confidence: float = 0.7) -> List[KnowledgePoint]:
        """Get all knowledge points for a specific category above confidence threshold"""
        
        return [
            point for point in self.knowledge_points.values()
            if point.category == category and point.confidence >= min_confidence
        ]
        
    def get_credibility_weighted_average(self, category: str, field: str = "numerical_value") -> Tuple[float, float]:
        """Get credibility-weighted average for numerical values in a category"""
        
        points = self.get_knowledge_by_category(category)
        numerical_points = [p for p in points if getattr(p, field) is not None]
        
        if not numerical_points:
            return 0.0, 0.0
            
        # Weight by source credibility and confidence
        total_weight = 0.0
        weighted_sum = 0.0
        
        for point in numerical_points:
            weight = point.source.credibility_score * point.confidence * self._get_freshness_weight(point.freshness)
            weighted_sum += getattr(point, field) * weight
            total_weight += weight
            
        if total_weight == 0:
            return 0.0, 0.0
            
        weighted_average = weighted_sum / total_weight
        confidence = min(1.0, total_weight / (100 * len(numerical_points)))  # Normalize confidence
        
        return weighted_average, confidence
        
    def _get_freshness_weight(self, freshness: DataFreshness) -> float:
        """Get weight multiplier based on data freshness"""
        freshness_weights = {
            DataFreshness.REAL_TIME: 1.0,
            DataFreshness.DAILY: 0.95,
            DataFreshness.WEEKLY: 0.85,
            DataFreshness.MONTHLY: 0.75,
            DataFreshness.QUARTERLY: 0.6,
            DataFreshness.ANNUAL: 0.4,
            DataFreshness.STALE: 0.1
        }
        return freshness_weights.get(freshness, 0.5)
        
    def detect_contradictions(self, category: str) -> List[Dict[str, Any]]:
        """Detect contradictions between sources in a category"""
        
        points = self.get_knowledge_by_category(category)
        numerical_points = [p for p in points if p.numerical_value is not None]
        
        contradictions = []
        
        # Check for numerical value contradictions
        if len(numerical_points) >= 2:
            values = [p.numerical_value for p in numerical_points]
            mean_val = statistics.mean(values)
            std_dev = statistics.stdev(values) if len(values) > 1 else 0
            
            # Flag points that deviate significantly from mean
            for point in numerical_points:
                if abs(point.numerical_value - mean_val) > 2 * std_dev:
                    contradictions.append({
                        "type": "numerical_outlier",
                        "point_id": point.id,
                        "value": point.numerical_value,
                        "expected_range": [mean_val - std_dev, mean_val + std_dev],
                        "source": point.source.name,
                        "confidence": point.confidence
                    })
                    
        return contradictions
        
    def generate_research_insight(self, category: str, title: str) -> Optional[ResearchInsight]:
        """Generate a research insight from knowledge points in a category"""
        
        points = self.get_knowledge_by_category(category)
        
        if len(points) < 3:  # Need at least 3 sources for credible insight
            return None
            
        # Calculate overall confidence
        avg_confidence = statistics.mean([p.confidence for p in points])
        avg_credibility = statistics.mean([p.source.credibility_score for p in points]) / 100
        overall_confidence = (avg_confidence + avg_credibility) / 2
        
        # Assess viral potential based on uniqueness and strength of claim
        viral_potential = self._assess_viral_potential(points, category)
        
        # Assess PR value
        pr_value = self._assess_pr_value(points, category)
        
        # Generate summary
        summary = self._generate_insight_summary(points, category)
        
        insight_id = hashlib.md5(f"{title}_{category}_{len(points)}".encode()).hexdigest()[:16]
        
        return ResearchInsight(
            insight_id=insight_id,
            title=title,
            summary=summary,
            supporting_points=points,
            confidence=overall_confidence,
            viral_potential=viral_potential,
            pr_value=pr_value,
            publication_ready=overall_confidence > 0.8 and len(points) >= 5,
            target_audience=self._determine_target_audience(category)
        )
        
    def _assess_viral_potential(self, points: List[KnowledgePoint], category: str) -> float:
        """Assess how viral/shareable this insight could be"""
        
        # Higher viral potential for surprising statistics, large numbers, counterintuitive findings
        base_score = 0.5
        
        # Boost for AI/technology categories (trending topics)
        if any(keyword in category.lower() for keyword in ["ai", "technology", "innovation"]):
            base_score += 0.2
            
        # Boost for funding/startup categories (high interest)
        if any(keyword in category.lower() for keyword in ["funding", "startup", "unicorn"]):
            base_score += 0.2
            
        # Boost for strong numerical claims
        numerical_points = [p for p in points if p.numerical_value is not None]
        if numerical_points:
            max_value = max([p.numerical_value for p in numerical_points])
            if max_value > 100:  # Large percentages or big numbers
                base_score += 0.1
                
        return min(1.0, base_score)
        
    def _assess_pr_value(self, points: List[KnowledgePoint], category: str) -> float:
        """Assess PR value of this insight"""
        
        # High PR value for insights that position WeReady as thought leader
        base_score = 0.6
        
        # Boost for insights about our core competencies
        if any(keyword in category.lower() for keyword in ["ai", "code", "hallucination"]):
            base_score += 0.3
            
        # Boost for insights with many authoritative sources
        gov_academic_sources = len([p for p in points if p.source.tier in [SourceTier.GOVERNMENT, SourceTier.ACADEMIC]])
        if gov_academic_sources >= 3:
            base_score += 0.2
            
        return min(1.0, base_score)
        
    def _generate_insight_summary(self, points: List[KnowledgePoint], category: str) -> str:
        """Generate a summary of the insight"""
        
        # For now, simple template-based generation
        # In production, could use LLM for better summaries
        
        source_count = len(points)
        unique_orgs = len(set([p.source.organization for p in points]))
        
        summary = f"Analysis of {source_count} authoritative sources from {unique_orgs} organizations reveals insights about {category.replace('_', ' ')}."
        
        # Add numerical insight if available
        numerical_points = [p for p in points if p.numerical_value is not None]
        if numerical_points:
            avg_value = statistics.mean([p.numerical_value for p in numerical_points])
            summary += f" Key metric average: {avg_value:.1f}."
            
        return summary
        
    def _determine_target_audience(self, category: str) -> str:
        """Determine target audience for this insight"""
        
        if "funding" in category.lower():
            return "founders_vcs"
        elif "technology" in category.lower() or "ai" in category.lower():
            return "developers_founders"
        elif "market" in category.lower():
            return "founders_analysts"
        else:
            return "general_startup"
            
    def get_bailey_stats(self) -> Dict[str, Any]:
        """Get comprehensive Bailey performance statistics"""
        
        # Source distribution
        source_by_tier = Counter([s.tier.value for s in self.knowledge_sources.values()])
        source_by_cost = {"free": 0, "paid": 0}
        total_cost = 0.0
        
        for source in self.knowledge_sources.values():
            if source.cost == 0.0:
                source_by_cost["free"] += 1
            else:
                source_by_cost["paid"] += 1
            total_cost += source.cost
            
        # Knowledge distribution
        knowledge_by_category = Counter([p.category for p in self.knowledge_points.values()])
        avg_confidence = statistics.mean([p.confidence for p in self.knowledge_points.values()]) if self.knowledge_points else 0
        avg_credibility = statistics.mean([p.source.credibility_score for p in self.knowledge_points.values()]) if self.knowledge_points else 0
        
        # Freshness analysis
        freshness_dist = Counter([p.freshness.value for p in self.knowledge_points.values()])
        
        return {
            "sources": {
                "total": len(self.knowledge_sources),
                "by_tier": dict(source_by_tier),
                "by_cost": source_by_cost,
                "monthly_cost": total_cost,
                "avg_credibility": round(avg_credibility, 1)
            },
            "knowledge": {
                "total_points": len(self.knowledge_points),
                "by_category": dict(knowledge_by_category.most_common()),
                "avg_confidence": round(avg_confidence, 3),
                "freshness_distribution": dict(freshness_dist)
            },
            "insights": {
                "total_generated": len(self.research_insights),
                "publication_ready": len([i for i in self.research_insights.values() if i.publication_ready]),
                "high_viral_potential": len([i for i in self.research_insights.values() if i.viral_potential > 0.8])
            },
            "performance": {
                "last_update": self.ingestion_stats["last_update"].isoformat() if self.ingestion_stats["last_update"] else None,
                "update_frequency": self.ingestion_stats["update_frequency"],
                "free_source_percentage": round(source_by_cost["free"] / len(self.knowledge_sources) * 100, 1),
                "credibility_score": round((avg_credibility + avg_confidence * 100) / 2, 1)
            }
        }

# Singleton instance
bailey = Bailey()