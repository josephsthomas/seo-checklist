import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  X,
  Gift,
  Zap,
  Bug,
  ChevronRight,
  ExternalLink,
  Calendar,
  Tag
} from 'lucide-react';
import { changelog, getUnreadReleasesCount } from '../../data/changelog';
import { format, parseISO } from 'date-fns';

const CHANGE_TYPE_CONFIG = {
  feature: {
    icon: Gift,
    label: 'New',
    color: 'text-emerald-500',
    bg: 'bg-emerald-100'
  },
  improvement: {
    icon: Zap,
    label: 'Improved',
    color: 'text-primary-500',
    bg: 'bg-primary-100'
  },
  fix: {
    icon: Bug,
    label: 'Fixed',
    color: 'text-amber-500',
    bg: 'bg-amber-100'
  }
};

export default function WhatsNew({ isOpen, onClose }) {
  const [expandedVersion, setExpandedVersion] = useState(changelog[0]?.version);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Mark as viewed when opened
  useEffect(() => {
    if (isOpen && changelog[0]) {
      localStorage.setItem('lastViewedChangelog', changelog[0].version);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl sm:max-h-[80vh] z-50 flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-charcoal-100 bg-gradient-to-r from-primary-50 to-cyan-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="whats-new-title" className="text-xl font-bold text-charcoal-900">What's New</h2>
              <p className="text-sm text-charcoal-500">Latest updates and improvements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-charcoal-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {changelog.map((release, index) => {
              const isExpanded = expandedVersion === release.version;
              const isLatest = index === 0;

              return (
                <div
                  key={release.version}
                  className={`border rounded-xl overflow-hidden transition-all ${
                    isExpanded ? 'border-primary-200 shadow-md' : 'border-charcoal-200 hover:border-charcoal-300'
                  }`}
                >
                  {/* Version Header */}
                  <button
                    onClick={() => setExpandedVersion(isExpanded ? null : release.version)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-charcoal-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isLatest ? 'bg-gradient-to-br from-primary-500 to-cyan-500' : 'bg-charcoal-100'
                      }`}>
                        <Tag className={`w-5 h-5 ${isLatest ? 'text-white' : 'text-charcoal-500'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-charcoal-900">v{release.version}</span>
                          {isLatest && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-charcoal-600">{release.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm text-charcoal-500">
                        <Calendar className="w-4 h-4" />
                        {format(parseISO(release.date), 'MMM d, yyyy')}
                      </div>
                      <ChevronRight className={`w-5 h-5 text-charcoal-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-charcoal-100 bg-charcoal-50/50">
                      {/* Highlights */}
                      {release.highlights && (
                        <div className="mt-4 p-3 bg-white rounded-lg border border-charcoal-100">
                          <h4 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wide mb-2">Highlights</h4>
                          <ul className="space-y-1">
                            {release.highlights.map((highlight, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-charcoal-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                {highlight}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Changes */}
                      <div className="mt-4 space-y-3">
                        {release.changes.map((change, i) => {
                          const config = CHANGE_TYPE_CONFIG[change.type] || CHANGE_TYPE_CONFIG.improvement;
                          return (
                            <div key={i} className="flex gap-3 p-3 bg-white rounded-lg border border-charcoal-100">
                              <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                                <config.icon className={`w-4 h-4 ${config.color}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-charcoal-900">{change.title}</span>
                                  <span className={`px-1.5 py-0.5 text-xs font-medium ${config.bg} ${config.color} rounded`}>
                                    {config.label}
                                  </span>
                                </div>
                                <p className="text-sm text-charcoal-600 mt-1">{change.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-charcoal-100 bg-charcoal-50 flex items-center justify-between">
          <p className="text-sm text-charcoal-500">
            {changelog.length} releases documented
          </p>
          <button
            onClick={onClose}
            className="btn btn-primary"
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
}

/**
 * Badge component to show unread release count
 */
export function WhatsNewBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const lastViewed = localStorage.getItem('lastViewedChangelog');
    const count = getUnreadReleasesCount(lastViewed);
    setUnreadCount(count);
  }, []);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
}
