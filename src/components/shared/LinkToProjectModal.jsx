import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Link2,
  FolderOpen,
  Check,
  Search,
  Plus,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { useLinkToProject, ITEM_TYPE_INFO } from '../../hooks/useProjectLinkedItems';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

/**
 * Modal for linking a tool item to a project
 */
export default function LinkToProjectModal({ isOpen, onClose, item }) {
  const { projects, loading, linkToProject, getLinkedProjects } = useLinkToProject();
  const [searchQuery, setSearchQuery] = useState('');
  const [linkedProjectIds, setLinkedProjectIds] = useState([]);
  const [linking, setLinking] = useState(false);
  const dialogRef = useRef(null);

  // Load which projects this item is already linked to
  useEffect(() => {
    if (isOpen && item?.id) {
      getLinkedProjects(item.id).then(setLinkedProjectIds);
    }
  }, [isOpen, item?.id, getLinkedProjects]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap within modal
  const handleKeyDown = useCallback((e) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusable = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }, []);

  // Move focus into modal on open
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const firstFocusable = dialogRef.current.querySelector('input, button');
      if (firstFocusable) firstFocusable.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const typeInfo = ITEM_TYPE_INFO[item?.type] || {
    label: 'Item',
    color: 'charcoal'
  };

  const filteredProjects = projects.filter(project =>
    project.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.siteName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLink = async (projectId) => {
    if (linkedProjectIds.includes(projectId)) return;

    setLinking(true);
    try {
      await linkToProject(projectId, item);
      setLinkedProjectIds(prev => [...prev, projectId]);
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="link-to-project-title"
        onKeyDown={handleKeyDown}
        className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-cyan-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                <Link2 className="w-4 h-4" />
                Link to Project
              </div>
              <h2 id="link-to-project-title" className="text-xl font-bold">
                {item?.name || 'Untitled Item'}
              </h2>
              <p className="text-white/70 text-sm mt-1">
                {typeInfo.label}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-charcoal-100 dark:border-charcoal-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search projects"
              className="w-full pl-10 pr-4 py-2.5 border border-charcoal-200 dark:border-charcoal-600 rounded-xl bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Project List */}
        <div className="max-h-80 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse h-16 bg-charcoal-100 dark:bg-charcoal-700 rounded-xl" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
              {projects.length === 0 ? (
                <>
                  <p className="text-charcoal-600 dark:text-charcoal-300 font-medium">No projects yet</p>
                  <p className="text-charcoal-400 dark:text-charcoal-500 text-sm mt-1">
                    Create a project to link this item
                  </p>
                  <Link
                    to="/app/planner/new"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create Project
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-charcoal-600 dark:text-charcoal-300 font-medium">No matching projects</p>
                  <p className="text-charcoal-400 dark:text-charcoal-500 text-sm mt-1">
                    Try a different search term
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProjects.map((project) => {
                const isLinked = linkedProjectIds.includes(project.id);

                return (
                  <button
                    key={project.id}
                    onClick={() => handleLink(project.id)}
                    disabled={linking || isLinked}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      isLinked
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 cursor-default'
                        : 'bg-white dark:bg-charcoal-700 border-charcoal-100 dark:border-charcoal-600 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isLinked
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600'
                    }`}>
                      {isLinked ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <ClipboardList className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-900 dark:text-white truncate">
                        {project.name}
                      </p>
                      <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                        {project.siteName && `${project.siteName} · `}
                        {project.createdAt && formatDistanceToNow(
                          project.createdAt.toDate ? project.createdAt.toDate() : new Date(project.createdAt),
                          { addSuffix: true }
                        )}
                      </p>
                    </div>
                    {isLinked ? (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
                        Linked
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-charcoal-300" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-charcoal-100 dark:border-charcoal-700 bg-charcoal-50 dark:bg-charcoal-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
              {linkedProjectIds.length > 0 && (
                <>Linked to {linkedProjectIds.length} project{linkedProjectIds.length !== 1 ? 's' : ''}</>
              )}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-charcoal-600 dark:text-charcoal-300 hover:text-charcoal-800 dark:hover:text-white transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Button component to trigger the link modal
 */
export function LinkToProjectButton({ item, size = 'md', className = '' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'p-1.5 text-xs gap-1',
    md: 'px-3 py-2 text-sm gap-2',
    lg: 'px-4 py-2.5 gap-2'
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center font-medium text-charcoal-600 hover:text-primary-600 bg-charcoal-100 hover:bg-primary-50 rounded-lg transition-colors ${sizeClasses[size]} ${className}`}
      >
        <Link2 className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        Link to Project
      </button>

      <LinkToProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={item}
      />
    </>
  );
}
