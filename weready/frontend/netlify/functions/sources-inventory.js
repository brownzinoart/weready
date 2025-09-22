'use strict';

const {
  proxyJsonRequest,
  createCorsHeaders,
} = require('./_shared/sources-proxy');

const INVENTORY_CACHE_TTL_MS = Number(process.env.SOURCES_INVENTORY_CACHE_TTL ?? 30_000);

const isSafeValue = (value) => /^[a-z0-9_.-]+$/i.test(value);

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: createCorsHeaders({ 'Access-Control-Allow-Methods': 'GET, OPTIONS' }),
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: createCorsHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const query = event.queryStringParameters || {};
  if (query.category && !isSafeValue(query.category)) {
    return {
      statusCode: 400,
      headers: createCorsHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        error: 'Invalid category filter',
        message: 'Category filters may only include letters, numbers, period, underscore or hyphen.',
      }),
    };
  }

  const cacheTtlMs = query.cache === 'bypass' ? 0 : INVENTORY_CACHE_TTL_MS;

  console.log('[sources-inventory] Proxy request', {
    cacheTtlMs,
    query,
  });

  return proxyJsonRequest(event, {
    path: '/api/sources/inventory',
    method: 'GET',
    cacheTtlMs,
    allowedMethods: ['GET'],
    forwardHeaders: ['Authorization'],
  });
};
