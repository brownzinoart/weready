# WeReady Project Overview

- Purpose: Evidence‑based “WeReady” scoring and guidance for AI/startup repos. Backend analyzes code (hallucinations, repo signals, market context) and serves recommendations; frontend presents UX with landing + analysis flow; Netlify functions proxy to backend in deployment.
- Components:
  - Backend: FastAPI app exposing `/api/*`, `/scan/*` routes with scoring engine (“brain”), OAuth (GitHub/Google/LinkedIn), and Github analysis integration.
  - Frontend: Next.js 14 App Router (TypeScript, Tailwind) with client‑side auth context and rich marketing/analysis UI.
  - Netlify Functions: Small proxies (semantic search, GitHub analysis, health) that forward to backend (`BACKEND_API_URL`).
- Data: SQLAlchemy ORM; default `sqlite:///./weready.db`; optional Redis in requirements (not wired in code paths yet). No Alembic migrations present.
- Current DX: Dev `run.sh` starts uvicorn + Next dev. Minimal test scripts inside backend; no standardized test runner.
- Notable gaps (high level):
  - Large, monolithic backend modules; limited type‑safety and separation of concerns.
  - Frontend uses static export while also depending on dynamic APIs; no ESLint/Prettier config.
  - Auth stores tokens client‑side; OAuth callback returns tokens via query params; no httpOnly cookies.
  - No CI/CD, lint, type check, or security scans enforced; migrations missing; limited observability.