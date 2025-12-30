import React, { useMemo } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  AlertTriangle,
  Info,
  Globe,
  FileText,
  Link2,
  Clock,
  Shield,
  Smartphone,
  Zap
} from 'lucide-react';
import { SEVERITY, PRIORITY } from '../../../lib/audit/auditEngine';

export default function PageAuditView({ url, urlData, issues, onBack }) {
  const [copied, setCopied] = React.useState(false);

  // Find all issues that affect this URL
  const pageIssues = useMemo(() => {
    return issues.filter(issue =>
      issue.affectedUrls?.includes(url)
    );
  }, [issues, url]);

  // Group issues by severity
  const issuesBySeverity = useMemo(() => {
    const grouped = {
      errors: pageIssues.filter(i => i.severity === SEVERITY.ERROR),
      warnings: pageIssues.filter(i => i.severity === SEVERITY.WARNING),
      info: pageIssues.filter(i => i.severity === SEVERITY.INFO)
    };
    return grouped;
  }, [pageIssues]);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
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
        {priority.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (statusCode) => {
    const code = parseInt(statusCode, 10);
    if (code >= 200 && code < 300) {
      return <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">{code} OK</span>;
    }
    if (code >= 300 && code < 400) {
      return <span className="px-2 py-0.5 text-xs font-medium rounded bg-amber-100 text-amber-700">{code} Redirect</span>;
    }
    if (code >= 400) {
      return <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">{code} Error</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">Unknown</span>;
  };

  const getIndexabilityBadge = (indexability) => {
    if (indexability?.toLowerCase() === 'indexable') {
      return <span className="px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">Indexable</span>;
    }
    return <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">Non-Indexable</span>;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate mb-2">{url}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {urlData?.statusCode && getStatusBadge(urlData.statusCode)}
              {urlData?.indexability && getIndexabilityBadge(urlData.indexability)}
              {urlData?.contentType && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                  {urlData.contentType}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyUrl}
              className="btn btn-secondary flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy URL'}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open
            </a>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Page Metadata */}
          {urlData && (
            <div className="bg-white rounded-xl border p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {urlData.title1 && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Title</p>
                      <p className="text-sm text-gray-600">{urlData.title1}</p>
                      {urlData.title1Length && (
                        <p className="text-xs text-gray-400">{urlData.title1Length} characters</p>
                      )}
                    </div>
                  </div>
                )}
                {urlData.metaDescription1 && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Meta Description</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{urlData.metaDescription1}</p>
                      {urlData.metaDescription1Length && (
                        <p className="text-xs text-gray-400">{urlData.metaDescription1Length} characters</p>
                      )}
                    </div>
                  </div>
                )}
                {urlData.h1 && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">H1</p>
                      <p className="text-sm text-gray-600">{urlData.h1}</p>
                    </div>
                  </div>
                )}
                {urlData.wordCount && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Word Count</p>
                      <p className="text-sm text-gray-600">{parseInt(urlData.wordCount, 10).toLocaleString()} words</p>
                    </div>
                  </div>
                )}
                {urlData.uniqueInlinks && (
                  <div className="flex items-start gap-3">
                    <Link2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Inlinks</p>
                      <p className="text-sm text-gray-600">{urlData.uniqueInlinks} unique internal links</p>
                    </div>
                  </div>
                )}
                {urlData.uniqueOutlinks && (
                  <div className="flex items-start gap-3">
                    <Link2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Outlinks</p>
                      <p className="text-sm text-gray-600">{urlData.uniqueOutlinks} unique outbound links</p>
                    </div>
                  </div>
                )}
                {urlData.crawlDepth && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Crawl Depth</p>
                      <p className="text-sm text-gray-600">{urlData.crawlDepth} clicks from homepage</p>
                    </div>
                  </div>
                )}
                {urlData.responseTime && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Response Time</p>
                      <p className="text-sm text-gray-600">{urlData.responseTime}ms</p>
                    </div>
                  </div>
                )}
                {urlData.size && (
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Page Size</p>
                      <p className="text-sm text-gray-600">{(parseInt(urlData.size, 10) / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Issues Summary */}
          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="font-medium text-red-700">{issuesBySeverity.errors.length} Errors</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-lg border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="font-medium text-amber-700">{issuesBySeverity.warnings.length} Warnings</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <Info className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-blue-700">{issuesBySeverity.info.length} Info</span>
            </div>
          </div>

          {/* Issues List */}
          {pageIssues.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
              <p className="text-gray-600">This page passed all audit checks.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Issues ({pageIssues.length})</h3>
              {pageIssues.map(issue => (
                <div key={issue.id} className="bg-white rounded-xl border overflow-hidden">
                  <div className="px-6 py-4 flex items-start gap-4">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900">{issue.title}</h4>
                        {getPriorityBadge(issue.priority)}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{issue.category}</p>
                      <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Recommendation</p>
                        <p className="text-sm text-gray-600">{issue.recommendation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
