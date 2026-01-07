import { Image, Loader2, Sparkles } from 'lucide-react';

export default function ImageAltProcessingScreen({ progress, stage, fileCount }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-8">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Image className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -right-2 -top-2">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Analyzing Images
        </h2>
        <p className="text-slate-400 mb-8">
          {stage || `Processing ${fileCount} image${fileCount !== 1 ? 's' : ''} with Claude Vision AI`}
        </p>

        {/* Progress Bar */}
        <div className="relative mb-4">
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-3 rounded-full opacity-30 animate-pulse bg-gradient-to-r from-emerald-400 to-emerald-600"
              style={{ width: `${Math.min(progress + 10, 100)}%` }}
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
              { label: 'Validating images', threshold: 10 },
              { label: 'Analyzing with Claude Vision', threshold: 30 },
              { label: 'Generating alt text', threshold: 60 },
              { label: 'Creating SEO filenames', threshold: 80 },
              { label: 'Preparing results', threshold: 95 }
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  progress >= step.threshold
                    ? 'bg-emerald-400'
                    : progress >= step.threshold - 15
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-slate-600'
                }`} />
                <span className={`text-sm ${
                  progress >= step.threshold
                    ? 'text-emerald-400'
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
          Tip: Processing time depends on image count and complexity
        </p>
      </div>
    </div>
  );
}
