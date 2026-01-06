import React, { useState, useMemo, useRef, useEffect, useDeferredValue } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Columns,
  ExternalLink,
  Check,
  X,
  Filter
} from 'lucide-react';

// Define available columns
const COLUMNS = [
  { id: 'address', label: 'URL', width: 'min-w-[300px]', sortable: true, defaultVisible: true },
  { id: 'statusCode', label: 'Status', width: 'w-20', sortable: true, defaultVisible: true },
  { id: 'indexability', label: 'Indexability', width: 'w-28', sortable: true, defaultVisible: true },
  { id: 'title1', label: 'Title', width: 'min-w-[200px]', sortable: true, defaultVisible: true },
  { id: 'title1Length', label: 'Title Len', width: 'w-24', sortable: true, defaultVisible: false },
  { id: 'metaDescription1', label: 'Meta Desc', width: 'min-w-[200px]', sortable: true, defaultVisible: false },
  { id: 'metaDescription1Length', label: 'Meta Len', width: 'w-24', sortable: true, defaultVisible: false },
  { id: 'h1', label: 'H1', width: 'min-w-[150px]', sortable: true, defaultVisible: false },
  { id: 'wordCount', label: 'Words', width: 'w-20', sortable: true, defaultVisible: true },
  { id: 'crawlDepth', label: 'Depth', width: 'w-20', sortable: true, defaultVisible: true },
  { id: 'uniqueInlinks', label: 'Inlinks', width: 'w-20', sortable: true, defaultVisible: false },
  { id: 'uniqueOutlinks', label: 'Outlinks', width: 'w-20', sortable: true, defaultVisible: false },
  { id: 'responseTime', label: 'Response', width: 'w-24', sortable: true, defaultVisible: false },
  { id: 'size', label: 'Size', width: 'w-24', sortable: true, defaultVisible: false },
  { id: 'canonicalLinkElement1', label: 'Canonical', width: 'min-w-[200px]', sortable: true, defaultVisible: false }
];

const PAGE_SIZES = [25, 50, 100, 250];

export default function UrlDataTable({ urlData, onSelectUrl, isLoading = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortColumn, setSortColumn] = useState('address');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [visibleColumns, setVisibleColumns] = useState(
    COLUMNS.filter(c => c.defaultVisible).map(c => c.id)
  );
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const columnPickerRef = useRef(null);

  // Click outside handler for column picker
  useEffect(() => {
    function handleClickOutside(event) {
      if (columnPickerRef.current && !columnPickerRef.current.contains(event.target)) {
        setShowColumnPicker(false);
      }
    }
    if (showColumnPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColumnPicker]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = urlData || [];

    // Search filter
    if (deferredSearchQuery) {
      const query = deferredSearchQuery.toLowerCase();
      result = result.filter(row =>
        row.address?.toLowerCase().includes(query) ||
        row.title1?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(row => {
        const status = parseInt(row.statusCode, 10);
        switch (statusFilter) {
          case '2xx': return status >= 200 && status < 300;
          case '3xx': return status >= 300 && status < 400;
          case '4xx': return status >= 400 && status < 500;
          case '5xx': return status >= 500;
          case 'indexable': return row.indexability?.toLowerCase() === 'indexable';
          case 'non-indexable': return row.indexability?.toLowerCase() !== 'indexable';
          default: return true;
        }
      });
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      // Handle numeric values
      if (['statusCode', 'title1Length', 'metaDescription1Length', 'wordCount',
           'crawlDepth', 'uniqueInlinks', 'uniqueOutlinks', 'responseTime', 'size'].includes(sortColumn)) {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else {
        aVal = (aVal || '').toString().toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [urlData, deferredSearchQuery, statusFilter, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchQuery, statusFilter, pageSize]);

  const handleSort = (columnId) => {
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const toggleColumn = (columnId) => {
    setVisibleColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const getStatusBadge = (statusCode) => {
    const code = parseInt(statusCode, 10);
    if (code >= 200 && code < 300) {
      return <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">{code}</span>;
    }
    if (code >= 300 && code < 400) {
      return <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-700">{code}</span>;
    }
    if (code >= 400) {
      return <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">{code}</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-medium rounded bg-charcoal-100 text-charcoal-700">-</span>;
  };

  const getIndexabilityBadge = (indexability) => {
    if (indexability?.toLowerCase() === 'indexable') {
      return <span className="flex items-center gap-1 text-green-600"><Check className="w-4 h-4" /></span>;
    }
    return <span className="flex items-center gap-1 text-red-500"><X className="w-4 h-4" /></span>;
  };

  const formatSize = (bytes) => {
    const size = parseInt(bytes, 10);
    if (isNaN(size)) return '-';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderCellValue = (row, columnId) => {
    const value = row[columnId];

    switch (columnId) {
      case 'address':
        return (
          <button
            onClick={() => onSelectUrl && onSelectUrl(value)}
            className="text-left text-cyan-600 hover:text-cyan-700 hover:underline truncate max-w-[400px] block"
          >
            {value}
          </button>
        );
      case 'statusCode':
        return getStatusBadge(value);
      case 'indexability':
        return getIndexabilityBadge(value);
      case 'size':
        return formatSize(value);
      case 'responseTime':
        return value ? `${value}ms` : '-';
      case 'title1':
      case 'metaDescription1':
      case 'h1':
      case 'canonicalLinkElement1':
        return <span className="truncate max-w-[200px] block" title={value}>{value || '-'}</span>;
      default:
        return value || '-';
    }
  };

  return (
    <div className="h-full flex flex-col bg-charcoal-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-charcoal-900">URL Data</h2>
            <p className="text-sm text-charcoal-500">
              {filteredData.length.toLocaleString()} URLs {searchQuery || statusFilter !== 'all' ? '(filtered)' : ''}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search URLs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-full"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-40"
          >
            <option value="all">All Status</option>
            <option value="2xx">2xx Success</option>
            <option value="3xx">3xx Redirect</option>
            <option value="4xx">4xx Client Error</option>
            <option value="5xx">5xx Server Error</option>
            <option value="indexable">Indexable</option>
            <option value="non-indexable">Non-Indexable</option>
          </select>

          <div className="relative" ref={columnPickerRef}>
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Columns className="w-4 h-4" />
              Columns
            </button>

            {showColumnPicker && (
              <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-3 z-20 w-56">
                <p className="text-sm font-medium text-charcoal-700 mb-2">Show Columns</p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {COLUMNS.map(col => (
                    <label key={col.id} className="flex items-center gap-2 py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.id)}
                        onChange={() => toggleColumn(col.id)}
                        className="rounded border-charcoal-200"
                      />
                      <span className="text-sm text-charcoal-600">{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="bg-charcoal-100 sticky top-0">
            <tr>
              {COLUMNS.filter(col => visibleColumns.includes(col.id)).map(col => (
                <th
                  key={col.id}
                  className={`px-4 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider border-b ${col.width}`}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.id)}
                      className="flex items-center gap-1 hover:text-charcoal-700"
                    >
                      {col.label}
                      {sortColumn === col.id ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 opacity-50" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-charcoal-200">
            {isLoading ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-4 py-12 text-center text-charcoal-500"
                >
                  <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Loading URL data...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="px-4 py-12 text-center text-charcoal-500"
                >
                  <Filter className="w-8 h-8 mx-auto mb-2 text-charcoal-300" />
                  No URLs match your filters
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.address || idx} className="hover:bg-charcoal-50">
                  {COLUMNS.filter(col => visibleColumns.includes(col.id)).map(col => (
                    <td key={col.id} className="px-4 py-3 text-sm text-charcoal-600">
                      {renderCellValue(row, col.id)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-white border-t px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-charcoal-500">
            Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length.toLocaleString()}
          </span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value, 10))}
            className="input w-20 text-sm"
          >
            {PAGE_SIZES.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-charcoal-500">per page</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-charcoal-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm text-charcoal-600">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 rounded hover:bg-charcoal-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
