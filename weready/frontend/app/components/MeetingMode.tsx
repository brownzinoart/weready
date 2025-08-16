"use client";

import { useState } from "react";
import { Presentation, Zap, Shield, Brain, TrendingUp, X, Maximize2 } from "lucide-react";

interface MeetingModeProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    overall_score?: number;
    credibility_score?: number;
    market_percentile?: number;
    success_probability?: number;
    government_sources?: number;
    academic_papers?: number;
    github_repos?: number;
  };
}

export default function MeetingMode({ isOpen, onClose, data }: MeetingModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const metrics = [
    {
      label: "WeReady Score",
      value: data?.overall_score || 87,
      suffix: "/100",
      color: "text-violet-600",
      bg: "bg-violet-50",
      icon: Shield,
      description: "Overall startup readiness"
    },
    {
      label: "Credibility Score", 
      value: data?.credibility_score || 98,
      suffix: "%",
      color: "text-green-600",
      bg: "bg-green-50",
      icon: Brain,
      description: "Source authority validation"
    },
    {
      label: "Market Percentile",
      value: data?.market_percentile || 95,
      suffix: "th",
      color: "text-blue-600", 
      bg: "bg-blue-50",
      icon: TrendingUp,
      description: "Performance vs. competitors"
    },
    {
      label: "Success Probability",
      value: Math.round((data?.success_probability || 0.85) * 100),
      suffix: "%",
      color: "text-purple-600",
      bg: "bg-purple-50", 
      icon: Zap,
      description: "Predicted success likelihood"
    }
  ];

  const sources = [
    {
      label: "Government Sources",
      value: data?.government_sources || 15,
      color: "text-green-600"
    },
    {
      label: "Academic Papers", 
      value: data?.academic_papers || 127,
      color: "text-blue-600"
    },
    {
      label: "GitHub Repos",
      value: data?.github_repos || 89,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-6xl max-h-screen overflow-auto landscape:max-h-screen landscape:overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Presentation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Meeting Demo Mode</h2>
              <p className="text-slate-600">Live WeReady Intelligence Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
          {/* Key Metrics */}
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-4 md:mb-6 text-center">Key Performance Metrics</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 landscape:grid-cols-4 landscape:gap-4">
              {metrics.map((metric) => (
                <div key={metric.label} className={`${metric.bg} p-4 md:p-8 rounded-xl md:rounded-2xl border-2 border-opacity-20 border-current`}>
                  <div className="text-center">
                    <div className="flex justify-center mb-2 md:mb-4">
                      <metric.icon className={`w-8 h-8 md:w-12 md:h-12 ${metric.color}`} />
                    </div>
                    <div className={`text-3xl md:text-5xl font-bold ${metric.color} mb-1 md:mb-2 landscape:text-4xl`}>
                      {metric.value}{metric.suffix}
                    </div>
                    <div className="text-sm md:text-lg font-semibold text-slate-900 mb-1 md:mb-2 landscape:text-base">
                      {metric.label}
                    </div>
                    <div className="text-xs md:text-sm text-slate-600 landscape:text-xs">
                      {metric.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credibility Sources */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6 text-center">Data Source Authority</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sources.map((source) => (
                <div key={source.label} className="bg-slate-50 p-6 rounded-xl text-center">
                  <div className={`text-4xl font-bold ${source.color} mb-2`}>
                    {source.value}
                  </div>
                  <div className="text-lg font-semibold text-slate-900">
                    {source.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Competitive Advantage */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">WeReady's Unbeatable Advantage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-lg">
              <div>
                <div className="text-3xl font-bold mb-2">98%</div>
                <div>Government Source Credibility</div>
                <div className="text-sm text-violet-200 mt-1">vs 60-70% competitors</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">Real-Time</div>
                <div>Live Data Access</div>
                <div className="text-sm text-violet-200 mt-1">ChatGPT cannot provide</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">Multi-Source</div>
                <div>Evidence Validation</div>
                <div className="text-sm text-violet-200 mt-1">Academic + Government + Industry</div>
              </div>
            </div>
          </div>

          {/* Navigation Hint */}
          <div className="text-center text-slate-500 text-sm">
            <p>💡 Swipe left/right or use arrow keys to navigate between features</p>
          </div>
        </div>
      </div>
    </div>
  );
}