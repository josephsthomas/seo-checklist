import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { checklistData } from '../data/checklistData';

export function exportToExcel(items, completions, project) {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Overview
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
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, 'Overview');

  // Sheet 2: By Phase
  const phaseData = [
    ['ID', 'Item', 'Phase', 'Priority', 'Owner', 'Category', 'Status', 'Risk Level', 'Effort', 'Deliverable Type']
  ];

  const phases = ['Discovery', 'Strategy', 'Build', 'Pre-Launch', 'Launch', 'Post-Launch'];
  phases.forEach(phase => {
    const phaseItems = items.filter(item => item.phase === phase);
    if (phaseItems.length > 0) {
      phaseData.push([`--- ${phase.toUpperCase()} ---`]);
      phaseItems.forEach(item => {
        phaseData.push([
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
      phaseData.push([]); // Empty row between phases
    }
  });

  const wsByPhase = XLSX.utils.aoa_to_sheet(phaseData);
  XLSX.utils.book_append_sheet(wb, wsByPhase, 'By Phase');

  // Sheet 3: By Priority
  const priorityData = [
    ['ID', 'Item', 'Phase', 'Priority', 'Owner', 'Status', 'Risk Level']
  ];

  const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  priorities.forEach(priority => {
    const priorityItems = items.filter(item => item.priority === priority);
    if (priorityItems.length > 0) {
      priorityData.push([`--- ${priority} ---`]);
      priorityItems.forEach(item => {
        priorityData.push([
          item.id,
          item.item,
          item.phase,
          item.priority,
          item.owner,
          completions[item.id] ? 'Completed' : 'Not Started',
          item.riskLevel || ''
        ]);
      });
      priorityData.push([]);
    }
  });

  const wsByPriority = XLSX.utils.aoa_to_sheet(priorityData);
  XLSX.utils.book_append_sheet(wb, wsByPriority, 'By Priority');

  // Sheet 4: By Owner
  const ownerData = [
    ['ID', 'Item', 'Phase', 'Owner', 'Priority', 'Status']
  ];

  const owners = [...new Set(items.map(item => item.owner))].sort();
  owners.forEach(owner => {
    const ownerItems = items.filter(item => item.owner === owner);
    if (ownerItems.length > 0) {
      ownerData.push([`--- ${owner} ---`]);
      ownerItems.forEach(item => {
        ownerData.push([
          item.id,
          item.item,
          item.phase,
          item.owner,
          item.priority,
          completions[item.id] ? 'Completed' : 'Not Started'
        ]);
      });
      ownerData.push([]);
    }
  });

  const wsByOwner = XLSX.utils.aoa_to_sheet(ownerData);
  XLSX.utils.book_append_sheet(wb, wsByOwner, 'By Owner');

  // Sheet 5: All Items
  const allItemsData = [
    ['ID', 'Phase', 'Priority', 'Item', 'Owner', 'Category', 'Project Types', 'Effort Level', 'Risk Level', 'Deliverable Type', 'Status']
  ];

  items.forEach(item => {
    allItemsData.push([
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

  const wsAllItems = XLSX.utils.aoa_to_sheet(allItemsData);

  // Add auto-filter to all items sheet
  wsAllItems['!autofilter'] = { ref: XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: allItemsData.length - 1, c: 10 }
  })};

  XLSX.utils.book_append_sheet(wb, wsAllItems, 'All Items');

  // Generate filename
  const filename = `SEO_Checklist_${project?.name.replace(/\s+/g, '_') || 'Export'}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;

  // Write file
  XLSX.writeFile(wb, filename);
}
