import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { Plus, Search, Calendar, TrendingUp, AlertCircle, FolderOpen, CheckCircle, ClipboardList, Users, RefreshCw, HelpCircle, Lightbulb, BarChart3 } from 'lucide-react';
import ProjectCard from './ProjectCard';
import { format } from 'date-fns';

export default function ProjectDashboard() {
  const { projects, loading } = useProjects();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Calculate stats
  const stats = useMemo(() => {
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedThisMonth = projects.filter(p => {
      if (p.status !== 'Completed' || !p.actualLaunchDate) return false;
      const launchDate = p.actualLaunchDate.toDate();
      const now = new Date();
      return launchDate.getMonth() === now.getMonth() &&
             launchDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      totalActive: activeProjects,
      completedThisMonth,
      totalProjects: projects.length
    };
  }, [projects]);

  // Filter projects with enhanced search
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // Enhanced search across multiple fields
      if (searchQuery !== '') {
        const query = searchQuery.toLowerCase().trim();
        const searchableFields = [
          project.name || '',
          project.clientName || '',
          project.description || '',
          project.projectType || '',
          project.status || ''
        ].map(field => field.toLowerCase());

        const matchesSearch = searchableFields.some(field => field.includes(query));
        if (!matchesSearch) return false;
      }

      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
      const matchesType = filterType === 'all' || project.projectType === filterType;

      return matchesStatus && matchesType;
    });
  }, [projects, searchQuery, filterStatus, filterType]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-charcoal-900">Content Planner</h1>
              <p className="text-charcoal-600 mt-1">Manage your content projects and checklists</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/planner/progress"
                className="btn btn-secondary flex items-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="hidden sm:inline">Progress Dashboard</span>
              </Link>
              <button
                onClick={() => navigate('/planner/new')}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                New Project
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Active Projects</p>
                  <p className="text-3xl font-bold text-primary-600">{stats.totalActive}</p>
                </div>
                <div className="p-3 bg-primary-100 rounded-full">
                  <FolderOpen className="w-6 h-6 text-primary-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Completed This Month</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedThisMonth}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-charcoal-600">Total Projects</p>
                  <p className="text-3xl font-bold text-charcoal-900">{stats.totalProjects}</p>
                </div>
                <div className="p-3 bg-charcoal-100 rounded-full">
                  <Calendar className="w-6 h-6 text-charcoal-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search projects, clients, descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input md:w-48"
            >
              <option value="all">All Status</option>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Archived">Archived</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input md:w-48"
            >
              <option value="all">All Types</option>
              <option value="Net New Site">Net New Site</option>
              <option value="Site Refresh">Site Refresh</option>
              <option value="Campaign Landing Page">Campaign Landing Page</option>
              <option value="Microsite">Microsite</option>
            </select>
          </div>
        </div>

        {/* Projects List */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            {projects.length === 0 ? (
              <>
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ClipboardList className="w-10 h-10 text-primary-500" />
                </div>
                <h3 className="text-xl font-bold text-charcoal-900 mb-2">Welcome to Content Planner</h3>
                <p className="text-charcoal-600 mb-6 max-w-md mx-auto">
                  Create your first project to access the comprehensive 321-item content checklist
                  and start tracking your optimization progress.
                </p>
                <button
                  onClick={() => navigate('/planner/new')}
                  className="btn btn-primary inline-flex items-center gap-2 mb-8"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Project
                </button>

                {/* What you get section */}
                <div className="bg-charcoal-50 rounded-xl p-6 max-w-2xl mx-auto text-left">
                  <h4 className="text-sm font-semibold text-charcoal-700 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    What's included in each project:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { icon: CheckCircle, text: '321-item SEO checklist', color: 'text-emerald-500' },
                      { icon: ClipboardList, text: 'Organized by project phase', color: 'text-primary-500' },
                      { icon: Users, text: 'Team task assignment', color: 'text-purple-500' },
                      { icon: Calendar, text: 'Timeline & deadline tracking', color: 'text-cyan-500' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-charcoal-600">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gradient-to-br from-charcoal-100 to-charcoal-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-charcoal-400" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 mb-2">No projects found</h3>
                <p className="text-charcoal-600 mb-6">
                  No projects match your current search or filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                    setFilterType('all');
                  }}
                  className="btn btn-secondary inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear All Filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
