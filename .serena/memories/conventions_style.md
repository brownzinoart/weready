# Conventions & Style (current)

- Frontend (TS/React)
  - TypeScript strict enabled; no lint/format configs committed; Tailwind utility classes throughout; heavy client components in `app/page.tsx` with embedded mock data.

- Backend (Python)
  - Mixed typing usage; large modules under `app/core/`; FastAPI routers organized by domain under `app/api/` and `app/auth/`.
  - Pydantic models defined inline in `main.py` for some responses; limited docstrings; exceptions handled via HTTPException in routes.
  - SQLAlchemy models define their own `Base` separate from `database.Base`.

- Testing
  - Several script-like test files printing results; no pytest structure or CI gating.

- Docs
  - Minimal README; `agents.md` describes backend TDD and enterprise-quality expectations.