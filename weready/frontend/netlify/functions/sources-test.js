'use strict';

const {
  proxyJsonRequest,
  createCorsHeaders,
  safeJsonParse,
} = require('./_shared/sources-proxy');

const isSafeIdentifier = (value) => /^[a-z0-9_.-]+$/i.test(value);

const extractSourceId = (event) => {
  const query = event.queryStringParameters || {};
  if (query.id && isSafeIdentifier(query.id)) {
    return query.id;
  }
  if (query.sourceId && isSafeIdentifier(query.sourceId)) {
    return query.sourceId;
  }

  const body = event.body ? safeJsonParse(event.body) : null;
  if (body && typeof body.sourceId === 'string' && isSafeIdentifier(body.sourceId)) {
    return body.sourceId;
  }

  return null;
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: createCorsHeaders({ 'Access-Control-Allow-Methods': 'POST, OPTIONS' }),
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: createCorsHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const sourceId = extractSourceId(event);
  if (!sourceId) {
    return {
      statusCode: 400,
      headers: createCorsHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        error: 'Invalid source identifier',
        message: 'A valid sourceId is required to execute the test operation.',
      }),
    };
  }

  console.log('[sources-test] Executing source test', { sourceId });

  const endpoint = `/api/sources/${encodeURIComponent(sourceId)}/test`;

  return proxyJsonRequest(event, {
    path: endpoint,
    method: 'POST',
    allowedMethods: ['POST'],
    cacheTtlMs: 0,
    forwardHeaders: ['Authorization'],
    body: event.body,
  });
};
