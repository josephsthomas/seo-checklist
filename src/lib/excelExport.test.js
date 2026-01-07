import { describe, it, expect } from 'vitest';
import { exportToExcel } from './excelExport';

describe('excelExport', () => {
  describe('exportToExcel', () => {
    it('should be a function', () => {
      expect(typeof exportToExcel).toBe('function');
    });

    it('should be an async function', () => {
      const result = exportToExcel([], {}, { name: 'Test' });
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
