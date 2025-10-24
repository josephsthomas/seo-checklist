// Help content for all 321 checklist items
// Provides detailed explanations, tips, and resources for each task

export const helpContent = {
  // Discovery Phase
  1: {
    description: "A comprehensive SEO audit examines your current site's search performance, technical health, and optimization opportunities.",
    tips: [
      "Use tools like Screaming Frog, Semrush, or Ahrefs for technical crawling",
      "Document all current rankings in a spreadsheet before making changes",
      "Include mobile vs desktop performance comparison",
      "Check for any existing penalties in Google Search Console"
    ],
    resources: [
      { title: "SEO Audit Checklist", url: "https://moz.com/learn/seo/seo-audit" },
      { title: "Using Screaming Frog", url: "https://www.screamingfrog.co.uk/seo-spider/" }
    ],
    estimatedTime: "40+ hours",
    difficulty: "Advanced"
  },
  2: {
    description: "Competitive analysis reveals what's working for your competitors and identifies opportunities for your strategy.",
    tips: [
      "Analyze top 10 ranking sites for your target keywords",
      "Compare domain authority, backlink profiles, and content depth",
      "Identify content gaps you can fill",
      "Look for common patterns in top-ranking pages"
    ],
    resources: [
      { title: "Competitive Analysis Guide", url: "https://ahrefs.com/blog/competitive-analysis/" }
    ],
    estimatedTime: "8-40 hours",
    difficulty: "Intermediate"
  },
  3: {
    description: "Keyword research is the foundation of SEO strategy. It identifies what terms your target audience searches for.",
    tips: [
      "Use Google Keyword Planner, Ahrefs, or Semrush",
      "Focus on search intent: informational, navigational, transactional",
      "Don't ignore long-tail keywords with lower competition",
      "Group keywords by topic clusters"
    ],
    resources: [
      { title: "Keyword Research Guide", url: "https://backlinko.com/keyword-research" }
    ],
    estimatedTime: "40+ hours",
    difficulty: "Intermediate"
  },
  // Add more help content for remaining items (abbreviated for space)
  // In production, you'd have all 321 items documented
};

// Default help content for items without specific documentation
export const defaultHelpContent = {
  description: "This task is part of your comprehensive SEO implementation checklist.",
  tips: [
    "Coordinate with the task owner listed",
    "Check the priority level to understand urgency",
    "Review the effort level to plan your time",
    "Mark as complete when fully implemented"
  ],
  resources: [],
  estimatedTime: "Varies",
  difficulty: "Varies"
};

// Helper function to get help content
export function getHelpContent(itemId) {
  return helpContent[itemId] || defaultHelpContent;
}
