import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Home,
  ClipboardList,
  FileSearch,
  Accessibility,
  Image,
  Tags,
  Code2,
  Users,
  Settings,
  HelpCircle,
  FolderOpen,
  Plus,
  Moon,
  Sun,
  Download,
  CheckSquare,
  Activity,
  BookOpen,
  Command,
  ArrowRight,
  User,
  X,
  ScanEye
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useProjects } from '../../hooks/useProjects';

const COMMAND_CATEGORIES = {
  NAVIGATION: 'Navigation',
  TOOLS: 'Tools',
  PROJECTS: 'Recent Projects',
  ACTIONS: 'Quick Actions',
  SETTINGS: 'Settings',
};

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { projects } = useProjects();

  // Build command list
  const commands = useMemo(() => {
    const baseCommands = [
      // Navigation
      { id: 'home', category: COMMAND_CATEGORIES.NAVIGATION, icon: Home, label: 'Go to Home', action: () => navigate('/app') },
      { id: 'my-tasks', category: COMMAND_CATEGORIES.NAVIGATION, icon: CheckSquare, label: 'My Tasks', action: () => navigate('/app/my-tasks') },
      { id: 'activity', category: COMMAND_CATEGORIES.NAVIGATION, icon: Activity, label: 'Activity Feed', action: () => navigate('/app/activity') },
      { id: 'profile', category: COMMAND_CATEGORIES.NAVIGATION, icon: User, label: 'My Profile', action: () => navigate('/app/profile') },
      { id: 'team', category: COMMAND_CATEGORIES.NAVIGATION, icon: Users, label: 'Team Management', action: () => navigate('/app/team') },

      // Tools
      { id: 'planner', category: COMMAND_CATEGORIES.TOOLS, icon: ClipboardList, label: 'Content Planner', keywords: ['projects', 'checklist'], action: () => navigate('/app/planner') },
      { id: 'audit', category: COMMAND_CATEGORIES.TOOLS, icon: FileSearch, label: 'Technical Audit', keywords: ['seo', 'crawl'], action: () => navigate('/app/audit') },
      { id: 'accessibility', category: COMMAND_CATEGORIES.TOOLS, icon: Accessibility, label: 'Accessibility Analyzer', keywords: ['a11y', 'wcag'], action: () => navigate('/app/accessibility') },
      { id: 'image-alt', category: COMMAND_CATEGORIES.TOOLS, icon: Image, label: 'Image Alt Generator', keywords: ['alt text', 'images'], action: () => navigate('/app/image-alt') },
      { id: 'meta', category: COMMAND_CATEGORIES.TOOLS, icon: Tags, label: 'Meta Generator', keywords: ['title', 'description'], action: () => navigate('/app/meta-generator') },
      { id: 'schema', category: COMMAND_CATEGORIES.TOOLS, icon: Code2, label: 'Schema Generator', keywords: ['structured data', 'json-ld'], action: () => navigate('/app/schema-generator') },
      { id: 'readability', category: COMMAND_CATEGORIES.TOOLS, icon: ScanEye, label: 'AI Readability Checker', keywords: ['readability', 'ai', 'llm', 'seo', 'geo'], action: () => navigate('/app/readability') },

      // Quick Actions
      { id: 'new-project', category: COMMAND_CATEGORIES.ACTIONS, icon: Plus, label: 'Create New Project', action: () => navigate('/app/planner/new') },
      { id: 'export', category: COMMAND_CATEGORIES.ACTIONS, icon: Download, label: 'Export Hub', action: () => navigate('/app/export') },
      { id: 'toggle-theme', category: COMMAND_CATEGORIES.ACTIONS, icon: isDark ? Sun : Moon, label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode', action: toggleTheme },

      // Settings
      { id: 'settings', category: COMMAND_CATEGORIES.SETTINGS, icon: Settings, label: 'User Settings', action: () => navigate('/app/settings') },
      { id: 'resources', category: COMMAND_CATEGORIES.SETTINGS, icon: BookOpen, label: 'Resource Library', action: () => navigate('/help/resources') },
      { id: 'glossary', category: COMMAND_CATEGORIES.SETTINGS, icon: FolderOpen, label: 'Content Glossary', action: () => navigate('/help/glossary') },
      { id: 'help', category: COMMAND_CATEGORIES.SETTINGS, icon: HelpCircle, label: 'Help & Support', keywords: ['documentation'], action: () => {} },
    ];

    // Add recent projects
    const recentProjects = projects.slice(0, 5).map(project => ({
      id: `project-${project.id}`,
      category: COMMAND_CATEGORIES.PROJECTS,
      icon: FolderOpen,
      label: project.name,
      sublabel: project.clientName,
      action: () => navigate(`/app/planner/projects/${project.id}`),
    }));

    return [...baseCommands, ...recentProjects];
  }, [navigate, toggleTheme, isDark, projects]);

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;

    const lowerQuery = query.toLowerCase();
    return commands.filter(cmd => {
      const matchLabel = cmd.label.toLowerCase().includes(lowerQuery);
      const matchSublabel = cmd.sublabel?.toLowerCase().includes(lowerQuery);
      const matchKeywords = cmd.keywords?.some(k => k.toLowerCase().includes(lowerQuery));
      return matchLabel || matchSublabel || matchKeywords;
    });
  }, [commands, query]);

  // Group filtered commands by category
  const groupedCommands = useMemo(() => {
    const groups = {};
    filteredCommands.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  // Flatten for keyboard navigation
  const flatCommands = useMemo(() => {
    return Object.values(groupedCommands).flat();
  }, [groupedCommands]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && flatCommands.length > 0) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex, flatCommands.length]);

  // Execute a command
  const executeCommand = useCallback((command) => {
    command.action();
    onClose();
  }, [onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flatCommands.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (flatCommands[selectedIndex]) {
          executeCommand(flatCommands[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  }, [flatCommands, selectedIndex, onClose, executeCommand]);

  if (!isOpen) return null;

  let currentIndex = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" role="dialog" aria-modal="true" aria-label="Command palette">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal-900/60 dark:bg-charcoal-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-charcoal-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-charcoal-100 dark:border-charcoal-700">
          <Search className="w-5 h-5 text-charcoal-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, tools, projects..."
            className="flex-1 bg-transparent text-charcoal-900 dark:text-charcoal-100 placeholder:text-charcoal-400 dark:placeholder:text-charcoal-500 text-lg focus:outline-none"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-mono text-charcoal-400 dark:text-charcoal-500 bg-charcoal-100 dark:bg-charcoal-700 rounded-lg">
            <span>esc</span>
          </kbd>
          <button
            onClick={onClose}
            className="sm:hidden p-1.5 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 rounded-lg hover:bg-charcoal-100 dark:hover:bg-charcoal-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Command List */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {flatCommands.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-charcoal-500 dark:text-charcoal-400">No commands found</p>
              <p className="text-sm text-charcoal-400 dark:text-charcoal-500 mt-1">
                Try searching for something else
              </p>
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-2">
                <div className="px-4 py-2">
                  <p className="text-xs font-semibold text-charcoal-400 dark:text-charcoal-500 uppercase tracking-wider">
                    {category}
                  </p>
                </div>
                <div className="px-2">
                  {cmds.map((cmd) => {
                    currentIndex++;
                    const itemIndex = currentIndex;
                    const Icon = cmd.icon;
                    const isSelected = selectedIndex === itemIndex;

                    return (
                      <button
                        key={cmd.id}
                        data-index={itemIndex}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(itemIndex)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                          isSelected
                            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                            : 'text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-50 dark:hover:bg-charcoal-700/50'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                          isSelected
                            ? 'bg-primary-100 dark:bg-primary-900/50'
                            : 'bg-charcoal-100 dark:bg-charcoal-700'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-charcoal-500 dark:text-charcoal-400'
                          }`} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{cmd.label}</p>
                          {cmd.sublabel && (
                            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{cmd.sublabel}</p>
                          )}
                        </div>
                        {isSelected && (
                          <ArrowRight className="w-4 h-4 text-primary-500 dark:text-primary-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between text-xs text-charcoal-400 dark:text-charcoal-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-charcoal-100 dark:bg-charcoal-700 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-charcoal-100 dark:bg-charcoal-700 rounded">↓</kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-charcoal-100 dark:bg-charcoal-700 rounded">↵</kbd>
              <span className="ml-1">Select</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="w-3.5 h-3.5" />
            <span>K to open</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage command palette state
// eslint-disable-next-line react-refresh/only-export-components
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
}
