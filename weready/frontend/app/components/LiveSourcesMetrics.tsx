'use client';

import { useMemo } from 'react';
import {
  Activity,
  BarChart3,
  Clock,
  Database,
  Gauge,
  GaugeCircle,
  Layers,
  PieChart,
  Zap,
} from 'lucide-react';
import type {
  CategoryCoverage,
  SourceHealthData,
  UseSourceHealthReturn,
} from '../types/sources';
import {
  calculateCategoryHealthDistribution,
  calculateKnowledgePoints,
  formatLargeNumber,
  formatRelativeTime,
  formatResponseTime,
} from '../utils/sourceHealthUtils';

interface LiveSourcesMetricsProps {
  sourceHealthState: UseSourceHealthReturn;
  categorySummary: Record<string, CategoryCoverage>;
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export default function LiveSourcesMetrics({
  sourceHealthState,
  categorySummary,
  selectedCategory,
  onCategorySelect,
}: LiveSourcesMetricsProps) {
  const { sourceHealth, metrics, lastUpdated } = sourceHealthState;

  const aggregate = useMemo(() => {
    const activeSources = metrics?.active_sources ?? sourceHealth.length;
    const totalSources = metrics?.total_sources ?? sourceHealth.length;
    const systemHealth = metrics?.system_health_score ?? 0;
    const avgResponseTime =
      metrics?.average_response_time ??
      (sourceHealth.reduce((acc, item) => acc + item.responseTime, 0) /
        Math.max(sourceHealth.length, 1));
    const avgUptime =
      metrics?.average_uptime ??
      sourceHealth.reduce((acc, item) => acc + item.uptime, 0) /
        Math.max(sourceHealth.length, 1);
    const totalKnowledgePoints = calculateKnowledgePoints(sourceHealth);

    return {
      activeSources,
      totalSources,
      systemHealth,
      avgResponseTime,
      avgUptime,
      totalKnowledgePoints,
    };
  }, [metrics, sourceHealth]);

  const distribution = useMemo(
    () => calculateCategoryHealthDistribution(sourceHealth),
    [sourceHealth],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-xs font-semibold uppercase tracking-wide">
              Overall Health
            </span>
            <GaugeCircle className="h-5 w-5" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-emerald-700">
            {aggregate.systemHealth.toFixed(1)}%
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            Weighted health score across all live connectors
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-xs font-semibold uppercase tracking-wide">
              Active Sources
            </span>
            <Database className="h-5 w-5" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-blue-700">
            {aggregate.activeSources}/{aggregate.totalSources}
          </p>
          <p className="mt-1 text-xs text-blue-600">
            {formatRelativeTime(lastUpdated)} • real-time sync
          </p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-xs font-semibold uppercase tracking-wide">
              Avg Response Time
            </span>
            <Clock className="h-5 w-5" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-purple-700">
            {formatResponseTime(aggregate.avgResponseTime)}
          </p>
          <p className="mt-1 text-xs text-purple-600">
            SLA target: {metrics?.sla_target_ms ?? 400}ms
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-xs font-semibold uppercase tracking-wide">
              Knowledge Points (24h)
            </span>
            <Activity className="h-5 w-5" />
          </div>
          <p className="mt-3 text-3xl font-semibold text-amber-700">
            {formatLargeNumber(aggregate.totalKnowledgePoints)}
          </p>
          <p className="mt-1 text-xs text-amber-600">
            Across all ingest pipelines in the last 24 hours
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-900">
              Category Coverage & Reliability
            </h4>
            <p className="text-xs text-slate-500">
              Select a category to inspect detailed health metrics below.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCategorySelect(null)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                selectedCategory === null
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              All categories
            </button>
            {Object.entries(categorySummary).map(([category, summary]) => (
              <button
                key={category}
                type="button"
                onClick={() => onCategorySelect(category)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  selectedCategory === category
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                {category}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  {summary.coverage_percentage.toFixed(0)}% coverage
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Object.entries(categorySummary).map(([category, summary]) => (
            <div
              key={category}
              className={`rounded-xl border p-4 ${
                selectedCategory === category
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {category}
                  </p>
                  <p className="text-xs text-slate-500">
                    {summary.implemented}/{summary.total} implemented •{' '}
                    {summary.health_score.toFixed(1)} health
                  </p>
                </div>
                <PieChart className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${summary.coverage_percentage}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                {summary.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">
              Performance Benchmarks
            </h4>
            <Gauge className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4 space-y-3 text-xs text-slate-500">
            {distribution.map((bucket) => {
              const colorClass =
                bucket.status === 'online'
                  ? 'bg-emerald-500'
                  : bucket.status === 'degraded'
                  ? 'bg-amber-500'
                  : bucket.status === 'maintenance'
                  ? 'bg-purple-500'
                  : 'bg-rose-500';
              return (
              <div key={bucket.label}>
                <div className="flex items-center justify-between">
                  <span>{bucket.label}</span>
                  <span className="font-semibold text-slate-700">
                    {bucket.count} sources
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div
                    className={`h-2 rounded-full ${colorClass}`}
                    style={{ width: `${bucket.percentage}%` }}
                  />
                </div>
              </div>
            );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">
              Data Freshness & Throughput
            </h4>
            <Zap className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {sourceHealth.slice(0, 6).map((source: SourceHealthData) => (
              <div
                key={source.source_id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <p className="text-xs font-semibold text-slate-700">
                  {source.name}
                </p>
                <p className="text-[11px] text-slate-500">
                  Freshness: {formatRelativeTime(source.dataFreshness)}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] uppercase text-slate-500">
                  <span>Throughput</span>
                  <span className="font-semibold text-slate-700">
                    {formatLargeNumber(source.ingestionRate ?? 0)} / min
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-slate-200">
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{ width: `${Math.min((source.ingestionRate ?? 0) / 100 * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
