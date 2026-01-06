import React, { useState, useMemo } from 'react';
import {
  Tags,
  Search,
  Share2,
  Code,
  Copy,
  Check,
  Edit3,
  Save,
  X,
  RefreshCw,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Twitter,
  Facebook
} from 'lucide-react';
import { generateHtmlCode } from '../../../lib/meta-generator/metaGeneratorService';
import toast from 'react-hot-toast';

// Helper to safely extract hostname from URL
const getHostname = (url) => {
  if (!url) return 'example.com';
  try {
    return new URL(url).hostname;
  } catch {
    return 'example.com';
  }
};

export default function MetaDashboard({ results, onNewProcess, onUpdateMetadata }) {
  const [activeTab, setActiveTab] = useState('serp'); // serp, social, code
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  const { metadata, extractedContent, context, fileName } = results;

  // Generate HTML code
  const htmlCode = useMemo(() => {
    return generateHtmlCode(metadata, { targetUrl: context.targetUrl });
  }, [metadata, context.targetUrl]);

  // Character count validation
  const validation = useMemo(() => ({
    metaTitle: {
      length: metadata.metaTitle?.length || 0,
      status: (metadata.metaTitle?.length || 0) <= 60 ? 'good' : 'warning',
      message: metadata.metaTitle?.length > 60 ? 'Title exceeds 60 characters' : 'Good length'
    },
    metaDescription: {
      length: metadata.metaDescription?.length || 0,
      status: (metadata.metaDescription?.length || 0) <= 160 ? 'good' : 'warning',
      message: metadata.metaDescription?.length > 160 ? 'Description exceeds 160 characters' : 'Good length'
    }
  }), [metadata]);

  const handleEdit = (field, value) => {
    setEditingField(field);
    setEditValue(value || '');
  };

  const handleSave = (field) => {
    onUpdateMetadata({ [field]: editValue });
    setEditingField(null);
    toast.success('Metadata updated');
  };

  const handleCopy = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('Copied to clipboard');
  };

  const handleCopyAll = async () => {
    await navigator.clipboard.writeText(htmlCode);
    setCopiedField('all');
    setTimeout(() => setCopiedField(null), 2000);
    toast.success('HTML code copied to clipboard');
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^/.]+$/, '')}-metadata.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('HTML file downloaded');
  };

  const renderEditableField = (field, label, value, maxLength, multiline = false) => {
    const isEditing = editingField === field;
    const length = value?.length || 0;
    const isOverLimit = length > maxLength;

    return (
      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-slate-300">{label}</label>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isOverLimit ? 'text-amber-400' : 'text-slate-500'}`}>
              {length}/{maxLength}
            </span>
            {!isEditing && (
              <>
                <button
                  onClick={() => handleCopy(value || '', field)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  {copiedField === field ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleEdit(field, value)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="flex items-start gap-2">
            {multiline ? (
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-700 border border-amber-500 rounded-lg text-white text-sm focus:outline-none resize-none"
                rows={3}
                autoFocus
              />
            ) : (
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-700 border border-amber-500 rounded-lg text-white text-sm focus:outline-none"
                autoFocus
              />
            )}
            <button
              onClick={() => handleSave(field)}
              className="p-2 text-emerald-400 hover:bg-slate-700 rounded-lg"
            >
              <Save className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingField(null)}
              className="p-2 text-slate-400 hover:bg-slate-700 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-white text-sm">
            {value || <span className="text-slate-500 italic">Not set</span>}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <Tags className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Metadata Generated</h1>
              <p className="text-slate-400 text-sm">{fileName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNewProcess}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New Document
            </button>
          </div>
        </div>

        {/* Validation Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            validation.metaTitle.status === 'good'
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}>
            {validation.metaTitle.status === 'good' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <p className="text-white text-sm font-medium">Meta Title</p>
              <p className={`text-xs ${validation.metaTitle.status === 'good' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {validation.metaTitle.message} ({validation.metaTitle.length} chars)
              </p>
            </div>
          </div>

          <div className={`flex items-center gap-3 p-4 rounded-xl border ${
            validation.metaDescription.status === 'good'
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-amber-500/10 border-amber-500/30'
          }`}>
            {validation.metaDescription.status === 'good' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            )}
            <div>
              <p className="text-white text-sm font-medium">Meta Description</p>
              <p className={`text-xs ${validation.metaDescription.status === 'good' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {validation.metaDescription.message} ({validation.metaDescription.length} chars)
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'serp', label: 'SERP Preview', icon: Search },
            { id: 'social', label: 'Social Cards', icon: Share2 },
            { id: 'code', label: 'HTML Code', icon: Code }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'serp' && (
          <div className="space-y-6">
            {/* Google SERP Preview */}
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-600">Google Search Preview</span>
              </div>

              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center">
                    <span className="text-xs">🌐</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">
                      {context.targetUrl || 'example.com'}
                    </p>
                  </div>
                </div>
                <h3 className="text-xl text-blue-700 hover:underline cursor-pointer mb-1">
                  {metadata.metaTitle || 'Page Title'}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {metadata.metaDescription || 'Page description will appear here...'}
                </p>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              {renderEditableField('metaTitle', 'Meta Title', metadata.metaTitle, 60)}
              {renderEditableField('metaDescription', 'Meta Description', metadata.metaDescription, 160, true)}
            </div>

            {/* Focus Keywords */}
            {metadata.focusKeywords?.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">Focus Keywords</label>
                <div className="flex flex-wrap gap-2">
                  {metadata.focusKeywords.map((kw, idx) => (
                    <span key={idx} className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            {/* Facebook Preview */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Facebook className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-300">Facebook / Open Graph</span>
              </div>

              <div className="bg-white rounded-lg overflow-hidden max-w-lg border border-slate-200">
                <div className="bg-slate-100 h-40 flex items-center justify-center">
                  <span className="text-slate-400 text-sm">Image Preview</span>
                </div>
                <div className="p-3">
                  <p className="text-xs text-slate-500 uppercase mb-1">
                    {getHostname(context.targetUrl)}
                  </p>
                  <h4 className="font-semibold text-slate-900 mb-1">{metadata.ogTitle}</h4>
                  <p className="text-sm text-slate-600 line-clamp-2">{metadata.ogDescription}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {renderEditableField('ogTitle', 'OG Title', metadata.ogTitle, 95)}
                {renderEditableField('ogDescription', 'OG Description', metadata.ogDescription, 200, true)}
              </div>
            </div>

            {/* Twitter Preview */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <Twitter className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-slate-300">Twitter Card</span>
              </div>

              <div className="bg-slate-900 rounded-xl overflow-hidden max-w-lg border border-slate-700">
                <div className="bg-slate-800 h-40 flex items-center justify-center">
                  <span className="text-slate-500 text-sm">Image Preview</span>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-white mb-1">{metadata.twitterTitle}</h4>
                  <p className="text-sm text-slate-400 line-clamp-2">{metadata.twitterDescription}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {getHostname(context.targetUrl)}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {renderEditableField('twitterTitle', 'Twitter Title', metadata.twitterTitle, 70)}
                {renderEditableField('twitterDescription', 'Twitter Description', metadata.twitterDescription, 200, true)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-4">
            {/* Code Preview */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                <span className="text-sm font-medium text-slate-300">HTML Meta Tags</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadHtml}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={handleCopyAll}
                    className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                  >
                    {copiedField === 'all' ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    Copy All
                  </button>
                </div>
              </div>

              <pre className="p-4 text-sm text-slate-300 overflow-x-auto font-mono">
                <code>{htmlCode}</code>
              </pre>
            </div>

            {/* Additional Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <label className="block text-sm font-medium text-slate-300 mb-2">Robots Directive</label>
                <p className="text-white font-mono text-sm">{metadata.robots || 'index, follow'}</p>
              </div>

              {metadata.canonicalUrl && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Canonical URL</label>
                  <p className="text-amber-400 font-mono text-sm truncate">{metadata.canonicalUrl}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {metadata.suggestions?.length > 0 && (
          <div className="mt-8 bg-slate-800/30 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3">💡 AI Suggestions</h3>
            <ul className="space-y-2">
              {metadata.suggestions.map((suggestion, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-amber-400">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content Summary */}
        {metadata.contentSummary && (
          <div className="mt-4 bg-slate-800/30 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Content Summary</h3>
            <p className="text-slate-400 text-sm">{metadata.contentSummary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
