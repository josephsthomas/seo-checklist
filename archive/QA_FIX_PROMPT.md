# QA DEFECT FIX PROMPT — 524 DEFECTS ACROSS 170 FILES
# Content Strategy Portal — Flipside SEO Portal
# ================================================
# PASTE THIS ENTIRE PROMPT INTO A NEW CLAUDE CODE SESSION
# ================================================

You are fixing **524 QA defects** found during an 11-role deep review of a React web application at `/home/user/content-strategy-portal/`.

The defects are organized into **20 batches** (~25 defects each), grouped by file to minimize context switching. Each batch targets 2-25 files.

---

## CRITICAL RULES — READ BEFORE DOING ANYTHING

### RULE 1: BATCH-BY-BATCH EXECUTION
- Work through batches **sequentially** (Batch 1, then Batch 2, etc.)
- Complete ALL fixes in a batch before moving to the next
- **Commit after every batch** with message: `fix: QA batch N — X defects fixed (Y/524 total)`
- **Push after every 3 batches** (batches 3, 6, 9, 12, 15, 18, 20)
- NEVER skip a batch. NEVER reorder batches.

### RULE 2: READ BEFORE EDIT — ZERO HALLUCINATION
- You MUST `Read` every file BEFORE editing it. No exceptions.
- You MUST verify the line number from the defect actually contains the described code
- If a defect's line number is off (code shifted), find the correct location by searching for the described pattern
- If a defect describes code that does NOT exist in the file, mark it as INVALID in the tracker and skip it
- NEVER write code based on a defect description alone — always verify against actual source

### RULE 3: CHECKPOINT AFTER EVERY BATCH
After completing each batch, write a checkpoint file:
```
Write to /home/user/content-strategy-portal/qa_reports/fix_checkpoint.json:
{
  "last_completed_batch": N,
  "total_fixed": X,
  "total_skipped": Y,
  "skipped_ids": ["R01-023", ...],
  "timestamp": "YYYY-MM-DDTHH:MM:SS"
}
```
This file is your crash recovery mechanism. If the session dies, the next session reads this file to know where to resume.

### RULE 4: ANTI-TIMEOUT PROTOCOL
- Each batch should take 15-30 tool calls. If you've used 40+ calls on one batch, STOP, commit what you have, and move on.
- Read files in parallel (up to 3 at a time) when starting a new batch
- Apply edits to one file at a time, but batch multiple edits to the same file together
- Keep chat output MINIMAL — no echoing defect lists, no explaining what you're about to do. Just do it.
- If you feel context getting long: STOP → commit → push → write checkpoint → continue

### RULE 5: ANTI-COMPACTION RECOVERY
If you see a message saying "This session is being continued from a previous conversation that ran out of context", do this IMMEDIATELY:
1. Read `/home/user/content-strategy-portal/qa_reports/fix_checkpoint.json` to find where you left off
2. Read `/home/user/content-strategy-portal/qa_reports/fix_batches.json` to load the batch definitions
3. Resume from `last_completed_batch + 1`
4. Do NOT re-do any completed batches
5. Run `git log --oneline -5` to see which batch commits already exist

### RULE 6: FIX QUALITY
- Fixes must be **minimal and surgical** — change only what's needed for the defect
- Do NOT refactor surrounding code, add comments to unchanged code, or "improve" things
- Do NOT add new dependencies unless absolutely required
- If a fix requires a new utility/component, create it in the most logical location
- If two defects conflict (e.g., one says "add X" and another says "remove X"), prefer the higher-severity defect
- Run the existing test suite after every 5 batches: `npx vitest run 2>&1 | tail -20`

### RULE 7: DEFECT DISPOSITION
For each defect, one of three outcomes:
- **FIXED**: You made a code change that resolves it
- **SKIPPED-INVALID**: The defect describes code that doesn't exist or is factually wrong
- **SKIPPED-WONTFIX**: The fix would break other functionality or is architecturally inappropriate

Track all three in the checkpoint file.

---

## SETUP — RUN THIS FIRST

```bash
cd /home/user/content-strategy-portal
git status  # verify clean working tree
```

Then read the batch file:
```
Read /home/user/content-strategy-portal/qa_reports/fix_batches.json
```

Check if a checkpoint exists (for resume):
```
Read /home/user/content-strategy-portal/qa_reports/fix_checkpoint.json
```
- If checkpoint exists and `last_completed_batch > 0`: RESUME from that batch
- If no checkpoint: START from Batch 1

---

## EXECUTION PROTOCOL FOR EACH BATCH

For Batch N:

### Step 1: Load Batch
Read the batch definition from `fix_batches.json` → batches[N-1]. Note which files and defects are included.

### Step 2: Read All Files in Batch
Read all files in the batch (parallel, up to 3 at a time). Verify each defect's line number against actual code.

### Step 3: Apply Fixes
For each file in the batch:
- Apply ALL defect fixes for that file in sequence
- Use the `Edit` tool for surgical changes
- After editing a file, do NOT re-read it unless needed for a subsequent edit in the same file

### Step 4: Commit
```bash
git add -A
git commit -m "fix: QA batch N — X defects fixed (Y/524 total)"
```

### Step 5: Checkpoint
Write updated checkpoint to `fix_checkpoint.json`.

### Step 6: Push (every 3 batches)
```bash
git push -u origin <branch-name>
```

### Step 7: Test (every 5 batches)
```bash
npx vitest run 2>&1 | tail -30
```
If tests fail, fix the failures BEFORE moving to the next batch.

---

## FIX GUIDANCE BY CATEGORY

These are the most common defect categories and how to fix them:

### Dark Mode Bug (32 defects)
- Add `dark:` variant Tailwind classes alongside existing classes
- Common pattern: `bg-white` → `bg-white dark:bg-gray-800`, `text-gray-900` → `text-gray-900 dark:text-gray-100`
- Check ThemeContext.jsx for the dark mode implementation pattern

### Terminology Inconsistency (19 defects)
- Standardize to the term used most frequently in the codebase
- Check existing patterns before choosing which term to keep

### Meta Tag Issue (17 defects)
- Fix in `src/config/seo.js` and page-level SEO components
- Ensure all pages have title, description, OG tags, Twitter cards

### Missing Disclaimer (12 defects)
- Import and use the existing `AIDisclaimer` component from `src/components/shared/AIDisclaimer.jsx`
- Add it near AI-generated content sections

### Screen Reader (11 defects)
- Add `aria-label`, `aria-describedby`, `role` attributes
- Ensure all interactive elements have accessible names
- Add `sr-only` text where visual context is missing for screen readers

### State Bug (10 defects)
- Fix stale closure issues in useEffect/useCallback by adding correct dependencies
- Fix race conditions with proper cleanup in useEffect return functions

### Permission Issue (9 defects)
- Import `hasPermission` from `src/utils/roles.js` and add checks before CRUD operations
- Reference the `ROLE_PERMISSIONS` matrix in that file

### ARIA Missing (9 defects)
- Add `aria-label` to icon buttons, `aria-expanded` to collapsibles, `aria-live` to dynamic regions

### Keyboard Nav Gap (8 defects)
- Add `onKeyDown` handlers for Enter/Space on clickable non-button elements
- Ensure `tabIndex={0}` on custom interactive elements
- Add keyboard support for Escape to close modals/dropdowns

### Data Integrity (8 defects)
- Add cascade delete logic, optimistic update rollbacks, validation at write boundaries

### Error Logging (9 defects)
- Replace bare `console.error` with structured error handling
- Add user-facing error toasts/messages alongside console logging

### Deploy Risk / Bundle Size / Code Splitting (18 defects)
- Convert static `import` of heavy libs (jsPDF, html2canvas, ExcelJS) to dynamic `import()` at point of use
- Use `lazyWithRetry` from `src/utils/lazyWithRetry.js` instead of bare `React.lazy`

### Missing Error State / Loading State / Empty State (13 defects)
- Add error/loading/empty UI states to components that fetch data
- Use existing patterns from `EmptyState`, `ErrorBoundary`, skeleton loaders

---

## MASTER DEFECT REFERENCE

All 524 defects are in: `/home/user/content-strategy-portal/qa_reports/fix_batches.json`

Structure:
```json
{
  "total_defects": 524,
  "total_batches": 20,
  "total_files": 170,
  "batches": [
    {
      "batch_number": 1,
      "total_defects": 34,
      "files": [
        {
          "file": "src/components/readability/ReadabilityDashboard.jsx",
          "defects": [
            {
              "bug_id": "R01-042",
              "severity": "HIGH",
              "category": "State Bug",
              "file_line": "src/components/readability/ReadabilityDashboard.jsx:448",
              "description": "...",
              "steps": "...",
              "expected": "...",
              "actual": "...",
              "impact": "..."
            }
          ]
        }
      ]
    }
  ]
}
```

Individual role JSON files are also available at:
- `qa_reports/role_01_part_a.json` through `qa_reports/role_11_part_c.json`

The master Excel report is at:
- `QA_Master_Report_All_Roles.xlsx` (for human review, not for code consumption)

---

## SEVERITY PRIORITY

If you must triage within a batch (running low on turns):
1. **CRITICAL** (15 defects) — Fix ALL of these, no exceptions
2. **HIGH** (152 defects) — Fix ALL of these
3. **MEDIUM** (269 defects) — Fix as many as possible
4. **LOW** (88 defects) — Fix if time permits, skip if context is getting long

---

## GIT PROTOCOL

- Branch: use the branch you're already on, or create a new fix branch
- Commit message format: `fix: QA batch N — X defects fixed (Y/524 total)`
- Push after batches 3, 6, 9, 12, 15, 18, and 20 (final)
- If push fails, retry with exponential backoff: 2s, 4s, 8s, 16s
- NEVER force push. NEVER amend commits.

---

## FINAL VERIFICATION

After all 20 batches are complete:

1. Run full test suite:
```bash
npx vitest run 2>&1
```

2. Run build:
```bash
npx vite build 2>&1
```

3. Verify fix count:
```bash
Read /home/user/content-strategy-portal/qa_reports/fix_checkpoint.json
```
Expected: `total_fixed` close to 524 (minus any SKIPPED-INVALID/SKIPPED-WONTFIX)

4. Final commit and push:
```bash
git add -A
git commit -m "fix: QA complete — all batches applied, tests passing"
git push -u origin <branch-name>
```

5. Create summary:
```bash
Write to /home/user/content-strategy-portal/qa_reports/fix_summary.json:
{
  "total_defects": 524,
  "total_fixed": X,
  "total_skipped_invalid": Y,
  "total_skipped_wontfix": Z,
  "batches_completed": 20,
  "tests_passing": true,
  "build_passing": true
}
```

---

## FAILURE MODES AND RECOVERY

| Failure Mode | Recovery |
|---|---|
| Context compaction mid-batch | Read fix_checkpoint.json, resume from last_completed_batch + 1 |
| Session timeout | Start new session, paste this prompt, reads checkpoint automatically |
| Test failures after batch | Fix test failures before proceeding to next batch |
| Build failures at end | Fix build errors, re-run build, commit fixes |
| Git push fails | Retry 4x with exponential backoff. If still fails, check branch name. |
| Edit tool fails (non-unique string) | Add more surrounding context to old_string, or use line numbers to identify correct location |
| Defect references wrong line | Search file for the described pattern, fix at correct location |
| Defect is hallucinated/invalid | Mark as SKIPPED-INVALID in checkpoint, move on |

---

## REMEMBER
- READ BEFORE EDIT — ALWAYS
- COMMIT AFTER EVERY BATCH
- CHECKPOINT AFTER EVERY BATCH
- PUSH EVERY 3 BATCHES
- TEST EVERY 5 BATCHES
- MINIMAL CHAT OUTPUT
- IF IN DOUBT, SKIP AND MOVE ON
- QUALITY OVER QUANTITY — A CORRECT FIX IS BETTER THAN A FAST FIX
