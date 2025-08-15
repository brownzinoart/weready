'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Award, Star, Brain, BarChart3, Calendar, Building, Zap, Clock, TrendingUp, CheckCircle, AlertTriangle, ExternalLink, Github, Target, DollarSign } from 'lucide-react';

export default function ResultsPage() {
  const [result, setResult] = useState<any>(null);
  const [isMockData, setIsMockData] = useState(false);
  const [expandedRecommendations, setExpandedRecommendations] = useState<{[key: string]: boolean}>({});
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    console.log("=== RESULTS PAGE DEBUG ===");
    
    // Try to get data from sessionStorage first
    const dataId = searchParams.get('id');
    const currentResultId = sessionStorage.getItem('weready_current_result');
    const isMockStored = sessionStorage.getItem('weready_is_mock') === 'true';
    
    console.log("URL dataId:", dataId);
    console.log("SessionStorage currentResultId:", currentResultId);
    console.log("Is mock data:", isMockStored);
    
    let resultData = null;
    
    // Try to load data using the ID from URL or current result
    const idToUse = dataId || currentResultId;
    if (idToUse) {
      try {
        const storedData = sessionStorage.getItem(idToUse);
        if (storedData) {
          resultData = JSON.parse(storedData);
          console.log("Successfully loaded data from sessionStorage");
        }
      } catch (error) {
        console.error('Error parsing sessionStorage data:', error);
      }
    }
    
    // Fallback: try old URL parameter method for backwards compatibility
    if (!resultData) {
      const urlResultData = searchParams.get('data');
      if (urlResultData) {
        try {
          resultData = JSON.parse(decodeURIComponent(urlResultData));
          const isMock = searchParams.get('mock') === 'true';
          setIsMockData(isMock);
          console.log("Loaded data from URL parameters (fallback)");
        } catch (error) {
          console.error('Error parsing URL result data:', error);
        }
      }
    }
    
    if (resultData) {
      setResult(resultData);
      setIsMockData(isMockStored);
      console.log("Result data set successfully");
    } else {
      console.log("No result data found, redirecting to home");
      router.push('/');
    }
    
    console.log("=== END RESULTS PAGE DEBUG ===");
  }, [searchParams, router]);

  const toggleRecommendation = (recId: string) => {
    setExpandedRecommendations(prev => ({
      ...prev,
      [recId]: !prev[recId]
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'medium': return 'border-blue-200 bg-blue-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVerdictDisplay = (verdict: string, score: number) => {
    switch (verdict) {
      case 'ready_to_ship':
        return { emoji: '🚀', text: 'Ready to Ship', color: 'text-green-600' };
      case 'needs_work':
        return { emoji: '📈', text: 'Development Stage', color: 'text-yellow-600' };
      case 'critical_issues':
        return { emoji: '🛠️', text: 'Pre-Launch Review', color: 'text-red-600' };
      default:
        return { emoji: '⚠️', text: 'Major Issues Found', color: 'text-red-600' };
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your WeReady analysis...</p>
        </div>
      </div>
    );
  }

  const verdictInfo = getVerdictDisplay(result.verdict, result.overall_score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation Header */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-slate-600 hover:text-violet-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Analysis</span>
              </button>
              <div className="h-6 w-px bg-slate-300 hidden sm:block"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">WeReady</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-600 hover:text-slate-900 font-medium transition-colors">Login</button>
              <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-medium px-6 py-2 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-slate-500 mb-8">
          <button onClick={() => router.push('/')} className="hover:text-violet-600 transition-colors">Home</button>
          <span>/</span>
          <span className="text-slate-900 font-medium">Analysis Results</span>
        </div>

        <div className="space-y-8">
          {/* Mock Data Indicator */}
          {isMockData && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Star className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-semibold">Demo Report - Comprehensive WeReady Analysis</span>
                <Star className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-blue-700 text-sm mt-1">This is a demonstration of our full analysis capabilities</p>
            </div>
          )}

          {/* Main Score Display */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center">
            <div className={`text-8xl font-bold mb-4 transition-all duration-1000 ${getScoreColor(result.overall_score || 0)}`}>
              {result.overall_score || 0}
              <span className="text-3xl text-slate-500">/100</span>
            </div>
            
            <div className="text-3xl font-bold text-slate-900 mb-2">WeReady Score</div>
            
            <div className={`text-2xl font-semibold mb-4 ${verdictInfo.color}`}>
              {verdictInfo.emoji} {verdictInfo.text}
            </div>

            {result.weready_stamp_eligible ? (
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg">
                <Award className="w-6 h-6" />
                <span>WeReady Stamp Eligible</span>
              </div>
            ) : (
              <div className="text-slate-600 text-lg">Continue improving to earn the WeReady Stamp</div>
            )}

            {/* Success Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-200">
              {result.success_probability && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-violet-600 mb-1">
                    {Math.round(result.success_probability * 100)}%
                  </div>
                  <div className="text-slate-600 font-medium">Success Probability</div>
                </div>
              )}
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900 mb-1">
                  {result.funding_timeline}
                </div>
                <div className="text-slate-600 font-medium">Funding Timeline</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900 mb-1">
                  {result.market_percentile || 'N/A'}
                  {result.market_percentile && <span className="text-lg">th</span>} Percentile
                </div>
                <div className="text-slate-600 font-medium">Market Position</div>
              </div>
            </div>
          </div>

          {/* Category Breakdown Section */}
          {result.breakdown && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-violet-600" />
                <span>Category Breakdown</span>
              </h3>
              
              <div className="space-y-6">
                {Object.entries(result.breakdown || {}).map(([category, data]: [string, any]) => {
                  const categoryName = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                  const percentage = (data.score / 100) * 100;
                  
                  return (
                    <div key={category} className="border border-slate-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            category === 'code_quality' ? 'bg-blue-100' :
                            category === 'business_model' ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            {category === 'code_quality' ? <BarChart3 className="w-6 h-6 text-blue-600" /> :
                             category === 'business_model' ? <Target className="w-6 h-6 text-green-600" /> :
                             <DollarSign className="w-6 h-6 text-purple-600" />}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">{categoryName}</h4>
                            <p className="text-sm text-slate-600">{data.weight}% of overall score</p>
                          </div>
                        </div>
                        <div className={`text-3xl font-bold ${getScoreColor(data.score)}`}>
                          {data.score}/100
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-slate-600">Progress</span>
                          <span className={`font-medium ${getScoreColor(data.score)}`}>{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              data.score >= 80 ? 'bg-green-500' :
                              data.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Category Issues */}
                      {data.issues && data.issues.length > 0 && (
                        <div className="mt-2">
                          {data.issues.map((issue: string, idx: number) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm text-slate-600">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Brain Recommendations Section */}
          {result.brain_recommendations && result.brain_recommendations.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                <Brain className="w-6 h-6 text-violet-600" />
                <span>Bailey's Recommendations</span>
                <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium">
                  {result.brain_recommendations.length} insights
                </span>
              </h3>
              
              <div className="space-y-4">
                {(result.brain_recommendations || []).map((rec: any) => (
                  <div key={rec.id} className={`border-2 rounded-xl p-6 transition-all ${getPriorityColor(rec.priority)}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            rec.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            rec.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            rec.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {rec.priority}
                          </span>
                          <h4 className="text-lg font-bold text-slate-900">{rec.title}</h4>
                        </div>
                        <p className="text-slate-700 mb-3">{rec.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-slate-600">Evidence Source:</span>
                            <p className="text-slate-900">{rec.evidence_source}</p>
                            <p className="text-slate-600">{rec.organization}</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Confidence:</span>
                            <p className="text-slate-900">{rec.confidence}% ({rec.similar_cases} similar cases)</p>
                          </div>
                          <div>
                            <span className="font-medium text-slate-600">Timeline:</span>
                            <p className="text-slate-900">{rec.timeline}</p>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleRecommendation(rec.id)}
                        className="ml-4 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                      >
                        {expandedRecommendations[rec.id] ? 'Less' : 'More'}
                      </button>
                    </div>
                    
                    {expandedRecommendations[rec.id] && (
                      <div className="border-t border-slate-200 pt-4 mt-4">
                        <div className="bg-white rounded-lg p-4">
                          <h5 className="font-bold text-slate-900 mb-2">Specific Action:</h5>
                          <p className="text-slate-700 mb-3">{rec.action}</p>
                          
                          <h5 className="font-bold text-slate-900 mb-2">Expected Impact:</h5>
                          <p className="text-slate-700">{rec.impact}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvement Roadmap */}
          {result.improvement_roadmap && (
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                <Calendar className="w-6 h-6 text-violet-600" />
                <span>Improvement Roadmap</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Zap className="w-5 h-5 text-red-500" />
                    <h4 className="font-bold text-slate-800">Immediate (0-2 weeks)</h4>
                  </div>
                  <ul className="space-y-2">
                    {(result.improvement_roadmap?.immediate || []).map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Clock className="w-5 h-5 text-yellow-500" />
                    <h4 className="font-bold text-slate-800">Short-term (2-8 weeks)</h4>
                  </div>
                  <ul className="space-y-2">
                    {(result.improvement_roadmap?.short_term || []).map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <h4 className="font-bold text-slate-800">Long-term (2+ months)</h4>
                  </div>
                  <ul className="space-y-2">
                    {(result.improvement_roadmap?.long_term || []).map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Credibility & Analysis Quality */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Star className="w-5 h-5 text-violet-600" />
                <span>Analysis Credibility</span>
              </h3>
              
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">Credibility Score</span>
                  <span className="font-medium text-violet-600">{result.credibility_score || 'N/A'}/100</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-violet-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${result.credibility_score || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <p className="text-sm text-slate-600">
                Based on {result.files_analyzed || 0} files analyzed with evidence-backed recommendations from authoritative sources.
              </p>
            </div>

            {/* Competitive Moats */}
            {result.competitive_moats && (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <Building className="w-5 h-5 text-violet-600" />
                  <span>Competitive Moats</span>
                </h3>
                
                {result.competitive_moats.length > 0 ? (
                  <ul className="space-y-3">
                    {result.competitive_moats.map((moat: string, idx: number) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                        <span className="text-slate-700">{moat}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-600 italic">
                    No significant competitive moats identified. Consider developing unique advantages to differentiate your startup.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Improve Your Score?</h3>
            <p className="text-lg mb-6 text-violet-100">
              Start implementing these recommendations and run another analysis to track your progress.
            </p>
            <button 
              onClick={() => router.push('/')}
              className="bg-white text-violet-600 font-bold px-8 py-3 rounded-xl hover:bg-violet-50 transition-all shadow-lg"
            >
              Run New Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}