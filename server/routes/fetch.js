/**
 * URL Content Fetching Route
 * POST /api/fetch-url — fetches HTML content from user-provided URLs server-side
 * Includes SSRF protection, redirect following, size limits
 */

const express = require('express');
const { validateUrlForFetch } = require('../utils/ssrfGuard');

const router = express.Router();

const MAX_RESPONSE_SIZE = 10 * 1024 * 1024; // 10MB
const FETCH_TIMEOUT_MS = 30000; // 30 seconds
const MAX_REDIRECTS = 5;
const USER_AGENT = 'ContentStrategyPortal/1.0 AIReadabilityChecker';

router.post('/', async (req, res) => {
  const { url, options = {} } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: { code: 'MISSING_URL', message: 'URL is required' }
    });
  }

  const timeout = Math.min(options.timeout || FETCH_TIMEOUT_MS, FETCH_TIMEOUT_MS);
  const maxRedirects = Math.min(options.maxRedirects || MAX_REDIRECTS, MAX_REDIRECTS);
  const start = Date.now();

  try {
    // SSRF validation
    const validation = await validateUrlForFetch(url);
    if (!validation.safe) {
      return res.status(403).json({
        success: false,
        error: { code: 'BLOCKED_URL', message: validation.error }
      });
    }

    // Fetch with redirect following
    const result = await fetchWithRedirects(url, {
      timeout,
      maxRedirects,
      maxSize: MAX_RESPONSE_SIZE
    });

    const fetchTimeMs = Date.now() - start;

    // Check content type
    const contentType = result.headers['content-type'] || '';
    const isHtml = contentType.includes('text/html') ||
                   contentType.includes('application/xhtml') ||
                   contentType.includes('text/plain');

    if (!isHtml) {
      return res.status(415).json({
        success: false,
        error: {
          code: 'NOT_HTML',
          message: `URL returned ${contentType.split(';')[0]} content, not HTML.`
        }
      });
    }

    // Return in the format the client expects
    // (useReadabilityAnalysis.js reads: data.data.html, data.data.headers, data.data.finalUrl)
    res.json({
      success: true,
      data: {
        html: result.body,
        url: url,
        finalUrl: result.finalUrl || url,
        statusCode: result.statusCode,
        headers: result.headers,
        redirectChain: result.redirectChain || [],
        fetchTimeMs,
        contentLength: result.body.length,
        isJSRendered: false
      }
    });
  } catch (err) {
    const fetchTimeMs = Date.now() - start;
    handleFetchError(err, res, url, fetchTimeMs);
  }
});

/**
 * Fetch URL with manual redirect following and size limits
 */
async function fetchWithRedirects(url, options) {
  let currentUrl = url;
  const redirectChain = [];
  let redirectCount = 0;

  while (redirectCount <= options.maxRedirects) {
    // Re-validate each redirect URL for SSRF
    if (redirectCount > 0) {
      const check = await validateUrlForFetch(currentUrl);
      if (!check.safe) {
        throw Object.assign(
          new Error(`Redirect to blocked URL: ${check.error}`),
          { code: 'BLOCKED_REDIRECT' }
        );
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout);

    let response;
    try {
      response = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.5'
        },
        redirect: 'manual', // Handle redirects manually for SSRF re-validation
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle redirects
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) {
        throw Object.assign(
          new Error('Redirect without Location header'),
          { code: 'INVALID_REDIRECT' }
        );
      }

      const redirectUrl = new URL(location, currentUrl).href;
      redirectChain.push({ from: currentUrl, to: redirectUrl, status: response.status });
      currentUrl = redirectUrl;
      redirectCount++;
      continue;
    }

    // Non-redirect response
    if (!response.ok) {
      throw Object.assign(
        new Error(`HTTP ${response.status}`),
        { code: 'HTTP_ERROR', status: response.status }
      );
    }

    // Check Content-Length before reading body
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > options.maxSize) {
      throw Object.assign(
        new Error(`Response too large: ${contentLength} bytes (max ${options.maxSize})`),
        { code: 'RESPONSE_TOO_LARGE' }
      );
    }

    // Read body with size limit
    const body = await readBodyWithLimit(response, options.maxSize);

    // Collect response headers
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      body,
      finalUrl: currentUrl,
      statusCode: response.status,
      headers,
      redirectChain
    };
  }

  throw Object.assign(
    new Error(`Too many redirects (${options.maxRedirects})`),
    { code: 'TOO_MANY_REDIRECTS' }
  );
}

/**
 * Read response body with size limit
 */
async function readBodyWithLimit(response, maxSize) {
  const reader = response.body.getReader();
  const chunks = [];
  let totalSize = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    totalSize += value.length;
    if (totalSize > maxSize) {
      reader.cancel();
      throw Object.assign(
        new Error(`Response body exceeds ${maxSize} bytes`),
        { code: 'RESPONSE_TOO_LARGE' }
      );
    }

    chunks.push(value);
  }

  const decoder = new TextDecoder('utf-8');
  return chunks.map(chunk => decoder.decode(chunk, { stream: true })).join('') + decoder.decode();
}

/**
 * Map fetch errors to structured responses
 */
function handleFetchError(err, res, url, fetchTimeMs) {
  const message = err.message || 'Failed to fetch URL';

  if (err.name === 'AbortError' || message.includes('aborted')) {
    return res.status(504).json({
      success: false,
      error: { code: 'FETCH_TIMEOUT', message: 'Request timed out', fetchTimeMs }
    });
  }

  if (err.code === 'BLOCKED_URL' || err.code === 'BLOCKED_REDIRECT') {
    return res.status(403).json({
      success: false,
      error: { code: err.code, message }
    });
  }

  if (err.code === 'RESPONSE_TOO_LARGE') {
    return res.status(413).json({
      success: false,
      error: { code: 'RESPONSE_TOO_LARGE', message }
    });
  }

  if (err.code === 'TOO_MANY_REDIRECTS') {
    return res.status(502).json({
      success: false,
      error: { code: 'TOO_MANY_REDIRECTS', message }
    });
  }

  if (err.code === 'HTTP_ERROR') {
    const status = err.status;
    if (status === 404) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Page not found at "${url}"` }
      });
    }
    if (status === 403) {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCESS_DENIED', message: `Access denied by the target server` }
      });
    }
    return res.status(502).json({
      success: false,
      error: { code: 'UPSTREAM_ERROR', message: `Target server returned HTTP ${status}` }
    });
  }

  // DNS, network, or other errors
  if (message.includes('ENOTFOUND') || message.includes('getaddrinfo')) {
    return res.status(502).json({
      success: false,
      error: { code: 'DNS_ERROR', message: `Could not resolve hostname for "${url}"` }
    });
  }

  if (message.includes('ECONNREFUSED') || message.includes('ECONNRESET')) {
    return res.status(502).json({
      success: false,
      error: { code: 'CONNECTION_ERROR', message: `Could not connect to "${url}"` }
    });
  }

  if (message.includes('SSL') || message.includes('certificate')) {
    return res.status(502).json({
      success: false,
      error: { code: 'SSL_ERROR', message: `SSL/TLS error connecting to "${url}"` }
    });
  }

  console.error(JSON.stringify({ level: 'error', correlationId: req.correlationId, source: 'fetch', error: message, stack: err.stack }));
  return res.status(500).json({
    success: false,
    error: { code: 'FETCH_ERROR', message: 'Failed to fetch URL content' }
  });
}

module.exports = router;
