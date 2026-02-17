# AI Readability Checker — Functional Requirements

## 1. Input Methods

### 1.1 URL Input (Primary)

#### FR-1.1.1: URL Entry Field
- The tool SHALL provide a text input field for entering a URL.
- The input SHALL accept any valid HTTP or HTTPS URL.
- The input SHALL auto-prepend `https://` if no protocol is provided.
- The input SHALL display a real-time validation indicator (valid/invalid) as the user types.
- The input SHALL support paste-and-go behavior (auto-submit on paste if valid URL detected, with a brief confirmation delay).

#### FR-1.1.2: URL Validation
- The system SHALL validate URL format against RFC 3986.
- The system SHALL reject URLs pointing to:
  - Local/private IP ranges (127.x.x.x, 10.x.x.x, 192.168.x.x, 172.16-31.x.x)
  - `localhost` or `0.0.0.0`
  - Non-HTTP(S) protocols (ftp://, file://, javascript:, data:)
- The system SHALL display specific error messages for each rejection reason.
- The system SHALL accept internationalized domain names (IDN).

#### FR-1.1.3: Server-Side Content Fetching
- The system SHALL fetch URL content via a server-side proxy to avoid CORS restrictions.
- The proxy SHALL:
  - Follow redirects (up to 5 hops) and report the final URL
  - Respect `robots.txt` `User-agent: *` directives (warn user if blocked, but allow override)
  - Set a configurable User-Agent string identifying itself as the portal's analyzer
  - Enforce a 30-second timeout for fetching
  - Return HTTP status code, response headers, and response body
  - Support gzip/brotli decompression
- The system SHALL report the HTTP status code to the user (e.g., 200 OK, 301 Redirect, 403 Forbidden, 404 Not Found).
- The system SHALL handle non-HTML responses (PDF, image, JSON) with a clear message that only HTML pages are supported.

#### FR-1.1.4: JavaScript Rendering (Optional Enhancement)
- The server-side proxy SHOULD support headless browser rendering (Puppeteer/Playwright) for JavaScript-heavy pages.
- If headless rendering is available, the system SHALL offer a toggle: "Render JavaScript" (default: off for speed).
- If headless rendering is not available, the system SHALL clearly communicate this limitation and recommend HTML upload from Screaming Frog.

### 1.2 HTML File Upload

#### FR-1.2.1: File Upload Interface
- The tool SHALL provide a drag-and-drop upload zone (using `react-dropzone`, consistent with existing tools).
- The upload zone SHALL accept `.html` and `.htm` file extensions.
- The upload zone SHALL accept MIME types: `text/html`.
- The upload zone SHALL enforce a maximum file size of 10MB.
- The upload zone SHALL accept only a single file per analysis.

#### FR-1.2.2: File Validation
- The system SHALL validate that the uploaded file contains valid HTML (presence of `<html>`, `<head>`, or `<body>` tags).
- The system SHALL reject empty files with a clear error message.
- The system SHALL detect and handle different character encodings (UTF-8, ISO-8859-1, Windows-1252) by reading the `<meta charset>` declaration or HTTP-equiv header.

#### FR-1.2.3: Screaming Frog Compatibility
- The system SHALL explicitly support rendered HTML exports from Screaming Frog (produced when "JavaScript Rendering" is enabled in crawl settings).
- The system SHALL detect Screaming Frog exports by the presence of characteristic metadata or formatting patterns.
- When a Screaming Frog export is detected, the system SHALL display a confirmation indicator: "Screaming Frog rendered HTML detected."
- The tool's upload screen SHALL include a brief guide: "How to export rendered HTML from Screaming Frog" with step-by-step instructions.

### 1.3 Raw HTML Paste

#### FR-1.3.1: Paste Interface
- The tool SHALL provide a textarea/code editor for pasting raw HTML.
- The textarea SHALL support syntax highlighting for HTML.
- The textarea SHALL show a character count and enforce a 2MB maximum.
- A minimum of 100 characters SHALL be required before the "Analyze" button is enabled.
- The paste interface SHALL be accessible via a tab alongside URL and Upload inputs.

---

## 2. Analysis Engine

### 2.1 Content Extraction

#### FR-2.1.1: HTML Parsing
- The system SHALL parse the HTML document and extract:
  - **Document metadata**: `<title>`, `<meta name="description">`, `<meta name="robots">`, canonical URL, hreflang tags, Open Graph tags, Twitter Card tags
  - **Heading structure**: All `<h1>` through `<h6>` elements with hierarchy validation
  - **Body content**: All visible text content, excluding script, style, and hidden elements
  - **Structured data**: All `<script type="application/ld+json">` blocks, plus Microdata and RDFa if present
  - **Navigation elements**: `<nav>` regions, breadcrumbs, menus
  - **Media elements**: `<img>` (with alt text), `<video>`, `<audio>`, `<picture>`, `<figure>/<figcaption>`
  - **Tables**: `<table>` with headers and data, accessibility attributes
  - **Lists**: `<ol>`, `<ul>`, `<dl>` elements
  - **Links**: Internal links, external links, anchor text, `rel` attributes
  - **Forms**: `<form>` elements (noted as non-content)
  - **Semantic elements**: `<article>`, `<section>`, `<aside>`, `<main>`, `<header>`, `<footer>`
  - **ARIA landmarks**: `role="main"`, `role="navigation"`, `role="banner"`, etc.

#### FR-2.1.2: Content Cleaning
- The system SHALL strip the following before analysis:
  - Inline `<script>` and `<style>` blocks
  - HTML comments
  - Hidden elements (`display: none`, `visibility: hidden`, `aria-hidden="true"` on non-decorative content)
  - Cookie consent banners (detected by common class/ID patterns)
  - Navigation chrome (header, footer, sidebar nav — extracted separately)
- The system SHALL preserve:
  - All visible body content
  - Semantic HTML structure
  - Table data
  - Image alt text
  - Link anchor text

#### FR-2.1.3: Content Structure Mapping
- The system SHALL generate a content outline (heading tree) showing the document's hierarchical structure.
- The system SHALL identify the "main content" area (using `<main>`, `<article>`, or heuristic detection).
- The system SHALL calculate content-to-code ratio (visible text bytes / total HTML bytes).
- The system SHALL detect the primary language of the content via `<html lang>` attribute and content analysis.

### 2.2 Scoring System

#### FR-2.2.1: Overall Score Calculation
- The overall AI Readability Score SHALL be calculated as a weighted average of category scores:

| Category | Weight | Description |
|---|---|---|
| Content Structure | 25% | Heading hierarchy, semantic HTML, logical flow |
| Content Clarity | 25% | Readability, complexity, answer-friendliness |
| Technical Accessibility | 20% | Render method, crawl signals, load dependencies |
| Metadata & Schema | 15% | Title, description, OG tags, structured data |
| AI-Specific Signals | 15% | Freshness, authority, citation-friendliness |

- The overall score SHALL be a number from 0 to 100, rounded to the nearest integer.

#### FR-2.2.2: Content Structure Scoring (25%)

The following checks SHALL be performed:

| Check ID | Check | Pass Criteria | Weight |
|---|---|---|---|
| CS-01 | Single H1 present | Exactly one `<h1>` tag | High |
| CS-02 | Heading hierarchy valid | No skipped levels (e.g., H1 to H3 without H2) | High |
| CS-03 | Semantic HTML usage | `<article>`, `<section>`, `<main>` present | Medium |
| CS-04 | Content organized in sections | Content divided into logical section or heading-delimited blocks | Medium |
| CS-05 | Lists used for enumerable content | `<ul>`/`<ol>` present where appropriate | Low |
| CS-06 | Tables used for tabular data | `<table>` with `<thead>`/`<th>` when tabular content is detected | Medium |
| CS-07 | Paragraph length reasonable | Average paragraph < 150 words | Low |
| CS-08 | Content depth sufficient | Main content > 300 words | Medium |
| CS-09 | Logical reading order | DOM order matches visual reading order | Medium |
| CS-10 | No content duplication | No large blocks of identical content | Low |

#### FR-2.2.3: Content Clarity Scoring (25%)

| Check ID | Check | Pass Criteria | Weight |
|---|---|---|---|
| CC-01 | Flesch Reading Ease | Score >= 60 (8th grade level or below) | High |
| CC-02 | Average sentence length | <= 20 words per sentence | Medium |
| CC-03 | Passive voice usage | < 15% of sentences | Low |
| CC-04 | Jargon/acronym density | < 5% of words are unexplained jargon | Medium |
| CC-05 | Answer-ready content | Contains direct answers to implied questions (detected via Q&A pattern analysis) | High |
| CC-06 | Topic sentence presence | Each section begins with a clear topic sentence | Medium |
| CC-07 | Conclusion/summary present | Content ends with a summary or conclusion section | Low |
| CC-08 | Entity clarity | Key entities (people, organizations, products) are clearly defined | Medium |
| CC-09 | Factual claim attribution | Claims are attributed to sources where appropriate | Medium |
| CC-10 | Content freshness language | Date references, "updated" language, temporal markers present | Low |

#### FR-2.2.4: Technical Accessibility Scoring (20%)

| Check ID | Check | Pass Criteria | Weight |
|---|---|---|---|
| TA-01 | Server-side rendering | Content available in initial HTML (not purely JS-rendered) | Critical |
| TA-02 | Robots meta tag | No `noindex`, `nofollow`, or `noai` directives blocking LLM access | Critical |
| TA-03 | robots.txt | Page not blocked by `robots.txt` for major AI crawlers | High |
| TA-04 | Canonical URL set | `<link rel="canonical">` present and correct | Medium |
| TA-05 | Page load weight | Total HTML < 2MB | Medium |
| TA-06 | Inline CSS/JS minimal | Inline styles/scripts < 20% of total page size | Low |
| TA-07 | Content-to-code ratio | > 25% of page is visible content | Medium |
| TA-08 | No content behind interactions | Content not gated by tabs, accordions, or click-to-expand without proper HTML | High |
| TA-09 | Image alt text coverage | > 90% of `<img>` elements have `alt` attributes | Medium |
| TA-10 | Structured data valid | JSON-LD parses without errors | Medium |

#### FR-2.2.5: Metadata & Schema Scoring (15%)

| Check ID | Check | Pass Criteria | Weight |
|---|---|---|---|
| MS-01 | Title tag present and optimal | `<title>` present, 30-60 characters | High |
| MS-02 | Meta description present and optimal | `<meta name="description">` present, 120-160 characters | High |
| MS-03 | Open Graph tags complete | `og:title`, `og:description`, `og:image`, `og:url` present | Medium |
| MS-04 | Twitter Card tags present | `twitter:card`, `twitter:title`, `twitter:description` present | Low |
| MS-05 | JSON-LD structured data present | At least one `<script type="application/ld+json">` block | High |
| MS-06 | Schema.org type appropriate | Schema type matches content type (Article, Product, FAQ, etc.) | Medium |
| MS-07 | Author/publisher marked up | `author` or `publisher` present in structured data | Medium |
| MS-08 | Date published/modified present | `datePublished` and/or `dateModified` in structured data or meta tags | Medium |
| MS-09 | Breadcrumb markup present | BreadcrumbList schema or `<nav>` breadcrumbs | Low |
| MS-10 | FAQ/HowTo schema when applicable | FAQ or HowTo schema present when content matches those patterns | Medium |

#### FR-2.2.6: AI-Specific Signals Scoring (15%)

| Check ID | Check | Pass Criteria | Weight |
|---|---|---|---|
| AS-01 | Content uniqueness signals | No boilerplate/template content detected in main body | High |
| AS-02 | Source attribution | External sources are linked/cited | Medium |
| AS-03 | Author expertise indicators | Author bio, credentials, or expertise signals present | Medium |
| AS-04 | Content freshness | Publication or modification date within 12 months (context-dependent) | Medium |
| AS-05 | Quotable passages | Contains concise, self-contained statements suitable for LLM citation | High |
| AS-06 | Definition patterns | Key terms are explicitly defined | Medium |
| AS-07 | Comparison/contrast patterns | Content uses clear comparison structures when relevant | Low |
| AS-08 | Step-by-step patterns | Instructional content uses numbered/ordered steps | Medium |
| AS-09 | Data/statistics present | Content includes specific data points and statistics | Low |
| AS-10 | Internal linking context | Internal links have descriptive anchor text providing context | Medium |

### 2.3 AI-Powered Analysis

#### FR-2.3.1: Claude-Powered Assessment
- The system SHALL send the extracted content to the Claude API for intelligent analysis.
- The Claude API call SHALL use the existing proxy infrastructure (`VITE_AI_PROXY_URL`).
- The Claude prompt SHALL request:
  1. A content summary identifying the page's primary topic and purpose
  2. An assessment of content clarity and organization from an LLM's perspective
  3. Identification of specific issues that would hinder LLM comprehension
  4. Prioritized recommendations with specific, actionable fix descriptions
  5. Assessment of citation-worthiness (how likely the content is to be cited in AI answers)
- The Claude response SHALL be parsed and integrated into the scoring system.
- If the Claude API is unavailable, the system SHALL fall back to rule-based scoring only and display a notice.

#### FR-2.3.2: Scoring Integration
- Claude's qualitative assessment SHALL influence scores in the Content Clarity and AI-Specific Signals categories.
- Claude's assessment SHALL contribute up to 30% of each influenced category's score (remainder from rule-based checks).
- The system SHALL clearly indicate which portions of the analysis are AI-generated vs. rule-based.

---

## 3. LLM Rendering Preview

### 3.1 Content Extraction per LLM

#### FR-3.1.1: Extraction Methodology
- For each supported LLM, the system SHALL send the page content with a standardized extraction prompt.
- The extraction prompt SHALL ask the LLM to:
  1. Extract and return the main content as structured text
  2. Identify the page title, description, and primary topic
  3. List all headings and their hierarchy
  4. Extract key entities (people, organizations, products, concepts)
  5. Identify any content that it cannot process or understand
  6. Assess the page's usefulness for answering user questions
- Each LLM's response SHALL be displayed in a consistent, normalized format.

#### FR-3.1.2: Supported LLMs
The system SHALL support rendering previews for the following LLMs:

| LLM | API | Model | Priority |
|---|---|---|---|
| Claude (Anthropic) | Messages API | claude-sonnet-4-5-20250929 | MVP |
| GPT (OpenAI) | Chat Completions API | gpt-4o | MVP |
| Gemini (Google) | Generative Language API | gemini-2.0-flash | MVP |
| Perplexity | Chat Completions API | sonar-pro | MVP |

#### FR-3.1.3: Response Normalization
- Each LLM's extraction SHALL be normalized into a common data structure:
  ```
  {
    llm: string,
    model: string,
    extractedTitle: string,
    extractedDescription: string,
    primaryTopic: string,
    headings: [{ level: number, text: string }],
    mainContent: string (markdown),
    entities: [{ name: string, type: string }],
    unprocessableContent: [{ description: string, reason: string }],
    usefulnessAssessment: { score: number, explanation: string },
    rawResponse: string,
    processingTimeMs: number
  }
  ```

### 3.2 Comparison Features

#### FR-3.2.1: Side-by-Side View
- The system SHALL display LLM extractions in a configurable side-by-side layout.
- Users SHALL be able to select which LLMs to compare (2-4 at a time).
- Each column SHALL show: LLM name/logo, extracted content in markdown, key metrics.

#### FR-3.2.2: Difference Highlighting
- The system SHALL identify and highlight differences between LLM extractions:
  - **Content present in one but missing in another** — highlighted with the source LLM's color
  - **Content reformulated differently** — shown with a diff-style marker
  - **Metadata discrepancies** — flagged in a summary row
- Difference detection SHALL operate on a paragraph/section level (not word-level).

#### FR-3.2.3: Coverage Metrics
- For each LLM, the system SHALL calculate:
  - **Content Coverage %** — percentage of the original page's main content that appears in the extraction
  - **Heading Coverage %** — percentage of headings captured
  - **Entity Coverage %** — percentage of key entities identified
  - **Metadata Accuracy** — how accurately the LLM extracted title, description, and topic

---

## 4. Recommendations Engine

### 4.1 Recommendation Generation

#### FR-4.1.1: Rule-Based Recommendations
- For every failed or warning-level check, the system SHALL generate a corresponding recommendation.
- Each recommendation SHALL include:
  - **Title**: Brief description of the fix (e.g., "Add missing H2 between H1 and H3")
  - **Description**: Detailed explanation of why this matters for AI readability
  - **Category**: Which scoring category this affects
  - **Priority**: Critical / High / Medium / Low
  - **Effort**: Quick Fix / Moderate / Significant
  - **Expected Impact**: Estimated score improvement (points)
  - **Code Snippet** (where applicable): Before/after HTML demonstrating the fix

#### FR-4.1.2: AI-Generated Recommendations
- Claude SHALL generate additional context-aware recommendations not covered by rules.
- AI recommendations SHALL be clearly labeled as "AI-Suggested" with a distinct visual indicator.
- AI recommendations SHALL include the same fields as rule-based recommendations.
- The system SHALL generate a maximum of 5 AI-specific recommendations per analysis.

### 4.2 Recommendation Grouping

#### FR-4.2.1: Priority Groups
Recommendations SHALL be grouped into the following actionable categories:

| Group | Description | Criteria |
|---|---|---|
| **Quick Wins** | High impact, low effort | Priority >= High AND Effort = Quick Fix |
| **Structural Improvements** | Changes to content organization | Category = Content Structure |
| **Content Enhancements** | Changes to content itself | Category = Content Clarity or AI Signals |
| **Technical Fixes** | Code-level changes | Category = Technical Accessibility or Metadata |

---

## 5. Analysis History & Persistence

### 5.1 Data Storage

#### FR-5.1.1: Analysis Record
- Each completed analysis SHALL be persisted to Firestore.
- See document `04-api-integration-and-data-architecture.md` for the complete data model.

#### FR-5.1.2: Storage Limits
- Users SHALL be limited to 100 stored analyses (oldest auto-archived after limit).
- HTML snapshots SHALL be stored in Firebase Storage with a 90-day retention policy.
- LLM extraction raw responses SHALL be stored for 30 days, then reduced to summary data only.

### 5.2 History Interface

#### FR-5.2.1: History List View
- The tool SHALL provide a history tab showing all past analyses.
- Each history item SHALL display: URL/filename, date, overall score, score badge, and input method icon.
- The list SHALL support: sorting (date, score), filtering (date range, score range, input method), and search (URL text).
- Pagination SHALL display 20 items per page.

#### FR-5.2.2: Re-Analysis
- Users SHALL be able to re-analyze a URL from the history view with a single click.
- Re-analysis SHALL create a new history entry (not overwrite the previous one).
- The results view SHALL show a delta indicator if a previous analysis exists for the same URL.

---

## 6. Home Screen Integration

### 6.1 Tool Card

#### FR-6.1.1: Tool Registry Entry
- The AI Readability Checker SHALL be added to `src/config/tools.js` with the following configuration:
  - `id`: `'readability'`
  - `name`: `'AI Readability Checker'`
  - `shortName`: `'Readability'`
  - `description`: Concise description of the tool's purpose
  - `icon`: Appropriate Lucide icon (e.g., `Brain`, `ScanEye`, or `BookOpenCheck`)
  - `path`: `'/app/readability'`
  - `color`: A new color not already used by existing tools (e.g., `'teal'` or `'indigo'`)
  - `status`: `TOOL_STATUS.ACTIVE`
  - `badge`: `'New'`
  - `features`: Array of 4 key feature bullets
  - `statsConfig`: Analyses completed count
  - `permissions`: `['canRunReadabilityCheck']`
  - `order`: `7` (before Coming Soon tools)

#### FR-6.1.2: Quick Action
- A quick action button for AI Readability SHALL be added to the home screen Quick Actions section.
- The quick action SHALL use the tool's theme color and icon.

---

*Document Version: 1.0*
*Created: 2026-02-17*
*Last Updated: 2026-02-17*
*Status: Draft*
