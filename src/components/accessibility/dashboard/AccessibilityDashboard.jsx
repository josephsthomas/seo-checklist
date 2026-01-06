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
  Loader2,
  Globe,
  Clock,
  Shield,
  Eye,
  Ear,
  Hand,
  Wrench,
  Sparkles,
  BookOpen,
  Accessibility
} from 'lucide-react';
import { WCAG_PRINCIPLES, WCAG_CRITERIA, getCriteriaByLevel } from '../../../data/wcagCriteria';
import { IMPACT_LEVELS } from '../../../data/axeRules';
import { COMPLIANCE_STATUS } from '../../../lib/accessibility/accessibilityEngine';

// View tabs
const TABS = {
  OVERVIEW: 'overview',
  ISSUES: 'issues',
  PAGES: 'pages',
  WCAG: 'wcag'
};

// Principle icons
const PRINCIPLE_ICONS = {
  perceivable: Eye,
  operable: Hand,
  understandable: BookOpen,
  robust: Wrench
};

// Principle colors
const PRINCIPLE_COLORS = {
  perceivable: { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  operable: { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  understandable: { bg: 'from-amber-500 to-amber-600', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  robust: { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
};

// Impact colors
const IMPACT_COLORS = {
  critical: { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  serious: { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  moderate: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  minor: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
};

export default function AccessibilityDashboard({ auditResults, domainInfo, onNewAudit }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [expandedIssues, setExpandedIssues] = useState({});
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterImpact, setFilterImpact] = useState('all');
  const [filterPrinciple, setFilterPrinciple] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const { summary, scores, violationsByRule, topIssues, worstPages, criteriaStatus, timestamp } = auditResults;

  // Get filtered issues
  const filteredIssues = useMemo(() => {
    return Object.values(violationsByRule).filter(issue => {
      if (filterLevel !== 'all' && issue.wcagLevel !== filterLevel) return false;
      if (filterImpact !== 'all' && issue.impact !== filterImpact) return false;
      if (filterPrinciple !== 'all') {
        const criterion = issue.wcagCriteria?.[0] ? WCAG_CRITERIA[issue.wcagCriteria[0]] : null;
        if (!criterion || criterion.principle !== filterPrinciple) return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          issue.name.toLowerCase().includes(query) ||
          (issue.description && issue.description.toLowerCase().includes(query))
        );
      }
      return true;
    }).filter(issue => issue.urlCount > 0);
  }, [violationsByRule, filterLevel, filterImpact, filterPrinciple, searchQuery]);

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
  };

  const getScoreGradient = (score) => {
    if (score >= 90) return 'from-emerald-500 to-emerald-600';
    if (score >= 70) return 'from-emerald-400 to-emerald-500';
    if (score >= 50) return 'from-amber-400 to-amber-500';
    return 'from-red-500 to-red-600';
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'critical': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'serious': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'moderate': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const toggleIssue = (issueId) => {
    setExpandedIssues(prev => ({ ...prev, [issueId]: !prev[issueId] }));
  };

  // Handle export
  const handleExportPDF = () => {
    setExporting(true);
    setShowExportMenu(false);
    setTimeout(() => {
      toast.success('PDF export coming soon!');
      setExporting(false);
    }, 500);
  };

  const handleExportExcel = () => {
    setExporting(true);
    setShowExportMenu(false);
    setTimeout(() => {
      toast.success('Excel export coming soon!');
      setExporting(false);
    }, 500);
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
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">New Audit</span>
              </button>
              <div className="h-6 w-px bg-charcoal-200" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Accessibility className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-charcoal-900">{domainInfo?.domain || 'Accessibility Audit'}</h1>
                  <div className="flex items-center gap-2 text-xs text-charcoal-500">
                    <span>{summary.totalUrls.toLocaleString()} URLs</span>
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
                    <button onClick={handleExportPDF} className="dropdown-item w-full">
                      <FileText className="w-4 h-4 text-red-500" />
                      <span>Compliance Report (PDF)</span>
                    </button>
                    <button onClick={handleExportExcel} className="dropdown-item w-full">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                      <span>Detailed Export (Excel)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-4 -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab(TABS.OVERVIEW)}
              className={`tab ${activeTab === TABS.OVERVIEW ? 'tab-active' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab(TABS.ISSUES)}
              className={`tab ${activeTab === TABS.ISSUES ? 'tab-active' : ''}`}
            >
              <ListChecks className="w-4 h-4" />
              Violations
            </button>
            <button
              onClick={() => setActiveTab(TABS.PAGES)}
              className={`tab ${activeTab === TABS.PAGES ? 'tab-active' : ''}`}
            >
              <Table className="w-4 h-4" />
              Pages
            </button>
            <button
              onClick={() => setActiveTab(TABS.WCAG)}
              className={`tab ${activeTab === TABS.WCAG ? 'tab-active' : ''}`}
            >
              <Shield className="w-4 h-4" />
              WCAG Reference
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === TABS.OVERVIEW && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Compliance Score & Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Overall Score */}
            <div className="card p-6 flex flex-col items-center justify-center group hover:shadow-lg transition-all duration-300">
              <div className="relative w-28 h-28 mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle
                    cx="56" cy="56" r="48" fill="none"
                    stroke={`url(#complianceGradient)`}
                    strokeWidth="10" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 48}`}
                    strokeDashoffset={`${2 * Math.PI * 48 * (1 - scores.overall / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="complianceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={scores.overall >= 70 ? '#10b981' : scores.overall >= 50 ? '#f59e0b' : '#ef4444'} />
                      <stop offset="100%" stopColor={scores.overall >= 70 ? '#059669' : scores.overall >= 50 ? '#d97706' : '#dc2626'} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(scores.overall)}`}>
                    {scores.overall}%
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium text-charcoal-600">WCAG Compliance</p>
              <p className={`text-sm font-bold ${getScoreColor(scores.overall)}`}>
                {getScoreLabel(scores.overall)}
              </p>
            </div>

            {/* Level A */}
            <div className="card p-6 group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-xl font-bold text-white">A</span>
                </div>
                <div>
                  <p className={`text-3xl font-bold ${getScoreColor(scores.byLevel.A.score)}`}>
                    {scores.byLevel.A.score}%
                  </p>
                  <p className="text-sm text-charcoal-600 font-medium">Level A</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-charcoal-500">
                {scores.byLevel.A.pass} pass / {scores.byLevel.A.fail} fail of {scores.byLevel.A.total} criteria
              </div>
            </div>

            {/* Level AA */}
            <div className="card p-6 group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-xl font-bold text-white">AA</span>
                </div>
                <div>
                  <p className={`text-3xl font-bold ${getScoreColor(scores.byLevel.AA.score)}`}>
                    {scores.byLevel.AA.score}%
                  </p>
                  <p className="text-sm text-charcoal-600 font-medium">Level AA</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-charcoal-500">
                {scores.byLevel.AA.pass} pass / {scores.byLevel.AA.fail} fail of {scores.byLevel.AA.total} criteria
              </div>
            </div>

            {/* Level AAA */}
            <div className="card p-6 group hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                  <span className="text-lg font-bold text-white">AAA</span>
                </div>
                <div>
                  <p className={`text-3xl font-bold ${getScoreColor(scores.byLevel.AAA.score)}`}>
                    {scores.byLevel.AAA.score}%
                  </p>
                  <p className="text-sm text-charcoal-600 font-medium">Level AAA</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-charcoal-500">
                {scores.byLevel.AAA.pass} pass / {scores.byLevel.AAA.fail} fail of {scores.byLevel.AAA.total} criteria
              </div>
            </div>
          </div>

          {/* Principles & Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* POUR Principles */}
            <div className="card p-6">
              <h3 className="font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                POUR Principles
              </h3>
              <div className="space-y-4">
                {Object.entries(WCAG_PRINCIPLES).map(([key, name]) => {
                  const Icon = PRINCIPLE_ICONS[key];
                  const colors = PRINCIPLE_COLORS[key];
                  const principleScore = scores.byPrinciple[key];

                  return (
                    <div key={key} className={`p-4 rounded-xl ${colors.light} border ${colors.border}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className={`font-semibold ${colors.text}`}>{name}</p>
                            <p className="text-xs text-charcoal-500">
                              {principleScore.violations} violations
                            </p>
                          </div>
                        </div>
                        <span className={`text-2xl font-bold ${colors.text}`}>
                          {principleScore.score}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${colors.bg}`}
                          style={{ width: `${principleScore.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Impact Breakdown */}
            <div className="card p-6">
              <h3 className="font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Violations by Impact
              </h3>
              <div className="space-y-4">
                {[
                  { key: 'critical', label: 'Critical', desc: 'Users cannot access content' },
                  { key: 'serious', label: 'Serious', desc: 'Significant barriers' },
                  { key: 'moderate', label: 'Moderate', desc: 'Some difficulty' },
                  { key: 'minor', label: 'Minor', desc: 'Minor inconvenience' }
                ].map(({ key, label, desc }) => {
                  const count = scores.byImpact[key] || 0;
                  const colors = IMPACT_COLORS[key];

                  return (
                    <div key={key} className={`p-4 rounded-xl ${colors.light} border ${colors.border}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center`}>
                            {getImpactIcon(key)}
                          </div>
                          <div>
                            <p className={`font-semibold ${colors.text}`}>{label}</p>
                            <p className="text-xs text-charcoal-500">{desc}</p>
                          </div>
                        </div>
                        <span className={`text-2xl font-bold ${colors.text}`}>
                          {count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Issues & Worst Pages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Issues */}
            <div className="card p-6">
              <h3 className="font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-red-500" />
                Top Issues to Fix
              </h3>
              <div className="space-y-3">
                {topIssues.slice(0, 5).map((issue, idx) => (
                  <div
                    key={issue.ruleId}
                    className="flex items-start gap-3 p-3 rounded-xl bg-charcoal-50 hover:bg-charcoal-100 transition-colors"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      IMPACT_COLORS[issue.impact]?.bg || 'bg-charcoal-400'
                    }`}>
                      <span className="text-xs font-bold text-white">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-900 text-sm truncate">{issue.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`badge ${IMPACT_COLORS[issue.impact]?.light} ${IMPACT_COLORS[issue.impact]?.text} text-xs`}>
                          {issue.impact}
                        </span>
                        {issue.wcagLevel && issue.wcagLevel !== 'best-practice' && (
                          <span className="badge badge-neutral text-xs">
                            Level {issue.wcagLevel}
                          </span>
                        )}
                        <span className="text-xs text-charcoal-500">
                          {issue.urlCount} URLs
                        </span>
                      </div>
                    </div>
                    {issue.aiFixable && (
                      <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" title="AI fix available" />
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab(TABS.ISSUES)}
                className="w-full mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View all {Object.keys(violationsByRule).length} violation types →
              </button>
            </div>

            {/* Worst Pages */}
            <div className="card p-6">
              <h3 className="font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                <Table className="w-5 h-5 text-amber-500" />
                Pages with Most Violations
              </h3>
              <div className="space-y-3">
                {worstPages.slice(0, 5).map((page, idx) => (
                  <div
                    key={page.address}
                    className="flex items-start gap-3 p-3 rounded-xl bg-charcoal-50 hover:bg-charcoal-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-900 text-sm truncate" title={page.address}>
                        {new URL(page.address).pathname || '/'}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-charcoal-500">
                        <span className="font-semibold text-red-600">{page.totalViolations} total</span>
                        <span>•</span>
                        <span>{page.levelA} A</span>
                        <span>•</span>
                        <span>{page.levelAA} AA</span>
                      </div>
                    </div>
                    <a
                      href={page.address}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 hover:bg-charcoal-200 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-charcoal-400" />
                    </a>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab(TABS.PAGES)}
                className="w-full mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View all {summary.totalUrls} pages →
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === TABS.ISSUES && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="card p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search violations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-12 w-full"
                />
              </div>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="select w-full sm:w-36"
              >
                <option value="all">All Levels</option>
                <option value="A">Level A</option>
                <option value="AA">Level AA</option>
                <option value="AAA">Level AAA</option>
              </select>
              <select
                value={filterImpact}
                onChange={(e) => setFilterImpact(e.target.value)}
                className="select w-full sm:w-36"
              >
                <option value="all">All Impact</option>
                <option value="critical">Critical</option>
                <option value="serious">Serious</option>
                <option value="moderate">Moderate</option>
                <option value="minor">Minor</option>
              </select>
              <select
                value={filterPrinciple}
                onChange={(e) => setFilterPrinciple(e.target.value)}
                className="select w-full sm:w-44"
              >
                <option value="all">All Principles</option>
                <option value="perceivable">Perceivable</option>
                <option value="operable">Operable</option>
                <option value="understandable">Understandable</option>
                <option value="robust">Robust</option>
              </select>
            </div>
          </div>

          {/* Violations List */}
          <div className="space-y-3">
            {filteredIssues.length === 0 ? (
              <div className="card p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 mb-2">No Violations Found</h3>
                <p className="text-charcoal-600">
                  {Object.keys(violationsByRule).length === 0
                    ? 'Great job! No accessibility violations detected.'
                    : 'Try adjusting your filters to see more results.'}
                </p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <div key={issue.id} className="card overflow-hidden group">
                  <button
                    onClick={() => toggleIssue(issue.id)}
                    className="w-full px-6 py-4 flex items-center gap-4 hover:bg-charcoal-50 transition-colors text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      IMPACT_COLORS[issue.impact]?.light || 'bg-charcoal-100'
                    }`}>
                      {getImpactIcon(issue.impact)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-charcoal-900">{issue.name}</h3>
                        {issue.aiFixable && (
                          <span className="badge bg-purple-100 text-purple-700 text-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> AI Fix
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`badge ${IMPACT_COLORS[issue.impact]?.light} ${IMPACT_COLORS[issue.impact]?.text} text-xs`}>
                          {issue.impact}
                        </span>
                        {issue.wcagLevel && issue.wcagLevel !== 'best-practice' && (
                          <span className="badge badge-neutral text-xs">Level {issue.wcagLevel}</span>
                        )}
                        {issue.wcagCriteria?.map(c => (
                          <span key={c} className="text-charcoal-500 text-xs">{c}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="badge badge-neutral">
                        {issue.urlCount.toLocaleString()} {issue.urlCount === 1 ? 'URL' : 'URLs'}
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

                  {expandedIssues[issue.id] && (
                    <div className="px-6 pb-6 border-t border-charcoal-100 bg-charcoal-50/50">
                      <div className="pt-5 space-y-5">
                        {issue.help && (
                          <div>
                            <h4 className="text-sm font-semibold text-charcoal-700 mb-2">Description</h4>
                            <p className="text-charcoal-600">{issue.help}</p>
                          </div>
                        )}
                        {issue.fixSuggestion && (
                          <div>
                            <h4 className="text-sm font-semibold text-charcoal-700 mb-2">How to Fix</h4>
                            <p className="text-charcoal-600">{issue.fixSuggestion}</p>
                          </div>
                        )}
                        {issue.urls && issue.urls.length > 0 && (
                          <div>
                            <h4 className="text-sm font-semibold text-charcoal-700 mb-3">
                              Affected URLs ({Math.min(issue.urls.length, 10)} of {issue.urlCount})
                            </h4>
                            <div className="bg-white rounded-xl border border-charcoal-200 overflow-hidden">
                              <ul className="divide-y divide-charcoal-100 max-h-60 overflow-y-auto">
                                {issue.urls.slice(0, 10).map((urlData, idx) => (
                                  <li key={idx} className="px-4 py-2.5 hover:bg-charcoal-50 transition-colors">
                                    <a
                                      href={urlData.address}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-purple-600 hover:text-purple-700 truncate flex items-center gap-2 group"
                                    >
                                      <span className="truncate">{urlData.address}</span>
                                      <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
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

      {activeTab === TABS.PAGES && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-charcoal-50 border-b border-charcoal-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">URL</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Level A</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Level AA</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Level AAA</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Best Practice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {worstPages.map((page, idx) => (
                    <tr key={idx} className="hover:bg-charcoal-50 transition-colors">
                      <td className="px-4 py-3">
                        <a
                          href={page.address}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2 group max-w-md"
                        >
                          <span className="truncate">{page.address}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-semibold ${page.totalViolations > 10 ? 'text-red-600' : page.totalViolations > 5 ? 'text-amber-600' : 'text-charcoal-600'}`}>
                          {page.totalViolations}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-charcoal-600">{page.levelA}</td>
                      <td className="px-4 py-3 text-center text-sm text-charcoal-600">{page.levelAA}</td>
                      <td className="px-4 py-3 text-center text-sm text-charcoal-600">{page.levelAAA}</td>
                      <td className="px-4 py-3 text-center text-sm text-charcoal-600">{page.bestPractice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {worstPages.length === 0 && (
              <div className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-charcoal-600">No pages with violations found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === TABS.WCAG && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card p-6 mb-6 bg-gradient-to-br from-purple-50 to-white border-purple-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-charcoal-900 mb-2">WCAG 2.2 Criteria Reference</h3>
                <p className="text-sm text-charcoal-600">
                  Review each success criterion and its compliance status. Criteria marked with a checkmark
                  have no detected violations. Some criteria require manual testing.
                </p>
              </div>
            </div>
          </div>

          {/* Criteria by Level */}
          {['A', 'AA', 'AAA'].map(level => {
            const levelCriteria = getCriteriaByLevel(level);

            return (
              <div key={level} className="mb-8">
                <h3 className="font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold ${
                    level === 'A' ? 'bg-emerald-500' : level === 'AA' ? 'bg-amber-500' : 'bg-purple-500'
                  }`}>
                    {level}
                  </span>
                  Level {level} Criteria ({levelCriteria.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {levelCriteria.map(criterion => {
                    const status = criteriaStatus[criterion.id];
                    const isPass = status === COMPLIANCE_STATUS.SUPPORTS;
                    const isFail = status === COMPLIANCE_STATUS.DOES_NOT_SUPPORT || status === COMPLIANCE_STATUS.PARTIALLY_SUPPORTS;
                    const isManual = !criterion.axeRules || criterion.axeRules.length === 0;

                    return (
                      <div
                        key={criterion.id}
                        className={`p-4 rounded-xl border ${
                          isFail ? 'bg-red-50 border-red-200' :
                          isPass ? 'bg-emerald-50 border-emerald-200' :
                          'bg-charcoal-50 border-charcoal-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                            isFail ? 'bg-red-500 text-white' :
                            isPass ? 'bg-emerald-500 text-white' :
                            'bg-charcoal-300 text-white'
                          }`}>
                            {isFail ? (
                              <X className="w-4 h-4" />
                            ) : isPass ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              <span className="text-xs">?</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-charcoal-900 text-sm">
                              {criterion.id} - {criterion.name}
                            </p>
                            <p className="text-xs text-charcoal-500 mt-1 capitalize">
                              {WCAG_PRINCIPLES[criterion.principle]}
                            </p>
                            {isManual && (
                              <span className="inline-block mt-2 text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                                Manual check required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
