import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Home, FolderOpen, User, LogOut, Menu, X, CheckSquare, Users, HelpCircle, ChevronDown } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { hasPermission } from '../../utils/roles';

export default function Navigation() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  if (!currentUser) return null;

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link to="/projects" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              SEO Checklist Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/projects"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                ${isActive('/projects')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <FolderOpen className="w-5 h-5" />
              <span>Projects</span>
            </Link>

            <Link
              to="/my-tasks"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                ${isActive('/my-tasks')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <CheckSquare className="w-5 h-5" />
              <span>My Tasks</span>
            </Link>

            {hasPermission(userProfile?.role, 'canManageTeam') && (
              <Link
                to="/team"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                  ${isActive('/team')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Users className="w-5 h-5" />
                <span>Team</span>
              </Link>
            )}

            {/* Notifications */}
            <NotificationPanel />

            {/* Help Menu */}
            <div className="relative">
              <button
                onClick={() => setHelpMenuOpen(!helpMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                <span>Help</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {helpMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setHelpMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <Link
                      to="/help/resources"
                      onClick={() => setHelpMenuOpen(false)}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b"
                    >
                      <div className="font-medium text-gray-900">Resource Library</div>
                      <div className="text-xs text-gray-600">Guides & tutorials</div>
                    </Link>
                    <Link
                      to="/help/glossary"
                      onClick={() => setHelpMenuOpen(false)}
                      className="block px-4 py-3 hover:bg-gray-50 transition-colors border-b"
                    >
                      <div className="font-medium text-gray-900">SEO Glossary</div>
                      <div className="text-xs text-gray-600">Term definitions</div>
                    </Link>
                    <button
                      onClick={() => {
                        setHelpMenuOpen(false);
                        // Trigger keyboard shortcuts panel
                        window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
                      }}
                      className="block w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">Keyboard Shortcuts</div>
                      <div className="text-xs text-gray-600">Press ? to view</div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {userProfile?.name || currentUser.displayName || currentUser.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {userProfile?.role?.replace('_', ' ') || 'User'}
                </p>
              </div>

              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              <Link
                to="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors
                  ${isActive('/projects')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <FolderOpen className="w-5 h-5" />
                <span>Projects</span>
              </Link>

              <Link
                to="/my-tasks"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors
                  ${isActive('/my-tasks')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <CheckSquare className="w-5 h-5" />
                <span>My Tasks</span>
              </Link>

              {hasPermission(userProfile?.role, 'canManageTeam') && (
                <Link
                  to="/team"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors
                    ${isActive('/team')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Users className="w-5 h-5" />
                  <span>Team</span>
                </Link>
              )}

              <div className="px-4 py-3 border-t mt-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {userProfile?.name || currentUser.displayName || currentUser.email}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userProfile?.role?.replace('_', ' ') || 'User'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
