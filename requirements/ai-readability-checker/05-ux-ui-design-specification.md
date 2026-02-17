# AI Readability Checker — UX/UI Design Specification

## 1. Design System Alignment

### 1.1 Theme Color: Teal

The tool SHALL use **Teal** as its primary theme color (unused by existing tools).

| Token | Value | Usage |
|---|---|---|
| teal-50 | #f0fdfa | Light backgrounds, hover states |
| teal-100 | #ccfbf1 | Badge backgrounds |
| teal-300 | #5eead4 | Active borders |
| teal-500 | #14b8a6 | Primary gradient start |
| teal-600 | #0d9488 | Primary gradient end |
| teal-700 | #0f766e | Text on light backgrounds |

Add to ToolCard.jsx `colorVariants`:
```javascript
teal: {
  gradient: 'from-teal-500 to-teal-600',
  lightGradient: 'from-teal-50 to-teal-100/50',
  icon: 'from-teal-500 to-teal-600',
  iconBg: 'bg-teal-50',
  text: 'text-teal-600',
  badge: 'bg-teal-100 text-teal-700 border-teal-200',
  button: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700',
  glow: 'group-hover:shadow-teal-500/20',
  ring: 'ring-teal-500/20'
}
```

Add `TEAL: 'teal'` to `TOOL_COLORS` in `tools.js`.

### 1.2 Icon & Typography

- **Icon:** `ScanEye` from Lucide React (fallback: `Brain`, `BookOpenCheck`)
- **Headings:** Inter, bold
- **Body:** Inter, regular, `leading-relaxed`
- **Code/snippets:** JetBrains Mono
- **Score numbers:** Inter, bold, text-4xl

### 1.3 Reused Shared Components

`.card`, `.card-hover`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.badge`, `.input-lg`, `.tabs/.tab/.tab-active`, `.table-modern`, `.modal-*`, `react-dropzone`, `react-hot-toast`, Skeleton loaders

---

## 2. Screen Specifications

### 2.1 Input Screen (`/app/readability`)

**Tool Header:** ScanEye icon in teal gradient circle (w-14 h-14 rounded-2xl), title "AI Readability Checker" (text-3xl font-bold), subtitle "Evaluate how AI search engines interpret your content."

**Tab Navigation:** Three tabs — "URL" (default, Globe icon), "Upload HTML" (Upload icon), "Paste HTML" (Code icon). Active tab uses `.tab-active` with teal underline.

**URL Tab:**
- Full-width `.input-lg` field, placeholder "https://example.com/your-page"
- Real-time validation icon (green check / red X) at right edge of input
- "Analyze" button with teal gradient, right-aligned below input
- Collapsible "Advanced Options": industry dropdown, target keywords field

**Upload HTML Tab:**
- 200px drag-and-drop zone using `react-dropzone`, dashed border
- Hover: border-teal-300, bg-teal-50/50. Drag active: border-teal-500, bg-teal-100
- Center: Upload icon + "Drag & drop your HTML file" + "or click to browse"
- Below: "Supports .html/.htm up to 10MB"
- Screaming Frog info callout card with blue-left-border
- File selected: filename + size + "Analyze" / "Remove" buttons

**Paste HTML Tab:**
- Monospace textarea, 300px min-height
- Character counter: "0 / 2,000,000"
- "Analyze" button disabled until 100+ chars

**History Preview (below input):**
- Last 5 analyses: compact table with URL, score badge, relative date, "View" link
- "View All History" link. Empty state: ScanEye icon + "No analyses yet"

### 2.2 Processing Screen (state-driven, same route)

**Progress Bar:** 8px rounded-full, charcoal-200 background, teal gradient fill with shimmer animation. Percentage above bar.

**Stage Messages (with progress %):**
1. "Fetching page content..." (0-15%)
2. "Extracting content and metadata..." (15-25%)
3. "Analyzing with Claude AI..." (25-40%)
4. "Querying OpenAI..." (40-55%)
5. "Querying Google Gemini..." (55-70%)
6. "Querying Perplexity..." (70-85%)
7. "Calculating scores..." (85-95%)
8. "Finalizing results..." (95-100%)

**Stage Checklist:** Each stage shows checkbox icon + label + elapsed time. Completed = green check. Active = spinner + teal text. Pending = empty circle + charcoal-400.

**Cancel button:** `.btn-ghost`, confirmation dialog before canceling.

### 2.3 Results Dashboard (`/app/readability` or `/app/readability/{analysisId}`)

**Top Action Bar:**
- Left: "Back" button + URL with external link icon
- Right: "Share" button, "Export" dropdown (PDF, JSON)
- Re-analysis delta badge if previous analysis exists (+5 / -3)

**Overall Score Card:**
- Large score number (text-5xl font-bold), color-coded by grade
- Grade letter in badge, one-sentence summary
- Color: A+/A = emerald-500, B+/B = teal-500, C+/C = amber-500, D = orange-500, F = red-500

**Category Breakdown:**
- Radar/spider chart (Chart.js) OR horizontal bar chart for 5 categories
- Each bar color-coded by score level
- Clickable to scroll to category detail

**Tab Navigation (below score):**
- Tab 1: "Score Details" — check results by category
- Tab 2: "LLM Previews" — side-by-side renderings
- Tab 3: "Recommendations" — prioritized actions
- Tab 4: "Issues" — filterable table of all checks

### 2.4 Score Details Tab

**Category Accordions:** Each category is a collapsible card with header (name + score + progress bar + chevron). First expanded by default.

**Check Items:** Status icon (green check / amber triangle / red X), title, severity badge (PASS/WARN/FAIL). Expandable detail: description, affected elements in code block, recommendation text.

### 2.5 LLM Previews Tab

**LLM Selection:** Checkbox row to toggle 2-4 LLMs. Each with name + model label.

**View Toggle:** "Side-by-Side" / "Diff" buttons.

**Column Layout:** Equal-width columns per selected LLM. Each column card: LLM name, model, processing time, then sections for Title, Description, Topic, Main Content (scrollable markdown), Entities, Usefulness Score.

**Coverage Summary Table:** `.table-modern` below columns showing Content%, Headings%, Entities%, Time per LLM. Sortable columns.

**Responsive:** 4 cols at xl, 2 cols at lg, stacked tabs at sm.

**Error per LLM:** Column shows error icon + message + "Retry" button; others display normally.

### 2.6 Recommendations Tab

**Filter Bar:** Pill toggles — All, Quick Wins, Structure, Content, Technical. Count badge per filter.

**Recommendation Cards:** Priority icon (color-coded), bold title, 2-3 line description, metadata row (priority badge, effort badge, impact badge). "View Code Fix" expandable with before/after syntax-highlighted code + "Copy" button. AI recommendations: "AI Suggested" badge with sparkle icon.

### 2.7 Issues Tab

**Filters:** Severity dropdown, Category dropdown, Status dropdown, search text input.

**Table:** `.table-modern` with sortable columns: Severity, Check ID, Title, Category, Status. Click row to expand details inline. Pagination: 20 per page.

---

## 3. Responsive Breakpoints

| Breakpoint | Width | Adjustments |
|---|---|---|
| sm | < 640px | Single column, stacked cards, tabs become dropdown |
| md | 640-767px | Two-column score+chart, stacked LLM previews |
| lg | 768-1023px | Two-column LLM preview, side-by-side score+chart |
| xl | 1024px+ | Full layout, 4-column LLM preview |

---

## 4. Interaction States

### 4.1 URL Input

| State | Visual |
|---|---|
| Empty | Placeholder, button disabled (charcoal-300) |
| Typing invalid | Red border, red X, error text, button disabled |
| Typing valid | Green border, green check, button enabled (teal) |
| Submitting | Input disabled, spinner + "Analyzing..." on button |
| Fetch error | Red border, error card below with retry option |

### 4.2 Upload

| State | Visual |
|---|---|
| Default | Dashed border, upload icon, instructions |
| Drag hover | Teal border, teal bg tint, scale-[1.01] |
| Drag reject | Red border, red bg, "Unsupported file type" |
| File selected | Solid border, filename/size, Analyze/Remove buttons |
| Error | Red border, error message, "Try Again" button |

---

## 5. Animations & Transitions

All animations respect `prefers-reduced-motion: reduce`.

| Element | Animation | Duration |
|---|---|---|
| Page transition | fade-in-up | 300ms |
| Tab switch | fade-in | 200ms |
| Card hover | shadow-lg + scale-[1.01] | 200ms |
| Score counter | Count 0 to final | 1000ms |
| Progress bar | Width transition | 300ms |
| Accordion expand | Height + fade-in | 200ms |
| LLM column load | fade-in-up staggered (100ms) | 300ms |
| Score gauge fill | Circular fill | 1200ms |

---

## 6. Empty & Error States

**No History:** ScanEye icon (w-16 h-16 charcoal-300) + "No analyses yet" + "Analyze Your First Page" CTA.

**No Recommendations:** CheckCircle2 (emerald-500) + "Great work! No critical issues found."

**All LLMs Failed:** AlertTriangle (amber-500) + "LLM previews unavailable" + "Retry LLM Analysis" CTA.

**URL Fetch Error:** Card with red-left-border, AlertCircle icon, specific error, "Try Again" + "Upload HTML Instead" actions.

**Analysis Error:** Full-screen ToolErrorBoundary pattern, teal header, "Try Again" + "Report Issue" buttons.

---

*Document Version: 1.0*
*Created: 2026-02-17*
*Last Updated: 2026-02-17*
*Status: Draft*
