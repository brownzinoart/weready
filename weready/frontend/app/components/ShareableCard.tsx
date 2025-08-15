"use client";
import { motion } from "framer-motion";
import { Award, TrendingUp, Shield, Download, Share2, ExternalLink } from "lucide-react";
import { useRef } from "react";

interface ShareableCardProps {
  score: number;
  verdict: string;
  wereadyStampEligible: boolean;
  breakdown: any;
  marketContext?: any;
  repoInfo?: any;
}

export default function ShareableCard({
  score,
  verdict,
  wereadyStampEligible,
  breakdown,
  marketContext,
  repoInfo
}: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const getScoreGradient = (score: number) => {
    if (score >= 85) return "from-emerald-600 to-teal-700";
    if (score >= 70) return "from-blue-600 to-indigo-700";
    if (score >= 50) return "from-amber-600 to-orange-700";
    return "from-red-600 to-rose-700";
  };

  const getVerdictText = (verdict: string) => {
    switch (verdict) {
      case "ready_to_ship": return "Investment Ready";
      case "needs_work": return "Development Stage";
      case "critical_issues": return "Pre-Launch Review";
      default: return "Assessment Complete";
    }
  };

  const shareCard = async () => {
    const shareText = `📊 WeReady Assessment Complete: ${score}/100\n\n${getVerdictText(verdict)} - ${marketContext?.percentile || 'Evaluated'}\n\n${wereadyStampEligible ? "✅ WeReady Certified for launch readiness" : "Comprehensive startup assessment complete"}\n\nProfessional startup analysis at WeReady.io`;
    
    if (navigator.share) {
      await navigator.share({
        title: `WeReady Assessment: ${score}/100`,
        text: shareText,
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("Assessment summary copied to clipboard");
    }
  };

  return (
    <div className="space-y-6">
      {/* Professional Assessment Certificate */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className={`bg-gradient-to-r ${getScoreGradient(score)} p-8 text-white relative`}>
            <div className="absolute top-6 right-6">
              <Shield className="w-8 h-8 opacity-60" />
            </div>
            
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <Award className="w-4 h-4" />
                  <span className="text-sm font-medium">WeReady Assessment</span>
                </div>
              </div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <div className="text-6xl font-bold mb-2">
                  {score}
                  <span className="text-2xl opacity-80">/100</span>
                </div>
                <div className="text-xl font-semibold opacity-90">
                  Startup Readiness Score
                </div>
              </motion.div>
              
              <div className="text-lg font-medium opacity-90 mb-2">
                {getVerdictText(verdict)}
              </div>
              
              {marketContext && (
                <div className="text-sm opacity-75">
                  {marketContext.percentile} • {marketContext.comparison}
                </div>
              )}
            </div>
          </div>
          
          {/* Assessment Details */}
          <div className="p-8 space-y-6">
            {/* Core Metrics */}
            <div>
              <h3 className="font-bold text-slate-900 mb-4 text-center">Assessment Breakdown</h3>
              
              <div className="space-y-3">
                {breakdown && Object.entries(breakdown).map(([category, data]: [string, any]) => {
                  const categoryLabels = {
                    code_quality: "Code Quality",
                    business_model: "Business Model",
                    investment_ready: "Investment Readiness"
                  };
                  
                  return (
                    <div key={category} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                      <div>
                        <div className="font-medium text-slate-900">
                          {categoryLabels[category as keyof typeof categoryLabels]}
                        </div>
                        <div className="text-sm text-slate-600">
                          {data.weight}% weight • {data.status}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-900">
                          {data.score}
                        </div>
                        <div className="text-xs text-slate-500">
                          /100
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Certification Status */}
            {wereadyStampEligible && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center"
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <span className="font-bold text-emerald-900">WeReady Certified</span>
                </div>
                <div className="text-sm text-emerald-700">
                  This startup meets our investment readiness criteria
                </div>
              </motion.div>
            )}
            
            {/* Repository Information */}
            {repoInfo && (
              <div className="bg-slate-100 rounded-lg p-4 text-center border">
                <div className="text-sm text-slate-600 mb-1">Repository Analyzed</div>
                <div className="font-medium text-slate-900">
                  {repoInfo.owner}/{repoInfo.name}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-200 p-6 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900">WeReady.io</span>
            </div>
            <div className="text-xs text-slate-600">
              Professional Startup Assessment Platform
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={shareCard}
          className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Share2 className="w-5 h-5" />
          <span>Share Assessment</span>
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:bg-slate-50 transition-all"
        >
          <ExternalLink className="w-5 h-5" />
          <span>View Full Report</span>
        </motion.button>
      </div>
      
      {/* Professional Credentials */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-900 mb-4 text-center">Assessment Credentials</h3>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Professional Assessment Badge */}
          <div className="border border-slate-200 rounded-lg p-4 text-center bg-slate-50">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold text-slate-900 text-sm">Professional Assessment</div>
            <div className="text-xs text-slate-600">Comprehensive 3-pillar analysis</div>
          </div>
          
          {/* Code Quality Validation */}
          {breakdown?.code_quality?.score >= 80 && (
            <div className="border border-emerald-200 rounded-lg p-4 text-center bg-emerald-50">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-semibold text-emerald-900 text-sm">Code Quality Validated</div>
              <div className="text-xs text-emerald-700">AI hallucination-free codebase</div>
            </div>
          )}
          
          {/* Investment Grade */}
          {wereadyStampEligible && (
            <div className="border border-blue-200 rounded-lg p-4 text-center bg-blue-50">
              <div className="text-2xl mb-2">💼</div>
              <div className="font-semibold text-blue-900 text-sm">Investment Grade</div>
              <div className="text-xs text-blue-700">Meets institutional standards</div>
            </div>
          )}
          
          {/* Market Positioning */}
          {score >= 70 && (
            <div className="border border-violet-200 rounded-lg p-4 text-center bg-violet-50">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-violet-900 text-sm">Market Competitive</div>
              <div className="text-xs text-violet-700">Above-average startup performance</div>
            </div>
          )}
        </div>
        
        {/* Assessment Methodology */}
        <div className="mt-6 p-4 bg-slate-100 rounded-lg">
          <div className="text-sm font-medium text-slate-900 mb-2">Assessment Methodology</div>
          <div className="text-xs text-slate-600 space-y-1">
            <div>• Code Quality: AST analysis, dependency validation</div>
            <div>• Business Model: Market fit and revenue potential</div>
            <div>• Investment Ready: Scalability and fundability metrics</div>
          </div>
        </div>
      </div>
    </div>
  );
}