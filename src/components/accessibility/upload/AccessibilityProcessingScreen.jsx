import React from 'react';
import { FileArchive, CheckCircle, Loader2, Accessibility } from 'lucide-react';

const STAGES = {
  extracting: {
    label: 'Extracting Files',
    description: 'Unpacking your Screaming Frog export...'
  },
  parsing: {
    label: 'Parsing Accessibility Data',
    description: 'Reading violation files and WCAG mappings...'
  },
  analyzing: {
    label: 'Analyzing Compliance',
    description: 'Calculating WCAG 2.2 compliance scores...'
  },
  complete: {
    label: 'Complete',
    description: 'Your accessibility audit is ready!'
  }
};

export default function AccessibilityProcessingScreen({ progress, stage, message, fileName }) {
  const stageInfo = STAGES[stage] || STAGES.extracting;
  const isComplete = stage === 'complete';

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white flex items-center justify-center">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-lg w-full mx-4">
        <div className="card p-8 sm:p-12 text-center">
          {/* Icon */}
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl transition-all duration-500 ${
            isComplete
              ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/25'
              : 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/25'
          }`}>
            {isComplete ? (
              <CheckCircle className="w-10 h-10 text-white" />
            ) : (
              <Accessibility className="w-10 h-10 text-white animate-pulse" />
            )}
          </div>

          {/* Stage Info */}
          <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
            {stageInfo.label}
          </h2>
          <p className="text-charcoal-600 mb-8">
            {message || stageInfo.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-charcoal-500">Progress</span>
              <span className="font-bold text-charcoal-900">{progress}%</span>
            </div>
            <div className="h-3 bg-charcoal-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isComplete
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stage Steps */}
          <div className="space-y-3">
            {Object.entries(STAGES).map(([key, info], index) => {
              const stageOrder = ['extracting', 'parsing', 'analyzing', 'complete'];
              const currentIndex = stageOrder.indexOf(stage);
              const stepIndex = stageOrder.indexOf(key);
              const isPast = stepIndex < currentIndex;
              const isCurrent = stepIndex === currentIndex;

              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isCurrent ? 'bg-purple-50 border border-purple-200' :
                    isPast ? 'bg-emerald-50 border border-emerald-200' :
                    'bg-charcoal-50 border border-transparent'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isPast ? 'bg-emerald-500 text-white' :
                    isCurrent ? 'bg-purple-500 text-white' :
                    'bg-charcoal-200 text-charcoal-400'
                  }`}>
                    {isPast ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    isPast ? 'text-emerald-700' :
                    isCurrent ? 'text-purple-700' :
                    'text-charcoal-400'
                  }`}>
                    {info.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* File Name */}
          {fileName && (
            <div className="mt-8 pt-6 border-t border-charcoal-100">
              <div className="flex items-center justify-center gap-2 text-sm text-charcoal-500">
                <FileArchive className="w-4 h-4" />
                <span className="truncate max-w-xs">{fileName}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
