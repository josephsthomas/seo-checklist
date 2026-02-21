/**
 * ReadabilityRecommendations
 * Recommendations tab — filter bar + recommendation cards.
 * BRD: US-2.4.1, US-2.4.2, FR-4.1, FR-4.2, D-CMO-06, E-CMO-04, Screen Spec #5
 */

import React, { useState, useMemo, useCallback } from 'react';
import EmptyState from '../shared/EmptyState';
import {
  Lightbulb,
  Sparkles,
  Zap,
  Layers,
  FileText,
  Settings,
  Users,
  Code,
} from 'lucide-react';
import ReadabilityRecommendationCard from './ReadabilityRecommendationCard';
import { AIDisclaimerInline } from '../shared/AIDisclaimer';

const FILTER_OPTIONS = [
  { key: 'all', label: 'All', icon: Lightbulb },
  { key: 'quick-wins', label: 'Quick Wins', icon: Zap },
  { key: 'structural', label: 'Structural', icon: Layers },
  { key: 'content', label: 'Content', icon: FileText },
  { key: 'technical', label: 'Technical', icon: Settings },
];

const AUDIENCE_OPTIONS = [
  { key: 'all', label: 'All Teams' },
  { key: 'content', label: 'For Content Team' },
  { key: 'development', label: 'For Development Team' },
];

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

export default function ReadabilityRecommendations({ recommendations, aiAssessment }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [audience, setAudience] = useState('all');

  // Merge AI-specific recommendations (max 5) with check-based recs
  const allRecs = useMemo(() => {
    const recs = [...(recommendations || [])];

    // Add AI-sourced recs if available
    if (aiAssessment?.readabilityIssues) {
      const aiRecs = aiAssessment.readabilityIssues.slice(0, 5).map((issue, i) => ({
        id: `ai-${i}`,
        title: issue.title || issue.issue || `AI Suggestion ${i + 1}`,
        description: issue.description || issue.suggestion || issue.explanation || '',
        priority: issue.priority || 'medium',
        group: issue.group || 'content',
        effort: issue.effort || 'moderate',
        impact: issue.impact || 'medium',
        source: 'ai',
        audience: issue.audience || 'all',
        codeSnippet: issue.codeSnippet || null,
      }));
      recs.push(...aiRecs);
    }

    return recs;
  }, [recommendations, aiAssessment]);

  // Filter recommendations
  const filteredRecs = useMemo(() => {
    let filtered = allRecs;

    // Group filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'quick-wins') {
        filtered = filtered.filter(
          (r) =>
            r.group === 'quick-wins' ||
            (r.impact === 'high' && (r.effort === 'low' || r.effort === 'quick'))
        );
      } else {
        filtered = filtered.filter((r) => r.group === activeFilter);
      }
    }

    // Audience filter
    if (audience !== 'all') {
      filtered = filtered.filter(
        (r) => !r.audience || r.audience === 'all' || r.audience === audience
      );
    }

    // Sort by priority
    return filtered.sort(
      (a, b) =>
        (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)
    );
  }, [allRecs, activeFilter, audience]);

  // Count per filter
  const filterCounts = useMemo(() => {
    const counts = { all: allRecs.length };
    for (const opt of FILTER_OPTIONS) {
      if (opt.key === 'all') continue;
      if (opt.key === 'quick-wins') {
        counts[opt.key] = allRecs.filter(
          (r) =>
            r.group === 'quick-wins' ||
            (r.impact === 'high' && (r.effort === 'low' || r.effort === 'quick'))
        ).length;
      } else {
        counts[opt.key] = allRecs.filter((r) => r.group === opt.key).length;
      }
    }
    return counts;
  }, [allRecs]);

  return (
    <div className="space-y-5">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Filter pills */}
        <div className="flex items-center gap-2 flex-wrap" role="radiogroup" aria-label="Filter recommendations">
          {FILTER_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const count = filterCounts[opt.key] || 0;
            const isActive = activeFilter === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => setActiveFilter(opt.key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                  isActive
                    ? 'bg-teal-500 text-white dark:bg-teal-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-charcoal-700 dark:text-gray-300 dark:hover:bg-charcoal-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {opt.label}
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-500 dark:bg-charcoal-600 dark:text-gray-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Audience toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-charcoal-700 rounded-lg p-1">
          {AUDIENCE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setAudience(opt.key)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                audience === opt.key
                  ? 'bg-white dark:bg-charcoal-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              aria-pressed={audience === opt.key}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI disclaimer */}
      <AIDisclaimerInline />

      {/* Recommendation cards */}
      {filteredRecs.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No recommendations in this category."
          description={activeFilter !== 'all'
            ? 'Try selecting a different filter.'
            : 'Great job — your content looks solid!'}
        />
      ) : (
        <div className="space-y-3">
          {filteredRecs.map((rec, idx) => (
            <ReadabilityRecommendationCard key={rec.id || idx} recommendation={rec} />
          ))}
        </div>
      )}

      {/* AI recommendations note */}
      {allRecs.some((r) => r.source === 'ai') && (
        <div className="flex items-start gap-2 text-xs text-gray-400 dark:text-gray-500">
          <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-purple-400" aria-hidden="true" />
          <p>
            Items marked &ldquo;AI Suggested&rdquo; are generated by AI analysis and may require
            human review before implementation. Maximum 5 AI-specific recommendations are shown.
          </p>
        </div>
      )}
    </div>
  );
}
