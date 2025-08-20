"use client";

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { User, Calendar, Star, TrendingUp, LogOut, ArrowLeft, BarChart3, Code, DollarSign, Target, Zap, Eye, Settings, Play, Clock, Award } from 'lucide-react';

interface AnalysisSummary {
  total_analyses: number;
  last_analysis_date: string | null;
  average_score: number | null;
  score_trend: string | null;
  latest_score: number | null;
}

interface AnalysisHistoryItem {
  id: string;
  created_at: string;
  overall_score: number;
  verdict: string;
  github_url?: string;
  analysis_type: string;
}

export default function Dashboard() {
  const { user, userProfile, isAuthenticated, isLoading, logout, getViewMode, updateUserProfile } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'technical' | 'business'>('business');
  const [analysisSummary, setAnalysisSummary] = useState<AnalysisSummary | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistoryItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Fetch user analysis data
  const fetchAnalysisData = async () => {
    if (!user || !isAuthenticated) return;
    
    setLoadingData(true);
    try {
      const token = localStorage.getItem('weready_access_token');
      if (!token) {
        console.log('No access token found');
        return;
      }

      // Fetch analysis summary
      const summaryResponse = await fetch('http://localhost:8000/api/user/analyses/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setAnalysisSummary(summaryData);
      }

      // Fetch analysis history (first 5)
      const historyResponse = await fetch('http://localhost:8000/api/user/analyses/history?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setAnalysisHistory(historyData.analyses || []);
      }

    } catch (error) {
      console.error('Error fetching analysis data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchAnalysisData();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Only redirect if we're definitely not loading and definitely not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('Dashboard: Redirecting to home - not authenticated');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Set view mode based on user profile
  useEffect(() => {
    if (userProfile && getViewMode) {
      setViewMode(getViewMode());
    }
  }, [userProfile, getViewMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  // Helper functions for adaptive content
  const isNewUser = analysisSummary ? analysisSummary.total_analyses === 0 : (userProfile?.userType === 'new' || !userProfile?.hasAnalyses);

  const getWelcomeMessage = () => {
    if (isNewUser) {
      return "Ready to analyze your startup and get your WeReady score?";
    } else {
      return "Track your startup's progress and improvements over time";
    }
  };

  const getCtaText = () => {
    if (isNewUser) {
      return "Run Your First Analysis";
    } else {
      return "Run New Analysis";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
              
              <div className="h-6 w-px bg-slate-300"></div>
              
              <h1 className="text-2xl font-bold text-slate-900">
                WeReady Dashboard
                {userProfile && (
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    {userProfile.userType === 'new' ? '• First time here' : `• ${userProfile.analysisCount} analyses`}
                  </span>
                )}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              
              <div className="flex items-center space-x-3">
                {user.avatar_url && (
                  <img 
                    src={user.avatar_url} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {user.name || user.full_name}
                    {user.role && (
                      <span className="text-xs text-slate-500 ml-1 capitalize">
                        • {user.role}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user.subscription_tier} {user.is_trial_active && '(Trial)'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                {isNewUser ? 'Welcome to WeReady!' : `Welcome back, ${user.name || user.full_name}!`}
              </h2>
              <p className="text-violet-100 text-lg mb-4">
                {getWelcomeMessage()}
              </p>
              
              {user.is_trial_active && (
                <div className="bg-white/20 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-yellow-300" />
                    <span className="font-semibold">Free Trial Active</span>
                  </div>
                  <p className="text-sm text-violet-100 mt-1">
                    {user.trial_days_remaining} days remaining in your free trial
                  </p>
                </div>
              )}
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="bg-white text-violet-600 px-6 py-3 rounded-xl font-semibold hover:bg-violet-50 transition-colors"
                >
                  {getCtaText()}
                </button>
                
                {!isNewUser && (
                  <button
                    onClick={() => router.push('/results')}
                    className="flex items-center space-x-2 px-4 py-3 bg-white/20 rounded-xl font-medium hover:bg-white/30 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Last Results</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Status Badge */}
            {analysisSummary && analysisSummary.total_analyses > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold">{analysisSummary.total_analyses}</div>
                <div className="text-xs text-violet-200">
                  Analyses Completed
                </div>
                {analysisSummary.latest_score && (
                  <div className="mt-2">
                    <div className="text-lg font-semibold">{analysisSummary.latest_score}/100</div>
                    <div className="text-xs text-violet-200">Latest Score</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Account Info */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-violet-600" />
              <span>Account</span>
            </h3>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="font-medium text-slate-900">{user.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-slate-600">Subscription</p>
                <p className="font-medium text-slate-900 capitalize">
                  {user.subscription_tier} {user.is_trial_active && '(Trial)'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-slate-600">Member Since</p>
                <p className="font-medium text-slate-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Analysis History */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              <span>Analysis History</span>
            </h3>
            
            {loadingData ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading analysis history...</p>
              </div>
            ) : analysisHistory.length > 0 ? (
              <div className="space-y-3">
                {analysisHistory.map((analysis, index) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">
                        Analysis #{analysisHistory.length - index}
                      </div>
                      <div className="text-sm text-slate-600">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500 capitalize">
                        {analysis.analysis_type} analysis
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        analysis.overall_score >= 70 ? 'text-green-600' : 
                        analysis.overall_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {analysis.overall_score}/100
                      </div>
                      <div className="text-xs text-slate-500">
                        {analysis.verdict}
                      </div>
                    </div>
                  </div>
                ))}
                {analysisHistory.length >= 5 && (
                  <button
                    onClick={() => router.push('/history')}
                    className="w-full text-center text-violet-600 hover:text-violet-700 font-medium py-2"
                  >
                    View All History →
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📊</div>
                <p className="text-slate-600 mb-4">
                  Your analysis history will appear here
                </p>
                <button
                  onClick={() => router.push('/')}
                  className="text-violet-600 hover:text-violet-700 font-medium"
                >
                  Run your first analysis →
                </button>
              </div>
            )}
          </div>

          {/* Progress Tracking */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-violet-600" />
              <span>Progress Tracking</span>
            </h3>
            
            {analysisSummary && analysisSummary.total_analyses > 0 ? (
              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-lg font-bold text-slate-900">
                      {analysisSummary.total_analyses}
                    </div>
                    <div className="text-xs text-slate-600">
                      Total Analyses
                    </div>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <div className="text-lg font-bold text-slate-900">
                      {analysisSummary.average_score?.toFixed(0) || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-600">
                      Avg Score
                    </div>
                  </div>
                </div>

                {/* Trend Indicator */}
                {analysisSummary.score_trend && (
                  <div className="flex items-center justify-center space-x-2 p-3 bg-slate-50 rounded-lg">
                    <div className={`font-medium ${
                      analysisSummary.score_trend === 'improving' ? 'text-green-600' :
                      analysisSummary.score_trend === 'declining' ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {analysisSummary.score_trend === 'improving' ? '📈 Improving' :
                       analysisSummary.score_trend === 'declining' ? '📉 Declining' : '➡️ Stable'}
                    </div>
                  </div>
                )}

                {/* Last Analysis */}
                {analysisSummary.last_analysis_date && (
                  <div className="text-center">
                    <div className="text-sm text-slate-600">Last Analysis</div>
                    <div className="text-sm font-medium text-slate-900">
                      {new Date(analysisSummary.last_analysis_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-slate-600 mb-4">
                  Track your improvements over time
                </p>
                <p className="text-sm text-slate-500">
                  Complete your first analysis to see progress
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Feature Preview */}
        <div className="mt-8 bg-slate-50 rounded-2xl p-8 border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-4 text-center">
            Coming Soon to Your Dashboard
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📈</div>
              <h4 className="font-semibold text-slate-900 mb-2">Score Tracking</h4>
              <p className="text-sm text-slate-600">
                Watch your WeReady score improve over time
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🔄</div>
              <h4 className="font-semibold text-slate-900 mb-2">Re-analysis</h4>
              <p className="text-sm text-slate-600">
                Compare before/after implementing fixes
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">📧</div>
              <h4 className="font-semibold text-slate-900 mb-2">Progress Alerts</h4>
              <p className="text-sm text-slate-600">
                Get notified when your score improves
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">🏆</div>
              <h4 className="font-semibold text-slate-900 mb-2">Issue Resolution</h4>
              <p className="text-sm text-slate-600">
                Track which recommendations you've completed
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}