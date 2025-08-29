import React from 'react';
import { Palette, Monitor, Users, Zap, Eye, Smartphone, ArrowRight, Database, BarChart3 } from 'lucide-react';
import SourceBadge from '../SourceBadge';

export default function DesignIntelligenceTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Palette className="w-5 h-5 text-purple-600" />
          <span>Design Intelligence Hub</span>
        </h3>
        
        {/* UX/UI Performance Overview */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>User Experience Intelligence</span>
            </h4>
            <div className="flex items-center space-x-2">
              <SourceBadge sourceName="Google Analytics" sourceType="industry" credibilityScore={89} isLive={true} />
              <SourceBadge sourceName="Hotjar Heatmaps" sourceType="industry" credibilityScore={85} lastUpdated="1h ago" />
              <SourceBadge sourceName="A/B Testing Results" sourceType="industry" credibilityScore={92} isLive={true} />
            </div>
          </div>
          
          {/* UX Data Sources */}
          <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
            <h5 className="text-sm font-semibold mb-3 text-blue-800">User Experience Data Pipeline</h5>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-xs mb-3">
              <div className="bg-white rounded border px-2 py-1 text-center">
                <BarChart3 className="w-3 h-3 mx-auto mb-1" />
                <div>Analytics</div>
              </div>
              <div className="bg-white rounded border px-2 py-1 text-center">
                <Eye className="w-3 h-3 mx-auto mb-1" />
                <div>Heatmaps</div>
              </div>
              <div className="bg-white rounded border px-2 py-1 text-center">
                <Users className="w-3 h-3 mx-auto mb-1" />
                <div>User Tests</div>
              </div>
              <div className="bg-white rounded border px-2 py-1 text-center">
                <Zap className="w-3 h-3 mx-auto mb-1" />
                <div>A/B Tests</div>
              </div>
            </div>
            <div className="text-xs text-blue-700">
              <strong>Sources Integration:</strong> Real-time user behavior data from analytics platforms, validated through 
              controlled A/B testing with statistical significance thresholds. Cross-referenced with industry benchmarks.
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">12.4s</div>
              <div className="text-sm text-gray-600">Avg Session Duration</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">3.2%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 mb-1">67%</div>
              <div className="text-sm text-gray-600">Mobile Traffic</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">89%</div>
              <div className="text-sm text-gray-600">User Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Design System Standards */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Monitor className="w-5 h-5 text-green-600" />
            <span>Design System & Component Standards</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Best Practices</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">8px</div>
              <div className="text-sm text-gray-600">Base Spacing Grid</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">60fps</div>
              <div className="text-sm text-gray-600">Animation Target</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">WCAG 2.1</div>
              <div className="text-sm text-gray-600">Accessibility Standard</div>
            </div>
          </div>
        </div>

        {/* User Behavior Insights */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-orange-600" />
            <span>User Behavior Analytics</span>
          </h4>
          <div className="space-y-4">
            {[
              {
                pattern: "Navigation Patterns",
                insight: "Users expect primary navigation within 3 clicks",
                impact: "15% bounce rate reduction",
                confidence: 94
              },
              {
                pattern: "Content Consumption",
                insight: "8-second attention span for feature explanations",
                impact: "32% engagement increase",
                confidence: 87
              },
              {
                pattern: "Form Completion",
                insight: "Single-step forms convert 2.3x better",
                impact: "128% conversion improvement",
                confidence: 91
              }
            ].map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-semibold">{item.pattern}</h5>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {item.confidence}% Confidence
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.insight}</p>
                <div className="text-sm">
                  <span className="text-green-600 font-medium">Impact: {item.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* A/B Testing Intelligence */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span>A/B Testing & Conversion Optimization</span>
            </h4>
            <div className="flex items-center space-x-2">
              <SourceBadge sourceName="Optimizely" sourceType="industry" credibilityScore={91} isLive={true} />
              <SourceBadge sourceName="VWO Testing" sourceType="industry" credibilityScore={87} lastUpdated="30min ago" />
              <SourceBadge sourceName="Internal Testing" sourceType="industry" credibilityScore={95} isLive={true} />
            </div>
          </div>
          
          {/* Testing Methodology */}
          <div className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-200">
            <div className="text-sm text-yellow-800">
              <strong>Testing Standards:</strong> All A/B tests run with 95% statistical confidence, minimum 1,000 users per variant, 
              2-week minimum duration. Results validated against industry conversion benchmarks and historical data.
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold mb-3">High-Impact Test Winners</h5>
              <div className="space-y-3">
                {[
                  { element: "CTA Button Color", winner: "Green", lift: "+23%" },
                  { element: "Landing Page Layout", winner: "Hero-focused", lift: "+18%" },
                  { element: "Pricing Display", winner: "Monthly first", lift: "+31%" },
                  { element: "Signup Flow", winner: "Social auth", lift: "+45%" }
                ].map((test, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{test.element}</span>
                      <span className="text-green-600 font-bold">{test.lift}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Winner: {test.winner}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Testing Recommendations</h5>
              <div className="space-y-3">
                {[
                  { priority: "High", test: "Headline messaging", rationale: "First impression driver" },
                  { priority: "High", test: "Value proposition clarity", rationale: "Conversion bottleneck" },
                  { priority: "Medium", test: "Navigation structure", rationale: "User flow optimization" },
                  { priority: "Low", test: "Color scheme variations", rationale: "Brand refinement" }
                ].map((rec, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{rec.test}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rec.priority === 'High' ? 'bg-red-100 text-red-700' :
                        rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">{rec.rationale}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile & Responsive Design Intelligence */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-green-600" />
            <span>Mobile & Responsive Design Intelligence</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold mb-3">Device Breakpoint Performance</h5>
              <div className="space-y-3">
                {[
                  { device: "Mobile (320-768px)", usage: "67%", performance: "Good", issues: 2 },
                  { device: "Tablet (768-1024px)", usage: "18%", performance: "Excellent", issues: 0 },
                  { device: "Desktop (1024px+)", usage: "15%", performance: "Good", issues: 1 }
                ].map((device, index) => (
                  <div key={index} className="border border-gray-200 rounded p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{device.device}</span>
                      <span className="text-xs text-gray-600">{device.usage} traffic</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className={`${
                        device.performance === 'Excellent' ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {device.performance}
                      </span>
                      <span className="text-gray-600">{device.issues} issues</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Mobile UX Best Practices</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Touch targets minimum 44px</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Thumb-friendly navigation zones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <span>Optimize for one-handed use</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span>Reduce cognitive load on small screens</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}