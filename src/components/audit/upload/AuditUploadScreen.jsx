import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileArchive, AlertCircle, CheckCircle, HelpCircle, ExternalLink } from 'lucide-react';
import { validateFile } from '../../../lib/audit/zipProcessor';

export default function AuditUploadScreen({ onFileSelect }) {
  const [validationResult, setValidationResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const validation = validateFile(file);

    setSelectedFile(file);
    setValidationResult(validation);

    if (validation.valid) {
      // Small delay for visual feedback
      setTimeout(() => {
        onFileSelect(file);
      }, 500);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    maxFiles: 1,
    multiple: false
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileArchive className="w-8 h-8 text-cyan-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Technical Audit Tool</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Upload your Screaming Frog export to generate a comprehensive technical SEO audit
          with actionable recommendations.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive && !isDragReject ? 'border-cyan-500 bg-cyan-50' : ''}
          ${isDragReject ? 'border-red-500 bg-red-50' : ''}
          ${!isDragActive ? 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50' : ''}
          ${validationResult?.valid ? 'border-green-500 bg-green-50' : ''}
          ${validationResult && !validationResult.valid ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        {!selectedFile && (
          <>
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-cyan-600' : 'text-gray-400'}`} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop your file here' : 'Upload Screaming Frog Export'}
            </h3>
            <p className="text-gray-500 mb-4">
              Drag and drop your ZIP file, or click to browse
            </p>
            <p className="text-sm text-gray-400">
              Supports ZIP files up to 500MB from Screaming Frog Multi Export (Excel format)
            </p>
          </>
        )}

        {selectedFile && validationResult?.valid && (
          <div className="text-green-600">
            <CheckCircle className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">File Ready</h3>
            <p className="text-gray-600">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
          </div>
        )}

        {selectedFile && !validationResult?.valid && (
          <div className="text-red-600">
            <AlertCircle className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Invalid File</h3>
            <p className="text-gray-600 mb-4">{selectedFile.name}</p>
            {validationResult?.errors.map((error, idx) => (
              <p key={idx} className="text-sm text-red-600">{error}</p>
            ))}
          </div>
        )}
      </div>

      {/* Warnings */}
      {validationResult?.warnings?.length > 0 && (
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              {validationResult.warnings.map((warning, idx) => (
                <p key={idx} className="text-sm text-amber-700">{warning}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 mb-2">How to export from Screaming Frog</h4>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Open Screaming Frog SEO Spider and complete your crawl</li>
              <li>Go to <strong>File → Export → Multi Export</strong></li>
              <li>Select <strong>Excel (.xlsx)</strong> as the export format</li>
              <li>Choose your desired tabs (Internal is required)</li>
              <li>Click <strong>Export</strong> and select a location</li>
              <li>Upload the resulting ZIP file here</li>
            </ol>
            <a
              href="https://www.screamingfrog.co.uk/seo-spider/user-guide/general/#multi-export"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-700 text-sm mt-3"
            >
              View Screaming Frog documentation
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Supported Features */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '31 Audit Categories', icon: '📊' },
          { label: 'Core Web Vitals', icon: '⚡' },
          { label: 'AI Recommendations', icon: '🤖' },
          { label: 'PDF & Excel Export', icon: '📄' }
        ].map((feature, idx) => (
          <div key={idx} className="text-center p-4 bg-white rounded-lg border">
            <span className="text-2xl mb-2 block">{feature.icon}</span>
            <span className="text-sm text-gray-600">{feature.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
