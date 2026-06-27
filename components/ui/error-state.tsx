'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  /** When provided, renders a "Try again" button that calls this. */
  onRetry?: () => void;
  className?: string;
}

/**
 * Reusable error UI for failed data loads and caught render errors.
 *
 * Shows a friendly, generic message (never a raw server error or stack trace)
 * plus an optional "Try again" action. Used by the route error boundaries
 * (`app/error.tsx`, `app/(dashboard)/error.tsx`) and by individual pages that
 * handle an RTK Query `isError` state.
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please check your connection and try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[12rem] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center',
        className,
      )}
    >
      <div className="mb-3 rounded-full bg-red-50 p-3 text-red-600">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </div>
  );
}
