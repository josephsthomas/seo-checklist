import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import { useAudits } from '../../hooks/useAudits';
import { getVisibleTools, TOOL_STATUS } from '../../config/tools';
import ToolCard from './ToolCard';
import { SkeletonStatCard, SkeletonToolCard, SkeletonProjectList } from '../shared/Skeleton';
import {
  ClipboardList,
  Search,
  TrendingUp,
  CheckCircle2,
  Lightbulb,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

export default function HomePage() {
  const { userProfile } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();
  const { audits, loading: auditsLoading, stats: auditStats } = useAudits();

  // Calculate SEO Planner stats
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const totalProjects = projects.length;

  // Get current greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get recent projects for activity feed
  const recentProjects = projects.slice(0, 3);
  const recentAudits = audits.slice(0, 3);

  // Get tools from centralized config with dynamic stats
  const tools = getVisibleTools();

  // Map tool stats dynamically
  const getToolStats = (tool) => {
    if (tool.id === 'planner') {
      return [
        { value: activeProjects, label: 'Active' },
        { value: completedProjects, label: 'Done' }
      ];
    }
    if (tool.id === 'audit') {
      return [
        { value: auditStats.total, label: 'Audits' },
        { value: '31', label: 'Categories' }
      ];
    }
    return [];
  };

  // Get dynamic badge for tools
  const getToolBadge = (tool) => {
    if (tool.id === 'planner' && totalProjects > 0) {
      return `${totalProjects} Projects`;
    }
    return tool.badge;
  };

  const isLoading = projectsLoading || auditsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Welcome Header */}
          <div className="mb-10">
            <div className="flex items-center gap-2 text-sm text-charcoal-500 mb-2">
              <time dateTime={new Date().toISOString()}>
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </time>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal-900 mb-3">
              {getGreeting()},{' '}
              <span className="text-gradient-primary">
                {userProfile?.name?.split(' ')[0] || 'there'}
              </span>
            </h1>
            <p className="text-lg text-charcoal-600 max-w-2xl">
              Welcome to the Flipside SEO Portal. Your all-in-one hub for SEO planning, technical audits, and optimization.
            </p>
          </div>

          {/* Quick Stats Overview */}
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonStatCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12" role="region" aria-label="Dashboard statistics">
              <div className="card p-5 group hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform" aria-hidden="true">
                    <ClipboardList className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-charcoal-900">{totalProjects}</p>
                    <p className="text-sm text-charcoal-500">Total Projects</p>
                  </div>
                </div>
              </div>

              <div className="card p-5 group hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform" aria-hidden="true">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-charcoal-900">{activeProjects}</p>
                    <p className="text-sm text-charcoal-500">Active Projects</p>
                  </div>
                </div>
              </div>

              <div className="card p-5 group hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform" aria-hidden="true">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-charcoal-900">{auditStats.total}</p>
                    <p className="text-sm text-charcoal-500">Technical Audits</p>
                  </div>
                </div>
              </div>

              <div className="card p-5 group hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform" aria-hidden="true">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-charcoal-900">{completedProjects}</p>
                    <p className="text-sm text-charcoal-500">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Tools Section */}
        <section className="mb-12" aria-labelledby="tools-heading">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 id="tools-heading" className="text-2xl font-bold text-charcoal-900">SEO Tools</h2>
              <p className="text-charcoal-500 mt-1">Professional tools for SEO excellence</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonToolCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  icon={tool.icon}
                  title={tool.name}
                  description={tool.description}
                  path={tool.path}
                  color={tool.color}
                  comingSoon={tool.status === TOOL_STATUS.COMING_SOON}
                  stats={getToolStats(tool)}
                  badge={getToolBadge(tool)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Recent Activity Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12" aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="sr-only">Recent Activity</h2>

          {/* Recent Projects */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-charcoal-900">Recent Projects</h3>
              <Link
                to="/planner"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 group"
              >
                View all
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </div>

            {projectsLoading ? (
              <SkeletonProjectList count={3} />
            ) : recentProjects.length > 0 ? (
              <ul className="space-y-2" role="list">
                {recentProjects.map((project) => (
                  <li key={project.id}>
                    <Link
                      to={`/planner/projects/${project.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-charcoal-50 transition-colors group"
                    >
                      <span
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          project.status === 'Active' ? 'bg-emerald-500' :
                          project.status === 'Completed' ? 'bg-primary-500' :
                          project.status === 'On Hold' ? 'bg-amber-500' :
                          'bg-charcoal-300'
                        }`}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal-900 truncate group-hover:text-primary-600 transition-colors">
                          {project.name}
                        </p>
                        <p className="text-sm text-charcoal-500">{project.clientName}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        project.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        project.status === 'Completed' ? 'bg-primary-100 text-primary-700' :
                        project.status === 'On Hold' ? 'bg-amber-100 text-amber-700' :
                        'bg-charcoal-100 text-charcoal-600'
                      }`}>
                        {project.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-charcoal-100 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                  <ClipboardList className="w-8 h-8 text-charcoal-400" />
                </div>
                <p className="text-charcoal-600 font-medium mb-1">No projects yet</p>
                <p className="text-sm text-charcoal-500 mb-4">Create your first project to get started</p>
                <Link
                  to="/planner/new"
                  className="btn btn-primary inline-flex"
                >
                  Create Project
                </Link>
              </div>
            )}
          </div>

          {/* Recent Audits */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-charcoal-900">Recent Audits</h3>
              <Link
                to="/audit"
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-1 group"
              >
                View all
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </div>

            {auditsLoading ? (
              <SkeletonProjectList count={3} />
            ) : recentAudits.length > 0 ? (
              <ul className="space-y-2" role="list">
                {recentAudits.map((audit) => (
                  <li key={audit.id}>
                    <Link
                      to={`/audit/${audit.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-charcoal-50 transition-colors group"
                    >
                      <span
                        className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          audit.healthScore >= 80 ? 'bg-emerald-500' :
                          audit.healthScore >= 60 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        aria-hidden="true"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal-900 truncate group-hover:text-cyan-600 transition-colors">
                          {audit.domain}
                        </p>
                        <p className="text-sm text-charcoal-500">
                          {audit.urlCount?.toLocaleString()} URLs analyzed
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        audit.healthScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                        audit.healthScore >= 60 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {audit.healthScore}%
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                  <Search className="w-8 h-8 text-cyan-500" />
                </div>
                <p className="text-charcoal-600 font-medium mb-1">No audits yet</p>
                <p className="text-sm text-charcoal-500 mb-4">Run your first technical SEO audit</p>
                <Link
                  to="/audit"
                  className="btn bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white inline-flex"
                >
                  Start Audit
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Quick Tips */}
        <section className="card overflow-hidden" aria-labelledby="tips-heading">
          <div className="bg-gradient-to-r from-primary-500 via-cyan-500 to-purple-500 p-[1px]">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/20" aria-hidden="true">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 id="tips-heading" className="font-bold text-charcoal-900">Quick Tips</h3>
                    <span className="badge badge-primary">
                      <Sparkles className="w-3 h-3 mr-1" aria-hidden="true" />
                      Pro Tips
                    </span>
                  </div>
                  <ul className="text-sm text-charcoal-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-1" aria-hidden="true">•</span>
                      Use the <strong className="text-charcoal-900">SEO Planner</strong> to track progress on website launches and refreshes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-500 mt-1" aria-hidden="true">•</span>
                      Upload <strong className="text-charcoal-900">Screaming Frog exports</strong> to the Technical Audit Tool for instant analysis
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1" aria-hidden="true">•</span>
                      Press{' '}
                      <kbd className="px-2 py-1 bg-charcoal-100 rounded-lg text-xs font-mono font-medium text-charcoal-700 border border-charcoal-200">
                        ?
                      </kbd>{' '}
                      anywhere to view keyboard shortcuts
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
