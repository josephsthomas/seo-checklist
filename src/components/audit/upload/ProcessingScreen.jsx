import React from 'react';
import { FileArchive, Search, BarChart2, CheckCircle } from 'lucide-react';

const STAGES = [
  { id: 'extracting', label: 'Extracting Files', icon: FileArchive },
  { id: 'parsing', label: 'Parsing Data', icon: Search },
  { id: 'analyzing', label: 'Running Audit', icon: BarChart2 },
  { id: 'complete', label: 'Complete', icon: CheckCircle }
];

export default function ProcessingScreen({ progress, stage, message, fileName }) {
  const currentStageIndex = STAGES.findIndex(s => s.id === stage);

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Animated Progress Ring */}
          <div className="relative w-36 h-36 mx-auto mb-8">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="72"
                cy="72"
                r="64"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="10"
              />
              {/* Progress circle */}
              <circle
                cx="72"
                cy="72"
                r="64"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 64}`}
                strokeDashoffset={`${2 * Math.PI * 64 * (1 - progress / 100)}`}
                className="transition-all duration-500 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00D4FF" />
                  <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-charcoal-900">{progress}%</span>
            </div>
          </div>

          {/* Stage Label */}
          <h2 className="text-2xl font-bold text-charcoal-900 mb-2">
            {STAGES.find(s => s.id === stage)?.label || 'Processing...'}
          </h2>

          {/* Current Message */}
          <p className="text-charcoal-600 mb-8">{message}</p>

          {/* File Name */}
          {fileName && (
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-white rounded-xl border border-charcoal-200 shadow-sm mb-8">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                <FileArchive className="w-4 h-4 text-cyan-600" />
              </div>
              <span className="text-sm font-medium text-charcoal-700">{fileName}</span>
            </div>
          )}

          {/* Stage Progress Indicators */}
          <div className="flex justify-center items-center gap-3 sm:gap-4">
            {STAGES.map((s, index) => {
              const Icon = s.icon;
              const isActive = index === currentStageIndex;
              const isComplete = index < currentStageIndex;
              const isPending = index > currentStageIndex;

              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm
                        ${isComplete ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/20' : ''}
                        ${isActive ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-cyan-500/30 ring-4 ring-cyan-500/20' : ''}
                        ${isPending ? 'bg-charcoal-100' : ''}
                      `}
                    >
                      <Icon
                        className={`w-5 h-5 transition-colors duration-300
                          ${isComplete ? 'text-white' : ''}
                          ${isActive ? 'text-white animate-pulse' : ''}
                          ${isPending ? 'text-charcoal-400' : ''}
                        `}
                      />
                    </div>
                    <span
                      className={`text-xs mt-2 hidden sm:block font-medium
                        ${isComplete ? 'text-emerald-600' : ''}
                        ${isActive ? 'text-cyan-600' : ''}
                        ${isPending ? 'text-charcoal-400' : ''}
                      `}
                    >
                      {s.label}
                    </span>
                  </div>

                  {/* Connector Line */}
                  {index < STAGES.length - 1 && (
                    <div
                      className={`w-8 sm:w-12 h-1 rounded-full hidden sm:block transition-colors duration-300
                        ${index < currentStageIndex ? 'bg-emerald-400' : 'bg-charcoal-200'}
                      `}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Processing Tips */}
          <div className="mt-12 card p-6 text-left bg-gradient-to-br from-charcoal-50 to-white">
            <h3 className="font-bold text-charcoal-900 mb-4">While you wait...</h3>
            <ul className="text-sm text-charcoal-600 space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                <span>Large exports (50K+ URLs) may take a few minutes to process</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                <span>Processing happens in your browser - your data stays private</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-1.5 flex-shrink-0" />
                <span>The audit covers 31 categories including Core Web Vitals</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
