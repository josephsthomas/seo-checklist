# Sr. Design System Engineer — Requirements Review
**Reviewer:** Sr. Design System Engineer
**Document:** pricing-payments-requirements.md
**Date:** 2026-02-22
**Status:** Complete

---

## Executive Summary

This requirements document is impressively comprehensive in its business logic, backend API design, data modeling, and legal compliance coverage. Sections 11–19 in particular show evidence of serious multi-disciplinary review (legal counsel, lead PM, head legal counsel). The batch-based implementation strategy is pragmatic and the dependency graph is sound. From a design-system engineering perspective, however, the document contains significant gaps that will cause friction at implementation time and create accessibility, consistency, and maintainability debt.

The most critical deficiencies are in the design-token and component-specification layers. The document references an existing "color system" (`primary`, `charcoal`, `emerald`) and instructs implementers to match existing design language, but it never enumerates which specific tokens apply to billing concepts, how existing tokens should be extended for the billing domain, or what new tokens are required. The `CreditUsageGauge` component, which is central to the credit visibility user experience, has no ARIA specification, no token mapping for its three semantic color states, and no responsive behavior defined. Similarly, the multi-step cancellation modal (Section 16) and the multi-step registration flow (Section 6) have no focus-management requirements, no keyboard interaction patterns, and no ARIA role specifications.

A secondary but important class of gaps involves Storybook documentation requirements (absent entirely), animation and motion tokens (mentioned nowhere), and the lack of responsive breakpoint specifications for every new billing component. The document also contains a naming inconsistency between the file manifest (`EnterpriseLead Modal.jsx` with a space in the filename, line 3419) and the rest of the naming conventions. Without these design-system requirements being specified, the implementation team will make divergent decisions across seven batches and fifteen-plus components, resulting in an incoherent billing UI that will require expensive retroactive refactoring. This document is recommended for revision before implementation begins, with the critical and major findings addressed as a prerequisite.

---

## Sections Reviewed

| Section | Title | Focus Level |
|---------|-------|-------------|
| 1 | Overview & Goals | Light |
| 2 | Tier Definitions & Credit System | Medium |
| 3 | Data Models & Firestore Schemas | Light |
| 4 | Backend API Specifications | Light |
| 5 | Frontend Components | Deep |
| 6 | Registration Flow Updates | Deep |
| 7 | Usage Enforcement & Gating | Deep |
| 8 | Admin Features & Observability | Medium |
| 9 | User Stories by Batch | Deep |
| 10 | Implementation Notes & Conventions | Medium |
| 11 | Legal & Compliance Requirements | Light |
| 12 | Transactional Email System | Light |
| 13 | Annual Pricing & Billing Intervals | Medium |
| 14 | Free Trial Strategy | Medium |
| 15 | Enterprise Tier — Lead Capture | Medium |
| 16 | Cancellation Retention Flow | Deep |
| 17 | Credit System — Amended Policies | Medium |
| 18 | Compliance Data Models | Light |
| 19 | New API Endpoints — Wave 1 | Light |
| Appendix A | Batch Dependency Graph | Light |
| Appendix B | File Manifest | Medium |

---

## Findings

### Critical (Must fix before implementation)

---

**[REQ-07-C01]** Section 5.2.2 — **`CreditUsageGauge` Has No Accessibility Specification**

The `CreditUsageGauge` is described as "Visual progress bars for standard and AI credits" with color coding (green/yellow/red) but has zero ARIA specification. A progress bar conveying remaining credits is a critical functional element that communicates account state. Color alone as the sole differentiator between states violates WCAG 2.2 Success Criterion 1.4.1 (Use of Color). Users who are blind, color-blind, or using high-contrast mode have no accessible equivalent.

Furthermore, a custom visual gauge rendered with `<div>` elements and Tailwind width classes (the implied implementation approach) will have no semantic meaning to assistive technologies unless ARIA attributes are explicitly specified.

**Recommendation:** Add a complete ARIA specification to Section 5.2.2:

```
CreditUsageGauge — ARIA Requirements
- Root element: role="group" with aria-label="Credit usage"
- Each gauge track: role="progressbar"
  - aria-label: "Standard credits" or "AI credits"
  - aria-valuenow: {remaining}
  - aria-valuemin: 0
  - aria-valuemax: {monthly + bonus}
  - aria-valuetext: "{remaining} of {total} credits remaining. Resets {date}."
- Color state must be accompanied by a visible text label or icon with aria-label
  (e.g., a warning icon with aria-label="Low credits warning" when <25% remaining)
- The numeric text values ("350/500") must remain visible at all times — not just on hover
- Do not use placeholder or tooltip-only text for the reset date
```

Specify that the component must pass axe-core rule `aria-progressbar-name` and that color changes must be supplemented by an icon change (e.g., a warning or danger icon from `lucide-react`) so that state is communicated through at least two channels.

---

**[REQ-07-C02]** Section 16.1 — **Multi-Step Cancellation Modal Has No Focus Management Specification**

Section 16 defines a 3-step retention modal flow (reason selection → contextual save offer → confirmation). This is the most complex modal interaction in the entire billing system. The document has no focus management requirements, no keyboard interaction pattern, no ARIA role assignment, and no escape-key behavior specification.

A multi-step modal without defined focus management will, in practice, leave focus stranded in the background document when the modal opens (violating WCAG 2.2 SC 2.4.3 Focus Order), allow Tab to escape the modal boundary (violating SC 2.1.2 No Keyboard Trap in a problematic way — focus leaking is as harmful as a true trap), and lose context when transitioning between steps (focus jumping unexpectedly).

**Recommendation:** Add a dedicated subsection to Section 16.2 (or create Section 16.3) with the following requirements:

```
16.3 — CancellationRetentionModal Accessibility Requirements

Focus management:
- On modal open: focus moves to the modal's first interactive element (the first
  reason radio button in Step 1)
- Focus is trapped within the modal boundary for all 3 steps
  (use FocusTrap from @radix-ui/react-focus-scope or equivalent)
- On step transition: focus moves to the new step's heading (h2 or h3 with tabIndex="-1")
- On modal close (any path): focus returns to the element that triggered the modal
  (the Cancel button in BillingDashboard's CurrentPlanCard)
- Pressing Escape at any step closes the modal (equivalent to clicking the X or
  "Keep my plan" button at that step)

ARIA pattern:
- role="dialog" on the modal root
- aria-modal="true"
- aria-labelledby pointing to the step heading (dynamically updated per step)
- aria-describedby pointing to step description text

Step indicator:
- aria-label="Cancellation step {n} of 3" on the step indicator
- Do not rely solely on visual dot/line indicators

Keyboard interaction:
- Step 1: Arrow keys navigate radio button group for reason selection
- Step 2: Tab navigates save offer CTAs; offer card highlights must meet 3:1 contrast
  ratio for keyboard focus indicator (WCAG 2.2 SC 2.4.11)
- Step 3: Standard button tab order
```

---

**[REQ-07-C03]** Section 5 (entire) and Section 9 (Batch 3, 5, 6) — **No Design Token Specification for Billing Domain**

The document instructs implementers to "use existing color system: `primary`, `charcoal`, `emerald`, `cyan`, `amber`, `rose`, `violet`" (Section 10.1) but never specifies which of these tokens should be used for billing-specific semantic states. This creates a critical ambiguity: the billing system introduces several semantic color concepts that do not exist elsewhere in the application — credit health states (healthy/warning/critical), subscription status (active/past_due/paused/canceled/trialing), tier identity colors (for the 5+1 tier cards), and billing-specific alert levels.

Without token assignments, five different developers implementing seven different billing components across seven batches will make independent decisions. The result will be an incoherent color system where the "amber" used for `past_due` in `SubscriptionBanner` differs from the "yellow" used in `CreditUsageGauge`'s warning state, which differs from the yellow used in `InvoiceHistory`'s "Open" status badge — all from the same Tailwind `amber` palette but at inconsistent shade levels.

**Recommendation:** Add a new Section 5.0 "Billing Component Design Tokens" that defines:

```
5.0 Billing Design Token Assignments (Tailwind CSS)

Credit Health States (for CreditUsageGauge, CreditBadge, CreditHistory):
  Healthy  (>50% remaining):  bg-emerald-500, text-emerald-700 (dark: text-emerald-300)
  Warning  (25-50%):          bg-amber-500,   text-amber-700   (dark: text-amber-300)
  Critical (<25%):            bg-rose-500,    text-rose-700    (dark: text-rose-300)

Subscription Status States (for SubscriptionBanner, TierBadge, CurrentPlanCard):
  active:    bg-emerald-50 border-emerald-200 text-emerald-800
  trialing:  bg-cyan-50    border-cyan-200    text-cyan-800
  past_due:  bg-rose-50    border-rose-200    text-rose-800
  paused:    bg-blue-50    border-blue-200    text-blue-800
  canceled:  bg-amber-50   border-amber-200   text-amber-800
  incomplete:bg-rose-50    border-rose-200    text-rose-800

Invoice Status (for InvoiceHistory):
  paid:      text-emerald-700 bg-emerald-50
  open:      text-amber-700   bg-amber-50
  void:      text-charcoal-400 bg-charcoal-50

Tier Identity Colors (for TierBadge, pricing cards, comparison table headers):
  basic:     bg-gray-100      text-gray-700
  client:    bg-primary-50    text-primary-700
  freelance: bg-primary-600   text-white        (elevated card: ring-2 ring-primary-600)
  agency:    bg-charcoal-800  text-white
  nonprofit: bg-emerald-50    text-emerald-700

Dark-mode token pairs must be defined for every state above.
```

This section should be listed as a prerequisite for Batch 3, 5, and 6 implementation.

---

**[REQ-07-C04]** Section 6.2 and Story 4.1, 4.2 — **Multi-Step Registration Flow Lacks Focus and Keyboard Specification**

The multi-step registration flow (`account_details` → `plan_confirmation` → `checkout`) is specified in terms of state transitions and business logic but has no focus management requirements. When the form transitions from Step 1 to Step 2, the implementation question of "where does focus go?" is unanswered. For users navigating by keyboard or using a screen reader, an unspecified step transition will typically result in focus remaining on the last element of the previous step — which is either gone from the DOM or visually disconnected from the new content — creating a disorienting experience.

The step indicator mentioned in Story 4.1 ("Step indicator showing current step 1/2 or 1/3") has no ARIA specification either: it must communicate progress to screen readers but should not receive interactive focus.

**Recommendation:** Add focus management requirements to Section 6.2.4 and Story 4.1:

```
Focus Management — Registration Multi-Step Flow:
- On step transition: call .focus() on the new step's heading element
  (heading must have tabIndex="-1" to be programmatically focusable without appearing
  in the natural tab order)
- Step heading must be announced by screen readers on transition — use a visually
  hidden h2 if the step's visual design does not include a prominent heading
- Step indicator (e.g., "Step 1 of 2"): render as <nav aria-label="Registration progress">
  with a <ol> list; current step marked with aria-current="step"
- The Google OAuth "Sign in with Google" button must be keyboard reachable and labeled
  with aria-label="Sign in with Google to continue" (not just "Google")
- PlanConfirmationStep.jsx: "Confirm & Pay" button must have aria-describedby pointing
  to the disclosure text block (per Section 19.4), not just be next to it visually
```

---

**[REQ-07-C05]** Section 5.1.3 — **Feature Comparison Table Has Insufficient Accessibility Specification**

The `PricingComparisonTable` is described as a "full-width responsive table" with "checkmarks, X marks, and specific values" and the instruction to "use checkmarks, X marks, and specific values." Icons used as data in a table are a well-known accessibility failure pattern. If a developer renders a checkmark icon (`<Check />` from lucide-react) without a text alternative, screen readers will announce nothing or announce the SVG element's title attribute (if present), which varies by implementation.

Story 3.2's AC says "Accessible: proper `<table>` semantics, `scope` attributes, `aria-label` on icons" — which is a step in the right direction — but is insufficient. `aria-label` on an icon does not address whether the icon has `role="img"`, whether the surrounding `<td>` has a meaningful accessible name when the icon is the only content, or how the "collapsible category" rows communicate their expanded/collapsed state.

**Recommendation:** Expand Story 3.2's AC with explicit requirements:

```
PricingComparisonTable Accessibility Requirements:

Table structure:
- Use <table> with <caption> containing the table's purpose
- Tier column headers: <th scope="col"> with tier name
- Feature row headers: <th scope="row"> with feature name
- Category grouping rows: use <th scope="rowgroup" colspan="6"> or equivalent;
  mark as collapsible with aria-expanded attribute

Icon-as-data requirements:
- Checkmark (feature included): <span role="img" aria-label="Included">✓</span>
  — OR — <Check aria-hidden="true" /> + visually-hidden <span>Included</span>
- X mark (feature excluded): <span role="img" aria-label="Not included">✗</span>
- Do NOT use title attribute alone on SVG — screen reader support is inconsistent

Collapsible category rows:
- Category header row contains a <button> with aria-expanded="true|false"
  and aria-controls="{rowgroupId}"
- The controlled rows have id="{rowgroupId}" and role="rowgroup"
- Keyboard: Enter/Space toggles the collapse

Horizontal scroll:
- Scroll container has role="region" and aria-label="Feature comparison table, scrollable"
- tabIndex="0" on the scroll container so keyboard users can scroll it
- Sticky first column must maintain visible focus outline when column header receives focus
```

---

**[REQ-07-C06]** Section 5.2.2 and Story 5.2 — **`CreditPackPurchaseModal` Focus Trap Not Fully Specified**

Story 5.2 states "Accessible: focus trap, escape to close, proper ARIA attributes" but does not specify which ARIA attributes, what the modal's accessible name should be, or what "proper" means. This creates implementation ambiguity that is compounded by the fact that this modal is closely related to the UpgradePrompt modal (Section 5.8) and the cancellation modal (Section 16). If each developer independently decides what "proper ARIA" means, the three modals will have inconsistent patterns, creating inconsistent screen reader announcements.

**Recommendation:** Define a reusable modal ARIA specification that applies to ALL billing modals (`CreditPackModal`, `UpgradePrompt`, `CancellationRetentionModal`) and reference it from each story:

```
5.0.1 — Standard Billing Modal Pattern

All billing modals must use the following pattern:
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="{modalId}-title"
    aria-describedby="{modalId}-description"
  >
    <h2 id="{modalId}-title">{Modal Title}</h2>
    <p id="{modalId}-description">{Brief description of modal purpose}</p>
    ...modal body...
    <button aria-label="Close modal">×</button>
  </div>

- Focus trapped within dialog boundary (use @radix-ui/react-focus-scope or
  focus-trap-react — not hand-rolled)
- Escape key: closes and returns focus to trigger element
- Backdrop click: closes (optional) with same focus return behavior
- On open: focus moves to the first interactive element or the dialog heading
- On close: focus returns to the element that opened the modal
- Screen reader announcement: browser announces dialog role + labelledby title automatically;
  do not add additional aria-live regions for the title
```

---

### Major (Should fix before implementation)

---

**[REQ-07-M01]** Entire Document — **No Storybook Documentation Requirements**

The document creates approximately 25 new React components across Batches 3–7. There is no mention of Storybook at any point in the document. For a design system engineer, Storybook is the primary contract between design and engineering: it is where component variants, states, prop APIs, and edge cases are documented and verified in isolation.

The absence of Storybook requirements means that:
1. Billing component states (e.g., `CreditUsageGauge` at 0%, 25%, 50%, 75%, 100%) will never be systematically tested or reviewed by design before shipping.
2. The `UpgradePrompt` component's `modal` vs `banner` variants will not be documented or visually diffed.
3. The `TierBadge` and `CreditBadge` components, which appear throughout the app, have no design reference for implementers working on Batch 6 integration.

**Recommendation:** Add a Section 10.7 "Storybook Requirements" and add Storybook story creation as an acceptance criterion to every new shared component story:

```
10.7 Storybook Documentation Requirements

All new shared components (CreditBadge, UpgradePrompt, TierBadge, SubscriptionBanner,
CreditUsageGauge, PricingCard, CreditPackModal) must have Storybook stories covering:
  - Every discrete visual state (not just "default")
  - Each prop variation
  - Dark mode variant (using Storybook's theme decorator)
  - Keyboard interaction demonstration in the notes
  - Accessibility addon: a11y must be configured and pass for all stories

Story file locations: src/components/[domain]/__stories__/[ComponentName].stories.jsx

Required stories per component:
  CreditBadge.stories.jsx:
    - Default (affordable state, standard credit)
    - AI credit variant
    - Warning state (user cannot afford)
    - Small and medium size variants

  CreditUsageGauge.stories.jsx:
    - Healthy state (75% remaining)
    - Warning state (40% remaining)
    - Critical state (15% remaining)
    - Empty (0% remaining)
    - Full (100% — first day of billing period)
    - With bonus credits (bonus + monthly displayed)
    - Loading skeleton state

  UpgradePrompt.stories.jsx:
    - Modal variant, credit gate (insufficient credits)
    - Modal variant, feature gate (tier restriction)
    - Banner variant
    - Basic user seeing Agency feature gate
    - Freelance user seeing Agency feature gate

  TierBadge.stories.jsx: One story per tier (5 stories)

  SubscriptionBanner.stories.jsx: One story per subscription status (6 stories)
```

---

**[REQ-07-M02]** Section 5.1.2, Section 5.2.2, Story 3.1, Story 5.1 — **No Responsive Breakpoint Specifications for Billing Components**

The document describes layouts at a high level ("1 col mobile, 2 col tablet, 5 col desktop") for the pricing page cards but provides no breakpoint specifications for any other billing component. The `BillingDashboard`, `CreditHistory`, `InvoiceHistory`, `PlanManagement`, and `SubscriptionDashboard` (admin) components have no responsive behavior defined at all.

The `BillingDashboard` layout ASCII art (Section 5.2.1) shows a two-column credit gauge layout ("┌──────────────────┐  ┌──────────────────┐") but gives no instruction on what happens to this layout on mobile (375–430px viewport), tablet (768–1024px), or on a 1280px authenticated app canvas where the sidebar consumes 240–280px of horizontal space.

The `PricingComparisonTable` says "horizontal scroll on mobile with sticky first column" but gives no breakpoint at which the scroll behavior activates.

**Recommendation:** Add responsive behavior specifications to each component section. At minimum:

```
5.0.2 — Billing Component Responsive Breakpoints

Reference breakpoints (align with existing Tailwind config):
  sm:  640px   (large phones, landscape)
  md:  768px   (tablets)
  lg:  1024px  (small laptops, authenticated app at full width)
  xl:  1280px  (standard desktop)

PricingPage — Tier Cards Grid:
  Mobile (<640px): 1 column, each card full width, stacked
  Tablet (640–1023px): 2 columns, Nonprofit card spans full width at bottom
    OR 2 columns with Freelance card spanning full width to emphasize it
  Desktop (1024–1279px): 3 columns (Basic, Client, Freelance top row; Agency, Nonprofit bottom)
  Wide (≥1280px): 5 columns as shown in Section 5.1.1 wireframe

BillingDashboard — Credit Gauges:
  Mobile: stack Standard and AI gauges vertically, full width
  Tablet+: side-by-side as in Section 5.2.1 wireframe

BillingDashboard — Quick Actions:
  Mobile: stack buttons vertically
  Tablet+: horizontal row

InvoiceHistory / CreditHistory Tables:
  Mobile (<768px): horizontal scroll; minimum column set visible without scroll:
    [Date] [Amount] [Status] [Actions] — other columns hidden or in expandable row
  Tablet+: full table visible

PricingComparisonTable:
  The scroll container activates at <1024px (before the authenticated sidebar is present)
  Sticky first column width: 160px on mobile, 200px on tablet+
```

---

**[REQ-07-M03]** Section 5.8, Story 6.3 — **`UpgradePrompt` Component Lacks Variant Specification Depth**

The `UpgradePrompt` component is central to the entire soft-gate UX strategy (Section 7.6). It is described as having a "Modal variant" and a "Banner variant" with the note that it shows "current plan, recommended upgrade, and benefits." However, the specification is insufficient for a developer to implement a consistent component:

1. The `feature` prop accepts a feature name string (e.g., `"teamManagement"`) but there is no defined mapping from feature names to user-visible labels. A developer will either hardcode strings or create an inconsistent mapping.
2. The `action` prop accepts an action name string (e.g., `"audit_upload"`) for credit-gate scenarios, but there is no spec for how the credit-specific context (how many credits are needed vs available) is passed — the component presumably needs these values to render "You need 5 credits. You have 2."
3. There is no specification for what the "Buy Credits" button does: does it open `CreditPackModal` inline, or navigate to the billing page? This is a significant UX decision with no guidance.
4. The banner variant has no defined dismissal behavior — is dismissal persisted to prevent re-showing on the next page load? Is there a per-session or per-day suppression?

**Recommendation:** Expand Story 6.3's UpgradePrompt specification:

```
UpgradePrompt Component — Full Specification

Props:
  variant: 'modal' | 'banner'
  trigger: 'credit_gate' | 'feature_gate'
  feature?: string  // feature name from useFeatureGate (for feature_gate trigger)
  action?: string   // action name from CREDIT_COSTS (for credit_gate trigger)
  creditsRequired?: number  // for credit_gate: credits needed for the blocked action
  creditsAvailable?: number // for credit_gate: current balance

Credit gate content:
  Title: "Not enough {creditType} credits"
  Body: "This action requires {creditsRequired} {creditType} credits. You have
         {creditsAvailable} remaining this period."
  Primary CTA: "Buy Credit Pack" — opens CreditPackModal (rendered inline as a nested modal;
               do not navigate away — user loses their current context)
  Secondary CTA: "Upgrade Plan" — navigates to /app/billing/plans
  Tertiary CTA: "Dismiss" (modal) or ✕ (banner)

Feature gate content:
  Title: "{featureLabel} requires {tierName}"
  Body: "Your current plan ({currentTierName}) does not include {featureLabel}.
         Upgrade to {minimumTierName} to unlock:"
  Benefit list: up to 3 bulleted benefits from TIER_CONFIGS[minimumTier]
  Primary CTA: "Upgrade to {tierName}" — navigates to /app/billing/plans?recommended={tier}
  Secondary CTA: "Maybe Later"

Banner dismissal:
  - Dismiss is stored in sessionStorage (key: 'dismissed_upgrade_banners')
    to prevent re-show in the same browser session for the same action/feature
  - Not persisted to Firestore (not worth the write cost)
  - Non-dismissable states: past_due and incomplete SubscriptionBanners (separate component)
```

---

**[REQ-07-M04]** Section 9, Batch 6, Story 6.4 — **Credit Gating Integration Pattern Is Missing Error State Specification**

Story 6.4 defines the integration pattern for adding credit gating to 15+ existing tool components. The pattern is: import `useCredits`, add `CreditBadge`, wrap action handler with `canAfford` → `consumeCredits`. However, the pattern has a critical gap: what happens between `consumeCredits` being called and the API responding? The user has clicked a button, the frontend's local credit check passed (`canAfford` returned true), the API call is in flight — what does the UI show?

The requirement "Do NOT break existing functionality" (Story 6.4 AC) is too vague to implement correctly. If an existing component has its own loading state (e.g., `AuditUploadScreen` has an upload progress bar), the credit consumption call should be seamlessly integrated into the existing loading UX, not create a separate loading flicker. But the spec gives no guidance on this.

Additionally, the race condition case is acknowledged in Section 7.3 (`consumeCredits` returning false when credits were consumed between local check and API confirmation) but the fallback UX is not specified. "Handle insufficient credits" is not an AC — it is a gesture toward an AC.

**Recommendation:** Add an error state specification to Story 6.4 and Section 7.3:

```
7.3.1 — Credit Consumption UI State Machine

For each gated action button, the wrapping handler must implement:

State 1: Idle (canAfford = true)
  - Button: enabled, normal appearance
  - CreditBadge: visible showing credit cost

State 2: Insufficient credits (canAfford = false, before click)
  - Button: visually disabled (opacity-50, cursor-not-allowed)
    BUT: not aria-disabled="true" — use a click handler that shows UpgradePrompt instead
    (WCAG 2.2: disabled buttons cannot receive focus or be announced by screen readers,
    but gated features should still be discoverable)
  - CreditBadge: rendered in critical/red color

State 3: Consuming (after click, API call in flight)
  - Button: aria-busy="true", spinner shown (replace button text with spinner + "Processing...")
  - Do NOT double-lock the button with both disabled and aria-busy — aria-busy alone suffices
  - Integrate with existing component loading state if one exists:
    For AuditUploadScreen: credit consume API call precedes the upload; show "Checking credits..."
    text in the existing progress indicator, then transition to "Uploading..." on success

State 4: Race condition failure (consumeCredits returns 402 after canAfford returned true)
  - Do NOT show a full UpgradePrompt modal — the user intended to perform the action
  - Show an inline toast notification:
    "Your credit balance changed. You now have {creditsAvailable} credits remaining.
     [Buy Credit Pack]"
  - Use react-hot-toast (already a dependency) for this toast
  - The CTA in the toast opens CreditPackModal

State 5: Non-credit API failure (500, network error)
  - Show existing error handling pattern (defer to tool component's existing error state)
  - Do NOT re-try the credit consumption — credits may have been partially consumed
  - Log the inconsistency for manual reconciliation
```

---

**[REQ-07-M05]** Section 10.1 and Appendix B — **`EnterpriseLead Modal.jsx` — Invalid Filename (Space in Filename)**

Line 3419 of the document specifies:
```
- Create: `src/components/public/EnterpriseLead Modal.jsx`
```

There is a space in the filename between "EnterpriseLead" and "Modal". This will cause a module import error in any case-sensitive filesystem (Linux in production, which is the stated OS). The Vite bundler and Node.js module resolution will treat `EnterpriseLead Modal.jsx` as an invalid module path.

**Recommendation:** Change to `src/components/public/EnterpriseLeadModal.jsx` (camelCase, no space). Audit all other file paths in Section 19 and Appendix B for similar typographic errors. The file manifest in Appendix B does not list `EnterpriseLeadModal.jsx` at all — it should be added.

---

**[REQ-07-M06]** Section 13.4, Story 13.1 — **Annual/Monthly Toggle Accessibility Not Specified**

The annual/monthly pricing toggle ("Monthly | Annual (Save 17%)") is a custom binary toggle that switches the entire pricing card display. This pattern is commonly implemented as a `<div>` with click handlers — which is inaccessible. The spec gives no ARIA guidance.

A custom toggle that switches between two modes and affects sibling content (tier cards) must be implemented as a `role="switch"` or as a pair of radio buttons. It must be keyboard-operable and must communicate its state to screen readers. Additionally, the spec says "annual option is not the default" but gives no guidance on the keyboard-reachable announcement when the toggle changes (the pricing cards change dynamically, which means an `aria-live` region is needed to announce the mode change to non-sighted users).

**Recommendation:** Add to Story 13.1 AC:

```
Billing interval toggle ARIA requirements:
- Implement as two <button> elements with role="radio" inside a role="radiogroup",
  OR as a native <input type="radio"> pair styled to look like a toggle
- aria-label="Billing interval"
- Monthly button: aria-checked="true" by default
- Annual button: aria-checked="false" by default, aria-label="Annual billing, save 17%"
- On toggle: update aria-checked states AND announce mode change:
  <span role="status" aria-live="polite" class="sr-only">
    Showing {Monthly|Annual} pricing
  </span>
- The "Save 17%" label must be visible text, not a tooltip or title attribute
- Keyboard: Arrow keys switch between radio options (standard radio group pattern)
```

---

**[REQ-07-M07]** Section 7.6 and Story 6.3 — **`CreditBadge` Icon Semantic Meaning Is Undefined**

Section 7.6 states that `CreditBadge` should show "a coin icon" next to credit costs. Section 5.8 confirms "Small inline badge: '5 credits' or '3 AI credits' with coin icon." However:

1. Lucide-react does not have a "coin" icon. The closest candidates are `Coins`, `CircleDollarSign`, `Gem`, or `Zap` — each carrying different semantic meaning. Choosing `Zap` for AI credits and `Coins` for standard credits would create a meaningful visual distinction. The spec gives no guidance.
2. When a CreditBadge appears in a red/warning state (user cannot afford), the same coin icon takes on a different meaning — now it signals a problem, not just a cost. There is no spec for whether the icon should change in warning states.
3. When `CreditBadge` is used inside a button (e.g., "Upload Audit [5 credits]"), the icon inside the button may create confusing screen reader output if not handled correctly.

**Recommendation:** Add to Section 5.8's CreditBadge specification:

```
CreditBadge — Icon Specification
- Standard credits icon: lucide-react <Coins /> (consistent with general credit concept)
- AI credits icon: lucide-react <Sparkles /> (distinct from standard, signals AI-powered)
- Both icons: aria-hidden="true" — the text label ("5 credits" / "3 AI credits") is sufficient
- In warning state (user cannot afford): add lucide-react <AlertCircle /> with
  aria-label="Insufficient credits" prepended to the badge; the coin/sparkle icon remains
  (two icons: [!] [coin] "5 credits required, 2 remaining")
- When CreditBadge is a child of a <button>: the button's aria-label should incorporate
  the credit cost: aria-label="Upload audit (requires 5 standard credits)"
  This is preferable to having the badge's text read out separately mid-button
```

---

**[REQ-07-M08]** Section 5.1.2 — **Pricing Card "Most Popular" Badge Is a Decorative or Semantic Element With No ARIA**

The Freelance card has a "Most Popular" badge and the Nonprofit card has a "50% off" badge. These badges communicate important information that influences purchase decisions. If implemented as absolutely-positioned decorative `<div>` overlays (common Tailwind pattern), screen readers reading through the cards may encounter the badge text mid-card content in an unexpected position, or miss it entirely.

Similarly, the "Current Plan" state for the authenticated user's active tier has no ARIA specification. When a pricing card's CTA button becomes "Current Plan" (disabled), the fact that this card represents the user's active plan should be communicated to screen readers at the card level, not just via the button text.

**Recommendation:** Add to Section 5.1.2 and Story 3.1:

```
Pricing Card Accessibility:
- Card container: role="article" with aria-label="{tierName} plan, {price}/month"
- "Most Popular" badge: render as visually-positioned text, NOT as a pseudo-element.
  Include in the card's aria-label: aria-label="Freelance plan, $149/month, most popular"
- "50% off" badge: similarly include in aria-label:
  aria-label="Nonprofit plan, $49/month, 50% discount for verified nonprofits"
- "Current Plan" state: add aria-label="Freelance — your current plan" to the card;
  the CTA button: aria-label="Current plan: Freelance" aria-disabled="true"
  (use aria-disabled rather than disabled so the button remains in the tab order and
  is announced — users with screen readers need to know this card IS their current plan)
- "Upgrade" CTA button: aria-label="Upgrade to {tierName} for {price}/month"
```

---

### Minor (Fix during implementation)

---

**[REQ-07-m01]** Section 6.4 and Story 1.3 — **`SubscriptionContext` `consumeCredits` Function Name Conflicts With Hook**

Section 6.3 defines `SubscriptionContext` as providing `consumeCredits: (action, creditType, amount, toolName, resourceId) => Promise<result>`. Section 7.3 defines the `useCredits` hook as providing `consumeCredits: (action: string, toolName: string, resourceId?: string) => Promise`. These two `consumeCredits` functions have different signatures — the context version takes explicit `creditType` and `amount` parameters, while the hook version looks these up from `CREDIT_COSTS` using the action key.

Developers will encounter this inconsistency when reading the two sections together: which signature do they use? The hook wraps the context, so both exist in the runtime, but the inconsistency suggests the specifications were not reviewed together.

**Recommendation:** Clarify in Section 7.3 that the `useCredits` hook's `consumeCredits` is the public API for all components (preferred) and that the raw `consumeCredits` on `SubscriptionContext` is an internal implementation detail not intended to be called directly by tool components. Add a note: "Tool components must use `useCredits().consumeCredits` — not the raw context method — to ensure consistent credit cost lookup from `CREDIT_COSTS`."

---

**[REQ-07-m02]** Section 14.1 and Story 14.1 — **Trial Banner Competes With `SubscriptionBanner` Specification**

Section 14.2 and Story 14.1 describe a trial banner: "Your 14-day Freelance trial is active. Add a payment method to continue after [date]." Section 7.10 also specifies that `subscriptionStatus: 'trialing'` shows "Trial banner with end date." The implementation of this banner references `SubscriptionBanner.jsx` (Story 6.3) but the trial banner content is different enough (countdown in days, CTA to add payment method) that it is unclear whether it is the same component or a separate element.

Story 6.3 lists six states for `SubscriptionBanner` but does not include the trial countdown content. Story 14.1 specifies a trial banner but does not reference `SubscriptionBanner`.

**Recommendation:** Explicitly state in Story 14.1 that the trial banner is a state of `SubscriptionBanner.jsx`: "The trialing state of `SubscriptionBanner` must show: trial days remaining (integer, computed from `trialEndDate - today`), the tier name, and a 'Add payment method' CTA that opens the Stripe Customer Portal URL." Add this state to the Storybook requirement in Section 10.7.

---

**[REQ-07-m03]** Section 5.2.2 — **`AutoRefillSettings` Toggle Switch Has No ARIA Pattern Specified**

The `AutoRefillSettings` component uses a "Toggle switch to enable/disable auto-refill." Toggle switches are a notoriously problematic accessibility pattern. A `<div>` styled as a switch with a click handler is inaccessible. The spec does not mention ARIA for this control.

**Recommendation:** Add to Story 5.6 (and the enhanced Story 17.3 AC): "The enable/disable toggle must use `role='switch'` with `aria-checked='true|false'` and `aria-label='Enable auto-refill'`. Alternatively use a native `<input type='checkbox'>` styled as a toggle. The authorization disclosure checkbox (Section 17.3) must be a native `<input type='checkbox'>` — not a custom component — to guarantee accessibility."

---

**[REQ-07-m04]** Section 8.2 and Story 7.1 — **Admin Dashboard Charts Have No Accessibility Specification**

Section 8.2 specifies MRR trend lines, stacked bar charts, and pie charts using `chart.js` / `react-chartjs-2`. These libraries produce `<canvas>` elements which are not inherently accessible. Screen readers cannot read canvas content.

**Recommendation:** Add to Story 7.1 AC: "Each chart must have an accessible text alternative: (1) `aria-label` on the `<canvas>` element describing the chart type and data range (e.g., 'Line chart showing MRR over the last 30 days'), (2) a visually-hidden data table below each chart containing the chart's data in tabular form (can be implemented as a `<details>` element with `<summary>View data table</summary>`), and (3) the Chart.js `plugins.accessibility` plugin or equivalent must be configured."

---

**[REQ-07-m05]** Section 19.4 — **Pre-Checkout Disclosure Font Size Specification Is Insufficient**

Section 19.4 states "Font size: minimum 12px, not greyed out." In Tailwind CSS, `text-xs` is 12px (0.75rem). However, "not greyed out" is not a Tailwind class — it is a vague instruction. An implementer could use `text-gray-400` on a white background (which has approximately 4.5:1 contrast, barely passing AA for body text) or `text-gray-200` on white (which fails entirely). Given that this is a legal disclosure whose legibility directly affects user rights, a precise contrast requirement is necessary.

**Recommendation:** Change the Section 19.4 font size specification to: "Font size: minimum `text-xs` (12px / 0.75rem). Text color: must achieve a minimum 4.5:1 contrast ratio against its background in both light and dark modes (WCAG 2.2 SC 1.4.3). Recommended: `text-charcoal-600 dark:text-charcoal-300` on the card background. Do NOT use muted/subtle text color tokens for legal disclosures."

---

**[REQ-07-m06]** Section 7.7 — **Project Count Display Pattern for Agency Tier Uses `∞` Character**

Section 7.7 says Agency shows "Projects: 15/∞". The infinity symbol `∞` (U+221E) is rendered differently across font stacks and has inconsistent screen reader support — some screen readers announce it as "infinity," others ignore it, and some mispronounce it. Using `∞` in a count display is a minor but real accessibility and i18n concern.

**Recommendation:** Change the pattern to "Projects: 15 / Unlimited" in text form. For the compact header display (Section 5.7), use "Credits: 350 | AI: 90" pattern with "Unlimited" text substituting `∞`. Alternatively, for the compact display, use `aria-label="Projects: unlimited"` when rendering the `∞` symbol so the accessible label uses the word form.

---

**[REQ-07-m07]** Section 3.4 and Batch 1 — **`credit_balances` Missing `storageUsedBytes` in Initial Schema**

Section 7.8 (Storage Enforcement) states: "Storage usage tracked in `credit_balances` document (add `storageUsedBytes` field)." However, Section 3.4 defines the `credit_balances` schema without this field. The field is mentioned as a parenthetical addition in Section 7.8 without being formally added to the schema definition. The migration script (Story 1.5) is specified to create `credit_balances` documents with the Section 3.4 schema — if `storageUsedBytes` is not in that schema, the migration will produce incomplete documents.

**Recommendation:** Formally add `storageUsedBytes: number` (default: 0) to the Section 3.4 `credit_balances` schema and update Story 1.5's migration script AC to include this field.

---

**[REQ-07-m08]** Appendix B — **Batch Manifest Does Not Include All Components from Sections 14–19**

Appendix B was written before Sections 13–19 were added (the Wave 1 additions). As a result, the following files specified in later sections are absent from Appendix B's file manifest:

- `src/components/public/EnterpriseLeadModal.jsx` (Section 15.2)
- `server/src/routes/leads.js` (Section 15.2)
- `server/src/services/emailService.js` (Section 12.3)
- `server/src/routes/privacy.js` (Section 19.2)
- `server/src/services/privacyService.js` (Section 19.2)
- `server/src/services/complianceService.js` (Section 19.3)
- Storybook story files (if added per M01 recommendation)
- Annual price toggle component (Section 13.4 implies UI changes to `PricingPage.jsx`)

**Recommendation:** Update Appendix B to include all files from Sections 12–19. Assign each new file to a batch number or create a "Batch 8: Compliance & Legal Requirements" to contain the Wave 1 additions. The current batch structure (1–7) does not account for the substantial Wave 1 additions.

---

### Suggestions (Consider for future)

---

**[REQ-07-S01]** Section 5 (general) — **Consider a Design Token File for Billing Domain**

Rather than embedding token assignments within component sections, consider creating a single `src/tokens/billing.js` file (or `src/styles/billing.css` with CSS custom properties) that exports all billing-specific design token mappings. This would be the single source of truth for billing colors, mirroring the pattern of `src/config/tiers.js` as the single source of truth for tier data. This approach allows the design team to update token assignments across all billing components by editing one file.

---

**[REQ-07-S02]** Section 6.3 and Story 1.3 — **Consider Adding a `useSubscriptionStatus` Selector Hook**

The `SubscriptionContext` exposes a rich object. Components that only need `tier` or `isPastDue` must subscribe to the full context, causing unnecessary re-renders when unrelated context values change. Consider specifying a `useSubscriptionStatus()` selector hook that returns only `{ tier, isActive, isPaused, isPastDue, subscriptionStatus }` for components like `SubscriptionBanner` that only care about status.

---

**[REQ-07-S03]** Section 5 (general) — **Define Animation/Motion Tokens for Billing Interactions**

The document describes several animated interactions implicitly: the credit gauge filling, the collapsible FAQ accordion, the modal open/close transitions, the step transitions in registration and cancellation flows. No animation tokens or motion design principles are defined. Given that the system should respect `prefers-reduced-motion` (WCAG 2.2 SC 2.3.3 Animation from Interactions, AAA, but strongly recommended), consider adding:

```
10.8 — Animation and Motion Guidelines

Credit gauge fill animation:
  - Duration: 600ms ease-out on initial load
  - Respects prefers-reduced-motion: instant if reduced motion preferred
  - Tailwind: transition-all duration-600 (add to tailwind.config.js if not present)

Modal open/close:
  - Enter: opacity 0→1, scale 0.95→1, 200ms ease-out
  - Exit: opacity 1→0, 150ms ease-in
  - Reduced motion: instant show/hide (no fade)

Step transitions (registration, cancellation):
  - Slide left/right within a fixed container, 300ms ease-in-out
  - Reduced motion: fade-only transition (200ms)
```

---

**[REQ-07-S04]** Section 8.1–8.5 — **Admin Dashboard Components Should Specify Empty and Loading States**

Admin components like `SubscriptionDashboard` and `NonprofitVerificationQueue` will be used in contexts where data is loading or empty (new deployment with zero subscribers, pending queue with no entries). The specs describe the "happy path" UI only. Loading skeletons and empty states should be specified.

---

**[REQ-07-S05]** Section 17.2 — **Credit Pack Modal Should Display `expiresAt` Calculation Prominently**

Section 17.2 adds pack expiration (12 months). The `CreditPackModal` spec (Story 5.2) predates this addition and does not mention displaying the expiration date. Consider adding to `CreditPackModal` the text: "Expires 12 months from purchase" near each pack option, and linking to the credit terms section of the ToS (as required by Section 17.2). This also serves a legal disclosure purpose.

---

**[REQ-07-S06]** Section 6.3 — **Consider Adding `refetchCredits` to SubscriptionContext**

The SubscriptionContext listens to `credit_balances` via `onSnapshot`, which provides real-time updates. However, after a successful credit pack purchase (Stripe Checkout redirect returns to the app), there is a latency window between the Stripe webhook being processed and the Firestore document updating. During this window, the UI will show the old balance. Consider specifying a `refetchCredits()` function in the context that explicitly re-reads the balance from the API, to be called on the `?subscription=success` URL param handling.

---

## New Requirements

The following are formal requirement specifications for gaps identified in the review. These represent missing specifications, not functionality changes.

---

**NR-01: Billing Component Design Token Map** (addresses C03)

*Section to add: 5.0 — Billing Component Design Tokens*

All billing components must use design tokens drawn exclusively from the following assignments. Implementers must not introduce new color values outside this map without design review.

Credit Health State Tokens:
- Healthy (`standardCreditsRemaining / (monthlyStandardCredits + bonusStandardCredits) > 0.50`): Progress bar fill `bg-emerald-500`, label text `text-emerald-700 dark:text-emerald-300`
- Warning (`0.25 <= ratio <= 0.50`): Progress bar fill `bg-amber-500`, label text `text-amber-700 dark:text-amber-300`
- Critical (`ratio < 0.25`): Progress bar fill `bg-rose-500`, label text `text-rose-700 dark:text-rose-300`

All state transitions must include the icon change from `lucide-react` specified in finding M07.

---

**NR-02: Standard Billing Modal ARIA Contract** (addresses C06)

*Section to add: 5.0.1 — Standard Billing Modal Pattern*

A shared modal pattern must be established before any billing modal component is implemented. See finding C06 for full specification. This pattern must be implemented once as a `BillingModal` wrapper component (`src/components/billing/BillingModal.jsx`) and consumed by `CreditPackModal`, `UpgradePrompt` (modal variant), and `CancellationRetentionModal`. This ensures ARIA consistency across all billing modals.

```
BillingModal.jsx Props:
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  triggerRef: React.RefObject  // ref to the element that opened the modal (for focus return)
  size?: 'sm' | 'md' | 'lg'   // default 'md'
```

---

**NR-03: CreditUsageGauge Complete Specification** (addresses C01)

*Augment Section 5.2.2*

```
CreditUsageGauge Component Specification

Props:
  creditType: 'standard' | 'ai'
  remaining: number
  monthly: number
  bonus: number
  periodEnd: Date | string
  isLoading?: boolean

Derived values (computed internally):
  total = monthly + bonus
  percentage = remaining / total  (clamped 0–1)
  healthState = percentage > 0.5 ? 'healthy' : percentage >= 0.25 ? 'warning' : 'critical'

Render:
  <div role="group" aria-label="{creditTypeLabel} usage">
    <div
      role="progressbar"
      aria-valuenow={remaining}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuetext="{remaining} of {total} {creditTypeLabel} remaining. Resets {formattedDate}."
      aria-label="{creditTypeLabel}"
    >
      {/* Progress bar track and fill */}
    </div>
    {/* Visible numeric label */}
    <span aria-hidden="true">{remaining}/{total}</span>
    {/* Health state icon — visible at warning/critical states */}
    {healthState !== 'healthy' && (
      <WarningIcon aria-label="{healthState === 'critical' ? 'Critical: ' : 'Low: '}credits" />
    )}
    {/* Reset date */}
    <span>Resets: {formattedDate}</span>
  </div>

Loading state:
  - Render an animated skeleton: a gray rounded rectangle the same dimensions as the gauge
  - aria-busy="true" on the group element during loading
  - No ARIA value attributes during loading (values are not yet meaningful)
```

---

**NR-04: Component Naming Convention Addendum** (addresses M05 and general consistency)

*Augment Section 10.1*

All new component files must follow PascalCase with no spaces, no underscores, and no hyphens in the filename. The filename must exactly match the component's exported name. Examples:
- `EnterpriseLeadModal.jsx` exports `function EnterpriseLeadModal()`
- `CreditUsageGauge.jsx` exports `function CreditUsageGauge()`
- `BillingModal.jsx` exports `function BillingModal()`

Component files co-located in a directory with an `index.js` barrel export are permitted but not required. If a component is in a `billing/` subdirectory, the barrel export is recommended: `src/components/billing/index.js` exporting all billing components, enabling `import { BillingDashboard, CreditPackModal } from '@/components/billing'`.

---

**NR-05: Storybook Component Documentation Standard** (addresses M01)

*Add Section 10.7 — Storybook Requirements*

Every new shared component (`CreditBadge`, `CreditUsageGauge`, `UpgradePrompt`, `TierBadge`, `SubscriptionBanner`, `BillingModal`) must have a corresponding `.stories.jsx` file created in the same batch as the component. Stories must be reviewed and approved (passing all a11y addon checks with zero violations) before the implementing batch is considered complete. See finding M01 for required story variants per component.

---

## Modified Requirements

The following are specific text changes needed to existing requirements in the document.

---

**MR-01: Section 7.3 — `useCredits` Hook — Signature Clarification**

Current text: "Handles 402 responses (insufficient credits) — returns structured error with upgrade options"

Change to: "Handles 402 responses (insufficient credits) — returns structured error `{ success: false, error: 'insufficient_credits', creditsRequired: number, creditsAvailable: number }`. The hook's `consumeCredits` function accepts `(action: string, toolName: string, resourceId?: string | null)` and internally resolves `creditType` and `amount` from `CREDIT_COSTS[action]`. Callers must not pass `creditType` or `amount` directly — these are derived from the action key to ensure consistency. If an unknown action key is passed, the hook must throw an Error during development and log a warning in production."

---

**MR-02: Section 4.4.1 `create-pack-session` — Remove Basic Tier Restriction (already amended in Section 17.1 but not reflected in Section 4)**

Section 4.4.1 still reads: "403: Free tier users cannot purchase packs (must upgrade first)". Section 17.1 explicitly removes this restriction. The original restriction in Section 4.4.1 must be struck through or deleted and replaced with: "Pack purchases permitted for all authenticated tiers. After first pack purchase by a Basic tier user, backend sets `firstPackPurchasedAt: Timestamp` on the user document. A post-purchase upsell banner is displayed in the billing dashboard for first-time Basic tier pack purchasers (implemented in `BillingDashboard.jsx`)."

---

**MR-03: Section 7.10 — `past_due` Grace Period — Align With Section 17.4**

Section 7.10 currently reads "past_due (grace period: 7 days)". Section 17.4 extends this to 14 days. The table in Section 7.10 must be updated to read "grace period: 14 days from first payment failure (`firstPaymentFailedAt` field on subscription document)" in both entries for the `past_due` status row.

---

**MR-04: Section 5.8 `UpgradePrompt` — Add `creditsRequired` and `creditsAvailable` Props**

Current text: "Props: `feature` (for feature gate), `action` (for credit gate), `variant` ('modal' | 'banner')"

Change to: "Props: `feature?: string` (for feature gate — feature name from `useFeatureGate`), `action?: string` (for credit gate — action key from `CREDIT_COSTS`), `creditsRequired?: number` (for credit gate — credits needed, derived from `CREDIT_COSTS[action].cost` but passed explicitly for flexibility), `creditsAvailable?: number` (for credit gate — current balance from `useCredits`), `variant: 'modal' | 'banner'` (required)". At least one of `feature` or `action` is required; passing both is an error.

---

**MR-05: Section 2.1 Freelance Tier — Seat Count Amendment from Wave 1 Modification Index**

The Wave 1 Modification Index (Section, final table) states: "2.1 Freelance — Seats: 1 → 1 (owner) + 1 collaborator seat (read-only)". However, Section 2.1 still reads "Seats: 1" for the Freelance tier. Section 2.3 Feature Access Matrix shows "No" for Team Management on Freelance. Section 6.4 `TIER_CONFIGS.freelance.maxSeats` is set to `1`. These are mutually inconsistent. The modification index change must be propagated into:
- Section 2.1 Freelance definition
- Section 2.3 Feature Access Matrix (Freelance row, Team Management column: "1 read-only collaborator")
- `TIER_CONFIGS.freelance.maxSeats: 2` (owner + 1 read-only collaborator)
- Section 7.4 feature gate table: `teamManagement` — specify that Freelance has a "read-only collaborator" rather than full team management

---

**MR-06: Section 5.1.2 — "Current Plan" Button Must Not Use Native `disabled` Attribute**

Current text: "If user is on this tier: 'Current Plan' (disabled)"

Change to: "If user is on this tier: 'Current Plan' — render with `aria-disabled='true'` and `aria-label='Current plan: {tierName}'`. Do NOT use the native `disabled` attribute, which removes the button from the tab order and makes it unfocusable. `aria-disabled='true'` keeps the button focusable and announces the state to screen readers, while a click handler does nothing (or announces 'This is your current plan')."

---

## Questions & Concerns

1. **Section 6.3 — `consumeCredits` in `SubscriptionContext` vs `useCredits` hook**: If `SubscriptionContext` exposes `consumeCredits` directly, what prevents a developer in a hurry from calling the context method directly instead of using the hook? This bypasses the `CREDIT_COSTS` lookup safety net. Should the `consumeCredits` on the context be renamed to `_consumeCreditsRaw` or removed from the public context surface entirely?

2. **Section 14.1 — Trial on Freelance tier only**: The rationale for a trial on the Freelance tier specifically is clear (highest-value conversion target). However, if a user starts a Freelance trial, uses 1,200 of the 1,500 standard credits, and then the trial expires, what happens to the credit balance? Do the remaining 300 credits disappear? The trial mechanics section does not address credit state at trial expiry. Is the user's data retained in the "Basic limits" state post-trial-expiry, or is it subject to the 30-day Basic retention policy starting from trial end?

3. **Section 13.2 — Annual Downgrade Policy**: The spec states "Annual subscribers do not receive prorated refunds on downgrade — plan changes take effect at annual renewal date." What happens to the credit differential if an annual Agency subscriber (5,000 credits/month) downgrades to Client mid-year? Do they continue receiving Agency-level credits for the rest of the annual term, or do they immediately receive Client-level credits? This has significant cost implications for the business and must be specified before the downgrade API endpoint is implemented.

4. **Section 19.3 — OFAC Sanctions Screening**: The spec says to screen users at registration against the OFAC SDN list and "Blocked registrations/sessions return HTTP 403 with non-descriptive error (do not reveal screening logic)." What screening provider or API is being used? Building an OFAC screening service from scratch against the raw SDN list is complex and legally risky (false positives). The spec implies an integration exists (`screeningProvider: 'ofac_sdn' | 'stripe_radar' | 'manual'`) but Stripe Radar does not provide OFAC screening as a standalone API. This needs a vendor decision before implementation.

5. **Section 17.2 — Credit Pack Expiration — Basic Tier Consistency**: Section 17.1 now allows Basic tier users to buy credit packs. Section 17.2 adds a 12-month expiration to credit packs. For a Basic user who buys a Starter Pack, is the expiration `purchasedAt + 365 days` or tied to the billing period in some way? The expiration logic for Basic users who have no billing period needs clarification.

6. **Section 5.7 and Section 8 — Credit Balance Indicator Positioning**: Section 5.7 specifies "compact: 'Credits: 350 | AI: 90'" in the header/sidebar. What happens when both values are at 0 and the user is in a critical state — does the indicator change color? Is there a truncation strategy when both numbers are 4+ digits (e.g., an Agency user with 4,850 remaining)? Is the indicator a link to `/app/billing`, or purely informational? These UX details affect whether `SubscriptionBanner` and the header indicator are coordinated or redundant.

7. **Section 9, Batch 6 — 15+ Component Modifications**: Story 6.4 requires modifying 15+ existing tool components. This is the highest-risk batch from a regression perspective. The requirement "Do NOT break existing functionality" is the only safeguard specified. For a system engineering review: are there existing component tests or Cypress E2E tests for any of these tool components? The testing strategy (Section 10.2) mentions `@testing-library/react` for component tests but does not specify that existing tool component tests must be expanded to cover the credit-gated paths. This gap should be addressed before Batch 6 begins.

8. **Section 3.8 and Wave 1 Modification Index**: The modification index states that `nonprofit_verifications` schema was extended with `countryCode`, `nonprofitRegistrationType`, `documentRetainUntil`, `applicantAttestedAt`, `iersVerificationResult`, and `reVerificationReminderSentAt`. However, these fields do not appear in the Section 3.8 schema definition. They are referenced in the modification index but never formally defined. What are their types? What does `iersVerificationResult` refer to — is this an integration with the IRS EIN verification API? This represents a significant backend implementation detail that needs formal specification.

9. **Section 16.2 — Retention Coupon Implementation**: The spec states a "one-time 20% discount coupon (if `STRIPE_RETENTION_COUPON_ID` is configured)." This coupon is described as being "applied to next invoice" via the Stripe API. But the Stripe Coupon API applies coupons at the customer or subscription level, not to individual invoices in the same way. A coupon applied to a subscription would potentially repeat across billing periods unless it is a `duration: 'once'` coupon. The spec needs to clarify: (a) the Stripe coupon configuration (`duration: 'once'`, `percent_off: 20`), (b) whether the coupon is removed from the subscription after the next invoice is paid, and (c) how the BillingDashboard surfaces the active discount to the user.

10. **Section 11 vs Section 13 — Annual Plan Refund Policy Contradiction**: Section 11.2 states "EU/UK 14-day withdrawal right and waiver language" must be in the Terms of Service. Section 13.2 states "Annual subscribers receive a 14-day cancellation window for full refund after initial purchase." These are two different policies (one is a legal right, one is a commercial policy) that happen to share the same 14-day window for annual plans. For monthly plans, Section 19.5 states "no partial-month refunds for monthly plans" — but the EU/UK 14-day withdrawal right would apply to monthly plans as well (the right attaches to the initial purchase, not the billing interval). Has legal counsel reconciled these? The implementation of `POST /api/privacy/delete-account` and the cancellation flow must correctly handle EU user refund eligibility, which is not currently specified.

---

## Approval Status

**Needs Revision**

This document cannot be approved for implementation in its current state. The gaps identified in the Critical findings (C01–C06) represent foundational design-system requirements that, if absent at implementation time, will cause irreversible architectural inconsistencies across a 25-component billing system affecting approximately 35,000–40,000 lines of new code. The specific blockers are:

1. **No ARIA specification for `CreditUsageGauge`** (C01) — the central credit visibility component will be inaccessible to screen reader and keyboard users if implemented without this specification.
2. **No focus management spec for multi-step modals** (C02, C04) — the cancellation retention flow and multi-step registration are complex keyboard interaction surfaces that require explicit focus management requirements before implementation.
3. **No design token assignments for the billing domain** (C03) — without a token map, seven developers implementing seven batches will create an incoherent color system that cannot be efficiently corrected without touching every component.
4. **Inaccessible comparison table spec** (C05) — the public pricing page's feature comparison table will fail WCAG 2.2 compliance if icons are used as the sole data representation without text alternatives.
5. **Undefined modal ARIA contract** (C06) — three distinct billing modals (`CreditPackModal`, `UpgradePrompt`, `CancellationRetentionModal`) will diverge in their ARIA patterns without a shared modal specification.

Additionally, the filename typo in `EnterpriseLead Modal.jsx` (M05) will cause a build failure and must be corrected before the file manifest is used.

The Major findings (M01–M08) should be resolved in parallel with the Critical findings — particularly the Storybook requirements (M01), responsive breakpoint specifications (M02), and the `UpgradePrompt` component depth (M03), which are prerequisites for a consistent implementation across Batches 3–6.

**Recommended path to approval:** A revision cycle of approximately 3–5 business days to add the missing design-system specifications, after which this document can be re-reviewed for Conditional Approval. The legal, backend API, data modeling, and batch structure sections are well-specified and do not require revision.

---

*Review prepared by Sr. Design System Engineer. Questions on individual findings can be directed to the reviewer before the revision cycle begins. All finding codes ([REQ-07-*]) reference the seventh review cycle of the pricing requirements document.*