import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Award, TrendingUp, Quote, Copy, Check } from 'lucide-react';
import { getGrade, getScoreColor } from '../../lib/readability/utils/gradeMapper';
import ReadabilityTrendSparkline from './ReadabilityTrendSparkline';
import toast from 'react-hot-toast';

/**
 * Copy text to clipboard with fallback
 * BRD 11 §5: Clipboard Operations
 */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Grade color classes for score display
 */
function getGradeClasses(score) {
  if (score >= 90) return {
    bg: 'bg-emerald-500',
    text: 'text-emerald-500 dark:text-emerald-400',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    ring: 'ring-emerald-200 dark:ring-emerald-800'
  };
  if (score >= 80) return {
    bg: 'bg-teal-500',
    text: 'text-teal-500 dark:text-teal-400',
    badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
    ring: 'ring-teal-200 dark:ring-teal-800'
  };
  if (score >= 70) return {
    bg: 'bg-amber-500',
    text: 'text-amber-500 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    ring: 'ring-amber-200 dark:ring-amber-800'
  };
  if (score >= 60) return {
    bg: 'bg-orange-500',
    text: 'text-orange-500 dark:text-orange-400',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    ring: 'ring-orange-200 dark:ring-orange-800'
  };
  return {
    bg: 'bg-red-500',
    text: 'text-red-500 dark:text-red-400',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    ring: 'ring-red-200 dark:ring-red-800'
  };
}

/**
 * Animated score counter
 */
function useAnimatedScore(target, duration = 1000) {
  const [current, setCurrent] = useState(0);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  );

  useEffect(() => {
    if (prefersReducedMotion.current) {
      setCurrent(target);
      return;
    }

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return current;
}

/**
 * SVG circular gauge
 */
function ScoreGauge({ score, size = 120 }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const colors = getGradeClasses(score);
  const gradeInfo = getGrade(score);
  const animatedScore = useAnimatedScore(score);

  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  const dashOffset = circumference - (circumference * animatedScore) / 100;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-charcoal-200 dark:text-charcoal-700"
        />
        {/* Score ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={`${colors.text} ${prefersReducedMotion ? '' : 'transition-all duration-1000'}`}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-4xl font-bold ${colors.text}`}
          aria-hidden="true"
        >
          {animatedScore}
        </span>
        <span className={`text-sm font-semibold px-2 py-0.5 rounded ${colors.badge} mt-1`}>
          {gradeInfo.grade}
        </span>
      </div>
    </div>
  );
}

/**
 * ReadabilityScoreCard — Overall score display with grade, trend, and citation likelihood
 *
 * BRD References: US-2.2.1, E-CMO-03, E-GEO-01, E-CMO-05
 */
export default function ReadabilityScoreCard({
  score,
  grade,
  gradeSummary,
  citationWorthiness,
  trendData = [],
  scoreDelta
}) {
  const [scoreCopied, setScoreCopied] = useState(false);
  const gradeInfo = useMemo(() => getGrade(score), [score]);
  const colors = useMemo(() => getGradeClasses(score), [score]);

  // Trend arrow
  const trendArrow = useMemo(() => {
    if (scoreDelta === null || scoreDelta === undefined) return null;
    if (scoreDelta >= 5) return { icon: '↑', label: `+${scoreDelta} from last analysis`, color: 'text-emerald-500' };
    if (scoreDelta <= -5) return { icon: '↓', label: `${scoreDelta} from last analysis`, color: 'text-red-500' };
    return { icon: '→', label: 'Stable from last analysis', color: 'text-charcoal-400 dark:text-charcoal-500' };
  }, [scoreDelta]);

  // Copy score to clipboard (BRD 11 §5.1)
  const handleCopyScore = useCallback(async () => {
    const text = `AI Readability Score: ${score}/100 (${gradeInfo.grade})`;
    const success = await copyToClipboard(text);
    if (success) {
      setScoreCopied(true);
      toast.success('Score copied');
      setTimeout(() => setScoreCopied(false), 2000);
    } else {
      toast.error('Failed to copy score');
    }
  }, [score, gradeInfo.grade]);

  return (
    <div
      className="bg-white dark:bg-charcoal-800 rounded-xl border border-charcoal-200 dark:border-charcoal-700 p-6"
      aria-label={`Overall score: ${score} out of 100, Grade ${gradeInfo.grade}`}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Score gauge */}
        <div className="flex-shrink-0 relative group">
          <ScoreGauge score={score} size={140} />
          {/* Copy score button */}
          <button
            onClick={handleCopyScore}
            className="absolute -top-1 -right-1 p-1.5 bg-white dark:bg-charcoal-700 border border-charcoal-200 dark:border-charcoal-600 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity shadow-sm hover:bg-charcoal-50 dark:hover:bg-charcoal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label={scoreCopied ? 'Score copied' : 'Copy score to clipboard'}
            title="Copy score"
          >
            {scoreCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-charcoal-400 dark:text-charcoal-500" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Score details */}
        <div className="flex-1 text-center sm:text-left">
          {/* Summary */}
          <p className="text-lg font-medium text-charcoal-900 dark:text-charcoal-100 mb-2">
            {gradeSummary || gradeInfo.summary}
          </p>

          {/* Trend arrow */}
          {trendArrow && (
            <p className={`text-sm ${trendArrow.color} mb-3`}>
              <span className="font-bold mr-1">{trendArrow.icon}</span>
              {trendArrow.label}
            </p>
          )}

          {/* Trend sparkline */}
          {trendData.length >= 2 && (
            <div className="mb-4">
              <ReadabilityTrendSparkline data={trendData} />
            </div>
          )}

          {/* Citation Likelihood Score */}
          {citationWorthiness !== null && citationWorthiness !== undefined && (
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-charcoal-50 dark:bg-charcoal-700/50 rounded-lg">
              <Quote className="w-4 h-4 text-teal-500" aria-hidden="true" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-charcoal-900 dark:text-charcoal-100">
                    {citationWorthiness}/100
                  </span>
                  <span className="text-xs text-charcoal-500 dark:text-charcoal-400">
                    Citation Likelihood
                  </span>
                </div>
                <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                  How likely this content is to be quoted in AI answers
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Screen reader accessible data table */}
      <table className="sr-only">
        <caption>Score Details</caption>
        <tbody>
          <tr><th scope="row">Overall Score</th><td>{score}/100</td></tr>
          <tr><th scope="row">Grade</th><td>{gradeInfo.grade}</td></tr>
          {citationWorthiness !== null && citationWorthiness !== undefined && (
            <tr><th scope="row">Citation Likelihood</th><td>{citationWorthiness}/100</td></tr>
          )}
          {scoreDelta !== null && scoreDelta !== undefined && (
            <tr><th scope="row">Score Change</th><td>{scoreDelta > 0 ? '+' : ''}{scoreDelta}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
