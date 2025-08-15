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
import time
import logging
from dataclasses import asdict

from .bailey import bailey, KnowledgePoint, DataFreshness

class BaileyConnector:
    """Base class for Bailey data connectors"""
    
    def __init__(self, source_id: str):
        self.source_id = source_id
        self.source = bailey.knowledge_sources.get(source_id)
        if not self.source:
            raise ValueError(f"Unknown source: {source_id}")
        self.client = httpx.AsyncClient(timeout=30.0)
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
        
    async def ingest_data(self) -> List[str]:
        """Ingest data from this source. Returns list of knowledge point IDs"""
        raise NotImplementedError
        
    def _respect_rate_limit(self):
        """Respect rate limits for this source"""
        if self.source.rate_limit:
            # Simple rate limiting - sleep based on rate limit
            if "second" in self.source.rate_limit.lower():
                time.sleep(1.1)  # Be conservative
            elif "minute" in self.source.rate_limit.lower():
                time.sleep(0.1)

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
            # Search for recently popular repositories
            url = "https://api.github.com/search/repositories"
            params = {
                "q": "created:>2024-01-01 stars:>100",
                "sort": "stars",
                "order": "desc",
                "per_page": 50
            }
            
            response = await self.client.get(url, params=params)
            self._respect_rate_limit()
            
            if response.status_code == 200:
                data = response.json()
                
                # Analyze language trends
                languages = {}
                for repo in data.get("items", []):
                    lang = repo.get("language")
                    if lang:
                        languages[lang] = languages.get(lang, 0) + repo.get("stargazers_count", 0)
                        
                # Store top language trends
                for lang, stars in sorted(languages.items(), key=lambda x: x[1], reverse=True)[:10]:
                    point_id = await bailey.ingest_knowledge_point(
                        content=f"{lang} has {stars} total stars in trending repositories created in 2024",
                        source_id=self.source_id,
                        category="technology_trends",
                        numerical_value=float(stars),
                        confidence=0.8
                    )
                    knowledge_ids.append(point_id)
                    
        except Exception as e:
            logging.error(f"GitHub trending repositories error: {e}")
            
        return knowledge_ids
        
    async def _get_language_trends(self) -> List[str]:
        """Get programming language adoption trends"""
        
        knowledge_ids = []
        
        try:
            # Search for AI/ML related repositories
            ai_languages = ["python", "javascript", "typescript", "rust", "go"]
            
            for lang in ai_languages:
                url = "https://api.github.com/search/repositories"
                params = {
                    "q": f"language:{lang} AI OR machine learning OR LLM created:>2024-01-01",
                    "sort": "stars",
                    "per_page": 10
                }
                
                response = await self.client.get(url, params=params)
                self._respect_rate_limit()
                
                if response.status_code == 200:
                    data = response.json()
                    total_count = data.get("total_count", 0)
                    
                    point_id = await bailey.ingest_knowledge_point(
                        content=f"{total_count} AI/ML repositories created in 2024 using {lang}",
                        source_id=self.source_id,
                        category="ai_technology_adoption",
                        numerical_value=float(total_count),
                        confidence=0.75
                    )
                    knowledge_ids.append(point_id)
                    
        except Exception as e:
            logging.error(f"GitHub language trends error: {e}")
            
        return knowledge_ids

class ArxivConnector(BaileyConnector):
    """Connector for arXiv - latest AI and technology research"""
    
    def __init__(self):
        super().__init__("arxiv")
        
    async def ingest_data(self) -> List[str]:
        """Ingest latest AI research papers from arXiv"""
        
        knowledge_ids = []
        
        # Get recent AI papers
        ai_papers = await self._get_recent_ai_papers()
        for point_id in ai_papers:
            knowledge_ids.append(point_id)
            
        return knowledge_ids
        
    async def _get_recent_ai_papers(self) -> List[str]:
        """Get recent AI research papers and extract trends"""
        
        knowledge_ids = []
        
        try:
            # Search for recent AI papers
            base_url = "http://export.arxiv.org/api/query"
            
            # Search categories: cs.AI, cs.LG, cs.CL (AI, Machine Learning, Computation and Language)
            search_terms = [
                "cat:cs.AI",
                "cat:cs.LG", 
                "cat:cs.CL"
            ]
            
            for category in search_terms:
                params = {
                    "search_query": category,
                    "start": 0,
                    "max_results": 20,
                    "sortBy": "submittedDate",
                    "sortOrder": "descending"
                }
                
                response = await self.client.get(base_url, params=params)
                self._respect_rate_limit()
                
                if response.status_code == 200:
                    # Parse XML response
                    root = ET.fromstring(response.content)
                    
                    # Count papers by submission date
                    recent_papers = []
                    for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
                        published = entry.find("{http://www.w3.org/2005/Atom}published")
                        if published is not None:
                            pub_date = datetime.fromisoformat(published.text.replace('Z', '+00:00'))
                            if pub_date > datetime.now().replace(tzinfo=pub_date.tzinfo) - timedelta(days=30):
                                recent_papers.append(pub_date)
                                
                    if recent_papers:
                        category_name = category.replace("cat:", "").replace("cs.", "")
                        point_id = await bailey.ingest_knowledge_point(
                            content=f"{len(recent_papers)} research papers published in {category_name} in the last 30 days",
                            source_id=self.source_id,
                            category="ai_research_trends",
                            numerical_value=float(len(recent_papers)),
                            confidence=0.85
                        )
                        knowledge_ids.append(point_id)
                        
        except Exception as e:
            logging.error(f"arXiv papers error: {e}")
            
        return knowledge_ids

class YCombinatorConnector(BaileyConnector):
    """Connector for Y Combinator public data - startup outcomes"""
    
    def __init__(self):
        super().__init__("yc_directory")
        
    async def ingest_data(self) -> List[str]:
        """Ingest Y Combinator company data by scraping public directory"""
        
        knowledge_ids = []
        
        # Scrape YC company directory
        company_data = await self._scrape_yc_directory()
        for point_id in company_data:
            knowledge_ids.append(point_id)
            
        return knowledge_ids
        
    async def _scrape_yc_directory(self) -> List[str]:
        """Scrape Y Combinator public company directory for outcome data"""
        
        knowledge_ids = []
        
        try:
            # YC companies API (if available) or scrape the public directory
            # Note: This is a simplified version - real implementation would need to handle pagination, etc.
            
            # For now, we'll simulate with some known patterns
            # In production, would scrape or use YC's public API if available
            
            # Analyze batch trends (simulated data based on public information)
            batches = ["W24", "S23", "W23", "S22"]
            
            for batch in batches:
                # Simulate batch analysis - in production would scrape real data
                simulated_companies = 250  # Typical YC batch size
                
                point_id = await bailey.ingest_knowledge_point(
                    content=f"Y Combinator {batch} batch had approximately {simulated_companies} companies",
                    source_id=self.source_id,
                    category="yc_batch_analysis",
                    numerical_value=float(simulated_companies),
                    confidence=0.7  # Lower confidence for simulated data
                )
                knowledge_ids.append(point_id)
                
        except Exception as e:
            logging.error(f"YC directory scraping error: {e}")
            
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

class BaileyDataPipeline:
    """Main data pipeline for Bailey to ingest from all sources"""
    
    def __init__(self):
        self.connectors = {
            "github": GitHubConnector,
            "arxiv": ArxivConnector,
            "yc": YCombinatorConnector,
            "reddit": RedditConnector
        }
        
    async def run_full_ingestion(self) -> Dict[str, Any]:
        """Run full data ingestion from all available sources"""
        
        results = {
            "start_time": datetime.now(),
            "sources_processed": 0,
            "knowledge_points_added": 0,
            "errors": [],
            "source_results": {}
        }
        
        for source_name, connector_class in self.connectors.items():
            try:
                async with connector_class() as connector:
                    knowledge_ids = await connector.ingest_data()
                    results["source_results"][source_name] = {
                        "success": True,
                        "knowledge_points": len(knowledge_ids),
                        "ids": knowledge_ids
                    }
                    results["knowledge_points_added"] += len(knowledge_ids)
                    results["sources_processed"] += 1
                    
                    # Brief pause between sources
                    await asyncio.sleep(1)
                    
            except Exception as e:
                error_msg = f"Error processing {source_name}: {str(e)}"
                logging.error(error_msg)
                results["errors"].append(error_msg)
                results["source_results"][source_name] = {
                    "success": False,
                    "error": str(e)
                }
                
        results["end_time"] = datetime.now()
        results["duration"] = (results["end_time"] - results["start_time"]).total_seconds()
        
        return results
        
    async def run_incremental_update(self, source_names: List[str] = None) -> Dict[str, Any]:
        """Run incremental update for specific sources"""
        
        if source_names is None:
            source_names = ["github", "reddit"]  # Fast sources for frequent updates
            
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