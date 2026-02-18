/**
 * Integration Tests — Full pipeline from HTML to final analysis document
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractContent } from '../extractor.js';
import { scoreContent } from '../scorer.js';
import { generateRecommendations } from '../recommendations.js';
import { estimateDocumentSize, truncateForFirestore } from '../aggregator.js';

const FIXTURES_DIR = join(__dirname, 'fixtures');

function loadFixture(name) {
  return readFileSync(join(FIXTURES_DIR, name), 'utf-8');
}

function runFullPipeline(fixtureName, options = {}) {
  const html = loadFixture(fixtureName);
  const extracted = extractContent(html, {
    sourceUrl: options.sourceUrl || 'https://example.com/test',
    inputMethod: options.inputMethod || 'url',
  });
  const scoring = scoreContent(extracted, options.aiAssessment || null);
  const recommendations = generateRecommendations(scoring, options.aiAssessment || null);

  return {
    extracted,
    scoring,
    recommendations,
    document: {
      sourceUrl: extracted.sourceUrl,
      inputMethod: extracted.inputMethod,
      analyzedAt: new Date().toISOString(),
      pageTitle: extracted.metadata.title || '',
      pageDescription: extracted.metadata.description || '',
      language: extracted.language,
      wordCount: extracted.wordCount,
      isScreamingFrog: extracted.isScreamingFrog,
      overallScore: scoring.overallScore,
      grade: scoring.grade,
      gradeColor: scoring.gradeColor,
      gradeLabel: scoring.gradeLabel,
      gradeSummary: scoring.gradeSummary,
      categoryScores: scoring.categoryScores,
      issueSummary: scoring.issueSummary,
      checkResults: scoring.checkResults,
      recommendations,
      scoringVersion: '1.0.0',
    },
  };
}

describe('Full Pipeline Integration', () => {
  describe('perfect content', () => {
    it('produces high score (>= 75) and good grade', () => {
      const { scoring } = runFullPipeline('perfect-score.html');
      expect(scoring.overallScore).toBeGreaterThanOrEqual(75);
      expect(['A+', 'A', 'A-', 'B+', 'B']).toContain(scoring.grade);
    });

    it('has more passes than failures', () => {
      const { scoring } = runFullPipeline('perfect-score.html');
      const totalFails = scoring.issueSummary.critical + scoring.issueSummary.high +
        scoring.issueSummary.medium + scoring.issueSummary.low;
      expect(scoring.issueSummary.passed).toBeGreaterThan(totalFails);
    });

    it('generates fewer recommendations than terrible content', () => {
      const { recommendations: perfectRecs } = runFullPipeline('perfect-score.html');
      const { recommendations: terribleRecs } = runFullPipeline('terrible-score.html');
      expect(perfectRecs.length).toBeLessThan(terribleRecs.length);
    });
  });

  describe('terrible content', () => {
    it('produces low score (< 60) and poor grade', () => {
      const { scoring } = runFullPipeline('terrible-score.html');
      expect(scoring.overallScore).toBeLessThan(60);
      expect(['F', 'D', 'D-', 'D+']).toContain(scoring.grade);
    });

    it('has many failures', () => {
      const { scoring } = runFullPipeline('terrible-score.html');
      const totalFails = scoring.issueSummary.critical + scoring.issueSummary.high +
        scoring.issueSummary.medium + scoring.issueSummary.low;
      expect(totalFails).toBeGreaterThan(3);
    });

    it('generates many recommendations', () => {
      const { recommendations } = runFullPipeline('terrible-score.html');
      expect(recommendations.length).toBeGreaterThan(5);
    });
  });

  describe('non-English content', () => {
    it('detects non-English language', () => {
      const { extracted } = runFullPipeline('non-english-content.html');
      expect(extracted.language).toBe('de');
    });

    it('CC-01 returns na status', () => {
      const { scoring } = runFullPipeline('non-english-content.html');
      const cc01 = scoring.allChecks.find(c => c.id === 'CC-01');
      expect(cc01).toBeDefined();
      expect(cc01.status).toBe('na');
    });

    it('still produces valid overall score', () => {
      const { scoring } = runFullPipeline('non-english-content.html');
      expect(scoring.overallScore).toBeGreaterThanOrEqual(0);
      expect(scoring.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Screaming Frog export', () => {
    it('detects SF export', () => {
      const { extracted } = runFullPipeline('screaming-frog-export.html');
      expect(extracted.isScreamingFrog).toBe(true);
    });

    it('still produces valid scores', () => {
      const { scoring } = runFullPipeline('screaming-frog-export.html');
      expect(scoring.overallScore).toBeGreaterThanOrEqual(0);
      expect(scoring.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('all checks return valid statuses', () => {
    const fixtures = [
      'perfect-score.html',
      'terrible-score.html',
      'average-content.html',
      'non-english-content.html',
      'screaming-frog-export.html',
      'heavy-javascript.html',
      'rich-structured-data.html',
      'ai-blocked-content.html',
    ];

    for (const fixture of fixtures) {
      it(`all checks valid for ${fixture}`, () => {
        const { scoring } = runFullPipeline(fixture);
        const validStatuses = ['pass', 'warn', 'fail', 'na'];
        for (const check of scoring.allChecks) {
          expect(validStatuses, `Invalid status "${check.status}" on check ${check.id} in ${fixture}`).toContain(check.status);
        }
      });
    }
  });

  describe('Firestore document constraints', () => {
    it('document is valid JSON', () => {
      const { document } = runFullPipeline('perfect-score.html');
      const json = JSON.stringify(document);
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it('document size under 800KB for normal content', () => {
      const { document } = runFullPipeline('perfect-score.html');
      const size = estimateDocumentSize(document);
      expect(size).toBeLessThan(800000);
    });

    it('truncateForFirestore returns unchanged doc if under limit', () => {
      const { document } = runFullPipeline('perfect-score.html');
      const result = truncateForFirestore(document);
      expect(result.overflow).toBe(false);
    });
  });

  describe('document structure', () => {
    it('output document has all required fields', () => {
      const { document } = runFullPipeline('perfect-score.html');
      expect(document.sourceUrl).toBeDefined();
      expect(document.inputMethod).toBeDefined();
      expect(document.analyzedAt).toBeDefined();
      expect(document.pageTitle).toBeTypeOf('string');
      expect(document.pageDescription).toBeTypeOf('string');
      expect(document.language).toBeTypeOf('string');
      expect(document.wordCount).toBeTypeOf('number');
      expect(document.overallScore).toBeTypeOf('number');
      expect(document.grade).toBeTypeOf('string');
      expect(document.categoryScores).toBeDefined();
      expect(document.checkResults).toBeDefined();
      expect(document.recommendations).toBeDefined();
      expect(document.issueSummary).toBeDefined();
    });
  });

  describe('AI assessment integration', () => {
    it('pipeline works with AI assessment', () => {
      const aiAssessment = {
        qualityScore: 85,
        citationWorthiness: 80,
        readabilityIssues: [
          {
            title: 'Test AI suggestion',
            description: 'This is an AI-generated recommendation.',
            priority: 'medium',
          },
        ],
      };
      const { scoring } = runFullPipeline('perfect-score.html', { aiAssessment });
      expect(scoring.aiAssessmentUsed).toBe(true);
      expect(scoring.overallScore).toBeTypeOf('number');
    });

    it('pipeline works without AI assessment', () => {
      const { scoring } = runFullPipeline('perfect-score.html', { aiAssessment: null });
      expect(scoring.aiAssessmentUsed).toBe(false);
      expect(scoring.overallScore).toBeTypeOf('number');
    });
  });

  describe('edge cases', () => {
    it('minimal HTML produces valid output', () => {
      const { scoring } = runFullPipeline('minimal-html.html');
      expect(scoring.overallScore).toBeTypeOf('number');
      expect(scoring.allChecks.length).toBeGreaterThan(0);
    });

    it('JS-heavy page still scores', () => {
      const { scoring } = runFullPipeline('heavy-javascript.html');
      expect(scoring.overallScore).toBeTypeOf('number');
    });

    it('AI-blocked content scores', () => {
      const { scoring } = runFullPipeline('ai-blocked-content.html');
      expect(scoring.overallScore).toBeTypeOf('number');
      // Should have some AI-related check failures
      const aiChecks = scoring.allChecks.filter(c => c.category === 'aiSignals' || c.id?.startsWith('AS-'));
      expect(aiChecks.length).toBeGreaterThan(0);
    });

    it('rich structured data page scores well on metadata', () => {
      const { scoring } = runFullPipeline('rich-structured-data.html');
      expect(scoring.categoryScores.metadataSchema.score).toBeGreaterThanOrEqual(60);
    });
  });
});
