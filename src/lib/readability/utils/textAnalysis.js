/**
 * Text Analysis Utilities for AI Readability Checker
 * Provides NLP-like text analysis without external dependencies
 */

/**
 * Count words in text
 * @param {string} text
 * @returns {number}
 */
export function countWords(text) {
  if (!text) return 0;
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Split text into sentences
 * @param {string} text
 * @returns {string[]}
 */
export function splitSentences(text) {
  if (!text) return [];
  // Split on sentence-ending punctuation followed by space or end
  return text
    .replace(/([.!?])\s+/g, '$1|SPLIT|')
    .split('|SPLIT|')
    .map(s => s.trim())
    .filter(s => s.length > 0 && /\w/.test(s));
}

/**
 * Count sentences in text
 * @param {string} text
 * @returns {number}
 */
export function countSentences(text) {
  return splitSentences(text).length;
}

/**
 * Calculate average sentence length in words
 * @param {string} text
 * @returns {number}
 */
export function averageSentenceLength(text) {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return 0;
  const totalWords = sentences.reduce((sum, s) => sum + countWords(s), 0);
  return Math.round((totalWords / sentences.length) * 100) / 100;
}

/**
 * Count syllables in a word (English approximation)
 * @param {string} word
 * @returns {number}
 */
export function countSyllables(word) {
  if (!word) return 0;
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  // Remove silent e
  word = word.replace(/(?:[^leas]es|ed|[^aeiou]e)$/, '');
  word = word.replace(/^y/, '');

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Calculate Flesch Reading Ease score (English only)
 * Returns null for non-English content
 * @param {string} text
 * @param {string|null} language - detected language code
 * @returns {number|null}
 */
export function fleschReadingEase(text, language) {
  // Only calculate for English content
  if (language && language !== 'en') return null;

  const words = text?.split(/\s+/).filter(w => w.length > 0) || [];
  if (words.length === 0) return null;

  const sentences = splitSentences(text);
  if (sentences.length === 0) return null;

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;

  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
  return Math.round(Math.max(0, Math.min(100, score)) * 100) / 100;
}

/**
 * Detect passive voice sentences
 * @param {string} text
 * @returns {{ count: number, total: number, percentage: number, passiveSentences: string[] }}
 */
export function detectPassiveVoice(text) {
  const sentences = splitSentences(text);
  if (sentences.length === 0) return { count: 0, total: 0, percentage: 0, passiveSentences: [] };

  // Passive voice pattern: form of "to be" + past participle
  const passiveSentences = sentences.filter(s => {
    return /\b(is|are|was|were|been|being)\s+\w*(ed|en|wn|ght|lt)\b/i.test(s);
  });

  const percentage = sentences.length > 0 ? Math.round((passiveSentences.length / sentences.length) * 100 * 100) / 100 : 0;

  return {
    count: passiveSentences.length,
    total: sentences.length,
    percentage,
    passiveSentences: passiveSentences.slice(0, 5) // Return max 5 examples
  };
}

/**
 * Detect jargon and unexplained acronyms
 * @param {string} text
 * @returns {{ acronyms: string[], jargonDensity: number, count: number }}
 */
export function detectJargon(text) {
  if (!text) return { acronyms: [], jargonDensity: 0, count: 0 };

  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return { acronyms: [], jargonDensity: 0, count: 0 };

  // Find all-caps words (acronyms) that are 2+ chars
  const acronymPattern = /\b[A-Z]{2,}\b/g;
  const allAcronyms = text.match(acronymPattern) || [];

  // Filter out common non-jargon acronyms
  const commonAcronyms = new Set(['US', 'UK', 'EU', 'URL', 'HTML', 'CSS', 'JS', 'API', 'I', 'A', 'OK', 'AM', 'PM', 'ID', 'IT', 'AI']);
  const uniqueAcronyms = [...new Set(allAcronyms)].filter(a => !commonAcronyms.has(a));

  // Check if acronyms are explained (look for parenthetical explanations)
  const unexplained = uniqueAcronyms.filter(acr => {
    const explainedPattern = new RegExp(`\\(${acr}\\)|${acr}\\s*\\(|${acr}\\s*-\\s*`, 'i');
    return !explainedPattern.test(text);
  });

  const jargonDensity = words.length > 0 ? Math.round((unexplained.length / words.length) * 100 * 100) / 100 : 0;

  return {
    acronyms: unexplained,
    jargonDensity,
    count: unexplained.length
  };
}

/**
 * Count paragraphs and analyze their lengths
 * @param {Array<{text: string, wordCount: number}>} paragraphs
 * @returns {{ count: number, avgLength: number, longParagraphs: number }}
 */
export function analyzeParagraphs(paragraphs) {
  if (!paragraphs || paragraphs.length === 0) {
    return { count: 0, avgLength: 0, longParagraphs: 0 };
  }

  const totalWords = paragraphs.reduce((sum, p) => sum + p.wordCount, 0);
  const avgLength = Math.round(totalWords / paragraphs.length);
  const longParagraphs = paragraphs.filter(p => p.wordCount > 150).length;

  return { count: paragraphs.length, avgLength, longParagraphs };
}

/**
 * Truncate text at sentence boundary
 * @param {string} text
 * @param {number} maxChars
 * @returns {string}
 */
export function truncateAtSentenceBoundary(text, maxChars = 50000) {
  if (!text || text.length <= maxChars) return text;

  // Find the last sentence boundary before maxChars
  const truncated = text.substring(0, maxChars);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('. '),
    truncated.lastIndexOf('! '),
    truncated.lastIndexOf('? '),
    truncated.lastIndexOf('.\n'),
    truncated.lastIndexOf('!\n'),
    truncated.lastIndexOf('?\n')
  );

  if (lastSentenceEnd > maxChars * 0.8) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }

  return truncated;
}
