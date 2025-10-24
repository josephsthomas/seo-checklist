import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Settings, Archive } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = {
  'Planning': 'bg-blue-100 text-blue-800',
  'Active': 'bg-green-100 text-green-800',
  'On Hold': 'bg-yellow-100 text-yellow-800',
  'Completed': 'bg-purple-100 text-purple-800',
  'Archived': 'bg-gray-100 text-gray-800'
};

const TYPE_COLORS = {
  'Net New Site': 'bg-indigo-100 text-indigo-800',
  'Site Refresh': 'bg-cyan-100 text-cyan-800',
  'Campaign Landing Page': 'bg-pink-100 text-pink-800',
  'Microsite': 'bg-orange-100 text-orange-800'
};

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  // Calculate completion percentage (would come from checklist data in real implementation)
  const completionPercentage = 0; // Placeholder

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set';
    try {
      return format(timestamp.toDate(), 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
          <p className="text-sm text-gray-600">{project.clientName}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[project.status]}`}>
          {project.status}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${TYPE_COLORS[project.projectType]}`}>
          {project.projectType}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Launch: {formatDate(project.targetLaunchDate)}</span>
        </div>
        {project.teamMembers && project.teamMembers.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>{project.teamMembers.length} team members</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/projects/${project.id}`)}
          className="flex-1 btn btn-primary text-sm"
        >
          View Checklist
        </button>
        <button
          onClick={() => navigate(`/projects/${project.id}/settings`)}
          className="btn btn-secondary text-sm p-2"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
