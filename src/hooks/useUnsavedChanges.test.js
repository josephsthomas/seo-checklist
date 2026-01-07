import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUnsavedChanges, useFormWithUnsavedChanges, useSessionDataWarning } from './useUnsavedChanges';

describe('useUnsavedChanges', () => {
  let addEventListenerSpy;
  let removeEventListenerSpy;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with isDirty false by default', () => {
    const { result } = renderHook(() => useUnsavedChanges());
    expect(result.current.isDirty).toBe(false);
  });

  it('initializes with provided initial value', () => {
    const { result } = renderHook(() => useUnsavedChanges(true));
    expect(result.current.isDirty).toBe(true);
  });

  it('markDirty sets isDirty to true', () => {
    const { result } = renderHook(() => useUnsavedChanges());

    act(() => {
      result.current.markDirty();
    });

    expect(result.current.isDirty).toBe(true);
  });

  it('markClean sets isDirty to false', () => {
    const { result } = renderHook(() => useUnsavedChanges(true));

    act(() => {
      result.current.markClean();
    });

    expect(result.current.isDirty).toBe(false);
  });

  it('setDirty allows setting specific value', () => {
    const { result } = renderHook(() => useUnsavedChanges());

    act(() => {
      result.current.setDirty(true);
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.setDirty(false);
    });
    expect(result.current.isDirty).toBe(false);
  });

  it('adds beforeunload listener on mount', () => {
    renderHook(() => useUnsavedChanges());
    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('removes beforeunload listener on unmount', () => {
    const { unmount } = renderHook(() => useUnsavedChanges());
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });
});

describe('useFormWithUnsavedChanges', () => {
  it('initializes with provided values', () => {
    const initialValues = { name: 'test', email: 'test@example.com' };
    const { result } = renderHook(() => useFormWithUnsavedChanges(initialValues));

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isDirty).toBe(false);
  });

  it('handleChange updates specific field', () => {
    const initialValues = { name: '', email: '' };
    const { result } = renderHook(() => useFormWithUnsavedChanges(initialValues));

    act(() => {
      result.current.handleChange('name', 'John');
    });

    expect(result.current.values.name).toBe('John');
  });

  it('sets isDirty true when values change', () => {
    const initialValues = { name: 'test' };
    const { result } = renderHook(() => useFormWithUnsavedChanges(initialValues));

    act(() => {
      result.current.handleChange('name', 'changed');
    });

    expect(result.current.isDirty).toBe(true);
  });

  it('sets isDirty false when values match original', () => {
    const initialValues = { name: 'test' };
    const { result } = renderHook(() => useFormWithUnsavedChanges(initialValues));

    act(() => {
      result.current.handleChange('name', 'changed');
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.handleChange('name', 'test');
    });
    expect(result.current.isDirty).toBe(false);
  });

  it('resetForm restores original values', () => {
    const initialValues = { name: 'original' };
    const { result } = renderHook(() => useFormWithUnsavedChanges(initialValues));

    act(() => {
      result.current.handleChange('name', 'changed');
    });

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isDirty).toBe(false);
  });

  it('resetForm can set new values', () => {
    const initialValues = { name: 'original' };
    const newValues = { name: 'new' };
    const { result } = renderHook(() => useFormWithUnsavedChanges(initialValues));

    act(() => {
      result.current.resetForm(newValues);
    });

    expect(result.current.values).toEqual(newValues);
    expect(result.current.isDirty).toBe(false);
  });
});

describe('useSessionDataWarning', () => {
  let localStorageMock;

  beforeEach(() => {
    localStorageMock = {
      store: {},
      getItem: vi.fn((key) => localStorageMock.store[key] || null),
      setItem: vi.fn((key, value) => {
        localStorageMock.store[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete localStorageMock.store[key];
      }),
      clear: vi.fn(() => {
        localStorageMock.store = {};
      })
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it('initializes with hasShownWarning false', () => {
    const { result } = renderHook(() => useSessionDataWarning());
    expect(result.current.hasShownWarning).toBe(false);
  });

  it('initializes hasShownWarning true if stored', () => {
    localStorageMock.store['session-data-warning-shown'] = 'true';

    const { result } = renderHook(() => useSessionDataWarning());
    expect(result.current.hasShownWarning).toBe(true);
  });

  it('markWarningShown updates state and localStorage', () => {
    const { result } = renderHook(() => useSessionDataWarning());

    act(() => {
      result.current.markWarningShown();
    });

    expect(result.current.hasShownWarning).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('session-data-warning-shown', 'true');
  });

  it('setUnsavedWork updates hasUnsavedWork state', () => {
    const { result } = renderHook(() => useSessionDataWarning());

    act(() => {
      result.current.setUnsavedWork(true);
    });

    expect(result.current.hasUnsavedWork).toBe(true);
  });

  it('shouldShowWarning is true only when has unsaved work and warning not shown', () => {
    const { result } = renderHook(() => useSessionDataWarning());

    // Initially false (no unsaved work)
    expect(result.current.shouldShowWarning).toBe(false);

    // Set unsaved work
    act(() => {
      result.current.setUnsavedWork(true);
    });
    expect(result.current.shouldShowWarning).toBe(true);

    // Mark warning shown
    act(() => {
      result.current.markWarningShown();
    });
    expect(result.current.shouldShowWarning).toBe(false);
  });
});
