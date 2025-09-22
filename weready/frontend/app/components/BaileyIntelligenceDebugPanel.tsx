"use client";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Network,
  RefreshCcw,
  ShieldAlert,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type {
  ApiDiagnosticsInfo,
  ApiHealthStatus,
  ApiTelemetrySnapshot,
} from "@/app/hooks/useApiHealth";
import { formatRelativeTime } from "@/app/utils/sourceHealthUtils";

type ApiPerformanceSample = {
  endpoint: string;
  durationMs: number;
  status: number | undefined;
  timestamp: number;
};

type ApiPerformanceSummary = {
  lastSample: ApiPerformanceSample | null;
  recentSamples: ApiPerformanceSample[];
  debug: boolean;
  timeoutMs: number;
  retry: { attempts: number; backoffMs: number; maxBackoffMs: number; jitter: boolean };
};

const statusTone: Record<ApiHealthStatus, { label: string; bg: string; text: string }> = {
  checking: { label: "Checking", bg: "bg-sky-50", text: "text-sky-600" },
  online: { label: "Connected", bg: "bg-emerald-50", text: "text-emerald-600" },
  degraded: { label: "Degraded", bg: "bg-amber-50", text: "text-amber-600" },
  offline: { label: "Offline", bg: "bg-rose-50", text: "text-rose-600" },
};

const formatTimestamp = (timestamp: number | null) => {
  if (!timestamp) {
    return "—";
  }
  return formatRelativeTime(timestamp);
};

const formatLatency = (latency: number | null) => {
  if (latency === null || typeof latency === "undefined") {
    return "—";
  }
  if (latency > 1000) {
    return `${(latency / 1000).toFixed(2)} s`;
  }
  return `${Math.round(latency)} ms`;
};

export interface BaileyIntelligenceDebugPanelProps {
  status: ApiHealthStatus;
  latencyMs: number | null;
  latencyAvgMs: number | null;
  consecutiveFailures: number;
  fallbackActive: boolean;
  lastChecked: number | null;
  lastSuccessAt: number | null;
  lastFailureAt: number | null;
  error: string | null;
  errorType: string | null;
  diagnostics: ApiDiagnosticsInfo | null;
  telemetry: ApiTelemetrySnapshot;
  connectionNotes: string[];
  debugDetails: Record<string, any> | null;
  performanceSnapshot: ApiPerformanceSummary;
  endpoint: string;
  onRetry: () => void | Promise<void>;
  isRetrying: boolean;
  loadingDeadlineReached: boolean;
}

const FailureList = ({ telemetry }: { telemetry: ApiTelemetrySnapshot }) => {
  if (!telemetry?.recentFailures?.length) {
    return null;
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
      <p className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
        <AlertTriangle className="h-4 w-4 text-amber-600" /> Recent failures
      </p>
      <ul className="space-y-2">
        {telemetry.recentFailures.slice(-5).reverse().map((failure) => (
          <li key={`${failure.endpoint}-${failure.timestamp}`} className="rounded-md bg-slate-50 p-2">
            <p className="font-medium text-slate-700">
              {failure.endpoint} · {failure.type || "unknown"}
            </p>
            <p className="text-slate-500">{formatRelativeTime(failure.timestamp)}</p>
            {failure.error && <p className="mt-1 text-slate-500">{failure.error}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

const BaileyIntelligenceDebugPanel = ({
  status,
  latencyMs,
  latencyAvgMs,
  consecutiveFailures,
  fallbackActive,
  lastChecked,
  lastSuccessAt,
  lastFailureAt,
  error,
  errorType,
  diagnostics,
  telemetry,
  connectionNotes,
  debugDetails,
  performanceSnapshot,
  endpoint,
  onRetry,
  isRetrying,
  loadingDeadlineReached,
}: BaileyIntelligenceDebugPanelProps) => {
  const tone = statusTone[status] ?? statusTone.checking;
  const notes = connectionNotes.filter(Boolean);

  return (
    <section className="mb-6 space-y-4">
      <div className={`rounded-lg border border-slate-200 ${tone.bg} p-4 shadow-sm`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-sm font-semibold ${tone.text}`}>Bailey Intelligence status: {tone.label}</p>
            <p className="text-xs text-slate-500">Last checked {formatTimestamp(lastChecked)}</p>
            {fallbackActive && (
              <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                <ShieldAlert className="h-3.5 w-3.5" /> Serving resilient demo data
              </p>
            )}
            {loadingDeadlineReached && (
              <p className="mt-1 inline-flex items-center gap-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
                <Clock className="h-3.5 w-3.5" /> Timeout threshold reached
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
            <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1">
              <Activity className="h-3.5 w-3.5 text-slate-500" />
              <span>Latency {formatLatency(latencyMs)}</span>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1">
              <BarChart3 className="h-3.5 w-3.5 text-slate-500" />
              <span>Avg {formatLatency(latencyAvgMs)}</span>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>{diagnostics?.environment ?? "dev"}</span>
            </div>
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
              {isRetrying ? "Retrying" : "Retry health"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <p className="font-semibold">{errorType ? errorType.toUpperCase() : "Connection issue"}</p>
          <p className="mt-1 text-rose-600">{error}</p>
        </div>
      )}

      {notes.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700">
          <p className="mb-2 flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" /> Connection notes
          </p>
          <ul className="space-y-1">
            {notes.map((note) => (
              <li key={note} className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Activity className="h-4 w-4" /> Latency telemetry
          </p>
          <p>Current latency: {formatLatency(latencyMs)}</p>
          <p>Average latency: {formatLatency(latencyAvgMs)}</p>
          <p>Timeout budget: {performanceSnapshot.timeoutMs} ms</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Zap className="h-4 w-4" /> Resilience status
          </p>
          <p>Consecutive failures: {consecutiveFailures}</p>
          <p>Last success: {formatTimestamp(lastSuccessAt)}</p>
          <p>Last failure: {formatTimestamp(lastFailureAt)}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Network className="h-4 w-4" /> Endpoint & config
          </p>
          <p className="font-mono text-xs text-slate-500">{endpoint.replace(/^https?:\/\//, "")}</p>
          {diagnostics && (
            <p className="mt-1 text-slate-500">
              Port {diagnostics.configuredPort} · {diagnostics.portMatches ? "aligned" : "mismatch"}
            </p>
          )}
          {telemetry?.fallbackBaseUrl && (
            <p className="mt-1 text-slate-500">Fallback: {telemetry.fallbackBaseUrl}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FailureList telemetry={telemetry} />

        <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600">
          <p className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
            <Clock className="h-4 w-4 text-slate-500" /> Recent throughput
          </p>
          {performanceSnapshot?.recentSamples?.length ? (
            <ul className="space-y-2">
              {performanceSnapshot.recentSamples.slice(-5).reverse().map((sample) => (
                <li key={`${sample.endpoint}-${sample.timestamp}`} className="rounded-md bg-slate-50 px-3 py-2">
                  <p className="font-medium text-slate-700">{sample.endpoint}</p>
                  <p className="text-slate-500">
                    {Math.round(sample.durationMs)}ms · {sample.status ?? "n/a"} · {formatRelativeTime(sample.timestamp)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No recent samples recorded.</p>
          )}
        </div>
      </div>

      {debugDetails?.errors?.length ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-700">
          <p className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
            <ShieldAlert className="h-4 w-4 text-rose-500" /> Reported errors
          </p>
          <ul className="space-y-1">
            {debugDetails.errors.map((item: string) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
};

export default BaileyIntelligenceDebugPanel;
