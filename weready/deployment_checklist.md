# Business Pillar Deployment Checklist

A step-by-step checklist to roll out the Business Pillar enhancements across backend and frontend services.

## 1. Pre-Deployment Validation
- [ ] Confirm `.env` (or secrets manager) includes BEA, OECD, Product Hunt, StackExchange, OpenAlex keys plus `REDIS_URL` and `SESSION_SECRET`.
- [ ] Run `weready/backend/install_dependencies.sh` and review `logs/install_dependencies.log` for errors.
- [ ] Run `weready/frontend/rebuild_frontend.sh --mode dev --skip-install` to validate build pipeline locally.
- [ ] Ensure Redis is running and persistent (`redis-cli ping` should return `PONG`).
- [ ] Validate new data connectors manually when possible: Census BFS, World Bank, OECD SDMX, Product Hunt, Stack Exchange, OpenAlex.

## 2. Deployment Procedure
- [ ] Back up current `.env`, database snapshots, and Redis persistence files.
- [ ] Execute `weready/redis_setup.sh` if provisioning a new cache layer.
- [ ] Run `weready/environment_setup.sh` to provision environment variables on target infrastructure.
- [ ] Deploy backend dependencies with `backend/install_dependencies.sh` on each target node.
- [ ] Restart FastAPI using `backend/restart_service.sh --mode prod` and validate logs.
- [ ] Install/update frontend dependencies (`frontend/rebuild_frontend.sh --mode prod`).
- [ ] Promote the new `.next` build artifact or redeploy via existing CI/CD pipeline.

## 3. Post-Deployment Validation
- [ ] Run `backend/health_check.py` (or `python backend/health_check.py --report`) to confirm upstream data sources.
- [ ] Run `backend/validate_apis.py --base-url https://<env-host>` to confirm API responses.
- [ ] Run `frontend/validate_components.js --mode production` (via `npm run validate:components`).
- [ ] Spot check Business Intelligence dashboard within the UI (Business and Business Intelligence tabs).
- [ ] Monitor Redis hit rate and FastAPI latency for the first hour after cutover.

## 4. Monitoring & Observability
- [ ] Enable health monitors via `monitoring_setup.sh` (dashboards + alerts).
- [ ] Verify alert routing for API outages, data source failures, and cache degradation.
- [ ] Confirm log aggregation captures `backend_service.log`, `frontend_rebuild.log`, and health check outputs.

## 5. Rollback Plan
- [ ] Stop the new service via `backend/restart_service.sh --mode dev` and redeploy the previous artifact.
- [ ] Restore cached artifacts and database snapshots if data corruption is detected.
- [ ] Re-run `frontend/rebuild_frontend.sh --mode prod --skip-install` using the prior commit hash.
- [ ] Communicate rollback status to stakeholders and document root cause.

## 6. Success Criteria
- API endpoints `/api/business-formation/*`, `/api/international-markets/*`, `/api/technology-trends/*`, `/api/business-intelligence/dashboard` return data in < 1.5 s at P95.
- Cached responses show >70% cache-hit ratio after warmup.
- Frontend Business Intelligence tabs render without console errors and display all charts and signal cards.
- Monitoring alerts remain green for 24 hours post-deployment.
