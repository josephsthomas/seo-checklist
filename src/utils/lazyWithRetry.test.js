import { describe, it, expect } from 'vitest';
import { lazyWithRetry } from './lazyWithRetry';

describe('lazyWithRetry', () => {
  it('should be a function', () => {
    expect(typeof lazyWithRetry).toBe('function');
  });

  it('should return a lazy component', () => {
    const mockImport = () => Promise.resolve({ default: () => 'Component' });
    const LazyComponent = lazyWithRetry(mockImport, 'TestModule');

    expect(LazyComponent).toBeDefined();
    expect(LazyComponent.$$typeof).toBeDefined();
  });

  it('should accept module name parameter', () => {
    const mockImport = () => Promise.resolve({ default: () => 'Component' });

    // Should not throw
    expect(() => lazyWithRetry(mockImport, 'CustomName')).not.toThrow();
    expect(() => lazyWithRetry(mockImport)).not.toThrow();
  });
});
