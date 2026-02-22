# Sr. Visual Designer — Requirements Review
**Reviewer:** Sr. Visual Designer
**Document:** pricing-payments-requirements.md
**Date:** 2026-02-22
**Status:** Complete

---

## Executive Summary

This requirements document represents a thorough product and engineering specification for a tiered subscription system layered onto an existing content and SEO SaaS platform. The business logic, data models, API contracts, and compliance requirements are developed with notable rigor, particularly across the Wave 1 amendments covering legal, annual pricing, trial mechanics, and cancellation retention. From a visual design standpoint, however, the document reveals a consistent and consequential gap: front-end component specifications describe layout in ASCII wireframe form and enumerate props and data, but they almost entirely omit the visual design language that governs the user's moment-by-moment experience. Interaction states, motion specifications, color semantics beyond a single three-state gauge color table, dark mode posture, skeleton loading patterns, toast placement and anatomy, error state design, and the typographic hierarchy within each component are either absent or referenced implicitly by deferring to "existing design language" without verifying that existing patterns cover all new contexts.

The most acute omissions center on the components carrying the heaviest conversion weight: the public pricing page (Section 5.1), the annual/monthly toggle (Section 13.4), the cancellation retention modal (Section 16), and the credit usage gauges inside the billing dashboard (Section 5.2.2). Each of these surfaces requires precise visual design guidance to be built correctly by a developer working without designer pairing. Missing this guidance does not produce a neutral outcome — it produces inconsistent implementations that will require costly rework after the fact. Several findings in this review are therefore marked Critical, meaning they must be resolved before implementation begins, not after.

There are also structural concerns about the feature comparison table (Section 5.1.3) on mobile, the subscription status banner system (Section 6.3 / Section 7.10), the toast notification system, and the visual treatment of the five distinct subscription status states. The document names these components and their triggering conditions with precision, but it does not define what "a red banner" looks like in a system that already uses red for error states in tool components, creating potential semantic confusion. This review catalogues these findings, proposes specific remediation language, and recommends new requirements to be added before the document is marked implementation-ready.

---

## Sections Reviewed

| Section | Title | Focus Level |
|---------|-------|------------|
| 5.1 | Public Pricing Page | Deep |
| 5.1.1 | Layout & Design | Deep |
| 5.1.2 | Pricing Card Component | Deep |
| 5.1.3 | Feature Comparison Table | Deep |
| 5.1.4 | Credit Explainer Section | Standard |
| 5.1.5 | FAQ Section | Standard |
| 5.2 | Billing Dashboard | Deep |
| 5.2.1 | Billing Dashboard Layout | Deep |
| 5.2.2 | Billing Dashboard Subcomponents | Deep |
| 5.3 | Invoice History Page | Standard |
| 5.4 | Plan Management Page | Standard |
| 5.5 | Credit History Page | Standard |
| 5.8 | Shared UI Components | Deep |
| 6.2 | Updated Registration Flow | Deep |
| 6.3 | SubscriptionContext | Light |
| 7.6 | Soft Gate UX | Standard |
| 7.10 | Subscription Status Enforcement | Deep |
| 10.1 | Code Conventions | Standard |
| 13.4 | Annual/Monthly Toggle | Deep |
| 14.2 | Trial User Stories | Deep |
| 16.1 | Cancellation Retention Modal | Deep |
| 17.3 | Auto-Refill Authorization Disclosure | Standard |
| 19.4 | Pre-Checkout Disclosure Requirements | Standard |
| All Appendices | File Manifest, Dependency Graph | Light |

---

## Findings

### Critical (Must fix before implementation)

**[REQ-06-C01]** Section 5.1.2 — **Pricing Card Visual Hierarchy is Undefined**: The card specification enumerates content elements (tier name, tagline, price, credit allocation, feature bullets, CTA) but provides no typographic scale, no spacing rhythm, no minimum card height, and no definition of what constitutes "elevated shadow" or "primary border" for the Freelance card. The description says "highlighted card (elevated shadow, primary border)" without specifying shadow values (e.g., `shadow-xl` vs `shadow-2xl` vs a custom drop shadow), border width, or whether the elevation is achieved via CSS `transform: translateY(-4px)` or simply via shadow. "Most Popular" ribbon placement is also unspecified: is it a corner badge, a full-width top banner, an absolute-positioned ribbon overlay, or an inline chip above the card title? This ambiguity guarantees divergent implementations across the five tiers and will require visual rework post-build. **Recommendation:** Add a visual specification block to Section 5.1.2 that defines: (1) card border radius (reference existing `rounded-*` tokens in use), (2) border width and color token for each tier's accent treatment, (3) shadow token for the base card and the Freelance elevated card, (4) explicit placement and anatomy of the "Most Popular" badge (e.g., absolute-positioned chip, `top-4 right-4`, `bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full`), (5) card minimum height or height equalization strategy across tiers, and (6) the typographic scale for tier name, price, and feature bullets (reference the project's existing heading scale).

**[REQ-06-C02]** Section 13.4 — **Annual/Monthly Toggle Interaction Design is Absent**: Section 13.4 introduces a critical conversion UI element — a billing interval toggle — but specifies only its behavioral outputs (which prices to show, what to pass to the API). There is zero specification for the toggle's visual form: is it a segmented control, a pill toggle with a sliding indicator, two radio buttons, or a checkbox with a "Save 17%" label? There is no specification for the "Save 17%" callout positioning relative to the toggle (inline? below? a pill badge?), the selected-state indicator (color fill? underline? bold?), or the animation when switching between states (instantaneous price number swap vs. a fade/crossfade). For a toggle that directly impacts whether users choose annual or monthly — a decision worth hundreds of dollars per year per user — this is a conversion-critical design gap. Stripe, Paddle, and every major SaaS pricing page treats this toggle as a primary design element. **Recommendation:** Add a new subsection (Section 13.4.1) titled "Toggle Component Design" specifying: (1) visual form: a pill-shaped segmented control (`bg-gray-100 rounded-full p-1`) with a sliding indicator (`bg-white rounded-full shadow-sm`) that animates on selection via CSS transition (`transition-transform duration-200 ease-in-out`); (2) "Save 17%" shown as a `bg-emerald-100 text-emerald-700 text-xs font-semibold` badge positioned to the right of the "Annual" label; (3) price number crossfade animation specification (opacity transition, 150ms); (4) "Billed annually" sub-label under the annual price in a smaller, muted text style.

**[REQ-06-C03]** Section 16.1 — **Cancellation Retention Modal Design is Not Specified**: The cancellation retention flow is described entirely in behavioral terms (3 steps, reason options, contextual save offers) with no visual design guidance whatsoever. A 3-step modal flow is a complex UI pattern requiring specific design decisions about: step indicator visual form (dots? numbered circles? a progress bar?), which step occupies the modal's "primary" zone vs. a dismissible header, how much vertical space the reason-selection radio buttons require, the visual treatment of the contextual save offer (does a pause CTA look like a primary button or a secondary card?), the prominence hierarchy between "Accept offer" and "Continue to cancel" actions, and how the modal handles content height change between steps (smooth height animation or fixed height with scrolling overflow). Without this guidance, the three steps risk feeling like separate, disconnected dialogs rather than a coherent retention conversation. **Recommendation:** Add Section 16.3 "Retention Modal Visual Design" specifying: (1) modal container width (`max-w-lg`, `rounded-2xl`, no backdrop scroll); (2) step indicator as numbered circular stepper at top (`w-8 h-8 rounded-full flex items-center justify-center`, `bg-primary text-white` for current step, `bg-gray-200 text-gray-500` for pending, `bg-emerald-500 text-white` with checkmark for completed steps); (3) reason radio buttons as full-width clickable cards (`border rounded-lg p-3 hover:border-primary cursor-pointer`) rather than inline radios; (4) save offer step uses a two-column card layout — "Accept offer" as a primary filled button, "Continue to cancel" as a ghost/text button in `text-rose-600`; (5) height transitions between steps animated with `transition-all duration-300 ease-in-out`.

**[REQ-06-C04]** Section 5.1.3 — **Feature Comparison Table Mobile Behavior is Underspecified**: The requirement states "Horizontal scroll on mobile with sticky first column (feature names)" but does not specify: how the sticky column is implemented in a Tailwind context (`sticky left-0 z-10 bg-white`), whether a shadow or border separates the sticky column from the scrolling content, how column widths are distributed across five tiers on small screens, whether tier headers in the table repeat or appear only at the top, the minimum column width for tier data columns, and whether the table provides any affordance indicating it is horizontally scrollable (a scroll hint shadow, a "scroll to see all" label, or an initial slight scroll on mount to reveal the second column). On mobile screens with five data columns plus a sticky label column, this table will be the most visually dense component in the entire product. Without precise guidance, developers will default to browser-default table behavior, which is universally poor. **Recommendation:** Add Section 5.1.3.1 "Mobile Responsive Specification" specifying: (1) sticky first column with `sticky left-0 bg-white z-10 border-r border-gray-200 shadow-[2px_0_4px_rgba(0,0,0,0.05)]`; (2) tier data columns: `min-w-[100px]` with center-aligned content; (3) scroll hint: a right-side gradient fade (`from-transparent to-white`) overlaid as an absolute pseudo-element on the table wrapper, hidden via CSS when scroll position reaches end; (4) on mobile, tier column headers rendered as a sticky top row in addition to the sticky left column, to maintain context while scrolling vertically; (5) category group header rows: full-width, `bg-gray-50 font-semibold text-sm`, not part of the sticky column.

**[REQ-06-C05]** Sections 5.2.2 and throughout — **Animation and Transition Specifications are Entirely Absent**: The document specifies no motion design for any component. There are no transition durations, no easing functions, no entrance animation patterns, and no specification for animated state changes. This is not a minor omission — it affects at least the following interaction-critical moments: (a) the annual/monthly toggle price swap; (b) the credit gauge filling on load; (c) the multi-step registration flow step transitions; (d) the cancellation modal's step progression; (e) toast notification entrance and exit; (f) the subscription banner appearance on status change; (g) the plan confirmation step sliding in during registration; (h) the "Most Popular" card's hover state. Without guidance, developers will either use no animation (flat, cheap-feeling) or arbitrary animations that are inconsistent with each other. The existing design language reference ("see LandingPage.jsx, FeaturesPage.jsx") does not suffice because those pages' motion patterns are not documented in this requirements document and may not cover billing-specific contexts. **Recommendation:** Add a new Section 5.9 "Motion Design Specification" (see New Requirements section below for full proposed text).

---

### Major (Should fix before implementation)

**[REQ-06-M01]** Section 5.2.2 — **CreditUsageGauge Color Semantics Conflict with Existing Error Colors**: The billing dashboard specifies three color states for the credit usage progress bar: green (>50%), yellow (25–50%), red (<25%). However, Section 10.1 lists the project's existing color system tokens as including `rose` (which is used in the existing codebase for error and destructive states). The requirement uses the word "Red" without specifying whether this maps to `rose-500`, `red-500`, or some other token. More critically, if the application already uses `rose` for error states (form validation, destructive actions), using it for "low credits" creates a semantic collision: the user sees the same color for "you have a form error" and "you have 24% of your credits left." These are very different urgency levels. The document also provides no guidance on the gauge's visual anatomy: is it a thin line bar, a thick rounded pill, a segmented bar, or something with percentage-labeled tick marks? **Recommendation:** (1) Change the credit gauge color specification to use amber/yellow for <25% rather than red, reserving red/rose exclusively for 0 credits (truly critical) and error states. Specify: `>50%: bg-emerald-500`, `25–50%: bg-amber-400`, `10–25%: bg-orange-500`, `<10%: bg-rose-500 with pulse animation`. (2) Add gauge anatomy spec: `h-3 rounded-full bg-gray-100 overflow-hidden` track, `rounded-full transition-all duration-500 ease-out` fill, with the fill's color class determined by the percentage tier above.

**[REQ-06-M02]** Section 7.10 and Section 6.3 — **Subscription Status Banners Lack Color Semantic Differentiation**: Section 7.10 prescribes a "Red banner" for `past_due`, a "Yellow banner" for canceled-before-period-end, and a "Blue banner" for paused. Section 6.3's `SubscriptionBanner` component spec says banners are "Color and messaging per status (see Section 7.10)" but does not define the banner's visual structure, icon treatment, action button placement, or how multiple simultaneous banners (unlikely but possible during edge-case transitions) are handled. More importantly, the color assignments need semantic validation: "Blue" for paused status conflicts with the conventional use of blue for informational/neutral states — a paused subscription is not simply informational, it is actionable (the user should resume). Trialing is described with a banner in Story 14.2 ("trial banner") but no color is specified. The `incomplete` status gets a banner but no color assignment. **Recommendation:** Define a complete banner color and icon map: `trialing`: `bg-blue-50 border-blue-200 text-blue-900` with a Clock icon; `past_due` (grace): `bg-amber-50 border-amber-200 text-amber-900` with an AlertTriangle icon; `past_due` (>14 days): `bg-rose-50 border-rose-200 text-rose-900` with an XCircle icon; `canceled` (before period end): `bg-amber-50 border-amber-200` with a Calendar icon; `paused`: `bg-violet-50 border-violet-200 text-violet-900` with a PauseCircle icon; `incomplete`: `bg-amber-50 border-amber-200` with a CreditCard icon. Banner structure: `flex items-center gap-3 px-4 py-3 border-b` with left icon, center text (with inline bold for key date/amount), and right-aligned action button. Specify that banners are placed above the application's main navigation, not inside page content containers, so they appear on every authenticated page without requiring per-page implementation.

**[REQ-06-M03]** Section 5.1.2 — **Nonprofit Card "50% off" Badge is Underspecified and Potentially Misleading**: The requirement states the Nonprofit card has a "50% off" badge and "emerald accent with heart icon." This badge is visually risky because $49/month does not appear to be 50% off any listed price from a new visitor's perspective — the reference price (Client Side at $99/month) is not shown on the Nonprofit card. A "50% off" badge without a visible original price is a pattern that can erode trust and may have FTC implications (see Section 11). Additionally, the heart icon is culturally specific and may not communicate "nonprofit sector" to all users. **Recommendation:** (1) Revise badge text to "50% off Client Side pricing" or "From $99 → $49/month" shown as a crossed-out original price in the card's price display area; (2) Replace heart icon with the `HeartHandshake` or `Building` Lucide icon which is more sector-neutral; (3) Add a specification that the Nonprofit card CTA must read "Apply for Nonprofit Pricing" rather than "Start Nonprofit" since the tier requires verification — a button implying immediate activation is functionally incorrect and will cause user confusion when they land in a pending state.

**[REQ-06-M04]** Section 6.2.1 / Story 4.1 — **Multi-Step Registration Flow Visual Continuity is Not Specified**: The registration flow adds up to 3 steps (account details → plan confirmation → checkout redirect) and an alternate nonprofit path (account details → nonprofit verification → success pending). The step indicator is mentioned ("Step indicator showing current step (1/2 or 1/3)") but only its informational content is specified, not its visual form. Critically, the visual relationship between the existing registration form and the new Plan Confirmation step is not defined: does the plan confirmation appear in the same card/container as the account form? Does the page scroll to the top? Does a new card slide in from the right (a common step-navigation pattern)? Does the existing form slide out to the left while the confirmation slides in? Without this, the step transition will feel abrupt and users who are about to make a payment commitment deserve a smooth, confidence-building visual experience at precisely this moment. **Recommendation:** Add to Section 6.2.4 "Registration Form Modifications" a visual transition specification: steps slide horizontally (new step enters from right, old step exits to left) using `transition-transform duration-300 ease-in-out` on an overflow-hidden wrapper. Step indicator at top: three circles (`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold`) connected by lines (`flex-1 h-0.5 bg-gray-200`, `bg-primary` for completed segments). Both active and completed steps use `bg-primary text-white`; future steps use `bg-gray-200 text-gray-400`.

**[REQ-06-M05]** Section 5.2 and throughout — **Empty States are Not Defined for Any Billing Component**: The billing dashboard, invoice history, credit history, and plan management pages all have states where data is absent (new user with no invoices, no credit transactions, no active subscription). Story 5.3 acknowledges "Empty state for users with no invoices" but provides no visual specification. None of the other billing components mention empty states at all. Empty states are not a minor UX detail — they are the first thing a new subscriber sees on the billing pages after onboarding, and they significantly influence whether users trust the product with their payment data. An empty invoice list that shows a raw "No data" text vs. a well-designed empty state with an icon, helpful copy, and a contextual CTA has a material difference in perceived quality. **Recommendation:** Add a reusable `EmptyState` component specification to Section 5.8 "Shared UI Components": a centered container (`flex flex-col items-center justify-center py-16 text-center`) with a Lucide icon (size 48, `text-gray-300`), a heading (`text-gray-500 font-medium text-base`), a subtext (`text-gray-400 text-sm max-w-sm`), and an optional CTA button. Define the specific empty state content for each billing page: InvoiceHistory (FileText icon, "No invoices yet", "Your billing history will appear here after your first payment."), CreditHistory (Activity icon, "No credit activity", "Actions you take across all tools will appear here."), BillingDashboard for Basic tier (Rocket icon, "Upgrade to unlock more", "Get 500+ monthly credits and advanced features.", [Browse Plans] button).

**[REQ-06-M06]** Sections 2.1 and 5.1.2 — **Freelance "1 collaborator seat" Amendment is Not Reflected in Card UI**: The Wave 1 modification index (Section's final table) shows a material change: Freelance seats changed from "1" to "1 owner + 1 collaborator seat (read-only)." This is a meaningful differentiator from Client Side (strictly 1 seat) that could influence conversion. However, Section 5.1.2's card content specification still references the original tier definitions, and there is no instruction to update the card's feature bullet points to reflect this amendment. The pricing card for Freelance likely includes seat information in its 5–6 feature bullets, and this will be incorrect if built from the un-amended Section 2.1. **Recommendation:** Add an explicit note in Section 5.1.2 that all card content must be derived from the final amended `TIER_CONFIGS` constant, not directly from Section 2.1, and that the Freelance card must display "1 owner + 1 read-only collaborator" for its seat allocation bullet.

**[REQ-06-M07]** Sections 5.8 and 7.6 — **Toast Notification Design and Placement is Not Specified**: Section 10.1 mentions `react-hot-toast` as the toast library for success/error notifications. Toast notifications appear in multiple billing-critical moments: successful plan upgrade, failed plan change, successful credit pack purchase, auto-refill enabled, subscription canceled, credit consumption success, and credit consumption failure. The document does not specify: toast position (top-right vs. bottom-center vs. bottom-right), max visible toast count, toast duration, whether billing-critical toasts (e.g., "Payment failed") should persist until dismissed vs. auto-dismiss, the icon treatment within each toast type, or whether the toast for a successful Stripe redirect-and-return differs from an in-app success. React-hot-toast's defaults (top-center, 4-second auto-dismiss, minimal styling) are not appropriate for a payment context where the user has just redirected through Stripe and returned — the confirmation message is high-stakes and should not disappear in 4 seconds. **Recommendation:** Add Section 5.10 "Toast Notification Specification": position `bottom-right` for desktop, `bottom-center` for mobile; max 3 visible simultaneously with a queue; success toasts: 5 seconds, Lucide `CheckCircle` icon in `text-emerald-500`; error toasts: 8 seconds with an explicit dismiss button, Lucide `XCircle` icon in `text-rose-500`; payment-related success toasts (after Stripe redirect returns): 10 seconds, do not auto-dismiss during active tab, show a summary of what was activated (tier name and credit allocation). Warning toasts (credit deducted, nearing limit): 5 seconds, Lucide `AlertTriangle` in `text-amber-500`.

**[REQ-06-M08]** Section 5.8 / Story 6.3 — **SubscriptionBanner Placement vs. Existing Layout Architecture is Not Reconciled**: Story 5.8 instructs adding "credit balance indicator to app header" and the SubscriptionBanner is to be "Placed at top of app layout." However, the document references `ToolLayout.jsx` as the target for modification without examining whether ToolLayout has an existing fixed header that would cause the banner to push content or overlap. If ToolLayout's header is `position: sticky` or `position: fixed`, inserting a variable-height banner above it requires careful `top` offset recalculation throughout the application. This is not a design detail that can be deferred to the developer — it requires a decision upfront about the layout stacking order. **Recommendation:** Add a layout specification to Story 6.3: the SubscriptionBanner must render as the first child of the authenticated layout's root container, above the sticky header. If the current header uses `top-0 sticky`, the banner's presence must dynamically offset the header's `top` value using a CSS custom property (`--banner-height: 0px`, updated to the rendered banner height via `useLayoutEffect`). Maximum one banner visible at a time — if the user has `past_due` status and a pending price change notice simultaneously, the more severe status (past_due) takes precedence.

---

### Minor (Fix during implementation)

**[REQ-06-m01]** Section 5.1.4 — **Credit Explainer "Visual Credit Meter" is Undefined**: The credit explainer section calls for a "visual credit meter showing typical monthly usage for each tier" but does not specify whether this is a bar chart, a segmented progress bar, an illustrated icon grid, or a simple numeric table. This element could be as simple as a row of five labeled progress bars or as complex as an animated bar chart comparison. The effort difference is significant. **Recommendation:** Specify that the credit meter is a static horizontal stacked bar visualization: one row per tier, showing "used" vs. "remaining" for a hypothetical typical month. Use Tailwind `flex` with two `div` children (used portion in `bg-primary/40`, remaining in `bg-gray-100`), labeled with tier name on left and credit count on right. No JavaScript charting library required — keep it CSS-only for performance.

**[REQ-06-m02]** Section 5.3 — **Invoice Status Badges Lack Specification for "Void" State**: Section 5.3 specifies green for "Paid" and yellow for "Open" but mentions "Void (gray)" without noting the visual treatment for "Uncollectible" — a status that exists in the Firestore invoice schema (Section 3.7). Users who have disputed or had invoices written off may see this status, and displaying it with no color guidance leaves it undefined. **Recommendation:** Add to the invoice status badge specification: `paid: bg-emerald-100 text-emerald-700`, `open: bg-amber-100 text-amber-700`, `void: bg-gray-100 text-gray-500`, `uncollectible: bg-rose-100 text-rose-700`. All badges should follow the `text-xs font-medium px-2.5 py-0.5 rounded-full` pattern consistent with the project's existing badge usage.

**[REQ-06-m03]** Section 5.5 — **Credit History Color Coding Conflicts with Invoice Color Meaning**: Section 5.5 specifies "Color coding: debits in red, credits/resets in green." Section 5.3 uses green for paid invoices. Within the same billing section of the product, green means two distinct things (paid status, credit added) and red means two distinct things (insufficient/error, debit). This is acceptable if the contexts never co-appear, but a user looking at the billing dashboard's "Recent Activity" list adjacent to invoice status badges will see the same green used for both "credit added" and "invoice paid." The semantic consistency is fragile. **Recommendation:** Use a directional arrow + amount color pattern for credit transactions: debit rows show `text-rose-600` for the amount with a downward arrow icon; credit/reset rows show `text-emerald-600` with an upward arrow icon. This matches the convention used in bank statements and is more universally understood than color alone (also improves accessibility for colorblind users).

**[REQ-06-m04]** Section 5.1.5 — **FAQ Accordion Animation Not Specified**: Story 3.3 says "Accessible: uses `<details>`/`<summary>` or equivalent with ARIA." The native `<details>` element does not support animated open/close transitions in a cross-browser-consistent way. If the project is already using a custom accordion (likely, given the existing design system), the FAQ may visually break the pattern by using a native element. **Recommendation:** Specify that FAQ uses a custom accordion matching any existing pattern in the codebase (check if `FeaturesPage.jsx` has accordion-style content). If no existing pattern: use controlled state with `max-height` transition (`transition-[max-height] duration-300 ease-in-out`, `max-h-0 overflow-hidden` to `max-h-screen`). Each item header uses a `ChevronDown` Lucide icon that rotates 180° when open (`transition-transform duration-300`).

**[REQ-06-m05]** Section 5.1.2 — **"Current Plan" CTA State for Authenticated Users Missing Disabled Style Specification**: The requirement states authenticated users on the current tier see a "Current Plan" (disabled) button. No disabled visual treatment is specified. A disabled button that uses the same color family as an active button but with `opacity-50` looks very different from a button that switches to a neutral gray outline with `cursor-default`. For a pricing page where the user is comparing plans, the "Current Plan" indicator should clearly mark where they are without looking broken or inaccessible. **Recommendation:** Specify: `Current Plan` button renders as `border-2 border-primary text-primary bg-transparent cursor-default opacity-100 font-medium` with a `CheckCircle` icon prepended. Do NOT use `opacity-50` (fails WCAG 1.4.3 contrast requirements). Do NOT use `disabled` attribute (removes button from tab order and assistive technology traversal — user should be able to tab to it and understand it).

**[REQ-06-m06]** Section 6.2.1 / Story 4.3 — **Registration Success "Welcome Modal" Lacks Visual Specification**: The RegistrationSuccess component is described as a "welcome modal/page" but is not specified as either — it could be a full-page redirect, a centered modal overlay, or an in-page banner on the dashboard. The content (tier name, credit allocation, getting-started tips) is listed but not visually structured. For users who have just completed a payment and been redirected back from Stripe, this is the single highest-stakes "first impression" of their new subscription. **Recommendation:** Specify RegistrationSuccess as a full-screen overlay modal (`fixed inset-0 bg-black/50 flex items-center justify-center z-50`) with a centered card (`bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl`). Content order: (1) a large success icon — Lucide `CheckCircle2` in `text-emerald-500` at `w-16 h-16` centered; (2) heading "Welcome to [Tier Name]!" in `text-2xl font-bold`; (3) a horizontal credit summary row showing both credit types as icon+number pairs; (4) 3 getting-started tip bullets; (5) a full-width "Get Started" primary CTA button. The modal animates in using a `scale-95 opacity-0` → `scale-100 opacity-100` transition over 350ms.

**[REQ-06-m07]** Section 5.4 — **Plan Management Confirmation Modal Lacks Specification**: Story 5.4 mentions "Confirmation modals explain exactly what will happen (immediate charge vs end-of-period change)" but gives no design guidance. Confirmation modals for plan changes are high-stakes: if the modal is too easy to dismiss accidentally (e.g., clicking outside closes it), users could trigger unintended charges. **Recommendation:** Specify that plan change confirmation modals must: (1) not close on backdrop click; (2) have explicit "Confirm Upgrade" and "Cancel" labeled buttons; (3) display the financial impact summary in a visually distinct box (`bg-gray-50 border border-gray-200 rounded-lg p-4`) showing old price, new price, and prorated amount; (4) the destructive path (downgrade confirmation or cancellation confirmation) uses `bg-rose-600 hover:bg-rose-700` for the confirm button, while upgrade uses `bg-primary`.

**[REQ-06-m08]** Section 5.8 — **CreditBadge Color State Logic Conflict**: Story 6.3 specifies the CreditBadge as "Color: default gray, yellow when <25% credits remaining, red when can't afford." This creates a rendering dependency: the badge must know the user's current credit balance to determine its color state. However, CreditBadges appear next to action buttons throughout the app — if there are fifteen credit-consuming components, all fifteen badges are computing this state. The color behavior also means a badge for an AI action (cost: 3 AI credits) will be red when AI credits are exhausted even if standard credits are plentiful. The spec does not clarify whether the color reflects the specific credit pool (standard vs. AI) that the action draws from. **Recommendation:** Clarify in the CreditBadge specification that: (1) color reflects the specific credit type for the action (AI credit actions reflect AI credit pool; standard actions reflect standard credit pool); (2) color states: `default: bg-gray-100 text-gray-600`, `warning (<25%): bg-amber-100 text-amber-700`, `critical (cannot afford): bg-rose-100 text-rose-700`; (3) CreditBadge should be a pure presentational component — pass `creditsRemaining` and `creditCost` as props rather than reading from context internally, to avoid 15 simultaneous context subscriptions.

**[REQ-06-m09]** Section 15.2 / Story 15.1 — **Enterprise Lead Capture Modal Has a Typo in the File Name**: Story 15.1 lists the file to create as `src/components/public/EnterpriseLead Modal.jsx` — note the space in the filename. This will cause an import error. **Recommendation:** Correct to `EnterpriseLeadModal.jsx` (no space, camelCase).

**[REQ-06-m10]** Section 14.2 — **Trial Countdown Visual Treatment Undefined**: Story 14.2 mentions "Billing dashboard shows trial countdown in days when `subscriptionStatus === 'trialing'`" and "1 day before trial end: In-app full-screen prompt on next login." The trial countdown display location and visual form on the billing dashboard is not specified, and the "full-screen prompt" is not given any design guidance. A full-screen prompt one day before trial end is a very aggressive pattern that may feel hostile to users who have genuinely been testing the product. **Recommendation:** Specify the trial countdown as part of the SubscriptionBanner for `trialing` status, displaying a progress bar showing days elapsed vs. total trial days alongside the text. The "1 day before trial end" prompt should be a modal (not full-screen takeover) that appears once per login session, is dismissible, and offers "Add payment method" as the primary CTA and "Remind me later" as secondary.

---

### Suggestions (Consider for future)

**[REQ-06-S01]** Section 5.1 — **Consider a Pricing Page "Hero" Visual Element**: The pricing page hero section is described as containing a heading and subtitle only. For a product with a sophisticated credit system, a visual hero element — such as an animated credit meter showing all four tiers simultaneously, or a simplified tool icon grid — could significantly increase comprehension dwell time and reduce bounce before users reach the pricing cards. Worth exploring in design before implementation.

**[REQ-06-S02]** Section 5.2 — **Consider a "Credit Health" Summary View**: The billing dashboard's credit display is functional (two gauges, numbers, reset date) but it misses an opportunity to create a genuinely informative "credit health" view that shows, for example, a usage trend sparkline for the last 30 days derived from `credit_transactions`. Users who see their usage trend are better positioned to decide whether to buy a credit pack or upgrade — which is a direct conversion opportunity.

**[REQ-06-S03]** Section 5.1.3 — **Consider a "Build Your Plan" Interactive Comparison**: Rather than a static feature comparison table, a tab-based "compare two plans" interaction would dramatically reduce the cognitive load of comparing five tiers simultaneously, especially on mobile. This is a future enhancement, but the current table's complexity should be a signal that the table alone may not be sufficient for conversion.

**[REQ-06-S04]** Throughout — **Dark Mode Posture Should Be Declared**: The document never mentions dark mode. The existing codebase uses Tailwind CSS, which has first-class `dark:` variant support. A SaaS tool used for extended work sessions (technical audits, content analysis) will likely receive user requests for dark mode. Without a declared posture ("We are not building dark mode for v1" or "All new components must support dark mode"), individual developers will make inconsistent choices — some will add `dark:` variants, others won't. This creates technical debt that is expensive to retrofit. Recommendation: add a line to Section 10.1 declaring the project's dark mode posture explicitly.

**[REQ-06-S05]** Section 8.2 — **Admin Subscription Dashboard Chart Colors Not Defined**: The admin dashboard uses `chart.js` for MRR trend, subscriber by tier, and revenue breakdown charts. Chart colors for the five tiers should be defined centrally and consistently with the pricing card tier colors used on the public page. If the Freelance tier card uses `primary`, the Freelance segment in the subscriber pie chart should use the same color. Without a color map definition, chart colors will be chart.js defaults (which are not aligned with the product's color system).

---

## New Requirements

### NR-01: Section 5.9 (NEW) — Motion Design Specification

Add a new section to the Frontend Components section:

**Section 5.9 — Motion Design Specification**

All new billing and pricing components must follow a consistent motion design vocabulary. The following parameters define the baseline:

**Easing functions** (use Tailwind's built-in easing or equivalent CSS values):
- Entrance animations: `ease-out` (elements entering the viewport feel natural, not mechanical)
- Exit animations: `ease-in` (elements leaving feel intentional)
- Interactive state changes (hover, focus, toggle): `ease-in-out`
- Error state shake: `ease-in-out` with `cubic-bezier(0.36, 0.07, 0.19, 0.97)` keyframe

**Duration scale:**
- Micro-interactions (button hover color, icon rotate): 150ms
- State changes (toggle switch, badge color): 200ms
- Accordion open/close, gauge fill on mount: 300ms
- Step transitions in multi-step flows: 350ms
- Modal entrance/exit: 300ms (`ease-out` entrance, `ease-in` exit)
- Toast entrance/exit: 250ms

**Credit gauge fill animation:** On component mount, the gauge fill should animate from 0% to its actual value over 600ms with `ease-out`. This single animation dramatically improves the perception of the dashboard's live data quality.

**Annual/monthly price swap:** When the user toggles billing interval, price numbers should crossfade (opacity 1 → 0 → 1) over 200ms. The "Save 17%" badge should slide in from below (`translate-y-2 opacity-0` → `translate-y-0 opacity-100`) when annual is selected.

**No animation for users who prefer reduced motion:** All animations must be wrapped in a `@media (prefers-reduced-motion: reduce)` check or use Tailwind's `motion-reduce:` variants. Credit gauge fills instantly at its final value. Step transitions are instantaneous. Modal appears immediately.

---

### NR-02: Section 5.8.5 (NEW) — Skeleton Loading State Specification

Add to Section 5.8 "Shared UI Components":

**SkeletonLoader component** — A reusable shimmer skeleton for billing components that load asynchronously.

Anatomy: `animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite] rounded`

Required skeleton variants:
- `SkeletonText` — single line of simulated text, configurable width
- `SkeletonCard` — full card outline with inner text lines
- `SkeletonGauge` — rectangular block simulating the credit usage gauge
- `SkeletonTable` — 5-row table skeleton for invoice and credit history lists
- `SkeletonMetricCard` — square tile for admin dashboard metric cards

The BillingDashboard must render skeleton cards for CurrentPlanCard, both CreditUsageGauges, and the recent activity list while `loading: true` from `useSubscription`. The InvoiceHistory and CreditHistory pages must render a SkeletonTable while fetching paginated data. Loading skeletons must match the visual footprint of the loaded content to prevent layout shift (CLS score impact).

---

### NR-03: Section 5.1.2.1 (NEW) — Pricing Card Hover and Focus States

Add to Section 5.1.2:

All pricing cards (Basic, Client, Freelance, Agency, Nonprofit) must implement the following interactive states:

**Hover state** (pointer device): `transform: translateY(-2px)` with `transition-transform duration-200 ease-out`, `box-shadow` increase by one step (e.g., `shadow-md` → `shadow-xl`). Color accent on left border increases in opacity from 50% to 100%.

**Focus-visible state** (keyboard navigation): `outline: 2px solid var(--color-primary)`, `outline-offset: 4px`. Focus must be visible on the card container when the CTA button within it receives focus, ensuring the entire card context is visible to keyboard users.

**Freelance card special hover:** The "Most Popular" badge applies a subtle pulse animation on initial page load to draw attention (`animate-bounce` for 2 iterations, then stops). This should only fire once per page session.

**Agency card dark styling:** The Agency card uses a dark background (`bg-charcoal-900` or `bg-gray-900`). All text within must be explicitly white/light (`text-white` for heading and price, `text-gray-300` for bullets). The hover state for the Agency card lifts as other cards but does not change the border color (border stays accent gold or white, not primary blue which would be hard to see on dark background).

---

### NR-04: Section 7.6.1 (NEW) — Inline Credit Insufficient State Visual Specification

The soft gate inline banner described in Section 7.6 ("⚠ This action requires 5 standard credits. You have 2 remaining.") requires a formal component specification:

The inline insufficient-credits banner renders immediately below the triggering action button (not as a toast, not as a modal). It must:
- Use `role="alert"` and `aria-live="polite"` for screen reader accessibility
- Visual: `bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2 flex items-start gap-2 text-sm`
- Icon: Lucide `AlertTriangle` in `text-amber-500 w-4 h-4 flex-shrink-0 mt-0.5`
- Text: bold credit amount in `font-semibold`, followed by plain description
- Action buttons: inline `text-primary underline font-medium` text links (not full buttons) to "Buy Credit Pack" and "Upgrade Plan"
- A dismiss `×` button at `absolute top-2 right-2` (or `ml-auto`)
- Entrance: slides down from the button with `max-height: 0` → `max-height: 200px` over 250ms
- Must automatically dismiss after 8 seconds OR when the user navigates away

---

## Modified Requirements

### MR-01: Section 5.2.2 — CreditUsageGauge Color States

**Current text:**
> Color-coded:
> - Green (>50% remaining)
> - Yellow (25-50% remaining)
> - Red (<25% remaining)

**Replace with:**
> Color-coded by percentage of monthly allocation remaining. Uses semantic color tokens from the project's Tailwind config:
> - `>50% remaining`: track fill `bg-emerald-500` — healthy
> - `25–50% remaining`: track fill `bg-amber-400` — caution
> - `10–25% remaining`: track fill `bg-orange-500` — low
> - `<10% remaining`: track fill `bg-rose-500` with a slow `animate-pulse` on the fill — critical
> - `0% remaining (depleted)`: track fill `bg-rose-500`, track background `bg-rose-100`, and a `CreditBadge` in critical state shown adjacent. The gauge label text changes from "X remaining" to "Depleted — resets [date]" in `text-rose-600 font-medium`.
>
> Gauge anatomy: `h-3 rounded-full bg-gray-100 overflow-hidden` for the track; fill is an inner `div` with `rounded-full transition-all duration-500 ease-out` and the appropriate color class. Percentage label (`text-xs text-gray-500`) appears below and to the right of the gauge. A "Resets: [date]" label in `text-xs text-gray-400` appears below and to the left.

---

### MR-02: Section 7.10 — Subscription Status Table

**Current text (partial):**
> `past_due` (>7 days) | Reverted to Basic limits | Red banner + UpgradePrompt

**Replace** the entire grace period row values to reflect the Section 17.4 amendment (already noted in the Wave 1 modification index) and add visual specifications:

> | `past_due` (grace, ≤14 days from `firstPaymentFailedAt`) | Full tier access | Amber banner: `bg-amber-50 border-b border-amber-200`, AlertTriangle icon, text "Payment failed. [Update payment method →]" links to Stripe portal. Not dismissible. |
> | `past_due` (>14 days from `firstPaymentFailedAt`) | Reverted to Basic limits | Rose banner: `bg-rose-50 border-b border-rose-300`, XCircle icon, text "Your subscription is past due. Features are limited until payment is resolved. [Update payment method →]". Not dismissible. Accompanied by UpgradePrompt-style overlay on any credit-consuming action. |

---

### MR-03: Section 13.4 — Annual Pricing Toggle Acceptance Criteria

**Add to the existing Story 13.1 AC list:**
> - [ ] Toggle is implemented as a pill segmented control, not a checkbox or radio group. It uses `role="radiogroup"` with two `role="radio"` children for accessibility.
> - [ ] "Monthly" is the selected (default) state. Selected option shows `bg-white rounded-full shadow-sm` within a `bg-gray-100 rounded-full p-1` container. The indicator slides between options using `transition-transform duration-200 ease-in-out`.
> - [ ] A "Save 17%" badge (`bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full`) is positioned inline to the right of the "Annual" label within the toggle. It is not visible when monthly is selected — it fades in with `transition-opacity duration-200` when annual is selected.
> - [ ] Price number swap is animated: old price fades out and new price fades in over 150ms each (sequential, not simultaneous).
> - [ ] The "Billed $[amount]/year" sub-label below the per-month price appears only when annual is selected, entering with `translate-y-1 opacity-0` → `translate-y-0 opacity-100` over 200ms.
> - [ ] Toggle state is stored in component state only — not in URL params or localStorage. Refreshing the page resets to monthly (the default).

---

### MR-04: Section 19.4 — Pre-Checkout Disclosure Font Size

**Current text:**
> Font size: minimum 12px, not greyed out

**Replace with:**
> The pre-checkout disclosure text must meet the following visual specification:
> - Font size: minimum 14px (not 12px — 12px is below WCAG 2.1 minimum for non-decorative text at standard zoom)
> - Line height: 1.5 (do not compress)
> - Color: `text-gray-700` (not muted gray — this is a legal disclosure, not helper text)
> - The disclosure block is rendered in a bordered container: `border border-gray-300 rounded-lg p-4 bg-gray-50 my-4`
> - The mandatory "I understand this subscription renews automatically" checkbox is rendered using the existing project checkbox component, with label text at the same 14px minimum, and must be in the same container as the disclosure
> - The "Confirm & Pay" button remains `disabled` with `opacity-60 cursor-not-allowed` until this checkbox is checked (distinct from the existing Terms/Privacy checkboxes required earlier in the form)

---

### MR-05: Section 16.2 / Story 16.1 — Cancellation Modal Additional AC

**Add to Story 16.1 AC list:**
> - [ ] The modal is `max-w-lg w-full` centered in a `fixed inset-0 bg-black/50` backdrop. Backdrop click does NOT close the modal (users must explicitly choose to cancel or dismiss).
> - [ ] Step indicator: three numbered circles at top of modal connected by lines. Current step circle is `bg-primary text-white`; completed step shows a checkmark icon.
> - [ ] Reason selection: each reason renders as a selectable card (`border rounded-lg p-3 mb-2 cursor-pointer`), not a plain radio input. Selected state: `border-primary bg-primary/5`.
> - [ ] Step 2 (save offer): the offer is presented as a visual card with a distinct background (`bg-emerald-50 border border-emerald-200 rounded-xl p-4`) above the action buttons. This visually frames the offer as something valuable, not an obstacle.
> - [ ] Step 3 (confirmation): the plan end date is displayed in `font-semibold` within a `bg-amber-50 border border-amber-200 rounded-lg p-3` block. Below it: "You will not be charged after [date]." in `text-sm text-gray-600`. The "I changed my mind" button is styled as a `text-primary underline` text link, not a button, to reduce its visual prominence relative to the confirmation text.

---

## Questions & Concerns

1. **Dark mode posture**: The document is silent on dark mode entirely. Given that Tailwind CSS supports it natively and content/SEO practitioners often work in dark environments, is this a v1 non-target that should be explicitly declared as out of scope? Or should all new components include `dark:` variants? This decision affects every component in the system and cannot be deferred to implementation without causing divergence.

2. **Annual toggle as default**: Section 13.4 states "Annual option is not the default." This is reasonable, but has this been A/B tested or is it an assumption? Several high-conversion SaaS pricing pages (Linear, Notion, Vercel) default to annual with a prominent monthly option. Given that the requirements document is detailed enough to include retention coupon strategy, the annual/monthly default seems worth validating with conversion data before locking it in.

3. **"Existing public page design language" reference**: Section 5.1.1 references `LandingPage.jsx` and `FeaturesPage.jsx` as the design reference. Before implementation begins, someone needs to audit these files and document the specific Tailwind patterns in use (card border radii, heading sizes, color token usage, section spacing). If these files are the canonical design reference, they should be listed in an appendix or linked design system. If there is a Figma file covering the public pages, it should be referenced in Section 10.1.

4. **CreditBadge on every action button**: Section 7.6 says "Show CreditBadge — Next to every credit-consuming button, show the credit cost." There are approximately 15 components with credit-consuming actions listed in Section 7.5. Many of these actions appear inside data-dense screens (e.g., audit results, meta generator). Has the team considered whether displaying credit costs on every button in every screen creates cognitive overhead? The pricing page's credit explainer section was designed to set expectations once — constant in-context credit cost labels may feel like a constant reminder of scarcity. Worth a UX review of whether the badge appears always vs. only when balance is below a threshold.

5. **Nonprofit card CTA language**: The current CTA spec says "Start [Tier Name]" for paid tiers, which would render as "Start Nonprofit" on the nonprofit card. This is grammatically awkward and functionally misleading (clicking does not start a nonprofit plan — it begins a verification process). Should this be "Apply for Nonprofit Pricing" or "Start Verification"? This requires a product decision but has direct implementation impact on the CTA label spec.

6. **Registration success modal vs. page**: Story 4.3 describes the RegistrationSuccess as a "welcome modal/page" — the ambiguity here is non-trivial. A modal overlaying the dashboard allows the user to see their new dashboard in the background, creating an "I'm already in the product" feeling. A dedicated page gives more visual space for onboarding content. Which was intended? The recommendation in this review is a modal, but this should be confirmed.

7. **The Freelance "1 collaborator seat" amendment**: The Wave 1 modification index quietly changes Freelance from "1 seat" to "1 owner + 1 collaborator seat (read-only)." This is a feature change that has implications beyond the pricing card copy — the team management UI, the seat enforcement logic in Section 7.7, and the `maxSeats` value in `TIER_CONFIGS` all need to be updated. The modification index notes it but does not issue formal change instructions to any of the affected sections. Is there a Story in any batch that addresses this? It does not appear to be covered by any existing story's AC.

8. **Enterprise card visual parity**: Section 15.1 adds an Enterprise card to the pricing page but describes it as "after the Agency tier card." If the five existing cards are in a 5-column grid on desktop, a sixth Enterprise card creates a layout problem — a 6-column grid breaks most 1280px desktop viewports and reduces each card to impractical width. Has the layout been reconsidered for six cards? Options include: a 3+3 row layout, a special "Enterprise" row below the main 5-card row, or a narrowed design for the Enterprise card. This requires an explicit layout decision before implementation.

9. **Animation suppression for Stripe redirect returns**: When a user returns from Stripe Checkout to `?subscription=success`, the page may momentarily show the Basic-tier state before the webhook fires and Firestore updates. This produces a jarring visual flash where the user sees "0 credits" or "Basic plan" for a second or two before the real data loads. Is there a specified strategy for handling this loading gap? A full-page skeleton with "Activating your subscription..." copy would be more appropriate than the current RegistrationSuccess component appearing on top of a briefly incorrect dashboard state.

10. **Schema Generator tier display in comparison table**: Section 2.3 shows the Schema Generator row in the feature matrix as "3 types" for Basic and "All 40+ types" for paid tiers. The comparison table spec (Section 5.1.3) says to "Use checkmarks, X marks, and specific values." For a nuanced value like "3 types vs. 40+ types," a simple checkmark/X is insufficient — specific values must be shown in both the Basic and paid columns. The developer needs a clear display rule: when is a checkmark sufficient vs. when should a specific value be shown?

---

## Approval Status

**Needs Revision**

The document is the most comprehensive initial requirements spec I have reviewed for a SaaS billing implementation at this scale. The business logic, data models, API contracts, and compliance additions are production-grade and reflect a mature understanding of Stripe, Firebase, and subscription economics. The Wave 1 legal and compliance additions in Sections 11–19 are particularly strong and address concerns that most early-stage SaaS products ignore entirely.

However, the document cannot be approved for implementation in its current state from a visual design perspective. There are five Critical findings that, if unresolved, will produce components requiring visual rework post-implementation — specifically the pricing card hierarchy, the annual/monthly toggle, the cancellation retention modal, the mobile feature comparison table, and the complete absence of motion design specifications. These are not polish concerns; they are foundational design decisions that shape how developers implement layout, state management for animation, and CSS architecture.

The Major findings — particularly the subscription status banner semantic system, the credit gauge color conflict with error states, and the skeleton loading gap — represent the next tier of priority. The Minor findings can be addressed during implementation if the developer has design pairing, but should be resolved in the spec if autonomous implementation is expected.

Recommended path to approval:
1. Resolve all five Critical findings by adding the specified subsections (estimated 2–3 days of design work to produce Figma specs or annotated wireframes, 1 day to write the requirement language)
2. Resolve Major findings MR-01 through MR-05 by updating the existing requirement text (these are primarily text changes, not design work)
3. Add the four New Requirements (NR-01 through NR-04) as formal sections
4. Respond in writing to Questions 7 (Freelance seat amendment coverage), 8 (Enterprise card layout), and 9 (Stripe redirect loading gap) — these require product decisions that unblock parallel design and development work
5. Re-submit for design review