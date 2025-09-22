'use client';

import {
  Activity,
  Bell,
  AlertTriangle,
  CheckCircle2,
  CloudFog,
  Download,
  Gauge,
  HeartPulse,
  ServerCrash,
  SignalHigh,
  SignalMedium,
  SignalZero,
  TimerReset,
} from "lucide-react";
import type { UseSourceHealthReturn } from "@/app/types/sources";
import {
  exportSourceHealthToCsv,
  formatRelativeTime,
  getStatusBadgeClasses,
} from "@/app/utils/sourceHealthUtils";

export interface SourceHealthDiagnosticsProps {
  state: UseSourceHealthReturn;
}

const STATUS_LABELS: Record<string, string> = {
  initializing: 'Initializing connection',
  connecting: 'Connecting to Bailey intelligence backend',
  connected: 'Streaming live telemetry',
  reconnecting: 'Reconnecting…',
  degraded: 'Fallback telemetry in use',
  offline: 'Offline',
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case 'reconnecting':
      return <SignalMedium className="h-4 w-4 text-amber-500" />;
    case 'degraded':
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    case 'connecting':
    case 'initializing':
      return <SignalHigh className="h-4 w-4 text-sky-500" />;
    case 'offline':
      return <SignalZero className="h-4 w-4 text-rose-500" />;
    default:
      return <CloudFog className="h-4 w-4 text-slate-400" />;
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
  const latencyLabel =
    monitoring.performance.averageLatencyMs != null
      ? `${monitoring.performance.averageLatencyMs} ms`
      : 'n/a';

  const p95LatencyLabel =
    monitoring.performance.p95LatencyMs != null
      ? `${monitoring.performance.p95LatencyMs} ms`
      : 'n/a';

  const mostImpactedSources = sourceHealth
    .filter((source) => source.status === 'degraded' || source.status === 'offline')
    .slice(0, 5);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
              Live Telemetry
            </p>
            <h2 className="text-xl font-semibold text-slate-900">
              Bailey Intelligence Source Diagnostics
            </h2>
            <p className="text-sm text-slate-600">
              Monitor live connector health, latency, and recovery behaviour for
              the core sources powering Bailey Intelligence.
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
              {isRefreshing ? 'Refreshing…' : 'Refresh Telemetry'}
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
                <dt>Using live data</dt>
                <dd className={usingMockData ? 'text-rose-600' : 'text-emerald-600'}>
                  {usingMockData ? 'Fallback telemetry active' : 'Live telemetry' }
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Consecutive failures</dt>
                <dd>{connectionState.consecutiveFailures}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Last success</dt>
                <dd>{connectionState.lastSuccessAt ? formatRelativeTime(connectionState.lastSuccessAt) : 'n/a'}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Last failure</dt>
                <dd>{connectionState.lastFailureAt ? formatRelativeTime(connectionState.lastFailureAt) : 'n/a'}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <HeartPulse className="h-4 w-4 text-rose-500" />
              Performance Metrics
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-3 text-xs text-slate-600">
              <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                <dt className="flex items-center gap-2 font-medium text-slate-700">
                  <Gauge className="h-3.5 w-3.5 text-slate-500" /> Avg latency
                </dt>
                <dd className="font-semibold text-slate-900">{latencyLabel}</dd>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                <dt className="flex items-center gap-2 font-medium text-slate-700">
                  <Activity className="h-3.5 w-3.5 text-slate-500" /> p95 latency
                </dt>
                <dd className="font-semibold text-slate-900">{p95LatencyLabel}</dd>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                <dt className="flex items-center gap-2 font-medium text-slate-700">
                  <SignalHigh className="h-3.5 w-3.5 text-slate-500" /> Stream reconnects
                </dt>
                <dd className="font-semibold text-slate-900">
                  {monitoring.performance.streamReconnects}
                </dd>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                <dt className="flex items-center gap-2 font-medium text-slate-700">
                  <ServerCrash className="h-3.5 w-3.5 text-slate-500" /> Timeouts
                </dt>
                <dd className="font-semibold text-slate-900">
                  {monitoring.performance.timeoutCount}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="col-span-1 space-y-4">
          {error || connectionState.lastError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" />
                Live Source Alert
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
                Live telemetry stable
              </div>
              <p className="mt-2 text-xs leading-5">
                Bailey is streaming live source health updates. Last synced{' '}
                {lastUpdated ? formatRelativeTime(lastUpdated) : 'recently'}.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <SignalHigh className="h-4 w-4 text-blue-500" />
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
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${getStatusBadgeClasses(source.status)}`}>
                        {source.status}
                      </span>
                    </div>
                    <p className="mt-2 text-slate-600">
                      Depends on {source.dependsOn?.join(', ') || 'core services'}
                    </p>
                    {source.healthHistory && source.healthHistory.length > 0 && (
                      <p className="mt-1 text-slate-500">
                        Recent health trend: {source.healthHistory.slice(-3).join(' → ')}
                      </p>
                    )}
                    {state.triggerSourceTest && (
                      <button
                        type="button"
                        className="mt-3 inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100"
                        onClick={() => state.triggerSourceTest?.(source.source_id)}
                      >
                        <Activity className="mr-1.5 h-3 w-3" /> Run Diagnostics
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
            Observability Timeline
          </div>
          <dl className="mt-4 space-y-3 text-xs text-slate-600">
            <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt>Total requests</dt>
              <dd>{monitoring.performance.totalRequests}</dd>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt>Successful</dt>
              <dd>{monitoring.performance.successfulRequests}</dd>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt>Failed</dt>
              <dd>{monitoring.performance.failedRequests}</dd>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt>Stream heartbeats</dt>
              <dd>{monitoring.performance.streamEventCount}</dd>
            </div>
            <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt>Last heartbeat</dt>
              <dd>
                {monitoring.performance.lastHeartbeatAt
                  ? formatRelativeTime(monitoring.performance.lastHeartbeatAt)
                  : 'n/a'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
