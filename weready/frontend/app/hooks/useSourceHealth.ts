'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { apiCall, getApiUrl } from '@/lib/api-config';
import type {
  SourceConnectionState,
  SourceHealthData,
  SourceMetrics,
  SourceMonitoringSnapshot,
  SourceStatusResponse,
  UseSourceHealthReturn,
} from '@/app/types/sources';
import { calculateOverallHealthScore } from '@/app/utils/sourceHealthUtils';
import { createSourceMonitoringTracker } from '@/app/utils/sourceHealthMonitoring';

const DEFAULT_REFRESH_INTERVAL = 30_000;
const HEALTH_ENDPOINT = '/api/sources/health';
const STREAM_ENDPOINT = '/api/sources/status/stream';
const TEST_ENDPOINT = (sourceId: string) => `/api/sources/${sourceId}/test`;
const DIAGNOSTICS_ENDPOINT = (sourceId: string) => `/api/sources/${sourceId}/diagnostics`;
const PAUSE_ENDPOINT = (sourceId: string) => `/api/sources/${sourceId}/pause`;
const RESUME_ENDPOINT = (sourceId: string) => `/api/sources/${sourceId}/resume`;

const REQUEST_TIMEOUT_MS = 15_000;
const MAX_FETCH_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 20_000;
const STREAM_INITIAL_BACKOFF_MS = 2_000;
const STREAM_MAX_BACKOFF_MS = 60_000;
const STREAM_FAILURE_THRESHOLD = 3;

const now = () => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }
  return Date.now();
};

const sleep = (timeout: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, timeout);
  });

type FailureReason = 'timeout' | 'network' | 'http' | 'abort' | 'unknown';

const describeError = (error: unknown): { message: string; reason: FailureReason; status?: number } => {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      message: 'Request to the source health service timed out before completion.',
      reason: 'timeout',
    };
  }

  if (error instanceof TypeError) {
    return {
      message: 'Network request failed – please verify connectivity to the Bailey Intelligence API.',
      reason: 'network',
    };
  }

  if (error instanceof Error && 'status' in (error as never)) {
    const status = Number((error as { status?: number }).status);
    return {
      message: `Source health request failed with status code ${status}.`,
      reason: 'http',
      status,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      reason: 'unknown',
    };
  }

  return {
    message: 'Unexpected error while contacting the source health service.',
    reason: 'unknown',
  };
};

const MOCK_SOURCE_HEALTH: SourceHealthData[] = [
  {
    source_id: 'sec_edgar',
    name: 'SEC EDGAR Filings',
    category: 'Government',
    status: 'online',
    uptime: 99.7,
    responseTime: 234,
    credibility: 98,
    lastUpdate: new Date(Date.now() - 60_000).toISOString(),
    errorRate: 0.4,
    dataFreshness: new Date(Date.now() - 120_000).toISOString(),
    apiQuotaRemaining: 12_000,
    apiQuotaLimit: 15_000,
    dependsOn: ['us_government_data_hub'],
    healthTrend: 'stable',
    slaCompliance: 'On track',
    ingestionRate: 65,
    dataPointsLast24h: 9800,
    knowledgePoints: 2400,
    healthHistory: [96, 95, 94, 96, 97, 98, 98.5, 99],
  },
  {
    source_id: 'github_api',
    name: 'GitHub API',
    category: 'Industry',
    status: 'online',
    uptime: 99.3,
    responseTime: 145,
    credibility: 95,
    lastUpdate: new Date(Date.now() - 30_000).toISOString(),
    errorRate: 0.9,
    dataFreshness: new Date(Date.now() - 45_000).toISOString(),
    apiQuotaRemaining: 3800,
    apiQuotaLimit: 5000,
    dependsOn: ['octokit_adapter'],
    healthTrend: 'improving',
    slaCompliance: 'On track',
    ingestionRate: 120,
    dataPointsLast24h: 45200,
    knowledgePoints: 6800,
    healthHistory: [90, 91, 92, 93, 94, 95, 95.5, 96],
  },
  {
    source_id: 'arxiv',
    name: 'arXiv Research Feed',
    category: 'Academic',
    status: 'online',
    uptime: 98.2,
    responseTime: 312,
    credibility: 92,
    lastUpdate: new Date(Date.now() - 5 * 60_000).toISOString(),
    errorRate: 1.5,
    dataFreshness: new Date(Date.now() - 10 * 60_000).toISOString(),
    dependsOn: ['semantic_ingestion_pipeline'],
    healthTrend: 'stable',
    slaCompliance: 'Within thresholds',
    ingestionRate: 34,
    dataPointsLast24h: 5600,
    knowledgePoints: 2100,
    healthHistory: [88, 89, 90, 90, 91, 92, 92, 92.5],
  },
  {
    source_id: 'federal_reserve',
    name: 'Federal Reserve Economic Data',
    category: 'Government',
    status: 'online',
    uptime: 99.5,
    responseTime: 567,
    credibility: 97,
    lastUpdate: new Date(Date.now() - 60 * 60_000).toISOString(),
    errorRate: 0.2,
    dataFreshness: new Date(Date.now() - 30 * 60_000).toISOString(),
    dependsOn: ['economic_ingestion_pipeline'],
    healthTrend: 'improving',
    slaCompliance: 'On track',
    ingestionRate: 22,
    dataPointsLast24h: 3200,
    knowledgePoints: 1400,
    healthHistory: [94, 94.5, 95, 95.5, 96, 96.5, 97, 97.2],
  },
  {
    source_id: 'uspto_patents',
    name: 'USPTO Patents',
    category: 'Government',
    status: 'degraded',
    uptime: 97.1,
    responseTime: 890,
    credibility: 95,
    lastUpdate: new Date(Date.now() - 15 * 60_000).toISOString(),
    errorRate: 4.1,
    dataFreshness: new Date(Date.now() - 25 * 60_000).toISOString(),
    dependsOn: ['patent_normalizer'],
    healthTrend: 'degrading',
    slaCompliance: 'Latency breach – under mitigation',
    ingestionRate: 14,
    dataPointsLast24h: 1800,
    knowledgePoints: 960,
    maintenanceWindow: 'Credential rotation in progress',
    healthHistory: [94, 93, 92, 91, 90, 89, 88, 87],
  },
  {
    source_id: 'mit_research',
    name: 'MIT Research Digest',
    category: 'Academic',
    status: 'online',
    uptime: 98.8,
    responseTime: 423,
    credibility: 94,
    lastUpdate: new Date(Date.now() - 10 * 60_000).toISOString(),
    errorRate: 0.7,
    dataFreshness: new Date(Date.now() - 8 * 60_000).toISOString(),
    dependsOn: ['academic_ingestion_pipeline'],
    healthTrend: 'stable',
    slaCompliance: 'On track',
    ingestionRate: 18,
    dataPointsLast24h: 7400,
    knowledgePoints: 3200,
    healthHistory: [90, 91, 92, 92, 93, 94, 95, 95],
  },
  {
    source_id: 'sonarqube',
    name: 'SonarQube Quality Gate',
    category: 'Code Quality',
    status: 'online',
    uptime: 99.1,
    responseTime: 210,
    credibility: 96,
    lastUpdate: new Date(Date.now() - 35_000).toISOString(),
    errorRate: 0.9,
    dataFreshness: new Date(Date.now() - 50_000).toISOString(),
    dependsOn: ['code_quality_pipeline'],
    healthTrend: 'improving',
    slaCompliance: 'On track',
    ingestionRate: 54,
    dataPointsLast24h: 12800,
    knowledgePoints: 4200,
    healthHistory: [92, 92, 93, 94, 95, 95.5, 96, 96],
  },
  {
    source_id: 'codeclimate',
    name: 'CodeClimate Insights',
    category: 'Code Quality',
    status: 'online',
    uptime: 98.7,
    responseTime: 265,
    credibility: 93,
    lastUpdate: new Date(Date.now() - 42_000).toISOString(),
    errorRate: 1.2,
    dataFreshness: new Date(Date.now() - 65_000).toISOString(),
    dependsOn: ['code_quality_pipeline'],
    healthTrend: 'stable',
    slaCompliance: 'On track',
    ingestionRate: 48,
    dataPointsLast24h: 10400,
    knowledgePoints: 3800,
    healthHistory: [90, 90, 91, 92, 93, 93, 93.5, 94],
  },
  {
    source_id: 'gitguardian',
    name: 'GitGuardian Secrets Monitor',
    category: 'Code Quality',
    status: 'online',
    uptime: 99.4,
    responseTime: 188,
    credibility: 97,
    lastUpdate: new Date(Date.now() - 28_000).toISOString(),
    errorRate: 0.3,
    dataFreshness: new Date(Date.now() - 35_000).toISOString(),
    dependsOn: ['security_pipeline'],
    healthTrend: 'improving',
    slaCompliance: 'On track',
    ingestionRate: 62,
    dataPointsLast24h: 13600,
    knowledgePoints: 5100,
    healthHistory: [93, 94, 95, 95.5, 96, 97, 97.5, 98],
  },
  {
    source_id: 'semgrep',
    name: 'Semgrep Security Rules',
    category: 'Code Quality',
    status: 'maintenance',
    uptime: 96.5,
    responseTime: 312,
    credibility: 92,
    lastUpdate: new Date(Date.now() - 12 * 60_000).toISOString(),
    errorRate: 2.1,
    dataFreshness: new Date(Date.now() - 20 * 60_000).toISOString(),
    dependsOn: ['security_pipeline'],
    healthTrend: 'stable',
    slaCompliance: 'Maintenance window',
    ingestionRate: 26,
    dataPointsLast24h: 5400,
    knowledgePoints: 2100,
    maintenanceWindow: 'Ruleset upgrade – completes in 15m',
    healthHistory: [88, 88, 88, 88, 88, 87, 86, 86],
  },
  {
    source_id: 'yc_library',
    name: "Y Combinator Library",
    category: 'Business Intelligence',
    status: 'online',
    uptime: 97.9,
    responseTime: 256,
    credibility: 91,
    lastUpdate: new Date(Date.now() - 40_000).toISOString(),
    errorRate: 1.4,
    dataFreshness: new Date(Date.now() - 75_000).toISOString(),
    dependsOn: ['venture_insights_pipeline'],
    healthTrend: 'improving',
    slaCompliance: 'On track',
    ingestionRate: 37,
    dataPointsLast24h: 8200,
    knowledgePoints: 2800,
    healthHistory: [85, 86, 87, 88, 89, 90, 90, 91],
  },
  {
    source_id: 'first_round_review',
    name: 'First Round Review',
    category: 'Business Intelligence',
    status: 'online',
    uptime: 98.4,
    responseTime: 301,
    credibility: 93,
    lastUpdate: new Date(Date.now() - 55_000).toISOString(),
    errorRate: 1.1,
    dataFreshness: new Date(Date.now() - 100_000).toISOString(),
    dependsOn: ['venture_insights_pipeline'],
    healthTrend: 'stable',
    slaCompliance: 'On track',
    ingestionRate: 28,
    dataPointsLast24h: 6400,
    knowledgePoints: 2500,
    healthHistory: [88, 88, 89, 90, 91, 91, 92, 92],
  },
  {
    source_id: 'a16z',
    name: 'Andreessen Horowitz Research',
    category: 'Business Intelligence',
    status: 'degraded',
    uptime: 95.2,
    responseTime: 624,
    credibility: 90,
    lastUpdate: new Date(Date.now() - 18 * 60_000).toISOString(),
    errorRate: 3.6,
    dataFreshness: new Date(Date.now() - 30 * 60_000).toISOString(),
    dependsOn: ['venture_insights_pipeline'],
    healthTrend: 'degrading',
    slaCompliance: 'Retrying feed – provider latency',
    ingestionRate: 19,
    dataPointsLast24h: 4100,
    knowledgePoints: 1800,
    healthHistory: [92, 91, 90, 89, 88, 87, 86, 85],
  },
  {
    source_id: 'sequoia',
    name: 'Sequoia Partner Benchmarks',
    category: 'Investment Readiness',
    status: 'online',
    uptime: 98.9,
    responseTime: 284,
    credibility: 94,
    lastUpdate: new Date(Date.now() - 65_000).toISOString(),
    errorRate: 0.8,
    dataFreshness: new Date(Date.now() - 80_000).toISOString(),
    dependsOn: ['investment_pipeline'],
    healthTrend: 'improving',
    slaCompliance: 'On track',
    ingestionRate: 24,
    dataPointsLast24h: 5200,
    knowledgePoints: 1900,
    healthHistory: [90, 90, 91, 92, 93, 94, 95, 95],
  },
  {
    source_id: 'bessemer',
    name: 'Bessemer Cloud Index',
    category: 'Investment Readiness',
    status: 'online',
    uptime: 99.0,
    responseTime: 240,
    credibility: 95,
    lastUpdate: new Date(Date.now() - 58_000).toISOString(),
    errorRate: 0.6,
    dataFreshness: new Date(Date.now() - 70_000).toISOString(),
    dependsOn: ['investment_pipeline'],
    healthTrend: 'stable',
    slaCompliance: 'On track',
    ingestionRate: 21,
    dataPointsLast24h: 4800,
    knowledgePoints: 1700,
    healthHistory: [91, 91, 92, 92, 93, 93, 94, 94],
  },
  {
    source_id: 'cb_insights',
    name: 'CB Insights Market Intel',
    category: 'Investment Readiness',
    status: 'online',
    uptime: 97.6,
    responseTime: 330,
    credibility: 92,
    lastUpdate: new Date(Date.now() - 72_000).toISOString(),
    errorRate: 1.5,
    dataFreshness: new Date(Date.now() - 90_000).toISOString(),
    dependsOn: ['investment_pipeline'],
    healthTrend: 'stable',
    slaCompliance: 'On track',
    ingestionRate: 18,
    dataPointsLast24h: 4600,
    knowledgePoints: 1600,
    healthHistory: [88, 89, 89, 90, 90, 91, 91, 92],
  },
  {
    source_id: 'nngroup',
    name: 'Nielsen Norman UX Research',
    category: 'Design Experience',
    status: 'online',
    uptime: 98.5,
    responseTime: 275,
    credibility: 94,
    lastUpdate: new Date(Date.now() - 50_000).toISOString(),
    errorRate: 0.9,
    dataFreshness: new Date(Date.now() - 75_000).toISOString(),
    dependsOn: ['design_insights_pipeline'],
    healthTrend: 'stable',
    slaCompliance: 'On track',
    ingestionRate: 27,
    dataPointsLast24h: 6000,
    knowledgePoints: 2100,
    healthHistory: [90, 90, 91, 92, 92, 93, 93, 94],
  },
  {
    source_id: 'baymard',
    name: 'Baymard eCommerce UX',
    category: 'Design Experience',
    status: 'online',
    uptime: 97.8,
    responseTime: 295,
    credibility: 93,
    lastUpdate: new Date(Date.now() - 62_000).toISOString(),
    errorRate: 1.1,
    dataFreshness: new Date(Date.now() - 95_000).toISOString(),
    dependsOn: ['design_insights_pipeline'],
    healthTrend: 'stable',
    slaCompliance: 'On track',
    ingestionRate: 25,
    dataPointsLast24h: 5600,
    knowledgePoints: 2000,
    healthHistory: [88, 89, 90, 90, 91, 92, 92, 93],
  },
  {
    source_id: 'webaim',
    name: 'WebAIM Accessibility',
    category: 'Design Experience',
    status: 'online',
    uptime: 99.2,
    responseTime: 210,
    credibility: 96,
    lastUpdate: new Date(Date.now() - 48_000).toISOString(),
    errorRate: 0.4,
    dataFreshness: new Date(Date.now() - 70_000).toISOString(),
    dependsOn: ['design_insights_pipeline'],
    healthTrend: 'improving',
    slaCompliance: 'On track',
    ingestionRate: 33,
    dataPointsLast24h: 7200,
    knowledgePoints: 2600,
    healthHistory: [92, 92, 93, 94, 95, 96, 97, 97.5],
  },
];

function normalizeSourceResponse(
  payload: SourceStatusResponse,
): { sources: SourceHealthData[]; metrics: SourceMetrics } {
  const sources: SourceHealthData[] = Object.values(payload.sources || {});
  const metrics: SourceMetrics = {
    ...payload.metrics,
    system_health_score:
      payload.metrics?.system_health_score ?? calculateOverallHealthScore(sources),
    last_updated: payload.last_updated ?? new Date().toISOString(),
  };
  return { sources, metrics };
}

function buildMockMetrics(): SourceMetrics {
  const totalSources = MOCK_SOURCE_HEALTH.length;
  const activeSources = MOCK_SOURCE_HEALTH.filter(
    (source) => source.status !== 'offline',
  ).length;
  return {
    total_sources: totalSources,
    active_sources: activeSources,
    average_uptime:
      MOCK_SOURCE_HEALTH.reduce((acc, source) => acc + source.uptime, 0) /
      totalSources,
    average_response_time:
      MOCK_SOURCE_HEALTH.reduce((acc, source) => acc + source.responseTime, 0) /
      totalSources,
    total_data_points:
      MOCK_SOURCE_HEALTH.reduce(
        (acc, source) => acc + (source.dataPointsLast24h ?? 0),
        0,
      ),
    system_health_score: calculateOverallHealthScore(MOCK_SOURCE_HEALTH),
    last_updated: new Date().toISOString(),
    refresh_interval_seconds: DEFAULT_REFRESH_INTERVAL / 1000,
    total_knowledge_points: MOCK_SOURCE_HEALTH.reduce(
      (acc, source) => acc + (source.knowledgePoints ?? 0),
      0,
    ),
    average_credibility:
      MOCK_SOURCE_HEALTH.reduce((acc, source) => acc + source.credibility, 0) /
      totalSources,
    sla_target_ms: 400,
  };
}

export function useSourceHealth(): UseSourceHealthReturn {
  const monitoringRef = useRef(createSourceMonitoringTracker());
  const [monitoringSnapshot, setMonitoringSnapshot] =
    useState<SourceMonitoringSnapshot>(monitoringRef.current.getSnapshot());
  const [connectionState, setConnectionState] = useState<SourceConnectionState>(
    monitoringRef.current.getSnapshot().connection,
  );
  const [usingMockData, setUsingMockData] = useState(false);
  const [sourceHealth, setSourceHealth] = useState<SourceHealthData[]>([]);
  const [metrics, setMetrics] = useState<SourceMetrics | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const streamFailureCountRef = useRef(0);
  const fallbackUsedRef = useRef(false);
  const refreshIntervalRef = useRef<number>(DEFAULT_REFRESH_INTERVAL);
  const eventSourceRef = useRef<EventSource | null>(null);
  const isMountedRef = useRef(true);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFailureMessageRef = useRef<string | null>(null);

  const syncMonitoringState = useCallback(() => {
    const snapshot = monitoringRef.current.getSnapshot();
    setMonitoringSnapshot(snapshot);
    setConnectionState(snapshot.connection);
  }, []);

  const applyPayload = useCallback(
    (payload: SourceStatusResponse, context: 'fetch' | 'stream' = 'fetch') => {
      const { sources, metrics: computedMetrics } = normalizeSourceResponse(payload);
      if (!isMountedRef.current) return;
      setSourceHealth(sources);
      setMetrics(computedMetrics);
      setLastUpdated(computedMetrics.last_updated);
      refreshIntervalRef.current =
        (computedMetrics.refresh_interval_seconds ?? DEFAULT_REFRESH_INTERVAL / 1000) *
        1000;
      fallbackUsedRef.current = false;
      setUsingMockData(false);
      monitoringRef.current.resetRetries();
      monitoringRef.current.setUsingMockData(false);
      monitoringRef.current.setStatus('connected');
      monitoringRef.current.recordRecovery(context);
      syncMonitoringState();
      lastFailureMessageRef.current = null;
      setError(null);
    },
    [syncMonitoringState],
  );

  const applyMockData = useCallback(
    (reason: string | null = null) => {
      if (!isMountedRef.current) return;
      setSourceHealth(MOCK_SOURCE_HEALTH);
      const mockMetrics = buildMockMetrics();
      setMetrics(mockMetrics);
      setLastUpdated(mockMetrics.last_updated);
      refreshIntervalRef.current = DEFAULT_REFRESH_INTERVAL;
      setUsingMockData(true);
      fallbackUsedRef.current = true;
      monitoringRef.current.setUsingMockData(true);
      monitoringRef.current.setStatus('degraded');
      monitoringRef.current.recordFallback(reason ?? 'Switched to telemetry fallback.');
      syncMonitoringState();
    },
    [syncMonitoringState],
  );

  const fetchStatus = useCallback(
    async (suppressLoading = false) => {
      if (!suppressLoading) {
        setLoading(true);
      }

      monitoringRef.current.setStatus(suppressLoading ? 'reconnecting' : 'connecting');
      syncMonitoringState();

      let attempt = 0;
      let delay = INITIAL_BACKOFF_MS;
      let success = false;
      let lastErrorMessage = '';
      let finalReason: FailureReason = 'unknown';

      while (attempt <= MAX_FETCH_RETRIES) {
        const startedAt = now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
          const response = await apiCall(HEALTH_ENDPOINT, {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
            },
          });

          const duration = now() - startedAt;

          if (!response.ok) {
            const message = `Source health request failed with status ${response.status}.`;
            const errorWithStatus = new Error(message) as Error & { status?: number };
            errorWithStatus.status = response.status;
            throw errorWithStatus;
          }

          const payload = (await response.json()) as SourceStatusResponse;
          monitoringRef.current.recordSuccess(duration, HEALTH_ENDPOINT);
          monitoringRef.current.resetRetries();
          monitoringRef.current.setUsingMockData(false);
          monitoringRef.current.setStatus('connected');
          syncMonitoringState();
          applyPayload(payload, 'fetch');
          success = true;
          break;
        } catch (err) {
          const duration = now() - startedAt;
          const { message, reason, status } = describeError(err);
          lastErrorMessage = message;
          finalReason = reason;
          const isTimeout = reason === 'timeout';

          monitoringRef.current.recordFailure(
            duration,
            HEALTH_ENDPOINT,
            message,
            status,
            isTimeout,
          );
          monitoringRef.current.incrementRetries();
          monitoringRef.current.setStatus('reconnecting');
          syncMonitoringState();

          if (attempt >= MAX_FETCH_RETRIES) {
            break;
          }

          const jitter = Math.random() * 0.3 * delay;
          await sleep(delay + jitter);
          delay = Math.min(delay * 2, MAX_BACKOFF_MS);
        } finally {
          clearTimeout(timeoutId);
        }

        attempt += 1;
      }

      if (!success) {
        const friendlyMessage = (() => {
          switch (finalReason) {
            case 'timeout':
              return 'The source health service is taking longer than expected. Showing cached telemetry while we reconnect.';
            case 'network':
              return 'Unable to reach the source health service. Showing cached telemetry while the connection recovers.';
            case 'http':
              return 'The source health service responded with an error. Showing cached telemetry until service recovers.';
            default:
              return 'Live source telemetry is temporarily unavailable. Showing cached telemetry while we attempt to recover.';
          }
        })();

        setError(friendlyMessage);
        lastFailureMessageRef.current = lastErrorMessage || friendlyMessage;
        monitoringRef.current.setStatus('degraded');
        monitoringRef.current.setUsingMockData(true);
        syncMonitoringState();
        applyMockData(lastErrorMessage);
      } else {
        setError(null);
      }

      if (!suppressLoading) {
        setLoading(false);
      }
      setIsRefreshing(false);
      return success;
    },
    [applyMockData, applyPayload, syncMonitoringState],
  );

  useEffect(() => {
    isMountedRef.current = true;
    monitoringRef.current.setStatus('initializing');
    syncMonitoringState();
    fetchStatus();
    return () => {
      isMountedRef.current = false;
      monitoringRef.current.setStatus('offline');
      syncMonitoringState();
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [fetchStatus, syncMonitoringState]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => undefined;
    }

    let cancelled = false;
    let backoff = STREAM_INITIAL_BACKOFF_MS;

    const openStream = () => {
      if (cancelled) {
        return;
      }

      try {
        const url = getApiUrl(STREAM_ENDPOINT);
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;
        monitoringRef.current.recordStreamEvent('open-attempt');
        monitoringRef.current.setStatus('connecting');
        syncMonitoringState();

        eventSource.onopen = () => {
          if (cancelled) {
            return;
          }
          backoff = STREAM_INITIAL_BACKOFF_MS;
          streamFailureCountRef.current = 0;
          setIsStreaming(true);
          monitoringRef.current.recordStreamEvent('open');
          monitoringRef.current.setStatus('connected');
          syncMonitoringState();
        };

        eventSource.onmessage = (event) => {
          if (cancelled) {
            return;
          }
          monitoringRef.current.recordStreamEvent('message');
          try {
            const payload = JSON.parse(event.data) as SourceStatusResponse;
            applyPayload(payload, 'stream');
          } catch (err) {
            console.warn('Failed to parse stream payload', err);
            monitoringRef.current.recordStreamEvent('parse-error');
            syncMonitoringState();
          }
        };

        eventSource.onerror = (errorEvent) => {
          if (cancelled) {
            return;
          }
          console.warn('Source status stream disconnected:', errorEvent);
          setIsStreaming(false);
          streamFailureCountRef.current += 1;
          monitoringRef.current.recordStreamEvent('error');
          monitoringRef.current.setStatus('reconnecting');
          syncMonitoringState();

          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }

          if (
            streamFailureCountRef.current >= STREAM_FAILURE_THRESHOLD &&
            !fallbackUsedRef.current
          ) {
            const reason = 'Live source telemetry stream unavailable. Showing cached telemetry while we reconnect.';
            setError(reason);
            applyMockData(reason);
          }

          const cappedBackoff = Math.min(backoff, STREAM_MAX_BACKOFF_MS);
          const jitter = Math.random() * 0.25 * cappedBackoff;
          const delay = cappedBackoff + jitter;
          monitoringRef.current.recordStreamEvent('reconnect-scheduled');
          syncMonitoringState();
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            monitoringRef.current.recordStreamEvent('reconnect');
            syncMonitoringState();
            openStream();
          }, delay);
          backoff = Math.min(backoff * 2, STREAM_MAX_BACKOFF_MS);
        };
      } catch (err) {
        console.error('Failed to initialise source status stream:', err);
        monitoringRef.current.recordStreamEvent('error');
        monitoringRef.current.setStatus('reconnecting');
        syncMonitoringState();
        const retryDelay = Math.min(backoff, STREAM_MAX_BACKOFF_MS);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          monitoringRef.current.recordStreamEvent('reconnect');
          syncMonitoringState();
          openStream();
        }, retryDelay);
        backoff = Math.min(backoff * 2, STREAM_MAX_BACKOFF_MS);
      }
    };

    openStream();

    return () => {
      cancelled = true;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        monitoringRef.current.recordStreamEvent('close');
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      syncMonitoringState();
    };
  }, [applyMockData, applyPayload, syncMonitoringState]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return () => undefined;
    }
    const interval = window.setInterval(() => {
      if (!document.hidden) {
        fetchStatus(true);
      }
    }, refreshIntervalRef.current);
    return () => window.clearInterval(interval);
  }, [fetchStatus, lastUpdated]);

  const refreshHealth = useCallback(async () => {
    setIsRefreshing(true);
    await fetchStatus();
  }, [fetchStatus]);

  const performSourceCommand = useCallback(
    async (
      sourceId: string,
      endpointFactory: (id: string) => string,
      actionLabel: string,
    ) => {
      const trimmedId = sourceId.trim();
      if (!trimmedId) {
        setError('A valid source identifier is required to execute the requested action.');
        return;
      }

      if (!/^[a-zA-Z0-9._-]+$/.test(trimmedId)) {
        setError('Source identifiers may only include letters, numbers, period, underscore or hyphen.');
        return;
      }

      const encodedId = encodeURIComponent(trimmedId);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await apiCall(endpointFactory(encodedId), {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          setError(
            `${actionLabel} request failed with status code ${response.status}. Please check connector configuration.`,
          );
          return;
        }

        setError(null);
      } catch (err) {
        const { message } = describeError(err);
        setError(`${actionLabel} request failed: ${message}`);
      } finally {
        clearTimeout(timeoutId);
        fetchStatus(true);
      }
    },
    [fetchStatus],
  );

  const refreshSource = useCallback(
    async (sourceId: string) => {
      await performSourceCommand(sourceId, TEST_ENDPOINT, 'Source validation');
    },
    [performSourceCommand],
  );

  const triggerSourceTest = useCallback(
    async (sourceId: string) => {
      await performSourceCommand(sourceId, DIAGNOSTICS_ENDPOINT, 'Diagnostics');
    },
    [performSourceCommand],
  );

  const pauseMonitoring = useCallback(
    async (sourceId: string) => {
      await performSourceCommand(sourceId, PAUSE_ENDPOINT, 'Pause monitoring');
    },
    [performSourceCommand],
  );

  const resumeMonitoring = useCallback(
    async (sourceId: string) => {
      await performSourceCommand(sourceId, RESUME_ENDPOINT, 'Resume monitoring');
    },
    [performSourceCommand],
  );

  return useMemo(
    () => ({
      sourceHealth,
      loading,
      error,
      lastUpdated,
      refreshHealth,
      refreshSource,
      isRefreshing,
      metrics,
      isStreaming,
      triggerSourceTest,
      pauseMonitoring,
      resumeMonitoring,
      monitoring: monitoringSnapshot,
      connectionState,
      usingMockData,
    }),
    [
      sourceHealth,
      loading,
      error,
      lastUpdated,
      refreshHealth,
      refreshSource,
      isRefreshing,
      metrics,
      isStreaming,
      triggerSourceTest,
      pauseMonitoring,
      resumeMonitoring,
      monitoringSnapshot,
      connectionState,
      usingMockData,
    ],
  );
}
