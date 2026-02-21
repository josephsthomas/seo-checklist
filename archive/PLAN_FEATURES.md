# Plan: Feature Defects (11 defects)

> **Priority:** P1 — Product Completeness
> **Impact Score:** 55/100
> **Estimated Effort:** 4-6 engineering days
> **Branch:** Create new branch from `claude/fix-qa-defects-jpa0E`

## Context

This is a React + Vite + Firebase/Firestore + TailwindCSS application ("Content Strategy Portal"). An 11-role QA review found 524 defects; 379 were fixed. This plan covers the 11 remaining **feature** defects — missing undo/recovery patterns, missing confirmation dialogs, and missing editing capabilities.

**Source data:** All defect definitions are in `qa_reports/fix_batches.json`. Search by `bug_id` to get the full description, steps to reproduce, expected vs actual behavior.

**Key files to understand first:**
- `src/hooks/useProjects.js` — Project CRUD (Firestore)
- `src/hooks/useSchemaLibrary.js` — Schema CRUD
- `src/hooks/useTimeTracking.js` — Time entry CRUD
- `src/hooks/useFileAttachments.js` — File attachment CRUD
- `src/hooks/useUnsavedChanges.js` — Unsaved changes detection
- `src/components/audit/ScheduledAuditsPanel.jsx` — Reference implementation for undo toast pattern (line ~189)
- `src/components/checklist/TimeTracker.jsx` — Time tracking UI

---

## Phase 1: Undo & Confirmation for Destructive Actions (5 defects)

These are permanent Firestore deletes with no confirmation and no undo.

### 1.1 HIGH — Project deletion needs confirmation + undo

| Bug ID | File | Issue |
|--------|------|-------|
| R10-C-002 | `src/hooks/useProjects.js` | deleteProject permanently deletes from Firestore with no confirmation or undo |

**Fix approach:**
1. Read `src/hooks/useProjects.js` — find the `deleteProject` function
2. Add soft-delete pattern: set `deletedAt: serverTimestamp()` instead of `deleteDoc()`
3. Add undo toast (copy pattern from `ScheduledAuditsPanel.jsx` line ~189):
```jsx
toast((t) => (
  <div className="flex items-center gap-3">
    <span>Project deleted</span>
    <button onClick={() => { /* restore */ toast.dismiss(t.id); }}>Undo</button>
  </div>
), { duration: 5000 });
```
4. Schedule actual delete after 5 seconds if not undone
5. Filter out soft-deleted projects in list queries: `where('deletedAt', '==', null)`

### 1.2 HIGH — File deletion needs confirmation + undo

| Bug ID | File | Issue |
|--------|------|-------|
| R10-C-007 | `src/hooks/useFileAttachments.js` | deleteFile permanently deletes from Firebase Storage and Firestore with no undo |

**Fix approach:**
1. Read `src/hooks/useFileAttachments.js`
2. Add `window.confirm()` before deletion (files can't be easily restored from Storage)
3. Pattern: `if (!window.confirm('Delete this file? This cannot be undone.')) return;`

### 1.3 MEDIUM — Schema and time entry deletion

| Bug ID | File | Issue |
|--------|------|-------|
| R10-C-010 | `src/hooks/useSchemaLibrary.js` | deleteSchema permanently deletes without confirmation |
| R10-C-011 | `src/hooks/useTimeTracking.js` | deleteEntry permanently deletes time entries without confirmation |

**Fix approach:** Add `window.confirm()` to both delete functions.

### 1.4 MEDIUM — Report deletion

| Bug ID | File | Issue |
|--------|------|-------|
| R08-B-007 | `src/components/reports/ReportBuilderPage.jsx` | Delete button for saved reports has no confirmation dialog |

**Fix approach:** Read the component, find the delete handler, add confirmation.

---

## Phase 2: Unsaved Changes & Form UX (4 defects)

### 2.1 HIGH — Form validation

| Bug ID | File | Issue |
|--------|------|-------|
| R10-B-002 | `src/components/settings/UserSettingsPage.jsx` | Profile form has no client-side validation for Full Name |

**Fix approach:**
1. Read `src/components/settings/UserSettingsPage.jsx`
2. Find the profile form submit handler
3. Add validation: `if (!profileForm.name.trim()) { toast.error('Name is required'); return; }`

### 2.2 MEDIUM — Route change interception

| Bug ID | File | Issue |
|--------|------|-------|
| R10-C-005 | `src/hooks/useUnsavedChanges.js` | Only handles beforeunload, no in-app route change interception |

**Fix approach:**
1. Read `src/hooks/useUnsavedChanges.js`
2. Add `useBlocker` from react-router-dom v6 to intercept in-app navigation:
```jsx
import { useBlocker } from 'react-router-dom';

useBlocker(({ currentLocation, nextLocation }) => {
  return isDirty && currentLocation.pathname !== nextLocation.pathname;
});
```
Note: Check react-router-dom version first — `useBlocker` requires v6.4+.

### 2.3 MEDIUM — Dirty detection fragility

| Bug ID | File | Issue |
|--------|------|-------|
| R10-C-006 | `src/hooks/useUnsavedChanges.js` | Dirty state uses JSON.stringify comparison |

**Fix approach:** Replace with shallow comparison or use a `hasChanged` ref that's set on user interaction:
```jsx
const [isDirty, setIsDirty] = useState(false);
// Set isDirty = true on any field change, reset on save
```

### 2.4 MEDIUM — Feedback form unsaved warning

| Bug ID | File | Issue |
|--------|------|-------|
| R10-A-010 | `src/components/feedback/FeedbackForm.jsx` | Form resets on close with no unsaved warning |

**Fix approach:**
1. Read `src/components/feedback/FeedbackForm.jsx`
2. Track dirty state
3. On close: `if (isDirty && !window.confirm('Discard unsaved feedback?')) return;`

---

## Phase 3: Missing Edit/Unlink Capabilities (2 defects)

### 3.1 MEDIUM — Time entry editing

| Bug ID | File | Issue |
|--------|------|-------|
| R08-A-005 | `src/components/checklist/TimeTracker.jsx` | Time entries cannot be edited after creation |

**Fix approach:**
1. Read `src/components/checklist/TimeTracker.jsx`
2. Add edit mode to time entry rows (inline editing pattern):
   - Add "Edit" button to each entry row
   - On click, switch row to input fields pre-populated with current values
   - Add "Save" / "Cancel" buttons
   - On save, call `updateDoc()` on the time entry

### 3.2 MEDIUM — Unlink from project

| Bug ID | File | Issue |
|--------|------|-------|
| R08-B-011 | `src/components/shared/LinkToProjectModal.jsx` | No mechanism to unlink an item from a project |

**Fix approach:**
1. Read `src/components/shared/LinkToProjectModal.jsx`
2. If item is already linked, show "Unlink" button
3. On unlink: remove the `projectId` field from the document

---

## Execution Protocol

1. **Before each fix:** Read the target file AND search `qa_reports/fix_batches.json` for the `bug_id` to get full context
2. **After each phase:** Run `npx vitest run` and `npx vite build`
3. **Commit after each phase:** `git commit -m "fix: features phase N — X defects"`
4. **Push after each phase:** `git push -u origin <branch-name>`
5. **Test commands:** `npx vitest run` (593+ tests should pass), `npx vite build` (should succeed)

## Reference Implementation

The undo-toast pattern is already implemented in `ScheduledAuditsPanel.jsx` (lines ~189-203). Use that as the template for all undo implementations:

```jsx
// From ScheduledAuditsPanel.jsx — the reference pattern
const confirmDelete = () => {
  const deletedItem = items.find(a => a.id === deleteConfirm.id);
  setItems(prev => prev.filter(a => a.id !== deleteConfirm.id));
  setDeleteConfirm(null);

  toast((t) => (
    <div className="flex items-center gap-3">
      <span>Item deleted</span>
      <button
        onClick={() => {
          setItems(prev => [...prev, deletedItem]);
          toast.dismiss(t.id);
          toast.success('Item restored');
        }}
        className="px-2 py-1 bg-cyan-500 text-white rounded text-sm font-medium hover:bg-cyan-600"
      >
        Undo
      </button>
    </div>
  ), { duration: 5000 });
};
```
