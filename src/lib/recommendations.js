/**
 * Cross-Tool Recommendations Engine
 * Suggests relevant tools based on current context
 */

// Tool definitions with recommendation logic
export const TOOLS = {
  planner: {
    id: 'planner',
    name: 'Content Planner',
    description: 'SEO checklist with 321 items',
    path: '/planner',
    icon: 'ClipboardList',
    color: 'primary',
    keywords: ['checklist', 'project', 'seo', 'planning', 'strategy']
  },
  audit: {
    id: 'audit',
    name: 'Technical Audit',
    description: 'Analyze Screaming Frog exports',
    path: '/audit',
    icon: 'Search',
    color: 'cyan',
    keywords: ['audit', 'technical', 'crawl', 'screaming frog', 'issues']
  },
  accessibility: {
    id: 'accessibility',
    name: 'Accessibility Analyzer',
    description: 'WCAG 2.2 compliance audits',
    path: '/accessibility',
    icon: 'Accessibility',
    color: 'purple',
    keywords: ['accessibility', 'wcag', 'a11y', 'aria', 'screen reader']
  },
  'image-alt': {
    id: 'image-alt',
    name: 'Image Alt Generator',
    description: 'AI-powered alt text for images',
    path: '/image-alt',
    icon: 'Image',
    color: 'emerald',
    keywords: ['image', 'alt', 'text', 'accessibility', 'vision']
  },
  'meta-generator': {
    id: 'meta-generator',
    name: 'Meta Data Generator',
    description: 'Generate titles and descriptions',
    path: '/meta-generator',
    icon: 'Tags',
    color: 'amber',
    keywords: ['meta', 'title', 'description', 'og', 'social']
  },
  'schema-generator': {
    id: 'schema-generator',
    name: 'Schema Generator',
    description: 'JSON-LD structured data',
    path: '/schema-generator',
    icon: 'Code2',
    color: 'rose',
    keywords: ['schema', 'json-ld', 'structured data', 'rich snippets']
  }
};

// Recommendation rules based on context
const RECOMMENDATION_RULES = [
  // After Technical Audit
  {
    context: 'audit',
    condition: (data) => data?.hasAccessibilityIssues || data?.healthScore < 70,
    recommend: ['accessibility', 'image-alt'],
    reason: 'Found potential accessibility issues in your audit'
  },
  {
    context: 'audit',
    condition: (data) => data?.hasMissingMeta,
    recommend: ['meta-generator'],
    reason: 'Your audit shows missing meta data'
  },
  {
    context: 'audit',
    condition: (data) => data?.hasSchemaIssues,
    recommend: ['schema-generator'],
    reason: 'Structured data issues detected'
  },

  // After Accessibility Audit
  {
    context: 'accessibility',
    condition: (data) => data?.hasImageIssues,
    recommend: ['image-alt'],
    reason: 'Missing or inadequate alt text found'
  },

  // After Meta Generator
  {
    context: 'meta-generator',
    condition: () => true,
    recommend: ['schema-generator'],
    reason: 'Complete your page optimization with structured data'
  },

  // After Image Alt Generator
  {
    context: 'image-alt',
    condition: () => true,
    recommend: ['accessibility', 'meta-generator'],
    reason: 'Continue improving your content'
  },

  // After Schema Generator
  {
    context: 'schema-generator',
    condition: () => true,
    recommend: ['audit'],
    reason: 'Validate your changes with a technical audit'
  },

  // Project Planner - Phase-based
  {
    context: 'planner',
    condition: (data) => data?.phase === 'Discovery',
    recommend: ['audit'],
    reason: 'Start with a technical audit for the Discovery phase'
  },
  {
    context: 'planner',
    condition: (data) => data?.phase === 'Strategy',
    recommend: ['meta-generator', 'schema-generator'],
    reason: 'Plan your content optimization for the Strategy phase'
  },
  {
    context: 'planner',
    condition: (data) => data?.phase === 'Build',
    recommend: ['image-alt', 'accessibility'],
    reason: 'Ensure content quality during the Build phase'
  },
  {
    context: 'planner',
    condition: (data) => data?.phase === 'Pre-Launch' || data?.phase === 'Launch',
    recommend: ['audit', 'accessibility'],
    reason: 'Final checks before launch'
  }
];

/**
 * Get tool recommendations based on current context
 * @param {string} currentTool - The ID of the current tool
 * @param {object} contextData - Additional context data
 * @param {number} limit - Maximum number of recommendations
 * @returns {Array} Array of recommended tools with reasons
 */
export function getRecommendations(currentTool, contextData = {}, limit = 3) {
  const recommendations = [];
  const seenTools = new Set([currentTool]);

  // Find matching rules
  for (const rule of RECOMMENDATION_RULES) {
    if (rule.context === currentTool && rule.condition(contextData)) {
      for (const toolId of rule.recommend) {
        if (!seenTools.has(toolId)) {
          seenTools.add(toolId);
          const tool = TOOLS[toolId];
          if (tool) {
            recommendations.push({
              ...tool,
              reason: rule.reason,
              priority: recommendations.length // Earlier rules have higher priority
            });
          }
        }
      }
    }
  }

  // If we don't have enough recommendations, add general suggestions
  if (recommendations.length < limit) {
    const allTools = Object.values(TOOLS).filter(t => !seenTools.has(t.id));
    const shuffled = allTools.sort(() => Math.random() - 0.5);

    for (const tool of shuffled) {
      if (recommendations.length >= limit) break;
      recommendations.push({
        ...tool,
        reason: 'Explore more tools',
        priority: 100 // Low priority for random suggestions
      });
    }
  }

  return recommendations.slice(0, limit);
}

/**
 * Get recommendations for home page based on user activity
 * @param {object} activity - User activity data (recents, favorites, etc.)
 * @returns {Array} Array of recommended tools
 */
export function getHomeRecommendations(activity = {}) {
  const recommendations = [];
  const { recents = [], projects = [], audits = [] } = activity;

  // If user has no activity, recommend getting started
  if (recents.length === 0 && projects.length === 0) {
    return [
      {
        ...TOOLS.planner,
        reason: 'Start by creating a content project',
        priority: 0
      },
      {
        ...TOOLS.audit,
        reason: 'Or run a quick technical audit',
        priority: 1
      }
    ];
  }

  // Recommend based on incomplete projects
  if (projects.some(p => p.progress < 50)) {
    recommendations.push({
      ...TOOLS.planner,
      reason: 'Continue your ongoing projects',
      priority: 0
    });
  }

  // Recommend audit if none done recently
  const recentAuditCount = recents.filter(r => r.type === 'audit').length;
  if (recentAuditCount === 0 && audits.length === 0) {
    recommendations.push({
      ...TOOLS.audit,
      reason: 'Run a technical audit to identify issues',
      priority: 1
    });
  }

  // Add underutilized tools
  const usedToolIds = new Set(recents.map(r => r.icon || r.type));
  const unusedTools = Object.values(TOOLS).filter(t => !usedToolIds.has(t.id));

  for (const tool of unusedTools) {
    if (recommendations.length >= 4) break;
    recommendations.push({
      ...tool,
      reason: 'Try this tool',
      priority: recommendations.length + 10
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 4);
}

/**
 * Get contextual tip based on tool usage
 * @param {string} toolId - Current tool ID
 * @param {object} data - Tool-specific data
 * @returns {object|null} Contextual tip
 */
export function getContextualTip(toolId, data = {}) {
  const tips = {
    audit: [
      {
        condition: (d) => d?.healthScore >= 90,
        title: 'Great health score!',
        message: 'Your site is in good shape. Consider running an accessibility audit next.',
        action: { label: 'Run Accessibility Audit', path: '/accessibility' }
      },
      {
        condition: (d) => d?.healthScore < 50,
        title: 'Needs attention',
        message: 'Focus on fixing critical issues first. Start with the highest priority items.',
        action: null
      }
    ],
    accessibility: [
      {
        condition: (d) => d?.totalViolations === 0,
        title: 'WCAG Compliant!',
        message: 'No accessibility violations found. Great job!',
        action: null
      },
      {
        condition: (d) => d?.imageViolations > 0,
        title: 'Image accessibility issues',
        message: 'Use our Image Alt Generator to create proper alt text.',
        action: { label: 'Generate Alt Text', path: '/image-alt' }
      }
    ],
    'meta-generator': [
      {
        condition: () => true,
        title: 'Complete your optimization',
        message: 'Add structured data to enhance your search appearance.',
        action: { label: 'Generate Schema', path: '/schema-generator' }
      }
    ]
  };

  const toolTips = tips[toolId] || [];
  for (const tip of toolTips) {
    if (tip.condition(data)) {
      return tip;
    }
  }

  return null;
}

export default {
  TOOLS,
  getRecommendations,
  getHomeRecommendations,
  getContextualTip
};
