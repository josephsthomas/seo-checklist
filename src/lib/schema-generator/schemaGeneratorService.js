/**
 * Structured Data Generator Service
 * Uses Claude AI to analyze HTML and generate schema.org JSON-LD
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
    if (import.meta.env.PROD) {
      console.error('Direct API key usage is not allowed in production. Configure VITE_AI_PROXY_URL instead.');
      return null;
    }
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
 * Schema types catalog with rich snippet support indicators
 */
export const SCHEMA_TYPES = {
  // Article Types
  Article: { category: 'Content', richSnippet: true, description: 'News, blog posts, and articles' },
  NewsArticle: { category: 'Content', richSnippet: true, description: 'News articles' },
  BlogPosting: { category: 'Content', richSnippet: true, description: 'Blog posts' },
  TechArticle: { category: 'Content', richSnippet: false, description: 'Technical articles' },

  // Business Types
  Organization: { category: 'Business', richSnippet: true, description: 'Companies and organizations' },
  LocalBusiness: { category: 'Business', richSnippet: true, description: 'Local businesses' },
  Restaurant: { category: 'Business', richSnippet: true, description: 'Restaurants' },
  Store: { category: 'Business', richSnippet: true, description: 'Retail stores' },
  ProfessionalService: { category: 'Business', richSnippet: true, description: 'Professional services' },
  FinancialService: { category: 'Business', richSnippet: true, description: 'Financial services' },
  MedicalBusiness: { category: 'Business', richSnippet: true, description: 'Medical businesses' },

  // Product & E-commerce
  Product: { category: 'E-commerce', richSnippet: true, description: 'Products with pricing' },
  Offer: { category: 'E-commerce', richSnippet: true, description: 'Product offers' },
  AggregateOffer: { category: 'E-commerce', richSnippet: true, description: 'Multiple offers' },
  Review: { category: 'E-commerce', richSnippet: true, description: 'Product/service reviews' },
  AggregateRating: { category: 'E-commerce', richSnippet: true, description: 'Rating aggregates' },

  // People & Profiles
  Person: { category: 'People', richSnippet: true, description: 'Individual people' },
  ProfilePage: { category: 'People', richSnippet: false, description: 'Profile pages' },

  // Events
  Event: { category: 'Events', richSnippet: true, description: 'Events and happenings' },
  BusinessEvent: { category: 'Events', richSnippet: true, description: 'Business events' },
  MusicEvent: { category: 'Events', richSnippet: true, description: 'Music events' },
  SportsEvent: { category: 'Events', richSnippet: true, description: 'Sports events' },

  // FAQs & How-tos
  FAQPage: { category: 'Help Content', richSnippet: true, description: 'FAQ pages' },
  HowTo: { category: 'Help Content', richSnippet: true, description: 'How-to guides' },
  Question: { category: 'Help Content', richSnippet: true, description: 'Q&A content' },

  // Creative Works
  Recipe: { category: 'Creative', richSnippet: true, description: 'Recipes with instructions' },
  Book: { category: 'Creative', richSnippet: true, description: 'Books' },
  Movie: { category: 'Creative', richSnippet: true, description: 'Movies' },
  VideoObject: { category: 'Creative', richSnippet: true, description: 'Video content' },
  ImageObject: { category: 'Creative', richSnippet: false, description: 'Images' },
  Course: { category: 'Creative', richSnippet: true, description: 'Educational courses' },
  SoftwareApplication: { category: 'Creative', richSnippet: true, description: 'Software apps' },

  // Navigation & Site Structure
  WebSite: { category: 'Site Structure', richSnippet: true, description: 'Website with search' },
  WebPage: { category: 'Site Structure', richSnippet: false, description: 'Generic web pages' },
  BreadcrumbList: { category: 'Site Structure', richSnippet: true, description: 'Breadcrumb navigation' },
  SiteNavigationElement: { category: 'Site Structure', richSnippet: false, description: 'Navigation elements' },

  // Jobs
  JobPosting: { category: 'Jobs', richSnippet: true, description: 'Job listings' },
  Occupation: { category: 'Jobs', richSnippet: false, description: 'Occupation types' },

  // Medical
  MedicalCondition: { category: 'Medical', richSnippet: false, description: 'Medical conditions' },
  Drug: { category: 'Medical', richSnippet: false, description: 'Medications' },
  MedicalClinic: { category: 'Medical', richSnippet: true, description: 'Medical clinics' },
  Physician: { category: 'Medical', richSnippet: true, description: 'Doctors' }
};

/**
 * Get schema categories
 */
export function getSchemaCategories() {
  const categories = {};
  Object.entries(SCHEMA_TYPES).forEach(([type, info]) => {
    if (!categories[info.category]) {
      categories[info.category] = [];
    }
    categories[info.category].push({ type, ...info });
  });
  return categories;
}

/**
 * Extract content from HTML
 */
export function extractHtmlContent(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove scripts and styles
  doc.querySelectorAll('script, style, noscript').forEach(el => el.remove());

  // Extract various elements
  const title = doc.querySelector('title')?.textContent || '';
  const h1 = doc.querySelector('h1')?.textContent || '';
  const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4')).map(h => ({
    level: parseInt(h.tagName[1], 10),
    text: h.textContent.trim()
  }));

  const paragraphs = Array.from(doc.querySelectorAll('p')).map(p => p.textContent.trim()).filter(Boolean);
  const lists = Array.from(doc.querySelectorAll('ul, ol')).map(list => ({
    type: list.tagName.toLowerCase(),
    items: Array.from(list.querySelectorAll('li')).map(li => li.textContent.trim())
  }));

  // Extract existing schema
  const existingSchemas = [];
  doc.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
    try {
      existingSchemas.push(JSON.parse(script.textContent));
    } catch (e) {
      // Invalid JSON
    }
  });

  // Extract meta tags
  const meta = {
    description: doc.querySelector('meta[name="description"]')?.getAttribute('content') || '',
    keywords: doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '',
    ogTitle: doc.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
    ogDescription: doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '',
    ogImage: doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || ''
  };

  // Detect potential content types
  const detectedTypes = detectContentTypes(doc, headings, paragraphs);

  return {
    title,
    h1,
    headings,
    paragraphs: paragraphs.slice(0, 20), // Limit for API
    lists,
    existingSchemas,
    meta,
    detectedTypes,
    bodyText: doc.body?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 10000) || ''
  };
}

/**
 * Detect potential content types from HTML
 */
function detectContentTypes(doc, headings, _paragraphs) {
  const types = [];

  // Check for FAQ patterns
  const faqPatterns = doc.querySelectorAll('[class*="faq"], [id*="faq"], details, summary');
  const questionHeadings = headings.filter(h => h.text.includes('?')).length;
  if (faqPatterns.length > 0 || questionHeadings >= 3) {
    types.push('FAQPage');
  }

  // Check for product patterns
  const priceElements = doc.querySelectorAll('[class*="price"], [itemprop="price"]');
  const addToCartButtons = doc.querySelectorAll('[class*="add-to-cart"], [class*="buy"], button[type="submit"]');
  if (priceElements.length > 0 || addToCartButtons.length > 0) {
    types.push('Product');
  }

  // Check for article patterns
  const articleElement = doc.querySelector('article, [class*="article"], [class*="post"], [class*="blog"]');
  const dateElements = doc.querySelectorAll('time, [class*="date"], [class*="published"]');
  if (articleElement && dateElements.length > 0) {
    types.push('Article');
  }

  // Check for recipe patterns
  const recipePatterns = doc.querySelectorAll('[class*="recipe"], [class*="ingredient"], [class*="instruction"]');
  if (recipePatterns.length > 0) {
    types.push('Recipe');
  }

  // Check for local business patterns
  const addressPatterns = doc.querySelectorAll('address, [class*="address"], [itemprop="address"]');
  const phonePatterns = doc.querySelectorAll('[class*="phone"], [class*="tel"], [href^="tel:"]');
  if (addressPatterns.length > 0 && phonePatterns.length > 0) {
    types.push('LocalBusiness');
  }

  // Check for event patterns
  const eventPatterns = doc.querySelectorAll('[class*="event"], [class*="schedule"], [class*="venue"]');
  if (eventPatterns.length > 0) {
    types.push('Event');
  }

  // Check for how-to patterns
  const stepPatterns = doc.querySelectorAll('[class*="step"], ol li, [class*="instruction"]');
  const howToHeadings = headings.filter(h =>
    h.text.toLowerCase().includes('how to') ||
    h.text.toLowerCase().includes('step') ||
    h.text.toLowerCase().includes('guide')
  );
  if (stepPatterns.length >= 3 || howToHeadings.length > 0) {
    types.push('HowTo');
  }

  // Check for job posting patterns
  const jobPatterns = doc.querySelectorAll('[class*="job"], [class*="career"], [class*="position"]');
  if (jobPatterns.length > 0) {
    types.push('JobPosting');
  }

  return types;
}

/**
 * Generate schema using Claude AI
 */
export async function generateSchema(htmlContent, options = {}) {
  const config = getApiConfig();

  const { selectedType, pageUrl, organizationName } = options;

  if (!config) {
    return getStaticSchemaSuggestion(htmlContent, selectedType, options);
  }

  const prompt = buildPrompt(htmlContent, selectedType, pageUrl, organizationName);

  try {
    let response;

    if (config.useProxy) {
      response = await fetchWithTimeout(config.proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          maxTokens: 4096
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
          max_tokens: 4096,
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

    return parseSchemaResponse(content, htmlContent, options);
  } catch (error) {
    console.error('Schema generation error:', error);
    return getStaticSchemaSuggestion(htmlContent, selectedType, options);
  }
}

/**
 * Build the prompt for Claude
 */
function buildPrompt(htmlContent, selectedType, pageUrl, organizationName) {
  const { title, h1, headings, meta, detectedTypes, bodyText } = htmlContent;

  let prompt = `You are an expert in schema.org structured data and SEO. Generate valid JSON-LD schema markup based on the following HTML content.

PAGE CONTENT:
- Title: ${title}
- H1: ${h1}
- Meta Description: ${meta.description}
${headings.slice(0, 10).map(h => `- H${h.level}: ${h.text}`).join('\n')}

CONTENT EXCERPT:
${bodyText.slice(0, 3000)}

${detectedTypes.length > 0 ? `\nDETECTED CONTENT TYPES: ${detectedTypes.join(', ')}` : ''}

${selectedType ? `USER REQUESTED SCHEMA TYPE: ${selectedType}` : 'AUTOMATICALLY DETECT THE BEST SCHEMA TYPE(S) FOR THIS CONTENT'}

${pageUrl ? `PAGE URL: ${pageUrl}` : ''}
${organizationName ? `ORGANIZATION: ${organizationName}` : ''}

REQUIREMENTS:
1. Generate production-ready JSON-LD schema
2. Include all required properties for Google rich results
3. Include recommended properties where data is available
4. Use proper schema.org vocabulary
5. Ensure valid JSON syntax
6. If multiple schema types are appropriate, generate all of them

RESPOND IN JSON FORMAT:
{
  "schemas": [
    {
      "type": "SchemaType",
      "jsonLd": { ... complete JSON-LD object ... },
      "richSnippetEligible": true/false,
      "missingProperties": ["list", "of", "missing", "recommended", "properties"],
      "suggestions": ["improvement suggestions"]
    }
  ],
  "summary": "Brief explanation of what schemas were generated and why",
  "warnings": ["any warnings about the content or schema"]
}`;

  return prompt;
}

/**
 * Parse the response from Claude
 */
function parseSchemaResponse(content, htmlContent, options) {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      return {
        schemas: parsed.schemas?.map(s => {
          const validation = s.jsonLd ? validateSchema(s.jsonLd) : { valid: true, errors: [], warnings: [] };
          return {
            type: s.type,
            jsonLd: s.jsonLd,
            richSnippetEligible: s.richSnippetEligible ?? SCHEMA_TYPES[s.type]?.richSnippet ?? false,
            missingProperties: s.missingProperties || [],
            suggestions: [...(s.suggestions || []), ...validation.warnings],
            validationErrors: validation.errors
          };
        }) || [],
        summary: parsed.summary || '',
        warnings: parsed.warnings || [],
        detectedTypes: htmlContent.detectedTypes,
        confidence: 0.9,
        generated: true
      };
    }
  } catch (e) {
    console.error('Failed to parse schema response:', e);
  }

  return getStaticSchemaSuggestion(htmlContent, options.selectedType, options);
}

/**
 * Get static schema suggestion when API is unavailable
 */
function getStaticSchemaSuggestion(htmlContent, selectedType, options = {}) {
  const { title, h1, meta, detectedTypes } = htmlContent;
  const { pageUrl, organizationName } = options;

  const type = selectedType || detectedTypes[0] || 'WebPage';

  // Generate basic schema based on type
  let jsonLd = {
    '@context': 'https://schema.org',
    '@type': type
  };

  switch (type) {
    case 'Article':
    case 'BlogPosting':
    case 'NewsArticle':
      jsonLd = {
        ...jsonLd,
        headline: h1 || title,
        description: meta.description,
        ...(pageUrl && { url: pageUrl }),
        ...(organizationName && {
          publisher: {
            '@type': 'Organization',
            name: organizationName
          }
        })
      };
      break;

    case 'FAQPage':
      jsonLd = {
        ...jsonLd,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Sample question — replace with your FAQ',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sample answer — replace with your answer'
            }
          }
        ]
      };
      break;

    case 'Product':
      jsonLd = {
        ...jsonLd,
        name: h1 || title,
        description: meta.description
      };
      break;

    case 'LocalBusiness':
      jsonLd = {
        ...jsonLd,
        name: organizationName || h1 || title,
        ...(pageUrl && { url: pageUrl })
      };
      break;

    default:
      jsonLd = {
        ...jsonLd,
        name: h1 || title,
        description: meta.description,
        ...(pageUrl && { url: pageUrl })
      };
  }

  return {
    schemas: [{
      type,
      jsonLd,
      richSnippetEligible: SCHEMA_TYPES[type]?.richSnippet ?? false,
      missingProperties: ['datePublished', 'author', 'image'],
      suggestions: [
        'AI processing unavailable - basic schema generated',
        'Add required properties manually for rich results',
        'Validate with Google Rich Results Test'
      ]
    }],
    summary: `Generated basic ${type} schema from page content`,
    warnings: ['Schema was generated without AI analysis - review and enhance manually'],
    detectedTypes,
    confidence: 0.5,
    generated: false
  };
}

/**
 * Validate schema structure
 */
export function validateSchema(jsonLd) {
  const errors = [];
  const warnings = [];

  // Check for @context
  if (!jsonLd['@context']) {
    errors.push('Missing @context property');
  } else if (jsonLd['@context'] !== 'https://schema.org' && jsonLd['@context'] !== 'http://schema.org') {
    warnings.push('@context should be exactly "https://schema.org"');
  }

  // Check for @type
  if (!jsonLd['@type']) {
    errors.push('Missing @type property');
  }

  // Type-specific validation
  const type = jsonLd['@type'];

  if (type === 'Article' || type === 'BlogPosting' || type === 'NewsArticle') {
    if (!jsonLd.headline) errors.push('Article requires headline property');
    if (jsonLd.headline && jsonLd.headline.length > 110) warnings.push('Article headline exceeds 110 characters — Google recommends keeping headlines under 110 characters for rich results');
    if (!jsonLd.datePublished) warnings.push('Article should have datePublished');
    if (!jsonLd.author) warnings.push('Article should have author');
    if (!jsonLd.image) warnings.push('Article should have image for rich results');
  }

  if (type === 'Product') {
    if (!jsonLd.name) errors.push('Product requires name property');
    if (!jsonLd.offers) warnings.push('Product should have offers for rich results');
    if (!jsonLd.image) warnings.push('Product should have image');
  }

  if (type === 'FAQPage') {
    if (!jsonLd.mainEntity || !Array.isArray(jsonLd.mainEntity)) {
      errors.push('FAQPage requires mainEntity array');
    } else if (jsonLd.mainEntity.length === 0) {
      errors.push('FAQPage mainEntity array must not be empty');
    }
  }

  if (type === 'LocalBusiness') {
    if (!jsonLd.name) errors.push('LocalBusiness requires name');
    if (!jsonLd.address) warnings.push('LocalBusiness should have address');
    if (!jsonLd.telephone) warnings.push('LocalBusiness should have telephone');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Format JSON-LD for display
 */
export function formatJsonLd(jsonLd) {
  return JSON.stringify(jsonLd, null, 2);
}

/**
 * Generate HTML script tag for embedding
 */
export function generateScriptTag(jsonLd) {
  return `<script type="application/ld+json">
${formatJsonLd(jsonLd)}
</script>`;
}

export default {
  generateSchema,
  extractHtmlContent,
  validateSchema,
  formatJsonLd,
  generateScriptTag,
  getSchemaCategories,
  isAIAvailable,
  SCHEMA_TYPES
};
