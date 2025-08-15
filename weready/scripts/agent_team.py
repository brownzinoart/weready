"""
NO-BS AGENT TEAM FOR WEREADY MVP DEVELOPMENT
=============================================
A ruthlessly efficient team of specialized agents focused on shipping
WeReady - the AI-first founder readiness platform that addresses the 
$10B+ market opportunity in AI code quality validation.

Market Context:
- 76% of devs use AI tools, only 33% trust them
- 20% of AI code contains hallucinated packages
- 45% of AI code has security vulnerabilities
- No platform combines code + business + investment readiness
"""

import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum
from datetime import datetime
import random


class Priority(Enum):
    """What actually matters"""
    CRITICAL = "Ship-blocker"
    HIGH = "Users will notice"
    MEDIUM = "Nice to have"
    LOW = "Procrastination task"


class TaskStatus(Enum):
    """Reality check on progress"""
    NOT_STARTED = "Haven't touched it"
    IN_PROGRESS = "Actually working"
    BLOCKED = "Stuck (be honest why)"
    COMPLETED = "Done and tested"
    ABANDONED = "Admitted failure"


@dataclass
class Task:
    """A real unit of work, not busy work"""
    id: str
    title: str
    description: str
    assigned_to: str
    priority: Priority
    status: TaskStatus
    reality_check: str  # Why this actually matters
    time_estimate: int  # Hours, be realistic
    actual_time: Optional[int] = None
    blockers: List[str] = None


class BaseAgent:
    """Base class for all agents - no fluff, just work"""
    
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.tasks: List[Task] = []
        
    def receive_task(self, task: Task) -> str:
        """Accept a task and give honest assessment"""
        self.tasks.append(task)
        return self.evaluate_task(task)
    
    def evaluate_task(self, task: Task) -> str:
        """Override this with agent-specific evaluation"""
        raise NotImplementedError
        
    def complete_task(self, task_id: str, result: Dict) -> Dict:
        """Mark task complete with lessons learned"""
        task = next((t for t in self.tasks if t.id == task_id), None)
        if not task:
            return {"error": "Stop making up tasks that don't exist"}
        
        task.status = TaskStatus.COMPLETED
        return {
            "task": task.title,
            "result": result,
            "reality_check": f"Took {task.actual_time}h vs {task.time_estimate}h estimated"
        }


class ProductStrategist(BaseAgent):
    """Cuts through BS to find what users actually want"""
    
    def __init__(self):
        super().__init__("Alex", "Product Strategist")
        self.market_data = {
            "ai_tool_adoption": 0.76,
            "ai_trust_rate": 0.33,
            "hallucination_rate": 0.20,
            "vulnerability_rate": 0.45,
            "competitor_pricing": {"sonarqube": 720, "deepsource": 120, "codacy": 216}
        }
        
    def evaluate_task(self, task: Task) -> str:
        responses = {
            Priority.CRITICAL: "This better solve a real pain point or we're wasting time.",
            Priority.HIGH: "Users might actually care about this. Proceed.",
            Priority.MEDIUM: "Classic nice-to-have. Ship without it first.",
            Priority.LOW: "You're procrastinating. Focus on what matters."
        }
        return responses.get(task.priority, "Is this even a real task?")
    
    def validate_feature(self, feature: str, user_evidence: str) -> Dict:
        """Reality check on feature ideas with market context"""
        
        # Check if feature addresses known market gaps
        high_value_features = [
            "hallucination", "ai vulnerability", "ai-specific", "trust",
            "sox", "soc", "compliance", "investment ready", "pitch"
        ]
        
        feature_lower = feature.lower()
        addresses_gap = any(term in feature_lower for term in high_value_features)
        
        if not user_evidence:
            return {
                "verdict": "REJECT",
                "reason": "No user asked for this. You're building in a vacuum.",
                "action": "Talk to 5 users first. Real conversations, not surveys.",
                "market_context": "76% of devs need AI validation tools - ask them what they want."
            }
        
        if addresses_gap:
            return {
                "verdict": "BUILD",
                "reason": f"Addresses critical market gap. {self.market_data['ai_tool_adoption']*100:.0f}% adoption but only {self.market_data['ai_trust_rate']*100:.0f}% trust.",
                "action": "Build MVP version fast. This could be our differentiator.",
                "market_context": f"Competitors miss this. SonarQube charges ${self.market_data['competitor_pricing']['sonarqube']}/year without it."
            }
        
        if "might be nice" in user_evidence.lower() or "could be cool" in user_evidence.lower():
            return {
                "verdict": "DEFER",
                "reason": "Weak signal. 'Nice to have' kills MVPs.",
                "action": "Find users experiencing real pain without this.",
                "market_context": "Focus on the 20% hallucination problem first."
            }
            
        return {
            "verdict": "BUILD",
            "reason": "Actual user pain identified.",
            "action": "Build the simplest version that solves the problem."
        }


class TechnicalArchitect(BaseAgent):
    """Builds things that actually work in production"""
    
    def __init__(self):
        super().__init__("Jordan", "Technical Architect")
        
    def evaluate_task(self, task: Task) -> str:
        if "optimize" in task.title.lower() and "users" not in task.description.lower():
            return "Premature optimization. You have 0 users. Ship first, optimize later."
        
        if "refactor" in task.title.lower():
            return "Is it broken? No? Then why are you refactoring? Ship features."
            
        return "Fine. But use boring technology. Your clever architecture won't impress investors."
    
    def review_architecture(self, stack: Dict) -> Dict:
        """Brutally honest architecture review"""
        warnings = []
        
        if len(stack.get("languages", [])) > 3:
            warnings.append("Too many languages. You're not Google. Pick one and master it.")
            
        if "microservices" in str(stack).lower() and "users < 1000" in str(stack).lower():
            warnings.append("Microservices for <1000 users? Stop playing architect and ship a monolith.")
            
        if "kubernetes" in str(stack).lower():
            warnings.append("K8s for an MVP? Use Railway/Render and focus on the product.")
            
        if not stack.get("error_tracking"):
            warnings.append("No error tracking? You'll be debugging blind in production.")
            
        return {
            "viable": len(warnings) < 3,
            "warnings": warnings,
            "recommendation": "Simplify. Every clever choice is a future headache."
        }


class GrowthHacker(BaseAgent):
    """Gets users without burning cash on ads"""
    
    def __init__(self):
        super().__init__("Sam", "Growth Hacker")
        self.benchmarks = {
            "freemium_conversion": 0.035,  # 3.5% target
            "trial_conversion": 0.15,  # 15% with sales assist
            "vs_code_users": 14000000,  # 14M potential users
            "github_copilot_users": 15000000,  # 15M users
            "yc_batch_size": 250  # avg startups per batch
        }
        
    def evaluate_task(self, task: Task) -> str:
        if "viral" in task.title.lower():
            return "Nothing goes viral on purpose. Focus on solving real problems first."
            
        if "social media" in task.title.lower() and "customers" not in task.description:
            return "Social media without knowing your customer? You're shouting into the void."
            
        return "Will this directly lead to users? If not, skip it."
    
    def growth_strategy_for_weready(self) -> Dict:
        """WeReady-specific growth strategy based on market research"""
        return {
            "phase_1_channels": {
                "YC_network": {
                    "potential": f"{self.benchmarks['yc_batch_size']} startups/batch, 25% are AI-first",
                    "approach": "Direct outreach to current batch, free tier for all",
                    "expected_conversion": "10-15% (higher due to acute pain)"
                },
                "VS_Code_extension": {
                    "potential": f"{self.benchmarks['vs_code_users']:,} developers",
                    "approach": "Free hallucination detector as trojan horse",
                    "expected_installs": "1,000 in first month if we nail the messaging"
                },
                "GitHub_Copilot_plugin": {
                    "potential": f"{self.benchmarks['github_copilot_users']:,} users",
                    "approach": "Real-time validation while coding",
                    "expected_growth": "4x YoY based on Copilot's trajectory"
                }
            },
            "content_strategy": {
                "hook": "We analyzed 1000 AI codebases - 45% won't survive production",
                "series": "Weekly AI code horror stories with fixes",
                "goal": "Position as THE expert on AI code quality"
            },
            "pricing_psychology": {
                "anchor": f"SonarQube costs $720/year with worse AI support",
                "sweet_spot": "$19/month feels like stealing",
                "urgency": "Your competitor just shipped with 20% hallucinated dependencies"
            },
            "metrics_to_track": {
                "north_star": "Weekly active scans (engagement > signups)",
                "conversion": f"Target {self.benchmarks['freemium_conversion']*100}% free to paid",
                "virality": "Scans shared / total scans (aim for >0.2)"
            }
        }
    
    def validate_channel(self, channel: str, budget: float, target_users: int) -> Dict:
        """Reality check on growth channels"""
        channels_reality = {
            "paid_ads": {
                "min_budget": 5000,
                "warning": "You'll burn cash learning. Start with organic.",
                "cac_estimate": 50
            },
            "content": {
                "min_budget": 0,
                "warning": "Takes 6 months to see results. You have that runway?",
                "cac_estimate": 5
            },
            "cold_outreach": {
                "min_budget": 0,
                "warning": "Soul-crushing but works. Can you handle 95% rejection?",
                "cac_estimate": 10
            },
            "product_hunt": {
                "min_budget": 0,
                "warning": "One spike, then crickets. Have a plan for day 2.",
                "cac_estimate": 0
            }
        }
        
        ch = channels_reality.get(channel, {})
        if not ch:
            return {"verdict": "Unknown channel. Stick to proven paths for MVP."}
            
        if budget < ch["min_budget"]:
            return {
                "verdict": "UNREALISTIC",
                "reason": f"Need ${ch['min_budget']} minimum. You have ${budget}.",
                "alternative": "Start with cold outreach. It's free and you'll learn."
            }
            
        return {
            "verdict": "POSSIBLE",
            "warning": ch["warning"],
            "projected_users": int(budget / ch["cac_estimate"]) if ch["cac_estimate"] > 0 else "Variable",
            "reality": "Most channels fail. Test small, fail fast."
        }


class InvestmentAnalyst(BaseAgent):
    """Tells you if VCs will laugh or write checks"""
    
    def __init__(self):
        super().__init__("Morgan", "Investment Analyst")
        self.vc_benchmarks = {
            "seed_arr": 100000,  # $100K ARR for seed interest
            "series_a_arr": 1000000,  # $1M ARR for Series A
            "growth_rate": 0.15,  # 15% MoM minimum
            "burn_multiple": 1.5,  # Bessemer score
            "arr_per_fte": 100000,  # efficiency metric
            "cac_payback_months": 12,
            "ltv_cac_ratio": 3.0,
            "gross_margin": 0.70
        }
        
    def evaluate_task(self, task: Task) -> str:
        if "pitch deck" in task.title.lower():
            return "Deck without traction is worthless. Get 10 paying users first."
            
        return "Focus on metrics investors actually care about: revenue, users, growth rate."
    
    def weready_investment_thesis(self) -> Dict:
        """Why VCs should care about WeReady"""
        return {
            "market_size": {
                "TAM": "$10B+ AI code quality market",
                "growth": "27% CAGR through 2030",
                "urgency": "76% adoption but 33% trust = massive gap"
            },
            "timing": {
                "why_now": [
                    "AI code adoption hit critical mass (76% of devs)",
                    "Trust crisis creates urgent need (43% → 33% YoY)",
                    "No comprehensive solution exists (blue ocean)",
                    "YC founders are 25% AI-generated code (perfect ICP)"
                ]
            },
            "differentiation": {
                "unique": "First to detect hallucinations (20% of AI code!)",
                "moat": "Triple assessment no one else does",
                "network_effect": "More scans = better detection models"
            },
            "unit_economics": {
                "price_point": "$19/user/month (validated sweet spot)",
                "CAC": "$50-100 through developer channels",
                "LTV": "$570+ (30 month average retention)",
                "margin": "70%+ (SaaS standard)"
            },
            "traction_milestones": {
                "month_1": "100 beta users from YC network",
                "month_3": "$10K MRR (seed threshold)",
                "month_6": "$50K MRR with 15% MoM growth",
                "month_12": "$200K ARR (Series A conversations)"
            },
            "investor_hooks": [
                "Supabase for AI code quality",
                "Riding the AI wave but selling shovels",
                "B2B SaaS with viral B2C distribution"
            ]
        }
    
    def investment_readiness(self, metrics: Dict) -> Dict:
        """Brutal truth about investment readiness"""
        score = 0
        feedback = []
        
        # Revenue check
        mrr = metrics.get("mrr", 0)
        if mrr < 1000:
            feedback.append(f"${mrr} MRR? That's a hobby, not a business. Get to $5K minimum.")
        elif mrr < 10000:
            feedback.append(f"${mrr} MRR is barely interesting. Push for $10K+ to get meetings.")
            score += 1
        else:
            score += 3
            
        # User check
        users = metrics.get("active_users", 0)
        if users < 100:
            feedback.append(f"{users} users? Your mom doesn't count. Get to 100 real users.")
        elif users < 1000:
            feedback.append(f"{users} users shows promise. 1000+ opens doors.")
            score += 1
        else:
            score += 3
            
        # Growth check
        growth = metrics.get("mom_growth", 0)
        if growth < 10:
            feedback.append(f"{growth}% monthly growth? That's linear. VCs want exponential.")
        elif growth < 20:
            feedback.append(f"{growth}% growth is decent. Push for 20%+ to excite investors.")
            score += 1
        else:
            score += 3
            
        # Churn check
        churn = metrics.get("monthly_churn", 100)
        if churn > 10:
            feedback.append(f"{churn}% churn? Your product doesn't stick. Fix retention first.")
        elif churn > 5:
            feedback.append(f"{churn}% churn needs work. Aim for <5% for SaaS.")
            score += 1
        else:
            score += 3
            
        verdict = "NOT READY"
        if score >= 9:
            verdict = "READY"
        elif score >= 6:
            verdict = "ALMOST"
        elif score >= 3:
            verdict = "TOO EARLY"
            
        return {
            "verdict": verdict,
            "score": f"{score}/12",
            "feedback": feedback,
            "harsh_truth": "Most founders approach VCs 6 months too early. Build more, pitch less.",
            "next_step": feedback[0] if feedback else "You're ready. Stop overthinking and send the emails."
        }


class QualityAssurance(BaseAgent):
    """Breaks things before users do"""
    
    def __init__(self):
        super().__init__("Riley", "QA Engineer")
        
    def evaluate_task(self, task: Task) -> str:
        if "unit test" in task.title.lower() and "coverage" in task.title.lower():
            return "100% coverage is vanity. Test the critical paths that lose you money when broken."
            
        return "Test like a user who's having a bad day. They won't be gentle."
    
    def testing_reality_check(self, test_plan: Dict) -> Dict:
        """Reality check on testing strategy"""
        critical_missing = []
        
        if not test_plan.get("payment_flow_tests"):
            critical_missing.append("No payment tests? You'll lose money on day 1.")
            
        if not test_plan.get("mobile_tests"):
            critical_missing.append("No mobile tests? 60% of your traffic is phone-based.")
            
        if not test_plan.get("error_recovery"):
            critical_missing.append("No error recovery tests? Users will rage quit.")
            
        if test_plan.get("coverage_target", 0) > 80:
            critical_missing.append("Targeting >80% coverage? You're procrastinating. Ship at 60%.")
            
        return {
            "ready_to_ship": len(critical_missing) == 0,
            "critical_gaps": critical_missing,
            "advice": "Test the money path, login, and core feature. Everything else can wait.",
            "time_to_spend": "2 days max. Then ship and fix in production."
        }


class Orchestrator:
    """The brutal truth-teller who runs the show"""
    
    def __init__(self):
        self.name = "Marcus"
        self.role = "Orchestrator / Chief Reality Officer"
        self.team = {
            "product": ProductStrategist(),
            "tech": TechnicalArchitect(),
            "growth": GrowthHacker(),
            "investment": InvestmentAnalyst(),
            "qa": QualityAssurance()
        }
        self.tasks_queue: List[Task] = []
        self.completed_tasks: List[Task] = []
        self.startup_age_days = 0
        
    def wake_up_call(self) -> str:
        """Daily reality check"""
        wake_ups = [
            "Another day without revenue. How long can you keep this up?",
            "Your competitor just raised $2M. You still debugging that form?",
            "Week 3 of 'almost ready to launch'. Ship or admit you're scared.",
            "You've talked to exactly 0 users today. Building in a vacuum again?",
            "That feature you spent 3 days on? No one will use it. I guarantee it.",
            "Your burn rate says you have 2 months left. Still perfecting the colors?",
        ]
        return random.choice(wake_ups)
    
    def assign_task(self, task_description: str, priority: str = "HIGH") -> Dict:
        """Assign task to the right agent with brutal honesty"""
        
        # Determine who should handle this
        task_lower = task_description.lower()
        
        if any(word in task_lower for word in ["feature", "user", "need", "want", "should"]):
            agent_key = "product"
        elif any(word in task_lower for word in ["code", "api", "database", "deploy", "stack"]):
            agent_key = "tech"
        elif any(word in task_lower for word in ["users", "growth", "marketing", "launch"]):
            agent_key = "growth"
        elif any(word in task_lower for word in ["investor", "pitch", "fund", "raise"]):
            agent_key = "investment"
        elif any(word in task_lower for word in ["test", "bug", "break", "qa"]):
            agent_key = "qa"
        else:
            return {
                "error": "Vague task. Be specific or stop wasting time.",
                "advice": "What's the actual deliverable? Who benefits? By when?"
            }
        
        task = Task(
            id=f"task_{len(self.tasks_queue) + 1}",
            title=task_description[:50],
            description=task_description,
            assigned_to=self.team[agent_key].name,
            priority=Priority[priority],
            status=TaskStatus.NOT_STARTED,
            reality_check="Why does this matter for launch?",
            time_estimate=8  # Default, adjust based on complexity
        )
        
        self.tasks_queue.append(task)
        agent_response = self.team[agent_key].receive_task(task)
        
        return {
            "task_id": task.id,
            "assigned_to": self.team[agent_key].name,
            "agent_says": agent_response,
            "orchestrator_says": self._evaluate_priority(task),
            "deadline": "Today. Everything is urgent in a startup."
        }
    
    def _evaluate_priority(self, task: Task) -> str:
        """My take on whether this task matters"""
        
        if task.priority == Priority.LOW:
            return "Why are you even thinking about this? Focus on what ships the product."
        elif task.priority == Priority.MEDIUM:
            return "Fine, but if this delays launch by even a day, cut it."
        elif task.priority == Priority.HIGH:
            return "This better directly impact users or revenue."
        else:  # CRITICAL
            return "Drop everything else. This is what matters."
    
    def status_report(self) -> Dict:
        """Brutal honest status of the project"""
        
        total_tasks = len(self.tasks_queue)
        completed = len([t for t in self.tasks_queue if t.status == TaskStatus.COMPLETED])
        blocked = len([t for t in self.tasks_queue if t.status == TaskStatus.BLOCKED])
        
        velocity = completed / max(total_tasks, 1)
        
        if velocity < 0.2:
            verdict = "You're not moving. Stop planning, start shipping."
        elif velocity < 0.5:
            verdict = "Slow progress. What's the real blocker? Fear?"
        elif velocity < 0.8:
            verdict = "Decent pace, but launch is still a dream at this rate."
        else:
            verdict = "Good velocity. Keep pushing, don't get comfortable."
        
        return {
            "wake_up_call": self.wake_up_call(),
            "stats": {
                "total_tasks": total_tasks,
                "completed": completed,
                "blocked": blocked,
                "velocity": f"{velocity*100:.0f}%"
            },
            "verdict": verdict,
            "blocked_analysis": self._analyze_blockers(),
            "team_performance": self._evaluate_team(),
            "harsh_truth": self._get_harsh_truth(),
            "action_required": self._next_critical_action()
        }
    
    def _analyze_blockers(self) -> str:
        blocked_tasks = [t for t in self.tasks_queue if t.status == TaskStatus.BLOCKED]
        if not blocked_tasks:
            return "No blockers. So why aren't you shipping?"
            
        if len(blocked_tasks) > 3:
            return f"{len(blocked_tasks)} blockers? You're making excuses. Pick one and solve it."
            
        return f"Blocked on {blocked_tasks[0].title}. Fix it or cut the feature."
    
    def _evaluate_team(self) -> Dict:
        """How each agent is performing"""
        performance = {}
        for key, agent in self.team.items():
            completed = len([t for t in agent.tasks if t.status == TaskStatus.COMPLETED])
            total = len(agent.tasks)
            
            if total == 0:
                performance[agent.name] = "Hasn't done anything yet."
            elif completed / max(total, 1) < 0.5:
                performance[agent.name] = f"Struggling. {completed}/{total} done."
            else:
                performance[agent.name] = f"Delivering. {completed}/{total} done."
                
        return performance
    
    def _get_harsh_truth(self) -> str:
        """The thing you don't want to hear but need to"""
        
        truths = [
            "Your idea isn't special. Your execution might be. Show me.",
            "You're optimizing the wrong things. Users don't care about your clean code.",
            "You've been 'preparing to launch' for too long. You're scared. Admit it.",
            "Your competitor isn't sleeping. You shouldn't be either.",
            "That feature you love? Users won't even notice it.",
            "Stop asking for permission. Ship it and apologize later.",
            "Your perfect MVP is someone else's prototype from 6 months ago.",
            "Investors don't care about your vision. They care about traction.",
            "You're building a product, not a masterpiece. Ship the ugly version.",
            "Every day without users is a day closer to death."
        ]
        
        return random.choice(truths)
    
    def _next_critical_action(self) -> str:
        """What you should do RIGHT NOW"""
        
        incomplete_critical = [
            t for t in self.tasks_queue 
            if t.priority == Priority.CRITICAL and t.status != TaskStatus.COMPLETED
        ]
        
        if incomplete_critical:
            return f"Finish '{incomplete_critical[0].title}' or explain why it's not critical."
            
        if self.startup_age_days > 30 and not any("user" in t.title.lower() for t in self.completed_tasks):
            return "30 days and no user feedback? Stop building and start talking to humans."
            
        if not any("deploy" in t.title.lower() for t in self.tasks_queue):
            return "Nothing about deployment in your tasks. Planning to launch from localhost?"
            
        return "Ship something today. Anything. Movement beats meditation."
    
    def final_verdict(self, metrics: Dict) -> Dict:
        """Will you make it or are you wasting time?"""
        
        # Get investment readiness
        investment_ready = self.team["investment"].investment_readiness(metrics)
        
        # WeReady-specific success factors
        weready_factors = {
            "hallucination_detection_live": metrics.get("hallucination_detection", False),
            "vs_code_extension_installs": metrics.get("vs_code_installs", 0),
            "yc_founders_using": metrics.get("yc_users", 0),
            "scan_accuracy": metrics.get("detection_accuracy", 0),
            "integrations_built": metrics.get("integrations", 0)
        }
        
        # Calculate burn vs growth
        burn_rate = metrics.get("monthly_burn", 10000)
        revenue = metrics.get("mrr", 0)
        runway_months = metrics.get("cash", 0) / max(burn_rate - revenue, 1)
        
        success_probability = 0
        
        # Factors that matter for WeReady
        if revenue > 0:
            success_probability += 30
        if metrics.get("active_users", 0) > 100:
            success_probability += 20
        if metrics.get("mom_growth", 0) > 15:
            success_probability += 20
        if runway_months > 6:
            success_probability += 15
        if investment_ready["verdict"] in ["READY", "ALMOST"]:
            success_probability += 15
            
        # WeReady-specific bonuses
        if weready_factors["hallucination_detection_live"]:
            success_probability += 10  # First mover advantage
        if weready_factors["vs_code_extension_installs"] > 1000:
            success_probability += 10  # Distribution working
        if weready_factors["yc_founders_using"] > 10:
            success_probability += 10  # Product-market fit signal
            
        if success_probability < 30:
            final_verdict = "FAILING: You're building a zombie startup. Kill it or fix it."
        elif success_probability < 50:
            final_verdict = "STRUGGLING: Signs of life but not enough. Ship hallucination detection NOW."
        elif success_probability < 70:
            final_verdict = "SURVIVING: You might make it. Focus on YC distribution and VS Code."
        else:
            final_verdict = "THRIVING: You're onto something. Don't get cocky, scale smart."
            
        return {
            "verdict": final_verdict,
            "success_probability": f"{success_probability}%",
            "runway_remaining": f"{runway_months:.1f} months",
            "investment_readiness": investment_ready["verdict"],
            "biggest_risk": self._identify_biggest_risk(metrics),
            "30_day_focus": self._get_30_day_focus(metrics),
            "founder_reality_check": self._founder_assessment(metrics),
            "market_position": self._market_position_check(weready_factors),
            "final_advice": "Stop reading this and go ship the hallucination detector. That's your wedge."
        }
    
    def _market_position_check(self, factors: Dict) -> str:
        """Where WeReady stands in the market"""
        
        if not factors["hallucination_detection_live"]:
            return "You haven't even built your differentiator. What are you doing?"
        
        if factors["vs_code_extension_installs"] < 100:
            return "No distribution = no business. Ship that VS Code extension yesterday."
        
        if factors["yc_founders_using"] < 5:
            return "YC network is your ICP. If they don't use it, nobody will."
        
        if factors["scan_accuracy"] < 0.80:
            return "80% accuracy minimum or you're just noise. Fix the models."
        
        if factors["integrations_built"] < 2:
            return "Need GitHub + VS Code minimum. Cursor and Copilot are bonuses."
        
        return "Decent position. Now execute faster than the incumbents can copy."
    
    def _identify_biggest_risk(self, metrics: Dict) -> str:
        """The thing most likely to kill your startup"""
        
        if metrics.get("mrr", 0) == 0:
            return "Zero revenue. You have a project, not a business."
        elif metrics.get("monthly_churn", 0) > 15:
            return "Brutal churn rate. Your product doesn't solve a real problem."
        elif metrics.get("mom_growth", 0) < 5:
            return "Flat growth. You're not building something people want."
        elif metrics.get("cash", 0) / metrics.get("monthly_burn", 1) < 3:
            return "Less than 3 months runway. Fundraise or find revenue NOW."
        else:
            return "Complacency. The moment you think you've made it, you're dead."
    
    def _get_30_day_focus(self, metrics: Dict) -> List[str]:
        """What to obsess over for the next 30 days"""
        
        focus = []
        
        if metrics.get("active_users", 0) < 100:
            focus.append("Get to 100 active users by any means necessary")
            
        if metrics.get("mrr", 0) < 1000:
            focus.append("First $1K MRR - charge something, anything")
            
        if metrics.get("mom_growth", 0) < 20:
            focus.append("Find one growth channel that works and abuse it")
            
        if not focus:
            focus = ["Double revenue", "Halve churn", "Ship one killer feature"]
            
        return focus[:3]  # Max 3 priorities
    
    def _founder_assessment(self, metrics: Dict) -> str:
        """Honest assessment of founder performance"""
        
        if metrics.get("weeks_since_start", 0) > 12 and metrics.get("mrr", 0) == 0:
            return "3 months, no revenue. You're playing startup, not building one."
            
        if metrics.get("features_shipped", 0) > 20 and metrics.get("active_users", 0) < 10:
            return "20+ features for <10 users? You're building for yourself, not the market."
            
        if metrics.get("investor_meetings", 0) > 10 and metrics.get("mrr", 0) < 5000:
            return "Stop pitching, start selling. Investors follow customers, not vice versa."
            
        return "You're doing okay, but okay doesn't build unicorns. Push harder."


# Example usage
if __name__ == "__main__":
    # Initialize the orchestrator
    orchestrator = Orchestrator()
    
    print("=" * 50)
    print("WEREADY STARTUP ORCHESTRATOR INITIALIZED")
    print("=" * 50)
    print(f"\n{orchestrator.wake_up_call()}\n")
    
    # Example: Assign WeReady-specific tasks
    print("\n### ASSIGNING WEREADY TASKS ###\n")
    
    task1 = orchestrator.assign_task(
        "Build hallucination detection for AI-generated package imports",
        priority="CRITICAL"
    )
    print(f"Task 1 Response: {json.dumps(task1, indent=2)}\n")
    
    task2 = orchestrator.assign_task(
        "Create VS Code extension for real-time AI code validation",
        priority="HIGH"
    )
    print(f"Task 2 Response: {json.dumps(task2, indent=2)}\n")
    
    task3 = orchestrator.assign_task(
        "Add fancy animations to the landing page",
        priority="LOW"
    )
    print(f"Task 3 Response: {json.dumps(task3, indent=2)}\n")
    
    # Get status report
    print("\n### STATUS REPORT ###\n")
    report = orchestrator.status_report()
    print(json.dumps(report, indent=2))
    
    # WeReady growth strategy
    print("\n### WEREADY GROWTH STRATEGY ###\n")
    growth_strategy = orchestrator.team["growth"].growth_strategy_for_weready()
    print(json.dumps(growth_strategy, indent=2))
    
    # Investment thesis
    print("\n### WEREADY INVESTMENT THESIS ###\n")
    thesis = orchestrator.team["investment"].weready_investment_thesis()
    print(json.dumps(thesis, indent=2))
    
    # Check investment readiness with WeReady metrics
    print("\n### WEREADY READINESS CHECK ###\n")
    weready_metrics = {
        "mrr": 8500,  # $8.5K MRR
        "active_users": 450,  # 450 users
        "mom_growth": 22,  # 22% growth
        "monthly_churn": 5,  # 5% churn
        "monthly_burn": 8000,
        "cash": 50000,
        "weeks_since_start": 12,
        "features_shipped": 5,
        "investor_meetings": 0,  # Focus on product first
        "hallucination_detection": True,  # Core feature live
        "vs_code_installs": 1200,
        "yc_users": 15,
        "detection_accuracy": 0.82,
        "integrations": 3  # GitHub, VS Code, Cursor
    }
    
    investment_check = orchestrator.team["investment"].investment_readiness(weready_metrics)
    print(json.dumps(investment_check, indent=2))
    
    # Final verdict
    print("\n### FINAL VERDICT FOR WEREADY ###\n")
    verdict = orchestrator.final_verdict(weready_metrics)
    print(json.dumps(verdict, indent=2))
