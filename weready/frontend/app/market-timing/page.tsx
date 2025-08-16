'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, TrendingUp, Clock, Target, AlertTriangle, Zap, Calendar, CheckCircle, XCircle, Activity, RefreshCw } from 'lucide-react';
import Navigation from "../components/Navigation";

export default function MarketTimingDashboard() {
  const [marketReport, setMarketReport] = useState<any>(null);
  const [selectedSector, setSelectedSector] = useState<string>('ai');
  const [sectorRecommendation, setSectorRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const router = useRouter();

  const sectors = [
    { id: 'ai', name: 'AI/ML', icon: '🤖' },
    { id: 'fintech', name: 'FinTech', icon: '💰' },
    { id: 'developer_tools', name: 'Dev Tools', icon: '🛠️' },
    { id: 'web_saas', name: 'Web SaaS', icon: '🌐' },
    { id: 'mobile', name: 'Mobile', icon: '📱' }
  ];

  useEffect(() => {
    loadMarketData();
  }, []);

  useEffect(() => {
    if (selectedSector) {
      loadSectorRecommendation();
    }
  }, [selectedSector]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/market-timing/report');
      if (response.ok) {
        const data = await response.json();
        setMarketReport(data.market_timing_report);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to load market timing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSectorRecommendation = async () => {
    try {
      const response = await fetch('http://localhost:8000/market-timing/recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startup_category: selectedSector,
          current_stage: 'growth'
        })
      });
      if (response.ok) {
        const data = await response.json();
        setSectorRecommendation(data.timing_recommendation);
      }
    } catch (error) {
      console.error('Failed to load sector recommendation:', error);
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp > 80) return 'from-red-500 to-red-600';
    if (temp > 60) return 'from-orange-500 to-orange-600';
    if (temp > 40) return 'from-yellow-500 to-yellow-600';
    return 'from-blue-500 to-blue-600';
  };

  const getTemperatureIcon = (temp: number) => {
    if (temp > 80) return '🔥';
    if (temp > 60) return '🌡️';
    if (temp > 40) return '🔄';
    return '❄️';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'bg-red-100 text-red-800 border-red-200';
      case '1-2_weeks': return 'bg-orange-100 text-orange-800 border-orange-200';
      case '1-3_months': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading market timing intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-4xl font-bold text-slate-900">
              Strategic <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Market Timing</span>
            </h1>
            <button
              onClick={loadMarketData}
              className="flex items-center space-x-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Real-time intelligence combining funding cycles, GitHub trends, and sector momentum for strategic decision making.
          </p>
          {lastUpdate && (
            <div className="mt-4 inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Market Overview */}
        {marketReport && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {marketReport.overall_market_temperature?.toFixed(0)}°
                  </div>
                  <div className="text-slate-600">Market Temperature</div>
                </div>
              </div>
              <div className="text-sm text-slate-500">
                {getTemperatureIcon(marketReport.overall_market_temperature)} {marketReport.market_summary?.split('.')[0]}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Zap className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900 capitalize">
                    {marketReport.timing_urgency}
                  </div>
                  <div className="text-slate-600">Overall Urgency</div>
                </div>
              </div>
              <div className="text-sm text-slate-500">
                Based on {Object.keys(marketReport.sector_recommendations || {}).length} sector analysis
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-lg">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {Math.round((marketReport.confidence_level || 0) * 100)}%
                  </div>
                  <div className="text-slate-600">Confidence</div>
                </div>
              </div>
              <div className="text-sm text-slate-500">
                Multi-source intelligence confidence
              </div>
            </div>
          </div>
        )}

        {/* GitHub Market Signals */}
        {marketReport?.github_market_signals && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>GitHub Market Signals</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {marketReport.github_market_signals.total_momentum?.toFixed(0)}
                </div>
                <div className="text-blue-700">Total Momentum</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900 capitalize">
                  {marketReport.github_market_signals.acceleration}
                </div>
                <div className="text-blue-700">Market Acceleration</div>
              </div>
              <div>
                <div className="text-sm text-blue-700">
                  <strong>Hot Categories:</strong> {marketReport.github_market_signals.hot_categories?.join(', ') || 'None detected'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sector Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Sector Analysis</h2>
          <div className="flex flex-wrap gap-3">
            {sectors.map((sector) => (
              <button
                key={sector.id}
                onClick={() => setSelectedSector(sector.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                  selectedSector === sector.id
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-violet-300'
                }`}
              >
                <span>{sector.icon}</span>
                <span>{sector.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sector Recommendation */}
        {sectorRecommendation && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Timing Windows */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Timing Windows</span>
              </h3>
              <div className="space-y-4">
                {sectorRecommendation.timing_windows?.map((window: any, idx: number) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-slate-900 capitalize">
                            {window.window_type.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(window.urgency_level)}`}>
                            {window.urgency_level.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm text-slate-600 mb-2">
                          {window.action_recommendation}
                        </div>
                        <div className="text-xs text-slate-500">
                          Duration: {window.duration_estimate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold bg-gradient-to-r ${getTemperatureColor(window.temperature)} bg-clip-text text-transparent`}>
                          {window.temperature?.toFixed(0)}°
                        </div>
                        <div className="text-xs text-slate-500">
                          {(window.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-slate-600 font-medium mb-1">Key Indicators:</div>
                      <ul className="text-xs text-slate-500 space-y-1">
                        {window.key_indicators?.map((indicator: string, i: number) => (
                          <li key={i} className="flex items-center space-x-1">
                            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                            <span>{indicator}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Advice */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span>Strategic Recommendations</span>
              </h3>
              
              {/* Optimal Actions */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-3">Priority Actions</h4>
                <div className="space-y-2">
                  {sectorRecommendation.optimal_actions?.map((action: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <span className="text-sm text-green-800">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Advice */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-900 mb-3">Strategic Advice</h4>
                <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg border border-violet-200">
                  <p className="text-sm text-slate-700">{sectorRecommendation.strategic_advice}</p>
                </div>
              </div>

              {/* Risk Factors */}
              {sectorRecommendation.risk_factors?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Risk Factors</span>
                  </h4>
                  <div className="space-y-2">
                    {sectorRecommendation.risk_factors.map((risk: string, idx: number) => (
                      <div key={idx} className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg">
                        <XCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <span className="text-sm text-amber-800">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top Opportunities */}
        {marketReport?.top_opportunities?.length > 0 && (
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Top Market Opportunities Right Now</span>
            </h3>
            <div className="space-y-3">
              {marketReport.top_opportunities.map((opportunity: string, idx: number) => (
                <div key={idx} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-600 font-bold">{idx + 1}</span>
                  </div>
                  <span className="text-emerald-800 font-medium">{opportunity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WeReady Advantage */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">WeReady's Market Timing Advantage</h3>
          <p className="text-lg mb-6 text-violet-100">
            Strategic timing recommendations that combine real-time funding cycles, GitHub activity, and sector intelligence.
          </p>
          <div className="text-sm text-violet-200 mb-6">
            This multi-source market timing intelligence is not available in ChatGPT or other AI tools.
          </div>
          <button 
            onClick={() => router.push('/')}
            className="bg-white text-violet-600 font-bold px-8 py-3 rounded-xl hover:bg-violet-50 transition-all shadow-lg"
          >
            Analyze Your Startup Timing
          </button>
        </div>
      </div>
    </div>
  );
}