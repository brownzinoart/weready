"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MessageCircle, 
  Calendar, 
  DollarSign,
  Users,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  BarChart3,
  Eye,
  Edit,
  Plus
} from "lucide-react";


function DemoProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const projectId = searchParams.get('id') || 'portfolio-1';

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/demo/portfolio/project/${projectId}`);
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading project details...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeding_expectations': return 'text-green-600 bg-green-100 border-green-200';
      case 'on_track': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'needs_attention': return 'text-orange-600 bg-orange-100 border-orange-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-500" />;
      default: return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analysis', label: 'Analysis History' },
    { id: 'notes', label: 'Investor Notes' },
    { id: 'metrics', label: 'Metrics' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-yellow-400 text-black px-4 py-2 text-center font-semibold">
        🎯 DEMO MODE - Project: {project.company_name} - Track Updates & Progress
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/demo/portfolio")}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Portfolio
              </button>
              <div className="flex items-center gap-4">
                <img 
                  src={project.founder_avatar} 
                  alt={project.founder}
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <h1 className="text-3xl font-bold">{project.company_name}</h1>
                  <p className="text-gray-600">Founded by {project.founder} • {project.stage}</p>
                  <p className="text-sm text-gray-500">{project.description}</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${getStatusColor(project.status)}`}>
                <span className="font-semibold">{project.status.replace('_', ' ').toUpperCase()}</span>
              </div>
              {project.unread_updates > 0 && (
                <div className="mt-2">
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {project.unread_updates} new updates
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Key Metrics */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{project.last_score}</span>
            </div>
            <div className="text-gray-600 text-sm">WeReady Score</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              {getTrendIcon(project.trend)}
              <span className={`text-sm font-semibold ${
                project.trend === 'improving' ? 'text-green-600' : 
                project.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {project.trend_direction}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">{project.metrics.mrr}</div>
            <div className="text-gray-600 text-sm">Monthly Revenue</div>
            <div className="text-green-600 text-sm mt-1">+{project.metrics.growth_rate}</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">{project.metrics.customers}</div>
            <div className="text-gray-600 text-sm">Customers</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-2">{project.metrics.team_size}</div>
            <div className="text-gray-600 text-sm">Team Size</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">{project.runway_months}m</div>
            <div className="text-gray-600 text-sm">Runway</div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-gray-700 mb-2">{project.investment_amount}</div>
            <div className="text-gray-600 text-sm">Invested</div>
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
                  className={`px-6 py-4 font-medium transition ${
                    activeTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Next Milestone</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">{project.next_milestone}</span>
                      </div>
                      <p className="text-sm text-gray-600">Expected completion in next quarter</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Investment Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-semibold">{project.investment_amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Date:</span>
                        <span>{new Date(project.investment_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stage:</span>
                        <span className="font-semibold">{project.stage}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Analysis History</h4>
                  <span className="text-sm text-gray-600">{project.update_count} total analyses</span>
                </div>
                
                {project.analysis_history && project.analysis_history.map((analysis: any, index: number) => (
                  <div key={analysis.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                          analysis.score >= 85 ? 'bg-green-500' :
                          analysis.score >= 75 ? 'bg-blue-500' :
                          analysis.score >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {analysis.score}
                        </div>
                        <div>
                          <p className="font-medium">WeReady Analysis</p>
                          <p className="text-sm text-gray-600">
                            {new Date(analysis.date).toLocaleDateString()} - {analysis.verdict.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Key Changes:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {analysis.changes.map((change: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {change}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {analysis.founder_notes && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm"><strong>Founder Notes:</strong> {analysis.founder_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Investor Notes</h4>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Plus className="w-4 h-4" />
                    Add Note
                  </button>
                </div>

                {project.investor_notes && project.investor_notes.map((note: any, index: number) => (
                  <div key={index} className="bg-white border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <MessageCircle className="w-5 h-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <p className="text-gray-800 mb-2">{note.note}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{note.author}</span>
                          <span>•</span>
                          <span>{new Date(note.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'metrics' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="font-semibold mb-3">Financial Metrics</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Monthly Recurring Revenue:</span>
                        <span className="font-semibold text-green-600">{project.metrics.mrr}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Growth Rate:</span>
                        <span className="font-semibold text-blue-600">{project.metrics.growth_rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Burn Rate:</span>
                        <span className="font-semibold text-orange-600">{project.metrics.burn_rate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Runway:</span>
                        <span className="font-semibold">{project.runway_months} months</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border rounded-lg p-4">
                    <h5 className="font-semibold mb-3">Operational Metrics</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Customers:</span>
                        <span className="font-semibold">{project.metrics.customers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Team Size:</span>
                        <span className="font-semibold">{project.metrics.team_size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Updates Sent:</span>
                        <span className="font-semibold">{project.update_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Update:</span>
                        <span className="font-semibold">{new Date(project.last_updated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push("/demo/portfolio")}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Portfolio
          </button>
          <button
            onClick={() => router.push(`/demo/report-details?id=4`)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View Latest Analysis
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DemoProject() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    }>
      <DemoProjectContent />
    </Suspense>
  );
}