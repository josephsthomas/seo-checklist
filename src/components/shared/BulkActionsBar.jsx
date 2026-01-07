import { useState, useEffect } from 'react';
import {
  X,
  Check,
  CheckCircle2,
  XCircle,
  Trash2,
  Download,
  Tag,
  Users,
  Calendar,
  Star,
  StarOff,
  Archive,
  Copy,
  MoreHorizontal
} from 'lucide-react';

/**
 * Bulk Actions Bar - Floating action bar for multi-select operations
 *
 * Usage:
 * <BulkActionsBar
 *   selectedCount={selectedItems.length}
 *   totalCount={items.length}
 *   onClear={() => setSelectedItems([])}
 *   actions={[
 *     { id: 'complete', label: 'Mark Complete', icon: CheckCircle2, onClick: handleComplete },
 *     { id: 'delete', label: 'Delete', icon: Trash2, onClick: handleDelete, variant: 'danger' }
 *   ]}
 * />
 */
export default function BulkActionsBar({
  selectedCount = 0,
  totalCount = 0,
  onClear,
  onSelectAll,
  actions = [],
  className = ''
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Animate in/out based on selection
  useEffect(() => {
    if (selectedCount > 0) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [selectedCount]);

  if (!isVisible && selectedCount === 0) return null;

  // Split actions: show first 4, rest in overflow menu
  const primaryActions = actions.slice(0, 4);
  const overflowActions = actions.slice(4);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        selectedCount > 0 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
    >
      <div className="bg-charcoal-900 text-white rounded-2xl shadow-2xl shadow-black/20 border border-charcoal-700 flex items-center gap-2 px-4 py-3">
        {/* Selection Info */}
        <div className="flex items-center gap-3 pr-4 border-r border-charcoal-700">
          <button
            onClick={onClear}
            className="w-8 h-8 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 flex items-center justify-center transition-colors"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="text-sm">
            <span className="font-semibold text-primary-400">{selectedCount}</span>
            <span className="text-charcoal-400"> of </span>
            <span className="text-charcoal-300">{totalCount}</span>
            <span className="text-charcoal-400"> selected</span>
          </div>
          {onSelectAll && selectedCount < totalCount && (
            <button
              onClick={onSelectAll}
              className="text-xs text-primary-400 hover:text-primary-300 font-medium"
            >
              Select all
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {primaryActions.map(action => {
            const Icon = action.icon;
            const isDisabled = action.disabled;
            const variant = action.variant || 'default';

            const variantClasses = {
              default: 'hover:bg-charcoal-800',
              primary: 'bg-primary-600 hover:bg-primary-500',
              success: 'hover:bg-emerald-600/20 hover:text-emerald-400',
              danger: 'hover:bg-red-600/20 hover:text-red-400'
            };

            return (
              <button
                key={action.id}
                onClick={() => !isDisabled && action.onClick?.()}
                disabled={isDisabled}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDisabled ? 'opacity-50 cursor-not-allowed' : variantClasses[variant]
                }`}
                title={action.title || action.label}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            );
          })}

          {/* Overflow Menu */}
          {overflowActions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowMore(!showMore)}
                className="flex items-center gap-1 px-2 py-2 rounded-lg hover:bg-charcoal-800 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {showMore && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMore(false)}
                  />
                  <div className="absolute bottom-full right-0 mb-2 bg-charcoal-800 rounded-xl border border-charcoal-700 shadow-xl py-1 min-w-[180px] z-20">
                    {overflowActions.map(action => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => {
                            action.onClick?.();
                            setShowMore(false);
                          }}
                          disabled={action.disabled}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-charcoal-700 transition-colors ${
                            action.variant === 'danger' ? 'text-red-400' : 'text-white'
                          } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {Icon && <Icon className="w-4 h-4" />}
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for managing bulk selection state
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useBulkSelection(items = []) {
  const [selected, setSelected] = useState(new Set());

  // Toggle single item
  const toggleItem = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select all items
  const selectAll = () => {
    setSelected(new Set(items.map(item => item.id)));
  };

  // Clear selection
  const clearSelection = () => {
    setSelected(new Set());
  };

  // Check if item is selected
  const isSelected = (id) => selected.has(id);

  // Get selected items
  const selectedItems = items.filter(item => selected.has(item.id));

  return {
    selected,
    selectedCount: selected.size,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected,
    selectedItems,
    setSelected
  };
}

/**
 * Bulk Select Checkbox Component
 */
export function BulkSelectCheckbox({ checked, onChange, className = '' }) {
  return (
    <label className={`flex items-center cursor-pointer ${className}`}>
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
        checked
          ? 'bg-primary-500 border-primary-500'
          : 'border-charcoal-300 hover:border-charcoal-400'
      }`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}

/**
 * Select All Checkbox for table headers
 */
export function SelectAllCheckbox({ checked, indeterminate, onChange, className = '' }) {
  return (
    <label className={`flex items-center cursor-pointer ${className}`}>
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
        checked || indeterminate
          ? 'bg-primary-500 border-primary-500'
          : 'border-charcoal-300 hover:border-charcoal-400'
      }`}>
        {checked && <Check className="w-3 h-3 text-white" />}
        {indeterminate && !checked && (
          <div className="w-2.5 h-0.5 bg-white rounded" />
        )}
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
    </label>
  );
}

/**
 * Predefined action creators for common bulk operations
 */
// eslint-disable-next-line react-refresh/only-export-components
export const createBulkActions = {
  complete: (onComplete) => ({
    id: 'complete',
    label: 'Complete',
    icon: CheckCircle2,
    variant: 'success',
    onClick: onComplete
  }),

  incomplete: (onIncomplete) => ({
    id: 'incomplete',
    label: 'Incomplete',
    icon: XCircle,
    onClick: onIncomplete
  }),

  delete: (onDelete) => ({
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'danger',
    onClick: onDelete
  }),

  export: (onExport) => ({
    id: 'export',
    label: 'Export',
    icon: Download,
    onClick: onExport
  }),

  assign: (onAssign) => ({
    id: 'assign',
    label: 'Assign',
    icon: Users,
    onClick: onAssign
  }),

  schedule: (onSchedule) => ({
    id: 'schedule',
    label: 'Schedule',
    icon: Calendar,
    onClick: onSchedule
  }),

  tag: (onTag) => ({
    id: 'tag',
    label: 'Add Tag',
    icon: Tag,
    onClick: onTag
  }),

  favorite: (onFavorite) => ({
    id: 'favorite',
    label: 'Favorite',
    icon: Star,
    onClick: onFavorite
  }),

  unfavorite: (onUnfavorite) => ({
    id: 'unfavorite',
    label: 'Unfavorite',
    icon: StarOff,
    onClick: onUnfavorite
  }),

  archive: (onArchive) => ({
    id: 'archive',
    label: 'Archive',
    icon: Archive,
    onClick: onArchive
  }),

  duplicate: (onDuplicate) => ({
    id: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    onClick: onDuplicate
  })
};
