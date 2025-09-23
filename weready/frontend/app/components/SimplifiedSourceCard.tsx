'use client';

import { memo, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  OctagonAlert,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Wifi,
} from 'lucide-react';
import type { SourceHealthData } from '../types/sources';
import {
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
  getQualityColor,
  getSourceServiceValue,
  handleKeyboardActivation,
} from '../utils/sourceHealthUtils';
import type { ConsumerStatusTone } from '../utils/sourceHealthUtils';

const STATUS_ICON_MAP = {
  AlertTriangle,
  CheckCircle2,
  Clock,
  OctagonAlert,
} as const;

const TONE_INDICATOR_COLORS: Record<ConsumerStatusTone, string> = {
  positive: 'bg-emerald-500',
  caution: 'bg-amber-500',
  warning: 'bg-rose-500',
  info: 'bg-purple-500',
  neutral: 'bg-slate-400',
};

interface SimplifiedSourceCardProps {
  source: SourceHealthData;
  index: number;
  totalSources: number;
  paused: boolean;
  onRefresh: (sourceId: string) => void;
  onTogglePause: (sourceId: string, shouldPause: boolean) => void;
  onTest?: (sourceId: string) => void;
  manualRefreshAllowed: boolean;
  showActions?: boolean;
}

function SimplifiedSourceCardComponent({
  source,
  index,
  totalSources,
  paused,
  onRefresh,
  onTogglePause,
  onTest,
  manualRefreshAllowed,
  showActions = false,
}: SimplifiedSourceCardProps) {
  const consumerStatus = getConsumerStatus(source.status);
  const statusDetails = getConsumerStatusDetails(consumerStatus);
  const statusVisual = getConsumerStatusVisual(consumerStatus);
  const StatusIcon = STATUS_ICON_MAP[statusVisual.icon as keyof typeof STATUS_ICON_MAP] ?? CheckCircle2;
  const indicatorClasses = paused
    ? 'ring-amber-300/60 bg-amber-50 text-amber-700'
    : statusVisual.indicatorRingClasses;
  const statusLabel = paused ? 'Paused' : consumerStatus;
  const statusBadgeClasses = paused
    ? 'border border-amber-200 bg-amber-50 text-amber-700'
    : `border ${statusDetails.badgeClasses}`;
  const indicatorDotClass = paused
    ? 'bg-amber-500'
    : TONE_INDICATOR_COLORS[statusDetails.tone] ?? 'bg-slate-400';
  const headerServiceLabel = paused
    ? 'Paused'
    : consumerStatus === 'ON'
      ? 'Live'
      : consumerStatus;

  const responseTime = source.responseTime ?? null;
  const responseQuality = getConnectionQuality(responseTime);
  const responseLabel = responseQuality === 'unknown' ? '—' : formatConnectionQuality(responseQuality);
  const responseToneClass = getQualityColor(responseQuality);
  const uptime = source.uptime ?? null;
  const reliabilityLabel = uptime === null ? '—' : formatUptime(uptime);
  const reliabilityToneClass = uptime === null ? 'text-slate-500' : 'text-emerald-600';

  const lastRefreshRelative = formatRelativeTime(source.lastUpdate ?? null);
  const dataFreshness = formatDataFreshness(source.dataFreshness ?? source.lastUpdate ?? null);
  const serviceValue = useMemo(
    () => source.description ?? getSourceServiceValue(source.name, source.category, source.description),
    [source.description, source.name, source.category],
  );

  const descriptionId = `simplified-source-${source.source_id}-description`;
  const statusId = `simplified-source-${source.source_id}-status`;
  const accessibility = buildSourceAccessibilityMetadata({
    sourceName: source.name,
    status: consumerStatus,
    category: source.category,
    lastUpdatedLabel: `Last updated ${lastRefreshRelative}`,
    businessImpact: statusDetails.businessImpact,
  });
  const navigationHint = getKeyboardNavigationHint(index, totalSources);

  const handleTogglePause = () => {
    onTogglePause(source.source_id, !paused);
  };

  const handleRefresh = () => {
    if (!manualRefreshAllowed) {
      return;
    }
    onRefresh(source.source_id);
  };

  const handleTest = () => {
    if (onTest) {
      onTest(source.source_id);
    }
  };

  return (
    <article
      role={accessibility.role}
      tabIndex={accessibility.tabIndex}
      aria-label={accessibility.ariaLabel}
      aria-description={accessibility.ariaDescription}
      aria-describedby={`${descriptionId} ${statusId}`}
      onKeyDown={(event) => handleKeyboardActivation(event, handleRefresh)}
      className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/80 focus-visible:ring-offset-2"
    >
      <span className="sr-only" aria-live="polite">
        {accessibility.statusAnnouncement}
      </span>
      <span className="sr-only">{navigationHint}</span>

      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-slate-500">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
              <span>Real-time feed</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                <span className={`h-2 w-2 rounded-full ${indicatorDotClass}`} aria-hidden="true" />
                {headerServiceLabel}
              </span>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${statusBadgeClasses}`} id={statusId}>
              {statusLabel}
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {statusVisual.emphasisText}
            </p>
            <h3 className="text-xl font-semibold text-slate-900">{source.name}</h3>
            <p className="text-sm text-slate-600">
              {serviceValue}
            </p>
          </div>
          <div className="text-xs font-medium text-slate-500">
            <span className="uppercase tracking-wide text-slate-400">Category</span>
            <span className="ml-2 text-slate-600">{source.category}</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <div
            className={`flex h-20 w-20 flex-col items-center justify-center rounded-full border-4 border-white text-sm font-semibold uppercase tracking-wide ring-4 ring-offset-4 ring-offset-white ${indicatorClasses}`}
            aria-hidden="true"
          >
            <StatusIcon className="h-8 w-8" />
            <span className="mt-1 text-xs">{statusLabel}</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500">{statusDetails.headline}</span>
        </div>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Response Speed</p>
          <p className={`mt-2 text-lg font-semibold ${responseToneClass}`}>{responseLabel}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Reliability</p>
          <p className={`mt-2 text-lg font-semibold ${reliabilityToneClass}`}>{reliabilityLabel}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-100 bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Last refresh</p>
          <p className="mt-2 text-slate-700">{lastRefreshRelative}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Data freshness</p>
          <p className="mt-2 text-slate-700">{dataFreshness}</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white/80 p-4 sm:col-span-1 sm:row-span-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">What you gain</p>
          <p className="mt-2 text-slate-700" id={descriptionId}>
            {serviceValue}
          </p>
        </div>
      </div>

      {showActions && (
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            aria-label={`Update ${source.name}`}
            disabled={!manualRefreshAllowed}
            aria-disabled={!manualRefreshAllowed}
            title={!manualRefreshAllowed ? 'Manual refresh unavailable during cooldown' : undefined}
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            Update
          </button>
          {onTest && (
            <button
              type="button"
              onClick={handleTest}
              className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2"
              aria-label={`Run connection test for ${source.name}`}
            >
              <Wifi className="h-3.5 w-3.5" aria-hidden="true" />
              Test Source
            </button>
          )}
          <button
            type="button"
            onClick={handleTogglePause}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
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
      )}
    </article>
  );
}

const SimplifiedSourceCard = memo(SimplifiedSourceCardComponent);

export default SimplifiedSourceCard;
