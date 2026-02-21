import { useState } from 'react';
import {
  Edit3,
  Save,
  CheckCircle2,
  Square,
  CheckSquare,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Bulk Edit Panel for Image Alt Text
 * Allows editing multiple alt texts at once
 */
export default function BulkEditPanel({
  results,
  onUpdateResults,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editMode, setEditMode] = useState(false);
  const [editedTexts, setEditedTexts] = useState({});
  const [, setBulkAction] = useState('');

  // Toggle selection for an item
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select/deselect all
  const toggleSelectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map((_, idx) => idx)));
    }
  };

  // Enter edit mode
  const enterEditMode = () => {
    const texts = {};
    results.forEach((r, idx) => {
      if (selectedIds.has(idx)) {
        texts[idx] = r.alt_text || '';
      }
    });
    setEditedTexts(texts);
    setEditMode(true);
  };

  // Save all edits
  const saveEdits = () => {
    const updatedResults = results.map((r, idx) => {
      if (Object.prototype.hasOwnProperty.call(editedTexts, idx)) {
        return { ...r, alt_text: editedTexts[idx] };
      }
      return r;
    });
    onUpdateResults(updatedResults);
    setEditMode(false);
    setEditedTexts({});
    toast.success(`Updated ${Object.keys(editedTexts).length} items`);
  };

  // Cancel edit mode
  const cancelEdit = () => {
    setEditMode(false);
    setEditedTexts({});
  };

  // Bulk action handlers
  const handleBulkAction = (action) => {
    if (selectedIds.size === 0) {
      toast.error('Select items first');
      return;
    }

    // Confirm destructive actions
    const destructiveActions = ['mark_decorative', 'lowercase'];
    if (destructiveActions.includes(action) && selectedIds.size > 1) {
      if (!window.confirm(`Apply "${action.replace(/_/g, ' ')}" to ${selectedIds.size} items? This cannot be undone.`)) {
        return;
      }
    }

    const updatedResults = [...results];

    switch (action) {
      case 'uppercase_first':
        selectedIds.forEach(idx => {
          const text = updatedResults[idx].alt_text || '';
          updatedResults[idx].alt_text = text.charAt(0).toUpperCase() + text.slice(1);
        });
        break;

      case 'lowercase':
        selectedIds.forEach(idx => {
          updatedResults[idx].alt_text = (updatedResults[idx].alt_text || '').toLowerCase();
        });
        break;

      case 'remove_period':
        selectedIds.forEach(idx => {
          updatedResults[idx].alt_text = (updatedResults[idx].alt_text || '').replace(/\.$/, '');
        });
        break;

      case 'add_period':
        selectedIds.forEach(idx => {
          const text = updatedResults[idx].alt_text || '';
          if (text && !text.endsWith('.')) {
            updatedResults[idx].alt_text = text + '.';
          }
        });
        break;

      case 'trim':
        selectedIds.forEach(idx => {
          updatedResults[idx].alt_text = (updatedResults[idx].alt_text || '').trim();
        });
        break;

      case 'mark_decorative':
        selectedIds.forEach(idx => {
          updatedResults[idx].is_decorative = true;
          updatedResults[idx].alt_text = '';
        });
        break;

      default:
        return;
    }

    onUpdateResults(updatedResults);
    toast.success(`Applied "${action.replace(/_/g, ' ')}" to ${selectedIds.size} items`);
    setBulkAction('');
  };

  // Find/Replace functionality
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const handleFindReplace = () => {
    if (!findText) {
      toast.error('Enter text to find');
      return;
    }

    const updatedResults = [...results];
    let count = 0;

    selectedIds.forEach(idx => {
      const text = updatedResults[idx].alt_text || '';
      if (text.includes(findText)) {
        updatedResults[idx].alt_text = text.replaceAll(findText, replaceText);
        count++;
      }
    });

    if (count > 0) {
      onUpdateResults(updatedResults);
      toast.success(`Replaced in ${count} items`);
      setFindText('');
      setReplaceText('');
    } else {
      toast.error('No matches found');
    }
  };

  const selectedCount = selectedIds.size;
  const hasSelection = selectedCount > 0;

  return (
    <div className={`bg-white rounded-xl border border-charcoal-100 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-charcoal-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-charcoal-900">Bulk Edit Mode</h3>
            <p className="text-sm text-charcoal-500">Edit multiple alt texts at once</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-charcoal-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-charcoal-400" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="p-4 pt-0 space-y-4">
          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-charcoal-600 hover:text-charcoal-900"
            >
              {selectedIds.size === results.length ? (
                <CheckSquare className="w-4 h-4 text-primary-500" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              {selectedIds.size === results.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-sm text-charcoal-500">
              {selectedCount} of {results.length} selected
            </span>
          </div>

          {/* Items List (Selectable) */}
          <div className="max-h-60 overflow-y-auto space-y-2 border border-charcoal-100 rounded-lg p-2">
            {results.map((result, idx) => (
              <div
                key={idx}
                onClick={() => !editMode && toggleSelect(idx)}
                className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedIds.has(idx)
                    ? 'bg-primary-50 border border-primary-200'
                    : 'bg-charcoal-50 border border-transparent hover:bg-charcoal-100'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedIds.has(idx)
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-charcoal-300'
                }`}>
                  {selectedIds.has(idx) && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-charcoal-500 truncate mb-1">
                    {result.original_filename || result.filename}
                  </p>
                  {editMode && Object.prototype.hasOwnProperty.call(editedTexts, idx) ? (
                    <textarea
                      value={editedTexts[idx]}
                      onChange={(e) => setEditedTexts(prev => ({ ...prev, [idx]: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-charcoal-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      rows={2}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className="text-sm text-charcoal-900">
                      {result.alt_text || <span className="text-charcoal-400 italic">No alt text</span>}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs ${
                      (result.alt_text?.length || 0) <= 125 ? 'text-emerald-600' : 'text-amber-600'
                    }`}>
                      {result.alt_text?.length || 0} chars
                    </span>
                    {result.is_decorative && (
                      <span className="text-xs bg-charcoal-100 text-charcoal-600 px-1.5 py-0.5 rounded">
                        Decorative
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Mode Controls */}
          {editMode ? (
            <div className="flex items-center gap-2">
              <button
                onClick={saveEdits}
                className="flex-1 btn btn-primary flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save All Changes
              </button>
              <button
                onClick={cancelEdit}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={enterEditMode}
                  disabled={!hasSelection}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Selected ({selectedCount})
                </button>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'uppercase_first', label: 'Capitalize First' },
                    { id: 'lowercase', label: 'Lowercase All' },
                    { id: 'add_period', label: 'Add Period' },
                    { id: 'remove_period', label: 'Remove Period' },
                    { id: 'trim', label: 'Trim Spaces' },
                    { id: 'mark_decorative', label: 'Mark Decorative' }
                  ].map(action => (
                    <button
                      key={action.id}
                      onClick={() => handleBulkAction(action.id)}
                      disabled={!hasSelection}
                      className="px-3 py-1.5 text-sm bg-charcoal-100 text-charcoal-700 rounded-lg hover:bg-charcoal-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Find & Replace */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide">Find & Replace</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Find..."
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Replace..."
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleFindReplace}
                    disabled={!hasSelection || !findText}
                    className="px-4 py-2 bg-charcoal-800 text-white text-sm font-medium rounded-lg hover:bg-charcoal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Replace
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Tip */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Select multiple images above, then use the quick actions or edit mode to make bulk changes. Changes apply immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
