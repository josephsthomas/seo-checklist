import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, Upload, Code, CheckCircle2, XCircle, Loader2, FileText,
  Trash2, Info, ChevronDown, ChevronUp, ScanEye, ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { validateReadabilityUrl } from '../../lib/readability/utils/urlValidation';
import { getGrade } from '../../lib/readability/utils/gradeMapper';
import { format } from 'date-fns';

/**
 * Input method tabs
 */
const TABS = [
  { id: 'url', label: 'URL', icon: Globe },
  { id: 'upload', label: 'Upload HTML', icon: Upload },
  { id: 'paste', label: 'Paste HTML', icon: Code }
];

/**
 * Screaming Frog detection
 */
function detectScreamingFrog(htmlContent) {
  const indicators = [
    'screaming frog',
    'screamingfrog',
    'sf-rendered',
    'crawl_timestamp',
    'X-SF-'
  ];
  const lower = htmlContent.toLowerCase();
  return indicators.some(ind => lower.includes(ind));
}

/**
 * Grade color for score badges
 */
function getScoreBadgeClasses(score) {
  if (score >= 90) return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  if (score >= 80) return 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400';
  if (score >= 70) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  if (score >= 60) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
  return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
}

/**
 * Input method icon
 */
function InputMethodIcon({ method }) {
  if (method === 'upload') return <Upload className="w-3.5 h-3.5" aria-hidden="true" />;
  if (method === 'paste') return <Code className="w-3.5 h-3.5" aria-hidden="true" />;
  return <Globe className="w-3.5 h-3.5" aria-hidden="true" />;
}

/**
 * ReadabilityInputScreen — Three-tab input interface with history preview
 *
 * BRD References: US-2.1.1, US-2.1.2, US-2.1.3, FR-1.1, FR-1.2, FR-1.3
 */
export default function ReadabilityInputScreen({
  onAnalyzeUrl,
  onAnalyzeHtml,
  onAnalyzePaste,
  isAnalyzing = false,
  error = null,
  recentAnalyses = [],
  onViewAnalysis,
  prefillUrl = ''
}) {
  // Tab state
  const [activeTab, setActiveTab] = useState('url');

  // URL tab state
  const [url, setUrl] = useState(prefillUrl);
  const [urlValidation, setUrlValidation] = useState(null); // null | { valid, reason }
  const [isValidating, setIsValidating] = useState(false);
  const urlInputRef = useRef(null);
  const validationTimerRef = useRef(null);

  // Upload tab state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isScreamingFrog, setIsScreamingFrog] = useState(false);

  // Paste tab state
  const [pasteContent, setPasteContent] = useState('');

  // Advanced options
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Prefill URL on mount or change
  useEffect(() => {
    if (prefillUrl) {
      setUrl(prefillUrl);
      setActiveTab('url');
    }
  }, [prefillUrl]);

  // Debounced URL validation (300ms)
  useEffect(() => {
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    if (!url.trim()) {
      setUrlValidation(null);
      return;
    }

    setIsValidating(true);
    validationTimerRef.current = setTimeout(() => {
      const result = validateReadabilityUrl(url);
      setUrlValidation(result);
      setIsValidating(false);
    }, 300);

    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
  }, [url]);

  // URL tab handlers
  const handleUrlSubmit = useCallback((e) => {
    e.preventDefault();
    if (urlValidation?.valid && !isAnalyzing) {
      onAnalyzeUrl(url);
    }
  }, [url, urlValidation, isAnalyzing, onAnalyzeUrl]);

  const handleUrlPaste = useCallback((e) => {
    // Paste-and-go: validate immediately on paste
    const pasted = e.clipboardData?.getData('text') || '';
    if (pasted) {
      setUrl(pasted);
    }
  }, []);

  // Upload tab — react-dropzone
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setUploadError(null);
    setIsScreamingFrog(false);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors?.some(e => e.code === 'file-too-large')) {
        setUploadError('File exceeds the 10MB limit.');
      } else if (rejection.errors?.some(e => e.code === 'file-invalid-type')) {
        setUploadError('Only .html and .htm files are supported.');
      } else {
        setUploadError('Invalid file. Please upload an .html or .htm file.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

      if (file.size === 0) {
        setUploadError('The uploaded file is empty.');
        return;
      }

      // Check for Screaming Frog by reading a preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target.result.substring(0, 5000);
        if (detectScreamingFrog(preview)) {
          setIsScreamingFrog(true);
        }
      };
      reader.readAsText(file.slice(0, 5000));

      setUploadedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html', '.htm']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isAnalyzing
  });

  const handleUploadSubmit = useCallback(() => {
    if (uploadedFile && !isAnalyzing) {
      onAnalyzeHtml(uploadedFile);
    }
  }, [uploadedFile, isAnalyzing, onAnalyzeHtml]);

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setUploadError(null);
    setIsScreamingFrog(false);
  }, []);

  // Paste tab handlers
  const handlePasteSubmit = useCallback(() => {
    if (pasteContent.length >= 100 && !isAnalyzing) {
      onAnalyzePaste(pasteContent);
    }
  }, [pasteContent, isAnalyzing, onAnalyzePaste]);

  // Paste content size
  const pasteSize = useMemo(() => new Blob([pasteContent]).size, [pasteContent]);
  const pasteSizeMB = pasteSize / (1024 * 1024);
  const pasteAtLimit = pasteSizeMB >= 1.6; // 80% of 2MB
  const pasteOverLimit = pasteSizeMB > 2;

  // Tab keyboard navigation
  const handleTabKeyDown = useCallback((e) => {
    const tabIds = TABS.map(t => t.id);
    const currentIndex = tabIds.indexOf(activeTab);

    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const direction = e.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (currentIndex + direction + tabIds.length) % tabIds.length;
      setActiveTab(tabIds[nextIndex]);
    }
  }, [activeTab]);

  // Dropzone classes
  const dropzoneClasses = useMemo(() => {
    const base = 'relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer';
    if (isDragReject) return `${base} border-red-400 bg-red-50 dark:bg-red-900/20`;
    if (isDragActive) return `${base} border-teal-500 bg-teal-50 dark:bg-teal-900/20 scale-[1.01]`;
    if (uploadedFile) return `${base} border-teal-300 bg-teal-50/50 dark:bg-teal-900/10 dark:border-teal-700`;
    return `${base} border-charcoal-300 dark:border-charcoal-600 hover:border-teal-300 dark:hover:border-teal-600 bg-white dark:bg-charcoal-800`;
  }, [isDragActive, isDragReject, uploadedFile]);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Tab Navigation */}
      <div
        className="flex border-b border-charcoal-200 dark:border-charcoal-700 mb-6"
        role="tablist"
        aria-label="Input method"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={handleTabKeyDown}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset
                ${isActive
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-charcoal-500 dark:text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-300 hover:border-charcoal-300'
                }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* URL Tab Panel */}
      {activeTab === 'url' && (
        <div
          role="tabpanel"
          id="tabpanel-url"
          aria-labelledby="tab-url"
          className="motion-safe:animate-fade-in"
        >
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div>
              <label htmlFor="url-input" className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1">
                Page URL
              </label>
              <div className="relative">
                <input
                  id="url-input"
                  ref={urlInputRef}
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onPaste={handleUrlPaste}
                  placeholder="https://example.com/your-page"
                  autoComplete="url"
                  aria-required="true"
                  aria-invalid={urlValidation?.valid === false || undefined}
                  aria-describedby={urlValidation?.valid === false ? 'url-error' : undefined}
                  disabled={isAnalyzing}
                  className={`w-full px-4 py-3 pr-10 rounded-lg border text-base transition-colors
                    focus:outline-none focus:ring-2 focus:ring-teal-500
                    dark:bg-charcoal-800 dark:text-charcoal-100
                    ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
                    ${!url ? 'border-charcoal-300 dark:border-charcoal-600' : ''}
                    ${url && urlValidation?.valid ? 'border-emerald-400 dark:border-emerald-600' : ''}
                    ${url && urlValidation?.valid === false ? 'border-red-400 dark:border-red-600' : ''}
                    ${url && urlValidation === null ? 'border-charcoal-300 dark:border-charcoal-600' : ''}`}
                />
                {/* Validation icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidating && (
                    <Loader2 className="w-5 h-5 text-charcoal-400 animate-spin" aria-hidden="true" />
                  )}
                  {!isValidating && url && urlValidation?.valid && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" aria-label="Valid URL" />
                  )}
                  {!isValidating && url && urlValidation?.valid === false && (
                    <XCircle className="w-5 h-5 text-red-500" aria-label="Invalid URL" />
                  )}
                </div>
              </div>
              {/* Validation error message */}
              {url && urlValidation?.valid === false && (
                <p id="url-error" className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                  {urlValidation.reason}
                </p>
              )}
            </div>

            {/* Advanced Options (collapsible) */}
            <div>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-1 text-sm text-charcoal-500 dark:text-charcoal-400 hover:text-charcoal-700 dark:hover:text-charcoal-300 transition-colors"
                aria-expanded={showAdvanced}
              >
                {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                Advanced Options
              </button>
              {showAdvanced && (
                <div className="mt-3 p-4 bg-charcoal-50 dark:bg-charcoal-800/50 rounded-lg border border-charcoal-200 dark:border-charcoal-700 space-y-3 motion-safe:animate-fade-in">
                  <div>
                    <label htmlFor="industry-select" className="block text-sm font-medium text-charcoal-600 dark:text-charcoal-400 mb-1">
                      Industry (optional)
                    </label>
                    <select
                      id="industry-select"
                      className="w-full px-3 py-2 rounded-lg border border-charcoal-300 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select industry...</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="ecommerce">E-Commerce</option>
                      <option value="education">Education</option>
                      <option value="media">Media & Publishing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="keywords-input" className="block text-sm font-medium text-charcoal-600 dark:text-charcoal-400 mb-1">
                      Target Keywords (optional)
                    </label>
                    <input
                      id="keywords-input"
                      type="text"
                      placeholder="e.g., AI readability, content optimization"
                      className="w-full px-3 py-2 rounded-lg border border-charcoal-300 dark:border-charcoal-600 dark:bg-charcoal-800 dark:text-charcoal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      maxLength={200}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Analyze button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!urlValidation?.valid || isAnalyzing}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-lg transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-teal-500 disabled:hover:to-teal-600
                  focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-charcoal-900"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <ScanEye className="w-4 h-4" aria-hidden="true" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upload Tab Panel */}
      {activeTab === 'upload' && (
        <div
          role="tabpanel"
          id="tabpanel-upload"
          aria-labelledby="tab-upload"
          className="motion-safe:animate-fade-in space-y-4"
        >
          {/* Dropzone */}
          {!uploadedFile ? (
            <div
              {...getRootProps()}
              className={dropzoneClasses}
              aria-label="Upload HTML file for analysis"
              style={{ minHeight: '200px' }}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center py-4">
                <Upload
                  className={`w-10 h-10 mb-3 ${isDragActive ? 'text-teal-500' : 'text-charcoal-400 dark:text-charcoal-500'}`}
                  aria-hidden="true"
                />
                {isDragActive ? (
                  <p className="text-teal-600 dark:text-teal-400 font-medium">Drop your HTML file here</p>
                ) : isDragReject ? (
                  <p className="text-red-600 dark:text-red-400 font-medium">Unsupported file type</p>
                ) : (
                  <>
                    <p className="text-charcoal-700 dark:text-charcoal-300 font-medium">
                      Drag & drop your HTML file here
                    </p>
                    <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
                      or click to browse — .html, .htm up to 10MB
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* File selected state */
            <div className="border border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-900/10 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-teal-500" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-charcoal-900 dark:text-charcoal-100">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-2 rounded-lg hover:bg-charcoal-100 dark:hover:bg-charcoal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                  aria-label="Remove file"
                >
                  <Trash2 className="w-4 h-4 text-charcoal-500" aria-hidden="true" />
                </button>
              </div>

              {/* Screaming Frog detection */}
              {isScreamingFrog && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Screaming Frog export detected
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">
                        This appears to be rendered HTML exported from Screaming Frog SEO Spider. Great choice for accurate analysis!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Analyze button */}
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={handleRemoveFile}
                  className="px-4 py-2 text-sm text-charcoal-600 dark:text-charcoal-400 hover:text-charcoal-800 dark:hover:text-charcoal-200 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-lg"
                >
                  Remove
                </button>
                <button
                  onClick={handleUploadSubmit}
                  disabled={isAnalyzing}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-lg transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-charcoal-900"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ScanEye className="w-4 h-4" aria-hidden="true" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Upload error */}
          {uploadError && (
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1" role="alert">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
              {uploadError}
            </p>
          )}

          {/* Screaming Frog guide callout */}
          {!uploadedFile && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r-lg">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                How to export rendered HTML from Screaming Frog
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                In Screaming Frog SEO Spider, right-click any URL → View Source → Rendered HTML, then save as .html file.
                This gives the most accurate analysis for JavaScript-rendered pages.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Paste Tab Panel */}
      {activeTab === 'paste' && (
        <div
          role="tabpanel"
          id="tabpanel-paste"
          aria-labelledby="tab-paste"
          className="motion-safe:animate-fade-in space-y-4"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="paste-textarea" className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
                HTML Content
              </label>
              <span className={`text-xs ${pasteAtLimit ? 'text-amber-600 dark:text-amber-400' : 'text-charcoal-400 dark:text-charcoal-500'}`}>
                {pasteContent.length.toLocaleString()} characters
              </span>
            </div>
            <textarea
              id="paste-textarea"
              value={pasteContent}
              onChange={(e) => setPasteContent(e.target.value)}
              placeholder="Paste your HTML content here..."
              disabled={isAnalyzing}
              className={`w-full px-4 py-3 rounded-lg border font-mono text-sm transition-colors resize-y
                focus:outline-none focus:ring-2 focus:ring-teal-500
                dark:bg-charcoal-800 dark:text-charcoal-100
                ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
                ${pasteOverLimit ? 'border-red-400 dark:border-red-600' : 'border-charcoal-300 dark:border-charcoal-600'}`}
              style={{ minHeight: '300px' }}
              aria-describedby="paste-help"
            />
            {/* Paste feedback messages */}
            <div id="paste-help" className="mt-1.5">
              {pasteContent.length > 0 && pasteContent.length < 100 && (
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
                  Paste at least 100 characters to analyze
                </p>
              )}
              {pasteAtLimit && !pasteOverLimit && (
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Approaching the 2MB limit
                </p>
              )}
              {pasteOverLimit && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Content exceeds the 2MB limit
                </p>
              )}
            </div>
          </div>

          {/* Analyze button */}
          <div className="flex justify-end">
            <button
              onClick={handlePasteSubmit}
              disabled={pasteContent.length < 100 || pasteOverLimit || isAnalyzing}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium rounded-lg transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-charcoal-900"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  Analyzing...
                </>
              ) : (
                <>
                  <ScanEye className="w-4 h-4" aria-hidden="true" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Recent Analyses Preview */}
      {recentAnalyses.length > 0 && (
        <div className="mt-8 pt-6 border-t border-charcoal-200 dark:border-charcoal-700">
          <h2 className="text-sm font-semibold text-charcoal-700 dark:text-charcoal-300 mb-3">
            Recent Analyses
          </h2>
          <div className="space-y-2">
            {recentAnalyses.slice(0, 5).map((item) => {
              const grade = getGrade(item.overallScore);
              return (
                <button
                  key={item.id}
                  onClick={() => onViewAnalysis?.(item.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 hover:border-teal-300 dark:hover:border-teal-600 transition-colors text-left
                    focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <InputMethodIcon method={item.inputMethod} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-900 dark:text-charcoal-100 truncate">
                      {item.sourceUrl || item.filename || item.pageTitle || 'Untitled'}
                    </p>
                    <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                      {item.createdAt ? format(new Date(item.createdAt), 'MMM d, yyyy') : ''}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getScoreBadgeClasses(item.overallScore)}`}>
                    {item.overallScore} {grade.grade}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-charcoal-400 flex-shrink-0" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <Link
            to="/app/readability"
            className="inline-block mt-3 text-sm text-teal-600 dark:text-teal-400 hover:underline"
          >
            View all history →
          </Link>
        </div>
      )}
    </div>
  );
}
