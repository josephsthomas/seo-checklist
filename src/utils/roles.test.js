import { describe, it, expect } from 'vitest';
import {
  USER_ROLES,
  ROLE_PERMISSIONS,
  ROLE_LABELS,
  hasPermission,
  canManageProject,
  TASK_STATUS,
  TASK_STATUS_LABELS,
  NOTIFICATION_TYPES
} from './roles';

describe('roles', () => {
  describe('USER_ROLES', () => {
    it('should define all user roles', () => {
      expect(USER_ROLES.ADMIN).toBe('admin');
      expect(USER_ROLES.PROJECT_MANAGER).toBe('project_manager');
      expect(USER_ROLES.SEO_SPECIALIST).toBe('seo_specialist');
      expect(USER_ROLES.DEVELOPER).toBe('developer');
      expect(USER_ROLES.CONTENT_WRITER).toBe('content_writer');
      expect(USER_ROLES.CLIENT).toBe('client');
    });
  });

  describe('ROLE_PERMISSIONS', () => {
    it('should give admin all permissions', () => {
      const adminPerms = ROLE_PERMISSIONS[USER_ROLES.ADMIN];

      expect(adminPerms.canCreateProjects).toBe(true);
      expect(adminPerms.canDeleteProjects).toBe(true);
      expect(adminPerms.canManageUsers).toBe(true);
      expect(adminPerms.canAssignTasks).toBe(true);
      expect(adminPerms.canEditAllItems).toBe(true);
      expect(adminPerms.canViewAllProjects).toBe(true);
      expect(adminPerms.canExport).toBe(true);
      expect(adminPerms.canManageTeam).toBe(true);
      expect(adminPerms.canViewInternal).toBe(true);
    });

    it('should restrict client permissions', () => {
      const clientPerms = ROLE_PERMISSIONS[USER_ROLES.CLIENT];

      expect(clientPerms.canCreateProjects).toBe(false);
      expect(clientPerms.canDeleteProjects).toBe(false);
      expect(clientPerms.canManageUsers).toBe(false);
      expect(clientPerms.canAssignTasks).toBe(false);
      expect(clientPerms.canEditAllItems).toBe(false);
      expect(clientPerms.canViewAllProjects).toBe(false);
      expect(clientPerms.canExport).toBe(false);
      expect(clientPerms.canManageTeam).toBe(false);
      expect(clientPerms.canViewInternal).toBe(false);
    });

    it('should allow project manager limited permissions', () => {
      const pmPerms = ROLE_PERMISSIONS[USER_ROLES.PROJECT_MANAGER];

      expect(pmPerms.canCreateProjects).toBe(true);
      expect(pmPerms.canDeleteProjects).toBe(false);
      expect(pmPerms.canManageUsers).toBe(false);
      expect(pmPerms.canAssignTasks).toBe(true);
      expect(pmPerms.canManageTeam).toBe(true);
    });

    it('should allow SEO specialist to export', () => {
      const seoPerms = ROLE_PERMISSIONS[USER_ROLES.SEO_SPECIALIST];

      expect(seoPerms.canExport).toBe(true);
      expect(seoPerms.canCreateProjects).toBe(false);
    });
  });

  describe('ROLE_LABELS', () => {
    it('should provide human-readable labels', () => {
      expect(ROLE_LABELS[USER_ROLES.ADMIN]).toBe('Administrator');
      expect(ROLE_LABELS[USER_ROLES.PROJECT_MANAGER]).toBe('Project Manager');
      expect(ROLE_LABELS[USER_ROLES.SEO_SPECIALIST]).toBe('SEO Specialist');
      expect(ROLE_LABELS[USER_ROLES.DEVELOPER]).toBe('Developer');
      expect(ROLE_LABELS[USER_ROLES.CONTENT_WRITER]).toBe('Content Writer');
      expect(ROLE_LABELS[USER_ROLES.CLIENT]).toBe('Client');
    });
  });

  describe('hasPermission', () => {
    it('should return true when role has permission', () => {
      expect(hasPermission(USER_ROLES.ADMIN, 'canCreateProjects')).toBe(true);
      expect(hasPermission(USER_ROLES.PROJECT_MANAGER, 'canAssignTasks')).toBe(true);
    });

    it('should return false when role lacks permission', () => {
      expect(hasPermission(USER_ROLES.CLIENT, 'canCreateProjects')).toBe(false);
      expect(hasPermission(USER_ROLES.SEO_SPECIALIST, 'canDeleteProjects')).toBe(false);
    });

    it('should return false for invalid role', () => {
      expect(hasPermission('invalid_role', 'canCreateProjects')).toBe(false);
    });

    it('should return false for invalid permission', () => {
      expect(hasPermission(USER_ROLES.ADMIN, 'invalidPermission')).toBe(false);
    });
  });

  describe('canManageProject', () => {
    const project = {
      id: 'project-1',
      ownerId: 'user-owner',
      teamMembers: ['user-team-1', 'user-team-2']
    };

    it('should allow admin to manage any project', () => {
      expect(canManageProject(USER_ROLES.ADMIN, project, 'user-random')).toBe(true);
    });

    it('should allow project manager to manage owned project', () => {
      expect(canManageProject(USER_ROLES.PROJECT_MANAGER, project, 'user-owner')).toBe(true);
    });

    it('should not allow project manager to manage unowned project', () => {
      expect(canManageProject(USER_ROLES.PROJECT_MANAGER, project, 'user-random')).toBe(false);
    });

    it('should allow team members to manage project', () => {
      expect(canManageProject(USER_ROLES.SEO_SPECIALIST, project, 'user-team-1')).toBe(true);
      expect(canManageProject(USER_ROLES.DEVELOPER, project, 'user-team-2')).toBe(true);
    });

    it('should not allow non-team members to manage project', () => {
      expect(canManageProject(USER_ROLES.SEO_SPECIALIST, project, 'user-random')).toBe(false);
    });

    it('should handle project without team members', () => {
      const projectNoTeam = { id: 'project-2', ownerId: 'user-owner' };
      expect(canManageProject(USER_ROLES.SEO_SPECIALIST, projectNoTeam, 'user-random')).toBe(false);
    });
  });

  describe('TASK_STATUS', () => {
    it('should define all task statuses', () => {
      expect(TASK_STATUS.NOT_STARTED).toBe('not_started');
      expect(TASK_STATUS.IN_PROGRESS).toBe('in_progress');
      expect(TASK_STATUS.IN_REVIEW).toBe('in_review');
      expect(TASK_STATUS.COMPLETED).toBe('completed');
    });
  });

  describe('TASK_STATUS_LABELS', () => {
    it('should provide human-readable status labels', () => {
      expect(TASK_STATUS_LABELS[TASK_STATUS.NOT_STARTED]).toBe('Not Started');
      expect(TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS]).toBe('In Progress');
      expect(TASK_STATUS_LABELS[TASK_STATUS.IN_REVIEW]).toBe('In Review');
      expect(TASK_STATUS_LABELS[TASK_STATUS.COMPLETED]).toBe('Completed');
    });
  });

  describe('NOTIFICATION_TYPES', () => {
    it('should define all notification types', () => {
      expect(NOTIFICATION_TYPES.TASK_ASSIGNED).toBe('task_assigned');
      expect(NOTIFICATION_TYPES.MENTIONED).toBe('mentioned');
      expect(NOTIFICATION_TYPES.TASK_OVERDUE).toBe('task_overdue');
      expect(NOTIFICATION_TYPES.BLOCKER_ALERT).toBe('blocker_alert');
      expect(NOTIFICATION_TYPES.PROJECT_MILESTONE).toBe('project_milestone');
      expect(NOTIFICATION_TYPES.COMMENT_REPLY).toBe('comment_reply');
      expect(NOTIFICATION_TYPES.TASK_COMPLETED).toBe('task_completed');
    });
  });
});
