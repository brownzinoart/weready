# Done Checklist (what to run/check before handing off)

- App starts locally:
  - Backend: `uvicorn app.main:app --reload` serves OpenAPI and all `/api/*` endpoints
  - Frontend: `npm run dev` renders landing/analysis; API calls succeed locally

- Env configured:
  - `.env` contains OAuth client IDs/secrets, `SESSION_SECRET`, database URL; do not commit secrets
  - `FRONTEND_URL` and `BACKEND_API_URL` consistent between frontend/Netlify/Backend

- Basic quality checks:
  - TypeScript build: `npm run typecheck` passes
  - Python imports: app runs without tracebacks; core endpoints return 200 locally

- Data layer:
  - SQLite file present or `DATABASE_URL` set to a reachable DB

- Netlify functions (if used):
  - Deployed with `BACKEND_API_URL` set; redirects work

- Known gaps (to fix in refactor):
  - No pytest suite, lint configs, formatter configs, or Alembic migrations; auth/session security improvements pending