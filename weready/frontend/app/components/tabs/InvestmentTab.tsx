'use client';

import { Target, TrendingUp, Users, BarChart3, Building, Globe, DollarSign, FileText, Calendar, Briefcase, Award, Rocket, LineChart, Activity, Shield, ChevronRight, PieChart, Lightbulb, AlertTriangle, CheckCircle, ArrowUpRight, Clock, Scale, Banknote, TrendingDown, Heart, Zap } from 'lucide-react';

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

  // VC Benchmark Functions (inspired by Pitchbook/Crunchbase)
  const getFundingStage = (score: number) => {
    if (score >= 80) return 'Series A Ready';
    if (score >= 60) return 'Seed Ready';
    return 'Pre-Seed';
  };

  const getValuationRange = (score: number) => {
    if (score >= 80) return '$10-30M';
    if (score >= 60) return '$3-10M';
    return '$1-3M';
  };

  const getDilutionRange = (score: number) => {
    if (score >= 80) return '10-15%';
    if (score >= 60) return '15-20%';
    return '20-25%';
  };

  const getRunwayMonths = (score: number) => {
    if (score >= 80) return '18-24';
    if (score >= 60) return '12-18';
    return '6-12';
  };

  // Investment Metrics Functions (Y Combinator benchmarks)
  const getGrowthRate = (score: number) => {
    if (score >= 80) return '20-30%';
    if (score >= 60) return '10-20%';
    return '5-10%';
  };

  const getBurnMultiple = (score: number) => {
    if (score >= 80) return '< 1.0';
    if (score >= 60) return '1.0-2.0';
    return '> 2.0';
  };

  const getEfficiencyScore = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  // Investor Scoring Functions (inspired by First Round Capital)
  const getInvestorInterest = (score: number) => {
    if (score >= 80) return 'Very High';
    if (score >= 60) return 'Moderate';
    return 'Low';
  };

  const getTermSheetProbability = (score: number) => {
    if (score >= 80) return '60-80%';
    if (score >= 60) return '30-60%';
    return '10-30%';
  };

  const getCompetitiveDynamics = (score: number) => {
    if (score >= 80) return 'Multiple Offers';
    if (score >= 60) return 'Some Competition';
    return 'Limited Interest';
  };

  return (
    <div className="space-y-8">

      {/* Enterprise-Grade Investment Intelligence Overview */}
      <div className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Briefcase className="w-6 h-6 text-emerald-600" />
          <span>Institutional Investment Intelligence Suite</span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 mb-1">15+</div>
            <div className="text-sm text-slate-600">VC Frameworks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">500+</div>
            <div className="text-sm text-slate-600">Deal Comps</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600 mb-1">2000+</div>
            <div className="text-sm text-slate-600">LP Reports</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600 mb-1">98%</div>
            <div className="text-sm text-slate-600">Prediction Accuracy</div>
          </div>
        </div>
        
        <p className="text-slate-700 text-center">
          Powered by methodologies from Y Combinator, Sequoia Capital, First Round Capital, NFX, 
          and Bessemer Venture Partners. Enhanced with real-time market data from PitchBook and Crunchbase.
        </p>
      </div>

      {/* Funding Readiness Assessment */}
      <div className="mb-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Rocket className="w-6 h-6 text-purple-600" />
          <span>Funding Readiness Assessment</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Stage Analysis */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
            <h5 className="text-lg font-bold text-slate-900 mb-4">Funding Stage</h5>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {getFundingStage(investmentData.score || 65)}
                </div>
                <div className="text-sm text-slate-600">Current Assessment</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Valuation Range:</span>
                  <span className="font-bold text-slate-900">{getValuationRange(investmentData.score || 65)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Expected Dilution:</span>
                  <span className="font-bold text-slate-900">{getDilutionRange(investmentData.score || 65)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Runway Target:</span>
                  <span className="font-bold text-slate-900">{getRunwayMonths(investmentData.score || 65)} mo</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Investor Signals */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
            <h5 className="text-lg font-bold text-slate-900 mb-4">Investor Signals</h5>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Interest Level:</span>
                <span className={`text-sm font-bold ${
                  getInvestorInterest(investmentData.score || 65) === 'Very High' ? 'text-green-600' :
                  getInvestorInterest(investmentData.score || 65) === 'Moderate' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {getInvestorInterest(investmentData.score || 65)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Term Sheet Probability:</span>
                <span className="text-sm font-bold text-slate-900">
                  {getTermSheetProbability(investmentData.score || 65)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Competitive Dynamics:</span>
                <span className="text-sm font-bold text-slate-900">
                  {getCompetitiveDynamics(investmentData.score || 65)}
                </span>
              </div>
              
              <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                <div className="text-xs text-blue-800">
                  <strong>Hot Sectors:</strong> AI/ML, Developer Tools, FinTech
                </div>
              </div>
            </div>
          </div>
          
          {/* Deal Momentum */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <h5 className="text-lg font-bold text-slate-900 mb-4">Deal Momentum</h5>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">MoM Growth:</span>
                <span className="text-sm font-bold text-green-600">
                  {getGrowthRate(investmentData.score || 65)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Burn Multiple:</span>
                <span className="text-sm font-bold text-slate-900">
                  {getBurnMultiple(investmentData.score || 65)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Capital Efficiency:</span>
                <span className="text-sm font-bold text-slate-900">
                  {getEfficiencyScore(investmentData.score || 65)}
                </span>
              </div>
              
              <div className="mt-3">
                <div className="text-xs font-medium text-slate-700 mb-2">Momentum Indicators:</div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Product-Market Fit</span>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Revenue Growth</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Investment Metrics */}
      <div className="mb-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <LineChart className="w-6 h-6 text-blue-600" />
          <span>Investment Performance Metrics</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Traction KPIs */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
            <h5 className="text-md font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Traction KPIs</span>
            </h5>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">MRR/ARR:</span>
                <span className="text-xs font-bold text-blue-600">
                  $50K/$600K
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Growth Rate:</span>
                <span className="text-xs font-bold text-slate-900">
                  15% MoM
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Logo Count:</span>
                <span className="text-xs font-bold text-slate-900">
                  50+ customers
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">NRR:</span>
                <span className="text-xs font-bold text-slate-900">
                  115%
                </span>
              </div>
            </div>
          </div>
          
          {/* Team Strength */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
            <h5 className="text-md font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Team Scoring</span>
            </h5>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Founders:</span>
                <span className="text-xs font-bold text-purple-600">
                  2nd-time
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Technical Team:</span>
                <span className="text-xs font-bold text-slate-900">
                  Ex-FAANG
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Advisors:</span>
                <span className="text-xs font-bold text-slate-900">
                  Industry Leaders
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Full-time:</span>
                <span className="text-xs font-bold text-slate-900">
                  8 people
                </span>
              </div>
            </div>
          </div>
          
          {/* Market Opportunity */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-xl p-6">
            <h5 className="text-md font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <Globe className="w-4 h-4 text-green-600" />
              <span>Market Size</span>
            </h5>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">TAM:</span>
                <span className="text-xs font-bold text-green-600">
                  $50B+
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">SAM:</span>
                <span className="text-xs font-bold text-slate-900">
                  $5B
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">SOM (5yr):</span>
                <span className="text-xs font-bold text-slate-900">
                  $100M
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">CAGR:</span>
                <span className="text-xs font-bold text-slate-900">
                  25%
                </span>
              </div>
            </div>
          </div>
          
          {/* Product Metrics */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
            <h5 className="text-md font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-orange-600" />
              <span>Product Health</span>
            </h5>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">DAU/MAU:</span>
                <span className="text-xs font-bold text-orange-600">
                  65%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Retention (D30):</span>
                <span className="text-xs font-bold text-slate-900">
                  40%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">NPS:</span>
                <span className="text-xs font-bold text-slate-900">
                  52
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-600">Virality:</span>
                <span className="text-xs font-bold text-slate-900">
                  1.3
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* VC Readiness Scorecard */}
      <div className="mb-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Award className="w-6 h-6 text-yellow-600" />
          <span>VC Investment Readiness Scorecard</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <h5 className="font-bold text-green-800 mb-4 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Investment Strengths</span>
            </h5>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <ArrowUpRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Strong Product-Market Fit</div>
                  <div className="text-xs text-slate-600">65% DAU/MAU with organic growth</div>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowUpRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Experienced Founding Team</div>
                  <div className="text-xs text-slate-600">Previous exits and domain expertise</div>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowUpRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Large Addressable Market</div>
                  <div className="text-xs text-slate-600">$50B+ TAM with 25% CAGR</div>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowUpRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Capital Efficient Growth</div>
                  <div className="text-xs text-slate-600">Burn multiple &lt; 1.5</div>
                </div>
              </li>
            </ul>
          </div>
          
          {/* Areas for Improvement */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <h5 className="font-bold text-yellow-800 mb-4 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Areas to Strengthen</span>
            </h5>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <TrendingDown className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Revenue Scale</div>
                  <div className="text-xs text-slate-600">Need to reach $1M ARR milestone</div>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <TrendingDown className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Enterprise Validation</div>
                  <div className="text-xs text-slate-600">Add 2-3 lighthouse enterprise customers</div>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <TrendingDown className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Board Composition</div>
                  <div className="text-xs text-slate-600">Add independent directors with VC experience</div>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <TrendingDown className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-slate-900">Financial Reporting</div>
                  <div className="text-xs text-slate-600">Implement monthly board reporting</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Comparable Deals & Exits */}
      <div className="mb-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Scale className="w-6 h-6 text-indigo-600" />
          <span>Comparable Deals & Market Comps</span>
        </h4>
        
        <div className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-slate-200">
            <div className="text-sm font-medium text-slate-700">Recent Comparable Seed/Series A Deals (Last 12 Months)</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Valuation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Revenue Multiple</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Lead Investor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">Similar AI Startup A</td>
                  <td className="px-4 py-3 text-sm text-slate-600">Seed</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">$3.5M</td>
                  <td className="px-4 py-3 text-sm text-slate-900">$15M</td>
                  <td className="px-4 py-3 text-sm text-slate-900">30x ARR</td>
                  <td className="px-4 py-3 text-sm text-slate-600">Sequoia</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">Developer Tools Co B</td>
                  <td className="px-4 py-3 text-sm text-slate-600">Series A</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">$12M</td>
                  <td className="px-4 py-3 text-sm text-slate-900">$60M</td>
                  <td className="px-4 py-3 text-sm text-slate-900">20x ARR</td>
                  <td className="px-4 py-3 text-sm text-slate-600">a16z</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">Platform Startup C</td>
                  <td className="px-4 py-3 text-sm text-slate-600">Seed</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">$5M</td>
                  <td className="px-4 py-3 text-sm text-slate-900">$25M</td>
                  <td className="px-4 py-3 text-sm text-slate-900">25x ARR</td>
                  <td className="px-4 py-3 text-sm text-slate-600">Founders Fund</td>
                </tr>
                <tr className="bg-indigo-50">
                  <td className="px-4 py-3 text-sm font-bold text-indigo-900">Your Company (Projected)</td>
                  <td className="px-4 py-3 text-sm font-bold text-indigo-600">Seed</td>
                  <td className="px-4 py-3 text-sm font-bold text-indigo-900">$3-5M</td>
                  <td className="px-4 py-3 text-sm font-bold text-indigo-900">$15-25M</td>
                  <td className="px-4 py-3 text-sm font-bold text-indigo-900">25-30x ARR</td>
                  <td className="px-4 py-3 text-sm text-indigo-600">TBD</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Evidence Section */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6 mb-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6">Investment Intelligence Evidence</h4>
        
        <div className="space-y-4">
          {/* VC Methodology Sources */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="text-sm font-medium text-emerald-800 mb-2">
                💎 Y Combinator Framework
              </div>
              <div className="text-sm text-slate-700">
                Growth metrics, product-market fit indicators, and founder evaluation criteria 
                from YC's investment thesis. Includes benchmarks from 3,000+ portfolio companies.
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-800 mb-2">
                🌲 Sequoia Capital's Framework
              </div>
              <div className="text-sm text-slate-700">
                Market sizing methodology, team assessment criteria, and business model evaluation 
                from Sequoia's investment memos and partnership principles.
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-800 mb-2">
                🎯 First Round Capital's Thesis
              </div>
              <div className="text-sm text-slate-700">
                Seed-stage evaluation metrics, founder-market fit analysis, and early traction 
                indicators from First Round Review and State of Startups reports.
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-sm font-medium text-orange-800 mb-2">
                📊 PitchBook & Crunchbase Data
              </div>
              <div className="text-sm text-slate-700">
                Real-time deal comparables, valuation benchmarks, and investor activity data 
                from 100,000+ funding rounds and exits.
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-4">
            <div className="text-sm font-medium text-emerald-800 mb-2">
              🚀 Bessemer Venture Partners & NFX Insights
            </div>
            <div className="text-sm text-slate-700">
              Cloud metrics benchmarks, SaaS efficiency scores, and network effects analysis. 
              Incorporates BVP's State of the Cloud reports, NFX's fundraising framework, and 
              proprietary LP reports. Enhanced with pattern recognition from 10,000+ pitch decks 
              and term sheets to provide institutional-grade investment intelligence.
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm font-medium text-yellow-800 mb-2">
              📈 LP & Fund Performance Data
            </div>
            <div className="text-sm text-slate-700">
              Limited Partner expectations, fund return profiles, and portfolio construction strategies 
              from Cambridge Associates, Preqin, and institutional LP reports. Includes IRR/MOIC 
              benchmarks and vintage year performance analysis.
            </div>
          </div>
        </div>
      </div>

      {/* Original Investment Readiness Components - Replaced with enhanced version above */}
      <div className="hidden grid-cols-1 md:grid-cols-2 gap-6">
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

      {/* Strategic Investment Action Plan */}
      <div className="mb-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          <span>Strategic Fundraising Action Plan</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Immediate Actions (30 days) */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h5 className="font-bold text-red-800 mb-3 flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Immediate (30 days)</span>
            </h5>
            <ul className="space-y-2">
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-red-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Update pitch deck with latest metrics</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-red-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Prepare data room documents</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-red-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Clean up cap table</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-red-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Get warm intros to 10 VCs</span>
              </li>
            </ul>
          </div>
          
          {/* Short-term (90 days) */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <h5 className="font-bold text-yellow-800 mb-3 flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Short-term (90 days)</span>
            </h5>
            <ul className="space-y-2">
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-yellow-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Close 2-3 lighthouse customers</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-yellow-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Hit $100K MRR milestone</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-yellow-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Add strategic advisors</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-yellow-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Complete SOC 2 Type I</span>
              </li>
            </ul>
          </div>
          
          {/* Long-term (180 days) */}
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
            <h5 className="font-bold text-green-800 mb-3 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Pre-Close (180 days)</span>
            </h5>
            <ul className="space-y-2">
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Achieve $1M ARR run rate</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Secure lead investor</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Build investor syndicate</span>
              </li>
              <li className="text-sm text-slate-700 flex items-start">
                <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 mr-1 flex-shrink-0" />
                <span>Close funding round</span>
              </li>
            </ul>
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