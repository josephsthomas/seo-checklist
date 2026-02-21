# Plan: Scope / Infrastructure Defects (34 defects)

> **Priority:** P2 — Infrastructure & Monitoring
> **Impact Score:** 40/100
> **Estimated Effort:** 8-12 engineering days
> **Branch:** Create new branch from `claude/fix-qa-defects-jpa0E`

## Context

This is a React + Vite + Firebase/Firestore + TailwindCSS application ("Content Strategy Portal") deployed on Vercel. An 11-role QA review found 524 defects; 379 were fixed. This plan covers the 34 remaining **scope** defects — deployment risks, monitoring gaps, SEO/schema issues, and accessibility gaps in export utilities.

**Source data:** All defect definitions are in `qa_reports/fix_batches.json`. Search by `bug_id` to get the full description, steps to reproduce, expected vs actual behavior.

**Key files to understand first:**
- `vite.config.js` — Build configuration, manual chunks
- `package.json` — Dependencies, scripts
- `src/config/seo.js` — SEO page configs (pageSEO, defaultMeta)
- `src/components/shared/SEOHead.jsx` — SEO component
- `src/components/shared/ErrorBoundary.jsx` — Error boundary
- `src/lib/schema-generator/schemaGeneratorService.js` — Schema gen + AI integration
- `src/lib/accessibility/aiSuggestionService.js` — Accessibility AI
- `src/lib/meta-generator/metaGeneratorService.js` — Meta gen AI
- `src/utils/lazyWithRetry.js` — Lazy loading with retry
- `src/utils/storageHelpers.js` — localStorage helpers
- `src/lib/readability/aiAnalyzer.js` — AI analyzer
- `src/lib/readability/utils/htmlParser.js` — HTML parsing
- `src/lib/readability/utils/schemaValidator.js` — Schema validation
- `src/lib/readability/checks/technicalAccess.js` — Technical checks
- `src/lib/readability/checks/contentStructure.js` — Content structure checks

---

## Phase 1: Deploy & Infrastructure Security (10 defects)

### 1.1 CRITICAL — API key exposure

| Bug ID | File | Issue |
|--------|------|-------|
| R09-A-002 | `src/lib/schema-generator/schemaGeneratorService.js` | AI service allows direct client-side API key usage |

**Fix approach:**
1. Read the service file — find where `VITE_CLAUDE_API_KEY` or `VITE_ANTHROPIC_API_KEY` is used
2. Remove direct API key usage — all AI calls must go through a server proxy
3. If a proxy endpoint exists, ensure it's used exclusively
4. If no proxy: add a comment/TODO and ensure the key is never included in client builds

### 1.2 HIGH — External dependencies and CDN risks

| Bug ID | File | Issue |
|--------|------|-------|
| R09-A-007 | `src/lib/accessibility/aiSuggestionService.js` | Inconsistent production behavior vs main suggestionService |
| R09-A-017 | `src/lib/meta-generator/metaGeneratorService.js` | PDF extraction loads pdf.js worker from external CDN |
| R09-B-003 | `src/config/seo.js` | Site URL hardcoded with TODO comment |

**Fix approach for R09-A-017:**
```js
// Before: external CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/...';

// After: self-hosted or bundled
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
```

**Fix approach for R09-B-003:**
```js
// Before:
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://contentstrategyportal.com';

// This is actually fine — the env var takes precedence. Add .env.example to document it.
```

### 1.3 MEDIUM — Dependency management

| Bug ID | File | Issue |
|--------|------|-------|
| R09-A-012 | `package.json` | All 18 deps use caret (^) ranges |
| R09-B-009 | `package.json` | lucide-react uses pre-1.0 caret range |
| R09-C-012 | `package.json` | Multiple deps allow uncontrolled drift |
| R09-A-013 | `package.json` | No CI/CD config files |
| R09-A-019 | `index.html` | SPA uses BrowserRouter but no server fallback config |
| R09-C-009 | `src/lib/schema-generator/schemaGeneratorService.js` | Same as R09-A-002 (duplicate) |

**Fix approach for dependency pinning:**
1. Read `package.json`
2. Replace `^` with exact versions for all production deps
3. Keep `^` for devDependencies (less risk)
4. Create `.env.example` documenting all required env vars

**Fix approach for SPA fallback:**
- For Vercel: create `vercel.json` with `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
- This ensures direct URL access works for all routes

---

## Phase 2: Monitoring & Error Logging (8 defects)

### 2.1 HIGH — Error monitoring integration

| Bug ID | File | Issue |
|--------|------|-------|
| R09-A-003 | `src/components/shared/ErrorBoundary.jsx` | No external monitoring (Sentry etc.), only console.error |
| R09-B-004 | `src/components/readability/ReadabilityDashboard.jsx` | Debug console.log in production |
| R09-C-006 | `src/utils/lazyWithRetry.js` | Chunk failures silent in production |

**Fix approach for ErrorBoundary:**
1. Read `src/components/shared/ErrorBoundary.jsx`
2. Add a `reportError()` function that can be wired to any monitoring service:
```jsx
function reportError(error, errorInfo) {
  // Production error reporting
  if (import.meta.env.PROD) {
    // Option 1: Sentry (if installed)
    // Sentry.captureException(error, { extra: errorInfo });

    // Option 2: Custom endpoint
    fetch('/api/errors', {
      method: 'POST',
      body: JSON.stringify({ error: error.message, stack: error.stack, componentStack: errorInfo?.componentStack }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => {}); // Don't throw on reporting failure
  }
  console.error('Error caught by boundary:', error, errorInfo);
}
```
3. Call `reportError()` in `componentDidCatch`

**Fix approach for console.log removal:**
1. Read `ReadabilityDashboard.jsx` — grep for `console.log`
2. Remove or guard with `if (import.meta.env.DEV)`

**Fix approach for lazyWithRetry:**
1. Read `src/utils/lazyWithRetry.js`
2. Add error reporting in the catch block (not just dev console)

### 2.2 MEDIUM — Structured logging

| Bug ID | File | Issue |
|--------|------|-------|
| R09-B-011 | `src/components/readability/ReadabilityShareView.jsx` | No error monitoring for failed PDF exports |
| R09-C-010 | `src/utils/storageHelpers.js` | All errors go to console.error only |
| R09-C-011 | `src/lib/readability/aiAnalyzer.js` | AbortController not linked to caller |
| R09-C-014 | `src/hooks/useExportHistory.js` | logExport errors go to console only |

**Fix approach:** Create a centralized logger:
```js
// src/utils/logger.js
export function logError(context, error, metadata = {}) {
  console.error(`[${context}]`, error);
  if (import.meta.env.PROD) {
    // Send to monitoring service
  }
}
```
Replace `console.error` calls with `logError()` in the affected files.

### 2.3 LOW

| Bug ID | File | Issue |
|--------|------|-------|
| R09-B-016 | `src/components/shared/FeedbackWidget.jsx` | Minimal error logging on submission failure |

---

## Phase 3: SEO & Schema Validation (13 defects)

### 3.1 HIGH — Sitemap and critical SEO gaps

| Bug ID | File | Issue |
|--------|------|-------|
| R06-008 | `src/App.jsx` | No sitemap.xml for 15+ public routes |
| R06-102 | `src/config/seo.js` | Missing pageSEO entry for readability feature page |
| R06-108 | `src/components/reports/ReportBuilderPage.jsx` | HTML export missing SEO tags |
| R06-203 | `src/lib/schema-generator/schemaGeneratorService.js` | validateSchema uses loose string matching |
| R06-209 | `src/lib/readability/utils/schemaValidator.js` | SCHEMA_FIELDS covers 7 types, 40+ exist |
| R06-212 | `src/lib/readability/utils/htmlParser.js` | extractLinks misclassifies URLs |

**Fix approach for sitemap:**
Create `public/sitemap.xml` listing all public routes:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://contentstrategyportal.com/</loc></url>
  <url><loc>https://contentstrategyportal.com/about</loc></url>
  <url><loc>https://contentstrategyportal.com/features</loc></url>
  <!-- ... all public routes from App.jsx -->
</urlset>
```
Update `public/robots.txt` to reference it:
```
Sitemap: https://contentstrategyportal.com/sitemap.xml
```

**Fix approach for R06-102:**
Add missing entry to `src/config/seo.js` pageSEO object.

**Fix approach for R06-203:**
```js
// Before: loose check
if (schema['@context']?.includes('schema.org'))

// After: strict check
const validContexts = ['https://schema.org', 'http://schema.org'];
if (validContexts.includes(schema['@context']))
```

**Fix approach for R06-212:**
1. Read `src/lib/readability/utils/htmlParser.js` — find `extractLinks`
2. Fix URL classification: protocol-relative URLs (`//example.com`) are external
3. Same-domain absolute URLs should be classified as internal

### 3.2 MEDIUM — Schema and meta improvements

| Bug ID | File | Issue |
|--------|------|-------|
| R06-011 | `src/components/help/GlossaryPage.jsx` | No SEOHead component |
| R06-204 | `src/lib/schema-generator/schemaGeneratorService.js` | No headline length check for Article schema |
| R06-208 | `src/lib/readability/checks/technicalAccess.js` | checkRobotsTxt always returns 'warn' |
| R06-210 | `src/lib/readability/checks/contentStructure.js` | Duplicated heading skip logic |
| R06-213 | `src/lib/readability/utils/htmlParser.js` | Case-insensitive meta tag matching missing |
| R06-215 | `src/lib/schema-generator/schemaGeneratorService.js` | FAQPage schema with empty mainEntity |

**Fix approach for R06-011:**
```jsx
import SEOHead from '../shared/SEOHead';
// In return: <SEOHead pageKey="help/glossary" />
// pageSEO entry for "help/glossary" already exists in seo.js
```

**Fix approach for R06-208:**
1. Read `src/lib/readability/checks/technicalAccess.js`
2. Find `checkRobotsTxt` — it should return 'pass'/'fail'/'warn' based on actual analysis
3. Fix the logic to return appropriate status

### 3.3 LOW

| Bug ID | File | Issue |
|--------|------|-------|
| R06-211 | `src/lib/readability/utils/urlValidation.js` | No trailing slash normalization |

---

## Phase 4: Accessibility in Export Utilities (3 defects)

### 4.1 HIGH — Download link accessibility

| Bug ID | File | Issue |
|--------|------|-------|
| R05-200 | `src/lib/unifiedExportService.js` | Download helper creates anchor with no accessible name |
| R05-210 | `src/lib/excelExport.js` | Excel download creates inaccessible anchor |

**Fix approach:**
1. Read both files — find where `document.createElement('a')` is used for downloads
2. Add accessible attributes:
```js
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.setAttribute('aria-label', `Download ${filename}`);
// Add live region announcement
const announcement = document.createElement('div');
announcement.setAttribute('role', 'status');
announcement.setAttribute('aria-live', 'polite');
announcement.className = 'sr-only';
announcement.textContent = `Downloading ${filename}`;
document.body.appendChild(announcement);
setTimeout(() => announcement.remove(), 3000);
```

### 4.2 MEDIUM

| Bug ID | File | Issue |
|--------|------|-------|
| R05-214 | `src/lib/pdfGenerator.js` | previewPDF opens window with no accessible name |

---

## Execution Protocol

1. **Before each fix:** Read the target file AND search `qa_reports/fix_batches.json` for the `bug_id` to get full context
2. **After each phase:** Run `npx vitest run` and `npx vite build`
3. **Commit after each phase:** `git commit -m "fix: scope/infra phase N — X defects"`
4. **Push after each phase:** `git push -u origin <branch-name>`
5. **Test commands:** `npx vitest run` (593+ tests should pass), `npx vite build` (should succeed)

## New Files to Create

| File | Purpose |
|------|---------|
| `src/utils/logger.js` | Centralized error logging utility |
| `public/sitemap.xml` | Static sitemap for public routes |
| `vercel.json` | SPA rewrite rules for direct URL access |
| `.env.example` | Document required environment variables |
