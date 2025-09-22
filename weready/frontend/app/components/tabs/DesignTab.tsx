'use client';

import dynamic from 'next/dynamic';
import { Brain, BookOpen } from 'lucide-react';

const DesignIntelligenceMethodology = dynamic(() => import('../DesignIntelligenceMethodology'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
});

const DesignSourceAuthority = dynamic(() => import('../DesignSourceAuthority'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
});

const DesignBusinessImpact = dynamic(() => import('../DesignBusinessImpact'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
});

interface DesignTabProps {
  result: any;
}

export default function DesignTab({ result }: DesignTabProps) {

  return (
    <div className="space-y-8">

      {/* Design Intelligence Overview */}
      <div className="bg-gradient-to-r from-purple-50 via-violet-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Brain className="w-6 h-6 text-purple-600" />
          <span>Design Intelligence: Evidence-Based Design Evaluation</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">8</div>
            <div className="text-sm text-slate-600">Credible Sources</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-600 mb-1">6</div>
            <div className="text-sm text-slate-600">Analysis Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600 mb-1">40+</div>
            <div className="text-sm text-slate-600">Years of UX Research</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">98%</div>
            <div className="text-sm text-slate-600">Source Credibility</div>
          </div>
        </div>

        <p className="text-slate-700 text-center">
          Design Intelligence transforms subjective design opinions into objective business metrics. Unlike traditional design reviews,
          our methodology uses evidence-based evaluation backed by academic research and industry studies to assess how design decisions
          affect user acquisition, retention, conversion, and investment readiness.
        </p>
      </div>

      <DesignIntelligenceMethodology />

      <DesignSourceAuthority />

      <DesignBusinessImpact />

      {/* Evidence-Based Design Philosophy */}
      <div className="bg-white border-2 border-slate-200 rounded-xl p-6 mb-8">
        <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span>Evidence-Based Design Philosophy</span>
        </h4>

        <div className="space-y-4">
          {/* Academic Research Foundation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-800 mb-2">
                📚 Academic Research Foundation
              </div>
              <div className="text-sm text-slate-700">
                <strong>WHY:</strong> All recommendations grounded in peer-reviewed research with statistical validation and A/B testing data.
                Longitudinal studies inform best practices across multiple industries and contexts.
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-medium text-green-800 mb-2">
                📏 Objective Measurement Standards
              </div>
              <div className="text-sm text-slate-700">
                <strong>HOW:</strong> Quantifiable metrics like color contrast ratios, loading times, and conversion rates.
                Performance indicators tied to Core Web Vitals and accessibility compliance scores.
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-sm font-medium text-purple-800 mb-2">
                ⚖️ Cross-Source Validation Process
              </div>
              <div className="text-sm text-slate-700">
                <strong>WHAT:</strong> Recommendations verified across 8 credible sources with credibility weighting.
                Conflicts resolved through evidence strength and statistical significance.
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-sm font-medium text-orange-800 mb-2">
                🎯 Integration with Startup Assessment
              </div>
              <div className="text-sm text-slate-700">
                <strong>VALUE:</strong> Design intelligence as part of comprehensive startup readiness with risk-adjusted analysis.
                Actionable insights prioritized by business impact and implementation effort.
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
            <div className="text-sm font-medium text-indigo-800 mb-2">
              💡 Design Intelligence vs Traditional Design Reviews
            </div>
            <div className="text-sm text-slate-700">
              <strong>The Difference:</strong> Design Intelligence provides objective, evidence-based assessment rather than subjective aesthetic opinions.
              Every recommendation includes ROI calculations, statistical confidence intervals, and measurable business impact projections.
              This transforms design decisions from artistic preference to strategic business investment.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}