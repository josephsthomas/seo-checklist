import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import JSZip from 'jszip';
import ImageAltUploadScreen from './upload/ImageAltUploadScreen';
import ImageAltProcessingScreen from './upload/ImageAltProcessingScreen';
import ImageAltDashboard from './dashboard/ImageAltDashboard';
import { processImageBatch, validateImageFile } from '../../lib/image-alt/imageAltService';

// View states
const VIEWS = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  DASHBOARD: 'dashboard',
  ERROR: 'error'
};

export default function ImageAltGeneratorPage() {
  const [view, setView] = useState(VIEWS.UPLOAD);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('');
  const [results, setResults] = useState(null);
  const [context, setContext] = useState({});
  const [error, setError] = useState(null);
  const [fileCount, setFileCount] = useState(0);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback(async (files, contextData = {}) => {
    setContext(contextData);
    setError(null);

    try {
      let imageFiles = [];

      // Check if it's a ZIP file
      if (files.length === 1 && files[0].name.endsWith('.zip')) {
        setView(VIEWS.PROCESSING);
        setStage('Extracting ZIP file...');
        setProgress(10);

        const zip = new JSZip();
        const zipContent = await zip.loadAsync(files[0]);

        // Extract images from ZIP
        const imagePromises = [];
        zipContent.forEach((relativePath, zipEntry) => {
          if (!zipEntry.dir && /\.(jpg|jpeg|png|gif|webp|tiff|bmp)$/i.test(relativePath)) {
            imagePromises.push(
              zipEntry.async('blob').then(blob => {
                const filename = relativePath.split('/').pop();
                return new File([blob], filename, { type: getMimeType(filename) });
              })
            );
          }
        });

        imageFiles = await Promise.all(imagePromises);

        if (imageFiles.length === 0) {
          throw new Error('No valid image files found in ZIP');
        }

        if (imageFiles.length > 100) {
          throw new Error(`Too many images (${imageFiles.length}). Maximum is 100 per batch.`);
        }
      } else {
        // Individual image files
        for (const file of files) {
          const validation = validateImageFile(file);
          if (!validation.valid) {
            toast.error(`${file.name}: ${validation.error}`);
            continue;
          }
          imageFiles.push(file);
        }

        if (imageFiles.length === 0) {
          throw new Error('No valid image files selected');
        }

        if (imageFiles.length > 100) {
          throw new Error(`Too many images (${imageFiles.length}). Maximum is 100 per batch.`);
        }

        setView(VIEWS.PROCESSING);
      }

      setFileCount(imageFiles.length);
      setStage(`Processing ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}...`);
      setProgress(20);

      // Process images with Claude Vision
      const processedResults = await processImageBatch(
        imageFiles,
        contextData,
        (pct) => setProgress(20 + Math.round(pct * 0.7))
      );

      setProgress(95);
      setStage('Preparing results...');

      // Prepare final results
      const finalResults = {
        images: processedResults,
        summary: {
          total: processedResults.length,
          success: processedResults.filter(r => !r.error).length,
          decorative: processedResults.filter(r => r.is_decorative).length,
          avgLength: Math.round(
            processedResults.reduce((sum, r) => sum + (r.alt_text?.length || 0), 0) /
            processedResults.length
          ),
          overLimit: processedResults.filter(r => (r.alt_text?.length || 0) > 125).length
        },
        context: contextData,
        timestamp: new Date().toISOString()
      };

      setProgress(100);
      setResults(finalResults);
      setView(VIEWS.DASHBOARD);
      toast.success(`Processed ${processedResults.length} images!`);

    } catch (err) {
      console.error('Processing error:', err);
      setError(err.message);
      setView(VIEWS.ERROR);
      toast.error(err.message);
    }
  }, []);

  /**
   * Get MIME type from filename
   */
  const getMimeType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      tiff: 'image/tiff',
      bmp: 'image/bmp'
    };
    return mimeTypes[ext] || 'image/jpeg';
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
    setFileCount(0);
  }, []);

  /**
   * Update a single result
   */
  const handleUpdateResult = useCallback((id, updates) => {
    setResults(prev => ({
      ...prev,
      images: prev.images.map(img =>
        img.id === id ? { ...img, ...updates } : img
      )
    }));
  }, []);

  // Render based on view state
  switch (view) {
    case VIEWS.PROCESSING:
      return (
        <ImageAltProcessingScreen
          progress={progress}
          stage={stage}
          fileCount={fileCount}
        />
      );

    case VIEWS.DASHBOARD:
      return (
        <ImageAltDashboard
          results={results}
          onNewProcess={handleNewProcess}
          onUpdateResult={handleUpdateResult}
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
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );

    case VIEWS.UPLOAD:
    default:
      return (
        <ImageAltUploadScreen
          onFileSelect={handleFileSelect}
        />
      );
  }
}
