# Bailey Intelligence Loading Guide

This runbook documents how to diagnose and resolve Bailey Intelligence pages that appear to load indefinitely or display fallback data. It captures the recent port alignment fix (backend bound to port 8000) and provides repeatable checks to keep the frontend and backend in sync across environments.

---

## 1. Common Symptoms & Root Causes

| Symptom | Likely Cause | Resolution |
| --- | --- | --- |
| `Loading Bailey Intelligence…` spinner never resolves | Backend listening on a port other than `8000` | Start backend on port `8000` or update frontend config
| Network tab shows `GET /health` or `/github/trending-intelligence` failing with `ERR_CONNECTION_REFUSED` | Backend not running or blocked by firewall/VPN | Start backend, verify local firewall rules, retry commands below
| Health endpoint returns JSON but `trending-intelligence` 5xx | Backend running but GitHub integration hitting rate limits | Inspect `/health` rate limiting section, retry later or supply a GitHub token
| Frontend console logs `API request failure …` | Timeout or CORS mismatch | Confirm backend CORS headers (now set automatically) and inspect console debug output

---

## 2. Quick Diagnostic Workflow

1. **Confirm Backend Status**
   ```bash
   curl -s http://localhost:8000/health | jq '.status'
   ```
2. **Validate Port Alignment**
   ```bash
   lsof -iTCP:8000 -sTCP:LISTEN
   ```
   If nothing is listening, restart the backend with `run.sh` (see §5).
3. **Run the Quick Fix Script**
   ```bash
   ./quick_fix_bailey_intelligence.sh
   ```
   This aggregates port checks, CORS validation, health diagnostics, and dependency imports in one pass.
4. **Check Frontend Endpoint URL**
   Open the browser console and run:
   ```javascript
   window.__WE_READY_DEBUG__?.api?.healthEndpoint
   ```
   You should see `http://localhost:8000/health` during local development.
5. **Retry With Enhanced Logging**
   Set `NEXT_PUBLIC_API_DEBUG=true` in `.env.local`, reload the page, and review the console output from the new API diagnostics.

---

## 3. Configuration Validation Checklist

| Item | Command | Expected |
| --- | --- | --- |
| Backend port | `echo $BACKEND_PORT` | `8000` or unset |
| Frontend base URL | `grep -n "baseUrl" frontend/lib/api-config.js` | `http://localhost:8000` |
| Run script command | `grep -n uvicorn run.sh` | `--port 8000 --host 0.0.0.0` |
| Health diagnostics | `curl -s http://localhost:8000/health | jq '.configuration_validation'` | `matches_frontend: true` |

When any expected value differs, update the configuration and restart services.

---

## 4. Port Configuration Deep Dive

- **Backend**: `weready/backend/app/main.py` now binds uvicorn to port `8000`.
- **Frontend**: `frontend/lib/api-config.js` reads the same value and validates it at runtime.
- **Override**: Set `BACKEND_PORT` before running `./run.sh` if you must use a different port, then set `NEXT_PUBLIC_BACKEND_PORT` and `NEXT_PUBLIC_API_FALLBACK_URL` to keep the frontend aligned.

---

## 5. Starting Services With Safety Nets

Use the enhanced run script to start both tiers with health checks, restart monitoring, and graceful shutdown:

```bash
./run.sh
```

It now performs:
- Port availability checks before launch
- Uvicorn startup on `0.0.0.0:8000`
- Health polling against `/health`
- Optional automatic restarts (controlled with `MAX_RESTARTS`)
- Structured logging with timestamps

Stop the stack with `Ctrl+C`. The trap handler shuts down both processes cleanly.

---

## 6. Health Check Procedures

1. **Live Health Snapshot**
   ```bash
   curl -s http://localhost:8000/health | jq '{status, rate_limiting, configuration_validation}'
   ```
2. **Backend Debuggers**
   ```bash
   python backend/health_check_comprehensive.py
   python backend/debug_health_endpoint.py --startup-validation --json
   ```
   The second command mirrors the frontend call path and prints CORS, rate-limit, and startup validation issues inline.
3. **Quick Fix Orchestration**
   ```bash
   ./quick_fix_bailey_intelligence.sh --capture diagnostics.txt
   ```
   Generates a consolidated report and optional summary file you can share with the team.
4. **Continuous Monitoring**
   The enhanced `useApiHealth` hook polls the endpoint every 45 seconds and surfaces status via the `ApiConnectionStatus` banner and the new debug panel.

---

## 7. Development vs Production Differences

| Aspect | Development | Production |
| --- | --- | --- |
| Base URL | `http://localhost:8000` | Relative paths to Netlify functions |
| CORS | Explicit `Access-Control-Allow-Origin` header on `/health` | Managed by platform |
| Logging | Verbose console + debug cards | Minimal console noise unless `NEXT_PUBLIC_API_DEBUG=true` |
| Fallback Data | Enabled automatically on failure | Should be disabled before release (monitor closely) |

---

## 8. API Endpoint Testing Recipes

```bash
# Health endpoint
curl -s http://localhost:8000/health | jq '.status'

# Trending intelligence
curl -s http://localhost:8000/github/trending-intelligence | jq '.status'

# Repository analysis sample
curl -s "http://localhost:8000/github/repository-analysis?repo_url=https://github.com/openai/whisper" | jq '.status'
```

Use `jq` to inspect payload contents quickly. Non-`200` responses indicate upstream failures or validation errors.

---

## 9. Browser Developer Tools Tips

- **Network Tab**: Filter by `bailey` to inspect health and trending calls; confirm request URL includes `:8000`.
- **Bailey Debug Panel**: Open the `BaileyIntelligenceDebugPanel` (visible in non-production builds) to review latency, fallback status, recent failures, and retrigger the health check.
- **Console**: Look for messages prefixed with `[API]`. They include latency, retry attempts, and fallback usage.
- **Application Storage**: Check session storage for `weready:api-health:last-snapshot` to confirm the new hook persists status.

---

## 10. Log Analysis

- Backend logs stream directly to the terminal running `run.sh`; look for uvicorn startup lines confirming port `8000`.
- Frontend logs (Next.js) show API diagnostics. Enable `NEXT_PUBLIC_API_DEBUG=true` for granular tracing.
- Health script logs provide cross-service metrics (rate limits, dependency counts, configuration validation).

---

## 11. Quick Fixes

1. Run `./quick_fix_bailey_intelligence.sh` for an end-to-end status report, then address any items flagged `[WARN]` or `[FAIL]`.
2. Run `./run.sh` to restart both tiers with the latest safeguards.
3. Clear the browser cache or stop service workers (`Cmd+Shift+R`).
4. Toggle `NEXT_PUBLIC_API_DEBUG=true` temporarily to capture verbose diagnostics (watch the debug panel for live updates).
5. Reset GitHub API usage by waiting for the rate-limit reset shown in `/health`.

---

## 12. Prevention & Best Practices

- Keep backend and frontend ports synchronized; treat port `8000` as canonical in development.
- Commit updates to `api-config.js` when environment assumptions change and capture new retry/timeout defaults.
- Leave both `ApiConnectionStatus` and the new debug panel visible in non-production environments to catch regressions early.
- Run `backend/health_check_comprehensive.py` and `backend/debug_health_endpoint.py` as part of pre-release smoke tests.
- Document any required environment variable overrides inside this guide and store reusable diagnostics output (e.g., `quick_fix` reports) for future comparisons.

---

Maintaining this checklist will keep Bailey Intelligence responsive and transparent for developers and stakeholders.
