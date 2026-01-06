# Requirements Document
# Structured Data Generator

**Version:** 1.0  
**Date:** December 30, 2025  
**Prepared for:** Flipside Group  
**Tool Suite:** SEO Quality Assurance Platform  
**Tool Type:** Standalone Applet (Home Screen Tile)

---

## 1. Executive Summary

### 1.1 Purpose

The Structured Data Generator is a standalone AI-powered tool that analyzes HTML content and automatically recommends appropriate schema.org structured data markup. The tool processes single HTML files or bulk uploads (up to 100 files via ZIP), uses the Claude API to intelligently identify content types and entities, generates production-ready JSON-LD code, and outputs results as both an Excel report and a ZIP of individual JSON-LD files.

### 1.2 Key Features

- Single HTML file or batch processing (1-100 files)
- AI-powered content analysis for schema type detection
- Support for 50+ schema.org types across all categories
- Production-ready JSON-LD code generation
- Schema validation against schema.org and Google's requirements
- Dual output: Excel report with recommendations AND ZIP of JSON-LD files
- Nested schema support (e.g., Article with Author, Organization)
- Rich snippet preview for supported types
- Existing schema detection and improvement suggestions
- Google Rich Results eligibility assessment

### 1.3 User Flow Summary

```
Upload HTML File(s) → AI Analyzes Content → Recommends Schema Types → Generates JSON-LD → Review/Edit → Download Excel + JSON ZIP
```

---

## 2. Supported Schema Types

### 2.1 Core Schema Categories

| Category | Schema Types |
|----------|--------------|
| **Articles & Content** | Article, NewsArticle, BlogPosting, TechArticle, ScholarlyArticle, Report, Review, HowTo, FAQ, QAPage |
| **Business & Local** | LocalBusiness, Organization, Corporation, Restaurant, Store, Hotel, MedicalBusiness, LegalService, FinancialService, RealEstateAgent |
| **Products & Commerce** | Product, Offer, AggregateOffer, ItemList, BreadcrumbList, WebPage, CollectionPage |
| **People & Events** | Person, Event, Course, JobPosting, EducationalOrganization |
| **Media** | VideoObject, ImageObject, AudioObject, MusicRecording, Movie, TVSeries, Book, Recipe |
| **Healthcare** | MedicalWebPage, MedicalCondition, Drug, Physician, Hospital |
| **Other** | WebSite, SiteNavigationElement, SearchAction, SoftwareApplication, Dataset |

### 2.2 Google Rich Results Eligibility

| Schema Type | Rich Result Type | Requirements |
|-------------|------------------|--------------|
| Article | Article rich result | headline, image, author, datePublished |
| Product | Product snippet | name, image, offers (price, availability) |
| LocalBusiness | Business profile | name, address, phone, hours |
| FAQ | FAQ rich result | mainEntity with Question/Answer |
| HowTo | How-to rich result | step, name, text or image |
| Recipe | Recipe rich result | name, image, author, ingredients, instructions |
| Event | Event listing | name, startDate, location |
| Review | Review snippet | itemReviewed, reviewRating |
| JobPosting | Job posting | title, datePosted, description, hiringOrganization |
| Course | Course snippet | name, provider, description |
| Video | Video rich result | name, description, thumbnailUrl, uploadDate |
| BreadcrumbList | Breadcrumb | itemListElement with position, name, item |
| WebSite | Sitelinks searchbox | potentialAction with SearchAction |

---

## 3. Functional Requirements

### 3.1 File Upload

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | Accept single HTML file upload via drag-and-drop or file picker | P0 |
| FR-002 | Accept ZIP file containing multiple HTML files (up to 100 files) | P0 |
| FR-003 | Accept .html, .htm file extensions | P0 |
| FR-004 | Accept direct HTML code input via paste or textarea | P1 |
| FR-005 | Accept URL input to fetch and analyze live page (future) | P2 |
| FR-006 | Validate file type before processing | P0 |
| FR-007 | Display file list with name and size after upload | P1 |
| FR-008 | Enforce maximum file size: 5MB per HTML file, 250MB total for ZIP | P0 |
| FR-009 | Enforce maximum file count: 100 files per batch | P0 |
| FR-010 | Display upload progress indicator | P1 |
| FR-011 | Allow user to remove individual files from queue before processing | P1 |
| FR-012 | Parse HTML and extract text, structure, and existing metadata | P0 |
| FR-013 | Detect and parse existing JSON-LD, Microdata, or RDFa markup | P1 |

### 3.2 Context Input (Optional)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-014 | Provide text field for organization/business name | P0 |
| FR-015 | Provide text field for website URL (for @id references) | P0 |
| FR-016 | Provide text field for organization logo URL | P1 |
| FR-017 | Provide dropdown for primary business type | P1 |
| FR-018 | Provide text fields for contact information (phone, email) | P1 |
| FR-019 | Provide address fields for LocalBusiness schemas | P1 |
| FR-020 | Provide social media profile URLs (up to 10) | P2 |
| FR-021 | Provide default author information for articles | P1 |
| FR-022 | Provide default publisher information | P1 |
| FR-023 | Save organization profile as reusable preset | P1 |
| FR-024 | Load saved organization presets | P1 |

### 3.3 Content Analysis (Claude API)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-025 | Send parsed HTML content to Claude API for analysis | P0 |
| FR-026 | Detect page content type (article, product, business, event, etc.) | P0 |
| FR-027 | Extract key entities: names, dates, prices, locations, ratings | P0 |
| FR-028 | Identify primary and secondary recommended schema types | P0 |
| FR-029 | Extract specific properties for detected schema types | P0 |
| FR-030 | Detect FAQ content (question/answer patterns) | P1 |
| FR-031 | Detect How-To content (step-by-step patterns) | P1 |
| FR-032 | Detect product information (price, availability, SKU) | P1 |
| FR-033 | Detect event information (dates, venue, tickets) | P1 |
| FR-034 | Detect review/rating content | P1 |
| FR-035 | Detect breadcrumb navigation | P1 |
| FR-036 | Detect video/audio embeds | P1 |
| FR-037 | Analyze existing schema and suggest improvements | P1 |
| FR-038 | Assess Google Rich Results eligibility | P1 |
| FR-039 | Flag missing required properties for rich results | P1 |
| FR-040 | Handle API errors with retry logic (3 attempts) | P0 |
| FR-041 | Display processing progress (X of Y files) | P0 |
| FR-042 | Allow user to cancel processing mid-batch | P1 |

### 3.4 Schema Recommendation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-043 | Recommend primary schema type based on content analysis | P0 |
| FR-044 | Recommend secondary/supplementary schema types | P1 |
| FR-045 | Display confidence score for each recommendation | P1 |
| FR-046 | Explain why each schema type is recommended | P1 |
| FR-047 | Allow user to override/change recommended schema type | P0 |
| FR-048 | Allow user to add additional schema types manually | P1 |
| FR-049 | Show schema type hierarchy (parent types) | P2 |
| FR-050 | Indicate Google Rich Results eligibility per type | P1 |
| FR-051 | Recommend nested schemas (e.g., Author within Article) | P1 |
| FR-052 | Suggest BreadcrumbList when navigation detected | P1 |
| FR-053 | Suggest WebSite schema with SearchAction for homepages | P1 |

### 3.5 JSON-LD Generation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-054 | Generate valid JSON-LD according to schema.org specification | P0 |
| FR-055 | Include all detected properties from content analysis | P0 |
| FR-056 | Include @context, @type, and @id appropriately | P0 |
| FR-057 | Support nested objects (e.g., author: {Person}) | P0 |
| FR-058 | Support multiple schema blocks per page (@graph) | P1 |
| FR-059 | Generate proper date formats (ISO 8601) | P0 |
| FR-060 | Generate proper duration formats for video/audio | P1 |
| FR-061 | Include sameAs for social profiles when provided | P1 |
| FR-062 | Generate image objects with proper dimensions | P1 |
| FR-063 | Populate required properties with user-provided defaults | P0 |
| FR-064 | Mark properties requiring user verification with [VERIFY] | P1 |
| FR-065 | Format JSON-LD with proper indentation (2 spaces) | P0 |
| FR-066 | Option to minify JSON-LD output | P2 |
| FR-067 | Validate JSON-LD syntax before output | P0 |

### 3.6 Schema Validation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-068 | Validate against schema.org vocabulary | P0 |
| FR-069 | Validate against Google's structured data requirements | P0 |
| FR-070 | Check for required properties per schema type | P0 |
| FR-071 | Check for recommended properties | P1 |
| FR-072 | Validate property value types (string, number, URL, etc.) | P0 |
| FR-073 | Validate date formats | P0 |
| FR-074 | Validate URL formats | P0 |
| FR-075 | Flag deprecated properties | P1 |
| FR-076 | Display validation errors with specific fixes | P0 |
| FR-077 | Display validation warnings for missing recommended properties | P1 |
| FR-078 | Indicate rich result test status (likely pass/fail) | P1 |

### 3.7 Results Display

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-079 | Display results in expandable card format per file | P0 |
| FR-080 | Show recommended schema types with confidence | P0 |
| FR-081 | Show complete generated JSON-LD in code viewer | P0 |
| FR-082 | Syntax highlighting for JSON-LD code | P1 |
| FR-083 | Allow inline editing of JSON-LD code | P0 |
| FR-084 | Real-time JSON validation during editing | P1 |
| FR-085 | Show validation status (errors/warnings) | P0 |
| FR-086 | Display rich snippet preview for eligible types | P1 |
| FR-087 | "Regenerate" button per file with option to select different schema | P1 |
| FR-088 | "Validate" button to re-check edited JSON-LD | P1 |
| FR-089 | "Copy to Clipboard" button for JSON-LD | P0 |
| FR-090 | Show comparison with existing schema (if detected) | P1 |
| FR-091 | Link to Google Rich Results Test for verification | P1 |
| FR-092 | Link to schema.org documentation for selected type | P1 |

### 3.8 Output Options

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-093 | Download Excel report with all recommendations and JSON-LD | P0 |
| FR-094 | Download ZIP of individual JSON-LD files (one per HTML) | P0 |
| FR-095 | Download both Excel AND ZIP together | P1 |
| FR-096 | JSON-LD files named to match source HTML (e.g., about.json-ld for about.html) | P0 |
| FR-097 | Include validation summary in Excel | P1 |
| FR-098 | Option to download complete `<script>` tags ready to paste | P1 |
| FR-099 | Option to download as single JSON file with all schemas | P2 |
| FR-100 | Option to download CSV format | P2 |

### 3.9 Rich Snippet Preview

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-101 | Preview Article rich result appearance | P1 |
| FR-102 | Preview Product rich result with price/rating | P1 |
| FR-103 | Preview FAQ accordion appearance | P1 |
| FR-104 | Preview Recipe rich result with image/time | P2 |
| FR-105 | Preview Event listing appearance | P2 |
| FR-106 | Preview How-To steps appearance | P2 |
| FR-107 | Preview LocalBusiness with address/hours | P2 |
| FR-108 | Indicate if rich result is likely to appear | P1 |

### 3.10 Project Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-109 | Save completed project to user account | P1 |
| FR-110 | Name and organize projects by website/date | P1 |
| FR-111 | Reload previous project to view/edit results | P1 |
| FR-112 | Delete saved projects | P1 |
| FR-113 | Export project history | P2 |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-001 | Process single HTML file in under 10 seconds |
| NFR-002 | Process 10 HTML files in under 60 seconds |
| NFR-003 | Process 100 HTML files in under 10 minutes |
| NFR-004 | Excel generation in under 15 seconds |
| NFR-005 | ZIP generation in under 10 seconds |
| NFR-006 | JSON validation in under 500ms per schema |
| NFR-007 | UI remains responsive during processing |

### 4.2 Accuracy

| ID | Requirement |
|----|-------------|
| NFR-008 | Schema type recommendations accurate 90%+ of time |
| NFR-009 | Generated JSON-LD passes schema.org validation 100% |
| NFR-010 | Generated JSON-LD passes Google Rich Results Test syntax 100% |
| NFR-011 | All required properties populated (or marked for verification) |
| NFR-012 | Date and URL formats always valid |

### 4.3 Security

| ID | Requirement |
|----|-------------|
| NFR-013 | Delete uploaded HTML from server after processing |
| NFR-014 | Encrypt files in transit (HTTPS) |
| NFR-015 | Require user authentication |
| NFR-016 | Sanitize HTML input to prevent XSS |

### 4.4 Accessibility

| ID | Requirement |
|----|-------------|
| NFR-017 | Tool interface is WCAG 2.2 AA compliant |
| NFR-018 | All controls accessible via keyboard |
| NFR-019 | Screen reader compatible |
| NFR-020 | Code editor accessible |

### 4.5 Browser Support

| ID | Requirement |
|----|-------------|
| NFR-021 | Chrome 90+, Firefox 90+, Safari 14+, Edge 90+ |
| NFR-022 | Responsive design for tablet (1024px+) |

---

## 5. User Interface Specifications

### 5.1 Home Screen Tile

- **Tile Name:** Structured Data Generator
- **Icon:** Code brackets with schema.org "S" icon
- **Tagline:** "AI-powered JSON-LD schema markup"
- **Tile Size:** Standard (1x1 grid unit)
- **Hover State:** Slight elevation, feature list tooltip

### 5.2 Main Interface Sections

#### Section A: Upload Zone
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│        📄  Drag & drop HTML files here                         │
│            or click to browse                                   │
│                                                                 │
│        [Choose Files]  [Paste HTML]                            │
│                                                                 │
│        Supports: .html, .htm | Max: 100 files, 250MB           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Section B: Organization Profile Panel (Collapsible)
```
┌─────────────────────────────────────────────────────────────────┐
│ ORGANIZATION PROFILE (Optional - Used for default values)      │
├─────────────────────────────────────────────────────────────────┤
│ [Load Preset ▼]                                                 │
│                                                                 │
│ Organization Name: [_______________________]                    │
│ Website URL:       [_______________________]                    │
│ Logo URL:          [_______________________]                    │
│ Business Type:     [Select ▼]                                   │
│                                                                 │
│ Contact:                                                        │
│   Phone: [___________]  Email: [____________________]           │
│                                                                 │
│ Address (for LocalBusiness):                                    │
│   Street: [_______________________]                             │
│   City: [___________]  State: [__]  ZIP: [______]              │
│   Country: [__________]                                         │
│                                                                 │
│ Default Author:                                                 │
│   Name: [_______________]  URL: [____________________]          │
│                                                                 │
│ Social Profiles:                                                │
│   [+ Add Profile]  Twitter: @handle  LinkedIn: /company/x      │
│                                                                 │
│ [Save as Preset]                                                │
└─────────────────────────────────────────────────────────────────┘
```

#### Section C: Results Panel
```
┌─────────────────────────────────────────────────────────────────┐
│ RESULTS (3 files processed)                        [Download ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ ▼ about-us.html                                    [Regenerate] │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Recommended Schema: Organization (95% confidence)       │   │
│   │ Also detected: WebPage, BreadcrumbList                  │   │
│   │ Rich Result Eligible: ✓ Business Profile                │   │
│   │ Validation: ✓ Valid (2 warnings)                        │   │
│   │                                                         │   │
│   │ Generated JSON-LD:                                      │   │
│   │ ┌─────────────────────────────────────────────────────┐ │   │
│   │ │ {                                                   │ │   │
│   │ │   "@context": "https://schema.org",                 │ │   │
│   │ │   "@type": "Organization",                          │ │   │
│   │ │   "name": "Flipside Group",                         │ │   │
│   │ │   "url": "https://flipsidegroup.com",               │ │   │
│   │ │   ...                                               │ │   │
│   │ │ }                                                   │ │   │
│   │ └─────────────────────────────────────────────────────┘ │   │
│   │                                                         │   │
│   │ [Copy JSON-LD] [Copy <script> Tag] [Validate] [Preview] │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ ▶ product-page.html                                [Regenerate] │
│ ▶ faq.html                                         [Regenerate] │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Section D: Rich Snippet Preview Modal
```
┌─────────────────────────────────────────────────────────────────┐
│ RICH SNIPPET PREVIEW                                      [X]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Google Search Result Preview:                                   │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Flipside Group | Digital Marketing Agency                  │ │
│ │ https://flipsidegroup.com                                  │ │
│ │ ★★★★★ 4.8 (125 reviews)                                     │ │
│ │ Digital marketing agency specializing in SEO and content   │ │
│ │ strategy. Located in Nashville, TN.                        │ │
│ │ Address: 123 Main St, Nashville, TN 37201                  │ │
│ │ Hours: Mon-Fri 9AM-5PM                                     │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ ⚠️ This is an approximation. Actual appearance in search       │
│    results depends on Google's algorithms and policies.        │
│                                                                 │
│ [Test in Google Rich Results Test ↗]                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Section E: Download Panel
```
┌─────────────────────────────────────────────────────────────────┐
│ DOWNLOAD OPTIONS                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ [Download Excel Report]  [Download JSON-LD Files (ZIP)]        │
│                                                                 │
│ [Download Both]                                                 │
│                                                                 │
│ JSON-LD Format:                                                 │
│   ○ Individual .json-ld files                                   │
│   ○ Complete <script> tags (.txt files)                         │
│   ○ Single combined schema.json                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. API Integration

### 6.1 Claude API Prompt Structure

```
You are an expert SEO specialist and schema.org structured data engineer.

HTML CONTENT:
{parsed_html_content}

PAGE METADATA:
- Title: {title}
- Meta Description: {meta_description}
- URL Structure: {url_path}
- Detected Page Type: {detected_type}

ORGANIZATION CONTEXT (if provided):
- Organization Name: {org_name}
- Website: {website_url}
- Logo: {logo_url}
- Business Type: {business_type}
- Contact: {phone}, {email}
- Address: {full_address}
- Default Author: {author_name}, {author_url}
- Social Profiles: {social_urls}

EXISTING SCHEMA DETECTED:
{existing_schema_or_none}

REQUIREMENTS:

1. ANALYZE the HTML content and identify:
   - Primary content type (article, product, business, event, etc.)
   - Key entities (people, organizations, products, events, locations)
   - Structured content patterns (FAQ, How-To, reviews, breadcrumbs)
   - Dates, prices, ratings, and other structured data

2. RECOMMEND schema.org types:
   - Primary schema type with confidence score
   - Secondary/supplementary schemas if applicable
   - Indicate Google Rich Results eligibility

3. GENERATE JSON-LD that:
   - Uses schema.org vocabulary correctly
   - Includes all detectable required properties
   - Includes recommended properties where data exists
   - Uses proper nesting for related entities
   - Follows Google's structured data guidelines
   - Uses @graph for multiple schemas on same page
   - Marks unverifiable data with [VERIFY: description]

4. VALIDATE the schema for:
   - Required properties presence
   - Property value types
   - Date/URL format correctness
   - Deprecated property usage

RESPOND IN JSON FORMAT:
{
  "primary_schema": {
    "type": "Article",
    "confidence": 0.92,
    "rich_result_eligible": true,
    "rich_result_type": "Article rich result",
    "reason": "Page contains article structure with headline, author, date"
  },
  "secondary_schemas": [
    {
      "type": "BreadcrumbList",
      "confidence": 0.88,
      "reason": "Breadcrumb navigation detected"
    }
  ],
  "json_ld": {
    "@context": "https://schema.org",
    "@graph": [
      { ... article schema ... },
      { ... breadcrumb schema ... }
    ]
  },
  "validation": {
    "status": "valid",
    "errors": [],
    "warnings": [
      "Missing recommended property: dateModified"
    ],
    "required_properties_present": ["headline", "author", "datePublished"],
    "missing_required": [],
    "properties_needing_verification": ["author.url"]
  },
  "existing_schema_analysis": {
    "found": true,
    "type": "Article",
    "issues": ["Missing image property", "datePublished format incorrect"],
    "recommendation": "Replace with generated schema"
  }
}
```

### 6.2 Schema Type Detection Heuristics

| Content Pattern | Detected Schema |
|-----------------|-----------------|
| Article structure with byline, date | Article, NewsArticle, BlogPosting |
| Product with price, SKU | Product with Offer |
| Business info with address, phone | LocalBusiness or subtype |
| Event with date, venue, tickets | Event |
| Question/answer pairs | FAQPage |
| Step-by-step instructions | HowTo |
| Recipe with ingredients, steps | Recipe |
| Review with rating | Review |
| Video embed with title | VideoObject |
| Navigation breadcrumb | BreadcrumbList |
| Homepage with search | WebSite with SearchAction |
| Person bio | Person |
| Job listing | JobPosting |
| Course description | Course |

### 6.3 API Error Handling

| Error | Action |
|-------|--------|
| 429 Rate Limit | Queue request, retry after delay |
| 500 Server Error | Retry up to 3 times with exponential backoff |
| 400 Bad Request | Log error, skip file, continue batch |
| Timeout | Retry once, then skip with error flag |
| HTML Too Large | Truncate to key content areas (main, article) |

---

## 7. Error Handling

| Condition | User Message |
|-----------|--------------|
| Unsupported file format | "Only HTML files (.html, .htm) are supported. Found: {extension}" |
| File too large | "HTML file exceeds 5MB limit. Please reduce file size." |
| ZIP too large | "ZIP file exceeds 250MB limit. Please split into smaller batches." |
| Too many files | "Maximum 100 files per batch. You uploaded {count}." |
| Invalid HTML | "Unable to parse '{filename}'. The HTML may be malformed." |
| No content detected | "'{filename}' contains no analyzable content." |
| API timeout | "Processing timed out for '{filename}'. Retrying..." |
| API rate limit | "Rate limit reached. Processing will resume in {seconds} seconds." |
| Invalid JSON-LD edit | "JSON-LD syntax error at line {line}: {error}" |
| Schema validation failed | "Schema validation failed: {error_details}" |

---

## 8. Data Model

### 8.1 Schema Recommendation Record

```javascript
{
  id: "uuid",
  filename: "about-us.html",
  file_size_bytes: 45678,
  
  html_metadata: {
    title: "About Us | Flipside Group",
    meta_description: "Learn about Flipside Group...",
    url_path: "/about-us",
    word_count: 850,
    detected_sections: ["header", "main", "footer", "nav"]
  },
  
  existing_schema: {
    found: true,
    format: "json-ld",  // or "microdata", "rdfa"
    type: "Organization",
    issues: ["Missing logo", "Invalid phone format"],
    raw: "{ ... existing JSON-LD ... }"
  },
  
  recommendations: {
    primary: {
      type: "Organization",
      confidence: 0.94,
      rich_result_eligible: true,
      rich_result_type: "Business Profile",
      reason: "Page contains organization info with contact details"
    },
    secondary: [
      {
        type: "WebPage",
        confidence: 0.85,
        reason: "Standard webpage with breadcrumb"
      },
      {
        type: "BreadcrumbList",
        confidence: 0.82,
        reason: "Navigation breadcrumb detected"
      }
    ]
  },
  
  json_ld: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://flipsidegroup.com/#organization",
        "name": "Flipside Group",
        "url": "https://flipsidegroup.com",
        "logo": "https://flipsidegroup.com/logo.png",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+1-615-555-0123",
          "contactType": "customer service"
        },
        "sameAs": [
          "https://twitter.com/flipsidegroup",
          "https://linkedin.com/company/flipsidegroup"
        ]
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://flipsidegroup.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "About Us",
            "item": "https://flipsidegroup.com/about-us"
          }
        ]
      }
    ]
  },
  
  json_ld_minified: "{\"@context\":\"https://schema.org\",...}",
  
  script_tag: "<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",...\n}\n</script>",
  
  validation: {
    status: "valid",  // "valid", "warnings", "errors"
    errors: [],
    warnings: ["Consider adding 'foundingDate' property"],
    required_present: ["name", "url"],
    required_missing: [],
    verification_needed: []
  },
  
  processing_time_ms: 6500,
  created_at: "2025-12-30T14:30:00Z"
}
```

### 8.2 Project Record

```javascript
{
  id: "uuid",
  user_id: "user_uuid",
  name: "Flipside Website Schema",
  
  organization_profile: {
    name: "Flipside Group",
    website: "https://flipsidegroup.com",
    logo: "https://flipsidegroup.com/logo.png",
    business_type: "MarketingAgency",
    phone: "+1-615-555-0123",
    email: "hello@flipsidegroup.com",
    address: {
      street: "123 Main St",
      city: "Nashville",
      state: "TN",
      zip: "37201",
      country: "US"
    },
    author: {
      name: "Joe Smith",
      url: "https://flipsidegroup.com/team/joe"
    },
    social_profiles: [
      "https://twitter.com/flipsidegroup",
      "https://linkedin.com/company/flipsidegroup"
    ]
  },
  
  files: [ /* array of Schema Recommendation Records */ ],
  total_files: 15,
  processing_time_ms: 95000,
  
  summary: {
    total_schemas_generated: 28,
    valid: 25,
    warnings: 3,
    errors: 0,
    rich_result_eligible: 18,
    schema_types_used: ["Organization", "Article", "FAQPage", "BreadcrumbList"]
  },
  
  created_at: "2025-12-30T14:30:00Z",
  updated_at: "2025-12-30T14:32:00Z"
}
```

### 8.3 Organization Preset Record

```javascript
{
  id: "uuid",
  user_id: "user_uuid",
  name: "Flipside Group",
  
  profile: {
    name: "Flipside Group",
    website: "https://flipsidegroup.com",
    logo: "https://flipsidegroup.com/logo.png",
    business_type: "MarketingAgency",
    phone: "+1-615-555-0123",
    email: "hello@flipsidegroup.com",
    address: { ... },
    author: { ... },
    social_profiles: [ ... ]
  },
  
  is_default: true,
  created_at: "2025-12-30T10:00:00Z"
}
```

---

## 9. Excel Output Specification

### 9.1 Sheet 1: Schema Recommendations

| Column | Width | Description |
|--------|-------|-------------|
| A: Filename | 30 | Source HTML filename |
| B: Primary Schema | 20 | Recommended primary schema type |
| C: Confidence | 10 | Confidence score (0-100%) |
| D: Rich Result | 15 | Eligible rich result type |
| E: Secondary Schemas | 30 | Comma-separated secondary types |
| F: Validation Status | 12 | Valid / Warnings / Errors |
| G: Warnings | 50 | Validation warning messages |
| H: Errors | 50 | Validation error messages |
| I: Existing Schema | 15 | Y/N - had existing schema |
| J: Existing Issues | 40 | Issues with existing schema |

### 9.2 Sheet 2: JSON-LD Code

| Column | Width | Description |
|--------|-------|-------------|
| A: Filename | 30 | Source HTML filename |
| B: Schema Type | 20 | Primary schema type |
| C: JSON-LD (Formatted) | 200 | Complete JSON-LD code (readable) |
| D: JSON-LD (Minified) | 200 | Minified JSON-LD for production |
| E: Script Tag | 200 | Complete `<script>` tag ready to paste |

### 9.3 Sheet 3: Properties Extracted

| Column | Width | Description |
|--------|-------|-------------|
| A: Filename | 25 | Source HTML filename |
| B: Schema Type | 15 | Schema type for this row |
| C: Property | 20 | Property name (e.g., "name", "datePublished") |
| D: Value | 60 | Extracted/generated value |
| E: Source | 15 | How value was determined: Detected / Default / Verify |
| F: Required | 8 | Y/N - is this property required |

### 9.4 Sheet 4: Summary

| Row | Content |
|-----|---------|
| 1 | Project Name: {name} |
| 2 | Generated: {date} |
| 3 | Total Files Processed: {count} |
| 4 | Schemas Generated: {count} |
| 5 | Valid Schemas: {count} |
| 6 | With Warnings: {count} |
| 7 | With Errors: {count} |
| 8 | Rich Result Eligible: {count} |
| 9 | Schema Types Used: {list} |
| 10 | Files with Existing Schema: {count} |

---

## 10. JSON-LD File Output (ZIP)

### 10.1 File Naming Convention

| Source File | JSON-LD Output |
|-------------|----------------|
| about-us.html | about-us.json-ld |
| products/widget.html | products-widget.json-ld |
| index.html | index.json-ld |

### 10.2 File Contents (Formatted)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Example Corp",
      "url": "https://example.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png",
        "width": 300,
        "height": 100
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-555-123-4567",
        "contactType": "customer service"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://example.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "About",
          "item": "https://example.com/about"
        }
      ]
    }
  ]
}
```

### 10.3 Alternative: Script Tag Format

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Example Corp",
  ...
}
</script>
```

---

## 11. Acceptance Criteria

### 11.1 Core Functionality

1. ✓ User can upload single HTML and receive schema recommendation in under 10 seconds
2. ✓ User can upload ZIP of 100 HTML files and receive all schemas in under 10 minutes
3. ✓ Schema type recommendations match content 90%+ of time
4. ✓ Generated JSON-LD passes schema.org validation
5. ✓ Generated JSON-LD passes Google Rich Results Test syntax check
6. ✓ All required properties populated or marked for verification
7. ✓ User can edit JSON-LD inline with real-time validation
8. ✓ Excel download contains all specified sheets and columns
9. ✓ ZIP download contains correctly named JSON-LD files
10. ✓ Rich snippet preview accurately represents schema

### 11.2 Schema Quality

1. ✓ @context, @type, and @id used correctly
2. ✓ Nested objects properly structured
3. ✓ Date formats are ISO 8601 compliant
4. ✓ URL properties are valid URLs
5. ✓ @graph used when multiple schemas on page
6. ✓ Deprecated properties not used

### 11.3 User Experience

1. ✓ Processing progress clearly visible
2. ✓ Cancel button stops processing with partial results
3. ✓ Validation errors clearly explained with fixes
4. ✓ Copy buttons work reliably
5. ✓ All interactions accessible via keyboard

---

## 12. Future Enhancements (Out of Scope for v1.0)

- Live URL crawling to fetch HTML
- Integration with Google Search Console for rich result reporting
- Automatic deployment to CMS (WordPress, etc.)
- Schema version tracking and diff comparison
- Bulk URL import from sitemap
- Multi-language schema generation
- Custom schema type definitions
- Schema A/B testing integration
- Performance impact analysis
- Historical rich result tracking

---

## 13. Dependencies

| Dependency | Purpose |
|------------|---------|
| Claude API | Content analysis and schema generation |
| JSZip | ZIP file handling |
| xlsx library | Excel file generation |
| JSON5 | Flexible JSON parsing for editing |
| Monaco Editor | JSON-LD code editor with syntax highlighting |
| React Dropzone | File upload interface |
| Firebase Auth | User authentication |
| Firebase Firestore | Project and preset storage |

---

## 14. Glossary

| Term | Definition |
|------|------------|
| Schema.org | Collaborative vocabulary for structured data on the web |
| JSON-LD | JavaScript Object Notation for Linked Data - Google's preferred format |
| Structured Data | Machine-readable information embedded in web pages |
| Rich Result | Enhanced search result appearance based on structured data |
| Rich Snippet | Visual enhancement in search results (ratings, prices, etc.) |
| @context | JSON-LD property declaring the vocabulary (schema.org) |
| @type | JSON-LD property declaring the schema type |
| @id | JSON-LD property providing unique identifier for entity |
| @graph | JSON-LD container for multiple schema objects on same page |
| Microdata | Alternative HTML-embedded structured data format |
| RDFa | Alternative attribute-based structured data format |
