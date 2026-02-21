/**
 * AI Analyzer - Claude-powered content assessment
 * Uses existing proxy pattern from metaGeneratorService.js
 * Falls back to rule-based only if Claude unavailable
 */

import { truncateAtSentenceBoundary } from './utils/textAnalysis.js';
import { retryFetch } from './utils/retryFetch.js';

const API_TIMEOUT_MS = 120000; // 120s — must exceed server's 90s provider timeout + retry headroom

/**
 * Get API configuration — proxy-only (no direct API key fallback)
 */
function getApiConfig() {
  const proxyUrl = import.meta.env.VITE_AI_PROXY_URL;
  if (proxyUrl) return { proxyUrl };
  return null;
}


/**
 * Check if AI analysis is available
 */
export function isAIAnalysisAvailable() {
  return getApiConfig() !== null;
}

/**
 * Run Claude AI analysis on extracted content
 * @param {Object} extractedContent - From extractor.js
 * @param {Object} options - { signal }
 * @returns {Object} AI assessment results
 */
export async function analyzeWithAI(extractedContent, options = {}) {
  const config = getApiConfig();

  if (!config) {
    return createFallbackResult('AI analysis unavailable - no API configuration found');
  }

  // Reserve ~2000 chars for the prompt template, headings, and metadata
  const TEMPLATE_OVERHEAD = 2000;
  const maxContentLength = 50000 - TEMPLATE_OVERHEAD;
  const truncatedContent = truncateAtSentenceBoundary(extractedContent.textContent, maxContentLength);

  const prompt = buildAnalysisPrompt(extractedContent, truncatedContent);

  const headers = { 'Content-Type': 'application/json' };
  if (options.authToken) {
    headers['Authorization'] = `Bearer ${options.authToken}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    // If caller provides an abort signal, listen for it and abort our controller
    if (options.signal) {
      if (options.signal.aborted) {
        controller.abort();
      } else {
        options.signal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    }
    const signal = controller.signal;

    let response;
    try {
      response = await retryFetch(config.proxyUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          provider: 'anthropic',
          model: 'claude-sonnet-4-5-20250929',
          task: 'readability-analysis',
          content: prompt,
          parameters: {
            temperature: 0.2,
            max_tokens: 4096
          }
        }),
        signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return createFallbackResult('Rate limit exceeded. Analysis completed with rule-based scoring only.');
      }
      throw new Error(`AI API request failed: ${status}`);
    }

    const data = await response.json();
    const content = data.content || data.text || data.response;

    return parseAIResponse(content);
  } catch (error) {
    if (error.name === 'AbortError') {
      return createFallbackResult('Analysis cancelled');
    }
    console.error('AI analysis error:', error);
    return createFallbackResult(`AI analysis unavailable: ${error.message}`);
  }
}

function buildAnalysisPrompt(extractedContent, truncatedContent) {
  return `You are an AI readability expert analyzing web content. Evaluate this content for AI model comprehension.

PAGE TITLE: ${extractedContent.metadata?.title || 'Unknown'}
PAGE URL: ${extractedContent.sourceUrl || 'Not provided'}
WORD COUNT: ${extractedContent.wordCount}
LANGUAGE: ${extractedContent.language || 'Unknown'}

CONTENT:
${truncatedContent}

HEADINGS:
${(extractedContent.headings || []).slice(0, 20).map(h => `${'  '.repeat(h.level - 1)}H${h.level}: ${h.text}`).join('\n')}

Respond in JSON format ONLY:
{
  "contentSummary": "2-3 sentence summary of the page's primary topic and purpose",
  "qualityAssessment": "Brief assessment of content clarity and organization from an AI's perspective",
  "qualityScore": <number 0-100>,
  "citationWorthiness": <number 0-100, how likely this content would be cited in AI answers>,
  "citationExplanation": "Brief explanation of citation worthiness score",
  "readabilityIssues": ["issue 1", "issue 2", "issue 3"],
  "aiRecommendations": [
    {"title": "recommendation title", "description": "detailed actionable description", "priority": "high|medium|low", "effort": "quick|moderate|significant", "estimatedImpact": "high|medium|low"}
  ]
}

Limit aiRecommendations to a maximum of 5. Focus on the most impactful improvements for AI readability.`;
}

/**
 * Extract the first balanced JSON object from a string
 */
function extractBalancedJson(text) {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

function parseAIResponse(content) {
  if (!content) {
    return createFallbackResult('Empty AI response');
  }

  try {
    // Use balanced brace extraction instead of greedy regex
    const jsonStr = extractBalancedJson(content);
    if (!jsonStr) {
      return createFallbackResult('Could not parse AI response');
    }

    const parsed = JSON.parse(jsonStr);

    // Validate numeric fields — reject non-number values
    const qualityScore = typeof parsed.qualityScore === 'number'
      ? Math.round(Math.max(0, Math.min(100, parsed.qualityScore)))
      : 50;
    const citationWorthiness = typeof parsed.citationWorthiness === 'number'
      ? Math.round(Math.max(0, Math.min(100, parsed.citationWorthiness)))
      : 50;

    // Semantic validation: ensure string fields are meaningful
    const contentSummary = typeof parsed.contentSummary === 'string' && parsed.contentSummary.length > 5
      ? parsed.contentSummary.slice(0, 1000) : '';
    const qualityAssessment = typeof parsed.qualityAssessment === 'string' && parsed.qualityAssessment.length > 5
      ? parsed.qualityAssessment.slice(0, 1000) : '';
    const citationExplanation = typeof parsed.citationExplanation === 'string'
      ? parsed.citationExplanation.slice(0, 500) : '';

    // Validate recommendations have required fields
    const validRecommendations = (parsed.aiRecommendations || [])
      .filter(rec => rec && typeof rec === 'object' && rec.title && rec.description)
      .slice(0, 5)
      .map(rec => ({
        title: String(rec.title).slice(0, 200),
        description: String(rec.description).slice(0, 500),
        priority: ['high', 'medium', 'low'].includes(rec.priority) ? rec.priority : 'medium',
        effort: ['quick', 'moderate', 'significant'].includes(rec.effort) ? rec.effort : 'moderate',
        estimatedImpact: ['high', 'medium', 'low'].includes(rec.estimatedImpact) ? rec.estimatedImpact : 'medium',
        source: 'ai'
      }));

    return {
      available: true,
      contentSummary,
      qualityAssessment,
      qualityScore,
      citationWorthiness,
      citationExplanation,
      readabilityIssues: (parsed.readabilityIssues || [])
        .filter(issue => typeof issue === 'string' && issue.length > 0)
        .slice(0, 10)
        .map(issue => String(issue).slice(0, 500)),
      aiRecommendations: validRecommendations,
      aiGenerated: true,
      fallback: false
    };
  } catch (e) {
    console.error('Failed to parse AI response:', e);
    return createFallbackResult('Failed to parse AI response');
  }
}

function createFallbackResult(reason) {
  return {
    available: false,
    contentSummary: '',
    qualityAssessment: '',
    qualityScore: undefined,
    citationWorthiness: undefined,
    citationExplanation: '',
    readabilityIssues: [],
    aiRecommendations: [],
    fallback: true,
    fallbackReason: reason
  };
}

export default analyzeWithAI;
