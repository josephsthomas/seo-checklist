import JSZip from 'jszip';

/**
 * Screaming Frog ZIP Export Processor
 * Handles extraction and validation of SF multi-export ZIP files
 */

// Required files for a valid audit
const REQUIRED_FILES = ['internal_all.xlsx'];

// Optional but important files organized by category
const FILE_CATEGORIES = {
  core: ['internal_all.xlsx'],
  pageSpeed: [
    'pagespeed_metrics.xlsx',
    'pagespeed_opportunities.xlsx',
    'pagespeed_diagnostics.xlsx',
    'core_web_vitals.xlsx',
    'lcp_breakdown_report.xlsx'
  ],
  links: [
    'all_inlinks.xlsx',
    'all_outlinks.xlsx',
    'links_all.xlsx',
    'external_all.xlsx'
  ],
  redirects: [
    'redirect_chains.xlsx',
    'redirect_loops.xlsx'
  ],
  canonicals: [
    'canonicals_all.xlsx',
    'canonical_chains.xlsx'
  ],
  content: [
    'page_titles_all.xlsx',
    'page_titles_missing.xlsx',
    'page_titles_duplicate.xlsx',
    'meta_description_all.xlsx',
    'meta_description_missing.xlsx',
    'meta_description_duplicate.xlsx',
    'h1_all.xlsx',
    'h1_missing.xlsx',
    'h1_duplicate.xlsx',
    'h2_all.xlsx'
  ],
  images: [
    'images_all.xlsx',
    'images_missing_alt_text.xlsx',
    'images_over_100kb.xlsx'
  ],
  structuredData: [
    'structured_data_all.xlsx',
    'structured_data_errors.xlsx',
    'structured_data_warnings.xlsx'
  ],
  security: [
    'security_all.xlsx',
    'security_insecure_content.xlsx',
    'all_cookies.xlsx',
    'cookie_summary.xlsx'
  ],
  javascript: [
    'javascript_all.xlsx',
    'js_rendering_changes.xlsx'
  ],
  mobile: [
    'mobile_usability.xlsx',
    'mobile_all.xlsx'
  ],
  amp: [
    'amp_all.xlsx',
    'amp_errors.xlsx'
  ],
  hreflang: [
    'hreflang_all.xlsx',
    'hreflang_errors.xlsx'
  ],
  sitemaps: [
    'sitemaps_all.xlsx',
    'sitemap_urls.xlsx'
  ],
  analytics: [
    'analytics_all.xlsx',
    'search_console_all.xlsx'
  ],
  validation: [
    'validation_all.xlsx',
    'validation_errors.xlsx'
  ],
  accessibility: [
    'accessibility_all.xlsx'
  ]
};

/**
 * Process a ZIP file and extract all Excel files
 * @param {File} file - The ZIP file to process
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<Object>} - Extracted files and metadata
 */
export async function processZipFile(file, onProgress = () => {}) {
  try {
    onProgress(0, 'Loading ZIP file...');

    // Validate file size (max 500MB per BRD)
    const MAX_SIZE = 500 * 1024 * 1024; // 500MB
    if (file.size > MAX_SIZE) {
      throw new Error(`File exceeds 500MB limit. Please export a smaller crawl or contact support.`);
    }

    // Load the ZIP file
    const zip = await JSZip.loadAsync(file, {
      // Progress callback for loading
      async: true
    });

    onProgress(10, 'Extracting files...');

    // Get all file entries
    const fileEntries = Object.keys(zip.files).filter(name => !zip.files[name].dir);
    const totalFiles = fileEntries.length;

    if (totalFiles === 0) {
      throw new Error('ZIP file is empty. Please ensure you exported using Screaming Frog Multi Export.');
    }

    // Check for required files
    const hasRequiredFiles = REQUIRED_FILES.every(required =>
      fileEntries.some(entry => entry.toLowerCase().endsWith(required.toLowerCase()))
    );

    if (!hasRequiredFiles) {
      throw new Error(
        `Required file missing: ${REQUIRED_FILES.join(', ')}. ` +
        'Please ensure you exported using Screaming Frog Multi Export with the Internal tab selected.'
      );
    }

    // Extract Excel files
    const extractedFiles = {};
    const xlsxFiles = fileEntries.filter(name =>
      name.toLowerCase().endsWith('.xlsx') || name.toLowerCase().endsWith('.xls')
    );

    let processed = 0;
    for (const fileName of xlsxFiles) {
      const fileData = await zip.files[fileName].async('arraybuffer');
      const baseName = fileName.split('/').pop(); // Get just the filename, not path
      extractedFiles[baseName.toLowerCase()] = {
        name: baseName,
        data: fileData,
        size: fileData.byteLength
      };

      processed++;
      const progress = 10 + Math.round((processed / xlsxFiles.length) * 80);
      onProgress(progress, `Extracting ${baseName}...`);
    }

    onProgress(90, 'Analyzing export structure...');

    // Categorize found files
    const foundCategories = {};
    const missingCategories = {};

    for (const [category, expectedFiles] of Object.entries(FILE_CATEGORIES)) {
      const found = expectedFiles.filter(f => extractedFiles[f.toLowerCase()]);
      const missing = expectedFiles.filter(f => !extractedFiles[f.toLowerCase()]);

      if (found.length > 0) {
        foundCategories[category] = found;
      }
      if (missing.length > 0 && category !== 'core') {
        missingCategories[category] = missing;
      }
    }

    onProgress(100, 'Extraction complete');

    return {
      success: true,
      files: extractedFiles,
      metadata: {
        totalFiles: Object.keys(extractedFiles).length,
        zipSize: file.size,
        zipName: file.name,
        categories: foundCategories,
        missingCategories,
        extractedAt: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('ZIP processing error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process ZIP file',
      files: {},
      metadata: null
    };
  }
}

/**
 * Check if a file is a valid Screaming Frog export
 * @param {File} file - The file to validate
 * @returns {Object} - Validation result
 */
export function validateFile(file) {
  const errors = [];
  const warnings = [];

  // Check file type
  if (!file.name.toLowerCase().endsWith('.zip')) {
    errors.push('File must be a ZIP archive. Please export from Screaming Frog using Multi Export.');
  }

  // Check file size
  const MAX_SIZE = 500 * 1024 * 1024; // 500MB
  const WARN_SIZE = 100 * 1024 * 1024; // 100MB

  if (file.size > MAX_SIZE) {
    errors.push(`File exceeds 500MB limit (${formatFileSize(file.size)}). Please export a smaller crawl.`);
  } else if (file.size > WARN_SIZE) {
    warnings.push(`Large file (${formatFileSize(file.size)}). Processing may take longer.`);
  }

  // Check for CSV files in name (common mistake)
  if (file.name.toLowerCase().includes('csv')) {
    warnings.push('CSV exports detected in filename. Ensure you selected Excel format in Screaming Frog.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Format file size to human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size string
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get a summary of what files are available for analysis
 * @param {Object} extractedFiles - The extracted files object
 * @returns {Object} - Summary of available analyses
 */
export function getAvailableAnalyses(extractedFiles) {
  const fileNames = Object.keys(extractedFiles);

  return {
    core: fileNames.includes('internal_all.xlsx'),
    pageSpeed: FILE_CATEGORIES.pageSpeed.some(f => fileNames.includes(f.toLowerCase())),
    links: FILE_CATEGORIES.links.some(f => fileNames.includes(f.toLowerCase())),
    redirects: FILE_CATEGORIES.redirects.some(f => fileNames.includes(f.toLowerCase())),
    canonicals: FILE_CATEGORIES.canonicals.some(f => fileNames.includes(f.toLowerCase())),
    content: FILE_CATEGORIES.content.some(f => fileNames.includes(f.toLowerCase())),
    images: FILE_CATEGORIES.images.some(f => fileNames.includes(f.toLowerCase())),
    structuredData: FILE_CATEGORIES.structuredData.some(f => fileNames.includes(f.toLowerCase())),
    security: FILE_CATEGORIES.security.some(f => fileNames.includes(f.toLowerCase())),
    javascript: FILE_CATEGORIES.javascript.some(f => fileNames.includes(f.toLowerCase())),
    mobile: FILE_CATEGORIES.mobile.some(f => fileNames.includes(f.toLowerCase())),
    amp: FILE_CATEGORIES.amp.some(f => fileNames.includes(f.toLowerCase())),
    hreflang: FILE_CATEGORIES.hreflang.some(f => fileNames.includes(f.toLowerCase())),
    sitemaps: FILE_CATEGORIES.sitemaps.some(f => fileNames.includes(f.toLowerCase())),
    analytics: FILE_CATEGORIES.analytics.some(f => fileNames.includes(f.toLowerCase()))
  };
}

export default {
  processZipFile,
  validateFile,
  getAvailableAnalyses,
  FILE_CATEGORIES,
  REQUIRED_FILES
};
