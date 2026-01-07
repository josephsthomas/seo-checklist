import { useState, useCallback } from 'react';
import { AlertTriangle, RotateCcw, HelpCircle, FileWarning, FileX, Database, Lightbulb } from 'lucide-react';
import AuditUploadScreen from './upload/AuditUploadScreen';
import ProcessingScreen from './upload/ProcessingScreen';
import AuditDashboard from './dashboard/AuditDashboard';
import { processZipFile } from '../../lib/audit/zipProcessor';
import { parseInternalAll, extractDomainInfo } from '../../lib/audit/excelParser';
import { runAudit } from '../../lib/audit/auditEngine';
import toast from 'react-hot-toast';

// Error guidance mapping
const ERROR_GUIDANCE = {
  'internal_all.xlsx not found': {
    title: 'Missing Required File',
    icon: FileX,
    description: 'The internal_all.xlsx file is required but was not found in your export.',
    steps: [
      'Open Screaming Frog SEO Spider',
      'Go to File → Export → Multi Export',
      'Make sure "Internal" is checked in the export options',
      'Select Excel (.xlsx) format and export again'
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
      'Focus on the essential tabs (Internal, Page Titles, Meta Description)',
      'For very large sites, consider crawling a specific section'
    ]
  },
  'default': {
    title: 'Processing Error',
    icon: AlertTriangle,
    description: 'An error occurred while processing your audit file.',
    steps: [
      'Verify your export is from Screaming Frog Multi Export',
      'Ensure the export completed successfully without errors',
      'Try exporting again with Excel format selected',
      'If the problem persists, check the Screaming Frog documentation'
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

export default function AuditPage() {
  const [view, setView] = useState(VIEWS.UPLOAD);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('extracting');
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [auditResults, setAuditResults] = useState(null);
  const [domainInfo, setDomainInfo] = useState(null);
  const [urlData, setUrlData] = useState([]);
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
        setProgress(Math.round(p * 0.3)); // 0-30%
        setMessage(msg);
      });

      if (!extractResult.success) {
        throw new Error(extractResult.error);
      }

      // Stage 2: Parse Excel files
      setStage('parsing');
      setProgress(30);
      setMessage('Parsing Excel files...');

      // Check for internal_all.xlsx
      const internalFile = extractResult.files['internal_all.xlsx'];
      if (!internalFile) {
        throw new Error('Required file internal_all.xlsx not found in export.');
      }

      // Parse the main internal file
      const internalData = parseInternalAll(internalFile.data);
      if (!internalData.success) {
        throw new Error(internalData.error);
      }

      setProgress(50);
      setMessage(`Parsed ${internalData.rowCount.toLocaleString()} URLs...`);

      // Extract domain info
      const domain = extractDomainInfo(internalData.rows);
      setDomainInfo(domain);

      // Store URL data for page-level analysis
      setUrlData(internalData.rows);

      // Parse other files for additional data
      setProgress(60);
      setMessage('Parsing additional export files...');

      const parsedData = {
        internal: internalData,
        metadata: extractResult.metadata
      };

      // Stage 3: Run audit
      setStage('analyzing');
      setProgress(70);
      setMessage('Running audit checks...');

      const results = await runAudit(parsedData, (p, msg) => {
        setProgress(70 + Math.round(p * 0.25)); // 70-95%
        setMessage(msg);
      });

      if (!results.success) {
        throw new Error(results.error);
      }

      // Complete
      setStage('complete');
      setProgress(100);
      setMessage('Audit complete!');

      // Brief pause to show completion
      await new Promise(resolve => setTimeout(resolve, 500));

      setAuditResults(results);
      setView(VIEWS.DASHBOARD);

      toast.success(`Audit complete! Found ${results.stats.errors} errors and ${results.stats.warnings} warnings.`);

    } catch (err) {
      console.error('Audit processing error:', err);
      setError(err.message);
      setView(VIEWS.ERROR);
      toast.error(err.message || 'Failed to process audit');
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
    setUrlData([]);
    setError(null);
  }, []);

  // Render based on current view
  switch (view) {
    case VIEWS.UPLOAD:
      return <AuditUploadScreen onFileSelect={handleFileSelect} />;

    case VIEWS.PROCESSING:
      return (
        <ProcessingScreen
          progress={progress}
          stage={stage}
          message={message}
          fileName={fileName}
        />
      );

    case VIEWS.DASHBOARD:
      return (
        <AuditDashboard
          auditResults={auditResults}
          domainInfo={domainInfo}
          urlData={urlData}
          onNewAudit={handleNewAudit}
        />
      );

    case VIEWS.ERROR: {
      const guidance = getErrorGuidance(error || '');
      const ErrorIcon = guidance.icon;
      return (
        <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white flex items-center justify-center">
          <div className="max-w-lg mx-auto px-4">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/25">
                <ErrorIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-charcoal-900 mb-3">{guidance.title}</h2>
              <p className="text-charcoal-600">{guidance.description}</p>
            </div>

            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-red-800 font-medium mb-1">Error Details:</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>

            {/* How to Fix */}
            <div className="bg-white rounded-xl border border-charcoal-200 p-6 mb-6">
              <h3 className="text-sm font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                How to fix this:
              </h3>
              <ol className="space-y-3">
                {guidance.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-charcoal-600">
                    <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
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
                href="https://www.screamingfrog.co.uk/seo-spider/user-guide/general/#multi-export"
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
      return <AuditUploadScreen onFileSelect={handleFileSelect} />;
  }
}
