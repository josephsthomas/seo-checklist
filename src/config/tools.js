/**
 * Centralized Tool Configuration
 *
 * This registry manages all tools in the Flipside SEO Portal.
 * Adding a new tool only requires adding an entry here.
 */

import {
  ClipboardList,
  Search,
  BarChart3,
  FileText,
  LineChart,
  Target,
  Globe,
  Zap
} from 'lucide-react';

/**
 * Tool status enum
 */
export const TOOL_STATUS = {
  ACTIVE: 'active',
  COMING_SOON: 'coming_soon',
  BETA: 'beta',
  DEPRECATED: 'deprecated'
};

/**
 * Tool color themes
 */
export const TOOL_COLORS = {
  PRIMARY: 'primary',
  CYAN: 'cyan',
  PURPLE: 'purple',
  EMERALD: 'emerald',
  AMBER: 'amber',
  ROSE: 'rose'
};

/**
 * Tool registry - single source of truth for all tools
 */
export const tools = [
  {
    id: 'planner',
    name: 'SEO Planner',
    shortName: 'Planner',
    description: 'Comprehensive 321-item SEO checklist for website launches and refreshes. Track progress, assign tasks, and ensure nothing is missed.',
    icon: ClipboardList,
    path: '/planner',
    color: TOOL_COLORS.PRIMARY,
    status: TOOL_STATUS.ACTIVE,
    badge: null, // Dynamic - set based on project count
    features: [
      '321 SEO checklist items',
      'Project tracking',
      'Team collaboration',
      'PDF & Excel export'
    ],
    statsConfig: [
      { key: 'activeProjects', label: 'Active' },
      { key: 'completedProjects', label: 'Done' }
    ],
    permissions: ['canViewProjects'],
    order: 1
  },
  {
    id: 'audit',
    name: 'Technical Audit',
    shortName: 'Audit',
    description: 'Upload Screaming Frog exports to generate comprehensive technical SEO audits with AI-powered recommendations.',
    icon: Search,
    path: '/audit',
    color: TOOL_COLORS.CYAN,
    status: TOOL_STATUS.ACTIVE,
    badge: 'New',
    features: [
      '31 audit categories',
      'AI recommendations',
      'Core Web Vitals analysis',
      'Shareable reports'
    ],
    statsConfig: [
      { key: 'auditCount', label: 'Audits' },
      { key: 'categories', label: 'Categories', static: '31' }
    ],
    permissions: ['canRunAudits'],
    order: 2
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    shortName: 'Analytics',
    description: 'Unified analytics view combining data from Google Analytics, Search Console, and other sources.',
    icon: BarChart3,
    path: '/analytics',
    color: TOOL_COLORS.PURPLE,
    status: TOOL_STATUS.COMING_SOON,
    badge: null,
    features: [
      'Multi-source integration',
      'Custom dashboards',
      'Trend analysis',
      'Automated reporting'
    ],
    statsConfig: [],
    permissions: ['canViewAnalytics'],
    order: 3
  },
  {
    id: 'content',
    name: 'Content Optimizer',
    shortName: 'Content',
    description: 'AI-powered content analysis and optimization recommendations for better search rankings.',
    icon: FileText,
    path: '/content',
    color: TOOL_COLORS.EMERALD,
    status: TOOL_STATUS.COMING_SOON,
    badge: null,
    features: [
      'AI content scoring',
      'Keyword optimization',
      'Readability analysis',
      'Competitor comparison'
    ],
    statsConfig: [],
    permissions: ['canOptimizeContent'],
    order: 4
  }
];

/**
 * Get active tools only
 */
export function getActiveTools() {
  return tools.filter(tool => tool.status === TOOL_STATUS.ACTIVE);
}

/**
 * Get coming soon tools
 */
export function getComingSoonTools() {
  return tools.filter(tool => tool.status === TOOL_STATUS.COMING_SOON);
}

/**
 * Get all visible tools (active + coming soon, sorted by order)
 */
export function getVisibleTools() {
  return tools
    .filter(tool => tool.status !== TOOL_STATUS.DEPRECATED)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get tool by ID
 */
export function getToolById(id) {
  return tools.find(tool => tool.id === id);
}

/**
 * Get tool by path
 */
export function getToolByPath(path) {
  return tools.find(tool => path.startsWith(tool.path));
}

/**
 * Check if a tool is active
 */
export function isToolActive(id) {
  const tool = getToolById(id);
  return tool?.status === TOOL_STATUS.ACTIVE;
}

/**
 * Navigation items for tools dropdown
 */
export function getToolsNavigation() {
  return getActiveTools().map(tool => ({
    name: tool.name,
    path: tool.path,
    icon: tool.icon,
    description: tool.features[0],
    badge: tool.badge,
    color: tool.color
  }));
}

export default tools;
