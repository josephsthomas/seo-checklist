import React, { useState, useCallback } from 'react';
import { AlertTriangle, ArrowLeft, RotateCcw } from 'lucide-react';
import AuditUploadScreen from './upload/AuditUploadScreen';
import ProcessingScreen from './upload/ProcessingScreen';
import AuditDashboard from './dashboard/AuditDashboard';
import { processZipFile } from '../../lib/audit/zipProcessor';
import { parseInternalAll, extractDomainInfo, parseAllFiles } from '../../lib/audit/excelParser';
import { runAudit } from '../../lib/audit/auditEngine';
import toast from 'react-hot-toast';

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

    case VIEWS.ERROR:
      return (
        <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white flex items-center justify-center">
          <div className="max-w-md mx-auto px-4 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/25">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-charcoal-900 mb-3">Processing Error</h2>
            <p className="text-charcoal-600 mb-8">{error}</p>
            <button
              onClick={handleNewAudit}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );

    default:
      return <AuditUploadScreen onFileSelect={handleFileSelect} />;
  }
}
