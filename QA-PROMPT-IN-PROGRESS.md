# QA REVIEW — RESUME PROMPT
# Paste this entire file into a new Claude Code session to continue.

## What this is
An 11-role QA deep review of the Content Strategy Portal. Each role audits all 284 source files and produces 35+ defects in Excel.

## Current status
Check `/home/user/content-strategy-portal/qa_reports/progress.json` for which roles are complete.

## How to resume
1. Read `progress.json` to see which roles are done
2. Read `QA_PLAN.md` for the full execution plan
3. Skip completed roles, continue from the next incomplete role
4. Follow the PER-ROLE EXECUTION PROTOCOL in QA_PLAN.md exactly
5. Branch: `claude/optimize-prompt-timeout-3dNLw`

## Key files
- `QA_PLAN.md` — Full plan with all role definitions and protocols
- `qa_reports/progress.json` — Which roles are complete
- `qa_reports/write_defects.py` — JSON to Excel converter
- `qa_reports/merge_parts.py` — Merges 3 partial JSONs per role
- `qa_reports/file_manifest.txt` — All 284 source files
- `qa_reports/role_XX_part_[abc].json` — Partial defect files (3 per role)
- `qa_reports/role_XX_[name].xlsx` — Final Excel per role

## Instructions
Continue executing the QA plan starting from the first incomplete role. Use 3 parallel subagents per role (each handling ~95 files). Git commit+push after every role. See QA_PLAN.md for all details.

## Roles completed so far
- None yet (starting fresh)
