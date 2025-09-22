'use strict';

const {
  createCorsHeaders,
  buildBackendUrl,
} = require('./_shared/sources-proxy');

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
  const keepAliveMs = Number(process.env.SOURCES_STREAM_KEEPALIVE_MS ?? 120_000);
  const backendUrl = buildBackendUrl('/api/sources/status/stream', query);

  console.log('[sources-status-stream] Establishing upstream SSE connection', {
    url: backendUrl.toString(),
    keepAliveMs,
    trace: query.trace || null,
  });

  const abortController = new AbortController();
  let keepAliveTimer;

  const resetKeepAlive = () => {
    if (!keepAliveMs || keepAliveMs <= 0) return;
    if (keepAliveTimer) {
      clearTimeout(keepAliveTimer);
    }
    keepAliveTimer = setTimeout(() => {
      console.warn('[sources-status-stream] SSE keep-alive timeout reached, aborting upstream request');
      abortController.abort();
    }, keepAliveMs);
  };

  try {
    const upstreamResponse = await fetch(backendUrl, {
      headers: {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        ...(event.headers?.authorization
          ? { Authorization: event.headers.authorization }
          : {}),
      },
      signal: abortController.signal,
    });

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      const errorBody = await upstreamResponse.text();
      console.error('[sources-status-stream] Upstream rejected SSE connection', {
        status: upstreamResponse.status,
        errorBody,
      });
      return {
        statusCode: upstreamResponse.status,
        headers: createCorsHeaders({ 'Content-Type': 'application/json' }),
        body: errorBody || JSON.stringify({ error: 'Unable to establish upstream SSE connection' }),
      };
    }

    resetKeepAlive();

    const passthroughHeaders = new Headers({
      ...createCorsHeaders({ 'Access-Control-Allow-Methods': 'GET' }),
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const stream = new ReadableStream({
      start(controller) {
        const reader = upstreamResponse.body.getReader();
        const pump = () =>
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close();
              return;
            }
            resetKeepAlive();
            controller.enqueue(value);
            pump();
          });

        pump().catch((error) => {
          console.error('[sources-status-stream] SSE stream pump failed', error);
          controller.error(error);
        });
      },
      cancel(reason) {
        console.warn('[sources-status-stream] Client cancelled SSE stream', reason);
        abortController.abort();
      },
    });

    return new Response(stream, {
      status: 200,
      headers: passthroughHeaders,
    });
  } catch (error) {
    console.error('[sources-status-stream] Failed to proxy SSE stream', error);
    return {
      statusCode: abortController.signal.aborted ? 504 : 502,
      headers: createCorsHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        error: 'SSE proxy failure',
        message: error.message,
        aborted: abortController.signal.aborted,
      }),
    };
  } finally {
    if (keepAliveTimer) {
      clearTimeout(keepAliveTimer);
    }
  }
};
