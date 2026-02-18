/**
 * Scorer Tests — validates all 50+ checks, category scores, grade mapping
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractContent } from '../extractor.js';
import { scoreContent } from '../scorer.js';

const FIXTURES_DIR = join(__dirname, 'fixtures');

function loadFixture(name) {
  return readFileSync(join(FIXTURES_DIR, name), 'utf-8');
}

function scoreFixture(name, aiAssessment = null) {
  const html = loadFixture(name);
  const extracted = extractContent(html, { sourceUrl: 'https://example.com/test' });
  return scoreContent(extracted, aiAssessment);
}

describe('scoreContent', () => {
  describe('overall scoring', () => {
    it('scores perfect content high (>= 75)', () => {
      const result = scoreFixture('perfect-score.html');
      expect(result.overallScore).toBeGreaterThanOrEqual(75);
    });

    it('scores terrible content low (< 60)', () => {
      const result = scoreFixture('terrible-score.html');
      expect(result.overallScore).toBeLessThan(60);
    });

    it('scores average content in mid-range (50-85)', () => {
      const result = scoreFixture('average-content.html');
      expect(result.overallScore).toBeGreaterThanOrEqual(50);
      expect(result.overallScore).toBeLessThanOrEqual(85);
    });

    it('returns score between 0 and 100', () => {
      const result = scoreFixture('perfect-score.html');
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
      expect(result.overallScore).toBeLessThanOrEqual(100);
    });
  });

  describe('grade mapping', () => {
    it('assigns grade string', () => {
      const result = scoreFixture('perfect-score.html');
      expect(result.grade).toBeDefined();
      expect(typeof result.grade).toBe('string');
    });

    it('assigns grade color', () => {
      const result = scoreFixture('perfect-score.html');
      expect(result.gradeColor).toBeDefined();
    });

    it('assigns grade label', () => {
      const result = scoreFixture('perfect-score.html');
      expect(result.gradeLabel).toBeDefined();
    });

    it('assigns grade summary', () => {
      const result = scoreFixture('perfect-score.html');
      expect(result.gradeSummary).toBeDefined();
      expect(typeof result.gradeSummary).toBe('string');
    });

    it('grades terrible content as D or F', () => {
      const result = scoreFixture('terrible-score.html');
      expect(['D', 'D-', 'D+', 'F']).toContain(result.grade);
    });
  });

  describe('category scores', () => {
    it('returns all 5 categories', () => {
      const result = scoreFixture('perfect-score.html');
      expect(result.categoryScores).toBeDefined();
      expect(Object.keys(result.categoryScores)).toHaveLength(5);
      expect(result.categoryScores.contentStructure).toBeDefined();
      expect(result.categoryScores.contentClarity).toBeDefined();
      expect(result.categoryScores.technicalAccess).toBeDefined();
      expect(result.categoryScores.metadataSchema).toBeDefined();
      expect(result.categoryScores.aiSignals).toBeDefined();
    });

    it('category scores have score and label', () => {
      const result = scoreFixture('perfect-score.html');
      for (const [key, cat] of Object.entries(result.categoryScores)) {
        expect(cat.score).toBeTypeOf('number');
        expect(cat.label).toBeTypeOf('string');
        expect(cat.weight).toBeTypeOf('string');
      }
    });

    it('category scores between 0 and 100', () => {
      const result = scoreFixture('perfect-score.html');
      for (const [key, cat] of Object.entries(result.categoryScores)) {
        expect(cat.score).toBeGreaterThanOrEqual(0);
        expect(cat.score).toBeLessThanOrEqual(100);
      }
    });

    it('perfect content has high category scores', () => {
      const result = scoreFixture('perfect-score.html');
      expect(result.categoryScores.contentStructure.score).toBeGreaterThanOrEqual(70);
      expect(result.categoryScores.metadataSchema.score).toBeGreaterThanOrEqual(70);
    });

    it('terrible content has low category scores', () => {
      const result = scoreFixture('terrible-score.html');
      // At least some categories should be low
      const scores = Object.values(result.categoryScores).map(c => c.score);
      const minScore = Math.min(...scores);
      expect(minScore).toBeLessThan(60);
    });
  });

  describe('check results', () => {
    it('returns check results grouped by category', () => {
      const result = scoreFixture('perfect-score.html');
      expect(result.checkResults).toBeDefined();
      expect(result.checkResults.contentStructure).toBeDefined();
      expect(result.checkResults.contentClarity).toBeDefined();
      expect(result.checkResults.technicalAccess).toBeDefined();
      expect(result.checkResults.metadataSchema).toBeDefined();
      expect(result.checkResults.aiSignals).toBeDefined();
    });

    it('all checks have valid status', () => {
      const result = scoreFixture('perfect-score.html');
      const validStatuses = ['pass', 'warn', 'fail', 'na'];
      for (const checks of Object.values(result.checkResults)) {
        for (const check of checks) {
          expect(validStatuses).toContain(check.status);
        }
      }
    });

    it('all checks have id and name/title', () => {
      const result = scoreFixture('perfect-score.html');
      for (const checks of Object.values(result.checkResults)) {
        for (const check of checks) {
          expect(check.id).toBeDefined();
          expect(check.name || check.title).toBeDefined();
        }
      }
    });

    it('returns allChecks flat array', () => {
      const result = scoreFixture('perfect-score.html');
      expect(Array.isArray(result.allChecks)).toBe(true);
      expect(result.allChecks.length).toBeGreaterThan(20);
    });
  });

  describe('specific checks', () => {
    it('CS-01: perfect content has single H1', () => {
      const result = scoreFixture('perfect-score.html');
      const cs01 = result.allChecks.find(c => c.id === 'CS-01');
      expect(cs01).toBeDefined();
      expect(cs01.status).toBe('pass');
    });

    it('CS-01: terrible content has no proper H1', () => {
      const result = scoreFixture('terrible-score.html');
      const cs01 = result.allChecks.find(c => c.id === 'CS-01');
      expect(cs01).toBeDefined();
      expect(['fail', 'warn']).toContain(cs01.status);
    });

    it('MS-01: checks title tag presence', () => {
      const result = scoreFixture('perfect-score.html');
      const ms01 = result.allChecks.find(c => c.id === 'MS-01');
      expect(ms01).toBeDefined();
      expect(ms01.status).toBe('pass');
    });

    it('MS-01: short title on terrible content', () => {
      const result = scoreFixture('terrible-score.html');
      const ms01 = result.allChecks.find(c => c.id === 'MS-01');
      expect(ms01).toBeDefined();
      // "pg" is only 2 chars — should fail
      expect(['fail', 'warn']).toContain(ms01.status);
    });
  });

  describe('non-English content', () => {
    it('CC-01 (Flesch) returns na for German content', () => {
      const result = scoreFixture('non-english-content.html');
      const cc01 = result.allChecks.find(c => c.id === 'CC-01');
      expect(cc01).toBeDefined();
      expect(cc01.status).toBe('na');
    });

    it('recalculates CC score without CC-01 for non-English', () => {
      const result = scoreFixture('non-english-content.html');
      // CC score should still exist and be valid
      expect(result.categoryScores.contentClarity.score).toBeGreaterThanOrEqual(0);
      expect(result.categoryScores.contentClarity.score).toBeLessThanOrEqual(100);
    });
  });

  describe('issue summary', () => {
    it('returns issue summary counts', () => {
      const result = scoreFixture('perfect-score.html');
      expect(result.issueSummary).toBeDefined();
      expect(result.issueSummary.total).toBeGreaterThan(0);
      expect(result.issueSummary.passed).toBeGreaterThanOrEqual(0);
      expect(typeof result.issueSummary.critical).toBe('number');
      expect(typeof result.issueSummary.high).toBe('number');
      expect(typeof result.issueSummary.medium).toBe('number');
      expect(typeof result.issueSummary.low).toBe('number');
      expect(typeof result.issueSummary.warnings).toBe('number');
    });

    it('perfect content has many passes', () => {
      const result = scoreFixture('perfect-score.html');
      expect(result.issueSummary.passed).toBeGreaterThan(result.issueSummary.critical + result.issueSummary.high);
    });

    it('terrible content has many failures', () => {
      const result = scoreFixture('terrible-score.html');
      const totalFails = result.issueSummary.critical + result.issueSummary.high + result.issueSummary.medium + result.issueSummary.low;
      expect(totalFails).toBeGreaterThan(0);
    });
  });

  describe('AI assessment integration', () => {
    it('works without AI assessment', () => {
      const result = scoreFixture('perfect-score.html', null);
      expect(result.aiAssessmentUsed).toBe(false);
      expect(result.overallScore).toBeGreaterThanOrEqual(0);
    });

    it('integrates AI assessment when provided', () => {
      const aiAssessment = {
        qualityScore: 85,
        citationWorthiness: 80,
      };
      const result = scoreFixture('perfect-score.html', aiAssessment);
      expect(result.aiAssessmentUsed).toBe(true);
    });

    it('AI-enhanced score may differ from rule-only score', () => {
      const ruleOnly = scoreFixture('perfect-score.html', null);
      const aiEnhanced = scoreFixture('perfect-score.html', {
        qualityScore: 50,
        citationWorthiness: 40,
      });
      // Scores should exist regardless
      expect(ruleOnly.overallScore).toBeTypeOf('number');
      expect(aiEnhanced.overallScore).toBeTypeOf('number');
    });
  });

  describe('structured data scoring', () => {
    it('rich structured data scores high on metadata', () => {
      const result = scoreFixture('rich-structured-data.html');
      expect(result.categoryScores.metadataSchema.score).toBeGreaterThanOrEqual(60);
    });
  });

  describe('scoring version', () => {
    it('includes scoring version', () => {
      const result = scoreFixture('perfect-score.html');
      expect(result.scoringVersion).toBe('1.0.0');
    });
  });
});
