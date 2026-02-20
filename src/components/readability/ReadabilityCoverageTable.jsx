/**
 * ReadabilityCoverageTable
 * Coverage metrics comparison table across LLMs.
 * BRD: FR-3.2.3, Screen Spec #4
 */

import React, { useState, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Table } from 'lucide-react';

function getCoverageColor(value) {
  if (value === null || value === undefined) return 'text-gray-400 dark:text-gray-500';
  if (value >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (value >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function getCoverageBg(value) {
  if (value === null || value === undefined) return '';
  if (value >= 80) return 'bg-emerald-50 dark:bg-emerald-900/10';
  if (value >= 50) return 'bg-amber-50 dark:bg-amber-900/10';
  return 'bg-red-50 dark:bg-red-900/10';
}

function formatPercent(value) {
  if (value === null || value === undefined) return 'N/A';
  return `${Math.round(value)}%`;
}

function formatScore(value) {
  if (value === null || value === undefined) return 'N/A';
  return `${value}/10`;
}

const COLUMNS = [
  { key: 'llm', label: 'AI Model', sortable: true, align: 'left' },
  { key: 'contentCoverage', label: 'Content Coverage', sortable: true, align: 'center' },
  { key: 'headingsCoverage', label: 'Headings Coverage', sortable: true, align: 'center' },
  { key: 'entitiesCoverage', label: 'Named Entities', sortable: true, align: 'center', title: 'Named entity recognition coverage (people, places, organizations)' },
  { key: 'usefulness', label: 'Usefulness', sortable: true, align: 'center' },
  { key: 'processingTime', label: 'Response Time', sortable: true, align: 'center' },
];

export default function ReadabilityCoverageTable({ data }) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = useCallback((key) => {
    if (sortCol === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(key);
      setSortDir('desc');
    }
  }, [sortCol]);

  if (!data || data.length === 0) return null;

  const sortedData = React.useMemo(() => [...data].sort((a, b) => {
    if (!sortCol) return 0;
    const valA = a[sortCol];
    const valB = b[sortCol];
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    if (typeof valA === 'string') {
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortDir === 'asc' ? valA - valB : valB - valA;
  }), [data, sortCol, sortDir]);

  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-gray-100 dark:border-charcoal-700">
        <Table className="w-5 h-5 text-teal-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Coverage Comparison
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full" role="table" aria-label="AI model coverage comparison">
          <thead>
            <tr className="bg-gray-50 dark:bg-charcoal-850">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 ${
                    col.align === 'center' ? 'text-center' : 'text-left'
                  } ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                  tabIndex={col.sortable ? 0 : undefined}
                  role={col.sortable ? 'button' : undefined}
                  title={col.title || undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  onKeyDown={col.sortable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(col.key); } } : undefined}
                  aria-sort={
                    sortCol === col.key
                      ? sortDir === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      sortCol === col.key ? (
                        sortDir === 'asc' ? (
                          <ArrowUp className="w-3 h-3" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="w-3 h-3" aria-hidden="true" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-40" aria-hidden="true" />
                      )
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-charcoal-700">
            {sortedData.map((row, idx) => (
              <tr
                key={row.llm}
                className="hover:bg-gray-50 dark:hover:bg-charcoal-750 transition-colors"
              >
                {/* LLM name */}
                <td className="px-4 py-3">
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {row.llm}
                    </span>
                    {row.model && (
                      <p className="text-xs text-gray-400 dark:text-gray-500">{row.model}</p>
                    )}
                  </div>
                </td>

                {/* Content coverage */}
                <td className={`px-4 py-3 text-center ${getCoverageBg(row.contentCoverage)}`}>
                  <span className={`text-sm font-semibold ${getCoverageColor(row.contentCoverage)}`}>
                    {formatPercent(row.contentCoverage)}
                  </span>
                </td>

                {/* Headings coverage */}
                <td className={`px-4 py-3 text-center ${getCoverageBg(row.headingsCoverage)}`}>
                  <span className={`text-sm font-semibold ${getCoverageColor(row.headingsCoverage)}`}>
                    {formatPercent(row.headingsCoverage)}
                  </span>
                </td>

                {/* Entities coverage */}
                <td className={`px-4 py-3 text-center ${getCoverageBg(row.entitiesCoverage)}`}>
                  <span className={`text-sm font-semibold ${getCoverageColor(row.entitiesCoverage)}`}>
                    {formatPercent(row.entitiesCoverage)}
                  </span>
                </td>

                {/* Usefulness */}
                <td className="px-4 py-3 text-center">
                  <span className={`text-sm font-semibold ${getCoverageColor(
                    row.usefulness !== null ? row.usefulness * 10 : null
                  )}`}>
                    {formatScore(row.usefulness)}
                  </span>
                </td>

                {/* Processing time */}
                <td className="px-4 py-3 text-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {row.processingTime
                      ? typeof row.processingTime === 'number'
                        ? `${(row.processingTime / 1000).toFixed(1)}s`
                        : row.processingTime
                      : 'N/A'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-charcoal-700 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
          &ge;80% Good
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" aria-hidden="true" />
          50-79% Fair
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-400" aria-hidden="true" />
          &lt;50% Poor
        </span>
      </div>
    </div>
  );
}
