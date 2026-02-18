/**
 * Multi-LLM Extraction Orchestrator
 * Sends content to Claude, OpenAI, Gemini in parallel
 * Each function catches its own errors (never rejects)
 * Perplexity is Phase 2 - not implemented
 */

import { truncateAtSentenceBoundary } from './utils/textAnalysis.js';

const EXTRACTION_TIMEOUT_MS = 60000;

function getApiConfig() {
  const proxyUrl = import.meta.env.VITE_AI_PROXY_URL;
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
  if (proxyUrl) return { useProxy: true, proxyUrl };
  if (apiKey) return { useProxy: false, apiKey };
  return null;
}

const EXTRACTION_PROMPT = `You are analyzing a web page. Extract the following information and respond in JSON format only:

{
  "extractedTitle": "The page title as you understand it",
  "extractedDescription": "A 1-2 sentence description of the page",
  "primaryTopic": "The main topic of the page",
  "headings": [{"level": 1, "text": "heading text"}],
  "mainContent": "The main content of the page in markdown format (max 2000 words)",
  "entities": [{"name": "entity name", "type": "person|org|product|concept"}],
  "unprocessableContent": [{"description": "what couldn't be processed", "reason": "why"}],
  "usefulnessAssessment": {"score": 75, "explanation": "How useful this page would be for answering user questions"}
}

PAGE CONTENT:
`;

/**
 * Extract content via all supported LLMs in parallel
 * @param {Object} extractedContent - From extractor.js
 * @param {Object} options - { signal, enabledLLMs }
 * @returns {Object} { claude, openai, gemini }
 */
export async function extractWithAllLLMs(extractedContent, options = {}) {
  const truncatedContent = truncateAtSentenceBoundary(extractedContent.textContent, 50000);
  const prompt = EXTRACTION_PROMPT + truncatedContent;
  const config = getApiConfig();

  const enabledLLMs = options.enabledLLMs || ['claude', 'openai', 'gemini'];

  const tasks = [];
  if (enabledLLMs.includes('claude')) {
    tasks.push(extractWithClaude(prompt, config, options.signal).then(r => ['claude', r]));
  }
  if (enabledLLMs.includes('openai')) {
    tasks.push(extractWithOpenAI(prompt, config, options.signal).then(r => ['openai', r]));
  }
  if (enabledLLMs.includes('gemini')) {
    tasks.push(extractWithGemini(prompt, config, options.signal).then(r => ['gemini', r]));
  }

  const results = await Promise.all(tasks);

  const output = {};
  results.forEach(([name, result]) => {
    output[name] = result;
  });

  return output;
}

async function extractWithClaude(prompt, config, signal) {
  const start = Date.now();
  try {
    if (!config) {
      return createErrorResult('claude', 'claude-sonnet-4-5-20250929', 'No API configuration', start);
    }

    let response;
    if (config.useProxy) {
      response = await fetchWithTimeout(config.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt, maxTokens: 4096,
          tool: 'readability-llm-preview', llm: 'claude'
        }),
        signal
      });
    } else {
      response = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }]
        }),
        signal
      });
    }

    if (!response.ok) {
      return createErrorResult('claude', 'claude-sonnet-4-5-20250929', `API error: ${response.status}`, start);
    }

    const data = await response.json();
    const content = config.useProxy
      ? data.content || data.text || data.response
      : data.content?.[0]?.text;

    return parseExtractionResponse('claude', 'claude-sonnet-4-5-20250929', content, start);
  } catch (error) {
    return createErrorResult('claude', 'claude-sonnet-4-5-20250929', error.message, start);
  }
}

async function extractWithOpenAI(prompt, config, signal) {
  const start = Date.now();
  try {
    if (!config?.useProxy) {
      return createErrorResult('openai', 'gpt-4o', 'OpenAI requires proxy configuration', start);
    }

    const response = await fetchWithTimeout(config.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt, maxTokens: 4096,
        tool: 'readability-llm-preview', llm: 'openai'
      }),
      signal
    });

    if (!response.ok) {
      return createErrorResult('openai', 'gpt-4o', `API error: ${response.status}`, start);
    }

    const data = await response.json();
    const content = data.content || data.text || data.response || data.choices?.[0]?.message?.content;
    return parseExtractionResponse('openai', 'gpt-4o', content, start);
  } catch (error) {
    return createErrorResult('openai', 'gpt-4o', error.message, start);
  }
}

async function extractWithGemini(prompt, config, signal) {
  const start = Date.now();
  try {
    if (!config?.useProxy) {
      return createErrorResult('gemini', 'gemini-2.0-flash', 'Gemini requires proxy configuration', start);
    }

    const response = await fetchWithTimeout(config.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt, maxTokens: 4096,
        tool: 'readability-llm-preview', llm: 'gemini'
      }),
      signal
    });

    if (!response.ok) {
      return createErrorResult('gemini', 'gemini-2.0-flash', `API error: ${response.status}`, start);
    }

    const data = await response.json();
    const content = data.content || data.text || data.response || data.candidates?.[0]?.content?.parts?.[0]?.text;
    return parseExtractionResponse('gemini', 'gemini-2.0-flash', content, start);
  } catch (error) {
    return createErrorResult('gemini', 'gemini-2.0-flash', error.message, start);
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
      extractedTitle: parsed.extractedTitle || '',
      extractedDescription: parsed.extractedDescription || '',
      primaryTopic: parsed.primaryTopic || '',
      headings: (parsed.headings || []).slice(0, 50),
      mainContent: (parsed.mainContent || '').substring(0, 10000),
      entities: (parsed.entities || []).slice(0, 50),
      unprocessableContent: parsed.unprocessableContent || [],
      usefulnessAssessment: {
        score: Math.max(0, Math.min(100, parsed.usefulnessAssessment?.score || 50)),
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

async function fetchWithTimeout(url, options, timeoutMs = EXTRACTION_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const existingSignal = options.signal;

  try {
    if (existingSignal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    const response = await fetch(url, {
      ...options,
      signal: existingSignal || controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default extractWithAllLLMs;
