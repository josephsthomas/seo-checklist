import { describe, it, expect } from 'vitest';
import {
  TOOLS,
  getRecommendations,
  getHomeRecommendations,
  getContextualTip
} from './recommendations';

describe('recommendations', () => {
  describe('TOOLS', () => {
    it('should define all tools', () => {
      expect(TOOLS.planner).toBeDefined();
      expect(TOOLS.audit).toBeDefined();
      expect(TOOLS.accessibility).toBeDefined();
      expect(TOOLS['image-alt']).toBeDefined();
      expect(TOOLS['meta-generator']).toBeDefined();
      expect(TOOLS['schema-generator']).toBeDefined();
    });

    it('should have required properties for each tool', () => {
      Object.values(TOOLS).forEach(tool => {
        expect(tool.id).toBeDefined();
        expect(tool.name).toBeDefined();
        expect(tool.description).toBeDefined();
        expect(tool.path).toBeDefined();
        expect(tool.icon).toBeDefined();
        expect(tool.color).toBeDefined();
        expect(tool.keywords).toBeDefined();
        expect(Array.isArray(tool.keywords)).toBe(true);
      });
    });

    it('should have valid paths starting with /', () => {
      Object.values(TOOLS).forEach(tool => {
        expect(tool.path.startsWith('/')).toBe(true);
      });
    });
  });

  describe('getRecommendations', () => {
    it('should return recommendations for current tool', () => {
      const recommendations = getRecommendations('audit');

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.length).toBeLessThanOrEqual(3);
    });

    it('should not include current tool in recommendations', () => {
      const recommendations = getRecommendations('audit');

      const hasCurrentTool = recommendations.some(r => r.id === 'audit');
      expect(hasCurrentTool).toBe(false);
    });

    it('should include reason for each recommendation', () => {
      const recommendations = getRecommendations('audit');

      recommendations.forEach(rec => {
        expect(rec.reason).toBeDefined();
        expect(typeof rec.reason).toBe('string');
      });
    });

    it('should respect limit parameter', () => {
      const recommendations = getRecommendations('audit', {}, 1);
      expect(recommendations.length).toBe(1);

      const recommendations2 = getRecommendations('audit', {}, 5);
      expect(recommendations2.length).toBeLessThanOrEqual(5);
    });

    it('should recommend accessibility for low health score', () => {
      const recommendations = getRecommendations('audit', { healthScore: 40 });

      const hasAccessibility = recommendations.some(r => r.id === 'accessibility');
      expect(hasAccessibility).toBe(true);
    });

    it('should recommend meta-generator for missing meta data', () => {
      const recommendations = getRecommendations('audit', { hasMissingMeta: true });

      const hasMetaGenerator = recommendations.some(r => r.id === 'meta-generator');
      expect(hasMetaGenerator).toBe(true);
    });

    it('should recommend schema for schema issues', () => {
      const recommendations = getRecommendations('audit', { hasSchemaIssues: true });

      const hasSchema = recommendations.some(r => r.id === 'schema-generator');
      expect(hasSchema).toBe(true);
    });

    it('should recommend image-alt after accessibility with image issues', () => {
      const recommendations = getRecommendations('accessibility', { hasImageIssues: true });

      const hasImageAlt = recommendations.some(r => r.id === 'image-alt');
      expect(hasImageAlt).toBe(true);
    });

    it('should recommend schema after meta-generator', () => {
      const recommendations = getRecommendations('meta-generator');

      const hasSchema = recommendations.some(r => r.id === 'schema-generator');
      expect(hasSchema).toBe(true);
    });

    it('should recommend audit after schema-generator', () => {
      const recommendations = getRecommendations('schema-generator');

      const hasAudit = recommendations.some(r => r.id === 'audit');
      expect(hasAudit).toBe(true);
    });

    it('should recommend based on project phase - Discovery', () => {
      const recommendations = getRecommendations('planner', { phase: 'Discovery' });

      const hasAudit = recommendations.some(r => r.id === 'audit');
      expect(hasAudit).toBe(true);
    });

    it('should recommend based on project phase - Strategy', () => {
      const recommendations = getRecommendations('planner', { phase: 'Strategy' });

      const hasMetaOrSchema = recommendations.some(
        r => r.id === 'meta-generator' || r.id === 'schema-generator'
      );
      expect(hasMetaOrSchema).toBe(true);
    });

    it('should recommend based on project phase - Build', () => {
      const recommendations = getRecommendations('planner', { phase: 'Build' });

      const hasImageAltOrAccessibility = recommendations.some(
        r => r.id === 'image-alt' || r.id === 'accessibility'
      );
      expect(hasImageAltOrAccessibility).toBe(true);
    });
  });

  describe('getHomeRecommendations', () => {
    it('should recommend getting started for new users', () => {
      const recommendations = getHomeRecommendations({
        recents: [],
        projects: []
      });

      expect(recommendations.length).toBeGreaterThan(0);
      const hasPlanner = recommendations.some(r => r.id === 'planner');
      expect(hasPlanner).toBe(true);
    });

    it('should recommend continuing projects for users with incomplete projects', () => {
      const recommendations = getHomeRecommendations({
        recents: [{ type: 'project' }],
        projects: [{ progress: 30 }]
      });

      const hasPlanner = recommendations.some(r => r.id === 'planner');
      expect(hasPlanner).toBe(true);
      expect(recommendations.some(r => r.reason.includes('ongoing'))).toBe(true);
    });

    it('should recommend audit if no recent audits', () => {
      const recommendations = getHomeRecommendations({
        recents: [{ type: 'project' }],
        projects: [{ progress: 100 }],
        audits: []
      });

      const hasAudit = recommendations.some(r => r.id === 'audit');
      expect(hasAudit).toBe(true);
    });

    it('should limit recommendations to 4', () => {
      const recommendations = getHomeRecommendations({
        recents: [],
        projects: []
      });

      expect(recommendations.length).toBeLessThanOrEqual(4);
    });

    it('should sort by priority', () => {
      const recommendations = getHomeRecommendations({
        recents: [],
        projects: []
      });

      for (let i = 0; i < recommendations.length - 1; i++) {
        expect(recommendations[i].priority).toBeLessThanOrEqual(recommendations[i + 1].priority);
      }
    });
  });

  describe('getContextualTip', () => {
    it('should return null for unknown tool', () => {
      const tip = getContextualTip('unknown-tool');
      expect(tip).toBeNull();
    });

    it('should return great score tip for high audit health', () => {
      const tip = getContextualTip('audit', { healthScore: 95 });

      expect(tip).not.toBeNull();
      expect(tip.title).toContain('Great');
      expect(tip.action).toBeDefined();
      expect(tip.action.path).toBe('/accessibility');
    });

    it('should return needs attention tip for low audit health', () => {
      const tip = getContextualTip('audit', { healthScore: 40 });

      expect(tip).not.toBeNull();
      expect(tip.title).toContain('attention');
      expect(tip.action).toBeNull();
    });

    it('should return compliant tip for zero accessibility violations', () => {
      const tip = getContextualTip('accessibility', { totalViolations: 0 });

      expect(tip).not.toBeNull();
      expect(tip.title).toContain('Compliant');
    });

    it('should return image issues tip when there are image violations', () => {
      const tip = getContextualTip('accessibility', { imageViolations: 5 });

      expect(tip).not.toBeNull();
      expect(tip.title.toLowerCase()).toContain('image');
      expect(tip.action).toBeDefined();
      expect(tip.action.path).toBe('/image-alt');
    });

    it('should return schema tip for meta-generator', () => {
      const tip = getContextualTip('meta-generator');

      expect(tip).not.toBeNull();
      expect(tip.action).toBeDefined();
      expect(tip.action.path).toBe('/schema-generator');
    });
  });
});
