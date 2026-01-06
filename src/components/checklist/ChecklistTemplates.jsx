import React, { useState } from 'react';
import {
  FileText,
  ClipboardList,
  Settings,
  MapPin,
  ShoppingCart,
  Rocket,
  Plus,
  Copy,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronRight,
  Star,
  Clock,
  Users,
  Save
} from 'lucide-react';
import { useChecklistTemplates, DEFAULT_TEMPLATES } from '../../hooks/useChecklistTemplates';
import { format } from 'date-fns';

const ICON_MAP = {
  'clipboard-list': ClipboardList,
  'settings': Settings,
  'file-text': FileText,
  'map-pin': MapPin,
  'shopping-cart': ShoppingCart,
  'rocket': Rocket,
};

export default function ChecklistTemplates({ onApplyTemplate, onClose }) {
  const { templates, loading, createTemplate, deleteTemplate, duplicateTemplate } = useChecklistTemplates();
  const [activeTab, setActiveTab] = useState('default');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const allTemplates = activeTab === 'default' ? DEFAULT_TEMPLATES : templates;

  const handleApply = (template) => {
    onApplyTemplate(template);
    onClose?.();
  };

  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl overflow-hidden max-w-3xl w-full max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-charcoal-900 dark:text-white">Checklist Templates</h2>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
            Apply pre-configured checklists to your projects
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-charcoal-100 dark:border-charcoal-700 flex items-center gap-4">
        <button
          onClick={() => setActiveTab('default')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'default'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-700'
          }`}
        >
          <Star className="w-4 h-4 inline-block mr-2" />
          Default Templates
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'custom'
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              : 'text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-700'
          }`}
        >
          <Users className="w-4 h-4 inline-block mr-2" />
          My Templates
          {templates.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-charcoal-200 dark:bg-charcoal-600 text-charcoal-700 dark:text-charcoal-300 rounded-full text-xs">
              {templates.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setShowCreateForm(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Template List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-charcoal-100 dark:bg-charcoal-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : allTemplates.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-charcoal-100 dark:bg-charcoal-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-charcoal-400" />
            </div>
            <p className="text-charcoal-600 dark:text-charcoal-400 font-medium">No custom templates yet</p>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-500 mt-1">
              Create your first template to save time on future projects
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allTemplates.map((template) => {
              const Icon = ICON_MAP[template.icon] || ClipboardList;

              return (
                <div
                  key={template.id}
                  className="group p-4 rounded-xl border border-charcoal-200 dark:border-charcoal-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/30 dark:to-primary-800/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-charcoal-900 dark:text-white truncate">
                          {template.name}
                        </h3>
                        {template.isDefault && (
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-400 dark:text-charcoal-500">
                        <span className="flex items-center gap-1">
                          <ClipboardList className="w-3.5 h-3.5" />
                          {template.itemCount || template.categories?.length || 0} items
                        </span>
                        {template.usageCount > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Used {template.usageCount} times
                          </span>
                        )}
                        {template.createdAt && (
                          <span>
                            Created {format(template.createdAt, 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!template.isDefault && (
                        <>
                          <button
                            onClick={() => duplicateTemplate(template.id)}
                            className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
                            title="Duplicate"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="p-2 text-charcoal-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleApply(template)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Template Form Modal */}
      {showCreateForm && (
        <CreateTemplateForm
          onClose={() => setShowCreateForm(false)}
          onCreate={createTemplate}
        />
      )}
    </div>
  );
}

function CreateTemplateForm({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  const CATEGORY_OPTIONS = [
    'Technical SEO',
    'On-Page SEO',
    'Content Optimization',
    'Meta Tags',
    'Schema Markup',
    'Site Speed',
    'Mobile Optimization',
    'Internal Linking',
    'External Linking',
    'Image Optimization',
    'Security',
    'Accessibility',
    'Analytics',
    'Local SEO',
    'E-commerce',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    await onCreate({
      name: name.trim(),
      description: description.trim(),
      categories: selectedCategories,
      itemCount: selectedCategories.length * 8, // Approximate
    });
    setSaving(false);
    onClose();
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 dark:bg-charcoal-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
        <div className="px-6 py-4 border-b border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-charcoal-900 dark:text-white">Create Template</h3>
          <button
            onClick={onClose}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Blog Post Optimization"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when to use this template..."
              className="input min-h-[80px] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
              Categories to Include
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategories.includes(category)
                      ? 'bg-primary-500 text-white'
                      : 'bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-200 dark:hover:bg-charcoal-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Creating...' : 'Create Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Export a simpler template selector for inline use
export function TemplateSelector({ onSelect, className = '' }) {
  const { templates } = useChecklistTemplates();
  const [isOpen, setIsOpen] = useState(false);

  const allTemplates = [...DEFAULT_TEMPLATES, ...templates];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-charcoal-100 dark:bg-charcoal-700 hover:bg-charcoal-200 dark:hover:bg-charcoal-600 text-charcoal-700 dark:text-charcoal-300 rounded-lg text-sm font-medium transition-colors"
      >
        <FileText className="w-4 h-4" />
        Apply Template
        <ChevronRight className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-charcoal-800 rounded-xl border border-charcoal-200 dark:border-charcoal-700 shadow-xl z-50 py-2 max-h-80 overflow-y-auto">
          {allTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onSelect(template);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors"
            >
              <p className="font-medium text-charcoal-900 dark:text-white text-sm">{template.name}</p>
              <p className="text-xs text-charcoal-500 dark:text-charcoal-400 truncate">{template.description}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
