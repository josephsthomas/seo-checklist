/**
 * E-010: Page Type Detection
 * Auto-detect page type from HTML structure for check weight adjustment
 */

const PAGE_TYPES = {
  article: {
    label: 'Article',
    indicators: ['<article', 'schema.org/Article', 'schema.org/NewsArticle', 'schema.org/BlogPosting'],
    weightAdjustments: { contentStructure: 1.2, contentClarity: 1.3, aiSignals: 1.1 },
  },
  product: {
    label: 'Product Page',
    indicators: ['schema.org/Product', 'schema.org/Offer', 'add-to-cart', 'buy-now', 'price'],
    weightAdjustments: { metadataSchema: 1.4, technicalAccessibility: 1.1 },
  },
  homepage: {
    label: 'Homepage',
    indicators: ['<body class="home"', 'is-home', 'homepage'],
    weightAdjustments: { technicalAccessibility: 1.2, metadataSchema: 1.2 },
  },
  landing: {
    label: 'Landing Page',
    indicators: ['cta-button', 'call-to-action', 'hero-section', 'sign-up'],
    weightAdjustments: { contentClarity: 1.3, aiSignals: 0.8 },
  },
  documentation: {
    label: 'Documentation',
    indicators: ['<code', '<pre', 'api-reference', 'docs', 'documentation'],
    weightAdjustments: { contentStructure: 1.3, contentClarity: 1.0, metadataSchema: 0.8 },
  },
  faq: {
    label: 'FAQ Page',
    indicators: ['schema.org/FAQPage', 'frequently-asked', 'faq', 'question-answer'],
    weightAdjustments: { aiSignals: 1.4, metadataSchema: 1.2 },
  },
};

/**
 * Detect page type from HTML content
 * @param {string} html - Raw HTML content
 * @returns {{ type: string, label: string, confidence: number, weightAdjustments: Object }}
 */
export function detectPageType(html) {
  if (!html) return { type: 'unknown', label: 'Unknown', confidence: 0, weightAdjustments: {} };

  const lower = html.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;

  for (const [type, config] of Object.entries(PAGE_TYPES)) {
    const matchCount = config.indicators.filter(ind => lower.includes(ind.toLowerCase())).length;
    const score = matchCount / config.indicators.length;

    if (score > bestScore && score > 0.2) {
      bestScore = score;
      bestMatch = { type, ...config, confidence: Math.round(score * 100) };
    }
  }

  if (!bestMatch) {
    // Default: treat as article if it has enough text content
    const textLength = lower.replace(/<[^>]*>/g, '').trim().length;
    if (textLength > 2000) {
      return { type: 'article', label: 'Article (inferred)', confidence: 40, weightAdjustments: PAGE_TYPES.article.weightAdjustments };
    }
    return { type: 'unknown', label: 'Unknown', confidence: 0, weightAdjustments: {} };
  }

  return bestMatch;
}

export default detectPageType;
