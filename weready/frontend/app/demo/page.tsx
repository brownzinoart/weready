"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, TrendingUp, Zap, ChartBar, User, ArrowRight, Play, Building } from "lucide-react";

export default function DemoLanding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Quick access: typing "mock" shows reports
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "m" && !e.metaKey && !e.ctrlKey) {
        const input = prompt("Quick command (mock, mock1-4, dashboard):");
        if (input?.toLowerCase().includes("mock")) {
          const num = input.match(/\d/)?.[0];
          if (num) {
            router.push(`/demo/report-details?id=${num}`);
          } else {
            router.push("/demo/report-details?id=1");
          }
        }
      }
    };
    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [router]);

  const reports = [
    {
      id: 1,
      title: "Bailey Intelligence",
      icon: Brain,
      description: "AI-powered insights with credibility scoring",
      color: "bg-purple-500"
    },
    {
      id: 2,
      title: "Market Timing",
      icon: TrendingUp,
      description: "Strategic market entry & timing analysis",
      color: "bg-blue-500"
    },
    {
      id: 3,
      title: "Momentum Analysis",
      icon: Zap,
      description: "Growth velocity & scaling readiness",
      color: "bg-green-500"
    },
    {
      id: 4,
      title: "Complete Results",
      icon: ChartBar,
      description: "Comprehensive investment readiness report",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Mode Banner */}
      <div className="bg-yellow-400 text-black px-4 py-2 text-center font-semibold">
        🎯 DEMO MODE - No Login Required - Press 'M' for Quick Commands
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">WeReady Demo Center</h1>
          <p className="text-xl text-gray-600 mb-8">
            Explore all features instantly - no signup needed
          </p>
          
          {/* Quick Actions */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => router.push("/demo/portfolio")}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Building className="w-5 h-5" />
              Investor Portfolio
            </button>
            <button
              onClick={() => router.push("/demo/report-details?id=4")}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Play className="w-5 h-5" />
              See Best Report
            </button>
          </div>
        </div>

        {/* Report Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {reports.map((report) => (
            <div
              key={report.id}
              onClick={() => router.push(`/demo/report-details?id=${report.id}`)}
              className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${report.color} p-3 rounded-lg text-white`}>
                  <report.icon className="w-6 h-6" />
                </div>
                <span className="text-sm text-gray-500">Report #{report.id}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{report.title}</h3>
              <p className="text-gray-600 mb-4">{report.description}</p>
              <div className="flex items-center text-blue-600 font-semibold">
                View Report
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Features Overview */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">What You'll See</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <h3 className="font-semibold mb-2">📊 Full Reports</h3>
              <p className="text-gray-600">All 5 tabs (Overview, Code, Business, Investment, Design) with real data</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🏢 Investor Portfolio</h3>
              <p className="text-gray-600">Multi-company portfolio view with comparison & tracking</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">⚡ Instant Access</h3>
              <p className="text-gray-600">No login, no waiting - everything works immediately</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🎯 Complete Analysis</h3>
              <p className="text-gray-600">Full Overview, Code, Business, Investment, and Design insights</p>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">💡 <strong>Tip:</strong> Press 'M' anywhere to open quick commands</p>
          <p>Type "mock1" through "mock4" for specific reports</p>
        </div>
      </div>
    </div>
  );
}