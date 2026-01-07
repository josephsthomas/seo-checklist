import { describe, it, expect } from 'vitest';
import {
  parseViolationFile,
  convertToEngineFormat,
  getAccessibilitySummary,
  getWorstUrls,
  getTopViolationRules
} from './accessibilityParser';

describe('accessibilityParser', () => {
  describe('exports', () => {
    it('should export parseViolationFile function', () => {
      expect(typeof parseViolationFile).toBe('function');
    });

    it('should export convertToEngineFormat function', () => {
      expect(typeof convertToEngineFormat).toBe('function');
    });

    it('should export getAccessibilitySummary function', () => {
      expect(typeof getAccessibilitySummary).toBe('function');
    });

    it('should export getWorstUrls function', () => {
      expect(typeof getWorstUrls).toBe('function');
    });

    it('should export getTopViolationRules function', () => {
      expect(typeof getTopViolationRules).toBe('function');
    });
  });

  describe('getAccessibilitySummary', () => {
    it('should return summary for data with violations', () => {
      const parsedData = {
        violations: {
          'file1.csv': { success: true, rows: [{ impact: 'critical' }], rowCount: 1 }
        }
      };

      const summary = getAccessibilitySummary(parsedData);

      expect(summary).toBeDefined();
      expect(typeof summary.totalViolations).toBe('number');
    });

    it('should handle empty violations', () => {
      const parsedData = { violations: {} };
      const summary = getAccessibilitySummary(parsedData);

      expect(summary).toBeDefined();
      expect(summary.totalViolations).toBe(0);
    });
  });
});
