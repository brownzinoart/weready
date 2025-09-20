# WeReady Monorepo

This repository hosts the full WeReady platform along with supporting tooling used during development and AI-assisted operations.

## Repository Layout
- `weready/` – Main application stack (FastAPI backend, Next.js frontend, ops scripts). See `weready/README.md` for in-depth setup instructions.
- `docs/` – Authoritative documentation grouped by architecture, operations, AI guidance, integrations, and testing.
- `mcp-gemini-server/` – Experimental Model Context Protocol (MCP) server for Gemini-based automation workflows.
- `.serena/`, `.claude/`, `.traycer/` – Local agent configurations (ignored by git, safe to remove if unused).
- `logs/` – Scratch space for local automation logs (ignored).

## Quick Start
```bash
# bootstrap environment from repo root
cd weready
./run.sh  # launches backend + frontend development servers
```
For enhanced orchestration (Redis provisioning, monitoring, validation), use `./run_enhanced.sh` inside `weready/`.

## Deployment
- Netlify deployments are driven by the root `netlify.toml` with build base `weready/frontend`.
- Backend deployments rely on the scripts within `weready/` (see `docs/operations/`).

## Contribution Guidelines
- Keep build artefacts (e.g., `frontend/out/`, `.tsbuildinfo`, virtual environments) out of version control.
- Update `docs/` alongside code changes to maintain operational traceability.
- Prefer incremental tests (`backend/test_*.py`, `frontend/__tests__/`) before raising PRs.

## Support
- Architectural context: `docs/architecture/bailey_intelligence.md`
- Deployment playbooks: `docs/operations/`
- Contact the maintainers via project Slack/Notion (internal).
