# Server-Required Enhancement Stubs

The following enhancements require server-side implementation. Client-side stubs or preparation work has been completed where possible.

## P0 Pre-Launch (Server Required)

### E-035: Server-Side Rate Limiting
- **Status:** IMPLEMENTED — `server/middleware/rateLimit.js`
- **Implementation:** In-memory sliding window rate limiter: Free 10/hr, Pro 30/hr, Enterprise 200/hr
- **Client prep:** 429 error handling with Retry-After support already implemented (Task 3)

### E-038: Proxy Health Monitoring & Failover
- **Status:** IMPLEMENTED — `server/routes/health.js`
- **Implementation:** GET /health returns structured status with uptime, memory, configured services
- **Remaining:** Auto-restart (use Railway/PM2), alerting webhook (configure monitoring service)

## P2-P3 (Server Required)

### E-014: Content Gap Analysis vs. Competitor
- **Status:** TODO: SERVER_REQUIRED (XL complexity)
- **What's needed:** Dual-analysis mode, comparison API, competitor URL fetching
- **Client prep:** Component architecture planned

### E-017: JavaScript Rendering Impact Assessment
- **Status:** TODO: SERVER_REQUIRED
- **What's needed:** Server-side JS rendering comparison
- **Client prep:** jsImpactAnalyzer utility pattern defined

### E-019: Perplexity Sonar Integration
- **Status:** TODO: SERVER_REQUIRED (XL complexity)
- **What's needed:** Perplexity API key, proxy integration, distinct extraction prompt
- **Client prep:** llmPreview.js is extensible for additional LLM providers

### E-021: AI-Powered Fix Suggestions with Code Generation
- **Status:** Partially client-side, needs prompt extension on server
- **What's needed:** Extended Claude prompt for code generation
- **Client prep:** ReadabilityAutoFix component pattern defined

### E-023: Custom LLM Prompt Templates
- **Status:** Partially client-side
- **What's needed:** Store templates in Firestore, pass to proxy
- **Client prep:** readability-settings schema supports custom prompts

### E-024: Streaming LLM Responses
- **Status:** TODO: SERVER_REQUIRED
- **What's needed:** SSE/WebSocket proxy support
- **Client prep:** ProcessingScreen already shows per-LLM progress

### E-034: CI/CD API Endpoint
- **Status:** TODO: SERVER_REQUIRED (XL complexity)
- **What's needed:** New serverless function, API key management
- **Client prep:** aggregator.js is importable from server context

## P4 Phase 3-4 (Server Required)

### E-039: Batch URL Analysis
- **Status:** TODO: SERVER_REQUIRED (XL complexity)
- **What's needed:** Queue system, batch processing, rate limit coordination

### E-040: Team/Organization Workspaces
- **Status:** TODO: SERVER_REQUIRED (XL complexity)
- **What's needed:** Org-level Firestore rules, invitation system

### E-042: Scheduled Recurring Analysis
- **Status:** TODO: SERVER_REQUIRED (XL complexity)
- **What's needed:** Cloud Function, cron scheduler, email digest service

### E-046: AI Search Citation Tracker
- **Status:** TODO: SERVER_REQUIRED (XL complexity)
- **What's needed:** Perplexity/Google API integration

### E-048: Webhook/Slack Notifications
- **Status:** TODO: SERVER_REQUIRED
- **What's needed:** Cloud Function, webhook delivery, Slack OAuth

### E-049: Content Editor Integration
- **Status:** TODO: SERVER_REQUIRED (XL complexity)
- **What's needed:** Full in-browser HTML editor with live re-scoring

### E-050: Multi-Page Site Score Rollup
- **Status:** TODO: SERVER_REQUIRED (XL complexity)
- **What's needed:** Depends on E-039 (batch analysis)
