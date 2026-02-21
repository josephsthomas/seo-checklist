// SEO Glossary - Comprehensive definitions of SEO terms

export const glossaryTerms = [
  {
    id: 1,
    term: "Alt Text",
    definition: "Alternative text that describes an image for screen readers and search engines. Essential for accessibility and image SEO.",
    category: "On-Page SEO",
    relatedTerms: ["Image Optimization", "Accessibility"],
    example: '<img src="blue-widget.jpg" alt="Blue widget product with chrome finish">'
  },
  {
    id: 2,
    term: "Backlink",
    definition: "A link from another website to your site. High-quality backlinks are a major ranking factor.",
    category: "Off-Page SEO",
    relatedTerms: ["Link Building", "Domain Authority"],
    example: "When Site A links to Site B, Site B has a backlink from Site A."
  },
  {
    id: 3,
    term: "Canonical URL",
    definition: "The preferred version of a web page when multiple URLs have similar or duplicate content.",
    category: "Technical SEO",
    relatedTerms: ["Duplicate Content", "URL Structure"],
    example: '<link rel="canonical" href="https://example.com/page" />'
  },
  {
    id: 4,
    term: "Core Web Vitals",
    definition: "Google's metrics for page experience: LCP (loading), INP (interactivity), and CLS (visual stability).",
    category: "Performance",
    relatedTerms: ["Page Speed", "User Experience"],
    example: "LCP should be under 2.5 seconds for good user experience."
  },
  {
    id: 5,
    term: "Crawlability",
    definition: "The ability of search engine bots to access and navigate your website's pages.",
    category: "Technical SEO",
    relatedTerms: ["Indexability", "Robots.txt"],
    example: "A site with crawlable HTML navigation allows bots to discover all pages."
  },
  {
    id: 6,
    term: "Domain Authority (DA)",
    definition: "Moz's score (1-100) predicting how well a website will rank. Based on backlinks and other factors.",
    category: "Metrics",
    relatedTerms: ["Backlinks", "Page Authority"],
    example: "A site with DA 60 typically ranks better than a site with DA 30."
  },
  {
    id: 7,
    term: "E-E-A-T",
    definition: "Experience, Expertise, Authoritativeness, Trustworthiness. Google's quality guidelines for content.",
    category: "Content Quality",
    relatedTerms: ["Content Strategy", "Author Authority"],
    example: "Medical advice should be written by healthcare professionals (Expertise)."
  },
  {
    id: 8,
    term: "Featured Snippet",
    definition: "A highlighted answer box that appears above organic search results. Also called 'Position Zero'.",
    category: "SERP Features",
    relatedTerms: ["Rich Results", "Schema Markup"],
    example: "A featured snippet might show a definition, list, or table extracted from a page."
  },
  {
    id: 9,
    term: "H1 Tag",
    definition: "The main heading tag that should contain the primary keyword and describe the page topic.",
    category: "On-Page SEO",
    relatedTerms: ["Heading Hierarchy", "Keywords"],
    example: "<h1>Complete Guide to SEO for Beginners</h1>"
  },
  {
    id: 10,
    term: "Hreflang",
    definition: "HTML attribute that tells search engines which language and region a page targets.",
    category: "International SEO",
    relatedTerms: ["Internationalization", "Language Targeting"],
    example: '<link rel="alternate" hreflang="es" href="https://example.com/es/" />'
  },
  {
    id: 11,
    term: "Indexability",
    definition: "Whether a page can be added to a search engine's index and appear in search results.",
    category: "Technical SEO",
    relatedTerms: ["Crawlability", "Noindex"],
    example: "Pages with noindex meta tags won't appear in search results."
  },
  {
    id: 12,
    term: "Internal Linking",
    definition: "Links from one page to another page on the same website. Distributes page authority and helps navigation.",
    category: "On-Page SEO",
    relatedTerms: ["Link Architecture", "Site Structure"],
    example: "Linking from your homepage to important category pages."
  },
  {
    id: 13,
    term: "Keyword Cannibalization",
    definition: "When multiple pages target the same keyword, causing them to compete against each other.",
    category: "Content Strategy",
    relatedTerms: ["Keyword Mapping", "Content Strategy"],
    example: "Having three blog posts all targeting 'best running shoes' can split ranking power."
  },
  {
    id: 14,
    term: "LCP (Largest Contentful Paint)",
    definition: "Core Web Vital measuring how long it takes for the largest visible element to load.",
    category: "Performance",
    relatedTerms: ["Core Web Vitals", "Page Speed"],
    example: "LCP should be under 2.5 seconds for good performance."
  },
  {
    id: 15,
    term: "Meta Description",
    definition: "HTML meta tag providing a summary of page content. Appears in search results below the title.",
    category: "On-Page SEO",
    relatedTerms: ["Title Tag", "SERP"],
    example: '<meta name="description" content="Learn SEO basics in this comprehensive guide..." />'
  },
  {
    id: 16,
    term: "Nofollow Link",
    definition: "A link with rel='nofollow' attribute that tells search engines not to pass authority.",
    category: "Link Building",
    relatedTerms: ["Backlinks", "Link Attributes"],
    example: '<a href="..." rel="nofollow">Link</a>'
  },
  {
    id: 17,
    term: "Organic Search",
    definition: "Unpaid search engine results, as opposed to paid ads. The primary focus of SEO.",
    category: "Fundamentals",
    relatedTerms: ["SERP", "Rankings"],
    example: "Ranking #1 organically for 'best coffee maker' brings free traffic."
  },
  {
    id: 18,
    term: "Page Speed",
    definition: "How quickly a page loads. A ranking factor and critical for user experience.",
    category: "Performance",
    relatedTerms: ["Core Web Vitals", "Loading Time"],
    example: "Pages should load in under 3 seconds on mobile."
  },
  {
    id: 19,
    term: "Pillar Page",
    definition: "A comprehensive page covering a broad topic in depth, linking to related cluster content.",
    category: "Content Strategy",
    relatedTerms: ["Content Clusters", "Internal Linking"],
    example: "A 3000-word 'Complete SEO Guide' linking to specific SEO technique pages."
  },
  {
    id: 20,
    term: "Redirect (301)",
    definition: "Permanent redirect sending users and search engines from one URL to another. Preserves SEO value.",
    category: "Technical SEO",
    relatedTerms: ["URL Migration", "Link Equity"],
    example: "Redirecting old-page.html to new-page.html with a 301."
  },
  {
    id: 21,
    term: "Robots.txt",
    definition: "File in site root telling search engines which pages to crawl or ignore.",
    category: "Technical SEO",
    relatedTerms: ["Crawling", "Indexing"],
    example: "User-agent: *\nDisallow: /admin/"
  },
  {
    id: 22,
    term: "Schema Markup",
    definition: "Structured data vocabulary that helps search engines understand page content. Enables rich results.",
    category: "Technical SEO",
    relatedTerms: ["Rich Snippets", "JSON-LD"],
    example: "Adding Article schema to blog posts for enhanced SERP display."
  },
  {
    id: 23,
    term: "Search Intent",
    definition: "The goal behind a user's search query: informational, navigational, commercial, or transactional.",
    category: "Content Strategy",
    relatedTerms: ["Keyword Research", "User Intent"],
    example: "'How to bake bread' = informational, 'Buy KitchenAid mixer' = transactional."
  },
  {
    id: 24,
    term: "SERP (Search Engine Results Page)",
    definition: "The page showing results after a search query. Includes organic results, ads, and features.",
    category: "Fundamentals",
    relatedTerms: ["Organic Search", "Featured Snippets"],
    example: "When you search on Google, the results page is the SERP."
  },
  {
    id: 25,
    term: "Sitemap (XML)",
    definition: "A file listing all pages on your site, helping search engines discover and crawl content.",
    category: "Technical SEO",
    relatedTerms: ["Crawling", "Indexing"],
    example: "Submit sitemap.xml to Google Search Console for faster indexing."
  },
  {
    id: 26,
    term: "Title Tag",
    definition: "HTML element specifying page title. Shows in search results and browser tabs. Major ranking factor.",
    category: "On-Page SEO",
    relatedTerms: ["Meta Description", "Keywords"],
    example: "<title>Best Running Shoes 2025 - Reviews & Buying Guide</title>"
  },
  {
    id: 27,
    term: "URL Structure",
    definition: "The format and organization of your site's URLs. Should be descriptive, readable, and SEO-friendly.",
    category: "Technical SEO",
    relatedTerms: ["Permalinks", "Site Architecture"],
    example: "Good: /seo-guide/keyword-research  Bad: /page?id=123"
  },
  {
    id: 28,
    term: "User Experience (UX)",
    definition: "How users interact with your site. Affects rankings through metrics like bounce rate and time on page.",
    category: "Fundamentals",
    relatedTerms: ["Core Web Vitals", "Engagement"],
    example: "Easy navigation, fast loading, and mobile-friendly design improve UX."
  },
  {
    id: 29,
    term: "White Hat SEO",
    definition: "Ethical SEO practices that follow search engine guidelines. Opposite of black hat SEO.",
    category: "Fundamentals",
    relatedTerms: ["Best Practices", "Guidelines"],
    example: "Creating quality content and earning natural backlinks is white hat SEO."
  },
  {
    id: 30,
    term: "YMYL (Your Money Your Life)",
    definition: "Pages that can impact health, finances, or safety. Google holds these to higher quality standards.",
    category: "Content Quality",
    relatedTerms: ["E-E-A-T", "Quality Guidelines"],
    example: "Medical advice, financial planning, and legal information are YMYL topics."
  }
];

export const glossaryCategories = [
  "All",
  "Fundamentals",
  "On-Page SEO",
  "Technical SEO",
  "Content Strategy",
  "Content Quality",
  "Performance",
  "Off-Page SEO",
  "Link Building",
  "Metrics",
  "SERP Features",
  "International SEO"
];
