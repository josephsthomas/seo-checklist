import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileJson,
  Archive,
  Search,
  Accessibility,
  Image,
  Tags,
  Code2,
  ClipboardList,
  ScanEye,
  ArrowLeft,
  Clock,
  Trash2,
  ChevronDown,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { useExportHistory, EXPORT_TYPES } from '../../hooks/useExportHistory';
import { useProjects } from '../../hooks/useProjects';
import { exportChecklistProgress } from '../../lib/unifiedExportService';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

// Icon mapping
const ICONS = {
  Search,
  Accessibility,
  Image,
  Tags,
  Code2,
  ClipboardList,
  ScanEye
};

// Format icons
const FORMAT_ICONS = {
  pdf: FileText,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  json: FileJson,
  zip: Archive,
  html: Code2
};

// Color classes
const COLOR_CLASSES = {
  primary: 'from-primary-500 to-primary-600',
  cyan: 'from-cyan-500 to-cyan-600',
  purple: 'from-purple-500 to-purple-600',
  emerald: 'from-emerald-500 to-emerald-600',
  amber: 'from-amber-500 to-amber-600',
  rose: 'from-rose-500 to-rose-600',
  teal: 'from-teal-500 to-teal-600'
};

/**
 * Quick Export Card Component
 */
function QuickExportCard({ type, onExport }) {
  const [exporting, setExporting] = useState(false);
  const Icon = ICONS[type.icon] || FileText;
  const colorClass = COLOR_CLASSES[type.color] || COLOR_CLASSES.primary;

  const handleExport = async (format) => {
    setExporting(true);
    try {
      await onExport(type.id, format);
      toast.success(`${type.label} exported successfully`);
    } catch (error) {
      toast.error(`Failed to export: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-charcoal-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-charcoal-900">{type.label}</h3>
          <div className="flex flex-wrap gap-2 mt-3">
            {type.formats.map(format => {
              const FormatIcon = FORMAT_ICONS[format] || FileText;
              return (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  disabled={exporting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-charcoal-50 hover:bg-charcoal-100 text-charcoal-700 text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {exporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FormatIcon className="w-3.5 h-3.5" />
                  )}
                  {format.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Export History Item
 */
function ExportHistoryItem({ exportItem, onDelete }) {
  const Icon = ICONS[EXPORT_TYPES[exportItem.type?.toUpperCase()]?.icon] || FileText;
  const FormatIcon = FORMAT_ICONS[exportItem.format] || FileText;
  const timestamp = exportItem.createdAt?.toDate ? exportItem.createdAt.toDate() : new Date(exportItem.createdAt);

  return (
    <div className="flex items-center gap-4 p-4 bg-charcoal-50 rounded-xl">
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-charcoal-100">
        <Icon className="w-5 h-5 text-charcoal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-charcoal-900 truncate">{exportItem.name}</p>
        <div className="flex items-center gap-3 text-sm text-charcoal-500">
          <span className="flex items-center gap-1">
            <FormatIcon className="w-3.5 h-3.5" />
            {exportItem.format?.toUpperCase()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
        </div>
      </div>
      <button
        onClick={() => onDelete(exportItem.id)}
        className="p-2 text-charcoal-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete record"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Project Export Card
 */
function ProjectExportCard({ project, onExport }) {
  const [exporting, setExporting] = useState(null);
  const progress = project.progress || 0;

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await onExport(project, format);
      toast.success(`${project.name} exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error(`Failed to export: ${error.message}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-charcoal-100 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-charcoal-900 truncate">{project.name}</h4>
          <p className="text-sm text-charcoal-500">{progress}% complete</p>
        </div>
      </div>

      <div className="h-1.5 bg-charcoal-100 rounded-full mb-3">
        <div
          className="h-full bg-gradient-to-r from-primary-500 to-cyan-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleExport('pdf')}
          disabled={exporting === 'pdf'}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-charcoal-50 hover:bg-charcoal-100 text-charcoal-700 text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {exporting === 'pdf' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4" />
          )}
          PDF
        </button>
        <button
          onClick={() => handleExport('xlsx')}
          disabled={exporting === 'xlsx'}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-charcoal-50 hover:bg-charcoal-100 text-charcoal-700 text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          {exporting === 'xlsx' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4" />
          )}
          Excel
        </button>
      </div>
    </div>
  );
}

/**
 * Export Hub Page
 */
export default function ExportHubPage() {
  const { exports, loading: exportsLoading, logExport, deleteExport } = useExportHistory(10);
  const { projects, loading: projectsLoading } = useProjects();
  const [filter, setFilter] = useState('all');

  // Filter exports by type
  const filteredExports = useMemo(() => {
    if (filter === 'all') return exports;
    return exports.filter(e => e.type === filter);
  }, [exports, filter]);

  // Handle quick exports
  const handleQuickExport = async (type, format) => {
    // This would be connected to actual export logic for each tool
    // For now, log the export
    await logExport({
      type,
      format,
      name: `${EXPORT_TYPES[type.toUpperCase()]?.label || type} Export`,
      status: 'completed'
    });
  };

  // Handle project export
  const handleProjectExport = async (project, format) => {
    // Get project items (would normally fetch from database)
    const mockItems = []; // This would be actual checklist items
    exportChecklistProgress(project, mockItems, format);

    await logExport({
      type: 'checklist',
      format,
      name: project.name,
      projectId: project.id,
      status: 'completed'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-charcoal-600 hover:text-charcoal-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Download className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-charcoal-900">Export Hub</h1>
              <p className="text-charcoal-500">Download reports and data from all your tools</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Exports */}
            <div>
              <h2 className="text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-primary-500" />
                Quick Exports
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(EXPORT_TYPES).map(type => (
                  <QuickExportCard
                    key={type.id}
                    type={type}
                    onExport={handleQuickExport}
                  />
                ))}
              </div>
            </div>

            {/* Project Exports */}
            <div>
              <h2 className="text-lg font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary-500" />
                Export Project Checklists
              </h2>

              {projectsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-32 bg-charcoal-100 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-charcoal-100">
                  <FolderOpen className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
                  <p className="text-charcoal-500">No projects yet</p>
                  <Link to="/app/planner/new" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Create your first project
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projects.slice(0, 6).map(project => (
                    <ProjectExportCard
                      key={project.id}
                      project={project}
                      onExport={handleProjectExport}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Export History */}
          <div>
            <div className="bg-white rounded-2xl border border-charcoal-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-charcoal-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-charcoal-500" />
                  Export History
                </h2>
              </div>

              {/* Filter */}
              <div className="relative mb-4">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full appearance-none pl-3 pr-10 py-2 bg-charcoal-50 border border-charcoal-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  {Object.values(EXPORT_TYPES).map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none" />
              </div>

              {exportsLoading ? (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-16 bg-charcoal-50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : filteredExports.length === 0 ? (
                <div className="text-center py-8">
                  <Download className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
                  <p className="text-charcoal-500 text-sm">No exports yet</p>
                  <p className="text-charcoal-400 text-xs mt-1">Your export history will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredExports.map(exportItem => (
                    <ExportHistoryItem
                      key={exportItem.id}
                      exportItem={exportItem}
                      onDelete={deleteExport}
                    />
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
