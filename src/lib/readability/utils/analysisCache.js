/**
 * E-036: Analysis Result Caching
 * Cache analysis results by URL + content hash for 24 hours
 * Returns cached results instantly if content hasn't changed
 */

import { logError } from '../../../utils/logger';

const CACHE_VERSION = 1;
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
  const len = Math.min(content.length, 50000);
  for (let i = 0; i < len; i++) {
    hash = ((hash << 5) + hash) + content.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  // Include total content length to reduce collision risk for large documents
  // that share the same first 50K chars but differ afterwards
  return `${Math.abs(hash).toString(36)}_${content.length}`;
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

    // Invalidate entries from different cache versions
    if (parsed.cacheVersion !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }

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
  } catch (e) {
    logError('analysisCache.getCachedAnalysis', e);
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
      cacheVersion: CACHE_VERSION,
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
  } catch (e) {
    logError('analysisCache.setCachedAnalysis', e);
  }
}

/**
 * Prune old cache entries if we exceed MAX_CACHE_ENTRIES
 */
export function pruneCache() {
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
  } catch (e) {
    logError('analysisCache.pruneCache', e);
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
  } catch (e) {
    logError('analysisCache.clearAnalysisCache', e);
  }
}

/**
 * Get total size of all analysis cache entries in bytes
 * @returns {Object} Cache size info
 */
export function getCacheSize() {
  let totalBytes = 0;
  let entryCount = 0;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_KEY_PREFIX)) {
        const item = localStorage.getItem(key);
        totalBytes += item ? new Blob([item]).size : 0;
        entryCount++;
      }
    }
  } catch (e) {
    logError('analysisCache.getCacheSize', e);
  }

  return { totalBytes, entryCount, maxEntries: MAX_CACHE_ENTRIES };
}

export { hashContent };
export default { getCachedAnalysis, setCachedAnalysis, clearAnalysisCache, getCacheSize, pruneCache };
