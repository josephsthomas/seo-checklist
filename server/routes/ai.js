/**
 * AI Route — Multi-Provider LLM Routing
 *
 * Handles two request formats:
 *
 * Format A (legacy tools — suggestionService, imageAltService, etc.):
 *   POST / with { prompt, maxTokens, image?, mediaType?, system? }
 *   → Routes to Claude only, returns { content: "..." }
 *
 * Format B (readability — llmPreview.js, aiAnalyzer.js):
 *   POST / with { provider, model, task, content, parameters }
 *   → Routes to Claude/OpenAI/Gemini based on provider field, returns { content: "..." }
 */

const express = require('express');
const { callProvider, callAnthropic, callAnthropicMultiModal } = require('../utils/providers');

const router = express.Router();

// Per-provider timeouts — Claude/GPT-4o can take 30-60s on large prompts
const PROVIDER_TIMEOUTS = {
  anthropic: 90000,  // Claude Sonnet: 30-60s on 50K-char prompts
  openai:    90000,  // GPT-4o: similar latency profile
  google:    45000,  // Gemini Flash: faster inference
  default:   60000
};

router.post('/', async (req, res) => {
  const { provider, model, task, content, parameters, prompt, maxTokens, image, mediaType, system, messages } = req.body;

  try {
    let result;

    if (provider) {
      // Format B: Multi-provider readability request
      result = await handleMultiProvider(provider, content, model, parameters);
    } else if (messages) {
      // Direct Claude messages format (from old DEPLOYMENT.md example)
      result = await handleDirectMessages(messages, model, maxTokens, system);
    } else if (prompt) {
      // Format A: Legacy Claude-only request
      result = await handleLegacyClaude(prompt, maxTokens, image, mediaType, system);
    } else {
      return res.status(400).json({
        error: 'Invalid request: must include "provider" field (multi-provider) or "prompt" field (legacy Claude)',
        code: 'INVALID_REQUEST'
      });
    }

    res.json(result);
  } catch (err) {
    handleAIError(err, res);
  }
});

/**
 * Handle multi-provider request (Format B)
 * { provider, model, task, content, parameters }
 */
async function handleMultiProvider(provider, content, model, parameters) {
  if (!content) {
    throw Object.assign(new Error('Missing "content" field'), { status: 400 });
  }

  const options = {
    model,
    temperature: parameters?.temperature,
    max_tokens: parameters?.max_tokens
  };

  const timeoutMs = PROVIDER_TIMEOUTS[provider] || PROVIDER_TIMEOUTS.default;
  const result = await withTimeout(
    callProvider(provider, content, options),
    timeoutMs
  );

  // Return unified format: { content: "..." }
  return { content: result.content, model: result.model };
}

/**
 * Handle direct messages format (from old snippet: { messages, model, max_tokens, system })
 */
async function handleDirectMessages(messages, model, maxTokens, system) {
  // Reuse shared callAnthropic provider instead of creating duplicate SDK instance
  const promptParts = messages.map(m => {
    const role = m.role === 'user' ? 'Human' : 'Assistant';
    return `${role}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`;
  });
  const prompt = promptParts.join('\n\n');
  const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;

  const result = await withTimeout(
    callAnthropic(fullPrompt, { max_tokens: maxTokens || 4096, model }),
    PROVIDER_TIMEOUTS.anthropic
  );

  return { content: result.content, model: result.model };
}

/**
 * Handle legacy Claude request (Format A)
 * { prompt, maxTokens, image?, mediaType? }
 */
async function handleLegacyClaude(prompt, maxTokens, image, mediaType, system) {
  if (image && mediaType) {
    // Multi-modal request (imageAltService)
    const result = await withTimeout(
      callAnthropicMultiModal(prompt, image, mediaType, {
        max_tokens: maxTokens || 4096,
        system
      }),
      PROVIDER_TIMEOUTS.anthropic
    );
    return { content: result.content, model: result.model };
  }

  // Text-only request
  const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;
  const result = await withTimeout(
    callAnthropic(fullPrompt, { max_tokens: maxTokens || 4096 }),
    PROVIDER_TIMEOUTS.anthropic
  );

  return { content: result.content, model: result.model };
}

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

/**
 * Map provider errors to appropriate HTTP responses
 */
function handleAIError(err, res) {
  const message = err.message || 'AI request failed';

  // Anthropic SDK errors
  if (err.status === 429 || message.includes('rate_limit')) {
    const retryAfter = err.headers?.['retry-after'] || '60';
    res.set('Retry-After', retryAfter);
    return res.status(429).json({
      error: 'Upstream rate limit exceeded. Please retry later.',
      code: 'UPSTREAM_RATE_LIMITED',
      retryAfter: parseInt(retryAfter, 10)
    });
  }

  if (err.status === 401 || err.status === 403) {
    return res.status(502).json({
      error: 'AI provider authentication failed. Check server API key configuration.',
      code: 'PROVIDER_AUTH_ERROR'
    });
  }

  if (err.status === 503 || message.includes('not configured')) {
    return res.status(503).json({
      error: message,
      code: 'PROVIDER_UNAVAILABLE'
    });
  }

  if (err.status === 504 || message.includes('timed out')) {
    return res.status(504).json({
      error: 'AI request timed out. Try again or use a shorter prompt.',
      code: 'PROVIDER_TIMEOUT'
    });
  }

  if (err.status === 400) {
    return res.status(400).json({ error: message, code: 'INVALID_REQUEST' });
  }

  // Generic upstream failure
  console.error('[AI ERROR]', err.message, err.stack);
  return res.status(502).json({
    error: 'AI provider returned an error. Please try again.',
    code: 'PROVIDER_ERROR'
  });
}

module.exports = router;
