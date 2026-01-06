# Requirements Document
# Meta Data Generator

**Version:** 1.0  
**Date:** December 30, 2025  
**Prepared for:** Flipside Group  
**Tool Suite:** SEO Quality Assurance Platform  
**Tool Type:** Standalone Applet (Home Screen Tile)

---

## 1. Executive Summary

### 1.1 Purpose

The Meta Data Generator is a standalone AI-powered tool that analyzes document content (Word, PDF, HTML, Markdown, plain text) and generates comprehensive SEO metadata including page titles, meta descriptions, Open Graph tags, Twitter Card tags, and canonical URL suggestions. The tool processes single documents or batch uploads (up to 100 files) using the Claude API for intelligent content analysis and outputs results as a structured Excel report.

### 1.2 Key Features

- Single document or batch processing (1-100 files)
- Support for multiple input formats: DOCX, PDF, HTML, MD, TXT
- AI-generated metadata using Claude API with content analysis
- Comprehensive output: Title, Meta Description, OG Title, OG Description, Twitter Title, Twitter Description
- Optional context input: brand, industry, target audience, tone
- Character limit enforcement with recommendations
- Keyword integration and optimization
- Duplicate/cannibalization detection within batch
- Excel export with implementation-ready code snippets
- Project persistence and history

### 1.3 User Flow Summary

```
Upload File(s) → [Optional] Provide Context → Configure Options → Process with Claude API → Review/Edit Results → Download Excel
```

---

## 2. Functional Requirements

### 2.1 File Upload

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-001 | Accept single document file upload via drag-and-drop or file picker | P0 |
| FR-002 | Accept ZIP file containing multiple documents (up to 100 files) | P0 |
| FR-003 | Support file formats: DOCX, PDF, HTML, HTM, MD, TXT | P0 |
| FR-004 | Accept direct HTML input via paste or textarea | P1 |
| FR-005 | Accept URL input to fetch and analyze live page content | P2 |
| FR-006 | Validate file type before processing (reject unsupported formats) | P0 |
| FR-007 | Display file list with name, size, format after upload | P1 |
| FR-008 | Enforce maximum file size: 25MB per file, 500MB total for ZIP | P0 |
| FR-009 | Enforce maximum file count: 100 files per batch | P0 |
| FR-010 | Display upload progress indicator for large files | P1 |
| FR-011 | Allow user to remove individual files from queue before processing | P1 |
| FR-012 | Extract text content from uploaded documents for analysis | P0 |
| FR-013 | For HTML files, parse existing meta tags for comparison | P1 |
| FR-014 | Display word count and estimated reading time per document | P2 |

### 2.2 Context Input (Optional)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-015 | Provide text field for brand/client name | P0 |
| FR-016 | Provide text field for company description/tagline | P1 |
| FR-017 | Provide dropdown for industry/vertical (with "Other" option) | P1 |
| FR-018 | Provide text field for target keywords (comma-separated, up to 10) | P0 |
| FR-019 | Provide text field for primary target audience description | P1 |
| FR-020 | Provide dropdown for content type: Blog Post, Product Page, Service Page, Landing Page, About Page, Contact Page, Category Page, Article, Guide, Case Study, Other | P1 |
| FR-021 | Provide dropdown for tone: Professional, Casual, Technical, Creative, Authoritative, Friendly, Formal, Conversational | P1 |
| FR-022 | Provide text field for USP/unique value proposition | P2 |
| FR-023 | Provide text field for call-to-action preference | P2 |
| FR-024 | Provide checkbox for "Include brand name in title" (with position: start/end) | P1 |
| FR-025 | Provide text field for brand name separator (default: " | ") | P2 |
| FR-026 | Save context preferences to user profile as reusable presets | P1 |
| FR-027 | Allow user to load saved context presets | P1 |
| FR-028 | Allow user to name and manage multiple presets per client | P1 |

### 2.3 Metadata Configuration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-029 | Allow user to configure title tag character limit (default: 60, range: 30-70) | P0 |
| FR-030 | Allow user to configure meta description character limit (default: 155, range: 100-320) | P0 |
| FR-031 | Allow user to configure OG title character limit (default: 60) | P1 |
| FR-032 | Allow user to configure OG description character limit (default: 200) | P1 |
| FR-033 | Allow user to configure Twitter title character limit (default: 70) | P1 |
| FR-034 | Allow user to configure Twitter description character limit (default: 200) | P1 |
| FR-035 | Option to generate canonical URL suggestions based on title | P2 |
| FR-036 | Option to generate focus keyword recommendation | P1 |
| FR-037 | Option to include/exclude OG tags from output | P1 |
| FR-038 | Option to include/exclude Twitter Card tags from output | P1 |
| FR-039 | Option to generate multiple title/description variants (A/B testing) | P2 |
| FR-040 | Preset configurations: Standard (Google), Extended (rich snippets), Social-First | P2 |

### 2.4 AI Processing (Claude API)

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-041 | Send extracted document text to Claude API with structured prompt | P0 |
| FR-042 | Include all user-provided context in API prompt | P0 |
| FR-043 | Analyze document structure: headings, paragraphs, lists, emphasis | P1 |
| FR-044 | Identify primary topic and subtopics from content | P0 |
| FR-045 | Extract key entities: products, services, locations, people | P1 |
| FR-046 | Detect content intent: informational, transactional, navigational | P1 |
| FR-047 | Generate title tag that is: compelling, keyword-rich, within limit | P0 |
| FR-048 | Generate meta description that: summarizes content, includes CTA, within limit | P0 |
| FR-049 | Generate OG title optimized for social sharing (slightly different from title) | P1 |
| FR-050 | Generate OG description optimized for social engagement | P1 |
| FR-051 | Generate Twitter title (may differ for character limits) | P1 |
| FR-052 | Generate Twitter description | P1 |
| FR-053 | Suggest primary focus keyword based on content analysis | P1 |
| FR-054 | Suggest secondary keywords (up to 5) | P2 |
| FR-055 | Calculate keyword density for suggested keywords | P2 |
| FR-056 | Detect existing metadata in HTML files and compare with generated | P1 |
| FR-057 | Flag potential cannibalization issues within batch | P1 |
| FR-058 | Handle API errors gracefully with retry logic (3 attempts) | P0 |
| FR-059 | Display processing progress (X of Y files complete) | P0 |
| FR-060 | Allow user to cancel processing mid-batch | P1 |
| FR-061 | Process files in parallel (up to 5 concurrent) for speed | P1 |

### 2.5 Results Display

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-062 | Display results in expandable card/accordion format per document | P0 |
| FR-063 | Show all generated metadata fields with character counts | P0 |
| FR-064 | Highlight fields exceeding character limits in warning color | P0 |
| FR-065 | Show optimal character count range for each field | P1 |
| FR-066 | Allow inline editing of all generated metadata | P0 |
| FR-067 | Real-time character count update during editing | P0 |
| FR-068 | Show SERP preview (Google-style) for title and description | P0 |
| FR-069 | Show social preview (Facebook/Twitter card style) | P1 |
| FR-070 | Provide "Regenerate" button for individual document | P1 |
| FR-071 | Provide "Regenerate All" button with optional new context | P2 |
| FR-072 | Show suggested focus keyword with search volume estimate (if available) | P2 |
| FR-073 | Show comparison with existing metadata (for HTML input) | P1 |
| FR-074 | Flag duplicate/similar titles within batch | P1 |
| FR-075 | Allow sorting by: filename, title length, description length | P2 |
| FR-076 | Allow filtering by: over limit, has warnings, needs review | P2 |

### 2.6 Output Options

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-077 | Download Excel report with all generated metadata | P0 |
| FR-078 | Excel columns (minimum): Filename, Title, Title Char Count, Meta Description, Desc Char Count, OG Title, OG Description, Twitter Title, Twitter Description, Focus Keyword, Suggested URL Slug | P0 |
| FR-079 | Excel includes sheet with HTML code snippets ready to copy | P1 |
| FR-080 | Generate HTML `<head>` code block per document | P0 |
| FR-081 | Download all HTML snippets as individual .txt files in ZIP | P2 |
| FR-082 | Download JSON format with all metadata | P2 |
| FR-083 | Download CSV format | P2 |
| FR-084 | Copy individual field to clipboard with one click | P1 |
| FR-085 | Copy complete HTML code block to clipboard | P1 |
| FR-086 | Include summary sheet in Excel: total files, avg lengths, warnings | P1 |
| FR-087 | Option to include/exclude specific columns in export | P2 |

### 2.7 HTML Code Generation

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-088 | Generate complete `<title>` tag | P0 |
| FR-089 | Generate `<meta name="description">` tag | P0 |
| FR-090 | Generate `<meta property="og:title">` tag | P0 |
| FR-091 | Generate `<meta property="og:description">` tag | P0 |
| FR-092 | Generate `<meta property="og:type">` tag based on content type | P1 |
| FR-093 | Generate `<meta name="twitter:title">` tag | P0 |
| FR-094 | Generate `<meta name="twitter:description">` tag | P0 |
| FR-095 | Generate `<meta name="twitter:card">` tag | P1 |
| FR-096 | Generate `<link rel="canonical">` tag with suggested URL | P2 |
| FR-097 | Generate `<meta name="robots">` tag with recommended value | P2 |
| FR-098 | Format HTML with proper indentation for readability | P1 |
| FR-099 | Option to minify HTML output | P2 |

### 2.8 Project Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-100 | Save completed project to user account | P1 |
| FR-101 | Name and organize projects by client/date | P1 |
| FR-102 | Reload previous project to view/edit results | P1 |
| FR-103 | Delete saved projects | P1 |
| FR-104 | Export project history as CSV | P2 |
| FR-105 | Clone project to use as starting point for similar work | P2 |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-001 | Process single document in under 8 seconds |
| NFR-002 | Process 10 documents in under 45 seconds |
| NFR-003 | Process 100 documents in under 8 minutes |
| NFR-004 | Excel generation in under 10 seconds |
| NFR-005 | SERP preview renders in under 500ms |
| NFR-006 | UI remains responsive during processing (no blocking) |

### 3.2 Scalability

| ID | Requirement |
|----|-------------|
| NFR-007 | Support concurrent users without degradation |
| NFR-008 | Queue large batches to prevent API rate limiting |
| NFR-009 | Implement exponential backoff for API retries |
| NFR-010 | Handle documents up to 50,000 words |

### 3.3 Accuracy

| ID | Requirement |
|----|-------------|
| NFR-011 | Generated titles relevant to document content 95%+ |
| NFR-012 | Character limits respected 100% of time |
| NFR-013 | No duplicate titles within single batch |
| NFR-014 | Keywords naturally integrated (no keyword stuffing) |

### 3.4 Security

| ID | Requirement |
|----|-------------|
| NFR-015 | Delete uploaded documents from server after processing |
| NFR-016 | Encrypt documents in transit (HTTPS) |
| NFR-017 | Require user authentication to access tool |
| NFR-018 | Do not log or store document content beyond session |

### 3.5 Accessibility

| ID | Requirement |
|----|-------------|
| NFR-019 | Tool interface is WCAG 2.2 AA compliant |
| NFR-020 | All controls accessible via keyboard |
| NFR-021 | Screen reader compatible |
| NFR-022 | Sufficient color contrast throughout UI |

### 3.6 Browser Support

| ID | Requirement |
|----|-------------|
| NFR-023 | Chrome 90+, Firefox 90+, Safari 14+, Edge 90+ |
| NFR-024 | Responsive design for tablet (1024px+) |

---

## 4. User Interface Specifications

### 4.1 Home Screen Tile

- **Tile Name:** Meta Data Generator
- **Icon:** Document icon with `</>` tag badge
- **Tagline:** "AI-powered SEO metadata for any content"
- **Tile Size:** Standard (1x1 grid unit)
- **Hover State:** Slight elevation, brief feature list tooltip

### 4.2 Main Interface Sections

#### Section A: Upload Zone
- Large drag-and-drop area (minimum 300x200px)
- "Choose files" button as alternative
- "Paste HTML" button for direct input
- "Enter URL" input (future enhancement)
- Supported format icons displayed
- File limit indicators (100 files, 500MB)

#### Section B: Context Panel (Collapsible, Expandable by Default)
```
┌─────────────────────────────────────────────────────────────────┐
│ CONTEXT (Optional - Improves Results)                          │
├─────────────────────────────────────────────────────────────────┤
│ Brand/Client Name: [_______________]  [Load Preset ▼]           │
│                                                                 │
│ Company Description: [___________________________________]      │
│                                                                 │
│ Industry: [Select ▼]          Content Type: [Select ▼]         │
│                                                                 │
│ Target Keywords (comma-separated):                              │
│ [_________________________________________________________]    │
│                                                                 │
│ Target Audience: [___________________________________]          │
│                                                                 │
│ Tone: [Professional ▼]                                          │
│                                                                 │
│ ☑ Include brand name in title    Position: [End ▼] Sep: [ | ]  │
│                                                                 │
│ [Save as Preset]                                                │
└─────────────────────────────────────────────────────────────────┘
```

#### Section C: Configuration Panel
```
┌─────────────────────────────────────────────────────────────────┐
│ CONFIGURATION                                                   │
├─────────────────────────────────────────────────────────────────┤
│ Character Limits:                                               │
│   Title Tag:         [60 ] chars (recommended: 50-60)           │
│   Meta Description:  [155] chars (recommended: 150-160)         │
│   OG Title:          [60 ] chars                                │
│   OG Description:    [200] chars                                │
│                                                                 │
│ Include in Output:                                              │
│   ☑ Open Graph Tags    ☑ Twitter Card Tags                     │
│   ☐ Canonical URL      ☐ Multiple Variants                     │
│                                                                 │
│ [Apply Preset: Standard ▼]                                      │
└─────────────────────────────────────────────────────────────────┘
```

#### Section D: Results Panel
```
┌─────────────────────────────────────────────────────────────────┐
│ RESULTS (5 files processed)                                     │
├─────────────────────────────────────────────────────────────────┤
│ ▼ document-1.docx                                    [Regenerate]│
│   ┌─────────────────────────────────────────────────────────────┐
│   │ SERP Preview                                                │
│   │ ┌─────────────────────────────────────────────────────────┐ │
│   │ │ The Ultimate Guide to Content Strategy | Brand          │ │
│   │ │ example.com/content-strategy                            │ │
│   │ │ Learn how to develop a winning content strategy that... │ │
│   │ └─────────────────────────────────────────────────────────┘ │
│   │                                                             │
│   │ Title: [___________________________] 58/60 ✓                │
│   │ Description: [_____________________] 152/155 ✓              │
│   │ OG Title: [________________________] 55/60 ✓                │
│   │ OG Description: [__________________] 180/200 ✓              │
│   │ Focus Keyword: content strategy                             │
│   │                                                             │
│   │ [Copy HTML] [View Social Preview]                           │
│   └─────────────────────────────────────────────────────────────┘
│                                                                 │
│ ▶ document-2.pdf                                     [Regenerate]│
│ ▶ document-3.html                                    [Regenerate]│
└─────────────────────────────────────────────────────────────────┘
```

#### Section E: Download Panel
```
┌─────────────────────────────────────────────────────────────────┐
│ DOWNLOAD                                                        │
├─────────────────────────────────────────────────────────────────┤
│ [Download Excel Report]  [Download HTML Snippets (ZIP)]         │
│                                                                 │
│ Format: ○ Excel  ○ CSV  ○ JSON                                  │
│ Include: ☑ All fields  ☐ Custom selection                      │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 SERP Preview Component

```
┌─────────────────────────────────────────────────────────────────┐
│ 📱 Mobile  |  💻 Desktop                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  The Ultimate Guide to Content Marketing Strategy | Brand       │ ← Title (blue, clickable)
│  https://www.example.com › content-marketing-guide              │ ← URL (green)
│  Learn how to develop a winning content marketing strategy      │
│  that drives traffic, generates leads, and builds brand...     │ ← Description (gray)
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Social Preview Component

```
┌─────────────────────────────────────────────────────────────────┐
│ Facebook                           │ Twitter                    │
├────────────────────────────────────┼────────────────────────────┤
│ ┌──────────────────────────────┐   │ ┌────────────────────────┐ │
│ │     [Image Placeholder]      │   │ │  [Image Placeholder]   │ │
│ │         1200x630             │   │ │       1200x675         │ │
│ ├──────────────────────────────┤   │ ├────────────────────────┤ │
│ │ EXAMPLE.COM                  │   │ │ OG Title Here          │ │
│ │ OG Title Here                │   │ │ OG Description text... │ │
│ │ OG Description text that     │   │ │ example.com            │ │
│ │ appears under the title...   │   │ └────────────────────────┘ │
│ └──────────────────────────────┘   │                            │
└────────────────────────────────────┴────────────────────────────┘
```

---

## 5. API Integration

### 5.1 Claude API Prompt Structure

```
You are an expert SEO specialist and copywriter generating metadata for web content.

DOCUMENT CONTENT:
{extracted_text}

CONTEXT:
- Brand/Client: {brand_name}
- Company Description: {company_description}
- Industry: {industry}
- Content Type: {content_type}
- Target Keywords: {keywords}
- Target Audience: {audience}
- Tone: {tone}
- Unique Value Proposition: {uvp}
- Call-to-Action Preference: {cta_preference}
- Include Brand in Title: {include_brand} (Position: {brand_position}, Separator: {separator})

REQUIREMENTS:

1. PAGE TITLE (max {title_limit} characters):
   - Compelling and click-worthy
   - Include primary keyword near the beginning
   - Unique and descriptive
   - Include brand name if specified: "{brand_name}" at {brand_position} with "{separator}"
   - Avoid clickbait, be accurate to content

2. META DESCRIPTION (max {desc_limit} characters):
   - Summarize page content accurately
   - Include primary keyword naturally
   - Include call-to-action (learn more, discover, get started)
   - Make it compelling to click
   - Complete sentences, proper grammar

3. OG TITLE (max {og_title_limit} characters):
   - Optimized for social sharing
   - Can be slightly different from page title
   - More conversational/engaging

4. OG DESCRIPTION (max {og_desc_limit} characters):
   - Compelling for social media audience
   - May be more casual than meta description
   - Encourage engagement/sharing

5. TWITTER TITLE (max {tw_title_limit} characters):
   - Concise and punchy
   - Works within Twitter's display

6. TWITTER DESCRIPTION (max {tw_desc_limit} characters):
   - Optimized for Twitter's format
   - Encourage clicks/engagement

7. FOCUS KEYWORD:
   - Single primary keyword/phrase for the page
   - Based on content analysis
   - Should appear naturally in title and description

8. URL SLUG SUGGESTION:
   - SEO-friendly URL path
   - Lowercase, hyphens, no special characters
   - Include primary keyword
   - Maximum 60 characters

RESPOND IN JSON FORMAT:
{
  "title": "Page title here",
  "meta_description": "Description here",
  "og_title": "Social title here",
  "og_description": "Social description here",
  "twitter_title": "Twitter title here",
  "twitter_description": "Twitter description here",
  "focus_keyword": "primary keyword",
  "secondary_keywords": ["keyword1", "keyword2", "keyword3"],
  "url_slug": "suggested-url-path",
  "content_summary": "Brief 1-sentence summary of content",
  "detected_intent": "informational|transactional|navigational",
  "confidence": 0.95
}
```

### 5.2 Text Extraction by Format

| Format | Extraction Method |
|--------|-------------------|
| DOCX | mammoth.js for text + structure |
| PDF | pdf.js or pdftotext for text extraction |
| HTML | DOMParser, strip tags, preserve structure |
| MD | Parse markdown, convert to plain text |
| TXT | Direct text content |

### 5.3 API Error Handling

| Error | Action |
|-------|--------|
| 429 Rate Limit | Queue request, retry after delay indicated |
| 500 Server Error | Retry up to 3 times with exponential backoff |
| 400 Bad Request | Log error, skip file, continue batch |
| Timeout | Retry once, then skip with error flag |
| Document Too Large | Truncate to first 20,000 words with notice |

---

## 6. Error Handling

| Condition | User Message |
|-----------|--------------|
| Unsupported file format | "File format not supported. Please upload DOCX, PDF, HTML, MD, or TXT files." |
| File too large | "File exceeds 25MB limit. Please use a smaller document." |
| ZIP too large | "ZIP file exceeds 500MB limit. Please split into smaller batches." |
| Too many files | "Maximum 100 files per batch. You uploaded {count}. Please reduce batch size." |
| Corrupted file | "Unable to read '{filename}'. The file may be corrupted or password-protected." |
| No text content | "'{filename}' contains no extractable text content." |
| API timeout | "Processing timed out for '{filename}'. Retrying..." |
| API rate limit | "Rate limit reached. Processing will resume in {seconds} seconds." |
| Network error | "Network error. Please check your connection and try again." |
| Empty document | "'{filename}' appears to be empty. Please upload documents with content." |

---

## 7. Data Model

### 7.1 Document Processing Record

```javascript
{
  id: "uuid",
  filename: "content-strategy-guide.docx",
  format: "docx",
  file_size_bytes: 234567,
  word_count: 3500,
  extracted_text_preview: "First 500 characters...",
  
  metadata: {
    title: "The Ultimate Guide to Content Strategy | Flipside",
    title_char_count: 52,
    
    meta_description: "Learn how to develop a winning content strategy...",
    description_char_count: 148,
    
    og_title: "Master Content Strategy in 2025",
    og_title_char_count: 32,
    
    og_description: "Discover the secrets to content marketing success...",
    og_description_char_count: 156,
    
    twitter_title: "Content Strategy Guide 2025",
    twitter_title_char_count: 28,
    
    twitter_description: "Everything you need to know about content strategy...",
    twitter_description_char_count: 145,
    
    focus_keyword: "content strategy",
    secondary_keywords: ["content marketing", "SEO strategy", "content planning"],
    url_slug: "content-strategy-guide",
    content_summary: "A comprehensive guide to developing content strategy.",
    detected_intent: "informational"
  },
  
  existing_metadata: {  // For HTML files only
    title: "Old Title",
    meta_description: "Old description"
  },
  
  html_snippet: "<title>The Ultimate Guide...</title>\n<meta name=\"description\"...",
  
  warnings: ["title_near_limit", "similar_to_document_3"],
  
  processing_time_ms: 4200,
  confidence: 0.92,
  error: null,
  created_at: "2025-12-30T14:30:00Z"
}
```

### 7.2 Project Record

```javascript
{
  id: "uuid",
  user_id: "user_uuid",
  name: "Client ABC Website Metadata",
  
  context: {
    brand: "ABC Corp",
    company_description: "Leading provider of...",
    industry: "Technology",
    content_type: "Service Pages",
    keywords: ["cloud services", "enterprise software"],
    audience: "IT decision makers",
    tone: "Professional",
    include_brand: true,
    brand_position: "end",
    brand_separator: " | "
  },
  
  config: {
    title_limit: 60,
    description_limit: 155,
    og_title_limit: 60,
    og_description_limit: 200,
    include_og: true,
    include_twitter: true
  },
  
  documents: [ /* array of Document Processing Records */ ],
  total_documents: 25,
  processing_time_ms: 180000,
  
  created_at: "2025-12-30T14:30:00Z",
  updated_at: "2025-12-30T14:33:00Z"
}
```

### 7.3 Context Preset Record

```javascript
{
  id: "uuid",
  user_id: "user_uuid",
  name: "ABC Corp - Product Pages",
  
  context: {
    brand: "ABC Corp",
    company_description: "Leading provider of cloud solutions",
    industry: "Technology",
    content_type: "Product Page",
    keywords: ["cloud", "SaaS", "enterprise"],
    audience: "IT professionals",
    tone: "Technical",
    include_brand: true,
    brand_position: "end",
    brand_separator: " | "
  },
  
  is_default: false,
  created_at: "2025-12-30T10:00:00Z",
  updated_at: "2025-12-30T10:00:00Z"
}
```

---

## 8. Excel Output Specification

### 8.1 Sheet 1: Metadata Results

| Column | Width | Description |
|--------|-------|-------------|
| A: Filename | 30 | Original uploaded filename |
| B: Title | 60 | Generated page title |
| C: Title Chars | 10 | Character count |
| D: Title Status | 10 | ✓ (under limit) or ⚠ (over/near limit) |
| E: Meta Description | 100 | Generated meta description |
| F: Desc Chars | 10 | Character count |
| G: Desc Status | 10 | ✓ or ⚠ |
| H: OG Title | 60 | Open Graph title |
| I: OG Description | 80 | Open Graph description |
| J: Twitter Title | 60 | Twitter Card title |
| K: Twitter Description | 80 | Twitter Card description |
| L: Focus Keyword | 25 | Suggested primary keyword |
| M: Secondary Keywords | 40 | Comma-separated list |
| N: URL Slug | 40 | Suggested URL path |
| O: Content Type | 15 | Detected/selected content type |
| P: Warnings | 30 | Any processing warnings |

### 8.2 Sheet 2: HTML Snippets

| Column | Width | Description |
|--------|-------|-------------|
| A: Filename | 30 | Original filename |
| B: HTML Code | 150 | Complete HTML meta tags |

Example HTML in column B:
```html
<title>The Ultimate Guide to Content Strategy | Brand</title>
<meta name="description" content="Learn how to develop a winning content strategy...">
<meta property="og:title" content="Master Content Strategy in 2025">
<meta property="og:description" content="Discover the secrets...">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Content Strategy Guide">
<meta name="twitter:description" content="Everything you need...">
```

### 8.3 Sheet 3: Summary

| Row | Content |
|-----|---------|
| 1 | Project Name: {name} |
| 2 | Generated: {date} |
| 3 | Total Files: {count} |
| 4 | Avg Title Length: {avg} characters |
| 5 | Avg Description Length: {avg} characters |
| 6 | Files Over Title Limit: {count} |
| 7 | Files Over Desc Limit: {count} |
| 8 | Potential Duplicates: {count} |
| 9 | Context Used: Brand={brand}, Industry={industry} |

---

## 9. Acceptance Criteria

### 9.1 Core Functionality

1. ✓ User can upload single document and receive metadata within 8 seconds
2. ✓ User can upload ZIP of 100 documents and receive all metadata within 8 minutes
3. ✓ Generated titles are relevant to document content and under character limit
4. ✓ Generated descriptions accurately summarize content
5. ✓ Context input influences generated metadata appropriately
6. ✓ User can edit all metadata fields inline with live character count
7. ✓ SERP preview accurately reflects title and description
8. ✓ Excel download contains all specified columns and sheets
9. ✓ HTML snippets are valid and properly formatted
10. ✓ Duplicate/similar titles flagged within batch

### 9.2 Error Handling

1. ✓ Unsupported file formats rejected with clear message
2. ✓ Oversized files rejected with limit specified
3. ✓ Processing continues for remaining files if one fails
4. ✓ API rate limits handled gracefully with user notification
5. ✓ Empty/unreadable documents flagged appropriately

### 9.3 User Experience

1. ✓ Processing progress clearly visible
2. ✓ Cancel button stops processing and returns partial results
3. ✓ Context presets save and load correctly
4. ✓ All interactions accessible via keyboard
5. ✓ Character limit warnings visible and clear

---

## 10. Future Enhancements (Out of Scope for v1.0)

- Live URL crawling to fetch content
- Integration with Google Search Console for keyword data
- Integration with SEMrush/Ahrefs for search volume
- CMS integration (WordPress, Drupal, etc.)
- Bulk import from Google Sheets
- Multi-language metadata generation
- Historical tracking of metadata changes
- Competitor metadata analysis
- A/B testing integration with Google Optimize
- Automatic schema.org suggestions

---

## 11. Dependencies

| Dependency | Purpose |
|------------|---------|
| Claude API | Content analysis and metadata generation |
| mammoth.js | DOCX text extraction |
| pdf.js | PDF text extraction |
| xlsx library | Excel file generation |
| JSZip | ZIP file handling |
| React Dropzone | File upload interface |
| Firebase Auth | User authentication |
| Firebase Firestore | Project and preset storage |

---

## 12. Glossary

| Term | Definition |
|------|------------|
| Title Tag | HTML `<title>` element displayed in browser tab and search results |
| Meta Description | HTML meta tag providing page summary for search engines |
| Open Graph (OG) | Facebook's protocol for rich social sharing previews |
| Twitter Card | Twitter's system for rich link previews |
| SERP | Search Engine Results Page |
| Focus Keyword | Primary keyword the page should rank for |
| Cannibalization | Multiple pages targeting same keyword, competing with each other |
| URL Slug | The path portion of a URL after the domain |
