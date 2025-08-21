"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Calendar, Star, TrendingUp, LogOut, ArrowLeft, BarChart3, Code, DollarSign, Target, Zap, Eye, Settings, Play, Clock, Award, ChevronRight } from "lucide-react";

export default function DemoDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'technical' | 'business'>('business');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/demo/dashboard");
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading demo dashboard...</p>
        </div>
      </div>
    );
  }

  const { user, summary, history, metrics } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-yellow-400 text-black px-4 py-2 text-center font-semibold">
        🎯 DEMO MODE - Logged in as: {user.name} (Premium User)
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/demo")}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Demo
              </button>
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            
            {/* User Profile */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <img
                src={user.avatar_url}
                alt="Avatar"
                className="w-10 h-10 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
              <p className="text-blue-100 mb-4">Your startup is showing excellent progress</p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>Premium Member</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>{user.trial_days_remaining} days remaining in trial</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{summary.latest_score}</div>
              <div className="text-blue-100">Latest Score</div>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+{summary.latest_score - 68} from first</span>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow p-1 flex">
            <button
              onClick={() => setViewMode('business')}
              className={`px-4 py-2 rounded ${
                viewMode === 'business' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Business View
            </button>
            <button
              onClick={() => setViewMode('technical')}
              className={`px-4 py-2 rounded ${
                viewMode === 'technical' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Technical View
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold">{summary.total_analyses}</span>
            </div>
            <p className="text-gray-600">Total Analyses</p>
            <p className="text-sm text-green-600 mt-1">All premium features</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold">{summary.average_score.toFixed(1)}</span>
            </div>
            <p className="text-gray-600">Average Score</p>
            <p className="text-sm text-green-600 mt-1">Improving trend</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold">91</span>
            </div>
            <p className="text-gray-600">Best Score</p>
            <p className="text-sm text-green-600 mt-1">Investment ready!</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold">2h ago</span>
            </div>
            <p className="text-gray-600">Last Analysis</p>
            <p className="text-sm text-blue-600 mt-1">Stay consistent</p>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Your Progress</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {metrics.code_quality_trend.map((score: number, index: number) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t"
                  style={{ height: `${(score / 100) * 200}px` }}
                />
                <span className="text-sm mt-2 text-gray-600">Analysis {index + 1}</span>
                <span className="text-sm font-bold">{score}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-sm">Code Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-sm">Business Model</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded" />
              <span className="text-sm">Investment Ready</span>
            </div>
          </div>
        </div>

        {/* Analysis History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold">Analysis History</h3>
          </div>
          <div className="divide-y">
            {history.map((item: any) => (
              <div key={item.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg ${
                      item.overall_score >= 85 ? 'bg-green-500' :
                      item.overall_score >= 75 ? 'bg-blue-500' :
                      item.overall_score >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {item.overall_score}
                    </div>
                    <div>
                      <p className="font-semibold">{item.analysis_type}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(item.created_at).toLocaleDateString()} - {item.verdict.replace('_', ' ')}
                      </p>
                      {item.github_url && (
                        <p className="text-sm text-blue-600">{item.github_url}</p>
                      )}
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push("/demo/report/1")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View Reports
          </button>
          <button
            onClick={() => router.push("/demo")}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Demo Center
          </button>
        </div>
      </div>
    </div>
  );
}