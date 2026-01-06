import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileArchive,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Eye,
  Shield,
  FileText,
  CheckCircle2,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  Accessibility
} from 'lucide-react';
import { validateFile } from '../../../lib/audit/zipProcessor';

export default function AccessibilityUploadScreen({ onFileSelect }) {
  const [validationResult, setValidationResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [checklist, setChecklist] = useState({
    screamingFrogInstalled: false,
    accessibilityEnabled: false,
    crawlCompleted: false,
    excelFormat: false
  });

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const validation = validateFile(file);

    setSelectedFile(file);
    setValidationResult(validation);

    if (validation.valid) {
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
    { label: 'WCAG 2.2 Analysis', icon: Shield, color: 'from-purple-500 to-purple-600' },
    { label: '93 Axe-core Rules', icon: Eye, color: 'from-indigo-500 to-indigo-600' },
    { label: 'Compliance Scoring', icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Fix Suggestions', icon: FileText, color: 'from-amber-500 to-amber-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-50" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/25">
              <Accessibility className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-charcoal-900 mb-4">
              Accessibility <span className="text-gradient-purple">Analyzer</span>
            </h1>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto">
              Upload your Screaming Frog export to generate a comprehensive WCAG 2.2 compliance
              audit with AI-powered remediation suggestions.
            </p>
          </div>

          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={`relative card overflow-hidden cursor-pointer transition-all duration-300 group
              ${isDragActive && !isDragReject ? 'ring-2 ring-purple-500 ring-offset-2 shadow-lg shadow-purple-500/20' : ''}
              ${isDragReject ? 'ring-2 ring-red-500 ring-offset-2 shadow-lg shadow-red-500/20' : ''}
              ${validationResult?.valid ? 'ring-2 ring-emerald-500 ring-offset-2 shadow-lg shadow-emerald-500/20' : ''}
              ${validationResult && !validationResult.valid ? 'ring-2 ring-red-500 ring-offset-2 shadow-lg shadow-red-500/20' : ''}
              ${!isDragActive && !validationResult ? 'hover:shadow-lg hover:-translate-y-0.5' : ''}
            `}
          >
            {/* Border gradient effect */}
            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300
              ${isDragActive ? 'from-purple-500/10 to-indigo-600/10 opacity-100' : 'from-charcoal-100/50 to-charcoal-200/50 opacity-0 group-hover:opacity-100'}
              ${validationResult?.valid ? 'from-emerald-500/10 to-emerald-600/10 opacity-100' : ''}
              ${validationResult && !validationResult.valid ? 'from-red-500/10 to-red-600/10 opacity-100' : ''}
            `} />

            <div className="relative p-12 text-center">
              <input {...getInputProps()} />

              {!selectedFile && (
                <>
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300
                    ${isDragActive
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30 scale-110'
                      : 'bg-charcoal-100 group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-indigo-600 group-hover:shadow-lg group-hover:shadow-purple-500/30'
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
                    Requires accessibility auditing enabled in Screaming Frog
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

        {/* WCAG Level Info */}
        <div className="card p-6 mb-6 bg-gradient-to-br from-purple-50/50 to-white border-purple-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-charcoal-900 mb-2">WCAG 2.2 Compliance Levels</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="font-bold text-emerald-700 mb-1">Level A</div>
                  <p className="text-xs text-emerald-600">31 criteria - Minimum accessibility requirements</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="font-bold text-amber-700 mb-1">Level AA</div>
                  <p className="text-xs text-amber-600">25 criteria - Standard compliance (recommended)</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="font-bold text-purple-700 mb-1">Level AAA</div>
                  <p className="text-xs text-purple-600">31 criteria - Enhanced accessibility</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pre-flight Checklist */}
        <div className="card p-6 mb-6 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-charcoal-900">Pre-flight Checklist</h4>
              <p className="text-sm text-charcoal-500">Confirm these items before uploading</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { key: 'screamingFrogInstalled', label: 'Screaming Frog SEO Spider installed', hint: 'Accessibility auditing requires a license' },
              { key: 'accessibilityEnabled', label: 'Accessibility auditing enabled', hint: 'Configuration → Accessibility → Enable' },
              { key: 'crawlCompleted', label: 'Website crawl completed', hint: 'Wait for the crawl to finish before exporting' },
              { key: 'excelFormat', label: 'Export set to Excel (.xlsx) format', hint: 'Include Accessibility tabs in export' }
            ].map((item) => (
              <label
                key={item.key}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  checklist[item.key]
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-charcoal-50 border border-transparent hover:bg-charcoal-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist[item.key]}
                  onChange={(e) => setChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  checklist[item.key]
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white border-2 border-charcoal-300'
                }`}>
                  {checklist[item.key] && <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-medium ${checklist[item.key] ? 'text-emerald-800' : 'text-charcoal-700'}`}>
                    {item.label}
                  </span>
                  <p className="text-xs text-charcoal-500 mt-0.5">{item.hint}</p>
                </div>
              </label>
            ))}
          </div>

          {Object.values(checklist).every(Boolean) && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-100 border border-emerald-200">
              <p className="text-sm text-emerald-800 font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                You're ready to upload! Drag and drop your ZIP file above.
              </p>
            </div>
          )}
        </div>

        {/* Tutorial Section */}
        <div className="card p-6 mb-6">
          <button
            onClick={() => setShowTutorial(!showTutorial)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                <PlayCircle className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-charcoal-900">Getting Started Tutorial</h4>
                <p className="text-sm text-charcoal-500">Learn how to use the Accessibility Analyzer</p>
              </div>
            </div>
            {showTutorial ? (
              <ChevronUp className="w-5 h-5 text-charcoal-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-charcoal-400" />
            )}
          </button>

          {showTutorial && (
            <div className="mt-6 space-y-6">
              {/* What is this tool */}
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-purple-900 mb-1">What does this tool analyze?</h5>
                    <p className="text-sm text-purple-800">
                      The Accessibility Analyzer processes Axe-core accessibility test results from Screaming Frog
                      and maps them to WCAG 2.2 success criteria. You'll get compliance scores, violation details,
                      and AI-powered remediation suggestions for each issue.
                    </p>
                  </div>
                </div>
              </div>

              {/* What you'll get */}
              <div>
                <h5 className="font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-charcoal-100 flex items-center justify-center text-xs font-bold text-charcoal-600">1</span>
                  What you'll get from the audit
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-8">
                  {[
                    { title: 'Compliance Score', desc: 'Overall WCAG compliance percentage' },
                    { title: 'Level Breakdown', desc: 'Scores for A, AA, and AAA' },
                    { title: 'POUR Analysis', desc: 'By principle (Perceivable, etc.)' },
                    { title: 'Impact Ranking', desc: 'Critical, serious, moderate, minor' },
                    { title: 'Page Analysis', desc: 'Violations by URL' },
                    { title: 'Fix Suggestions', desc: 'AI-powered remediation' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-charcoal-800">{item.title}</span>
                        <span className="text-charcoal-500"> - {item.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Tips */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-amber-900 mb-2">Pro Tips</h5>
                    <ul className="space-y-1 text-sm text-amber-800">
                      <li>• Level AA compliance is the standard for most websites and legal requirements</li>
                      <li>• Focus on critical and serious issues first for maximum impact</li>
                      <li>• Some criteria require manual testing (marked in the WCAG reference)</li>
                      <li>• Export the VPAT report to document your compliance efforts</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="card p-6 bg-gradient-to-br from-charcoal-50 to-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-charcoal-700 to-charcoal-800 flex items-center justify-center flex-shrink-0 shadow-lg">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-charcoal-900 mb-3">Enabling Accessibility in Screaming Frog</h4>
              <ol className="text-sm text-charcoal-600 space-y-2">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  <span>Open Screaming Frog SEO Spider (requires license)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  <span>Go to <strong className="text-charcoal-900">Configuration → Accessibility</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  <span>Check <strong className="text-charcoal-900">"Enable Accessibility"</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                  <span>Select rules: <strong className="text-charcoal-900">All Rules</strong> recommended for comprehensive audit</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">5</span>
                  <span>Run your crawl and wait for completion</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold flex-shrink-0">6</span>
                  <span><strong className="text-charcoal-900">File → Export → Multi Export</strong> with Accessibility tabs selected</span>
                </li>
              </ol>
              <a
                href="https://www.screamingfrog.co.uk/seo-spider/user-guide/configuration/#accessibility"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-medium mt-4 group"
              >
                View Screaming Frog accessibility documentation
                <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
