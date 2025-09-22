'use client';

import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Download,
  RefreshCw,
  TimerReset,
  Wifi,
} from 'lucide-react';
import type { UseSourceHealthReturn } from '@/app/types/sources';
import {
  exportSourceHealthToCsv,
  formatConnectionQuality,
  formatRelativeTime,
  getConnectionQuality,
  getQualityColor,
  getSimpleStatus,
  getSimpleStatusBadgeClasses,
} from '@/app/utils/sourceHealthUtils';

export interface SourceHealthDiagnosticsProps {
  state: UseSourceHealthReturn;
}

const STATUS_LABELS: Record<string, string> = {
  initializing: 'Getting ready',
  connecting: 'Connecting',
  connected: 'Online',
  reconnecting: 'Reconnecting',
  degraded: 'Online with delays',
  offline: 'Offline',
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case 'reconnecting':
    case 'connecting':
    case 'initializing':
      return <RefreshCw className="h-4 w-4 text-blue-500" />;
    case 'degraded':
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    case 'offline':
      return <AlertTriangle className="h-4 w-4 text-rose-500" />;
    default:
      return <Wifi className="h-4 w-4 text-slate-400" />;
  }
};

export default function SourceHealthDiagnostics({
  state,
}: SourceHealthDiagnosticsProps) {
  const {
    error,
    refreshHealth,
    sourceHealth,
    connectionState,
    monitoring,
    usingMockData,
    isRefreshing,
    lastUpdated,
  } = state;

  const statusLabel = STATUS_LABELS[connectionState.status] ?? 'Unknown';
  const connectionQuality = getConnectionQuality(
    monitoring.performance.averageLatencyMs,
  );
  const connectionQualityLabel = formatConnectionQuality(connectionQuality);

  const statusCounts = sourceHealth.reduce(
    (accumulator, source) => {
      const simple = getSimpleStatus(source.status);
      if (simple === 'Online') {
        accumulator.online += 1;
      } else if (simple === 'Offline') {
        accumulator.offline += 1;
      } else {
        accumulator.maintenance += 1;
      }
      return accumulator;
    },
    { online: 0, offline: 0, maintenance: 0 },
  );

  const mostImpactedSources = sourceHealth
    .filter((source) => source.status === 'degraded' || source.status === 'offline')
    .slice(0, 5);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
              Connection Status
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Source Health Overview
            </h2>
            <p className="text-sm text-slate-600">
              Check how your data sources are doing at a glance—no technical dashboards required.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              onClick={refreshHealth}
              disabled={isRefreshing}
              aria-live="polite"
            >
              <TimerReset
                className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin text-blue-500' : 'text-slate-500'}`}
              />
              {isRefreshing ? 'Refreshing…' : 'Refresh Status'}
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
              onClick={() => exportSourceHealthToCsv(sourceHealth)}
            >
              <Download className="mr-2 h-4 w-4" /> Export Snapshot
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-3">
        <div className="col-span-1 space-y-4">
          <div
            className="rounded-2xl border border-slate-200 bg-white p-5"
            aria-live="polite"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                {statusIcon(connectionState.status)}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">Connection Status</p>
                <p className="text-xs text-slate-500">{statusLabel}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <dt>Live updates</dt>
                <dd className={usingMockData ? 'text-amber-600' : 'text-emerald-600'}>
                  {usingMockData ? 'Using sample data' : 'On'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Connection quality</dt>
                <dd className={`font-semibold ${getQualityColor(connectionQuality)}`}>
                  {connectionQualityLabel}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Last checked</dt>
                <dd>
                  {connectionState.lastSuccessAt
                    ? formatRelativeTime(connectionState.lastSuccessAt)
                    : lastUpdated
                    ? formatRelativeTime(lastUpdated)
                    : 'moments ago'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Next refresh</dt>
                <dd>{isRefreshing ? 'Refreshing now' : 'Automatic'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Wifi className="h-4 w-4 text-blue-500" />
              Connection Summary
            </div>
            <dl className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                <dt className="font-medium text-slate-700">Online sources</dt>
                <dd className="font-semibold text-emerald-600">{statusCounts.online}</dd>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                <dt className="font-medium text-slate-700">Offline sources</dt>
                <dd className="font-semibold text-rose-600">{statusCounts.offline}</dd>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                <dt className="font-medium text-slate-700">In maintenance</dt>
                <dd className="font-semibold text-slate-600">{statusCounts.maintenance}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="col-span-1 space-y-4">
          {error || connectionState.lastError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                Source Alert
              </div>
              <p className="mt-2 text-xs leading-5">
                {error || connectionState.lastError}
              </p>
              {connectionState.reconnectAttempts > 0 && (
                <p className="mt-2 text-xs text-rose-600">
                  Automatic recovery attempts: {connectionState.reconnectAttempts}
                </p>
              )}
              {connectionState.reconnectScheduledAt && (
                <p className="mt-2 text-xs text-rose-600">
                  Next reconnect scheduled {formatRelativeTime(connectionState.reconnectScheduledAt)}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Live updates look good
              </div>
              <p className="mt-2 text-xs leading-5">
                Everything is connected as expected. Last updated{' '}
                {lastUpdated ? formatRelativeTime(lastUpdated) : 'just now'}.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              High-Risk Sources
            </div>
            {mostImpactedSources.length === 0 ? (
              <p className="mt-3 text-xs text-slate-500">
                All live sources are reporting healthy telemetry.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-xs">
                {mostImpactedSources.map((source) => (
                  <li
                    key={source.source_id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-800">
                        {source.name}
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${getSimpleStatusBadgeClasses(source.status)}`}
                      >
                        {getSimpleStatus(source.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-slate-600">
                      Supporting systems: {source.dependsOn?.join(', ') || 'core services'}
                    </p>
                    <p className="mt-1 text-slate-500">
                      Trend: {
                        source.healthTrend === 'improving'
                          ? 'getting better'
                          : source.healthTrend === 'degrading'
                          ? 'needs attention'
                          : 'steady'
                      }
                    </p>
                    {state.triggerSourceTest && (
                      <button
                        type="button"
                        className="mt-3 inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100"
                        onClick={() => state.triggerSourceTest?.(source.source_id)}
                      >
                        <Activity className="mr-1.5 h-3 w-3" /> Check Connection
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Bell className="h-4 w-4 text-slate-500" />
            Activity Summary
          </div>
          <dl className="mt-4 space-y-3 text-xs text-slate-600">
            <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt>Last updated</dt>
              <dd>{lastUpdated ? formatRelativeTime(lastUpdated) : 'moments ago'}</dd>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt>Live updates</dt>
              <dd className={connectionState.streamConnected ? 'text-emerald-600' : 'text-amber-600'}>
                {connectionState.streamConnected ? 'Streaming' : 'Reconnecting'}
              </dd>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt>Alerts</dt>
              <dd className={error || connectionState.lastError ? 'text-rose-600' : 'text-emerald-600'}>
                {error || connectionState.lastError ? 'Needs attention' : 'None'}
              </dd>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt>Connection quality</dt>
              <dd className={`font-semibold ${getQualityColor(connectionQuality)}`}>
                {connectionQualityLabel}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
