# Repo Structure (high level)

- ./weready
  - backend/
    - app/
      - main.py (FastAPI app; routers, scoring integration)
      - api/ (analysis, user, demo routers)
      - auth/ (oauth, jwt handling, password utils)
      - core/ (hallucination detector, scorer, brain, integrators; large files)
      - services/ (github analyzer, mock data)
      - models/ (user, analysis); model `Base` separate from `database.Base`
      - database/ (connection.py; engine/session setup)
      - utils/
    - requirements.txt, demo_api.py, tests (demo-like scripts)
    - weready.db (SQLite sample)
  - frontend/
    - app/ (pages, components, contexts, utils)
    - netlify/functions/ (proxy functions)
    - next.config.js, package.json, tsconfig.json, tailwind config
  - docs/, public/, scripts/
  - run.sh, agents.md, README.md

- Root
  - .git, .serena, Netlify config at root and under frontend