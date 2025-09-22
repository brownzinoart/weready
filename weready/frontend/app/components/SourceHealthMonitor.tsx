'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Signal,
  Wifi,
} from 'lucide-react';
import type {
  SourceHealthData,
  UseSourceHealthReturn,
} from '../types/sources';
import {
  formatRelativeTime,
  formatUptime,
  getLatencyColor,
  getStatusBadgeClasses,
  getStatusPulseClasses,
} from '../utils/sourceHealthUtils';

interface SourceHealthMonitorProps {
  sourceHealthState: UseSourceHealthReturn;
  sources: SourceHealthData[];
  selectedCategory: string | null;
  onCategoryChange?: (category: string | null) => void;
}

const getTrendIcon = (trend: SourceHealthData['healthTrend']) => {
  switch (trend) {
    case 'improving':
      return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
    case 'degrading':
      return <ArrowDownRight className="h-4 w-4 text-rose-500" />;
    default:
      return <ArrowRight className="h-4 w-4 text-slate-400" />;
  }
};

export default function SourceHealthMonitor({
  sourceHealthState,
  sources,
  selectedCategory,
  onCategoryChange,
}: SourceHealthMonitorProps) {
  const {
    refreshHealth,
    refreshSource,
    triggerSourceTest,
    pauseMonitoring,
    resumeMonitoring,
    isRefreshing,
    isStreaming,
    metrics,
  } = sourceHealthState;
  const [localPaused, setLocalPaused] = useState<Record<string, boolean>>({});

  const degradedSources = useMemo(
    () =>
      sources.filter(
        (source) => source.status === 'degraded' || source.status === 'offline',
      ),
    [sources],
  );

  const handlePause = async (sourceId: string) => {
    if (pauseMonitoring) {
      await pauseMonitoring(sourceId);
    }
    setLocalPaused((prev) => ({ ...prev, [sourceId]: true }));
  };

  const handleResume = async (sourceId: string) => {
    if (resumeMonitoring) {
      await resumeMonitoring(sourceId);
    }
    setLocalPaused((prev) => ({ ...prev, [sourceId]: false }));
  };

  return (
    <div className="space-y-6">
      {(degradedSources.length > 0 || !isStreaming) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <div>
              <p className="font-semibold">
                {degradedSources.length > 0
                  ? `${degradedSources.length} source${
                      degradedSources.length === 1 ? '' : 's'
                    } require attention`
                  : 'Realtime stream unavailable – falling back to polling'}
              </p>
              {degradedSources.length > 0 && (
                <p className="mt-1 text-xs">
                  We automatically escalated degraded connectors. Trigger a
                  manual refresh or diagnostics to validate remediation.
                </p>
              )}
              {!isStreaming && (
                <p className="mt-1 text-xs">
                  Live updates are reconnecting using server-sent events. Metrics
                  continue to refresh every {metrics?.refresh_interval_seconds ?? 30}
                  s.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
        <button
          type="button"
          onClick={refreshHealth}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50"
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : 'text-slate-500'}`}
          />
          Bulk Refresh
        </button>
        <div className={`flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${getStatusBadgeClasses('online')}`}>
          <Wifi className="h-3.5 w-3.5" />
          {isStreaming ? 'Live Stream Active' : 'Streaming Reconnecting'}
        </div>
        {selectedCategory && (
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
            <span>{selectedCategory}</span>
            <button
              type="button"
              onClick={() => onCategoryChange?.(null)}
              className="text-xs text-blue-500 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {sources.map((source) => {
          const quotaUsed = source.apiQuotaLimit
            ? 1 - (source.apiQuotaRemaining ?? 0) / source.apiQuotaLimit
            : null;
          const paused = localPaused[source.source_id] === true;

          return (
            <div
              key={source.source_id}
              className={`flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-slate-900">
                    {source.name}
                  </h4>
                  <p className="text-xs text-slate-500">{source.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClasses(source.status)}`}
                  >
                    <span className={`${getStatusPulseClasses(source.status)} h-2 w-2 rounded-full`} />
                    {paused ? 'paused' : source.status}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    {getTrendIcon(source.healthTrend)}
                    {source.healthTrend}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Response Time
                    </p>
                    <p className={`mt-1 text-lg font-semibold ${getLatencyColor(source.responseTime)}`}>
                      {source.responseTime} ms
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Uptime
                    </p>
                    <p className="mt-1 text-lg font-semibold text-emerald-600">
                      {formatUptime(source.uptime)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Credibility</span>
                    <span className="font-semibold text-emerald-600">
                      {source.credibility}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${source.credibility}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-3 text-xs text-slate-500 md:grid-cols-2">
                  <div>
                    <p className="font-medium text-slate-600">Last Updated</p>
                    <p>{formatRelativeTime(source.lastUpdate)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-600">Data Freshness</p>
                    <p>{formatRelativeTime(source.dataFreshness)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-600">Error Rate</p>
                    <p className={source.errorRate > 5 ? 'text-rose-500' : ''}>
                      {source.errorRate.toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-600">SLA Status</p>
                    <p>{source.slaCompliance ?? 'Within thresholds'}</p>
                  </div>
                </div>

                {quotaUsed != null && (
                  <div className="rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>API Quota</span>
                      <span className="font-semibold text-slate-700">
                        {source.apiQuotaRemaining ?? 0}/{source.apiQuotaLimit}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200">
                      <div
                        className={`h-2 rounded-full ${quotaUsed > 0.8 ? 'bg-rose-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(quotaUsed * 100, 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px]">
                      {quotaUsed > 0.8
                        ? 'Approaching limit – consider rate-limit backoff'
                        : 'Quota healthy'}
                    </p>
                  </div>
                )}

                {source.dependsOn && source.dependsOn.length > 0 && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
                    <p className="font-medium text-slate-600">Dependencies</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {source.dependsOn.map((dependency) => (
                        <span
                          key={dependency}
                          className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm"
                        >
                          {dependency}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {source.healthHistory && source.healthHistory.length > 1 && (
                  <div className="rounded-xl border border-slate-100 bg-white p-3">
                    <p className="text-xs font-medium text-slate-600">
                      24h Health Trend
                    </p>
                    <svg viewBox="0 0 120 40" className="mt-2 h-16 w-full">
                      <polyline
                        fill="none"
                        stroke={
                          source.healthTrend === 'degrading'
                            ? '#f43f5e'
                            : source.healthTrend === 'improving'
                            ? '#10b981'
                            : '#6366f1'
                        }
                        strokeWidth="2"
                        points={source.healthHistory
                          .map((point, index) => {
                            const x = (index / (source.healthHistory!.length - 1)) * 120;
                            const y = 40 - (point / 100) * 32 - 4;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => refreshSource(source.source_id)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                  Refresh
                </button>
                {triggerSourceTest && (
                  <button
                    type="button"
                    onClick={() => triggerSourceTest(source.source_id)}
                    className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    <Signal className="h-3.5 w-3.5" />
                    Run Diagnostics
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    paused ? handleResume(source.source_id) : handlePause(source.source_id)
                  }
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {paused ? (
                    <>
                      <PlayCircle className="h-3.5 w-3.5 text-emerald-500" />
                      Resume
                    </>
                  ) : (
                    <>
                      <PauseCircle className="h-3.5 w-3.5 text-amber-500" />
                      Pause
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
