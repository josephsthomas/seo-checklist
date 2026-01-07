import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Image,
  Folder,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileImage,
  Download,
  CheckCircle,
  X
} from 'lucide-react';
import AIDisclaimer from '../../shared/AIDisclaimer';

const SUPPORTED_FORMATS = ['JPG', 'PNG', 'WebP', 'GIF', 'TIFF', 'BMP'];
const TONE_OPTIONS = ['Professional', 'Casual', 'Technical', 'Creative'];

export default function ImageAltUploadScreen({ onFileSelect }) {
  const [files, setFiles] = useState([]);
  const [showContext, setShowContext] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [_showConfig, _setShowConfig] = useState(false);
  const [context, setContext] = useState({
    brandName: '',
    industry: '',
    keywords: '',
    guidelines: '',
    tone: 'Professional',
    charLimit: 125
  });

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.bmp'],
      'application/zip': ['.zip']
    },
    maxSize: 500 * 1024 * 1024 // 500MB for ZIP
  });

  const handleProcess = () => {
    if (files.length === 0) return;
    onFileSelect(files, context);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const isZip = files.length === 1 && files[0].name.toLowerCase().endsWith('.zip');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <Image className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Image Alt Text Generator</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Upload images to generate AI-powered, WCAG-compliant alt text with SEO-friendly filenames
          </p>
        </div>

        {/* AI Disclaimer */}
        <div className="mb-6">
          <AIDisclaimer
            toolName="Image Alt Text Generator"
            storageKey="ai-disclaimer-alt-dismissed"
          />
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${isDragActive
              ? 'border-emerald-400 bg-emerald-500/10'
              : 'border-slate-600 hover:border-emerald-400 hover:bg-slate-800/50'
            }
          `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center">
            <div className={`
              w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-colors
              ${isDragActive ? 'bg-emerald-500/20' : 'bg-slate-700/50'}
            `}>
              {isDragActive ? (
                <Upload className="w-10 h-10 text-emerald-400 animate-bounce" />
              ) : (
                <FileImage className="w-10 h-10 text-slate-400" />
              )}
            </div>

            <p className="text-lg font-medium text-white mb-2">
              {isDragActive ? 'Drop files here' : 'Drag & drop images or ZIP file'}
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
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                ZIP
              </span>
            </div>

            <p className="text-slate-500 text-xs">
              Max 100 images per batch | 10MB per image | 500MB for ZIP
            </p>
          </div>
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="mt-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">
                {isZip ? 'ZIP File' : `${files.length} Image${files.length > 1 ? 's' : ''}`} Selected
              </h3>
              <span className="text-slate-400 text-sm">
                {(totalSize / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {file.type.startsWith('image/') ? (
                      <Image className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    )}
                    <span className="text-slate-300 text-sm truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="p-1 hover:bg-slate-600 rounded transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              ))}
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
            <span>Context Settings (Optional)</span>
            {showContext ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showContext && (
            <div className="mt-4 bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Brand/Client Name</label>
                  <input
                    type="text"
                    value={context.brandName}
                    onChange={(e) => setContext(prev => ({ ...prev, brandName: e.target.value }))}
                    placeholder="e.g., Acme Corp"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Industry</label>
                  <input
                    type="text"
                    value={context.industry}
                    onChange={(e) => setContext(prev => ({ ...prev, industry: e.target.value }))}
                    placeholder="e.g., Technology"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Target Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={context.keywords}
                  onChange={(e) => setContext(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="e.g., software, innovation, team"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Custom Guidelines</label>
                <textarea
                  value={context.guidelines}
                  onChange={(e) => setContext(prev => ({ ...prev, guidelines: e.target.value }))}
                  placeholder="e.g., Use active voice, avoid jargon..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tone</label>
                  <select
                    value={context.tone}
                    onChange={(e) => setContext(prev => ({ ...prev, tone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  >
                    {TONE_OPTIONS.map(tone => (
                      <option key={tone} value={tone}>{tone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Max Characters</label>
                  <input
                    type="number"
                    value={context.charLimit}
                    onChange={(e) => setContext(prev => ({ ...prev, charLimit: parseInt(e.target.value, 10) || 125 }))}
                    min={50}
                    max={250}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Process Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleProcess}
            disabled={files.length === 0}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-xl font-medium text-lg transition-all
              ${files.length > 0
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-emerald-500/25'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            <Sparkles className="w-5 h-5" />
            Generate Alt Text
          </button>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Sparkles, title: 'AI-Powered', desc: 'Claude Vision analysis' },
            { icon: CheckCircle, title: 'WCAG Compliant', desc: 'Accessibility-first' },
            { icon: FileImage, title: 'SEO Optimized', desc: 'Smart filenames' },
            { icon: Download, title: 'Easy Export', desc: 'Excel + Images' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-700/50">
              <feature.icon className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-white font-medium text-sm">{feature.title}</h4>
              <p className="text-slate-500 text-xs">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
