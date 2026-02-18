/**
 * Recommendations Engine
 * Generates actionable recommendations from check results and AI analysis
 */

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };

/** Numeric estimated impact in score points */
const IMPACT_POINTS = { high: 15, medium: 10, low: 5 };

const CHECK_RECOMMENDATIONS = {
  'CS-01': { group: 'structural', audience: 'development', effort: 'quick', estimatedImpact: 'high', codeSnippet: { before: '<h1>First Title</h1>\n<h1>Second Title</h1>', after: '<h1>Main Page Title</h1>\n<h2>Section Title</h2>' } },
  'CS-02': { group: 'structural', audience: 'development', effort: 'quick', estimatedImpact: 'high', codeSnippet: { before: '<h1>Title</h1>\n<h3>Subsection</h3>', after: '<h1>Title</h1>\n<h2>Section</h2>\n<h3>Subsection</h3>' } },
  'CS-03': { group: 'structural', audience: 'development', effort: 'moderate', estimatedImpact: 'medium', codeSnippet: { before: '<div class="content">...</div>', after: '<main>\n  <article>...</article>\n</main>' } },
  'CS-04': { group: 'structural', audience: 'content', effort: 'moderate', estimatedImpact: 'medium' },
  'CS-05': { group: 'content', audience: 'content', effort: 'quick', estimatedImpact: 'low', codeSnippet: { before: 'Feature A, Feature B, Feature C', after: '<ul>\n  <li>Feature A</li>\n  <li>Feature B</li>\n  <li>Feature C</li>\n</ul>' } },
  'CS-06': { group: 'structural', audience: 'development', effort: 'quick', estimatedImpact: 'medium', codeSnippet: { before: '<table>\n  <tr><td>Name</td><td>Value</td></tr>\n</table>', after: '<table>\n  <thead><tr><th>Name</th><th>Value</th></tr></thead>\n  <tbody><tr><td>Example</td><td>123</td></tr></tbody>\n</table>' } },
  'CS-07': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'low' },
  'CS-08': { group: 'content', audience: 'content', effort: 'significant', estimatedImpact: 'medium' },
  'CS-09': { group: 'structural', audience: 'development', effort: 'moderate', estimatedImpact: 'medium' },
  'CS-10': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'low' },
  'CC-01': { group: 'content', audience: 'content', effort: 'significant', estimatedImpact: 'high' },
  'CC-02': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'medium' },
  'CC-03': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'low' },
  'CC-04': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'medium' },
  'CC-05': { group: 'content', audience: 'content', effort: 'significant', estimatedImpact: 'high' },
  'CC-06': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'medium' },
  'CC-07': { group: 'content', audience: 'content', effort: 'quick', estimatedImpact: 'low' },
  'CC-08': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'medium' },
  'CC-09': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'medium' },
  'CC-10': { group: 'content', audience: 'content', effort: 'quick', estimatedImpact: 'low' },
  'TA-01': { group: 'technical', audience: 'development', effort: 'significant', estimatedImpact: 'high' },
  'TA-02': { group: 'technical', audience: 'development', effort: 'quick', estimatedImpact: 'high', codeSnippet: { before: '<meta name="robots" content="noindex, noai">', after: '<meta name="robots" content="index, follow">' } },
  'TA-03': { group: 'technical', audience: 'development', effort: 'quick', estimatedImpact: 'high' },
  'TA-04': { group: 'technical', audience: 'development', effort: 'quick', estimatedImpact: 'medium', codeSnippet: { before: '<!-- No canonical -->', after: '<link rel="canonical" href="https://example.com/page">' } },
  'TA-05': { group: 'technical', audience: 'development', effort: 'moderate', estimatedImpact: 'medium' },
  'TA-06': { group: 'technical', audience: 'development', effort: 'moderate', estimatedImpact: 'low' },
  'TA-07': { group: 'technical', audience: 'development', effort: 'moderate', estimatedImpact: 'medium' },
  'TA-08': { group: 'technical', audience: 'development', effort: 'moderate', estimatedImpact: 'high' },
  'TA-09': { group: 'technical', audience: 'development', effort: 'moderate', estimatedImpact: 'medium', codeSnippet: { before: '<img src="photo.jpg">', after: '<img src="photo.jpg" alt="Description of the image content">' } },
  'TA-10': { group: 'technical', audience: 'development', effort: 'quick', estimatedImpact: 'medium' },
  'MS-01': { group: 'technical', audience: 'content', effort: 'quick', estimatedImpact: 'high', codeSnippet: { before: '<title>My Page</title>', after: '<title>Descriptive Page Title - Brand Name (30-60 chars)</title>' } },
  'MS-02': { group: 'technical', audience: 'content', effort: 'quick', estimatedImpact: 'high', codeSnippet: { before: '<!-- No meta description -->', after: '<meta name="description" content="Clear description of page content in 120-160 characters...">' } },
  'MS-03': { group: 'technical', audience: 'development', effort: 'quick', estimatedImpact: 'medium' },
  'MS-04': { group: 'technical', audience: 'development', effort: 'quick', estimatedImpact: 'low' },
  'MS-05': { group: 'technical', audience: 'development', effort: 'moderate', estimatedImpact: 'high' },
  'MS-06': { group: 'technical', audience: 'development', effort: 'moderate', estimatedImpact: 'medium' },
  'MS-07': { group: 'technical', audience: 'development', effort: 'quick', estimatedImpact: 'medium' },
  'MS-08': { group: 'technical', audience: 'development', effort: 'quick', estimatedImpact: 'medium' },
  'MS-09': { group: 'technical', audience: 'development', effort: 'moderate', estimatedImpact: 'low' },
  'MS-10': { group: 'technical', audience: 'development', effort: 'moderate', estimatedImpact: 'medium' },
  'AS-01': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'high' },
  'AS-02': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'medium' },
  'AS-03': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'medium' },
  'AS-04': { group: 'content', audience: 'content', effort: 'quick', estimatedImpact: 'medium' },
  'AS-05': { group: 'content', audience: 'content', effort: 'significant', estimatedImpact: 'high' },
  'AS-06': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'medium' },
  'AS-07': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'low' },
  'AS-08': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'medium' },
  'AS-09': { group: 'content', audience: 'content', effort: 'moderate', estimatedImpact: 'low' },
  'AS-10': { group: 'content', audience: 'development', effort: 'moderate', estimatedImpact: 'medium' }
};

/**
 * Generate all recommendations from scoring results and AI analysis
 * @param {Object} scoringResults - From scorer.js
 * @param {Object|null} aiAssessment - From aiAnalyzer.js
 * @returns {Array} Sorted recommendations
 */
export function generateRecommendations(scoringResults, aiAssessment = null) {
  const ruleBasedRecs = generateRuleBasedRecommendations(scoringResults.allChecks);
  const aiRecs = aiAssessment?.aiRecommendations
    ? aiAssessment.aiRecommendations.map((rec, i) => ({
        id: `AI-${i + 1}`,
        title: rec.title,
        description: rec.description,
        category: 'AI-Suggested',
        priority: rec.priority || 'medium',
        effort: rec.effort || 'moderate',
        estimatedImpact: rec.estimatedImpact || 'medium',
        estimatedImpactPoints: IMPACT_POINTS[rec.estimatedImpact] || IMPACT_POINTS.medium,
        group: 'content',
        audience: 'content',
        source: 'ai',
        codeSnippet: null
      }))
    : [];

  const allRecs = [...ruleBasedRecs, ...aiRecs];

  // Sort by priority
  allRecs.sort((a, b) => {
    return (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3);
  });

  return allRecs;
}

function generateRuleBasedRecommendations(allChecks) {
  return allChecks
    .filter(check => check.status === 'fail' || check.status === 'warn')
    .map(check => {
      const meta = CHECK_RECOMMENDATIONS[check.id] || {};
      const isQuickWin = (check.severity === 'high' || check.severity === 'critical') && meta.effort === 'quick';

      return {
        id: check.id,
        title: check.title,
        description: check.recommendation || check.details,
        category: check.category,
        priority: check.status === 'fail' ? (check.severity === 'critical' ? 'critical' : check.severity) : 'low',
        effort: meta.effort || 'moderate',
        estimatedImpact: meta.estimatedImpact || 'medium',
        estimatedImpactPoints: IMPACT_POINTS[meta.estimatedImpact] || IMPACT_POINTS.medium,
        group: isQuickWin ? 'quick-wins' : (meta.group || 'content'),
        audience: meta.audience || 'content',
        source: 'rule',
        codeSnippet: meta.codeSnippet || null
      };
    });
}

/**
 * Filter recommendations by group
 */
export function filterByGroup(recommendations, group) {
  if (group === 'all') return recommendations;
  if (group === 'quick-wins') {
    return recommendations.filter(r =>
      (r.priority === 'critical' || r.priority === 'high') && r.effort === 'quick'
    );
  }
  return recommendations.filter(r => r.group === group);
}

/**
 * Filter recommendations by audience
 */
export function filterByAudience(recommendations, audience) {
  if (audience === 'all') return recommendations;
  if (audience === 'content') {
    return recommendations.filter(r => r.audience === 'content');
  }
  return recommendations.filter(r => r.audience === 'development');
}

export default generateRecommendations;
