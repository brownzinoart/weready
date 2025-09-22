# Bailey Intelligence Live Sources Troubleshooting

This guide documents how to diagnose and resolve problems with the Bailey Intelligence live source telemetry stack across local development, preview deployments, and production. It complements the architectural overview in `docs/architecture/bailey_intelligence.md`.

---

## 1. Quick Reference Checklist

| Symptom | Probable Cause | Immediate Action |
| --- | --- | --- |
| Bailey Intelligence page shows "mock" telemetry badge | Frontend cannot reach `/api/sources/health` | Check Netlify function logs and backend API availability |
| Connection status stuck on "Reconnecting…" | SSE stream proxy disrupted | Inspect `/.netlify/functions/sources-status-stream` logs and ensure backend `/api/sources/status/stream` responds |
| Manual refresh returns 5xx | Backend `SourceInventoryService` exception or timeout | Review FastAPI logs (`app/api/sources.py`) and system metrics |
| Source actions (test/diagnostics/pause/resume) fail with 422 | Invalid source identifier passed from UI | Confirm `source_id` matches `[a-z0-9_.-]+` and is present in inventory |
| Production only: calls still hitting mock data | Serverless routing missing or cached mapping outdated | Redeploy frontend after verifying `frontend/lib/api-config.js` mappings |

---

## 2. Health & Monitoring Endpoints

| Endpoint | Description | Notes |
| --- | --- | --- |
| `GET /api/sources/health` | Aggregated snapshot (JSON) | Supports `?force=true` to bypass cache. Response includes `X-Bailey-Health-Latency` and `X-Bailey-Health-Cache` headers. |
| `GET /api/sources/status/stream` | Server-Sent Events stream | Provides real-time updates. Netlify function proxy is `/.netlify/functions/sources-status-stream`. |
| `GET /api/sources/metrics/runtime` | Lightweight runtime counters | Mirrors module-level telemetry exposed in `app/api/sources.py`. Useful for Prometheus scraping or smoke tests. |
| `GET /.netlify/functions/sources-health?metrics=true` | Netlify diagnostics | Returns proxy cache stats, latency, and circuit breaker status (requires production function). |

Recommended cURL commands:

```bash
# Validate primary snapshot
curl -i http://localhost:8000/api/sources/health

# Bypass cache to force regeneration
curl -i "http://localhost:8000/api/sources/health?force=true"

# Stream a single event (Ctrl+C afterwards)
curl -N http://localhost:8000/api/sources/status/stream | head

# Inspect runtime counters
curl http://localhost:8000/api/sources/metrics/runtime | jq
```

---

## 3. Environment & Configuration

| Component | Key Settings | Location |
| --- | --- | --- |
| FastAPI backend | `BAILEY_SOURCES_HEALTH_CONCURRENCY` (semaphore size) | Backend deployment environment |
| Netlify functions | `SOURCES_HEALTH_CACHE_TTL`, `SOURCES_PROXY_TIMEOUT`, `SOURCES_CORS_ALLOW_ORIGIN`, `BACKEND_BASE_URL` | Netlify dashboard → Site configuration |
| Frontend API routing | `ENDPOINT_MAPPING` for `/api/sources/*` entries | `frontend/lib/api-config.js` |
| Frontend monitoring | Connection status + performance cards sourced from `useSourceHealth` hook | `frontend/app/components/SourceHealthDiagnostics.tsx` |
| Testing | Integration tests exercise endpoints directly | `backend/test_sources_integration.py` |

> **Tip:** In local development the Netlify functions proxy defaults to `http://localhost:8000`; no additional setup is required beyond running `uvicorn`.

---

## 4. Monitoring & Logs

### Backend (FastAPI)
- Structured logging introduced in `app/api/sources.py` writes entries for snapshot generation, SSE lifecycle, and source control actions.
- Search for `"Source test executed"`, `"Source health stream connected"`, or `"Failed to build source health snapshot"` in server logs.
- Runtime counters from `/api/sources/metrics/runtime` help identify cache hit rates and stream churn.

### Netlify Functions
- Each proxy logs request metadata (`path`, `cacheTtlMs`, latency) and circuit breaker state.
- Netlify dashboard → **Functions** provides invocation history; filter by `sources-health`, `sources-status-stream`, etc.
- Circuit breaker returns HTTP 503 with JSON body including `retryAfterSeconds`.

### Frontend Diagnostics
- `SourceHealthDiagnostics` component surfaces connection state, latency averages, timeout counts, and high-risk connectors directly in the UI.
- The manual "Refresh Telemetry" button calls `useSourceHealth.refreshHealth()` and bypasses cached snapshots.

---

## 5. Troubleshooting Workflow

1. **Confirm backend availability** – `curl /api/sources/health` should return 200 within a few milliseconds.
2. **Validate serverless proxy** – invoke the corresponding Netlify function (`/.netlify/functions/sources-health`) to confirm routing and CORS headers.
3. **Verify SSE streaming** – use the stream command above or observe `last heartbeat` timestamp in the diagnostics panel.
4. **Check fallback state** – UI will display "Fallback telemetry active" if mock data is being used. Inspect logs for repeated `health_failures` increments.
5. **Execute integration tests** – run `pytest backend/test_sources_integration.py::test_health_endpoint_returns_metrics` for a focused smoke test.
6. **Escalate** – if circuit breaker remains open after cooldown, capture logs and raise to platform engineering.

---

## 6. Performance Optimization

- **Caching**: Backend caches snapshots for `STREAM_REFRESH_SECONDS` (30s). Netlify functions optionally cache responses for 15s (`SOURCES_HEALTH_CACHE_TTL`).
- **Concurrency Control**: Semaphore prevents thundering herd; adjust `BAILEY_SOURCES_HEALTH_CONCURRENCY` for high-traffic environments.
- **Latency Headers**: Use `X-Bailey-Health-Latency` and `X-Proxy-Upstream-Latency` (from Netlify) to pinpoint slow layers.
- **SSE Keep-Alive**: `SOURCES_STREAM_KEEPALIVE_MS` governs aborting stalled upstream connections (default 120s).

---

## 7. Source Actions & Validation

| Action | Endpoint | Notes |
| --- | --- | --- |
| Trigger test | `POST /api/sources/{id}/test` | Validates connectivity and refreshes cache. Requires safe identifier. |
| Diagnostics | `POST /api/sources/{id}/diagnostics` | Returns latency and success flag; toggles status between `online` and `degraded`. |
| Pause | `POST /api/sources/{id}/pause` | Marks source as maintenance and updates snapshot immediately. |
| Resume | `POST /api/sources/{id}/resume` | Restores status to `online` and clears maintenance window. |
| History | `GET /api/sources/{id}/history?window=24h` | Provides 15-minute grain metrics for charts. |

Identifiers are strictly validated against `[a-z0-9_.-]+`; malformed IDs return HTTP 422.

---

## 8. Testing Matrix

| Scenario | Command |
| --- | --- |
| Full integration suite | `pytest backend/test_sources_integration.py`
| Focused cache behavior | `pytest backend/test_sources_integration.py::test_health_endpoint_reports_cache_headers`
| UI smoke test | Observe `SourceHealthDiagnostics` panel in `/bailey-intelligence`
| Netlify function dry-run | `netlify functions:invoke sources-health --query-string bypassCache=true`

Remember to run the FastAPI application (`uvicorn app.main:app --reload`) before executing tests locally.

---

## 9. Deployment & Verification Checklist

1. Ensure `frontend/lib/api-config.js` includes all `/api/sources/*` mappings.
2. Deploy Netlify functions (`sources-health`, `sources-status-stream`, `sources-inventory`, `sources-test`, `sources-diagnostics`, `sources-pause`, `sources-resume`).
3. Confirm environment variables (`BACKEND_BASE_URL`, timeout, cache TTL) are set in the Netlify UI.
4. Deploy backend (FastAPI) with new logging and metrics code.
5. Run integration tests against staging (`pytest backend/test_sources_integration.py`).
6. Validate UI diagnostics panel reflects live data (no "fallback" banner).

---

## 10. FAQ

**Q: Why do I still see mock data after redeploy?**  
A: Cached Netlify function responses may persist for up to `SOURCES_HEALTH_CACHE_TTL` seconds. Use the manual refresh button or call `/api/sources/health?force=true`.

**Q: SSE stream closes after a few minutes.**  
A: Check keep-alive timeout (`SOURCES_STREAM_KEEPALIVE_MS`) and confirm backend logs do not show `Stream failed` entries.

**Q: Can I export current telemetry for support?**  
A: Use the "Export Snapshot" button in `SourceHealthDiagnostics`; it generates a CSV of all sources with current metrics.

---

## 11. Escalation

- **Primary Owners**: Platform team `#bailey-intelligence` Slack channel.
- **Secondary**: Data ingestion squad for connector-specific outages.
- Provide logs (`app/api/sources.py`, Netlify function output), runtime metrics, and results from integration tests when opening incidents.

---

_Last updated: 2024-03-01_
