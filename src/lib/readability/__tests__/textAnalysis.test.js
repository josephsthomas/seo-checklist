/**
 * Text Analysis Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  countWords,
  splitSentences,
  countSentences,
  averageSentenceLength,
  countSyllables,
  fleschReadingEase,
  detectPassiveVoice,
  detectJargon,
  analyzeParagraphs,
  truncateAtSentenceBoundary,
} from '../utils/textAnalysis.js';

describe('countWords', () => {
  it('counts words correctly', () => {
    expect(countWords('Hello world')).toBe(2);
    expect(countWords('One two three four five')).toBe(5);
  });

  it('handles multiple spaces', () => {
    expect(countWords('Hello   world')).toBe(2);
  });

  it('returns 0 for empty/null input', () => {
    expect(countWords('')).toBe(0);
    expect(countWords(null)).toBe(0);
    expect(countWords(undefined)).toBe(0);
  });

  it('handles single word', () => {
    expect(countWords('Hello')).toBe(1);
  });
});

describe('splitSentences', () => {
  it('splits on periods', () => {
    const sentences = splitSentences('First sentence. Second sentence. Third one.');
    expect(sentences).toHaveLength(3);
  });

  it('splits on exclamation marks', () => {
    const sentences = splitSentences('Wow! That is great.');
    expect(sentences).toHaveLength(2);
  });

  it('splits on question marks', () => {
    const sentences = splitSentences('Is this working? Yes it is.');
    expect(sentences).toHaveLength(2);
  });

  it('returns empty array for null/empty', () => {
    expect(splitSentences('')).toEqual([]);
    expect(splitSentences(null)).toEqual([]);
  });

  it('handles single sentence without trailing period', () => {
    const sentences = splitSentences('Just one sentence');
    expect(sentences).toHaveLength(1);
  });
});

describe('countSyllables', () => {
  it('counts single-syllable words', () => {
    expect(countSyllables('cat')).toBe(1);
    expect(countSyllables('dog')).toBe(1);
    expect(countSyllables('the')).toBe(1);
  });

  it('counts multi-syllable words', () => {
    expect(countSyllables('beautiful')).toBeGreaterThanOrEqual(2);
    expect(countSyllables('information')).toBeGreaterThanOrEqual(3);
  });

  it('handles empty input', () => {
    expect(countSyllables('')).toBe(0);
    expect(countSyllables(null)).toBe(0);
  });
});

describe('fleschReadingEase', () => {
  it('returns a number for English content', () => {
    const text = 'The cat sat on the mat. The dog ran in the park. It was a nice day.';
    const score = fleschReadingEase(text, 'en');
    expect(score).toBeTypeOf('number');
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('returns high score for simple text', () => {
    const simpleText = 'The cat sat. The dog ran. The bird sang. It was fun.';
    const score = fleschReadingEase(simpleText, 'en');
    expect(score).toBeGreaterThan(70);
  });

  it('returns lower score for complex text', () => {
    const complexText = 'The implementation of sophisticated methodological approaches necessitates comprehensive understanding of paradigmatic frameworks within organizational contexts.';
    const score = fleschReadingEase(complexText, 'en');
    expect(score).toBeLessThan(40);
  });

  it('returns null for non-English content', () => {
    const text = 'Dies ist ein deutscher Text.';
    expect(fleschReadingEase(text, 'de')).toBeNull();
    expect(fleschReadingEase(text, 'fr')).toBeNull();
  });

  it('returns null for empty text', () => {
    expect(fleschReadingEase('', 'en')).toBeNull();
  });

  it('works without explicit language (defaults to English)', () => {
    const text = 'Simple text here. Easy to read. Short sentences.';
    const score = fleschReadingEase(text, null);
    expect(score).toBeTypeOf('number');
  });
});

describe('detectPassiveVoice', () => {
  it('detects passive voice sentences', () => {
    const text = 'The report was written by the team. The project is completed.';
    const result = detectPassiveVoice(text);
    expect(result.count).toBeGreaterThan(0);
    expect(result.passiveSentences.length).toBeGreaterThan(0);
  });

  it('returns zero for active voice', () => {
    const text = 'The team wrote the report. They completed the project quickly.';
    const result = detectPassiveVoice(text);
    expect(result.count).toBe(0);
  });

  it('calculates percentage correctly', () => {
    const result = detectPassiveVoice('The report was written. The team worked hard.');
    expect(result.total).toBe(2);
    expect(result.percentage).toBeGreaterThanOrEqual(0);
    expect(result.percentage).toBeLessThanOrEqual(100);
  });

  it('handles empty text', () => {
    const result = detectPassiveVoice('');
    expect(result.count).toBe(0);
    expect(result.total).toBe(0);
  });
});

describe('detectJargon', () => {
  it('detects unexplained acronyms', () => {
    const text = 'The ROI and KPI metrics showed improvement in our CRM system.';
    const result = detectJargon(text);
    expect(result.count).toBeGreaterThan(0);
    expect(result.acronyms.length).toBeGreaterThan(0);
  });

  it('ignores common acronyms', () => {
    const text = 'The URL uses HTML and CSS with an API endpoint.';
    const result = detectJargon(text);
    // These are all in the common list, so should not be flagged
    expect(result.acronyms).not.toContain('HTML');
    expect(result.acronyms).not.toContain('CSS');
    expect(result.acronyms).not.toContain('API');
  });

  it('returns empty for no jargon', () => {
    const text = 'This is a simple sentence with no special terms.';
    const result = detectJargon(text);
    expect(result.count).toBe(0);
  });

  it('handles empty text', () => {
    const result = detectJargon('');
    expect(result.count).toBe(0);
    expect(result.acronyms).toEqual([]);
  });
});

describe('analyzeParagraphs', () => {
  it('analyzes paragraph array', () => {
    const paragraphs = [
      { text: 'Short one.', wordCount: 2 },
      { text: 'Another short paragraph with more words.', wordCount: 6 },
    ];
    const result = analyzeParagraphs(paragraphs);
    expect(result.count).toBe(2);
    expect(result.avgLength).toBe(4);
    expect(result.longParagraphs).toBe(0);
  });

  it('identifies long paragraphs (>150 words)', () => {
    const paragraphs = [
      { text: 'Short.', wordCount: 1 },
      { text: 'Very long paragraph.', wordCount: 200 },
    ];
    const result = analyzeParagraphs(paragraphs);
    expect(result.longParagraphs).toBe(1);
  });

  it('handles empty input', () => {
    expect(analyzeParagraphs([])).toEqual({ count: 0, avgLength: 0, longParagraphs: 0 });
    expect(analyzeParagraphs(null)).toEqual({ count: 0, avgLength: 0, longParagraphs: 0 });
  });
});

describe('truncateAtSentenceBoundary', () => {
  it('does not truncate short text', () => {
    const text = 'Short text here.';
    expect(truncateAtSentenceBoundary(text, 1000)).toBe(text);
  });

  it('truncates at sentence boundary', () => {
    // Function requires last sentence end to be > 80% of maxChars to use it
    const text = 'First sentence. Second sentence. Third sentence. Fourth sentence that is much longer and pushes us over the limit.';
    const result = truncateAtSentenceBoundary(text, 55);
    // Should truncate after "Third sentence." (position 48) which is >80% of 55 (44)
    expect(result.length).toBeLessThanOrEqual(55);
    expect(result).toContain('First sentence');
  });

  it('handles null input', () => {
    expect(truncateAtSentenceBoundary(null)).toBeNull();
    expect(truncateAtSentenceBoundary('')).toBe('');
  });
});
