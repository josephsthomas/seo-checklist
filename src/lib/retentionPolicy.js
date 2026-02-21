/**
 * Content Retention Policy Configuration
 * Defines available retention periods and related utilities for all content types
 */

export const RETENTION_OPTIONS = [
  { value: '30', label: '30 days', description: 'Minimum retention' },
  { value: '90', label: '90 days', description: 'Standard retention' },
  { value: '180', label: '180 days', description: 'Extended retention' },
  { value: '365', label: '1 year', description: 'Compliance retention' },
  { value: 'unlimited', label: 'Unlimited', description: 'No automatic deletion' }
];

/**
 * Get retention option by value
 * @param {string} value - The retention value
 * @returns {object|undefined} The retention option or undefined
 */
export function getRetentionOption(value) {
  return RETENTION_OPTIONS.find(option => option.value === value);
}

/**
 * Get retention label by value
 * @param {string} value - The retention value
 * @returns {string} The retention label or 'Unknown'
 */
export function getRetentionLabel(value) {
  const option = getRetentionOption(value);
  return option?.label || 'Unknown';
}

/**
 * Calculate the cutoff date based on retention period
 * @param {string} retentionValue - The retention period value
 * @returns {Date|null} The cutoff date or null if unlimited
 */
export function calculateRetentionCutoff(retentionValue) {
  if (retentionValue === 'unlimited') {
    return null;
  }

  const days = parseInt(retentionValue, 10);
  if (isNaN(days)) {
    return null;
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

/**
 * Check if a date is within the retention period
 * @param {Date} date - The date to check
 * @param {string} retentionValue - The retention period value
 * @returns {boolean} True if within retention period
 */
export function isWithinRetention(date, retentionValue) {
  if (retentionValue === 'unlimited') {
    return true;
  }

  const cutoff = calculateRetentionCutoff(retentionValue);
  if (!cutoff) {
    return true;
  }

  return date >= cutoff;
}

/**
 * Content type-specific retention policies
 * Each content type has a default retention period and description
 */
export const CONTENT_RETENTION_POLICIES = {
  audit_logs: { default: '90', description: 'Audit log entries' },
  readability_analyses: { default: '180', description: 'Readability analysis results' },
  schemas: { default: 'unlimited', description: 'Schema markup library items' },
  reports: { default: '365', description: 'Generated reports' },
  projects: { default: 'unlimited', description: 'Project data' },
  time_entries: { default: '365', description: 'Time tracking entries' },
  file_attachments: { default: '365', description: 'Uploaded file attachments' }
};

/**
 * Get retention policy for a content type
 * @param {string} contentType - The content type key
 * @returns {object} The retention policy with default period and description
 */
export function getContentRetentionPolicy(contentType) {
  return CONTENT_RETENTION_POLICIES[contentType] || { default: 'unlimited', description: 'Unknown content type' };
}

/**
 * Check if a date is within the retention period for a content type
 * @param {Date} date - The date to check
 * @param {string} contentType - The content type key
 * @param {string} [overrideValue] - Optional override retention value
 * @returns {boolean} True if within retention period
 */
export function isContentWithinRetention(date, contentType, overrideValue) {
  const policy = getContentRetentionPolicy(contentType);
  const retentionValue = overrideValue || policy.default;
  return isWithinRetention(date, retentionValue);
}

/**
 * Get compliance recommendation for a retention period
 * @param {string} value - The retention value
 * @returns {string} Compliance recommendation text
 */
export function getComplianceRecommendation(value) {
  switch (value) {
    case '30':
      return 'May not meet compliance requirements for regulated industries';
    case '90':
      return 'Meets most standard business requirements';
    case '180':
      return 'Recommended for organizations with moderate compliance needs';
    case '365':
      return 'Meets most regulatory compliance requirements (SOC 2, HIPAA, etc.)';
    case 'unlimited':
      return 'Maximum retention - may have storage cost implications';
    default:
      return 'Unknown retention period';
  }
}
