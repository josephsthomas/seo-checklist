import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Code2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  AlertCircle,
  Info,
  ExternalLink,
  X,
  Lightbulb,
  FileCode
} from 'lucide-react';
import toast from 'react-hot-toast';

// Fix suggestions database for common accessibility issues
const FIX_SUGGESTIONS = {
  'missing-alt': {
    title: 'Missing Image Alt Text',
    description: 'Images must have alt text that describes their content or function.',
    wcag: 'WCAG 1.1.1',
    level: 'A',
    beforeCode: '<img src="image.jpg">',
    afterCode: '<img src="image.jpg" alt="Description of the image content">',
    explanation: 'Add descriptive alt text that conveys the meaning or purpose of the image. For decorative images, use alt="".',
    tips: [
      'Be specific and concise in your description',
      'Avoid phrases like "image of" or "picture of"',
      'For decorative images, use empty alt text (alt="")',
      'For complex images, consider using aria-describedby for longer descriptions'
    ],
    resources: [
      { title: 'WCAG Alt Text Guide', url: 'https://www.w3.org/WAI/tutorials/images/' }
    ]
  },
  'empty-alt': {
    title: 'Empty Alt Text on Informative Image',
    description: 'Alt text is empty but the image appears to convey information.',
    wcag: 'WCAG 1.1.1',
    level: 'A',
    beforeCode: '<img src="chart.png" alt="">',
    afterCode: '<img src="chart.png" alt="Sales chart showing 25% growth in Q4 2024">',
    explanation: 'Empty alt text should only be used for decorative images. If the image conveys information, add descriptive alt text.',
    tips: [
      'Review if the image is truly decorative',
      'If it contains text, include that text in the alt',
      'If it\'s a chart/graph, describe the key data points'
    ]
  },
  'missing-label': {
    title: 'Form Input Missing Label',
    description: 'Form inputs must have associated labels for screen readers.',
    wcag: 'WCAG 1.3.1, 4.1.2',
    level: 'A',
    beforeCode: '<input type="text" placeholder="Enter email">',
    afterCode: `<label for="email">Email Address</label>
<input type="text" id="email" placeholder="Enter email">`,
    explanation: 'Every form input needs an associated label. This helps screen reader users understand what information is expected.',
    tips: [
      'Use the for/id relationship to connect label and input',
      'Alternatively, wrap the input inside the label element',
      'aria-label can be used when a visible label isn\'t possible',
      'Don\'t rely on placeholder text alone'
    ]
  },
  'missing-lang': {
    title: 'Missing Document Language',
    description: 'The page is missing the lang attribute on the html element.',
    wcag: 'WCAG 3.1.1',
    level: 'A',
    beforeCode: '<html>',
    afterCode: '<html lang="en">',
    explanation: 'Screen readers use the language attribute to determine the correct pronunciation of words.',
    tips: [
      'Use the correct ISO 639-1 language code',
      'For multilingual content, use lang attribute on specific elements',
      'Common codes: en, es, fr, de, zh, ja'
    ]
  },
  'low-contrast': {
    title: 'Insufficient Color Contrast',
    description: 'Text does not have sufficient contrast against its background.',
    wcag: 'WCAG 1.4.3',
    level: 'AA',
    beforeCode: `/* Before: Low contrast */
.text {
  color: #999999;
  background: #ffffff;
}`,
    afterCode: `/* After: Sufficient contrast */
.text {
  color: #595959;
  background: #ffffff;
}`,
    explanation: 'Regular text needs a contrast ratio of at least 4.5:1. Large text (18pt+) needs 3:1.',
    tips: [
      'Use a contrast checker tool to verify ratios',
      'Consider users with low vision or color blindness',
      'Don\'t rely on color alone to convey information',
      'Test with both light and dark modes'
    ],
    resources: [
      { title: 'WebAIM Contrast Checker', url: 'https://webaim.org/resources/contrastchecker/' }
    ]
  },
  'missing-heading': {
    title: 'Missing Main Heading',
    description: 'Page should have exactly one h1 heading.',
    wcag: 'WCAG 1.3.1',
    level: 'A',
    beforeCode: `<div class="title">Page Title</div>`,
    afterCode: `<h1>Page Title</h1>`,
    explanation: 'Every page should have one main h1 heading that describes the page content. Screen reader users often navigate by headings.',
    tips: [
      'Use only one h1 per page',
      'Headings should be in hierarchical order (h1, h2, h3...)',
      'Don\'t skip heading levels',
      'Headings help organize content for all users'
    ]
  },
  'skip-heading-level': {
    title: 'Skipped Heading Level',
    description: 'Heading levels should not be skipped (e.g., h1 to h3).',
    wcag: 'WCAG 1.3.1',
    level: 'A',
    beforeCode: `<h1>Main Title</h1>
<h3>Subtitle</h3>`,
    afterCode: `<h1>Main Title</h1>
<h2>Subtitle</h2>`,
    explanation: 'Headings should follow a logical order. Don\'t skip levels for visual styling purposes.',
    tips: [
      'Use CSS to style headings, not different heading levels',
      'Think of headings as a document outline',
      'Each section can reset to h2 under h1'
    ]
  },
  'missing-link-text': {
    title: 'Link Missing Descriptive Text',
    description: 'Links should have descriptive text that makes sense out of context.',
    wcag: 'WCAG 2.4.4',
    level: 'A',
    beforeCode: '<a href="/products">Click here</a>',
    afterCode: '<a href="/products">View our products</a>',
    explanation: 'Link text like "click here" or "read more" doesn\'t provide context. Users often navigate by links alone.',
    tips: [
      'Describe the link destination or purpose',
      'Avoid generic phrases like "click here" or "learn more"',
      'For icon-only links, use aria-label',
      'Consider that links may be read out of context'
    ]
  },
  'missing-button-text': {
    title: 'Button Missing Accessible Name',
    description: 'Buttons need text or an accessible name for screen readers.',
    wcag: 'WCAG 4.1.2',
    level: 'A',
    beforeCode: '<button><svg>...</svg></button>',
    afterCode: '<button aria-label="Close menu"><svg>...</svg></button>',
    explanation: 'Buttons with only icons need an accessible name so screen reader users know their purpose.',
    tips: [
      'Add aria-label for icon-only buttons',
      'Alternatively, use visually hidden text',
      'Button text should describe the action',
      'Avoid using "button" in the label'
    ]
  },
  'missing-focus-indicator': {
    title: 'Missing Focus Indicator',
    description: 'Interactive elements should have a visible focus indicator.',
    wcag: 'WCAG 2.4.7',
    level: 'AA',
    beforeCode: `button:focus {
  outline: none;
}`,
    afterCode: `button:focus {
  outline: 2px solid #0066FF;
  outline-offset: 2px;
}

button:focus:not(:focus-visible) {
  outline: none;
}`,
    explanation: 'Keyboard users need to see which element is focused. Never remove focus indicators without providing an alternative.',
    tips: [
      'Use :focus-visible for keyboard-only focus styles',
      'Ensure focus indicator has sufficient contrast',
      'Consider focus order and logical flow',
      'Test navigation with keyboard only'
    ]
  },
  'missing-aria-landmarks': {
    title: 'Missing ARIA Landmarks',
    description: 'Page should use landmarks to define page regions.',
    wcag: 'WCAG 1.3.1',
    level: 'A',
    beforeCode: `<div class="header">...</div>
<div class="content">...</div>
<div class="footer">...</div>`,
    afterCode: `<header>...</header>
<main>...</main>
<footer>...</footer>`,
    explanation: 'Landmarks help screen reader users navigate to different sections of the page quickly.',
    tips: [
      'Use semantic HTML elements (header, main, nav, footer)',
      'Or use ARIA roles (role="banner", role="main", etc.)',
      'Each page should have one main landmark',
      'Label repeated landmarks (e.g., multiple nav elements)'
    ]
  },
  'no-table-headers': {
    title: 'Data Table Missing Headers',
    description: 'Data tables should have proper header cells.',
    wcag: 'WCAG 1.3.1',
    level: 'A',
    beforeCode: `<table>
  <tr>
    <td>Name</td>
    <td>Email</td>
  </tr>
  <tr>
    <td>John</td>
    <td>john@example.com</td>
  </tr>
</table>`,
    afterCode: `<table>
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John</td>
      <td>john@example.com</td>
    </tr>
  </tbody>
</table>`,
    explanation: 'Table headers help screen readers associate data cells with their corresponding headers.',
    tips: [
      'Use <th> for header cells, <td> for data cells',
      'Add scope="col" for column headers, scope="row" for row headers',
      'Use <caption> to describe the table\'s purpose',
      'For complex tables, use id and headers attributes'
    ]
  }
};

export default function FixSuggestionsPanel({ issue, onClose }) {
  const [copiedSection, setCopiedSection] = useState(null);
  const [expandedTips, setExpandedTips] = useState(true);

  // Find the best matching suggestion
  const suggestion = useMemo(() => {
    if (!issue) return null;

    // Try to match by issue type or code
    const issueType = issue.type || issue.code || '';
    const issueMessage = (issue.message || issue.description || '').toLowerCase();

    // Direct match
    if (FIX_SUGGESTIONS[issueType]) {
      return FIX_SUGGESTIONS[issueType];
    }

    // Fuzzy match based on keywords
    if (issueMessage.includes('alt') && issueMessage.includes('missing')) {
      return FIX_SUGGESTIONS['missing-alt'];
    }
    if (issueMessage.includes('label') && issueMessage.includes('missing')) {
      return FIX_SUGGESTIONS['missing-label'];
    }
    if (issueMessage.includes('contrast')) {
      return FIX_SUGGESTIONS['low-contrast'];
    }
    if (issueMessage.includes('heading') && issueMessage.includes('skip')) {
      return FIX_SUGGESTIONS['skip-heading-level'];
    }
    if (issueMessage.includes('lang')) {
      return FIX_SUGGESTIONS['missing-lang'];
    }
    if (issueMessage.includes('focus')) {
      return FIX_SUGGESTIONS['missing-focus-indicator'];
    }
    if (issueMessage.includes('link') && issueMessage.includes('text')) {
      return FIX_SUGGESTIONS['missing-link-text'];
    }
    if (issueMessage.includes('button') && (issueMessage.includes('text') || issueMessage.includes('name'))) {
      return FIX_SUGGESTIONS['missing-button-text'];
    }

    return null;
  }, [issue]);

  const handleCopy = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success('Code copied!');
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const getSeverityIcon = (level) => {
    switch (level) {
      case 'A':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'AA':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!suggestion) {
    return (
      <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-charcoal-900 dark:text-white">Fix Suggestion</h2>
          {onClose && (
            <button onClick={onClose} className="p-2 text-charcoal-400 hover:text-charcoal-600 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-charcoal-100 dark:bg-charcoal-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-charcoal-400" />
          </div>
          <p className="text-charcoal-600 dark:text-charcoal-400">
            No specific fix suggestion available for this issue.
          </p>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-500 mt-1">
            {issue?.message || 'Check WCAG guidelines for remediation steps.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-charcoal-100 dark:border-charcoal-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-charcoal-900 dark:text-white">{suggestion.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-xs font-medium text-charcoal-500 dark:text-charcoal-400">
                  {getSeverityIcon(suggestion.level)}
                  {suggestion.wcag}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  suggestion.level === 'A'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : suggestion.level === 'AA'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}>
                  Level {suggestion.level}
                </span>
              </div>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Description */}
        <p className="text-charcoal-600 dark:text-charcoal-300">{suggestion.description}</p>

        {/* Code Comparison */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Before */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Before (Problematic)
              </span>
              <button
                onClick={() => handleCopy(suggestion.beforeCode, 'before')}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded transition-colors"
              >
                {copiedSection === 'before' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm overflow-x-auto text-charcoal-800 dark:text-charcoal-200 font-mono">
              {suggestion.beforeCode}
            </pre>
          </div>

          {/* After */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4" />
                After (Fixed)
              </span>
              <button
                onClick={() => handleCopy(suggestion.afterCode, 'after')}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded transition-colors"
              >
                {copiedSection === 'after' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <pre className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-sm overflow-x-auto text-charcoal-800 dark:text-charcoal-200 font-mono">
              {suggestion.afterCode}
            </pre>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-charcoal-50 dark:bg-charcoal-900/50 rounded-xl p-4">
          <p className="text-charcoal-700 dark:text-charcoal-300">{suggestion.explanation}</p>
        </div>

        {/* Tips */}
        {suggestion.tips && suggestion.tips.length > 0 && (
          <div>
            <button
              onClick={() => setExpandedTips(!expandedTips)}
              className="flex items-center gap-2 text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-3"
            >
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Best Practices
              {expandedTips ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedTips && (
              <ul className="space-y-2">
                {suggestion.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Resources */}
        {suggestion.resources && suggestion.resources.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2 flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              Learn More
            </h4>
            <div className="flex flex-wrap gap-2">
              {suggestion.resources.map((resource, index) => (
                <a
                  key={index}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  {resource.title}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Get all available fix suggestions
export function getFixSuggestions() {
  return Object.entries(FIX_SUGGESTIONS).map(([id, suggestion]) => ({
    id,
    ...suggestion
  }));
}

// Check if a fix suggestion exists for an issue type
export function hasFixSuggestion(issueType) {
  return !!FIX_SUGGESTIONS[issueType];
}
