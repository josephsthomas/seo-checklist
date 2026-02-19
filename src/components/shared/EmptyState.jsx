import { Info } from 'lucide-react';

/**
 * Shared EmptyState component
 * Consistent empty/no-data UI across the application.
 *
 * @param {React.ComponentType} icon - Lucide icon (default: Info)
 * @param {string} title - Heading text (required)
 * @param {string} description - Subtitle/explanation (optional)
 * @param {{ label: string, onClick: Function }} action - CTA button (optional)
 * @param {boolean} compact - Reduced padding variant
 * @param {boolean} large - Large heading variant (for prominent empty states)
 * @param {string} className - Additional CSS classes
 */
export default function EmptyState({
  icon: Icon = Info,
  title,
  description,
  action,
  compact = false,
  large = false,
  className = '',
}) {
  return (
    <div
      className={`text-center ${compact ? 'py-8' : 'py-12'} bg-gray-50 dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 ${className}`}
    >
      <Icon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" aria-hidden="true" />
      {large ? (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
      ) : (
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
      )}
      {description && (
        <p className={`text-xs text-gray-400 dark:text-gray-500 ${large ? '' : 'mt-1'} max-w-md mx-auto`}>
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-charcoal-800"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
