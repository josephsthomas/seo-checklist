/**
 * LLM Provider SDK Wrappers
 * Each provider returns a unified { content, model, usage? } response
 */

// Lazy-initialized SDK clients
let anthropicClient = null;
let openaiClient = null;
let geminiAI = null;

function getAnthropicClient() {
  if (!anthropicClient) {
    const Anthropic = require('@anthropic-ai/sdk');
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

function getOpenAIClient() {
  if (!openaiClient) {
    const OpenAI = require('openai');
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function getGeminiClient() {
  if (!geminiAI) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiAI;
}

/**
 * Call Anthropic Claude
 * @param {string} content - Prompt content
 * @param {Object} options - { model, temperature, max_tokens }
 * @returns {Promise<{ content: string, model: string, usage?: Object }>}
 */
async function callAnthropic(content, options = {}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw Object.assign(new Error('Anthropic API key not configured'), { status: 503 });
  }

  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: options.model || 'claude-sonnet-4-5-20250929',
    max_tokens: options.max_tokens || 4096,
    temperature: options.temperature ?? 0.2,
    messages: [{ role: 'user', content }]
  });

  return {
    content: response.content[0].text,
    model: response.model,
    usage: response.usage
  };
}

/**
 * Call Anthropic Claude with multi-modal content (text + image)
 * Used by legacy imageAltService
 * @param {string} prompt - Text prompt
 * @param {string} imageBase64 - Base64-encoded image data
 * @param {string} mediaType - MIME type (e.g., "image/png")
 * @param {Object} options - { model, max_tokens }
 * @returns {Promise<{ content: string, model: string }>}
 */
async function callAnthropicMultiModal(prompt, imageBase64, mediaType, options = {}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw Object.assign(new Error('Anthropic API key not configured'), { status: 503 });
  }

  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: options.model || 'claude-sonnet-4-5-20250929',
    max_tokens: options.max_tokens || 4096,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: imageBase64
          }
        },
        { type: 'text', text: prompt }
      ]
    }]
  });

  return {
    content: response.content[0].text,
    model: response.model,
    usage: response.usage
  };
}

/**
 * Call OpenAI GPT
 * @param {string} content - Prompt content
 * @param {Object} options - { model, temperature, max_tokens }
 * @returns {Promise<{ content: string, model: string, usage?: Object }>}
 */
async function callOpenAI(content, options = {}) {
  if (!process.env.OPENAI_API_KEY) {
    throw Object.assign(new Error('OpenAI API key not configured'), { status: 503 });
  }

  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: options.model || 'gpt-4o',
    max_tokens: options.max_tokens || 4096,
    temperature: options.temperature ?? 0.2,
    messages: [{ role: 'user', content }],
    response_format: { type: 'json_object' }
  });

  return {
    content: response.choices[0].message.content,
    model: response.model,
    usage: response.usage
  };
}

/**
 * Call Google Gemini
 * @param {string} content - Prompt content
 * @param {Object} options - { model, temperature, max_tokens }
 * @returns {Promise<{ content: string, model: string }>}
 */
async function callGemini(content, options = {}) {
  if (!process.env.GEMINI_API_KEY) {
    throw Object.assign(new Error('Gemini API key not configured'), { status: 503 });
  }

  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: options.model || 'gemini-2.0-flash',
    generationConfig: {
      maxOutputTokens: options.max_tokens || 4096,
      temperature: options.temperature ?? 0.2,
      responseMimeType: 'application/json'
    }
  });

  const result = await model.generateContent(content);
  const response = result.response;

  return {
    content: response.text(),
    model: options.model || 'gemini-2.0-flash'
  };
}

/**
 * Route to the correct provider
 * @param {string} provider - 'anthropic', 'openai', or 'google'
 * @param {string} content - Prompt content
 * @param {Object} options - { model, temperature, max_tokens }
 * @returns {Promise<{ content: string, model: string }>}
 */
async function callProvider(provider, content, options = {}) {
  switch (provider) {
    case 'anthropic':
      return callAnthropic(content, options);
    case 'openai':
      return callOpenAI(content, options);
    case 'google':
      return callGemini(content, options);
    default:
      throw Object.assign(
        new Error(`Unsupported provider: ${provider}. Supported: anthropic, openai, google`),
        { status: 400 }
      );
  }
}

/**
 * Check which providers are configured
 * @returns {Object} { anthropic: boolean, openai: boolean, gemini: boolean }
 */
function getConfiguredProviders() {
  return {
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY
  };
}

module.exports = {
  callAnthropic,
  callAnthropicMultiModal,
  callOpenAI,
  callGemini,
  callProvider,
  getConfiguredProviders
};
