"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  checkApiHealth,
  HEALTH_ENDPOINT,
  getApiMonitoringConfig,
  validateApiConfiguration,
  getApiDiagnostics,
  classifyApiError,
} from "@/lib/api-config";

const STORAGE_KEY = "weready:api-health:last-snapshot";
const DEFAULT_HISTORY_SIZE = 25;

export type ApiHealthStatus = "checking" | "online" | "degraded" | "offline";

export interface ApiDiagnosticsInfo {
  environment: string;
  configuredPort: number;
  detectedPort?: number;
  portMatches: boolean;
  fallbackConfigured: boolean;
  fallbackBaseUrl?: string;
}

export interface ApiHealthSnapshot {
  timestamp: number;
  status: ApiHealthStatus;
  latency: number | null;
  error: string | null;
  errorType: string | null;
  data: any;
  diagnostics: ApiDiagnosticsInfo | null;
  fallbackActive: boolean;
  httpStatus?: number;
  endpoint?: string;
}

export interface ApiTelemetrySnapshot {
  inFlight: number;
  recentFailures: Array<{
    endpoint: string;
    url: string;
    error: string | undefined;
    type: string | undefined;
    attempt: number;
    attempts: number;
    timestamp: number;
  }>;
  lastFailure: {
    endpoint: string;
    url: string;
    error: string | undefined;
    type: string | undefined;
    attempt: number;
    attempts: number;
    timestamp: number;
  } | null;
  fallbackBaseUrl?: string;
}

export interface UseApiHealthOptions {
  endpoint?: string;
  pollIntervalMs?: number;
  timeoutMs?: number;
  retryAttempts?: number;
  useFallback?: boolean;
  autoStart?: boolean;
  historySize?: number;
  suppressStorage?: boolean;
}

export interface UseApiHealthState {
  status: ApiHealthStatus;
  lastChecked: number | null;
  latencyMs: number | null;
  latencyAvgMs: number | null;
  error: string | null;
  errorType: string | null;
  data: any;
  diagnostics: ApiDiagnosticsInfo | null;
  fallbackActive: boolean;
  isChecking: boolean;
  history: ApiHealthSnapshot[];
  consecutiveFailures: number;
  lastFailureAt: number | null;
  lastSuccessAt: number | null;
  telemetry: ApiTelemetrySnapshot;
  refresh: (override?: Partial<UseApiHealthOptions> & { immediate?: boolean }) => Promise<ApiHealthSnapshot | undefined>;
  pollIntervalMs: number;
}

const readStoredSnapshot = (): ApiHealthSnapshot | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ApiHealthSnapshot) : null;
  } catch (error) {
    console.warn("Unable to read cached API health snapshot", error);
    return null;
  }
};

const writeStoredSnapshot = (snapshot: ApiHealthSnapshot | null) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    if (!snapshot) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn("Unable to persist API health snapshot", error);
  }
};

const determineStatus = (result: {
  ok: boolean;
  data?: any;
  error?: string;
  status?: number;
}): ApiHealthStatus => {
  if (!result.ok) {
    return "offline";
  }

  const payload = result.data ?? {};
  const status = payload?.status;
  if (status && typeof status === "string" && status.toLowerCase() !== "healthy") {
    return "degraded";
  }

  const remaining = payload?.rate_limiting?.github?.remaining;
  if (typeof remaining === "number" && remaining <= 0) {
    return "degraded";
  }

  return "online";
};

const calculateLatencyAverage = (history: ApiHealthSnapshot[]): number | null => {
  const samples = history.filter((item) => typeof item.latency === "number" && item.latency !== null);
  if (samples.length === 0) {
    return null;
  }
  const sum = samples.reduce((total, item) => total + (item.latency ?? 0), 0);
  return Math.round(sum / samples.length);
};

const initialTelemetry = (): ApiTelemetrySnapshot => getApiDiagnostics();

const createInitialState = () => {
  const diagnostics = validateApiConfiguration();
  const storedSnapshot = readStoredSnapshot();
  const telemetry = initialTelemetry();

  if (storedSnapshot) {
    const history = [storedSnapshot];
    return {
      status: storedSnapshot.status,
      lastChecked: storedSnapshot.timestamp,
      latencyMs: storedSnapshot.latency,
      latencyAvgMs: storedSnapshot.latency,
      error: storedSnapshot.error,
      errorType: storedSnapshot.errorType,
      data: storedSnapshot.data,
      diagnostics: storedSnapshot.diagnostics ?? diagnostics,
      fallbackActive: storedSnapshot.fallbackActive,
      isChecking: false,
      history,
      consecutiveFailures: storedSnapshot.status === "offline" ? 1 : 0,
      lastFailureAt: storedSnapshot.status === "offline" ? storedSnapshot.timestamp : null,
      lastSuccessAt: storedSnapshot.status !== "offline" ? storedSnapshot.timestamp : null,
      telemetry,
    };
  }

  return {
    status: "checking" as ApiHealthStatus,
    lastChecked: null,
    latencyMs: null,
    latencyAvgMs: null,
    error: null,
    errorType: null,
    data: null,
    diagnostics,
    fallbackActive: false,
    isChecking: false,
    history: [] as ApiHealthSnapshot[],
    consecutiveFailures: 0,
    lastFailureAt: null,
    lastSuccessAt: null,
    telemetry,
  };
};

export const useApiHealth = (options: UseApiHealthOptions = {}): UseApiHealthState => {
  const monitoringConfig = useMemo(() => getApiMonitoringConfig(), []);
  const mergedOptions = useMemo(
    () => ({
      endpoint: HEALTH_ENDPOINT,
      pollIntervalMs: 45000,
      timeoutMs: monitoringConfig.timeoutMs,
      retryAttempts: monitoringConfig.retry?.attempts ?? 1,
      useFallback: true,
      autoStart: true,
      historySize: options.historySize ?? DEFAULT_HISTORY_SIZE,
      suppressStorage: options.suppressStorage ?? false,
      ...options,
    }),
    [monitoringConfig.retry?.attempts, monitoringConfig.timeoutMs, options],
  );

  const [state, setState] = useState(createInitialState);
  const optionsRef = useRef(mergedOptions);
  const inFlightRef = useRef<Promise<ApiHealthSnapshot | undefined> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    optionsRef.current = mergedOptions;
  }, [mergedOptions]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const updateStateWithSnapshot = useCallback((snapshot: ApiHealthSnapshot | null) => {
    if (!isMountedRef.current || !snapshot) {
      return;
    }

    setState((previous) => {
      const historyLimit = optionsRef.current.historySize ?? DEFAULT_HISTORY_SIZE;
      const history = [...previous.history, snapshot].slice(-historyLimit);
      const consecutiveFailures = snapshot.status === "offline" ? previous.consecutiveFailures + 1 : 0;
      const lastFailureAt = snapshot.status === "offline" ? snapshot.timestamp : previous.lastFailureAt;
      const lastSuccessAt = snapshot.status !== "offline" ? snapshot.timestamp : previous.lastSuccessAt;
      const telemetry = getApiDiagnostics();
      const latencyAvgMs = calculateLatencyAverage(history);

      if (!optionsRef.current.suppressStorage) {
        writeStoredSnapshot(snapshot);
      }

      if (typeof window !== "undefined") {
        const debugScope: Record<string, any> = (window as any).__WE_READY_DEBUG__ ?? {};
        debugScope.api = {
          ...(debugScope.api ?? {}),
          healthEndpoint: `${optionsRef.current.endpoint ?? HEALTH_ENDPOINT}`,
          lastStatus: snapshot.status,
          lastChecked: snapshot.timestamp,
          latencyMs: snapshot.latency,
          fallbackActive: snapshot.fallbackActive,
          errorType: snapshot.errorType,
          consecutiveFailures,
        };
        (window as any).__WE_READY_DEBUG__ = debugScope;
      }

      return {
        status: snapshot.status,
        lastChecked: snapshot.timestamp,
        latencyMs: snapshot.latency,
        latencyAvgMs,
        error: snapshot.error,
        errorType: snapshot.errorType,
        data: snapshot.data,
        diagnostics: snapshot.diagnostics ?? previous.diagnostics,
        fallbackActive: snapshot.fallbackActive,
        isChecking: false,
        history,
        consecutiveFailures,
        lastFailureAt,
        lastSuccessAt,
        telemetry,
      };
    });
  }, []);

  const refresh = useCallback(
    async (override: Partial<UseApiHealthOptions> & { immediate?: boolean } = {}) => {
      if (inFlightRef.current) {
        return inFlightRef.current;
      }

      const config = { ...optionsRef.current, ...override };

      if (isMountedRef.current) {
        setState((previous) => ({ ...previous, isChecking: true }));
      }

      const perform = async (): Promise<ApiHealthSnapshot | undefined> => {
        try {
          const result = await checkApiHealth(
            {},
            {
              timeoutMs: config.timeoutMs,
              retryAttempts: config.retryAttempts,
              useFallback: config.useFallback,
              endpoint: config.endpoint,
            },
          );

          const snapshot: ApiHealthSnapshot = {
            timestamp: Date.now(),
            status: determineStatus(result),
            latency: typeof result.duration === "number" ? result.duration : null,
            error: result.ok ? null : result.error || (result.status ? `HTTP ${result.status}` : "Unknown error"),
            errorType: result.ok ? null : (result.errorType ?? classifyApiError(result)),
            data: result.data ?? null,
            diagnostics: result.diagnostics ?? null,
            fallbackActive: Boolean(result.data?.meta?.source === "fallback" || !result.ok),
            httpStatus: result.status,
            endpoint: result.endpoint,
          };

          updateStateWithSnapshot(snapshot);
          return snapshot;
        } catch (error: any) {
          const snapshot: ApiHealthSnapshot = {
            timestamp: Date.now(),
            status: "offline",
            latency: null,
            error: error?.message || "Unable to reach API",
            errorType: classifyApiError(error),
            data: null,
            diagnostics: validateApiConfiguration(),
            fallbackActive: true,
            endpoint: optionsRef.current.endpoint,
          };
          updateStateWithSnapshot(snapshot);
          return snapshot;
        } finally {
          if (isMountedRef.current) {
            setState((previous) => ({ ...previous, isChecking: false }));
          }
          inFlightRef.current = null;
        }
      };

      inFlightRef.current = perform();
      return inFlightRef.current;
    },
    [updateStateWithSnapshot],
  );

  useEffect(() => {
    if (!mergedOptions.autoStart) {
      return;
    }
    refresh({ immediate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  useEffect(() => {
    const intervalMs = mergedOptions.pollIntervalMs;
    if (!intervalMs || intervalMs <= 0) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      refresh();
    }, intervalMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [mergedOptions.pollIntervalMs, refresh]);

  return {
    status: state.status,
    lastChecked: state.lastChecked,
    latencyMs: state.latencyMs,
    latencyAvgMs: state.latencyAvgMs,
    error: state.error,
    errorType: state.errorType,
    data: state.data,
    diagnostics: state.diagnostics,
    fallbackActive: state.fallbackActive,
    isChecking: state.isChecking,
    history: state.history,
    consecutiveFailures: state.consecutiveFailures,
    lastFailureAt: state.lastFailureAt,
    lastSuccessAt: state.lastSuccessAt,
    telemetry: state.telemetry,
    refresh,
    pollIntervalMs: mergedOptions.pollIntervalMs,
  };
};

export default useApiHealth;
