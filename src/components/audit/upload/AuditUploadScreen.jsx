import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileArchive,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Sparkles,
  BarChart3,
  Zap,
  FileText
} from 'lucide-react';
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

  const features = [
    { label: '31 Audit Categories', icon: BarChart3, color: 'from-primary-500 to-primary-600' },
    { label: 'Core Web Vitals', icon: Zap, color: 'from-amber-500 to-amber-600' },
    { label: 'AI Recommendations', icon: Sparkles, color: 'from-purple-500 to-purple-600' },
    { label: 'PDF & Excel Export', icon: FileText, color: 'from-emerald-500 to-emerald-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-cyan-500/25">
              <FileArchive className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal-900 mb-4">
              Technical <span className="text-gradient">Audit Tool</span>
            </h1>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              Upload your Screaming Frog export to generate a comprehensive technical SEO audit
              with AI-powered recommendations.
            </p>
          </div>

          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={`relative card overflow-hidden cursor-pointer transition-all duration-300 group
              ${isDragActive && !isDragReject ? 'ring-2 ring-cyan-500 ring-offset-2 shadow-lg shadow-cyan-500/20' : ''}
              ${isDragReject ? 'ring-2 ring-red-500 ring-offset-2 shadow-lg shadow-red-500/20' : ''}
              ${validationResult?.valid ? 'ring-2 ring-emerald-500 ring-offset-2 shadow-lg shadow-emerald-500/20' : ''}
              ${validationResult && !validationResult.valid ? 'ring-2 ring-red-500 ring-offset-2 shadow-lg shadow-red-500/20' : ''}
              ${!isDragActive && !validationResult ? 'hover:shadow-lg hover:-translate-y-0.5' : ''}
            `}
          >
            {/* Border gradient effect */}
            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300
              ${isDragActive ? 'from-cyan-500/10 to-cyan-600/10 opacity-100' : 'from-charcoal-100/50 to-charcoal-200/50 opacity-0 group-hover:opacity-100'}
              ${validationResult?.valid ? 'from-emerald-500/10 to-emerald-600/10 opacity-100' : ''}
              ${validationResult && !validationResult.valid ? 'from-red-500/10 to-red-600/10 opacity-100' : ''}
            `} />

            <div className="relative p-12 text-center">
              <input {...getInputProps()} />

              {!selectedFile && (
                <>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300
                    ${isDragActive
                      ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30 scale-110'
                      : 'bg-charcoal-100 group-hover:bg-gradient-to-br group-hover:from-cyan-500 group-hover:to-cyan-600 group-hover:shadow-lg group-hover:shadow-cyan-500/30'
                    }
                  `}>
                    <Upload className={`w-8 h-8 transition-colors duration-300
                      ${isDragActive ? 'text-white' : 'text-charcoal-400 group-hover:text-white'}
                    `} />
                  </div>
                  <h3 className="text-xl font-bold text-charcoal-900 mb-2">
                    {isDragActive ? 'Drop your file here' : 'Upload Screaming Frog Export'}
                  </h3>
                  <p className="text-charcoal-600 mb-4">
                    Drag and drop your ZIP file, or click to browse
                  </p>
                  <p className="text-sm text-charcoal-400">
                    Supports ZIP files up to 500MB from Screaming Frog Multi Export (Excel format)
                  </p>
                </>
              )}

              {selectedFile && validationResult?.valid && (
                <div className="text-emerald-600">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">File Ready</h3>
                  <p className="text-charcoal-700 font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-charcoal-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              )}

              {selectedFile && !validationResult?.valid && (
                <div className="text-red-600">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/30">
                    <AlertCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Invalid File</h3>
                  <p className="text-charcoal-700 mb-4">{selectedFile.name}</p>
                  {validationResult?.errors.map((error, idx) => (
                    <p key={idx} className="text-sm text-red-600">{error}</p>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Warnings */}
          {validationResult?.warnings?.length > 0 && (
            <div className="mt-4 card p-4 bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  {validationResult.warnings.map((warning, idx) => (
                    <p key={idx} className="text-sm text-amber-700">{warning}</p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features & Help Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Supported Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="card p-5 text-center group hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-105 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-charcoal-700">{feature.label}</span>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="card p-6 bg-gradient-to-br from-charcoal-50 to-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-charcoal-700 to-charcoal-800 flex items-center justify-center flex-shrink-0 shadow-lg">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-charcoal-900 mb-3">How to export from Screaming Frog</h4>
              <ol className="text-sm text-charcoal-600 space-y-2">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>Open Screaming Frog SEO Spider and complete your crawl</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>Go to <strong className="text-charcoal-900">File → Export → Multi Export</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>Select <strong className="text-charcoal-900">Excel (.xlsx)</strong> as the export format</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                  <span>Choose your desired tabs (Internal is required)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                  <span>Click <strong className="text-charcoal-900">Export</strong> and select a location</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">6</span>
                  <span>Upload the resulting ZIP file here</span>
                </li>
              </ol>
              <a
                href="https://www.screamingfrog.co.uk/seo-spider/user-guide/general/#multi-export"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 text-sm font-medium mt-4 group"
              >
                View Screaming Frog documentation
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
