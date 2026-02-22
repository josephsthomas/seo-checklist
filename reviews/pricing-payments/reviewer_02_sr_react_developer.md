# Sr. React Developer — Requirements Review

**Reviewer:** Sr. React Developer
**Document:** pricing-payments-requirements.md
**Date:** 2026-02-22
**Status:** Complete

---

## Executive Summary

This requirements document is an unusually well-structured SaaS monetization specification. It covers tier definitions, Firestore schema design, a complete Node/Express backend API, multi-step registration flow changes, usage enforcement hooks, admin dashboards, and — commendably — a Wave 1 legal and compliance layer that addresses FTC, GDPR, CCPA, and OFAC obligations. The batch-oriented delivery strategy is sensible and the dependency graph in Appendix A is correct. The document is substantially better than the average PRD a React team receives.

However, from the perspective of a senior React 18 engineer who will own implementation, there are significant gaps across six domains that will cause real-world rework if not resolved before a single line of code is written. The most severe issues are: (1) `SubscriptionContext` is architecturally designed to cause cascading re-renders across the entire application on every credit-balance Firestore snapshot — the document prescribes a single monolithic context with no memoization, selector, or split-context strategy; (2) `useCredits` is described as both a hook and a pass-through to `SubscriptionContext` with its own API call responsibility, creating ambiguous ownership of the credit-consume side-effect that will lead to race conditions visible to users; (3) the `RegisterForm` state machine is described in prose but no formal state machine type or transition table is provided, meaning five different developers will implement five different ad-hoc `useState` patterns that are impossible to test deterministically; (4) the testing strategy section (10.2) is four sentences and covers an implementation touching 55+ files and two environments; (5) no TypeScript migration path or even JSDoc typing requirement is specified for any of the new files despite the existing codebase shipping `@types/react` and `@types/react-dom`; and (6) the Vite/code-splitting strategy for the new billing bundle — which will include Stripe.js, a charting library, and multiple async API calls — is completely absent.

The document should not be handed to a development team in its current state. It needs the architectural corrections and missing specifications described in the Critical and Major findings below before implementation begins. Conditional approval is granted if all Critical findings are resolved and at least the high-priority Major findings are addressed before Batch 1 development starts.

---

## Sections Reviewed

| Section | Title | Focus Level |
|---------|-------|-------------|
| §1 | Overview & Goals | Reviewed |
| §2 | Tier Definitions & Credit System | Deep |
| §3 | Data Models & Firestore Schemas | Deep |
| §4 | Backend API Specifications | Detailed |
| §5 | Frontend Components | Deep |
| §6 | Registration Flow Updates | Deep |
| §6.3 | SubscriptionContext | Deep |
| §6.4 | Tier Configuration Constants | Deep |
| §7 | Usage Enforcement & Gating | Deep |
| §7.3 | `useCredits` Hook | Deep |
| §7.4 | `useFeatureGate` Hook | Deep |
| §8 | Admin Features & Observability | Detailed |
| §9 | User Stories by Implementation Batch | Deep |
| §10 | Implementation Notes & Conventions | Detailed |
| §11 | Legal & Compliance | Reviewed |
| §12 | Transactional Email System | Reviewed |
| §13 | Annual Pricing | Detailed |
| §14 | Free Trial Strategy | Detailed |
| §15 | Enterprise Lead Capture | Reviewed |
| §16 | Cancellation Retention Flow | Reviewed |
| §17 | Credit System Amended Policies | Deep |
| §18 | Compliance Data Models | Reviewed |
| §19 | New API Endpoints Wave 1 | Detailed |
| App.jsx, AuthContext.jsx, RegisterForm.jsx | Existing Code | Deep |
| vite.config.js, package.json, test files | Build & Test Config | Deep |

---

## Findings

### Critical (Must fix before implementation)

---

**[REQ-02-C01]** §6.3 — **SubscriptionContext Architecture Will Cause Whole-App Re-Renders on Every Firestore Snapshot**

The document specifies a single `SubscriptionContext` that exposes `tier`, `subscription`, `isActive`, `isPaused`, `isPastDue`, `credits` (both standard and AI objects), `tierConfig`, `canUseFeature`, `hasCredits`, `consumeCredits`, and `loading` all in one context value. The context listens to `credit_balances/{userId}` via `onSnapshot`, which fires every time a credit is consumed anywhere in the app. Since all of these values are bundled into a single object reference, every `onSnapshot` event will produce a new context value object, which will trigger a re-render in **every single component** that calls `useSubscription()` — including the 15+ tool components that will receive `useCredits` integration in Batch 6. This is a textbook React context performance anti-pattern. With the `CreditBadge` component intended to appear next to every action button across all tools, the number of subscribed components will be extremely high.

**Recommendation:** Split `SubscriptionContext` into at minimum three separate contexts following the "context splitting" pattern documented in the React team's official guidance: (1) `SubscriptionDataContext` — holds `tier`, `subscription`, `subscriptionStatus`, `tierConfig`, and boolean flags; this changes rarely (only on plan change); (2) `CreditBalanceContext` — holds `credits.standard` and `credits.ai` objects; this changes on every credit event; (3) `SubscriptionActionsContext` — holds `canUseFeature`, `hasCredits`, `consumeCredits`; these are stable function references and should never cause re-renders. Consumers of only `canUseFeature` (e.g., `useFeatureGate`) will subscribe only to `SubscriptionDataContext` and will not re-render on credit events. `CreditBadge` and `CreditUsageGauge` subscribe only to `CreditBalanceContext`. Wrap each context value in `useMemo` with explicit dependency arrays. Expose a unified `useSubscription()` hook for components that genuinely need all three if necessary, but document that most components should use the narrow hooks: `useSubscriptionData()`, `useCreditBalance()`, `useSubscriptionActions()`.

---

**[REQ-02-C02]** §7.3 and §6.3 — **`useCredits.consumeCredits` and `SubscriptionContext.consumeCredits` Are Duplicated with Undefined Ownership**

Section 6.3 declares that `SubscriptionContext` provides a `consumeCredits` function. Section 7.3 declares that `useCredits` also provides a `consumeCredits` function and says it "calls `POST /api/credits/consume` via API client, updates local state on success." It is not specified whether `useCredits.consumeCredits` delegates to `SubscriptionContext.consumeCredits` or re-implements the network call independently. If they are independent, there will be two competing paths to mutate credit state, with no guaranteed ordering relative to the `onSnapshot` callback. If `useCredits.consumeCredits` calls the backend directly and then the `onSnapshot` arrives 200ms later, the local optimistic update and the server truth may produce a visible flicker in every `CreditBadge` across the page. If they share the same function reference via context, the context architecture must guarantee stable identity across renders using `useCallback`, which is not specified.

**Recommendation:** Remove `consumeCredits` from `SubscriptionContext` entirely. Make `useCredits` the sole owner of the credit-consume side effect. `useCredits` calls the backend via `src/lib/api.js`, then does **nothing** to local state optimistically — it relies entirely on the `onSnapshot` listener in `CreditBalanceContext` to reflect the updated balance. This simplifies reasoning: the backend is authoritative; Firestore is the live view; the hook is purely a command dispatcher. Add a `isPending` flag to `useCredits` that is set `true` when the API call is in flight and `false` when the `onSnapshot` event arrives with the new balance (correlate using the `updatedAt` timestamp on `credit_balances`). Document this pattern explicitly in the hook's JSDoc.

---

**[REQ-02-C03]** §6.2.4 — **RegisterForm State Machine Described in Prose, Not as a Typed State Machine**

Section 6.2.4 says "Add state machine for multi-step flow: `account_details` → `plan_confirmation` → `checkout` → `success`." The acceptance criteria in Story 4.1 add a separate `checkout` step and a nonprofit branch. The document also describes `tier=basic` skipping step 2, `tier=nonprofit` adding a verification step, and Google OAuth having its own variant. This results in at minimum 6 distinct valid state+tier combinations, several of which have different allowed transitions. Implementing this with ad-hoc `useState` calls — which is what the developer will default to given only prose guidance — produces untestable spaghetti. The existing `RegisterForm.jsx` already has four independent `useState` calls for a form that has no steps; the multi-step version will be significantly more complex.

**Recommendation:** Require the use of a formal state machine. The project already uses React 18, which has excellent support for `useReducer`-based state machines. Define a reducer with explicit state type values and guard functions on transitions. At minimum specify the type shape:

```javascript
// State shape
{
  step: 'account_details' | 'nonprofit_verification' | 'plan_confirmation' | 'redirecting' | 'success' | 'canceled',
  tier: TierID,
  interval: 'month' | 'year',
  accountCreated: boolean,
  verificationSubmitted: boolean,
  checkoutSessionId: string | null,
  error: string | null
}

// Valid transitions
ACCOUNT_CREATED → (tier=basic) → success
ACCOUNT_CREATED → (tier=nonprofit) → nonprofit_verification → plan_confirmation → redirecting
ACCOUNT_CREATED → (tier=paid) → plan_confirmation → redirecting
REDIRECTING → (Stripe cancel) → canceled
REDIRECTING → (Stripe success) → success (via URL param detection on /app)
```

Add a Vitest unit test file for this reducer (`src/components/auth/__tests__/RegisterForm.reducer.test.js`) that tests all valid transitions and rejects invalid ones. This is a prerequisite for Story 4.1 acceptance criteria to be verifiable.

---

**[REQ-02-C04]** §6.3 and Story 1.3 — **`SubscriptionContext` Has No Error Boundary Strategy for Firestore Listener Failures**

The context is described as listening to `credit_balances/{userId}` via `onSnapshot`. The document specifies "Falls back gracefully when `credit_balances` doc doesn't exist (treats as basic tier)" — but this handles only the missing-document case. It does not specify: what happens when the Firestore listener itself errors (network drop, permission denied, quota exceeded); what happens if the listener is set up before Firebase Auth is initialized (race condition if `SubscriptionProvider` is mounted before `AuthProvider` resolves); or what happens during the window between Firebase Auth sign-in completing and the backend having written the user's `credit_balances` document (up to several seconds while webhooks propagate). During this window, every `canAfford()` check will return false and every `CreditBadge` will show 0 credits, which may cause a newly subscribed user to see a broken UI immediately after payment.

**Recommendation:** Add explicit error state handling to `SubscriptionContext` requirements. Specify: (1) the `onSnapshot` `onError` callback must set `error` state and fall back to cached last-known-good values, not to basic-tier zeros; (2) the context must not start the Firestore listener until `currentUser` is non-null and `loading` is false in `AuthContext`; (3) after `checkout.session.completed`, the billing dashboard must show a "Setting up your account..." skeleton for up to 10 seconds while polling for the `credit_balances` document to appear, rather than showing 0 credits; (4) wrap the `SubscriptionProvider` tree in a dedicated `ErrorBoundary` (the project already has `ErrorBoundary` implemented in `src/components/shared/ErrorBoundary.jsx`) so a fatal listener error degrades gracefully instead of crashing the app.

---

**[REQ-02-C05]** §10.2 and all Batch stories — **Testing Strategy Is Dangerously Inadequate for Payment-Critical Code**

Section 10.2 is four sentences. It says: unit tests for tier configs and hook logic, integration tests for API endpoints, component tests for "critical UI flows," and manual testing for Stripe. This is not a testing strategy — it is a sentence that acknowledges tests should exist. The implementation touches 55+ files, introduces a credit ledger (financial data), Stripe webhook handlers (idempotency-critical), multi-step form state machines, and feature-gating logic that gates every AI call in the product. There are no coverage targets, no specification of which component tests are required, no mock strategy for Firestore `onSnapshot`, no contract for how to mock `src/lib/api.js` in component tests, no specification for testing the `useCredits` hook with race conditions, and no requirement to test the `SubscriptionContext` behavior when `credit_balances` is missing.

The existing codebase has good test coverage in the readability module (`src/components/readability/__tests__/`) including accessibility tests with `jest-axe`, which demonstrates the team is capable of thorough testing. The billing system must be held to the same standard or higher given its financial nature.

**Recommendation:** Replace Section 10.2 with a full "Testing Requirements" section. Required minimum coverage and test files:

```
src/config/__tests__/tiers.test.js            — All CREDIT_COSTS, TIER_CONFIGS, CREDIT_PACKS exhaustive validation
src/contexts/__tests__/SubscriptionContext.test.jsx  — onSnapshot behaviors, error states, loading states, fallback values
src/hooks/__tests__/useCredits.test.js        — canAfford, consumeCredits success/failure/race-condition paths
src/hooks/__tests__/useFeatureGate.test.js    — all feature gate permutations per tier
src/components/auth/__tests__/RegisterForm.reducer.test.js — all state machine transitions
src/components/auth/__tests__/RegisterForm.integration.test.jsx — multi-step flow per scenario A/B/C/D
src/components/billing/__tests__/BillingDashboard.test.jsx — credit gauges, subscription states
src/components/billing/__tests__/CreditPackModal.test.jsx — accessibility, focus trap, disabled state
src/components/shared/__tests__/UpgradePrompt.test.jsx — modal and banner variants, ARIA
src/components/shared/__tests__/CreditBadge.test.jsx — correct cost lookup, color states
server/tests/creditService.test.js           — atomic transactions, priority order, auto-refill cap
server/tests/webhooks.test.js                — idempotency (replay same event twice), all 11 event types
```

Minimum coverage targets: 85% line coverage on `src/hooks/`, `src/contexts/SubscriptionContext.jsx`, `src/config/tiers.js`. 100% branch coverage on `creditService.js` `consumeCredits` (financial logic). Firestore `onSnapshot` must be mocked using the pattern already established in the readability tests.

---

**[REQ-02-C06]** §4.4.3 — **`POST /api/credits/consume` Called from the Frontend Before Executing Actions Is a Security Anti-Pattern**

Section 7.2 (Credit Consumption Flow) and Section 7.3 (`useCredits`) describe the following sequence: the frontend checks local credit balance, and if sufficient, calls `POST /api/credits/consume` to "reserve" credits, then executes the tool action. The credit consumption and the tool action are two separate, non-atomic operations at the frontend level. If the network connection drops between the consume call succeeding and the tool action being initiated, credits are consumed but the action never executes. If the tool action fails server-side after credits are consumed, there is no credit refund mechanism specified. More critically, Section 7.3 says "Call backend POST /api/credits/consume" with `action`, `toolName`, and `resourceId` — but the actual AI call (e.g., to the LLM) is made by a separate service not described in this document. This means there is no transactional guarantee that the credit deduction and the AI call are atomic.

**Recommendation:** Redesign the credit consumption flow so that credit deduction is performed server-side as part of the same backend operation that executes the AI/tool action — not as a pre-flight call from the frontend. The frontend should call a single endpoint like `POST /api/tools/audit/ai-suggestions` which (server-side) atomically: checks credits, deducts credits via `creditService.consumeCredits()` inside a Firestore transaction, executes the AI call, and returns the result. If the AI call fails, the Firestore transaction is rolled back. The frontend's `useCredits.canAfford()` check should remain as a UX optimization only — to avoid even making the API call if clearly insufficient — but must never be the authoritative gate. If the current architecture prevents this because the AI calls are handled by a separate service or the frontend calls an external LLM directly, that architectural decision must be made explicit in the requirements and the refund/retry mechanism must be fully specified.

---

### Major (Should fix before implementation)

---

**[REQ-02-M01]** §5.1.3 and Story 3.2 — **PricingComparisonTable Accessibility Requirements Are Incomplete for a Complex Data Table**

Section 5.1.3 and Story 3.2's AC state "Accessible: proper `<table>` semantics, `scope` attributes, `aria-label` on icons." This is a starting point, not a specification. The feature comparison table has: 7 categories each with multiple rows, collapsible category sections, a sticky first column, horizontal scroll on mobile, and checkmark/X icons. This is one of the most accessibility-challenging HTML patterns in existence. The existing codebase already uses `jest-axe` (it is a `devDependency` in `package.json`) and the readability module has an `axe-accessibility.test.jsx` file, demonstrating the team knows how to axe-test components. The pricing page table needs an equivalent test and a more complete ARIA specification.

**Recommendation:** Add the following to Story 3.2's AC: (1) category collapsible rows must use `<tr aria-expanded>` and `<tr hidden>` or equivalent — not CSS `display:none` alone — so screen readers know the section is collapsible; (2) the sticky first column must be `<th scope="row">` not `<td>`; (3) tier column headers must be `<th scope="col">` with `id` attributes so row cells can use `headers` attribute for proper cross-referencing in complex tables; (4) checkmark icons (likely Lucide `Check`) must have `aria-label="Available"` or equivalent; X marks must have `aria-label="Not available"`; specific values must have `aria-label` that includes the tier context (e.g., `aria-label="5 projects, Freelance plan"`); (5) the horizontal scroll container must have `role="region"` and `aria-label="Plan comparison table"` and `tabindex="0"` so keyboard users can scroll it; (6) add `src/components/public/__tests__/PricingComparisonTable.axe.test.jsx` using the existing `jest-axe` toolchain as a required AC item.

---

**[REQ-02-M02]** §5 (all billing components) and §6 — **No TypeScript Requirement for New Financial-Critical Code**

The document specifies `.jsx` files throughout and uses plain JavaScript in all code samples. The existing `package.json` has `@types/react` and `@types/react-dom` installed, which means the project is at minimum JSDoc-typed and may be partially typed. The new billing system introduces: a credit ledger, Stripe API integration, complex multi-state subscriptions, and cross-cutting context data. Without TypeScript or at minimum rigorous JSDoc typedefs, the following bugs become trivially easy to introduce: passing `'standard'` where `'ai'` is expected in `creditType`; comparing a `number` credit balance against a `string` from a Firestore read; calling `consumeCredits('audit_upload')` with a typo in the action key that silently fails the `CREDIT_COSTS` lookup; and incorrectly spreading subscription status objects.

**Recommendation:** Require TypeScript for all new files created in this project (the Vite config already supports TypeScript via `@vitejs/plugin-react`). New files should use `.tsx` / `.ts` extensions. At minimum, require a `src/types/billing.ts` file that exports: `TierID`, `CreditType`, `CreditAction`, `SubscriptionStatus`, `CreditBalance`, `SubscriptionRecord`, `TierConfig`, and the discriminated union `CreditGateResult`. Make these types importable by both frontend components and (via shared types package or copy) the backend tests. If a full TypeScript migration is not acceptable for this project, require comprehensive JSDoc `@typedef` blocks in `src/config/tiers.js` and mandate that all hook return values are documented with JSDoc `@returns` including the full object shape. Add an ESLint rule requiring JSDoc on exported functions in billing-related files.

---

**[REQ-02-M03]** §6.3, Story 1.3 — **SubscriptionContext Does Not Specify a Stable Reference Strategy for `canUseFeature` and `hasCredits`**

Section 6.3 lists `canUseFeature: (featureName) => boolean` and `hasCredits: (creditType, amount) => boolean` as context values. These are functions. If they are created as arrow functions inside the `SubscriptionProvider` render body without `useCallback`, they will be new function references on every render. Because the context triggers re-renders in consumers, and the consumers call these functions to produce their own derived state, this produces an infinite render loop pattern in components that use these functions as `useEffect` or `useCallback` dependencies. Even in components that do not use them as dependencies, the unstable references mean `React.memo` wrapping on consumer components will be ineffective.

**Recommendation:** Require that `canUseFeature`, `hasCredits`, and any other functions placed in context values are wrapped in `useCallback` with explicit dependency arrays. Specify that `canUseFeature` depends on `[tier, tierConfig]` and `hasCredits` depends on `[credits.standard.remaining, credits.standard.bonus, credits.ai.remaining, credits.ai.bonus]`. Add to Story 1.3 AC: "All function values in context must be wrapped in `useCallback`. Verify with a Vitest test that renders a consumer twice with identical credit state and confirms the function references are stable (`Object.is(fn1, fn2)`)."

---

**[REQ-02-M04]** §5.2 and Story 5.1 — **BillingDashboard Specified to Make API Calls on Mount Without Suspense or Error Boundary Strategy**

Story 5.1's AC states: "Calls `GET /api/credits/balance` and `GET /api/credits/history?limit=10` on mount." This implies two separate `useEffect` + `fetch` calls in the component. The document also says the component "Uses `useSubscription` context for data." This creates a confusing data ownership question: does the component get credit data from context (Firestore real-time) or from the API call? If both, which wins? When they disagree (e.g., context shows 345 credits but the API call returns 342 because of a race), what does the user see? Additionally, two sequential API calls on mount with no loading/error/skeleton state specified will produce layout shift and potentially a flash of incorrect data.

**Recommendation:** Clarify data sourcing unambiguously. The credit balance displayed in `BillingDashboard` must come exclusively from `CreditBalanceContext` (the Firestore `onSnapshot`) — never from a direct API call. The Firestore real-time listener is already the authoritative display layer for credit state; adding a redundant `GET /api/credits/balance` call introduces a race condition and doubles the data paths. The `GET /api/credits/history?limit=10` call for recent transactions is appropriate since transaction history is not in context. Require this data fetch to be wrapped in a `Suspense`-compatible pattern — either use a data-fetching library already available in the project or implement `use()` with a promise (React 18 supports this). Specify skeleton placeholder states for: the credit gauges while the Firestore listener initializes, and the usage activity list while the history API call is pending. These skeletons must be specified visually (not just "show a spinner") because the existing `BillingDashboard` layout wireframe in §5.2.1 will shift badly if a full-height spinner replaces the credit gauge area.

---

**[REQ-02-M05]** §7.3 — **`useCredits.showUpgradePrompt()` Has No Specified State Mechanism**

The `useCredits` hook is documented as providing `showUpgradePrompt: () => void` which "triggers the UpgradePrompt modal." The UpgradePrompt modal is a separate component. There is no specification for how the hook's imperative `showUpgradePrompt()` call connects to the modal's open state. The document does not specify: whether `UpgradePrompt` is a global singleton in the layout (portal-based), whether it is rendered conditionally by each consumer component, or whether there is a global modal context. Without this, 15+ tool components will each implement a different local `useState` solution, resulting in inconsistent behavior and duplicated modal instances.

**Recommendation:** Specify a global modal context — `UpgradePromptContext` — that is the single source of truth for the modal's open state and the current feature/action context being displayed. `showUpgradePrompt({ feature?, action?, creditsRequired?, creditsAvailable? })` dispatches to this context. The `UpgradePrompt` component itself is rendered once in `ToolLayout.jsx` as a portal (`ReactDOM.createPortal` into `document.body`), subscribing to the context. `useCredits` and `useFeatureGate` both import and call the context's dispatch. This avoids 15 separate local modal states and ensures only one modal is ever visible at a time. Add `src/contexts/UpgradePromptContext.jsx` to the file manifest in Appendix B.

---

**[REQ-02-M06]** §3.4, §17.2, and Story 1.5 — **`credit_packs.expiresAt` Added in §17.2 Is Not Reflected in Story 1.5 Migration Script or `creditService.js` Logic**

Section 17.2 adds `expiresAt: Timestamp` to the `credit_packs` collection (§3.6) and requires a daily cron job to expire packs. However: Story 1.5 (user migration script) does not mention creating `credit_packs` documents for existing users with purchased packs (if any exist); Story 2.6 (`creditService.js`) does not mention checking `expiresAt` in the `consumeCredits` priority order (monthly → bonus → overage); the `addPackCredits` function in `creditService.js` must set `expiresAt = purchasedAt + 365 days` but this is not in Story 2.6's AC; and the `GET /api/credits/balance` response in §4.4.3 does not include pack expiration dates, so users have no way to know their bonus credits are about to expire.

**Recommendation:** Add to Story 2.6 AC: "`consumeCredits` must filter bonus credits by `expiresAt > now()` before including them in the available balance calculation — expired bonus credits are treated as zero balance." Add to Story 2.6 AC: "`addPackCredits` must set `expiresAt = Timestamp.fromDate(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))`." Add to `GET /api/credits/balance` response schema in §4.4.3: a `bonusPacks` array listing each unexpired pack with `packType`, `standardCreditsRemaining`, `aiCreditsRemaining`, and `expiresAt`. Add to Story 5.1 (`BillingDashboard`): "Show expiring bonus credits warning if any pack expires within 30 days." Add a new Story 2.13: "Credit pack expiration cron job" that specifies the daily job implementation.

---

**[REQ-02-M07]** §13 — **Annual Billing Toggle and Interval Selection Are Not Integrated with SubscriptionContext or the Registration State Machine**

Section 13 introduces annual billing with a `Monthly | Annual` toggle on the pricing page. Section 13.4 AC says "CTA buttons pass `interval: 'month' | 'year'` to `POST /api/checkout/create-session`." But: (1) the `RegisterForm` state machine in Section 6.2.4 makes no mention of `interval` — when a user arrives at `/register?tier=client` from the pricing page with annual selected, there is no mechanism to carry the `interval` through the registration flow; (2) `TIER_CONFIGS` in Section 6.4 does not include `annualPriceId` or `annualTotal` in the constant definitions — Section 13.3 shows these fields but only for a hypothetical `clientSide` key (inconsistent casing with the rest of the document which uses `client`); (3) the `PlanConfirmationStep.jsx` must show the correct interval and charge but receives no specification for where it reads `interval` from — whether it's a URL param, a prop, or local state is unspecified; (4) `SubscriptionContext` has no `interval` field, so billing dashboard cannot show whether the current subscription is monthly or annual.

**Recommendation:** Add `?interval=month|year` as a URL parameter to the registration flow (§6.2.3 URL Parameters table). Add `interval: 'month' | 'year'` to the `RegisterForm` state machine shape. Add `interval` to the `SubscriptionContext` value. Update all `TIER_CONFIGS` entries (not just `clientSide`) to include `annualPriceId` and `annualTotal` fields with consistent key naming. Update Story 4.1 AC to include the interval parameter. Update `GET /api/subscriptions/current` response to include `interval: 'month' | 'year'`.

---

**[REQ-02-M08]** §5, §6 — **No React.memo or Memoization Strategy Specified for the 15+ Tool Components Receiving Credit Gating**

Story 6.4 says to add `useCredits` and `CreditBadge` to 15+ existing tool components. The `useCredits` hook internally uses `useSubscription`, which is subscribed to `CreditBalanceContext`. Every credit-consuming event (e.g., a user uploads an audit) will trigger a `onSnapshot` update, which will cause all `CreditBalanceContext` consumers to re-render. After Batch 6, every tool component that has a `CreditBadge` will re-render on every credit event — including components that are currently visible but not the active tool. For example, if `AuditPage` is mounted and the user is on a different route, any context change will still cause an unnecessary render pass through the audit component tree.

**Recommendation:** Add to Story 6.4 AC: "Wrap all components that receive `useCredits` integration in `React.memo` where they are not already memoized. Memoize the `CreditBadge` component itself with `React.memo`. The `CreditBadge` should read directly from `CreditBalanceContext` using the narrow `useCreditBalance()` hook, not from the full `useSubscription()` hook, to minimize re-render scope." Add to Story 6.3 (Shared Gating UI Components): "Add `CreditBadge.displayName = 'CreditBadge'` for DevTools visibility." Additionally, specify that `consumeCredits` in `useCredits` must be wrapped in `useCallback` with stable dependencies, because it will be passed as a prop or used in `useEffect` arrays inside tool components.

---

**[REQ-02-M09]** §4 — **`src/lib/api.js` Token Refresh Logic Is Underspecified for Payment-Critical Flows**

Story 4.2 specifies creating `src/lib/api.js` with: "Handles 401 responses (token expired → refresh → retry)." Firebase ID tokens expire after 1 hour. The token refresh requires calling `currentUser.getIdToken(true)` (force refresh) which is an async operation. The specification does not address: what happens if the user's network is offline during the refresh; what happens if `getIdToken` throws (e.g., the Firebase Auth session has been invalidated, which happens when an admin disables the account); whether the retry should happen transparently once or surface an error to the user; and critically, what happens during a payment-critical flow like `POST /api/checkout/create-session` if the token expires mid-request — a failed token refresh could leave the user stranded mid-checkout with no actionable error message.

**Recommendation:** Specify the `src/lib/api.js` error handling contract explicitly. Require: (1) a single retry on 401 with forced token refresh; (2) if the second attempt also returns 401 (session invalidated), redirect to `/login?reason=session_expired&returnTo={encodedCurrentPath}` so the user can re-authenticate and return to their flow; (3) for payment-critical endpoints (`/api/checkout/*`), the error handler must show a user-facing toast ("Your session expired. Please sign in again to complete your purchase") before redirecting; (4) network offline errors (no response) must be distinguished from auth errors and must NOT redirect to login — instead show a reconnection banner. Add these behaviors to Story 4.2's AC.

---

**[REQ-02-M10]** §14 — **Free Trial State Is Not Represented in `SubscriptionContext` or `SubscriptionBanner`**

Section 14 specifies a 14-day Freelance trial with `subscriptionStatus: 'trialing'`. Section 7.10 already includes `trialing` in the status enforcement table with "Trial banner with end date." However: (1) `SubscriptionContext` (§6.3) exposes `isActive`, `isPaused`, and `isPastDue` boolean flags, but no `isTrialing` flag — trial-specific UI in `SubscriptionBanner` must re-implement trial detection by string-comparing `subscription.status === 'trialing'`; (2) the trial countdown ("X days remaining") requires `trialEndDate` from the `subscriptions` document, but `SubscriptionContext` only exposes `subscription: object | null` generically — the shape of that object is not typed; (3) Story 14.2 says "Billing dashboard shows trial countdown in days when `subscriptionStatus === 'trialing'`" but `BillingDashboard` reads from `useSubscription` context — the context must expose `trialEndDate` or the component must reach into the raw `subscription` object; (4) the "1 day before trial end: In-app full-screen prompt on next login" in Story 14.2 has no specified implementation — there is no modal, no route, and no mount-time check specified in any existing component.

**Recommendation:** Add `isTrialing: boolean` and `trialEndsAt: Date | null` and `trialDaysRemaining: number | null` to the `SubscriptionContext` value contract. Add to Story 1.3 AC: "Compute `trialDaysRemaining` from `Math.ceil((trialEndDate - Date.now()) / 86400000)`, expose as context value." Add a new Story 14.3: "Trial expiry prompt implementation" specifying a `TrialExpiryModal` component in `src/components/billing/TrialExpiryModal.jsx`, mounted in `HomePage.jsx` or `ToolLayout.jsx`, that checks `trialDaysRemaining <= 1` on mount and shows the full-screen prompt. Add `isTrialing` and `trialEndsAt` to the `subscriptions` Firestore document shape referenced in `SubscriptionContext`.

---

### Minor (Fix during implementation)

---

**[REQ-02-m01]** §3.8 and Wave 1 Modification Index — **`nonprofit_verifications` Schema Updated in Modification Index but §3.8 Schema Block Not Revised**

The Wave 1 Modification Index table at the end of the document states that `nonprofit_verifications` schema was extended with: `countryCode`, `nonprofitRegistrationType`, `documentRetainUntil`, `applicantAttestedAt`, `iersVerificationResult`, `reVerificationReminderSentAt`. However, Section 3.8's code block still shows the original schema without these fields. An implementor reading Section 3.8 in isolation (the natural reading order) will implement the incomplete schema.

**Recommendation:** Update the code block in Section 3.8 to include all Wave 1 additions inline. Remove or collapse the modification index entry for this schema since the canonical location should be Section 3.8 itself.

---

**[REQ-02-m02]** §2.1 and Wave 1 Modification Index — **Freelance Tier Seat Count Modified to "1 owner + 1 collaborator" But No Technical Implementation for the Collaborator Seat Is Specified**

The Wave 1 Modification Index changes Freelance seats from 1 to "1 (owner) + 1 collaborator seat (read-only)." No story, endpoint, UI component, or Firestore schema change is specified for this additional seat. The collaborator seat presumably requires: an invite flow, a `role: 'collaborator'` type in the existing roles system, read-only permission enforcement in `ProtectedRoute`, and a seat-count check in the backend. None of this is specified.

**Recommendation:** Either revert the Freelance seat count change to 1 (deferring the collaborator feature to v2) or add a full user story in Batch 6 or 7 specifying: (1) the invite flow for the one collaborator seat, (2) the `role: 'collaborator_readonly'` addition to `src/utils/roles.js`, (3) backend enforcement in subscription management, and (4) the UI treatment in `TeamManagementPage.jsx` for Freelance users (currently the document says team management is entirely disabled for Freelance — this is now inconsistent with the seat count change).

---

**[REQ-02-m03]** §5.2.2 and Story 5.2 — **`CreditPackPurchaseModal` Focus Trap Specified But No Implementation Reference Provided**

Story 5.2 AC says "Accessible: focus trap, escape to close, proper ARIA attributes." The project does not currently have a focus trap utility in `package.json` (`focus-trap-react` is not listed). All existing modals in the codebase appear to implement their own focus management ad-hoc. A credit pack purchase modal that lacks a proper focus trap will trap keyboard users outside the modal or allow focus to escape to the obscured background.

**Recommendation:** Add `focus-trap-react` to `package.json` dependencies and specify it as the standard focus management solution for all new modals in this feature set: `CreditPackModal`, `UpgradePrompt` (modal variant), the cancellation retention flow modal, and the enterprise lead capture modal. Alternatively, specify using the existing project pattern (read one existing modal to identify it). Make this a shared `Modal` wrapper component rather than 4 separate implementations — add `src/components/shared/Modal.jsx` to the file manifest with AC: "Implements focus trap, escape to close, `role='dialog'`, `aria-modal='true'`, `aria-labelledby`, backdrop click to close, and scroll-lock on body."

---

**[REQ-02-m04]** §9, Batch 2 — **Backend Test Files Listed in Appendix B Do Not Match Story Specifications**

Appendix B lists `server/tests/*.test.js (6 files)` but Story 2.2 creates `server/tests/middleware/auth.test.js`, Story 2.4 creates `server/tests/checkout.test.js`, Story 2.5 creates `server/tests/webhooks.test.js`, Story 2.6 creates `server/tests/creditService.test.js`, Story 2.7 creates `server/tests/credits.test.js`, Story 2.8 creates `server/tests/subscriptions.test.js`, Story 2.9 creates `server/tests/billing.test.js`, Story 2.10 creates `server/tests/nonprofit.test.js`, and Story 2.12 implies email service tests. That is 9+ files, not 6, and one is in a subdirectory. The file manifest is wrong and will cause missed test files in code review.

**Recommendation:** Update Appendix B to list all backend test files explicitly. Add `server/src/services/emailService.test.js` as a required test file per Story 2.12's compliance-critical requirements.

---

**[REQ-02-m05]** §5.1 — **Vite Code Splitting for Billing Bundle Not Specified**

`vite.config.js` in the existing codebase has a well-considered `manualChunks` strategy for `exceljs`, `jspdf`, Firebase, charts, etc. The new billing components will introduce: `@stripe/stripe-js` (if used for embedded Stripe Elements — though the document says Stripe Checkout redirect, the Stripe publishable key in env vars and `VITE_STRIPE_PUBLISHABLE_KEY` suggests some client-side Stripe SDK usage); `react-chartjs-2` and `chart.js` (for admin dashboards — already chunked as `vendor-charts`); and large billing component files. Story 3.4 says "Add lazy import for `PricingPage`" but gives no guidance on whether billing dashboard components should be in a separate chunk.

**Recommendation:** Add a `vite.config.js` update story (or add to Story 5.8) specifying: (1) add `'vendor-stripe': ['@stripe/stripe-js']` to `manualChunks` if Stripe.js is loaded client-side; (2) create a `'billing'` manual chunk grouping `BillingDashboard`, `PlanManagement`, `CreditHistory`, `InvoiceHistory` — all billing components are accessed together and should share a chunk; (3) verify that the admin subscription dashboard components (`SubscriptionDashboard`, `RevenueAnalytics`) remain in the `vendor-charts` chunk or an `admin` chunk. Confirm that `PricingPage` and `PricingComparisonTable` are in the same chunk (they are always rendered together).

---

**[REQ-02-m06]** §16, Story 16.1 — **Cancellation Retention Flow Uses a 3-Step Modal with No Specification of `useReducer` or State Management**

The cancellation retention flow (§16.1) has 3 steps with: required reason selection, conditional save offers based on reason, a pause sub-flow within the modal, and a discount coupon application. This is a complex state machine inside a modal. The document says "Cancellation is a 3-step modal flow" but gives no state management guidance. Developers will reach for 3–4 `useState` calls, producing the same untestable spaghetti as the `RegisterForm` (see Critical finding C03).

**Recommendation:** Require `useReducer` for the cancellation modal state, with a documented state shape:

```javascript
{
  step: 'reason_selection' | 'save_offer' | 'confirmation',
  reason: CancellationReason | null,
  feedback: string,
  saveOfferShown: CancellationSaveOffer | null,
  saveOfferAccepted: boolean,
  isSubmitting: boolean,
  error: string | null
}
```

Add `CancellationReason` as a string union type to `src/types/billing.ts`. Add a test file for the cancellation modal reducer.

---

**[REQ-02-m07]** §12, Story 2.12 — **Email Service Is "Fire and Forget" But No Dead-Letter / Retry Queue Is Specified**

Story 2.12 specifies: "Email sending failures are logged but do not cause API request failures (fire-and-forget pattern with error logging)." For non-critical emails this is acceptable. However, the document also specifies that cancellation confirmation email is "non-negotiable — FTC requirement" and must be sent within 5 minutes. A simple fire-and-forget with no retry mechanism means a transient Postmark/SendGrid API error will silently fail to send a legally required email, with no recovery path other than manual inspection of logs.

**Recommendation:** For the legally required emails (subscription confirmed, cancellation confirmation, auto-refill charge notification), implement a durable queue pattern. At minimum: on initial send failure, write a `{ to, templateId, variables, scheduledAt, status: 'pending', retries: 0 }` document to a `email_queue/{id}` Firestore collection. Add a backend cron job (or Cloud Tasks trigger) that retries pending emails up to 3 times with exponential backoff. On third failure, set `status: 'failed'` and create a `security_events` record for admin alerting. This does not require a full message queue — Firestore + a Cloud Scheduler job is sufficient. Add Story 2.14 to Batch 2 specifying this implementation.

---

**[REQ-02-m08]** §19.4 — **`PlanConfirmationStep.jsx` California Geo-Detection Method Is Unspecified**

Section 19.4 requires appending California-specific cancellation language "for California users — geo-detected by billing address or browser locale." At the `PlanConfirmationStep` stage, the user has not yet entered billing information (that happens in Stripe Checkout). Browser locale is unreliable for legal jurisdiction detection. The specification is silent on whether to use `navigator.language`, an IP geolocation API call, or a user-selected state/country dropdown.

**Recommendation:** Specify the implementation method: use `Intl.DateTimeFormat().resolvedOptions().timeZone` to detect `America/Los_Angeles`, `America/Denver` (partial), etc., as a conservative proxy, and/or add a "State/Country" selection field to `PlanConfirmationStep` that is used both for California disclosure and for EU withdrawal waiver detection. If an IP geolocation service is used, add it to the sub-processor list in Section 11 and the Privacy Policy. If `navigator.language === 'en-US'` is used as a false-negative-safe default (show California text to all US users), state this explicitly in the requirements.

---

### Suggestions (Consider for future)

---

**[REQ-02-S01]** §6.3 — **Consider `useDeferredValue` for Credit Balance Display in High-Frequency Scenarios**

When a user performs rapid successive actions (e.g., generating 10 individual schema items in quick succession), the `onSnapshot` listener may fire 10 times in a few seconds. Each fire updates `CreditBalanceContext`, causing all subscribed credit displays to re-render rapidly. React 18's `useDeferredValue` hook is designed precisely for this case — it allows the credit display to lag behind slightly and batch visual updates rather than rendering 10 intermediate states. Consider wrapping the credit balance values in `useDeferredValue` inside `CreditUsageGauge` and `CreditBadge`.

---

**[REQ-02-S02]** §7.3 — **Consider `useTransition` for the `consumeCredits` API Call**

The `consumeCredits` call in `useCredits` initiates a network request that then triggers a Firestore `onSnapshot`. This sequence involves two asynchronous state transitions. Using React 18's `useTransition` to wrap the `consumeCredits` call would allow the UI to mark the credit balance update as a non-urgent transition, preventing it from interrupting a higher-priority user interaction (e.g., typing in a form field). The `isPending` flag from `useTransition` can drive the loading state of `CreditBadge` more elegantly than a local `isLoading` boolean.

---

**[REQ-02-S03]** §8.2 — **Admin Subscription Dashboard Could Use React 18 `use()` Hook with Suspense for Data Fetching**

The admin dashboard calls `GET /api/admin/subscriptions/summary` and `GET /api/admin/subscriptions/list`. These are straightforward GET requests with no real-time requirements. Rather than `useEffect` + `useState` loading patterns, the React 18 `use()` hook with a promise-based data fetching layer (even a minimal one) would allow the components to use `<Suspense>` for loading states — consistent with how the rest of the app handles lazy-loaded routes. This would simplify the admin dashboard components significantly.

---

**[REQ-02-S04]** §3.9 — **`usage_events` Collection Will Grow Unboundedly in Development/Staging**

The `usage_events` collection is a high-volume raw event log. In production, the data retention job keeps it bounded. But in development and staging environments, developers testing credit consumption will accumulate millions of events with no cleanup. Consider specifying a Firestore emulator-compatible `--env=dev` flag in the migration script and a dev-only cleanup utility.

---

**[REQ-02-S05]** §5.1.2 — **Pricing Card CTAs for Authenticated Users Need an Edge Case for Downgrade from Agency**

Section 5.1.2 specifies: "If user is logged in and on a lower tier: 'Upgrade to [Tier Name]'." It does not specify what to show for a user on Agency tier viewing the Basic or Client card. Presumably "Downgrade" but the label, destination, and confirmation requirements are unspecified. The existing `PlanManagement.jsx` handles this but the pricing page does not defer to it.

---

**[REQ-02-S06]** §14.2 — **No Specification for Trial Eligibility Enforcement at Registration**

Section 14.2 says "One trial per email address, one trial per payment method (enforced at conversion)." The email-address uniqueness can be enforced by Firebase Auth. The payment-method uniqueness is enforced by Stripe at the time the trial converts to paid. But there is no specification for how to prevent someone from creating a new email address to start a second trial. Consider specifying a secondary enforcement mechanism such as requiring email verification before trial credits are provisioned (the existing `EmailVerificationBanner` pattern could be leveraged) or using Stripe Radar rules to flag duplicate card fingerprints.

---

## New Requirements

---

**[NEW-01] UpgradePromptContext — Global Modal State Management**

*Addresses Critical finding REQ-02-C05 and Major finding REQ-02-M05.*

A new React context is required to manage the global state of the `UpgradePrompt` modal.

**File:** `src/contexts/UpgradePromptContext.jsx`

**Specification:**

```javascript
// Context value shape
{
  isOpen: boolean,
  promptConfig: {
    variant: 'credit' | 'feature',
    feature: string | null,        // For feature gates (e.g., 'teamManagement')
    action: string | null,         // For credit gates (e.g., 'audit_upload')
    creditsRequired: number | null,
    creditsAvailable: number | null,
    recommendedTier: TierID | null
  } | null,
  showCreditPrompt: (action: string, creditsRequired: number, creditsAvailable: number) => void,
  showFeaturePrompt: (feature: string) => void,
  closePrompt: () => void
}
```

**AC:**
- [ ] `UpgradePromptProvider` wraps `SubscriptionProvider` in `src/App.jsx`
- [ ] A single `<UpgradePrompt />` instance rendered via `ReactDOM.createPortal` in `ToolLayout.jsx`, consuming this context
- [ ] `showCreditPrompt` and `showFeaturePrompt` are stable function references (wrapped in `useCallback`)
- [ ] `useUpgradePrompt()` hook exported for use in `useCredits` and `useFeatureGate`
- [ ] Closing the modal resets `promptConfig` to null
- [ ] Test: opening the prompt from two different components in sequence shows the second prompt, not both simultaneously

---

**[NEW-02] Modal Wrapper Component**

*Addresses Minor finding REQ-02-m03.*

A shared `Modal` wrapper component is required to standardize focus management, ARIA, and scroll-lock across all new billing modals.

**File:** `src/components/shared/Modal.jsx`

**AC:**
- [ ] Props: `isOpen: boolean`, `onClose: () => void`, `title: string`, `description?: string`, `size: 'sm' | 'md' | 'lg' | 'fullscreen'`, `isDismissible?: boolean` (default `true`)
- [ ] Renders via `ReactDOM.createPortal` into `document.body`
- [ ] Implements focus trap using `focus-trap-react` (add to `package.json`)
- [ ] `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to title element, `aria-describedby` pointing to description if provided
- [ ] Escape key calls `onClose` when `isDismissible` is true; does nothing when false
- [ ] Backdrop click calls `onClose` when `isDismissible` is true
- [ ] `document.body` scroll-lock applied when open, restored when closed
- [ ] Animated entrance/exit using Tailwind CSS transitions
- [ ] Axe accessibility test required: `src/components/shared/__tests__/Modal.axe.test.jsx`
- [ ] Used by: `CreditPackModal`, `UpgradePrompt`, `CancellationRetentionModal`, `EnterpriseLeadModal`

---

**[NEW-03] RegisterForm Reducer Specification**

*Addresses Critical finding REQ-02-C03.*

**File:** `src/components/auth/registerFormReducer.js`

**Specification:**

```javascript
// State shape (all fields required)
const initialState = {
  step: 'account_details', // 'account_details' | 'nonprofit_verification' | 'plan_confirmation' | 'redirecting' | 'success' | 'canceled'
  tier: 'basic',           // TierID
  interval: 'month',       // 'month' | 'year'
  accountCreated: false,
  firebaseUid: null,
  verificationSubmitted: false,
  checkoutSessionId: null,
  error: null,
  isSubmitting: false
};

// Action types
const ACTIONS = {
  SET_TIER: 'SET_TIER',
  SET_INTERVAL: 'SET_INTERVAL',
  ACCOUNT_CREATED: 'ACCOUNT_CREATED',
  PROCEED_TO_PLAN_CONFIRMATION: 'PROCEED_TO_PLAN_CONFIRMATION',
  PROCEED_TO_NONPROFIT_VERIFICATION: 'PROCEED_TO_NONPROFIT_VERIFICATION',
  VERIFICATION_SUBMITTED: 'VERIFICATION_SUBMITTED',
  CHECKOUT_INITIATED: 'CHECKOUT_INITIATED',
  CHECKOUT_CANCELED: 'CHECKOUT_CANCELED',
  CHECKOUT_SUCCEEDED: 'CHECKOUT_SUCCEEDED',
  SET_ERROR: 'SET_ERROR',
  SET_SUBMITTING: 'SET_SUBMITTING'
};

// Valid step transitions (guard function must throw on invalid transitions):
// account_details → plan_confirmation (paid tier, account created)
// account_details → nonprofit_verification (nonprofit tier, account created)
// account_details → success (basic tier, account created)
// nonprofit_verification → plan_confirmation (verification submitted)
// plan_confirmation → redirecting (checkout session created)
// redirecting → success (URL param: subscription=success)
// redirecting → canceled (URL param: subscription=canceled)
```

**AC:**
- [ ] Reducer is a pure function with no side effects
- [ ] Invalid transitions throw a descriptive error in development, no-op in production
- [ ] 100% branch coverage required in `src/components/auth/__tests__/registerFormReducer.test.js`

---

**[NEW-04] SubscriptionContext Split Architecture**

*Addresses Critical finding REQ-02-C01.*

The `SubscriptionContext` must be implemented as three separate contexts. This new requirement replaces the single-context design in Section 6.3.

**Files:**
- `src/contexts/SubscriptionDataContext.jsx` — tier, subscription, status flags, tierConfig
- `src/contexts/CreditBalanceContext.jsx` — credits (standard + AI objects), re-renders on every `onSnapshot`
- `src/contexts/SubscriptionActionsContext.jsx` — `canUseFeature`, `hasCredits` (stable function references)

**Unified hooks for convenience:**
- `useSubscriptionData()` — reads from `SubscriptionDataContext`
- `useCreditBalance()` — reads from `CreditBalanceContext`
- `useSubscriptionActions()` — reads from `SubscriptionActionsContext`
- `useSubscription()` — reads from all three (convenience only; document that most components should use the narrow hooks)

**AC:**
- [ ] `CreditBalanceContext.Provider` value is memoized with `useMemo([credits.standard, credits.ai])`
- [ ] `SubscriptionDataContext.Provider` value is memoized with `useMemo([tier, subscriptionStatus, isPaused, isPastDue, isTrialing, trialEndsAt, tierConfig])`
- [ ] `SubscriptionActionsContext.Provider` functions wrapped in `useCallback` with documented dependency arrays
- [ ] Test: render a component consuming only `useCreditBalance()` and confirm it does not re-render when `tier` changes
- [ ] Test: render a component consuming only `useSubscriptionData()` and confirm it does not re-render when credit balance changes

---

## Modified Requirements

---

**[MOD-01]** Section 6.3 — Replace the `SubscriptionContext` value shape with the three-context split architecture defined in New Requirement [NEW-04]. Remove `consumeCredits` from the context value entirely (per Critical finding REQ-02-C02). Add `isTrialing: boolean`, `trialEndsAt: Date | null`, and `trialDaysRemaining: number | null` to `SubscriptionDataContext` (per Major finding REQ-02-M10).

**[MOD-02]** Section 6.2.4 — Replace "Add state machine for multi-step flow: `account_details` → `plan_confirmation` → `checkout` → `success`" with the reducer specification defined in New Requirement [NEW-03]. The step `checkout` should be renamed to `redirecting` to accurately reflect that this step represents an external redirect to Stripe, not an in-app screen.

**[MOD-03]** Section 6.2.3 (URL Parameters table) — Add `interval` parameter: `interval | month, year | Selects billing interval; passed through registration flow to checkout session creation`. The `tier` parameter table note should also document that `tier=nonprofit` combined with `interval=year` is not supported in v1 (nonprofit annual billing requires manual verification and cannot be automated in the current flow).

**[MOD-04]** Section 7.2 (Credit Consumption Flow) — Replace the current flow with: "User clicks action → Frontend checks `canAfford(action)` via `useSubscriptionActions()` for UX pre-check → If locally insufficient: show `UpgradePromptContext.showCreditPrompt()` immediately → If locally sufficient: call tool's backend endpoint (which internally calls `creditService.consumeCredits()` atomically before executing the tool action) → Handle 402 response (race condition: server-side insufficient credits) → Update credit display via `onSnapshot`." Remove the separate `POST /api/credits/consume` pre-flight call from the frontend flow diagram. Note: this represents a backend architecture change — see Critical finding REQ-02-C06 for full rationale.

**[MOD-05]** Section 7.4 — Change `creditPacks` row from `creditPacks: basic` (denied) to `creditPacks: []` (no tiers denied), per Section 17.1 which supersedes the original restriction. Remove the `autoRefill` restriction for Basic tier — Basic tier users who have purchased a credit pack may opt into auto-refill for that pack type, since they have demonstrated purchase intent. (This is a business decision for the Lead PM to confirm.)

**[MOD-06]** Section 10.2 (Testing Strategy) — Replace with the expanded testing requirements specified in Critical finding REQ-02-C05, including minimum coverage targets, required test files, and Firestore `onSnapshot` mocking requirements.

**[MOD-07]** Section 3.6 (`credit_packs/{packId}` schema) — Add `expiresAt: Timestamp` field inline (not just in §17.2). Add note: "Set to `purchasedAt + 365 days` by `creditService.addPackCredits()`. Must be checked in `creditService.consumeCredits()` when drawing from bonus credits."

**[MOD-08]** Section 4.4.1 (`POST /api/checkout/create-session`) — Add `interval: 'month' | 'year'` to the request body. Add error: `400: Annual billing not supported for nonprofit tier in v1`. Add `interval` to the response's subscription object.

**[MOD-09]** Section 5.2.2 (`AutoRefillSettings` component) — Replace "Warning text: 'Auto-refill will purchase up to 3 packs per month...'" with the formal authorization disclosure text specified in Section 17.3, including the required affirmative checkbox. Cross-reference Section 17.3 explicitly.

**[MOD-10]** Section 3.8 (`nonprofit_verifications/{userId}` schema) — Add inline all Wave 1 fields listed in the Modification Index: `countryCode: string | null`, `nonprofitRegistrationType: string | null` (e.g., `'501c3'`, `'501c4'`, `'international_equivalent'`), `documentRetainUntil: Timestamp | null`, `applicantAttestedAt: Timestamp | null`, `iersVerificationResult: string | null`, `reVerificationReminderSentAt: Timestamp | null`.

**[MOD-11]** Story 4.2 — Add to AC: "Token refresh retry behavior: on 401 response, call `currentUser.getIdToken(true)` and retry request once. If second 401 is received, redirect to `/login?reason=session_expired&returnTo={encodedPath}`. On network error (no response), show reconnection toast and do not redirect." Replace current partial spec with the full contract from Major finding REQ-02-M09.

**[MOD-12]** Story 1.3 AC — Add: "All function values in context value objects (`canUseFeature`, `hasCredits`, and any future additions) must be wrapped in `useCallback` with documented dependency arrays. Context value objects must be wrapped in `useMemo`. Verification: write a Vitest test that renders the provider with a stable credit balance, forces a re-render via parent state change unrelated to credits, and asserts via `Object.is()` that function references are stable across re-renders."

---

## Questions & Concerns

1. **Section 4.4.3 `POST /api/credits/consume` architecture**: As detailed in Critical finding REQ-02-C06, this endpoint being called as a pre-flight from the frontend before tool actions creates non-atomic credit deductions. Who owns the AI/tool-action execution — is it the frontend calling an external LLM directly, or a backend service? The answer fundamentally changes whether atomic credit+action is achievable. This question must be answered before Batch 2 begins.

2. **Section 6.3 `consumeCredits` in context**: Was the intent for `SubscriptionContext.consumeCredits` to be the actual network call, or a facade that calls `useCredits.consumeCredits`? The document describes it in both places as if they are independent implementations. Clarification needed before Story 1.3 begins.

3. **Section 17.3 Auto-Refill Authorization Disclosure**: The required disclosure text includes `[MAX_MONTHLY_CHARGE]` which is `packPrice × 3`. For the Mega pack this is `$200 × 3 = $600/month`. Is it a product decision to display this prominently? For some users seeing "$600/month" maximum exposure may be alarming enough to deter them from enabling auto-refill at all. Confirm with Lead PM before implementing the disclosure text.

4. **Section 13.3 — Annual price IDs in `TIER_CONFIGS`**: The sample code in §13.3 shows `process.env.STRIPE_PRICE_CLIENT_ANNUAL` inside `TIER_CONFIGS`, but `src/config/tiers.js` is a frontend file. Frontend code cannot read `process.env.STRIPE_PRICE_*` Stripe secret values — it can only read `VITE_*` prefixed env vars (Vite requirement). Are the annual price IDs intended to be `VITE_STRIPE_PRICE_*` variables (making them public), or are they only needed on the backend's `server/src/config/tiers.js`? If public, add them to the env var list in §3.11 with the `VITE_` prefix.

5. **Section 14.1 Free Trial — "No credit card required"**: The Stripe implementation uses `trial_period_days: 14` and `payment_behavior: 'default_incomplete'`. With `default_incomplete`, Stripe requires a payment method to be collected at subscription creation. `payment_behavior: 'allow_incomplete'` is the option that permits no payment method. Which is intended? The spec says "no credit card required" which implies `allow_incomplete`, but then trial conversion requires the user to enter payment separately. Stripe's trial with `allow_incomplete` requires a separate `POST /api/billing/portal-session` or a custom payment collection flow — this flow is not specified.

6. **Section 15.2 Enterprise Lead Capture — `EnterpriseLead Modal.jsx`**: The filename in §15.2 has a space in it (`EnterpriseLead Modal.jsx`). This is presumably a typo for `EnterpriseLeadModal.jsx`. Confirm and correct in Appendix B file manifest.

7. **Section 7.4 `useFeatureGate` — `autoRefill` feature gate**: The feature gate table lists `autoRefill: basic` (Basic tier cannot auto-refill). But Section 17.1 removes credit pack restrictions for Basic users, enabling them to purchase packs. Should Basic users who have purchased a pack also be eligible for auto-refill? This is a product decision with a legal implication (auto-refill on Basic users means recurring charges on an account with no subscription). Recommend restricting auto-refill to paid subscribers (any tier with `subscriptionStatus === 'active'` and `tier !== 'basic'`) regardless of pack purchase history.

8. **Section 8.7 Alerting — In-App Notifications**: The alerting table references "in-app notification" as a channel for high churn, revenue milestones, and nonprofit applications. The document does not define what an "in-app notification" is — there is no notification center, bell icon, or notification state management specified anywhere in the document. If this is a new UI feature, it needs its own stories. If it means email only, the table should say so.

9. **Section 19.3 OFAC Sanctions Screening**: The spec says "Blocked registrations/sessions return HTTP 403 with non-descriptive error (do not reveal screening logic)." The non-descriptive error is correct. However, `server/src/middleware/auth.js` is listed as a modification target for "add country screening" — but auth middleware runs on every authenticated request, which would mean OFAC screening runs on every API call for every user. This is architecturally wrong (screening should run at registration and checkout, not on each request). Clarify the implementation scope: OFAC screening should be a one-time check at `POST /api/checkout/create-session` and `POST /api/nonprofit/submit-verification`, not middleware on all routes.

10. **Section 18.1 `tos_acceptances` — Immutability via Firestore Rules**: The document specifies "No updates or deletes permitted for any party (including Admin SDK)." Firestore security rules cannot restrict the Firebase Admin SDK — the Admin SDK bypasses all security rules by design. To achieve true immutability of this collection in Firebase, you must use a Firestore trigger (Cloud Function) that monitors for update/delete operations and reverts them, or accept that immutability is enforced at the application layer only (the backend never calls update/delete on this collection). Which enforcement mechanism is intended? This needs clarification before `firestore.rules` is written, as the rules file cannot achieve the stated goal for Admin SDK writes.

---

## Approval Status

**Needs Revision**

This document cannot be handed to the development team for implementation without resolving the six Critical findings. The most consequential issues are the `SubscriptionContext` re-render architecture (C01), the ambiguous `consumeCredits` ownership that will create race conditions in financial-critical code (C02 and C06), the under-specified `RegisterForm` state machine that will produce five different ad-hoc implementations (C03), and the four-sentence testing strategy for a 55-file, payment-system implementation (C05).

The document is fundamentally sound in its business logic, tier definitions, API contracts, and legal compliance thinking. The Wave 1 legal layer is genuinely impressive for a v1 spec and reflects mature product thinking. The batch delivery structure is well-conceived and the dependency graph in Appendix A is correct. These are the foundations of a good implementation document.

The required revisions are architectural and specification-level — not business logic changes. The author should action the New Requirements ([NEW-01] through [NEW-04]) and Modified Requirements ([MOD-01] through [MOD-12]) in a v1.1 revision. The ten Questions & Concerns in the section above should be answered inline in the document before revision is circulated for re-review. Once Critical findings are resolved and a majority of Major findings are addressed, this document can be re-submitted for Conditional Approval targeting a 3-business-day turnaround.