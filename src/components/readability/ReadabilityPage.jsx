import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ScanEye, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { hasPermission } from '../../utils/roles';
import { useReadabilityAnalysis } from '../../hooks/useReadabilityAnalysis';
import { useReadabilityHistory } from '../../hooks/useReadabilityHistory';
import ReadabilityInputScreen from './ReadabilityInputScreen';
import ReadabilityProcessingScreen from './ReadabilityProcessingScreen';
import ReadabilityDashboard from './ReadabilityDashboard';

/**
 * ReadabilityPage — Main page container
 *
 * View state machine: input → processing → results (+ error from any state)
 * Handles URL param routing and permission checks.
 *
 * BRD References: US-2.1, US-2.2, FR-6.1, Screen Spec #1-#3
 */
export default function ReadabilityPage() {
  const { analysisId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const userRole = userProfile?.role || 'content_writer';

  // Permission check
  const canAccess = useMemo(() =>
    hasPermission(userRole, 'canRunReadabilityCheck'),
    [userRole]
  );

  // Analysis hook
  const analysis = useReadabilityAnalysis();
  const history = useReadabilityHistory();

  // View state
  const [view, setView] = useState('input'); // input | processing | results
  const [loadedResult, setLoadedResult] = useState(null);
  const [loadError, setLoadError] = useState(null);

  // ARIA live region for screen reader announcements
  const [liveMessage, setLiveMessage] = useState('');

  // Pre-filled URL from cross-tool deep linking (US-2.7.1)
  const prefillUrl = searchParams.get('url') || '';

  // E-004: Keyboard shortcut system
  const [showShortcuts, setShowShortcuts] = useState(false);
  useEffect(() => {
    const handler = (e) => {
      // Don't trigger when typing in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcuts(s => !s);
      }
      if (e.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showShortcuts]);

  // Update document title based on view
  useEffect(() => {
    const titles = {
      input: 'AI Readability Checker',
      processing: 'Analyzing...',
      results: loadedResult
        ? `Results — ${loadedResult.overallScore}/100`
        : 'Results'
    };
    document.title = `${titles[view]} | Content Strategy Portal`;
    return () => { document.title = 'Content Strategy Portal'; };
  }, [view, loadedResult]);

  // Load existing analysis from URL param
  useEffect(() => {
    if (analysisId && analysisId !== 'undefined') {
      setView('results');
      history.getAnalysisById(analysisId)
        .then(data => {
          if (data) {
            setLoadedResult(data);
            setLoadError(null);
          } else {
            setLoadError('Analysis not found');
          }
        })
        .catch(err => {
          setLoadError(err.message || 'Failed to load analysis');
        });
    }
  }, [analysisId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Watch analysis state changes and announce to screen readers
  useEffect(() => {
    if (analysis.isAnalyzing) {
      setView('processing');
      setLiveMessage('Analysis in progress. Please wait.');
    } else if (analysis.isComplete && analysis.result) {
      setView('results');
      setLoadedResult(analysis.result);
      setLiveMessage(`Analysis complete. Score: ${analysis.result.overallScore} out of 100, Grade: ${analysis.result.grade}.`);
      // Update URL to include analysis ID
      if (analysis.result.id) {
        navigate(`/app/readability/${analysis.result.id}`, { replace: true });
      }
    } else if (analysis.isError) {
      setLiveMessage(`Error: ${analysis.error || 'An error occurred during analysis.'}`);
    }
  }, [analysis.state, analysis.result]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
  const handleAnalyzeUrl = useCallback(async (url) => {
    try {
      await analysis.analyzeUrl(url);
    } catch {
      // Error is handled in hook
    }
  }, [analysis]);

  const handleAnalyzeHtml = useCallback(async (file) => {
    try {
      await analysis.analyzeHtml(file);
    } catch {
      // Error is handled in hook
    }
  }, [analysis]);

  const handleAnalyzePaste = useCallback(async (html) => {
    try {
      await analysis.analyzePaste(html);
    } catch {
      // Error is handled in hook
    }
  }, [analysis]);

  const handleCancel = useCallback(() => {
    analysis.cancelAnalysis();
    setView('input');
  }, [analysis]);

  const handleBackToInput = useCallback(() => {
    analysis.reset();
    setLoadedResult(null);
    setLoadError(null);
    setView('input');
    navigate('/app/readability', { replace: true });
  }, [analysis, navigate]);

  const handleViewAnalysis = useCallback((id) => {
    navigate(`/app/readability/${id}`);
  }, [navigate]);

  // Permission denied
  if (!canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-charcoal-50 dark:bg-charcoal-900">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-charcoal-300 dark:text-charcoal-600 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-xl font-bold text-charcoal-900 dark:text-charcoal-100 mb-2">
            Access Restricted
          </h1>
          <p className="text-charcoal-600 dark:text-charcoal-400 mb-6">
            You don&apos;t have permission to access the AI Readability Checker.
            Contact your administrator for access.
          </p>
          <button
            onClick={() => navigate('/app')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Current analysis result (from hook or loaded from Firestore)
  const currentResult = loadedResult || analysis.result;

  return (
    <div
      className="min-h-screen bg-charcoal-50 dark:bg-charcoal-900 transition-colors motion-safe:animate-fade-in"
    >
      {/* Page Header */}
      <div className="bg-white dark:bg-charcoal-800 border-b border-charcoal-200 dark:border-charcoal-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            {view === 'results' && (
              <button
                onClick={handleBackToInput}
                className="p-2 rounded-lg hover:bg-charcoal-100 dark:hover:bg-charcoal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Back to input"
              >
                <ArrowLeft className="w-5 h-5 text-charcoal-600 dark:text-charcoal-400" aria-hidden="true" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600">
                <ScanEye className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-charcoal-900 dark:text-charcoal-100">
                  AI Readability Checker
                </h1>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                  Analyze how AI models read your web content
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ARIA live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {liveMessage}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Banner */}
        {(analysis.error || loadError) && (
          <div
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {analysis.error || loadError}
              </p>
              {view !== 'input' && (
                <button
                  onClick={handleBackToInput}
                  className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
                >
                  Try another analysis
                </button>
              )}
            </div>
          </div>
        )}

        {/* View Rendering */}
        {view === 'input' && (
          <ReadabilityInputScreen
            onAnalyzeUrl={handleAnalyzeUrl}
            onAnalyzeHtml={handleAnalyzeHtml}
            onAnalyzePaste={handleAnalyzePaste}
            isAnalyzing={analysis.isAnalyzing}
            error={analysis.error}
            recentAnalyses={history.stats.recentAnalyses}
            onViewAnalysis={handleViewAnalysis}
            prefillUrl={prefillUrl}
          />
        )}

        {view === 'processing' && (
          <ReadabilityProcessingScreen
            progress={analysis.progress}
            partialResults={analysis.partialResults}
            onCancel={handleCancel}
          />
        )}

        {view === 'results' && currentResult && (
          <ReadabilityDashboard
            analysis={currentResult}
            onBack={handleBackToInput}
            onReanalyze={handleAnalyzeUrl}
          />
        )}

        {/* Loading state for existing analysis */}
        {view === 'results' && !currentResult && !loadError && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-charcoal-500 dark:text-charcoal-400">Loading analysis...</p>
            </div>
          </div>
        )}
      </div>

      {/* E-004: Keyboard shortcuts help overlay */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white dark:bg-charcoal-800 rounded-xl shadow-xl border border-charcoal-200 dark:border-charcoal-700 p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-charcoal-900 dark:text-charcoal-100 mb-4">Keyboard Shortcuts</h2>
            <div className="space-y-2 text-sm">
              {[
                ['?', 'Toggle this help'],
                ['Esc', 'Close dialogs'],
                ['\u2190 / \u2192', 'Switch tabs'],
                ['Enter', 'Expand/collapse check'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-charcoal-600 dark:text-charcoal-400">{desc}</span>
                  <kbd className="px-2 py-0.5 bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 rounded text-xs font-mono">{key}</kbd>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-4 w-full px-3 py-2 text-sm bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 rounded-lg hover:bg-charcoal-200 dark:hover:bg-charcoal-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
