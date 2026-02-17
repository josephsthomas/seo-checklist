# AI Readability Checker — Error Handling & Edge Cases

## 1. Error Categories

### 1.1 Input Errors

| Error | Trigger | User Message | Recovery |
|---|---|---|---|
| Invalid URL format | URL fails RFC 3986 validation | "Please enter a valid URL (e.g., https://example.com)" | Inline validation, keep focus on input |
| Private/local URL | URL points to 127.x, 10.x, 192.168.x, localhost | "Private or local URLs cannot be analyzed. Please enter a public URL." | Clear input, refocus |
| Non-HTTP protocol | ftp://, file://, javascript:, data: | "Only HTTP and HTTPS URLs are supported." | Clear protocol, suggest https:// |
| Empty URL submitted | User clicks Analyze with empty field | "Please enter a URL to analyze." | Focus input field |
| File too large | Upload exceeds 10MB | "File exceeds the 10MB limit. Try a smaller file or use URL input." | Remove file, show size |
| Invalid file type | Non-HTML file uploaded | "Only .html and .htm files are supported." | Remove file, list accepted types |
| Empty file | 0-byte HTML file | "The uploaded file is empty." | Remove file |
| Invalid HTML | No html/head/body tags found | "This file doesn't appear to contain valid HTML." | Show what was expected |
| Paste too short | < 100 characters pasted | "Please paste at least 100 characters of HTML." | Show character count |
| Paste too long | > 2MB pasted content | "Content exceeds the 2MB limit. Try uploading a file instead." | Truncation warning |

### 1.2 Network & Fetch Errors

| Error | Trigger | User Message | Recovery |
|---|---|---|---|
| DNS resolution failure | Domain doesn't exist | "The domain '[domain]' could not be found. Check the URL and try again." | Edit URL, retry |
| Connection timeout | 30s timeout exceeded | "The server at '[domain]' didn't respond in time. It may be slow or down." | Retry button, suggest upload |
| Connection refused | Server refuses connection | "Connection refused by '[domain]'. The server may be down." | Retry button, suggest upload |
| SSL/TLS error | Certificate invalid/expired | "SSL certificate error for '[domain]'. The site may have a security issue." | Retry, offer to proceed anyway (with warning) |
| HTTP 403 Forbidden | Server blocks request | "Access denied by '[domain]'. The server is blocking our request." | Suggest upload path |
| HTTP 404 Not Found | Page doesn't exist | "Page not found (404). Check the URL is correct." | Edit URL |
| HTTP 5xx Server Error | Remote server error | "The server at '[domain]' returned an error. Try again later." | Retry with delay |
| Response too large | > 10MB response | "This page is very large (> 10MB). Try uploading the HTML directly." | Suggest upload |
| Non-HTML response | PDF, image, JSON returned | "This URL returned [type] content, not HTML. Only HTML pages can be analyzed." | Edit URL |
| Redirect loop | > 5 redirects | "Too many redirects. The final URL could not be reached." | Show redirect chain |
| robots.txt blocked | Page disallowed | "This URL is blocked by robots.txt. [Analyze anyway?] [Upload HTML instead]" | Override option or upload |

### 1.3 LLM API Errors

| Error | Trigger | User Message | Recovery |
|---|---|---|---|
| Claude API timeout | 30s timeout | "Claude analysis timed out. Scores are based on rule-based checks only." | Retry button for Claude |
| Claude API 429 | Rate limited | "Claude rate limit reached. Try again in [X] minutes." | Countdown timer |
| Claude API 500 | Server error | "Claude is temporarily unavailable. Scores use rule-based analysis." | Retry button |
| OpenAI API failure | Any error | "OpenAI preview unavailable." (shown in LLM column) | Retry button per LLM |
| Gemini API failure | Any error | "Gemini preview unavailable." (shown in LLM column) | Retry button per LLM |
| All LLMs failed | All 3 extraction calls fail (Claude, OpenAI, Gemini) | "AI previews are currently unavailable. Showing rule-based analysis only." | Global retry button |
| Invalid JSON response | LLM returns non-JSON | "Unexpected response from [LLM]. Preview may be incomplete." | Show raw text fallback |
| Token limit exceeded | Content too long for LLM | Content auto-truncated; warning: "Content was truncated for [LLM] analysis." | Show truncation point |
| Auth token expired | Firebase token expired mid-analysis | "Session expired. Please log in again." | Redirect to login |
| User rate limit hit | Plan-based hourly limit exceeded (Free: 10, Pro: 30, Enterprise: 200) | "You've reached the hourly analysis limit for your plan ([limit]). Resets at [time]." | Countdown; upgrade CTA for Free/Pro |

### 1.4 Processing Errors

| Error | Trigger | User Message | Recovery |
|---|---|---|---|
| HTML parsing failure | Severely malformed HTML | "This HTML could not be parsed. It may be corrupted or heavily malformed." | Suggest alternate input |
| Content extraction failure | No extractable content found | "No readable content was found on this page. It may be entirely JS-rendered." | Suggest Screaming Frog upload |
| Score calculation error | Unexpected data state | "An error occurred during scoring. Some results may be incomplete." | Show partial results |
| Firestore write failure | Database error | "Results could not be saved. Your analysis is shown but won't appear in history." | Retry save button |
| Storage upload failure | Firebase Storage error | "HTML snapshot could not be saved." (non-blocking) | Silent retry, log error |

---

## 2. Edge Cases

### 2.1 Content Edge Cases

| Edge Case | Expected Behavior |
|---|---|
| Page with no text content (only images) | Score low on Content Clarity/Structure; flag "No text content detected" |
| Very short page (< 50 words) | Analyze normally but flag "Content depth: very thin" in CS-08 |
| Very long page (> 10,000 words) | Analyze normally; truncate LLM input to 50,000 chars with notice |
| Page entirely in non-English language | Detect language, analyze structure/technical checks; skip English-specific readability (Flesch) |
| Page with multiple languages | Detect primary language, note mixed-language in analysis |
| Page with only structured data (no body) | Score metadata/schema high; flag empty content |
| Login-gated content | Analyze whatever HTML is returned (likely login form); note "Content may be behind authentication" |
| PDF-like HTML (single long paragraph) | Score low on structure; recommend breaking into sections |
| HTML email content | Analyze but warn "This appears to be email HTML, not a web page" |

### 2.2 Technical Edge Cases

| Edge Case | Expected Behavior |
|---|---|
| Infinite scroll page | Analyze initial HTML only; note "Additional content may load dynamically" |
| Single Page Application (no SSR) | Detect empty/minimal initial HTML; TA-01 fails; recommend SSR or Screaming Frog |
| AMP pages | Analyze AMP HTML normally; note AMP-specific considerations |
| Iframe-heavy content | Analyze host page only; note "Content in iframes is not analyzed" |
| Shadow DOM content | Not accessible via DOMParser; note limitation |
| Very large HTML (5-10MB) | Accept but warn about size; may truncate for LLM analysis |
| Minified HTML | Parse normally; minification doesn't affect DOM structure |
| HTML with BOM (Byte Order Mark) | Strip BOM before parsing |
| XHTML content type | Parse as HTML (DOMParser handles this) |
| Encoded entities (HTML entities) | Decode before text analysis |

### 2.3 URL Edge Cases

| Edge Case | Expected Behavior |
|---|---|
| URL with fragment (#) | Fetch full page, ignore fragment |
| URL with query parameters | Fetch as-is, include params |
| URL requiring authentication | Fetch returns login page; analyze that; note the limitation |
| URL returning 301/302 redirect | Follow redirect, show final URL, note redirect chain |
| URL with non-standard port | Accept and fetch (e.g., :8080) |
| Internationalized domain (IDN) | Convert to punycode for fetch, display original to user |
| Very long URL (> 2000 chars) | Accept but warn; truncate display |
| URL with spaces or special chars | URL-encode before fetch |

### 2.4 User Behavior Edge Cases

| Edge Case | Expected Behavior |
|---|---|
| User navigates away during analysis | Cancel in-flight requests via AbortController |
| User submits same URL twice quickly | Debounce; show "Analysis already in progress" |
| User re-analyzes URL with recent results | Show delta from previous; don't block re-analysis |
| User opens shared link while logged in | Show shared view (not their own dashboard) |
| User opens expired shared link | "This shared analysis has expired" with option to log in |
| User hits back button during processing | Return to input screen; cancel analysis |
| User clears browser mid-analysis | Analysis lost; Firestore not yet written; no recovery needed |
| User exceeds storage limit (Admin: 500, PM: 250, Others: 100) | Auto-archive oldest; show notice about archiving with tier info |
| Multiple tabs running analyses | Each tab independent; rate limits apply across tabs |

---

## 3. Error Display Patterns

### 3.1 Inline Validation Errors

Used for: URL input, file upload, paste input

```
+--[URL Input Field]--[red border]--+
| https://not a valid url            |
+------------------------------------+
  [!] Please enter a valid URL including the protocol (e.g., https://example.com)
```

- Red border on input
- Error icon (AlertCircle) + message below input
- `aria-describedby` links input to error message
- `role="alert"` on error message

### 3.2 Error Cards

Used for: fetch errors, processing errors

```
+--[red-left-border card]--+
| [AlertCircle] Unable to fetch URL                         |
|                                                            |
| The server at 'example.com' didn't respond within 30      |
| seconds. It may be temporarily down.                       |
|                                                            |
| [Try Again]  [Upload HTML Instead]                         |
+------------------------------------------------------------+
```

### 3.3 LLM Error States (in-column)

Used for: individual LLM failures within the preview tab

```
+--[LLM Column: OpenAI]--+
| [AlertTriangle]         |
|                         |
| Preview unavailable     |
| "Rate limit exceeded"   |
|                         |
| [Retry OpenAI]          |
+-------------------------+
```

### 3.4 Toast Notifications

Used for: non-blocking errors (save failure, export failure)

- Error toasts: red background, AlertCircle icon, 8-second auto-dismiss
- Warning toasts: amber background, AlertTriangle icon, 5-second auto-dismiss
- Success toasts: green background, CheckCircle icon, 3-second auto-dismiss

### 3.5 Full-Page Error

Used for: fatal/unrecoverable errors

- Matches existing `ToolErrorBoundary` pattern
- Teal-themed header bar with tool icon
- "Something went wrong" message
- Error details (collapsible for technical users)
- "Try Again" + "Go Home" + "Report Issue" buttons

---

## 4. Graceful Degradation Matrix

| Component Failed | Impact | Degradation Behavior |
|---|---|---|
| URL fetch proxy | Cannot analyze URLs | Show error; promote HTML upload as alternative |
| Claude API | No AI analysis | Score uses rule-based checks only (70% weight); label "Rule-based analysis" |
| OpenAI API | No GPT preview | Hide OpenAI column; show 2 LLMs; note "OpenAI unavailable" |
| Gemini API | No Gemini preview | Hide Gemini column; show 2 LLMs; note "Gemini unavailable" |
| All LLM APIs | No LLM previews | Show rule-based scores only; hide "How AI Sees Your Content" tab entirely |
| Firestore | Cannot save/load | Analysis works but history unavailable; results shown in-memory only |
| Firebase Storage | Cannot save HTML snapshot | Non-blocking; log warning; analysis continues |
| Chart.js | No radar chart | Fallback to simple HTML bar display using div widths |

---

*Document Version: 1.1*
*Created: 2026-02-17*
*Last Updated: 2026-02-17*
*Status: Draft — v1.1: Tiered rate limits (Q4), tiered storage (Q7), Perplexity removed from MVP (Q8)*
