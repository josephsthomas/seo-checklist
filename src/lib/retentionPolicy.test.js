import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  RETENTION_OPTIONS,
  getRetentionOption,
  getRetentionLabel,
  calculateRetentionCutoff,
  isWithinRetention,
  getComplianceRecommendation
} from './retentionPolicy';

describe('Retention Policy', () => {
  describe('RETENTION_OPTIONS', () => {
    it('should have 5 retention options', () => {
      expect(RETENTION_OPTIONS).toHaveLength(5);
    });

    it('should have all required properties for each option', () => {
      RETENTION_OPTIONS.forEach(option => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('description');
      });
    });

    it('should have 30 day minimum retention', () => {
      const minOption = RETENTION_OPTIONS.find(o => o.value === '30');
      expect(minOption).toBeDefined();
      expect(minOption.label).toBe('30 days');
    });

    it('should have unlimited option', () => {
      const unlimitedOption = RETENTION_OPTIONS.find(o => o.value === 'unlimited');
      expect(unlimitedOption).toBeDefined();
      expect(unlimitedOption.label).toBe('Unlimited');
    });

    it('should have 1 year compliance option', () => {
      const yearOption = RETENTION_OPTIONS.find(o => o.value === '365');
      expect(yearOption).toBeDefined();
      expect(yearOption.description).toContain('Compliance');
    });
  });

  describe('getRetentionOption', () => {
    it('should return option for valid value', () => {
      const option = getRetentionOption('90');
      expect(option).toBeDefined();
      expect(option.label).toBe('90 days');
    });

    it('should return undefined for invalid value', () => {
      const option = getRetentionOption('invalid');
      expect(option).toBeUndefined();
    });

    it('should return unlimited option', () => {
      const option = getRetentionOption('unlimited');
      expect(option).toBeDefined();
      expect(option.label).toBe('Unlimited');
    });
  });

  describe('getRetentionLabel', () => {
    it('should return label for valid value', () => {
      expect(getRetentionLabel('30')).toBe('30 days');
      expect(getRetentionLabel('90')).toBe('90 days');
      expect(getRetentionLabel('365')).toBe('1 year');
      expect(getRetentionLabel('unlimited')).toBe('Unlimited');
    });

    it('should return Unknown for invalid value', () => {
      expect(getRetentionLabel('invalid')).toBe('Unknown');
      expect(getRetentionLabel('')).toBe('Unknown');
    });
  });

  describe('calculateRetentionCutoff', () => {
    beforeEach(() => {
      // Mock date to ensure consistent tests
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-06T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return null for unlimited retention', () => {
      const cutoff = calculateRetentionCutoff('unlimited');
      expect(cutoff).toBeNull();
    });

    it('should calculate correct cutoff for 30 days', () => {
      const cutoff = calculateRetentionCutoff('30');
      expect(cutoff).toBeInstanceOf(Date);
      // 30 days before Jan 6, 2026 = Dec 7, 2025
      expect(cutoff.toISOString().split('T')[0]).toBe('2025-12-07');
    });

    it('should calculate correct cutoff for 90 days', () => {
      const cutoff = calculateRetentionCutoff('90');
      expect(cutoff).toBeInstanceOf(Date);
      // 90 days before Jan 6, 2026 = Oct 8, 2025
      expect(cutoff.toISOString().split('T')[0]).toBe('2025-10-08');
    });

    it('should calculate correct cutoff for 365 days', () => {
      const cutoff = calculateRetentionCutoff('365');
      expect(cutoff).toBeInstanceOf(Date);
      // 365 days before Jan 6, 2026 = Jan 6, 2025
      expect(cutoff.toISOString().split('T')[0]).toBe('2025-01-06');
    });

    it('should return null for invalid value', () => {
      const cutoff = calculateRetentionCutoff('invalid');
      expect(cutoff).toBeNull();
    });
  });

  describe('isWithinRetention', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-06T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return true for unlimited retention', () => {
      const oldDate = new Date('2020-01-01');
      expect(isWithinRetention(oldDate, 'unlimited')).toBe(true);
    });

    it('should return true for recent dates within retention', () => {
      const recentDate = new Date('2026-01-01'); // 5 days ago
      expect(isWithinRetention(recentDate, '30')).toBe(true);
    });

    it('should return false for dates outside retention', () => {
      const oldDate = new Date('2025-11-01'); // More than 30 days ago
      expect(isWithinRetention(oldDate, '30')).toBe(false);
    });

    it('should return true for edge case at cutoff', () => {
      // Date at the cutoff boundary (30 days ago at same time)
      const cutoffDate = new Date('2025-12-07T12:00:00Z');
      expect(isWithinRetention(cutoffDate, '30')).toBe(true);
    });
  });

  describe('getComplianceRecommendation', () => {
    it('should return warning for minimum retention', () => {
      const rec = getComplianceRecommendation('30');
      expect(rec).toContain('not meet');
    });

    it('should return standard message for 90 days', () => {
      const rec = getComplianceRecommendation('90');
      expect(rec).toContain('standard');
    });

    it('should mention regulatory compliance for 1 year', () => {
      const rec = getComplianceRecommendation('365');
      expect(rec).toContain('regulatory');
    });

    it('should mention storage for unlimited', () => {
      const rec = getComplianceRecommendation('unlimited');
      expect(rec).toContain('storage');
    });

    it('should return unknown for invalid value', () => {
      const rec = getComplianceRecommendation('invalid');
      expect(rec).toContain('Unknown');
    });
  });
});
