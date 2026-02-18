/**
 * ReadabilityLLMColumn
 * Single LLM extraction display column with collapsible sections.
 * BRD: US-2.3.1-2.3.3, FR-3.1
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Clock,
  AlertCircle,
  RefreshCw,
  Tag,
  FileText,
  Heading,
  Target,
  AlertTriangle,
  Star,
} from 'lucide-react';

function CollapsibleSection({ title, icon: Icon, children, defaultOpen = true, id }) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `llm-section-${id}`;
  const headerId = `llm-header-${id}`;

  return (
    <div className="border-t border-gray-100 dark:border-charcoal-700 first:border-t-0">
      <button
        id={headerId}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={panelId}
        className="w-full flex items-center gap-2 p-3 text-left hover:bg-gray-50 dark:hover:bg-charcoal-750 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500"
      >
        {Icon && <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
          {title}
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-gray-400" aria-hidden="true" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" aria-hidden="true" />
        )}
      </button>
      {open && (
        <div id={panelId} role="region" aria-labelledby={headerId} className="px-3 pb-3">
          {children}
        </div>
      )}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-charcoal-700 rounded w-3/4" />
      <div className="h-3 bg-gray-200 dark:bg-charcoal-700 rounded w-full" />
      <div className="h-3 bg-gray-200 dark:bg-charcoal-700 rounded w-5/6" />
      <div className="h-3 bg-gray-200 dark:bg-charcoal-700 rounded w-2/3" />
      <div className="h-20 bg-gray-200 dark:bg-charcoal-700 rounded w-full mt-4" />
      <div className="h-3 bg-gray-200 dark:bg-charcoal-700 rounded w-1/2" />
    </div>
  );
}

export default function ReadabilityLLMColumn({
  llmKey,
  llmName,
  llmModel,
  extraction,
  animationDelay = 0,
  onRetry,
}) {
  const [visible, setVisible] = useState(false);
  const reducedMotion = useRef(
    typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (reducedMotion.current) {
      setVisible(true);
    } else {
      const timer = setTimeout(() => setVisible(true), animationDelay);
      return () => clearTimeout(timer);
    }
  }, [animationDelay]);

  // Loading state
  if (!extraction) {
    return (
      <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-charcoal-700">
          <h4 className="font-semibold text-gray-900 dark:text-white">{llmName}</h4>
          <p className="text-xs text-gray-400 dark:text-gray-500">{llmModel}</p>
        </div>
        <SkeletonLoader />
      </div>
    );
  }

  // Error state
  if (extraction.error) {
    return (
      <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-red-200 dark:border-red-800/30 overflow-hidden">
        <div className="p-4 border-b border-red-100 dark:border-red-800/20">
          <h4 className="font-semibold text-gray-900 dark:text-white">{llmName}</h4>
          <p className="text-xs text-gray-400 dark:text-gray-500">{llmModel}</p>
        </div>
        <div className="p-6 text-center">
          <AlertCircle className="w-8 h-8 text-red-400 dark:text-red-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
            Extraction Failed
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mb-3">
            {extraction.error}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={() => onRetry(llmKey)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 overflow-hidden transition-all ${
        reducedMotion.current
          ? 'opacity-100'
          : visible
          ? 'opacity-100 translate-y-0 duration-300'
          : 'opacity-0 translate-y-2'
      }`}
    >
      {/* Column header */}
      <div className="p-4 border-b border-gray-100 dark:border-charcoal-700 bg-gray-50 dark:bg-charcoal-850">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{llmName}</h4>
            <p className="text-xs text-gray-400 dark:text-gray-500">{llmModel}</p>
          </div>
          {extraction.processingTime && (
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              {typeof extraction.processingTime === 'number'
                ? `${(extraction.processingTime / 1000).toFixed(1)}s`
                : extraction.processingTime}
            </span>
          )}
        </div>
      </div>

      {/* Sections */}
      <div>
        {/* Title */}
        {extraction.title && (
          <CollapsibleSection title="Title" icon={Heading} id={`${llmKey}-title`}>
            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
              {extraction.title}
            </p>
          </CollapsibleSection>
        )}

        {/* Description */}
        {extraction.description && (
          <CollapsibleSection title="Description" icon={FileText} id={`${llmKey}-desc`}>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {extraction.description}
            </p>
          </CollapsibleSection>
        )}

        {/* Primary topic */}
        {extraction.primaryTopic && (
          <CollapsibleSection title="Primary Topic" icon={Target} id={`${llmKey}-topic`}>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {extraction.primaryTopic}
            </p>
          </CollapsibleSection>
        )}

        {/* Main content */}
        {extraction.mainContent && (
          <CollapsibleSection title="Main Content" icon={FileText} id={`${llmKey}-content`} defaultOpen={false}>
            <div className="max-h-64 overflow-y-auto text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap font-mono text-xs leading-relaxed bg-gray-50 dark:bg-charcoal-900 p-3 rounded-lg">
              {extraction.mainContent}
            </div>
          </CollapsibleSection>
        )}

        {/* Entities */}
        {extraction.entities && extraction.entities.length > 0 && (
          <CollapsibleSection title="Entities" icon={Tag} id={`${llmKey}-entities`}>
            <div className="flex flex-wrap gap-1.5">
              {extraction.entities.map((entity, i) => (
                <span
                  key={i}
                  className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-300 border border-teal-100 dark:border-teal-800/30"
                >
                  {typeof entity === 'string' ? entity : entity.name || entity.text || String(entity)}
                </span>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Unprocessable content */}
        {extraction.unprocessableContent && extraction.unprocessableContent.length > 0 && (
          <CollapsibleSection title="Unprocessable Content" icon={AlertTriangle} id={`${llmKey}-unproc`} defaultOpen={false}>
            <ul className="space-y-2">
              {extraction.unprocessableContent.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {typeof item === 'string' ? item : item.element || item.content || String(item)}
                    </p>
                    {item.reason && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.reason}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CollapsibleSection>
        )}

        {/* Usefulness score */}
        {(extraction.usefulnessScore !== undefined || extraction.usefulness !== undefined) && (
          <CollapsibleSection title="Usefulness Score" icon={Star} id={`${llmKey}-useful`}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 10 }, (_, i) => {
                  const score = extraction.usefulnessScore ?? extraction.usefulness ?? 0;
                  return (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-sm ${
                        i < score
                          ? score >= 7
                            ? 'bg-emerald-400 dark:bg-emerald-500'
                            : score >= 4
                            ? 'bg-amber-400 dark:bg-amber-500'
                            : 'bg-red-400 dark:bg-red-500'
                          : 'bg-gray-200 dark:bg-charcoal-700'
                      }`}
                      aria-hidden="true"
                    />
                  );
                })}
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {extraction.usefulnessScore ?? extraction.usefulness ?? 'N/A'}/10
              </span>
            </div>
            {extraction.usefulnessExplanation && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {extraction.usefulnessExplanation}
              </p>
            )}
          </CollapsibleSection>
        )}
      </div>
    </div>
  );
}
