import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Mail,
  Send,
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  FileText,
  BarChart3,
  Shield,
  Image,
  Code,
  Globe,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  Bell,
  Users,
  Download,
  RefreshCw,
  PauseCircle,
  PlayCircle
} from 'lucide-react';
import { format, formatDistanceToNow, addDays, addWeeks, addMonths } from 'date-fns';
import toast from 'react-hot-toast';
import InfoTooltip from '../common/InfoTooltip';

/**
 * Scheduled Reports Panel
 * Configure automated report delivery for various tools
 */

// Report types available for scheduling
const REPORT_TYPES = [
  {
    id: 'technical-audit',
    name: 'Technical SEO Audit',
    description: 'Full technical SEO analysis report',
    icon: Globe,
    color: 'cyan',
    bgClass: 'bg-cyan-100 dark:bg-cyan-900/30',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    fields: ['url', 'depth', 'includeScreenshots']
  },
  {
    id: 'accessibility-audit',
    name: 'Accessibility Audit',
    description: 'WCAG compliance analysis report',
    icon: Shield,
    color: 'purple',
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-600 dark:text-purple-400',
    fields: ['url', 'wcagLevel', 'includeFixSuggestions']
  },
  {
    id: 'content-progress',
    name: 'Content Progress Report',
    description: 'Project checklist completion status',
    icon: CheckCircle,
    color: 'primary',
    bgClass: 'bg-primary-100 dark:bg-primary-900/30',
    textClass: 'text-primary-600 dark:text-primary-400',
    fields: ['projectId', 'includeAssignments']
  },
  {
    id: 'meta-analysis',
    name: 'Meta Data Analysis',
    description: 'Meta tags performance report',
    icon: FileText,
    color: 'amber',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-600 dark:text-amber-400',
    fields: ['urls', 'includeCompetitors']
  },
  {
    id: 'image-audit',
    name: 'Image Alt Text Audit',
    description: 'Image accessibility compliance report',
    icon: Image,
    color: 'emerald',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    fields: ['url', 'includeAIsuggestions'],
    aiDisclaimer: 'AI-generated alt text suggestions may contain inaccuracies. Review before publishing.'
  },
  {
    id: 'schema-validation',
    name: 'Structured Data Report',
    description: 'Schema markup validation report',
    icon: Code,
    color: 'rose',
    bgClass: 'bg-rose-100 dark:bg-rose-900/30',
    textClass: 'text-rose-600 dark:text-rose-400',
    fields: ['url', 'includeRecommendations']
  },
  {
    id: 'analytics-summary',
    name: 'Usage Analytics Summary',
    description: 'Team activity and usage statistics',
    icon: BarChart3,
    color: 'indigo',
    bgClass: 'bg-indigo-100 dark:bg-indigo-900/30',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    fields: ['dateRange', 'includeUserBreakdown']
  }
];

// Frequency options
const FREQUENCY_OPTIONS = [
  { id: 'daily', label: 'Daily', description: 'Every day at specified time' },
  { id: 'weekly', label: 'Weekly', description: 'Every week on specified day' },
  { id: 'biweekly', label: 'Bi-weekly', description: 'Every two weeks' },
  { id: 'monthly', label: 'Monthly', description: 'Once a month on specified date' },
  { id: 'quarterly', label: 'Quarterly', description: 'Every three months' }
];

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

// Export formats
const EXPORT_FORMATS = [
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'xlsx', label: 'Excel', icon: FileText },
  { id: 'csv', label: 'CSV', icon: FileText },
  { id: 'html', label: 'HTML', icon: Code }
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

export default function ScheduledReportsPanel() {
  const [schedules, setSchedules] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, active, paused

  // TODO: Load scheduled reports from Firestore
  // Reports will be populated when users create scheduled reports

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule => {
    if (filter === 'active') return schedule.isActive;
    if (filter === 'paused') return !schedule.isActive;
    return true;
  });

  // Toggle schedule active status
  const toggleSchedule = (id) => {
    const schedule = schedules.find(s => s.id === id);
    const wasActive = schedule?.isActive;
    setSchedules(prev => prev.map(s =>
      s.id === id ? { ...s, isActive: !s.isActive, lastStatus: !s.isActive ? 'active' : 'paused' } : s
    ));
    toast.success(wasActive ? 'Schedule paused' : 'Schedule activated');
  };

  // State for delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Delete schedule with confirmation and undo
  const deleteSchedule = (id) => {
    const schedule = schedules.find(s => s.id === id);
    setDeleteConfirm({
      id,
      name: schedule?.name || 'this schedule'
    });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;

    const deletedSchedule = schedules.find(s => s.id === deleteConfirm.id);
    setSchedules(prev => prev.filter(s => s.id !== deleteConfirm.id));
    setDeleteConfirm(null);

    // Show toast with undo option
    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Schedule deleted</span>
        <button
          onClick={() => {
            setSchedules(prev => [...prev, deletedSchedule]);
            toast.dismiss(t.id);
            toast.success('Schedule restored');
          }}
          className="px-2 py-1 bg-primary-500 text-white rounded text-sm font-medium hover:bg-primary-600"
        >
          Undo
        </button>
      </div>
    ), { duration: 5000 });
  };

  // Toggle all schedules (maintenance mode)
  const toggleAllSchedules = (activate) => {
    const activeCount = schedules.filter(s => s.isActive).length;

    if (activate) {
      setSchedules(prev => prev.map(s => ({ ...s, isActive: true })));
      toast.success(`All ${schedules.length} schedules activated`);
    } else {
      setSchedules(prev => prev.map(s => ({ ...s, isActive: false })));
      toast.success(`All ${activeCount} schedules paused (maintenance mode)`);
    }
  };

  // Run now
  const runNow = (id) => {
    const schedule = schedules.find(s => s.id === id);
    toast.success(`Running "${schedule?.name}"...`);
    // Simulate running
    setTimeout(() => {
      setSchedules(prev => prev.map(s =>
        s.id === id ? { ...s, lastRun: new Date(), runCount: s.runCount + 1, lastStatus: 'success' } : s
      ));
      toast.success('Report generated and sent!');
    }, 2000);
  };

  // Get report type info
  const getReportType = (typeId) => REPORT_TYPES.find(t => t.id === typeId);

  // Get status badge
  const getStatusBadge = (schedule) => {
    if (!schedule.isActive) {
      return <span className="badge badge-charcoal">Paused</span>;
    }
    if (schedule.lastStatus === 'success') {
      return <span className="badge badge-emerald">Active</span>;
    }
    if (schedule.lastStatus === 'error') {
      return <span className="badge badge-red">Error</span>;
    }
    return <span className="badge badge-primary">Active</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-500" />
            Scheduled Reports
          </h2>
          <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
            Configure automated report generation and delivery
          </p>
        </div>
        <div className="flex items-center gap-2">
          {schedules.some(s => s.isActive) ? (
            <button
              onClick={() => toggleAllSchedules(false)}
              className="btn btn-secondary flex items-center gap-2"
              title="Pause all schedules for maintenance"
            >
              <PauseCircle className="w-4 h-4" />
              Pause All
            </button>
          ) : (
            <button
              onClick={() => toggleAllSchedules(true)}
              className="btn btn-secondary flex items-center gap-2 text-emerald-600 dark:text-emerald-400"
              title="Resume all schedules"
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
            New Schedule
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                {schedules.length}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Total Schedules</p>
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
                {schedules.filter(s => s.isActive).length}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Active</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Send className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                {schedules.reduce((sum, s) => sum + s.runCount, 0)}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Reports Sent</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                {new Set(schedules.flatMap(s => s.recipients)).size}
              </p>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Recipients</p>
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
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'text-charcoal-600 hover:bg-charcoal-100 dark:text-charcoal-400 dark:hover:bg-charcoal-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Schedules list */}
      <div className="space-y-3">
        {filteredSchedules.length === 0 ? (
          <div className="card p-8 text-center">
            <Calendar className="w-12 h-12 text-charcoal-300 dark:text-charcoal-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-2">
              No scheduled reports
            </h3>
            <p className="text-charcoal-500 dark:text-charcoal-400 mb-4">
              Create your first schedule to automate report delivery
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              Create Schedule
            </button>
          </div>
        ) : (
          filteredSchedules.map(schedule => {
            const reportType = getReportType(schedule.reportType);
            const Icon = reportType?.icon || FileText;
            const isExpanded = expandedId === schedule.id;

            return (
              <div key={schedule.id} className="card overflow-hidden">
                {/* Main row */}
                <div className="p-4 flex items-center gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-xl ${reportType?.bgClass || 'bg-primary-100 dark:bg-primary-900/30'}`}>
                    <Icon className={`w-6 h-6 ${reportType?.textClass || 'text-primary-600 dark:text-primary-400'}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-charcoal-900 dark:text-white truncate">
                        {schedule.name}
                      </h3>
                      {getStatusBadge(schedule)}
                    </div>
                    <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                      {reportType?.name} • {FREQUENCY_OPTIONS.find(f => f.id === schedule.frequency)?.label} at {schedule.time} {schedule.timezone && `(${TIMEZONES.find(tz => tz.id === schedule.timezone)?.label.split('(')[1]?.replace(')', '') || schedule.timezone})`}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-charcoal-400 dark:text-charcoal-500">
                      {schedule.lastRun && (
                        <span>Last run: {formatDistanceToNow(schedule.lastRun, { addSuffix: true })}</span>
                      )}
                      {schedule.nextRun && schedule.isActive && (
                        <span>Next: {format(schedule.nextRun, 'MMM d, h:mm a')}</span>
                      )}
                    </div>
                  </div>

                  {/* Recipients count */}
                  <div className="hidden md:flex items-center gap-2 text-charcoal-500 dark:text-charcoal-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{schedule.recipients.length}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => runNow(schedule.id)}
                      className="p-2 text-charcoal-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      title="Run now"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleSchedule(schedule.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        schedule.isActive
                          ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                          : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                      }`}
                      title={schedule.isActive ? 'Pause' : 'Resume'}
                    >
                      {schedule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditingSchedule(schedule)}
                      className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="p-2 text-charcoal-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : schedule.id)}
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
                      {/* Recipients */}
                      <div>
                        <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                          Recipients
                        </h4>
                        <div className="space-y-1">
                          {schedule.recipients.map((email, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                              <Mail className="w-3 h-3" />
                              {email}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Schedule details */}
                      <div>
                        <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                          Schedule
                        </h4>
                        <div className="space-y-1 text-sm text-charcoal-600 dark:text-charcoal-400">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {FREQUENCY_OPTIONS.find(f => f.id === schedule.frequency)?.label}
                          </div>
                          {schedule.dayOfWeek !== undefined && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              {DAYS_OF_WEEK.find(d => d.id === schedule.dayOfWeek)?.full}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Bell className="w-3 h-3" />
                            {schedule.time}
                          </div>
                          <div className="flex items-center gap-2">
                            <Globe className="w-3 h-3" />
                            {TIMEZONES.find(tz => tz.id === schedule.timezone)?.label || schedule.timezone || 'UTC'}
                          </div>
                        </div>
                      </div>

                      {/* Export format & stats */}
                      <div>
                        <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                          Export & Stats
                        </h4>
                        <div className="space-y-1 text-sm text-charcoal-600 dark:text-charcoal-400">
                          <div className="flex items-center gap-2">
                            <Download className="w-3 h-3" />
                            {schedule.format.toUpperCase()} format
                          </div>
                          <div className="flex items-center gap-2">
                            <BarChart3 className="w-3 h-3" />
                            {schedule.runCount} reports generated
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Created {format(schedule.createdAt, 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Configuration preview */}
                    <div className="mt-4 p-3 bg-charcoal-50 dark:bg-charcoal-800 rounded-lg">
                      <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                        Configuration
                      </h4>
                      <pre className="text-xs text-charcoal-600 dark:text-charcoal-400 overflow-x-auto">
                        {JSON.stringify(schedule.config, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingSchedule) && (
        <ScheduleFormModal
          schedule={editingSchedule}
          onSave={(newSchedule) => {
            if (editingSchedule) {
              setSchedules(prev => prev.map(s => s.id === editingSchedule.id ? { ...s, ...newSchedule } : s));
              toast.success('Schedule updated');
            } else {
              setSchedules(prev => [...prev, { ...newSchedule, id: Date.now().toString(), createdAt: new Date(), runCount: 0 }]);
              toast.success('Schedule created');
            }
            setShowCreateModal(false);
            setEditingSchedule(null);
          }}
          onClose={() => {
            setShowCreateModal(false);
            setEditingSchedule(null);
          }}
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
                  Delete Schedule
                </h3>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                  This action can be undone
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
 * Schedule Form Modal
 */
function ScheduleFormModal({ schedule, onSave, onClose }) {
  const [formData, setFormData] = useState({
    name: schedule?.name || '',
    reportType: schedule?.reportType || 'technical-audit',
    frequency: schedule?.frequency || 'weekly',
    dayOfWeek: schedule?.dayOfWeek ?? 1,
    dayOfMonth: schedule?.dayOfMonth ?? 1,
    time: schedule?.time || '09:00',
    timezone: schedule?.timezone || 'America/New_York',
    recipients: schedule?.recipients?.join(', ') || '',
    format: schedule?.format || 'pdf',
    isActive: schedule?.isActive ?? true,
    config: schedule?.config || {}
  });

  const [step, setStep] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a schedule name');
      return;
    }
    if (!formData.recipients.trim()) {
      toast.error('Please add at least one recipient');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const recipientList = formData.recipients.split(',').map(e => e.trim()).filter(Boolean);
    const invalidEmails = recipientList.filter(e => !emailRegex.test(e));
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email address${invalidEmails.length > 1 ? 'es' : ''}: ${invalidEmails.join(', ')}`);
      return;
    }

    const nextRun = calculateNextRun(formData);

    onSave({
      ...formData,
      recipients: recipientList,
      nextRun,
      lastStatus: formData.isActive ? 'active' : 'paused'
    });
  };

  const calculateNextRun = (data) => {
    const now = new Date();
    const [hours, minutes] = data.time.split(':').map(Number);
    let next = new Date(now);
    next.setHours(hours, minutes, 0, 0);

    if (next <= now) {
      next = addDays(next, 1);
    }

    switch (data.frequency) {
      case 'weekly':
        while (next.getDay() !== data.dayOfWeek) {
          next = addDays(next, 1);
        }
        break;
      case 'biweekly':
        while (next.getDay() !== data.dayOfWeek) {
          next = addDays(next, 1);
        }
        next = addWeeks(next, 1);
        break;
      case 'monthly':
        next.setDate(data.dayOfMonth);
        if (next <= now) {
          next = addMonths(next, 1);
        }
        break;
      case 'quarterly':
        next.setDate(data.dayOfMonth);
        if (next <= now) {
          next = addMonths(next, 3);
        }
        break;
      default:
        break;
    }

    return next;
  };

  const reportType = REPORT_TYPES.find(t => t.id === formData.reportType);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-charcoal-900 dark:text-white">
              {schedule ? 'Edit Schedule' : 'Create New Schedule'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-charcoal-400 hover:text-charcoal-600 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <button
                key={s}
                onClick={() => setStep(s)}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  s === step
                    ? 'bg-primary-500'
                    : s < step
                    ? 'bg-emerald-500'
                    : 'bg-charcoal-200 dark:bg-charcoal-600'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-charcoal-500 dark:text-charcoal-400">
            <span>Report Type</span>
            <span>Schedule</span>
            <span>Delivery</span>
          </div>
        </div>

        {/* Form content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Report Type */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                  Schedule Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Weekly Technical Audit"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2 flex items-center gap-1">
                  Report Type
                  <InfoTooltip tipKey="schedule.reportType" />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {REPORT_TYPES.map(type => {
                    const Icon = type.icon;
                    const isSelected = formData.reportType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, reportType: type.id }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected
                            ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                            : 'border-charcoal-200 dark:border-charcoal-600 hover:border-charcoal-300 dark:hover:border-charcoal-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-${type.color}-100 dark:bg-${type.color}-900/30`}>
                            <Icon className={`w-5 h-5 text-${type.color}-600 dark:text-${type.color}-400`} />
                          </div>
                          <div>
                            <p className={`font-medium ${isSelected ? `text-${type.color}-700 dark:text-${type.color}-300` : 'text-charcoal-900 dark:text-white'}`}>
                              {type.name}
                            </p>
                            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{type.description}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
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
                  <InfoTooltip tipKey="schedule.frequency" />
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FREQUENCY_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, frequency: option.id }))}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.frequency === option.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
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
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-charcoal-200 dark:border-charcoal-600 text-charcoal-700 dark:text-charcoal-300 hover:border-charcoal-300'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(formData.frequency === 'monthly' || formData.frequency === 'quarterly') && (
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
                  <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2 flex items-center gap-1">
                    Timezone
                    <InfoTooltip tipKey="schedule.timezone" />
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

              <div className="flex items-center gap-3 p-4 bg-charcoal-50 dark:bg-charcoal-700/50 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-charcoal-700 dark:text-charcoal-300 flex items-center gap-1">
                  Activate schedule immediately after saving
                  <InfoTooltip tipKey="schedule.active" />
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Delivery */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2 flex items-center gap-1">
                  Recipients (comma-separated emails)
                  <InfoTooltip tipKey="schedule.recipients" />
                </label>
                <textarea
                  value={formData.recipients}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipients: e.target.value }))}
                  placeholder="team@example.com, manager@example.com"
                  rows={3}
                  className="input resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {EXPORT_FORMATS.map(format => (
                    <button
                      key={format.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, format: format.id }))}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        formData.format === format.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-charcoal-200 dark:border-charcoal-600 text-charcoal-700 dark:text-charcoal-300 hover:border-charcoal-300'
                      }`}
                    >
                      <format.icon className="w-5 h-5 mx-auto mb-1" />
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-gradient-to-br from-primary-50 to-cyan-50 dark:from-primary-900/20 dark:to-cyan-900/20 rounded-xl">
                <h4 className="font-medium text-charcoal-900 dark:text-white mb-3">Schedule Summary</h4>
                <div className="space-y-2 text-sm text-charcoal-600 dark:text-charcoal-400">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{reportType?.name || 'Report'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {FREQUENCY_OPTIONS.find(f => f.id === formData.frequency)?.label} at {formData.time}
                      {(formData.frequency === 'weekly' || formData.frequency === 'biweekly') &&
                        ` on ${DAYS_OF_WEEK.find(d => d.id === formData.dayOfWeek)?.full}`}
                      {(formData.frequency === 'monthly' || formData.frequency === 'quarterly') &&
                        ` on day ${formData.dayOfMonth}`}
                      {` (${TIMEZONES.find(tz => tz.id === formData.timezone)?.label.split('(')[1]?.replace(')', '') || formData.timezone})`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{formData.recipients.split(',').filter(e => e.trim()).length} recipient(s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>{formData.format.toUpperCase()} format</span>
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
              onClick={() => {
                if (step === 1 && !formData.name.trim()) {
                  toast.error('Please enter a schedule name');
                  return;
                }
                setStep(step + 1);
              }}
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
              {schedule ? 'Save Changes' : 'Create Schedule'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
