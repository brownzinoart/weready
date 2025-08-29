# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WeReady is an AI-first founder readiness platform with three core pillars:
1. **Code Intelligence** - Detects AI hallucinations and code quality issues
2. **Business Intelligence** - Validates business models and market readiness  
3. **Investment Intelligence** - Assesses investor readiness and funding potential

The platform features "Bailey Intelligence" - a comprehensive 4-pillar analysis system that provides actionable insights with full source attribution.

## Development Commands

### Backend (FastAPI)
```bash
# Start backend server
cd weready/backend
source venv/bin/activate  # Activate virtual environment
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Alternative with environment path
PYTHONPATH=/Users/wallymo/weready/weready/backend python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run backend tests
python test_hallucination_detector.py
python test_weready_score.py
python test_github_integration.py
python test_complete_workflow.py
python test_user_creation.py

# Install dependencies
pip install -r requirements.txt
```

### Frontend (Next.js)
```bash
# Start frontend development server
cd weready/frontend
npm run dev  # Runs on http://localhost:3000

# Run on alternative ports (for multiple instances)
PORT=3001 npm run dev
PORT=3002 npm run dev
PORT=3004 npm run dev

# Build for production
npm run build

# Install dependencies
npm install
```

### Full Stack
```bash
# Quick start (from root)
./run.sh

# Or manually start both:
# Terminal 1: Backend
cd weready/backend && source venv/bin/activate && python -m uvicorn app.main:app --reload

# Terminal 2: Frontend  
cd weready/frontend && npm run dev
```

## Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: React Context (AuthContext) + Zustand
- **Data Fetching**: TanStack Query
- **Key Routes**:
  - `/` - Landing page with demo functionality
  - `/bailey-intelligence` - Main Bailey Intelligence dashboard
  - `/demo/*` - Demo features and portfolio management
  - `/dashboard` - User dashboard (authenticated)
  - `/auth/*` - Authentication flows (OAuth callbacks)

### Backend Architecture
- **Framework**: FastAPI (Python)
- **Database**: SQLite (weready.db) with SQLAlchemy ORM
- **Authentication**: JWT + OAuth (GitHub, Google)
- **Core Modules**:
  - `app.core.bailey` - Bailey Intelligence orchestrator
  - `app.core.hallucination_detector` - AI code validation
  - `app.core.weready_scorer` - Scoring algorithms
  - `app.core.weready_brain` - Central intelligence engine
  - `app.core.design_intelligence` - Design analysis
  - `app.core.github_intelligence` - GitHub repo analysis
  
### API Structure
- `/api/analysis/*` - Code analysis endpoints
- `/api/demo/*` - Demo functionality and mock data
- `/api/user/*` - User management
- `/auth/*` - OAuth and authentication

## Key Components

### Bailey Intelligence System
Bailey provides comprehensive 4-pillar analysis:
1. **Code Intelligence** - Technical debt, security, hallucinations
2. **Business Intelligence** - Market fit, revenue models, competition
3. **Design Intelligence** - UX/UI quality, accessibility, best practices
4. **Investment Intelligence** - Funding readiness, metrics, valuations

Each analysis includes:
- Detailed scoring (0-100)
- Source attribution with confidence levels
- Actionable recommendations
- Visual charts and metrics

### Authentication Flow
- JWT-based authentication with refresh tokens
- OAuth support for GitHub and Google
- Session management via cookies
- Protected routes using AuthContext

### Mock Data System
Comprehensive demo system at `/api/demo/*` provides:
- Sample portfolio projects
- Pre-generated analysis reports
- Comparison features
- No authentication required for demos

## Configuration

### Environment Variables
Backend requires `.env` file with:
- `SESSION_SECRET` - Session encryption key
- `JWT_SECRET_KEY` - JWT signing key
- OAuth credentials (GitHub, Google)
- Database connection strings

### CORS Configuration
- Development: `http://localhost:3000`, `http://localhost:3001`
- Add additional origins in `app/main.py`

## Testing Approach

### Backend Testing
- Unit tests for core modules using pytest patterns
- Test files prefixed with `test_`
- Run individual tests: `python test_[module].py`

### Frontend Testing
- No test framework currently configured
- Consider adding Jest + React Testing Library

## Security Considerations
- Never commit `.env` files or secrets
- OAuth tokens stored securely in httpOnly cookies
- CORS configured for specific origins only
- Input validation on all API endpoints
- SQL injection prevention via SQLAlchemy ORM

## Performance Optimization
- Frontend uses Next.js static export (`output: 'export'`)
- Backend implements caching for expensive operations
- Database queries optimized with proper indexing
- Async operations for GitHub API calls

## Common Development Tasks

### Adding New API Endpoints
1. Create route in `app/api/[module].py`
2. Add router to `app/main.py`
3. Update CORS if needed
4. Add TypeScript types in frontend

### Adding New Frontend Pages
1. Create page in `app/[route]/page.tsx`
2. Add navigation in appropriate components
3. Implement data fetching with TanStack Query
4. Add loading and error states

### Modifying Bailey Intelligence
1. Update analyzer in `app/core/bailey.py`
2. Modify connectors in `app/core/bailey_connectors.py`
3. Update frontend tabs in `app/components/tabs/*`
4. Ensure source attribution is maintained

## Deployment Notes
- Frontend builds to static files (`out/` directory)
- Backend runs via uvicorn ASGI server
- Consider using PM2 or systemd for production
- Database migrations handled via Alembic (when configured)