'use client';

import { Target, TrendingUp, Users, BarChart3, Building, Globe } from 'lucide-react';

interface InvestmentTabProps {
  result: any;
}

export default function InvestmentTab({ result }: InvestmentTabProps) {
  const investmentData = result.breakdown?.investment_ready || {};
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(investmentData.score || 0)}`}>
          {investmentData.score || 0}/100
        </div>
        <div className="text-xl text-slate-900 font-semibold mb-2">
          Investment Readiness Analysis
        </div>
        <div className="text-slate-600">
          {investmentData.weight || 25}% of overall WeReady Score
        </div>
      </div>

      {/* Investment Readiness Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traction Metrics */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Traction Metrics</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Traction Score:</span>
              <span className="font-medium text-slate-900">
                {investmentData.detailed_analysis?.traction_metrics?.traction_score || 50}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Revenue Growth:</span>
              <span className="font-medium text-slate-900">
                {investmentData.detailed_analysis?.traction_metrics?.revenue_growth || 'Early stage'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">User Growth:</span>
              <span className="font-medium text-slate-900">
                {investmentData.detailed_analysis?.traction_metrics?.user_growth || 'Steady'}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-medium text-slate-700 mb-2">Key Metrics:</div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-bold text-blue-600">
                  {investmentData.detailed_analysis?.traction_metrics?.key_metrics?.mrr || 'TBD'}
                </div>
                <div className="text-slate-600">MRR</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">
                  {investmentData.detailed_analysis?.traction_metrics?.key_metrics?.cac || 'TBD'}
                </div>
                <div className="text-slate-600">CAC</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">
                  {investmentData.detailed_analysis?.traction_metrics?.key_metrics?.ltv || 'TBD'}
                </div>
                <div className="text-slate-600">LTV</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Assessment */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span>Team Assessment</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Team Score:</span>
              <span className="font-medium text-slate-900">
                {investmentData.detailed_analysis?.team_assessment?.team_score || 70}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Completeness:</span>
              <span className="font-medium text-slate-900">
                {investmentData.detailed_analysis?.team_assessment?.team_completeness || 65}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Domain Expertise:</span>
              <span className="font-medium text-slate-900">
                {investmentData.detailed_analysis?.team_assessment?.domain_expertise || 75}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Track Record:</span>
              <span className="font-medium text-slate-900 capitalize">
                {investmentData.detailed_analysis?.team_assessment?.execution_track_record || 'Emerging'}
              </span>
            </div>
          </div>
        </div>

        {/* Market Opportunity */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <Globe className="w-5 h-5 text-green-600" />
            <span>Market Opportunity</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Market Score:</span>
              <span className="font-medium text-slate-900">
                {investmentData.detailed_analysis?.market_opportunity?.market_score || 80}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Market Size:</span>
              <span className="font-medium text-slate-900 capitalize">
                {investmentData.detailed_analysis?.market_opportunity?.addressable_market || 'Large'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Market Timing:</span>
              <span className="font-medium text-slate-900 capitalize">
                {investmentData.detailed_analysis?.market_opportunity?.market_timing || 'Excellent'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Competition:</span>
              <span className="font-medium text-slate-900 capitalize">
                {investmentData.detailed_analysis?.market_opportunity?.competitive_landscape || 'Fragmented'}
              </span>
            </div>
          </div>
        </div>

        {/* Scalability Factors */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <span>Scalability</span>
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-600">Scalability Score:</span>
              <span className="font-medium text-slate-900">
                {investmentData.detailed_analysis?.scalability_factors?.scalability_score || 60}/100
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Technology:</span>
              <span className="font-medium text-slate-900 capitalize">
                {investmentData.detailed_analysis?.scalability_factors?.technology_scalability || 'High'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Business Model:</span>
              <span className="font-medium text-slate-900 capitalize">
                {investmentData.detailed_analysis?.scalability_factors?.business_model_scalability || 'Moderate'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Operations:</span>
              <span className="font-medium text-slate-900 capitalize">
                {investmentData.detailed_analysis?.scalability_factors?.operational_scalability || 'Developing'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Insights */}
      {investmentData.insights && investmentData.insights.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
          <h4 className="text-lg font-bold text-slate-900 mb-4">Investment Readiness Insights</h4>
          <ul className="space-y-3">
            {investmentData.insights.map((insight: string, idx: number) => (
              <li key={idx} className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <span className="text-slate-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Funding Readiness Matrix */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <h4 className="text-xl font-bold text-slate-900 mb-6">Funding Readiness Matrix</h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {result.success_probability ? Math.round(result.success_probability * 100) : 65}%
            </div>
            <div className="text-sm text-slate-600">Success Probability</div>
          </div>
          
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-slate-900 mb-1">
              {result.funding_timeline || '6-12 months'}
            </div>
            <div className="text-sm text-slate-600">Funding Timeline</div>
          </div>
          
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-slate-900 mb-1">
              {result.market_percentile || 68}th
            </div>
            <div className="text-sm text-slate-600">Market Percentile</div>
          </div>
          
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-slate-900 mb-1">
              ${investmentData.valuation_estimate || '2-5M'}
            </div>
            <div className="text-sm text-slate-600">Est. Valuation</div>
          </div>
        </div>
      </div>

      {/* Placeholder for full premium content */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl p-6 text-center">
        <h4 className="text-lg font-bold text-slate-900 mb-3">Premium Investment Analysis</h4>
        <p className="text-slate-600 mb-4">
          Access detailed investor readiness assessment, valuation modeling, 
          due diligence preparation, and VC matching recommendations.
        </p>
        <button className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all">
          Upgrade for $149/month
        </button>
      </div>
    </div>
  );
}