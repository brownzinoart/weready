"use client";
import { useState, useEffect } from "react";
import { 
  Brain, 
  Shield, 
  Zap, 
  CheckCircle,
  GitBranch,
  DollarSign,
  Target,
  Globe,
  ExternalLink,
  Palette
} from "lucide-react";

export default function HowItWorks() {
  const [stats, setStats] = useState({
    technicalDebtAccuracy: 0,
    investmentCorrelation: 0,
    evidenceSources: 0,
    marketContextFreshness: 0
  });
  

  useEffect(() => {
    // Animate counters on mount
    const animateCounter = (target: number, setter: (value: number) => void, duration: number = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setter(target);
          clearInterval(timer);
        } else {
          setter(Math.floor(start));
        }
      }, 16);
    };

    animateCounter(87, (val) => setStats(prev => ({ ...prev, technicalDebtAccuracy: val })));
    animateCounter(73, (val) => setStats(prev => ({ ...prev, investmentCorrelation: val })));
    animateCounter(15, (val) => setStats(prev => ({ ...prev, evidenceSources: val })));
    animateCounter(24, (val) => setStats(prev => ({ ...prev, marketContextFreshness: val })));
  }, []);

  const scoringCriteria = [
    {
      title: "Code Quality",
      percentage: 25,
      icon: GitBranch,
      description: "Technical architecture, security, performance, and maintainability",
      details: [
        "Code complexity and maintainability",
        "Security vulnerabilities and best practices", 
        "Performance optimization and scalability",
        "Technical debt and architectural decisions"
      ],
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Business Model",
      percentage: 25,
      icon: Target,
      description: "Market fit, monetization strategy, growth potential, and competitive positioning",
      details: [
        "Product-market fit indicators",
        "Revenue model viability",
        "Competitive advantage analysis",
        "Market size and opportunity"
      ],
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Investment Readiness",
      percentage: 25,
      icon: DollarSign,
      description: "Funding potential, team strength, traction metrics, and investor appeal",
      details: [
        "Team experience and composition",
        "Traction and growth metrics",
        "Financial projections and unit economics",
        "Investor appeal and pitch quality"
      ],
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Design & Experience",
      percentage: 25,
      icon: Palette,
      description: "User experience design, accessibility, conversion optimization, and brand design",
      details: [
        "UI/UX design quality and usability",
        "Accessibility compliance (WCAG standards)",
        "Mobile optimization and responsiveness",
        "Conversion rate optimization potential"
      ],
      color: "from-pink-500 to-rose-500"
    }
  ];


  const researchSources = [
    { name: "Y Combinator", type: "Startup Data", logo: "🚀" },
    { name: "MIT Research", type: "Academic Studies", logo: "🎓" },
    { name: "GitHub", type: "Code Analysis", logo: "📊" },
    { name: "First Round", type: "VC Insights", logo: "💡" },
    { name: "Public Filings", type: "SEC Data", logo: "📋" },
    { name: "Industry Reports", type: "Market Data", logo: "📈" }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Meet Bailey Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-violet-900 rounded-3xl shadow-2xl p-12 mb-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-purple-600/20"></div>
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Meet <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Bailey</span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed px-4">
              Your all-encompassing startup intelligence system. Bailey analyzes your code, evaluates your business idea, guides your investor readiness, and optimizes your user experience. 
              <span className="text-white font-semibold"> Starting with proven principles, evolving into sophisticated ML—you're helping us build the future </span>
              of comprehensive startup analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Globe className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Complete Startup Analysis</h3>
              <p className="text-slate-300">Code quality, business model validation, investor readiness, and design experience in one comprehensive assessment</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Multi-Dimensional Intelligence</h3>
              <p className="text-slate-300">Technical execution meets business strategy meets funding readiness meets design excellence—all analyzed together</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Evolving ML System</h3>
              <p className="text-slate-300">Bailey learns from each founder's journey across technical, business, investment, and design dimensions</p>
            </div>
          </div>
        </div>
      </div>

      {/* How We Score You */}
      <div className="mb-16">
        <h3 className="text-4xl font-bold text-center mb-4 text-slate-900">
          How We Score Your Startup
        </h3>
        <p className="text-xl text-slate-600 text-center mb-12 max-w-3xl mx-auto">
          Bailey provides comprehensive startup intelligence across four critical pillars: technical execution, 
          business model strength, investment readiness, and design experience—evolving with each founder's journey.
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {scoringCriteria.map((criteria, index) => {
            const Icon = criteria.icon;
            return (
              <div
                key={index}
                className="relative bg-white rounded-2xl shadow-xl border-2 border-slate-200 p-8"
              >
                {/* Prominent Percentage Header */}
                <div className="text-center mb-6">
                  <div className={`w-28 h-28 bg-gradient-to-r ${criteria.color} rounded-full flex flex-col items-center justify-center mx-auto mb-3 shadow-2xl`}>
                    <Icon className="w-8 h-8 text-white mb-1" />
                    <span className="text-3xl font-bold text-white">{criteria.percentage}%</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600">{criteria.percentage}% of your WeReady Score</p>
                </div>
                
                {/* Title and Description */}
                <div className="text-center mb-6 min-h-[120px] flex flex-col justify-center">
                  <h4 className="text-2xl font-bold text-slate-900 mb-3">{criteria.title}</h4>
                  <p className="text-slate-600 text-lg">{criteria.description}</p>
                </div>

                {/* Always Visible Details */}
                <div className="space-y-3">
                  <h5 className="text-lg font-semibold text-slate-900 mb-3">What We Analyze:</h5>
                  {criteria.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{detail}</span>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
        
        {/* Why These Percentages */}
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border-2 border-violet-200 p-8 text-center">
          <h4 className="text-2xl font-bold text-slate-900 mb-4">Why Equal Weightings?</h4>
          <p className="text-lg text-slate-600 max-w-4xl mx-auto mb-6">
            Each pillar receives equal weight (25%) because startup success requires excellence across all dimensions. 
            <span className="font-semibold text-violet-600">Great code with poor business models, strong ideas with weak execution, or excellent products with terrible user experiences all lead to failure.</span>
            Bailey learns how these pillars interact and evolve together for comprehensive startup intelligence.
          </p>
          <div className="flex items-center justify-center space-x-1 text-slate-500">
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">Sources: MIT Startup Genome Study, Y Combinator Research</span>
          </div>
        </div>
      </div>

      {/* Trust & Credibility */}
      <div className="mb-16">
        <h3 className="text-4xl font-bold text-center mb-4 text-slate-900">
          Why Trust WeReady Scores?
        </h3>
        <p className="text-xl text-slate-600 text-center mb-12 max-w-3xl mx-auto">
          Every recommendation is backed by evidence, not opinions. Here's the research powering your score.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Evidence Statistics */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h4 className="text-2xl font-bold text-slate-900 mb-6 text-center">Evidence-Based Accuracy</h4>
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-blue-600">Technical Intelligence</div>
                  <div className="text-sm font-medium text-slate-900">Code + Architecture Analysis</div>
                </div>
                <p className="text-sm text-slate-600">
                  Bailey analyzes code quality, technical debt, security vulnerabilities, and deployment readiness. Based on CISQ research: $2.41T annual cost of poor software quality.
                </p>
                <div className="text-xs text-slate-500 mt-1">Sources: CISQ, GitHub Analysis, Security Frameworks</div>
              </div>
              
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-green-600">Business Intelligence</div>
                  <div className="text-sm font-medium text-slate-900">Market + Model Analysis</div>
                </div>
                <p className="text-sm text-slate-600">
                  Bailey evaluates product-market fit indicators, revenue model viability, competitive positioning, and growth potential. YC companies have 70% survival rate vs 10% industry average.
                </p>
                <div className="text-xs text-slate-500 mt-1">Sources: Y Combinator, Market Research, VC Insights</div>
              </div>
              
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-purple-600">Investment Intelligence</div>
                  <div className="text-sm font-medium text-slate-900">Funding Readiness Analysis</div>
                </div>
                <p className="text-sm text-slate-600">
                  Bailey assesses team strength, traction metrics, financial projections, and investor appeal. Helping founders understand what investors actually look for.
                </p>
                <div className="text-xs text-slate-500 mt-1">Sources: VC Criteria, Funding Data, Investor Feedback</div>
              </div>
              
              <div className="border-b border-slate-200 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-pink-600">Design Intelligence</div>
                  <div className="text-sm font-medium text-slate-900">UX + Conversion Analysis</div>
                </div>
                <p className="text-sm text-slate-600">
                  Bailey evaluates user experience design, accessibility compliance, mobile optimization, and conversion potential. 70% of users abandon poorly designed experiences.
                </p>
                <div className="text-xs text-slate-500 mt-1">Sources: WCAG Standards, Google UX Research, Conversion Studies</div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-bold text-orange-600">Holistic Learning</div>
                  <div className="text-sm font-medium text-slate-900">Cross-Dimensional Insights</div>
                </div>
                <p className="text-sm text-slate-600">
                  Bailey learns how technical, business, investment, and design factors interact. Understanding that great code with weak business models, strong ideas with poor execution, or excellent products with terrible user experiences all lead to failure.
                </p>
                <div className="text-xs text-slate-500 mt-1">Methodology: Multi-dimensional pattern recognition</div>
              </div>
            </div>
          </div>

          {/* Research Sources */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h4 className="text-2xl font-bold text-slate-900 mb-8 text-center">Research Sources</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {researchSources.map((source, index) => (
                <div key={index} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 text-center border border-slate-200 hover:shadow-md transition-all">
                  <div className="w-16 h-16 bg-gradient-to-r from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 shadow-sm">
                    {source.logo}
                  </div>
                  <div className="text-base font-semibold text-slate-900 mb-2">{source.name}</div>
                  <div className="text-sm text-slate-600">{source.type}</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Bailey's Evolution:</strong> We're building toward comprehensive ML capabilities.
                </p>
                <p className="text-xs text-blue-600">
                  Current: Code analysis + business framework assessment + investment readiness checklist<br/>
                  Future: Real-time market intelligence + predictive funding success + outcome tracking across all dimensions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}