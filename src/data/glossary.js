// SEO Glossary - Comprehensive definitions of SEO terms

export const glossaryTerms = [
  {
    id: 1,
    term: "Alt Text",
    definition: "Alternative text that describes an image for screen readers and search engines. Essential for accessibility and image SEO.",
    category: "On-Page SEO",
    relatedTerms: ["Meta Description", "Schema Markup"],
    example: '<img src="blue-widget.jpg" alt="Blue widget product with chrome finish">'
  },
  {
    id: 2,
    term: "Backlink",
    definition: "A link from another website to your site. High-quality backlinks are a major ranking factor.",
    category: "Off-Page SEO",
    relatedTerms: ["Nofollow Link", "Domain Authority (DA)"],
    example: "When Site A links to Site B, Site B has a backlink from Site A."
  },
  {
    id: 3,
    term: "Canonical URL",
    definition: "The preferred version of a web page when multiple URLs have similar or duplicate content.",
    category: "Technical SEO",
    relatedTerms: ["Redirect (301)", "URL Structure"],
    example: '<link rel="canonical" href="https://example.com/page" />'
  },
  {
    id: 4,
    term: "Core Web Vitals",
    definition: "Google's metrics for page experience: LCP (loading), INP (interactivity), and CLS (visual stability).",
    category: "Performance",
    relatedTerms: ["Page Speed", "User Experience (UX)"],
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
    relatedTerms: ["Backlink", "Organic Search"],
    example: "A site with DA 60 typically ranks better than a site with DA 30."
  },
  {
    id: 7,
    term: "E-E-A-T",
    definition: "Experience, Expertise, Authoritativeness, Trustworthiness. Google's quality guidelines for content.",
    category: "Content Quality",
    relatedTerms: ["YMYL (Your Money Your Life)", "White Hat SEO"],
    example: "Medical advice should be written by healthcare professionals (Expertise)."
  },
  {
    id: 8,
    term: "Featured Snippet",
    definition: "A highlighted answer box that appears above organic search results. Also called 'Position Zero'.",
    category: "SERP Features",
    relatedTerms: ["SERP (Search Engine Results Page)", "Schema Markup"],
    example: "A featured snippet might show a definition, list, or table extracted from a page."
  },
  {
    id: 9,
    term: "H1 Tag",
    definition: "The main heading tag that should contain the primary keyword and describe the page topic.",
    category: "On-Page SEO",
    relatedTerms: ["Title Tag", "Internal Linking"],
    example: "<h1>Complete Guide to SEO for Beginners</h1>"
  },
  {
    id: 10,
    term: "Hreflang",
    definition: "HTML attribute that tells search engines which language and region a page targets.",
    category: "International SEO",
    relatedTerms: ["Canonical URL", "Sitemap (XML)"],
    example: '<link rel="alternate" hreflang="es" href="https://example.com/es/" />'
  },
  {
    id: 11,
    term: "Indexability",
    definition: "Whether a page can be added to a search engine's index and appear in search results.",
    category: "Technical SEO",
    relatedTerms: ["Crawlability", "Robots.txt"],
    example: "Pages with noindex meta tags won't appear in search results."
  },
  {
    id: 12,
    term: "Internal Linking",
    definition: "Links from one page to another page on the same website. Distributes page authority and helps navigation.",
    category: "On-Page SEO",
    relatedTerms: ["Pillar Page", "H1 Tag"],
    example: "Linking from your homepage to important category pages."
  },
  {
    id: 13,
    term: "Keyword Cannibalization",
    definition: "When multiple pages target the same keyword, causing them to compete against each other.",
    category: "Content Strategy",
    relatedTerms: ["Search Intent", "Pillar Page"],
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
    relatedTerms: ["Title Tag", "SERP (Search Engine Results Page)"],
    example: '<meta name="description" content="Learn SEO basics in this comprehensive guide..." />'
  },
  {
    id: 16,
    term: "Nofollow Link",
    definition: "A link with rel='nofollow' attribute that tells search engines not to pass authority.",
    category: "Link Building",
    relatedTerms: ["Backlink", "Domain Authority (DA)"],
    example: '<a href="..." rel="nofollow">Link</a>'
  },
  {
    id: 17,
    term: "Organic Search",
    definition: "Unpaid search engine results, as opposed to paid ads. The primary focus of SEO.",
    category: "Fundamentals",
    relatedTerms: ["SERP (Search Engine Results Page)", "Featured Snippet"],
    example: "Ranking #1 organically for 'best coffee maker' brings free traffic."
  },
  {
    id: 18,
    term: "Page Speed",
    definition: "How quickly a page loads. A ranking factor and critical for user experience.",
    category: "Performance",
    relatedTerms: ["Core Web Vitals", "LCP (Largest Contentful Paint)"],
    example: "Pages should load in under 3 seconds on mobile."
  },
  {
    id: 19,
    term: "Pillar Page",
    definition: "A comprehensive page covering a broad topic in depth, linking to related cluster content.",
    category: "Content Strategy",
    relatedTerms: ["Internal Linking", "Keyword Cannibalization"],
    example: "A 3000-word 'Complete SEO Guide' linking to specific SEO technique pages."
  },
  {
    id: 20,
    term: "Redirect (301)",
    definition: "Permanent redirect sending users and search engines from one URL to another. Preserves SEO value.",
    category: "Technical SEO",
    relatedTerms: ["Canonical URL", "URL Structure"],
    example: "Redirecting old-page.html to new-page.html with a 301."
  },
  {
    id: 21,
    term: "Robots.txt",
    definition: "File in site root telling search engines which pages to crawl or ignore.",
    category: "Technical SEO",
    relatedTerms: ["Crawlability", "Indexability"],
    example: "User-agent: *\nDisallow: /admin/"
  },
  {
    id: 22,
    term: "Schema Markup",
    definition: "Structured data vocabulary that helps search engines understand page content. Enables rich results.",
    category: "Technical SEO",
    relatedTerms: ["Featured Snippet", "SERP (Search Engine Results Page)"],
    example: "Adding Article schema to blog posts for enhanced SERP display."
  },
  {
    id: 23,
    term: "Search Intent",
    definition: "The goal behind a user's search query: informational, navigational, commercial, or transactional.",
    category: "Content Strategy",
    relatedTerms: ["Keyword Cannibalization", "Organic Search"],
    example: "'How to bake bread' = informational, 'Buy KitchenAid mixer' = transactional."
  },
  {
    id: 24,
    term: "SERP (Search Engine Results Page)",
    definition: "The page showing results after a search query. Includes organic results, ads, and features.",
    category: "Fundamentals",
    relatedTerms: ["Organic Search", "Featured Snippet"],
    example: "When you search on Google, the results page is the SERP."
  },
  {
    id: 25,
    term: "Sitemap (XML)",
    definition: "A file listing all pages on your site, helping search engines discover and crawl content.",
    category: "Technical SEO",
    relatedTerms: ["Crawlability", "Indexability"],
    example: "Submit sitemap.xml to Google Search Console for faster indexing."
  },
  {
    id: 26,
    term: "Title Tag",
    definition: "HTML element specifying page title. Shows in search results and browser tabs. Major ranking factor.",
    category: "On-Page SEO",
    relatedTerms: ["Meta Description", "H1 Tag"],
    example: "<title>Best Running Shoes - Expert Reviews & Buying Guide</title>"
  },
  {
    id: 27,
    term: "URL Structure",
    definition: "The format and organization of your site's URLs. Should be descriptive, readable, and SEO-friendly.",
    category: "Technical SEO",
    relatedTerms: ["Canonical URL", "Redirect (301)"],
    example: "Good: /seo-guide/keyword-research  Bad: /page?id=123"
  },
  {
    id: 28,
    term: "User Experience (UX)",
    definition: "How users interact with your site. Affects rankings through metrics like bounce rate and time on page.",
    category: "Fundamentals",
    relatedTerms: ["Core Web Vitals", "Page Speed"],
    example: "Easy navigation, fast loading, and mobile-friendly design improve UX."
  },
  {
    id: 29,
    term: "White Hat SEO",
    definition: "Ethical SEO practices that follow search engine guidelines. Opposite of black hat SEO.",
    category: "Fundamentals",
    relatedTerms: ["E-E-A-T", "YMYL (Your Money Your Life)"],
    example: "Creating quality content and earning natural backlinks is white hat SEO."
  },
  {
    id: 30,
    term: "YMYL (Your Money Your Life)",
    definition: "Pages that can impact health, finances, or safety. Google holds these to higher quality standards.",
    category: "Content Quality",
    relatedTerms: ["E-E-A-T", "White Hat SEO"],
    example: "Medical advice, financial planning, and legal information are YMYL topics."
  },
  {
    id: 31,
    term: "Anchor Text",
    definition: "The clickable text in a hyperlink. Descriptive anchor text helps search engines understand the linked page's content.",
    category: "On-Page SEO",
    relatedTerms: ["Internal Linking", "Backlink"],
    example: "In '<a href=\"/guide\">SEO best practices</a>', 'SEO best practices' is the anchor text."
  },
  {
    id: 32,
    term: "Bounce Rate",
    definition: "The percentage of visitors who leave a site after viewing only one page. A high bounce rate may indicate poor UX or irrelevant content.",
    category: "Metrics",
    relatedTerms: ["User Experience (UX)", "Core Web Vitals"],
    example: "A landing page with 80% bounce rate may need better content or faster load times."
  },
  {
    id: 33,
    term: "Click-Through Rate (CTR)",
    definition: "The ratio of users who click on a search result to the total number who see it. Higher CTR indicates compelling titles and descriptions.",
    category: "Metrics",
    relatedTerms: ["Title Tag", "Meta Description"],
    example: "If 100 people see your result and 5 click, your CTR is 5%."
  },
  {
    id: 34,
    term: "Content Audit",
    definition: "A systematic review of all content on a website to assess quality, relevance, and performance.",
    category: "Content Strategy",
    relatedTerms: ["E-E-A-T", "Content Pruning"],
    example: "Reviewing all blog posts to identify outdated, underperforming, or duplicate content."
  },
  {
    id: 35,
    term: "Content Pruning",
    definition: "Removing or consolidating low-quality or outdated content to improve overall site quality and crawl efficiency.",
    category: "Content Strategy",
    relatedTerms: ["Content Audit", "Crawlability"],
    example: "Deleting old blog posts with zero traffic and thin content."
  },
  {
    id: 36,
    term: "CLS (Cumulative Layout Shift)",
    definition: "Core Web Vital measuring visual stability. Tracks unexpected layout shifts during page load.",
    category: "Performance",
    relatedTerms: ["Core Web Vitals", "LCP (Largest Contentful Paint)"],
    example: "CLS should be under 0.1 for good user experience."
  },
  {
    id: 37,
    term: "INP (Interaction to Next Paint)",
    definition: "Core Web Vital measuring responsiveness. Tracks the latency of user interactions throughout the page lifecycle.",
    category: "Performance",
    relatedTerms: ["Core Web Vitals", "Page Speed"],
    example: "INP should be under 200ms for good interactivity."
  },
  {
    id: 38,
    term: "Keyword Density",
    definition: "The percentage of times a keyword appears on a page relative to total word count. Over-optimization can be penalized.",
    category: "On-Page SEO",
    relatedTerms: ["Search Intent", "Keyword Cannibalization"],
    example: "A 500-word article with the keyword appearing 10 times has 2% keyword density."
  },
  {
    id: 39,
    term: "Long-Tail Keywords",
    definition: "Longer, more specific keyword phrases with lower search volume but higher conversion rates.",
    category: "Content Strategy",
    relatedTerms: ["Search Intent", "Keyword Cannibalization"],
    example: "'Best waterproof hiking boots for wide feet' vs. 'hiking boots'."
  },
  {
    id: 40,
    term: "Mobile-First Indexing",
    definition: "Google's practice of using the mobile version of a page for indexing and ranking.",
    category: "Technical SEO",
    relatedTerms: ["User Experience (UX)", "Core Web Vitals"],
    example: "Ensuring your mobile site has the same content and structured data as your desktop site."
  },
  {
    id: 41,
    term: "Open Graph Tags",
    definition: "Meta tags that control how content appears when shared on social media platforms.",
    category: "On-Page SEO",
    relatedTerms: ["Meta Description", "Title Tag"],
    example: '<meta property="og:title" content="My Article Title" />'
  },
  {
    id: 42,
    term: "Orphan Page",
    definition: "A page with no internal links pointing to it, making it difficult for search engines and users to discover.",
    category: "Technical SEO",
    relatedTerms: ["Internal Linking", "Crawlability"],
    example: "A blog post that exists but is not linked from any other page on the site."
  },
  {
    id: 43,
    term: "Rich Snippet",
    definition: "Enhanced search results with additional visual information like ratings, prices, or availability.",
    category: "SERP Features",
    relatedTerms: ["Schema Markup", "Featured Snippet"],
    example: "A recipe result showing star ratings, cooking time, and calorie count."
  },
  {
    id: 44,
    term: "Semantic Search",
    definition: "Search engine's ability to understand the meaning and context behind queries, not just matching keywords.",
    category: "Fundamentals",
    relatedTerms: ["Search Intent", "E-E-A-T"],
    example: "Searching 'apple' and getting results about the tech company based on context."
  },
  {
    id: 45,
    term: "SSL Certificate",
    definition: "Security certificate that enables HTTPS. Google considers HTTPS a ranking signal.",
    category: "Technical SEO",
    relatedTerms: ["URL Structure", "Crawlability"],
    example: "Sites with HTTPS show a lock icon in the browser and are preferred by Google."
  },
  {
    id: 46,
    term: "Thin Content",
    definition: "Pages with little or no substantive content that provide minimal value to users.",
    category: "Content Quality",
    relatedTerms: ["Content Pruning", "E-E-A-T"],
    example: "A 50-word page that doesn't answer any user question meaningfully."
  },
  {
    id: 47,
    term: "Topic Cluster",
    definition: "A content strategy model where a pillar page links to multiple related cluster pages covering subtopics.",
    category: "Content Strategy",
    relatedTerms: ["Pillar Page", "Internal Linking"],
    example: "A pillar page on 'Digital Marketing' linking to clusters on SEO, PPC, Social Media, etc."
  },
  {
    id: 48,
    term: "Structured Data",
    definition: "Standardized format for providing information about a page's content to search engines using vocabulary like Schema.org.",
    category: "Technical SEO",
    relatedTerms: ["Schema Markup", "Rich Snippet"],
    example: "Adding JSON-LD markup to a product page with price, availability, and reviews."
  },
  {
    id: 49,
    term: "Dwell Time",
    definition: "The amount of time a user spends on a page after clicking a search result before returning to the SERP.",
    category: "Metrics",
    relatedTerms: ["Bounce Rate", "User Experience (UX)"],
    example: "Long dwell time suggests the content satisfied the user's search intent."
  },
  {
    id: 50,
    term: "404 Error",
    definition: "HTTP status code indicating a page was not found. Excessive 404s can harm crawl efficiency and user experience.",
    category: "Technical SEO",
    relatedTerms: ["Redirect (301)", "Crawlability"],
    example: "A broken link leading to a page that no longer exists returns a 404 error."
  },
  {
    id: 51,
    term: "WCAG (Web Content Accessibility Guidelines)",
    definition: "A set of international standards developed by the W3C for making web content accessible to people with disabilities. Covers perceivable, operable, understandable, and robust principles.",
    category: "Accessibility",
    relatedTerms: ["Web Accessibility", "ARIA (Accessible Rich Internet Applications)", "Color Contrast"],
    example: "WCAG 2.1 Level AA requires a minimum color contrast ratio of 4.5:1 for normal text."
  },
  {
    id: 52,
    term: "JSON-LD (JavaScript Object Notation for Linked Data)",
    definition: "A lightweight method for encoding structured data using JSON format. Google's recommended format for implementing structured data on web pages.",
    category: "Technical SEO",
    relatedTerms: ["Structured Data", "Schema Markup", "Rich Snippet"],
    example: '<script type="application/ld+json">{"@context":"https://schema.org","@type":"Article","headline":"SEO Guide"}</script>'
  },
  {
    id: 53,
    term: "Flesch-Kincaid Readability",
    definition: "A readability test that rates text on a U.S. school grade level. Lower scores indicate easier-to-read content, which is generally preferred for web content.",
    category: "Content Quality",
    relatedTerms: ["Readability Score", "Thin Content", "E-E-A-T"],
    example: "A Flesch-Kincaid Grade Level of 8 means the content is readable by an average 8th grader."
  },
  {
    id: 54,
    term: "Readability Score",
    definition: "A numerical measure of how easy text is to read and understand. Multiple formulas exist including Flesch-Kincaid, Gunning Fog, and Coleman-Liau index.",
    category: "Content Quality",
    relatedTerms: ["Flesch-Kincaid Readability", "User Experience (UX)", "Content Audit"],
    example: "Aiming for a readability score equivalent to a 6th-8th grade reading level for most web content."
  },
  {
    id: 55,
    term: "TTFB (Time to First Byte)",
    definition: "The time it takes for a browser to receive the first byte of data from the web server. A key server responsiveness metric.",
    category: "Performance",
    relatedTerms: ["Page Speed", "Core Web Vitals", "LCP (Largest Contentful Paint)"],
    example: "A TTFB under 200ms is considered fast; over 600ms indicates server-side issues."
  },
  {
    id: 56,
    term: "FCP (First Contentful Paint)",
    definition: "A performance metric measuring the time from navigation to when the browser renders the first piece of DOM content such as text, images, or SVG.",
    category: "Performance",
    relatedTerms: ["Core Web Vitals", "LCP (Largest Contentful Paint)", "TTFB (Time to First Byte)"],
    example: "FCP should be under 1.8 seconds for a good user experience."
  },
  {
    id: 57,
    term: "Viewport Meta Tag",
    definition: "An HTML meta tag that controls how a page is displayed on mobile devices by setting the viewport width and initial scale.",
    category: "Technical SEO",
    relatedTerms: ["Responsive Design", "Mobile-First Indexing"],
    example: '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
  },
  {
    id: 58,
    term: "Responsive Design",
    definition: "A web design approach where layouts adapt to different screen sizes and devices using flexible grids, images, and CSS media queries.",
    category: "Technical SEO",
    relatedTerms: ["Mobile-First Indexing", "Viewport Meta Tag", "User Experience (UX)"],
    example: "Using CSS media queries like @media (max-width: 768px) to adjust layouts for tablets."
  },
  {
    id: 59,
    term: "Lazy Loading",
    definition: "A technique that defers loading of non-critical resources (images, videos, iframes) until they are needed, typically when they enter the viewport.",
    category: "Performance",
    relatedTerms: ["Page Speed", "Image Optimization", "LCP (Largest Contentful Paint)"],
    example: '<img src="photo.jpg" loading="lazy" alt="Product image">'
  },
  {
    id: 60,
    term: "Image Optimization",
    definition: "The process of reducing image file sizes and using modern formats (WebP, AVIF) without sacrificing visual quality, to improve page load speed.",
    category: "Performance",
    relatedTerms: ["Lazy Loading", "Page Speed", "Alt Text"],
    example: "Converting a 2MB PNG to a 150KB WebP with the same visual quality."
  },
  {
    id: 61,
    term: "Content Lifecycle",
    definition: "The stages content goes through from planning and creation to publication, promotion, maintenance, and eventual retirement or archival.",
    category: "Content Strategy",
    relatedTerms: ["Content Governance", "Content Calendar", "Editorial Workflow"],
    example: "A blog post lifecycle: ideation > drafting > review > publish > promote > update > archive."
  },
  {
    id: 62,
    term: "Content Governance",
    definition: "The framework of policies, roles, and processes that guide how content is created, published, maintained, and retired across an organization.",
    category: "Content Strategy",
    relatedTerms: ["Content Lifecycle", "Editorial Workflow", "Content Audit"],
    example: "A governance policy requiring all published content to be reviewed by a subject matter expert and updated annually."
  },
  {
    id: 63,
    term: "Content Calendar",
    definition: "A planning tool that schedules content creation and publication dates, topics, authors, and distribution channels over a defined period.",
    category: "Content Strategy",
    relatedTerms: ["Content Lifecycle", "Editorial Workflow", "Content Governance"],
    example: "A monthly content calendar mapping two blog posts per week with assigned writers and target keywords."
  },
  {
    id: 64,
    term: "Editorial Workflow",
    definition: "The step-by-step process content follows from initial draft through review, editing, approval, and publication.",
    category: "Content Strategy",
    relatedTerms: ["Content Calendar", "Content Governance", "Content Lifecycle"],
    example: "Draft > Editor Review > SEO Check > Legal Approval > Schedule > Publish."
  },
  {
    id: 65,
    term: "Content Taxonomy",
    definition: "A hierarchical classification system for organizing and categorizing content using categories, tags, and other metadata to improve findability.",
    category: "Content Strategy",
    relatedTerms: ["Information Architecture", "Topic Cluster", "Internal Linking"],
    example: "Organizing blog posts into categories like 'SEO', 'Content Marketing', 'Analytics', with tags for specific subtopics."
  },
  {
    id: 66,
    term: "Information Architecture",
    definition: "The structural design and organization of a website's content, navigation, and labeling systems to support usability and findability.",
    category: "Technical SEO",
    relatedTerms: ["Content Taxonomy", "Breadcrumb Navigation", "Internal Linking"],
    example: "A site structure with Home > Category > Subcategory > Product organized logically for users and search engines."
  },
  {
    id: 67,
    term: "Breadcrumb Navigation",
    definition: "A secondary navigation pattern showing the user's location in the site hierarchy. Helps users and search engines understand site structure.",
    category: "On-Page SEO",
    relatedTerms: ["Information Architecture", "Internal Linking", "Schema Markup"],
    example: "Home > Electronics > Smartphones > iPhone 15 Pro — displayed as clickable links at the top of a page."
  },
  {
    id: 68,
    term: "Pagination",
    definition: "The practice of dividing content across multiple pages with numbered navigation. Requires proper SEO handling to avoid duplicate content issues.",
    category: "Technical SEO",
    relatedTerms: ["Canonical URL", "Infinite Scroll", "Crawlability"],
    example: "An e-commerce category with 200 products split across 10 pages using rel=\"next\" and rel=\"prev\" links."
  },
  {
    id: 69,
    term: "Infinite Scroll",
    definition: "A design pattern that continuously loads content as users scroll down, removing traditional pagination. Can create SEO challenges if not implemented properly.",
    category: "Technical SEO",
    relatedTerms: ["Pagination", "JavaScript SEO", "Crawlability"],
    example: "A social media feed that loads more posts as you scroll, but also provides paginated URLs for search engines."
  },
  {
    id: 70,
    term: "AMP (Accelerated Mobile Pages)",
    definition: "An open-source framework by Google designed to create fast-loading mobile web pages using stripped-down HTML and a content delivery network.",
    category: "Performance",
    relatedTerms: ["Mobile-First Indexing", "Page Speed", "Core Web Vitals"],
    example: "An AMP version of a news article that loads nearly instantly on mobile devices."
  },
  {
    id: 71,
    term: "Progressive Web App (PWA)",
    definition: "A web application that uses modern web technologies to deliver app-like experiences including offline functionality, push notifications, and fast loading.",
    category: "Technical SEO",
    relatedTerms: ["Service Worker", "Responsive Design", "Page Speed"],
    example: "A PWA e-commerce site that works offline and can be installed on a user's home screen."
  },
  {
    id: 72,
    term: "Service Worker",
    definition: "A JavaScript file that runs in the background of a browser, enabling offline caching, push notifications, and background sync for Progressive Web Apps.",
    category: "Technical SEO",
    relatedTerms: ["Progressive Web App (PWA)", "JavaScript SEO", "Page Speed"],
    example: "A service worker caching static assets so the site loads instantly on repeat visits, even offline."
  },
  {
    id: 73,
    term: "Web Accessibility",
    definition: "The practice of designing and developing websites that can be used by everyone, including people with visual, auditory, motor, or cognitive disabilities.",
    category: "Accessibility",
    relatedTerms: ["WCAG (Web Content Accessibility Guidelines)", "Screen Reader", "ARIA (Accessible Rich Internet Applications)"],
    example: "Ensuring all interactive elements are keyboard-accessible and all images have descriptive alt text."
  },
  {
    id: 74,
    term: "ARIA (Accessible Rich Internet Applications)",
    definition: "A set of HTML attributes that define ways to make web content and applications more accessible to people with disabilities, especially for dynamic content.",
    category: "Accessibility",
    relatedTerms: ["Web Accessibility", "WCAG (Web Content Accessibility Guidelines)", "Screen Reader"],
    example: '<button aria-expanded="false" aria-controls="menu">Toggle Menu</button>'
  },
  {
    id: 75,
    term: "Screen Reader",
    definition: "Assistive technology software that reads digital text aloud or converts it to braille, enabling visually impaired users to navigate and interact with web content.",
    category: "Accessibility",
    relatedTerms: ["Alt Text", "ARIA (Accessible Rich Internet Applications)", "Web Accessibility"],
    example: "JAWS, NVDA, and VoiceOver are popular screen readers that interpret HTML semantics and ARIA attributes."
  },
  {
    id: 76,
    term: "Color Contrast",
    definition: "The difference in luminance between foreground text and its background. Adequate contrast is essential for readability and accessibility compliance.",
    category: "Accessibility",
    relatedTerms: ["WCAG (Web Content Accessibility Guidelines)", "Web Accessibility", "User Experience (UX)"],
    example: "WCAG AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text."
  },
  {
    id: 77,
    term: "Focus Management",
    definition: "The practice of controlling which element receives keyboard focus during user interactions, especially important for modal dialogs, dynamic content, and single-page applications.",
    category: "Accessibility",
    relatedTerms: ["Keyboard Navigation", "ARIA (Accessible Rich Internet Applications)", "Web Accessibility"],
    example: "Moving focus to a modal dialog when it opens and returning focus to the trigger button when it closes."
  },
  {
    id: 78,
    term: "Keyboard Navigation",
    definition: "The ability to navigate and interact with all website functionality using only a keyboard, without requiring a mouse. A core accessibility requirement.",
    category: "Accessibility",
    relatedTerms: ["Focus Management", "Web Accessibility", "WCAG (Web Content Accessibility Guidelines)"],
    example: "Users should be able to Tab through all interactive elements and activate them with Enter or Space."
  },
  {
    id: 79,
    term: "AI Overview (AIO/SGE)",
    definition: "Google's AI-generated summary displayed at the top of search results, synthesizing information from multiple sources to directly answer user queries.",
    category: "AI & Search",
    relatedTerms: ["SERP (Search Engine Results Page)", "Featured Snippet", "RAG (Retrieval-Augmented Generation)"],
    example: "Searching 'how does photosynthesis work' may show an AI Overview summarizing the process before traditional results."
  },
  {
    id: 80,
    term: "RAG (Retrieval-Augmented Generation)",
    definition: "An AI technique that combines information retrieval with text generation, allowing AI models to access and cite external data sources for more accurate and current responses.",
    category: "AI & Search",
    relatedTerms: ["AI Overview (AIO/SGE)", "NLP (Natural Language Processing)", "Entity SEO"],
    example: "A search engine using RAG to pull current product data from web pages and generate an accurate comparison answer."
  },
  {
    id: 81,
    term: "NLP (Natural Language Processing)",
    definition: "A branch of AI that helps computers understand, interpret, and generate human language. Search engines use NLP to better understand queries and content.",
    category: "AI & Search",
    relatedTerms: ["Semantic Search", "Entity SEO", "RAG (Retrieval-Augmented Generation)"],
    example: "Google's BERT and MUM algorithms use NLP to understand the context and nuance of search queries."
  },
  {
    id: 82,
    term: "Entity SEO",
    definition: "An SEO strategy focused on optimizing content around entities (people, places, things, concepts) rather than just keywords, aligning with how search engines build knowledge graphs.",
    category: "AI & Search",
    relatedTerms: ["Knowledge Graph", "Semantic Search", "NLP (Natural Language Processing)"],
    example: "Optimizing a page about 'Apple Inc.' by clearly establishing the entity with structured data, Wikipedia links, and contextual information."
  },
  {
    id: 83,
    term: "Knowledge Graph",
    definition: "A database of interconnected entities and facts used by search engines to understand relationships between things and provide direct answers in search results.",
    category: "AI & Search",
    relatedTerms: ["Entity SEO", "Schema Markup", "Structured Data"],
    example: "The Knowledge Panel that appears when you search for a celebrity, showing their bio, films, and related people."
  },
  {
    id: 84,
    term: "Google Search Console",
    definition: "A free tool from Google that helps website owners monitor and troubleshoot their site's presence in Google Search results, including indexing status, search queries, and crawl errors.",
    category: "Analytics",
    relatedTerms: ["Bing Webmaster Tools", "Google Analytics", "Sitemap (XML)"],
    example: "Using Search Console to identify which queries drive the most impressions and clicks to your site."
  },
  {
    id: 85,
    term: "Bing Webmaster Tools",
    definition: "Microsoft's free tool for website owners to monitor and optimize their site's presence in Bing search results, offering crawl diagnostics, keyword research, and SEO reports.",
    category: "Analytics",
    relatedTerms: ["Google Search Console", "Sitemap (XML)", "Crawlability"],
    example: "Submitting your sitemap to Bing Webmaster Tools to ensure Bing indexes all your pages."
  },
  {
    id: 86,
    term: "Google Analytics",
    definition: "A free web analytics platform by Google that tracks and reports website traffic, user behavior, conversions, and audience demographics.",
    category: "Analytics",
    relatedTerms: ["Google Search Console", "UTM Parameters", "Conversion Rate"],
    example: "Using GA4 to analyze which landing pages generate the highest engagement and conversion rates."
  },
  {
    id: 87,
    term: "UTM Parameters",
    definition: "Tags added to a URL to track the effectiveness of marketing campaigns across traffic sources and publishing media. Stands for Urchin Tracking Module.",
    category: "Analytics",
    relatedTerms: ["Google Analytics", "Conversion Rate", "Click-Through Rate (CTR)"],
    example: "https://example.com/page?utm_source=newsletter&utm_medium=email&utm_campaign=spring_sale"
  },
  {
    id: 88,
    term: "Conversion Rate",
    definition: "The percentage of visitors who complete a desired action (purchase, sign-up, download) out of total visitors. A key metric for measuring content and SEO effectiveness.",
    category: "Metrics",
    relatedTerms: ["Google Analytics", "Click-Through Rate (CTR)", "UTM Parameters"],
    example: "If 1,000 visitors land on a page and 30 make a purchase, the conversion rate is 3%."
  },
  {
    id: 89,
    term: "Link Equity",
    definition: "The value or authority passed from one page to another through hyperlinks. Also known as 'link juice.' Not all links pass the same amount of equity.",
    category: "Link Building",
    relatedTerms: ["PageRank", "Backlink", "Nofollow Link"],
    example: "A dofollow link from a high-authority news site passes more link equity than a link from a low-quality directory."
  },
  {
    id: 90,
    term: "PageRank",
    definition: "Google's original algorithm for ranking web pages based on the quantity and quality of links pointing to them. Named after Google co-founder Larry Page.",
    category: "Link Building",
    relatedTerms: ["Link Equity", "Backlink", "Domain Authority (DA)"],
    example: "A page with many high-quality backlinks accumulates more PageRank than a page with few or low-quality links."
  },
  {
    id: 91,
    term: "Disavow",
    definition: "A Google Search Console feature that lets you ask Google to ignore specific backlinks pointing to your site, typically used to combat negative SEO or spammy links.",
    category: "Link Building",
    relatedTerms: ["Backlink", "Google Search Console", "Link Equity"],
    example: "Uploading a disavow file to Google Search Console to disassociate your site from toxic link networks."
  },
  {
    id: 92,
    term: "Noindex",
    definition: "A meta tag or HTTP header directive that tells search engines not to include a specific page in their search index.",
    category: "Technical SEO",
    relatedTerms: ["Robots.txt", "Indexability", "Crawlability"],
    example: '<meta name="robots" content="noindex, follow"> prevents indexing but allows link following.'
  },
  {
    id: 93,
    term: "Rel=Sponsored",
    definition: "A link attribute that identifies links created as part of advertisements, sponsorships, or other paid agreements. Tells search engines the link is not an organic editorial endorsement.",
    category: "Link Building",
    relatedTerms: ["Nofollow Link", "Link Equity", "Backlink"],
    example: '<a href="https://partner.com" rel="sponsored">Check out our sponsor</a>'
  },
  {
    id: 94,
    term: "Render Blocking",
    definition: "Resources such as CSS and JavaScript files that prevent the browser from rendering page content until they are fully downloaded and processed.",
    category: "Performance",
    relatedTerms: ["Critical CSS", "Page Speed", "FCP (First Contentful Paint)"],
    example: "A large CSS file in the <head> blocks page rendering until fully loaded. Inlining critical CSS can fix this."
  },
  {
    id: 95,
    term: "Critical CSS",
    definition: "The minimum CSS required to render above-the-fold content. Inlining critical CSS improves perceived load time by allowing content to display before full stylesheets load.",
    category: "Performance",
    relatedTerms: ["Render Blocking", "Above the Fold", "FCP (First Contentful Paint)"],
    example: "Extracting and inlining the CSS for the hero section and navigation, while deferring the rest of the stylesheet."
  },
  {
    id: 96,
    term: "Above the Fold",
    definition: "The portion of a web page visible without scrolling. Content here gets the most visibility and should include key messaging and calls to action.",
    category: "On-Page SEO",
    relatedTerms: ["Below the Fold", "Critical CSS", "User Experience (UX)"],
    example: "Placing the main headline, hero image, and primary CTA above the fold for maximum impact."
  },
  {
    id: 97,
    term: "Below the Fold",
    definition: "The portion of a web page that requires scrolling to see. Content here still matters for SEO but gets less immediate user attention.",
    category: "On-Page SEO",
    relatedTerms: ["Above the Fold", "Lazy Loading", "User Experience (UX)"],
    example: "Placing supplementary content, testimonials, and FAQ sections below the fold."
  },
  {
    id: 98,
    term: "Content Freshness",
    definition: "The recency and timeliness of content. Google may favor fresher content for queries where timeliness matters, such as news or trending topics.",
    category: "Content Quality",
    relatedTerms: ["Evergreen Content", "Content Audit", "Content Lifecycle"],
    example: "Updating a 'Best SEO Tools 2024' article to '2025' with current pricing and features to maintain freshness."
  },
  {
    id: 99,
    term: "Evergreen Content",
    definition: "Content that remains relevant and valuable over a long period without becoming outdated. Consistently drives organic traffic without frequent updates.",
    category: "Content Quality",
    relatedTerms: ["Content Freshness", "Pillar Page", "Content Lifecycle"],
    example: "A guide on 'How to Write an Effective Headline' stays relevant for years, unlike '2024 Marketing Trends.'"
  },
  {
    id: 100,
    term: "Log File Analysis",
    definition: "The practice of examining server log files to understand how search engine bots crawl your website, identifying crawl patterns, errors, and wasted crawl budget.",
    category: "Technical SEO",
    relatedTerms: ["Crawl Budget", "Crawlability", "Google Search Console"],
    example: "Analyzing access logs to discover Googlebot spends 70% of its crawl budget on low-value parameter URLs."
  },
  {
    id: 101,
    term: "Crawl Budget",
    definition: "The number of pages a search engine bot will crawl on your site within a given timeframe. Influenced by site size, server speed, and page quality.",
    category: "Technical SEO",
    relatedTerms: ["Log File Analysis", "Crawlability", "Robots.txt"],
    example: "Blocking low-value URLs in robots.txt to preserve crawl budget for important pages."
  },
  {
    id: 102,
    term: "JavaScript SEO",
    definition: "The practice of ensuring JavaScript-rendered content is properly crawled, rendered, and indexed by search engines. Critical for single-page applications and dynamic websites.",
    category: "Technical SEO",
    relatedTerms: ["Dynamic Rendering", "Server-Side Rendering (SSR)", "Crawlability"],
    example: "Using server-side rendering instead of client-side rendering so Googlebot can index content without executing JavaScript."
  },
  {
    id: 103,
    term: "Dynamic Rendering",
    definition: "A technique that serves a fully rendered static HTML version of a page to search engine bots while serving the normal JavaScript version to regular users.",
    category: "Technical SEO",
    relatedTerms: ["JavaScript SEO", "Server-Side Rendering (SSR)", "Crawlability"],
    example: "Using a service like Rendertron to detect bot user agents and serve pre-rendered HTML to search crawlers."
  },
  {
    id: 104,
    term: "Server-Side Rendering (SSR)",
    definition: "A technique where web pages are rendered on the server rather than in the browser, producing fully formed HTML that search engines can easily crawl and index.",
    category: "Technical SEO",
    relatedTerms: ["JavaScript SEO", "Dynamic Rendering", "Page Speed"],
    example: "Using Next.js with getServerSideProps to render React pages on the server for better SEO."
  },
  {
    id: 105,
    term: "Twitter Cards",
    definition: "Meta tags that control how web pages appear when shared on Twitter (X), including title, description, image, and card type for rich social sharing previews.",
    category: "On-Page SEO",
    relatedTerms: ["Open Graph Tags", "Meta Description", "Title Tag"],
    example: '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="My Article">'
  },
  {
    id: 106,
    term: "Structured Data Testing",
    definition: "The process of validating structured data markup on web pages using tools like Google's Rich Results Test or Schema.org Validator to ensure proper implementation.",
    category: "Technical SEO",
    relatedTerms: ["Structured Data", "Schema Markup", "JSON-LD (JavaScript Object Notation for Linked Data)"],
    example: "Running a page through the Rich Results Test to verify FAQ schema is valid and eligible for rich results."
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
  "International SEO",
  "Accessibility",
  "AI & Search",
  "Analytics"
];
