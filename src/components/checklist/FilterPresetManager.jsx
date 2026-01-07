/**
 * Filter Preset Manager Component
 * Allows users to save, load, and manage filter presets
 * Phase 9 - Batch 3
 */

import { useState, useEffect } from 'react';
import { Save, Star, Trash2, Edit2, Download, Upload, X, Check, CheckCircle, AlertTriangle } from 'lucide-react';
import { getFilterPresets, saveFilterPreset, deleteFilterPreset } from '../../utils/storageHelpers';
import toast from 'react-hot-toast';

// Built-in preset templates
const PRESET_TEMPLATES = [
  {
    id: 'critical-only',
    name: 'Critical Items Only',
    description: 'Show only CRITICAL priority items',
    icon: 'AlertTriangle',
    filters: {
      priority: 'CRITICAL',
      hideCompleted: false
    },
    isBuiltIn: true
  },
  {
    id: 'blockers',
    name: 'Blockers',
    description: 'Show BLOCKER risk items',
    icon: 'AlertCircle',
    filters: {
      riskLevel: 'BLOCKER',
      hideCompleted: false
    },
    isBuiltIn: true
  },
  {
    id: 'technical-seo',
    name: 'Technical SEO',
    description: 'Focus on Technical SEO category',
    icon: 'Code',
    filters: {
      category: 'Technical SEO',
      hideCompleted: false
    },
    isBuiltIn: true
  },
  {
    id: 'pre-launch',
    name: 'Pre-Launch Checklist',
    description: 'Pre-Launch phase items',
    icon: 'Rocket',
    filters: {
      phase: 'Pre-Launch',
      hideCompleted: false
    },
    isBuiltIn: true
  },
  {
    id: 'incomplete-critical',
    name: 'Incomplete Critical Tasks',
    description: 'Critical items not yet completed',
    icon: 'AlertTriangle',
    filters: {
      priority: 'CRITICAL',
      hideCompleted: true
    },
    isBuiltIn: true
  }
];

export default function FilterPresetManager({ currentFilters, onApplyPreset, onClose }) {
  const [presets, setPresets] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editingPreset, setEditingPreset] = useState(null);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    loadPresets();
  }, []);

  // Keyboard navigation: Escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const loadPresets = () => {
    const userPresets = getFilterPresets();
    setPresets(userPresets);
  };

  const handleSaveCurrentFilters = () => {
    if (!newPresetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    const preset = {
      id: editingPreset?.id || undefined,
      name: newPresetName.trim(),
      description: newPresetDescription.trim(),
      filters: currentFilters,
      isDefault: false
    };

    const success = saveFilterPreset(preset);
    if (success) {
      toast.success(editingPreset ? 'Preset updated!' : 'Preset saved!');
      loadPresets();
      setShowSaveDialog(false);
      setEditingPreset(null);
      setNewPresetName('');
      setNewPresetDescription('');
    } else {
      toast.error('Failed to save preset');
    }
  };

  const handleDeletePreset = (presetId) => {
    setDeleteConfirm(presetId);
  };

  const confirmDeletePreset = () => {
    if (deleteConfirm) {
      const success = deleteFilterPreset(deleteConfirm);
      if (success) {
        toast.success('Preset deleted');
        loadPresets();
      } else {
        toast.error('Failed to delete preset');
      }
      setDeleteConfirm(null);
    }
  };

  const handleEditPreset = (preset) => {
    setEditingPreset(preset);
    setNewPresetName(preset.name);
    setNewPresetDescription(preset.description || '');
    setShowSaveDialog(true);
  };

  const handleApplyPreset = (preset) => {
    onApplyPreset(preset.filters);
    toast.success(`Applied "${preset.name}" preset`);
    onClose();
  };

  const handleExportPresets = () => {
    const dataStr = JSON.stringify(presets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `filter-presets-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Presets exported');
  };

  const handleImportPresets = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          imported.forEach(preset => saveFilterPreset(preset));
          loadPresets();
          toast.success(`Imported ${imported.length} presets`);
        } else {
          toast.error('Invalid preset file format');
        }
      } catch (error) {
        toast.error('Failed to import presets');
      }
    };
    reader.readAsText(file);
  };

  // Check if a preset is currently active
  const isPresetActive = (preset) => {
    if (!preset.filters || !currentFilters) return false;

    // Compare all filter properties
    const presetFilters = preset.filters;
    return Object.keys(presetFilters).every(key => {
      return presetFilters[key] === currentFilters[key];
    }) && Object.keys(currentFilters).every(key => {
      // Only check properties that exist in preset filters
      return Object.prototype.hasOwnProperty.call(presetFilters, key) ? presetFilters[key] === currentFilters[key] : true;
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="filter-presets-title">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-charcoal-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b flex items-center justify-between">
            <h3 id="filter-presets-title" className="text-lg font-semibold text-charcoal-900">
              <Star className="inline w-5 h-5 mr-2 text-yellow-500" aria-hidden="true" />
              Filter Presets
            </h3>
            <button
              onClick={onClose}
              className="text-charcoal-400 hover:text-charcoal-500"
              aria-label="Close filter presets modal"
            >
              <X className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[600px] overflow-y-auto">
            {/* Save Current Filters */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Save Current Filters</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    Save your current filter combination as a preset
                  </p>
                </div>
                <button
                  onClick={() => setShowSaveDialog(!showSaveDialog)}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Preset
                </button>
              </div>

              {showSaveDialog && (
                <div className="mt-4 space-y-3 bg-white p-4 rounded border border-blue-300">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Preset Name *
                    </label>
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      placeholder="e.g., My Critical Tasks"
                      className="input w-full"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={newPresetDescription}
                      onChange={(e) => setNewPresetDescription(e.target.value)}
                      placeholder="e.g., All critical items for this week"
                      className="input w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveCurrentFilters}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {editingPreset ? 'Update Preset' : 'Save Preset'}
                    </button>
                    <button
                      onClick={() => {
                        setShowSaveDialog(false);
                        setEditingPreset(null);
                        setNewPresetName('');
                        setNewPresetDescription('');
                      }}
                      className="px-4 py-2 bg-charcoal-200 text-charcoal-700 rounded hover:bg-charcoal-300 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Built-in Presets */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-charcoal-900 mb-3">Built-in Presets</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PRESET_TEMPLATES.map(preset => {
                  const isActive = isPresetActive(preset);
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-4 border rounded-lg hover:shadow-md transition-all text-left group ${
                        isActive
                          ? 'border-green-500 bg-green-50'
                          : 'border-charcoal-200 hover:border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h5 className={`text-sm font-medium ${
                            isActive ? 'text-green-700' : 'text-charcoal-900 group-hover:text-blue-600'
                          }`}>
                            {preset.name}
                          </h5>
                          {isActive && (
                            <CheckCircle className="w-4 h-4 text-green-600" aria-label="Currently active" />
                          )}
                        </div>
                        <Star className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                      </div>
                      <p className="text-xs text-charcoal-600">{preset.description}</p>
                      {isActive && (
                        <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Saved Presets */}
            {presets.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-charcoal-900 mb-3">My Saved Presets</h4>
                <div className="space-y-2">
                  {presets.map(preset => {
                    const isActive = isPresetActive(preset);
                    return (
                      <div
                        key={preset.id}
                        className={`p-4 border rounded-lg hover:shadow-md transition-all group ${
                          isActive
                            ? 'border-green-500 bg-green-50'
                            : 'border-charcoal-200 hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <button
                            onClick={() => handleApplyPreset(preset)}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className={`text-sm font-medium ${
                                isActive ? 'text-green-700' : 'text-charcoal-900 group-hover:text-blue-600'
                              }`}>
                                {preset.name}
                              </h5>
                              {isActive && (
                                <CheckCircle className="w-4 h-4 text-green-600" aria-label="Currently active" />
                              )}
                            </div>
                            {preset.description && (
                              <p className="text-xs text-charcoal-600">{preset.description}</p>
                            )}
                            {isActive && (
                              <span className="inline-block mt-2 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded">
                                Active
                              </span>
                            )}
                            <p className="text-xs text-charcoal-400 mt-2">
                              Created: {new Date(preset.createdAt).toLocaleDateString()}
                            </p>
                          </button>
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => handleEditPreset(preset)}
                              className="p-1.5 text-charcoal-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              aria-label={`Edit ${preset.name} preset`}
                            >
                              <Edit2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                              onClick={() => handleDeletePreset(preset.id)}
                              className="p-1.5 text-charcoal-400 hover:text-red-600 hover:bg-red-50 rounded"
                              aria-label={`Delete ${preset.name} preset`}
                            >
                              <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {presets.length === 0 && (
              <div className="text-center py-8 text-charcoal-500">
                <Star className="w-12 h-12 mx-auto mb-3 text-charcoal-300" />
                <p className="text-sm">No saved presets yet</p>
                <p className="text-xs mt-1">Save your current filters to create your first preset</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-charcoal-50 px-6 py-4 border-t flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={handleExportPresets}
                disabled={presets.length === 0}
                className="px-3 py-2 text-sm font-medium text-charcoal-700 bg-white border border-charcoal-200 rounded hover:bg-charcoal-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <label className="px-3 py-2 text-sm font-medium text-charcoal-700 bg-white border border-charcoal-200 rounded hover:bg-charcoal-50 cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportPresets}
                  className="hidden"
                />
              </label>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-charcoal-700 bg-white border border-charcoal-200 rounded hover:bg-charcoal-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" role="dialog" aria-modal="true" aria-labelledby="delete-preset-title">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 id="delete-preset-title" className="text-lg font-semibold text-charcoal-900">Delete Preset</h3>
            </div>
            <p className="text-charcoal-600 mb-6">
              Are you sure you want to delete this preset? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-charcoal-700 bg-charcoal-100 hover:bg-charcoal-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeletePreset}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
