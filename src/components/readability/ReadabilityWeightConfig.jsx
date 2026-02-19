/**
 * E-007: Custom Category Weight Configuration
 * Allows users to adjust the 5 category weights via sliders
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Sliders, RotateCcw } from 'lucide-react';

const DEFAULT_WEIGHTS = {
  contentStructure: 20,
  contentClarity: 25,
  technicalAccess: 20,
  metadataSchema: 15,
  aiSignals: 20,
};

const CATEGORY_LABELS = {
  contentStructure: 'Content Structure',
  contentClarity: 'Content Clarity',
  technicalAccess: 'Technical Accessibility',
  metadataSchema: 'Metadata & Schema',
  aiSignals: 'AI-Specific Signals',
};

export default function ReadabilityWeightConfig({ weights, onChange }) {
  const [localWeights, setLocalWeights] = useState(weights || DEFAULT_WEIGHTS);

  const total = useMemo(
    () => Object.values(localWeights).reduce((sum, v) => sum + v, 0),
    [localWeights]
  );

  const isValid = total === 100;

  const handleChange = useCallback((key, value) => {
    const next = { ...localWeights, [key]: Number(value) };
    setLocalWeights(next);
  }, [localWeights]);

  const handleApply = useCallback(() => {
    if (isValid) onChange?.(localWeights);
  }, [localWeights, isValid, onChange]);

  const handleReset = useCallback(() => {
    setLocalWeights(DEFAULT_WEIGHTS);
    onChange?.(DEFAULT_WEIGHTS);
  }, [onChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-teal-500" aria-hidden="true" />
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Category Weights</h4>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-teal-600 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" aria-hidden="true" />
          Reset defaults
        </button>
      </div>

      {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
            <span className="font-mono text-gray-700 dark:text-gray-300">{localWeights[key]}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="40"
            step="5"
            value={localWeights[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full h-2 bg-gray-200 dark:bg-charcoal-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
            aria-label={`${label} weight: ${localWeights[key]}%`}
          />
        </div>
      ))}

      <div className={`text-xs text-center font-medium ${isValid ? 'text-emerald-600' : 'text-red-600'}`}>
        Total: {total}% {isValid ? '(valid)' : '(must equal 100%)'}
      </div>

      <button
        onClick={handleApply}
        disabled={!isValid}
        className="w-full px-3 py-2 text-sm bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Apply Weights
      </button>
    </div>
  );
}
