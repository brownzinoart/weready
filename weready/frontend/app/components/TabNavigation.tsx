'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';
import { BarChart3, Code, Building, Target, Palette, Lock, Award, Brain, Shield, CheckCircle, ArrowRight, Calendar, AlertTriangle, Zap, TrendingUp, Users } from 'lucide-react';
import CodeTab from './tabs/CodeTab';
import BusinessTab from './tabs/BusinessTab';
import InvestmentTab from './tabs/InvestmentTab';
import DesignTab from './tabs/DesignTab';

interface TabNavigationProps {
  result: any;
  isFreeTier?: boolean;
}

export default function TabNavigation({ result, isFreeTier = true }: TabNavigationProps) {
  const tabs = [
    {
      name: 'Overview',
      icon: BarChart3,
      component: 'OverviewTab',
      locked: false,
      description: 'Complete summary and key insights'
    },
    {
      name: 'Code',
      icon: Code,
      component: 'CodeTab',
      locked: isFreeTier,
      description: 'AI detection, quality analysis, technical depth'
    },
    {
      name: 'Business',
      icon: Building,
      component: 'BusinessTab',
      locked: isFreeTier,
      description: 'Revenue model, market validation, unit economics'
    },
    {
      name: 'Investment',
      icon: Target,
      component: 'InvestmentTab',
      locked: isFreeTier,
      description: 'Funding readiness, metrics, scalability analysis'
    },
    {
      name: 'Design',
      icon: Palette,
      component: 'DesignTab',
      locked: isFreeTier,
      description: 'UX/UI quality, accessibility, conversion optimization'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      <Tab.Group>
        <Tab.List className="flex overflow-x-auto scrollbar-hide border-b border-slate-200 bg-slate-50 scroll-smooth">
          {tabs.map((tab, index) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `relative flex-1 min-w-[120px] px-3 sm:px-4 py-4 text-xs sm:text-sm font-medium focus:outline-none transition-all whitespace-nowrap ${
                  selected
                    ? 'text-violet-600 bg-white border-b-2 border-violet-600'
                    : 'text-slate-600 hover:text-slate-900'
                } ${tab.locked ? 'cursor-not-allowed' : 'cursor-pointer'}`
              }
              disabled={tab.locked}
            >
              {({ selected }) => (
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <tab.icon className={`w-5 h-5 ${tab.locked ? 'text-slate-400' : ''}`} />
                  <span className={tab.locked ? 'text-slate-400' : ''}>{tab.name}</span>
                  {tab.locked && <Lock className="w-4 h-4 text-amber-500" />}
                  {selected && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
              )}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          {tabs.map((tab, index) => (
            <Tab.Panel key={tab.name} className="p-6">
              {tab.locked ? (
                <LockedContent tabName={tab.name} description={tab.description} />
              ) : (
                <TabContent tabComponent={tab.component} result={result} />
              )}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

function LockedContent({ tabName, description }: { tabName: string; description: string }) {
  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
          <Lock className="w-12 h-12 text-amber-600" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-slate-900 mb-3">
        Premium {tabName} Analysis
      </h3>
      
      <p className="text-lg text-slate-600 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
          <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
          <span>Deep technical analysis with code examples</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
          <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
          <span>Evidence-based recommendations with sources</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
          <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
          <span>Implementation guides and ROI calculations</span>
        </div>
      </div>
      
      <button className="bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold px-8 py-3 rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg">
        Start Free 7-Day Trial
      </button>
      
      <p className="text-xs text-slate-500 mt-4">
        No credit card required • Unlimited reports • Cancel anytime
      </p>
    </div>
  );
}

function OverviewTab({ result }: { result: any }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs_work': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getVerdictDisplay = (verdict: string) => {
    switch (verdict) {
      case 'ready_to_ship': return { emoji: '🚀', text: 'Ready to Ship', color: 'text-green-600' };
      case 'needs_work': return { emoji: '📈', text: 'Development Stage', color: 'text-yellow-600' };
      case 'critical_issues': return { emoji: '🛠️', text: 'Pre-Launch Review', color: 'text-red-600' };
      default: return { emoji: '⚠️', text: 'Assessment Complete', color: 'text-slate-600' };
    }
  };

  const verdictInfo = getVerdictDisplay(result.verdict);

  return (
    <div className="space-y-8">
      {/* Quick Status Overview */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
        <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Brain className="w-6 h-6 text-indigo-600" />
          <span>Analysis Summary</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${verdictInfo.color}`}>
              {verdictInfo.emoji}
            </div>
            <div className="text-lg font-semibold text-slate-900 mb-1">{verdictInfo.text}</div>
            <div className="text-sm text-slate-600">Current Status</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-violet-600 mb-2">
              {result.success_probability ? Math.round(result.success_probability * 100) : 65}%
            </div>
            <div className="text-lg font-semibold text-slate-900 mb-1">Success Rate</div>
            <div className="text-sm text-slate-600">Based on similar startups</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">
              {result.market_percentile || 68}
            </div>
            <div className="text-lg font-semibold text-slate-900 mb-1">Percentile</div>
            <div className="text-sm text-slate-600">Market position</div>
          </div>
        </div>

        {result.weready_stamp_eligible && (
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg">
              <Award className="w-5 h-5" />
              <span>WeReady Stamp Eligible</span>
            </div>
          </div>
        )}
      </div>

      {/* Four Pillar Breakdown */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-900 text-center">Four-Pillar Analysis Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(result.breakdown || {}).map(([category, data]: [string, any]) => {
            const categoryName = category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
            const getIcon = (cat: string) => {
              switch (cat) {
                case 'code_quality': return { icon: <Code className="w-6 h-6" />, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
                case 'business_model': return { icon: <Building className="w-6 h-6" />, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
                case 'investment_ready': return { icon: <Target className="w-6 h-6" />, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' };
                case 'design_experience': return { icon: <Palette className="w-6 h-6" />, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200' };
                default: return { icon: <BarChart3 className="w-6 h-6" />, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };
              }
            };
            
            const iconData = getIcon(category);
            
            return (
              <div key={category} className={`${iconData.bg} border-2 ${iconData.border} rounded-xl p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={iconData.color}>
                      {iconData.icon}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">{categoryName}</h4>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(data.score || 0)}`}>
                      {data.score || 0}/100
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(data.status || 'unknown')}`}>
                      {(data.status || 'unknown').replace('_', ' ')}
                    </div>
                  </div>
                </div>
                
                {/* Issues */}
                {data.issues && data.issues.length > 0 && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-slate-700 mb-2">Key Issues:</div>
                    <ul className="space-y-1">
                      {data.issues.slice(0, 2).map((issue: string, idx: number) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Recommendations */}
                {data.recommendations && data.recommendations.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">Top Recommendations:</div>
                    <ul className="space-y-1">
                      {data.recommendations.slice(0, 2).map((rec: string, idx: number) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Steps Timeline */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <span>Recommended Timeline</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              1W
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">This Week</h4>
              <p className="text-sm text-slate-600 mb-2">Address critical issues and security vulnerabilities</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Security fixes</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">Performance audit</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              1M
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">Next Month</h4>
              <p className="text-sm text-slate-600 mb-2">Market validation and team building</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Customer research</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Hiring plan</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              3M
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">Next Quarter</h4>
              <p className="text-sm text-slate-600 mb-2">Scale and optimize for growth</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Product roadmap</span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">Funding prep</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Recommendations */}
      {result.brain_recommendations && result.brain_recommendations.length > 0 && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <Brain className="w-6 h-6 text-violet-600" />
            <span>Priority Action Items</span>
          </h3>
          
          <div className="space-y-4">
            {result.brain_recommendations.slice(0, 4).map((rec: any, idx: number) => {
              const getPriorityColor = (priority: string) => {
                switch (priority) {
                  case 'critical': return 'bg-red-100 text-red-800 border-red-200';
                  case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
                  case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                  case 'low': return 'bg-green-100 text-green-800 border-green-200';
                  default: return 'bg-slate-100 text-slate-800 border-slate-200';
                }
              };

              return (
                <div key={idx} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getPriorityColor(rec.priority)}`}>
                          {rec.priority} priority
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                          {rec.category?.replace('_', ' ')}
                        </span>
                      </div>
                      <h5 className="font-semibold text-slate-900 mb-1">{rec.title}</h5>
                      <p className="text-sm text-slate-600 mb-2">{rec.description}</p>
                      <div className="text-xs text-slate-500">
                        Timeline: {rec.timeline} • Confidence: {Math.round((rec.confidence || 0) * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-violet-50 border border-violet-200 rounded p-3 mt-3">
                    <div className="text-sm">
                      <strong className="text-violet-800">Expected Impact:</strong>
                      <span className="text-slate-700 ml-2">{rec.impact}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Competitive Moats & Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Competitive Moats */}
        {result.competitive_moats && result.competitive_moats.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Competitive Moats</span>
            </h4>
            <ul className="space-y-2">
              {result.competitive_moats.map((moat: string, idx: number) => (
                <li key={idx} className="flex items-center space-x-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{moat}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        {result.next_steps && result.next_steps.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              <span>Immediate Next Steps</span>
            </h4>
            <ul className="space-y-2">
              {result.next_steps.map((step: string, idx: number) => (
                <li key={idx} className="flex items-center space-x-2 text-slate-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Improvement Roadmap */}
      {result.improvement_roadmap && (
        <div className="bg-white border-2 border-slate-200 rounded-xl p-8">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <span>Strategic Improvement Roadmap</span>
          </h3>
          
          <div className="space-y-8">
            {/* Immediate Actions (0-2 weeks) */}
            {result.improvement_roadmap.immediate && result.improvement_roadmap.immediate.length > 0 && (
              <div className="relative">
                <div className="flex items-center mb-4">
                  <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                    1
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Immediate Actions</h4>
                    <p className="text-sm text-slate-600">Critical fixes - Start within 0-2 weeks</p>
                  </div>
                </div>
                
                <div className="ml-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.improvement_roadmap.immediate.map((item: string, idx: number) => (
                    <div key={idx} className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-1">{item}</h5>
                          <p className="text-sm text-slate-600 mb-2">
                            {getImmediateActionContext(item)}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>⏱️ 0-2 weeks</span>
                            <span>🔥 High urgency</span>
                            <span>👤 {getImmediateActionEffort(item)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Short-term Goals (1-3 months) */}
            {result.improvement_roadmap.short_term && result.improvement_roadmap.short_term.length > 0 && (
              <div className="relative">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                    2
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Short-term Goals</h4>
                    <p className="text-sm text-slate-600">Foundation building - Complete within 1-3 months</p>
                  </div>
                </div>
                
                <div className="ml-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.improvement_roadmap.short_term.map((item: string, idx: number) => (
                    <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                      <div className="flex items-start space-x-3">
                        <Zap className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-1">{item}</h5>
                          <p className="text-sm text-slate-600 mb-2">
                            {getShortTermGoalContext(item)}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>📅 1-3 months</span>
                            <span>⚡ Medium priority</span>
                            <span>👥 {getShortTermGoalEffort(item)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Long-term Vision (3-12 months) */}
            {result.improvement_roadmap.long_term && result.improvement_roadmap.long_term.length > 0 && (
              <div className="relative">
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-4">
                    3
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">Long-term Vision</h4>
                    <p className="text-sm text-slate-600">Strategic growth - Execute over 3-12 months</p>
                  </div>
                </div>
                
                <div className="ml-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.improvement_roadmap.long_term.map((item: string, idx: number) => (
                    <div key={idx} className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                      <div className="flex items-start space-x-3">
                        <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-1">{item}</h5>
                          <p className="text-sm text-slate-600 mb-2">
                            {getLongTermVisionContext(item)}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-slate-500">
                            <span>🗓️ 3-12 months</span>
                            <span>🎯 Strategic</span>
                            <span>🏢 {getLongTermVisionEffort(item)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Roadmap Summary */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-indigo-600" />
              <span>Roadmap Success Metrics</span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600 mb-1">
                  {getRoadmapTimeframe(result)}
                </div>
                <div className="text-sm text-slate-600">Est. Timeline to {result.weready_stamp_eligible ? 'Optimization' : 'WeReady Stamp'}</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {getRoadmapROI(result)}
                </div>
                <div className="text-sm text-slate-600">Expected Score Improvement</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Context */}
      {result.market_context && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 text-center">
          <h4 className="text-lg font-bold text-slate-900 mb-3">Market Context</h4>
          <div className="text-2xl font-bold text-purple-600 mb-2">
            {result.market_context.percentile || 'Top 40%'}
          </div>
          <div className="text-slate-600">
            {result.market_context.comparison || 'Typical early-stage startup performance'}
          </div>
        </div>
      )}
    </div>
  );
}

function TabContent({ tabComponent, result }: { tabComponent: string; result: any }) {
  switch (tabComponent) {
    case 'OverviewTab':
      return <OverviewTab result={result} />;
    case 'CodeTab':
      return <CodeTab result={result} />;
    case 'BusinessTab':
      return <BusinessTab result={result} />;
    case 'InvestmentTab':
      return <InvestmentTab result={result} />;
    case 'DesignTab':
      return <DesignTab result={result} />;
    default:
      return (
        <div className="text-center py-8">
          <p className="text-slate-600">Loading {tabComponent}...</p>
        </div>
      );
  }
}

// Helper functions for roadmap context
function getImmediateActionContext(item: string): string {
  const contexts: {[key: string]: string} = {
    'Finalize test coverage': 'Critical for deployment safety. Current gaps expose you to production failures.',
    'Update pitch deck': 'Essential for upcoming investor meetings. Market timing is crucial.',
    'Customer interview program': 'Validate product-market fit before scaling. Prevents costly pivots.',
    'Error monitoring setup': 'Immediate visibility into production issues. Reduces customer churn.',
    'Security vulnerability fixes': 'Address critical security issues to prevent data breaches.',
    'Basic testing setup': 'Establish foundation for safe code deployment and iteration.',
    'Remove hardcoded secrets': 'Immediate security risk that could expose sensitive data.',
    'Add basic input validation': 'Prevent injection attacks and data corruption issues.'
  };
  return contexts[item] || 'High-priority action item requiring immediate attention to reduce risk.';
}

function getImmediateActionEffort(item: string): string {
  const efforts: {[key: string]: string} = {
    'Finalize test coverage': '1-2 devs',
    'Update pitch deck': 'Solo founder',
    'Customer interview program': 'Solo founder',
    'Error monitoring setup': '1 dev',
    'Security vulnerability fixes': '1-2 devs',
    'Basic testing setup': '1 dev',
    'Remove hardcoded secrets': '1 dev',
    'Add basic input validation': '1 dev'
  };
  return efforts[item] || '1 dev';
}

function getShortTermGoalContext(item: string): string {
  const contexts: {[key: string]: string} = {
    'Implement analytics dashboard': 'Data-driven decision making foundation. Essential for tracking KPIs.',
    'Prepare due diligence room': 'Streamline investor process. Demonstrates professionalism and transparency.',
    'Pricing optimization': 'Optimize revenue per customer. A/B test different pricing strategies.',
    'Product-market fit validation': 'Comprehensive validation through customer feedback and usage analytics.',
    'Implement comprehensive logging': 'Full observability stack for debugging and performance monitoring.',
    'A/B test pricing strategies': 'Optimize revenue through systematic pricing experimentation.',
    'Business model reassessment': 'Fundamental review of value proposition and revenue model.',
    'Comprehensive security audit': 'Full security review to identify and fix all vulnerabilities.'
  };
  return contexts[item] || 'Foundation-building initiative that strengthens core business capabilities.';
}

function getShortTermGoalEffort(item: string): string {
  const efforts: {[key: string]: string} = {
    'Implement analytics dashboard': '2-3 devs',
    'Prepare due diligence room': 'Small team',
    'Pricing optimization': 'Product + eng',
    'Product-market fit validation': 'Founder-led',
    'Implement comprehensive logging': '1-2 devs',
    'A/B test pricing strategies': 'Product + eng',
    'Business model reassessment': 'Founder + advisor',
    'Comprehensive security audit': 'Security expert'
  };
  return efforts[item] || 'Small team';
}

function getLongTermVisionContext(item: string): string {
  const contexts: {[key: string]: string} = {
    'Series A fundraising': 'Scale operations and accelerate growth with institutional funding.',
    'International expansion planning': 'Strategic market expansion to capture global opportunities.',
    'Microservices architecture consideration': 'Scalable technical architecture to support 10x growth.',
    'Performance optimization': 'Advanced optimizations for enterprise-scale performance.',
    'Feature expansion': 'Strategic product development based on validated customer needs.',
    'Team strengthening': 'Build world-class team across key functions for scale.',
    'Product pivot consideration': 'Strategic pivot based on market learnings and opportunity assessment.',
    'Complete architecture redesign': 'Ground-up technical rebuild for scalability and maintainability.'
  };
  return contexts[item] || 'Strategic initiative that positions the company for long-term success and scale.';
}

function getLongTermVisionEffort(item: string): string {
  const efforts: {[key: string]: string} = {
    'Series A fundraising': 'Executive team',
    'International expansion planning': 'Full company',
    'Microservices architecture consideration': 'Engineering team',
    'Performance optimization': 'Senior devs',
    'Feature expansion': 'Product + eng',
    'Team strengthening': 'Leadership',
    'Product pivot consideration': 'All hands',
    'Complete architecture redesign': 'Tech leadership'
  };
  return efforts[item] || 'Team effort';
}

function getRoadmapTimeframe(result: any): string {
  if (result.overall_score >= 80) return '3-6 months';
  if (result.overall_score >= 60) return '6-12 months';
  return '12-18 months';
}


function getRoadmapROI(result: any): string {
  if (result.overall_score >= 80) return '+8-15 points';
  if (result.overall_score >= 60) return '+15-25 points';
  return '+25-40 points';
}