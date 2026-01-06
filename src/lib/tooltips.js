/**
 * Contextual tooltips library for Enterprise features
 * Provides consistent help text across the application
 */

export const TOOLTIPS = {
  // Report Builder
  'report.widget.add': 'Drag widgets from the sidebar or click to add data visualizations',
  'report.dataSource': 'Each data source pulls real-time data from your connected tools and audits',
  'report.preview': 'Preview shows exactly how the report will appear when exported or shared',
  'report.save': 'Save your report layout to reuse and schedule for automatic delivery',
  'report.template': 'Start with a pre-built template and customize to your needs',

  // Scheduled Reports
  'schedule.frequency': 'Choose how often this report should be generated and delivered',
  'schedule.recipients': 'Enter email addresses separated by commas. All recipients receive identical reports',
  'schedule.timezone': 'Reports generate at the specified time in your selected timezone',
  'schedule.active': 'Active schedules run automatically. Pause to temporarily stop without deleting',
  'schedule.reportType': 'Select the type of report to generate on schedule',

  // Scheduled Audits
  'audit.depth': 'Shallow audits are faster but check fewer pages. Deep audits are thorough but take longer',
  'audit.categories': 'Select which aspects of SEO to check. More categories = more comprehensive results',
  'audit.alerts.threshold': 'Receive an alert when the audit score drops below this value',
  'audit.url': 'Enter the website URL to audit. Include the full domain with https://',
  'audit.frequency': 'How often the audit should run. Consider site update frequency when choosing',

  // Batch Audit
  'batch.urls': 'Add up to 100 URLs to audit at once. Paste from spreadsheet or upload CSV file',
  'batch.progress': 'URLs are audited sequentially. Results are saved automatically',
  'batch.export': 'Export all batch results to CSV or PDF for reporting',
  'batch.upload': 'Upload a CSV or TXT file with one URL per line',

  // VPAT
  'vpat.conformance.supports': 'The product meets the criterion without known defects',
  'vpat.conformance.partial': 'Some aspects meet the criterion but others have issues',
  'vpat.conformance.doesNot': 'The product does not meet the criterion',
  'vpat.conformance.na': 'The criterion does not apply to this product',
  'vpat.conformance.notEval': 'This criterion has not yet been evaluated',
  'vpat.remarks': 'Add details about your evaluation findings, limitations, or roadmap items',
  'vpat.export': 'Generate a PDF VPAT report suitable for procurement documentation',
  'vpat.version': 'Select the WCAG version your evaluation targets',

  // Competitor Analysis
  'competitor.url': 'Enter any public URL to extract and compare their meta tags with yours',
  'competitor.length': 'Green indicates optimal length for search engines',
  'competitor.compare': 'Side-by-side comparison helps identify competitive gaps',

  // Usage Analytics
  'analytics.activeUsers': 'Users who performed at least one action in the selected time period',
  'analytics.actions': 'Total number of tool uses, exports, and other tracked activities',
  'analytics.dateRange': 'Filter analytics to a specific time period',
  'analytics.export': 'Download usage data for reporting or analysis',

  // Audit Log
  'auditLog.filter': 'Filter to specific action types for security reviews or troubleshooting',
  'auditLog.export': 'Export logs for compliance reporting or offline analysis',
  'auditLog.retention': 'Configure how long audit logs are retained before automatic deletion',
  'auditLog.details': 'Click any log entry to view full details including request data',

  // Fix Suggestions
  'fix.wcag': 'The WCAG success criterion this issue relates to',
  'fix.priority': 'Impact level based on user effect and conformance requirements',
  'fix.code': 'Copy the suggested fix directly into your codebase',
  'fix.resources': 'Additional learning resources about this accessibility issue'
};

/**
 * Get tooltip text by key
 * @param {string} key - The tooltip key
 * @returns {string} The tooltip text or empty string if not found
 */
export const getTooltip = (key) => TOOLTIPS[key] || '';

/**
 * Tooltip component helper - creates an info icon with tooltip
 * Usage: <InfoTooltip tip="schedule.frequency" />
 */
export const createTooltipProps = (key) => ({
  title: TOOLTIPS[key] || '',
  'aria-label': TOOLTIPS[key] || ''
});
