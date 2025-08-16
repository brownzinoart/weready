"""
HALLUCINATION TRENDS ANALYZER
=============================
Cross-references detected hallucinated packages with trending GitHub data
to determine if developers are anticipating packages that don't exist yet.

This gives WeReady unique insight that ChatGPT cannot provide:
- Are hallucinated packages actually emerging trends?
- Is the developer ahead of the curve or behind?
- What's the "anticipation score" for their tech choices?
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import re
import asyncio
from difflib import SequenceMatcher

from .bailey import bailey
from .bailey_connectors import GitHubConnector

@dataclass
class HallucinationInsight:
    package_name: str
    is_trending_related: bool
    similarity_score: float
    trending_match: Optional[str]
    anticipation_score: float  # 0-100: how "ahead of the curve" this is
    market_context: str
    recommendation: str

class HallucinationTrendsAnalyzer:
    """Analyzes hallucinated packages against real-time market trends"""
    
    def __init__(self):
        self.trending_cache = {}
        self.cache_timestamp = None
        self.cache_duration = timedelta(hours=1)  # Refresh hourly
    
    async def analyze_hallucinated_packages(self, hallucinated_packages: List[str]) -> List[HallucinationInsight]:
        """Analyze if hallucinated packages match trending patterns"""
        
        if not hallucinated_packages:
            return []
        
        # Get fresh trending data
        trending_data = await self._get_trending_data()
        
        insights = []
        for package in hallucinated_packages:
            insight = await self._analyze_single_package(package, trending_data)
            insights.append(insight)
        
        return insights
    
    async def _get_trending_data(self) -> Dict[str, Any]:
        """Get fresh trending data from GitHub"""
        
        # Check cache freshness
        if (self.cache_timestamp and 
            datetime.now() - self.cache_timestamp < self.cache_duration and 
            self.trending_cache):
            return self.trending_cache
        
        # Fetch fresh data
        trending_packages = []
        trending_repos = []
        
        try:
            # Get recent knowledge points about trending packages
            recent_knowledge = await bailey.query_knowledge(
                category="trending_ai_packages",
                limit=50,
                min_confidence=0.7
            )
            
            for point in recent_knowledge:
                # Extract package names from trending data
                content = point.get("content", "")
                if "HOT PACKAGE:" in content:
                    package_match = re.search(r"HOT PACKAGE: ([^\s]+)", content)
                    if package_match:
                        trending_packages.append({
                            "name": package_match.group(1),
                            "momentum": point.get("numerical_value", 0),
                            "content": content
                        })
            
            # Get trending repository names
            trending_knowledge = await bailey.query_knowledge(
                category="ai_trending_now",
                limit=20,
                min_confidence=0.8
            )
            
            for point in trending_knowledge:
                content = point.get("content", "")
                if "TRENDING NOW:" in content:
                    repo_match = re.search(r"TRENDING NOW: ([^\s]+)", content)
                    if repo_match:
                        repo_name = repo_match.group(1).split("/")[-1]  # Get just the repo name
                        trending_repos.append({
                            "name": repo_name,
                            "velocity": point.get("numerical_value", 0),
                            "content": content
                        })
        
        except Exception as e:
            print(f"Error fetching trending data: {e}")
        
        self.trending_cache = {
            "packages": trending_packages,
            "repos": trending_repos,
            "all_names": [p["name"] for p in trending_packages] + [r["name"] for r in trending_repos]
        }
        self.cache_timestamp = datetime.now()
        
        return self.trending_cache
    
    async def _analyze_single_package(self, package_name: str, trending_data: Dict[str, Any]) -> HallucinationInsight:
        """Analyze a single hallucinated package against trends"""
        
        best_match = None
        best_similarity = 0.0
        is_trending_related = False
        
        # Check similarity to trending packages/repos
        for name in trending_data.get("all_names", []):
            similarity = self._calculate_similarity(package_name, name)
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = name
        
        # Determine if this is trend-related
        is_trending_related = best_similarity > 0.6
        
        # Calculate anticipation score
        anticipation_score = self._calculate_anticipation_score(
            package_name, best_similarity, trending_data
        )
        
        # Generate market context and recommendation
        market_context, recommendation = self._generate_insight_text(
            package_name, best_match, best_similarity, anticipation_score, trending_data
        )
        
        return HallucinationInsight(
            package_name=package_name,
            is_trending_related=is_trending_related,
            similarity_score=best_similarity,
            trending_match=best_match,
            anticipation_score=anticipation_score,
            market_context=market_context,
            recommendation=recommendation
        )
    
    def _calculate_similarity(self, package1: str, package2: str) -> float:
        """Calculate similarity between package names"""
        
        # Clean package names
        clean1 = re.sub(r'[@/\-_.]', '', package1.lower())
        clean2 = re.sub(r'[@/\-_.]', '', package2.lower())
        
        # Use sequence matcher for similarity
        similarity = SequenceMatcher(None, clean1, clean2).ratio()
        
        # Bonus for exact substring matches
        if clean1 in clean2 or clean2 in clean1:
            similarity = min(similarity + 0.2, 1.0)
        
        # Bonus for common AI prefixes/suffixes
        ai_terms = ['ai', 'ml', 'llm', 'gpt', 'anthropic', 'openai', 'lang', 'chain']
        for term in ai_terms:
            if term in clean1 and term in clean2:
                similarity = min(similarity + 0.1, 1.0)
        
        return similarity
    
    def _calculate_anticipation_score(self, package_name: str, similarity: float, trending_data: Dict[str, Any]) -> float:
        """Calculate how 'ahead of the curve' this hallucination is"""
        
        score = 0.0
        
        # Base score from similarity to trending packages
        score += similarity * 40  # Max 40 points for similarity
        
        # Bonus for AI-related terms
        ai_indicators = ['ai', 'ml', 'llm', 'gpt', 'anthropic', 'openai', 'claude', 'lang', 'chain', 'neural', 'transformer']
        ai_count = sum(1 for term in ai_indicators if term in package_name.lower())
        score += min(ai_count * 10, 30)  # Max 30 points for AI relevance
        
        # Bonus for modern patterns
        if any(pattern in package_name.lower() for pattern in ['next-', 'v2', 'pro', 'turbo', 'ultra']):
            score += 10
        
        # Penalty for obviously fake patterns
        if any(pattern in package_name.lower() for pattern in ['fake', 'test', 'mock', 'dummy']):
            score -= 20
        
        # Bonus if it matches naming patterns of trending packages
        trending_packages = trending_data.get("packages", [])
        if trending_packages:
            avg_length = sum(len(p["name"]) for p in trending_packages) / len(trending_packages)
            if abs(len(package_name) - avg_length) < 5:  # Similar length
                score += 10
        
        return max(0, min(100, score))
    
    def _generate_insight_text(self, package_name: str, best_match: Optional[str], 
                             similarity: float, anticipation_score: float, 
                             trending_data: Dict[str, Any]) -> Tuple[str, str]:
        """Generate human-readable insight and recommendation"""
        
        if similarity > 0.8 and best_match:
            market_context = f"Very similar to trending package '{best_match}' - developer may be anticipating or misremembering actual package name"
            if anticipation_score > 70:
                recommendation = f"HIGH POTENTIAL: Consider investigating '{best_match}' - you may be onto something emerging"
            else:
                recommendation = f"Check if you meant '{best_match}' instead of '{package_name}'"
        
        elif similarity > 0.6 and best_match:
            market_context = f"Somewhat similar to trending '{best_match}' - possible emerging pattern or typo"
            recommendation = f"Research '{best_match}' and similar packages in this space"
        
        elif anticipation_score > 60:
            market_context = f"Strong AI-related naming pattern but no exact trending matches found"
            recommendation = f"Ahead of the curve potential - monitor for packages with similar names emerging"
        
        else:
            market_context = f"No significant similarity to current trending packages"
            recommendation = f"Likely typo or fictional package - verify package names carefully"
        
        return market_context, recommendation
    
    async def generate_trend_summary(self, insights: List[HallucinationInsight]) -> Dict[str, Any]:
        """Generate summary of hallucination trend analysis"""
        
        if not insights:
            return {"status": "no_hallucinations", "summary": "No hallucinated packages detected"}
        
        trend_related = [i for i in insights if i.is_trending_related]
        high_anticipation = [i for i in insights if i.anticipation_score > 60]
        
        avg_anticipation = sum(i.anticipation_score for i in insights) / len(insights)
        
        summary = {
            "total_hallucinated": len(insights),
            "trend_related_count": len(trend_related),
            "high_anticipation_count": len(high_anticipation),
            "average_anticipation_score": avg_anticipation,
            "insights": [
                {
                    "package": i.package_name,
                    "anticipation_score": i.anticipation_score,
                    "market_context": i.market_context,
                    "recommendation": i.recommendation
                }
                for i in insights
            ]
        }
        
        # Generate overall assessment
        if avg_anticipation > 70:
            summary["assessment"] = "AHEAD OF CURVE: Multiple packages show emerging trend patterns"
        elif avg_anticipation > 50:
            summary["assessment"] = "MIXED SIGNALS: Some trend awareness, some errors"
        else:
            summary["assessment"] = "BEHIND TRENDS: Mostly typos or outdated package references"
        
        return summary

# Singleton instance
hallucination_trends = HallucinationTrendsAnalyzer()