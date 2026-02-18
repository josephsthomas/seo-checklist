/**
 * ReadabilityShareView
 * Public shared analysis view — no auth required.
 * BRD: US-2.6.3, Shared View Requirements, E-OPS-13
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ScanEye,
  ExternalLink,
  Download,
  AlertTriangle,
  Clock,
  Loader2,
  BarChart3,
  Quote,
  Info,
  Shield,
  Layers,
  BookOpen,
  Settings,
  Database,
  Bot,
} from 'lucide-react';
import { useReadabilityShare } from '../../hooks/useReadabilityShare';
import { useReadabilityExport } from '../../hooks/useReadabilityExport';

const CATEGORY_META = {
  contentStructure: { label: 'Content Structure', icon: Layers },
  contentClarity: { label: 'Content Clarity', icon: BookOpen },
  technicalAccessibility: { label: 'Technical Accessibility', icon: Settings },
  metadataSchema: { label: 'Metadata & Schema', icon: Database },
  aiSignals: { label: 'AI-Specific Signals', icon: Bot },
};

function getGradeFromScore(score) {
  if (score >= 95) return { letter: 'A+', color: 'emerald' };
  if (score >= 90) return { letter: 'A', color: 'emerald' };
  if (score >= 85) return { letter: 'A-', color: 'emerald' };
  if (score >= 80) return { letter: 'B+', color: 'teal' };
  if (score >= 75) return { letter: 'B', color: 'teal' };
  if (score >= 70) return { letter: 'C', color: 'amber' };
  if (score >= 65) return { letter: 'C-', color: 'amber' };
  if (score >= 60) return { letter: 'D', color: 'orange' };
  return { letter: 'F', color: 'red' };
}

const GRADE_COLORS = {
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-800' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-600 dark:text-teal-400', badge: 'bg-teal-100 text-teal-800' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 text-amber-800' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-100 text-orange-800' },
  red: { bg: 'bg-red-500', text: 'text-red-600 dark:text-red-400', badge: 'bg-red-100 text-red-800' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function ReadabilityShareView() {
  const { token } = useParams();
  const { loadSharedAnalysis, sharedAnalysis, shareLoading, shareError } = useReadabilityShare();
  const { exportPDF, isExporting: pdfExporting } = useReadabilityExport();

  // Detect system color scheme for standalone page
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    setIsDark(mq?.matches ?? false);
    const handler = (e) => setIsDark(e.matches);
    mq?.addEventListener?.('change', handler);
    return () => mq?.removeEventListener?.('change', handler);
  }, []);

  // Load shared analysis on mount
  useEffect(() => {
    if (token) {
      loadSharedAnalysis(token);
    }
  }, [token, loadSharedAnalysis]);

  // PDF export — uses full report generation from useReadabilityExport
  const handleExportPDF = async () => {
    if (!sharedAnalysis) return;
    try {
      await exportPDF(sharedAnalysis);
    } catch (err) {
      console.error('PDF export failed:', err);
    }
  };

  const data = sharedAnalysis;
  const grade = data ? getGradeFromScore(data.overallScore ?? 0) : null;
  const colors = grade ? GRADE_COLORS[grade.color] : null;

  // Wrapper class handles dark mode via prefers-color-scheme
  const wrapperClass = isDark ? 'dark' : '';

  return (
    <div className={wrapperClass}>
      <div className="min-h-screen bg-gray-50 dark:bg-charcoal-900">
        {/* Header */}
        <header className="bg-white dark:bg-charcoal-800 border-b border-gray-200 dark:border-charcoal-700">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScanEye className="w-6 h-6 text-teal-500" aria-hidden="true" />
              <span className="font-semibold text-gray-900 dark:text-white">
                Content Strategy Portal
              </span>
            </div>
            <Link
              to="/app/readability"
              className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
            >
              Create your own analysis →
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          {/* Loading */}
          {shareLoading && (
            <div className="text-center py-20">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading shared analysis...</p>
            </div>
          )}

          {/* Error / expired */}
          {shareError && !shareLoading && (
            <div className="text-center py-20">
              <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {shareError.includes('expired')
                  ? 'This link has expired'
                  : 'Analysis not available'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                {shareError.includes('expired')
                  ? 'The shared analysis link has expired. Please request a new link from the report owner.'
                  : 'This shared analysis could not be found. It may have been removed or the link is invalid.'}
              </p>
              <Link
                to="/app/readability"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg font-medium text-sm hover:bg-teal-600 transition-colors"
              >
                <ScanEye className="w-4 h-4" />
                Run Your Own Analysis
              </Link>
            </div>
          )}

          {/* Content */}
          {data && !shareLoading && !shareError && (
            <div className="space-y-6">
              {/* Title */}
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  AI Readability Report
                </h1>
                {data.sourceUrl && (
                  <a
                    href={data.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    {data.sourceUrl.length > 60
                      ? data.sourceUrl.substring(0, 57) + '...'
                      : data.sourceUrl}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Analyzed on {formatDate(data.analyzedAt)}
                </p>
              </div>

              {/* Score card */}
              <div className="bg-white dark:bg-charcoal-800 rounded-2xl border border-gray-200 dark:border-charcoal-700 p-8 text-center">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-gray-100 dark:border-charcoal-700 mb-4">
                  <div>
                    <p className={`text-4xl font-bold ${colors?.text || 'text-gray-900 dark:text-white'}`}>
                      {Math.round(data.overallScore ?? 0)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">out of 100</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className={`text-lg font-bold px-3 py-1 rounded-full ${colors?.badge || 'bg-gray-100 text-gray-800'}`}>
                    {grade?.letter || '?'}
                  </span>
                  {data.gradeLabel && (
                    <span className="text-sm text-gray-600 dark:text-gray-300">{data.gradeLabel}</span>
                  )}
                </div>
                {data.gradeSummary && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-lg mx-auto">
                    {data.gradeSummary}
                  </p>
                )}
              </div>

              {/* AI Visibility Summary */}
              {data.aiVisibilitySummary && (
                <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-teal-500" aria-hidden="true" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      AI Visibility Summary
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {data.aiVisibilitySummary}
                  </p>
                </div>
              )}

              {/* Category breakdown */}
              {data.categoryScores && Object.keys(data.categoryScores).length > 0 && (
                <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-teal-500" aria-hidden="true" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Category Breakdown
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(data.categoryScores)
                      .sort(([a], [b]) => {
                        const order = ['contentStructure', 'contentClarity', 'technicalAccessibility', 'metadataSchema', 'aiSignals'];
                        return order.indexOf(a) - order.indexOf(b);
                      })
                      .map(([key, scoreData]) => {
                        const score = typeof scoreData === 'number' ? scoreData : scoreData?.score ?? 0;
                        const catGrade = getGradeFromScore(Math.round(score));
                        const catColors = GRADE_COLORS[catGrade.color];
                        const meta = CATEGORY_META[key] || { label: key, icon: Layers };
                        const CatIcon = meta.icon;
                        return (
                          <div key={key} className="flex items-center gap-3">
                            <CatIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1 min-w-0">
                              {meta.label}
                            </span>
                            <div className="w-32 h-2 bg-gray-100 dark:bg-charcoal-700 rounded-full overflow-hidden flex-shrink-0">
                              <div
                                className={`h-full rounded-full ${catColors.bg}`}
                                style={{ width: `${Math.round(score)}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold w-8 text-right ${catColors.text}`}>
                              {Math.round(score)}
                            </span>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${catColors.badge}`}>
                              {catGrade.letter}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* LLM Coverage Summary */}
              {data.llmCoverage && data.llmCoverage.length > 0 && (
                <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Quote className="w-5 h-5 text-teal-500" aria-hidden="true" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      How AI Models See This Content
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-charcoal-700">
                          <th scope="col" className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Model</th>
                          <th scope="col" className="text-center py-2 text-gray-500 dark:text-gray-400 font-medium">Content</th>
                          <th scope="col" className="text-center py-2 text-gray-500 dark:text-gray-400 font-medium">Headings</th>
                          <th scope="col" className="text-center py-2 text-gray-500 dark:text-gray-400 font-medium">Entities</th>
                          <th scope="col" className="text-center py-2 text-gray-500 dark:text-gray-400 font-medium">Usefulness</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.llmCoverage.map((row) => (
                          <tr key={row.llm} className="border-b border-gray-100 dark:border-charcoal-700 last:border-b-0">
                            <td className="py-2 font-medium text-gray-900 dark:text-white">{row.llm}</td>
                            <td className="py-2 text-center">{row.contentCoverage != null ? `${Math.round(row.contentCoverage)}%` : 'N/A'}</td>
                            <td className="py-2 text-center">{row.headingsCoverage != null ? `${Math.round(row.headingsCoverage)}%` : 'N/A'}</td>
                            <td className="py-2 text-center">{row.entitiesCoverage != null ? `${Math.round(row.entitiesCoverage)}%` : 'N/A'}</td>
                            <td className="py-2 text-center">{row.usefulness != null ? `${row.usefulness}/10` : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* About this report */}
              <div className="bg-gray-50 dark:bg-charcoal-850 rounded-xl border border-gray-200 dark:border-charcoal-700 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    About This Report
                  </h2>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  This report was generated by the Content Strategy Portal&apos;s AI Readability Checker.
                  It analyzes content across 50+ checks spanning content structure, clarity, technical accessibility,
                  metadata quality, and AI-specific signals to provide a comprehensive readability assessment.
                  Scores reflect how well-optimized the content is for both human readers and AI models.
                </p>
              </div>

              {/* Expiry notice */}
              {data.shareExpiry && (
                <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                  <Clock className="w-3 h-3 inline-block mr-1" aria-hidden="true" />
                  This shared analysis expires on {formatDate(data.shareExpiry)}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={pdfExporting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  {pdfExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Download PDF Report
                </button>
                <Link
                  to="/app/readability"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-charcoal-600 bg-white dark:bg-charcoal-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-sm hover:bg-gray-50 dark:hover:bg-charcoal-750 transition-colors"
                >
                  <ScanEye className="w-4 h-4" />
                  Create Your Own Analysis
                </Link>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-charcoal-700 mt-12">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Powered by Content Strategy Portal · AI Readability Checker
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
