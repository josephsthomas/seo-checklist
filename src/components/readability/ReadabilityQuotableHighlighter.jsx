/**
 * E-013: Quotable Passages Highlighter
 * Identifies and highlights the top 3-5 most citable sentences
 * Uses heuristics: fact density, clear attribution, definitional structure
 */

import React, { useMemo } from 'react';
import { Quote, Copy, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Score a sentence for "citability" based on heuristics
 */
function scoreSentence(sentence) {
  let score = 0;
  const trimmed = sentence.trim();
  if (trimmed.length < 30 || trimmed.length > 300) return 0;

  // Contains a statistic or number
  if (/\d+(\.\d+)?(%|percent|million|billion|thousand)/i.test(trimmed)) score += 3;
  if (/\d{4}/.test(trimmed)) score += 1; // Contains a year

  // Definitional structure ("X is Y", "X refers to Y", "X means Y")
  if (/\b(is|are|refers to|means|defined as|consists of)\b/i.test(trimmed)) score += 2;

  // Contains attribution ("according to", "research shows")
  if (/\b(according to|research shows|studies show|data shows|experts|survey)\b/i.test(trimmed)) score += 3;

  // Concise (40-120 chars sweet spot for citation)
  if (trimmed.length >= 40 && trimmed.length <= 120) score += 2;
  else if (trimmed.length >= 120 && trimmed.length <= 200) score += 1;

  // Starts with a capitalized word (proper sentence)
  if (/^[A-Z]/.test(trimmed)) score += 1;

  // Contains specific claims
  if (/\b(can|will|should|must|always|never|typically|generally|approximately)\b/i.test(trimmed)) score += 1;

  return score;
}

/**
 * Extract and rank quotable passages from body text
 */
function findQuotablePassages(bodyText, maxPassages = 5) {
  if (!bodyText) return [];

  // Split into sentences
  const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 20);

  const scored = sentences.map(s => ({
    text: s.trim() + '.',
    score: scoreSentence(s)
  }));

  // Sort by score descending, take top N
  return scored
    .filter(s => s.score >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPassages);
}

function CopyButton({ text }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Passage copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-1 text-gray-400 hover:text-teal-500 transition-colors"
      aria-label="Copy passage"
    >
      <Copy className="w-3 h-3" />
    </button>
  );
}

export default function ReadabilityQuotableHighlighter({ bodyText, aiQuotables }) {
  const passages = useMemo(() => {
    // Prefer AI-identified quotables if available
    if (aiQuotables && aiQuotables.length > 0) {
      return aiQuotables.map(q => ({
        text: typeof q === 'string' ? q : q.text,
        score: typeof q === 'string' ? 5 : (q.score || 5),
        source: 'ai'
      }));
    }
    // Fallback to heuristic-based extraction
    return findQuotablePassages(bodyText).map(p => ({ ...p, source: 'heuristic' }));
  }, [bodyText, aiQuotables]);

  if (!passages.length) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic p-3">
        No highly citable passages detected. Consider adding factual claims, statistics, or clear definitions.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
        <Quote className="w-4 h-4 text-teal-500" aria-hidden="true" />
        <span>Most Citable Passages</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({passages[0].source === 'ai' ? 'AI-identified' : 'Heuristic'})
        </span>
      </div>

      {passages.map((passage, i) => (
        <div
          key={i}
          className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border-l-3 border-amber-400 rounded-r text-sm"
        >
          <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <blockquote className="flex-1 text-gray-800 dark:text-gray-200 italic">
            &ldquo;{passage.text}&rdquo;
          </blockquote>
          <CopyButton text={passage.text} />
        </div>
      ))}
    </div>
  );
}

export { findQuotablePassages, scoreSentence };
