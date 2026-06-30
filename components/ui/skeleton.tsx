import { cn } from '@/lib/utils';

/**
 * Generic shimmer placeholder. Wraps the shared `.skeleton` look as a component
 * so loading UIs stay consistent across pages. Pass sizing via `className`.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-gray-100', className)} />;
}

/**
 * Card-shaped placeholder that mirrors a FranchiseCard's layout while the
 * catalog loads, so the page does not jump when the real data arrives.
 */
export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-3 w-40" />
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="mt-4 h-3 w-24" />
    </div>
  );
}
