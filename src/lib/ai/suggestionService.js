/**
 * AI Suggestion Service for SEO Content Optimization
 * Uses Claude API to generate title, meta description, and heading suggestions
 *
 * SECURITY NOTE: In production, API calls should be proxied through a backend
 * to avoid exposing the API key. Set VITE_AI_PROXY_URL to use a backend proxy.
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Get API configuration
 * Prefers backend proxy if configured, falls back to direct API (dev only)
 */
function getApiConfig() {
  const proxyUrl = import.meta.env.VITE_AI_PROXY_URL;
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (proxyUrl) {
    // Production: Use backend proxy (recommended)
    return { useProxy: true, proxyUrl };
  }

  if (apiKey) {
    // Development only: Direct API access is BLOCKED in production
    if (import.meta.env.PROD) {
      throw new Error(
        'Direct Claude API access is blocked in production builds. ' +
        'Configure VITE_AI_PROXY_URL to use a secure backend proxy.'
      );
    }
    return { useProxy: false, apiKey };
  }

  throw new Error('AI suggestions are not configured. Please contact your administrator to set up the AI proxy.');
}

/**
 * Call Claude API (via proxy or direct)
 */
async function callClaude(prompt, maxTokens = 1024) {
  const config = getApiConfig();

  if (config.useProxy) {
    // Use backend proxy (secure, recommended for production)
    const response = await fetch(config.proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Proxy request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.content || data.text || data.response;
  }

  // Direct API access (development only)
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/**
 * Generate optimized title suggestions
 */
export async function suggestTitles(pageData) {
  const { url, currentTitle, h1, metaDescription, contentSummary } = pageData;

  const prompt = `You are an SEO expert. Analyze this page and suggest 3 optimized title tag alternatives.

URL: ${url}
Current Title: ${currentTitle || 'None'}
H1: ${h1 || 'None'}
Meta Description: ${metaDescription || 'None'}
${contentSummary ? `Content Summary: ${contentSummary}` : ''}

Requirements:
- Each title should be 50-60 characters
- Include primary keyword near the beginning
- Make it compelling for click-through
- Unique and descriptive

Respond in JSON format only:
{
  "suggestions": [
    {
      "title": "suggested title here",
      "length": 55,
      "reasoning": "brief explanation"
    }
  ],
  "issues": ["list any issues with current title"]
}`;

  try {
    const response = await callClaude(prompt);
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Title suggestion error:', error);
    throw error;
  }
}

/**
 * Generate optimized meta description suggestions
 */
export async function suggestMetaDescriptions(pageData) {
  const { url, currentTitle, h1, currentMetaDescription, contentSummary } = pageData;

  const prompt = `You are an SEO expert. Analyze this page and suggest 3 optimized meta description alternatives.

URL: ${url}
Title: ${currentTitle || 'None'}
H1: ${h1 || 'None'}
Current Meta Description: ${currentMetaDescription || 'None'}
${contentSummary ? `Content Summary: ${contentSummary}` : ''}

Requirements:
- Each meta description should be 150-160 characters
- Include a clear call-to-action
- Incorporate primary keywords naturally
- Summarize the page value proposition
- Make it compelling for click-through

Respond in JSON format only:
{
  "suggestions": [
    {
      "description": "suggested meta description here",
      "length": 155,
      "reasoning": "brief explanation"
    }
  ],
  "issues": ["list any issues with current meta description"]
}`;

  try {
    const response = await callClaude(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Meta description suggestion error:', error);
    throw error;
  }
}

/**
 * Generate optimized H1 suggestions
 */
export async function suggestH1(pageData) {
  const { url, currentTitle, currentH1, metaDescription, contentSummary } = pageData;

  const prompt = `You are an SEO expert. Analyze this page and suggest 3 optimized H1 heading alternatives.

URL: ${url}
Title: ${currentTitle || 'None'}
Current H1: ${currentH1 || 'None'}
Meta Description: ${metaDescription || 'None'}
${contentSummary ? `Content Summary: ${contentSummary}` : ''}

Requirements:
- H1 should be unique and descriptive
- Include primary keyword
- Should complement (not duplicate) the title
- Clear and scannable

Respond in JSON format only:
{
  "suggestions": [
    {
      "h1": "suggested H1 here",
      "reasoning": "brief explanation"
    }
  ],
  "issues": ["list any issues with current H1"]
}`;

  try {
    const response = await callClaude(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('H1 suggestion error:', error);
    throw error;
  }
}

/**
 * Generate all SEO suggestions for a page
 */
export async function suggestAllSEO(pageData) {
  const { url, title, h1, metaDescription, contentSummary } = pageData;

  const prompt = `You are an SEO expert. Analyze this page and provide comprehensive optimization suggestions.

URL: ${url}
Current Title: ${title || 'None'}
Current H1: ${h1 || 'None'}
Current Meta Description: ${metaDescription || 'None'}
${contentSummary ? `Content Summary: ${contentSummary}` : ''}

Provide optimized alternatives for title (50-60 chars), meta description (150-160 chars), and H1.

Respond in JSON format only:
{
  "title": {
    "suggestions": [
      {"text": "...", "length": 55, "reasoning": "..."}
    ],
    "issues": []
  },
  "metaDescription": {
    "suggestions": [
      {"text": "...", "length": 155, "reasoning": "..."}
    ],
    "issues": []
  },
  "h1": {
    "suggestions": [
      {"text": "...", "reasoning": "..."}
    ],
    "issues": []
  }
}`;

  try {
    const response = await callClaude(prompt, 2048);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('SEO suggestion error:', error);
    throw error;
  }
}

/**
 * Check if AI features are available (proxy or API key configured)
 */
export function isAIAvailable() {
  try {
    return !!(import.meta.env.VITE_AI_PROXY_URL || import.meta.env.VITE_CLAUDE_API_KEY);
  } catch {
    return false;
  }
}

export default {
  suggestTitles,
  suggestMetaDescriptions,
  suggestH1,
  suggestAllSEO,
  isAIAvailable
};
