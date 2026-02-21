import { useState, useCallback } from 'react';
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
import { AIDisclaimerInline } from '../../shared/AIDisclaimer';

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

      // Validate AI response structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid response from AI service.');
      }
      const sections = ['title', 'metaDescription', 'h1'];
      for (const section of sections) {
        if (result[section]) {
          if (result[section].suggestions && !Array.isArray(result[section].suggestions)) {
            result[section].suggestions = [];
          }
          if (result[section].issues && !Array.isArray(result[section].issues)) {
            result[section].issues = [];
          }
        }
      }

      setSuggestions(result);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('429') || msg.toLowerCase().includes('rate limit')) {
        setError('AI service is busy. Please try again in a few seconds.');
      } else if (msg.includes('503') || msg.includes('timeout') || msg.toLowerCase().includes('unavailable')) {
        setError('AI service is temporarily unavailable. Please try again shortly.');
      } else {
        setError(msg || 'An unexpected error occurred.');
      }
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
      <div className="bg-charcoal-50 rounded-xl border p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-charcoal-200 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-charcoal-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-charcoal-900">AI Suggestions</h3>
            <p className="text-sm text-charcoal-500">Not configured</p>
          </div>
        </div>
        <p className="text-sm text-charcoal-600">
          To enable AI-assisted suggestions, configure the AI proxy URL in your environment variables:
        </p>
        <code className="block mt-2 p-3 bg-charcoal-100 rounded-lg text-sm font-mono text-charcoal-700">
          VITE_AI_PROXY_URL=your-proxy-url-here
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
              <h3 className="text-lg font-semibold text-charcoal-900">AI Suggestions</h3>
              <p className="text-sm text-charcoal-500">AI-assisted optimization recommendations — review before implementing</p>
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
          <button
            onClick={generateSuggestions}
            disabled={loading}
            className="mt-2 text-sm text-red-700 hover:text-red-800 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
          >
            Try again
          </button>
        </div>
      )}

      {/* AI Disclaimer */}
      {suggestions && (
        <div className="px-6 py-3 border-b border-charcoal-100">
          <AIDisclaimerInline />
        </div>
      )}

      {/* Suggestions Content */}
      {suggestions ? (
        <div className="divide-y">
          {/* Title Suggestions */}
          <div>
            <button
              onClick={() => toggleSection('title')}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-charcoal-50"
            >
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-charcoal-900">Title Suggestions</span>
                <span className="text-sm text-charcoal-500">
                  ({suggestions.title?.suggestions?.length || 0} options)
                </span>
              </div>
              {expandedSections.title ? (
                <ChevronUp className="w-5 h-5 text-charcoal-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-charcoal-400" />
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
                  <div key={idx} className="bg-charcoal-50 rounded-lg p-4 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-charcoal-900">{suggestion.text}</p>
                        <p className="text-xs text-charcoal-500 mt-1">
                          {suggestion.length} characters • {suggestion.reasoning}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(suggestion.text, `title-${idx}`)}
                        className="p-2 hover:bg-charcoal-200 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedItem === `title-${idx}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-600" />
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
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-charcoal-50"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-cyan-500" />
                <span className="font-medium text-charcoal-900">Meta Description Suggestions</span>
                <span className="text-sm text-charcoal-500">
                  ({suggestions.metaDescription?.suggestions?.length || 0} options)
                </span>
              </div>
              {expandedSections.metaDescription ? (
                <ChevronUp className="w-5 h-5 text-charcoal-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-charcoal-400" />
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
                  <div key={idx} className="bg-charcoal-50 rounded-lg p-4 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-charcoal-900">{suggestion.text}</p>
                        <p className="text-xs text-charcoal-500 mt-1">
                          {suggestion.length} characters • {suggestion.reasoning}
                        </p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(suggestion.text, `meta-${idx}`)}
                        className="p-2 hover:bg-charcoal-200 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedItem === `meta-${idx}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-600" />
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
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-charcoal-50"
            >
              <div className="flex items-center gap-3">
                <Heading1 className="w-5 h-5 text-green-500" />
                <span className="font-medium text-charcoal-900">H1 Suggestions</span>
                <span className="text-sm text-charcoal-500">
                  ({suggestions.h1?.suggestions?.length || 0} options)
                </span>
              </div>
              {expandedSections.h1 ? (
                <ChevronUp className="w-5 h-5 text-charcoal-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-charcoal-400" />
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
                  <div key={idx} className="bg-charcoal-50 rounded-lg p-4 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-charcoal-900">{suggestion.text}</p>
                        <p className="text-xs text-charcoal-500 mt-1">{suggestion.reasoning}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(suggestion.text, `h1-${idx}`)}
                        className="p-2 hover:bg-charcoal-200 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copiedItem === `h1-${idx}` ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-600" />
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
          <Sparkles className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
          <p className="text-charcoal-500">Click &quot;Generate Suggestions&quot; to get AI-powered SEO recommendations</p>
        </div>
      )}
    </div>
  );
}
