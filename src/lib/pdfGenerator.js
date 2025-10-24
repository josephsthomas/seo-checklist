/**
 * PDF Generator for SEO Checklist
 * Creates professional PDFs for client reporting
 * Phase 9 - Batch 4
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Generate PDF from checklist data
 * @param {Object} options - PDF generation options
 * @returns {jsPDF} PDF document
 */
export function generateChecklistPDF(options) {
  const {
    items,
    completions = {},
    projectName = 'SEO Checklist',
    clientName = '',
    exportType = 'executive', // 'executive' or 'detailed'
    includeCompleted = true,
    logo = null,
    brandColor = '#2563eb'
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Helper to add new page if needed
  const checkAddPage = (requiredSpace = 30) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Helper to add page numbers
  const addPageNumbers = () => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  };

  // ===== COVER PAGE =====
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', 20, yPosition, 40, 20);
      yPosition += 30;
    } catch (error) {
      console.warn('Failed to add logo:', error);
    }
  }

  // Title
  doc.setFontSize(24);
  doc.setTextColor(40);
  doc.setFont('helvetica', 'bold');
  doc.text('SEO Checklist Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Project name
  doc.setFontSize(16);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text(projectName, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Client name
  if (clientName) {
    doc.setFontSize(12);
    doc.setTextColor(120);
    doc.text(`Client: ${clientName}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  }

  // Date
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(
    `Generated: ${format(new Date(), 'MMMM d, yyyy')}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' }
  );
  yPosition += 30;

  // ===== EXECUTIVE SUMMARY =====
  const completedCount = items.filter(item => completions[item.id]).length;
  const completionRate = Math.round((completedCount / items.length) * 100);

  doc.setFontSize(16);
  doc.setTextColor(40);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, yPosition);
  yPosition += 10;

  // Summary stats
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60);

  const summaryData = [
    ['Total Items', items.length.toString()],
    ['Completed', `${completedCount} (${completionRate}%)`],
    ['Remaining', `${items.length - completedCount}`],
    ['Completion Rate', `${completionRate}%`]
  ];

  doc.autoTable({
    startY: yPosition,
    head: [],
    body: summaryData,
    theme: 'plain',
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 60 },
      1: { cellWidth: 40 }
    },
    margin: { left: 20 }
  });

  yPosition = doc.lastAutoTable.finalY + 15;

  // Completion by phase
  checkAddPage(40);
  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.setFont('helvetica', 'bold');
  doc.text('Progress by Phase', 20, yPosition);
  yPosition += 10;

  const phases = [...new Set(items.map(item => item.phase))];
  const phaseData = phases.map(phase => {
    const phaseItems = items.filter(item => item.phase === phase);
    const phaseCompleted = phaseItems.filter(item => completions[item.id]).length;
    const phaseRate = Math.round((phaseCompleted / phaseItems.length) * 100);
    return [
      phase,
      phaseItems.length.toString(),
      phaseCompleted.toString(),
      `${phaseRate}%`
    ];
  });

  doc.autoTable({
    startY: yPosition,
    head: [['Phase', 'Total', 'Completed', '% Complete']],
    body: phaseData,
    theme: 'grid',
    headStyles: {
      fillColor: [37, 99, 235], // blue-600
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [243, 244, 246] }, // gray-100
    margin: { left: 20, right: 20 }
  });

  yPosition = doc.lastAutoTable.finalY + 20;

  // ===== CHECKLIST ITEMS =====
  if (exportType === 'detailed') {
    doc.addPage();
    yPosition = 20;

    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Checklist', 20, yPosition);
    yPosition += 10;

    // Filter items if needed
    const exportItems = includeCompleted
      ? items
      : items.filter(item => !completions[item.id]);

    // Group by phase
    phases.forEach((phase, index) => {
      if (index > 0) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.setFont('helvetica', 'bold');
      doc.text(phase, 20, yPosition);
      yPosition += 5;

      const phaseItems = exportItems.filter(item => item.phase === phase);

      if (phaseItems.length === 0) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150);
        doc.text('No items in this phase', 25, yPosition + 5);
        yPosition += 15;
        return;
      }

      const tableData = phaseItems.map(item => [
        item.id.toString(),
        item.priority,
        completions[item.id] ? '✓' : '○',
        item.item.substring(0, 80) + (item.item.length > 80 ? '...' : ''),
        item.owner
      ]);

      doc.autoTable({
        startY: yPosition + 5,
        head: [['ID', 'Priority', 'Status', 'Item', 'Owner']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8
        },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 20 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 100 },
          4: { cellWidth: 30 }
        },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        margin: { left: 20, right: 20 },
        didDrawCell: (data) => {
          // Color-code priority
          if (data.column.index === 1 && data.cell.section === 'body') {
            const priority = data.cell.raw;
            let color = [100, 100, 100];
            if (priority === 'CRITICAL') color = [220, 38, 38]; // red
            else if (priority === 'HIGH') color = [234, 88, 12]; // orange
            else if (priority === 'MEDIUM') color = [234, 179, 8]; // yellow
            else if (priority === 'LOW') color = [37, 99, 235]; // blue

            doc.setTextColor(...color);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(priority, data.cell.x + 2, data.cell.y + 5);
          }
        }
      });

      yPosition = doc.lastAutoTable.finalY + 10;
    });
  }

  // ===== FOOTER ON ALL PAGES =====
  addPageNumbers();

  // Add generation info on last page
  const finalPage = doc.internal.getNumberOfPages();
  doc.setPage(finalPage);
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    'For Internal Flipside Group Use Only',
    pageWidth / 2,
    pageHeight - 15,
    { align: 'center' }
  );

  return doc;
}

/**
 * Download PDF
 * @param {jsPDF} doc - PDF document
 * @param {string} filename - Filename for download
 */
export function downloadPDF(doc, filename = 'seo-checklist.pdf') {
  doc.save(filename);
}

/**
 * Preview PDF in new window
 * @param {jsPDF} doc - PDF document
 */
export function previewPDF(doc) {
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  // URL will be revoked when window closes
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export default {
  generateChecklistPDF,
  downloadPDF,
  previewPDF
};
