import { describe, it, expect } from 'vitest';
import { SEVERITY, PRIORITY, CATEGORIES, runAudit } from './auditEngine';

describe('auditEngine', () => {
  describe('constants', () => {
    it('should export SEVERITY levels', () => {
      expect(SEVERITY).toBeDefined();
      expect(SEVERITY.ERROR).toBe('error');
      expect(SEVERITY.WARNING).toBe('warning');
      expect(SEVERITY.INFO).toBe('info');
    });

    it('should export PRIORITY levels', () => {
      expect(PRIORITY).toBeDefined();
      expect(PRIORITY.MUST).toBe('must');
      expect(PRIORITY.SHOULD).toBe('should');
      expect(PRIORITY.COULD).toBe('could');
    });

    it('should export CATEGORIES', () => {
      expect(CATEGORIES).toBeDefined();
      expect(CATEGORIES.INDEXABILITY).toBe('Indexability');
      expect(CATEGORIES.PAGE_TITLES).toBe('Page Titles');
      expect(CATEGORIES.META_DESCRIPTIONS).toBe('Meta Descriptions');
    });
  });

  describe('runAudit', () => {
    it('should be a function', () => {
      expect(typeof runAudit).toBe('function');
    });

    it('should return error for empty data', async () => {
      const parsedData = {};
      const result = await runAudit(parsedData);

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.issues).toBeDefined();
      expect(Array.isArray(result.issues)).toBe(true);
    });

    it('should return results for valid data', async () => {
      const parsedData = {
        internal: {
          rows: [
            { Address: 'https://example.com/page1', 'Title 1': 'Test Title', 'Status Code': '200' }
          ]
        }
      };

      const result = await runAudit(parsedData);

      expect(result).toBeDefined();
      expect(result.issues).toBeDefined();
      expect(result.stats).toBeDefined();
    });

    it('should include stats', async () => {
      const parsedData = {};
      const result = await runAudit(parsedData);

      expect(result.stats).toBeDefined();
      expect(typeof result.stats.errors).toBe('number');
      expect(typeof result.stats.warnings).toBe('number');
    });
  });
});
