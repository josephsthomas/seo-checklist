import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Target,
  ArrowRight,
  Download
} from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { differenceInDays, isAfter } from 'date-fns';

// Priority colors
const PRIORITY_COLORS = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-amber-500',
  LOW: 'bg-emerald-500'
};

// Status colors
const STATUS_COLORS = {
  Active: 'bg-emerald-500',
  Completed: 'bg-primary-500',
  'On Hold': 'bg-amber-500',
  Planning: 'bg-purple-500'
};

/**
 * Progress ring component
 */
function ProgressRing({ progress, size = 80, strokeWidth = 8, color = 'primary' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colorClasses = {
    primary: 'text-primary-500',
    emerald: 'text-emerald-500',
    cyan: 'text-cyan-500',
    amber: 'text-amber-500',
    red: 'text-red-500'
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-charcoal-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={colorClasses[color] || colorClasses.primary}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-charcoal-900">{progress}%</span>
      </div>
    </div>
  );
}

/**
 * Project progress card
 */
function ProjectProgressCard({ project, stats }) {
  const progress = stats?.percentage || 0;
  const isOverdue = project.dueDate && isAfter(new Date(), new Date(project.dueDate));
  const daysRemaining = project.dueDate
    ? differenceInDays(new Date(project.dueDate), new Date())
    : null;

  return (
    <Link
      to={`/planner/projects/${project.id}`}
      className="block bg-white rounded-xl border border-charcoal-100 p-5 hover:border-charcoal-200 hover:shadow-lg transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 mr-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[project.status] || 'bg-charcoal-300'}`} />
            <span className="text-xs font-medium text-charcoal-500">{project.status}</span>
          </div>
          <h3 className="font-semibold text-charcoal-900 truncate group-hover:text-primary-600 transition-colors">
            {project.name}
          </h3>
          <p className="text-sm text-charcoal-500 truncate">{project.clientName}</p>
        </div>
        <ProgressRing
          progress={progress}
          size={60}
          strokeWidth={6}
          color={progress >= 80 ? 'emerald' : progress >= 50 ? 'primary' : progress >= 25 ? 'amber' : 'red'}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 bg-charcoal-50 rounded-lg">
          <p className="text-lg font-bold text-charcoal-900">{stats?.completed || 0}</p>
          <p className="text-xs text-charcoal-500">Done</p>
        </div>
        <div className="text-center p-2 bg-charcoal-50 rounded-lg">
          <p className="text-lg font-bold text-charcoal-900">{stats?.total - (stats?.completed || 0)}</p>
          <p className="text-xs text-charcoal-500">Remaining</p>
        </div>
        <div className="text-center p-2 bg-charcoal-50 rounded-lg">
          <p className="text-lg font-bold text-red-600">{stats?.critical || 0}</p>
          <p className="text-xs text-charcoal-500">Critical</p>
        </div>
      </div>

      {/* Due Date */}
      {project.dueDate && (
        <div className={`flex items-center gap-2 text-sm ${isOverdue ? 'text-red-600' : 'text-charcoal-500'}`}>
          <Calendar className="w-4 h-4" />
          {isOverdue ? (
            <span className="font-medium">Overdue by {Math.abs(daysRemaining)} days</span>
          ) : (
            <span>{daysRemaining} days remaining</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-end mt-3 pt-3 border-t border-charcoal-100">
        <span className="text-xs text-primary-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
          View Details
          <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

/**
 * Phase breakdown chart
 */
function PhaseBreakdown({ projectsData }) {
  // Aggregate progress by phase across all projects
  const phaseStats = useMemo(() => {
    const phases = ['Discovery', 'Strategy', 'Build', 'Pre-Launch', 'Launch', 'Post-Launch'];
    return phases.map(phase => {
      let totalItems = 0;
      let completedItems = 0;

      projectsData.forEach(({ stats }) => {
        if (stats?.byPhase?.[phase]) {
          totalItems += stats.byPhase[phase].total || 0;
          completedItems += stats.byPhase[phase].completed || 0;
        }
      });

      return {
        phase,
        total: totalItems,
        completed: completedItems,
        percentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
      };
    });
  }, [projectsData]);

  return (
    <div className="bg-white rounded-xl border border-charcoal-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-cyan-50 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 className="font-semibold text-charcoal-900">Phase Progress</h3>
          <p className="text-sm text-charcoal-500">Across all projects</p>
        </div>
      </div>

      <div className="space-y-4">
        {phaseStats.map((stat) => (
          <div key={stat.phase}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-charcoal-700">{stat.phase}</span>
              <span className="text-sm text-charcoal-500">
                {stat.completed}/{stat.total} ({stat.percentage}%)
              </span>
            </div>
            <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${stat.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Priority distribution chart
 */
function PriorityDistribution({ projectsData }) {
  const priorityStats = useMemo(() => {
    const priorities = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const totals = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    const completed = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };

    projectsData.forEach(({ stats }) => {
      if (stats?.byPriority) {
        priorities.forEach(priority => {
          totals[priority] += stats.byPriority[priority]?.total || 0;
          completed[priority] += stats.byPriority[priority]?.completed || 0;
        });
      }
    });

    return priorities.map(priority => ({
      priority,
      total: totals[priority],
      completed: completed[priority],
      remaining: totals[priority] - completed[priority]
    }));
  }, [projectsData]);

  const totalRemaining = priorityStats.reduce((sum, s) => sum + s.remaining, 0);

  return (
    <div className="bg-white rounded-xl border border-charcoal-100 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg flex items-center justify-center">
          <Target className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-charcoal-900">Priority Distribution</h3>
          <p className="text-sm text-charcoal-500">{totalRemaining} tasks remaining</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {priorityStats.map((stat) => (
          <div
            key={stat.priority}
            className="p-4 bg-charcoal-50 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${PRIORITY_COLORS[stat.priority]}`} />
              <span className="text-sm font-medium text-charcoal-700">{stat.priority}</span>
            </div>
            <p className="text-2xl font-bold text-charcoal-900">{stat.remaining}</p>
            <p className="text-xs text-charcoal-500">of {stat.total} remaining</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * At-risk projects panel
 */
function AtRiskProjects({ projects }) {
  const atRiskProjects = projects.filter(p => {
    const isOverdue = p.dueDate && isAfter(new Date(), new Date(p.dueDate));
    const isLowProgress = (p.stats?.percentage || 0) < 30 && p.status === 'Active';
    const hasCriticalItems = (p.stats?.critical || 0) > 5;
    return isOverdue || isLowProgress || hasCriticalItems;
  });

  if (atRiskProjects.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="font-semibold text-emerald-800">All Projects on Track</h3>
        <p className="text-sm text-emerald-600 mt-1">No projects require immediate attention</p>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <h3 className="font-semibold text-red-800">Needs Attention ({atRiskProjects.length})</h3>
      </div>
      <div className="space-y-3">
        {atRiskProjects.slice(0, 3).map((project) => (
          <Link
            key={project.id}
            to={`/planner/projects/${project.id}`}
            className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all group"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-charcoal-900 truncate group-hover:text-primary-600">
                {project.name}
              </p>
              <p className="text-xs text-charcoal-500">
                {project.stats?.percentage || 0}% complete · {project.stats?.critical || 0} critical items
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-charcoal-400" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Main Progress Dashboard component
 */
export default function ProgressDashboard() {
  const { projects, loading } = useProjects();
  const [timeFilter, setTimeFilter] = useState('all'); // all, week, month

  // Calculate aggregated stats
  const aggregatedStats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'Active');
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;

    return {
      totalProjects,
      activeProjects: activeProjects.length,
      completedProjects,
      onTrack: activeProjects.filter(p => (p.progress || 0) >= 50).length
    };
  }, [projects]);

  // Create project data with placeholder stats (in real app, would fetch from Firestore)
  const projectsData = useMemo(() => {
    return projects.map(project => ({
      project,
      stats: project.stats || {
        total: 321,
        completed: Math.floor(Math.random() * 200),
        percentage: Math.floor(Math.random() * 100),
        critical: Math.floor(Math.random() * 10),
        byPhase: {},
        byPriority: {}
      }
    }));
  }, [projects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-charcoal-200 rounded w-1/3" />
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-charcoal-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-charcoal-900">Progress Dashboard</h1>
            <p className="text-charcoal-500">Track progress across all projects</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="input py-2"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button className="btn btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-charcoal-900">{aggregatedStats.totalProjects}</p>
                <p className="text-sm text-charcoal-500">Total Projects</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-charcoal-900">{aggregatedStats.activeProjects}</p>
                <p className="text-sm text-charcoal-500">Active Projects</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-charcoal-900">{aggregatedStats.completedProjects}</p>
                <p className="text-sm text-charcoal-500">Completed</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-charcoal-900">{aggregatedStats.onTrack}</p>
                <p className="text-sm text-charcoal-500">On Track</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Phase Breakdown */}
          <PhaseBreakdown projectsData={projectsData} />

          {/* Priority Distribution */}
          <PriorityDistribution projectsData={projectsData} />

          {/* At Risk Projects */}
          <AtRiskProjects projects={projectsData.map(pd => ({ ...pd.project, stats: pd.stats }))} />
        </div>

        {/* Projects Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-charcoal-900">All Projects</h2>
            <Link
              to="/app/planner"
              className="text-sm text-primary-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
            >
              Manage Projects
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="bg-white rounded-xl border border-charcoal-100 p-12 text-center">
              <div className="w-16 h-16 bg-charcoal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="font-semibold text-charcoal-900 mb-2">No Projects Yet</h3>
              <p className="text-charcoal-500 mb-4">Create your first project to track progress</p>
              <Link to="/app/planner/new" className="btn btn-primary">
                Create Project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectsData.map(({ project, stats }) => (
                <ProjectProgressCard key={project.id} project={project} stats={stats} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
