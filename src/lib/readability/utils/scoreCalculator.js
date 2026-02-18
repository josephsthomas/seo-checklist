/**
 * Score Calculator for AI Readability Checker
 * Computes weighted category scores and overall score
 */

const CATEGORY_WEIGHTS = {
  contentStructure: 0.20,
  contentClarity: 0.25,
  technicalAccess: 0.20,
  metadataSchema: 0.15,
  aiSignals: 0.20
};

const CHECK_SEVERITY_WEIGHTS = {
  critical: 1.0,
  high: 0.8,
  medium: 0.5,
  low: 0.3
};

/**
 * Calculate score for a single category
 * @param {Array} checks - Array of check results
 * @param {string|null} language - Content language for CC-01 redistribution
 * @returns {number} Score 0-100
 */
export function calculateCategoryScore(checks, language = null) {
  if (!checks || checks.length === 0) return 0;

  // Filter out N/A checks
  const activeChecks = checks.filter(c => c.status !== 'na');
  if (activeChecks.length === 0) return 100;

  let totalWeight = 0;
  let weightedScore = 0;

  activeChecks.forEach(check => {
    const severityWeight = CHECK_SEVERITY_WEIGHTS[check.severity] || CHECK_SEVERITY_WEIGHTS.medium;
    totalWeight += severityWeight;

    if (check.status === 'pass') {
      weightedScore += severityWeight * 100;
    } else if (check.status === 'warn') {
      weightedScore += severityWeight * 60;
    }
    // 'fail' adds 0
  });

  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
}

/**
 * Calculate overall weighted score from category scores
 * @param {Object} categoryScores - { contentStructure, contentClarity, technicalAccess, metadataSchema, aiSignals }
 * @returns {number} Overall score 0-100
 */
export function calculateOverallScore(categoryScores) {
  let score = 0;
  let totalWeight = 0;

  Object.entries(CATEGORY_WEIGHTS).forEach(([category, weight]) => {
    const categoryScore = categoryScores[category];
    if (categoryScore !== undefined && categoryScore !== null) {
      score += categoryScore * weight;
      totalWeight += weight;
    }
  });

  if (totalWeight === 0) return 0;

  // Normalize if some categories missing
  const normalizedScore = score / totalWeight;
  return Math.round(normalizedScore);
}

/**
 * Integrate AI assessment scores into category scores
 * AI contributes up to 30% of Content Clarity and AI-Specific Signals
 * @param {Object} categoryScores
 * @param {Object|null} aiAssessment - { citationWorthiness, qualityScore }
 * @returns {Object} Adjusted category scores
 */
export function integrateAIScores(categoryScores, aiAssessment) {
  if (!aiAssessment) return categoryScores;

  const adjusted = { ...categoryScores };

  if (aiAssessment.qualityScore !== undefined && adjusted.contentClarity !== undefined) {
    adjusted.contentClarity = Math.round(
      adjusted.contentClarity * 0.7 + aiAssessment.qualityScore * 0.3
    );
  }

  if (aiAssessment.citationWorthiness !== undefined && adjusted.aiSignals !== undefined) {
    adjusted.aiSignals = Math.round(
      adjusted.aiSignals * 0.7 + aiAssessment.citationWorthiness * 0.3
    );
  }

  return adjusted;
}

export { CATEGORY_WEIGHTS, CHECK_SEVERITY_WEIGHTS };
export default calculateOverallScore;
