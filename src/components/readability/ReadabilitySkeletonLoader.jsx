/**
 * E-037: Progressive Loading Dashboard
 * Skeleton loader components for progressive rendering
 * Shows placeholders while sections load asynchronously
 */

import React from 'react';

function Skeleton({ className = '', width, height }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-charcoal-700 rounded ${className}`}
      style={{ width, height }}
      role="presentation"
      aria-hidden="true"
    />
  );
}

export function ScoreCardSkeleton() {
  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-6">
        {/* Score circle */}
        <Skeleton className="rounded-full" width={120} height={120} />
        <div className="flex-1 space-y-3">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={14} />
          <Skeleton width="80%" height={14} />
        </div>
      </div>
    </div>
  );
}

export function CategoryChartSkeleton() {
  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-xl p-6 shadow-sm space-y-4">
      <Skeleton width="50%" height={18} />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton width="30%" height={14} />
            <Skeleton className="flex-1" height={20} />
            <Skeleton width={40} height={14} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LLMPreviewSkeleton() {
  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-xl p-6 shadow-sm space-y-4">
      <Skeleton width="60%" height={18} />
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton width="80%" height={16} />
            <Skeleton height={100} />
            <Skeleton width="60%" height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecommendationsSkeleton() {
  return (
    <div className="bg-white dark:bg-charcoal-800 rounded-xl p-6 shadow-sm space-y-4">
      <Skeleton width="50%" height={18} />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 border border-gray-100 dark:border-charcoal-700 rounded-lg">
          <Skeleton width={24} height={24} className="rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height={14} />
            <Skeleton width="90%" height={12} />
            <Skeleton width="40%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CheckListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton width={20} height={20} className="rounded-full" />
          <Skeleton className="flex-1" height={14} />
          <Skeleton width={60} height={14} />
        </div>
      ))}
    </div>
  );
}

export default {
  ScoreCardSkeleton,
  CategoryChartSkeleton,
  LLMPreviewSkeleton,
  RecommendationsSkeleton,
  CheckListSkeleton
};
