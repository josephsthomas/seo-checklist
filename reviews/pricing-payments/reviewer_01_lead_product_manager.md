# Lead Product Manager — Requirements Review
**Reviewer:** Lead Product Manager
**Document:** pricing-payments-requirements.md
**Date:** 2026-02-22
**Status:** Complete

---

## Executive Summary

This is a technically comprehensive requirements document that covers the mechanics of subscription management, credit tracking, and Stripe integration with impressive depth and internal consistency. However, it contains several critical business-logic gaps that would result in revenue leakage, user confusion, and conversion failure if implemented as written — most notably the complete absence of annual billing, an undefined Agency tier price ($249 referenced in the task brief vs. $299 in the document), an overage model that is economically broken for paid tiers, and a free-to-paid conversion funnel that lacks the persuasion mechanics necessary to drive upgrade revenue. The document is ready for refinement, not implementation.

---

## Sections Reviewed

| Section | Focus Level |
|---------|-------------|
| 1. Overview & Goals | Primary |
| 2. Tier Definitions & Credit System | Primary |
| 3. Data Models & Firestore Schemas | Secondary |
| 4. Backend API Specifications | Secondary |
| 5. Frontend Components | Primary |
| 6. Registration Flow Updates | Primary |
| 7. Usage Enforcement & Gating | Primary |
| 8. Admin Features & Observability | Secondary |
| 9. User Stories by Implementation Batch | Primary |
| 10. Implementation Notes & Conventions | Secondary |
| Appendices A & B | Secondary |

---

## Findings

### Critical (Must fix before implementation)

- **[REQ-01-C01]** Section 2.1 — Agency Tier Price Inconsistency: The document specifies the Agency tier at $299/month throughout (Sections 2.1, 6.4, 5.1.1, all tier config code). The product brief and publicly stated positioning reference $249/month. This is not a rounding issue — a $50/month discrepancy represents $600/year per subscriber. If $299 is intentional, the "Most Popular" designation on Freelance at $149 becomes questionable as the Agency tier now sits at a 2x price multiplier. If $249 was intended, every price reference in the document and all Stripe product configurations must be corrected before any code is written. **Recommendation**: Confirm the canonical Agency price with the business owner and establish a single locked source of truth in `TIER_CONFIGS` before implementation begins.

- **[REQ-01-C02]** Section 2.1 / 2.2.3 — Annual Billing Completely Absent: The document has no annual billing option. This is a critical omission for a SaaS pricing model. Annual plans are the primary lever for reducing churn, improving cash flow (upfront annual payment), and increasing LTV. The industry standard is a 15–20% discount for annual prepayment (equivalent to 2 free months). The pricing page wireframe (Section 5.1.1) acknowledges a billing toggle placeholder ("Monthly only for now") but there are no requirements, no data model fields, no Stripe price objects, and no user stories for annual billing anywhere in the document. Launching without annual pricing concedes churn to competitors who offer it and eliminates a key conversion incentive. **Recommendation**: Add annual pricing tier definitions, an `interval: 'month' | 'year'` field to the subscription schema, corresponding Stripe annual Price IDs in Section 3.10, and at minimum a Batch 8 user story block covering annual billing. If annual pricing is a post-v1 feature, the billing toggle placeholder must be removed from the pricing page to avoid user confusion.

- **[REQ-01-C03]** Section 2.2.3 — Overage Model Is Economically Broken for Paid Tiers: The overage model as specified allows overage charges to exceed subscription revenue with no cap or circuit breaker beyond the auto-refill cap of 3 packs/month (which applies only to auto-refill, not to manual overage). More critically, the per-credit overage rate for AI credits ($0.50/credit at the Client tier) means a heavy user triggering extensive AI overage could generate a surprise charge far exceeding their $99 subscription fee in a single billing cycle. This creates a chargeback and dispute risk, a customer trust problem, and potential regulatory exposure in jurisdictions with surprise billing protections. The document also does not specify how overage charges are billed — are they metered in Stripe and invoiced at period end, or charged immediately as a payment intent? This implementation detail is architecturally significant. Furthermore, Section 4.4.4 references a `POST /api/billing/portal-session` but there is no `overageInvoices` endpoint or overage charge reconciliation endpoint defined anywhere. **Recommendation**: (1) Define a hard monthly overage spending cap per tier (e.g., 2x subscription price). (2) Require explicit user opt-in to overage billing with a stored consent flag. (3) Specify the Stripe billing mechanism for overages (Stripe metered billing or separate payment intents). (4) Add an overage notification system that warns at 50%, 80%, and 100% of overage cap.

- **[REQ-01-C04]** Section 4.4.1 — Credit Pack Purchase Blocked for Free Tier Users Without Justification: The endpoint specification explicitly states `403: Free tier users cannot purchase packs (must upgrade first)`. This is a significant conversion anti-pattern. A free-tier user who runs out of their 50 credits and wants to continue is a high-intent buyer. Blocking them from purchasing a $15 credit pack and forcing them to commit to a $99/month subscription instead will cause high abandonment. There is no business rationale documented for this restriction. **Recommendation**: Remove the free-tier restriction on credit pack purchases. Allow Basic users to purchase packs. Use pack purchase behavior as a conversion signal to trigger upgrade nudge messaging post-purchase ("You've now spent $15 on credits — upgrade to Client Side for $99/month and get 10x credits plus overage pricing").

### Major (Should fix before implementation)

- **[REQ-01-M01]** Section 2.1 — Client Side Tier Value Proposition Is Weak: The Client Side tier at $99/month offers only 1 project and 1 seat — identical project and seat limits to the free Basic tier. A user upgrading from Basic to Client gains: 500 vs 50 credits, full exports (vs watermarked), email support, shared reports, and 2 scheduled audits. But they cannot manage more projects. This means a solo website owner who manages even 2 websites has no incentive to choose Client over jumping directly to Freelance at $149/month. The $50 price gap between Client ($99) and Freelance ($149) is small relative to the feature jump (1 vs 10 projects, white-label, client handoff reports). This will result in tier-skipping where users go Basic → Freelance, reducing Client tier conversion. **Recommendation**: Either (a) increase Client tier to 3–5 projects to give it a clear multi-site value, or (b) reduce the Freelance tier price to $129 to tighten the tier ladder, or (c) introduce a meaningful Client-only feature (e.g., priority support, custom domain for shared reports) to differentiate it from the Basic tier on dimensions beyond raw credits.

- **[REQ-01-M02]** Section 2.1 — Freelance Tier Single-Seat Constraint Is Misaligned with Name: The Freelance tier is named and marketed for "managing multiple clients" but offers only 1 seat. A freelancer who partners with a subcontractor or VA, or who wants to give client read-only access, cannot do so. The Agency tier at $299/month (or $249) is the only path to any collaboration — an enormous price jump from $149. This creates a "missing middle" gap that will frustrate freelancers with even basic collaboration needs and push them toward competitors. **Recommendation**: Add 2–3 seats to the Freelance tier (e.g., "1 owner + 2 collaborators") to reflect realistic freelance work patterns. This also makes the Agency tier's "unlimited seats" value proposition more meaningful.

- **[REQ-01-M03]** Section 2.2.4 — Credit Economics Validation Is Incomplete and Potentially Misleading: The margin analysis table (Section 2.2.4) shows ~87% margin for the Client tier, but this calculation only accounts for credit/AI costs and ignores: Stripe transaction fees (~2.9% + $0.30 per transaction = ~$3.17/month per Client subscriber), infrastructure costs (Firebase/Firestore read/write costs at scale, storage costs, the Node/Express server hosting), customer support labor costs (the 48hr email SLA has a real cost), payment failure retry costs, and refund/chargeback rates. At scale, the true margin is materially lower. More importantly, the "Est. Credit Cost" and "Est. AI Cost" figures are presented without any methodology — how were these derived? What LLM provider and pricing was assumed? GPT-4o pricing differs from Claude pricing differs from Gemini pricing. **Recommendation**: Add a footnote or appendix showing the full unit economics calculation including Stripe fees, infrastructure costs, and support costs. Document the assumed LLM provider and per-token cost used to derive the AI cost estimates. Add a sensitivity analysis showing margin at 2x and 0.5x the assumed usage patterns.

- **[REQ-01-M04]** Section 6.2.2 — Nonprofit Registration Flow Has a Dangerous Gap: In Scenario C (Nonprofit tier registration), the user creates an account on Basic tier temporarily, submits verification, and then waits for admin approval. The document states "When admin approves: Backend creates Stripe subscription at $49/month, sends email notification. User completes Stripe Checkout via email link or next login prompt." This flow has two critical problems: (1) There is no SLA or maximum wait time defined for admin review, meaning a nonprofit could wait days or weeks on Basic tier with no communication about expected timeline; (2) The "email link" for Stripe Checkout is not specified anywhere in the API or webhook handlers — `POST /api/nonprofit/review` with `decision: 'approved'` does not return a checkout URL and there is no email template or transactional email system specified in the document. The nonprofit user has no self-service path to complete payment if the email is lost or expires. **Recommendation**: (1) Define an admin SLA for nonprofit review (e.g., 5 business days). (2) Specify the transactional email system (SendGrid, Postmark, Firebase Extensions, etc.) and add it to the tech stack. (3) Add a `GET /api/nonprofit/payment-link` endpoint that generates a fresh Stripe Checkout URL for approved nonprofits who haven't yet paid. (4) Add a "Complete Your Nonprofit Subscription" prompt on the billing dashboard for approved-but-unpaid nonprofits.

- **[REQ-01-M05]** Section 9 — User Stories Are Missing for Free-to-Paid Conversion Funnel: The document has 7 implementation batches covering infrastructure, UI, and gating — but there is no batch or user story covering the conversion funnel mechanics: upgrade prompts with contextual messaging, trial offers, "you've used 80% of your credits" notifications, win-back campaigns for canceled users, or any in-app growth mechanics. The entire monetization strategy relies on passive discovery via the pricing page and inline UpgradePrompts. For a platform launching monetization on an existing free user base, the conversion playbook is as important as the billing infrastructure. **Recommendation**: Add a Batch 8 (or Batch 0, pre-launch) covering: (1) In-app upgrade nudge triggers (80% credit usage, feature gate encounter, period reset). (2) Email notification system for billing events (payment failed, subscription renewing, credits low, plan canceled). (3) Win-back flow for canceled subscribers. (4) Onboarding checklist for new paid subscribers to drive activation and reduce early churn.

- **[REQ-01-M06]** Section 2.1 / 3.10 — No Free Trial Defined Despite FAQ Mention: Section 5.1.5 lists "Is there a free trial?" as FAQ item #7, implying users will ask about it. The Stripe product configuration (Section 3.10) has no trial periods defined. The subscription schema includes a `trialing` status (Section 3.3) and Section 7.10 defines UI treatment for `trialing` status. Yet nowhere in the document is a trial offer defined — not the duration, not which tiers offer it, not how it affects overage, not the trial-to-paid conversion flow. The document is internally inconsistent: it has the plumbing for trials without the policy. **Recommendation**: Make an explicit decision: either (a) No free trial — remove `trialing` from the subscription status enum, remove the trial UI treatment from Section 7.10, and update FAQ #7 to "No, but we offer a free forever Basic tier," or (b) Define a trial: specify duration (e.g., 14 days), which tiers offer it, whether a payment method is required upfront, what happens at trial expiry, and add Stripe trial configuration to Section 3.10.

- **[REQ-01-M07]** Section 8 — No Dunning / Payment Recovery Flow Specified: The document defines `past_due` status handling (7-day grace period, then revert to Basic limits) but there is no dunning sequence specified. Dunning is the automated recovery of failed subscription payments through retry logic, customer notification, and escalating urgency messaging. Without a defined dunning strategy, involuntary churn (payment failures) will bleed MRR silently. Stripe's Smart Retries and Customer Portal can handle some of this, but a formal policy is needed. **Recommendation**: Define a dunning policy: (1) Stripe Smart Retries enabled (up to 4 retries over 7 days). (2) Email notification on day 1 (payment failed, update card), day 3 (reminder), day 6 (final warning — account reverts tomorrow). (3) Grace period definition: 7 days of full access post-failure. (4) Post-revert win-back: Email on day 8 ("Your account has been downgraded — reactivate here"). Add these as user stories in the admin/notifications batch.

### Minor (Fix during implementation)

- **[REQ-01-m01]** Section 2.1 — "Client Side" Tier Name Is Ambiguous: The tier named "Client Side" is confusing in a B2B SaaS context. "Client Side" is a well-established technical term (client-side JavaScript, client-side rendering) and has no obvious association with "managing one website for a client." Users seeing "Client Side" on a pricing page may be confused about what it refers to. The Freelance and Agency tiers have clear, role-based names. **Recommendation**: Rename to "Solo," "Starter," "Professional," or "Individual" to align with the role-based naming convention of the other tiers.

- **[REQ-01-m02]** Section 2.2.2 — Credit Cost Matrix Has Missing Actions: The credit cost matrix does not include costs for: (1) Generating a VPAT report export (the `vpat_generate` action is in CREDIT_COSTS at 5 standard credits but is missing from the human-readable matrix in Section 2.2.2). (2) The `schema_bulk` action description says "per 10 schemas" but the CREDIT_COSTS constant shows cost: 5, while the matrix shows "Bulk schema generation (per 10 schemas) = 5" — these are consistent but the matrix omits the per-unit breakdown for bulk actions, making it hard to predict costs. (3) Generating a shared report link (1 credit) is in the matrix but not in the CREDIT_COSTS constant. **Recommendation**: Audit the credit matrix against CREDIT_COSTS and ensure all actions appear in both with consistent costs. Add a third column to the matrix showing "effective cost per unit for bulk actions."

- **[REQ-01-m03]** Section 3.4 — `credit_balances` Missing `storageUsedBytes` Field: Section 7.8 (Storage Enforcement) states "Storage usage tracked in `credit_balances` document (add `storageUsedBytes` field)" but the `credit_balances` schema in Section 3.4 does not include this field. This inconsistency will cause implementation confusion — a developer building to the schema spec will not add the field, then fail to implement storage enforcement correctly. **Recommendation**: Add `storageUsedBytes: number` to the `credit_balances` schema in Section 3.4, and add a corresponding `storageUsedBytes` field to the denormalized `users/{userId}` schema in Section 3.2.

- **[REQ-01-m04]** Section 4.4.1 — Upgrade Endpoint Does Not Handle Nonprofit-to-Paid Tier Change: The `POST /api/subscriptions/upgrade` endpoint lists valid values as `'client' | 'freelance' | 'agency'` but does not address what happens when a nonprofit user wants to upgrade to, say, Freelance (losing the nonprofit discount but gaining more features). Similarly, there is no specified path for a user to move from Nonprofit to Agency. The downgrade endpoint allows `'basic' | 'client' | 'freelance'` but does not allow downgrading to `'nonprofit'` — which would be required if a nonprofit re-qualifies after a lapsed verification. **Recommendation**: Add explicit handling for nonprofit tier transitions in both the upgrade and downgrade endpoint specifications, and add a decision table clarifying all valid tier transition paths.

- **[REQ-01-m05]** Section 5.1.2 — Pricing Page CTA Logic Has a Gap for Downgrade Path: The pricing card CTA logic specifies: "If user is logged in and on a lower tier: 'Upgrade to [Tier Name]'" and "If user is on this tier: 'Current Plan' (disabled)". But there is no CTA defined for when a logged-in user views a lower tier than their current one. The user sees no button (or an undefined state) when looking at a tier below their current plan. Story 3.1 in the acceptance criteria adds "Downgrade" as an option, but Section 5.1.2 (the canonical UI spec) omits it. **Recommendation**: Add a third CTA state to Section 5.1.2: "If user is on a higher tier: 'Downgrade to [Tier Name]' → `/app/billing/plans`." Ensure the pricing page spec and the story AC are consistent.

- **[REQ-01-m06]** Section 7.9 — Data Retention Enforcement Is a GDPR/CCPA Risk Without User Notification: The data retention enforcement spec describes automated daily deletion of user data older than the tier's retention limit. For Basic users (30-day retention), this means audit history, readability analyses, and accessibility scans are silently deleted 30 days after creation. There is no requirement for: (1) user notification before deletion, (2) a data export option before deletion, (3) a grace period on downgrade (e.g., a user downgrading from Freelance to Basic has 2-year-old data that would be deleted within 30 days), or (4) legal basis documentation for automated deletion under GDPR. **Recommendation**: Add a user notification requirement (email + in-app banner, 7 days before data deletion). Add a "Export All Data" option to the billing dashboard. Define a downgrade grace period for data retention (e.g., 30 days after downgrade before applying new tier's retention limits). Add a legal review requirement for the data retention policy.

- **[REQ-01-m07]** Section 9 / Batch 2 — No Admin Route for Manual Credit Adjustment: Across all 7 batches and 8+ admin API endpoints, there is no mechanism for an admin to manually adjust a user's credit balance. This is a day-one customer support need: a user reports a bug that consumed their credits, a webhook failed and credits weren't provisioned, or a goodwill credit is warranted. Without a manual credit adjustment endpoint and UI, every such case requires a direct Firestore edit — which is error-prone and bypasses the transaction ledger. **Recommendation**: Add an admin endpoint `POST /api/admin/credits/adjust` and a corresponding UI in the subscription admin dashboard for manual credit additions and deductions with mandatory reason logging.

### Suggestions (Consider for future)

- **[REQ-01-S01]** Section 2.1 — Consider a "Startup" or "Growth" Add-On for Team Collaboration Below Agency Price: The jump from Freelance ($149/month, 1 seat) to Agency ($299/month, unlimited seats) is a 2x price increase for the primary feature of multi-seat access. Many small teams (2–5 people) would pay $50–$100 more per month for a seat add-on rather than doubling their subscription cost. A per-seat add-on model ($20–$30/seat/month on top of Freelance) or a "Team" tier at $199/month with 5 seats and 2,500 credits would capture this mid-market segment and reduce tier-skipping. This could be built on top of the existing Stripe subscription infrastructure as an add-on price.

- **[REQ-01-S02]** Section 2.2.3 — Credit Packs: Consider Subscription-Based Credit Top-Ups ("Credit Subscriptions"): The current credit pack model is one-time purchases with no expiry. A complementary "Credits+" add-on subscription (e.g., "+500 standard + 100 AI credits per month for $25/month") would generate predictable recurring revenue from high-usage users who consistently exhaust their tier allocation, without requiring them to upgrade to the next tier. This is particularly valuable for capturing users on the boundary between Freelance and Agency. Stripe supports subscription add-ons natively via multiple subscription items.

- **[REQ-01-S03]** Section 8 — Consider a Revenue Operations Dashboard Combining Stripe and Firebase Data: The current admin analytics design relies on Firestore-mirrored Stripe data, which introduces sync lag and reconciliation complexity. For a SaaS at early scale, it is worth evaluating a direct Stripe Dashboard + Stripe Sigma (SQL analytics) integration rather than building custom MRR/churn charts, which are expensive to maintain and often lag behind Stripe's own analytics. Reserve the custom admin dashboard for Firebase-specific usage analytics (credit consumption, tool usage) that Stripe cannot provide. This would reduce Batch 7 implementation scope significantly while improving data accuracy.

- **[REQ-01-S04]** Section 2.1 — Nonprofit Tier: Consider Expanding to Other Discount-Eligible Organizations: The nonprofit tier is US-centric (501(c)(3) is a US tax designation). Educational institutions, open-source projects, NGOs, and public sector organizations in other jurisdictions would also benefit from discounted access. The manual verification workflow already exists; it could be generalized to accept any tax-exempt determination letter. This is a GTM opportunity that costs minimal incremental development. Recommendation: Rename the tier to "Impact" or "Mission" pricing and expand accepted documentation types to include international equivalents (UK Charity Commission registration, Canadian T3010, EU NPO registration, EDU domain verification for academic institutions).

- **[REQ-01-S05]** Section 6.2 — Consider a "Try Before You Buy" Friction Reducer: The registration flow requires account creation before showing a pricing tier confirmation. For high-intent users coming from paid search or comparison sites, forcing Firebase Auth signup before seeing the Stripe checkout creates unnecessary friction. Consider a "guest checkout" or "email-first" flow where the user enters their email and payment info in a single Stripe-hosted checkout session, and the Firebase account is created post-payment using the Stripe customer email. This is a known conversion optimization for SaaS that can increase paid conversion rates by 15–25%.

---

## New Requirements

The following requirements are missing from the document entirely. They are written in the same style and format as the existing user stories and can be inserted directly.

---

### BATCH 8: Annual Billing & Conversion Optimization

**Dependencies**: Batch 2 (backend API), Batch 5 (billing UI)
**Estimated scope**: ~8 files created/modified
**Goal**: Add annual billing option with discount pricing, and implement in-app conversion nudge mechanics.

---

#### Story 8.1: Add Annual Pricing Plans

**As a** subscriber, **I want** to pay annually at a discounted rate, **so that** I can reduce my monthly cost and commit to a longer plan.

**AC:**
- [ ] Add annual pricing to `TIER_CONFIGS` for Client, Freelance, and Agency tiers: annual price = monthly × 10 (equivalent to 2 months free, approximately 16.7% discount)
  - Client: $990/year (vs $1,188 monthly)
  - Freelance: $1,490/year (vs $1,788 monthly)
  - Agency: $2,990/year (vs $3,588 monthly, or $2,490/year vs $2,988 monthly if Agency = $249/month)
- [ ] Add `interval: 'month' | 'year'` field to `subscriptions/{subscriptionId}` Firestore schema
- [ ] Add annual Stripe Price IDs to Section 3.10 product configuration
- [ ] Add annual Price ID env vars to Section 3.11: `STRIPE_PRICE_CLIENT_ANNUAL`, `STRIPE_PRICE_FREELANCE_ANNUAL`, `STRIPE_PRICE_AGENCY_ANNUAL`
- [ ] Update `POST /api/checkout/create-session` to accept `interval: 'month' | 'year'` parameter
- [ ] Add billing interval toggle (Monthly / Annually) to public pricing page, replacing the current placeholder
- [ ] Annual plans display "Save 2 months" badge on pricing cards when annual toggle is selected
- [ ] Credit allocation remains monthly (credits are provisioned monthly, even on annual plans), reset on monthly billing date derived from annual subscription start

**Files:**
- Modify: `src/config/tiers.js`
- Modify: `server/src/config/tiers.js`
- Modify: `server/src/routes/checkout.js`
- Modify: `src/components/public/PricingPage.jsx`
- Modify: `server/src/services/webhookService.js` (handle `invoice.paid` monthly credit resets for annual subs)

---

#### Story 8.2: Create Credit Usage Notification System

**As a** subscriber, **I want** to receive notifications when my credits are running low, **so that** I can take action before being interrupted.

**AC:**
- [ ] Define transactional email provider (SendGrid / Postmark / Resend) and add to tech stack in Section 1.2
- [ ] Add `POST /api/notifications/send` internal service (not exposed to frontend) in the backend
- [ ] Trigger email notification when standard credits fall below 20% of monthly allocation
- [ ] Trigger email notification when AI credits fall below 20% of monthly allocation
- [ ] Trigger email notification 3 days before billing period reset (with usage summary)
- [ ] Add in-app notification via Firestore `notifications/{userId}` collection
- [ ] Add `NotificationBanner` component to `ToolLayout.jsx` that checks for low-credit notifications
- [ ] User can configure notification preferences (email on/off, in-app on/off) in billing dashboard
- [ ] Notifications are not sent more than once per 24-hour period per trigger type

**Files:**
- Create: `server/src/services/notificationService.js`
- Create: `src/components/shared/NotificationBanner.jsx`
- Modify: `src/components/billing/BillingDashboard.jsx` (add notification preferences section)
- Modify: `server/src/services/creditService.js` (trigger notifications on debit)

---

#### Story 8.3: Implement Overage Consent and Cap Enforcement

**As a** subscriber, **I want** to explicitly consent to overage billing and set a monthly overage spending cap, **so that** I never receive unexpected charges beyond what I authorize.

**AC:**
- [ ] Add `overageConsent` object to `subscriptions/{subscriptionId}` schema:
  - `overageEnabled: boolean` (default: false for new subscribers)
  - `monthlyOverageCap: number` (in cents, default: subscription price × 2)
  - `consentedAt: Timestamp | null`
  - `consentedByIp: string | null`
- [ ] Overage billing is disabled by default; users must opt in via billing dashboard
- [ ] When user enables overage: Show a consent modal with exact per-credit pricing, example charges, and monthly cap setting. Require explicit checkbox confirmation.
- [ ] Backend `creditService.consumeCredits` checks `overageEnabled` before allowing overage. If disabled: return 402 with "overage disabled" error code and prompt to enable it.
- [ ] Backend enforces `monthlyOverageCap`: when overage charges for the period would exceed cap, return 402 with "overage cap reached" error code
- [ ] Add `POST /api/billing/overage-settings` endpoint to update overage preferences
- [ ] Add overage settings section to billing dashboard showing: overage enabled/disabled toggle, cap setting, current overage amount this period
- [ ] Send email notification when overage charges reach 80% of cap

**Files:**
- Modify: `server/src/services/creditService.js`
- Modify: `server/src/services/subscriptionService.js`
- Create: `server/src/routes/billing.js` (add overage-settings endpoint)
- Modify: `src/components/billing/BillingDashboard.jsx`
- Modify: `server/src/config/tiers.js` (document overage defaults per tier)

---

#### Story 8.4: Admin Manual Credit Adjustment

**As an** admin, **I want** to manually add or deduct credits from a user's balance, **so that** I can resolve support issues, compensate for system errors, and issue goodwill credits.

**AC:**
- [ ] Add `POST /api/admin/credits/adjust` endpoint (admin-only):
  - Request: `{ userId, creditType: 'standard' | 'ai', amount: number, reason: string }`
  - `amount` is positive for additions, negative for deductions
  - `reason` is required (logged in credit_transactions with `type: 'admin_adjustment'`)
  - Updates `credit_balances/{userId}` using Firestore transaction
  - Creates `credit_transactions` record with `action: 'admin_adjustment'`, `adminUserId`, and `reason`
  - Updates denormalized balance on `users/{userId}`
- [ ] Admin role check enforced; returns 403 for non-admins
- [ ] Add credit adjustment UI in admin subscription detail view: input for amount, credit type dropdown, required reason field, submit button, confirmation modal
- [ ] Adjustment history visible in admin view of user's credit transaction log
- [ ] Maximum single adjustment capped at 10,000 credits (standard) or 2,000 AI credits to prevent accidental large grants

**Files:**
- Create: `server/src/routes/admin/credits.js`
- Modify: `src/components/admin/SubscriptionDashboard.jsx` (add adjustment UI to subscriber detail)

---

#### Story 8.5: Implement Downgrade Data Retention Grace Period

**As a** subscriber who downgrades their plan, **I want** a grace period before my data is deleted under the new tier's retention policy, **so that** I can export my data before it is permanently removed.

**AC:**
- [ ] When a downgrade takes effect (subscription updated via webhook), do NOT immediately apply the new tier's `dataRetentionDays` limit
- [ ] Set a `dataRetentionGraceUntil: Timestamp` field on the `subscriptions/{subscriptionId}` document: 30 days from downgrade effective date
- [ ] During grace period: retain all data regardless of new tier's retention limit
- [ ] At grace period start: send email notification listing data that will be deleted and providing a "Export All Data" link
- [ ] At grace period end: apply new tier's retention policy (existing cron job handles deletion)
- [ ] "Export All Data" endpoint: `POST /api/billing/export-user-data` — generates a ZIP of all user's project data, audit exports, and analysis history and emails a download link (link expires in 48 hours)
- [ ] Display grace period notice in billing dashboard with countdown and export button

**Files:**
- Modify: `server/src/services/webhookService.js` (set grace period on downgrade event)
- Modify: `server/src/services/usageService.js` (respect grace period in retention job)
- Create: `server/src/routes/billing.js` (add export-user-data endpoint)
- Modify: `src/components/billing/BillingDashboard.jsx` (add grace period notice)

---

## Modified Requirements

The following are specific changes to existing requirements. Original text and revised text are provided for direct substitution.

---

### Modified Requirement 1

**Location**: Section 2.1, Client Side tier description, Seats and Projects line
**Issue**: Client Side tier single-project limit makes it functionally identical to Basic in terms of project scope, undermining its value proposition.

**Original text:**
```
#### Client Side — $99/month
- **Seats**: 1
- **Projects/Websites**: 1
```

**Revised text:**
```
#### Client Side — $99/month
- **Seats**: 1
- **Projects/Websites**: Up to 3
```

**Rationale**: Three projects gives Client Side a meaningful step up from Basic (1 project) without cannibalizing Freelance (10 projects). It serves users who manage a primary site plus a staging environment and one secondary property — a common solo web professional profile.

---

### Modified Requirement 2

**Location**: Section 4.4.1, `POST /api/checkout/create-pack-session`, Errors block
**Issue**: Blocking free-tier users from purchasing credit packs eliminates a high-intent purchase and forces users into a subscription commitment they may not be ready to make.

**Original text:**
```
Errors:
- 400: Invalid pack type
- 401: Not authenticated
- 403: Free tier users cannot purchase packs (must upgrade first)
```

**Revised text:**
```
Errors:
- 400: Invalid pack type
- 401: Not authenticated

Notes:
- Free tier users may purchase the Starter Pack only ($15, 100 standard + 25 AI credits)
- Pro Pack and Mega Pack require an active paid subscription (return 403 with error code 'paid_subscription_required' if Basic user attempts Pro or Mega purchase)
- After a free-tier user purchases a pack, show an in-app prompt: "You've invested in your content toolkit — unlock 10× more monthly credits with a Client Side plan."
```

**Rationale**: Allowing Starter Pack purchases for free users removes friction for high-intent users while still providing an upgrade path incentive. Restricting Pro/Mega packs maintains the value proposition of paid tiers.

---

### Modified Requirement 3

**Location**: Section 3.3, `subscriptions/{subscriptionId}` schema, `interval` field
**Issue**: The schema hard-codes `interval: string // 'month'` with a comment suggesting only monthly billing is supported. This would require a breaking schema change to add annual billing later.

**Original text:**
```
  interval: string,                // 'month'
```

**Revised text:**
```
  interval: string,                // 'month' | 'year'
  intervalCount: number,           // 1 (for both monthly and annual — Stripe uses 1 month or 1 year intervals)
  annualDiscountPercent: number | null,  // e.g., 16.7 for annual plans (null for monthly)
```

**Rationale**: Future-proofing the schema for annual billing avoids a migration later. The `annualDiscountPercent` field enables display of savings in the billing dashboard without recalculating from prices.

---

### Modified Requirement 4

**Location**: Section 2.2.3, Credit Overage Model, item 2 (Credit packs)
**Issue**: Credit pack non-expiry ("non-expiring until used") creates a problematic accounting liability on the balance sheet (deferred revenue that never recognizes) and incentivizes stockpiling. Adding a 12-month rolling expiry aligns with industry standards and removes the liability.

**Original text:**
```
2. **Credit packs** (one-time purchases, non-expiring until used):
   - **Starter Pack**: 100 standard + 25 AI credits — $15
   - **Pro Pack**: 500 standard + 100 AI credits — $60
   - **Mega Pack**: 2,000 standard + 500 AI credits — $200
```

**Revised text:**
```
2. **Credit packs** (one-time purchases, valid for 12 months from purchase date):
   - **Starter Pack**: 100 standard + 25 AI credits — $15
   - **Pro Pack**: 500 standard + 100 AI credits — $60
   - **Mega Pack**: 2,000 standard + 500 AI credits — $200
   - Packs expire 12 months after purchase. Users receive an email notification 30 days before pack expiry.
   - Upon subscription cancellation, purchased pack credits expire 30 days after cancellation (grace period for data access and export).
```

**Rationale**: 12-month expiry is standard in the industry (see Google Workspace credits, HubSpot credits), removes unlimited deferred revenue liability, and creates a repurchase incentive without feeling punitive.

---

### Modified Requirement 5

**Location**: Section 7.10, Subscription Status Enforcement table, `trialing` row
**Issue**: The `trialing` status has no defined trial period, no trial creation path, and no conversion flow, yet the table assigns it a full-tier-access treatment. This creates a dangling implementation spec that will lead to dead code or an undefined feature.

**Original text:**
```
| `trialing` | Full tier access | Trial banner with end date |
```

**Revised text:**
```
| `trialing` | Full tier access for the trial tier; requires valid payment method on file | Trial banner: "Your [Tier] trial ends on [date]. Your card will be charged $[amount] on [date]. [Manage Plan]" |

> **Note**: Trialing status is reserved for future use. In v1, no trials are offered. The `trialing` status handler must be implemented in the webhook service (as Stripe may send this status), but no trial creation path is exposed to users. The FAQ entry "Is there a free trial?" should answer: "We don't currently offer a free trial, but our free Basic plan gives you access to all 7 tools with 50 standard and 10 AI credits per month, forever."
```

**Rationale**: Resolves the internal inconsistency between a defined UI state with no creation path, prevents developers from building a trial flow that has no product backing, and provides the correct FAQ answer.

---

## Questions & Concerns

1. **Agency tier price**: Is the canonical Agency price $249/month (as referenced in external product discussions) or $299/month (as documented throughout this spec)? This must be resolved before any Stripe products are created, as changing a live price requires creating a new Stripe Price object and migrating existing subscribers.

2. **Existing free users at monetization launch**: The document specifies migrating existing users to Basic tier defaults. What is the communication and rollout plan for existing authenticated users who currently have unrestricted free access to all tools? A sudden change to credit-gated access for existing users without advance notice creates churn risk and negative sentiment. Is there a grandfather period, a one-time credit bonus for loyalty, or a pre-announcement sequence planned?

3. **LLM provider and pricing assumption for credit economics**: The credit economics table (Section 2.2.4) shows AI cost estimates, but no LLM provider or model is specified. The difference between GPT-4o (~$2.50/1M input tokens), Claude Sonnet (~$3/1M input tokens), and GPT-4o-mini (~$0.15/1M input tokens) is enormous. The viability of the margin targets depends entirely on which model is used for each AI action. Has a provider been selected? Are the cost targets validated against actual API pricing?

4. **Stripe Customer Portal configuration scope**: The document delegates payment method management and cancellation to the Stripe Customer Portal (Section 4.4.4), but the Customer Portal can also allow customers to upgrade/downgrade plans directly. Will the Customer Portal be configured to allow plan changes (potentially bypassing the app's downgrade/proration logic) or restricted to payment method and invoice management only? This has significant implications for the downgrade flow in Section 4.4.2.

5. **International pricing and VAT/GST compliance**: The document assumes USD pricing only. If the platform serves users in the EU, UK, Australia, or Canada, Stripe Tax must be configured to apply VAT/GST automatically, and the pricing page must display tax-exclusive prices with a "plus applicable taxes" note. Is international launch in scope for v1? If so, Stripe Tax configuration and the legal requirement to display tax-inclusive prices in certain jurisdictions (EU, UK) must be addressed.

6. **Multi-tiered nonprofit verification review**: The admin review workflow for nonprofits (Section 8.3.2) is entirely manual — one admin reviews every submission. What is the expected volume of nonprofit applications? If this scales beyond a few dozen per week, the queue becomes a bottleneck and a support burden. Has an automated EIN validation API (IRS Tax Exempt Organization Search API is free) been considered to pre-screen submissions before manual review?

7. **Credit consumption from the frontend vs. backend**: The credit consumption flow (Section 7.2) shows the frontend calling `POST /api/credits/consume` before executing the tool action. This means if the backend call succeeds but the actual tool action fails (e.g., the audit upload fails after credits are consumed), the user loses credits without receiving the service. Is there a credit refund/rollback mechanism for failed tool actions? This is not specified anywhere in the document and is a significant user experience concern.

8. **Schema Generator credit gating specifics**: Section 2.3 shows Basic tier is limited to "3 types" of the Schema Generator. But Section 7.4 lists `allSchemaTypes` as a feature name with Basic denied. The credit cost matrix shows 1 credit per schema generation and 5 credits per bulk generation, but does not specify whether a Basic user is blocked after generating 3 schemas total, 3 schema types, or 3 schemas per month. The distinction matters for implementation. Please clarify the exact gating rule.

---

## Approval Status

**Needs Revision**

The document may not proceed to implementation in its current form. The following conditions must be resolved before implementation begins:

1. **[Blocking]** Confirm and lock the Agency tier price ($249 vs $299/month) — impacts all pricing displays, Stripe product configurations, and economic projections.
2. **[Blocking]** Specify the LLM provider and model pricing assumptions underpinning the credit economics validation table. If the margin targets are not viable at actual AI API costs, tier pricing or credit allocations must be revised before building.
3. **[Blocking]** Define an explicit decision on annual billing: either add annual billing requirements (per Story 8.1 above) or formally defer it with a documented rationale and remove the pricing page toggle placeholder.
4. **[Blocking]** Add overage consent mechanism (per Story 8.3 above) before implementing the overage model. Billing users for overages without explicit consent is a regulatory and chargeback risk.
5. **[Required]** Resolve the free-tier credit pack purchase restriction (per Modified Requirement 2) — the current spec blocks a high-value conversion path without business justification.
6. **[Required]** Specify the transactional email provider and add billing event email notifications (payment failed, credits low, downgrade data warning) as explicit user stories. The current document leaves these as implied but unspecified.
7. **[Required]** Make an explicit decision on free trials and update Section 7.10 and the FAQ accordingly (per Modified Requirement 5).
Now I have read the complete document. I will produce the full expert review.

# Lead Product Manager — Requirements Review
**Reviewer:** Lead Product Manager
**Document:** pricing-payments-requirements.md
**Date:** 2026-02-22
**Status:** Complete

---

## Executive Summary

This is a technically detailed and architecturally sound requirements document that establishes a solid foundation for a tiered subscription and credit-based monetization system. However, several business-critical gaps exist that expose the product to revenue leakage, churn risk, and conversion failure before a single paying customer is onboarded: the complete absence of annual pricing, an ambiguous and potentially damaging tier boundary between Client Side ($99) and Freelance ($149) for a single-seat user, and no defined free-to-paid conversion or trial strategy. The document is approved conditionally and should not proceed to implementation without resolving the Critical and Major findings enumerated below.

---

## Sections Reviewed

| Section | Focus Level |
|---------|-------------|
| 1. Overview & Goals | Primary |
| 2. Tier Definitions & Credit System | Primary |
| 3. Data Models & Firestore Schemas | Secondary |
| 4. Backend API Specifications | Secondary |
| 5. Frontend Components | Primary |
| 6. Registration Flow Updates | Primary |
| 7. Usage Enforcement & Gating | Primary |
| 8. Admin Features & Observability | Secondary |
| 9. User Stories by Implementation Batch | Primary |
| 10. Implementation Notes & Conventions | Secondary |

---

## Findings

### Critical (Must fix before implementation)

- **[REQ-01-C01]** Section 2.1 — Annual Pricing Completely Absent: There is no annual billing option anywhere in the document. The Stripe product configuration (Section 3.10) defines only monthly intervals; the pricing page mock (Section 5.1.1) includes a placeholder toggle labeled "Monthly only for now" with no acceptance criteria, story, or timeline to deliver annual pricing. Annual plans are the single most effective SaaS churn-reduction mechanism and typically account for 30–50% of revenue at healthy SaaS companies by locking in 12-month commitments. Shipping a billing system with monthly-only pricing and no clear annual roadmap is a structural revenue and retention risk. **Recommendation:** Define annual pricing at 15–20% discount (equivalent to 2 months free), add Stripe annual Price IDs to Section 3.10 and environment variables in Section 3.11, add a billing toggle user story in Batch 3, and update the SubscriptionContext and data model to support `interval: 'month' | 'year'`. If annual billing is intentionally deferred, this must be documented as a known gap with a specific version target, not left as a silent placeholder.

- **[REQ-01-C02]** Section 2.1 — Client Side vs. Freelance Tier Boundary Creates a Value-Destruction Trap: The Client Side tier ($99/month) and Freelance tier ($149/month) are both single-seat plans. A solo operator managing one client website who discovers they need to manage a second client must jump from $99 to $149 (+51%) solely for the project limit increase, not for any team or collaboration capability. This tier straddling problem will drive one of two behaviors: (1) users creating multiple accounts to avoid upgrading, undermining revenue, or (2) users churning because the value jump feels punitive. Additionally, the credit jump from 500 to 1,500 standard credits and 150 to 400 AI credits between Client Side and Freelance is a 3x increase that is not clearly tied to a job-to-be-done. **Recommendation:** Either (a) increase the Client Side project limit to 3 projects and reduce Freelance to $129 to create a cleaner step-up story, or (b) rename tiers to explicitly target the buyer persona ("Solo" / "Consultant" / "Agency") and add 2–3 projects to Client Side as a differentiator from Basic. At minimum, add explicit tier upgrade prompts in the pricing page FAQ and comparison table that explain the "when to upgrade" decision clearly.

- **[REQ-01-C03]** Section 2.3 / Section 7 — No Free Trial Mechanism Defined for Paid Tiers: The document lists `trialing` as a valid `subscriptionStatus` (Section 3.2, Section 7.10) and the pricing FAQ in Section 5.1.5 includes "Is there a free trial?" as question #7, yet no requirements, acceptance criteria, user stories, or backend logic exist for actually implementing a trial. Offering a trial CTA in the FAQ and on the pricing page while having no mechanism to fulfill it will immediately undermine user trust. Without a trial, the free-to-paid conversion funnel relies entirely on the Basic free tier as the product-led growth engine. The Basic tier's 50 standard credits and 10 AI credits are unlikely to generate sufficient "aha moments" to drive unprompted upgrades. **Recommendation:** Define one of the following: (a) a 14-day free trial on the Freelance tier (the "Most Popular" plan) with no credit card required, implemented via Stripe's trial period feature, with a dedicated user story in Batch 4; or (b) explicit documentation that no trial will be offered in v1 and the conversion strategy relies solely on the free tier, with measurable activation event definitions added to Section 1.2 Goals.

---

### Major (Should fix before implementation)

- **[REQ-01-M01]** Section 2.1 — Agency Tier Price Discrepancy: Section 2.1 defines the Agency tier as "$299/month" throughout the narrative tier definitions, but the pricing page wireframe in Section 5.1.1 displays "Agency | $299" while the Stripe configuration in Section 3.10 sets `price_agency_monthly → $299/month recurring`. The `TIER_CONFIGS` constant in Section 6.4 correctly defines `price: 299`. However, the Feature Access Matrix in Section 2.3 references this tier without noting that this is $299, not the $249 referenced in the prompt's focus areas checklist. This internal inconsistency suggests the price may have changed from an earlier $249 draft and may not have been fully reconciled across all sections. **Recommendation:** Perform a global find-and-replace audit to confirm `$299` appears consistently across all sections. Verify the final pricing decision was intentional by referencing any prior pricing research. If $299 is confirmed, remove any ambiguity; if $249 was the intended price, update all references uniformly.

- **[REQ-01-M02]** Section 2.1 / Section 4.4.2 — Downgrade Credit Handling is Undefined: The downgrade endpoint (Section 4.4.2) specifies that plan changes take effect at end of the billing period, but there is no defined behavior for what happens to credits during a downgrade. If a Freelance user ($149, 1,500 credits) has 900 standard credits remaining and downgrades to Client Side ($99, 500 credits), what happens on the next billing date reset? Does their balance get capped to 500? Are bonus credits from purchased packs preserved? The `resetMonthlyCredits` function in the credit service (Section 2.6 Story 2.6 AC) only says "resets monthly allocations" without specifying downgrade handling. This gap will cause both technical bugs and customer support disputes. **Recommendation:** Add explicit downgrade credit policy to Section 2.2.3 and Section 4.4.2: (a) monthly credits reset to the new lower tier allocation on the new billing period, (b) bonus pack credits are always preserved regardless of tier changes, and (c) mid-cycle downgrade schedules do not affect current period credits. Add acceptance criteria to Story 2.8 covering this scenario explicitly.

- **[REQ-01-M03]** Section 6.2 — Incomplete Stripe Checkout → Account Creation Race Condition: Scenario B (paid tier registration, Section 6.2.2) describes creating the Firebase Auth account first, then redirecting to Stripe Checkout. If the user completes Stripe payment but the webhook fires before the Firestore user document is fully created, or if the user closes the browser after Stripe payment but before the redirect, the webhook has no user document to update. The document partially addresses this by setting `subscriptionStatus: 'incomplete'` in the AuthContext default, but there is no defined recovery flow for: (a) a user who paid Stripe but whose account was never created (Stripe customer exists, no Firebase user), or (b) a user who created a Firebase account but never completed Stripe payment, leaving them in `subscriptionStatus: 'incomplete'` indefinitely. **Recommendation:** Add a requirement to Section 6.2 and Story 4.2 for: (1) storing the Stripe checkout `session_id` on the Firestore user doc before redirect, (2) a webhook handler that retries user doc lookup up to 3 times with exponential backoff, and (3) a `POST /api/subscriptions/sync` endpoint that users on landing back from Stripe (success URL) can call to force-reconcile their subscription state.

- **[REQ-01-M04]** Section 2.2.3 — Free Tier Users Cannot Purchase Credit Packs: Section 4.4.1 explicitly states `POST /api/checkout/create-pack-session` returns 403 for free tier users ("Free tier users cannot purchase packs — must upgrade first"), and Section 7.4 lists `creditPacks` as a feature gated away from Basic tier. This is a significant revenue strategy error. A free tier user who has exhausted their 50 credits is being told they must commit to a $99/month subscription to unlock any additional usage — they have no way to "pay to try" without a recurring commitment. This eliminates the entire impulse purchase conversion path and will dramatically suppress conversion. **Recommendation:** Allow free tier users to purchase credit packs. This is the canonical freemium conversion pattern: usage → credit exhaustion → pack purchase → familiarity with AI features → subscription upgrade. Remove the 403 gate from the pack purchase endpoint for Basic users. Update Section 7.4 feature gate table and Story 2.4 acceptance criteria accordingly.

- **[REQ-01-M05]** Section 8 — No Transactional Email System Defined: The requirements reference sending emails in multiple places: nonprofit approval email (Section 8.3.2), rejection email with reason (Section 8.3.2), payment failure notification (Section 4.4.6 `invoice.payment_failed` handler), and implicitly for subscription confirmation and cancellation confirmation. No email provider, template structure, triggering mechanism, or content requirements are defined anywhere in the document. Transactional emails are a legal requirement for billing events in many jurisdictions (invoice delivery, payment failure notification) and a key churn-prevention tool. **Recommendation:** Add Section 11: Transactional Email Requirements, defining: (a) email provider (e.g., SendGrid, Postmark, or Stripe's built-in email), (b) required email events and templates (subscription confirmed, payment failed, subscription canceled, nonprofit approved/rejected, credit reset), (c) user-configurable notification preferences, and (d) corresponding backend service (`server/src/services/emailService.js`) with user stories in Batch 2.

- **[REQ-01-M06]** Section 2.1 — Nonprofit Tier Verification Workflow Leaves Users in Business Limbo: Scenario C (Section 6.2.2) places a nonprofit applicant on Basic tier during the "pending" verification period with no defined SLA for admin review. A small nonprofit that applies for the $49/month tier and is left on the Basic tier (50 credits, 1 project, 30-day retention, watermarked exports) during a multi-day or multi-week review period has a severely degraded experience that may cause them to abandon the product entirely. Additionally, the document provides no mechanism for an existing paid user to apply for nonprofit status — the flow is scoped only to new registrations. **Recommendation:** (a) Define a maximum admin review SLA (suggested: 5 business days) and surface it on the pending status page, (b) allow existing Basic or paid users to apply for nonprofit verification through the billing dashboard, (c) consider granting applicants temporary "trial nonprofit" access (Client Side limits) during the pending period, and (d) add a Story in Batch 5 for existing-user nonprofit application flow.

---

### Minor (Fix during implementation)

- **[REQ-01-m01]** Section 2.2.2 — Meta Data Generator Credit Cost Inconsistency: The credit cost matrix (Section 2.2.2) defines `AI meta title generation (per URL): 1 AI credit` and `AI meta description generation (per URL): 1 AI credit` separately. However, `AI bulk meta generation (per 10 URLs): 8 AI credits` covers both title and description. This implies a bulk rate of 0.8 AI credits per URL for both fields combined vs. 2 AI credits per URL individually — a 60% discount that may not be intentional and creates an incentive to always use bulk mode even for single URLs. Similarly, `CREDIT_COSTS` in Section 6.4 defines `ai_meta_title: 1` and `ai_meta_description: 1` as separate actions but `ai_meta_bulk: 8` is ambiguous about whether it covers both fields per URL. **Recommendation:** Clarify whether bulk meta generation covers title + description in one action. If so, price it at `10 URLs × 2 actions × 0.8 = 16 AI credits` or adjust the individual price to `0.5 AI credits` per field to make bulk pricing coherent.

- **[REQ-01-m02]** Section 3.4 — `credit_balances` Missing Storage Tracking Field: Section 7.8 explicitly states "Storage usage tracked in `credit_balances` document (add `storageUsedBytes` field)" but the `credit_balances` schema definition in Section 3.4 does not include `storageUsedBytes`. This is a schema/spec mismatch that will cause implementation confusion. **Recommendation:** Add `storageUsedBytes: number` to the `credit_balances` schema in Section 3.4. Also clarify the mechanism by which storage is decremented — when a file is deleted, does the backend automatically recalculate storage usage? Add a note or separate requirement for storage tracking updates.

- **[REQ-01-m03]** Section 2.2.3 — Auto-Refill Cap of 3 Per Month is Ambiguous: The auto-refill feature caps at "3 auto-purchases per month" (Section 2.2.3, Section 5.2.2). It is not defined whether this cap resets on the billing date, the calendar month start, or a rolling 30-day window. For a user whose billing date is the 15th, a calendar-month reset is different from a billing-period reset. Additionally, the cap is described as being "to prevent runaway costs" but the user has already provided payment authorization — the cap protects the platform's credit cost exposure, not the user's wallet. This framing should be made transparent to users. **Recommendation:** Specify in Section 2.2.3 that the auto-refill count resets on the billing period start date (aligned with credit resets), not the calendar month. Update the UI copy in Section 5.2.2 to reflect this. Also add a clear warning to users that auto-refill charges will appear on their payment method.

- **[REQ-01-m04]** Section 5.1.2 — Pricing Page CTA Logic for Authenticated Users Incomplete: Section 5.1.2 defines CTA button states for authenticated users: "Upgrade to [Tier Name]" for lower tiers and "Current Plan" (disabled) for the current tier. It does not define the CTA state for a higher-tier user viewing a lower-tier card (e.g., an Agency user viewing the Freelance card). "Downgrade" is functionally different from "Upgrade" and should not silently link to `/register?tier=freelance` or be left as a blank/disabled state. Also, no CTA behavior is defined for users with `subscriptionStatus: 'past_due'`, `'paused'`, or `'canceled'`. **Recommendation:** Add a complete CTA state matrix to Section 5.1.2 covering all combinations of: current tier vs. viewed tier, and subscription status. At minimum: higher-tier viewing lower-tier card should show "Downgrade" (links to `/app/billing/plans`); past_due users should see "Update Payment" prominently; paused users should see "Resume Plan."

- **[REQ-01-m05]** Section 9 — No User Story for Credit Reset Notification: The system resets monthly credits on the billing date, which is a significant user-facing event. Users need to know their credits have reset so they can plan their usage. There is no user story for notifying users of credit resets (either in-app or via email), nor is there a story for a "low credit warning" notification when a user approaches exhaustion. These are critical engagement touchpoints that prevent churn by keeping users informed before they hit a hard stop. **Recommendation:** Add a Story in Batch 6 or Batch 2: "As a subscriber, I want to receive a notification when my monthly credits reset and when my credits fall below 20%, so that I can plan my usage and avoid interruptions." This covers both in-app notification (SubscriptionBanner variant) and transactional email.

- **[REQ-01-m06]** Section 4.4.2 — Upgrade Proration UX is Underspecified: The `/api/subscriptions/upgrade` endpoint returns `prorationAmount` in the response, but Section 5.4 (Plan Management Page) only mentions showing "prorated cost" without defining how this is surfaced to the user before they click Confirm. A user upgrading from Client Side ($99) to Agency ($299) mid-cycle could face an immediate charge of $150–$200 that they did not anticipate. The confirmation modal must clearly show the exact amount to be charged immediately, not a generic "prorated cost" label. **Recommendation:** Add an AC to Story 5.4 requiring: (a) a preview API call that calculates proration before the user confirms, (b) the confirmation modal must display the exact dollar amount to be charged immediately alongside the new recurring amount, and (c) a line-item breakdown (credit for remaining days on old plan, charge for remaining days on new plan) consistent with how Stripe presents this on invoices.

---

### Suggestions (Consider for future)

- **[REQ-01-S01]** Section 2.1 — Consider a "Teams Add-On" for the Freelance Tier: The Freelance tier is a single-seat plan, but independent consultants frequently work with contractors, virtual assistants, or part-time specialists who need read-only or limited access. Currently the only path to multi-seat access is the Agency tier at $299/month — a $150/month jump that many freelancers won't take solely for team access. Consider a Freelance + Teams add-on ($30–50/month for 2–3 additional seats) that unlocks basic team collaboration without full Agency positioning. This would add an upsell revenue stream and create a more natural upgrade path to Agency.

- **[REQ-01-S02]** Section 2.2.3 — Consider a Usage-Based Pricing "Overflow" Model for Agency: The Agency tier's current model provides 5,000 standard and 1,500 AI credits at $299/month. Heavy agency users who hit overage will pay $0.10/standard and $0.30/AI, making the effective per-unit cost higher than if they had just bought Mega packs ($200 for 2,000 standard + 500 AI = $0.10/standard, $0.40/AI). The overage pricing is only marginally better than pack pricing for Agency users, reducing the incentive to prefer overage over packs. Additionally, there is no custom Enterprise tier for agencies with very high volume. Consider either: (a) adding an Enterprise/Custom tier ("Contact us for pricing") with a dedicated landing page and lead capture form, or (b) offering a volume discount on overages above 10,000 credits/month to reward heavy usage and prevent churn to purpose-built alternatives.

- **[REQ-01-S03]** Section 8.7 — Expand Alerting to Include Conversion Funnel Monitoring: The current alerting table (Section 8.7) focuses on churn, payment failures, and abuse detection — all lagging indicators. Missing from the alerting system are leading indicators of conversion health: (a) registration-to-checkout abandonment rate exceeding 40%, (b) free tier users who have consumed >80% of their credits (prime upgrade candidates who should receive targeted prompts), (c) nonprofit verification queue aging beyond 3 business days (SLA breach risk). Adding these to the admin alerting system enables proactive growth management rather than purely reactive operations management.

- **[REQ-01-S04]** Section 5.1 — Add Social Proof and Trust Signals to the Pricing Page: The pricing page specification (Section 5.1) includes tier cards, comparison table, credit explainer, FAQ, and a CTA — all functional elements. It does not include any social proof (testimonials, customer logos, case studies) or trust signals (money-back guarantee, security badges, cancellation policy statement). For a product introducing monetization to a previously free user base, trust signals are disproportionately important at the pricing page moment. **Recommendation:** Add a "Trusted by" logo band or testimonials section between the pricing cards and the comparison table. At minimum, add a brief trust statement beneath each paid tier CTA button: "Cancel anytime. No long-term contract."

- **[REQ-01-S05]** Section 1.3 — Define Explicit Revenue Targets and Success Metrics: The Overview & Goals section defines four qualitative goals but no quantitative success criteria. Without measurable targets, the implementation team cannot prioritize trade-offs and leadership cannot evaluate whether the monetization launch succeeded. **Recommendation:** Add a Section 1.4 "Success Metrics" that defines: (a) target MRR at 30/60/90 days post-launch, (b) free-to-paid conversion rate target (industry benchmark: 2–5% for PLG SaaS), (c) monthly churn rate ceiling (target: <5%), (d) credit overage revenue as a percentage of total revenue (an indicator of credit ceiling calibration), and (e) nonprofit tier as a percentage of total subscribers (to validate program scope).

---

## New Requirements

The following requirements are missing from the document entirely and should be inserted as new sections or user stories in the locations indicated.

---

**[NEW-REQ-01] Annual Subscription Pricing**
*Suggested location: Section 2.1 (after each tier definition), Section 3.10 (Stripe configuration), Section 5.1.1 (billing toggle), as new Story 3.5 and Story 5.9*

**Annual Billing Option**

Each paid tier (Client Side, Freelance, Agency, Nonprofit) must offer an annual billing option at a 17% discount (equivalent to 2 months free). Annual plans are billed upfront for 12 months.

| Tier | Monthly Price | Annual Price (per month) | Annual Total | Savings |
|------|--------------|--------------------------|--------------|---------|
| Client Side | $99/month | $82/month | $984/year | $204/year |
| Freelance | $149/month | $124/month | $1,488/year | $300/year |
| Agency | $299/month | $249/month | $2,988/year | $600/year |
| Nonprofit | $49/month | $41/month | $492/year | $96/year |

**Requirements:**
- The public pricing page must include a monthly/annual billing toggle. The annual option must display the per-month price and total annual charge clearly.
- The Stripe configuration must include annual Price IDs for all four paid tiers.
- The `subscriptions` Firestore collection `interval` field must support `'year'` in addition to `'month'`.
- Annual subscribers do not receive prorated refunds on downgrade; instead, their plan changes at the annual renewal date.
- The billing dashboard must clearly indicate the annual renewal date and total amount due.
- Credit allocations for annual subscribers are identical to monthly subscribers (credits reset monthly, not annually).

**Acceptance Criteria (Story 3.5 — Annual Pricing Toggle):**
- [ ] Pricing page includes a toggle: "Monthly | Annual (Save 17%)"
- [ ] Annual toggle state persists within the session
- [ ] Annual pricing cards show per-month price and annual total charge
- [ ] CTA buttons reflect the selected billing interval when calling `POST /api/checkout/create-session`
- [ ] `create-session` endpoint accepts `interval: 'month' | 'year'` parameter
- [ ] Stripe annual Price IDs added to environment variables

---

**[NEW-REQ-02] Free-to-Paid Conversion Triggers and Activation Events**
*Suggested location: Section 1.3 (Key Principles), as new Section 1.4 (Conversion Strategy), new Story 6.6*

**Upgrade Nudge System**

The product must implement a proactive upgrade nudge system for free tier users to drive free-to-paid conversion. Conversion events must be tracked and surfaced to the admin dashboard.

**Defined Activation Events (trigger upgrade nudge within 24 hours of occurrence):**

| Trigger | Nudge Type | Message |
|---------|-----------|---------|
| User consumes 80% of standard credits | In-app banner | "You've used 40 of your 50 free credits. Upgrade for 10x more." |
| User hits credit exhaustion for the first time | Full-screen upgrade prompt | "You've discovered the limit of your free plan." |
| User attempts a feature gated by tier (e.g., Excel export, 2nd project) | Feature-gate modal | "Unlock [Feature] with [Tier Name]." |
| User's audit contains AI-gated insights they cannot see | Blurred AI content with CTA | Preview of AI suggestion with "Unlock AI insights" CTA |
| User has been on free tier for 14 days without upgrading | Email nudge | "Your content strategy work is waiting for more credits." |

**Acceptance Criteria (Story 6.6 — Conversion Nudge System):**
- [ ] `SubscriptionContext` exposes a `recordActivationEvent(eventType)` function
- [ ] All five trigger events above fire the appropriate nudge component
- [ ] Nudges are dismissible and respect a 24-hour cooldown per nudge type (stored in localStorage)
- [ ] Admin dashboard tracks nudge impressions and conversion rate per nudge type
- [ ] Nudge display does not interfere with core tool functionality (never blocks critical UI)

---

**[NEW-REQ-03] Subscription Pause Credit Handling Policy**
*Suggested location: Section 2.2.3, Section 4.4.2 (`POST /api/subscriptions/pause`)*

**Subscription Pause — Credit and Access Policy**

When a subscription is paused:

1. **Credit freeze**: Standard and AI credit balances are frozen at their current remaining values. Credits do not reset during the pause period. Monthly credit allocations do not resume until the subscription is active again.
2. **Bonus pack credits**: Credits from purchased credit packs remain in the user's bonus balance and are accessible when the subscription resumes.
3. **Pause duration limit**: Maximum pause duration is 3 months (91 days). If the user does not resume within 3 months, the subscription is automatically canceled and the user reverts to Basic tier.
4. **Re-activation credit reset**: When a paused subscription resumes, credits reset to the full monthly allocation for the new billing period (not a partial credit for the paused time).
5. **Pause availability**: Pause is available only to subscribers who have been active for at least 30 days (prevents abuse of pause as a trial extension mechanism).

**Acceptance Criteria:**
- [ ] `POST /api/subscriptions/pause` validates that the user has been subscribed for at least 30 days; returns `400: pause_not_eligible` if not
- [ ] `POST /api/subscriptions/pause` records current `creditsRemaining` and `aiCreditsRemaining` at time of pause in the subscription document
- [ ] A background job checks for pauses exceeding 91 days daily and auto-cancels them
- [ ] The billing dashboard displays a countdown: "Your plan is paused. Resumes in X days or auto-cancels in Y days."
- [ ] Resume credit reset behavior documented in `creditService.resetMonthlyCredits`

---

**[NEW-REQ-04] Transactional Email Requirements**
*Suggested location: New Section 11 — Transactional Email System*

**Section 11: Transactional Email System**

### 11.1 Email Provider

Transactional emails are sent via [Provider TBD: recommend Postmark or SendGrid] integrated into the Node/Express backend via `server/src/services/emailService.js`.

### 11.2 Required Email Templates

| Event | Trigger | Recipient | Required Content |
|-------|---------|-----------|-----------------|
| Subscription Confirmed | `checkout.session.completed` | User | Tier name, price, credit allocation, billing date, link to billing dashboard |
| Payment Failed | `invoice.payment_failed` | User | Amount due, payment method, link to update payment method, grace period end date |
| Subscription Canceled | User cancels or admin cancels | User | Effective date, data retention warning, link to resubscribe |
| Subscription Resuming (cancel-before-period-end) | `POST /subscriptions/reactivate` | User | Plan reinstated, next billing date |
| Plan Upgraded | `customer.subscription.updated` (upward) | User | Old plan, new plan, credits added, amount charged |
| Plan Downgraded (scheduled) | `customer.subscription.updated` (downward) | User | Effective date, new plan details, credit reduction |
| Nonprofit Approved | Admin approves | User | Payment link, tier details, verification expiry date |
| Nonprofit Rejected | Admin rejects | User | Rejection reason, re-application instructions |
| Nonprofit Expiring Soon | 30 days before `expiresAt` | User | Re-verification instructions, expiry date |
| Monthly Credit Reset | `invoice.paid` | User (opt-in only) | Credits reset amount, billing period start |

### 11.3 Acceptance Criteria (Story 2.12 — Email Service)

- [ ] Create `server/src/services/emailService.js` with `sendEmail(to, templateId, variables)` function
- [ ] All templates defined in email provider dashboard with template IDs stored as environment variables
- [ ] All billing-critical emails (payment failed, subscription confirmed) are not opt-out
- [ ] Credit reset email is opt-in (default: off); preference stored in user document as `emailPreferences.creditReset: boolean`
- [ ] Email sending failures are logged but do not cause API request failures (non-blocking)
- [ ] Admin can trigger re-send of any email from the subscriber management table

---

**[NEW-REQ-05] Enterprise/Custom Tier — Lead Capture**
*Suggested location: Section 2.1 (after Agency tier definition), Section 5.1 (pricing page), new Story 3.6*

**Enterprise Tier — Contact Sales**

For organizations requiring more than 50 GB storage, more than 15,000 monthly credits, custom SLA, SSO, dedicated onboarding, or custom contract terms, a Contact Sales path must exist on the pricing page.

**Requirements:**
- The pricing page must include an "Enterprise" card after the Agency tier card with: "Custom pricing", "All Agency features", "Custom credit limits", "SSO / SAML", "Dedicated CSM", "Custom SLA", and a "Contact Sales" CTA button.
- "Contact Sales" opens a lead capture modal with fields: Name, Company, Email, Number of team members, Monthly audit volume (estimated), and "What are you trying to accomplish?" free text.
- Lead submissions are emailed to the internal sales address and stored in a `leads` Firestore collection.
- No Stripe integration is required for Enterprise in v1; this is a lead capture only.

**Acceptance Criteria (Story 3.6 — Enterprise Card and Lead Capture):**
- [ ] Enterprise card appears on pricing page with "Contact Sales" CTA
- [ ] Lead capture modal collects all fields above
- [ ] Form submission writes to `leads/{leadId}` Firestore collection with `createdAt`, `source: 'pricing_page'`, and all form fields
- [ ] Submission sends notification email to `sales@[domain]`
- [ ] Success state thanks the user and sets expectation for response time ("We'll be in touch within 1 business day")

---

**[NEW-REQ-06] Cancellation Flow with Retention Intervention (Save Offer)**
*Suggested location: Section 4.4.2, Section 5.4, new Story 5.9*

**Cancellation Retention Flow**

When a user initiates cancellation, the product must present a retention intervention before completing the cancellation. This is a standard SaaS practice that typically retains 15–25% of canceling users.

**Flow:**

1. User clicks "Cancel Plan" in the billing dashboard
2. System prompts: "Before you go — why are you canceling?" with selectable reasons:
   - Too expensive
   - Not using it enough
   - Missing features I need
   - Switching to a different tool
   - Temporary break (I'll be back)
   - Other
3. Based on selection, show a targeted save offer:
   - "Too expensive" → Offer pause option or a one-time 20% discount coupon (configurable via Stripe coupon)
   - "Not using it enough" → Offer pause option with credit freeze
   - "Temporary break" → Offer pause prominently
   - "Missing features" → Show feature roadmap teaser; offer to submit feature request
   - "Switching tools" → Ask what tool; show comparison benefit
4. If user proceeds despite offer: Record cancellation reason in subscription document for churn analysis
5. Show confirmation: plan end date, what access they retain, data retention warning, and an "I changed my mind" button for 48 hours post-cancel

**Acceptance Criteria (Story 5.9 — Cancellation Retention Flow):**
- [ ] Cancellation flow is a multi-step modal, not a single confirmation
- [ ] Cancellation reason is a required selection before confirming
- [ ] Reason is stored in `subscriptions` document as `cancellationReason: string` and `cancellationFeedback: string | null`
- [ ] Save offer is displayed contextually based on selected reason
- [ ] Pause offer links directly to pause modal flow
- [ ] Discount offer (if configured) applies a Stripe coupon to the next invoice; coupon is defined in Stripe Dashboard
- [ ] Admin cancellation report includes reason breakdown
- [ ] Cancellation confirmation email includes "resubscribe" CTA button

---

**[NEW-REQ-07] Credit Pack Purchase Available to Free Tier Users**
*Suggested location: Section 2.2.3, Section 4.4.1, Section 7.4 — Modify feature gate for `creditPacks`*

**Free Tier Credit Pack Access**

Free tier (Basic) users must be permitted to purchase one-time credit packs. Restricting pack purchases to paid subscribers eliminates the most direct monetization path for free users and prevents a "try before you commit" purchase behavior.

**Requirements:**
- Remove the 403 gate on `POST /api/checkout/create-pack-session` for Basic tier users
- Free tier users who purchase a pack receive bonus credits applied on top of their 50 standard / 10 AI monthly allocation
- Pack credits purchased by free users do not expire (consistent with all pack credit behavior)
- After a free tier user purchases their first pack, show an upsell message in the billing dashboard: "You've purchased your first credit pack. Save money and get more credits every month with a subscription."
- The `creditPacks` and `autoRefill` feature gate in Section 7.4 must be updated: `creditPacks` is available to all tiers including Basic; `autoRefill` remains Basic-gated (requiring a payment method on file via subscription to auto-trigger purchases is reasonable)

**Acceptance Criteria:**
- [ ] `POST /api/checkout/create-pack-session` does not reject Basic tier users; removes `403: Free tier users cannot purchase packs` error
- [ ] Free tier users see "Buy Credit Pack" option in billing dashboard with all 3 pack options enabled
- [ ] Post-purchase upsell banner appears for first-time pack purchasers on Basic tier
- [ ] Feature gate table in `useFeatureGate` updated: `creditPacks: []` (no tiers denied)

---

## Modified Requirements

### Modified Requirement 1

**Section:** 2.1 — Freelance Tier Definition
**Issue:** The Freelance tier at $149/month with 1 seat is not sufficiently differentiated from Client Side ($99/month, 1 seat) to justify the 51% price increase for a user who needs only one additional project slot.

**Original text:**
```
#### Freelance — $149/month
- **Seats**: 1
- **Projects/Websites**: Up to 10
```

**Revised text:**
```
#### Freelance — $149/month
- **Seats**: 1 (owner) + 1 collaborator seat (read-only access to all projects)
- **Projects/Websites**: Up to 10

> **Tier positioning note**: The Freelance tier is designed for independent consultants
> managing multiple client accounts. The included collaborator seat allows a client or
> VA to view reports without consuming the owner's seat. The value step from Client Side
> to Freelance is: (1) 10x project capacity, (2) 3x credit allocation, (3) white-label
> exports for client delivery, (4) 1 collaborator seat, and (5) client handoff reports.
> These differentiators must be made explicit in the pricing page comparison table.
```

---

### Modified Requirement 2

**Section:** 4.4.1 — `POST /api/checkout/create-pack-session` Error Codes
**Issue:** The 403 rejection of free tier credit pack purchases is a revenue-blocking policy error (see [REQ-01-M04] and [NEW-REQ-07]).

**Original text:**
```
Errors:
- 400: Invalid pack type
- 401: Not authenticated
- 403: Free tier users cannot purchase packs (must upgrade first)
```

**Revised text:**
```
Errors:
- 400: Invalid pack type
- 401: Not authenticated

Notes:
- Basic (free) tier users ARE permitted to purchase credit packs. There is no tier
  restriction on one-time credit pack purchases.
- After a successful pack purchase by a Basic tier user, the backend should set a flag
  `firstPackPurchasedAt: Timestamp` on the user document to enable upsell targeting.
```

---

### Modified Requirement 3

**Section:** 7.10 — Subscription Status Enforcement (grace period definition)
**Issue:** The 7-day grace period for `past_due` subscriptions before reverting to Basic limits is not defined in terms of what starts the clock. Stripe's `invoice.payment_failed` webhook fires on the first failure, but Stripe also automatically retries payments (typically 3 retries over 7 days by default in the Smart Retries configuration). The current spec would revert users to Basic tier during Stripe's own retry window, causing a degraded experience for users whose payment will succeed on retry.

**Original text:**
```
| `past_due` | Full tier access (grace period: 7 days) | Red banner: "Payment failed. Update payment method." |
| `past_due` (>7 days) | Reverted to Basic limits | Red banner + UpgradePrompt |
```

**Revised text:**
```
| `past_due` | Full tier access (grace period: 14 days from first failure) | Red banner: "Payment failed. Update payment method." |
| `past_due` (>14 days) | Reverted to Basic limits | Red banner + UpgradePrompt |

> **Grace period rationale**: Stripe Smart Retries will attempt payment up to 4 times
> over approximately 8 days. A 14-day grace period ensures users whose payment succeeds
> on retry 3 or 4 never experience a service degradation. The grace period clock starts
> on the `invoice.payment_failed` event timestamp stored in the subscription document
> as `firstPaymentFailedAt: Timestamp`. The daily data retention cleanup job must
> check this timestamp, not a static 7-day window from the current date. Add
> `firstPaymentFailedAt: Timestamp | null` to the `subscriptions` Firestore schema
> in Section 3.3.
```

---

### Modified Requirement 4

**Section:** 2.2.4 — Credit Economics Validation Table
**Issue:** The economics table shows an 87% margin on the Client Side tier based on estimated costs of $12.50 ($5.00 standard + $7.50 AI). However, these estimates assume "average usage patterns" without defining what average means. A user who maximizes their AI credit allocation (150 AI credits × $0.05/credit = $7.50) and standard credits (500 × $0.01 = $5.00) hits exactly the modeled cost. But the model does not account for: (a) actual LLM API cost variance (GPT-4o vs. Claude Sonnet have different per-token costs), (b) users purchasing credit packs (which do not improve margin since they are sold at cost-aligned pricing), or (c) the operational overhead of the new billing infrastructure itself (Node server hosting, Stripe fees at 2.9% + $0.30/transaction).

**Original text:**
```
| Client | $99 | $5.00 | $7.50 | ~87% margin |
```

**Revised text:**
```
| Client | $99 | $5.00 | $7.50 | ~84% gross margin (net of 2.9% Stripe fees: ~$96.13 net revenue) |

> **Cost model assumptions (must be revisited at 90 days post-launch):**
> - Standard credit cost: ~$0.01/credit operational target (hosting, compute)
> - AI credit cost: ~$0.05/credit target; actual cost depends on LLM provider and
>   model selection. Track actual AI API spend vs. usage_events monthly AI credits
>   consumed and adjust the target rate quarterly.
> - Stripe processing fee: 2.9% + $0.30 per transaction reduces net revenue by
>   ~$3.17 on a $99 charge.
> - Infrastructure overhead (Node server, Firebase reads/writes for billing) not
>   included in this table — estimate $50–200/month fixed cost to be amortized
>   across subscriber base.
> - This table should be reviewed and updated in the Admin Revenue Analytics
>   dashboard (Section 8.4) monthly against actual LLM API invoices.
```

---

## Questions & Concerns

1. **Tier naming brand confusion**: The tier name "Client Side" could be confused with the technical term "client-side" (browser-side code) by a developer audience. Was this naming tested with target personas? "Starter" or "Professional" would be less ambiguous. This is a go-to-market concern that should be validated before the pricing page is built.

2. **Overage billing timing**: When do overage charges actually get billed? The document specifies overage is tracked in `standardOverageUsed` and `aiOverageUsed` fields in `credit_balances`, but there is no Stripe metered billing product configured in Section 3.10 and no webhook event defined for overage invoice creation. Is overage billed at month-end as a Stripe invoice line item, or does the platform create a separate charge? This needs a complete technical requirement before Batch 2 implementation.

3. **Content Planner credit gating creates UX inconsistency**: The Content Planner is listed as "No" AI-powered in Section 1.1 and `project_create` costs 1 standard credit. However, the tool is described as a "353-item checklist, project management, team collaboration" tool — gating project creation behind credits means a new free user can create exactly 50 projects before exhausting all credits if they do nothing else. This seems like the wrong credit consumption unit for a planning tool. Should project creation be free and only export/sharing be credit-gated?

4. **What happens to data when a user downgrades from Agency to Basic and has more than 1 project?**: The document covers data retention by time (Section 7.9) but not by tier-imposed limits. If an Agency user with 15 projects downgrades to Client Side (1 project limit), what happens to the other 14 projects? This is a critical data governance and customer trust question with no current answer in the document.

5. **Nonprofit EIN validation**: The nonprofit verification form collects an EIN (Employer Identification Number), but there is no requirement for automated EIN validation against the IRS database or any third-party nonprofit verification service (e.g., Candid/GuideStar). Is this intentional? Manual review of uploaded documents without EIN verification creates a fraud vector where non-nonprofits submit fabricated documentation. What is the planned fraud detection approach?

6. **Is the $0.50/AI credit overage rate for Client Side sustainable?**: At $0.50 per AI credit overage and an estimated $0.05 cost per AI credit, the overage rate appears to have a 10x markup. This is intentional (overages should be expensive to discourage reliance on them), but it should be validated: if a Client Side user routinely hits overage, they are paying $0.50/AI credit on overage vs. upgrading to Freelance at $0.40/AI credit overage or $149/month for 400 AI credits ($0.37/AI credit effective). The math should incentivize plan upgrade over chronic overage. The current numbers do create this incentive, but this should be explicitly documented as a pricing design principle.

7. **Multi-currency support**: The document specifies `currency: 'usd'` hardcoded in the subscription schema (Section 3.3). Is there an expectation to support other currencies in future? If the product has international users, USD-only pricing may create friction. If multi-currency is a future consideration, the schema should use an ISO currency code field rather than hardcoding `'usd'` throughout.

8. **Who owns the Agency tier seat management UI?**: The Agency tier includes "Unlimited seats" and "Full team management — role-based access (existing roles system)" but Batch 7 (Admin Features) does not include any user story for team management within the Agency tier itself (inviting members, assigning roles, removing members). Section 7.7 says the "Invite Team Member" button is hidden for single-seat tiers — but where is the invite flow, role assignment, and member management UI for Agency users? This appears to be an entirely missing user story batch.

---

## Approval Status

**Status: Needs Revision**

**Conditions for re-approval:**

The following Critical findings must be resolved before this document is approved for implementation:

1. **[REQ-01-C01]** Annual pricing strategy must be defined — either fully specified as a v1 requirement or explicitly deferred with a version target and documented conversion impact acknowledgment.

2. **[REQ-01-C02]** The Client Side / Freelance single-seat tier boundary must be redesigned to provide clear, defensible value differentiation that does not rely solely on project count as the primary upgrade driver.

3. **[REQ-01-C03]** A free trial strategy must be defined — either implement a 14-day Freelance trial (recommended) with a dedicated user story, or explicitly document the decision not to offer trials and define alternative activation/conversion mechanisms with measurable targets.

The following Major findings should be resolved in the same revision cycle or addressed with a documented exception and owner assigned:

- [REQ-01-M04]: Free tier credit pack access must be unblocked
- [REQ-01-M05]: Transactional email system must be specified (Section 11 added per [NEW-REQ-04])
- [REQ-01-M03]: Stripe/Firebase account creation race condition must have a defined recovery flow

The five new requirements ([NEW-REQ-01] through [NEW-REQ-07]) and four modified requirements should be incorporated into the document before the next review cycle. Minor findings may be addressed during implementation with no document update required, provided implementation authors are briefed on each issue.