import React from 'react';
import { Tags, Loader2, Sparkles } from 'lucide-react';

export default function MetaProcessingScreen({ progress, stage, fileName }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Tags className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -right-2 -top-2">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Generating Metadata
        </h2>
        <p className="text-slate-400 mb-2">
          {stage || 'Analyzing your document...'}
        </p>
        {fileName && (
          <p className="text-slate-500 text-sm mb-8">
            {fileName}
          </p>
        )}

        {/* Progress Bar */}
        <div className="relative mb-4">
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Progress Text */}
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{progress}% complete</span>
        </div>

        {/* Processing Steps */}
        <div className="mt-8 text-left bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Processing Steps:</h3>
          <div className="space-y-2">
            {[
              { label: 'Reading document', threshold: 10 },
              { label: 'Extracting content', threshold: 30 },
              { label: 'Analyzing with Claude AI', threshold: 50 },
              { label: 'Generating SEO metadata', threshold: 70 },
              { label: 'Creating social tags', threshold: 85 },
              { label: 'Finalizing results', threshold: 95 }
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  progress >= step.threshold
                    ? 'bg-amber-400'
                    : progress >= step.threshold - 15
                      ? 'bg-purple-400 animate-pulse'
                      : 'bg-slate-600'
                }`} />
                <span className={`text-sm ${
                  progress >= step.threshold
                    ? 'text-amber-400'
                    : progress >= step.threshold - 15
                      ? 'text-purple-400'
                      : 'text-slate-500'
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <p className="mt-6 text-xs text-slate-500">
          Tip: AI generates optimized titles (50-60 chars) and descriptions (150-160 chars)
        </p>
      </div>
    </div>
  );
}
