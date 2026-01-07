/**
 * Base Skeleton component with shimmer animation
 */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-charcoal-100 via-charcoal-50 to-charcoal-100 bg-[length:200%_100%] animate-shimmer rounded ${className}`}
      {...props}
    />
  );
}

/**
 * Text line skeleton
 */
export function SkeletonText({ lines = 1, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

/**
 * Avatar skeleton
 */
export function SkeletonAvatar({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <Skeleton className={`${sizes[size]} rounded-full ${className}`} />
  );
}

/**
 * Button skeleton
 */
export function SkeletonButton({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32'
  };

  return (
    <Skeleton className={`${sizes[size]} rounded-xl ${className}`} />
  );
}

/**
 * Card skeleton for dashboard cards
 */
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

/**
 * Stat card skeleton
 */
export function SkeletonStatCard({ className = '' }) {
  return (
    <div className={`card p-5 ${className}`}>
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div>
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Tool card skeleton
 */
export function SkeletonToolCard({ className = '' }) {
  return (
    <div className={`card p-6 ${className}`}>
      <Skeleton className="w-14 h-14 rounded-2xl mb-5" />
      <Skeleton className="h-6 w-32 mb-2" />
      <SkeletonText lines={3} className="mb-5" />
      <div className="flex items-center gap-6 mb-5 pb-5 border-b border-charcoal-100">
        <div>
          <Skeleton className="h-8 w-12 mb-1" />
          <Skeleton className="h-3 w-10" />
        </div>
        <div>
          <Skeleton className="h-8 w-12 mb-1" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}

/**
 * Table row skeleton
 */
export function SkeletonTableRow({ columns = 4, className = '' }) {
  return (
    <div className={`flex items-center gap-4 py-4 px-4 border-b border-charcoal-100 ${className}`}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === 0 ? 'w-48' : 'flex-1'}`}
        />
      ))}
    </div>
  );
}

/**
 * Table skeleton
 */
export function SkeletonTable({ rows = 5, columns = 4, className = '' }) {
  return (
    <div className={`card overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-4 py-3 px-4 bg-charcoal-50 border-b border-charcoal-200">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-4 ${i === 0 ? 'w-32' : 'flex-1'}`}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} columns={columns} />
      ))}
    </div>
  );
}

/**
 * List item skeleton
 */
export function SkeletonListItem({ className = '' }) {
  return (
    <div className={`flex items-center gap-4 p-4 ${className}`}>
      <Skeleton className="w-3 h-3 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-5 w-48 mb-1" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
  );
}

/**
 * Project list skeleton
 */
export function SkeletonProjectList({ count = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListItem key={i} />
      ))}
    </div>
  );
}

/**
 * Page header skeleton
 */
export function SkeletonPageHeader({ className = '' }) {
  return (
    <div className={`mb-8 ${className}`}>
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-10 w-64 mb-3" />
      <Skeleton className="h-5 w-96" />
    </div>
  );
}

/**
 * Full page skeleton for lazy-loaded pages
 */
export function SkeletonPage({ className = '' }) {
  return (
    <div className={`min-h-screen bg-gradient-to-b from-charcoal-50 to-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SkeletonPageHeader />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonToolCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
