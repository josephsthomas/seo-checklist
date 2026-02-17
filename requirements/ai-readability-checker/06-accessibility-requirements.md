# AI Readability Checker — Accessibility Requirements

## 1. Compliance Target

The AI Readability Checker SHALL meet **WCAG 2.2 Level AA** compliance, consistent with the portal's existing accessibility standards and its own Accessibility Analyzer tool.

---

## 2. Perceivable (WCAG Principle 1)

### 2.1 Text Alternatives (1.1)

| Requirement | Implementation |
|---|---|
| All decorative icons use `aria-hidden="true"` | Lucide icons without functional meaning |
| All functional icons have accessible labels | `aria-label` on icon-only buttons (Share, Export, Copy) |
| Score gauge/chart has text alternative | `aria-label` on chart with "Overall score: 85 out of 100, Grade A" |
| Radar chart has text description | Hidden `<table>` or `aria-describedby` with category scores |
| File upload zone has accessible label | `aria-label="Upload HTML file for analysis"` on dropzone |
| LLM provider logos (if images) have alt text | `alt="Claude by Anthropic"` etc. |

### 2.2 Time-Based Media (1.2)

Not applicable — no audio or video content in this tool.

### 2.3 Adaptable (1.3)

| Requirement | Implementation |
|---|---|
| Heading hierarchy is correct | H1 = tool title, H2 = section headers, H3 = subsections |
| Tabs use proper ARIA roles | `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected` |
| Accordion uses proper ARIA | `aria-expanded`, `aria-controls`, button trigger |
| Tables have proper headers | `<th scope="col">` for all data tables |
| Score categories use semantic lists | `<ul>` with `<li>` for category breakdown |
| Form fields have associated labels | `<label htmlFor>` or `aria-label` on all inputs |
| Required fields are marked | `aria-required="true"` on URL input |
| Error messages linked to fields | `aria-describedby` pointing to error message element |
| Reading order matches visual order | DOM order follows logical reading sequence |
| Input purpose identified | `autocomplete="url"` on URL input field |

### 2.4 Distinguishable (1.4)

| Requirement | Implementation |
|---|---|
| Color is not sole indicator | Score uses color + number + grade letter + text summary |
| Check status uses icon + text + color | Pass = green check + "PASS", Fail = red X + "FAIL" |
| Text contrast >= 4.5:1 | All text on white/charcoal-50 backgrounds meets AA |
| Large text contrast >= 3:1 | Score numbers (text-4xl+) meet minimum ratio |
| Text resizable to 200% | Layout reflows, no horizontal scroll at 200% zoom |
| Images of text avoided | All text rendered as real text, no score images |
| Non-text contrast >= 3:1 | Button borders, input borders, chart lines meet ratio |
| Content reflows at 320px viewport | Single-column layout at smallest breakpoint |
| Text spacing adjustable | No content loss when letter/word/line spacing increased |

---

## 3. Operable (WCAG Principle 2)

### 3.1 Keyboard Accessible (2.1)

| Element | Keyboard Interaction |
|---|---|
| URL input | Tab to focus, Enter to submit |
| Tab navigation | Arrow keys to switch tabs, Enter/Space to activate |
| Upload dropzone | Tab to focus, Enter/Space to open file picker |
| Analyze button | Tab to focus, Enter/Space to activate |
| Category accordion | Tab to header, Enter/Space to expand/collapse |
| LLM checkbox toggle | Tab to focus, Space to toggle |
| Table sort headers | Tab to focus, Enter to sort |
| Code copy button | Tab to focus, Enter/Space to copy |
| Export dropdown | Tab to focus, Enter to open, Arrow keys to navigate, Enter to select |
| Share button | Tab to focus, Enter/Space to generate link |
| Cancel button | Tab to focus, Enter/Space to trigger (with confirmation) |
| Filter pill toggles | Tab between pills, Enter/Space to activate |
| Pagination | Tab to focus, Enter to navigate |
| Modal dialogs | Tab trapped within modal, Escape to close |

All interactive elements SHALL be reachable and operable with keyboard only. No keyboard traps SHALL exist.

### 3.2 Enough Time (2.2)

| Requirement | Implementation |
|---|---|
| Processing has no user timeout | Analysis runs to completion (system timeout only) |
| Shared link expiry is configurable | User can set expiry duration before generating |
| Toast notifications auto-dismiss | Minimum 5 seconds, pausable on hover, dismissible |
| No session timeout during analysis | Analysis in progress prevents idle timeout |

### 3.3 Seizures and Physical Reactions (2.3)

| Requirement | Implementation |
|---|---|
| No flashing content | Progress bar uses smooth transition, no blinking |
| Shimmer animations are subtle | Max 3 flashes per second, respects reduced motion |
| All animations respect `prefers-reduced-motion` | Disabled when user prefers reduced motion |

### 3.4 Navigable (2.4)

| Requirement | Implementation |
|---|---|
| Skip link available | "Skip to main content" link (existing portal pattern) |
| Page title descriptive | "AI Readability Checker - Content Strategy Portal" |
| Focus order logical | Tab order: header > input area > action buttons > results |
| Link purpose clear | "View full analysis" not "Click here" |
| Multiple navigation paths | Breadcrumbs + nav menu + Command Palette (Cmd+K) |
| Headings descriptive | "Content Structure Score: 90/100" not just "Category 1" |
| Focus visible | 2px solid primary-500 outline with 2px offset (existing) |

### 3.5 Input Modalities (2.5)

| Requirement | Implementation |
|---|---|
| Pointer gestures simple | All actions achievable with single click/tap |
| Pointer cancellation | mousedown does not trigger, only click/mouseup |
| Label in name | Visible button text matches accessible name |
| Motion actuation not required | No shake-to-refresh or tilt actions |
| Target size >= 24x24px | All clickable elements meet minimum (buttons are 44px+) |
| Drag-and-drop has alternative | Upload zone also has click-to-browse button |

---

## 4. Understandable (WCAG Principle 3)

### 4.1 Readable (3.1)

| Requirement | Implementation |
|---|---|
| Page language set | `<html lang="en">` (inherited from portal) |
| Language of parts | LLM extraction content inherits from analyzed page language |
| Jargon explained | Tooltips or inline help for terms like "JSON-LD", "Flesch Score" |
| Abbreviations expanded | First use of acronyms includes expansion (e.g., "LLM (Large Language Model)") |

### 4.2 Predictable (3.2)

| Requirement | Implementation |
|---|---|
| No focus-triggered changes | Focusing URL input does not auto-submit |
| No input-triggered changes | Typing does not trigger analysis (explicit submit required) |
| Consistent navigation | Tool follows same nav pattern as all portal tools |
| Consistent identification | Buttons/icons use same meaning across the tool |

### 4.3 Input Assistance (3.3)

| Requirement | Implementation |
|---|---|
| Error identification | Invalid URL: red border + icon + text description of error |
| Labels/instructions | "Enter a public URL to analyze its AI readability" |
| Error suggestion | "Did you mean https://...?" for missing protocol |
| Error prevention | Confirmation dialog before cancel; validation before submit |
| Status messages via `aria-live` | "Analysis complete. Score: 85/100" announced to screen readers |
| Progress updates via `aria-live` | "Analyzing with Claude AI... 40% complete" politely announced |

---

## 5. Robust (WCAG Principle 4)

### 5.1 Compatible (4.1)

| Requirement | Implementation |
|---|---|
| Valid HTML | No duplicate IDs, proper nesting, valid attributes |
| ARIA roles correct | Tabs, accordions, dialogs use proper ARIA patterns |
| Status messages use `role="status"` | Progress updates, score display, toast messages |
| Error messages use `role="alert"` | Fetch errors, validation errors |
| Name/role/value exposed | All custom components expose correct semantics |

---

## 6. Screen Reader Considerations

### 6.1 Announcements

| Event | Announcement | ARIA |
|---|---|---|
| Analysis started | "Analysis started for [URL]" | `aria-live="polite"` |
| Stage change | "Now analyzing with Claude AI" | `aria-live="polite"` |
| Analysis complete | "Analysis complete. Score: 85 out of 100, Grade A" | `aria-live="assertive"` |
| LLM preview loaded | "Claude extraction loaded" | `aria-live="polite"` |
| LLM preview failed | "OpenAI extraction failed. Other results are available." | `aria-live="polite"` |
| Link copied | "Share link copied to clipboard" | `aria-live="polite"` |
| Export started | "Generating PDF report" | `aria-live="polite"` |
| Export complete | "PDF report downloaded" | `aria-live="polite"` |
| Error occurred | "Error: Unable to fetch URL. [reason]" | `aria-live="assertive"` |

### 6.2 Chart Accessibility

**Radar/Spider Chart:**
- `role="img"` with `aria-label` describing the chart
- Hidden data table as alternative: `<table class="sr-only">` with category names and scores
- Chart.js `aria-label` plugin or manual implementation

**Score Gauge:**
- `role="meter"` with `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`
- `aria-label="AI Readability Score: 85 out of 100"`

---

## 7. Testing Requirements

| Test Method | Target |
|---|---|
| Axe-core automated scan | 0 violations at AA level |
| NVDA screen reader test | All content readable, all actions performable |
| VoiceOver (macOS) test | All content readable, all actions performable |
| Keyboard-only navigation | Full workflow completable without mouse |
| 200% zoom test | No content overflow or loss |
| High contrast mode | All content visible in Windows High Contrast |
| Reduced motion test | All animations disabled, tool fully functional |
| Color blindness simulation | All statuses distinguishable without color |

---

*Document Version: 1.0*
*Created: 2026-02-17*
*Last Updated: 2026-02-17*
*Status: Draft*
