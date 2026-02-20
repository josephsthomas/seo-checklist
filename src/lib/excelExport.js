import ExcelJS from 'exceljs';
import { format } from 'date-fns';

export async function exportToExcel(items, completions, project) {
  // Create a new workbook
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SEO Checklist Pro';
  wb.created = new Date();

  // Sheet 1: Overview
  const wsOverview = wb.addWorksheet('Overview');
  const overviewData = [
    ['SEO CHECKLIST REPORT'],
    [''],
    ['Project Name:', project?.name || 'N/A'],
    ['Client Name:', project?.clientName || 'N/A'],
    ['Project Type:', project?.projectType || 'N/A'],
    ['Status:', project?.status || 'N/A'],
    ['Export Date:', format(new Date(), 'PPP')],
    [''],
    ['Progress Summary'],
    ['Total Items:', items.length],
    ['Completed Items:', Object.values(completions).filter(Boolean).length],
    ['Completion %:', `${Math.round((Object.values(completions).filter(Boolean).length / items.length) * 100)}%`],
    [''],
    ['By Priority'],
    ['CRITICAL:', items.filter(i => i.priority === 'CRITICAL').length],
    ['HIGH:', items.filter(i => i.priority === 'HIGH').length],
    ['MEDIUM:', items.filter(i => i.priority === 'MEDIUM').length],
    ['LOW:', items.filter(i => i.priority === 'LOW').length],
  ];
  overviewData.forEach(row => wsOverview.addRow(row));

  // Style the title
  wsOverview.getRow(1).font = { bold: true, size: 14 };

  // Sheet 2: By Phase
  const wsByPhase = wb.addWorksheet('By Phase');
  const phaseHeader = ['ID', 'Item', 'Phase', 'Priority', 'Owner', 'Category', 'Status', 'Risk Level', 'Effort', 'Deliverable Type'];
  wsByPhase.addRow(phaseHeader);
  wsByPhase.getRow(1).font = { bold: true };

  const phases = ['Discovery', 'Strategy', 'Build', 'Pre-Launch', 'Launch', 'Post-Launch'];
  phases.forEach(phase => {
    const phaseItems = items.filter(item => item.phase === phase);
    if (phaseItems.length > 0) {
      const sectionRow = wsByPhase.addRow([`--- ${phase.toUpperCase()} ---`]);
      sectionRow.font = { bold: true };
      phaseItems.forEach(item => {
        wsByPhase.addRow([
          item.id,
          item.item,
          item.phase,
          item.priority,
          item.owner,
          item.category,
          completions[item.id] ? 'Completed' : 'Not Started',
          item.riskLevel || '',
          item.effortLevel,
          item.deliverableType
        ]);
      });
      wsByPhase.addRow([]); // Empty row between phases
    }
  });

  // Sheet 3: By Priority
  const wsByPriority = wb.addWorksheet('By Priority');
  const priorityHeader = ['ID', 'Item', 'Phase', 'Priority', 'Owner', 'Status', 'Risk Level'];
  wsByPriority.addRow(priorityHeader);
  wsByPriority.getRow(1).font = { bold: true };

  const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  priorities.forEach(priority => {
    const priorityItems = items.filter(item => item.priority === priority);
    if (priorityItems.length > 0) {
      const sectionRow = wsByPriority.addRow([`--- ${priority} ---`]);
      sectionRow.font = { bold: true };
      priorityItems.forEach(item => {
        wsByPriority.addRow([
          item.id,
          item.item,
          item.phase,
          item.priority,
          item.owner,
          completions[item.id] ? 'Completed' : 'Not Started',
          item.riskLevel || ''
        ]);
      });
      wsByPriority.addRow([]);
    }
  });

  // Sheet 4: By Owner
  const wsByOwner = wb.addWorksheet('By Owner');
  const ownerHeader = ['ID', 'Item', 'Phase', 'Owner', 'Priority', 'Status'];
  wsByOwner.addRow(ownerHeader);
  wsByOwner.getRow(1).font = { bold: true };

  const owners = [...new Set(items.map(item => item.owner))].sort();
  owners.forEach(owner => {
    const ownerItems = items.filter(item => item.owner === owner);
    if (ownerItems.length > 0) {
      const sectionRow = wsByOwner.addRow([`--- ${owner} ---`]);
      sectionRow.font = { bold: true };
      ownerItems.forEach(item => {
        wsByOwner.addRow([
          item.id,
          item.item,
          item.phase,
          item.owner,
          item.priority,
          completions[item.id] ? 'Completed' : 'Not Started'
        ]);
      });
      wsByOwner.addRow([]);
    }
  });

  // Sheet 5: All Items
  const wsAllItems = wb.addWorksheet('All Items');
  const allItemsHeader = ['ID', 'Phase', 'Priority', 'Item', 'Owner', 'Category', 'Project Types', 'Effort Level', 'Risk Level', 'Deliverable Type', 'Status'];
  wsAllItems.addRow(allItemsHeader);
  wsAllItems.getRow(1).font = { bold: true };

  items.forEach(item => {
    wsAllItems.addRow([
      item.id,
      item.phase,
      item.priority,
      item.item,
      item.owner,
      item.category,
      item.projectTypes?.join(', ') || '',
      item.effortLevel,
      item.riskLevel || '',
      item.deliverableType,
      completions[item.id] ? 'Completed' : 'Not Started'
    ]);
  });

  // Add auto-filter to all items sheet
  wsAllItems.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: items.length + 1, column: 11 }
  };

  // Auto-fit columns
  wsAllItems.columns.forEach(column => {
    column.width = 15;
  });

  // Generate filename
  const filename = `SEO_Checklist_${project?.name.replace(/\s+/g, '_') || 'Export'}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

  // Write file - create buffer and download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.setAttribute('aria-hidden', 'true');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
