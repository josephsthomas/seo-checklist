/**
 * E-027: Export Hub Integration Adapter
 * Registers readability analyses with the portal's Export Hub
 * Supports batch selection and ZIP download
 */

import JSZip from 'jszip';

/**
 * Register a readability analysis with the Export Hub
 * @param {Object} analysis - Complete analysis document
 * @returns {Object} Export Hub registration object
 */
export function registerWithExportHub(analysis) {
  return {
    type: 'readability-analysis',
    id: analysis.id,
    title: analysis.pageTitle || analysis.sourceUrl || 'Untitled Analysis',
    description: `AI Readability Score: ${analysis.overallScore}/100 (${analysis.grade})`,
    createdAt: analysis.analyzedAt || analysis.createdAt,
    sourceUrl: analysis.sourceUrl,
    score: analysis.overallScore,
    grade: analysis.grade,
    exportFormats: ['pdf', 'json', 'csv'],
  };
}

/**
 * Create a ZIP file from multiple analysis exports
 * @param {Array} exports - Array of { filename, content, type } objects
 * @returns {Promise<Blob>} ZIP file as Blob
 */
export async function createBatchZip(exports) {
  const zip = new JSZip();

  for (const item of exports) {
    if (item.type === 'json') {
      zip.file(item.filename, JSON.stringify(item.content, null, 2));
    } else if (item.type === 'pdf') {
      zip.file(item.filename, item.content);
    } else if (item.type === 'csv') {
      zip.file(item.filename, item.content);
    } else {
      zip.file(item.filename, String(item.content));
    }
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Download a Blob as a file
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default { registerWithExportHub, createBatchZip, downloadBlob };
