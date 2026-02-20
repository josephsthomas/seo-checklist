import { useState, useEffect, useRef, useMemo } from 'react';
import {
  CheckCircle2, Loader2, XCircle, Globe, FileSearch, Brain,
  Calculator, Sparkles, AlertTriangle
} from 'lucide-react';

/**
 * Analysis stages with progress ranges
 */
const STAGES = [
  { id: 'fetching', label: 'Fetching page content', icon: Globe, range: [0, 15] },
  { id: 'extracting', label: 'Extracting content and metadata', icon: FileSearch, range: [15, 25] },
  { id: 'analyzing', label: 'Analyzing with AI models', icon: Brain, range: [25, 85], hasSubstages: true },
  { id: 'scoring', label: 'Calculating scores', icon: Calculator, range: [85, 95] },
  { id: 'finalizing', label: 'Finalizing results', icon: Sparkles, range: [95, 100] }
];

/**
 * LLM substages for parallel analysis
 */
const LLM_SUBSTAGES = [
  { id: 'claude', label: 'Claude', model: 'Claude Sonnet 4.5' },
  { id: 'openai', label: 'OpenAI GPT', model: 'GPT-4o' },
  { id: 'gemini', label: 'Google Gemini', model: 'Gemini 2.0 Flash' }
];

/**
 * Did you know? factoids
 */
const FACTOIDS = [
  'AI models like Claude and GPT extract content differently — comparing their views helps identify gaps.',
  'Structured data (JSON-LD) may improve how AI models understand and cite your content.',
  'Pages with clear heading hierarchies are generally more likely to be cited in AI-generated answers.',
  'The Flesch Reading Ease score measures how easy your content is to understand — aim for 60+.',
  'Adding author expertise signals may improve citation likelihood in AI search results.',
  'AI crawlers like GPTBot and Google-Extended can be individually allowed or blocked via robots.txt.',
  'Content freshness (e.g., published within 12 months) is considered a signal for AI answer selection.',
  'Quotable passages — clear, concise statements — may increase the chance of AI citation.'
];

/**
 * Stage status icon component
 */
function StageIcon({ status, Icon }) {
  if (status === 'complete') {
    return <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-hidden="true" />;
  }
  if (status === 'active') {
    return <Loader2 className="w-5 h-5 text-teal-500 animate-spin" aria-hidden="true" />;
  }
  if (status === 'error') {
    return <XCircle className="w-5 h-5 text-red-500" aria-hidden="true" />;
  }
  return <Icon className="w-5 h-5 text-charcoal-300 dark:text-charcoal-600" aria-hidden="true" />;
}

/**
 * ReadabilityProcessingScreen — Analysis progress display
 *
 * Shows progress bar, stage checklist with LLM sub-stages,
 * cancel button, factoids, and partial results preview.
 *
 * BRD References: Screen Spec #2, Processing Screen requirements
 */
export default function ReadabilityProcessingScreen({
  progress = {},
  partialResults = null,
  onCancel
}) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [factoidIndex, setFactoidIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef(Date.now());
  const announceRef = useRef(null);

  // Elapsed time tracker
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rotate factoids every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setFactoidIndex(prev => (prev + 1) % FACTOIDS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Determine stage statuses
  const stageStatuses = useMemo(() => {
    const currentProgress = progress.progress || 0;
    const currentStage = progress.stage;

    return STAGES.map(stage => {
      if (currentProgress >= stage.range[1]) return 'complete';
      if (currentStage === stage.id || (currentProgress >= stage.range[0] && currentProgress < stage.range[1])) return 'active';
      return 'pending';
    });
  }, [progress]);

  // Substage statuses
  const substageStatuses = useMemo(() => {
    return progress.substages || { claude: 'pending', openai: 'pending', gemini: 'pending' };
  }, [progress.substages]);

  // Format elapsed time
  const formattedTime = useMemo(() => {
    const mins = Math.floor(elapsedTime / 60);
    const secs = elapsedTime % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  }, [elapsedTime]);

  // Cancel confirmation
  const handleCancelClick = () => setShowCancelConfirm(true);
  const handleCancelConfirm = () => {
    setShowCancelConfirm(false);
    onCancel?.();
  };
  const handleCancelDismiss = () => setShowCancelConfirm(false);

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Progress percentage and time */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
          {Math.round(progress.progress || 0)}%
        </span>
        <span className="text-sm text-charcoal-500 dark:text-charcoal-400">
          {formattedTime}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-2 bg-charcoal-200 dark:bg-charcoal-700 rounded-full overflow-hidden mb-8"
        role="progressbar"
        aria-valuenow={Math.round(progress.progress || 0)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Analysis progress: ${Math.round(progress.progress || 0)}%`}
      >
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-300 motion-safe:animate-shimmer relative"
          style={{ width: `${progress.progress || 0}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent motion-safe:animate-pulse" />
        </div>
      </div>

      {/* Screen reader announcements */}
      <div
        ref={announceRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {progress.message}
      </div>

      {/* Stage checklist */}
      <div className="space-y-3 mb-8">
        {STAGES.map((stage, index) => {
          const status = stageStatuses[index];
          const Icon = stage.icon;

          return (
            <div key={stage.id}>
              <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors
                ${status === 'active' ? 'bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800' : ''}
                ${status === 'complete' ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}
                ${status === 'pending' ? 'opacity-50' : ''}`}
              >
                <StageIcon status={status} Icon={Icon} />
                <span className={`flex-1 text-sm font-medium
                  ${status === 'active' ? 'text-teal-700 dark:text-teal-300' : ''}
                  ${status === 'complete' ? 'text-emerald-700 dark:text-emerald-400' : ''}
                  ${status === 'pending' ? 'text-charcoal-400 dark:text-charcoal-500' : ''}`}
                >
                  {stage.label}
                  {status === 'active' && '...'}
                </span>
              </div>

              {/* LLM substages for analyzing stage */}
              {stage.hasSubstages && status === 'active' && (
                <div className="ml-10 mt-2 space-y-2">
                  {LLM_SUBSTAGES.map(llm => {
                    const llmStatus = substageStatuses[llm.id] || 'pending';
                    return (
                      <div key={llm.id} className="flex items-center gap-2">
                        {llmStatus === 'complete' && <CheckCircle2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />}
                        {llmStatus === 'running' && <Loader2 className="w-4 h-4 text-teal-500 animate-spin" aria-hidden="true" />}
                        {llmStatus === 'error' && <XCircle className="w-4 h-4 text-red-400" aria-hidden="true" />}
                        {llmStatus === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-charcoal-300 dark:border-charcoal-600" />}
                        <span className={`text-xs
                          ${llmStatus === 'running' ? 'text-teal-600 dark:text-teal-400 font-medium' : ''}
                          ${llmStatus === 'complete' ? 'text-emerald-600 dark:text-emerald-400' : ''}
                          ${llmStatus === 'error' ? 'text-red-500' : ''}
                          ${llmStatus === 'pending' ? 'text-charcoal-400 dark:text-charcoal-500' : ''}`}
                        >
                          {llm.label}
                          <span className="text-charcoal-400 dark:text-charcoal-500 ml-1">({llm.model})</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Partial results preview */}
      {partialResults && (
        <div className="mb-8 p-4 bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 rounded-lg">
          <p className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider mb-2">
            Preview
          </p>
          {partialResults.pageTitle && (
            <p className="text-sm font-medium text-charcoal-900 dark:text-charcoal-100">
              {partialResults.pageTitle}
            </p>
          )}
          {partialResults.pageDescription && (
            <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mt-1 line-clamp-2">
              {partialResults.pageDescription}
            </p>
          )}
          {partialResults.wordCount && (
            <p className="text-xs text-charcoal-400 dark:text-charcoal-500 mt-2">
              {partialResults.wordCount.toLocaleString()} words
              {partialResults.language ? ` · ${partialResults.language}` : ''}
            </p>
          )}
        </div>
      )}

      {/* Did you know? factoid */}
      <div className="mb-8 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
        <p className="text-xs font-medium text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
          Did you know?
        </p>
        <p className="text-sm text-teal-700 dark:text-teal-300 motion-safe:animate-fade-in" key={factoidIndex}>
          {FACTOIDS[factoidIndex]}
        </p>
      </div>

      {/* Cancel button */}
      <div className="flex justify-center">
        {!showCancelConfirm ? (
          <button
            onClick={handleCancelClick}
            className="px-4 py-2 text-sm text-charcoal-500 dark:text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-300 border border-charcoal-300 dark:border-charcoal-600 rounded-lg hover:bg-charcoal-50 dark:hover:bg-charcoal-800 transition-colors
              focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Cancel Analysis
          </button>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Are you sure? Analysis progress will be lost.
            </p>
            <div className="flex gap-2 ml-2">
              <button
                onClick={handleCancelConfirm}
                className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Yes, cancel
              </button>
              <button
                onClick={handleCancelDismiss}
                className="px-3 py-1.5 text-sm font-medium text-charcoal-600 dark:text-charcoal-400 border border-charcoal-300 dark:border-charcoal-600 rounded-lg hover:bg-charcoal-50 dark:hover:bg-charcoal-800 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
