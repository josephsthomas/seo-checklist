import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Code2,
  FileCode,
  Globe,
  Upload,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle,
  Zap,
  X
} from 'lucide-react';
import { SCHEMA_TYPES, getSchemaCategories } from '../../../lib/schema-generator/schemaGeneratorService';

const INPUT_MODES = {
  PASTE: 'paste',
  FILE: 'file',
  URL: 'url'
};

export default function SchemaUploadScreen({ onSubmit }) {
  const [inputMode, setInputMode] = useState(INPUT_MODES.PASTE);
  const [htmlContent, setHtmlContent] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    selectedType: '',
    pageUrl: '',
    organizationName: ''
  });

  const schemaCategories = getSchemaCategories();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFile(file);

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        setHtmlContent(e.target.result);
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html', '.htm'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const handleSubmit = async () => {
    let content = htmlContent;
    let inputType = inputMode;

    if (inputMode === INPUT_MODES.URL && url) {
      // For URL mode, we would fetch the HTML (requires backend proxy)
      // For now, show an error or use a sample
      try {
        // Try to fetch via a CORS proxy or show warning
        content = `<!DOCTYPE html>
<html>
<head><title>URL Content</title></head>
<body>
<h1>Content from ${url}</h1>
<p>Note: Direct URL fetching requires a backend proxy. Please paste the HTML content directly or upload an HTML file.</p>
</body>
</html>`;
        inputType = 'url';
      } catch (err) {
        // Fall back to placeholder
      }
    }

    if (!content.trim()) {
      return;
    }

    onSubmit(content, {
      ...options,
      inputType,
      sourceUrl: inputMode === INPUT_MODES.URL ? url : options.pageUrl
    });
  };

  const isValid = () => {
    if (inputMode === INPUT_MODES.URL) return url.trim().length > 0;
    return htmlContent.trim().length > 0;
  };

  const removeFile = () => {
    setFile(null);
    setHtmlContent('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl mb-4 shadow-lg">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Structured Data Generator</h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Generate schema.org JSON-LD markup from your HTML content for rich search results
          </p>
        </div>

        {/* Input Mode Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {[
            { id: INPUT_MODES.PASTE, label: 'Paste HTML', icon: FileCode },
            { id: INPUT_MODES.FILE, label: 'Upload File', icon: Upload },
            { id: INPUT_MODES.URL, label: 'Enter URL', icon: Globe }
          ].map(mode => (
            <button
              key={mode.id}
              onClick={() => setInputMode(mode.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                inputMode === mode.id
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <mode.icon className="w-4 h-4" />
              {mode.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        {inputMode === INPUT_MODES.PASTE && (
          <div className="mb-6">
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Paste your HTML content here...

Example:
<!DOCTYPE html>
<html>
<head>
  <title>My Page Title</title>
  <meta name='description' content='Page description'>
</head>
<body>
  <h1>Main Heading</h1>
  <p>Content goes here...</p>
</body>
</html>"
              className="w-full h-64 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-rose-500 resize-none"
            />
            <p className="text-slate-500 text-xs mt-2">
              {htmlContent.length} characters
            </p>
          </div>
        )}

        {inputMode === INPUT_MODES.FILE && (
          <div className="mb-6">
            {!file ? (
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
                  ${isDragActive
                    ? 'border-rose-400 bg-rose-500/10'
                    : 'border-slate-600 hover:border-rose-400 hover:bg-slate-800/50'
                  }
                `}
              >
                <input {...getInputProps()} />
                <div className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-colors
                  ${isDragActive ? 'bg-rose-500/20' : 'bg-slate-700/50'}
                `}>
                  <Upload className={`w-8 h-8 ${isDragActive ? 'text-rose-400' : 'text-slate-400'}`} />
                </div>
                <p className="text-lg font-medium text-white mb-2">
                  {isDragActive ? 'Drop file here' : 'Drag & drop an HTML file'}
                </p>
                <p className="text-slate-400 text-sm">
                  or click to browse
                </p>
              </div>
            ) : (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileCode className="w-8 h-8 text-rose-400" />
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-slate-400 text-sm">
                        {(file.size / 1024).toFixed(1)} KB • {htmlContent.length} characters
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={removeFile}
                    className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {inputMode === INPUT_MODES.URL && (
          <div className="mb-6">
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
            <p className="text-amber-400 text-xs mt-2">
              ⚠️ URL fetching requires the HTML to be pasted or uploaded. Enter the URL for reference.
            </p>
          </div>
        )}

        {/* Options Panel */}
        <div className="mb-6">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Schema Options (Optional)</span>
            {showOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showOptions && (
            <div className="mt-4 bg-slate-800/50 rounded-xl p-6 border border-slate-700 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Preferred Schema Type</label>
                <select
                  value={options.selectedType}
                  onChange={(e) => setOptions(prev => ({ ...prev, selectedType: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="">Auto-detect (Recommended)</option>
                  {Object.entries(schemaCategories).map(([category, types]) => (
                    <optgroup key={category} label={category}>
                      {types.map(({ type, description, richSnippet }) => (
                        <option key={type} value={type}>
                          {type} {richSnippet ? '⭐' : ''} - {description}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-slate-500 text-xs mt-1">⭐ = Eligible for rich results</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Page URL</label>
                  <input
                    type="url"
                    value={options.pageUrl}
                    onChange={(e) => setOptions(prev => ({ ...prev, pageUrl: e.target.value }))}
                    placeholder="https://example.com/page"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={options.organizationName}
                    onChange={(e) => setOptions(prev => ({ ...prev, organizationName: e.target.value }))}
                    placeholder="e.g., Acme Corp"
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!isValid()}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-xl font-medium text-lg transition-all
              ${isValid()
                ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-lg hover:shadow-rose-500/25'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            <Sparkles className="w-5 h-5" />
            Generate Schema
          </button>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Sparkles, title: 'AI-Powered', desc: 'Claude analysis' },
            { icon: Code2, title: '50+ Types', desc: 'Schema.org support' },
            { icon: CheckCircle, title: 'Validated', desc: 'Google compatible' },
            { icon: Zap, title: 'Rich Results', desc: 'SERP eligible' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-700/50">
              <feature.icon className="w-6 h-6 text-rose-400 mx-auto mb-2" />
              <h4 className="text-white font-medium text-sm">{feature.title}</h4>
              <p className="text-slate-500 text-xs">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Schema Types Preview */}
        <div className="mt-8 bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
          <h3 className="text-white font-medium mb-4">Supported Schema Types</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SCHEMA_TYPES).slice(0, 20).map(([type, info]) => (
              <span
                key={type}
                className={`px-2 py-1 rounded text-xs ${
                  info.richSnippet
                    ? 'bg-rose-500/20 text-rose-400'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {type}
              </span>
            ))}
            <span className="px-2 py-1 bg-slate-700 text-slate-400 rounded text-xs">
              +{Object.keys(SCHEMA_TYPES).length - 20} more
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
