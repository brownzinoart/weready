'use strict';

const isLocal = process.env.NETLIFY_DEV === 'true';
const DEFAULT_REMOTE_BASE = 'https://weready.dev';
const FALLBACK_LOCAL_BASE = 'http://localhost:8000';

const BACKEND_BASE_URL = (
  process.env.BACKEND_BASE_URL ||
  process.env.WEREADY_BACKEND_URL ||
  process.env.API_BASE_URL ||
  (isLocal ? FALLBACK_LOCAL_BASE : DEFAULT_REMOTE_BASE)
).replace(/\/$/, '');

const DEFAULT_TIMEOUT_MS = Number(process.env.SOURCES_PROXY_TIMEOUT ?? 15_000);
const RETRY_ATTEMPTS = Number(process.env.SOURCES_PROXY_RETRIES ?? 2);
const FAILURE_THRESHOLD = Number(process.env.SOURCES_PROXY_FAILURE_THRESHOLD ?? 5);
const CIRCUIT_BREAKER_DURATION_MS = Number(process.env.SOURCES_PROXY_COOLDOWN ?? 30_000);

const cacheStore = new Map();
const circuitBreaker = {
  failureCount: 0,
  openUntil: 0,
};

const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cacheHits: 0,
  upstreamLatencyMs: [],
  lastError: null,
  lastStatus: null,
  lastUpdated: null,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const now = () => Date.now();

const clampTimeout = (value) => (Number.isFinite(value) && value > 0 ? value : DEFAULT_TIMEOUT_MS);

const createCorsHeaders = (extra = {}) => ({
  'Access-Control-Allow-Origin': process.env.SOURCES_CORS_ALLOW_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  ...extra,
});

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
};

const buildBackendUrl = (path, searchParams = {}) => {
  const url = new URL(path, BACKEND_BASE_URL);
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    url.searchParams.set(key, value);
  });
  return url;
};

const isCircuitOpen = () => circuitBreaker.openUntil > now();

const recordFailure = () => {
  circuitBreaker.failureCount += 1;
  metrics.failedRequests += 1;
  metrics.lastUpdated = new Date().toISOString();
  if (circuitBreaker.failureCount >= FAILURE_THRESHOLD) {
    circuitBreaker.openUntil = now() + CIRCUIT_BREAKER_DURATION_MS;
    console.warn('[sources-proxy] Circuit breaker opened', {
      openUntil: new Date(circuitBreaker.openUntil).toISOString(),
      failureCount: circuitBreaker.failureCount,
    });
  }
};

const recordSuccess = (latencyMs) => {
  circuitBreaker.failureCount = 0;
  metrics.successfulRequests += 1;
  metrics.lastUpdated = new Date().toISOString();
  if (Number.isFinite(latencyMs)) {
    metrics.upstreamLatencyMs.push(latencyMs);
    if (metrics.upstreamLatencyMs.length > 50) {
      metrics.upstreamLatencyMs.shift();
    }
  }
};

const fetchWithTimeout = async (url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) => {
  const timeout = clampTimeout(timeoutMs);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const requestStartedAt = now();

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    const latency = now() - requestStartedAt;
    return { response, latency };
  } finally {
    clearTimeout(timer);
  }
};

const getCacheEntry = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= now()) {
    cacheStore.delete(key);
    return null;
  }
  metrics.cacheHits += 1;
  return entry.payload;
};

const setCacheEntry = (key, payload, ttlMs) => {
  if (!ttlMs || ttlMs <= 0) return;
  cacheStore.set(key, {
    payload,
    expiresAt: now() + ttlMs,
  });
};

const buildCacheKey = (method, path, searchParams = {}) => {
  const query = new URLSearchParams(searchParams).toString();
  return `${method}:${path}${query ? `?${query}` : ''}`;
};

const createMetricsSnapshot = () => {
  const latencies = metrics.upstreamLatencyMs.slice().sort((a, b) => a - b);
  const percentile = (p) => {
    if (latencies.length === 0) return null;
    const index = Math.min(latencies.length - 1, Math.floor((p / 100) * latencies.length));
    return latencies[index];
  };

  const averageLatency =
    latencies.length === 0
      ? null
      : Math.round(latencies.reduce((acc, value) => acc + value, 0) / latencies.length);

  return {
    ...metrics,
    totalRequests: metrics.totalRequests,
    averageLatencyMs: averageLatency,
    p95LatencyMs: percentile(95),
    circuitOpen: isCircuitOpen(),
    circuitResetAt: circuitBreaker.openUntil
      ? new Date(circuitBreaker.openUntil).toISOString()
      : null,
  };
};

const proxyJsonRequest = async (
  event,
  {
    path,
    method = 'GET',
    searchParams = {},
    body = null,
    allowedMethods = ['GET'],
    cacheTtlMs = 0,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    forwardHeaders = [],
  },
) => {
  if (!allowedMethods.includes(event.httpMethod)) {
    return {
      statusCode: 405,
      headers: createCorsHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: createCorsHeaders(),
      body: '',
    };
  }

  if (isCircuitOpen()) {
    metrics.lastError = 'Circuit breaker open';
    metrics.lastStatus = 503;
    return {
      statusCode: 503,
      headers: createCorsHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        error: 'Upstream service unavailable',
        message: 'Circuit breaker temporarily open to protect the backend service.',
        retryAfterSeconds: Math.ceil((circuitBreaker.openUntil - now()) / 1000),
      }),
    };
  }

  metrics.totalRequests += 1;

  const combinedSearchParams = {
    ...searchParams,
    ...(event.queryStringParameters || {}),
  };

  const cacheKey = buildCacheKey(method, path, combinedSearchParams);
  if (cacheTtlMs > 0) {
    const cached = getCacheEntry(cacheKey);
    if (cached) {
      return {
        statusCode: 200,
        headers: {
          ...createCorsHeaders({ 'Content-Type': 'application/json' }),
          'X-Proxy-Cache': 'HIT',
        },
        body: cached,
      };
    }
  }

  const backendUrl = buildBackendUrl(path, combinedSearchParams);

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  forwardHeaders.forEach((headerName) => {
    const incomingValue = event.headers?.[headerName.toLowerCase()];
    if (incomingValue) {
      headers[headerName] = incomingValue;
    }
  });

  let lastError;
  for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt += 1) {
    const attemptNumber = attempt + 1;
    try {
      const { response, latency } = await fetchWithTimeout(backendUrl, {
        method,
        headers,
        body,
      }, timeoutMs);

      metrics.lastStatus = response.status;

      if (!response.ok) {
        const errorPayload = await response.text();
        metrics.lastError = errorPayload;
        recordFailure();

        if (attempt === RETRY_ATTEMPTS) {
          return {
            statusCode: response.status,
            headers: createCorsHeaders({ 'Content-Type': 'application/json' }),
            body: errorPayload || JSON.stringify({ error: 'Upstream service error' }),
          };
        }

        const backoff = Math.min(500 * attemptNumber ** 2, 2_000);
        await sleep(backoff);
        continue;
      }

      const payload = await response.text();
      recordSuccess(latency);
      metrics.lastError = null;

      if (cacheTtlMs > 0) {
        setCacheEntry(cacheKey, payload, cacheTtlMs);
      }

      return {
        statusCode: response.status,
        headers: {
          ...createCorsHeaders({ 'Content-Type': response.headers.get('content-type') || 'application/json' }),
          'X-Proxy-Cache': cacheTtlMs > 0 ? 'MISS' : 'BYPASS',
          'X-Proxy-Upstream-Latency': latency,
        },
        body: payload,
      };
    } catch (error) {
      lastError = error;
      metrics.lastError = error.message;
      recordFailure();
      if (attempt === RETRY_ATTEMPTS) {
        return {
          statusCode: 504,
          headers: createCorsHeaders({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({
            error: 'Upstream timeout',
            message: error.message,
          }),
        };
      }
      const backoff = Math.min(500 * attemptNumber ** 2, 2_000);
      await sleep(backoff);
    }
  }

  return {
    statusCode: 500,
    headers: createCorsHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      error: 'Proxy error',
      message: lastError ? lastError.message : 'Unknown proxy failure',
    }),
  };
};

const getMetricsSnapshot = () => createMetricsSnapshot();

module.exports = {
  BACKEND_BASE_URL,
  createCorsHeaders,
  proxyJsonRequest,
  fetchWithTimeout,
  buildBackendUrl,
  getMetricsSnapshot,
  safeJsonParse,
  isCircuitOpen,
};
