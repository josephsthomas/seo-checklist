/**
 * Centralized error logging utility
 * Wraps console.error with structured context and production error reporting
 */

/**
 * Log an error with structured context
 * @param {string} context - Module/component identifier (e.g., 'ErrorBoundary', 'lazyWithRetry')
 * @param {Error|string} error - The error object or message
 * @param {Object} metadata - Additional context for debugging
 */
export function logError(context, error, metadata = {}) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // Always log to console in all environments
  console.error(`[${context}]`, error);

  if (import.meta.env.PROD) {
    // Production: send to monitoring endpoint
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context,
          message: errorMessage,
          stack: errorStack,
          metadata,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : undefined
        })
      }).catch(() => {
        // Silently fail — don't throw on reporting failure
      });
    } catch {
      // Reporting must never break the app
    }
  }
}

/**
 * Log a warning with context
 * @param {string} context - Module/component identifier
 * @param {string} message - Warning message
 * @param {Object} metadata - Additional context
 */
export function logWarn(context, message, metadata = {}) {
  if (import.meta.env.DEV) {
    console.warn(`[${context}]`, message, metadata);
  }
}

export default { logError, logWarn };
