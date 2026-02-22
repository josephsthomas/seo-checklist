# Head Legal Counsel — Requirements Review
**Reviewer:** Head Legal Counsel
**Document:** pricing-payments-requirements.md
**Date:** 2026-02-22
**Status:** Complete

---

## Executive Summary

This requirements document describes a commercially substantive pricing, payments, and subscription system for a SaaS platform, incorporating Stripe-based billing, a consumable credit model, nonprofit verification, and tiered access controls. While the document demonstrates strong technical rigor and thoughtful product design, it contains numerous critical legal gaps including the complete absence of terms of service, refund policy, SLA remedy provisions, money transmission analysis, age verification requirements, and data breach notification obligations. The document must not proceed to implementation without the legal deficiencies identified below being addressed, as several create immediate liability exposure under U.S. federal and state law, GDPR, and PCI-DSS standards.

---

## Sections Reviewed

| Section | Focus Level |
|---------|-------------|
| 1. Overview & Goals | Secondary |
| 2. Tier Definitions & Credit System | Primary |
| 3. Data Models & Firestore Schemas | Primary |
| 4. Backend API Specifications | Primary |
| 5. Frontend Components | Primary |
| 6. Registration Flow Updates | Primary |
| 7. Usage Enforcement & Gating | Primary |
| 8. Admin Features & Observability | Primary |
| 9. User Stories by Implementation Batch | Secondary |
| 10. Implementation Notes & Conventions | Secondary |
| Appendix A & B | Secondary |

---

## Findings

### Critical (Must fix before implementation)

- **[REQ-05-C01]** Section 2.1 / Section 5.1 — **SLA Commitments Without Defined Remedies**: The document specifies contractually significant support response-time SLAs (48hr for Client Side, 24hr for Freelance, 12hr for Agency) but contains zero language defining what constitutes a "response," whether these are business hours or calendar hours, and critically, what remedy accrues if the SLA is breached. In most U.S. jurisdictions, a service level advertised on a pricing page and incorporated into a subscription contract is enforceable. Listing SLAs with no accompanying remedy clause creates a scenario where a subscriber who experiences a failure to meet the 12-hour Agency SLA could bring a breach of contract claim for damages extending well beyond the subscription fee. The current framing is also potentially deceptive under FTC Act Section 5 and analogous state consumer protection statutes (e.g., California's Unfair Competition Law, Bus. & Prof. Code § 17200) if the SLA is prominently marketed but unenforceable or aspirational only. **Recommendation**: Define SLA scope (business hours vs. calendar), exclude force majeure events, specify the sole remedy (e.g., service credits at a defined rate capped at one month's subscription fee), and include explicit disclaimer that SLA credits are the subscriber's exclusive remedy for support failures. Add this to both the Terms of Service (see New Requirements) and the pricing page display adjacent to each SLA commitment.

- **[REQ-05-C02]** Section 2.2.3 / Section 6 — **Auto-Refill Constitutes Stored Value / Recurring Charge Without Required Disclosures**: The auto-refill feature (Section 2.2.3) automatically charges the subscriber's payment method up to three additional times per month when credits reach zero. Under the FTC's Negative Option Rule (16 C.F.R. Part 425), as significantly amended in 2023 and effective January 2025, any subscription or automatic recurring charge requires (1) clear and conspicuous disclosure of all material terms before the consumer consents, (2) express informed consent to the negative-option feature, (3) a simple cancellation mechanism, and (4) annual reminders for subscriptions that include a negative option. Auto-refill as described — opt-in, but enabled through a toggle that triggers repeated charges — falls squarely within the FTC's updated Rule. Additionally, several states (California, New York, Delaware, Vermont) impose independent auto-renewal disclosure requirements. California's Automatic Renewal Law (Bus. & Prof. Code § 17600 et seq.) requires distinct acknowledgment checkboxes and post-transaction confirmation emails for any auto-renewing charge. The current spec contains a warning text string ("Auto-refill will purchase up to 3 packs per month") but no required pre-authorization disclosure workflow. **Recommendation**: Require a dedicated authorization flow for auto-refill enabling: display of maximum possible charge per month ($600 for three Mega packs), explicit acknowledgment checkbox referencing the auto-refill terms, post-enablement email confirmation with cancellation instructions, and monthly email summary of auto-refill charges. Add AC to Story 5.6 to implement this workflow.

- **[REQ-05-C03]** Section 2.1 / Section 3.8 — **Nonprofit Verification: Legal Exposure from Fraudulent Claims and Missing Compliance Framework**: The nonprofit tier offers a 50% permanent discount to any entity claiming 501(c)(3) status, verified only by admin review of an uploaded document. This creates several intersecting legal risks. First, EIN verification is entirely manual — the document does not require cross-referencing against IRS Tax Exempt Organization databases (which are public via the IRS TEOS tool and third-party APIs), meaning fraudulent or revoked determinations can pass review. Second, the document stores the EIN field in Firestore with no format validation, no verification against IRS records, and no audit trail of what was verified against what public record. Third, the "annual re-verification" policy is described in the tier definition but is incompletely specified in the data model (Section 3.8 includes an `expiresAt` field but Section 7.9 data retention enforcement does not mention proactively flagging expired nonprofit subscriptions for review or transition). Fourth, there is no anti-fraud representation warranty from the applicant — no affirmative statement that the organization remains a valid 501(c)(3) at the time of application. If a fraudulent actor obtains the discount and later challenges a subscription termination, the company faces a claim that the discount was offered without sufficient contractual basis to revoke. **Recommendation**: (1) Add IRS TEOS API cross-check or equivalent machine-readable EIN verification as part of the nonprofit submission workflow; (2) require a signed affirmative representation and warranty from the applicant that the 501(c)(3) status is current and valid; (3) add contractual right to revoke nonprofit pricing upon discovery of misrepresentation with back-billing for the discount period; (4) ensure the annual re-verification clock triggers a subscription transition workflow (not just a flag) if re-verification is not completed within 30 days of expiration.

- **[REQ-05-C04]** Section 3 / Section 10.6 — **PCI-DSS Scope Ambiguity and Missing SAQ Documentation Requirement**: Section 1.3 and Section 10.6 both state that no raw card data is touched because all payment is handled by Stripe Checkout and the Stripe Customer Portal. This is accurate at the payment capture layer. However, PCI-DSS compliance scope is not eliminated merely by using Stripe; it is reduced. The platform still transmits cardholder data indirectly (Stripe customer IDs, subscription IDs, invoice data), hosts a checkout flow initiation endpoint, and receives webhook events that include metadata about payment instruments. The applicable SAQ (Self-Assessment Questionnaire) would be SAQ A for e-commerce merchants using fully hosted payment pages, provided certain conditions are met. The document contains no analysis of SAQ eligibility, no requirement for an annual SAQ A completion, no mention of maintaining a PCI-DSS Attestation of Compliance, and no mention of the requirement to vet Stripe as a PCI-compliant Service Provider under Requirement 12.8. Additionally, the `invoices` Firestore collection mirrors Stripe invoice data including `hostedInvoiceUrl` and `invoicePdf` — if these are signed Stripe URLs they present no issue, but if any cardholder-visible data beyond URLs is stored, the scope expands. **Recommendation**: (1) Confirm SAQ A eligibility with a PCI-qualified assessor; (2) add a requirement to complete annual SAQ A and maintain the Attestation of Compliance; (3) add Stripe to the company's third-party service provider register with annual confirmation of their PCI compliance status; (4) add a requirement to the data model specification prohibiting storage of any Stripe payment method details (last four digits, expiry, card brand) in Firestore.

- **[REQ-05-C05]** Section 3 / Section 7.9 — **GDPR and CCPA: Data Retention Policy Legally Incompatible with "Unlimited" Retention for Agency Tier**: The Agency tier specifies "Unlimited" data retention (dataRetentionDays: -1), and Section 7.9 states "Agency (unlimited): No cleanup." Under GDPR Article 5(1)(e), personal data must not be kept in a form that permits identification of data subjects for longer than necessary for the purposes for which the data is processed (storage limitation principle). "Unlimited retention" for Agency-tier subscribers' usage data, audit data, and content data is incompatible with this principle and cannot be lawfully offered as a product feature to EU-based users without a documented legitimate basis that would survive regulatory scrutiny. The usage_events collection (Section 3.9) contains userId, action, toolName, resourceId, and metadata — all of which may qualify as personal data under GDPR Article 4(1) when linked to an identifiable individual. Similarly, under CCPA (Cal. Civ. Code § 1798.100 et seq.), a consumer's right to deletion (§ 1798.105) cannot be contractually waived, meaning the company must be able to fulfill a deletion request even for Agency-tier users regardless of the retention "benefit." The document also sets 30-day retention for Basic tier but does not address whether users are notified before deletion, or whether the right to data portability under GDPR Article 20 has been considered. **Recommendation**: (1) Replace "Unlimited" retention with a defined maximum (e.g., 7 years for billing records which are legally required, and a separate product-data retention period); (2) implement a GDPR-compliant right-to-erasure workflow that supersedes tier retention settings; (3) add pre-deletion notification (30 days prior for Basic tier deletions); (4) document the lawful basis for each category of data retained in a Record of Processing Activities (ROPA) as required by GDPR Article 30.

- **[REQ-05-C06]** Entire Document — **Complete Absence of Terms of Service, Refund Policy, and Governing Legal Framework**: The document specifies a full commercial payment system — recurring subscriptions, one-time purchases, overage billing, auto-refill charges, and nonprofit discounts — with zero reference to a Terms of Service agreement, End User License Agreement, or refund/cancellation policy. Section 6.1 notes that the existing registration form includes "Policy acceptance (Terms, Privacy, AI Policy)" checkboxes, but the content of those policies is not specified, and the new billing terms (overage charges, credit expiration, SLA definitions, dispute resolution) are nowhere described. The Freelance tier's "white-label" option raises intellectual property questions (see REQ-05-M02) that require contractual resolution. The absence of a governing agreement means that: (a) overage charges have no contractual basis; (b) the company has no enforceable right to collect for disputed charges; (c) there is no arbitration clause, class action waiver, or limitation of liability provision protecting the company; (d) the nonprofit discount revocation right has no contractual basis; and (e) the credit system's "non-expiring" characterization for pack credits creates an indefinite financial obligation not limited by any contractual term. **Recommendation**: Before any paid tier goes live, a Subscription Terms of Service must be drafted and accepted during the paid-tier registration flow, covering at minimum: subscription terms, auto-renewal, overage billing authorization, credit system terms (non-expiration, forfeiture on account closure), SLA definitions and remedies, limitation of liability, intellectual property, dispute resolution, arbitration clause, class action waiver, and governing law.

- **[REQ-05-C07]** Section 4 / Section 6 — **Age Verification: No Minimum Age Requirement for Entering Into a Paid Contract**: The registration flow (Section 6) collects no date of birth or age verification. Subscription contracts are legally binding agreements. In the United States, contracts entered into by minors (persons under 18) are voidable at the minor's election under the infancy doctrine. If a minor registers, subscribes to a paid tier at $99-$299/month, and then disaffirms the contract, the company must refund all payments with limited recourse. More critically, COPPA (Children's Online Privacy Protection Act, 15 U.S.C. § 6501 et seq.) prohibits the collection of personal information from children under 13 without verified parental consent. The registration flow collects name, email, and potentially usage data — all COPPA-covered categories. The Firebase Auth and Firestore collections make no provision for age-gating. GDPR Article 8 sets the digital consent age at 16 (or 13-16 depending on member state implementation). **Recommendation**: (1) Add a minimum age affirmation (e.g., "I confirm I am 18 years of age or older") to the registration flow; (2) add COPPA/GDPR Article 8 screening — if user indicates they are under 13 (or under 16 for EU users), block registration and do not collect personal data; (3) add age-of-majority contractual representation to the Terms of Service; (4) add to Story 1.2 and Story 4.1 as acceptance criteria.

---

### Major (Should fix before implementation)

- **[REQ-05-M01]** Section 2.1 / Section 5 — **Accessibility Compliance for Payment Flows (ADA / Section 508)**: The document mentions an Accessibility Analyzer tool that generates WCAG 2.2 compliance analysis and VPAT reports for clients' websites, yet the payment and billing flows themselves contain no explicit accessibility requirements. This is legally and reputationally significant: under the Americans with Disabilities Act (ADA) Title III (42 U.S.C. § 12182), places of public accommodation — which federal courts and the DOJ have held includes websites offering commercial services — must provide equal access to persons with disabilities. The Ninth Circuit (Robles v. Domino's Pizza, 2019) and others have consistently held that commercial websites must meet WCAG 2.1 AA at minimum. Story 3.1 includes one passing reference to "accessible" and "ARIA labels" for the pricing page, but the credit pack purchase modal (Story 5.2), auto-refill settings (Story 5.6), plan confirmation step (Story 4.1), and all billing dashboard components lack explicit WCAG-level acceptance criteria. For a company that markets an Accessibility Analyzer, ADA non-compliance in its own payment flow would be particularly damaging reputationally and exposes the company to ADA demand letters (a common litigation strategy in the plaintiff's bar). **Recommendation**: Add explicit WCAG 2.1 AA compliance requirements to all payment-flow components. Acceptance criteria must specify: keyboard-only operability, screen reader compatibility (NVDA/JAWS/VoiceOver), sufficient color contrast ratios (4.5:1 for normal text), focus management in modals, and error identification for form inputs. Commission a VPAT for the billing system prior to launch.

- **[REQ-05-M02]** Section 2.1 / Section 5.1 — **Intellectual Property: Ownership of AI-Generated Content Is Unaddressed**: The platform offers AI-powered generation of meta titles, meta descriptions, alt text, readability rewrites, and competitor analysis. The document contains no terms governing who owns the AI-generated content: the platform, the subscriber, or neither. This creates several risks. First, U.S. copyright law (17 U.S.C. § 102) and the Copyright Office's current policy (as reinforced in Thaler v. Vidal, Fed. Cir. 2022, and subsequent guidance) hold that purely AI-generated content is not copyrightable. If subscribers believe they are receiving copyrightable deliverables and rely on that assumption for their clients' projects (particularly Freelance and Agency users delivering "client handoff reports"), the platform may face claims for misrepresentation. Second, the white-label option for Freelance and Agency tiers allows subscribers to strip the platform's branding from exports — including AI-generated content — and present it as their own work product. The platform should clearly disclaim ownership of, and copyright in, AI outputs, and affirmatively state that the subscriber uses such outputs at their own risk. Third, the AI policy referenced in the existing registration flow is not defined in this document; it must be updated to address these generation features. **Recommendation**: (1) Add an AI output disclaimer to the Terms of Service and display it as inline disclosure adjacent to each AI-powered action button; (2) specify in the Terms that AI-generated outputs are provided "as-is" without warranty of accuracy, originality, or non-infringement; (3) clarify that the platform claims no ownership of AI outputs but makes no representations about the subscriber's ability to assert copyright; (4) prohibit use of AI outputs in contexts where copyright ownership is legally required (e.g., copyright registration applications).

- **[REQ-05-M03]** Section 3.9 / Section 8 — **GDPR / CCPA: Usage Event Data Contains Personal Data With No Purpose Limitation or Access Controls**: The `usage_events` collection (Section 3.9) stores userId, action, toolName, resourceId, metadata, and processingTimeMs for every tool action across all users. Section 3.9 states "Only backend can read and write (admin analytics)." The admin dashboard (Section 8.5) then exposes this data for "top consumers" analysis and "abuse detection." Under GDPR Article 5(1)(b), personal data must be collected for specified, explicit, and legitimate purposes and not further processed in a manner incompatible with those purposes (purpose limitation). The collection of granular per-action usage telemetry must be disclosed to users in a privacy notice with a stated lawful basis. If the lawful basis is legitimate interests (Article 6(1)(f)), a legitimate interests assessment (LIA) must be conducted and documented. Under CCPA § 1798.100, consumers have the right to know what categories of personal information are collected and for what purposes. The current document makes no provision for privacy notice disclosure of usage tracking, user-accessible usage data requests, or the deletion of usage_events records in response to GDPR Article 17 deletion requests. Additionally, the admin "top consumers" feature (Section 8.5) enables profiling of individual users — a processing activity that under GDPR Article 22 requires specific safeguards if it produces significant effects. **Recommendation**: (1) Add privacy notice disclosure requirements for usage event collection; (2) define retention periods for usage_events separate from product data (recommend 13 months maximum for analytics purposes); (3) include usage_events in the right-to-erasure workflow; (4) document the lawful basis for usage tracking in the ROPA; (5) if the "top consumers" feature is used for automated decision-making (e.g., account suspension), add GDPR Article 22 safeguards.

- **[REQ-05-M04]** Section 4 / Entire Document — **Data Breach Notification Requirements Are Completely Absent**: The system stores payment-related data including Stripe customer IDs, subscription IDs, invoice records, and indirect links to payment methods, alongside personal data (name, email, EIN for nonprofits, uploaded 501(c)(3) documents). The document has no breach notification plan, no specification for breach detection, and no reference to applicable notification obligations. Under GDPR Article 33, a personal data breach must be reported to the relevant supervisory authority within 72 hours of becoming aware of it. Under GDPR Article 34, if the breach is likely to result in high risk to individuals, they must be notified without undue delay. Under U.S. law, all 50 states have breach notification statutes; California's CCPA § 1798.150 creates a private right of action for breaches of certain categories of personal information. The nonprofit EIN uploads (Section 3.8) in particular constitute sensitive financial identifiers whose exposure could trigger notification obligations under multiple state laws. Firebase Storage paths for uploaded documents are stored in Firestore — if this storage is misconfigured, document URLs could be exposed. **Recommendation**: (1) Add a data breach incident response plan to the implementation requirements, specifying detection, containment, and notification workflows; (2) add Firebase Storage security rules for the `nonprofits/{userId}/` path to ensure documents are not publicly accessible; (3) add logging and alerting for unauthorized data access attempts to the admin observability requirements (Section 8.7); (4) add a breach notification clause to the Terms of Service; (5) consider cyber liability insurance requirements as a business recommendation.

- **[REQ-05-M05]** Section 2.2.3 / Section 4.4.3 — **Financial Regulation: Credit System May Constitute Stored Value / Money Transmission in Certain Jurisdictions**: The credit pack system allows users to purchase non-expiring credits (Starter: $15, Pro: $60, Mega: $200) that are stored in the platform's Firestore database and consumed over time. The auto-refill feature creates a mechanism for the platform to hold up to $600 in pre-purchased credit value per user per month. While the credits are platform-specific and cannot be transferred, cashed out, or redeemed for currency, several U.S. states have broad stored-value or money transmission statutes that could apply. California's Money Transmission Act (Cal. Fin. Code § 2000 et seq.), New York's Banking Law Article 13-B, and Washington's Uniform Money Services Act have all been applied to platform-specific stored value in certain regulatory contexts. Additionally, if the platform were to allow credit transfers between users (not currently specified but architecturally possible given the credit_balances schema), money transmission licensing would likely be required in most states. The EU's Payment Services Directive (PSD2) and Electronic Money Directive (EMD2) impose similar requirements in Europe. **Recommendation**: (1) Obtain a legal opinion from a financial services attorney on whether the credit system requires money transmission licensing in the platform's operating jurisdictions; (2) explicitly prohibit credit transfers between users in the Terms of Service and in the data model (no transfer endpoint should ever be added without legal review); (3) add a credit forfeiture-on-account-closure clause to limit the platform's liability for stored credit balances; (4) consider whether the non-expiring nature of pack credits creates a gift card regulatory obligation under state unclaimed property (escheat) laws, particularly California's Unclaimed Property Law (Cal. Code Civ. Proc. § 1520 et seq.).

- **[REQ-05-M06]** Entire Document — **Export Controls and OFAC Sanctions Compliance Are Completely Absent**: The platform offers SaaS services globally via a public URL, cloud infrastructure (Firebase/Google Cloud), and Stripe payments. The platform provides AI-powered tools and collects usage data — categories of technology and data with potential export control implications. Under U.S. Export Administration Regulations (EAR, 15 C.F.R. Parts 730-774), SaaS platforms providing certain software or technology may require Export Control Classification Number (ECCN) analysis. More immediately, the Office of Foreign Assets Control (OFAC) administers sanctions programs (31 C.F.R. Parts 500-598) that prohibit providing services to persons or entities in sanctioned countries (Cuba, Iran, North Korea, Russia/Ukraine occupied territories, Syria, among others) and to Specially Designated Nationals (SDNs). Stripe performs OFAC screening on payment transactions, but the platform itself must ensure it does not onboard sanctioned users prior to payment (e.g., free tier users who never pay). The registration flow collects no country information, performs no IP-based geolocation screening, and conducts no SDN list screening. The nonprofit verification flow accepts EINs from any entity globally, creating a sanctions exposure vector. **Recommendation**: (1) Add country/jurisdiction collection to the registration flow; (2) implement OFAC SDN list screening (or use a third-party service) at registration and at subscription creation; (3) add a geographic restriction clause to the Terms of Service prohibiting use from sanctioned jurisdictions; (4) conduct an EAR/ECCN classification analysis for the AI features; (5) add IP-based geolocation blocking for sanctioned jurisdictions as a technical control.

- **[REQ-05-M07]** Section 4.4.2 / Section 2.1 — **Dispute Resolution, Arbitration Clause, and Class Action Waiver Are Missing**: The document describes a payment system that will generate financial disputes — failed payments, disputed overages, credit balance disagreements, and rejected nonprofit applications. There is no reference to a dispute resolution mechanism, mandatory arbitration clause, class action waiver, or jurisdiction/venue provision anywhere in the document. In the SaaS industry, these are standard and legally significant provisions. Class action waivers and mandatory arbitration clauses (enforceable under AT&T Mobility LLC v. Concepcion, 563 U.S. 333 (2011)) are the primary mechanism by which SaaS platforms limit their aggregate legal exposure from subscriber disputes. Without these provisions, a group of subscribers experiencing similar issues (e.g., disputed overage charges, SLA failures, credit calculation errors) could form a class. The credit transaction ledger (Section 3.5) and auto-refill feature (Section 2.2.3) are particularly high-risk for class claims given their automated nature. **Recommendation**: (1) Add mandatory arbitration clause (JAMS or AAA rules) with individual claims only (class action waiver) to the Terms of Service; (2) specify California or Delaware as governing law and jurisdiction (where the company presumably operates); (3) add a pre-dispute notice-and-cure period (30 days) before arbitration may be initiated; (4) add a small claims court carve-out (disputes under $10,000); (5) ensure the arbitration clause complies with California AB 3228 and any applicable state-specific arbitration restrictions.

---

### Minor (Fix during implementation)

- **[REQ-05-m01]** Section 5.1.6 — **SEO Structured Data May Constitute a Price Representation With Legal Implications**: The specification requires JSON-LD `Product` schema with "pricing offers" on the public pricing page. Structured data price representations are machine-readable and crawlable by search engines, which will display them in rich search results. Under FTC guidelines on digital advertising, pricing displayed in search results (including via structured data) constitutes an advertising claim and must be accurate at all times. If prices change and the JSON-LD is not updated simultaneously, the platform may display outdated pricing in Google search results, creating a potential deceptive advertising exposure. Additionally, if prices vary by jurisdiction (e.g., VAT applied for EU users, different pricing for different markets), the structured data must reflect the conditions of the offer. **Recommendation**: (1) Add a requirement that the pricing page JSON-LD is generated dynamically from `TIER_CONFIGS` (not hardcoded); (2) add a requirement for a price-accuracy audit in the deployment checklist; (3) add a "prices subject to change" disclosure on the pricing page; (4) if international pricing is ever introduced, ensure the structured data uses currency-specific offer representations.

- **[REQ-05-m02]** Section 3.8 / Section 5.6 — **EIN Storage Constitutes Sensitive Tax Identifier Data Requiring Enhanced Protection**: The `nonprofit_verifications` collection stores Employer Identification Numbers (EINs) in Firestore. While EINs for 501(c)(3) organizations are technically public (listed on IRS Form 990), storing them in an application database alongside organization names, user IDs, and uploaded documents creates a data classification issue. Under several state data protection laws, tax identification numbers (including EINs when used in conjunction with other identifiers) are classified as sensitive personal information requiring additional safeguards. California's data breach statute (Cal. Civ. Code § 1798.81.5) specifically lists tax identification numbers as requiring "reasonable security." The document does not specify encryption-at-rest requirements for the `nonprofit_verifications` collection or for the Firebase Storage uploaded documents. **Recommendation**: (1) Classify EIN data as sensitive and require field-level encryption or at-rest encryption confirmation for the `nonprofit_verifications` collection; (2) confirm Firebase Storage's encryption-at-rest settings for uploaded 501(c)(3) documents; (3) limit admin access to EIN data using Firebase IAM role restrictions; (4) add EIN to the list of data categories in the privacy notice.

- **[REQ-05-m03]** Section 8.8 — **Admin Data Export May Violate GDPR Data Minimization in PII-Inclusive CSV Exports**: Section 8.8 specifies admin exports including a subscriber list CSV with an "option to include/exclude emails." Including user PII in bulk admin exports creates risks under GDPR Article 5(1)(c) (data minimization) and Article 32 (security of processing). Bulk PII exports are a common vector for data breaches (insider threat, misconfigured storage of export files). The export mechanism is described without any access logging, download tracking, or data handling requirements for the exported files. **Recommendation**: (1) Add access logging for all admin PII export operations (who exported, what data, when, from which IP); (2) require exports containing PII to be password-protected or encrypted; (3) add a data retention requirement for exported files (auto-delete from any server-side storage within 24 hours); (4) add a "minimum necessary" principle requirement so exports default to anonymized/pseudonymized data with PII as an explicitly authorized option requiring additional confirmation.

- **[REQ-05-m04]** Section 7.9 — **Data Deletion Workflow for Basic Tier (30-Day Retention) Does Not Include User Notice or Portability Window**: Section 7.9 specifies that a daily background job deletes usage_events and tool-specific data older than the user's retention period, with Basic tier set to 30 days. There is no requirement for advance notice to users before their data is deleted, no data portability window, and no mechanism to contest or halt a deletion in progress. Under GDPR Article 20 (right to data portability), users must be able to receive a copy of their personal data before it is deleted. Under GDPR Recital 39, users should have information about retention periods. Deleting a Basic user's 28-day-old audit history without warning could cause a dispute, particularly if the user believed their data was available for the full "30 days" and the deletion ran slightly early due to timing drift. **Recommendation**: (1) Add a pre-deletion notification requirement (email at 7 days before deletion threshold); (2) add a data export/portability feature allowing Basic users to download their data before it is deleted; (3) specify that the retention clock is based on the last user interaction with the data (not just data creation date) to avoid premature deletion of actively viewed data; (4) add a 7-day grace period between the notification and actual deletion.

---

### Suggestions (Consider for future)

- **[REQ-05-S01]** Section 2.1 / Section 4.4.2 — **Force Majeure and Service Outage Provisions**: The document makes no provision for force majeure events or extended service outages that prevent users from utilizing their monthly credit allocation. Consider adding a contractual force majeure clause and an operational policy for credit rollover or extension when service outages exceed a defined threshold (e.g., 4+ hours). This is particularly important for Agency-tier subscribers paying $299/month who rely on the platform for client deliverables. This should be addressed in the Terms of Service and referenced in the SLA section of the pricing page. Competitors in the SaaS space commonly offer "service credits" for verified downtime that exceeds SLA commitments.

- **[REQ-05-S02]** Section 8 / Section 3.9 — **Subscriber Profiling and Anti-Discrimination Compliance**: The admin dashboard (Section 8.5) enables identification of "top consumers" and "credit abuse detection." While operationally useful, automated profiling systems that result in account actions (suspension, rate limiting) must not operate in a manner that disparately impacts protected classes. Consider adding documentation requirements for any automated account action taken on the basis of usage data, a human review requirement before any account suspension based on "abuse detection," and a subscriber notice and appeal process. This becomes legally relevant if the platform grows to scale and automated decisions affect a significant user population.

- **[REQ-05-S03]** Section 6 / Section 5 — **Cookie Consent and ePrivacy Compliance**: The document does not address cookie consent, pixel tracking, or analytics data collection on the public pricing page or registration flow. The pricing page (public, accessible to EU users) will presumably use analytics (Firebase Analytics or similar) and may load third-party scripts (Stripe.js). Under the EU ePrivacy Directive (Cookie Directive) and GDPR, non-essential cookies and tracking technologies require prior informed consent. Stripe.js, in particular, sets cookies for fraud detection that may require consent disclosure under strict interpretations. Consider adding a cookie consent management platform (CMP) requirement to the frontend implementation, particularly for the public pricing page which is accessible to unauthenticated EU visitors.

- **[REQ-05-S04]** Section 2.2.3 / Section 3.6 — **Unclaimed Property / Escheat Law Compliance for Non-Expiring Credit Packs**: Pack credits are described as "non-expiring until used." Under unclaimed property laws in most U.S. states (and many international equivalents), stored monetary value that goes unclaimed for a defined period (typically 3-5 years) must be remitted to the state. California's Holder Reminder Notice Law and Unclaimed Property Law (Cal. Code Civ. Proc. § 1500 et seq.) apply to stored value with a face value over $10. The Mega Pack ($200) clearly exceeds this threshold. Consider consulting an unclaimed property attorney to determine whether pack credits constitute reportable property, and if so, implement dormancy tracking in the `credit_packs` collection and an unclaimed property reporting workflow. Alternatively, adding a contractual expiration date to pack credits (e.g., 2 years from purchase) may reduce exposure under most states' escheat laws.

---

## New Requirements

*The following requirements are written to match the style and format of the original document and should be inserted into the sections indicated.*

---

**Insert into Section 2: Tier Definitions & Credit System, as new subsection 2.4**

### 2.4 Legal Terms and Subscriber Agreements

#### 2.4.1 Subscription Terms of Service

All users who subscribe to a paid tier (Client Side, Freelance, Agency, or Nonprofit) must affirmatively accept a Subscription Terms of Service (ToS) before or at the point of payment. The ToS must be a discrete acceptance event separate from the general site Terms of Service and must cover:

- Subscription term, auto-renewal terms, and cancellation policy
- Overage billing authorization (explicit acknowledgment of per-credit overage rates)
- Auto-refill authorization if enabled (including maximum monthly charge disclosure)
- Credit system terms: non-expiration of pack credits, forfeiture policy on account closure
- SLA definitions, measurement methodology, and sole remedy for SLA failure (service credits)
- Limitation of liability (cap at subscription fees paid in the prior 12 months)
- Indemnification (subscriber indemnifies platform for third-party claims arising from subscriber's use of AI outputs)
- Intellectual property and AI output disclaimer
- Dispute resolution, mandatory arbitration, and class action waiver
- Governing law and jurisdiction

**Implementation note**: The ToS acceptance must be recorded as a timestamped event in the user's Firestore document (`tosAcceptedAt: Timestamp`, `tosVersion: string`). A new ToS version requires re-acceptance at next login for affected users.

#### 2.4.2 Auto-Refill Pre-Authorization Disclosure

Before enabling auto-refill, the user must complete a dedicated authorization flow that:

1. Displays the selected pack type, price per purchase, and maximum monthly charge (e.g., "Up to 3 × $200 = $600/month")
2. Requires an explicit acknowledgment checkbox: "I authorize Content Strategy Portal to automatically charge my payment method for credit pack purchases as described above"
3. Provides a one-click cancellation link in the authorization confirmation email
4. Sends a post-enablement email confirmation within 24 hours including the authorization terms and cancellation instructions
5. Sends a monthly summary email whenever one or more auto-refill purchases occurred, itemizing dates and amounts

#### 2.4.3 Nonprofit Applicant Representation and Warranty

As part of the nonprofit verification submission (Section 4.4.5), the applicant must affirmatively check a declaration:

> "I represent and warrant that [Organization Name] is a valid 501(c)(3) organization in good standing with the IRS as of the date of this application, that the determination letter uploaded is authentic and has not been revoked, and that I am authorized to make this representation on behalf of the organization. I understand that providing false information to obtain a discounted rate constitutes material misrepresentation and that Content Strategy Portal reserves the right to terminate the nonprofit subscription and recover the discount amount applied during any period of ineligible status."

This declaration must be stored with the `nonprofit_verifications` document as a boolean `applicantDeclarationAccepted: boolean` and `applicantDeclarationAt: Timestamp`.

---

**Insert into Section 6: Registration Flow Updates, as new subsection 6.5**

### 6.5 Age Verification and Eligibility Requirements

#### 6.5.1 Minimum Age Requirement

The registration form (`src/components/auth/RegisterForm.jsx`) must include an age eligibility affirmation as a required checkbox on the account creation step:

> "I confirm that I am at least 18 years of age (or the age of majority in my jurisdiction, if higher) and that I have the legal capacity to enter into a binding contract."

- This checkbox must be required for all registration paths including Google OAuth
- The affirmation must be recorded in the Firestore user document as `ageConfirmedAt: Timestamp`
- If the user does not check the box, registration must be blocked
- The registration form must include a separate disclosure: "This service is not intended for persons under 18. If you are under 18, you may not register for this service."

#### 6.5.2 COPPA Compliance Screening

To comply with the Children's Online Privacy Protection Act (COPPA) and GDPR Article 8:

- The registration form must not collect any personal information (including email address) before the age eligibility affirmation is presented and accepted
- If the platform detects signals indicating a user may be under 13 (e.g., date-of-birth collection if added in future), registration must be blocked and no data retained
- The privacy notice must include a COPPA disclosure section stating that the service is not directed at children under 13 and that the platform does not knowingly collect personal information from children under 13

---

**Insert into Section 3: Data Models & Firestore Schemas, as new subsection 3.12**

### 3.12 Legal and Compliance Data Fields

#### 3.12.1 Additions to `users/{userId}` Document

Add the following compliance-tracking fields to the user document schema (Section 3.2):

```javascript
// Legal compliance fields (NEW)
{
  // Terms acceptance tracking
  tosAcceptedAt: Timestamp | null,         // When user accepted current ToS
  tosVersion: string | null,               // Version of ToS accepted (e.g., 'v1.0')
  privacyPolicyAcceptedAt: Timestamp | null,
  privacyPolicyVersion: string | null,

  // Age verification
  ageConfirmedAt: Timestamp | null,        // When user confirmed age eligibility

  // Geographic / sanctions screening
  registrationCountry: string | null,      // ISO 3166-1 alpha-2 country code at registration
  registrationIpHash: string | null,       // Hashed IP at registration (for sanctions audit trail)
  sanctionsScreeningStatus: string,        // 'cleared' | 'pending' | 'flagged'
  sanctionsScreenedAt: Timestamp | null,

  // Data subject rights
  erasureRequestedAt: Timestamp | null,    // GDPR/CCPA deletion request date
  erasureCompletedAt: Timestamp | null,
  dataPortabilityRequestedAt: Timestamp | null,

  // Marketing consent (separate from ToS)
  marketingConsentGiven: boolean,
  marketingConsentAt: Timestamp | null,
}
```

#### 3.12.2 Additions to `nonprofit_verifications/{userId}` Document

Add the following fields to the nonprofit verification schema (Section 3.8):

```javascript
{
  // Applicant representation and warranty
  applicantDeclarationAccepted: boolean,   // Whether rep & warranty checkbox was checked
  applicantDeclarationAt: Timestamp | null,// When declaration was accepted

  // IRS verification (cross-reference)
  irsVerificationAttempted: boolean,       // Whether IRS TEOS lookup was attempted
  irsVerificationResult: string | null,    // 'verified' | 'not_found' | 'revoked' | 'skipped'
  irsVerificationAt: Timestamp | null,

  // Annual re-verification workflow
  reVerificationNotificationSentAt: Timestamp | null, // When 30-day warning was sent
  reVerificationDueDate: Timestamp | null,             // Hard deadline for re-verification
}
```

---

**Insert into Section 7: Usage Enforcement & Gating, as new subsection 7.11**

### 7.11 Data Subject Rights Enforcement

#### 7.11.1 Right to Erasure (GDPR Article 17 / CCPA § 1798.105)

When a data subject submits a deletion request (via the account settings or a designated privacy request channel):

1. The deletion request is recorded in the user document (`erasureRequestedAt` field) and in a dedicated `privacy_requests` Firestore collection
2. Deletion must be completed within 30 days of the request (CCPA) / without undue delay (GDPR)
3. The erasure workflow must delete or anonymize records across ALL collections: `users`, `subscriptions`, `credit_balances`, `credit_transactions`, `credit_packs`, `invoices`, `nonprofit_verifications`, `usage_events`, and all tool-specific data collections
4. Firestore deletion does not constitute erasure of Firebase Storage files — the deletion workflow must also delete uploaded files (audit exports, nonprofit documents) from Firebase Storage
5. Billing records required for tax or legal compliance purposes may be retained in an anonymized form (amount, date, transaction reference) for a maximum of 7 years, but all PII must be removed
6. The deletion of a Stripe customer record must be performed via the Stripe API simultaneously; the platform must not retain Stripe customer IDs post-deletion
7. A confirmation email must be sent to the user upon completion of erasure

#### 7.11.2 Right to Data Portability (GDPR Article 20)

Users must be able to export their personal data in a structured, commonly used, machine-readable format (JSON or CSV). The data portability export must include:

- Account profile data
- Subscription history
- Credit transaction history
- Usage event history
- Uploaded file manifest (with download links, valid for 48 hours)

The export must be generated within 30 days of request and delivered by secure download link.

---

**Insert into Section 4: Backend API Specifications, as new subsection 4.7**

### 4.7 Compliance API Endpoints

#### 4.7.1 Privacy Request Endpoints

**POST /api/privacy/erasure-request**

Initiates a GDPR Article 17 / CCPA deletion request for the authenticated user.

```
Request:
{
  reason: string | null,          // Optional reason for deletion request
  confirmAccountDeletion: boolean // Must be true
}

Response (200):
{
  requestId: string,
  estimatedCompletionDate: string (ISO 8601),
  confirmationEmailSent: boolean
}

Errors:
- 400: confirmAccountDeletion must be true
- 409: Erasure request already pending
```

**POST /api/privacy/data-export**

Initiates a GDPR Article 20 / CCPA data portability export.

```
Response (200):
{
  requestId: string,
  estimatedCompletionDate: string (ISO 8601),
  confirmationEmailSent: boolean
}
```

**GET /api/privacy/request-status**

Returns the status of a pending privacy request.

```
Response (200):
{
  type: 'erasure' | 'export',
  status: 'pending' | 'in_progress' | 'completed',
  requestedAt: string (ISO 8601),
  completedAt: string | null (ISO 8601),
  downloadUrl: string | null   // For export requests only, valid 48 hours
}
```

---

**Insert into Section 8: Admin Features & Observability, as new subsection 8.9**

### 8.9 Compliance and Legal Operations Dashboard

**Route**: `/app/admin/compliance`
**File**: `src/components/admin/ComplianceDashboard.jsx`
**Access**: Admin only

A dedicated compliance operations dashboard providing:

#### 8.9.1 Data Subject Rights Queue

Table of pending and completed privacy requests:

| Column | Description |
|--------|-------------|
| User | Name and email |
| Request Type | Erasure or Data Export |
| Requested | Date submitted |
| Status | Pending, In Progress, Completed |
| Due Date | Regulatory deadline (30 days from request) |
| Actions | Mark complete, view details |

Alerts when any request is within 5 days of its regulatory deadline without completion.

#### 8.9.2 Sanctions Screening Log

Log of all sanctions screening events including results, dates, and any flagged accounts requiring manual review.

#### 8.9.3 Terms of Service Version Management

Interface for managing ToS versions and tracking which users have accepted the current version. Identifies users who have not yet accepted the latest ToS and triggers re-acceptance prompts.

#### 8.9.4 Nonprofit Compliance Status

Table of all nonprofit accounts with verification status, expiration dates, IRS verification results, and re-verification notification status. Alerts for accounts approaching re-verification deadline.

---

## Modified Requirements

**1. Story 1.2: Extend User Document Schema**

*Original AC (partial):*
> - Default values: `tier: 'basic'`, `stripeCustomerId: null`, `subscriptionId: null`, `subscriptionStatus: 'active'`, `creditsRemaining: 50`, `aiCreditsRemaining: 10`, `nonprofitVerified: false`, `maxProjects: 1`, `maxSeats: 1`, `maxStorageBytes: 104857600`

*Revised AC (additions in bold):*
> - Default values: `tier: 'basic'`, `stripeCustomerId: null`, `subscriptionId: null`, `subscriptionStatus: 'active'`, `creditsRemaining: 50`, `aiCreditsRemaining: 10`, `nonprofitVerified: false`, `maxProjects: 1`, `maxSeats: 1`, `maxStorageBytes: 104857600`, **`tosAcceptedAt: null`, `tosVersion: null`, `ageConfirmedAt: null`, `registrationCountry: null`, `registrationIpHash: null`, `sanctionsScreeningStatus: 'pending'`, `erasureRequestedAt: null`, `marketingConsentGiven: false`**
> - **The `signup` function must record the user's IP address (hashed with SHA-256) and country (derived from IP geolocation) at the time of registration**
> - **The `signup` function must trigger a background sanctions screening check and update `sanctionsScreeningStatus` upon completion**

---

**2. Story 4.1: Add Tier Selection to Registration Flow**

*Original AC (partial):*
> - Step 1 (account_details): Existing registration form (unchanged)

*Revised AC:*
> - Step 1 (account_details): Existing registration form with the following **additions required by law**:
>   - **Required checkbox: Age eligibility affirmation ("I confirm that I am at least 18 years of age...") — registration is blocked until checked**
>   - **Required checkbox: Terms of Service acceptance — presented as a distinct checkbox from the existing general policy acceptance, labeled with the Subscription ToS if a paid tier is selected**
>   - **`ageConfirmedAt` and `tosAcceptedAt` timestamps must be written to the Firestore user document on account creation**
>   - **For paid tiers, the Subscription ToS link must open in a modal or new tab, and the checkbox text must include the subscription price and auto-renewal disclosure in proximity to the checkbox per FTC Negative Option Rule requirements**

---

**3. Story 5.6: Create Auto-Refill Settings Component**

*Original AC (partial):*
> - Toggle switch to enable/disable auto-refill
> - Dropdown to select pack type (Starter, Pro, Mega) when enabled
> - Shows: "Auto-purchases this month: 1/3" with cap explanation
> - Calls `POST /api/credits/auto-refill` on save
> - Warning text: "Auto-refill will purchase up to 3 packs per month when your balance reaches 0"

*Revised AC:*
> - Toggle switch to enable/disable auto-refill
> - Dropdown to select pack type (Starter, Pro, Mega) when enabled
> - Shows: "Auto-purchases this month: 1/3" with cap explanation
> - **Before calling `POST /api/credits/auto-refill` to enable, display a pre-authorization modal that:**
>   - **Shows the selected pack type, unit price, and maximum monthly charge (price × 3)**
>   - **Requires an explicit acknowledgment checkbox: "I authorize Content Strategy Portal to automatically charge my payment method..."**
>   - **Includes a conspicuous "Cancel" option to decline authorization**
>   - **Displays "By enabling auto-refill, you agree to recurring charges as described above. You can disable at any time." immediately below the authorization checkbox**
> - **After enabling, the backend must send a post-authorization confirmation email within 24 hours per FTC Negative Option Rule requirements**
> - **`POST /api/credits/auto-refill` must record `autoRefillAuthorizedAt: Timestamp` and `autoRefillMaxMonthlyCharge: number` when enabling**
> - Warning text updated to: "Auto-refill will automatically purchase up to 3 packs per month (maximum $[calculated amount]/month) when your standard or AI credit balance reaches 0."

---

**4. Story 2.10: Implement Nonprofit Verification Routes**

*Original AC (partial):*
> - `POST /api/nonprofit/submit-verification` — Multipart upload (uses multer)
> - Document uploaded to Firebase Storage at `nonprofits/{userId}/{filename}`
> - On approval: Creates Stripe subscription with nonprofit pricing, updates user tier

*Revised AC (additions in bold):*
> - `POST /api/nonprofit/submit-verification` — Multipart upload (uses multer)
> - **Request body must include `applicantDeclarationAccepted: boolean` (must be `true` or request is rejected with 400)**
> - **On submission, record `applicantDeclarationAt: Timestamp` in the `nonprofit_verifications` document**
> - **On submission, initiate an IRS TEOS API lookup (or equivalent EIN verification service) and record the result in `irsVerificationResult`. If the EIN is not found or is flagged as revoked in IRS records, the submission must be flagged for enhanced admin review (not auto-rejected, but surfaced with a warning in the admin queue)**
> - Document uploaded to Firebase Storage at `nonprofits/{userId}/{filename}` **with a Firebase Storage security rule ensuring the file is NOT publicly accessible (requires authenticated admin access)**
> - On approval: Creates Stripe subscription with nonprofit pricing, updates user tier
> - **On approval: Set `reVerificationDueDate` to exactly 365 days from `verifiedAt`**
> - **30 days before `reVerificationDueDate`: Backend cron job sends re-verification notification email and sets `reVerificationNotificationSentAt`**
> - **On `reVerificationDueDate` if re-verification is not completed: Automatically transition user to Client Side tier pricing (not Basic) and send notification requiring re-verification to restore nonprofit pricing within 30 days**

---

## Questions & Concerns

1. **Refund Policy**: What is the company's intended refund policy for subscriptions and credit pack purchases? Stripe's default is no refunds for subscription services, but several states (notably California under B&P Code § 17538 and equivalent regulations) require disclosure of a refund policy for digital services. This must be defined before launch.

2. **International Pricing and VAT**: Are users outside the United States expected to be served? If so, EU VAT obligations (One Stop Shop regime under EU Directive 2017/2455) and UK VAT obligations arise for B2C digital services at the point of sale. Stripe Tax can manage this, but the product team must confirm the geographic scope and the price display requirements (VAT-inclusive pricing for EU consumer-facing pages).

3. **White-Label Feature and Third-Party Liability**: The Freelance and Agency tiers allow removal of CSP branding from AI-generated reports. If a subscriber delivers white-labeled AI-generated content to their clients and that content causes harm (e.g., incorrect accessibility remediation advice leading to ADA liability, incorrect meta data leading to SEO damage), what is the company's indemnification posture? The Terms of Service must address this. Has the legal team analyzed the liability chain for white-labeled AI outputs?

4. **Agency "Unlimited Seats" and Employment Law**: The Agency tier's "unlimited seats" feature allows organizations to add an unrestricted number of team members. Has the company assessed whether this creates any employer-subscriber relationship implications, particularly regarding whether the platform becomes a tool for employees as a benefits or productivity platform under any employment law framework?

5. **Credit Pack Non-Expiry and Account Closure**: When a paid user cancels their subscription, what happens to unused non-expiring pack credits? The document does not specify. If users have purchased Mega Packs ($200) and cancel, they will expect those credits to retain value. The company must decide whether to (a) allow continued use of pack credits at Basic tier limits after cancellation, (b) provide a cash refund for unused pack credits, or (c) forfeit them per Terms of Service. Each option has distinct legal and financial implications that must be defined in the ToS and disclosed pre-purchase.

6. **Nonprofit Tier and Non-US Equivalents**: The current spec is limited to U.S. 501(c)(3) organizations. Will the company accept equivalent nonprofit designations from other countries (UK charitable company, Canadian registered charity, EU public benefit organization)? If so, the verification workflow must be extended, and the IRS TEOS cross-check is inapplicable. If not, the nonprofit tier must be explicitly restricted to U.S. entities in both the product UI and the Terms of Service.

7. **Stripe Customer Portal Scope**: Section 4.4.4 specifies creating a Stripe Customer Portal session for payment method management. What features will be enabled in the Stripe Customer Portal configuration? If the portal allows subscribers to modify their subscription directly (bypassing the platform's subscription management API), this could create data sync inconsistencies. Legal and product must align on whether Stripe Customer Portal is used for payment method management only, or for full subscription self-service.

8. **Force Majeure and Credit Rollover**: If the platform experiences a multi-day outage during which users cannot utilize their monthly credit allocation and their billing period resets, what is the obligation to compensate subscribers for unused credits? This must be addressed in the Terms of Service and operationally in the credit system.

---

## Approval Status

**Needs Revision**

This document may not proceed to implementation in its current form. The following conditions must be satisfied before approval:

1. **[Blocking — Legal]** Draft and finalize Subscription Terms of Service addressing all provisions identified in REQ-05-C06, incorporating SLA remedies (REQ-05-C01), auto-refill authorization disclosures (REQ-05-C02), nonprofit representation and warranty (REQ-05-C03), limitation of liability, arbitration clause, and class action waiver (REQ-05-M07).

2. **[Blocking — Regulatory]** Obtain a legal opinion on whether the credit pack / stored value system requires money transmission licensing in the company's primary operating jurisdictions (REQ-05-M05). Determine unclaimed property reporting obligations for non-expiring pack credits (REQ-05-S04).

3. **[Blocking — Privacy]** Conduct and document a GDPR Records of Processing Activities (ROPA) assessment covering all new data collections. Replace "Unlimited" Agency data retention with compliant defined retention periods. Implement GDPR/CCPA right-to-erasure workflow as specified in New Requirement 3.12 and 7.11 (REQ-05-C05).

4. **[Blocking — Legal]** Add age verification and COPPA compliance screening to registration flow before any user data is collected (REQ-05-C07).

5. **[Blocking — Security]** Complete PCI-DSS SAQ A eligibility assessment. Document PCI-DSS compliance posture and Stripe as a listed service provider (REQ-05-C04).

6. **[Blocking — Compliance]** Implement OFAC sanctions screening at registration (REQ-05-M06). Add geographic data collection and jurisdictional blocking for sanctioned countries.

7. **[Conditional — pre-launch]** All payment-flow UI components must meet WCAG 2.1 AA accessibility standards with explicit acceptance criteria added to relevant Stories (REQ-05-M01).

8. **[Conditional — pre-launch]** Data breach incident response plan must be drafted and referenced in the implementation requirements (REQ-05-M04).
Now I have a thorough understanding of the entire document. Let me produce the comprehensive legal review.

# Head Legal Counsel — Requirements Review
**Reviewer:** Head Legal Counsel
**Document:** pricing-payments-requirements.md
**Date:** 2026-02-22
**Status:** Complete

---

## Executive Summary

This requirements document describes a well-architected tiered subscription and credit system for a SaaS content and SEO platform. While the technical implementation is thoughtful and the PCI-DSS surface area is appropriately minimized through reliance on Stripe-hosted checkout, the document contains significant legal and compliance gaps that must be resolved before deployment: it lacks enforceable Terms of Service, SLA remedy provisions, GDPR/CCPA data governance controls, nonprofit fraud liability mitigations, age verification, export control screening, and any indemnification or dispute resolution framework. These gaps collectively expose the company to substantial regulatory, contractual, and litigation risk.

---

## Sections Reviewed

| Section | Title | Focus Level |
|---------|-------|-------------|
| 1 | Overview & Goals | Secondary |
| 2 | Tier Definitions & Credit System | Primary |
| 3 | Data Models & Firestore Schemas | Primary |
| 4 | Backend API Specifications | Primary |
| 5 | Frontend Components | Primary |
| 6 | Registration Flow Updates | Primary |
| 7 | Usage Enforcement & Gating | Primary |
| 8 | Admin Features & Observability | Primary |
| 9 | User Stories by Implementation Batch | Secondary |
| 10 | Implementation Notes & Conventions | Secondary |
| Appendices A & B | Dependency Graph, File Manifest | Secondary |

---

## Findings

### Critical (Must fix before implementation)

- **[REQ-05-C01]** Section 6.1 / 6.2 — **Absence of Terms of Service Acceptance Gate at Paid Subscription Inception**: The current registration flow references "Policy acceptance (Terms, Privacy, AI Policy)" as a step in the free-tier registration, but the paid registration flow (Scenarios B, C, D in Section 6.2.2) redirects immediately to Stripe Checkout without confirming that the user has affirmatively accepted the Terms of Service that govern the subscription contract, overage billing, cancellation policy, SLA commitments, and auto-renew terms. Under the E-SIGN Act, UETA, and applicable contract formation doctrine, a binding subscription agreement requires a clear offer, affirmative acceptance, and consideration. Redirecting to a payment processor does not substitute for documented Terms of Service acceptance. Additionally, the CAN-SPAM Act and many state auto-renewal statutes (notably California's ARL, Bus. & Prof. Code § 17600 et seq.) require that the specific auto-renewal terms, cancellation procedures, and recurring charge amounts be disclosed clearly and conspicuously *before* the consumer provides billing information, and that affirmative consent be captured and retained. The document contains no mechanism for capturing, timestamping, or storing the version of the Terms accepted at subscription inception. **Recommendation:** Implement a mandatory, unchecked-by-default Terms of Service and auto-renewal disclosure acknowledgment immediately before the "Confirm & Pay" step in `PlanConfirmationStep.jsx`. Store in Firestore the accepted ToS version, IP address, user agent, and timestamp. Retain this record for the duration of the subscription plus a minimum of five years. Legal must draft compliant auto-renewal disclosures for all paid tiers.

- **[REQ-05-C02]** Section 2.2.3 / Section 4.4.3 — **Auto-Refill as Continuous Authority for Recurring Charges Without Adequate Consent Mechanism**: The auto-refill feature (opt-in) automatically purchases credit packs when the balance reaches zero, capped at three purchases per month. This constitutes a recurring charge authorization. California's Automatic Renewal Law (Bus. & Prof. Code §§ 17600–17606), New York General Obligations Law § 5-903, and similar statutes in Delaware, Illinois, and elsewhere impose specific requirements: the recurring charge terms must be presented in a clear and conspicuous manner before the subscription is accepted; the consumer must affirmatively consent to those terms; and the merchant must send an acknowledgment including the cancellation policy and how to cancel. The document specifies a "Warning text" in `AutoRefillSettings.jsx` (Section 9, Story 5.6), but that warning appears *after* the initial subscription is established, not before initial enrollment. There is no requirement to obtain a fresh, explicit consent at the time auto-refill is enabled, no confirmation email after enrollment, and no requirement to notify the user before each auto-refill charge is executed. The three-per-month cap also resets at an unspecified interval and the reset logic is not defined. **Recommendation:** Require a separate, affirmative, unchecked checkbox to enable auto-refill each time it is turned on. Send a confirmation email upon enabling auto-refill that states the pack type, per-occurrence price, and cancellation instructions. Send a pre-charge notification at least 24 hours before each auto-refill purchase. Define and document the cap-reset logic. Retain all consent records.

- **[REQ-05-C03]** Section 3.8 / Section 4.4.5 / Section 8.3 — **Nonprofit Verification: Inadequate Fraud Liability Mitigation and Legal Exposure from False Claims**: The document requires upload of a 501(c)(3) determination letter and EIN for nonprofit verification, which is the correct documentary basis. However, the system contains no mechanism to independently verify the EIN against IRS records (the IRS Tax Exempt Organization Search API is publicly available), no representation and warranty by the applicant that the information is accurate, no explicit fraudulent-misrepresentation clause in the Terms of Service, and no recoupment or clawback provision for discounts obtained through fraud. The admin review process (Section 8.3.2) is entirely manual and dependent on document authenticity assessment by a non-specialist. Furthermore, the document does not specify how long uploaded 501(c)(3) letters are retained after rejection or expiration, creating both a data minimization conflict (GDPR Article 5(1)(e)) and an evidence-preservation tension. The verification schema stores the document URL indefinitely. **Recommendation:** (1) Add an IRS TEOS API verification check as an automated pre-screening step during submission. (2) Require the applicant to submit a sworn declaration (checkbox plus recorded attestation in the database) that all submitted information is accurate and that fraudulent submissions will result in immediate subscription termination and recovery of all discount amounts at standard rates retroactively for the current term. (3) Define explicit document retention periods in the schema (e.g., retain approved letters for the verification term plus two years; purge rejected documents after 90 days unless there is an active dispute). (4) Add a clawback clause in the Terms of Service. (5) Add an automated annual re-verification reminder 60 days before expiration with automatic downgrade to Basic if re-verification is not completed.

- **[REQ-05-C04]** Section 2.1 / Section 5.1 / Section 7.10 — **SLA Commitments Without Defined Remedies Constitute Unenforceable or Misleading Representations**: The document specifies support response SLAs (48hr for Client Side, 24hr for Freelance, 12hr for Agency) that appear on the public pricing page, in the feature comparison table, and in the Billing Dashboard. Under the FTC Act Section 5 (unfair or deceptive acts or practices) and analogous state consumer protection statutes (e.g., California's UCL, Bus. & Prof. Code § 17200), advertising response-time commitments that are not met and for which no remedy is offered constitutes a deceptive trade practice. There are no: service credit provisions for missed SLAs, definitions of what constitutes a "response" (acknowledgment vs. resolution), excluded periods (weekends, holidays), escalation paths, measurement methodology, or force majeure carve-outs for SLA obligations specifically. The document's Section 10.6 ("Security Considerations") mentions CSRF protection and rate limiting but contains no service availability commitment whatsoever, which means there is no defined uptime SLA either. **Recommendation:** Legal must draft SLA terms including: (a) precise definition of "response" and measurement start time; (b) exclusion periods; (c) a service credit schedule (e.g., 10% credit of monthly fee per 24-hour SLA breach up to 30% per month) as the sole and exclusive remedy for SLA failures; (d) a cap on total SLA credit liability; (e) an express disclaimer that SLA credits are the subscriber's sole remedy for service level failures; and (f) a force majeure exclusion for SLA obligations. These terms must appear in the Terms of Service before implementation. The pricing page must link to the SLA terms or include a clear "see Terms of Service for SLA details" disclosure.

- **[REQ-05-C05]** Section 3.9 / Section 7.9 / Section 8.8 — **GDPR and CCPA Compliance: Missing Data Governance Framework for Billing and Usage Data**: The document introduces six new Firestore collections containing personal data (subscription records, credit transactions, usage events, invoices, nonprofit verification documents including EINs, and credit pack purchase records). There is no Data Processing Agreement framework, no lawful basis documentation (GDPR Article 6), no data subject rights implementation (right to access, portability, erasure, restriction), no data retention schedule with legal justification for each collection, and no CCPA "Do Not Sell My Personal Information" consideration for the usage analytics data shared with admin dashboards. Specific gaps include: (1) The `usage_events` collection is described as "high-volume" with no retention limit defined — storing indefinite behavioral data without a retention policy violates GDPR Article 5(1)(e)'s storage limitation principle. (2) The EIN stored in `nonprofit_verifications` is sensitive financial identifier data with no access controls beyond "users can read their own verification." (3) The `credit_transactions` collection is described as an "immutable ledger" — this conflicts with GDPR's right to erasure (Article 17) for users who request deletion, and no reconciliation between the legal obligation to retain billing records (typically 7 years under IRS requirements and state tax laws) and the right to erasure has been addressed. (4) The admin data export feature (Section 8.8) exports subscriber lists including email addresses with no CCPA Category disclosure or consent mechanism. (5) There is no breach notification procedure referenced despite the system storing payment-adjacent data. **Recommendation:** Before implementation, legal and engineering must produce: (a) a Record of Processing Activities (RoPA) for each new collection; (b) defined retention periods with legal justification for each collection; (c) a data subject rights workflow (access, erasure, portability) that respects the tension between erasure requests and billing record retention obligations — the reconciliation should pseudonymize rather than delete billing records upon erasure requests; (d) a Privacy Notice update disclosing the new data processing activities; (e) CCPA Category disclosures for all data collected at subscription; and (f) a data breach notification procedure.

- **[REQ-05-C06]** Section 4 / Section 10.6 — **Missing Financial Regulation Analysis: Money Transmission Laws and Stored Value Regulations for the Credit System**: The credit system as designed — where users purchase credit packs (one-time payments for non-expiring stored credits), bonus credits accumulate independently of subscription periods, and credits have defined monetary equivalents ($0.01 operational cost per standard credit, $0.05 per AI credit) — may constitute stored value or a prepaid access instrument under applicable money transmission laws. The FinCEN prepaid access rule (31 C.F.R. § 1022.210) and numerous state money transmission statutes (notably California's Money Transmission Act, Financial Code § 2000 et seq.; New York Banking Law Article 13-B; and the MSB rules in 47 other states) regulate the issuance of prepaid instruments. While purely internal credits used only for services on the issuer's own platform are generally exempt, the non-expiring nature of credit packs, the defined monetary backing, the ability to purchase packs independently of subscriptions, and the overage monetization structure create a regulatory risk that should be formally analyzed. Additionally, if credits are ever transferable between users (the Agency tier has unlimited seats and team management), the regulatory analysis changes materially. The document does not prohibit credit transfers. **Recommendation:** Retain outside counsel with money transmission expertise to conduct a formal regulatory analysis of the credit system structure in all states where users will be located, and at the federal level. As a precautionary measure: (a) add a clear non-transferability provision for credits in the Terms of Service; (b) explicitly prohibit credit-for-cash redemption; (c) ensure credits expire no later than the end of the subscription term (the current "non-expiring" credit pack design increases regulatory risk); and (d) add a governing law clause to the Terms of Service designating a favorable jurisdiction.

- **[REQ-05-C07]** Section 8 / Section 3.9 — **No Export Control or OFAC Sanctions Screening**: The platform accepts payments and creates user accounts from any jurisdiction. Neither the registration flow, the Stripe checkout integration, nor the nonprofit verification workflow include any screening against OFAC's Specially Designated Nationals (SDN) list, the Consolidated Sanctions List, or Export Administration Regulations (EAR). The platform's AI features — particularly if they process content related to technical audits, SEO competitive analysis, or schema generation for certain industries — could implicate EAR Export Control Classification Numbers (ECCNs) depending on the underlying AI model used. The Stripe integration provides some transactional screening, but Stripe's screening is not a substitute for the company's own OFAC compliance program, which is required under 31 C.F.R. Parts 500-598 for any U.S. person or entity. The nonprofit verification endpoint accepts EINs and organization names but performs no sanctions screening. **Recommendation:** (1) Add OFAC/sanctions screening to the registration flow, either through an integrated compliance API (e.g., Dow Jones, Refinitiv World-Check, or similar) or through Stripe Radar rules for geographic and sanctions screening. (2) Add geographic IP blocking or account registration restrictions for OFAC-sanctioned countries (currently Iran, Cuba, North Korea, Syria, Russia's Crimea/DNR/LNR regions at minimum). (3) Conduct an EAR analysis of the AI tools to determine whether any export license exceptions apply. (4) Document the OFAC compliance program in an internal policy. (5) Add a representation and warranty in the Terms of Service that the user is not located in, or a national of, a sanctioned jurisdiction.

---

### Major (Should fix before implementation)

- **[REQ-05-M01]** Section 6.2 / Story 4.1 — **Age Verification: No Minimum Age Requirement for Contract Formation**: The registration flow collects no date of birth and imposes no minimum age restriction. Subscription contracts with minors are voidable under common law in all U.S. jurisdictions. COPPA (15 U.S.C. § 6501 et seq.) prohibits knowingly collecting personal information from children under 13 without parental consent and imposes substantial per-violation penalties ($51,744 per violation as of current FTC schedule). The Google OAuth path (Scenario D) does not provide age signals. The AI Policy referenced in Section 6.1 likely contains some age restriction language, but the enforcement mechanism is absent from the system requirements. The credit card payment via Stripe provides some implicit age signal but is not a verification mechanism. **Recommendation:** Add a date-of-birth field or, at minimum, an age attestation checkbox ("I confirm I am 18 years of age or older") as a required field in the registration form. Block registration for users under 18 (or under 13 at absolute minimum with parental consent flow). Add a representation in the Terms of Service that users represent they are of legal age to form binding contracts in their jurisdiction. Log the age attestation timestamp.

- **[REQ-05-M02]** Section 2.2.3 / Section 4.4.3 / Story 5.6 — **Auto-Refill Cap Reset Logic is Undefined, Creating Potential for Unauthorized Charges**: Section 2.2.3 states auto-refill is "Capped at 3 auto-purchases per month to prevent runaway costs." The `credit_balances` schema (Section 3.4) stores `autoRefillCount` tracking purchases this month. However, the document never defines: when the monthly cap resets (billing date? calendar month? rolling 30-day window?), whether the user receives a notification when approaching the cap, whether there is a maximum cumulative auto-refill spend per month, or what happens if a user changes their auto-refill pack type mid-month. Three Mega pack auto-refills in a single month = $600 in additional charges. Without adequate notice, this could be characterized as an unauthorized charge under the Electronic Fund Transfer Act (EFTA) and Regulation E (12 C.F.R. Part 1005), and state consumer protection laws. **Recommendation:** (1) Define the cap reset interval precisely (recommendation: rolling 30-day window aligned with billing period). (2) Require email notification after each auto-refill purchase with total month-to-date spend. (3) Add a per-month maximum dollar-amount cap in addition to the count cap. (4) Add a user-configurable notification threshold. (5) Define all of this behavior in the Terms of Service and on the Auto-Refill Settings UI.

- **[REQ-05-M03]** Section 2.1 / Section 7.9 — **Data Retention Policy Enforced Without User Notice, Potentially Constituting Unauthorized Destruction of User Property**: Section 7.9 describes an automated daily cron job that deletes records based on `dataRetentionDays`. The Basic tier (30-day retention) will aggressively delete audit history, analysis results, and tool data. The document does not require that users receive advance notice before their data is deleted, that the deletion is disclosed in the Terms of Service or Privacy Policy, or that users are given an opportunity to export their data before deletion occurs. Under GDPR Article 13(2)(a), data subjects must be informed of the retention period or criteria used to determine the period. Under various state consumer protection laws, destroying user data without notice may constitute an unfair trade practice, particularly if users paid for data they expected to retain. The Agency tier's "unlimited" retention policy also has no defined upper bound for cost or compliance purposes. **Recommendation:** (1) Add data retention periods clearly to the Terms of Service, Privacy Policy, and pricing page. (2) Implement a 14-day advance warning notification before data deletion for active users. (3) Require a data export option (download all data) to be available at all times, particularly during the warning period. (4) Define an upper bound for "unlimited" Agency retention (e.g., 7 years with annual archival) for cost and compliance planning. (5) Ensure the deletion cron job creates audit logs of what was deleted and when.

- **[REQ-05-M04]** Section 4.4.5 / Section 3.8 — **Insufficient Security Controls on Nonprofit Verification Document Upload**: The nonprofit verification endpoint accepts PDF, PNG, and JPG files up to an unspecified size limit (Story 4.4 mentions "max 10MB" only in the frontend acceptance criteria). The documents are stored at `nonprofits/{userId}/{filename}` in Firebase Storage. The document specifies the file is uploaded via `multer` on the backend. There is no: (a) malware/content scanning before storage; (b) server-side file type validation beyond extension and MIME type (which are trivially spoofable); (c) encryption-at-rest specification for the uploaded documents; (d) access control specification beyond "Admin can view" — it is unclear whether the Firebase Storage security rules restrict access to admin-only or whether the document URL is publicly accessible; (e) PII handling protocol for 501(c)(3) letters which contain EINs, organization addresses, signatory names, and IRS determination dates. Under GDPR Article 32 and state security laws (California's CCPA, New York SHIELD Act), companies must implement appropriate technical and organizational measures to secure personal data. **Recommendation:** (1) Implement server-side file content validation (not just extension checking). (2) Ensure Firebase Storage rules restrict nonprofit documents to admin-read-only (not user-readable via direct URL after upload). (3) Generate time-limited signed URLs for admin document review rather than storing permanent public URLs. (4) Add virus/malware scanning (e.g., ClamAV or a cloud-based scanning service) before storing uploaded files. (5) Add a maximum file size server-side validation. (6) Explicitly classify 501(c)(3) letters as "sensitive personal data" in the data classification policy.

- **[REQ-05-M05]** Section 8.8 — **Admin Data Export Contains Insufficient PII Protection Controls**: Section 8.8 describes admin data exports including subscriber lists, revenue reports, usage analytics, and nonprofit verification logs with an "option to include/exclude emails." This is a high-risk feature: bulk CSV exports of subscriber data including emails, subscription status, and usage patterns could constitute a significant data breach if exported inadvertently or by a compromised admin account. The document provides no: access logging for export events, export approval workflow, data masking or tokenization options beyond the email toggle, DLP controls, download link expiration, or prohibition on re-identification from exported data. Under CCPA, bulk consumer data exports by business employees accessing the database could trigger data broker registration requirements in some states. Under GDPR, data exports to non-EEA jurisdictions require transfer mechanism documentation. **Recommendation:** (1) Add an audit log entry for every admin export with exporter identity, timestamp, parameters used, and record count. (2) Implement role-based access control for the export feature (not all "admin" users should be able to export PII). (3) Generate exports as time-limited download links (expire after 1 hour) rather than immediate downloads. (4) Add a data masking option that pseudonymizes subscriber identifiers by default. (5) Add a Terms of Use notice to admin users restricting use of exported data.

- **[REQ-05-M06]** Section 5.1 / Section 1.3 — **AI-Generated Output: Missing Disclaimers and IP Ownership Provisions**: The platform offers AI-powered generation of meta titles, meta descriptions, alt text, readability rewrites, competitor analysis, and A/B variants. These AI outputs will be used by subscribers in commercial content. The document references an "AI Policy" in the registration flow but does not specify: (a) whether the company disclaims any warranty as to the accuracy, suitability, or fitness for purpose of AI-generated content; (b) who owns intellectual property in AI-generated outputs (the user, the platform, or neither, depending on jurisdiction); (c) whether AI outputs may constitute copyright infringement of third-party works (a live litigation issue as of 2026); (d) whether the AI-generated content carries any representation regarding factual accuracy (creating potential defamation or negligent misrepresentation liability if used commercially); (e) WCAG compliance implications of AI-generated alt text that may be inaccurate. Multiple jurisdictions have unsettled law on AI output copyright ownership. The U.S. Copyright Office has issued guidance that purely AI-generated works without human authorship are not copyrightable, which has implications for white-label reports delivered by Agency subscribers to their clients. **Recommendation:** (1) Add prominent disclaimers to all AI output interfaces noting that outputs are suggestions, not professional advice, and require human review before commercial use. (2) Draft an AI-specific addendum to the Terms of Service addressing: output ownership (grant of license to use, not assignment), accuracy disclaimers, indemnification for third-party IP claims arising from AI outputs, and prohibited uses. (3) For the Accessibility Analyzer tool specifically, add a disclaimer that AI remediation suggestions do not constitute legal advice and do not guarantee ADA/Section 508 compliance. (4) Legal must review the AI Policy referenced in the registration flow to ensure it addresses these issues.

- **[REQ-05-M07]** Section 7.10 — **Past-Due Grace Period Confers Full Access Without Contractual Basis**: The document specifies that users in `past_due` status retain "Full tier access (grace period: 7 days)" before access is reverted to Basic limits. This grace period is a business decision, but it has legal implications: (a) it is not disclosed to users as a subscription term, yet it implicitly extends the subscription beyond the payment due date without a contractual basis; (b) it creates liability for services rendered but not paid; (c) the transition from "past_due" to Basic limits after 7 days could be characterized as a modification of service terms if not disclosed in the original subscription agreement; (d) the document does not specify what happens to credits consumed during the grace period if the payment ultimately fails. If the subscription ultimately cancels due to non-payment, overage charges incurred during the grace period may be uncollectable. **Recommendation:** (1) The 7-day grace period must be explicitly disclosed in the Terms of Service as a courtesy extension that does not waive any payment obligation. (2) Credits consumed during the grace period should remain billable and the Terms of Service should address collection of outstanding amounts. (3) Define the collections process for unpaid subscriptions. (4) Specify that Stripe's automatic retry schedule governs payment retry timing and include Stripe's retry policy by reference in the Terms.

- **[REQ-05-M08]** Entire Document — **No Indemnification, Dispute Resolution, or Governing Law Framework**: The requirements document, which is ostensibly ready for implementation, contains no reference to and makes no provision for any of the following essential contractual provisions: (a) mutual indemnification between the platform and subscribers for third-party claims; (b) limitation of liability cap (typically limited to fees paid in the prior 12 months); (c) exclusion of consequential, incidental, and punitive damages; (d) dispute resolution mechanism (arbitration clause, small claims carve-out); (e) class action waiver; (f) governing law and venue selection; (g) attorneys' fees provision. Without these provisions in the Terms of Service, the company faces uncapped liability exposure for any claim arising from the platform, including claims by Agency subscribers for loss of business arising from platform downtime, claims by nonprofit subscribers for discriminatory application of verification requirements, and claims by any subscriber for AI-generated content that causes harm. **Recommendation:** Legal must draft comprehensive Terms of Service including all of the above provisions before any paid subscription is accepted. The Terms must be linked from the pricing page, the registration flow, every invoice, and the billing dashboard. The arbitration clause and class action waiver must be presented conspicuously (not in fine print) and must satisfy the requirements of the Federal Arbitration Act and the enforceability standards set by courts in the company's chosen governing jurisdiction.

---

### Minor (Fix during implementation)

- **[REQ-05-m01]** Section 5.1.6 — **JSON-LD Product Schema on Pricing Page May Violate Google Structured Data Guidelines Without Accurate Pricing Data**: The requirement to add `Product` schema with pricing offers to the pricing page is appropriate for SEO, but the document warns that credit costs and tier configurations are designed to be adjustable without changing subscription prices. If pricing is updated in the database or configuration but the JSON-LD structured data is not kept synchronous, Google may penalize the site for inaccurate pricing markup under its structured data quality guidelines. Additionally, displaying prices in structured data without currency symbols or tax disclaimers (applicable in EU/UK jurisdictions if the platform expands internationally) may trigger consumer pricing transparency complaints. **Recommendation:** Ensure the JSON-LD pricing data is generated dynamically from `TIER_CONFIGS` (the same source as the visible pricing), not hardcoded. Add a note in the implementation story that pricing schema must be updated when any price change is made. Add a `priceCurrency` field explicitly and, if serving EU/UK customers, add a `priceSpecification` with tax-inclusive pricing.

- **[REQ-05-m02]** Section 5 / Story 3.1 / Story 3.2 — **ADA and Section 508 Accessibility of Payment Flows Not Addressed**: Section 1.1 notes that the platform includes an Accessibility Analyzer tool and Story 3.1 mentions that the pricing page should be "fully responsive and accessible (keyboard navigation, ARIA labels, proper heading hierarchy)." However, the document does not specify accessibility requirements for the billing dashboard, credit pack purchase modal, plan management page, invoice history, or the registration/checkout flow. The checkout redirect to Stripe is outside the platform's control, but the platform-controlled steps (PlanConfirmationStep, NonprofitVerificationStep, all billing components) must comply with ADA Title III (which courts have applied to websites under the nexus theory) and, if any government contracts are involved, Section 508 of the Rehabilitation Act. The `CreditPackPurchaseModal` (Section 5.2.2) specifies "focus trap, escape to close, proper ARIA attributes" only in Story 5.2, not universally. **Recommendation:** Add an accessibility acceptance criterion to every frontend component story: all interactive elements must meet WCAG 2.2 AA at minimum, all modals must implement focus management, all form fields must have associated labels, all error messages must be programmatically associated, and all status updates must be announced via ARIA live regions. The existing Accessibility Analyzer tool should be run against all billing components before deployment.

- **[REQ-05-m03]** Section 3.11 / Section 10.5 — **Environment Variable Handling Creates Credential Exposure Risk Not Addressed by Legal Framework**: Section 3.11 lists environment variables including `STRIPE_SECRET_KEY`, `FIREBASE_PRIVATE_KEY`, and `STRIPE_WEBHOOK_SECRET`. Section 10.5 notes "Firebase Admin SDK credentials must be securely stored (environment variables, not committed)." The document does not specify: credential rotation procedures, what happens if credentials are compromised, whether there is a responsible disclosure policy, what the breach notification obligation is if Stripe credentials are exposed, or whether the company has cyber liability insurance coverage for such events. From a legal standpoint, the exposure of Stripe secret keys could enable unauthorized charges to subscribers, creating liability under the Electronic Fund Transfer Act, card network rules, and state consumer protection statutes. **Recommendation:** (1) Add a credential management policy to the implementation notes requiring rotation on any suspected exposure. (2) Add a security incident response procedure addressing Stripe credential compromise specifically. (3) Reference the applicable data breach notification laws (all 50 states have them) that would be triggered by a payment credential exposure. (4) Ensure cyber liability insurance coverage is reviewed to confirm it covers SaaS payment processing incidents.

- **[REQ-05-m04]** Section 8.2 / Section 8.4 — **Revenue Analytics Access Without Financial Data Governance Policy**: The admin revenue analytics feature (Section 8.4) aggregates MRR, LTV, ARPU, churn, and individual subscriber financial data. Access is controlled by `role: 'admin'` but there is no segregation of duties, no requirement that revenue data access be limited to specific admin sub-roles (e.g., finance vs. engineering), no retention policy for exported revenue reports, and no consideration of whether this data constitutes "books and records" subject to preservation obligations. If the company is ever subject to litigation or regulatory investigation, revenue records must be preserved under a litigation hold. **Recommendation:** (1) Create a sub-role within admin for "finance" access to revenue analytics. (2) Add audit logging to all revenue data access and export events. (3) Define a litigation hold procedure that would apply to revenue and subscriber records. (4) Ensure revenue data exports are treated as financial records and retained for the period required by applicable tax law (minimum 7 years in the U.S.).

---

### Suggestions (Consider for future)

- **[REQ-05-S01]** Section 2.1 / Section 5.1 — **Consider Annual Billing Option to Reduce Regulatory Complexity of Monthly Recurring Charges**: The document notes a "placeholder for future annual toggle" on the pricing page but defers annual billing to a future version. Annual billing with an upfront payment reduces the frequency of auto-renewal disclosure obligations, simplifies SLA credit calculations (credits against annual fees rather than monthly), and typically generates better cash flow. However, annual billing introduces its own legal requirements: pro-rata refund policies upon cancellation (required by California and other states), and annual renewal notices 30-60 days before the renewal date (required in California and increasingly in other states for annual subscriptions over $5). This should be designed with legal input from the outset rather than retrofitted.

- **[REQ-05-S02]** Section 3 / Section 7.9 — **Consider Pseudonymization Architecture for Long-Term Analytics Data**: The `usage_events` collection is described as a high-volume collection with composite indexes for analytics. As the dataset grows, it will contain detailed behavioral profiles of all users. Rather than storing Firebase Auth UIDs directly in analytics records (linking behavior to identified individuals), consider a pseudonymization layer that maps UIDs to internal analytics identifiers, with the mapping stored separately with tighter access controls. This would allow the company to retain analytics data for extended periods without the same GDPR/CCPA exposure, as pseudonymized data is treated more favorably under both regimes (though it is not fully anonymous). This is an architectural decision best made before initial data collection begins.

- **[REQ-05-S03]** Section 2.3 / Section 5.1 — **Consider VAT/GST Compliance for Non-U.S. Subscribers**: The document specifies all pricing in USD and `currency: 'usd'` in all schemas. The pricing page, tier definitions, and overage rates make no reference to tax treatment. If the platform accepts subscribers from the EU (VAT MOSS/OSS obligations), UK (UK VAT), Australia (GST), or Canada (GST/HST/PST), significant tax registration, collection, and remittance obligations arise. Stripe Tax can automate much of this, but it must be configured and the legal obligation must be acknowledged. B2B subscribers in the EU (with a valid VAT number) are subject to the reverse charge mechanism, which requires different invoicing. The Nonprofit tier has complex VAT implications in EU jurisdictions where nonprofit status does not automatically confer VAT exemption. This should be addressed before any marketing to non-U.S. audiences.

- **[REQ-05-S04]** Section 6.2 / Section 4.4.5 — **Consider a Formal Nonprofit Eligibility Policy for Non-U.S. Equivalents**: The current nonprofit tier is defined exclusively in terms of U.S. 501(c)(3) status. The requirements reference "501(c)(3) determination letter or equivalent" in the tier definition (Section 2.1) but the verification schema (Section 3.8) stores only `ein` (an IRS-specific identifier) and the API endpoint (Section 4.4.5) accepts only "501(c)(3) determination letter (PDF/image)." Non-U.S. equivalents (UK Charity Commission registration, Canadian charitable registration, EU-registered charitable foundations) are not accommodated by the current schema or verification workflow. If the platform acquires non-U.S. nonprofit subscribers and cannot accommodate their documentation, it could face discrimination or accessibility concerns and will miss a commercially attractive segment. Consider expanding the schema to accommodate international nonprofit registrations with a flexible document type and registration number field rather than a U.S.-centric EIN field.

---

## New Requirements

The following requirements are missing from the document entirely and should be added. Each is written in the style of the original document's user story format.

---

**Add to Section 6 (Registration Flow Updates) — New Section 6.5:**

### 6.5 Terms of Service Acceptance Records

#### Story NR-01: Capture and Store Terms of Service Acceptance at Subscription Inception

**As a** legal and compliance stakeholder, **I want** the system to record affirmative Terms of Service acceptance at the time of each paid subscription, **so that** the company can demonstrate informed consent to subscription terms, auto-renewal disclosures, and overage billing authorizations.

**AC:**
- [ ] Add a new Firestore collection `tos_acceptances/{acceptanceId}` with schema:
  ```javascript
  {
    userId: string,
    tosVersion: string,           // e.g., '2026-02-22-v1.0'
    privacyPolicyVersion: string,
    aiPolicyVersion: string,
    autoRenewalDisclosureVersion: string,
    acceptedAt: Timestamp,
    ipAddress: string,            // Captured server-side
    userAgent: string,
    method: string,               // 'registration' | 'plan_upgrade' | 'auto_refill_enable'
    tier: string,                 // Tier being subscribed to
    sessionId: string | null
  }
  ```
- [ ] `PlanConfirmationStep.jsx` must display an unchecked-by-default checkbox with text: "I have read and agree to the [Terms of Service], [Privacy Policy], and [AI Policy]. I understand that my subscription will automatically renew at [price]/month until cancelled."
- [ ] The "Confirm & Pay" button must be disabled until the checkbox is checked
- [ ] On backend `POST /api/checkout/create-session`, capture and store `tos_acceptances` record server-side (not trust-client-side)
- [ ] `tos_acceptances` records are immutable — never deleted, retained for 7 years minimum
- [ ] Auto-refill enablement (`POST /api/credits/auto-refill` with `enabled: true`) must also create a `tos_acceptances` record with `method: 'auto_refill_enable'`
- [ ] Version strings for all policy documents must be defined in `server/src/config/policies.js`

**Files:**
- Create: `server/src/config/policies.js`
- Modify: `src/components/auth/PlanConfirmationStep.jsx`
- Modify: `server/src/routes/checkout.js`
- Modify: `server/src/routes/credits.js` (auto-refill endpoint)

---

**Add to Section 4 (Backend API Specifications) — New Section 4.7:**

### 4.7 Data Subject Rights Endpoints

#### Story NR-02: Implement GDPR/CCPA Data Subject Rights API

**As a** user, **I want** to request a copy of my personal data and request deletion of my account, **so that** I can exercise my rights under applicable privacy law.

**AC:**
- [ ] **GET /api/privacy/data-export** — Returns a complete JSON export of all personal data held for the authenticated user, including:
  - User profile (`users/{userId}`)
  - Subscription record (`subscriptions/{subscriptionId}`)
  - All credit transactions (`credit_transactions` where `userId == uid`)
  - All invoice records (`invoices` where `userId == uid`)
  - All credit packs (`credit_packs` where `userId == uid`)
  - Nonprofit verification record if applicable
  - `tos_acceptances` records
  - Excludes `usage_events` raw data (provide aggregate summary only)
- [ ] Response is a JSON object or a download link to a generated JSON file; delivery within 30 days of request to comply with GDPR Article 12(3)
- [ ] **POST /api/privacy/delete-account** — Initiates account deletion:
  - Soft-deletes user profile, replacing PII with pseudonymized values (`name: 'Deleted User'`, `email: 'deleted-{uid}@deleted.invalid'`)
  - Cancels any active Stripe subscription immediately
  - Retains billing records (`invoices`, `credit_transactions`, `tos_acceptances`) in pseudonymized form for 7 years to satisfy tax and legal record-keeping obligations
  - Deletes `usage_events`, `credit_balances`, `credit_packs` (non-billing data)
  - Purges nonprofit verification documents from Firebase Storage
  - Deletes Firebase Auth account
  - Returns: `{ deletionScheduled: true, completionDate: string }`
- [ ] Deletion request must be confirmed via email verification step before processing
- [ ] All deletion events logged to an immutable `deletion_audit_log` collection
- [ ] Response time: acknowledge within 72 hours, complete within 30 days (GDPR Article 12)
- [ ] Add admin endpoint `GET /api/admin/privacy/pending-requests` to track outstanding requests

**Files:**
- Create: `server/src/routes/privacy.js`
- Create: `server/src/services/privacyService.js`

---

**Add to Section 3 (Data Models) — New Section 3.12:**

### 3.12 New Collection: `tos_acceptances/{acceptanceId}`

Records of Terms of Service acceptance events. Immutable.

```javascript
{
  id: string,
  userId: string,
  tosVersion: string,
  privacyPolicyVersion: string,
  aiPolicyVersion: string,
  autoRenewalDisclosureVersion: string,
  acceptedAt: Timestamp,
  ipAddress: string,
  userAgent: string,
  method: string,         // 'registration' | 'plan_upgrade' | 'auto_refill_enable' | 'plan_reactivation'
  tier: string,
  sessionId: string | null,
  createdAt: Timestamp
}
```

**Security rules:** Users may create their own records (on acceptance). No user or backend deletion permitted. Admin read-only. Records retained for 7 years minimum.

---

**Add to Section 4 (Backend API Specifications) — New Section 4.8:**

### 4.8 OFAC and Sanctions Screening

#### Story NR-03: Implement Sanctions Screening at Registration and Subscription Creation

**As a** compliance stakeholder, **I want** user registrations and subscription creations to be screened against OFAC sanctions lists, **so that** the company does not do business with sanctioned persons or entities.

**AC:**
- [ ] Integrate a sanctions screening API (at minimum, check against OFAC SDN list via the U.S. Treasury's free OFAC Sanctions List Search API, or a commercial provider) at:
  - User registration (screen `name` and `email` domain)
  - Nonprofit verification submission (screen `organizationName` and `ein`)
  - Checkout session creation (screen by country code from Stripe customer data)
- [ ] Blocked registrations from sanctioned jurisdictions return HTTP 403 with a non-descriptive error (do not reveal screening logic)
- [ ] Screening matches are logged to a `compliance_screening_events` collection (admin-only access) with: `userId`, `screenedFields`, `matchResult`, `action`, `timestamp`
- [ ] Implement geographic IP blocking for OFAC-sanctioned countries at the server level or via Stripe Radar rules
- [ ] Add to Terms of Service: user represents they are not located in or a national of any U.S.-sanctioned jurisdiction
- [ ] Document the sanctions compliance program in `server/docs/ofac-compliance.md` (internal policy document, not deployed)

**Files:**
- Create: `server/src/services/complianceService.js`
- Modify: `server/src/routes/checkout.js`
- Modify: `server/src/routes/nonprofit.js`
- Modify: `server/src/middleware/auth.js` (add country screening on token verification)

---

**Add to Section 2 (Tier Definitions) — New Section 2.5:**

### 2.5 Credit System Legal Constraints

The following constraints apply to the credit system to minimize stored value and money transmission regulatory risk. These constraints must be enforced in both the Terms of Service and the backend implementation.

| Constraint | Rule | Implementation Location |
|-----------|------|------------------------|
| Non-transferability | Credits (both monthly and bonus/pack) are non-transferable between user accounts | Terms of Service; `creditService.js` must reject inter-account transfers |
| No cash redemption | Credits have no cash value and cannot be redeemed for cash, refunds, or monetary equivalents | Terms of Service; no refund endpoint for credit packs |
| Pack expiration | Credit pack bonus credits expire 12 months after purchase if unused, to avoid indefinite stored-value accumulation | `credit_packs` schema add `expiresAt: Timestamp`; daily cron job expires packs |
| Subscription-linked credits | Monthly credits expire at the end of the billing period and do not carry over (already designed this way — confirm in ToS) | Confirmed in credit_balances schema; add to ToS |
| Refund policy | Credit pack purchases are non-refundable once any credit from the pack has been consumed; partially unused packs may be refunded pro-rata within 14 days at company discretion | Terms of Service; Stripe refund policy configuration |

**AC:**
- [ ] Add `expiresAt: Timestamp` field to `credit_packs` schema, set to `purchasedAt + 365 days`
- [ ] Daily cron job checks `credit_packs` for expired packs and zeroes out remaining credits, creating a `credit_transactions` record of type `'expiration'`
- [ ] `creditService.js` enforces non-transferability (userId on pack must match consuming userId)
- [ ] All constraints documented in Terms of Service

---

**Add to Section 8 (Admin Features) — New Section 8.9:**

### 8.9 Security Incident Response and Breach Notification

#### Story NR-04: Implement Security Incident Logging and Breach Notification Workflow

**As a** legal and security stakeholder, **I want** the system to have an incident detection and notification workflow, **so that** the company can meet its data breach notification obligations under applicable law.

**AC:**
- [ ] Implement structured security event logging in `server/src/utils/logger.js` for the following events:
  - Failed webhook signature verification attempts (potential Stripe spoofing)
  - Multiple failed authentication attempts (brute force indicator)
  - Admin data exports (who, when, what)
  - Bulk credit consumption anomalies (>80% of tier allocation in <24 hours, per existing Section 8.7 alert)
  - Subscription manipulation attempts (e.g., unauthorized tier changes)
- [ ] Maintain a `security_events` Firestore collection (admin-only, write-once) for high-severity events
- [ ] Add admin UI indicator at `/app/admin/security` showing recent security events (MVP: table view of `security_events`)
- [ ] Document (in internal runbook, not deployed): breach notification SLA — GDPR requires notification to supervisory authority within 72 hours of becoming aware of a breach (Article 33); all 50 U.S. states have notification deadlines ranging from 30–90 days
- [ ] Stripe credentials compromise procedure: documented steps for immediate key rotation, Stripe support escalation, and subscriber notification template

**Files:**
- Modify: `server/src/utils/logger.js`
- Create: `server/src/routes/admin/security.js`
- Modify: `server/src/services/webhookService.js` (add failed-signature logging)

---

**Add to Section 2 (Tier Definitions) — New Section 2.6:**

### 2.6 Refund and Cancellation Policy

The following refund and cancellation terms must be implemented in the Terms of Service and reflected in the system behavior:

| Scenario | Policy | System Behavior |
|---------|--------|----------------|
| Cancellation within 24 hours of first subscription | Full refund at subscriber request | Admin manual refund via Stripe Dashboard + backend tier reversion |
| Cancellation after 24 hours | No refund; access continues to period end | Current design (cancel at period end) — correct |
| Downgrade | No refund of difference; lower tier access at next period | Current design — correct |
| Upgrade mid-cycle | Proration charged immediately | Current design — correct |
| Payment failure | 7-day grace period then access reverted | Current design — disclose in ToS |
| Credit pack purchase | Non-refundable once any credit consumed; 14-day refund window for completely unused packs | Requires new refund endpoint or documented manual process |
| Nonprofit verification rejection | User remains on Basic (free); no charge was made | Current design — correct |

**AC:**
- [ ] All refund/cancellation terms documented in Terms of Service before go-live
- [ ] 24-hour cancellation window for new subscriptions must be surfaced in the Welcome modal (`RegistrationSuccess.jsx`) and in the first billing email
- [ ] `POST /api/subscriptions/cancel` must check whether the subscription is within 24 hours of creation and flag it for admin review for potential full refund
- [ ] Admin subscription management view (Section 8.2.3) must show subscription age to facilitate 24-hour refund decisions

**Files:**
- Modify: `server/src/routes/subscriptions.js`
- Modify: `src/components/auth/RegistrationSuccess.jsx` (add cancellation window notice)

---

## Modified Requirements

### Modified Requirement 1: Story 2.4 — Checkout Session Creation Must Include ToS Version and Geo-Screening

**Original text (Section 9, Story 2.4, AC item):**
> - Creates Stripe customer if user doesn't have one
> - Stores `stripeCustomerId` on user doc
> - Sets `metadata.userId` and `metadata.tier` on checkout session
> - Returns `{ sessionId, url }`

**Revised text:**
> - Creates Stripe customer if user doesn't have one
> - Stores `stripeCustomerId` on user doc
> - Sets `metadata.userId`, `metadata.tier`, and `metadata.tosVersion` on checkout session for audit trail
> - Validates user country/region against OFAC sanctions list before creating session; returns HTTP 403 for sanctioned jurisdictions
> - Validates user age attestation record exists (from registration) before creating checkout session; returns HTTP 400 if no age attestation on record
> - Creates `tos_acceptances` record capturing IP address, user agent, ToS version, and acceptance timestamp server-side
> - Returns `{ sessionId, url }`

---

### Modified Requirement 2: Section 3.8 — `nonprofit_verifications` Schema Must Include Retention and Fraud Fields

**Original schema (Section 3.8):**
```javascript
{
  userId: string,
  organizationName: string,
  ein: string,
  documentUrl: string,
  documentFileName: string,
  status: string,
  reviewedBy: string | null,
  reviewedAt: Timestamp | null,
  rejectionReason: string | null,
  verifiedAt: Timestamp | null,
  expiresAt: Timestamp | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Revised schema:**
```javascript
{
  userId: string,
  organizationName: string,
  ein: string,
  countryCode: string,                  // ADD: ISO 3166-1 alpha-2 country code
  nonprofitRegistrationType: string,    // ADD: 'us_501c3' | 'uk_charity' | 'ca_registered_charity' | 'other'

  // Document upload
  documentUrl: string,
  documentSignedUrlExpiry: Timestamp,   // ADD: signed URL expiry; regenerate on admin review
  documentFileName: string,
  documentRetainUntil: Timestamp,       // ADD: date after which document should be purged

  // Applicant attestation
  applicantAttestedAt: Timestamp,       // ADD: timestamp of fraud-prevention attestation
  applicantAttestationIp: string,       // ADD: IP at time of attestation
  iersVerificationResult: string | null, // ADD: 'verified' | 'not_found' | 'skipped' | null

  // Verification status
  status: string,
  reviewedBy: string | null,
  reviewedAt: Timestamp | null,
  rejectionReason: string | null,

  // Expiration
  verifiedAt: Timestamp | null,
  expiresAt: Timestamp | null,
  reVerificationReminderSentAt: Timestamp | null,  // ADD: track reminder email

  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

### Modified Requirement 3: Section 2.1 (Agency Tier) — "Unlimited" Data Retention Must Be Bounded

**Original text:**
> #### Agency — $299/month
> - **Data Retention**: Unlimited

**Revised text:**
> #### Agency — $299/month
> - **Data Retention**: Retained for the duration of the active subscription plus 90 days following cancellation. After cancellation, subscribers may request a data export (available for 90 days post-cancellation). Data is purged after the export window expires. Note: Billing records (invoices, credit transactions, ToS acceptance records) are retained for 7 years per tax record-keeping requirements, in pseudonymized form after account deletion.

**Rationale:** "Unlimited" data retention is incompatible with GDPR Article 5(1)(e) storage limitation, creates indefinite cost and security exposure, and is not what the subscriber relationship contractually requires. The key subscriber expectation — that their data is available while they are paying customers — is preserved.

---

### Modified Requirement 4: Section 4.4.3, `POST /api/credits/auto-refill` — Require Consent Record and Confirmation

**Original specification:**
```
Request:
{
  enabled: boolean,
  packType: 'starter' | 'pro' | 'mega'  // Required if enabled=true
}

Response (200):
{
  autoRefill: {
    enabled: boolean,
    packType: string | null
  }
}
```

**Revised specification:**
```
Request:
{
  enabled: boolean,
  packType: 'starter' | 'pro' | 'mega',  // Required if enabled=true
  consentConfirmed: boolean,              // ADD: must be true when enabled=true; client must present disclosure
  tosVersion: string                      // ADD: version of ToS displayed to user at consent
}

Response (200):
{
  autoRefill: {
    enabled: boolean,
    packType: string | null,
    maxChargesPerMonth: number,           // ADD: calculated max charge (e.g., 3 * $200 = $600)
    consentRecordId: string | null        // ADD: ID of tos_acceptances record created
  }
}

Errors (new):
- 400: consentConfirmed must be true when enabling auto-refill
- 400: tosVersion is required when enabling auto-refill
```

**Backend behavior addition:** When `enabled: true`, the endpoint must: (1) create a `tos_acceptances` record with `method: 'auto_refill_enable'`; (2) send a confirmation email to the user stating the pack type, per-occurrence price, monthly maximum, and instructions to disable; (3) reject requests where `consentConfirmed !== true` even if the frontend appears to have sent it.

---

### Modified Requirement 5: Story 1.4 — Firestore Security Rules Must Address Data Subject Rights

**Original AC (Story 1.4):**
> - `credit_transactions/{transId}`: Users can read their own transactions (where `userId == request.auth.uid`). Only backend can write.

**Revised AC:**
> - `credit_transactions/{transId}`: Users can read their own transactions (where `userId == request.auth.uid`). Only backend (Admin SDK) can write. **Deletion is prohibited for all parties via security rules** — deletion of billing records is handled exclusively by the pseudonymization process in the privacy service, which overwrites PII fields rather than deleting documents, to satisfy both GDPR erasure and financial record retention obligations simultaneously.
> - Add new `tos_acceptances/{acceptanceId}` rule: Users may create records where `userId == request.auth.uid`. No party (including admin) may update or delete records. Admin SDK read-only for audit purposes.
> - Add new `deletion_audit_log/{logId}` rule: Only backend (Admin SDK) may write. Admin-only read. No deletions permitted.

---

## Questions & Concerns

1. **Governing Jurisdiction**: What jurisdiction will govern the Terms of Service? The choice of governing law significantly affects the enforceability of the arbitration clause, the class action waiver, auto-renewal disclosure requirements, and the money transmission regulatory analysis. Does the company have outside counsel in the chosen jurisdiction?

2. **AI Model Provider Agreement**: Which LLM provider(s) power the AI features? The provider's Terms of Service likely contain provisions about commercial use, output ownership, and prohibited content that affect the AI Policy and the company's liability exposure for AI-generated outputs. Has legal reviewed the LLM provider agreements?

3. **Stripe Merchant of Record**: Is the company acting as the merchant of record for all transactions, or is Stripe acting in that capacity for any? This affects chargebacks, refund obligations, and the company's PCI-DSS attestation requirements. Confirm with Stripe that the current integration model (Stripe Checkout, no card data touched) qualifies for SAQ A (the most limited PCI-DSS self-assessment questionnaire) and not SAQ A-EP.

4. **White-Label Liability**: The Freelance and Agency tiers offer white-label reports that subscribers deliver to their own clients. When an Agency subscriber delivers a white-labeled AI-generated accessibility report to their client, who is liable for errors in that report? Does the company have any exposure to the Agency subscriber's clients (third-party beneficiary theories)? This needs to be addressed in both the B2B Terms of Service and the white-label feature documentation.

5. **Nonprofit Tier Discrimination Risk**: The nonprofit tier is exclusively defined as 501(c)(3) — a U.S. tax designation. If the platform acquires users in jurisdictions where comparable nonprofit status is designated differently, and those users are denied the discount, is there any risk of discrimination claims or consumer protection complaints? Has legal assessed this?

6. **Agency Tier "Unlimited Seats" and Employment Classification**: The Agency tier allows unlimited seats under a single subscription. If the Agency subscriber's "team members" include contractors or gig workers, does the way the platform provisions team access create any co-employment risk for the platform, particularly given the growing trend of state-level worker classification laws (California AB5, etc.)? This is a lower-probability but non-zero concern worth flagging.

7. **Credit Consumption by Frontend Call**: Section 7.2 specifies that the frontend calls `POST /api/credits/consume` before executing the action. If the backend credit deduction succeeds but the actual tool action subsequently fails (server error, timeout, upstream API failure), the user loses credits for a service not rendered. The document mentions a 402 response for insufficient credits but does not describe a credit reversal or rollback mechanism for failed actions. This creates both a consumer protection concern (charging for services not delivered) and a chargeback risk if users dispute the overage charges. Has this failure scenario been analyzed?

8. **Invoice Requirements for EU/UK Subscribers**: If the platform serves subscribers in the EU or UK, Stripe-generated invoices must comply with local VAT invoicing requirements (specific mandatory fields, VAT number display, sequential invoice numbering). Has legal confirmed whether international subscribers are in scope for v1, and if so, has the VAT configuration in Stripe been reviewed?

9. **Data Residency**: Firebase/Firestore and the Stripe data storage are U.S.-based by default. If the platform acquires EU subscribers, GDPR Chapter V requires an adequate data transfer mechanism (adequacy decision, SCCs, or BCRs) for transfer of personal data to the U.S. Firebase provides SCCs via its Data Processing Addendum, but the company must execute that DPA. Has this been reviewed?

10. **Insurance Coverage Review**: Has the company's cyber liability, errors and omissions, and directors and officers insurance been reviewed to confirm coverage for: (a) a payment data incident; (b) claims arising from AI-generated content used commercially by subscribers; (c) regulatory investigations by the FTC, state AGs, or international privacy regulators?

---

## Approval Status

**Approval Status: Needs Revision**

This document is **not approved for implementation** in its current form. Implementation of any paid subscription features must be conditioned on completion of the following:

**Conditions for Approval:**

1. **Legal must draft and finalize Terms of Service** incorporating: subscription agreement terms, auto-renewal disclosures compliant with all applicable state laws, SLA terms with defined remedies, limitation of liability and warranty disclaimers, AI output disclaimer and IP provisions, indemnification provisions, arbitration clause and class action waiver, governing law and venue, data retention terms, refund and cancellation policy, credit system constraints (non-transferability, no cash redemption, pack expiration), and nonprofit tier eligibility terms. Terms of Service must be reviewed by outside counsel before publication.

2. **Legal must complete GDPR/CCPA compliance package** including: updated Privacy Notice, Record of Processing Activities for all new collections, data subject rights implementation plan, and Data Processing Addendum execution with Firebase/Google and Stripe.

3. **Outside counsel must provide written money transmission analysis** of the credit pack and auto-refill system before any paid users are onboarded in jurisdictions with money transmission licensing requirements.

4. **OFAC compliance program must be documented** and sanctions screening must be implemented at registration and subscription creation.

5. **New Requirements NR-01 through NR-04** (ToS acceptance records, data subject rights API, OFAC screening, security incident workflow) must be included in the implementation scope before launch.

6. **Modified Requirements 1 through 5** must be incorporated before any paid subscription goes live.

7. **Age verification attestation** must be added to the registration flow.

Items classified as Major (M01–M08) must be resolved before launch. Items classified as Minor (m01–m04) should be resolved during the implementation phase. Suggestions (S01–S04) may be deferred to a post-launch roadmap with legal sign-off.