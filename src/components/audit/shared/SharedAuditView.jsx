import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Lock,
  Unlock,
  AlertCircle,
  AlertTriangle,
  Info,
  Calendar,
  Globe,
  Eye,
  ArrowLeft,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { getSharedAudit } from '../../../lib/audit/auditStorageService';
import { SEVERITY, PRIORITY } from '../../../lib/audit/auditEngine';

export default function SharedAuditView() {
  const { shareId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [auditData, setAuditData] = useState(null);
  const [expandedIssues, setExpandedIssues] = useState({});

  const loadAudit = useCallback(async (pwd = null) => {
    setLoading(true);
    setError(null);
    setPasswordError(null);

    try {
      const result = await getSharedAudit(shareId, pwd);

      if (result.requiresPassword) {
        setRequiresPassword(true);
        setLoading(false);
        return;
      }

      setAuditData(result);
      setRequiresPassword(false);
    } catch (err) {
      if (err.message === 'Incorrect password') {
        setPasswordError('Incorrect password. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    loadAudit();
  }, [loadAudit]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) {
      loadAudit(password.trim());
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-600';
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
      [PRIORITY.MUST]: 'bg-red-100 text-red-700 border border-red-200',
      [PRIORITY.SHOULD]: 'bg-amber-100 text-amber-700 border border-amber-200',
      [PRIORITY.COULD]: 'bg-blue-100 text-blue-700 border border-blue-200'
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto mb-4" />
          <p className="text-charcoal-600">Loading audit...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-charcoal-900 mb-2">Unable to Access Audit</h2>
          <p className="text-charcoal-600 mb-6">{error}</p>
          <Link
            to="/"
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Password required state
  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-charcoal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-cyan-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-charcoal-900 mb-2">Password Protected</h2>
            <p className="text-charcoal-600">This audit is password protected. Enter the password to view.</p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="input w-full mb-4"
              autoFocus
            />

            {passwordError && (
              <p className="text-red-500 text-sm mb-4">{passwordError}</p>
            )}

            <button
              type="submit"
              disabled={!password.trim() || loading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
              Access Audit
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Audit view
  const { audit, shareInfo } = auditData;

  return (
    <div className="min-h-screen bg-charcoal-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-charcoal-500 mb-1">Shared Audit Report</p>
              <h1 className="text-xl font-bold text-charcoal-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-charcoal-400" />
                {audit.domain}
              </h1>
            </div>

            <div className="flex items-center gap-4 text-sm text-charcoal-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(audit.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {shareInfo.viewCount} views
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
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
                  stroke={audit.healthScore >= 70 ? '#10b981' : audit.healthScore >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - audit.healthScore / 100)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${getHealthScoreColor(audit.healthScore)}`}>
                  {audit.healthScore}
                </span>
              </div>
            </div>
            <p className="text-sm text-charcoal-600">Health Score</p>
          </div>

          {/* Errors */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">{audit.stats?.errors || 0}</p>
                <p className="text-sm text-charcoal-600">Errors</p>
              </div>
            </div>
          </div>

          {/* Warnings */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">{audit.stats?.warnings || 0}</p>
                <p className="text-sm text-charcoal-600">Warnings</p>
              </div>
            </div>
          </div>

          {/* URLs Analyzed */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900">{audit.urlCount?.toLocaleString() || 0}</p>
                <p className="text-sm text-charcoal-600">URLs Analyzed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-charcoal-900">Issues Found ({audit.issues?.length || 0})</h2>
          </div>

          {audit.issues?.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-charcoal-900 mb-2">No Issues Found</h3>
              <p className="text-charcoal-600">This site passed all audit checks.</p>
            </div>
          ) : (
            <div className="divide-y">
              {audit.issues?.map((issue) => (
                <div key={issue.id}>
                  <button
                    onClick={() => toggleIssue(issue.id)}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-charcoal-50 transition-colors text-left"
                  >
                    {getSeverityIcon(issue.severity)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-charcoal-900 truncate">{issue.title}</h3>
                        {getPriorityBadge(issue.priority)}
                      </div>
                      <p className="text-sm text-charcoal-500 truncate">{issue.category}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-charcoal-900">
                        {issue.count?.toLocaleString() || 0} URLs
                      </span>
                      {expandedIssues[issue.id] ? (
                        <ChevronUp className="w-5 h-5 text-charcoal-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-charcoal-400" />
                      )}
                    </div>
                  </button>

                  {expandedIssues[issue.id] && (
                    <div className="px-6 pb-6 bg-charcoal-50 border-t">
                      <div className="pt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-charcoal-700 mb-1">Description</h4>
                          <p className="text-charcoal-600">{issue.description}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-charcoal-700 mb-1">Recommendation</h4>
                          <p className="text-charcoal-600">{issue.recommendation}</p>
                        </div>

                        {issue.affectedUrls?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-charcoal-700 mb-2">
                              Sample Affected URLs ({Math.min(issue.affectedUrls.length, 5)} of {issue.count})
                            </h4>
                            <ul className="space-y-1">
                              {issue.affectedUrls.slice(0, 5).map((url, idx) => (
                                <li key={idx} className="text-sm">
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                                  >
                                    {url}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-charcoal-500">
          <p>Generated by Content Strategy Portal</p>
        </div>
      </div>
    </div>
  );
}
