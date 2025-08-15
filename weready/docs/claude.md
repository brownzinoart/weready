# CLAUDE.MD - WeReady Platform MVP
*Living Document v1.0 - Last Updated: Today*

## 🎯 CORE MISSION
Build the first comprehensive AI-first founder readiness platform that ruthlessly evaluates:
1. **Codebase Readiness** - Is your AI-generated code production-grade or hallucinated trash?
2. **Business Readiness** - Do you have a real business or just a feature?
3. **Investment Readiness** - Will VCs laugh or write checks?

## 📊 MARKET VALIDATION
- **$10B+ opportunity** in AI code quality tools market
- **76% of developers use AI tools** but only **33% trust their accuracy**
- **20% of AI code includes hallucinated dependencies** - no tools detect this
- **45% of AI code contains security vulnerabilities** (72% for Java)
- **67% of devs spend MORE time debugging AI code** than writing it
- **25% of YC W2025 startups have ~95% AI-generated codebases**

## 📦 PRODUCT DEFINITION

### The One-Liner
"The reality check every AI-first founder needs before shipping, pitching, or scaling - where your hallucinated code meets hard truths."

### Core Features (MVP ONLY)
1. **AI Codebase Scanner**
   - **Hallucination Detection**: Real-time detection of non-existent packages (20% of AI code!)
   - **AI-Specific Vulnerabilities**: Prompt injection, slopsquatting, unsafe defaults
   - **Context Integrity**: Verify AI code matches architectural patterns
   - **Technical Debt Tracker**: ~9 min remediation time per AI function
   - **Multi-Model Analysis**: Which AI tool generated which code
   
2. **Business Model Validator**
   - Revenue model clarity check with AI-specific metrics
   - Market size reality check (is there a market for AI tools?)
   - Competition analysis (who else is AI-first?)
   - Unit economics calculator (including AI API costs)
   
3. **Investment Readiness Score**
   - Code quality → investment correlation
   - Key metrics: ARR per FTE, CAC payback, Bessemer Score
   - SOC 2 readiness checker (86% of orgs require it)
   - Red flags specific to AI startups

### Non-Negotiable UX Principles
- **Brutal Honesty**: No sugarcoating. Red means stop and fix.
- **60-Second Value**: User gets value within 1 minute or we failed.
- **Visual Priority**: Show, don't tell. Charts > paragraphs.
- **Mobile-First**: Founders check on phones between meetings.

## 🏗️ TECHNICAL ARCHITECTURE

### Stack Decision (Optimized for AI Analysis)
```
Frontend:
- Next.js 14+ (App Router)
- Tailwind CSS + shadcn/ui
- Framer Motion (minimal animations)
- Recharts for data viz

Backend:
- Python FastAPI (for AI model integration)
- Tree-sitter for AST parsing
- PostgreSQL + Redis
- Celery for async analysis jobs
- Multi-model AI pipeline:
  - Claude API for code review
  - OpenAI for hallucination detection
  - Custom models for AI vs human classification

Infrastructure:
- Railway/Render for MVP (avoid K8s complexity)
- GitHub API + Copilot Extensions
- VS Code Extension (75% market share)
- Docker + Docker Compose

Integrations (Priority Order):
1. GitHub Actions (primary CI/CD)
2. VS Code Extension (via LSP)
3. Claude MCP integration
4. Cursor/Copilot plugins
```

### Database Schema (Core Tables)
```sql
-- Users
- id, email, github_handle, created_at
- subscription_tier (free/pro)

-- Projects  
- id, user_id, repo_url, name
- last_scan, overall_score

-- Scans
- id, project_id, scan_type
- results_json, score, created_at

-- Feedback
- id, scan_id, user_feedback
- false_positive_flags
```

## 🚀 DEVELOPMENT PHASES

### Phase 0: Foundation (Week 1)
- [ ] Set up development environment
- [ ] Initialize Next.js + FastAPI boilerplate
- [ ] Configure Docker setup
- [ ] Set up CI/CD pipeline
- [ ] Create component library

### Phase 1: Core Scanner (Week 2-3)
- [ ] GitHub OAuth integration
- [ ] Repository cloning/analysis engine
- [ ] Basic scoring algorithms
- [ ] Results API endpoints
- [ ] Basic dashboard UI

### Phase 2: Intelligence Layer (Week 4-5)
- [ ] AI-powered code review
- [ ] Business model templates
- [ ] Competitive analysis engine
- [ ] Report generation

### Phase 3: Polish & Launch (Week 6)
- [ ] Performance optimization
- [ ] Error handling
- [ ] Analytics integration
- [ ] Beta user onboarding
- [ ] ProductHunt preparation

## 💰 BUSINESS MODEL & PRICING

### Pricing Strategy (Market-Validated)
- **Free Tier**: 1 developer, 3 scans/month, public repos only
- **Startup Tier**: $19/user/month (sweet spot), unlimited scans
- **Team Tier**: $25/user/month, priority support, custom rules
- **Enterprise**: Custom pricing >100 users

### Conversion Benchmarks
- Target 3-5% freemium conversion (industry standard)
- CAC payback: <12 months
- LTV:CAC ratio: >3:1
- Gross margin target: 65-70%

## 🎯 COMPETITIVE POSITIONING

### Direct Competitors
- **SonarQube**: $720+/year, complex setup, poor AI support
- **DeepSource**: $10/user/month, modern but no AI-specific features
- **Codacy**: $18-21/user/month, basic AI guardrails only
- **Qodo**: $19/user/month, test generation focused

### Our Moat
1. **First-mover on hallucination detection** (20% of AI code affected!)
2. **Triple assessment** (code + business + investment) - nobody else does this
3. **AI-first from day one** (not bolted on legacy architecture)
4. **Founder-focused** (not enterprise compliance theater)

## 🧠 MEMORY BANK
*Section for ongoing insights, decisions, and learnings*

### Key Decisions Log
- [DATE] - Decision: Reasoning:
- [DATE] - Pivot: From/To:

### User Feedback Patterns
- Common complaint #1:
- Feature request #1:
- Surprising use case:

### Technical Debt Tracker
- [ ] Item 1 - Priority - ETA
- [ ] Item 2 - Priority - ETA

### Competitor Moves
- [Company] - Feature launched:
- [Company] - Pricing change:

## 🚨 RISK REGISTER

### Technical Risks
1. **GitHub API Rate Limits** - Mitigation: Implement caching layer
2. **Large repo analysis timeout** - Mitigation: Background job queue
3. **AI hallucinations in analysis** - Mitigation: Rule-based validation layer

### Business Risks
1. **Copycat competition** - Mitigation: Move fast, build moat with data
2. **Platform dependency (GitHub)** - Mitigation: GitLab support in roadmap
3. **Price sensitivity** - Mitigation: Strong free tier, clear value in paid

## 📝 DAILY STANDUP TEMPLATE
```
Date: 
Yesterday: 
Today: 
Blockers: 
User feedback: 
Metric update: 
```

## 🎪 LAUNCH CHECKLIST
- [ ] Domain purchased and configured
- [ ] SSL certificates active
- [ ] Monitoring/alerting configured
- [ ] Backup strategy implemented
- [ ] Legal: Terms of Service
- [ ] Legal: Privacy Policy
- [ ] Stripe account configured
- [ ] Customer support channel ready
- [ ] Launch blog post drafted
- [ ] ProductHunt assets prepared
- [ ] Twitter/LinkedIn announcements ready
- [ ] Email to network drafted

---
*Remember: Ship fast, get feedback, iterate. Perfect is the enemy of launched.*