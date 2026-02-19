/**
 * E-009: Score Confidence Interval
 * Calculate confidence range based on N/A checks and LLM disagreement
 */

/**
 * Calculate score confidence interval
 * @param {Object} scoringResults - From scorer
 * @param {Object|null} llmConsensus - From llmConsensus.js
 * @returns {{ score: number, confidence: number, range: [number, number], label: string }}
 */
export function calculateScoreConfidence(scoringResults, llmConsensus = null) {
  const allChecks = scoringResults?.allChecks || scoringResults?.checkResults || [];
  const totalChecks = Array.isArray(allChecks) ? allChecks.length : Object.keys(allChecks).length;
  const checksArray = Array.isArray(allChecks) ? allChecks : Object.values(allChecks);

  // Count N/A checks (reduce confidence)
  const naCount = checksArray.filter(c => c.status === 'na').length;
  const naRatio = totalChecks > 0 ? naCount / totalChecks : 0;

  // Base confidence starts at 95% and decreases with N/A ratio
  let confidence = 95 - Math.round(naRatio * 40);

  // LLM disagreement further reduces confidence
  if (llmConsensus?.available && llmConsensus.overall < 60) {
    confidence -= Math.round((60 - llmConsensus.overall) / 4);
  }

  // Clamp confidence
  confidence = Math.max(40, Math.min(99, confidence));

  // Calculate margin of error (inverse of confidence)
  const marginOfError = Math.round((100 - confidence) / 10);

  const score = scoringResults?.overallScore || 0;
  const range = [
    Math.max(0, score - marginOfError),
    Math.min(100, score + marginOfError),
  ];

  let label = 'High confidence';
  if (confidence < 70) label = 'Low confidence';
  else if (confidence < 85) label = 'Moderate confidence';

  return { score, confidence, range, marginOfError, label };
}

export default calculateScoreConfidence;
