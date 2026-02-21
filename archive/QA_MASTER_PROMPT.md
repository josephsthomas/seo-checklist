# QA MASTER PROMPT — 11-ROLE DEEP REVIEW
# Content Strategy Portal — Flipside SEO Portal
# ================================================
# PASTE THIS ENTIRE PROMPT INTO A NEW CLAUDE CODE SESSION
# ================================================

You are conducting an 11-role QA review of a React web application located at `/home/user/content-strategy-portal/src/`. Each role is a senior expert persona who audits the codebase from their specific lens.

---

## CRITICAL RULES — READ BEFORE DOING ANYTHING

### RULE 1: ZERO DATA IN CHAT
- You MUST NEVER report defects as chat text
- ALL defects MUST be written to Excel files on disk using Python (openpyxl)
- If a defect is not in an Excel file, IT DOES NOT EXIST
- After each role completes, VERIFY the file exists and has the correct row count by reading it back

### RULE 2: ONE ROLE AT A TIME, WRITE IMMEDIATELY
- Complete ONE role fully before starting the next
- After each role: write that role's defects to its own Excel file at `/home/user/content-strategy-portal/qa_reports/role_XX_[name].xlsx`
- Create the `qa_reports/` directory first if it doesn't exist
- NEVER batch multiple roles before writing
- NEVER say "I'll write these to Excel later" — write them NOW

### RULE 3: MINIMUM 35 DEFECTS PER ROLE
- Each role MUST find at minimum 35 unique, real, verifiable defects
- Every defect MUST reference a specific `file_path:line_number` in the source code
- Every defect MUST be a real issue you verified by reading the actual source file
- Do NOT fabricate or pad defects — if you genuinely cannot find 35, explain why, but you should be able to because this is a 150+ component application with 10,000+ lines of code
- Defects can overlap between roles (same bug, different perspective) but MUST be unique within each role

### RULE 4: CONTEXT WINDOW MANAGEMENT
- Do NOT try to read every file before starting. Read files AS NEEDED per role.
- After completing each role and writing its Excel, output a single summary line: "Role X complete. Y defects written to [filepath]."
- Do NOT echo back defect lists in chat — they're in the Excel already
- Keep your chat output MINIMAL to preserve context window for actual analysis

### RULE 5: ANTI-TIMEOUT PROTOCOL
- Read files in small batches (3-5 at a time), not all at once
- Use the Task tool with subagents for file reading when possible
- If you feel the context getting long, STOP, write what you have, then continue
- It is BETTER to write 20 defects and continue than to lose 35 defects to a timeout

### RULE 6: VERIFICATION AFTER EACH ROLE
After writing each role's Excel file, run this verification:
```bash
python3 -c "
import openpyxl
wb = openpyxl.load_workbook('/home/user/content-strategy-portal/qa_reports/role_XX_name.xlsx')
ws = wb.active
print(f'Rows: {ws.max_row - 1} defects')  # minus header
print(f'Columns: {[cell.value for cell in ws[1]]}')
"
```
If the count is below 35, GO BACK AND FIND MORE before moving to the next role.

---

## EXCEL FILE FORMAT

Each role's Excel file MUST have these exact columns:

| Column | Header | Description | Example |
|--------|--------|-------------|---------|
| A | Bug ID | Format: R[role#]-[seq] | R01-001 |
| B | Role | Which persona found it | Lead React Developer |
| C | Severity | CRITICAL / HIGH / MEDIUM / LOW | HIGH |
| D | Category | Defect category (see per-role) | Missing Error State |
| E | Component | React component name | SEOChecklist |
| F | File:Line | Exact source location | src/components/checklist/SEOChecklist.jsx:142 |
| G | Description | What is wrong (1-2 sentences) | Search query clears when filter changes |
| H | Steps to Reproduce | How to trigger (numbered steps) | 1. Type search query 2. Change priority filter |
| I | Expected Behavior | What should happen | Search query should persist across filter changes |
| J | Actual Behavior | What actually happens | Search query resets to empty string |
| K | Impact | Who/what is affected | Users lose search context repeatedly |
| L | Status | Always "OPEN" | OPEN |

---

## STEP 0: SETUP

Before starting any role, run this setup:

```bash
mkdir -p /home/user/content-strategy-portal/qa_reports
pip install openpyxl 2>/dev/null || pip3 install openpyxl 2>/dev/null
```

Then create a helper script:

```python
# Save as /home/user/content-strategy-portal/qa_reports/write_defects.py
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import json, sys

def write_role_report(role_number, role_name, defects, output_path):
    """Write defects list to a formatted Excel file.

    defects: list of dicts with keys:
        bug_id, severity, category, component, file_line,
        description, steps, expected, actual, impact
    """
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = f"Role {role_number} - {role_name}"

    # Headers
    headers = ["Bug ID", "Role", "Severity", "Category", "Component",
               "File:Line", "Description", "Steps to Reproduce",
               "Expected Behavior", "Actual Behavior", "Impact", "Status"]

    header_fill = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True, size=11)
    thin_border = Border(
        left=Side(style='thin'), right=Side(style='thin'),
        top=Side(style='thin'), bottom=Side(style='thin')
    )

    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal='center', wrap_text=True)
        cell.border = thin_border

    # Severity colors
    severity_fills = {
        "CRITICAL": PatternFill(start_color="FF0000", end_color="FF0000", fill_type="solid"),
        "HIGH": PatternFill(start_color="FF6600", end_color="FF6600", fill_type="solid"),
        "MEDIUM": PatternFill(start_color="FFD700", end_color="FFD700", fill_type="solid"),
        "LOW": PatternFill(start_color="90EE90", end_color="90EE90", fill_type="solid"),
    }
    severity_fonts = {
        "CRITICAL": Font(color="FFFFFF", bold=True),
        "HIGH": Font(color="FFFFFF", bold=True),
        "MEDIUM": Font(color="000000", bold=True),
        "LOW": Font(color="000000"),
    }

    # Data rows
    for i, defect in enumerate(defects, 2):
        ws.cell(row=i, column=1, value=defect["bug_id"]).border = thin_border
        ws.cell(row=i, column=2, value=role_name).border = thin_border

        sev_cell = ws.cell(row=i, column=3, value=defect["severity"])
        sev_cell.fill = severity_fills.get(defect["severity"], PatternFill())
        sev_cell.font = severity_fonts.get(defect["severity"], Font())
        sev_cell.border = thin_border
        sev_cell.alignment = Alignment(horizontal='center')

        ws.cell(row=i, column=4, value=defect["category"]).border = thin_border
        ws.cell(row=i, column=5, value=defect["component"]).border = thin_border
        ws.cell(row=i, column=6, value=defect["file_line"]).border = thin_border
        ws.cell(row=i, column=7, value=defect["description"]).border = thin_border
        ws.cell(row=i, column=8, value=defect["steps"]).border = thin_border
        ws.cell(row=i, column=9, value=defect["expected"]).border = thin_border
        ws.cell(row=i, column=10, value=defect["actual"]).border = thin_border
        ws.cell(row=i, column=11, value=defect["impact"]).border = thin_border
        ws.cell(row=i, column=12, value="OPEN").border = thin_border

        # Wrap text for long fields
        for col in [7, 8, 9, 10, 11]:
            ws.cell(row=i, column=col).alignment = Alignment(wrap_text=True)

    # Column widths
    widths = [10, 25, 12, 22, 20, 50, 50, 50, 40, 40, 35, 10]
    for i, w in enumerate(widths, 1):
        ws.column_dimensions[chr(64 + i) if i <= 26 else 'A' + chr(64 + i - 26)].width = w

    # Freeze header
    ws.freeze_panes = 'A2'

    # Auto-filter
    ws.auto_filter.ref = f"A1:L{len(defects) + 1}"

    wb.save(output_path)
    print(f"SUCCESS: Wrote {len(defects)} defects to {output_path}")
    return len(defects)

if __name__ == "__main__":
    # Usage: python write_defects.py <json_file> <role_number> <role_name> <output_path>
    with open(sys.argv[1]) as f:
        defects = json.load(f)
    write_role_report(int(sys.argv[2]), sys.argv[3], defects, sys.argv[4])
```

---

## STEP 1-11: EXECUTE EACH ROLE

For EACH role below, follow this exact sequence:

### Per-Role Execution Protocol:
1. **Read** the relevant source files for this role's focus area (read 3-5 files at a time)
2. **Identify** defects as you read — note file path and line number immediately
3. **Accumulate** defects in a JSON structure (in a temp file if needed, NOT in chat)
4. **When you reach 35+ defects**, write them to the role's Excel file using the helper script
5. **Verify** the Excel file has 35+ rows
6. **Report** one line: "Role X complete. Y defects written to [path]."
7. **Move to next role**

### Writing defects to disk mid-role (ANTI-LOSS PROTOCOL):
If at any point you have 15+ defects accumulated and haven't written yet, WRITE IMMEDIATELY to a temp file:
```bash
cat > /home/user/content-strategy-portal/qa_reports/role_XX_partial.json << 'JSONEOF'
[...your defects array...]
JSONEOF
```
Then continue finding more, and merge before final write.

---

## THE 11 ROLES

### ROLE 1: Lead React Developer
**Focus:** Code quality, React anti-patterns, state management bugs, prop drilling, missing keys, stale closures, memory leaks, race conditions, incorrect useEffect dependencies, unhandled promises, type coercion bugs
**Files to prioritize:** All JSX components, hooks, contexts
**Categories:** React Anti-Pattern, State Bug, Memory Leak, Race Condition, Missing Error Handling, Performance Bug, Prop Issue, Hook Misuse
**Bug ID prefix:** R01-XXX

### ROLE 2: Visual Designer
**Focus:** UI inconsistency, spacing irregularities, color mismatches, typography violations, dark mode bugs, responsive breakpoint issues, z-index conflicts, animation jank, icon inconsistency, visual hierarchy problems
**Files to prioritize:** index.css, all component render methods, Tailwind classes
**Categories:** Spacing Issue, Color Inconsistency, Typography Bug, Dark Mode Bug, Responsive Issue, Z-Index Conflict, Animation Bug, Visual Hierarchy
**Bug ID prefix:** R02-XXX

### ROLE 3: Copywriter
**Focus:** Microcopy errors, grammar/spelling, inconsistent tone, unclear CTAs, placeholder text left in, truncated strings, missing labels, jargon in user-facing text, inconsistent terminology, missing help text
**Files to prioritize:** All JSX (focus on string literals, button text, labels, error messages, empty states, tooltips)
**Categories:** Grammar/Spelling, Tone Inconsistency, Unclear CTA, Missing Label, Jargon, Placeholder Left In, Truncation, Terminology Inconsistency
**Bug ID prefix:** R03-XXX

### ROLE 4: Content Designer
**Focus:** Information architecture, content hierarchy, navigation labeling, taxonomy consistency, content grouping logic, progressive disclosure, scannability, content-to-action ratio, cognitive load
**Files to prioritize:** Navigation, App.jsx routes, page layouts, tool pages, help/docs
**Categories:** IA Problem, Navigation Gap, Taxonomy Issue, Progressive Disclosure, Cognitive Overload, Content Grouping, Labeling Issue
**Bug ID prefix:** R04-XXX

### ROLE 5: Accessibility Strategist
**Focus:** WCAG 2.2 AA violations, missing ARIA labels, keyboard navigation gaps, focus management, screen reader issues, color contrast failures, missing alt text, form accessibility, semantic HTML, focus traps in modals
**Files to prioritize:** All interactive components (forms, modals, dropdowns, buttons, navigation)
**Categories:** ARIA Missing, Keyboard Nav Gap, Focus Management, Color Contrast, Semantic HTML, Screen Reader, Form A11y, Focus Trap
**Bug ID prefix:** R05-XXX

### ROLE 6: SEO Strategist
**Focus:** Missing meta tags, schema markup errors, heading hierarchy violations, canonical issues, OG/Twitter card gaps, sitemap gaps, internal linking structure, page title patterns, URL structure
**Files to prioritize:** seo.js config, App.jsx routes, page components (head/meta), public pages
**Categories:** Meta Tag Issue, Schema Error, Heading Hierarchy, Canonical Issue, Social Cards, Sitemap Gap, Internal Links, URL Structure
**Bug ID prefix:** R06-XXX

### ROLE 7: Generative AI Strategist
**Focus:** LLM integration issues, prompt engineering flaws, AI output handling, hallucination risk, token management, API error handling, model selection logic, AI disclaimer gaps, bias in AI outputs, missing confidence indicators
**Files to prioritize:** /src/lib/ai/, /src/lib/readability/, /src/lib/image-alt/, /src/lib/meta-generator/, /src/lib/schema-generator/, API call sites
**Categories:** Prompt Issue, AI Error Handling, Hallucination Risk, Token Management, Missing Disclaimer, Confidence Gap, Model Selection, Output Validation
**Bug ID prefix:** R07-XXX

### ROLE 8: SVP Project Management
**Focus:** Feature completeness vs. requirements, scope gaps, risk areas, missing CRUD operations, workflow dead-ends, data integrity risks, audit trail gaps, role/permission issues, project lifecycle gaps
**Files to prioritize:** Hooks (all CRUD), roles.js, project components, settings, admin
**Categories:** Scope Gap, Missing Feature, Data Integrity, Permission Issue, Workflow Gap, Audit Trail, Lifecycle Issue, Risk
**Bug ID prefix:** R08-XXX

### ROLE 9: SVP Integrated Production
**Focus:** Build configuration, deployment readiness, environment variables, bundle size, code splitting effectiveness, lazy loading issues, caching strategy, error logging, monitoring gaps, CI/CD readiness, dependency vulnerabilities
**Files to prioritize:** vite.config.js, package.json, main.jsx, App.jsx (lazy imports), firebase config, environment handling
**Categories:** Build Issue, Deploy Risk, Bundle Size, Code Splitting, Caching Gap, Error Logging, Monitoring Gap, Dependency Risk, Environment Issue
**Bug ID prefix:** R09-XXX

### ROLE 10: SVP User Experience
**Focus:** User flow completeness, empty state handling, loading state coverage, error state UX, form validation UX, unsaved changes warnings, onboarding gaps, navigation dead-ends, feedback loop completeness, edge case handling, undo/revert support
**Files to prioritize:** All page-level components, form components, modal components, shared components (EmptyState, ErrorBoundary, Skeleton)
**Categories:** Missing Empty State, Missing Loading State, Missing Error State, Form UX Issue, Navigation Dead-End, Feedback Gap, Onboarding Gap, Edge Case, Flow Break, Undo Missing
**Bug ID prefix:** R10-XXX

### ROLE 11: SVP Content Strategy
**Focus:** Content model integrity, content type definitions, taxonomy/tagging system, content lifecycle management, editorial workflow, content governance, content reuse patterns, metadata completeness, glossary/terminology management, content relationships
**Files to prioritize:** /src/data/ (all data files), checklist data, WCAG criteria, glossary, tool configs, content-bearing components
**Categories:** Content Model Issue, Taxonomy Gap, Lifecycle Issue, Governance Gap, Content Reuse, Metadata Issue, Terminology, Content Relationship, Editorial Workflow
**Bug ID prefix:** R11-XXX

---

## STEP 12: MERGE ALL INTO MASTER REPORT

After ALL 11 roles are complete, run this merge script:

```python
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import glob, os

master = openpyxl.Workbook()

# --- Executive Summary Sheet ---
summary_ws = master.active
summary_ws.title = "Executive Summary"

# Will be filled after counting

# --- Create Master Defects Sheet ---
defects_ws = master.create_sheet("All Defects")
headers = ["Bug ID", "Role", "Severity", "Category", "Component",
           "File:Line", "Description", "Steps to Reproduce",
           "Expected Behavior", "Actual Behavior", "Impact", "Status"]

header_fill = PatternFill(start_color="1F4E79", end_color="1F4E79", fill_type="solid")
header_font = Font(color="FFFFFF", bold=True, size=11)
thin_border = Border(left=Side(style='thin'), right=Side(style='thin'),
                     top=Side(style='thin'), bottom=Side(style='thin'))

for col, header in enumerate(headers, 1):
    cell = defects_ws.cell(row=1, column=col, value=header)
    cell.fill = header_fill
    cell.font = header_font
    cell.alignment = Alignment(horizontal='center', wrap_text=True)
    cell.border = thin_border

severity_fills = {
    "CRITICAL": PatternFill(start_color="FF0000", end_color="FF0000", fill_type="solid"),
    "HIGH": PatternFill(start_color="FF6600", end_color="FF6600", fill_type="solid"),
    "MEDIUM": PatternFill(start_color="FFD700", end_color="FFD700", fill_type="solid"),
    "LOW": PatternFill(start_color="90EE90", end_color="90EE90", fill_type="solid"),
}

# Merge all role files
current_row = 2
role_counts = {}
severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}

qa_dir = "/home/user/content-strategy-portal/qa_reports"
for filepath in sorted(glob.glob(f"{qa_dir}/role_*.xlsx")):
    wb = openpyxl.load_workbook(filepath)
    ws = wb.active
    role_name = None
    count = 0

    for row in ws.iter_rows(min_row=2, values_only=False):
        values = [cell.value for cell in row]
        if not values[0]:  # skip empty rows
            continue

        role_name = values[1]
        severity = values[2]
        count += 1
        severity_counts[severity] = severity_counts.get(severity, 0) + 1

        for col, val in enumerate(values, 1):
            cell = defects_ws.cell(row=current_row, column=col, value=val)
            cell.border = thin_border
            if col == 3 and val in severity_fills:
                cell.fill = severity_fills[val]
            if col in [7, 8, 9, 10, 11]:
                cell.alignment = Alignment(wrap_text=True)

        current_row += 1

    if role_name:
        role_counts[role_name] = count

# --- Fill Executive Summary ---
summary_ws.merge_cells('A1:F1')
title_cell = summary_ws['A1']
title_cell.value = "QA TEST REPORT — CONTENT STRATEGY PORTAL"
title_cell.font = Font(size=18, bold=True, color="1F4E79")
title_cell.alignment = Alignment(horizontal='center')

summary_ws['A3'] = "Total Defects Found:"
summary_ws['B3'] = current_row - 2
summary_ws['B3'].font = Font(size=14, bold=True, color="FF0000")

summary_ws['A5'] = "Severity"
summary_ws['B5'] = "Count"
summary_ws['A5'].font = Font(bold=True)
summary_ws['B5'].font = Font(bold=True)
row = 6
for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
    summary_ws[f'A{row}'] = sev
    summary_ws[f'B{row}'] = severity_counts.get(sev, 0)
    summary_ws[f'A{row}'].fill = severity_fills[sev]
    row += 1

row += 1
summary_ws[f'A{row}'] = "Defects by Role"
summary_ws[f'A{row}'].font = Font(bold=True, size=12)
row += 1
summary_ws[f'A{row}'] = "Role"
summary_ws[f'B{row}'] = "Defect Count"
summary_ws[f'A{row}'].font = Font(bold=True)
summary_ws[f'B{row}'].font = Font(bold=True)
row += 1
for role, count in role_counts.items():
    summary_ws[f'A{row}'] = role
    summary_ws[f'B{row}'] = count
    row += 1

# Also create per-role sheets
for filepath in sorted(glob.glob(f"{qa_dir}/role_*.xlsx")):
    wb = openpyxl.load_workbook(filepath)
    ws = wb.active
    sheet_name = ws.title[:31]  # Excel max sheet name length
    new_ws = master.create_sheet(sheet_name)
    for row in ws.iter_rows():
        for cell in row:
            new_cell = new_ws.cell(row=cell.row, column=cell.column, value=cell.value)
            if cell.has_style:
                new_cell.font = cell.font.copy()
                new_cell.fill = cell.fill.copy()
                new_cell.alignment = cell.alignment.copy()
                new_cell.border = cell.border.copy()

# Column widths for defects sheet
widths = [12, 28, 12, 24, 22, 52, 52, 52, 42, 42, 36, 10]
for i, w in enumerate(widths, 1):
    col_letter = openpyxl.utils.get_column_letter(i)
    defects_ws.column_dimensions[col_letter].width = w

defects_ws.freeze_panes = 'A2'
defects_ws.auto_filter.ref = f"A1:L{current_row - 1}"

# Save
output = "/home/user/content-strategy-portal/QA_Master_Report_All_Roles.xlsx"
master.save(output)
print(f"\nMASTER REPORT SAVED: {output}")
print(f"Total defects: {current_row - 2}")
print(f"Severity breakdown: {severity_counts}")
print(f"Per-role counts: {role_counts}")
```

---

## STEP 13: GIT COMMIT AND PUSH

```bash
cd /home/user/content-strategy-portal
git add qa_reports/ QA_Master_Report_All_Roles.xlsx
git commit -m "QA: 11-role deep review — [TOTAL] defects across all roles

Roles completed:
- Role 1: Lead React Developer ([count] defects)
- Role 2: Visual Designer ([count] defects)
- Role 3: Copywriter ([count] defects)
- Role 4: Content Designer ([count] defects)
- Role 5: Accessibility Strategist ([count] defects)
- Role 6: SEO Strategist ([count] defects)
- Role 7: Generative AI Strategist ([count] defects)
- Role 8: SVP Project Management ([count] defects)
- Role 9: SVP Integrated Production ([count] defects)
- Role 10: SVP User Experience ([count] defects)
- Role 11: SVP Content Strategy ([count] defects)
"
git push -u origin claude/api-timeouts-railway-deploy-Rof9f
```

---

## FINAL VERIFICATION CHECKLIST

Before declaring done, verify ALL of these:

- [ ] `qa_reports/` directory contains 11 Excel files (role_01 through role_11)
- [ ] Each role file has 35+ defect rows (not counting header)
- [ ] `QA_Master_Report_All_Roles.xlsx` exists with Executive Summary + All Defects + 11 role sheets
- [ ] Total defects across all roles is 385+ (11 roles x 35 minimum)
- [ ] Every single defect has a non-empty File:Line value
- [ ] Every single defect has a non-empty Steps to Reproduce value
- [ ] Git commit includes all files
- [ ] Git push succeeded

Run this final check:
```bash
echo "=== FINAL QA VERIFICATION ==="
for f in /home/user/content-strategy-portal/qa_reports/role_*.xlsx; do
  python3 -c "
import openpyxl
wb = openpyxl.load_workbook('$f')
ws = wb.active
count = ws.max_row - 1
status = 'PASS' if count >= 35 else 'FAIL'
print(f'{status}: {ws.title} — {count} defects — $f')
"
done
echo "=== MASTER REPORT CHECK ==="
python3 -c "
import openpyxl
wb = openpyxl.load_workbook('/home/user/content-strategy-portal/QA_Master_Report_All_Roles.xlsx')
for ws in wb.worksheets:
    print(f'{ws.title}: {ws.max_row} rows')
"
```

---

## FAILURE MODES AND MITIGATIONS

| Failure Mode | Mitigation |
|---|---|
| Context window fills up | Write defects to disk after every 15 found. Keep chat minimal. |
| Session timeout | Each role's Excel is already on disk. Resume from the last incomplete role. |
| openpyxl not installed | `pip install openpyxl` at setup. If pip fails, write CSVs instead. |
| Python not available | Use Node.js with `xlsx` package as fallback. |
| Can't find 35 defects | Read MORE files. 150+ components means plenty of issues. Check edge cases, dark mode, mobile, a11y, error states. |
| Excel file corrupt | Verify after every write. Re-write if verification fails. |
| Git push fails | Retry with exponential backoff: 2s, 4s, 8s, 16s. Check branch name. |

---

## REMEMBER
- DISK, NOT CHAT
- WRITE AFTER EACH ROLE
- VERIFY AFTER EACH WRITE
- 35 MINIMUM PER ROLE
- FILE:LINE ON EVERY DEFECT
- ONE ROLE AT A TIME
- KEEP CHAT OUTPUT MINIMAL
