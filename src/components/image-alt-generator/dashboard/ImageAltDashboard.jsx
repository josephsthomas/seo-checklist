import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Image,
  Download,
  FileSpreadsheet,
  FolderArchive,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit3,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { exportToExcel, exportImagesAsZip, exportToCSV } from '../../../lib/image-alt/imageAltExportService';
import toast from 'react-hot-toast';
import AIExportConfirmation, { useAIExportConfirmation } from '../../shared/AIExportConfirmation';
import { AIBadge } from '../../shared/AIDisclaimer';

export default function ImageAltDashboard({ results, onNewProcess, onUpdateResult }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, success, error, decorative, over-limit
  const [sortBy, setSortBy] = useState('index'); // index, filename, length, confidence
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportConfirmation = useAIExportConfirmation();

  const { images, summary, context } = results;

  // Create and manage Object URLs for image thumbnails
  const imageUrlsRef = useRef(new Map());

  const imageUrls = useMemo(() => {
    const urls = new Map();
    images.forEach(img => {
      if (img.file) {
        // Reuse existing URL if we have one for this image
        const existingUrl = imageUrlsRef.current.get(img.id);
        if (existingUrl) {
          urls.set(img.id, existingUrl);
        } else {
          const newUrl = URL.createObjectURL(img.file);
          urls.set(img.id, newUrl);
        }
      }
    });
    return urls;
  }, [images]);

  // Clean up Object URLs when images change or component unmounts
  useEffect(() => {
    // Revoke URLs that are no longer needed
    imageUrlsRef.current.forEach((url, id) => {
      if (!imageUrls.has(id)) {
        URL.revokeObjectURL(url);
      }
    });
    // Update ref with current URLs
    imageUrlsRef.current = new Map(imageUrls);

    // Cleanup on unmount
    return () => {
      imageUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  // Filter and sort images
  const filteredImages = useMemo(() => {
    let filtered = [...images];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(img =>
        img.original_filename.toLowerCase().includes(term) ||
        img.filename.toLowerCase().includes(term) ||
        img.alt_text?.toLowerCase().includes(term)
      );
    }

    // Apply filter
    switch (filter) {
      case 'success':
        filtered = filtered.filter(img => !img.error);
        break;
      case 'error':
        filtered = filtered.filter(img => img.error);
        break;
      case 'decorative':
        filtered = filtered.filter(img => img.is_decorative);
        break;
      case 'over-limit':
        filtered = filtered.filter(img => (img.alt_text?.length || 0) > 125);
        break;
    }

    // Apply sort
    switch (sortBy) {
      case 'filename':
        filtered.sort((a, b) => a.original_filename.localeCompare(b.original_filename));
        break;
      case 'length':
        filtered.sort((a, b) => (b.alt_text?.length || 0) - (a.alt_text?.length || 0));
        break;
      case 'confidence':
        filtered.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        break;
    }

    return filtered;
  }, [images, searchTerm, filter, sortBy]);

  const handleEdit = (img) => {
    setEditingId(img.id);
    setEditValue(img.alt_text || '');
  };

  const handleSave = (id) => {
    onUpdateResult(id, { alt_text: editValue });
    setEditingId(null);
    toast.success('Alt text updated');
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const performExport = async (type) => {
    try {
      switch (type) {
        case 'excel':
          exportToExcel(images);
          toast.success('Excel report downloaded');
          break;
        case 'csv':
          exportToCSV(images);
          toast.success('CSV exported');
          break;
        case 'images':
          await exportImagesAsZip(images);
          toast.success('Images ZIP downloaded');
          break;
      }
    } catch (err) {
      toast.error(`Export failed: ${err.message}`);
    }
  };

  const handleExport = (type) => {
    setShowExportMenu(false);
    exportConfirmation.requestExport(() => performExport(type), 'download', 'alt text');
  };

  const getCharCountColor = (length) => {
    if (length === 0) return 'text-slate-500';
    if (length <= 100) return 'text-emerald-400';
    if (length <= 125) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">Alt Text Results</h1>
                <AIBadge />
              </div>
              <p className="text-slate-400 text-sm">
                {summary.total} images processed • {summary.success} successful
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNewProcess}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              New Batch
            </button>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
                <ChevronDown className="w-4 h-4" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden z-10">
                  <button
                    onClick={() => handleExport('excel')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    Excel Report
                  </button>
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-400" />
                    CSV Export
                  </button>
                  <button
                    onClick={() => handleExport('images')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    <FolderArchive className="w-4 h-4 text-amber-400" />
                    Images ZIP
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total Images', value: summary.total, icon: Image, color: 'slate' },
            { label: 'Successful', value: summary.success, icon: CheckCircle, color: 'emerald' },
            { label: 'Decorative', value: summary.decorative, icon: Eye, color: 'blue' },
            { label: 'Avg Length', value: `${summary.avgLength} chars`, icon: Edit3, color: 'purple' },
            { label: 'Over 125', value: summary.overLimit, icon: AlertCircle, color: 'amber' }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-slate-800/50 rounded-xl p-4 border border-slate-700`}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                <span className="text-slate-400 text-sm">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by filename or alt text..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Images</option>
              <option value="success">Successful</option>
              <option value="error">With Errors</option>
              <option value="decorative">Decorative</option>
              <option value="over-limit">Over 125 chars</option>
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="index">Original Order</option>
            <option value="filename">Filename</option>
            <option value="length">Alt Text Length</option>
            <option value="confidence">Confidence</option>
          </select>
        </div>

        {/* Results List */}
        <div className="space-y-3">
          {filteredImages.map((img, idx) => (
            <div
              key={img.id}
              className={`bg-slate-800/50 rounded-xl border transition-all ${
                expandedId === img.id ? 'border-emerald-500' : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Main Row */}
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                    {imageUrls.get(img.id) && (
                      <img
                        src={imageUrls.get(img.id)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-slate-400 text-xs">#{idx + 1}</span>
                      {img.error ? (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Error</span>
                      ) : img.is_decorative ? (
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Decorative</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">Success</span>
                      )}
                      <span className={`text-xs ${getCharCountColor(img.alt_text?.length || 0)}`}>
                        {img.alt_text?.length || 0} chars
                      </span>
                    </div>

                    <p className="text-white text-sm font-medium truncate mb-1">
                      {img.original_filename}
                    </p>

                    {editingId === img.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-3 py-1 bg-slate-700 border border-emerald-500 rounded text-white text-sm focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSave(img.id)}
                          className="p-1 text-emerald-400 hover:bg-slate-700 rounded"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-slate-400 hover:bg-slate-700 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-slate-300 text-sm line-clamp-2">
                        {img.alt_text || <span className="text-slate-500 italic">No alt text</span>}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(img.alt_text || '', img.id)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Copy alt text"
                    >
                      {copiedId === img.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(img)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit alt text"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedId(expandedId === img.id ? null : img.id)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                      title="View details"
                    >
                      {expandedId === img.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === img.id && (
                <div className="px-4 pb-4 border-t border-slate-700 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">New Filename:</span>
                      <p className="text-emerald-400 font-mono text-xs mt-1">{img.filename}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Confidence:</span>
                      <p className="text-white mt-1">
                        {Math.round((img.confidence || 0) * 100)}%
                        {' '}
                        <span className="text-slate-400 text-xs">
                          ({(img.confidence || 0) >= 0.9 ? 'High' : (img.confidence || 0) >= 0.7 ? 'Medium' : 'Low'})
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">File Size:</span>
                      <p className="text-white mt-1">{(img.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Type:</span>
                      <p className="text-white mt-1">{img.file_type}</p>
                    </div>
                    {img.detected_elements?.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-slate-500">Detected Elements:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {img.detected_elements.map((el, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                              {el}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {img.error && (
                      <div className="col-span-2">
                        <span className="text-slate-500">Error:</span>
                        <p className="text-red-400 mt-1">{img.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No images match your search criteria</p>
          </div>
        )}

        {/* Context Info */}
        {(context.brandName || context.industry || context.keywords) && (
          <div className="mt-8 bg-slate-800/30 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-medium">Processing Context</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {context.brandName && (
                <div>
                  <span className="text-slate-500">Brand:</span>
                  <p className="text-white">{context.brandName}</p>
                </div>
              )}
              {context.industry && (
                <div>
                  <span className="text-slate-500">Industry:</span>
                  <p className="text-white">{context.industry}</p>
                </div>
              )}
              {context.tone && (
                <div>
                  <span className="text-slate-500">Tone:</span>
                  <p className="text-white">{context.tone}</p>
                </div>
              )}
              {context.charLimit && (
                <div>
                  <span className="text-slate-500">Char Limit:</span>
                  <p className="text-white">{context.charLimit}</p>
                </div>
              )}
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
