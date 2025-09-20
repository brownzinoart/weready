# Business Pillar Deployment Guide

This guide orchestrates the backend and frontend changes required to activate the Business Pillar enhancements—adding Census BFS, World Bank, OECD, Product Hunt, Stack Exchange, OpenAlex, and other free sources into the WeReady intelligence stack.

## 1. Prerequisites
- Python 3.10+, Node.js 18+, npm 9+
- Redis (7.x) installed locally or accessible via `REDIS_URL`
- Access to API keys: BEA, OECD SDMX, Product Hunt, Stack Exchange, FRED, BLS, optional GitHub token
- `.env.example` copied to `.env.business` or exported in the shell
- Ability to run shell scripts in the repository (`chmod +x` already applied)

## 2. Quick Start Workflow
```bash
# From weready/weready
./run_enhanced.sh --mode prod --base-url http://127.0.0.1:8000
```
The orchestration script performs:
1. Environment provisioning (`environment_setup.sh`)
2. Backend dependency installation (`backend/install_dependencies.sh`)
3. Redis configuration (`redis_setup.sh`)
4. FastAPI restart with health checks (`backend/restart_service.sh`)
5. Frontend rebuild (`frontend/rebuild_frontend.sh`)
6. Backend/Frontend validations (`backend/health_check.py`, `backend/validate_apis.py`, `frontend/validate_components.js`)
7. Monitoring asset generation (`monitoring_setup.sh`)

## 3. Manual Deployment Steps

### 3.1 Configure Environment Variables
```bash
./environment_setup.sh --mode prod --env-file .env.business
```
Review the generated file, populate placeholders (`set-me`), and ensure secrets are safely stored in your secrets manager.

### 3.2 Install Backend Dependencies
```bash
cd backend
./install_dependencies.sh
```
- Creates/activates `backend/venv`
- Installs Business Pillar libraries (`pandas`, `requests-cache`, `aioredis`, etc.)
- Verifies versions, runs `pip check`, ensures Redis connectivity

### 3.3 Provision Redis
```bash
cd ..
./redis_setup.sh
```
- Generates `config/redis-business.conf`
- Starts `redis-server` with Business Pillar tuned settings
- Seeds cache namespaces and exports monitoring snapshot (`monitoring/redis_metrics.json`)
- Produces recoverable RDB backup under `backups/redis/`

### 3.4 Restart FastAPI
```bash
cd backend
./restart_service.sh --mode prod --env-file ../.env.business
```
- Validates required environment variables
- Stops existing uvicorn/gunicorn processes gracefully
- Starts uvicorn with multi-worker settings (prod) or reload (dev)
- Confirms `/api/business-formation`, `/api/international-markets`, `/api/technology-trends`, `/api/business-intelligence/dashboard`

### 3.5 Rebuild Frontend
```bash
cd ../frontend
./rebuild_frontend.sh --mode prod
```
- Cleans `.next` caches, verifies npm cache
- Installs/validates charting dependencies (`recharts`, `d3`, `swr`, etc.)
- Runs `npm run typecheck`, `npm run validate:components`
- Builds optimized Next.js bundle

## 4. Validation & Smoke Tests
```bash
cd backend
python health_check.py --json --base-url http://127.0.0.1:8000
python validate_apis.py --json --base-url http://127.0.0.1:8000
```
```bash
cd ../frontend
npm run validate:components
```
Expected outcomes:
- All checks report `pass`/`warn` with latencies < 1.2 s
- Component validation prints “Business Intelligence components validated successfully.”

## 5. Monitoring & Observability
```bash
cd ..
./monitoring_setup.sh
```
Outputs:
- `monitoring/health_baseline.json`, `monitoring/api_baseline.json` snapshots
- `monitoring/business_pillar_monitoring.yml` blueprint for cron/job scheduler
- `monitoring/alerts/business_pillar.rules.yml` (Prometheus-style alerts)
- `monitoring/dashboard_business_pillar.json` dashboard stub

## 6. Rollback
1. `backend/restart_service.sh --mode dev --env-file .env.business`
2. Restore previous Redis dump `cp backups/redis/<timestamp>.rdb data/redis/dump.rdb`
3. Re-run `frontend/rebuild_frontend.sh --mode prod --skip-install` on prior commit
4. Notify stakeholders, capture post-mortem in `deployment_checklist.md`

## 7. Troubleshooting
| Symptom | Possible Fix |
| --- | --- |
| `install_dependencies.sh` fails on redis import | Ensure `pip install redis` succeeded; rerun script; verify virtualenv activation |
| `restart_service.sh` rollback triggered | Inspect `logs/backend_service.log`, verify `.env` secrets and Redis availability |
| Frontend build fails | Clear cache `rm -rf frontend/.next` and rerun; confirm Node.js >= 18 |
| `validate_apis.py` latency warns | Verify Redis caching (check `redis_setup.sh`), confirm external APIs reachable |
| Component validation fails | Run `npm run typecheck`, ensure `frontend/package.json` dependencies installed |

## 8. References
- [`deployment_checklist.md`](./deployment_checklist.md)
- `weready/backend/install_dependencies.sh`
- `weready/backend/restart_service.sh`
- `weready/frontend/rebuild_frontend.sh`
- `weready/backend/health_check.py`
- `weready/backend/validate_apis.py`
- `weready/frontend/validate_components.js`
- `weready/monitoring_setup.sh`
- `weready/run_enhanced.sh`
