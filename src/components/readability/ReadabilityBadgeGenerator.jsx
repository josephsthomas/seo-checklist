/**
 * E-047: Embeddable AI Readability Badge
 * Generates an SVG badge for embedding on websites
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Copy, Code, Image } from 'lucide-react';
import DOMPurify from 'dompurify';
import toast from 'react-hot-toast';

function getGradeColor(score) {
  if (score >= 90) return '#10B981';
  if (score >= 80) return '#14B8A6';
  if (score >= 70) return '#F59E0B';
  if (score >= 60) return '#F97316';
  return '#EF4444';
}

function getGradeLetter(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'A-';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function generateBadgeSVG(score) {
  const color = getGradeColor(score);
  const grade = getGradeLetter(score);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="28" viewBox="0 0 160 28">
  <rect rx="4" width="160" height="28" fill="#333"/>
  <rect rx="4" x="108" width="52" height="28" fill="${color}"/>
  <rect x="108" width="4" height="28" fill="${color}"/>
  <g fill="#fff" font-family="Verdana,sans-serif" font-size="11">
    <text x="8" y="19">AI Readability</text>
    <text x="118" y="19" font-weight="bold">${grade} | ${score}</text>
  </g>
</svg>`;
}

export default function ReadabilityBadgeGenerator({ score, shareUrl }) {
  const [format, setFormat] = useState('html');

  const badgeSVG = useMemo(() => generateBadgeSVG(score), [score]);

  const embedCode = useMemo(() => {
    const svgDataUrl = `data:image/svg+xml,${encodeURIComponent(badgeSVG)}`;
    if (format === 'html') {
      return shareUrl
        ? `<a href="${shareUrl}" target="_blank" rel="noopener"><img src="${svgDataUrl}" alt="AI Readability Score: ${score}" /></a>`
        : `<img src="${svgDataUrl}" alt="AI Readability Score: ${score}" />`;
    }
    if (format === 'markdown') {
      return shareUrl
        ? `[![AI Readability Score: ${score}](${svgDataUrl})](${shareUrl})`
        : `![AI Readability Score: ${score}](${svgDataUrl})`;
    }
    return badgeSVG;
  }, [score, shareUrl, format, badgeSVG]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      toast.success('Badge code copied!');
    } catch {
      toast.error('Could not copy');
    }
  }, [embedCode]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Image className="w-5 h-5 text-teal-500" aria-hidden="true" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Embeddable Badge
        </h3>
      </div>

      {/* Badge preview */}
      <div
        className="flex justify-center p-4 bg-gray-50 dark:bg-charcoal-700/50 rounded-lg"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(badgeSVG, { USE_PROFILES: { svg: true } }) }}
      />

      {/* Format toggle */}
      <div className="flex gap-2">
        {['html', 'markdown', 'svg'].map(f => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
              format === f
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 dark:bg-charcoal-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Embed code */}
      <div className="relative">
        <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto max-h-24">
          <code>{embedCode}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          title="Copy embed code"
        >
          <Copy className="w-3.5 h-3.5 text-gray-300" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
