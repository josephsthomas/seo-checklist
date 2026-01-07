import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Tags,
  FileText,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  Share2,
  Code,
  X
} from 'lucide-react';
import AIDisclaimer from '../../shared/AIDisclaimer';

const SUPPORTED_FORMATS = ['DOCX', 'PDF', 'HTML', 'Markdown', 'TXT'];
const TONE_OPTIONS = ['Professional', 'Conversational', 'Technical', 'Creative', 'Persuasive'];

export default function MetaUploadScreen({ onFileSelect }) {
  const [file, setFile] = useState(null);
  const [showContext, setShowContext] = useState(false);
  const [context, setContext] = useState({
    targetUrl: '',
    brandName: '',
    industry: '',
    primaryKeyword: '',
    secondaryKeywords: '',
    tone: 'Professional'
  });

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/pdf': ['.pdf'],
      'text/html': ['.html', '.htm'],
      'text/markdown': ['.md', '.markdown'],
      'text/plain': ['.txt']
    },
    maxSize: 25 * 1024 * 1024, // 25MB
    multiple: false
  });

  const handleProcess = () => {
    if (!file) return;
    onFileSelect(file, context);
  };

  const removeFile = () => {
    setFile(null);
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      docx: '📄',
      pdf: '📕',
      html: '🌐',
      htm: '🌐',
      md: '📝',
      markdown: '📝',
      txt: '📃'
    };
    return icons[ext] || '📄';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-4 shadow-lg">
            <Tags className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Meta Data Generator</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Upload a document to generate AI-powered SEO metadata including titles, descriptions, and social tags
          </p>
        </div>

        {/* AI Disclaimer */}
        <div className="mb-6">
          <AIDisclaimer
            toolName="Meta Data Generator"
            storageKey="ai-disclaimer-meta-dismissed"
          />
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${isDragActive
              ? 'border-amber-400 bg-amber-500/10'
              : 'border-slate-600 hover:border-amber-400 hover:bg-slate-800/50'
            }
          `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center">
            <div className={`
              w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-colors
              ${isDragActive ? 'bg-amber-500/20' : 'bg-slate-700/50'}
            `}>
              {isDragActive ? (
                <Upload className="w-10 h-10 text-amber-400 animate-bounce" />
              ) : (
                <FileText className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <p className="text-lg font-medium text-white mb-2">
              {isDragActive ? 'Drop file here' : 'Drag & drop a document'}
            </p>
            <p className="text-slate-400 text-sm mb-4">
              or click to browse
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {SUPPORTED_FORMATS.map(fmt => (
                <span key={fmt} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                  {fmt}
                </span>
              ))}
            </div>

            <p className="text-slate-500 text-xs">
              Maximum file size: 25MB
            </p>
          </div>
        </div>

        {/* Selected File */}
        {file && (
          <div className="mt-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getFileIcon(file.name)}</span>
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-slate-400 text-sm">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        )}

        {/* Context Panel */}
        <div className="mt-6">
          <button
            onClick={() => setShowContext(!showContext)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>SEO Context (Optional)</span>
            {showContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showContext && (
            <div className="mt-4 bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Target URL</label>
                <input
                  type="url"
                  value={context.targetUrl}
                  onChange={(e) => setContext(prev => ({ ...prev, targetUrl: e.target.value }))}
                  placeholder="https://example.com/page"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={context.brandName}
                    onChange={(e) => setContext(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder="e.g., Acme Corp"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Industry</label>
                  <input
                    type="text"
                    value={context.industry}
                    onChange={(e) => setContext(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., Technology"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Primary Keyword</label>
                  <input
                    type="text"
                    value={context.primaryKeyword}
                    onChange={(e) => setContext(prev => ({ ...prev, primaryKeyword: e.target.value }))}
                    placeholder="e.g., cloud computing"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Secondary Keywords</label>
                  <input
                    type="text"
                    value={context.secondaryKeywords}
                    onChange={(e) => setContext(prev => ({ ...prev, secondaryKeywords: e.target.value }))}
                    placeholder="e.g., SaaS, enterprise"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Tone</label>
                <select
                  value={context.tone}
                  onChange={(e) => setContext(prev => ({ ...prev, tone: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-amber-500"
                >
                  {TONE_OPTIONS.map(tone => (
                    <option key={tone} value={tone}>{tone}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Process Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleProcess}
            disabled={!file}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-xl font-medium text-lg transition-all
              ${file
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-amber-500/25'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            <Sparkles className="w-5 h-5" />
            Generate Metadata
          </button>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Sparkles, title: 'AI-Powered', desc: 'Claude analysis' },
            { icon: Search, title: 'SEO Optimized', desc: 'Title & description' },
            { icon: Share2, title: 'Social Ready', desc: 'OG & Twitter tags' },
            { icon: Code, title: 'HTML Export', desc: 'Copy-paste code' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-700/50">
              <feature.icon className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <h4 className="text-white font-medium text-sm">{feature.title}</h4>
              <p className="text-slate-500 text-xs">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
