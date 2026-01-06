/**
 * Changelog Data
 * Keep entries sorted by date (newest first)
 */

export const changelog = [
  {
    version: '3.1.0',
    date: '2026-01-06',
    title: 'New SEO Generator Tools',
    highlights: [
      'Image Alt Text Generator with Claude Vision AI',
      'Meta Data Generator for SEO metadata',
      'Structured Data Generator for JSON-LD'
    ],
    changes: [
      {
        type: 'feature',
        title: 'Image Alt Text Generator',
        description: 'AI-powered alt text generation using Claude Vision. Batch process up to 100 images with EXIF metadata embedding and SEO-friendly filename generation.'
      },
      {
        type: 'feature',
        title: 'Meta Data Generator',
        description: 'Generate SEO metadata from documents (DOCX, PDF, HTML, Markdown, TXT). Includes SERP preview, social card previews, and HTML code export.'
      },
      {
        type: 'feature',
        title: 'Structured Data Generator',
        description: 'AI-powered JSON-LD schema markup generator supporting 50+ schema.org types with rich snippet preview and validation.'
      },
      {
        type: 'improvement',
        title: 'Quick Action Cards',
        description: 'Added quick action shortcuts on the home page for one-click access to all tools.'
      },
      {
        type: 'feature',
        title: 'Feedback Widget',
        description: 'New floating feedback button to easily submit bug reports, feature requests, and general feedback.'
      }
    ]
  },
  {
    version: '3.0.0',
    date: '2026-01-05',
    title: 'Accessibility Analyzer Launch',
    highlights: [
      'WCAG 2.2 compliance auditing',
      '93 Axe-core rules support',
      'AI-powered fix suggestions'
    ],
    changes: [
      {
        type: 'feature',
        title: 'Accessibility Analyzer',
        description: 'Complete WCAG 2.2 compliance auditing tool with 87 success criteria across all conformance levels (A, AA, AAA).'
      },
      {
        type: 'feature',
        title: 'AI Fix Suggestions',
        description: 'Get AI-powered suggestions for fixing accessibility violations with code examples.'
      },
      {
        type: 'feature',
        title: 'Accessibility Report Export',
        description: 'Export comprehensive accessibility reports to PDF and Excel formats.'
      },
      {
        type: 'improvement',
        title: 'Enhanced Dashboard',
        description: 'Redesigned home dashboard with better tool discovery and statistics overview.'
      }
    ]
  },
  {
    version: '2.5.0',
    date: '2025-12-20',
    title: 'Technical Audit Enhancements',
    highlights: [
      'Improved audit categorization',
      'Shareable audit links',
      'Better export options'
    ],
    changes: [
      {
        type: 'feature',
        title: 'Shareable Audit Links',
        description: 'Generate public links to share audit results with clients and team members.'
      },
      {
        type: 'improvement',
        title: 'Export Improvements',
        description: 'Enhanced PDF and Excel exports with better formatting and additional data points.'
      },
      {
        type: 'fix',
        title: 'Audit Parsing',
        description: 'Fixed issues with parsing certain Screaming Frog export formats.'
      }
    ]
  },
  {
    version: '2.0.0',
    date: '2025-11-15',
    title: 'Content Strategy Portal Rebrand',
    highlights: [
      'New design system',
      'Improved navigation',
      'Performance optimizations'
    ],
    changes: [
      {
        type: 'feature',
        title: 'New Design System',
        description: 'Complete UI redesign with modern design system, improved accessibility, and dark mode preparation.'
      },
      {
        type: 'improvement',
        title: 'Navigation Redesign',
        description: 'New dropdown navigation with better tool discovery and help resources.'
      },
      {
        type: 'improvement',
        title: 'Performance',
        description: 'Lazy loading of tool modules for faster initial page load.'
      }
    ]
  },
  {
    version: '1.5.0',
    date: '2025-10-01',
    title: 'Team Collaboration Features',
    highlights: [
      'Team management',
      '@mentions in comments',
      'Task assignments'
    ],
    changes: [
      {
        type: 'feature',
        title: 'Team Management',
        description: 'Invite team members, assign roles, and manage permissions.'
      },
      {
        type: 'feature',
        title: '@Mentions',
        description: 'Mention team members in comments to notify them about tasks.'
      },
      {
        type: 'feature',
        title: 'Task Assignments',
        description: 'Assign checklist items to team members with due dates.'
      }
    ]
  }
];

/**
 * Get the latest changelog entry
 */
export function getLatestRelease() {
  return changelog[0];
}

/**
 * Get changelog entries for a specific version
 */
export function getChangelogByVersion(version) {
  return changelog.find(entry => entry.version === version);
}

/**
 * Get all releases since a specific date
 */
export function getReleasesSince(dateString) {
  const targetDate = new Date(dateString);
  return changelog.filter(entry => new Date(entry.date) > targetDate);
}

/**
 * Get the count of new releases since last viewed
 */
export function getUnreadReleasesCount(lastViewedVersion) {
  if (!lastViewedVersion) return changelog.length;
  const index = changelog.findIndex(entry => entry.version === lastViewedVersion);
  return index === -1 ? changelog.length : index;
}

export default changelog;
