import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, X, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { getStorageItem, setStorageItem } from '../../utils/storageHelpers';

/**
 * AI Disclaimer Banner - Shows important AI limitations notice
 *
 * @param {Object} props
 * @param {string} props.toolName - Name of the AI tool (e.g., "Meta Generator")
 * @param {boolean} props.compact - Show compact version (default: false)
 * @param {boolean} props.dismissible - Allow dismissing the banner (default: true)
 * @param {string} props.storageKey - LocalStorage key for dismissed state (optional)
 */
export default function AIDisclaimer({
  toolName = 'AI Tool',
  compact = false,
  dismissible = true,
  storageKey = null
}) {
  const [dismissed, setDismissed] = useState(() => {
    if (storageKey) {
      return getStorageItem(storageKey, false);
    }
    return false;
  });
  const [expanded, setExpanded] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    if (storageKey) {
      setStorageItem(storageKey, true);
    }
  };

  if (dismissed && dismissible) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm">
        <Bot className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="text-amber-700">
          AI-generated content requires review.{' '}
          <Link to="/ai-policy" className="underline hover:text-amber-800">
            Learn more
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-amber-800">
                {toolName} - AI-Powered Feature
              </h3>
              <p className="text-amber-700 text-sm mt-1">
                AI can make mistakes. Always review and verify generated content before use.
              </p>
            </div>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded transition-colors"
                aria-label="Dismiss AI disclaimer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      <div className="border-t border-amber-200">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2 text-sm text-amber-700 hover:bg-amber-100/50 transition-colors"
          aria-expanded={expanded}
        >
          <span>{expanded ? 'Hide details' : 'Important information about AI limitations'}</span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-3">
            <div className="text-sm text-amber-700 space-y-2">
              <p>
                <strong>What you should know:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>AI-generated content may contain errors, inaccuracies, or &quot;hallucinations&quot;</li>
                <li>You are responsible for reviewing all content before use</li>
                <li>AI cannot guarantee compliance with legal or industry requirements</li>
                <li>Generated suggestions should be treated as starting points, not final content</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
              <p className="text-red-700 font-medium">Not Professional Advice</p>
              <p className="text-red-600 text-xs mt-1">
                This tool provides suggestions only and does not constitute professional SEO, legal,
                accessibility, or compliance advice. Consult qualified professionals for specific requirements.
              </p>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <Link
                to="/ai-policy"
                className="text-sm text-amber-800 underline hover:text-amber-900"
              >
                Read our full AI Policy
              </Link>
              <Link
                to="/terms"
                className="text-sm text-amber-800 underline hover:text-amber-900"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Inline AI disclaimer for smaller contexts
 */
export function AIDisclaimerInline({ className = '' }) {
  return (
    <p className={`text-xs text-charcoal-500 flex items-center gap-1 ${className}`}>
      <Bot className="w-3 h-3" />
      AI-generated - review before use.{' '}
      <Link to="/ai-policy" className="underline hover:text-charcoal-700">
        AI Policy
      </Link>
    </p>
  );
}

/**
 * AI warning badge for labeling AI-generated sections
 */
export function AIBadge({ className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium ${className}`}
      title="AI-generated content - review before use"
    >
      <Bot className="w-3 h-3" />
      AI Generated
    </span>
  );
}
