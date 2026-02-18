/**
 * Analysis Aggregator
 * Combines extracted content, scores, LLM extractions, AI analysis, and recommendations
 * Normalizes into the Firestore document structure
 */

import { extractContent } from './extractor.js';
import { scoreContent } from './scorer.js';
import { analyzeWithAI } from './aiAnalyzer.js';
import { extractWithAllLLMs } from './llmPreview.js';
import { generateRecommendations } from './recommendations.js';

/**
 * Run full analysis pipeline
 * @param {string} htmlContent - Raw HTML
 * @param {Object} options - { sourceUrl, inputMethod, signal, onProgress }
 * @returns {Object} Complete analysis document ready for Firestore
 */
export async function runFullAnalysis(htmlContent, options = {}) {
  const { sourceUrl, inputMethod = 'url', filename, signal, onProgress, authToken } = options;

  // Stage 1: Extract content
  onProgress?.({ stage: 'extracting', progress: 15, message: 'Extracting content...' });
  const extracted = extractContent(htmlContent, { sourceUrl, inputMethod });

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  // Stage 2: AI Analysis + LLM Previews (parallel)
  onProgress?.({ stage: 'analyzing', progress: 25, message: 'Running AI analysis...' });

  const [aiAssessment, llmExtractions] = await Promise.all([
    analyzeWithAI(extracted, { signal, authToken }).catch(err => {
      console.error('AI analysis failed:', err);
      return { available: false, fallback: true, fallbackReason: err.message };
    }),
    extractWithAllLLMs(extracted, { signal, authToken, sourceUrl }).catch(err => {
      console.error('LLM extraction failed:', err);
      return {};
    })
  ]);

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  // Stage 3: Score content
  onProgress?.({ stage: 'scoring', progress: 85, message: 'Calculating scores...' });
  const scoring = scoreContent(extracted, aiAssessment?.available ? aiAssessment : null);

  // Stage 4: Generate recommendations
  onProgress?.({ stage: 'recommendations', progress: 90, message: 'Generating recommendations...' });
  const recommendations = generateRecommendations(scoring, aiAssessment?.available ? aiAssessment : null);

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  // Stage 5: Assemble final document
  onProgress?.({ stage: 'finalizing', progress: 95, message: 'Finalizing...' });

  const now = new Date().toISOString();

  const analysisDocument = {
    // Core identification
    sourceUrl: sourceUrl || null,
    inputMethod,
    filename: filename || null,
    organizationId: options.organizationId || null,
    projectId: options.projectId || null,
    clientName: options.clientName || null,
    tags: options.tags || [],
    analyzedAt: now,
    createdAt: now,

    // Content metadata
    pageTitle: extracted.metadata.title || '',
    pageDescription: extracted.metadata.description || '',
    language: extracted.language,
    wordCount: extracted.wordCount,
    isScreamingFrog: extracted.isScreamingFrog,

    // Scoring
    overallScore: scoring.overallScore,
    grade: scoring.grade,
    gradeColor: scoring.gradeColor,
    gradeLabel: scoring.gradeLabel,
    gradeSummary: scoring.gradeSummary,
    categoryScores: scoring.categoryScores,
    issueSummary: scoring.issueSummary,

    // Check results (all 50+ checks)
    checkResults: scoring.checkResults,

    // AI assessment
    aiAssessment: aiAssessment?.available ? {
      contentSummary: aiAssessment.contentSummary,
      qualityAssessment: aiAssessment.qualityAssessment,
      qualityScore: aiAssessment.qualityScore,
      citationWorthiness: aiAssessment.citationWorthiness,
      citationExplanation: aiAssessment.citationExplanation,
      readabilityIssues: aiAssessment.readabilityIssues
    } : null,

    // LLM extractions
    llmExtractions: llmExtractions,

    // Recommendations
    recommendations,

    // Sharing (populated later)
    isShared: false,
    shareToken: null,
    shareExpiry: null,

    // Trend tracking (populated later)
    previousAnalysisId: null,
    scoreDelta: null,

    // Versioning
    scoringVersion: '1.0.0',
    promptVersion: '1.0.0'
  };

  onProgress?.({ stage: 'complete', progress: 100, message: 'Analysis complete!' });

  return analysisDocument;
}

/**
 * Estimate document size for Firestore 1MB limit check
 */
export function estimateDocumentSize(document) {
  const json = JSON.stringify(document);
  return new Blob([json]).size;
}

/**
 * Truncate LLM extractions if document exceeds Firestore size limits
 * Stores full extractions in Firebase Storage if needed
 */
export function truncateForFirestore(document, maxBytes = 800000) {
  const size = estimateDocumentSize(document);
  if (size <= maxBytes) return { document, overflow: false };

  const truncated = { ...document };
  // Truncate mainContent in each LLM extraction
  if (truncated.llmExtractions) {
    Object.keys(truncated.llmExtractions).forEach(llm => {
      if (truncated.llmExtractions[llm]?.mainContent) {
        truncated.llmExtractions[llm].mainContent =
          truncated.llmExtractions[llm].mainContent.substring(0, 2000) + '\n\n[Content truncated for storage. Full extraction available in Firebase Storage.]';
      }
    });
  }

  return { document: truncated, overflow: true, originalSize: size };
}

export default runFullAnalysis;
