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
  Wifi,
} from 'lucide-react';
import type {
  SourceHealthData,
  UseSourceHealthReturn,
} from '../types/sources';
import {
  formatDataFreshness,
  formatRelativeTime,
  formatServiceReliability,
  formatUptime,
  formatConnectionQuality,
  getBusinessImpactDescription,
  getConnectionQuality,
  getConsumerStatus,
  getConsumerStatusBadgeClasses,
  getConsumerStatusDescription,
  getQualityColor,
  getSimpleStatus,
  getSimpleStatusBadgeClasses,
  type ConsumerStatus,
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
      return <ArrowDownRight className="h-4 w-4 text-amber-500" />;
    default:
      return <ArrowRight className="h-4 w-4 text-slate-400" />;
  }
};

const getTrendDescription = (trend: SourceHealthData['healthTrend']) => {
  switch (trend) {
    case 'improving':
      return 'Service improving';
    case 'degrading':
      return 'Needs attention';
    default:
      return 'Service stable';
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
                    } temporarily unavailable`
                  : 'Reconnecting to real-time updates'}
              </p>
              {degradedSources.length > 0 && (
                <p className="mt-1 text-xs">
                  Your historical data remains accessible. We're actively restoring these connections.
                </p>
              )}
              {!isStreaming && (
                <p className="mt-1 text-xs">
                  Your data is safe. We're reconnecting to provide real-time updates.
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
          Refresh All
        </button>
        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1 font-semibold ${
            isStreaming
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          <Wifi className="h-3.5 w-3.5" />
          {isStreaming ? 'Real-time updates active' : 'Using cached data'}
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
          const connectionQuality = getConnectionQuality(source.responseTime);
          const recentSummary =
            source.healthHistory && source.healthHistory.length > 1
              ? source.healthHistory
                  .slice(-3)
                  .map((value) => {
                    if (value >= 85) return 'Good';
                    if (value >= 60) return 'Fair';
                    return 'Offline';
                  })
                  .join(' • ')
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
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${getConsumerStatusBadgeClasses(getConsumerStatus(source.status))}`}
                  >
                    {paused ? 'PAUSED' : getConsumerStatus(source.status)}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                    {getTrendIcon(source.healthTrend)}
                    {getTrendDescription(source.healthTrend)}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Response Speed
                    </p>
                    <p className={`mt-1 text-lg font-semibold ${getQualityColor(connectionQuality)}`}>
                      {formatConnectionQuality(connectionQuality)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400">
                      Reliability
                    </p>
                    <p className="mt-1 text-lg font-semibold text-emerald-600">
                      {formatUptime(source.uptime)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Data Quality Score</span>
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
                    <p className="font-medium text-slate-600">Last refresh</p>
                    <p>{formatRelativeTime(source.lastUpdate)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-600">Data freshness</p>
                    <p>{formatDataFreshness(source.lastUpdate)}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="font-medium text-slate-600">Business impact</p>
                    <p>
                      {getBusinessImpactDescription(getConsumerStatus(source.status)).split(' - ')[0]}
                    </p>
                  </div>
                </div>

                {source.dependsOn && source.dependsOn.length > 0 && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
                    <p className="font-medium text-slate-600">Related data sources</p>
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

                {recentSummary && (
                  <div className="rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-500">
                    <p className="font-medium text-slate-600">Service history</p>
                    <p className="mt-1">{recentSummary}</p>
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
                  Update
                </button>
                {triggerSourceTest && (
                  <button
                    type="button"
                    onClick={() => triggerSourceTest(source.source_id)}
                    className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    <Wifi className="h-3.5 w-3.5" />
                    Test Source
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
                      Activate
                    </>
                  ) : (
                    <>
                      <PauseCircle className="h-3.5 w-3.5 text-amber-500" />
                      Pause Updates
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
