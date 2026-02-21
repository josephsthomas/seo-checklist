import { useState, useCallback, useMemo, useEffect, Suspense } from 'react';
import {
  ExternalLink, Share2, Download, FileJson, FileText, ChevronDown,
  Zap, ArrowRight, ArrowLeft, ListChecks, Eye, MessageSquare, AlertTriangle, Sliders
} from 'lucide-react';
import { useReadabilityExport } from '../../hooks/useReadabilityExport';
import { useReadabilityShare } from '../../hooks/useReadabilityShare';
import { useReadabilityHistory } from '../../hooks/useReadabilityHistory';
import { lazyWithRetry } from '../../utils/lazyWithRetry';
import { AIDisclaimerInline } from '../shared/AIDisclaimer';
import ReadabilityScoreCard from './ReadabilityScoreCard';
const ReadabilityCategoryChart = lazyWithRetry(() => import('./ReadabilityCategoryChart'), 'ReadabilityCategoryChart');
const ReadabilityCategoryAccordion = lazyWithRetry(() => import('./ReadabilityCategoryAccordion'), 'ReadabilityCategoryAccordion');
const ReadabilityLLMPreview = lazyWithRetry(() => import('./ReadabilityLLMPreview'), 'ReadabilityLLMPreview');
const ReadabilityRecommendations = lazyWithRetry(() => import('./ReadabilityRecommendations'), 'ReadabilityRecommendations');
const ReadabilityIssuesTable = lazyWithRetry(() => import('./ReadabilityIssuesTable'), 'ReadabilityIssuesTable');
import ReadabilityCrossToolLinks from './ReadabilityCrossToolLinks';
const ReadabilityPDFPreview = lazyWithRetry(() => import('./ReadabilityPDFPreview'), 'ReadabilityPDFPreview');
const ReadabilityQuotableHighlighter = lazyWithRetry(() => import('./ReadabilityQuotableHighlighter'), 'ReadabilityQuotableHighlighter');
const ReadabilityWeightConfig = lazyWithRetry(() => import('./ReadabilityWeightConfig'), 'ReadabilityWeightConfig');
import { ScoreCardSkeleton, CategoryChartSkeleton, LLMPreviewSkeleton } from './ReadabilitySkeletonLoader';

/**
 * Dashboard tabs
 */
const TABS = [
  { id: 'details', label: 'Score Details', shortLabel: 'Details', icon: ListChecks },
  { id: 'llm', label: 'How AI Sees Your Content', shortLabel: 'AI View', icon: Eye },
  { id: 'recommendations', label: 'Recommendations', shortLabel: 'Recs', icon: MessageSquare },
  { id: 'issues', label: 'Issues', shortLabel: 'Issues', icon: AlertTriangle }
];

/**
 * ReadabilityDashboard — Results container with summary and tabs
 *
 * BRD References: US-2.2.1, US-2.2.2, Screen Spec #3, E-UX-02, E-CMO-07
 */
export default function ReadabilityDashboard({
  analysis,
  onBack,
  onReanalyze
}) {
  const [activeTab, setActiveTab] = useState('details');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showWeightConfig, setShowWeightConfig] = useState(false);
  const [shareExpiry, setShareExpiry] = useState(30);
  const [generatedShareUrl, setGeneratedShareUrl] = useState(null);
  const [trendData, setTrendData] = useState([]);

  const exportHook = useReadabilityExport();
  const shareHook = useReadabilityShare();
  const historyHook = useReadabilityHistory();

  // Load trend data
  useEffect(() => {
    let cancelled = false;
    if (analysis?.sourceUrl) {
      historyHook.getTrendData(analysis.sourceUrl).then(data => {
        if (!cancelled && data?.length > 0) setTrendData(data);
      }).catch(() => {
        // Trend data is non-critical; silently ignore errors
      });
    }
    return () => { cancelled = true; };
  }, [analysis?.sourceUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Quick wins (top 3 high-impact, low-effort)
  const quickWins = useMemo(() => {
    const recs = analysis?.recommendations || [];
    return recs
      .filter(r => r.group === 'quick-wins' || (r.priority === 'high' && r.effort === 'quick'))
      .slice(0, 3);
  }, [analysis?.recommendations]);

  // AI visibility summary
  const aiSummary = useMemo(() => {
    if (analysis?.aiAssessment?.contentSummary) {
      return analysis.aiAssessment.contentSummary;
    }
    if (analysis?.gradeSummary) {
      return analysis.gradeSummary;
    }
    return `This page scored ${analysis?.overallScore || 0}/100 for AI readability.`;
  }, [analysis]);

  // E-025: Plain-English executive summary for non-technical users
  const executiveSummary = useMemo(() => {
    const score = analysis?.overallScore || 0;
    const issues = analysis?.issueSummary || {};
    const criticalCount = (issues.critical || 0) + (issues.high || 0);
    if (score >= 90) return 'This content is well-optimized for AI search engines and likely to be cited in AI-generated answers.';
    if (score >= 80) return `Good performance with ${criticalCount} issue${criticalCount !== 1 ? 's' : ''} that could further improve AI visibility.`;
    if (score >= 70) return `Room for improvement \u2014 addressing ${criticalCount} key issue${criticalCount !== 1 ? 's' : ''} could significantly boost AI search performance.`;
    if (score >= 60) return 'Needs attention \u2014 AI models may struggle to cite this content effectively. Focus on the top recommendations.';
    return 'Significant gaps for AI readability. Major improvements needed for AI search visibility.';
  }, [analysis]);

  // Tab keyboard navigation
  const handleTabKeyDown = useCallback((e) => {
    const tabIds = TABS.map(t => t.id);
    const idx = tabIds.indexOf(activeTab);
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveTab(tabIds[(idx + 1) % tabIds.length]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveTab(tabIds[(idx - 1 + tabIds.length) % tabIds.length]);
    }
  }, [activeTab]);

  // Export handlers
  const handleExportPDF = useCallback(() => {
    setShowExportMenu(false);
    setShowPDFPreview(true);
  }, []);

  const handleExportJSON = useCallback(() => {
    setShowExportMenu(false);
    exportHook.exportJSON(analysis);
  }, [analysis, exportHook]);

  // Share handler
  const [shareError, setShareError] = useState(null);
  const handleShare = useCallback(async () => {
    if (!analysis?.id) return;
    setShareError(null);
    try {
      const result = await shareHook.createShareLink(analysis.id, { expiryDays: shareExpiry });
      if (result?.shareUrl) {
        setGeneratedShareUrl(result.shareUrl);
      }
    } catch {
      setShareError('Failed to create share link. Please try again.');
    }
  }, [analysis?.id, shareExpiry, shareHook]);

  if (!analysis) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-charcoal-500 dark:text-charcoal-400">No analysis data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 motion-safe:animate-fade-in print:space-y-4">
      {/* Print-optimized styles */}
      <style>{`
        @media print {
          nav, header, footer, [role="tablist"], .no-print { display: none !important; }
          button:not(.print-visible) { display: none !important; }
          details[open] > summary ~ * { display: block !important; }
          details { break-inside: avoid; }
          .print\\:space-y-4 > * + * { margin-top: 1rem; }
        }
      `}</style>
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Back button + URL / Source */}
        <div className="flex items-center gap-2 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-charcoal-700 dark:text-charcoal-300 bg-white dark:bg-charcoal-800 border border-charcoal-300 dark:border-charcoal-600 rounded-lg hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Back to input"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
          {analysis.sourceUrl && (
            <a
              href={analysis.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-teal-600 dark:text-teal-400 hover:underline truncate max-w-md flex items-center gap-1"
            >
              {analysis.sourceUrl}
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            </a>
          )}
          {!analysis.sourceUrl && analysis.filename && (
            <span className="text-sm text-charcoal-600 dark:text-charcoal-400">
              {analysis.filename}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Share button */}
          <div className="relative">
            <button
              onClick={() => setShowShareDialog(!showShareDialog)}
              aria-haspopup="dialog"
              aria-expanded={showShareDialog}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-charcoal-700 dark:text-charcoal-300 bg-white dark:bg-charcoal-800 border border-charcoal-300 dark:border-charcoal-600 rounded-lg hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors
                focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
              Share
            </button>

            {/* Share dialog dropdown */}
            {showShareDialog && (
              <div
                role="dialog"
                aria-label="Share this analysis"
                onKeyDown={(e) => { if (e.key === 'Escape') setShowShareDialog(false); }}
                className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 rounded-lg shadow-lg z-20 p-4"
              >
                <p className="text-sm font-medium text-charcoal-900 dark:text-charcoal-100 mb-3">
                  Share this analysis
                </p>
                <div className="mb-3">
                  <label htmlFor="share-expiry" className="block text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">
                    Link expires after
                  </label>
                  <select
                    id="share-expiry"
                    value={shareExpiry}
                    onChange={(e) => setShareExpiry(e.target.value === 'never' ? null : Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-sm rounded border border-charcoal-300 dark:border-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value="never">Never</option>
                  </select>
                  {shareExpiry === null && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Non-expiring links remain accessible indefinitely.
                    </p>
                  )}
                </div>
                <button
                  onClick={handleShare}
                  disabled={shareHook.isSharing}
                  className="w-full px-3 py-2 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {shareHook.isSharing ? 'Creating...' : 'Create & Copy Link'}
                </button>
                {shareError && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-2">{shareError}</p>
                )}
                {generatedShareUrl && (
                  <div className="mt-3 p-2 bg-charcoal-50 dark:bg-charcoal-700 rounded-lg">
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">Share link:</p>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        readOnly
                        value={generatedShareUrl}
                        aria-label="Share link URL"
                        className="flex-1 text-xs px-2 py-1 bg-white dark:bg-charcoal-800 border border-charcoal-300 dark:border-charcoal-600 rounded text-charcoal-700 dark:text-charcoal-200"
                        onFocus={(e) => e.target.select()}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              aria-haspopup="menu"
              aria-expanded={showExportMenu}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-charcoal-900"
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              Export
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            </button>

            {showExportMenu && (
              <div
                className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 rounded-lg shadow-lg z-20 py-1"
                role="menu"
                onKeyDown={(e) => {
                  const items = e.currentTarget.querySelectorAll('[role="menuitem"]');
                  const current = Array.from(items).indexOf(document.activeElement);
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    items[(current + 1) % items.length]?.focus();
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    items[(current - 1 + items.length) % items.length]?.focus();
                  } else if (e.key === 'Escape') {
                    setShowExportMenu(false);
                  }
                }}
              >
                <button
                  role="menuitem"
                  onClick={handleExportPDF}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors text-left focus:outline-none focus:bg-charcoal-50 dark:focus:bg-charcoal-700"
                >
                  <FileText className="w-4 h-4 text-red-500" aria-hidden="true" />
                  Export as PDF
                </button>
                <button
                  role="menuitem"
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors text-left focus:outline-none focus:bg-charcoal-50 dark:focus:bg-charcoal-700"
                >
                  <FileJson className="w-4 h-4 text-blue-500" aria-hidden="true" />
                  Export as JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overall Score Card */}
      <ReadabilityScoreCard
        score={analysis.overallScore}
        grade={analysis.grade}
        gradeSummary={analysis.gradeSummary}
        citationWorthiness={analysis.aiAssessment?.citationWorthiness}
        trendData={trendData}
        scoreDelta={analysis.scoreDelta}
      />

      {/* AI Visibility Summary (E-CMO-07) */}
      <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
        <p className="text-sm text-teal-800 dark:text-teal-200 leading-relaxed">
          {aiSummary}
        </p>
        {/* E-025: Executive summary for non-technical stakeholders */}
        {executiveSummary !== aiSummary && (
          <p className="text-xs text-teal-700 dark:text-teal-300 mt-2 pt-2 border-t border-teal-200 dark:border-teal-800">
            {executiveSummary}
          </p>
        )}
        <AIDisclaimerInline className="mt-2" />
      </div>

      {/* Category Breakdown Chart */}
      <Suspense fallback={<CategoryChartSkeleton />}>
        <ReadabilityCategoryChart
          categoryScores={analysis.categoryScores}
          onCategoryClick={(catId) => {
            // E-002: Click category chart bar → switch to details tab and scroll to that category
            setActiveTab('details');
            setTimeout(() => {
              const el = document.getElementById(`category-${catId}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                el.classList.add('ring-2', 'ring-teal-500');
                setTimeout(() => el.classList.remove('ring-2', 'ring-teal-500'), 2000);
              }
            }, 100);
          }}
        />
      </Suspense>

      {/* Quick Wins Preview (E-UX-02) */}
      {quickWins.length > 0 && (
        <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-charcoal-200 dark:border-charcoal-700 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-amber-500" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">
              Quick Wins
            </h2>
          </div>
          <div className="space-y-2">
            {quickWins.map((rec, i) => (
              <div
                key={rec.id || i}
                className="flex items-start gap-3 p-3 bg-charcoal-50 dark:bg-charcoal-700/50 rounded-lg"
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className={`w-2 h-2 rounded-full
                    ${rec.priority === 'critical' ? 'bg-red-500' : ''}
                    ${rec.priority === 'high' ? 'bg-orange-500' : ''}
                    ${rec.priority === 'medium' ? 'bg-amber-500' : ''}
                    ${rec.priority === 'low' ? 'bg-blue-500' : ''}`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-charcoal-900 dark:text-charcoal-100">
                    {rec.title}
                  </p>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400 line-clamp-1">
                    {rec.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveTab('recommendations')}
            className="mt-3 text-sm text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
          >
            View All Recommendations
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div
        className="flex overflow-x-auto border-b border-charcoal-200 dark:border-charcoal-700 -mx-1 px-1"
        role="tablist"
        aria-label="Results sections"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          // Count for Issues tab
          const issueCount = tab.id === 'issues'
            ? (analysis.checkResults || []).filter(c => c.status === 'fail' || c.status === 'warn').length
            : null;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`results-panel-${tab.id}`}
              id={`results-tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={handleTabKeyDown}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset
                ${isActive
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-charcoal-500 dark:text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-300 hover:border-charcoal-300'
                }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel}</span>
              {issueCount !== null && issueCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full
                  ${isActive
                    ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                    : 'bg-charcoal-200 dark:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-400'
                  }`}
                >
                  {issueCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'details' && (
        <div
          role="tabpanel"
          id="results-panel-details"
          aria-labelledby="results-tab-details"
          className="motion-safe:animate-fade-in space-y-6"
        >
          {/* Weight Config toggle (E-007) */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowWeightConfig(!showWeightConfig)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-charcoal-600 dark:text-charcoal-400 bg-charcoal-50 dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 rounded-lg hover:bg-charcoal-100 dark:hover:bg-charcoal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-expanded={showWeightConfig}
            >
              <Sliders className="w-3.5 h-3.5" aria-hidden="true" />
              {showWeightConfig ? 'Hide' : 'Adjust'} Weights
            </button>
          </div>
          {showWeightConfig && (
            <Suspense fallback={<div className="h-24 bg-charcoal-50 dark:bg-charcoal-800 rounded-xl animate-pulse" />}>
              <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-charcoal-200 dark:border-charcoal-700 p-5 motion-safe:animate-fade-in">
                <ReadabilityWeightConfig
                  weights={null}
                  onChange={() => {}}
                />
              </div>
            </Suspense>
          )}

          <Suspense fallback={<div className="h-48 bg-charcoal-50 dark:bg-charcoal-800 rounded-xl animate-pulse" />}>
            <ReadabilityCategoryAccordion
              categoryScores={analysis.categoryScores}
              checkResults={analysis.checkResults}
            />
          </Suspense>

          {/* Quotable Passages (E-013) */}
          <Suspense fallback={<div className="h-32 bg-charcoal-50 dark:bg-charcoal-800 rounded-xl animate-pulse" />}>
            <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-charcoal-200 dark:border-charcoal-700 p-5">
              <ReadabilityQuotableHighlighter
                bodyText={analysis.aiAssessment?.contentSummary || ''}
                aiQuotables={analysis.aiAssessment?.quotablePassages}
              />
            </div>
          </Suspense>
        </div>
      )}

      {activeTab === 'llm' && (
        <div
          role="tabpanel"
          id="results-panel-llm"
          aria-labelledby="results-tab-llm"
          className="motion-safe:animate-fade-in"
        >
          <Suspense fallback={<LLMPreviewSkeleton />}>
            <ReadabilityLLMPreview
              llmExtractions={analysis.llmExtractions}
            />
          </Suspense>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div
          role="tabpanel"
          id="results-panel-recommendations"
          aria-labelledby="results-tab-recommendations"
          className="motion-safe:animate-fade-in"
        >
          <Suspense fallback={<div className="h-48 bg-charcoal-50 dark:bg-charcoal-800 rounded-xl animate-pulse" />}>
            <ReadabilityRecommendations
              recommendations={analysis.recommendations}
            />
          </Suspense>
        </div>
      )}

      {activeTab === 'issues' && (
        <div
          role="tabpanel"
          id="results-panel-issues"
          aria-labelledby="results-tab-issues"
          className="motion-safe:animate-fade-in"
        >
          <Suspense fallback={<div className="h-48 bg-charcoal-50 dark:bg-charcoal-800 rounded-xl animate-pulse" />}>
            <ReadabilityIssuesTable
              checkResults={analysis.checkResults}
            />
          </Suspense>
        </div>
      )}

      {/* Cross-tool links */}
      <ReadabilityCrossToolLinks
        sourceUrl={analysis.sourceUrl}
        checkResults={analysis.checkResults}
      />

      {/* PDF Preview Modal */}
      {showPDFPreview && (
        <Suspense fallback={<div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/60"><div className="text-white">Loading preview...</div></div>}>
          <ReadabilityPDFPreview
            analysis={analysis}
            onClose={() => setShowPDFPreview(false)}
            onExport={(options) => {
              exportHook.exportPDF(analysis, options);
              setShowPDFPreview(false);
            }}
            isExporting={exportHook.isExporting}
            getPreviewData={exportHook.getPreviewData}
          />
        </Suspense>
      )}

      {/* Click-outside handler for dropdowns */}
      {(showExportMenu || showShareDialog) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowExportMenu(false);
            setShowShareDialog(false);
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
