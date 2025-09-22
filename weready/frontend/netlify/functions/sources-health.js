'use strict';

const {
  proxyJsonRequest,
  createCorsHeaders,
  getMetricsSnapshot,
} = require('./_shared/sources-proxy');

const HEALTH_CACHE_TTL_MS = Number(process.env.SOURCES_HEALTH_CACHE_TTL ?? 15_000);
const HEALTH_TIMEOUT_MS = Number(process.env.SOURCES_HEALTH_TIMEOUT ?? 12_000);

const sanitizeBooleanFlag = (value) => value === '1' || value === 'true';

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: createCorsHeaders({ 'Access-Control-Allow-Methods': 'GET, OPTIONS' }),
      body: '',
    };
  }

  const query = event.queryStringParameters || {};

  if (sanitizeBooleanFlag(query.metrics)) {
    return {
      statusCode: 200,
      headers: createCorsHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        metrics: getMetricsSnapshot(),
      }),
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: createCorsHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const bypassCache = sanitizeBooleanFlag(query.bypassCache);
  const cacheTtlMs = bypassCache ? 0 : HEALTH_CACHE_TTL_MS;

  console.log('[sources-health] Proxying request', {
    path: event.path,
    cacheTtlMs,
    bypassCache,
    trace: query.trace || null,
  });

  return proxyJsonRequest(event, {
    path: '/api/sources/health',
    method: 'GET',
    cacheTtlMs,
    timeoutMs: HEALTH_TIMEOUT_MS,
    allowedMethods: ['GET'],
    forwardHeaders: ['Authorization'],
  });
};
