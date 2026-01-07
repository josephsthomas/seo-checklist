/**
 * Unified Export Service
 * Centralizes all export functionality across the application
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

/**
 * Download helper
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
 * Generate timestamp for filenames
 */
function getTimestamp() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Export to Excel format
 */
export function exportToExcel(data, options = {}) {
  const {
    filename = 'export.xlsx',
    sheets = [{ name: 'Data', data }],
    columnWidths = {}
  } = options;

  const wb = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    const ws = XLSX.utils.json_to_sheet(sheet.data);

    // Apply column widths if provided
    if (columnWidths[sheet.name]) {
      ws['!cols'] = columnWidths[sheet.name].map(w => ({ wch: w }));
    }

    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  downloadBlob(blob, filename);
  return { success: true, size: blob.size };
}

/**
 * Export to CSV format
 */
export function exportToCSV(data, options = {}) {
  const { filename = 'export.csv', headers } = options;

  const headerRow = headers || Object.keys(data[0] || {});
  const rows = data.map(item =>
    headerRow.map(key => {
      const value = item[key];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',')
  );

  const csv = [headerRow.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  downloadBlob(blob, filename);
  return { success: true, size: blob.size };
}

/**
 * Export to JSON format
 */
export function exportToJSON(data, options = {}) {
  const { filename = 'export.json', pretty = true } = options;

  const json = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  const blob = new Blob([json], { type: 'application/json' });

  downloadBlob(blob, filename);
  return { success: true, size: blob.size };
}

/**
 * Export to PDF format
 */
export function exportToPDF(options = {}) {
  const {
    filename = 'export.pdf',
    title = 'Export Report',
    content = [],
    tables = [],
    orientation = 'portrait'
  } = options;

  const doc = new jsPDF({ orientation });
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39);
  doc.text(title, 14, yPos);
  yPos += 10;

  // Timestamp
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, yPos);
  yPos += 15;

  // Content sections
  content.forEach(section => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    if (section.type === 'heading') {
      doc.setFontSize(14);
      doc.setTextColor(17, 24, 39);
      doc.text(section.text, 14, yPos);
      yPos += 8;
    } else if (section.type === 'text') {
      doc.setFontSize(10);
      doc.setTextColor(75, 85, 99);
      const lines = doc.splitTextToSize(section.text, 180);
      doc.text(lines, 14, yPos);
      yPos += lines.length * 5 + 5;
    } else if (section.type === 'stat') {
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.text(`${section.label}: `, 14, yPos);
      doc.setTextColor(0, 102, 255);
      doc.text(String(section.value), 14 + doc.getTextWidth(`${section.label}: `), yPos);
      yPos += 7;
    }
  });

  // Tables
  tables.forEach(table => {
    if (yPos > 200) {
      doc.addPage();
      yPos = 20;
    }

    if (table.title) {
      doc.setFontSize(12);
      doc.setTextColor(17, 24, 39);
      doc.text(table.title, 14, yPos);
      yPos += 8;
    }

    doc.autoTable({
      startY: yPos,
      head: [table.headers],
      body: table.rows,
      theme: 'striped',
      headStyles: { fillColor: [17, 24, 39] },
      styles: { fontSize: 8 },
      margin: { left: 14, right: 14 }
    });

    yPos = doc.lastAutoTable.finalY + 15;
  });

  doc.save(filename);
  return { success: true, pages: doc.getNumberOfPages() };
}

/**
 * Export to ZIP format (multiple files)
 */
export async function exportToZip(files, options = {}) {
  const { filename = 'export.zip' } = options;

  const zip = new JSZip();

  for (const file of files) {
    if (file.type === 'text') {
      zip.file(file.name, file.content);
    } else if (file.type === 'blob') {
      zip.file(file.name, file.content);
    } else if (file.type === 'json') {
      zip.file(file.name, JSON.stringify(file.content, null, 2));
    }
  }

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, filename);

  return { success: true, size: content.size, fileCount: files.length };
}

/**
 * Batch export multiple items
 */
export async function batchExport(items, format, options = {}) {
  const { zipFilename } = options;
  const results = [];
  const files = [];

  for (const item of items) {
    try {
      if (format === 'xlsx') {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(item.data);
        XLSX.utils.book_append_sheet(wb, ws, 'Data');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        files.push({
          name: item.filename || `${item.id}.xlsx`,
          type: 'blob',
          content: new Blob([wbout])
        });
      } else if (format === 'json') {
        files.push({
          name: item.filename || `${item.id}.json`,
          type: 'json',
          content: item.data
        });
      } else if (format === 'csv') {
        const headers = Object.keys(item.data[0] || {});
        const rows = item.data.map(row =>
          headers.map(h => row[h] ?? '').join(',')
        );
        const csv = [headers.join(','), ...rows].join('\n');
        files.push({
          name: item.filename || `${item.id}.csv`,
          type: 'text',
          content: csv
        });
      }

      results.push({ id: item.id, success: true });
    } catch (error) {
      results.push({ id: item.id, success: false, error: error.message });
    }
  }

  if (files.length > 0) {
    await exportToZip(files, {
      filename: zipFilename || `batch-export-${getTimestamp()}.zip`
    });
  }

  return {
    success: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results
  };
}

/**
 * Export checklist progress
 */
export function exportChecklistProgress(project, items, format = 'pdf') {
  const timestamp = getTimestamp();
  const filename = `${project.name.replace(/\s+/g, '-').toLowerCase()}-checklist-${timestamp}`;

  const completedItems = items.filter(i => i.completed);
  const progress = items.length > 0 ? Math.round((completedItems.length / items.length) * 100) : 0;

  if (format === 'pdf') {
    return exportToPDF({
      filename: `${filename}.pdf`,
      title: `${project.name} - SEO Checklist Progress`,
      content: [
        { type: 'stat', label: 'Overall Progress', value: `${progress}%` },
        { type: 'stat', label: 'Completed Items', value: `${completedItems.length}/${items.length}` },
        { type: 'stat', label: 'Project Status', value: project.status || 'In Progress' }
      ],
      tables: [{
        title: 'Checklist Items',
        headers: ['Item', 'Category', 'Priority', 'Status'],
        rows: items.map(item => [
          item.title,
          item.category || '-',
          item.priority || 'Medium',
          item.completed ? 'Completed' : 'Pending'
        ])
      }]
    });
  } else if (format === 'xlsx') {
    return exportToExcel({
      filename: `${filename}.xlsx`,
      sheets: [
        {
          name: 'Summary',
          data: [
            { Metric: 'Project Name', Value: project.name },
            { Metric: 'Progress', Value: `${progress}%` },
            { Metric: 'Completed', Value: completedItems.length },
            { Metric: 'Remaining', Value: items.length - completedItems.length },
            { Metric: 'Export Date', Value: new Date().toLocaleString() }
          ]
        },
        {
          name: 'Checklist Items',
          data: items.map(item => ({
            Item: item.title,
            Description: item.description || '',
            Category: item.category || '-',
            Priority: item.priority || 'Medium',
            Status: item.completed ? 'Completed' : 'Pending',
            'Completed Date': item.completedAt ? new Date(item.completedAt).toLocaleDateString() : '-'
          }))
        }
      ]
    });
  }
}

export default {
  exportToExcel,
  exportToCSV,
  exportToJSON,
  exportToPDF,
  exportToZip,
  batchExport,
  exportChecklistProgress
};
