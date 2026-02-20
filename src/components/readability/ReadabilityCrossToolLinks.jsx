/**
 * ReadabilityCrossToolLinks
 * Bidirectional deep linking to other tools.
 * BRD: US-2.7.1, O-UX-06
 */

import React from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  Search,
  Code,
  ArrowLeft,
  ArrowRight,
  Wrench,
} from 'lucide-react';

const CROSS_TOOL_LINKS = [
  {
    key: 'audit',
    label: 'Run Technical Audit',
    description: 'Analyze technical SEO factors including crawlability, performance, and indexability.',
    icon: Search,
    path: '/app/audit',
    paramKey: 'url',
  },
  {
    key: 'schema',
    label: 'Generate Schema Markup',
    description: 'Create structured data markup based on detected content type.',
    icon: Code,
    path: '/app/schema',
    paramKey: 'url',
    extraParams: (analysis) => {
      const types = analysis?.checkResults;
      if (types) {
        for (const check of Object.values(types)) {
          if (check.id === 'MS-06' && check.details) {
            const typeMatch = check.details.match(/FAQ|HowTo|Article|Product|Recipe|Event/i);
            if (typeMatch) return { type: typeMatch[0].toLowerCase() };
          }
        }
      }
      return {};
    },
  },
];

export default function ReadabilityCrossToolLinks({ analysis, sourceUrl, checkResults }) {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentUrl = sourceUrl || analysis?.sourceUrl;
  const currentCheckResults = checkResults || analysis?.checkResults;

  // Check if user navigated from another tool
  const fromTool = searchParams.get('from');
  const fromToolLabels = {
    audit: 'Technical Audit',
    schema: 'Schema Generator',
    meta: 'Meta Generator',
  };

  if (!currentUrl && !fromTool) return null;

  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-xl border border-gray-200 dark:border-charcoal-700 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Wrench className="w-5 h-5 text-teal-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Related Tools
        </h3>
      </div>

      {/* Back navigation if came from another tool */}
      {fromTool && fromToolLabels[fromTool] && (
        <Link
          to={`/app/${fromTool}${currentUrl ? `?url=${encodeURIComponent(currentUrl)}` : ''}`}
          className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 hover:underline mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Back to {fromToolLabels[fromTool]}
        </Link>
      )}

      {/* Cross-tool links */}
      {currentUrl && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CROSS_TOOL_LINKS.map((tool) => {
            const Icon = tool.icon;
            const extra = tool.extraParams?.({ checkResults: currentCheckResults }) || {};
            const params = new URLSearchParams({
              [tool.paramKey]: currentUrl,
              from: 'readability',
              ...extra,
            });
            const href = `${tool.path}?${params.toString()}`;

            return (
              <Link
                key={tool.key}
                to={href}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-charcoal-700 hover:border-teal-200 dark:hover:border-teal-800/50 hover:bg-teal-50/50 dark:hover:bg-teal-900/10 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-teal-500 dark:group-hover:text-teal-400 mt-0.5 flex-shrink-0 transition-colors" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                    {tool.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {tool.description}
                  </p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-teal-400 flex-shrink-0 mt-1 transition-colors" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      )}

      {!currentUrl && (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Cross-tool linking is available when analyzing a URL.
        </p>
      )}
    </div>
  );
}
