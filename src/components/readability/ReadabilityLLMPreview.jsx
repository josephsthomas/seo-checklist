/**
 * ReadabilityLLMPreview
 * "How AI Sees Your Content" tab — LLM selection, comparison layout.
 * BRD: US-2.3.1-2.3.5, FR-3.1, FR-3.2, Screen Spec #4
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Eye,
  Columns,
  LayoutList,
  AlertTriangle,
  Info,
} from 'lucide-react';
import ReadabilityLLMColumn from './ReadabilityLLMColumn';
import ReadabilityCoverageTable from './ReadabilityCoverageTable';

const LLM_OPTIONS = [
  { key: 'claude', name: 'Claude', model: 'Claude 3.5 Sonnet' },
  { key: 'openai', name: 'OpenAI', model: 'GPT-4o' },
  { key: 'gemini', name: 'Gemini', model: 'Gemini 1.5 Pro' },
];

export default function ReadabilityLLMPreview({ llmExtractions, aiAssessment }) {
  const [selectedLLMs, setSelectedLLMs] = useState(
    new Set(LLM_OPTIONS.map((l) => l.key))
  );
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' | 'stacked'

  const toggleLLM = useCallback((key) => {
    setSelectedLLMs((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const activeLLMs = useMemo(
    () => LLM_OPTIONS.filter((l) => selectedLLMs.has(l.key)),
    [selectedLLMs]
  );

  const hasData = llmExtractions && Object.keys(llmExtractions).length > 0;

  // Build coverage data for table
  const coverageData = useMemo(() => {
    if (!llmExtractions) return [];
    return LLM_OPTIONS.map((llm) => {
      const data = llmExtractions[llm.key];
      if (!data) return null;
      return {
        llm: llm.name,
        model: llm.model,
        contentCoverage: data.contentCoverage ?? data.coverage?.content ?? null,
        headingsCoverage: data.headingsCoverage ?? data.coverage?.headings ?? null,
        entitiesCoverage: data.entitiesCoverage ?? data.coverage?.entities ?? null,
        usefulness: data.usefulnessScore ?? data.usefulness ?? null,
        processingTime: data.processingTime ?? null,
      };
    }).filter(Boolean);
  }, [llmExtractions]);

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 p-8 text-center">
        <Eye className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          LLM Preview Not Available
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          AI model extractions were not available for this analysis. This may be due to
          API unavailability or the content being too short to analyze.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* LLM selection checkboxes */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Compare:
          </span>
          {LLM_OPTIONS.map((llm) => {
            const isSelected = selectedLLMs.has(llm.key);
            const hasLLMData = !!llmExtractions[llm.key];
            return (
              <label
                key={llm.key}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? 'border-teal-300 bg-teal-50 dark:border-teal-700 dark:bg-teal-900/20'
                    : 'border-gray-200 bg-white dark:border-charcoal-600 dark:bg-charcoal-800'
                } ${!hasLLMData ? 'opacity-50' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleLLM(llm.key)}
                  disabled={!hasLLMData}
                  className="sr-only"
                  aria-label={`Show ${llm.name} extraction`}
                />
                <span
                  className={`w-3 h-3 rounded-sm border flex-shrink-0 flex items-center justify-center ${
                    isSelected
                      ? 'bg-teal-500 border-teal-500 dark:bg-teal-400 dark:border-teal-400'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-sm text-gray-700 dark:text-gray-200">
                  {llm.name}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                  {llm.model}
                </span>
                {!hasLLMData && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">(N/A)</span>
                )}
              </label>
            );
          })}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-charcoal-700 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
              viewMode === 'side-by-side'
                ? 'bg-white dark:bg-charcoal-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            aria-pressed={viewMode === 'side-by-side'}
          >
            <Columns className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Side-by-Side</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('stacked')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
              viewMode === 'stacked'
                ? 'bg-white dark:bg-charcoal-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            aria-pressed={viewMode === 'stacked'}
          >
            <LayoutList className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Stacked</span>
          </button>
        </div>
      </div>

      {/* LLM columns */}
      <div
        className={
          viewMode === 'side-by-side'
            ? `grid gap-4 ${
                activeLLMs.length === 1
                  ? 'grid-cols-1'
                  : activeLLMs.length === 2
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
              }`
            : 'space-y-4'
        }
      >
        {activeLLMs.map((llm, idx) => (
          <ReadabilityLLMColumn
            key={llm.key}
            llmKey={llm.key}
            llmName={llm.name}
            llmModel={llm.model}
            extraction={llmExtractions[llm.key]}
            animationDelay={idx * 100}
          />
        ))}
      </div>

      {/* Coverage comparison table */}
      {coverageData.length > 0 && (
        <ReadabilityCoverageTable data={coverageData} />
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 rounded-xl">
        <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
            About <abbr title="Large Language Model">LLM</abbr> Previews
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-400">
            This preview shows how each <abbr title="Large Language Model">LLM</abbr> (Large Language Model) interprets your content when provided to it.
            It does <strong>NOT</strong> simulate actual web crawling behavior. Real-world
            extraction may vary based on model updates, crawling policies, and content
            accessibility at the time of crawling.
          </p>
        </div>
      </div>
    </div>
  );
}
