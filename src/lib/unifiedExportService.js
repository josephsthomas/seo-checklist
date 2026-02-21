/**
 * Unified Export Service
 * Centralizes all export functionality across the application
 */

// Dynamic imports for bundle size optimization — jsPDF, ExcelJS, JSZip loaded on demand

/**
 * Download helper
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.setAttribute('aria-hidden', 'true');
  a.style.display = 'none';
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
export async function exportToExcel(data, options = {}) {
  const {
    filename = 'export.xlsx',
    sheets = [{ name: 'Data', data }],
    columnWidths = {}
  } = options;

  const { default: ExcelJS } = await import('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Content Strategy Portal';
  wb.created = new Date();

  sheets.forEach(sheet => {
    const ws = wb.addWorksheet(sheet.name);

    if (sheet.data.length > 0) {
      // Add headers from first row keys
      const headers = Object.keys(sheet.data[0]);
      ws.addRow(headers);
      ws.getRow(1).font = { bold: true };

      // Add data rows
      sheet.data.forEach(row => {
        ws.addRow(headers.map(h => row[h]));
      });

      // Apply column widths if provided
      if (columnWidths[sheet.name]) {
        columnWidths[sheet.name].forEach((width, index) => {
          ws.getColumn(index + 1).width = width;
        });
      }
    }
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
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
export async function exportToPDF(options = {}) {
  const {
    filename = 'export.pdf',
    title = 'Export Report',
    content = [],
    tables = [],
    orientation = 'portrait'
  } = options;

  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');
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

  const { default: JSZip } = await import('jszip');
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
        const { default: ExcelJS } = await import('exceljs');
        const wb = new ExcelJS.Workbook();
        wb.creator = 'Content Strategy Portal';
        const ws = wb.addWorksheet('Data');

        if (item.data.length > 0) {
          const headers = Object.keys(item.data[0]);
          ws.addRow(headers);
          ws.getRow(1).font = { bold: true };
          item.data.forEach(row => {
            ws.addRow(headers.map(h => row[h]));
          });
        }

        const buffer = await wb.xlsx.writeBuffer();
        files.push({
          name: item.filename || `${item.id}.xlsx`,
          type: 'blob',
          content: new Blob([buffer])
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
