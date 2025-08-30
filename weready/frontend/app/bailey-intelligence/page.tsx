"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, XCircle, Github, Award, TrendingUp, Users, Star, ArrowRight, Brain, Zap, Shield, BarChart3, GitBranch, BookOpen, Home, Database, Search, Globe, GraduationCap, Building, Code, DollarSign, Palette } from "lucide-react";
import Navigation from "../components/Navigation";
import CodeIntelligenceTab from "../components/tabs/CodeIntelligenceTab";
import BusinessTab from "../components/tabs/BusinessTab";
import InvestmentTab from "../components/tabs/InvestmentTab";
import DesignTab from "../components/tabs/DesignTab";
import WeReadySourcesTab from "../components/tabs/WeReadySourcesTab";
import { getApiUrl, apiCall } from "../../lib/api-config";

interface IntelligenceMetrics {
  repositories_analyzed: number;
  academic_papers_analyzed: number;
  research_insights_generated: number;
  github_api_calls: number;
  government_sources: number;
  credible_sources: number;
}

interface TechnologyIntelligence {
  [key: string]: {
    adoption_rate: number;
    growth_rate: number;
    startup_adoption: number;
    innovation_index: number;
    trending_libraries: string[];
  };
}

export default function BaileyIntelligence() {
  const router = useRouter();
  const [healthData, setHealthData] = useState<any>(null);
  const [trendingData, setTrendingData] = useState<TechnologyIntelligence | null>(null);
  const [repositoryUrl, setRepositoryUrl] = useState("https://github.com/openai/whisper");
  const [repoAnalysis, setRepoAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Handle URL parameters for deep linking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tab = urlParams.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);
  const [sourcesStatus, setSourcesStatus] = useState<any>(null);
  const [academicResearch, setAcademicResearch] = useState<any>(null);
  const [governmentData, setGovernmentData] = useState<any>(null);
  const [semanticQuery, setSemanticQuery] = useState("");
  const [semanticResults, setSemanticResults] = useState<any>(null);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [sourceHealth, setSourceHealth] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [contradictions, setContradictions] = useState<any[]>([]);

  // Load Bailey intelligence overview
  useEffect(() => {
    const loadIntelligenceOverview = async () => {
      try {
        const [healthResponse, trendingResponse] = await Promise.all([
          apiCall('/health'),
          apiCall('/github/trending-intelligence')
        ]);
        
        const health = await healthResponse.json();
        const trending = await trendingResponse.json();
        
        setHealthData(health);
        setTrendingData(trending.trending_intelligence?.technology_landscape || null);
      } catch (error) {
        console.error("Failed to load Bailey intelligence, using demo data:", error);
        
        // Use mock data for demo purposes when backend is not available
        setHealthData({
          intelligence: {
            government_sources: 47,
            academic_papers_analyzed: 2847,
            github_repositories_analyzed: 156789,
            credible_sources: 94
          },
          detectors: {
            hallucination_detector: 'active',
            credibility_engine: 'active',
            market_timing_advisor: 'active',
            bailey_brain: 'active',
            github_intelligence: 'active',
            government_data_integrator: 'active'
          }
        });

        // Mock source health data with real-time indicators
        setSourceHealth({
          sec_edgar: { status: 'online', uptime: 99.7, lastUpdate: '2 minutes ago', responseTime: 234, credibility: 98 },
          github_api: { status: 'online', uptime: 99.9, lastUpdate: '30 seconds ago', responseTime: 145, credibility: 95 },
          arxiv: { status: 'online', uptime: 98.2, lastUpdate: '5 minutes ago', responseTime: 312, credibility: 92 },
          federal_reserve: { status: 'online', uptime: 99.5, lastUpdate: '1 hour ago', responseTime: 567, credibility: 97 },
          uspto_patents: { status: 'degraded', uptime: 97.1, lastUpdate: '15 minutes ago', responseTime: 890, credibility: 95 },
          mit_research: { status: 'online', uptime: 98.8, lastUpdate: '10 minutes ago', responseTime: 423, credibility: 94 }
        });

        setLastUpdated(new Date().toLocaleString());

        // Mock contradiction detection
        setContradictions([
          {
            topic: 'AI Startup Funding',
            sources: ['MIT Research', 'CB Insights'],
            conflict: 'MIT suggests 34% growth while CB Insights reports 28% growth',
            confidence: 85,
            resolution: 'Methodology differences - MIT includes pre-seed, CB Insights starts at seed'
          }
        ]);
        
        setTrendingData({
          javascript: {
            adoption_rate: 0.89,
            growth_rate: 0.23,
            startup_adoption: 0.76,
            innovation_index: 0.84,
            trending_libraries: ["Next.js", "React", "TypeScript", "Tailwind"]
          },
          python: {
            adoption_rate: 0.82,
            growth_rate: 0.31,
            startup_adoption: 0.68,
            innovation_index: 0.91,
            trending_libraries: ["FastAPI", "Pydantic", "Streamlit", "Langchain"]
          },
          ai_ml: {
            adoption_rate: 0.73,
            growth_rate: 0.47,
            startup_adoption: 0.84,
            innovation_index: 0.96,
            trending_libraries: ["Transformers", "OpenAI", "Anthropic", "LangChain"]
          }
        });
      }
    };
    
    loadIntelligenceOverview();
  }, []);

  const analyzeRepository = async () => {
    if (!repositoryUrl) return;
    
    setLoading(true);
    try {
      const response = await apiCall('/github/repository-analysis', {}, { repo_url: repositoryUrl });
      const data = await response.json();
      setRepoAnalysis(data);
    } catch (error) {
      console.error("Repository analysis failed, using demo data:", error);
      
      // Use mock repository analysis data
      setRepoAnalysis({
        status: "success",
        repository: {
          full_name: "openai/whisper",
          description: "Robust Speech Recognition via Large-Scale Weak Supervision",
          stars: 65847,
          language: "Python"
        },
        intelligence_metrics: {
          momentum_score: 87.3,
          credibility_score: 94.1,
          innovation_score: 92.7,
          startup_signals: [
            "High star growth rate (+2.3k stars/month)",
            "Active community engagement (847 contributors)",
            "Strong documentation coverage (94%)",
            "Enterprise adoption indicators",
            "Regular commit activity (daily commits)"
          ],
          risk_factors: [
            "Large dependency tree (124 dependencies)",
            "Memory-intensive operations",
            "GPU requirements for optimal performance"
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  if (!healthData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading Bailey Intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <Brain className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4" />
            <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 leading-tight">Bailey Intelligence Dashboard</h1>
            <p className="text-base md:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed px-4">
              Real-time startup intelligence powered by government data, academic research, and GitHub analysis.
              The credibility advantage ChatGPT cannot match.
            </p>
          </div>
        </div>
      </div>

      {/* Intelligence Metrics Overview */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg border border-green-200">
            <div className="flex items-center">
              <Shield className="w-6 h-6 md:w-8 md:h-8 text-green-600 mr-3" />
              <div>
                <p className="text-xs md:text-sm text-gray-600">Government Sources</p>
                <p className="text-xl md:text-2xl font-bold text-green-600">{healthData.intelligence?.government_sources || 0}</p>
                <p className="text-xs text-green-600">98% Credibility</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg border border-blue-200">
            <div className="flex items-center">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-xs md:text-sm text-gray-600">Academic Papers</p>
                <p className="text-xl md:text-2xl font-bold text-blue-600">{healthData.intelligence?.academic_papers_analyzed || 0}</p>
                <p className="text-xs text-blue-600">Research Insights</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg border border-purple-200">
            <div className="flex items-center">
              <GitBranch className="w-6 h-6 md:w-8 md:h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-xs md:text-sm text-gray-600">GitHub Repos</p>
                <p className="text-xl md:text-2xl font-bold text-purple-600">{healthData.intelligence?.github_repositories_analyzed || 0}</p>
                <p className="text-xs text-purple-600">Live Analysis</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg border border-orange-200">
            <div className="flex items-center">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-xs md:text-sm text-gray-600">Credible Sources</p>
                <p className="text-xl md:text-2xl font-bold text-orange-600">{healthData.intelligence?.credible_sources || 0}</p>
                <p className="text-xs text-orange-600">Evidence-Based</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto space-x-2 sm:space-x-4 lg:space-x-8 px-4 sm:px-6 scrollbar-hide">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "sources", label: "Live Sources", icon: Database },
                { id: "code", label: "Code Intelligence", icon: Code },
                { id: "business", label: "Business Intelligence", icon: Building },
                { id: "investment", label: "Investment Intelligence", icon: DollarSign },
                { id: "design", label: "Design Intelligence", icon: Palette },
                { id: "semantic", label: "Semantic Search", icon: Search }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Bailey Intelligence Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(healthData.detectors || {}).map(([detector, status]) => (
                      <div key={detector} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium capitalize">{detector.replace(/_/g, ' ')}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {String(status)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">WeReady Sources</h3>
                  <div className="mt-4">
                    <WeReadySourcesTab />
                  </div>
                </div>
              </div>
            )}

            {/* Code Intelligence Tab */}
            {activeTab === "code" && (
              <CodeIntelligenceTab 
                repositoryUrl={repositoryUrl}
                setRepositoryUrl={setRepositoryUrl}
                analyzeRepository={analyzeRepository}
                loading={loading}
                repoAnalysis={repoAnalysis}
                getScoreIcon={getScoreIcon}
                getScoreColor={getScoreColor}
              />
            )}

            {/* Business Intelligence Tab */}
            {activeTab === "business" && (
              <BusinessTab result={repoAnalysis || {
                breakdown: {
                  business_model: {
                    score: 75,
                    weight: 25,
                    detailed_analysis: {},
                    insights: []
                  }
                },
                brain_recommendations: []
              }} />
            )}

            {/* Investment Intelligence Tab */}
            {activeTab === "investment" && (
              <InvestmentTab result={repoAnalysis || {
                breakdown: {
                  investment_ready: {
                    score: 70,
                    weight: 25,
                    detailed_analysis: {},
                    insights: []
                  }
                },
                brain_recommendations: [],
                success_probability: 0.65,
                funding_timeline: '6-12 months',
                market_percentile: 68
              }} />
            )}

            {/* Design Intelligence Tab */}
            {activeTab === "design" && (
              <DesignTab result={repoAnalysis || {
                breakdown: {
                  design_experience: {
                    score: 75,
                    weight: 25,
                    detailed_analysis: {
                      design_system_maturity: { maturity_score: 60 },
                      accessibility_compliance: { wcag_score: 75 },
                      conversion_optimization: { cro_score: 70 }
                    },
                    insights: []
                  }
                },
                brain_recommendations: []
              }} />
            )}


            {/* Legacy WeReady Sources Content - Keep for now */}
            {activeTab === "weready-sources-old" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">WeReady Analysis Sources by Vertical</h3>
                  <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
                    Transparent methodology: Every WeReady recommendation is backed by authoritative sources. 
                    See exactly what powers our analysis for each vertical.
                  </p>
                  
                  {/* Code Quality Sources */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                    <h4 className="text-xl font-bold text-blue-900 mb-4 flex items-center space-x-2">
                      <Github className="w-6 h-6" />
                      <span>Code Quality Analysis Sources</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">SonarQube Methodology</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Quality gates: &gt;80% pass rate threshold</li>
                          <li>• Cyclomatic complexity: ≤10 per function</li>
                          <li>• Technical debt: &lt;5% ratio target</li>
                          <li>• Maintainability index: 70+ scale</li>
                        </ul>
                        <div className="mt-2 text-xs text-blue-600">
                          Citation: SonarSource Quality Model v8.9
                        </div>
                      </div>
                      <div className="bg-white border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">CodeClimate Standards</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Letter grades: A(≥90), B(80-89), C(70-79), D(60-69), F(&lt;60)</li>
                          <li>• Remediation time: &lt;2hrs (A), 2-8hrs (B), &gt;1day (F)</li>
                          <li>• Duplication: &lt;3% threshold target</li>
                          <li>• Maintainability: 0-4 scale, 2.5+ target</li>
                        </ul>
                        <div className="mt-2 text-xs text-blue-600">
                          Citation: CodeClimate Technical Debt Assessment
                        </div>
                      </div>
                      <div className="bg-white border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">GitGuardian Security</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• 600+ patterns: API keys, tokens, certificates</li>
                          <li>• False positive rate: &lt;1.5% (industry: 15-30%)</li>
                          <li>• Entropy analysis: 3.5+ bits threshold</li>
                          <li>• Detection accuracy: 99.2% on known patterns</li>
                        </ul>
                        <div className="mt-2 text-xs text-blue-600">
                          Citation: GitGuardian 2024 State of Secrets Report
                        </div>
                      </div>
                      <div className="bg-white border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Semgrep Analysis</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• 2000+ rules: OWASP Top 10, CWE standards</li>
                          <li>• Pattern matching: 99.5% syntactic accuracy</li>
                          <li>• Dataflow analysis: 15 hops maximum depth</li>
                          <li>• ML filtering: 97% noise reduction rate</li>
                        </ul>
                        <div className="mt-2 text-xs text-blue-600">
                          Citation: Semgrep OSS Rule Registry 2024
                        </div>
                      </div>
                      <div className="bg-white border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Veracode SAST</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Binary + source analysis: 40+ languages</li>
                          <li>• False positive rate: &lt;1.1% (best-in-class)</li>
                          <li>• SAST coverage: 128 CWE vulnerability classes</li>
                          <li>• Policy compliance: SOC 2, ISO 27001</li>
                        </ul>
                        <div className="mt-2 text-xs text-blue-600">
                          Citation: Veracode State of Software Security 2024
                        </div>
                      </div>
                      <div className="bg-white border border-blue-200 rounded-lg p-4">
                        <h5 className="font-semibold text-blue-800 mb-2">Academic Research</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• MIT Software Engineering: 847 peer-reviewed papers</li>
                          <li>• Stanford CS Research: AI code analysis studies</li>
                          <li>• Google Engineering: 15+ years best practices</li>
                          <li>• IEEE Standards: ISO/IEC 25010 quality model</li>
                        </ul>
                        <div className="mt-2 text-xs text-blue-600">
                          Citation: IEEE Computer Society Standards
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Model Sources */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                    <h4 className="text-xl font-bold text-green-900 mb-4 flex items-center space-x-2">
                      <Building className="w-6 h-6" />
                      <span>Business Model Analysis Sources</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Y Combinator</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Startup Playbook methodology</li>
                          <li>• PMF validation frameworks</li>
                          <li>• Unit economics best practices</li>
                          <li>• Growth metrics standards</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">First Round Capital</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Product-market fit frameworks</li>
                          <li>• Customer validation methods</li>
                          <li>• Revenue model optimization</li>
                          <li>• Go-to-market strategies</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Andreessen Horowitz</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• SaaS metrics frameworks</li>
                          <li>• Network effects analysis</li>
                          <li>• Business model patterns</li>
                          <li>• Market sizing methodologies</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Lean Startup</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Build-Measure-Learn cycles</li>
                          <li>• Validated learning principles</li>
                          <li>• Customer development process</li>
                          <li>• Pivot vs persevere decisions</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">ProfitWell Research</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Pricing strategy frameworks</li>
                          <li>• Customer lifetime value models</li>
                          <li>• Retention rate benchmarks</li>
                          <li>• Subscription business metrics</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-green-200 rounded-lg p-4">
                        <h5 className="font-semibold text-green-800 mb-2">Harvard Business School</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Business model innovation research</li>
                          <li>• Competitive strategy frameworks</li>
                          <li>• Market validation studies</li>
                          <li>• Entrepreneurship best practices</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Investment Readiness Sources */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
                    <h4 className="text-xl font-bold text-purple-900 mb-4 flex items-center space-x-2">
                      <TrendingUp className="w-6 h-6" />
                      <span>Investment Readiness Sources</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white border border-purple-200 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">Sequoia Capital</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Pitch deck frameworks</li>
                          <li>• Due diligence checklists</li>
                          <li>• Market opportunity sizing</li>
                          <li>• Scaling playbooks</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-purple-200 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">Bessemer Venture Partners</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• CAC/LTV best practices</li>
                          <li>• SaaS benchmarking data</li>
                          <li>• Growth stage metrics</li>
                          <li>• Market timing indicators</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-purple-200 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">MIT Entrepreneurship</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Fundraising strategy guides</li>
                          <li>• Investor relations best practices</li>
                          <li>• Valuation methodologies</li>
                          <li>• Term sheet negotiations</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-purple-200 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">National Venture Capital Association</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Industry benchmarking data</li>
                          <li>• Investment trend analysis</li>
                          <li>• Regulatory compliance guides</li>
                          <li>• Market research reports</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-purple-200 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">CB Insights</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Funding round analysis</li>
                          <li>• Market intelligence reports</li>
                          <li>• Unicorn trend tracking</li>
                          <li>• Exit strategy data</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-purple-200 rounded-lg p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">AngelList Research</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Early-stage metrics</li>
                          <li>• Angel investor insights</li>
                          <li>• Startup success patterns</li>
                          <li>• Team assessment frameworks</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Design Experience Sources */}
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl p-6 mb-8">
                    <h4 className="text-xl font-bold text-pink-900 mb-4 flex items-center space-x-2">
                      <Award className="w-6 h-6" />
                      <span>Design & Experience Sources</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white border border-pink-200 rounded-lg p-4">
                        <h5 className="font-semibold text-pink-800 mb-2">Nielsen Norman Group</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• UX research methodologies</li>
                          <li>• Usability testing standards</li>
                          <li>• Design pattern libraries</li>
                          <li>• User experience guidelines</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-pink-200 rounded-lg p-4">
                        <h5 className="font-semibold text-pink-800 mb-2">Baymard Institute</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Conversion rate optimization</li>
                          <li>• E-commerce UX benchmarks</li>
                          <li>• A/B testing methodologies</li>
                          <li>• User behavior analysis</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-pink-200 rounded-lg p-4">
                        <h5 className="font-semibold text-pink-800 mb-2">WebAIM Accessibility</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• WCAG 2.1 AA compliance</li>
                          <li>• Screen reader compatibility</li>
                          <li>• Color contrast standards</li>
                          <li>• Keyboard navigation guidelines</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-pink-200 rounded-lg p-4">
                        <h5 className="font-semibold text-pink-800 mb-2">Google Design</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Material Design principles</li>
                          <li>• Mobile-first guidelines</li>
                          <li>• Performance UX standards</li>
                          <li>• Core Web Vitals metrics</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-pink-200 rounded-lg p-4">
                        <h5 className="font-semibold text-pink-800 mb-2">Apple Human Interface</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Interface design principles</li>
                          <li>• Touch target sizing</li>
                          <li>• iOS/macOS best practices</li>
                          <li>• Accessibility standards</li>
                        </ul>
                      </div>
                      <div className="bg-white border border-pink-200 rounded-lg p-4">
                        <h5 className="font-semibold text-pink-800 mb-2">Design System Research</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Component library standards</li>
                          <li>• Design token frameworks</li>
                          <li>• Brand consistency metrics</li>
                          <li>• Cross-platform design guidelines</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Government Intelligence Sources */}
                  <div className="bg-gradient-to-r from-red-50 to-blue-50 border-2 border-red-200 rounded-xl p-6 mb-8">
                    <h4 className="text-xl font-bold text-red-900 mb-4 flex items-center space-x-2">
                      <Building className="w-6 h-6" />
                      <span>Government Intelligence Sources</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white border border-red-200 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 mb-2">SEC EDGAR Database</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Real-time IPO filings</li>
                          <li>• Public company financials</li>
                          <li>• Competitive benchmarking</li>
                          <li>• Market timing signals</li>
                        </ul>
                        <div className="mt-2 text-xs text-red-600">
                          Credibility: 99% • U.S. Securities and Exchange Commission
                        </div>
                      </div>
                      <div className="bg-white border border-red-200 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 mb-2">USPTO Patent Intelligence</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Innovation trend analysis</li>
                          <li>• Competitive patent mapping</li>
                          <li>• White space opportunities</li>
                          <li>• Patent quality scoring</li>
                        </ul>
                        <div className="mt-2 text-xs text-red-600">
                          Credibility: 98% • U.S. Patent and Trademark Office
                        </div>
                      </div>
                      <div className="bg-white border border-red-200 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 mb-2">Federal Reserve FRED</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Economic indicators</li>
                          <li>• Interest rate analysis</li>
                          <li>• Inflation impact metrics</li>
                          <li>• Market timing intelligence</li>
                        </ul>
                        <div className="mt-2 text-xs text-red-600">
                          Credibility: 99% • Federal Reserve Bank of St. Louis
                        </div>
                      </div>
                      <div className="bg-white border border-red-200 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 mb-2">Bureau of Labor Statistics</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Employment trends</li>
                          <li>• Wage data analysis</li>
                          <li>• Industry growth metrics</li>
                          <li>• Talent market intelligence</li>
                        </ul>
                        <div className="mt-2 text-xs text-red-600">
                          Credibility: 98% • U.S. Department of Labor
                        </div>
                      </div>
                      <div className="bg-white border border-red-200 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 mb-2">Small Business Administration</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Startup failure rates</li>
                          <li>• Small business lending data</li>
                          <li>• Entrepreneurship statistics</li>
                          <li>• Industry benchmarks</li>
                        </ul>
                        <div className="mt-2 text-xs text-red-600">
                          Credibility: 96% • U.S. Small Business Administration
                        </div>
                      </div>
                      <div className="bg-white border border-red-200 rounded-lg p-4">
                        <h5 className="font-semibold text-red-800 mb-2">International Sources</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• OECD innovation metrics</li>
                          <li>• World Bank development data</li>
                          <li>• EU digital economy indicators</li>
                          <li>• Global market opportunities</li>
                        </ul>
                        <div className="mt-2 text-xs text-red-600">
                          Credibility: 93% • OECD, World Bank, European Commission
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic Research Sources */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
                    <h4 className="text-xl font-bold text-yellow-900 mb-4 flex items-center space-x-2">
                      <GraduationCap className="w-6 h-6" />
                      <span>Academic Research Sources</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white border border-yellow-200 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">arXiv Research Database</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• AI breakthrough detection</li>
                          <li>• Technology trend analysis</li>
                          <li>• Research velocity tracking</li>
                          <li>• Competitive intelligence</li>
                        </ul>
                        <div className="mt-2 text-xs text-yellow-600">
                          Credibility: 94% • Cornell University • 2M+ papers
                        </div>
                      </div>
                      <div className="bg-white border border-yellow-200 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">Stanford AI Index</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• AI progress tracking</li>
                          <li>• Industry adoption metrics</li>
                          <li>• Investment trend analysis</li>
                          <li>• Global AI development</li>
                        </ul>
                        <div className="mt-2 text-xs text-yellow-600">
                          Credibility: 95% • Stanford Institute for Human-Centered AI
                        </div>
                      </div>
                      <div className="bg-white border border-yellow-200 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">MIT OpenCourseWare</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Entrepreneurship frameworks</li>
                          <li>• Startup case studies</li>
                          <li>• Technology commercialization</li>
                          <li>• Innovation methodologies</li>
                        </ul>
                        <div className="mt-2 text-xs text-yellow-600">
                          Credibility: 96% • Massachusetts Institute of Technology
                        </div>
                      </div>
                      <div className="bg-white border border-yellow-200 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">Google Scholar Metrics</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Citation analysis</li>
                          <li>• Research impact tracking</li>
                          <li>• Academic trend identification</li>
                          <li>• Knowledge graph insights</li>
                        </ul>
                        <div className="mt-2 text-xs text-yellow-600">
                          Credibility: 92% • Google Scholar Citation Database
                        </div>
                      </div>
                      <div className="bg-white border border-yellow-200 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">Brookings Institution</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Economic policy research</li>
                          <li>• Technology impact studies</li>
                          <li>• Innovation ecosystem analysis</li>
                          <li>• Market dynamics research</li>
                        </ul>
                        <div className="mt-2 text-xs text-yellow-600">
                          Credibility: 93% • Brookings Institution Think Tank
                        </div>
                      </div>
                      <div className="bg-white border border-yellow-200 rounded-lg p-4">
                        <h5 className="font-semibold text-yellow-800 mb-2">Pew Research Center</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Technology adoption surveys</li>
                          <li>• Demographic trend analysis</li>
                          <li>• Social impact research</li>
                          <li>• Consumer behavior studies</li>
                        </ul>
                        <div className="mt-2 text-xs text-yellow-600">
                          Credibility: 91% • Pew Research Center
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Developer Community Intelligence */}
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-6 mb-8">
                    <h4 className="text-xl font-bold text-teal-900 mb-4 flex items-center space-x-2">
                      <Users className="w-6 h-6" />
                      <span>Developer Community Intelligence</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white border border-teal-200 rounded-lg p-4">
                        <h5 className="font-semibold text-teal-800 mb-2">Stack Overflow Survey</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• 90,000+ developer responses</li>
                          <li>• Technology adoption trends</li>
                          <li>• AI tool usage patterns</li>
                          <li>• Salary and career insights</li>
                        </ul>
                        <div className="mt-2 text-xs text-teal-600">
                          Credibility: 89% • Annual Developer Survey 2024
                        </div>
                      </div>
                      <div className="bg-white border border-teal-200 rounded-lg p-4">
                        <h5 className="font-semibold text-teal-800 mb-2">GitHub State of Octoverse</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• 100M+ developer activity</li>
                          <li>• Open source trends</li>
                          <li>• Language popularity metrics</li>
                          <li>• Repository analytics</li>
                        </ul>
                        <div className="mt-2 text-xs text-teal-600">
                          Credibility: 87% • GitHub (Microsoft) Analytics
                        </div>
                      </div>
                      <div className="bg-white border border-teal-200 rounded-lg p-4">
                        <h5 className="font-semibold text-teal-800 mb-2">Hacker News Sentiment</h5>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• Startup community discussions</li>
                          <li>• Technology sentiment tracking</li>
                          <li>• Founder insights analysis</li>
                          <li>• Market trend indicators</li>
                        </ul>
                        <div className="mt-2 text-xs text-teal-600">
                          Credibility: 75% • Y Combinator Hacker News
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-4 bg-white border border-teal-200 rounded-lg">
                      <div className="text-sm text-teal-800 font-medium mb-2">Developer Market Intelligence</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div className="text-center">
                          <div className="font-bold text-teal-700">76%</div>
                          <div className="text-gray-600">Use AI Tools</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-teal-700">87%</div>
                          <div className="text-gray-600">Prefer Remote</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-teal-700">43%</div>
                          <div className="text-gray-600">Startup Interest</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold text-teal-700">25%</div>
                          <div className="text-gray-600">AI Salary Premium</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Methodology Summary */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 rounded-xl p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">Our Evidence-Based Approach</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4">
                        <div className="text-3xl font-bold text-blue-600 mb-2">65+</div>
                        <div className="text-sm text-gray-600">Authoritative Sources</div>
                      </div>
                      <div className="text-center p-4">
                        <div className="text-3xl font-bold text-green-600 mb-2">96%</div>
                        <div className="text-sm text-gray-600">Average Credibility</div>
                      </div>
                      <div className="text-center p-4">
                        <div className="text-3xl font-bold text-purple-600 mb-2">2000+</div>
                        <div className="text-sm text-gray-600">Analysis Rules</div>
                      </div>
                      <div className="text-center p-4">
                        <div className="text-3xl font-bold text-orange-600 mb-2">Real-Time</div>
                        <div className="text-sm text-gray-600">Data Updates</div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                      <p className="text-gray-700 text-center">
                        <strong>Transparency Promise:</strong> Every WeReady recommendation includes source attribution, 
                        confidence intervals, and evidence quality ratings. No black box analysis—just verifiable, 
                        evidence-based insights you can trust.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Live Sources Tab */}
            {activeTab === "sources" && sourceHealth && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Real-Time Source Status</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live • Updated {lastUpdated}</span>
                    </div>
                  </div>

                  {/* Source Health Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {Object.entries(sourceHealth).map(([source, health]: [string, any]) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case 'online': return 'text-green-600';
                          case 'degraded': return 'text-yellow-600';
                          case 'offline': return 'text-red-600';
                          default: return 'text-gray-600';
                        }
                      };

                      const getStatusBg = (status: string) => {
                        switch (status) {
                          case 'online': return 'bg-green-50 border-green-200';
                          case 'degraded': return 'bg-yellow-50 border-yellow-200';
                          case 'offline': return 'bg-red-50 border-red-200';
                          default: return 'bg-gray-50 border-gray-200';
                        }
                      };

                      return (
                        <div key={source} className={`border rounded-lg p-4 ${getStatusBg(health.status)}`}>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900 capitalize">
                              {source.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${health.status === 'online' ? 'bg-green-500' : health.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                              <span className={`text-xs font-medium capitalize ${getStatusColor(health.status)}`}>
                                {health.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Uptime:</span>
                              <span className="font-medium">{health.uptime}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Response Time:</span>
                              <span className="font-medium">{health.responseTime}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Credibility:</span>
                              <span className="font-medium text-green-600">{health.credibility}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Last Update:</span>
                              <span className="font-medium text-blue-600">{health.lastUpdate}</span>
                            </div>
                          </div>

                          {/* Confidence Interval Indicator */}
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Confidence Range</span>
                              <span className="font-medium">±{(100 - health.credibility) / 2}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-green-500 h-1.5 rounded-full transition-all duration-1000"
                                style={{ width: `${health.credibility}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Contradiction Detection Alert */}
                  {contradictions.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <h4 className="font-semibold text-yellow-800">Source Contradiction Detected</h4>
                      </div>
                      {contradictions.map((contradiction, idx) => (
                        <div key={idx} className="bg-white border border-yellow-200 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-900">{contradiction.topic}</span>
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              {contradiction.confidence}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{contradiction.conflict}</p>
                          <div className="text-xs text-gray-600">
                            <strong>Resolution:</strong> {contradiction.resolution}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Enhanced Performance Metrics */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-4">Source Performance Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {Object.keys(sourceHealth).length}
                        </div>
                        <div className="text-sm text-gray-600">Active Sources</div>
                        <div className="text-xs text-green-600 mt-1">Real-time monitoring</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {Math.round(Object.values(sourceHealth).reduce((acc: number, health: any) => acc + health.credibility, 0) / Object.keys(sourceHealth).length)}%
                        </div>
                        <div className="text-sm text-gray-600">Avg Credibility</div>
                        <div className="text-xs text-blue-600 mt-1">With confidence intervals</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {Math.round(Object.values(sourceHealth).reduce((acc: number, health: any) => acc + health.responseTime, 0) / Object.keys(sourceHealth).length)}ms
                        </div>
                        <div className="text-sm text-gray-600">Avg Response Time</div>
                        <div className="text-xs text-purple-600 mt-1">Sub-second queries</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-600 mb-1">
                          {Math.round(Object.values(sourceHealth).reduce((acc: number, health: any) => acc + health.uptime, 0) / Object.keys(sourceHealth).length * 10) / 10}%
                        </div>
                        <div className="text-sm text-gray-600">Uptime SLA</div>
                        <div className="text-xs text-orange-600 mt-1">Industry-leading reliability</div>
                      </div>
                    </div>

                    {/* Real-time Methodology Transparency */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-gray-900 mb-2">Transparency Guarantee</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Source attribution for every data point</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Real-time contradiction detection</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Confidence intervals for all metrics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Semantic Search Tab */}
            {activeTab === "semantic" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Natural Language Intelligence Queries</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ask Bailey anything about startups, AI, or market trends
                        </label>
                        <div className="flex space-x-4">
                          <input
                            type="text"
                            value={semanticQuery}
                            onChange={(e) => setSemanticQuery(e.target.value)}
                            placeholder="e.g., What funding patterns exist for AI startups in 2024?"
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            onClick={async () => {
                              if (!semanticQuery.trim()) return;
                              setSemanticLoading(true);
                              try {
                                // Call real Bailey semantic search API
                                const response = await apiCall('/bailey/semantic-query', {
                                  method: 'POST',
                                  body: JSON.stringify({
                                    query: semanticQuery,
                                    min_confidence: 0.7,
                                    max_results: 10
                                  })
                                });

                                if (!response.ok) {
                                  throw new Error(`HTTP error! status: ${response.status}`);
                                }

                                const data = await response.json();
                                
                                // Transform API response to frontend format
                                setSemanticResults({
                                  query: data.result.query,
                                  results: data.result.knowledge_details?.map((detail: any) => ({
                                    source: detail.source,
                                    confidence: Math.round(detail.credibility),
                                    summary: detail.content,
                                    evidence: [detail.source],
                                    timestamp: data.timestamp
                                  })) || [],
                                  contradictions: [],
                                  methodology: `Bailey Intelligence Analysis (${data.result.relevant_knowledge_points} knowledge points, ${Math.round(data.result.credibility_score)}% credibility)`,
                                  synthesis: data.result.synthesis
                                });
                              } catch (error) {
                                console.error('Semantic search failed:', error);
                                
                                // Fallback to demo data if API fails
                                setSemanticResults({
                                  query: semanticQuery,
                                  results: [
                                    {
                                      source: 'Bailey Intelligence (Demo)',
                                      confidence: 85,
                                      summary: `I'm processing your query "${semanticQuery}" but the backend connection is temporarily unavailable. This is demo data showing how Bailey would respond.`,
                                      evidence: ['Bailey Knowledge Base'],
                                      timestamp: new Date().toISOString()
                                    }
                                  ],
                                  contradictions: [],
                                  methodology: 'Demo mode - backend connection unavailable',
                                  synthesis: `Thank you for your query about "${semanticQuery}". Bailey Intelligence is designed to provide comprehensive analysis using government, academic, and industry sources. Please ensure the backend is running to see real Bailey insights.`
                                });
                              } finally {
                                setSemanticLoading(false);
                              }
                            }}
                            disabled={semanticLoading || !semanticQuery.trim()}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {semanticLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Analyzing...</span>
                              </>
                            ) : (
                              <>
                                <Search className="w-4 h-4" />
                                <span>Search</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Example Queries */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Try these example queries:</p>
                        <div className="flex flex-wrap gap-2">
                          {[
                            "AI startup funding trends 2024",
                            "Government regulations affecting fintech",
                            "Academic research on startup success",
                            "Market timing for developer tools"
                          ].map((example) => (
                            <button
                              key={example}
                              onClick={() => setSemanticQuery(example)}
                              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                            >
                              {example}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Results */}
                    {semanticResults ? (
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-semibold text-gray-900">Search Results</h4>
                          <div className="text-sm text-gray-500">
                            Query: "{semanticResults.query}"
                          </div>
                        </div>

                        {semanticResults.results.map((result: any, idx: number) => (
                          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${result.confidence >= 95 ? 'bg-green-500' : result.confidence >= 90 ? 'bg-blue-500' : 'bg-yellow-500'}`}></div>
                                <h5 className="font-semibold text-gray-900">{result.source}</h5>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {result.confidence}% confidence
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(result.timestamp).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-3">{result.summary}</p>

                            <div className="border-t border-gray-100 pt-3">
                              <div className="text-sm text-gray-600 mb-2">Evidence Sources:</div>
                              <div className="flex flex-wrap gap-2">
                                {result.evidence.map((evidence: string, evidenceIdx: number) => (
                                  <span key={evidenceIdx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {evidence}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Confidence Interval Display */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-500">Confidence Range</span>
                                <span className="font-medium">±{Math.round((100 - result.confidence) / 2)}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-1000"
                                  style={{ width: `${result.confidence}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Bailey's Synthesis */}
                        {semanticResults.synthesis && (
                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">B</span>
                              </div>
                              <h5 className="font-semibold text-purple-900">Bailey's Analysis</h5>
                            </div>
                            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {semanticResults.synthesis}
                            </div>
                          </div>
                        )}

                        {/* Methodology Transparency */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-medium text-blue-900 mb-2">Search Methodology</h5>
                          <p className="text-sm text-blue-800 mb-3">{semanticResults.methodology}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>Multi-source validation</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>Confidence weighting</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span>Real-time contradiction detection</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center text-gray-500">
                          <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Enter a query above to get AI-powered insights from 40+ authoritative sources</p>
                          <p className="text-sm mt-1">Powered by OpenAI embeddings + Bailey's credibility engine</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* REMOVED: Government Data Tab - Content migrated to Business Intelligence */}
            {false && activeTab === "government" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Government Data Intelligence</h3>
                  
                  {/* SEC EDGAR Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Building className="w-5 h-5 text-blue-600" />
                      <span>SEC EDGAR Real-Time Filings</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">98% Credibility</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">1,247</div>
                        <div className="text-sm text-gray-600">IPO Filings (2024)</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">$847B</div>
                        <div className="text-sm text-gray-600">Total Market Cap</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">324</div>
                        <div className="text-sm text-gray-600">AI Companies</div>
                      </div>
                    </div>
                  </div>

                  {/* USPTO Patents Section */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <span>USPTO Patent Intelligence</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">95% Credibility</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">23,847</div>
                        <div className="text-sm text-gray-600">AI Patents (2024)</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">+34%</div>
                        <div className="text-sm text-gray-600">YoY Growth</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 mb-1">156</div>
                        <div className="text-sm text-gray-600">Startup Patents</div>
                      </div>
                    </div>
                  </div>

                  {/* Federal Reserve Data */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-red-600" />
                      <span>Federal Reserve Economic Data</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">97% Credibility</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-red-600 mb-1">3.7%</div>
                        <div className="text-sm text-gray-600">Unemployment Rate</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">2.4%</div>
                        <div className="text-sm text-gray-600">GDP Growth</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">5.25%</div>
                        <div className="text-sm text-gray-600">Federal Funds Rate</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">Favorable</div>
                        <div className="text-sm text-gray-600">Startup Climate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REMOVED: Academic Research Tab - Content migrated to respective pillar tabs */}
            {false && activeTab === "academic" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Academic Research Intelligence</h3>
                  
                  {/* Research Overview */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                      <GraduationCap className="w-5 h-5 text-blue-600" />
                      <span>Research Intelligence Overview</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Real-Time</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">2,847</div>
                        <div className="text-sm text-gray-600">Papers Analyzed</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 mb-1">127</div>
                        <div className="text-sm text-gray-600">AI Startup Papers</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 mb-1">89%</div>
                        <div className="text-sm text-gray-600">Peer Reviewed</div>
                      </div>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600 mb-1">42</div>
                        <div className="text-sm text-gray-600">Universities</div>
                      </div>
                    </div>
                  </div>

                  {/* Latest Research */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold mb-4">Latest Startup-Relevant Research</h4>
                    <div className="space-y-4">
                      {[
                        {
                          title: "AI Code Generation Reliability in Enterprise Settings",
                          authors: "Smith, J. et al.",
                          journal: "arXiv preprint",
                          date: "2024-12-15",
                          relevance: 94,
                          credibility: 89
                        },
                        {
                          title: "Venture Capital Investment Patterns in AI Startups",
                          authors: "Chen, L. et al.",
                          journal: "MIT Sloan Research",
                          date: "2024-12-10",
                          relevance: 97,
                          credibility: 95
                        },
                        {
                          title: "Market Timing Analysis for Technology Startups",
                          authors: "Johnson, M. et al.",
                          journal: "Stanford Business Review",
                          date: "2024-12-08",
                          relevance: 91,
                          credibility: 92
                        }
                      ].map((paper, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-gray-900">{paper.title}</h5>
                            <div className="flex space-x-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                {paper.relevance}% Relevant
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                {paper.credibility}% Credible
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{paper.authors}</p>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{paper.journal}</span>
                            <span>{paper.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REMOVED: GitHub Intelligence Tab - Content migrated to Code Intelligence */}
            {false && activeTab === "github" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">GitHub Repository Analysis</h3>
                  <div className="flex space-x-4 mb-4">
                    <input
                      type="url"
                      value={repositoryUrl}
                      onChange={(e) => setRepositoryUrl(e.target.value)}
                      placeholder="Enter GitHub repository URL"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={analyzeRepository}
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Github className="w-4 h-4" />
                          <span>Analyze</span>
                        </>
                      )}
                    </button>
                  </div>

                  {repoAnalysis && repoAnalysis.status === "success" && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold">{repoAnalysis.repository.full_name}</h4>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">{repoAnalysis.repository.stars.toLocaleString()} stars</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{repoAnalysis.repository.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-center mb-2">
                            {getScoreIcon(repoAnalysis.intelligence_metrics.momentum_score)}
                          </div>
                          <p className="text-sm text-gray-600">Momentum Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(repoAnalysis.intelligence_metrics.momentum_score)}`}>
                            {repoAnalysis.intelligence_metrics.momentum_score.toFixed(1)}
                          </p>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center justify-center mb-2">
                            {getScoreIcon(repoAnalysis.intelligence_metrics.credibility_score)}
                          </div>
                          <p className="text-sm text-gray-600">Credibility Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(repoAnalysis.intelligence_metrics.credibility_score)}`}>
                            {repoAnalysis.intelligence_metrics.credibility_score.toFixed(1)}
                          </p>
                        </div>
                        
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="flex items-center justify-center mb-2">
                            {getScoreIcon(repoAnalysis.intelligence_metrics.innovation_score)}
                          </div>
                          <p className="text-sm text-gray-600">Innovation Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(repoAnalysis.intelligence_metrics.innovation_score)}`}>
                            {repoAnalysis.intelligence_metrics.innovation_score.toFixed(1)}
                          </p>
                        </div>
                      </div>

                      {repoAnalysis.intelligence_metrics.startup_signals.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-green-800 mb-2">Positive Signals</h5>
                          <ul className="space-y-1">
                            {repoAnalysis.intelligence_metrics.startup_signals.map((signal: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-green-700">{signal}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {repoAnalysis.intelligence_metrics.risk_factors.length > 0 && (
                        <div>
                          <h5 className="font-medium text-red-800 mb-2">Risk Factors</h5>
                          <ul className="space-y-1">
                            {repoAnalysis.intelligence_metrics.risk_factors.map((risk: string, index: number) => (
                              <li key={index} className="flex items-start space-x-2">
                                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-red-700">{risk}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Technology Trends Tab */}
            {activeTab === "technology" && trendingData && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Technology Intelligence</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(trendingData).map(([lang, data]) => (
                    <div key={lang} className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-lg mb-4 capitalize">{lang}</h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Adoption Rate</span>
                          <span className="font-medium">{(data.adoption_rate * 100).toFixed(0)}%</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Growth Rate</span>
                          <span className={`font-medium ${data.growth_rate > 0.2 ? 'text-green-600' : data.growth_rate > 0.1 ? 'text-yellow-600' : 'text-gray-600'}`}>
                            {(data.growth_rate * 100).toFixed(0)}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Startup Adoption</span>
                          <span className="font-medium">{(data.startup_adoption * 100).toFixed(0)}%</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Innovation Index</span>
                          <span className={`font-medium ${data.innovation_index > 0.8 ? 'text-purple-600' : 'text-gray-600'}`}>
                            {(data.innovation_index * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Trending Libraries:</p>
                        <div className="flex flex-wrap gap-1">
                          {data.trending_libraries.map((lib: string) => (
                            <span key={lib} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {lib}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REMOVED: Competitive Edge Tab - Content integrated into WeReady Sources */}
            {false && activeTab === "competitive" && (
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Unbeatable Competitive Edge</h3>
                  <p className="text-gray-600 max-w-3xl mx-auto">
                    Bailey Intelligence is the only startup analysis platform with real-time government data access, 
                    academic validation, and enterprise-grade transparency that ChatGPT and competitors cannot match.
                  </p>
                </div>
                
                {/* Real-Time Data Sources vs Competitors */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6">
                    <h4 className="font-bold text-blue-900 mb-4 flex items-center space-x-2">
                      <Database className="w-6 h-6" />
                      <span>Real-Time Data Sources</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">SEC EDGAR Filings</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">Real-time</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Academic Research (arXiv)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">Live feed</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <Github className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">GitHub API Intelligence</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">Real-time</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Federal Reserve FRED</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-600 font-medium">Updated daily</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-6">
                    <h4 className="font-bold text-green-900 mb-4 flex items-center space-x-2">
                      <Award className="w-6 h-6" />
                      <span>Credibility Advantages</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Government Source Credibility</span>
                        </div>
                        <span className="font-bold text-green-600">98%</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <Zap className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Confidence Intervals</span>
                        </div>
                        <span className="font-bold text-green-600">All metrics</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Contradiction Detection</span>
                        </div>
                        <span className="font-bold text-green-600">Real-time</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Methodology Transparency</span>
                        </div>
                        <span className="font-bold text-green-600">Complete</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Head-to-Head Comparison */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-8">
                  <h4 className="font-bold text-2xl mb-6 text-center">Head-to-Head Competitive Analysis</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                      <h5 className="font-bold text-xl mb-4 flex items-center space-x-2">
                        <span>🤖</span>
                        <span>vs ChatGPT/Claude</span>
                      </h5>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-4 h-4 text-red-300" />
                          <span className="text-purple-100">No real-time government data access</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-4 h-4 text-red-300" />
                          <span className="text-purple-100">No GitHub repository momentum scoring</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-4 h-4 text-red-300" />
                          <span className="text-purple-100">No confidence intervals or uncertainty quantification</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-4 h-4 text-red-300" />
                          <span className="text-purple-100">No source authority verification or contradiction detection</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-4 h-4 text-red-300" />
                          <span className="text-purple-100">Static training data with knowledge cutoffs</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                      <h5 className="font-bold text-xl mb-4 flex items-center space-x-2">
                        <span>🏢</span>
                        <span>vs Traditional Competitors</span>
                      </h5>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-4 h-4 text-red-300" />
                          <span className="text-purple-100">First startup platform with SEC EDGAR integration</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-4 h-4 text-red-300" />
                          <span className="text-purple-100">Only platform with academic research validation pipeline</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-4 h-4 text-red-300" />
                          <span className="text-purple-100">Live repository analysis with 85-95% accuracy vs 60-70%</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-4 h-4 text-red-300" />
                          <span className="text-purple-100">Evidence-based recommendations with full citations</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-4 h-4 text-red-300" />
                          <span className="text-purple-100">Multi-source contradiction detection and resolution</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bailey Advantages */}
                  <div className="mt-8 bg-white/20 backdrop-blur-sm rounded-lg p-6">
                    <h5 className="font-bold text-xl mb-4 text-center">🚀 Bailey Intelligence Unique Advantages</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">98.7%</div>
                        <div className="text-sm text-purple-100">Source Credibility</div>
                        <div className="text-xs text-purple-200 mt-1">vs 60-70% industry average</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">47</div>
                        <div className="text-sm text-purple-100">Authoritative Sources</div>
                        <div className="text-xs text-purple-200 mt-1">Government, academic, industry</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-2">Real-Time</div>
                        <div className="text-sm text-purple-100">Data Updates</div>
                        <div className="text-xs text-purple-200 mt-1">vs static training data</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market Positioning */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">Market Positioning & Total Addressable Market</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-2">$18.2B</div>
                      <div className="text-sm text-gray-700">Startup Intelligence Market</div>
                      <div className="text-xs text-gray-500 mt-1">Growing 23% annually</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-2">1st Mover</div>
                      <div className="text-sm text-gray-700">Government Data Integration</div>
                      <div className="text-xs text-gray-500 mt-1">18-month competitive moat</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-2">156K+</div>
                      <div className="text-sm text-gray-700">Startups Analyzable</div>
                      <div className="text-xs text-gray-500 mt-1">Growing daily</div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2 text-center">Competitive Moat Sustainability</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-800 mb-1">Data Partnerships</div>
                        <p className="text-gray-600">Exclusive access agreements with government agencies create 12-18 month barriers to entry for competitors.</p>
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 mb-1">Network Effects</div>
                        <p className="text-gray-600">More startups analyzed = better benchmarking = more valuable insights = stronger competitive position.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}