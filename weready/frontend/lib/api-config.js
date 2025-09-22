/**
 * API Configuration and diagnostics helpers for the WeReady frontend.
 * Provides resilient fetch wrappers, retry policies, and developer tooling
 * to keep the Bailey Intelligence surface responsive even when the backend
 * is slow or unavailable.
 */

const DEFAULT_BACKEND_PORT = 8000;
const FALLBACK_BASE_URL = process.env.NEXT_PUBLIC_API_FALLBACK_URL || `http://localhost:${DEFAULT_BACKEND_PORT}`;
const DEFAULT_TIMEOUT_MS = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT_MS || '10000', 10);
const DEFAULT_RETRY_ATTEMPTS = parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS || '2', 10);
const DEFAULT_RETRY_BACKOFF_MS = parseInt(process.env.NEXT_PUBLIC_API_RETRY_BACKOFF_MS || '300', 10);
const MAX_RETRY_BACKOFF_MS = parseInt(process.env.NEXT_PUBLIC_API_RETRY_MAX_BACKOFF_MS || '2000', 10);
const API_HEALTH_ENDPOINT = '/health';

const isBrowser = typeof window !== 'undefined';

// Detect environment
const isProduction = () => {
  if (!isBrowser) {
    return process.env.NODE_ENV === 'production';
  }
  return window.location.hostname === 'weready.dev' || window.location.hostname.includes('netlify.app');
};

const DEBUG_ENABLED = (() => {
  if (process.env.NEXT_PUBLIC_API_DEBUG === 'true') return true;
  if (process.env.NEXT_PUBLIC_API_DEBUG === 'false') return false;
  return !isProduction();
})();

const logDebug = (message, context = {}) => {
  if (!DEBUG_ENABLED) return;
  // eslint-disable-next-line no-console
  console.debug(`[API] ${message}`, context);
};

const parsePortFromUrl = (maybeUrl) => {
  try {
    const parsed = new URL(maybeUrl);
    if (parsed.port) return parseInt(parsed.port, 10);
    return parsed.protocol === 'https:' ? 443 : 80;
  } catch (error) {
    logDebug('Unable to parse port from URL', { maybeUrl, error: error?.message });
    return undefined;
  }
};

const getExpectedBackendPort = () => {
  const configuredPort = parseInt(process.env.NEXT_PUBLIC_BACKEND_PORT || `${DEFAULT_BACKEND_PORT}`, 10);
  return Number.isNaN(configuredPort) ? DEFAULT_BACKEND_PORT : configuredPort;
};

const API_CONFIG = {
  development: {
    baseUrl: `http://localhost:${getExpectedBackendPort()}`,
    functions: `http://localhost:${getExpectedBackendPort()}`,
  },
  production: {
    baseUrl: '',
    functions: '/.netlify/functions',
  },
};

const getApiConfig = () => (isProduction() ? API_CONFIG.production : API_CONFIG.development);

const ENDPOINT_MAPPING = {
  '/health': '/health',
  '/bailey/semantic-query': '/bailey-semantic-query',
  '/semantic-search': '/semantic-search-engine',
  '/github/trending-intelligence': '/github-trending-intelligence',
  '/github/repository-analysis': '/github-repository-analysis',
  '/api/demo/dashboard': '/demo-dashboard',
  '/api/demo/portfolio': '/demo-portfolio',
  '/api/demo/portfolio/project': '/demo-portfolio-project',
  '/api/auth/me': '/auth-me',
  '/api/auth/github': '/auth-github',
  '/api/auth/logout': '/auth-logout',
  '/api/auth/refresh': '/auth-refresh',
  '/api/auth/password-strength': '/auth-password-strength',
  '/api/auth/signup': '/auth-signup',
  '/api/auth/login': '/auth-login',
  '/api/auth/github/repos': '/auth-github-repos',
  '/api/auth/github/link-repo': '/auth-github-link-repo',
  '/api/analyze/free': '/analyze-free',
  '/api/user/analyses/summary': '/user-analyses-summary',
  '/api/user/analyses/history': '/user-analyses-history',
  '/evidence/hallucination_detection': '/evidence-hallucination-detection',
  '/methodology': '/methodology',
  '/trending/github': '/trending-github',
  '/market-timing/report': '/market-timing-report',
  '/market-timing/recommendation': '/market-timing-recommendation',
  '/api/sources/health': '/sources-health',
  '/api/sources/status/stream': '/sources-status-stream',
  '/api/sources/inventory': '/sources-inventory',
  '/api/sources/coverage': '/sources-coverage',
  '/api/sources/gaps': '/sources-gaps',
  '/api/sources/{id}/test': '/sources-test',
  '/api/sources/{id}/diagnostics': '/sources-diagnostics',
  '/api/sources/{id}/pause': '/sources-pause',
  '/api/sources/{id}/resume': '/sources-resume',
  '/api/sources/{id}/history': '/sources-history',
  '/api/sources/contradictions': '/sources-contradictions',
  '/api/sources/dependencies': '/sources-dependencies',
};

const escapeRegexSegment = (segment) => segment.replace(/[-\\/^$*+?.()|[\]{}]/g, '\\$&');

const resolveDynamicFunctionMapping = (endpoint) => {
  for (const [pattern, functionPath] of Object.entries(ENDPOINT_MAPPING)) {
    if (!pattern.includes('{')) continue;

    const paramNames = [];
    let regexPattern = '';
    let cursor = 0;
    const placeholderRegex = /\{([^}]+)\}/g;
    let match;

    while ((match = placeholderRegex.exec(pattern)) !== null) {
      const [placeholder, paramName] = match;
      regexPattern += escapeRegexSegment(pattern.slice(cursor, match.index));
      regexPattern += '([^/]+)';
      paramNames.push(paramName);
      cursor = match.index + placeholder.length;
    }
    regexPattern += escapeRegexSegment(pattern.slice(cursor));

    const regex = new RegExp(`^${regexPattern}$`);
    const matches = endpoint.match(regex);
    if (!matches) continue;

    const params = {};
    paramNames.forEach((name, index) => {
      params[name] = matches[index + 1];
    });

    return { functionPath, params };
  }
  return null;
};

const validateEndpoint = (endpoint) => {
  if (typeof endpoint !== 'string' || endpoint.length === 0) {
    throw new Error('Endpoint must be a non-empty string');
  }
  if (!endpoint.startsWith('/')) {
    throw new Error(`Endpoint must start with '/' (received ${endpoint})`);
  }
};

const buildUrlWithParams = (baseUrl, endpoint, params = {}) => {
  const url = `${baseUrl}${endpoint}`;
  if (!params || Object.keys(params).length === 0) {
    return url;
  }
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => query.append(key, String(item)));
    } else {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `${url}?${queryString}` : url;
};

const resolveCandidateUrls = (endpoint, params, useFallback) => {
  const primaryUrl = getApiUrl(endpoint, params);
  const candidates = [primaryUrl];

  if (!isProduction() && useFallback && FALLBACK_BASE_URL) {
    const fallbackUrl = buildUrlWithParams(FALLBACK_BASE_URL, endpoint, params);
    if (fallbackUrl && !candidates.includes(fallbackUrl)) {
      candidates.push(fallbackUrl);
    }
  }

  return candidates;
};

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

const DEFAULT_RETRY_CONFIG = {
  attempts: DEFAULT_RETRY_ATTEMPTS,
  backoffMs: DEFAULT_RETRY_BACKOFF_MS,
  maxBackoffMs: MAX_RETRY_BACKOFF_MS,
  jitter: true,
};

export class EnhancedApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'EnhancedApiError';
    Object.assign(this, details);
  }
}

const ERROR_TYPES = {
  TIMEOUT: 'timeout',
  NETWORK: 'network',
  ABORT: 'abort',
  HTTP: 'http',
  PARSE: 'parse',
  UNKNOWN: 'unknown',
};

const classifyError = (error) => {
  if (!error) return ERROR_TYPES.UNKNOWN;
  if (error.name === 'TimeoutError') return ERROR_TYPES.TIMEOUT;
  if (error.name === 'AbortError') return ERROR_TYPES.ABORT;
  if (error instanceof TypeError && error.message?.includes('fetch')) return ERROR_TYPES.NETWORK;
  if (typeof error.status === 'number') return ERROR_TYPES.HTTP;
  if (error.name === 'SyntaxError') return ERROR_TYPES.PARSE;
  return ERROR_TYPES.UNKNOWN;
};

const apiPerformance = {
  lastSample: null,
  samples: [],
  maxSamples: 50,
};

const apiDiagnosticsState = {
  inFlight: 0,
  recentFailures: [],
  historyLimit: 20,
  lastFailure: null,
};

const recordPerformance = (endpoint, durationMs, status) => {
  const sample = {
    endpoint,
    durationMs,
    status,
    timestamp: Date.now(),
  };
  apiPerformance.lastSample = sample;
  apiPerformance.samples.push(sample);
  if (apiPerformance.samples.length > apiPerformance.maxSamples) {
    apiPerformance.samples.shift();
  }
};

const recordApiFailure = (endpoint, url, error, attempt, attempts) => {
  const failure = {
    endpoint,
    url,
    error: error?.message,
    type: error?.type || classifyError(error),
    attempt,
    attempts,
    timestamp: Date.now(),
  };
  apiDiagnosticsState.lastFailure = failure;
  apiDiagnosticsState.recentFailures.push(failure);
  if (apiDiagnosticsState.recentFailures.length > apiDiagnosticsState.historyLimit) {
    apiDiagnosticsState.recentFailures.shift();
  }
};

const recordApiSuccess = (endpoint, url, status, durationMs) => {
  recordPerformance(endpoint, durationMs, status);
  logDebug('API request succeeded', { endpoint, url, status, durationMs });
};

const getBackoffDelay = (retryConfig, attempt) => {
  const base = parseInt(retryConfig?.backoffMs ?? DEFAULT_RETRY_CONFIG.backoffMs, 10);
  const max = parseInt(retryConfig?.maxBackoffMs ?? DEFAULT_RETRY_CONFIG.maxBackoffMs, 10);
  const jitterEnabled = retryConfig?.jitter ?? DEFAULT_RETRY_CONFIG.jitter;
  const exponential = base * (2 ** Math.max(0, attempt - 1));
  const jitter = jitterEnabled ? Math.random() * 100 : 0;
  return Math.min(exponential + jitter, max);
};

const sleep = (durationMs) => new Promise((resolve) => {
  setTimeout(resolve, durationMs);
});

const DEFAULT_FETCH_BEHAVIOUR = {
  cache: 'no-store',
  keepalive: true,
};

const fetchWithTimeout = async (url, fetchOptions, timeoutMs, externalSignal) => {
  const controller = new AbortController();
  let timeoutId;
  const options = { ...DEFAULT_FETCH_BEHAVIOUR, ...fetchOptions, signal: controller.signal };

  const abortFromExternal = () => controller.abort(externalSignal.reason);

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener('abort', abortFromExternal, { once: true });
    }
  }

  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (controller.signal.aborted) {
      const timeoutError = new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
      timeoutError.name = 'TimeoutError';
      timeoutError.cause = error;
      throw timeoutError;
    }
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', abortFromExternal);
    }
  }
};

export const getApiUrl = (endpoint, params = {}) => {
  validateEndpoint(endpoint);
  const config = getApiConfig();
  logDebug('Resolving API URL', {
    endpoint,
    params,
    environment: isProduction() ? 'production' : 'development',
  });

  if (isProduction()) {
    let functionName = ENDPOINT_MAPPING[endpoint];
    let dynamicParams = {};

    if (!functionName) {
      const dynamicMapping = resolveDynamicFunctionMapping(endpoint);
      if (dynamicMapping) {
        functionName = dynamicMapping.functionPath;
        dynamicParams = dynamicMapping.params;
      }
    }

    if (!functionName) {
      console.warn(`No serverless function mapping found for endpoint: ${endpoint}`);
      return `${config.functions}${endpoint}`;
    }

    let url = `${config.functions}${functionName}`;
    const queryParams = new URLSearchParams();
    const hasFunctionPlaceholders = /\{[^}]+\}/.test(functionName);

    if (Object.keys(dynamicParams).length > 0) {
      if (hasFunctionPlaceholders) {
        url = Object.entries(dynamicParams).reduce(
          (currentUrl, [name, value]) => currentUrl.replace(`{${name}}`, encodeURIComponent(value)),
          url,
        );
      } else {
        Object.entries(dynamicParams).forEach(([key, value]) => {
          queryParams.set(key, String(value));
        });
      }
    }

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      queryParams.set(key, String(value));
    });

    if (Array.from(queryParams.keys()).length > 0) {
      const queryString = queryParams.toString();
      const resolvedUrl = `${url}?${queryString}`;
      logDebug('Resolved production API URL', { endpoint, resolvedUrl });
      return resolvedUrl;
    }

    logDebug('Resolved production API URL', { endpoint, resolvedUrl: url });
    return url;
  }

  const url = `${config.baseUrl}${endpoint}`;
  if (Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString();
    const resolvedUrl = `${url}?${queryString}`;
    logDebug('Resolved development API URL', { endpoint, resolvedUrl });
    return resolvedUrl;
  }

  logDebug('Resolved development API URL', { endpoint, resolvedUrl: url });
  return url;
};

export const apiCall = async (endpoint, options = {}, params = {}) => {
  validateEndpoint(endpoint);
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retry = DEFAULT_RETRY_CONFIG,
    useFallback = true,
    signal,
    skipDiagnostics = false,
    connectionLabel,
    headers: customHeaders,
    expectJson = false,
    responseValidator,
    onAttempt,
    onRetry,
    ...fetchOptions
  } = options;

  const headers = {
    'Content-Type': 'application/json',
    ...(customHeaders || {}),
  };

  const urlsToTry = resolveCandidateUrls(endpoint, params, useFallback);
  const attempts = Math.max(0, parseInt(retry?.attempts ?? DEFAULT_RETRY_CONFIG.attempts, 10)) + 1;
  let lastError;

  for (const url of urlsToTry) {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const attemptContext = { endpoint, url, attempt, attempts, connectionLabel, timeoutMs };
      try {
        if (typeof onAttempt === 'function') {
          onAttempt(attemptContext);
        }
        apiDiagnosticsState.inFlight += 1;
        const startedAt = now();
        logDebug('API request dispatch', attemptContext);
        const response = await fetchWithTimeout(
          url,
          {
            ...fetchOptions,
            headers,
          },
          timeoutMs,
          signal,
        );
        const duration = now() - startedAt;

        if (!skipDiagnostics) {
          recordApiSuccess(endpoint, url, response.status, duration);
        }

        if (expectJson) {
          await response.clone().json();
        }

        if (typeof responseValidator === 'function') {
          await responseValidator(response.clone());
        }

        return response;
      } catch (error) {
        const enhancedError = error instanceof EnhancedApiError
          ? error
          : new EnhancedApiError(error?.message || `API request to ${endpoint} failed`, {
              endpoint,
              url,
              attempt,
              attempts,
              connectionLabel,
              type: classifyError(error),
              cause: error,
            });
        lastError = enhancedError;
        recordApiFailure(endpoint, url, enhancedError, attempt, attempts);
        logDebug('API request failure', {
          endpoint,
          url,
          attempt,
          attempts,
          connectionLabel,
          error: enhancedError?.message,
          type: enhancedError?.type,
        });

        const shouldRetry = attempt < attempts;
        if (!shouldRetry) {
          break;
        }

        const backoffDelay = getBackoffDelay(retry, attempt);
        if (typeof onRetry === 'function') {
          onRetry({ endpoint, url, attempt, attempts, delayMs: backoffDelay, error: enhancedError });
        }
        await sleep(backoffDelay);
      } finally {
        if (apiDiagnosticsState.inFlight > 0) {
          apiDiagnosticsState.inFlight -= 1;
        }
      }
    }
  }

  logDebug('API request exhausted retries', {
    endpoint,
    attempts: attempts * urlsToTry.length,
    lastError: lastError?.message,
  });
  throw lastError || new EnhancedApiError(`API call to ${endpoint} failed`, { endpoint, attempts });
};

export const getApiPerformanceMetrics = () => ({
  lastSample: apiPerformance.lastSample,
  recentSamples: [...apiPerformance.samples],
  debug: DEBUG_ENABLED,
  timeoutMs: DEFAULT_TIMEOUT_MS,
  retry: { ...DEFAULT_RETRY_CONFIG },
});

export const getApiDiagnostics = () => ({
  inFlight: apiDiagnosticsState.inFlight,
  recentFailures: [...apiDiagnosticsState.recentFailures],
  lastFailure: apiDiagnosticsState.lastFailure,
  fallbackBaseUrl: FALLBACK_BASE_URL,
});

const validateApiEnvironment = () => {
  const environment = isProduction() ? 'production' : 'development';
  const config = getApiConfig();
  const configuredPort = getExpectedBackendPort();
  const detectedPort = config.baseUrl ? parsePortFromUrl(config.baseUrl) : configuredPort;
  const fallbackConfigured = Boolean(process.env.NEXT_PUBLIC_API_FALLBACK_URL);

  return {
    environment,
    configuredPort,
    detectedPort,
    portMatches: detectedPort === undefined || detectedPort === configuredPort,
    fallbackConfigured,
    fallbackBaseUrl: fallbackConfigured ? process.env.NEXT_PUBLIC_API_FALLBACK_URL : undefined,
  };
};

export const validateApiConfiguration = () => validateApiEnvironment();

export const getApiMonitoringConfig = () => ({
  timeoutMs: DEFAULT_TIMEOUT_MS,
  retry: { ...DEFAULT_RETRY_CONFIG },
  diagnostics: validateApiEnvironment(),
  debug: DEBUG_ENABLED,
  healthEndpoint: API_HEALTH_ENDPOINT,
  fallbackBaseUrl: FALLBACK_BASE_URL,
});

export const checkApiHealth = async (params = {}, options = {}) => {
  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    retryAttempts = 0,
    useFallback = true,
    endpoint = API_HEALTH_ENDPOINT,
  } = options;

  const startedAt = now();

  try {
    const response = await apiCall(
      endpoint,
      {
        method: 'GET',
        timeoutMs,
        retry: { attempts: retryAttempts, backoffMs: 0, maxBackoffMs: 0, jitter: false },
        useFallback,
        skipDiagnostics: true,
      },
      params,
    );
    const duration = now() - startedAt;
    const data = await response.clone().json().catch(() => null);

    return {
      ok: response.ok,
      status: response.status,
      duration,
      data,
      diagnostics: validateApiEnvironment(),
      endpoint,
    };
  } catch (error) {
    const duration = now() - startedAt;
    return {
      ok: false,
      status: undefined,
      duration,
      error: error?.message || 'Unknown API health error',
      errorType: classifyError(error),
      diagnostics: validateApiEnvironment(),
      endpoint,
    };
  }
};

export const HEALTH_ENDPOINT = API_HEALTH_ENDPOINT;
export const API_DEBUG_ENABLED = DEBUG_ENABLED;
export const isProdEnv = isProduction;
export const getConfig = getApiConfig;
export const classifyApiError = classifyError;
