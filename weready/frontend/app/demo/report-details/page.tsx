"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Code, Briefcase, TrendingUp, Palette, ChevronRight, CheckCircle, AlertTriangle, XCircle, BarChart } from "lucide-react";


function DemoReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  const reportId = searchParams.get('id') || 'demo-1';

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await fetch(`/api/demo/report/${reportId}`);
        const data = await response.json();
        setReport(data);
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart },
    { id: "code", label: "Code Quality", icon: Code },
    { id: "business", label: "Business Model", icon: Briefcase },
    { id: "investment", label: "Investment Ready", icon: TrendingUp },
    { id: "design", label: "Design & UX", icon: Palette }
  ];

  // Mock tab content based on report type
  const getTabContent = (tabId: string) => {
    const mockScores = {
      code: { score: 92, status: "excellent" },
      business: { score: 78, status: "good" },
      investment: { score: 85, status: "ready" },
      design: { score: 80, status: "good" }
    };

    const score = mockScores[tabId as keyof typeof mockScores];
    
    return (
      <div className="space-y-6">
        {/* Score Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              {tabs.find(t => t.id === tabId)?.label} Analysis
            </h3>
            <p className="text-gray-600">Comprehensive evaluation and recommendations</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{score.score}/100</div>
            <div className={`text-sm font-semibold ${
              score.status === "excellent" ? "text-green-600" : 
              score.status === "ready" ? "text-blue-600" : "text-yellow-600"
            }`}>
              {score.status.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">Key Findings</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Strong foundation detected</p>
                <p className="text-sm text-gray-600">Your {tabId} implementation follows best practices</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium">Minor improvements suggested</p>
                <p className="text-sm text-gray-600">A few optimizations could enhance performance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">Recommendations</h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span>Implement advanced {tabId} patterns for scalability</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span>Add comprehensive testing coverage</span>
            </li>
            <li className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span>Document your {tabId} architecture decisions</span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading demo report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-yellow-400 text-black px-4 py-2 text-center font-semibold">
        🎯 DEMO MODE - Report #{reportId} - {report?.report_type}
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/demo")}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Demo Center
          </button>
          
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => router.push(`/demo/report-details?id=${num}`)}
                className={`px-3 py-1 rounded ${
                  num === parseInt(reportId) 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Report {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Report Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">{report?.title}</h1>
          <p className="text-gray-600 mb-6">{report?.report_type} - Comprehensive Analysis</p>
          
          {/* Overall Score */}
          <div className="flex items-center gap-8">
            <div>
              <div className="text-5xl font-bold text-blue-600">
                {report?.overall_score || report?.market_score || report?.momentum_score || 85}
              </div>
              <div className="text-gray-600">Overall Score</div>
            </div>
            {report?.credibility_score && (
              <div>
                <div className="text-3xl font-bold text-purple-600">{report.credibility_score}%</div>
                <div className="text-gray-600">Credibility</div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 font-medium transition ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {getTabContent(activeTab)}
          </div>
        </div>

        {/* Report-specific content */}
        {report?.key_insights && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Key Insights</h3>
            <div className="space-y-4">
              {report.key_insights.map((insight: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <p className="font-medium mb-1">{insight.insight}</p>
                  <p className="text-sm text-gray-600">Confidence: {(insight.confidence * 100).toFixed(0)}%</p>
                  <p className="text-sm text-blue-600 mt-1">→ {insight.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Navigation */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push("/demo")}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            ← Back to Demo Center
          </button>
          <button
            onClick={() => {
              const next = (parseInt(reportId) % 4) + 1;
              router.push(`/demo/report-details?id=${next}`);
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Next Report →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DemoReport() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <DemoReportContent />
    </Suspense>
  );
}