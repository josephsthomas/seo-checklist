import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Calendar,
  Tag,
  Users,
  Flag,
  FileText,
  Loader2
} from 'lucide-react';

const PHASES = ['Discovery', 'Strategy', 'Build', 'Pre-Launch', 'Launch', 'Post-Launch', 'Custom'];
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const CATEGORIES = [
  'Technical SEO',
  'Content',
  'On-Page SEO',
  'Off-Page SEO',
  'Local SEO',
  'Analytics',
  'Performance',
  'Security',
  'Accessibility',
  'Custom'
];
const OWNERS = ['SEO', 'Content', 'Dev', 'Design', 'Marketing', 'Team'];

/**
 * Modal to add or edit a custom checklist item
 */
export default function AddCustomItemModal({ isOpen, onClose, onSave, editItem = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    phase: 'Custom',
    priority: 'MEDIUM',
    category: 'Custom',
    owner: 'Team',
    dueDate: ''
  });
  const [saving, setSaving] = useState(false);

  // Reset form when opening or when editing different item
  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setFormData({
          title: editItem.item || '',
          description: editItem.description || '',
          phase: editItem.phase || 'Custom',
          priority: editItem.priority || 'MEDIUM',
          category: editItem.category || 'Custom',
          owner: editItem.owner || 'Team',
          dueDate: editItem.dueDate
            ? new Date(editItem.dueDate.seconds * 1000).toISOString().split('T')[0]
            : ''
        });
      } else {
        setFormData({
          title: '',
          description: '',
          phase: 'Custom',
          priority: 'MEDIUM',
          category: 'Custom',
          owner: 'Team',
          dueDate: ''
        });
      }
    }
  }, [isOpen, editItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      await onSave({
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : null
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const priorityColors = {
    CRITICAL: 'bg-red-100 text-red-700 border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
    LOW: 'bg-blue-100 text-blue-700 border-blue-200'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-charcoal-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-charcoal-900">
                {editItem ? 'Edit Custom Item' : 'Add Custom Item'}
              </h2>
              <p className="text-sm text-charcoal-500">Add your own checklist item</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter item title..."
              className="w-full px-4 py-2.5 border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about this item..."
              rows={3}
              className="w-full px-4 py-2.5 border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Priority & Phase Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                <Flag className="w-4 h-4 inline mr-1" />
                Priority
              </label>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map(priority => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      formData.priority === priority
                        ? priorityColors[priority]
                        : 'bg-charcoal-50 text-charcoal-600 border-charcoal-200 hover:border-charcoal-300'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            {/* Phase */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                <FileText className="w-4 h-4 inline mr-1" />
                Phase
              </label>
              <select
                value={formData.phase}
                onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                className="w-full px-3 py-2 border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                {PHASES.map(phase => (
                  <option key={phase} value={phase}>{phase}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Owner Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                <Tag className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Owner */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                <Users className="w-4 h-4 inline mr-1" />
                Owner
              </label>
              <select
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full px-3 py-2 border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                {OWNERS.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />
              Due Date (optional)
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-charcoal-100">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || saving}
              className="btn btn-primary flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {editItem ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
