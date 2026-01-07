import { Link, useParams } from 'react-router-dom';
import {
  User,
  Mail,
  Building,
  Briefcase,
  Calendar,
  FolderOpen,
  Clock,
  CheckCircle2,
  Users,
  Settings,
  ArrowLeft,
  ExternalLink,
  Activity
} from 'lucide-react';
import { useUserProfile, useUserProjects, useUserActivityStats, useUserTeams } from '../../hooks/useUserProfile';
import { format } from 'date-fns';

/**
 * Stats Card Component
 */
function StatCard({ icon: Icon, label, value, color = 'primary', subtext }) {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-600',
    emerald: 'from-emerald-500 to-emerald-600',
    cyan: 'from-cyan-500 to-cyan-600',
    amber: 'from-amber-500 to-amber-600'
  };

  return (
    <div className="bg-white rounded-xl border border-charcoal-100 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
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
 * Project Card Component
 */
function ProjectCard({ project }) {
  const statusColors = {
    completed: 'bg-emerald-100 text-emerald-700',
    in_progress: 'bg-amber-100 text-amber-700',
    planning: 'bg-blue-100 text-blue-700',
    on_hold: 'bg-charcoal-100 text-charcoal-700'
  };

  const progress = project.progress || 0;

  return (
    <Link
      to={`/planner/projects/${project.id}`}
      className="block bg-white rounded-xl border border-charcoal-100 p-4 hover:border-charcoal-200 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="font-semibold text-charcoal-900 group-hover:text-primary-600 transition-colors">
          {project.name}
        </h4>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[project.status] || statusColors.planning}`}>
          {project.status?.replace('_', ' ') || 'Planning'}
        </span>
      </div>

      {project.description && (
        <p className="text-sm text-charcoal-500 mb-3 line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-sm font-medium text-charcoal-600">{progress}%</span>
      </div>
    </Link>
  );
}

/**
 * Loading Skeleton
 */
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-charcoal-200 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-charcoal-200 rounded" />
              <div className="h-4 w-32 bg-charcoal-100 rounded" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-24 bg-charcoal-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * User Profile Page
 */
export default function UserProfilePage() {
  const { userId } = useParams();
  const { profile, loading: profileLoading, error, isOwnProfile } = useUserProfile(userId);
  const { projects, loading: projectsLoading, stats: projectStats } = useUserProjects(userId, 6);
  const { stats: activityStats, loading: activityLoading } = useUserActivityStats(userId);
  const { teams, loading: teamsLoading } = useUserTeams(userId);

  if (profileLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-charcoal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-charcoal-400" />
          </div>
          <h2 className="text-xl font-semibold text-charcoal-900 mb-2">Profile Not Found</h2>
          <p className="text-charcoal-500 mb-4">This user profile doesn&apos;t exist or is not accessible.</p>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const joinDate = profile.createdAt?.toDate ? profile.createdAt.toDate() : new Date(profile.createdAt);

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-charcoal-600 hover:text-charcoal-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-charcoal-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center flex-shrink-0">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <User className="w-12 h-12 text-primary-600" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-charcoal-900">{profile.name}</h1>
                {isOwnProfile && (
                  <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                    You
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-charcoal-500">
                {profile.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center gap-1.5">
                    <Building className="w-4 h-4" />
                    {profile.company}
                  </div>
                )}
                {profile.jobTitle && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {profile.jobTitle}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-sm text-charcoal-400 mt-2">
                <Calendar className="w-4 h-4" />
                Member since {format(joinDate, 'MMMM yyyy')}
              </div>
            </div>

            {/* Actions */}
            {isOwnProfile && (
              <Link
                to="/app/settings"
                className="btn btn-secondary flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={FolderOpen}
            label="Projects"
            value={projectStats.total}
            color="primary"
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            value={projectStats.completed}
            color="emerald"
          />
          <StatCard
            icon={Activity}
            label="Activities"
            value={activityStats.totalActivities}
            color="cyan"
            subtext={`${activityStats.thisWeek} this week`}
          />
          <StatCard
            icon={Users}
            label="Teams"
            value={teams.length}
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-primary-500" />
                  Recent Projects
                </h2>
                {isOwnProfile && (
                  <Link
                    to="/app/planner"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    View All
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {projectsLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-24 bg-charcoal-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
                  <p className="text-charcoal-500">No projects yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Activity Summary */}
            <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
              <h2 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-cyan-500" />
                Activity Summary
              </h2>

              {activityLoading ? (
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-8 bg-charcoal-50 rounded animate-pulse" />
                  ))}
                </div>
              ) : Object.keys(activityStats.byType).length === 0 ? (
                <p className="text-charcoal-500 text-sm">No activity recorded</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(activityStats.byType)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between text-sm">
                        <span className="text-charcoal-600 capitalize">
                          {type.replace(/\./g, ' ').replace(/_/g, ' ')}
                        </span>
                        <span className="font-medium text-charcoal-900">{count}</span>
                      </div>
                    ))}
                </div>
              )}

              {isOwnProfile && (
                <Link
                  to="/app/activity"
                  className="block mt-4 text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  View Full Activity
                </Link>
              )}
            </div>

            {/* Teams */}
            <div className="bg-white rounded-2xl border border-charcoal-100 p-6">
              <h2 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-amber-500" />
                Team Memberships
              </h2>

              {teamsLoading ? (
                <div className="space-y-2">
                  {[1,2].map(i => (
                    <div key={i} className="h-12 bg-charcoal-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : teams.length === 0 ? (
                <p className="text-charcoal-500 text-sm">Not a member of any teams</p>
              ) : (
                <div className="space-y-2">
                  {teams.slice(0, 5).map(team => (
                    <Link
                      key={team.projectId}
                      to={`/planner/projects/${team.projectId}`}
                      className="flex items-center justify-between p-3 bg-charcoal-50 rounded-xl hover:bg-charcoal-100 transition-colors"
                    >
                      <span className="text-sm font-medium text-charcoal-900 truncate">
                        {team.projectName}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        team.role === 'Owner'
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-charcoal-200 text-charcoal-600'
                      }`}>
                        {team.role}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
