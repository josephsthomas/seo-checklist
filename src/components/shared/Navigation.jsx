import React, { useState, useRef, useEffect } from 'react';
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
  Wrench,
  Sparkles
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
  const toolsRef = useRef(null);
  const helpRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (toolsRef.current && !toolsRef.current.contains(event.target)) {
        setToolsMenuOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target)) {
        setHelpMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <nav
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-charcoal-100/50 shadow-sm"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:shadow-primary-500/25 transition-all duration-300">
                <span className="text-white font-bold text-sm">CS</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="hidden sm:block">
              <span className="text-lg font-semibold text-charcoal-900 tracking-tight">
                Content Strategy
              </span>
              <span className="text-lg font-semibold text-primary-500 tracking-tight ml-1">
                Portal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {/* Home Link */}
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Home</span>
            </Link>

            {/* Tools Dropdown */}
            <div className="relative" ref={toolsRef}>
              <button
                onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
                className={`nav-link ${isToolActive('/planner') || isToolActive('/audit') ? 'nav-link-active' : ''}`}
                aria-expanded={toolsMenuOpen}
                aria-haspopup="menu"
                aria-label="Tools menu"
              >
                <Wrench className="w-4 h-4" aria-hidden="true" />
                <span>Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${toolsMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {toolsMenuOpen && (
                <div className="dropdown-menu left-0 mt-2 w-72 p-2" role="menu" aria-label="Tools">
                  <Link
                    to="/planner"
                    onClick={() => setToolsMenuOpen(false)}
                    className={`dropdown-item group ${isToolActive('/planner') ? 'dropdown-item-active' : ''}`}
                    role="menuitem"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center group-hover:from-primary-200 group-hover:to-primary-100 transition-colors" aria-hidden="true">
                      <ClipboardList className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-charcoal-900">Content Planner</div>
                      <div className="text-xs text-charcoal-500">321-item comprehensive checklist</div>
                    </div>
                  </Link>
                  <Link
                    to="/audit"
                    onClick={() => setToolsMenuOpen(false)}
                    className={`dropdown-item group mt-1 ${isToolActive('/audit') ? 'dropdown-item-active' : ''}`}
                    role="menuitem"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center group-hover:from-cyan-200 group-hover:to-cyan-100 transition-colors" aria-hidden="true">
                      <Search className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-charcoal-900 flex items-center gap-2">
                        Technical Audit
                        <span className="badge badge-info text-2xs">New</span>
                      </div>
                      <div className="text-xs text-charcoal-500">Screaming Frog analyzer</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/my-tasks"
              className={`nav-link ${isActive('/my-tasks') ? 'nav-link-active' : ''}`}
              aria-current={isActive('/my-tasks') ? 'page' : undefined}
            >
              <CheckSquare className="w-4 h-4" aria-hidden="true" />
              <span>My Tasks</span>
            </Link>

            {hasPermission(userProfile?.role, 'canManageTeam') && (
              <Link
                to="/team"
                className={`nav-link ${isActive('/team') ? 'nav-link-active' : ''}`}
                aria-current={isActive('/team') ? 'page' : undefined}
              >
                <Users className="w-4 h-4" aria-hidden="true" />
                <span>Team</span>
              </Link>
            )}

            {/* Notifications */}
            <NotificationPanel />

            {/* Help Menu */}
            <div className="relative" ref={helpRef}>
              <button
                onClick={() => setHelpMenuOpen(!helpMenuOpen)}
                className="nav-link"
                aria-expanded={helpMenuOpen}
                aria-haspopup="menu"
                aria-label="Help menu"
              >
                <HelpCircle className="w-4 h-4" aria-hidden="true" />
                <span>Help</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${helpMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>

              {helpMenuOpen && (
                <div className="dropdown-menu right-0 mt-2 w-56" role="menu" aria-label="Help">
                  <Link
                    to="/help/resources"
                    onClick={() => setHelpMenuOpen(false)}
                    className="dropdown-item"
                    role="menuitem"
                  >
                    <Sparkles className="w-4 h-4 text-purple-500" aria-hidden="true" />
                    <div>
                      <div className="font-medium text-charcoal-900">Resource Library</div>
                      <div className="text-xs text-charcoal-500">Guides & tutorials</div>
                    </div>
                  </Link>
                  <Link
                    to="/help/glossary"
                    onClick={() => setHelpMenuOpen(false)}
                    className="dropdown-item"
                    role="menuitem"
                  >
                    <FolderOpen className="w-4 h-4 text-amber-500" aria-hidden="true" />
                    <div>
                      <div className="font-medium text-charcoal-900">Content Glossary</div>
                      <div className="text-xs text-charcoal-500">Term definitions</div>
                    </div>
                  </Link>
                  <div className="h-px bg-charcoal-100 my-1" role="separator" />
                  <button
                    onClick={() => {
                      setHelpMenuOpen(false);
                      window.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
                    }}
                    className="dropdown-item w-full"
                    role="menuitem"
                  >
                    <div className="w-4 h-4 flex items-center justify-center text-charcoal-400" aria-hidden="true">
                      <kbd className="text-xs font-mono">?</kbd>
                    </div>
                    <div>
                      <div className="font-medium text-charcoal-900">Keyboard Shortcuts</div>
                      <div className="text-xs text-charcoal-500">Press ? to view</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 ml-2 border-l border-charcoal-200">
              <div className="text-right">
                <p className="text-sm font-medium text-charcoal-900">
                  {userProfile?.name || currentUser.displayName || currentUser.email}
                </p>
                <p className="text-xs text-charcoal-500 capitalize">
                  {userProfile?.role?.replace('_', ' ') || 'User'}
                </p>
              </div>

              <div className="avatar">
                <User className="w-4 h-4" />
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-charcoal-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden py-4 border-t border-charcoal-100 animate-fade-in-down">
            <div className="space-y-1" role="menu">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
                role="menuitem"
                aria-current={isActive('/') ? 'page' : undefined}
              >
                <Home className="w-5 h-5" aria-hidden="true" />
                <span>Home</span>
              </Link>

              {/* Mobile Tools Section */}
              <div className="px-3 py-2 mt-3">
                <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-2" id="mobile-tools-label">Tools</p>
                <div role="group" aria-labelledby="mobile-tools-label">
                  <Link
                    to="/planner"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`nav-link mb-1 ${isToolActive('/planner') ? 'nav-link-active' : ''}`}
                    role="menuitem"
                  >
                    <ClipboardList className="w-5 h-5" aria-hidden="true" />
                    <span>Content Planner</span>
                  </Link>
                  <Link
                    to="/audit"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`nav-link ${isToolActive('/audit') ? 'nav-link-active' : ''}`}
                    role="menuitem"
                  >
                    <Search className="w-5 h-5" aria-hidden="true" />
                    <span>Technical Audit</span>
                  </Link>
                </div>
              </div>

              <Link
                to="/my-tasks"
                onClick={() => setMobileMenuOpen(false)}
                className={`nav-link ${isActive('/my-tasks') ? 'nav-link-active' : ''}`}
                role="menuitem"
                aria-current={isActive('/my-tasks') ? 'page' : undefined}
              >
                <CheckSquare className="w-5 h-5" aria-hidden="true" />
                <span>My Tasks</span>
              </Link>

              {hasPermission(userProfile?.role, 'canManageTeam') && (
                <Link
                  to="/team"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`nav-link ${isActive('/team') ? 'nav-link-active' : ''}`}
                  role="menuitem"
                  aria-current={isActive('/team') ? 'page' : undefined}
                >
                  <Users className="w-5 h-5" aria-hidden="true" />
                  <span>Team</span>
                </Link>
              )}

              <div className="px-3 py-4 border-t border-charcoal-100 mt-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="avatar" aria-hidden="true">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-charcoal-900">
                      {userProfile?.name || currentUser.displayName || currentUser.email}
                    </p>
                    <p className="text-xs text-charcoal-500 capitalize">
                      {userProfile?.role?.replace('_', ' ') || 'User'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium"
                  role="menuitem"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
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
