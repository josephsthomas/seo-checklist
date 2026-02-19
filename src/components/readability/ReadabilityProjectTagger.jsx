/**
 * E-041: Project/Client Tagging
 * Allows users to tag analyses with project and client names
 * Tags persist across sessions and filter history
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Tag, X, Plus } from 'lucide-react';

export default function ReadabilityProjectTagger({ value = {}, onChange, recentTags = [] }) {
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  const { projectId = '', clientName = '', tags = [] } = value;

  const handleFieldChange = useCallback((field, fieldValue) => {
    onChange?.({ ...value, [field]: fieldValue });
  }, [value, onChange]);

  const handleAddTag = useCallback(() => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      handleFieldChange('tags', [...tags, trimmed]);
    }
    setNewTag('');
    setShowTagInput(false);
  }, [newTag, tags, handleFieldChange]);

  const handleRemoveTag = useCallback((tagToRemove) => {
    handleFieldChange('tags', tags.filter(t => t !== tagToRemove));
  }, [tags, handleFieldChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    } else if (e.key === 'Escape') {
      setShowTagInput(false);
      setNewTag('');
    }
  }, [handleAddTag]);

  // Suggest recent tags that aren't already selected
  const suggestions = useMemo(() => {
    return recentTags.filter(t => !tags.includes(t)).slice(0, 5);
  }, [recentTags, tags]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
        <Tag className="w-4 h-4 text-teal-500" aria-hidden="true" />
        <span>Project & Client Tags</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Project
          </label>
          <input
            type="text"
            value={projectId}
            onChange={(e) => handleFieldChange('projectId', e.target.value)}
            placeholder="e.g., Website Redesign"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            Client
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => handleFieldChange('clientName', e.target.value)}
            placeholder="e.g., Acme Corp"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-1.5 items-center">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full"
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-red-500 transition-colors"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {showTagInput ? (
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleAddTag}
              placeholder="Add tag..."
              className="px-2 py-0.5 text-xs border border-gray-300 dark:border-charcoal-600 rounded bg-white dark:bg-charcoal-800 text-gray-900 dark:text-white w-24 focus:ring-1 focus:ring-teal-500"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400 hover:text-teal-600 border border-dashed border-gray-300 dark:border-charcoal-600 rounded-full transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          )}
        </div>

        {/* Recent tag suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
            <span>Recent:</span>
            {suggestions.map(tag => (
              <button
                key={tag}
                onClick={() => handleFieldChange('tags', [...tags, tag])}
                className="hover:text-teal-500 transition-colors underline"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
