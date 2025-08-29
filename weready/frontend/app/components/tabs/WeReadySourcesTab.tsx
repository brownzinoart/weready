import React from 'react';
import { BookOpen, Shield, Database, TrendingUp, CheckCircle, AlertTriangle, Clock, DollarSign } from 'lucide-react';

export default function WeReadySourcesTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span>WeReady Sources Methodology</span>
        </h3>
        
        {/* Methodology Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4 text-blue-800">Our Intelligence Philosophy</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-blue-700 mb-4">
                Bailey is WeReady's constantly-learning knowledge engine that transforms raw data from authoritative sources 
                into actionable intelligence for founders. We prioritize credibility, transparency, and cost-efficiency.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>95% insights from free sources</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>10+ authoritative source citations per recommendation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>&lt;$200/month total data spend</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <h5 className="font-semibold mb-3">Source Distribution</h5>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Government Sources</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">40%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Academic Research</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">30%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Industry Data</span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">20%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Community Insights</span>
                  <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Source Credibility Framework */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5 text-green-600" />
            <span>Source Credibility Framework</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-2">Tier 1</div>
              <div className="text-sm font-medium mb-2">Government Sources</div>
              <div className="text-xs text-gray-600">95-100% Credibility</div>
              <div className="text-xs text-gray-500 mt-2">SEC, USPTO, Federal Reserve, Bureau of Labor</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">Tier 2</div>
              <div className="text-sm font-medium mb-2">Academic Research</div>
              <div className="text-xs text-gray-600">85-95% Credibility</div>
              <div className="text-xs text-gray-500 mt-2">MIT, Stanford, arXiv, Peer-reviewed journals</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">Tier 3</div>
              <div className="text-sm font-medium mb-2">Industry Sources</div>
              <div className="text-xs text-gray-600">70-85% Credibility</div>
              <div className="text-xs text-gray-500 mt-2">YC, GitHub, Stack Overflow, AngelList</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-2">Tier 4</div>
              <div className="text-sm font-medium mb-2">Community Sources</div>
              <div className="text-xs text-gray-600">50-70% Credibility</div>
              <div className="text-xs text-gray-500 mt-2">Reddit, HN, Twitter, Medium (validated)</div>
            </div>
          </div>
        </div>

        {/* Multi-Tier Validation Process */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Multi-Tier Validation Process</span>
          </h4>
          <div className="space-y-4">
            {[
              {
                step: 1,
                title: "Primary Source Verification",
                description: "Cross-reference data points across multiple Tier 1 & 2 sources",
                validation: "Minimum 3 sources required for critical insights"
              },
              {
                step: 2,
                title: "Temporal Consistency Check",
                description: "Ensure data freshness and track changes over time",
                validation: "Flag data older than relevance threshold"
              },
              {
                step: 3,
                title: "Contradiction Detection",
                description: "Identify conflicting information across sources",
                validation: "Weight higher-tier sources in conflicts"
              },
              {
                step: 4,
                title: "Confidence Scoring",
                description: "Assign confidence levels based on source quality and consensus",
                validation: "Display confidence scores on all recommendations"
              }
            ].map((process, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {process.step}
                  </div>
                  <h5 className="font-semibold">{process.title}</h5>
                </div>
                <p className="text-sm text-gray-600 mb-2 ml-11">{process.description}</p>
                <div className="ml-11">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {process.validation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-Time Quality Monitoring */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-600" />
            <span>Real-Time Quality Monitoring</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium">Source Health</span>
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">98.7%</div>
              <div className="text-xs text-gray-600">Sources operational</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Data Freshness</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">4.2h</div>
              <div className="text-xs text-gray-600">Avg update lag</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Alert Status</span>
              </div>
              <div className="text-2xl font-bold text-orange-600 mb-1">2</div>
              <div className="text-xs text-gray-600">Sources degraded</div>
            </div>
          </div>
        </div>

        {/* Anti-Bias & Anti-Anchor Methodology */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>Anti-Bias & Anti-Anchor Methodology</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold mb-3">Recency Weighting</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>&lt; 1 week old</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded">100% weight</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>1-4 weeks old</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">85% weight</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>1-3 months old</span>
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded">70% weight</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>&gt; 6 months old</span>
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded">40% weight</span>
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Contradiction Handling</h5>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium mb-1">Source Conflicts</div>
                  <div className="text-gray-600">Higher-tier sources override lower-tier when conflicting</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium mb-1">Trend Reversals</div>
                  <div className="text-gray-600">Recent data can contradict historical patterns with justification</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="font-medium mb-1">Outlier Detection</div>
                  <div className="text-gray-600">Statistical anomalies flagged for manual review</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost-Efficiency Focus */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span>Cost-Efficiency & Scalability</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold mb-3">Current Monthly Costs</h5>
              <div className="space-y-3">
                {[
                  { source: "GitHub API (Premium)", cost: "$48", usage: "Repository analysis" },
                  { source: "Academic APIs", cost: "$0", usage: "arXiv, Google Scholar" },
                  { source: "Government APIs", cost: "$0", usage: "SEC EDGAR, USPTO, Fed" },
                  { source: "Community APIs", cost: "$29", usage: "Reddit, HN aggregation" },
                  { source: "Infrastructure", cost: "$85", usage: "Hosting, storage, compute" }
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="text-sm font-medium">{item.source}</div>
                      <div className="text-xs text-gray-600">{item.usage}</div>
                    </div>
                    <div className="text-sm font-medium text-green-600">{item.cost}</div>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total Monthly Cost</span>
                    <span className="text-green-600">$162</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Scalability Strategy</h5>
              <div className="space-y-3 text-sm">
                <div className="bg-green-50 p-3 rounded">
                  <div className="font-medium text-green-800 mb-1">Free-First Approach</div>
                  <div className="text-green-700">Maximize insights from government and academic sources</div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="font-medium text-blue-800 mb-1">Smart Caching</div>
                  <div className="text-blue-700">Reduce API calls through intelligent data caching</div>
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <div className="font-medium text-purple-800 mb-1">Community Sources</div>
                  <div className="text-purple-700">Supplement premium data with validated community insights</div>
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <div className="font-medium text-orange-800 mb-1">Usage-Based Scaling</div>
                  <div className="text-orange-700">Premium sources unlock based on user tier and usage patterns</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}