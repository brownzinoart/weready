# Environment and Configuration

## Required/Useful Environment Variables (Backend)
- Core
  - `DATABASE_URL` (default: `sqlite:///./weready.db`) – SQLAlchemy URL.
  - `SESSION_SECRET` – secret for `SessionMiddleware`.
  - `JWT_SECRET_KEY` – secret for JWT signing.
  - `JWT_ALGORITHM` (default: `HS256`)
  - `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` (default: `30`)
  - `JWT_REFRESH_TOKEN_EXPIRE_DAYS` (default: `7`)
  - `BASE_URL` (default: `http://localhost:8000`) – used to form OAuth callback URL.
  - `FRONTEND_URL` (default: `http://localhost:3000`) – used in redirects.
- OAuth
  - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`
- Optional/Integrations
  - Any keys for LLM or analytics used by modules in `app/core` (e.g., Google Generative AI) if enabled.

## Local Development .env
- Create `backend/.env` with the variables above. Example:
```
DATABASE_URL=sqlite:///./weready.db
SESSION_SECRET=dev-session-secret-change-me
JWT_SECRET_KEY=dev-jwt-secret-change-me
BASE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
```

## Database
- Initialize tables: `python -c "from app.database.connection import init_db; init_db()"` (run inside `backend` with venv activated).
- Default SQLite file lives relative to `backend` working directory (`./weready.db`). Override with `DATABASE_URL` for Postgres/MySQL as needed.

## Notes
- Some endpoints (`/trending/github`, parts of GitHub repo listing) currently return mock/demo data; production should store OAuth tokens and call provider APIs directly.
