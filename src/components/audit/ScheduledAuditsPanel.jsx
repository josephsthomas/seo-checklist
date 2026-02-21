import { useState, useEffect } from 'react';
import {
  Clock,
  Globe,
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  History,
  Eye,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Filter,
  BarChart3,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { format, formatDistanceToNow, addDays, addWeeks, addMonths } from 'date-fns';
import toast from 'react-hot-toast';
import InfoTooltip from '../common/InfoTooltip';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Scheduled Audits Panel
 * Configure recurring automated technical SEO audits
 */

// Audit configurations
const AUDIT_CONFIGS = {
  depth: [
    { value: 1, label: 'Shallow (1 level)', description: 'Homepage only' },
    { value: 2, label: 'Standard (2 levels)', description: 'Homepage + linked pages' },
    { value: 3, label: 'Deep (3 levels)', description: 'Full site crawl' },
    { value: 5, label: 'Complete (5 levels)', description: 'Exhaustive crawl' }
  ],
  categories: [
    { id: 'meta', label: 'Meta Tags', icon: '🏷️' },
    { id: 'headings', label: 'Headings', icon: '📑' },
    { id: 'images', label: 'Images', icon: '🖼️' },
    { id: 'links', label: 'Links', icon: '🔗' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'mobile', label: 'Mobile', icon: '📱' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' }
  ],
  frequency: [
    { id: 'daily', label: 'Daily', description: 'Every day' },
    { id: 'weekly', label: 'Weekly', description: 'Once a week' },
    { id: 'biweekly', label: 'Bi-weekly', description: 'Every two weeks' },
    { id: 'monthly', label: 'Monthly', description: 'Once a month' }
  ],
  alertThresholds: [
    { id: 'score_drop', label: 'Score drops below', type: 'number', defaultValue: 70 },
    { id: 'critical_issues', label: 'Critical issues exceed', type: 'number', defaultValue: 5 },
    { id: 'new_issues', label: 'New issues found', type: 'boolean', defaultValue: true }
  ]
};

// Days of week
const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun', full: 'Sunday' },
  { id: 1, label: 'Mon', full: 'Monday' },
  { id: 2, label: 'Tue', full: 'Tuesday' },
  { id: 3, label: 'Wed', full: 'Wednesday' },
  { id: 4, label: 'Thu', full: 'Thursday' },
  { id: 5, label: 'Fri', full: 'Friday' },
  { id: 6, label: 'Sat', full: 'Saturday' }
];

// Common timezones
const TIMEZONES = [
  { id: 'UTC', label: 'UTC (Coordinated Universal Time)', offset: 0 },
  { id: 'America/New_York', label: 'Eastern Time (ET)', offset: -5 },
  { id: 'America/Chicago', label: 'Central Time (CT)', offset: -6 },
  { id: 'America/Denver', label: 'Mountain Time (MT)', offset: -7 },
  { id: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: -8 },
  { id: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: -9 },
  { id: 'Pacific/Honolulu', label: 'Hawaii Time (HT)', offset: -10 },
  { id: 'Europe/London', label: 'London (GMT/BST)', offset: 0 },
  { id: 'Europe/Paris', label: 'Central European (CET)', offset: 1 },
  { id: 'Europe/Berlin', label: 'Berlin (CET)', offset: 1 },
  { id: 'Asia/Tokyo', label: 'Japan (JST)', offset: 9 },
  { id: 'Asia/Shanghai', label: 'China (CST)', offset: 8 },
  { id: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 8 },
  { id: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
  { id: 'Australia/Sydney', label: 'Sydney (AEST)', offset: 10 },
  { id: 'Australia/Perth', label: 'Perth (AWST)', offset: 8 }
];

export default function ScheduledAuditsPanel() {
  const { currentUser } = useAuth();
  const [audits, setAudits] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAudit, setEditingAudit] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [viewingHistory, setViewingHistory] = useState(null);
  const [filter, setFilter] = useState('all');
  const [firestoreLoading, setFirestoreLoading] = useState(true);

  // Load scheduled audits from Firestore
  useEffect(() => {
    if (!currentUser?.uid) {
      setFirestoreLoading(false);
      return;
    }

    const q = query(
      collection(db, 'scheduled_audits'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loaded = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          lastRun: data.lastRun ? {
            ...data.lastRun,
            date: data.lastRun.date?.toDate?.() || new Date()
          } : null,
          nextRun: data.nextRun?.toDate?.() || null,
          history: (data.history || []).map(h => ({
            ...h,
            date: h.date?.toDate?.() || new Date()
          }))
        };
      });
      setAudits(loaded);
      setFirestoreLoading(false);
    }, (error) => {
      console.error('Error loading scheduled audits:', error);
      setFirestoreLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Filter audits
  const filteredAudits = audits.filter(audit => {
    if (filter === 'active') return audit.isActive;
    if (filter === 'paused') return !audit.isActive;
    return true;
  });

  // Toggle audit active status
  const toggleAudit = async (id) => {
    const audit = audits.find(a => a.id === id);
    const wasActive = audit?.isActive;
    try {
      await updateDoc(doc(db, 'scheduled_audits', id), {
        isActive: !wasActive,
        nextRun: !wasActive ? calculateNextRun(audit) : null
      });
      toast.success(wasActive ? 'Audit schedule paused' : 'Audit schedule activated');
    } catch (error) {
      console.error('Error toggling audit:', error);
      toast.error('Failed to update audit schedule');
    }
  };

  // Calculate next run time
  const calculateNextRun = (audit) => {
    const now = new Date();
    const [hours, minutes] = audit.time.split(':').map(Number);
    let next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    if (next <= now) {
      next = addDays(next, 1);
    }

    switch (audit.frequency) {
      case 'weekly':
        while (next.getDay() !== audit.dayOfWeek) {
          next = addDays(next, 1);
        }
        break;
      case 'biweekly':
        while (next.getDay() !== audit.dayOfWeek) {
          next = addDays(next, 1);
        }
        next = addWeeks(next, 1);
        break;
      case 'monthly':
        next.setDate(audit.dayOfMonth || 1);
        if (next <= now) {
          next = addMonths(next, 1);
        }
        break;
      default:
        break;
    }

    return next;
  };

  // State for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Delete audit with confirmation and undo
  const deleteAudit = (id) => {
    const audit = audits.find(a => a.id === id);
    setDeleteConfirm({
      id,
      name: audit?.name || 'this audit schedule'
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    const deletedAudit = audits.find(a => a.id === deleteConfirm.id);
    setDeleteConfirm(null);

    try {
      await deleteDoc(doc(db, 'scheduled_audits', deleteConfirm.id));
      // Show toast with undo option
      toast((t) => (
        <div className="flex items-center gap-3">
          <span>Audit schedule deleted</span>
          <button
            onClick={async () => {
              try {
                const { id: _id, ...auditData } = deletedAudit;
                await addDoc(collection(db, 'scheduled_audits'), {
                  ...auditData,
                  userId: currentUser.uid,
                  createdAt: serverTimestamp()
                });
                toast.dismiss(t.id);
                toast.success('Audit schedule restored');
              } catch (err) {
                console.error('Error restoring audit:', err);
                toast.error('Failed to restore audit schedule');
              }
            }}
            className="px-2 py-1 bg-cyan-500 text-white rounded text-sm font-medium hover:bg-cyan-600"
          >
            Undo
          </button>
        </div>
      ), { duration: 5000 });
    } catch (error) {
      console.error('Error deleting audit:', error);
      toast.error('Failed to delete audit schedule');
    }
  };

  // Toggle all audits (maintenance mode) — uses writeBatch with 500-op chunking
  const toggleAllAudits = async (activate) => {
    const activeCount = audits.filter(a => a.isActive).length;
    try {
      const BATCH_SIZE = 500;
      for (let i = 0; i < audits.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        audits.slice(i, i + BATCH_SIZE).forEach(a => {
          batch.update(doc(db, 'scheduled_audits', a.id), { isActive: activate });
        });
        await batch.commit();
      }
      toast.success(
        activate
          ? `All ${audits.length} audit schedules activated`
          : `All ${activeCount} audit schedules paused (maintenance mode)`
      );
    } catch (error) {
      console.error('Error toggling all audits:', error);
      toast.error('Failed to update audit schedules');
    }
  };

  // Run audit now — persists results to Firestore
  const runNow = async (id) => {
    const audit = audits.find(a => a.id === id);
    toast.success(`Starting audit for ${audit?.url}...`);

    // Simulate running (in production this would trigger a real crawl)
    const newScore = Math.floor(Math.random() * 20) + 70;
    const newIssues = {
      critical: Math.floor(Math.random() * 5),
      warnings: Math.floor(Math.random() * 15) + 5,
      info: Math.floor(Math.random() * 10) + 3
    };

    const runResult = {
      date: new Date(),
      score: newScore,
      issues: newIssues,
      duration: Math.floor(Math.random() * 60) + 20,
      pagesScanned: audit.lastRun?.pagesScanned || 100
    };

    const historyEntry = {
      date: new Date(),
      score: newScore,
      issues: Object.values(newIssues).reduce((a, b) => a + b, 0)
    };

    try {
      await updateDoc(doc(db, 'scheduled_audits', id), {
        lastRun: runResult,
        history: [historyEntry, ...(audit.history || []).slice(0, 9)],
        runCount: (audit.runCount || 0) + 1
      });
      toast.success('Audit completed!');
    } catch (error) {
      console.error('Error saving audit run:', error);
      toast.error('Audit completed but failed to save results');
    }
  };

  // Score color class maps (static for Tailwind JIT)
  const SCORE_CLASSES = {
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-500' },
    red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', bar: 'bg-red-500' }
  };
  const TREND_CLASSES = {
    emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-600' },
    red: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-600' },
    charcoal: { bg: 'bg-charcoal-100 dark:bg-charcoal-900/50', text: 'text-charcoal-600' }
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'emerald';
    if (score >= 60) return 'amber';
    return 'red';
  };

  // Get trend indicator
  const getTrend = (history) => {
    if (history.length < 2) return null;
    const diff = history[0].score - history[1].score;
    if (diff > 0) return { direction: 'up', value: diff, color: 'emerald' };
    if (diff < 0) return { direction: 'down', value: Math.abs(diff), color: 'red' };
    return { direction: 'same', value: 0, color: 'charcoal' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-500" />
            Scheduled Audits
          </h2>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
            Configure recurring automated technical SEO audits
          </p>
        </div>
        <div className="flex items-center gap-2">
          {audits.some(a => a.isActive) ? (
            <button
              onClick={() => toggleAllAudits(false)}
              className="btn btn-secondary flex items-center gap-2"
              title="Pause all audits for maintenance"
            >
              <PauseCircle className="w-4 h-4" />
              Pause All
            </button>
          ) : (
            <button
              onClick={() => toggleAllAudits(true)}
              className="btn btn-secondary flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
              title="Resume all audits"
            >
              <PlayCircle className="w-4 h-4" />
              Resume All
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Audit Schedule
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                {audits.length}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Play className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                {audits.filter(a => a.isActive).length}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Active</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                {audits.reduce((sum, a) => sum + a.runCount, 0)}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Total Runs</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                {audits.reduce((sum, a) => sum + (a.lastRun?.pagesScanned || 0), 0)}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Pages Audited</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: 'All Schedules' },
          { id: 'active', label: 'Active' },
          { id: 'paused', label: 'Paused' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === tab.id
                ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                : 'text-charcoal-600 hover:bg-charcoal-100 dark:text-charcoal-400 dark:hover:bg-charcoal-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Audits list */}
      <div className="space-y-3">
        {filteredAudits.length === 0 ? (
          <div className="card p-8 text-center">
            <Clock className="w-12 h-12 text-charcoal-300 dark:text-charcoal-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-2">
              No scheduled audits
            </h3>
            <p className="text-charcoal-500 dark:text-charcoal-400 mb-4">
              Set up automated audits to continuously monitor your site&apos;s SEO health
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Audit Schedule
            </button>
          </div>
        ) : (
          filteredAudits.map(audit => {
            const isExpanded = expandedId === audit.id;
            const trend = getTrend(audit.history);
            const scoreColor = getScoreColor(audit.lastRun?.score || 0);

            return (
              <div key={audit.id} className="card overflow-hidden">
                {/* Main row */}
                <div className="p-4 flex items-center gap-4">
                  {/* Score badge */}
                  <div className={`relative w-16 h-16 rounded-xl ${SCORE_CLASSES[scoreColor].bg} flex items-center justify-center`}>
                    <span className={`text-2xl font-bold ${SCORE_CLASSES[scoreColor].text}`}>
                      {audit.lastRun?.score || '–'}
                    </span>
                    {trend && (
                      <div className={`absolute -top-1 -right-1 p-1 rounded-full ${TREND_CLASSES[trend.color].bg}`}>
                        {trend.direction === 'up' && <TrendingUp className={`w-3 h-3 ${TREND_CLASSES[trend.color].text}`} />}
                        {trend.direction === 'down' && <TrendingDown className={`w-3 h-3 ${TREND_CLASSES[trend.color].text}`} />}
                        {trend.direction === 'same' && <Minus className={`w-3 h-3 ${TREND_CLASSES[trend.color].text}`} />}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-charcoal-900 dark:text-white truncate">
                        {audit.name}
                      </h3>
                      <span className={`badge ${audit.isActive ? 'badge-emerald' : 'badge-charcoal'}`}>
                        {audit.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-charcoal-500 dark:text-charcoal-400">
                      <Globe className="w-4 h-4" />
                      <span className="truncate">{audit.url}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-charcoal-400 dark:text-charcoal-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {AUDIT_CONFIGS.frequency.find(f => f.id === audit.frequency)?.label} at {audit.time} {audit.timezone && `(${TIMEZONES.find(tz => tz.id === audit.timezone)?.label.split('(')[1]?.replace(')', '') || audit.timezone})`}
                      </span>
                      {audit.lastRun && (
                        <span>Last: {formatDistanceToNow(audit.lastRun.date, { addSuffix: true })}</span>
                      )}
                      {audit.nextRun && audit.isActive && (
                        <span>Next: {format(audit.nextRun, 'MMM d, h:mm a')}</span>
                      )}
                    </div>
                  </div>

                  {/* Issues summary */}
                  {audit.lastRun?.issues && (
                    <div className="hidden lg:flex items-center gap-3">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-red-500">
                          <XCircle className="w-4 h-4" />
                          <span className="font-semibold">{audit.lastRun.issues.critical}</span>
                        </div>
                        <span className="text-xs text-charcoal-400">Critical</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-amber-500">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-semibold">{audit.lastRun.issues.warnings}</span>
                        </div>
                        <span className="text-xs text-charcoal-400">Warnings</span>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-primary-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-semibold">{audit.lastRun.issues.info}</span>
                        </div>
                        <span className="text-xs text-charcoal-400">Info</span>
                      </div>
                    </div>
                  )}


                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runNow(audit.id)}
                      className="p-2 text-charcoal-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                      title="Run now"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewingHistory(audit)}
                      className="p-2 text-charcoal-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      title="View history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleAudit(audit.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        audit.isActive
                          ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                          : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                      }`}
                      title={audit.isActive ? 'Pause' : 'Resume'}
                    >
                      {audit.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditingAudit(audit)}
                      className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteAudit(audit.id)}
                      className="p-2 text-charcoal-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : audit.id)}
                      className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-charcoal-100 dark:border-charcoal-700">
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Configuration */}
                      <div>
                        <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                          Configuration
                        </h4>
                        <div className="space-y-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                          <div className="flex items-center gap-2">
                            <Search className="w-3 h-3" />
                            Depth: {AUDIT_CONFIGS.depth.find(d => d.value === audit.depth)?.label}
                          </div>
                          <div className="flex items-center gap-2">
                            <Filter className="w-3 h-3" />
                            {audit.categories.length} categories
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {audit.categories.map(cat => {
                              const category = AUDIT_CONFIGS.categories.find(c => c.id === cat);
                              return (
                                <span key={cat} className="px-2 py-0.5 bg-charcoal-100 dark:bg-charcoal-700 rounded text-xs">
                                  {category?.icon} {category?.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Schedule */}
                      <div>
                        <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                          Schedule Details
                        </h4>
                        <div className="space-y-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            {AUDIT_CONFIGS.frequency.find(f => f.id === audit.frequency)?.label}
                          </div>
                          {audit.dayOfWeek !== undefined && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {DAYS_OF_WEEK.find(d => d.id === audit.dayOfWeek)?.full} at {audit.time}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            {TIMEZONES.find(tz => tz.id === audit.timezone)?.label || audit.timezone || 'UTC'}
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-3 h-3" />
                            {audit.runCount} audits completed
                          </div>
                        </div>
                      </div>

                      {/* Alerts */}
                      <div>
                        <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                          Alert Settings
                        </h4>
                        <div className="space-y-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                          <div className="flex items-center gap-2">
                            {audit.alerts.enabled ? (
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-charcoal-400" />
                            )}
                            Alerts {audit.alerts.enabled ? 'enabled' : 'disabled'}
                          </div>
                          {audit.alerts.enabled && (
                            <>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" />
                                Score threshold: {audit.alerts.scoreThreshold}
                              </div>
                              <div className="flex items-center gap-2">
                                <XCircle className="w-3 h-3" />
                                Critical threshold: {audit.alerts.criticalThreshold}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mini history chart */}
                    {audit.history.length > 1 && (
                      <div className="mt-4 p-3 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg">
                        <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-3">
                          Score Trend
                        </h4>
                        <div className="flex items-end gap-2 h-16">
                          {audit.history.slice(0, 8).reverse().map((entry, idx) => {
                            const height = (entry.score / 100) * 100;
                            const color = getScoreColor(entry.score);
                            return (
                              <div
                                key={idx}
                                className="flex-1 flex flex-col items-center gap-1"
                              >
                                <div
                                  className={`w-full ${SCORE_CLASSES[color].bar} rounded-t`}
                                  style={{ height: `${height}%` }}
                                  title={`${format(entry.date, 'MMM d')}: ${entry.score}`}
                                />
                                <span className="text-[10px] text-charcoal-400">
                                  {format(entry.date, 'M/d')}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingAudit) && (
        <AuditScheduleFormModal
          audit={editingAudit}
          onSave={async (newAudit) => {
            try {
              if (editingAudit) {
                await updateDoc(doc(db, 'scheduled_audits', editingAudit.id), newAudit);
                toast.success('Audit schedule updated');
              } else {
                const nextRun = calculateNextRun({ ...newAudit, time: newAudit.time || '09:00' });
                await addDoc(collection(db, 'scheduled_audits'), {
                  ...newAudit,
                  userId: currentUser.uid,
                  createdAt: serverTimestamp(),
                  runCount: 0,
                  history: [],
                  nextRun
                });
                toast.success('Audit schedule created');
              }
              setShowCreateModal(false);
              setEditingAudit(null);
            } catch (error) {
              console.error('Error saving audit schedule:', error);
              toast.error('Failed to save audit schedule');
            }
          }}
          onClose={() => {
            setShowCreateModal(false);
            setEditingAudit(null);
          }}
        />
      )}

      {/* History Modal */}
      {viewingHistory && (
        <AuditHistoryModal
          audit={viewingHistory}
          onClose={() => setViewingHistory(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white">
                  Delete Audit Schedule
                </h3>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                  You&apos;ll have 5 seconds to undo
                </p>
              </div>
            </div>
            <p className="text-charcoal-600 dark:text-charcoal-300 mb-6">
              Are you sure you want to delete &quot;<strong>{deleteConfirm.name}</strong>&quot;?
              You&apos;ll have 5 seconds to undo this action.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn bg-red-500 hover:bg-red-600 text-white flex-1"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Audit Schedule Form Modal
 */
function AuditScheduleFormModal({ audit, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: audit?.name || '',
    url: audit?.url || '',
    frequency: audit?.frequency || 'weekly',
    dayOfWeek: audit?.dayOfWeek ?? 1,
    dayOfMonth: audit?.dayOfMonth ?? 1,
    time: audit?.time || '09:00',
    timezone: audit?.timezone || 'America/New_York',
    depth: audit?.depth || 2,
    categories: audit?.categories || ['meta', 'headings', 'images', 'links'],
    isActive: audit?.isActive ?? true,
    alerts: audit?.alerts || {
      enabled: true,
      email: '',
      scoreThreshold: 70,
      criticalThreshold: 5,
      notifyOnNewIssues: true
    }
  });

  const [step, setStep] = useState(1);

  // Validate current step before advancing
  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast.error('Please enter an audit name');
        return false;
      }
      if (!formData.url.trim()) {
        toast.error('Please enter a URL');
        return false;
      }
      if (formData.categories.length === 0) {
        toast.error('Please select at least one category');
        return false;
      }
    }
    return true;
  };

  const advanceStep = (targetStep) => {
    // Allow going backwards without validation
    if (targetStep <= step) {
      setStep(targetStep);
      return;
    }
    // Validate all steps between current and target
    for (let s = step; s < targetStep; s++) {
      if (!validateStep(s)) return;
    }
    setStep(targetStep);
  };

  // Check for schedule conflicts
  const checkConflicts = () => {
    const conflicts = [];

    // This would normally check against existing audits passed via props
    // For demo purposes, we check for common conflict patterns

    // Check if the time is during peak hours
    const [hours] = formData.time.split(':').map(Number);
    if (hours >= 9 && hours <= 17) {
      conflicts.push({
        type: 'warning',
        message: 'Scheduling during business hours (9 AM - 5 PM) may impact site performance for users'
      });
    }

    return conflicts;
  };

  const [conflicts, setConflicts] = useState([]);

  // Check conflicts when schedule details change
  useEffect(() => {
    const newConflicts = checkConflicts();
    setConflicts(newConflicts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.time, formData.frequency, formData.url]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter an audit name');
      return;
    }
    if (!formData.url.trim()) {
      toast.error('Please enter a URL');
      return;
    }
    if (formData.categories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    // Warn about conflicts but allow proceeding
    const criticalConflicts = conflicts.filter(c => c.type === 'error');
    if (criticalConflicts.length > 0) {
      toast.error('Please resolve schedule conflicts before saving');
      return;
    }

    onSave(formData);
  };

  const toggleCategory = (catId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(catId)
        ? prev.categories.filter(c => c !== catId)
        : [...prev.categories, catId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-charcoal-900 dark:text-white">
              {audit ? 'Edit Audit Schedule' : 'Create New Audit Schedule'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg"
              aria-label="Close audit schedule form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <button
                key={s}
                onClick={() => advanceStep(s)}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  s === step
                    ? 'bg-cyan-500'
                    : s < step
                    ? 'bg-emerald-500'
                    : 'bg-charcoal-200 dark:bg-charcoal-600'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-charcoal-500 dark:text-charcoal-400">
            <span>Target</span>
            <span>Schedule</span>
            <span>Alerts</span>
          </div>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Target */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                  Audit Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Site Weekly Audit"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2 flex items-center gap-1">
                  Target URL
                  <InfoTooltip tipKey="audit.url" />
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://example.com"
                    className="input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2 flex items-center gap-1">
                  Crawl Depth
                  <InfoTooltip tipKey="audit.depth" />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AUDIT_CONFIGS.depth.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, depth: option.value }))}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        formData.depth === option.value
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                          : 'border-charcoal-200 dark:border-charcoal-600 hover:border-charcoal-300'
                      }`}
                    >
                      <p className={`font-medium ${formData.depth === option.value ? 'text-cyan-700 dark:text-cyan-300' : 'text-charcoal-900 dark:text-white'}`}>
                        {option.label}
                      </p>
                      <p className="text-xs text-charcoal-500">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2 flex items-center gap-1">
                  Audit Categories
                  <InfoTooltip tipKey="audit.categories" />
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AUDIT_CONFIGS.categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.categories.includes(cat.id)
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                          : 'border-charcoal-200 dark:border-charcoal-600 hover:border-charcoal-300'
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <p className="text-xs mt-1 text-charcoal-700 dark:text-charcoal-300">{cat.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2 flex items-center gap-1">
                  Frequency
                  <InfoTooltip tipKey="audit.frequency" />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AUDIT_CONFIGS.frequency.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, frequency: option.id }))}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.frequency === option.id
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                          : 'border-charcoal-200 dark:border-charcoal-600 text-charcoal-700 dark:text-charcoal-300 hover:border-charcoal-300'
                      }`}
                    >
                      <p className="font-medium">{option.label}</p>
                      <p className="text-xs opacity-75">{option.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {(formData.frequency === 'weekly' || formData.frequency === 'biweekly') && (
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    Day of Week
                  </label>
                  <div className="flex gap-2">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, dayOfWeek: day.id }))}
                        className={`flex-1 p-2 rounded-lg border text-center transition-all ${
                          formData.dayOfWeek === day.id
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300'
                            : 'border-charcoal-200 dark:border-charcoal-600 text-charcoal-700 dark:text-charcoal-300 hover:border-charcoal-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {formData.frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    Day of Month
                  </label>
                  <select
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dayOfMonth: parseInt(e.target.value, 10) }))}
                    className="input"
                  >
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="input"
                  >
                    {TIMEZONES.map(tz => (
                      <option key={tz.id} value={tz.id}>{tz.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-charcoal-400">
                Recommended: Off-peak hours (2:00-6:00 AM) for minimal impact on site performance
              </p>

              {/* Schedule Conflicts Warning */}
              {conflicts.length > 0 && (
                <div className="space-y-2">
                  {conflicts.map((conflict, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg flex items-start gap-3 ${
                        conflict.type === 'error'
                          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                          : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                        conflict.type === 'error'
                          ? 'text-red-500'
                          : 'text-amber-500'
                      }`} />
                      <div>
                        <p className={`text-sm font-medium ${
                          conflict.type === 'error'
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-amber-700 dark:text-amber-300'
                        }`}>
                          {conflict.type === 'error' ? 'Schedule Conflict' : 'Schedule Advisory'}
                        </p>
                        <p className={`text-sm ${
                          conflict.type === 'error'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}>
                          {conflict.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 p-4 bg-charcoal-50 dark:bg-charcoal-700/50 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-charcoal-700 dark:text-charcoal-300">
                  Activate schedule immediately after saving
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Alerts */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-charcoal-50 dark:bg-charcoal-700/50 rounded-lg">
                <input
                  type="checkbox"
                  id="alertsEnabled"
                  checked={formData.alerts.enabled}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    alerts: { ...prev.alerts, enabled: e.target.checked }
                  }))}
                  className="w-4 h-4 text-cyan-600 rounded"
                />
                <label htmlFor="alertsEnabled" className="text-sm text-charcoal-700 dark:text-charcoal-300">
                  Enable alert notifications
                </label>
              </div>

              {formData.alerts.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                      Alert Email
                    </label>
                    <input
                      type="email"
                      value={formData.alerts.email}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        alerts: { ...prev.alerts, email: e.target.value }
                      }))}
                      placeholder="alerts@example.com"
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2 flex items-center gap-1">
                      Score Threshold
                      <InfoTooltip tipKey="audit.alerts.threshold" />
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.alerts.scoreThreshold}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          alerts: { ...prev.alerts, scoreThreshold: parseInt(e.target.value, 10) }
                        }))}
                        className="flex-1"
                      />
                      <span className="w-12 text-center font-medium text-charcoal-900 dark:text-white">
                        {formData.alerts.scoreThreshold}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-400 mt-1">
                      Alert when score drops below this value
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                      Critical Issues Threshold
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.alerts.criticalThreshold}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        alerts: { ...prev.alerts, criticalThreshold: parseInt(e.target.value, 10) }
                      }))}
                      className="input w-24"
                    />
                    <p className="text-xs text-charcoal-400 mt-1">
                      Alert when critical issues exceed this count
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="notifyOnNew"
                      checked={formData.alerts.notifyOnNewIssues}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        alerts: { ...prev.alerts, notifyOnNewIssues: e.target.checked }
                      }))}
                      className="w-4 h-4 text-cyan-600 rounded"
                    />
                    <label htmlFor="notifyOnNew" className="text-sm text-charcoal-700 dark:text-charcoal-300">
                      Notify when new issues are detected
                    </label>
                  </div>
                </>
              )}

              {/* Summary */}
              <div className="p-4 bg-gradient-to-br from-cyan-50 to-primary-50 dark:from-cyan-900/20 dark:to-primary-900/20 rounded-xl mt-6">
                <h4 className="font-medium text-charcoal-900 dark:text-white mb-3">Schedule Summary</h4>
                <div className="space-y-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span className="truncate">{formData.url || 'No URL specified'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span>Depth: {AUDIT_CONFIGS.depth.find(d => d.value === formData.depth)?.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {AUDIT_CONFIGS.frequency.find(f => f.id === formData.frequency)?.label} at {formData.time} ({TIMEZONES.find(tz => tz.id === formData.timezone)?.label.split('(')[1]?.replace(')', '') || formData.timezone})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>{formData.categories.length} categories selected</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-charcoal-100 dark:border-charcoal-700 flex justify-between">
          <button
            type="button"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="btn btn-secondary"
          >
            {step > 1 ? 'Back' : 'Cancel'}
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => advanceStep(step + 1)}
              className="btn btn-primary"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {audit ? 'Save Changes' : 'Create Schedule'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Audit History Modal
 */
function AuditHistoryModal({ audit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-charcoal-900 dark:text-white">
                Audit History
              </h2>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
                {audit.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto p-6">
          {audit.history.length === 0 ? (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-charcoal-300 dark:text-charcoal-600 mx-auto mb-4" />
              <p className="text-charcoal-500 dark:text-charcoal-400">No audit history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {audit.history.map((entry, idx) => {
                const scoreColorKey = entry.score >= 80 ? 'emerald' : entry.score >= 60 ? 'amber' : 'red';
                const scoreClasses = { emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' }, amber: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' }, red: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' } };
                const prevEntry = audit.history[idx + 1];
                const scoreDiff = prevEntry ? entry.score - prevEntry.score : 0;

                return (
                  <div key={idx} className="flex items-center gap-4 p-4 bg-charcoal-50 dark:bg-charcoal-700/50 rounded-xl">
                    <div className={`w-14 h-14 rounded-xl ${scoreClasses[scoreColorKey].bg} flex items-center justify-center`}>
                      <span className={`text-xl font-bold ${scoreClasses[scoreColorKey].text}`}>
                        {entry.score}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-charcoal-900 dark:text-white">
                          {format(entry.date, 'MMMM d, yyyy')}
                        </span>
                        {scoreDiff !== 0 && (
                          <span className={`flex items-center gap-1 text-sm ${scoreDiff > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {scoreDiff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {scoreDiff > 0 ? '+' : ''}{scoreDiff}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                        {format(entry.date, 'h:mm a')} • {entry.issues} issues found
                      </p>
                    </div>
                    <button className="btn btn-secondary text-sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-charcoal-100 dark:border-charcoal-700">
          <button onClick={onClose} className="btn btn-secondary w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
