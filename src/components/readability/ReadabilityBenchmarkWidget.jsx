/**
 * E-012: Historical Score Benchmarking Widget
 * Shows user's personal average score, trend, and percentile rank
 * Displays as a sparkline widget on the input screen after 5+ analyses
 */

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';

/**
 * Calculate percentile rank from a score against aggregated data
 */
function calculatePercentile(score, allScores) {
  if (!allScores.length) return 50;
  const below = allScores.filter(s => s < score).length;
  return Math.round((below / allScores.length) * 100);
}

/**
 * Mini sparkline SVG for score history
 */
function MiniSparkline({ scores, width = 80, height = 24 }) {
  if (!scores || scores.length < 2) return null;

  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const points = scores.map((score, i) => {
    const x = (i / (scores.length - 1)) * width;
    const y = height - ((score - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const lastScore = scores[scores.length - 1];
  const prevScore = scores[scores.length - 2];
  const color = lastScore >= prevScore ? '#10b981' : '#ef4444';

  return (
    <svg width={width} height={height} className="inline-block" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={(scores.length - 1) / (scores.length - 1) * width}
        cy={height - ((lastScore - min) / range) * (height - 4) - 2}
        r="2"
        fill={color}
      />
    </svg>
  );
}

export default function ReadabilityBenchmarkWidget({ history = [] }) {
  const stats = useMemo(() => {
    if (!history || history.length < 5) return null;

    const scores = history
      .map(h => h.overallScore)
      .filter(s => typeof s === 'number' && !isNaN(s));

    if (scores.length < 5) return null;

    const avg = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    const recent = scores.slice(-10);
    const trend = recent.length >= 2
      ? recent[recent.length - 1] - recent[0]
      : 0;

    const percentile = calculatePercentile(avg, scores);

    return { avg, trend, percentile, recentScores: recent, count: scores.length };
  }, [history]);

  if (!stats) return null;

  const TrendIcon = stats.trend > 0 ? TrendingUp : stats.trend < 0 ? TrendingDown : Minus;
  const trendColor = stats.trend > 0 ? 'text-emerald-600' : stats.trend < 0 ? 'text-red-500' : 'text-gray-400';

  return (
    <div role="region" aria-label="Score benchmarks" className="bg-white dark:bg-charcoal-800 border border-gray-200 dark:border-charcoal-700 rounded-lg p-3 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-4 h-4 text-teal-500" aria-hidden="true" />
        <span className="font-medium text-gray-900 dark:text-white">Your Benchmarks</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">({stats.count} analyses)</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Average Score */}
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.avg}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Average Score</div>
        </div>

        {/* Trend */}
        <div className="text-center">
          <div className={`flex items-center justify-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-4 h-4" aria-hidden="true" />
            <span
              className="text-lg font-bold"
              aria-label={`Trend: ${stats.trend > 0 ? 'up' : stats.trend < 0 ? 'down' : 'stable'} ${stats.trend > 0 ? '+' : ''}${stats.trend} points`}
            >
              {stats.trend > 0 ? '+' : ''}{stats.trend}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Trend</div>
        </div>

        {/* Percentile */}
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {stats.percentile}<span className="text-xs font-normal">%</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Percentile</div>
        </div>
      </div>

      {/* Sparkline */}
      <div className="mt-2 flex justify-center">
        <MiniSparkline scores={stats.recentScores} width={120} height={20} />
      </div>
    </div>
  );
}
