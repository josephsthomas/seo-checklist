import { describe, it, expect } from 'vitest';
import { validateUrl, validateMultipleUrls } from './urlValidation';

describe('URL Validation', () => {
  describe('validateUrl', () => {
    describe('valid URLs', () => {
      it('should accept valid URLs with https', () => {
        const result = validateUrl('https://example.com');
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe('https://example.com');
      });

      it('should accept valid URLs with http', () => {
        const result = validateUrl('http://example.com');
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe('http://example.com');
      });

      it('should add https:// protocol when missing', () => {
        const result = validateUrl('example.com');
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe('https://example.com');
      });

      it('should accept URLs with paths', () => {
        const result = validateUrl('https://example.com/page/subpage');
        expect(result.valid).toBe(true);
      });

      it('should accept URLs with query parameters', () => {
        const result = validateUrl('https://example.com?param=value');
        expect(result.valid).toBe(true);
      });

      it('should accept URLs with subdomains', () => {
        const result = validateUrl('https://blog.example.com');
        expect(result.valid).toBe(true);
      });

      it('should accept URLs with ports', () => {
        const result = validateUrl('https://example.com:8080');
        expect(result.valid).toBe(true);
      });
    });

    describe('invalid URLs', () => {
      it('should reject empty URLs', () => {
        const result = validateUrl('');
        expect(result.valid).toBe(false);
        expect(result.error).toBe('URL cannot be empty');
      });

      it('should reject null/undefined URLs', () => {
        expect(validateUrl(null).valid).toBe(false);
        expect(validateUrl(undefined).valid).toBe(false);
      });

      it('should reject URLs with spaces', () => {
        const result = validateUrl('example .com');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('spaces');
      });

      it('should detect typo in http protocol (htp://)', () => {
        const result = validateUrl('htp://example.com');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('typo');
      });

      it('should detect typo in https protocol (htps://)', () => {
        const result = validateUrl('htps://example.com');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('typo');
      });

      it('should reject domains without TLD', () => {
        const result = validateUrl('https://localhost');
        // localhost is a special case that should be valid with warning
        // But a regular domain without TLD should fail
        const result2 = validateUrl('https://examplecom');
        expect(result2.valid).toBe(false);
      });

      it('should reject domains with invalid TLD (single char)', () => {
        const result = validateUrl('example.c');
        expect(result.valid).toBe(false);
        expect(result.error).toContain('TLD');
      });

      it('should reject invalid URL structures', () => {
        const result = validateUrl('not a valid url at all');
        expect(result.valid).toBe(false);
      });
    });

    describe('warnings for local/internal URLs', () => {
      it('should warn for localhost', () => {
        const result = validateUrl('https://localhost:3000');
        expect(result.valid).toBe(true);
        expect(result.warning).toContain('local');
      });

      it('should warn for 192.168.x.x addresses', () => {
        const result = validateUrl('http://192.168.1.1');
        expect(result.valid).toBe(true);
        expect(result.warning).toContain('local');
      });

      it('should warn for 10.x.x.x addresses', () => {
        const result = validateUrl('http://10.0.0.1');
        expect(result.valid).toBe(true);
        expect(result.warning).toContain('local');
      });

      it('should warn for 172.16-31.x.x addresses', () => {
        const result = validateUrl('http://172.16.0.1');
        expect(result.valid).toBe(true);
        expect(result.warning).toContain('local');
      });
    });

    describe('edge cases', () => {
      it('should trim whitespace from URLs', () => {
        const result = validateUrl('  https://example.com  ');
        expect(result.valid).toBe(true);
        expect(result.normalized).toBe('https://example.com');
      });

      it('should accept international domains', () => {
        const result = validateUrl('https://例え.jp');
        expect(result.valid).toBe(true);
      });

      it('should accept long TLDs', () => {
        const result = validateUrl('https://example.technology');
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('validateMultipleUrls', () => {
    it('should categorize valid and invalid URLs', () => {
      const urls = ['https://valid.com', 'invalid', 'https://another-valid.org'];
      const result = validateMultipleUrls(urls);

      expect(result.valid.length).toBe(2);
      expect(result.invalid.length).toBe(1);
    });

    it('should track warnings separately', () => {
      const urls = ['https://example.com', 'http://localhost:3000'];
      const result = validateMultipleUrls(urls);

      expect(result.valid.length).toBe(2);
      expect(result.warnings.length).toBe(1);
      expect(result.warnings[0].warning).toContain('local');
    });

    it('should normalize all valid URLs', () => {
      const urls = ['example.com', 'test.org'];
      const result = validateMultipleUrls(urls);

      expect(result.valid).toContain('https://example.com');
      expect(result.valid).toContain('https://test.org');
    });

    it('should include error messages for invalid URLs', () => {
      const urls = ['', 'htp://bad.com'];
      const result = validateMultipleUrls(urls);

      expect(result.invalid.length).toBe(2);
      expect(result.invalid[0].error).toBeDefined();
      expect(result.invalid[1].error).toContain('typo');
    });
  });
});
