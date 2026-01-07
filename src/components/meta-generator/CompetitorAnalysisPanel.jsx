import { useState } from 'react';
import {
  Search,
  Globe,
  AlertCircle,
  Check,
  X,
  Copy,
  BarChart2,
  Loader2,
  ExternalLink,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Minus,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function CompetitorAnalysisPanel({ currentMeta, onClose }) {
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [competitorMeta, setCompetitorMeta] = useState(null);
  const [error, setError] = useState(null);

  const fetchCompetitorMeta = async () => {
    if (!competitorUrl.trim()) {
      toast.error('Enter a URL to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setCompetitorMeta(null);

    try {
      // Normalize URL
      const url = competitorUrl.startsWith('http') ? competitorUrl : `https://${competitorUrl}`;

      // Simulate fetching meta data (in production, this would call a backend API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Generate mock competitor meta data
      const mockMeta = {
        url,
        title: `${new URL(url).hostname.replace('www.', '')} - Industry Leading Solutions`,
        titleLength: 48,
        description: `Discover premium solutions and services from ${new URL(url).hostname}. We offer innovative products, expert support, and competitive pricing for all your needs.`,
        descriptionLength: 145,
        keywords: ['solutions', 'services', 'premium', 'innovative', 'expert'],
        ogTitle: `${new URL(url).hostname.replace('www.', '')} | Trusted Solutions Provider`,
        ogDescription: `Transform your business with our comprehensive solutions. 10,000+ satisfied customers.`,
        ogImage: true,
        twitterCard: 'summary_large_image',
        canonicalUrl: url,
        h1Count: 1,
        wordCount: 1250,
        fetchedAt: new Date()
      };

      setCompetitorMeta(mockMeta);
    } catch (err) {
      setError('Failed to fetch competitor meta data. Please check the URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const compareLength = (yourLength, competitorLength, type) => {
    const optimalRanges = {
      title: { min: 50, max: 60 },
      description: { min: 150, max: 160 }
    };
    const range = optimalRanges[type];

    const yourOptimal = yourLength >= range.min && yourLength <= range.max;
    const compOptimal = competitorLength >= range.min && competitorLength <= range.max;

    if (yourOptimal && !compOptimal) return 'better';
    if (!yourOptimal && compOptimal) return 'worse';
    if (Math.abs(yourLength - ((range.min + range.max) / 2)) < Math.abs(competitorLength - ((range.min + range.max) / 2))) {
      return 'better';
    }
    return 'equal';
  };

  const getComparisonIcon = (comparison) => {
    if (comparison === 'better') return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (comparison === 'worse') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-charcoal-400" />;
  };

  // Export comparison report as PDF
  const exportComparisonPDF = () => {
    if (!competitorMeta) {
      toast.error('No competitor data to export');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55);
    doc.text('SEO Competitor Analysis Report', pageWidth / 2, 20, { align: 'center' });

    // Subtitle
    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy h:mm a')}`, pageWidth / 2, 28, { align: 'center' });

    // Competitor URL
    doc.setFontSize(10);
    doc.text(`Competitor: ${competitorMeta.url}`, 20, 45);

    // Title Comparison Table
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Title Tag Comparison', 20, 60);

    doc.autoTable({
      startY: 65,
      head: [['', 'Your Site', 'Competitor']],
      body: [
        ['Title', currentMeta?.title || 'Not set', competitorMeta.title],
        ['Length', `${currentMeta?.title?.length || 0} chars`, `${competitorMeta.titleLength} chars`],
        ['Optimal (50-60)', currentMeta?.title?.length >= 50 && currentMeta?.title?.length <= 60 ? 'Yes' : 'No', competitorMeta.titleLength >= 50 && competitorMeta.titleLength <= 60 ? 'Yes' : 'No']
      ],
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });

    // Description Comparison Table
    let yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Meta Description Comparison', 20, yPos);

    doc.autoTable({
      startY: yPos + 5,
      head: [['', 'Your Site', 'Competitor']],
      body: [
        ['Description', (currentMeta?.description || 'Not set').substring(0, 50) + '...', competitorMeta.description.substring(0, 50) + '...'],
        ['Length', `${currentMeta?.description?.length || 0} chars`, `${competitorMeta.descriptionLength} chars`],
        ['Optimal (150-160)', currentMeta?.description?.length >= 150 && currentMeta?.description?.length <= 160 ? 'Yes' : 'No', competitorMeta.descriptionLength >= 150 && competitorMeta.descriptionLength <= 160 ? 'Yes' : 'No']
      ],
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { fontStyle: 'bold' } }
    });

    // Social Meta Comparison
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Social Meta Tags', 20, yPos);

    doc.autoTable({
      startY: yPos + 5,
      head: [['Tag', 'Competitor Has']],
      body: [
        ['OG Title', competitorMeta.ogTitle ? 'Yes' : 'No'],
        ['OG Image', competitorMeta.ogImage ? 'Yes' : 'No'],
        ['Twitter Card', competitorMeta.twitterCard || 'No']
      ],
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 8 }
    });

    // Keywords
    yPos = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Keywords Detected in Competitor Content', 20, yPos);
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(competitorMeta.keywords.join(', '), 20, yPos + 8);

    // Insights
    yPos = yPos + 20;
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Key Insights', 20, yPos);
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    const insights = [
      '• Competitor uses action-oriented language in their title',
      '• Their description includes social proof ("10,000+ satisfied customers")',
      '• They have complete Open Graph implementation for social sharing'
    ];
    insights.forEach((insight, i) => {
      doc.text(insight, 20, yPos + 8 + (i * 6));
    });

    doc.save(`competitor_analysis_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('Competitor analysis exported as PDF');
  };

  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl overflow-hidden max-w-3xl w-full max-h-[85vh] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal-900 dark:text-white">Competitor Analysis</h2>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
              Compare your meta tags with competitors
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
      <div className="p-6 border-b border-charcoal-100 dark:border-charcoal-700">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal-400" />
            <input
              type="text"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchCompetitorMeta()}
              placeholder="Enter competitor URL (e.g., competitor.com)"
              className="input pl-11"
            />
          </div>
          <button
            onClick={fetchCompetitorMeta}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Analyze
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!competitorMeta && !loading && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-charcoal-100 dark:bg-charcoal-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-charcoal-400" />
            </div>
            <p className="text-charcoal-600 dark:text-charcoal-400 font-medium">
              Enter a competitor URL to analyze
            </p>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-500 mt-1">
              We&apos;ll extract their meta tags for comparison
            </p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-charcoal-600 dark:text-charcoal-400 font-medium">
              Analyzing competitor...
            </p>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-500 mt-1">
              Fetching meta tags from {competitorUrl}
            </p>
          </div>
        )}

        {competitorMeta && (
          <div className="space-y-6">
            {/* Competitor URL */}
            <div className="flex items-center gap-2 text-sm text-charcoal-500 dark:text-charcoal-400">
              <Globe className="w-4 h-4" />
              <a
                href={competitorMeta.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1"
              >
                {competitorMeta.url}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Title Comparison */}
            <div className="space-y-3">
              <h3 className="font-semibold text-charcoal-900 dark:text-white flex items-center gap-2">
                Title Tag
                {currentMeta?.title && getComparisonIcon(
                  compareLength(currentMeta.title.length, competitorMeta.titleLength, 'title')
                )}
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Your Title */}
                <div className="p-4 bg-charcoal-50 dark:bg-charcoal-900 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">Your Title</span>
                    <span className={`text-xs font-medium ${
                      currentMeta?.title?.length >= 50 && currentMeta?.title?.length <= 60
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {currentMeta?.title?.length || 0} chars
                    </span>
                  </div>
                  <p className="text-sm text-charcoal-700 dark:text-charcoal-300">
                    {currentMeta?.title || 'No title set'}
                  </p>
                </div>

                {/* Competitor Title */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Competitor Title</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${
                        competitorMeta.titleLength >= 50 && competitorMeta.titleLength <= 60
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {competitorMeta.titleLength} chars
                      </span>
                      <button
                        onClick={() => handleCopy(competitorMeta.title)}
                        className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded"
                      >
                        <Copy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-charcoal-700 dark:text-charcoal-300">
                    {competitorMeta.title}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Comparison */}
            <div className="space-y-3">
              <h3 className="font-semibold text-charcoal-900 dark:text-white flex items-center gap-2">
                Meta Description
                {currentMeta?.description && getComparisonIcon(
                  compareLength(currentMeta.description.length, competitorMeta.descriptionLength, 'description')
                )}
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Your Description */}
                <div className="p-4 bg-charcoal-50 dark:bg-charcoal-900 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-charcoal-500 dark:text-charcoal-400">Your Description</span>
                    <span className={`text-xs font-medium ${
                      currentMeta?.description?.length >= 150 && currentMeta?.description?.length <= 160
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {currentMeta?.description?.length || 0} chars
                    </span>
                  </div>
                  <p className="text-sm text-charcoal-700 dark:text-charcoal-300">
                    {currentMeta?.description || 'No description set'}
                  </p>
                </div>

                {/* Competitor Description */}
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Competitor Description</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${
                        competitorMeta.descriptionLength >= 150 && competitorMeta.descriptionLength <= 160
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {competitorMeta.descriptionLength} chars
                      </span>
                      <button
                        onClick={() => handleCopy(competitorMeta.description)}
                        className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded"
                      >
                        <Copy className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-charcoal-700 dark:text-charcoal-300">
                    {competitorMeta.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Keywords Found */}
            <div className="space-y-3">
              <h3 className="font-semibold text-charcoal-900 dark:text-white">Keywords Detected</h3>
              <div className="flex flex-wrap gap-2">
                {competitorMeta.keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Social Meta */}
            <div className="space-y-3">
              <h3 className="font-semibold text-charcoal-900 dark:text-white">Social Meta Tags</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-charcoal-50 dark:bg-charcoal-900 rounded-lg text-center">
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">OG Title</p>
                  {competitorMeta.ogTitle ? (
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  )}
                </div>
                <div className="p-3 bg-charcoal-50 dark:bg-charcoal-900 rounded-lg text-center">
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">OG Image</p>
                  {competitorMeta.ogImage ? (
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  )}
                </div>
                <div className="p-3 bg-charcoal-50 dark:bg-charcoal-900 rounded-lg text-center">
                  <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mb-1">Twitter Card</p>
                  {competitorMeta.twitterCard ? (
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : (
                    <X className="w-5 h-5 text-red-500 mx-auto" />
                  )}
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-primary-900 dark:text-primary-300 mb-2">Insights</h4>
                  <ul className="text-sm text-primary-800 dark:text-primary-400 space-y-1">
                    <li>• Competitor uses action-oriented language in their title</li>
                    <li>• Their description includes social proof (&quot;10,000+ satisfied customers&quot;)</li>
                    <li>• They have complete Open Graph implementation for social sharing</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="pt-4 border-t border-charcoal-100 dark:border-charcoal-700">
              <button
                onClick={exportComparisonPDF}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Comparison Report (PDF)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
