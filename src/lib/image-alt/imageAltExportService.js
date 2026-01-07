/**
 * Image Alt Text Export Service
 * Generates Excel reports and processes images with embedded metadata
 */

import ExcelJS from 'exceljs';
import JSZip from 'jszip';

/**
 * Export results to Excel
 */
export async function exportToExcel(results, options = {}) {
  const { filename = 'image-alt-text-report.xlsx' } = options;

  // Create workbook
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Content Strategy Portal';
  wb.created = new Date();

  // Sheet 1: Alt Text Results
  const ws1 = wb.addWorksheet('Alt Text Results');
  const resultHeaders = ['#', 'Original Filename', 'New Filename', 'Alt Text', 'Character Count', 'Decorative', 'Detected Elements', 'Confidence', 'File Size (KB)', 'Status'];
  ws1.addRow(resultHeaders);
  ws1.getRow(1).font = { bold: true };

  results.forEach((r, idx) => {
    ws1.addRow([
      idx + 1,
      r.original_filename,
      r.filename,
      r.alt_text,
      r.alt_text?.length || 0,
      r.is_decorative ? 'Yes' : 'No',
      r.detected_elements?.join(', ') || '',
      `${Math.round((r.confidence || 0) * 100)}%`,
      Math.round((r.file_size || 0) / 1024),
      r.error ? `Error: ${r.error}` : 'Success'
    ]);
  });

  // Set column widths
  ws1.columns = [
    { width: 5 },   // #
    { width: 30 },  // Original Filename
    { width: 30 },  // New Filename
    { width: 60 },  // Alt Text
    { width: 12 },  // Char Count
    { width: 10 },  // Decorative
    { width: 40 },  // Detected Elements
    { width: 12 },  // Confidence
    { width: 12 },  // File Size
    { width: 20 }   // Status
  ];

  // Sheet 2: Summary
  const successCount = results.filter(r => !r.error).length;
  const decorativeCount = results.filter(r => r.is_decorative).length;
  const avgLength = results.reduce((sum, r) => sum + (r.alt_text?.length || 0), 0) / results.length;
  const overLimitCount = results.filter(r => (r.alt_text?.length || 0) > 125).length;

  const ws2 = wb.addWorksheet('Summary');
  ws2.addRow(['Metric', 'Value']);
  ws2.getRow(1).font = { bold: true };

  const summaryData = [
    ['Total Images', results.length],
    ['Successfully Processed', successCount],
    ['Failed', results.length - successCount],
    ['Decorative Images', decorativeCount],
    ['Average Alt Text Length', Math.round(avgLength)],
    ['Over 125 Characters', overLimitCount],
    ['Generated On', new Date().toLocaleString()]
  ];
  summaryData.forEach(row => ws2.addRow(row));

  ws2.getColumn(1).width = 25;
  ws2.getColumn(2).width = 30;

  // Generate and download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

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
async function embedExifData(file, _altText) {
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

  await exportToExcel(results, {
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
