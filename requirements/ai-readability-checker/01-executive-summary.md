# AI Readability Checker — Executive Summary & Product Vision

## 1. Product Overview

The **AI Readability Checker** is a new tool within the Content Strategy Portal that enables SEO professionals, content strategists, and web developers to evaluate how effectively their web content is interpreted and rendered by large language models (LLMs). As AI-powered search engines (Google AI Overviews, Bing Copilot, Perplexity, ChatGPT Browse, etc.) become primary information discovery channels, content that is poorly structured or invisible to LLMs risks losing visibility in AI-generated answers.

This tool provides two core capabilities:

1. **AI Readability Assessment** — A structured, scored evaluation of how well a page's content can be parsed, understood, and cited by LLMs, covering semantic structure, content clarity, machine-readable metadata, and technical accessibility.
2. **LLM Rendering Preview** — A side-by-side view showing users exactly what each major LLM "sees" when it processes their page, including the raw content extraction, parsed structure, and any content that is invisible or garbled to each model's crawler.

## 2. Business Case

### 2.1 Market Context

- **AI search adoption is accelerating.** Google AI Overviews, Perplexity, ChatGPT with browsing, and Bing Copilot are reshaping how users discover and consume content. Pages that LLMs cannot parse effectively are excluded from AI-generated answers.
- **No existing tool addresses this gap.** Current SEO tools (Screaming Frog, Ahrefs, SEMrush) focus on traditional search engine crawlability. No mainstream tool evaluates content specifically for LLM readability.
- **Content teams lack visibility.** Teams invest heavily in content creation but have no way to verify whether their pages are optimally structured for AI consumption.

### 2.2 Value Proposition

| Stakeholder | Value Delivered |
|---|---|
| SEO Specialists | Identify and fix AI readability issues before they impact AI search visibility |
| Content Strategists | Ensure content structure aligns with how LLMs extract and cite information |
| Web Developers | Validate that technical implementation (JS rendering, structured data, semantic HTML) supports AI crawling |
| Agency Teams | Deliver AI readability audits as a differentiated service offering to clients |
| Product Owners | Data-driven insights into content's AI search readiness |

### 2.3 Competitive Differentiation

This tool will be among the first to offer:
- Direct rendering comparison across multiple LLM crawlers
- Actionable scoring with specific fix recommendations
- Integration with Screaming Frog workflows (a tool already central to the portal)
- Claude AI-powered analysis providing intelligent, context-aware recommendations

## 3. Success Metrics

### 3.1 Adoption Metrics

| Metric | Target (90 days post-launch) |
|---|---|
| Monthly Active Users (tool) | 40% of portal MAU |
| Analyses Completed | 500+ per month |
| Repeat Usage Rate | 60% of users return within 30 days |
| Export/Share Rate | 25% of completed analyses |

### 3.2 Quality Metrics

| Metric | Target |
|---|---|
| Analysis Accuracy | 90%+ user-validated accuracy on scoring |
| Processing Success Rate | 95%+ for URL input, 98%+ for HTML upload |
| Mean Time to Results | < 15 seconds for URL input |
| User Satisfaction (NPS) | 50+ |

> **Note (D-GEO-07):** The 15-second target above is the baseline requirement. The 12-second target referenced in the Technical Performance Specification (DOC 10) is a **stretch goal** for optimized environments and should not be treated as the primary SLA.

> **Secondary KPI (E-GEO-01):** **Citation Likelihood Score** — The percentage of analyzed pages that achieve a "high citation-worthiness" rating (as assessed by the Claude-powered analysis) should be tracked as a secondary quality KPI. Target: 30%+ of analyzed pages score "high" or above on citation likelihood within 90 days post-launch.

### 3.3 Business Impact Metrics

| Metric | Target |
|---|---|
| Portal Engagement Lift | 15% increase in overall session duration |
| Tool Cross-Usage | 30% of AI Readability users also use Technical Audit |
| Client Report Inclusion | 20% of exports used in client-facing deliverables |

## 4. Scope

### 4.1 In Scope (MVP)

- URL-based content fetching and analysis
- HTML file upload (rendered HTML from Screaming Frog JS crawl)
- AI Readability scoring with category breakdown
- LLM rendering preview for: **Claude (Anthropic)**, **GPT (OpenAI)**, **Gemini (Google)**, **Perplexity**
- Actionable recommendations with priority ranking
- Export to PDF and JSON
- Firestore persistence of analysis history
- Integration with existing portal authentication, theming, and navigation

### 4.2 In Scope (Post-MVP Enhancements)

- Batch URL analysis (CSV/sitemap import)
- Historical trend tracking per URL
- Competitor comparison mode
- Custom scoring weight configuration
- API endpoint for CI/CD integration
- Slack/webhook notifications for score regressions

### 4.3 Out of Scope

- Real-time monitoring / continuous crawling
- Content editing or CMS integration
- Paid LLM API cost pass-through to end users (costs absorbed by portal)
- Mobile-native application

## 5. Assumptions & Dependencies

### 5.1 Assumptions

- Users have access to Screaming Frog and can export rendered HTML (for the upload path)
- The portal's existing Claude AI proxy (`VITE_AI_PROXY_URL`) can be extended for readability analysis
- Third-party LLM APIs (OpenAI, Google, Perplexity) are available and permit content analysis use cases under their terms of service
- Users are authenticated via the existing Firebase Auth system

### 5.2 Dependencies

| Dependency | Type | Risk Level |
|---|---|---|
| Claude API (Anthropic) | External Service | Low — already integrated |
| OpenAI API | New External Service | Medium — requires new API key and proxy route |
| Google Gemini API | New External Service | Medium — requires new API key and proxy route |
| Perplexity API | New External Service | Medium — requires new API key and proxy route |
| Web content fetching service | New Backend Service | High — requires server-side proxy for CORS/JS rendering |
| Screaming Frog rendered HTML format | External Tool Dependency | Low — stable export format |
| Firebase Firestore | Existing Service | Low — already in use |

### 5.3 Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| LLM API rate limits | Degraded performance | Medium | Implement queuing, caching, and graceful degradation |
| CORS restrictions on URL fetch | URL input fails | High | Server-side proxy required; HTML upload as fallback |
| LLM API pricing changes | Cost overruns | Medium | Usage tracking, per-user quotas, caching of repeat analyses |
| Content rendering differences across LLMs | Inaccurate previews | Medium | Regular validation against actual LLM outputs; clear disclaimers |
| JavaScript-heavy sites not rendering | Incomplete analysis | Medium | Clear UX guidance to use Screaming Frog JS crawl export instead |
| LLM model version changes | Score inconsistency across analyses; historical comparisons become unreliable | Medium | Store model version per analysis; display version drift warnings on historical comparisons |

## 6. Timeline Considerations

### Phase 1: Foundation
- Core analysis engine and scoring system
- URL input with server-side fetching
- HTML file upload
- Claude-powered readability assessment
- Basic results dashboard

### Phase 2: Multi-LLM Preview
- OpenAI rendering preview integration
- Google Gemini rendering preview integration
- Perplexity rendering preview integration
- Side-by-side comparison view

### Phase 3: Polish & Export
- PDF and JSON export
- Analysis history and persistence
- Recommendations engine refinement
- Home screen integration and quick actions

### Phase 4: Advanced Features
- Batch analysis
- Trend tracking
- Competitor comparison

## 7. Stakeholder Sign-Off

| Role | Name | Date | Status |
|---|---|---|---|
| Product Owner | | | Pending |
| Technical Lead | | | Pending |
| UX Lead | | | Pending |
| QA Lead | | | Pending |

---

*Document Version: 1.1*
*Created: 2026-02-17*
*Last Updated: 2026-02-17*
*Status: Draft — Updated with D-GEO-07, E-GEO-01, E-GEO-04 revisions*
