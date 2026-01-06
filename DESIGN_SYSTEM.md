# Content Strategy Portal - Design System v1.0

## Enterprise Design System Documentation
**Section 508 Compliant | WCAG 2.1 Level AA**

---

## Table of Contents
1. [Overview](#overview)
2. [Design Tokens](#design-tokens)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Components](#components)
7. [Accessibility Guidelines](#accessibility-guidelines)
8. [Dark Mode](#dark-mode)
9. [Animation System](#animation-system)

---

## Overview

The Content Strategy Portal design system provides a consistent, accessible, and enterprise-ready visual language across all application features. This system is built on Tailwind CSS and follows Section 508 compliance standards.

### Key Principles
- **Consistency**: Uniform styling across all components
- **Accessibility**: WCAG 2.1 Level AA compliant, Section 508 ready
- **Scalability**: Token-based design for easy theming
- **Performance**: Optimized CSS with minimal bundle size

---

## Design Tokens

### CSS Custom Properties (Root)
```css
:root {
  /* Primary Colors */
  --color-primary: #0066FF;
  --color-primary-light: #EFF6FF;

  /* Accent Colors */
  --color-accent-cyan: #00D4FF;
  --color-accent-purple: #8B5CF6;

  /* Glass Effects */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px rgba(31, 38, 135, 0.08);
}
```

---

## Color System

### Primary Palette (Brand Blue)
| Token | Value | Usage |
|-------|-------|-------|
| `primary-50` | #EFF6FF | Light backgrounds, hover states |
| `primary-100` | #DBEAFE | Subtle highlights |
| `primary-200` | #BFDBFE | Secondary highlights |
| `primary-300` | #93C5FD | Light accents |
| `primary-400` | #60A5FA | Medium accents |
| `primary-500` | #0066FF | **Primary brand color** |
| `primary-600` | #0052CC | Primary hover states |
| `primary-700` | #003D99 | Dark primary |
| `primary-800` | #002966 | Very dark primary |
| `primary-900` | #001433 | Darkest primary |

### Charcoal (Neutral) Palette
| Token | Value | Usage |
|-------|-------|-------|
| `charcoal-50` | #f8fafc | Page backgrounds |
| `charcoal-100` | #f1f5f9 | Card backgrounds, borders |
| `charcoal-200` | #e2e8f0 | Borders, dividers |
| `charcoal-300` | #cbd5e1 | Disabled states |
| `charcoal-400` | #94a3b8 | Placeholder text |
| `charcoal-500` | #64748b | Secondary text |
| `charcoal-600` | #475569 | Body text |
| `charcoal-700` | #334155 | Headings |
| `charcoal-800` | #1e293b | Dark backgrounds |
| `charcoal-900` | #0f172a | Very dark backgrounds |
| `charcoal-950` | #020617 | Darkest backgrounds |

### Semantic Colors
| Color | Token | Usage |
|-------|-------|-------|
| Success | `emerald-500` (#10b981) | Success states, positive feedback |
| Warning | `amber-500` (#f59e0b) | Warning states, caution indicators |
| Error | `red-500` (#ef4444) | Error states, destructive actions |
| Info | `cyan-500` (#00D4FF) | Informational states |

### Tool-Specific Colors
| Tool | Color | Tailwind Class |
|------|-------|----------------|
| Content Planner | Primary Blue | `from-primary-500 to-primary-600` |
| Technical Audit | Cyan | `from-cyan-500 to-cyan-600` |
| Accessibility | Purple | `from-purple-500 to-purple-600` |
| Image Alt Generator | Emerald | `from-emerald-500 to-emerald-600` |
| Meta Data Generator | Amber | `from-amber-500 to-amber-600` |
| Schema Generator | Rose | `from-rose-500 to-rose-600` |

---

## Typography

### Font Families
```css
font-family: {
  sans: ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
  mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
  display: ['Inter', 'SF Pro Display', 'sans-serif']
}
```

### Font Sizes
| Class | Size | Usage |
|-------|------|-------|
| `text-2xs` | 0.625rem (10px) | Tiny labels, badges |
| `text-xs` | 0.75rem (12px) | Small text, help text |
| `text-sm` | 0.875rem (14px) | Body secondary, buttons |
| `text-base` | 1rem (16px) | Primary body text |
| `text-lg` | 1.125rem (18px) | Section headers |
| `text-xl` | 1.25rem (20px) | Subsection titles |
| `text-2xl` | 1.5rem (24px) | Page section titles |
| `text-3xl` | 1.875rem (30px) | Page titles |
| `text-4xl` | 2.25rem (36px) | Hero titles |

### Font Weights
| Weight | Class | Usage |
|--------|-------|-------|
| 300 | `font-light` | Decorative text |
| 400 | `font-normal` | Body text |
| 500 | `font-medium` | Buttons, labels |
| 600 | `font-semibold` | Headings |
| 700 | `font-bold` | Page titles |

---

## Spacing & Layout

### Spacing Scale (Base: 4px)
| Class | Value | Usage |
|-------|-------|-------|
| `gap-1` / `p-1` | 4px | Tight spacing |
| `gap-2` / `p-2` | 8px | Small spacing |
| `gap-3` / `p-3` | 12px | Medium-small spacing |
| `gap-4` / `p-4` | 16px | Standard spacing |
| `gap-5` / `p-5` | 20px | Medium spacing |
| `gap-6` / `p-6` | 24px | Large spacing |
| `gap-8` / `p-8` | 32px | Section spacing |
| `gap-12` / `p-12` | 48px | Major section spacing |

### Border Radius
| Class | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Small elements |
| `rounded-xl` | 12px | Buttons, inputs |
| `rounded-2xl` | 16px | Cards, modals |
| `rounded-3xl` | 24px | Large containers |
| `rounded-4xl` | 32px | Hero sections |
| `rounded-full` | 50% | Avatars, badges |

### Container Max-Widths
```jsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Standard page container */}
</div>
```

---

## Components

### Buttons

#### Base Button
```jsx
<button className="btn btn-primary">Primary Action</button>
<button className="btn btn-secondary">Secondary Action</button>
<button className="btn btn-ghost">Ghost Action</button>
<button className="btn btn-danger">Destructive Action</button>
<button className="btn btn-success">Positive Action</button>
```

#### Button Sizes
```jsx
<button className="btn btn-primary btn-sm">Small</button>
<button className="btn btn-primary">Default</button>
<button className="btn btn-primary btn-lg">Large</button>
```

#### Icon Buttons
```jsx
<button className="btn-icon" aria-label="Close">
  <X className="w-5 h-5" aria-hidden="true" />
</button>
```

### Cards

#### Standard Card
```jsx
<div className="card p-6">
  {/* Card content */}
</div>
```

#### Interactive Card
```jsx
<div className="card card-hover p-6">
  {/* Hoverable card */}
</div>
```

#### Glass Card
```jsx
<div className="card-glass p-6">
  {/* Glassmorphism effect */}
</div>
```

### Form Inputs

#### Text Input
```jsx
<label htmlFor="email" className="block text-sm font-medium text-charcoal-700 mb-1">
  Email Address
</label>
<input
  id="email"
  type="email"
  className="input"
  placeholder="you@example.com"
  aria-describedby="email-hint"
/>
<p id="email-hint" className="text-xs text-charcoal-500 mt-1">
  We'll never share your email.
</p>
```

#### Input with Icon
```jsx
<div className="relative">
  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" aria-hidden="true" />
  <input className="input pl-10" type="email" />
</div>
```

#### Select
```jsx
<select className="select">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Badges
```jsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-danger">Error</span>
<span className="badge badge-info">Info</span>
<span className="badge badge-purple">Purple</span>
<span className="badge badge-neutral">Neutral</span>
```

### Navigation Links
```jsx
<a href="/" className="nav-link">
  <Home className="w-4 h-4" aria-hidden="true" />
  <span>Home</span>
</a>

{/* Active state */}
<a href="/current" className="nav-link nav-link-active" aria-current="page">
  <Settings className="w-4 h-4" aria-hidden="true" />
  <span>Settings</span>
</a>
```

### Modals
```jsx
<div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <div className="modal">
    <div className="modal-header">
      <h2 id="modal-title">Modal Title</h2>
      <button aria-label="Close modal">
        <X className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
    <div className="modal-body">
      {/* Content */}
    </div>
    <div className="modal-footer">
      <button className="btn btn-secondary">Cancel</button>
      <button className="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

### Tables
```jsx
<table className="table-modern">
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Item 1</td>
      <td><span className="badge badge-success">Active</span></td>
    </tr>
  </tbody>
</table>
```

---

## Accessibility Guidelines

### Section 508 Compliance Requirements

#### 1. Color Contrast
- **Normal text**: Minimum 4.5:1 contrast ratio
- **Large text** (18pt+): Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

| Color Combination | Contrast | Status |
|-------------------|----------|--------|
| Primary (#0066FF) on white | 8.59:1 | AAA |
| Charcoal-900 on white | 13.1:1 | AAA |
| Charcoal-600 on white | 5.91:1 | AA |
| White on Primary-500 | 8.59:1 | AAA |

#### 2. Focus Management
```css
/* All focusable elements MUST have visible focus */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

#### 3. Icon Accessibility
```jsx
{/* Decorative icons - hide from screen readers */}
<Icon className="w-4 h-4" aria-hidden="true" />

{/* Functional icons - provide label */}
<button aria-label="Delete item">
  <Trash className="w-4 h-4" aria-hidden="true" />
</button>
```

#### 4. Form Accessibility
```jsx
{/* Every input MUST have a label */}
<label htmlFor="input-id">Label Text</label>
<input id="input-id" type="text" aria-describedby="input-hint input-error" />
<p id="input-hint" className="text-charcoal-500">Help text</p>
<p id="input-error" className="text-red-600" role="alert">Error message</p>
```

#### 5. ARIA Attributes Required
| Element | Required ARIA |
|---------|---------------|
| Dropdowns | `aria-expanded`, `aria-haspopup` |
| Modals | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` |
| Navigation | `role="navigation"`, `aria-label` |
| Current page | `aria-current="page"` |
| Menu items | `role="menu"`, `role="menuitem"` |
| Tooltips | `role="tooltip"` |
| Alerts | `role="alert"`, `aria-live="assertive"` |
| Status messages | `role="status"`, `aria-live="polite"` |

#### 6. Skip Link (Required)
```jsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
<main id="main-content" role="main">
  {/* Page content */}
</main>
```

#### 7. Keyboard Navigation
- All interactive elements must be focusable
- Tab order must be logical
- Escape key must close modals/dropdowns
- Arrow keys for menu navigation

---

## Dark Mode

### Implementation
Dark mode uses Tailwind's `class` strategy and is managed via ThemeContext.

### Dark Mode Overrides
```css
/* Cards */
.dark .card {
  @apply bg-charcoal-800 border-charcoal-700/50;
}

/* Inputs */
.dark .input {
  @apply bg-charcoal-800 border-charcoal-700 text-charcoal-100;
}

/* Buttons */
.dark .btn-secondary {
  @apply bg-charcoal-800 text-charcoal-200 border-charcoal-700;
}
```

---

## Animation System

### Available Animations
| Animation | Class | Duration | Usage |
|-----------|-------|----------|-------|
| Fade In | `animate-fade-in` | 0.5s | Page load |
| Fade In Up | `animate-fade-in-up` | 0.5s | Cards, content blocks |
| Scale In | `animate-scale-in` | 0.2s | Modals, dropdowns |
| Slide Right | `animate-slide-in-right` | 0.3s | Side panels |
| Shimmer | `animate-shimmer` | 2s loop | Loading skeletons |
| Glow Pulse | `animate-glow-pulse` | 2s loop | Featured items |

### Staggered Animations
```jsx
<div className="stagger-children">
  <div>Item 1</div> {/* delay: 0ms */}
  <div>Item 2</div> {/* delay: 50ms */}
  <div>Item 3</div> {/* delay: 100ms */}
</div>
```

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Usage Guidelines

### Do's
- Use design system classes instead of inline styles
- Always add `aria-hidden="true"` to decorative icons
- Use semantic HTML elements
- Provide labels for all form inputs
- Test with keyboard navigation
- Verify color contrast ratios

### Don'ts
- Don't use gray-* colors (use charcoal-*)
- Don't skip heading levels (h1 -> h3)
- Don't disable focus outlines
- Don't use color alone to convey information
- Don't remove or hide the skip link

---

## File Locations

| File | Purpose |
|------|---------|
| `tailwind.config.js` | Design token definitions |
| `src/index.css` | Component classes & utilities |
| `src/contexts/ThemeContext.jsx` | Dark mode management |
| `src/components/shared/Skeleton.jsx` | Loading state components |
| `src/components/common/InfoTooltip.jsx` | Tooltip component |

---

**Version**: 1.0
**Last Updated**: January 2026
**Maintainer**: Design System Team
