import { useState, useMemo } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  Edit3,
  Save,
  X,
  Zap,
  FileCode,
  Lightbulb
} from 'lucide-react';
import { validateSchema, formatJsonLd, generateScriptTag, SCHEMA_TYPES } from '../../../lib/schema-generator/schemaGeneratorService';
import toast from 'react-hot-toast';
import AIExportConfirmation, { useAIExportConfirmation } from '../../shared/AIExportConfirmation';
import { AIBadge } from '../../shared/AIDisclaimer';

export default function SchemaDashboard({ results, onNewProcess, onUpdateSchema }) {
  const [expandedSchema, setExpandedSchema] = useState(0);
  const [editingSchema, setEditingSchema] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('code'); // code, preview, validation
  const exportConfirmation = useAIExportConfirmation();

  const { schemas, summary, warnings, extractedContent } = results;

  // Validate all schemas
  const validations = useMemo(() => {
    return schemas.map(schema => validateSchema(schema.jsonLd));
  }, [schemas]);

  const handleCopy = async (jsonLd, index) => {
    try {
      const code = generateScriptTag(jsonLd);
      await navigator.clipboard.writeText(code);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast.success('Schema copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy schema');
    }
  };

  const performCopyAll = async () => {
    try {
      const allCode = schemas.map(s => generateScriptTag(s.jsonLd)).join('\n\n');
      await navigator.clipboard.writeText(allCode);
      setCopiedIndex('all');
      setTimeout(() => setCopiedIndex(null), 2000);
      toast.success('All schemas copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy schemas');
    }
  };

  const performDownload = () => {
    const allCode = schemas.map(s => generateScriptTag(s.jsonLd)).join('\n\n');
    const blob = new Blob([allCode], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'structured-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Schema file downloaded');
  };

  const handleCopyAll = () => {
    exportConfirmation.requestExport(performCopyAll, 'copy', 'structured data');
  };

  const handleDownload = () => {
    exportConfirmation.requestExport(performDownload, 'download', 'structured data');
  };

  const handleEdit = (index, jsonLd) => {
    setEditingSchema(index);
    setEditValue(formatJsonLd(jsonLd));
  };

  const handleSaveEdit = (index) => {
    try {
      const parsed = JSON.parse(editValue);
      onUpdateSchema(index, { jsonLd: parsed });
      setEditingSchema(null);
      toast.success('Schema updated');
    } catch (e) {
      toast.error('Invalid JSON format');
    }
  };

  const getValidationStatusIcon = (validation) => {
    if (!validation.valid) {
      return <XCircle className="w-5 h-5 text-red-400" />;
    }
    if (validation.warnings.length > 0) {
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
    }
    return <CheckCircle className="w-5 h-5 text-emerald-400" />;
  };

  const renderRichSnippetPreview = (schema) => {
    const { type, jsonLd } = schema;

    switch (type) {
      case 'Article':
      case 'BlogPosting':
      case 'NewsArticle':
        return (
          <div className="bg-white rounded-lg p-4 max-w-2xl">
            <div className="flex items-start gap-3">
              <div className="w-24 h-16 bg-slate-200 rounded flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">
                  {jsonLd.publisher?.name || 'Publisher'} • {jsonLd.datePublished || 'Date'}
                </p>
                <h3 className="text-blue-700 font-medium hover:underline cursor-pointer">
                  {jsonLd.headline || jsonLd.name || 'Article Title'}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-2 mt-1">
                  {jsonLd.description || 'Article description...'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'Product':
        return (
          <div className="bg-white rounded-lg p-4 max-w-2xl">
            <div className="flex items-start gap-3">
              <div className="w-20 h-20 bg-slate-200 rounded flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-blue-700 font-medium hover:underline cursor-pointer">
                  {jsonLd.name || 'Product Name'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-amber-400">
                    {'★'.repeat(4)}{'☆'.repeat(1)}
                  </div>
                  <span className="text-sm text-slate-500">
                    {jsonLd.aggregateRating?.ratingValue || '4.0'} ({jsonLd.aggregateRating?.reviewCount || '0'} reviews)
                  </span>
                </div>
                {jsonLd.offers && (
                  <p className="text-emerald-600 font-medium mt-1">
                    {jsonLd.offers.priceCurrency || '$'}{jsonLd.offers.price || '0.00'}
                    <span className="text-slate-500 text-sm ml-2">
                      {jsonLd.offers.availability?.includes('InStock') ? 'In Stock' : ''}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'FAQPage':
        return (
          <div className="bg-white rounded-lg p-4 max-w-2xl">
            <h3 className="text-blue-700 font-medium mb-3">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {(jsonLd.mainEntity || []).slice(0, 3).map((faq, idx) => (
                <details key={idx} className="group">
                  <summary className="cursor-pointer text-slate-700 font-medium list-none flex items-center gap-2">
                    <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    {faq.name || `Question ${idx + 1}`}
                  </summary>
                  <p className="text-sm text-slate-600 ml-6 mt-1">
                    {faq.acceptedAnswer?.text || 'Answer...'}
                  </p>
                </details>
              ))}
            </div>
          </div>
        );

      case 'LocalBusiness':
      case 'Organization':
        return (
          <div className="bg-white rounded-lg p-4 max-w-2xl">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-blue-700 font-medium">
                  {jsonLd.name || 'Business Name'}
                </h3>
                {jsonLd.aggregateRating && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-amber-400 text-sm">
                      {'★'.repeat(Math.round(jsonLd.aggregateRating.ratingValue || 4))}
                    </div>
                    <span className="text-xs text-slate-500">
                      ({jsonLd.aggregateRating.reviewCount || '0'})
                    </span>
                  </div>
                )}
                {jsonLd.address && (
                  <p className="text-sm text-slate-600 mt-1">
                    {jsonLd.address.streetAddress}, {jsonLd.address.addressLocality}
                  </p>
                )}
                {jsonLd.telephone && (
                  <p className="text-sm text-slate-600">{jsonLd.telephone}</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <Eye className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">
              Rich snippet preview not available for {type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Schema Generated</h1>
                <AIBadge />
              </div>
              <p className="text-slate-400 text-sm">
                {schemas.length} schema{schemas.length !== 1 ? 's' : ''} created
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNewProcess}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New Schema
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              {copiedIndex === 'all' ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              Copy All
            </button>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="mb-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <p className="text-slate-300">{summary}</p>
          </div>
        )}

        {/* Warnings */}
        {warnings?.length > 0 && (
          <div className="mb-6 bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-medium">Warnings</span>
            </div>
            <ul className="space-y-1">
              {warnings.map((warning, idx) => (
                <li key={idx} className="text-sm text-amber-300">• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Schema Cards */}
        <div className="space-y-4">
          {schemas.map((schema, index) => {
            const validation = validations[index];
            const isExpanded = expandedSchema === index;
            const isEditing = editingSchema === index;
            const schemaInfo = SCHEMA_TYPES[schema.type];

            return (
              <div
                key={index}
                className={`bg-slate-800/50 rounded-xl border transition-all ${
                  isExpanded ? 'border-rose-500' : 'border-slate-700'
                }`}
              >
                {/* Schema Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedSchema(isExpanded ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getValidationStatusIcon(validation)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-medium">{schema.type}</h3>
                          {schema.richSnippetEligible && (
                            <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 text-xs rounded flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              Rich Result
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-sm">
                          {schemaInfo?.description || 'Schema.org structured data'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(schema.jsonLd, index); }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-700">
                    {/* Tabs */}
                    <div className="flex gap-2 p-4 border-b border-slate-700">
                      {[
                        { id: 'code', label: 'JSON-LD Code', icon: FileCode },
                        { id: 'preview', label: 'Rich Snippet Preview', icon: Eye },
                        { id: 'validation', label: 'Validation', icon: CheckCircle }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab.id
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                          }`}
                        >
                          <tab.icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-4">
                      {activeTab === 'code' && (
                        <div>
                          {isEditing ? (
                            <div>
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full h-80 px-4 py-3 bg-slate-900 border border-rose-500 rounded-lg text-slate-300 font-mono text-sm focus:outline-none resize-none"
                              />
                              <div className="flex justify-end gap-2 mt-2">
                                <button
                                  onClick={() => setEditingSchema(null)}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                                >
                                  <X className="w-4 h-4" />
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(index)}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                >
                                  <Save className="w-4 h-4" />
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <button
                                onClick={() => handleEdit(index, schema.jsonLd)}
                                className="absolute top-2 right-2 p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <pre className="bg-slate-900 rounded-lg p-4 text-sm text-slate-300 font-mono overflow-x-auto">
                                <code>{generateScriptTag(schema.jsonLd)}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'preview' && (
                        <div>
                          <p className="text-slate-400 text-sm mb-4">
                            Preview of how this schema may appear in Google search results:
                          </p>
                          {renderRichSnippetPreview(schema)}
                        </div>
                      )}

                      {activeTab === 'validation' && (
                        <div className="space-y-4">
                          {/* Validation Status */}
                          <div className={`flex items-center gap-3 p-4 rounded-lg ${
                            validation.valid && validation.warnings.length === 0
                              ? 'bg-emerald-500/10 border border-emerald-500/30'
                              : validation.valid
                                ? 'bg-amber-500/10 border border-amber-500/30'
                                : 'bg-red-500/10 border border-red-500/30'
                          }`}>
                            {getValidationStatusIcon(validation)}
                            <div>
                              <p className="text-white font-medium">
                                {validation.valid && validation.warnings.length === 0
                                  ? 'Schema is valid'
                                  : validation.valid
                                    ? 'Schema is valid with warnings'
                                    : 'Schema has errors'}
                              </p>
                              <p className="text-slate-400 text-sm">
                                {validation.errors.length} errors, {validation.warnings.length} warnings
                              </p>
                            </div>
                          </div>

                          {/* Errors */}
                          {validation.errors.length > 0 && (
                            <div>
                              <h4 className="text-red-400 font-medium mb-2">Errors</h4>
                              <ul className="space-y-1">
                                {validation.errors.map((error, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-red-300">
                                    <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    {error}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Warnings */}
                          {validation.warnings.length > 0 && (
                            <div>
                              <h4 className="text-amber-400 font-medium mb-2">Warnings</h4>
                              <ul className="space-y-1">
                                {validation.warnings.map((warning, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-amber-300">
                                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    {warning}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Missing Properties */}
                          {schema.missingProperties?.length > 0 && (
                            <div>
                              <h4 className="text-slate-300 font-medium mb-2">Recommended Properties</h4>
                              <div className="flex flex-wrap gap-2">
                                {schema.missingProperties.map((prop, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                                    {prop}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Test Link */}
                          <a
                            href={`https://search.google.com/test/rich-results`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-rose-400 hover:text-rose-300 text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Test with Google Rich Results Test
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Suggestions */}
                    {schema.suggestions?.length > 0 && (
                      <div className="px-4 pb-4">
                        <div className="bg-slate-800 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            <span className="text-slate-300 font-medium text-sm">Suggestions</span>
                          </div>
                          <ul className="space-y-1">
                            {schema.suggestions.map((suggestion, idx) => (
                              <li key={idx} className="text-sm text-slate-400">• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detected Content Info */}
        {extractedContent?.detectedTypes?.length > 0 && (
          <div className="mt-8 bg-slate-800/30 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Detected Content Types</h3>
            <div className="flex flex-wrap gap-2">
              {extractedContent.detectedTypes.map((type, idx) => (
                <span key={idx} className="px-3 py-1 bg-rose-500/20 text-rose-400 rounded-full text-sm">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Export Confirmation Modal */}
      <AIExportConfirmation
        isOpen={exportConfirmation.isOpen}
        onClose={exportConfirmation.handleClose}
        onConfirm={exportConfirmation.handleConfirm}
        exportType={exportConfirmation.exportType}
        contentType={exportConfirmation.contentType}
      />
    </div>
  );
}
