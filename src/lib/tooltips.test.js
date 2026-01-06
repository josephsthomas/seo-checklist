import { describe, it, expect } from 'vitest';
import { TOOLTIPS, getTooltip, createTooltipProps } from './tooltips';

describe('Tooltips Library', () => {
  describe('TOOLTIPS constant', () => {
    it('should contain Report Builder tooltips', () => {
      expect(TOOLTIPS['report.widget.add']).toBeDefined();
      expect(TOOLTIPS['report.dataSource']).toBeDefined();
      expect(TOOLTIPS['report.preview']).toBeDefined();
      expect(TOOLTIPS['report.save']).toBeDefined();
      expect(TOOLTIPS['report.template']).toBeDefined();
    });

    it('should contain Scheduled Reports tooltips', () => {
      expect(TOOLTIPS['schedule.frequency']).toBeDefined();
      expect(TOOLTIPS['schedule.recipients']).toBeDefined();
      expect(TOOLTIPS['schedule.timezone']).toBeDefined();
      expect(TOOLTIPS['schedule.active']).toBeDefined();
      expect(TOOLTIPS['schedule.reportType']).toBeDefined();
    });

    it('should contain Scheduled Audits tooltips', () => {
      expect(TOOLTIPS['audit.depth']).toBeDefined();
      expect(TOOLTIPS['audit.categories']).toBeDefined();
      expect(TOOLTIPS['audit.alerts.threshold']).toBeDefined();
      expect(TOOLTIPS['audit.url']).toBeDefined();
      expect(TOOLTIPS['audit.frequency']).toBeDefined();
    });

    it('should contain Batch Audit tooltips', () => {
      expect(TOOLTIPS['batch.urls']).toBeDefined();
      expect(TOOLTIPS['batch.progress']).toBeDefined();
      expect(TOOLTIPS['batch.export']).toBeDefined();
      expect(TOOLTIPS['batch.upload']).toBeDefined();
    });

    it('should contain VPAT tooltips', () => {
      expect(TOOLTIPS['vpat.conformance.supports']).toBeDefined();
      expect(TOOLTIPS['vpat.conformance.partial']).toBeDefined();
      expect(TOOLTIPS['vpat.conformance.doesNot']).toBeDefined();
      expect(TOOLTIPS['vpat.remarks']).toBeDefined();
      expect(TOOLTIPS['vpat.export']).toBeDefined();
    });

    it('should contain Audit Log tooltips', () => {
      expect(TOOLTIPS['auditLog.filter']).toBeDefined();
      expect(TOOLTIPS['auditLog.export']).toBeDefined();
      expect(TOOLTIPS['auditLog.retention']).toBeDefined();
    });

    it('should have non-empty tooltip text for all keys', () => {
      Object.entries(TOOLTIPS).forEach(([key, value]) => {
        expect(value).toBeTruthy();
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(10); // Meaningful tooltip text
      });
    });
  });

  describe('getTooltip function', () => {
    it('should return tooltip text for valid keys', () => {
      const tooltip = getTooltip('report.widget.add');
      expect(tooltip).toBe(TOOLTIPS['report.widget.add']);
    });

    it('should return empty string for invalid keys', () => {
      const tooltip = getTooltip('nonexistent.key');
      expect(tooltip).toBe('');
    });

    it('should return empty string for undefined key', () => {
      const tooltip = getTooltip(undefined);
      expect(tooltip).toBe('');
    });
  });

  describe('createTooltipProps function', () => {
    it('should return props object with title and aria-label', () => {
      const props = createTooltipProps('schedule.frequency');
      expect(props.title).toBe(TOOLTIPS['schedule.frequency']);
      expect(props['aria-label']).toBe(TOOLTIPS['schedule.frequency']);
    });

    it('should return empty strings for invalid keys', () => {
      const props = createTooltipProps('invalid.key');
      expect(props.title).toBe('');
      expect(props['aria-label']).toBe('');
    });
  });
});
