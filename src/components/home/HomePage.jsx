import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import ToolCard from './ToolCard';
import {
  ClipboardList,
  Search,
  BarChart3,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function HomePage() {
  const { userProfile } = useAuth();
  const { projects, loading: projectsLoading } = useProjects();

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {userProfile?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Welcome to the Flipside SEO Portal. Select a tool below to get started.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
              <p className="text-xs text-gray-500">Total Projects</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeProjects}</p>
              <p className="text-xs text-gray-500">Active Projects</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-xs text-gray-500">Technical Audits</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedProjects}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">SEO Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* SEO Planner Tool */}
          <ToolCard
            icon={ClipboardList}
            title="SEO Planner"
            description="Comprehensive 321-item SEO checklist for website launches and refreshes. Track progress, assign tasks, and ensure nothing is missed."
            path="/planner"
            color="primary"
            stats={[
              { value: activeProjects, label: 'Active' },
              { value: completedProjects, label: 'Completed' }
            ]}
            badge={totalProjects > 0 ? `${totalProjects} Projects` : null}
          />

          {/* Technical Audit Tool */}
          <ToolCard
            icon={Search}
            title="Technical Audit Tool"
            description="Upload Screaming Frog exports to generate comprehensive technical SEO audits with AI-powered recommendations."
            path="/audit"
            color="cyan"
            stats={[
              { value: 0, label: 'Audits' },
              { value: '31', label: 'Categories' }
            ]}
            badge="New"
          />

          {/* Future Tools - Coming Soon */}
          <ToolCard
            icon={BarChart3}
            title="Analytics Dashboard"
            description="Unified analytics view combining data from Google Analytics, Search Console, and other sources."
            color="purple"
            comingSoon={true}
          />

          <ToolCard
            icon={FileText}
            title="Content Optimizer"
            description="AI-powered content analysis and optimization recommendations for better search rankings."
            color="emerald"
            comingSoon={true}
          />
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Projects</h3>
            <a href="/planner" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </a>
          </div>

          {projectsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <a
                  key={project.id}
                  href={`/planner/projects/${project.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={`w-3 h-3 rounded-full ${
                    project.status === 'Active' ? 'bg-emerald-500' :
                    project.status === 'Completed' ? 'bg-primary-500' :
                    project.status === 'On Hold' ? 'bg-amber-500' :
                    'bg-gray-300'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.clientName}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                    project.status === 'Completed' ? 'bg-primary-100 text-primary-700' :
                    project.status === 'On Hold' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {project.status}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No projects yet</p>
              <a href="/planner/new" className="text-primary-600 text-sm hover:text-primary-700">
                Create your first project
              </a>
            </div>
          )}
        </div>

        {/* Recent Audits */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Audits</h3>
            <a href="/audit" className="text-sm text-cyan-600 hover:text-cyan-700">
              View all
            </a>
          </div>

          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No audits yet</p>
            <a href="/audit" className="text-cyan-600 text-sm hover:text-cyan-700">
              Run your first technical audit
            </a>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-8 bg-gradient-to-r from-primary-50 to-cyan-50 rounded-xl border border-primary-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Quick Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Use the <strong>SEO Planner</strong> to track progress on website launches and refreshes</li>
              <li>Upload <strong>Screaming Frog exports</strong> to the Technical Audit Tool for instant analysis</li>
              <li>Press <kbd className="px-1.5 py-0.5 bg-white rounded border text-xs">?</kbd> anywhere to view keyboard shortcuts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
