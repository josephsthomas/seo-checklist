/**
 * ReadabilityCategoryAccordion
 * Expandable category sections showing individual check results.
 * BRD: US-2.2.3, Screen Spec #3 "Score Details" tab
 */

import React, { useState, useCallback } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Layers,
  BookOpen,
  Settings,
  Database,
  Bot,
} from 'lucide-react';
import ReadabilityCheckItem from './ReadabilityCheckItem';

const CATEGORY_CONFIG = {
  contentStructure: {
    label: 'Content Structure',
    short: 'CS',
    icon: Layers,
    description: 'Heading hierarchy, semantic HTML, content organization',
    weight: '20%',
  },
  contentClarity: {
    label: 'Content Clarity',
    short: 'CC',
    icon: BookOpen,
    description: 'Reading level, sentence length, passive voice, jargon',
    weight: '25%',
  },
  technicalAccess: {
    label: 'Technical Accessibility',
    short: 'TA',
    icon: Settings,
    description: 'Page speed, mobile-friendliness, AI crawler access',
    weight: '20%',
  },
  metadataSchema: {
    label: 'Metadata & Schema',
    short: 'MS',
    icon: Database,
    description: 'Title tags, meta descriptions, structured data, Open Graph',
    weight: '15%',
  },
  aiSignals: {
    label: 'AI-Specific Signals',
    short: 'AS',
    icon: Bot,
    description: 'Entity clarity, quotable passages, FAQ structure, citation signals',
    weight: '20%',
  },
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

const GRADE_BADGE_COLORS = {
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
const STATUS_ORDER = { fail: 0, warn: 1, na: 2, pass: 3 };

function sortChecks(checks) {
  return [...checks].sort((a, b) => {
    const statusDiff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
    if (statusDiff !== 0) return statusDiff;
    return (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99);
  });
}

function countIssues(checks) {
  let fail = 0;
  let warn = 0;
  let pass = 0;
  let na = 0;
  for (const check of checks) {
    if (check.status === 'fail') fail++;
    else if (check.status === 'warn') warn++;
    else if (check.status === 'pass') pass++;
    else na++;
  }
  return { fail, warn, pass, na, total: checks.length };
}

function CategorySection({ category, score, checks, isExpanded, onToggle, sectionIndex }) {
  const config = CATEGORY_CONFIG[category] || {
    label: category,
    short: '??',
    icon: Layers,
    description: '',
    weight: '?%',
  };
  const CategoryIcon = config.icon;
  const grade = getGradeFromScore(Math.round(score));
  const sortedChecks = sortChecks(checks);
  const issues = countIssues(checks);
  const headerId = `cat-header-${category}`;
  const panelId = `cat-panel-${category}`;

  return (
    <div className="border border-gray-200 dark:border-charcoal-700 rounded-xl overflow-hidden">
      {/* Accordion header */}
      <button
        id={headerId}
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className="w-full flex items-center gap-3 p-4 text-left bg-white dark:bg-charcoal-800 hover:bg-gray-50 dark:hover:bg-charcoal-750 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-inset"
      >
        {/* Expand/collapse icon */}
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />
        )}

        {/* Category icon */}
        <CategoryIcon className="w-5 h-5 text-teal-500 dark:text-teal-400 flex-shrink-0" aria-hidden="true" />

        {/* Category info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 dark:text-white">
              {config.label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              ({config.weight})
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {config.description}
          </p>
        </div>

        {/* Issue counts */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {issues.fail > 0 && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {issues.fail} fail
            </span>
          )}
          {issues.warn > 0 && (
            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {issues.warn} warn
            </span>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
            {issues.pass}/{issues.total} pass
          </span>
        </div>

        {/* Score + grade */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round(score)}
          </span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${GRADE_BADGE_COLORS[grade.color]}`}>
            {grade.letter}
          </span>
        </div>
      </button>

      {/* Accordion panel */}
      {isExpanded && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          className="border-t border-gray-100 dark:border-charcoal-700 bg-gray-50 dark:bg-charcoal-850 p-4"
        >
          {sortedChecks.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No checks in this category.
            </p>
          ) : (
            <div className="space-y-2">
              {sortedChecks.map((check) => (
                <ReadabilityCheckItem
                  key={check.id || check.name}
                  check={check}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ReadabilityCategoryAccordion({
  categoryScores,
  checkResults,
  defaultExpandedCategory,
}) {
  // Group checks by category
  const checksByCategory = {};
  if (checkResults) {
    for (const check of Object.values(checkResults)) {
      const cat = check.category || 'unknown';
      if (!checksByCategory[cat]) checksByCategory[cat] = [];
      checksByCategory[cat].push(check);
    }
  }

  // Determine default expanded — first category, or the one specified
  const categoryOrder = [
    'contentStructure',
    'contentClarity',
    'technicalAccess',
    'metadataSchema',
    'aiSignals',
  ];

  const initialExpanded = defaultExpandedCategory || categoryOrder[0];
  const [expandedCategories, setExpandedCategories] = useState(
    new Set([initialExpanded])
  );

  const toggleCategory = useCallback((category) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedCategories(new Set(categoryOrder));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedCategories(new Set());
  }, []);

  return (
    <div>
      {/* Expand/Collapse all controls */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Detailed Check Results
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded px-1"
          >
            Expand All
          </button>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded px-1"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Category sections */}
      <div className="space-y-3">
        {categoryOrder.map((category, index) => {
          const scoreData = categoryScores?.[category];
          const score = typeof scoreData === 'number' ? scoreData : scoreData?.score ?? 0;
          const checks = checksByCategory[category] || [];

          return (
            <CategorySection
              key={category}
              category={category}
              score={score}
              checks={checks}
              isExpanded={expandedCategories.has(category)}
              onToggle={() => toggleCategory(category)}
              sectionIndex={index}
            />
          );
        })}
      </div>
    </div>
  );
}
