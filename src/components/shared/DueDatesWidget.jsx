import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  X,
  Flag,
  Loader2
} from 'lucide-react';
import { useDueDates, getDueDateUrgency } from '../../hooks/useDueDates';

/**
 * Due Date Item Component
 */
function DueDateItem({ item, onComplete, onDelete }) {
  const urgency = getDueDateUrgency(item.dueDate);
  const [completing, setCompleting] = useState(false);

  const urgencyColors = {
    overdue: 'bg-red-50 border-red-200 text-red-700',
    today: 'bg-amber-50 border-amber-200 text-amber-700',
    tomorrow: 'bg-orange-50 border-orange-200 text-orange-700',
    soon: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    week: 'bg-blue-50 border-blue-200 text-blue-700',
    future: 'bg-charcoal-50 border-charcoal-200 text-charcoal-600'
  };

  const priorityColors = {
    high: 'text-red-500',
    medium: 'text-amber-500',
    low: 'text-blue-500'
  };

  const handleComplete = async () => {
    setCompleting(true);
    await onComplete(item.id);
    setCompleting(false);
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
      item.completed ? 'bg-charcoal-50 border-charcoal-100 opacity-60' : urgencyColors[urgency.level]
    }`}>
      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={completing || item.completed}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
          item.completed
            ? 'bg-emerald-500 border-emerald-500'
            : 'border-charcoal-300 hover:border-primary-500 hover:bg-primary-50'
        }`}
      >
        {completing ? (
          <Loader2 className="w-3 h-3 animate-spin text-charcoal-400" />
        ) : item.completed ? (
          <CheckCircle2 className="w-3 h-3 text-white" />
        ) : null}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm ${item.completed ? 'line-through text-charcoal-400' : 'text-charcoal-900'}`}>
          {item.title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            item.completed ? 'bg-charcoal-100 text-charcoal-400' : ''
          }`}>
            {urgency.label}
          </span>
          {item.priority && (
            <Flag className={`w-3 h-3 ${priorityColors[item.priority] || priorityColors.medium}`} />
          )}
          {item.projectId && (
            <Link
              to={`/planner/projects/${item.projectId}`}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              View Project
            </Link>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(item.id)}
        className="p-1 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Add Due Date Modal
 */
function AddDueDateModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    dueDate: '',
    priority: 'medium'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate) return;

    setSaving(true);
    await onSave(formData);
    setSaving(false);
    setFormData({ title: '', dueDate: '', priority: 'medium' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-semibold text-charcoal-900 mb-4">Add Due Date</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Task or reminder..."
              className="w-full px-4 py-2 border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-charcoal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1">Priority</label>
            <div className="flex gap-2">
              {['high', 'medium', 'low'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: p })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    formData.priority === p
                      ? p === 'high' ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : p === 'medium' ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                        : 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-charcoal-50 text-charcoal-600 border-2 border-transparent'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Due Dates Widget for Dashboard
 */
export default function DueDatesWidget({ className = '' }) {
  const { overdue, dueToday, dueThisWeek, loading, addDueDate, markComplete, deleteDueDate } = useDueDates();
  const [showAddModal, setShowAddModal] = useState(false);

  const allItems = [...overdue, ...dueToday, ...dueThisWeek].slice(0, 5);
  const hasOverdue = overdue.length > 0;

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-charcoal-100 p-6 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-charcoal-100 rounded w-1/3" />
          {[1,2,3].map(i => (
            <div key={i} className="h-16 bg-charcoal-50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-charcoal-100 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className={`w-5 h-5 ${hasOverdue ? 'text-red-500' : 'text-charcoal-500'}`} />
          <h3 className="font-semibold text-charcoal-900">Due Dates</h3>
          {hasOverdue && (
            <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" />
              {overdue.length} overdue
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-1.5 text-charcoal-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="Add due date"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Items */}
      {allItems.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
          <p className="text-charcoal-500 text-sm">No upcoming due dates</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2"
          >
            Add one now
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {allItems.map(item => (
            <DueDateItem
              key={item.id}
              item={item}
              onComplete={markComplete}
              onDelete={deleteDueDate}
            />
          ))}

          {(overdue.length + dueToday.length + dueThisWeek.length) > 5 && (
            <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium py-2">
              View all ({overdue.length + dueToday.length + dueThisWeek.length})
            </button>
          )}
        </div>
      )}

      {/* Add Modal */}
      <AddDueDateModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={addDueDate}
      />
    </div>
  );
}
