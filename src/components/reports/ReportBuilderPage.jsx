import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Plus,
  Save,
  Download,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Settings,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  X,
  Check,
  FileText,
  BarChart3,
  Table,
  Type,
  Minus,
  Hash,
  Globe,
  Shield,
  Users,
  Code,
  Layout,
  Palette,
  Move,
  Maximize2,
  Minimize2,
  RotateCcw,
  Layers,
  PanelLeftClose,
  PanelLeft,
  Printer,
  Share2,
  Clock,
  FolderOpen
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import useReportBuilder, {
  DATA_SOURCES,
  WIDGET_TYPES,
  REPORT_TEMPLATES,
  generateWidgetId,
  getMockDataForSource
} from '../../hooks/useReportBuilder';
import ReportWidgetRenderer from './ReportWidgetRenderer';

/**
 * Custom Report Builder Page
 * Drag-and-drop interface for creating custom reports
 */

// Grid configuration
const GRID_COLS = 4;
const GRID_ROW_HEIGHT = 120;
const GRID_GAP = 16;

// Icon mapping
const ICONS = {
  Plus, FileText, BarChart3, Table, Type, Minus, Hash,
  Globe, Shield, Users, Code, Layout
};

export default function ReportBuilderPage() {
  const {
    reports,
    loading,
    createReport,
    updateReport,
    deleteReport,
    duplicateReport
  } = useReportBuilder();

  // State
  const [currentReport, setCurrentReport] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [reportName, setReportName] = useState('Untitled Report');
  const [reportDescription, setReportDescription] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const canvasRef = useRef(null);

  // Group data sources by category
  const groupedDataSources = useMemo(() => {
    const groups = {};
    Object.entries(DATA_SOURCES).forEach(([id, source]) => {
      if (!groups[source.category]) {
        groups[source.category] = [];
      }
      groups[source.category].push({ id, ...source });
    });
    return groups;
  }, []);

  // Calculate canvas height based on widgets
  const canvasHeight = useMemo(() => {
    if (widgets.length === 0) return 400;
    const maxY = Math.max(...widgets.map(w => w.position.y + w.position.h));
    return Math.max(400, (maxY + 1) * (GRID_ROW_HEIGHT + GRID_GAP));
  }, [widgets]);

  // Load a template
  const loadTemplate = useCallback((template) => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Load this template anyway?')) {
        return;
      }
    }

    setWidgets(template.widgets.map(w => ({
      ...w,
      id: generateWidgetId()
    })));
    setReportName(template.id === 'blank' ? 'Untitled Report' : template.name);
    setReportDescription(template.description || '');
    setCurrentReport(null);
    setShowTemplates(false);
    setHasUnsavedChanges(false);
    toast.success(`Loaded "${template.name}" template`);
  }, [hasUnsavedChanges]);

  // Load a saved report
  const loadReport = useCallback((report) => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Load this report anyway?')) {
        return;
      }
    }

    setWidgets(report.widgets || []);
    setReportName(report.name);
    setReportDescription(report.description || '');
    setCurrentReport(report);
    setShowSavedReports(false);
    setShowTemplates(false);
    setHasUnsavedChanges(false);
  }, [hasUnsavedChanges]);

  // Add a new widget
  const addWidget = useCallback((type, dataSource = null) => {
    const widgetType = WIDGET_TYPES[type];
    const newWidget = {
      id: generateWidgetId(),
      type,
      dataSource,
      config: {
        title: dataSource ? DATA_SOURCES[dataSource]?.name : widgetType.name,
        chartType: type === 'chart' ? 'bar' : undefined
      },
      position: {
        x: 0,
        y: Math.max(0, ...widgets.map(w => w.position.y + w.position.h), 0),
        w: widgetType.defaultSize.w,
        h: widgetType.defaultSize.h
      }
    };

    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidget(newWidget.id);
    setHasUnsavedChanges(true);
    setShowTemplates(false);
  }, [widgets]);

  // Update widget
  const updateWidget = useCallback((widgetId, updates) => {
    setWidgets(prev => prev.map(w =>
      w.id === widgetId ? { ...w, ...updates } : w
    ));
    setHasUnsavedChanges(true);
  }, []);

  // Delete widget
  const removeWidget = useCallback((widgetId) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    if (selectedWidget === widgetId) {
      setSelectedWidget(null);
    }
    setHasUnsavedChanges(true);
  }, [selectedWidget]);

  // Duplicate widget
  const duplicateWidget = useCallback((widget) => {
    const newWidget = {
      ...widget,
      id: generateWidgetId(),
      position: {
        ...widget.position,
        y: widget.position.y + widget.position.h
      }
    };
    setWidgets(prev => [...prev, newWidget]);
    setSelectedWidget(newWidget.id);
    setHasUnsavedChanges(true);
  }, []);

  // Move widget
  const moveWidget = useCallback((widgetId, direction) => {
    setWidgets(prev => {
      const widget = prev.find(w => w.id === widgetId);
      if (!widget) return prev;

      let newPos = { ...widget.position };
      switch (direction) {
        case 'up':
          newPos.y = Math.max(0, newPos.y - 1);
          break;
        case 'down':
          newPos.y = newPos.y + 1;
          break;
        case 'left':
          newPos.x = Math.max(0, newPos.x - 1);
          break;
        case 'right':
          newPos.x = Math.min(GRID_COLS - newPos.w, newPos.x + 1);
          break;
      }

      return prev.map(w =>
        w.id === widgetId ? { ...w, position: newPos } : w
      );
    });
    setHasUnsavedChanges(true);
  }, []);

  // Resize widget
  const resizeWidget = useCallback((widgetId, delta) => {
    setWidgets(prev => {
      const widget = prev.find(w => w.id === widgetId);
      if (!widget) return prev;

      const widgetType = WIDGET_TYPES[widget.type];
      const newW = Math.min(
        widgetType.maxSize.w,
        Math.max(widgetType.minSize.w, widget.position.w + delta.w)
      );
      const newH = Math.min(
        widgetType.maxSize.h,
        Math.max(widgetType.minSize.h, widget.position.h + delta.h)
      );

      // Ensure doesn't exceed grid
      const adjustedW = Math.min(newW, GRID_COLS - widget.position.x);

      return prev.map(w =>
        w.id === widgetId
          ? { ...w, position: { ...w.position, w: adjustedW, h: newH } }
          : w
      );
    });
    setHasUnsavedChanges(true);
  }, []);

  // Save report
  const saveReport = useCallback(async () => {
    const reportData = {
      name: reportName,
      description: reportDescription,
      widgets,
      settings: {
        gridCols: GRID_COLS,
        rowHeight: GRID_ROW_HEIGHT
      }
    };

    let success;
    if (currentReport) {
      success = await updateReport(currentReport.id, reportData);
    } else {
      const newId = await createReport(reportData);
      if (newId) {
        setCurrentReport({ id: newId, ...reportData });
        success = true;
      }
    }

    if (success) {
      setHasUnsavedChanges(false);
    }
  }, [currentReport, reportName, reportDescription, widgets, createReport, updateReport]);

  // Export report
  const exportReport = useCallback((format) => {
    toast.success(`Exporting as ${format.toUpperCase()}...`);
    // TODO: Implement actual export
  }, []);

  // Get selected widget data
  const selectedWidgetData = useMemo(() =>
    widgets.find(w => w.id === selectedWidget),
    [widgets, selectedWidget]
  );

  return (
    <div className="min-h-screen bg-charcoal-50 dark:bg-charcoal-900 flex">
      {/* Left Sidebar - Widget Palette */}
      {showSidebar && !isPreviewMode && (
        <div className="w-72 bg-white dark:bg-charcoal-800 border-r border-charcoal-200 dark:border-charcoal-700 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-charcoal-200 dark:border-charcoal-700">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-charcoal-900 dark:text-white">
                Report Builder
              </h2>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowTemplates(true)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                  showTemplates
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-200 dark:hover:bg-charcoal-600'
                }`}
              >
                <Layout className="w-4 h-4 inline mr-1" />
                Templates
              </button>
              <button
                onClick={() => setShowSavedReports(true)}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                  showSavedReports
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-200 dark:hover:bg-charcoal-600'
                }`}
              >
                <FolderOpen className="w-4 h-4 inline mr-1" />
                Saved
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Templates View */}
            {showTemplates && (
              <div className="p-4 space-y-3">
                <h3 className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wide">
                  Start with a Template
                </h3>
                {REPORT_TEMPLATES.map(template => {
                  const Icon = ICONS[template.icon] || FileText;
                  return (
                    <button
                      key={template.id}
                      onClick={() => loadTemplate(template)}
                      className="w-full p-3 text-left bg-charcoal-50 dark:bg-charcoal-700/50 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                          <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-900 dark:text-white text-sm">
                            {template.name}
                          </p>
                          <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                            {template.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Saved Reports View */}
            {showSavedReports && (
              <div className="p-4 space-y-3">
                <h3 className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wide">
                  Your Reports
                </h3>
                {loading ? (
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Loading...</p>
                ) : reports.length === 0 ? (
                  <p className="text-sm text-charcoal-500 dark:text-charcoal-400">No saved reports yet</p>
                ) : (
                  reports.map(report => (
                    <div
                      key={report.id}
                      className="p-3 bg-charcoal-50 dark:bg-charcoal-700/50 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-charcoal-900 dark:text-white text-sm truncate">
                          {report.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => loadReport(report)}
                            className="p-1 text-charcoal-400 hover:text-primary-600"
                            title="Open"
                          >
                            <FolderOpen className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => duplicateReport(report)}
                            className="p-1 text-charcoal-400 hover:text-charcoal-600"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteReport(report.id)}
                            className="p-1 text-charcoal-400 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-charcoal-400 dark:text-charcoal-500">
                        {report.widgets?.length || 0} widgets • Updated {format(report.updatedAt || new Date(), 'MMM d')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Widget Types */}
            {!showTemplates && !showSavedReports && (
              <>
                <div className="p-4 border-b border-charcoal-200 dark:border-charcoal-700">
                  <h3 className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wide mb-3">
                    Add Widgets
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(WIDGET_TYPES).map(([type, config]) => {
                      const Icon = ICONS[config.icon] || FileText;
                      return (
                        <button
                          key={type}
                          onClick={() => addWidget(type)}
                          className="p-3 text-center bg-charcoal-50 dark:bg-charcoal-700/50 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors"
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1 text-charcoal-600 dark:text-charcoal-400" />
                          <p className="text-xs font-medium text-charcoal-700 dark:text-charcoal-300">
                            {config.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Data Sources */}
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wide mb-3">
                    Data Sources
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(groupedDataSources).map(([category, sources]) => (
                      <div key={category}>
                        <p className="text-xs font-medium text-charcoal-600 dark:text-charcoal-400 mb-2">
                          {category}
                        </p>
                        <div className="space-y-1">
                          {sources.map(source => (
                            <button
                              key={source.id}
                              onClick={() => addWidget(source.type, source.id)}
                              className="w-full p-2 text-left text-sm hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg transition-colors flex items-center justify-between group"
                            >
                              <span className="text-charcoal-700 dark:text-charcoal-300">
                                {source.name}
                              </span>
                              <Plus className="w-3 h-3 text-charcoal-400 opacity-0 group-hover:opacity-100" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Hide Palette Button */}
          {(showTemplates || showSavedReports) && (
            <div className="p-4 border-t border-charcoal-200 dark:border-charcoal-700">
              <button
                onClick={() => { setShowTemplates(false); setShowSavedReports(false); }}
                className="w-full px-4 py-2 text-sm text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white"
              >
                ← Back to Widgets
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="bg-white dark:bg-charcoal-800 border-b border-charcoal-200 dark:border-charcoal-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!showSidebar && !isPreviewMode && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg"
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
              )}

              {/* Report Name */}
              <div>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => { setReportName(e.target.value); setHasUnsavedChanges(true); }}
                  className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-charcoal-900 dark:text-white"
                  placeholder="Report Name"
                  disabled={isPreviewMode}
                />
                {hasUnsavedChanges && (
                  <span className="text-xs text-amber-500 ml-2">Unsaved changes</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-3 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                  isPreviewMode
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-700'
                }`}
              >
                {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {isPreviewMode ? 'Edit' : 'Preview'}
              </button>

              <div className="w-px h-6 bg-charcoal-200 dark:bg-charcoal-700" />

              <button
                onClick={saveReport}
                disabled={!hasUnsavedChanges && currentReport}
                className="px-3 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>

              <div className="relative group">
                <button className="px-3 py-2 text-sm text-charcoal-600 dark:text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-lg flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => exportReport('pdf')}
                    className="w-full px-4 py-2 text-sm text-left text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 first:rounded-t-lg"
                  >
                    Export as PDF
                  </button>
                  <button
                    onClick={() => exportReport('png')}
                    className="w-full px-4 py-2 text-sm text-left text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700"
                  >
                    Export as PNG
                  </button>
                  <button
                    onClick={() => exportReport('html')}
                    className="w-full px-4 py-2 text-sm text-left text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 last:rounded-b-lg"
                  >
                    Export as HTML
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-6">
          <div
            ref={canvasRef}
            className={`mx-auto transition-all ${isPreviewMode ? 'max-w-5xl' : 'max-w-4xl'}`}
            style={{ minHeight: canvasHeight }}
          >
            {widgets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <div className="p-4 bg-charcoal-100 dark:bg-charcoal-800 rounded-full mb-4">
                  <Layout className="w-8 h-8 text-charcoal-400" />
                </div>
                <h3 className="text-lg font-medium text-charcoal-900 dark:text-white mb-2">
                  Start Building Your Report
                </h3>
                <p className="text-charcoal-500 dark:text-charcoal-400 mb-4 max-w-md">
                  Choose a template to get started quickly, or add widgets from the sidebar to build a custom report.
                </p>
                <button
                  onClick={() => setShowTemplates(true)}
                  className="btn btn-primary"
                >
                  Browse Templates
                </button>
              </div>
            ) : (
              <div
                className="relative"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                  gap: GRID_GAP,
                  minHeight: canvasHeight
                }}
              >
                {/* Grid Background (Edit mode only) */}
                {!isPreviewMode && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)
                      `,
                      backgroundSize: `calc((100% - ${(GRID_COLS - 1) * GRID_GAP}px) / ${GRID_COLS} + ${GRID_GAP}px) ${GRID_ROW_HEIGHT + GRID_GAP}px`
                    }}
                  />
                )}

                {/* Widgets */}
                {widgets.map(widget => (
                  <div
                    key={widget.id}
                    className={`relative transition-shadow ${
                      !isPreviewMode && selectedWidget === widget.id
                        ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-charcoal-900'
                        : ''
                    }`}
                    style={{
                      gridColumn: `${widget.position.x + 1} / span ${widget.position.w}`,
                      gridRow: `${widget.position.y + 1} / span ${widget.position.h}`
                    }}
                    onClick={() => !isPreviewMode && setSelectedWidget(widget.id)}
                  >
                    <div className={`h-full bg-white dark:bg-charcoal-800 rounded-xl shadow-sm border border-charcoal-200 dark:border-charcoal-700 overflow-hidden ${
                      !isPreviewMode ? 'cursor-pointer hover:shadow-md' : ''
                    }`}>
                      <ReportWidgetRenderer
                        widget={widget}
                        isPreview={isPreviewMode}
                        data={getMockDataForSource(widget.dataSource)}
                      />
                    </div>

                    {/* Widget Controls (Edit mode) */}
                    {!isPreviewMode && selectedWidget === widget.id && (
                      <div className="absolute -top-3 -right-3 flex items-center gap-1 bg-white dark:bg-charcoal-700 rounded-lg shadow-lg border border-charcoal-200 dark:border-charcoal-600 p-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); moveWidget(widget.id, 'up'); }}
                          className="p-1 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300"
                          title="Move up"
                        >
                          <ChevronLeft className="w-4 h-4 rotate-90" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); moveWidget(widget.id, 'down'); }}
                          className="p-1 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300"
                          title="Move down"
                        >
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); resizeWidget(widget.id, { w: 1, h: 0 }); }}
                          className="p-1 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300"
                          title="Wider"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); resizeWidget(widget.id, { w: -1, h: 0 }); }}
                          className="p-1 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300"
                          title="Narrower"
                        >
                          <Minimize2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); duplicateWidget(widget); }}
                          className="p-1 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeWidget(widget.id); }}
                          className="p-1 text-charcoal-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Widget Settings */}
      {!isPreviewMode && selectedWidgetData && (
        <div className="w-72 bg-white dark:bg-charcoal-800 border-l border-charcoal-200 dark:border-charcoal-700 flex flex-col">
          <div className="p-4 border-b border-charcoal-200 dark:border-charcoal-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-charcoal-900 dark:text-white">
                Widget Settings
              </h3>
              <button
                onClick={() => setSelectedWidget(null)}
                className="p-1 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Widget Type */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">
                Type
              </label>
              <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                {WIDGET_TYPES[selectedWidgetData.type]?.name}
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={selectedWidgetData.config.title || ''}
                onChange={(e) => updateWidget(selectedWidgetData.id, {
                  config: { ...selectedWidgetData.config, title: e.target.value }
                })}
                className="input text-sm"
              />
            </div>

            {/* Data Source */}
            {selectedWidgetData.type !== 'text' && selectedWidgetData.type !== 'divider' && (
              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">
                  Data Source
                </label>
                <select
                  value={selectedWidgetData.dataSource || ''}
                  onChange={(e) => updateWidget(selectedWidgetData.id, {
                    dataSource: e.target.value || null
                  })}
                  className="input text-sm"
                >
                  <option value="">Select data source...</option>
                  {Object.entries(groupedDataSources).map(([category, sources]) => (
                    <optgroup key={category} label={category}>
                      {sources
                        .filter(s => s.type === selectedWidgetData.type || selectedWidgetData.type === 'summary')
                        .map(source => (
                          <option key={source.id} value={source.id}>
                            {source.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            {/* Chart Type (for charts) */}
            {selectedWidgetData.type === 'chart' && (
              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">
                  Chart Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {WIDGET_TYPES.chart.chartTypes.map(chartType => (
                    <button
                      key={chartType}
                      onClick={() => updateWidget(selectedWidgetData.id, {
                        config: { ...selectedWidgetData.config, chartType }
                      })}
                      className={`p-2 text-xs rounded-lg border transition-colors ${
                        selectedWidgetData.config.chartType === chartType
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'border-charcoal-200 dark:border-charcoal-600 text-charcoal-600 dark:text-charcoal-400 hover:border-charcoal-300'
                      }`}
                    >
                      {chartType}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text Content (for text widgets) */}
            {selectedWidgetData.type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">
                  Content
                </label>
                <textarea
                  value={selectedWidgetData.config.content || ''}
                  onChange={(e) => updateWidget(selectedWidgetData.id, {
                    config: { ...selectedWidgetData.config, content: e.target.value }
                  })}
                  className="input text-sm resize-none"
                  rows={4}
                  placeholder="Enter text content..."
                />
              </div>
            )}

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">
                Size
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-charcoal-500 dark:text-charcoal-400">Width</label>
                  <input
                    type="number"
                    min={WIDGET_TYPES[selectedWidgetData.type].minSize.w}
                    max={WIDGET_TYPES[selectedWidgetData.type].maxSize.w}
                    value={selectedWidgetData.position.w}
                    onChange={(e) => updateWidget(selectedWidgetData.id, {
                      position: { ...selectedWidgetData.position, w: parseInt(e.target.value) || 1 }
                    })}
                    className="input text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-charcoal-500 dark:text-charcoal-400">Height</label>
                  <input
                    type="number"
                    min={WIDGET_TYPES[selectedWidgetData.type].minSize.h}
                    max={WIDGET_TYPES[selectedWidgetData.type].maxSize.h}
                    value={selectedWidgetData.position.h}
                    onChange={(e) => updateWidget(selectedWidgetData.id, {
                      position: { ...selectedWidgetData.position, h: parseInt(e.target.value) || 1 }
                    })}
                    className="input text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">
                Position
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-charcoal-500 dark:text-charcoal-400">Column</label>
                  <input
                    type="number"
                    min={0}
                    max={GRID_COLS - selectedWidgetData.position.w}
                    value={selectedWidgetData.position.x}
                    onChange={(e) => updateWidget(selectedWidgetData.id, {
                      position: { ...selectedWidgetData.position, x: parseInt(e.target.value) || 0 }
                    })}
                    className="input text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-charcoal-500 dark:text-charcoal-400">Row</label>
                  <input
                    type="number"
                    min={0}
                    value={selectedWidgetData.position.y}
                    onChange={(e) => updateWidget(selectedWidgetData.id, {
                      position: { ...selectedWidgetData.position, y: parseInt(e.target.value) || 0 }
                    })}
                    className="input text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Delete Widget */}
          <div className="p-4 border-t border-charcoal-200 dark:border-charcoal-700">
            <button
              onClick={() => removeWidget(selectedWidgetData.id)}
              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Widget
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
