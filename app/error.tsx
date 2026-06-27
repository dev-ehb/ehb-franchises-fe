'use client';

import { ErrorState } from '@/components/ui/error-state';

/**
 * App-level error boundary. Catches render errors in the public segment
 * (landing, public franchise detail, login, callback, change-password) and any
 * route not covered by a more specific boundary. `reset()` re-renders the
 * failed segment.
 */
export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <ErrorState onRetry={() => reset()} className="max-w-md" />
    </div>
  );
}
