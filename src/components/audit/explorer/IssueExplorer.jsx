import { useState, useMemo, useDeferredValue } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Check,
  ArrowUpDown,
  LayoutGrid,
  List,
  X
} from 'lucide-react';
import { SEVERITY, PRIORITY } from '../../../lib/audit/auditEngine';

export default function IssueExplorer({ issues, onSelectUrl, onClose }) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Sort state
  const [sortBy, setSortBy] = useState('severity');
  const [sortOrder, setSortOrder] = useState('desc');

  // UI state
  const [expandedIssues, setExpandedIssues] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [selectedIssues, setSelectedIssues] = useState(new Set());

  // Get unique categories from issues
  const categories = useMemo(() => {
    return [...new Set(issues.map(i => i.category))].sort();
  }, [issues]);

  // Filter and sort issues
  const filteredIssues = useMemo(() => {
    let result = issues.filter(issue => {
      if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
      if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
      if (filterPriority !== 'all' && issue.priority !== filterPriority) return false;
      if (deferredSearchQuery) {
        const query = deferredSearchQuery.toLowerCase();
        return (
          issue.title.toLowerCase().includes(query) ||
          issue.description.toLowerCase().includes(query) ||
          issue.category.toLowerCase().includes(query) ||
          issue.affectedUrls?.some(url => url.toLowerCase().includes(query))
        );
      }
      return true;
    });

    // Sort results
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'severity': {
          const severityOrder = { error: 0, warning: 1, info: 2 };
          comparison = severityOrder[a.severity] - severityOrder[b.severity];
          break;
        }
        case 'priority': {
          const priorityOrder = { must: 0, should: 1, could: 2 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        }
        case 'count':
          comparison = a.count - b.count;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return result;
  }, [issues, filterSeverity, filterCategory, filterPriority, deferredSearchQuery, sortBy, sortOrder]);

  // Calculate stats for filtered results
  const stats = useMemo(() => ({
    total: filteredIssues.length,
    errors: filteredIssues.filter(i => i.severity === SEVERITY.ERROR).length,
    warnings: filteredIssues.filter(i => i.severity === SEVERITY.WARNING).length,
    info: filteredIssues.filter(i => i.severity === SEVERITY.INFO).length,
    totalUrls: filteredIssues.reduce((sum, i) => sum + i.count, 0)
  }), [filteredIssues]);

  // Toggle sort field/order
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Toggle issue expansion
  const toggleIssue = (issueId) => {
    setExpandedIssues(prev => ({
      ...prev,
      [issueId]: !prev[issueId]
    }));
  };

  // Copy URL to clipboard
  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Toggle issue selection
  const toggleSelectIssue = (issueId) => {
    setSelectedIssues(prev => {
      const next = new Set(prev);
      if (next.has(issueId)) {
        next.delete(issueId);
      } else {
        next.add(issueId);
      }
      return next;
    });
  };

  // Select/deselect all
  const selectAll = () => {
    if (selectedIssues.size === filteredIssues.length) {
      setSelectedIssues(new Set());
    } else {
      setSelectedIssues(new Set(filteredIssues.map(i => i.id)));
    }
  };

  // Export selected issues to CSV
  const exportSelected = () => {
    const selectedData = filteredIssues.filter(i => selectedIssues.has(i.id));
    const csv = [
      ['Title', 'Category', 'Severity', 'Priority', 'Count', 'Description', 'Recommendation'].join(','),
      ...selectedData.map(i => [
        `"${i.title}"`,
        `"${i.category}"`,
        i.severity,
        i.priority,
        i.count,
        `"${i.description.replace(/"/g, '""')}"`,
        `"${i.recommendation.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit-issues.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterSeverity('all');
    setFilterCategory('all');
    setFilterPriority('all');
  };

  const hasActiveFilters = searchQuery || filterSeverity !== 'all' || filterCategory !== 'all' || filterPriority !== 'all';

  // Helper functions for UI
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case SEVERITY.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case SEVERITY.WARNING:
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case SEVERITY.ERROR:
        return 'bg-red-50 border-red-200';
      case SEVERITY.WARNING:
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      [PRIORITY.MUST]: 'bg-red-100 text-red-700',
      [PRIORITY.SHOULD]: 'bg-amber-100 text-amber-700',
      [PRIORITY.COULD]: 'bg-blue-100 text-blue-700'
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles[priority] || styles[PRIORITY.COULD]}`}>
        {(priority || 'could').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col bg-charcoal-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-charcoal-900">Issue Explorer</h2>
            <p className="text-sm text-charcoal-500">
              {stats.total} issues affecting {stats.totalUrls.toLocaleString()} URLs
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIssues.size > 0 && (
              <button
                onClick={exportSelected}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export {selectedIssues.size} Selected
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="p-2 hover:bg-charcoal-100 rounded-lg" aria-label="Close issue explorer">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Severity Filter Buttons */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setFilterSeverity(filterSeverity === SEVERITY.ERROR ? 'all' : SEVERITY.ERROR)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              filterSeverity === SEVERITY.ERROR ? 'bg-red-100 border-red-300' : 'bg-white border-charcoal-200 hover:border-red-300'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="font-medium">{stats.errors}</span>
            <span className="text-sm text-charcoal-500">Errors</span>
          </button>
          <button
            onClick={() => setFilterSeverity(filterSeverity === SEVERITY.WARNING ? 'all' : SEVERITY.WARNING)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              filterSeverity === SEVERITY.WARNING ? 'bg-amber-100 border-amber-300' : 'bg-white border-charcoal-200 hover:border-amber-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="font-medium">{stats.warnings}</span>
            <span className="text-sm text-charcoal-500">Warnings</span>
          </button>
          <button
            onClick={() => setFilterSeverity(filterSeverity === SEVERITY.INFO ? 'all' : SEVERITY.INFO)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              filterSeverity === SEVERITY.INFO ? 'bg-blue-100 border-blue-300' : 'bg-white border-charcoal-200 hover:border-blue-300'
            }`}
          >
            <Info className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{stats.info}</span>
            <span className="text-sm text-charcoal-500">Info</span>
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 w-full"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input w-48"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="input w-36"
          >
            <option value="all">All Priority</option>
            <option value={PRIORITY.MUST}>Must Fix</option>
            <option value={PRIORITY.SHOULD}>Should Fix</option>
            <option value={PRIORITY.COULD}>Could Fix</option>
          </select>

          <div className="flex items-center gap-1 border rounded-lg p-1 bg-white">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-charcoal-100' : 'hover:bg-charcoal-50'}`}
              title="List view"
              aria-label="Switch to list view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-charcoal-100' : 'hover:bg-charcoal-50'}`}
              title="Grid view"
              aria-label="Switch to grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn btn-secondary text-sm">
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Sort Bar */}
      <div className="bg-white border-b px-6 py-2 flex items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIssues.size === filteredIssues.length && filteredIssues.length > 0}
            onChange={selectAll}
            className="rounded border-charcoal-200"
          />
          <span className="text-charcoal-600">Select All</span>
        </label>
        <div className="flex-1" />
        <span className="text-charcoal-500">Sort by:</span>
        {['severity', 'priority', 'count', 'category'].map(field => (
          <button
            key={field}
            onClick={() => toggleSort(field)}
            className={`flex items-center gap-1 px-2 py-1 rounded hover:bg-charcoal-100 ${
              sortBy === field ? 'text-cyan-600 font-medium' : 'text-charcoal-600'
            }`}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
            {sortBy === field && <ArrowUpDown className="w-3 h-3" />}
          </button>
        ))}
      </div>

      {/* Issues List */}
      <div className="flex-1 overflow-auto p-6">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">No Issues Found</h3>
            <p className="text-charcoal-500">Try adjusting your filters to see more results.</p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIssues.map(issue => (
              <div
                key={issue.id}
                className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${getSeverityBg(issue.severity)}`}
                onClick={() => toggleIssue(issue.id)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={selectedIssues.has(issue.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelectIssue(issue.id); }}
                    className="mt-1 rounded border-charcoal-200"
                  />
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-charcoal-900 truncate">{issue.title}</h3>
                    <p className="text-sm text-charcoal-500">{issue.category}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {getPriorityBadge(issue.priority)}
                  <span className="text-sm font-medium text-charcoal-700">
                    {issue.count.toLocaleString()} URLs
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredIssues.map(issue => (
              <div key={issue.id} className="bg-white rounded-xl border overflow-hidden">
                {/* Issue Header */}
                <div
                  className="px-4 py-3 flex items-center gap-4 cursor-pointer hover:bg-charcoal-50"
                  onClick={() => toggleIssue(issue.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedIssues.has(issue.id)}
                    onChange={(e) => { e.stopPropagation(); toggleSelectIssue(issue.id); }}
                    className="rounded border-charcoal-200"
                  />
                  {getSeverityIcon(issue.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-charcoal-900">{issue.title}</h3>
                      {getPriorityBadge(issue.priority)}
                    </div>
                    <p className="text-sm text-charcoal-500">{issue.category}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-charcoal-700">
                      {issue.count.toLocaleString()} URLs
                    </span>
                    {expandedIssues[issue.id] ? (
                      <ChevronUp className="w-5 h-5 text-charcoal-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-charcoal-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedIssues[issue.id] ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                {expandedIssues[issue.id] && (
                  <div className="px-4 pb-4 border-t bg-charcoal-50">
                    <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-charcoal-700 mb-2">Description</h4>
                        <p className="text-charcoal-600 text-sm">{issue.description}</p>

                        <h4 className="text-sm font-medium text-charcoal-700 mt-4 mb-2">Recommendation</h4>
                        <p className="text-charcoal-600 text-sm">{issue.recommendation}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-charcoal-700 mb-2">
                          Affected URLs ({Math.min(issue.affectedUrls?.length || 0, 10)} of {issue.count})
                        </h4>
                        {issue.affectedUrls && issue.affectedUrls.length > 0 ? (
                          <ul className="space-y-1 max-h-48 overflow-y-auto">
                            {issue.affectedUrls.slice(0, 10).map((url, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm group">
                                <button
                                  onClick={() => onSelectUrl && onSelectUrl(url)}
                                  className="flex-1 text-left text-cyan-600 hover:text-cyan-700 truncate"
                                >
                                  {url}
                                </button>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => copyUrl(url)}
                                    className="p-1 hover:bg-charcoal-200 rounded"
                                    title="Copy URL"
                                  >
                                    {copiedUrl === url ? (
                                      <Check className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <Copy className="w-3 h-3 text-charcoal-400" />
                                    )}
                                  </button>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 hover:bg-charcoal-200 rounded"
                                    title="Open in new tab"
                                  >
                                    <ExternalLink className="w-3 h-3 text-charcoal-400" />
                                  </a>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-charcoal-500">No URLs available</p>
                        )}
                        {issue.count > 10 && (
                          <p className="text-sm text-charcoal-500 mt-2">+ {issue.count - 10} more URLs</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
