/**
 * E-006: "Why This Matters" explanations for each check
 * Maps check IDs to plain-English explanations of business impact
 */

const WHY_IT_MATTERS = {
  'CS-01': 'A single H1 heading tells AI models and search engines what your page is primarily about. Without one (or with multiple), models may misidentify your topic.',
  'CS-02': 'A logical heading hierarchy (H1 → H2 → H3) helps AI models outline your content correctly. Skipped levels create ambiguity about content structure.',
  'CS-03': 'Semantic HTML tags (article, main, section) help AI models distinguish your main content from navigation and sidebars, improving extraction accuracy.',
  'CS-04': 'Short paragraphs are easier for AI models to parse into discrete facts. Long paragraphs dilute topic focus and reduce citation probability.',
  'CS-05': 'Lists are structured data that AI models can extract directly. They are among the most commonly cited formats in AI-generated answers.',
  'CS-06': 'Properly structured tables with headers help AI models extract data accurately. Headerless tables are often misinterpreted or ignored.',
  'CS-07': 'Internal links help AI models understand the broader context of your content and the relationship between your pages.',
  'CS-08': 'Pages with too little content may be considered "thin" by AI models and deprioritized in favor of more comprehensive sources.',
  'CS-09': 'Image alt text provides additional context that AI models use to understand your content. Missing alt text means lost semantic information.',
  'CS-10': 'A clear content hierarchy with logical flow makes your content more extractable and quotable by AI models.',
  'CC-01': 'Simple, clear writing is more likely to be quoted by AI models. Complex sentences are harder to attribute and may be paraphrased inaccurately.',
  'CC-02': 'Short sentences are easier for AI models to extract as standalone facts. Long, compound sentences reduce citation likelihood.',
  'CC-03': 'Passive voice obscures the actor, making statements less quotable. Active voice creates clearer, more citable assertions.',
  'CC-04': 'Jargon without explanation reduces accessibility. AI models may misinterpret technical terms or skip jargon-heavy content.',
  'CC-05': 'Unique, original content is strongly preferred by AI models over duplicated or boilerplate text for citations.',
  'CC-06': 'Transition words help AI models understand logical relationships between statements, improving content comprehension.',
  'CC-07': 'Keyword density that is too high (stuffing) or too low affects how AI models categorize and rank your content for relevance.',
  'CC-08': 'Topic coherence means your content stays focused. AI models are more likely to cite pages that cover a topic thoroughly rather than superficially.',
  'CC-09': 'Clear, definitive statements are more quotable than hedged or vague language. AI models seek authoritative assertions.',
  'CC-10': 'Consistent terminology prevents confusion for AI models trying to extract and synthesize your content.',
  'TA-01': 'If your content is only visible after JavaScript execution, many AI crawlers will see an empty page and have nothing to index.',
  'TA-02': 'Robots directives that block AI crawlers prevent your content from appearing in AI-generated answers entirely.',
  'TA-03': 'AI-specific crawler rules (GPTBot, Google-Extended) let you control which AI models can access your content.',
  'TA-04': 'A canonical URL prevents AI models from splitting your ranking signals across duplicate pages.',
  'TA-05': 'Slow page loads may cause AI crawlers to timeout and skip your content during their indexing passes.',
  'TA-06': 'Mobile-friendly pages rank better across all search surfaces, including AI-generated responses.',
  'TA-07': 'HTTPS signals trustworthiness to both users and AI models. Non-secure pages may be deprioritized.',
  'TA-08': 'Proper HTTP status codes ensure AI crawlers can reliably access and index your content.',
  'TA-09': 'Image alt text is critical metadata that AI models use to understand visual content on your page.',
  'TA-10': 'Clean, readable URLs help AI models understand page content from the URL structure alone.',
  'MS-01': 'The title tag is the single most important metadata field. AI models weight it heavily when determining page topic.',
  'MS-02': 'Meta descriptions provide a pre-written summary that AI models may use directly as a citation source.',
  'MS-03': 'Open Graph tags ensure your content is properly represented when shared or referenced by AI-powered social tools.',
  'MS-04': 'Hreflang tags help AI models serve the right language version of your content to users in different regions.',
  'MS-05': 'JSON-LD structured data is the most reliable way to communicate facts (author, date, type) to AI models.',
  'MS-06': 'Article, FAQ, and HowTo schemas enable rich results and increase the chance of AI citation.',
  'MS-07': 'Author and publisher information establishes expertise and authority — key E-E-A-T signals for AI ranking.',
  'MS-08': 'Date information helps AI models assess content freshness. Stale content is less likely to be cited.',
  'MS-09': 'Breadcrumb schema helps AI models understand your site hierarchy and page context.',
  'MS-10': 'FAQ schema creates pre-formatted Q&A pairs that AI models can cite directly.',
  'AS-01': 'Explicit expertise signals (author credentials, citations) build trust with AI models evaluating content authority.',
  'AS-02': 'Content freshness is a key signal — AI models increasingly prefer recently updated content for citations.',
  'AS-03': 'Fact-based statements with sources are more likely to be cited than unsupported opinions.',
  'AS-04': 'Clear, structured answers to questions are the primary format AI models seek when generating responses.',
  'AS-05': 'Quotable passages — concise, fact-dense sentences — are what AI models actually extract for citations.',
  'AS-06': 'Comprehensive topic coverage signals authority. AI models prefer thorough sources over superficial ones.',
  'AS-07': 'Entity markup helps AI models connect your content to their knowledge graphs, increasing citation likelihood.',
  'AS-08': 'Content that is well-attributed (who said what, where data came from) is more trustworthy to AI models.',
  'AS-09': 'Multi-format content (text + images + tables + lists) is more extractable and useful to AI models.',
  'AS-10': 'AI-specific optimization signals show you are actively targeting AI search visibility, not just traditional SEO.',
};

export function getWhyItMatters(checkId) {
  return WHY_IT_MATTERS[checkId] || null;
}

export default WHY_IT_MATTERS;
