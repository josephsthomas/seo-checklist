/**
 * E-015: Fact Density Score
 * New check (CC-11) measuring fact density per 1000 words
 * Higher fact density correlates with AI citation likelihood
 */

/**
 * Count factual indicators in text
 */
function countFactualIndicators(text) {
  if (!text) return { statistics: 0, dates: 0, citations: 0, specificClaims: 0, total: 0 };

  // Statistics: numbers with context (percentages, dollars, units)
  const statistics = (text.match(/\d+(\.\d+)?(\s*)(%|percent|million|billion|thousand|USD|\$|€|£|kg|mb|gb|ms|hours|days|years|users|customers|companies)/gi) || []).length;

  // Dates: specific years, date patterns
  const dates = (text.match(/\b(19|20)\d{2}\b/g) || []).length
    + (text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}/gi) || []).length;

  // Citations/references: "according to", "study", "research"
  const citations = (text.match(/\b(according to|cited by|research by|study by|published in|reported by|survey of|data from)\b/gi) || []).length;

  // Specific claims: named entities with verbs
  const specificClaims = (text.match(/\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\s+(announced|released|reported|found|discovered|showed|developed|created|launched|introduced)\b/g) || []).length;

  return {
    statistics,
    dates,
    citations,
    specificClaims,
    total: statistics + dates + citations + specificClaims
  };
}

/**
 * Run fact density check (CC-11)
 * @param {Object} extracted - Extracted content object
 * @returns {Object} Check result
 */
export function checkFactDensity(extracted) {
  const bodyText = extracted?.textContent || '';
  const wordCount = extracted?.wordCount || bodyText.split(/\s+/).length;

  if (wordCount < 100) {
    return {
      id: 'CC-11',
      title: 'Fact Density Score',
      category: 'contentClarity',
      status: 'na',
      severity: 'medium',
      description: 'Measures the density of factual claims, statistics, and citations per 1000 words.',
      details: 'Insufficient content to measure fact density (minimum 100 words).',
      recommendation: 'Add more content to enable fact density analysis.',
      factDensity: null
    };
  }

  const indicators = countFactualIndicators(bodyText);
  const densityPer1000 = Math.round((indicators.total / wordCount) * 1000 * 10) / 10;

  // Thresholds:
  // High density: 8+ per 1000 words (pass)
  // Medium density: 4-7 per 1000 words (warn)
  // Low density: <4 per 1000 words (fail)
  let status;
  if (densityPer1000 >= 8) status = 'pass';
  else if (densityPer1000 >= 4) status = 'warn';
  else status = 'fail';

  return {
    id: 'CC-11',
    title: 'Fact Density Score',
    category: 'contentClarity',
    status,
    severity: 'medium',
    description: 'Measures the density of factual claims, statistics, and citations per 1000 words. Higher fact density correlates with AI citation likelihood.',
    details: `Fact density: ${densityPer1000} per 1000 words. Found: ${indicators.statistics} statistics, ${indicators.dates} dates, ${indicators.citations} citations, ${indicators.specificClaims} specific claims.`,
    recommendation: status === 'pass'
      ? 'Good fact density. Content is well-supported with data and citations.'
      : 'Increase factual density by adding specific statistics, dates, citations, and named sources. AI models prefer content with verifiable claims.',
    factDensity: densityPer1000,
    indicators
  };
}

export { countFactualIndicators };
export default checkFactDensity;
