/**
 * Export Service for Technical Audit Reports
 * Generates PDF and Excel exports of audit results
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { SEVERITY } from './auditEngine';

/**
 * Generate PDF report from audit results
 */
export function exportToPDF(auditResults, options = {}) {
  const {
    filename = 'seo-audit-report.pdf',
    includeDetails = true,
    includeSummary = true
  } = options;

  const doc = new jsPDF();
  let yPos = 20;

  // Helper to add page break if needed
  const checkPageBreak = (neededSpace = 30) => {
    if (yPos + neededSpace > 280) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Title
  doc.setFontSize(24);
  doc.setTextColor(17, 24, 39);
  doc.text('SEO Technical Audit Report', 14, yPos);
  yPos += 10;

  // Date
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, yPos);
  yPos += 15;

  if (includeSummary && auditResults.summary) {
    // Health Score
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text('Health Score', 14, yPos);
    yPos += 8;

    const score = auditResults.summary.healthScore;
    const scoreColor = score >= 80 ? [34, 197, 94] : score >= 60 ? [245, 158, 11] : [239, 68, 68];

    doc.setFontSize(36);
    doc.setTextColor(...scoreColor);
    doc.text(`${score}`, 14, yPos + 10);
    doc.setFontSize(16);
    doc.text('/100', 42, yPos + 10);
    yPos += 20;

    // Summary Stats
    doc.setFontSize(12);
    doc.setTextColor(17, 24, 39);

    const stats = [
      { label: 'Total Issues', value: auditResults.issues?.length || 0 },
      { label: 'Errors', value: auditResults.summary.errors || 0, color: [239, 68, 68] },
      { label: 'Warnings', value: auditResults.summary.warnings || 0, color: [245, 158, 11] },
      { label: 'Info', value: auditResults.summary.info || 0, color: [59, 130, 246] },
      { label: 'URLs Analyzed', value: auditResults.summary.urlsAnalyzed || 0 }
    ];

    yPos += 5;
    stats.forEach(stat => {
      if (stat.color) {
        doc.setTextColor(...stat.color);
      } else {
        doc.setTextColor(107, 114, 128);
      }
      doc.text(`${stat.label}: ${stat.value}`, 14, yPos);
      yPos += 7;
    });

    yPos += 10;
  }

  if (includeDetails && auditResults.issues?.length > 0) {
    checkPageBreak(40);

    // Issues Table Header
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text('Issues Found', 14, yPos);
    yPos += 10;

    // Group issues by severity
    const groupedIssues = {
      errors: auditResults.issues.filter(i => i.severity === SEVERITY.ERROR),
      warnings: auditResults.issues.filter(i => i.severity === SEVERITY.WARNING),
      info: auditResults.issues.filter(i => i.severity === SEVERITY.INFO)
    };

    // Errors section
    if (groupedIssues.errors.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setTextColor(239, 68, 68);
      doc.text(`Errors (${groupedIssues.errors.length})`, 14, yPos);
      yPos += 5;

      doc.autoTable({
        startY: yPos,
        head: [['Issue', 'Category', 'Priority', 'Affected URLs']],
        body: groupedIssues.errors.map(issue => [
          issue.title,
          issue.category,
          (issue.priority || 'could').toUpperCase(),
          issue.affectedUrls?.length || 0
        ]),
        theme: 'striped',
        headStyles: { fillColor: [239, 68, 68] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9, cellPadding: 3 }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Warnings section
    if (groupedIssues.warnings.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setTextColor(245, 158, 11);
      doc.text(`Warnings (${groupedIssues.warnings.length})`, 14, yPos);
      yPos += 5;

      doc.autoTable({
        startY: yPos,
        head: [['Issue', 'Category', 'Priority', 'Affected URLs']],
        body: groupedIssues.warnings.map(issue => [
          issue.title,
          issue.category,
          (issue.priority || 'could').toUpperCase(),
          issue.affectedUrls?.length || 0
        ]),
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9, cellPadding: 3 }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Info section
    if (groupedIssues.info.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setTextColor(59, 130, 246);
      doc.text(`Information (${groupedIssues.info.length})`, 14, yPos);
      yPos += 5;

      doc.autoTable({
        startY: yPos,
        head: [['Issue', 'Category', 'Priority', 'Affected URLs']],
        body: groupedIssues.info.map(issue => [
          issue.title,
          issue.category,
          (issue.priority || 'could').toUpperCase(),
          issue.affectedUrls?.length || 0
        ]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9, cellPadding: 3 }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    }

    // Detailed issue breakdown
    checkPageBreak(40);
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text('Issue Details', 14, yPos);
    yPos += 10;

    auditResults.issues.forEach((issue, index) => {
      checkPageBreak(50);

      // Issue header
      const severityColor = issue.severity === SEVERITY.ERROR ? [239, 68, 68] :
                           issue.severity === SEVERITY.WARNING ? [245, 158, 11] : [59, 130, 246];

      doc.setFontSize(11);
      doc.setTextColor(...severityColor);
      doc.text(`${index + 1}. ${issue.title}`, 14, yPos);
      yPos += 6;

      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`Category: ${issue.category} | Priority: ${(issue.priority || 'could').toUpperCase()} | Affected: ${issue.affectedUrls?.length || 0} URLs`, 14, yPos);
      yPos += 5;

      // Description
      doc.setTextColor(55, 65, 81);
      const descLines = doc.splitTextToSize(issue.description, 180);
      doc.text(descLines, 14, yPos);
      yPos += descLines.length * 4 + 3;

      // Recommendation
      doc.setTextColor(34, 197, 94);
      doc.text('Recommendation:', 14, yPos);
      yPos += 4;
      doc.setTextColor(55, 65, 81);
      const recLines = doc.splitTextToSize(issue.recommendation, 180);
      doc.text(recLines, 14, yPos);
      yPos += recLines.length * 4 + 8;
    });
  }

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, 290, { align: 'center' });
    doc.text('Generated by Content Strategy Portal', doc.internal.pageSize.width / 2, 295, { align: 'center' });
  }

  doc.save(filename);
}

/**
 * Export audit results to Excel
 */
export function exportToExcel(auditResults, urlData = [], options = {}) {
  const {
    filename = 'seo-audit-report.xlsx'
  } = options;

  const wb = XLSX.utils.book_new();

  // Summary sheet
  if (auditResults.summary) {
    const summaryData = [
      ['SEO Technical Audit Report'],
      ['Generated', new Date().toLocaleString()],
      [],
      ['Health Score', auditResults.summary.healthScore],
      ['Total Issues', auditResults.issues?.length || 0],
      ['Errors', auditResults.summary.errors || 0],
      ['Warnings', auditResults.summary.warnings || 0],
      ['Info', auditResults.summary.info || 0],
      ['URLs Analyzed', auditResults.summary.urlsAnalyzed || 0]
    ];

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  }

  // Issues sheet
  if (auditResults.issues?.length > 0) {
    const issuesData = auditResults.issues.map(issue => ({
      'Title': issue.title,
      'Severity': issue.severity,
      'Priority': issue.priority,
      'Category': issue.category,
      'Description': issue.description,
      'Recommendation': issue.recommendation,
      'Affected URLs': issue.affectedUrls?.length || 0,
      'Example URL': issue.affectedUrls?.[0] || ''
    }));

    const issuesWs = XLSX.utils.json_to_sheet(issuesData);
    issuesWs['!cols'] = [
      { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 20 },
      { wch: 60 }, { wch: 60 }, { wch: 15 }, { wch: 50 }
    ];
    XLSX.utils.book_append_sheet(wb, issuesWs, 'Issues');
  }

  // Affected URLs per issue
  if (auditResults.issues?.length > 0) {
    const affectedData = [];
    auditResults.issues.forEach(issue => {
      (issue.affectedUrls || []).forEach(url => {
        affectedData.push({
          'Issue': issue.title,
          'Severity': issue.severity,
          'URL': url
        });
      });
    });

    if (affectedData.length > 0) {
      const affectedWs = XLSX.utils.json_to_sheet(affectedData);
      affectedWs['!cols'] = [{ wch: 40 }, { wch: 10 }, { wch: 80 }];
      XLSX.utils.book_append_sheet(wb, affectedWs, 'Affected URLs');
    }
  }

  // URL Data sheet
  if (urlData?.length > 0) {
    const urlDataClean = urlData.map(row => ({
      'URL': row.address,
      'Status Code': row.statusCode,
      'Indexability': row.indexability,
      'Title': row.title1,
      'Title Length': row.title1Length,
      'Meta Description': row.metaDescription1,
      'Meta Desc Length': row.metaDescription1Length,
      'H1': row.h1,
      'Word Count': row.wordCount,
      'Crawl Depth': row.crawlDepth,
      'Inlinks': row.uniqueInlinks,
      'Outlinks': row.uniqueOutlinks,
      'Response Time': row.responseTime,
      'Size (bytes)': row.size,
      'Canonical': row.canonicalLinkElement1
    }));

    const urlWs = XLSX.utils.json_to_sheet(urlDataClean);
    urlWs['!cols'] = [
      { wch: 60 }, { wch: 12 }, { wch: 15 }, { wch: 40 }, { wch: 12 },
      { wch: 50 }, { wch: 15 }, { wch: 40 }, { wch: 12 }, { wch: 12 },
      { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 50 }
    ];
    XLSX.utils.book_append_sheet(wb, urlWs, 'URL Data');
  }

  // Category breakdown sheet
  if (auditResults.issues?.length > 0) {
    const categoryMap = {};
    auditResults.issues.forEach(issue => {
      if (!categoryMap[issue.category]) {
        categoryMap[issue.category] = { errors: 0, warnings: 0, info: 0, total: 0 };
      }
      categoryMap[issue.category].total++;
      if (issue.severity === SEVERITY.ERROR) categoryMap[issue.category].errors++;
      else if (issue.severity === SEVERITY.WARNING) categoryMap[issue.category].warnings++;
      else categoryMap[issue.category].info++;
    });

    const categoryData = Object.entries(categoryMap).map(([category, counts]) => ({
      'Category': category,
      'Errors': counts.errors,
      'Warnings': counts.warnings,
      'Info': counts.info,
      'Total': counts.total
    }));

    const categoryWs = XLSX.utils.json_to_sheet(categoryData);
    categoryWs['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, categoryWs, 'By Category');
  }

  XLSX.writeFile(wb, filename);
}

/**
 * Export issues list to CSV
 */
export function exportToCSV(issues, filename = 'audit-issues.csv') {
  if (!issues?.length) return;

  const csvData = issues.map(issue => ({
    'Title': issue.title,
    'Severity': issue.severity,
    'Priority': issue.priority,
    'Category': issue.category,
    'Description': issue.description,
    'Recommendation': issue.recommendation,
    'Affected URLs': issue.affectedUrls?.length || 0
  }));

  const ws = XLSX.utils.json_to_sheet(csvData);
  const csv = XLSX.utils.sheet_to_csv(ws);

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default {
  exportToPDF,
  exportToExcel,
  exportToCSV
};
