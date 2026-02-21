import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useProjects } from '../../hooks/useProjects';
import { useChecklist } from '../../hooks/useChecklist';
import { checklistData } from '../../data/checklistData';
import {
  Check,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Star
} from 'lucide-react';
import { exportToExcel } from '../../lib/excelExport';
import ItemDetailModal from './ItemDetailModal';
import FilterPresetManager from './FilterPresetManager';
import PdfExportModal from './PdfExportModal';
import HelpTooltip from '../help/HelpTooltip';
import ProjectLinkedItems from '../projects/ProjectLinkedItems';
import { debounce } from '../../utils/storageHelpers';

const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const PHASES = ['Discovery', 'Strategy', 'Build', 'Pre-Launch', 'Launch', 'Post-Launch'];

// Default filter state
const DEFAULT_FILTERS = {
  phase: '',
  priority: '',
  owner: '',
  category: '',
  showCompleted: true
};

export default function SEOChecklist() {
  const { projectId } = useParams();
  const [searchParams] = useSearchParams();
  const { getProject, updateProject } = useProjects();
  const { completions, toggleItem, loading: checklistLoading } = useChecklist(projectId);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [showPdfExport, setShowPdfExport] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [expandedPhases, setExpandedPhases] = useState([PHASES[0]]);

  // Debounced search handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetSearch = useCallback(
    debounce((value) => setDebouncedSearchQuery(value), 300),
    []
  );

  // Handle search input change with debouncing
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value); // Update immediately for UI
    debouncedSetSearch(value); // Debounce the actual filter
  }, [debouncedSetSearch]);

  // Debounced save to Firebase
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSaveUIState = useCallback(
    debounce((newFilters, newExpandedPhases) => {
      if (projectId) {
        updateProject(projectId, {
          uiState: {
            filters: newFilters,
            expandedPhases: newExpandedPhases
          }
        }).catch(err => console.error('Failed to save UI state:', err));
      }
    }, 1000),
    [projectId, updateProject]
  );

  // Persist filters and expanded phases to Firebase (debounced)
  useEffect(() => {
    if (project && projectId) {
      debouncedSaveUIState(filters, expandedPhases);
    }
  }, [filters, expandedPhases, project, projectId, debouncedSaveUIState]);

  const handleApplyPreset = (presetFilters) => {
    setFilters(prev => ({
      ...prev,
      ...presetFilters
    }));
  };

  // Open modal from URL parameter
  useEffect(() => {
    const itemId = searchParams.get('itemId');
    if (itemId) {
      const item = checklistData.find(i => i.id === parseInt(itemId, 10));
      if (item) {
        setSelectedItem(item);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchProject = async () => {
      if (projectId) {
        const projectData = await getProject(projectId);
        setProject(projectData);
        // Load saved UI state from Firebase
        if (projectData?.uiState) {
          if (projectData.uiState.filters) {
            setFilters(prev => ({ ...prev, ...projectData.uiState.filters }));
          }
          if (projectData.uiState.expandedPhases) {
            setExpandedPhases(projectData.uiState.expandedPhases);
          }
        }
      }
      setLoading(false);
    };
    fetchProject();
  }, [projectId, getProject]);

  // Filter checklist items based on project type and filters
  const filteredItems = useMemo(() => {
    let items = [...checklistData];

    // Filter by project type
    if (project) {
      items = items.filter(item =>
        !item.projectTypes || item.projectTypes.includes(project.projectType)
      );
    }

    // Apply search (using debounced query for performance)
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      items = items.filter(item =>
        item.item.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.phase) {
      items = items.filter(item => item.phase === filters.phase);
    }
    if (filters.priority) {
      items = items.filter(item => item.priority === filters.priority);
    }
    if (filters.owner) {
      items = items.filter(item => item.owner === filters.owner);
    }
    if (filters.category) {
      items = items.filter(item => item.category === filters.category);
    }
    if (!filters.showCompleted) {
      items = items.filter(item => !completions[item.id]);
    }

    return items;
  }, [project, debouncedSearchQuery, filters, completions]);

  // Group items by phase
  const itemsByPhase = useMemo(() => {
    const grouped = {};
    PHASES.forEach(phase => {
      grouped[phase] = filteredItems.filter(item => item.phase === phase);
    });
    return grouped;
  }, [filteredItems]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = checklistData.length;
    const completed = Object.values(completions).filter(Boolean).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const critical = filteredItems.filter(item =>
      item.priority === 'CRITICAL' && !completions[item.id]
    ).length;

    const blockers = filteredItems.filter(item =>
      item.riskLevel === 'BLOCKER' && !completions[item.id]
    ).length;

    return { total, completed, percentage, critical, blockers };
  }, [completions, filteredItems]);

  const togglePhase = (phase) => {
    setExpandedPhases(prev =>
      prev.includes(phase)
        ? prev.filter(p => p !== phase)
        : [...prev, phase]
    );
  };

  const handleExport = async () => {
    try {
      await exportToExcel(checklistData, completions, project);
      toast.success('Excel exported successfully');
    } catch (err) {
      console.error('Excel export failed:', err);
      toast.error('Failed to export Excel. Please try again.');
    }
  };

  if (loading || checklistLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-charcoal-900">Project not found</h2>
          <p className="text-charcoal-600 mt-2">The project you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-charcoal-900">{project.name}</h1>
              <p className="text-charcoal-600">Client: {project.clientName}</p>
              <p className="text-sm text-charcoal-500">Type: {project.projectType}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowPdfExport(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={handleExport}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-charcoal-600 mb-2">
              <span>Overall Progress</span>
              <span className="font-semibold">{stats.percentage}% Complete</span>
            </div>
            <div className="w-full bg-charcoal-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="text-charcoal-600">
                {stats.completed} of {stats.total} items complete
              </span>
              {stats.critical > 0 && (
                <span className="text-red-600 font-medium">
                  {stats.critical} CRITICAL items remaining
                </span>
              )}
              {stats.blockers > 0 && (
                <span className="text-red-700 font-bold">
                  ⚠️ {stats.blockers} BLOCKERS
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Linked Items from Other Tools */}
        <div className="mb-6">
          <ProjectLinkedItems projectId={projectId} collapsible={true} />
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search checklist items..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="input pl-10 w-full"
                aria-label="Search checklist items"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, showCompleted: !prev.showCompleted }))}
                className={`btn ${filters.showCompleted ? 'btn-primary' : 'btn-secondary'}`}
              >
                {filters.showCompleted ? 'Hide' : 'Show'} Completed
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.phase}
              onChange={(e) => setFilters(prev => ({ ...prev, phase: e.target.value }))}
              className="input"
            >
              <option value="">All Phases</option>
              {PHASES.map(phase => (
                <option key={phase} value={phase}>{phase}</option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="input"
            >
              <option value="">All Priorities</option>
              {PRIORITIES.map(priority => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>

            <select
              value={filters.owner}
              onChange={(e) => setFilters(prev => ({ ...prev, owner: e.target.value }))}
              className="input"
            >
              <option value="">All Owners</option>
              <option value="SEO">SEO</option>
              <option value="Development">Development</option>
              <option value="Content">Content</option>
              <option value="UX">UX</option>
              <option value="IA">IA</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPresetManager(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Filter Presets
              </button>
              <button
                onClick={() => setFilters({
                  phase: '',
                  priority: '',
                  owner: '',
                  category: '',
                  showCompleted: true
                })}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Filter Preset Manager Modal */}
        {showPresetManager && (
          <FilterPresetManager
            currentFilters={filters}
            onApplyPreset={handleApplyPreset}
            onClose={() => setShowPresetManager(false)}
          />
        )}

        {/* PDF Export Modal */}
        {showPdfExport && (
          <PdfExportModal
            items={filteredItems}
            completions={completions}
            onClose={() => setShowPdfExport(false)}
          />
        )}

        {/* Checklist Items by Phase */}
        <div className="space-y-4">
          {PHASES.map(phase => {
            const phaseItems = itemsByPhase[phase];
            if (phaseItems.length === 0) return null;

            const phaseCompleted = phaseItems.filter(item => completions[item.id]).length;
            const phaseTotal = phaseItems.length;
            const phasePercentage = Math.round((phaseCompleted / phaseTotal) * 100);
            const isExpanded = expandedPhases.includes(phase);

            return (
              <div key={phase} className="bg-white rounded-lg shadow-md overflow-hidden">
                <button
                  onClick={() => togglePhase(phase)}
                  className="w-full p-4 flex items-center justify-between hover:bg-charcoal-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-charcoal-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-charcoal-600" />
                    )}
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-charcoal-900">{phase}</h3>
                      <p className="text-sm text-charcoal-600">
                        {phaseCompleted} of {phaseTotal} completed ({phasePercentage}%)
                      </p>
                    </div>
                  </div>
                  <div className="w-32 bg-charcoal-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${phasePercentage}%` }}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t">
                    {phaseItems.map(item => (
                      <div
                        key={item.id}
                        className={`p-4 border-b last:border-b-0 hover:bg-charcoal-50 transition-colors cursor-pointer
                          ${completions[item.id] ? 'bg-green-50' : ''}`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleItem(item.id);
                            }}
                            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                              ${completions[item.id]
                                ? 'bg-primary-600 border-primary-600'
                                : 'border-charcoal-200 hover:border-primary-600'
                              }`}
                          >
                            {completions[item.id] && (
                              <Check className="w-4 h-4 text-white" />
                            )}
                          </button>

                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium
                                ${item.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                  item.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                  item.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                {item.priority}
                              </span>
                              {item.riskLevel && (
                                <span className={`px-2 py-0.5 rounded text-xs font-medium
                                  ${item.riskLevel === 'BLOCKER' ? 'bg-red-600 text-white' :
                                    item.riskLevel === 'HIGH RISK' ? 'bg-red-100 text-red-800' :
                                    item.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                  {item.riskLevel}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-charcoal-100 text-charcoal-800">
                                {item.owner}
                              </span>
                            </div>

                            <div className="flex items-start gap-2">
                              <p className={`flex-1 text-charcoal-900 ${completions[item.id] ? 'line-through text-charcoal-600' : ''}`}>
                                {item.item}
                              </p>
                              <HelpTooltip itemId={item.id} itemTitle={`#${item.id}`} />
                            </div>

                            <div className="flex flex-wrap gap-4 mt-2 text-xs text-charcoal-500">
                              <span>Category: {item.category}</span>
                              <span>Effort: {item.effortLevel}</span>
                              <span>Deliverable: {item.deliverableType}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedItem(item);
                                }}
                                className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
                              >
                                <MessageSquare className="w-3 h-3" />
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Item Detail Modal */}
        <ItemDetailModal
          item={selectedItem}
          projectId={projectId}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onToggleComplete={toggleItem}
          isCompleted={selectedItem ? !!completions[selectedItem.id] : false}
        />
      </div>
    </div>
  );
}
