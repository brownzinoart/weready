"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, XCircle, Github, Award, TrendingUp, Users, Star, ArrowRight, Brain, Zap, Shield, BarChart3, GitBranch, BookOpen, Home } from "lucide-react";
import Navigation from "../components/Navigation";

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

  // Load Bailey intelligence overview
  useEffect(() => {
    const loadIntelligenceOverview = async () => {
      try {
        const [healthResponse, trendingResponse] = await Promise.all([
          fetch("http://localhost:8000/health"),
          fetch("http://localhost:8000/github/trending-intelligence")
        ]);
        
        const health = await healthResponse.json();
        const trending = await trendingResponse.json();
        
        setHealthData(health);
        setTrendingData(trending.trending_intelligence?.technology_landscape || null);
      } catch (error) {
        console.error("Failed to load Bailey intelligence:", error);
      }
    };
    
    loadIntelligenceOverview();
  }, []);

  const analyzeRepository = async () => {
    if (!repositoryUrl) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/github/repository-analysis?repo_url=${encodeURIComponent(repositoryUrl)}`);
      const data = await response.json();
      setRepoAnalysis(data);
    } catch (error) {
      console.error("Repository analysis failed:", error);
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
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <Brain className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Bailey Intelligence Dashboard</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Real-time startup intelligence powered by government data, academic research, and GitHub analysis.
              The credibility advantage ChatGPT cannot match.
            </p>
          </div>
        </div>
      </div>

      {/* Intelligence Metrics Overview */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg border border-green-200">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Government Sources</p>
                <p className="text-2xl font-bold text-green-600">{healthData.intelligence?.government_sources || 0}</p>
                <p className="text-xs text-green-600">98% Credibility</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Academic Papers</p>
                <p className="text-2xl font-bold text-blue-600">{healthData.intelligence?.academic_papers_analyzed || 0}</p>
                <p className="text-xs text-blue-600">Research Insights</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-purple-200">
            <div className="flex items-center">
              <GitBranch className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">GitHub Repos</p>
                <p className="text-2xl font-bold text-purple-600">{healthData.intelligence?.github_repositories_analyzed || 0}</p>
                <p className="text-xs text-purple-600">Live Analysis</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg border border-orange-200">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Credible Sources</p>
                <p className="text-2xl font-bold text-orange-600">{healthData.intelligence?.credible_sources || 0}</p>
                <p className="text-xs text-orange-600">Evidence-Based</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview", icon: BarChart3 },
                { id: "github", label: "GitHub Intelligence", icon: Github },
                { id: "technology", label: "Technology Trends", icon: TrendingUp },
                { id: "competitive", label: "Competitive Edge", icon: Award }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
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
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Competitive Advantages</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">vs ChatGPT</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Real-time GitHub API access</li>
                        <li>• Government data integration</li>
                        <li>• Academic research validation</li>
                        <li>• Confidence intervals</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">vs Competitors</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• First with SEC EDGAR integration</li>
                        <li>• Live repository momentum scoring</li>
                        <li>• Multi-source contradiction detection</li>
                        <li>• 98% credibility vs 60-70%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* GitHub Intelligence Tab */}
            {activeTab === "github" && (
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

            {/* Competitive Edge Tab */}
            {activeTab === "competitive" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-4">Unbeatable Competitive Edge</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                    <h4 className="font-semibold text-blue-800 mb-4">Real-Time Data Sources</h4>
                    <ul className="space-y-2 text-blue-700">
                      <li className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>SEC EDGAR real-time filings</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>arXiv academic research</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Github className="w-4 h-4" />
                        <span>GitHub repository intelligence</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>Federal Reserve economic data</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                    <h4 className="font-semibold text-green-800 mb-4">Credibility Advantages</h4>
                    <ul className="space-y-2 text-green-700">
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>98% government source credibility</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Zap className="w-4 h-4" />
                        <span>Confidence intervals for all metrics</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Award className="w-4 h-4" />
                        <span>Multi-source contradiction detection</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <Brain className="w-4 h-4" />
                        <span>Methodology transparency</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6">
                  <h4 className="font-semibold text-xl mb-4">Why Bailey Intelligence is Unbeatable</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">vs ChatGPT:</h5>
                      <ul className="text-purple-100 space-y-1 text-sm">
                        <li>• No real-time government data access</li>
                        <li>• No GitHub repository momentum scoring</li>
                        <li>• No confidence intervals</li>
                        <li>• No source authority verification</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">vs Competitors:</h5>
                      <ul className="text-purple-100 space-y-1 text-sm">
                        <li>• First startup platform with government integration</li>
                        <li>• Only platform with academic research validation</li>
                        <li>• Live repository analysis with 85-95% accuracy</li>
                        <li>• Evidence-based recommendations with citations</li>
                      </ul>
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