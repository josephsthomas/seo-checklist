import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Settings, Archive } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS = {
  'Planning': 'bg-primary-100 text-primary-700',
  'Active': 'bg-emerald-100 text-emerald-700',
  'On Hold': 'bg-amber-100 text-amber-700',
  'Completed': 'bg-purple-100 text-purple-700',
  'Archived': 'bg-charcoal-100 text-charcoal-600'
};

const TYPE_COLORS = {
  'Net New Site': 'bg-indigo-100 text-indigo-700',
  'Site Refresh': 'bg-cyan-100 text-cyan-700',
  'Campaign Landing Page': 'bg-pink-100 text-pink-700',
  'Microsite': 'bg-orange-100 text-orange-700'
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
    <article className="card card-hover p-6" aria-labelledby={`project-${project.id}-title`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 id={`project-${project.id}-title`} className="text-lg font-semibold text-charcoal-900 mb-1">{project.name}</h3>
          <p className="text-sm text-charcoal-600">{project.clientName}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`badge ${STATUS_COLORS[project.status]}`}>
          {project.status}
        </span>
        <span className={`badge ${TYPE_COLORS[project.projectType]}`}>
          {project.projectType}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-charcoal-600 mb-1">
          <span>Progress</span>
          <span aria-label={`${completionPercentage} percent complete`}>{completionPercentage}%</span>
        </div>
        <div className="w-full bg-charcoal-200 rounded-full h-2" role="progressbar" aria-valuenow={completionPercentage} aria-valuemin="0" aria-valuemax="100">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-charcoal-600">
          <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
          <span>Launch: {formatDate(project.targetLaunchDate)}</span>
        </div>
        {project.teamMembers && project.teamMembers.length > 0 && (
          <div className="flex items-center text-sm text-charcoal-600">
            <Users className="w-4 h-4 mr-2" aria-hidden="true" />
            <span>{project.teamMembers.length} team members</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/planner/projects/${project.id}`)}
          className="flex-1 btn btn-primary text-sm"
        >
          View Checklist
        </button>
        <button
          onClick={() => navigate(`/planner/projects/${project.id}/settings`)}
          className="btn btn-secondary text-sm p-2"
          aria-label={`Settings for ${project.name}`}
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
