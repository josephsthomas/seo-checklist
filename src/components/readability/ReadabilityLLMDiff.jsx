/**
 * E-003: Side-by-Side LLM Diff View
 * Highlights content differences between two LLM extractions
 */

import React, { useMemo } from 'react';
import { Diff } from 'lucide-react';

/**
 * Simple word-level diff algorithm
 */
function computeWordDiff(textA, textB) {
  if (!textA || !textB) return [];

  const wordsA = textA.split(/\s+/);
  const wordsB = textB.split(/\s+/);
  const setB = new Set(wordsB);
  const setA = new Set(wordsA);

  const result = [];
  for (const word of wordsA) {
    result.push({
      word,
      type: setB.has(word) ? 'common' : 'removed',
    });
  }

  // Words in B but not in A (additions)
  const additions = wordsB.filter(w => !setA.has(w));

  return { shared: result, additions };
}

export default function ReadabilityLLMDiff({ llmA, llmB, nameA, nameB }) {
  const diff = useMemo(() => {
    const contentA = llmA?.mainContent || '';
    const contentB = llmB?.mainContent || '';
    return computeWordDiff(contentA, contentB);
  }, [llmA, llmB]);

  if (!llmA || !llmB) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-sm">Select two LLMs to compare their extractions.</p>
      </div>
    );
  }

  const sharedWords = diff.shared?.filter(w => w.type === 'common').length || 0;
  const removedWords = diff.shared?.filter(w => w.type === 'removed').length || 0;
  const addedWords = diff.additions?.length || 0;
  const totalWords = sharedWords + removedWords + addedWords;
  const overlapPct = totalWords > 0 ? Math.round((sharedWords / totalWords) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Diff className="w-5 h-5 text-teal-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Extraction Diff: {nameA} vs {nameB}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
          {overlapPct}% overlap
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LLM A */}
        <div className="p-4 bg-gray-50 dark:bg-charcoal-700/50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{nameA}</p>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {diff.shared?.map((item, i) => (
              <span
                key={i}
                className={item.type === 'removed' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' : ''}
              >
                {item.word}{' '}
              </span>
            ))}
          </div>
        </div>

        {/* LLM B */}
        <div className="p-4 bg-gray-50 dark:bg-charcoal-700/50 rounded-lg">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{nameB}</p>
          <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {llmB?.mainContent?.split(/\s+/).map((word, i) => {
              const isNew = diff.additions?.includes(word);
              return (
                <span
                  key={i}
                  className={isNew ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300' : ''}
                >
                  {word}{' '}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800" />
          Only in {nameA} ({removedWords} words)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800" />
          Only in {nameB} ({addedWords} words)
        </span>
      </div>
    </div>
  );
}
