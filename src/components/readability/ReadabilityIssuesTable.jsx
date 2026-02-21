/**
 * ReadabilityIssuesTable
 * Filterable/sortable table of all check results.
 * BRD: Screen Spec #6, Issues Tab
 */

import React, { useState, useMemo, useCallback } from 'react';
import EmptyState from '../shared/EmptyState';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
} from 'lucide-react';

const STATUS_ICONS = {
  pass: { icon: CheckCircle2, class: 'text-emerald-500 dark:text-emerald-400' },
  warn: { icon: AlertTriangle, class: 'text-amber-500 dark:text-amber-400' },
  fail: { icon: XCircle, class: 'text-red-500 dark:text-red-400' },
  na: { icon: Info, class: 'text-gray-400 dark:text-gray-500' },
};

const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
const STATUS_ORDER = { fail: 0, warn: 1, na: 2, pass: 3 };

const CATEGORY_LABELS = {
  contentStructure: 'Content Structure',
  contentClarity: 'Content Clarity',
  technicalAccess: 'Technical Accessibility',
  metadataSchema: 'Metadata & Schema',
  aiSignals: 'AI-Specific Signals',
};

const ITEMS_PER_PAGE = 20;

export default function ReadabilityIssuesTable({ checkResults }) {
  const [searchText, setSearchText] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortCol, setSortCol] = useState('severity');
  const [sortDir, setSortDir] = useState('asc');
  const [expandedRow, setExpandedRow] = useState(null);
  const [page, setPage] = useState(1);

  const checks = useMemo(() => {
    if (!checkResults) return [];
    return Object.values(checkResults);
  }, [checkResults]);

  const handleSort = useCallback(
    (col) => {
      if (sortCol === col) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortCol(col);
        setSortDir('asc');
      }
      setPage(1);
    },
    [sortCol]
  );

  // Available filter values
  const filterOptions = useMemo(() => {
    const severities = new Set();
    const categories = new Set();
    const statuses = new Set();
    for (const c of checks) {
      if (c.severity) severities.add(c.severity);
      if (c.category) categories.add(c.category);
      if (c.status) statuses.add(c.status);
    }
    return {
      severities: Array.from(severities).sort(
        (a, b) => (SEVERITY_ORDER[a] ?? 99) - (SEVERITY_ORDER[b] ?? 99)
      ),
      categories: Array.from(categories).sort(),
      statuses: Array.from(statuses).sort(
        (a, b) => (STATUS_ORDER[a] ?? 99) - (STATUS_ORDER[b] ?? 99)
      ),
    };
  }, [checks]);

  // Filtered + sorted data
  const filteredChecks = useMemo(() => {
    let result = checks;

    // Text search
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter(
        (c) =>
          (c.title || '').toLowerCase().includes(q) ||
          (c.id || '').toLowerCase().includes(q) ||
          (c.name || '').toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q)
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      result = result.filter((c) => c.severity === severityFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((c) => c.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      let diff = 0;
      switch (sortCol) {
        case 'severity':
          diff = (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99);
          break;
        case 'status':
          diff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
          break;
        case 'id':
          diff = (a.id || '').localeCompare(b.id || '');
          break;
        case 'title':
          diff = (a.title || a.name || '').localeCompare(b.title || b.name || '');
          break;
        case 'category':
          diff = (a.category || '').localeCompare(b.category || '');
          break;
        default:
          diff = 0;
      }
      return sortDir === 'desc' ? -diff : diff;
    });

    return result;
  }, [checks, searchText, severityFilter, categoryFilter, statusFilter, sortCol, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredChecks.length / ITEMS_PER_PAGE));
  const pageChecks = filteredChecks.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const SortHeader = useCallback(({ column, label, align = 'left' }) => {
    const isSorted = sortCol === column;
    return (
      <th
        scope="col"
        className={`px-3 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-300 ${
          align === 'center' ? 'text-center' : 'text-left'
        }`}
        tabIndex={0}
        onClick={() => handleSort(column)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(column); } }}
        aria-sort={isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
        role="columnheader"
      >
        <span className="inline-flex items-center gap-1">
          {label}
          {isSorted ? (
            sortDir === 'asc' ? (
              <ArrowUp className="w-3 h-3" aria-hidden="true" />
            ) : (
              <ArrowDown className="w-3 h-3" aria-hidden="true" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 opacity-30" aria-hidden="true" />
          )}
        </span>
      </th>
    );
  }, [sortCol, sortDir, handleSort]);

  if (!checkResults || checks.length === 0) {
    return (
      <EmptyState icon={Info} title="No check results available." />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search checks..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            aria-label="Search check results"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-gray-400 hidden sm:block" aria-hidden="true" />

          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-gray-200 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-gray-700 dark:text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Filter by severity"
          >
            <option value="all">All Severities</option>
            {filterOptions.severities.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-gray-200 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-gray-700 dark:text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {filterOptions.categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c] || c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-sm border border-gray-200 dark:border-charcoal-600 rounded-lg bg-white dark:bg-charcoal-800 text-gray-700 dark:text-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            {filterOptions.statuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Showing {pageChecks.length} of {filteredChecks.length} checks
        {filteredChecks.length !== checks.length && ` (${checks.length} total)`}
      </p>

      {/* Table */}
      <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="bg-gray-50 dark:bg-charcoal-850">
                <SortHeader column="status" label="Status" align="center" />
                <SortHeader column="severity" label="Severity" />
                <SortHeader column="id" label="Check ID" />
                <SortHeader column="title" label="Title" />
                <SortHeader column="category" label="Category" />
                <th scope="col" className="px-3 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-charcoal-700">
              {pageChecks.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No checks match your filters.
                  </td>
                </tr>
              ) : (
                pageChecks.map((check) => {
                  const isExpanded = expandedRow === (check.id || check.name);
                  const statusCfg = STATUS_ICONS[check.status] || STATUS_ICONS.na;
                  const StatusIcon = statusCfg.icon;
                  const hasDetails = check.description || check.recommendation ||
                    (check.affectedElements && check.affectedElements.length > 0);

                  return (
                    <React.Fragment key={check.id || check.name}>
                      <tr
                        className={`hover:bg-gray-50 dark:hover:bg-charcoal-750 transition-colors ${
                          hasDetails ? 'cursor-pointer' : ''
                        }`}
                        tabIndex={hasDetails ? 0 : undefined}
                        role={hasDetails ? 'button' : undefined}
                        aria-expanded={hasDetails ? isExpanded : undefined}
                        onClick={
                          hasDetails
                            ? () =>
                                setExpandedRow(
                                  isExpanded ? null : check.id || check.name
                                )
                            : undefined
                        }
                        onKeyDown={
                          hasDetails
                            ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedRow(isExpanded ? null : check.id || check.name); } }
                            : undefined
                        }
                      >
                        {/* Status */}
                        <td className="px-3 py-3 text-center">
                          <StatusIcon
                            className={`w-4 h-4 mx-auto ${statusCfg.class}`}
                            aria-label={check.status}
                          />
                        </td>

                        {/* Severity */}
                        <td className="px-3 py-3">
                          <span
                            className={`text-xs font-medium px-1.5 py-0.5 rounded capitalize ${
                              check.severity === 'critical'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : check.severity === 'high'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                                : check.severity === 'medium'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                : check.severity === 'low'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-charcoal-700 dark:text-gray-400'
                            }`}
                          >
                            {check.severity || 'info'}
                          </span>
                        </td>

                        {/* Check ID */}
                        <td className="px-3 py-3">
                          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                            {check.id || '—'}
                          </span>
                        </td>

                        {/* Title */}
                        <td className="px-3 py-3">
                          <span className="text-sm text-gray-800 dark:text-gray-200">
                            {check.title || check.name || 'Unknown'}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="px-3 py-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {CATEGORY_LABELS[check.category] || check.category || '—'}
                          </span>
                        </td>

                        {/* Expand indicator */}
                        <td className="px-3 py-3 text-center">
                          {hasDetails &&
                            (isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-gray-400 mx-auto" aria-hidden="true" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-400 mx-auto" aria-hidden="true" />
                            ))}
                        </td>
                      </tr>

                      {/* Expanded details */}
                      {isExpanded && hasDetails && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-4 bg-gray-50 dark:bg-charcoal-850"
                          >
                            <div className="space-y-2 max-w-3xl">
                              {check.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {check.description}
                                </p>
                              )}
                              {check.affectedElements &&
                                check.affectedElements.length > 0 && (
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                      Affected:
                                    </p>
                                    <ul className="space-y-1">
                                      {check.affectedElements.slice(0, 5).map((el, i) => (
                                        <li
                                          key={i}
                                          className="text-xs font-mono bg-gray-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded"
                                        >
                                          {typeof el === 'string' ? el : el.element || String(el)}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              {check.recommendation && (
                                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-800/30 rounded-lg p-3 mt-2">
                                  <p className="text-xs font-medium text-teal-700 dark:text-teal-300 mb-0.5">
                                    Recommendation:
                                  </p>
                                  <p className="text-sm text-teal-800 dark:text-teal-200">
                                    {check.recommendation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-charcoal-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${
                    page === pageNum
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-charcoal-700'
                  }`}
                  aria-label={`Page ${pageNum}`}
                  aria-current={page === pageNum ? 'page' : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-charcoal-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
