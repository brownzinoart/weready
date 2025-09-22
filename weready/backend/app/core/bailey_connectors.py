"""
BAILEY DATA CONNECTORS
======================
Connectors for Bailey to ingest data from free authoritative sources.
Handles API calls, web scraping, and data normalization.

Free Source Connectors:
- SEC EDGAR (public company data)
- GitHub API (developer trends)
- arXiv (research papers)
- Y Combinator directory (startup outcomes)
- Stack Overflow (technology trends)
- Reddit/HN (community insights)
"""

from typing import Dict, List, Optional, Any, AsyncGenerator
import asyncio
import httpx
import json
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
import re
from urllib.parse import urljoin, urlparse
import logging
from dataclasses import asdict
import csv
import io
import statistics
from collections import Counter

from .bailey import bailey, KnowledgePoint, DataFreshness
from .business_formation_tracker import business_formation_tracker
from .international_market_intelligence import international_market_intelligence
from .procurement_intelligence import procurement_intelligence
from .technology_trend_analyzer import technology_trend_analyzer
from .enhanced_economic_analyzer import enhanced_economic_analyzer
from .source_connectors.base import BaileyConnector
from .source_connectors.intelligence_wrappers import (
    AcademicResearchConnector,
    DesignIntelligenceConnector,
    FundingTrackerConnector,
    GitHubIntelligenceConnector,
    GovernmentDataIntegratorConnector,
    MarketTimingConnector,
)
from .source_connectors.code_quality_connectors import (
    SonarQubeConnector,
    CodeClimateConnector,
    GitGuardianConnector,
    SemgrepConnector,
    VeracodeConnector,
)
from .source_connectors.business_intelligence_connectors import (
    FirstRoundCapitalConnector,
    AndreessenHorowitzConnector,
    LeanStartupConnector,
    ProfitWellConnector,
    HarvardBusinessSchoolConnector,
)
from .source_connectors.investment_readiness_connectors import (
    SequoiaCapitalConnector,
    BessemerVenturePartnersConnector,
    MITEntrepreneurshipConnector,
    NVCAConnector,
    CBInsightsConnector,
    AngelListConnector,
)
from .source_connectors.design_experience_connectors import (
    NielsenNormanGroupConnector,
    BaymardInstituteConnector,
    WebAIMConnector,
    GoogleDesignConnector,
    AppleHIGConnector,
    ChromeUXReportConnector,
)

class GitHubConnector(BaileyConnector):
    """Connector for GitHub API - developer and technology trends"""
    
    def __init__(self):
        super().__init__("github_api")
        
    async def ingest_data(self) -> List[str]:
        """Ingest GitHub trending data and developer statistics"""
        
        knowledge_ids = []
        
        # Get trending repositories
        trending_data = await self._get_trending_repositories()
        for point_id in trending_data:
            knowledge_ids.append(point_id)
            
        # Get language statistics
        language_data = await self._get_language_trends()
        for point_id in language_data:
            knowledge_ids.append(point_id)
            
        return knowledge_ids
        
    async def _get_trending_repositories(self) -> List[str]:
        """Get trending repositories to understand technology adoption"""
        
        knowledge_ids = []
        
        try:
            # Get repositories trending in the last 7 days
            week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
            
            # Search for AI/ML repositories with recent activity
            ai_queries = [
                f"created:>{week_ago} AI OR machine learning OR LLM",
                f"created:>{week_ago} artificial intelligence OR deep learning",
                f"created:>{week_ago} neural network OR transformer",
                f"pushed:>{week_ago} openai OR anthropic OR claude OR gpt"
            ]
            
            for query in ai_queries:
                url = "https://api.github.com/search/repositories"
                params = {
                    "q": query,
                    "sort": "stars",
                    "order": "desc",
                    "per_page": 25
                }
            
                response = await self.client.get(url, params=params)
                self._respect_rate_limit()
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Analyze trending repositories for velocity
                    hot_repos = []
                    for repo in data.get("items", [])[:10]:  # Top 10 from each query
                        created_at = datetime.fromisoformat(repo.get("created_at", "").replace("Z", "+00:00"))
                        stars = repo.get("stargazers_count", 0)
                        age_days = (datetime.now(created_at.tzinfo) - created_at).days
                        
                        # Calculate star velocity (stars per day)
                        velocity = stars / max(age_days, 1) if age_days > 0 else stars
                        
                        hot_repos.append({
                            "name": repo.get("full_name", ""),
                            "stars": stars,
                            "velocity": velocity,
                            "language": repo.get("language", ""),
                            "description": repo.get("description", "")[:100]
                        })
                    
                    # Find hottest repositories by velocity
                    hot_repos.sort(key=lambda x: x["velocity"], reverse=True)
                    
                    if hot_repos:
                        hottest = hot_repos[0]
                        point_id = await bailey.ingest_knowledge_point(
                            content=f"TRENDING NOW: {hottest['name']} gaining {hottest['velocity']:.1f} stars/day ({hottest['stars']} total stars) - {hottest['description']}",
                            source_id=self.source_id,
                            category="ai_trending_now",
                            numerical_value=float(hottest['velocity']),
                            confidence=0.9
                        )
                        knowledge_ids.append(point_id)
                        
                        # Store velocity data for trend analysis
                        for i, repo in enumerate(hot_repos[:5]):
                            if repo['velocity'] > 1:  # Only repos gaining at least 1 star/day
                                point_id = await bailey.ingest_knowledge_point(
                                    content=f"Hot repo #{i+1}: {repo['name']} ({repo['language']}) - {repo['velocity']:.1f} stars/day momentum",
                                    source_id=self.source_id,
                                    category="github_velocity_trends",
                                    numerical_value=float(repo['velocity']),
                                    confidence=0.8
                                )
                                knowledge_ids.append(point_id)
                    
        except Exception as e:
            logging.error(f"GitHub trending repositories error: {e}")
            
        return knowledge_ids
        
    async def _get_language_trends(self) -> List[str]:
        """Get programming language adoption trends with AI package tracking"""
        
        knowledge_ids = []
        
        try:
            # Track AI-specific packages by language
            ai_package_queries = {
                "python": ["openai", "anthropic", "langchain", "transformers", "torch", "tensorflow"],
                "javascript": ["@openai/openai", "@anthropic/anthropic-sdk", "langchain", "tensorflow"],
                "typescript": ["openai", "anthropic", "@langchain/core", "@tensorflow/tfjs"],
                "rust": ["candle", "tch", "ort", "llm-chain"],
                "go": ["go-openai", "langchaingo", "ollama"]
            }
            
            # Get package momentum for each language
            for lang, packages in ai_package_queries.items():
                lang_velocity = 0
                trending_packages = []
                
                for package in packages:
                    url = "https://api.github.com/search/repositories"
                    params = {
                        "q": f'"{package}" language:{lang} pushed:>2024-12-01',
                        "sort": "updated",
                        "per_page": 5
                    }
                    
                    response = await self.client.get(url, params=params)
                    self._respect_rate_limit()
                    
                    if response.status_code == 200:
                        data = response.json()
                        for repo in data.get("items", []):
                            stars = repo.get("stargazers_count", 0)
                            updated_at = datetime.fromisoformat(repo.get("updated_at", "").replace("Z", "+00:00"))
                            days_since_update = (datetime.now(updated_at.tzinfo) - updated_at).days
                            
                            # Calculate package momentum (activity score)
                            if days_since_update < 7:  # Updated in last week
                                momentum = stars / max(days_since_update, 1)
                                lang_velocity += momentum
                                
                                if momentum > 10:  # High momentum packages
                                    trending_packages.append({
                                        "name": repo.get("name", ""),
                                        "stars": stars,
                                        "momentum": momentum,
                                        "description": repo.get("description", "")[:80]
                                    })
                
                # Store language momentum data
                if lang_velocity > 0:
                    point_id = await bailey.ingest_knowledge_point(
                        content=f"REAL-TIME: {lang} AI ecosystem has {lang_velocity:.1f} momentum score (stars × recent activity)",
                        source_id=self.source_id,
                        category="ai_language_momentum",
                        numerical_value=float(lang_velocity),
                        confidence=0.85
                    )
                    knowledge_ids.append(point_id)
                
                # Store trending packages
                for pkg in sorted(trending_packages, key=lambda x: x["momentum"], reverse=True)[:3]:
                    point_id = await bailey.ingest_knowledge_point(
                        content=f"HOT PACKAGE: {pkg['name']} ({lang}) - {pkg['momentum']:.1f} momentum, {pkg['stars']} stars - {pkg['description']}",
                        source_id=self.source_id,
                        category="trending_ai_packages",
                        numerical_value=float(pkg['momentum']),
                        confidence=0.8
                    )
                    knowledge_ids.append(point_id)
                    
        except Exception as e:
            logging.error(f"GitHub language trends error: {e}")
            
        return knowledge_ids

class ArxivEnhancedConnector(BaileyConnector):
    """Enhanced connector for arXiv - comprehensive AI and technology research intelligence"""
    
    def __init__(self):
        super().__init__("arxiv")
        
    async def ingest_data(self) -> List[str]:
        """Ingest comprehensive AI research intelligence from arXiv"""
        
        knowledge_ids = []
        
        # Get research trend analysis
        trend_data = await self._analyze_research_trends()
        knowledge_ids.extend(trend_data)
        
        # Get breakthrough detection
        breakthrough_data = await self._detect_research_breakthroughs()
        knowledge_ids.extend(breakthrough_data)
        
        # Get technology adoption signals
        adoption_data = await self._analyze_technology_adoption_signals()
        knowledge_ids.extend(adoption_data)
        
        # Get competitive intelligence from research
        competitive_data = await self._extract_competitive_intelligence()
        knowledge_ids.extend(competitive_data)
            
        return knowledge_ids
        
    async def _analyze_research_trends(self) -> List[str]:
        """Analyze AI research publication trends for market intelligence"""
        
        knowledge_ids = []
        
        try:
            base_url = "http://export.arxiv.org/api/query"
            
            # Expanded search categories for comprehensive coverage
            research_categories = {
                "cs.AI": "Artificial Intelligence",
                "cs.LG": "Machine Learning", 
                "cs.CL": "Natural Language Processing",
                "cs.CV": "Computer Vision",
                "cs.NE": "Neural Networks",
                "cs.RO": "Robotics",
                "stat.ML": "Machine Learning Statistics",
                "cs.HC": "Human-Computer Interaction"
            }
            
            category_trends = {}
            
            for category, name in research_categories.items():
                # Get papers from last 90 days for trend analysis
                params = {
                    "search_query": f"cat:{category}",
                    "start": 0,
                    "max_results": 100,
                    "sortBy": "submittedDate",
                    "sortOrder": "descending"
                }
                
                response = await self.client.get(base_url, params=params)
                self._respect_rate_limit()
                
                if response.status_code == 200:
                    root = ET.fromstring(response.content)
                    
                    # Analyze publication velocity and trending topics
                    recent_papers = []
                    trending_topics = {}
                    
                    for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
                        published = entry.find("{http://www.w3.org/2005/Atom}published")
                        title = entry.find("{http://www.w3.org/2005/Atom}title")
                        abstract = entry.find("{http://www.w3.org/2005/Atom}summary")
                        
                        if published is not None:
                            pub_date = datetime.fromisoformat(published.text.replace('Z', '+00:00'))
                            if pub_date > datetime.now().replace(tzinfo=pub_date.tzinfo) - timedelta(days=90):
                                recent_papers.append(pub_date)
                                
                                # Extract trending topics from titles and abstracts
                                if title is not None and abstract is not None:
                                    text = f"{title.text} {abstract.text}".lower()
                                    
                                    # Key technology terms to track
                                    tech_terms = [
                                        "transformer", "llm", "gpt", "bert", "diffusion", 
                                        "reinforcement learning", "neural network", "deep learning",
                                        "computer vision", "nlp", "multimodal", "reasoning",
                                        "fine-tuning", "prompt engineering", "few-shot"
                                    ]
                                    
                                    for term in tech_terms:
                                        if term in text:
                                            trending_topics[term] = trending_topics.get(term, 0) + 1
                    
                    # Calculate research velocity (papers per week)
                    if recent_papers:
                        weeks_covered = 13  # 90 days / 7
                        velocity = len(recent_papers) / weeks_covered
                        
                        category_trends[category] = {
                            "papers_per_week": velocity,
                            "total_recent_papers": len(recent_papers),
                            "trending_topics": trending_topics,
                            "research_activity_score": min(10.0, velocity / 5.0)  # Normalize to 1-10
                        }
                        
                        # Ingest trend data
                        point_id = await bailey.ingest_knowledge_point(
                            content=f"{name} research velocity: {velocity:.1f} papers/week, activity score: {category_trends[category]['research_activity_score']:.1f}/10",
                            source_id=self.source_id,
                            category="ai_research_velocity",
                            numerical_value=velocity,
                            confidence=0.90
                        )
                        knowledge_ids.append(point_id)
            
            # Cross-category trend analysis
            if category_trends:
                total_velocity = sum(ct["papers_per_week"] for ct in category_trends.values())
                avg_activity = sum(ct["research_activity_score"] for ct in category_trends.values()) / len(category_trends)
                
                # Overall AI research health indicator
                point_id = await bailey.ingest_knowledge_point(
                    content=f"Overall AI research ecosystem health: {avg_activity:.1f}/10, {total_velocity:.1f} papers/week across {len(category_trends)} categories",
                    source_id=self.source_id,
                    category="ai_research_ecosystem",
                    numerical_value=avg_activity,
                    confidence=0.88
                )
                knowledge_ids.append(point_id)
                        
        except Exception as e:
            logging.error(f"arXiv trend analysis error: {e}")
            
        return knowledge_ids
    
    async def _detect_research_breakthroughs(self) -> List[str]:
        """Detect potential breakthrough research with high citation potential"""
        
        knowledge_ids = []
        
        try:
            # Search for papers with breakthrough indicators
            breakthrough_queries = [
                "SOTA OR state-of-the-art OR breakthrough OR novel",
                "AGI OR artificial general intelligence",
                "foundation model OR large language model",
                "zero-shot OR few-shot OR in-context learning"
            ]
            
            base_url = "http://export.arxiv.org/api/query"
            
            for query in breakthrough_queries:
                params = {
                    "search_query": f"({query}) AND cat:cs.AI",
                    "start": 0,
                    "max_results": 20,
                    "sortBy": "submittedDate",
                    "sortOrder": "descending"
                }
                
                response = await self.client.get(base_url, params=params)
                self._respect_rate_limit()
                
                if response.status_code == 200:
                    root = ET.fromstring(response.content)
                    
                    breakthrough_papers = []
                    for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
                        published = entry.find("{http://www.w3.org/2005/Atom}published")
                        title = entry.find("{http://www.w3.org/2005/Atom}title")
                        authors = entry.findall("{http://www.w3.org/2005/Atom}author")
                        
                        if published is not None and title is not None:
                            pub_date = datetime.fromisoformat(published.text.replace('Z', '+00:00'))
                            if pub_date > datetime.now().replace(tzinfo=pub_date.tzinfo) - timedelta(days=30):
                                
                                # Score breakthrough potential
                                breakthrough_score = self._calculate_breakthrough_score(
                                    title.text, 
                                    len(authors),
                                    pub_date
                                )
                                
                                if breakthrough_score > 7.0:
                                    breakthrough_papers.append({
                                        "title": title.text,
                                        "score": breakthrough_score,
                                        "date": pub_date
                                    })
                    
                    if breakthrough_papers:
                        avg_breakthrough_score = sum(p["score"] for p in breakthrough_papers) / len(breakthrough_papers)
                        
                        point_id = await bailey.ingest_knowledge_point(
                            content=f"Detected {len(breakthrough_papers)} potential breakthrough papers, avg score: {avg_breakthrough_score:.1f}/10",
                            source_id=self.source_id,
                            category="ai_research_breakthroughs",
                            numerical_value=avg_breakthrough_score,
                            confidence=0.82
                        )
                        knowledge_ids.append(point_id)
                        
        except Exception as e:
            logging.error(f"arXiv breakthrough detection error: {e}")
            
        return knowledge_ids
    
    def _calculate_breakthrough_score(self, title: str, author_count: int, pub_date: datetime) -> float:
        """Calculate potential breakthrough score for a research paper"""
        
        score = 5.0  # Base score
        title_lower = title.lower()
        
        # Title indicators
        breakthrough_terms = {
            "breakthrough": 2.0, "novel": 1.5, "first": 1.5, "new": 1.0,
            "sota": 2.0, "state-of-the-art": 2.0, "outperforms": 1.8,
            "agi": 3.0, "general intelligence": 2.5, "foundation": 2.0,
            "transformer": 1.5, "attention": 1.2, "reasoning": 1.8
        }
        
        for term, boost in breakthrough_terms.items():
            if term in title_lower:
                score += boost
        
        # Multi-author papers often have higher impact
        if author_count > 5:
            score += 1.0
        elif author_count > 10:
            score += 1.5
        
        # Recent papers get slight boost
        days_old = (datetime.now().replace(tzinfo=pub_date.tzinfo) - pub_date).days
        if days_old < 7:
            score += 0.5
        
        return min(10.0, score)
    
    async def _analyze_technology_adoption_signals(self) -> List[str]:
        """Analyze research patterns for early technology adoption signals"""
        
        knowledge_ids = []
        
        try:
            # Track adoption of specific technologies in research
            tech_adoption_queries = {
                "claude": "Anthropic Claude adoption in research",
                "gpt-4": "GPT-4 adoption in research", 
                "llama": "Meta LLaMA adoption in research",
                "stable diffusion": "Stable Diffusion adoption in research",
                "whisper": "OpenAI Whisper adoption in research"
            }
            
            base_url = "http://export.arxiv.org/api/query"
            
            for tech, description in tech_adoption_queries.items():
                params = {
                    "search_query": f'ti:"{tech}" OR abs:"{tech}"',
                    "start": 0,
                    "max_results": 50,
                    "sortBy": "submittedDate",
                    "sortOrder": "descending"
                }
                
                response = await self.client.get(base_url, params=params)
                self._respect_rate_limit()
                
                if response.status_code == 200:
                    root = ET.fromstring(response.content)
                    
                    # Count recent mentions
                    recent_mentions = 0
                    for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
                        published = entry.find("{http://www.w3.org/2005/Atom}published")
                        if published is not None:
                            pub_date = datetime.fromisoformat(published.text.replace('Z', '+00:00'))
                            if pub_date > datetime.now().replace(tzinfo=pub_date.tzinfo) - timedelta(days=60):
                                recent_mentions += 1
                    
                    if recent_mentions > 0:
                        adoption_score = min(10.0, recent_mentions / 2.0)  # Normalize
                        
                        point_id = await bailey.ingest_knowledge_point(
                            content=f"{description}: {recent_mentions} mentions in last 60 days, adoption score: {adoption_score:.1f}/10",
                            source_id=self.source_id,
                            category="technology_adoption",
                            numerical_value=adoption_score,
                            confidence=0.85
                        )
                        knowledge_ids.append(point_id)
                        
        except Exception as e:
            logging.error(f"arXiv technology adoption analysis error: {e}")
            
        return knowledge_ids
    
    async def _extract_competitive_intelligence(self) -> List[str]:
        """Extract competitive intelligence from research affiliations"""
        
        knowledge_ids = []
        
        try:
            # Track research output from major AI companies
            company_affiliations = {
                "Google": ["google", "deepmind", "alphabet"],
                "OpenAI": ["openai"],
                "Anthropic": ["anthropic"],
                "Microsoft": ["microsoft"],
                "Meta": ["meta", "facebook"],
                "Amazon": ["amazon", "aws"],
                "Apple": ["apple"]
            }
            
            base_url = "http://export.arxiv.org/api/query"
            company_research_activity = {}
            
            for company, affiliations in company_affiliations.items():
                total_papers = 0
                
                for affiliation in affiliations:
                    params = {
                        "search_query": f'au:"{affiliation}"',
                        "start": 0,
                        "max_results": 30,
                        "sortBy": "submittedDate",
                        "sortOrder": "descending"
                    }
                    
                    response = await self.client.get(base_url, params=params)
                    self._respect_rate_limit()
                    
                    if response.status_code == 200:
                        root = ET.fromstring(response.content)
                        
                        # Count recent papers
                        for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
                            published = entry.find("{http://www.w3.org/2005/Atom}published")
                            if published is not None:
                                pub_date = datetime.fromisoformat(published.text.replace('Z', '+00:00'))
                                if pub_date > datetime.now().replace(tzinfo=pub_date.tzinfo) - timedelta(days=90):
                                    total_papers += 1
                
                if total_papers > 0:
                    research_velocity = total_papers / 13  # papers per week
                    company_research_activity[company] = {
                        "papers_per_week": research_velocity,
                        "total_recent_papers": total_papers,
                        "research_intensity": min(10.0, research_velocity * 2)
                    }
            
            # Generate competitive intelligence insights
            if company_research_activity:
                # Rank companies by research activity
                ranked_companies = sorted(
                    company_research_activity.items(),
                    key=lambda x: x[1]["research_intensity"],
                    reverse=True
                )
                
                top_company = ranked_companies[0]
                
                point_id = await bailey.ingest_knowledge_point(
                    content=f"Research leadership: {top_company[0]} leads with {top_company[1]['research_intensity']:.1f}/10 intensity, {top_company[1]['papers_per_week']:.1f} papers/week",
                    source_id=self.source_id,
                    category="competitive_research_intelligence",
                    numerical_value=top_company[1]["research_intensity"],
                    confidence=0.87
                )
                knowledge_ids.append(point_id)
                
        except Exception as e:
            logging.error(f"arXiv competitive intelligence error: {e}")
            
        return knowledge_ids

# Keep original for compatibility
class ArxivConnector(ArxivEnhancedConnector):
    """Legacy alias for ArxivEnhancedConnector"""
    pass

class YCombinatorConnector(BaileyConnector):
    """Connector for Y Combinator public data via CSV export."""

    EXPORT_URL = "https://www.ycombinator.com/companies/export.csv"

    def __init__(self) -> None:
        super().__init__("yc_directory")
        batches = self.get_env("YC_BATCHES") or "W24,S23,W23,S22"
        self.batches = [batch.strip() for batch in batches.split(",") if batch.strip()]

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []

        for batch in self.batches:
            try:
                companies = await self._fetch_batch(batch)
            except Exception as exc:  # pragma: no cover - defensive
                logging.error("Failed to fetch YC batch %s: %s", batch, exc)
                continue

            if not companies:
                continue

            metrics = self._summarise_batch(companies)

            content = (
                f"Y Combinator batch {batch} includes {metrics['company_count']} companies with median funding ${metrics['median_raised']:.2f}M"
            )
            point_id = await self._ingest_point(
                content=content,
                category="yc_batch_analysis",
                freshness=DataFreshness.MONTHLY,
                confidence=0.82,
                metadata=metrics,
                numerical_value=float(metrics["company_count"]),
            )
            knowledge_ids.append(point_id)

            top_industry = metrics.get("top_industry")
            if top_industry:
                point_id = await self._ingest_point(
                    content=f"YC {batch} leading industry: {top_industry}",
                    category="yc_industry_insights",
                    freshness=DataFreshness.MONTHLY,
                    confidence=0.78,
                    metadata={"distribution": metrics.get("industry_distribution")},
                )
                knowledge_ids.append(point_id)

        return knowledge_ids

    async def _fetch_batch(self, batch: str) -> List[Dict[str, Any]]:
        headers = {"User-Agent": "WeReady Intelligence", "Accept": "text/csv"}
        response = await self._request("GET", self.EXPORT_URL, params={"batch": batch}, headers=headers)
        csv_buffer = io.StringIO(response.text)
        reader = csv.DictReader(csv_buffer)
        return [row for row in reader]

    def _summarise_batch(self, companies: List[Dict[str, Any]]) -> Dict[str, Any]:
        industries: Counter = Counter()
        locations: Counter = Counter()
        funding_values: List[float] = []

        for company in companies:
            industry = (company.get("Industry") or company.get("industry") or "Unknown").strip()
            location = (company.get("Location") or company.get("location") or "Unknown").strip()
            industries[industry] += 1
            locations[location] += 1

            total_raised = company.get("Total Raised") or company.get("total_raised") or "0"
            parsed_amount = self._parse_currency(total_raised)
            if parsed_amount:
                funding_values.append(parsed_amount / 1_000_000)  # store in millions

        median_raised = statistics.median(funding_values) if funding_values else 0.0
        top_industry = industries.most_common(1)[0][0] if industries else None

        return {
            "company_count": len(companies),
            "median_raised": median_raised,
            "top_industry": top_industry,
            "industry_distribution": dict(industries.most_common(5)),
            "top_locations": dict(locations.most_common(5)),
        }

    @staticmethod
    def _parse_currency(value: Any) -> Optional[float]:
        if not value:
            return None
        text = str(value).strip().replace("$", "").replace(",", "").lower()
        multiplier = 1.0
        if text.endswith("m"):
            multiplier = 1_000_000.0
            text = text[:-1]
        elif text.endswith("k"):
            multiplier = 1_000.0
            text = text[:-1]
        try:
            return float(text) * multiplier
        except ValueError:
            return None

class StackOverflowConnector(BaileyConnector):
    """Connector for Stack Overflow public API."""

    BASE_URL = "https://api.stackexchange.com/2.3"

    def __init__(self) -> None:
        super().__init__("stackoverflow")
        self.api_key = self.get_env("STACKOVERFLOW_API_KEY")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []

        popular_tags = await self._fetch_popular_tags()
        knowledge_ids.extend(popular_tags)

        ai_activity = await self._fetch_ai_activity()
        knowledge_ids.extend(ai_activity)

        sentiment = await self._fetch_developer_sentiment()
        knowledge_ids.extend(sentiment)

        return knowledge_ids

    async def _stack_request(self, path: str, **params: Any) -> Dict[str, Any]:
        query = {"site": "stackoverflow", "pagesize": 20, **params}
        if self.api_key:
            query["key"] = self.api_key
        return await self._get_json(f"{self.BASE_URL}{path}", params=query)

    async def _fetch_popular_tags(self) -> List[str]:
        knowledge_ids: List[str] = []
        try:
            data = await self._stack_request("/tags", order="desc", sort="popular", pagesize=5)
            for tag in data.get("items", []):
                name = tag.get("name")
                count = tag.get("count", 0)
                content = f"Stack Overflow tag {name} has {count:,} questions"
                point_id = await self._ingest_point(
                    content=content,
                    category="technology_trends",
                    freshness=DataFreshness.DAILY,
                    confidence=0.8,
                    metadata={"tag": name, "question_count": count},
                    numerical_value=float(count),
                )
                knowledge_ids.append(point_id)
        except Exception as exc:  # pragma: no cover
            logging.error("Stack Overflow popular tags failed: %s", exc)
        return knowledge_ids

    async def _fetch_ai_activity(self) -> List[str]:
        knowledge_ids: List[str] = []
        try:
            data = await self._stack_request(
                "/questions",
                order="desc",
                sort="activity",
                tagged="artificial-intelligence;machine-learning",
                pagesize=10,
                filter="default",
            )
            items = data.get("items", [])
            total_views = sum(item.get("view_count", 0) for item in items)
            average_score = statistics.mean([item.get("score", 0) for item in items]) if items else 0.0
            content = f"Stack Overflow AI/ML questions generated {total_views:,} views in latest activity window"
            point_id = await self._ingest_point(
                content=content,
                category="developer_ai_adoption",
                freshness=DataFreshness.DAILY,
                confidence=0.78,
                metadata={"questions": len(items), "average_score": average_score},
                numerical_value=float(total_views),
            )
            knowledge_ids.append(point_id)
        except Exception as exc:  # pragma: no cover
            logging.error("Stack Overflow AI activity failed: %s", exc)
        return knowledge_ids

    async def _fetch_developer_sentiment(self) -> List[str]:
        knowledge_ids: List[str] = []
        try:
            data = await self._stack_request(
                "/questions",
                order="desc",
                sort="votes",
                tagged="career-development;founders",
                pagesize=10,
            )
            items = data.get("items", [])
            average_score = statistics.mean([item.get("score", 0) for item in items]) if items else 0.0
            accepted = sum(1 for item in items if item.get("is_answered"))
            content = (
                f"Stack Overflow founder/career conversations average score {average_score:.1f} with {accepted} answered questions"
            )
            point_id = await self._ingest_point(
                content=content,
                category="developer_sentiment",
                freshness=DataFreshness.DAILY,
                confidence=0.76,
                metadata={"question_count": len(items), "answered": accepted},
                numerical_value=float(average_score),
            )
            knowledge_ids.append(point_id)
        except Exception as exc:  # pragma: no cover
            logging.error("Stack Overflow sentiment fetch failed: %s", exc)
        return knowledge_ids

class RedditConnector(BaileyConnector):
    """Connector for Reddit startup communities - founder sentiment"""
    
    def __init__(self):
        super().__init__("reddit_startups")
        
    async def ingest_data(self) -> List[str]:
        """Ingest Reddit startup community discussions"""
        
        knowledge_ids = []
        
        # Get hot posts from startup subreddits
        startup_sentiment = await self._get_startup_sentiment()
        for point_id in startup_sentiment:
            knowledge_ids.append(point_id)
            
        return knowledge_ids
        
    async def _get_startup_sentiment(self) -> List[str]:
        """Analyze sentiment and trends from startup communities"""
        
        knowledge_ids = []
        
        try:
            # Get hot posts from r/startups
            url = "https://www.reddit.com/r/startups/hot.json"
            params = {"limit": 25}
            
            headers = {"User-Agent": "WeReady-Bailey/1.0"}
            response = await self.client.get(url, params=params, headers=headers)
            self._respect_rate_limit()
            
            if response.status_code == 200:
                data = response.json()
                
                # Analyze post topics and engagement
                funding_posts = 0
                ai_posts = 0
                total_posts = 0
                
                for post in data.get("data", {}).get("children", []):
                    post_data = post.get("data", {})
                    title = post_data.get("title", "").lower()
                    total_posts += 1
                    
                    if any(word in title for word in ["funding", "raised", "investment", "vc"]):
                        funding_posts += 1
                    if any(word in title for word in ["ai", "ml", "gpt", "llm", "artificial"]):
                        ai_posts += 1
                        
                if total_posts > 0:
                    funding_percentage = (funding_posts / total_posts) * 100
                    ai_percentage = (ai_posts / total_posts) * 100
                    
                    # Store funding discussion trends
                    if funding_posts > 0:
                        point_id = await bailey.ingest_knowledge_point(
                            content=f"{funding_percentage:.1f}% of hot startup discussions mention funding topics",
                            source_id=self.source_id,
                            category="founder_sentiment",
                            numerical_value=funding_percentage,
                            confidence=0.6
                        )
                        knowledge_ids.append(point_id)
                        
                    # Store AI discussion trends
                    if ai_posts > 0:
                        point_id = await bailey.ingest_knowledge_point(
                            content=f"{ai_percentage:.1f}% of hot startup discussions mention AI topics",
                            source_id=self.source_id,
                            category="ai_startup_trends",
                            numerical_value=ai_percentage,
                            confidence=0.6
                        )
                        knowledge_ids.append(point_id)
                        
        except Exception as e:
            logging.error(f"Reddit sentiment analysis error: {e}")
            
        return knowledge_ids
class CensusBusinessFormationConnector(BaileyConnector):
    """Connector for U.S. Census Business Formation Statistics"""

    def __init__(self):
        super().__init__("census_bfs")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []
        try:
            formation = await business_formation_tracker.get_business_formation_trends()
            if formation:
                momentum_raw = formation.get("momentum_score")
                momentum = float(momentum_raw) if momentum_raw is not None else 0.0
                point_id = await bailey.ingest_knowledge_point(
                    content=f"Census BFS momentum score {momentum:.1f} indicates startup formation velocity vs national baseline.",
                    source_id=self.source_id,
                    category="business_formation_trends",
                    numerical_value=momentum,
                    confidence=0.87
                )
                knowledge_ids.append(point_id)

                for signal in formation.get("signals", [])[:5]:
                    name = signal.get("name") or signal.get("metric")
                    value = signal.get("current_value")
                    point_id = await bailey.ingest_knowledge_point(
                        content=f"Business formation signal: {name} at {value}",
                        source_id=self.source_id,
                        category="business_formation_signals",
                        numerical_value=float(value) if isinstance(value, (int, float)) else None,
                        confidence=0.82
                    )
                    knowledge_ids.append(point_id)
        except Exception as exc:
            logging.error(f"Census BFS connector error: {exc}")
        return knowledge_ids

class InternationalMarketConnector(BaileyConnector):
    """Connector for World Bank/OECD international market intelligence"""

    def __init__(self):
        super().__init__("world_bank_indicators")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []
        try:
            context = await international_market_intelligence.get_global_market_context(country="US", industry=None)
            if context:
                opportunity_raw = context.get("opportunity_score")
                risk_raw = context.get("risk_score")
                opportunity_val = float(opportunity_raw) if opportunity_raw is not None else 0.0
                risk_val = float(risk_raw) if risk_raw is not None else 0.0
                point_id = await bailey.ingest_knowledge_point(
                    content=f"Global market opportunity score {opportunity_val:.1f} with risk {risk_val:.1f} from World Bank/OECD indicators.",
                    source_id=self.source_id,
                    category="international_market_intelligence",
                    numerical_value=opportunity_val,
                    confidence=0.84
                )
                knowledge_ids.append(point_id)

                for signal in context.get("signals", [])[:5]:
                    metric = signal.get("metric")
                    value = signal.get("value")
                    point_id = await bailey.ingest_knowledge_point(
                        content=f"International signal {metric}: {value}",
                        source_id=self.source_id,
                        category="international_market_signals",
                        numerical_value=float(value) if isinstance(value, (int, float)) else None,
                        confidence=0.8
                    )
                    knowledge_ids.append(point_id)
        except Exception as exc:
            logging.error(f"International market connector error: {exc}")
        return knowledge_ids

class ProcurementConnector(BaileyConnector):
    """Connector for federal procurement intelligence"""

    def __init__(self):
        super().__init__("usaspending")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []
        try:
            procurement = await procurement_intelligence.get_procurement_opportunities(naics_code="541511", sector=None)
            if procurement:
                count = float(procurement.get("opportunity_count", 0) or 0)
                total_value = float(procurement.get("total_value", 0.0) or 0.0)
                point_id = await bailey.ingest_knowledge_point(
                    content=f"Government pipeline shows {count:.0f} active AI/ML opportunities totaling ${total_value:,.0f}",
                    source_id=self.source_id,
                    category="government_procurement",
                    numerical_value=count,
                    confidence=0.86
                )
                knowledge_ids.append(point_id)

                for agency in (procurement.get("top_agencies") or [])[:5]:
                    point_id = await bailey.ingest_knowledge_point(
                        content=f"Top procurement agency focus: {agency}",
                        source_id=self.source_id,
                        category="government_procurement_agencies",
                        confidence=0.78
                    )
                    knowledge_ids.append(point_id)
        except Exception as exc:
            logging.error(f"Procurement connector error: {exc}")
        return knowledge_ids

class TechnologyMomentumConnector(BaileyConnector):
    """Connector for technology adoption momentum"""

    def __init__(self):
        super().__init__("product_hunt")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []
        try:
            trends = await technology_trend_analyzer.get_trend_report("ai")
            if trends:
                adoption_raw = trends.get("adoption_index")
                adoption = float(adoption_raw) if adoption_raw is not None else 0.0
                point_id = await bailey.ingest_knowledge_point(
                    content=f"Technology adoption index is {adoption:.1f} based on Product Hunt + Stack Exchange momentum",
                    source_id=self.source_id,
                    category="technology_trend_intelligence",
                    numerical_value=adoption,
                    confidence=0.83
                )
                knowledge_ids.append(point_id)

                for trend in trends.get("trends", [])[:5]:
                    label = trend.get("label")
                    score = trend.get("score")
                    point_id = await bailey.ingest_knowledge_point(
                        content=f"Technology trend: {label} momentum score {score}",
                        source_id=self.source_id,
                        category="technology_trends",
                        numerical_value=float(score) if isinstance(score, (int, float)) else None,
                        confidence=0.8
                    )
                    knowledge_ids.append(point_id)
        except Exception as exc:
            logging.error(f"Technology trend connector error: {exc}")
        return knowledge_ids

class EconomicContextConnector(BaileyConnector):
    """Connector for BEA/BLS enhanced economic context"""

    def __init__(self):
        super().__init__("bea_api")

    async def ingest_data(self) -> List[str]:
        knowledge_ids: List[str] = []
        try:
            context = await enhanced_economic_analyzer.get_economic_context(industry="ai", region="US")
            if context:
                timing_raw = context.get("timing_index")
                recession_raw = context.get("recession_risk")
                timing = float(timing_raw) if timing_raw is not None else 0.0
                recession = float(recession_raw) if recession_raw is not None else 0.0
                point_id = await bailey.ingest_knowledge_point(
                    content=f"Economic timing index {timing:.1f} with recession risk {recession:.1f} from BEA/BLS composite",
                    source_id=self.source_id,
                    category="economic_health_intelligence",
                    numerical_value=timing,
                    confidence=0.84
                )
                knowledge_ids.append(point_id)
        except Exception as exc:
            logging.error(f"Economic context connector error: {exc}")
        return knowledge_ids


class BaileyDataPipeline:
    """Main data pipeline for Bailey to ingest from all sources"""
    
    def __init__(self):
        self.connector_groups: Dict[str, Dict[str, type[BaileyConnector]]] = {
            "core_sources": {
                "github": GitHubConnector,
                "arxiv": ArxivConnector,
                "yc": YCombinatorConnector,
                "stackoverflow": StackOverflowConnector,
                "reddit": RedditConnector,
                "census": CensusBusinessFormationConnector,
                "international": InternationalMarketConnector,
                "procurement": ProcurementConnector,
                "technology_trends": TechnologyMomentumConnector,
                "economic_context": EconomicContextConnector,
            },
            "intelligence_modules": {
                "government_data": GovernmentDataIntegratorConnector,
                "academic_research": AcademicResearchConnector,
                "design_intelligence": DesignIntelligenceConnector,
                "github_intelligence": GitHubIntelligenceConnector,
                "funding_tracker": FundingTrackerConnector,
                "market_timing": MarketTimingConnector,
            },
            "code_quality_sources": {
                "sonarqube": SonarQubeConnector,
                "code_climate": CodeClimateConnector,
                "gitguardian": GitGuardianConnector,
                "semgrep": SemgrepConnector,
                "veracode": VeracodeConnector,
            },
            "business_intelligence_sources": {
                "first_round": FirstRoundCapitalConnector,
                "andreessen_horowitz": AndreessenHorowitzConnector,
                "lean_startup": LeanStartupConnector,
                "profitwell": ProfitWellConnector,
                "harvard_business_school": HarvardBusinessSchoolConnector,
            },
            "investment_readiness_sources": {
                "sequoia": SequoiaCapitalConnector,
                "bessemer": BessemerVenturePartnersConnector,
                "mit_entrepreneurship": MITEntrepreneurshipConnector,
                "nvca": NVCAConnector,
                "cb_insights": CBInsightsConnector,
                "angel_list": AngelListConnector,
            },
            "design_experience_sources": {
                "nielsen_norman": NielsenNormanGroupConnector,
                "baymard": BaymardInstituteConnector,
                "webaim": WebAIMConnector,
                "google_design": GoogleDesignConnector,
                "apple_hig": AppleHIGConnector,
                "chrome_ux_report": ChromeUXReportConnector,
            },
        }

        self.connectors: Dict[str, type[BaileyConnector]] = {}
        self.connector_metadata: Dict[str, Dict[str, str]] = {}
        for group, connectors in self.connector_groups.items():
            for name, connector in connectors.items():
                key = f"{group}:{name}"
                self.connectors[key] = connector
                self.connector_metadata[key] = {"group": group, "name": name}
        
    async def run_full_ingestion(self) -> Dict[str, Any]:
        """Run full data ingestion from all available sources"""
        
        results = {
            "start_time": datetime.now(),
            "sources_processed": 0,
            "knowledge_points_added": 0,
            "errors": [],
            "source_results": {}
        }
        
        for connector_key, connector_class in self.connectors.items():
            try:
                async with connector_class() as connector:
                    knowledge_ids = await connector.ingest_data()
                    results["source_results"][connector_key] = {
                        "success": True,
                        "knowledge_points": len(knowledge_ids),
                        "ids": knowledge_ids
                    }
                    results["knowledge_points_added"] += len(knowledge_ids)
                    results["sources_processed"] += 1
                    
                    # Brief pause between sources
                    await asyncio.sleep(1)
                    
            except Exception as e:
                error_msg = f"Error processing {connector_key}: {str(e)}"
                logging.error(error_msg)
                results["errors"].append(error_msg)
                results["source_results"][connector_key] = {
                    "success": False,
                    "error": str(e)
                }
                
        results["end_time"] = datetime.now()
        results["duration"] = (results["end_time"] - results["start_time"]).total_seconds()
        
        return results
        
    async def run_incremental_update(self, source_names: List[str] = None) -> Dict[str, Any]:
        """Run incremental update for specific sources"""
        
        if source_names is None:
            default_keys = [
                "core_sources:github",
                "core_sources:reddit",
                "core_sources:technology_trends",
                "core_sources:census",
                "intelligence_modules:funding_tracker",
                "intelligence_modules:market_timing",
            ]
            source_names = [key for key in default_keys if key in self.connectors]
            
        results = {
            "start_time": datetime.now(),
            "sources_processed": 0,
            "knowledge_points_added": 0,
            "source_results": {}
        }
        
        for source_name in source_names:
            if source_name in self.connectors:
                try:
                    async with self.connectors[source_name]() as connector:
                        knowledge_ids = await connector.ingest_data()
                        results["source_results"][source_name] = {
                            "success": True,
                            "knowledge_points": len(knowledge_ids)
                        }
                        results["knowledge_points_added"] += len(knowledge_ids)
                        results["sources_processed"] += 1
                        
                except Exception as e:
                    results["source_results"][source_name] = {
                        "success": False,
                        "error": str(e)
                    }
                    
        results["end_time"] = datetime.now()
        results["duration"] = (results["end_time"] - results["start_time"]).total_seconds()
        
        return results

# Singleton instance
bailey_pipeline = BaileyDataPipeline()
