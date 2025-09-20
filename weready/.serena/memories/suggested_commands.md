# Suggested Commands

## Environment Setup
- Python backend venv + deps:
  - `cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt`
- Initialize database (SQLite by default):
  - `cd backend && source venv/bin/activate && python -c "from app.database.connection import init_db; init_db()"`
- Frontend deps:
  - `cd frontend && npm install`

## Run (Development)
- Backend API (FastAPI):
  - `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`
- Frontend (Next.js):
  - `cd frontend && npm run dev`
- Combined helper (expects existing venv):
  - `./run.sh`

## Smoke / Demo Scripts (Backend)
- Hallucination detection demo:
  - `cd backend && source venv/bin/activate && python demo_api.py`
- Free analysis workflow (requires backend running on `:8000`):
  - `cd backend && source venv/bin/activate && python test_complete_workflow.py`
- GitHub integration demo (network required):
  - `cd backend && source venv/bin/activate && python test_github_integration.py`
- Create a test user + link a free analysis (uses DB):
  - `cd backend && source venv/bin/activate && python test_user_creation.py`

## Typechecking / Build (Frontend)
- Typecheck:
  - `cd frontend && npm run typecheck`
- Build:
  - `cd frontend && npm run build`
- Start (prod):
  - `cd frontend && npm run start`

## Linting / Formatting
- Backend: no formatter/linter configured in repo; follow conventions memory. Consider `black`/`ruff` in future.
- Frontend: no ESLint/Prettier configured; rely on `tsc` typecheck for now.

## Useful macOS/Darwin Utils
- Navigate/list: `cd`, `ls -la`
- Search files: `rg --files` (ripgrep) or `find . -name "pattern"`
- Search content: `rg "substring"`
- Read files: `sed -n '1,200p' path` or `bat path` if available
- Processes/ports: `lsof -i :8000`, `kill -9 <pid>`