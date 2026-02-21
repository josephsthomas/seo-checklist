import { useState, useCallback } from 'react';
import { AlertTriangle, RotateCcw, HelpCircle, FileWarning, FileX, Database, Lightbulb, Accessibility } from 'lucide-react';
import AccessibilityUploadScreen from './upload/AccessibilityUploadScreen';
import AccessibilityProcessingScreen from './upload/AccessibilityProcessingScreen';
import AccessibilityDashboard from './dashboard/AccessibilityDashboard';
import { processZipFile } from '../../lib/audit/zipProcessor';
import { parseAccessibilityFiles, convertToEngineFormat } from '../../lib/accessibility/accessibilityParser';
import { runAccessibilityAudit } from '../../lib/accessibility/accessibilityEngine';
import { detectAvailableAudits } from '../../lib/audit/excelParser';
import toast from 'react-hot-toast';

// Error guidance for accessibility audit
const ERROR_GUIDANCE = {
  'accessibility_all.xlsx not found': {
    title: 'Missing Accessibility Data',
    icon: FileX,
    description: 'The accessibility_all.xlsx file is required but was not found in your export.',
    steps: [
      'Open Screaming Frog SEO Spider',
      'Enable accessibility auditing in Configuration → Accessibility',
      'Run a fresh crawl with accessibility testing enabled',
      'Go to File → Export → Multi Export and include Accessibility tabs',
      'Select Excel (.xlsx) format and export again'
    ]
  },
  'No accessibility files': {
    title: 'Accessibility Audit Not Enabled',
    icon: Accessibility,
    description: 'This export does not contain accessibility audit data.',
    steps: [
      'Open Screaming Frog SEO Spider',
      'Go to Configuration → Accessibility',
      'Enable "Include Accessibility" option',
      'Select the WCAG rules you want to audit (recommend All Rules)',
      'Re-crawl your website and export again'
    ]
  },
  'Invalid file type': {
    title: 'Unsupported File Format',
    icon: FileWarning,
    description: 'The uploaded file is not a valid ZIP archive.',
    steps: [
      'Ensure you\'re uploading the ZIP file created by Screaming Frog',
      'Do not rename or modify the file after export',
      'The file should have a .zip extension'
    ]
  },
  'File too large': {
    title: 'File Size Exceeded',
    icon: Database,
    description: 'The file exceeds the maximum allowed size of 500MB.',
    steps: [
      'Export fewer tabs from Screaming Frog',
      'Consider crawling a smaller section of the site',
      'Focus on key areas like homepage and main templates'
    ]
  },
  'default': {
    title: 'Processing Error',
    icon: AlertTriangle,
    description: 'An error occurred while processing your accessibility audit file.',
    steps: [
      'Verify your export is from Screaming Frog Multi Export',
      'Ensure accessibility auditing was enabled during the crawl',
      'Try exporting again with Excel format selected',
      'If the problem persists, check Screaming Frog\'s accessibility configuration'
    ]
  }
};

function getErrorGuidance(errorMessage) {
  for (const [key, value] of Object.entries(ERROR_GUIDANCE)) {
    if (key !== 'default' && errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  return ERROR_GUIDANCE.default;
}

// View states
const VIEWS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  DASHBOARD: 'dashboard',
  ERROR: 'error'
};

export default function AccessibilityAuditPage() {
  const [view, setView] = useState(VIEWS.UPLOAD);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('extracting');
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [auditResults, setAuditResults] = useState(null);
  const [domainInfo, setDomainInfo] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = useCallback(async (file) => {
    setFileName(file.name);
    setView(VIEWS.PROCESSING);
    setProgress(0);
    setStage('extracting');
    setError(null);

    try {
      // Stage 1: Extract ZIP
      setMessage('Extracting files from ZIP...');
      const extractResult = await processZipFile(file, (p, msg) => {
        setProgress(Math.round(p * 0.2)); // 0-20%
        setMessage(msg);
      });

      if (!extractResult.success) {
        throw new Error(extractResult.error);
      }

      // Check for accessibility data
      const available = detectAvailableAudits(extractResult.files);
      if (!available.accessibilityAudit) {
        throw new Error('accessibility_all.xlsx not found. Make sure accessibility auditing was enabled in Screaming Frog.');
      }

      if (available.accessibilityFiles < 2) {
        throw new Error('No accessibility violation files found. Enable accessibility testing in Screaming Frog configuration.');
      }

      // Stage 2: Parse accessibility files
      setStage('parsing');
      setProgress(20);
      setMessage('Parsing accessibility files...');

      const parsedData = await parseAccessibilityFiles(extractResult.files, (p, msg) => {
        setProgress(20 + Math.round(p * 0.3)); // 20-50%
        setMessage(msg);
      });

      if (!parsedData.success) {
        throw new Error('Failed to parse accessibility data');
      }

      // Extract domain info from URLs
      const firstUrl = parsedData.mainData?.rows?.[0]?.address;
      if (firstUrl) {
        try {
          const urlObj = new URL(firstUrl);
          setDomainInfo({
            domain: urlObj.hostname,
            urlCount: parsedData.mainData.rowCount
          });
        } catch (e) {
          setDomainInfo({ domain: 'Unknown', urlCount: parsedData.mainData.rowCount });
        }
      }

      setProgress(50);
      setMessage(`Parsed ${parsedData.stats.violationFiles} violation types across ${parsedData.mainData?.rowCount || 0} URLs...`);

      // Stage 3: Convert to engine format
      setStage('analyzing');
      setProgress(55);
      setMessage('Preparing audit data...');
      const engineData = convertToEngineFormat(parsedData);

      // Stage 4: Run accessibility audit
      setProgress(60);
      setMessage('Running WCAG compliance analysis...');

      const results = await runAccessibilityAudit(engineData, (p, msg) => {
        setProgress(60 + Math.round(p * 0.35)); // 60-95%
        setMessage(msg);
      });

      if (!results.success) {
        throw new Error(results.error || 'Audit processing failed');
      }

      // Complete
      setStage('complete');
      setProgress(100);
      setMessage('Accessibility audit complete!');

      // Brief pause to show completion
      await new Promise(resolve => setTimeout(resolve, 500));

      setAuditResults(results);
      setView(VIEWS.DASHBOARD);

      const complianceLevel = results.scores.overall >= 90 ? 'excellent' :
        results.scores.overall >= 70 ? 'good' :
        results.scores.overall >= 50 ? 'needs improvement' : 'poor';

      toast.success(`Audit complete! WCAG compliance: ${results.scores.overall}% (${complianceLevel})`);

    } catch (err) {
      console.error('Accessibility audit error:', err);
      setError(err.message);
      setView(VIEWS.ERROR);
      toast.error(err.message || 'Failed to process accessibility audit');
    }
  }, []);

  const handleNewAudit = useCallback(() => {
    setView(VIEWS.UPLOAD);
    setProgress(0);
    setStage('extracting');
    setMessage('');
    setFileName('');
    setAuditResults(null);
    setDomainInfo(null);
    setError(null);
  }, []);

  // Render based on current view
  switch (view) {
    case VIEWS.UPLOAD:
      return <AccessibilityUploadScreen onFileSelect={handleFileSelect} />;

    case VIEWS.PROCESSING:
      return (
        <AccessibilityProcessingScreen
          progress={progress}
          stage={stage}
          message={message}
          fileName={fileName}
        />
      );

    case VIEWS.DASHBOARD:
      return (
        <AccessibilityDashboard
          auditResults={auditResults}
          domainInfo={domainInfo}
          onNewAudit={handleNewAudit}
        />
      );

    case VIEWS.ERROR: {
      const guidance = getErrorGuidance(error || '');
      const ErrorIcon = guidance.icon;
      return (
        <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white dark:from-charcoal-900 dark:to-charcoal-800 flex items-center justify-center">
          <div className="max-w-lg mx-auto px-4">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/25">
                <ErrorIcon className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-charcoal-900 dark:text-white mb-3">{guidance.title}</h1>
              <p className="text-charcoal-600 dark:text-charcoal-400">{guidance.description}</p>
            </div>

            {/* Error Details */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800 dark:text-red-300 font-medium mb-1">Error Details:</p>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>

            {/* How to Fix */}
            <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-charcoal-200 dark:border-charcoal-700 p-6 mb-6">
              <h2 className="text-sm font-semibold text-charcoal-900 dark:text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                How to fix this:
              </h2>
              <ol className="space-y-3">
                {guidance.steps.map((step, idx) => (
                  <li key={step} className="flex items-start gap-3 text-sm text-charcoal-600 dark:text-charcoal-300">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={handleNewAudit}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
              <a
                href="https://www.screamingfrog.co.uk/seo-spider/user-guide/configuration/#accessibility"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary inline-flex items-center gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                View Documentation
              </a>
            </div>
          </div>
        </div>
      );
    }

    default:
      return <AccessibilityUploadScreen onFileSelect={handleFileSelect} />;
  }
}
