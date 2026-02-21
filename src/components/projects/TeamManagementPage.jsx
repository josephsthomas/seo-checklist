import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Calendar, Edit2, Shield, Users, Info, UserPlus } from 'lucide-react';
import { USER_ROLES, ROLE_LABELS, hasPermission } from '../../utils/roles';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { logUserActivity } from '../../hooks/useActivityLog';

export default function TeamManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const { currentUser, userProfile } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    // Only admins can assign the admin role
    if (newRole === USER_ROLES.ADMIN && userProfile?.role !== USER_ROLES.ADMIN) {
      toast.error('Only administrators can assign the Admin role');
      return;
    }
    try {
      const targetUser = users.find(u => u.id === userId);
      const previousRole = targetUser?.role;

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });

      // Log role change to audit trail
      await logUserActivity(currentUser.uid, 'role_change', `Changed ${targetUser?.name || userId} role from ${ROLE_LABELS[previousRole] || previousRole} to ${ROLE_LABELS[newRole] || newRole}`, {
        targetUserId: userId,
        targetUserName: targetUser?.name || null,
        oldRole: previousRole,
        newRole,
        changedBy: currentUser.uid,
        changedByName: userProfile?.name || currentUser.email
      });

      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ));

      setEditingUser(null);
      toast.success('Role updated successfully');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check if current user has permission to manage team
  const canManageTeam = hasPermission(userProfile?.role, 'canManageTeam');

  if (!canManageTeam) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-purple-500" />
          </div>
          <h2 className="text-2xl font-bold text-charcoal-900 mb-3">Access Restricted</h2>
          <p className="text-charcoal-600 mb-6">
            Team management is available to Administrators and Project Managers.
            Contact your team admin if you need access.
          </p>
          <div className="p-4 bg-charcoal-50 rounded-lg text-left">
            <h4 className="text-sm font-semibold text-charcoal-700 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Your current role: {ROLE_LABELS[userProfile?.role] || 'Unknown'}
            </h4>
            <p className="text-sm text-charcoal-500">
              With this role, you can view and complete assigned tasks. To manage team members,
              ask an admin to update your role to Project Manager or Administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-charcoal-900 mb-2">Team Management</h1>
          <p className="text-charcoal-600">Manage team members and their roles</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-600">Total Members</p>
                <p className="text-3xl font-bold text-charcoal-900">{users.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-600">Admins</p>
                <p className="text-3xl font-bold text-purple-600">
                  {users.filter(u => u.role === USER_ROLES.ADMIN).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-600">Project Managers</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.role === USER_ROLES.PROJECT_MANAGER).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <User className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-charcoal-600">Team Members</p>
                <p className="text-3xl font-bold text-orange-600">
                  {users.filter(u =>
                    u.role !== USER_ROLES.ADMIN &&
                    u.role !== USER_ROLES.PROJECT_MANAGER &&
                    u.role !== USER_ROLES.CLIENT
                  ).length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <User className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Team List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {users.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-charcoal-100 to-charcoal-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No team members yet</h3>
              <p className="text-charcoal-600 mb-6 max-w-md mx-auto">
                Team members will appear here when they create an account and join your organization.
              </p>
              <div className="p-4 bg-charcoal-50 rounded-lg text-left max-w-md mx-auto">
                <h4 className="text-sm font-semibold text-charcoal-700 mb-2 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  How to add team members:
                </h4>
                <ul className="text-sm text-charcoal-600 space-y-1">
                  <li>1. Share the registration link with your team</li>
                  <li>2. They create an account using their work email</li>
                  <li>3. Update their role from this page once they join</li>
                </ul>
              </div>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-charcoal-200">
              <thead className="bg-charcoal-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-charcoal-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-charcoal-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <User className="w-5 h-5 text-primary-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-charcoal-900">
                            {user.name}
                            {user.id === currentUser.uid && (
                              <span className="ml-2 text-xs text-charcoal-500">(You)</span>
                            )}
                          </div>
                          <div className="text-sm text-charcoal-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                          className="input text-sm py-1"
                          autoFocus
                        >
                          {Object.entries(ROLE_LABELS)
                            .filter(([value]) => value !== USER_ROLES.ADMIN || userProfile?.role === USER_ROLES.ADMIN)
                            .map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === USER_ROLES.ADMIN
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === USER_ROLES.PROJECT_MANAGER
                            ? 'bg-green-100 text-green-800'
                            : user.role === USER_ROLES.CLIENT
                            ? 'bg-charcoal-100 text-charcoal-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {user.createdAt?.toDate
                          ? format(user.createdAt.toDate(), 'MMM d, yyyy')
                          : 'N/A'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {user.id !== currentUser.uid && (
                        <button
                          onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                          className="text-primary-600 hover:text-primary-700 flex items-center gap-1 ml-auto"
                        >
                          <Edit2 className="w-4 h-4" />
                          {editingUser === user.id ? 'Cancel' : 'Edit Role'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Role Permissions</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Administrator:</strong> Full access to all features and user management</p>
            <p><strong>Project Manager:</strong> Create projects, assign tasks, manage team</p>
            <p><strong>SEO Specialist / Developer / Content Writer:</strong> Complete assigned tasks, add comments</p>
            <p><strong>Client:</strong> Read-only access to their project progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}
