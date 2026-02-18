/**
 * ReadabilityRecommendationCard
 * Individual recommendation card with expandable code fix.
 * BRD: US-2.4.1, US-2.4.2
 */

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ArrowDown,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Zap,
  Clock,
  TrendingUp,
} from 'lucide-react';
import ReadabilityCodeSnippet from './ReadabilityCodeSnippet';

const PRIORITY_CONFIG = {
  critical: {
    icon: AlertCircle,
    iconClass: 'text-red-500 dark:text-red-400',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    border: 'border-l-red-500 dark:border-l-red-400',
  },
  high: {
    icon: AlertTriangle,
    iconClass: 'text-orange-500 dark:text-orange-400',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    border: 'border-l-orange-500 dark:border-l-orange-400',
  },
  medium: {
    icon: Info,
    iconClass: 'text-amber-500 dark:text-amber-400',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    border: 'border-l-amber-500 dark:border-l-amber-400',
  },
  low: {
    icon: ArrowDown,
    iconClass: 'text-blue-500 dark:text-blue-400',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    border: 'border-l-blue-500 dark:border-l-blue-400',
  },
};

const EFFORT_CONFIG = {
  quick: { label: 'Quick Fix', icon: Zap, class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  low: { label: 'Low Effort', icon: Zap, class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  moderate: { label: 'Moderate', icon: Clock, class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  significant: { label: 'Significant', icon: Clock, class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
};

const IMPACT_CONFIG = {
  high: { label: 'High Impact', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  medium: { label: 'Medium Impact', class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  low: { label: 'Low Impact', class: 'bg-gray-100 text-gray-600 dark:bg-charcoal-700 dark:text-gray-400' },
};

export default function ReadabilityRecommendationCard({ recommendation: rec }) {
  const [codeExpanded, setCodeExpanded] = useState(false);

  if (!rec) return null;

  const priority = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.medium;
  const PriorityIcon = priority.icon;
  const effort = EFFORT_CONFIG[rec.effort];
  const impact = IMPACT_CONFIG[rec.impact];
  const EffortIcon = effort?.icon;
  const hasCodeSnippet = rec.codeSnippet || rec.codeBefore || rec.codeAfter;

  return (
    <div
      className={`bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 border-l-4 ${priority.border} overflow-hidden`}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3">
          <PriorityIcon
            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${priority.iconClass}`}
            aria-hidden="true"
          />

          <div className="flex-1 min-w-0">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                {rec.title}
              </h4>
              {rec.source === 'ai' && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 flex-shrink-0">
                  <Sparkles className="w-3 h-3" aria-hidden="true" />
                  AI Suggested
                </span>
              )}
            </div>

            {/* Description */}
            {rec.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-3">
                {rec.description}
              </p>
            )}

            {/* Metadata badges */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {/* Priority */}
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${priority.badge}`}
              >
                {rec.priority}
              </span>

              {/* Effort */}
              {effort && (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${effort.class}`}>
                  {EffortIcon && <EffortIcon className="w-3 h-3" aria-hidden="true" />}
                  {effort.label}
                </span>
              )}

              {/* Impact */}
              {impact && (
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${impact.class}`}>
                  <TrendingUp className="w-3 h-3" aria-hidden="true" />
                  {impact.label}
                </span>
              )}

              {/* Check ID reference */}
              {rec.checkId && (
                <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
                  {rec.checkId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Code fix expandable section */}
      {hasCodeSnippet && (
        <div className="border-t border-gray-100 dark:border-charcoal-700">
          <button
            type="button"
            onClick={() => setCodeExpanded(!codeExpanded)}
            aria-expanded={codeExpanded}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-charcoal-750 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500"
          >
            {codeExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
            )}
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
              View Code Fix
            </span>
          </button>

          {codeExpanded && (
            <div className="px-4 pb-4">
              {rec.codeBefore && rec.codeAfter ? (
                <ReadabilityCodeSnippet
                  before={rec.codeBefore}
                  after={rec.codeAfter}
                  language={rec.codeLanguage || 'html'}
                />
              ) : (
                <ReadabilityCodeSnippet
                  code={rec.codeSnippet}
                  language={rec.codeLanguage || 'html'}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
