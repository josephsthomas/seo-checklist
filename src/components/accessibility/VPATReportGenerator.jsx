import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
  MinusCircle,
  Eye,
  Printer,
  Mail,
  ChevronDown,
  ChevronRight,
  Building,
  Calendar,
  User,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// VPAT Conformance Levels
const CONFORMANCE_LEVELS = {
  SUPPORTS: { label: 'Supports', color: 'emerald', icon: Check },
  PARTIALLY_SUPPORTS: { label: 'Partially Supports', color: 'amber', icon: AlertTriangle },
  DOES_NOT_SUPPORT: { label: 'Does Not Support', color: 'red', icon: X },
  NOT_APPLICABLE: { label: 'Not Applicable', color: 'charcoal', icon: MinusCircle },
  NOT_EVALUATED: { label: 'Not Evaluated', color: 'charcoal', icon: AlertCircle },
};

// WCAG 2.1 Level A and AA Criteria
const WCAG_CRITERIA = [
  // Perceivable
  { id: '1.1.1', title: 'Non-text Content', level: 'A', principle: 'Perceivable' },
  { id: '1.2.1', title: 'Audio-only and Video-only', level: 'A', principle: 'Perceivable' },
  { id: '1.2.2', title: 'Captions (Prerecorded)', level: 'A', principle: 'Perceivable' },
  { id: '1.2.3', title: 'Audio Description or Media Alternative', level: 'A', principle: 'Perceivable' },
  { id: '1.2.4', title: 'Captions (Live)', level: 'AA', principle: 'Perceivable' },
  { id: '1.2.5', title: 'Audio Description (Prerecorded)', level: 'AA', principle: 'Perceivable' },
  { id: '1.3.1', title: 'Info and Relationships', level: 'A', principle: 'Perceivable' },
  { id: '1.3.2', title: 'Meaningful Sequence', level: 'A', principle: 'Perceivable' },
  { id: '1.3.3', title: 'Sensory Characteristics', level: 'A', principle: 'Perceivable' },
  { id: '1.3.4', title: 'Orientation', level: 'AA', principle: 'Perceivable' },
  { id: '1.3.5', title: 'Identify Input Purpose', level: 'AA', principle: 'Perceivable' },
  { id: '1.4.1', title: 'Use of Color', level: 'A', principle: 'Perceivable' },
  { id: '1.4.2', title: 'Audio Control', level: 'A', principle: 'Perceivable' },
  { id: '1.4.3', title: 'Contrast (Minimum)', level: 'AA', principle: 'Perceivable' },
  { id: '1.4.4', title: 'Resize Text', level: 'AA', principle: 'Perceivable' },
  { id: '1.4.5', title: 'Images of Text', level: 'AA', principle: 'Perceivable' },
  { id: '1.4.10', title: 'Reflow', level: 'AA', principle: 'Perceivable' },
  { id: '1.4.11', title: 'Non-text Contrast', level: 'AA', principle: 'Perceivable' },
  { id: '1.4.12', title: 'Text Spacing', level: 'AA', principle: 'Perceivable' },
  { id: '1.4.13', title: 'Content on Hover or Focus', level: 'AA', principle: 'Perceivable' },
  // Operable
  { id: '2.1.1', title: 'Keyboard', level: 'A', principle: 'Operable' },
  { id: '2.1.2', title: 'No Keyboard Trap', level: 'A', principle: 'Operable' },
  { id: '2.1.4', title: 'Character Key Shortcuts', level: 'A', principle: 'Operable' },
  { id: '2.2.1', title: 'Timing Adjustable', level: 'A', principle: 'Operable' },
  { id: '2.2.2', title: 'Pause, Stop, Hide', level: 'A', principle: 'Operable' },
  { id: '2.3.1', title: 'Three Flashes or Below Threshold', level: 'A', principle: 'Operable' },
  { id: '2.4.1', title: 'Bypass Blocks', level: 'A', principle: 'Operable' },
  { id: '2.4.2', title: 'Page Titled', level: 'A', principle: 'Operable' },
  { id: '2.4.3', title: 'Focus Order', level: 'A', principle: 'Operable' },
  { id: '2.4.4', title: 'Link Purpose (In Context)', level: 'A', principle: 'Operable' },
  { id: '2.4.5', title: 'Multiple Ways', level: 'AA', principle: 'Operable' },
  { id: '2.4.6', title: 'Headings and Labels', level: 'AA', principle: 'Operable' },
  { id: '2.4.7', title: 'Focus Visible', level: 'AA', principle: 'Operable' },
  { id: '2.5.1', title: 'Pointer Gestures', level: 'A', principle: 'Operable' },
  { id: '2.5.2', title: 'Pointer Cancellation', level: 'A', principle: 'Operable' },
  { id: '2.5.3', title: 'Label in Name', level: 'A', principle: 'Operable' },
  { id: '2.5.4', title: 'Motion Actuation', level: 'A', principle: 'Operable' },
  // Understandable
  { id: '3.1.1', title: 'Language of Page', level: 'A', principle: 'Understandable' },
  { id: '3.1.2', title: 'Language of Parts', level: 'AA', principle: 'Understandable' },
  { id: '3.2.1', title: 'On Focus', level: 'A', principle: 'Understandable' },
  { id: '3.2.2', title: 'On Input', level: 'A', principle: 'Understandable' },
  { id: '3.2.3', title: 'Consistent Navigation', level: 'AA', principle: 'Understandable' },
  { id: '3.2.4', title: 'Consistent Identification', level: 'AA', principle: 'Understandable' },
  { id: '3.3.1', title: 'Error Identification', level: 'A', principle: 'Understandable' },
  { id: '3.3.2', title: 'Labels or Instructions', level: 'A', principle: 'Understandable' },
  { id: '3.3.3', title: 'Error Suggestion', level: 'AA', principle: 'Understandable' },
  { id: '3.3.4', title: 'Error Prevention (Legal, Financial, Data)', level: 'AA', principle: 'Understandable' },
  // Robust
  { id: '4.1.1', title: 'Parsing', level: 'A', principle: 'Robust' },
  { id: '4.1.2', title: 'Name, Role, Value', level: 'A', principle: 'Robust' },
  { id: '4.1.3', title: 'Status Messages', level: 'AA', principle: 'Robust' },
];

export default function VPATReportGenerator({ auditResults, productInfo, onClose }) {
  const [showPreview, setShowPreview] = useState(true);
  const [expandedPrinciples, setExpandedPrinciples] = useState(['Perceivable', 'Operable', 'Understandable', 'Robust']);
  const [evaluationData, setEvaluationData] = useState(() => {
    // Map audit results to VPAT criteria
    const initial = {};
    WCAG_CRITERIA.forEach(criterion => {
      initial[criterion.id] = {
        conformance: 'NOT_EVALUATED',
        remarks: '',
      };
    });
    return initial;
  });

  // Group criteria by principle
  const groupedCriteria = useMemo(() => {
    const groups = {};
    WCAG_CRITERIA.forEach(criterion => {
      if (!groups[criterion.principle]) {
        groups[criterion.principle] = [];
      }
      groups[criterion.principle].push(criterion);
    });
    return groups;
  }, []);

  // Calculate summary stats
  const summary = useMemo(() => {
    const stats = {
      total: WCAG_CRITERIA.length,
      supports: 0,
      partiallySupports: 0,
      doesNotSupport: 0,
      notApplicable: 0,
      notEvaluated: 0,
    };

    Object.values(evaluationData).forEach(data => {
      if (data.conformance === 'SUPPORTS') stats.supports++;
      else if (data.conformance === 'PARTIALLY_SUPPORTS') stats.partiallySupports++;
      else if (data.conformance === 'DOES_NOT_SUPPORT') stats.doesNotSupport++;
      else if (data.conformance === 'NOT_APPLICABLE') stats.notApplicable++;
      else stats.notEvaluated++;
    });

    return stats;
  }, [evaluationData]);

  const togglePrinciple = (principle) => {
    setExpandedPrinciples(prev =>
      prev.includes(principle)
        ? prev.filter(p => p !== principle)
        : [...prev, principle]
    );
  };

  const updateConformance = (criterionId, conformance) => {
    setEvaluationData(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], conformance }
    }));
  };

  const updateRemarks = (criterionId, remarks) => {
    setEvaluationData(prev => ({
      ...prev,
      [criterionId]: { ...prev[criterionId], remarks }
    }));
  };

  const handleExport = () => {
    // In production, this would generate a proper VPAT document
    toast.success('VPAT Report export coming soon!');
  };

  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-2xl shadow-xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal-900 dark:text-white">VPAT Report Generator</h2>
            <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
              Voluntary Product Accessibility Template (WCAG 2.1)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export VPAT
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-charcoal-300 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 border-b border-charcoal-100 dark:border-charcoal-700 bg-charcoal-50 dark:bg-charcoal-900/50">
        <div className="grid grid-cols-5 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.supports}</p>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Supports</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.partiallySupports}</p>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Partial</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{summary.doesNotSupport}</p>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Does Not</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-charcoal-500 dark:text-charcoal-400">{summary.notApplicable}</p>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">N/A</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-charcoal-400 dark:text-charcoal-500">{summary.notEvaluated}</p>
            <p className="text-xs text-charcoal-500 dark:text-charcoal-400">Not Evaluated</p>
          </div>
        </div>
      </div>

      {/* Criteria List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(groupedCriteria).map(([principle, criteria]) => (
          <div key={principle} className="border-b border-charcoal-100 dark:border-charcoal-700 last:border-b-0">
            <button
              onClick={() => togglePrinciple(principle)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-charcoal-50 dark:hover:bg-charcoal-800/50 transition-colors"
            >
              <h3 className="font-semibold text-charcoal-900 dark:text-white">
                {principle}
                <span className="ml-2 text-sm font-normal text-charcoal-500 dark:text-charcoal-400">
                  ({criteria.length} criteria)
                </span>
              </h3>
              {expandedPrinciples.includes(principle) ? (
                <ChevronDown className="w-5 h-5 text-charcoal-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-charcoal-400" />
              )}
            </button>

            {expandedPrinciples.includes(principle) && (
              <div className="px-6 pb-4 space-y-3">
                {criteria.map((criterion) => {
                  const data = evaluationData[criterion.id];
                  const conformanceConfig = CONFORMANCE_LEVELS[data.conformance];

                  return (
                    <div key={criterion.id} className="p-4 rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-white dark:bg-charcoal-800">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-mono font-medium text-charcoal-500 dark:text-charcoal-400">
                              {criterion.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              criterion.level === 'A'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            }`}>
                              Level {criterion.level}
                            </span>
                          </div>
                          <h4 className="font-medium text-charcoal-900 dark:text-white mb-2">
                            {criterion.title}
                          </h4>

                          {/* Conformance Select */}
                          <div className="flex items-center gap-3 mb-2">
                            <select
                              value={data.conformance}
                              onChange={(e) => updateConformance(criterion.id, e.target.value)}
                              className={`select text-sm py-1.5 ${
                                conformanceConfig.color === 'emerald' ? 'border-emerald-300' :
                                conformanceConfig.color === 'amber' ? 'border-amber-300' :
                                conformanceConfig.color === 'red' ? 'border-red-300' : ''
                              }`}
                            >
                              {Object.entries(CONFORMANCE_LEVELS).map(([key, config]) => (
                                <option key={key} value={key}>{config.label}</option>
                              ))}
                            </select>
                          </div>

                          {/* Remarks */}
                          <textarea
                            value={data.remarks}
                            onChange={(e) => updateRemarks(criterion.id, e.target.value)}
                            placeholder="Add remarks or explanations..."
                            className="input text-sm py-2 min-h-[60px] resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-charcoal-100 dark:border-charcoal-700 flex items-center justify-between bg-charcoal-50 dark:bg-charcoal-900/50">
        <div className="text-sm text-charcoal-500 dark:text-charcoal-400">
          <Calendar className="w-4 h-4 inline-block mr-1" />
          Report Date: {format(new Date(), 'MMMM d, yyyy')}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleExport}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export VPAT
          </button>
        </div>
      </div>
    </div>
  );
}
