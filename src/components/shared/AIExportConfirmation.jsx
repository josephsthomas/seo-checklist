import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Download, Copy, CheckSquare, Square, X, FileText } from 'lucide-react';

/**
 * AI Export Confirmation Modal
 *
 * Shows a confirmation dialog before exporting AI-generated content.
 * Requires user acknowledgment of AI limitations.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Called when modal is closed without confirming
 * @param {function} props.onConfirm - Called when user confirms and proceeds with export
 * @param {string} props.exportType - Type of export (e.g., "copy", "download")
 * @param {string} props.contentType - What's being exported (e.g., "metadata", "alt text")
 */
export default function AIExportConfirmation({
  isOpen,
  onClose,
  onConfirm,
  exportType = 'export',
  contentType = 'AI-generated content'
}) {
  const [acknowledgments, setAcknowledgments] = useState({
    reviewed: false,
    understand: false,
    responsible: false
  });
  const [canProceed, setCanProceed] = useState(false);

  // Reset acknowledgments when modal opens
  useEffect(() => {
    if (isOpen) {
      setAcknowledgments({
        reviewed: false,
        understand: false,
        responsible: false
      });
    }
  }, [isOpen]);

  // Check if all acknowledgments are checked
  useEffect(() => {
    setCanProceed(
      acknowledgments.reviewed &&
      acknowledgments.understand &&
      acknowledgments.responsible
    );
  }, [acknowledgments]);

  const handleToggle = (key) => {
    setAcknowledgments(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleConfirm = () => {
    if (canProceed) {
      onConfirm();
    }
  };

  if (!isOpen) return null;

  const exportActionLabel = exportType === 'copy' ? 'Copy' : exportType === 'download' ? 'Download' : 'Export';
  const ExportIcon = exportType === 'copy' ? Copy : Download;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-export-title"
      >
        {/* Header */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 id="ai-export-title" className="text-lg font-semibold text-amber-800">
                Before You {exportActionLabel}
              </h2>
              <p className="text-amber-700 text-sm mt-1">
                Please confirm you&apos;ve reviewed the {contentType}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">
              <strong>Important:</strong> AI-generated content may contain errors, inaccuracies,
              or inappropriate suggestions. You must review and verify all content before publishing
              or implementing it.
            </p>
          </div>

          {/* Acknowledgments */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-3">
              Please confirm the following:
            </p>

            <button
              onClick={() => handleToggle('reviewed')}
              className="w-full flex items-start gap-3 p-3 rounded-lg border border-charcoal-200 dark:border-charcoal-600 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors text-left"
            >
              {acknowledgments.reviewed ? (
                <CheckSquare className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-5 h-5 text-charcoal-400 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-sm text-charcoal-700 dark:text-charcoal-300">
                I have reviewed the AI-generated {contentType} and understand it may require editing
              </span>
            </button>

            <button
              onClick={() => handleToggle('understand')}
              className="w-full flex items-start gap-3 p-3 rounded-lg border border-charcoal-200 dark:border-charcoal-600 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors text-left"
            >
              {acknowledgments.understand ? (
                <CheckSquare className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-5 h-5 text-charcoal-400 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-sm text-charcoal-700 dark:text-charcoal-300">
                I understand that AI can make mistakes and the content may contain errors or inaccuracies
              </span>
            </button>

            <button
              onClick={() => handleToggle('responsible')}
              className="w-full flex items-start gap-3 p-3 rounded-lg border border-charcoal-200 dark:border-charcoal-600 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors text-left"
            >
              {acknowledgments.responsible ? (
                <CheckSquare className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Square className="w-5 h-5 text-charcoal-400 flex-shrink-0 mt-0.5" />
              )}
              <span className="text-sm text-charcoal-700 dark:text-charcoal-300">
                I accept responsibility for verifying and editing the content before use
              </span>
            </button>
          </div>

          {/* Policy Link */}
          <div className="mt-4 pt-4 border-t border-charcoal-100 dark:border-charcoal-700">
            <Link
              to="/ai-policy"
              target="_blank"
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
            >
              <FileText className="w-4 h-4" />
              Read our AI Usage Policy
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-charcoal-50 dark:bg-charcoal-900 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-charcoal-600 hover:text-charcoal-800 hover:bg-charcoal-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canProceed}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
              ${canProceed
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-charcoal-200 text-charcoal-400 cursor-not-allowed'
              }
            `}
          >
            <ExportIcon className="w-4 h-4" />
            {exportActionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Re-export the hook from hooks folder for convenience
// eslint-disable-next-line react-refresh/only-export-components
export { useAIExportConfirmation } from '../../hooks/useAIExportConfirmation';
