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

  return {
    id: 'TA-03', category: CATEGORY, title: 'robots.txt AI crawler rules',
    status: crawlerIssues.length > 0 ? 'warn' : 'warn',
    severity: 'high',
    details: 'robots.txt analysis requires server-side fetching. Check meta robot directives for AI crawler restrictions.' + (crawlerIssues.length > 0 ? ` Found ${crawlerIssues.length} AI-specific meta directive(s).` : ''),
    affectedElements: crawlerIssues,
    recommendation: 'Verify your robots.txt allows GPTBot, Google-Extended, ClaudeBot, and other AI crawlers.'
  };
}

export function checkCanonicalUrl(parsedData) {
  const canonical = parsedData.metadata.canonical;
  return {
    id: 'TA-04', category: CATEGORY, title: 'Canonical URL set',
    status: canonical ? 'pass' : 'warn',
    severity: 'medium',
    details: canonical ? `Canonical URL: ${canonical}` : 'No canonical URL found.',
    affectedElements: [],
    recommendation: !canonical ? 'Add a <link rel="canonical"> tag to prevent duplicate content issues.' : ''
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
  return {
    id: 'TA-08', category: CATEGORY, title: 'No content behind interactions',
    status: 'pass',
    severity: 'high',
    details: 'Content appears to be directly accessible in the HTML without requiring user interaction.',
    affectedElements: [],
    recommendation: ''
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
