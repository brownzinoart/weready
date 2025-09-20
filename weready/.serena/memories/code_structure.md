# Code Structure

- Root
  - `backend/` – FastAPI app, database, models, auth, services, and demo/test scripts
  - `frontend/` – Next.js 14 app with Tailwind and TypeScript
  - `.serena/` – Serena project config
  - `run.sh` – helper to start backend and frontend (expects an existing venv inside `backend`)
  - `README.md` – quick start

- Backend (`backend/app`)
  - `main.py` – FastAPI app, routers, CORS/session middleware, endpoints
  - `api/` – Feature routers
    - `analysis.py` – `/api/analyze/free`, `/api/results/free/{id}`
    - `user.py`, `demo.py`
  - `auth/` – Auth flows
    - `oauth.py` – OAuth routes (GitHub/Google/LinkedIn), email/password signup+login, helpers
    - `jwt_handler.py` – JWT creation/verification helpers
    - `password_utils.py`
  - `database/`
    - `connection.py` – SQLAlchemy engine/session, `create_tables()/init_db()`
  - `models/`
    - `user.py` – `User`, `UserSession`, `UserActivity` with enums
    - `analysis.py` – `Analysis`, `IssueTracking`
  - `core/` – Scoring “brain”, hallucination detection, design/market intelligence
    - `weready_brain.py`, `weready_scorer.py`, `hallucination_detector.py`, etc.
  - `services/`
    - `github_analyzer.py` – Repo analysis, AI likelihood estimates
    - `mock_data.py`, `portfolio_mock_data.py` (demo)
  - Top‑level scripts in `backend/`
    - `demo_api.py` – async demo for hallucination detection
    - `test_*.py` – smoke/demo scripts (not pytest tests)

- Frontend (`frontend/`)
  - `app/` – Next.js app dir
    - `auth/` – `/auth/callback`, `/auth/error`
    - `dashboard/`, `results/`, `onboarding/`, etc.
    - `layout.tsx`, `page.tsx`, `globals.css`
  - `components/`, `lib/`, `utils/`
  - Config: `package.json`, `next.config.js`, `tailwind.config.js`, `tsconfig.json`, `postcss.config.js`
