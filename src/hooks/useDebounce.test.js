import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback, useDebouncedSearch } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated' });

    // Value shouldn't change immediately
    expect(result.current).toBe('initial');

    // Advance timer
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'c' });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'd' });
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Still showing 'a' because timer kept resetting
    expect(result.current).toBe('a');

    // After full delay, should show last value
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('d');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce callback execution', async () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current('arg1');
      result.current('arg2');
      result.current('arg3');
    });

    expect(callback).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg3');
  });
});

describe('useDebouncedSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should provide immediate and debounced values', async () => {
    const { result } = renderHook(() => useDebouncedSearch('', 300));

    expect(result.current.searchTerm).toBe('');
    expect(result.current.debouncedSearchTerm).toBe('');

    act(() => {
      result.current.setSearchTerm('test');
    });

    // Immediate value updates right away
    expect(result.current.searchTerm).toBe('test');
    // Debounced value is still empty
    expect(result.current.debouncedSearchTerm).toBe('');

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Now debounced value is updated
    expect(result.current.debouncedSearchTerm).toBe('test');
  });
});
