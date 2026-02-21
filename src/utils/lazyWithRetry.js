/**
 * Lazy loading wrapper with retry logic for failed chunk loads
 * Catches network errors and provides graceful error handling
 */
import { lazy } from 'react';
import { logError } from './logger';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Wrap React.lazy with retry logic for chunk loading failures
 * @param {() => Promise<{default: React.ComponentType}>} importFn - Dynamic import function
 * @param {string} moduleName - Module name for error tracking
 */
export function lazyWithRetry(importFn, moduleName = 'component') {
  return lazy(() => retryImport(importFn, moduleName));
}

async function retryImport(importFn, moduleName, retriesLeft = MAX_RETRIES) {
  try {
    return await importFn();
  } catch (error) {
    // Check if it's a chunk loading error
    const isChunkError =
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('dynamically imported module');

    if (isChunkError && retriesLeft > 0) {
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return retryImport(importFn, moduleName, retriesLeft - 1);
    }

    // Log the error with centralized logger for production monitoring
    logError('lazyWithRetry', error, { moduleName, retriesExhausted: true });

    // Re-throw to be caught by ErrorBoundary
    throw new Error(`Failed to load ${moduleName}. Please check your connection and try again.`);
  }
}

export default lazyWithRetry;
