/**
 * Accessibility Audit Engine
 * Processes Screaming Frog accessibility data and generates WCAG compliance results
 */

import { WCAG_CRITERIA, WCAG_PRINCIPLES, getCriteriaUpToLevel } from '../../data/wcagCriteria';
import { IMPACT_LEVELS, getRuleByFileName } from '../../data/axeRules';

/**
 * Compliance status values
 */
export const COMPLIANCE_STATUS = {
  SUPPORTS: 'supports',
  PARTIALLY_SUPPORTS: 'partially_supports',
  DOES_NOT_SUPPORT: 'does_not_support',
  NOT_APPLICABLE: 'not_applicable',
  NOT_EVALUATED: 'not_evaluated'
};

/**
 * Run the accessibility audit on parsed data
 * @param {Object} accessibilityData - Parsed accessibility files from excelParser
 * @param {Function} onProgress - Progress callback
 * @returns {Object} - Complete audit results
 */
export async function runAccessibilityAudit(accessibilityData, onProgress = () => {}) {
  const startTime = Date.now();

  onProgress(0, 'Starting accessibility audit...');

  // Initialize results structure
  const results = {
    success: true,
    timestamp: new Date().toISOString(),
    processingTime: 0,

    // Summary stats
    summary: {
      totalUrls: 0,
      urlsWithViolations: 0,
      totalViolations: 0,
      uniqueViolationTypes: 0
    },

    // Scores
    scores: {
      overall: 0,
      byLevel: {
        A: { score: 0, pass: 0, fail: 0, total: 0 },
        AA: { score: 0, pass: 0, fail: 0, total: 0 },
        AAA: { score: 0, pass: 0, fail: 0, total: 0 }
      },
      byPrinciple: {
        perceivable: { score: 0, violations: 0 },
        operable: { score: 0, violations: 0 },
        understandable: { score: 0, violations: 0 },
        robust: { score: 0, violations: 0 }
      },
      byImpact: {
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0
      }
    },

    // Violations grouped by rule
    violationsByRule: {},

    // Violations grouped by WCAG criterion
    violationsByCriterion: {},

    // URL-level data
    urlData: [],

    // WCAG criteria status
    criteriaStatus: {},

    // Top issues
    topIssues: [],

    // Pages with most violations
    worstPages: []
  };

  try {
    // Step 1: Parse the main accessibility_all.xlsx
    onProgress(10, 'Parsing main accessibility data...');
    const mainData = parseMainAccessibilityData(accessibilityData);
    results.summary.totalUrls = mainData.totalUrls;
    results.urlData = mainData.urls;

    // Step 2: Process individual violation files
    onProgress(30, 'Processing violation files...');
    const violations = await processViolationFiles(accessibilityData, onProgress);
    results.violationsByRule = violations.byRule;
    results.summary.uniqueViolationTypes = Object.keys(violations.byRule).length;

    // Step 3: Map violations to WCAG criteria
    onProgress(60, 'Mapping to WCAG criteria...');
    results.violationsByCriterion = mapViolationsToCriteria(violations.byRule);

    // Step 4: Calculate compliance scores
    onProgress(75, 'Calculating compliance scores...');
    results.scores = calculateComplianceScores(results.violationsByRule, results.summary.totalUrls);

    // Step 5: Determine WCAG criteria status
    onProgress(85, 'Determining criteria status...');
    results.criteriaStatus = determineCriteriaStatus(results.violationsByCriterion);

    // Step 6: Calculate summary stats
    onProgress(90, 'Generating summary...');
    results.summary.totalViolations = countTotalViolations(results.violationsByRule);
    results.summary.urlsWithViolations = countUrlsWithViolations(results.urlData);

    // Step 7: Generate top issues and worst pages
    onProgress(95, 'Identifying top issues...');
    results.topIssues = getTopIssues(results.violationsByRule, 10);
    results.worstPages = getWorstPages(results.urlData, 10);

    results.processingTime = Date.now() - startTime;
    onProgress(100, 'Audit complete');

  } catch (error) {
    console.error('Accessibility audit error:', error);
    results.success = false;
    results.error = error.message;
  }

  return results;
}

/**
 * Parse the main accessibility_all.xlsx file
 */
function parseMainAccessibilityData(accessibilityData) {
  const mainFile = accessibilityData['accessibility_all.xlsx'];

  if (!mainFile || !mainFile.rows) {
    return { totalUrls: 0, urls: [] };
  }

  const urls = mainFile.rows.map(row => ({
    address: row['Address'] || '',
    contentType: row['Content Type'] || '',
    statusCode: row['Status Code'] || '',
    indexability: row['Indexability'] || '',
    allViolations: parseInt(row['All Violations'], 10) || 0,
    bestPracticeViolations: parseInt(row['Best Practice Violations'], 10) || 0,
    wcag20AViolations: parseInt(row['WCAG 2.0 A Violations'], 10) || 0,
    wcag20AAViolations: parseInt(row['WCAG 2.0 AA Violations'], 10) || 0,
    wcag20AAAViolations: parseInt(row['WCAG 2.0 AAA Violations'], 10) || 0,
    wcag21AAViolations: parseInt(row['WCAG 2.1 AA Violations'], 10) || 0,
    wcag22AAViolations: parseInt(row['WCAG 2.2 AA Violations'], 10) || 0
  }));

  return {
    totalUrls: urls.length,
    urls
  };
}

/**
 * Process individual violation files
 */
async function processViolationFiles(accessibilityData, onProgress) {
  const byRule = {};
  const fileNames = Object.keys(accessibilityData);

  // Filter to only violation files (exclude summary files)
  const violationFiles = fileNames.filter(name =>
    name.startsWith('accessibility_') &&
    name !== 'accessibility_all.xlsx' &&
    name !== 'accessibility_violations_summary.xlsx' &&
    !name.includes('_score_') &&
    !name.includes('wcag_2_')
  );

  let processed = 0;
  const total = violationFiles.length;

  for (const fileName of violationFiles) {
    const fileData = accessibilityData[fileName];

    if (!fileData || !fileData.rows || fileData.rows.length === 0) {
      processed++;
      continue;
    }

    // Get rule metadata from our data layer
    const rule = getRuleByFileName(fileName);
    const ruleId = fileName
      .replace('accessibility_', '')
      .replace('.xlsx', '');

    byRule[ruleId] = {
      id: ruleId,
      fileName,
      name: rule?.name || formatRuleName(ruleId),
      description: rule?.description || '',
      help: rule?.help || '',
      wcagCriteria: rule?.wcagCriteria || [],
      wcagLevel: rule?.wcagLevel || 'best-practice',
      impact: rule?.impact || IMPACT_LEVELS.MODERATE,
      category: rule?.category || 'other',
      aiFixable: rule?.aiFixable || false,
      fixSuggestion: rule?.fixSuggestion || '',
      urlCount: fileData.rows.length,
      urls: fileData.rows.map(row => ({
        address: row['Address'] || '',
        contentType: row['Content Type'] || '',
        statusCode: row['Status Code'] || '',
        indexability: row['Indexability'] || '',
        violations: parseInt(row['All Violations'], 10) || 0
      }))
    };

    processed++;
    if (processed % 10 === 0) {
      onProgress(30 + Math.round((processed / total) * 30), `Processing ${processed}/${total} violation types...`);
    }
  }

  return { byRule };
}

/**
 * Map violations to WCAG criteria
 */
function mapViolationsToCriteria(violationsByRule) {
  const byCriterion = {};

  // Initialize all criteria
  Object.keys(WCAG_CRITERIA).forEach(criterionId => {
    byCriterion[criterionId] = {
      criterion: WCAG_CRITERIA[criterionId],
      violations: [],
      totalUrls: 0,
      status: COMPLIANCE_STATUS.NOT_EVALUATED
    };
  });

  // Map violations to criteria
  Object.values(violationsByRule).forEach(rule => {
    if (rule.wcagCriteria && rule.wcagCriteria.length > 0) {
      rule.wcagCriteria.forEach(criterionId => {
        if (byCriterion[criterionId]) {
          byCriterion[criterionId].violations.push({
            ruleId: rule.id,
            ruleName: rule.name,
            impact: rule.impact,
            urlCount: rule.urlCount
          });
          byCriterion[criterionId].totalUrls += rule.urlCount;
        }
      });
    }
  });

  return byCriterion;
}

/**
 * Calculate compliance scores
 */
function calculateComplianceScores(violationsByRule, totalUrls) {
  const scores = {
    overall: 100,
    byLevel: {
      A: { score: 100, pass: 0, fail: 0, total: 0 },
      AA: { score: 100, pass: 0, fail: 0, total: 0 },
      AAA: { score: 100, pass: 0, fail: 0, total: 0 }
    },
    byPrinciple: {
      perceivable: { score: 100, violations: 0 },
      operable: { score: 100, violations: 0 },
      understandable: { score: 100, violations: 0 },
      robust: { score: 100, violations: 0 }
    },
    byImpact: {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0
    }
  };

  if (totalUrls === 0) return scores;

  // Count violations by level and principle
  const levelViolations = { A: 0, AA: 0, AAA: 0 };
  const principleViolations = {
    perceivable: 0,
    operable: 0,
    understandable: 0,
    robust: 0
  };

  Object.values(violationsByRule).forEach(rule => {
    // Count by impact
    scores.byImpact[rule.impact] = (scores.byImpact[rule.impact] || 0) + rule.urlCount;

    // Count by WCAG level
    if (rule.wcagLevel === 'A') {
      levelViolations.A += rule.urlCount;
    } else if (rule.wcagLevel === 'AA') {
      levelViolations.AA += rule.urlCount;
    } else if (rule.wcagLevel === 'AAA') {
      levelViolations.AAA += rule.urlCount;
    }

    // Count by principle (look up from criteria)
    if (rule.wcagCriteria && rule.wcagCriteria.length > 0) {
      const criterion = WCAG_CRITERIA[rule.wcagCriteria[0]];
      if (criterion && criterion.principle) {
        principleViolations[criterion.principle] += rule.urlCount;
      }
    }
  });

  // Calculate level scores (percentage of URLs without violations at each level)
  const automatedCriteriaA = Object.values(WCAG_CRITERIA).filter(
    c => c.level === 'A' && c.axeRules && c.axeRules.length > 0
  ).length;
  const automatedCriteriaAA = Object.values(WCAG_CRITERIA).filter(
    c => c.level === 'AA' && c.axeRules && c.axeRules.length > 0
  ).length;
  const automatedCriteriaAAA = Object.values(WCAG_CRITERIA).filter(
    c => c.level === 'AAA' && c.axeRules && c.axeRules.length > 0
  ).length;

  // Level A score
  scores.byLevel.A.total = automatedCriteriaA;
  scores.byLevel.A.fail = countFailingCriteria(violationsByRule, 'A');
  scores.byLevel.A.pass = automatedCriteriaA - scores.byLevel.A.fail;
  scores.byLevel.A.score = automatedCriteriaA > 0
    ? Math.round((scores.byLevel.A.pass / automatedCriteriaA) * 100)
    : 100;

  // Level AA score (cumulative with A)
  scores.byLevel.AA.total = automatedCriteriaAA;
  scores.byLevel.AA.fail = countFailingCriteria(violationsByRule, 'AA');
  scores.byLevel.AA.pass = automatedCriteriaAA - scores.byLevel.AA.fail;
  scores.byLevel.AA.score = automatedCriteriaAA > 0
    ? Math.round((scores.byLevel.AA.pass / automatedCriteriaAA) * 100)
    : 100;

  // Level AAA score
  scores.byLevel.AAA.total = automatedCriteriaAAA;
  scores.byLevel.AAA.fail = countFailingCriteria(violationsByRule, 'AAA');
  scores.byLevel.AAA.pass = automatedCriteriaAAA - scores.byLevel.AAA.fail;
  scores.byLevel.AAA.score = automatedCriteriaAAA > 0
    ? Math.round((scores.byLevel.AAA.pass / automatedCriteriaAAA) * 100)
    : 100;

  // Principle scores
  const maxViolationsPerPrinciple = totalUrls * 10; // Normalize factor
  Object.keys(principleViolations).forEach(principle => {
    scores.byPrinciple[principle].violations = principleViolations[principle];
    scores.byPrinciple[principle].score = Math.max(0, Math.round(
      100 - (principleViolations[principle] / maxViolationsPerPrinciple) * 100
    ));
  });

  // Overall score (weighted by impact)
  const totalImpactScore =
    scores.byImpact.critical * 4 +
    scores.byImpact.serious * 3 +
    scores.byImpact.moderate * 2 +
    scores.byImpact.minor * 1;

  const maxPossibleImpact = totalUrls * 4 * Object.keys(violationsByRule).length;
  scores.overall = maxPossibleImpact > 0
    ? Math.max(0, Math.round(100 - (totalImpactScore / maxPossibleImpact) * 100))
    : 100;

  // Also calculate a simpler score based on A and AA compliance
  const combinedAAScore = Math.round(
    (scores.byLevel.A.score * 0.6) + (scores.byLevel.AA.score * 0.4)
  );
  scores.overall = combinedAAScore;

  return scores;
}

/**
 * Count criteria failing at a specific level
 */
function countFailingCriteria(violationsByRule, level) {
  const failingCriteria = new Set();

  Object.values(violationsByRule).forEach(rule => {
    if (rule.wcagLevel === level && rule.urlCount > 0) {
      rule.wcagCriteria?.forEach(criterionId => {
        failingCriteria.add(criterionId);
      });
    }
  });

  return failingCriteria.size;
}

/**
 * Determine status for each WCAG criterion
 */
function determineCriteriaStatus(violationsByCriterion) {
  const status = {};

  Object.entries(violationsByCriterion).forEach(([criterionId, data]) => {
    const criterion = WCAG_CRITERIA[criterionId];

    if (!criterion) {
      status[criterionId] = COMPLIANCE_STATUS.NOT_EVALUATED;
      return;
    }

    // If no automated rules exist, mark as not evaluated
    if (!criterion.axeRules || criterion.axeRules.length === 0) {
      status[criterionId] = COMPLIANCE_STATUS.NOT_EVALUATED;
      return;
    }

    // Check if there are violations
    if (data.violations.length === 0 || data.totalUrls === 0) {
      status[criterionId] = COMPLIANCE_STATUS.SUPPORTS;
    } else if (data.totalUrls < 10) {
      status[criterionId] = COMPLIANCE_STATUS.PARTIALLY_SUPPORTS;
    } else {
      status[criterionId] = COMPLIANCE_STATUS.DOES_NOT_SUPPORT;
    }
  });

  return status;
}

/**
 * Count total violations across all rules
 */
function countTotalViolations(violationsByRule) {
  return Object.values(violationsByRule).reduce((sum, rule) => sum + rule.urlCount, 0);
}

/**
 * Count URLs with at least one violation
 */
function countUrlsWithViolations(urlData) {
  return urlData.filter(url => url.allViolations > 0).length;
}

/**
 * Get top issues sorted by URL count and impact
 */
function getTopIssues(violationsByRule, limit = 10) {
  const impactWeight = {
    critical: 4,
    serious: 3,
    moderate: 2,
    minor: 1
  };

  return Object.values(violationsByRule)
    .filter(rule => rule.urlCount > 0)
    .sort((a, b) => {
      const weightA = a.urlCount * (impactWeight[a.impact] || 1);
      const weightB = b.urlCount * (impactWeight[b.impact] || 1);
      return weightB - weightA;
    })
    .slice(0, limit)
    .map(rule => ({
      ruleId: rule.id,
      name: rule.name,
      impact: rule.impact,
      wcagCriteria: rule.wcagCriteria,
      wcagLevel: rule.wcagLevel,
      urlCount: rule.urlCount,
      aiFixable: rule.aiFixable
    }));
}

/**
 * Get pages with most violations
 */
function getWorstPages(urlData, limit = 10) {
  return [...urlData]
    .filter(url => url.allViolations > 0)
    .sort((a, b) => b.allViolations - a.allViolations)
    .slice(0, limit)
    .map(url => ({
      address: url.address,
      totalViolations: url.allViolations,
      levelA: url.wcag20AViolations,
      levelAA: url.wcag20AAViolations + url.wcag21AAViolations + url.wcag22AAViolations,
      levelAAA: url.wcag20AAAViolations,
      bestPractice: url.bestPracticeViolations
    }));
}

/**
 * Format rule ID into readable name
 */
function formatRuleName(ruleId) {
  return ruleId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get compliance summary for a specific WCAG level
 * @param {Object} results - Audit results
 * @param {string} level - WCAG level (A, AA, AAA)
 * @returns {Object} - Compliance summary
 */
export function getComplianceForLevel(results, level) {
  const criteria = getCriteriaUpToLevel(level);
  const automated = criteria.filter(c => c.axeRules && c.axeRules.length > 0);

  let passing = 0;
  let failing = 0;
  let notEvaluated = 0;

  automated.forEach(criterion => {
    const status = results.criteriaStatus[criterion.id];
    if (status === COMPLIANCE_STATUS.SUPPORTS) {
      passing++;
    } else if (status === COMPLIANCE_STATUS.DOES_NOT_SUPPORT || status === COMPLIANCE_STATUS.PARTIALLY_SUPPORTS) {
      failing++;
    } else {
      notEvaluated++;
    }
  });

  return {
    level,
    totalCriteria: criteria.length,
    automatedCriteria: automated.length,
    passing,
    failing,
    notEvaluated,
    manualCheckRequired: criteria.length - automated.length,
    compliancePercent: automated.length > 0
      ? Math.round((passing / automated.length) * 100)
      : 100
  };
}

/**
 * Get violations for a specific URL
 * @param {Object} results - Audit results
 * @param {string} url - The URL to get violations for
 * @returns {Array} - Array of violations for that URL
 */
export function getViolationsForUrl(results, url) {
  const violations = [];

  Object.values(results.violationsByRule).forEach(rule => {
    const matchingUrl = rule.urls.find(u => u.address === url);
    if (matchingUrl) {
      violations.push({
        ruleId: rule.id,
        name: rule.name,
        description: rule.description,
        help: rule.help,
        impact: rule.impact,
        wcagCriteria: rule.wcagCriteria,
        wcagLevel: rule.wcagLevel,
        aiFixable: rule.aiFixable,
        fixSuggestion: rule.fixSuggestion
      });
    }
  });

  return violations.sort((a, b) => {
    const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
    return (impactOrder[a.impact] || 4) - (impactOrder[b.impact] || 4);
  });
}

/**
 * Filter violations by various criteria
 * @param {Object} results - Audit results
 * @param {Object} filters - Filter options
 * @returns {Array} - Filtered violations
 */
export function filterViolations(results, filters = {}) {
  let violations = Object.values(results.violationsByRule);

  // Filter by WCAG level
  if (filters.level) {
    violations = violations.filter(v => v.wcagLevel === filters.level);
  }

  // Filter by impact
  if (filters.impact) {
    violations = violations.filter(v => v.impact === filters.impact);
  }

  // Filter by principle
  if (filters.principle) {
    violations = violations.filter(v => {
      if (!v.wcagCriteria || v.wcagCriteria.length === 0) return false;
      const criterion = WCAG_CRITERIA[v.wcagCriteria[0]];
      return criterion && criterion.principle === filters.principle;
    });
  }

  // Filter by AI fixable
  if (filters.aiFixable !== undefined) {
    violations = violations.filter(v => v.aiFixable === filters.aiFixable);
  }

  // Filter by URL pattern
  if (filters.urlPattern) {
    const regex = new RegExp(filters.urlPattern, 'i');
    violations = violations.map(v => ({
      ...v,
      urls: v.urls.filter(u => regex.test(u.address)),
      urlCount: v.urls.filter(u => regex.test(u.address)).length
    })).filter(v => v.urlCount > 0);
  }

  return violations;
}

export default {
  runAccessibilityAudit,
  getComplianceForLevel,
  getViolationsForUrl,
  filterViolations,
  COMPLIANCE_STATUS
};
