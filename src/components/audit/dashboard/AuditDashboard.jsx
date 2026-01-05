import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Filter,
  LayoutDashboard,
  ListChecks,
  Table,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  Lock,
  X,
  Loader2
} from 'lucide-react';
import { SEVERITY, PRIORITY } from '../../../lib/audit/auditEngine';
import { exportToPDF, exportToExcel } from '../../../lib/audit/exportService';
import { saveAudit, createShareLink } from '../../../lib/audit/auditStorageService';
import IssueExplorer from '../explorer/IssueExplorer';
import PageAuditView from '../explorer/PageAuditView';
import UrlDataTable from '../explorer/UrlDataTable';

// View tabs
const TABS = {
  OVERVIEW: 'overview',
  EXPLORER: 'explorer',
  URLS: 'urls',
  PAGE: 'page'
};

export default function AuditDashboard({ auditResults, domainInfo, urlData = [], onNewAudit }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [expandedIssues, setExpandedIssues] = useState({});
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Group issues by category
  const issuesByCategory = useMemo(() => {
    const grouped = {};
    issues.forEach(issue => {
      if (!grouped[issue.category]) {
        grouped[issue.category] = [];
      }
      grouped[issue.category].push(issue);
    });
    return grouped;
  }, [issues]);

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
      if (filterCategory !== 'all' && issue.category !== filterCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          issue.title.toLowerCase().includes(query) ||
          issue.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [issues, filterSeverity, filterCategory, searchQuery]);

  // Get health score color
  const getHealthScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
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
        return <Info className="w-5 h-5 text-blue-500" />;
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
    if (savedAuditId) {
      toast.success('Audit already saved');
      return;
    }

    setSaving(true);
    try {
      const auditId = await saveAudit(auditResults, urlData, domainInfo);
      setSavedAuditId(auditId);
      toast.success('Audit saved successfully');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onNewAudit}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                aria-label="Start new audit"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">New Audit</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{domainInfo?.domain || 'Audit Results'}</h1>
                <p className="text-sm text-gray-500">
                  {urlCount.toLocaleString()} URLs analyzed • {new Date(timestamp).toLocaleDateString()}
                </p>
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
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg py-1 z-20 w-48">
                    <button
                      onClick={handleExportPDF}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                    >
                      <FileText className="w-4 h-4 text-red-500" />
                      Export as PDF
                    </button>
                    <button
                      onClick={handleExportExcel}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-green-500" />
                      Export as Excel
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
              <button
                onClick={handleSaveAudit}
                disabled={saving || savedAuditId}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-70"
                aria-label={saving ? 'Saving audit' : savedAuditId ? 'Audit saved' : 'Save audit'}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : savedAuditId ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {saving ? 'Saving...' : savedAuditId ? 'Saved' : 'Save Audit'}
                </span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4">
            <button
              onClick={() => setActiveTab(TABS.OVERVIEW)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === TABS.OVERVIEW
                  ? 'bg-cyan-100 text-cyan-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab(TABS.EXPLORER)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === TABS.EXPLORER
                  ? 'bg-cyan-100 text-cyan-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              Issue Explorer
            </button>
            <button
              onClick={() => setActiveTab(TABS.URLS)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === TABS.URLS
                  ? 'bg-cyan-100 text-cyan-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
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
          <div className="bg-white rounded-xl border p-6 flex flex-col items-center justify-center">
            <div className="relative w-24 h-24 mb-3">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="none"
                  stroke={healthScore >= 70 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - healthScore / 100)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getHealthScoreColor(healthScore)}`}>
                  {healthScore}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">Health Score</p>
            <p className={`text-sm font-medium ${getHealthScoreColor(healthScore)}`}>
              {getHealthScoreLabel(healthScore)}
            </p>
          </div>

          {/* Errors */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.errors}</p>
                <p className="text-sm text-gray-600">Errors</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Critical issues requiring immediate attention</p>
          </div>

          {/* Warnings */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.warnings}</p>
                <p className="text-sm text-gray-600">Warnings</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Issues that should be addressed</p>
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.info}</p>
                <p className="text-sm text-gray-600">Notices</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Opportunities for improvement</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="input w-full sm:w-40"
            >
              <option value="all">All Severity</option>
              <option value={SEVERITY.ERROR}>Errors</option>
              <option value={SEVERITY.WARNING}>Warnings</option>
              <option value={SEVERITY.INFO}>Info</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input w-full sm:w-48"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {filteredIssues.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {issues.length === 0 ? 'No Issues Found' : 'No Matching Issues'}
              </h3>
              <p className="text-gray-600">
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
                className="bg-white rounded-xl border overflow-hidden"
              >
                {/* Issue Header */}
                <button
                  onClick={() => toggleIssue(issue.id)}
                  className="w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                >
                  {getSeverityIcon(issue.severity)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 truncate">{issue.title}</h3>
                      {getPriorityBadge(issue.priority)}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{issue.category}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-900">
                      {issue.count.toLocaleString()} {issue.count === 1 ? 'URL' : 'URLs'}
                    </span>
                    {expandedIssues[issue.id] ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Issue Details */}
                {expandedIssues[issue.id] && (
                  <div className="px-6 pb-6 border-t bg-gray-50">
                    <div className="pt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                        <p className="text-gray-600">{issue.description}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendation</h4>
                        <p className="text-gray-600">{issue.recommendation}</p>
                      </div>

                      {issue.affectedUrls && issue.affectedUrls.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Affected URLs ({Math.min(issue.affectedUrls.length, 10)} of {issue.count})
                          </h4>
                          <ul className="space-y-1 max-h-60 overflow-y-auto">
                            {issue.affectedUrls.slice(0, 10).map((url, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2 text-sm"
                              >
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-600 hover:text-cyan-700 truncate flex items-center gap-1"
                                >
                                  {url}
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                </a>
                              </li>
                            ))}
                          </ul>
                          {issue.count > 10 && (
                            <p className="text-sm text-gray-500 mt-2">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Share Audit</h3>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareUrl(null);
                  setSharePassword('');
                  setUsePassword(false);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {!shareUrl ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Create a shareable link for this audit. Anyone with the link can view the results.
                  </p>

                  <label className="flex items-center gap-3 mb-4 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={usePassword}
                      onChange={(e) => setUsePassword(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Lock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Protect with password</span>
                  </label>

                  {usePassword && (
                    <input
                      type="text"
                      value={sharePassword}
                      onChange={(e) => setSharePassword(e.target.value)}
                      placeholder="Enter password"
                      className="input w-full mb-4"
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
                  <p className="text-gray-600 mb-4">
                    Your share link is ready! Anyone with this link can view the audit.
                  </p>

                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="input flex-1 bg-gray-50 text-sm"
                    />
                    <button
                      onClick={handleCopyShareLink}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      {copiedShareLink ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {usePassword && (
                    <p className="text-sm text-gray-500 flex items-center gap-2 mb-4">
                      <Lock className="w-4 h-4" />
                      Password protected: {'•'.repeat(sharePassword.length)}
                    </p>
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
