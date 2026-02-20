# QA MASTER PLAN — 11-ROLE DEEP REVIEW (HARDENED v3)

## Context
11-role QA review of Content Strategy Portal (284 files in `src/`). Each role audits the ENTIRE codebase, producing 35+ defects in Excel.

## Non-Negotiable Constraints
1. NO PROMPT TOO LONG — never overflow context
2. NO TIMEOUTS — runs 12+ hours unattended
3. NO DATA LOSS — git commit+push after every role
4. MAX 3 SUBAGENTS PER ROLE, 1 ROLE AT A TIME
5. EVERY ROLE REVIEWS EVERY FILE

---

## ARCHITECTURE

Split 284 files into 3 chunks. Launch 3 subagents IN PARALLEL per role. Each reads its chunk file from disk (not inline in prompt). Each writes defects to its own JSON file via the Write tool. Main agent merges → Excel → git.

| Subagent | Chunk File | Output |
|----------|-----------|--------|
| A | `qa_reports/chunk_a.txt` (files 1-95) | `role_XX_part_a.json` |
| B | `qa_reports/chunk_b.txt` (files 96-190) | `role_XX_part_b.json` |
| C | `qa_reports/chunk_c.txt` (files 191-284) | `role_XX_part_c.json` |

---

## STEP 0: SETUP (ALREADY DONE)
- qa_reports/ directory created
- openpyxl installed
- write_defects.py written
- merge_parts.py written
- file_manifest.txt generated (284 files)
- progress.json initialized
- Chunk files written (chunk_a.txt, chunk_b.txt, chunk_c.txt)
- All committed and pushed

---

## STEP 0.5: DRY RUN
Before role 1, test full pipeline with 3 files:
1. Launch 1 subagent reading 3 files, writing 3 test defects to `role_00_part_a.json`
2. Run merge_parts.py on it
3. Verify Excel output
4. Delete test files
5. If pipeline works → proceed. If not → fix before starting.

---

## PER-ROLE EXECUTION PROTOCOL

For each of the 11 roles:

### Phase 1: Launch 3 subagents in parallel
Each subagent:
- Reads its chunk file from disk to get file list
- Reads source files in batches of 3 (3 parallel Read calls per turn)
- After each batch: uses Write tool to save accumulated defects as JSON
- Targets 12+ defects from its ~95 files
- Returns 1 line: "DONE: N defects written to role_XX_part_Y.json"
- max_turns: 100

### Phase 2: Verify + Merge
```bash
python3 qa_reports/merge_parts.py ROLE_NUM "ROLE_NAME" "qa_reports/role_XX_name.xlsx" "role_XX_part"
```
Verify 35+ defects in Excel.

### Phase 3: Recovery (only if <35 defects)
Launch 1 recovery subagent targeting high-value files for that role.

### Phase 4: Git commit + push
```bash
git add qa_reports/ && git commit -m "QA: Role XX complete — YY defects"
git push -u origin claude/optimize-prompt-timeout-3dNLw
```
Retry push up to 4 times with exponential backoff.

### Phase 5: Update progress.json

---

## ROLE DEFINITIONS

| # | Role | Focus | Categories | Prefix |
|---|------|-------|------------|--------|
| 01 | Lead React Developer | Code quality, React anti-patterns, state bugs, hooks, memory leaks, race conditions | React Anti-Pattern, State Bug, Memory Leak, Race Condition, Missing Error Handling, Performance Bug, Prop Issue, Hook Misuse | R01 |
| 02 | Visual Designer | UI inconsistency, spacing, colors, dark mode, responsive, z-index | Spacing Issue, Color Inconsistency, Typography Bug, Dark Mode Bug, Responsive Issue, Z-Index Conflict, Animation Bug, Visual Hierarchy | R02 |
| 03 | Copywriter | Microcopy, grammar, tone, CTAs, placeholder text, labels, jargon | Grammar/Spelling, Tone Inconsistency, Unclear CTA, Missing Label, Jargon, Placeholder Left In, Truncation, Terminology Inconsistency | R03 |
| 04 | Content Designer | IA, navigation, taxonomy, content grouping, progressive disclosure | IA Problem, Navigation Gap, Taxonomy Issue, Progressive Disclosure, Cognitive Overload, Content Grouping, Labeling Issue | R04 |
| 05 | Accessibility Strategist | WCAG 2.2 AA, ARIA, keyboard nav, focus, contrast, semantic HTML | ARIA Missing, Keyboard Nav Gap, Focus Management, Color Contrast, Semantic HTML, Screen Reader, Form A11y, Focus Trap | R05 |
| 06 | SEO Strategist | Meta tags, schema, headings, canonical, OG cards, sitemap, URLs | Meta Tag Issue, Schema Error, Heading Hierarchy, Canonical Issue, Social Cards, Sitemap Gap, Internal Links, URL Structure | R06 |
| 07 | Generative AI Strategist | LLM integration, prompts, hallucination risk, token mgmt, disclaimers | Prompt Issue, AI Error Handling, Hallucination Risk, Token Management, Missing Disclaimer, Confidence Gap, Model Selection, Output Validation | R07 |
| 08 | SVP Project Management | Feature completeness, CRUD, workflows, permissions, data integrity | Scope Gap, Missing Feature, Data Integrity, Permission Issue, Workflow Gap, Audit Trail, Lifecycle Issue, Risk | R08 |
| 09 | SVP Integrated Production | Build config, deploy readiness, bundle size, code splitting, deps | Build Issue, Deploy Risk, Bundle Size, Code Splitting, Caching Gap, Error Logging, Monitoring Gap, Dependency Risk, Environment Issue | R09 |
| 10 | SVP User Experience | User flows, empty/loading/error states, form UX, edge cases | Missing Empty State, Missing Loading State, Missing Error State, Form UX Issue, Navigation Dead-End, Feedback Gap, Onboarding Gap, Edge Case, Flow Break, Undo Missing | R10 |
| 11 | SVP Content Strategy | Content model, taxonomy, lifecycle, governance, metadata, glossary | Content Model Issue, Taxonomy Gap, Lifecycle Issue, Governance Gap, Content Reuse, Metadata Issue, Terminology, Content Relationship, Editorial Workflow | R11 |

---

## FINAL STEPS

### Step 12: Merge all into master report
### Step 13: Final commit + push
### Step 14: Final verification (all 11 files have 35+ defects, 385+ total)
