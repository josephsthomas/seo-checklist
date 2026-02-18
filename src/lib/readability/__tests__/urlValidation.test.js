/**
 * URL Validation Tests
 * BRD 09 §2.4 — URL validation utilities
 *
 * Tests validateReadabilityUrl, sanitizeUrlForDisplay, extractDomain, urlToSlug
 */

import { describe, it, expect } from 'vitest';
import {
  validateReadabilityUrl,
  sanitizeUrlForDisplay,
  extractDomain,
  urlToSlug
} from '../utils/urlValidation';

describe('validateReadabilityUrl', () => {
  describe('valid URLs', () => {
    it('accepts a valid HTTPS URL', () => {
      const result = validateReadabilityUrl('https://example.com');
      expect(result.valid).toBe(true);
      expect(result.url).toBe('https://example.com/');
      expect(result.reason).toBeNull();
    });

    it('accepts a valid HTTP URL', () => {
      const result = validateReadabilityUrl('http://example.com');
      expect(result.valid).toBe(true);
      expect(result.url).toBe('http://example.com/');
    });

    it('auto-prepends https:// if no protocol', () => {
      const result = validateReadabilityUrl('example.com');
      expect(result.valid).toBe(true);
      expect(result.url).toBe('https://example.com/');
    });

    it('accepts URL with path and query parameters', () => {
      const result = validateReadabilityUrl('https://example.com/page?q=1&lang=en');
      expect(result.valid).toBe(true);
      expect(result.url).toContain('example.com/page?q=1');
    });

    it('accepts URL with fragment', () => {
      const result = validateReadabilityUrl('https://example.com/page#section');
      expect(result.valid).toBe(true);
      expect(result.url).toContain('#section');
    });

    it('accepts URL with non-standard port', () => {
      const result = validateReadabilityUrl('https://example.com:8080/page');
      expect(result.valid).toBe(true);
      expect(result.url).toContain(':8080');
    });

    it('accepts IDN (internationalized) domain', () => {
      const result = validateReadabilityUrl('https://xn--n3h.example.com');
      expect(result.valid).toBe(true);
    });

    it('accepts subdomain URLs', () => {
      const result = validateReadabilityUrl('https://blog.example.co.uk/post');
      expect(result.valid).toBe(true);
    });

    it('trims whitespace', () => {
      const result = validateReadabilityUrl('  https://example.com  ');
      expect(result.valid).toBe(true);
    });
  });

  describe('invalid URLs', () => {
    it('rejects empty input', () => {
      const result = validateReadabilityUrl('');
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/empty/i);
    });

    it('rejects null input', () => {
      const result = validateReadabilityUrl(null);
      expect(result.valid).toBe(false);
    });

    it('rejects undefined input', () => {
      const result = validateReadabilityUrl(undefined);
      expect(result.valid).toBe(false);
    });

    it('rejects URL with spaces', () => {
      const result = validateReadabilityUrl('https://example.com/my page');
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/spaces/i);
    });

    it('rejects invalid format', () => {
      const result = validateReadabilityUrl('not a url at all');
      expect(result.valid).toBe(false);
    });

    it('rejects URL with missing TLD', () => {
      const result = validateReadabilityUrl('https://localhost-like');
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/TLD|domain/i);
    });
  });

  describe('blocked protocols', () => {
    it('rejects FTP protocol', () => {
      const result = validateReadabilityUrl('ftp://example.com/file');
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/not (allowed|supported)/i);
    });

    it('rejects file:// protocol', () => {
      const result = validateReadabilityUrl('file:///etc/passwd');
      expect(result.valid).toBe(false);
    });

    it('rejects javascript: protocol', () => {
      const result = validateReadabilityUrl('javascript:alert(1)');
      expect(result.valid).toBe(false);
    });

    it('rejects data: protocol', () => {
      const result = validateReadabilityUrl('data:text/html,<h1>test</h1>');
      expect(result.valid).toBe(false);
    });
  });

  describe('SSRF protection — private IPs', () => {
    it('blocks 127.0.0.1 (loopback)', () => {
      const result = validateReadabilityUrl('http://127.0.0.1');
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/private|local/i);
    });

    it('blocks 10.x.x.x (Class A private)', () => {
      const result = validateReadabilityUrl('http://10.0.0.1');
      expect(result.valid).toBe(false);
    });

    it('blocks 192.168.x.x (Class C private)', () => {
      const result = validateReadabilityUrl('http://192.168.1.1');
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/private/i);
    });

    it('blocks 172.16.x.x-172.31.x.x (Class B private)', () => {
      const result = validateReadabilityUrl('http://172.16.0.1');
      expect(result.valid).toBe(false);
    });

    it('blocks localhost hostname', () => {
      const result = validateReadabilityUrl('http://localhost');
      expect(result.valid).toBe(false);
      expect(result.reason).toMatch(/local/i);
    });

    it('blocks 0.0.0.0', () => {
      const result = validateReadabilityUrl('http://0.0.0.0');
      expect(result.valid).toBe(false);
    });

    it('blocks 169.254.x.x (link-local / metadata)', () => {
      const result = validateReadabilityUrl('http://169.254.169.254');
      expect(result.valid).toBe(false);
    });
  });
});

describe('sanitizeUrlForDisplay', () => {
  it('returns short URLs unchanged', () => {
    expect(sanitizeUrlForDisplay('https://example.com')).toBe('https://example.com');
  });

  it('truncates long URLs with ellipsis', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(100);
    const result = sanitizeUrlForDisplay(longUrl, 80);
    expect(result.length).toBe(80);
    expect(result).toMatch(/\.\.\.$/);
  });

  it('handles null/empty input', () => {
    expect(sanitizeUrlForDisplay(null)).toBe('');
    expect(sanitizeUrlForDisplay('')).toBe('');
  });
});

describe('extractDomain', () => {
  it('extracts hostname from URL', () => {
    expect(extractDomain('https://www.example.com/page')).toBe('www.example.com');
  });

  it('returns input for invalid URLs', () => {
    expect(extractDomain('not-a-url')).toBe('not-a-url');
  });
});

describe('urlToSlug', () => {
  it('generates slug from URL', () => {
    const slug = urlToSlug('https://www.example.com/my-page');
    expect(slug).toMatch(/example/);
    expect(slug).toMatch(/my-page/);
    expect(slug).not.toMatch(/https/);
  });

  it('strips www prefix', () => {
    const slug = urlToSlug('https://www.example.com');
    expect(slug).not.toMatch(/^www/);
  });

  it('replaces special characters with hyphens', () => {
    const slug = urlToSlug('https://example.com/path?q=1&b=2');
    expect(slug).not.toMatch(/[?&=]/);
  });

  it('truncates to 60 characters max', () => {
    const slug = urlToSlug('https://example.com/' + 'a'.repeat(100));
    expect(slug.length).toBeLessThanOrEqual(60);
  });

  it('returns "unknown" for invalid URLs', () => {
    expect(urlToSlug('not-a-url')).toBe('unknown');
  });
});
