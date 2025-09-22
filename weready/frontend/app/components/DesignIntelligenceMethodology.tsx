'use client';

import { Cpu, TestTube, BookOpen, BarChart3, Scale, Layout, Accessibility, Eye, TrendingUp, Zap, Smartphone } from 'lucide-react';

export default function DesignIntelligenceMethodology() {
  return (
    <div className="space-y-8">

      {/* Design Intelligence Framework Explanation */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Cpu className="w-6 h-6 text-blue-600" />
          <span>Design Intelligence Framework Explanation</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 6-Category Analysis Framework */}
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="text-lg font-bold text-slate-900 mb-4">6-Category Analysis Framework</h4>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Layout className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-slate-900">Design System Maturity</div>
                  <div className="text-sm text-slate-600">Token systems, component consistency, documentation quality</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Accessibility className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-slate-900">Accessibility Compliance</div>
                  <div className="text-sm text-slate-600">WCAG 2.1 AA standards, legal risk mitigation</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-medium text-slate-900">User Experience Quality</div>
                  <div className="text-sm text-slate-600">Nielsen Norman heuristics, usability principles</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-medium text-slate-900">Conversion Optimization</div>
                  <div className="text-sm text-slate-600">A/B tested patterns, trust signals, form optimization</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-slate-900">Performance UX</div>
                  <div className="text-sm text-slate-600">Core Web Vitals, loading performance, interactivity</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-teal-600" />
                <div>
                  <div className="font-medium text-slate-900">Mobile Experience</div>
                  <div className="text-sm text-slate-600">Mobile-first design, touch targets, responsive optimization</div>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Points */}
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Integration with Other Pillars</h4>

            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800">Code Intelligence</div>
                <div className="text-sm text-slate-700">Design system implementation affects technical debt and development velocity</div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="font-medium text-green-800">Business Intelligence</div>
                <div className="text-sm text-slate-700">User experience quality validates product-market fit and affects customer lifetime value</div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="font-medium text-purple-800">Investment Intelligence</div>
                <div className="text-sm text-slate-700">Design quality indicates scalability potential and team execution capability</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Process Demonstration */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Analytical Process Demonstration</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Design System Maturity Assessment */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-bold text-blue-800 mb-3">Design System Maturity Assessment</h4>
            <div className="space-y-2 text-sm text-slate-700">
              <div><strong>HOW:</strong> Evaluates token systems, component consistency, and documentation quality</div>
              <div><strong>WHY:</strong> Mature design systems reduce development costs and improve consistency</div>
              <div><strong>VALIDATION:</strong> Cross-referenced with Material Design and Apple HIG standards</div>
            </div>
          </div>

          {/* Accessibility Compliance Evaluation */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-bold text-green-800 mb-3">Accessibility Compliance Evaluation</h4>
            <div className="space-y-2 text-sm text-slate-700">
              <div><strong>HOW:</strong> Automated and manual testing against WCAG 2.1 AA standards</div>
              <div><strong>WHY:</strong> Prevents legal liability and expands addressable market</div>
              <div><strong>VALIDATION:</strong> Verified using WebAIM testing methodologies</div>
            </div>
          </div>

          {/* User Experience Quality Analysis */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-bold text-purple-800 mb-3">User Experience Quality Analysis</h4>
            <div className="space-y-2 text-sm text-slate-700">
              <div><strong>HOW:</strong> Heuristic evaluation using Nielsen Norman Group principles</div>
              <div><strong>WHY:</strong> Affects user acquisition costs and retention rates</div>
              <div><strong>VALIDATION:</strong> Grounded in 40+ years of UX research</div>
            </div>
          </div>

          {/* Conversion Optimization Assessment */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-bold text-orange-800 mb-3">Conversion Optimization Assessment</h4>
            <div className="space-y-2 text-sm text-slate-700">
              <div><strong>HOW:</strong> Analysis using GoodUI and Baymard research patterns</div>
              <div><strong>WHY:</strong> Directly affects revenue through improved conversion rates</div>
              <div><strong>VALIDATION:</strong> Based on A/B testing data with statistical significance</div>
            </div>
          </div>

          {/* Performance UX Evaluation */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-3">Performance UX Evaluation</h4>
            <div className="space-y-2 text-sm text-slate-700">
              <div><strong>HOW:</strong> Core Web Vitals assessment using Chrome UX Report benchmarks</div>
              <div><strong>WHY:</strong> Affects SEO rankings and user satisfaction scores</div>
              <div><strong>VALIDATION:</strong> Based on real user data from millions of websites</div>
            </div>
          </div>

          {/* Mobile Experience Optimization */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
            <h4 className="font-bold text-teal-800 mb-3">Mobile Experience Optimization</h4>
            <div className="space-y-2 text-sm text-slate-700">
              <div><strong>HOW:</strong> Mobile-first design evaluation using platform guidelines</div>
              <div><strong>WHY:</strong> Critical for 68% of web traffic from mobile devices</div>
              <div><strong>VALIDATION:</strong> Apple HIG and Material Design mobile standards</div>
            </div>
          </div>
        </div>
      </div>

      {/* Evidence-Based Approach */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Evidence-Based Approach</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <TestTube className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h4 className="font-bold text-slate-900">A/B Testing Validation</h4>
                <p className="text-sm text-slate-700">Statistical significance testing with confidence intervals ensures reliable recommendations</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <BookOpen className="w-6 h-6 text-indigo-600 mt-1" />
              <div>
                <h4 className="font-bold text-slate-900">Academic Research Foundation</h4>
                <p className="text-sm text-slate-700">Peer-reviewed research and longitudinal studies from leading UX institutions</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <BarChart3 className="w-6 h-6 text-pink-600 mt-1" />
              <div>
                <h4 className="font-bold text-slate-900">Statistical Validation</h4>
                <p className="text-sm text-slate-700">Cross-industry benchmarking with sample sizes ensuring statistical relevance</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Scale className="w-6 h-6 text-violet-600 mt-1" />
              <div>
                <h4 className="font-bold text-slate-900">Cross-Source Verification</h4>
                <p className="text-sm text-slate-700">Multiple authority validation with credibility weighting for recommendation reliability</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg border">
          <div className="font-medium text-indigo-800 mb-2">Methodology Validation</div>
          <div className="text-sm text-slate-700">
            Unlike subjective design reviews, Design Intelligence uses quantifiable metrics backed by academic research.
            Every recommendation includes business impact calculations, ROI projections, and implementation effort estimates
            based on real-world data from thousands of design implementations across multiple industries.
          </div>
        </div>
      </div>
    </div>
  );
}