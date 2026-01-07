import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  ClipboardList,
  Search,
  Accessibility,
  Image,
  Tags,
  Code2,
  MessageSquare,
  Users,
  Upload,
  Download,
  Link2,
  Star,
  Bell,
  Settings,
  ChevronDown,
  ChevronUp,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useActivityLog } from '../../hooks/useActivityLog';
import { format, formatDistanceToNow, isToday, isYesterday, isThisWeek, startOfDay } from 'date-fns';

// Activity type icons
const ACTIVITY_ICONS = {
  'project.created': ClipboardList,
  'project.updated': ClipboardList,
  'project.completed': CheckCircle2,
  'checklist.item_completed': CheckCircle2,
  'checklist.item_uncompleted': ClipboardList,
  'audit.created': Search,
  'audit.shared': Link2,
  'accessibility.scan': Accessibility,
  'imagealt.generated': Image,
  'meta.generated': Tags,
  'schema.generated': Code2,
  'comment.added': MessageSquare,
  'team.member_added': Users,
  'team.member_removed': Users,
  'file.uploaded': Upload,
  'file.downloaded': Download,
  'favorite.added': Star,
  'favorite.removed': Star,
  'notification.received': Bell,
  'settings.updated': Settings,
  'default': Clock
};

// Activity type colors
const ACTIVITY_COLORS = {
  'project.created': 'bg-primary-100 text-primary-600',
  'project.updated': 'bg-primary-100 text-primary-600',
  'project.completed': 'bg-emerald-100 text-emerald-600',
  'checklist.item_completed': 'bg-emerald-100 text-emerald-600',
  'checklist.item_uncompleted': 'bg-amber-100 text-amber-600',
  'audit.created': 'bg-cyan-100 text-cyan-600',
  'audit.shared': 'bg-cyan-100 text-cyan-600',
  'accessibility.scan': 'bg-purple-100 text-purple-600',
  'imagealt.generated': 'bg-emerald-100 text-emerald-600',
  'meta.generated': 'bg-amber-100 text-amber-600',
  'schema.generated': 'bg-rose-100 text-rose-600',
  'comment.added': 'bg-blue-100 text-blue-600',
  'team.member_added': 'bg-indigo-100 text-indigo-600',
  'team.member_removed': 'bg-red-100 text-red-600',
  'file.uploaded': 'bg-teal-100 text-teal-600',
  'file.downloaded': 'bg-teal-100 text-teal-600',
  'favorite.added': 'bg-amber-100 text-amber-600',
  'favorite.removed': 'bg-charcoal-100 text-charcoal-600',
  'notification.received': 'bg-orange-100 text-orange-600',
  'settings.updated': 'bg-charcoal-100 text-charcoal-600',
  'default': 'bg-charcoal-100 text-charcoal-600'
};

// Activity categories for filtering
const ACTIVITY_CATEGORIES = [
  { id: 'all', label: 'All Activity' },
  { id: 'projects', label: 'Projects', types: ['project.created', 'project.updated', 'project.completed'] },
  { id: 'checklist', label: 'Checklist', types: ['checklist.item_completed', 'checklist.item_uncompleted'] },
  { id: 'tools', label: 'Tools', types: ['audit.created', 'audit.shared', 'accessibility.scan', 'imagealt.generated', 'meta.generated', 'schema.generated'] },
  { id: 'collaboration', label: 'Collaboration', types: ['comment.added', 'team.member_added', 'team.member_removed'] },
  { id: 'files', label: 'Files', types: ['file.uploaded', 'file.downloaded'] }
];

/**
 * Format activity message based on type
 */
function getActivityMessage(activity) {
  const messages = {
    'project.created': `Created project "${activity.metadata?.projectName || 'Untitled'}"`,
    'project.updated': `Updated project "${activity.metadata?.projectName || 'Untitled'}"`,
    'project.completed': `Completed project "${activity.metadata?.projectName || 'Untitled'}"`,
    'checklist.item_completed': `Completed checklist item: ${activity.metadata?.itemTitle || 'Unknown'}`,
    'checklist.item_uncompleted': `Marked incomplete: ${activity.metadata?.itemTitle || 'Unknown'}`,
    'audit.created': `Ran technical audit on ${activity.metadata?.domain || 'site'}`,
    'audit.shared': `Shared audit for ${activity.metadata?.domain || 'site'}`,
    'accessibility.scan': `Scanned ${activity.metadata?.url || 'page'} for accessibility`,
    'imagealt.generated': `Generated ${activity.metadata?.count || 0} alt text descriptions`,
    'meta.generated': `Generated meta data for ${activity.metadata?.title || 'document'}`,
    'schema.generated': `Created ${activity.metadata?.schemaType || 'structured'} data`,
    'comment.added': `Commented on "${activity.metadata?.itemTitle || 'item'}"`,
    'team.member_added': `Added ${activity.metadata?.memberName || 'member'} to team`,
    'team.member_removed': `Removed ${activity.metadata?.memberName || 'member'} from team`,
    'file.uploaded': `Uploaded ${activity.metadata?.fileName || 'file'}`,
    'file.downloaded': `Downloaded ${activity.metadata?.fileName || 'file'}`,
    'favorite.added': `Added ${activity.metadata?.itemName || 'item'} to favorites`,
    'favorite.removed': `Removed ${activity.metadata?.itemName || 'item'} from favorites`,
    'notification.received': activity.metadata?.message || 'Received notification',
    'settings.updated': 'Updated settings'
  };

  return messages[activity.type] || activity.description || 'Activity recorded';
}

/**
 * Single activity item component
 */
function ActivityItem({ activity, isLast }) {
  const Icon = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.default;
  const colorClass = ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.default;
  const message = getActivityMessage(activity);
  const timestamp = activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);

  return (
    <div className="relative flex gap-4 pb-6">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-charcoal-200" />
      )}

      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-charcoal-900 font-medium">{message}</p>
        <div className="flex items-center gap-3 mt-1 text-sm text-charcoal-500">
          <span>{formatDistanceToNow(timestamp, { addSuffix: true })}</span>
          {activity.metadata?.path && (
            <>
              <span>•</span>
              <Link
                to={activity.metadata.path}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                View
                <ArrowRight className="w-3 h-3" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Activity group by day
 */
function ActivityGroup({ date, activities }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const dateLabel = useMemo(() => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE');
    return format(date, 'MMMM d, yyyy');
  }, [date]);

  return (
    <div className="mb-6">
      {/* Date Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 mb-4 text-sm font-semibold text-charcoal-700 hover:text-charcoal-900 transition-colors"
      >
        <Calendar className="w-4 h-4" />
        {dateLabel}
        <span className="text-charcoal-400 font-normal">({activities.length})</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 ml-1" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-1" />
        )}
      </button>

      {/* Activities */}
      {isExpanded && (
        <div className="pl-2">
          {activities.map((activity, index) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              isLast={index === activities.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Main Activity Timeline component
 */
export default function ActivityTimeline({ limit, showFilters = true }) {
  const { activities, loading, loadMore, hasMore } = useActivityLog(limit);
  const [filter, setFilter] = useState('all');

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities;

    const category = ACTIVITY_CATEGORIES.find(c => c.id === filter);
    if (!category || !category.types) return activities;

    return activities.filter(a => category.types.includes(a.type));
  }, [activities, filter]);

  // Group activities by day
  const groupedActivities = useMemo(() => {
    const groups = {};

    filteredActivities.forEach(activity => {
      const timestamp = activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);
      const dayKey = startOfDay(timestamp).toISOString();

      if (!groups[dayKey]) {
        groups[dayKey] = {
          date: startOfDay(timestamp),
          activities: []
        };
      }
      groups[dayKey].activities.push(activity);
    });

    return Object.values(groups).sort((a, b) => b.date - a.date);
  }, [filteredActivities]);

  if (loading && activities.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex gap-4">
            <div className="w-10 h-10 bg-charcoal-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-charcoal-200 rounded w-3/4" />
              <div className="h-3 bg-charcoal-100 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-charcoal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-charcoal-400" />
        </div>
        <h3 className="font-semibold text-charcoal-900 mb-2">No Activity Yet</h3>
        <p className="text-charcoal-500">Your activity history will appear here</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {ACTIVITY_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setFilter(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === category.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-2">
        {groupedActivities.map(group => (
          <ActivityGroup
            key={group.date.toISOString()}
            date={group.date}
            activities={group.activities}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Compact activity widget for dashboards
 */
export function ActivityWidget({ limit = 5, className = '' }) {
  const { activities, loading } = useActivityLog(limit);

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-charcoal-100 p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-charcoal-100 rounded w-1/3" />
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-charcoal-100 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-charcoal-100 rounded w-3/4" />
                <div className="h-3 bg-charcoal-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-charcoal-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-charcoal-500" />
          <h3 className="font-semibold text-charcoal-900">Recent Activity</h3>
        </div>
        <Link
          to="/activity"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View All
        </Link>
      </div>

      {activities.length === 0 ? (
        <p className="text-charcoal-500 text-sm text-center py-4">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, limit).map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.default;
            const colorClass = ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.default;
            const message = getActivityMessage(activity);
            const timestamp = activity.timestamp?.toDate ? activity.timestamp.toDate() : new Date(activity.timestamp);

            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-charcoal-900 truncate">{message}</p>
                  <p className="text-xs text-charcoal-500">
                    {formatDistanceToNow(timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
