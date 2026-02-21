import { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  Search,
  Download,
  User,
  Activity,
  Settings,
  Trash2,
  Edit3,
  Plus,
  Eye,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  RefreshCcw,
  X
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { collection, query, where, orderBy, limit as fbLimit, getDocs, Timestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import InfoTooltip from '../common/InfoTooltip';

const ACTION_TYPES = {
  CREATE: { label: 'Create', badgeClass: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400', icon: Plus },
  READ: { label: 'Read', badgeClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400', icon: Eye },
  UPDATE: { label: 'Update', badgeClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', icon: Edit3 },
  DELETE: { label: 'Delete', badgeClass: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', icon: Trash2 },
  EXPORT: { label: 'Export', badgeClass: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', icon: Download },
  LOGIN: { label: 'Login', badgeClass: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400', icon: User },
  LOGOUT: { label: 'Logout', badgeClass: 'bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300', icon: User },
  SETTINGS: { label: 'Settings', badgeClass: 'bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300', icon: Settings },
};

const RESOURCE_TYPES = [
  'Project',
  'Audit',
  'Accessibility Analyzer',
  'Image Alt Generator',
  'Meta Data Generator',
  'Structured Data Generator',
  'User',
  'Team',
  'Export',
  'Settings',
];

// Retention policy options
const RETENTION_OPTIONS = [
  { value: '30', label: '30 days', description: 'Minimum retention' },
  { value: '90', label: '90 days', description: 'Standard retention' },
  { value: '180', label: '180 days', description: 'Extended retention' },
  { value: '365', label: '1 year', description: 'Compliance retention' },
  { value: 'unlimited', label: 'Unlimited', description: 'No automatic deletion' }
];

export default function AuditLogViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedResource, setSelectedResource] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Retention settings
  const [showRetentionSettings, setShowRetentionSettings] = useState(false);
  const [retentionPeriod, setRetentionPeriod] = useState('90');

  const ITEMS_PER_PAGE = 25;

  // Calculate date range
  const dateRangeConfig = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case '24h':
        return { start: subDays(now, 1), end: now };
      case '7d':
        return { start: subDays(now, 7), end: now };
      case '30d':
        return { start: subDays(now, 30), end: now };
      case '90d':
        return { start: subDays(now, 90), end: now };
      default:
        return { start: subDays(now, 7), end: now };
    }
  }, [dateRange]);

  // Fetch audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);

      try {
        const startDate = dateRangeConfig.start;
        const auditRef = collection(db, 'audit_log');
        const q = query(
          auditRef,
          where('timestamp', '>=', Timestamp.fromDate(startDate)),
          orderBy('timestamp', 'desc'),
          fbLimit(500)
        );
        const snapshot = await getDocs(q);
        const logsData = snapshot.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || new Date()
          };
        });
        setLogs(logsData);
        setTotalPages(Math.ceil(logsData.length / ITEMS_PER_PAGE) || 1);
      } catch (err) {
        console.error('Error fetching logs:', err);
        toast.error('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [dateRange, refreshKey]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    let result = logs;

    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(log =>
        log.userName?.toLowerCase().includes(lowerQuery) ||
        log.userEmail?.toLowerCase().includes(lowerQuery) ||
        log.resourceName?.toLowerCase().includes(lowerQuery) ||
        log.ipAddress?.includes(lowerQuery)
      );
    }

    // Filter by action type
    if (selectedAction !== 'all') {
      result = result.filter(log => log.action === selectedAction);
    }

    // Filter by resource type
    if (selectedResource !== 'all') {
      result = result.filter(log => log.resource === selectedResource);
    }

    // Filter by date range
    result = result.filter(log =>
      log.timestamp >= dateRangeConfig.start && log.timestamp <= dateRangeConfig.end
    );

    return result;
  }, [logs, searchQuery, selectedAction, selectedResource, dateRangeConfig]);

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLogs, currentPage]);

  // Update total pages when filtered logs change
  useEffect(() => {
    setTotalPages(Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [filteredLogs.length]);

  const handleExport = (exportFormat = 'csv') => {
    if (filteredLogs.length === 0) {
      toast.error('No logs to export');
      return;
    }

    try {
      if (exportFormat === 'csv') {
        // Generate CSV
        const headers = ['Timestamp', 'User', 'Email', 'Action', 'Resource', 'Resource Name', 'IP Address', 'Status', 'Error Message'];
        const rows = filteredLogs.map(log => [
          format(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
          log.userName,
          log.userEmail,
          ACTION_TYPES[log.action]?.label || log.action,
          log.resource,
          log.resourceName,
          log.ipAddress,
          log.success ? 'Success' : 'Failed',
          log.errorMessage || ''
        ]);

        const csvContent = [headers, ...rows]
          .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
          .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `audit_log_${format(new Date(), 'yyyy-MM-dd')}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success(`Exported ${filteredLogs.length} audit log entries to CSV`);
      } else if (exportFormat === 'json') {
        // Generate JSON
        const jsonData = filteredLogs.map(log => ({
          timestamp: format(log.timestamp, 'yyyy-MM-dd HH:mm:ss'),
          user: {
            id: log.userId,
            name: log.userName,
            email: log.userEmail
          },
          action: ACTION_TYPES[log.action]?.label || log.action,
          resource: {
            type: log.resource,
            id: log.resourceId,
            name: log.resourceName
          },
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          success: log.success,
          errorMessage: log.errorMessage,
          details: log.details
        }));

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `audit_log_${format(new Date(), 'yyyy-MM-dd')}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success(`Exported ${filteredLogs.length} audit log entries to JSON`);
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export audit logs');
    }
  };

  const getActionConfig = (action) => {
    return ACTION_TYPES[action] || { label: action, badgeClass: 'bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300', icon: Activity };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white dark:from-charcoal-900 dark:to-charcoal-950">
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-charcoal-900 dark:text-white flex items-center gap-2">
                Audit Log
                <InfoTooltip tipKey="auditLog.retention" />
              </h1>
              <p className="text-charcoal-500 dark:text-charcoal-400">
                Track all user actions for compliance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRetentionSettings(true)}
              className="btn btn-secondary flex items-center gap-2"
              title="Configure how long audit logs are retained"
            >
              <Settings className="w-4 h-4" />
              Retention
            </button>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(prev => !prev)}
                aria-haspopup="menu"
                aria-expanded={showExportMenu}
                className="btn btn-primary flex items-center gap-2"
                title="Export logs for compliance reporting or offline analysis"
              >
                <Download className="w-4 h-4" />
                Export Logs
                <ChevronDown className="w-4 h-4" />
              </button>
              {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 rounded-lg shadow-lg z-20" role="menu">
                <button
                  onClick={() => { handleExport('csv'); setShowExportMenu(false); }}
                  className="w-full px-4 py-2 text-sm text-left text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-t-lg"
                  role="menuitem"
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => { handleExport('json'); setShowExportMenu(false); }}
                  className="w-full px-4 py-2 text-sm text-left text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-b-lg"
                  role="menuitem"
                >
                  Export as JSON
                </button>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by user, resource, or IP..."
                className="input pl-11"
              />
            </div>

            {/* Action Filter */}
            <div className="flex items-center gap-1">
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="select"
                title="Filter to specific action types for security reviews or troubleshooting"
              >
                <option value="all">All Actions</option>
                {Object.entries(ACTION_TYPES).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            {/* Resource Filter */}
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className="select"
            >
              <option value="all">All Resources</option>
              {RESOURCE_TYPES.map(resource => (
                <option key={resource} value={resource}>{resource}</option>
              ))}
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="select"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Total Entries</p>
            <p className="text-2xl font-bold text-charcoal-900 dark:text-white">{filteredLogs.length}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Unique Users</p>
            <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
              {new Set(filteredLogs.map(l => l.userId)).size}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Success Rate</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {filteredLogs.length > 0
                ? Math.round((filteredLogs.filter(l => l.success).length / filteredLogs.length) * 100)
                : 0}%
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Errors</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {filteredLogs.filter(l => !l.success).length}
            </p>
          </div>
        </div>

        {/* Log Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 border-4 border-charcoal-200 dark:border-charcoal-700 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-charcoal-500 dark:text-charcoal-400">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center">
              <Activity className="w-12 h-12 text-charcoal-300 dark:text-charcoal-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-2">No Audit Logs Yet</h3>
              <p className="text-charcoal-500 dark:text-charcoal-400 max-w-md mx-auto">
                Audit logging tracks user actions across the platform. Logs will appear here as users interact with the system.
              </p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="w-12 h-12 text-charcoal-300 dark:text-charcoal-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-2">No Matching Logs</h3>
              <p className="text-charcoal-500 dark:text-charcoal-400 max-w-md mx-auto mb-4">
                No logs match your current filters. Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedAction('all'); setSelectedResource('all'); }}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Resource</th>
                      <th>IP Address</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((log) => {
                      const actionConfig = getActionConfig(log.action);
                      const ActionIcon = actionConfig.icon;

                      return (
                        <tr key={log.id} className="group">
                          <td className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-charcoal-400" />
                              <div>
                                <p className="text-sm">{format(log.timestamp, 'MMM d, h:mm a')}</p>
                                <p className="text-xs text-charcoal-400">{format(log.timestamp, 'yyyy')}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <p className="font-medium">{log.userName}</p>
                              <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{log.userEmail}</p>
                            </div>
                          </td>
                          <td>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${actionConfig.badgeClass}`}>
                              <ActionIcon className="w-3.5 h-3.5" />
                              {actionConfig.label}
                            </span>
                          </td>
                          <td>
                            <div>
                              <p className="font-medium">{log.resource}</p>
                              <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{log.resourceName}</p>
                            </div>
                          </td>
                          <td className="font-mono text-sm">{log.ipAddress}</td>
                          <td>
                            {log.success ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <Activity className="w-4 h-4" />
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between">
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                  Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn btn-secondary btn-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn btn-secondary btn-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 dark:bg-charcoal-950/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Log Details"
            onKeyDown={(e) => { if (e.key === 'Escape') setSelectedLog(null); }}
          >
            <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
              <div className="px-6 py-4 border-b border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between">
                <h3 className="font-bold text-charcoal-900 dark:text-white">Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">Timestamp</p>
                    <p className="font-medium text-charcoal-900 dark:text-white">
                      {format(selectedLog.timestamp, 'MMM d, yyyy h:mm:ss a')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">Status</p>
                    <p className={`font-medium ${selectedLog.success ? 'text-emerald-600' : 'text-red-600'}`}>
                      {selectedLog.success ? 'Success' : 'Failed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">User</p>
                    <p className="font-medium text-charcoal-900 dark:text-white">{selectedLog.userName}</p>
                    <p className="text-sm text-charcoal-500">{selectedLog.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">IP Address</p>
                    <p className="font-medium font-mono text-charcoal-900 dark:text-white">{selectedLog.ipAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">Action</p>
                    <p className="font-medium text-charcoal-900 dark:text-white">{ACTION_TYPES[selectedLog.action]?.label}</p>
                  </div>
                  <div>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">Resource</p>
                    <p className="font-medium text-charcoal-900 dark:text-white">{selectedLog.resource}</p>
                    <p className="text-sm text-charcoal-500">{selectedLog.resourceName}</p>
                  </div>
                </div>

                {selectedLog.details?.changes && (
                  <div>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">Changed Fields</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedLog.details.changes.map((field, i) => (
                        <span key={i} className="px-2 py-1 bg-charcoal-100 dark:bg-charcoal-700 rounded text-sm">
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedLog.errorMessage && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      <AlertCircle className="w-4 h-4 inline-block mr-1" />
                      {selectedLog.errorMessage}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">User Agent</p>
                  <p className="text-sm text-charcoal-600 dark:text-charcoal-300 font-mono break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retention Settings Modal */}
        {showRetentionSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                      <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white">
                        Retention Policy
                      </h3>
                      <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                        Configure audit log retention
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRetentionSettings(false)}
                    className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-3">
                    Retention Period
                  </label>
                  <div className="space-y-2">
                    {RETENTION_OPTIONS.map(option => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          retentionPeriod === option.value
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-charcoal-200 dark:border-charcoal-700 hover:border-charcoal-300 dark:hover:border-charcoal-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="retention"
                          value={option.value}
                          checked={retentionPeriod === option.value}
                          onChange={(e) => setRetentionPeriod(e.target.value)}
                          className="w-4 h-4 text-purple-600"
                        />
                        <div className="flex-1">
                          <p className={`font-medium ${
                            retentionPeriod === option.value
                              ? 'text-purple-700 dark:text-purple-300'
                              : 'text-charcoal-900 dark:text-white'
                          }`}>
                            {option.label}
                          </p>
                          <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                            {option.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-medium">Compliance Notice</p>
                      <p className="mt-1">Some regulations require specific retention periods. Check your compliance requirements before reducing retention.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-charcoal-100 dark:border-charcoal-700 flex justify-end gap-3">
                <button
                  onClick={() => setShowRetentionSettings(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.success(`Retention policy updated to ${RETENTION_OPTIONS.find(o => o.value === retentionPeriod)?.label}`);
                    setShowRetentionSettings(false);
                  }}
                  className="btn btn-primary"
                >
                  Save Policy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
