'use client';

import { Target, TrendingUp, Users, BarChart3, Building, Globe, DollarSign, FileText, Calendar } from 'lucide-react';

interface InvestmentTabProps {
  result: any;
}

export default function InvestmentTab({ result }: InvestmentTabProps) {
  const investmentData = result.breakdown?.investment_ready || {};
  const recommendations = (result.brain_recommendations || []).filter(
    (rec: any) => rec.category === 'investment_ready'
  );
  
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

      {/* Recommendations specific to investment readiness */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xl font-bold text-slate-900">Investment Readiness Recommendations</h4>
          {recommendations.map((rec: any, idx: number) => (
            <div key={idx} className="bg-white border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h5 className="text-lg font-bold text-slate-900 mb-2">{rec.title}</h5>
                  <p className="text-slate-700 mb-3">{rec.description}</p>
                  <div className="text-sm text-slate-600">
                    <strong>Action:</strong> {rec.action}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600 mb-1">
                    {(rec.confidence * 100).toFixed(0)}% confidence
                  </div>
                  <div className="text-xs text-slate-500">
                    {rec.similar_cases} similar cases
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-sm">
                  <strong className="text-green-800">Expected Impact:</strong>
                  <span className="text-slate-700 ml-2">{rec.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comprehensive Investment Recommendations */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <span>Strategic Investment Recommendations</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Funding Strategy */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h5 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-600" />
              <span>Optimal Funding Strategy</span>
            </h5>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Seed Round:</strong> Target $500K-$2M based on current traction and team strength</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Runway:</strong> Secure 18-24 months of operational funding</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Milestone-Based:</strong> Structure funding around key product and revenue milestones</span>
              </li>
            </ul>
          </div>

          {/* Investor Targeting */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h5 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span>Ideal Investor Profile</span>
            </h5>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Angel Investors:</strong> Former founders in your industry vertical</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Micro VCs:</strong> $10M-$50M funds focusing on early-stage tech</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Strategic Value:</strong> Investors who bring relevant network and expertise</span>
              </li>
            </ul>
          </div>

          {/* Valuation Guidance */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h5 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>Valuation Framework</span>
            </h5>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Conservative:</strong> 15-25x monthly recurring revenue (if applicable)</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Market Comp:</strong> Benchmark against similar-stage companies in your sector</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Growth Potential:</strong> Factor in addressable market size and scalability</span>
              </li>
            </ul>
          </div>

          {/* Due Diligence Preparation */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h5 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-orange-600" />
              <span>Due Diligence Readiness</span>
            </h5>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Financial Records:</strong> Clean bookkeeping and projections ready</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Legal Structure:</strong> Cap table, IP assignments, compliance documentation</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Data Room:</strong> Organized repository of all key business documents</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Timeline */}
        <div className="mt-8 bg-white rounded-lg p-6">
          <h5 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>90-Day Investment Preparation Roadmap</span>
          </h5>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="bg-red-100 text-red-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                30
              </div>
              <div className="flex-1">
                <h6 className="font-semibold text-slate-900">Days 1-30: Foundation</h6>
                <p className="text-sm text-slate-600">Finalize financial projections, prepare pitch deck, organize legal documents</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-100 text-yellow-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                60
              </div>
              <div className="flex-1">
                <h6 className="font-semibold text-slate-900">Days 31-60: Outreach</h6>
                <p className="text-sm text-slate-600">Research and approach target investors, schedule initial meetings</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 text-green-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                90
              </div>
              <div className="flex-1">
                <h6 className="font-semibold text-slate-900">Days 61-90: Execution</h6>
                <p className="text-sm text-slate-600">Follow-up meetings, due diligence process, negotiate terms</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}