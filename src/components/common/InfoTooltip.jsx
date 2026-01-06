import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { getTooltip } from '../../lib/tooltips';

/**
 * InfoTooltip - A contextual help tooltip component
 *
 * @param {string} tipKey - The tooltip key from the TOOLTIPS library
 * @param {string} text - Alternative: direct tooltip text instead of using key
 * @param {string} className - Additional CSS classes
 * @param {string} size - Icon size: 'sm' (14px), 'md' (16px), 'lg' (18px)
 * @param {string} position - Tooltip position: 'top', 'bottom', 'left', 'right'
 */
const InfoTooltip = ({
  tipKey,
  text,
  className = '',
  size = 'sm',
  position = 'top'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const tooltipText = text || getTooltip(tipKey);

  if (!tooltipText) return null;

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5'
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-charcoal-800 dark:border-t-charcoal-700 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-charcoal-800 dark:border-b-charcoal-700 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-charcoal-800 dark:border-l-charcoal-700 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-charcoal-800 dark:border-r-charcoal-700 border-t-transparent border-b-transparent border-l-transparent'
  };

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      <button
        type="button"
        className="text-charcoal-400 hover:text-charcoal-600 dark:text-charcoal-500 dark:hover:text-charcoal-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1 rounded-full transition-colors"
        aria-label={tooltipText}
        tabIndex={0}
      >
        <HelpCircle className={sizeClasses[size]} />
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
        >
          <div className="bg-charcoal-800 dark:bg-charcoal-700 text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs whitespace-normal">
            {tooltipText}
          </div>
          <div
            className={`absolute border-4 ${arrowClasses[position]}`}
            style={{ borderWidth: '6px' }}
          />
        </div>
      )}
    </span>
  );
};

export default InfoTooltip;
