"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Building, 
  Users, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Bell,
  Eye,
  ArrowRight,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Grid,
  List
} from "lucide-react";

export default function DemoPortfolio() {
  const router = useRouter();
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/demo/portfolio");
        const data = await response.json();
        setPortfolioData(data);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, []);

  if (loading || !portfolioData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  const { investor, projects, portfolio_metrics, recent_activity } = portfolioData;

  const filteredProjects = filterStatus === 'all' 
    ? projects 
    : projects.filter((p: any) => p.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeding_expectations': return 'text-green-600 bg-green-100';
      case 'on_track': return 'text-blue-600 bg-blue-100';
      case 'needs_attention': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const ProjectCard = ({ project }: { project: any }) => (
    <div 
      onClick={() => router.push(`/demo/portfolio/${project.id}`)}
      className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={project.founder_avatar} 
            alt={project.founder}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="font-bold text-lg">{project.company_name}</h3>
            <p className="text-gray-600">{project.founder}</p>
          </div>
        </div>
        {project.unread_updates > 0 && (
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {project.unread_updates} new
          </div>
        )}
      </div>

      <p className="text-gray-600 text-sm mb-4">{project.description}</p>

      <div className="flex items-center justify-between mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{project.last_score}</div>
          <div className="text-xs text-gray-600">Score</div>
        </div>
        <div className="flex items-center gap-1">
          {getTrendIcon(project.trend)}
          <span className={`text-sm font-semibold ${
            project.trend === 'improving' ? 'text-green-600' : 
            project.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {project.trend_direction}
          </span>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold">{project.metrics.mrr}</div>
          <div className="text-xs text-gray-600">MRR</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
          {project.status.replace('_', ' ').toUpperCase()}
        </span>
        <span className="text-sm text-gray-600">{project.stage}</span>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {project.tags.map((tag: string, index: number) => (
          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Updated {project.last_updated ? new Date(project.last_updated).toLocaleDateString() : 'N/A'}</span>
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-yellow-400 text-black px-4 py-2 text-center font-semibold">
        🎯 DEMO MODE - Investor Portfolio: {investor.name} @ {investor.firm}
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/demo")}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Demo
              </button>
              <div>
                <h1 className="text-3xl font-bold">Portfolio Overview</h1>
                <p className="text-gray-600">Managing {portfolio_metrics.total_companies} portfolio companies</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <img
                src={investor.avatar_url}
                alt="Investor"
                className="w-12 h-12 rounded-full"
              />
              <div className="text-right">
                <p className="font-semibold">{investor.name}</p>
                <p className="text-sm text-gray-600">{investor.firm}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Portfolio Metrics */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{portfolio_metrics.total_companies}</div>
            <div className="text-gray-600">Companies</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{portfolio_metrics.total_invested}</div>
            <div className="text-gray-600">Invested</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{portfolio_metrics.avg_score}</div>
            <div className="text-gray-600">Avg Score</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{portfolio_metrics.companies_on_track}</div>
            <div className="text-gray-600">On Track</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Bell className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold">{portfolio_metrics.unread_updates}</div>
            <div className="text-gray-600">Updates</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Companies</option>
              <option value="exceeding_expectations">Exceeding Expectations</option>
              <option value="on_track">On Track</option>
              <option value="needs_attention">Needs Attention</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/demo/portfolio/compare/proj_001,proj_002,proj_004")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Compare Top 3
            </button>
            <div className="flex border rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className={`${viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'} mb-8`}>
          {filteredProjects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-xl font-bold">Recent Activity</h3>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {recent_activity.map((activity: any, index: number) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'score_improvement' ? 'bg-green-500' :
                    activity.type === 'alert' ? 'bg-red-500' :
                    activity.type === 'milestone' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <div>
                    <p className="font-medium">{activity.project_name}</p>
                    <p className="text-gray-600 text-sm">{activity.activity}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}