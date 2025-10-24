// User role definitions and permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  PROJECT_MANAGER: 'project_manager',
  SEO_SPECIALIST: 'seo_specialist',
  DEVELOPER: 'developer',
  CONTENT_WRITER: 'content_writer',
  CLIENT: 'client'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: {
    canCreateProjects: true,
    canDeleteProjects: true,
    canManageUsers: true,
    canAssignTasks: true,
    canEditAllItems: true,
    canViewAllProjects: true,
    canExport: true,
    canManageTeam: true,
    canViewInternal: true
  },
  [USER_ROLES.PROJECT_MANAGER]: {
    canCreateProjects: true,
    canDeleteProjects: false,
    canManageUsers: false,
    canAssignTasks: true,
    canEditAllItems: true,
    canViewAllProjects: true,
    canExport: true,
    canManageTeam: true,
    canViewInternal: true
  },
  [USER_ROLES.SEO_SPECIALIST]: {
    canCreateProjects: false,
    canDeleteProjects: false,
    canManageUsers: false,
    canAssignTasks: false,
    canEditAllItems: false,
    canViewAllProjects: false,
    canExport: true,
    canManageTeam: false,
    canViewInternal: true
  },
  [USER_ROLES.DEVELOPER]: {
    canCreateProjects: false,
    canDeleteProjects: false,
    canManageUsers: false,
    canAssignTasks: false,
    canEditAllItems: false,
    canViewAllProjects: false,
    canExport: true,
    canManageTeam: false,
    canViewInternal: true
  },
  [USER_ROLES.CONTENT_WRITER]: {
    canCreateProjects: false,
    canDeleteProjects: false,
    canManageUsers: false,
    canAssignTasks: false,
    canEditAllItems: false,
    canViewAllProjects: false,
    canExport: true,
    canManageTeam: false,
    canViewInternal: true
  },
  [USER_ROLES.CLIENT]: {
    canCreateProjects: false,
    canDeleteProjects: false,
    canManageUsers: false,
    canAssignTasks: false,
    canEditAllItems: false,
    canViewAllProjects: false,
    canExport: false,
    canManageTeam: false,
    canViewInternal: false
  }
};

export const ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.PROJECT_MANAGER]: 'Project Manager',
  [USER_ROLES.SEO_SPECIALIST]: 'SEO Specialist',
  [USER_ROLES.DEVELOPER]: 'Developer',
  [USER_ROLES.CONTENT_WRITER]: 'Content Writer',
  [USER_ROLES.CLIENT]: 'Client'
};

export function hasPermission(userRole, permission) {
  return ROLE_PERMISSIONS[userRole]?.[permission] || false;
}

export function canManageProject(userRole, project, userId) {
  if (userRole === USER_ROLES.ADMIN) return true;
  if (userRole === USER_ROLES.PROJECT_MANAGER && project.ownerId === userId) return true;
  if (project.teamMembers?.includes(userId)) return true;
  return false;
}

// Task status options
export const TASK_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  IN_REVIEW: 'in_review',
  COMPLETED: 'completed'
};

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.NOT_STARTED]: 'Not Started',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.IN_REVIEW]: 'In Review',
  [TASK_STATUS.COMPLETED]: 'Completed'
};

// Notification types
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  MENTIONED: 'mentioned',
  TASK_OVERDUE: 'task_overdue',
  BLOCKER_ALERT: 'blocker_alert',
  PROJECT_MILESTONE: 'project_milestone',
  COMMENT_REPLY: 'comment_reply',
  TASK_COMPLETED: 'task_completed'
};
