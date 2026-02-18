/**
 * ReadabilityCheckItem
 * Individual check result display with status icon, severity, expandable details.
 * BRD: US-2.2.3, check result display
 */

import React, { useState, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  ChevronDown,
  ChevronRight,
  Copy,
} from 'lucide-react';
import toast from 'react-hot-toast';

/** Jargon glossary for technical terms */
const JARGON = {
  'JSON-LD': 'JavaScript Object Notation for Linked Data — a structured data format',
  'Schema.org': 'A shared vocabulary for structured data markup on web pages',
  'Flesch Reading Ease': 'A formula measuring text readability (0-100, higher = easier)',
  'robots.txt': 'A file that tells search engine crawlers which pages to access',
  'meta description': 'An HTML tag summarizing a page for search engine results',
  'canonical URL': 'The preferred URL for a page when duplicates exist',
  'Open Graph': 'A protocol for enriching link previews on social media',
  'hreflang': 'An HTML attribute indicating the language of a linked page',
};

/** Wrap known jargon terms in title-bearing abbr tags */
function annotateJargon(text) {
  if (!text) return text;
  let result = text;
  for (const [term, definition] of Object.entries(JARGON)) {
    if (result.includes(term)) {
      result = result.replace(term, `<abbr title="${definition}" class="underline decoration-dotted cursor-help">${term}</abbr>`);
    }
  }
  return result === text ? null : result;
}

const STATUS_CONFIG = {
  pass: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-500 dark:text-emerald-400',
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/10',
    label: 'Pass',
  },
  warn: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-900/10',
    label: 'Warning',
  },
  fail: {
    icon: XCircle,
    iconClass: 'text-red-500 dark:text-red-400',
    bgClass: 'bg-red-50 dark:bg-red-900/10',
    label: 'Fail',
  },
  na: {
    icon: Info,
    iconClass: 'text-gray-400 dark:text-gray-500',
    bgClass: 'bg-gray-50 dark:bg-charcoal-700/50',
    label: 'N/A',
  },
};

const SEVERITY_BADGES = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  info: 'bg-gray-100 text-gray-700 dark:bg-charcoal-700 dark:text-gray-300',
};

function ReadabilityCheckItem({ check, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation();
    const text = `${check.id}: ${check.title || check.name} — ${(check.status || '').toUpperCase()}${check.details ? '\n' + check.details : ''}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Check result copied');
    } catch { /* noop */ }
  }, [check]);

  if (!check) return null;

  const status = STATUS_CONFIG[check.status] || STATUS_CONFIG.na;
  const StatusIcon = status.icon;
  const hasDetails = check.description || check.details || check.recommendation ||
    (check.affectedElements && check.affectedElements.length > 0) ||
    check.codeSnippet;
  const isExpandable = hasDetails && (check.status === 'fail' || check.status === 'warn' || defaultExpanded);
  const itemId = `check-${check.id || 'unknown'}`;
  const panelId = `${itemId}-panel`;

  return (
    <div
      className={`rounded-lg border transition-colors ${
        expanded
          ? 'border-gray-200 dark:border-charcoal-600'
          : 'border-gray-100 dark:border-charcoal-700'
      } ${status.bgClass}`}
    >
      {/* Header */}
      <div
        className={`flex items-start gap-3 p-3 ${
          isExpandable ? 'cursor-pointer' : ''
        }`}
        {...(isExpandable
          ? {
              role: 'button',
              tabIndex: 0,
              'aria-expanded': expanded,
              'aria-controls': panelId,
              onClick: () => setExpanded(!expanded),
              onKeyDown: (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setExpanded(!expanded);
                }
              },
            }
          : {})}
      >
        {/* Status icon */}
        <StatusIcon
          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${status.iconClass}`}
          aria-hidden="true"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Check ID */}
              {check.id && (
                <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                  {check.id}
                </span>
              )}
              {/* Title (with jargon tooltips) */}
              {annotateJargon(check.title || check.name || 'Unknown Check') ? (
                <span
                  className="text-sm font-medium text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{ __html: annotateJargon(check.title || check.name || 'Unknown Check') }}
                />
              ) : (
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {check.title || check.name || 'Unknown Check'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-charcoal-600 transition-colors focus:outline-none focus:ring-1 focus:ring-teal-500"
                title="Copy check result"
                aria-label={`Copy ${check.id} result`}
              >
                <Copy className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" aria-hidden="true" />
              </button>
              {/* Severity badge */}
              {check.severity && (
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded capitalize ${
                    SEVERITY_BADGES[check.severity] || SEVERITY_BADGES.info
                  }`}
                >
                  {check.severity}
                </span>
              )}

              {/* Status label for screen readers */}
              <span className="sr-only">{status.label}</span>

              {/* Expand icon */}
              {isExpandable && (
                expanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
                )
              )}
            </div>
          </div>

          {/* Score/value summary */}
          {check.value !== undefined && check.value !== null && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {typeof check.value === 'number'
                ? `Value: ${check.value}${check.threshold ? ` (threshold: ${check.threshold})` : ''}`
                : String(check.value)}
            </p>
          )}
        </div>
      </div>

      {/* Expandable detail panel */}
      {isExpandable && expanded && (
        <div
          id={panelId}
          className="px-3 pb-3 pt-0 ml-8 border-t border-gray-100 dark:border-charcoal-600 mt-0"
        >
          <div className="pt-3 space-y-3">
            {/* Description */}
            {check.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {check.description}
              </p>
            )}

            {/* Details */}
            {check.details && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {check.details}
              </p>
            )}

            {/* Affected elements */}
            {check.affectedElements && check.affectedElements.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Affected elements:
                </p>
                <ul className="space-y-1">
                  {check.affectedElements.slice(0, 10).map((el, i) => (
                    <li
                      key={i}
                      className="text-xs font-mono bg-gray-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                    >
                      {typeof el === 'string' ? el : el.element || el.text || JSON.stringify(el)}
                    </li>
                  ))}
                  {check.affectedElements.length > 10 && (
                    <li className="text-xs text-gray-400 dark:text-gray-500">
                      ...and {check.affectedElements.length - 10} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Code snippet */}
            {check.codeSnippet && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Example:
                </p>
                <pre className="text-xs bg-gray-900 dark:bg-charcoal-900 text-gray-100 p-3 rounded-lg overflow-x-auto max-h-40">
                  <code>{check.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Recommendation */}
            {check.recommendation && (
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/30 rounded-lg p-3">
                <p className="text-xs font-medium text-teal-700 dark:text-teal-300 mb-1">
                  Recommendation:
                </p>
                <p className="text-sm text-teal-800 dark:text-teal-200">
                  {check.recommendation}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(ReadabilityCheckItem);
