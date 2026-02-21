/**
 * ReadabilityHistory
 * History list view — past analyses with filters, sort, pagination.
 * BRD: US-2.5.1, US-2.5.2, FR-5.2
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../shared/EmptyState';
import {
  History,
  Search,
  ExternalLink,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  ScanEye,
  Upload,
  FileCode,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';
import { useReadabilityHistory } from '../../hooks/useReadabilityHistory';

function getGradeColor(score) {
  if (score >= 90) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
  if (score >= 75) return 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300';
  if (score >= 70) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
  if (score >= 60) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
  return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
}

function InputMethodIcon({ method }) {
  switch (method) {
    case 'url':
      return <ExternalLink className="w-3.5 h-3.5" aria-label="URL analysis" />;
    case 'upload':
      return <Upload className="w-3.5 h-3.5" aria-label="File upload" />;
    case 'paste':
      return <FileCode className="w-3.5 h-3.5" aria-label="Pasted HTML" />;
    default:
      return <ScanEye className="w-3.5 h-3.5" aria-label="Analysis" />;
  }
}

function TrendArrow({ arrow }) {
  if (!arrow) return null;
  switch (arrow) {
    case 'up':
      return (
        <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400" title="Improved">
          <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="sr-only">Score improved</span>
        </span>
      );
    case 'down':
      return (
        <span className="inline-flex items-center gap-0.5 text-red-600 dark:text-red-400" title="Declined">
          <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="sr-only">Score declined</span>
        </span>
      );
    case 'stable':
      return (
        <span className="inline-flex items-center gap-0.5 text-gray-400 dark:text-gray-500" title="Stable">
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="sr-only">Score stable</span>
        </span>
      );
    default:
      return null;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function truncateUrl(url, max = 50) {
  if (!url) return 'Untitled Analysis';
  if (url.length <= max) return url;
  return url.substring(0, max - 3) + '...';
}

export default function ReadabilityHistory({ onAnalyze, storageLimit }) {
  const navigate = useNavigate();
  const {
    history,
    loading,
    error,
    stats,
    page,
    totalPages,
    hasMore,
    loadMore,
    filters,
    sortField,
    sortDirection,
    updateFilters,
    updateSort,
    deleteAnalysis,
    getTrendArrow,
    refresh,
  } = useReadabilityHistory();

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ searchUrl: searchInput });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, updateFilters]);

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteAnalysis(id);
        setDeleteConfirm(null);
      } catch {
        // Error handled by hook
      }
    },
    [deleteAnalysis]
  );

  const handleViewAnalysis = useCallback(
    (id) => {
      navigate(`/app/readability/${id}`);
    },
    [navigate]
  );

  // Loading state
  if (loading && (!history || history.length === 0)) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="h-4 bg-gray-200 dark:bg-charcoal-700 rounded w-1/3" />
              <div className="h-4 bg-gray-200 dark:bg-charcoal-700 rounded w-16 ml-auto" />
            </div>
            <div className="h-3 bg-gray-200 dark:bg-charcoal-700 rounded w-1/4 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!loading && (!history || history.length === 0) && !searchInput && !filters?.searchUrl) {
    return (
      <EmptyState
        icon={History}
        large
        title="No analyses yet"
        description="Start by analyzing a URL, uploading an HTML file, or pasting HTML content above."
        action={onAnalyze ? { label: 'Analyze Content', onClick: onAnalyze } : undefined}
        className="bg-white dark:bg-charcoal-800 py-16"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-teal-500" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Analysis History
          </h3>
          {stats && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {stats.total} of {storageLimit || '∞'} analyses
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by URL..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 w-48"
              aria-label="Search analyses by URL"
            />
          </div>

          {/* Sort toggle */}
          <button
            type="button"
            onClick={() =>
              updateSort(
                sortField,
                sortDirection === 'asc' ? 'desc' : 'asc'
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-charcoal-750 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label={`Sort by ${sortField}, currently ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
            {sortField === 'date' ? 'Date' : 'Score'} {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
          <button
            type="button"
            onClick={() =>
              updateSort(
                sortField === 'date' ? 'score' : 'date',
                sortDirection
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-200 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-charcoal-750 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
            aria-label={`Switch to sort by ${sortField === 'date' ? 'score' : 'date'}`}
          >
            {sortField === 'date' ? 'Score' : 'Date'}
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="ml-auto text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* No search results state */}
      {!loading && history.length === 0 && (searchInput || filters?.searchUrl) && (
        <div className="text-center py-8 bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700">
          <Search className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" aria-hidden="true" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">No analyses found</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
            No results matching &quot;{searchInput || filters?.searchUrl}&quot;
          </p>
          <button
            type="button"
            onClick={() => setSearchInput('')}
            className="mt-3 text-sm text-teal-600 dark:text-teal-400 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
          >
            Clear search
          </button>
        </div>
      )}

      {/* History items */}
      <div className="space-y-2">
        {history.map((item) => {
          const trendArrow = getTrendArrow(item);
          return (
            <div
              key={item.id}
              className="bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 hover:border-teal-200 dark:hover:border-teal-800/50 transition-colors"
            >
              <button
                type="button"
                onClick={() => handleViewAnalysis(item.id)}
                className="w-full text-left p-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-inset rounded-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left side */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-400 dark:text-gray-500">
                        <InputMethodIcon method={item.inputMethod} />
                      </span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.sourceUrl
                          ? truncateUrl(item.sourceUrl)
                          : item.pageTitle || 'Untitled Analysis'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        {formatDate(item.analyzedAt || item.createdAt)}
                      </span>
                      {item.wordCount && (
                        <span>{item.wordCount.toLocaleString()} words</span>
                      )}
                    </div>
                  </div>

                  {/* Right side — score + trend */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <TrendArrow arrow={trendArrow} />
                    {item.overallScore !== undefined && (
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${getGradeColor(
                          item.overallScore
                        )}`}
                      >
                        {Math.round(item.overallScore)}
                        {item.grade && (
                          <span className="ml-1 font-semibold">{item.grade}</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Delete button */}
              <div className="flex items-center justify-end px-4 pb-3 -mt-1">
                {deleteConfirm === item.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600 dark:text-red-400">Delete?</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(null)}
                      className="text-xs px-2 py-1 bg-gray-200 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-charcoal-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(item.id);
                    }}
                    className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label={`Delete analysis for ${item.sourceUrl || 'untitled'}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more / Pagination */}
      {hasMore && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-charcoal-600 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          >
            {loading ? (
              <>
                <span className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-teal-500 rounded-full" role="status" aria-label="Loading more analyses" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Load More
              </>
            )}
          </button>
        </div>
      )}

      {/* Page indicator */}
      {totalPages > 1 && (
        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          Page {page} of {totalPages}
        </p>
      )}
    </div>
  );
}
