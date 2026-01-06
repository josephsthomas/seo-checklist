import * as XLSX from 'xlsx';

/**
 * Excel Parser for Screaming Frog Export Files
 * Parses XLSX files and extracts structured data for analysis
 */

// Column mappings for internal_all.xlsx (141 columns in SF 17+)
// Updated to match actual Screaming Frog export column names
const INTERNAL_ALL_COLUMNS = {
  // Core URL data
  address: 'Address',
  contentType: 'Content Type',
  statusCode: 'Status Code',
  status: 'Status',

  // Indexability
  indexability: 'Indexability',
  indexabilityStatus: 'Indexability Status',

  // Title
  title1: 'Title 1',
  title1Length: 'Title 1 Length',
  title1PixelWidth: 'Title 1 Pixel Width',
  title2: 'Title 2',

  // Meta Description
  metaDescription1: 'Meta Description 1',
  metaDescription1Length: 'Meta Description 1 Length',
  metaDescription1PixelWidth: 'Meta Description 1 Pixel Width',
  metaDescription2: 'Meta Description 2',

  // Meta Keywords
  metaKeywords1: 'Meta Keywords 1',
  metaKeywords1Length: 'Meta Keywords 1 Length',

  // Headings
  h1: 'H1-1',
  h1Length: 'H1-1 Length',
  h1Second: 'H1-2',
  h1SecondLength: 'H1-2 Length',
  h2: 'H2-1',
  h2Length: 'H2-1 Length',
  h2Second: 'H2-2',
  h2SecondLength: 'H2-2 Length',

  // Directives
  metaRobots1: 'Meta Robots 1',
  xRobotsTag1: 'X-Robots-Tag 1',
  metaRefresh1: 'Meta Refresh 1',
  canonicalLinkElement1: 'Canonical Link Element 1',
  relNext1: 'rel="next" 1',
  relPrev1: 'rel="prev" 1',
  httpRelNext1: 'HTTP rel="next" 1',
  httpRelPrev1: 'HTTP rel="prev" 1',
  amphtmlLinkElement: 'amphtml Link Element',

  // Size & Performance
  size: 'Size (bytes)',
  transferred: 'Transferred (bytes)',
  totalTransferred: 'Total Transferred (bytes)',
  responseTime: 'Response Time',

  // Content
  wordCount: 'Word Count',
  sentenceCount: 'Sentence Count',
  avgWordsPerSentence: 'Average Words Per Sentence',
  fleschReadingEase: 'Flesch Reading Ease Score',
  readability: 'Readability',
  textRatio: 'Text Ratio',

  // Links
  crawlDepth: 'Crawl Depth',
  folderDepth: 'Folder Depth',
  linkScore: 'Link Score',
  inlinks: 'Inlinks',
  uniqueInlinks: 'Unique Inlinks',
  uniqueJsInlinks: 'Unique JS Inlinks',
  percentOfTotal: '% of Total',
  outlinks: 'Outlinks',
  uniqueOutlinks: 'Unique Outlinks',
  uniqueJsOutlinks: 'Unique JS Outlinks',
  externalOutlinks: 'External Outlinks',
  uniqueExternalOutlinks: 'Unique External Outlinks',
  uniqueExternalJsOutlinks: 'Unique External JS Outlinks',

  // Duplication
  hashValue: 'Hash',
  nearDuplicateMatch: 'Closest Near Duplicate Match',
  nearDuplicateCount: 'No. Near Duplicates',

  // Spelling/Grammar
  spellingErrors: 'Spelling Errors',
  grammarErrors: 'Grammar Errors',

  // Dates
  lastModified: 'Last Modified',
  crawlTimestamp: 'Crawl Timestamp',

  // Redirects
  redirectUrl: 'Redirect URL',
  redirectType: 'Redirect Type',

  // Cookies
  cookies: 'Cookies',

  // Language & HTTP
  language: 'Language',
  httpVersion: 'HTTP Version',

  // Core Web Vitals (Lab Data)
  performanceScore: 'Performance Score',
  fcp: 'First Contentful Paint Time (ms)',
  speedIndex: 'Speed Index Time (ms)',
  lcp: 'Largest Contentful Paint Time (ms)',
  tti: 'Time to Interactive (ms)',
  tbt: 'Total Blocking Time (ms)',
  cls: 'Cumulative Layout Shift',

  // PageSpeed Savings
  totalSizeSavings: 'Total Size Savings (Bytes)',
  totalTimeSavings: 'Total Time Savings (ms)',

  // Page Size Breakdown
  totalRequests: 'Total Requests',
  totalPageSize: 'Total Page Size (Bytes)',
  htmlSize: 'HTML Size (Bytes)',
  htmlCount: 'HTML Count',
  imageSize: 'Image Size (Bytes)',
  imageCount: 'Image Count',
  cssSize: 'CSS Size (Bytes)',
  cssCount: 'CSS Count',
  jsSize: 'JavaScript Size (Bytes)',
  jsCount: 'JavaScript Count',
  fontSize: 'Font Size (Bytes)',
  fontCount: 'Font Count',
  mediaSize: 'Media Size (Bytes)',
  mediaCount: 'Media Count',
  otherSize: 'Other Size (Bytes)',
  otherCount: 'Other Count',

  // CrUX Data (Field Data)
  cwvAssessment: 'Core Web Vitals Assessment',
  cruxLcp: 'CrUX Largest Contentful Paint Time (ms)',
  cruxInp: 'CrUX Interaction to Next Paint (ms)',
  cruxCls: 'CrUX Cumulative Layout Shift',
  cruxFcp: 'CrUX First Contentful Paint Time (ms)',

  // PageSpeed Optimization Opportunities
  minifyCssSavingsMs: 'Minify CSS Savings (ms)',
  minifyCssSavingsBytes: 'Minify CSS Savings (Bytes)',
  minifyJsSavingsMs: 'Minify JavaScript Savings (ms)',
  minifyJsSavingsBytes: 'Minify JavaScript Savings (Bytes)',
  unusedCssSavingsMs: 'Reduce Unused CSS Savings (ms)',
  unusedCssSavingsBytes: 'Reduce Unused CSS Savings (Bytes)',
  unusedJsSavingsMs: 'Reduce Unused JavaScript Savings (ms)',
  unusedJsSavingsBytes: 'Reduce Unused JavaScript Savings (Bytes)',
  jsExecutionTime: 'JavaScript Execution Time (ms)',
  jsExecutionCategory: 'JavaScript Execution Time Category',
  mainThreadWork: 'Minimize Main-Thread Work (ms)',
  mainThreadCategory: 'Minimize Main-Thread Work Category',
  networkPayloadSize: 'Network Payload Size (Bytes)',
  userTimingMarks: 'User Timing Marks and Measures',
  numberOfRedirects: 'Number of Redirects',
  serverRespondsQuickly: 'Server Responds Quickly',
  appliesTextCompression: 'Applies Text Compression',
  lcpRequestDiscovery: 'LCP Request Discovery',
  lcpBreakdown: 'LCP Breakdown',
  renderBlockingSavings: 'Render Blocking Requests Savings (ms)',
  preconnectSavings: 'Preconnect Candidates Savings (ms)',
  maxCriticalPathLatency: 'Maximum Critical Path Latency (ms)',
  cacheLifetimeSavings: 'Use Efficient Cache Lifetimes Savings (Bytes)',
  layoutShiftCulprits: 'Layout Shift Culprits',
  domSize: 'DOM Size',
  imageDeliverySavings: 'Improve Image Delivery Savings (Bytes)',
  forcedReflowSavings: 'Forced Reflow Savings (ms)',
  legacyJsSavings: 'Legacy JavaScript Savings (Bytes)',
  duplicatedJsBytes: 'Duplicated JavaScript (Bytes)',
  fontDisplaySavings: 'Font Display Savings (ms)',

  // Third Party
  thirdPartySize: 'Third Party Size (Bytes)',
  thirdPartyCount: 'Third Party Count',
  thirdParties: '3rd Parties',

  // Mobile
  targetSize: 'Target Size',
  contentWidth: 'Content Width',
  fontDisplaySize: 'Font Display Size',
  viewport: 'Viewport',
  mobileAlternateLink: 'Mobile Alternate Link',

  // Semantic/AI Content Analysis
  closestSemanticMatch: 'Closest Semantically Similar Address',
  semanticSimilarityScore: 'Semantic Similarity Score',
  semanticSimilarCount: 'No. Semantically Similar',
  semanticRelevanceScore: 'Semantic Relevance Score',

  // Carbon/Sustainability
  co2: 'CO2 (mg)',
  carbonRating: 'Carbon Rating',

  // URL
  urlEncodedAddress: 'URL Encoded Address'
};

/**
 * Parse an Excel file from ArrayBuffer
 * @param {ArrayBuffer} data - The Excel file data
 * @param {string} fileName - Name of the file being parsed
 * @returns {Object} - Parsed data with rows and headers
 */
export function parseExcelFile(data, fileName) {
  try {
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Get data as JSON with headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false
    });

    if (jsonData.length === 0) {
      return {
        success: false,
        error: `File ${fileName} is empty`,
        rows: [],
        headers: []
      };
    }

    // First row is headers
    const headers = jsonData[0].map(h => String(h).trim());

    // Convert remaining rows to objects
    const rows = jsonData.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] !== undefined ? row[index] : '';
      });
      return obj;
    });

    return {
      success: true,
      fileName,
      headers,
      rows,
      rowCount: rows.length,
      columnCount: headers.length
    };
  } catch (error) {
    console.error(`Error parsing ${fileName}:`, error);
    return {
      success: false,
      error: `Failed to parse ${fileName}: ${error.message}`,
      rows: [],
      headers: []
    };
  }
}

/**
 * Parse the main internal_all.xlsx file
 * @param {ArrayBuffer} data - The file data
 * @returns {Object} - Parsed internal data with normalized column names
 */
export function parseInternalAll(data) {
  const result = parseExcelFile(data, 'internal_all.xlsx');

  if (!result.success) {
    return result;
  }

  // Create a header mapping for quick lookup
  const headerMap = {};
  result.headers.forEach((header, index) => {
    headerMap[header.toLowerCase()] = index;
  });

  // Normalize rows with consistent property names
  const normalizedRows = result.rows.map(row => {
    const normalized = {};

    for (const [key, sfColumn] of Object.entries(INTERNAL_ALL_COLUMNS)) {
      // Try exact match first, then case-insensitive
      if (row[sfColumn] !== undefined) {
        normalized[key] = row[sfColumn];
      } else {
        // Try to find column case-insensitively
        const foundHeader = result.headers.find(
          h => h.toLowerCase() === sfColumn.toLowerCase()
        );
        if (foundHeader) {
          normalized[key] = row[foundHeader] || '';
        } else {
          normalized[key] = '';
        }
      }
    }

    // Keep the raw row data too for access to any columns we didn't map
    normalized._raw = row;

    return normalized;
  });

  return {
    success: true,
    fileName: 'internal_all.xlsx',
    headers: result.headers,
    rows: normalizedRows,
    rowCount: normalizedRows.length,
    columnCount: result.columnCount,
    availableColumns: result.headers
  };
}

/**
 * Extract domain information from parsed data
 * @param {Array} rows - Parsed rows from internal_all.xlsx
 * @returns {Object} - Domain information
 */
export function extractDomainInfo(rows) {
  if (!rows || rows.length === 0) {
    return { domain: 'Unknown', subdomains: [], urlCount: 0 };
  }

  const domains = new Set();
  const subdomains = new Set();

  rows.forEach(row => {
    const url = row.address || '';
    try {
      const urlObj = new URL(url);
      domains.add(urlObj.hostname);

      // Extract subdomain
      const parts = urlObj.hostname.split('.');
      if (parts.length > 2) {
        subdomains.add(parts[0]);
      }
    } catch (err) {
      // Log invalid URLs for debugging
      console.warn('Invalid URL during domain extraction:', url, err.message);
    }
  });

  // Get primary domain (most common)
  const domainArray = Array.from(domains);
  const primaryDomain = domainArray[0] || 'Unknown';

  return {
    domain: primaryDomain,
    allDomains: domainArray,
    subdomains: Array.from(subdomains),
    urlCount: rows.length,
    hasMultipleDomains: domainArray.length > 1
  };
}

/**
 * Get summary statistics from internal_all data
 * @param {Array} rows - Parsed rows
 * @returns {Object} - Summary statistics
 */
export function getSummaryStats(rows) {
  if (!rows || rows.length === 0) {
    return { totalUrls: 0, indexable: 0, nonIndexable: 0, errors: 0, warnings: 0 };
  }

  let indexable = 0;
  let nonIndexable = 0;
  let errors = 0;
  let redirects = 0;

  rows.forEach(row => {
    const statusCode = parseInt(row.statusCode, 10) || 0;
    const indexability = (row.indexability || '').toLowerCase();

    // Count by indexability
    if (indexability === 'indexable') {
      indexable++;
    } else {
      nonIndexable++;
    }

    // Count errors (4xx and 5xx)
    if (statusCode >= 400) {
      errors++;
    }

    // Count redirects
    if (statusCode >= 300 && statusCode < 400) {
      redirects++;
    }
  });

  return {
    totalUrls: rows.length,
    indexable,
    nonIndexable,
    errors,
    redirects,
    indexablePercent: rows.length > 0 ? Math.round((indexable / rows.length) * 100) : 0
  };
}

/**
 * Group URLs by status code
 * @param {Array} rows - Parsed rows
 * @returns {Object} - URLs grouped by status code
 */
export function groupByStatusCode(rows) {
  const groups = {};

  rows.forEach(row => {
    const statusCode = row.statusCode || 'Unknown';
    if (!groups[statusCode]) {
      groups[statusCode] = [];
    }
    groups[statusCode].push(row);
  });

  return groups;
}

/**
 * Detect what audit types are available in the exported files
 * @param {Object} extractedFiles - Files extracted from ZIP
 * @returns {Object} - Available audit types
 */
export function detectAvailableAudits(extractedFiles) {
  const fileNames = Object.keys(extractedFiles);

  return {
    // SEO Technical Audit requires internal_all.xlsx
    seoAudit: fileNames.includes('internal_all.xlsx'),

    // Accessibility Audit requires accessibility_all.xlsx
    accessibilityAudit: fileNames.includes('accessibility_all.xlsx'),

    // Count accessibility violation files
    accessibilityFiles: fileNames.filter(f => f.startsWith('accessibility_')).length,

    // Count total files
    totalFiles: fileNames.length,

    // List key files found
    keyFilesFound: {
      internal: fileNames.includes('internal_all.xlsx'),
      accessibilityAll: fileNames.includes('accessibility_all.xlsx'),
      accessibilitySummary: fileNames.includes('accessibility_violations_summary.xlsx'),
      pagespeed: fileNames.includes('pagespeed_all.xlsx'),
      structuredData: fileNames.includes('structured_data_all.xlsx'),
      hreflang: fileNames.includes('hreflang_all.xlsx'),
      javascript: fileNames.includes('javascript_all.xlsx')
    }
  };
}

/**
 * Parse all available Excel files from extracted ZIP
 * @param {Object} extractedFiles - Files extracted from ZIP
 * @param {Function} onProgress - Progress callback
 * @returns {Object} - All parsed data
 */
export async function parseAllFiles(extractedFiles, onProgress = () => {}) {
  const parsedData = {
    internal: null,
    pageSpeed: null,
    links: null,
    redirects: null,
    canonicals: null,
    content: {},
    images: null,
    structuredData: null,
    security: null,
    accessibility: null,  // Added for accessibility data
    other: {}
  };

  const fileNames = Object.keys(extractedFiles);
  let processed = 0;

  for (const fileName of fileNames) {
    const file = extractedFiles[fileName];

    onProgress(
      Math.round((processed / fileNames.length) * 100),
      `Parsing ${file.name}...`
    );

    // Parse based on file name
    if (fileName === 'internal_all.xlsx') {
      parsedData.internal = parseInternalAll(file.data);
    } else if (fileName.startsWith('accessibility_')) {
      // Group all accessibility files together
      parsedData.accessibility = parsedData.accessibility || {};
      parsedData.accessibility[fileName] = parseExcelFile(file.data, file.name);
    } else if (fileName.includes('pagespeed') || fileName.includes('core_web_vitals')) {
      parsedData.pageSpeed = parsedData.pageSpeed || {};
      parsedData.pageSpeed[fileName] = parseExcelFile(file.data, file.name);
    } else if (fileName.includes('inlinks') || fileName.includes('outlinks') || fileName.includes('links_all')) {
      parsedData.links = parsedData.links || {};
      parsedData.links[fileName] = parseExcelFile(file.data, file.name);
    } else if (fileName.includes('redirect')) {
      parsedData.redirects = parsedData.redirects || {};
      parsedData.redirects[fileName] = parseExcelFile(file.data, file.name);
    } else if (fileName.includes('canonical')) {
      parsedData.canonicals = parsedData.canonicals || {};
      parsedData.canonicals[fileName] = parseExcelFile(file.data, file.name);
    } else if (fileName.includes('title') || fileName.includes('meta_description') || fileName.includes('h1') || fileName.includes('h2')) {
      parsedData.content[fileName] = parseExcelFile(file.data, file.name);
    } else if (fileName.includes('image')) {
      parsedData.images = parsedData.images || {};
      parsedData.images[fileName] = parseExcelFile(file.data, file.name);
    } else if (fileName.includes('structured_data') || fileName.includes('schema')) {
      parsedData.structuredData = parsedData.structuredData || {};
      parsedData.structuredData[fileName] = parseExcelFile(file.data, file.name);
    } else if (fileName.includes('security') || fileName.includes('cookie')) {
      parsedData.security = parsedData.security || {};
      parsedData.security[fileName] = parseExcelFile(file.data, file.name);
    } else {
      parsedData.other[fileName] = parseExcelFile(file.data, file.name);
    }

    processed++;
  }

  onProgress(100, 'Parsing complete');

  return parsedData;
}

export default {
  parseExcelFile,
  parseInternalAll,
  parseAllFiles,
  extractDomainInfo,
  getSummaryStats,
  groupByStatusCode,
  detectAvailableAudits,
  INTERNAL_ALL_COLUMNS
};
