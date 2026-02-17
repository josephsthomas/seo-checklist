# AI Readability Checker — API Integration & Data Architecture

## 1. Architecture Overview

### 1.1 Logical Architecture

```
Client (React App)
  |
  +-- URL Input / HTML Upload / HTML Paste
  |
  +-- Content Extraction Service (lib/readability/extractor.js)
  |       |
  |       +-- Rule-Based Scoring Engine (lib/readability/scorer.js)
  |       +-- AI Analysis via Claude (lib/readability/aiAnalyzer.js)
  |       +-- LLM Rendering Preview Engine (lib/readability/llmPreview.js)
  |               |
  |               +-- Claude (Anthropic) extraction
  |               +-- GPT (OpenAI) extraction
  |               +-- Gemini (Google) extraction
  |               +-- Perplexity extraction
  |
  +-- Results Aggregator (lib/readability/aggregator.js)
  |
  +-- Firestore Persistence + Results Dashboard

External Services:
  +-- Anthropic (Claude API) — existing integration
  +-- OpenAI (GPT API) — new integration
  +-- Google (Gemini API) — new integration
  +-- Perplexity (Sonar API) — new integration
  +-- Content Fetch Proxy (VITE_AI_PROXY_URL) — extended
```

### 1.2 API Communication Flow

```
1. USER INPUT (URL / HTML / Paste)
2. CONTENT FETCH (if URL) — POST /api/fetch-url
3. CONTENT EXTRACTION (client-side) — Parse HTML
4. PARALLEL API CALLS:
   a. Claude Analysis (scoring + extraction)
   b. OpenAI Extraction
   c. Gemini Extraction
   d. Perplexity Extraction
5. AGGREGATE RESULTS
6. CALCULATE SCORES (client-side rule engine + AI input)
7. GENERATE RECOMMENDATIONS (rule-based + AI-generated)
8. PERSIST TO FIRESTORE
9. RENDER DASHBOARD
```

---

## 2. Content Fetching API

### 2.1 Proxy Endpoint: Fetch URL

This endpoint SHALL be added to the existing AI proxy service.

#### Request

```
POST {VITE_AI_PROXY_URL}/api/fetch-url
Content-Type: application/json
Authorization: Bearer {firebase-auth-token}
```

Request body:
```json
{
  "url": "https://example.com/page",
  "options": {
    "renderJS": false,
    "timeout": 30000,
    "followRedirects": true,
    "maxRedirects": 5,
    "userAgent": "ContentStrategyPortal/1.0 AIReadabilityChecker"
  }
}
```

#### Response (Success)

```json
{
  "success": true,
  "data": {
    "html": "<html>...</html>",
    "url": "https://example.com/page",
    "finalUrl": "https://example.com/page",
    "statusCode": 200,
    "headers": {
      "content-type": "text/html; charset=utf-8",
      "x-robots-tag": null,
      "last-modified": "2026-01-15T10:00:00Z"
    },
    "redirectChain": [],
    "fetchTimeMs": 1234,
    "contentLength": 45678,
    "isJSRendered": false
  }
}
```

#### Response (Error)

```json
{
  "success": false,
  "error": {
    "code": "FETCH_TIMEOUT",
    "message": "The URL did not respond within 30 seconds.",
    "details": {
      "url": "https://example.com/page",
      "timeoutMs": 30000
    }
  }
}
```

#### Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| FETCH_TIMEOUT | 504 | URL did not respond within timeout |
| FETCH_DNS_ERROR | 502 | Domain could not be resolved |
| FETCH_CONNECTION_REFUSED | 502 | Server refused connection |
| FETCH_SSL_ERROR | 502 | SSL/TLS certificate error |
| FETCH_BLOCKED_URL | 403 | URL is on the block list (private IPs, etc.) |
| FETCH_TOO_LARGE | 413 | Response exceeds 10MB limit |
| FETCH_NOT_HTML | 415 | Response is not HTML content type |
| FETCH_ROBOTS_BLOCKED | 403 | Blocked by robots.txt (with override option) |
| AUTH_INVALID | 401 | Invalid or expired auth token |
| RATE_LIMITED | 429 | User has exceeded rate limit |

---

## 3. LLM API Integrations

### 3.1 Unified Proxy Architecture

All LLM API calls SHALL route through the existing proxy (VITE_AI_PROXY_URL) to keep API keys server-side. The proxy SHALL support a unified request format with a provider field to route to the correct LLM.

#### Unified Request Format

```
POST {VITE_AI_PROXY_URL}/api/ai/extract
Content-Type: application/json
Authorization: Bearer {firebase-auth-token}
```

```json
{
  "provider": "anthropic | openai | google | perplexity",
  "model": "model-id",
  "task": "readability-extraction",
  "content": {
    "html": "<extracted-text-content>",
    "metadata": {
      "url": "https://example.com/page",
      "title": "Page Title",
      "description": "Page description"
    }
  },
  "parameters": {
    "maxTokens": 4096,
    "temperature": 0.2
  }
}
```

#### Unified Response Format

```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "extraction": {
    "extractedTitle": "string",
    "extractedDescription": "string",
    "primaryTopic": "string",
    "headings": [{"level": 1, "text": "string"}],
    "mainContent": "markdown string",
    "entities": [{"name": "string", "type": "string"}],
    "unprocessableContent": [{"description": "string", "reason": "string"}],
    "usefulnessScore": 8,
    "usefulnessExplanation": "string"
  },
  "usage": {
    "promptTokens": 1234,
    "completionTokens": 567,
    "totalTokens": 1801
  },
  "processingTimeMs": 3456,
  "status": "success"
}
```

### 3.2 Claude (Anthropic) — Analysis & Extraction

Uses the existing Claude API proxy already integrated in the portal.

- **Environment Variable:** VITE_CLAUDE_API_KEY (existing, server-side)
- **Model:** claude-sonnet-4-5-20250929
- **API:** Anthropic Messages API

The proxy SHALL translate to:
```json
{
  "model": "claude-sonnet-4-5-20250929",
  "max_tokens": 4096,
  "temperature": 0.2,
  "messages": [
    { "role": "user", "content": "{extraction_prompt_with_content}" }
  ]
}
```

Claude is used for two distinct tasks:
1. **Readability Analysis** — Scoring input for Content Clarity and AI-Specific Signals categories
2. **Content Extraction** — LLM rendering preview (same prompt as other LLMs)

### 3.3 OpenAI (GPT) — Extraction

- **Environment Variable:** VITE_OPENAI_API_KEY (new, server-side only)
- **Model:** gpt-4o
- **API:** OpenAI Chat Completions API

The proxy SHALL translate to:
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "system",
      "content": "You are a web content extraction system. Extract and structure the provided web page content exactly as you interpret it."
    },
    { "role": "user", "content": "{extraction_prompt_with_content}" }
  ],
  "max_tokens": 4096,
  "temperature": 0.2,
  "response_format": { "type": "json_object" }
}
```

### 3.4 Google Gemini — Extraction

- **Environment Variable:** VITE_GEMINI_API_KEY (new, server-side only)
- **Model:** gemini-2.0-flash
- **API:** Google Generative Language API

The proxy SHALL translate to:
```json
{
  "contents": [
    {
      "role": "user",
      "parts": [{ "text": "{extraction_prompt_with_content}" }]
    }
  ],
  "generationConfig": {
    "maxOutputTokens": 4096,
    "temperature": 0.2,
    "responseMimeType": "application/json"
  },
  "systemInstruction": {
    "parts": [
      { "text": "You are a web content extraction system. Extract and structure the provided web page content exactly as you interpret it." }
    ]
  }
}
```

### 3.5 Perplexity — Extraction

- **Environment Variable:** VITE_PERPLEXITY_API_KEY (new, server-side only)
- **Model:** sonar-pro
- **API:** Perplexity Chat Completions API (OpenAI-compatible)

The proxy SHALL translate to:
```json
{
  "model": "sonar-pro",
  "messages": [
    {
      "role": "system",
      "content": "You are a web content extraction system. Extract and structure the provided web page content exactly as you interpret it."
    },
    { "role": "user", "content": "{extraction_prompt_with_content}" }
  ],
  "max_tokens": 4096,
  "temperature": 0.2
}
```

### 3.6 Unified Extraction Prompt

All LLMs SHALL receive the same extraction prompt for fair comparison:

```
Analyze the following web page content. Extract and structure it exactly as you
can interpret it.

Tasks:
1. TITLE: Extract the page's primary title
2. DESCRIPTION: Write a 1-2 sentence summary of the page
3. TOPIC: Identify the page's primary topic in 2-5 words
4. HEADINGS: List all headings with their hierarchy (H1, H2, H3, etc.)
5. CONTENT: Reproduce the main body content as clean markdown, preserving structure
6. ENTITIES: List key entities mentioned (people, orgs, products, places, concepts)
7. GAPS: Identify any content you cannot process, understand, or that appears broken
8. USEFULNESS: Rate 1-10 how useful this page would be for answering user questions
   about its topic, with a brief explanation

Web Page Content:
URL: {url}
{extracted_text_content}

Respond in valid JSON with this exact structure:
{
  "extractedTitle": "",
  "extractedDescription": "",
  "primaryTopic": "",
  "headings": [{"level": 1, "text": ""}],
  "mainContent": "",
  "entities": [{"name": "", "type": "person|org|product|concept|place"}],
  "unprocessableContent": [{"description": "", "reason": ""}],
  "usefulnessScore": 0,
  "usefulnessExplanation": ""
}
```

---

## 4. Data Models

### 4.1 Firestore Collection: readability-analyses

```javascript
{
  // Document ID: auto-generated
  id: string,

  // Ownership
  userId: string,                    // Firebase Auth UID
  createdAt: Timestamp,
  updatedAt: Timestamp,

  // Input
  inputMethod: 'url' | 'upload' | 'paste',
  url: string | null,
  filename: string | null,
  htmlStorageRef: string | null,     // Firebase Storage path

  // Page Metadata (extracted)
  pageMetadata: {
    title: string,
    description: string,
    canonicalUrl: string | null,
    language: string,
    httpStatus: number | null,
    contentType: string,
    contentLength: number,
    lastModified: string | null,
    robotsDirectives: {
      index: boolean,
      follow: boolean,
      noai: boolean
    }
  },

  // Scores
  overallScore: number,              // 0-100
  grade: string,                     // A+, A, B+, B, C+, C, D, F
  categoryScores: {
    contentStructure: number,
    contentClarity: number,
    technicalAccessibility: number,
    metadataSchema: number,
    aiSpecificSignals: number
  },

  // Issue Summary
  issueSummary: {
    critical: number,
    high: number,
    medium: number,
    low: number,
    passed: number,
    total: number
  },

  // Detailed Check Results
  checkResults: [
    {
      id: string,                    // e.g. CS-01
      category: string,
      title: string,
      description: string,
      status: 'pass' | 'warn' | 'fail',
      severity: 'critical' | 'high' | 'medium' | 'low' | 'info',
      details: string | null,
      affectedElements: [string],
      recommendation: string | null
    }
  ],

  // LLM Extractions
  llmExtractions: {
    claude: {
      model: string,
      extractedTitle: string,
      extractedDescription: string,
      primaryTopic: string,
      headings: [{ level: number, text: string }],
      mainContent: string,
      entities: [{ name: string, type: string }],
      unprocessableContent: [{ description: string, reason: string }],
      usefulnessScore: number,
      usefulnessExplanation: string,
      processingTimeMs: number,
      status: 'success' | 'error' | 'timeout',
      error: string | null
    },
    openai: { /* same structure */ },
    gemini: { /* same structure */ },
    perplexity: { /* same structure */ }
  },

  // Recommendations
  recommendations: [
    {
      id: string,
      title: string,
      description: string,
      category: string,
      priority: 'critical' | 'high' | 'medium' | 'low',
      effort: 'quick' | 'moderate' | 'significant',
      estimatedImpact: number,
      group: 'quick-wins' | 'structural' | 'content' | 'technical',
      source: 'rule' | 'ai',
      codeSnippet: {
        before: string | null,
        after: string | null,
        language: string
      } | null
    }
  ],

  // AI Analysis (Claude deep analysis)
  aiAnalysis: {
    contentSummary: string,
    qualityAssessment: string,
    citationWorthiness: number,      // 0-100
    readabilityIssues: [string],
    aiRecommendations: [string]
  },

  // Sharing
  shareToken: string | null,
  shareExpiresAt: Timestamp | null,
  isShared: boolean,

  // Comparison
  previousAnalysisId: string | null,
  scoreDelta: number | null
}
```

### 4.2 Firestore Collection: readability-settings (per-user)

```javascript
{
  userId: string,
  defaultInputMethod: 'url' | 'upload' | 'paste',
  enabledLLMs: ['claude', 'openai', 'gemini', 'perplexity'],
  defaultExportFormat: 'pdf' | 'json',
  shareDefaultExpiry: 30,
  analysisCount: number,
  lastAnalysisAt: Timestamp | null
}
```

### 4.3 Firebase Storage Structure

```
readability/
  {userId}/
    html-snapshots/
      {analysisId}.html
    exports/
      {analysisId}.pdf
      {analysisId}.json
```

### 4.4 Firestore Security Rules

```javascript
match /readability-analyses/{analysisId} {
  allow read, write: if request.auth != null
    && request.auth.uid == resource.data.userId;

  allow create: if request.auth != null
    && request.resource.data.userId == request.auth.uid;

  // Shared analyses readable by anyone if not expired
  allow read: if resource.data.isShared == true
    && resource.data.shareExpiresAt > request.time;
}

match /readability-settings/{userId} {
  allow read, write: if request.auth != null
    && request.auth.uid == userId;
}
```

---

## 5. Rate Limiting & Cost Management

### 5.1 Rate Limits

| API | Limit (per user) | Window | On Exceed |
|---|---|---|---|
| URL Fetch | 30 requests | 1 hour | Queue with wait time |
| Claude Analysis | 20 requests | 1 hour | Fallback to rule-based only |
| OpenAI Extraction | 20 requests | 1 hour | Skip LLM preview |
| Gemini Extraction | 20 requests | 1 hour | Skip LLM preview |
| Perplexity Extraction | 20 requests | 1 hour | Skip LLM preview |
| Full Analysis | 15 analyses | 1 hour | Show countdown |

### 5.2 Cost Estimates

| API | Cost per Analysis | Monthly Cap |
|---|---|---|
| Claude (Anthropic) | ~$0.01-0.03 | Existing proxy budget |
| OpenAI (GPT-4o) | ~$0.01-0.03 | $100/month |
| Google Gemini | ~$0.005-0.015 | $50/month |
| Perplexity (Sonar) | ~$0.005-0.02 | $50/month |

### 5.3 Caching Strategy

| Data | Cache Location | TTL | Invalidation |
|---|---|---|---|
| URL fetch results | Server-side proxy | 1 hour | Manual re-fetch |
| LLM extractions | Firestore | Permanent | New analysis |
| Rule-based scores | Client state | Session | New analysis |
| Static assets | Browser cache | 7 days | Build hash |

---

## 6. Error Handling at the API Layer

### 6.1 Retry Strategy

| Error Type | Retry | Max Retries | Backoff |
|---|---|---|---|
| Network timeout | Yes | 2 | Exponential (2s, 4s) |
| 429 Rate Limited | Yes | 1 | Retry-After header |
| 500 Server Error | Yes | 2 | Exponential (2s, 4s) |
| 401 Unauthorized | No | 0 | Re-authenticate |
| 400 Bad Request | No | 0 | Show error |
| LLM API error | Partial | 1 | Skip LLM, continue |

### 6.2 Graceful Degradation

When individual LLM APIs fail, the system SHALL:
1. Complete the analysis with available LLMs
2. Show a clear indicator that a specific LLM preview is unavailable
3. Provide a "Retry" button for the failed LLM only
4. Not block overall scoring (scoring uses Claude + rules; other LLMs are preview-only)

### 6.3 New Environment Variables

| Variable | Required | Status | Description |
|---|---|---|---|
| VITE_AI_PROXY_URL | Yes | Existing | Base URL for AI proxy service |
| VITE_FIREBASE_* | Yes | Existing | Firebase configuration (7 vars) |
| VITE_CLAUDE_API_KEY | Yes | Existing | Anthropic API key (server-side) |
| VITE_OPENAI_API_KEY | Yes | **New** | OpenAI API key (server-side) |
| VITE_GEMINI_API_KEY | Yes | **New** | Google Gemini API key (server-side) |
| VITE_PERPLEXITY_API_KEY | Yes | **New** | Perplexity API key (server-side) |

---

*Document Version: 1.0*
*Created: 2026-02-17*
*Last Updated: 2026-02-17*
*Status: Draft*
