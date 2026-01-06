import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * Hook for managing custom report templates
 */

// Available data sources for widgets
export const DATA_SOURCES = {
  // SEO Audit data
  'audit-score': {
    name: 'Audit Score',
    category: 'Technical Audit',
    type: 'metric',
    description: 'Overall SEO audit score'
  },
  'audit-issues': {
    name: 'Issue Breakdown',
    category: 'Technical Audit',
    type: 'chart',
    description: 'Critical, warnings, and info issues'
  },
  'audit-categories': {
    name: 'Category Scores',
    category: 'Technical Audit',
    type: 'chart',
    description: 'Scores by audit category'
  },
  'audit-pages': {
    name: 'Pages Audited',
    category: 'Technical Audit',
    type: 'metric',
    description: 'Number of pages scanned'
  },
  'audit-history': {
    name: 'Score Trend',
    category: 'Technical Audit',
    type: 'chart',
    description: 'Historical score changes'
  },

  // Accessibility data
  'a11y-score': {
    name: 'Accessibility Score',
    category: 'Accessibility',
    type: 'metric',
    description: 'WCAG compliance score'
  },
  'a11y-violations': {
    name: 'Violations by Level',
    category: 'Accessibility',
    type: 'chart',
    description: 'A, AA, AAA violations'
  },
  'a11y-issues': {
    name: 'Top Issues',
    category: 'Accessibility',
    type: 'table',
    description: 'Most common accessibility issues'
  },

  // Content/Checklist data
  'checklist-progress': {
    name: 'Checklist Progress',
    category: 'Content',
    type: 'metric',
    description: 'Overall completion percentage'
  },
  'checklist-categories': {
    name: 'Category Progress',
    category: 'Content',
    type: 'chart',
    description: 'Progress by checklist category'
  },
  'checklist-pending': {
    name: 'Pending Items',
    category: 'Content',
    type: 'table',
    description: 'Incomplete checklist items'
  },

  // Project data
  'project-health': {
    name: 'Project Health',
    category: 'Project',
    type: 'metric',
    description: 'Overall project health score'
  },
  'project-tasks': {
    name: 'Task Status',
    category: 'Project',
    type: 'chart',
    description: 'Tasks by status'
  },
  'project-team': {
    name: 'Team Activity',
    category: 'Project',
    type: 'table',
    description: 'Recent team member activity'
  },

  // Meta/Schema data
  'meta-analysis': {
    name: 'Meta Tag Health',
    category: 'Meta & Schema',
    type: 'metric',
    description: 'Meta tag optimization score'
  },
  'schema-coverage': {
    name: 'Schema Coverage',
    category: 'Meta & Schema',
    type: 'chart',
    description: 'Schema types implemented'
  },

  // Image data
  'image-alt-coverage': {
    name: 'Alt Text Coverage',
    category: 'Images',
    type: 'metric',
    description: 'Images with alt text percentage'
  },
  'image-issues': {
    name: 'Image Issues',
    category: 'Images',
    type: 'table',
    description: 'Images missing alt text'
  }
};

// Widget types with their configurations
export const WIDGET_TYPES = {
  metric: {
    name: 'Metric Card',
    description: 'Single value with optional comparison',
    icon: 'Hash',
    defaultSize: { w: 1, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 2, h: 1 }
  },
  chart: {
    name: 'Chart',
    description: 'Visual data representation',
    icon: 'BarChart3',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 4, h: 3 },
    chartTypes: ['bar', 'line', 'pie', 'donut', 'area']
  },
  table: {
    name: 'Data Table',
    description: 'Tabular data display',
    icon: 'Table',
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 4, h: 4 }
  },
  text: {
    name: 'Text Block',
    description: 'Custom text or notes',
    icon: 'Type',
    defaultSize: { w: 2, h: 1 },
    minSize: { w: 1, h: 1 },
    maxSize: { w: 4, h: 2 }
  },
  divider: {
    name: 'Section Divider',
    description: 'Visual separator with optional title',
    icon: 'Minus',
    defaultSize: { w: 4, h: 1 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 4, h: 1 }
  },
  summary: {
    name: 'Executive Summary',
    description: 'Auto-generated summary section',
    icon: 'FileText',
    defaultSize: { w: 4, h: 2 },
    minSize: { w: 2, h: 1 },
    maxSize: { w: 4, h: 3 }
  }
};

// Report templates
export const REPORT_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Report',
    description: 'Start from scratch',
    icon: 'Plus',
    widgets: []
  },
  {
    id: 'seo-overview',
    name: 'SEO Overview',
    description: 'Comprehensive SEO health report',
    icon: 'Globe',
    widgets: [
      { id: '1', type: 'summary', dataSource: null, config: { title: 'Executive Summary' }, position: { x: 0, y: 0, w: 4, h: 2 } },
      { id: '2', type: 'metric', dataSource: 'audit-score', config: { title: 'SEO Score' }, position: { x: 0, y: 2, w: 1, h: 1 } },
      { id: '3', type: 'metric', dataSource: 'audit-pages', config: { title: 'Pages Analyzed' }, position: { x: 1, y: 2, w: 1, h: 1 } },
      { id: '4', type: 'metric', dataSource: 'checklist-progress', config: { title: 'Checklist' }, position: { x: 2, y: 2, w: 1, h: 1 } },
      { id: '5', type: 'metric', dataSource: 'a11y-score', config: { title: 'Accessibility' }, position: { x: 3, y: 2, w: 1, h: 1 } },
      { id: '6', type: 'chart', dataSource: 'audit-issues', config: { title: 'Issues Overview', chartType: 'donut' }, position: { x: 0, y: 3, w: 2, h: 2 } },
      { id: '7', type: 'chart', dataSource: 'audit-history', config: { title: 'Score Trend', chartType: 'line' }, position: { x: 2, y: 3, w: 2, h: 2 } }
    ]
  },
  {
    id: 'accessibility-report',
    name: 'Accessibility Report',
    description: 'WCAG compliance summary',
    icon: 'Shield',
    widgets: [
      { id: '1', type: 'text', dataSource: null, config: { title: 'Accessibility Audit Report', content: 'This report summarizes the WCAG compliance status of your website.' }, position: { x: 0, y: 0, w: 4, h: 1 } },
      { id: '2', type: 'metric', dataSource: 'a11y-score', config: { title: 'Compliance Score' }, position: { x: 0, y: 1, w: 2, h: 1 } },
      { id: '3', type: 'chart', dataSource: 'a11y-violations', config: { title: 'Violations by WCAG Level', chartType: 'bar' }, position: { x: 2, y: 1, w: 2, h: 2 } },
      { id: '4', type: 'table', dataSource: 'a11y-issues', config: { title: 'Top Accessibility Issues', rows: 10 }, position: { x: 0, y: 2, w: 2, h: 2 } }
    ]
  },
  {
    id: 'project-status',
    name: 'Project Status',
    description: 'Team progress and activity',
    icon: 'Users',
    widgets: [
      { id: '1', type: 'metric', dataSource: 'project-health', config: { title: 'Project Health' }, position: { x: 0, y: 0, w: 1, h: 1 } },
      { id: '2', type: 'metric', dataSource: 'checklist-progress', config: { title: 'Completion' }, position: { x: 1, y: 0, w: 1, h: 1 } },
      { id: '3', type: 'chart', dataSource: 'project-tasks', config: { title: 'Task Status', chartType: 'pie' }, position: { x: 2, y: 0, w: 2, h: 2 } },
      { id: '4', type: 'chart', dataSource: 'checklist-categories', config: { title: 'Category Progress', chartType: 'bar' }, position: { x: 0, y: 1, w: 2, h: 2 } },
      { id: '5', type: 'table', dataSource: 'project-team', config: { title: 'Recent Activity', rows: 5 }, position: { x: 0, y: 3, w: 4, h: 2 } }
    ]
  },
  {
    id: 'technical-deep-dive',
    name: 'Technical Deep Dive',
    description: 'Detailed technical analysis',
    icon: 'Code',
    widgets: [
      { id: '1', type: 'metric', dataSource: 'audit-score', config: { title: 'Overall Score' }, position: { x: 0, y: 0, w: 1, h: 1 } },
      { id: '2', type: 'metric', dataSource: 'audit-pages', config: { title: 'Pages Scanned' }, position: { x: 1, y: 0, w: 1, h: 1 } },
      { id: '3', type: 'metric', dataSource: 'meta-analysis', config: { title: 'Meta Health' }, position: { x: 2, y: 0, w: 1, h: 1 } },
      { id: '4', type: 'metric', dataSource: 'image-alt-coverage', config: { title: 'Image Coverage' }, position: { x: 3, y: 0, w: 1, h: 1 } },
      { id: '5', type: 'chart', dataSource: 'audit-categories', config: { title: 'Category Breakdown', chartType: 'bar' }, position: { x: 0, y: 1, w: 2, h: 2 } },
      { id: '6', type: 'chart', dataSource: 'schema-coverage', config: { title: 'Schema Implementation', chartType: 'donut' }, position: { x: 2, y: 1, w: 2, h: 2 } },
      { id: '7', type: 'table', dataSource: 'image-issues', config: { title: 'Image Issues', rows: 5 }, position: { x: 0, y: 3, w: 2, h: 2 } },
      { id: '8', type: 'table', dataSource: 'checklist-pending', config: { title: 'Pending Items', rows: 5 }, position: { x: 2, y: 3, w: 2, h: 2 } }
    ]
  }
];

export default function useReportBuilder() {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user's saved reports
  useEffect(() => {
    if (!currentUser) {
      setReports([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'customReports'),
      where('userId', '==', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const reportList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate()
        }));
        setReports(reportList);
        setLoading(false);
      },
      (err) => {
        console.error('Error loading reports:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Create new report
  const createReport = useCallback(async (reportData) => {
    if (!currentUser) {
      toast.error('Please sign in to save reports');
      return null;
    }

    try {
      const docRef = await addDoc(collection(db, 'customReports'), {
        ...reportData,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast.success('Report created');
      return docRef.id;
    } catch (err) {
      console.error('Error creating report:', err);
      toast.error('Failed to create report');
      return null;
    }
  }, [currentUser]);

  // Update existing report
  const updateReport = useCallback(async (reportId, updates) => {
    if (!currentUser) return false;

    try {
      await updateDoc(doc(db, 'customReports', reportId), {
        ...updates,
        updatedAt: serverTimestamp()
      });

      toast.success('Report saved');
      return true;
    } catch (err) {
      console.error('Error updating report:', err);
      toast.error('Failed to save report');
      return false;
    }
  }, [currentUser]);

  // Delete report
  const deleteReport = useCallback(async (reportId) => {
    if (!currentUser) return false;

    try {
      await deleteDoc(doc(db, 'customReports', reportId));
      toast.success('Report deleted');
      return true;
    } catch (err) {
      console.error('Error deleting report:', err);
      toast.error('Failed to delete report');
      return false;
    }
  }, [currentUser]);

  // Duplicate report
  const duplicateReport = useCallback(async (report) => {
    const newReport = {
      name: `${report.name} (Copy)`,
      description: report.description,
      widgets: [...report.widgets],
      settings: { ...report.settings }
    };

    return createReport(newReport);
  }, [createReport]);

  return {
    reports,
    loading,
    error,
    createReport,
    updateReport,
    deleteReport,
    duplicateReport,
    templates: REPORT_TEMPLATES,
    dataSources: DATA_SOURCES,
    widgetTypes: WIDGET_TYPES
  };
}

/**
 * Generate unique widget ID
 */
export function generateWidgetId() {
  return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get mock data for a data source (for preview)
 */
export function getMockDataForSource(sourceId) {
  const mockData = {
    'audit-score': { value: 78, change: 5, trend: 'up' },
    'audit-issues': { critical: 3, warnings: 12, info: 8 },
    'audit-categories': [
      { name: 'Meta Tags', score: 85 },
      { name: 'Headings', score: 72 },
      { name: 'Images', score: 68 },
      { name: 'Links', score: 90 },
      { name: 'Performance', score: 75 }
    ],
    'audit-pages': { value: 156, label: 'pages' },
    'audit-history': [
      { date: '2024-01', score: 65 },
      { date: '2024-02', score: 68 },
      { date: '2024-03', score: 72 },
      { date: '2024-04', score: 75 },
      { date: '2024-05', score: 78 }
    ],
    'a11y-score': { value: 85, level: 'AA', change: 3, trend: 'up' },
    'a11y-violations': { A: 2, AA: 5, AAA: 12 },
    'a11y-issues': [
      { issue: 'Missing alt text', count: 12, severity: 'critical' },
      { issue: 'Low color contrast', count: 8, severity: 'serious' },
      { issue: 'Missing form labels', count: 5, severity: 'serious' },
      { issue: 'Empty links', count: 3, severity: 'moderate' }
    ],
    'checklist-progress': { value: 67, completed: 45, total: 67 },
    'checklist-categories': [
      { name: 'Technical', progress: 80 },
      { name: 'Content', progress: 65 },
      { name: 'On-Page', progress: 72 },
      { name: 'Off-Page', progress: 45 }
    ],
    'checklist-pending': [
      { item: 'Add schema markup', priority: 'high', category: 'Technical' },
      { item: 'Optimize images', priority: 'medium', category: 'Content' },
      { item: 'Fix broken links', priority: 'high', category: 'Technical' }
    ],
    'project-health': { value: 82, status: 'good' },
    'project-tasks': { completed: 24, inProgress: 8, pending: 12 },
    'project-team': [
      { member: 'John D.', action: 'Completed audit', time: '2h ago' },
      { member: 'Sarah M.', action: 'Added comment', time: '4h ago' },
      { member: 'Mike R.', action: 'Updated checklist', time: '1d ago' }
    ],
    'meta-analysis': { value: 72, issues: 5 },
    'schema-coverage': [
      { type: 'Organization', status: 'implemented' },
      { type: 'Article', status: 'implemented' },
      { type: 'Product', status: 'missing' },
      { type: 'FAQ', status: 'missing' }
    ],
    'image-alt-coverage': { value: 84, withAlt: 156, total: 186 },
    'image-issues': [
      { image: 'hero-banner.jpg', issue: 'Missing alt', page: '/home' },
      { image: 'product-1.png', issue: 'Generic alt', page: '/products' },
      { image: 'team-photo.jpg', issue: 'Missing alt', page: '/about' }
    ]
  };

  return mockData[sourceId] || null;
}
