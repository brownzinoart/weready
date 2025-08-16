'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, GitBranch, Zap, Activity, Clock, Star, ExternalLink, RefreshCw } from 'lucide-react';
import Navigation from "../components/Navigation";

export default function MomentumDashboard() {
  const [trendingData, setTrendingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadTrendingData();
  }, []);

  const loadTrendingData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/trending/github');
      if (response.ok) {
        const data = await response.json();
        setTrendingData(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to load trending data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMomentum = (value: number) => {
    if (value > 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(1);
  };

  const getMomentumColor = (momentum: number) => {
    if (momentum > 100) return 'text-red-600 bg-red-50';
    if (momentum > 50) return 'text-orange-600 bg-orange-50';
    if (momentum > 10) return 'text-green-600 bg-green-50';
    return 'text-blue-600 bg-blue-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading real-time GitHub intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
            <h1 className="text-2xl md:text-4xl font-bold text-slate-900 leading-tight">
              Real-Time <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">GitHub Intelligence</span>
            </h1>
            <button
              onClick={loadTrendingData}
              className="flex items-center space-x-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm md:text-base">Refresh</span>
            </button>
          </div>
          <p className="text-base md:text-xl text-slate-600 max-w-3xl mx-auto px-4 leading-relaxed">
            Live data from the last 24-48 hours. This intelligence is not available in ChatGPT training data.
          </p>
          {lastUpdate && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        {trendingData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center space-x-3">
                <GitBranch className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">{trendingData.trending_now?.length || 0}</div>
                  <div className="text-slate-600">Trending Repos</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center space-x-3">
                <Zap className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">{trendingData.hot_packages?.length || 0}</div>
                  <div className="text-slate-600">Hot Packages</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center space-x-3">
                <Activity className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">{trendingData.velocity_trends?.length || 0}</div>
                  <div className="text-slate-600">Velocity Trends</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center space-x-3">
                <Star className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">{trendingData.language_momentum?.length || 0}</div>
                  <div className="text-slate-600">Language Trends</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ChatGPT Advantage Banner */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900">WeReady's Competitive Advantage</h3>
              <p className="text-amber-800">{trendingData?.chatgpt_advantage}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trending Now */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <GitBranch className="w-5 h-5 text-blue-600" />
              <span>Trending Right Now</span>
            </h2>
            <div className="space-y-4">
              {trendingData?.trending_now?.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-blue-200 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 mb-1">
                        {item.content?.replace('TRENDING NOW: ', '').split(' - ')[0]}
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        {item.content?.split(' - ').slice(1).join(' - ')}
                      </div>
                      <div className="text-xs text-slate-500">
                        Confidence: {Math.round(item.confidence * 100)}%
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMomentumColor(item.numerical_value || 0)}`}>
                      {formatMomentum(item.numerical_value || 0)} ⭐/day
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hot Packages */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-orange-600" />
              <span>Hot AI Packages</span>
            </h2>
            <div className="space-y-4">
              {trendingData?.hot_packages?.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-orange-200 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 mb-1">
                        {item.content?.replace('HOT PACKAGE: ', '').split(' - ')[0]}
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        {item.content?.split(' - ').slice(2).join(' - ')}
                      </div>
                      <div className="text-xs text-slate-500">
                        Language: {item.content?.match(/\((\w+)\)/)?.[1] || 'Unknown'}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMomentumColor(item.numerical_value || 0)}`}>
                      {formatMomentum(item.numerical_value || 0)} momentum
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Language Momentum */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span>Language Momentum</span>
            </h2>
            <div className="space-y-4">
              {trendingData?.language_momentum?.map((item: any, idx: number) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-green-200 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 mb-1">
                        {item.content?.replace('REAL-TIME: ', '').split(' AI ecosystem')[0]}
                      </div>
                      <div className="text-sm text-slate-600">
                        AI Ecosystem Activity Score
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMomentumColor(item.numerical_value || 0)}`}>
                      {formatMomentum(item.numerical_value || 0)}
                    </div>
                  </div>
                  <div className="mt-2 bg-slate-100 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((item.numerical_value || 0) / 500 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Velocity Trends */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Star className="w-5 h-5 text-purple-600" />
              <span>Repository Velocity</span>
            </h2>
            <div className="space-y-4">
              {trendingData?.velocity_trends?.slice(0, 5).map((item: any, idx: number) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 mb-1">
                        {item.content?.replace(/Hot repo #\d+: /, '').split(' - ')[0]}
                      </div>
                      <div className="text-sm text-slate-600">
                        {item.content?.match(/\((\w+)\)/)?.[1] || 'Language'} • High momentum repository
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMomentumColor(item.numerical_value || 0)}`}>
                      {formatMomentum(item.numerical_value || 0)} ⭐/day
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Analyze Your Startup Against These Trends</h3>
          <p className="text-lg mb-6 text-violet-100">
            See how your codebase compares to what's trending in the AI ecosystem right now.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="bg-white text-violet-600 font-bold px-8 py-3 rounded-xl hover:bg-violet-50 transition-all shadow-lg"
          >
            Run WeReady Analysis
          </button>
        </div>
      </div>
    </div>
  );
}