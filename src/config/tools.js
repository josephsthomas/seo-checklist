/**
 * Centralized Tool Configuration
 *
 * This registry manages all tools in the Content Strategy Portal.
 * Adding a new tool only requires adding an entry here.
 */

import {
  ClipboardList,
  Search,
  BarChart3,
  FileText,
  Accessibility,
  Image,
  Tags,
  Code2,
  ScanEye
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
  ROSE: 'rose',
  TEAL: 'teal'
};

/**
 * Tool registry - single source of truth for all tools
 */
export const tools = [
  {
    id: 'planner',
    name: 'Content Planner',
    shortName: 'Planner',
    description: 'Comprehensive 353-item content and SEO checklist for website launches and refreshes. Track progress, assign tasks, and ensure nothing is missed.',
    icon: ClipboardList,
    path: '/app/planner',
    color: TOOL_COLORS.PRIMARY,
    status: TOOL_STATUS.ACTIVE,
    badge: null, // Dynamic - set based on project count
    features: [
      '353 content checklist items',
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
    path: '/app/audit',
    color: TOOL_COLORS.CYAN,
    status: TOOL_STATUS.ACTIVE,
    badge: null,
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
    id: 'accessibility',
    name: 'Accessibility Analyzer',
    shortName: 'A11y',
    description: 'WCAG 2.2 compliance auditing with 93 Axe-core rules. Analyze violations, get AI fix suggestions, and generate compliance reports.',
    icon: Accessibility,
    path: '/app/accessibility',
    color: TOOL_COLORS.PURPLE,
    status: TOOL_STATUS.ACTIVE,
    badge: 'New',
    features: [
      'WCAG 2.2 compliance',
      '93 Axe-core rules',
      'AI fix suggestions',
      'VPAT export'
    ],
    statsConfig: [
      { key: 'accessibilityAudits', label: 'Audits' },
      { key: 'criteria', label: 'WCAG Criteria', static: '87' }
    ],
    permissions: ['canRunAccessibilityAudits'],
    order: 3
  },
  {
    id: 'image-alt',
    name: 'Image Alt Text Generator',
    shortName: 'Alt Text',
    description: 'AI-powered alt text generation for images. Analyze single images or batch process up to 100, with EXIF embedding and SEO-friendly filenames.',
    icon: Image,
    path: '/app/image-alt',
    color: TOOL_COLORS.EMERALD,
    status: TOOL_STATUS.ACTIVE,
    badge: 'New',
    features: [
      'Claude Vision AI analysis',
      'Batch processing (100 images)',
      'EXIF metadata embedding',
      'SEO filename generation'
    ],
    statsConfig: [
      { key: 'imagesProcessed', label: 'Processed' },
      { key: 'formats', label: 'Formats', static: '6' }
    ],
    permissions: ['canGenerateAltText'],
    order: 4
  },
  {
    id: 'meta-generator',
    name: 'Meta Data Generator',
    shortName: 'Meta Gen',
    description: 'AI-powered SEO metadata generation from documents. Generate titles, descriptions, OG tags, and Twitter Cards from DOCX, PDF, HTML, or text files.',
    icon: Tags,
    path: '/app/meta-generator',
    color: TOOL_COLORS.AMBER,
    status: TOOL_STATUS.ACTIVE,
    badge: 'New',
    features: [
      'Multi-format support',
      'SERP preview',
      'Social card preview',
      'HTML code generation'
    ],
    statsConfig: [
      { key: 'documentsProcessed', label: 'Processed' },
      { key: 'formats', label: 'Formats', static: '5' }
    ],
    permissions: ['canGenerateMetadata'],
    order: 5
  },
  {
    id: 'schema-generator',
    name: 'Structured Data Generator',
    shortName: 'Schema',
    description: 'AI-powered JSON-LD schema markup generator. Analyze HTML content and generate production-ready schema.org structured data.',
    icon: Code2,
    path: '/app/schema-generator',
    color: TOOL_COLORS.ROSE,
    status: TOOL_STATUS.ACTIVE,
    badge: 'New',
    features: [
      '40+ schema types',
      'Rich snippet preview',
      'Google validation',
      'Batch processing'
    ],
    statsConfig: [
      { key: 'schemasGenerated', label: 'Generated' },
      { key: 'schemaTypes', label: 'Types', static: '40+' }
    ],
    permissions: ['canGenerateSchema'],
    order: 6
  },
  {
    id: 'readability',
    name: 'AI Readability Checker',
    shortName: 'Readability',
    description: 'Analyze how AI models read and interpret your content. Get actionable recommendations to improve visibility in AI-generated answers.',
    icon: ScanEye,
    path: '/app/readability',
    color: TOOL_COLORS.TEAL,
    status: TOOL_STATUS.ACTIVE,
    badge: 'New',
    features: [
      'AI readability scoring',
      'How AI sees your content',
      'Actionable recommendations',
      'URL and HTML analysis'
    ],
    statsConfig: [
      { key: 'analysisCount', label: 'Analyzed' },
      { key: 'avgScore', label: 'Avg Score' }
    ],
    permissions: ['canRunReadabilityCheck'],
    order: 7
  },
  {
    id: 'analytics',
    name: 'Analytics Dashboard',
    shortName: 'Analytics',
    description: 'Unified analytics view combining data from Google Analytics, Search Console, and other sources.',
    icon: BarChart3,
    path: '/app/analytics',
    color: TOOL_COLORS.CYAN,
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
    order: 8
  },
  {
    id: 'content',
    name: 'Content Optimizer',
    shortName: 'Content',
    description: 'AI-powered content analysis and optimization recommendations for better search rankings.',
    icon: FileText,
    path: '/app/content',
    color: TOOL_COLORS.PURPLE,
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
    order: 9
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
