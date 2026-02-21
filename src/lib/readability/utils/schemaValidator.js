/**
 * E-016: Schema Markup Completeness Scoring
 * Validates JSON-LD completeness against Schema.org spec for detected types
 */

const SCHEMA_FIELDS = {
  Article: {
    required: ['headline', '@type'],
    recommended: ['author', 'datePublished', 'dateModified', 'publisher', 'image', 'description'],
    optional: ['mainEntityOfPage', 'wordCount', 'articleBody', 'keywords'],
  },
  NewsArticle: {
    required: ['headline', '@type', 'datePublished'],
    recommended: ['author', 'dateModified', 'publisher', 'image', 'description'],
    optional: ['mainEntityOfPage', 'dateline', 'articleSection'],
  },
  BlogPosting: {
    required: ['headline', '@type'],
    recommended: ['author', 'datePublished', 'dateModified', 'publisher', 'image', 'description'],
    optional: ['mainEntityOfPage', 'wordCount', 'articleBody', 'keywords'],
  },
  Product: {
    required: ['name', '@type'],
    recommended: ['image', 'description', 'offers', 'brand', 'sku'],
    optional: ['review', 'aggregateRating', 'gtin', 'category'],
  },
  FAQPage: {
    required: ['@type', 'mainEntity'],
    recommended: [],
    optional: ['name', 'description'],
  },
  HowTo: {
    required: ['@type', 'name', 'step'],
    recommended: ['description', 'image', 'totalTime'],
    optional: ['supply', 'tool', 'estimatedCost'],
  },
  Organization: {
    required: ['@type', 'name'],
    recommended: ['url', 'logo', 'sameAs', 'description'],
    optional: ['address', 'contactPoint', 'founder'],
  },
  Person: {
    required: ['@type', 'name'],
    recommended: ['url', 'image', 'sameAs', 'jobTitle'],
    optional: ['email', 'affiliation', 'description'],
  },
  LocalBusiness: {
    required: ['@type', 'name'],
    recommended: ['address', 'telephone', 'url', 'openingHours', 'image'],
    optional: ['priceRange', 'geo', 'sameAs', 'description'],
  },
  Event: {
    required: ['@type', 'name', 'startDate'],
    recommended: ['location', 'description', 'endDate', 'image', 'offers'],
    optional: ['performer', 'organizer', 'eventStatus', 'eventAttendanceMode'],
  },
  Recipe: {
    required: ['@type', 'name'],
    recommended: ['image', 'author', 'description', 'recipeIngredient', 'recipeInstructions'],
    optional: ['prepTime', 'cookTime', 'totalTime', 'recipeYield', 'nutrition'],
  },
  VideoObject: {
    required: ['@type', 'name', 'uploadDate'],
    recommended: ['description', 'thumbnailUrl', 'contentUrl', 'duration'],
    optional: ['embedUrl', 'interactionStatistic', 'expires'],
  },
  WebSite: {
    required: ['@type', 'name', 'url'],
    recommended: ['potentialAction', 'description'],
    optional: ['sameAs', 'publisher'],
  },
  WebPage: {
    required: ['@type', 'name'],
    recommended: ['description', 'url', 'datePublished', 'dateModified'],
    optional: ['breadcrumb', 'mainEntity', 'primaryImageOfPage'],
  },
  BreadcrumbList: {
    required: ['@type', 'itemListElement'],
    recommended: [],
    optional: ['name'],
  },
  JobPosting: {
    required: ['@type', 'title', 'datePosted', 'description', 'hiringOrganization'],
    recommended: ['validThrough', 'employmentType', 'jobLocation'],
    optional: ['baseSalary', 'applicantLocationRequirements', 'jobLocationType'],
  },
  Course: {
    required: ['@type', 'name'],
    recommended: ['description', 'provider', 'offers'],
    optional: ['courseCode', 'hasCourseInstance', 'educationalLevel'],
  },
  SoftwareApplication: {
    required: ['@type', 'name'],
    recommended: ['operatingSystem', 'applicationCategory', 'offers', 'description'],
    optional: ['screenshot', 'featureList', 'aggregateRating'],
  },
  Review: {
    required: ['@type', 'itemReviewed', 'reviewRating'],
    recommended: ['author', 'datePublished', 'reviewBody'],
    optional: ['publisher', 'name'],
  },
  Book: {
    required: ['@type', 'name'],
    recommended: ['author', 'isbn', 'description', 'image'],
    optional: ['publisher', 'datePublished', 'numberOfPages'],
  },
};

/**
 * Score schema completeness for a structured data item
 * @param {Object} schema - JSON-LD object
 * @returns {{ score: number, type: string, present: string[], missing: string[], completeness: string }}
 */
export function scoreSchemaCompleteness(schema) {
  if (!schema || !schema['@type']) {
    return { score: 0, type: 'Unknown', present: [], missing: [], completeness: 'none' };
  }

  const type = schema['@type'];
  const spec = SCHEMA_FIELDS[type];

  if (!spec) {
    // Unknown type — basic scoring
    const fieldCount = Object.keys(schema).filter(k => !k.startsWith('@') && schema[k] != null).length;
    return {
      score: Math.min(100, fieldCount * 15),
      type,
      present: Object.keys(schema).filter(k => !k.startsWith('@')),
      missing: [],
      completeness: fieldCount >= 5 ? 'good' : 'basic',
    };
  }

  const present = [];
  const missing = [];

  // Check required fields
  for (const field of spec.required) {
    if (field.startsWith('@') || schema[field] != null) {
      present.push(field);
    } else {
      missing.push(`${field} (required)`);
    }
  }

  // Check recommended fields
  for (const field of spec.recommended) {
    if (schema[field] != null) {
      present.push(field);
    } else {
      missing.push(`${field} (recommended)`);
    }
  }

  // Check optional fields (for bonus)
  let optionalCount = 0;
  for (const field of spec.optional) {
    if (schema[field] != null) {
      present.push(field);
      optionalCount++;
    }
  }

  const requiredScore = spec.required.filter(f => f.startsWith('@') || schema[f] != null).length / spec.required.length;
  const recommendedScore = spec.recommended.length > 0
    ? spec.recommended.filter(f => schema[f] != null).length / spec.recommended.length
    : 1;
  const optionalBonus = spec.optional.length > 0
    ? (optionalCount / spec.optional.length) * 0.1
    : 0;

  const score = Math.round((requiredScore * 50 + recommendedScore * 40 + optionalBonus * 10) * 100) / 100;

  let completeness = 'none';
  if (score >= 90) completeness = 'excellent';
  else if (score >= 70) completeness = 'good';
  else if (score >= 40) completeness = 'partial';
  else completeness = 'minimal';

  return { score: Math.round(score), type, present, missing, completeness };
}

/**
 * Score all structured data items on a page
 */
export function scoreAllSchemas(structuredData) {
  if (!structuredData || structuredData.length === 0) {
    return { items: [], averageScore: 0, hasSchema: false };
  }

  const items = structuredData.map(sd => {
    const data = sd?.data || sd;
    return scoreSchemaCompleteness(data);
  });

  const averageScore = Math.round(items.reduce((sum, i) => sum + i.score, 0) / items.length);

  return { items, averageScore, hasSchema: true };
}

export default scoreAllSchemas;
