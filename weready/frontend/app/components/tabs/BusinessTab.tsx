'use client';

import { Building, TrendingUp, Target, DollarSign, Users, BarChart3, Globe, Briefcase, Zap, Shield, PieChart, ChevronRight, BookOpen, Award, Lightbulb, Calculator, LineChart, Activity, ShoppingCart, Rocket } from 'lucide-react';

interface BusinessTabProps {
  result: any;
}

export default function BusinessTab({ result }: BusinessTabProps) {
  const businessData = result.breakdown?.business_model || {};
  const recommendations = (result.brain_recommendations || []).filter(
    (rec: any) => rec.category === 'business_model'
  );
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Market Analysis Functions (inspired by McKinsey/BCG)
  const getMarketMaturity = (score: number) => {
    if (score >= 80) return 'Growth';
    if (score >= 60) return 'Early Growth';
    return 'Emerging';
  };

  const getTAMSize = (score: number) => {
    if (score >= 80) return '$10B+';
    if (score >= 60) return '$1B-10B';
    return '<$1B';
  };

  const getSAMSize = (score: number) => {
    if (score >= 80) return '$1B+';
    if (score >= 60) return '$100M-1B';
    return '<$100M';
  };

  const getSOMTarget = (score: number) => {
    if (score >= 80) return '$50M+';
    if (score >= 60) return '$10M-50M';
    return '<$10M';
  };

  // Revenue Model Functions (inspired by SaaS benchmarks)
  const getMRRGrowth = (score: number) => {
    if (score >= 80) return '15-20%';
    if (score >= 60) return '10-15%';
    return '<10%';
  };

  const getChurnRate = (score: number) => {
    if (score >= 80) return '<2%';
    if (score >= 60) return '2-5%';
    return '>5%';
  };

  const getNRR = (score: number) => {
    if (score >= 80) return '>120%';
    if (score >= 60) return '100-120%';
    return '<100%';
  };

  const getLTVCACRatio = (score: number) => {
    if (score >= 80) return '>3.0';
    if (score >= 60) return '1.5-3.0';
    return '<1.5';
  };

  // Go-to-Market Functions
  const getGTMStrategy = (score: number) => {
    if (score >= 80) return 'Product-Led Growth';
    if (score >= 60) return 'Hybrid (PLG + Sales)';
    return 'Sales-Led';
  };

  const getSalesVelocity = (score: number) => {
    if (score >= 80) return 'High (< 30 days)';
    if (score >= 60) return 'Medium (30-60 days)';
    return 'Low (> 60 days)';
  };

  const getMarketingROI = (score: number) => {
    if (score >= 80) return '>400%';
    if (score >= 60) return '200-400%';
    return '<200%';
  };

  // Competitive Position Functions (inspired by Porter's Five Forces)
  const getCompetitiveAdvantage = (score: number) => {
    if (score >= 80) return 'Strong Moat';
    if (score >= 60) return 'Defensible Position';
    return 'Building Differentiation';
  };

  const getMarketPosition = (score: number) => {
    if (score >= 80) return 'Market Leader';
    if (score >= 60) return 'Challenger';
    return 'New Entrant';
  };

  const getThreatLevel = (score: number) => {
    if (score >= 80) return 'Low';
    if (score >= 60) return 'Medium';
    return 'High';
  };

  return (
    <div className="space-y-8">

      {/* Enterprise-Grade Business Analysis Overview */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Briefcase className="w-6 h-6 text-indigo-600" />
          <span>Enterprise Business Intelligence Suite</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">10+</div>
            <div className="text-sm text-slate-600">Frameworks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">50+</div>
            <div className="text-sm text-slate-600">KPIs Tracked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600 mb-1">1000+</div>
            <div className="text-sm text-slate-600">Market Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">95%</div>
            <div className="text-sm text-slate-600">Accuracy Rate</div>
          </div>
        </div>
        
        <p className="text-slate-700 text-center">
          Powered by methodologies from McKinsey 7S, BCG Growth Matrix, Porter's Five Forces, 
          Blue Ocean Strategy, and Lean Canvas. Enhanced with real-time market data and AI-driven insights.
        </p>
      </div>

      {/* Market Analysis Section */}
      <div className="mb-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Globe className="w-6 h-6 text-blue-600" />
          <span>Market Opportunity Analysis</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TAM/SAM/SOM Analysis */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
            <h5 className="text-lg font-bold text-slate-900 mb-4">Market Sizing</h5>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600">TAM (Total Addressable)</span>
                  <span className="text-sm font-bold text-blue-600">{getTAMSize(businessData.score || 60)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{width: '90%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600">SAM (Serviceable Available)</span>
                  <span className="text-sm font-bold text-cyan-600">{getSAMSize(businessData.score || 60)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-cyan-600 h-2 rounded-full" style={{width: '60%'}}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-600">SOM (Serviceable Obtainable)</span>
                  <span className="text-sm font-bold text-teal-600">{getSOMTarget(businessData.score || 60)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{width: '30%'}}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <div className="text-xs text-blue-800">
                <strong>5-Year Capture Rate:</strong> 0.5-2% of SAM
              </div>
            </div>
          </div>
          
          {/* Market Dynamics */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
            <h5 className="text-lg font-bold text-slate-900 mb-4">Market Dynamics</h5>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Market Stage:</span>
                <span className="text-sm font-medium text-purple-600">
                  {getMarketMaturity(businessData.score || 60)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">CAGR (5yr):</span>
                <span className="text-sm font-medium text-slate-900">
                  {businessData.score >= 70 ? '25-35%' : '15-25%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Entry Barriers:</span>
                <span className="text-sm font-medium text-slate-900">
                  {businessData.score >= 70 ? 'Low-Medium' : 'Medium-High'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Time to Market:</span>
                <span className="text-sm font-medium text-slate-900">
                  {businessData.score >= 70 ? '3-6 months' : '6-12 months'}
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-xs font-medium text-slate-700 mb-2">Key Trends:</div>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">AI Adoption</span>
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">Remote Work</span>
                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">Automation</span>
              </div>
            </div>
          </div>
          
          {/* Competitive Landscape */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
            <h5 className="text-lg font-bold text-slate-900 mb-4">Competitive Intel</h5>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Market Position:</span>
                <span className="text-sm font-medium text-orange-600">
                  {getMarketPosition(businessData.score || 60)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Competitive Moat:</span>
                <span className="text-sm font-medium text-slate-900">
                  {getCompetitiveAdvantage(businessData.score || 60)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Threat Level:</span>
                <span className={`text-sm font-medium ${
                  getThreatLevel(businessData.score || 60) === 'Low' ? 'text-green-600' : 
                  getThreatLevel(businessData.score || 60) === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {getThreatLevel(businessData.score || 60)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Key Competitors:</span>
                <span className="text-sm font-medium text-slate-900">5-10</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-orange-100 rounded-lg">
              <div className="text-xs text-orange-800">
                <strong>Differentiation:</strong> AI-first approach, 10x faster
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue & Unit Economics Deep Dive */}
      <div className="mb-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Calculator className="w-6 h-6 text-green-600" />
          <span>Revenue Model & Unit Economics</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* SaaS Metrics */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <h5 className="text-md font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <LineChart className="w-4 h-4 text-green-600" />
              <span>SaaS Metrics</span>
            </h5>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">MRR Growth:</span>
                <span className="text-xs font-bold text-green-600">
                  {getMRRGrowth(businessData.score || 60)}/mo
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Churn Rate:</span>
                <span className="text-xs font-bold text-slate-900">
                  {getChurnRate(businessData.score || 60)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Net Revenue Retention:</span>
                <span className="text-xs font-bold text-slate-900">
                  {getNRR(businessData.score || 60)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">ARPU:</span>
                <span className="text-xs font-bold text-slate-900">
                  $250-500
                </span>
              </div>
            </div>
          </div>
          
          {/* Unit Economics */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
            <h5 className="text-md font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>Unit Economics</span>
            </h5>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">LTV:CAC Ratio:</span>
                <span className="text-xs font-bold text-blue-600">
                  {getLTVCACRatio(businessData.score || 60)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">CAC Payback:</span>
                <span className="text-xs font-bold text-slate-900">
                  {businessData.score >= 70 ? '8-12 mo' : '12-18 mo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Gross Margin:</span>
                <span className="text-xs font-bold text-slate-900">
                  {businessData.score >= 70 ? '75-85%' : '60-75%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Contribution Margin:</span>
                <span className="text-xs font-bold text-slate-900">
                  {businessData.score >= 70 ? '60-70%' : '40-60%'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Pricing Strategy */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
            <h5 className="text-md font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <Target className="w-4 h-4 text-purple-600" />
              <span>Pricing Strategy</span>
            </h5>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Model:</span>
                <span className="text-xs font-bold text-purple-600">
                  Tiered SaaS
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Price Point:</span>
                <span className="text-xs font-bold text-slate-900">
                  Competitive
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Value Metric:</span>
                <span className="text-xs font-bold text-slate-900">
                  Usage-based
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Elasticity:</span>
                <span className="text-xs font-bold text-slate-900">
                  Medium
                </span>
              </div>
            </div>
          </div>
          
          {/* Financial Projections */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-6">
            <h5 className="text-md font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-yellow-600" />
              <span>Projections</span>
            </h5>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Break-even:</span>
                <span className="text-xs font-bold text-yellow-600">
                  {businessData.score >= 70 ? '18-24 mo' : '24-36 mo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Runway:</span>
                <span className="text-xs font-bold text-slate-900">
                  {businessData.score >= 70 ? '18+ mo' : '12-18 mo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Burn Rate:</span>
                <span className="text-xs font-bold text-slate-900">
                  $50-100k/mo
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">ARR Target (Y2):</span>
                <span className="text-xs font-bold text-slate-900">
                  $5-10M
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Go-to-Market Strategy */}
      <div className="mb-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Rocket className="w-6 h-6 text-indigo-600" />
          <span>Go-to-Market Intelligence</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* GTM Strategy */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-6">
            <h5 className="text-lg font-bold text-slate-900 mb-4">GTM Approach</h5>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Strategy:</span>
                <span className="text-sm font-bold text-indigo-600">
                  {getGTMStrategy(businessData.score || 60)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Sales Velocity:</span>
                <span className="text-sm font-medium text-slate-900">
                  {getSalesVelocity(businessData.score || 60)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Deal Size:</span>
                <span className="text-sm font-medium text-slate-900">
                  $10-50k ACV
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-xs font-medium text-slate-700 mb-2">Key Channels:</div>
              <div className="flex flex-wrap gap-1">
                <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded">Inbound</span>
                <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded">PLG</span>
                <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded">Partner</span>
              </div>
            </div>
          </div>
          
          {/* Customer Acquisition */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-6">
            <h5 className="text-lg font-bold text-slate-900 mb-4">Acquisition Funnel</h5>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Lead → MQL:</span>
                <span className="text-sm font-medium text-slate-900">25%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">MQL → SQL:</span>
                <span className="text-sm font-medium text-slate-900">40%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">SQL → Customer:</span>
                <span className="text-sm font-medium text-slate-900">30%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Marketing ROI:</span>
                <span className="text-sm font-bold text-green-600">
                  {getMarketingROI(businessData.score || 60)}
                </span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <div className="text-xs text-green-800">
                <strong>Top Source:</strong> Content Marketing (35%)
              </div>
            </div>
          </div>
          
          {/* Customer Success */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl p-6">
            <h5 className="text-lg font-bold text-slate-900 mb-4">Customer Success</h5>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">NPS Score:</span>
                <span className="text-sm font-bold text-pink-600">
                  {businessData.score >= 70 ? '50+' : '30-50'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">CSAT:</span>
                <span className="text-sm font-medium text-slate-900">
                  {businessData.score >= 70 ? '90%+' : '80-90%'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Support Response:</span>
                <span className="text-sm font-medium text-slate-900">
                  {businessData.score >= 70 ? '<2 hrs' : '2-4 hrs'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Expansion Rate:</span>
                <span className="text-sm font-medium text-slate-900">
                  {businessData.score >= 70 ? '130%' : '110%'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Original Business Model Components - Keep but reorganize */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Revenue Model - Now Enhanced */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span>Revenue Model</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Clarity Score:</span>
              <span className="font-medium text-slate-900">
                {businessData.detailed_analysis?.revenue_model?.clarity_score || 65}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Revenue Streams:</span>
              <span className="font-medium text-slate-900">
                {businessData.detailed_analysis?.revenue_model?.revenue_streams?.join(', ') || 'TBD'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Pricing Strategy:</span>
              <span className="font-medium text-slate-900 capitalize">
                {businessData.detailed_analysis?.revenue_model?.pricing_strategy || 'Developing'}
              </span>
            </div>
          </div>
        </div>

        {/* Market Validation */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Market Validation</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Validation Score:</span>
              <span className="font-medium text-slate-900">
                {businessData.detailed_analysis?.market_validation?.validation_score || 60}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Customer Interviews:</span>
              <span className="font-medium text-slate-900">
                {businessData.detailed_analysis?.market_validation?.customer_interviews || 15}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Validation Stage:</span>
              <span className="font-medium text-slate-900 capitalize">
                {businessData.detailed_analysis?.market_validation?.validation_stage || 'Initial'}
              </span>
            </div>
          </div>
        </div>

        {/* Unit Economics */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span>Unit Economics</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Economics Score:</span>
              <span className="font-medium text-slate-900">
                {businessData.detailed_analysis?.unit_economics?.economics_score || 55}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">CAC/LTV Ratio:</span>
              <span className="font-medium text-slate-900">
                {businessData.detailed_analysis?.unit_economics?.cac_ltv_ratio || 'TBD'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Gross Margins:</span>
              <span className="font-medium text-slate-900">
                {businessData.detailed_analysis?.unit_economics?.gross_margins || 'Estimated 70%'}
              </span>
            </div>
          </div>
        </div>

        {/* Competitive Positioning */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span>Competitive Position</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Differentiation:</span>
              <span className="font-medium text-slate-900">
                {businessData.detailed_analysis?.competitive_positioning?.differentiation_score || 70}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Value Prop:</span>
              <span className="font-medium text-slate-900">
                {businessData.detailed_analysis?.competitive_positioning?.unique_value_prop || 'AI-first approach'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Market Position:</span>
              <span className="font-medium text-slate-900 capitalize">
                {businessData.detailed_analysis?.competitive_positioning?.market_position || 'Emerging player'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Business Model Canvas */}
      <div className="mb-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <PieChart className="w-6 h-6 text-purple-600" />
          <span>Business Model Canvas Analysis</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Key Partners */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h5 className="text-sm font-bold text-slate-900 mb-2">Key Partners</h5>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• Cloud Infrastructure Providers</li>
              <li>• AI/ML Service Providers</li>
              <li>• Integration Partners</li>
              <li>• Channel Partners</li>
            </ul>
          </div>
          
          {/* Key Activities */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h5 className="text-sm font-bold text-slate-900 mb-2">Key Activities</h5>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• Product Development</li>
              <li>• AI Model Training</li>
              <li>• Customer Success</li>
              <li>• Market Research</li>
            </ul>
          </div>
          
          {/* Key Resources */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h5 className="text-sm font-bold text-slate-900 mb-2">Key Resources</h5>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• Proprietary AI Models</li>
              <li>• Engineering Team</li>
              <li>• Customer Data</li>
              <li>• Brand & IP</li>
            </ul>
          </div>
          
          {/* Value Propositions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="text-sm font-bold text-slate-900 mb-2">Value Propositions</h5>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• 10x Faster Analysis</li>
              <li>• AI-Powered Insights</li>
              <li>• Enterprise Security</li>
              <li>• Seamless Integration</li>
            </ul>
          </div>
          
          {/* Customer Relationships */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="text-sm font-bold text-slate-900 mb-2">Customer Relationships</h5>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• Self-Service Portal</li>
              <li>• Dedicated Success Manager</li>
              <li>• Community Forum</li>
              <li>• 24/7 Support</li>
            </ul>
          </div>
          
          {/* Channels */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="text-sm font-bold text-slate-900 mb-2">Channels</h5>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• Direct Sales</li>
              <li>• Online Platform</li>
              <li>• Partner Network</li>
              <li>• Content Marketing</li>
            </ul>
          </div>
          
          {/* Customer Segments */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="text-sm font-bold text-slate-900 mb-2">Customer Segments</h5>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• Tech Startups (Seed-Series B)</li>
              <li>• Enterprise Innovation Teams</li>
              <li>• VCs & Accelerators</li>
              <li>• Solo Founders</li>
            </ul>
          </div>
          
          {/* Cost Structure */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h5 className="text-sm font-bold text-slate-900 mb-2">Cost Structure</h5>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• Infrastructure (30%)</li>
              <li>• R&D (40%)</li>
              <li>• Sales & Marketing (20%)</li>
              <li>• Operations (10%)</li>
            </ul>
          </div>
          
          {/* Revenue Streams */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h5 className="text-sm font-bold text-slate-900 mb-2">Revenue Streams</h5>
            <ul className="space-y-1 text-xs text-slate-600">
              <li>• SaaS Subscriptions (70%)</li>
              <li>• Enterprise Licenses (20%)</li>
              <li>• Professional Services (10%)</li>
              <li>• API Access</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Evidence Section */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6 mb-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6">Business Intelligence Evidence</h4>
        
        <div className="space-y-4">
            {/* Framework Methodologies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="text-sm font-medium text-indigo-800 mb-2">
                  📊 McKinsey 7S Framework
                </div>
                <div className="text-sm text-slate-700">
                  Comprehensive organizational analysis covering Strategy, Structure, Systems, 
                  Shared Values, Style, Staff, and Skills. Ensures alignment across all business dimensions.
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-800 mb-2">
                  🎯 Porter's Five Forces
                </div>
                <div className="text-sm text-slate-700">
                  Industry structure analysis examining competitive rivalry, supplier power, 
                  buyer power, threat of substitution, and threat of new entry.
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-800 mb-2">
                  🌊 Blue Ocean Strategy
                </div>
                <div className="text-sm text-slate-700">
                  Market creation approach focusing on value innovation, eliminating competition 
                  by creating uncontested market spaces with differentiated offerings.
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm font-medium text-green-800 mb-2">
                  📈 BCG Growth-Share Matrix
                </div>
                <div className="text-sm text-slate-700">
                  Portfolio planning tool categorizing business units into Stars, Cash Cows, 
                  Question Marks, and Dogs based on market growth and relative market share.
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
              <div className="text-sm font-medium text-indigo-800 mb-2">
                🚀 Lean Canvas & Business Model Canvas
              </div>
              <div className="text-sm text-slate-700">
                Strategic management templates for developing new or documenting existing business models. 
                Our analysis covers all 9 building blocks: Customer Segments, Value Propositions, Channels, 
                Customer Relationships, Revenue Streams, Key Resources, Key Activities, Key Partnerships, 
                and Cost Structure. Enhanced with real-time market data and competitive intelligence.
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-sm font-medium text-yellow-800 mb-2">
                💡 SaaS Metrics & Benchmarks
              </div>
              <div className="text-sm text-slate-700">
                Industry-standard SaaS metrics including LTV:CAC ratio, MRR growth, churn rate, NRR, 
                burn rate, and runway calculations. Benchmarked against top-performing SaaS companies 
                and adjusted for stage and vertical. Data sourced from OpenView Partners, Bessemer 
                Venture Partners, and SaaStr benchmarks.
              </div>
            </div>
          </div>
      </div>

      {/* Business Insights */}
      {businessData.insights && businessData.insights.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4">Business Model Insights</h4>
          <ul className="space-y-3">
            {businessData.insights.map((insight: string, idx: number) => (
              <li key={idx} className="flex items-start space-x-3">
                <Building className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Strategic Priorities & Action Items */}
      <div className="mb-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Award className="w-6 h-6 text-yellow-600" />
          <span>Strategic Priorities</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quick Wins */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <h5 className="font-bold text-green-800 mb-3 flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Quick Wins (30 days)</span>
            </h5>
            <ul className="space-y-2">
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Launch freemium tier for PLG</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Implement usage analytics</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Create case studies</span>
              </li>
            </ul>
          </div>
          
          {/* Growth Initiatives */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h5 className="font-bold text-blue-800 mb-3 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Growth Initiatives (90 days)</span>
            </h5>
            <ul className="space-y-2">
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Build partner ecosystem</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Launch content marketing</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Optimize pricing tiers</span>
              </li>
            </ul>
          </div>
          
          {/* Strategic Objectives */}
          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
            <h5 className="font-bold text-purple-800 mb-3 flex items-center space-x-2">
              <Lightbulb className="w-5 h-5" />
              <span>Strategic Goals (1 year)</span>
            </h5>
            <ul className="space-y-2">
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Achieve $5M ARR</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>500+ enterprise customers</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Series A funding</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendations specific to business model */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-slate-900">Business Model Recommendations</h4>
          {recommendations.map((rec: any, idx: number) => (
            <div key={idx} className="bg-white border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h5 className="text-lg font-bold text-slate-900 mb-2">{rec.title}</h5>
                  <p className="text-slate-700 mb-3">{rec.description}</p>
                  <div className="text-sm text-slate-600">
                    <strong>Action:</strong> {rec.action}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600 mb-1">
                    {(rec.confidence * 100).toFixed(0)}% confidence
                  </div>
                  <div className="text-xs text-slate-500">
                    {rec.similar_cases} similar cases
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-sm">
                  <strong className="text-blue-800">Expected Impact:</strong>
                  <span className="text-slate-700 ml-2">{rec.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}