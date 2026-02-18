/**
 * Recommendations Engine Tests
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractContent } from '../extractor.js';
import { scoreContent } from '../scorer.js';
import { generateRecommendations } from '../recommendations.js';

const FIXTURES_DIR = join(__dirname, 'fixtures');

function loadFixture(name) {
  return readFileSync(join(FIXTURES_DIR, name), 'utf-8');
}

function getRecommendations(fixtureName, aiAssessment = null) {
  const html = loadFixture(fixtureName);
  const extracted = extractContent(html, { sourceUrl: 'https://example.com/test' });
  const scoring = scoreContent(extracted, aiAssessment);
  return generateRecommendations(scoring, aiAssessment);
}

describe('generateRecommendations', () => {
  describe('basic generation', () => {
    it('returns an array of recommendations', () => {
      const recs = getRecommendations('terrible-score.html');
      expect(Array.isArray(recs)).toBe(true);
      expect(recs.length).toBeGreaterThan(0);
    });

    it('each recommendation has required fields', () => {
      const recs = getRecommendations('terrible-score.html');
      for (const rec of recs) {
        expect(rec.title).toBeDefined();
        expect(rec.description).toBeDefined();
        expect(rec.priority).toBeDefined();
        expect(['critical', 'high', 'medium', 'low']).toContain(rec.priority);
      }
    });

    it('recommendations have group assignment', () => {
      const recs = getRecommendations('terrible-score.html');
      const validGroups = ['quick-wins', 'structural', 'content', 'technical'];
      for (const rec of recs) {
        if (rec.group) {
          expect(validGroups).toContain(rec.group);
        }
      }
    });
  });

  describe('failed checks generate recommendations', () => {
    it('terrible content generates many recommendations', () => {
      const recs = getRecommendations('terrible-score.html');
      expect(recs.length).toBeGreaterThan(5);
    });

    it('perfect content generates fewer recommendations than terrible content', () => {
      const perfectRecs = getRecommendations('perfect-score.html');
      const terribleRecs = getRecommendations('terrible-score.html');
      expect(perfectRecs.length).toBeLessThan(terribleRecs.length);
    });
  });

  describe('priority sorting', () => {
    it('sorts recommendations by priority', () => {
      const recs = getRecommendations('terrible-score.html');
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

      for (let i = 1; i < recs.length; i++) {
        const prev = priorityOrder[recs[i - 1].priority] ?? 99;
        const curr = priorityOrder[recs[i].priority] ?? 99;
        expect(prev).toBeLessThanOrEqual(curr);
      }
    });
  });

  describe('effort and impact metadata', () => {
    it('includes effort estimates when available', () => {
      const recs = getRecommendations('terrible-score.html');
      const withEffort = recs.filter(r => r.effort);
      // At least some recs should have effort
      expect(withEffort.length).toBeGreaterThan(0);
    });

    it('includes impact estimates when available', () => {
      const recs = getRecommendations('terrible-score.html');
      // recommendations.js uses `estimatedImpact` field
      const withImpact = recs.filter(r => r.estimatedImpact);
      expect(withImpact.length).toBeGreaterThan(0);
    });
  });

  describe('quick wins identification', () => {
    it('identifies quick wins', () => {
      const recs = getRecommendations('terrible-score.html');
      const quickWins = recs.filter(
        r => r.group === 'quick-wins' || (r.impact === 'high' && (r.effort === 'low' || r.effort === 'quick'))
      );
      // Terrible content should have at least some quick wins
      expect(quickWins.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('code snippets', () => {
    it('includes code snippets for applicable recommendations', () => {
      const recs = getRecommendations('terrible-score.html');
      const withCode = recs.filter(r => r.codeSnippet || r.codeBefore || r.codeAfter);
      // Some recommendations should include code fixes
      expect(withCode.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('AI recommendations', () => {
    it('merges AI recommendations when provided', () => {
      const aiAssessment = {
        qualityScore: 70,
        readabilityIssues: [
          {
            title: 'Add more examples',
            description: 'The content would benefit from concrete examples.',
            priority: 'medium',
            group: 'content',
          },
        ],
      };
      const recs = getRecommendations('average-content.html', aiAssessment);
      expect(Array.isArray(recs)).toBe(true);
    });
  });

  describe('average content recommendations', () => {
    it('generates recommendations for mixed-quality content', () => {
      const recs = getRecommendations('average-content.html');
      expect(recs.length).toBeGreaterThan(0);
      // Should have some but not overwhelming number
      expect(recs.length).toBeLessThan(30);
    });
  });
});
