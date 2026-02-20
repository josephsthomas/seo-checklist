/**
 * Multi-LLM Extraction Orchestrator
 * Sends content to Claude, OpenAI, Gemini via a single batch endpoint
 * Server handles parallel execution and per-provider timeouts
 * Partial failure is expected — each provider result is independent
 */

import { truncateAtSentenceBoundary } from './utils/textAnalysis.js';
import { retryFetch } from './utils/retryFetch.js';

const LLM_PROVIDERS = {
  claude: { provider: 'anthropic', model: 'claude-sonnet-4-5-20250929' },
  openai: { provider: 'openai', model: 'gpt-4o' },
  gemini: { provider: 'google', model: 'gemini-2.0-flash' }
};

function getApiConfig() {
  const proxyUrl = import.meta.env.VITE_AI_PROXY_URL;
  if (proxyUrl) return { proxyUrl };
  return null;
}

function buildExtractionPrompt(sourceUrl) {
  return `You are analyzing a web page${sourceUrl ? ` at URL: ${sourceUrl}` : ''}. Extract the following information and respond in JSON format only:

{
  "extractedTitle": "The page title as you understand it",
  "extractedDescription": "A 1-2 sentence description of the page",
  "primaryTopic": "The main topic of the page",
  "headings": [{"level": 1, "text": "heading text"}],
  "mainContent": "The main content of the page in markdown format (max 2000 words)",
  "entities": [{"name": "entity name", "type": "person|org|product|concept"}],
  "unprocessableContent": [{"description": "what couldn't be processed", "reason": "why"}],
  "usefulnessAssessment": {"score": 7, "explanation": "How useful this page would be for answering user questions (1-10 scale, 10 = most useful)"}
}

PAGE CONTENT:
`;
}

/**
 * Extract content via all supported LLMs using the batch endpoint
 * @param {Object} extractedContent - From extractor.js
 * @param {Object} options - { signal, enabledLLMs, sourceUrl, authToken }
 * @returns {Object} { claude, openai, gemini }
 */
export async function extractWithAllLLMs(extractedContent, options = {}) {
  const truncatedContent = truncateAtSentenceBoundary(extractedContent.textContent, 50000);
  const prompt = buildExtractionPrompt(options.sourceUrl) + truncatedContent;
  const config = getApiConfig();
  const authToken = options.authToken || null;
  const enabledLLMs = options.enabledLLMs || ['claude', 'openai', 'gemini'];
  const start = Date.now();

  if (!config) {
    const output = {};
    enabledLLMs.forEach(llm => {
      const provInfo = LLM_PROVIDERS[llm];
      output[llm] = createErrorResult(llm, provInfo?.model || 'unknown', 'No API configuration', start);
    });
    return output;
  }

  // Build batch request
  const requests = enabledLLMs
    .filter(llm => LLM_PROVIDERS[llm])
    .map(llm => ({
      id: llm,
      provider: LLM_PROVIDERS[llm].provider,
      model: LLM_PROVIDERS[llm].model,
      content: prompt,
      parameters: { temperature: 0.2, max_tokens: 4096 }
    }));

  const batchUrl = config.proxyUrl.replace(/\/$/, '').replace(/\/api\/ai$/, '') + '/api/ai/batch';

  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  try {
    const response = await retryFetch(batchUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ requests }),
      signal: options.signal
    });

    if (!response.ok) {
      // Batch endpoint failed — return errors for all providers
      const output = {};
      enabledLLMs.forEach(llm => {
        const provInfo = LLM_PROVIDERS[llm];
        output[llm] = createErrorResult(llm, provInfo?.model || 'unknown', `Batch API error: ${response.status}`, start);
      });
      return output;
    }

    const data = await response.json();
    const output = {};

    // Map batch results back to per-LLM format
    for (const result of (data.results || [])) {
      const llm = result.id;
      const provInfo = LLM_PROVIDERS[llm];
      if (!provInfo) continue;

      if (result.success && result.content) {
        output[llm] = parseExtractionResponse(llm, result.model || provInfo.model, result.content, start);
      } else {
        output[llm] = createErrorResult(llm, result.model || provInfo.model, result.error || 'Unknown error', start);
      }
    }

    // Fill in any missing LLMs that weren't in the response
    enabledLLMs.forEach(llm => {
      if (!output[llm]) {
        const provInfo = LLM_PROVIDERS[llm];
        output[llm] = createErrorResult(llm, provInfo?.model || 'unknown', 'Not included in batch response', start);
      }
    });

    return output;
  } catch (error) {
    // Complete batch failure — return errors for all providers
    const output = {};
    enabledLLMs.forEach(llm => {
      const provInfo = LLM_PROVIDERS[llm];
      output[llm] = createErrorResult(llm, provInfo?.model || 'unknown', error.message, start);
    });
    return output;
  }
}

function parseExtractionResponse(llm, model, content, startTime) {
  const processingTimeMs = Date.now() - startTime;

  if (!content) {
    return createErrorResult(llm, model, 'Empty response', startTime);
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return createErrorResult(llm, model, 'Could not parse response', startTime);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      llm,
      model,
      success: true,
      error: null,
      rawResponse: content,
      extractedTitle: parsed.extractedTitle || '',
      extractedDescription: parsed.extractedDescription || '',
      primaryTopic: parsed.primaryTopic || '',
      headings: (parsed.headings || []).slice(0, 50),
      mainContent: (parsed.mainContent || '').substring(0, 10000),
      entities: (parsed.entities || []).slice(0, 50),
      unprocessableContent: parsed.unprocessableContent || [],
      usefulnessAssessment: {
        score: Math.max(1, Math.min(10, parsed.usefulnessAssessment?.score || 5)),
        explanation: parsed.usefulnessAssessment?.explanation || ''
      },
      processingTimeMs
    };
  } catch (e) {
    return createErrorResult(llm, model, `Parse error: ${e.message}`, startTime);
  }
}

function createErrorResult(llm, model, error, startTime) {
  return {
    llm,
    model,
    success: false,
    error,
    extractedTitle: '',
    extractedDescription: '',
    primaryTopic: '',
    headings: [],
    mainContent: '',
    entities: [],
    unprocessableContent: [],
    usefulnessAssessment: { score: 0, explanation: '' },
    processingTimeMs: Date.now() - startTime
  };
}

export default extractWithAllLLMs;
