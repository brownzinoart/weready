'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Layers,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import SourceInventoryDashboard from '../SourceInventoryDashboard';
import SourceHealthMonitor from '../SourceHealthMonitor';
import LiveSourcesMetrics from '../LiveSourcesMetrics';
import type {
  UseSourceHealthReturn,
} from '../../types/sources';
import {
  calculateCategorySummary,
  calculateOverallHealthScore,
  exportSourceHealthToCsv,
  formatRelativeTime,
  getStatusBadgeClasses,
  getStatusPulseClasses,
} from '../../utils/sourceHealthUtils';

const STATUS_LEGEND = [
  {
    key: 'implemented',
    label: 'Fully Implemented & Active',
    description:
      'Live connector connected to real data sources with production ingestion.',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    key: 'mock',
    label: 'Implemented with Mock Data',
    description:
      'Connector exists but currently serves curated data while API credentials finalize.',
    icon: <Clock className="h-4 w-4 text-blue-600" />,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    key: 'planned',
    label: 'Planned / In Progress',
    description:
      'Source is on the roadmap and tracked for completion in integrated dashboards.',
    icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    key: 'missing',
    label: 'Displayed but Missing Implementation',
    description:
      'Highlighted to keep frontend transparent when backend coverage is pending.',
    icon: <XCircle className="h-4 w-4 text-rose-600" />,
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    key: 'maintenance',
    label: 'Maintenance Window',
    description:
      'Connector is temporarily paused for scheduled maintenance or credential rotation.',
    icon: <Sparkles className="h-4 w-4 text-purple-600" />,
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

export interface WeReadySourcesTabProps {
  sourceHealthState: UseSourceHealthReturn;
}

export default function WeReadySourcesTab({
  sourceHealthState,
}: WeReadySourcesTabProps) {
  const {
    sourceHealth,
    loading,
    error,
    lastUpdated,
    refreshHealth,
    isRefreshing,
    metrics,
  } = sourceHealthState;
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredSources = useMemo(() => {
    return sourceHealth.filter((source) => {
      const matchesCategory =
        !selectedCategory || source.category === selectedCategory;
      const matchesSearch =
        !search ||
        source.name.toLowerCase().includes(search.toLowerCase()) ||
        source.category.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory, sourceHealth]);

  const categorySummary = useMemo(
    () => calculateCategorySummary(sourceHealth),
    [sourceHealth],
  );

  const overallHealthScore = useMemo(() => {
    if (metrics?.system_health_score != null) {
      return metrics.system_health_score;
    }
    return calculateOverallHealthScore(sourceHealth);
  }, [metrics?.system_health_score, sourceHealth]);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
              Source Transparency
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              Live Data Sources That Power WeReady
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-600">
              End-to-end visibility into production connectors, their health, and
              real-time data ingestion. Every source displayed below is backed by
              an active integration or intentionally flagged with roadmap
              context so founders can trust exactly where insights originate.
            </p>
            {error && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <p className="font-semibold">We hit a snag loading live data.</p>
                <p className="mt-1">
                  {error}. We are showing cached intelligence while the backend
                  recovers.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
              <p className="flex items-center text-sm font-semibold">
                <ShieldCheck className="mr-2 h-4 w-4" /> Bailey Data Integrity
              </p>
              <p className="mt-2 text-xs leading-relaxed">
                Connectors stream real-time intelligence across code quality,
                business, investment, and design ecosystems. Maintenance windows
                and credential rotations auto-surface with live health signals.
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className={`flex items-center gap-1 ${getStatusPulseClasses('online')}`}>
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Auto-refresh {metrics?.refresh_interval_seconds ?? 30}s
                </span>
                <span className="text-blue-600">
                  Last update {formatRelativeTime(lastUpdated)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={refreshHealth}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-500' : 'text-slate-500'}`}
              />
              {isRefreshing ? 'Refreshing…' : 'Manual Refresh'}
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                System Health Overview
              </h3>
              <p className="text-sm text-slate-600">
                Aggregated metrics, uptime guarantees, and ingestion throughput
                for the entire Bailey intelligence pipeline.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-600">
                <span className="text-sm">Health {overallHealthScore}%</span>
              </div>
              <div className={`flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${getStatusBadgeClasses('online')}`}>
                <span className="text-sm">{metrics?.active_sources ?? filteredSources.length} Active Sources</span>
              </div>
              <button
                type="button"
                onClick={() => exportSourceHealthToCsv(sourceHealth)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4">
          <LiveSourcesMetrics
            sourceHealthState={sourceHealthState}
            categorySummary={categorySummary}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Real-Time Source Health
            </h3>
            <p className="text-sm text-slate-600">
              Live uptime, latency, quota, and data freshness signals across all
              connectors. Automatic refresh keeps this dashboard synchronized
              with the backend health checks.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <Filter className="h-3.5 w-3.5 text-slate-500" />
              <select
                value={selectedCategory ?? ''}
                onChange={(event) =>
                  setSelectedCategory(event.target.value || null)
                }
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">All categories</option>
                {Object.keys(categorySummary).map((categoryKey) => (
                  <option key={categoryKey} value={categoryKey}>
                    {categoryKey}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search sources"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:w-60"
            />
          </div>
        </div>

        <SourceHealthMonitor
          sourceHealthState={sourceHealthState}
          sources={filteredSources}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </section>

      <section>
        <SourceInventoryDashboard />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Status Legend</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {STATUS_LEGEND.map((item) => (
            <div key={item.key} className={`rounded-xl border ${item.badgeClass} p-4`}>
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="text-sm font-semibold">{item.label}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Layers className="h-5 w-5" />
            <h3 className="text-base font-semibold text-slate-900">
              Connector Methodology
            </h3>
          </div>
          <ul className="mt-3 space-y-3 text-sm text-slate-600">
            <li>
              • Each backend connector implements the shared
              <code>BaileyConnector</code> interface with rate limiting and
              ingestion tracking.
            </li>
            <li>
              • Wrapper connectors unify existing intelligence modules so every
              module reports health, freshness, and quota status.
            </li>
            <li>
              • Code-quality, business-intelligence, investment-readiness, and
              design connectors consume authenticated APIs or public research
              feeds with automated validation.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Sparkles className="h-5 w-5" />
            <h3 className="text-base font-semibold text-slate-900">
              Realtime Coverage Signals
            </h3>
          </div>
          <ul className="mt-3 space-y-3 text-sm text-slate-600">
            <li>
              • Coverage metrics compare backend connectors to the published
              frontend catalog to surface transparency gaps instantly.
            </li>
            <li>
              • Status snapshots combine health, knowledge point counts, and
              ingestion velocity so teams can track throughput.
            </li>
            <li>
              • Automated alerting escalates degradation before it impacts
              founders, with dependency-aware blast radius modeling.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <BookOpen className="h-5 w-5" />
            <h3 className="text-base font-semibold text-slate-900">
              Citations & Methodology
            </h3>
          </div>
          <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <summary className="cursor-pointer font-medium text-slate-800">
              How We Validate Sources
            </summary>
            <p className="mt-2">
              Every source integrates published documentation from providers like
              SonarQube, Code Climate, GitGuardian, Semgrep, Veracode, YC, First
              Round, a16z, Sequoia, Baymard, Nielsen Norman, WebAIM, and Chrome
              UX Report. The backend inventory service ensures citations and rate
              limits match production configurations.
            </p>
            <p className="mt-2">
              Planned sources remain visible but explicitly labeled so founders
              never assume nonexistent integrations. Manual and automated refresh
              capabilities validate credentials, ingestion pipelines, and
              credibility scoring in real time.
            </p>
          </details>
        </div>
      </section>

      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-6 text-sm text-blue-600">
          <div className="mr-3 h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Syncing live source telemetry…
        </div>
      )}

      {!loading && sourceHealth.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
          <Bell className="h-4 w-4" />
          No live sources detected yet. Confirm backend connectors and refresh.
        </div>
      )}
    </div>
  );
}
