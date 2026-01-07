import { useState, useCallback } from 'react';
import {
  Shuffle,
  Plus,
  Trash2,
  Copy,
  Check,
  Star,
  StarOff,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * A/B Variants Panel for Meta Generator
 * Allows generating and managing multiple title/description variations
 */
export default function ABVariantsPanel({
  metadata,
  onSelectVariant,
  generateVariant,
  className = ''
}) {
  const [variants, setVariants] = useState([
    {
      id: 'original',
      label: 'Original',
      title: metadata.metaTitle,
      description: metadata.metaDescription,
      isFavorite: false,
      isActive: true
    }
  ]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Generate a new variant
  const handleGenerateVariant = useCallback(async (type = 'all') => {
    setGenerating(true);
    try {
      // Generate new variations using AI or templates
      const newVariant = await generateNewVariant(metadata, type, variants.length);

      setVariants(prev => [...prev, newVariant]);
      toast.success('New variant generated');
    } catch (error) {
      toast.error('Failed to generate variant');
    } finally {
      setGenerating(false);
    }
  }, [metadata, variants.length]);

  // Delete a variant
  const deleteVariant = (id) => {
    if (id === 'original') return;
    setVariants(prev => prev.filter(v => v.id !== id));
    toast.success('Variant deleted');
  };

  // Set as active variant
  const setActiveVariant = (id) => {
    const variant = variants.find(v => v.id === id);
    if (variant) {
      setVariants(prev => prev.map(v => ({
        ...v,
        isActive: v.id === id
      })));
      onSelectVariant?.({
        metaTitle: variant.title,
        metaDescription: variant.description
      });
      toast.success('Variant applied');
    }
  };

  // Toggle favorite
  const toggleFavorite = (id) => {
    setVariants(prev => prev.map(v =>
      v.id === id ? { ...v, isFavorite: !v.isFavorite } : v
    ));
  };

  // Copy variant
  const copyVariant = async (variant) => {
    const text = `Title: ${variant.title}\n\nDescription: ${variant.description}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(variant.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  };

  // Character count status
  const getCharStatus = (text, max) => {
    const length = text?.length || 0;
    if (length <= max) return 'good';
    if (length <= max + 10) return 'warning';
    return 'error';
  };

  return (
    <div className={`bg-white rounded-xl border border-charcoal-100 overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-charcoal-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Shuffle className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-charcoal-900">A/B Variants</h3>
            <p className="text-sm text-charcoal-500">{variants.length} variation{variants.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-charcoal-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-charcoal-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Generate Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleGenerateVariant('all')}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {generating ? (
                <RotateCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate New Variant
            </button>
            <button
              onClick={() => handleGenerateVariant('title')}
              disabled={generating}
              className="px-4 py-2.5 bg-charcoal-100 text-charcoal-700 rounded-xl font-medium hover:bg-charcoal-200 transition-colors disabled:opacity-50"
            >
              Title Only
            </button>
            <button
              onClick={() => handleGenerateVariant('description')}
              disabled={generating}
              className="px-4 py-2.5 bg-charcoal-100 text-charcoal-700 rounded-xl font-medium hover:bg-charcoal-200 transition-colors disabled:opacity-50"
            >
              Desc Only
            </button>
          </div>

          {/* Variants List */}
          <div className="space-y-3">
            {variants.map((variant, index) => {
              const titleStatus = getCharStatus(variant.title, 60);
              const descStatus = getCharStatus(variant.description, 160);

              return (
                <div
                  key={variant.id}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    variant.isActive
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-charcoal-100 hover:border-charcoal-200'
                  }`}
                >
                  {/* Variant Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-charcoal-600">
                        {variant.label || `Variant ${index + 1}`}
                      </span>
                      {variant.isActive && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          Active
                        </span>
                      )}
                      {variant.isFavorite && (
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleFavorite(variant.id)}
                        className="p-1.5 text-charcoal-400 hover:text-amber-500 rounded-lg transition-colors"
                        title={variant.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {variant.isFavorite ? (
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyVariant(variant)}
                        className="p-1.5 text-charcoal-400 hover:text-charcoal-600 rounded-lg transition-colors"
                        title="Copy"
                      >
                        {copiedId === variant.id ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      {variant.id !== 'original' && (
                        <button
                          onClick={() => deleteVariant(variant.id)}
                          className="p-1.5 text-charcoal-400 hover:text-red-500 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-charcoal-500">Title</span>
                      <span className={`text-xs ${
                        titleStatus === 'good' ? 'text-emerald-600' :
                        titleStatus === 'warning' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {variant.title?.length || 0}/60
                      </span>
                    </div>
                    <p className="text-sm text-charcoal-900 font-medium">{variant.title}</p>
                  </div>

                  {/* Description */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-charcoal-500">Description</span>
                      <span className={`text-xs ${
                        descStatus === 'good' ? 'text-emerald-600' :
                        descStatus === 'warning' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {variant.description?.length || 0}/160
                      </span>
                    </div>
                    <p className="text-sm text-charcoal-700">{variant.description}</p>
                  </div>

                  {/* Use This Variant Button */}
                  {!variant.isActive && (
                    <button
                      onClick={() => setActiveVariant(variant.id)}
                      className="w-full py-2 text-sm font-medium text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      Use This Variant
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tips */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Generate multiple variations and A/B test them to find the best performing titles and descriptions for your content.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Generate a new variant (can be connected to AI service)
 */
async function generateNewVariant(original, type, index) {
  // Templates for variation generation
  const titleTemplates = [
    (title) => title.replace(/^(The |A |An )?/i, ''),
    (title) => `${title} | Complete Guide`,
    (title) => `How to ${title.replace(/^(How to |Guide to )?/i, '')}`,
    (title) => title.length > 50 ? title.slice(0, 47) + '...' : title + ' [Updated]',
    (title) => title.replace(/\|.*$/, '').trim() + ' - Expert Tips'
  ];

  const descTemplates = [
    (desc) => desc.replace(/\.$/, '') + '. Learn more.',
    (desc) => `Discover ${desc.toLowerCase().replace(/^(learn |discover |find out )?/i, '')}`,
    (desc) => desc.length > 140 ? desc.slice(0, 137) + '...' : desc + ' Click to read more.',
    (desc) => `Looking for help? ${desc}`,
    (desc) => desc.replace(/\.$/, '') + ' - Quick & easy guide.'
  ];

  const newTitle = type !== 'description'
    ? titleTemplates[index % titleTemplates.length](original.metaTitle)
    : original.metaTitle;

  const newDesc = type !== 'title'
    ? descTemplates[index % descTemplates.length](original.metaDescription)
    : original.metaDescription;

  return {
    id: `variant-${Date.now()}`,
    label: `Variant ${index + 1}`,
    title: newTitle,
    description: newDesc,
    isFavorite: false,
    isActive: false
  };
}
