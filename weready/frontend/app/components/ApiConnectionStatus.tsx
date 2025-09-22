"use client";

import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  WifiOff,
} from "lucide-react";
import { formatRelativeTime } from "@/app/utils/sourceHealthUtils";
import type { ApiDiagnosticsInfo, ApiHealthStatus } from "@/app/hooks/useApiHealth";

type ApiPerformanceSample = {
  endpoint: string;
  durationMs: number;
  status: number | undefined;
  timestamp: number;
};

export interface ApiPerformanceSummary {
  lastSample: ApiPerformanceSample | null;
  recentSamples: ApiPerformanceSample[];
  debug: boolean;
  timeoutMs: number;
  retry: { attempts: number; backoffMs: number; maxBackoffMs: number; jitter: boolean };
}

export interface ApiConnectionStatusProps {
  status: ApiHealthStatus;
  lastChecked: number | null;
  latencyMs: number | null;
  error: string | null;
  usingFallback?: boolean;
  notes?: string[];
  diagnostics?: ApiDiagnosticsInfo | null;
  onRetry?: () => void | Promise<void>;
  retrying?: boolean;
  healthEndpoint?: string;
  debugDetails?: {
    errors?: string[];
    endpoint?: string;
    diagnostics?: ApiDiagnosticsInfo | null;
    performance?: ApiPerformanceSummary;
  } | null;
  performance?: ApiPerformanceSummary;
}

const statusStyles: Record<ApiHealthStatus, { label: string; tone: string; icon: JSX.Element }> = {
  checking: {
    label: "Checking",
    tone: "text-sky-600",
    icon: <Loader2 className="h-4 w-4 animate-spin" />,
  },
  online: {
    label: "Connected",
    tone: "text-emerald-600",
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  },
  degraded: {
    label: "Degraded",
    tone: "text-amber-600",
    icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
  },
  offline: {
    label: "Offline",
    tone: "text-rose-600",
    icon: <WifiOff className="h-4 w-4 text-rose-600" />,
  },
};

const formatLatency = (latencyMs: number | null) => {
  if (latencyMs === null || typeof latencyMs === "undefined") {
    return "—";
  }
  if (latencyMs > 1000) {
    return `${(latencyMs / 1000).toFixed(2)} s`;
  }
  return `${Math.round(latencyMs)} ms`;
};

const buildNotes = (notes?: string[]) => {
  if (!notes || notes.length === 0) {
    return null;
  }
  return (
    <ul className="mt-2 space-y-1 text-xs text-slate-600">
      {notes.map((note, index) => (
        <li key={`${note}-${index}`} className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-amber-500" />
          <span>{note}</span>
        </li>
      ))}
    </ul>
  );
};

const ApiConnectionStatus = ({
  status,
  lastChecked,
  latencyMs,
  error,
  usingFallback = false,
  notes,
  diagnostics,
  onRetry,
  retrying,
  healthEndpoint,
  debugDetails,
  performance,
}: ApiConnectionStatusProps) => {
  const meta = useMemo(() => statusStyles[status] ?? statusStyles.checking, [status]);
  const relativeLastChecked = useMemo(() => {
    if (!lastChecked) {
      return "No recent checks";
    }
    return `Last checked ${formatRelativeTime(lastChecked)}`;
  }, [lastChecked]);

  const latencyLabel = useMemo(() => formatLatency(latencyMs), [latencyMs]);

  const fallbackBadge = usingFallback ? (
    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
      Using fallback data
    </span>
  ) : null;

  const diagnosticSummary = diagnostics
    ? `${diagnostics.environment} · port ${diagnostics.configuredPort}${
        diagnostics.portMatches ? " aligned" : " mismatch"
      }`
    : "";

  const showRetry = typeof onRetry === "function";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            {meta.icon}
          </span>
          <div>
            <p className={`text-sm font-semibold ${meta.tone}`}>Bailey API {meta.label}</p>
            <p className="text-xs text-slate-500">{relativeLastChecked}</p>
            {diagnosticSummary && (
              <p className="text-xs text-slate-500">{diagnosticSummary}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
            <Activity className="h-3.5 w-3.5 text-slate-500" />
            <span>Latency {latencyLabel}</span>
          </div>
          {fallbackBadge}
          {healthEndpoint && (
            <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-500">
              {healthEndpoint.replace(/^https?:\/\//, "")}
            </span>
          )}
          {showRetry && (
            <button
              type="button"
              onClick={() => onRetry?.()}
              disabled={retrying}
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${retrying ? "animate-spin" : ""}`} />
              {retrying ? "Retrying" : "Retry"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <p className="font-medium">{error}</p>
          <p className="text-rose-600">We&apos;re watching the connection and will switch back to live data once it recovers.</p>
        </div>
      )}

      {buildNotes(notes)}

      {(debugDetails || performance) && (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {performance?.lastSample && (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Last API call</p>
              <p>
                {Math.round(performance.lastSample.durationMs)}ms · {performance.lastSample.endpoint}
              </p>
            </div>
          )}
          {debugDetails?.diagnostics && (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Diagnostics</p>
              <p>
                {debugDetails.diagnostics.environment} env · port {debugDetails.diagnostics.configuredPort}
              </p>
              {debugDetails.diagnostics.portMatches ? (
                <p className="text-emerald-600">Port alignment verified</p>
              ) : (
                <p className="text-amber-600">Port mismatch detected</p>
              )}
            </div>
          )}
          {debugDetails?.errors?.length ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Recent errors</p>
              <ul className="mt-1 list-disc pl-4">
                {debugDetails.errors.map((item, index) => (
                  <li key={`${item}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ApiConnectionStatus;
