/**
 * Generate Comprehensive QA Test Plan for Flipside SEO Portal
 * Enterprise-grade test plan covering all 10 phases
 */

import * as XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create workbook
const wb = XLSX.utils.book_new();

// Overview Sheet
const overviewData = [
  ['FLIPSIDE SEO PORTAL - COMPREHENSIVE QA TEST PLAN'],
  [''],
  ['Document Information'],
  ['Version', '1.0'],
  ['Created Date', new Date().toLocaleDateString()],
  ['Application', 'Flipside SEO Portal'],
  ['Technology Stack', 'React 18 + Vite + Firebase + Tailwind CSS'],
  [''],
  ['Test Plan Summary'],
  ['Total Test Cases', '204'],
  ['Phases Covered', '10'],
  ['Test Types', 'Functional, Integration, UI/UX, Performance, Security, Edge Cases'],
  [''],
  ['Phase Breakdown'],
  ['Phase', 'Description', 'Test Cases'],
  ['Phase 1-3', 'Audit Engine & Core Infrastructure', '45'],
  ['Phase 4', 'Issue Explorer', '28'],
  ['Phase 5', 'Page Audit View', '22'],
  ['Phase 6', 'URL Data Table', '18'],
  ['Phase 7', 'AI Integration', '24'],
  ['Phase 8', 'PDF & Excel Exports', '20'],
  ['Phase 9', 'Save & Share Functionality', '32'],
  ['Phase 10', 'Performance Optimization', '15'],
  ['Cross-Cutting', 'Security, Accessibility, Error Handling', '20'],
  [''],
  ['Test Priority Legend'],
  ['P1 - Critical', 'Core functionality, must pass for release'],
  ['P2 - High', 'Important features, significant impact'],
  ['P3 - Medium', 'Standard features, moderate impact'],
  ['P4 - Low', 'Nice-to-have, minor impact'],
  [''],
  ['Test Status Legend'],
  ['NOT RUN', 'Test not yet executed'],
  ['PASS', 'Test passed successfully'],
  ['FAIL', 'Test failed - bug identified'],
  ['BLOCKED', 'Test cannot be run due to dependencies'],
  ['SKIP', 'Test intentionally skipped']
];

const overviewWs = XLSX.utils.aoa_to_sheet(overviewData);
overviewWs['!cols'] = [{ wch: 25 }, { wch: 50 }, { wch: 15 }];
XLSX.utils.book_append_sheet(wb, overviewWs, 'Overview');

// Phase 1-3: Audit Engine Tests
const phase1_3Data = [
  ['PHASE 1-3: AUDIT ENGINE & CORE INFRASTRUCTURE'],
  [''],
  ['Test ID', 'Category', 'Test Case', 'Steps', 'Expected Result', 'Priority', 'Status', 'Notes'],

  // CSV Parsing Tests
  ['AE-001', 'CSV Parsing', 'Parse valid Screaming Frog CSV export', '1. Upload standard SF CSV file\n2. Verify parsing completes', 'CSV parsed successfully, all columns mapped', 'P1', 'NOT RUN', ''],
  ['AE-002', 'CSV Parsing', 'Handle CSV with missing columns', '1. Upload CSV missing statusCode column\n2. Check error handling', 'Graceful handling, default values applied', 'P1', 'NOT RUN', ''],
  ['AE-003', 'CSV Parsing', 'Handle empty CSV file', '1. Upload empty CSV\n2. Verify error message', 'User-friendly error message displayed', 'P1', 'NOT RUN', ''],
  ['AE-004', 'CSV Parsing', 'Handle malformed CSV', '1. Upload CSV with invalid formatting\n2. Check error handling', 'Error caught, user notified', 'P2', 'NOT RUN', ''],
  ['AE-005', 'CSV Parsing', 'Handle large CSV (10,000+ rows)', '1. Upload CSV with 10,000+ URLs\n2. Monitor performance', 'Parsing completes without timeout, memory efficient', 'P1', 'NOT RUN', ''],
  ['AE-006', 'CSV Parsing', 'Handle CSV with special characters', '1. Upload CSV with UTF-8 special chars in URLs/titles\n2. Verify correct parsing', 'Special characters preserved correctly', 'P2', 'NOT RUN', ''],
  ['AE-007', 'CSV Parsing', 'Handle CSV with varying delimiters', '1. Upload CSV with different delimiters\n2. Check auto-detection', 'Delimiter auto-detected or error shown', 'P3', 'NOT RUN', ''],

  // Health Score Calculation
  ['AE-008', 'Health Score', 'Calculate score for perfect site', '1. Process site with no issues\n2. Verify health score', 'Health score = 100', 'P1', 'NOT RUN', ''],
  ['AE-009', 'Health Score', 'Calculate score with errors only', '1. Process site with 10 errors\n2. Verify penalty applied', 'Score reflects error severity weighting', 'P1', 'NOT RUN', ''],
  ['AE-010', 'Health Score', 'Calculate score with warnings only', '1. Process site with 10 warnings\n2. Verify penalty applied', 'Score reflects warning severity weighting', 'P1', 'NOT RUN', ''],
  ['AE-011', 'Health Score', 'Calculate score with mixed issues', '1. Process site with errors + warnings + info\n2. Verify calculation', 'Score reflects combined weighted penalties', 'P1', 'NOT RUN', ''],
  ['AE-012', 'Health Score', 'Score never goes below 0', '1. Process site with extreme issues\n2. Verify minimum score', 'Score clamped at 0 minimum', 'P2', 'NOT RUN', ''],
  ['AE-013', 'Health Score', 'Score never exceeds 100', '1. Process perfect site\n2. Verify maximum score', 'Score clamped at 100 maximum', 'P2', 'NOT RUN', ''],

  // Issue Detection - Technical SEO
  ['AE-014', 'Issue Detection', 'Detect 4xx status codes', '1. Process URLs with 404, 403, 400\n2. Verify issue created', 'Error-level issue created with affected URLs', 'P1', 'NOT RUN', ''],
  ['AE-015', 'Issue Detection', 'Detect 5xx status codes', '1. Process URLs with 500, 502, 503\n2. Verify issue created', 'Error-level issue created with affected URLs', 'P1', 'NOT RUN', ''],
  ['AE-016', 'Issue Detection', 'Detect redirect chains', '1. Process URLs with 301/302 redirects\n2. Verify warning created', 'Warning-level issue with redirect details', 'P1', 'NOT RUN', ''],
  ['AE-017', 'Issue Detection', 'Detect missing titles', '1. Process URLs with empty title\n2. Verify issue created', 'Warning-level issue for missing titles', 'P1', 'NOT RUN', ''],
  ['AE-018', 'Issue Detection', 'Detect duplicate titles', '1. Process URLs with identical titles\n2. Verify issue created', 'Warning-level issue listing duplicates', 'P1', 'NOT RUN', ''],
  ['AE-019', 'Issue Detection', 'Detect title length issues', '1. Process URLs with too short/long titles\n2. Verify warnings', 'Warnings for <30 or >60 character titles', 'P2', 'NOT RUN', ''],
  ['AE-020', 'Issue Detection', 'Detect missing meta descriptions', '1. Process URLs without meta desc\n2. Verify warning', 'Warning-level issue created', 'P1', 'NOT RUN', ''],
  ['AE-021', 'Issue Detection', 'Detect duplicate meta descriptions', '1. Process URLs with duplicate meta desc\n2. Verify warning', 'Warning-level issue listing duplicates', 'P2', 'NOT RUN', ''],
  ['AE-022', 'Issue Detection', 'Detect meta description length issues', '1. Process URLs with <70 or >160 char meta desc\n2. Verify warnings', 'Info-level issues for length problems', 'P2', 'NOT RUN', ''],
  ['AE-023', 'Issue Detection', 'Detect missing H1 tags', '1. Process URLs without H1\n2. Verify warning', 'Warning-level issue created', 'P1', 'NOT RUN', ''],
  ['AE-024', 'Issue Detection', 'Detect multiple H1 tags', '1. Process URLs with >1 H1\n2. Verify info issue', 'Info-level issue created', 'P2', 'NOT RUN', ''],
  ['AE-025', 'Issue Detection', 'Detect duplicate H1 tags', '1. Process URLs with identical H1s\n2. Verify warning', 'Warning-level issue listing duplicates', 'P2', 'NOT RUN', ''],
  ['AE-026', 'Issue Detection', 'Detect non-indexable pages', '1. Process URLs with noindex\n2. Verify detection', 'Info-level issue listing non-indexable URLs', 'P2', 'NOT RUN', ''],
  ['AE-027', 'Issue Detection', 'Detect canonical issues', '1. Process URLs with mismatched canonicals\n2. Verify warning', 'Warning for canonical mismatches', 'P1', 'NOT RUN', ''],
  ['AE-028', 'Issue Detection', 'Detect orphan pages', '1. Process URLs with 0 inlinks\n2. Verify warning', 'Warning for pages with no internal links', 'P2', 'NOT RUN', ''],
  ['AE-029', 'Issue Detection', 'Detect deep crawl depth', '1. Process URLs with depth >3\n2. Verify info issue', 'Info for pages >3 clicks from homepage', 'P3', 'NOT RUN', ''],
  ['AE-030', 'Issue Detection', 'Detect slow response time', '1. Process URLs with >2s response\n2. Verify warning', 'Warning for slow pages', 'P2', 'NOT RUN', ''],
  ['AE-031', 'Issue Detection', 'Detect large page size', '1. Process URLs with >2MB size\n2. Verify warning', 'Warning for oversized pages', 'P3', 'NOT RUN', ''],
  ['AE-032', 'Issue Detection', 'Detect low word count', '1. Process URLs with <200 words\n2. Verify info issue', 'Info for thin content pages', 'P3', 'NOT RUN', ''],

  // Issue Categorization
  ['AE-033', 'Categorization', 'Issues grouped by category', '1. Process mixed issues\n2. Verify categories', 'Issues properly categorized (Technical, Content, Links)', 'P1', 'NOT RUN', ''],
  ['AE-034', 'Categorization', 'Issues sorted by severity', '1. View issue list\n2. Check sort order', 'Errors shown first, then warnings, then info', 'P2', 'NOT RUN', ''],
  ['AE-035', 'Categorization', 'Priority assigned correctly', '1. Review issue priorities\n2. Verify MUST/SHOULD/COULD', 'Priority reflects actual SEO impact', 'P2', 'NOT RUN', ''],

  // Summary Statistics
  ['AE-036', 'Statistics', 'Total URLs counted correctly', '1. Process known URL count\n2. Verify stats', 'URL count matches input', 'P1', 'NOT RUN', ''],
  ['AE-037', 'Statistics', 'Error count accurate', '1. Count manual errors\n2. Compare to stats', 'Error count matches actual errors', 'P1', 'NOT RUN', ''],
  ['AE-038', 'Statistics', 'Warning count accurate', '1. Count manual warnings\n2. Compare to stats', 'Warning count matches actual warnings', 'P1', 'NOT RUN', ''],
  ['AE-039', 'Statistics', 'Info count accurate', '1. Count manual info issues\n2. Compare to stats', 'Info count matches actual info issues', 'P1', 'NOT RUN', ''],

  // Edge Cases
  ['AE-040', 'Edge Case', 'Handle URL with query parameters', '1. Process URL with ?query=params\n2. Verify proper handling', 'URL parsed correctly with parameters', 'P2', 'NOT RUN', ''],
  ['AE-041', 'Edge Case', 'Handle URL with hash fragments', '1. Process URL with #hash\n2. Verify proper handling', 'Hash fragments handled appropriately', 'P3', 'NOT RUN', ''],
  ['AE-042', 'Edge Case', 'Handle internationalized URLs', '1. Process URLs with unicode chars\n2. Verify encoding', 'URLs properly encoded/decoded', 'P2', 'NOT RUN', ''],
  ['AE-043', 'Edge Case', 'Handle very long URLs', '1. Process URL >2000 chars\n2. Verify handling', 'Long URLs handled without errors', 'P3', 'NOT RUN', ''],
  ['AE-044', 'Edge Case', 'Handle duplicate URLs in input', '1. Upload CSV with duplicate rows\n2. Verify deduplication', 'Duplicates handled appropriately', 'P2', 'NOT RUN', ''],
  ['AE-045', 'Edge Case', 'Handle null/undefined values', '1. Process data with null fields\n2. Verify null safety', 'No crashes, defaults applied', 'P1', 'NOT RUN', '']
];

const phase1_3Ws = XLSX.utils.aoa_to_sheet(phase1_3Data);
phase1_3Ws['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 50 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, phase1_3Ws, 'Phase 1-3 Audit Engine');

// Phase 4: Issue Explorer Tests
const phase4Data = [
  ['PHASE 4: ISSUE EXPLORER'],
  [''],
  ['Test ID', 'Category', 'Test Case', 'Steps', 'Expected Result', 'Priority', 'Status', 'Notes'],

  // Issue List Display
  ['IE-001', 'Display', 'Issue list renders correctly', '1. Navigate to Issue Explorer\n2. Verify issue list visible', 'All issues displayed with correct data', 'P1', 'NOT RUN', ''],
  ['IE-002', 'Display', 'Severity icons displayed correctly', '1. View issue list\n2. Check severity icons', 'Red=Error, Amber=Warning, Blue=Info', 'P1', 'NOT RUN', ''],
  ['IE-003', 'Display', 'Priority badges displayed correctly', '1. View issue list\n2. Check priority badges', 'MUST=Red, SHOULD=Amber, COULD=Blue', 'P1', 'NOT RUN', ''],
  ['IE-004', 'Display', 'Affected URL count shown', '1. View issue cards\n2. Verify URL counts', 'Each issue shows accurate URL count', 'P1', 'NOT RUN', ''],
  ['IE-005', 'Display', 'Empty state when no issues', '1. Load audit with no issues\n2. Check display', 'Friendly "No issues" message shown', 'P2', 'NOT RUN', ''],

  // Filtering
  ['IE-006', 'Filtering', 'Filter by severity - Error', '1. Select Error filter\n2. Verify results', 'Only error-level issues shown', 'P1', 'NOT RUN', ''],
  ['IE-007', 'Filtering', 'Filter by severity - Warning', '1. Select Warning filter\n2. Verify results', 'Only warning-level issues shown', 'P1', 'NOT RUN', ''],
  ['IE-008', 'Filtering', 'Filter by severity - Info', '1. Select Info filter\n2. Verify results', 'Only info-level issues shown', 'P1', 'NOT RUN', ''],
  ['IE-009', 'Filtering', 'Filter by category', '1. Select category filter\n2. Verify results', 'Only issues in selected category shown', 'P1', 'NOT RUN', ''],
  ['IE-010', 'Filtering', 'Combined filters work', '1. Apply severity + category filters\n2. Verify results', 'Results match both filter criteria', 'P1', 'NOT RUN', ''],
  ['IE-011', 'Filtering', 'Clear filters resets view', '1. Apply filters\n2. Clear all filters', 'All issues visible again', 'P2', 'NOT RUN', ''],
  ['IE-012', 'Filtering', 'Filter counts update correctly', '1. Apply filter\n2. Check result count', 'Displayed count matches filtered results', 'P2', 'NOT RUN', ''],

  // Search
  ['IE-013', 'Search', 'Search by issue title', '1. Type issue title in search\n2. Verify results', 'Matching issues shown', 'P1', 'NOT RUN', ''],
  ['IE-014', 'Search', 'Search by URL', '1. Type partial URL in search\n2. Verify results', 'Issues affecting matching URLs shown', 'P1', 'NOT RUN', ''],
  ['IE-015', 'Search', 'Search is case-insensitive', '1. Search with mixed case\n2. Verify results', 'Results found regardless of case', 'P2', 'NOT RUN', ''],
  ['IE-016', 'Search', 'Empty search shows all', '1. Clear search box\n2. Verify results', 'All issues visible', 'P2', 'NOT RUN', ''],
  ['IE-017', 'Search', 'Search with special chars', '1. Search with &, ?, =\n2. Verify handling', 'No errors, appropriate results', 'P3', 'NOT RUN', ''],

  // Issue Details
  ['IE-018', 'Details', 'Expand issue shows details', '1. Click expand on issue\n2. Verify details visible', 'Description, recommendation visible', 'P1', 'NOT RUN', ''],
  ['IE-019', 'Details', 'Collapse issue hides details', '1. Expand then collapse\n2. Verify hidden', 'Details hidden, list compact', 'P1', 'NOT RUN', ''],
  ['IE-020', 'Details', 'Affected URLs list shown', '1. Expand issue\n2. Check URL list', 'All affected URLs displayed', 'P1', 'NOT RUN', ''],
  ['IE-021', 'Details', 'URL links are clickable', '1. Click URL in affected list\n2. Verify navigation', 'Opens Page Audit View for URL', 'P1', 'NOT RUN', ''],
  ['IE-022', 'Details', 'Recommendation displayed', '1. Expand issue\n2. Check recommendation', 'Clear, actionable recommendation shown', 'P1', 'NOT RUN', ''],

  // UI/UX
  ['IE-023', 'UI/UX', 'Responsive on mobile', '1. View on mobile viewport\n2. Check layout', 'Layout adapts, no horizontal scroll', 'P2', 'NOT RUN', ''],
  ['IE-024', 'UI/UX', 'Loading state shown', '1. Observe initial load\n2. Check loading indicator', 'Loading spinner/skeleton visible', 'P2', 'NOT RUN', ''],
  ['IE-025', 'UI/UX', 'Smooth expand/collapse animation', '1. Expand/collapse issues\n2. Check animation', 'Smooth transition, no jank', 'P3', 'NOT RUN', ''],

  // Performance
  ['IE-026', 'Performance', 'Handle 100+ issues', '1. Load audit with 100+ issues\n2. Check performance', 'List renders quickly, smooth scroll', 'P1', 'NOT RUN', ''],
  ['IE-027', 'Performance', 'Filter large dataset quickly', '1. Apply filter on 100+ issues\n2. Time response', 'Filter applied in <100ms', 'P2', 'NOT RUN', ''],
  ['IE-028', 'Performance', 'Search large dataset quickly', '1. Search 100+ issues\n2. Time response', 'Results appear in <200ms', 'P2', 'NOT RUN', '']
];

const phase4Ws = XLSX.utils.aoa_to_sheet(phase4Data);
phase4Ws['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 50 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, phase4Ws, 'Phase 4 Issue Explorer');

// Phase 5: Page Audit View Tests
const phase5Data = [
  ['PHASE 5: PAGE AUDIT VIEW'],
  [''],
  ['Test ID', 'Category', 'Test Case', 'Steps', 'Expected Result', 'Priority', 'Status', 'Notes'],

  // Page Details Display
  ['PA-001', 'Display', 'URL displayed correctly', '1. Open page audit for URL\n2. Verify URL shown', 'Full URL displayed in header', 'P1', 'NOT RUN', ''],
  ['PA-002', 'Display', 'Status code badge shown', '1. View page audit\n2. Check status badge', 'Correct status code with color coding', 'P1', 'NOT RUN', ''],
  ['PA-003', 'Display', 'Indexability status shown', '1. View page audit\n2. Check indexability badge', 'Indexable/Non-Indexable clearly indicated', 'P1', 'NOT RUN', ''],
  ['PA-004', 'Display', 'Title displayed with length', '1. View page details\n2. Check title section', 'Title text and character count shown', 'P1', 'NOT RUN', ''],
  ['PA-005', 'Display', 'Meta description displayed', '1. View page details\n2. Check meta desc section', 'Meta description and length shown', 'P1', 'NOT RUN', ''],
  ['PA-006', 'Display', 'H1 displayed', '1. View page details\n2. Check H1 section', 'H1 content shown', 'P1', 'NOT RUN', ''],
  ['PA-007', 'Display', 'Word count displayed', '1. View page details\n2. Check word count', 'Word count formatted correctly', 'P2', 'NOT RUN', ''],
  ['PA-008', 'Display', 'Inlinks/Outlinks shown', '1. View page details\n2. Check link counts', 'Internal and external link counts displayed', 'P2', 'NOT RUN', ''],
  ['PA-009', 'Display', 'Crawl depth displayed', '1. View page details\n2. Check crawl depth', 'Crawl depth with context shown', 'P2', 'NOT RUN', ''],
  ['PA-010', 'Display', 'Response time shown', '1. View page details\n2. Check response time', 'Response time in milliseconds', 'P2', 'NOT RUN', ''],
  ['PA-011', 'Display', 'Page size shown', '1. View page details\n2. Check page size', 'Size in KB/MB displayed', 'P2', 'NOT RUN', ''],

  // Page-Specific Issues
  ['PA-012', 'Issues', 'Page issues filtered correctly', '1. View page with issues\n2. Check issue list', 'Only issues affecting this URL shown', 'P1', 'NOT RUN', ''],
  ['PA-013', 'Issues', 'Issue count summary shown', '1. View page issues\n2. Check count badges', 'Error/Warning/Info counts displayed', 'P1', 'NOT RUN', ''],
  ['PA-014', 'Issues', 'Issue details expandable', '1. Click on issue\n2. Verify expansion', 'Full issue details shown', 'P1', 'NOT RUN', ''],
  ['PA-015', 'Issues', 'No issues state', '1. View page with no issues\n2. Check display', '"No Issues Found" message with checkmark', 'P2', 'NOT RUN', ''],

  // Actions
  ['PA-016', 'Actions', 'Copy URL button works', '1. Click Copy URL\n2. Paste elsewhere', 'URL copied to clipboard', 'P1', 'NOT RUN', ''],
  ['PA-017', 'Actions', 'Open URL button works', '1. Click Open/External link\n2. Verify navigation', 'URL opens in new tab', 'P1', 'NOT RUN', ''],
  ['PA-018', 'Actions', 'Back button navigates correctly', '1. Click Back\n2. Verify navigation', 'Returns to previous view', 'P1', 'NOT RUN', ''],

  // Edge Cases
  ['PA-019', 'Edge Case', 'Handle missing title', '1. View page without title\n2. Check display', 'Graceful handling, no crash', 'P2', 'NOT RUN', ''],
  ['PA-020', 'Edge Case', 'Handle missing meta description', '1. View page without meta\n2. Check display', 'Section hidden or placeholder shown', 'P2', 'NOT RUN', ''],
  ['PA-021', 'Edge Case', 'Handle very long title/URL', '1. View page with long title\n2. Check truncation', 'Text truncated with ellipsis', 'P2', 'NOT RUN', ''],
  ['PA-022', 'Edge Case', 'Handle non-existent URL data', '1. Try to view URL not in dataset\n2. Check handling', 'Appropriate error or empty state', 'P2', 'NOT RUN', '']
];

const phase5Ws = XLSX.utils.aoa_to_sheet(phase5Data);
phase5Ws['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 50 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, phase5Ws, 'Phase 5 Page Audit View');

// Phase 6: URL Data Table Tests
const phase6Data = [
  ['PHASE 6: URL DATA TABLE'],
  [''],
  ['Test ID', 'Category', 'Test Case', 'Steps', 'Expected Result', 'Priority', 'Status', 'Notes'],

  // Table Display
  ['UT-001', 'Display', 'Table renders all columns', '1. View URL data table\n2. Check all columns', 'All expected columns visible', 'P1', 'NOT RUN', ''],
  ['UT-002', 'Display', 'Data rows populated correctly', '1. View table data\n2. Verify accuracy', 'Data matches source CSV', 'P1', 'NOT RUN', ''],
  ['UT-003', 'Display', 'Status code color coding', '1. View status code column\n2. Check colors', '2xx=Green, 3xx=Yellow, 4xx/5xx=Red', 'P2', 'NOT RUN', ''],

  // Sorting
  ['UT-004', 'Sorting', 'Sort by URL ascending', '1. Click URL column header\n2. Verify sort', 'URLs sorted A-Z', 'P1', 'NOT RUN', ''],
  ['UT-005', 'Sorting', 'Sort by URL descending', '1. Click URL header twice\n2. Verify sort', 'URLs sorted Z-A', 'P1', 'NOT RUN', ''],
  ['UT-006', 'Sorting', 'Sort by status code', '1. Click status code header\n2. Verify sort', 'Sorted numerically', 'P1', 'NOT RUN', ''],
  ['UT-007', 'Sorting', 'Sort by word count', '1. Click word count header\n2. Verify sort', 'Sorted numerically', 'P2', 'NOT RUN', ''],
  ['UT-008', 'Sorting', 'Sort indicator visible', '1. Sort any column\n2. Check indicator', 'Arrow indicates sort direction', 'P2', 'NOT RUN', ''],

  // Pagination
  ['UT-009', 'Pagination', 'Pagination controls visible', '1. View table with >50 rows\n2. Check pagination', 'Page controls shown at bottom', 'P1', 'NOT RUN', ''],
  ['UT-010', 'Pagination', 'Next page works', '1. Click next page\n2. Verify data changes', 'Next set of rows displayed', 'P1', 'NOT RUN', ''],
  ['UT-011', 'Pagination', 'Previous page works', '1. Go to page 2, click previous\n2. Verify data', 'Previous rows displayed', 'P1', 'NOT RUN', ''],
  ['UT-012', 'Pagination', 'Page size selection', '1. Change rows per page\n2. Verify count', 'Table shows selected row count', 'P2', 'NOT RUN', ''],
  ['UT-013', 'Pagination', 'Total count displayed', '1. View pagination info\n2. Check total', '"Showing X of Y" accurate', 'P2', 'NOT RUN', ''],

  // Row Interaction
  ['UT-014', 'Interaction', 'Click row opens page view', '1. Click table row\n2. Verify navigation', 'Opens Page Audit View for URL', 'P1', 'NOT RUN', ''],
  ['UT-015', 'Interaction', 'Row hover effect', '1. Hover over row\n2. Check visual feedback', 'Row highlights on hover', 'P3', 'NOT RUN', ''],

  // Performance
  ['UT-016', 'Performance', 'Handle 1000+ rows', '1. Load table with 1000+ URLs\n2. Check performance', 'Table renders smoothly, no lag', 'P1', 'NOT RUN', ''],
  ['UT-017', 'Performance', 'Sorting large dataset', '1. Sort 1000+ row table\n2. Time response', 'Sort completes in <500ms', 'P2', 'NOT RUN', ''],
  ['UT-018', 'Performance', 'Pagination large dataset', '1. Paginate through 1000+ rows\n2. Check responsiveness', 'Instant page transitions', 'P2', 'NOT RUN', '']
];

const phase6Ws = XLSX.utils.aoa_to_sheet(phase6Data);
phase6Ws['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 50 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, phase6Ws, 'Phase 6 URL Data Table');

// Phase 7: AI Integration Tests
const phase7Data = [
  ['PHASE 7: AI INTEGRATION'],
  [''],
  ['Test ID', 'Category', 'Test Case', 'Steps', 'Expected Result', 'Priority', 'Status', 'Notes'],

  // AI Suggestion Generation
  ['AI-001', 'Generation', 'Generate suggestions for page', '1. View page with issues\n2. Click Get AI Suggestions', 'AI suggestions generated and displayed', 'P1', 'NOT RUN', ''],
  ['AI-002', 'Generation', 'Suggestions relevant to issues', '1. Generate suggestions\n2. Review content', 'Suggestions address actual page issues', 'P1', 'NOT RUN', ''],
  ['AI-003', 'Generation', 'Title optimization suggestions', '1. View page with title issue\n2. Check AI suggestion', 'Specific title improvement provided', 'P1', 'NOT RUN', ''],
  ['AI-004', 'Generation', 'Meta description suggestions', '1. View page with meta issue\n2. Check AI suggestion', 'Specific meta description provided', 'P1', 'NOT RUN', ''],
  ['AI-005', 'Generation', 'Content suggestions', '1. View thin content page\n2. Check AI suggestion', 'Content improvement guidance provided', 'P2', 'NOT RUN', ''],
  ['AI-006', 'Generation', 'Technical SEO suggestions', '1. View page with technical issues\n2. Check AI suggestion', 'Technical fix recommendations provided', 'P2', 'NOT RUN', ''],

  // API Integration
  ['AI-007', 'API', 'API key validation', '1. Enter invalid API key\n2. Try to generate', 'Clear error message for invalid key', 'P1', 'NOT RUN', ''],
  ['AI-008', 'API', 'Handle API rate limiting', '1. Make rapid requests\n2. Check handling', 'Graceful handling with retry or message', 'P1', 'NOT RUN', ''],
  ['AI-009', 'API', 'Handle API timeout', '1. Simulate slow response\n2. Check handling', 'Timeout message, retry option', 'P1', 'NOT RUN', ''],
  ['AI-010', 'API', 'Handle API errors', '1. Simulate API error\n2. Check handling', 'User-friendly error message', 'P1', 'NOT RUN', ''],

  // UI/UX
  ['AI-011', 'UI/UX', 'Loading state during generation', '1. Click generate\n2. Check loading indicator', 'Loading spinner/skeleton visible', 'P1', 'NOT RUN', ''],
  ['AI-012', 'UI/UX', 'Suggestions formatted correctly', '1. View generated suggestions\n2. Check formatting', 'Clear, readable formatting', 'P1', 'NOT RUN', ''],
  ['AI-013', 'UI/UX', 'Copy suggestion button', '1. Click copy on suggestion\n2. Paste elsewhere', 'Suggestion copied to clipboard', 'P2', 'NOT RUN', ''],
  ['AI-014', 'UI/UX', 'Regenerate suggestions', '1. Click regenerate\n2. Check new suggestions', 'New suggestions generated', 'P2', 'NOT RUN', ''],
  ['AI-015', 'UI/UX', 'Collapse/expand suggestions', '1. Expand/collapse suggestion sections\n2. Check behavior', 'Smooth expand/collapse', 'P3', 'NOT RUN', ''],

  // Edge Cases
  ['AI-016', 'Edge Case', 'Handle page with no issues', '1. View perfect page\n2. Request suggestions', 'Positive message, general tips', 'P2', 'NOT RUN', ''],
  ['AI-017', 'Edge Case', 'Handle very long content', '1. Generate for page with long content\n2. Check handling', 'Content truncated appropriately', 'P2', 'NOT RUN', ''],
  ['AI-018', 'Edge Case', 'Handle special characters', '1. Page with unicode/emoji\n2. Generate suggestions', 'Characters handled correctly', 'P2', 'NOT RUN', ''],
  ['AI-019', 'Edge Case', 'Handle missing page data', '1. Minimal page data\n2. Generate suggestions', 'Graceful handling, generic suggestions', 'P2', 'NOT RUN', ''],

  // Security
  ['AI-020', 'Security', 'API key not exposed in UI', '1. Inspect page source\n2. Check network requests', 'API key not visible in frontend', 'P1', 'NOT RUN', ''],
  ['AI-021', 'Security', 'Sanitize AI output', '1. Check rendered suggestions\n2. Test XSS vectors', 'No XSS vulnerabilities', 'P1', 'NOT RUN', ''],

  // Performance
  ['AI-022', 'Performance', 'Response time acceptable', '1. Time suggestion generation\n2. Check duration', 'Suggestions within 5-10 seconds', 'P2', 'NOT RUN', ''],
  ['AI-023', 'Performance', 'No memory leaks', '1. Generate multiple times\n2. Monitor memory', 'Memory stable over repeated use', 'P2', 'NOT RUN', ''],
  ['AI-024', 'Performance', 'Concurrent requests handled', '1. Open multiple pages\n2. Generate simultaneously', 'All requests complete successfully', 'P2', 'NOT RUN', '']
];

const phase7Ws = XLSX.utils.aoa_to_sheet(phase7Data);
phase7Ws['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 50 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, phase7Ws, 'Phase 7 AI Integration');

// Phase 8: Export Tests
const phase8Data = [
  ['PHASE 8: PDF & EXCEL EXPORTS'],
  [''],
  ['Test ID', 'Category', 'Test Case', 'Steps', 'Expected Result', 'Priority', 'Status', 'Notes'],

  // PDF Export
  ['EX-001', 'PDF', 'Export to PDF button visible', '1. View audit dashboard\n2. Find export options', 'PDF export button accessible', 'P1', 'NOT RUN', ''],
  ['EX-002', 'PDF', 'PDF generates successfully', '1. Click Export PDF\n2. Wait for generation', 'PDF file downloaded', 'P1', 'NOT RUN', ''],
  ['EX-003', 'PDF', 'PDF contains health score', '1. Open exported PDF\n2. Check health score', 'Health score prominently displayed', 'P1', 'NOT RUN', ''],
  ['EX-004', 'PDF', 'PDF contains issue summary', '1. Open exported PDF\n2. Check summary stats', 'Error/Warning/Info counts present', 'P1', 'NOT RUN', ''],
  ['EX-005', 'PDF', 'PDF contains issue details', '1. Open exported PDF\n2. Check issue list', 'All issues with details included', 'P1', 'NOT RUN', ''],
  ['EX-006', 'PDF', 'PDF page breaks correct', '1. Export large audit\n2. Check pagination', 'Content flows correctly across pages', 'P2', 'NOT RUN', ''],
  ['EX-007', 'PDF', 'PDF filename correct', '1. Export PDF\n2. Check filename', 'Filename includes date/domain', 'P3', 'NOT RUN', ''],

  // Excel Export
  ['EX-008', 'Excel', 'Export to Excel button visible', '1. View audit dashboard\n2. Find export options', 'Excel export button accessible', 'P1', 'NOT RUN', ''],
  ['EX-009', 'Excel', 'Excel generates successfully', '1. Click Export Excel\n2. Wait for generation', 'XLSX file downloaded', 'P1', 'NOT RUN', ''],
  ['EX-010', 'Excel', 'Excel has Summary sheet', '1. Open exported Excel\n2. Check Summary tab', 'Summary sheet with stats present', 'P1', 'NOT RUN', ''],
  ['EX-011', 'Excel', 'Excel has Issues sheet', '1. Open exported Excel\n2. Check Issues tab', 'All issues listed with columns', 'P1', 'NOT RUN', ''],
  ['EX-012', 'Excel', 'Excel has URL Data sheet', '1. Open exported Excel\n2. Check URL Data tab', 'All URL data present', 'P1', 'NOT RUN', ''],
  ['EX-013', 'Excel', 'Excel has Affected URLs sheet', '1. Open exported Excel\n2. Check Affected URLs tab', 'Issue-URL mapping present', 'P2', 'NOT RUN', ''],
  ['EX-014', 'Excel', 'Excel has Category sheet', '1. Open exported Excel\n2. Check Category tab', 'Category breakdown present', 'P2', 'NOT RUN', ''],
  ['EX-015', 'Excel', 'Column widths appropriate', '1. Open Excel\n2. Check formatting', 'Columns properly sized for content', 'P3', 'NOT RUN', ''],

  // CSV Export
  ['EX-016', 'CSV', 'Export to CSV works', '1. Click Export CSV\n2. Check download', 'CSV file downloaded', 'P2', 'NOT RUN', ''],
  ['EX-017', 'CSV', 'CSV format correct', '1. Open exported CSV\n2. Verify format', 'Standard CSV format, proper escaping', 'P2', 'NOT RUN', ''],

  // Edge Cases
  ['EX-018', 'Edge Case', 'Export empty audit', '1. Export audit with no issues\n2. Check files', 'Files generated with appropriate content', 'P2', 'NOT RUN', ''],
  ['EX-019', 'Edge Case', 'Export large audit', '1. Export audit with 500+ issues\n2. Check performance', 'Export completes without timeout', 'P1', 'NOT RUN', ''],
  ['EX-020', 'Edge Case', 'Handle special chars in export', '1. Export with unicode URLs/titles\n2. Check encoding', 'Special characters preserved', 'P2', 'NOT RUN', '']
];

const phase8Ws = XLSX.utils.aoa_to_sheet(phase8Data);
phase8Ws['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 50 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, phase8Ws, 'Phase 8 Exports');

// Phase 9: Save & Share Tests
const phase9Data = [
  ['PHASE 9: SAVE & SHARE FUNCTIONALITY'],
  [''],
  ['Test ID', 'Category', 'Test Case', 'Steps', 'Expected Result', 'Priority', 'Status', 'Notes'],

  // Save to Firestore
  ['SS-001', 'Save', 'Save audit button visible', '1. Complete an audit\n2. Find save button', 'Save button accessible', 'P1', 'NOT RUN', ''],
  ['SS-002', 'Save', 'Save requires authentication', '1. Try to save while logged out\n2. Check behavior', 'Login prompt or error shown', 'P1', 'NOT RUN', ''],
  ['SS-003', 'Save', 'Save audit successfully', '1. Login and save audit\n2. Verify save', 'Audit saved, confirmation shown', 'P1', 'NOT RUN', ''],
  ['SS-004', 'Save', 'Saved audit appears in list', '1. Save audit\n2. View saved audits', 'New audit in saved list', 'P1', 'NOT RUN', ''],
  ['SS-005', 'Save', 'Load saved audit', '1. Click saved audit\n2. Verify data loads', 'Full audit data restored', 'P1', 'NOT RUN', ''],
  ['SS-006', 'Save', 'Delete saved audit', '1. Delete saved audit\n2. Verify removal', 'Audit removed from list', 'P1', 'NOT RUN', ''],
  ['SS-007', 'Save', 'Audit metadata saved', '1. Save and reload audit\n2. Check metadata', 'Domain, date, stats preserved', 'P1', 'NOT RUN', ''],
  ['SS-008', 'Save', 'Handle save errors gracefully', '1. Simulate network error during save\n2. Check handling', 'User-friendly error, retry option', 'P1', 'NOT RUN', ''],

  // Share Link Generation
  ['SS-009', 'Share', 'Share button visible', '1. View saved audit\n2. Find share option', 'Share button accessible', 'P1', 'NOT RUN', ''],
  ['SS-010', 'Share', 'Generate share link', '1. Click share\n2. Generate link', 'Unique share URL generated', 'P1', 'NOT RUN', ''],
  ['SS-011', 'Share', 'Copy share link', '1. Generate share link\n2. Click copy', 'URL copied to clipboard', 'P1', 'NOT RUN', ''],
  ['SS-012', 'Share', 'Share link is unique', '1. Generate multiple share links\n2. Compare URLs', 'Each link has unique ID', 'P1', 'NOT RUN', ''],

  // Password Protection
  ['SS-013', 'Password', 'Password protection option', '1. Open share dialog\n2. Check password option', 'Password toggle available', 'P1', 'NOT RUN', ''],
  ['SS-014', 'Password', 'Set password on share', '1. Enable password\n2. Enter password\n3. Generate link', 'Link created with password requirement', 'P1', 'NOT RUN', ''],
  ['SS-015', 'Password', 'Access protected share without password', '1. Open protected link\n2. Without password', 'Password prompt displayed', 'P1', 'NOT RUN', ''],
  ['SS-016', 'Password', 'Access protected share with wrong password', '1. Open protected link\n2. Enter wrong password', 'Error message, retry option', 'P1', 'NOT RUN', ''],
  ['SS-017', 'Password', 'Access protected share with correct password', '1. Open protected link\n2. Enter correct password', 'Audit displayed successfully', 'P1', 'NOT RUN', ''],
  ['SS-018', 'Password', 'Password hashed in storage', '1. Check Firestore document\n2. Verify password field', 'Password stored as hash, not plain text', 'P1', 'NOT RUN', ''],

  // Share Link Expiration
  ['SS-019', 'Expiration', 'Expiration option available', '1. Open share dialog\n2. Check expiration option', 'Expiration setting available', 'P2', 'NOT RUN', ''],
  ['SS-020', 'Expiration', 'Set expiration date', '1. Set 7-day expiration\n2. Generate link', 'Expiration date saved with share', 'P2', 'NOT RUN', ''],
  ['SS-021', 'Expiration', 'Expired link handled', '1. Access expired share link\n2. Check behavior', 'Clear expiration message shown', 'P2', 'NOT RUN', ''],

  // Shared Audit View
  ['SS-022', 'Shared View', 'Shared view loads correctly', '1. Open share link\n2. Check display', 'Audit data displayed to viewer', 'P1', 'NOT RUN', ''],
  ['SS-023', 'Shared View', 'Health score visible in shared view', '1. Open share link\n2. Check health score', 'Health score prominently shown', 'P1', 'NOT RUN', ''],
  ['SS-024', 'Shared View', 'Issues visible in shared view', '1. Open share link\n2. Check issues list', 'All issues displayed', 'P1', 'NOT RUN', ''],
  ['SS-025', 'Shared View', 'Issue expansion works', '1. Open share link\n2. Expand issue', 'Issue details visible', 'P1', 'NOT RUN', ''],
  ['SS-026', 'Shared View', 'View count tracked', '1. Open share link multiple times\n2. Check view count', 'View count increments', 'P2', 'NOT RUN', ''],

  // Revoke Share
  ['SS-027', 'Revoke', 'Revoke share option', '1. View shared audit\n2. Find revoke option', 'Revoke button accessible', 'P1', 'NOT RUN', ''],
  ['SS-028', 'Revoke', 'Revoke share link', '1. Click revoke\n2. Confirm action', 'Share link invalidated', 'P1', 'NOT RUN', ''],
  ['SS-029', 'Revoke', 'Revoked link shows error', '1. Access revoked link\n2. Check behavior', 'Link not found message', 'P1', 'NOT RUN', ''],

  // Edge Cases
  ['SS-030', 'Edge Case', 'Handle invalid share ID', '1. Access non-existent share ID\n2. Check handling', 'User-friendly error message', 'P1', 'NOT RUN', ''],
  ['SS-031', 'Edge Case', 'Large audit share', '1. Share audit with 500+ issues\n2. Access link', 'Shared view loads successfully', 'P2', 'NOT RUN', ''],
  ['SS-032', 'Edge Case', 'Concurrent share access', '1. Multiple users access same link\n2. Check behavior', 'All users can view simultaneously', 'P2', 'NOT RUN', '']
];

const phase9Ws = XLSX.utils.aoa_to_sheet(phase9Data);
phase9Ws['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 50 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, phase9Ws, 'Phase 9 Save & Share');

// Phase 10: Performance Tests
const phase10Data = [
  ['PHASE 10: PERFORMANCE OPTIMIZATION'],
  [''],
  ['Test ID', 'Category', 'Test Case', 'Steps', 'Expected Result', 'Priority', 'Status', 'Notes'],

  // Code Splitting
  ['PF-001', 'Code Splitting', 'Lazy loading implemented', '1. Check network requests\n2. Verify chunked loading', 'Components load on demand', 'P1', 'NOT RUN', ''],
  ['PF-002', 'Code Splitting', 'Suspense fallback shown', '1. Throttle network\n2. Navigate to lazy route', 'Loading state visible during load', 'P1', 'NOT RUN', ''],
  ['PF-003', 'Code Splitting', 'Error boundary catches failures', '1. Simulate chunk load failure\n2. Check handling', 'Error boundary catches and displays message', 'P1', 'NOT RUN', ''],

  // Bundle Size
  ['PF-004', 'Bundle', 'Main bundle size acceptable', '1. Run production build\n2. Check bundle stats', 'Main bundle <500KB gzipped', 'P1', 'NOT RUN', ''],
  ['PF-005', 'Bundle', 'Chunks appropriately sized', '1. Analyze build output\n2. Check chunk sizes', 'No chunk >200KB gzipped', 'P2', 'NOT RUN', ''],
  ['PF-006', 'Bundle', 'Tree shaking effective', '1. Check bundle analysis\n2. Verify unused code removed', 'No dead code in production bundle', 'P2', 'NOT RUN', ''],

  // Runtime Performance
  ['PF-007', 'Runtime', 'Initial load time', '1. Clear cache\n2. Time to interactive', 'TTI <3 seconds on 3G', 'P1', 'NOT RUN', ''],
  ['PF-008', 'Runtime', 'Route navigation smooth', '1. Navigate between routes\n2. Time transitions', 'Navigation <100ms perceived', 'P1', 'NOT RUN', ''],
  ['PF-009', 'Runtime', 'Large data handling', '1. Load 10,000 row audit\n2. Monitor performance', 'No UI blocking, smooth scroll', 'P1', 'NOT RUN', ''],
  ['PF-010', 'Runtime', 'Memory usage stable', '1. Use app for extended period\n2. Monitor memory', 'No memory leaks, stable usage', 'P1', 'NOT RUN', ''],

  // Rendering
  ['PF-011', 'Rendering', 'No unnecessary re-renders', '1. Use React DevTools\n2. Monitor renders', 'Components only re-render when needed', 'P2', 'NOT RUN', ''],
  ['PF-012', 'Rendering', 'useMemo/useCallback effective', '1. Check expensive computations\n2. Verify memoization', 'Memoized values cached correctly', 'P2', 'NOT RUN', ''],

  // Network
  ['PF-013', 'Network', 'API calls minimized', '1. Monitor network requests\n2. Check redundancy', 'No duplicate API calls', 'P2', 'NOT RUN', ''],
  ['PF-014', 'Network', 'Assets cached properly', '1. Load app twice\n2. Check cache headers', 'Static assets served from cache', 'P2', 'NOT RUN', ''],
  ['PF-015', 'Network', 'Gzip compression enabled', '1. Check response headers\n2. Verify compression', 'Responses gzip compressed', 'P2', 'NOT RUN', '']
];

const phase10Ws = XLSX.utils.aoa_to_sheet(phase10Data);
phase10Ws['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 50 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, phase10Ws, 'Phase 10 Performance');

// Cross-Cutting Concerns Tests
const crossCuttingData = [
  ['CROSS-CUTTING CONCERNS'],
  [''],
  ['Test ID', 'Category', 'Test Case', 'Steps', 'Expected Result', 'Priority', 'Status', 'Notes'],

  // Security
  ['CC-001', 'Security', 'XSS prevention', '1. Input malicious scripts in forms\n2. Check rendering', 'Scripts not executed, sanitized', 'P1', 'NOT RUN', ''],
  ['CC-002', 'Security', 'CSRF protection', '1. Attempt cross-site request\n2. Check handling', 'Request blocked or token required', 'P1', 'NOT RUN', ''],
  ['CC-003', 'Security', 'Secure Firebase rules', '1. Try unauthorized data access\n2. Check response', 'Access denied appropriately', 'P1', 'NOT RUN', ''],
  ['CC-004', 'Security', 'No sensitive data in localStorage', '1. Check localStorage contents\n2. Verify security', 'No passwords/tokens in plain text', 'P1', 'NOT RUN', ''],
  ['CC-005', 'Security', 'HTTPS enforced', '1. Try HTTP access\n2. Check redirect', 'Redirected to HTTPS', 'P1', 'NOT RUN', ''],

  // Accessibility
  ['CC-006', 'A11y', 'Keyboard navigation', '1. Navigate using only keyboard\n2. Check all interactions', 'All features accessible via keyboard', 'P1', 'NOT RUN', ''],
  ['CC-007', 'A11y', 'Screen reader compatible', '1. Use screen reader\n2. Navigate app', 'Content properly announced', 'P1', 'NOT RUN', ''],
  ['CC-008', 'A11y', 'Color contrast adequate', '1. Run contrast checker\n2. Verify ratios', 'WCAG AA compliant contrast', 'P2', 'NOT RUN', ''],
  ['CC-009', 'A11y', 'Focus indicators visible', '1. Tab through interface\n2. Check focus visibility', 'Clear focus indicators on all elements', 'P2', 'NOT RUN', ''],
  ['CC-010', 'A11y', 'Alt text on images', '1. Check all images\n2. Verify alt attributes', 'Meaningful alt text present', 'P2', 'NOT RUN', ''],

  // Error Handling
  ['CC-011', 'Errors', 'Network error handling', '1. Disconnect network\n2. Try operations', 'User-friendly error messages', 'P1', 'NOT RUN', ''],
  ['CC-012', 'Errors', 'Invalid input handling', '1. Enter invalid data in forms\n2. Check validation', 'Validation errors shown clearly', 'P1', 'NOT RUN', ''],
  ['CC-013', 'Errors', 'Graceful degradation', '1. Disable JavaScript features\n2. Check fallbacks', 'Core content accessible', 'P2', 'NOT RUN', ''],
  ['CC-014', 'Errors', 'Error boundaries working', '1. Trigger component error\n2. Check boundary', 'Error boundary catches, shows message', 'P1', 'NOT RUN', ''],

  // Browser Compatibility
  ['CC-015', 'Browsers', 'Chrome compatibility', '1. Test in Chrome latest\n2. Verify functionality', 'Full functionality in Chrome', 'P1', 'NOT RUN', ''],
  ['CC-016', 'Browsers', 'Firefox compatibility', '1. Test in Firefox latest\n2. Verify functionality', 'Full functionality in Firefox', 'P1', 'NOT RUN', ''],
  ['CC-017', 'Browsers', 'Safari compatibility', '1. Test in Safari latest\n2. Verify functionality', 'Full functionality in Safari', 'P1', 'NOT RUN', ''],
  ['CC-018', 'Browsers', 'Edge compatibility', '1. Test in Edge latest\n2. Verify functionality', 'Full functionality in Edge', 'P2', 'NOT RUN', ''],

  // Responsive Design
  ['CC-019', 'Responsive', 'Mobile layout (375px)', '1. View at 375px width\n2. Check layout', 'Proper mobile layout, no overflow', 'P1', 'NOT RUN', ''],
  ['CC-020', 'Responsive', 'Tablet layout (768px)', '1. View at 768px width\n2. Check layout', 'Proper tablet layout', 'P2', 'NOT RUN', '']
];

const crossCuttingWs = XLSX.utils.aoa_to_sheet(crossCuttingData);
crossCuttingWs['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 40 }, { wch: 50 }, { wch: 40 }, { wch: 10 }, { wch: 10 }, { wch: 20 }];
XLSX.utils.book_append_sheet(wb, crossCuttingWs, 'Cross-Cutting Concerns');

// Write file
const outputPath = join(__dirname, '..', 'QA_Test_Plan_Flipside_SEO_Portal.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`Test plan generated: ${outputPath}`);
console.log('Total test cases: 204');
