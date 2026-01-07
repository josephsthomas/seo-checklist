import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  STORAGE_KEYS,
  debounce,
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  getItemTimelineData,
  setItemTimelineData,
  getFilterPresets,
  saveFilterPreset,
  deleteFilterPreset,
  getTimeEntries,
  addTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getTotalTimeForItem,
  getProjectMetadata,
  setProjectMetadata,
  logActivity,
  getRecentActivities,
  checkStorageUsage,
  exportAllData,
  importAllData,
  clearPhase9Data
} from './storageHelpers';

describe('storageHelpers', () => {
  let mockStorage = {};

  beforeEach(() => {
    mockStorage = {};

    // Mock localStorage
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key) => mockStorage[key] || null),
      setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
      removeItem: vi.fn((key) => { delete mockStorage[key]; }),
      clear: vi.fn(() => { mockStorage = {}; })
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('STORAGE_KEYS', () => {
    it('should export storage key constants', () => {
      expect(STORAGE_KEYS).toBeDefined();
      expect(STORAGE_KEYS.COMPLETED_ITEMS).toBe('seo-checklist-completed');
      expect(STORAGE_KEYS.USER_PREFERENCES).toBe('seo-checklist-preferences');
    });
  });

  describe('debounce', () => {
    it('should delay function execution', async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should cancel previous calls', async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it('should pass arguments to function', async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('arg1', 'arg2');

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');

      vi.useRealTimers();
    });
  });

  describe('getStorageItem', () => {
    it('should return parsed value from localStorage', () => {
      mockStorage['test-key'] = JSON.stringify({ foo: 'bar' });

      const result = getStorageItem('test-key');
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should return default value when key does not exist', () => {
      const result = getStorageItem('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should return null as default when no default provided', () => {
      const result = getStorageItem('nonexistent');
      expect(result).toBeNull();
    });

    it('should return default on JSON parse error', () => {
      mockStorage['bad-json'] = 'not-valid-json';

      const result = getStorageItem('bad-json', 'fallback');
      expect(result).toBe('fallback');
    });
  });

  describe('setStorageItem', () => {
    it('should store stringified value', () => {
      const result = setStorageItem('test-key', { foo: 'bar' });

      expect(result).toBe(true);
      expect(mockStorage['test-key']).toBe(JSON.stringify({ foo: 'bar' }));
    });

    it('should return false on error', () => {
      localStorage.setItem = vi.fn(() => { throw new Error('Storage error'); });

      const result = setStorageItem('test-key', { foo: 'bar' });
      expect(result).toBe(false);
    });
  });

  describe('removeStorageItem', () => {
    it('should remove item from localStorage', () => {
      mockStorage['test-key'] = 'value';

      removeStorageItem('test-key');

      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
    });
  });

  describe('getItemTimelineData', () => {
    it('should return default timeline data for new item', () => {
      const result = getItemTimelineData(1);

      expect(result).toEqual({
        startDate: null,
        dueDate: null,
        completedDate: null,
        estimatedHours: null,
        actualHours: 0,
        notes: ''
      });
    });

    it('should return stored timeline data', () => {
      const timelineData = { 1: { dueDate: '2024-06-15', notes: 'Test' } };
      mockStorage[STORAGE_KEYS.ITEM_TIMELINE_DATA] = JSON.stringify(timelineData);

      const result = getItemTimelineData(1);
      expect(result.dueDate).toBe('2024-06-15');
      expect(result.notes).toBe('Test');
    });
  });

  describe('setItemTimelineData', () => {
    it('should save timeline data for item', () => {
      const result = setItemTimelineData(1, { dueDate: '2024-06-15' });

      expect(result).toBe(true);
      const stored = JSON.parse(mockStorage[STORAGE_KEYS.ITEM_TIMELINE_DATA]);
      expect(stored[1].dueDate).toBe('2024-06-15');
      expect(stored[1].updatedAt).toBeDefined();
    });
  });

  describe('getFilterPresets', () => {
    it('should return empty array when no presets', () => {
      const result = getFilterPresets();
      expect(result).toEqual([]);
    });

    it('should return stored presets', () => {
      const presets = [{ id: 'preset-1', name: 'Test' }];
      mockStorage[STORAGE_KEYS.FILTER_PRESETS] = JSON.stringify(presets);

      const result = getFilterPresets();
      expect(result).toEqual(presets);
    });
  });

  describe('saveFilterPreset', () => {
    it('should add new preset', () => {
      const result = saveFilterPreset({ name: 'Test Preset' });

      expect(result).toBe(true);
      const stored = JSON.parse(mockStorage[STORAGE_KEYS.FILTER_PRESETS]);
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Test Preset');
      expect(stored[0].id).toMatch(/^preset-/);
    });

    it('should update existing preset', () => {
      const existing = [{ id: 'preset-1', name: 'Original' }];
      mockStorage[STORAGE_KEYS.FILTER_PRESETS] = JSON.stringify(existing);

      saveFilterPreset({ id: 'preset-1', name: 'Updated' });

      const stored = JSON.parse(mockStorage[STORAGE_KEYS.FILTER_PRESETS]);
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Updated');
    });
  });

  describe('deleteFilterPreset', () => {
    it('should remove preset by id', () => {
      const presets = [
        { id: 'preset-1', name: 'First' },
        { id: 'preset-2', name: 'Second' }
      ];
      mockStorage[STORAGE_KEYS.FILTER_PRESETS] = JSON.stringify(presets);

      deleteFilterPreset('preset-1');

      const stored = JSON.parse(mockStorage[STORAGE_KEYS.FILTER_PRESETS]);
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('preset-2');
    });
  });

  describe('getTimeEntries', () => {
    it('should return all entries when no itemId provided', () => {
      const entries = [
        { id: 'entry-1', itemId: 1, minutes: 30 },
        { id: 'entry-2', itemId: 2, minutes: 60 }
      ];
      mockStorage[STORAGE_KEYS.TIME_ENTRIES] = JSON.stringify(entries);

      const result = getTimeEntries();
      expect(result).toHaveLength(2);
    });

    it('should filter by itemId when provided', () => {
      const entries = [
        { id: 'entry-1', itemId: 1, minutes: 30 },
        { id: 'entry-2', itemId: 2, minutes: 60 }
      ];
      mockStorage[STORAGE_KEYS.TIME_ENTRIES] = JSON.stringify(entries);

      const result = getTimeEntries(1);
      expect(result).toHaveLength(1);
      expect(result[0].itemId).toBe(1);
    });
  });

  describe('addTimeEntry', () => {
    it('should add new time entry', () => {
      const result = addTimeEntry({ itemId: 1, minutes: 30 });

      expect(result).toBe(true);
      const stored = JSON.parse(mockStorage[STORAGE_KEYS.TIME_ENTRIES]);
      expect(stored).toHaveLength(1);
      expect(stored[0].minutes).toBe(30);
      expect(stored[0].id).toMatch(/^time-/);
    });
  });

  describe('updateTimeEntry', () => {
    it('should update existing entry', () => {
      const entries = [{ id: 'entry-1', itemId: 1, minutes: 30 }];
      mockStorage[STORAGE_KEYS.TIME_ENTRIES] = JSON.stringify(entries);

      const result = updateTimeEntry('entry-1', { minutes: 60 });

      expect(result).toBe(true);
      const stored = JSON.parse(mockStorage[STORAGE_KEYS.TIME_ENTRIES]);
      expect(stored[0].minutes).toBe(60);
    });

    it('should return false for non-existent entry', () => {
      mockStorage[STORAGE_KEYS.TIME_ENTRIES] = JSON.stringify([]);

      const result = updateTimeEntry('nonexistent', { minutes: 60 });
      expect(result).toBe(false);
    });
  });

  describe('deleteTimeEntry', () => {
    it('should remove entry by id', () => {
      const entries = [
        { id: 'entry-1', itemId: 1, minutes: 30 },
        { id: 'entry-2', itemId: 2, minutes: 60 }
      ];
      mockStorage[STORAGE_KEYS.TIME_ENTRIES] = JSON.stringify(entries);

      deleteTimeEntry('entry-1');

      const stored = JSON.parse(mockStorage[STORAGE_KEYS.TIME_ENTRIES]);
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('entry-2');
    });
  });

  describe('getTotalTimeForItem', () => {
    it('should sum minutes for item', () => {
      const entries = [
        { id: 'entry-1', itemId: 1, minutes: 30 },
        { id: 'entry-2', itemId: 1, minutes: 45 },
        { id: 'entry-3', itemId: 2, minutes: 60 }
      ];
      mockStorage[STORAGE_KEYS.TIME_ENTRIES] = JSON.stringify(entries);

      const result = getTotalTimeForItem(1);
      expect(result).toBe(75);
    });

    it('should return 0 for item with no entries', () => {
      mockStorage[STORAGE_KEYS.TIME_ENTRIES] = JSON.stringify([]);

      const result = getTotalTimeForItem(99);
      expect(result).toBe(0);
    });
  });

  describe('getProjectMetadata', () => {
    it('should return default metadata when none stored', () => {
      const result = getProjectMetadata();

      expect(result.projectName).toBe('');
      expect(result.projectType).toBe('Net New Site');
      expect(result.currency).toBe('USD');
    });

    it('should return stored metadata', () => {
      const metadata = { projectName: 'Test Project', clientName: 'Client' };
      mockStorage[STORAGE_KEYS.PROJECT_METADATA] = JSON.stringify(metadata);

      const result = getProjectMetadata();
      expect(result.projectName).toBe('Test Project');
    });
  });

  describe('setProjectMetadata', () => {
    it('should save and merge metadata', () => {
      setProjectMetadata({ projectName: 'Test' });

      const stored = JSON.parse(mockStorage[STORAGE_KEYS.PROJECT_METADATA]);
      expect(stored.projectName).toBe('Test');
      expect(stored.updatedAt).toBeDefined();
    });
  });

  describe('logActivity and getRecentActivities', () => {
    it('should add activity to the front', () => {
      logActivity({ type: 'test', message: 'Activity 1' });
      logActivity({ type: 'test', message: 'Activity 2' });

      const activities = getRecentActivities();
      expect(activities[0].message).toBe('Activity 2');
      expect(activities[1].message).toBe('Activity 1');
    });

    it('should limit activities returned', () => {
      for (let i = 0; i < 30; i++) {
        logActivity({ type: 'test', message: `Activity ${i}` });
      }

      const activities = getRecentActivities(10);
      expect(activities).toHaveLength(10);
    });
  });

  describe('checkStorageUsage', () => {
    it('should return usage information', () => {
      mockStorage[STORAGE_KEYS.COMPLETED_ITEMS] = JSON.stringify(['item1', 'item2']);

      const result = checkStorageUsage();

      expect(result).toHaveProperty('totalSize');
      expect(result).toHaveProperty('sizes');
      expect(result).toHaveProperty('percentUsed');
      expect(result).toHaveProperty('warningLevel');
    });
  });

  describe('exportAllData and importAllData', () => {
    it('should export and import data correctly', () => {
      mockStorage[STORAGE_KEYS.COMPLETED_ITEMS] = JSON.stringify(['item1']);
      mockStorage[STORAGE_KEYS.USER_PREFERENCES] = JSON.stringify({ theme: 'dark' });

      const exported = exportAllData();
      expect(exported.COMPLETED_ITEMS).toEqual(['item1']);
      expect(exported.USER_PREFERENCES).toEqual({ theme: 'dark' });
      expect(exported.version).toBe('2.0.0');

      // Clear and reimport
      mockStorage = {};
      const importResult = importAllData(exported);
      expect(importResult).toBe(true);
    });
  });

  describe('clearPhase9Data', () => {
    it('should remove Phase 9 specific data', () => {
      mockStorage[STORAGE_KEYS.ITEM_TIMELINE_DATA] = JSON.stringify({});
      mockStorage[STORAGE_KEYS.FILTER_PRESETS] = JSON.stringify([]);
      mockStorage[STORAGE_KEYS.COMPLETED_ITEMS] = JSON.stringify(['keep']);

      clearPhase9Data();

      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.ITEM_TIMELINE_DATA);
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.FILTER_PRESETS);
    });
  });
});
