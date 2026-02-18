/**
 * AI-Specific Signals Checks (AS-01 to AS-10)
 * Category weight: 20%
 */

import { splitSentences, countWords } from '../utils/textAnalysis.js';

const CATEGORY = 'AI-Specific Signals';

const BOILERPLATE_PATTERNS = [
  /lorem ipsum/i,
  /all rights reserved/i,
  /terms and conditions apply/i,
  /subscribe to our newsletter/i,
  /click here to learn more/i,
  /share this (article|post|page)/i,
  /leave a (comment|reply)/i,
  /related (articles|posts|content)/i,
  /popular (articles|posts)/i,
  /you may also like/i,
  /copyright \d{4}/i
];

export function checkContentUniqueness(parsedData) {
  const text = parsedData.textContent;
  const boilerplateMatches = BOILERPLATE_PATTERNS.filter(p => p.test(text));

  return {
    id: 'AS-01', category: CATEGORY, title: 'Content uniqueness signals',
    status: boilerplateMatches.length === 0 ? 'pass' : boilerplateMatches.length <= 2 ? 'warn' : 'fail',
    severity: 'high',
    details: boilerplateMatches.length === 0 ? 'No boilerplate content detected in main body.' : `Found ${boilerplateMatches.length} boilerplate pattern(s).`,
    affectedElements: boilerplateMatches.map(p => p.source),
    recommendation: boilerplateMatches.length > 0 ? 'Remove boilerplate and template content from the main body.' : ''
  };
}

export function checkSourceAttribution(parsedData) {
  const links = parsedData.links;
  const externalLinks = links.filter(l => !l.isInternal && l.href.startsWith('http'));
  const text = parsedData.textContent;

  const citationPatterns = [/\bsource\b/i, /\bcited\b/i, /\breference\b/i, /\baccording to\b/i, /\bper\s+\w+/i];
  const citations = citationPatterns.filter(p => p.test(text)).length;

  return {
    id: 'AS-02', category: CATEGORY, title: 'Source attribution',
    status: externalLinks.length >= 3 || citations >= 2 ? 'pass' : externalLinks.length >= 1 || citations >= 1 ? 'warn' : 'fail',
    severity: 'medium',
    details: `${externalLinks.length} external link(s) and ${citations} citation pattern(s) found.`,
    affectedElements: [],
    recommendation: externalLinks.length < 3 ? 'Add external links to authoritative sources to support your content claims.' : ''
  };
}

export function checkAuthorExpertise(parsedData) {
  const text = parsedData.textContent;
  const data = parsedData.structuredData.filter(d => d.valid);

  const hasAuthorSchema = data.some(d => d.data?.author);
  const hasAuthorBio = /\babout the author\b|\bwritten by\b|\bauthor bio\b|\bexpertise\b|\bcredentials\b|\bqualified\b/i.test(text);
  const hasMetaAuthor = !!parsedData.metadata.author;

  return {
    id: 'AS-03', category: CATEGORY, title: 'Author expertise indicators',
    status: hasAuthorSchema || hasAuthorBio ? 'pass' : hasMetaAuthor ? 'warn' : 'fail',
    severity: 'medium',
    details: `Author schema: ${hasAuthorSchema ? 'yes' : 'no'}. Author bio: ${hasAuthorBio ? 'yes' : 'no'}. Meta author: ${hasMetaAuthor ? 'yes' : 'no'}.`,
    affectedElements: [],
    recommendation: !hasAuthorSchema && !hasAuthorBio ? 'Add author information with credentials to establish expertise and trustworthiness.' : ''
  };
}

export function checkContentFreshnessDate(parsedData) {
  const meta = parsedData.metadata;
  const data = parsedData.structuredData.filter(d => d.valid);

  const dates = [];
  if (meta.datePublished) dates.push(meta.datePublished);
  if (meta.dateModified) dates.push(meta.dateModified);
  data.forEach(d => {
    if (d.data?.datePublished) dates.push(d.data.datePublished);
    if (d.data?.dateModified) dates.push(d.data.dateModified);
  });

  if (dates.length === 0) {
    return {
      id: 'AS-04', category: CATEGORY, title: 'Content freshness',
      status: 'fail', severity: 'medium',
      details: 'No publication or modification date found.',
      affectedElements: [],
      recommendation: 'Add datePublished and dateModified to structured data or meta tags.'
    };
  }

  const now = new Date();
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 12, now.getDate());
  const isFresh = dates.some(d => {
    try { return new Date(d) > twelveMonthsAgo; } catch { return false; }
  });

  return {
    id: 'AS-04', category: CATEGORY, title: 'Content freshness',
    status: isFresh ? 'pass' : 'warn',
    severity: 'medium',
    details: isFresh ? 'Content has been published or modified within the last 12 months.' : 'Content may be outdated (no recent date found).',
    affectedElements: dates,
    recommendation: !isFresh ? 'Update your content and dateModified to signal freshness to AI models.' : ''
  };
}

export function checkQuotablePassages(parsedData) {
  const sentences = splitSentences(parsedData.textContent);
  const quotable = sentences.filter(s => {
    const wc = countWords(s);
    return wc >= 8 && wc <= 35 &&
      !s.endsWith('?') &&
      !/\b(I|we|you|they)\b/i.test(s.substring(0, 5)) &&
      /\b(is|are|was|were|has|have|can|will|should|must|provides|enables|allows|means)\b/i.test(s);
  });

  return {
    id: 'AS-05', category: CATEGORY, title: 'Quotable passages',
    status: quotable.length >= 5 ? 'pass' : quotable.length >= 2 ? 'warn' : 'fail',
    severity: 'high',
    details: `Found ${quotable.length} quotable passage(s) suitable for AI citation.`,
    affectedElements: quotable.slice(0, 3),
    recommendation: quotable.length < 5 ? 'Include concise, self-contained statements that AI models can easily quote or cite.' : ''
  };
}

export function checkDefinitionPatterns(parsedData) {
  const text = parsedData.textContent;
  const defPatterns = [
    /\b\w+\s+is\s+(defined as|a|an|the)\b/i,
    /\b\w+\s+refers?\s+to\b/i,
    /\b\w+\s+means?\b/i,
    /\bdefinition of\b/i,
    /\balso known as\b/i,
    /\bi\.e\.\b/i
  ];
  const definitions = defPatterns.filter(p => p.test(text)).length;

  return {
    id: 'AS-06', category: CATEGORY, title: 'Definition patterns',
    status: definitions >= 3 ? 'pass' : definitions >= 1 ? 'warn' : 'fail',
    severity: 'medium',
    details: `Found ${definitions} definition pattern(s).`,
    affectedElements: [],
    recommendation: definitions < 3 ? 'Explicitly define key terms using "X is..." or "X refers to..." patterns.' : ''
  };
}

export function checkComparisonPatterns(parsedData) {
  const text = parsedData.textContent;
  const patterns = [
    /\bcompared to\b/i, /\bversus\b|\bvs\.?\b/i,
    /\bunlike\b/i, /\bsimilar to\b/i,
    /\bin contrast\b/i, /\bon the other hand\b/i,
    /\badvantages?\b.*\bdisadvantages?\b/i,
    /\bpros?\b.*\bcons?\b/i, /\bdifference between\b/i
  ];
  const comparisons = patterns.filter(p => p.test(text)).length;

  return {
    id: 'AS-07', category: CATEGORY, title: 'Comparison/contrast patterns',
    status: comparisons >= 2 ? 'pass' : comparisons >= 1 ? 'warn' : 'fail',
    severity: 'low',
    details: `Found ${comparisons} comparison/contrast pattern(s).`,
    affectedElements: [],
    recommendation: comparisons < 2 ? 'Use comparison structures (vs., unlike, compared to) when relevant to help AI understand relationships.' : ''
  };
}

export function checkStepByStepPatterns(parsedData) {
  const text = parsedData.textContent;
  const lists = parsedData.lists;
  const hasOrderedList = lists.orderedLists > 0;
  const stepPatterns = [/\bstep\s+\d/i, /\bfirst\b.*\bthen\b/i, /\bnext\b.*\bfinally\b/i, /\bhow\s+to\b/i];
  const hasStepContent = stepPatterns.some(p => p.test(text));

  return {
    id: 'AS-08', category: CATEGORY, title: 'Step-by-step patterns',
    status: hasOrderedList || hasStepContent ? 'pass' : 'warn',
    severity: 'medium',
    details: `Ordered lists: ${lists.orderedLists}. Step patterns: ${hasStepContent ? 'detected' : 'not detected'}.`,
    affectedElements: [],
    recommendation: !hasOrderedList && !hasStepContent ? 'Use numbered lists or step-by-step instructions where applicable.' : ''
  };
}

export function checkDataStatistics(parsedData) {
  const text = parsedData.textContent;
  const numericPatterns = [
    /\d+%/g,
    /\$[\d,]+/g,
    /\b\d{1,3}(,\d{3})+\b/g,
    /\b\d+(\.\d+)?\s*(million|billion|trillion|percent|times|x)\b/ig
  ];
  let dataPoints = 0;
  numericPatterns.forEach(p => {
    const matches = text.match(p);
    if (matches) dataPoints += matches.length;
  });

  return {
    id: 'AS-09', category: CATEGORY, title: 'Data/statistics present',
    status: dataPoints >= 3 ? 'pass' : dataPoints >= 1 ? 'warn' : 'fail',
    severity: 'low',
    details: `Found ${dataPoints} data point(s) or statistics.`,
    affectedElements: [],
    recommendation: dataPoints < 3 ? 'Include specific data points, statistics, or metrics to enhance credibility.' : ''
  };
}

export function checkInternalLinkContext(parsedData) {
  const internalLinks = parsedData.links.filter(l => l.isInternal);
  if (internalLinks.length === 0) {
    return {
      id: 'AS-10', category: CATEGORY, title: 'Internal linking context',
      status: 'warn', severity: 'medium',
      details: 'No internal links found.',
      affectedElements: [],
      recommendation: 'Add internal links to related content with descriptive anchor text.'
    };
  }

  const descriptive = internalLinks.filter(l => l.isDescriptive);
  const ratio = Math.round((descriptive.length / internalLinks.length) * 100);
  const nonDescriptive = internalLinks.filter(l => !l.isDescriptive).slice(0, 5).map(l => l.text || '(empty)');

  return {
    id: 'AS-10', category: CATEGORY, title: 'Internal linking context',
    status: ratio >= 80 ? 'pass' : ratio >= 50 ? 'warn' : 'fail',
    severity: 'medium',
    details: `${ratio}% of internal links have descriptive anchor text (${descriptive.length}/${internalLinks.length}).`,
    affectedElements: nonDescriptive,
    recommendation: ratio < 80 ? 'Replace generic anchor text ("click here", "read more") with descriptive text.' : ''
  };
}

export function runAISignalsChecks(parsedData) {
  return [
    checkContentUniqueness(parsedData),
    checkSourceAttribution(parsedData),
    checkAuthorExpertise(parsedData),
    checkContentFreshnessDate(parsedData),
    checkQuotablePassages(parsedData),
    checkDefinitionPatterns(parsedData),
    checkComparisonPatterns(parsedData),
    checkStepByStepPatterns(parsedData),
    checkDataStatistics(parsedData),
    checkInternalLinkContext(parsedData)
  ];
}

export default runAISignalsChecks;
