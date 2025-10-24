// Resource Library - Best practices, guides, and tutorials

export const resources = [
  // Technical SEO Resources
  {
    id: 1,
    title: "Complete Technical SEO Audit Guide",
    description: "Step-by-step guide to conducting a comprehensive technical SEO audit, including tools and checklists.",
    category: "Technical SEO",
    type: "Guide",
    difficulty: "Advanced",
    duration: "30 min read",
    tags: ["audit", "technical", "crawling", "indexing"],
    content: `
# Complete Technical SEO Audit Guide

A technical SEO audit examines the infrastructure of your website to ensure search engines can crawl, index, and understand your content effectively.

## Key Areas to Audit

### 1. Crawlability
- Check robots.txt for blocking issues
- Verify XML sitemap is up to date
- Ensure all important pages are crawlable
- Review internal linking structure

### 2. Indexability
- Check for noindex tags
- Verify canonical tags are correct
- Look for duplicate content issues
- Ensure important pages are indexed

### 3. Site Speed
- Run PageSpeed Insights
- Check Core Web Vitals
- Optimize images and assets
- Enable caching and compression

### 4. Mobile Optimization
- Test mobile-friendliness
- Verify responsive design
- Check tap target sizes
- Ensure content parity

### 5. HTTPS & Security
- Verify SSL certificate
- Check for mixed content
- Ensure all redirects use HTTPS
- Review security headers

## Tools for Technical Audits
- Screaming Frog SEO Spider
- Google Search Console
- Google PageSpeed Insights
- Ahrefs Site Audit
- Semrush Site Audit

## Common Issues to Fix
1. Broken links (404 errors)
2. Redirect chains
3. Missing alt text
4. Slow page speed
5. Mobile usability issues
6. Duplicate content
7. Missing or incorrect canonicals
8. Sitemap errors
    `,
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Example URL
  },
  {
    id: 2,
    title: "On-Page SEO Optimization Best Practices",
    description: "Master the essential on-page elements that help search engines understand and rank your content.",
    category: "On-Page Optimization",
    type: "Best Practices",
    difficulty: "Beginner",
    duration: "20 min read",
    tags: ["on-page", "content", "optimization", "keywords"],
    content: `
# On-Page SEO Optimization Best Practices

On-page SEO refers to optimizing individual pages to rank higher and earn more relevant traffic.

## Essential On-Page Elements

### 1. Title Tags
- Keep under 60 characters
- Include primary keyword
- Make it compelling for clicks
- Use brand name at the end
- Unique for every page

### 2. Meta Descriptions
- Write 150-160 characters
- Include primary and secondary keywords
- Add a call-to-action
- Accurately summarize content
- Unique for every page

### 3. Header Tags (H1-H6)
- One H1 per page with primary keyword
- Use H2-H6 for content structure
- Don't skip heading levels
- Make headers descriptive
- Use keywords naturally

### 4. Content Optimization
- Write for users first
- Include primary keyword in first 100 words
- Use keyword variations naturally
- Aim for comprehensive coverage
- Break up text with headers and bullets

### 5. Internal Linking
- Link to related content
- Use descriptive anchor text
- Avoid generic phrases like "click here"
- Maintain 3-5 internal links per page
- Help users and search engines navigate

### 6. Image Optimization
- Use descriptive filenames
- Write meaningful alt text
- Compress images for speed
- Specify width and height
- Use modern formats (WebP)

## Quick Checklist
- [ ] Unique, optimized title tag
- [ ] Compelling meta description
- [ ] Single H1 with keyword
- [ ] Proper heading hierarchy
- [ ] 300+ words of quality content
- [ ] Primary keyword in first paragraph
- [ ] Internal links to related pages
- [ ] Optimized images with alt text
- [ ] Fast loading speed
- [ ] Mobile-friendly design
    `
  },
  {
    id: 3,
    title: "Keyword Research Strategies for 2024",
    description: "Modern approaches to finding and prioritizing keywords that drive organic traffic.",
    category: "Keyword Research",
    type: "Guide",
    difficulty: "Intermediate",
    duration: "25 min read",
    tags: ["keywords", "research", "strategy", "content planning"],
    content: `
# Keyword Research Strategies for 2024

Effective keyword research is the foundation of any successful SEO strategy.

## Step-by-Step Process

### 1. Understand Search Intent
- Informational: Learning or research
- Navigational: Finding a specific site
- Commercial: Research before buying
- Transactional: Ready to purchase

### 2. Find Seed Keywords
- Brainstorm core topics
- Analyze competitor keywords
- Use autocomplete suggestions
- Check "People Also Ask"
- Review internal site search data

### 3. Expand Keyword List
- Use keyword research tools
- Find related terms and variations
- Include long-tail keywords
- Consider question-based queries
- Look for seasonal trends

### 4. Analyze Keyword Metrics
- Search volume
- Keyword difficulty
- Cost-per-click (CPC)
- Click-through rate potential
- SERP features present

### 5. Prioritize Keywords
Focus on keywords with:
- Relevant search intent
- Reasonable difficulty
- Sufficient volume
- Business alignment
- Content gap opportunities

### 6. Map Keywords to Pages
- One primary keyword per page
- 2-3 related secondary keywords
- Avoid keyword cannibalization
- Plan content structure
- Create keyword-to-URL matrix

## Top Keyword Research Tools
- Google Keyword Planner (Free)
- Ahrefs Keywords Explorer
- Semrush Keyword Magic Tool
- Moz Keyword Explorer
- AnswerThePublic

## Pro Tips
1. Don't ignore low-volume, high-intent keywords
2. Analyze SERP features for opportunities
3. Consider voice search queries
4. Track competitor keyword gaps
5. Refresh keyword research quarterly
    `
  },
  {
    id: 4,
    title: "Schema Markup Implementation Guide",
    description: "Learn how to implement structured data to enhance your search engine visibility.",
    category: "Schema Markup",
    type: "Tutorial",
    difficulty: "Intermediate",
    duration: "35 min read",
    tags: ["schema", "structured data", "rich results", "technical"],
    content: `
# Schema Markup Implementation Guide

Schema markup helps search engines understand your content and can enable rich results in SERPs.

## Common Schema Types

### 1. Organization Schema
For your homepage or about page:
\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company Name",
  "url": "https://www.example.com",
  "logo": "https://www.example.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-555-5555",
    "contactType": "customer service"
  }
}
\`\`\`

### 2. Article Schema
For blog posts and articles:
\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2024-01-15",
  "image": "https://example.com/image.jpg"
}
\`\`\`

### 3. FAQ Schema
For FAQ pages:
\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is SEO?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "SEO stands for Search Engine Optimization..."
    }
  }]
}
\`\`\`

## Implementation Methods

### 1. JSON-LD (Recommended)
Add in <head> or <body>:
\`\`\`html
<script type="application/ld+json">
{schema JSON here}
</script>
\`\`\`

### 2. Microdata
Inline HTML attributes (more complex)

### 3. RDFa
Similar to Microdata (less common)

## Testing Your Schema
1. Google Rich Results Test
2. Schema.org Validator
3. Google Search Console
4. Structured Data Testing Tool

## Best Practices
- Use JSON-LD format
- Include all required properties
- Don't markup hidden content
- Keep schema updated
- Test before deploying
- Monitor in Search Console
    `
  },
  {
    id: 5,
    title: "Mobile SEO Optimization",
    description: "Ensure your site performs perfectly on mobile devices for better rankings and user experience.",
    category: "Mobile Optimization",
    type: "Best Practices",
    difficulty: "Intermediate",
    duration: "20 min read",
    tags: ["mobile", "responsive", "mobile-first", "ux"],
    content: `
# Mobile SEO Optimization

With mobile-first indexing, Google predominantly uses the mobile version of your site for ranking.

## Mobile-First Checklist

### 1. Responsive Design
- Use responsive CSS frameworks
- Test on multiple devices
- Ensure content parity with desktop
- Avoid separate mobile URLs if possible

### 2. Page Speed on Mobile
- Aim for LCP under 2.5 seconds
- Minimize JavaScript execution
- Optimize images for mobile
- Use lazy loading
- Enable compression

### 3. Touch-Friendly Design
- Buttons minimum 48x48 pixels
- Adequate spacing between links
- Easy-to-tap navigation
- Large, readable fonts (16px+)
- Avoid hover-dependent features

### 4. Mobile UX
- Simplify navigation menus
- Use hamburger menu wisely
- Make forms mobile-friendly
- Avoid intrusive interstitials
- Ensure readable text without zooming

### 5. Viewport Configuration
\`\`\`html
<meta name="viewport"
  content="width=device-width, initial-scale=1">
\`\`\`

## Testing Tools
- Google Mobile-Friendly Test
- PageSpeed Insights (Mobile)
- Chrome DevTools Device Mode
- BrowserStack for real devices

## Common Mobile Issues
1. Text too small to read
2. Content wider than screen
3. Clickable elements too close
4. Slow loading times
5. Unplayable content (Flash)
6. Intrusive popups

## Pro Tips
- Design for mobile first, then scale up
- Test on real devices, not just emulators
- Monitor mobile Core Web Vitals
- Check mobile usability in Search Console
- Consider Progressive Web App features
    `
  }
];

export const resourceCategories = [
  "All",
  "Technical SEO",
  "On-Page Optimization",
  "Keyword Research",
  "Content Strategy",
  "Schema Markup",
  "Mobile Optimization",
  "Performance",
  "Link Building",
  "Local SEO"
];

export const resourceTypes = ["All", "Guide", "Tutorial", "Best Practices", "Case Study"];
export const difficultyLevels = ["All", "Beginner", "Intermediate", "Advanced"];
