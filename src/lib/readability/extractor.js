/**
 * Content Extraction Pipeline
 * Main entry point for parsing HTML and extracting structured content
 * Returns plain data objects - never raw HTML or DOM references (XSS prevention)
 */

import { parseHtml } from './utils/htmlParser.js';

/**
 * Extract content from HTML string
 * @param {string} htmlString - Raw HTML
 * @param {Object} options - { sourceUrl, inputMethod }
 * @returns {Object} Extracted content data
 */
export function extractContent(htmlString, options = {}) {
  if (!htmlString || typeof htmlString !== 'string') {
    throw new Error('HTML content is required for extraction');
  }

  if (htmlString.length < 50) {
    throw new Error('HTML content is too short for meaningful analysis (minimum 50 characters)');
  }

  const parsed = parseHtml(htmlString);

  return {
    metadata: parsed.metadata,
    structuredData: parsed.structuredData,
    headings: parsed.headings,
    semanticElements: parsed.semanticElements,
    images: parsed.images,
    tables: parsed.tables,
    lists: parsed.lists,
    links: parsed.links,
    ariaLandmarks: parsed.ariaLandmarks,
    language: parsed.language,
    mainContent: parsed.mainContent,
    textContent: parsed.textContent,
    paragraphs: parsed.paragraphs,
    contentToCodeRatio: parsed.contentToCodeRatio,
    totalHtmlBytes: parsed.totalHtmlBytes,
    inlinePercentage: parsed.inlinePercentage,
    wordCount: parsed.wordCount,
    isScreamingFrog: parsed.isScreamingFrog,
    sourceUrl: options.sourceUrl || null,
    inputMethod: options.inputMethod || 'unknown',
    extractedAt: new Date().toISOString()
  };
}

/**
 * Validate HTML content before extraction
 * @param {string} htmlString
 * @returns {{ valid: boolean, reason: string|null }}
 */
export function validateHtmlContent(htmlString) {
  if (!htmlString || typeof htmlString !== 'string') {
    return { valid: false, reason: 'No HTML content provided' };
  }

  if (htmlString.trim().length === 0) {
    return { valid: false, reason: 'HTML content is empty' };
  }

  if (htmlString.length > 10 * 1024 * 1024) {
    return { valid: false, reason: 'HTML content exceeds 10MB limit' };
  }

  // Check for basic HTML markers
  const hasHtmlMarkers = /<html|<head|<body|<!doctype/i.test(htmlString);
  const hasAnyTags = /<[a-z][^>]*>/i.test(htmlString);

  if (!hasHtmlMarkers && !hasAnyTags) {
    return { valid: false, reason: 'Content does not appear to be valid HTML' };
  }

  return { valid: true, reason: null };
}

export default extractContent;
