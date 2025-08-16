"""
ENHANCED CREDIBILITY ENGINE
===========================
Advanced algorithms for measuring and validating source credibility.
This creates WeReady's unbeatable evidence-based competitive advantage.

Features:
- Dynamic credibility scoring with methodology weighting
- Confidence intervals for all metrics
- Real-time source authority verification  
- Multi-source contradiction detection
- Recency and sample size validation
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum
import statistics
import math
import json

# Avoid circular import - define local classes
@dataclass
class LocalCredibleSource:
    name: str
    organization: str
    url: str
    credibility_score: float
    last_updated: str
    methodology: str

@dataclass  
class LocalEvidencePoint:
    metric: str
    value: Any
    source: LocalCredibleSource
    context: str
    citation: str

class MethodologyType(Enum):
    PEER_REVIEWED = "peer_reviewed"        # Academic papers, official studies
    LONGITUDINAL = "longitudinal"          # Multi-year tracking studies  
    LARGE_SAMPLE = "large_sample"          # >1000 data points
    CROSS_VALIDATED = "cross_validated"    # Multiple independent sources
    GOVERNMENT_DATA = "government_data"    # Official government statistics
    INDUSTRY_STANDARD = "industry_standard" # Widely accepted benchmarks

@dataclass
class CredibilityMetrics:
    """Comprehensive credibility assessment for a source"""
    base_score: float                      # 0-100 base credibility
    methodology_multiplier: float         # 0.5-2.0 based on research quality
    recency_factor: float                  # 0.5-1.5 based on data freshness
    sample_size_factor: float             # 0.5-1.5 based on study size
    peer_review_bonus: float              # +10 points for peer review
    government_bonus: float               # +15 points for government sources
    final_credibility_score: float        # Final weighted score (0-100)
    confidence_interval: Tuple[float, float] # (lower, upper) bounds
    authority_verification: bool          # Source actively maintains data
    last_methodology_check: datetime     # When we verified methodology

@dataclass
class SourceContradiction:
    """Detected contradiction between sources"""
    metric: str
    source_a: LocalCredibleSource
    source_b: LocalCredibleSource
    value_a: Any
    value_b: Any
    contradiction_severity: float        # 0-1 (how different the values are)
    resolution_confidence: float         # 0-1 (how confident we are in resolution)
    preferred_source: Optional[LocalCredibleSource] # Which source we trust more
    reasoning: str

@dataclass
class MetricConfidence:
    """Confidence assessment for a specific metric"""
    metric_name: str
    primary_value: float
    confidence_interval: Tuple[float, float]
    supporting_sources_count: int
    contradicting_sources_count: int
    source_diversity: float              # 0-1 (government/academic/industry mix)
    methodology_strength: float          # 0-1 average methodology quality
    data_freshness: float               # 0-1 how recent the data is
    final_confidence: float             # 0-1 overall confidence

class EnhancedCredibilityEngine:
    """Advanced credibility assessment and validation system"""
    
    def __init__(self):
        self.credibility_cache = {}
        self.contradiction_log = []
        self.methodology_weights = self._initialize_methodology_weights()
        self.source_authority_checks = {}
        self.last_validation_run = None
    
    def _initialize_methodology_weights(self) -> Dict[MethodologyType, float]:
        """Initialize weighting factors for different research methodologies"""
        return {
            MethodologyType.PEER_REVIEWED: 2.0,      # Highest weight for peer review
            MethodologyType.LONGITUDINAL: 1.8,       # Long-term studies very valuable
            MethodologyType.LARGE_SAMPLE: 1.6,       # Large samples increase reliability
            MethodologyType.CROSS_VALIDATED: 1.5,    # Multiple source validation
            MethodologyType.GOVERNMENT_DATA: 1.7,    # Official data highly credible
            MethodologyType.INDUSTRY_STANDARD: 1.3   # Established benchmarks
        }
    
    def calculate_enhanced_credibility(self, source: LocalCredibleSource, 
                                     methodology_types: List[MethodologyType],
                                     sample_size: Optional[int] = None,
                                     study_duration_months: Optional[int] = None) -> CredibilityMetrics:
        """Calculate comprehensive credibility score for a source"""
        
        # Base credibility from source reputation
        base_score = source.credibility_score
        
        # Methodology multiplier based on research quality
        methodology_multiplier = self._calculate_methodology_multiplier(methodology_types)
        
        # Recency factor (newer data gets higher weight)
        recency_factor = self._calculate_recency_factor(source.last_updated)
        
        # Sample size factor (larger studies get higher weight)
        sample_size_factor = self._calculate_sample_size_factor(sample_size)
        
        # Bonuses for special source types
        peer_review_bonus = 10 if MethodologyType.PEER_REVIEWED in methodology_types else 0
        government_bonus = 15 if MethodologyType.GOVERNMENT_DATA in methodology_types else 0
        
        # Calculate final score
        weighted_score = base_score * methodology_multiplier * recency_factor * sample_size_factor
        final_score = min(100, weighted_score + peer_review_bonus + government_bonus)
        
        # Calculate confidence interval
        confidence_interval = self._calculate_confidence_interval(
            final_score, methodology_types, sample_size
        )
        
        # Verify source authority
        authority_verification = self._verify_source_authority(source)
        
        return CredibilityMetrics(
            base_score=base_score,
            methodology_multiplier=methodology_multiplier,
            recency_factor=recency_factor,
            sample_size_factor=sample_size_factor,
            peer_review_bonus=peer_review_bonus,
            government_bonus=government_bonus,
            final_credibility_score=final_score,
            confidence_interval=confidence_interval,
            authority_verification=authority_verification,
            last_methodology_check=datetime.now()
        )
    
    def _calculate_methodology_multiplier(self, methodology_types: List[MethodologyType]) -> float:
        """Calculate multiplier based on research methodology quality"""
        
        if not methodology_types:
            return 1.0
        
        # Get the highest weight methodology
        max_weight = max(self.methodology_weights[mt] for mt in methodology_types)
        
        # Bonus for multiple methodology types (triangulation)
        triangulation_bonus = min(0.3, (len(methodology_types) - 1) * 0.1)
        
        return min(2.0, max_weight + triangulation_bonus)
    
    def _calculate_recency_factor(self, last_updated: str) -> float:
        """Calculate factor based on data freshness"""
        
        try:
            # Parse last updated date
            if isinstance(last_updated, str):
                # Handle different date formats
                if len(last_updated) == 7:  # "2024-12" format
                    last_updated_date = datetime.strptime(last_updated + "-01", "%Y-%m-%d")
                else:
                    last_updated_date = datetime.strptime(last_updated, "%Y-%m-%d")
            else:
                last_updated_date = last_updated
            
            # Calculate age in days
            age_days = (datetime.now() - last_updated_date).days
            
            # Recency factor: 1.5 for <30 days, 1.0 for <365 days, 0.5 for older
            if age_days < 30:
                return 1.5
            elif age_days < 90:
                return 1.3
            elif age_days < 180:
                return 1.1
            elif age_days < 365:
                return 1.0
            elif age_days < 730:
                return 0.8
            else:
                return 0.5
                
        except (ValueError, TypeError):
            return 1.0  # Default if date parsing fails
    
    def _calculate_sample_size_factor(self, sample_size: Optional[int]) -> float:
        """Calculate factor based on study sample size"""
        
        if sample_size is None:
            return 1.0
        
        if sample_size >= 10000:
            return 1.5
        elif sample_size >= 5000:
            return 1.4
        elif sample_size >= 1000:
            return 1.3
        elif sample_size >= 500:
            return 1.2
        elif sample_size >= 100:
            return 1.1
        elif sample_size >= 50:
            return 1.0
        else:
            return 0.8  # Small samples get penalized
    
    def _calculate_confidence_interval(self, score: float, 
                                     methodology_types: List[MethodologyType],
                                     sample_size: Optional[int]) -> Tuple[float, float]:
        """Calculate confidence interval for the credibility score"""
        
        # Base margin of error
        base_margin = 5.0
        
        # Reduce margin for better methodologies
        methodology_reduction = 0
        if MethodologyType.PEER_REVIEWED in methodology_types:
            methodology_reduction += 2.0
        if MethodologyType.LARGE_SAMPLE in methodology_types:
            methodology_reduction += 1.5
        if MethodologyType.CROSS_VALIDATED in methodology_types:
            methodology_reduction += 1.0
        
        # Reduce margin for larger sample sizes
        sample_reduction = 0
        if sample_size and sample_size >= 1000:
            sample_reduction = min(2.0, math.log10(sample_size))
        
        # Calculate final margin
        margin = max(1.0, base_margin - methodology_reduction - sample_reduction)
        
        # Return confidence interval
        lower_bound = max(0, score - margin)
        upper_bound = min(100, score + margin)
        
        return (lower_bound, upper_bound)
    
    def _verify_source_authority(self, source: LocalCredibleSource) -> bool:
        """Verify that source is actively maintaining and updating data"""
        
        # Cache verification results for 24 hours
        cache_key = f"{source.organization}_{source.name}"
        if cache_key in self.source_authority_checks:
            check_time, result = self.source_authority_checks[cache_key]
            if datetime.now() - check_time < timedelta(hours=24):
                return result
        
        # Verification criteria
        authority_indicators = []
        
        # Check if source has recent updates
        try:
            if source.last_updated:
                last_update = datetime.strptime(source.last_updated + "-01" if len(source.last_updated) == 7 else source.last_updated, "%Y-%m-%d")
                days_since_update = (datetime.now() - last_update).days
                authority_indicators.append(days_since_update < 365)  # Updated within year
        except:
            authority_indicators.append(False)
        
        # Check organization credibility
        credible_orgs = [
            "y combinator", "bessemer", "first round", "mit", "stanford", "harvard",
            "u.s. food & drug administration", "national institute", "federal",
            "treasury", "github", "stack overflow", "openai", "cb insights"
        ]
        org_credible = any(org.lower() in source.organization.lower() for org in credible_orgs)
        authority_indicators.append(org_credible)
        
        # Check credibility score threshold
        authority_indicators.append(source.credibility_score >= 80)
        
        # Require at least 2/3 indicators to pass
        is_authoritative = sum(authority_indicators) >= 2
        
        # Cache result
        self.source_authority_checks[cache_key] = (datetime.now(), is_authoritative)
        
        return is_authoritative
    
    def detect_source_contradictions(self, metric: str, evidence_points: List[LocalEvidencePoint]) -> List[SourceContradiction]:
        """Detect contradictions between sources for a specific metric"""
        
        contradictions = []
        
        # Group evidence points by source
        source_values = {}
        for point in evidence_points:
            if point.metric == metric and point.value is not None:
                source_id = f"{point.source.organization}_{point.source.name}"
                source_values[source_id] = {
                    "source": point.source,
                    "value": point.value,
                    "point": point
                }
        
        # Check for contradictions between sources
        sources = list(source_values.keys())
        for i in range(len(sources)):
            for j in range(i + 1, len(sources)):
                source_a_id, source_b_id = sources[i], sources[j]
                source_a_data = source_values[source_a_id]
                source_b_data = source_values[source_b_id]
                
                value_a = source_a_data["value"]
                value_b = source_b_data["value"]
                
                # Calculate contradiction severity
                severity = self._calculate_contradiction_severity(value_a, value_b)
                
                if severity > 0.2:  # Significant contradiction threshold
                    # Determine preferred source
                    preferred_source = self._resolve_contradiction(
                        source_a_data["source"], source_b_data["source"], 
                        value_a, value_b
                    )
                    
                    contradiction = SourceContradiction(
                        metric=metric,
                        source_a=source_a_data["source"],
                        source_b=source_b_data["source"],
                        value_a=value_a,
                        value_b=value_b,
                        contradiction_severity=severity,
                        resolution_confidence=0.8 if preferred_source else 0.5,
                        preferred_source=preferred_source,
                        reasoning=self._generate_contradiction_reasoning(
                            source_a_data["source"], source_b_data["source"], severity
                        )
                    )
                    
                    contradictions.append(contradiction)
        
        return contradictions
    
    def _calculate_contradiction_severity(self, value_a: Any, value_b: Any) -> float:
        """Calculate how severely two values contradict each other"""
        
        try:
            # Convert to float if possible
            val_a = float(value_a)
            val_b = float(value_b)
            
            # Calculate relative difference
            avg = (val_a + val_b) / 2
            if avg == 0:
                return 1.0 if val_a != val_b else 0.0
            
            diff = abs(val_a - val_b)
            relative_diff = diff / avg
            
            # Severity scale: 0-0.1 = minor, 0.1-0.3 = moderate, 0.3+ = severe
            return min(1.0, relative_diff)
            
        except (ValueError, TypeError):
            # For non-numeric values, check if they're exactly equal
            return 0.0 if value_a == value_b else 1.0
    
    def _resolve_contradiction(self, source_a: LocalCredibleSource, source_b: LocalCredibleSource,
                             value_a: Any, value_b: Any) -> Optional[LocalCredibleSource]:
        """Determine which source to trust when there's a contradiction"""
        
        # Factors for resolution (higher score wins)
        score_a = self._calculate_resolution_score(source_a)
        score_b = self._calculate_resolution_score(source_b)
        
        # Require significant difference to choose a preferred source
        if abs(score_a - score_b) >= 10:
            return source_a if score_a > score_b else source_b
        else:
            return None  # Too close to call
    
    def _calculate_resolution_score(self, source: LocalCredibleSource) -> float:
        """Calculate score for contradiction resolution"""
        
        score = source.credibility_score
        
        # Bonuses for specific source types
        org_lower = source.organization.lower()
        if any(gov in org_lower for gov in ["federal", "government", "u.s.", "national institute"]):
            score += 15  # Government sources get priority
        elif any(academic in org_lower for gov in ["mit", "stanford", "harvard", "university"]):
            score += 10  # Academic sources
        elif any(vc in org_lower for vc in ["y combinator", "bessemer", "first round"]):
            score += 8   # Top VC firms
        
        # Recency bonus
        recency_factor = self._calculate_recency_factor(source.last_updated)
        score *= recency_factor
        
        return score
    
    def _generate_contradiction_reasoning(self, source_a: LocalCredibleSource, 
                                        source_b: LocalCredibleSource, severity: float) -> str:
        """Generate human-readable reasoning for contradiction resolution"""
        
        severity_desc = "severe" if severity > 0.5 else "moderate" if severity > 0.3 else "minor"
        
        return f"{severity_desc.title()} contradiction detected between {source_a.organization} and {source_b.organization}. " \
               f"Resolution based on source credibility ({source_a.credibility_score} vs {source_b.credibility_score}) " \
               f"and methodology validation."
    
    def calculate_metric_confidence(self, metric: str, evidence_points: List[LocalEvidencePoint]) -> MetricConfidence:
        """Calculate comprehensive confidence assessment for a metric"""
        
        if not evidence_points:
            return MetricConfidence(
                metric_name=metric,
                primary_value=0,
                confidence_interval=(0, 0),
                supporting_sources_count=0,
                contradicting_sources_count=0,
                source_diversity=0,
                methodology_strength=0,
                data_freshness=0,
                final_confidence=0
            )
        
        # Get primary value (weighted average)
        primary_value = self._calculate_weighted_average_value(evidence_points)
        
        # Count supporting sources
        supporting_sources = len([p for p in evidence_points if p.metric == metric])
        
        # Detect contradictions
        contradictions = self.detect_source_contradictions(metric, evidence_points)
        contradicting_sources = len(contradictions)
        
        # Calculate source diversity
        source_diversity = self._calculate_source_diversity(evidence_points)
        
        # Calculate methodology strength
        methodology_strength = self._calculate_methodology_strength(evidence_points)
        
        # Calculate data freshness
        data_freshness = self._calculate_data_freshness(evidence_points)
        
        # Calculate confidence interval
        confidence_interval = self._calculate_metric_confidence_interval(evidence_points, primary_value)
        
        # Calculate final confidence
        final_confidence = self._calculate_final_confidence(
            supporting_sources, contradicting_sources, source_diversity,
            methodology_strength, data_freshness
        )
        
        return MetricConfidence(
            metric_name=metric,
            primary_value=primary_value,
            confidence_interval=confidence_interval,
            supporting_sources_count=supporting_sources,
            contradicting_sources_count=contradicting_sources,
            source_diversity=source_diversity,
            methodology_strength=methodology_strength,
            data_freshness=data_freshness,
            final_confidence=final_confidence
        )
    
    def _calculate_weighted_average_value(self, evidence_points: List[LocalEvidencePoint]) -> float:
        """Calculate weighted average value based on source credibility"""
        
        values_with_weights = []
        
        for point in evidence_points:
            if point.value is not None and isinstance(point.value, (int, float)):
                weight = point.source.credibility_score / 100  # Normalize to 0-1
                values_with_weights.append((float(point.value), weight))
        
        if not values_with_weights:
            return 0.0
        
        weighted_sum = sum(value * weight for value, weight in values_with_weights)
        total_weight = sum(weight for _, weight in values_with_weights)
        
        return weighted_sum / total_weight if total_weight > 0 else 0.0
    
    def _calculate_source_diversity(self, evidence_points: List[LocalEvidencePoint]) -> float:
        """Calculate diversity score (0-1) based on source types"""
        
        source_types = set()
        
        for point in evidence_points:
            org_lower = point.source.organization.lower()
            
            if any(gov in org_lower for gov in ["federal", "government", "u.s.", "national"]):
                source_types.add("government")
            elif any(academic in org_lower for academic in ["mit", "stanford", "harvard", "university"]):
                source_types.add("academic")
            elif any(vc in org_lower for vc in ["combinator", "bessemer", "first round", "capital"]):
                source_types.add("venture_capital")
            elif any(industry in org_lower for industry in ["github", "stack overflow", "cb insights"]):
                source_types.add("industry")
            else:
                source_types.add("other")
        
        # Diversity score: 1.0 for all 4 types, 0.75 for 3 types, etc.
        return len(source_types) / 4.0
    
    def _calculate_methodology_strength(self, evidence_points: List[LocalEvidencePoint]) -> float:
        """Calculate average methodology strength across sources"""
        
        methodology_scores = []
        
        for point in evidence_points:
            score = point.source.credibility_score / 100  # Base score
            
            # Bonus for specific methodology indicators in source name/org
            if "peer" in point.source.methodology.lower() or "review" in point.source.methodology.lower():
                score += 0.2
            if "longitudinal" in point.source.methodology.lower() or "year" in point.source.methodology.lower():
                score += 0.15
            if "study" in point.source.methodology.lower() or "research" in point.source.methodology.lower():
                score += 0.1
            
            methodology_scores.append(min(1.0, score))
        
        return statistics.mean(methodology_scores) if methodology_scores else 0.0
    
    def _calculate_data_freshness(self, evidence_points: List[LocalEvidencePoint]) -> float:
        """Calculate average data freshness across sources"""
        
        freshness_scores = []
        
        for point in evidence_points:
            recency_factor = self._calculate_recency_factor(point.source.last_updated)
            # Normalize to 0-1 scale (recency_factor is 0.5-1.5)
            freshness_score = min(1.0, recency_factor / 1.5)
            freshness_scores.append(freshness_score)
        
        return statistics.mean(freshness_scores) if freshness_scores else 0.0
    
    def _calculate_metric_confidence_interval(self, evidence_points: List[LocalEvidencePoint], 
                                            primary_value: float) -> Tuple[float, float]:
        """Calculate confidence interval for metric value"""
        
        values = []
        for point in evidence_points:
            if point.value is not None and isinstance(point.value, (int, float)):
                values.append(float(point.value))
        
        if len(values) < 2:
            # Single source - use ±10% as rough estimate
            margin = primary_value * 0.1
            return (max(0, primary_value - margin), primary_value + margin)
        
        # Calculate standard error
        std_dev = statistics.stdev(values)
        std_error = std_dev / math.sqrt(len(values))
        
        # 95% confidence interval (±1.96 standard errors)
        margin = 1.96 * std_error
        
        return (max(0, primary_value - margin), primary_value + margin)
    
    def _calculate_final_confidence(self, supporting_sources: int, contradicting_sources: int,
                                  source_diversity: float, methodology_strength: float,
                                  data_freshness: float) -> float:
        """Calculate final confidence score (0-1)"""
        
        # Base confidence from source count
        source_confidence = min(1.0, supporting_sources / 3.0)  # Max confidence at 3+ sources
        
        # Penalty for contradictions
        contradiction_penalty = contradicting_sources * 0.2
        
        # Weighted combination
        final_confidence = (
            source_confidence * 0.3 +
            source_diversity * 0.2 +
            methodology_strength * 0.3 +
            data_freshness * 0.2
        ) - contradiction_penalty
        
        return max(0.0, min(1.0, final_confidence))
    
    def generate_credibility_report(self, metrics: List[str]) -> Dict[str, Any]:
        """Generate comprehensive credibility report for specified metrics"""
        
        report = {
            "report_timestamp": datetime.now().isoformat(),
            "metrics_analyzed": len(metrics),
            "credibility_summary": {},
            "source_validation": {},
            "contradiction_analysis": {},
            "confidence_intervals": {},
            "methodology_breakdown": {}
        }
        
        # This would be implemented with actual metric analysis
        # For now, return a template structure
        return report

# Singleton instance
enhanced_credibility_engine = EnhancedCredibilityEngine()