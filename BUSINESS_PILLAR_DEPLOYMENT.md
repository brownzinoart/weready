# Business Pillar Deployment Guide

Use this guide to coordinate Business Pillar releases across backend and frontend services. For a high-level checklist, see [deployment_checklist.md](deployment_checklist.md).

## 1. Backend Dependencies
- Confirm the target host has Python 3.11 and build tooling (gcc/clang, make, libffi-dev/zlib).
- Run `weready/backend/install_dependencies.sh --mode prod` and monitor `logs/install_dependencies.log` for build failures or missing system packages.
- Verify the virtual environment exists at `weready/backend/venv` and includes the latest pinned requirements.

## 2. Service Restart
- Export or source required secrets (`SESSION_SECRET`, `REDIS_URL`, BEA/OECD/ProductHunt/StackExchange API keys) plus optional endpoints when available.
- Execute `weready/backend/restart_service.sh --mode prod` and confirm `logs/backend_service.log` records a clean shutdown/startup.
- Review health-check output for Redis connectivity and API probes (`/api/business-intelligence/dashboard`, `/api/procurement/541511`).

## 3. Frontend Rebuild
- Install dependencies if this host has not previously built the frontend: `cd weready/frontend && npm install`.
- Rebuild static assets with `weready/frontend/rebuild_frontend.sh --mode prod` and inspect `logs/frontend_rebuild.log` for warnings or errors.
- Publish the generated `.next` artifacts through CI/CD or sync them to your hosting provider.

## 4. Verification Steps
- Run `python weready/backend/health_check.py --base-url https://<env-host>` to validate upstream data sources.
- Execute UI smoke tests or `npm run validate:components` to ensure core dashboards render without regressions.
- Spot-check Business Intelligence, Procurement, and International Market tabs in the live environment.

## 5. Monitoring Setup
- Bootstrap dashboards and alerts using `weready/monitoring_setup.sh`.
- Ensure logs for `backend_service.log`, `frontend_rebuild.log`, and health checks stream to centralized logging.
- Confirm alert routing includes on-call responders for API errors, cache degradation, and build failures.

## 6. Rollback Plan
- Re-run `weready/backend/restart_service.sh --mode dev` with the prior virtual environment or build to revert backend changes.
- Restore cached artifacts, Redis snapshots, and previous frontend artifacts if data or build issues arise.
- Communicate rollback status to stakeholders and document contributing factors.

## 7. Troubleshooting
- Backend fails to start: inspect `logs/uvicorn.out` for stack traces, confirm ENV variables, and re-run dependency install if imports fail.
- Health check failures: check outbound network access to data providers and validate optional configs (World Bank source, OpenAlex base URL).
- Frontend build errors: clear `.next` cache, reinstall dependencies, and ensure Node.js tooling aligns with project requirements.
- Persistent latency or downtime: scale Redis/uvicorn workers, flush caches, and consult monitoring dashboards for bottlenecks.

Keep this document updated as deployment automation evolves.
