import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

// Route configuration for breadcrumbs
const ROUTE_CONFIG = {
  '/': { label: 'Home', icon: Home },
  '/planner': { label: 'Content Planner', parent: '/' },
  '/planner/new': { label: 'New Project', parent: '/planner' },
  '/planner/progress': { label: 'Progress Dashboard', parent: '/planner' },
  '/audit': { label: 'Technical Audit', parent: '/' },
  '/accessibility': { label: 'Accessibility Analyzer', parent: '/' },
  '/image-alt': { label: 'Image Alt Generator', parent: '/' },
  '/meta-generator': { label: 'Meta Generator', parent: '/' },
  '/schema-generator': { label: 'Schema Generator', parent: '/' },
  '/my-tasks': { label: 'My Tasks', parent: '/' },
  '/team': { label: 'Team Management', parent: '/' },
  '/activity': { label: 'Activity', parent: '/' },
  '/export': { label: 'Export Hub', parent: '/' },
  '/profile': { label: 'Profile', parent: '/' },
  '/settings': { label: 'Settings', parent: '/' },
  '/help/resources': { label: 'Resource Library', parent: '/' },
  '/help/glossary': { label: 'Glossary', parent: '/' },
};

// Pattern matchers for dynamic routes
const DYNAMIC_ROUTES = [
  { pattern: /^\/planner\/projects\/([^/]+)$/, label: 'Project', parent: '/planner' },
  { pattern: /^\/planner\/projects\/([^/]+)\/health$/, label: 'Health Report', parent: (match) => `/planner/projects/${match[1]}` },
  { pattern: /^\/audit\/([^/]+)$/, label: 'Audit Results', parent: '/audit' },
  { pattern: /^\/profile\/([^/]+)$/, label: 'User Profile', parent: '/' },
];

function getBreadcrumbData(pathname) {
  // Check static routes first
  if (ROUTE_CONFIG[pathname]) {
    return ROUTE_CONFIG[pathname];
  }

  // Check dynamic routes
  for (const route of DYNAMIC_ROUTES) {
    const match = pathname.match(route.pattern);
    if (match) {
      const parent = typeof route.parent === 'function' ? route.parent(match) : route.parent;
      return { label: route.label, parent };
    }
  }

  return null;
}

function buildBreadcrumbTrail(pathname) {
  const trail = [];
  let currentPath = pathname;

  while (currentPath) {
    const data = getBreadcrumbData(currentPath);
    if (data) {
      trail.unshift({ path: currentPath, ...data });
      currentPath = data.parent;
    } else {
      break;
    }
  }

  return trail;
}

export default function Breadcrumb({
  items, // Optional custom items array
  className = '',
  showHome = true,
  separator = 'chevron', // 'chevron' | 'slash'
  projectName = null, // Optional project name to display
  auditDomain = null, // Optional audit domain to display
}) {
  const location = useLocation();

  // Use custom items or build from current route
  const breadcrumbItems = items || buildBreadcrumbTrail(location.pathname);

  // Don't show on home page
  if (location.pathname === '/' && !items) {
    return null;
  }

  // Replace dynamic labels with actual names if provided
  const processedItems = breadcrumbItems.map(item => {
    let label = item.label;

    if (item.label === 'Project' && projectName) {
      label = projectName;
    } else if (item.label === 'Audit Results' && auditDomain) {
      label = auditDomain;
    }

    return { ...item, label };
  });

  const SeparatorIcon = separator === 'chevron' ? ChevronRight : () => <span className="mx-1">/</span>;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-sm ${className}`}
    >
      <ol className="flex items-center flex-wrap gap-1">
        {processedItems.map((item, index) => {
          const isLast = index === processedItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={item.path} className="flex items-center">
              {index > 0 && (
                <SeparatorIcon className="w-4 h-4 text-charcoal-400 dark:text-charcoal-500 mx-1 flex-shrink-0" />
              )}

              {isLast ? (
                <span
                  className="text-charcoal-900 dark:text-charcoal-100 font-medium flex items-center gap-1.5"
                  aria-current="page"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span className="truncate max-w-[200px]">{item.label}</span>
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-charcoal-500 dark:text-charcoal-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5"
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span className="truncate max-w-[150px]">{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Compact version for tight spaces
export function BreadcrumbCompact({ className = '' }) {
  const location = useLocation();
  const trail = buildBreadcrumbTrail(location.pathname);

  if (trail.length <= 1) return null;

  const current = trail[trail.length - 1];
  const parent = trail[trail.length - 2];

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Link
        to={parent.path}
        className="text-charcoal-500 dark:text-charcoal-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        {parent.label}
      </Link>
      <ChevronRight className="w-4 h-4 text-charcoal-400 dark:text-charcoal-500" />
      <span className="text-charcoal-900 dark:text-charcoal-100 font-medium">
        {current.label}
      </span>
    </div>
  );
}

// Back button with breadcrumb context
export function BreadcrumbBack({ className = '' }) {
  const location = useLocation();
  const trail = buildBreadcrumbTrail(location.pathname);

  if (trail.length <= 1) return null;

  const parent = trail[trail.length - 2];

  return (
    <Link
      to={parent.path}
      className={`inline-flex items-center gap-2 text-sm text-charcoal-500 dark:text-charcoal-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors ${className}`}
    >
      <ChevronRight className="w-4 h-4 rotate-180" />
      <span>Back to {parent.label}</span>
    </Link>
  );
}
