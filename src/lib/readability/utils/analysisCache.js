/**
 * E-036: Analysis Result Caching
 * Cache analysis results by URL + content hash for 24 hours
 * Returns cached results instantly if content hasn't changed
 */

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY_PREFIX = 'readability_cache_';
const MAX_CACHE_ENTRIES = 20;
const MAX_CACHE_ENTRY_SIZE = 512 * 1024; // 512KB max per cache entry

/**
 * Simple content hash using DJB2 algorithm
 * @param {string} content - HTML content
 * @returns {string} Hash string
 */
function hashContent(content) {
  let hash = 5381;
  for (let i = 0; i < Math.min(content.length, 50000); i++) {
    hash = ((hash << 5) + hash) + content.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate cache key from URL and content
 */
function getCacheKey(url, contentHash) {
  return `${CACHE_KEY_PREFIX}${url}_${contentHash}`;
}

/**
 * Check if a cached result exists and is still valid
 * @param {string} url - Source URL
 * @param {string} htmlContent - HTML content for hash comparison
 * @returns {Object|null} Cached analysis result or null
 */
export function getCachedAnalysis(url, htmlContent) {
  if (!url || !htmlContent) return null;

  try {
    const contentHash = hashContent(htmlContent);
    const key = getCacheKey(url, contentHash);
    const cached = localStorage.getItem(key);

    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const age = Date.now() - parsed.cachedAt;

    if (age > CACHE_DURATION_MS) {
      localStorage.removeItem(key);
      return null;
    }

    return {
      ...parsed.result,
      _cached: true,
      _cachedAt: new Date(parsed.cachedAt).toISOString(),
      _cacheAge: Math.round(age / (60 * 60 * 1000)) // hours
    };
  } catch {
    return null;
  }
}

/**
 * Store analysis result in cache
 * @param {string} url - Source URL
 * @param {string} htmlContent - HTML content for hash
 * @param {Object} result - Analysis result to cache
 */
export function setCachedAnalysis(url, htmlContent, result) {
  if (!url || !htmlContent || !result) return;

  try {
    const contentHash = hashContent(htmlContent);
    const key = getCacheKey(url, contentHash);

    // Don't cache error results
    if (result.overallScore === 0 && result.grade === 'F') return;

    const cacheEntry = {
      cachedAt: Date.now(),
      contentHash,
      result: {
        overallScore: result.overallScore,
        grade: result.grade,
        gradeColor: result.gradeColor,
        gradeLabel: result.gradeLabel,
        gradeSummary: result.gradeSummary,
        categoryScores: result.categoryScores,
        issueSummary: result.issueSummary,
        checkResults: result.checkResults,
        recommendations: result.recommendations,
        pageTitle: result.pageTitle,
        pageDescription: result.pageDescription,
        language: result.language,
        wordCount: result.wordCount,
        llmExtractions: result.llmExtractions,
        aiAssessment: result.aiAssessment,
        sourceUrl: result.sourceUrl,
        inputMethod: result.inputMethod
      }
    };

    const serialized = JSON.stringify(cacheEntry);
    if (serialized.length > MAX_CACHE_ENTRY_SIZE) {
      console.warn(`Analysis cache entry too large (${(serialized.length / 1024).toFixed(1)}KB), skipping cache`);
      return;
    }
    localStorage.setItem(key, serialized);
    pruneCache();
  } catch {
    // localStorage full or quota exceeded — non-fatal
  }
}

/**
 * Prune old cache entries if we exceed MAX_CACHE_ENTRIES
 */
function pruneCache() {
  try {
    const cacheKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        const cached = JSON.parse(localStorage.getItem(key));
        cacheKeys.push({ key, cachedAt: cached.cachedAt || 0 });
      }
    }

    if (cacheKeys.length > MAX_CACHE_ENTRIES) {
      cacheKeys.sort((a, b) => a.cachedAt - b.cachedAt);
      const toRemove = cacheKeys.slice(0, cacheKeys.length - MAX_CACHE_ENTRIES);
      for (const entry of toRemove) {
        localStorage.removeItem(entry.key);
      }
    }
  } catch {
    // Non-fatal
  }
}

/**
 * Clear all analysis cache entries
 */
export function clearAnalysisCache() {
  try {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        toRemove.push(key);
      }
    }
    for (const key of toRemove) {
      localStorage.removeItem(key);
    }
  } catch {
    // Non-fatal
  }
}

export { hashContent };
export default { getCachedAnalysis, setCachedAnalysis, clearAnalysisCache };
