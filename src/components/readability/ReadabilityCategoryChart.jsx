/**
 * ReadabilityCategoryChart
 * Horizontal bar chart showing 5 category scores with grade badges.
 * BRD: US-2.2.2, Screen Spec #3
 * Task 47: Includes error boundary fallback rendering
 */

import React, { useRef, useEffect, useState } from 'react';
import { BarChart3, AlertTriangle } from 'lucide-react';
import EmptyState from '../shared/EmptyState';

const CATEGORY_META = {
  contentStructure: { label: 'Content Structure', short: 'CS', order: 0 },
  contentClarity: { label: 'Content Clarity', short: 'CC', order: 1 },
  technicalAccess: { label: 'Technical Accessibility', short: 'TA', order: 2 },
  metadataSchema: { label: 'Metadata & Schema', short: 'MS', order: 3 },
  aiSignals: { label: 'AI-Specific Signals', short: 'AS', order: 4 },
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
  emerald: {
    bar: 'bg-emerald-500 dark:bg-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  teal: {
    bar: 'bg-teal-500 dark:bg-teal-400',
    badge: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
    text: 'text-teal-600 dark:text-teal-400',
  },
  amber: {
    bar: 'bg-amber-500 dark:bg-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    text: 'text-amber-600 dark:text-amber-400',
  },
  orange: {
    bar: 'bg-orange-500 dark:bg-orange-400',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
    text: 'text-orange-600 dark:text-orange-400',
  },
  red: {
    bar: 'bg-red-500 dark:bg-red-400',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    text: 'text-red-600 dark:text-red-400',
  },
};

function CategoryBar({ category, score, grade, colors, onCategoryClick, animate }) {
  const [width, setWidth] = useState(0);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (reducedMotion.current || !animate) {
      setWidth(score);
    } else {
      const timer = setTimeout(() => setWidth(score), 100);
      return () => clearTimeout(timer);
    }
  }, [score, animate]);

  const meta = CATEGORY_META[category] || { label: category, short: '??', order: 99 };

  return (
    <button
      type="button"
      onClick={() => onCategoryClick?.(category)}
      className="w-full text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg p-2 -m-2 transition-colors hover:bg-gray-50 dark:hover:bg-charcoal-700/50"
      aria-label={`${meta.label}: score ${score} out of 100, grade ${grade.letter}. Click to view details.`}
    >
      {/* Category header row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-6">
            {meta.short}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
            {meta.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${colors.text}`}>
            {score}
          </span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${colors.badge}`}>
            {grade.letter}
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className="h-3 bg-gray-100 dark:bg-charcoal-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${reducedMotion.current ? '' : 'duration-500 ease-out'} ${colors.bar}`}
          style={{ width: `${width}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </button>
  );
}

function ReadabilityCategoryChart({ categoryScores, onCategoryClick }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
  }, []);

  if (!categoryScores || Object.keys(categoryScores).length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="No category data available."
        compact
        className="bg-white dark:bg-charcoal-800"
      />
    );
  }

  // Sort categories by defined order
  const sortedCategories = Object.entries(categoryScores)
    .sort(([a], [b]) => {
      const orderA = CATEGORY_META[a]?.order ?? 99;
      const orderB = CATEGORY_META[b]?.order ?? 99;
      return orderA - orderB;
    });

  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 p-6">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-5 h-5 text-teal-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Category Breakdown</h3>
      </div>

      <div className="space-y-4">
        {sortedCategories.map(([category, data]) => {
          const score = typeof data === 'number' ? data : data?.score ?? 0;
          const grade = getGradeFromScore(score);
          const colors = GRADE_COLORS[grade.color];

          return (
            <CategoryBar
              key={category}
              category={category}
              score={Math.round(score)}
              grade={grade}
              colors={colors}
              onCategoryClick={onCategoryClick}
              animate={animate}
            />
          );
        })}
      </div>

      {/* Weight legend */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-charcoal-700">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Score weights:</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {[
            { label: 'CS', weight: '20%' },
            { label: 'CC', weight: '25%' },
            { label: 'TA', weight: '20%' },
            { label: 'MS', weight: '15%' },
            { label: 'AS', weight: '20%' },
          ].map(({ label, weight }) => (
            <span key={label} className="text-xs text-gray-400 dark:text-gray-500">
              <span className="font-mono">{label}</span> {weight}
            </span>
          ))}
        </div>
      </div>

      {/* Screen reader data table */}
      <table className="sr-only">
        <caption>Category scores breakdown</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Score</th>
            <th scope="col">Grade</th>
          </tr>
        </thead>
        <tbody>
          {sortedCategories.map(([category, data]) => {
            const score = typeof data === 'number' ? data : data?.score ?? 0;
            const grade = getGradeFromScore(Math.round(score));
            const meta = CATEGORY_META[category] || { label: category };
            return (
              <tr key={category}>
                <td>{meta.label}</td>
                <td>{Math.round(score)}/100</td>
                <td>{grade.letter}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Task 47: Error boundary fallback — renders HTML table if chart crashes
 */
class CategoryChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('CategoryChart render error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      const { categoryScores } = this.props;
      return (
        <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Category Breakdown</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Chart could not render. Showing data as table:</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-charcoal-700">
                <th className="text-left py-2 text-gray-600 dark:text-gray-300">Category</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-300">Score</th>
                <th className="text-right py-2 text-gray-600 dark:text-gray-300">Grade</th>
              </tr>
            </thead>
            <tbody>
              {categoryScores && Object.entries(categoryScores).map(([cat, data]) => {
                const score = typeof data === 'number' ? data : data?.score ?? 0;
                const grade = getGradeFromScore(Math.round(score));
                const meta = CATEGORY_META[cat] || { label: cat };
                return (
                  <tr key={cat} className="border-b border-gray-100 dark:border-charcoal-700">
                    <td className="py-2 text-gray-700 dark:text-gray-200">{meta.label}</td>
                    <td className="py-2 text-right font-mono text-gray-700 dark:text-gray-200">{Math.round(score)}</td>
                    <td className="py-2 text-right font-semibold text-gray-700 dark:text-gray-200">{grade.letter}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    return this.props.children;
  }
}

function ReadabilityCategoryChartWithFallback(props) {
  return (
    <CategoryChartErrorBoundary categoryScores={props.categoryScores}>
      <ReadabilityCategoryChart {...props} />
    </CategoryChartErrorBoundary>
  );
}

export default ReadabilityCategoryChartWithFallback;
