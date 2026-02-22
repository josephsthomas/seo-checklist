# Head of Technology — Requirements Review

**Reviewer:** Head of Technology
**Document:** pricing-payments-requirements.md
**Date:** 2026-02-22
**Status:** Complete

---

## Executive Summary

The requirements document is well-structured and covers the billing domain with commendable breadth, including a solid legal compliance wave (Sections 11–19). However, the document has critical gaps from an infrastructure and reliability standpoint: it specifies no CI/CD pipeline, no staging environment strategy, no load testing gate before launch, no disaster recovery or backup procedure, no Infrastructure as Code approach, and no SLA measurement mechanism — despite defining SLAs in Section 2.1. The `credit_balances/{userId}` single-document-per-user design is a Firestore write bottleneck that will degrade under Agency-tier burst usage and is the most architecturally consequential issue. The document is approved with conditions: all Critical findings must be resolved before any code is written in Batch 2, and all Major findings must be resolved before Batch 6 goes to production.

---

## Sections Reviewed

| Section | Title | Focus Level |
|---------|-------|-------------|
| 1 | Overview & Goals | Standard |
| 2 | Tier Definitions & Credit System | Deep |
| 3 | Data Models & Firestore Schemas | Deep |
| 4 | Backend API Specifications | Deep |
| 5 | Frontend Components | Standard |
| 6 | Registration Flow Updates | Standard |
| 7 | Usage Enforcement & Gating | Deep |
| 8 | Admin Features & Observability | Deep |
| 9 | User Stories by Implementation Batch | Standard |
| 10 | Implementation Notes & Conventions | Deep |
| 11 | Legal & Compliance Requirements | Standard |
| 12 | Transactional Email System | Standard |
| 13 | Annual Pricing & Billing Intervals | Standard |
| 14 | Free Trial Strategy | Standard |
| 15 | Enterprise Tier — Lead Capture | Standard |
| 16 | Cancellation Retention Flow | Standard |
| 17 | Credit System — Amended Policies | Deep |
| 18 | Compliance Data Models | Deep |
| 19 | New API Endpoints — Wave 1 | Deep |
| Appendix A | Batch Dependency Graph | Standard |
| Appendix B | File Manifest | Standard |

---

## Findings

### Critical (Must fix before implementation)

- **[REQ-12-C01]** Section 3.4 — Firestore Hot Document Write Bottleneck (`credit_balances/{userId}`):
  The entire credit system converges on a single Firestore document per user (`credit_balances/{userId}`). Every credit consumption event — including all 15+ tool component calls in Section 7.5 — triggers a transactional write-and-read on this one document. Firestore's hard limit for document update throughput on a single document is approximately 1 write per second. For Agency-tier users with multiple concurrent team members (the tier explicitly has unlimited seats), or for a single user running bulk schema generation or bulk meta generation in rapid succession, this becomes a serialization chokepoint. The `usageService.js` also writes a `usage_events` record per action. Under normal Agency usage — say, 5 team members each clicking an AI action within the same second — the system will produce write contention errors that Firestore surfaces as `ABORTED` transaction failures.
  **Recommendation:** Split the balance into a sub-collection sharded ledger, or adopt a counter-shard pattern (Firestore documentation: distribute writes across N shard documents and aggregate on read). For MVP, a minimum of 10 shards per user for the credit balance counter is appropriate. Alternatively, push balance state to a Redis atomic counter (via Cloud Memorystore) and treat Firestore as the durable ledger, not the hot write target. The current architecture will fail in production for any Agency account with active team usage.

- **[REQ-12-C02]** Section 4.4.3 / Section 7.2 — Credit Consumption Race Condition: Server-Side Check After Client-Side Check Is Insufficient:
  Section 7.2 describes the credit flow as: "Frontend checks local credit balance → IF sufficient → Call backend POST /api/credits/consume → Backend validates server-side balance." This is the correct intent, but `creditService.consumeCredits` must execute inside a Firestore transaction to be safe. Story 2.6 does state "All operations use Firestore transactions to prevent race conditions," which is correct — but the requirements also say the frontend performs a local optimistic check before calling the backend. If the frontend calls `consumeCredits` twice in rapid succession (e.g., double-click, network retry on timeout, or two browser tabs), both requests may pass the server-side read phase of the transaction before either commit lands, depending on transaction isolation timing. The `processed_events` idempotency pattern specified for webhooks (Section 4.4.6) is not specified for `POST /api/credits/consume`. A user could drain negative credits if two consume requests race.
  **Recommendation:** Require an idempotency key on every `POST /api/credits/consume` request (client generates a UUID per button click, backend deduplicates within a 60-second window using a `credit_consume_idempotency/{key}` collection entry with TTL). Document this as a mandatory field in the API spec, and require the frontend `useCredits` hook to generate and attach this key on every call.

- **[REQ-12-C03]** Sections 3.11 / 10.5 / 10.6 — Secrets Management Is Unspecified and Insecure by Omission:
  Section 3.11 lists fourteen environment variables including `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `FIREBASE_PRIVATE_KEY`. Section 10.5 says "Firebase Admin SDK credentials must be securely stored (environment variables, not committed)" — this is a statement of intent, not an implementation requirement. The document provides no requirements for:
  (a) A secrets manager (GCP Secret Manager, AWS Secrets Manager, HashiCorp Vault) to store and rotate credentials at rest;
  (b) Secret rotation procedures and cadence;
  (c) Least-privilege IAM service accounts for the Firebase Admin SDK (the current spec implies a single service account with full project access);
  (d) Audit logging of secrets access;
  (e) Preventing `server/.env` from being committed to version control.
  The `server/.env.example` file requested in Story 2.1 will exist adjacent to a `server/.env` file in the repository working directory. There is no `.gitignore` requirement specified.
  **Recommendation:** Add a mandatory requirement: all secrets must be stored in GCP Secret Manager. The Node.js server must retrieve secrets at startup via the Secret Manager API, not from disk `.env` files in production. The `server/.env` approach is acceptable for local development only and must be blocked from deployment via CI/CD pipeline checks. Add `server/.env` to `.gitignore` as an AC item in Story 2.1. Define a minimum quarterly rotation cadence for `STRIPE_SECRET_KEY` and `FIREBASE_PRIVATE_KEY`.

- **[REQ-12-C04]** Section 10 (all) — No CI/CD, No Staging Environment, No Environment Promotion Strategy:
  The document defines seven implementation batches and a production deployment (Section 10.5 mentions Railway/Render/Fly.io/Cloud Run) but contains zero requirements for:
  (a) A CI/CD pipeline (GitHub Actions, Cloud Build, etc.);
  (b) A staging environment that mirrors production Stripe (using Stripe test mode pointed at staging Firebase project);
  (c) Environment promotion gates (who approves promotion from staging to production?);
  (d) Zero-downtime deployment requirements (the Node.js server is stateful during webhook processing);
  (e) Database migration strategy for Firestore schema evolution after launch (the migration script in Story 1.5 is a one-time pre-launch script, not a migration framework);
  (f) Feature flags to enable/disable billing features independently of code deployments.
  This is not a nice-to-have. A billing system deployed directly from a developer laptop to production with no staging environment, no CI/CD, and no deployment gates will result in production incidents. A bad webhook handler deployed directly to production with Stripe in live mode can corrupt credit balances for real paying customers with no rollback path.
  **Recommendation:** Add a new Section (REQ-INFRA) with explicit requirements for: (1) a three-environment strategy (dev/staging/prod), each with its own Firebase project and Stripe account in test mode for dev/staging, live mode for prod; (2) a CI/CD pipeline that runs all tests, performs a lint and security scan, and requires a passing build before any deployment; (3) a feature flag system (LaunchDarkly or a simple Firestore-backed flag) to decouple billing feature rollout from deployment; (4) zero-downtime deployment using rolling restarts with health check probes on `GET /health`.

- **[REQ-12-C05]** Section 4.4.6 / Section 8.7 — No Disaster Recovery Plan: Stripe Outage, Webhook Replay, Credit Balance Corruption:
  The document has no requirements covering:
  (a) What happens when Stripe is unreachable during a checkout session creation (the user gets a 500 error — is that acceptable?);
  (b) What happens if the webhook endpoint is down for 30 minutes during a billing cycle renewal (Stripe retries webhooks with exponential backoff for up to 72 hours, but the requirements do not address webhook catch-up or reconciliation);
  (c) What happens if a credit balance document is corrupted (e.g., negative credits due to a bug, or a field set to null by a failed transaction) — there is no repair procedure specified;
  (d) What happens if the Node.js server crashes mid-transaction during credit consumption (the Firestore transaction will roll back, but the `usage_events` write may have already landed, creating a phantom usage record with no corresponding balance debit);
  (e) Firestore export/backup schedule.
  **Recommendation:** Add a Disaster Recovery section with: (1) Firestore automated daily exports to a GCS bucket (this is a GCP console toggle — it must be explicitly required); (2) a Stripe-to-Firestore reconciliation job that can be run on-demand to compare Stripe subscription state with Firestore mirror and flag/correct divergences; (3) a credit balance integrity check job that validates `standardCreditsRemaining >= 0` and `balanceAfter` consistency in the transaction ledger; (4) a defined RTO (Recovery Time Objective) and RPO (Recovery Point Objective) for the billing system.

---

### Major (Should fix before implementation)

- **[REQ-12-M01]** Section 3.9 / Section 8 — `usage_events` Collection Will Become a Firestore Cost and Performance Problem at Scale:
  `usage_events/{eventId}` is described as a "high-volume collection" with no document TTL enforcement in Firestore itself. At Agency tier scale, a single active user can generate 60+ credit consumption events per minute (rate limit per Section 4.6). At 1,000 Agency users, that is 60,000 documents per minute, 86 million documents per day. Firestore charges $0.06 per 100,000 document reads. Admin analytics queries in Section 8.5 (credit consumption by tier, top consumers) will perform collection-group queries across this entire collection — unbounded in cost and latency. The composite indexes specified in Section 3.9 help but do not prevent runaway read costs on broad analytics queries. The document also specifies a daily cron job for data retention enforcement (Section 7.9) that deletes individual documents — at Firestore's $0.02 per 100,000 deletes, mass deletion of tens of millions of documents is a significant operational cost.
  **Recommendation:** Designate `usage_events` as a write-through cache with a 24-hour BigQuery streaming export pipeline. Analytics queries against `usage_events` should run in BigQuery, not Firestore. Firestore `usage_events` should retain only the last 90 days of rolling data, with automated Firestore TTL (using a `_expireAt` field and a Cloud Firestore TTL policy) rather than a cron-based deletion job. This is architecturally important before any analytics dashboards are built on top of this collection.

- **[REQ-12-M02]** Section 4.6 — Rate Limiting Strategy Is Incomplete and Bypassable:
  The rate limiting table in Section 4.6 specifies limits per user (authenticated) but does not address:
  (a) IP-based rate limiting for unauthenticated endpoints (the checkout session creation endpoint can be called by a newly registered user before they have meaningful rate limit history);
  (b) The webhook endpoint has a global limit of "1000 per minute" — this is a single Express.js instance limit. At scale with multiple server replicas, this limit must be enforced at a load balancer or API gateway level, not in-process;
  (c) No distributed rate limiting is specified — `express-rate-limit` with in-memory storage does not work correctly behind multiple Node.js replicas (each replica has its own counter);
  (d) No rate limiting is specified for the `GET /api/credits/balance` endpoint called by `SubscriptionContext` via `onSnapshot` listeners — if 10,000 users are all on the billing dashboard simultaneously, this generates 10,000 persistent Firestore listeners, not HTTP requests, but the backend calls triggered by balance changes are unbounded;
  (e) The `POST /api/credits/consume` endpoint at 60/minute per user is the most sensitive endpoint in the system (it controls money) and has no burst protection or anomaly detection requirement beyond the alert in Section 8.7.
  **Recommendation:** Replace `express-rate-limit` with Redis-backed rate limiting (e.g., `rate-limit-redis` or `ioredis` with a sliding window algorithm) to share state across all server replicas. Add IP-based rate limiting as a secondary layer for unauthenticated paths. Specify that the webhook endpoint rate limit is enforced at the load balancer level (Cloud Armor, nginx, or an API gateway), not in Express.

- **[REQ-12-M03]** Section 4.4.6 — Webhook `processed_events` Collection Has No TTL and Will Grow Without Bound:
  The idempotency mechanism stores a `processed_events` record per Stripe webhook event. Stripe generates many events per customer per billing cycle (checkout, subscription created, subscription updated, invoice finalized, invoice paid = minimum 5 per monthly renewal). At 1,000 subscribers, that is 5,000+ records per month, growing indefinitely. The document specifies no cleanup policy for this collection. Furthermore, this collection is checked on every webhook — at high webhook volume, the read cost accumulates.
  **Recommendation:** Add `expiresAt: Timestamp` to every `processed_events` document set to 30 days from creation, and enable Firestore TTL on this field. Add this TTL requirement as an AC in Story 2.5. Also add an index on `eventId` for O(1) lookup.

- **[REQ-12-M04]** Section 2.2.4 / Section 8.5 — No LLM Cost Tracking Integration: Margin Assumptions Are Unvalidated at Runtime:
  Section 2.2.4 presents margin estimates ("AI cost tracking — Estimated actual AI API costs based on usage events") but the cost tracking in Section 8.5 is described as "Estimated actual AI API costs based on usage events" — i.e., the system multiplies credit consumption counts by a static cost assumption. This is not actual cost tracking. The actual LLM API cost depends on:
  (a) Token counts per call, which vary by content length;
  (b) LLM provider pricing tiers and volume discounts;
  (c) Model selection (GPT-4o vs GPT-4o-mini have dramatically different per-token costs);
  (d) Failed or partial LLM calls that still incur cost.
  There is no requirement to capture actual LLM API response metadata (token usage, model used, latency) and correlate it with the `usage_events` record. The margin analysis in Section 8.5 will be systematically incorrect if actual token usage deviates from the static estimate.
  **Recommendation:** Require that every LLM API call captures `promptTokens`, `completionTokens`, `modelId`, and `estimatedCostUsd` from the API response and stores them in the `usage_events.metadata` object. The admin margin analysis should aggregate these actual costs rather than multiplying a static per-credit cost. This is critical for validating whether the credit pricing covers actual costs over time.

- **[REQ-12-M05]** Section 10.5 / Section 4.1 — Node.js Server Hosting Is Underspecified: No Auto-Scaling, No Health Check, No Cold Start Mitigation:
  Section 10.5 gives three deployment options (Railway, Render, Fly.io, or Firebase Cloud Run) with no guidance on which to choose, no minimum resource specifications, no auto-scaling policy, and no cold start requirements. This matters for billing because:
  (a) Cloud Run spins down to zero instances when idle — a cold start on the webhook endpoint means Stripe's webhook delivery may time out (Stripe requires a response within 30 seconds), causing Stripe to retry;
  (b) A single-instance deployment on Railway/Render has no horizontal scaling — if webhook volume spikes during a monthly billing cycle (when many subscriptions renew simultaneously), a single instance may queue up, creating a processing backlog that delays credit resets for users;
  (c) The memory footprint of the Firebase Admin SDK and Stripe SDK together with active Firestore listeners is not specified, so resource sizing cannot be determined.
  **Recommendation:** Specify minimum infrastructure requirements: (1) minimum 2 replicas at all times (no cold start scenario on the webhook endpoint); (2) auto-scaling trigger at 70% CPU or 500ms average response time; (3) minimum 512MB RAM per instance; (4) Cloud Run with minimum-instances=2 is the recommended approach if Firebase is already the primary infrastructure vendor (same GCP project, unified billing, no egress charges between Cloud Run and Firestore).

- **[REQ-12-M06]** Sections 8.7 / 19.6 — Observability Is Scattered and Incomplete: No Unified Logging, No Distributed Tracing, No Uptime Monitoring, No SLA Measurement:
  Section 2.1 defines support SLAs (48hr email response for Client Side, 12hr for Agency) but provides no technical mechanism to measure these SLAs. Section 8.7 defines business alerts (high churn, payment failure spike) but provides no requirements for:
  (a) Structured JSON logging format and log aggregation platform (Cloud Logging, Datadog, Papertrail);
  (b) Distributed tracing across the React SPA → Express API → Firestore → Stripe call chain (a request ID or correlation ID is not mentioned);
  (c) Error tracking and alerting (Sentry or equivalent) — when `creditService.consumeCredits` throws an unhandled error, who is notified and how fast?;
  (d) Uptime monitoring with external probes on `GET /health` (Section 8.7 has no uptime alert);
  (e) Latency percentile tracking for `POST /api/credits/consume` (this is the most latency-sensitive endpoint — a slow credit consume blocks the user action);
  (f) Dashboard for real-time webhook processing lag.
  The `logger.js` utility mentioned in Story 2.11 is a blank slate with no specification.
  **Recommendation:** Add a mandatory observability requirements section specifying: (1) structured logging to Cloud Logging with fields: `requestId`, `userId`, `action`, `durationMs`, `statusCode`, `errorCode`; (2) Sentry integration for error tracking with alert threshold of >10 errors/minute on any endpoint; (3) Cloud Monitoring uptime check on `GET /health` with PagerDuty alert on 2 consecutive failures; (4) a `X-Request-ID` header propagated from the frontend through the Express API to all downstream Firestore and Stripe calls for distributed tracing.

- **[REQ-12-M07]** Section 9 (all batches) — No Load Testing Gate Before Launch:
  The document specifies 7 implementation batches and an environment setup checklist (Section 10.4) with no requirement to perform load testing before accepting real payment traffic. This system will handle financial transactions. Without load testing:
  (a) The Firestore hot document problem (C01) will only be discovered in production under real user load;
  (b) The webhook processing throughput under a monthly billing cycle spike (where hundreds of `invoice.paid` events arrive within minutes when subscriptions renew) is unknown;
  (c) The Node.js server's ability to handle concurrent Stripe webhook signature verifications (which are CPU-bound cryptographic operations) under load is unknown;
  (d) The Firebase Admin SDK's connection pooling behavior under concurrent requests is unknown.
  **Recommendation:** Add a pre-launch requirement: a load test must be executed and pass before any paid subscription is accepted. The load test must simulate: (1) 100 concurrent credit consume requests per second for 5 minutes; (2) a burst of 500 simultaneous webhook events (simulating a billing cycle renewal spike); (3) 50 concurrent checkout session creations. All p95 latencies must be below 2 seconds. Pass/fail criteria must be documented and signed off by engineering leadership.

- **[REQ-12-M08]** Section 19.3 — OFAC Sanctions Screening Implementation Is Technically Underdetermined:
  Section 19.3 requires OFAC screening at three integration points (registration, nonprofit submission, checkout) but specifies no screening provider, no API contract, no latency budget for the screening call (it is "internal" and synchronous in the call chain of `POST /api/checkout/create-session`, which will add latency to every checkout), no fallback behavior if the screening provider is unavailable, and no false-positive handling process. The requirement to use `Stripe Radar` as a screening provider (one option listed in the schema) is architecturally different from an SDN list API call — Stripe Radar is a fraud tool, not a sanctions screening tool.
  **Recommendation:** Choose a specific OFAC screening provider (e.g., Comply Advantage, Chainalysis, or the US Treasury's direct SDN API). Define a latency SLA for the screening call (recommendation: async screening with a 5-second synchronous timeout that defaults to "clear" with a deferred review flag, to avoid blocking the checkout experience on a slow sanctions API). Define false-positive handling: who reviews a `possible_match` result and within what SLA? This must be specified before Story 19's implementation begins, as the entire compliance_screening_events schema depends on it.

---

### Minor (Fix during implementation)

- **[REQ-12-m01]** Section 3.2 — `users/{userId}` Denormalized Credit Fields Are a Consistency Hazard:
  The `users/{userId}` document contains `creditsRemaining` and `aiCreditsRemaining` as denormalized copies of fields in `credit_balances/{userId}`. Every credit transaction must atomically update two documents — `credit_balances` and `users`. If the transaction succeeds on `credit_balances` but fails on `users` (network partition, quota exceeded on the `users` collection), these values diverge. The frontend reads credits from `credit_balances` via the `SubscriptionContext` Firestore listener (Section 6.3), while some components may read from the `users` doc via `AuthContext`. This dual-source-of-truth creates subtle display inconsistencies.
  **Recommendation:** During implementation of Story 2.6, ensure that all credit writes use a single Firestore batch that includes both the `credit_balances` and `users` document updates atomically. Add a reconciliation check in the admin tools that alerts when `users.creditsRemaining != credit_balances.standardCreditsRemaining` for any user. Long-term, evaluate whether `creditsRemaining` on the `users` doc is actually needed or can be removed in favour of always reading from `credit_balances`.

- **[REQ-12-m02]** Section 3.11 — `CORS_ORIGINS` Is a Single Value: Multi-Environment Support Is Not Specified:
  The environment variable `CORS_ORIGINS=http://localhost:5173` in Section 3.11 is a single string. In production, the CORS origin will be the production domain (e.g., `https://app.contentstrategoportal.com`). In staging, it will be a different domain. The server code will need to parse a comma-separated list of allowed origins, or the variable will need to be environment-specific. Story 2.1 does not specify how CORS is configured for multiple environments, and the `.env.example` will contain development defaults.
  **Recommendation:** Change `CORS_ORIGINS` to support a comma-separated list of allowed origins. Document that this variable must be explicitly set per environment in the deployment configuration, with no cross-environment inheritance. Add a startup validation that rejects a `*` wildcard value in production (detectable by checking `NODE_ENV`).

- **[REQ-12-m03]** Section 6.4 — Tier Configuration Is Duplicated Between Frontend and Backend:
  Section 6.4 specifies `src/config/tiers.js` (frontend) and Section 4.2 specifies `server/src/config/tiers.js` (backend) as separate files that must be kept in sync. Story 1.1 acknowledges this as a "server-side copy." This is a maintenance hazard: if the product team changes a credit cost or tier limit, the change must be applied in two places. The document provides no mechanism to enforce parity between the two copies.
  **Recommendation:** Extract `tiers.js` into a shared package (e.g., `packages/csp-config/` in a monorepo structure, or a published internal npm package). Both the frontend Vite build and the backend Node.js server import from the same source. If a full monorepo is not practical for MVP, at minimum add a CI/CD job that compares the two files on every commit and fails if they diverge.

- **[REQ-12-m04]** Section 14.2 — Free Trial Abuse Prevention Is Underspecified:
  Section 14.2 states "One trial per email address, one trial per payment method (enforced at conversion)" — but the trial starts without a payment method (no-credit-card required). The email uniqueness check is bypassable with disposable email addresses. Stripe's payment method deduplication only applies at conversion, meaning a bad actor can create unlimited trial accounts using disposable emails, consuming 14 days of full Freelance-tier AI credits (1,500 standard + 400 AI credits = $20+ in cost at estimated operational cost rates) per account.
  **Recommendation:** Add AC to Story 14.1: (1) Integrate email verification before trial provisioning (the existing `emailVerified` field in the `users` schema must be `true` before Freelance trial credits are provisioned); (2) add IP-based trial rate limiting (maximum 2 trials per IP address per 30-day rolling window, logged to `compliance_screening_events`); (3) consider fingerprinting via device signal at trial start.

- **[REQ-12-m05]** Section 7.9 — Data Retention Cron Job Is Underspecified: No Platform, No Failure Handling:
  Section 7.9 describes a "scheduled backend job (cron or Cloud Scheduler)" that runs daily to delete records older than the user's `dataRetentionDays`. This job is not represented in any batch's user stories, has no file manifest entry, and has no failure handling specification. If this job fails silently, Basic tier users' data will accumulate beyond the 30-day retention promise, creating a GDPR compliance violation.
  **Recommendation:** Add a new user story in Batch 2 or Batch 7 specifying: (1) the data retention cron job implemented as a Cloud Scheduler job triggering a dedicated Express endpoint (or a Firebase Scheduled Function); (2) success/failure logged to Cloud Logging with alerting on failure; (3) dry-run mode for testing; (4) a max-documents-per-run cap to prevent timeout on large collections.

- **[REQ-12-m06]** Section 17.2 / Section 3.6 — `credit_packs` Expiry Field Is Not Reflected in the Credit Balance Consumption Logic:
  Section 17.2 adds `expiresAt: Timestamp` to `credit_packs` documents and specifies a daily cron to zero out expired packs. However, the `creditService.consumeCredits` logic described in Story 2.6 does not account for pack expiry: it consumes "bonus credits" without checking whether the originating pack has expired. If packs expire mid-month, a user may have `bonusStandardCredits > 0` in `credit_balances` but the underlying pack has expired — the balance is stale.
  **Recommendation:** The `credit_balances.bonusStandardCredits` field must be kept in sync with the sum of `standardCreditsRemaining` across all non-expired `credit_packs` for that user. Either (a) recompute this sum on every credit consume call by querying active packs (adds a Firestore read per transaction), or (b) the expiry cron job must also update `credit_balances.bonusStandardCredits` when it zeroes out a pack. Option (b) is preferred for performance. Add this as an explicit AC to the pack expiry cron job story.

---

### Suggestions (Consider for future)

- **[REQ-12-S01]** Section 3 (all collections) — No Infrastructure as Code for Firestore Configuration:
  All Firestore collections, composite indexes (Section 3.9), security rules (`firestore.rules`), and TTL policies are created manually or via one-time scripts. There is no requirement for Infrastructure as Code (IaC) tooling such as Terraform (with the Google Cloud provider), Pulumi, or even the Firebase CLI's `firestore.indexes.json` and `firestore.rules` files committed to version control and deployed via CI/CD. After launch, if a new index is needed for an analytics query, it must be created manually in the Firebase console — an error-prone, undocumented change with no audit trail.
  **Recommendation:** Add a requirement to commit `firestore.indexes.json` and `firestore.rules` to version control and deploy them via the Firebase CLI in the CI/CD pipeline (`firebase deploy --only firestore:rules,firestore:indexes`). For the Node.js server's cloud infrastructure (Cloud Run service, Cloud Scheduler jobs, Secret Manager secrets), add a Terraform or Pulumi configuration in `infrastructure/` that declares the expected state. This does not need to be implemented in MVP Batch 1 but must be in place before production launch.

- **[REQ-12-S02]** Section 2.1 — No Annual Commitment Discount for Agency Tier Seats: Competitive Gap:
  Section 13 adds annual billing at 17% discount for all tiers. However, the Agency tier's primary value proposition includes unlimited seats, and the pricing does not address per-seat pricing for volume. Enterprise-segment customers (who are also the explicit target of Section 15) will expect to negotiate per-seat pricing, and the absence of any seat-based pricing model creates a gap between the Agency tier ($299/month flat) and the Enterprise custom pricing card — there is no stepping stone. A single-person agency at $299/month and a 50-person agency at $299/month pay the same.
  **Recommendation:** For a future pricing iteration, consider a per-seat add-on above a base Agency seat count (e.g., Agency base = 5 seats at $299/month, $15/seat/month for additional seats). This would require the credit system to support per-seat credit pooling or individual seat credit allocation. Document this as a known gap in the current architecture and ensure the data model can support it without a breaking schema change.

- **[REQ-12-S03]** Section 5 / Section 6 — No Multi-Region or CDN Strategy for the React SPA:
  The frontend is a Vite-built React SPA. The document assumes Firebase Hosting as the deployment target for the SPA (given the Firebase-first architecture) but does not specify CDN configuration, cache headers for the SPA shell vs. API responses, or geographic distribution strategy. For a SaaS product targeting agencies (who may have international clients), the absence of CDN planning means users in non-US regions will experience higher latency on both the SPA load and the API calls to the Node.js server.
  **Recommendation:** For the SPA, require Firebase Hosting with a global CDN configuration (Firebase Hosting uses Google's CDN by default — this should be documented and enabled). For the API server, if Cloud Run is chosen, specify the Cloud Run region explicitly and add a Cloud Load Balancer in front if multi-region serving is needed. Add cache-control headers to the `GET /api/credits/balance` endpoint (short TTL: 5 seconds with ETag) to reduce redundant backend calls from the `SubscriptionContext` polling.

- **[REQ-12-S04]** Section 9 — The 7-Batch Plan Creates Significant Technical Debt in Batch 6:
  Batch 6 (Usage Enforcement & Feature Gating) modifies 15+ existing tool components by adding `useCredits` and `useFeatureGate` hooks. This is described as cross-cutting modifications to existing working tools. The risk is that Batch 6 is implemented under time pressure after Batch 5 is complete, the gating logic is copy-pasted inconsistently across 15 components, and subtle differences in how each component calls `consumeCredits` (different `resourceId` passing, different error handling) create a testing surface that is expensive to cover. The current test strategy (Section 10.2) specifies component tests for "critical UI flows" but does not specifically require a test for every tool's credit gating integration.
  **Recommendation:** Before Batch 6 begins, define a standard "credit-gated action" pattern as a Higher-Order Component or a standardized hook composition that every tool must use identically — no inline implementations. Require a unit test for each of the 15+ gating integrations specifically testing the "insufficient credits" branch, the "race condition on double-click" scenario, and the "successful consume then action" happy path. Consider adding an integration test suite that spins up the backend with a test Firebase project and exercises the full credit consume flow end-to-end for at least 5 representative tool actions.

- **[REQ-12-S05]** Section 13 — Annual Plan Downgrade and Proration Logic Is Underspecified:
  Section 13.2 states "Annual subscribers do not receive prorated refunds on downgrade — plan changes take effect at annual renewal date." However, the existing `POST /api/subscriptions/downgrade` endpoint in Section 4.4.2 uses Stripe's proration mechanism, which applies differently to annual vs. monthly subscriptions. Stripe's behavior for annual-to-lower-annual downgrades generates a credit note (not a refund), which Stripe applies to the next invoice. The requirements do not address this Stripe-specific behavior, and the `subscriptionService.js` implementation will need to handle annual vs. monthly subscription changes with different code paths.
  **Recommendation:** Explicitly specify in Section 13.2 and in Story 2.8's AC that the downgrade endpoint must detect the subscription interval (`month` vs. `year`) and apply different Stripe proration behavior: for annual, use `proration_behavior: 'none'` and schedule the change at `billing_cycle_anchor` (renewal date); for monthly, use the existing `proration_behavior: 'create_prorations'` flow. Add a test case covering annual-to-annual tier downgrade specifically.

- **[REQ-12-S06]** Section 16 — Cancellation Retention Flow Discount Coupon Has No Redemption Tracking or Abuse Prevention:
  Section 16.1 specifies a "one-time 20% discount coupon" (if `STRIPE_RETENTION_COUPON_ID` is configured) as a save offer for the "Too expensive" cancellation reason. The document does not specify:
  (a) Whether this coupon is per-user (single redemption per customer) or a shared coupon code that can be reused;
  (b) Whether a user can cancel, receive the discount, reactivate, cancel again, and receive another discount (the "coupon farming" scenario);
  (c) Whether the discount appears on the customer's invoice in a way that requires disclosure under Section 11's compliance requirements.
  **Recommendation:** Require that the retention coupon is generated as a unique single-use Stripe coupon per customer (using `Stripe.coupons.create` with `max_redemptions: 1` and `metadata.userId`) rather than a shared coupon code. Store `retentionCouponOfferedAt` and `retentionCouponAccepted: boolean` on the subscription document. Limit retention coupon offers to once per 12-month rolling window per account.

---

## New Requirements

The following requirements are missing from the document and must be added. Each is written in the document's user story format with acceptance criteria.

---

**REQ-NEW-01: Infrastructure as Code for Firebase and Cloud Run Configuration**

**Section:** [New Section, recommend Section 20: Infrastructure Requirements]

**As a** engineering team, **I want** all cloud infrastructure declared as code in version control, **so that** environments are reproducible, changes are auditable, and there is no configuration drift between staging and production.

**AC:**
- [ ] `firestore.indexes.json` committed to repository root and deployed via `firebase deploy --only firestore:indexes` in CI/CD
- [ ] `firestore.rules` committed to repository root and deployed via `firebase deploy --only firestore:rules` in CI/CD
- [ ] Cloud Run service definition (minimum instances: 2, memory: 512MB, CPU: 1, region: us-central1) declared in `infrastructure/cloud-run.tf` or equivalent
- [ ] Cloud Scheduler job for data retention cron declared in IaC
- [ ] All Secret Manager secrets declared in IaC (names only — values populated separately via secure process)
- [ ] `infrastructure/README.md` documents how to bootstrap a new environment
- [ ] CI/CD pipeline deploys infrastructure changes on merge to main

**Files:**
- Create: `firestore.indexes.json`
- Create: `infrastructure/main.tf` (or `infrastructure/pulumi/index.ts`)
- Modify: CI/CD pipeline configuration

---

**REQ-NEW-02: CI/CD Pipeline with Staging Environment Gate**

**Section:** [New Section 20]

**As a** engineering team, **I want** a fully automated CI/CD pipeline with a staging environment, **so that** no untested code reaches production and billing features can be validated end-to-end before launch.

**AC:**
- [ ] Three environments: `dev` (local), `staging` (GCP project: `csp-staging`), `production` (GCP project: `csp-prod`)
- [ ] Each environment has its own Firebase project, Stripe account (test mode for staging, live mode for prod), and Secret Manager
- [ ] CI pipeline (GitHub Actions or Cloud Build) runs on every pull request:
  - `npm test` for frontend (all vitest tests must pass)
  - `npm test` for backend server (all test suites must pass)
  - ESLint and security audit (`npm audit --audit-level=high`) must pass
  - Build must succeed for both frontend and backend
- [ ] Merge to `main` branch triggers deployment to staging automatically
- [ ] Deployment to production is a manual promotion step requiring explicit approval from a team member with the `deployer` role
- [ ] Stripe webhook URL is updated automatically in Stripe Dashboard via Stripe CLI in the deployment pipeline for each environment
- [ ] Deployment includes smoke tests: health check passes, `GET /api/subscriptions/current` with a test token returns 200

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy-staging.yml`
- Create: `.github/workflows/deploy-production.yml`

---

**REQ-NEW-03: Load Testing Gate Before Production Launch**

**Section:** [New Section 20 or append to Section 10]

**As a** engineering team, **I want** a documented and executed load test before accepting any real payment traffic, **so that** known performance bottlenecks are discovered and addressed before customers are impacted.

**AC:**
- [ ] Load test script created using k6, Locust, or Artillery targeting the staging environment
- [ ] Test scenarios:
  - Scenario A: 100 concurrent users each calling `POST /api/credits/consume` at 1 request/second for 5 minutes
  - Scenario B: 500 simultaneous webhook events delivered to `POST /webhooks/stripe` over 60 seconds
  - Scenario C: 50 concurrent `POST /api/checkout/create-session` calls
  - Scenario D: 1,000 concurrent `GET /api/credits/balance` calls (simulating billing dashboard load)
- [ ] Pass criteria: p95 response time < 2,000ms for all endpoints; error rate < 0.1%; no 5xx errors during steady-state
- [ ] Load test results documented and signed off by Head of Technology before production deployment is approved
- [ ] Firestore write contention errors (if any) counted and reported as a separate metric

**Files:**
- Create: `tests/load/k6-credit-consume.js`
- Create: `tests/load/k6-webhook-burst.js`
- Create: `tests/load/README.md` (pass/fail criteria and results)

---

**REQ-NEW-04: Firestore Backup and Recovery Procedure**

**Section:** [New Section 20 or append to Section 8]

**As an** engineering team, **I want** automated Firestore backups and a tested recovery procedure, **so that** credit balance data can be restored in the event of accidental deletion, corruption, or a catastrophic incident.

**AC:**
- [ ] Firestore automated daily export enabled to GCS bucket `csp-firestore-backups-{env}` using Cloud Scheduler + Cloud Functions or Firestore Managed Backups (GA as of 2024)
- [ ] Backups retained for 30 days (configurable via IaC)
- [ ] Point-in-time recovery (PITR) enabled on the Firestore database (available in Firestore native mode)
- [ ] Recovery runbook documented in `docs/runbooks/firestore-recovery.md`:
  - How to identify the correct backup timestamp
  - How to import a specific collection from a GCS export into a staging database for validation
  - How to promote a staging restore to production
- [ ] Recovery procedure tested in staging at least once before production launch
- [ ] Backup success/failure monitored via Cloud Monitoring with alert on failure

**Files:**
- Create: `docs/runbooks/firestore-recovery.md`
- Create: `infrastructure/backup-scheduler.tf`

---

**REQ-NEW-05: Stripe-to-Firestore Reconciliation Job**

**Section:** [New section under Section 8 or a new Section 20]

**As an** engineering team, **I want** a scheduled reconciliation job that compares Stripe subscription state with Firestore mirror data, **so that** divergences caused by missed webhooks, partial failures, or bugs are detected and corrected automatically.

**AC:**
- [ ] Create `server/src/jobs/reconcileSubscriptions.js` — runnable on demand and on a scheduled basis (daily)
- [ ] Job iterates all active Stripe subscriptions via `stripe.subscriptions.list({limit: 100})` with pagination
- [ ] For each Stripe subscription, compares: `status`, `current_period_end`, `cancel_at_period_end`, `amount` against the corresponding Firestore `subscriptions/{subId}` document
- [ ] Divergences are logged as structured alerts to Cloud Logging with severity WARNING
- [ ] If `status` in Firestore is `active` but Stripe reports `canceled`, the job updates Firestore and the `users` doc to reflect cancellation (auto-remediation for critical status divergence)
- [ ] Job execution result (subscriptions checked, divergences found, auto-remediated, errors) stored in `reconciliation_log/{runId}` collection
- [ ] Admin can trigger an on-demand run via `POST /api/admin/reconcile` endpoint (admin-only)
- [ ] Job run on Cloud Scheduler at 03:00 UTC daily

**Files:**
- Create: `server/src/jobs/reconcileSubscriptions.js`
- Modify: `server/src/routes/admin.js` (add on-demand trigger endpoint)

---

**REQ-NEW-06: Incident Response Runbook**

**Section:** [New Section 21: Operational Runbooks]

**As an** engineering team, **I want** documented runbooks for the most likely billing system incidents, **so that** on-call engineers can resolve incidents quickly and consistently without tribal knowledge.

**AC:**
- [ ] Create `docs/runbooks/` directory with the following runbooks:
  - `stripe-webhook-backlog.md` — Steps to diagnose webhook processing lag; how to force Stripe to resend missed events; how to manually trigger `reconcileSubscriptions.js`
  - `credit-balance-corruption.md` — How to identify a corrupted `credit_balances` document; how to recompute correct balance from `credit_transactions` ledger; how to safely overwrite with a corrective write
  - `stripe-outage.md` — Acceptable degradation behavior during Stripe API outage; how to enable a maintenance mode flag that pauses new checkout sessions with a user-facing message; how to resume normal operation after outage
  - `stripe-key-rotation.md` — Step-by-step procedure for rotating `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` with zero downtime
  - `payment-failure-spike.md` — How to investigate a spike in failed invoices; Stripe Radar review steps; how to bulk-notify affected users
- [ ] Each runbook includes: trigger conditions, severity level, step-by-step resolution procedure, rollback procedure, post-incident documentation template
- [ ] Runbooks linked from the admin security events dashboard (Section 19.6)

**Files:**
- Create: `docs/runbooks/stripe-webhook-backlog.md`
- Create: `docs/runbooks/credit-balance-corruption.md`
- Create: `docs/runbooks/stripe-outage.md`
- Create: `docs/runbooks/stripe-key-rotation.md`
- Create: `docs/runbooks/payment-failure-spike.md`

---

**REQ-NEW-07: Credit Consume Endpoint Idempotency Key**

**Section:** Amend Section 4.4.3 (`POST /api/credits/consume`) and Section 7.3 (`useCredits` hook)

**As a** developer, **I want** the credit consumption endpoint to accept and deduplicate on an idempotency key, **so that** double-clicks, network retries, and concurrent tab submissions cannot drain more credits than intended.

**AC:**
- [ ] `POST /api/credits/consume` accepts an optional `Idempotency-Key` header (UUID v4)
- [ ] If `Idempotency-Key` is provided, backend stores the key and response in `credit_consume_idempotency/{key}` collection with `expiresAt: now + 60s`
- [ ] If the same key arrives within 60 seconds, the backend returns the cached response without performing a second deduction
- [ ] `useCredits.consumeCredits()` generates a UUID v4 per call and attaches it as the `Idempotency-Key` header
- [ ] `credit_consume_idempotency` collection has a Firestore TTL on the `expiresAt` field
- [ ] Error response on key collision within window: HTTP 200 with original response (not 409)

**Files:**
- Modify: `server/src/routes/credits.js`
- Modify: `server/src/services/creditService.js`
- Modify: `src/hooks/useCredits.js`

---

## Modified Requirements

**[MOD-01]** Section 4.4.1 — `POST /api/checkout/create-pack-session` Error Response

Original text:
> `403: Free tier users cannot purchase packs (must upgrade first)`

Revised text (reflecting Section 17.1 amendment, ensuring consistency throughout the document):
> ~~`403: Free tier users cannot purchase packs (must upgrade first)`~~  
> Removed. Basic (free) tier users are permitted to purchase one-time credit packs. After a Basic user's first pack purchase, set `firstPackPurchasedAt: Timestamp` on the user document and display a post-purchase upsell banner in the billing dashboard. See Section 17.1 for full rationale and schema change.

---

**[MOD-02]** Section 2.11 — Story 2.1: `server/src/index.js` Initialization — Add `.gitignore` and Secrets Requirements

Original text (Story 2.1 AC):
> `- Add npm run dev script using nodemon`
> `- Add npm run start script for production`

Revised text — append to Story 2.1 AC:
> - [ ] Create or verify `server/.gitignore` includes `server/.env`, `server/node_modules/`, and `*.log` — these must never be committed
> - [ ] Create `server/src/config/secrets.js` — wrapper that loads secrets from GCP Secret Manager in `NODE_ENV=production` and from `process.env` in development; all other config files import from this wrapper rather than directly from `process.env`
> - [ ] Server startup validates that all required environment variables/secrets are present and non-empty; throws on missing required secret rather than silently using `undefined`

---

**[MOD-03]** Section 4.6 — Rate Limiting: Specify Distributed Implementation

Original text:
> Uses `express-rate-limit`

Revised text:
> Rate limiting must use a Redis-backed store (`rate-limit-redis` package) so limits are shared across all server replicas. In development (`NODE_ENV=development`), the in-memory store is acceptable. A Redis instance (Cloud Memorystore for Redis, minimum 1GB Basic tier) must be provisioned in staging and production environments. The rate limiter key for authenticated endpoints is the Firebase UID; for unauthenticated endpoints (checkout session creation before auth is confirmed), the key is the client IP address extracted from `X-Forwarded-For` (first IP only, with sanitization). Add `REDIS_URL` to Section 3.11 environment variables.

---

**[MOD-04]** Section 7.10 — Subscription Status Enforcement: Align with Section 17.4 Amendment

Original text (Section 7.10 table):
> `past_due` — Full tier access (grace period: 7 days) — Red banner: "Payment failed. Update payment method."
> `past_due` (>7 days) — Reverted to Basic limits — Red banner + UpgradePrompt

Revised text (incorporating Section 17.4):
> `past_due` — Full tier access (grace period: **14 days** from `firstPaymentFailedAt`, aligned with Stripe Smart Retry schedule) — Red banner: "Payment failed. Update payment method by [firstPaymentFailedAt + 14 days] to maintain access."
> `past_due` (>14 days from `firstPaymentFailedAt`) — Reverted to Basic limits — Red banner + UpgradePrompt

Note: The grace period countdown must use `firstPaymentFailedAt` (Section 18.4 schema addition), not the webhook receipt time, to prevent clock skew between webhook delivery and access enforcement.

---

**[MOD-05]** Section 3.9 — `usage_events` Collection: Add TTL Field Requirement

Original text:
> **Indexing**: Create composite indexes on: `userId + createdAt`, `toolName + createdAt`, `tier + createdAt`, `userId + toolName + createdAt`

Revised text — append after the indexing note:
> **TTL Policy**: Each `usage_events` document must include `_expireAt: Timestamp` set to `createdAt + 90 days` at write time. Enable Firestore TTL on the `_expireAt` field for the `usage_events` collection. This replaces the cron-based deletion approach in Section 7.9 for `usage_events` specifically (cron-based deletion remains for tool-specific data collections tied to `dataRetentionDays`). Analytics requiring data beyond 90 days must query BigQuery (a daily streaming export pipeline from Firestore to BigQuery is required — see REQ-NEW-01).

---

**[MOD-06]** Section 10.4 — Environment Setup Checklist: Add Pre-Launch Gates

Original text (Section 10.4 ends at step 7):
> 7. Run user migration script (Story 1.5)

Revised text — append additional steps:
> 8. Execute staging environment load test (REQ-NEW-03) and document pass/fail results
> 9. Verify Firestore backup is running and a test restore has been completed in staging (REQ-NEW-04)
> 10. Run `reconcileSubscriptions.js` in dry-run mode against staging data and confirm zero divergences
> 11. Verify CI/CD pipeline is active with required approvals for production deployment
> 12. Confirm all 18 items in Section 11.1 Legal Checklist are resolved and signed off — no paid subscriptions accepted until L-01 through L-11 are complete
> 13. Confirm Sentry error tracking and Cloud Monitoring uptime alerts are active on production endpoints

---

**[MOD-07]** Section 3.4 — `credit_balances/{userId}`: Add Sharding Guidance

Original text:
> Single document per user tracking current credit state. Updated by the backend on every credit-consuming action.

Revised text — append after the existing description:
> **Scalability Note**: This single-document-per-user design is acceptable at MVP scale (estimated <500 concurrent users) but will encounter Firestore write throughput limits (~1 write/second per document) for Agency-tier accounts with multiple concurrent team members. Before the Agency tier is opened to more than 100 accounts, the credit balance must be migrated to a counter-shard pattern: split `standardCreditsRemaining` and `aiCreditsRemaining` across N shard documents (`credit_balances/{userId}/shards/{0..N-1}`) with atomic increment on a random shard and aggregate-on-read. N=10 shards is recommended as the MVP target for Agency tier. This migration is a planned post-MVP technical debt item and must be scheduled within 6 months of Agency tier GA launch.

---

## Questions & Concerns

1. **SLA Measurement Mechanism**: Section 2.1 defines support response SLAs (48hr for Client, 24hr for Freelance, 12hr for Agency) but there is no specification for how these SLAs are measured, tracked, or reported. Is there a support ticketing system integration planned? If SLA breaches result in service credits (Section 11.2 item 8), how are breaches detected and credits issued? This needs an owner and a tooling decision before launch.

2. **Who Pays Stripe Fees on Credit Pack Purchases?** Stripe charges 2.9% + $0.30 per transaction for one-time payments. A $15 Starter Pack purchase nets approximately $14.27 after fees ($0.73 lost, ~4.9% of the pack price). At scale, credit pack revenue estimates in Section 8.2 should account for this. Is the margin analysis in Section 2.2.4 inclusive of Stripe processing fees? If not, the "Starter Pack" at $15 may be priced below operational break-even once fees and AI credit costs are accounted for.

3. **Google OAuth New User Flow With Pre-Selected Tier (Section 6.2 Scenario D)**: When a Google OAuth user is new and has `tier=agency` pre-selected, the flow redirects to Stripe Checkout. But the Firebase `createUserWithEmailAndPassword` flow does not apply — Google OAuth creates the user in Firebase Auth in a single step. The `checkoutService.js` needs the Firebase UID to create the Stripe customer, but the UID is only available after Google OAuth completes. The requirements describe this flow (Section 6.2.4, Scenario D) but do not specify how the Stripe checkout session is created in this sequence without a server round-trip that may race with the Firebase user creation. Implementation team should clarify whether there is a timing dependency here.

4. **Nonprofit Verification: Who Is the Manual Reviewer?** Section 8.3 describes an admin review queue for nonprofit verifications, but there is no SLA defined for review turnaround, no escalation path, and no minimum reviewer qualification. An applicant on Basic tier (Section 6.2 Scenario C) has Basic access while waiting for approval — if the review queue is not staffed, they may wait indefinitely. What is the committed review SLA, and is there a process for the queue becoming a bottleneck?

5. **EU Withdrawal Waiver Detection**: Section 19.4 requires geo-detection of EU/UK users to display the EU withdrawal waiver. The requirements specify "billing address or browser locale" for detection, but at registration time (before payment), there is no billing address. Browser locale is unreliable (a US user with a German OS locale would see EU waiver language incorrectly). Should the system use IP geolocation at registration? If so, which IP geolocation provider is planned, and how is VPN bypass handled?

6. **Annual Plan Proration on Upgrade**: Section 13.2 states "Annual subscribers do not receive prorated refunds on downgrade." What about annual plan upgrades mid-year? If an annual Client Side subscriber upgrades to annual Agency in month 6, do they receive a proration credit for the remaining 6 months of their Client Side annual payment? Stripe will calculate a proration credit by default — the requirements should explicitly confirm whether this proration credit is passed through to the customer or suppressed.

7. **`tiers.js` Version Drift Risk — Frontend vs. Backend**: The document acknowledges the duplicate `tiers.js` files but does not resolve the drift risk. During development, developers will modify one copy and forget the other. This has happened in nearly every project that uses this pattern. A broken credit cost on the frontend `tiers.js` would mean the `canAfford` check uses a different credit cost than the backend `creditService.consumeCredits` uses — the frontend might allow an action that the backend rejects (or vice versa), producing confusing UX errors. This needs a concrete solution, not just a note in the review.

8. **Storage Enforcement Tracking**: Section 7.8 specifies that `storageUsedBytes` should be added to the `credit_balances` document. But storage tracking requires computing the total bytes of files uploaded to Firebase Storage per user — this requires either a Cloud Storage trigger (Firebase Function on object write) or a periodic scan. Neither is specified in any batch's user stories. Storage enforcement checking before upload (Section 7.8) cannot work accurately without a reliable `storageUsedBytes` value. How is this maintained?

9. **`security_events` Collection Sizing**: Section 19.6 requires logging multiple security event types to a `security_events` Firestore collection. At 1,000 users with active sessions, authentication events alone could generate hundreds of records per day. Like `usage_events`, this collection needs a TTL policy and a retention limit. Is 90 days appropriate for security event retention, or does compliance require longer retention?

10. **Compliance: EIN Handling and PII Classification**: Section 3.8 stores the Employer Identification Number (`ein`) in the `nonprofit_verifications/{userId}` Firestore document. In the US, EINs are generally considered semi-public (they appear on Form 990 filings) but may be considered PII in certain state regulations and under GDPR if the organization is EU-based. The GDPR Record of Processing Activities (Section 11.3) must explicitly classify `ein` storage and its legal basis. Has this been reviewed by legal counsel?

---

## Approval Status

**Needs Revision**

The document may not proceed to implementation in its current form. The following blocking conditions must be resolved before Batch 2 (Backend API) work begins:

**Blocking for any implementation:**
- **REQ-12-C03**: Secrets management must be specified before any server code is written (`.env` files in production are not acceptable for a system handling Stripe secret keys).
- **REQ-12-C04**: A staging environment and CI/CD pipeline must exist before any billing code is deployed. The current document has no mechanism to prevent deployment to production from a developer's local machine.

**Blocking before Batch 2 is written:**
- **REQ-12-C01**: The `credit_balances` hot document architecture must be acknowledged with a documented scalability ceiling and a planned migration path before the `creditService.js` is implemented.
- **REQ-12-C02**: The `POST /api/credits/consume` idempotency key mechanism (REQ-NEW-07) must be added to the API spec and implemented from day one — retrofitting idempotency into a credit ledger after launch is extremely high risk.

**Blocking before production launch (not before implementation):**
- REQ-12-C05 (Disaster Recovery plan and Firestore backups)
- REQ-12-M07 (Load testing gate)
- REQ-NEW-02 (CI/CD with staging gate)
- REQ-NEW-05 (Reconciliation job)
- All Section 11.1 legal checklist items marked "Blocking: Yes"

Once all Critical findings have approved resolutions documented in the requirements, and the new requirements REQ-NEW-01 through REQ-NEW-07 have been incorporated into the batch plan, this document may be re-submitted for final approval.