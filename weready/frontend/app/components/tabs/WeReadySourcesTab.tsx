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
  calculateConsumerHealthScore,
  calculateOverallHealthScore,
  exportSourceHealthToCsv,
  formatRelativeTime,
  formatServiceReliability,
  getConsumerStatus,
  getConsumerStatusBadgeClasses,
  getDataSourceIndicator,
  getServiceContinuityMessage,
  getStatusBadgeClasses,
  getStatusPulseClasses,
  type ConsumerStatus,
} from '../../utils/sourceHealthUtils';

const STATUS_LEGEND = [
  {
    key: 'on',
    label: 'ON',
    description:
      'Actively providing real-time insights for your business intelligence',
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    key: 'not-responding',
    label: 'NOT RESPONDING',
    description:
      'Temporarily unavailable - your historical data remains accessible',
    icon: <Clock className="h-4 w-4 text-amber-600" />,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    key: 'offline',
    label: 'OFFLINE',
    description:
      'Currently offline - we\'re working to restore service',
    icon: <XCircle className="h-4 w-4 text-rose-600" />,
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    key: 'sunset',
    label: 'SUNSET',
    description:
      'This source is being deprecated - consider alternative sources',
    icon: <AlertTriangle className="h-4 w-4 text-purple-600" />,
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

  const consumerHealthScore = useMemo(() => {
    return calculateConsumerHealthScore(sourceHealth);
  }, [sourceHealth]);

  const dataSourceIndicator = useMemo(() => {
    return getDataSourceIndicator(loading, !!error, sourceHealth);
  }, [loading, error, sourceHealth]);

  const serviceMessage = useMemo(() => {
    return getServiceContinuityMessage(dataSourceIndicator);
  }, [dataSourceIndicator]);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
              Your Data Coverage
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              All Intelligence Sources Available
            </h2>
            <p className="mt-3 max-w-3xl text-sm text-slate-600">
              Complete visibility into all data sources powering your WeReady insights.
              Every connector is shown with real-time status, so you always know exactly
              what intelligence is available for your business decisions.
            </p>
            {error && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                <p className="font-semibold">Using cached data while we restore connections</p>
                <p className="mt-1">
                  Your insights remain available. We're actively working to restore
                  real-time updates.
                </p>
                <p className="mt-2 text-xs text-amber-600">
                  {serviceMessage}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">
              <p className="flex items-center text-sm font-semibold">
                <ShieldCheck className="mr-2 h-4 w-4" /> Service Reliability
              </p>
              <p className="mt-2 text-xs leading-relaxed">
                Your business intelligence is powered by multiple data sources.
                {' '}{consumerHealthScore.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className={`flex items-center gap-1 ${dataSourceIndicator === 'live' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  <span className={`h-2 w-2 rounded-full ${dataSourceIndicator === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {dataSourceIndicator === 'live' ? 'Real-time updates' : 'Cached data'}
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
                Service Health Overview
              </h3>
              <p className="text-sm text-slate-600">
                Overall reliability and availability of your business intelligence sources
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-600">
                <span className="text-sm">{formatServiceReliability(overallHealthScore)}</span>
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
              Individual Source Status
            </h3>
            <p className="text-sm text-slate-600">
              Current status and availability for each intelligence source.
              All configured sources are displayed, showing exactly what data
              is available for your business insights.
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
        <h3 className="text-lg font-semibold text-slate-900">Understanding Source Status</h3>
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
              never assume nonexistent integrations. Manual refresh controls
              validate credentials, ingestion pipelines, and credibility scoring
              while real-time streaming keeps telemetry current.
            </p>
          </details>
        </div>
      </section>

      {loading && (
        <div className="flex items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-6 text-sm text-blue-600">
          <div className="mr-3 h-3 w-3 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Loading your data sources…
        </div>
      )}

      {!loading && sourceHealth.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-700">
          <Bell className="h-4 w-4" />
          Setting up your data sources. Please check back in a moment.
        </div>
      )}
    </div>
  );
}
