/**
 * ReadabilityCodeSnippet
 * Syntax-highlighted code block with copy button. Never uses dangerouslySetInnerHTML.
 * BRD: US-2.4.2, XSS Prevention
 */

import React, { useState, useCallback } from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-HTTPS contexts
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail if copy not available
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 bg-gray-700 hover:bg-gray-600 text-gray-300 dark:bg-charcoal-700 dark:hover:bg-charcoal-600"
      aria-label={copied ? 'Copied to clipboard' : 'Copy code to clipboard'}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" aria-hidden="true" />
          Copy
        </>
      )}
    </button>
  );
}

function CodeBlock({ code, label, language }) {
  if (!code) return null;

  const lines = code.split('\n');

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-800 dark:bg-charcoal-900 rounded-t-lg border-b border-gray-700 dark:border-charcoal-700">
        <div className="flex items-center gap-2">
          {label && (
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
              {label}
            </span>
          )}
          {language && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-700 dark:bg-charcoal-800 text-gray-400 dark:text-gray-500">
              {language}
            </span>
          )}
        </div>
        <CopyButton text={code} />
      </div>

      {/* Code content */}
      <div className="bg-gray-900 dark:bg-charcoal-950 rounded-b-lg overflow-x-auto max-h-64 overflow-y-auto">
        <pre className="p-3 text-sm leading-relaxed">
          <code className="font-mono text-xs">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="select-none text-gray-600 dark:text-gray-700 text-right min-w-[2.5rem] pr-3 flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-gray-200 dark:text-gray-300 whitespace-pre">
                  {line}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

export default function ReadabilityCodeSnippet({
  code,
  before,
  after,
  language = 'html',
  showLineNumbers = true,
}) {
  // Before/after split view
  if (before && after) {
    return (
      <div className="space-y-3">
        <CodeBlock code={before} label="Before" language={language} />
        <div className="flex items-center justify-center">
          <ArrowRight className="w-5 h-5 text-teal-500 dark:text-teal-400" aria-hidden="true" />
          <span className="sr-only">Replace with</span>
        </div>
        <CodeBlock code={after} label="After" language={language} />
      </div>
    );
  }

  // Single code block
  return <CodeBlock code={code || ''} language={language} />;
}
