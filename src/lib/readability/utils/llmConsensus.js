/**
 * E-022: LLM Extraction Confidence Scoring
 * Computes cross-LLM agreement for extracted fields
 */

/**
 * Compute similarity between two strings (Jaccard coefficient on words)
 */
function wordSimilarity(a, b) {
  if (!a || !b) return 0;
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Compute consensus score across LLM extractions
 * @param {Object} llmExtractions - { claude: {...}, openai: {...}, gemini: {...} }
 * @returns {Object} Consensus report per field
 */
export function computeLLMConsensus(llmExtractions) {
  if (!llmExtractions || Object.keys(llmExtractions).length < 2) {
    return { overall: 0, fields: {}, available: false };
  }

  const llms = Object.entries(llmExtractions).filter(([, data]) => data && !data.error);
  if (llms.length < 2) return { overall: 0, fields: {}, available: false };

  const fields = ['title', 'description', 'mainContent'];
  const fieldScores = {};

  for (const field of fields) {
    const values = llms.map(([, data]) => data[field]).filter(Boolean);
    if (values.length < 2) {
      fieldScores[field] = { confidence: 0, agreement: 'insufficient data' };
      continue;
    }

    // Compare all pairs
    let totalSim = 0;
    let pairs = 0;
    for (let i = 0; i < values.length; i++) {
      for (let j = i + 1; j < values.length; j++) {
        totalSim += wordSimilarity(values[i], values[j]);
        pairs++;
      }
    }

    const avgSim = pairs > 0 ? totalSim / pairs : 0;
    const confidence = Math.round(avgSim * 100);

    fieldScores[field] = {
      confidence,
      agreement: confidence >= 80 ? 'strong' : confidence >= 50 ? 'moderate' : 'weak',
      llmCount: values.length,
    };
  }

  const overallConfidence = Math.round(
    Object.values(fieldScores).reduce((sum, f) => sum + f.confidence, 0) /
    Object.values(fieldScores).length
  );

  return {
    overall: overallConfidence,
    fields: fieldScores,
    available: true,
  };
}

export default computeLLMConsensus;
