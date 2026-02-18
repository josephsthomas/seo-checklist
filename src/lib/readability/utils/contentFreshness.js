/**
 * E-018: Content Freshness Signals
 * Evaluate content freshness based on dates and metadata
 */

/**
 * Assess content freshness
 * @param {Object} extracted - Extracted content with metadata
 * @returns {Object} Freshness assessment
 */
export function assessContentFreshness(extracted) {
  const now = new Date();
  const result = {
    publishDate: null,
    modifiedDate: null,
    daysSincePublished: null,
    daysSinceModified: null,
    freshness: 'unknown',
    score: 50, // Neutral default
    details: '',
  };

  // Try to extract dates from metadata
  const metadata = extracted?.metadata || {};
  const structuredData = extracted?.structuredData || [];

  // Check structured data for dates
  for (const sd of structuredData) {
    const data = sd?.data || sd;
    if (data.datePublished) result.publishDate = data.datePublished;
    if (data.dateModified) result.modifiedDate = data.dateModified;
  }

  // Fallback to meta tags
  if (!result.publishDate && metadata.publishDate) result.publishDate = metadata.publishDate;
  if (!result.modifiedDate && metadata.modifiedDate) result.modifiedDate = metadata.modifiedDate;

  // Calculate age
  if (result.modifiedDate || result.publishDate) {
    const referenceDate = new Date(result.modifiedDate || result.publishDate);
    if (!isNaN(referenceDate.getTime())) {
      const days = Math.floor((now - referenceDate) / (1000 * 60 * 60 * 24));
      if (result.modifiedDate) result.daysSinceModified = days;
      if (result.publishDate) result.daysSincePublished = days;

      // Score based on recency
      if (days <= 30) {
        result.freshness = 'fresh';
        result.score = 100;
        result.details = `Updated ${days} days ago — very fresh content.`;
      } else if (days <= 90) {
        result.freshness = 'recent';
        result.score = 85;
        result.details = `Updated ${days} days ago — relatively recent.`;
      } else if (days <= 365) {
        result.freshness = 'aging';
        result.score = 60;
        result.details = `Updated ${days} days ago — consider refreshing.`;
      } else {
        result.freshness = 'stale';
        result.score = 30;
        result.details = `Updated ${days} days ago — stale content may reduce AI citation priority.`;
      }
    }
  } else {
    result.details = 'No publication or modification date found. AI models may deprioritize undated content.';
    result.score = 40;
  }

  return result;
}

export default assessContentFreshness;
