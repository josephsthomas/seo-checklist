/**
 * HTML Parser for AI Readability Checker
 * Parses HTML using browser-native DOMParser
 * Never returns raw HTML or DOM objects (XSS prevention)
 */

const COOKIE_BANNER_SELECTORS = [
  '[class*="cookie"]', '[id*="cookie"]',
  '[class*="consent"]', '[id*="consent"]',
  '[class*="gdpr"]', '[id*="gdpr"]',
  '[class*="privacy-banner"]', '[id*="privacy-banner"]',
  '.cc-banner', '#onetrust-banner-sdk',
  '.cookie-notice', '#cookie-law-info-bar'
];

const NAV_SELECTORS = ['header', 'footer', 'nav', '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]', 'aside'];

/**
 * Parse HTML string and extract structured data
 * @param {string} htmlString - Raw HTML string
 * @returns {Object} Extracted content data (no DOM objects)
 */
export function parseHtml(htmlString) {
  if (!htmlString || typeof htmlString !== 'string') {
    return createEmptyResult();
  }

  // Strip BOM if present
  let html = htmlString;
  if (html.charCodeAt(0) === 0xFEFF) {
    html = html.substring(1);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const metadata = extractMetadata(doc);
  const structuredData = extractStructuredData(doc);
  const headings = extractHeadings(doc);
  const semanticElements = extractSemanticElements(doc);
  const images = extractImages(doc);
  const tables = extractTables(doc);
  const lists = extractLists(doc);
  const links = extractLinks(doc);
  const ariaLandmarks = extractAriaLandmarks(doc);
  const language = detectLanguage(doc, html);

  // Clean content for analysis
  const cleanDoc = parser.parseFromString(html, 'text/html');
  stripNonContent(cleanDoc);

  const mainContent = extractMainContent(cleanDoc);
  const textContent = mainContent || cleanDoc.body?.textContent?.replace(/\s+/g, ' ').trim() || '';

  const totalHtmlBytes = new Blob([html]).size;
  const textBytes = new Blob([textContent]).size;
  const contentToCodeRatio = totalHtmlBytes > 0 ? (textBytes / totalHtmlBytes) * 100 : 0;

  const inlineStyleSize = calculateInlineSize(doc, 'style');
  const inlineScriptSize = calculateInlineSize(doc, 'script');
  const inlinePercentage = totalHtmlBytes > 0 ? ((inlineStyleSize + inlineScriptSize) / totalHtmlBytes) * 100 : 0;

  const isScreamingFrog = detectScreamingFrog(html, doc);

  return {
    metadata,
    structuredData,
    headings,
    semanticElements,
    images,
    tables,
    lists,
    links,
    ariaLandmarks,
    language,
    mainContent: textContent,
    textContent,
    contentToCodeRatio: Math.round(contentToCodeRatio * 100) / 100,
    totalHtmlBytes,
    inlinePercentage: Math.round(inlinePercentage * 100) / 100,
    isScreamingFrog,
    wordCount: textContent ? textContent.split(/\s+/).filter(w => w.length > 0).length : 0,
    paragraphs: extractParagraphs(cleanDoc)
  };
}

function createEmptyResult() {
  return {
    metadata: {}, structuredData: [], headings: [], semanticElements: {},
    images: [], tables: [], lists: [], links: [], ariaLandmarks: [],
    language: null, mainContent: '', textContent: '', contentToCodeRatio: 0,
    totalHtmlBytes: 0, inlinePercentage: 0, isScreamingFrog: false,
    wordCount: 0, paragraphs: []
  };
}

function extractMetadata(doc) {
  const getMeta = (name) => {
    const el = doc.querySelector(`meta[name="${name}"]`) || doc.querySelector(`meta[property="${name}"]`);
    return el?.getAttribute('content') || '';
  };

  return {
    title: doc.querySelector('title')?.textContent?.trim() || '',
    description: getMeta('description'),
    robots: getMeta('robots'),
    canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    ogTitle: getMeta('og:title'),
    ogDescription: getMeta('og:description'),
    ogImage: getMeta('og:image'),
    ogUrl: getMeta('og:url'),
    ogType: getMeta('og:type'),
    twitterCard: getMeta('twitter:card'),
    twitterTitle: getMeta('twitter:title'),
    twitterDescription: getMeta('twitter:description'),
    author: getMeta('author'),
    datePublished: getMeta('article:published_time') || getMeta('date'),
    dateModified: getMeta('article:modified_time'),
    charset: doc.querySelector('meta[charset]')?.getAttribute('charset') || doc.querySelector('meta[http-equiv="Content-Type"]')?.getAttribute('content')?.match(/charset=([^;]+)/)?.[1] || 'UTF-8',
    hreflang: Array.from(doc.querySelectorAll('link[rel="alternate"][hreflang]')).map(el => ({
      lang: el.getAttribute('hreflang'),
      href: el.getAttribute('href')
    })),
    gptBotMeta: getMeta('GPTBot'),
    googleExtendedMeta: getMeta('Google-Extended'),
    aiDirectives: extractAIDirectives(doc)
  };
}

function extractAIDirectives(doc) {
  const directives = {};
  const botNames = ['GPTBot', 'Google-Extended', 'PerplexityBot', 'ClaudeBot', 'anthropic-ai', 'CCBot'];
  botNames.forEach(bot => {
    const meta = doc.querySelector(`meta[name="${bot}"]`);
    if (meta) {
      directives[bot] = meta.getAttribute('content') || '';
    }
  });

  // Check robots meta for noai
  const robotsMeta = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  if (robotsMeta.toLowerCase().includes('noai')) {
    directives.robotsNoAI = true;
  }

  return directives;
}

function extractStructuredData(doc) {
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  const data = [];
  scripts.forEach(script => {
    try {
      const parsed = JSON.parse(script.textContent);
      data.push({ type: 'json-ld', data: parsed, valid: true });
    } catch (e) {
      data.push({ type: 'json-ld', data: null, valid: false, error: e.message });
    }
  });
  return data;
}

function extractHeadings(doc) {
  return Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
    level: parseInt(h.tagName[1]),
    text: h.textContent?.trim() || '',
    id: h.id || null
  }));
}

function extractSemanticElements(doc) {
  return {
    hasMain: !!doc.querySelector('main'),
    hasArticle: !!doc.querySelector('article'),
    hasSection: !!doc.querySelector('section'),
    hasAside: !!doc.querySelector('aside'),
    hasNav: !!doc.querySelector('nav'),
    hasHeader: !!doc.querySelector('header'),
    hasFooter: !!doc.querySelector('footer'),
    hasFigure: !!doc.querySelector('figure'),
    hasFigcaption: !!doc.querySelector('figcaption')
  };
}

function extractImages(doc) {
  return Array.from(doc.querySelectorAll('img')).map(img => ({
    src: img.getAttribute('src') || '',
    alt: img.getAttribute('alt'),
    hasAlt: img.hasAttribute('alt'),
    width: img.getAttribute('width') || null,
    height: img.getAttribute('height') || null
  }));
}

function extractTables(doc) {
  return Array.from(doc.querySelectorAll('table')).map(table => ({
    hasThead: !!table.querySelector('thead'),
    hasTh: !!table.querySelector('th'),
    rowCount: table.querySelectorAll('tr').length,
    caption: table.querySelector('caption')?.textContent?.trim() || null
  }));
}

function extractLists(doc) {
  return {
    orderedLists: doc.querySelectorAll('ol').length,
    unorderedLists: doc.querySelectorAll('ul').length,
    definitionLists: doc.querySelectorAll('dl').length
  };
}

function extractLinks(doc) {
  return Array.from(doc.querySelectorAll('a[href]')).map(a => {
    const href = a.getAttribute('href') || '';
    const isInternal = href.startsWith('/') || href.startsWith('#') || href.startsWith('./');
    return {
      href,
      text: a.textContent?.trim() || '',
      isInternal,
      rel: a.getAttribute('rel') || null,
      isDescriptive: (a.textContent?.trim() || '').length > 3 &&
        !['click here', 'read more', 'learn more', 'here', 'link'].includes((a.textContent?.trim() || '').toLowerCase())
    };
  });
}

function extractAriaLandmarks(doc) {
  const roles = ['main', 'navigation', 'banner', 'contentinfo', 'complementary', 'search', 'form', 'region'];
  return roles.filter(role => doc.querySelector(`[role="${role}"]`));
}

function detectLanguage(doc, html) {
  const langAttr = doc.documentElement?.getAttribute('lang') || doc.documentElement?.getAttribute('xml:lang');
  if (langAttr) return langAttr.toLowerCase().split('-')[0];

  // Content heuristic for English
  const contentLangMeta = doc.querySelector('meta[http-equiv="content-language"]')?.getAttribute('content');
  if (contentLangMeta) return contentLangMeta.toLowerCase().split('-')[0];

  return null;
}

function stripNonContent(doc) {
  // Remove scripts, styles, comments
  doc.querySelectorAll('script, style, noscript, svg, iframe').forEach(el => el.remove());

  // Remove hidden elements
  doc.querySelectorAll('[style*="display:none"], [style*="display: none"], [style*="visibility:hidden"], [style*="visibility: hidden"], [aria-hidden="true"]').forEach(el => el.remove());

  // Remove cookie banners
  COOKIE_BANNER_SELECTORS.forEach(sel => {
    try { doc.querySelectorAll(sel).forEach(el => el.remove()); } catch {}
  });

  // Remove navigation chrome
  NAV_SELECTORS.forEach(sel => {
    try { doc.querySelectorAll(sel).forEach(el => el.remove()); } catch {}
  });
}

function extractMainContent(doc) {
  // Try semantic elements first
  const mainEl = doc.querySelector('main') || doc.querySelector('article') || doc.querySelector('[role="main"]');
  if (mainEl) {
    return mainEl.textContent?.replace(/\s+/g, ' ').trim() || '';
  }

  // Fallback to body
  return doc.body?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function extractParagraphs(doc) {
  return Array.from(doc.querySelectorAll('p')).map(p => {
    const text = p.textContent?.trim() || '';
    return {
      text,
      wordCount: text.split(/\s+/).filter(w => w.length > 0).length
    };
  }).filter(p => p.wordCount > 0);
}

function calculateInlineSize(doc, tagName) {
  let size = 0;
  doc.querySelectorAll(tagName).forEach(el => {
    if (!el.getAttribute('src')) {
      size += new Blob([el.textContent || '']).size;
    }
  });
  return size;
}

function detectScreamingFrog(html, doc) {
  // Check for Screaming Frog generator meta tag or characteristic patterns
  const generator = doc.querySelector('meta[name="generator"]')?.getAttribute('content') || '';
  if (generator.toLowerCase().includes('screaming frog')) return true;

  // Check for SF-specific comment patterns
  if (html.includes('Screaming Frog') || html.includes('screaming-frog')) return true;

  // Check for SF rendered HTML output patterns
  const comment = html.match(/<!--.*?Screaming\s*Frog.*?-->/i);
  if (comment) return true;

  return false;
}

export default parseHtml;
