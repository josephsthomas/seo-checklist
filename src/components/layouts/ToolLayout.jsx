import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { getToolByPath } from '../../config/tools';

/**
 * Breadcrumb item component
 */
function BreadcrumbItem({ to, label, icon: Icon, isLast }) {
  if (isLast) {
    return (
      <span className="flex items-center gap-2 text-charcoal-900 font-medium">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </span>
    );
  }

  return (
    <>
      <Link
        to={to}
        className="flex items-center gap-2 text-charcoal-500 hover:text-charcoal-700 transition-colors"
      >
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </Link>
      <ChevronRight className="w-4 h-4 text-charcoal-300" />
    </>
  );
}

/**
 * ToolLayout - Layout for tool pages with breadcrumbs and consistent styling
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {Array} props.breadcrumbs - Custom breadcrumb items [{label, to, icon}]
 * @param {string} props.title - Optional title override
 * @param {React.ReactNode} props.actions - Optional action buttons
 * @param {boolean} props.showBreadcrumbs - Whether to show breadcrumbs (default: true)
 * @param {boolean} props.stickyHeader - Whether the header should be sticky (default: false)
 * @param {string} props.headerClassName - Additional classes for header
 * @param {string} props.className - Additional classes for container
 */
export default function ToolLayout({
  children,
  breadcrumbs: customBreadcrumbs,
  title,
  actions,
  showBreadcrumbs = true,
  stickyHeader = false,
  headerClassName = '',
  className = ''
}) {
  const location = useLocation();
  const currentTool = getToolByPath(location.pathname);

  // Generate breadcrumbs from current path if not provided
  const breadcrumbs = customBreadcrumbs || generateBreadcrumbs(location.pathname, currentTool);

  return (
    <div className={`min-h-screen bg-gradient-to-b from-charcoal-50 to-white ${className}`}>
      {/* Header with Breadcrumbs */}
      {(showBreadcrumbs || actions || title) && (
        <div
          className={`
            bg-white/80 backdrop-blur-xl border-b border-charcoal-100
            ${stickyHeader ? 'sticky top-16 z-40' : ''}
            ${headerClassName}
          `}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              {/* Breadcrumbs */}
              {showBreadcrumbs && breadcrumbs.length > 0 && (
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
                  {breadcrumbs.map((crumb, index) => (
                    <BreadcrumbItem
                      key={crumb.to || index}
                      to={crumb.to}
                      label={crumb.label}
                      icon={crumb.icon}
                      isLast={index === breadcrumbs.length - 1}
                    />
                  ))}
                </nav>
              )}

              {/* Title (when no breadcrumbs) */}
              {!showBreadcrumbs && title && (
                <h1 className="text-xl font-bold text-charcoal-900">{title}</h1>
              )}

              {/* Actions */}
              {actions && (
                <div className="flex items-center gap-3">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}

/**
 * Generate breadcrumbs from path
 */
function generateBreadcrumbs(pathname, tool) {
  const crumbs = [
    { label: 'Home', to: '/', icon: Home }
  ];

  if (tool) {
    crumbs.push({
      label: tool.shortName || tool.name,
      to: tool.path,
      icon: tool.icon
    });
  }

  // Add additional path segments
  const segments = pathname.split('/').filter(Boolean);

  // Handle nested routes like /planner/projects/:id
  if (segments.length > 1 && tool) {
    if (segments[1] === 'projects' && segments[2]) {
      crumbs.push({
        label: 'Project',
        to: pathname
      });
    } else if (segments[1] === 'new') {
      crumbs.push({
        label: 'New Project',
        to: pathname
      });
    } else if (segments[1] === 'shared') {
      crumbs.push({
        label: 'Shared Audit',
        to: pathname
      });
    }
  }

  return crumbs;
}

/**
 * ToolHeader - Standalone header component for tools
 */
export function ToolHeader({
  icon: Icon,
  title,
  subtitle,
  badge,
  actions,
  color = 'primary',
  className = ''
}) {
  const colorVariants = {
    primary: 'from-primary-500 to-primary-600 shadow-primary-500/25',
    cyan: 'from-cyan-500 to-cyan-600 shadow-cyan-500/25',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/25',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25'
  };

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 ${className}`}>
      <div className="flex items-center gap-5">
        {Icon && (
          <div className={`w-16 h-16 bg-gradient-to-br ${colorVariants[color]} rounded-2xl flex items-center justify-center shadow-xl`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900">
              {title}
            </h1>
            {badge && (
              <span className="badge badge-info">{badge}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-charcoal-600 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

export { ToolLayout };
