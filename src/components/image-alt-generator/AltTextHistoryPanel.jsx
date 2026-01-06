import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Image,
  Clock,
  Copy,
  Trash2,
  X,
  ChevronDown,
  Filter,
  RefreshCcw,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAltTextHistory } from '../../hooks/useAltTextHistory';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function AltTextHistoryPanel({ onApply, onClose }) {
  const { history, loading, deleteFromHistory, clearHistory, searchHistory, getMostUsedTones } = useAltTextHistory(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTone, setSelectedTone] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const mostUsedTones = useMemo(() => getMostUsedTones(), [getMostUsedTones]);

  const filteredHistory = useMemo(() => {
    let results = searchQuery ? searchHistory(searchQuery) : history;

    if (selectedTone !== 'all') {
      results = results.filter(entry => entry.tone === selectedTone);
    }

    return results;
  }, [history, searchQuery, selectedTone, searchHistory]);

  const handleCopy = async (entry) => {
    try {
      await navigator.clipboard.writeText(entry.altText);
      setCopiedId(entry.id);
      toast.success('Alt text copied!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleApply = (entry) => {
    onApply?.(entry);
    toast.success('Alt text applied');
  };

  const handleDelete = async (entryId) => {
    const success = await deleteFromHistory(entryId);
    if (success) {
      toast.success('Entry deleted');
    }
  };

  const handleClearAll = async () => {
    const success = await clearHistory();
    if (success) {
      toast.success('History cleared');
      setShowClearConfirm(false);
    }
  };

  const uniqueTones = useMemo(() => {
    const tones = new Set(history.map(e => e.tone).filter(Boolean));
    return Array.from(tones);
  }, [history]);

  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full max-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal-900 dark:text-white">Alt Text History</h2>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
              {history.length} saved alt texts
            </p>
          </div>
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

      {/* Search and Filters */}
      <div className="px-6 py-3 border-b border-charcoal-100 dark:border-charcoal-700 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alt texts..."
            className="input pl-11"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-charcoal-400" />
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="select text-sm py-1.5"
            >
              <option value="all">All Tones</option>
              {uniqueTones.map(tone => (
                <option key={tone} value={tone}>{tone}</option>
              ))}
            </select>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="ml-auto text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {/* Tone Stats */}
        {mostUsedTones.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mostUsedTones.slice(0, 5).map(({ tone, count }) => (
              <button
                key={tone}
                onClick={() => setSelectedTone(tone === selectedTone ? 'all' : tone)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedTone === tone
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-300 hover:bg-charcoal-200 dark:hover:bg-charcoal-600'
                }`}
              >
                {tone} ({count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-charcoal-100 dark:bg-charcoal-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-charcoal-100 dark:bg-charcoal-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-charcoal-400" />
            </div>
            <p className="text-charcoal-600 dark:text-charcoal-400 font-medium">
              {searchQuery ? 'No results found' : 'No history yet'}
            </p>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-500 mt-1">
              {searchQuery ? 'Try a different search term' : 'Generated alt texts will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHistory.map((entry) => (
              <div
                key={entry.id}
                className="group p-4 rounded-xl border border-charcoal-200 dark:border-charcoal-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  {/* Image Preview */}
                  <div className="w-16 h-16 rounded-lg bg-charcoal-100 dark:bg-charcoal-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {entry.imageUrl ? (
                      <img
                        src={entry.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <Image className="w-8 h-8 text-charcoal-400" style={{ display: entry.imageUrl ? 'none' : 'block' }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-charcoal-900 dark:text-white line-clamp-2">
                      {entry.altText}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-charcoal-400 dark:text-charcoal-500">
                      {entry.imageName && (
                        <span className="truncate max-w-[150px]">{entry.imageName}</span>
                      )}
                      {entry.tone && (
                        <span className="px-2 py-0.5 bg-charcoal-100 dark:bg-charcoal-700 rounded-full">
                          {entry.tone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {entry.createdAt ? formatDistanceToNow(entry.createdAt, { addSuffix: true }) : 'Recently'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopy(entry)}
                      className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
                      title="Copy"
                    >
                      {copiedId === entry.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    {onApply && (
                      <button
                        onClick={() => handleApply(entry)}
                        className="p-2 text-charcoal-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                        title="Apply"
                      >
                        <RefreshCcw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-charcoal-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 dark:bg-charcoal-950/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-charcoal-900 dark:text-white">Clear All History?</h3>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="btn btn-danger"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
