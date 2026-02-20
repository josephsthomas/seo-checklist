/**
 * Image Alt Text Generator Service
 * Uses Claude Vision API to analyze images and generate alt text
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const API_TIMEOUT_MS = 60000; // 60 second timeout for image processing

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options, timeoutMs = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Get API configuration
 */
function getApiConfig() {
  const proxyUrl = import.meta.env.VITE_AI_PROXY_URL;
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY;

  if (proxyUrl) {
    return { useProxy: true, proxyUrl };
  }

  if (apiKey) {
    return { useProxy: false, apiKey };
  }

  return null;
}

/**
 * Check if AI is available
 */
export function isAIAvailable() {
  return getApiConfig() !== null;
}

/**
 * Convert file to base64
 */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Get media type from file
 */
function getMediaType(file) {
  const typeMap = {
    'image/jpeg': 'image/jpeg',
    'image/jpg': 'image/jpeg',
    'image/png': 'image/png',
    'image/gif': 'image/gif',
    'image/webp': 'image/webp',
    'image/tiff': 'image/png', // Convert TIFF to PNG for API
    'image/bmp': 'image/png'   // Convert BMP to PNG for API
  };
  return typeMap[file.type] || 'image/jpeg';
}

/**
 * Generate alt text for a single image using Claude Vision
 */
export async function generateAltText(imageFile, context = {}) {
  const config = getApiConfig();

  if (!config) {
    // Return static suggestion if no API configured
    return getStaticAltTextSuggestion(imageFile.name);
  }

  const base64Image = await fileToBase64(imageFile);
  const mediaType = getMediaType(imageFile);

  const prompt = buildPrompt(context);

  try {
    let response;

    if (config.useProxy) {
      response = await fetchWithTimeout(config.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          image: base64Image,
          mediaType,
          maxTokens: 1024
        })
      });
    } else {
      response = await fetchWithTimeout(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image
                }
              },
              {
                type: 'text',
                text: prompt
              }
            ]
          }]
        })
      });
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = config.useProxy
      ? data.content || data.text || data.response
      : data.content[0].text;

    return parseAltTextResponse(content, imageFile.name);
  } catch (error) {
    console.error('Alt text generation error:', error);
    return getStaticAltTextSuggestion(imageFile.name);
  }
}

/**
 * Build the prompt for Claude Vision
 */
function buildPrompt(context) {
  const { brandName, industry, keywords, guidelines, tone, charLimit = 125 } = context;

  let prompt = `You are an expert accessibility and SEO specialist generating alt text for images.

REQUIREMENTS:
1. Generate descriptive alt text that:
   - Describes the image content accurately
   - Is concise (maximum ${charLimit} characters)
   - Follows WCAG 2.2 accessibility guidelines
   - Is optimized for SEO without keyword stuffing

2. Generate SEO-friendly filename that:
   - Describes the primary subject
   - Uses lowercase and hyphens only
   - Is maximum 50 characters
   - Does not include generic terms like "image" or "photo"

3. Determine if image is decorative:
   - Decorative = provides no information, purely aesthetic
   - Return is_decorative: true if alt="" is appropriate`;

  if (brandName || industry || keywords || guidelines || tone) {
    prompt += '\n\nCONTEXT:';
    if (brandName) prompt += `\n- Brand/Client: ${brandName}`;
    if (industry) prompt += `\n- Industry: ${industry}`;
    if (keywords) prompt += `\n- Target Keywords: ${keywords}`;
    if (guidelines) prompt += `\n- Custom Guidelines: ${guidelines}`;
    if (tone) prompt += `\n- Tone: ${tone}`;
  }

  prompt += `

RESPOND IN JSON FORMAT ONLY:
{
  "alt_text": "Description here",
  "filename": "seo-friendly-name",
  "is_decorative": false,
  "detected_elements": ["list", "of", "key", "elements"],
  "confidence": 0.95
}`;

  return prompt;
}

/**
 * Parse the response from Claude
 */
function parseAltTextResponse(content, originalFilename) {
  try {
    // Extract JSON from response - use non-greedy match for safety
    const jsonMatch = content.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      // Get file extension from original - handle files without extension
      const parts = originalFilename.split('.');
      const ext = parts.length > 1 ? parts.pop().toLowerCase() : 'jpg';

      // Clamp confidence to valid [0, 1] range
      const rawConfidence = parsed.confidence ?? 0.8;
      const clampedConfidence = Math.max(0, Math.min(1, rawConfidence));

      return {
        alt_text: parsed.alt_text || '',
        filename: `${parsed.filename || 'image'}.${ext}`,
        is_decorative: parsed.is_decorative || false,
        detected_elements: parsed.detected_elements || [],
        confidence: clampedConfidence
      };
    }
  } catch (e) {
    console.error('Failed to parse alt text response:', e);
  }

  return getStaticAltTextSuggestion(originalFilename);
}

/**
 * Get static alt text suggestion when API is unavailable
 */
function getStaticAltTextSuggestion(filename) {
  const name = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  // Handle files without extension
  const parts = filename.split('.');
  const ext = parts.length > 1 ? parts.pop().toLowerCase() : 'jpg';

  return {
    alt_text: `Image: ${name || 'Unnamed image'}`,
    filename: (name.toLowerCase().replace(/\s+/g, '-').slice(0, 50) || 'image') + '.' + ext,
    is_decorative: false,
    detected_elements: [],
    confidence: 0.5
  };
}

/**
 * Process multiple images in batch
 */
export async function processImageBatch(files, context = {}, onProgress = () => {}) {
  const results = [];
  const total = files.length;
  const concurrency = 3; // Process 3 at a time

  for (let i = 0; i < total; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(async (file) => {
        try {
          const result = await generateAltText(file, context);
          return {
            id: crypto.randomUUID(),
            original_filename: file.name,
            file_size: file.size,
            file_type: file.type,
            file: file,
            ...result,
            error: null
          };
        } catch (error) {
          return {
            id: crypto.randomUUID(),
            original_filename: file.name,
            file_size: file.size,
            file_type: file.type,
            file: file,
            alt_text: '',
            filename: file.name,
            is_decorative: false,
            detected_elements: [],
            confidence: 0,
            error: error.message
          };
        }
      })
    );

    results.push(...batchResults);
    onProgress(Math.min(100, Math.round(((i + batch.length) / total) * 100)));
  }

  return results;
}

/**
 * Validate image file
 */
export function validateImageFile(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/tiff', 'image/bmp'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported file format. Please use JPG, PNG, WebP, GIF, TIFF, or BMP.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 10MB limit.' };
  }

  return { valid: true };
}

export default {
  generateAltText,
  processImageBatch,
  validateImageFile,
  isAIAvailable
};
