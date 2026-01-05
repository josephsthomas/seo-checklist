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
    { name: 'Mobile', fn: checkMobile, weight: 5 },
    { name: 'Images', fn: checkImages, weight: 6 },
    { name: 'Redirects', fn: checkRedirects, weight: 6 },
    { name: 'Directives', fn: checkDirectives, weight: 5 },
    { name: 'Duplicate Content', fn: checkDuplicateContent, weight: 7 },
    { name: 'Performance', fn: checkPerformance, weight: 6 },
    { name: 'Hreflang', fn: checkHreflang, weight: 4 },
    { name: 'Pagination', fn: checkPagination, weight: 3 },
    { name: 'Structured Data', fn: checkStructuredData, weight: 5 },
    { name: 'Cookies', fn: checkCookies, weight: 3 },
    { name: 'Third Party', fn: checkThirdParty, weight: 4 },
    { name: 'Freshness', fn: checkFreshness, weight: 3 },
    { name: 'Sustainability', fn: checkSustainability, weight: 2 }
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
    const priorityKey = issue.priority || PRIORITY.COULD;
    const penalty = severityPenalties[priorityKey] || 0.1;

    // Scale penalty by affected URL count relative to total
    const affectedCount = Array.isArray(issue.affectedUrls) ? issue.affectedUrls.length : (issue.count || 1);
    const affectedRatio = affectedCount / totalUrls;
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

function checkImages(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');

  // Missing alt text
  const missingAlt = indexableRows.filter(r => {
    const missing = parseInt(r.imagesWithMissingAltText, 10);
    return missing > 0;
  });

  if (missingAlt.length > 0) {
    issues.push({
      id: 'images-missing-alt',
      category: CATEGORIES.IMAGES,
      title: 'Images Missing Alt Text',
      description: `${missingAlt.length} pages contain images without alt attributes.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: missingAlt.slice(0, 100).map(r => r.address),
      count: missingAlt.length,
      recommendation: 'Add descriptive alt text to all images for accessibility and SEO.'
    });
  }

  // Oversized images (> 100KB)
  const oversizedImages = indexableRows.filter(r => {
    const size = parseInt(r.imageSize, 10);
    return size > 100000;
  });

  if (oversizedImages.length > 0) {
    issues.push({
      id: 'images-oversized',
      category: CATEGORIES.IMAGES,
      title: 'Oversized Images',
      description: `${oversizedImages.length} pages contain images larger than 100KB.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: oversizedImages.slice(0, 100).map(r => r.address),
      count: oversizedImages.length,
      recommendation: 'Compress and optimize images. Use modern formats like WebP or AVIF.'
    });
  }

  // Missing image dimensions
  const missingDimensions = indexableRows.filter(r => {
    const missing = parseInt(r.imagesWithMissingDimensions, 10);
    return missing > 0;
  });

  if (missingDimensions.length > 0) {
    issues.push({
      id: 'images-missing-dimensions',
      category: CATEGORIES.IMAGES,
      title: 'Images Missing Dimensions',
      description: `${missingDimensions.length} pages have images without width/height attributes.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: missingDimensions.slice(0, 100).map(r => r.address),
      count: missingDimensions.length,
      recommendation: 'Add width and height attributes to images to prevent layout shifts.'
    });
  }

  return issues;
}

function checkRedirects(rows) {
  const issues = [];

  // Redirect chains (multiple redirects)
  const redirectChains = rows.filter(r => {
    const chainLength = parseInt(r.redirectChainLength, 10);
    return chainLength > 1;
  });

  if (redirectChains.length > 0) {
    issues.push({
      id: 'redirects-chains',
      category: CATEGORIES.REDIRECTS,
      title: 'Redirect Chains',
      description: `${redirectChains.length} URLs have redirect chains (multiple redirects).`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: redirectChains.slice(0, 100).map(r => r.address),
      count: redirectChains.length,
      recommendation: 'Eliminate redirect chains by pointing directly to final destination.'
    });
  }

  // Redirect loops
  const redirectLoops = rows.filter(r =>
    r.redirectType?.toLowerCase().includes('loop')
  );

  if (redirectLoops.length > 0) {
    issues.push({
      id: 'redirects-loops',
      category: CATEGORIES.REDIRECTS,
      title: 'Redirect Loops',
      description: `${redirectLoops.length} URLs are caught in redirect loops.`,
      severity: SEVERITY.ERROR,
      priority: PRIORITY.MUST,
      affectedUrls: redirectLoops.slice(0, 100).map(r => r.address),
      count: redirectLoops.length,
      recommendation: 'Fix redirect loops immediately - these pages are inaccessible.'
    });
  }

  // 302 temporary redirects that should be 301
  const temporaryRedirects = rows.filter(r => {
    const status = parseInt(r.statusCode, 10);
    return status === 302 || status === 307;
  });

  if (temporaryRedirects.length > 0) {
    issues.push({
      id: 'redirects-temporary',
      category: CATEGORIES.REDIRECTS,
      title: 'Temporary Redirects',
      description: `${temporaryRedirects.length} URLs use temporary (302/307) redirects.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: temporaryRedirects.slice(0, 100).map(r => r.address),
      count: temporaryRedirects.length,
      recommendation: 'Consider using 301 permanent redirects if these are permanent moves.'
    });
  }

  return issues;
}

function checkDirectives(rows) {
  const issues = [];

  // Conflicting directives (noindex in robots.txt but page is indexable)
  const conflictingDirectives = rows.filter(r =>
    r.indexability?.toLowerCase() === 'indexable' &&
    (r.robotsTxtStatus?.toLowerCase().includes('blocked') ||
     r.xRobotsTag1?.toLowerCase().includes('noindex'))
  );

  if (conflictingDirectives.length > 0) {
    issues.push({
      id: 'directives-conflicting',
      category: CATEGORIES.DIRECTIVES,
      title: 'Conflicting Directives',
      description: `${conflictingDirectives.length} pages have conflicting indexing directives.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: conflictingDirectives.slice(0, 100).map(r => r.address),
      count: conflictingDirectives.length,
      recommendation: 'Ensure robots.txt, meta robots, and X-Robots-Tag are aligned.'
    });
  }

  // Nofollow on internal links
  const nofollowInternal = rows.filter(r =>
    r.metaRobots1?.toLowerCase().includes('nofollow') &&
    r.indexability?.toLowerCase() === 'indexable'
  );

  if (nofollowInternal.length > 0) {
    issues.push({
      id: 'directives-nofollow',
      category: CATEGORIES.DIRECTIVES,
      title: 'Nofollow on Indexable Pages',
      description: `${nofollowInternal.length} indexable pages have nofollow directives.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: nofollowInternal.slice(0, 100).map(r => r.address),
      count: nofollowInternal.length,
      recommendation: 'Review nofollow usage - internal pages typically should pass link equity.'
    });
  }

  return issues;
}

function checkDuplicateContent(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');

  // Near duplicate pages (by content hash if available)
  const contentHashes = {};
  indexableRows.forEach(r => {
    if (r.contentHash || r.hashValue) {
      const hash = r.contentHash || r.hashValue;
      if (!contentHashes[hash]) contentHashes[hash] = [];
      contentHashes[hash].push(r.address);
    }
  });

  const duplicateContent = Object.entries(contentHashes)
    .filter(([_, urls]) => urls.length > 1)
    .flatMap(([_, urls]) => urls);

  if (duplicateContent.length > 0) {
    issues.push({
      id: 'duplicate-content',
      category: CATEGORIES.DUPLICATE_CONTENT,
      title: 'Duplicate Content',
      description: `${duplicateContent.length} pages have identical or near-identical content.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: duplicateContent.slice(0, 100),
      count: duplicateContent.length,
      recommendation: 'Consolidate duplicate pages or use canonical tags to indicate preferred version.'
    });
  }

  // Duplicate URLs (parameters, trailing slashes)
  const normalizedUrls = {};
  rows.forEach(r => {
    if (r.address) {
      const normalized = r.address.toLowerCase().replace(/\/$/, '').split('?')[0];
      if (!normalizedUrls[normalized]) normalizedUrls[normalized] = [];
      normalizedUrls[normalized].push(r.address);
    }
  });

  const duplicateUrls = Object.entries(normalizedUrls)
    .filter(([_, urls]) => urls.length > 1)
    .flatMap(([_, urls]) => urls);

  if (duplicateUrls.length > 0) {
    issues.push({
      id: 'duplicate-urls',
      category: CATEGORIES.DUPLICATE_CONTENT,
      title: 'Duplicate URL Variations',
      description: `${duplicateUrls.length} URLs have duplicate variations (parameters, trailing slashes).`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: duplicateUrls.slice(0, 100),
      count: duplicateUrls.length,
      recommendation: 'Implement consistent URL structure and use canonical tags.'
    });
  }

  return issues;
}

function checkPerformance(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');

  // Slow response time (> 1000ms)
  const slowPages = indexableRows.filter(r => {
    const responseTime = parseFloat(r.responseTime);
    return responseTime > 1000;
  });

  if (slowPages.length > 0) {
    issues.push({
      id: 'performance-slow-response',
      category: CATEGORIES.PERFORMANCE,
      title: 'Slow Server Response',
      description: `${slowPages.length} pages have server response time > 1 second.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: slowPages.slice(0, 100).map(r => r.address),
      count: slowPages.length,
      recommendation: 'Optimize server configuration, enable caching, reduce database queries.'
    });
  }

  // Large page size (> 3MB)
  const largePages = indexableRows.filter(r => {
    const size = parseInt(r.size, 10);
    return size > 3000000;
  });

  if (largePages.length > 0) {
    issues.push({
      id: 'performance-large-pages',
      category: CATEGORIES.PERFORMANCE,
      title: 'Large Page Size',
      description: `${largePages.length} pages are larger than 3MB.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: largePages.slice(0, 100).map(r => r.address),
      count: largePages.length,
      recommendation: 'Reduce page size by optimizing images, minifying CSS/JS, removing unused code.'
    });
  }

  // High request count (> 100 requests)
  const highRequestPages = indexableRows.filter(r => {
    const requests = parseInt(r.requestCount, 10);
    return requests > 100;
  });

  if (highRequestPages.length > 0) {
    issues.push({
      id: 'performance-high-requests',
      category: CATEGORIES.PERFORMANCE,
      title: 'High Request Count',
      description: `${highRequestPages.length} pages make more than 100 HTTP requests.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: highRequestPages.slice(0, 100).map(r => r.address),
      count: highRequestPages.length,
      recommendation: 'Reduce HTTP requests by combining files, using sprites, or lazy loading.'
    });
  }

  return issues;
}

function checkHreflang(rows) {
  const issues = [];

  // Missing return links in hreflang
  const missingReturnLinks = rows.filter(r =>
    r.hreflangStatus?.toLowerCase().includes('missing return')
  );

  if (missingReturnLinks.length > 0) {
    issues.push({
      id: 'hreflang-missing-return',
      category: CATEGORIES.HREFLANG,
      title: 'Hreflang Missing Return Links',
      description: `${missingReturnLinks.length} pages have hreflang without reciprocal return links.`,
      severity: SEVERITY.ERROR,
      priority: PRIORITY.MUST,
      affectedUrls: missingReturnLinks.slice(0, 100).map(r => r.address),
      count: missingReturnLinks.length,
      recommendation: 'Ensure all hreflang annotations have matching return links on target pages.'
    });
  }

  // Invalid hreflang language codes
  const invalidHreflang = rows.filter(r =>
    r.hreflangStatus?.toLowerCase().includes('invalid')
  );

  if (invalidHreflang.length > 0) {
    issues.push({
      id: 'hreflang-invalid',
      category: CATEGORIES.HREFLANG,
      title: 'Invalid Hreflang Codes',
      description: `${invalidHreflang.length} pages have invalid hreflang language/region codes.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: invalidHreflang.slice(0, 100).map(r => r.address),
      count: invalidHreflang.length,
      recommendation: 'Use valid ISO 639-1 language codes and ISO 3166-1 Alpha 2 country codes.'
    });
  }

  // Missing x-default
  const hasHreflang = rows.filter(r => r.hreflang1 && r.hreflang1.trim() !== '');
  const missingXDefault = hasHreflang.filter(r =>
    !r.hreflangXDefault || r.hreflangXDefault.trim() === ''
  );

  if (missingXDefault.length > 0 && hasHreflang.length > 0) {
    issues.push({
      id: 'hreflang-missing-xdefault',
      category: CATEGORIES.HREFLANG,
      title: 'Missing Hreflang X-Default',
      description: `${missingXDefault.length} pages with hreflang are missing x-default.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: missingXDefault.slice(0, 100).map(r => r.address),
      count: missingXDefault.length,
      recommendation: 'Add x-default hreflang to specify the default/fallback page.'
    });
  }

  return issues;
}

function checkPagination(rows) {
  const issues = [];

  // Missing rel=prev/next (for paginated sequences)
  const paginatedPages = rows.filter(r =>
    r.address?.includes('/page/') ||
    r.address?.includes('?page=') ||
    r.address?.includes('&page=')
  );

  const missingPagination = paginatedPages.filter(r =>
    !r.relNext && !r.relPrev
  );

  if (missingPagination.length > 0) {
    issues.push({
      id: 'pagination-missing-rel',
      category: CATEGORIES.PAGINATION,
      title: 'Missing Pagination Markup',
      description: `${missingPagination.length} paginated pages lack rel=prev/next links.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: missingPagination.slice(0, 100).map(r => r.address),
      count: missingPagination.length,
      recommendation: 'Consider using rel=prev/next or view-all pages for better crawling.'
    });
  }

  // Non-indexable pagination pages
  const nonIndexablePagination = paginatedPages.filter(r =>
    r.indexability?.toLowerCase() !== 'indexable'
  );

  if (nonIndexablePagination.length > paginatedPages.length * 0.5 && paginatedPages.length > 5) {
    issues.push({
      id: 'pagination-noindex',
      category: CATEGORIES.PAGINATION,
      title: 'Paginated Pages Not Indexable',
      description: `${nonIndexablePagination.length} of ${paginatedPages.length} paginated pages are not indexable.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: nonIndexablePagination.slice(0, 100).map(r => r.address),
      count: nonIndexablePagination.length,
      recommendation: 'Review if paginated pages should be indexed - some strategies recommend indexing all.'
    });
  }

  return issues;
}

function checkStructuredData(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');

  // Missing structured data
  const missingSchema = indexableRows.filter(r =>
    !r.structuredDataTypes && !r.schemaTypes
  );

  if (missingSchema.length > indexableRows.length * 0.5) {
    issues.push({
      id: 'structured-data-missing',
      category: CATEGORIES.STRUCTURED_DATA,
      title: 'Missing Structured Data',
      description: `${missingSchema.length} indexable pages have no structured data.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: missingSchema.slice(0, 100).map(r => r.address),
      count: missingSchema.length,
      recommendation: 'Add relevant Schema.org markup to enhance search result appearance.'
    });
  }

  // Structured data validation errors
  const schemaErrors = indexableRows.filter(r =>
    r.structuredDataErrors?.toLowerCase().includes('error') ||
    r.schemaValidation?.toLowerCase().includes('error')
  );

  if (schemaErrors.length > 0) {
    issues.push({
      id: 'structured-data-errors',
      category: CATEGORIES.STRUCTURED_DATA,
      title: 'Structured Data Errors',
      description: `${schemaErrors.length} pages have structured data validation errors.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: schemaErrors.slice(0, 100).map(r => r.address),
      count: schemaErrors.length,
      recommendation: 'Fix structured data errors using Google Rich Results Test.'
    });
  }

  return issues;
}

function checkCookies(rows) {
  const issues = [];

  // Large cookies (> 4KB total)
  const largeCookies = rows.filter(r => {
    const cookieSize = parseInt(r.cookieSize, 10);
    return cookieSize > 4096;
  });

  if (largeCookies.length > 0) {
    issues.push({
      id: 'cookies-large',
      category: CATEGORIES.COOKIES,
      title: 'Large Cookie Size',
      description: `${largeCookies.length} pages have cookies exceeding 4KB.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: largeCookies.slice(0, 100).map(r => r.address),
      count: largeCookies.length,
      recommendation: 'Reduce cookie size to improve page load performance.'
    });
  }

  // Cookies without secure flag
  const insecureCookies = rows.filter(r =>
    r.cookieSecure?.toLowerCase() === 'false' ||
    r.insecureCookies > 0
  );

  if (insecureCookies.length > 0) {
    issues.push({
      id: 'cookies-insecure',
      category: CATEGORIES.COOKIES,
      title: 'Insecure Cookies',
      description: `${insecureCookies.length} pages set cookies without Secure flag.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: insecureCookies.slice(0, 100).map(r => r.address),
      count: insecureCookies.length,
      recommendation: 'Set Secure flag on all cookies to prevent transmission over HTTP.'
    });
  }

  return issues;
}

function checkThirdParty(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');

  // High third-party request count
  const highThirdParty = indexableRows.filter(r => {
    const thirdPartyRequests = parseInt(r.thirdPartyRequests, 10);
    return thirdPartyRequests > 30;
  });

  if (highThirdParty.length > 0) {
    issues.push({
      id: 'third-party-high',
      category: CATEGORIES.THIRD_PARTY,
      title: 'Excessive Third-Party Requests',
      description: `${highThirdParty.length} pages make more than 30 third-party requests.`,
      severity: SEVERITY.WARNING,
      priority: PRIORITY.SHOULD,
      affectedUrls: highThirdParty.slice(0, 100).map(r => r.address),
      count: highThirdParty.length,
      recommendation: 'Reduce third-party scripts to improve performance and privacy.'
    });
  }

  // Render-blocking third-party resources
  const renderBlocking = indexableRows.filter(r =>
    r.renderBlockingResources?.includes('third-party') ||
    parseInt(r.renderBlockingThirdParty, 10) > 0
  );

  if (renderBlocking.length > 0) {
    issues.push({
      id: 'third-party-render-blocking',
      category: CATEGORIES.THIRD_PARTY,
      title: 'Render-Blocking Third-Party Resources',
      description: `${renderBlocking.length} pages have render-blocking third-party resources.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: renderBlocking.slice(0, 100).map(r => r.address),
      count: renderBlocking.length,
      recommendation: 'Defer or async load third-party scripts to improve initial render.'
    });
  }

  return issues;
}

function checkFreshness(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');
  const now = new Date();

  // Stale content (last modified > 1 year ago)
  const staleContent = indexableRows.filter(r => {
    if (!r.lastModified) return false;
    const lastModified = new Date(r.lastModified);
    const daysSinceModified = (now - lastModified) / (1000 * 60 * 60 * 24);
    return daysSinceModified > 365;
  });

  if (staleContent.length > 0) {
    issues.push({
      id: 'freshness-stale',
      category: CATEGORIES.FRESHNESS,
      title: 'Stale Content',
      description: `${staleContent.length} pages haven't been updated in over a year.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: staleContent.slice(0, 100).map(r => r.address),
      count: staleContent.length,
      recommendation: 'Review and update stale content to maintain relevance and accuracy.'
    });
  }

  // Missing last-modified header
  const missingLastModified = indexableRows.filter(r =>
    !r.lastModified || r.lastModified.trim() === ''
  );

  if (missingLastModified.length > indexableRows.length * 0.5) {
    issues.push({
      id: 'freshness-missing-header',
      category: CATEGORIES.FRESHNESS,
      title: 'Missing Last-Modified Header',
      description: `${missingLastModified.length} pages are missing Last-Modified header.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: missingLastModified.slice(0, 100).map(r => r.address),
      count: missingLastModified.length,
      recommendation: 'Set Last-Modified headers to help search engines with crawl efficiency.'
    });
  }

  return issues;
}

function checkSustainability(rows) {
  const issues = [];
  const indexableRows = rows.filter(r => r.indexability?.toLowerCase() === 'indexable');

  // High carbon footprint (based on page weight)
  const highCarbonPages = indexableRows.filter(r => {
    const size = parseInt(r.size, 10);
    return size > 2000000; // > 2MB
  });

  if (highCarbonPages.length > 0) {
    issues.push({
      id: 'sustainability-high-carbon',
      category: CATEGORIES.SUSTAINABILITY,
      title: 'High Page Weight',
      description: `${highCarbonPages.length} pages exceed 2MB, impacting sustainability.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: highCarbonPages.slice(0, 100).map(r => r.address),
      count: highCarbonPages.length,
      recommendation: 'Reduce page weight to lower energy consumption and carbon footprint.'
    });
  }

  // Uncompressed resources
  const uncompressed = indexableRows.filter(r =>
    r.contentEncoding?.toLowerCase() === 'none' ||
    !r.contentEncoding
  );

  if (uncompressed.length > indexableRows.length * 0.2) {
    issues.push({
      id: 'sustainability-uncompressed',
      category: CATEGORIES.SUSTAINABILITY,
      title: 'Uncompressed Resources',
      description: `${uncompressed.length} pages serve uncompressed content.`,
      severity: SEVERITY.INFO,
      priority: PRIORITY.COULD,
      affectedUrls: uncompressed.slice(0, 100).map(r => r.address),
      count: uncompressed.length,
      recommendation: 'Enable gzip/brotli compression to reduce bandwidth and energy usage.'
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
