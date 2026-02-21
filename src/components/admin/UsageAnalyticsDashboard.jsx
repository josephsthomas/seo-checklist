import { useState, useEffect, useMemo } from 'react';
import {
  BarChart2,
  Users,
  Activity,
  TrendingUp,
  FileSearch,
  Accessibility,
  Image,
  Tags,
  Code2,
  ClipboardList,
  Download,
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { format, subDays, startOfWeek, startOfMonth, eachDayOfInterval } from 'date-fns';
import toast from 'react-hot-toast';

const TOOL_ICONS = {
  planner: ClipboardList,
  audit: FileSearch,
  accessibility: Accessibility,
  'image-alt': Image,
  'meta-generator': Tags,
  'schema-generator': Code2,
};

const TOOL_COLORS = {
  planner: 'primary',
  audit: 'cyan',
  accessibility: 'purple',
  'image-alt': 'emerald',
  'meta-generator': 'amber',
  'schema-generator': 'rose',
};

export default function UsageAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Calculate date range
  const dateRangeConfig = useMemo(() => {
    const now = new Date();
    switch (dateRange) {
      case '24h':
        return { start: subDays(now, 1), end: now, label: 'Last 24 Hours' };
      case '7d':
        return { start: subDays(now, 7), end: now, label: 'Last 7 Days' };
      case '30d':
        return { start: subDays(now, 30), end: now, label: 'Last 30 Days' };
      case 'week':
        return { start: startOfWeek(now), end: now, label: 'This Week' };
      case 'month':
        return { start: startOfMonth(now), end: now, label: 'This Month' };
      default:
        return { start: subDays(now, 7), end: now, label: 'Last 7 Days' };
    }
  }, [dateRange]);

  // Fetch and calculate stats
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      try {
        // In production, these would be real Firestore queries
        // For demo, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 800));

        // Generate mock stats
        const mockStats = {
          overview: {
            totalUsers: 156,
            userChange: 12,
            activeUsers: 89,
            activeChange: -3,
            totalActions: 2847,
            actionsChange: 18,
            exportCount: 423,
            exportChange: 7,
          },
          toolUsage: {
            planner: { count: 892, percentage: 31 },
            audit: { count: 634, percentage: 22 },
            accessibility: { count: 445, percentage: 16 },
            'image-alt': { count: 389, percentage: 14 },
            'meta-generator': { count: 312, percentage: 11 },
            'schema-generator': { count: 175, percentage: 6 },
          },
          dailyActivity: eachDayOfInterval({
            start: dateRangeConfig.start,
            end: dateRangeConfig.end
          }).map(date => ({
            date,
            actions: Math.floor(200 + Math.random() * 300),
            users: Math.floor(30 + Math.random() * 50),
          })),
          popularFeatures: [
            { name: 'Export to PDF', count: 312, tool: 'audit' },
            { name: 'AI Alt Text Generation', count: 278, tool: 'image-alt' },
            { name: 'Schema Validation', count: 234, tool: 'schema-generator' },
            { name: 'Accessibility Report', count: 198, tool: 'accessibility' },
            { name: 'Meta Tag Preview', count: 187, tool: 'meta-generator' },
          ],
          recentActivity: [
            { user: 'John D.', action: 'Ran technical audit', tool: 'audit', time: subDays(new Date(), 0.1) },
            { user: 'Sarah M.', action: 'Generated alt texts', tool: 'image-alt', time: subDays(new Date(), 0.2) },
            { user: 'Mike R.', action: 'Created new project', tool: 'planner', time: subDays(new Date(), 0.3) },
            { user: 'Emily C.', action: 'Exported VPAT report', tool: 'accessibility', time: subDays(new Date(), 0.5) },
            { user: 'Alex T.', action: 'Generated schema', tool: 'schema-generator', time: subDays(new Date(), 0.8) },
          ],
        };

        setStats(mockStats);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [dateRange, dateRangeConfig, refreshKey]);

  const getChangeIndicator = (change) => {
    if (change > 0) {
      return (
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          <ArrowUpRight className="w-4 h-4" />
          +{change}%
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
          <ArrowDownRight className="w-4 h-4" />
          {change}%
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-charcoal-500 dark:text-charcoal-400">
        <Minus className="w-4 h-4" />
        0%
      </span>
    );
  };

  const maxDailyActions = useMemo(() => {
    if (!stats?.dailyActivity) return 0;
    return Math.max(...stats.dailyActivity.map(d => d.actions));
  }, [stats?.dailyActivity]);

  // Export analytics data as CSV
  const exportAnalyticsData = () => {
    if (!stats) {
      toast.error('No data to export');
      return;
    }

    // Build CSV content
    let csvContent = 'Usage Analytics Report\n';
    csvContent += `Date Range: ${dateRangeConfig.label}\n`;
    csvContent += `Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;

    // Overview section
    csvContent += 'OVERVIEW\n';
    csvContent += 'Metric,Value,Change\n';
    csvContent += `Total Users,${stats.overview.totalUsers},${stats.overview.userChange}%\n`;
    csvContent += `Active Users,${stats.overview.activeUsers},${stats.overview.activeChange}%\n`;
    csvContent += `Total Actions,${stats.overview.totalActions},${stats.overview.actionsChange}%\n`;
    csvContent += `Exports,${stats.overview.exportCount},${stats.overview.exportChange}%\n\n`;

    // Tool usage section
    csvContent += 'TOOL USAGE\n';
    csvContent += 'Tool,Count,Percentage\n';
    Object.entries(stats.toolUsage).forEach(([tool, data]) => {
      csvContent += `${tool},${data.count},${data.percentage}%\n`;
    });
    csvContent += '\n';

    // Daily activity section
    csvContent += 'DAILY ACTIVITY\n';
    csvContent += 'Date,Actions,Users\n';
    stats.dailyActivity.forEach(day => {
      csvContent += `${format(day.date, 'yyyy-MM-dd')},${day.actions},${day.users}\n`;
    });
    csvContent += '\n';

    // Popular features section
    csvContent += 'POPULAR FEATURES\n';
    csvContent += 'Feature,Count,Tool\n';
    stats.popularFeatures.forEach(feature => {
      csvContent += `${feature.name},${feature.count},${feature.tool}\n`;
    });

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usage_analytics_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success('Analytics data exported to CSV');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white dark:from-charcoal-900 dark:to-charcoal-950 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-charcoal-200 dark:bg-charcoal-700 rounded w-64" />
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-charcoal-200 dark:bg-charcoal-700 rounded-2xl" />
              ))}
            </div>
            <div className="h-80 bg-charcoal-200 dark:bg-charcoal-700 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white dark:from-charcoal-900 dark:to-charcoal-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-white" />
              </div>
              Usage Analytics
            </h1>
            <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
              Track tool usage and user engagement
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="select py-2"
              aria-label="Select date range"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportAnalyticsData}
              className="btn btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                  {stats?.overview.totalUsers}
                </p>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Total Users</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-charcoal-100 dark:border-charcoal-700 text-sm">
              {getChangeIndicator(stats?.overview.userChange)}
              <span className="text-charcoal-500 dark:text-charcoal-400 ml-2">vs last period</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                  {stats?.overview.activeUsers}
                </p>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Active Users</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-charcoal-100 dark:border-charcoal-700 text-sm">
              {getChangeIndicator(stats?.overview.activeChange)}
              <span className="text-charcoal-500 dark:text-charcoal-400 ml-2">vs last period</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                  {stats?.overview.totalActions?.toLocaleString()}
                </p>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Total Actions</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-charcoal-100 dark:border-charcoal-700 text-sm">
              {getChangeIndicator(stats?.overview.actionsChange)}
              <span className="text-charcoal-500 dark:text-charcoal-400 ml-2">vs last period</span>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal-900 dark:text-white">
                  {stats?.overview.exportCount}
                </p>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Exports</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-charcoal-100 dark:border-charcoal-700 text-sm">
              {getChangeIndicator(stats?.overview.exportChange)}
              <span className="text-charcoal-500 dark:text-charcoal-400 ml-2">vs last period</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Activity Chart */}
          <div className="lg:col-span-2 card p-6">
            <h3 className="font-semibold text-charcoal-900 dark:text-white mb-6">Daily Activity</h3>
            <div className="h-64 flex items-end gap-1">
              {stats?.dailyActivity.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t-lg transition-all hover:from-primary-600 hover:to-primary-500 cursor-pointer"
                    style={{ height: `${(day.actions / maxDailyActions) * 100}%` }}
                    title={`${day.actions} actions`}
                  />
                  <span className="text-2xs text-charcoal-500 dark:text-charcoal-400">
                    {format(day.date, 'EEE')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tool Usage */}
          <div className="card p-6">
            <h3 className="font-semibold text-charcoal-900 dark:text-white mb-4">Tool Usage</h3>
            <div className="space-y-3">
              {stats?.toolUsage && Object.entries(stats.toolUsage).map(([tool, data]) => {
                const Icon = TOOL_ICONS[tool] || Activity;
                const colorClass = TOOL_COLORS[tool] || 'primary';

                return (
                  <div key={tool} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${colorClass}-100 dark:bg-${colorClass}-900/30 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 text-${colorClass}-600 dark:text-${colorClass}-400`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 capitalize">
                          {tool.replace('-', ' ')}
                        </span>
                        <span className="text-sm text-charcoal-500 dark:text-charcoal-400">
                          {data.percentage}%
                        </span>
                      </div>
                      <div className="h-2 bg-charcoal-100 dark:bg-charcoal-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-${colorClass}-500 to-${colorClass}-400 rounded-full`}
                          style={{ width: `${data.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Popular Features */}
          <div className="card p-6">
            <h3 className="font-semibold text-charcoal-900 dark:text-white mb-4">Popular Features</h3>
            <div className="space-y-3">
              {stats?.popularFeatures.map((feature, index) => {
                const Icon = TOOL_ICONS[feature.tool] || Activity;

                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-charcoal-50 dark:hover:bg-charcoal-800 transition-colors">
                    <span className="w-6 h-6 rounded-full bg-charcoal-100 dark:bg-charcoal-700 flex items-center justify-center text-sm font-medium text-charcoal-600 dark:text-charcoal-300">
                      {index + 1}
                    </span>
                    <Icon className="w-5 h-5 text-charcoal-400" />
                    <span className="flex-1 text-charcoal-700 dark:text-charcoal-300">{feature.name}</span>
                    <span className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400">
                      {feature.count} uses
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card p-6">
            <h3 className="font-semibold text-charcoal-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {stats?.recentActivity.map((activity, index) => {
                const Icon = TOOL_ICONS[activity.tool] || Activity;

                return (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-charcoal-50 dark:hover:bg-charcoal-800 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-charcoal-100 dark:bg-charcoal-700 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-charcoal-500 dark:text-charcoal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal-900 dark:text-white">
                        <span className="font-medium">{activity.user}</span>
                        {' '}{activity.action}
                      </p>
                      <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                        {format(activity.time, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
