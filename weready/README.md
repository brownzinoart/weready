# WeReady Application

This directory contains the production-ready implementation of the WeReady founder readiness platform. The stack is a FastAPI backend paired with a Next.js 14 frontend, orchestrated by helper scripts for local development, deployment, and monitoring.

## Layout
- `backend/` – FastAPI service with scoring engine, data integrations, auth, and utility scripts.
- `frontend/` – Next.js App Router UI, Netlify functions, and supporting build scripts.
- `public/` – Placeholder for static assets served by Next.js (empty by default).
- `scripts/` – Automation helpers (team agent tooling, etc.).
- `insights/` – Pitch collateral and reference PDFs.
- `logs/` – Runtime logs created by setup scripts (ignored by git).
- `monitoring_setup.sh`, `environment_setup.sh`, `redis_setup.sh`, `run.sh`, `run_enhanced.sh` – Operational scripts for developers and operators.

## Local Development
1. **Backend**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   # App available at http://localhost:3000
   ```
3. **One-line startup**
   ```bash
   ./run.sh  # launches backend + frontend with sensible defaults
   ```

## Environment Configuration
- Copy `.env.example` to `.env.local` or run `./environment_setup.sh --mode dev` to generate `.env.business` (never commit this file).
- Redis is optional locally, but Business Pillar features expect `redis://` connectivity.
- Scripts emit logs to `../logs/` for traceability.

## Testing & Quality Gates
- Backend smoke tests live under `backend/test_*.py`; execute with the virtualenv active: `python backend/test_complete_workflow.py`.
- Frontend unit tests use Jest: `cd frontend && npm run test`.
- Health checks: `python backend/health_check.py --json --base-url http://127.0.0.1:8000`.

## Operational Playbooks
Consolidated documentation lives in the top-level `../docs/` directory:
- Architecture: `../docs/architecture/bailey_intelligence.md`
- Deployment: `../docs/operations/business_pillar_deployment.md`
- Checklists: `../docs/operations/deployment_checklist.md`
- Testing flows: `../docs/testing/frontend_flow.md`
- AI agent guidance: files under `../docs/ai/`

## Deployment Notes
- Netlify builds use the root `netlify.toml` which targets this directory (`base = "weready/frontend"`).
- `frontend/netlify/functions/` contains serverless proxies that rely on the backend API (`BACKEND_API_URL`).
- Use `run_enhanced.sh` for full-stack provisioning (env setup, Redis bootstrap, backend restart, frontend rebuild, monitoring).
