/**
 * Technical Accessibility Checks (TA-01 to TA-10.5)
 * Category weight: 20%
 */

const CATEGORY = 'Technical Accessibility';

export function checkSSR(parsedData) {
  const wordCount = parsedData.wordCount;
  const isSSR = wordCount > 100;
  const hasContent = wordCount > 50;

  return {
    id: 'TA-01', category: CATEGORY, title: 'Server-side rendering',
    status: isSSR ? 'pass' : hasContent ? 'warn' : 'fail',
    severity: 'critical',
    details: isSSR ? `Content is present in initial HTML (${wordCount} words detected).` : `Only ${wordCount} words found in HTML. Content may be JavaScript-rendered.`,
    affectedElements: [],
    recommendation: !isSSR ? 'Ensure content is server-side rendered or pre-rendered so AI crawlers can access it without JavaScript.' : ''
  };
}

export function checkRobotsDirectives(parsedData) {
  const robots = (parsedData.metadata.robots || '').toLowerCase();
  const directives = parsedData.metadata.aiDirectives || {};

  const issues = [];
  if (robots.includes('noindex')) issues.push('noindex directive found in robots meta');
  if (robots.includes('nofollow')) issues.push('nofollow directive found in robots meta');
  if (robots.includes('noai') || directives.robotsNoAI) issues.push('noai directive blocks AI access');

  const aiCrawlers = ['GPTBot', 'Google-Extended', 'PerplexityBot', 'ClaudeBot', 'anthropic-ai', 'CCBot'];
  aiCrawlers.forEach(bot => {
    if (directives[bot]) {
      const content = directives[bot].toLowerCase();
      if (content.includes('noindex') || content.includes('none') || content.includes('nofollow')) {
        issues.push(`${bot} restricted: ${directives[bot]}`);
      }
    }
  });

  return {
    id: 'TA-02', category: CATEGORY, title: 'Robots & AI crawler directives',
    status: issues.length === 0 ? 'pass' : 'fail',
    severity: 'critical',
    details: issues.length === 0 ? 'No restrictive robots or AI crawler directives found.' : `Found ${issues.length} restrictive directive(s).`,
    affectedElements: issues,
    recommendation: issues.length > 0 ? 'Review robots directives. Remove noindex/noai restrictions if you want AI models to access your content.' : ''
  };
}

export function checkRobotsTxt(parsedData) {
  // robots.txt requires server-side fetching; report meta-level findings
  const directives = parsedData.metadata.aiDirectives || {};
  const crawlerIssues = Object.keys(directives).filter(k => k !== 'robotsNoAI');

  // Determine status based on whether AI-specific directives restrict access
  let status = 'pass';
  if (crawlerIssues.length > 0) {
    // Check if any directives are actually restrictive
    const hasRestrictive = crawlerIssues.some(key => {
      const val = (directives[key] || '').toLowerCase();
      return val.includes('noindex') || val.includes('none') || val.includes('nofollow') || val.includes('disallow');
    });
    status = hasRestrictive ? 'fail' : 'warn';
  }

  return {
    id: 'TA-03', category: CATEGORY, title: 'robots.txt AI crawler rules',
    status,
    severity: 'high',
    details: crawlerIssues.length > 0
      ? `Found ${crawlerIssues.length} AI-specific meta directive(s). Review to ensure they are not overly restrictive.`
      : 'No AI-specific crawler directives found in meta tags. robots.txt file analysis requires server-side fetching.',
    affectedElements: crawlerIssues,
    recommendation: crawlerIssues.length > 0
      ? 'Review AI crawler directives. Verify your robots.txt allows GPTBot, Google-Extended, ClaudeBot, and other AI crawlers.'
      : 'Verify your robots.txt file allows AI crawlers if you want your content to be discoverable by AI.'
  };
}

export function checkCanonicalUrl(parsedData) {
  const canonical = parsedData.metadata.canonical;

  // Validate URL format if canonical is present
  let isValidUrl = false;
  if (canonical) {
    try {
      const url = new URL(canonical);
      isValidUrl = url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      isValidUrl = false;
    }
  }

  const status = !canonical ? 'warn' : isValidUrl ? 'pass' : 'fail';
  const details = !canonical
    ? 'No canonical URL found.'
    : isValidUrl
    ? `Canonical URL: ${canonical}`
    : `Canonical URL is not a valid URL: ${canonical}`;
  const recommendation = !canonical
    ? 'Add a <link rel="canonical"> tag to prevent duplicate content issues.'
    : !isValidUrl
    ? 'The canonical URL must be a fully qualified URL starting with http:// or https://.'
    : '';

  return {
    id: 'TA-04', category: CATEGORY, title: 'Canonical URL set',
    status,
    severity: 'medium',
    details,
    affectedElements: !canonical || isValidUrl ? [] : [canonical],
    recommendation
  };
}

export function checkPageWeight(parsedData) {
  const bytes = parsedData.totalHtmlBytes;
  const kb = Math.round(bytes / 1024);
  const mb = (bytes / (1024 * 1024)).toFixed(2);
  const MAX_BYTES = 2 * 1024 * 1024;

  return {
    id: 'TA-05', category: CATEGORY, title: 'Page load weight',
    status: bytes < MAX_BYTES ? 'pass' : 'fail',
    severity: 'medium',
    details: `HTML size: ${kb < 1024 ? `${kb}KB` : `${mb}MB`}.`,
    affectedElements: [],
    recommendation: bytes >= MAX_BYTES ? 'Reduce HTML size below 2MB. Remove unnecessary inline assets and optimize content delivery.' : ''
  };
}

export function checkInlineAssets(parsedData) {
  const pct = parsedData.inlinePercentage;
  return {
    id: 'TA-06', category: CATEGORY, title: 'Inline CSS/JS minimal',
    status: pct < 20 ? 'pass' : pct < 35 ? 'warn' : 'fail',
    severity: 'low',
    details: `Inline CSS/JS: ${pct}% of total page size.`,
    affectedElements: [],
    recommendation: pct >= 20 ? 'Move inline CSS and JavaScript to external files to improve content-to-code ratio.' : ''
  };
}

export function checkContentToCodeRatio(parsedData) {
  const ratio = parsedData.contentToCodeRatio;
  return {
    id: 'TA-07', category: CATEGORY, title: 'Content-to-code ratio',
    status: ratio > 25 ? 'pass' : ratio > 15 ? 'warn' : 'fail',
    severity: 'medium',
    details: `Content-to-code ratio: ${ratio}%.`,
    affectedElements: [],
    recommendation: ratio <= 25 ? 'Increase the ratio of visible content to HTML code. Remove unnecessary markup and inline assets.' : ''
  };
}

export function checkHiddenContent(parsedData) {
  const hiddenIndicators = [];

  // Check for accordion/tab patterns that hide content
  const html = parsedData.rawHtml || '';
  const hiddenPatterns = [
    { pattern: /display:\s*none/gi, label: 'display:none CSS rules' },
    { pattern: /visibility:\s*hidden/gi, label: 'visibility:hidden CSS rules' },
    { pattern: /aria-hidden="true"/gi, label: 'aria-hidden="true" elements' },
    { pattern: /class="[^"]*collapse[^"]*"/gi, label: 'collapsed/accordion elements' },
    { pattern: /<details[^>]*>/gi, label: '<details> elements (expandable sections)' },
  ];

  for (const { pattern, label } of hiddenPatterns) {
    const matches = html.match(pattern);
    if (matches && matches.length > 0) {
      hiddenIndicators.push(`${matches.length} instance(s) of ${label}`);
    }
  }

  const status = hiddenIndicators.length === 0 ? 'pass' : hiddenIndicators.length <= 2 ? 'warn' : 'fail';

  return {
    id: 'TA-08', category: CATEGORY, title: 'No content behind interactions',
    status,
    severity: 'high',
    details: hiddenIndicators.length === 0
      ? 'Content appears to be directly accessible in the HTML without requiring user interaction.'
      : `Found ${hiddenIndicators.length} pattern(s) that may hide content from AI crawlers.`,
    affectedElements: hiddenIndicators,
    recommendation: hiddenIndicators.length > 0
      ? 'Ensure important content is not hidden behind tabs, accordions, or CSS display:none. AI crawlers may not trigger JavaScript interactions.'
      : ''
  };
}

export function checkImageAltText(parsedData) {
  const images = parsedData.images;
  if (images.length === 0) {
    return {
      id: 'TA-09', category: CATEGORY, title: 'Image alt text coverage',
      status: 'na', severity: 'medium',
      details: 'No images found on the page.',
      affectedElements: [], recommendation: ''
    };
  }
  const withAlt = images.filter(img => img.hasAlt);
  const coverage = Math.round((withAlt.length / images.length) * 100);
  const missingAlt = images.filter(img => !img.hasAlt);

  return {
    id: 'TA-09', category: CATEGORY, title: 'Image alt text coverage',
    status: coverage > 90 ? 'pass' : coverage > 70 ? 'warn' : 'fail',
    severity: 'medium',
    details: `${coverage}% of images have alt text (${withAlt.length}/${images.length}).`,
    affectedElements: missingAlt.slice(0, 5).map(img => img.src || 'unknown source'),
    recommendation: coverage <= 90 ? 'Add descriptive alt text to all images for better AI understanding and accessibility.' : ''
  };
}

export function checkStructuredDataValid(parsedData) {
  const data = parsedData.structuredData;
  if (data.length === 0) {
    return {
      id: 'TA-10', category: CATEGORY, title: 'Structured data valid',
      status: 'na', severity: 'medium',
      details: 'No JSON-LD structured data found.',
      affectedElements: [], recommendation: 'Add JSON-LD structured data to help AI models understand your content.'
    };
  }
  const invalid = data.filter(d => !d.valid);
  return {
    id: 'TA-10', category: CATEGORY, title: 'Structured data valid',
    status: invalid.length === 0 ? 'pass' : 'fail',
    severity: 'medium',
    details: invalid.length === 0 ? `All ${data.length} JSON-LD block(s) parse successfully.` : `${invalid.length} of ${data.length} JSON-LD block(s) have parse errors.`,
    affectedElements: invalid.map(d => d.error || 'Parse error'),
    recommendation: invalid.length > 0 ? 'Fix JSON-LD syntax errors. Validate with Google Rich Results Test.' : ''
  };
}

export function checkAIOptOutSignals(parsedData) {
  const meta = parsedData.metadata;
  const signals = [];

  if (meta.aiDirectives && Object.keys(meta.aiDirectives).length > 0) {
    Object.entries(meta.aiDirectives).forEach(([key, value]) => {
      if (key !== 'robotsNoAI') {
        signals.push(`${key}: ${value}`);
      }
    });
  }
  if (meta.aiDirectives?.robotsNoAI) {
    signals.push('robots meta contains noai directive');
  }

  return {
    id: 'TA-10.5', category: CATEGORY, title: 'AI training opt-out signals',
    status: 'na', // Informational only, no score penalty
    severity: 'low',
    details: signals.length > 0 ? `Detected AI opt-out signals: ${signals.join('; ')}. ai.txt and TDM-Reservation require server-side checking.` : 'No AI opt-out signals detected in HTML. ai.txt and TDM-Reservation headers require server-side checking.',
    affectedElements: signals,
    recommendation: 'Review your ai.txt file and TDM-Reservation headers if you want to control AI training access.'
  };
}

export function runTechnicalAccessChecks(parsedData) {
  return [
    checkSSR(parsedData),
    checkRobotsDirectives(parsedData),
    checkRobotsTxt(parsedData),
    checkCanonicalUrl(parsedData),
    checkPageWeight(parsedData),
    checkInlineAssets(parsedData),
    checkContentToCodeRatio(parsedData),
    checkHiddenContent(parsedData),
    checkImageAltText(parsedData),
    checkStructuredDataValid(parsedData),
    checkAIOptOutSignals(parsedData)
  ];
}

export default runTechnicalAccessChecks;
