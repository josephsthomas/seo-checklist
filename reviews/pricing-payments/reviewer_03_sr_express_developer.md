# Sr. Express Server Developer — Requirements Review
**Reviewer:** Sr. Express Server Developer
**Document:** pricing-payments-requirements.md
**Date:** 2026-02-22
**Status:** Complete

---

## Executive Summary

This requirements document is ambitious, reasonably well-structured, and covers most of the critical surface area for a Stripe-powered subscription system on top of Firebase/Firestore. However, it contains several critical gaps that would cause production data integrity failures if left unaddressed: the credit consumption flow lacks Firestore transaction semantics, the webhook idempotency schema is underspecified, the overage billing mechanism is mentioned but never implemented, and credit rollback on failed AI calls is entirely absent. These must be resolved before implementation begins. Sections 17–19 (Wave 1 additions) improve legal compliance substantially but introduce new API contracts that are incompletely specified from a technical standpoint. With the modifications and new requirements listed below, the document is conditionally approvable.

---

## Sections Reviewed

| Section | Title | Focus Level |
|---------|-------|-------------|
| 3 | Data Models & Firestore Schemas | Deep |
| 4 | Backend API Specifications | Deep |
| 4.4.6 | Webhook Endpoint | Deep |
| 4.6 | Rate Limiting | Detailed |
| 7 | Usage Enforcement & Gating | Detailed |
| 10 | Implementation Notes & Conventions | Detailed |
| 11 | Legal & Compliance Requirements | Reviewed |
| 12 | Transactional Email System | Reviewed |
| 13 | Annual Pricing & Billing Intervals | Reviewed |
| 14 | Free Trial Strategy | Reviewed |
| 17 | Credit System — Amended Policies | Deep |
| 18 | Compliance Data Models | Deep |
| 19 | New API Endpoints — Wave 1 | Deep |
| Appendix A/B | Dependency Graph, File Manifest | Reviewed |

---

## Findings

### Critical (Must fix before implementation)

- **[REQ-03-C01]** Section 4.4.3 / Section 9, Story 2.6 — **Credit Consumption Lacks Firestore Transaction Semantics, Creating a Race Condition That Will Corrupt Balances**

  The document's `consumeCredits` function specification in Story 2.6 states "All operations use Firestore transactions to prevent race conditions," but this is a single bullet in a checklist with no contractual definition of what the transaction boundary must cover. The actual credit deduction flow spans: (1) read `credit_balances/{userId}`, (2) validate sufficient balance, (3) write decremented balance back, (4) write `credit_transactions` ledger record, (5) write `usage_events` record. Without an explicit Firestore transaction wrapping steps 1–3, a user hitting the `/api/credits/consume` endpoint concurrently from two browser tabs (or a retry storm) will read the same pre-deduction balance in both requests and deduct credits twice against the same starting value — resulting in a negative `standardCreditsRemaining` or silent double-deduction. The document must define the exact Firestore transaction scope for `consumeCredits` and specify that the balance validation and balance write are atomic within a `db.runTransaction()` call. The `credit_transactions` record write can safely be outside the transaction (or inside — both are valid, but the choice must be documented). The `usage_events` write should be outside the transaction and fire-and-forget. Additionally, the `credit_balances` document is keyed by `userId` (Section 3.4), which is the correct design for single-document transactions; confirm that no code path performs a collection-group write that would require cross-document transactions (which Firestore does support but with caveats on contention).

  **Recommendation:** Add a formal "Transaction Contract" sub-section to Section 4.4.3 and Story 2.6 explicitly defining: (a) the exact documents inside the transaction boundary, (b) the optimistic-lock / retry policy if the transaction fails due to contention (Firestore retries automatically up to 5 times, but this should be documented so implementers know not to add their own retry loop), and (c) that `credit_balances/{userId}` is the single write lock document. Also specify `FieldValue.increment()` as the preferred decrement method when outside a transaction for non-critical counter updates (e.g., `autoRefillCount`).

- **[REQ-03-C02]** Section 4.4.6 / Story 2.5 — **Webhook Idempotency Schema is Underspecified and the `processed_events` Collection is Never Formally Defined**

  Section 4.4.6 states: "Each webhook handler checks `event.id` against a `processed_events` collection to avoid duplicate processing." However, the `processed_events` collection is never defined in Section 3 (Data Models), has no schema, no Firestore security rules, no composite indexes, no TTL strategy, and no discussion of what happens when the check-then-write itself is non-atomic. The current description implies a read-check pattern: read `processed_events/{event.id}`, if not found, process, then write. This is a classic check-then-act race condition: if two concurrent Stripe retries (Stripe retries on 5xx with exponential backoff, and can deliver an event twice within milliseconds if the first attempt times out) both read "not found" before either writes, both will process the event — resulting in double credit provisioning, double subscription creation, or double invoice recording.

  The correct pattern is a Firestore transaction that atomically creates the `processed_events` document using a conditional write (create-if-not-exists semantics). In Firestore, this is accomplished by wrapping the create in a transaction that reads the document first and only proceeds if it does not exist, or equivalently by setting the document with `{ create: true }` and catching the `ALREADY_EXISTS` gRPC error. Additionally, the collection needs a schema (`id`, `eventType`, `processedAt`, `handlerVersion`) and a TTL policy (Firestore TTL on `processedAt`, recommend 90-day retention for reconciliation).

  **Recommendation:** Add `processed_events/{eventId}` to Section 3 with a full schema and TTL policy. Add a sub-section to Section 4.4.6 titled "Idempotency Implementation" with pseudocode showing the atomic create pattern and the error-handling path when `ALREADY_EXISTS` is caught (return 200 immediately, log "duplicate event skipped"). Also add `processed_events` to the Firestore security rules in Story 1.4: backend write-only, no client read access.

- **[REQ-03-C03]** Section 2.2.3 / Section 4 — **Overage Billing Mechanism is Described but Never Implemented**

  Section 2.2.3 describes an overage model in detail: paid tiers can exceed their monthly allocation at per-credit overage rates ($0.10–$0.50 per credit). The `credit_balances` schema (Section 3.4) tracks `standardOverageUsed` and `aiOverageUsed`. However, nowhere in the entire document is there a specification for how overages actually get charged via Stripe. There is no: (a) Stripe Meter or Usage Record API call, (b) overage invoice line-item creation mechanism, (c) endpoint to close the overage period and finalize charges, (d) Stripe subscription with `billing_scheme: 'tiered'` or metered pricing configuration, and (e) no webhook event listed for when an overage invoice is paid or fails.

  The document mentions "Overage charges" in the admin revenue analytics (Section 8.4) and "overage charges" in the Revenue Breakdown pie chart, implying this revenue is expected to actually flow — but there is no implementation path. Without this, users can consume unlimited credits beyond their allocation with no financial consequence to them and unbounded cost to the operator.

  **Recommendation:** Add a new sub-section 4.4.7 "Overage Billing Mechanism" that specifies one of the following approaches: (A) Stripe Meters (Stripe's recommended approach for usage-based billing — create a Stripe Meter for standard and AI credit overages, call `stripe.billing.meterEvents.create()` for each overage unit consumed, and configure the subscription with a metered price); (B) Stripe Invoice Items — at the end of each billing period, the `invoice.paid` webhook handler reads `standardOverageUsed` and `aiOverageUsed`, calls `stripe.invoiceItems.create()` to add line items to the next invoice, then resets the overage counters; or (C) deferred billing via Stripe's `pending_invoice_items`. Approach B is the simplest to implement without requiring Stripe Meters. Whichever approach is chosen must be fully specified with the exact Stripe API calls, the trigger point, and the error handling for when overage invoicing fails.

- **[REQ-03-C04]** Section 7.2 / Section 9 Story 2.6 — **No Credit Rollback Mechanism When AI Tool Action Fails After Credit Deduction**

  Section 7.2 describes the credit consumption flow: "Call backend POST /api/credits/consume → Backend validates server-side balance → IF confirmed: Execute action." However, the document contains no specification for what happens when credits are successfully deducted but the subsequent AI API call fails. The sequence is: (1) `POST /api/credits/consume` succeeds — credits are deducted, `credit_transactions` ledger is written, (2) frontend proceeds to execute AI action (LLM call, image analysis, etc.), (3) AI provider returns an error (timeout, rate limit, 500 from the AI API). At this point, the user has been charged credits but received no value. The document acknowledges "race conditions" in the `useCredits` hook comment (Section 7.3, line `// Handle insufficient credits (race condition — credits consumed between check and action)`), but only addresses the balance-mismatch race, not the deduct-then-fail scenario.

  This is a significant product integrity issue. Users on free or budget tiers who lose credits to failed AI calls will churn. The fix requires a credit reservation and confirmation/rollback pattern, or a "refund" endpoint that can be called on AI failure.

  **Recommendation:** Add a `POST /api/credits/refund` endpoint to Section 4.4.3 that accepts `{ transactionId: string, reason: string }` and reverses a specific debit transaction by creating a compensating credit transaction. Document the frontend pattern: on AI call failure, call `/api/credits/refund` with the `transactionId` returned from `/api/credits/consume`. The `credit_transactions` record for the refund should reference the original `transactionId` as `relatedTransactionId` and use `type: 'refund'`. Rate-limit this endpoint to prevent abuse (users gaming refunds). Alternatively, specify a "reserve-then-confirm" two-phase commit pattern where credits are placed in a `reserved` state until the AI action completes.

- **[REQ-03-C05]** Section 3 / Section 4.4.6 — **`checkout.session.completed` and `payment_intent.succeeded` Both Fire for Credit Pack Purchases — Double-Fulfillment Risk**

  Section 4.4.6 lists both `checkout.session.completed` (handler: "Create/update subscription in Firestore, provision credits, update user tier") and `payment_intent.succeeded` (handler: "Handle credit pack purchases (one-time)") as handled events. For a one-time credit pack purchase via Stripe Checkout, Stripe fires both `checkout.session.completed` AND `payment_intent.succeeded` for the same transaction. If the implementation naively handles both events with credit-granting logic, credits will be provisioned twice.

  The correct pattern is to handle credit pack fulfillment exclusively in `checkout.session.completed` (using `session.mode === 'payment'` to distinguish from subscription checkouts), and use `payment_intent.succeeded` only for payment intents created outside of Checkout (e.g., direct Stripe.js integration, which this document explicitly avoids). The `payment_intent.succeeded` handler for pack purchases should be removed or made a no-op if the payment intent is already associated with a completed Checkout session.

  **Recommendation:** Update the webhook event table in Section 4.4.6 to explicitly document the routing logic: `checkout.session.completed` with `session.mode === 'subscription'` routes to subscription provisioning; `checkout.session.completed` with `session.mode === 'payment'` routes to credit pack fulfillment. Remove `payment_intent.succeeded` from the credit pack handler or add an explicit guard: "Skip if `payment_intent.invoice` is set (subscription) or if `payment_intent` is linked to a completed Checkout session." Add this guard to the idempotency check to prevent double-processing.

---

### Major (Should fix before implementation)

- **[REQ-03-M01]** Section 3 — **Missing Composite Indexes for Credit and Subscription Query Patterns**

  Section 3.9 correctly identifies four composite indexes for `usage_events`. However, the other billing collections have query patterns that require composite indexes that are not specified:

  - `credit_transactions/{transId}`: The `/api/credits/history` endpoint (Section 4.4.3) queries by `userId` + optional `creditType` + date range + pagination (ordered by `createdAt`). This requires a composite index on `(userId, creditType, createdAt DESC)` and `(userId, createdAt DESC)`.
  - `subscriptions/{subscriptionId}`: The admin list endpoint (Section 8.6) filters by `tier`, `status`, and `sortBy`. This requires composite indexes on `(tier, status, createdAt DESC)`, `(status, createdAt DESC)`, and `(tier, createdAt DESC)`.
  - `invoices/{invoiceId}`: The `/api/billing/invoices` endpoint filters by `userId` + `status`. Requires `(userId, status, createdAt DESC)` and `(userId, createdAt DESC)`.
  - `credit_packs/{packId}`: The expiration cron job (Section 17.2) queries for `expiresAt < now AND standardCreditsRemaining > 0`. Requires `(expiresAt, standardCreditsRemaining)` — though Firestore does not support inequality filters on two different fields; this query will need to be restructured as `expiresAt < now` with a client-side filter on remaining credits, which requires an index on `expiresAt ASC`.
  - `nonprofit_verifications/{userId}`: The admin pending queue (Section 8.3) queries for `status == 'pending'` ordered by `createdAt`. Requires `(status, createdAt ASC)`.

  Missing indexes will cause Firestore queries to fail in production with "query requires an index" errors that cannot be resolved without deployment of a `firestore.indexes.json` configuration.

  **Recommendation:** Add a sub-section 3.12 "Firestore Composite Index Definitions" with a `firestore.indexes.json` specification covering all billing collections. Include all query patterns identified above.

- **[REQ-03-M02]** Section 4.3 / Story 2.2 — **Authentication Middleware Fetches Firestore User Profile on Every Request — Performance and Availability Risk**

  Story 2.2 specifies that the auth middleware "Fetches user profile from Firestore and attaches `req.userProfile = { tier, role, ... }`" on every authenticated request. This means every API call makes a Firestore read before the actual handler runs. At scale, this creates: (a) a latency floor of ~20–80ms per request for the Firestore read, (b) a single point of failure — if Firestore is degraded, all API endpoints become unavailable even for operations that don't need the user profile, and (c) unnecessary read costs.

  Firebase ID tokens are JWTs and contain custom claims that can be set by the Firebase Admin SDK. The correct pattern is to store `tier` and `role` as Firebase custom claims (set on subscription creation and tier change via `admin.auth().setCustomUserClaims(uid, { tier, role })`), making them available in the decoded token without a Firestore round-trip. The Firestore profile fetch should be done only when the middleware actually needs a field that isn't in the custom claims (e.g., full user profile for admin operations).

  **Recommendation:** Add a sub-section to Section 4.3 specifying that `tier` and `role` are stored as Firebase custom claims. Define a `POST /api/internal/sync-claims` endpoint (or a service function called on subscription changes) that keeps custom claims in sync with Firestore. Update Story 2.2 to use `decodedToken.tier` and `decodedToken.role` from the verified JWT payload, with a Firestore fallback only when claims are absent (e.g., for users created before claim-sync was implemented). Custom claims are propagated to ID tokens on next token refresh (max 1 hour), so document the claim propagation delay and its implications for tier upgrades.

- **[REQ-03-M03]** Section 4.4.6 — **Webhook Signature Verification Ordering Risk and Missing Raw Body Configuration**

  Section 4.4.6 states the webhook endpoint uses "raw body for signature verification" and Story 2.11 correctly notes "Webhook route registered BEFORE `express.json()` middleware (needs raw body)." However, the document does not specify the exact raw body capture mechanism. The standard pattern in Express is to use `express.raw({ type: 'application/json' })` applied only to the webhook route, or to use a global `verify` callback on `express.json()`. If a developer mistakenly applies `express.json()` globally before the webhook route registration (a common mistake), Stripe signature verification will silently fail because the body is already parsed and the raw buffer is lost. The `stripe.webhooks.constructEvent()` call requires the raw buffer, not the parsed JSON.

  Additionally, the document does not specify what to return when signature verification fails. Returning a 400 is correct, but the document should specify that the failure must be logged as a security event (per Section 19.6, which does mention this in Story 19.1, but the connection to webhook handling is not explicit).

  **Recommendation:** Add a code-level specification to Section 4.4.6 showing the exact Express route registration pattern:
  ```
  // MUST be before express.json()
  app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), webhookRouter);
  // Then:
  app.use(express.json());
  ```
  Specify that signature verification failure returns HTTP 400 and logs to `security_events`. Add a test case to `webhooks.test.js` that verifies a tampered payload returns 400.

- **[REQ-03-M04]** Section 4.4.1 / Section 13 — **`create-session` Endpoint Missing Idempotency Key — Duplicate Checkout Sessions on Network Retry**

  The `POST /api/checkout/create-session` endpoint has no idempotency mechanism. If the frontend retries the request after a network timeout (common in mobile/flaky connections), multiple Stripe Checkout sessions will be created for the same user. While Stripe Checkout sessions expire after 24 hours, a user clicking "Confirm & Pay" twice due to a slow response can end up with two active sessions, potentially completing two payments. The Stripe API natively supports idempotency keys via the `Idempotency-Key` header on the `stripe.checkout.sessions.create()` call.

  The frontend `api.js` client (Story 4.2) should generate a deterministic idempotency key per checkout attempt (e.g., `sha256(userId + tier + timestamp_rounded_to_minute)`) and pass it to the backend, which forwards it to Stripe. The backend should cache the idempotency key + response for 24 hours (can use a simple Firestore document or an in-memory store for single-instance deployments).

  **Recommendation:** Add an `idempotencyKey` field to the `POST /api/checkout/create-session` and `POST /api/checkout/create-pack-session` request bodies. Document the key generation algorithm. Specify that the backend passes the key as the Stripe API `idempotencyKey` option. Add a note in Section 10.6 (Security Considerations) about idempotency key scope and expiry.

- **[REQ-03-M05]** Section 9 Story 2.6 / Section 7.2 — **Auto-Refill Trigger Has a Race Condition That Can Exceed the 3-Pack Monthly Cap**

  Section 3.4 defines `autoRefillCount: number` (max 3 per month) and Section 7.3 / Story 2.6 references `handleAutoRefill(userId)`. However, the auto-refill trigger is a check-then-act pattern without a lock: (1) check `autoRefillCount < 3`, (2) if true, trigger pack purchase, (3) increment count. If `consumeCredits` is called concurrently by multiple requests that all bring the balance to zero simultaneously (e.g., a bulk operation that fires multiple credit consume calls), multiple auto-refill triggers can fire before any of them increments `autoRefillCount`. This will charge the user more than 3 times in a month, which violates both the disclosed cap and FTC Negative Option Rule compliance (Section 17.3).

  The auto-refill increment must be inside the same Firestore transaction that validates `autoRefillCount < 3` and triggers the refill. Because auto-refill involves a Stripe API call (which cannot be inside a Firestore transaction), the correct pattern is a two-step process: (1) transaction atomically increments `autoRefillCount` and sets `autoRefillPending: true` (fail if already at 3); (2) outside the transaction, make the Stripe API call; (3) on Stripe success, finalize the pack credit grant; (4) on Stripe failure, decrement `autoRefillCount` in a compensating transaction.

  **Recommendation:** Add an "Auto-Refill Atomicity" note to Section 2.2.3 and Story 2.6. Specify the two-phase pattern above. Add `autoRefillPending: boolean` to the `credit_balances` schema (Section 3.4) as a mutex flag to prevent concurrent refill triggers.

- **[REQ-03-M06]** Section 4.6 — **Rate Limiting Strategy is Incomplete and Insufficient for Credit Consumption Endpoint**

  Section 4.6 specifies 60 requests per minute per user on the credit consumption endpoint. This limit is too permissive and keying is underspecified:

  1. **Key strategy not defined**: The document mentions "Keyed by user UID (authenticated)" in Story 2.3, but `express-rate-limit` by default keys on IP address. For a SaaS with authenticated users, requests from corporate NAT will share an IP. The implementation must explicitly set `keyGenerator: (req) => req.user.uid` for authenticated endpoints.

  2. **60/min is too high for credit consumption**: A user could burn through 50 standard credits (their entire free-tier monthly allocation) in under a minute by hitting the consume endpoint programmatically at 60 req/min. For credit consumption specifically, the limit should be action-type-aware (e.g., 10/min for AI credit actions, 30/min for standard credit actions) or capped at a lower global limit (e.g., 20/min).

  3. **No global rate limit**: There is a 1000/min global webhook limit but no global IP-based rate limit on the API surface, leaving it vulnerable to unauthenticated endpoint probing before Firebase token verification.

  4. **No rate limit on `GET /api/privacy/data-export`**: Data export requests are expensive (reading across multiple collections) and should be limited to 1 or 2 per day per user.

  **Recommendation:** Update Section 4.6 with: explicit `keyGenerator` specification; reduced credit consumption limit (20/min); a global IP-based rate limiter (200/min per IP across all routes, applied before auth middleware); and a `GET /api/privacy/data-export` limit of 2/day per user.

- **[REQ-03-M07]** Section 4 — **Missing API Versioning Strategy — Breaking Changes Will Have No Migration Path**

  The document defines API routes as `/api/credits/consume`, `/api/subscriptions/upgrade`, etc. with no version prefix. There is no discussion of API versioning strategy anywhere in the document. This is a production SaaS API consumed by a React SPA. When the API evolves (adding required fields, changing response shapes, deprecating endpoints), there is no mechanism to: (a) deploy new API version without breaking existing SPA builds cached in CDN/browser, (b) run A/B testing on API changes, or (c) support the mobile clients alluded to in Section 2.1 (API access listed as an Agency feature).

  **Recommendation:** Add a Section 4.7 "API Versioning Strategy" specifying version prefix in URL path (`/api/v1/credits/consume`). Define the deprecation policy: minimum 90-day deprecation notice, old version supported for 6 months after new version ships. The `src/lib/api.js` client (Story 4.2) should include the version in its base URL configuration. The health endpoint should return the current API version in the response body.

- **[REQ-03-M08]** Section 19.3 — **OFAC Screening Architecture is Underspecified and Exposes Blocking Risk at Checkout**

  Section 19.3 defines `POST /api/compliance/screen` as an "internal endpoint called by other endpoints" and specifies it must run at user registration, nonprofit submission, and checkout session creation. However, it provides no specification for: (a) which OFAC SDN list provider to integrate (commercial providers like LexisNexis, ComplyAdvantage, or the free OFAC CSV download — the choice has major performance and accuracy implications), (b) what the synchronous latency budget is (OFAC checks can take 100–800ms for external providers), (c) whether the check is synchronous (blocking the checkout flow) or asynchronous (allowing checkout then flagging for review), and (d) what "possible_match" means operationally — does it block the user, flag for manual review, or pass through?

  A synchronous OFAC check at checkout session creation adds 100–800ms latency to every paid subscription creation. If the external provider is down, it will block all subscriptions. The document says "Blocked registrations/sessions return HTTP 403 with non-descriptive error" but does not specify behavior when the screening provider is unavailable.

  **Recommendation:** Add a sub-section to Section 19.3 specifying: (a) chosen provider and integration method, (b) latency SLA and timeout (recommend 500ms timeout with fail-open behavior — flag as `possible_match` on timeout, do not block), (c) that `match` results block synchronously, `possible_match` results allow through but flag for manual admin review within 24 hours, (d) the admin review workflow for `possible_match` cases (add to Section 8 admin features), and (e) circuit breaker behavior when the screening provider is unavailable (fail-open with logging to `security_events`).

---

### Minor (Fix during implementation)

- **[REQ-03-m01]** Section 3.5 — **`credit_transactions` Schema Missing `stripeEventId` Field for Webhook-Originated Transactions**

  The `credit_transactions` schema (Section 3.5) has `packId` and `relatedResourceId` but no way to link a transaction to the Stripe webhook event that caused it (e.g., the `invoice.paid` event that triggered a monthly credit reset). Without this, support cannot answer "was this credit reset triggered by invoice `in_xxx`?" during reconciliation disputes. Add `stripeEventId: string | null` to the schema.

- **[REQ-03-m02]** Section 3.3 — **`subscriptions` Schema Missing `interval` Field in Stored Document Despite Supporting Annual Plans**

  Section 3.3 defines `interval: string` as `'month'` in the `subscriptions` schema, with a comment implying it is always monthly. Section 13 introduces annual plans. The schema will need `interval: 'month' | 'year'` and `annualBillingEquivalent: number | null` (the per-month display price for annual subscribers). The schema comment "interval: 'month'" will create confusion for implementers.

- **[REQ-03-m03]** Section 4.4.2 — **`POST /api/subscriptions/upgrade` Missing 402 Status Code for Proration Charge Failure**

  The upgrade endpoint's error codes list `400`, `401`, and `404` but not `402`. If Stripe attempts to charge the prorated upgrade amount immediately and the card is declined, the upgrade should fail with a `402 Payment Required` response including the Stripe error code and a link to the customer portal to update payment method. This is a common flow that is entirely missing from the error spec.

- **[REQ-03-m04]** Section 3.8 — **`nonprofit_verifications` Schema Missing Wave 1 Extended Fields Despite Modification Index Reference**

  The Wave 1 Modification Index (Section at end of document) references an extended `nonprofit_verifications` schema adding: `countryCode`, `nonprofitRegistrationType`, `documentRetainUntil`, `applicantAttestedAt`, `iersVerificationResult`, `reVerificationReminderSentAt`. However, Section 3.8 still shows the original schema without these fields. The schema in Section 3.8 must be updated to reflect the Wave 1 additions. This will cause implementers to build to the old schema unless the modification index is treated as a patch — which it currently is not, since it is in an appendix with no explicit instruction to update Section 3.8.

- **[REQ-03-m05]** Section 7.8 — **Storage Enforcement References `storageUsedBytes` on `credit_balances` But Field is Not in Schema**

  Section 7.8 states: "Storage usage tracked in `credit_balances` document (add `storageUsedBytes` field)." The `credit_balances` schema in Section 3.4 does not include `storageUsedBytes`. This field is necessary for the storage enforcement check described in Section 7.8. The schema should be updated to include `storageUsedBytes: number` (bytes consumed across Firebase Storage for the user), along with the logic for how it is incremented on upload and decremented on file deletion.

- **[REQ-03-m06]** Section 12.3 / Story 2.12 — **Email Service Specifies "Fire-and-Forget" Without Dead Letter or Retry Mechanism**

  Story 2.12 specifies: "Email sending failures are logged but do not cause API request failures (fire-and-forget pattern with error logging)." This is acceptable for opt-in notification emails, but the document simultaneously states that "Cancellation confirmation email required within 5 minutes (FTC mandate)" and "Auto-refill charge notification is not opt-out (legal requirement)." A fire-and-forget pattern with no retry means a transient email provider outage will silently miss legally required emails. The implementation needs at minimum: (a) a retry queue for compliance-critical emails (cancellation confirmation, auto-refill charge notification), (b) a dead-letter log in Firestore for failed emails, and (c) an admin alert when compliance-critical emails fail after retries.

---

### Suggestions (Consider for future)

- **[REQ-03-S01]** Section 7.9 — **Data Retention Cron Job Specification is Underspecified — Consider Cloud Scheduler + Cloud Functions**

  Section 7.9 mentions "a scheduled backend job (cron or Cloud Scheduler) runs daily" but provides no specification of the job implementation, error handling, or observability. Given the Firebase/Firestore backend, Cloud Scheduler + Cloud Functions (or Cloud Run jobs) is the natural choice. The job specification should document: trigger schedule (cron expression), expected runtime per batch, maximum batch size, error handling (log to `usage_events` or a dedicated `cron_run_log` collection), and alerting on job failure. Also consider whether the data retention job should run on-demand as an admin endpoint as well, for manual cleanup operations.

- **[REQ-03-S02]** Section 4.4.3 — **Consider `POST /api/credits/reserve` + `POST /api/credits/confirm` Two-Phase Pattern for Long-Running AI Operations**

  For AI actions that take several seconds (batch meta generation, competitor analysis, bulk alt text), the current pattern of deducting credits before the action begins means users are charged even for timeouts. A reservation pattern — reserve credits, execute action, confirm or rollback — provides better UX and is more defensible as product fairness. This is an architectural upgrade that should be considered for v1.1 but designed into the data model now by adding a `credit_reservations` collection (reservationId, userId, amount, action, reservedAt, expiresAt, status: 'reserved' | 'confirmed' | 'rolled_back').

- **[REQ-03-S03]** Section 8.7 / Section 19.6 — **Credit Abuse Detection Should Use Sliding Window, Not Snapshot Threshold**

  Section 8.7 defines a credit abuse alert: "Single user consuming >80% of tier credits in <7 days." Section 19.6 adds "Bulk credit consumption anomalies (>80% of tier allocation in <24 hours)" as a security event. Both are correct thresholds, but a snapshot check (run at alert time) will miss users who consume 79% per day for 7 days, totaling 5.5x their monthly allocation. Consider tracking a 7-day rolling sum of `creditsConsumed` in `credit_balances` (using a `last7DaysCreditsConsumed` counter updated on each `consumeCredits` call) and alerting when this rolling sum exceeds 90% of monthly allocation. Also consider rate limits on the `consumeCredits` endpoint that are lower for higher-cost AI actions.

- **[REQ-03-S04]** Section 4 — **CORS Configuration is Too Simple for Production Multi-Origin SaaS**

  Section 3.11 defines `CORS_ORIGINS=http://localhost:5173` as a single string. In production, the SaaS will have at minimum: the production SPA domain, potentially a staging domain, and potentially a `www` vs apex domain variant. The CORS configuration should support a comma-separated list of origins (already common in Express CORS setups) and validate against an allowlist at runtime. Additionally, the document mentions Stripe Customer Portal redirects, which are not cross-origin CORS requests but may interact with redirect behavior in SPA routing that should be tested. The production CORS configuration should also specify which HTTP methods and headers are allowed (`Authorization`, `Content-Type`, `Stripe-Signature`) and whether credentials are allowed.

---

## New Requirements

The following requirements are missing from the document and must be added before implementation.

---

### NR-01: Background Job Specifications

**Section**: New Section 4.8 — Background Jobs and Scheduled Tasks
**Priority**: Must-have before implementation

The document references several background jobs across multiple sections without a consolidated specification. The following jobs must be formally defined:

| Job | Trigger | Specification Required |
|-----|---------|----------------------|
| Monthly credit reset | `invoice.paid` webhook | Already partially covered in webhook handler; needs an explicit "what if webhook is missed?" compensating job |
| Data retention cleanup | Daily cron | Section 7.9 — needs full spec |
| Credit pack expiration | Daily cron | Section 17.2 — needs full spec |
| Auto-refill trigger | Per `consumeCredits` call | Section 2.2.3 — triggered inline, not a cron, but needs its own service specification |
| Nonprofit expiration check | Daily cron | Section 12.2 (email) references 30-day expiry warning — needs cron spec |
| Trial expiration handling | Daily cron | Section 14.2 — "3 days before trial end" email implies a scheduled check |
| `pending_price_change` enforcement | Cron at effective date | Section 18.4 defines `pendingPriceChange` but no job to apply it |

Each job specification must include: trigger mechanism (Stripe webhook, Cloud Scheduler, inline), schedule (cron expression or event), failure handling and retry policy, observability (structured log output, alert conditions), and idempotency guarantees (safe to run multiple times if the scheduler fires twice).

---

### NR-02: Firestore Transaction Contract for Credit Deduction

**Section**: New Section 4.9 — Data Consistency Contracts
**Priority**: Critical — must be defined before Story 2.6 is implemented

```
The following Firestore transaction contract must be honored by creditService.consumeCredits():

ATOMIC UNIT (db.runTransaction()):
  READ:  credit_balances/{userId}
  VALIDATE: standardCreditsRemaining + bonusStandardCredits >= amount (or aiCreditsRemaining + bonusAiCredits >= amount)
  IF insufficient: throw InsufficientCreditsError (transaction rolls back automatically)
  WRITE: credit_balances/{userId} (decrement appropriate balance field, increment overageUsed if applicable)
  WRITE: credit_transactions/{newId} (immutable debit record with balanceAfter = decremented value)

OUTSIDE TRANSACTION (fire-and-forget):
  WRITE: usage_events/{newId} (analytics record — eventual consistency acceptable)
  UPDATE: users/{userId}.creditsRemaining / aiCreditsRemaining (denormalized fast-read field)

ROLLBACK SCENARIO:
  If AI action fails after transaction commits:
    POST /api/credits/refund with transactionId from debit record
    creditService.refundTransaction(transactionId) creates compensating CREDIT transaction
    creditService.refundTransaction() is NOT inside a Firestore transaction (idempotent by transactionId unique constraint)
```

---

### NR-03: `processed_webhook_events` Collection Schema

**Section**: Add to Section 3 — Data Models
**Priority**: Critical — blocks webhook implementation

```javascript
// Collection: processed_webhook_events/{stripeEventId}
// Purpose: Idempotency store for Stripe webhook events
{
  id: string,                      // Stripe event ID (e.g., 'evt_xxx')
  eventType: string,               // e.g., 'checkout.session.completed'
  handlerVersion: string,          // Semver of handler code that processed this event
  processedAt: Timestamp,          // When processing completed successfully
  processingDurationMs: number,    // For latency observability
  userId: string | null,           // Associated user (if determinable)
  outcome: string,                 // 'success' | 'skipped' (already processed) | 'ignored' (unhandled type)
  createdAt: Timestamp,            // TTL field — Firestore TTL policy: delete after 90 days
}

// Firestore Security Rules:
// - No client read or write access
// - Backend (Admin SDK) write-only
// - TTL: configure Firestore TTL on 'createdAt' field, 90-day expiry

// Idempotency pattern:
// db.runTransaction(async (txn) => {
//   const ref = db.collection('processed_webhook_events').doc(event.id);
//   const doc = await txn.get(ref);
//   if (doc.exists) throw new AlreadyProcessedError();
//   txn.create(ref, { id: event.id, ... }); // atomic create
// })
// Catch AlreadyProcessedError → return res.status(200).json({ received: true, status: 'already_processed' })
```

---

### NR-04: Credit Refund Endpoint

**Section**: Add to Section 4.4.3 — Credit Endpoints
**Priority**: Critical — required for rollback on AI failure

```
POST /api/credits/refund

Purpose: Reverses a specific credit debit transaction when the associated tool action fails.
Called by the frontend after a confirmed AI API failure.

Request:
{
  transactionId: string,    // The credit_transactions document ID returned by /api/credits/consume
  reason: string            // 'ai_call_failed' | 'tool_error' | 'timeout'
}

Authorization: Bearer <firebase-id-token>
Rate Limit: 5 per minute per user (prevent gaming)
Idempotency: If transactionId already has a corresponding refund transaction, return 200 with existing refund record (no double-refund)

Response (200):
{
  success: true,
  refundTransactionId: string,
  creditsRestored: number,
  newBalance: number
}

Errors:
- 400: transactionId not found or does not belong to authenticated user
- 400: Transaction is older than 15 minutes (refund window expired — prevents retroactive gaming)
- 409: Refund already issued for this transactionId

Implementation notes:
- Validate that credit_transactions/{transactionId}.userId === req.user.uid
- Validate transactionId.createdAt > now - 15 minutes
- Create compensating credit_transactions record with type: 'refund', relatedTransactionId: transactionId
- Update credit_balances/{userId} to restore credits (inside Firestore transaction)
- Do NOT create a usage_events record for refunds (to avoid double-counting in analytics)
```

---

### NR-05: Overage Billing Mechanism Specification

**Section**: New Section 4.4.7 — Overage Billing
**Priority**: Critical — without this, overages are tracked but never charged

```
Overage billing uses Stripe Invoice Items (pending invoice items approach):

TRIGGER: invoice.paid webhook for subscription renewal invoice
BEFORE resetting credit counters, read:
  credit_balances/{userId}.standardOverageUsed
  credit_balances/{userId}.aiOverageUsed

IF standardOverageUsed > 0 OR aiOverageUsed > 0:
  Call stripe.invoiceItems.create() for each overage type:
    {
      customer: stripeCustomerId,
      subscription: subscriptionId,
      amount: standardOverageUsed * TIER_CONFIGS[tier].overageRates.standard * 100,  // cents
      currency: 'usd',
      description: `Standard credit overage: ${standardOverageUsed} credits @ $${rate}/credit`
    }
  These items attach to the NEXT subscription invoice automatically.

THEN: Reset standardOverageUsed and aiOverageUsed to 0 in credit_balances.

New webhook to handle (add to Section 4.4.6 webhook table):
  invoice.created → Check if invoice has overage line items; log for reconciliation.

Stripe configuration note:
  Overage Invoice Items created via stripe.invoiceItems.create() automatically attach
  to the next open invoice for the customer's subscription. No additional Stripe
  configuration is required beyond the existing subscription setup.

Error handling:
  If stripe.invoiceItems.create() fails, do NOT proceed with credit reset.
  Log error, alert admin, retry via exponential backoff (3 retries).
  After 3 failures: reset credits (prevent access disruption), log to security_events,
  create a manual billing action record for admin resolution.
```

---

### NR-06: API Versioning Strategy

**Section**: New Section 4.7 — API Versioning
**Priority**: Should-have before production launch

All API routes must be prefixed with `/api/v1/`. The frontend `src/lib/api.js` must configure `VITE_API_URL` + `/v1` as the base path. When breaking changes are introduced, `/api/v2/` routes are introduced alongside v1 (no removal until v1 deprecation window closes). Deprecation policy: v1 supported for 6 months after v2 ships; deprecated endpoints return `Deprecation: true` and `Sunset: <date>` response headers. The `GET /api/v1/health` endpoint must return `{ version: '1', status: 'ok', deprecatedAt: null }`.

---

### NR-07: Composite Index Definitions

**Section**: New Section 3.12 — Firestore Composite Index Definitions
**Priority**: Must-have before Batch 2 implementation

Add a `firestore.indexes.json` specification to the repository with the following composite indexes (in addition to those listed in Section 3.9 for `usage_events`):

```json
{
  "indexes": [
    { "collectionGroup": "credit_transactions",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "creditType", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    { "collectionGroup": "credit_transactions",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    { "collectionGroup": "subscriptions",
      "fields": [
        { "fieldPath": "tier", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    { "collectionGroup": "invoices",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    { "collectionGroup": "nonprofit_verifications",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "ASCENDING" }
      ]
    },
    { "collectionGroup": "credit_packs",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "expiresAt", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## Modified Requirements

### MOD-01: Section 4.4.3 — `POST /api/credits/consume` Response Contract

**Rationale**: The current response on success does not return the `transactionId` needed for the rollback endpoint (NR-04). Without `transactionId` in the response, the frontend cannot call `/api/credits/refund` after an AI call failure.

**Original text**:
```
Response (200):
{
  success: true,
  creditsRemaining: number,
  source: 'monthly' | 'bonus' | 'overage'
}
```

**Revised text**:
```
Response (200):
{
  success: true,
  transactionId: string,        // ADD: credit_transactions document ID — required for refund
  creditsRemaining: number,
  aiCreditsRemaining: number,   // ADD: always return both balances for frontend sync
  source: 'monthly' | 'bonus' | 'overage',
  autoRefillTriggered: boolean  // ADD: true if auto-refill was triggered by this consume
}
```

---

### MOD-02: Section 3.4 — `credit_balances` Schema Addition

**Rationale**: The schema is missing `storageUsedBytes` (referenced in Section 7.8), `autoRefillPending` (required for the auto-refill atomicity fix in REQ-03-M05), and `last7DaysCreditsConsumed` (suggested by REQ-03-S03 for abuse detection).

**Original text** (excerpt):
```javascript
{
  // ...
  autoRefillEnabled: boolean,
  autoRefillPackType: string | null,
  autoRefillCount: number,
  // ...
  updatedAt: Timestamp
}
```

**Revised text** (add to the schema before `updatedAt`):
```javascript
{
  // ...
  autoRefillEnabled: boolean,
  autoRefillPackType: string | null,
  autoRefillCount: number,
  autoRefillPending: boolean,          // ADD: mutex to prevent concurrent refill triggers

  // Storage enforcement (Section 7.8)
  storageUsedBytes: number,            // ADD: current storage consumption in bytes

  // Abuse detection (Section 8.7, REQ-03-S03)
  last7DaysStandardCreditsConsumed: number,  // ADD: rolling 7-day sum, updated on each consume
  last7DaysAiCreditsConsumed: number,         // ADD: rolling 7-day sum

  updatedAt: Timestamp
}
```

---

### MOD-03: Section 4.4.6 — Webhook Event Table: Remove `payment_intent.succeeded` for Credit Pack Fulfillment

**Rationale**: As identified in REQ-03-C05, handling credit pack fulfillment in `payment_intent.succeeded` creates a double-fulfillment risk with `checkout.session.completed` for the same Stripe Checkout transaction.

**Original text** (webhook table row):
```
| payment_intent.succeeded | Handle credit pack purchases (one-time) |
```

**Revised text**:
```
| checkout.session.completed (mode='payment') | Handle credit pack fulfillment:
  add bonus credits, create credit_pack document, update credit_balances.
  Routed by session.mode: 'subscription' → subscription provisioning,
  'payment' → credit pack fulfillment.

| payment_intent.succeeded | [REMOVED from pack fulfillment — handled by
  checkout.session.completed. Retain only as a fallback event handler for
  direct PaymentIntent integrations; no-op if payment_intent.invoice is set
  or if payment_intent has a linked Checkout session.] |
```

---

### MOD-04: Section 2.2.3 — Auto-Refill Cap Enforcement

**Rationale**: The document states "Capped at 3 auto-purchases per month to prevent runaway costs" but provides no specification for how the cap resets monthly. The `autoRefillCount` field currently has no reset mechanism documented.

**Original text**:
> Automatically purchase a Starter Pack when balance hits 0. Capped at 3 auto-purchases per month to prevent runaway costs.

**Revised text**:
> Automatically purchase a Starter Pack when balance hits 0. Capped at 3 auto-purchases per **calendar month** to prevent runaway costs. The `autoRefillCount` resets to 0 on the first day of each calendar month (not on billing period reset) via a dedicated monthly cron job (`server/src/jobs/resetAutoRefillCounts.js`, runs on the 1st of each month at 00:05 UTC). This is separate from the billing period reset because a user's billing date may not align with the calendar month. The `credit_balances` document must store `autoRefillCountResetAt: Timestamp` to track when the count was last reset, allowing the cron job to be idempotent.

---

### MOD-05: Section 4.3 — Authentication Middleware: Firebase Custom Claims

**Rationale**: As identified in REQ-03-M02, the current middleware design fetches Firestore on every request, adding latency and coupling availability.

**Original text**:
```
// middleware/auth.js
// Verifies Firebase ID token
// Attaches req.user = { uid, email, tier, ... }
// Returns 401 if token invalid/expired
// Returns 403 if user account disabled
```

**Revised text**:
```
// middleware/auth.js
// 1. Extract and verify Firebase ID token via admin.auth().verifyIdToken(token)
// 2. Read tier and role from custom claims in decoded token:
//    req.user = { uid, email, tier: decodedToken.tier, role: decodedToken.role }
// 3. If decodedToken.tier is undefined (pre-claims-sync user):
//    Fall back to Firestore read of users/{uid}.tier and users/{uid}.role
//    Then call admin.auth().setCustomUserClaims(uid, { tier, role }) to backfill
// 4. Returns 401 if token invalid/expired
// 5. Returns 403 if user account is disabled (decodedToken.disabled)
//
// Custom claims are set by subscriptionService on every tier change.
// Claims propagate to the client token within 1 hour (on next token refresh).
// The frontend must call user.getIdToken(true) after a successful upgrade
// to force token refresh and pick up the new tier claim immediately.
//
// Note: The 'role' claim must be validated server-side. Never trust a client-submitted role.
```

---

## Questions & Concerns

1. **Overage Billing Timing — who holds the risk?** The document implies overages from the current period are billed on the *next* invoice. This means the operator extends credit for the entire current period's overage. For a high-usage Agency user, this could mean thousands of dollars in AI credits consumed before any payment is collected. What is the maximum overage exposure per user per period, and is there a hard cap or a soft limit requiring payment before further overage consumption? The document should define an `overageHardCap` per tier (e.g., 2x the monthly credit allocation) after which overage consumption is blocked.

2. **Stripe Customer Portal vs. Custom Upgrade/Downgrade Endpoints — Conflict of Authority?** The document defines custom endpoints for upgrade, downgrade, cancel, pause, and resume (Section 4.4.2), while also exposing the Stripe Customer Portal (Section 4.4.4). The Customer Portal allows users to cancel, change plans, and update payment methods directly in Stripe, bypassing the custom endpoints entirely. When a user cancels via the Stripe portal, the `customer.subscription.deleted` or `customer.subscription.updated` webhook will fire, which is correctly handled — but the Stripe portal's plan change would use Stripe Price IDs directly, potentially assigning a price that is not in the `TIER_CONFIGS` mapping. How should the backend handle a Stripe-initiated plan change to an unrecognized Price ID? The Customer Portal configuration must be restricted to only allow the specific Price IDs defined in Section 3.11.

3. **Trial Eligibility Enforcement — "One trial per email address"** Section 14.2 states "one trial per email address, one trial per payment method (enforced at conversion)." Enforcement at the email level is straightforward (check for prior `subscriptionStatus === 'trialing'` records). However, enforcement at payment method level is only possible at Stripe subscription conversion time (when the card is entered). This means a user can start a trial, never convert, create a new account with a different email, start another trial on the same card, and the duplicate is only caught at conversion. Is this level of leakage acceptable? If not, Stripe Radar rules or fingerprinting at checkout time should be specified.

4. **`DELETE /api/privacy/delete-account` Pseudonymization — What Is the Pseudonymization Scheme?** Section 19.2 states that billing records are "pseudonymized" and retained for 7 years. The document does not define the pseudonymization scheme. Specifically: (a) Which fields in `users`, `subscriptions`, `invoices`, and `credit_transactions` are replaced, and what are they replaced with? (b) Are Stripe customer records also pseudonymized (Stripe has its own data deletion APIs)? (c) Is the pseudonymization reversible (for legal hold scenarios)? This needs to be specified before the `privacyService.js` can be implemented correctly.

5. **Firebase Admin SDK Private Key — Production Secret Management** Section 10.5 notes "Firebase Admin SDK credentials must be securely stored (environment variables, not committed)" but provides no specification for *how* secrets are managed in the chosen deployment environment (Railway, Render, Fly.io, Cloud Run). For a GDPR-compliant system handling payment data, the private key should be stored in a secret manager (Google Secret Manager, AWS Secrets Manager, HashiCorp Vault) with audit logging of all accesses. The current "environment variable" guidance is insufficient for a production PCI-DSS SAQ-A system.

6. **Concurrent Subscription Tier Changes — What Is the Lock Strategy?** The `POST /api/subscriptions/upgrade` and `POST /api/subscriptions/downgrade` endpoints both modify the same Stripe subscription and the same Firestore `subscriptions/{id}` and `users/{uid}` documents. If a user or a race condition triggers both simultaneously (e.g., double-click on "Upgrade"), what prevents both from succeeding against Stripe? The Stripe API itself is eventually consistent on subscription updates — a second call may succeed if the first has not yet been committed. An optimistic lock using the current `subscriptionStatus` or a `subscriptionVersion: number` field (compare-and-swap on write) would prevent this.

7. **Section 19.1 Price Change Notification — EU Subscriber 60-Day Requirement Not Validated** The endpoint validates `effectiveDate >= now + 30 days` but Section 13.2 specifies "60 days for annual subscribers" and Section 11.2 mentions "60 days EU" for price changes. The validation logic must check the billing country of the affected subscribers, not apply a flat 30-day minimum. This requires knowing the `billingCountryCode` for all affected subscribers at the time the admin triggers the notification, and rejecting the request if any EU subscriber would receive less than 60 days notice.

---

## Approval Status

**Needs Revision**

The document is well-conceived and covers the majority of functional requirements for a production-grade Stripe + Firestore billing system. However, it cannot be approved for implementation in its current state due to five critical findings that would result in production data integrity failures:

- The credit deduction race condition (REQ-03-C01) will cause double-deductions under concurrent load.
- The webhook idempotency implementation (REQ-03-C02) is vulnerable to duplicate event processing.
- Overage billing has no implementation path (REQ-03-C03) — a revenue-critical mechanism is entirely missing.
- Credit rollback on AI failure (REQ-03-C04) is absent, creating a product integrity problem and a likely churn driver.
- The `checkout.session.completed` + `payment_intent.succeeded` double-fulfillment risk (REQ-03-C05) will grant double credits to users making pack purchases.

**Conditions for approval**: All Critical findings (REQ-03-C01 through REQ-03-C05) must be addressed with document updates before implementation begins on Batch 2. All Major findings should be resolved in the document before the affected stories are started. New Requirements NR-01 through NR-07 should be incorporated into the relevant sections. The document should be re-reviewed after Critical and Major findings are addressed.