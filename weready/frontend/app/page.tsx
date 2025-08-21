"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, XCircle, Github, Award, TrendingUp, Users, Star, ArrowRight, Building, GraduationCap, Briefcase, ShieldCheck, Database, BarChart3, Brain, Globe, Zap, Shield, Save, Clock } from "lucide-react";
import Navigation from "./components/Navigation";
import HowItWorks from "./components/HowItWorks";
import Footer from "./components/Footer";
import LoginModal from "./components/LoginModal";
import { useAuth } from './contexts/AuthContext';
import UsageTracker from './utils/usageTracking';

// Authoritative Sources Component
const AuthoritativeSourcesSection = ({ sourceStats, setSourceStats }: {
  sourceStats: { government: number; academic: number; vcFirms: number; total: number };
  setSourceStats: React.Dispatch<React.SetStateAction<{ government: number; academic: number; vcFirms: number; total: number }>>;
}) => {
  React.useEffect(() => {
    const animateCounter = (target: number, key: keyof typeof sourceStats, duration: number = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setSourceStats(prev => ({ ...prev, [key]: target }));
          clearInterval(timer);
        } else {
          setSourceStats(prev => ({ ...prev, [key]: Math.floor(start) }));
        }
      }, 16);
    };

    // Animate the counters with staggered timing
    setTimeout(() => animateCounter(47, 'government'), 0);
    setTimeout(() => animateCounter(23, 'academic'), 300);
    setTimeout(() => animateCounter(15, 'vcFirms'), 600);
    setTimeout(() => animateCounter(65, 'total'), 900);
  }, [setSourceStats]);

  const sourceCategories = [
    {
      icon: Building,
      count: sourceStats.government,
      label: "Government Databases",
      description: "SEC filings, regulatory data, market reports",
      color: "from-blue-500 to-cyan-500",
      examples: ["SEC EDGAR", "USPTO Patents", "Federal Trade Data", "Regulatory Filings"]
    },
    {
      icon: GraduationCap,
      count: sourceStats.academic,
      label: "Academic Institutions",
      description: "Research papers, studies, institutional data",
      color: "from-emerald-500 to-green-500",
      examples: ["MIT Research", "Stanford Studies", "Harvard Business", "Academic Journals"]
    },
    {
      icon: Briefcase,
      count: sourceStats.vcFirms,
      label: "VC Firms & Industry",
      description: "Investment insights, market intelligence",
      color: "from-violet-500 to-purple-500",
      examples: ["Y Combinator", "Andreessen Horowitz", "Sequoia Capital", "First Round"]
    }
  ];

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-violet-50 rounded-3xl shadow-2xl border-2 border-slate-200 p-10 mb-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-violet-900 bg-clip-text text-transparent mb-4">
          Powered by {sourceStats.total}+ Authoritative Sources
        </h2>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Every WeReady recommendation is backed by real data from government databases, 
          academic research, and top-tier venture capital firms—not opinions or guesswork.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {sourceCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center hover:shadow-2xl transition-all duration-300">
              <div className={`w-20 h-20 bg-gradient-to-r ${category.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl`}>
                <Icon className="w-10 h-10 text-white" />
              </div>
              
              <div className="mb-6">
                <div className="text-4xl font-bold text-slate-900 mb-2">{category.count}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{category.label}</h3>
                <p className="text-slate-600">{category.description}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Includes:</h4>
                {category.examples.map((example, idx) => (
                  <div key={idx} className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                    {example}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border-2 border-violet-200 p-8 text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-4">
          Real-Time Intelligence vs. Outdated Advice
        </h3>
        <p className="text-lg text-slate-600 max-w-4xl mx-auto mb-6">
          While others rely on generic frameworks, WeReady continuously analyzes live market data, 
          recent funding patterns, and current regulatory requirements to give you actionable insights 
          that reflect today's startup landscape.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600">
          <span className="bg-white px-4 py-2 rounded-lg border border-violet-200 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Updated Daily</span>
          </span>
          <span className="bg-white px-4 py-2 rounded-lg border border-violet-200 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Market Validated</span>
          </span>
          <span className="bg-white px-4 py-2 rounded-lg border border-violet-200 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Evidence Based</span>
          </span>
        </div>
      </div>
    </div>
  );
};


export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [inputMode, setInputMode] = useState<"code" | "repo">("repo");
  const [code, setCode] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [pendingAnalysisData, setPendingAnalysisData] = useState<any>(null);
  const [usageStats, setUsageStats] = useState(() => UsageTracker.getUsageStats());
  const [sourceStats, setSourceStats] = useState({
    government: 0,
    academic: 0,
    vcFirms: 0,
    total: 0
  });

  // Mock data scenarios
  const mockScenarios = [
    {
      // Scenario A: High-Performing Startup (87/100 - WeReady Stamp Eligible)
      overall_score: 87,
      verdict: "ready_to_ship",
      weready_stamp_eligible: true,
      isPremiumUser: true,
      breakdown: {
        code_quality: { 
          score: 92, 
          status: "excellent", 
          weight: 25, 
          issues: [], 
          recommendations: ["Continue excellent practices"],
          detailed_analysis: {
            ai_detection: {
              likelihood: 0.15,
              confidence: 0.94,
              risk_level: "low",
              patterns_detected: ["Consistent coding style", "Domain-specific logic patterns"]
            },
            security_assessment: {
              security_score: 91,
              vulnerability_count: 0,
              severity_distribution: { critical: 0, high: 0, medium: 1, low: 2 }
            },
            architecture_quality: {
              structure_score: 88,
              maintainability: 92,
              scalability: 89,
              code_organization: "excellent"
            },
            testing_coverage: {
              estimated_coverage: 87,
              test_quality: "high",
              missing_tests: ["Edge case validation"]
            }
          },
          insights: [
            "Code demonstrates strong architectural patterns and maintainability",
            "Security practices align with industry standards",
            "Test coverage is comprehensive with room for edge case improvement"
          ],
          quick_wins: ["Add edge case tests", "Implement additional logging"],
          long_term_improvements: ["Microservices architecture consideration", "Performance optimization"]
        },
        business_model: { 
          score: 85, 
          status: "good", 
          weight: 25, 
          issues: ["Consider adding more detailed cohort analysis"], 
          recommendations: ["Strengthen unit economics documentation"],
          detailed_analysis: {
            revenue_model: {
              clarity_score: 88,
              revenue_streams: ["SaaS subscriptions", "Enterprise licensing", "Professional services"],
              pricing_strategy: "value-based"
            },
            market_validation: {
              validation_score: 82,
              customer_interviews: 47,
              validation_stage: "strong"
            },
            unit_economics: {
              economics_score: 89,
              cac_ltv_ratio: "1:4.2",
              gross_margins: "78%"
            },
            competitive_positioning: {
              differentiation_score: 81,
              unique_value_prop: "AI-powered analysis with evidence-based recommendations",
              market_position: "emerging leader"
            }
          },
          insights: [
            "Strong unit economics with healthy LTV:CAC ratio",
            "Multiple revenue streams provide diversification",
            "Market validation shows strong product-market fit signals"
          ]
        },
        investment_ready: { 
          score: 83, 
          status: "good", 
          weight: 25, 
          issues: ["Prepare for due diligence documentation"], 
          recommendations: ["Prepare Series A pitch deck"],
          detailed_analysis: {
            traction_metrics: {
              traction_score: 86,
              revenue_growth: "40% MoM",
              user_growth: "65% MoM",
              key_metrics: { mrr: "$47K", cac: "$180", ltv: "$760" }
            },
            team_assessment: {
              team_score: 88,
              team_completeness: 85,
              domain_expertise: 92,
              execution_track_record: "strong"
            },
            market_opportunity: {
              market_score: 81,
              addressable_market: "$2.4B TAM",
              market_timing: "excellent",
              competitive_landscape: "fragmented"
            },
            scalability_factors: {
              scalability_score: 79,
              technology_scalability: "high",
              business_model_scalability: "high",
              operational_scalability: "developing"
            }
          },
          insights: [
            "Strong growth metrics indicate healthy traction",
            "Team has proven domain expertise and execution ability",
            "Market timing is optimal for Series A fundraising"
          ],
          valuation_estimate: "5-8M"
        },
        design_experience: { 
          score: 89, 
          status: "excellent", 
          weight: 25, 
          issues: [], 
          recommendations: ["Optimize conversion elements for revenue growth"],
          detailed_analysis: {
            design_system_maturity: {
              maturity_score: 92,
              consistency_score: 88,
              documentation_quality: "excellent",
              component_library: "comprehensive"
            },
            accessibility_compliance: {
              wcag_score: 91,
              compliance_level: "AA",
              violations: 2,
              severity_distribution: { critical: 0, high: 0, medium: 1, low: 1 }
            },
            ux_quality_metrics: {
              usability_score: 87,
              user_satisfaction: 4.6,
              task_completion_rate: 94,
              time_to_completion: "efficient"
            },
            conversion_optimization: {
              cro_score: 84,
              conversion_rate: "3.4%",
              trust_signals: "strong",
              cta_effectiveness: "high"
            },
            mobile_optimization: {
              mobile_score: 91,
              responsive_design: "excellent",
              touch_targets: "optimized",
              loading_performance: "fast"
            }
          },
          insights: [
            "Design system demonstrates enterprise-level maturity",
            "Accessibility compliance exceeds industry standards",
            "Mobile experience is optimized for high conversion"
          ],
          business_impact: {
            revenue_opportunity: "$125K annually from CRO improvements",
            efficiency_gains: "40% reduction in design iteration time",
            risk_mitigation: "Accessibility compliance prevents legal risk"
          }
        }
      },
      success_probability: 0.85,
      funding_timeline: "3-6 months ready",
      credibility_score: 98,
      market_percentile: 95,
      brain_recommendations: [
        {
          id: "rec1",
          priority: "high",
          category: "code_quality",
          title: "Implement comprehensive test coverage",
          description: "Current test coverage is good but could be enhanced with integration tests for core business logic",
          action: "Add integration tests for payment processing and user authentication flows",
          timeline: "2-3 weeks",
          evidence_source: "Y Combinator - Startup Playbook",
          organization: "Y Combinator",
          confidence: 94,
          similar_cases: 127,
          impact: "Reduces deployment risk by 40%"
        },
        {
          id: "rec2",
          priority: "medium",
          category: "business_model",
          title: "Strengthen unit economics documentation",
          description: "Your CAC/LTV ratio is excellent, but detailed documentation will help with investor presentations",
          action: "Create detailed unit economics dashboard with cohort analysis",
          timeline: "1-2 weeks",
          evidence_source: "Bessemer Venture Partners - CAC/LTV Best Practices",
          organization: "Bessemer VC",
          confidence: 91,
          similar_cases: 89,
          impact: "Increases investor confidence by 25%"
        },
        {
          id: "rec3",
          priority: "medium",
          category: "investment_readiness",
          title: "Prepare Series A pitch deck",
          description: "Your metrics are strong enough for Series A, focus on growth strategy and market expansion",
          action: "Develop 15-slide Series A deck emphasizing scalability and market opportunity",
          timeline: "3-4 weeks",
          evidence_source: "MIT Entrepreneurship - Fundraising Guide",
          organization: "MIT",
          confidence: 88,
          similar_cases: 156,
          impact: "Optimal timing for Series A fundraising"
        },
        {
          id: "rec4",
          priority: "low",
          category: "code_quality",
          title: "Optimize database queries",
          description: "Performance is good but optimization will support rapid scaling",
          action: "Implement database indexing and query optimization for user search",
          timeline: "1 week",
          evidence_source: "Sequoia Capital - Scaling Playbook",
          organization: "Sequoia Capital",
          confidence: 85,
          similar_cases: 203,
          impact: "Supports 10x user growth"
        },
        {
          id: "rec5",
          priority: "low",
          category: "business_model",
          title: "Expand customer success metrics",
          description: "Track additional retention and expansion metrics for investor updates",
          action: "Implement NPS, expansion revenue, and churn cohort tracking",
          timeline: "2 weeks",
          evidence_source: "Andreessen Horowitz - SaaS Metrics",
          organization: "a16z",
          confidence: 82,
          similar_cases: 174,
          impact: "Enhanced investor reporting"
        },
        {
          id: "rec6",
          priority: "low",
          category: "design_experience",
          title: "Optimize conversion funnel design",
          description: "Your design quality is excellent, but minor CRO improvements could boost revenue",
          action: "A/B test trust signals and CTA button designs for conversion optimization",
          timeline: "2-3 weeks",
          evidence_source: "Baymard Institute - Conversion Research",
          organization: "Baymard Institute",
          confidence: 86,
          similar_cases: 145,
          impact: "Could increase conversion rates by 8-12%"
        }
      ],
      category_issues: {
        code_quality: [],
        business_model: ["Consider adding more detailed cohort analysis"],
        investment_readiness: ["Prepare for due diligence documentation"],
        design_experience: ["Minor conversion optimization opportunities"]
      },
      moats: ["Network effects", "Proprietary data", "Strong team expertise"],
      improvement_roadmap: {
        immediate: ["Finalize test coverage", "Update pitch deck"],
        short_term: ["Implement analytics dashboard", "Prepare due diligence room"],
        long_term: ["Series A fundraising", "International expansion planning"]
      },
      market_context: {
        percentile: "Top 5%",
        comparison: "Better than most YC startups at Demo Day"
      },
      competitive_moats: ["Network effects", "Proprietary data", "Strong team expertise"],
      next_steps: ["Continue excellent execution", "Prepare for Series A"],
      files_analyzed: 1
    },
    {
      // Scenario B: Medium Startup (68/100 - Promising)
      overall_score: 68,
      verdict: "needs_work",
      weready_stamp_eligible: false,
      isPremiumUser: true,
      breakdown: {
        code_quality: { 
          score: 75, 
          status: "good", 
          weight: 25, 
          issues: ["Test coverage could be improved"], 
          recommendations: ["Add unit tests for core modules"],
          detailed_analysis: {
            ai_detection: {
              likelihood: 0.35,
              confidence: 0.82,
              risk_level: "medium",
              patterns_detected: ["Generic variable names", "Repetitive code structures", "Basic error handling"]
            },
            security_assessment: {
              security_score: 68,
              vulnerability_count: 3,
              severity_distribution: { critical: 0, high: 1, medium: 2, low: 3 }
            },
            architecture_quality: {
              structure_score: 72,
              maintainability: 70,
              scalability: 75,
              code_organization: "moderate"
            },
            testing_coverage: {
              estimated_coverage: 45,
              test_quality: "moderate",
              missing_tests: ["Integration tests", "Error handling tests", "API endpoint tests"]
            }
          },
          insights: [
            "Code structure is functional but could benefit from refactoring",
            "Security vulnerabilities need immediate attention",
            "Testing coverage is below recommended thresholds"
          ],
          critical_issues: ["SQL injection vulnerability in user input", "Unhandled exceptions in payment flow"],
          quick_wins: ["Add input validation", "Implement error logging", "Basic unit tests"],
          long_term_improvements: ["Code refactoring", "Comprehensive test suite", "Security audit"]
        },
        business_model: { 
          score: 62, 
          status: "needs_work", 
          weight: 25, 
          issues: ["Weak product-market fit signals", "Unclear revenue scaling"], 
          recommendations: ["Validate product-market fit", "Refine pricing strategy"],
          detailed_analysis: {
            revenue_model: {
              clarity_score: 58,
              revenue_streams: ["Freemium subscriptions", "One-time purchases"],
              pricing_strategy: "experimental"
            },
            market_validation: {
              validation_score: 45,
              customer_interviews: 12,
              validation_stage: "early"
            },
            unit_economics: {
              economics_score: 52,
              cac_ltv_ratio: "1:2.1",
              gross_margins: "65%"
            },
            competitive_positioning: {
              differentiation_score: 71,
              unique_value_prop: "User-friendly interface with automation",
              market_position: "challenger"
            }
          },
          insights: [
            "Revenue model needs clarification and optimization",
            "Limited customer validation suggests PMF risk",
            "Unit economics are below optimal thresholds"
          ]
        },
        investment_ready: { 
          score: 65, 
          status: "needs_work", 
          weight: 25, 
          issues: ["Limited traction metrics", "No clear growth strategy"], 
          recommendations: ["Implement key metrics tracking", "Develop scalable growth plan"],
          detailed_analysis: {
            traction_metrics: {
              traction_score: 58,
              revenue_growth: "12% MoM",
              user_growth: "18% MoM",
              key_metrics: { mrr: "$8.5K", cac: "$320", ltv: "$680" }
            },
            team_assessment: {
              team_score: 68,
              team_completeness: 60,
              domain_expertise: 72,
              execution_track_record: "developing"
            },
            market_opportunity: {
              market_score: 74,
              addressable_market: "$850M TAM",
              market_timing: "good",
              competitive_landscape: "competitive"
            },
            scalability_factors: {
              scalability_score: 61,
              technology_scalability: "moderate",
              business_model_scalability: "moderate",
              operational_scalability: "limited"
            }
          },
          insights: [
            "Growth metrics show promise but need acceleration",
            "Team gaps in key areas require attention",
            "Market opportunity exists but execution is critical"
          ],
          valuation_estimate: "1.5-3M"
        },
        design_experience: { 
          score: 71, 
          status: "good", 
          weight: 25, 
          issues: ["Accessibility compliance needs work", "Mobile experience could be improved"], 
          recommendations: ["Implement WCAG 2.1 AA compliance", "Add mobile-first responsive design"],
          detailed_analysis: {
            design_system_maturity: {
              maturity_score: 68,
              consistency_score: 72,
              documentation_quality: "basic",
              component_library: "partial"
            },
            accessibility_compliance: {
              wcag_score: 58,
              compliance_level: "partial A",
              violations: 12,
              severity_distribution: { critical: 1, high: 3, medium: 5, low: 3 }
            },
            ux_quality_metrics: {
              usability_score: 74,
              user_satisfaction: 3.8,
              task_completion_rate: 78,
              time_to_completion: "moderate"
            },
            conversion_optimization: {
              cro_score: 66,
              conversion_rate: "2.1%",
              trust_signals: "moderate",
              cta_effectiveness: "needs improvement"
            },
            mobile_optimization: {
              mobile_score: 62,
              responsive_design: "basic",
              touch_targets: "some issues",
              loading_performance: "slow"
            }
          },
          insights: [
            "Design system needs standardization and documentation",
            "Accessibility issues create legal and market reach risks",
            "Mobile optimization critical for user acquisition"
          ],
          business_impact: {
            revenue_opportunity: "$85K annually from mobile optimization",
            efficiency_gains: "25% design process improvement potential",
            risk_mitigation: "Accessibility fixes prevent $50-500K lawsuit risk"
          }
        }
      },
      success_probability: 0.72,
      funding_timeline: "6-12 months of development needed",
      credibility_score: 78,
      market_percentile: 68,
      brain_recommendations: [
        {
          id: "rec1",
          priority: "critical",
          category: "business_model",
          title: "Validate product-market fit",
          description: "Customer interviews show mixed signals. Need stronger validation before scaling",
          action: "Conduct 50+ customer interviews and analyze usage patterns",
          timeline: "4-6 weeks",
          evidence_source: "First Round - PMF Framework",
          organization: "First Round Capital",
          confidence: 92,
          similar_cases: 234,
          impact: "Critical for sustainable growth"
        },
        {
          id: "rec2",
          priority: "high",
          category: "code_quality",
          title: "Improve error handling and monitoring",
          description: "Current error rates are manageable but monitoring needs enhancement",
          action: "Implement comprehensive logging and error tracking system",
          timeline: "3-4 weeks",
          evidence_source: "Google SRE Handbook",
          organization: "Google",
          confidence: 89,
          similar_cases: 145,
          impact: "Reduces customer support burden by 60%"
        },
        {
          id: "rec3",
          priority: "high",
          category: "investment_readiness",
          title: "Establish clear revenue model",
          description: "Multiple pricing experiments needed to optimize revenue per customer",
          action: "A/B test 3 pricing strategies with current user base",
          timeline: "6-8 weeks",
          evidence_source: "Price Intelligently - SaaS Pricing",
          organization: "ProfitWell",
          confidence: 87,
          similar_cases: 178,
          impact: "Could increase ARPU by 40-60%"
        },
        {
          id: "rec4",
          priority: "high",
          category: "design_experience",
          title: "Implement mobile-first responsive design",
          description: "68% of web traffic is mobile, but your site isn't optimized for mobile users",
          action: "Redesign using mobile-first approach with proper touch targets and responsive layouts",
          timeline: "4-6 weeks",
          evidence_source: "Google Mobile-First Design Guidelines",
          organization: "Google",
          confidence: 91,
          similar_cases: 256,
          impact: "Could increase mobile conversions by 34%"
        },
        {
          id: "rec5",
          priority: "medium",
          category: "design_experience",
          title: "Fix accessibility compliance issues",
          description: "Current WCAG compliance issues create legal risk and limit market reach",
          action: "Implement proper labels, alt text, and keyboard navigation for WCAG 2.1 AA compliance",
          timeline: "3-4 weeks",
          evidence_source: "WebAIM Accessibility Guidelines",
          organization: "WebAIM",
          confidence: 94,
          similar_cases: 189,
          impact: "Prevents $50K-500K lawsuit risk, expands market by 15%"
        }
      ],
      category_issues: {
        code_quality: ["Inconsistent error handling", "Limited monitoring"],
        business_model: ["Unclear value proposition", "Mixed customer feedback", "Pricing strategy needs work"],
        investment_readiness: ["Financial projections need validation", "Market size assumptions unclear"],
        design_experience: ["Accessibility compliance gaps", "Mobile optimization needed", "Trust signals missing"]
      },
      moats: ["First-mover advantage", "Growing user base"],
      improvement_roadmap: {
        immediate: ["Customer interview program", "Error monitoring setup"],
        short_term: ["Pricing optimization", "Product-market fit validation"],
        long_term: ["Seed extension or Series A prep", "Feature expansion"]
      },
      market_context: {
        percentile: "Top 40%",
        comparison: "Typical early-stage startup score"
      },
      competitive_moats: ["First-mover advantage", "Growing user base"],
      next_steps: ["Focus on product-market fit validation", "Improve error monitoring"],
      files_analyzed: 1
    },
    {
      // Scenario C: Low-Performing Startup (43/100 - Critical Issues)
      overall_score: 43,
      verdict: "critical_issues",
      weready_stamp_eligible: false,
      isPremiumUser: true,
      breakdown: {
        code_quality: { 
          score: 35, 
          status: "critical", 
          weight: 25, 
          issues: ["Critical security vulnerabilities", "Poor code structure", "No testing"], 
          recommendations: ["Address security vulnerabilities", "Implement proper testing framework", "Refactor core architecture"],
          detailed_analysis: {
            ai_detection: {
              likelihood: 0.78,
              confidence: 0.91,
              risk_level: "high",
              patterns_detected: ["Generic function names", "Copy-paste code blocks", "Template-like structures", "Minimal comments"]
            },
            security_assessment: {
              security_score: 22,
              vulnerability_count: 12,
              severity_distribution: { critical: 3, high: 4, medium: 3, low: 2 }
            },
            architecture_quality: {
              structure_score: 28,
              maintainability: 25,
              scalability: 30,
              code_organization: "poor"
            },
            testing_coverage: {
              estimated_coverage: 5,
              test_quality: "minimal",
              missing_tests: ["All unit tests", "Integration tests", "Security tests", "Performance tests"]
            }
          },
          insights: [
            "Code shows strong indicators of AI generation with security risks",
            "Architecture lacks proper separation of concerns",
            "Critical security vulnerabilities require immediate attention"
          ],
          critical_issues: [
            "SQL injection in multiple endpoints", 
            "Hardcoded credentials in source code", 
            "No input sanitization",
            "Exposed API keys"
          ],
          quick_wins: ["Remove hardcoded secrets", "Add basic input validation"],
          long_term_improvements: ["Complete architecture redesign", "Comprehensive security audit", "Full test suite implementation"]
        },
        business_model: { 
          score: 45, 
          status: "needs_work", 
          weight: 25, 
          issues: ["No clear value proposition", "Unclear target market", "No revenue model"], 
          recommendations: ["Define clear value proposition", "Identify target customer segments", "Develop sustainable revenue model"],
          detailed_analysis: {
            revenue_model: {
              clarity_score: 28,
              revenue_streams: ["TBD"],
              pricing_strategy: "undefined"
            },
            market_validation: {
              validation_score: 22,
              customer_interviews: 3,
              validation_stage: "minimal"
            },
            unit_economics: {
              economics_score: 15,
              cac_ltv_ratio: "unknown",
              gross_margins: "estimated 40%"
            },
            competitive_positioning: {
              differentiation_score: 55,
              unique_value_prop: "unclear",
              market_position: "undefined"
            }
          },
          insights: [
            "Business model requires fundamental restructuring",
            "Market validation is critically lacking",
            "Revenue strategy needs complete development"
          ]
        },
        investment_ready: { 
          score: 55, 
          status: "needs_work", 
          weight: 25, 
          issues: ["No metrics tracking", "Weak team", "No traction"], 
          recommendations: ["Establish key performance metrics", "Build credible team", "Focus on user acquisition"],
          detailed_analysis: {
            traction_metrics: {
              traction_score: 32,
              revenue_growth: "2% MoM",
              user_growth: "5% MoM",
              key_metrics: { mrr: "$1.2K", cac: "$450", ltv: "$380" }
            },
            team_assessment: {
              team_score: 45,
              team_completeness: 40,
              domain_expertise: 48,
              execution_track_record: "limited"
            },
            market_opportunity: {
              market_score: 65,
              addressable_market: "$400M TAM",
              market_timing: "uncertain",
              competitive_landscape: "crowded"
            },
            scalability_factors: {
              scalability_score: 38,
              technology_scalability: "limited",
              business_model_scalability: "unclear",
              operational_scalability: "poor"
            }
          },
          insights: [
            "Critical traction issues prevent investment readiness",
            "Team requires significant strengthening across key roles",
            "Business fundamentals need major improvement"
          ],
          valuation_estimate: "200K-500K"
        },
        design_experience: { 
          score: 38, 
          status: "critical", 
          weight: 25, 
          issues: ["No accessibility compliance", "Poor mobile experience", "No design system"], 
          recommendations: ["Implement basic accessibility features", "Add responsive design patterns", "Create design system foundation"],
          detailed_analysis: {
            design_system_maturity: {
              maturity_score: 22,
              consistency_score: 25,
              documentation_quality: "none",
              component_library: "missing"
            },
            accessibility_compliance: {
              wcag_score: 18,
              compliance_level: "non-compliant",
              violations: 47,
              severity_distribution: { critical: 8, high: 12, medium: 15, low: 12 }
            },
            ux_quality_metrics: {
              usability_score: 42,
              user_satisfaction: 2.1,
              task_completion_rate: 52,
              time_to_completion: "poor"
            },
            conversion_optimization: {
              cro_score: 28,
              conversion_rate: "0.8%",
              trust_signals: "lacking",
              cta_effectiveness: "poor"
            },
            mobile_optimization: {
              mobile_score: 31,
              responsive_design: "broken",
              touch_targets: "unusable",
              loading_performance: "very slow"
            }
          },
          insights: [
            "Design quality severely impacts user acquisition and retention",
            "Critical accessibility violations expose significant legal risk",
            "Mobile experience failure limits market reach by 70%"
          ],
          business_impact: {
            revenue_opportunity: "$200K+ annually from basic UX improvements",
            efficiency_gains: "Design system could improve development speed 3x",
            risk_mitigation: "Immediate accessibility fixes prevent lawsuit risk"
          }
        }
      },
      success_probability: 0.45,
      funding_timeline: "12+ months significant work needed",
      credibility_score: 52,
      market_percentile: 25,
      brain_recommendations: [
        {
          id: "rec1",
          priority: "critical",
          category: "code_quality",
          title: "Address critical security vulnerabilities",
          description: "Multiple high-severity security issues detected that must be resolved immediately",
          action: "Conduct full security audit and implement fixes for all critical vulnerabilities",
          timeline: "2-3 weeks",
          evidence_source: "OWASP Security Guidelines",
          organization: "OWASP",
          confidence: 98,
          similar_cases: 89,
          impact: "Prevents potential data breaches"
        },
        {
          id: "rec2",
          priority: "critical",
          category: "business_model",
          title: "Pivot or validate core assumptions",
          description: "Current business model shows weak unit economics and limited market traction",
          action: "Reassess target market and consider pivoting core value proposition",
          timeline: "8-12 weeks",
          evidence_source: "Lean Startup Methodology",
          organization: "Eric Ries",
          confidence: 91,
          similar_cases: 267,
          impact: "Fundamental to business viability"
        },
        {
          id: "rec3",
          priority: "critical",
          category: "code_quality",
          title: "Implement basic testing framework",
          description: "No automated testing detected. This is preventing safe feature development",
          action: "Set up unit and integration testing with minimum 60% coverage",
          timeline: "4-6 weeks",
          evidence_source: "Test-Driven Development Best Practices",
          organization: "Kent Beck",
          confidence: 95,
          similar_cases: 312,
          impact: "Enables safe feature development"
        },
        {
          id: "rec4",
          priority: "critical",
          category: "design_experience",
          title: "Address critical accessibility violations",
          description: "Current design has severe accessibility issues that expose you to legal liability",
          action: "Immediately implement basic accessibility features: proper labels, alt text, color contrast",
          timeline: "2-3 weeks",
          evidence_source: "WCAG 2.1 AA Guidelines",
          organization: "W3C",
          confidence: 98,
          similar_cases: 345,
          impact: "Prevents immediate legal risk, opens market to 15% more users"
        },
        {
          id: "rec5",
          priority: "high",
          category: "design_experience",
          title: "Create responsive mobile design",
          description: "No mobile optimization detected despite 68% mobile traffic",
          action: "Build mobile-first responsive design with proper touch targets",
          timeline: "6-8 weeks",
          evidence_source: "Google Mobile Usability Guidelines",
          organization: "Google",
          confidence: 92,
          similar_cases: 298,
          impact: "Essential for user acquisition and retention"
        }
      ],
      category_issues: {
        code_quality: ["Critical security vulnerabilities", "No automated testing", "Poor code organization", "Performance issues"],
        business_model: ["Weak unit economics", "Unclear target market", "Limited customer validation", "No clear monetization strategy"],
        investment_readiness: ["Insufficient traction metrics", "Weak financial projections", "Team gaps in key areas"],
        design_experience: ["Critical accessibility violations", "No mobile optimization", "Poor user experience", "No design system"]
      },
      moats: [],
      improvement_roadmap: {
        immediate: ["Security vulnerability fixes", "Basic testing setup"],
        short_term: ["Customer validation study", "Business model reassessment"],
        long_term: ["Product pivot consideration", "Team strengthening"]
      },
      market_context: {
        percentile: "Bottom 40%",
        comparison: "Far below investment threshold"
      },
      competitive_moats: [],
      next_steps: ["Address critical security issues", "Validate business model fundamentals"],
      files_analyzed: 1
    }
  ];

  const generateMockData = () => {
    const randomScenario = mockScenarios[Math.floor(Math.random() * mockScenarios.length)];
    return randomScenario;
  };

  const navigateToResults = (resultData: any, isMock: boolean = false) => {
    console.log("=== NAVIGATION DEBUG ===");
    console.log("navigateToResults called with:", { resultData: !!resultData, isMock, isAuthenticated });
    
    // Record usage for non-authenticated users
    if (!isAuthenticated) {
      const newStats = UsageTracker.recordReportUsage();
      setUsageStats(newStats);
      console.log("Usage recorded:", newStats);
    }
    
    // Always proceed to results - guest users get their free analysis
    // Save prompt will be shown on the results page instead
    proceedToResults(resultData, isMock);
  };

  const proceedToResults = (resultData: any, isMock: boolean = false) => {
    try {
      // Store data in sessionStorage to avoid URL length limits
      const dataId = `weready_result_${Date.now()}`;
      sessionStorage.setItem(dataId, JSON.stringify(resultData));
      sessionStorage.setItem('weready_current_result', dataId);
      sessionStorage.setItem('weready_is_mock', isMock.toString());
      
      console.log("Data stored in sessionStorage with ID:", dataId);
      
      // Navigate with simple URL
      const url = `/results?id=${dataId}`;
      console.log("Navigating to URL:", url);
      
      router.push(url);
      console.log("router.push executed successfully");
      
    } catch (error) {
      console.error("Navigation failed:", error);
      console.log("Attempting fallback navigation...");
      
      // Fallback: try direct window navigation
      try {
        const dataId = `weready_result_${Date.now()}`;
        sessionStorage.setItem(dataId, JSON.stringify(resultData));
        sessionStorage.setItem('weready_current_result', dataId);
        sessionStorage.setItem('weready_is_mock', isMock.toString());
        
        window.location.href = `/results?id=${dataId}`;
      } catch (fallbackError) {
        console.error("Fallback navigation also failed:", fallbackError);
        alert("Navigation failed. Please try refreshing the page.");
      }
    }
    
    console.log("=== END NAVIGATION DEBUG ===");
  };

  const handleSaveAnalysis = () => {
    setLoginModalOpen(true);
    setShowSavePrompt(false);
  };

  const handleViewWithoutSaving = () => {
    setShowSavePrompt(false);
    if (pendingAnalysisData) {
      proceedToResults(pendingAnalysisData, true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && isValidInput && !scanning) {
      e.preventDefault();
      scanCode();
    }
  };

  const scanCode = async () => {
    console.log("scanCode called", { inputMode, code, repoUrl });
    if (inputMode === "code" && !code) return;
    if (inputMode === "repo" && !repoUrl) return;

    // Check usage limits for non-authenticated users
    if (!isAuthenticated && !UsageTracker.canGenerateReport()) {
      alert("You've already used your free report. Choose a plan for unlimited access!");
      setLoginModalOpen(true);
      return;
    }

    setScanning(true);
    
    // Check if user typed "mock" to trigger mock data
    const isMockTrigger = (inputMode === "code" && code.toLowerCase().trim() === "mock") || 
                         (inputMode === "repo" && repoUrl.toLowerCase().trim() === "mock");
    
    console.log("Mock trigger check:", { isMockTrigger, inputMode, code, repoUrl });
    
    if (isMockTrigger) {
      console.log("Mock path triggered - using frontend mock data");
      // Use frontend mock data directly for demo
      setTimeout(() => {
        console.log("Mock timeout completed - generating data");
        const mockData = generateMockData();
        console.log("Mock data generated:", mockData);
        setScanning(false);
        navigateToResults(mockData, true);
        console.log("Navigated to results page");
      }, 2000);
      return;
    }
    
    try {
      const requestBody = inputMode === "code" 
        ? { code_snippet: code, language: "python" }
        : { repository_url: repoUrl, language: "python" };
        
      const response = await fetch("http://localhost:8000/api/analyze/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }
      
      const data = await response.json();
      setScanning(false);
      navigateToResults(data, false);
    } catch (error) {
      console.error("Scan failed:", error);
      const errorResult = {
        overall_score: 0,
        verdict: "ERROR",
        breakdown: {
          code_quality: { score: 0, status: "error", weight: 40, issues: ["Analysis failed"], recommendations: [] },
          business_model: { score: 0, status: "error", weight: 30, issues: ["Analysis failed"], recommendations: [] },
          investment_ready: { score: 0, status: "error", weight: 30, issues: ["Analysis failed"], recommendations: [] }
        },
        brain_recommendations: [],
        improvement_roadmap: { immediate: [], short_term: [], long_term: [] },
        competitive_moats: [],
        action_required: "Analysis failed. Please try again or use manual code input.",
        files_analyzed: 0
      };
      setScanning(false);
      navigateToResults(errorResult, false);
    }
  };


  const isValidInput = inputMode === "code" ? code.trim() : repoUrl.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navigation />

      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3">
        <div className="max-w-6xl mx-auto px-4">
          <p className="font-semibold">
            🚀 <span className="text-blue-100">Live Demo:</span> This is a fully functional demo showing WeReady's complete analysis capabilities
            <span className="ml-2 text-blue-200">• Try "Mock Demo" for comprehensive results •</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-8 md:py-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Get Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              WeReady Score
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 mb-4 max-w-3xl mx-auto leading-relaxed px-4">
            Don't let technical hiccups kill your startup. Get actionable guidance to ship confidently.
          </p>
          
          <div className="flex justify-center mb-8">
            <div 
              onClick={() => router.push('/bailey-intelligence')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
            >
              <span className="font-semibold">🧠 NEW: Bailey Intelligence Dashboard</span>
              <span className="text-blue-100">→</span>
            </div>
          </div>
        </div>

        {/* Trust Signal Bar */}
        <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-violet-50 border-2 border-emerald-200 rounded-2xl shadow-xl p-8 mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-700 to-blue-700 bg-clip-text text-transparent mb-4">
                Evidence-Based Startup Intelligence
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Every recommendation comes from authoritative sources - not opinions or guesswork
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-emerald-200 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-emerald-600 mb-1">65+</div>
                <div className="text-sm text-slate-600">Data Sources</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-blue-200 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-blue-600 mb-1">4</div>
                <div className="text-sm text-slate-600">Analysis Pillars</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-violet-200 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-violet-600 mb-1">Live</div>
                <div className="text-sm text-slate-600">Demo Available</div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 text-center border border-orange-200 shadow-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-orange-600 mb-1">Free</div>
                <div className="text-sm text-slate-600">First Analysis</div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Government Data Integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Academic Research Based</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Open Source Methodology</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Evidence-Based Analysis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Authoritative Sources Section */}
        <AuthoritativeSourcesSection sourceStats={sourceStats} setSourceStats={setSourceStats} />

        {/* Input Section */}
        <div className="relative bg-gradient-to-br from-violet-50 via-white to-purple-50 rounded-3xl shadow-2xl border-2 border-violet-200 p-10 mb-12">
          <div className="relative text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-900 to-purple-900 bg-clip-text text-transparent mb-3">
              Get Your Free Startup Analysis
            </h2>
            <p className="text-lg text-slate-600 max-w-lg mx-auto">
              Comprehensive readiness analysis across code quality, business model, investment readiness, and design experience. One free report to get started.
            </p>
          </div>

          {/* Input Mode Toggle */}
          <div className="relative flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 flex shadow-lg border border-violet-200">
              <button
                onClick={() => setInputMode("repo")}
                className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center space-x-3 ${
                  inputMode === "repo"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Github className="w-5 h-5" />
                <span>GitHub Repository</span>
              </button>
              <button
                onClick={() => setInputMode("code")}
                className={`px-8 py-4 rounded-xl font-semibold transition-all flex items-center space-x-3 ${
                  inputMode === "code"
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg transform scale-105"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>Manual Code</span>
              </button>
            </div>
          </div>

          {inputMode === "repo" ? (
            <div className="relative max-w-2xl mx-auto">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Repository URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  className="w-full bg-white/80 backdrop-blur-sm border-2 border-violet-200 rounded-2xl px-6 py-5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-all text-lg shadow-lg"
                  placeholder="https://github.com/username/repository (or include 'mock' to see demo)"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Github className="absolute right-6 top-5 w-6 h-6 text-violet-400" />
              </div>
            </div>
          ) : (
            <div className="relative max-w-2xl mx-auto">
              <label className="block text-sm font-semibold text-slate-700 mb-4">
                Paste Your Code
              </label>
              <textarea
                className="w-full h-48 bg-white/80 backdrop-blur-sm border-2 border-violet-200 rounded-2xl px-6 py-5 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-400 transition-all font-mono text-sm shadow-lg"
                placeholder="Paste your AI-generated code here...\n\nTip: Type 'mock' to see a comprehensive demo report!"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          <div className="relative max-w-2xl mx-auto mt-10">
            <button
              onClick={scanCode}
              disabled={!isValidInput || scanning}
              className="relative w-full bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 hover:from-violet-700 hover:via-purple-700 hover:to-violet-800 text-white font-bold py-6 px-8 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-2xl hover:shadow-violet-500/25 flex items-center justify-center space-x-3"
            >
              {scanning ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="text-lg">Running WeReady Analysis...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">🚀 Get Free Report</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
            
            {!isAuthenticated && (
              <div className="mt-4 p-3 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg">
                <p className="text-center text-slate-700 text-sm font-medium">
                  {usageStats.hasReachedLimit 
                    ? "🚫 You've used your free report. Choose a plan for unlimited access!"
                    : "✨ Get your free startup analysis report"
                  }
                </p>
              </div>
            )}
            
            <p className="text-center text-slate-600 text-sm mt-4">
              🎁 Get your detailed startup readiness report - no signup required
            </p>
          </div>
        </div>

        {/* How It Works Section */}
        <HowItWorks />

      </div>
      
      {/* Footer */}
      <Footer />

      {/* Save Analysis Prompt Modal */}
      {showSavePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Save className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Save Your Analysis?
              </h3>
              
              <p className="text-slate-600 mb-6">
                Your WeReady analysis is complete! Sign up for a free account to save your results, 
                track progress over time, and get access to detailed recommendations.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleSaveAnalysis}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save & Get Free Trial</span>
                </button>
                
                <button
                  onClick={handleViewWithoutSaving}
                  className="w-full text-slate-600 hover:text-slate-900 font-medium py-3 px-6 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Clock className="w-5 h-5" />
                  <span>View Results (No Save)</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-4">
                💡 Free trial includes unlimited analyses for 7 days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => {
          setLoginModalOpen(false);
          // If they close the modal without signing up, show the save prompt again
          if (pendingAnalysisData && !isAuthenticated) {
            setShowSavePrompt(true);
          }
        }}
        defaultTab="signup"
        // TODO: Add analysis linking after signup
      />
    </div>
  );
}