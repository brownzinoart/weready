'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Award, Star, Brain, BarChart3, Calendar, Building, Zap, Clock, TrendingUp, CheckCircle, AlertTriangle, ExternalLink, Github, Target, DollarSign, FileText, Eye, Shield } from 'lucide-react';
import TabNavigation from '../components/TabNavigation';

function ResultsContent() {
  const [result, setResult] = useState<any>(null);
  const [isMockData, setIsMockData] = useState(false);
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
      // Better mock detection: check both sessionStorage flag AND data properties
      const isMockDetected = isMockStored || resultData.isPremiumUser === true || resultData.weready_stamp_eligible !== undefined;
      setIsMockData(isMockDetected);
      console.log("Result data set successfully", { isMockDetected, isMockStored, isPremiumUser: resultData.isPremiumUser });
    } else {
      console.log("No result data found, redirecting to home");
      router.push('/');
    }
    
    console.log("=== END RESULTS PAGE DEBUG ===");
  }, [searchParams, router]);


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
          {(isMockData || result?.isPremiumUser) && (
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
            <div className={`text-6xl sm:text-7xl md:text-8xl font-bold mb-4 transition-all duration-1000 ${getScoreColor(result.overall_score || 0)}`}>
              {result.overall_score || 0}
              <span className="text-2xl sm:text-3xl text-slate-500">/100</span>
            </div>
            
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">WeReady Score</div>
            
            <div className={`text-xl sm:text-2xl font-semibold mb-4 ${verdictInfo.color}`}>
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
                  <div className="text-2xl sm:text-3xl font-bold text-violet-600 mb-1">
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

          {/* New Tabbed Interface */}
          <TabNavigation result={result} isFreeTier={!result.isPremiumUser} />


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

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your WeReady analysis...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}