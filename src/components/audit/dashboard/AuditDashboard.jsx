import { useState, useMemo, useRef, useEffect, useDeferredValue } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Download,
  Share2,
  Save,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  LayoutDashboard,
  ListChecks,
  Table,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  Lock,
  X,
  Loader2,
  Globe,
  Clock
} from 'lucide-react';
import { SEVERITY, PRIORITY } from '../../../lib/audit/auditEngine';
import { exportToPDF, exportToExcel } from '../../../lib/audit/exportService';
import { saveAudit, createShareLink } from '../../../lib/audit/auditStorageService';
import IssueExplorer from '../explorer/IssueExplorer';
import PageAuditView from '../explorer/PageAuditView';
import UrlDataTable from '../explorer/UrlDataTable';
import { LinkToProjectButton } from '../../shared/LinkToProjectModal';
import { LINKED_ITEM_TYPES } from '../../../hooks/useProjectLinkedItems';

// View tabs
const TABS = {
  OVERVIEW: 'overview',
  EXPLORER: 'explorer',
  URLS: 'urls',
  PAGE: 'page'
};

export default function AuditDashboard({ auditResults, domainInfo, urlData = [], onNewAudit }) {
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [expandedIssues, setExpandedIssues] = useState({});
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAuditId, setSavedAuditId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState(null);
  const [sharePassword, setSharePassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [sharingInProgress, setSharingInProgress] = useState(false);
  const [copiedShareLink, setCopiedShareLink] = useState(false);

  // Ref for export menu dropdown
  const exportMenuRef = useRef(null);

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  const { issues, stats, healthScore, urlCount, timestamp } = auditResults;

  // Filter issues (using deferred search for performance)
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
      if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
      if (deferredSearchQuery) {
        const query = deferredSearchQuery.toLowerCase();
        return (
          issue.title.toLowerCase().includes(query) ||
          issue.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [issues, filterSeverity, filterCategory, deferredSearchQuery]);

  // Get health score color
  const getHealthScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getHealthScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case SEVERITY.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case SEVERITY.WARNING:
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-primary-500" />;
    }
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      [PRIORITY.MUST]: 'bg-red-100 text-red-700 border-red-200',
      [PRIORITY.SHOULD]: 'bg-amber-100 text-amber-700 border-amber-200',
      [PRIORITY.COULD]: 'bg-primary-100 text-primary-700 border-primary-200'
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${styles[priority] || styles[PRIORITY.COULD]}`}>
        {(priority || 'could').toUpperCase()}
      </span>
    );
  };

  const toggleIssue = (issueId) => {
    setExpandedIssues(prev => ({
      ...prev,
      [issueId]: !prev[issueId]
    }));
  };

  // Get unique categories for filter
  const categories = useMemo(() => {
    return [...new Set(issues.map(i => i.category))].sort();
  }, [issues]);

  // Find URL data for selected URL
  const selectedUrlData = useMemo(() => {
    if (!selectedUrl || !urlData.length) return null;
    return urlData.find(row => row.address === selectedUrl);
  }, [selectedUrl, urlData]);

  // Handle URL selection from Issue Explorer
  const handleSelectUrl = (url) => {
    setSelectedUrl(url);
    setActiveTab(TABS.PAGE);
  };

  // Handle back from Page Audit View
  const handleBackFromPage = () => {
    setSelectedUrl(null);
    setActiveTab(TABS.EXPLORER);
  };

  // Export handlers
  const handleExportPDF = () => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const domain = domainInfo?.domain || 'audit';
      const dateStr = new Date().toISOString().split('T')[0];
      exportToPDF(
        {
          issues,
          summary: {
            healthScore,
            errors: stats.errors,
            warnings: stats.warnings,
            info: stats.info,
            urlsAnalyzed: urlCount
          }
        },
        {
          filename: `seo-audit-${domain}-${dateStr}.pdf`
        }
      );
      toast.success('PDF exported successfully');
    } catch (err) {
      console.error('PDF export failed:', err);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = () => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const domain = domainInfo?.domain || 'audit';
      const dateStr = new Date().toISOString().split('T')[0];
      exportToExcel(
        {
          issues,
          summary: {
            healthScore,
            errors: stats.errors,
            warnings: stats.warnings,
            info: stats.info,
            urlsAnalyzed: urlCount
          }
        },
        urlData,
        {
          filename: `seo-audit-${domain}-${dateStr}.xlsx`
        }
      );
      toast.success('Excel exported successfully');
    } catch (err) {
      console.error('Excel export failed:', err);
      toast.error('Failed to export Excel. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Save audit to Firestore
  const handleSaveAudit = async () => {
    setSaving(true);
    try {
      const result = await saveAudit(auditResults, urlData, domainInfo);
      setSavedAuditId(result.auditId || result);
      toast.success(savedAuditId ? 'Audit updated successfully' : 'Audit saved successfully');
    } catch (err) {
      console.error('Save failed:', err);
      toast.error(err.message || 'Failed to save audit');
    } finally {
      setSaving(false);
    }
  };

  // Create share link
  const handleCreateShareLink = async () => {
    if (!savedAuditId) {
      toast.error('Please save the audit first');
      return;
    }

    setSharingInProgress(true);
    try {
      const result = await createShareLink(savedAuditId, {
        password: usePassword ? sharePassword : null
      });
      setShareUrl(result.shareUrl);
      toast.success('Share link created');
    } catch (err) {
      console.error('Share failed:', err);
      toast.error(err.message || 'Failed to create share link');
    } finally {
      setSharingInProgress(false);
    }
  };

  // Copy share link to clipboard
  const handleCopyShareLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareLink(true);
      setTimeout(() => setCopiedShareLink(false), 2000);
      toast.success('Link copied to clipboard');
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-charcoal-100/50 sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onNewAudit}
                className="flex items-center gap-2 text-charcoal-600 hover:text-charcoal-900 font-medium transition-colors"
                aria-label="Start new audit"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">New Audit</span>
              </button>
              <div className="h-6 w-px bg-charcoal-200" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-charcoal-900">{domainInfo?.domain || 'Audit Results'}</h1>
                  <div className="flex items-center gap-2 text-xs text-charcoal-500">
                    <span>{urlCount.toLocaleString()} URLs</span>
                    <span>•</span>
                    <Clock className="w-3 h-3" />
                    <span>{new Date(timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={exporting}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Download className={`w-4 h-4 ${exporting ? 'animate-pulse' : ''}`} />
                  <span className="hidden sm:inline">{exporting ? 'Exporting...' : 'Export'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showExportMenu && (
                  <div className="dropdown-menu right-0 mt-2 w-48">
                    <button
                      onClick={handleExportPDF}
                      className="dropdown-item w-full"
                    >
                      <FileText className="w-4 h-4 text-red-500" />
                      <span>Export as PDF</span>
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="dropdown-item w-full"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                      <span>Export as Excel</span>
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowShareModal(true)}
                disabled={!savedAuditId}
                className="btn btn-secondary flex items-center gap-2 disabled:opacity-50"
                title={!savedAuditId ? 'Save the audit first to share' : 'Share audit'}
                aria-label={!savedAuditId ? 'Save the audit first to share' : 'Share audit'}
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
              {savedAuditId && (
                <LinkToProjectButton
                  item={{
                    id: savedAuditId,
                    type: LINKED_ITEM_TYPES.AUDIT,
                    name: `Audit: ${domainInfo?.domain || 'Unknown'}`,
                    url: domainInfo?.domain,
                    data: { healthScore, urlCount, issueCount: stats.total }
                  }}
                  size="md"
                  className="hidden sm:flex"
                />
              )}
              <button
                onClick={handleSaveAudit}
                disabled={saving}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-70"
                aria-label={saving ? 'Saving audit' : savedAuditId ? 'Update saved audit' : 'Save audit'}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : savedAuditId ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {saving ? 'Saving...' : savedAuditId ? 'Saved' : 'Save'}
                </span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 -mb-px">
            <button
              onClick={() => setActiveTab(TABS.OVERVIEW)}
              className={`tab ${activeTab === TABS.OVERVIEW ? 'tab-active' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab(TABS.EXPLORER)}
              className={`tab ${activeTab === TABS.EXPLORER ? 'tab-active' : ''}`}
            >
              <ListChecks className="w-4 h-4" />
              Issue Explorer
            </button>
            <button
              onClick={() => setActiveTab(TABS.URLS)}
              className={`tab ${activeTab === TABS.URLS ? 'tab-active' : ''}`}
            >
              <Table className="w-4 h-4" />
              URL Data
            </button>
          </div>
        </div>
      </div>

      {/* Conditionally render content based on active tab */}
      {activeTab === TABS.PAGE && selectedUrl ? (
        <PageAuditView
          url={selectedUrl}
          urlData={selectedUrlData}
          issues={issues}
          onBack={handleBackFromPage}
        />
      ) : activeTab === TABS.URLS ? (
        <UrlDataTable
          urlData={urlData}
          onSelectUrl={handleSelectUrl}
        />
      ) : activeTab === TABS.EXPLORER ? (
        <IssueExplorer
          issues={issues}
          onSelectUrl={handleSelectUrl}
        />
      ) : (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Score & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Health Score */}
          <div className="card p-6 flex flex-col items-center justify-center group hover:shadow-lg transition-all duration-300">
            <div className="relative w-28 h-28 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="10"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  fill="none"
                  stroke="url(#healthGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - healthScore / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={healthScore >= 70 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#ef4444'} />
                    <stop offset="100%" stopColor={healthScore >= 70 ? '#059669' : healthScore >= 50 ? '#d97706' : '#dc2626'} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getHealthScoreColor(healthScore)}`}>
                  {healthScore}
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-charcoal-600">Health Score</p>
            <p className={`text-sm font-bold ${getHealthScoreColor(healthScore)}`}>
              {getHealthScoreLabel(healthScore)}
            </p>
          </div>

          {/* Errors */}
          <div className="card p-6 group hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
                <AlertCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-charcoal-900">{stats.errors}</p>
                <p className="text-sm text-charcoal-600 font-medium">Errors</p>
              </div>
            </div>
            <p className="text-xs text-charcoal-500 mt-3">Critical issues requiring immediate attention</p>
          </div>

          {/* Warnings */}
          <div className="card p-6 group hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-charcoal-900">{stats.warnings}</p>
                <p className="text-sm text-charcoal-600 font-medium">Warnings</p>
              </div>
            </div>
            <p className="text-xs text-charcoal-500 mt-3">Issues that should be addressed</p>
          </div>

          {/* Info */}
          <div className="card p-6 group hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                <Info className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-charcoal-900">{stats.info}</p>
                <p className="text-sm text-charcoal-600 font-medium">Notices</p>
              </div>
            </div>
            <p className="text-xs text-charcoal-500 mt-3">Opportunities for improvement</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12 w-full"
              />
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="select w-full sm:w-40"
            >
              <option value="all">All Severity</option>
              <option value={SEVERITY.ERROR}>Errors</option>
              <option value={SEVERITY.WARNING}>Warnings</option>
              <option value={SEVERITY.INFO}>Info</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="select w-full sm:w-48"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-3">
          {filteredIssues.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-charcoal-900 mb-2">
                {issues.length === 0 ? 'No Issues Found' : 'No Matching Issues'}
              </h3>
              <p className="text-charcoal-600">
                {issues.length === 0
                  ? 'Great job! Your site passed all audit checks.'
                  : 'Try adjusting your filters to see more results.'
                }
              </p>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="card overflow-hidden group"
              >
                {/* Issue Header */}
                <button
                  onClick={() => toggleIssue(issue.id)}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-charcoal-50 transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    issue.severity === SEVERITY.ERROR ? 'bg-red-100' :
                    issue.severity === SEVERITY.WARNING ? 'bg-amber-100' :
                    'bg-primary-100'
                  }`}>
                    {getSeverityIcon(issue.severity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-charcoal-900">{issue.title}</h3>
                      {getPriorityBadge(issue.priority)}
                    </div>
                    <p className="text-sm text-charcoal-500">{issue.category}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="badge badge-neutral">
                      {issue.count.toLocaleString()} {issue.count === 1 ? 'URL' : 'URLs'}
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      expandedIssues[issue.id] ? 'bg-charcoal-100' : 'group-hover:bg-charcoal-100'
                    }`}>
                      {expandedIssues[issue.id] ? (
                        <ChevronUp className="w-5 h-5 text-charcoal-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-charcoal-500" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Issue Details */}
                {expandedIssues[issue.id] && (
                  <div className="px-6 pb-6 border-t border-charcoal-100 bg-charcoal-50/50">
                    <div className="pt-5 space-y-5">
                      <div>
                        <h4 className="text-sm font-semibold text-charcoal-700 mb-2">Description</h4>
                        <p className="text-charcoal-600">{issue.description}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-charcoal-700 mb-2">Recommendation</h4>
                        <p className="text-charcoal-600">{issue.recommendation}</p>
                      </div>

                      {issue.affectedUrls && issue.affectedUrls.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-charcoal-700 mb-3">
                            Affected URLs ({Math.min(issue.affectedUrls.length, 10)} of {issue.count})
                          </h4>
                          <div className="bg-white rounded-xl border border-charcoal-200 overflow-hidden">
                            <ul className="divide-y divide-charcoal-100 max-h-60 overflow-y-auto">
                              {issue.affectedUrls.slice(0, 10).map((url, idx) => (
                                <li
                                  key={idx}
                                  className="px-4 py-2.5 hover:bg-charcoal-50 transition-colors"
                                >
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-cyan-600 hover:text-cyan-700 truncate flex items-center gap-2 group"
                                  >
                                    <span className="truncate">{url}</span>
                                    <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {issue.count > 10 && (
                            <p className="text-sm text-charcoal-500 mt-3">
                              + {issue.count - 10} more URLs
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-bold text-charcoal-900">Share Audit</h3>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareUrl(null);
                  setSharePassword('');
                  setUsePassword(false);
                }}
                className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-charcoal-500" />
              </button>
            </div>

            <div className="modal-body">
              {!shareUrl ? (
                <>
                  <p className="text-charcoal-600 mb-6">
                    Create a shareable link for this audit. Anyone with the link can view the results.
                  </p>

                  <label className="flex items-center gap-3 mb-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={usePassword}
                      onChange={(e) => setUsePassword(e.target.checked)}
                      className="rounded border-charcoal-300 text-primary-500 focus:ring-primary-500"
                    />
                    <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center group-hover:bg-charcoal-200 transition-colors">
                      <Lock className="w-4 h-4 text-charcoal-500" />
                    </div>
                    <span className="text-sm font-medium text-charcoal-700">Protect with password</span>
                  </label>

                  {usePassword && (
                    <input
                      type="password"
                      value={sharePassword}
                      onChange={(e) => setSharePassword(e.target.value)}
                      placeholder="Enter password"
                      className="input w-full mb-4"
                      autoComplete="new-password"
                    />
                  )}

                  <button
                    onClick={handleCreateShareLink}
                    disabled={sharingInProgress || (usePassword && !sharePassword.trim())}
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {sharingInProgress ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    {sharingInProgress ? 'Creating...' : 'Create Share Link'}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-charcoal-600 mb-6">
                    Your share link is ready! Anyone with this link can view the audit.
                  </p>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="input flex-1 bg-charcoal-50 text-sm"
                    />
                    <button
                      onClick={handleCopyShareLink}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      {copiedShareLink ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {usePassword && (
                    <div className="flex items-center gap-2 text-sm text-charcoal-500 mb-6">
                      <Lock className="w-4 h-4" />
                      <span>Password protected: {'•'.repeat(sharePassword.length)}</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowShareModal(false);
                      setShareUrl(null);
                      setSharePassword('');
                      setUsePassword(false);
                    }}
                    className="btn btn-secondary w-full"
                  >
                    Done
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
