"use client";

import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User, Calendar, Star, TrendingUp, LogOut, ArrowLeft } from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

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
              
              <h1 className="text-2xl font-bold text-slate-900">WeReady Dashboard</h1>
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
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.subscription_tier}</p>
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
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {user.name}! 
          </h2>
          <p className="text-violet-100 text-lg mb-4">
            Ready to analyze more code and improve your startup's WeReady score?
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
          
          <button
            onClick={() => router.push('/')}
            className="bg-white text-violet-600 px-6 py-3 rounded-xl font-semibold hover:bg-violet-50 transition-colors"
          >
            Run New Analysis
          </button>
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

          {/* Analysis History Placeholder */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-violet-600" />
              <span>Analysis History</span>
            </h3>
            
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
          </div>

          {/* Progress Tracking Placeholder */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-violet-600" />
              <span>Progress Tracking</span>
            </h3>
            
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎯</div>
              <p className="text-slate-600 mb-4">
                Track your improvements over time
              </p>
              <p className="text-sm text-slate-500">
                Coming soon: Before/after score comparisons
              </p>
            </div>
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