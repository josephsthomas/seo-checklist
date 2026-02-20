/**
 * Retry wrapper for fetch with exponential backoff
 * Retries on timeout, 429, and 5xx errors
 */

const DEFAULT_OPTIONS = {
  maxRetries: 1,
  baseDelayMs: 2000,
  retryableStatuses: [429, 500, 502, 503, 504]
};

/**
 * Fetch with retry and exponential backoff
 * @param {string} url
 * @param {RequestInit} fetchOptions
 * @param {Object} retryOptions - { maxRetries, baseDelayMs, retryableStatuses }
 * @returns {Promise<Response>}
 */
export async function retryFetch(url, fetchOptions = {}, retryOptions = {}) {
  const { maxRetries, baseDelayMs, retryableStatuses } = {
    ...DEFAULT_OPTIONS,
    ...retryOptions
  };

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      if (response.ok || !retryableStatuses.includes(response.status)) {
        return response;
      }

      // Retryable status — check for Retry-After header on 429
      if (response.status === 429 && attempt < maxRetries) {
        const retryAfter = response.headers.get('Retry-After');
        const delayMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : baseDelayMs * Math.pow(2, attempt);
        await sleep(delayMs);
        continue;
      }

      if (attempt < maxRetries) {
        await sleep(baseDelayMs * Math.pow(2, attempt));
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;

      // Don't retry aborts
      if (error.name === 'AbortError') throw error;

      if (attempt < maxRetries) {
        await sleep(baseDelayMs * Math.pow(2, attempt));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default retryFetch;
