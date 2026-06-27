'use client';

import './globals.css';

/**
 * Root-level error boundary. Catches crashes in the root layout itself, where
 * the normal `app/error.tsx` cannot render — so this file must provide its own
 * <html>/<body>. Kept intentionally minimal and self-contained.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
          <h1 className="text-lg font-semibold text-gray-900">Something went wrong</h1>
          <p className="mt-2 max-w-sm text-sm text-gray-500">
            The application ran into an unexpected error. Please reload the page.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-4 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
