import { useState } from 'react';
import { HelpCircle, X, ExternalLink, Clock, Award } from 'lucide-react';
import { getHelpContent } from '../../data/helpContent';

export default function HelpTooltip({ itemId, itemTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const helpData = getHelpContent(itemId);

  if (!helpData) return null;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-charcoal-400 hover:text-primary-600 transition-colors"
        title="View help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Tooltip Panel */}
          <div className="absolute left-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-charcoal-200 z-50 max-h-[500px] overflow-y-auto">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-charcoal-900 text-sm mb-1">
                    Help: {itemTitle}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-charcoal-500">
                    {helpData.estimatedTime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {helpData.estimatedTime}
                      </span>
                    )}
                    {helpData.difficulty && (
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {helpData.difficulty}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-charcoal-400 hover:text-charcoal-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-charcoal-700">{helpData.description}</p>
              </div>

              {/* Tips */}
              {helpData.tips && helpData.tips.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-xs font-semibold text-charcoal-900 uppercase mb-2">
                    Pro Tips
                  </h5>
                  <ul className="space-y-1.5">
                    {helpData.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-charcoal-600">
                        <span className="text-primary-600 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resources */}
              {helpData.resources && helpData.resources.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-charcoal-900 uppercase mb-2">
                    Learn More
                  </h5>
                  <div className="space-y-2">
                    {helpData.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between text-sm text-primary-600 hover:text-primary-700 p-2 rounded hover:bg-primary-50 transition-colors"
                      >
                        <span>{resource.title}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
