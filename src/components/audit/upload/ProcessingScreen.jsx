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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        {/* Animated Progress Ring */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="#00cfff"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-900">{progress}%</span>
          </div>
        </div>

        {/* Stage Label */}
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {STAGES.find(s => s.id === stage)?.label || 'Processing...'}
        </h2>

        {/* Current Message */}
        <p className="text-gray-600 mb-8">{message}</p>

        {/* File Name */}
        {fileName && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg mb-8">
            <FileArchive className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{fileName}</span>
          </div>
        )}

        {/* Stage Progress Indicators */}
        <div className="flex justify-center items-center gap-4">
          {STAGES.map((s, index) => {
            const Icon = s.icon;
            const isActive = index === currentStageIndex;
            const isComplete = index < currentStageIndex;
            const isPending = index > currentStageIndex;

            return (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                      ${isComplete ? 'bg-green-100' : ''}
                      ${isActive ? 'bg-cyan-100 ring-2 ring-cyan-400 ring-offset-2' : ''}
                      ${isPending ? 'bg-gray-100' : ''}
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors duration-300
                        ${isComplete ? 'text-green-600' : ''}
                        ${isActive ? 'text-cyan-600 animate-pulse' : ''}
                        ${isPending ? 'text-gray-400' : ''}
                      `}
                    />
                  </div>
                  <span
                    className={`text-xs mt-2 hidden sm:block
                      ${isComplete ? 'text-green-600' : ''}
                      ${isActive ? 'text-cyan-600 font-medium' : ''}
                      ${isPending ? 'text-gray-400' : ''}
                    `}
                  >
                    {s.label}
                  </span>
                </div>

                {/* Connector Line */}
                {index < STAGES.length - 1 && (
                  <div
                    className={`w-12 h-0.5 hidden sm:block
                      ${index < currentStageIndex ? 'bg-green-400' : 'bg-gray-200'}
                    `}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Processing Tips */}
        <div className="mt-12 text-left bg-gray-50 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-3">While you wait...</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-cyan-500">•</span>
              Large exports (50K+ URLs) may take a few minutes to process
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-500">•</span>
              Processing happens in your browser - your data stays private
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-500">•</span>
              The audit covers 31 categories including Core Web Vitals
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
