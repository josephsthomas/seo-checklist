/**
 * Enhanced Storage Utilities for Phase 9
 * Handles localStorage with compression, versioning, and data migration
 */

import { logError } from './logger';

/**
 * Storage keys for different data types
 */
export const STORAGE_KEYS = {
  // Existing
  COMPLETED_ITEMS: 'seo-checklist-completed',
  USER_PREFERENCES: 'seo-checklist-preferences',

  // Phase 9 additions
  ITEM_TIMELINE_DATA: 'seo-checklist-timeline-v1',
  FILTER_PRESETS: 'seo-checklist-filter-presets-v1',
  TIME_ENTRIES: 'seo-checklist-time-entries-v1',
  PROJECT_METADATA: 'seo-checklist-project-metadata-v1',
  RECENT_ACTIVITY: 'seo-checklist-recent-activity-v1',

};

/**
 * Debounce utility function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (fn, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Get item from localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Stored value or default
 */
export const getStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    logError('storageHelpers', error, { action: 'getStorageItem', key });
    return defaultValue;
  }
};

/**
 * Set item in localStorage with error handling
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 * @returns {boolean} Success status
 */
export const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    logError('storageHelpers', error, { action: 'setStorageItem', key });

    // Check if quota exceeded
    if (error.name === 'QuotaExceededError' || error.code === 22) {
      logError('storageHelpers', 'LocalStorage quota exceeded', { action: 'setStorageItem', key });
      try {
        // Smart eviction: use checkStorageUsage to find largest items
        const usage = checkStorageUsage();
        const sortedBySize = Object.entries(usage.sizes)
          .filter(([k]) => k !== key) // don't evict the key we're trying to write
          .sort(([, a], [, b]) => b - a); // largest first

        // Evict largest expendable items first
        const expendableKeys = [
          STORAGE_KEYS.RECENT_ACTIVITY,
          STORAGE_KEYS.TIME_ENTRIES,
          STORAGE_KEYS.FILTER_PRESETS
        ];

        for (const [expendableKey] of sortedBySize) {
          if (expendableKeys.includes(expendableKey)) {
            localStorage.removeItem(expendableKey);
          }
        }

        // Evict oldest readability cache entries (LRU)
        evictReadabilityCacheLRU();

        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (retryError) {
        logError('storageHelpers', retryError, { action: 'setStorageItem', key, retryAfterQuotaExceeded: true });
      }
    }
    return false;
  }
};

/**
 * Remove item from localStorage
 * @param {string} key - Storage key
 */
export const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    logError('storageHelpers', error, { action: 'removeStorageItem', key });
  }
};

/**
 * Get timeline data for a specific item
 * @param {number} itemId - Item ID
 * @returns {Object} Timeline data
 */
export const getItemTimelineData = (itemId) => {
  const allTimeline = getStorageItem(STORAGE_KEYS.ITEM_TIMELINE_DATA, {});
  return allTimeline[itemId] || {
    startDate: null,
    dueDate: null,
    completedDate: null,
    estimatedHours: null,
    actualHours: 0,
    notes: ''
  };
};

/**
 * Save timeline data for a specific item
 * @param {number} itemId - Item ID
 * @param {Object} timelineData - Timeline data to save
 * @returns {boolean} Success status
 */
export const setItemTimelineData = (itemId, timelineData) => {
  const allTimeline = getStorageItem(STORAGE_KEYS.ITEM_TIMELINE_DATA, {});
  allTimeline[itemId] = {
    ...allTimeline[itemId],
    ...timelineData,
    updatedAt: new Date().toISOString()
  };
  return setStorageItem(STORAGE_KEYS.ITEM_TIMELINE_DATA, allTimeline);
};

/**
 * Get all filter presets
 * @returns {Array} Filter presets
 */
export const getFilterPresets = () => {
  return getStorageItem(STORAGE_KEYS.FILTER_PRESETS, []);
};

/**
 * Save a filter preset
 * @param {Object} preset - Preset to save
 * @returns {boolean} Success status
 */
export const saveFilterPreset = (preset) => {
  const presets = getFilterPresets();
  const newPreset = {
    ...preset,
    id: preset.id || `preset-${Date.now()}`,
    createdAt: preset.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Check if updating existing preset
  const existingIndex = presets.findIndex(p => p.id === newPreset.id);
  if (existingIndex >= 0) {
    presets[existingIndex] = newPreset;
  } else {
    presets.push(newPreset);
  }

  return setStorageItem(STORAGE_KEYS.FILTER_PRESETS, presets);
};

/**
 * Delete a filter preset
 * @param {string} presetId - Preset ID to delete
 * @returns {boolean} Success status
 */
export const deleteFilterPreset = (presetId) => {
  const presets = getFilterPresets();
  const filtered = presets.filter(p => p.id !== presetId);
  return setStorageItem(STORAGE_KEYS.FILTER_PRESETS, filtered);
};

/**
 * Get time entries for an item
 * @param {number} itemId - Item ID (optional, if not provided returns all)
 * @returns {Array} Time entries
 */
export const getTimeEntries = (itemId = null) => {
  const allEntries = getStorageItem(STORAGE_KEYS.TIME_ENTRIES, []);
  return itemId ? allEntries.filter(entry => entry.itemId === itemId) : allEntries;
};

/**
 * Add a time entry
 * @param {Object} entry - Time entry to add
 * @returns {boolean} Success status
 */
export const addTimeEntry = (entry) => {
  const entries = getTimeEntries();
  const newEntry = {
    ...entry,
    id: entry.id || `time-${Date.now()}`,
    createdAt: entry.createdAt || new Date().toISOString()
  };

  entries.push(newEntry);
  return setStorageItem(STORAGE_KEYS.TIME_ENTRIES, entries);
};

/**
 * Update a time entry
 * @param {string} entryId - Entry ID
 * @param {Object} updates - Updates to apply
 * @returns {boolean} Success status
 */
export const updateTimeEntry = (entryId, updates) => {
  const entries = getTimeEntries();
  const index = entries.findIndex(e => e.id === entryId);

  if (index >= 0) {
    entries[index] = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return setStorageItem(STORAGE_KEYS.TIME_ENTRIES, entries);
  }

  return false;
};

/**
 * Delete a time entry
 * @param {string} entryId - Entry ID to delete
 * @returns {boolean} Success status
 */
export const deleteTimeEntry = (entryId) => {
  const entries = getTimeEntries();
  const filtered = entries.filter(e => e.id !== entryId);
  return setStorageItem(STORAGE_KEYS.TIME_ENTRIES, filtered);
};

/**
 * Calculate total time logged for an item
 * @param {number} itemId - Item ID
 * @returns {number} Total minutes logged
 */
export const getTotalTimeForItem = (itemId) => {
  const entries = getTimeEntries(itemId);
  return entries.reduce((total, entry) => total + (entry.minutes || 0), 0);
};

/**
 * Get project metadata
 * @returns {Object} Project metadata
 */
export const getProjectMetadata = () => {
  return getStorageItem(STORAGE_KEYS.PROJECT_METADATA, {
    projectName: '',
    clientName: '',
    startDate: null,
    targetLaunchDate: null,
    projectType: 'Net New Site',
    budget: 0,
    currency: 'USD'
  });
};

/**
 * Save project metadata
 * @param {Object} metadata - Project metadata to save
 * @returns {boolean} Success status
 */
export const setProjectMetadata = (metadata) => {
  return setStorageItem(STORAGE_KEYS.PROJECT_METADATA, {
    ...getProjectMetadata(),
    ...metadata,
    updatedAt: new Date().toISOString()
  });
};

/**
 * Add to recent activity log
 * @param {Object} activity - Activity to log
 */
export const logActivity = (activity) => {
  const activities = getStorageItem(STORAGE_KEYS.RECENT_ACTIVITY, []);
  const newActivity = {
    ...activity,
    id: `activity-${Date.now()}`,
    timestamp: new Date().toISOString()
  };

  // Keep only last 100 activities to prevent storage bloat
  activities.unshift(newActivity);
  const trimmed = activities.slice(0, 100);

  setStorageItem(STORAGE_KEYS.RECENT_ACTIVITY, trimmed);
};

/**
 * Get recent activities
 * @param {number} limit - Number of activities to return
 * @returns {Array} Recent activities
 */
export const getRecentActivities = (limit = 20) => {
  const activities = getStorageItem(STORAGE_KEYS.RECENT_ACTIVITY, []);
  return activities.slice(0, limit);
};

/**
 * Check storage usage and warn if approaching limit
 * Includes all localStorage keys, not just STORAGE_KEYS
 * @returns {Object} Storage usage info
 */
export const checkStorageUsage = () => {
  let totalSize = 0;
  let cacheSize = 0;
  const sizes = {};

  // Check known STORAGE_KEYS
  for (const key of Object.values(STORAGE_KEYS)) {
    try {
      const item = localStorage.getItem(key);
      const size = item ? new Blob([item]).size : 0;
      sizes[key] = size;
      totalSize += size;
    } catch (error) {
      logError('storageHelpers', error, { action: 'checkStorageUsage', key });
    }
  }

  // Also account for readability cache entries
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('readability_cache_')) {
        const item = localStorage.getItem(key);
        const size = item ? new Blob([item]).size : 0;
        sizes[key] = size;
        cacheSize += size;
        totalSize += size;
      }
    }
  } catch (error) {
    logError('storageHelpers', error, { action: 'checkStorageUsage', phase: 'cache' });
  }

  // Typical localStorage limit is 5-10MB
  const estimatedLimit = 5 * 1024 * 1024; // 5MB
  const percentUsed = (totalSize / estimatedLimit) * 100;

  return {
    totalSize,
    cacheSize,
    sizes,
    estimatedLimit,
    percentUsed: Math.round(percentUsed),
    warningLevel: percentUsed > 80 ? 'critical' : percentUsed > 60 ? 'warning' : 'ok'
  };
};

/**
 * Evict oldest readability cache entries (LRU strategy)
 * Removes the oldest half of cache entries when called
 */
export const evictReadabilityCacheLRU = () => {
  try {
    const cacheEntries = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('readability_cache_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          cacheEntries.push({ key, cachedAt: data.cachedAt || 0 });
        } catch {
          // Invalid entry — remove it
          cacheEntries.push({ key, cachedAt: 0 });
        }
      }
    }

    if (cacheEntries.length === 0) return 0;

    // Sort by age (oldest first) and remove oldest half
    cacheEntries.sort((a, b) => a.cachedAt - b.cachedAt);
    const toRemove = cacheEntries.slice(0, Math.ceil(cacheEntries.length / 2));
    for (const entry of toRemove) {
      localStorage.removeItem(entry.key);
    }
    return toRemove.length;
  } catch (error) {
    logError('storageHelpers', error, { action: 'evictReadabilityCacheLRU' });
    return 0;
  }
};

/**
 * Clean orphaned storage entries
 * Removes unknown keys and expired cache entries
 * @returns {Object} Cleanup report
 */
export const cleanOrphanedStorage = () => {
  const knownPrefixes = [
    ...Object.values(STORAGE_KEYS),
    'readability_cache_',
    'session-data-warning-shown'
  ];
  const report = { removed: [], cacheExpired: 0, totalFreed: 0 };

  try {
    const keysToCheck = [];
    for (let i = 0; i < localStorage.length; i++) {
      keysToCheck.push(localStorage.key(i));
    }

    for (const key of keysToCheck) {
      if (!key) continue;

      // Check if key matches any known pattern
      const isKnown = knownPrefixes.some(prefix =>
        key === prefix || key.startsWith(prefix)
      );

      if (!isKnown) {
        // Unknown key — check if it looks like an orphaned cache
        const size = new Blob([localStorage.getItem(key) || '']).size;
        report.totalFreed += size;
        report.removed.push(key);
        localStorage.removeItem(key);
        continue;
      }

      // For readability cache entries, remove expired ones
      if (key.startsWith('readability_cache_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const age = Date.now() - (data.cachedAt || 0);
          const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
          if (age > maxAge) {
            const size = new Blob([localStorage.getItem(key) || '']).size;
            report.totalFreed += size;
            report.cacheExpired++;
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key);
          report.cacheExpired++;
        }
      }
    }
  } catch (error) {
    logError('storageHelpers', error, { action: 'cleanOrphanedStorage' });
  }

  return report;
};

/**
 * Export all data as JSON for backup
 * @returns {Object} All stored data
 */
export const exportAllData = () => {
  const exportData = {};

  for (const [name, key] of Object.entries(STORAGE_KEYS)) {
    exportData[name] = getStorageItem(key);
  }

  exportData.exportedAt = new Date().toISOString();
  exportData.version = '2.0.0';

  return exportData;
};

/**
 * Import data from JSON backup
 * @param {Object} data - Data to import
 * @returns {boolean} Success status
 */
export const importAllData = (data) => {
  try {
    for (const [name, key] of Object.entries(STORAGE_KEYS)) {
      if (data[name]) {
        setStorageItem(key, data[name]);
      }
    }
    return true;
  } catch (error) {
    logError('storageHelpers', error, { action: 'importAllData' });
    return false;
  }
};

/**
 * Clear all Phase 9 data (keep existing completed items)
 */
export const clearPhase9Data = () => {
  removeStorageItem(STORAGE_KEYS.ITEM_TIMELINE_DATA);
  removeStorageItem(STORAGE_KEYS.FILTER_PRESETS);
  removeStorageItem(STORAGE_KEYS.TIME_ENTRIES);
  removeStorageItem(STORAGE_KEYS.PROJECT_METADATA);
  removeStorageItem(STORAGE_KEYS.RECENT_ACTIVITY);
};

export default {
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
  evictReadabilityCacheLRU,
  cleanOrphanedStorage,
  exportAllData,
  importAllData,
  clearPhase9Data
};
