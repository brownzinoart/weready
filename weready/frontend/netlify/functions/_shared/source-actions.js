'use strict';

const {
  proxyJsonRequest,
  createCorsHeaders,
  safeJsonParse,
} = require('./sources-proxy');

const IDENTIFIER_REGEX = /^[a-z0-9_.-]+$/i;

const sanitizeIdentifier = (value) =>
  typeof value === 'string' && IDENTIFIER_REGEX.test(value) ? value : null;

const extractSourceId = (event, additionalFields = []) => {
  const query = event.queryStringParameters || {};
  const candidates = ['id', 'sourceId', ...additionalFields];
  for (const field of candidates) {
    const sanitized = sanitizeIdentifier(query[field]);
    if (sanitized) {
      return sanitized;
    }
  }

  const body = event.body ? safeJsonParse(event.body) : null;
  if (body) {
    for (const field of candidates) {
      const sanitized = sanitizeIdentifier(body[field]);
      if (sanitized) {
        return sanitized;
      }
    }
  }

  return null;
};

const createSourceCommandHandler = ({
  name,
  backendPathBuilder,
  method = 'POST',
  allowedMethods = ['POST'],
  forwardHeaders = ['Authorization'],
}) => async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: createCorsHeaders({
        'Access-Control-Allow-Methods': `${allowedMethods.join(', ')}, OPTIONS`,
      }),
      body: '',
    };
  }

  if (!allowedMethods.includes(event.httpMethod)) {
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
        message: 'A valid sourceId is required to perform this operation.',
      }),
    };
  }

  console.log(`[${name}] Proxying source command`, { sourceId });

  const backendPath = backendPathBuilder(sourceId);

  return proxyJsonRequest(event, {
    path: backendPath,
    method,
    allowedMethods,
    forwardHeaders,
    cacheTtlMs: 0,
    body: event.body,
  });
};

module.exports = {
  createSourceCommandHandler,
  extractSourceId,
  sanitizeIdentifier,
};
