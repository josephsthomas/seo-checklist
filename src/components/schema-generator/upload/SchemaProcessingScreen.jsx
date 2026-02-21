import { Code2, Loader2, Sparkles } from 'lucide-react';

export default function SchemaProcessingScreen({ progress, stage }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Code2 className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -right-2 -top-2">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Generating Schema
        </h2>
        <p className="text-slate-400 mb-8">
          {stage || 'Analyzing your content...'}
        </p>

        {/* Progress Bar */}
        <div className="relative mb-4">
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500 ease-out"
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
              { label: 'Parsing HTML content', threshold: 15 },
              { label: 'Extracting page structure', threshold: 30 },
              { label: 'Detecting content types', threshold: 45 },
              { label: 'Analyzing with Claude AI', threshold: 60 },
              { label: 'Generating JSON-LD', threshold: 75 },
              { label: 'Validating schema', threshold: 90 },
              { label: 'Preparing results', threshold: 98 }
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  progress >= step.threshold
                    ? 'bg-rose-400'
                    : progress >= step.threshold - 15
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-slate-600'
                }`} />
                <span className={`text-sm ${
                  progress >= step.threshold
                    ? 'text-rose-400'
                    : progress >= step.threshold - 15
                      ? 'text-amber-400'
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
          Tip: AI generates production-ready JSON-LD with required and recommended properties
        </p>

        {/* AI Disclaimer */}
        <p className="mt-3 text-xs text-slate-500">
          Note: Schema markup is AI-generated and should be reviewed for accuracy before deployment.
        </p>
      </div>
    </div>
  );
}
