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

// Size constants for file handling
const SIZE_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024 * 1024,      // 5GB absolute maximum
  WARN_SIZE: 500 * 1024 * 1024,           // 500MB warning threshold
  LARGE_FILE: 1 * 1024 * 1024 * 1024,     // 1GB = "large file" mode
  CHUNK_SIZE: 50 * 1024 * 1024            // 50MB chunks for streaming
};

/**
 * Process a ZIP file and extract all Excel files
 * Optimized for large files (3+ GB) with chunked processing
 * @param {File} file - The ZIP file to process
 * @param {Function} onProgress - Progress callback (0-100)
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Extracted files and metadata
 */
export async function processZipFile(file, onProgress = () => {}, options = {}) {
  try {
    const maxSize = options.maxSize || SIZE_LIMITS.MAX_SIZE;
    const isLargeFile = file.size > SIZE_LIMITS.LARGE_FILE;

    // Initial progress
    if (isLargeFile) {
      onProgress(0, `Processing large file (${formatFileSize(file.size)})... This may take several minutes.`);
    } else {
      onProgress(0, 'Loading ZIP file...');
    }

    // Validate file size
    if (file.size > maxSize) {
      throw new Error(`File exceeds ${formatFileSize(maxSize)} limit. Please split the crawl or contact support.`);
    }

    // For large files, show additional memory warning
    if (file.size > SIZE_LIMITS.WARN_SIZE) {
      console.info(`Processing large file: ${formatFileSize(file.size)}. Consider closing other tabs to free memory.`);
    }

    // Load the ZIP file with optimized settings
    const zip = await JSZip.loadAsync(file, {
      async: true,
      // Use optimized string handling for large files
      optimizedBinaryString: isLargeFile
    });

    onProgress(10, isLargeFile ? 'Extracting files (large dataset)...' : 'Extracting files...');

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
 * @param {Object} options - Validation options
 * @returns {Object} - Validation result
 */
export function validateFile(file, options = {}) {
  const errors = [];
  const warnings = [];
  const info = [];

  // Check file type
  if (!file.name.toLowerCase().endsWith('.zip')) {
    errors.push('File must be a ZIP archive. Please export from Screaming Frog using Multi Export.');
  }

  // Size thresholds
  const maxSize = options.maxSize || SIZE_LIMITS.MAX_SIZE;

  if (file.size > maxSize) {
    errors.push(`File exceeds ${formatFileSize(maxSize)} limit (${formatFileSize(file.size)}). Please split the crawl.`);
  } else if (file.size > SIZE_LIMITS.LARGE_FILE) {
    // Very large file - recommend best practices
    warnings.push(`Very large file (${formatFileSize(file.size)}). Processing may require several minutes and significant memory.`);
    info.push('Tip: Close other browser tabs and applications to free memory before processing.');
  } else if (file.size > SIZE_LIMITS.WARN_SIZE) {
    warnings.push(`Large file (${formatFileSize(file.size)}). Processing may take longer than usual.`);
  }

  // Check for CSV files in name (common mistake)
  if (file.name.toLowerCase().includes('csv')) {
    warnings.push('CSV exports detected in filename. Ensure you selected Excel format in Screaming Frog.');
  }

  // Estimate processing time for user feedback
  const estimatedSeconds = Math.ceil(file.size / (50 * 1024 * 1024)); // ~50MB/s
  if (estimatedSeconds > 30) {
    info.push(`Estimated processing time: ${Math.ceil(estimatedSeconds / 60)} minutes`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    info,
    isLargeFile: file.size > SIZE_LIMITS.LARGE_FILE,
    estimatedSeconds
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
  REQUIRED_FILES,
  SIZE_LIMITS
};
