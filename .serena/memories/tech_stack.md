# Tech Stack

- Frontend
  - Next.js 14 (App Router), React 18, TypeScript 5.6, TailwindCSS 3
  - State/data: Zustand, @tanstack/react-query
  - UI: lucide-react, headlessui
  - Auth: Custom client token handling; `next-auth` is in deps but not used
  - Build: `next build` with `output: 'export'` to `out/`

- Backend
  - FastAPI, Uvicorn, Pydantic, Starlette sessions
  - SQLAlchemy ORM; SQLite default
  - OAuth via authlib, JWT via python-jose
  - Github/LLM tools: httpx, google-generativeai, tree-sitter, numpy, scikit-learn

- Serverless
  - Netlify Functions (Node runtime) proxying to backend using `BACKEND_API_URL`

- Tooling
  - Node: no ESLint/Prettier checked-in config
  - Python: no ruff/black/isort/mypy config; no Alembic migrations; no pytest config