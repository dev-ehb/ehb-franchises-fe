'use client';

import { ErrorState } from '@/components/ui/error-state';

/**
 * Dashboard error boundary. Renders inside the dashboard shell (sidebar +
 * topbar stay visible) so a single page crash does not take down the whole
 * app. `reset()` retries rendering the failed page.
 */
export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorState onRetry={() => reset()} className="mt-6" />;
}
