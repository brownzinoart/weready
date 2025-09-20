# Task Completion Checklist

Use this checklist before marking a backend task “done”.

- Tests & Verification
  - Add or update unit tests for new logic (pytest recommended) with clear success/failure cases.
  - Run backend smoke scripts when relevant:
    - API running: `uvicorn app.main:app --reload` (backend venv active)
    - Free flow script: `python backend/test_complete_workflow.py`
    - Hallucination demo: `python backend/demo_api.py`
  - Frontend: `npm run typecheck` and validate key pages load.

- Security & Config
  - No default/fallback secrets in use (`SESSION_SECRET`, `JWT_SECRET_KEY` set).
  - Inputs validated with Pydantic; errors return safe messages.
  - Secrets and tokens not logged; sensitive data redacted.

- Data Integrity & Performance
  - DB sessions properly closed (`Depends(get_db)`); transactions minimal.
  - Avoid unnecessary network calls; batch or cache where appropriate.

- Code Quality
  - Clear docstrings and inline comments for critical logic.
  - Consistent naming and module placement (`api/`, `core/`, `services/`, `models/`).
  - No dead code or unused imports in touched files.

- Documentation
  - Update endpoint docs and request/response models as needed.
  - Note any mock/demo data paths and the plan for real integrations.

- Final Pass
  - Backend server starts without errors; endpoints exercised successfully.
  - Frontend builds or typechecks cleanly.
  - Commit message summarizes changes and impacts.
