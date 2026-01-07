import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Target,
  BarChart3,
  Activity,
  Copy,
  Check
} from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useChecklist } from '../../hooks/useChecklist';
import { useProjectActivityLog } from '../../hooks/useActivityLog';
import { checklistData } from '../../data/checklistData';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

/**
 * Circular Progress Ring
 */
function ProgressRing({ progress, size = 120, strokeWidth = 8, color = 'primary' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const colorMap = {
    primary: '#0066FF',
    emerald: '#10B981',
    amber: '#F59E0B',
    red: '#EF4444'
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-charcoal-900">{progress}%</span>
        <span className="text-xs text-charcoal-500">Complete</span>
      </div>
    </div>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ icon: Icon, label, value, subtext, color = 'charcoal' }) {
  const colorClasses = {
    charcoal: 'bg-charcoal-100 text-charcoal-600',
    primary: 'bg-primary-100 text-primary-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl border border-charcoal-100 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-charcoal-900">{value}</p>
          <p className="text-sm text-charcoal-500">{label}</p>
          {subtext && <p className="text-xs text-charcoal-400">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

/**
 * Phase Progress Bar
 */
function PhaseProgress({ phases }) {
  return (
    <div className="space-y-3">
      {phases.map(phase => (
        <div key={phase.name}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-charcoal-700">{phase.name}</span>
            <span className="text-charcoal-500">{phase.completed}/{phase.total}</span>
          </div>
          <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                phase.progress === 100
                  ? 'bg-emerald-500'
                  : phase.progress > 0
                    ? 'bg-primary-500'
                    : 'bg-charcoal-200'
              }`}
              style={{ width: `${phase.progress}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Project Health Report Page
 */
export default function ProjectHealthReport() {
  const { projectId } = useParams();
  const { getProject } = useProjects();
  const { completions } = useChecklist(projectId);
  const { activities } = useProjectActivityLog(projectId, 10);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        const data = await getProject(projectId);
        setProject(data);
      }
      setLoading(false);
    };
    fetchProject();
  }, [projectId, getProject]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!project) return null;

    // Filter items by project type
    const relevantItems = checklistData.filter(item =>
      !item.projectTypes || item.projectTypes.includes(project.projectType)
    );

    const total = relevantItems.length;
    const completed = Object.keys(completions).filter(id => completions[id]).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // By priority
    const criticalTotal = relevantItems.filter(i => i.priority === 'CRITICAL').length;
    const criticalDone = relevantItems.filter(i => i.priority === 'CRITICAL' && completions[i.id]).length;
    const highTotal = relevantItems.filter(i => i.priority === 'HIGH').length;
    const highDone = relevantItems.filter(i => i.priority === 'HIGH' && completions[i.id]).length;

    // By phase
    const phases = ['Discovery', 'Strategy', 'Build', 'Pre-Launch', 'Launch', 'Post-Launch'].map(phase => {
      const phaseItems = relevantItems.filter(i => i.phase === phase);
      const phaseDone = phaseItems.filter(i => completions[i.id]).length;
      return {
        name: phase,
        total: phaseItems.length,
        completed: phaseDone,
        progress: phaseItems.length > 0 ? Math.round((phaseDone / phaseItems.length) * 100) : 0
      };
    }).filter(p => p.total > 0);

    // Health score
    const criticalWeight = criticalTotal > 0 ? (criticalDone / criticalTotal) * 40 : 40;
    const highWeight = highTotal > 0 ? (highDone / highTotal) * 30 : 30;
    const overallWeight = (completed / total) * 30;
    const healthScore = Math.round(criticalWeight + highWeight + overallWeight);

    return {
      total,
      completed,
      remaining: total - completed,
      progress,
      criticalTotal,
      criticalDone,
      highTotal,
      highDone,
      phases,
      healthScore
    };
  }, [project, completions]);

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-4xl px-4">
          <div className="h-10 bg-charcoal-200 rounded w-1/3" />
          <div className="h-48 bg-charcoal-100 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 bg-charcoal-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-charcoal-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-charcoal-900 mb-2">Project Not Found</h2>
          <Link to="/planner" className="text-primary-600 hover:text-primary-700">
            Go to Content Planner
          </Link>
        </div>
      </div>
    );
  }

  const healthColor = stats.healthScore >= 80 ? 'emerald' : stats.healthScore >= 60 ? 'amber' : 'red';

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white py-8 px-4 print:bg-white print:py-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link
            to={`/planner/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-charcoal-600 hover:text-charcoal-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Project
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="btn btn-secondary flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Report Header */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-8 mb-6 print:border-none print:shadow-none">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <ProgressRing progress={stats.progress} color={healthColor} />
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-charcoal-500 mb-1">
                <Calendar className="w-4 h-4" />
                Report generated {format(new Date(), 'MMMM d, yyyy')}
              </div>
              <h1 className="text-3xl font-bold text-charcoal-900 mb-2">{project.name}</h1>
              {project.description && (
                <p className="text-charcoal-600 mb-4">{project.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-4">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  healthColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                  healthColor === 'amber' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  <Target className="w-4 h-4" />
                  Health Score: {stats.healthScore}/100
                </div>
                {project.status && (
                  <span className="text-sm text-charcoal-500">
                    Status: <strong className="text-charcoal-700">{project.status}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={stats.completed}
            subtext={`of ${stats.total} items`}
            color="emerald"
          />
          <StatCard
            icon={Clock}
            label="Remaining"
            value={stats.remaining}
            subtext="items left"
            color="charcoal"
          />
          <StatCard
            icon={AlertTriangle}
            label="Critical"
            value={`${stats.criticalDone}/${stats.criticalTotal}`}
            subtext="high priority"
            color={stats.criticalDone === stats.criticalTotal ? 'emerald' : 'red'}
          />
          <StatCard
            icon={TrendingUp}
            label="High Priority"
            value={`${stats.highDone}/${stats.highTotal}`}
            subtext="completed"
            color={stats.highDone === stats.highTotal ? 'emerald' : 'amber'}
          />
        </div>

        {/* Phase Progress */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            Progress by Phase
          </h2>
          <PhaseProgress phases={stats.phases} />
        </div>

        {/* Recent Activity */}
        {activities.length > 0 && (
          <div className="bg-white rounded-2xl border border-charcoal-100 p-6 print:hidden">
            <h2 className="text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-500" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {activities.slice(0, 5).map(activity => (
                <div key={activity.id} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary-500 rounded-full" />
                  <span className="text-charcoal-600">{activity.action || activity.type}</span>
                  <span className="text-charcoal-400 ml-auto">
                    {activity.timestamp?.toDate
                      ? format(activity.timestamp.toDate(), 'MMM d, h:mm a')
                      : ''
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-charcoal-400 mt-8 print:mt-4">
          Generated by Content Strategy Portal
        </div>
      </div>
    </div>
  );
}
