/**
 * E-011: Multi-Language Readability Formulas
 * Language-aware readability scoring beyond English-only Flesch
 */

/**
 * Flesch Reading Ease (English)
 * Score 0-100, higher = easier
 */
export function fleschReadingEase(totalWords, totalSentences, totalSyllables) {
  if (!totalWords || !totalSentences) return null;
  return 206.835 - 1.015 * (totalWords / totalSentences) - 84.6 * (totalSyllables / totalWords);
}

/**
 * LIX (Scandinavian languages: Swedish, Danish, Norwegian)
 * Score: lower = easier. <30 very easy, 30-40 easy, 40-50 medium, 50-60 hard, >60 very hard
 */
export function lixScore(totalWords, totalSentences, longWords) {
  if (!totalWords || !totalSentences) return null;
  return (totalWords / totalSentences) + (longWords / totalWords) * 100;
}

/**
 * Fernandez-Huerta (Spanish)
 * Adaptation of Flesch for Spanish. Score 0-100, higher = easier.
 */
export function fernandezHuerta(totalWords, totalSentences, totalSyllables) {
  if (!totalWords || !totalSentences) return null;
  return 206.84 - 0.60 * (totalSyllables / totalWords * 100) - 1.02 * (totalWords / totalSentences);
}

/**
 * Gulpease Index (Italian)
 * Score 0-100, higher = easier
 */
export function gulpeaseIndex(totalWords, totalSentences, totalChars) {
  if (!totalWords || !totalSentences) return null;
  return 89 + (300 * totalSentences - 10 * totalChars) / totalWords;
}

/**
 * Select appropriate formula based on language
 */
export function getReadabilityScore(language, stats) {
  const { totalWords, totalSentences, totalSyllables, longWords, totalChars } = stats;

  switch (language?.toLowerCase()?.substring(0, 2)) {
    case 'en':
      return { formula: 'Flesch Reading Ease', score: fleschReadingEase(totalWords, totalSentences, totalSyllables), scale: '0-100 (higher = easier)' };
    case 'sv':
    case 'da':
    case 'no':
    case 'nb':
    case 'nn':
      return { formula: 'LIX', score: lixScore(totalWords, totalSentences, longWords), scale: 'lower = easier' };
    case 'es':
      return { formula: 'Fernandez-Huerta', score: fernandezHuerta(totalWords, totalSentences, totalSyllables), scale: '0-100 (higher = easier)' };
    case 'it':
      return { formula: 'Gulpease', score: gulpeaseIndex(totalWords, totalSentences, totalChars), scale: '0-100 (higher = easier)' };
    default:
      // Fallback to Flesch for unsupported languages
      return { formula: 'Flesch Reading Ease (fallback)', score: fleschReadingEase(totalWords, totalSentences, totalSyllables), scale: '0-100 (higher = easier)' };
  }
}

export default getReadabilityScore;
