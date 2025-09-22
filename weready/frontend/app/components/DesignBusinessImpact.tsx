'use client';

import { DollarSign, Users, Shield, Building2, Globe, Heart, Target, ArrowUp, Zap, ChevronRight } from 'lucide-react';

export default function DesignBusinessImpact() {
  return (
    <div className="space-y-8">

      {/* Business Impact Overview */}
      <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Building2 className="w-6 h-6 text-green-600" />
          <span>HOW Design Intelligence Impacts Business Outcomes</span>
        </h3>

        <p className="text-slate-700 text-center mb-6">
          Design Intelligence translates design quality into measurable business metrics. Unlike aesthetic opinions,
          our analysis demonstrates HOW design decisions directly affect customer acquisition costs, revenue generation,
          legal compliance, and investment readiness through evidence-based evaluation.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">2-3x</div>
            <div className="text-sm text-slate-600">CAC Impact</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 mb-1">20-30%</div>
            <div className="text-sm text-slate-600">Revenue Increase</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600 mb-1">$500K</div>
            <div className="text-sm text-slate-600">Legal Risk Exposure</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">34%</div>
            <div className="text-sm text-slate-600">Dev Time Savings</div>
          </div>
        </div>
      </div>

      {/* Primary Business Impact Areas */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">Primary Business Impact Areas</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Acquisition Impact */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h4 className="text-lg font-bold text-slate-900">Customer Acquisition Impact</h4>
                <div className="text-sm text-slate-600">HOW Design Quality Affects CAC</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <div className="font-medium text-blue-800 mb-1">The Problem:</div>
                <div className="text-sm text-slate-700">Poor UX increases bounce rates and reduces marketing conversion effectiveness</div>
              </div>

              <div className="p-3 bg-white rounded-lg border">
                <div className="font-medium text-slate-900 mb-1">HOW Poor Design Increases CAC:</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• Higher bounce rates from confusing navigation</li>
                  <li>• Reduced marketing conversion (8-second attention span)</li>
                  <li>• Mobile optimization critical for 68% of traffic</li>
                  <li>• Poor first impressions reduce user engagement</li>
                </ul>
              </div>

              <div className="p-3 bg-green-100 rounded-lg">
                <div className="font-medium text-green-800 mb-1">Statistical Evidence:</div>
                <div className="text-sm text-slate-700">Poor UX can increase customer acquisition costs by 2-3x through reduced marketing conversion rates and higher bounce rates</div>
              </div>
            </div>
          </div>

          {/* Revenue Generation Enhancement */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="text-lg font-bold text-slate-900">Revenue Generation Enhancement</h4>
                <div className="text-sm text-slate-600">HOW Conversion Optimization Drives Growth</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <div className="font-medium text-green-800 mb-1">The Opportunity:</div>
                <div className="text-sm text-slate-700">Evidence-based conversion optimization can increase revenue by 20-30%</div>
              </div>

              <div className="p-3 bg-white rounded-lg border">
                <div className="font-medium text-slate-900 mb-1">HOW Design Optimization Increases Revenue:</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• Trust signals increase conversion rates by 15-25%</li>
                  <li>• Checkout optimization reduces 69.57% cart abandonment</li>
                  <li>• A/B testing provides statistically significant improvements</li>
                  <li>• Form optimization reduces friction and increases completion</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-100 rounded-lg">
                <div className="font-medium text-blue-800 mb-1">Business Case:</div>
                <div className="text-sm text-slate-700">Conversion improvements translate directly to revenue growth through optimized user flows and checkout processes</div>
              </div>
            </div>
          </div>

          {/* Legal Risk Mitigation */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8 text-red-600" />
              <div>
                <h4 className="text-lg font-bold text-slate-900">Legal Risk Mitigation</h4>
                <div className="text-sm text-slate-600">WHY Accessibility Compliance is Critical</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <div className="font-medium text-red-800 mb-1">The Risk:</div>
                <div className="text-sm text-slate-700">96.8% of websites have accessibility failures creating $50K-500K legal exposure</div>
              </div>

              <div className="p-3 bg-white rounded-lg border">
                <div className="font-medium text-slate-900 mb-1">WHY Accessibility Compliance Matters:</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• WCAG 2.1 AA compliance prevents lawsuits</li>
                  <li>• 26% of US population has disabilities (market expansion)</li>
                  <li>• Accessibility lawsuits increased 2,500+ in 2023</li>
                  <li>• Legal settlements range from $50K to $500K</li>
                </ul>
              </div>

              <div className="p-3 bg-green-100 rounded-lg">
                <div className="font-medium text-green-800 mb-1">ROI:</div>
                <div className="text-sm text-slate-700">Prevents legal costs while capturing 15% additional market reach through inclusive design</div>
              </div>
            </div>
          </div>

          {/* Development Efficiency Gains */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="w-8 h-8 text-purple-600" />
              <div>
                <h4 className="text-lg font-bold text-slate-900">Development Efficiency Gains</h4>
                <div className="text-sm text-slate-600">HOW Design Systems Reduce Costs</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <div className="font-medium text-purple-800 mb-1">The Solution:</div>
                <div className="text-sm text-slate-700">Mature design systems reduce development time by 34% and CSS bugs by 67%</div>
              </div>

              <div className="p-3 bg-white rounded-lg border">
                <div className="font-medium text-slate-900 mb-1">HOW Design Systems Improve Efficiency:</div>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>• Component consistency reduces debugging time</li>
                  <li>• Design tokens accelerate designer onboarding by 50%</li>
                  <li>• Standardized patterns reduce decision-making overhead</li>
                  <li>• Investment pays back in 8-12 weeks</li>
                </ul>
              </div>

              <div className="p-3 bg-green-100 rounded-lg">
                <div className="font-medium text-green-800 mb-1">Efficiency Gains:</div>
                <div className="text-sm text-slate-700">$30K/year in saved development time with reduced technical debt and faster feature delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Business Advantages */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 mb-6">Strategic Business Advantages</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Investment Readiness */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-6 h-6 text-orange-600" />
              <h4 className="font-bold text-slate-900">Investment Readiness Enhancement</h4>
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              <div><strong>WHY Investors Care:</strong> Design quality indicates execution capability and team competence</div>
              <div><strong>HOW:</strong> UX affects scalability assessment and product-market fit validation</div>
              <div><strong>Impact:</strong> Design quality correlates with Series A success rates</div>
            </div>
          </div>

          {/* Market Expansion */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Globe className="w-6 h-6 text-teal-600" />
              <h4 className="font-bold text-slate-900">Market Expansion</h4>
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              <div><strong>HOW:</strong> Accessibility compliance opens new market segments</div>
              <div><strong>WHY:</strong> Mobile optimization captures majority traffic (68%)</div>
              <div><strong>Impact:</strong> Proper design can expand total addressable market by 15-20%</div>
            </div>
          </div>

          {/* Competitive Advantage */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Heart className="w-6 h-6 text-pink-600" />
              <h4 className="font-bold text-slate-900">Competitive Advantage</h4>
            </div>

            <div className="space-y-2 text-sm text-slate-700">
              <div><strong>HOW:</strong> Superior UX creates defensible moats and differentiation</div>
              <div><strong>WHY:</strong> Design quality affects customer lifetime value and retention</div>
              <div><strong>Impact:</strong> Design-led companies outperform by 228% in revenue growth</div>
            </div>
          </div>
        </div>
      </div>

      {/* Integration with Other Pillars */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Integration with Other Bailey Intelligence Pillars</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3">HOW Design Complements Code Intelligence</h4>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start space-x-2">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Design system implementation affects code maintainability</span>
              </li>
              <li className="flex items-start space-x-2">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Design decisions impact technical performance metrics</span>
              </li>
              <li className="flex items-start space-x-2">
                <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>Component architecture affects code organization</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-bold text-green-800 mb-3">HOW Design Validates Business Intelligence</h4>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start space-x-2">
                <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>User experience quality indicates product-market fit</span>
              </li>
              <li className="flex items-start space-x-2">
                <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Conversion optimization affects business model validation</span>
              </li>
              <li className="flex items-start space-x-2">
                <ChevronRight className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Accessibility compliance opens new customer segments</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-bold text-purple-800 mb-3">WHY Design Matters for Investment Intelligence</h4>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-start space-x-2">
                <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Design quality demonstrates execution capability</span>
              </li>
              <li className="flex items-start space-x-2">
                <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Design system maturity indicates scalability potential</span>
              </li>
              <li className="flex items-start space-x-2">
                <ChevronRight className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <span>Superior UX creates defensible competitive advantages</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ROI and Timeline Framework */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">ROI and Timeline Framework</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-white rounded-lg p-4 border">
              <ArrowUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-green-600">20-30%</div>
              <div className="text-sm text-slate-600">Revenue Increase</div>
              <div className="text-xs text-slate-500 mt-1">3-6 months</div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-lg p-4 border">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-blue-600">2-3x</div>
              <div className="text-sm text-slate-600">CAC Reduction</div>
              <div className="text-xs text-slate-500 mt-1">2-4 months</div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-lg p-4 border">
              <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-red-600">$500K</div>
              <div className="text-sm text-slate-600">Risk Prevention</div>
              <div className="text-xs text-slate-500 mt-1">Immediate</div>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-white rounded-lg p-4 border">
              <Zap className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-600">34%</div>
              <div className="text-sm text-slate-600">Dev Efficiency</div>
              <div className="text-xs text-slate-500 mt-1">8-12 weeks</div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border">
          <div className="font-medium text-indigo-800 mb-2">Strategic Value Proposition</div>
          <div className="text-sm text-slate-700">
            Design Intelligence provides quantifiable business impact through evidence-based evaluation rather than subjective aesthetic judgment.
            Every recommendation includes ROI calculations, implementation timelines, and risk assessments that enable informed strategic decisions
            about design investments and their expected business outcomes.
          </div>
        </div>
      </div>
    </div>
  );
}