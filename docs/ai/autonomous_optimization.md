# Claude Code Autonomous Optimization - Execute This Now

**SAFETY FIRST: This will create a git commit before making ANY changes**

---

## EXECUTION INSTRUCTIONS (READ THIS)

Claude, you are about to optimize this project's token usage. Follow these rules:

1. **SAFETY CHECKPOINT - Do this FIRST:**
   - Create a git commit with all current changes: `git add -A && git commit -m "pre-optimization checkpoint"`
   - If git commit fails, STOP and ask the user to commit manually
   
2. **ACTUALLY CREATE FILES:**
   - Use create_file, str_replace, and bash tools
   - Don't just suggest changes - make them
   - Show me what you created after each phase
   
3. **MEASURE EVERYTHING:**
   - Run `/context` and `/cost` if available (skip if they fail)
   - Count tokens before/after each change
   - Show savings calculations
   
4. **STOP POINTS:**
   - After Phase 1: Show audit results, wait for "continue"
   - After Phase 2: Show optimized files, wait for "continue"
   - After any errors: STOP and report the issue

5. **SKIP IF NOT APPLICABLE:**
   - If a tool/command doesn't exist, skip it and note it
   - Focus on what you CAN do
   - Prioritize high-impact changes

---

## PHASE 0: SAFETY & AUDIT (CRITICAL - DO FIRST)

### Step 0.1: Create Safety Checkpoint
```bash
# EXECUTE THIS FIRST - NO EXCEPTIONS
git status
git add -A
git commit -m "pre-optimization checkpoint: $(date)"
git log -1 --oneline

# If this fails, STOP immediately and report the error
```

### Step 0.2: Document Current State
```bash
# Measure baseline
echo "=== BASELINE AUDIT ===" > docs/optimization-baseline.md
echo "Date: $(date)" >> docs/optimization-baseline.md
echo "" >> docs/optimization-baseline.md

# Count current CLAUDE.md size (if exists)
if [ -f "CLAUDE.md" ]; then
  WORDS=$(wc -w < CLAUDE.md)
  TOKENS=$(echo "$WORDS * 4 / 3" | bc)
  echo "Current CLAUDE.md: $WORDS words (~$TOKENS tokens)" >> docs/optimization-baseline.md
else
  echo "No CLAUDE.md found" >> docs/optimization-baseline.md
fi

# List large files
echo "" >> docs/optimization-baseline.md
echo "Large files (>50KB):" >> docs/optimization-baseline.md
find . -type f -size +50k ! -path "*/node_modules/*" ! -path "*/.git/*" -exec ls -lh {} \; 2>/dev/null | head -10 >> docs/optimization-baseline.md

cat docs/optimization-baseline.md
```

**STOP HERE** - Show me the baseline audit and git commit confirmation.

---

## PHASE 1: IMMEDIATE OPTIMIZATIONS (High Impact, Low Risk)

### Step 1.1: Create .claudeignore

**CREATE FILE: `.claudeignore`**

```gitignore
# Build artifacts and dependencies
node_modules/
.next/
dist/
build/
out/
.cache/
.turbo/
coverage/

# Environment and secrets
.env*
!.env.example
*.key
*.pem
secrets/

# Large media files
*.mp4
*.mov
*.pdf
*.zip
*.tar.gz
public/uploads/
assets/videos/

# IDE and system
.vscode/
.idea/
.DS_Store
*.swp
.cache/

# Database and migrations
**/migrations/
**/fixtures/
*.db
*.sqlite
data/raw/

# Documentation archives
docs/archive/
legacy/
deprecated/
OLD_*/

# Test artifacts
**/__snapshots__/
*.log
test-results/

# Lock files (too large)
package-lock.json
yarn.lock
pnpm-lock.yaml
```

### Step 1.2: Analyze Current CLAUDE.md

**If CLAUDE.md exists:**
1. Read the current CLAUDE.md
2. Identify:
   - Total token count
   - Redundant sections
   - Content that can move to `.claude/docs/`
   - Essential vs nice-to-have info

**If CLAUDE.md doesn't exist:**
1. Auto-detect project type (check for package.json, requirements.txt, etc.)
2. Create minimal CLAUDE.md based on detected stack

### Step 1.3: Create Optimized CLAUDE.md

**BACKUP the original first:**
```bash
if [ -f "CLAUDE.md" ]; then
  cp CLAUDE.md CLAUDE-original-backup.md
fi
```

**CREATE NEW CLAUDE.md - Keep under 5K tokens:**

```markdown
# [AUTO-DETECT PROJECT NAME from package.json or directory]

## Stack
[AUTO-DETECT from files:
- Check package.json for framework
- Check for database config files
- Check for auth packages
- Check for styling setup]

## Dev Commands
[AUTO-EXTRACT from package.json scripts or common patterns]

## Code Style
[EXTRACT from existing code patterns or use defaults:
- ES modules with destructured imports
- TypeScript strict mode (if .ts files exist)
- Functional components (if React detected)
- Tailwind for styling (if tailwind.config exists)]

## Current Focus
[EXTRACT from existing CLAUDE.md if it exists, or leave blank for user to fill]

## Known Issues
[EXTRACT from existing CLAUDE.md if it exists, or leave blank]

## Forbidden Directories
[AUTO-GENERATE based on detected build system:
- node_modules/, .next/, dist/, build/
- .env*, *.key, *.pem
- migrations/, __snapshots__/]

## Extended Docs
For detailed docs, load on-demand:
[LIST any files moved to .claude/docs/]

---
**Token count:** [CALCULATE AND SHOW]
**Optimization:** [SHOW % reduction from original]
```

### Step 1.4: Calculate Immediate Savings

```bash
# Compare before/after
echo "=== PHASE 1 RESULTS ===" > docs/phase1-results.md

if [ -f "CLAUDE-original-backup.md" ]; then
  BEFORE=$(wc -w < CLAUDE-original-backup.md | awk '{printf "%.0f", $1 * 4/3}')
  echo "Before: ~$BEFORE tokens" >> docs/phase1-results.md
fi

AFTER=$(wc -w < CLAUDE.md | awk '{printf "%.0f", $1 * 4/3}')
echo "After: ~$AFTER tokens" >> docs/phase1-results.md

if [ -f "CLAUDE-original-backup.md" ]; then
  REDUCTION=$(echo "scale=1; ($BEFORE - $AFTER) * 100 / $BEFORE" | bc)
  echo "Reduction: $REDUCTION%" >> docs/phase1-results.md
fi

echo "" >> docs/phase1-results.md
echo "Files created:" >> docs/phase1-results.md
echo "- .claudeignore (prevents 20-30% context bloat)" >> docs/phase1-results.md
echo "- Optimized CLAUDE.md" >> docs/phase1-results.md

cat docs/phase1-results.md
```

**STOP HERE** - Show me Phase 1 results and ask: "Continue to Phase 2?"

---

## PHASE 2: STRUCTURE OPTIMIZATION (Medium Impact, Low Risk)

### Step 2.1: Create .claude/ Directory Structure

```bash
# Create directories
mkdir -p .claude/commands
mkdir -p .claude/docs
mkdir -p .claude/hooks

echo "Created .claude/ directory structure"
```

### Step 2.2: Migrate Extended Documentation

**If original CLAUDE.md had extensive content:**

1. **Extract architecture details** → `.claude/docs/architecture.md`
2. **Extract API patterns** → `.claude/docs/api-patterns.md`
3. **Extract deployment info** → `.claude/docs/deployment.md`

### Step 2.3: Create Essential Custom Commands

**CREATE: `.claude/commands/quick-fix.md`**
```markdown
Fix: $ARGUMENTS

Rules:
- Minimal, surgical edits only
- Target specific line numbers
- No refactoring or style changes
- Max 2 files modified
- Preserve all formatting
```

**CREATE: `.claude/commands/batch-impl.md`**
```markdown
Implement: $ARGUMENTS

Execute in one batch:
1. Update models/schema
2. Create API endpoints
3. Add UI components
4. Write tests

No clarification loops - execute complete feature.
```

**CREATE: `.claude/commands/test-gen.md`**
```markdown
Generate tests for: $ARGUMENTS

- Follow existing test patterns
- Mock external dependencies
- Cover happy path + 2 edge cases
- Max 5 tests per function
```

### Step 2.4: Create Session Management Guide

**CREATE: `docs/claude-workflow.md`**
```markdown
# Claude Code Workflow

## Start Every Session
```bash
# Clear context
/clear

# Load minimal context
@CLAUDE.md
```

## During Development
- Check context at 40 messages: `/context`
- Compact at 70%: `/compact Focus on: current code, next steps`
- Save progress: `echo "$(date): [task]" >> docs/progress.md`

## Session Recovery
If context limit hit:
1. Save: `git add -A && git commit -m "wip"`
2. Fresh start: `/clear && @CLAUDE.md`
3. Resume: Check docs/progress.md for last state
```

### Step 2.5: Calculate Phase 2 Savings

```bash
echo "=== PHASE 2 RESULTS ===" > docs/phase2-results.md
echo "Created .claude/ structure:" >> docs/phase2-results.md
echo "- Custom commands (3): Reduce repetitive instructions 30-40%" >> docs/phase2-results.md
echo "- Documentation split: On-demand loading only" >> docs/phase2-results.md
echo "- Workflow guide: Session management best practices" >> docs/phase2-results.md

cat docs/phase2-results.md
```

**STOP HERE** - Show Phase 2 results and ask: "Continue to Phase 3?"

---

## PHASE 3: ADVANCED OPTIMIZATION (Optional - Higher Effort)

### Step 3.1: Shell Aliases

**CREATE: `docs/shell-setup.sh`**
```bash
#!/bin/bash
# Add these to your ~/.bashrc or ~/.zshrc

alias cc='claude -p "/clear"'
alias compact='claude -p "/compact Focus on current code and next steps"'
alias ccost='claude -p "/cost"'
alias cctx='claude -p "/context"'

# Usage instructions
echo "Add to ~/.bashrc: source docs/shell-setup.sh"
```

### Step 3.2: Create Monitoring Hook (if supported)

**CREATE: `.claude/hooks/usage-alert.mjs`**
```javascript
// Token usage monitoring
export default {
  onTokenThreshold: async ({ tokens, threshold }) => {
    const percentage = Math.round(tokens / threshold * 100);
    
    if (percentage > 70) {
      console.warn(`⚠️  Context at ${percentage}%`);
      console.log('💡 Run /compact or start new session');
    }
    
    if (percentage > 90) {
      console.error(`🚨 CRITICAL: ${percentage}% context used!`);
    }
  }
};
```

### Step 3.3: Create Token Budget Tracker

**CREATE: `.claude/token-budget.md`**
```markdown
# Token Budget Tracking

## Target Costs
- Daily: $1-2 (optimized from $6)
- Monthly: $30-60 (optimized from $180)

## Cost Per Operation
- Feature: $0.30-0.80
- Bug fix: $0.15-0.30
- Review: $0.10-0.20

## Warning Thresholds
- Session >$1: Review efficiency
- Day >$3: Analyze patterns
- Week >$15: Workflow changes needed

## Weekly Review
Run: `claude -p "/cost"` and document trends
```

**STOP HERE** - Show Phase 3 results.

---

## FINAL REPORT

### Generate Complete Optimization Report

```bash
echo "=== CLAUDE CODE OPTIMIZATION COMPLETE ===" > docs/optimization-report.md
echo "Date: $(date)" >> docs/optimization-report.md
echo "" >> docs/optimization-report.md

# Summary
echo "## Changes Made" >> docs/optimization-report.md
echo "1. Created .claudeignore (20-30% context reduction)" >> docs/optimization-report.md
echo "2. Optimized CLAUDE.md (<5K tokens)" >> docs/optimization-report.md
echo "3. Created .claude/ structure" >> docs/optimization-report.md
echo "4. Added custom commands (3)" >> docs/optimization-report.md
echo "5. Created workflow documentation" >> docs/optimization-report.md
echo "" >> docs/optimization-report.md

# Token savings
if [ -f "CLAUDE-original-backup.md" ]; then
  BEFORE=$(wc -w < CLAUDE-original-backup.md | awk '{printf "%.0f", $1 * 4/3}')
  AFTER=$(wc -w < CLAUDE.md | awk '{printf "%.0f", $1 * 4/3}')
  SAVED=$(echo "$BEFORE - $AFTER" | bc)
  PERCENT=$(echo "scale=1; $SAVED * 100 / $BEFORE" | bc)
  
  echo "## Token Savings" >> docs/optimization-report.md
  echo "- Before: ~$BEFORE tokens" >> docs/optimization-report.md
  echo "- After: ~$AFTER tokens" >> docs/optimization-report.md
  echo "- Saved: ~$SAVED tokens ($PERCENT%)" >> docs/optimization-report.md
fi

echo "" >> docs/optimization-report.md
echo "## Expected Cost Savings" >> docs/optimization-report.md
echo "- Daily: $4-6/day → $1-2/day" >> docs/optimization-report.md
echo "- Monthly: $120-180 → $30-60" >> docs/optimization-report.md
echo "- Savings: $90-150/month" >> docs/optimization-report.md

echo "" >> docs/optimization-report.md
echo "## Next Steps" >> docs/optimization-report.md
echo "1. Review the new CLAUDE.md and customize as needed" >> docs/optimization-report.md
echo "2. Add shell aliases from docs/shell-setup.sh" >> docs/optimization-report.md
echo "3. Start using: /clear before each new task" >> docs/optimization-report.md
echo "4. Monitor costs with: /cost command" >> docs/optimization-report.md

echo "" >> docs/optimization-report.md
echo "## Files to Review" >> docs/optimization-report.md
echo "- CLAUDE.md (optimized)" >> docs/optimization-report.md
echo "- .claudeignore (context exclusions)" >> docs/optimization-report.md
echo "- .claude/commands/ (custom commands)" >> docs/optimization-report.md
echo "- docs/claude-workflow.md (usage guide)" >> docs/optimization-report.md

cat docs/optimization-report.md
```

### Create Final Git Commit

```bash
# Commit all optimization changes
git add -A
git commit -m "optimization: Claude Code token optimization complete

- Optimized CLAUDE.md to <5K tokens
- Added .claudeignore for context control
- Created .claude/ directory structure
- Added custom commands for efficiency
- Documented workflow best practices

Expected savings: 60-90% token reduction"

git log -1 --stat
```

**Show the final git commit and optimization report.**

---

## ROLLBACK INSTRUCTIONS (If Needed)

If anything went wrong:
```bash
# Restore to pre-optimization state
git log --oneline | head -5  # Find the "pre-optimization checkpoint" commit
git reset --hard [commit-hash]  # Use the checkpoint commit hash
```

---

## SUCCESS CRITERIA

Verify these were completed:
- [ ] Git commit created BEFORE any changes
- [ ] .claudeignore exists and contains common exclusions
- [ ] CLAUDE.md is <5K tokens (~3,750 words)
- [ ] .claude/ directory structure created
- [ ] At least 3 custom commands created
- [ ] Documentation moved to on-demand loading
- [ ] Optimization report generated
- [ ] Final git commit with all changes

**Expected Results:**
- 60-90% token reduction
- $90-150/month savings
- Longer sessions (200+ messages vs 40-50)
- Faster startup times

---

## EXECUTION START

**BEGIN EXECUTION NOW:**

1. Start with Phase 0 (Safety checkpoint)
2. Execute each phase sequentially
3. Stop at each checkpoint to show results
4. If any command fails, skip and note it
5. Focus on high-impact, low-risk changes

**Type "START" to begin autonomous optimization.**
