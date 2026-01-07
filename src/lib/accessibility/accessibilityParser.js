/**
 * Accessibility Parser
 * Specialized parser for Screaming Frog accessibility export files
 * Handles parsing of accessibility_all.xlsx and individual violation files
 */

import ExcelJS from 'exceljs';
import { getRuleByFileName } from '../../data/axeRules';

/**
 * Column mappings for accessibility_all.xlsx
 */
const ACCESSIBILITY_ALL_COLUMNS = {
  address: 'Address',
  contentType: 'Content Type',
  statusCode: 'Status Code',
  status: 'Status',
  indexability: 'Indexability',
  indexabilityStatus: 'Indexability Status',
  allViolations: 'All Violations',
  bestPracticeViolations: 'Best Practice Violations',
  wcag20AViolations: 'WCAG 2.0 A Violations',
  wcag20AAViolations: 'WCAG 2.0 AA Violations',
  wcag20AAAViolations: 'WCAG 2.0 AAA Violations',
  wcag21AAViolations: 'WCAG 2.1 AA Violations',
  wcag22AAViolations: 'WCAG 2.2 AA Violations',
  crawlDepth: 'Crawl Depth',
  title: 'Title 1',
  wordCount: 'Word Count'
};

/**
 * Column mappings for individual accessibility violation files
 * These files contain more detail about specific violations
 */
const VIOLATION_FILE_COLUMNS = {
  address: 'Address',
  contentType: 'Content Type',
  statusCode: 'Status Code',
  indexability: 'Indexability',
  allViolations: 'All Violations',
  // Violation-specific columns (may vary by file)
  htmlElement: 'HTML Element',
  selector: 'CSS Selector',
  targetCode: 'Target Code',
  message: 'Message',
  help: 'Help',
  helpUrl: 'Help URL',
  impact: 'Impact',
  nodeCount: 'Node Count'
};

/**
 * Column mappings for accessibility_violations_summary.xlsx
 */
const SUMMARY_FILE_COLUMNS = {
  rule: 'Rule',
  description: 'Description',
  impact: 'Impact',
  wcagLevel: 'WCAG Level',
  wcagCriteria: 'WCAG Criteria',
  urlCount: 'URL Count',
  violationCount: 'Violation Count'
};

/**
 * Parse a generic Excel file to JSON
 * @param {ArrayBuffer} data - The Excel file data
 * @param {string} fileName - Name of the file
 * @returns {Object} - Parsed data with rows and headers
 */
async function parseExcelFile(data, fileName) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(data);

    const worksheet = workbook.worksheets[0];

    if (!worksheet || worksheet.rowCount === 0) {
      return {
        success: false,
        error: `File ${fileName} is empty`,
        rows: [],
        headers: []
      };
    }

    // Get headers from first row
    const headerRow = worksheet.getRow(1);
    const headers = [];
    headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      headers[colNumber - 1] = String(cell.value || '').trim();
    });

    // Convert remaining rows to objects
    const rows = [];
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const obj = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          let value = cell.value;
          if (value && typeof value === 'object') {
            if (value.text) value = value.text;
            else if (value.hyperlink) value = value.hyperlink;
            else if (value.result !== undefined) value = value.result;
            else value = String(value);
          }
          obj[header] = value !== null && value !== undefined ? value : '';
        }
      });
      rows.push(obj);
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
 * Parse the main accessibility_all.xlsx file
 * @param {ArrayBuffer} data - The file data
 * @returns {Object} - Parsed accessibility data with normalized columns
 */
export async function parseAccessibilityAll(data) {
  const result = await parseExcelFile(data, 'accessibility_all.xlsx');

  if (!result.success) {
    return result;
  }

  // Normalize rows with consistent property names
  const normalizedRows = result.rows.map(row => {
    const normalized = {};

    for (const [key, sfColumn] of Object.entries(ACCESSIBILITY_ALL_COLUMNS)) {
      // Try exact match first
      if (row[sfColumn] !== undefined) {
        normalized[key] = row[sfColumn];
      } else {
        // Try case-insensitive match
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

    // Parse numeric values
    normalized.allViolations = parseInt(normalized.allViolations, 10) || 0;
    normalized.bestPracticeViolations = parseInt(normalized.bestPracticeViolations, 10) || 0;
    normalized.wcag20AViolations = parseInt(normalized.wcag20AViolations, 10) || 0;
    normalized.wcag20AAViolations = parseInt(normalized.wcag20AAViolations, 10) || 0;
    normalized.wcag20AAAViolations = parseInt(normalized.wcag20AAAViolations, 10) || 0;
    normalized.wcag21AAViolations = parseInt(normalized.wcag21AAViolations, 10) || 0;
    normalized.wcag22AAViolations = parseInt(normalized.wcag22AAViolations, 10) || 0;
    normalized.statusCode = parseInt(normalized.statusCode, 10) || 0;

    // Keep raw data
    normalized._raw = row;

    return normalized;
  });

  return {
    success: true,
    fileName: 'accessibility_all.xlsx',
    headers: result.headers,
    rows: normalizedRows,
    rowCount: normalizedRows.length,
    columnCount: result.columnCount,
    availableColumns: result.headers
  };
}

/**
 * Parse an individual accessibility violation file
 * @param {ArrayBuffer} data - The file data
 * @param {string} fileName - Name of the file (e.g., 'accessibility_images_require_alternate_text.xlsx')
 * @returns {Object} - Parsed violation data with rule metadata
 */
export async function parseViolationFile(data, fileName) {
  const result = await parseExcelFile(data, fileName);

  if (!result.success) {
    return result;
  }

  // Get rule metadata from our data layer
  const rule = getRuleByFileName(fileName);
  const ruleId = fileName.replace('accessibility_', '').replace('.xlsx', '');

  // Normalize rows
  const normalizedRows = result.rows.map(row => {
    const normalized = {};

    for (const [key, sfColumn] of Object.entries(VIOLATION_FILE_COLUMNS)) {
      if (row[sfColumn] !== undefined) {
        normalized[key] = row[sfColumn];
      } else {
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

    // Parse numeric values
    normalized.allViolations = parseInt(normalized.allViolations, 10) || 0;
    normalized.statusCode = parseInt(normalized.statusCode, 10) || 0;
    normalized.nodeCount = parseInt(normalized.nodeCount, 10) || 0;

    normalized._raw = row;
    return normalized;
  });

  return {
    success: true,
    fileName,
    ruleId,
    rule: rule || {
      id: ruleId,
      name: formatRuleName(ruleId),
      wcagCriteria: [],
      wcagLevel: 'best-practice',
      impact: 'moderate'
    },
    headers: result.headers,
    rows: normalizedRows,
    rowCount: normalizedRows.length,
    columnCount: result.columnCount,
    urlCount: normalizedRows.length
  };
}

/**
 * Parse the accessibility_violations_summary.xlsx file
 * @param {ArrayBuffer} data - The file data
 * @returns {Object} - Parsed summary data
 */
export async function parseViolationsSummary(data) {
  const result = await parseExcelFile(data, 'accessibility_violations_summary.xlsx');

  if (!result.success) {
    return result;
  }

  const normalizedRows = result.rows.map(row => {
    const normalized = {};

    for (const [key, sfColumn] of Object.entries(SUMMARY_FILE_COLUMNS)) {
      if (row[sfColumn] !== undefined) {
        normalized[key] = row[sfColumn];
      } else {
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

    // Parse numeric values
    normalized.urlCount = parseInt(normalized.urlCount, 10) || 0;
    normalized.violationCount = parseInt(normalized.violationCount, 10) || 0;

    return normalized;
  });

  return {
    success: true,
    fileName: 'accessibility_violations_summary.xlsx',
    headers: result.headers,
    rows: normalizedRows,
    rowCount: normalizedRows.length
  };
}

/**
 * Parse all accessibility files from a ZIP extract
 * @param {Object} extractedFiles - Files extracted from ZIP (keyed by filename)
 * @param {Function} onProgress - Progress callback (percent, message)
 * @returns {Object} - All parsed accessibility data
 */
export async function parseAccessibilityFiles(extractedFiles, onProgress = () => {}) {
  const result = {
    success: true,
    mainData: null,
    summary: null,
    violations: {},
    stats: {
      totalFiles: 0,
      violationFiles: 0,
      parsedSuccessfully: 0,
      parseErrors: []
    }
  };

  const fileNames = Object.keys(extractedFiles);
  const accessibilityFiles = fileNames.filter(name => name.startsWith('accessibility_'));
  result.stats.totalFiles = accessibilityFiles.length;

  let processed = 0;

  for (const fileName of accessibilityFiles) {
    const fileData = extractedFiles[fileName];
    const arrayBuffer = fileData.data || fileData;

    onProgress(
      Math.round((processed / accessibilityFiles.length) * 100),
      `Parsing ${fileName}...`
    );

    try {
      if (fileName === 'accessibility_all.xlsx') {
        // Main accessibility file
        result.mainData = await parseAccessibilityAll(arrayBuffer);
        if (result.mainData.success) {
          result.stats.parsedSuccessfully++;
        } else {
          result.stats.parseErrors.push({ fileName, error: result.mainData.error });
        }
      } else if (fileName === 'accessibility_violations_summary.xlsx') {
        // Summary file
        result.summary = await parseViolationsSummary(arrayBuffer);
        if (result.summary.success) {
          result.stats.parsedSuccessfully++;
        } else {
          result.stats.parseErrors.push({ fileName, error: result.summary.error });
        }
      } else if (fileName.startsWith('accessibility_') && !fileName.includes('_score_') && !fileName.includes('wcag_2_')) {
        // Individual violation file
        result.stats.violationFiles++;
        const parsed = await parseViolationFile(arrayBuffer, fileName);
        if (parsed.success) {
          result.violations[fileName] = parsed;
          result.stats.parsedSuccessfully++;
        } else {
          result.stats.parseErrors.push({ fileName, error: parsed.error });
        }
      }
    } catch (error) {
      console.error(`Error parsing ${fileName}:`, error);
      result.stats.parseErrors.push({ fileName, error: error.message });
    }

    processed++;
  }

  onProgress(100, 'Parsing complete');

  // Set overall success based on whether we got the main data
  result.success = result.mainData && result.mainData.success;

  return result;
}

/**
 * Convert parsed accessibility data to engine-compatible format
 * @param {Object} parsedData - Data from parseAccessibilityFiles
 * @returns {Object} - Data formatted for accessibilityEngine
 */
export function convertToEngineFormat(parsedData) {
  const engineData = {};

  // Add main accessibility data
  if (parsedData.mainData && parsedData.mainData.success) {
    engineData['accessibility_all.xlsx'] = {
      rows: parsedData.mainData.rows,
      rowCount: parsedData.mainData.rowCount,
      headers: parsedData.mainData.headers
    };
  }

  // Add summary data
  if (parsedData.summary && parsedData.summary.success) {
    engineData['accessibility_violations_summary.xlsx'] = {
      rows: parsedData.summary.rows,
      rowCount: parsedData.summary.rowCount,
      headers: parsedData.summary.headers
    };
  }

  // Add violation files
  Object.entries(parsedData.violations).forEach(([fileName, data]) => {
    if (data.success) {
      engineData[fileName] = {
        rows: data.rows,
        rowCount: data.rowCount,
        headers: data.headers,
        rule: data.rule
      };
    }
  });

  return engineData;
}

/**
 * Extract accessibility summary statistics
 * @param {Object} parsedData - Data from parseAccessibilityFiles
 * @returns {Object} - Summary statistics
 */
export function getAccessibilitySummary(parsedData) {
  const summary = {
    totalUrls: 0,
    urlsWithViolations: 0,
    totalViolations: 0,
    violationsByLevel: {
      bestPractice: 0,
      wcag20A: 0,
      wcag20AA: 0,
      wcag20AAA: 0,
      wcag21AA: 0,
      wcag22AA: 0
    },
    uniqueViolationTypes: 0
  };

  if (!parsedData.mainData || !parsedData.mainData.success) {
    return summary;
  }

  const rows = parsedData.mainData.rows;
  summary.totalUrls = rows.length;

  rows.forEach(row => {
    if (row.allViolations > 0) {
      summary.urlsWithViolations++;
      summary.totalViolations += row.allViolations;
    }

    summary.violationsByLevel.bestPractice += row.bestPracticeViolations || 0;
    summary.violationsByLevel.wcag20A += row.wcag20AViolations || 0;
    summary.violationsByLevel.wcag20AA += row.wcag20AAViolations || 0;
    summary.violationsByLevel.wcag20AAA += row.wcag20AAAViolations || 0;
    summary.violationsByLevel.wcag21AA += row.wcag21AAViolations || 0;
    summary.violationsByLevel.wcag22AA += row.wcag22AAViolations || 0;
  });

  summary.uniqueViolationTypes = Object.keys(parsedData.violations).length;

  return summary;
}

/**
 * Get URLs sorted by violation count
 * @param {Object} parsedData - Data from parseAccessibilityFiles
 * @param {number} limit - Max URLs to return
 * @returns {Array} - URLs sorted by violations descending
 */
export function getWorstUrls(parsedData, limit = 20) {
  if (!parsedData.mainData || !parsedData.mainData.success) {
    return [];
  }

  return [...parsedData.mainData.rows]
    .filter(row => row.allViolations > 0)
    .sort((a, b) => b.allViolations - a.allViolations)
    .slice(0, limit)
    .map(row => ({
      address: row.address,
      totalViolations: row.allViolations,
      bestPractice: row.bestPracticeViolations,
      wcagA: row.wcag20AViolations,
      wcagAA: row.wcag20AAViolations + row.wcag21AAViolations + row.wcag22AAViolations,
      wcagAAA: row.wcag20AAAViolations,
      title: row.title || '',
      indexability: row.indexability
    }));
}

/**
 * Get violation rules sorted by URL count
 * @param {Object} parsedData - Data from parseAccessibilityFiles
 * @param {number} limit - Max rules to return
 * @returns {Array} - Rules sorted by affected URLs descending
 */
export function getTopViolationRules(parsedData, limit = 20) {
  const rules = Object.values(parsedData.violations)
    .filter(v => v.success && v.rowCount > 0)
    .map(v => ({
      ruleId: v.ruleId,
      name: v.rule?.name || formatRuleName(v.ruleId),
      wcagCriteria: v.rule?.wcagCriteria || [],
      wcagLevel: v.rule?.wcagLevel || 'best-practice',
      impact: v.rule?.impact || 'moderate',
      urlCount: v.rowCount,
      aiFixable: v.rule?.aiFixable || false
    }))
    .sort((a, b) => b.urlCount - a.urlCount);

  return rules.slice(0, limit);
}

/**
 * Format rule ID to readable name
 * @param {string} ruleId - Rule ID like 'images_require_alternate_text'
 * @returns {string} - Formatted name like 'Images Require Alternate Text'
 */
function formatRuleName(ruleId) {
  return ruleId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Export default with all functions
 */
export default {
  parseAccessibilityAll,
  parseViolationFile,
  parseViolationsSummary,
  parseAccessibilityFiles,
  convertToEngineFormat,
  getAccessibilitySummary,
  getWorstUrls,
  getTopViolationRules,
  ACCESSIBILITY_ALL_COLUMNS,
  VIOLATION_FILE_COLUMNS,
  SUMMARY_FILE_COLUMNS
};
