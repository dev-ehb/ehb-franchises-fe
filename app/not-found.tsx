'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Custom 404 page. Replaces Next's default for unknown routes and any
 * `notFound()` call. "Go back" returns to the previous page (so a deep
 * dashboard 404 does not dump the user on the public landing); "Home" is the
 * safe fallback when there is no history to go back to.
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <p className="text-5xl font-bold text-gray-300">404</p>
      <h1 className="mt-3 text-lg font-semibold text-gray-900">Page not found</h1>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        The page you are looking for does not exist or may have moved.
      </p>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Go back
        </button>
        <Link
          href="/"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
