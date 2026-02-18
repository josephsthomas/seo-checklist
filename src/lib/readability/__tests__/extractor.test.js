/**
 * Content Extractor Tests
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractContent, validateHtmlContent } from '../extractor.js';

const FIXTURES_DIR = join(__dirname, 'fixtures');

function loadFixture(name) {
  return readFileSync(join(FIXTURES_DIR, name), 'utf-8');
}

describe('extractContent', () => {
  describe('basic extraction', () => {
    it('extracts title from head', () => {
      const html = loadFixture('perfect-score.html');
      const result = extractContent(html, { sourceUrl: 'https://example.com/test' });
      expect(result.metadata.title).toBe('Complete Guide to Content Optimization for AI Search Engines');
    });

    it('extracts meta description', () => {
      const html = loadFixture('perfect-score.html');
      const result = extractContent(html);
      expect(result.metadata.description).toContain('optimize your content for AI search engines');
    });

    it('extracts heading tree', () => {
      const html = loadFixture('perfect-score.html');
      const result = extractContent(html);
      expect(result.headings).toBeDefined();
      expect(result.headings.length).toBeGreaterThan(0);
      // Should have H1
      const h1s = result.headings.filter(h => h.level === 1);
      expect(h1s.length).toBe(1);
    });

    it('extracts JSON-LD structured data', () => {
      const html = loadFixture('perfect-score.html');
      const result = extractContent(html);
      expect(result.structuredData).toBeDefined();
      expect(result.structuredData.length).toBeGreaterThan(0);
      // Structured data wraps each item as { type: 'json-ld', data: {...} }
      const article = result.structuredData.find(s => s.data?.['@type'] === 'Article');
      expect(article).toBeDefined();
    });

    it('detects language', () => {
      const html = loadFixture('perfect-score.html');
      const result = extractContent(html);
      expect(result.language).toBe('en');
    });

    it('calculates word count', () => {
      const html = loadFixture('perfect-score.html');
      const result = extractContent(html);
      expect(result.wordCount).toBeGreaterThan(100);
    });
  });

  describe('main content identification', () => {
    it('identifies main content with <main> tag', () => {
      const html = loadFixture('perfect-score.html');
      const result = extractContent(html);
      expect(result.mainContent).toBeDefined();
      expect(result.mainContent.length).toBeGreaterThan(0);
    });

    it('extracts text content', () => {
      const html = loadFixture('average-content.html');
      const result = extractContent(html);
      expect(result.textContent).toBeDefined();
      expect(result.textContent.length).toBeGreaterThan(50);
    });
  });

  describe('content-to-code ratio', () => {
    it('calculates ratio for normal content', () => {
      const html = loadFixture('perfect-score.html');
      const result = extractContent(html);
      expect(result.contentToCodeRatio).toBeGreaterThan(0);
    });

    it('shows low ratio for JS-heavy pages', () => {
      const html = loadFixture('heavy-javascript.html');
      const result = extractContent(html);
      // JS-heavy page should have lower content-to-code ratio
      const perfectHtml = loadFixture('perfect-score.html');
      const perfectResult = extractContent(perfectHtml);
      expect(result.contentToCodeRatio).toBeLessThan(perfectResult.contentToCodeRatio);
    });
  });

  describe('Screaming Frog detection', () => {
    it('detects Screaming Frog export', () => {
      const html = loadFixture('screaming-frog-export.html');
      const result = extractContent(html);
      expect(result.isScreamingFrog).toBe(true);
    });

    it('does not falsely detect normal pages', () => {
      const html = loadFixture('perfect-score.html');
      const result = extractContent(html);
      expect(result.isScreamingFrog).toBe(false);
    });
  });

  describe('non-English content', () => {
    it('detects German language', () => {
      const html = loadFixture('non-english-content.html');
      const result = extractContent(html);
      expect(result.language).toBe('de');
    });
  });

  describe('edge cases', () => {
    it('handles minimal HTML', () => {
      const html = loadFixture('minimal-html.html');
      const result = extractContent(html);
      expect(result.metadata.title).toBe('Minimal');
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it('throws for empty input', () => {
      expect(() => extractContent('')).toThrow();
    });

    it('throws for null input', () => {
      expect(() => extractContent(null)).toThrow();
    });

    it('throws for too-short content', () => {
      expect(() => extractContent('<p>Hi</p>')).toThrow();
    });

    it('preserves sourceUrl in output', () => {
      const html = loadFixture('perfect-score.html');
      const result = extractContent(html, { sourceUrl: 'https://example.com/test' });
      expect(result.sourceUrl).toBe('https://example.com/test');
    });

    it('preserves inputMethod in output', () => {
      const html = loadFixture('perfect-score.html');
      const result = extractContent(html, { inputMethod: 'upload' });
      expect(result.inputMethod).toBe('upload');
    });
  });

  describe('rich structured data', () => {
    it('extracts multiple schema types', () => {
      const html = loadFixture('rich-structured-data.html');
      const result = extractContent(html);
      expect(result.structuredData.length).toBeGreaterThanOrEqual(3);
      const types = result.structuredData.map(s => s.data?.['@type']);
      expect(types).toContain('HowTo');
      expect(types).toContain('FAQPage');
    });
  });
});

describe('validateHtmlContent', () => {
  it('validates valid HTML', () => {
    const result = validateHtmlContent('<html><head><title>Test</title></head><body><p>Content</p></body></html>');
    expect(result.valid).toBe(true);
  });

  it('rejects empty content', () => {
    expect(validateHtmlContent('').valid).toBe(false);
    expect(validateHtmlContent(null).valid).toBe(false);
  });

  it('rejects non-HTML content', () => {
    const result = validateHtmlContent('Just plain text without any HTML tags');
    expect(result.valid).toBe(false);
  });

  it('rejects oversized content', () => {
    const large = '<html>' + 'x'.repeat(11 * 1024 * 1024) + '</html>';
    expect(validateHtmlContent(large).valid).toBe(false);
  });
});
