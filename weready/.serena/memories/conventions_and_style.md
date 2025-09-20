# Conventions and Style

## Python (Backend)
- Framework: FastAPI with Pydantic request/response models; prefer explicit type hints.
- Structure: Keep API endpoints in `app/api`, domain logic in `app/core`/`app/services`, and persistence in `app/models` + `app/database`.
- Dependency injection: Use `Depends(get_db)` for per‑request SQLAlchemy sessions; always close sessions.
- Error handling: Raise `HTTPException` with safe messages; avoid leaking secrets; catch broad exceptions at route level and rethrow 4xx/5xx appropriately.
- Security:
  - Read secrets/IDs from environment (see env vars memory). Replace default fallback secrets in production.
  - Use `SessionMiddleware` secret via `SESSION_SECRET`.
  - JWT: `JWT_SECRET_KEY`, `JWT_ALGORITHM`.
- Data access: Keep queries via SQLAlchemy ORM; avoid N+1 by batching when needed; keep transactions short and explicit.
- Docs: Module‑level docstrings at top of files; short docstrings for public functions/classes; inline comments for non‑obvious logic.
- Naming: `snake_case` for functions/vars, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
- Testing: Current repo includes smoke/demo scripts (`backend/test_*.py`). For new backend features, add pytest‑style unit tests alongside modules or in a `tests/` folder; avoid using network in unit tests—prefer fixtures. Until a suite exists, keep demo scripts updated.

## TypeScript/React (Frontend)
- Next.js app directory structure (`app/`); prefer function components and hooks.
- Type safety: Enable and honor `tsc` type checks (`npm run typecheck`).
- Styling: Tailwind CSS utility classes; keep classNames readable and composable.
- State: use `@tanstack/react-query` for data fetching; `zustand` for local state if used.
- Auth tokens: Stored in `localStorage` in OAuth callback; ensure API calls read `Authorization: Bearer <token>` where needed.

## API Design
- Routes under `/api` for app features; top‑level `/scan/*` for scanning flows.
- Validate inputs with Pydantic models; include optional sensible defaults.
- Return structured JSON with clear types and optional fields for extended data.
- Separate demo/mocked data from production code paths; document any temporary mock usage and plan real integration.
