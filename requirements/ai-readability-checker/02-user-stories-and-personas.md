# AI Readability Checker — User Stories & Personas

## 1. User Personas

### 1.1 Persona: Sarah — Senior SEO Specialist

| Attribute | Detail |
|---|---|
| **Role** | Senior SEO Specialist at a mid-size digital agency |
| **Experience** | 6 years in SEO, advanced Screaming Frog user |
| **Technical Skill** | Intermediate — comfortable with HTML, understands structured data, does not write backend code |
| **Goals** | Ensure client websites rank in both traditional and AI-powered search results |
| **Pain Points** | No visibility into how LLMs interpret client content; clients asking about "AI SEO" with no tools to audit it |
| **Portal Usage** | Uses Technical Audit, Content Planner, and Schema Generator weekly |
| **AI Readability Context** | Wants to add AI readability audits to her standard client deliverable package |

### 1.2 Persona: Marcus — Web Developer

| Attribute | Detail |
|---|---|
| **Role** | Front-end developer at an enterprise SaaS company |
| **Experience** | 4 years in web development, React/Next.js specialist |
| **Technical Skill** | Advanced — writes code daily, comfortable with APIs and browser DevTools |
| **Goals** | Ensure the company's JS-heavy web application renders properly for AI crawlers |
| **Pain Points** | Client-side rendered content may be invisible to LLM crawlers; no way to test this without manually querying each LLM |
| **Portal Usage** | Uses Technical Audit and Accessibility Analyzer |
| **AI Readability Context** | Needs to verify that SSR/hydration strategies work for AI crawlers, not just Googlebot |

### 1.3 Persona: Elena — Content Strategist

| Attribute | Detail |
|---|---|
| **Role** | Head of Content at a B2B technology company |
| **Experience** | 8 years in content marketing, manages a team of 5 writers |
| **Technical Skill** | Basic — uses CMS, reads analytics, does not inspect source code |
| **Goals** | Ensure her team's content is structured for maximum visibility across all search surfaces |
| **Pain Points** | Content performs well in traditional search but is never cited in AI answers; unsure what to change |
| **Portal Usage** | Uses Content Planner and Meta Data Generator |
| **AI Readability Context** | Wants a simple score and clear recommendations she can hand to her writers |

### 1.4 Persona: James — Agency Director

| Attribute | Detail |
|---|---|
| **Role** | Director at a boutique SEO consultancy |
| **Experience** | 12 years in digital marketing, manages 15-person team |
| **Technical Skill** | Moderate — understands technical SEO concepts, delegates implementation |
| **Goals** | Differentiate agency offerings with cutting-edge AI readability audits |
| **Pain Points** | Clients are asking about AI search optimization; needs professional reports to present findings |
| **Portal Usage** | Reviews exports and reports from all tools |
| **AI Readability Context** | Needs polished, exportable reports that demonstrate value to enterprise clients |

---

## 2. User Stories

### 2.1 Input & Analysis

#### US-2.1.1: Analyze a URL
**As** Sarah (SEO Specialist),
**I want to** enter a URL and receive an AI readability analysis,
**So that** I can quickly assess how well a page performs for AI search engines.

**Acceptance Criteria:**
- [ ] User can enter a fully qualified URL (including protocol) in a text input field
- [ ] System validates the URL format before submission
- [ ] System fetches the page content via a server-side proxy (to handle CORS and JS rendering)
- [ ] Processing state is shown with a progress indicator and stage messages
- [ ] Analysis results are displayed within 15 seconds for typical pages
- [ ] If the URL is unreachable, a clear error message is shown with suggested next steps
- [ ] The URL is saved in the analysis history for future reference

#### US-2.1.2: Upload Rendered HTML
**As** Marcus (Web Developer),
**I want to** upload the rendered HTML file exported from Screaming Frog (with JS crawling enabled),
**So that** I can analyze JavaScript-rendered content that a simple HTTP fetch would miss.

**Acceptance Criteria:**
- [ ] User can drag-and-drop or click to upload an `.html` or `.htm` file
- [ ] Maximum file size of 10MB is enforced with a clear error if exceeded
- [ ] System parses the uploaded HTML and extracts content for analysis
- [ ] Upload provides the same analysis results as the URL input method
- [ ] User sees a clear explanation of why HTML upload is useful (JS-rendered content)
- [ ] The filename and upload timestamp are recorded in analysis history

#### US-2.1.3: Paste Raw HTML
**As** Marcus (Web Developer),
**I want to** paste raw HTML source code directly into the tool,
**So that** I can quickly test content without needing a live URL or saved file.

**Acceptance Criteria:**
- [ ] User can switch to a "Paste HTML" tab/mode
- [ ] A code editor textarea accepts pasted HTML content
- [ ] Minimum of 100 characters required to trigger analysis
- [ ] Maximum of 2MB of pasted content accepted
- [ ] System parses the pasted HTML identically to the upload path

---

### 2.2 Readability Scoring

#### US-2.2.1: View Overall AI Readability Score
**As** Elena (Content Strategist),
**I want to** see a single, easy-to-understand AI Readability Score for my page,
**So that** I can quickly determine if the content needs improvement for AI search.

**Acceptance Criteria:**
- [ ] Score is displayed as a number from 0-100
- [ ] Score is accompanied by a letter grade (A+ through F) and color-coded indicator
- [ ] Score thresholds: A+ (95-100), A (90-94), B+ (85-89), B (80-84), C+ (75-79), C (70-74), D (60-69), F (< 60)
- [ ] Score is prominently displayed at the top of the results view
- [ ] A brief, plain-language summary explains what the score means
- [ ] Score breakdown by category is visible immediately below

#### US-2.2.2: View Category Breakdown
**As** Sarah (SEO Specialist),
**I want to** see how my page scores across specific AI readability categories,
**So that** I can identify which areas need the most attention.

**Acceptance Criteria:**
- [ ] Scores are broken down into the following categories (each scored 0-100):
  - **Content Structure** — Heading hierarchy, semantic HTML, logical content flow
  - **Content Clarity** — Readability level, sentence complexity, jargon density, answer-friendliness
  - **Technical Accessibility** — Render method, load dependencies, robots/meta directives, crawl signals
  - **Metadata & Schema** — Title, description, Open Graph, structured data completeness
  - **AI-Specific Signals** — Content freshness signals, author/source authority indicators, citation-friendliness
- [ ] Each category shows its score, a short description, and an expand/collapse detail view
- [ ] Categories are visually represented with a radar/spider chart or horizontal bar chart
- [ ] Color coding matches the grade scale (green = good, yellow = needs work, red = poor)

#### US-2.2.3: View Issue-Level Detail
**As** Marcus (Web Developer),
**I want to** drill into specific issues found within each category,
**So that** I can understand exactly what to fix and how.

**Acceptance Criteria:**
- [ ] Each category expands to show a list of individual checks/rules
- [ ] Each check shows: status (pass/warn/fail), title, description, and affected element(s)
- [ ] Failed checks include a specific recommendation for remediation
- [ ] Checks are ordered by severity (critical > warning > info > pass)
- [ ] Where applicable, the affected HTML element or content snippet is highlighted
- [ ] Each check links to relevant documentation or educational content

---

### 2.3 LLM Rendering Preview

#### US-2.3.1: View Claude Rendering Preview
**As** Sarah (SEO Specialist),
**I want to** see exactly what Claude (Anthropic) extracts from my page,
**So that** I understand what content is visible vs. invisible to this LLM.

**Acceptance Criteria:**
- [ ] A dedicated tab/panel shows Claude's view of the page content
- [ ] Content is displayed as structured text (headings, paragraphs, lists, tables)
- [ ] Missing or unrenderable content sections are clearly flagged
- [ ] Metadata extracted by Claude (title, description, key topics) is shown
- [ ] The rendering is generated by sending the page content to the Claude API and displaying the structured extraction

#### US-2.3.2: View OpenAI (GPT) Rendering Preview
**As** Sarah (SEO Specialist),
**I want to** see what OpenAI's models extract from my page,
**So that** I can compare it against other LLMs and identify discrepancies.

**Acceptance Criteria:**
- [ ] A dedicated tab/panel shows OpenAI's extraction of the page content
- [ ] Same display format as the Claude preview for easy comparison
- [ ] Any differences from Claude's extraction are visually highlighted
- [ ] Integration uses the OpenAI API (chat completions with a content extraction prompt)

#### US-2.3.3: View Google Gemini Rendering Preview
**As** Sarah (SEO Specialist),
**I want to** see what Google's Gemini model extracts from my page,
**So that** I can optimize for Google AI Overviews specifically.

**Acceptance Criteria:**
- [ ] A dedicated tab/panel shows Gemini's extraction of the page content
- [ ] Same display format as other LLM previews
- [ ] Integration uses the Google Gemini API
- [ ] Highlights Google-specific considerations (structured data alignment, Knowledge Graph signals)

#### US-2.3.4: View Perplexity Rendering Preview
**As** Sarah (SEO Specialist),
**I want to** see what Perplexity extracts from my page,
**So that** I can optimize for this increasingly popular AI search engine.

**Acceptance Criteria:**
- [ ] A dedicated tab/panel shows Perplexity's extraction of the page content
- [ ] Same display format as other LLM previews
- [ ] Integration uses the Perplexity API (or equivalent)
- [ ] Highlights citation-related signals (how likely the content is to be cited in a Perplexity answer)

#### US-2.3.5: Side-by-Side LLM Comparison
**As** Marcus (Web Developer),
**I want to** compare LLM renderings side-by-side,
**So that** I can quickly identify which LLMs are missing content or interpreting it differently.

**Acceptance Criteria:**
- [ ] User can select 2-4 LLMs for side-by-side comparison
- [ ] Comparison view displays selected LLM extractions in equal-width columns
- [ ] Content differences are visually highlighted (additions, omissions, reformulations)
- [ ] A summary row shows key metrics for each LLM (content coverage %, elements detected, metadata extracted)
- [ ] Responsive layout collapses to stacked view on smaller screens
- [ ] User can toggle between "side-by-side" and "diff" view modes

---

### 2.4 Recommendations

#### US-2.4.1: View Prioritized Recommendations
**As** Elena (Content Strategist),
**I want to** see a prioritized list of recommendations for improving AI readability,
**So that** I know exactly what changes will have the biggest impact.

**Acceptance Criteria:**
- [ ] Recommendations are ranked by estimated impact (High / Medium / Low)
- [ ] Each recommendation includes: title, description, category, estimated effort, and expected score impact
- [ ] Recommendations are grouped by type: Quick Wins, Structural Changes, Technical Fixes, Content Improvements
- [ ] "Quick Wins" (high impact, low effort) are promoted to the top
- [ ] Each recommendation is actionable — describes the specific change to make
- [ ] AI-generated recommendations use Claude to provide context-aware, page-specific suggestions

#### US-2.4.2: View Code-Level Suggestions
**As** Marcus (Web Developer),
**I want to** see specific code changes recommended for technical issues,
**So that** I can implement fixes directly without needing to research the solution.

**Acceptance Criteria:**
- [ ] Technical recommendations include before/after code snippets
- [ ] Code snippets are syntax-highlighted (HTML, JSON-LD, meta tags)
- [ ] Snippets can be copied to clipboard with a single click
- [ ] Code suggestions are generated based on the actual page content, not generic templates

---

### 2.5 History & Persistence

#### US-2.5.1: View Analysis History
**As** Sarah (SEO Specialist),
**I want to** see a history of all my previous analyses,
**So that** I can track changes over time and re-visit past results.

**Acceptance Criteria:**
- [ ] History list shows: URL/filename, date, overall score, and score change indicator
- [ ] History is sorted by date (most recent first) with pagination
- [ ] User can search/filter history by URL, date range, or score range
- [ ] Clicking a history item opens the full analysis results
- [ ] History is persisted in Firestore under the user's account
- [ ] Users can delete individual history items

#### US-2.5.2: Compare Historical Analyses
**As** Sarah (SEO Specialist),
**I want to** compare two analyses of the same URL over time,
**So that** I can verify that my changes improved the AI readability score.

**Acceptance Criteria:**
- [ ] User can select two analyses of the same URL for comparison
- [ ] Comparison shows score deltas (overall and per-category)
- [ ] Issues resolved and new issues introduced are clearly listed
- [ ] A visual timeline shows score progression for frequently analyzed URLs

---

### 2.6 Export & Sharing

#### US-2.6.1: Export Analysis as PDF
**As** James (Agency Director),
**I want to** export a polished PDF report of the AI readability analysis,
**So that** I can include it in client deliverables.

**Acceptance Criteria:**
- [ ] PDF includes: cover page, executive summary, overall score, category breakdown, LLM previews (summarized), recommendations, and methodology notes
- [ ] PDF uses the portal's branding and design system typography
- [ ] PDF generation completes within 5 seconds
- [ ] User can customize the report title and add client branding (logo, company name)
- [ ] Export is accessible from the results dashboard via a clearly labeled button

#### US-2.6.2: Export Analysis as JSON
**As** Marcus (Web Developer),
**I want to** export the raw analysis data as JSON,
**So that** I can integrate it into our development workflow and CI/CD pipeline.

**Acceptance Criteria:**
- [ ] JSON export includes all analysis data: scores, issues, recommendations, and LLM extractions
- [ ] JSON schema is documented and consistent across exports
- [ ] File is named with the URL slug and timestamp for easy identification
- [ ] Export is accessible from the results dashboard

#### US-2.6.3: Share Analysis via Link
**As** Sarah (SEO Specialist),
**I want to** share a read-only link to an analysis with a client or colleague,
**So that** they can view the results without needing a portal account.

**Acceptance Criteria:**
- [ ] User can generate a shareable link from the results dashboard
- [ ] Shared link provides read-only access (no editing, no history, no export)
- [ ] Shared links expire after 30 days by default (configurable)
- [ ] Link recipients see a branded, clean view of the results
- [ ] No authentication required to view shared links

---

### 2.7 Integration with Existing Tools

#### US-2.7.1: Launch from Technical Audit
**As** Sarah (SEO Specialist),
**I want to** run an AI readability check on a URL directly from my Technical Audit results,
**So that** I can extend my audit workflow without context-switching.

**Acceptance Criteria:**
- [ ] Technical Audit results include an "AI Readability" action button per URL
- [ ] Clicking the button opens the AI Readability Checker pre-filled with that URL
- [ ] If the audit includes rendered HTML (from Screaming Frog JS crawl), it is automatically used
- [ ] The analysis links back to the originating audit for context

#### US-2.7.2: Include in Export Hub
**As** James (Agency Director),
**I want to** access AI Readability reports from the Export Hub,
**So that** I can bundle them with other tool exports in a single download.

**Acceptance Criteria:**
- [ ] AI Readability analyses appear in the Export Hub alongside other tool exports
- [ ] User can select multiple analyses for batch export
- [ ] Bundle export includes both PDF and JSON formats

---

## 3. User Journey Maps

### 3.1 Primary Journey: URL Analysis (Sarah)

```
Landing on Tool -> Enter URL -> Validate -> Show Processing -> View Score ->
Explore Categories -> Review LLM Previews -> Read Recommendations ->
Export PDF -> Share with Client
```

**Touchpoints:**
1. **Home Screen** — Clicks "AI Readability" tool card
2. **Input Screen** — Enters URL, optionally provides context (industry, target keywords)
3. **Processing Screen** — Sees progress bar with stage messages (Fetching > Analyzing > Scoring)
4. **Results Dashboard** — Views overall score, category breakdown, and quick recommendations
5. **LLM Preview Tab** — Compares renderings across 4 LLMs
6. **Recommendations Tab** — Reviews prioritized action items
7. **Export** — Generates PDF report
8. **Share** — Copies shareable link for client review

### 3.2 Secondary Journey: HTML Upload (Marcus)

```
Landing on Tool -> Switch to Upload Tab -> Drag & Drop HTML -> Process ->
View Score -> Deep Dive into Technical Issues -> Copy Code Fixes ->
Implement Changes -> Re-analyze URL to Verify
```

### 3.3 Tertiary Journey: Quick Check (Elena)

```
Landing on Tool -> Enter URL -> View Score & Summary -> Read Top 3 Recommendations ->
Forward Recommendations to Writing Team
```

---

## 4. Role-Based Access

| Portal Role | AI Readability Permissions |
|---|---|
| **Admin** | Full access: analyze, view history, export, share, delete, manage settings |
| **Project Manager** | Analyze, view history, export, share |
| **SEO Specialist** | Analyze, view history, export, share |
| **Developer** | Analyze, view history, export |
| **Content Writer** | Analyze, view own history, export |
| **Client** | View shared analyses only (read-only) |

---

*Document Version: 1.0*
*Created: 2026-02-17*
*Last Updated: 2026-02-17*
*Status: Draft*
