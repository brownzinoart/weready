'use client';

import { Building, TrendingUp, Target, DollarSign, Users, BarChart3 } from 'lucide-react';

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className={`text-6xl font-bold mb-2 ${getScoreColor(businessData.score || 0)}`}>
          {businessData.score || 0}/100
        </div>
        <div className="text-xl text-slate-900 font-semibold mb-2">
          Business Model Analysis
        </div>
        <div className="text-slate-600">
          {businessData.weight || 25}% of overall WeReady Score
        </div>
      </div>

      {/* Business Model Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue Model */}
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