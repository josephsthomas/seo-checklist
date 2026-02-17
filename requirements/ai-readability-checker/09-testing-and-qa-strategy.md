# AI Readability Checker — Testing & QA Strategy

## 1. Testing Framework

Consistent with the existing portal testing stack:

| Tool | Purpose |
|---|---|
| **Vitest** | Unit and integration test runner |
| **React Testing Library** | Component rendering and interaction testing |
| **jsdom** | DOM simulation for Node.js test environment |
| **MSW (Mock Service Worker)** | API mocking for LLM and fetch proxy calls |

---

## 2. Unit Tests

### 2.1 Content Extraction (`lib/readability/extractor.js`)

| Test | Input | Expected Output |
|---|---|---|
| Extracts title tag | `<title>Test Page</title>` | `metadata.title === 'Test Page'` |
| Extracts meta description | `<meta name="description" content="...">` | `metadata.description === '...'` |
| Extracts heading tree | HTML with H1-H6 | Correct heading array with levels |
| Identifies main content | HTML with `<main>` tag | `mainContent` contains main element content |
| Identifies main content (heuristic) | HTML without `<main>` | Largest content block selected |
| Strips script tags | HTML with inline scripts | No script content in output |
| Strips style tags | HTML with inline styles | No style content in output |
| Strips hidden elements | `display:none` elements | Hidden content excluded |
| Extracts structured data | JSON-LD script block | Parsed JSON-LD object |
| Handles malformed JSON-LD | Invalid JSON in LD block | Error logged, null returned |
| Extracts images with alt text | `<img src="..." alt="...">` | Image array with alt text |
| Calculates content-to-code ratio | Known HTML | Correct percentage |
| Detects language | `<html lang="en">` | `language === 'en'` |
| Handles empty HTML | `<html></html>` | Empty content, metadata defaults |
| Handles encoding | Windows-1252 content | Correctly decoded text |
| Detects Screaming Frog export | SF-exported HTML | `isScreamingFrogExport === true` |

### 2.2 Scoring Engine (`lib/readability/scorer.js`)

Test each of the 50 checks individually:

**Content Structure (CS-01 through CS-10):**

| Test | Input | Expected |
|---|---|---|
| CS-01 pass: single H1 | HTML with one H1 | status: 'pass' |
| CS-01 fail: no H1 | HTML with no H1 | status: 'fail' |
| CS-01 fail: multiple H1s | HTML with two H1s | status: 'fail' |
| CS-02 pass: valid hierarchy | H1 > H2 > H3 | status: 'pass' |
| CS-02 fail: skipped level | H1 > H3 (no H2) | status: 'fail' |
| CS-03 pass: semantic HTML | `<article>`, `<main>` present | status: 'pass' |
| CS-03 warn: partial semantic | Only `<main>`, no `<article>` | status: 'warn' |
| CS-08 pass: sufficient content | 500 word main content | status: 'pass' |
| CS-08 fail: thin content | 50 word main content | status: 'fail' |

**Content Clarity (CC-01 through CC-10):**

| Test | Input | Expected |
|---|---|---|
| CC-01 pass: readable text | Flesch score 70 | status: 'pass' |
| CC-01 fail: complex text | Flesch score 30 | status: 'fail' |
| CC-02 pass: short sentences | Avg 15 words/sentence | status: 'pass' |
| CC-02 fail: long sentences | Avg 30 words/sentence | status: 'fail' |

**Technical Accessibility (TA-01 through TA-10):**

| Test | Input | Expected |
|---|---|---|
| TA-01 pass: SSR content | Full HTML content | status: 'pass' |
| TA-01 fail: empty body | `<body><div id="root"></div>` only | status: 'fail' |
| TA-02 pass: indexable | No noindex meta | status: 'pass' |
| TA-02 fail: noindex | `<meta name="robots" content="noindex">` | status: 'fail' |

(Similar pattern for all 50 checks)

**Score Calculation:**

| Test | Input | Expected |
|---|---|---|
| Overall score: weighted average | Known category scores | Correct weighted result |
| Grade mapping: A+ | Score 97 | grade: 'A+' |
| Grade mapping: F | Score 45 | grade: 'F' |
| Grade mapping: boundary | Score 90 | grade: 'A' |
| All checks pass | Perfect content | Score close to 100 |
| All checks fail | Terrible content | Score close to 0 |

### 2.3 Text Analysis Utilities (`lib/readability/utils/textAnalysis.js`)

| Test | Input | Expected |
|---|---|---|
| Word count | "Hello world test" | 3 |
| Sentence count | "First. Second. Third." | 3 |
| Average sentence length | "One two three. Four five." | 2.5 words |
| Flesch Reading Ease | Known text sample | Known score (within 2 points) |
| Passive voice detection | "The ball was thrown." | 1 passive sentence |
| Paragraph count | HTML with `<p>` tags | Correct count |
| Jargon detection | Text with acronyms | Detected unexpanded acronyms |

### 2.4 URL Validation (`lib/readability/utils/urlValidation.js`)

| Test | Input | Expected |
|---|---|---|
| Valid HTTPS URL | "https://example.com" | valid: true |
| Valid HTTP URL | "http://example.com" | valid: true |
| No protocol (auto-fix) | "example.com" | url: "https://example.com" |
| Invalid format | "not a url" | valid: false |
| Private IP blocked | "http://192.168.1.1" | valid: false, reason: 'private_ip' |
| Localhost blocked | "http://localhost" | valid: false, reason: 'localhost' |
| FTP protocol blocked | "ftp://example.com" | valid: false, reason: 'invalid_protocol' |
| IDN domain accepted | "https://xn--n3h.example.com" | valid: true |
| URL with path/params | "https://example.com/page?q=1" | valid: true |

### 2.5 Recommendations Engine (`lib/readability/recommendations.js`)

| Test | Input | Expected |
|---|---|---|
| Failed check generates rec | CS-01 failed | Recommendation with title, priority, effort |
| Quick win identification | High priority + quick fix effort | group: 'quick-wins' |
| Code snippet generated | MS-01 missing title | before/after HTML snippet |
| Max 5 AI recommendations | Claude returns 8 | Only 5 AI recs in output |
| Recs sorted by priority | Mixed priority recs | Critical first, then high, medium, low |

---

## 3. Integration Tests

### 3.1 Analysis Pipeline

| Test | Description |
|---|---|
| Full URL analysis flow | Mock fetch + Claude + score = complete results |
| Full HTML upload flow | Provide HTML + run pipeline = complete results |
| Partial LLM failure | 1 of 3 LLMs fail; remaining 2 succeed; scores calculated |
| All LLMs fail | Rule-based scoring only; no LLM preview data |
| Claude failure fallback | Claude fails; scores use rules only (0% AI weight) |
| Cancel mid-analysis | AbortController cancels in-flight; no partial save |
| Re-analysis delta | Analyze same URL twice; delta calculated correctly |

### 3.2 Firestore Integration

| Test | Description |
|---|---|
| Save analysis | Write to readability-analyses; verify document structure |
| Load analysis by ID | Read document; map to expected format |
| List user analyses | Query with userId filter; correct sort order |
| Delete analysis | Remove document; verify gone |
| History pagination | 25 items; load first 20, then next 5 |
| Share token generation | Create shareToken; verify readable without auth |
| Share expiry | Expired share token returns access denied |
| Storage limit (100) | 101st analysis archives oldest |

### 3.3 API Integration (with MSW mocks)

| Test | Description |
|---|---|
| Fetch URL success | Mock proxy returns HTML; pipeline receives it |
| Fetch URL 404 | Mock returns 404; error card displayed |
| Fetch URL timeout | Mock times out; timeout error shown |
| Claude extraction success | Mock returns JSON; extraction parsed correctly |
| OpenAI extraction success | Mock returns JSON; normalized to standard format |
| Gemini extraction success | Mock returns JSON; normalized to standard format |
| Perplexity extraction success *(Phase 2)* | Mock returns JSON; normalized to standard format |
| Rate limit handling | Mock returns 429; rate limit message shown |
| Auth token refresh | Mock returns 401; token refreshed; retry succeeds |

---

## 4. Component Tests

### 4.1 Input Screen

| Test | Action | Expected |
|---|---|---|
| Renders URL tab by default | Mount component | URL input visible, Analyze button disabled |
| URL validation: valid | Type "https://example.com" | Green check, button enabled |
| URL validation: invalid | Type "not-a-url" | Red X, button disabled, error text |
| Tab switching | Click "Upload HTML" | Upload zone visible, URL input hidden |
| File upload accepted | Drop .html file | File info shown, Analyze button enabled |
| File upload rejected | Drop .pdf file | Rejection message shown |
| Paste tab | Click "Paste HTML", type 200 chars | Analyze button enabled |
| History preview | Mount with mock history | 5 recent items displayed |

### 4.2 Processing Screen

| Test | Action | Expected |
|---|---|---|
| Shows progress | Set progress to 50% | Bar at 50%, stage message visible |
| Stage checklist updates | Complete stage 1 | Green check on stage 1, spinner on stage 2 |
| Cancel button | Click Cancel | Confirmation dialog appears |
| Confirm cancel | Click "Yes, cancel" | Returns to input screen |

### 4.3 Results Dashboard

| Test | Action | Expected |
|---|---|---|
| Score display | Render with score 85 | "85" displayed, grade "A", teal color |
| Category chart | Render with 5 scores | Chart rendered with correct data |
| Tab navigation | Click "How AI Sees Your Content" | Preview tab content shown |
| Export dropdown | Click "Export" | PDF and JSON options shown |
| Share button | Click "Share" | Share link generated and copied |
| Back button | Click "New Analysis" | Returns to input screen |

### 4.4 "How AI Sees Your Content" Preview

| Test | Action | Expected |
|---|---|---|
| 3 LLM columns (MVP) | Render with 3 extractions (Claude, OpenAI, Gemini) | 3 equal columns visible |
| Toggle LLM off | Uncheck "Gemini" | 2 columns shown, Gemini hidden |
| Failed LLM | One extraction has status: error | Error state in that column, retry button |
| Coverage table | Render with metrics | Table shows correct percentages |

### 4.5 Recommendations

| Test | Action | Expected |
|---|---|---|
| Filter: Quick Wins | Click "Quick Wins" pill | Only quick-win items shown |
| Code snippet expand | Click "View Code Fix" | Before/after code shown |
| Copy code | Click "Copy" on after-code | Clipboard contains code, toast shown |

---

## 5. Accessibility Tests

| Test Method | Tool | Criteria |
|---|---|---|
| Automated scan | axe-core via Testing Library | 0 violations at Level AA |
| Keyboard navigation | Manual + automated | All elements reachable via Tab/Enter/Space |
| Screen reader labels | Automated check | All interactive elements have accessible names |
| Focus management | Manual | Focus moves logically; modals trap focus |
| Color contrast | axe-core | All text meets 4.5:1 (normal) or 3:1 (large) |
| Reduced motion | Media query test | Animations disabled when preference set |

---

## 6. Test Data & Fixtures

### 6.1 HTML Fixtures

| Fixture | Description | Use For |
|---|---|---|
| `perfect-page.html` | Well-structured page passing all 50 checks | Baseline "all pass" test |
| `minimal-page.html` | Bare minimum HTML (title + one paragraph) | Thin content testing |
| `broken-page.html` | Malformed HTML, missing tags | Error handling |
| `js-only-page.html` | Empty body with JS bundle only | SSR detection (TA-01) |
| `noindex-page.html` | Robots noindex meta tag | TA-02 testing |
| `rich-schema-page.html` | Page with JSON-LD, OG tags, full metadata | Metadata scoring |
| `long-page.html` | 15,000 word article | Long content handling |
| `sf-export.html` | Screaming Frog rendered HTML export | SF detection |
| `multilingual-page.html` | Mixed English/Spanish content | Language detection |
| `spa-shell.html` | React SPA with empty div#root | SPA detection |

### 6.2 API Response Mocks

| Mock | Description |
|---|---|
| `claude-extraction-success.json` | Valid Claude extraction response |
| `openai-extraction-success.json` | Valid OpenAI extraction response |
| `gemini-extraction-success.json` | Valid Gemini extraction response |
| `perplexity-extraction-success.json` | Valid Perplexity extraction response *(Phase 2)* |
| `llm-error-429.json` | Rate limit response |
| `llm-error-500.json` | Server error response |
| `fetch-url-success.json` | Successful URL fetch with HTML |
| `fetch-url-404.json` | 404 error response |

---

## 7. QA Checklist (Manual)

### 7.1 Functional QA

- [ ] URL analysis: enter valid URL, receive results
- [ ] HTML upload: drop .html file, receive results
- [ ] Paste HTML: paste content, receive results
- [ ] Processing: progress bar advances smoothly, stages update
- [ ] Cancel: mid-analysis cancel returns to input
- [ ] Score: overall score and categories display correctly
- [ ] "How AI Sees Your Content": all 3 LLMs show extractions (Claude, OpenAI, Gemini)
- [ ] LLM toggle: unchecking LLMs hides columns
- [ ] Recommendations: grouped correctly, code snippets work
- [ ] Issues table: filters and sort work correctly
- [ ] History: past analyses listed, clickable
- [ ] Re-analysis: delta shown for same URL
- [ ] Export PDF: generates and downloads
- [ ] Export JSON: generates and downloads
- [ ] Share: generates link, link opens read-only view
- [ ] Shared link expiry: expired links show error

### 7.2 Error QA

- [ ] Invalid URL: shows inline validation error
- [ ] Unreachable URL: shows fetch error card
- [ ] Single LLM failure: other 2 still display
- [ ] All LLMs fail: rule-based results shown
- [ ] Large file rejected: 10MB+ shows error
- [ ] Wrong file type: .pdf rejected
- [ ] Rate limit: message with countdown shown

### 7.3 Cross-Browser QA

| Browser | Version | Priority |
|---|---|---|
| Chrome | Latest | P1 |
| Firefox | Latest | P1 |
| Safari | Latest | P1 |
| Edge | Latest | P2 |
| Chrome Mobile | Latest | P2 |
| Safari iOS | Latest | P2 |

### 7.4 Performance QA

- [ ] Input screen loads in < 1 second
- [ ] Analysis completes in < 15 seconds (typical page)
- [ ] Results dashboard renders in < 500ms
- [ ] PDF export generates in < 5 seconds
- [ ] No memory leaks after 10 consecutive analyses
- [ ] No layout shift on results load

---

*Document Version: 1.1*
*Created: 2026-02-17*
*Last Updated: 2026-02-17*
*Status: Draft — v1.1: 3 LLMs for MVP (Q8), "How AI Sees Your Content" tab rename (Q5)*
