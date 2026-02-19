/**
 * E-008: Industry-Specific Scoring Profiles
 * Pre-built profiles that adjust check severity weights and recommendations
 */

const INDUSTRY_PROFILES = {
  technology: {
    label: 'Technology / SaaS',
    description: 'Optimized for technical documentation, API docs, and SaaS product pages.',
    weightOverrides: {
      contentStructure: 25, // +5 (code structure matters)
      contentClarity: 20,  // -5 (technical jargon acceptable)
      technicalAccessibility: 25, // +5 (tech audience expects it)
      metadataSchema: 15,
      aiSignals: 15, // -5
    },
    severityOverrides: {
      'CS-06': 'critical', // Tables (data tables common in tech)
      'TA-01': 'critical', // JS rendering (SPA heavy)
      'CC-04': 'low',      // Jargon (acceptable in tech)
    },
    recommendations: [
      'Add code examples with syntax highlighting for technical content.',
      'Use API documentation schemas (e.g., OpenAPI) for structured data.',
      'Ensure code blocks are wrapped in <pre><code> for AI extraction.',
    ],
  },
  healthcare: {
    label: 'Healthcare',
    description: 'Meets E-E-A-T requirements for YMYL health content.',
    weightOverrides: {
      contentStructure: 20,
      contentClarity: 30,  // +5 (plain language critical)
      technicalAccessibility: 15, // -5
      metadataSchema: 15,
      aiSignals: 20,
    },
    severityOverrides: {
      'CC-01': 'critical', // Readability score (plain language critical)
      'AS-01': 'critical', // Author expertise (YMYL)
      'AS-03': 'critical', // Source attribution (medical citations)
      'CC-04': 'critical', // Jargon (patient-facing needs clarity)
    },
    recommendations: [
      'Include author credentials (MD, PhD) in structured data.',
      'Add medical review dates and reviewer names.',
      'Use plain language summaries before technical explanations.',
    ],
  },
  ecommerce: {
    label: 'E-Commerce',
    description: 'Optimized for product pages, category pages, and transactional content.',
    weightOverrides: {
      contentStructure: 15, // -5
      contentClarity: 20,  // -5
      technicalAccessibility: 20,
      metadataSchema: 30,  // +15 (product schema critical)
      aiSignals: 15,
    },
    severityOverrides: {
      'MS-05': 'critical', // JSON-LD (product schema)
      'MS-06': 'critical', // Schema type (Product, Offer)
      'MS-01': 'critical', // Title (product name)
      'TA-09': 'critical', // Image alt (product images)
    },
    recommendations: [
      'Add complete Product schema with price, availability, and reviews.',
      'Include high-quality product image alt text with model and color.',
      'Add AggregateRating schema for review scores.',
    ],
  },
  media: {
    label: 'News / Media',
    description: 'Optimized for news articles, editorial content, and media publications.',
    weightOverrides: {
      contentStructure: 20,
      contentClarity: 25,
      technicalAccessibility: 15,
      metadataSchema: 20,  // +5
      aiSignals: 20,
    },
    severityOverrides: {
      'MS-08': 'critical', // Date (timeliness critical)
      'AS-02': 'critical', // Content freshness
      'MS-07': 'critical', // Author (journalist bylines)
      'CC-05': 'critical', // Original content
    },
    recommendations: [
      'Add NewsArticle schema with dateline and article section.',
      'Include journalist byline with sameAs links to social profiles.',
      'Update dateModified whenever content is revised.',
    ],
  },
  legal: {
    label: 'Legal / Finance',
    description: 'Meets YMYL requirements for legal and financial content.',
    weightOverrides: {
      contentStructure: 20,
      contentClarity: 25,  // +5
      technicalAccessibility: 20,
      metadataSchema: 15,
      aiSignals: 20,
    },
    severityOverrides: {
      'AS-01': 'critical', // Author expertise
      'CC-01': 'critical', // Readability
      'AS-03': 'critical', // Source attribution
      'CC-05': 'critical', // Original content
    },
    recommendations: [
      'Add attorney/advisor credentials in structured data.',
      'Include disclaimer dates and jurisdiction information.',
      'Cite specific regulations and legal precedents.',
    ],
  },
};

/**
 * Get industry profile by key
 */
export function getIndustryProfile(key) {
  return INDUSTRY_PROFILES[key] || null;
}

/**
 * Get all available profiles for dropdown
 */
export function getAvailableProfiles() {
  return Object.entries(INDUSTRY_PROFILES).map(([key, profile]) => ({
    key,
    label: profile.label,
    description: profile.description,
  }));
}

export { INDUSTRY_PROFILES };
export default INDUSTRY_PROFILES;
