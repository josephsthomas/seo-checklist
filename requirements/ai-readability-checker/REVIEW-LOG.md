# AI Readability Checker — Stakeholder Review Log

**Review Date:** 2026-02-17
**Documents Reviewed:** 01 through 11 (full BRD suite)
**Status Legend:** IMPLEMENTED = fixed in docs | DEFERRED = needs product decision | NOTED = acknowledged, no action needed now

---

## 1. SVP, Generative Engine Optimization

| ID | Type | Summary | Doc | Status |
|---|---|---|---|---|
| D-GEO-01 | Defect | LLM preview methodology simulates comprehension, not actual crawl behavior | 03, 04 | IMPLEMENTED — added disclaimers and renamed to "LLM Comprehension Preview" |
| D-GEO-02 | Defect | Perplexity API used as plain text extractor instead of search-augmented mode | 04 | IMPLEMENTED — added note to use Sonar search mode post-MVP |
| D-GEO-03 | Defect | `noai` robots directive check is incomplete; missing per-crawler user-agent checks | 03 | IMPLEMENTED — expanded TA-02/TA-03 to AI crawler permission matrix |
| D-GEO-04 | Defect | AI-Specific Signals at 15% is too low for a GEO tool | 03 | DEFERRED — needs product decision on rebalancing |
| D-GEO-05 | Defect | 50 checks miss critical GEO signals (definitional answers, fact density, etc.) | 03 | DEFERRED — 10 missing checks identified for consideration |
| D-GEO-06 | Defect | Content-to-code ratio (TA-07) is arbitrary and not AI-calibrated | 03 | NOTED |
| D-GEO-07 | Defect | Time target inconsistency: DOC 01 says <15s, DOC 10 says <12s | 01, 10 | IMPLEMENTED — aligned to <15s target, <12s stretch |
| D-GEO-08 | Defect | Hardcoded model IDs with no update strategy | 03, 04 | IMPLEMENTED — added model versioning note |
| E-GEO-01 | Enhancement | Add Citation Likelihood as a primary KPI alongside readability score | 01, 03 | IMPLEMENTED — promoted citationWorthiness to dashboard-level metric |
| E-GEO-02 | Enhancement | Add Google AI Overview-specific optimization checks | 03 | DEFERRED |
| E-GEO-03 | Enhancement | Add Perplexity citation pattern analysis | 02, 03 | DEFERRED |
| E-GEO-04 | Enhancement | Add model version tracking and drift detection | 01, 04, 07 | IMPLEMENTED — added scoringVersion/promptVersion to data model |
| E-GEO-05 | Enhancement | Add competitive citation analysis (post-MVP) | 01 | NOTED |
| E-GEO-06 | Enhancement | Add ChatGPT Browse-specific signals | 03 | DEFERRED |
| E-GEO-07 | Enhancement | Tag recommendations by AI search platform impact | 03 | DEFERRED |
| E-GEO-08 | Enhancement | Add real-time GEO benchmark data | 01 | DEFERRED |
| E-GEO-09 | Enhancement | Test against AI search result pages directly (post-MVP) | 03 | NOTED |
| E-GEO-10 | Enhancement | Add GEO Strategic Brief page to PDF export | 11 | DEFERRED |
| E-GEO-11 | Enhancement | Detect AI-specific HTTP headers (TDM-Reservation, ai.txt) | 03, 04 | IMPLEMENTED — added to TA-02 checks |
| E-GEO-12 | Enhancement | Expand Flesch check for AI-specific readability metrics | 03 | DEFERRED |
| O-GEO-01 | Opportunity | First-mover positioning — differentiate via genuine multi-LLM insights | 01 | NOTED |
| O-GEO-02 | Opportunity | Build a "GEO Intelligence Layer" that adapts to the landscape | 01 | NOTED |
| O-GEO-03 | Opportunity | Agency revenue via white-label GEO audits | 02 | NOTED |
| O-GEO-04 | Opportunity | 500 analyses/month target is too conservative | 01 | NOTED |
| O-GEO-05 | Opportunity | Missing persona: GEO Specialist | 02 | DEFERRED |
| O-GEO-06 | Opportunity | Integration with Google Search Console API | 01 | NOTED |
| O-GEO-07 | Opportunity | AI crawler permission check as a standalone quick feature | 03 | NOTED |
| O-GEO-08 | Opportunity | Emerging ai.txt standard support | 03 | IMPLEMENTED — noted in TA checks |
| O-GEO-09 | Opportunity | Consider Bing Copilot as distinct LLM target | 01 | NOTED |
| O-GEO-10 | Opportunity | Cost model underestimates agency-scale usage | 04 | NOTED |

---

## 2. EVP, Agency Operations

| ID | Type | Summary | Doc | Status |
|---|---|---|---|---|
| D-OPS-01 | Defect | 15 analyses/hour rate limit is operationally unworkable for agency teams | 03, 04, 08 | DEFERRED — needs product decision |
| D-OPS-02 | Defect | 100-analysis storage limit conflicts with agency portfolio management; auto-archive undefined | 03, 04 | IMPLEMENTED — added archive mechanism note and increased guidance |
| D-OPS-03 | Defect | Developer role lacks "share" permission | 02, 07 | IMPLEMENTED — added share to Developer role |
| D-OPS-04 | Defect | Content Writer "view own history" is actually enforced for ALL roles by Firestore rules | 02, 04 | IMPLEMENTED — noted in security rules rewrite |
| D-OPS-05 | Defect | Firestore rules don't support Admin/PM "view all" described in DOC 02 | 02, 04 | IMPLEMENTED — added admin/org override note to rules |
| D-OPS-06 | Defect | "Never" expire option on shared links is a security concern | 02, 11 | IMPLEMENTED — added admin-approval note for "Never" |
| D-OPS-07 | Defect | Tool order:7 conflicts with existing Analytics Dashboard | 03, 07 | IMPLEMENTED — fixed to order:7, noted reordering |
| D-OPS-08 | Defect | VITE_ prefix on server-side API keys | 04 | IMPLEMENTED — removed VITE_ prefix |
| E-OPS-01 | Enhancement | Add organization/team-level analysis with shared visibility | 04 | IMPLEMENTED — added organizationId/projectId fields |
| E-OPS-02 | Enhancement | Add project/client tagging for analyses | 04 | IMPLEMENTED — added clientName, projectId, tags |
| E-OPS-03 | Enhancement | Team-level rate limits rather than per-user only | 04 | DEFERRED |
| E-OPS-04 | Enhancement | PM/Admin ability to assign readability checks to team members | 02 | DEFERRED |
| E-OPS-05 | Enhancement | Elevate batch analysis from post-MVP to MVP (or at least early Phase 2) | 01 | DEFERRED — needs product decision |
| E-OPS-06 | Enhancement | Agency-level API cost dashboards and budget alerts | 04 | DEFERRED |
| E-OPS-07 | Enhancement | Client-facing portal view with limited self-service | 02, 07 | DEFERRED |
| E-OPS-08 | Enhancement | Expanded white-label PDF customization | 11 | DEFERRED |
| E-OPS-09 | Enhancement | Storage limit should scale with role/tier | 03 | DEFERRED |
| E-OPS-10 | Enhancement | Scheduled/recurring analysis capability | 01 | DEFERRED |
| E-OPS-11 | Enhancement | Comparative benchmarking against industry averages | 01 | DEFERRED |
| E-OPS-12 | Enhancement | Load/concurrency testing for agency-scale | 09 | NOTED |
| E-OPS-13 | Enhancement | Shared view should optionally include PDF export | 11 | DEFERRED |
| E-OPS-14 | Enhancement | Analysis templates / saved configurations | 03, 05 | DEFERRED |
| E-OPS-15 | Enhancement | Notation/annotation capability on analyses | 04 | DEFERRED |
| O-OPS-01 | Opportunity | Position tool as billable agency service offering | 01 | NOTED |
| O-OPS-02 | Opportunity | $200/month LLM budget may be underprovisioned for success targets | 01, 04 | NOTED |
| O-OPS-03 | Opportunity | Cross-tool integration with Content Planner | 01, 02 | NOTED |
| O-OPS-04 | Opportunity | Competitor comparison should be Phase 2, not Phase 4 | 01 | NOTED |
| O-OPS-05 | Opportunity | 20% export-in-deliverables target is too conservative for agency use | 01 | NOTED |
| O-OPS-06 | Opportunity | Absence of multi-tenancy creates agency scaling ceiling | 04 | NOTED |
| O-OPS-07 | Opportunity | Cost-absorbed model needs a graduation path | 01, 04 | NOTED |
| O-OPS-08 | Opportunity | Agency onboarding workflow is absent | All | NOTED |

---

## 3. CMO (Client Gut Check)

| ID | Type | Summary | Doc | Status |
|---|---|---|---|---|
| D-CMO-01 | Defect | Client role is essentially useless — can only view shared links | 02 | DEFERRED — needs product decision |
| D-CMO-02 | Defect | Scoring system has no "so what?" — no business impact context | 02, 03 | IMPLEMENTED — added business impact summary requirement |
| D-CMO-03 | Defect | No competitive context in MVP | 01, 03 | DEFERRED |
| D-CMO-04 | Defect | Shared view strips out the most compelling feature (LLM previews) | 11 | IMPLEMENTED — changed to include LLM coverage summary |
| D-CMO-05 | Defect | PDF report has no benchmarking or comparative context | 11 | DEFERRED |
| D-CMO-06 | Defect | Recommendations lack audience-appropriate language for non-technical users | 03, 05 | IMPLEMENTED — added audience-split requirement |
| E-CMO-01 | Enhancement | Create a "Client Dashboard" role with self-service access | 02 | DEFERRED |
| E-CMO-02 | Enhancement | Add "Board-Ready" executive summary option to PDF | 11 | DEFERRED |
| E-CMO-03 | Enhancement | Add trend tracking to MVP, not post-MVP | 01 | DEFERRED |
| E-CMO-04 | Enhancement | Split recommendations into "For Writers" and "For Developers" | 03 | IMPLEMENTED — added audience grouping to recommendations |
| E-CMO-05 | Enhancement | Surface Citation Likelihood metric prominently | 03, 04 | IMPLEMENTED — promoted to dashboard |
| E-CMO-06 | Enhancement | Make shared link expiry configurable with longer default for clients | 11 | NOTED |
| E-CMO-07 | Enhancement | Add plain-English "AI Visibility Summary" to results dashboard | 05 | IMPLEMENTED — added to score card spec |
| O-CMO-01 | Opportunity | Competitor URL comparison as a manual workflow | 01 | NOTED |
| O-CMO-02 | Opportunity | Monthly automated re-analysis with email digest | 01 | NOTED |
| O-CMO-03 | Opportunity | "Talk Track" for presenting reports | 11 | NOTED |
| O-CMO-04 | Opportunity | Embeddable "AI Search Ready" badge/certification | New | NOTED |
| O-CMO-05 | Opportunity | LLM Preview as standalone shareable asset | 02, 11 | NOTED |
| O-CMO-06 | Opportunity | ROI framing connecting score to business outcomes | 03 | NOTED |

---

## 4. Lead Developer

| ID | Type | Summary | Doc | Status |
|---|---|---|---|---|
| D-DEV-01 | Defect | CRITICAL: VITE_ prefix on server-side API keys exposes secrets | 04 | IMPLEMENTED |
| D-DEV-02 | Defect | ToolCard.jsx missing amber/rose colorVariants (pre-existing bug) | 05, 07 | IMPLEMENTED — noted in DOC 07 |
| D-DEV-03 | Defect | ToolErrorBoundary prop naming wrong (tool/color vs toolName/toolColor) | 07 | IMPLEMENTED |
| D-DEV-04 | Defect | Firestore security rules have conflicting/overlapping declarations | 04 | IMPLEMENTED — rewritten |
| D-DEV-05 | Defect | Storage rules for readability paths completely missing | 04 | IMPLEMENTED — added |
| D-DEV-06 | Defect | Promise.allSettled destructuring incorrect in pipeline code | 07 | IMPLEMENTED — switched to Promise.all |
| D-DEV-07 | Defect | readability-settings document ID vs userId field ambiguity | 04 | IMPLEMENTED — clarified |
| D-DEV-08 | Defect | roles.js permission pattern mismatch with existing codebase | 03, 07 | IMPLEMENTED — added investigation note |
| E-DEV-01 | Enhancement | Dark mode completely absent from all 11 docs | 05 | IMPLEMENTED — added dark mode section |
| E-DEV-02 | Enhancement | Processing screen stages are sequential but LLM calls are parallel | 05 | IMPLEMENTED — fixed to show parallel |
| E-DEV-03 | Enhancement | 50,000 char truncation needs sentence-boundary logic | 07 | IMPLEMENTED — added note |
| E-DEV-04 | Enhancement | Reference existing react-dropzone pattern for consistency | 03, 07 | NOTED |
| E-DEV-05 | Enhancement | URL validation should share existing lib, not create duplicate | 07 | IMPLEMENTED — clarified |
| E-DEV-06 | Enhancement | Shared view route path inconsistent with existing pattern | 07 | NOTED |
| E-DEV-07 | Enhancement | Firestore document may exceed 1MB limit for large analyses | 04 | IMPLEMENTED — added size guard |
| E-DEV-08 | Enhancement | AbortController cleanup on unmount not specified | 07 | IMPLEMENTED — added |
| E-DEV-09 | Enhancement | Missing legacy redirect for /readability | 07 | IMPLEMENTED — added |
| R-DEV-01 | Risk | DOMParser limitations (no external CSS, no JS, no layout engine) | 07, 10 | NOTED |
| R-DEV-02 | Risk | Client-side pipeline needs server-side rate limit enforcement | 04, 10 | NOTED |
| R-DEV-03 | Risk | Race condition: re-analysis during processing | 07, 08 | IMPLEMENTED — added guard |
| R-DEV-04 | Risk | Missing HISTORY -> DASHBOARD state transition | 07 | IMPLEMENTED |
| R-DEV-05 | Risk | Large HTML + DOMParser memory may exceed 100MB target | 10 | NOTED |
| R-DEV-06 | Risk | Flesch Reading Ease is English-only but tool accepts any language | 03, 07 | NOTED |
| R-DEV-07 | Risk | VITE_CLAUDE_API_KEY labeled "server-side" but is client-exposed | 04 | IMPLEMENTED — clarified |
| R-DEV-08 | Risk | URL fetch proxy SSRF protections not specified at implementation level | 04, 10 | NOTED |
| R-DEV-09 | Risk | react-dropzone dependency assumed but should be verified | 07 | NOTED |
| R-DEV-10 | Risk | Perplexity sonar-pro may augment with external search data | 03, 04 | IMPLEMENTED — added disclaimer |

---

## 5. SVP, Technology

| ID | Type | Summary | Doc | Status |
|---|---|---|---|---|
| D-TECH-01 | Defect | P0: VITE_ prefix exposes API keys in client bundle | 04 | IMPLEMENTED |
| D-TECH-02 | Defect | P1: Firestore rules allow read of any shared analysis without token verification | 04 | IMPLEMENTED — rewritten |
| D-TECH-03 | Defect | P1: Storage rules missing for readability paths | 04 | IMPLEMENTED |
| D-TECH-04 | Defect | P1: URL fetch proxy has no authentication validation in existing infra | 04, 10 | NOTED — requires proxy-side work |
| D-TECH-05 | Defect | P1: SSRF mitigations incomplete (IPv6, TOCTOU, cloud metadata v2) | 10 | IMPLEMENTED — expanded |
| D-TECH-06 | Defect | P2: No Claude API cost cap specified | 04 | IMPLEMENTED — added |
| E-TECH-01 | Enhancement | Per-organization cost controls and usage dashboards | 04 | DEFERRED |
| E-TECH-02 | Enhancement | Comprehensive API usage audit trail | 10 | IMPLEMENTED — made mandatory |
| E-TECH-03 | Enhancement | Disaster recovery plan for new Firestore collections | 10 | NOTED |
| E-TECH-04 | Enhancement | Proxy infrastructure requirements and scaling plan | 07, 01 | DEFERRED |
| E-TECH-05 | Enhancement | LLM provider contract/pricing change management process | 01 | NOTED |
| E-TECH-06 | Enhancement | Request signing/HMAC between frontend and proxy | 10 | DEFERRED |
| E-TECH-07 | Enhancement | Consider migrating proxy to Vercel serverless | 07 | NOTED |
| E-TECH-08 | Enhancement | Content-Type and response header validation on fetch proxy | 04 | NOTED |
| R-TECH-01 | Risk | 90-day HTML retention may violate GDPR data minimization | 03, 10 | NOTED — needs legal review |
| R-TECH-02 | Risk | Cost projections underestimate real-world usage | 04 | NOTED |
| R-TECH-03 | Risk | Single proxy instance is SPOF for entire tool | 07, 10 | NOTED |
| R-TECH-04 | Risk | DOMParser extraction data includes rawHtml/document — potential XSS vector | 07, 10 | IMPLEMENTED — removed from returned data |
| R-TECH-05 | Risk | No rate limiting enforcement mechanism exists in current proxy | 04, 10 | NOTED |
| R-TECH-06 | Risk | LLM extraction Firestore documents may exceed 1MB | 04 | IMPLEMENTED |
| R-TECH-07 | Risk | Shared analysis route has no abuse protection | 07, 11 | NOTED |
| R-TECH-08 | Risk | No versioning for scoring algorithm or extraction prompt | 04, 11 | IMPLEMENTED |
| R-TECH-09 | Risk | robots.txt override may violate LLM provider ToS | 03, 08 | NOTED |

---

## 6. SVP, User Experience Design

| ID | Type | Summary | Doc | Status |
|---|---|---|---|---|
| D-UX-01 | Defect | Dark mode completely absent from UX spec | 05 | IMPLEMENTED |
| D-UX-02 | Defect | Character counter "0 / 2,000,000" is hostile to non-technical users | 05 | IMPLEMENTED |
| D-UX-03 | Defect | Score Details and Issues tabs present overlapping content | 05 | IMPLEMENTED — added differentiation guidance |
| D-UX-04 | Defect | LLM side-by-side comparison unworkable below xl breakpoint | 05 | IMPLEMENTED — added diff view at smaller breakpoints |
| D-UX-05 | Defect | Shared view omits context for first-time viewers | 11 | IMPLEMENTED — added About section |
| D-UX-06 | Defect | No first-use experience or onboarding | 05, 07 | IMPLEMENTED — added ToolHelpPanel entry |
| D-UX-07 | Defect | 4-tab results hides top recommendations from non-technical users | 05 | IMPLEMENTED — surfaced Quick Wins above tabs |
| E-UX-01 | Enhancement | Processing screen needs engagement design for 12-15s wait | 05 | IMPLEMENTED — added "Did you know?" and partial results |
| E-UX-02 | Enhancement | Progressive disclosure for Elena vs Marcus complexity gap | 02, 05 | DEFERRED — needs product decision on view modes |
| E-UX-03 | Enhancement | Results dashboard needs visual hierarchy pass | 05 | NOTED |
| E-UX-04 | Enhancement | PDF export needs preview before generating | 11 | DEFERRED |
| E-UX-05 | Enhancement | Print stylesheet hides too much / not enough structure | 11 | NOTED |
| E-UX-06 | Enhancement | Score animation reduced-motion fallback needs spec | 05 | IMPLEMENTED |
| E-UX-07 | Enhancement | "Paste HTML" tab needs contextual helper text | 05 | IMPLEMENTED |
| E-UX-08 | Enhancement | History preview on input screen may feel cluttered | 05 | NOTED |
| O-UX-01 | Opportunity | Score breakdown micro-animation on first load | 05 | NOTED |
| O-UX-02 | Opportunity | "Share as Image" for social/Slack sharing | 11 | NOTED |
| O-UX-03 | Opportunity | Celebratory confetti for A/A+ scores | 05 | NOTED |
| O-UX-04 | Opportunity | "Explain This" contextual AI for non-technical users | 05 | NOTED |
| O-UX-05 | Opportunity | Tool-specific keyboard shortcuts | 07 | NOTED |
| O-UX-06 | Opportunity | Cross-tool deep linking from Technical Audit + Schema Generator | 02, 07 | NOTED |
| O-UX-07 | Opportunity | Personalized score benchmarking after 5+ analyses | 05 | NOTED |

---

## 7. Refinement Question Decisions (v1.2)

The following 10 product decisions were made by the Product Owner to resolve DEFERRED items from the stakeholder review:

| Q# | Question | Decision | Impact | Docs Updated |
|---|---|---|---|---|
| Q1 | AI-Specific Signals category weight | **B) Increase to 20%** — steal 5% from Content Structure (25% → 20%) | Elevates AI-specific scoring to match tool's GEO positioning | 03, 11 |
| Q2 | Batch analysis scope | **A) Keep in Phase 3** — MVP stays focused on single-URL analysis | No change needed | — |
| Q3 | Client role permissions | **A) Keep read-only** — Clients only see shared reports | No change needed | — |
| Q4 | Rate limit structure | **D) Tiered by plan** — Free: 10/hr, Pro: 30/hr, Enterprise: unlimited (200/hr safety cap) | Enables monetization path; unblocks agency use | 04, 08 |
| Q5 | "LLM Rendering Preview" naming | **D) "How AI Sees Your Content"** — plain language, user-friendly | Renamed across all 11 docs | 01, 02, 03, 04, 05, 07, 08, 09, 11 |
| Q6 | Competitive benchmarking timeline | **B) Move to Phase 2** — add basic industry benchmarks early | Key differentiator moved earlier; Phase 4 becomes advanced comparison | 01 |
| Q7 | Storage limit per user | **C) Tiered by role** — Admin: 500, PM: 250, Others: 100 | Supports agency use without unlimited storage | 03, 08 |
| Q8 | Perplexity search-augmented behavior | **C) Remove from MVP** — defer to Phase 2 once behavior is better understood | MVP launches with 3 LLMs (Claude, OpenAI, Gemini); Perplexity added in Phase 2 with appropriate UX | 01, 02, 03, 04, 05, 07, 08, 09, 10, 11 |
| Q9 | Default results view mode | **A) Summary view** — Score + quick wins + AI visibility summary (detail one click away) | Summary view is the default landing; tabs provide drill-down | 05 |
| Q10 | GEO Specialist persona | **C) Add as full new persona** — "Priya" with distinct GEO-focused goals and workflows | 5th persona added with GEO-specific user stories (citation likelihood, AI crawler access) | 02 |

### DEFERRED Items Now Resolved

| Original ID | Original Status | New Status |
|---|---|---|
| D-GEO-04 | DEFERRED | **IMPLEMENTED** (Q1) — weight increased to 20% |
| D-OPS-01 | DEFERRED | **IMPLEMENTED** (Q4) — tiered rate limits by plan |
| E-OPS-05 | DEFERRED | **CONFIRMED** (Q2) — batch stays Phase 3 |
| E-OPS-09 | DEFERRED | **IMPLEMENTED** (Q7) — tiered storage by role |
| E-OPS-11 | DEFERRED | **IMPLEMENTED** (Q6) — competitive benchmarks moved to Phase 2 |
| D-CMO-01 | DEFERRED | **CONFIRMED** (Q3) — client role stays read-only |
| E-UX-02 | DEFERRED | **IMPLEMENTED** (Q9) — summary view as default |
| O-GEO-05 | DEFERRED | **IMPLEMENTED** (Q10) — GEO Specialist persona added |

---

## Summary Statistics

| Persona | Defects | Enhancements | Opportunities/Risks | Total | Implemented (v1.1) | Implemented (v1.2) |
|---|---|---|---|---|---|---|
| SVP, GEO | 8 | 12 | 10 | 30 | 9 | 11 |
| EVP, Agency Ops | 8 | 15 | 8 | 31 | 9 | 12 |
| CMO (Client) | 6 | 7 | 6 | 19 | 6 | 6 |
| Lead Developer | 8 | 9 | 10 | 27 | 19 | 19 |
| SVP, Technology | 6 | 8 | 9 | 23 | 9 | 9 |
| SVP, UX Design | 7 | 8 | 7 | 22 | 10 | 11 |
| **TOTALS** | **43** | **59** | **50** | **152** | **62** | **68** |

> **v1.2 corrections:**
> - v1.1 total corrected from 57 → **62** (original summary under-counted EVP Ops by 2, Lead Dev by 3, SVP Tech by 1; over-counted SVP UX by 1)
> - v1.2 total: 62 + 6 (refinement questions Q1, Q4, Q6, Q7, Q9, Q10) = **68 implemented**
> - 2 additional items CONFIRMED without doc changes (Q2: E-OPS-05, Q3: D-CMO-01)

### Remaining Items Breakdown

| Status | Count | Description |
|---|---|---|
| **IMPLEMENTED** | 68 | Changes made in BRD documents |
| **CONFIRMED** | 2 | Status quo confirmed by product decision (no doc change) |
| **DEFERRED** | 26 | Require future product decisions or are post-MVP scope |
| **NOTED** | 56 | Acknowledged risks, opportunities, and observations — no doc changes needed |
| **Total** | **152** | |

---

*Review Log Version: 1.2*
*Created: 2026-02-17*
*Updated: 2026-02-17 — Fixed summary statistics counting errors; added refinement question decisions (Q1-Q10)*
