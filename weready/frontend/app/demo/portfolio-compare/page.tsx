"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Star, Crown, BarChart3, Users, DollarSign, Calendar } from "lucide-react";


function ProjectComparisonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [comparison, setComparison] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const projectIds = searchParams.get('ids') || 'portfolio-1,portfolio-2';

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const response = await fetch(`/api/demo/portfolio/compare/${projectIds}`);
        const data = await response.json();
        setComparison(data);
      } catch (error) {
        console.error("Error fetching comparison:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [projectIds]);

  if (loading || !comparison) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading comparison...</p>
        </div>
      </div>
    );
  }

  const { projects, comparison_matrix, recommendation } = comparison;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeding_expectations': return 'bg-green-100 text-green-800 border-green-200';
      case 'on_track': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'needs_attention': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1: return <Star className="w-5 h-5 text-gray-400" />;
      case 2: return <Star className="w-5 h-5 text-yellow-600" />;
      default: return <div className="w-5 h-5" />;
    }
  };

  // Sort projects by score for ranking
  const rankedProjects = [...projects].sort((a: any, b: any) => b.last_score - a.last_score);

  const toNumber = (value: unknown): number => {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  };

  const ComparisonMetric = ({ label, values, unit = "", higherBetter = true }: { 
    label: string, 
    values: any, 
    unit?: string, 
    higherBetter?: boolean 
  }) => {
    const entries = Object.entries(values);
    const sortedEntries = entries.sort(([, a], [, b]) => {
      const aVal = toNumber(a);
      const bVal = toNumber(b);
      return higherBetter ? bVal - aVal : aVal - bVal;
    });

    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="font-semibold mb-3 text-center">{label}</h4>
        <div className="space-y-2">
          {sortedEntries.map(([projectId, value], index) => {
            const project = projects.find((p: any) => p.id === projectId);
            const isTop = index === 0;
            
            return (
              <div key={projectId} className={`flex items-center justify-between p-2 rounded ${
                isTop ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}>
                <div className="flex items-center gap-2">
                  {isTop && <Crown className="w-4 h-4 text-yellow-500" />}
                  <span className="text-sm">{project?.company_name}</span>
                </div>
                <span className={`font-semibold ${isTop ? 'text-green-700' : 'text-gray-700'}`}>
                  {String(value)}{unit}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-yellow-400 text-black px-4 py-2 text-center font-semibold">
        🎯 DEMO MODE - Comparing {projects.length} Portfolio Companies
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
              <div>
                <h1 className="text-3xl font-bold">Project Comparison</h1>
                <p className="text-gray-600">Side-by-side analysis of {projects.length} companies</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* AI Recommendation */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">AI Investment Recommendation</h3>
              <p className="text-blue-100">{recommendation}</p>
            </div>
          </div>
        </div>

        {/* Company Overview Cards */}
        <div className={`grid ${projects.length === 2 ? 'md:grid-cols-2' : projects.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6 mb-8`}>
          {rankedProjects.map((project: any, index: number) => (
            <div 
              key={project.id} 
              className={`bg-white rounded-lg shadow-lg p-6 relative ${
                index === 0 ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              {index === 0 && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                    TOP PERFORMER
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <img 
                  src={project.founder_avatar} 
                  alt={project.founder}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex items-center gap-1">
                  {getRankIcon(index)}
                  <span className="text-sm text-gray-600">#{index + 1}</span>
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-1">{project.company_name}</h3>
              <p className="text-gray-600 text-sm mb-3">{project.founder}</p>
              
              <div className="text-center mb-4">
                <div className={`text-3xl font-bold mb-1 ${
                  index === 0 ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {project.last_score}
                </div>
                <div className="text-gray-600 text-sm">WeReady Score</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {getTrendIcon(project.trend)}
                  <span className={`text-sm ${
                    project.trend === 'improving' ? 'text-green-600' : 
                    project.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {project.trend_direction}
                  </span>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-semibold text-center border ${getStatusColor(project.status)}`}>
                {project.status.replace('_', ' ').toUpperCase()}
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>MRR:</span>
                  <span className="font-semibold">{project.metrics.mrr}</span>
                </div>
                <div className="flex justify-between">
                  <span>Growth:</span>
                  <span className="font-semibold">{project.metrics.growth_rate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stage:</span>
                  <span className="font-semibold">{project.stage}</span>
                </div>
              </div>
              
              <button
                onClick={() => router.push(`/demo/portfolio/${project.id}`)}
                className="w-full mt-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
              >
                View Details
              </button>
            </div>
          ))}
        </div>

        {/* Detailed Metrics Comparison */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ComparisonMetric 
            label="WeReady Scores" 
            values={comparison_matrix.scores} 
            higherBetter={true}
          />
          <ComparisonMetric 
            label="Monthly Revenue" 
            values={comparison_matrix.mrr} 
            higherBetter={true}
          />
          <ComparisonMetric 
            label="Growth Rates" 
            values={comparison_matrix.growth_rates} 
            higherBetter={true}
          />
          <ComparisonMetric 
            label="Runway (Months)" 
            values={comparison_matrix.runway} 
            unit=" months"
            higherBetter={true}
          />
          <ComparisonMetric 
            label="Team Size" 
            values={comparison_matrix.team_size} 
            unit=" people"
            higherBetter={true}
          />
        </div>

        {/* Detailed Comparison Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-bold">Detailed Comparison</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  {projects.map((project: any) => (
                    <th key={project.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {project.company_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    WeReady Score
                  </td>
                  {projects.map((project: any) => (
                    <td key={project.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-2xl font-bold text-blue-600">{project.last_score}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Monthly Revenue
                  </td>
                  {projects.map((project: any) => (
                    <td key={project.id} className="px-6 py-4 whitespace-nowrap text-center font-semibold">
                      {project.metrics.mrr}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Growth Rate
                  </td>
                  {projects.map((project: any) => (
                    <td key={project.id} className="px-6 py-4 whitespace-nowrap text-center font-semibold text-green-600">
                      {project.metrics.growth_rate}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Investment Stage
                  </td>
                  {projects.map((project: any) => (
                    <td key={project.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {project.stage}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Runway
                  </td>
                  {projects.map((project: any) => (
                    <td key={project.id} className="px-6 py-4 whitespace-nowrap text-center font-semibold">
                      {project.runway_months} months
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Team Size
                  </td>
                  {projects.map((project: any) => (
                    <td key={project.id} className="px-6 py-4 whitespace-nowrap text-center font-semibold">
                      {project.metrics.team_size} people
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
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
            onClick={() => {
              const topProject = rankedProjects[0];
              router.push(`/demo/portfolio/${topProject.id}`);
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            View Top Performer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectComparison() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading comparison...</p>
        </div>
      </div>
    }>
      <ProjectComparisonContent />
    </Suspense>
  );
}