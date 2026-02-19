/**
 * AI Batch Route — Execute multiple LLM requests in a single HTTP call
 *
 * POST /api/ai/batch
 * Body: { requests: [{ id, provider, model, content, parameters }] }
 * Response: { results: [{ id, success, content, model, error }] }
 *
 * Uses Promise.allSettled so partial failure is the norm — one provider
 * timing out doesn't block the others. Each request gets its own
 * per-provider timeout.
 */

const express = require('express');
const { callProvider } = require('../utils/providers');
const { consumeRateLimitTokens } = require('../middleware/rateLimit');

const router = express.Router();

const MAX_BATCH_SIZE = 5;

const PROVIDER_TIMEOUTS = {
  anthropic: 90000,
  openai:    90000,
  google:    45000,
  default:   60000
};

/**
 * Timeout wrapper for async operations
 */
function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(Object.assign(new Error('Request timed out'), { status: 504 }));
    }, ms);

    promise
      .then(result => { clearTimeout(timer); resolve(result); })
      .catch(err => { clearTimeout(timer); reject(err); });
  });
}

router.post('/', async (req, res) => {
  const { requests } = req.body;

  if (!Array.isArray(requests) || requests.length === 0) {
    return res.status(400).json({
      error: 'Invalid request: "requests" must be a non-empty array',
      code: 'INVALID_REQUEST'
    });
  }

  if (requests.length > MAX_BATCH_SIZE) {
    return res.status(400).json({
      error: `Batch size exceeds maximum of ${MAX_BATCH_SIZE}`,
      code: 'BATCH_TOO_LARGE'
    });
  }

  // Consume rate-limit tokens for the entire batch up front
  const userId = req.user?.uid || `ip:${req.ip || req.connection?.remoteAddress || 'unknown'}`;
  const tier = req.user?.plan || 'free';
  const rateLimitError = consumeRateLimitTokens(userId, tier, requests.length);
  if (rateLimitError) {
    res.set('Retry-After', String(rateLimitError.retryAfter));
    res.set('X-RateLimit-Limit', String(rateLimitError.limit));
    res.set('X-RateLimit-Remaining', '0');
    return res.status(429).json({
      error: rateLimitError.message,
      code: 'RATE_LIMITED',
      retryAfter: rateLimitError.retryAfter,
      limit: rateLimitError.limit,
      tier
    });
  }

  // Execute all requests in parallel with per-provider timeouts
  const settled = await Promise.allSettled(
    requests.map(async (item) => {
      const { id, provider, model, content, parameters } = item;

      if (!provider || !content) {
        return { id, success: false, content: null, model: null, error: 'Missing provider or content' };
      }

      const options = {
        model,
        temperature: parameters?.temperature,
        max_tokens: parameters?.max_tokens
      };

      const timeoutMs = PROVIDER_TIMEOUTS[provider] || PROVIDER_TIMEOUTS.default;
      const result = await withTimeout(callProvider(provider, content, options), timeoutMs);
      return { id, success: true, content: result.content, model: result.model, error: null };
    })
  );

  // Map settled results to response format
  const results = settled.map((outcome, idx) => {
    if (outcome.status === 'fulfilled') {
      return outcome.value;
    }
    // Rejected — provider error or timeout
    const reqId = requests[idx]?.id || idx;
    return {
      id: reqId,
      success: false,
      content: null,
      model: null,
      error: outcome.reason?.message || 'Unknown error'
    };
  });

  res.json({ results });
});

module.exports = router;
