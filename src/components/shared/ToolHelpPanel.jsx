import { useState, useEffect } from 'react';
import {
  HelpCircle,
  X,
  ChevronRight,
  Lightbulb,
  Target,
  ExternalLink,
  Video,
  BookOpen,
  Keyboard
} from 'lucide-react';

// Tool-specific help content
const TOOL_HELP = {
  planner: {
    title: 'Content Planner',
    subtitle: '321-item SEO checklist',
    tips: [
      {
        title: 'Assign Team Members',
        description: 'Click the avatar icon on any task to assign it to a team member. They\'ll receive a notification.'
      },
      {
        title: 'Filter by Phase',
        description: 'Use the phase tabs to focus on Discovery, Design, Development, Launch, or Post-Launch tasks.'
      },
      {
        title: 'Track Progress',
        description: 'The progress bar shows overall completion. Green indicates completed items, yellow is in progress.'
      },
      {
        title: 'Export Reports',
        description: 'Export your checklist progress to PDF or Excel for stakeholder reporting.'
      }
    ],
    shortcuts: [
      { key: '/', action: 'Search tasks' },
      { key: 'f', action: 'Toggle filters' },
      { key: 'n', action: 'Create new task' }
    ],
    resources: [
      { title: 'Getting Started Guide', url: '/help/resources?topic=planner-basics', type: 'doc' },
      { title: 'Video Tutorial', url: '/help/resources?topic=planner-video', type: 'video' }
    ]
  },
  audit: {
    title: 'Technical Audit',
    subtitle: 'Screaming Frog analyzer',
    tips: [
      {
        title: 'Upload Screaming Frog Export',
        description: 'Export your crawl from Screaming Frog as .xlsx and upload it here for analysis.'
      },
      {
        title: 'Review Categories',
        description: '31 audit categories covering Technical SEO, On-Page, Performance, and more.'
      },
      {
        title: 'AI Recommendations',
        description: 'Get Claude-powered fix recommendations for each issue found.'
      },
      {
        title: 'Share Reports',
        description: 'Generate shareable links to send audit results to clients or team members.'
      }
    ],
    shortcuts: [
      { key: 'u', action: 'Upload file' },
      { key: 'e', action: 'Export report' },
      { key: 's', action: 'Share audit' }
    ],
    resources: [
      { title: 'Audit Categories Explained', url: '/help/resources?topic=audit-categories', type: 'doc' }
    ]
  },
  accessibility: {
    title: 'Accessibility Analyzer',
    subtitle: 'WCAG 2.2 compliance',
    tips: [
      {
        title: 'Enter URL to Analyze',
        description: 'Paste any public URL to run a comprehensive accessibility audit.'
      },
      {
        title: 'Understand Impact Levels',
        description: 'Critical issues block users, Serious issues significantly impair, Moderate issues cause difficulties.'
      },
      {
        title: 'View Fix Suggestions',
        description: 'Expand any violation to see AI-generated code suggestions for fixing the issue.'
      },
      {
        title: 'Export VPAT',
        description: 'Generate a Voluntary Product Accessibility Template for compliance documentation.'
      }
    ],
    shortcuts: [
      { key: 'Enter', action: 'Start audit' },
      { key: 'Tab', action: 'Navigate results' }
    ],
    resources: [
      { title: 'WCAG 2.2 Guidelines', url: 'https://www.w3.org/TR/WCAG22/', type: 'external' },
      { title: 'Understanding A11y', url: '/help/resources?topic=accessibility-basics', type: 'doc' }
    ]
  },
  'image-alt': {
    title: 'Image Alt Generator',
    subtitle: 'AI-powered alt text',
    tips: [
      {
        title: 'Upload Images',
        description: 'Drag and drop up to 100 images at once for batch processing.'
      },
      {
        title: 'Review Generated Alt Text',
        description: 'Claude Vision analyzes each image and generates descriptive, SEO-friendly alt text.'
      },
      {
        title: 'Edit Before Saving',
        description: 'Click to edit any generated alt text to better match your content strategy.'
      },
      {
        title: 'Download with EXIF',
        description: 'Export images with alt text embedded in EXIF metadata.'
      }
    ],
    shortcuts: [
      { key: 'V', action: 'Paste image' },
      { key: 'Space', action: 'Toggle selection' }
    ],
    resources: [
      { title: 'Writing Good Alt Text', url: '/help/resources?topic=alt-text-guide', type: 'doc' }
    ]
  },
  'meta-generator': {
    title: 'Meta Data Generator',
    subtitle: 'SEO metadata from content',
    tips: [
      {
        title: 'Upload Documents',
        description: 'Upload DOCX, PDF, HTML, or TXT files to extract content for metadata generation.'
      },
      {
        title: 'Preview SERP Appearance',
        description: 'See how your title and description will appear in Google search results.'
      },
      {
        title: 'Social Card Preview',
        description: 'Check how your OG tags will display on Twitter and Facebook.'
      },
      {
        title: 'Copy HTML Code',
        description: 'One-click copy of generated meta tags ready to paste into your <head>.'
      }
    ],
    shortcuts: [
      { key: 'c', action: 'Copy meta tags' },
      { key: 'r', action: 'Regenerate' }
    ],
    resources: [
      { title: 'Meta Tag Best Practices', url: '/help/resources?topic=meta-tags', type: 'doc' }
    ]
  },
  'schema-generator': {
    title: 'Schema Generator',
    subtitle: 'JSON-LD structured data',
    tips: [
      {
        title: 'Paste HTML Content',
        description: 'Paste your page HTML to analyze and generate appropriate schema.org markup.'
      },
      {
        title: 'Choose Schema Type',
        description: 'Let AI auto-detect or manually select from 50+ schema types like Article, Product, FAQ.'
      },
      {
        title: 'Validate with Google',
        description: 'Test generated JSON-LD directly in Google\'s Rich Results Test.'
      },
      {
        title: 'Preview Rich Results',
        description: 'See how your schema will display as rich results in search.'
      }
    ],
    shortcuts: [
      { key: 'v', action: 'Validate schema' },
      { key: 'c', action: 'Copy JSON-LD' }
    ],
    resources: [
      { title: 'Schema.org Types', url: 'https://schema.org/docs/full.html', type: 'external' },
      { title: 'Rich Results Guide', url: '/help/resources?topic=structured-data', type: 'doc' }
    ]
  },
  readability: {
    title: 'AI Readability Checker',
    subtitle: 'AI search readability analyzer',
    tips: [
      {
        title: 'Analyze by URL',
        description: 'Enter any public URL to analyze how AI models read and interpret your content.'
      },
      {
        title: 'Upload Screaming Frog HTML',
        description: 'Upload rendered HTML exports from Screaming Frog for JavaScript-heavy pages.'
      },
      {
        title: 'Export PDF Reports',
        description: 'Generate professional PDF reports with scores, recommendations, and LLM analysis.'
      }
    ],
    shortcuts: [
      { key: 'Enter', action: 'Start analysis' },
      { key: 'e', action: 'Export report' },
      { key: 's', action: 'Share results' }
    ],
    resources: [
      { title: 'Understanding AI Readability', url: '/help/resources?topic=ai-readability', type: 'doc' },
      { title: 'GEO Optimization Guide', url: '/help/resources?topic=geo-guide', type: 'doc' }
    ]
  }
};

// Get tool ID from path
function getToolIdFromPath(pathname) {
  if (pathname.startsWith('/planner')) return 'planner';
  if (pathname.startsWith('/audit')) return 'audit';
  if (pathname.startsWith('/accessibility')) return 'accessibility';
  if (pathname.startsWith('/image-alt')) return 'image-alt';
  if (pathname.startsWith('/meta-generator')) return 'meta-generator';
  if (pathname.startsWith('/schema-generator')) return 'schema-generator';
  if (pathname.startsWith('/readability')) return 'readability';
  return null;
}

export default function ToolHelpPanel({ toolId, isOpen, onClose }) {
  const help = TOOL_HELP[toolId];

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !help) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Panel */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-charcoal-800 shadow-2xl z-50 flex flex-col animate-slide-in-right"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-panel-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-charcoal-100 dark:border-charcoal-700 bg-gradient-to-r from-primary-50 to-cyan-50 dark:from-primary-900/20 dark:to-cyan-900/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="help-panel-title" className="text-lg font-bold text-charcoal-900 dark:text-white">{help.title} Help</h2>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{help.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
            aria-label="Close help panel"
          >
            <X className="w-5 h-5 text-charcoal-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tips Section */}
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-charcoal-500 uppercase tracking-wide mb-4">
              <Target className="w-4 h-4" />
              Quick Tips
            </h3>
            <div className="space-y-3">
              {help.tips.map((tip, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-charcoal-50 dark:bg-charcoal-700 rounded-xl border border-charcoal-100 dark:border-charcoal-600 hover:bg-charcoal-100 dark:hover:bg-charcoal-600 transition-colors"
                >
                  <h4 className="font-medium text-charcoal-900 dark:text-white mb-1">{tip.title}</h4>
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-300">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          {help.shortcuts && help.shortcuts.length > 0 && (
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-charcoal-500 uppercase tracking-wide mb-4">
                <Keyboard className="w-4 h-4" />
                Keyboard Shortcuts
              </h3>
              <div className="bg-charcoal-50 dark:bg-charcoal-700 rounded-xl p-4 border border-charcoal-100 dark:border-charcoal-600">
                <div className="space-y-2">
                  {help.shortcuts.map((shortcut, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-sm text-charcoal-600 dark:text-charcoal-300">{shortcut.action}</span>
                      <kbd className="px-2 py-1 bg-white dark:bg-charcoal-600 border border-charcoal-200 dark:border-charcoal-500 rounded text-xs font-mono text-charcoal-700 dark:text-charcoal-200 shadow-sm">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resources */}
          {help.resources && help.resources.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-charcoal-500 uppercase tracking-wide mb-4">
                <BookOpen className="w-4 h-4" />
                Learn More
              </h3>
              <div className="space-y-2">
                {help.resources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target={resource.type === 'external' ? '_blank' : undefined}
                    rel={resource.type === 'external' ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-charcoal-700 border border-charcoal-200 dark:border-charcoal-600 rounded-xl hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 group-hover:bg-primary-100 flex items-center justify-center transition-colors">
                      {resource.type === 'video' ? (
                        <Video className="w-5 h-5 text-charcoal-500 group-hover:text-primary-600" />
                      ) : resource.type === 'external' ? (
                        <ExternalLink className="w-5 h-5 text-charcoal-500 group-hover:text-primary-600" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-charcoal-500 group-hover:text-primary-600" />
                      )}
                    </div>
                    <span className="flex-1 text-sm font-medium text-charcoal-700 group-hover:text-primary-700">
                      {resource.title}
                    </span>
                    <ChevronRight className="w-4 h-4 text-charcoal-400 group-hover:text-primary-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-charcoal-100 dark:border-charcoal-700 bg-charcoal-50 dark:bg-charcoal-900">
          <button
            onClick={onClose}
            className="w-full btn btn-primary"
          >
            Got It
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Help button trigger for tool pages
 */
export function ToolHelpButton({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 bg-charcoal-100 hover:bg-charcoal-200 rounded-xl text-sm text-charcoal-600 transition-colors ${className}`}
      aria-label="Open tool help"
    >
      <HelpCircle className="w-4 h-4" />
      <span>Help</span>
    </button>
  );
}

/**
 * Hook to use tool help panel
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useToolHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev)
  };
}

// eslint-disable-next-line react-refresh/only-export-components
export { TOOL_HELP, getToolIdFromPath };
