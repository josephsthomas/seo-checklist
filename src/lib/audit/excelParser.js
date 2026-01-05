import * as XLSX from 'xlsx';

/**
 * Excel Parser for Screaming Frog Export Files
 * Parses XLSX files and extracts structured data for analysis
 */

// Column mappings for internal_all.xlsx (141 columns in SF 17+)
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
  h1Count: 'H1-2',
  h2: 'H2-1',
  h2Length: 'H2-1 Length',
  h2Count: 'H2-2',

  // Directives
  metaRobots1: 'Meta Robots 1',
  xRobotsTag1: 'X-Robots-Tag 1',
  metaRefresh1: 'Meta Refresh 1',
  canonicalLinkElement1: 'Canonical Link Element 1',
  relNext1: 'rel="next" 1',
  relPrev1: 'rel="prev" 1',
  httpCanonical: 'HTTP Canonical',

  // Size & Performance
  size: 'Size (bytes)',
  transferred: 'Transferred (bytes)',
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
  externalOutlinks: 'External Outlinks',

  // Duplication
  hashValue: 'Hash',
  nearDuplicateMatch: 'Closest Near Duplicate Match',
  nearDuplicateCount: 'No. Near Duplicates',
  nearDuplicateSimilarity: 'Near Duplicate Similarity',

  // Spelling/Grammar
  spellingErrors: 'Spelling Errors',
  grammarErrors: 'Grammar Errors',

  // Dates
  lastModified: 'Last Modified',

  // Redirects
  redirectUrl: 'Redirect URL',
  redirectType: 'Redirect Type',

  // Cookies
  cookies: 'Cookies',

  // Language
  language: 'Language',

  // Core Web Vitals
  performanceScore: 'Performance Score',
  fcp: 'First Contentful Paint Time (ms)',
  lcp: 'Largest Contentful Paint Time (ms)',
  tti: 'Time to Interactive (ms)',
  tbt: 'Total Blocking Time (ms)',
  cls: 'Cumulative Layout Shift',
  speedIndex: 'Speed Index (ms)',

  // CrUX Data
  cruxLcp: 'CrUX LCP',
  cruxFid: 'CrUX FID',
  cruxInp: 'CrUX INP',
  cruxCls: 'CrUX CLS',
  cruxFcp: 'CrUX FCP',
  cwvAssessment: 'Core Web Vitals Assessment',

  // Carbon/Sustainability
  co2: 'CO2 (mg)',
  carbonRating: 'Carbon Rating',

  // DOM
  domSize: 'DOM Size',

  // Mobile
  viewport: 'Viewport',
  targetSize: 'Target Size',
  contentWidth: 'Content Width',

  // Semantic
  semanticSimilarityScore: 'Semantic Similarity Score',
  semanticSimilarCount: 'No. Semantically Similar',
  semanticRelevanceScore: 'Semantic Relevance Score',

  // Third Party
  thirdPartySize: 'Third Party Size',
  thirdPartyCount: 'Third Party Count',
  thirdParties: '3rd Parties'
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
  INTERNAL_ALL_COLUMNS
};
