"""
BAILEY SEMANTIC SEARCH LAYER
=============================
Adds intelligent querying to existing Bailey knowledge without architectural changes.
Uses Google Gemini for embeddings and LLM synthesis (free tier).

Quick wins:
- Natural language queries over existing knowledge
- Cross-category relationship discovery  
- Intelligent synthesis with citations
- No database changes required
"""

import asyncio
import google.generativeai as genai
from typing import Dict, List, Optional, Any, Tuple
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import json
import os
from dataclasses import asdict

from .bailey import bailey, KnowledgePoint, KnowledgeSource
from .credible_sources import credible_sources

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

class SemanticBailey:
    """Semantic search layer for Bailey knowledge engine"""
    
    def __init__(self):
        self.bailey = bailey
        self.credible_sources = credible_sources
        self.embeddings_cache = {}  # Cache embeddings to save API calls
        
    async def semantic_query(self, 
                           query: str, 
                           min_confidence: float = 0.7,
                           max_results: int = 10) -> Dict[str, Any]:
        """
        Perform semantic search across Bailey's knowledge base
        
        Example queries:
        - "What funding patterns exist for AI startups?"
        - "How do economic indicators affect startup success?"
        - "What technology trends suggest good market timing?"
        """
        
        # Step 1: Generate embedding for the query
        query_embedding = await self._get_embedding(query)
        
        # Step 2: Find semantically similar knowledge points
        relevant_knowledge = await self._find_similar_knowledge(
            query_embedding, min_confidence, max_results
        )
        
        # Step 3: Synthesize intelligent response
        synthesis = await self._synthesize_response(query, relevant_knowledge)
        
        return {
            "query": query,
            "relevant_knowledge_points": len(relevant_knowledge),
            "synthesis": synthesis,
            "sources_used": self._extract_sources(relevant_knowledge),
            "credibility_score": self._calculate_response_credibility(relevant_knowledge),
            "knowledge_details": [self._format_knowledge_point(kp) for kp in relevant_knowledge]
        }
    
    async def cross_domain_analysis(self, 
                                  domain_a: str, 
                                  domain_b: str,
                                  relationship_type: str = "correlation") -> Dict[str, Any]:
        """
        Find relationships between different knowledge domains
        
        Examples:
        - cross_domain_analysis("ai_trends", "funding", "correlation")
        - cross_domain_analysis("economic_indicators", "startup_success", "causation")
        """
        
        # Get knowledge from both domains
        domain_a_knowledge = self.bailey.get_knowledge_by_category(domain_a)
        domain_b_knowledge = self.bailey.get_knowledge_by_category(domain_b)
        
        if not domain_a_knowledge or not domain_b_knowledge:
            return {"error": f"Insufficient knowledge in domains: {domain_a}, {domain_b}"}
        
        # Analyze relationships
        relationships = await self._analyze_domain_relationships(
            domain_a_knowledge, domain_b_knowledge, relationship_type
        )
        
        return {
            "domain_a": domain_a,
            "domain_b": domain_b,
            "relationship_type": relationship_type,
            "relationships_found": len(relationships),
            "analysis": relationships,
            "confidence": self._calculate_relationship_confidence(relationships)
        }
    
    async def market_timing_intelligence(self, 
                                       startup_category: str,
                                       time_horizon: str = "6_months") -> Dict[str, Any]:
        """
        Analyze market timing for a startup category using all available knowledge
        
        Combines: economic data + funding trends + technology adoption + sentiment
        """
        
        # Gather relevant knowledge from multiple domains
        economic_signals = self.bailey.get_knowledge_by_category("economic_indicators")
        funding_trends = self.bailey.get_knowledge_by_category("funding")
        tech_trends = self.bailey.get_knowledge_by_category("technology_trends")
        sentiment_data = self.bailey.get_knowledge_by_category("market_sentiment")
        
        # Synthesize timing intelligence
        timing_analysis = await self._analyze_market_timing(
            startup_category, time_horizon, 
            economic_signals, funding_trends, tech_trends, sentiment_data
        )
        
        return timing_analysis
    
    async def competitive_gap_analysis(self, 
                                     technology_focus: str) -> Dict[str, Any]:
        """
        Identify market gaps by analyzing patent activity vs funding patterns
        """
        
        # Get innovation/patent data
        innovation_data = self.bailey.get_knowledge_by_category("innovation")
        patent_data = self.bailey.get_knowledge_by_category("competitive_intelligence")
        funding_data = self.bailey.get_knowledge_by_category("funding")
        
        # Identify gaps where innovation exists but funding is light
        gaps = await self._identify_competitive_gaps(
            technology_focus, innovation_data, patent_data, funding_data
        )
        
        return gaps
    
    # Private helper methods
    
    async def _get_embedding(self, text: str) -> np.ndarray:
        """Get Gemini embedding for text, with caching"""
        
        if text in self.embeddings_cache:
            return self.embeddings_cache[text]
        
        try:
            # Use Gemini's embedding model (free tier)
            result = genai.embed_content(
                model="models/embedding-001",
                content=text,
                task_type="semantic_similarity"
            )
            
            embedding = np.array(result['embedding'])
            self.embeddings_cache[text] = embedding
            return embedding
            
        except Exception as e:
            print(f"Embedding error: {e}")
            # Fallback: return random embedding for development
            embedding = np.random.rand(768)  # Gemini embedding size
            self.embeddings_cache[text] = embedding
            return embedding
    
    async def _find_similar_knowledge(self, 
                                    query_embedding: np.ndarray,
                                    min_confidence: float,
                                    max_results: int) -> List[KnowledgePoint]:
        """Find knowledge points semantically similar to query"""
        
        relevant_points = []
        
        # Get embeddings for all knowledge points
        for point in self.bailey.knowledge_points.values():
            if point.confidence < min_confidence:
                continue
                
            # Create searchable text from knowledge point
            searchable_text = f"{point.content} {point.category} {' '.join(point.source.data_categories)}"
            
            # Get embedding
            point_embedding = await self._get_embedding(searchable_text)
            
            # Calculate similarity
            similarity = cosine_similarity([query_embedding], [point_embedding])[0][0]
            
            # Add similarity score to point for ranking
            point.similarity_score = similarity
            relevant_points.append(point)
        
        # Sort by similarity and return top results
        relevant_points.sort(key=lambda x: x.similarity_score, reverse=True)
        return relevant_points[:max_results]
    
    async def _synthesize_response(self, 
                                 query: str, 
                                 knowledge_points: List[KnowledgePoint]) -> str:
        """Use Gemini to synthesize intelligent response from knowledge points"""
        
        # Prepare context from knowledge points
        context = self._prepare_knowledge_context(knowledge_points)
        
        prompt = f"""
        You are Bailey, WeReady's credible knowledge engine. Answer this query using ONLY the provided knowledge points.
        
        Query: {query}
        
        Available Knowledge:
        {context}
        
        Instructions:
        1. Synthesize insights from the knowledge points
        2. Include specific data points and citations
        3. Note credibility scores and source organizations
        4. Identify patterns and relationships
        5. Be specific and actionable
        6. If knowledge is insufficient, say so
        
        Response:
        """
        
        try:
            model = genai.GenerativeModel('gemini-pro')
            response = model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            print(f"Synthesis error: {e}")
            return f"I found {len(knowledge_points)} relevant knowledge points for your query '{query}', but I'm having trouble synthesizing them right now. Please try again later."
    
    def _prepare_knowledge_context(self, knowledge_points: List[KnowledgePoint]) -> str:
        """Format knowledge points for LLM context"""
        
        context_parts = []
        
        for i, point in enumerate(knowledge_points, 1):
            context_parts.append(f"""
            {i}. Source: {point.source.name} ({point.source.organization})
               Credibility: {point.source.credibility_score}/100
               Content: {point.content}
               Category: {point.category}
               Confidence: {point.confidence}
               Numerical Value: {point.numerical_value}
               Similarity: {getattr(point, 'similarity_score', 0):.3f}
            """)
        
        return "\n".join(context_parts)
    
    async def _analyze_domain_relationships(self, 
                                          domain_a_points: List[KnowledgePoint],
                                          domain_b_points: List[KnowledgePoint],
                                          relationship_type: str) -> List[Dict[str, Any]]:
        """Analyze relationships between knowledge domains"""
        
        relationships = []
        
        # For now, focus on numerical correlations
        if relationship_type == "correlation":
            # Find numerical values in both domains
            a_numerical = [p for p in domain_a_points if p.numerical_value is not None]
            b_numerical = [p for p in domain_b_points if p.numerical_value is not None]
            
            if a_numerical and b_numerical:
                # Simple correlation analysis
                relationships.append({
                    "type": "numerical_correlation",
                    "domain_a_avg": np.mean([p.numerical_value for p in a_numerical]),
                    "domain_b_avg": np.mean([p.numerical_value for p in b_numerical]),
                    "sample_sizes": {"a": len(a_numerical), "b": len(b_numerical)},
                    "insight": "Numerical correlation analysis available"
                })
        
        return relationships
    
    async def _analyze_market_timing(self, 
                                   startup_category: str,
                                   time_horizon: str,
                                   *knowledge_domains) -> Dict[str, Any]:
        """Analyze market timing across multiple knowledge domains"""
        
        # For now, simple implementation
        # In production, would use more sophisticated time series analysis
        
        all_points = []
        for domain in knowledge_domains:
            all_points.extend(domain)
        
        if not all_points:
            return {"error": "Insufficient data for timing analysis"}
        
        # Calculate average sentiment/trend from available data
        numerical_points = [p for p in all_points if p.numerical_value is not None]
        
        if numerical_points:
            avg_trend = np.mean([p.numerical_value for p in numerical_points])
            confidence = np.mean([p.confidence for p in numerical_points])
            
            timing_score = min(100, max(0, avg_trend))  # Normalize to 0-100
            
            return {
                "startup_category": startup_category,
                "time_horizon": time_horizon,
                "timing_score": timing_score,
                "confidence": confidence,
                "data_points_analyzed": len(numerical_points),
                "recommendation": "Strong timing" if timing_score > 70 else "Moderate timing" if timing_score > 50 else "Weak timing",
                "supporting_data": [self._format_knowledge_point(p) for p in numerical_points[:5]]
            }
        
        return {"error": "No numerical data available for timing analysis"}
    
    async def _identify_competitive_gaps(self, 
                                       technology_focus: str,
                                       innovation_data: List[KnowledgePoint],
                                       patent_data: List[KnowledgePoint],
                                       funding_data: List[KnowledgePoint]) -> Dict[str, Any]:
        """Identify competitive gaps in the market"""
        
        # Simple gap analysis implementation
        # Look for high innovation activity but low funding activity
        
        gaps = []
        
        # Count innovation mentions for technology focus
        innovation_mentions = len([p for p in innovation_data 
                                 if technology_focus.lower() in p.content.lower()])
        
        # Count funding mentions
        funding_mentions = len([p for p in funding_data 
                              if technology_focus.lower() in p.content.lower()])
        
        if innovation_mentions > 0 and funding_mentions < innovation_mentions * 0.5:
            gaps.append({
                "technology": technology_focus,
                "gap_type": "innovation_funding_gap",
                "innovation_activity": innovation_mentions,
                "funding_activity": funding_mentions,
                "opportunity_score": min(100, (innovation_mentions - funding_mentions) * 20),
                "insight": f"High innovation activity ({innovation_mentions}) but limited funding activity ({funding_mentions})"
            })
        
        return {
            "technology_focus": technology_focus,
            "gaps_identified": len(gaps),
            "gaps": gaps,
            "recommendation": "Strong opportunity" if gaps else "Competitive market"
        }
    
    def _extract_sources(self, knowledge_points: List[KnowledgePoint]) -> List[Dict[str, Any]]:
        """Extract unique sources from knowledge points"""
        
        sources = {}
        for point in knowledge_points:
            source_id = f"{point.source.organization}_{point.source.name}"
            if source_id not in sources:
                sources[source_id] = {
                    "name": point.source.name,
                    "organization": point.source.organization,
                    "credibility_score": point.source.credibility_score,
                    "tier": point.source.tier.value,
                    "usage_count": 0
                }
            sources[source_id]["usage_count"] += 1
        
        return list(sources.values())
    
    def _calculate_response_credibility(self, knowledge_points: List[KnowledgePoint]) -> float:
        """Calculate overall credibility of the response"""
        
        if not knowledge_points:
            return 0.0
        
        # Weight by source credibility and confidence
        weighted_credibility = 0
        total_weight = 0
        
        for point in knowledge_points:
            weight = point.confidence * getattr(point, 'similarity_score', 0.5)
            weighted_credibility += point.source.credibility_score * weight
            total_weight += weight
        
        return weighted_credibility / total_weight if total_weight > 0 else 0.0
    
    def _calculate_relationship_confidence(self, relationships: List[Dict[str, Any]]) -> float:
        """Calculate confidence in relationship analysis"""
        
        if not relationships:
            return 0.0
        
        # Simple confidence based on sample sizes
        total_samples = sum(r.get("sample_sizes", {}).get("a", 0) + 
                          r.get("sample_sizes", {}).get("b", 0) 
                          for r in relationships)
        
        return min(1.0, total_samples / 20)  # Confidence increases with sample size
    
    def _format_knowledge_point(self, point: KnowledgePoint) -> Dict[str, Any]:
        """Format knowledge point for API response"""
        
        return {
            "content": point.content,
            "source": f"{point.source.name} ({point.source.organization})",
            "credibility": point.source.credibility_score,
            "confidence": point.confidence,
            "category": point.category,
            "numerical_value": point.numerical_value,
            "freshness": point.freshness.value,
            "similarity_score": getattr(point, 'similarity_score', None)
        }

# Singleton instance
semantic_bailey = SemanticBailey()