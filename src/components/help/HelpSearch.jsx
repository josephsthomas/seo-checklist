import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  Book,
  FileText,
  Wrench,
  ChevronRight,
  Command,
  Sparkles,
  BookOpen,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { glossaryTerms } from '../../data/glossary';
import { getActiveTools } from '../../config/tools';

// Quick Actions - frequently needed help items
const quickActions = [
  { id: 'keyboard', label: 'Keyboard Shortcuts', icon: Command, action: 'keyboard' },
  { id: 'resources', label: 'Resource Library', icon: BookOpen, path: '/help/resources' },
  { id: 'glossary', label: 'SEO Glossary', icon: Book, path: '/help/glossary' },
  { id: 'feedback', label: 'Send Feedback', icon: HelpCircle, action: 'feedback' }
];

// Search result categories
const RESULT_TYPES = {
  TOOL: 'tool',
  GLOSSARY: 'glossary',
  ACTION: 'action',
  RESOURCE: 'resource'
};

export default function HelpSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const navigate = useNavigate();

  // Combine all searchable content
  const allResults = useMemo(() => {
    if (!query.trim()) {
      // Show quick actions when no query
      return quickActions.map(action => ({
        type: RESULT_TYPES.ACTION,
        id: action.id,
        title: action.label,
        icon: action.icon,
        path: action.path,
        action: action.action
      }));
    }

    const searchTerm = query.toLowerCase();
    const results = [];

    // Search tools
    getActiveTools().forEach(tool => {
      if (
        tool.name.toLowerCase().includes(searchTerm) ||
        tool.description.toLowerCase().includes(searchTerm) ||
        tool.features.some(f => f.toLowerCase().includes(searchTerm))
      ) {
        results.push({
          type: RESULT_TYPES.TOOL,
          id: tool.id,
          title: tool.name,
          description: tool.features[0],
          icon: tool.icon,
          path: tool.path,
          color: tool.color
        });
      }
    });

    // Search glossary terms (limit to 8)
    const glossaryResults = glossaryTerms
      .filter(term =>
        term.term.toLowerCase().includes(searchTerm) ||
        term.definition.toLowerCase().includes(searchTerm) ||
        term.category.toLowerCase().includes(searchTerm)
      )
      .slice(0, 8)
      .map(term => ({
        type: RESULT_TYPES.GLOSSARY,
        id: `glossary-${term.id}`,
        title: term.term,
        description: term.definition.substring(0, 100) + '...',
        icon: Book,
        category: term.category,
        path: `/help/glossary?term=${encodeURIComponent(term.term)}`
      }));

    results.push(...glossaryResults);

    // Search quick actions
    quickActions.forEach(action => {
      if (action.label.toLowerCase().includes(searchTerm)) {
        results.push({
          type: RESULT_TYPES.ACTION,
          id: action.id,
          title: action.label,
          icon: action.icon,
          path: action.path,
          action: action.action
        });
      }
    });

    return results;
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % allResults.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + allResults.length) % allResults.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (allResults[selectedIndex]) {
            handleSelect(allResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allResults, selectedIndex, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedEl = resultsRef.current.children[selectedIndex];
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (result) => {
    if (result.action === 'keyboard') {
      onClose();
      setTimeout(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
      }, 100);
    } else if (result.action === 'feedback') {
      onClose();
      // Trigger feedback widget
      const feedbackBtn = document.querySelector('[data-feedback-trigger]');
      if (feedbackBtn) feedbackBtn.click();
    } else if (result.path) {
      onClose();
      navigate(result.path);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Search Modal */}
      <div className="fixed inset-x-4 top-24 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-2xl z-50">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-charcoal-200">
          {/* Search Input */}
          <div className="relative flex items-center border-b border-charcoal-100">
            <Search className="absolute left-4 w-5 h-5 text-charcoal-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search tools, glossary, and help..."
              className="w-full pl-12 pr-12 py-4 text-lg text-charcoal-900 placeholder-charcoal-400 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="absolute right-4 p-1 hover:bg-charcoal-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-charcoal-400" />
            </button>
          </div>

          {/* Results */}
          <div
            ref={resultsRef}
            className="max-h-[60vh] overflow-y-auto p-2"
          >
            {allResults.length === 0 ? (
              <div className="py-12 text-center">
                <Search className="w-12 h-12 text-charcoal-200 mx-auto mb-3" />
                <p className="text-charcoal-500">No results found for "{query}"</p>
                <p className="text-charcoal-400 text-sm mt-1">Try a different search term</p>
              </div>
            ) : (
              <>
                {/* Section Header for Quick Actions */}
                {!query.trim() && (
                  <p className="px-3 py-2 text-xs font-semibold text-charcoal-400 uppercase tracking-wider">
                    Quick Actions
                  </p>
                )}

                {/* Results with Type Headers */}
                {query.trim() && (
                  <>
                    {/* Tools Section */}
                    {allResults.filter(r => r.type === RESULT_TYPES.TOOL).length > 0 && (
                      <p className="px-3 py-2 text-xs font-semibold text-charcoal-400 uppercase tracking-wider mt-2 first:mt-0">
                        Tools
                      </p>
                    )}
                    {allResults.filter(r => r.type === RESULT_TYPES.TOOL).map((result, idx) => {
                      const globalIdx = allResults.indexOf(result);
                      return (
                        <SearchResult
                          key={result.id}
                          result={result}
                          isSelected={selectedIndex === globalIdx}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                        />
                      );
                    })}

                    {/* Glossary Section */}
                    {allResults.filter(r => r.type === RESULT_TYPES.GLOSSARY).length > 0 && (
                      <p className="px-3 py-2 text-xs font-semibold text-charcoal-400 uppercase tracking-wider mt-2">
                        Glossary
                      </p>
                    )}
                    {allResults.filter(r => r.type === RESULT_TYPES.GLOSSARY).map((result) => {
                      const globalIdx = allResults.indexOf(result);
                      return (
                        <SearchResult
                          key={result.id}
                          result={result}
                          isSelected={selectedIndex === globalIdx}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                        />
                      );
                    })}

                    {/* Actions Section */}
                    {allResults.filter(r => r.type === RESULT_TYPES.ACTION).length > 0 && (
                      <p className="px-3 py-2 text-xs font-semibold text-charcoal-400 uppercase tracking-wider mt-2">
                        Quick Actions
                      </p>
                    )}
                    {allResults.filter(r => r.type === RESULT_TYPES.ACTION).map((result) => {
                      const globalIdx = allResults.indexOf(result);
                      return (
                        <SearchResult
                          key={result.id}
                          result={result}
                          isSelected={selectedIndex === globalIdx}
                          onClick={() => handleSelect(result)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                        />
                      );
                    })}
                  </>
                )}

                {/* Quick Actions (no query) */}
                {!query.trim() && allResults.map((result, idx) => (
                  <SearchResult
                    key={result.id}
                    result={result}
                    isSelected={selectedIndex === idx}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-charcoal-100 px-4 py-3 bg-charcoal-50 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-charcoal-500">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-charcoal-200 rounded text-xs font-mono">↑↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-charcoal-200 rounded text-xs font-mono">↵</kbd>
                <span>Select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-charcoal-200 rounded text-xs font-mono">Esc</kbd>
                <span>Close</span>
              </span>
            </div>
            <span className="text-charcoal-400 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Quick Search
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function SearchResult({ result, isSelected, onClick, onMouseEnter }) {
  const Icon = result.icon;

  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`
        w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left
        ${isSelected ? 'bg-primary-50' : 'hover:bg-charcoal-50'}
      `}
    >
      <div className={`
        w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
        ${result.type === RESULT_TYPES.TOOL ? 'bg-gradient-to-br from-primary-100 to-primary-50' : ''}
        ${result.type === RESULT_TYPES.GLOSSARY ? 'bg-gradient-to-br from-amber-100 to-amber-50' : ''}
        ${result.type === RESULT_TYPES.ACTION ? 'bg-gradient-to-br from-charcoal-100 to-charcoal-50' : ''}
        ${result.type === RESULT_TYPES.RESOURCE ? 'bg-gradient-to-br from-purple-100 to-purple-50' : ''}
      `}>
        <Icon className={`
          w-5 h-5
          ${result.type === RESULT_TYPES.TOOL ? 'text-primary-600' : ''}
          ${result.type === RESULT_TYPES.GLOSSARY ? 'text-amber-600' : ''}
          ${result.type === RESULT_TYPES.ACTION ? 'text-charcoal-600' : ''}
          ${result.type === RESULT_TYPES.RESOURCE ? 'text-purple-600' : ''}
        `} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-charcoal-900 truncate">{result.title}</div>
        {result.description && (
          <div className="text-sm text-charcoal-500 truncate">{result.description}</div>
        )}
        {result.category && (
          <div className="text-xs text-charcoal-400 mt-0.5">{result.category}</div>
        )}
      </div>

      <ChevronRight className={`
        w-5 h-5 flex-shrink-0 transition-colors
        ${isSelected ? 'text-primary-500' : 'text-charcoal-300'}
      `} />
    </button>
  );
}

/**
 * Trigger button for help search
 */
export function HelpSearchTrigger({ onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 bg-charcoal-100 hover:bg-charcoal-200 rounded-lg text-sm text-charcoal-600 transition-colors ${className}`}
    >
      <Search className="w-4 h-4" />
      <span>Search Help</span>
      <kbd className="hidden sm:inline px-1.5 py-0.5 bg-charcoal-200 rounded text-xs font-mono ml-2">⌘K</kbd>
    </button>
  );
}
