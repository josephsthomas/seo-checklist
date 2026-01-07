/**
 * Meta Data Generator Service
 * Uses Claude AI to analyze documents and generate SEO metadata
 */

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const API_TIMEOUT_MS = 30000; // 30 second timeout

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
 * Supported file types
 */
export const SUPPORTED_FILE_TYPES = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/pdf': 'pdf',
  'text/html': 'html',
  'text/markdown': 'md',
  'text/plain': 'txt',
  'text/x-markdown': 'md'
};

/**
 * Extract text from file based on type
 */
export async function extractTextFromFile(file) {
  const type = file.type || getMimeType(file.name);

  switch (type) {
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return extractFromDocx(file);
    case 'application/pdf':
      return extractFromPdf(file);
    case 'text/html':
      return extractFromHtml(file);
    case 'text/markdown':
    case 'text/x-markdown':
    case 'text/plain':
    default:
      return extractFromText(file);
  }
}

/**
 * Get MIME type from filename
 */
function getMimeType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const mimeTypes = {
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pdf: 'application/pdf',
    html: 'text/html',
    htm: 'text/html',
    md: 'text/markdown',
    markdown: 'text/markdown',
    txt: 'text/plain'
  };
  return mimeTypes[ext] || 'text/plain';
}

/**
 * Extract text from DOCX file
 */
async function extractFromDocx(file) {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return {
    text: result.value,
    format: 'docx',
    messages: result.messages
  };
}

/**
 * Extract text from PDF file
 */
async function extractFromPdf(file) {
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    text += pageText + '\n\n';
  }

  return {
    text: text.trim(),
    format: 'pdf',
    pageCount: pdf.numPages
  };
}

/**
 * Extract text from HTML file
 */
async function extractFromHtml(file) {
  const htmlText = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');

  // Remove scripts and styles
  doc.querySelectorAll('script, style, noscript').forEach(el => el.remove());

  // Extract existing meta tags
  const existingMeta = {
    title: doc.querySelector('title')?.textContent || '',
    description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    ogTitle: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
    ogDescription: doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
    twitterTitle: doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') || '',
    twitterDescription: doc.querySelector('meta[name="twitter:description"]')?.getAttribute('content') || ''
  };

  // Extract headings
  const headings = Array.from(doc.querySelectorAll('h1, h2, h3')).map(h => h.textContent.trim());

  // Get body text
  const body = doc.body?.textContent || '';

  return {
    text: body.replace(/\s+/g, ' ').trim(),
    format: 'html',
    existingMeta,
    headings,
    rawHtml: htmlText
  };
}

/**
 * Extract text from plain text/markdown file
 */
async function extractFromText(file) {
  const text = await file.text();

  // Extract headings from markdown
  const headingMatches = text.match(/^#+\s+.+$/gm) || [];
  const headings = headingMatches.map(h => h.replace(/^#+\s+/, ''));

  return {
    text,
    format: file.name.endsWith('.md') ? 'markdown' : 'text',
    headings
  };
}

/**
 * Generate metadata using Claude AI
 */
export async function generateMetadata(extractedContent, options = {}) {
  const config = getApiConfig();

  if (!config) {
    return getStaticMetadataSuggestion(extractedContent, options);
  }

  const { text, headings = [], existingMeta = {} } = extractedContent;
  const { targetUrl, brandName, industry, primaryKeyword, secondaryKeywords, tone = 'Professional' } = options;

  // Truncate text if too long (Claude has token limits)
  const truncatedText = text.slice(0, 15000);

  const prompt = buildPrompt({
    text: truncatedText,
    headings,
    existingMeta,
    targetUrl,
    brandName,
    industry,
    primaryKeyword,
    secondaryKeywords,
    tone
  });

  try {
    let response;

    if (config.useProxy) {
      response = await fetchWithTimeout(config.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          maxTokens: 2048
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
          max_tokens: 2048,
          messages: [{
            role: 'user',
            content: prompt
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

    return parseMetadataResponse(content, extractedContent, options);
  } catch (error) {
    console.error('Metadata generation error:', error);
    return getStaticMetadataSuggestion(extractedContent, options);
  }
}

/**
 * Build the prompt for Claude
 */
function buildPrompt({ text, headings, existingMeta, targetUrl, brandName, industry, primaryKeyword, secondaryKeywords, tone }) {
  let prompt = `You are an expert SEO specialist generating metadata for web pages.

DOCUMENT CONTENT:
${text}

${headings.length > 0 ? `\nDOCUMENT HEADINGS:\n${headings.slice(0, 10).map((h, i) => `${i + 1}. ${h}`).join('\n')}` : ''}

${existingMeta.title ? `\nEXISTING METADATA:\n- Title: ${existingMeta.title}\n- Description: ${existingMeta.description}` : ''}

REQUIREMENTS:
Generate optimized SEO metadata following these guidelines:

1. META TITLE:
   - 50-60 characters (strict limit)
   - Include primary keyword naturally
   - Front-load important terms
   - Compelling and clickable
   - Include brand name at end if space permits

2. META DESCRIPTION:
   - 150-160 characters (strict limit)
   - Include primary and secondary keywords naturally
   - Clear value proposition
   - Include call-to-action
   - Match search intent

3. OPEN GRAPH TAGS:
   - og:title: Can be slightly longer/different from meta title (up to 95 chars)
   - og:description: Up to 200 characters, optimized for social sharing
   - Suggest og:type

4. TWITTER CARD:
   - twitter:title: Up to 70 characters
   - twitter:description: Up to 200 characters
   - Suggest card type (summary or summary_large_image)

5. ADDITIONAL:
   - Suggest 3-5 focus keywords
   - Provide canonical URL suggestion if applicable
   - Suggest robots directive if needed`;

  if (brandName || industry || primaryKeyword || targetUrl || tone) {
    prompt += '\n\nCONTEXT:';
    if (targetUrl) prompt += `\n- Target URL: ${targetUrl}`;
    if (brandName) prompt += `\n- Brand Name: ${brandName}`;
    if (industry) prompt += `\n- Industry: ${industry}`;
    if (primaryKeyword) prompt += `\n- Primary Keyword: ${primaryKeyword}`;
    if (secondaryKeywords) prompt += `\n- Secondary Keywords: ${secondaryKeywords}`;
    if (tone) prompt += `\n- Tone: ${tone}`;
  }

  prompt += `

RESPOND IN JSON FORMAT ONLY:
{
  "meta_title": "...",
  "meta_title_length": 55,
  "meta_description": "...",
  "meta_description_length": 155,
  "og_title": "...",
  "og_description": "...",
  "og_type": "article",
  "twitter_title": "...",
  "twitter_description": "...",
  "twitter_card": "summary_large_image",
  "focus_keywords": ["keyword1", "keyword2", "keyword3"],
  "canonical_url": "...",
  "robots": "index, follow",
  "content_summary": "Brief 2-3 sentence summary of what the content is about",
  "suggestions": ["Improvement suggestion 1", "Improvement suggestion 2"]
}`;

  return prompt;
}

/**
 * Parse the response from Claude
 */
function parseMetadataResponse(content, extractedContent, options) {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        metaTitle: parsed.meta_title || '',
        metaTitleLength: parsed.meta_title?.length || 0,
        metaDescription: parsed.meta_description || '',
        metaDescriptionLength: parsed.meta_description?.length || 0,
        ogTitle: parsed.og_title || parsed.meta_title || '',
        ogDescription: parsed.og_description || parsed.meta_description || '',
        ogType: parsed.og_type || 'website',
        twitterTitle: parsed.twitter_title || parsed.meta_title || '',
        twitterDescription: parsed.twitter_description || parsed.meta_description || '',
        twitterCard: parsed.twitter_card || 'summary',
        focusKeywords: parsed.focus_keywords || [],
        canonicalUrl: parsed.canonical_url || options.targetUrl || '',
        robots: parsed.robots || 'index, follow',
        contentSummary: parsed.content_summary || '',
        suggestions: parsed.suggestions || [],
        confidence: 0.9,
        generated: true
      };
    }
  } catch (e) {
    console.error('Failed to parse metadata response:', e);
  }

  return getStaticMetadataSuggestion(extractedContent, options);
}

/**
 * Get static metadata suggestion when API is unavailable
 */
function getStaticMetadataSuggestion(extractedContent, options = {}) {
  const { text, headings = [] } = extractedContent;
  const { brandName, primaryKeyword } = options;

  // Extract first meaningful content
  const firstHeading = headings[0] || '';
  const firstSentence = text.split(/[.!?]/)[0]?.trim() || '';

  // Generate basic title
  let metaTitle = firstHeading || firstSentence.slice(0, 50);
  if (brandName && metaTitle.length < 45) {
    metaTitle += ` | ${brandName}`;
  }
  metaTitle = metaTitle.slice(0, 60);

  // Generate basic description
  let metaDescription = firstSentence.slice(0, 155);
  if (metaDescription.length < 100 && text.length > 155) {
    metaDescription = text.slice(0, 155).trim();
  }

  return {
    metaTitle,
    metaTitleLength: metaTitle.length,
    metaDescription,
    metaDescriptionLength: metaDescription.length,
    ogTitle: metaTitle,
    ogDescription: metaDescription,
    ogType: 'website',
    twitterTitle: metaTitle.slice(0, 70),
    twitterDescription: metaDescription,
    twitterCard: 'summary',
    focusKeywords: primaryKeyword ? [primaryKeyword] : [],
    canonicalUrl: options.targetUrl || '',
    robots: 'index, follow',
    contentSummary: firstSentence,
    suggestions: [
      'AI processing unavailable - metadata generated from content extraction',
      'Review and optimize title and description manually',
      'Consider adding relevant keywords'
    ],
    confidence: 0.5,
    generated: false
  };
}

/**
 * Generate HTML code for metadata
 */
export function generateHtmlCode(metadata, options = {}) {
  const { includeComments = true, targetUrl } = options;

  let html = '';

  if (includeComments) {
    html += '<!-- Primary Meta Tags -->\n';
  }
  html += `<title>${escapeHtml(metadata.metaTitle)}</title>\n`;
  html += `<meta name="title" content="${escapeHtml(metadata.metaTitle)}">\n`;
  html += `<meta name="description" content="${escapeHtml(metadata.metaDescription)}">\n`;

  if (metadata.focusKeywords?.length > 0) {
    html += `<meta name="keywords" content="${escapeHtml(metadata.focusKeywords.join(', '))}">\n`;
  }

  if (metadata.robots) {
    html += `<meta name="robots" content="${metadata.robots}">\n`;
  }

  if (metadata.canonicalUrl) {
    html += `<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}">\n`;
  }

  html += '\n';
  if (includeComments) {
    html += '<!-- Open Graph / Facebook -->\n';
  }
  html += `<meta property="og:type" content="${metadata.ogType}">\n`;
  if (targetUrl || metadata.canonicalUrl) {
    html += `<meta property="og:url" content="${escapeHtml(targetUrl || metadata.canonicalUrl)}">\n`;
  }
  html += `<meta property="og:title" content="${escapeHtml(metadata.ogTitle)}">\n`;
  html += `<meta property="og:description" content="${escapeHtml(metadata.ogDescription)}">\n`;

  html += '\n';
  if (includeComments) {
    html += '<!-- Twitter -->\n';
  }
  html += `<meta name="twitter:card" content="${metadata.twitterCard}">\n`;
  if (targetUrl || metadata.canonicalUrl) {
    html += `<meta name="twitter:url" content="${escapeHtml(targetUrl || metadata.canonicalUrl)}">\n`;
  }
  html += `<meta name="twitter:title" content="${escapeHtml(metadata.twitterTitle)}">\n`;
  html += `<meta name="twitter:description" content="${escapeHtml(metadata.twitterDescription)}">\n`;

  return html;
}

/**
 * Escape HTML entities
 */
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate file
 */
export function validateFile(file) {
  const maxSize = 25 * 1024 * 1024; // 25MB
  const validExtensions = ['docx', 'pdf', 'html', 'htm', 'md', 'markdown', 'txt'];

  const ext = file.name.split('.').pop().toLowerCase();

  if (!validExtensions.includes(ext)) {
    return { valid: false, error: `Unsupported file format. Supported: ${validExtensions.join(', ')}` };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 25MB limit.' };
  }

  return { valid: true };
}

export default {
  generateMetadata,
  extractTextFromFile,
  generateHtmlCode,
  validateFile,
  isAIAvailable,
  SUPPORTED_FILE_TYPES
};
