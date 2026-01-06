import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMyTasks } from '../../hooks/useAssignments';
import { useProjects } from '../../hooks/useProjects';
import { checklistData } from '../../data/checklistData';
import { Calendar, Clock, AlertCircle, CheckCircle, Filter, ClipboardList, ArrowRight, Inbox, Search, RefreshCw } from 'lucide-react';
import { format, isAfter, isBefore, addDays, startOfDay } from 'date-fns';
import { TASK_STATUS_LABELS } from '../../utils/roles';

export default function MyTasksPage() {
  const { myTasks, loading: tasksLoading } = useMyTasks();
  const { projects, loading: projectsLoading } = useProjects();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDue, setFilterDue] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');

  // Enrich tasks with item and project data
  const enrichedTasks = useMemo(() => {
    return myTasks.map(task => {
      const item = checklistData.find(i => i.id === task.itemId);
      const project = projects.find(p => p.id === task.projectId);
      return {
        ...task,
        item,
        project
      };
    }).filter(task => task.item && task.project);
  }, [myTasks, projects]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...enrichedTasks];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Filter by due date
    const today = startOfDay(new Date());
    if (filterDue === 'overdue') {
      filtered = filtered.filter(task =>
        task.dueDate && isBefore(task.dueDate.toDate(), today)
      );
    } else if (filterDue === 'week') {
      const nextWeek = addDays(today, 7);
      filtered = filtered.filter(task =>
        task.dueDate &&
        isAfter(task.dueDate.toDate(), today) &&
        isBefore(task.dueDate.toDate(), nextWeek)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.toDate() - b.dueDate.toDate();
        case 'priority':
          const priorityOrder = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
          return priorityOrder[a.item.priority] - priorityOrder[b.item.priority];
        case 'project':
          return a.project.name.localeCompare(b.project.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [enrichedTasks, filterStatus, filterDue, sortBy]);

  // Calculate stats
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    return {
      total: enrichedTasks.length,
      dueToday: enrichedTasks.filter(t =>
        t.dueDate && format(t.dueDate.toDate(), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
      ).length,
      overdue: enrichedTasks.filter(t =>
        t.dueDate && isBefore(t.dueDate.toDate(), today)
      ).length,
      completedThisWeek: enrichedTasks.filter(t =>
        t.status === 'completed' &&
        t.updatedAt &&
        isAfter(t.updatedAt.toDate(), addDays(today, -7))
      ).length
    };
  }, [enrichedTasks]);

  const handleTaskClick = (task) => {
    navigate(`/projects/${task.projectId}?itemId=${task.itemId}`);
  };

  const getDueDateColor = (dueDate) => {
    if (!dueDate) return 'text-charcoal-500';
    const date = dueDate.toDate();
    const today = startOfDay(new Date());

    if (isBefore(date, today)) return 'text-red-600 font-semibold';
    if (isBefore(date, addDays(today, 3))) return 'text-orange-600 font-medium';
    return 'text-charcoal-700';
  };

  const priorityColors = {
    'CRITICAL': 'bg-red-100 text-red-800',
    'HIGH': 'bg-orange-100 text-orange-800',
    'MEDIUM': 'bg-yellow-100 text-yellow-800',
    'LOW': 'bg-blue-100 text-blue-800'
  };

  const statusColors = {
    'not_started': 'bg-charcoal-100 text-charcoal-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'in_review': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800'
  };

  if (tasksLoading || projectsLoading) {
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
          <h1 className="text-3xl font-bold text-charcoal-900 mb-2">My Tasks</h1>
          <p className="text-charcoal-600">Tasks assigned to you across all projects</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-600">Total Tasks</p>
                <p className="text-3xl font-bold text-charcoal-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-600">Due Today</p>
                <p className="text-3xl font-bold text-orange-600">{stats.dueToday}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-600">Overdue</p>
                <p className="text-3xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-600">Completed This Week</p>
                <p className="text-3xl font-bold text-green-600">{stats.completedThisWeek}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Due Date
              </label>
              <select
                value={filterDue}
                onChange={(e) => setFilterDue(e.target.value)}
                className="input"
              >
                <option value="all">All Tasks</option>
                <option value="overdue">Overdue</option>
                <option value="week">Due This Week</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="project">Project</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            {enrichedTasks.length === 0 ? (
              <>
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Inbox className="w-10 h-10 text-primary-500" />
                </div>
                <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                  No tasks assigned yet
                </h3>
                <p className="text-charcoal-600 mb-6 max-w-md mx-auto">
                  When team members assign tasks to you from content projects, they'll appear here.
                  You can also assign tasks to yourself from any project checklist.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/planner"
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <ClipboardList className="w-4 h-4" />
                    View Projects
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="mt-8 p-4 bg-charcoal-50 rounded-lg text-left max-w-md mx-auto">
                  <h4 className="text-sm font-semibold text-charcoal-700 mb-2">How to get tasks assigned:</h4>
                  <ul className="text-sm text-charcoal-600 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-0.5">1.</span>
                      Open a project from the Content Planner
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-0.5">2.</span>
                      Click on any checklist item to open details
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary-500 mt-0.5">3.</span>
                      Add your email in the "Assigned To" field
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-charcoal-400" />
                </div>
                <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                  No tasks match your filters
                </h3>
                <p className="text-charcoal-600 mb-6">
                  Try adjusting your filter criteria to see more tasks.
                </p>
                <button
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterDue('all');
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
          <div className="space-y-3">
            {filteredTasks.map((task, index) => (
              <div
                key={index}
                onClick={() => handleTaskClick(task)}
                className="bg-white rounded-lg shadow-sm border border-charcoal-200 p-4 hover:shadow-md hover:border-primary-300 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.item.priority]}`}>
                        {task.item.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[task.status]}`}>
                        {TASK_STATUS_LABELS[task.status]}
                      </span>
                      <span className="text-xs text-charcoal-500">#{task.item.id}</span>
                    </div>

                    <h3 className="text-charcoal-900 font-medium mb-1 line-clamp-2">
                      {task.item.item}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-600">
                      <span className="flex items-center gap-1">
                        <span className="font-medium">{task.project.name}</span>
                        <span className="text-charcoal-400">•</span>
                        <span>{task.item.phase}</span>
                      </span>

                      {task.dueDate && (
                        <span className={`flex items-center gap-1 ${getDueDateColor(task.dueDate)}`}>
                          <Calendar className="w-4 h-4" />
                          {format(task.dueDate.toDate(), 'MMM d, yyyy')}
                        </span>
                      )}

                      {task.estimatedHours && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {task.estimatedHours}h estimated
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                    className="btn btn-primary text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
