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
import { calculateScoreConfidence } from './utils/scoreConfidence.js';
import { computeLLMConsensus } from './utils/llmConsensus.js';
import { assessContentFreshness } from './utils/contentFreshness.js';
import { detectPageType } from './utils/pageTypeDetector.js';
import { getReadabilityScore } from './utils/readabilityFormulas.js';
import { scoreAllSchemas } from './utils/schemaValidator.js';
import { getIndustryProfile } from './profiles/industryProfiles.js';

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

  // Stage 3: Score content (Task 46: wrapped in try/catch to prevent pipeline crash)
  onProgress?.({ stage: 'scoring', progress: 85, message: 'Calculating scores...' });
  let scoring;
  try {
    scoring = scoreContent(extracted, aiAssessment?.available ? aiAssessment : null);
  } catch (scoringErr) {
    console.error('Scoring pipeline failed, using fallback:', scoringErr);
    scoring = {
      overallScore: 0,
      grade: 'F',
      gradeColor: 'red',
      gradeLabel: 'Scoring Error',
      gradeSummary: 'Scoring could not be completed. Please try again.',
      categoryScores: {},
      issueSummary: { critical: 0, high: 0, medium: 0, low: 0 },
      checkResults: []
    };
  }

  // Stage 4: Generate recommendations (Task 46: wrapped in try/catch)
  onProgress?.({ stage: 'recommendations', progress: 90, message: 'Generating recommendations...' });
  let recommendations;
  try {
    recommendations = generateRecommendations(scoring, aiAssessment?.available ? aiAssessment : null);
  } catch (recErr) {
    console.error('Recommendations generation failed:', recErr);
    recommendations = [];
  }

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  // Stage 5: Compute enhancement metrics (E-009, E-010, E-011, E-016, E-018, E-022)
  onProgress?.({ stage: 'finalizing', progress: 93, message: 'Computing enhancement metrics...' });

  const llmConsensus = computeLLMConsensus(llmExtractions);
  const scoreConfidence = calculateScoreConfidence(scoring, llmConsensus);
  const contentFreshness = assessContentFreshness(extracted);
  const pageType = detectPageType(htmlContent);
  const readabilityScore = getReadabilityScore(extracted.language, {
    totalWords: extracted.wordCount || 0,
    totalSentences: extracted.sentenceCount || 0,
    totalSyllables: extracted.syllableCount || 0,
    longWords: extracted.longWordCount || 0,
    totalChars: extracted.charCount || 0,
  });
  const schemaValidation = scoreAllSchemas(extracted.structuredData || []);
  const industryProfile = options.industry ? getIndustryProfile(options.industry) : null;

  // Stage 6: Assemble final document
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

    // Enhancement metrics (E-009, E-010, E-011, E-016, E-018, E-022)
    scoreConfidence,
    llmConsensus,
    contentFreshness,
    pageType,
    readabilityScore,
    schemaValidation,
    industryProfile: industryProfile ? { key: options.industry, label: industryProfile.label } : null,

    // Sharing (populated later)
    isShared: false,
    shareToken: null,
    shareExpiry: null,

    // Trend tracking (populated later)
    previousAnalysisId: null,
    scoreDelta: null,

    // Versioning
    scoringVersion: '1.0.0',
    promptVersion: '1.0.0',

    // E-020: Model version tracking for drift detection
    modelVersions: {
      claude: 'claude-sonnet-4-5-20250929',
      openai: 'gpt-4o',
      gemini: 'gemini-2.0-flash',
    }
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
