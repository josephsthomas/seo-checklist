/**
 * PDF Export Modal Component
 * Provides UI for configuring and exporting PDF reports
 * Phase 9 - Batch 4
 */

import React, { useState, useEffect } from 'react';
import { X, FileText, Download, Eye, Loader } from 'lucide-react';
import { generateChecklistPDF, downloadPDF, previewPDF } from '../../lib/pdfGenerator';
import toast from 'react-hot-toast';

export default function PdfExportModal({ items, completions, onClose }) {
  const [exporting, setExporting] = useState(false);
  const [config, setConfig] = useState({
    projectName: '',
    clientName: '',
    exportType: 'executive',
    includeCompleted: true,
    brandColor: '#2563eb'
  });

  // Keyboard navigation: Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleExport = async (preview = false) => {
    if (!config.projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setExporting(true);

    try {
      const pdf = generateChecklistPDF({
        items,
        completions,
        ...config
      });

      if (preview) {
        previewPDF(pdf);
        toast.success('PDF preview opened in new window');
      } else {
        const filename = `${config.projectName.toLowerCase().replace(/\s+/g, '-')}-seo-checklist.pdf`;
        downloadPDF(pdf, filename);
        toast.success('PDF downloaded successfully!');
        onClose();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setExporting(false);
    }
  };

  const completedCount = items.filter(item => completions[item.id]).length;
  const completionRate = Math.round((completedCount / items.length) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="pdf-export-title">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b flex items-center justify-between">
            <h3 id="pdf-export-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" aria-hidden="true" />
              Export to PDF
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close PDF export modal"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Export Summary */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Export Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Items:</span>
                  <span className="ml-2 font-semibold text-blue-900">{items.length}</span>
                </div>
                <div>
                  <span className="text-blue-700">Completed:</span>
                  <span className="ml-2 font-semibold text-blue-900">{completedCount} ({completionRate}%)</span>
                </div>
              </div>
            </div>

            {/* Project Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Project Information</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={config.projectName}
                  onChange={(e) => setConfig(prev => ({ ...prev, projectName: e.target.value }))}
                  placeholder="e.g., Acme Corp Website Redesign"
                  className="input w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name (optional)
                </label>
                <input
                  type="text"
                  value={config.clientName}
                  onChange={(e) => setConfig(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="e.g., Acme Corporation"
                  className="input w-full"
                />
              </div>
            </div>

            {/* Export Options */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Export Options</h4>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, exportType: 'executive' }))}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      config.exportType === 'executive'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">Executive Summary</div>
                    <div className="text-xs text-gray-600">
                      Overview with completion statistics by phase (2-3 pages)
                    </div>
                  </button>

                  <button
                    onClick={() => setConfig(prev => ({ ...prev, exportType: 'detailed' }))}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      config.exportType === 'detailed'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">Detailed Report</div>
                    <div className="text-xs text-gray-600">
                      Complete checklist with all items listed (10+ pages)
                    </div>
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeCompleted"
                  checked={config.includeCompleted}
                  onChange={(e) => setConfig(prev => ({ ...prev, includeCompleted: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="includeCompleted" className="ml-2 text-sm text-gray-700">
                  Include completed items in detailed report
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.brandColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, brandColor: e.target.value }))}
                    className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.brandColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, brandColor: e.target.value }))}
                    placeholder="#2563eb"
                    className="input flex-1"
                  />
                  <button
                    onClick={() => setConfig(prev => ({ ...prev, brandColor: '#2563eb' }))}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Note */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
              <strong>Tip:</strong> Use Preview to check the PDF before downloading.
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              disabled={exporting}
            >
              Cancel
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => handleExport(true)}
                disabled={exporting}
                className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {exporting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Preview
                  </>
                )}
              </button>

              <button
                onClick={() => handleExport(false)}
                disabled={exporting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {exporting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
