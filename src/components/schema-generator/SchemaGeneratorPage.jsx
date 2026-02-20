import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import SchemaUploadScreen from './upload/SchemaUploadScreen';
import SchemaProcessingScreen from './upload/SchemaProcessingScreen';
import SchemaDashboard from './dashboard/SchemaDashboard';
import { extractHtmlContent, generateSchema } from '../../lib/schema-generator/schemaGeneratorService';

// View states
const VIEWS = {
  INPUT: 'input',
  PROCESSING: 'processing',
  DASHBOARD: 'dashboard',
  ERROR: 'error'
};

export default function SchemaGeneratorPage() {
  const [view, setView] = useState(VIEWS.INPUT);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [inputType, setInputType] = useState(''); // 'html', 'url', 'file'

  /**
   * Handle HTML content submission
   */
  const handleSubmit = useCallback(async (content, options = {}) => {
    setError(null);
    setInputType(options.inputType || 'html');

    try {
      setView(VIEWS.PROCESSING);
      setStage('Parsing HTML content...');
      setProgress(20);

      // Extract content from HTML
      const extractedContent = extractHtmlContent(content);
      setProgress(40);
      setStage('Analyzing page structure...');

      // Generate schema with AI
      setStage('Generating structured data...');
      setProgress(60);

      const schemaResults = await generateSchema(extractedContent, options);
      setProgress(90);

      // Prepare final results
      const finalResults = {
        schemas: schemaResults.schemas,
        summary: schemaResults.summary,
        warnings: schemaResults.warnings,
        extractedContent,
        options,
        confidence: schemaResults.confidence,
        generated: schemaResults.generated,
        timestamp: new Date().toISOString()
      };

      setProgress(100);
      setResults(finalResults);
      setView(VIEWS.DASHBOARD);
      toast.success(`Generated ${schemaResults.schemas.length} schema(s)!`);

    } catch (err) {
      setError(err.message);
      setView(VIEWS.ERROR);
      toast.error(err.message);
    }
  }, []);

  /**
   * Handle new processing
   */
  const handleNewProcess = useCallback(() => {
    setView(VIEWS.INPUT);
    setProgress(0);
    setStage('');
    setResults(null);
    setError(null);
    setInputType('');
  }, []);

  /**
   * Update a schema
   */
  const handleUpdateSchema = useCallback((index, updates) => {
    setResults(prev => ({
      ...prev,
      schemas: prev.schemas.map((schema, i) =>
        i === index ? { ...schema, ...updates } : schema
      )
    }));
  }, []);

  // Render based on view state
  switch (view) {
    case VIEWS.PROCESSING:
      return (
        <SchemaProcessingScreen
          progress={progress}
          stage={stage}
          inputType={inputType}
        />
      );

    case VIEWS.DASHBOARD:
      return (
        <SchemaDashboard
          results={results}
          onNewProcess={handleNewProcess}
          onUpdateSchema={handleUpdateSchema}
        />
      );

    case VIEWS.ERROR:
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-white dark:from-charcoal-900 dark:via-charcoal-800 dark:to-charcoal-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-charcoal-800 rounded-xl shadow-xl dark:shadow-charcoal-900/50 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-charcoal-900 dark:text-white mb-2">Processing Error</h2>
            <p className="text-charcoal-600 dark:text-charcoal-400 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleNewProcess}
                className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
              >
                Try Again
              </button>
              <Link
                to="/app"
                className="px-6 py-2 border border-charcoal-300 dark:border-charcoal-600 text-charcoal-700 dark:text-charcoal-300 rounded-lg hover:bg-charcoal-50 dark:hover:bg-charcoal-700 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );

    case VIEWS.INPUT:
    default:
      return (
        <SchemaUploadScreen
          onSubmit={handleSubmit}
        />
      );
  }
}
