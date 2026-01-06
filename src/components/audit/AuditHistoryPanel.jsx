import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  GitCompare,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAudits } from '../../hooks/useAudits';
import { format, formatDistanceToNow } from 'date-fns';

/**
 * Score Badge Component
 */
function ScoreBadge({ score, size = 'md' }) {
  const color = score >= 80 ? 'emerald' : score >= 60 ? 'amber' : 'red';
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl'
  };
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-xl border-2 flex items-center justify-center font-bold`}>
      {score}
    </div>
  );
}

/**
 * Score Change Indicator
 */
function ScoreChange({ current, previous }) {
  const diff = current - previous;
  if (diff === 0) return <Minus className="w-4 h-4 text-charcoal-400" />;

  return (
    <div className={`flex items-center gap-1 ${diff > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
      {diff > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      <span className="text-sm font-medium">{diff > 0 ? '+' : ''}{diff}</span>
    </div>
  );
}

/**
 * Audit History Item
 */
function AuditHistoryItem({ audit, onSelect, isSelected, compareMode }) {
  const score = audit.summary?.healthScore || 0;
  const timestamp = audit.createdAt?.toDate ? audit.createdAt.toDate() : new Date(audit.createdAt);

  return (
    <button
      onClick={() => onSelect(audit)}
      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-primary-500 bg-primary-50'
          : 'border-charcoal-100 hover:border-charcoal-200 bg-white'
      }`}
    >
      <ScoreBadge score={score} size="sm" />
      <div className="flex-1 text-left">
        <p className="font-medium text-charcoal-900 truncate">{audit.domain || 'Unknown Domain'}</p>
        <div className="flex items-center gap-2 text-sm text-charcoal-500">
          <Calendar className="w-3.5 h-3.5" />
          {format(timestamp, 'MMM d, yyyy')}
          <span className="text-charcoal-300">•</span>
          {formatDistanceToNow(timestamp, { addSuffix: true })}
        </div>
      </div>
      {compareMode && isSelected && (
        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
      )}
      {!compareMode && (
        <ChevronRight className="w-5 h-5 text-charcoal-400" />
      )}
    </button>
  );
}

/**
 * Comparison View Modal
 */
function ComparisonModal({ audits, onClose }) {
  const [audit1, audit2] = audits;

  if (!audit1 || !audit2) return null;

  const score1 = audit1.summary?.healthScore || 0;
  const score2 = audit2.summary?.healthScore || 0;

  const categories = [
    { key: 'errors', label: 'Errors', icon: AlertCircle, color: 'red' },
    { key: 'warnings', label: 'Warnings', icon: AlertTriangle, color: 'amber' },
    { key: 'info', label: 'Info', icon: Info, color: 'blue' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-charcoal-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <GitCompare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-charcoal-900">Audit Comparison</h2>
              <p className="text-sm text-charcoal-500">Compare two audit results side by side</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Content */}
        <div className="p-6">
          {/* Score Comparison */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {[audit1, audit2].map((audit, idx) => (
              <div key={audit.id} className="bg-charcoal-50 rounded-xl p-6 text-center">
                <p className="text-sm text-charcoal-500 mb-2">
                  {format(audit.createdAt?.toDate ? audit.createdAt.toDate() : new Date(audit.createdAt), 'MMM d, yyyy')}
                </p>
                <ScoreBadge score={audit.summary?.healthScore || 0} size="lg" />
                <p className="font-medium text-charcoal-900 mt-3">{audit.domain}</p>
                {idx === 1 && (
                  <div className="mt-2">
                    <ScoreChange current={score2} previous={score1} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Category Comparison */}
          <h3 className="text-sm font-semibold text-charcoal-700 mb-4">Issue Breakdown</h3>
          <div className="space-y-3">
            {categories.map(cat => {
              const val1 = audit1.summary?.[cat.key] || 0;
              const val2 = audit2.summary?.[cat.key] || 0;
              const diff = val2 - val1;
              const Icon = cat.icon;

              return (
                <div key={cat.key} className="flex items-center gap-4 p-4 bg-charcoal-50 rounded-xl">
                  <Icon className={`w-5 h-5 text-${cat.color}-500`} />
                  <span className="flex-1 font-medium text-charcoal-700">{cat.label}</span>
                  <div className="flex items-center gap-8">
                    <span className="text-lg font-bold text-charcoal-900 w-12 text-center">{val1}</span>
                    <div className={`flex items-center gap-1 w-16 justify-center ${
                      diff === 0 ? 'text-charcoal-400' :
                      diff < 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {diff === 0 ? (
                        <Minus className="w-4 h-4" />
                      ) : diff < 0 ? (
                        <>
                          <TrendingDown className="w-4 h-4" />
                          <span className="text-sm font-medium">{diff}</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm font-medium">+{diff}</span>
                        </>
                      )}
                    </div>
                    <span className="text-lg font-bold text-charcoal-900 w-12 text-center">{val2}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className={`mt-6 p-4 rounded-xl ${
            score2 > score1 ? 'bg-emerald-50 border border-emerald-200' :
            score2 < score1 ? 'bg-red-50 border border-red-200' :
            'bg-charcoal-50 border border-charcoal-200'
          }`}>
            <p className={`text-sm font-medium ${
              score2 > score1 ? 'text-emerald-800' :
              score2 < score1 ? 'text-red-800' :
              'text-charcoal-700'
            }`}>
              {score2 > score1 ? (
                <>Score improved by {score2 - score1} points since the earlier audit.</>
              ) : score2 < score1 ? (
                <>Score decreased by {score1 - score2} points since the earlier audit.</>
              ) : (
                <>Score remained the same between audits.</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Audit History Panel Component
 */
export default function AuditHistoryPanel({ domain, className = '' }) {
  const { audits, loading } = useAudits();
  const [compareMode, setCompareMode] = useState(false);
  const [selectedAudits, setSelectedAudits] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  // Filter audits by domain if provided
  const filteredAudits = useMemo(() => {
    if (!domain) return audits;
    return audits.filter(a => a.domain === domain);
  }, [audits, domain]);

  const handleSelectAudit = (audit) => {
    if (compareMode) {
      setSelectedAudits(prev => {
        const isSelected = prev.some(a => a.id === audit.id);
        if (isSelected) {
          return prev.filter(a => a.id !== audit.id);
        }
        if (prev.length >= 2) {
          return [prev[1], audit];
        }
        return [...prev, audit];
      });
    }
  };

  const handleCompare = () => {
    if (selectedAudits.length === 2) {
      // Sort by date (older first)
      const sorted = [...selectedAudits].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateA - dateB;
      });
      setSelectedAudits(sorted);
      setShowComparison(true);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-charcoal-100 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-charcoal-100 rounded w-1/3" />
          {[1,2,3].map(i => <div key={i} className="h-16 bg-charcoal-50 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-charcoal-100 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-charcoal-500" />
          <h3 className="font-semibold text-charcoal-900">Audit History</h3>
          <span className="text-sm text-charcoal-400">({filteredAudits.length})</span>
        </div>
        <button
          onClick={() => {
            setCompareMode(!compareMode);
            setSelectedAudits([]);
          }}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            compareMode
              ? 'bg-cyan-100 text-cyan-700'
              : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
          }`}
        >
          <GitCompare className="w-4 h-4 inline mr-1.5" />
          {compareMode ? 'Cancel' : 'Compare'}
        </button>
      </div>

      {/* Compare Mode Banner */}
      {compareMode && (
        <div className="mb-4 p-3 bg-cyan-50 rounded-lg flex items-center justify-between">
          <p className="text-sm text-cyan-800">
            Select 2 audits to compare ({selectedAudits.length}/2 selected)
          </p>
          {selectedAudits.length === 2 && (
            <button
              onClick={handleCompare}
              className="px-4 py-1.5 bg-cyan-600 text-white text-sm font-medium rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Compare Now
            </button>
          )}
        </div>
      )}

      {/* Audits List */}
      {filteredAudits.length === 0 ? (
        <div className="text-center py-8">
          <History className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
          <p className="text-charcoal-500 text-sm">No audit history yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAudits.slice(0, 10).map(audit => (
            <AuditHistoryItem
              key={audit.id}
              audit={audit}
              onSelect={handleSelectAudit}
              isSelected={selectedAudits.some(a => a.id === audit.id)}
              compareMode={compareMode}
            />
          ))}
        </div>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <ComparisonModal
          audits={selectedAudits}
          onClose={() => {
            setShowComparison(false);
            setCompareMode(false);
            setSelectedAudits([]);
          }}
        />
      )}
    </div>
  );
}
