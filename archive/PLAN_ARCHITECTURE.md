# Plan: Architecture Defects (78 defects)

> **Priority:** P0 — Security & Data Integrity
> **Impact Score:** 85/100
> **Estimated Effort:** 10-15 engineering days
> **Branch:** Create new branch from `claude/fix-qa-defects-jpa0E`

## Context

This is a React + Vite + Firebase/Firestore + TailwindCSS application ("Content Strategy Portal"). An 11-role QA review found 524 defects; 379 were fixed. This plan covers the 78 remaining **architecture** defects — RBAC enforcement, data integrity, cascade deletes, caching, AI safety, and performance.

**Source data:** All defect definitions are in `qa_reports/fix_batches.json`. Search by `bug_id` to get the full description, steps to reproduce, expected vs actual behavior.

**Key utility files to understand first:**
- `src/utils/roles.js` — ROLE_PERMISSIONS matrix, hasPermission(), canManageProject()
- `src/hooks/useProjects.js` — Project CRUD (Firestore)
- `src/hooks/useSchemaLibrary.js` — Schema CRUD
- `src/hooks/useComments.js` — Comment CRUD with editHistory
- `src/hooks/useNotifications.js` — Notification CRUD
- `src/lib/retentionPolicy.js` — Retention policy definitions
- `src/lib/audit/auditStorageService.js` — Audit save/share/view
- `src/lib/readability/aiAnalyzer.js` — AI analysis with AbortController
- `src/lib/readability/utils/analysisCache.js` — localStorage caching
- `src/components/shared/ErrorBoundary.jsx` — Error boundary

---

## Phase 1: Permissions & RBAC (14 defects)

### 1.1 HIGH — Ownership checks missing on mutations

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R08-A-002 | `src/components/checklist/TimeTracker.jsx` | — | Time entry deletion has no ownership or permission check |
| R08-A-003 | `src/components/checklist/FileUpload.jsx` | — | File deletion lacks any permission or ownership check |
| R08-C-012 | `src/hooks/useSchemaLibrary.js` | — | deleteSchema does not verify ownership before deletion |

**Fix pattern:**
```jsx
// Before: no check
const deleteEntry = async (entryId) => {
  await deleteDoc(doc(db, 'collection', entryId));
};

// After: ownership + permission check
const deleteEntry = async (entryId) => {
  const entryDoc = await getDoc(doc(db, 'collection', entryId));
  if (!entryDoc.exists()) return;
  if (entryDoc.data().userId !== currentUser.uid && !hasPermission(userRole, 'canManageProject')) {
    toast.error('You do not have permission to delete this item');
    return;
  }
  await deleteDoc(doc(db, 'collection', entryId));
};
```

### 1.2 HIGH — RBAC defined but unenforced

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R08-C-007 | `src/utils/roles.js` | — | Permission system defined but unenforced in CRUD hooks |
| R11-C-005 | `src/utils/roles.js` | — | Role-permission model lacks content governance permissions |
| R08-B-002 | `src/contexts/AuthContext.jsx` | — | All new users auto-assigned 'project_manager' role with no admin approval |

**Fix approach:**
1. Read `src/utils/roles.js` — understand the ROLE_PERMISSIONS matrix
2. Grep for `addDoc`, `updateDoc`, `deleteDoc`, `setDoc` across all hooks
3. For each mutation, add `if (!hasPermission(userRole, 'relevantPermission'))` guard
4. For AuthContext: change default role to `'viewer'` and add admin approval flow
5. Add content governance permissions to ROLE_PERMISSIONS: `canEditContent`, `canPublishContent`, `canArchiveContent`

### 1.3 MEDIUM — Pagination and validation gaps

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R08-A-011 | `src/components/export/ExportHubPage.jsx` | — | Project dropdown shows only first 6 projects, no pagination |
| R08-A-016 | `src/components/audit/AuditHistoryPanel.jsx` | — | Audit history limited to 10 with no "load more" |
| R08-B-008 | `src/components/reports/ScheduledReportsPanel.jsx` | — | Email input accepts comma-separated values with no validation |
| R11-A-015 | `src/data/glossary.js` | — | Glossary has only 30 terms for 353 checklist items |
| R11-B-009 | `src/components/readability/ReadabilityProjectTagger.jsx` | — | Tag input allows free-form (partially fixed — has max length/count now, needs controlled vocabulary) |
| R11-C-013 | `src/hooks/useSchemaLibrary.js` | — | Schemas can be marked public with no governance |

### 1.4 LOW

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R08-B-015 | `src/components/shared/FeedbackWidget.jsx` | — | Feedback saved but no review workflow |
| R11-A-012 | `src/data/checklistData.js` | — | Near-duplicate checklist items with inconsistent metadata |

---

## Phase 2: Data Integrity & Lifecycle (28 defects)

### 2.1 CRITICAL — Cascade deletes missing

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R08-B-001 | `src/contexts/AuthContext.jsx` | — | Account deletion doesn't clean up user collections |
| R08-C-002 | `src/hooks/useProjects.js` | — | No cascade cleanup when project deleted |

**Fix approach — create cascade delete utility:**
```js
// src/utils/cascadeDelete.js
export async function deleteProjectWithCascade(projectId) {
  const batch = writeBatch(db);
  // 1. Delete all checklist items for this project
  const items = await getDocs(query(collection(db, 'checklist_items'), where('projectId', '==', projectId)));
  // 2. For each item, delete comments, time entries, file attachments
  // 3. Delete assignments
  // 4. Delete the project document
  // IMPORTANT: Firestore batch limit is 500 operations — chunk if needed
  await batch.commit();
}
```

### 2.2 HIGH — Audit trail and edit history

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R08-A-006 | `src/components/admin/AuditLogViewer.jsx` | — | Audit Log Viewer returns empty — no actual logging |
| R08-B-004 | `src/hooks/useComments.js` | — | updateComment doesn't maintain editHistory |
| R08-C-004 | `src/hooks/useComments.js` | — | updateComment doesn't append to editHistory array |
| R08-C-011 | `src/hooks/useProjects.js` | — | Project CRUD generates no audit log entries |
| R08-A-007 | `src/components/checklist/FileUpload.jsx` | — | File operations not logged |

**Fix approach — create audit logging utility:**
```js
// src/utils/auditLog.js
export async function logAuditEvent({ action, targetType, targetId, userId, details }) {
  await addDoc(collection(db, 'audit_log'), {
    action, targetType, targetId, userId,
    details, timestamp: serverTimestamp()
  });
}
```
Then call `logAuditEvent()` in every CRUD hook's create/update/delete functions.

### 2.3 HIGH — Workflow and state persistence

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R08-A-012 | `src/components/audit/BatchAuditPanel.jsx` | — | Batch audit pause doesn't stop the running loop |
| R08-B-003 | `src/components/reports/ScheduledReportsPanel.jsx` | — | Schedule data in local state only (TODO for backend) |
| R08-C-008 | `src/hooks/useNotifications.js` | — | No delete/archive for notifications |
| R11-C-004 | `src/lib/retentionPolicy.js` | — | Retention policy not enforced |

### 2.4 MEDIUM — Various data integrity

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R08-A-009 | `src/components/projects/ProjectCreationWizard.jsx` | — | No date validation (launch < start) |
| R08-A-010 | `src/components/projects/ProgressDashboard.jsx` | — | Uses random mock data as fallback |
| R08-A-013 | `src/components/audit/dashboard/AuditDashboard.jsx` | — | Saved audits can't be updated/deleted |
| R08-B-006 | `src/hooks/useAssignments.js` | — | unassignTask doesn't log activity |
| R08-B-009 | `src/components/readability/ReadabilityWeightConfig.jsx` | — | Custom weights in local state only |
| R08-B-010 | `src/components/shared/NotificationPanel.jsx` | — | No delete/archive UI |
| R08-B-013 | `src/hooks/useAssignments.js` | — | useMyTasks queries entire collection |
| R08-C-009 | `src/lib/audit/auditStorageService.js` | — | Silently truncates audit data |
| R08-C-010 | `src/hooks/useProjects.js` | — | No project status management |
| R08-C-013 | `src/lib/retentionPolicy.js` | — | Retention periods defined but no enforcement |
| R08-C-014 | `src/utils/storageHelpers.js` | — | Parallel localStorage system alongside Firestore |
| R08-C-015 | `src/hooks/useReadabilityAnalysis.js` | — | Auto-deletes oldest analyses without notification |
| R11-A-006 | `src/components/help/OnboardingWalkthrough.jsx` | — | References phases that don't match system |
| R11-B-008 | `src/components/reports/ScheduledReportsPanel.jsx` | — | Local state only (duplicate of R08-B-003) |
| R11-B-015 | `src/components/readability/ReadabilityHistory.jsx` | — | No content lifecycle management |

### 2.5 LOW

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R08-B-014 | `src/components/shared/DueDatesWidget.jsx` | — | 'View all' button non-functional |
| R08-C-016 | `src/lib/audit/auditStorageService.js` | — | Non-atomic view count increment |

---

## Phase 3: Caching & Performance (12 defects)

### 3.1 HIGH — Bundle size and dynamic imports

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R01-209 | `src/lib/unifiedExportService.js` | — | Static imports of jsPDF, ExcelJS, JSZip |
| R09-C-003 | `src/lib/unifiedExportService.js` | — | Same as above (duplicate report) |
| R09-C-004 | `src/lib/pdfGenerator.js` | — | Static imports of jsPDF, jspdf-autotable |

**Fix pattern — dynamic import:**
```js
// Before:
import jsPDF from 'jspdf';

// After:
const { default: jsPDF } = await import('jspdf');
```

### 3.2 HIGH — Race conditions and AbortController

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R01-207 | `src/lib/readability/aiAnalyzer.js` | — | Creates own AbortController not linked to caller's signal |
| R09-C-007 | `src/lib/readability/utils/analysisCache.js` | — | hashContent only processes first 50K chars |

### 3.3 MEDIUM — Stale closures and caching

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R01-206 | `src/hooks/useReadabilitySettings.js` | — | updateSettings captures stale closure |
| R01-211 | `src/lib/audit/auditStorageService.js` | — | Non-atomic view count |
| R09-A-009 | `src/lib/readability/utils/analysisCache.js` | — | Large results in localStorage (5MB risk) |
| R09-B-012 | `src/utils/storageHelpers.js` | — | QuotaExceededError recovery removes wrong key |
| R09-C-013 | `src/lib/readability/utils/analysisCache.js` | — | No size check before localStorage write |

### 3.4 LOW

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R01-208 | `src/hooks/useUnsavedChanges.js` | — | JSON.stringify on every render |
| R01-210 | `src/lib/pdfGenerator.js` | — | Blob URL revoked after 100ms |

---

## Phase 4: AI Safety & Validation (11 defects)

### 4.1 HIGH — Output validation and hallucination

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R07-A-011 | `src/components/public/FeatureDetailPage.jsx` | — | Claims AI features that may not be AI-driven |
| R07-C-013 | `src/lib/readability/aiAnalyzer.js` | — | Score clamping but no semantic validation |

### 4.2 MEDIUM — Disclaimers and prompt safety

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R07-A-003 | `src/components/audit/ai/AISuggestions.jsx` | — | No confidence score on AI suggestions |
| R07-B-003 | `src/components/readability/ReadabilityLLMPreview.jsx` | — | Hardcoded model versions |
| R07-B-008 | `src/components/readability/ReadabilityPDFPreview.jsx` | — | Minimal AI disclaimer in PDF |
| R07-C-010 | `src/lib/schema-generator/schemaGeneratorService.js` | — | Greedy regex in parseSchemaResponse |
| R07-C-011 | `src/lib/ai/suggestionService.js` | — | No machine-readable disclaimer flag |
| R07-C-012 | `src/lib/readability/aiAnalyzer.js` | — | Prompt token budget not accounting for template |
| R07-C-015 | `src/lib/accessibility/aiSuggestionService.js` | — | User data in prompt without delimiters (injection risk) |

### 4.3 LOW

| Bug ID | File | Line | Issue |
|--------|------|------|-------|
| R07-A-012 | `src/components/audit/ai/AISuggestions.jsx` | — | References VITE_CLAUDE_API_KEY instead of proxy |
| R07-A-016 | `src/components/help/OnboardingWalkthrough.jsx` | — | "AI-powered" claim unqualified |

---

## Execution Protocol

1. **Before each fix:** Read the target file AND search `qa_reports/fix_batches.json` for the `bug_id` to get full context
2. **After each phase:** Run `npx vitest run` and `npx vite build`
3. **Commit after each phase:** `git commit -m "fix: architecture phase N — X defects"`
4. **Push after each phase:** `git push -u origin <branch-name>`
5. **Test commands:** `npx vitest run` (593+ tests should pass), `npx vite build` (should succeed)

## Files Changed by Previous Fixes (avoid conflicts)

These files were already modified in the QA fix pass. Read them fresh before editing:
- `src/utils/roles.js` — Already has hasPermission, ROLE_PERMISSIONS
- `src/components/shared/ErrorBoundary.jsx` — Already updated
- `src/lib/readability/aiAnalyzer.js` — Already has AbortController fixes
- `src/hooks/useSchemaLibrary.js` — Already has some permission checks
- `src/lib/retentionPolicy.js` — Already has retention period definitions
