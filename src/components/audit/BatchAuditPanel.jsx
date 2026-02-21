import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Globe,
  Upload,
  Play,
  Pause,
  X,
  Check,
  Clock,
  Download,
  Trash2,
  Plus,
  FileText,
  BarChart2,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import InfoTooltip from '../common/InfoTooltip';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Local storage key for persisting batch audit results
const STORAGE_KEY = 'batchAuditResults';

export default function BatchAuditPanel({ onClose, onStartBatch }) {
  const [urls, setUrls] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const isRunningRef = useRef(false);
  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [, setSavedBatches] = useState([]);

  // Load saved batch results from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedBatches(parsed);
      }
    } catch (err) {
      console.error('Error loading saved batches:', err);
    }
  }, []);


  // Export results as CSV
  const exportAsCSV = () => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }

    const headers = ['URL', 'Health Score', 'Issues', 'Meta Tags', 'Images', 'Links', 'Performance', 'Timestamp'];
    const rows = results.map(r => [
      r.url,
      r.healthScore,
      r.issueCount,
      r.categories['Meta Tags'],
      r.categories['Images'],
      r.categories['Links'],
      r.categories['Performance'],
      format(r.timestamp, 'yyyy-MM-dd HH:mm:ss')
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `batch_audit_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast.success(`Exported ${results.length} results to CSV`);
  };

  // Export results as PDF
  const exportAsPDF = () => {
    if (results.length === 0) {
      toast.error('No results to export');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55);
    doc.text('Batch SEO Audit Report', pageWidth / 2, 20, { align: 'center' });

    // Subtitle
    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, pageWidth / 2, 28, { align: 'center' });

    // Summary
    const avgScore = Math.round(results.reduce((acc, r) => acc + r.healthScore, 0) / results.length);
    const totalIssues = results.reduce((acc, r) => acc + r.issueCount, 0);

    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text('Summary', 20, 45);

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`URLs Audited: ${results.length}`, 20, 55);
    doc.text(`Average Health Score: ${avgScore}%`, 20, 62);
    doc.text(`Total Issues Found: ${totalIssues}`, 20, 69);

    // Results table
    const tableData = results.map(r => [
      r.url.length > 40 ? r.url.substring(0, 40) + '...' : r.url,
      `${r.healthScore}%`,
      r.issueCount,
      `${r.categories['Meta Tags']}%`,
      `${r.categories['Images']}%`,
      `${r.categories['Links']}%`,
      `${r.categories['Performance']}%`
    ]);

    doc.autoTable({
      startY: 80,
      head: [['URL', 'Score', 'Issues', 'Meta', 'Images', 'Links', 'Perf']],
      body: tableData,
      headStyles: {
        fillColor: [14, 165, 233],
        textColor: 255,
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 18, halign: 'center' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 18, halign: 'center' }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    doc.save(`batch_audit_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`);
    toast.success('Exported batch audit report as PDF');
  };

  // Validate URL format with detailed checks
  const validateUrl = (url) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return { valid: false, error: 'URL cannot be empty' };

    // Check for common typos and issues
    if (trimmedUrl.includes(' ')) {
      return { valid: false, error: 'URL contains spaces - did you mean to remove them?' };
    }

    if (trimmedUrl.startsWith('htp://') || trimmedUrl.startsWith('htps://')) {
      return { valid: false, error: 'Possible typo in protocol - check http:// or https://' };
    }

    // Add protocol if missing
    const urlWithProtocol = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;

    try {
      const parsed = new URL(urlWithProtocol);

      // Check for valid hostname
      if (!parsed.hostname || parsed.hostname.length < 3) {
        return { valid: false, error: 'Invalid hostname' };
      }

      // Check for localhost/internal URLs (warning but allow)
      if (parsed.hostname === 'localhost' || parsed.hostname.match(/^192\.168\.|^10\.|^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
        return { valid: true, normalized: urlWithProtocol, warning: 'This appears to be a local/internal URL' };
      }

      // Check for valid TLD (basic check)
      const hostParts = parsed.hostname.split('.');
      if (hostParts.length < 2 || hostParts[hostParts.length - 1].length < 2) {
        return { valid: false, error: 'Invalid domain - missing or invalid TLD (e.g., .com, .org)' };
      }

      // Check for common invalid characters in domain
      if (parsed.hostname.match(/[<>'"\\]/)) {
        return { valid: false, error: 'Domain contains invalid characters' };
      }

      return { valid: true, normalized: urlWithProtocol };
    } catch {
      return { valid: false, error: 'Invalid URL format - please check the URL structure' };
    }
  };

  // Add URL to list
  const addUrl = useCallback((url) => {
    const validation = validateUrl(url);

    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const normalizedUrl = validation.normalized;

    if (urls.includes(normalizedUrl)) {
      toast.error('URL already added');
      return;
    }

    if (validation.warning) {
      toast(validation.warning, { icon: '⚠️' });
    }

    setUrls(prev => [...prev, normalizedUrl]);
    setInputValue('');
  }, [urls]);

  // Add multiple URLs (from paste)
  const addMultipleUrls = useCallback((text) => {
    const urlLines = text.split(/[\n,]/).map(u => u.trim()).filter(Boolean);
    const newUrls = [];
    let invalidCount = 0;
    let duplicateCount = 0;

    urlLines.forEach(url => {
      const validation = validateUrl(url);

      if (!validation.valid) {
        invalidCount++;
        return;
      }

      const normalizedUrl = validation.normalized;
      if (urls.includes(normalizedUrl) || newUrls.includes(normalizedUrl)) {
        duplicateCount++;
        return;
      }

      newUrls.push(normalizedUrl);
    });

    if (newUrls.length > 0) {
      setUrls(prev => [...prev, ...newUrls]);

      let message = `Added ${newUrls.length} URL${newUrls.length > 1 ? 's' : ''}`;
      if (invalidCount > 0 || duplicateCount > 0) {
        const skipped = [];
        if (invalidCount > 0) skipped.push(`${invalidCount} invalid`);
        if (duplicateCount > 0) skipped.push(`${duplicateCount} duplicate${duplicateCount > 1 ? 's' : ''}`);
        message += ` (skipped ${skipped.join(', ')})`;
      }
      toast.success(message);
    } else if (invalidCount > 0 || duplicateCount > 0) {
      if (invalidCount > 0 && duplicateCount === 0) {
        toast.error(`All ${invalidCount} URLs were invalid`);
      } else if (duplicateCount > 0 && invalidCount === 0) {
        toast.error(`All ${duplicateCount} URLs were duplicates`);
      } else {
        toast.error(`No valid URLs found (${invalidCount} invalid, ${duplicateCount} duplicates)`);
      }
    }
  }, [urls]);

  // Remove URL
  const removeUrl = (url) => {
    setUrls(prev => prev.filter(u => u !== url));
  };

  // Clear all URLs
  const clearUrls = () => {
    setUrls([]);
    setResults([]);
    setCurrentIndex(0);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        addMultipleUrls(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Simulate batch audit (in real app, this would call actual audit API)
  const runBatchAudit = async () => {
    if (urls.length === 0) {
      toast.error('Add at least one URL');
      return;
    }

    setIsRunning(true);
    isRunningRef.current = true;
    setShowResults(true);
    setResults([]);

    for (let i = 0; i < urls.length; i++) {
      if (!isRunningRef.current) break;

      setCurrentIndex(i);
      const url = urls[i];

      // Simulate audit process
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // Generate mock result
      const healthScore = Math.floor(60 + Math.random() * 40);
      const issueCount = Math.floor(Math.random() * 30) + 5;

      setResults(prev => [...prev, {
        url,
        status: 'completed',
        healthScore,
        issueCount,
        timestamp: new Date(),
        categories: {
          'Meta Tags': Math.floor(70 + Math.random() * 30),
          'Images': Math.floor(60 + Math.random() * 40),
          'Links': Math.floor(75 + Math.random() * 25),
          'Performance': Math.floor(50 + Math.random() * 50),
        }
      }]);
    }

    setIsRunning(false);
    isRunningRef.current = false;
    toast.success('Batch audit complete!');

    // Auto-save results
    const batchData = {
      id: Date.now().toString(),
      completedAt: new Date().toISOString(),
      urls,
      results: [...results, {
        url: urls[urls.length - 1],
        status: 'completed',
        healthScore: Math.floor(60 + Math.random() * 40),
        issueCount: Math.floor(Math.random() * 30) + 5,
        timestamp: new Date(),
        categories: {
          'Meta Tags': Math.floor(70 + Math.random() * 30),
          'Images': Math.floor(60 + Math.random() * 40),
          'Links': Math.floor(75 + Math.random() * 25),
          'Performance': Math.floor(50 + Math.random() * 50),
        }
      }],
      summary: {
        totalUrls: urls.length,
        avgScore: Math.round(results.reduce((acc, r) => acc + r.healthScore, 0) / results.length) || 0,
        totalIssues: results.reduce((acc, r) => acc + r.issueCount, 0)
      }
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const existingBatches = saved ? JSON.parse(saved) : [];
      const updatedBatches = [batchData, ...existingBatches].slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBatches));
      setSavedBatches(updatedBatches);
    } catch (err) {
      console.error('Error auto-saving batch:', err);
    }

    // Callback with results
    if (onStartBatch) {
      onStartBatch(results);
    }
  };

  const pauseAudit = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    toast('Audit paused', { icon: '⏸️' });
  };

  const getAverageScore = () => {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((acc, r) => acc + r.healthScore, 0) / results.length);
  };

  const getTotalIssues = () => {
    return results.reduce((acc, r) => acc + r.issueCount, 0);
  };

  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal-900 dark:text-white flex items-center gap-1">
              Multi-URL Batch Audit
              <InfoTooltip tipKey="batch.urls" />
            </h2>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
              Audit multiple URLs at once
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* URL Input */}
      {!showResults && (
        <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-700 space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addUrl(inputValue)}
              placeholder="Enter URL (e.g., example.com)"
              className="input flex-1"
            />
            <button
              onClick={() => addUrl(inputValue)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-700 dark:text-charcoal-300 rounded-lg cursor-pointer hover:bg-charcoal-200 dark:hover:bg-charcoal-600 transition-colors">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-medium">Upload CSV/TXT</span>
              <InfoTooltip tipKey="batch.upload" />
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-sm text-charcoal-500 dark:text-charcoal-400">
              Or paste multiple URLs (one per line)
            </span>
          </div>

          {/* URL List */}
          {urls.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300">
                  URLs to audit ({urls.length})
                </span>
                <button
                  onClick={clearUrls}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear all
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 bg-charcoal-50 dark:bg-charcoal-900 rounded-xl">
                {urls.map((url, index) => (
                  <div
                    key={url}
                    className="flex items-center justify-between px-3 py-2 bg-white dark:bg-charcoal-800 rounded-lg group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-charcoal-400 w-5">{index + 1}.</span>
                      <span className="text-sm text-charcoal-700 dark:text-charcoal-300 truncate">
                        {url}
                      </span>
                    </div>
                    <button
                      onClick={() => removeUrl(url)}
                      className="p-1 text-charcoal-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="flex-1 overflow-y-auto">
          {/* Summary Stats */}
          <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-700">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-900 rounded-xl">
                <p className="text-2xl font-bold text-charcoal-900 dark:text-white">{urls.length}</p>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Total URLs</p>
              </div>
              <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-900 rounded-xl">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{results.length}</p>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Completed</p>
              </div>
              <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-900 rounded-xl">
                <p className={`text-2xl font-bold ${
                  getAverageScore() >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                  getAverageScore() >= 60 ? 'text-amber-600 dark:text-amber-400' :
                  'text-red-600 dark:text-red-400'
                }`}>{getAverageScore()}%</p>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Avg Score</p>
              </div>
              <div className="text-center p-4 bg-charcoal-50 dark:bg-charcoal-900 rounded-xl">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{getTotalIssues()}</p>
                <p className="text-sm text-charcoal-500 dark:text-charcoal-400">Total Issues</p>
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="p-6 space-y-3">
            {urls.map((url, index) => {
              const result = results.find(r => r.url === url);
              const isProcessing = isRunning && currentIndex === index;
              const isPending = !result && !isProcessing;

              return (
                <div
                  key={url}
                  className={`p-4 rounded-xl border ${
                    isProcessing
                      ? 'border-cyan-300 dark:border-cyan-700 bg-cyan-50 dark:bg-cyan-900/20'
                      : result
                      ? 'border-charcoal-200 dark:border-charcoal-700'
                      : 'border-charcoal-100 dark:border-charcoal-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Status Icon */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isProcessing
                        ? 'bg-cyan-100 dark:bg-cyan-900/50'
                        : result
                        ? result.healthScore >= 80
                          ? 'bg-emerald-100 dark:bg-emerald-900/50'
                          : result.healthScore >= 60
                          ? 'bg-amber-100 dark:bg-amber-900/50'
                          : 'bg-red-100 dark:bg-red-900/50'
                        : 'bg-charcoal-100 dark:bg-charcoal-700'
                    }`}>
                      {isProcessing ? (
                        <Loader2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-spin" />
                      ) : result ? (
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-charcoal-400" />
                      )}
                    </div>

                    {/* URL Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-900 dark:text-white truncate">
                        {url}
                      </p>
                      {isProcessing && (
                        <p className="text-xs text-cyan-600 dark:text-cyan-400">Analyzing...</p>
                      )}
                      {result && (
                        <p className="text-xs text-charcoal-500 dark:text-charcoal-400">
                          {result.issueCount} issues found
                        </p>
                      )}
                      {isPending && (
                        <p className="text-xs text-charcoal-400 dark:text-charcoal-500">Pending</p>
                      )}
                    </div>

                    {/* Score */}
                    {result && (
                      <div className={`text-xl font-bold ${
                        result.healthScore >= 80
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : result.healthScore >= 60
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {result.healthScore}%
                      </div>
                    )}
                  </div>

                  {/* Category Breakdown (for completed) */}
                  {result && (
                    <div className="mt-3 pt-3 border-t border-charcoal-100 dark:border-charcoal-700 grid grid-cols-4 gap-2">
                      {Object.entries(result.categories).map(([cat, score]) => (
                        <div key={cat} className="text-center">
                          <p className="text-xs text-charcoal-500 dark:text-charcoal-400">{cat}</p>
                          <p className={`text-sm font-medium ${
                            score >= 80 ? 'text-emerald-600 dark:text-emerald-400' :
                            score >= 60 ? 'text-amber-600 dark:text-amber-400' :
                            'text-red-600 dark:text-red-400'
                          }`}>{score}%</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between">
        {!showResults ? (
          <>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
              {urls.length} URLs ready to audit
            </p>
            <button
              onClick={runBatchAudit}
              disabled={urls.length === 0}
              className="btn btn-primary flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start Batch Audit
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setShowResults(false);
                setResults([]);
              }}
              className="btn btn-secondary"
            >
              Back to URLs
            </button>
            <div className="flex items-center gap-2">
              {isRunning ? (
                <button
                  onClick={pauseAudit}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </button>
              ) : results.length < urls.length ? (
                <button
                  onClick={runBatchAudit}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Resume
                </button>
              ) : (
                <div className="relative group">
                  <button className="btn btn-primary flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Results
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 bottom-full mb-1 w-44 bg-white dark:bg-charcoal-800 border border-charcoal-200 dark:border-charcoal-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                      onClick={exportAsPDF}
                      className="w-full px-4 py-2 text-sm text-left text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-t-lg flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Export as PDF
                    </button>
                    <button
                      onClick={exportAsCSV}
                      className="w-full px-4 py-2 text-sm text-left text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-700 rounded-b-lg flex items-center gap-2"
                    >
                      <BarChart2 className="w-4 h-4" />
                      Export as CSV
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
