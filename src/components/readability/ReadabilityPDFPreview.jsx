/**
 * ReadabilityPDFPreview
 * PDF preview modal with customization options.
 * BRD: US-2.6.1, E-UX-04, Export Section XII
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  FileText,
  Image,
  Upload,
} from 'lucide-react';
import { useReadabilityExport } from '../../hooks/useReadabilityExport';

const DEFAULT_OPTIONS = {
  reportTitle: '',
  clientName: '',
  clientLogo: null,
  includeLLMSummary: true,
  includeGEOBrief: true,
  includeMethodology: true,
  includeCodeSnippets: true,
};

function ToggleSwitch({ label, checked, onChange, id }) {
  return (
    <div className="flex items-center justify-between py-2">
      <label
        htmlFor={id}
        className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-charcoal-800 ${
          checked
            ? 'bg-teal-500 dark:bg-teal-600'
            : 'bg-gray-200 dark:bg-charcoal-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export default function ReadabilityPDFPreview({ analysis, onClose }) {
  const { exportPDF, getPreviewData, isExporting, exportProgress } = useReadabilityExport();
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [previewPage, setPreviewPage] = useState(1);
  const [logoPreview, setLogoPreview] = useState(null);
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Preview data
  const previewData = getPreviewData(analysis, options);
  const totalPages = previewData?.totalPages || 8;

  // Category data for pages 2-4
  const categories = analysis?.categoryScores ? Object.entries(analysis.categoryScores) : [];
  const topCategories = categories.slice(0, 3);
  const bottomCategories = categories.slice(3);
  const llmNames = { claude: 'Claude', openai: 'OpenAI GPT', gemini: 'Google Gemini' };

  // Determine which page index maps to LLM Summary (first optional page after page 4)
  const llmPageIndex = 5; // Pages 3-4 are category breakdown, page 5 is LLM if enabled

  // Focus trap + escape handler
  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    dialogRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      // Focus trap
      if (e.key === 'Tab') {
        const modal = dialogRef.current;
        if (!modal) return;
        const focusable = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    };
  }, [onClose]);

  const updateOption = useCallback((key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleLogoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target.result);
      updateOption('clientLogo', ev.target.result);
    };
    reader.readAsDataURL(file);
  }, [updateOption]);

  const handleGenerate = useCallback(async () => {
    try {
      await exportPDF(analysis, options);
      onClose();
    } catch (err) {
      console.error('PDF generation failed:', err);
    }
  }, [analysis, options, exportPDF, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-preview-title"
        tabIndex={-1}
        className="fixed inset-4 sm:inset-8 lg:inset-16 bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-charcoal-700">
          <h2
            id="pdf-preview-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            PDF Report Preview
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-charcoal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Left: Preview area */}
          <div className="flex-1 flex flex-col bg-gray-100 dark:bg-charcoal-900 overflow-hidden">
            {/* Preview content */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
              <div className="bg-white dark:bg-charcoal-800 shadow-lg rounded-lg w-full max-w-md aspect-[1/1.414] p-8 flex flex-col">
                {/* Simulated page preview based on current page */}
                {previewPage === 1 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {logoPreview && (
                      <img
                        src={logoPreview}
                        alt="Client logo"
                        className="h-12 mb-4 object-contain"
                      />
                    )}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {options.reportTitle || 'AI Readability Report'}
                    </h3>
                    {options.clientName && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Prepared for {options.clientName}
                      </p>
                    )}
                    {analysis?.sourceUrl && (
                      <p className="text-xs text-teal-600 dark:text-teal-400 mb-6 break-all">
                        {analysis.sourceUrl}
                      </p>
                    )}
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-teal-500">
                        {Math.round(analysis?.overallScore ?? 0)}
                      </span>
                      <span className="text-lg text-gray-400">/100</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Grade: {analysis?.grade || 'N/A'}
                    </p>
                  </div>
                )}
                {previewPage === 2 && (
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Executive Summary
                    </h3>
                    {analysis?.gradeSummary && (
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                        {analysis.gradeSummary}
                      </p>
                    )}
                    <div className="space-y-1.5 mt-2">
                      {categories.map(([key, cat]) => {
                        const score = typeof cat === 'number' ? cat : cat?.score ?? 0;
                        const label = typeof cat === 'object' ? cat?.label : key;
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <span className="text-[9px] text-gray-500 dark:text-gray-400 w-20 truncate">{label}</span>
                            <div className="flex-1 h-4 bg-gray-100 dark:bg-charcoal-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-teal-500 dark:bg-teal-400 rounded-full"
                                style={{ width: `${Math.max(score, 3)}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-semibold text-gray-700 dark:text-gray-300 w-7 text-right">{Math.round(score)}</span>
                          </div>
                        );
                      })}
                    </div>
                    {analysis?.issueSummary && (
                      <div className="mt-3 flex gap-2 text-[8px]">
                        {analysis.issueSummary.critical > 0 && <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">{analysis.issueSummary.critical} critical</span>}
                        {analysis.issueSummary.high > 0 && <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">{analysis.issueSummary.high} high</span>}
                        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">{analysis.issueSummary.passed} passed</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Page 3: Category Breakdown 1/2 */}
                {previewPage === 3 && (
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      Category Breakdown (1/2)
                    </h3>
                    <div className="space-y-3">
                      {topCategories.map(([key, cat]) => {
                        const score = typeof cat === 'number' ? cat : cat?.score ?? 0;
                        const label = typeof cat === 'object' ? cat?.label : key;
                        const weight = typeof cat === 'object' ? cat?.weight : '';
                        const checks = analysis?.checkResults?.[key] || [];
                        const passed = Array.isArray(checks) ? checks.filter(c => c.status === 'pass').length : 0;
                        const total = Array.isArray(checks) ? checks.length : 0;
                        return (
                          <div key={key} className="p-2 bg-gray-50 dark:bg-charcoal-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">{label}</span>
                              <span className="text-[9px] text-gray-400">{weight}</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-charcoal-600 rounded-full overflow-hidden mb-1">
                              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.max(score, 3)}%` }} />
                            </div>
                            <div className="flex justify-between text-[8px] text-gray-400">
                              <span>Score: {Math.round(score)}/100</span>
                              <span>{passed}/{total} checks passed</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Page 4: Category Breakdown 2/2 */}
                {previewPage === 4 && (
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      Category Breakdown (2/2)
                    </h3>
                    <div className="space-y-3">
                      {bottomCategories.map(([key, cat]) => {
                        const score = typeof cat === 'number' ? cat : cat?.score ?? 0;
                        const label = typeof cat === 'object' ? cat?.label : key;
                        const weight = typeof cat === 'object' ? cat?.weight : '';
                        const checks = analysis?.checkResults?.[key] || [];
                        const passed = Array.isArray(checks) ? checks.filter(c => c.status === 'pass').length : 0;
                        const total = Array.isArray(checks) ? checks.length : 0;
                        return (
                          <div key={key} className="p-2 bg-gray-50 dark:bg-charcoal-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">{label}</span>
                              <span className="text-[9px] text-gray-400">{weight}</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-charcoal-600 rounded-full overflow-hidden mb-1">
                              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${Math.max(score, 3)}%` }} />
                            </div>
                            <div className="flex justify-between text-[8px] text-gray-400">
                              <span>Score: {Math.round(score)}/100</span>
                              <span>{passed}/{total} checks passed</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Page 5: LLM Summary (if enabled) */}
                {previewPage === llmPageIndex && options.includeLLMSummary && analysis?.llmExtractions && (
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      How AI Models See Your Content
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(analysis.llmExtractions)
                        .filter(([, data]) => data && data.status !== 'error')
                        .map(([llmKey, data]) => (
                          <div key={llmKey} className="p-2 bg-gray-50 dark:bg-charcoal-700/50 rounded-lg flex items-center justify-between">
                            <div>
                              <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">{llmNames[llmKey] || llmKey}</span>
                              <span className="text-[8px] text-gray-400 ml-1">({data.model || ''})</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400">
                                {data.usefulnessScore || data.usefulnessAssessment?.score || '—'}/10
                              </span>
                              <p className="text-[7px] text-gray-400">usefulness</p>
                            </div>
                          </div>
                        ))}
                    </div>
                    <p className="text-[7px] text-gray-400 dark:text-gray-500 mt-3 italic">
                      LLM previews show how AI models interpret content when provided to them.
                    </p>
                  </div>
                )}

                {/* Pages 6+: Title + description + skeleton (text-heavy content) */}
                {previewPage >= 6 && (
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {previewData?.pages?.[previewPage - 1]?.title || `Page ${previewPage}`}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                      {previewData?.pages?.[previewPage - 1]?.description || 'Detailed analysis content'}
                    </p>
                    <div className="space-y-2">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className="h-3 bg-gray-200 dark:bg-charcoal-700 rounded" style={{ width: `${65 + (i * 5) % 35}%` }} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Page 5 fallback when LLM not enabled */}
                {previewPage === llmPageIndex && (!options.includeLLMSummary || !analysis?.llmExtractions) && (
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                      {previewData?.pages?.[previewPage - 1]?.title || `Page ${previewPage}`}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                      {previewData?.pages?.[previewPage - 1]?.description || 'Detailed analysis content'}
                    </p>
                    <div className="space-y-2">
                      {Array.from({ length: 8 }, (_, i) => (
                        <div key={i} className="h-3 bg-gray-200 dark:bg-charcoal-700 rounded" style={{ width: `${65 + (i * 5) % 35}%` }} />
                      ))}
                    </div>
                  </div>
                )}
                {/* Footer */}
                <div className="pt-4 mt-auto border-t border-gray-100 dark:border-charcoal-700 text-center">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                    Page {previewPage} of {totalPages} · Generated by Content Strategy Portal
                  </p>
                </div>
              </div>
            </div>

            {/* Page navigation */}
            <div className="flex items-center justify-center gap-3 py-3 border-t border-gray-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800">
              <button
                type="button"
                onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                disabled={previewPage === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-charcoal-700 disabled:opacity-30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {previewPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
                disabled={previewPage === totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-charcoal-700 disabled:opacity-30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Right: Options panel */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-charcoal-700 p-6 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
              Customize Report
            </h3>

            <div className="space-y-4">
              {/* Report title */}
              <div>
                <label
                  htmlFor="pdf-report-title"
                  className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                  Report Title
                </label>
                <input
                  id="pdf-report-title"
                  type="text"
                  value={options.reportTitle}
                  onChange={(e) => updateOption('reportTitle', e.target.value)}
                  placeholder="AI Readability Report"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Client name */}
              <div>
                <label
                  htmlFor="pdf-client-name"
                  className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1"
                >
                  Client Name
                </label>
                <input
                  id="pdf-client-name"
                  type="text"
                  value={options.clientName}
                  onChange={(e) => updateOption('clientName', e.target.value)}
                  placeholder="Client or company name"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Client logo */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Client Logo
                </label>
                {logoPreview ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-charcoal-900 rounded-lg border border-gray-200 dark:border-charcoal-700">
                    <img src={logoPreview} alt="Logo preview" className="h-8 object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview(null);
                        updateOption('clientLogo', null);
                      }}
                      className="text-xs text-red-500 hover:underline ml-auto"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-200 dark:border-charcoal-600 rounded-lg cursor-pointer hover:border-teal-300 dark:hover:border-teal-700 transition-colors">
                    <Upload className="w-4 h-4 text-gray-400" aria-hidden="true" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Upload logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="sr-only"
                      aria-label="Upload client logo image"
                    />
                  </label>
                )}
              </div>

              {/* Toggle switches */}
              <div className="border-t border-gray-100 dark:border-charcoal-700 pt-4">
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Include Sections
                </h4>
                <ToggleSwitch
                  id="toggle-llm"
                  label="LLM Summary"
                  checked={options.includeLLMSummary}
                  onChange={(v) => updateOption('includeLLMSummary', v)}
                />
                <ToggleSwitch
                  id="toggle-geo"
                  label="GEO Strategic Brief"
                  checked={options.includeGEOBrief}
                  onChange={(v) => updateOption('includeGEOBrief', v)}
                />
                <ToggleSwitch
                  id="toggle-methodology"
                  label="Methodology"
                  checked={options.includeMethodology}
                  onChange={(v) => updateOption('includeMethodology', v)}
                />
                <ToggleSwitch
                  id="toggle-code"
                  label="Code Snippets"
                  checked={options.includeCodeSnippets}
                  onChange={(v) => updateOption('includeCodeSnippets', v)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-charcoal-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-charcoal-800"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating{exportProgress ? ` (${exportProgress}%)` : '...'}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate & Download
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
