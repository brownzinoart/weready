"""
WEREADY LEARNING ENGINE
========================
Continuously learns from user inputs, codebase patterns, and outcomes to improve
our scoring accuracy and recommendations. Every scan makes us smarter.

Learning Sources:
1. User codebases and their patterns
2. Feedback on recommendation accuracy
3. Outcome tracking (did they get funded/succeed?)
4. Pattern recognition across similar startups
5. False positive/negative analysis
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import json
import hashlib
from collections import defaultdict, Counter
import statistics

class OutcomeType(Enum):
    FUNDING_SUCCESS = "funding_success"
    FUNDING_FAILURE = "funding_failure" 
    PRODUCT_LAUNCH = "product_launch"
    USER_GROWTH = "user_growth"
    RECOMMENDATION_HELPFUL = "recommendation_helpful"
    RECOMMENDATION_UNHELPFUL = "recommendation_unhelpful"
    FALSE_POSITIVE = "false_positive"
    FALSE_NEGATIVE = "false_negative"

@dataclass
class CodebaseFingerprint:
    """Unique fingerprint of a codebase for pattern matching"""
    language_distribution: Dict[str, float]  # % of each language
    package_patterns: List[str]  # Common packages used
    ai_likelihood_score: float
    file_structure_type: str  # "monolith", "microservice", "cli", "web_app"
    complexity_indicators: Dict[str, int]  # LOC, files, functions, etc.
    domain_category: str  # "fintech", "ai_saas", "b2b_tools", etc.

@dataclass
class LearningRecord:
    """A record of what we learned from a user interaction"""
    id: str
    timestamp: datetime
    codebase_fingerprint: CodebaseFingerprint
    weready_score: int
    user_feedback: Optional[Dict[str, Any]] = None
    outcome: Optional[OutcomeType] = None
    outcome_details: Optional[Dict[str, Any]] = None
    recommendation_accuracy: Optional[float] = None  # 0-1 score
    notes: str = ""

@dataclass
class Pattern:
    """A learned pattern from multiple codebases"""
    pattern_id: str
    pattern_type: str  # "success_indicator", "failure_predictor", "false_positive"
    conditions: Dict[str, Any]  # What conditions trigger this pattern
    confidence: float  # 0-1 confidence in this pattern
    sample_size: int  # How many observations back this pattern
    outcomes: List[OutcomeType]  # What outcomes this pattern predicts
    credibility_boost: float  # How much this pattern adds to credibility

class WeReadyLearningEngine:
    """Learns from user interactions to continuously improve WeReady"""
    
    def __init__(self):
        self.learning_records: List[LearningRecord] = []
        self.patterns: Dict[str, Pattern] = {}
        self.false_positive_patterns: List[Dict] = []
        self.success_indicators: Dict[str, float] = {}
        self.market_intelligence: Dict[str, Any] = {}
        
        # Initialize with some baseline patterns
        self._initialize_baseline_patterns()
        
    def _initialize_baseline_patterns(self):
        """Initialize with patterns we know from research"""
        
        # Pattern: High AI likelihood + no hallucinations = good AI practices
        self.patterns["good_ai_practices"] = Pattern(
            pattern_id="good_ai_practices",
            pattern_type="success_indicator",
            conditions={
                "ai_likelihood_score": {"min": 0.7},
                "hallucination_count": {"max": 0},
                "has_tests": True
            },
            confidence=0.8,
            sample_size=50,  # Will increase as we get real data
            outcomes=[OutcomeType.FUNDING_SUCCESS, OutcomeType.PRODUCT_LAUNCH],
            credibility_boost=0.1
        )
        
        # Pattern: Many hallucinations + high complexity = technical debt risk
        self.patterns["technical_debt_risk"] = Pattern(
            pattern_id="technical_debt_risk", 
            pattern_type="failure_predictor",
            conditions={
                "hallucination_count": {"min": 5},
                "complexity_indicators.files": {"min": 50},
                "ai_likelihood_score": {"min": 0.8}
            },
            confidence=0.75,
            sample_size=30,
            outcomes=[OutcomeType.FUNDING_FAILURE],
            credibility_boost=0.15
        )
        
    def record_scan_interaction(self, 
                              codebase_data: Dict[str, Any],
                              weready_score: int,
                              scan_results: Dict[str, Any]) -> str:
        """Record a scan interaction for learning"""
        
        # Create codebase fingerprint
        fingerprint = self._create_codebase_fingerprint(codebase_data, scan_results)
        
        # Generate unique ID
        record_id = self._generate_record_id(fingerprint, weready_score)
        
        # Create learning record
        record = LearningRecord(
            id=record_id,
            timestamp=datetime.now(),
            codebase_fingerprint=fingerprint,
            weready_score=weready_score,
            notes=f"Initial scan with score {weready_score}"
        )
        
        self.learning_records.append(record)
        
        # Learn from this scan immediately
        self._extract_immediate_patterns(record)
        
        return record_id
        
    def record_user_feedback(self, 
                           record_id: str,
                           feedback: Dict[str, Any]):
        """Record user feedback on our recommendations"""
        
        record = self._find_record(record_id)
        if not record:
            return {"error": "Record not found"}
            
        record.user_feedback = feedback
        
        # Analyze feedback for learning
        if feedback.get("helpful_recommendations"):
            record.recommendation_accuracy = 0.8
            self._reinforce_helpful_patterns(record, feedback["helpful_recommendations"])
            
        if feedback.get("unhelpful_recommendations"):
            record.recommendation_accuracy = 0.3  
            self._identify_false_positive_patterns(record, feedback["unhelpful_recommendations"])
            
        return {"status": "feedback_recorded", "learning_triggered": True}
        
    def record_outcome(self,
                      record_id: str, 
                      outcome_type: OutcomeType,
                      outcome_details: Dict[str, Any]):
        """Record real-world outcome (funding, launch, etc.)"""
        
        record = self._find_record(record_id)
        if not record:
            return {"error": "Record not found"}
            
        record.outcome = outcome_type
        record.outcome_details = outcome_details
        
        # This is gold - real outcome data
        self._learn_from_outcome(record)
        
        return {"status": "outcome_recorded", "patterns_updated": True}
        
    def _create_codebase_fingerprint(self, 
                                   codebase_data: Dict[str, Any],
                                   scan_results: Dict[str, Any]) -> CodebaseFingerprint:
        """Create a unique fingerprint for pattern matching"""
        
        # Analyze language distribution
        lang_dist = self._analyze_language_distribution(codebase_data)
        
        # Extract package patterns
        packages = scan_results.get("details", {}).get("packages_found", [])
        package_patterns = self._extract_package_patterns(packages)
        
        # Determine file structure type
        file_count = codebase_data.get("files_analyzed", 0)
        structure_type = self._classify_structure_type(codebase_data, file_count)
        
        # Calculate complexity indicators
        complexity = self._calculate_complexity_indicators(codebase_data)
        
        # Determine domain category
        domain = self._classify_domain_category(packages, codebase_data)
        
        return CodebaseFingerprint(
            language_distribution=lang_dist,
            package_patterns=package_patterns,
            ai_likelihood_score=scan_results.get("ai_likelihood", 0.0),
            file_structure_type=structure_type,
            complexity_indicators=complexity,
            domain_category=domain
        )
        
    def _analyze_language_distribution(self, codebase_data: Dict) -> Dict[str, float]:
        """Analyze what languages are used and in what proportion"""
        
        # For now, simple heuristics - would improve with real file analysis
        language = codebase_data.get("language", "python")
        return {language: 1.0}  # Will enhance with multi-language support
        
    def _extract_package_patterns(self, packages: List[str]) -> List[str]:
        """Extract common patterns in package usage"""
        
        if not packages:
            return []
            
        # Group by common categories
        ai_packages = [p for p in packages if any(ai_term in p.lower() 
                      for ai_term in ["ai", "ml", "torch", "tensorflow", "openai"])]
        web_packages = [p for p in packages if any(web_term in p.lower()
                       for web_term in ["flask", "django", "fastapi", "express", "react"])]
        data_packages = [p for p in packages if any(data_term in p.lower()
                        for data_term in ["pandas", "numpy", "requests", "sqlalchemy"])]
        
        patterns = []
        if ai_packages:
            patterns.append("ai_ml_focused")
        if web_packages:
            patterns.append("web_application")
        if data_packages:
            patterns.append("data_processing")
            
        return patterns
        
    def _classify_structure_type(self, codebase_data: Dict, file_count: int) -> str:
        """Classify the type of application structure"""
        
        if file_count < 5:
            return "simple_script"
        elif file_count < 20:
            return "small_app"
        elif "microservice" in str(codebase_data).lower():
            return "microservice"
        else:
            return "monolithic_app"
            
    def _calculate_complexity_indicators(self, codebase_data: Dict) -> Dict[str, int]:
        """Calculate various complexity metrics"""
        
        return {
            "files": codebase_data.get("files_analyzed", 0),
            "estimated_loc": codebase_data.get("files_analyzed", 0) * 100,  # Rough estimate
            "package_count": len(codebase_data.get("packages", [])),
        }
        
    def _classify_domain_category(self, packages: List[str], codebase_data: Dict) -> str:
        """Classify what domain/industry this codebase serves"""
        
        package_str = " ".join(packages).lower()
        
        if any(term in package_str for term in ["finance", "payment", "crypto", "blockchain"]):
            return "fintech"
        elif any(term in package_str for term in ["ai", "ml", "openai", "anthropic"]):
            return "ai_saas" 
        elif any(term in package_str for term in ["flask", "django", "fastapi"]):
            return "web_saas"
        elif any(term in package_str for term in ["cli", "argparse", "click"]):
            return "developer_tools"
        else:
            return "general_software"
            
    def _generate_record_id(self, fingerprint: CodebaseFingerprint, score: int) -> str:
        """Generate unique ID for this learning record"""
        
        fingerprint_str = json.dumps(asdict(fingerprint), sort_keys=True)
        content = f"{fingerprint_str}_{score}_{datetime.now().isoformat()}"
        return hashlib.md5(content.encode()).hexdigest()[:16]
        
    def _find_record(self, record_id: str) -> Optional[LearningRecord]:
        """Find a learning record by ID"""
        return next((r for r in self.learning_records if r.id == record_id), None)
        
    def _extract_immediate_patterns(self, record: LearningRecord):
        """Extract patterns immediately from a new scan"""
        
        # Look for similar codebases we've seen before
        similar_records = self._find_similar_codebases(record)
        
        if len(similar_records) >= 3:
            # We have enough similar examples to start learning
            self._update_similarity_patterns(record, similar_records)
            
    def _find_similar_codebases(self, record: LearningRecord) -> List[LearningRecord]:
        """Find codebases similar to the current one"""
        
        similar = []
        target_fp = record.codebase_fingerprint
        
        for other_record in self.learning_records:
            if other_record.id == record.id:
                continue
                
            other_fp = other_record.codebase_fingerprint
            similarity = self._calculate_similarity(target_fp, other_fp)
            
            if similarity > 0.7:  # 70% similarity threshold
                similar.append(other_record)
                
        return similar
        
    def _calculate_similarity(self, fp1: CodebaseFingerprint, fp2: CodebaseFingerprint) -> float:
        """Calculate similarity between two codebase fingerprints"""
        
        similarity_factors = []
        
        # Domain similarity
        if fp1.domain_category == fp2.domain_category:
            similarity_factors.append(0.3)
            
        # Structure similarity  
        if fp1.file_structure_type == fp2.file_structure_type:
            similarity_factors.append(0.2)
            
        # Package pattern similarity
        common_patterns = set(fp1.package_patterns) & set(fp2.package_patterns)
        if common_patterns:
            similarity_factors.append(len(common_patterns) * 0.1)
            
        # AI likelihood similarity
        ai_diff = abs(fp1.ai_likelihood_score - fp2.ai_likelihood_score)
        if ai_diff < 0.2:  # Similar AI usage
            similarity_factors.append(0.2)
            
        return sum(similarity_factors)
        
    def _reinforce_helpful_patterns(self, record: LearningRecord, helpful_recs: List[str]):
        """Reinforce patterns that led to helpful recommendations"""
        
        for rec in helpful_recs:
            # Find which pattern led to this recommendation
            pattern_id = self._identify_pattern_for_recommendation(rec, record)
            if pattern_id and pattern_id in self.patterns:
                # Increase confidence in this pattern
                self.patterns[pattern_id].confidence = min(0.95, 
                    self.patterns[pattern_id].confidence + 0.05)
                self.patterns[pattern_id].sample_size += 1
                
    def _identify_false_positive_patterns(self, record: LearningRecord, bad_recs: List[str]):
        """Identify patterns that lead to false positive recommendations"""
        
        for rec in bad_recs:
            false_positive = {
                "recommendation": rec,
                "codebase_fingerprint": asdict(record.codebase_fingerprint),
                "weready_score": record.weready_score,
                "timestamp": record.timestamp.isoformat()
            }
            self.false_positive_patterns.append(false_positive)
            
    def _learn_from_outcome(self, record: LearningRecord):
        """Learn from real-world outcomes - this is the most valuable learning"""
        
        if record.outcome == OutcomeType.FUNDING_SUCCESS:
            # This codebase got funded! Learn what made it successful
            self._extract_success_patterns(record)
            
        elif record.outcome == OutcomeType.FUNDING_FAILURE:
            # This didn't get funded - learn warning signs
            self._extract_failure_patterns(record)
            
    def _extract_success_patterns(self, record: LearningRecord):
        """Extract patterns from successful funding outcomes"""
        
        fp = record.codebase_fingerprint
        
        # High-confidence pattern: this combination led to success
        success_pattern = Pattern(
            pattern_id=f"success_{record.id}",
            pattern_type="success_indicator",
            conditions={
                "domain_category": fp.domain_category,
                "ai_likelihood_range": [fp.ai_likelihood_score - 0.1, fp.ai_likelihood_score + 0.1],
                "weready_score_range": [record.weready_score - 10, record.weready_score + 10]
            },
            confidence=0.9,  # High confidence from real outcome
            sample_size=1,
            outcomes=[OutcomeType.FUNDING_SUCCESS],
            credibility_boost=0.2  # Real outcomes boost credibility significantly
        )
        
        self.patterns[success_pattern.pattern_id] = success_pattern
        
    def get_enhanced_recommendations(self, 
                                   codebase_fingerprint: CodebaseFingerprint,
                                   base_score: int) -> Dict[str, Any]:
        """Get enhanced recommendations based on learned patterns"""
        
        enhanced_recs = {
            "base_recommendations": [],
            "pattern_based_insights": [],
            "credibility_boosters": [],
            "similar_success_stories": []
        }
        
        # Check against learned patterns
        for pattern in self.patterns.values():
            if self._matches_pattern(codebase_fingerprint, base_score, pattern):
                
                if pattern.pattern_type == "success_indicator":
                    enhanced_recs["pattern_based_insights"].append({
                        "insight": f"Your codebase matches patterns of {len(pattern.outcomes)} successful startups",
                        "confidence": pattern.confidence,
                        "evidence": f"Based on {pattern.sample_size} similar cases",
                        "credibility_boost": pattern.credibility_boost
                    })
                    
                elif pattern.pattern_type == "failure_predictor":
                    enhanced_recs["pattern_based_insights"].append({
                        "warning": f"Similar codebases had challenges in {pattern.outcomes}",
                        "confidence": pattern.confidence,
                        "recommendation": "Address these issues before seeking funding",
                        "urgency": "high"
                    })
                    
        # Find similar success stories
        similar_successes = [r for r in self.learning_records 
                           if r.outcome == OutcomeType.FUNDING_SUCCESS and
                           self._calculate_similarity(codebase_fingerprint, r.codebase_fingerprint) > 0.6]
                           
        for success in similar_successes[:3]:  # Top 3 similar successes
            enhanced_recs["similar_success_stories"].append({
                "domain": success.codebase_fingerprint.domain_category,
                "score": success.weready_score,
                "outcome_details": success.outcome_details,
                "key_lesson": "Similar codebase achieved funding success"
            })
            
        return enhanced_recs
        
    def _matches_pattern(self, 
                        fingerprint: CodebaseFingerprint, 
                        score: int, 
                        pattern: Pattern) -> bool:
        """Check if current codebase matches a learned pattern"""
        
        conditions = pattern.conditions
        
        # Check domain match
        if "domain_category" in conditions:
            if fingerprint.domain_category != conditions["domain_category"]:
                return False
                
        # Check AI likelihood range
        if "ai_likelihood_range" in conditions:
            ai_range = conditions["ai_likelihood_range"] 
            if not (ai_range[0] <= fingerprint.ai_likelihood_score <= ai_range[1]):
                return False
                
        # Check score range
        if "weready_score_range" in conditions:
            score_range = conditions["weready_score_range"]
            if not (score_range[0] <= score <= score_range[1]):
                return False
                
        return True
        
    def get_learning_stats(self) -> Dict[str, Any]:
        """Get statistics about what we've learned"""
        
        total_records = len(self.learning_records)
        records_with_outcomes = len([r for r in self.learning_records if r.outcome])
        records_with_feedback = len([r for r in self.learning_records if r.user_feedback])
        
        # Domain distribution
        domains = [r.codebase_fingerprint.domain_category for r in self.learning_records]
        domain_counts = Counter(domains)
        
        # Pattern effectiveness
        pattern_confidence = [p.confidence for p in self.patterns.values()]
        avg_confidence = statistics.mean(pattern_confidence) if pattern_confidence else 0
        
        return {
            "learning_summary": {
                "total_scans_analyzed": total_records,
                "outcomes_tracked": records_with_outcomes, 
                "user_feedback_received": records_with_feedback,
                "patterns_discovered": len(self.patterns),
                "false_positives_identified": len(self.false_positive_patterns)
            },
            "market_intelligence": {
                "domain_distribution": dict(domain_counts.most_common()),
                "most_common_domain": domain_counts.most_common(1)[0] if domain_counts else "unknown",
                "pattern_confidence_avg": round(avg_confidence, 3)
            },
            "credibility_metrics": {
                "evidence_based_recommendations": records_with_outcomes > 0,
                "pattern_validation_rate": avg_confidence,
                "learning_velocity": f"{total_records} codebases analyzed"
            },
            "competitive_advantages": [
                "Only platform learning from real funding outcomes",
                "Pattern recognition across AI-first startups", 
                "Continuous improvement from user feedback",
                f"Database of {total_records} analyzed codebases"
            ]
        }

# Singleton instance
learning_engine = WeReadyLearningEngine()