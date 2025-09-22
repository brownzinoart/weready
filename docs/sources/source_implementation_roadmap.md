# Source Implementation Roadmap

## Current Implementation Status

| Category | Source ID | Status | Notes |
| --- | --- | --- | --- |
| core_sources | `github_api` | Implemented | GitHub and GitHub Intelligence connectors stream live repository and developer metrics. |
| core_sources | `arxiv` | Implemented | Academic integrator monitors arXiv and academic research feeds. |
| core_sources | `yc_directory` | Implemented | Y Combinator connector scrapes public batch exports for outcomes. |
| core_sources | `stackoverflow` | Implemented | Live Stack Overflow API ingests tag popularity, AI adoption, and sentiment. |
| intelligence_modules | `government_data_integrator` | Implemented | Wraps existing government integrator for SEC, USPTO, FRED, Census, BEA, procurement APIs. |
| intelligence_modules | `funding_tracker` | Implemented | Funding tracker intelligence surfaces sector temperature, economic context, and forecasts. |
| intelligence_modules | `market_timing_advisor` | Implemented | Market timing report combines funding, GitHub, procurement, and macro signals. |
| code_quality_sources | `sonarqube` | Implemented | SonarQube/SonarCloud API for quality gate metrics. Requires `SONARQUBE_*` env. |
| code_quality_sources | `codeclimate` | Implemented | Code Climate Velocity API for maintainability debt insights. |
| code_quality_sources | `gitguardian` | Implemented | GitGuardian incidents API for credential exposure monitoring. |
| code_quality_sources | `semgrep` | Implemented | Semgrep Cloud API for rule-level findings. |
| code_quality_sources | `veracode` | Implemented | Veracode summary API for policy scans. |
| business_intelligence_sources | `first_round` | Implemented | First Round Review RSS feed ingestion. |
| business_intelligence_sources | `andreessen_horowitz` | Implemented | a16z research feed ingestion. |
| business_intelligence_sources | `lean_startup` | Implemented | Lean Startup blog feed. |
| business_intelligence_sources | `profitwell` | Implemented | ProfitWell recurring revenue research feed. |
| business_intelligence_sources | `harvard_business_school` | Implemented | HBS Working Knowledge feed. |
| investment_readiness_sources | `sequoia_capital` | Implemented | Sequoia articles feed. |
| investment_readiness_sources | `bessemer_venture_partners` | Implemented | BVP insights feed. |
| investment_readiness_sources | `mit_entrepreneurship` | Implemented | MIT entrepreneurship feed. |
| investment_readiness_sources | `nvca` | Implemented | NVCA news feed. |
| investment_readiness_sources | `cb_insights` | Implemented | CB Insights research feed. |
| investment_readiness_sources | `angellist` | Implemented | AngelList blog feed. |
| design_experience_sources | `nielsen_norman_group` | Implemented | NN/g research feed. |
| design_experience_sources | `baymard_institute` | Implemented | Baymard UX research feed. |
| design_experience_sources | `webaim` | Implemented | WebAIM accessibility feed. |
| design_experience_sources | `google_design` | Implemented | Google Design library feed. |
| design_experience_sources | `apple_hig` | Implemented | Apple developer news feed. |
| design_experience_sources | `chrome_ux_report` | Implemented | Chrome UX Report API for Core Web Vitals. |
| roadmap | `snyk` | Planned | Security platform targeted for Q3 integration (API scoping). |
| roadmap | `datadog` | Planned | Observability source for operational maturity signals. |
| roadmap | `pagerduty` | Planned | Incident response maturity scoring. |

## Source Categories & Coverage

- **Core Sources** – Foundational connectors supplying GitHub, arXiv, Reddit, YC, government, and macro data.
- **Intelligence Modules** – Wrapper connectors around existing Bailey engines (funding, market timing, government).
- **Code Quality** – SonarQube, Code Climate, GitGuardian, Semgrep, Veracode. Two additional security tools targeted for H2.
- **Business Intelligence** – Venture firm benchmarks and operating playbooks (First Round, a16z, Lean Startup, ProfitWell, HBS).
- **Investment Readiness** – Venture capital research, public benchmarks, AngelList market data.
- **Design Experience** – UX research authorities plus Chrome UX performance metrics.

Current coverage sits at **28 implemented sources** across **6 categories**. Planned additions focus on security operations and reliability tooling to close remaining frontend gaps.

## Implementation Priorities

1. **Security & Reliability Enhancements** – Integrate Snyk, Datadog, PagerDuty to complete the security/operations pillar (Q3 target).
2. **Academic Expansion** – Extend academic research integrator to Google Scholar and IEEE Xplore (Q3).
3. **International Market Coverage** – Add OECD innovation indices and export finance connectors (Q4).
4. **Data Quality Automation** – Introduce automated connector health checks and SLA dashboards (Q4).

## API Requirements & Credentials

| Source | Environment Variables | Notes |
| --- | --- | --- |
| GitHub | `GITHUB_TOKEN` | Optional but recommended for higher rate limits. |
| Reddit | `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET` | Required for Reddit API ingestion. |
| Product Hunt | `PRODUCT_HUNT_TOKEN` | Maintains technology trend coverage. |
| Census | `CENSUS_API_KEY` | Business formation stats. |
| BEA | `BEA_API_KEY` | Economic indicators. |
| SonarQube | `SONARQUBE_API_TOKEN`, `SONARQUBE_API_BASE`, `SONARQUBE_PROJECTS` | Comma separated project keys. |
| Code Climate | `CODECLIMATE_API_TOKEN`, `CODECLIMATE_REPO_IDS` | Repository IDs from Code Climate dashboard. |
| GitGuardian | `GITGUARDIAN_API_KEY` | Required for incident API. |
| Semgrep | `SEMGREP_API_TOKEN`, `SEMGREP_ORG_SLUG` | Cloud platform credentials. |
| Veracode | `VERACODE_API_ID`, `VERACODE_API_KEY` | Uses Veracode HMAC authentication. |
| Stack Overflow | `STACKOVERFLOW_API_KEY` | Optional but increases quota. |
| Chrome UX Report | `CHROME_UX_REPORT_API_KEY`, `CHROME_UX_ORIGINS` | Origins comma separated for Core Web Vitals.

## Data Quality Standards

- All connectors respect published API rate limits and throttle via `BaileyConnector`.
- Health snapshots capture knowledge point counts, last run timestamps, and failure states.
- Sources flagged as `mock` or `planned` remain visible with explicit status badges in the frontend dashboard.
- Coverage metrics compare backend connectors against the legacy frontend catalog to surface discrepancies.

## Integration Patterns

- **Wrapper Connectors** – Government, academic, GitHub intelligence, funding tracker, and market timing modules now expose connectors that surface health/performance data.
- **Category Organization** – Connectors are grouped under `app/core/source_connectors/` with category-specific modules for maintainability.
- **Pipeline Registration** – `BaileyDataPipeline` tracks `connector_groups` metadata, enabling per-category ingestion and reporting.
- **Inventory Service** – `SourceInventoryService` powers the `/api/sources/*` endpoints used by the new Source Inventory Dashboard in the frontend.

> For change management, run `pytest weready/backend/test_source_coverage.py` in CI to verify frontend/backend alignment before deployment.
