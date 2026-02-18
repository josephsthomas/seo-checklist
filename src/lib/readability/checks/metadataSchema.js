/**
 * Metadata & Schema Checks (MS-01 to MS-10)
 * Category weight: 15%
 */

const CATEGORY = 'Metadata & Schema';

export function checkTitleTag(parsedData) {
  const title = parsedData.metadata.title;
  const len = title ? title.length : 0;
  return {
    id: 'MS-01', category: CATEGORY, title: 'Title tag present and optimal',
    status: len >= 30 && len <= 60 ? 'pass' : len > 0 ? 'warn' : 'fail',
    severity: 'high',
    details: len === 0 ? 'No title tag found.' : `Title: "${title}" (${len} characters). ${len < 30 ? 'Too short.' : len > 60 ? 'Too long.' : 'Optimal length.'}`,
    affectedElements: len === 0 ? [] : [title],
    recommendation: len === 0 ? 'Add a descriptive <title> tag (30-60 characters).' : len < 30 ? 'Extend your title to at least 30 characters.' : len > 60 ? 'Shorten your title to 60 characters or fewer.' : ''
  };
}

export function checkMetaDescription(parsedData) {
  const desc = parsedData.metadata.description;
  const len = desc ? desc.length : 0;
  return {
    id: 'MS-02', category: CATEGORY, title: 'Meta description present and optimal',
    status: len >= 120 && len <= 160 ? 'pass' : len > 0 ? 'warn' : 'fail',
    severity: 'high',
    details: len === 0 ? 'No meta description found.' : `Meta description: ${len} characters. ${len < 120 ? 'Too short.' : len > 160 ? 'Too long.' : 'Optimal length.'}`,
    affectedElements: len === 0 ? [] : [desc],
    recommendation: len === 0 ? 'Add a meta description (120-160 characters).' : len < 120 ? 'Extend your meta description to at least 120 characters.' : len > 160 ? 'Shorten your meta description to 160 characters or fewer.' : ''
  };
}

export function checkOpenGraphTags(parsedData) {
  const meta = parsedData.metadata;
  const checks = [
    { key: 'ogTitle', label: 'og:title' },
    { key: 'ogDescription', label: 'og:description' },
    { key: 'ogImage', label: 'og:image' },
    { key: 'ogUrl', label: 'og:url' }
  ];
  const present = checks.filter(c => meta[c.key]);
  const missing = checks.filter(c => !meta[c.key]).map(c => c.label);

  return {
    id: 'MS-03', category: CATEGORY, title: 'Open Graph tags complete',
    status: missing.length === 0 ? 'pass' : present.length >= 2 ? 'warn' : 'fail',
    severity: 'medium',
    details: `${present.length}/${checks.length} Open Graph tags present.${missing.length > 0 ? ` Missing: ${missing.join(', ')}.` : ''}`,
    affectedElements: missing,
    recommendation: missing.length > 0 ? `Add missing OG tags: ${missing.join(', ')}.` : ''
  };
}

export function checkTwitterCardTags(parsedData) {
  const meta = parsedData.metadata;
  const hasCard = !!meta.twitterCard;
  const hasTitle = !!meta.twitterTitle;
  const hasDesc = !!meta.twitterDescription;
  const count = [hasCard, hasTitle, hasDesc].filter(Boolean).length;
  const missing = [];
  if (!hasCard) missing.push('twitter:card');
  if (!hasTitle) missing.push('twitter:title');
  if (!hasDesc) missing.push('twitter:description');

  return {
    id: 'MS-04', category: CATEGORY, title: 'Twitter Card tags present',
    status: count === 3 ? 'pass' : count >= 1 ? 'warn' : 'fail',
    severity: 'low',
    details: `${count}/3 Twitter Card tags present.`,
    affectedElements: missing,
    recommendation: count < 3 ? 'Add missing Twitter Card meta tags for better social sharing.' : ''
  };
}

export function checkJsonLdPresent(parsedData) {
  const data = parsedData.structuredData;
  const validData = data.filter(d => d.valid);
  return {
    id: 'MS-05', category: CATEGORY, title: 'JSON-LD structured data present',
    status: validData.length > 0 ? 'pass' : 'fail',
    severity: 'high',
    details: validData.length > 0 ? `Found ${validData.length} valid JSON-LD block(s).` : 'No valid JSON-LD structured data found.',
    affectedElements: [],
    recommendation: validData.length === 0 ? 'Add JSON-LD structured data to help search engines and AI models understand your content.' : ''
  };
}

export function checkSchemaType(parsedData) {
  const data = parsedData.structuredData.filter(d => d.valid);
  if (data.length === 0) {
    return {
      id: 'MS-06', category: CATEGORY, title: 'Schema.org type appropriate',
      status: 'na', severity: 'medium',
      details: 'No structured data to evaluate.',
      affectedElements: [], recommendation: ''
    };
  }
  const types = data.map(d => {
    const t = d.data?.['@type'];
    return Array.isArray(t) ? t : [t || 'Unknown'];
  }).flat();
  return {
    id: 'MS-06', category: CATEGORY, title: 'Schema.org type appropriate',
    status: types.length > 0 && !types.includes('Unknown') ? 'pass' : 'warn',
    severity: 'medium',
    details: `Schema type(s): ${types.join(', ')}.`,
    affectedElements: types,
    recommendation: types.includes('Unknown') ? 'Ensure all structured data blocks have a valid @type property.' : ''
  };
}

export function checkAuthorPublisher(parsedData) {
  const data = parsedData.structuredData.filter(d => d.valid);
  const hasAuthor = data.some(d => d.data?.author || d.data?.creator);
  const hasPublisher = data.some(d => d.data?.publisher);
  const metaAuthor = !!parsedData.metadata.author;

  return {
    id: 'MS-07', category: CATEGORY, title: 'Author/publisher marked up',
    status: (hasAuthor || metaAuthor) && hasPublisher ? 'pass' : hasAuthor || metaAuthor || hasPublisher ? 'warn' : 'fail',
    severity: 'medium',
    details: `Author: ${hasAuthor || metaAuthor ? 'present' : 'missing'}. Publisher: ${hasPublisher ? 'present' : 'missing'}.`,
    affectedElements: [...(!hasAuthor && !metaAuthor ? ['author'] : []), ...(!hasPublisher ? ['publisher'] : [])],
    recommendation: !hasAuthor && !metaAuthor ? 'Add author information in structured data or meta tags.' : !hasPublisher ? 'Add publisher information in structured data.' : ''
  };
}

export function checkDatePublished(parsedData) {
  const data = parsedData.structuredData.filter(d => d.valid);
  const hasDatePublished = data.some(d => d.data?.datePublished);
  const hasDateModified = data.some(d => d.data?.dateModified);
  const metaDate = !!(parsedData.metadata.datePublished || parsedData.metadata.dateModified);

  return {
    id: 'MS-08', category: CATEGORY, title: 'Date published/modified present',
    status: hasDatePublished || hasDateModified || metaDate ? 'pass' : 'fail',
    severity: 'medium',
    details: `datePublished: ${hasDatePublished || parsedData.metadata.datePublished ? 'present' : 'missing'}. dateModified: ${hasDateModified || parsedData.metadata.dateModified ? 'present' : 'missing'}.`,
    affectedElements: [],
    recommendation: !hasDatePublished && !metaDate ? 'Add datePublished and dateModified to your structured data.' : ''
  };
}

export function checkBreadcrumbMarkup(parsedData) {
  const data = parsedData.structuredData.filter(d => d.valid);
  const hasBreadcrumb = data.some(d => {
    const type = d.data?.['@type'];
    return type === 'BreadcrumbList' || (Array.isArray(type) && type.includes('BreadcrumbList'));
  });

  return {
    id: 'MS-09', category: CATEGORY, title: 'Breadcrumb markup present',
    status: hasBreadcrumb ? 'pass' : 'warn',
    severity: 'low',
    details: hasBreadcrumb ? 'BreadcrumbList schema detected.' : 'No breadcrumb markup found.',
    affectedElements: [],
    recommendation: !hasBreadcrumb ? 'Add BreadcrumbList structured data to improve navigation context.' : ''
  };
}

export function checkFAQHowToSchema(parsedData) {
  const data = parsedData.structuredData.filter(d => d.valid);
  const text = parsedData.textContent.toLowerCase();

  const hasFAQContent = /\bfaq\b|frequently asked|questions?\s+and\s+answers?/i.test(text);
  const hasHowToContent = /\bhow\s+to\b|step\s+\d|step-by-step/i.test(text);

  const hasFAQSchema = data.some(d => d.data?.['@type'] === 'FAQPage');
  const hasHowToSchema = data.some(d => d.data?.['@type'] === 'HowTo');

  if (!hasFAQContent && !hasHowToContent) {
    return {
      id: 'MS-10', category: CATEGORY, title: 'FAQ/HowTo schema when applicable',
      status: 'na', severity: 'medium',
      details: 'Content does not appear to contain FAQ or HowTo patterns.',
      affectedElements: [], recommendation: ''
    };
  }

  const issues = [];
  if (hasFAQContent && !hasFAQSchema) issues.push('FAQ content detected but no FAQPage schema');
  if (hasHowToContent && !hasHowToSchema) issues.push('HowTo content detected but no HowTo schema');

  return {
    id: 'MS-10', category: CATEGORY, title: 'FAQ/HowTo schema when applicable',
    status: issues.length === 0 ? 'pass' : 'warn',
    severity: 'medium',
    details: issues.length === 0 ? 'Appropriate schema markup found for content type.' : issues.join('. ') + '.',
    affectedElements: issues,
    recommendation: issues.length > 0 ? 'Add FAQPage or HowTo schema markup to match your content structure.' : ''
  };
}

export function runMetadataSchemaChecks(parsedData) {
  return [
    checkTitleTag(parsedData),
    checkMetaDescription(parsedData),
    checkOpenGraphTags(parsedData),
    checkTwitterCardTags(parsedData),
    checkJsonLdPresent(parsedData),
    checkSchemaType(parsedData),
    checkAuthorPublisher(parsedData),
    checkDatePublished(parsedData),
    checkBreadcrumbMarkup(parsedData),
    checkFAQHowToSchema(parsedData)
  ];
}

export default runMetadataSchemaChecks;
