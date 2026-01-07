/**
 * Accessibility Export Service
 * Generates PDF compliance reports, Excel exports, and VPAT templates
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { getCriteriaByLevel, WCAG_PRINCIPLES } from '../../data/wcagCriteria';
import { COMPLIANCE_STATUS } from './accessibilityEngine';

/**
 * Generate PDF Accessibility Compliance Report
 */
export function exportAccessibilityPDF(auditResults, options = {}) {
  const {
    filename = 'accessibility-compliance-report.pdf',
    includeExecutiveSummary = true,
    includeViolations = true,
    includeWCAGMatrix = true,
    domainInfo = {}
  } = options;

  const { scores, summary, topIssues, criteriaStatus, timestamp } = auditResults;
  const doc = new jsPDF();
  let yPos = 20;

  const checkPageBreak = (neededSpace = 30) => {
    if (yPos + neededSpace > 280) {
      doc.addPage();
      yPos = 20;
    }
  };

  // ===== COVER PAGE =====
  doc.setFontSize(28);
  doc.setTextColor(88, 28, 135); // Purple
  doc.text('WCAG 2.2', 105, 60, { align: 'center' });
  doc.text('Accessibility Compliance Report', 105, 75, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(107, 114, 128);
  doc.text(domainInfo.domain || 'Website Audit', 105, 95, { align: 'center' });

  doc.setFontSize(12);
  doc.text(`Generated: ${new Date(timestamp).toLocaleDateString()}`, 105, 110, { align: 'center' });

  // Compliance Score Circle (simulated)
  const scoreColor = scores.overall >= 90 ? [34, 197, 94] :
                     scores.overall >= 70 ? [245, 158, 11] :
                     scores.overall >= 50 ? [249, 115, 22] : [239, 68, 68];

  doc.setFontSize(48);
  doc.setTextColor(...scoreColor);
  doc.text(`${scores.overall}%`, 105, 160, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(107, 114, 128);
  doc.text('Overall WCAG Compliance', 105, 175, { align: 'center' });

  // Level scores
  doc.setFontSize(12);
  yPos = 200;
  const levels = [
    { name: 'Level A', score: scores.byLevel.A.score, color: [34, 197, 94] },
    { name: 'Level AA', score: scores.byLevel.AA.score, color: [245, 158, 11] },
    { name: 'Level AAA', score: scores.byLevel.AAA.score, color: [139, 92, 246] }
  ];

  levels.forEach((level) => {
    doc.setTextColor(55, 65, 81);
    doc.text(`${level.name}:`, 60, yPos);
    doc.setTextColor(...level.color);
    doc.text(`${level.score}%`, 150, yPos, { align: 'right' });
    yPos += 10;
  });

  // ===== EXECUTIVE SUMMARY =====
  if (includeExecutiveSummary) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(20);
    doc.setTextColor(88, 28, 135);
    doc.text('Executive Summary', 14, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setTextColor(55, 65, 81);

    const summaryText = [
      `This report presents the accessibility compliance assessment of ${domainInfo.domain || 'the website'} `,
      `against WCAG 2.2 guidelines. The audit analyzed ${summary.totalUrls.toLocaleString()} pages and `,
      `identified ${summary.totalViolations.toLocaleString()} accessibility violations across `,
      `${summary.urlsWithViolations.toLocaleString()} pages.`
    ].join('');

    const summaryLines = doc.splitTextToSize(summaryText, 180);
    doc.text(summaryLines, 14, yPos);
    yPos += summaryLines.length * 5 + 10;

    // Key findings
    doc.setFontSize(14);
    doc.setTextColor(88, 28, 135);
    doc.text('Key Findings', 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);

    const findings = [
      `Overall WCAG 2.2 Compliance: ${scores.overall}%`,
      `Level A Compliance: ${scores.byLevel.A.score}% (${scores.byLevel.A.pass} of ${scores.byLevel.A.total} criteria passing)`,
      `Level AA Compliance: ${scores.byLevel.AA.score}% (${scores.byLevel.AA.pass} of ${scores.byLevel.AA.total} criteria passing)`,
      `Level AAA Compliance: ${scores.byLevel.AAA.score}% (${scores.byLevel.AAA.pass} of ${scores.byLevel.AAA.total} criteria passing)`,
      '',
      'Violations by Impact:',
      `  Critical: ${scores.byImpact.critical || 0}`,
      `  Serious: ${scores.byImpact.serious || 0}`,
      `  Moderate: ${scores.byImpact.moderate || 0}`,
      `  Minor: ${scores.byImpact.minor || 0}`
    ];

    findings.forEach(finding => {
      doc.text(finding, 14, yPos);
      yPos += 6;
    });

    yPos += 10;

    // POUR Principles
    doc.setFontSize(14);
    doc.setTextColor(88, 28, 135);
    doc.text('POUR Principles Analysis', 14, yPos);
    yPos += 8;

    doc.autoTable({
      startY: yPos,
      head: [['Principle', 'Score', 'Violations']],
      body: Object.entries(WCAG_PRINCIPLES).map(([key, name]) => [
        name,
        `${scores.byPrinciple[key]?.score || 0}%`,
        scores.byPrinciple[key]?.violations || 0
      ]),
      theme: 'striped',
      headStyles: { fillColor: [88, 28, 135] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 }
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // ===== TOP VIOLATIONS =====
  if (includeViolations && topIssues?.length > 0) {
    checkPageBreak(60);
    doc.setFontSize(20);
    doc.setTextColor(88, 28, 135);
    doc.text('Top Accessibility Violations', 14, yPos);
    yPos += 10;

    doc.autoTable({
      startY: yPos,
      head: [['Violation', 'Impact', 'WCAG Level', 'URLs Affected']],
      body: topIssues.slice(0, 15).map(issue => [
        issue.name,
        (issue.impact || 'unknown').toUpperCase(),
        issue.wcagLevel || 'Best Practice',
        issue.urlCount
      ]),
      theme: 'striped',
      headStyles: { fillColor: [88, 28, 135] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 }
      },
      didParseCell: function(data) {
        if (data.column.index === 1 && data.cell.section === 'body') {
          const impact = data.cell.raw?.toLowerCase();
          if (impact === 'critical') data.cell.styles.textColor = [239, 68, 68];
          else if (impact === 'serious') data.cell.styles.textColor = [249, 115, 22];
          else if (impact === 'moderate') data.cell.styles.textColor = [245, 158, 11];
        }
      }
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // ===== WCAG CRITERIA MATRIX =====
  if (includeWCAGMatrix) {
    doc.addPage();
    yPos = 20;

    doc.setFontSize(20);
    doc.setTextColor(88, 28, 135);
    doc.text('WCAG 2.2 Compliance Matrix', 14, yPos);
    yPos += 15;

    // Level A Criteria
    doc.setFontSize(14);
    doc.setTextColor(34, 197, 94);
    doc.text('Level A Criteria', 14, yPos);
    yPos += 8;

    const levelACriteria = getCriteriaByLevel('A');
    doc.autoTable({
      startY: yPos,
      head: [['ID', 'Criterion', 'Status']],
      body: levelACriteria.map(c => {
        const status = criteriaStatus[c.id] || 'not_tested';
        return [
          c.id,
          c.name,
          status === COMPLIANCE_STATUS.SUPPORTS ? 'PASS' :
          status === COMPLIANCE_STATUS.DOES_NOT_SUPPORT ? 'FAIL' :
          status === COMPLIANCE_STATUS.PARTIALLY_SUPPORTS ? 'PARTIAL' : 'NOT TESTED'
        ];
      }),
      theme: 'grid',
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 120 },
        2: { cellWidth: 30 }
      },
      didParseCell: function(data) {
        if (data.column.index === 2 && data.cell.section === 'body') {
          const status = data.cell.raw;
          if (status === 'PASS') data.cell.styles.textColor = [34, 197, 94];
          else if (status === 'FAIL') data.cell.styles.textColor = [239, 68, 68];
          else if (status === 'PARTIAL') data.cell.styles.textColor = [245, 158, 11];
        }
      }
    });

    yPos = doc.lastAutoTable.finalY + 15;
    checkPageBreak(60);

    // Level AA Criteria
    doc.setFontSize(14);
    doc.setTextColor(245, 158, 11);
    doc.text('Level AA Criteria', 14, yPos);
    yPos += 8;

    const levelAACriteria = getCriteriaByLevel('AA');
    doc.autoTable({
      startY: yPos,
      head: [['ID', 'Criterion', 'Status']],
      body: levelAACriteria.map(c => {
        const status = criteriaStatus[c.id] || 'not_tested';
        return [
          c.id,
          c.name,
          status === COMPLIANCE_STATUS.SUPPORTS ? 'PASS' :
          status === COMPLIANCE_STATUS.DOES_NOT_SUPPORT ? 'FAIL' :
          status === COMPLIANCE_STATUS.PARTIALLY_SUPPORTS ? 'PARTIAL' : 'NOT TESTED'
        ];
      }),
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] },
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 120 },
        2: { cellWidth: 30 }
      },
      didParseCell: function(data) {
        if (data.column.index === 2 && data.cell.section === 'body') {
          const status = data.cell.raw;
          if (status === 'PASS') data.cell.styles.textColor = [34, 197, 94];
          else if (status === 'FAIL') data.cell.styles.textColor = [239, 68, 68];
          else if (status === 'PARTIAL') data.cell.styles.textColor = [245, 158, 11];
        }
      }
    });
  }

  // Footer on each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2, 290, { align: 'center' });
    doc.text('WCAG 2.2 Accessibility Compliance Report - Generated by Content Strategy Portal', doc.internal.pageSize.width / 2, 295, { align: 'center' });
  }

  doc.save(filename);
}

/**
 * Export accessibility audit to Excel
 */
export async function exportAccessibilityExcel(auditResults, options = {}) {
  const {
    filename = 'accessibility-audit.xlsx',
    domainInfo = {}
  } = options;

  const { scores, summary, worstPages, criteriaStatus, timestamp, violationsByRule } = auditResults;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Content Strategy Portal';
  wb.created = new Date();

  // ===== SUMMARY SHEET =====
  const summaryWs = wb.addWorksheet('Summary');
  const summaryData = [
    ['WCAG 2.2 Accessibility Audit Report'],
    ['Domain', domainInfo.domain || 'N/A'],
    ['Generated', new Date(timestamp).toLocaleString()],
    [],
    ['COMPLIANCE SCORES'],
    ['Overall Score', `${scores.overall}%`],
    ['Level A Score', `${scores.byLevel.A.score}%`],
    ['Level AA Score', `${scores.byLevel.AA.score}%`],
    ['Level AAA Score', `${scores.byLevel.AAA.score}%`],
    [],
    ['SUMMARY STATISTICS'],
    ['Total URLs Analyzed', summary.totalUrls],
    ['URLs with Violations', summary.urlsWithViolations],
    ['Total Violations', summary.totalViolations],
    [],
    ['VIOLATIONS BY IMPACT'],
    ['Critical', scores.byImpact.critical || 0],
    ['Serious', scores.byImpact.serious || 0],
    ['Moderate', scores.byImpact.moderate || 0],
    ['Minor', scores.byImpact.minor || 0],
    [],
    ['POUR PRINCIPLES'],
    ['Perceivable', `${scores.byPrinciple.perceivable?.score || 0}%`],
    ['Operable', `${scores.byPrinciple.operable?.score || 0}%`],
    ['Understandable', `${scores.byPrinciple.understandable?.score || 0}%`],
    ['Robust', `${scores.byPrinciple.robust?.score || 0}%`]
  ];
  summaryData.forEach(row => summaryWs.addRow(row));
  summaryWs.getColumn(1).width = 25;
  summaryWs.getColumn(2).width = 30;
  summaryWs.getRow(1).font = { bold: true, size: 14 };

  // ===== VIOLATIONS SHEET =====
  const violationsData = Object.values(violationsByRule).map(v => ({
    'Rule ID': v.id,
    'Violation Name': v.name,
    'Impact': v.impact,
    'WCAG Level': v.wcagLevel || 'Best Practice',
    'WCAG Criteria': v.wcagCriteria?.join(', ') || '',
    'URLs Affected': v.urlCount,
    'AI Fixable': v.aiFixable ? 'Yes' : 'No',
    'Fix Suggestion': v.fixSuggestion || ''
  }));

  if (violationsData.length > 0) {
    const violationsWs = wb.addWorksheet('Violations');
    const violationHeaders = ['Rule ID', 'Violation Name', 'Impact', 'WCAG Level', 'WCAG Criteria', 'URLs Affected', 'AI Fixable', 'Fix Suggestion'];
    violationsWs.addRow(violationHeaders);
    violationsWs.getRow(1).font = { bold: true };
    violationsData.forEach(v => violationsWs.addRow(Object.values(v)));
    violationsWs.columns = [
      { width: 30 }, { width: 40 }, { width: 12 }, { width: 12 },
      { width: 20 }, { width: 12 }, { width: 10 }, { width: 60 }
    ];
  }

  // ===== PAGES SHEET =====
  if (worstPages?.length > 0) {
    const pagesWs = wb.addWorksheet('Pages');
    const pageHeaders = ['URL', 'Total Violations', 'Level A', 'Level AA', 'Level AAA', 'Best Practice'];
    pagesWs.addRow(pageHeaders);
    pagesWs.getRow(1).font = { bold: true };
    worstPages.forEach(p => {
      pagesWs.addRow([p.address, p.totalViolations, p.levelA, p.levelAA, p.levelAAA, p.bestPractice]);
    });
    pagesWs.columns = [
      { width: 70 }, { width: 15 }, { width: 10 }, { width: 10 }, { width: 10 }, { width: 15 }
    ];
  }

  // ===== WCAG CRITERIA SHEET =====
  const criteriaWs = wb.addWorksheet('WCAG Criteria');
  const criteriaHeaders = ['Criterion ID', 'Name', 'Level', 'Principle', 'Status', 'Automation'];
  criteriaWs.addRow(criteriaHeaders);
  criteriaWs.getRow(1).font = { bold: true };

  ['A', 'AA', 'AAA'].forEach(level => {
    getCriteriaByLevel(level).forEach(c => {
      const status = criteriaStatus[c.id] || 'not_tested';
      criteriaWs.addRow([
        c.id,
        c.name,
        level,
        WCAG_PRINCIPLES[c.principle] || c.principle,
        status === COMPLIANCE_STATUS.SUPPORTS ? 'Supports' :
        status === COMPLIANCE_STATUS.DOES_NOT_SUPPORT ? 'Does Not Support' :
        status === COMPLIANCE_STATUS.PARTIALLY_SUPPORTS ? 'Partially Supports' : 'Not Tested',
        c.automation || 'manual'
      ]);
    });
  });

  criteriaWs.columns = [
    { width: 12 }, { width: 50 }, { width: 8 }, { width: 18 }, { width: 20 }, { width: 12 }
  ];

  // Write file and download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate VPAT (Voluntary Product Accessibility Template) Report
 * Based on Section 508 / WCAG 2.2 template
 */
export async function exportVPAT(auditResults, options = {}) {
  const {
    filename = 'vpat-accessibility-conformance-report.xlsx',
    productName = 'Website',
    productVersion = '1.0',
    vendorName = '',
    contactInfo = '',
    domainInfo = {}
  } = options;

  const { scores, criteriaStatus, timestamp } = auditResults;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Content Strategy Portal';
  wb.created = new Date();

  // ===== ABOUT SHEET =====
  const aboutWs = wb.addWorksheet('About');
  const aboutData = [
    ['Voluntary Product Accessibility Template (VPAT)'],
    ['WCAG 2.2 Edition'],
    [],
    ['Product Information'],
    ['Product Name', productName],
    ['Product Version', productVersion],
    ['Product URL', domainInfo.domain || ''],
    ['Vendor Name', vendorName],
    ['Contact', contactInfo],
    ['Report Date', new Date(timestamp).toLocaleDateString()],
    [],
    ['Evaluation Methods'],
    ['Testing Tools', 'Axe-core accessibility testing engine via Screaming Frog'],
    ['Testing Date', new Date(timestamp).toLocaleDateString()],
    [],
    ['Conformance Level Summary'],
    ['Level A', `${scores.byLevel.A.score}% (${scores.byLevel.A.pass}/${scores.byLevel.A.total} criteria)`],
    ['Level AA', `${scores.byLevel.AA.score}% (${scores.byLevel.AA.pass}/${scores.byLevel.AA.total} criteria)`],
    ['Level AAA', `${scores.byLevel.AAA.score}% (${scores.byLevel.AAA.pass}/${scores.byLevel.AAA.total} criteria)`]
  ];
  aboutData.forEach(row => aboutWs.addRow(row));
  aboutWs.getColumn(1).width = 25;
  aboutWs.getColumn(2).width = 60;
  aboutWs.getRow(1).font = { bold: true, size: 14 };

  // ===== WCAG 2.2 REPORT SHEET =====
  const vpatWs = wb.addWorksheet('WCAG 2.2 Report');

  // Map status to VPAT conformance levels
  const getConformanceLevel = (status) => {
    switch (status) {
      case COMPLIANCE_STATUS.SUPPORTS: return 'Supports';
      case COMPLIANCE_STATUS.PARTIALLY_SUPPORTS: return 'Partially Supports';
      case COMPLIANCE_STATUS.DOES_NOT_SUPPORT: return 'Does Not Support';
      default: return 'Not Evaluated';
    }
  };

  // Add header rows
  vpatWs.addRow(['WCAG 2.2 Report']);
  vpatWs.addRow([]);
  vpatWs.addRow(['Note: Complete accessibility conformance requires manual testing in addition to automated testing.']);
  vpatWs.addRow([]);
  const headerRow = vpatWs.addRow(['Criteria', 'Conformance Level', 'Evaluation Status', 'Remarks and Explanations']);
  headerRow.font = { bold: true };
  vpatWs.getRow(1).font = { bold: true, size: 14 };

  // Add all WCAG criteria
  ['A', 'AA', 'AAA'].forEach(level => {
    const sectionRow = vpatWs.addRow([`--- Level ${level} ---`, '', '', '']);
    sectionRow.font = { bold: true };
    getCriteriaByLevel(level).forEach(c => {
      const status = criteriaStatus[c.id];
      const conformance = getConformanceLevel(status);
      const remarks = c.automation === 'manual' ?
        'Requires manual testing for full evaluation' :
        (status === COMPLIANCE_STATUS.DOES_NOT_SUPPORT ? 'Violations detected - remediation required' : '');

      vpatWs.addRow([
        `${c.id} ${c.name}`,
        conformance,
        c.automation || 'automated',
        remarks
      ]);
    });
  });

  vpatWs.columns = [
    { width: 50 }, { width: 20 }, { width: 15 }, { width: 50 }
  ];

  // ===== LEGAL DISCLAIMER =====
  const legalWs = wb.addWorksheet('Legal');
  const legalData = [
    ['Legal Disclaimer'],
    [],
    ['This Voluntary Product Accessibility Template (VPAT) is provided for informational purposes.'],
    ['The conformance claims made in this document are based on automated accessibility testing.'],
    ['Full WCAG 2.2 conformance requires additional manual testing and evaluation.'],
    [],
    ['Automated testing can identify approximately 30-40% of potential accessibility issues.'],
    ['Manual testing by accessibility experts and users with disabilities is recommended.'],
    [],
    ['Conformance Terminology:'],
    ['Supports', 'The functionality of the product has at least one method that meets the criterion without known defects or meets with equivalent facilitation.'],
    ['Partially Supports', 'Some functionality of the product does not meet the criterion.'],
    ['Does Not Support', 'The majority of product functionality does not meet the criterion.'],
    ['Not Applicable', 'The criterion is not relevant to the product.'],
    ['Not Evaluated', 'The product has not been evaluated against the criterion.']
  ];
  legalData.forEach(row => legalWs.addRow(row));
  legalWs.getColumn(1).width = 20;
  legalWs.getColumn(2).width = 100;
  legalWs.getRow(1).font = { bold: true, size: 14 };

  // Write file and download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export violations to CSV for quick import
 */
export function exportViolationsCSV(violationsByRule, filename = 'accessibility-violations.csv') {
  const data = Object.values(violationsByRule).map(v => ({
    'Rule ID': v.id,
    'Name': v.name,
    'Impact': v.impact,
    'WCAG Level': v.wcagLevel || 'Best Practice',
    'WCAG Criteria': v.wcagCriteria?.join('; ') || '',
    'URLs Affected': v.urlCount,
    'Fix Suggestion': v.fixSuggestion || ''
  }));

  // Helper to escape CSV values
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // Build CSV string
  const headers = ['Rule ID', 'Name', 'Impact', 'WCAG Level', 'WCAG Criteria', 'URLs Affected', 'Fix Suggestion'];
  const csvRows = [headers.join(',')];
  data.forEach(row => {
    const values = headers.map(h => escapeCSV(row[h]));
    csvRows.push(values.join(','));
  });
  const csv = csvRows.join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default {
  exportAccessibilityPDF,
  exportAccessibilityExcel,
  exportVPAT,
  exportViolationsCSV
};
