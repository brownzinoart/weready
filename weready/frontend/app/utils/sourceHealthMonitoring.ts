import type {
  SourceConnectionState,
  SourceConnectionStatus,
  SourceMonitoringSnapshot,
  SourcePerformanceSnapshot,
} from '../types/sources';

interface MonitoringTracker {
  getSnapshot: () => SourceMonitoringSnapshot;
  resetRetries: () => void;
  incrementRetries: () => void;
  setUsingMockData: (usingMockData: boolean) => void;
  setStatus: (status: SourceConnectionStatus) => void;
  recordSuccess: (latencyMs: number, endpoint: string) => void;
  recordFailure: (
    latencyMs: number,
    endpoint: string,
    message: string,
    status?: number,
    timeout?: boolean,
  ) => void;
  recordRecovery: (context: 'fetch' | 'stream') => void;
  recordFallback: (reason: string) => void;
  recordStreamEvent: (event: string) => void;
}

const MAX_LATENCY_SAMPLES = 60;

const cloneState = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const buildInitialConnectionState = (): SourceConnectionState => ({
  status: 'initializing',
  usingMockData: false,
  consecutiveFailures: 0,
  lastSuccessAt: undefined,
  lastFailureAt: undefined,
  lastError: null,
  lastLatencyMs: undefined,
  streamConnected: false,
  reconnectScheduledAt: undefined,
  reconnectAttempts: 0,
});

const buildInitialPerformanceSnapshot = (): SourcePerformanceSnapshot => ({
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  timeoutCount: 0,
  averageLatencyMs: null,
  p95LatencyMs: null,
  lastRequestAt: undefined,
  lastFailureReason: null,
  streamEventCount: 0,
  streamReconnects: 0,
  lastHeartbeatAt: undefined,
});

const computeAverageLatency = (samples: number[]): number | null => {
  if (samples.length === 0) return null;
  const sum = samples.reduce((acc, value) => acc + value, 0);
  return Math.round(sum / samples.length);
};

const computePercentile = (samples: number[], percentile: number): number | null => {
  if (samples.length === 0) return null;
  const sorted = [...samples].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.floor((percentile / 100) * sorted.length),
  );
  return sorted[index];
};

const updateLatencySamples = (samples: number[], value: number) => {
  if (!Number.isFinite(value)) return;
  samples.push(value);
  if (samples.length > MAX_LATENCY_SAMPLES) {
    samples.shift();
  }
};

export const createSourceMonitoringTracker = (): MonitoringTracker => {
  const connection: SourceConnectionState = buildInitialConnectionState();
  const performance: SourcePerformanceSnapshot = buildInitialPerformanceSnapshot();
  const latencySamples: number[] = [];

  const getCurrentSnapshot = (): SourceMonitoringSnapshot => ({
    connection: cloneState(connection),
    performance: {
      ...cloneState(performance),
      averageLatencyMs: computeAverageLatency(latencySamples),
      p95LatencyMs: computePercentile(latencySamples, 95),
      totalRequests: performance.successfulRequests + performance.failedRequests,
    },
  });

  const ensureStatus = (status: SourceConnectionStatus) => {
    connection.status = status;
  };

  const recordSuccess = (latencyMs: number) => {
    performance.successfulRequests += 1;
    performance.lastRequestAt = new Date().toISOString();
    connection.lastSuccessAt = performance.lastRequestAt;
    connection.lastLatencyMs = latencyMs;
    connection.lastError = null;
    updateLatencySamples(latencySamples, latencyMs);
  };

  const recordFailureInternal = (latencyMs: number, message: string, timeout?: boolean) => {
    performance.failedRequests += 1;
    performance.lastFailureReason = message;
    performance.lastRequestAt = new Date().toISOString();
    connection.lastFailureAt = performance.lastRequestAt;
    connection.lastError = message;
    connection.lastLatencyMs = latencyMs;
    if (timeout) {
      performance.timeoutCount += 1;
    }
    updateLatencySamples(latencySamples, latencyMs);
  };

  return {
    getSnapshot: getCurrentSnapshot,
    resetRetries: () => {
      connection.consecutiveFailures = 0;
      connection.reconnectAttempts = 0;
    },
    incrementRetries: () => {
      connection.consecutiveFailures += 1;
      connection.reconnectAttempts += 1;
    },
    setUsingMockData: (usingMockData: boolean) => {
      connection.usingMockData = usingMockData;
    },
    setStatus: (status: SourceConnectionStatus) => {
      ensureStatus(status);
      if (status === 'offline') {
        connection.streamConnected = false;
      }
    },
    recordSuccess: (latencyMs: number) => {
      recordSuccess(latencyMs);
      ensureStatus('connected');
      connection.usingMockData = false;
    },
    recordFailure: (
      latencyMs: number,
      _endpoint: string,
      message: string,
      _status?: number,
      timeout?: boolean,
    ) => {
      recordFailureInternal(latencyMs, message, timeout);
    },
    recordRecovery: (context: 'fetch' | 'stream') => {
      const timestamp = new Date().toISOString();
      connection.lastSuccessAt = timestamp;
      connection.lastError = null;
      connection.consecutiveFailures = 0;
      if (context === 'stream') {
        connection.streamConnected = true;
        performance.lastHeartbeatAt = timestamp;
      }
      connection.usingMockData = false;
    },
    recordFallback: (reason: string) => {
      connection.usingMockData = true;
      connection.lastError = reason;
      performance.lastFailureReason = reason;
    },
    recordStreamEvent: (event: string) => {
      performance.streamEventCount += 1;
      const timestamp = new Date().toISOString();
      switch (event) {
        case 'open':
          connection.streamConnected = true;
          connection.reconnectAttempts = 0;
          connection.lastError = null;
          ensureStatus('connected');
          break;
        case 'message':
          performance.lastHeartbeatAt = timestamp;
          break;
        case 'error':
          connection.streamConnected = false;
          connection.lastError = 'Stream connection error';
          ensureStatus('reconnecting');
          break;
        case 'close':
          connection.streamConnected = false;
          ensureStatus('offline');
          break;
        case 'reconnect':
          performance.streamReconnects += 1;
          connection.reconnectAttempts += 1;
          connection.reconnectScheduledAt = timestamp;
          ensureStatus('reconnecting');
          break;
        case 'reconnect-scheduled':
          connection.reconnectScheduledAt = timestamp;
          break;
        case 'parse-error':
          connection.lastError = 'Failed to parse stream payload';
          break;
        case 'open-attempt':
          ensureStatus('connecting');
          break;
        default:
          break;
      }
    },
  };
};

export type { MonitoringTracker };
