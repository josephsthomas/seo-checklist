# Plan: Design Defects (22 defects)

> **Priority:** P3 — Polish & Consistency
> **Impact Score:** 20/100
> **Estimated Effort:** 3-5 engineering days
> **Branch:** Create new branch from `claude/fix-qa-defects-jpa0E`

## Context

This is a React + Vite + Firebase/Firestore + TailwindCSS application ("Content Strategy Portal"). An 11-role QA review found 524 defects; 379 were fixed. This plan covers the 22 remaining **design** defects — content model issues, UX/layout decisions, taxonomy gaps, and visual consistency.

Many of these are subjective — they challenge intentional design choices. Each defect is tagged with a recommendation: **FIX** (objective improvement), **CONSIDER** (reasonable but debatable), or **CLOSE** (intentional design, no action needed).

**Source data:** All defect definitions are in `qa_reports/fix_batches.json`. Search by `bug_id` to get the full description, steps to reproduce, expected vs actual behavior.

**Key files to understand first:**
- `src/data/glossary.js` — Glossary terms and related terms
- `src/data/checklistData.js` — 353-item checklist
- `src/data/resources.js` — Resource library data
- `src/config/tools.js` — Tool definitions
- `src/config/seo.js` — SEO configuration
- `src/lib/readability/profiles/industryProfiles.js` — Industry scoring profiles
- `src/lib/readability/checks/googleAIO.js` — Google AI Overview checks
- `src/lib/readability/utils/schemaValidator.js` — Schema validation
- `src/components/readability/ReadabilityCrossToolLinks.jsx` — Cross-tool navigation
- `src/components/readability/ReadabilityCategoryChart.jsx` — Category visualization
- `src/components/readability/ReadabilityCheckItem.jsx` — Check result items
- `src/components/readability/ReadabilityHistory.jsx` — Analysis history
- `src/components/help/GlossaryPage.jsx` — Glossary display
- `src/components/help/OnboardingWalkthrough.jsx` — Onboarding flow
- `src/components/public/FeatureDetailPage.jsx` — Public feature pages
- `src/components/projects/ProjectCard.jsx` — Project list cards
- `src/hooks/useChecklistTemplates.js` — Template management
- `src/hooks/useDueDates.js` — Due date system
- `src/hooks/useReadabilityAnalysis.js` — Analysis state machine
- `src/hooks/useReadabilityExport.js` — Export utilities

---

## Phase 1: Content Model Fixes — FIX (8 defects)

These are objective bugs in data/content — broken links, wrong references, contradictory data.

### 1.1 CRITICAL — Broken cross-tool links

| Bug ID | File | Issue | Action |
|--------|------|-------|--------|
| R11-B-005 | `src/components/readability/ReadabilityCrossToolLinks.jsx` | References `/app/content-planner` and `/app/keyword-research` which don't exist | **FIX** |

**Fix approach:**
1. Read `src/components/readability/ReadabilityCrossToolLinks.jsx`
2. Find the CROSS_TOOL_LINKS constant
3. Read `src/App.jsx` to get the actual route paths
4. Update all link paths to match real routes (e.g., `/app/planner`, `/app/audit`, etc.)
5. Remove links to non-existent tools (keyword-research doesn't exist)

### 1.2 HIGH — Data inconsistencies

| Bug ID | File | Issue | Action |
|--------|------|-------|--------|
| R04-100 | `src/components/readability/ReadabilityCategoryChart.jsx` | Taxonomy key mismatch with ReadabilityCategoryAccordion | **FIX** |
| R11-A-003 | `src/data/glossary.js` | relatedTerms references terms that don't exist | **FIX** |
| R11-B-007 | `src/config/tools.js` | Feature counts contradict each other across config files | **FIX** |
| R11-B-014 | `src/components/help/GlossaryPage.jsx` | 'Related Terms' clicks set search but don't scroll to term | **FIX** |

**Fix approach for R04-100:**
1. Read both `ReadabilityCategoryChart.jsx` and `ReadabilityCategoryAccordion.jsx`
2. Identify the taxonomy key naming convention used by the scoring system
3. Align both components to use the same keys

**Fix approach for R11-A-003:**
1. Read `src/data/glossary.js`
2. For each term's `relatedTerms` array, check if the referenced term exists
3. Remove references to non-existent terms
4. Or add the missing terms if they're important

**Fix approach for R11-B-007:**
1. Read `src/config/tools.js` and `src/config/seo.js`
2. Compare feature counts and descriptions
3. Align to single source of truth (tools.js should be canonical)

**Fix approach for R11-B-014:**
1. Read `src/components/help/GlossaryPage.jsx`
2. When a related term is clicked, scroll to it using `element.scrollIntoView({ behavior: 'smooth' })`
3. Or use an anchor ID: `document.getElementById(`term-${termSlug}`)?.scrollIntoView()`

### 1.3 HIGH — Content model gaps

| Bug ID | File | Issue | Action |
|--------|------|-------|--------|
| R11-B-011 | `src/hooks/useChecklistTemplates.js` | Templates scoped to user only, no shared discovery | **FIX** |
| R11-C-011 | `src/hooks/useDueDates.js` | Only 'task', 'project', 'reminder' types, no content review | **FIX** |

**Fix approach for R11-B-011:**
1. Read `src/hooks/useChecklistTemplates.js`
2. Add `isShared` field to template schema
3. Add query for shared templates: `where('isShared', '==', true)`
4. Show "Shared Templates" section in the UI

**Fix approach for R11-C-011:**
1. Read `src/hooks/useDueDates.js`
2. Add `'content_review'` to the supported types
3. This was partially addressed — `NotificationPreferences.jsx` already has `content_review_due` type

---

## Phase 2: Content Model Fixes — CONSIDER (9 defects)

These are reasonable improvements but may not be worth the effort.

### 2.1 MEDIUM — Metadata and taxonomy improvements

| Bug ID | File | Issue | Action |
|--------|------|-------|--------|
| R11-A-007 | `src/components/public/FeatureDetailPage.jsx` | Stats claim '8 Project Phases' but system uses different count | **CONSIDER** — verify actual phase count |
| R11-A-011 | `src/data/resources.js` | Empty resource categories with no linked resources | **CONSIDER** — remove empty categories or add resources |
| R11-B-004 | `src/data/checklistData.js` | Items lack governance metadata fields | **CONSIDER** — large data change |
| R11-C-006 | `src/lib/readability/checks/contentStructure.js` | Duplicated logic with checkHeadingHierarchy | **CONSIDER** — refactor to share logic |
| R11-C-007 | `src/lib/readability/utils/schemaValidator.js` | Only 7 schema types validated | **CONSIDER** — expand (also in PLAN_SCOPE) |
| R11-C-009 | `src/lib/readability/profiles/industryProfiles.js` | Only 5 profiles, selector implies more | **CONSIDER** — add more or adjust UI |
| R11-C-012 | `src/lib/readability/checks/googleAIO.js` | 'aiSignals' casing mismatch | **FIX** — simple rename |

**Fix approach for R11-C-012:**
1. Read `src/lib/readability/checks/googleAIO.js`
2. Find the casing inconsistency
3. Align to the convention used by the parent scoring module

### 2.2 LOW — Minor metadata issues

| Bug ID | File | Issue | Action |
|--------|------|-------|--------|
| R11-A-013 | `src/components/projects/ProjectCard.jsx` | Hardcoded `completionPercentage: 0` placeholder | **CONSIDER** — calculate from actual data |
| R11-A-014 | `src/data/checklistData.js` | Inconsistent metadata fields | **CLOSE** — editorial, not a code bug |
| R11-C-014 | `src/lib/readability/checks/technicalAccess.js` | checkRobotsTxt always returns 'warn' | **FIX** (also in PLAN_SCOPE R06-208) |

---

## Phase 3: UX & Visual Design (5 defects to FIX)

Of the 18 UX defects, only 5 are objectively worth fixing. The rest are subjective layout preferences.

### 3.1 FIX — Objective improvements

| Bug ID | File | Issue | Action |
|--------|------|-------|--------|
| R03-214 | `src/lib/readability/checks/googleAIO.js` | Typo: `hasConseAnswers` should be `hasConciseAnswers` | **FIX** |
| R03-215 | `src/lib/readability/utils/urlValidation.js` | Error uses unexplained "TLD" abbreviation | **FIX** |
| R02-207 | `src/hooks/useReadabilityExport.js` | getGradeColorRGB thresholds differ from gradeMapper.js | **FIX** |
| R04-110 | `src/components/readability/ReadabilityHistory.jsx` | Sort toggle cycles field AND direction in one click | **CONSIDER** |
| R08-A-008 | `src/components/audit/dashboard/AuditDashboard.jsx` | Shared audit links have no expiration | **CONSIDER** |

**Fix approach for R03-214:**
```js
// Before:
const hasConseAnswers = ...

// After:
const hasConciseAnswers = ...
```
Update all references in the file.

**Fix approach for R03-215:**
```js
// Before:
'Invalid domain - missing TLD'

// After:
'Invalid domain - missing top-level domain (e.g., .com, .org)'
```

**Fix approach for R02-207:**
1. Read `src/hooks/useReadabilityExport.js` — find `getGradeColorRGB`
2. Read `src/lib/readability/gradeMapper.js` — find `GRADE_MAP` thresholds
3. Align the color thresholds to match

### 3.2 CLOSE — Subjective design choices (13 defects)

These should be closed as intentional design decisions:

| Bug ID | File | Issue | Reason to Close |
|--------|------|-------|-----------------|
| R04-004 | VPATReportGenerator.jsx | All criteria in single list | WCAG criteria are a flat list by nature |
| R04-008 | HomePage.jsx | Dense dashboard | Power users prefer density |
| R04-202 | useReadabilityAnalysis.js | 6 granular states | Needed for proper UX feedback |
| R04-103 | ReadabilityCheckItem.jsx | Pass items not expandable | Intentional — focus on failures |
| R04-107 | ReadabilityDashboard.jsx | Stacked blocks | Standard dashboard layout |
| R04-203 | useReadabilityExport.js | 12 export params | White-labeling requires options |
| R04-206 | useReadabilityHistory.js | Duplicate function names | API convenience pattern |
| R04-210 | industryProfiles.js | Key naming mismatch | Fix in R11-C-012 already |
| R04-212 | unifiedExportService.js | Parallel export systems | Different use cases |
| R02-108 | EmptyState.jsx | Mixed color palettes | Intentional (gray for disabled, charcoal for active) |
| R02-109 | EmptyState.jsx | Low contrast icon | Intentional — deemphasized |
| R02-212 | pdfGenerator.js | Priority text overlap | Edge case in auto-table |
| R02-213 | pdfGenerator.js | Blob URL timing | 100ms is sufficient for modern browsers |

---

## Execution Protocol

1. **Before each fix:** Read the target file AND search `qa_reports/fix_batches.json` for the `bug_id` to get full context
2. **After each phase:** Run `npx vitest run` and `npx vite build`
3. **Commit after each phase:** `git commit -m "fix: design phase N — X defects"`
4. **Push after each phase:** `git push -u origin <branch-name>`
5. **Test commands:** `npx vitest run` (593+ tests should pass), `npx vite build` (should succeed)

## Summary of Actions

| Action | Count | Defects |
|--------|-------|---------|
| **FIX** | 12 | R11-B-005, R04-100, R11-A-003, R11-B-007, R11-B-014, R11-B-011, R11-C-011, R11-C-012, R03-214, R03-215, R02-207, R11-C-014 |
| **CONSIDER** | 5 | R11-A-007, R11-A-011, R11-C-009, R04-110, R11-A-013 |
| **CLOSE** | 5 | R11-B-004, R11-C-006, R11-C-007, R11-A-014, plus 13 UX defects |

**Net actionable: ~12 fixes across ~10 files.**
