# Lawyer — Requirements Review
**Reviewer:** Lawyer
**Document:** pricing-payments-requirements.md
**Date:** 2026-02-22
**Status:** Complete

---

## Executive Summary

This requirements document describes a well-architected SaaS subscription and billing system, but it contains significant legal gaps that must be addressed before implementation. The most critical deficiencies are the absence of any auto-renewal disclosure mechanism, the lack of a formal refund and cancellation policy, no GDPR/data processing agreement framework governing Stripe as a data processor, and insufficient pre-checkout disclosure requirements. Several of these gaps expose the company to regulatory enforcement risk, particularly under the FTC's Negative Option Rule (16 C.F.R. Part 425), California's Automatic Renewal Law (Cal. Bus. & Prof. Code § 17600 et seq.), and EU/UK consumer protection regulations.

---

## Sections Reviewed

| Section | Focus Level |
|---------|-------------|
| 2.1 — Subscription Tiers | Primary |
| 2.2 — Credit System Design (incl. overage model, auto-refill) | Primary |
| 3.8 — Nonprofit Verifications collection | Primary |
| 4.4.1 — Checkout Endpoints | Primary |
| 4.4.2 — Subscription Endpoints (cancel, pause, upgrade, downgrade) | Primary |
| 4.4.5 — Nonprofit Endpoints | Primary |
| 5.1 — Public Pricing Page | Primary |
| 5.2 — Billing Dashboard | Primary |
| 5.4 — Plan Management Page | Primary |
| 6.1–6.2 — Registration Flow (Scenarios A–D) | Primary |
| 6.4 — Nonprofit Verification Step | Primary |
| 7.9 — Data Retention Enforcement | Primary |
| 7.10 — Subscription Status Enforcement | Secondary |
| 8.3 — Nonprofit Verification Queue | Secondary |
| 8.4 — Revenue Analytics | Secondary |
| 10.6 — Security Considerations | Secondary |
| 3.3–3.9 — Data Models & Firestore Schemas | Secondary |
| 9 — User Stories by Batch | Secondary |

---

## Findings

### Critical (Must fix before implementation)

- **[REQ-04-C01]** Section 6.2 / 5.1 — **Auto-Renewal Disclosure Absent**: The document contains no requirement to present a clear and conspicuous automatic renewal disclosure before the user completes checkout. Under the FTC Negative Option Rule (effective 2024, 16 C.F.R. Part 425), California ARL (Cal. Bus. & Prof. Code §§ 17600–17606), and the EU Consumer Rights Directive (Article 8), the subscriber must be affirmatively told: (a) that the subscription will automatically renew, (b) the renewal amount, (c) the renewal interval, (d) how to cancel, and (e) the cancellation deadline, all before payment is collected. The `PlanConfirmationStep.jsx` component spec (Section 6.2.2, Scenario B) says only "shows what the user will be charged today" — it says nothing about recurring charges or cancellation rights. This is non-compliant. **Recommendation:** Require the `PlanConfirmationStep` and the Stripe Checkout session metadata to include a legally-compliant auto-renewal disclosure block immediately above the payment button, and require affirmative acknowledgment (a separate checkbox, distinct from existing Terms/Privacy checkboxes). The disclosure must survive in a retrievable format (email confirmation with the same terms must be sent within the same session). For California users specifically, the exact renewal price and the words "cancel at any time" with a direct cancellation link must appear.

- **[REQ-04-C02]** Section 4.4.2 / 5.4 — **No Refund Policy Defined Anywhere**: The document makes no reference to a refund policy. This is a critical omission. Under EU Consumer Rights Directive Article 9 (and the UK Consumer Contracts Regulations 2013), consumers generally have a 14-day right of withdrawal from digital service contracts — though this right may be waived if the service begins and the user explicitly agrees. In the US, while federal law does not mandate refunds, the California ARL §17602(a)(3) requires disclosure of refund policy for automatic renewals. Several US states (e.g., New York, Minnesota) impose additional obligations. The document's silence on refunds means: (a) the Terms of Service cannot be complete without this, (b) the pricing page will be deficient under California law, and (c) chargebacks and disputes lack a documented policy basis to contest them. **Recommendation:** Define a refund policy (even if "no refunds" for monthly plans) and require it to be displayed on the pricing page, the plan confirmation step, and in the post-purchase email. For EU/UK users, explicitly document how the 14-day withdrawal right is handled and the waiver language required to defeat it.

- **[REQ-04-C03]** Section 3.8 / 4.4.5 / 6.2 — **Nonprofit Verification: Sensitive PII Collection Without Adequate Data Governance**: The system collects Employer Identification Numbers (EINs), organization names, and scanned government determination letters (IRS 501(c)(3) letters), and stores them in Firebase Storage and Firestore indefinitely. Under GDPR Article 5(1)(e) and (b), personal data must be kept no longer than necessary for the purpose for which it was collected. The schema at Section 3.8 has an `expiresAt` field (1 year from verification) but no corresponding data deletion requirement for the underlying documents — only a status change to `expired`. The uploaded 501(c)(3) determination letters are stored at `nonprofits/{userId}/{filename}` (Section 2.10) with no documented retention limit, deletion procedure, or access control audit trail. Furthermore, EINs are sensitive identifiers; their collection and storage requires disclosure in a privacy policy and, for EU-connected entities, a legitimate interest or contractual necessity basis under GDPR Article 6. **Recommendation:** (1) Add a data retention and deletion requirement for nonprofit documents: uploaded files must be deleted from Firebase Storage when verification status becomes `rejected` (after appeal period) or upon permanent account deletion. (2) Add a requirement that the EIN field is encrypted at rest. (3) Require privacy policy disclosure of nonprofit data collection purposes. (4) Limit admin access to nonprofit documents to a logged, auditable workflow.

- **[REQ-04-C04]** Section 2.2.3 — **Auto-Refill as a Negative Option Feature Without Required Disclosure**: The auto-refill feature (Section 2.2.3, item 3; Section 5.6) is an opt-in automatic purchase mechanism that charges the user's payment method without a real-time purchase decision. This is a "negative option" feature under the FTC Negative Option Rule and Restore Online Shoppers' Confidence Act (ROSCA). The document specifies only a "warning text" at the point of enabling the feature ("Auto-refill will purchase up to 3 packs per month when your balance reaches 0") but does not require: (a) the exact amount that will be charged per trigger, (b) a clear acknowledgment at the moment of enabling (distinct from the general settings save), (c) a mechanism to cancel the auto-refill without canceling the subscription, (d) a pre-charge notification (some state laws require notice before each automatic charge), or (e) a post-charge notification/receipt. The $45/month maximum exposure (3 × $15 Starter Pack) is material. **Recommendation:** The `AutoRefillSettings` component must require a separate explicit acknowledgment at the time of enabling auto-refill that displays the per-charge amount and monthly maximum. A notification email must be sent within 24 hours of each auto-refill charge. The feature must be cancelable at any time from the billing dashboard with immediate effect.

---

### Major (Should fix before implementation)

- **[REQ-04-M01]** Section 1.3 / 10.6 — **GDPR Article 28 Data Processing Agreement with Stripe Not Addressed**: The document states "No on-site card processing — All payment handled by Stripe" but entirely omits any requirement to execute a Data Processing Agreement (DPA) with Stripe. Under GDPR Article 28, where a controller (the company) engages a processor (Stripe) to process EU/EEA personal data, a written DPA is mandatory before processing begins. Stripe offers a standard DPA, but the legal requirement to execute it must appear in the requirements, as must the disclosure of Stripe as a sub-processor in the company's privacy policy. The same obligation applies under UK GDPR and Switzerland's revised Federal Act on Data Protection. The document also routes payment processing through Firebase/Firestore, which also processes personal data (subscription status, customer IDs) — a Google Cloud DPA is similarly required. **Recommendation:** Add a compliance prerequisite requirement that: (1) A Stripe DPA must be executed before go-live, (2) Google Cloud/Firebase DPA must be reviewed and accepted, (3) Stripe must be listed as a named sub-processor in the privacy policy, (4) the privacy policy must be updated to describe payment data flows before the feature launches.

- **[REQ-04-M02]** Section 5.1 / 6.2 — **Pricing Page and Checkout Missing Required Pre-Contractual Disclosures for EU/UK Consumers**: EU Consumer Rights Directive (2011/83/EU) Article 6 and the UK Consumer Contracts Regulations 2013 require that before a consumer is bound by a distance contract for digital services, the trader must provide at minimum: total price including taxes, details of payment arrangements, the minimum duration of the contract, any conditions for early termination, and information about the right of withdrawal (or the waiver thereof). The pricing page spec (Section 5.1) does not require display of: (a) VAT/tax-inclusive pricing for EU/UK users, (b) the total minimum cost of the commitment, (c) the right-of-withdrawal information box. The document also does not address whether pricing shown is tax-exclusive (likely) — this is a legal compliance issue for EU users where displayed prices must include VAT. **Recommendation:** (1) Implement geo-aware pricing display — EU/UK users must see VAT-inclusive prices or a clear "prices exclude applicable taxes" disclosure. (2) Add a pre-checkout EU/UK information box to `PlanConfirmationStep` covering the mandatory Article 6 disclosures. (3) Add a requirement to collect and remit VAT/GST appropriately (Stripe Tax can be configured for this — this requirement should appear in Section 3.10).

- **[REQ-04-M03]** Section 4.4.2 / 5.4 — **Subscription Price Change and Material Modification Notice Requirements Missing**: The document defines subscription management (upgrade/downgrade) but contains no requirement to notify subscribers of price changes or material feature changes to their existing plan. Under California ARL §17602(a)(3) and §17603, if the price of an automatic renewal offer increases, the company must notify the subscriber and provide a mechanism to cancel before the new price takes effect. EU Directive 2019/2161 (Omnibus Directive) similarly requires prior notice of price increases. There is no requirement anywhere in this document for a "price change notification" workflow. **Recommendation:** Add a requirement for a price change notification system: when subscription prices are changed in Stripe, affected subscribers must receive email notice at least 30 days before the new price takes effect (60 days for EU users under some implementations of the Omnibus Directive), with a one-click cancellation link in the notification email. This workflow must be implemented in the backend.

- **[REQ-04-M04]** Section 2.2.2 — **Overage Billing Requires Pre-Charge Disclosure and Cap Mechanisms**: The overage billing system (Section 2.1, overage rates per tier; Section 2.2.3) charges users automatically at $0.10–$0.50 per credit beyond their monthly allocation. The document does not require: (a) a disclosure at the time the user first incurs overage that they are being charged, (b) a monthly overage cap beyond the soft-gate described, (c) a configurable opt-out from overage billing (forcing downgrade or hard-stop instead), or (d) an itemized overage charge on invoices that explains what actions generated the charges. Under FTC guidelines on unfair billing practices and several state consumer protection statutes, undisclosed or uncapped variable charges are a frequent basis for enforcement actions and chargebacks. **Recommendation:** (1) Require a user-acknowledging disclosure the first time a user enters overage territory (a modal/banner that explicitly states the per-credit price and that their saved payment method will be charged on the next invoice). (2) Require an optional hard-cap setting in `AutoRefillSettings` where users can set a maximum monthly overage amount. (3) Require invoice line items to enumerate overage charges by tool/action category, not as a single lump sum.

- **[REQ-04-M05]** Section 3.8 / 8.3 — **Nonprofit Verification and Use of IRS EIN Creates Tax Compliance and Legal Exposure**: The system verifies nonprofit status by accepting 501(c)(3) determination letters and EINs, then applies a 50% discount. The document does not address: (a) what happens if a fraudulent EIN is submitted — the company's exposure for providing a discounted service based on a fraudulent government document; (b) annual re-verification — the document mentions "annual re-verification" in Section 2.1 but the data model shows `expiresAt` with 1 year, yet there is no backend job or workflow specified to actually initiate or enforce re-verification; (c) the legality of applying a blanket discount for non-US nonprofit equivalents — the current model only references "501(c)(3) or equivalent" in Section 2.1 but the verification system (Section 3.8, 4.4.5) only references EIN and 501(c)(3) letters, leaving "equivalent" undefined; (d) the company may need to retain verification records for its own tax purposes (documentation of charitable pricing as a business practice). **Recommendation:** (1) Add a disclaimer at the nonprofit verification step that submission of false documentation may constitute fraud. (2) Add a backend cron job requirement (not currently in the document) that detects and flags expiring nonprofit verifications 60 days before expiry and initiates the re-verification workflow. (3) Define "equivalent" nonprofit status for non-US entities and the accepted documentation. (4) Specify that EINs and verification documents are retained for a minimum of 3 years for tax/audit purposes before deletion.

---

### Minor (Fix during implementation)

- **[REQ-04-m01]** Section 7.9 — **Data Retention Deletion Without User Notice or Export Option**: Section 7.9 specifies a backend cron job that permanently deletes usage data and audit history after the tier's retention period. For Basic users, data may be deleted after just 30 days. The document does not require: (a) advance notice to the user before deletion occurs, (b) an option for the user to export their data before deletion, (c) documentation that deletion is permanent and irreversible. Under GDPR Article 13(2)(a), data subjects must be informed of retention periods. Under GDPR Article 20, data subjects have the right to data portability. While the credit history export (Section 5.5) partially addresses portability, it does not cover project data and audit history subject to deletion. **Recommendation:** Add a requirement that users are notified by email at least 7 days before project or audit data is automatically deleted due to retention policy. Add a data export feature requirement (at minimum, for Basic users nearing the 30-day limit) or clearly document the limitation in the Terms of Service and onboarding.

- **[REQ-04-m02]** Section 5.1.5 — **FAQ Content Creates Implicit Contractual Commitments**: The FAQ section (Section 5.1.5) lists 10 questions including "Can I cancel anytime?" and "Can I pause my subscription?" If these FAQs answer affirmatively (which the underlying feature set suggests they will), they become part of the pre-contractual representation and, in many jurisdictions, are binding on the company. The document does not specify the legal text of FAQ answers, only the questions. An answer to "Can I cancel anytime?" that implies immediate cancellation (rather than end-of-period) would misrepresent the actual behavior (Section 4.4.2 — cancel sets `cancelAtPeriodEnd: true`). **Recommendation:** Require that all FAQ answers be reviewed by legal before implementation, specifically that: (a) "cancel anytime" language must clarify that access continues until period end but no further charges occur; (b) pause functionality must disclose any limitations (e.g., max 3 months as specified in Section 4.4.2); (c) FAQ content must be version-controlled and changes treated as material policy updates.

- **[REQ-04-m03]** Section 6.1 / 6.2.1 — **Existing Policy Acceptance Checkboxes May Be Insufficient for Subscription Agreement**: Section 6.1 notes that the existing registration form includes "Policy acceptance (Terms, Privacy, AI Policy)" checkboxes. For a subscription involving recurring billing, the Terms of Service must specifically incorporate the subscription terms (auto-renewal, cancellation, refund policy, overage billing) to be enforceable. A generic "I agree to the Terms of Service" checkbox that links to a TOS lacking these provisions is insufficient to bind the user to the billing terms. The document does not require the TOS to be updated before implementation, nor does it specify that the subscription-specific terms are incorporated into the existing policy structure. **Recommendation:** Require that the Terms of Service be updated before launch to include a dedicated "Subscription and Billing" section covering: auto-renewal terms, cancellation rights, refund policy, overage charges, credit expiration and non-transferability, price change notice procedures, and dispute resolution. The existing policy acceptance checkbox must link to this updated TOS, or a separate billing-specific acknowledgment must be added.

- **[REQ-04-m04]** Section 2.2.3 — **Credit Pack Terms (Expiration and Non-Transferability) Not Disclosed Pre-Purchase**: Section 2.2.3 states credit packs are "non-expiring until used" and the `credit_packs` schema has no expiration field. However, Section 4.4.2 states free tier users cannot purchase packs. If a user downgrades from a paid tier to Basic, the status of their purchased credit packs is undefined in the document. The credit pack purchase modal (Section 5.2) shows pricing and quantities but does not require disclosure of: (a) whether credits are forfeited on cancellation or downgrade, (b) whether credits are transferable between accounts, (c) what happens to credit pack balances if the service is discontinued. In many jurisdictions, unredeemed value in pre-purchased digital credits is subject to gift card/stored value laws (California Civil Code § 1749.5; EU E-Money Directive). **Recommendation:** (1) Define and document what happens to purchased credit packs upon account cancellation, downgrade, or service discontinuation. (2) Require that the credit pack purchase modal and Terms of Service explicitly disclose non-transferability, the conditions under which credits could be forfeited, and how users can request a refund for unused credit packs if the service is discontinued. (3) Legal counsel should assess whether the credit packs constitute "stored value" subject to state escheatment laws.

---

### Suggestions (Consider for future)

- **[REQ-04-S01]** Section 5.1 / 6.2 — **Accessibility of Billing and Checkout Flows Under ADA/WCAG**: The document's general accessibility requirements reference WCAG 2.2 for the Accessibility Analyzer tool itself, and Story 3.1 notes pricing page should be "Fully responsive and accessible." However, given that courts and the DOJ have increasingly applied ADA Title III to SaaS billing and checkout flows (see *Robles v. Domino's Pizza*, 9th Cir. 2019), the payment and subscription management flows should be explicitly held to the same WCAG 2.2 AA standard as the rest of the application. This is particularly relevant for the modal dialogs (CreditPackModal, UpgradePrompt), which have documented focus trap requirements but no explicit WCAG conformance requirement. Consider adding a formal accessibility conformance requirement to all billing UI components and including billing flows in any VPAT or accessibility statement maintained for the product.

- **[REQ-04-S02]** Section 4.4 / 10.6 — **Dispute Resolution and Chargeback Policy Not Documented**: The document has no requirements around chargeback handling, dispute evidence collection, or internal dispute resolution procedures. Stripe provides chargeback management tooling, but the company needs documented procedures for: (a) what evidence is submitted in response to a chargeback (transaction logs, usage records, the accepted Terms of Service with timestamp); (b) a defined internal SLA for responding to Stripe disputes; (c) a pre-chargeback customer service pathway (a subscriber who cannot easily get a refund will file a chargeback, which costs $15+ per dispute). Consider adding a requirement for a "Billing Dispute" or "Contact Support" pathway on the billing dashboard, and a requirement that the backend logs the Terms acceptance timestamp and IP address at registration for use as dispute evidence.

- **[REQ-04-S03]** Section 3.11 / 10.5 — **Export Control and Sanctions Screening**: The document does not address whether the service will be made available globally and, if so, whether any sanctions screening is applied at checkout. Offering paid SaaS subscriptions to users in OFAC-sanctioned jurisdictions (Cuba, Iran, North Korea, Syria, Crimea) is prohibited under US law regardless of Stripe's own screening. Stripe does perform some OFAC screening, but the responsibility for compliance remains with the company. Consider adding a requirement that: (a) the Terms of Service contain a geographic restriction clause reserving the right to deny service in prohibited jurisdictions; (b) the checkout flow captures billing country and triggers a compliance check for OFAC-listed countries; (c) documentation confirms reliance on Stripe's screening satisfies the company's compliance obligations or that additional screening is performed.

- **[REQ-04-S04]** Section 2.1 / 6.1 — **Children's Privacy (COPPA) Age Gating**: The document makes no reference to age restrictions on account creation or subscription purchases. The platform's tools (content planning, SEO, technical auditing) are oriented toward business users and are unlikely to attract minors, but the free tier accessible without payment introduces at least a theoretical registration path for users under 13. COPPA (15 U.S.C. § 6501 et seq.) imposes strict requirements on services that collect personal data from children under 13, and the billing system adds payment information flows that create additional liability. Consider adding an explicit age attestation checkbox to the registration form ("I confirm I am 18 years of age or older, or 13 years of age or older with parental consent") and a Terms of Service clause prohibiting use by persons under 13 without parental consent.

---

## New Requirements

The following requirements are missing from the document entirely and should be inserted as specified. They are written in the same format and style as the existing document.

---

**Insert after Section 5.1.5 (FAQ Section) as new Section 5.1.7:**

### 5.1.7 Pre-Checkout Disclosure Block

All pricing tier cards and the plan confirmation step must display a legally-compliant auto-renewal and billing disclosure block before any user completes a purchase.

**Required disclosure content (displayed on each paid tier card and on `PlanConfirmationStep`):**

```
By clicking "Confirm & Pay," you authorize Content Strategy Portal to charge
your payment method [price]/month starting today, automatically renewing each
month until you cancel. You may cancel at any time from your Billing Dashboard;
cancellation takes effect at the end of the current billing period and no
further charges will occur. Overages may apply at the rates shown. By
proceeding, you agree to our Terms of Service and Billing Policy.
```

**Acceptance criteria:**
- [ ] Disclosure block is displayed in a minimum 12px font, not greyed-out
- [ ] The exact renewal price (matching the tier price in `TIER_CONFIGS`) is interpolated into the disclosure text programmatically — not hardcoded — to prevent mismatches
- [ ] A separate checkbox labeled "I understand this subscription renews automatically" must be checked before the "Confirm & Pay" button is enabled (this checkbox is distinct from the Terms/Privacy/AI Policy checkboxes in the existing registration form)
- [ ] The disclosure block is rendered in `PlanConfirmationStep.jsx` (Section 6.2.2 / Story 4.1) and is also included in the post-purchase confirmation email
- [ ] For users in California (geo-detected by billing address or browser locale), an additional sentence is appended: "To cancel, visit your Billing Dashboard at [URL] or contact support at [email]."
- [ ] The timestamp and text of the disclosure acknowledged by the user is logged server-side alongside the subscription creation event

**Files:**
- Modify: `src/components/auth/PlanConfirmationStep.jsx`
- Modify: `server/src/services/subscriptionService.js` (log acknowledgment)

---

**Insert as new Section 5.1.8:**

### 5.1.8 Refund and Cancellation Policy Display

The pricing page must include a concise Refund and Cancellation Policy section, linked from the footer of every tier card and from the billing dashboard.

**Policy requirements (minimum content — exact text to be finalized by legal):**

```
Cancellations: You may cancel your subscription at any time. Cancellation takes
effect at the end of your current billing period. You will retain full access
to your plan features until that date. No partial-month refunds are issued for
monthly subscriptions.

Refunds: Refunds are not provided for monthly subscription charges except where
required by law. If you are a consumer in the EU or UK, you have the right to
withdraw from this contract within 14 days of your initial purchase. By
proceeding with your subscription and beginning to use the service, you
acknowledge that the service has begun and agree to waive the right of
withdrawal, as permitted by the Consumer Rights Directive (EU) 2011/83/EU
Article 16(m) and UK Consumer Contracts Regulations 2013 Regulation 28(1)(b).

Credit Packs: One-time credit pack purchases are non-refundable once credits
have been consumed. Unused credits in a credit pack are not refunded upon
subscription cancellation. In the event Content Strategy Portal discontinues the
service, unused credit pack balances will be [refunded pro-rata / honored for
[X] days] — [to be finalized by legal].

Disputes: To dispute a charge, contact support at [email] before filing a
chargeback. We will respond within 5 business days.
```

**Acceptance criteria:**
- [ ] Refund and Cancellation Policy is a named section on the `/pricing` page
- [ ] A link to the full policy is present on `PlanConfirmationStep.jsx` and `BillingDashboard.jsx`
- [ ] The EU/UK withdrawal waiver language is shown to users whose billing country is in the EU/EEA or UK, and their acceptance is logged

**Files:**
- Modify: `src/components/public/PricingPage.jsx`
- Modify: `src/components/auth/PlanConfirmationStep.jsx`
- Modify: `src/components/billing/BillingDashboard.jsx`

---

**Insert as new Section 4.7 (Backend API Specifications):**

### 4.7 Price Change Notification Endpoint

When subscription pricing is updated for an existing tier, affected subscribers must receive advance notice before the new price takes effect on their account.

**POST /api/admin/subscriptions/price-change-notification** *(Admin only)*

Triggers a price change notification campaign for subscribers on a specified tier.

```
Request:
{
  tier: 'client' | 'freelance' | 'agency' | 'nonprofit',
  newPrice: number,          // New price in cents
  effectiveDate: string,     // ISO 8601 — minimum 30 days from now (60 days recommended for EU)
  notificationMessage: string | null  // Optional custom message
}

Response (200):
{
  subscribersNotified: number,
  scheduledEffectiveDate: string,
  notificationsSent: boolean
}

Errors:
- 400: effectiveDate less than 30 days from now
- 403: Not an admin
```

**Behavior:**
- Sends email to all active subscribers on the affected tier with: current price, new price, effective date, and a one-click cancellation link
- Logs notification event in `credit_transactions`-style audit log for each affected user
- Sets a `pendingPriceChange` field on each affected subscription document with the new price and effective date, so that the UI can display a notice banner before the change takes effect

**Acceptance criteria:**
- [ ] Endpoint exists and is admin-only
- [ ] Minimum 30-day notice enforced at the API level (validation error if `effectiveDate` is fewer than 30 days out)
- [ ] Email template includes current price, new price, effective date, and cancellation link
- [ ] `BillingDashboard` displays a notice banner if `pendingPriceChange` is set on the user's subscription

**Files:**
- Create: `server/src/routes/admin.js` (or add to existing admin routes)
- Create: `server/src/services/notificationService.js`
- Modify: `src/components/billing/BillingDashboard.jsx`

---

**Insert as new Section 3.12:**

### 3.12 Compliance Metadata Collection

The billing system must collect and retain certain metadata at the point of subscription creation to support dispute resolution, regulatory compliance, and audit requirements.

**Fields to add to `subscriptions/{subscriptionId}` collection:**

```javascript
{
  // ... existing fields ...

  // Consent and disclosure logging
  autoRenewalDisclosureAcknowledgedAt: Timestamp | null,  // When user checked the auto-renewal acknowledgment checkbox
  autoRenewalDisclosureText: string | null,               // Snapshot of the exact disclosure text shown (for audit)
  tosVersionAccepted: string | null,                      // Version identifier of Terms of Service accepted
  tosAcceptedAt: Timestamp | null,
  ipAddressAtSubscription: string | null,                 // IP at time of subscription creation (for dispute evidence; handle per GDPR)
  billingCountryCode: string | null,                      // ISO 3166-1 alpha-2 country from billing address
  euWithdrawalWaiverAcknowledgedAt: Timestamp | null,     // Timestamp if EU/UK withdrawal waiver was shown and accepted

  // Price change tracking
  pendingPriceChange: {
    newAmount: number,
    effectiveDate: Timestamp,
    notifiedAt: Timestamp
  } | null
}
```

**Acceptance criteria:**
- [ ] All consent timestamps are written by the backend at subscription creation time, not by the frontend (to prevent tampering)
- [ ] IP address collection is disclosed in the Privacy Policy and collected only with appropriate GDPR legal basis (legitimate interest for fraud/dispute purposes)
- [ ] TOS version accepted is written from a server-side constant, not a client-supplied value
- [ ] These fields are write-once from the backend; the Firestore security rules must not permit frontend writes to these fields

**Files:**
- Modify: `server/src/services/subscriptionService.js`
- Modify: `firestore.rules`

---

**Insert as new Section 2.4:**

### 2.4 Credit System Terms of Service Requirements

The Terms of Service and pre-purchase disclosures must explicitly address the following credit system terms. These are legally material and must be disclosed before purchase.

#### 2.4.1 Required Credit Disclosures

The following terms must be disclosed in the Terms of Service and summarized at the point of credit pack purchase:

| Term | Required Disclosure |
|------|-------------------|
| Credit expiration | Monthly subscription credits expire at the end of each billing period and do not roll over. Purchased credit pack credits ("bonus credits") do not expire while the account remains active on a paid tier. |
| Credit forfeiture on cancellation | Upon subscription cancellation, unused monthly credits are forfeited at period end. Unused bonus credits from credit packs purchased within the last 30 days may be eligible for a pro-rated refund [subject to legal review]. |
| Credit forfeiture on downgrade | Upon downgrading to a lower tier, monthly credits are reset to the new tier's allocation at the next billing cycle. Bonus credits from packs are retained. |
| Non-transferability | Credits are non-transferable between accounts and have no cash value. |
| Auto-refill authorization | By enabling auto-refill, the user authorizes the company to charge their payment method up to [N] times per month, at [price] per trigger, when their credit balance reaches zero. |
| Overage billing authorization | By using features that exceed the monthly credit allocation, the user acknowledges that overage charges at the rates specified for their tier will be added to their next invoice. |
| Service discontinuation | In the event the service is discontinued, the company will provide [X] days notice and [refund/honor] unused purchased credit pack balances. |

**Acceptance criteria:**
- [ ] All disclosures in Section 2.4.1 are reflected in the Terms of Service before launch
- [ ] Credit pack purchase confirmation modal links to these terms
- [ ] Auto-refill settings component displays the authorization language in Section 2.4.1

**Files:**
- Modify: `src/components/billing/CreditPackModal.jsx` (add terms link)
- Modify: `src/components/billing/AutoRefillSettings.jsx` (add authorization language)

---

## Modified Requirements

### Modified Requirement 1

**Location:** Section 2.2.3, Item 2 — Credit Packs description
**Issue:** The phrase "non-expiring until used" is stated as a product feature but creates a legal obligation that must be qualified and disclosed fully.

**Original text:**
> **Credit packs** (one-time purchases, non-expiring until used):

**Revised text:**
> **Credit packs** (one-time purchases): Bonus credits from purchased packs do not expire while the user maintains an active paid subscription. Bonus credits are non-transferable and have no cash value. The conditions under which bonus credits may be forfeited (e.g., subscription cancellation, service discontinuation) are governed by the Terms of Service and are disclosed at the point of purchase. For display in UI and marketing materials, the phrase "non-expiring until used" may be used only when accompanied by a link to the full credit terms.

---

### Modified Requirement 2

**Location:** Section 4.4.2 — POST /api/subscriptions/cancel
**Issue:** The endpoint accepts an optional `reason` and `feedback` but has no requirement to send a cancellation confirmation to the user, and no requirement to remind the user of their access expiry date. This is required under the FTC's Negative Option Rule (2024 amendments) which mandates that cancellation must be as easy as sign-up and that a confirmation of cancellation must be provided.

**Original text:**
> **POST /api/subscriptions/cancel**
>
> Cancels the subscription at end of current billing period.

**Revised text:**
> **POST /api/subscriptions/cancel**
>
> Cancels the subscription at end of current billing period. Upon successful cancellation, the backend must send a cancellation confirmation email to the user's registered email address.
>
> **Cancellation confirmation email must include:**
> - Explicit confirmation that the subscription has been cancelled
> - The date on which access will end (`cancelAt`)
> - Confirmation that no further charges will be made after that date
> - A link to reactivate the subscription (POST /api/subscriptions/reactivate)
> - Contact information for billing disputes
>
> This email requirement is mandatory and not optional. Failure to send a cancellation confirmation email is a violation of the FTC Negative Option Rule (16 C.F.R. Part 425.6) and analogous EU/UK requirements.

---

### Modified Requirement 3

**Location:** Section 5.6 — Story 5.6 (Auto-Refill Settings), Acceptance Criteria, "Warning text" item
**Issue:** The "warning text" described is legally insufficient as a disclosure for an automatic recurring charge feature. It must be elevated to a formal authorization disclosure with affirmative acceptance.

**Original text:**
> - [ ] Warning text: "Auto-refill will purchase up to 3 packs per month when your balance reaches 0"

**Revised text:**
> - [ ] Authorization disclosure text (not "warning text" — this is a legally required authorization): Display the following text in a bordered disclosure box immediately above the save/enable button:
>
>   ```
>   By enabling auto-refill, you authorize Content Strategy Portal to
>   automatically charge your saved payment method [PACK_PRICE] (for a
>   [PACK_TYPE] pack: [STANDARD_CREDITS] standard credits + [AI_CREDITS] AI
>   credits) each time your credit balance reaches zero, up to a maximum of
>   3 times per calendar month (maximum [MAX_MONTHLY_CHARGE]/month). You
>   may disable auto-refill at any time from this page with immediate effect.
>   Each auto-refill charge will be confirmed by email within 24 hours.
>   ```
>
> - [ ] A checkbox labeled "I authorize these automatic charges" must be checked before the "Save" button is enabled when auto-refill is being enabled (not required when disabling)
> - [ ] A post-charge email notification is sent to the user within 24 hours of each auto-refill event, itemizing the charge and confirming credits added

---

### Modified Requirement 4

**Location:** Section 6.2 — Story 4.4 (Nonprofit Verification Step), Acceptance Criteria
**Issue:** The nonprofit verification step collects an EIN and a government document without any disclosure about how the data will be used, stored, or shared. This is a GDPR/CCPA compliance gap.

**Original text:**
> - [ ] Form fields: Organization name, EIN (Employer Identification Number)
> - [ ] File upload for 501(c)(3) determination letter (accepts PDF, PNG, JPG; max 10MB)

**Revised text:**
> - [ ] Form fields: Organization name, EIN (Employer Identification Number)
> - [ ] File upload for 501(c)(3) determination letter or equivalent documentation for non-US nonprofits (accepts PDF, PNG, JPG; max 10MB)
> - [ ] A data collection notice must be displayed above the form:
>
>   ```
>   Your organization name, EIN, and uploaded verification document are
>   collected solely to verify eligibility for nonprofit pricing. This
>   information is reviewed by our staff, stored securely, and retained for
>   compliance purposes. We do not share this information with third parties
>   except as required by law. For more information, see our Privacy Policy.
>   ```
>
> - [ ] A checkbox confirming consent to this data collection must be checked before submission
> - [ ] Non-US equivalent documentation: accepted non-US nonprofit equivalents must be defined and communicated to the user (e.g., UK registered charity number + Charity Commission letter; Canadian registered charity number; EU equivalent)
> - [ ] File upload must be scanned for malware server-side before storage

---

## Questions & Concerns

1. **Governing law and jurisdiction**: The document contains no reference to governing law, jurisdiction for disputes, or dispute resolution mechanism (arbitration clause, class action waiver, jurisdiction-specific courts). What jurisdiction will the Terms of Service specify, and has a class action waiver been considered?

2. **VAT/GST and tax remittance**: Does the company intend to use Stripe Tax for automatic tax calculation and remittance, or will it rely on the "prices exclude tax" approach? If the latter, what is the plan for EU VAT OSS (One Stop Shop) registration obligations when EU subscriber revenue exceeds thresholds?

3. **Non-US nonprofit equivalents**: Section 2.1 says "501(c)(3) or equivalent" but no equivalents are defined anywhere. Will the product accept Canadian, UK, EU, or Australian nonprofit documentation? Who makes that determination, and has the admin review workflow been designed to handle non-English documents?

4. **Credit pack stored value / escheatment**: Has legal counsel assessed whether the "non-expiring bonus credits" constitute stored value subject to unclaimed property (escheatment) laws in the applicable states?

5. **Data residency**: Firestore and Firebase Storage are Google Cloud infrastructure. Have data residency requirements been assessed for EU users under GDPR Chapter V (international transfers)?

6. **Cancellation UX — FTC "Simple Mechanism" requirement**: The 2024 FTC Negative Option Rule requires that the cancellation mechanism be "simple" and at least as easy as the sign-up mechanism. Has this been assessed against the FTC's "simple mechanism" standard?

7. **Children's age verification**: No age gate exists. Has the product been assessed for COPPA applicability?

8. **Stripe Customer Portal customization**: Has the team confirmed that the portal's cancellation behavior is consistent with the `cancelAtPeriodEnd` semantics described in this document?

9. **Credit abuse and account termination**: Section 8.7 describes a "credit abuse detection" alert when a user consumes >80% of tier credits in <7 days. What is the intended response, and what process and notice is provided to the user if their account is restricted?

10. **Insurance and liability cap**: SaaS subscription agreements typically include a liability cap tied to subscription fees paid in the preceding 12 months. The Terms of Service must address this, especially given the AI-powered features.

---

## Approval Status

**Needs Revision**

This document is **not approved for implementation** in its current state. The following conditions must be satisfied before implementation begins:

1. **[Condition 1 — Blocking]** A compliant auto-renewal disclosure mechanism (per Finding C01) must be designed, reviewed by legal counsel, and incorporated into the `PlanConfirmationStep` and pricing page before any paid subscription feature is coded.

2. **[Condition 2 — Blocking]** A Refund and Cancellation Policy (per Finding C02) must be drafted, reviewed by legal counsel, and added to the requirements before implementation of the checkout flow begins.

3. **[Condition 3 — Blocking]** The auto-refill feature (per Finding C04) must be redesigned to include a formal authorization disclosure and per-charge notification before that feature is implemented.

4. **[Condition 4 — Blocking for EU/UK launch]** A GDPR data processing agreement with Stripe and Google Cloud/Firebase must be executed, and the privacy policy must be updated before any EU/UK users are permitted to subscribe.

5. **[Condition 5 — Should complete before launch]** Terms of Service must be updated by legal counsel to include a subscription and billing section covering all material terms identified in this review.

**Items approved for parallel development (no blocking issues):**
- Batch 1 (Data Model Foundation) — may proceed subject to incorporating compliance metadata fields from New Requirement 3.12
- Batch 7 (Admin Features) — may proceed
- Pricing page static content — may proceed, but final FAQ answers and policy content require legal review before publication
