/**
 * Audit Log Retention Policy Configuration
 * Defines available retention periods and related utilities
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
