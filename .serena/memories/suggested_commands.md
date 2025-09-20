# Suggested Commands

- Setup (macOS/Darwin)
  - Backend env: `cd weready/backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt`
  - Frontend deps: `cd weready/frontend && npm ci`

- Run (development)
  - Backend: `cd weready/backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000`
  - Frontend: `cd weready/frontend && npm run dev`
  - Combined: `cd weready && ./run.sh`

- Build (frontend)
  - `cd weready/frontend && npm run build`  # outputs to `out/`

- Netlify Functions (deploy)
  - Set env `BACKEND_API_URL=https://<backend-host>`; netlify.toml redirects map `/api/*` to `/.netlify/functions/*`

- Database (local)
  - Default sqlite DB path: `weready/backend/weready.db`
  - Engine/session: `weready/backend/app/database/connection.py`

- Manual tests (temporary scripts)
  - `python weready/backend/test_weready_score.py`
  - `python weready/backend/test_github_integration.py`
  - Note: Proper pytest suite not configured yet