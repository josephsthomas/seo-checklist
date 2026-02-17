# AI Readability Checker — Performance & Security Requirements

## 1. Performance Requirements

### 1.1 Response Time Targets

| Operation | Target | Maximum | Measurement |
|---|---|---|---|
| Input screen initial load | < 500ms | 1s | Time to interactive (lazy load) |
| URL validation (client-side) | < 50ms | 100ms | Input to validation icon |
| URL fetch (server-side proxy) | < 3s | 30s (timeout) | Request to HTML response |
| Content extraction (client) | < 500ms | 2s | HTML to structured data |
| Single LLM API call | < 5s | 30s (timeout) | Request to parsed response |
| All 4 LLM calls (parallel) | < 8s | 30s | Start to last completion |
| Rule-based scoring | < 200ms | 500ms | Extracted data to scores |
| Recommendation generation | < 300ms | 1s | Scores to recommendations |
| Full analysis (end-to-end) | < 15s | 45s | User clicks Analyze to results |
| Results dashboard render | < 300ms | 500ms | Data to interactive DOM |
| PDF export generation | < 3s | 5s | Click to download start |
| JSON export generation | < 500ms | 1s | Click to download start |
| History list load | < 1s | 2s | Page load to list rendered |
| Chart rendering | < 200ms | 500ms | Data to visible chart |

> **Stretch goal:** < 12s for pages under 5,000 words.

### 1.2 Bundle Size Targets

| Chunk | Target | Maximum |
|---|---|---|
| Readability page chunk (lazy) | < 80KB gzipped | 120KB gzipped |
| Shared vendor chunks (chart.js, etc.) | Already loaded by other tools | N/A |
| Total new JavaScript | < 100KB gzipped | 150KB gzipped |

### 1.3 Memory Usage

| Constraint | Limit |
|---|---|
| HTML content in memory | Max 10MB per analysis |
| LLM responses in memory | Max 500KB per LLM (4 x 500KB = 2MB) |
| Analysis results object | Max 2MB |
| DOM parser overhead | Max 50MB peak (released after extraction) |
| History list (client-side) | Max 20 items in DOM; paginate beyond |
| Total peak memory per analysis | < 100MB |

### 1.4 Concurrency

| Constraint | Limit |
|---|---|
| Concurrent LLM API calls | 4 (one per provider, in parallel) |
| Concurrent analyses per user | 1 (queue additional requests) |
| Concurrent URL fetches per user | 1 |
| Background Firestore writes | Non-blocking, fire-and-forget with retry |

### 1.5 Optimization Strategies

**Client-Side:**
- Lazy load ReadabilityPage and sub-components (LLM Preview, Chart)
- Use `useMemo` for expensive score calculations
- Use `useCallback` for handler stability
- Virtual scrolling for history list if > 50 items
- Debounce URL input validation (300ms)
- Progressive rendering: show scores first, LLM previews load asynchronously

**Network:**
- Parallel LLM API calls via `Promise.allSettled`
- Gzip compression on all API responses
- Cache URL fetch results server-side (1 hour TTL)
- Abort in-flight requests on cancel/navigation
- Truncate HTML content sent to LLMs (50,000 char limit)

**Rendering:**
- Skeleton loaders during async operations
- `React.memo` on pure display components (CheckItem, LLMColumn)
- Chart.js with `animation: false` if `prefers-reduced-motion`
- Code snippets rendered on-demand (accordion expand)

---

## 2. Security Requirements

### 2.1 Input Sanitization

| Input | Sanitization |
|---|---|
| URL input | Validate format; block private IPs, localhost, non-HTTP protocols; URL-encode special characters |
| HTML file upload | Parse as text only; never execute scripts; use DOMParser in sandboxed context |
| HTML paste | Same as upload; treat as untrusted HTML |
| Context fields (industry, keywords) | Sanitize for Firestore injection; strip HTML tags; limit length (200 chars) |
| Export filenames | Sanitize URL slugs; remove path traversal characters (../, \, etc.) |

### 2.2 Cross-Site Scripting (XSS) Prevention

| Vector | Mitigation |
|---|---|
| Uploaded HTML rendered in browser | NEVER render uploaded HTML in DOM; parse text content only via DOMParser |
| LLM responses containing HTML/JS | Render LLM markdown via `react-markdown` with `disallowedElements: ['script', 'iframe']` |
| URL reflected in UI | Use React's built-in JSX escaping; never use `dangerouslySetInnerHTML` for user URLs |
| Code snippets in recommendations | Render inside `<pre><code>` with text content (no innerHTML) |
| Shared analysis view | All data rendered via React (auto-escaped); no raw HTML injection |

### 2.3 API Security

| Requirement | Implementation |
|---|---|
| API keys never exposed to client | All LLM keys stored server-side in proxy; client sends Firebase auth token only |
| Authentication required | All API calls include `Authorization: Bearer {firebase-token}`; proxy validates token |
| Rate limiting | Per-user rate limits enforced server-side (see doc 04, section 5.1) |
| Input size limits | HTML content truncated to 50,000 chars before LLM calls; files limited to 10MB |
| Request validation | Proxy validates request body schema before forwarding to LLM APIs |
| CORS | Proxy allows only the portal's origin domain |
| HTTPS only | All API communication over TLS 1.2+ |
| No API key in URL params | API keys in request headers or body only |

### 2.4 Server-Side Request Forgery (SSRF) Prevention

The URL fetch proxy is the primary SSRF vector. Mitigations:

| Mitigation | Implementation |
|---|---|
| Block private IPs | Reject 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16, ::1 |
| Block localhost | Reject "localhost", "0.0.0.0" hostnames |
| Block internal services | Reject metadata service IPs (169.254.169.254, cloud metadata endpoints) |
| DNS rebinding protection | Resolve DNS before connecting; verify IP is not private after resolution |
| Port restriction | Allow only ports 80 and 443 |
| Protocol restriction | Allow only HTTP and HTTPS |
| Redirect validation | Re-validate each redirect destination against the same rules |
| Response size limit | Max 10MB response body |
| Timeout enforcement | Hard 30-second timeout |
| Block IPv6 private ranges | Reject ::1, fe80::/10, fc00::/7, and IPv4-mapped IPv6 (::ffff:127.0.0.1) |
| TOCTOU pinning | Pin resolved IP to connection socket; do not re-resolve during redirect |
| Post-redirect scheme validation | Re-validate protocol after each redirect (block gopher://, file://, dict://) |
| Cloud metadata header filtering | Strip or block forwarding of cloud metadata tokens (X-aws-ec2-metadata-token, Metadata-Flavor) |

### 2.5 Data Privacy

| Requirement | Implementation |
|---|---|
| Analyzed URLs visible only to owner | Firestore rules enforce `userId == auth.uid` |
| HTML snapshots encrypted at rest | Firebase Storage uses encryption at rest by default |
| LLM API calls don't store user data | Verify LLM provider data retention policies; use API parameters to opt out of training where available |
| Shared links are time-limited | Default 30 days; configurable; auto-expire |
| Account deletion removes all data | Delete all readability-analyses, readability-settings, and Storage files on account delete |
| No PII in analysis data | URLs and HTML content may contain PII; standard portal privacy policy applies |
| Exported PDFs contain no auth tokens | PDF includes analysis data only; no session/auth information |

### 2.6 Content Security

| Requirement | Implementation |
|---|---|
| Fetched HTML never executed | Content processed as text via DOMParser; never injected into live DOM |
| No eval() or Function() | No dynamic code execution on fetched/uploaded content |
| Content Security Policy | Existing CSP headers apply; no new inline scripts or styles needed |
| Third-party script loading | No new third-party scripts; all processing via existing dependencies |

---

## 3. Reliability Requirements

### 3.1 Availability Targets

| Component | Target |
|---|---|
| Input screen | 99.9% (static, client-side) |
| URL fetch proxy | 99.5% (depends on proxy uptime) |
| Claude API integration | 99% (external dependency) |
| Other LLM integrations | 95% (external, non-critical) |
| Firestore persistence | 99.9% (Firebase SLA) |
| Overall tool availability | 99.5% with graceful degradation |

### 3.2 Data Integrity

| Requirement | Implementation |
|---|---|
| Analysis results are immutable | Once saved, results are never modified (only new analyses created) |
| Score consistency | Same HTML input always produces same rule-based score (deterministic) |
| LLM results are timestamped | Each extraction includes model version and timestamp |
| Export matches dashboard | Exported PDF/JSON contains identical data to displayed results |
| No data loss on browser crash | Results saved to Firestore immediately after generation |

### 3.3 Error Recovery

| Failure | Recovery |
|---|---|
| Mid-analysis browser crash | User re-opens tool; no partial results saved; clean state |
| Mid-analysis network loss | AbortController fires; error shown; "Retry" available |
| Firestore write failure | Results displayed in-memory; "Save failed" notice; retry button |
| Token expiration mid-analysis | Auto-refresh token; retry failed request once |

---

## 4. Monitoring & Audit Trail (Required)

The following monitoring capabilities are REQUIRED for launch, not optional recommendations.

| Metric | How to Track |
|---|---|
| Analysis success rate | Log success/failure to Firestore or analytics |
| Average analysis duration | Timestamp start/end in analysis record |
| LLM API error rates | Log per-provider error counts |
| Rate limit hit frequency | Log rate limit events per user |
| Popular analyzed domains | Aggregate URL domains (anonymized) |
| Score distribution | Aggregate scores for quality benchmarking |
| API usage audit trail | Log userId, timestamp, provider, model, token counts, estimated cost, URL hash, status, latency to a dedicated api-usage-log Firestore collection. Retain 90 days minimum. |
| Cost alerting | Alert operations when any LLM provider reaches 80% of monthly cap |
| Abuse detection | Flag users exceeding 50% of their hourly rate limit consistently |

---

*Document Version: 1.1*
*Created: 2026-02-17*
*Last Updated: 2026-02-17*
*Status: Draft*
