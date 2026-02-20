import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import MetaUploadScreen from './upload/MetaUploadScreen';
import MetaProcessingScreen from './upload/MetaProcessingScreen';
import MetaDashboard from './dashboard/MetaDashboard';
import { extractTextFromFile, generateMetadata, validateFile } from '../../lib/meta-generator/metaGeneratorService';

// View states
const VIEWS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  DASHBOARD: 'dashboard',
  ERROR: 'error'
};

export default function MetaGeneratorPage() {
  const [view, setView] = useState(VIEWS.UPLOAD);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [results, setResults] = useState(null);
  const [, setContext] = useState({});
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');

  /**
   * Handle file selection and processing
   */
  const handleFileSelect = useCallback(async (file, contextData = {}) => {
    setContext(contextData);
    setError(null);
    setFileName(file.name);

    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setView(VIEWS.PROCESSING);
      setStage('Reading document...');
      setProgress(10);

      // Extract text from file
      const extractedContent = await extractTextFromFile(file);
      setProgress(40);
      setStage('Analyzing content...');

      // Generate metadata with AI
      setStage('Generating SEO metadata...');
      setProgress(60);

      const metadata = await generateMetadata(extractedContent, contextData);
      setProgress(90);

      // Prepare results
      const finalResults = {
        metadata,
        extractedContent,
        context: contextData,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        timestamp: new Date().toISOString()
      };

      setProgress(100);
      setResults(finalResults);
      setView(VIEWS.DASHBOARD);
      toast.success('Metadata generated successfully!');

    } catch (err) {
      const userMessage = getUserFriendlyError(err);
      setError(userMessage);
      setView(VIEWS.ERROR);
      toast.error(userMessage);
    }
  }, []);

  /**
   * Map errors to user-friendly messages
   */
  const getUserFriendlyError = (err) => {
    const message = err.message || '';
    if (message.includes('validate') || message.includes('valid')) return message;
    if (message.includes('network') || message.includes('fetch') || message.includes('Failed to fetch'))
      return 'Network error: Please check your internet connection and try again.';
    if (message.includes('timeout') || message.includes('abort'))
      return 'The request timed out. Please try again with a smaller file.';
    if (message.includes('413') || message.includes('too large'))
      return 'The file is too large to process. Please try a smaller file.';
    if (message.includes('429') || message.includes('rate'))
      return 'Too many requests. Please wait a moment and try again.';
    if (message.includes('401') || message.includes('403'))
      return 'Authentication error. Please sign in again and retry.';
    if (message.includes('500') || message.includes('server'))
      return 'A server error occurred. Please try again later.';
    if (message.includes('parse') || message.includes('JSON') || message.includes('extract'))
      return 'Could not process the file content. Please ensure it contains readable text.';
    return message || 'An unexpected error occurred. Please try again.';
  };

  /**
   * Handle new processing
   */
  const handleNewProcess = useCallback(() => {
    setView(VIEWS.UPLOAD);
    setProgress(0);
    setStage('');
    setResults(null);
    setError(null);
    setFileName('');
  }, []);

  /**
   * Update metadata
   */
  const handleUpdateMetadata = useCallback((updates) => {
    setResults(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        ...updates
      }
    }));
  }, []);

  // Render based on view state
  switch (view) {
    case VIEWS.PROCESSING:
      return (
        <MetaProcessingScreen
          progress={progress}
          stage={stage}
          fileName={fileName}
        />
      );

    case VIEWS.DASHBOARD:
      return (
        <MetaDashboard
          results={results}
          onNewProcess={handleNewProcess}
          onUpdateMetadata={handleUpdateMetadata}
        />
      );

    case VIEWS.ERROR:
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-charcoal-900 mb-2">Processing Error</h2>
            <p className="text-charcoal-600 mb-6">{error}</p>
            <button
              onClick={handleNewProcess}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );

    case VIEWS.UPLOAD:
    default:
      return (
        <MetaUploadScreen
          onFileSelect={handleFileSelect}
        />
      );
  }
}
