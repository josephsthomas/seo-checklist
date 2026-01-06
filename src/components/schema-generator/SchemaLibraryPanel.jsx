import React, { useState, useMemo } from 'react';
import {
  Library,
  Search,
  Code2,
  Clock,
  Copy,
  Trash2,
  X,
  ChevronDown,
  Filter,
  Check,
  FileText,
  Package,
  MapPin,
  Building,
  User,
  Calendar,
  HelpCircle,
  Star,
  Video,
  Briefcase,
  Save,
  Edit3,
  Eye
} from 'lucide-react';
import { useSchemaLibrary, SCHEMA_TYPES } from '../../hooks/useSchemaLibrary';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ICON_MAP = {
  'file-text': FileText,
  'package': Package,
  'map-pin': MapPin,
  'building': Building,
  'user': User,
  'calendar': Calendar,
  'help-circle': HelpCircle,
  'star': Star,
  'video': Video,
  'briefcase': Briefcase,
};

export default function SchemaLibraryPanel({ onApply, onClose, currentSchema }) {
  const { schemas, loading, saveSchema, deleteSchema, duplicateSchema, searchSchemas } = useSchemaLibrary();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [viewingSchema, setViewingSchema] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const filteredSchemas = useMemo(() => {
    let results = searchQuery ? searchSchemas(searchQuery) : schemas;

    if (selectedType !== 'all') {
      results = results.filter(schema => schema.schemaType === selectedType);
    }

    return results;
  }, [schemas, searchQuery, selectedType, searchSchemas]);

  const uniqueTypes = useMemo(() => {
    const types = new Set(schemas.map(s => s.schemaType).filter(Boolean));
    return Array.from(types);
  }, [schemas]);

  const handleCopy = async (schema) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(schema.schema, null, 2));
      setCopiedId(schema.id);
      toast.success('Schema copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleApply = (schema) => {
    onApply?.(schema);
    toast.success('Schema applied');
    onClose?.();
  };

  const handleDelete = async (schemaId) => {
    if (confirm('Are you sure you want to delete this schema?')) {
      await deleteSchema(schemaId);
    }
  };

  const getSchemaTypeIcon = (schemaType) => {
    const type = SCHEMA_TYPES.find(t => t.id === schemaType);
    const IconComponent = ICON_MAP[type?.icon] || Code2;
    return IconComponent;
  };

  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl overflow-hidden max-w-3xl w-full max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
            <Library className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal-900 dark:text-white">Schema Library</h2>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
              {schemas.length} saved schemas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentSchema && (
            <button
              onClick={() => setShowSaveForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Current
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="px-6 py-3 border-b border-charcoal-100 dark:border-charcoal-700 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemas..."
            className="input pl-11"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-charcoal-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="select text-sm py-1.5"
            >
              <option value="all">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Type Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {SCHEMA_TYPES.slice(0, 6).map((type) => {
            const TypeIcon = ICON_MAP[type.icon] || Code2;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id === selectedType ? 'all' : type.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedType === type.id
                    ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                    : 'bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-300 hover:bg-charcoal-200 dark:hover:bg-charcoal-600'
                }`}
              >
                <TypeIcon className="w-3.5 h-3.5" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schema List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-charcoal-100 dark:bg-charcoal-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredSchemas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-charcoal-100 dark:bg-charcoal-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Library className="w-8 h-8 text-charcoal-400" />
            </div>
            <p className="text-charcoal-600 dark:text-charcoal-400 font-medium">
              {searchQuery ? 'No schemas found' : 'No saved schemas yet'}
            </p>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-500 mt-1">
              {searchQuery ? 'Try a different search term' : 'Save schemas to reuse them across projects'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSchemas.map((schema) => {
              const TypeIcon = getSchemaTypeIcon(schema.schemaType);

              return (
                <div
                  key={schema.id}
                  className="group p-4 rounded-xl border border-charcoal-200 dark:border-charcoal-700 hover:border-rose-300 dark:hover:border-rose-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-800/20 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="w-6 h-6 text-rose-600 dark:text-rose-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-charcoal-900 dark:text-white truncate">
                          {schema.name}
                        </h3>
                        <span className="px-2 py-0.5 bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-300 text-xs font-medium rounded-full">
                          {schema.schemaType}
                        </span>
                      </div>
                      {schema.description && (
                        <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1 line-clamp-1">
                          {schema.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-charcoal-400 dark:text-charcoal-500">
                        {schema.usageCount > 0 && (
                          <span>Used {schema.usageCount} times</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {schema.createdAt ? formatDistanceToNow(schema.createdAt, { addSuffix: true }) : 'Recently'}
                        </span>
                      </div>
                      {schema.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {schema.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setViewingSchema(schema)}
                        className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopy(schema)}
                        className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
                        title="Copy"
                      >
                        {copiedId === schema.id ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => duplicateSchema(schema.id)}
                        className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(schema.id)}
                        className="p-2 text-charcoal-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {onApply && (
                        <button
                          onClick={() => handleApply(schema)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Save Schema Form */}
      {showSaveForm && currentSchema && (
        <SaveSchemaForm
          schema={currentSchema}
          onSave={saveSchema}
          onClose={() => setShowSaveForm(false)}
        />
      )}

      {/* View Schema Modal */}
      {viewingSchema && (
        <ViewSchemaModal
          schema={viewingSchema}
          onClose={() => setViewingSchema(null)}
          onApply={onApply}
        />
      )}
    </div>
  );
}

function SaveSchemaForm({ schema, onSave, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    await onSave({
      name: name.trim(),
      description: description.trim(),
      schemaType: schema['@type'] || 'Unknown',
      schema: schema,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 dark:bg-charcoal-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="px-6 py-4 border-b border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between">
          <h3 className="text-lg font-bold text-charcoal-900 dark:text-white">Save to Library</h3>
          <button onClick={onClose} className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
              Schema Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Page Schema"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="When to use this schema..."
              className="input min-h-[60px] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., ecommerce, product, seo"
              className="input"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || saving} className="btn btn-primary">
              {saving ? 'Saving...' : 'Save Schema'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ViewSchemaModal({ schema, onClose, onApply }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 dark:bg-charcoal-950/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-scale-in">
        <div className="px-6 py-4 border-b border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-charcoal-900 dark:text-white">{schema.name}</h3>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">{schema.schemaType}</p>
          </div>
          <button onClick={onClose} className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <pre className="bg-charcoal-900 text-charcoal-100 p-4 rounded-xl text-sm overflow-x-auto font-mono">
            {JSON.stringify(schema.schema, null, 2)}
          </pre>
        </div>

        <div className="px-6 py-4 border-t border-charcoal-100 dark:border-charcoal-700 flex justify-end gap-3">
          <button onClick={onClose} className="btn btn-secondary">Close</button>
          {onApply && (
            <button onClick={() => { onApply(schema); onClose(); }} className="btn btn-primary">
              Apply Schema
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
