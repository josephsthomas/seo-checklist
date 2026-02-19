/**
 * Scoring Engine
 * Runs all checks, calculates category and overall scores, maps grades
 */

import { runContentStructureChecks } from './checks/contentStructure.js';
import { runContentClarityChecks } from './checks/contentClarity.js';
import { runTechnicalAccessChecks } from './checks/technicalAccess.js';
import { runMetadataSchemaChecks } from './checks/metadataSchema.js';
import { runAISignalsChecks } from './checks/aiSignals.js';
import { checkFactDensity } from './checks/factDensity.js';
import { runGoogleAIOChecks } from './checks/googleAIO.js';
import { calculateCategoryScore, calculateOverallScore, integrateAIScores } from './utils/scoreCalculator.js';
import { getGrade, getGradeSummary } from './utils/gradeMapper.js';

/**
 * Run all checks and compute scores
 * @param {Object} extractedContent - Output from extractor.js
 * @param {Object|null} aiAssessment - Optional AI analysis results
 * @returns {Object} Complete scoring results
 */
export function scoreContent(extractedContent, aiAssessment = null) {
  // Run all check categories
  const contentStructureResults = runContentStructureChecks(extractedContent);
  const contentClarityResults = runContentClarityChecks(extractedContent);
  const technicalAccessResults = runTechnicalAccessChecks(extractedContent);
  const metadataSchemaResults = runMetadataSchemaChecks(extractedContent);
  const aiSignalsResults = runAISignalsChecks(extractedContent);

  // Run enhancement checks (E-015, E-045)
  const factDensityResult = checkFactDensity(extractedContent);
  const googleAIOResults = runGoogleAIOChecks(extractedContent);

  // Append enhancement checks to their parent categories
  contentClarityResults.push(factDensityResult);
  aiSignalsResults.push(...googleAIOResults);

  // Calculate category scores
  const rawCategoryScores = {
    contentStructure: calculateCategoryScore(contentStructureResults, extractedContent.language),
    contentClarity: calculateCategoryScore(contentClarityResults, extractedContent.language),
    technicalAccess: calculateCategoryScore(technicalAccessResults),
    metadataSchema: calculateCategoryScore(metadataSchemaResults),
    aiSignals: calculateCategoryScore(aiSignalsResults)
  };

  // Integrate AI assessment if available
  const categoryScores = aiAssessment
    ? integrateAIScores(rawCategoryScores, aiAssessment)
    : rawCategoryScores;

  // Calculate overall score
  const overallScore = calculateOverallScore(categoryScores);
  const gradeInfo = getGrade(overallScore);

  // Combine all check results
  const allChecks = [
    ...contentStructureResults,
    ...contentClarityResults,
    ...technicalAccessResults,
    ...metadataSchemaResults,
    ...aiSignalsResults
  ];

  // Generate issue summary
  const issueSummary = {
    critical: allChecks.filter(c => c.status === 'fail' && c.severity === 'critical').length,
    high: allChecks.filter(c => c.status === 'fail' && c.severity === 'high').length,
    medium: allChecks.filter(c => c.status === 'fail' && c.severity === 'medium').length,
    low: allChecks.filter(c => c.status === 'fail' && c.severity === 'low').length,
    warnings: allChecks.filter(c => c.status === 'warn').length,
    passed: allChecks.filter(c => c.status === 'pass').length,
    na: allChecks.filter(c => c.status === 'na').length,
    total: allChecks.length
  };

  return {
    overallScore,
    grade: gradeInfo.grade,
    gradeColor: gradeInfo.color,
    gradeLabel: gradeInfo.label,
    gradeSummary: getGradeSummary(gradeInfo.grade),
    categoryScores: {
      contentStructure: { score: categoryScores.contentStructure, label: 'Content Structure', weight: '20%' },
      contentClarity: { score: categoryScores.contentClarity, label: 'Content Clarity', weight: '25%' },
      technicalAccess: { score: categoryScores.technicalAccess, label: 'Technical Accessibility', weight: '20%' },
      metadataSchema: { score: categoryScores.metadataSchema, label: 'Metadata & Schema', weight: '15%' },
      aiSignals: { score: categoryScores.aiSignals, label: 'AI-Specific Signals', weight: '20%' }
    },
    checkResults: {
      contentStructure: contentStructureResults,
      contentClarity: contentClarityResults,
      technicalAccess: technicalAccessResults,
      metadataSchema: metadataSchemaResults,
      aiSignals: aiSignalsResults
    },
    allChecks,
    issueSummary,
    aiAssessmentUsed: !!aiAssessment,
    scoringVersion: '1.0.0'
  };
}

export default scoreContent;
