'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePasswordLoginMutation } from '@/lib/store/api/auth.api';
import { useAppDispatch } from '@/lib/store/hooks';
import { setCredentials } from '@/lib/store/auth.slice';

/**
 * Franchise-owner login. Two paths:
 *
 *   A) Continue with EHB  — EHB SSO. Bounces to EHB Main, which signs an
 *      ehb_token and redirects to /callback?ehb_token=... where we exchange it.
 *      Used by franchise owners whose backoffice assignment was done by
 *      owner_id (existing EHB user).
 *
 *   B) Email + temp password — for buyers who came in via the purchase flow.
 *      Backoffice admin approves the request, generates a temp password, and
 *      forwards it manually. First login flips must_change_password=true so
 *      the UI sends them to /change-password.
 */
export default function LoginPage() {
  const ehbUrl = process.env.NEXT_PUBLIC_EHB_URL ?? 'http://localhost:4000';
  const ssoUrl = `${ehbUrl}/login?redirect=franchises`;

  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = usePasswordLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(
        setCredentials({
          user: { id: res.user.email, email: res.user.email },
          role: res.role,
          franchise_id: res.franchise_id,
          access_token: res.access_token,
        }),
      );
      router.replace(res.must_change_password ? '/change-password' : `/${res.role}`);
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string | string[] } } | undefined)?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Invalid email or password.');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card">
        <h1 className="text-xl font-semibold text-gray-900">EHB Franchises</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your franchise dashboard</p>

        {/* Path A — EHB SSO */}
        <a
          href={ssoUrl}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Continue with EHB
        </a>
        <p className="mt-2 text-xs text-gray-500">
          For franchise owners assigned by EHB backoffice via your EHB account.
        </p>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-gray-200" />
          OR
          <span className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Path B — Email + temp password */}
        <form onSubmit={onPasswordSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Temp password from admin"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg border border-primary-600 bg-white py-2 text-sm font-medium text-primary-700 hover:bg-primary-50 disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Sign in with password'}
          </button>
        </form>
        <p className="mt-3 text-xs text-gray-500">
          Bought a franchise? Use the temporary password the EHB admin emailed you. You&apos;ll be
          asked to change it on first login.
        </p>
      </div>
    </main>
  );
}
