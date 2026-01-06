import React, { useState, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Type,
  Heading1
} from 'lucide-react';
import { suggestAllSEO, isAIAvailable } from '../../../lib/ai/suggestionService';

export default function AISuggestions({ pageData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    title: true,
    metaDescription: true,
    h1: true
  });
  const [copiedItem, setCopiedItem] = useState(null);

  const aiAvailable = isAIAvailable();

  const generateSuggestions = useCallback(async () => {
    if (!pageData?.url) return;

    setLoading(true);
    setError(null);

    try {
      const result = await suggestAllSEO({
        url: pageData.url,
        title: pageData.title1,
        h1: pageData.h1,
        metaDescription: pageData.metaDescription1
      });
      setSuggestions(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pageData]);

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(id);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!aiAvailable) {
    return (
      <div className="bg-gray-50 rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
            <p className="text-sm text-gray-500">Not configured</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          To enable AI-powered suggestions, add your Claude API key to your environment variables:
        </p>
        <code className="block mt-2 p-3 bg-gray-100 rounded-lg text-sm font-mono text-gray-700">
          VITE_CLAUDE_API_KEY=your-api-key-here
        </code>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-50 to-cyan-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
              <p className="text-sm text-gray-500">Claude-powered optimization recommendations</p>
            </div>
          </div>
          <button
            onClick={generateSuggestions}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {suggestions ? 'Regenerate' : 'Generate Suggestions'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error generating suggestions</span>
          </div>
          <p className="text-sm text-red-600 mt-1">{error}</p>
        </div>
      )}

      {/* Suggestions Content */}
      {suggestions ? (
        <div className="divide-y">
          {/* Title Suggestions */}
          <div>
            <button
              onClick={() => toggleSection('title')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-900">Title Suggestions</span>
                <span className="text-sm text-gray-500">
                  ({suggestions.title?.suggestions?.length || 0} options)
                </span>
              </div>
              {expandedSections.title ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.title && (
              <div className="px-6 pb-4 space-y-3">
                {suggestions.title?.issues?.length > 0 && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-amber-800 mb-1">Issues Found:</p>
                    <ul className="text-sm text-amber-700 list-disc list-inside">
                      {suggestions.title.issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {suggestions.title?.suggestions?.map((suggestion, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{suggestion.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {suggestion.length} characters • {suggestion.reasoning}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(suggestion.text, `title-${idx}`)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedItem === `title-${idx}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Meta Description Suggestions */}
          <div>
            <button
              onClick={() => toggleSection('metaDescription')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-cyan-500" />
                <span className="font-medium text-gray-900">Meta Description Suggestions</span>
                <span className="text-sm text-gray-500">
                  ({suggestions.metaDescription?.suggestions?.length || 0} options)
                </span>
              </div>
              {expandedSections.metaDescription ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.metaDescription && (
              <div className="px-6 pb-4 space-y-3">
                {suggestions.metaDescription?.issues?.length > 0 && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-amber-800 mb-1">Issues Found:</p>
                    <ul className="text-sm text-amber-700 list-disc list-inside">
                      {suggestions.metaDescription.issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {suggestions.metaDescription?.suggestions?.map((suggestion, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{suggestion.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {suggestion.length} characters • {suggestion.reasoning}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(suggestion.text, `meta-${idx}`)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedItem === `meta-${idx}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* H1 Suggestions */}
          <div>
            <button
              onClick={() => toggleSection('h1')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Heading1 className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900">H1 Suggestions</span>
                <span className="text-sm text-gray-500">
                  ({suggestions.h1?.suggestions?.length || 0} options)
                </span>
              </div>
              {expandedSections.h1 ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {expandedSections.h1 && (
              <div className="px-6 pb-4 space-y-3">
                {suggestions.h1?.issues?.length > 0 && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-amber-800 mb-1">Issues Found:</p>
                    <ul className="text-sm text-amber-700 list-disc list-inside">
                      {suggestions.h1.issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {suggestions.h1?.suggestions?.map((suggestion, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{suggestion.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{suggestion.reasoning}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(suggestion.text, `h1-${idx}`)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedItem === `h1-${idx}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : !loading && (
        <div className="px-6 py-8 text-center">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Click "Generate Suggestions" to get AI-powered SEO recommendations</p>
        </div>
      )}
    </div>
  );
}
