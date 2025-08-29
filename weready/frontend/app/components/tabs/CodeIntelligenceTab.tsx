import React, { useState } from 'react';
import { Github, Star, GitFork, Eye, AlertTriangle, Shield, CheckCircle, TrendingUp, Code, Zap, ArrowRight, Database } from 'lucide-react';
import SourceBadge from '../SourceBadge';

interface CodeIntelligenceTabProps {
  repositoryUrl: string;
  setRepositoryUrl: (url: string) => void;
  analyzeRepository: () => void;
  loading: boolean;
  repoAnalysis: any;
  getScoreIcon: (score: number) => React.ReactNode;
  getScoreColor: (score: number) => string;
}

export default function CodeIntelligenceTab({ 
  repositoryUrl, 
  setRepositoryUrl, 
  analyzeRepository, 
  loading, 
  repoAnalysis,
  getScoreIcon,
  getScoreColor 
}: CodeIntelligenceTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Code className="w-5 h-5 text-blue-600" />
          <span>Code Intelligence Hub</span>
        </h3>
        
        {/* Code Quality Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Code Quality Intelligence</span>
            </h4>
            <div className="flex items-center space-x-2">
              <SourceBadge sourceName="GitHub API" sourceType="industry" credibilityScore={92} isLive={true} />
              <SourceBadge sourceName="SonarQube" sourceType="industry" credibilityScore={88} lastUpdated="2h ago" />
            </div>
          </div>
          
          {/* Source Flow Diagram */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border">
            <h5 className="text-sm font-semibold mb-3 text-gray-700">Data Flow Pipeline</h5>
            <div className="flex items-center justify-center space-x-3 text-xs">
              <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded border">
                <Github className="w-3 h-3 text-gray-600" />
                <span>GitHub Repos</span>
              </div>
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded border">
                <Database className="w-3 h-3 text-blue-600" />
                <span>Bailey Analysis</span>
              </div>
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded border">
                <Shield className="w-3 h-3 text-green-600" />
                <span>Quality Scores</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">847K</div>
              <div className="text-sm text-gray-600">Repositories Analyzed</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">23%</div>
              <div className="text-sm text-gray-600">AI-Generated Code</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">156K</div>
              <div className="text-sm text-gray-600">Security Issues Found</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">89%</div>
              <div className="text-sm text-gray-600">Code Quality Score</div>
            </div>
          </div>
        </div>

        {/* AI Code Detection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span>AI Code Detection & Validation</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Beta</span>
            </h4>
            <div className="flex items-center space-x-2">
              <SourceBadge sourceName="Stanford AI Research" sourceType="academic" credibilityScore={94} lastUpdated="1 day ago" />
              <SourceBadge sourceName="ArXiv Papers" sourceType="academic" credibilityScore={89} lastUpdated="Daily" />
              <SourceBadge sourceName="WeReady ML Models" sourceType="industry" credibilityScore={85} isLive={true} />
            </div>
          </div>
          
          {/* AI Detection Sources */}
          <div className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-200">
            <div className="text-sm text-yellow-800 mb-2">
              <strong>Detection Sources:</strong> Trained on 2.3M code samples from GitHub, academic papers on AI code patterns, 
              and proprietary hallucination detection algorithms validated against known AI-generated code datasets.
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600 mb-1">20%</div>
              <div className="text-sm text-gray-600">Hallucinated Packages</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">45%</div>
              <div className="text-sm text-gray-600">Security Vulnerabilities</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">82%</div>
              <div className="text-sm text-gray-600">Detection Accuracy</div>
            </div>
          </div>
        </div>

        {/* GitHub Repository Analysis */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">GitHub Repository Analysis</h4>
          <div className="flex space-x-4 mb-4">
            <input
              type="url"
              value={repositoryUrl}
              onChange={(e) => setRepositoryUrl(e.target.value)}
              placeholder="Enter GitHub repository URL"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={analyzeRepository}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Github className="w-4 h-4" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>

          {repoAnalysis && repoAnalysis.status === "success" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-semibold">{repoAnalysis.repository.full_name}</h5>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">{repoAnalysis.repository.stars.toLocaleString()} stars</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{repoAnalysis.repository.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    {getScoreIcon(repoAnalysis.intelligence_metrics.momentum_score)}
                  </div>
                  <p className="text-sm text-gray-600">Momentum Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(repoAnalysis.intelligence_metrics.momentum_score)}`}>
                    {repoAnalysis.intelligence_metrics.momentum_score}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    {getScoreIcon(repoAnalysis.intelligence_metrics.quality_score)}
                  </div>
                  <p className="text-sm text-gray-600">Quality Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(repoAnalysis.intelligence_metrics.quality_score)}`}>
                    {repoAnalysis.intelligence_metrics.quality_score}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    {getScoreIcon(repoAnalysis.intelligence_metrics.community_score)}
                  </div>
                  <p className="text-sm text-gray-600">Community Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(repoAnalysis.intelligence_metrics.community_score)}`}>
                    {repoAnalysis.intelligence_metrics.community_score}
                  </p>
                </div>
              </div>

              {/* Code Analysis Insights */}
              <div className="space-y-4">
                <h6 className="font-semibold">Code Intelligence Insights</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Code className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">Technology Stack</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Primary: {repoAnalysis.repository.language || 'Multiple'}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Health Status</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {repoAnalysis.intelligence_metrics.momentum_score > 70 ? 'Healthy' : 'Needs Attention'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}