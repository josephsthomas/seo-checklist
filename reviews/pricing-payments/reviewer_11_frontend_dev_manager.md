# Frontend Development Manager — Requirements Review
**Reviewer:** Frontend Development Manager
**Document:** pricing-payments-requirements.md
**Date:** 2026-02-22
**Status:** Complete

---

## Executive Summary

This is an ambitious, well-structured requirements document covering a full monetization layer for the Content Strategy Portal. The business logic, data models, and backend API specifications are thorough, and the 7-batch implementation sequencing is largely sound. However, the frontend component specifications are critically incomplete in several areas that will cause implementation friction and rework: skeleton loading states are entirely absent from every billing component, `data-testid` attributes are never mentioned, error boundary placements are unspecified, and the bundle impact of adding Stripe.js is unaddressed. The Wave 1 additions (Sections 13–19) introduce significant new UI component complexity — particularly the annual toggle, the multi-step cancellation retention modal, and the pre-checkout disclosure requirements — that retroactively impact Batches 3, 4, and 5 without updating those batch scope estimates or acceptance criteria. Before implementation begins, the critical findings below must be resolved to prevent mid-sprint blockers and scope underestimates.

---

## Sections Reviewed

| Section | Title | Focus Level |
|---------|-------|-------------|
| 5 | Frontend Components | Deep |
| 6 | Registration Flow Updates | Deep |
| 7 | Usage Enforcement & Gating | Deep |
| 9 | User Stories by Implementation Batch | Deep |
| 10 | Implementation Notes & Conventions | Deep |
| 13 | Annual Pricing & Billing Intervals | Deep |
| 14 | Free Trial Strategy | Deep |
| 15 | Enterprise Tier — Lead Capture | Deep |
| 16 | Cancellation Retention Flow | Deep |
| 17 | Credit System — Amended Policies | Deep |
| 18 | Compliance Data Models | Moderate |
| 19 | New API Endpoints — Wave 1 | Moderate |
| 2 | Tier Definitions & Credit System | Moderate |
| 3 | Data Models & Firestore Schemas | Moderate |
| 4 | Backend API Specifications | Moderate |
| 8 | Admin Features & Observability | Moderate |

---

## Findings

### Critical (Must fix before implementation)

- **[REQ-11-C01]** Sections 5.2, 5.3, 5.4, 5.5, 6.x — **Skeleton Loading States Entirely Absent from All Billing Components**: Not a single billing component specification mentions a skeleton loading state. `BillingDashboard.jsx` makes two API calls on mount (`GET /api/credits/balance` and `GET /api/credits/history`), `InvoiceHistory.jsx` paginates from the API, `PlanManagement.jsx` fetches current subscription, and `CreditHistory.jsx` has a date-range picker that triggers fresh API calls. The `SubscriptionContext` initializes with `loading: boolean` but there is no specification for what any component renders during that loading window. Without skeleton screens, users will see content flashes (empty state → populated state), layout shift, and potentially broken affordances (e.g., an action button rendered before subscription status is known). **Recommendation**: For each billing component, add an explicit "Loading State" subsection specifying the skeleton structure. At minimum, `BillingDashboard` needs skeleton cards for CurrentPlanCard and CreditUsageGauge; `InvoiceHistory` needs skeleton table rows; `CreditHistory` needs skeleton rows with shimmer. Define a shared `BillingSkeletonCard` component in the shared UI components (Section 5.8). This is a prerequisite for Story 5.1 implementation.

- **[REQ-11-C02]** Sections 6.2, 6.3, 7.2, 7.3 — **Race Condition in Credit Consumption Flow Is Documented but Not Fully Resolved**: Section 7.2 acknowledges the race condition (credits consumed between `canAfford` check and backend `consumeCredits` call) and says "handle the case," but neither the `useCredits` hook spec (Section 7.3) nor any component integration pattern (Section 7.5) specifies a recovery UX for this scenario. The comment in the code example (`// Handle insufficient credits (race condition)`) returns early with no user feedback. In a multi-tab browser session, or for users approaching the zero-credit boundary, this race condition is not rare — it is the normal failure mode. Additionally, the `consumeCredits` function in `SubscriptionContext` (Section 6.3) duplicates the function signature of `useCredits.consumeCredits` (Section 7.3) without clarifying whether these are the same function or two different call paths. This ambiguity means developers will likely implement two divergent code paths that behave differently. **Recommendation**: (1) The race condition recovery UX must be specified: show a specific error toast (e.g., "Action could not complete — your credit balance was updated. You have X credits remaining.") and re-fetch credit balance. (2) Clarify whether `SubscriptionContext.consumeCredits` and `useCredits.consumeCredits` are the same function. The hook should delegate to the context; the context should be the single caller of the API. Remove the duplicate `consumeCredits` signature from `SubscriptionContext` and have `useCredits` own that responsibility exclusively.

- **[REQ-11-C03]** Sections 4.2, 6.2.2, 14.2 — **Stripe.js Bundle Impact and Loading Strategy Unspecified**: The document never addresses how or when `@stripe/stripe-js` is loaded. The Stripe.js library (~90 KB gzipped) must be loaded asynchronously on every page where Stripe Checkout is triggered, and Stripe's own documentation requires calling `loadStripe()` outside component render. The current spec has checkout initiation scattered across three flows: registration (`RegisterForm.jsx`), billing dashboard (`BillingDashboard.jsx`), and credit pack modal (`CreditPackModal.jsx`). There is no shared Stripe initialization module specified, no mention of preloading Stripe on the pricing page (where conversion happens), and no bundle size budget defined anywhere in the document. Given the app uses Vite, code splitting is available, but without explicit guidance, developers may eagerly import `@stripe/stripe-js` in a way that blocks rendering of billing pages. **Recommendation**: (1) Add a requirement for `src/lib/stripe.js` that exports a singleton `loadStripe()` promise initialized with `VITE_STRIPE_PUBLISHABLE_KEY`. (2) Specify that the pricing page (`/pricing`) should include a `<link rel="preconnect">` to `js.stripe.com` via `SEOHead`. (3) Add a performance budget requirement: the billing route chunk must not exceed 150 KB gzipped. (4) Specify that `@stripe/stripe-js` is dynamically imported only within the checkout flow, not at app startup.

- **[REQ-11-C04]** Sections 6.2.2, 13.4, 19.4 — **Multi-Step Registration State Machine Is Underspecified for Wave 1 Complexity**: The original registration state machine in Section 6.2.4 defines four states: `account_details → plan_confirmation → checkout → success`. Wave 1 additions materially expand this: Section 13.4 requires the `PlanConfirmationStep` to handle `interval: 'month' | 'year'` with different pricing and renewal date displays; Section 19.4 requires a new auto-renewal disclosure block with a distinct checkbox (separate from the existing Terms/Privacy checkboxes); and Section 14.2 requires a "Start Free Trial" path that bypasses `plan_confirmation` entirely (no payment step). The state machine as defined cannot accommodate these variants without introducing conditional branches that are not documented. The acceptance criteria for Story 4.1 (`RegisterForm.jsx`) do not mention annual interval handling, the disclosure checkbox, or the trial path — meaning Story 4.1 as written is incomplete relative to what Wave 1 requires. **Recommendation**: Rewrite the state machine in Section 6.2.4 as a proper state × event table or XState-style diagram that covers all variants: `(free | paid_monthly | paid_annual | paid_trial | nonprofit)` × `(account_details | plan_confirmation | nonprofit_verification | checkout | success)`. Update Story 4.1 and 4.2 acceptance criteria to include annual interval, disclosure checkbox, and trial path branches.

---

### Major (Should fix before implementation)

- **[REQ-11-M01]** Section 10.2 — **Testing Strategy Is Insufficient for the Scope of Work**: The testing strategy in Section 10.2 consists of four bullet points. For a feature set that introduces: a payment flow, a credit consumption engine touching 15+ components, a multi-step registration state machine, real-time Firestore listeners, a retention cancellation modal, a nonprofit document upload, and admin dashboards — this is not an adequate testing plan. There is no mention of: E2E test tooling (Playwright or Cypress), E2E test scenarios (happy path checkout, webhook-triggered state transitions), visual regression testing, accessibility testing (`jest-axe` or `axe-core`), or component-level test coverage thresholds. The spec mentions `@testing-library/react` for component tests but lists zero specific test cases in any story's acceptance criteria beyond the tier config unit tests. **Recommendation**: Add a dedicated "Testing Requirements" section that specifies: (1) E2E test tool (recommend Playwright given Vite), (2) minimum of 5 required E2E scenarios (see New Requirements below), (3) `jest-axe` integrated into every billing component test, (4) 80% unit test coverage requirement for `useCredits`, `useFeatureGate`, and `SubscriptionContext`, (5) snapshot tests for pricing card renders across all 5 tiers.

- **[REQ-11-M02]** Sections 5.2, 5.4, 6.2, 16 — **Error Boundary Placement Unspecified for All Billing Components**: The billing features interact with three external failure surfaces: Firestore real-time listeners (can disconnect), the Node/Express backend API (can fail or time out), and Stripe redirect flows (can return error states). None of the billing component specifications define where React Error Boundaries should be placed, what the fallback UI should render, or whether network errors should trigger graceful degradation versus hard error states. If `SubscriptionContext`'s Firestore `onSnapshot` throws (e.g., permission denied after token expiry), the entire app subtree below `SubscriptionProvider` will unmount with no user-visible recovery path. **Recommendation**: Specify Error Boundary placement in three locations: (1) wrap `SubscriptionProvider` with a top-level `BillingErrorBoundary` that renders a "Billing service temporarily unavailable — your access is not affected" message rather than crashing the app, (2) wrap each individual billing page component (`BillingDashboard`, `PlanManagement`, `InvoiceHistory`) with page-level boundaries, (3) wrap the credit consumption inline flow within tool components with a `CreditGatingErrorBoundary` that falls back to allowing the action rather than silently blocking it. Add this to Section 5.8 Shared UI Components.

- **[REQ-11-M03]** Sections 6.2.2, 6.3, 14 — **Google OAuth + Paid Tier Flow Has Unresolved Timing Gap**: Scenario D (Section 6.2.2) describes the Google OAuth flow for paid tier selection, but the implementation creates a critical timing problem: Firebase Auth's `onAuthStateChanged` fires and creates the user session before the Firestore user document is written. `SubscriptionContext` (Section 6.3) sets up a `credit_balances/{userId}` listener on auth state change. If a new Google OAuth user registers via a paid tier, the sequence is: (1) Google Auth completes, (2) `onAuthStateChanged` fires, (3) `SubscriptionContext` starts listening for `credit_balances/{userId}` — which does not yet exist, (4) `AuthContext` writes the user document with `tier: 'incomplete'`, (5) `SubscriptionContext` receives a null snapshot and falls back to Basic tier defaults, (6) Component renders with Basic tier state while the user is mid-registration for a paid tier. The spec does not address this window. Story 4.2's acceptance criteria do not mention this scenario. **Recommendation**: Specify that `SubscriptionContext` must not initialize its Firestore listener until `AuthContext` confirms the user document has been written (using a `userDocReady: boolean` flag in `AuthContext`). Alternatively, specify that `SubscriptionContext` treats a missing `credit_balances` document with an active session as an "initializing" state (spinner, not Basic defaults) for up to 10 seconds before falling back.

- **[REQ-11-M04]** Section 9 (all batches) — **`data-testid` Attributes Are Never Mentioned in Any Acceptance Criteria**: Across 34 user stories, not a single acceptance criterion requires `data-testid` attributes on interactive elements. For a system this complex — with payment buttons, credit consumption modals, plan upgrade/downgrade confirmations, multi-step registration forms, and cancellation retention flows — E2E testing without `data-testid` will require brittle CSS selector or text-content-based targeting. This compounds the existing testing gap identified in REQ-11-M01. In practice, once components are built without testids, adding them requires coordinating across multiple developers to agree on a naming convention retroactively. **Recommendation**: Add a project-wide `data-testid` naming convention to Section 10.1 Code Conventions. At minimum, specify required `data-testid` values for: (1) all CTA buttons on the pricing page (`pricing-card-cta-{tier}`), (2) plan confirmation submit button (`plan-confirmation-submit`), (3) credit consumption buttons on tool pages (`credit-action-{action}`), (4) upgrade prompt modal (`upgrade-prompt-modal`), (5) cancellation confirmation button (`cancellation-confirm-btn`), (6) credit usage gauges (`credit-gauge-standard`, `credit-gauge-ai`).

- **[REQ-11-M05]** Sections 5.2, 7.6 — **Offline and Network Error Handling Patterns Are Completely Absent**: The document never addresses what happens when a user's network is unavailable or degraded. The credit consumption flow (Section 7.2) calls `POST /api/credits/consume` before every tool action. If this call fails due to a network timeout (not a 402 insufficient credits response, but a genuine network error), the spec says "Proceed with actual audit upload logic" only on `result.success`. The failure path `if (!result.success)` is described only for the race condition case — not for network errors. A user on a mobile connection who loses connectivity mid-audit-upload would receive no feedback and no action. More importantly, the Firestore real-time listener in `SubscriptionContext` will silently stop receiving updates during an offline period and resume on reconnection — but there is no specified UI to indicate stale credit data. **Recommendation**: Add a new Section 10.7 "Offline and Network Error Handling" that specifies: (1) `useCredits.consumeCredits` must distinguish between `402 insufficient_credits` and network-level failures; network failures should show a toast ("Action failed — check your connection and try again") and NOT show the upgrade prompt, (2) `SubscriptionContext` must expose a `connectionStatus: 'online' | 'offline' | 'reconnecting'` value derived from Firestore's `onSnapshot` error callbacks, (3) a non-dismissible `OfflineBanner` component should render when `connectionStatus !== 'online'` warning that credit data may be stale.

- **[REQ-11-M06]** Sections 13, Appendix B — **Annual Pricing Toggle Retroactively Invalidates Batch 3 and Batch 4 Scope Estimates**: Section 13.4 (Story 13.1) adds the annual/monthly toggle to the pricing page and requires `PlanConfirmationStep.jsx` to handle `interval: 'month' | 'year'`. However, Batch 3 (Pricing Page, ~5 files) and Batch 4 (Registration Flow, ~6 files) were scoped before Wave 1 additions. The annual toggle is non-trivial: it affects the pricing card CTA URLs, the `create-session` API request body, the plan confirmation step pricing display, the Stripe Checkout session creation, and the billing dashboard renewal date display. None of these changes are reflected in the acceptance criteria for Stories 3.1, 3.4, 4.1, 4.2, or 5.1. The Appendix B file manifest is also missing the `EnterpriseLead Modal.jsx` file (Section 15) and lists no Story 13.1 or 14.1 files at all. **Recommendation**: (1) Add a `interval` state variable to the pricing page spec with explicit behavior for toggle interaction, (2) update Story 3.1 AC to include annual toggle rendering, (3) update Story 4.1 AC to include `interval` parameter threading, (4) update Story 4.2 AC to pass `interval` to `create-session`, (5) update Appendix B to list all Wave 1 new files including `EnterpriseLead Modal.jsx`, annual toggle component, and trial banner component.

- **[REQ-11-M07]** Sections 5.2, 5.4, 16 — **Cancellation Retention Modal Component Architecture Is Underspecified**: Section 16 defines a 3-step cancellation retention flow with contextual save offers but provides no component breakdown. The flow involves: a multi-step modal with state management (current step, selected reason, save offer type, pause/discount outcomes), conditional rendering based on reason selection, an API call to pause mid-modal (`POST /api/subscriptions/pause` "without closing the modal"), and a post-cancel reactivation window. This is one of the most complex UI interactions in the entire spec, yet it receives a single story (16.1) with acceptance criteria that jump straight to behavioral requirements without specifying the component tree, prop interfaces, or state machine. The note that pause calls happen "without closing the modal" implies the modal must handle async API responses across multiple steps, but there is no loading state specification. **Recommendation**: Break Story 16.1 into at least two stories: (a) `CancellationReasonStep.jsx` — reason selection and state, and (b) `CancellationRetentionModal.jsx` — orchestrator with step routing, API calls, and loading states. Add a state machine diagram or XState definition for the 3-step flow. Specify loading state rendering for the pause and discount coupon API calls within the modal.

---

### Minor (Fix during implementation)

- **[REQ-11-m01]** Section 5.8 — **`UpgradePrompt` Component Props Interface Is Ambiguous for Dual Usage Modes**: Section 5.8 defines `UpgradePrompt` as a "reusable modal/banner" and Story 6.3 specifies `variant: 'modal' | 'banner'`. However, the `feature` prop (for feature gating) and `action` prop (for credit gating) are listed as alternatives with `|` notation, implying the component accepts either but not both. The component logic for "what to show" differs between the two gating scenarios: credit-gated prompts show "Buy Credits" + "Upgrade Plan" options; feature-gated prompts show only "Upgrade Plan." The billing upgrade path (`/app/billing/plans`) is the same for both, but the credit pack modal integration is only relevant for credit-gated cases. The current spec would lead different developers to implement `UpgradePrompt` differently. **Recommendation**: Explicitly define the prop interface as a TypeScript interface or JSDoc block in the component spec: `{ trigger: { type: 'credit', action: string } | { type: 'feature', featureName: string }, variant: 'modal' | 'banner', onDismiss?: () => void }`. Specify that `CreditPackModal` is rendered as a child of `UpgradePrompt` only when `trigger.type === 'credit'`.

- **[REQ-11-m02]** Section 6.3, Story 1.3 — **`SubscriptionContext` Cleanup for Firestore Listener Is Not Specified**: The `SubscriptionContext` uses `onSnapshot` to listen to `credit_balances/{userId}` in real-time. The acceptance criteria for Story 1.3 do not specify that the listener must be cleaned up on unmount or on user sign-out. In a React 18 strict mode development environment, effects run twice, which means two Firestore listeners would be created simultaneously without proper cleanup. Additionally, if the user signs out, `AuthContext` will clear the user state but `SubscriptionContext` may still hold an active listener against the previous user's document. **Recommendation**: Add to Story 1.3 AC: "The `onSnapshot` unsubscribe function must be called in the `useEffect` cleanup function. The listener must be re-established when `userId` changes and torn down when `userId` becomes null (sign-out)." Reference the existing pattern used in `AuthContext.jsx` for the user document listener.

- **[REQ-11-m03]** Section 9, Batch 4, Story 4.3 — **Post-Stripe Redirect Success Detection Is Fragile**: Story 4.3 specifies detecting `?subscription=success` in the URL after Stripe redirects back. This approach requires `HomePage.jsx` to read URL params on mount, which means: (a) the success modal will re-render on every hard refresh of `/app?subscription=success`, (b) if the user bookmarks the success URL and revisits later, they see the welcome modal again, and (c) the URL param remains visible in the browser address bar, potentially confusing users who share the URL. This is a common implementation pitfall with Stripe redirect flows. **Recommendation**: Specify that after detecting `?subscription=success`, the component must immediately call `window.history.replaceState({}, '', '/app')` to remove the query param from the URL before showing the modal. Also specify that the modal should only show if `SubscriptionContext.tier !== 'basic'` (confirming the webhook has already updated the user's tier) or fall back to a polling approach with a max of 10 seconds before showing a "Payment processing" message.

- **[REQ-11-m04]** Section 5.3 — **Invoice Download Opens Security Concerns Not Addressed**: Story 5.3 specifies an "Actions: Download PDF" button that uses the `invoicePdf` URL from the Stripe invoice mirror. Stripe-hosted PDF URLs are time-limited (they expire). If a user navigates to `InvoiceHistory`, loads the invoice list, waits 10 minutes (e.g., the tab is in the background), and then clicks "Download PDF," the URL may have expired. The spec does not mention this, and the implementation will fail silently (redirect to a 403 or 404 on Stripe's CDN). **Recommendation**: Add to Story 5.3 AC: "The 'Download PDF' action must fetch a fresh `invoicePdf` URL via the backend (`GET /api/billing/invoices/:invoiceId/pdf`) rather than using a cached URL from the initial list load. Alternatively, specify a maximum display time for the invoice list after which a 'Refresh' prompt is shown." This also implies a new backend endpoint is needed.

- **[REQ-11-m05]** Sections 5.1.2, 13.4 — **Pricing Card CTA State Logic Is Incomplete for Paused and Past-Due Subscribers**: The pricing card CTA logic (Section 5.1.2) defines three states: "Get Started Free" (unauthenticated), "Upgrade to [Tier]" (authenticated, lower tier), and "Current Plan" disabled (authenticated, same tier). Missing states include: (a) a paused subscriber viewing the pricing page — should their current tier show "Resume Plan" instead of "Current Plan"? (b) a past-due subscriber — should the CTA prompt payment method update rather than upgrade? (c) a trialing user viewing other tiers — should the trial card show "Converting..." state? (d) a user with a pending downgrade — their "current" tier is changing at period end, which should be reflected. **Recommendation**: Add to Section 5.1.2 a complete CTA state table mapping `(subscriptionStatus, currentTier, cardTier)` tuples to rendered CTA text and behavior. At minimum: paused → show "Resume Plan" on current tier card, past_due → show "Update Payment" on current tier card, trialing → show "X days left in trial" on current tier card.

---

### Suggestions (Consider for future)

- **[REQ-11-S01]** Sections 5, 9 — **Storybook Component Documentation Not Required**: The spec introduces ~22 new React components, including complex shared components (`UpgradePrompt`, `CreditBadge`, `SubscriptionBanner`, `CreditUsageGauge`) that will be used across 15+ existing tool files. Without Storybook or equivalent component documentation, each team member modifying an existing tool component must trace the `useCredits` call through to the shared components to understand visual output, loading states, and edge cases. Consider requiring Storybook stories for all shared UI components in Section 5.8 and all billing-specific components in Section 5.2. At minimum, each story should cover: default state, loading state, error/empty state, and each tier variant. This would also serve as the visual spec for design QA.

- **[REQ-11-S02]** Sections 7.3, 7.4 — **Credit Check Could Use Optimistic UI Pattern for Better UX**: The current credit flow is pessimistic: the frontend calls the backend `POST /api/credits/consume` and waits for confirmation before executing the tool action. For actions where the user experience of the tool response is the primary value (e.g., AI alt text generation), this means two sequential network round trips before any feedback: first the credit consume call, then the AI processing call. For lower-latency improvement, consider an optimistic credit deduction pattern: immediately update the local credit balance in `SubscriptionContext`, begin the tool action in parallel with the credit consume call, and roll back the local deduction only if the backend returns a 402. This is feasible because the Firestore real-time listener will reconcile the actual balance regardless. Recommend defining the pattern in Section 7.2 as "optimistic credit deduction for AI actions, pessimistic for irreversible actions (audit file processing, report generation)."

- **[REQ-11-S03]** Section 10.2 — **Accessibility Testing Requirements Are Absent**: The document references WCAG 2.2 compliance as a feature of the Accessibility Analyzer tool but imposes no accessibility requirements on the billing components themselves. The pricing page comparison table, the multi-step registration modal, the cancellation retention modal, and the credit usage gauges all require specific ARIA implementation. The feature comparison table in particular (Section 5.1.3) with sticky columns, collapsible category rows, and checkmark/X icons is a common source of accessibility failures. Recommend adding to Section 10.2: (1) `jest-axe` integrated into all component test files, run on every render variation, (2) keyboard navigation specification for all modals (focus trap, Escape key), (3) ARIA live region requirement for credit balance updates (so screen reader users are notified when credits are consumed), (4) minimum contrast ratio requirements for the CreditUsageGauge color states (green/yellow/red).

- **[REQ-11-S04]** Sections 9 (Batch 6), 10.5 — **Performance Budget for Credit Gating in Tool Components**: Batch 6 adds `useCredits` and `CreditBadge` to 15+ existing tool components. Each `useCredits` call reads from `SubscriptionContext`, which is already backed by a Firestore real-time listener. The `canAfford` function is called synchronously before every credit-consuming action. Under normal conditions this is fine, but there is no guidance on what happens when a component calls `canAfford` during `SubscriptionContext.loading === true` (the hook's `isLoading` return value is specified but no behavior for this case is defined in any tool component integration spec). Additionally, the `CreditBadge` component will be rendered next to every action button across 15+ components — if it triggers unnecessary re-renders on every `SubscriptionContext` update (which happens on every credit deduction), tool component performance could degrade. Recommend: (1) specify that `canAfford` returns `true` (allow action) when `loading === true`, documenting the trade-off, (2) specify that `CreditBadge` should be wrapped in `React.memo`, (3) add a render performance requirement: credit gating must not add more than 16ms to any tool component render cycle.

---

## New Requirements

The following requirements are missing from the document and must be added prior to implementation:

---

**REQ-NEW-01: Skeleton Loading Components for Billing Dashboard**

**Section**: 5.2.3 (add as new subsection)
**Priority**: Critical
**Batch**: 5

**Requirement**: A `BillingDashboardSkeleton.jsx` component must be created and rendered by `BillingDashboard.jsx` while `SubscriptionContext.loading === true` or while the initial API calls are in-flight.

**Acceptance Criteria:**
- [ ] Create `src/components/billing/skeletons/BillingDashboardSkeleton.jsx` with shimmer-animated placeholders matching the layout structure in Section 5.2.1
- [ ] `CurrentPlanCard` skeleton: two-line text placeholder (tier name + price) and four button-shaped placeholders
- [ ] `CreditUsageGauge` skeleton: two progress bar placeholders with label stubs
- [ ] `UsageActivityList` skeleton: 5 row placeholders with icon, text, and amount column stubs
- [ ] Skeleton uses the project's existing shimmer animation pattern (or a Tailwind `animate-pulse` utility) consistent with existing skeleton components in the codebase
- [ ] `BillingDashboard` renders skeleton when `loading === true`; transitions to content without layout shift when data resolves
- [ ] Create corresponding skeletons for `InvoiceHistory` (5-row table skeleton) and `CreditHistory` (5-row table skeleton with filter stubs)

**Files:**
- Create: `src/components/billing/skeletons/BillingDashboardSkeleton.jsx`
- Create: `src/components/billing/skeletons/InvoiceHistorySkeleton.jsx`
- Create: `src/components/billing/skeletons/CreditHistorySkeleton.jsx`
- Modify: `src/components/billing/BillingDashboard.jsx`
- Modify: `src/components/billing/InvoiceHistory.jsx`
- Modify: `src/components/billing/CreditHistory.jsx`

---

**REQ-NEW-02: data-testid Naming Convention and Required Attribute Specification**

**Section**: 10.1 (add as new subsection 10.1.1)
**Priority**: Critical
**Batch**: All batches (must be defined before Batch 3)

**Requirement**: All interactive elements in newly created components must include `data-testid` attributes following a defined naming convention, enabling reliable E2E test selection without CSS class coupling.

**Naming Convention**: `{component-name}-{element-type}-{variant-or-context}` in kebab-case.

**Required `data-testid` values (minimum):**

| Component | Element | data-testid Value |
|-----------|---------|-------------------|
| PricingPage | Tier card | `pricing-card-{tier}` (e.g., `pricing-card-freelance`) |
| PricingPage | CTA button per card | `pricing-cta-{tier}` |
| PricingPage | Annual/monthly toggle | `pricing-interval-toggle` |
| RegisterForm | Step indicator | `register-step-indicator` |
| PlanConfirmationStep | Submit button | `plan-confirm-submit` |
| PlanConfirmationStep | Auto-renewal checkbox | `plan-confirm-autorenewal-checkbox` |
| BillingDashboard | Standard credit gauge | `credit-gauge-standard` |
| BillingDashboard | AI credit gauge | `credit-gauge-ai` |
| BillingDashboard | Buy credit pack button | `billing-buy-pack-btn` |
| CreditPackModal | Pack option | `pack-option-{packType}` |
| CreditPackModal | Buy now button | `pack-buy-now-{packType}` |
| UpgradePrompt | Modal container | `upgrade-prompt-modal` |
| UpgradePrompt | Upgrade CTA | `upgrade-prompt-cta` |
| UpgradePrompt | Dismiss button | `upgrade-prompt-dismiss` |
| CancellationRetentionModal | Reason option | `cancel-reason-{reason}` |
| CancellationRetentionModal | Confirm cancel button | `cancel-confirm-btn` |
| SubscriptionBanner | Banner container | `subscription-banner-{status}` |
| Tool action buttons | Credit-gated button | `tool-action-{action}` (matches CREDIT_COSTS keys) |

**Acceptance Criteria:**
- [ ] Convention documented in `src/COMPONENT_CONVENTIONS.md` (inline with code, not a standalone doc)
- [ ] ESLint rule or code review checklist item added to enforce `data-testid` on all elements that accept user interaction
- [ ] `data-testid` attributes must use stable, semantic identifiers — never index-based (`item-0`, `item-1`)
- [ ] All stories in Batches 3–7 include `data-testid` requirements in their acceptance criteria

**Files:**
- Modify: `src/COMPONENT_CONVENTIONS.md` (create if not exists — inline convention docs only)

---

**REQ-NEW-03: React Error Boundary Components for Billing Subsystem**

**Section**: 5.8 (add to Shared UI Components)
**Priority**: Critical
**Batch**: 5 (must be available before Stories 5.1–5.7)

**Requirement**: The billing subsystem requires React Error Boundaries at three levels to prevent billing component failures from crashing the broader application.

**Acceptance Criteria:**
- [ ] Create `src/components/billing/BillingErrorBoundary.jsx`:
  - Catches errors from `SubscriptionContext` listeners and billing page components
  - Fallback UI: "Billing information temporarily unavailable. Your access and credits are not affected. [Refresh page]"
  - Logs error details to console (and to Firestore `error_logs` collection if analytics are available)
  - Does not unmount the rest of the application
- [ ] Create `src/components/shared/CreditGatingErrorBoundary.jsx`:
  - Wraps `useCredits` call sites in tool components
  - On error: falls back to allowing the action (fail-open policy for credit gating errors)
  - Shows a non-blocking toast: "Credit tracking temporarily unavailable"
  - Used in each of the 15+ tool component integrations in Batch 6
- [ ] Wrap `SubscriptionProvider` in `src/App.jsx` with `BillingErrorBoundary`
- [ ] Each billing route component (`BillingDashboard`, `InvoiceHistory`, `PlanManagement`, `CreditHistory`) is individually wrapped with a page-level `BillingErrorBoundary`
- [ ] Error boundaries are tested with `@testing-library/react`'s error simulation support

**Files:**
- Create: `src/components/billing/BillingErrorBoundary.jsx`
- Create: `src/components/shared/CreditGatingErrorBoundary.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/layouts/ToolLayout.jsx`

---

**REQ-NEW-04: Stripe.js Initialization Module and Bundle Strategy**

**Section**: Add as new Section 10.8 "Bundle and Performance Strategy"
**Priority**: Critical
**Batch**: 4 (must be available for Story 4.2)

**Requirement**: A singleton Stripe initialization module must be created and the bundle impact of Stripe.js must be managed with explicit loading strategy.

**Acceptance Criteria:**
- [ ] Create `src/lib/stripe.js`:
  - Exports a singleton `stripePromise` initialized once with `loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)`
  - `loadStripe` imported from `@stripe/stripe-js` using dynamic import to avoid eager loading
  - The module must not be imported at the app root level — imported only within components that trigger checkout
- [ ] Add `<link rel="preconnect" href="https://js.stripe.com">` and `<link rel="dns-prefetch" href="https://js.stripe.com">` to the `PricingPage` `SEOHead` render
- [ ] Stripe.js must be loaded lazily: only after the user clicks a CTA that initiates checkout, not on pricing page load
- [ ] Define a performance budget in `vite.config.js` or a separate budget file: the `/app/billing` route chunk must not exceed 150 KB gzipped; the `/pricing` route chunk must not exceed 80 KB gzipped
- [ ] Add `@stripe/stripe-js` to the Vite `optimizeDeps.include` list to prevent double-loading in development
- [ ] Bundle size checked in CI using a `bundlesize` or `vite-plugin-inspect` integration

**Files:**
- Create: `src/lib/stripe.js`
- Modify: `vite.config.js` (add chunk size warnings)
- Modify: `src/components/public/PricingPage.jsx` (add preconnect via SEOHead)

---

**REQ-NEW-05: E2E Test Suite Specification**

**Section**: 10.2 (expand to 10.2.1)
**Priority**: Major
**Batch**: All (tests run in CI after Batch 6 completion)

**Requirement**: A minimum set of E2E test scenarios must be specified and implemented using Playwright before the billing feature ships to production.

**Required E2E Test Scenarios:**

| Test ID | Scenario | Flow |
|---------|----------|------|
| E2E-01 | Free tier registration | Visit `/pricing` → Click "Get Started Free" → Complete registration → Assert dashboard shows 50 standard / 10 AI credits |
| E2E-02 | Paid tier checkout (Freelance) | Visit `/pricing` → Toggle annual → Click Freelance CTA → Complete registration → Assert redirected to Stripe test checkout → Use test card `4242 4242 4242 4242` → Assert success modal on redirect back → Assert tier badge shows "Freelance" |
| E2E-03 | Credit gate enforcement | Log in as Basic user → Navigate to Technical Audit → Mock credit balance = 0 → Attempt audit upload → Assert `upgrade-prompt-modal` is visible → Assert audit does NOT proceed |
| E2E-04 | Credit pack purchase | Log in as paid user → Navigate to `/app/billing` → Click `billing-buy-pack-btn` → Select Starter pack → Assert Stripe checkout redirects → Return with success → Assert credit balance increased |
| E2E-05 | Cancellation retention flow | Log in as paid user → Navigate to `/app/billing` → Initiate cancellation → Assert 3-step modal visible → Select "Too expensive" reason → Assert pause offer shown → Accept offer → Assert subscription status shows "Paused" → Assert `cancel-confirm-btn` NOT available without completing step 1 |

**Acceptance Criteria:**
- [ ] Playwright installed as a dev dependency in the frontend project
- [ ] E2E tests run in CI on every PR targeting `main`
- [ ] Stripe test mode credentials and test card numbers used; no production API keys in CI
- [ ] Stripe CLI webhook forwarding configured in CI test environment
- [ ] All 5 scenarios pass before Batch 7 is considered complete

**Files:**
- Create: `e2e/pricing.spec.ts`
- Create: `e2e/registration.spec.ts`
- Create: `e2e/credit-gating.spec.ts`
- Create: `e2e/billing.spec.ts`
- Create: `e2e/cancellation.spec.ts`
- Create: `playwright.config.ts`

---

**REQ-NEW-06: Accessibility Testing Integration**

**Section**: 10.2 (add as 10.2.2)
**Priority**: Major
**Batch**: Defined before Batch 3; enforced from Batch 3 onward

**Requirement**: All new React components must include accessibility tests using `jest-axe` to detect WCAG 2.2 violations at test time.

**Acceptance Criteria:**
- [ ] Install `jest-axe` and `@axe-core/react` as dev dependencies
- [ ] Add `toHaveNoViolations` matcher to the Vitest setup file (`src/setupTests.js`)
- [ ] Every component test file for new billing/pricing components includes at minimum one `axe` check on the fully rendered component
- [ ] The pricing comparison table (`PricingComparisonTable.jsx`) must pass axe with `table` rule enabled, confirming proper `scope` attributes on all `<th>` elements
- [ ] All modal components (`CreditPackModal`, `UpgradePrompt`, `CancellationRetentionModal`) must pass axe focus-trap rules
- [ ] `CreditUsageGauge` color states (green/yellow/red) must meet WCAG AA contrast ratio (4.5:1) — verified via Tailwind color palette audit against selected colors
- [ ] The `SubscriptionBanner` must include `role="alert"` and `aria-live="polite"` (or `"assertive"` for past_due and incomplete states)

**Files:**
- Modify: `package.json` (add jest-axe)
- Modify: `src/setupTests.js` (add toHaveNoViolations)
- Modify: All component test files created in Batches 3–7

---

## Modified Requirements

The following existing requirements contain errors, ambiguities, or gaps that must be corrected before they are implemented.

---

**MOD-01**: Section 7.4, Feature Gate Table — `creditPacks` row

**Original text:**
> `creditPacks` | basic | Free tier cannot buy packs

**Issue**: Section 17.1 (Wave 1 amendment) removes the Basic tier restriction on credit pack purchases. The feature gate table in Section 7.4 and the `useFeatureGate` hook spec still show Basic as a denied tier for `creditPacks`. This is a direct contradiction that will cause an implementation error: a developer building `useFeatureGate` from Section 7.4 will gate Basic users out of pack purchases; a developer building the checkout button from Section 17.1 will allow them. Both reference requirements that are now in conflict.

**Revised text:**
> `creditPacks` | _(no tiers denied)_ | All tiers including Basic may purchase credit packs. After first pack purchase by a Basic user, set `firstPackPurchasedAt: Timestamp` on user document and display post-purchase subscription upsell banner. Remove `creditPacks` and `autoRefill` rows from the denial table and update `useFeatureGate` to return `canAccess('creditPacks') === true` for all tiers.

**Rationale**: Section 17.1 establishes the policy change with explicit rationale (freemium conversion funnel). The feature gate table must be the authoritative source, and it must reflect the Wave 1 amendment.

---

**MOD-02**: Section 7.10, Subscription Status Enforcement Table — `past_due` grace period

**Original text (Section 7.10):**
> `past_due` | Full tier access (grace period: 7 days) | Red banner: "Payment failed. Update payment method."

**Issue**: Section 17.4 explicitly amends this to 14 days and adds a schema change (`firstPaymentFailedAt` field on `subscriptions`). The enforcement table in Section 7.10 still reads 7 days. Any developer who implements the frontend enforcement logic from Section 7.10 without reading Section 17.4 will implement the wrong grace period.

**Revised text:**
> `past_due` | Full tier access (grace period: **14 days** from `firstPaymentFailedAt` timestamp) | Red banner: "Payment failed. Update payment method." **Note**: Grace period is calculated from `subscriptions.firstPaymentFailedAt`, not from the current timestamp. If `firstPaymentFailedAt` is null (unexpected), treat as day 0 of grace period.

**Rationale**: Section 17.4 amends this value to align with Stripe Smart Retries. The grace period enforcement depends on a specific timestamp field (`firstPaymentFailedAt`) that was added to the schema in Section 18.4. The frontend enforcement logic must read that field, not calculate elapsed time from a subscription status change event.

---

**MOD-03**: Section 6.3, `SubscriptionContext` — `consumeCredits` function signature

**Original text:**
> `consumeCredits: (action, creditType, amount, toolName, resourceId) => Promise<result>`

**Issue**: The `SubscriptionContext` exposes `consumeCredits` with 5 arguments including explicit `creditType` and `amount`. The `useCredits` hook (Section 7.3) exposes `consumeCredits(action, toolName, resourceId)` with 3 arguments — `creditType` and `amount` are looked up internally from `CREDIT_COSTS[action]`. These two function signatures are incompatible and serve the same purpose. Having both in the app will lead to two different call patterns, inconsistent error handling, and duplicate network calls (if both `SubscriptionContext.consumeCredits` and `useCredits.consumeCredits` independently call `POST /api/credits/consume`).

**Revised text:**

Remove `consumeCredits` from `SubscriptionContext`. Replace with:

> The `SubscriptionContext` does NOT expose `consumeCredits`. Credit consumption is exclusively the responsibility of the `useCredits` hook. `SubscriptionContext` exposes a `refreshCredits()` function that `useCredits` calls after a successful consume response to force a re-read of the credit balance outside the normal Firestore listener cadence (needed for rapid sequential actions). The `hasCredits(creditType, amount)` helper remains on `SubscriptionContext` for synchronous pre-flight checks.

**Rationale**: A single consumption code path prevents double-billing bugs. The `useCredits` hook is the appropriate owner of consumption logic; the context's role is providing read access to subscription state, not orchestrating writes.

---

**MOD-04**: Section 5.1.2, Pricing Card CTA Logic — authenticated user states

**Original text:**
> If user is logged in and on a lower tier: "Upgrade to [Tier Name]"
> If user is on this tier: "Current Plan" (disabled)

**Issue**: This logic only covers two authenticated states but the subscription model has six statuses (`active`, `past_due`, `canceled`, `paused`, `trialing`, `incomplete`) and five tiers. Missing states include paused subscribers (should see "Resume Plan" on their current tier card), past-due subscribers (should see "Update Payment" on their current tier card to prevent confusion with an upgrade action), and users with `cancelAtPeriodEnd: true` (should see "Reactivating..." or "Plan ending [date]"). Implementing the incomplete CTA logic will produce confusing experiences for users in non-active states who visit the pricing page.

**Revised text:**

Replace the CTA logic with the following state table:

| Auth Status | Subscription Status | Card = Current Tier | Card = Lower Tier | Card = Higher Tier |
|-------------|--------------------|--------------------|-------------------|--------------------|
| Unauthenticated | N/A | "Get Started" / "Start [Tier]" | — | — |
| Authenticated | `active` | "Current Plan" (disabled) | "Downgrade" | "Upgrade to [Tier]" |
| Authenticated | `trialing` | "[X] days left in trial" (disabled) | "Downgrade" | "Upgrade to [Tier]" |
| Authenticated | `past_due` | "Update Payment" → `/app/billing` | (hide) | (hide) |
| Authenticated | `paused` | "Resume Plan" → `/app/billing` | (hide) | "Upgrade to [Tier]" |
| Authenticated | `canceled` / `cancelAtPeriodEnd` | "Reactivate" → `/app/billing` | (hide) | "Upgrade to [Tier]" |
| Authenticated | `incomplete` | "Complete Payment" → `/app/billing` | (hide) | (hide) |

**Rationale**: A pricing page is a high-intent surface for existing subscribers in distress states (past_due, paused). Showing them standard upgrade CTAs when their real need is payment recovery increases churn risk. Routing these users directly to `/app/billing` with actionable CTAs is the correct UX.

---

## Questions & Concerns

1. **Batch 6 Scope vs. Existing Component Stability**: Story 6.4 modifies 15+ existing tool components with `useCredits` integration. These components are presumably in active use by existing users. Is there a feature flag strategy for the credit gating rollout? If gating goes live for all users simultaneously and the `useCredits` hook has a bug, every tool action in the app will be affected. Recommend a feature flag (`VITE_CREDIT_GATING_ENABLED`) that allows credit gating to be deployed dark before activation.

2. **`tiers.js` Duplication Between Frontend and Backend**: Section 6.4 creates `src/config/tiers.js` and Section 2.1 of Story 2.1 creates `server/src/config/tiers.js` as a "mirror." If these are maintained as separate files, they will inevitably drift. Is there a plan to extract this into a shared package (e.g., a `packages/csp-config` workspace if the repo is a monorepo, or a published internal NPM package)? If not, the document should explicitly note who is responsible for keeping both files synchronized and how sync is verified in CI.

3. **Nonprofit Verification Admin Workflow and PDF Viewer**: Story 7.2 requires an embedded PDF/image viewer for admin document review. The project's current dependency list (`lucide-react`, `react-hot-toast`, `react-hook-form`, `react-datepicker`, `react-dropzone`) does not include a PDF viewer library. Rendering PDFs in-browser requires either `react-pdf` (adds ~300 KB gzipped via `pdfjs-dist`) or linking to the Firebase Storage URL directly (requires CORS configuration on the Storage bucket). This dependency decision needs to be made before Story 7.2 is estimated.

4. **Trial Eligibility Enforcement "One Trial Per Email"**: Section 14.2 states "one trial per email address, one trial per payment method (enforced at conversion)." Enforcing one-trial-per-email at registration time (before Stripe has a payment method) requires checking `email` against a `trial_history` collection or similar. This collection is not defined in Section 3. Who enforces this check — the frontend, the backend on `POST /api/checkout/create-session`, or Stripe? If it's the backend, a new API endpoint or middleware check is needed that is not currently specified.

5. **Wave 1 Additions to Batch 2 Backend (Story 2.12 and Section 19)**: Sections 12, 13, 15, 16, 17, 18, and 19 add backend requirements that are logically part of Batch 2 but are appended after the batch definition without updating the batch's estimated scope (~20 files) or story count. The `emailService.js` (Story 2.12), `privacyService.js`, `complianceService.js`, `leads.js` route, `privacy.js` route, and `security_events` logging collectively add at least 8 more files to Batch 2. The batch sequencing in Appendix A should be updated to reflect the true scope, as the current "~20 files" estimate is now significantly understated.

6. **`CancellationRetentionModal` Discount Coupon Implementation**: Section 16.2 states the discount coupon is applied "if `STRIPE_RETENTION_COUPON_ID` env var is set." This creates an implicit feature flag via environment variable configuration. If the coupon is not configured and a "Too expensive" reason is selected, what is the fallback save offer shown? This conditional is not specified, leaving the UI behavior undefined for the case where the env var is absent.

7. **Annual Plan Downgrade Policy**: Section 13.2 states "annual subscribers do not receive prorated refunds on downgrade — plan changes take effect at annual renewal date." This creates a material asymmetry vs. monthly plans (where downgrades take effect at period end with no proration). The `PlanManagement.jsx` confirmation modal must display different copy for annual vs. monthly downgrades, but Story 5.4 does not mention annual plan handling at all. Is `PlanManagement` expected to handle both intervals from day one?

---

## Approval Status

**Needs Revision**

The document is comprehensive and well-organized for a v1.0 draft. However, it cannot proceed to implementation in its current form due to four Critical findings that will cause mid-sprint blockers and potentially require rework of multiple components:

- Skeleton loading states must be specified before Batch 5 stories are pointed and assigned.
- The race condition recovery UX and `consumeCredits` duplication must be resolved before any Batch 6 work begins, as the pattern will be applied to 15+ components simultaneously.
- The Stripe.js bundle strategy must be defined before Batch 4, as the wrong initialization pattern will be very difficult to refactor after it has propagated into three separate flows.
- The registration state machine must be updated to incorporate Wave 1 complexity (annual interval, disclosure checkbox, trial path) before Story 4.1 is implemented.

Additionally, the six Major findings — particularly the absence of `data-testid` requirements, error boundary specifications, and E2E test scenarios — represent systemic gaps that will accumulate as implementation debt if not addressed in the requirements phase.

**Recommended next step**: Address Critical findings REQ-11-C01 through REQ-11-C04 and add the five New Requirements above. Return for a second review pass before Batch 3 implementation begins.