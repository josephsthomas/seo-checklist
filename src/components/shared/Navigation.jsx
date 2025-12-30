import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  FolderOpen,
  User,
  LogOut,
  Menu,
  X,
  CheckSquare,
  Users,
  HelpCircle,
  ChevronDown,
  ClipboardList,
  Search,
  Wrench
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { hasPermission } from '../../utils/roles';

export default function Navigation() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpMenuOpen, setHelpMenuOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => location.pathname === path;
  const isToolActive = (toolPath) => location.pathname.startsWith(toolPath);

  if (!currentUser) return null;

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand - Links to Home */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-primary hidden sm:block">
              Flipside SEO Portal
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Home Link */}
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                ${isActive('/')
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            {/* Tools Dropdown */}
            <div className="relative">
              <button
                onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors
                  ${isToolActive('/planner') || isToolActive('/audit')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
              >
                <Wrench className="w-5 h-5" />
                <span>Tools</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {toolsMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setToolsMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-300 z-50">
                    <Link
                      to="/planner"
                      onClick={() => setToolsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b ${
                        isToolActive('/planner') ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                        <ClipboardList className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">SEO Planner</div>
                        <div className="text-xs text-gray-600">321-item checklist</div>
                      </div>
                    </Link>
                    <Link
                      to="/audit"
                      onClick={() => setToolsMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                        isToolActive('/audit') ? 'bg-cyan-50' : ''
                      }`}
                    >
                      <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                        <Search className="w-4 h-4 text-cyan-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Technical Audit</div>
                        <div className="text-xs text-gray-600">Screaming Frog analyzer</div>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </div>

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
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-300 z-50">
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
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors
                  ${isActive('/')
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>

              {/* Mobile Tools Section */}
              <div className="px-4 py-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Tools</p>
                <Link
                  to="/planner"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors mb-1
                    ${isToolActive('/planner')
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <ClipboardList className="w-5 h-5" />
                  <span>SEO Planner</span>
                </Link>
                <Link
                  to="/audit"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                    ${isToolActive('/audit')
                      ? 'bg-cyan-100 text-cyan-700'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Search className="w-5 h-5" />
                  <span>Technical Audit</span>
                </Link>
              </div>

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
