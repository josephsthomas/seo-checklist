# QA MASTER PLAN — 11-ROLE DEEP REVIEW (HARDENED v2)

## Context
Run an 11-role QA review of the Content Strategy Portal (284 source files in `src/`). Each role audits the ENTIRE codebase, producing 35+ defects in Excel. Adjusted for these non-negotiable constraints:

1. **NO PROMPT TOO LONG** — never overflow context window
2. **NO TIMEOUTS** — must run 12+ hours unattended
3. **NO DATA LOSS** — git commit+push after every single role
4. **MAX 3 SUBAGENTS PER ROLE, 1 ROLE AT A TIME**
5. **EVERY ROLE REVIEWS EVERY FILE (all 284)**

---

## ARCHITECTURE: WHY 3 PARALLEL SUBAGENTS PER ROLE

**Problem**: One subagent reading 284 files WILL overflow its context window, even with batching. 284 files × avg 150 lines = ~42,000 lines of code. Context compression helps but isn't enough for a single agent.

**Solution**: Split the 284 files into 3 chunks. Launch 3 subagents IN PARALLEL (single message, 3 Task tool calls), each handling ~95 files. Each writes to its own JSON file. No conflicts. All 3 finish, main agent merges → Excel → git commit+push.

| Subagent | Files | Output File |
|----------|-------|-------------|
| A | files 1–95 (from manifest) | `role_XX_part_a.json` |
| B | files 96–190 | `role_XX_part_b.json` |
| C | files 191–284 | `role_XX_part_c.json` |

Each subagent processes ~95 files in batches of 5 = 19 batches. Each batch: 5 parallel Read calls (1 turn) → analyze + write defects (1 turn) = ~38 turns per subagent. Well within limits.

---

## STEP 0: SETUP

### 0.1 Create directory and install deps
```bash
mkdir -p /home/user/content-strategy-portal/qa_reports
pip install openpyxl 2>/dev/null || pip3 install openpyxl 2>/dev/null
```

### 0.2 Write helper scripts
- `qa_reports/write_defects.py` — JSON → formatted Excel converter
- `qa_reports/merge_parts.py` — merges 3 partial JSON files into one Excel

### 0.3 Generate file manifest
```bash
find /home/user/content-strategy-portal/src/ -name "*.jsx" -o -name "*.js" -o -name "*.css" | sort > qa_reports/file_manifest.txt
```

### 0.4 Write progress tracker
`qa_reports/progress.json` — tracks which roles are complete

### 0.5 Git commit+push setup
```bash
git add qa_reports/
git commit -m "QA: Setup qa_reports directory, helper scripts, and file manifest"
git push -u origin claude/optimize-prompt-timeout-3dNLw
```

---

## PER-ROLE EXECUTION PROTOCOL (Roles 1–11)

**SEQUENTIAL. Complete one role fully before starting the next.**

### For each role:

#### Phase 1: Launch 3 subagents in parallel
Each handles ~95 files. Reads in batches of 5. Writes defects to `role_XX_part_[abc].json` after every batch.

#### Phase 2: Merge + Verify
Merge 3 partial JSONs → single Excel. Verify 35+ defects.

#### Phase 3: Recovery (only if under 35)
Launch one more subagent on high-value files for that role.

#### Phase 4: Git commit + push
With exponential backoff retry on push.

#### Phase 5: Update progress tracker

---

## ROLE DEFINITIONS

| # | Role | Focus | Categories | Prefix |
|---|------|-------|------------|--------|
| 01 | Lead React Developer | Code quality, React anti-patterns, state bugs, hooks, memory leaks, race conditions, stale closures, missing keys, unhandled promises | React Anti-Pattern, State Bug, Memory Leak, Race Condition, Missing Error Handling, Performance Bug, Prop Issue, Hook Misuse | R01 |
| 02 | Visual Designer | UI inconsistency, spacing, colors, dark mode, responsive, z-index, animation, typography, visual hierarchy | Spacing Issue, Color Inconsistency, Typography Bug, Dark Mode Bug, Responsive Issue, Z-Index Conflict, Animation Bug, Visual Hierarchy | R02 |
| 03 | Copywriter | Microcopy, grammar/spelling, tone, CTAs, placeholder text, labels, jargon, terminology consistency, truncation | Grammar/Spelling, Tone Inconsistency, Unclear CTA, Missing Label, Jargon, Placeholder Left In, Truncation, Terminology Inconsistency | R03 |
| 04 | Content Designer | IA, navigation labeling, taxonomy, content grouping, progressive disclosure, scannability, cognitive load | IA Problem, Navigation Gap, Taxonomy Issue, Progressive Disclosure, Cognitive Overload, Content Grouping, Labeling Issue | R04 |
| 05 | Accessibility Strategist | WCAG 2.2 AA, ARIA, keyboard nav, focus management, contrast, semantic HTML, form a11y, focus traps | ARIA Missing, Keyboard Nav Gap, Focus Management, Color Contrast, Semantic HTML, Screen Reader, Form A11y, Focus Trap | R05 |
| 06 | SEO Strategist | Meta tags, schema markup, heading hierarchy, canonical, OG/Twitter cards, sitemap, internal links, URL structure | Meta Tag Issue, Schema Error, Heading Hierarchy, Canonical Issue, Social Cards, Sitemap Gap, Internal Links, URL Structure | R06 |
| 07 | Generative AI Strategist | LLM integration, prompt engineering, AI output handling, hallucination risk, token mgmt, API errors, disclaimers, confidence indicators | Prompt Issue, AI Error Handling, Hallucination Risk, Token Management, Missing Disclaimer, Confidence Gap, Model Selection, Output Validation | R07 |
| 08 | SVP Project Management | Feature completeness, scope gaps, CRUD ops, workflow dead-ends, data integrity, permissions, audit trail, lifecycle | Scope Gap, Missing Feature, Data Integrity, Permission Issue, Workflow Gap, Audit Trail, Lifecycle Issue, Risk | R08 |
| 09 | SVP Integrated Production | Build config, deploy readiness, env vars, bundle size, code splitting, lazy loading, caching, error logging, deps, CI/CD | Build Issue, Deploy Risk, Bundle Size, Code Splitting, Caching Gap, Error Logging, Monitoring Gap, Dependency Risk, Environment Issue | R09 |
| 10 | SVP User Experience | User flows, empty states, loading states, error states, form validation UX, unsaved changes, onboarding, navigation, edge cases | Missing Empty State, Missing Loading State, Missing Error State, Form UX Issue, Navigation Dead-End, Feedback Gap, Onboarding Gap, Edge Case, Flow Break, Undo Missing | R10 |
| 11 | SVP Content Strategy | Content model, content types, taxonomy/tagging, lifecycle mgmt, editorial workflow, governance, content reuse, metadata, glossary | Content Model Issue, Taxonomy Gap, Lifecycle Issue, Governance Gap, Content Reuse, Metadata Issue, Terminology, Content Relationship, Editorial Workflow | R11 |

---

## EXCEL FILE FORMAT

Each role's Excel file has these columns:
| Column | Header | Description |
|--------|--------|-------------|
| A | Bug ID | R[role#]-[seq] |
| B | Role | Persona name |
| C | Severity | CRITICAL / HIGH / MEDIUM / LOW |
| D | Category | Defect category |
| E | Component | React component name |
| F | File:Line | Exact source location |
| G | Description | What is wrong |
| H | Steps to Reproduce | How to trigger |
| I | Expected Behavior | What should happen |
| J | Actual Behavior | What actually happens |
| K | Impact | Who/what is affected |
| L | Status | Always "OPEN" |

---

## FINAL STEPS

### Step 12: Merge all into master report
`QA_Master_Report_All_Roles.xlsx` with Executive Summary + All Defects + 11 role sheets.

### Step 13: Final commit + push
All reports committed and pushed.

### Step 14: Final verification
Verify all 11 files have 35+ defects, master report exists, 385+ total.
