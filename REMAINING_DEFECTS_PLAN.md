# Remaining QA Defects — Implementation Plan

> **Current Status:** 379/524 fixed (72.3%) | 145 remaining | 593 tests passing | Build clean
> **Branch:** `claude/fix-qa-defects-jpa0E`
> **Last Updated:** 2026-02-20

---

## Executive Summary

An 11-role deep QA review identified 524 defects across 170 files. 379 have been fixed. Of the 145 remaining, **none are CRITICAL severity** — all 15 critical defects were resolved. The remaining defects break down into 6 workstreams, ordered by impact and feasibility.

### Remaining Defects by Category

| Category | Count | Severities | Effort | Priority |
|----------|-------|-----------|--------|----------|
| **Architecture & Permissions** | 23 | 7 HIGH, 16 MED | Large | P0 — Security |
| **Feature Gaps** | 30 | 4 HIGH, 18 MED, 8 LOW | Large | P1 — Product |
| **Scope / DevOps / SSR** | 54 | 4 HIGH, 26 MED, 24 LOW | Mixed | P2 — Infrastructure |
| **Design Decisions** | 20 | 2 HIGH, 10 MED, 8 LOW | Small-Med | P3 — Polish |
| **Invalid / Already Fixed** | 18 | 1 HIGH, 4 MED, 13 LOW | None | N/A — Close |

---

## Workstream 1: Architecture & Permissions (P0 — Security)

**Why P0:** These defects represent genuine security and data integrity risks. RBAC is defined but inconsistently enforced, meaning users could potentially access or modify data beyond their role.

### 1.1 RBAC Enforcement (7 defects)

The permission system (`src/utils/roles.js`) defines `ROLE_PERMISSIONS` and `hasPermission()`, but enforcement is inconsistent across the app.

| Defect | Severity | File | Issue |
|--------|----------|------|-------|
| R08-C-007 | HIGH | Multiple files | RBAC permission system defined but unenforced in many CRUD operations |
| R11-C-005 | HIGH | Content tools | Missing content governance permissions — any user can edit/delete any content |
| R08-A-002 | HIGH | TimeTracker | No ownership check — users can view/edit others' time entries |
| R04-C-003 | HIGH | Firestore writes | No server-side validation — client-side permission checks can be bypassed |
| R04-C-005 | MEDIUM | Project CRUD | Delete operations lack ownership verification |
| R11-C-003 | MEDIUM | Audit results | No permission check before viewing/exporting audit data |
| R17-xxx | MEDIUM | roles.js | Privilege escalation possible via direct Firestore writes |

**Implementation Plan:**

```
Phase 1: Audit all Firestore write paths (1-2 days)
  - Grep for db.collection, setDoc, updateDoc, deleteDoc, addDoc
  - Map each to the required permission from ROLE_PERMISSIONS
  - Identify which are missing hasPermission() checks

Phase 2: Add client-side guards (2-3 days)
  - Wrap every Firestore mutation with hasPermission() check
  - Add ownership checks: compare currentUser.uid against document owner
  - Pattern: if (!hasPermission(userRole, 'canDeleteProjects') || doc.ownerId !== currentUser.uid) return;
  - Add user-facing error toast for denied actions

Phase 3: Firestore Security Rules (2-3 days)
  - Write/update firestore.rules to enforce server-side:
    - Role-based write access per collection
    - Document ownership validation
    - Field-level validation (prevent role escalation)
  - Test with Firebase emulator

Phase 4: UI guards (1 day)
  - Hide/disable buttons the user doesn't have permission for
  - Add "Insufficient permissions" empty states where needed
```

**Key Files:**
- `src/utils/roles.js` — Permission matrix (already exists)
- `firestore.rules` — Server-side enforcement (needs creation/update)
- All components with Firestore mutations

### 1.2 Content Governance & Retention (5 defects)

| Defect | Severity | File | Issue |
|--------|----------|------|-------|
| R11-C-004 | HIGH | retentionPolicy.js | Content retention policies defined but not enforced |
| R06-209 | HIGH | schemaValidator.js | Schema validator only covers 7 types but 40+ exist |
| R04-C-008 | MEDIUM | Firestore | No cascade delete — deleting a project orphans its items, comments, files |
| R04-C-010 | MEDIUM | Firestore | Batch operations can exceed Firestore 500-op limit |
| R12-xxx | MEDIUM | storageHelpers.js | No cleanup of orphaned storage files |

**Implementation Plan:**

```
Phase 1: Cascade delete logic (2 days)
  - Create deleteProjectWithCascade() utility
  - Delete: project → checklist items → comments → time entries → files
  - Use batched writes with 500-op chunking
  - Add rollback on partial failure

Phase 2: Retention enforcement (1-2 days)
  - Create scheduled function or client-side check for content age
  - Add "content review due" notifications (infrastructure exists in NotificationPreferences)
  - Warn before accessing stale content

Phase 3: Schema validator expansion (2-3 days)
  - Extend schemaValidator.js to cover all 40+ schema.org types
  - Add validation rules for required fields per type
  - Add warnings for recommended fields

Phase 4: Storage cleanup (1 day)
  - Add orphan detection for Firebase Storage files
  - Create cleanup utility (manual trigger, not automatic)
```

### 1.3 Data Integrity (3 defects)

| Defect | Severity | File | Issue |
|--------|----------|------|-------|
| R04-C-001 | MEDIUM | Various | Optimistic UI updates without rollback on failure |
| R04-C-002 | MEDIUM | Various | No input validation at Firestore write boundaries |
| R04-C-006 | MEDIUM | Batch exports | Large exports can OOM — no streaming/chunking |

**Implementation Plan:**

```
- Add try/catch with state rollback for optimistic updates
- Add validation schemas (Zod or manual) at write boundaries
- Chunk large exports (ExcelJS, jsPDF) into streaming operations
```

**Estimated total for Workstream 1: 10-15 engineering days**

---

## Workstream 2: Feature Gaps (P1 — Product)

These were flagged as bugs but are actually missing features that users would expect in a production app.

### 2.1 Undo / Recovery (5 defects)

| Defect | Severity | File | Issue |
|--------|----------|------|-------|
| R04-F-001 | HIGH | Project delete | No undo for project deletion (ScheduledAudits has undo but Projects doesn't) |
| R04-F-002 | MEDIUM | Checklist | No undo for bulk status changes |
| R04-F-003 | MEDIUM | Various | No revision history for content edits |
| R12-F-001 | MEDIUM | Various | No draft/autosave for long forms |
| R12-F-002 | LOW | Various | No conflict resolution for concurrent edits |

**Implementation Plan:**

```
Phase 1: Soft delete pattern (2 days)
  - Add deletedAt field instead of hard deletes
  - Add "Recently Deleted" section with 30-day retention
  - Add "Restore" action

Phase 2: Undo toast pattern (1 day)
  - Reuse the ScheduledAuditsPanel pattern: toast with 5-second undo
  - Apply to: project delete, bulk operations, checklist item delete

Phase 3: Autosave (2 days)
  - Add debounced autosave (2-second delay) for long-form inputs
  - Store drafts in localStorage with user ID key
  - Show "Draft saved" indicator
  - Restore draft on page revisit
```

### 2.2 Time Tracking & Workflow (4 defects)

| Defect | Severity | File | Issue |
|--------|----------|------|-------|
| R08-F-001 | MEDIUM | TimeTracker | No ability to edit submitted time entries |
| R08-F-002 | MEDIUM | TimeTracker | No time entry approval workflow |
| R08-F-003 | LOW | TimeTracker | No export of time data to CSV |
| R12-F-003 | LOW | Assignments | No workload view across projects |

**Implementation Plan:**

```
- Add edit mode to TimeTracker entries (inline editing)
- Add "Approve" action for project managers (tie to canManageProject permission)
- Add CSV export button using existing export patterns
- Workload view: defer to v2 (requires aggregation across collections)
```

### 2.3 Sharing & Collaboration (5 defects)

| Defect | Severity | File | Issue |
|--------|----------|------|-------|
| R08-F-004 | MEDIUM | Share links | No expiration on shared report links |
| R08-F-005 | LOW | Share links | No password protection for shared links |
| R08-F-006 | LOW | Comments | No @mention notifications |
| R08-F-007 | LOW | Activity | No real-time updates (polling only) |
| R08-F-008 | LOW | Team | No team invitation flow |

**Implementation Plan:**

```
Phase 1: Share link expiration (1 day)
  - Add expiresAt field to shared link documents
  - Add expiry selector UI (24h, 7d, 30d, never)
  - Check expiry on shared link access

Phase 2: @mentions (2 days)
  - Add mention detection in comment input (regex: @username)
  - Create notification on mention
  - Highlight mentions in rendered comments

Phase 3: Defer to v2
  - Password-protected shares
  - Real-time via Firestore onSnapshot (already available)
  - Team invitation flow
```

### 2.4 Audit Trail & Monitoring (6 defects)

| Defect | Severity | File | Issue |
|--------|----------|------|-------|
| R02-F-001 | HIGH | Various | No audit trail for destructive operations |
| R04-F-004 | MEDIUM | ErrorBoundary | Error reporting only logs in dev, no production monitoring |
| R10-F-001 | MEDIUM | Various | No client-side performance monitoring |
| R10-F-002 | LOW | Various | No feature usage analytics |
| R14-F-001 | LOW | Various | No API request caching strategy |
| R14-F-002 | LOW | Various | No offline support |

**Implementation Plan:**

```
Phase 1: Audit trail (2-3 days)
  - Create auditLog collection in Firestore
  - Log: action, userId, timestamp, targetId, targetType, details
  - Add logAuditEvent() utility
  - Hook into: delete, permission change, export, share actions

Phase 2: Error monitoring (1 day)
  - Update ErrorBoundary to send errors to a monitoring service
  - Options: Sentry (recommended), LogRocket, or custom endpoint
  - Add componentDidCatch reporting with user context

Phase 3: Defer to v2
  - Performance monitoring (Web Vitals)
  - Feature analytics
  - API caching (React Query or SWR)
  - Offline support (service worker)
```

### 2.5 Other Feature Requests (10 defects)

| Defect | Severity | File | Issue |
|--------|----------|------|-------|
| R06-F-001 | MEDIUM | Readability | No comparison view between analyses |
| R06-F-002 | MEDIUM | Schema Gen | No schema validation against Google's testing tool |
| R09-F-001 | MEDIUM | Accessibility | No VPAT export completion tracking |
| R09-F-002 | LOW | Meta Gen | No bulk import from CSV/sitemap |
| R09-F-003 | LOW | Image Alt | No integration with cloud storage (S3, GCS) |
| R13-F-001 | LOW | Various | No keyboard shortcut customization |
| R13-F-002 | LOW | Various | No print stylesheet |
| R14-F-003 | LOW | Dashboard | No customizable dashboard widgets |
| R14-F-004 | LOW | Various | No data import/migration tool |
| R15-F-001 | LOW | Various | No multi-language support (i18n) |

**Recommendation:** Prioritize these as a product backlog. The comparison view (R06-F-001) and bulk import (R09-F-002) are the highest user-value items.

**Estimated total for Workstream 2: 12-18 engineering days**

---

## Workstream 3: Infrastructure & DevOps (P2)

These defects relate to build tooling, deployment, SSR, and environment configuration.

### 3.1 SEO / SSR Concerns (6 defects)

| Defect | Severity | File | Issue |
|--------|----------|------|-------|
| R06-S-001 | HIGH | Various | SEOHead relies on react-helmet-async which only works client-side — crawlers may not see meta tags |
| R06-S-002 | MEDIUM | Auth pages | Login/Register pages need server-rendered meta for social sharing |
| R06-S-003 | MEDIUM | Public pages | Public marketing pages need pre-rendering for SEO |
| R06-S-004 | LOW | sitemap.xml | No dynamic sitemap generation |
| R06-S-005 | LOW | robots.txt | Static robots.txt doesn't list sitemap URL |
| R06-S-006 | LOW | Various | No structured data testing in CI |

**Implementation Plan:**

```
Option A: Pre-rendering (Recommended for SPA)
  - Use vite-plugin-ssr or prerender-spa-plugin
  - Pre-render: /, /about, /features/*, /help/*, /login, /register
  - Generates static HTML with meta tags for crawlers
  - No server required, works with static hosting (Vercel, Netlify)
  - Estimated: 2-3 days

Option B: Full SSR migration
  - Migrate to Next.js or Remix
  - Full server rendering for all pages
  - Estimated: 2-4 weeks (major refactor)

Recommendation: Option A for now, consider Option B for v2.

Additional:
  - Add sitemap.xml generation script (1 day)
  - Update robots.txt with sitemap reference
  - Add schema validation to CI via structured-data-testing-tool
```

### 3.2 Build & Deployment (7 defects)

| Defect | Severity | File | Issue |
|--------|----------|------|-------|
| R05-S-001 | MEDIUM | package.json | Dependencies not pinned — potential supply chain risk |
| R05-S-002 | MEDIUM | CI/CD | No automated accessibility testing in CI |
| R05-S-003 | LOW | vite.config.js | No bundle analysis in CI (size regression detection) |
| R05-S-004 | LOW | package.json | No security audit in CI (npm audit) |
| R05-S-005 | LOW | .env | Environment variables not validated at startup |
| R10-S-001 | LOW | Various | No lighthouse CI integration |
| R10-S-002 | LOW | Various | No visual regression testing |

**Implementation Plan:**

```
Phase 1: Dependency security (1 day)
  - Pin all dependencies in package.json (remove ^ and ~)
  - Add npm audit to CI pipeline
  - Add Dependabot or Renovate for controlled updates

Phase 2: CI quality gates (2 days)
  - Add axe-core accessibility testing to Vitest (test render + check a11y)
  - Add bundle size check (bundlesize or size-limit package)
  - Add Lighthouse CI for performance/SEO/a11y scores

Phase 3: Environment validation (0.5 days)
  - Create src/config/env.js that validates required VITE_* vars at startup
  - Throw clear error if Firebase config is missing
  - Add .env.example with all required variables documented
```

### 3.3 Performance Optimizations (5 defects)

| Defect | Severity | File | Issue |
|--------|----------|------|-------|
| R10-P-001 | MEDIUM | Large components | Some components re-render unnecessarily (missing React.memo) |
| R10-P-002 | LOW | Images | No image optimization pipeline (WebP, lazy loading) |
| R10-P-003 | LOW | Fonts | No font subsetting or preloading |
| R10-P-004 | LOW | CSS | Tailwind purge may miss dynamic class names |
| R10-P-005 | LOW | Various | No request deduplication for Firestore reads |

**Implementation Plan:**

```
- Add React.memo to heavy list item components (1 day)
- Add loading="lazy" to images below the fold (0.5 days)
- Add font-display: swap and preload for primary font (0.5 days)
- Audit dynamic Tailwind classes — use static class maps (already done in ScheduledAuditsPanel)
- Consider react-query or SWR for Firestore read caching (2 days, v2)
```

**Estimated total for Workstream 3: 8-12 engineering days**

---

## Workstream 4: Editorial & Terminology (P3)

These are copy, naming, and consistency issues across the UI.

### 4.1 Terminology Standardization (12 defects)

| Defect | Severity | File | Issue |
|--------|----------|------|-------|
| R03-T-001 | MEDIUM | Various | "Meta Data Generator" vs "Meta Generator" inconsistency |
| R03-T-002 | MEDIUM | Various | "Structured Data Generator" vs "Schema Markup Generator" |
| R03-T-003 | MEDIUM | Various | "AI Readability Checker" vs "Readability Analyzer" |
| R03-T-004 | LOW | Various | "Content Planner" vs "Project Planner" in different contexts |
| R03-T-005 | LOW | Various | Technical jargon in user-facing strings (e.g., "WCAG 2.2 AA") |
| R03-T-006 | LOW | Help pages | Inconsistent voice (some formal, some casual) |
| R03-T-007 | LOW | Various | Button labels inconsistent ("Go Home" vs "Back to Dashboard") |
| R03-T-008 | LOW | Error messages | Error messages expose technical details |
| R03-T-009 | LOW | Various | Inconsistent date formats across pages |
| R03-T-010 | LOW | Various | "LLM" still appears in a few user-facing strings |
| R03-T-011 | LOW | tooltips.js | Some tooltips reference outdated feature names |
| R03-T-012 | LOW | resources.js | Resource descriptions contain SEO jargon unexplained |

**Implementation Plan:**

```
Phase 1: Create content style guide (0.5 days)
  - Document canonical tool names in a STYLE_GUIDE.md
  - Canonical names: "Content Planner", "Technical Audit", "Accessibility Analyzer",
    "Meta Data Generator", "Schema Generator", "Image Alt Generator", "AI Readability Checker"
  - Define voice guidelines (professional but approachable)

Phase 2: Global find-and-replace (1 day)
  - Standardize all tool references to canonical names
  - Replace remaining "LLM" → "AI" in user-facing strings
  - Normalize error messages to hide technical details

Phase 3: Date format standardization (0.5 days)
  - Use formatDate() from dateHelpers.js everywhere
  - Consistent format: "Jan 15, 2026" for dates, "2 hours ago" for recency
```

### 4.2 Accessibility Text (8 defects)

| Defect | Severity | File | Issue |
|--------|----------|------|-------|
| R02-S-001 | MEDIUM | Various | Some color-only indicators lack text alternatives |
| R02-S-002 | LOW | Various | Some interactive elements missing visible focus indicators |
| R05-A-001 | LOW | Various | Some screen reader announcements are too verbose |
| R05-A-002 | LOW | Various | Skip navigation link missing |
| R05-A-003 | LOW | Various | Heading hierarchy violations (h1 → h3 skipping h2) |
| R05-A-004 | LOW | Dark mode | Some color contrast ratios fail WCAG AA in dark mode |
| R05-A-005 | LOW | Various | Missing landmark roles on some sections |
| R16-A-001 | LOW | Various | Focus traps don't restore focus on modal close |

**Implementation Plan:**

```
Phase 1: Skip nav + landmarks (0.5 days)
  - Add "Skip to main content" link in App.jsx
  - Add role="main", role="navigation", role="banner" to layout sections

Phase 2: Focus management (1 day)
  - Ensure all modals restore focus to trigger element on close
  - Add visible focus rings (already mostly done with Tailwind focus:ring-*)
  - Audit heading hierarchy

Phase 3: Contrast audit (1 day)
  - Run axe-core on all pages in dark mode
  - Fix any WCAG AA contrast failures
  - Add text alternatives to color-only indicators
```

**Estimated total for Workstream 4: 4-5 engineering days**

---

## Workstream 5: Design Decision Reviews (P3)

These were skipped because they challenged intentional design choices, but some are worth reconsidering.

### Worth Reconsidering (10 defects)

| Defect | Severity | File | Issue | Recommendation |
|--------|----------|------|-------|----------------|
| R02-D-001 | HIGH | Dark mode | Dark mode processing screen has no dark variant | **Fix** — dark mode should be consistent |
| R02-D-002 | HIGH | Color palette | Some tool colors don't meet WCAG contrast | **Fix** — accessibility requirement |
| R07-D-001 | MEDIUM | Schema output | JSON-LD output uses 2-space indent (not configurable) | Consider — add indent option |
| R07-D-002 | MEDIUM | Meta gen | SERP preview doesn't show favicon | Nice-to-have |
| R13-D-001 | MEDIUM | Forms | No field-level validation feedback (only on submit) | **Fix** — UX best practice |
| R13-D-002 | MEDIUM | Forms | Required fields not visually marked | **Fix** — a11y requirement |
| R15-D-001 | LOW | Navigation | Breadcrumbs inconsistent across pages | Consider |
| R15-D-002 | LOW | Cards | Card hover effects inconsistent | Polish |
| R15-D-003 | LOW | Loading | Different loading spinner styles across pages | Polish |
| R15-D-004 | LOW | Empty states | Empty state illustrations inconsistent | Polish |

### Close As Intended (10 defects)

These represent valid design decisions and should be closed:

- API response format choices (returning arrays vs objects)
- CSS animation preferences (subtle vs none)
- Color palette choices for non-contrast-critical elements
- Layout choices (sidebar vs tabs)
- Data display format preferences

**Estimated total for Workstream 5: 2-3 engineering days (only "Fix" items)**

---

## Workstream 6: Invalid / Duplicate (Close — No Action)

18 defects that should be closed without action:

- **Already fixed (4):** Issues that were addressed in the same batch or by a different defect
- **"Meta Data" terminology (4):** Flagged as inconsistent but "Meta Data Generator" is the established canonical name across the codebase and seo.js config
- **Code doesn't exist (5):** Line numbers or code patterns described in the defect don't match the actual file
- **Duplicates (3):** Same issue reported by different QA roles
- **Correct behavior (2):** The described "bug" is actually the intended behavior

**Action:** Close all 18 in the issue tracker with appropriate resolution notes.

---

## Implementation Roadmap

### Sprint 1 (Week 1-2): Security & Data Integrity
- [ ] **Workstream 1.1:** RBAC enforcement across all Firestore mutations
- [ ] **Workstream 1.2:** Cascade delete + Firestore batch chunking
- [ ] **Workstream 1.3:** Optimistic update rollbacks
- **Deliverable:** All HIGH-severity architecture defects resolved
- **Effort:** 10-15 days

### Sprint 2 (Week 3-4): Infrastructure & Quality
- [ ] **Workstream 3.1:** Pre-rendering for public pages
- [ ] **Workstream 3.2:** CI quality gates (a11y, bundle size, security)
- [ ] **Workstream 3.3:** Performance quick wins (React.memo, lazy images)
- **Deliverable:** SEO-ready public pages, automated quality checks
- **Effort:** 8-12 days

### Sprint 3 (Week 5-6): User Experience
- [ ] **Workstream 2.1:** Soft delete + undo pattern
- [ ] **Workstream 2.2:** Time entry editing + approval
- [ ] **Workstream 2.3:** Share link expiration
- [ ] **Workstream 5 (Fix items):** Form validation, contrast, dark mode gaps
- **Deliverable:** Polished user workflows, design consistency
- **Effort:** 8-12 days

### Sprint 4 (Week 7-8): Monitoring & Polish
- [ ] **Workstream 2.4:** Audit trail + error monitoring
- [ ] **Workstream 4:** Terminology standardization + a11y text
- [ ] **Workstream 6:** Close invalid defects
- **Deliverable:** Production monitoring, consistent copy, clean issue tracker
- **Effort:** 6-8 days

### Backlog (v2)
- Full SSR migration (Next.js/Remix)
- Offline support
- Real-time collaboration (Firestore onSnapshot)
- Multi-language (i18n)
- Custom dashboard widgets
- Cloud storage integrations
- Visual regression testing

---

## Metrics & Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| Defects fixed | 379/524 (72.3%) | 490+/524 (93%+) |
| HIGH severity remaining | 18 | 0 |
| Test coverage | 593 tests passing | 650+ (add a11y + permission tests) |
| Lighthouse SEO (public) | N/A (SPA) | 95+ (with pre-rendering) |
| Lighthouse Accessibility | N/A | 95+ |
| WCAG AA compliance | Partial | Full |
| Bundle size | Multiple >500KB chunks | All <500KB |

---

## Key Technical Decisions Needed

1. **Error monitoring service:** Sentry (recommended), LogRocket, or custom?
2. **Pre-rendering approach:** vite-plugin-ssr vs prerender-spa-plugin vs full SSR?
3. **Caching strategy:** React Query, SWR, or manual?
4. **Audit trail storage:** Same Firestore DB or separate analytics service?
5. **CI platform:** GitHub Actions (assumed), Vercel CI, or other?

---

*Generated from QA analysis of 524 defects across 170 files. 379 fixed, 145 remaining. All 15 CRITICAL defects resolved. See `qa_reports/fix_batches.json` for full defect details and `qa_reports/fix_summary.json` for batch-by-batch breakdown.*
