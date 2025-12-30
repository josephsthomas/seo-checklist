/**
 * SEO Technical Audit Engine
 * Analyzes parsed Screaming Frog data and generates audit findings
 */

// Issue severity levels
export const SEVERITY = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Issue priority (MoSCoW)
export const PRIORITY = {
  MUST: 'must',
  SHOULD: 'should',
  COULD: 'could'
};

// Audit categories matching BRD
export const CATEGORIES = {
  INDEXABILITY: 'Indexability',
  PAGE_TITLES: 'Page Titles',
  META_DESCRIPTIONS: 'Meta Descriptions',
  HEADINGS_H1: 'Headings (H1)',
  HEADINGS_H2: 'Headings (H2)',
  RESPONSE_CODES: 'Response Codes',
  CANONICALIZATION: 'Canonicalization',
  DIRECTIVES: 'Directives',
  LINKS: 'Links',
  IMAGES: 'Images',
  CONTENT: 'Content',
  URL_STRUCTURE: 'URL Structure',
  CORE_WEB_VITALS: 'Core Web Vitals',
  STRUCTURED_DATA: 'Structured Data',
  HREFLANG: 'Hreflang',
  SITEMAPS: 'Sitemaps',
  SECURITY: 'Security',
  PERFORMANCE: 'Performance',
  MOBILE: 'Mobile Usability',
  REDIRECTS: 'Redirects',
  PAGINATION: 'Pagination',
  JAVASCRIPT: 'JavaScript Rendering',
  AMP: 'AMP',
  ANALYTICS: 'Analytics Integration',
  LINK_EQUITY: 'Link Equity',
  DUPLICATE_CONTENT: 'Duplicate Content',
  THIN_CONTENT: 'Thin Content',
  COOKIES: 'Cookies',
  FRESHNESS: 'Content Freshness',
  SUSTAINABILITY: 'Sustainability',
  THIRD_PARTY: 'Third-Party Resources'
};

/**
 * Run all audit checks on parsed data
 * @param {Object} parsedData - Data from excelParser
 * @param {Function} onProgress - Progress callback
 * @returns {Object} - Audit results
 */
export async function runAudit(parsedData, onProgress = () => {}) {
  const issues = [];
  const stats = {
    totalChecks: 0,
    passed: 0,
    errors: 0,
    warnings: 0,
    info: 0
  };

  if (!parsedData.internal?.rows) {
    return {
      success: false,
      error: 'No internal data available for audit',
      issues: [],
      stats
    };
  }

  const rows = parsedData.internal.rows;
  const totalRows = rows.length;

  onProgress(0, 'Starting audit...');

  // Run each category of checks
  const checks = [
    { name: 'Indexability', fn: checkIndexability, weight: 10 },
    { name: 'Page Titles', fn: checkPageTitles, weight: 10 },
    { name: 'Meta Descriptions', fn: checkMetaDescriptions, weight: 10 },
    { name: 'Headings', fn: checkHeadings, weight: 10 },
    { name: 'Response Codes', fn: checkResponseCodes, weight: 10 },
    { name: 'Canonicalization', fn: checkCanonicalization, weight: 8 },
    { name: 'Links', fn: checkLinks, weight: 8 },
    { name: 'Content', fn: checkContent, weight: 8 },
    { name: 'URL Structure', fn: checkUrlStructure, weight: 6 },
    { name: 'Core Web Vitals', fn: checkCoreWebVitals, weight: 10 },
    { name: 'Security', fn: checkSecurity, weight: 5 },
    { name: 'Mobile', fn: checkMobile, weight: 5 }
  ];

  let completedWeight = 0;
  const totalWeight = checks.reduce((sum, c) => sum + c.weight, 0);

  for (const check of checks) {
    onProgress(
      Math.round((completedWeight / totalWeight) * 100),
      `Checking ${check.name}...`
    );

    const checkIssues = check.fn(rows, parsedData);
    issues.push(...checkIssues);

    completedWeight += check.weight;
  }

  // Count issues by severity
  issues.forEach(issue => {
    stats.totalChecks++;
    if (issue.severity === SEVERITY.ERROR) stats.errors++;
    else if (issue.severity === SEVERITY.WARNING) stats.warnings++;
    else stats.info++;
  });

  // Calculate health score
  const healthScore = calculateHealthScore(issues, totalRows);

  onProgress(100, 'Audit complete');

  return {
    success: true,
    issues,
    stats,
    healthScore,
    urlCount: totalRows,
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculate health score based on issues
 * @param {Array} issues - All issues found
 * @param {number} totalUrls - Total URLs analyzed
 * @returns {number} - Health score 0-100
 */
function calculateHealthScore(issues, totalUrls) {
  if (totalUrls === 0) return 0;

  // Weight penalties based on severity and priority
  const penalties = {
    [SEVERITY.ERROR]: { [PRIORITY.MUST]: 2.0, [PRIORITY.SHOULD]: 1.5, [PRIORITY.COULD]: 1.0 },
    [SEVERITY.WARNING]: { [PRIORITY.MUST]: 1.0, [PRIORITY.SHOULD]: 0.5, [PRIORITY.COULD]: 0.25 },
    [SEVERITY.INFO]: { [PRIORITY.MUST]: 0.1, [PRIORITY.SHOULD]: 0.05, [PRIORITY.COULD]: 0.01 }
  };

  let totalPenalty = 0;
  const maxPenalty = 100;

  issues.forEach(issue => {
    const severityPenalties = penalties[issue.severity] || penalties[SEVERITY.INFO];
    const penalty = severityPenalties[issue.priority] || 0.1;

    // Scale penalty by affected URL count relative to total
    const affectedRatio = (issue.affectedUrls?.length || 1) / totalUrls;
    totalPenalty += penalty * Math.min(affectedRatio * 100, 10); // Cap per-issue penalty
  });

  // Cap total penalty
  totalPenalty = Math.min(totalPenalty, maxPenalty);

  return Math.max(0, Math.round(100 - totalPenalty));
}

// ============================================
// AUDIT CHECK FUNCTIONS
// ============================================

function checkIndexability(rows) {
  const issues = [];
  const nonIndexable = rows.filter(r => r.indexability?.toLowerCase() !== 'indexable');
  const blocked = rows.filter(r => r.indexabilityStatus?.toLowerCase().includes('blocked'));
  const noindex = rows.filter(r =>
    r.metaRobots1?.toLowerCase().includes('noindex') ||
    r.xRobotsTag1?.toLowerCase().includes('noindex')
  );

  if (nonIndexable.length > 0) {
    issues.push({
      id: 'indexability-non-indexable',
      category: CATEGORIES.INDEXABILITY,
      title: 'Non-Indexable Pages',
      description: `${nonIndexable.length} pages are not indexable and won't appear in search results.`,
      severity: nonIndexable.length > rows.length * 0.3 ? SEVERITY.ERROR : SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: nonIndexable.slice(0, 100).map(r => r.address),
      count: nonIndexable.length,
      recommendation: 'Review non-indexable pages. If they should be indexed, remove noindex directives or unblock them.'
    });
  }

  if (blocked.length > 0) {
    issues.push({
      id: 'indexability-blocked',
      category: CATEGORIES.INDEXABILITY,
      title: 'Blocked by Robots.txt',
      description: `${blocked.length} pages are blocked by robots.txt.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: blocked.slice(0, 100).map(r => r.address),
      count: blocked.length,
      recommendation: 'If these pages should be crawlable, update robots.txt to allow access.'
    });
  }

  return issues;
}

function checkPageTitles(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');

  // Missing titles
  const missingTitle = indexableRows.filter(r => !r.title1 || r.title1.trim() === '');
  if (missingTitle.length > 0) {
    issues.push({
      id: 'title-missing',
      category: CATEGORIES.PAGE_TITLES,
      title: 'Missing Page Titles',
      description: `${missingTitle.length} indexable pages are missing title tags.`,
      severity: SEVERITY.ERROR,
      priority: PRIORITY.MUST,
      affectedUrls: missingTitle.slice(0, 100).map(r => r.address),
      count: missingTitle.length,
      recommendation: 'Add unique, descriptive title tags to all pages. Titles should be 50-60 characters.'
    });
  }

  // Too long (>60 chars)
  const tooLong = indexableRows.filter(r => parseInt(r.title1Length, 10) > 60);
  if (tooLong.length > 0) {
    issues.push({
      id: 'title-too-long',
      category: CATEGORIES.PAGE_TITLES,
      title: 'Page Titles Too Long',
      description: `${tooLong.length} pages have titles longer than 60 characters.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: tooLong.slice(0, 100).map(r => r.address),
      count: tooLong.length,
      recommendation: 'Shorten titles to under 60 characters to prevent truncation in search results.'
    });
  }

  // Too short (<30 chars)
  const tooShort = indexableRows.filter(r => {
    const len = parseInt(r.title1Length, 10);
    return len > 0 && len < 30;
  });
  if (tooShort.length > 0) {
    issues.push({
      id: 'title-too-short',
      category: CATEGORIES.PAGE_TITLES,
      title: 'Page Titles Too Short',
      description: `${tooShort.length} pages have titles shorter than 30 characters.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.COULD,
      affectedUrls: tooShort.slice(0, 100).map(r => r.address),
      count: tooShort.length,
      recommendation: 'Consider expanding short titles to be more descriptive and keyword-rich.'
    });
  }

  // Duplicate titles
  const titleCounts = {};
  indexableRows.forEach(r => {
    if (r.title1) {
      const title = r.title1.toLowerCase().trim();
      if (!titleCounts[title]) titleCounts[title] = [];
      titleCounts[title].push(r.address);
    }
  });

  const duplicates = Object.entries(titleCounts)
    .filter(([_, urls]) => urls.length > 1)
    .flatMap(([_, urls]) => urls);

  if (duplicates.length > 0) {
    issues.push({
      id: 'title-duplicate',
      category: CATEGORIES.PAGE_TITLES,
      title: 'Duplicate Page Titles',
      description: `${duplicates.length} pages share duplicate titles with other pages.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: duplicates.slice(0, 100),
      count: duplicates.length,
      recommendation: 'Create unique titles for each page to help users and search engines distinguish content.'
    });
  }

  return issues;
}

function checkMetaDescriptions(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');

  // Missing meta descriptions
  const missing = indexableRows.filter(r => !r.metaDescription1 || r.metaDescription1.trim() === '');
  if (missing.length > 0) {
    issues.push({
      id: 'meta-description-missing',
      category: CATEGORIES.META_DESCRIPTIONS,
      title: 'Missing Meta Descriptions',
      description: `${missing.length} indexable pages are missing meta descriptions.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: missing.slice(0, 100).map(r => r.address),
      count: missing.length,
      recommendation: 'Add compelling meta descriptions (150-160 characters) to improve click-through rates.'
    });
  }

  // Too long (>160 chars)
  const tooLong = indexableRows.filter(r => parseInt(r.metaDescription1Length, 10) > 160);
  if (tooLong.length > 0) {
    issues.push({
      id: 'meta-description-too-long',
      category: CATEGORIES.META_DESCRIPTIONS,
      title: 'Meta Descriptions Too Long',
      description: `${tooLong.length} pages have meta descriptions longer than 160 characters.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: tooLong.slice(0, 100).map(r => r.address),
      count: tooLong.length,
      recommendation: 'Shorten meta descriptions to under 160 characters to prevent truncation.'
    });
  }

  return issues;
}

function checkHeadings(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');

  // Missing H1
  const missingH1 = indexableRows.filter(r => !r.h1 || r.h1.trim() === '');
  if (missingH1.length > 0) {
    issues.push({
      id: 'h1-missing',
      category: CATEGORIES.HEADINGS_H1,
      title: 'Missing H1 Headings',
      description: `${missingH1.length} indexable pages are missing H1 headings.`,
      severity: SEVERITY.ERROR,
      priority: PRIORITY.MUST,
      affectedUrls: missingH1.slice(0, 100).map(r => r.address),
      count: missingH1.length,
      recommendation: 'Add a single, descriptive H1 heading to each page.'
    });
  }

  // Multiple H1s
  const multipleH1 = indexableRows.filter(r => parseInt(r.h1Count, 10) > 1);
  if (multipleH1.length > 0) {
    issues.push({
      id: 'h1-multiple',
      category: CATEGORIES.HEADINGS_H1,
      title: 'Multiple H1 Headings',
      description: `${multipleH1.length} pages have more than one H1 heading.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: multipleH1.slice(0, 100).map(r => r.address),
      count: multipleH1.length,
      recommendation: 'Use only one H1 per page. Use H2-H6 for subheadings.'
    });
  }

  return issues;
}

function checkResponseCodes(rows) {
  const issues = [];

  // 4xx errors
  const clientErrors = rows.filter(r => {
    const status = parseInt(r.statusCode, 10);
    return status >= 400 && status < 500;
  });

  if (clientErrors.length > 0) {
    issues.push({
      id: 'response-4xx',
      category: CATEGORIES.RESPONSE_CODES,
      title: 'Client Errors (4xx)',
      description: `${clientErrors.length} URLs return 4xx client error status codes.`,
      severity: SEVERITY.ERROR,
      priority: PRIORITY.MUST,
      affectedUrls: clientErrors.slice(0, 100).map(r => r.address),
      count: clientErrors.length,
      recommendation: 'Fix or remove broken pages. Update internal links pointing to these URLs.'
    });
  }

  // 5xx errors
  const serverErrors = rows.filter(r => {
    const status = parseInt(r.statusCode, 10);
    return status >= 500;
  });

  if (serverErrors.length > 0) {
    issues.push({
      id: 'response-5xx',
      category: CATEGORIES.RESPONSE_CODES,
      title: 'Server Errors (5xx)',
      description: `${serverErrors.length} URLs return 5xx server error status codes.`,
      severity: SEVERITY.ERROR,
      priority: PRIORITY.MUST,
      affectedUrls: serverErrors.slice(0, 100).map(r => r.address),
      count: serverErrors.length,
      recommendation: 'Investigate server errors immediately. These prevent pages from being crawled.'
    });
  }

  // 3xx redirects
  const redirects = rows.filter(r => {
    const status = parseInt(r.statusCode, 10);
    return status >= 300 && status < 400;
  });

  if (redirects.length > 0) {
    issues.push({
      id: 'response-3xx',
      category: CATEGORIES.RESPONSE_CODES,
      title: 'Redirects (3xx)',
      description: `${redirects.length} URLs are redirects.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: redirects.slice(0, 100).map(r => r.address),
      count: redirects.length,
      recommendation: 'Review redirects. Update internal links to point directly to final destinations.'
    });
  }

  return issues;
}

function checkCanonicalization(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');

  // Missing canonical
  const missingCanonical = indexableRows.filter(r =>
    !r.canonicalLinkElement1 || r.canonicalLinkElement1.trim() === ''
  );

  if (missingCanonical.length > 0) {
    issues.push({
      id: 'canonical-missing',
      category: CATEGORIES.CANONICALIZATION,
      title: 'Missing Canonical Tags',
      description: `${missingCanonical.length} indexable pages are missing canonical tags.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: missingCanonical.slice(0, 100).map(r => r.address),
      count: missingCanonical.length,
      recommendation: 'Add self-referencing canonical tags to all indexable pages.'
    });
  }

  return issues;
}

function checkLinks(rows) {
  const issues = [];

  // Orphan pages (no inlinks)
  const orphans = rows.filter(r =>
    r.indexability?.toLowerCase() === 'indexable' &&
    parseInt(r.uniqueInlinks, 10) === 0
  );

  if (orphans.length > 0) {
    issues.push({
      id: 'links-orphan',
      category: CATEGORIES.LINKS,
      title: 'Orphan Pages',
      description: `${orphans.length} indexable pages have no internal links pointing to them.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: orphans.slice(0, 100).map(r => r.address),
      count: orphans.length,
      recommendation: 'Add internal links to orphan pages from relevant content.'
    });
  }

  // Deep pages (crawl depth > 3)
  const deepPages = rows.filter(r =>
    r.indexability?.toLowerCase() === 'indexable' &&
    parseInt(r.crawlDepth, 10) > 3
  );

  if (deepPages.length > 0) {
    issues.push({
      id: 'links-deep',
      category: CATEGORIES.LINK_EQUITY,
      title: 'Deep Pages',
      description: `${deepPages.length} important pages are more than 3 clicks from homepage.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: deepPages.slice(0, 100).map(r => r.address),
      count: deepPages.length,
      recommendation: 'Improve internal linking to reduce crawl depth for important pages.'
    });
  }

  return issues;
}

function checkContent(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');

  // Thin content (< 300 words)
  const thinContent = indexableRows.filter(r => {
    const wordCount = parseInt(r.wordCount, 10);
    return wordCount > 0 && wordCount < 300;
  });

  if (thinContent.length > 0) {
    issues.push({
      id: 'content-thin',
      category: CATEGORIES.THIN_CONTENT,
      title: 'Thin Content',
      description: `${thinContent.length} pages have fewer than 300 words.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: thinContent.slice(0, 100).map(r => r.address),
      count: thinContent.length,
      recommendation: 'Expand thin content pages or consider consolidating them.'
    });
  }

  // Low text ratio
  const lowTextRatio = indexableRows.filter(r => {
    const ratio = parseFloat(r.textRatio);
    return ratio > 0 && ratio < 10;
  });

  if (lowTextRatio.length > 0) {
    issues.push({
      id: 'content-low-text-ratio',
      category: CATEGORIES.CONTENT,
      title: 'Low Text Ratio',
      description: `${lowTextRatio.length} pages have a text-to-HTML ratio below 10%.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: lowTextRatio.slice(0, 100).map(r => r.address),
      count: lowTextRatio.length,
      recommendation: 'Consider adding more textual content to improve content-to-code ratio.'
    });
  }

  return issues;
}

function checkUrlStructure(rows) {
  const issues = [];

  // URLs with uppercase
  const uppercaseUrls = rows.filter(r => r.address && r.address !== r.address.toLowerCase());

  if (uppercaseUrls.length > 0) {
    issues.push({
      id: 'url-uppercase',
      category: CATEGORIES.URL_STRUCTURE,
      title: 'URLs with Uppercase Characters',
      description: `${uppercaseUrls.length} URLs contain uppercase characters.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: uppercaseUrls.slice(0, 100).map(r => r.address),
      count: uppercaseUrls.length,
      recommendation: 'Use lowercase URLs consistently and redirect uppercase versions.'
    });
  }

  // Very long URLs (> 115 chars)
  const longUrls = rows.filter(r => r.address && r.address.length > 115);

  if (longUrls.length > 0) {
    issues.push({
      id: 'url-too-long',
      category: CATEGORIES.URL_STRUCTURE,
      title: 'Long URLs',
      description: `${longUrls.length} URLs are longer than 115 characters.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: longUrls.slice(0, 100).map(r => r.address),
      count: longUrls.length,
      recommendation: 'Consider shortening URLs while keeping them descriptive.'
    });
  }

  return issues;
}

function checkCoreWebVitals(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');

  // Poor LCP (> 4000ms)
  const poorLcp = indexableRows.filter(r => {
    const lcp = parseFloat(r.lcp);
    return lcp > 4000;
  });

  if (poorLcp.length > 0) {
    issues.push({
      id: 'cwv-poor-lcp',
      category: CATEGORIES.CORE_WEB_VITALS,
      title: 'Poor Largest Contentful Paint',
      description: `${poorLcp.length} pages have LCP > 4 seconds (poor).`,
      severity: SEVERITY.ERROR,
      priority: PRIORITY.MUST,
      affectedUrls: poorLcp.slice(0, 100).map(r => r.address),
      count: poorLcp.length,
      recommendation: 'Optimize images, reduce server response time, and eliminate render-blocking resources.'
    });
  }

  // Poor CLS (> 0.25)
  const poorCls = indexableRows.filter(r => {
    const cls = parseFloat(r.cls);
    return cls > 0.25;
  });

  if (poorCls.length > 0) {
    issues.push({
      id: 'cwv-poor-cls',
      category: CATEGORIES.CORE_WEB_VITALS,
      title: 'Poor Cumulative Layout Shift',
      description: `${poorCls.length} pages have CLS > 0.25 (poor).`,
      severity: SEVERITY.ERROR,
      priority: PRIORITY.MUST,
      affectedUrls: poorCls.slice(0, 100).map(r => r.address),
      count: poorCls.length,
      recommendation: 'Reserve space for images/ads, avoid inserting content above existing content.'
    });
  }

  // Poor TBT (> 600ms)
  const poorTbt = indexableRows.filter(r => {
    const tbt = parseFloat(r.tbt);
    return tbt > 600;
  });

  if (poorTbt.length > 0) {
    issues.push({
      id: 'cwv-poor-tbt',
      category: CATEGORIES.CORE_WEB_VITALS,
      title: 'Poor Total Blocking Time',
      description: `${poorTbt.length} pages have TBT > 600ms (poor interactivity).`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: poorTbt.slice(0, 100).map(r => r.address),
      count: poorTbt.length,
      recommendation: 'Reduce JavaScript execution time, split long tasks, remove unused code.'
    });
  }

  return issues;
}

function checkSecurity(rows) {
  const issues = [];

  // HTTP pages (not HTTPS)
  const httpPages = rows.filter(r =>
    r.address && r.address.toLowerCase().startsWith('http://')
  );

  if (httpPages.length > 0) {
    issues.push({
      id: 'security-http',
      category: CATEGORIES.SECURITY,
      title: 'Insecure HTTP Pages',
      description: `${httpPages.length} pages are served over insecure HTTP.`,
      severity: SEVERITY.ERROR,
      priority: PRIORITY.MUST,
      affectedUrls: httpPages.slice(0, 100).map(r => r.address),
      count: httpPages.length,
      recommendation: 'Migrate all pages to HTTPS and implement proper redirects.'
    });
  }

  return issues;
}

function checkMobile(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');

  // Missing viewport
  const missingViewport = indexableRows.filter(r =>
    !r.viewport || r.viewport.trim() === ''
  );

  if (missingViewport.length > 0) {
    issues.push({
      id: 'mobile-viewport-missing',
      category: CATEGORIES.MOBILE,
      title: 'Missing Viewport Meta Tag',
      description: `${missingViewport.length} pages are missing viewport meta tag.`,
      severity: SEVERITY.ERROR,
      priority: PRIORITY.MUST,
      affectedUrls: missingViewport.slice(0, 100).map(r => r.address),
      count: missingViewport.length,
      recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to all pages.'
    });
  }

  return issues;
}

export default {
  runAudit,
  calculateHealthScore,
  SEVERITY,
  PRIORITY,
  CATEGORIES
};
