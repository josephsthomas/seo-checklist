# AI Readability Checker — Technical Architecture

## 1. File & Component Structure

### 1.1 New Files

```
src/
  components/
    readability/
      ReadabilityPage.jsx              # Main page component (view router)
      ReadabilityInputScreen.jsx       # Input screen (URL/Upload/Paste tabs)
      ReadabilityProcessingScreen.jsx  # Processing progress view
      ReadabilityDashboard.jsx         # Results dashboard (score + tabs)
      ReadabilityScoreCard.jsx         # Overall score display with gauge
      ReadabilityCategoryChart.jsx     # Radar/bar chart for categories
      ReadabilityCategoryAccordion.jsx # Expandable category detail
      ReadabilityCheckItem.jsx         # Individual check result row
      ReadabilityLLMPreview.jsx        # LLM side-by-side comparison view
      ReadabilityLLMColumn.jsx         # Single LLM extraction column
      ReadabilityRecommendations.jsx   # Recommendations list with filters
      ReadabilityRecommendationCard.jsx# Single recommendation card
      ReadabilityIssuesTable.jsx       # Filterable/sortable issues table
      ReadabilityHistory.jsx           # Analysis history list
      ReadabilityShareView.jsx         # Public shared analysis view
      ReadabilityCodeSnippet.jsx       # Before/after code display
      ReadabilityCoverageTable.jsx     # LLM coverage metrics table

  lib/
    readability/
      extractor.js          # HTML parsing and content extraction
      scorer.js             # Rule-based scoring engine (50 checks)
      aiAnalyzer.js         # Claude AI analysis integration
      llmPreview.js         # Multi-LLM extraction orchestrator
      aggregator.js         # Results aggregation and normalization
      recommendations.js    # Recommendation generation engine
      checks/
        contentStructure.js # CS-01 through CS-10 checks
        contentClarity.js   # CC-01 through CC-10 checks
        technicalAccess.js  # TA-01 through TA-10 checks
        metadataSchema.js   # MS-01 through MS-10 checks
        aiSignals.js        # AS-01 through AS-10 checks
      utils/
        htmlParser.js       # DOM parsing utilities
        textAnalysis.js     # Readability, sentence analysis
        urlValidation.js    # URL validation (extend existing)
        scoreCalculator.js  # Weighted score computation
        gradeMapper.js      # Score-to-grade mapping

  hooks/
    useReadabilityAnalysis.js  # Main analysis orchestration hook
    useReadabilityHistory.js   # Firestore history CRUD hook
    useReadabilityExport.js    # PDF/JSON export hook
    useReadabilityShare.js     # Share link generation hook
```

### 1.2 Modified Existing Files

| File | Change |
|---|---|
| `src/config/tools.js` | Add readability tool entry + TEAL color |
| `src/App.jsx` | Add route for `/app/readability` and `/app/readability/:id` |
| `src/components/home/HomePage.jsx` | Add quick action for AI Readability |
| `src/components/home/ToolCard.jsx` | Add `teal` to colorVariants |
| `src/utils/roles.js` | Add `canRunReadabilityCheck` permission |
| `firestore.rules` | Add readability collections rules |
| `storage.rules` | Add readability storage rules |
| `tailwind.config.js` | Ensure teal colors are in safelist (if purged) |

---

## 2. Routing

### 2.1 Route Definitions

```javascript
// In App.jsx, add within the ProtectedRoute wrapper:
const ReadabilityPage = lazyWithRetry(
  () => import('./components/readability/ReadabilityPage')
);

<Route path="/app/readability" element={
  <ProtectedRoute>
    <ToolErrorBoundary tool="readability" color="teal">
      <ReadabilityPage />
    </ToolErrorBoundary>
  </ProtectedRoute>
} />

<Route path="/app/readability/:analysisId" element={
  <ProtectedRoute>
    <ToolErrorBoundary tool="readability" color="teal">
      <ReadabilityPage />
    </ToolErrorBoundary>
  </ProtectedRoute>
} />

// Public shared view (no auth required)
<Route path="/shared/readability/:shareToken" element={
  <ReadabilityShareView />
} />
```

### 2.2 View State Machine

The main `ReadabilityPage` component manages view state internally:

```
VIEWS = {
  INPUT: 'input',           // Default — URL/Upload/Paste
  PROCESSING: 'processing', // Analysis in progress
  DASHBOARD: 'dashboard',   // Results display
  HISTORY: 'history',       // Analysis history list
  ERROR: 'error'            // Fatal error state
}

State transitions:
  INPUT -> PROCESSING       (user clicks Analyze)
  PROCESSING -> DASHBOARD   (analysis completes)
  PROCESSING -> ERROR       (fatal error)
  DASHBOARD -> INPUT        (user clicks New Analysis)
  INPUT -> DASHBOARD        (user clicks history item)
  Any -> INPUT              (user clicks Back / New Analysis)
```

---

## 3. State Management

### 3.1 Component State (useState/useReducer)

The `useReadabilityAnalysis` hook SHALL manage all analysis state:

```javascript
const useReadabilityAnalysis = () => {
  // View state
  const [view, setView] = useState(VIEWS.INPUT);

  // Input state
  const [inputMethod, setInputMethod] = useState('url');
  const [url, setUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState(null);
  const [context, setContext] = useState({ industry: '', keywords: '' });

  // Processing state
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [stageResults, setStageResults] = useState({});

  // Results state
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Actions
  const analyzeUrl = useCallback(async (url, options) => { ... });
  const analyzeHtml = useCallback(async (html, filename) => { ... });
  const cancelAnalysis = useCallback(() => { ... });
  const resetAnalysis = useCallback(() => { ... });

  return {
    view, inputMethod, url, progress, stage, stageResults,
    results, error,
    setInputMethod, setUrl, setHtmlContent, setContext,
    analyzeUrl, analyzeHtml, cancelAnalysis, resetAnalysis
  };
};
```

### 3.2 Firestore State (hooks)

```javascript
// useReadabilityHistory — CRUD for analysis records
const useReadabilityHistory = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener on readability-analyses collection
  // Filtered by userId, ordered by createdAt desc

  const saveAnalysis = async (results) => { ... };
  const deleteAnalysis = async (id) => { ... };
  const getAnalysis = async (id) => { ... };

  return { analyses, loading, saveAnalysis, deleteAnalysis, getAnalysis };
};
```

### 3.3 No Global State Changes

The tool SHALL NOT modify any existing Context providers (AuthContext, ThemeContext). All state is local to the readability components and Firestore.

---

## 4. Processing Pipeline

### 4.1 Analysis Orchestration

```javascript
async function runAnalysis(input, onProgress) {
  const abortController = new AbortController();

  try {
    // Stage 1: Content acquisition (0-15%)
    onProgress(5, 'Fetching page content...');
    const html = input.type === 'url'
      ? await fetchUrl(input.url, abortController.signal)
      : input.html;

    // Stage 2: Content extraction (15-25%)
    onProgress(20, 'Extracting content and metadata...');
    const extracted = extractContent(html);

    // Stage 3-6: Parallel LLM calls (25-85%)
    onProgress(25, 'Analyzing with AI models...');
    const [claudeAnalysis, ...llmExtractions] = await Promise.allSettled([
      analyzeWithClaude(extracted, abortController.signal),
      extractWithOpenAI(extracted, abortController.signal),
      extractWithGemini(extracted, abortController.signal),
      extractWithPerplexity(extracted, abortController.signal)
    ]);

    // Update progress per resolved promise
    // Each LLM completion advances progress by ~15%

    // Stage 7: Scoring (85-95%)
    onProgress(88, 'Calculating scores...');
    const scores = calculateScores(extracted, claudeAnalysis);

    // Stage 8: Recommendations (95-100%)
    onProgress(95, 'Generating recommendations...');
    const recommendations = generateRecommendations(scores, extracted, claudeAnalysis);

    onProgress(100, 'Complete');

    return {
      extracted,
      scores,
      llmExtractions: normalizeLLMResults(llmExtractions),
      claudeAnalysis: normalizeClaudeResult(claudeAnalysis),
      recommendations
    };
  } catch (error) {
    if (error.name === 'AbortError') return null;
    throw error;
  }
}
```

### 4.2 Content Extraction Pipeline

```javascript
function extractContent(html) {
  // 1. Parse HTML to DOM (using DOMParser in browser)
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // 2. Extract metadata
  const metadata = extractMetadata(doc);

  // 3. Extract structured data
  const structuredData = extractStructuredData(doc);

  // 4. Extract heading tree
  const headings = extractHeadings(doc);

  // 5. Identify main content area
  const mainContent = identifyMainContent(doc);

  // 6. Clean content (strip scripts, styles, hidden elements)
  const cleanedContent = cleanContent(mainContent);

  // 7. Extract text for analysis
  const textContent = extractText(cleanedContent);

  // 8. Calculate content metrics
  const metrics = calculateMetrics(html, textContent, doc);

  return {
    metadata, structuredData, headings, mainContent: cleanedContent,
    textContent, metrics, rawHtml: html, document: doc
  };
}
```

### 4.3 LLM Call Pattern

Each LLM call follows the same pattern:

```javascript
async function extractWithLLM(provider, model, extracted, signal) {
  const startTime = Date.now();
  try {
    const response = await fetch(`${AI_PROXY_URL}/api/ai/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getAuthToken()}`
      },
      body: JSON.stringify({
        provider,
        model,
        task: 'readability-extraction',
        content: {
          html: extracted.textContent.substring(0, 50000), // Limit input size
          metadata: extracted.metadata
        },
        parameters: { maxTokens: 4096, temperature: 0.2 }
      }),
      signal
    });

    if (!response.ok) throw new Error(`${provider} API error: ${response.status}`);

    const data = await response.json();
    return {
      ...data.extraction,
      provider,
      model,
      status: 'success',
      processingTimeMs: Date.now() - startTime
    };
  } catch (error) {
    return {
      provider, model,
      status: error.name === 'AbortError' ? 'cancelled' : 'error',
      error: error.message,
      processingTimeMs: Date.now() - startTime
    };
  }
}
```

---

## 5. Code Splitting & Lazy Loading

### 5.1 Dynamic Imports

The ReadabilityPage SHALL be lazy-loaded using the existing `lazyWithRetry` utility:

```javascript
const ReadabilityPage = lazyWithRetry(
  () => import('./components/readability/ReadabilityPage')
);
```

### 5.2 Vite Chunk Configuration

Add to `vite.config.js` manual chunks:

```javascript
'vendor-readability': ['chart.js', 'react-chartjs-2']
// Note: chart.js is already used by other tools, so it may already be chunked
```

### 5.3 Heavy Sub-Components

The LLM Preview and Chart components SHOULD be lazy-loaded within the dashboard:

```javascript
const LLMPreview = lazy(() => import('./ReadabilityLLMPreview'));
const CategoryChart = lazy(() => import('./ReadabilityCategoryChart'));
```

---

## 6. Integration Points

### 6.1 Tool Registry (tools.js)

```javascript
{
  id: 'readability',
  name: 'AI Readability Checker',
  shortName: 'Readability',
  description: 'Analyze how AI search engines interpret your content. Get scores, LLM rendering previews, and actionable recommendations.',
  icon: ScanEye,
  path: '/app/readability',
  color: TOOL_COLORS.TEAL,
  status: TOOL_STATUS.ACTIVE,
  badge: 'New',
  features: [
    'AI readability scoring',
    'Multi-LLM rendering preview',
    'Actionable recommendations',
    'URL and HTML analysis'
  ],
  statsConfig: [
    { key: 'analysisCount', label: 'Analyzed' },
    { key: 'avgScore', label: 'Avg Score' }
  ],
  permissions: ['canRunReadabilityCheck'],
  order: 7
}
```

### 6.2 Permission (roles.js)

Add `canRunReadabilityCheck: true` to: ADMIN, PROJECT_MANAGER, SEO_SPECIALIST, DEVELOPER, CONTENT_WRITER. Set to `false` for CLIENT.

### 6.3 Command Palette

The tool SHALL be discoverable via the existing Command Palette (Cmd+K). The tool registry entry ensures this automatically.

### 6.4 Export Hub Integration

Analysis exports SHALL appear in the Export Hub via the existing export infrastructure. The `useReadabilityExport` hook SHALL register exportable items.

---

## 7. Dependencies

### 7.1 New Dependencies

None required. All functionality is achievable with existing dependencies:
- `chart.js` + `react-chartjs-2` — already installed (charts)
- `react-dropzone` — already installed (file upload)
- `react-markdown` — already installed (LLM content rendering)
- `jspdf` + `jspdf-autotable` — already installed (PDF export)
- `react-hook-form` — already installed (form management)
- `DOMParser` — browser native (HTML parsing)

### 7.2 Optional Dependencies (if needed)

| Package | Purpose | Decision |
|---|---|---|
| `prismjs` or `highlight.js` | Syntax highlighting for code snippets | Consider if basic CSS isn't sufficient |
| `diff` | Text diffing for LLM comparison | Consider if paragraph-level diff is insufficient |

---

*Document Version: 1.0*
*Created: 2026-02-17*
*Last Updated: 2026-02-17*
*Status: Draft*
