/**
 * Image Alt Text Export Service
 * Generates Excel reports and processes images with embedded metadata
 */

import * as XLSX from 'xlsx';
import JSZip from 'jszip';

/**
 * Export results to Excel
 */
export function exportToExcel(results, options = {}) {
  const { filename = 'image-alt-text-report.xlsx' } = options;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Alt Text Results
  const resultsData = results.map((r, idx) => ({
    '#': idx + 1,
    'Original Filename': r.original_filename,
    'New Filename': r.filename,
    'Alt Text': r.alt_text,
    'Character Count': r.alt_text?.length || 0,
    'Decorative': r.is_decorative ? 'Yes' : 'No',
    'Detected Elements': r.detected_elements?.join(', ') || '',
    'Confidence': `${Math.round((r.confidence || 0) * 100)}%`,
    'File Size (KB)': Math.round((r.file_size || 0) / 1024),
    'Status': r.error ? `Error: ${r.error}` : 'Success'
  }));

  const ws1 = XLSX.utils.json_to_sheet(resultsData);

  // Set column widths
  ws1['!cols'] = [
    { wch: 5 },   // #
    { wch: 30 },  // Original Filename
    { wch: 30 },  // New Filename
    { wch: 60 },  // Alt Text
    { wch: 12 },  // Char Count
    { wch: 10 },  // Decorative
    { wch: 40 },  // Detected Elements
    { wch: 12 },  // Confidence
    { wch: 12 },  // File Size
    { wch: 20 }   // Status
  ];

  XLSX.utils.book_append_sheet(wb, ws1, 'Alt Text Results');

  // Sheet 2: Summary
  const successCount = results.filter(r => !r.error).length;
  const decorativeCount = results.filter(r => r.is_decorative).length;
  const avgLength = results.reduce((sum, r) => sum + (r.alt_text?.length || 0), 0) / results.length;
  const overLimitCount = results.filter(r => (r.alt_text?.length || 0) > 125).length;

  const summaryData = [
    { Metric: 'Total Images', Value: results.length },
    { Metric: 'Successfully Processed', Value: successCount },
    { Metric: 'Failed', Value: results.length - successCount },
    { Metric: 'Decorative Images', Value: decorativeCount },
    { Metric: 'Average Alt Text Length', Value: Math.round(avgLength) },
    { Metric: 'Over 125 Characters', Value: overLimitCount },
    { Metric: 'Generated On', Value: new Date().toLocaleString() }
  ];

  const ws2 = XLSX.utils.json_to_sheet(summaryData);
  ws2['!cols'] = [{ wch: 25 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

  // Generate and download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  downloadBlob(blob, filename);
}

/**
 * Export processed images as ZIP with new filenames and metadata
 */
export async function exportImagesAsZip(results, options = {}) {
  const { filename = 'processed-images.zip', embedMetadata = true } = options;

  const zip = new JSZip();

  for (const result of results) {
    if (!result.file || result.error) continue;

    try {
      let fileData;

      if (embedMetadata && (result.file.type === 'image/jpeg' || result.file.type === 'image/jpg')) {
        // For JPEG, we can embed EXIF data
        fileData = await embedExifData(result.file, result.alt_text);
      } else {
        // For other formats, just use original file
        fileData = await result.file.arrayBuffer();
      }

      // Use new filename
      zip.file(result.filename, fileData);
    } catch (e) {
      console.error(`Failed to process ${result.original_filename}:`, e);
      // Add original file if processing fails
      const buffer = await result.file.arrayBuffer();
      zip.file(result.filename, buffer);
    }
  }

  // Generate ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, filename);
}

/**
 * Embed EXIF data in JPEG image
 * Note: This is a simplified version - full EXIF manipulation would require piexifjs
 */
async function embedExifData(file, altText) {
  // For now, return original file data
  // Full EXIF embedding would require additional library like piexifjs
  return await file.arrayBuffer();
}

/**
 * Export both Excel and Images
 */
export async function exportAll(results, options = {}) {
  const { excelFilename, zipFilename, domainInfo } = options;

  const dateStr = new Date().toISOString().split('T')[0];
  const prefix = domainInfo?.domain || 'batch';

  exportToExcel(results, {
    filename: excelFilename || `${prefix}-alt-text-${dateStr}.xlsx`
  });

  await exportImagesAsZip(results, {
    filename: zipFilename || `${prefix}-images-${dateStr}.zip`
  });
}

/**
 * Download blob helper
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export as CSV
 */
export function exportToCSV(results, options = {}) {
  const { filename = 'image-alt-text.csv' } = options;

  const headers = ['Original Filename', 'New Filename', 'Alt Text', 'Character Count', 'Decorative'];
  const rows = results.map(r => [
    r.original_filename,
    r.filename,
    `"${(r.alt_text || '').replace(/"/g, '""')}"`,
    r.alt_text?.length || 0,
    r.is_decorative ? 'Yes' : 'No'
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

export default {
  exportToExcel,
  exportImagesAsZip,
  exportAll,
  exportToCSV
};
