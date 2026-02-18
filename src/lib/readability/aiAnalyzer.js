/**
 * AI Analyzer - Claude-powered content assessment
 * Uses existing proxy pattern from metaGeneratorService.js
 * Falls back to rule-based only if Claude unavailable
 */

import { truncateAtSentenceBoundary } from './utils/textAnalysis.js';

const API_TIMEOUT_MS = 45000; // 45 seconds for AI analysis

/**
 * Get API configuration (follows existing pattern)
 */
function getApiConfig() {
  const proxyUrl = import.meta.env.VITE_AI_PROXY_URL;
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (proxyUrl) return { useProxy: true, proxyUrl };
  if (apiKey) return { useProxy: false, apiKey };
  return null;
}

/**
 * Fetch with timeout and abort support
 */
async function fetchWithTimeout(url, options, timeoutMs = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  // Merge abort signals if provided
  const existingSignal = options.signal;

  try {
    const response = await fetch(url, {
      ...options,
      signal: existingSignal || controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
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

  const truncatedContent = truncateAtSentenceBoundary(extractedContent.textContent, 50000);

  const prompt = buildAnalysisPrompt(extractedContent, truncatedContent);

  try {
    let response;

    if (config.useProxy) {
      response = await fetchWithTimeout(config.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          maxTokens: 2048,
          tool: 'readability-analyzer'
        }),
        signal: options.signal
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
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }]
        }),
        signal: options.signal
      });
    }

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return createFallbackResult('Rate limit exceeded. Analysis completed with rule-based scoring only.');
      }
      throw new Error(`AI API request failed: ${status}`);
    }

    const data = await response.json();
    const content = config.useProxy
      ? data.content || data.text || data.response
      : data.content?.[0]?.text;

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

function parseAIResponse(content) {
  if (!content) {
    return createFallbackResult('Empty AI response');
  }

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return createFallbackResult('Could not parse AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      available: true,
      contentSummary: parsed.contentSummary || '',
      qualityAssessment: parsed.qualityAssessment || '',
      qualityScore: Math.max(0, Math.min(100, parsed.qualityScore || 50)),
      citationWorthiness: Math.max(0, Math.min(100, parsed.citationWorthiness || 50)),
      citationExplanation: parsed.citationExplanation || '',
      readabilityIssues: (parsed.readabilityIssues || []).slice(0, 10),
      aiRecommendations: (parsed.aiRecommendations || []).slice(0, 5).map(rec => ({
        title: rec.title || '',
        description: rec.description || '',
        priority: rec.priority || 'medium',
        effort: rec.effort || 'moderate',
        estimatedImpact: rec.estimatedImpact || 'medium',
        source: 'ai'
      })),
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
