'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  OctagonAlert,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  SourceHealthData,
  UseSourceHealthReturn,
} from '../types/sources';
import {
  DEFAULT_MANUAL_REFRESH_COOLDOWN_MS,
  buildSourceAccessibilityMetadata,
  formatConnectionQuality,
  formatDataFreshness,
  formatRelativeTime,
  formatUptime,
  getConnectionQuality,
  getConsumerStatus,
  getConsumerStatusDetails,
  getConsumerStatusVisual,
  getKeyboardNavigationHint,
  getManualRefreshExplainer,
  getManualRefreshFeedback,
  getQualityColor,
  getSourceServiceValue,
  getStatusActionGuidance,
  handleKeyboardActivation,
} from '../utils/sourceHealthUtils';
import type { ConsumerStatusTone } from '../utils/sourceHealthUtils';

interface SourceHealthMonitorProps {
  sourceHealthState: UseSourceHealthReturn;
  sources: SourceHealthData[];
  selectedCategory: string | null;
  onCategoryChange?: (category: string | null) => void;
}

const STATUS_ICON_MAP: Record<string, LucideIcon> = {
  AlertTriangle,
  CheckCircle2,
  Clock,
  OctagonAlert,
};

const toneFocusClass: Record<ConsumerStatusTone, string> = {
  positive: 'hover:border-emerald-200 focus-visible:ring-emerald-300/70',
  caution: 'hover:border-amber-200 focus-visible:ring-amber-300/70',
  warning: 'hover:border-rose-200 focus-visible:ring-rose-300/70',
  info: 'hover:border-purple-200 focus-visible:ring-purple-300/70',
  neutral: 'hover:border-slate-200 focus-visible:ring-slate-300/70',
};

const getTrendIcon = (trend: SourceHealthData['healthTrend']) => {
  switch (trend) {
    case 'improving':
      return <ArrowUpRight className="h-4 w-4 text-emerald-500" aria-hidden="true" />;
    case 'degrading':
      return <ArrowDownRight className="h-4 w-4 text-amber-500" aria-hidden="true" />;
    default:
      return <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />;
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
    manualRefreshAllowed,
    manualRefreshMessage,
    nextAutoRefreshLabel,
    lastUpdatedLabel,
    usingMockData,
    connectionState,
  } = sourceHealthState;
  const isLiveConnection = connectionState.status === 'connected' && !usingMockData;
  const [localPaused, setLocalPaused] = useState<Record<string, boolean>>({});
  const [manualCooldownStart, setManualCooldownStart] = useState<number | null>(null);
  const [cooldownTick, setCooldownTick] = useState(() => Date.now());
  const manualExplainer = useMemo(() => getManualRefreshExplainer(), []);

  useEffect(() => {
    if (!manualRefreshAllowed) {
      setManualCooldownStart((previous) => previous ?? Date.now());
      const interval = window.setInterval(() => setCooldownTick(Date.now()), 1000);
      return () => window.clearInterval(interval);
    }

    setManualCooldownStart(null);
    return undefined;
  }, [manualRefreshAllowed]);

  const manualNow = manualRefreshAllowed ? Date.now() : cooldownTick;
  const manualFeedback = useMemo(
    () =>
      getManualRefreshFeedback(
        manualCooldownStart,
        manualRefreshAllowed ? 0 : DEFAULT_MANUAL_REFRESH_COOLDOWN_MS,
        manualNow,
        manualRefreshMessage,
      ),
    [manualCooldownStart, manualRefreshAllowed, manualRefreshMessage, manualNow],
  );

  const manualFeedbackToneClass = manualFeedback.allowed
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : manualFeedback.emphasis === 'waiting'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-rose-200 bg-rose-50 text-rose-700';

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
      {(degradedSources.length > 0 || usingMockData) && (
        <div
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5" aria-hidden="true" />
            <div>
              <p className="font-semibold">
                {degradedSources.length > 0
                  ? `${degradedSources.length} source${
                      degradedSources.length === 1 ? '' : 's'
                    } temporarily experiencing degraded performance`
                  : 'Displaying cached telemetry while live data reconnects'}
              </p>
              {degradedSources.length > 0 && (
                <p className="mt-1 text-xs">
                  Historical dashboards remain available. We are retrying connections automatically and will alert you when live updates resume.
                </p>
              )}
              {usingMockData && (
                <p className="mt-1 text-xs">
                  Live telemetry will refresh automatically. In the meantime, cached insights remain available and monitoring continues.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-stretch gap-3 text-xs text-slate-600">
        <button
          type="button"
          onClick={refreshHealth}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
          disabled={isRefreshing || !manualRefreshAllowed}
          aria-disabled={isRefreshing || !manualRefreshAllowed}
          aria-label="Refresh all live source telemetry"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-500' : 'text-slate-500'}`}
            aria-hidden="true"
          />
          Refresh All
        </button>

        <div
          className={`flex min-w-[260px] flex-1 flex-col justify-center gap-1 rounded-2xl border px-4 py-3 text-left shadow-sm ${manualFeedbackToneClass}`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold">{manualFeedback.primaryMessage}</p>
            {!manualFeedback.allowed && (
              <span className="rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                {manualFeedback.countdownLabel}
              </span>
            )}
          </div>
          <p className="text-[11px] leading-relaxed text-slate-600">
            {manualFeedback.secondaryMessage || manualExplainer}
          </p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full px-4 py-2 font-semibold ${
            isLiveConnection
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-amber-200 bg-amber-50 text-amber-700'
          }`}
          role="status"
          aria-live="polite"
        >
          <Wifi className="h-4 w-4" aria-hidden="true" />
          {isLiveConnection
            ? nextAutoRefreshLabel
            : `Cached telemetry • ${nextAutoRefreshLabel}`}
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">
          {lastUpdatedLabel}
        </div>

        {selectedCategory && (
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">
            <span>{selectedCategory}</span>
            <button
              type="button"
              onClick={() => onCategoryChange?.(null)}
              className="text-xs text-blue-500 underline-offset-2 hover:underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {sources.map((source, index) => {
          const connectionQuality = getConnectionQuality(source.responseTime);
          const consumerStatus = getConsumerStatus(source.status);
          const statusDetails = getConsumerStatusDetails(consumerStatus);
          const statusVisual = getConsumerStatusVisual(consumerStatus);
          const StatusIcon = STATUS_ICON_MAP[statusVisual.icon] ?? CheckCircle2;
          const statusActions = getStatusActionGuidance(consumerStatus);
          const serviceValue = source.description ?? getSourceServiceValue(
            source.name,
            source.category,
            source.description,
          );
          const paused = localPaused[source.source_id] === true;
          const descriptionId = `source-${source.source_id}-description`;
          const statusId = `source-${source.source_id}-status`;
          const lastRefreshRelative = formatRelativeTime(source.lastUpdate ?? null);
          const accessibility = buildSourceAccessibilityMetadata({
            sourceName: source.name,
            status: consumerStatus,
            category: source.category,
            lastUpdatedLabel: `Last updated ${lastRefreshRelative}`,
            businessImpact: statusDetails.businessImpact,
          });
          const navigationHint = getKeyboardNavigationHint(index, sources.length);
          const trendIcon = getTrendIcon(source.healthTrend);
          const toneClass = toneFocusClass[statusDetails.tone] ?? toneFocusClass.neutral;

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

          return (
            <div
              key={source.source_id}
              role={accessibility.role}
              tabIndex={accessibility.tabIndex}
              aria-label={accessibility.ariaLabel}
              aria-description={accessibility.ariaDescription}
              aria-describedby={`${descriptionId} ${statusId}`}
              onKeyDown={(event) => handleKeyboardActivation(event, () => refreshSource(source.source_id))}
              className={`group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${toneClass}`}
            >
              <span className="sr-only" aria-live="polite">
                {accessibility.statusAnnouncement}
              </span>
              <span className="sr-only">{navigationHint}</span>

              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-full border-4 ring-4 ring-offset-2 ring-offset-white ${statusVisual.indicatorRingClasses}`}
                    >
                      <StatusIcon className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <span
                      id={statusId}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusDetails.badgeClasses}`}
                    >
                      {paused ? 'Paused' : consumerStatus}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {statusVisual.emphasisText}
                    </p>
                    <h4 className="mt-1 text-lg font-semibold text-slate-900">{source.name}</h4>
                    <p className="mt-1 text-sm text-slate-600">{statusDetails.summary}</p>
                    <p className="mt-2 text-xs font-medium text-slate-500">Category · {source.category}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                    {trendIcon}
                    {getTrendDescription(source.healthTrend)}
                  </span>
                  {paused && (
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold uppercase text-amber-700">
                      Monitoring paused
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
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

              <div className="mt-4 grid gap-3 text-xs text-slate-500 md:grid-cols-2">
                <div>
                  <p className="font-medium text-slate-600">Last refresh</p>
                  <p>{lastRefreshRelative}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-600">Data freshness</p>
                  <p>{formatDataFreshness(source.dataFreshness ?? source.lastUpdate ?? null)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="font-medium text-slate-600">What you gain</p>
                  <p>{serviceValue}</p>
                </div>
              </div>

              <div
                id={descriptionId}
                className="mt-4 rounded-xl border border-slate-100 bg-white/70 p-4 text-sm text-slate-600"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Business impact
                </p>
                <p className="mt-1 text-sm text-slate-700">{statusDetails.businessImpact}</p>
                <p className="mt-2 text-xs text-slate-500">{statusDetails.recommendedAction}</p>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Recommended next steps
                </p>
                <ul className="mt-2 space-y-2" role="list">
                  {statusActions.map((action) => (
                    <li
                      key={`${source.source_id}-${action.label}`}
                      role="listitem"
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs text-slate-600"
                    >
                      <p className="font-semibold text-slate-700">{action.label}</p>
                      <p className="mt-1 leading-relaxed text-slate-600">{action.description}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {source.dependsOn && source.dependsOn.length > 0 && (
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
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
                <div className="mt-4 rounded-xl border border-slate-100 bg-white p-3 text-xs text-slate-500">
                  <p className="font-medium text-slate-600">Service history</p>
                  <p className="mt-1">{recentSummary}</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => refreshSource(source.source_id)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                  aria-label={`Update ${source.name}`}
                >
                  <RefreshCw className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                  Update
                </button>
                {triggerSourceTest && (
                  <button
                    type="button"
                    onClick={() => triggerSourceTest(source.source_id)}
                    className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-semibold text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
                    aria-label={`Run connection test for ${source.name}`}
                  >
                    <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
                    Test Source
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    paused ? handleResume(source.source_id) : handlePause(source.source_id)
                  }
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
                  aria-label={paused ? `Resume monitoring for ${source.name}` : `Pause updates for ${source.name}`}
                >
                  {paused ? (
                    <>
                      <PlayCircle className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                      Activate
                    </>
                  ) : (
                    <>
                      <PauseCircle className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
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
