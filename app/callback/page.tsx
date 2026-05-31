'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/lib/store/hooks';
import { setCredentials } from '@/lib/store/auth.slice';
import { useEhbCallbackMutation } from '@/lib/store/api/auth.api';

/**
 * EHB SSO callback page.
 *
 *   /callback?ehb_token=<jwt> -> POST /auth/ehb-callback
 *   -> store franchise-owner credentials in Redux + sessionStorage
 *   -> redirect to /sub /corporate or /master based on the user's franchise level.
 *
 * The user is here because EHB Main signed them in and forwarded an ehb_token
 * back to this domain. We never see their password.
 */
function CallbackBody() {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useAppDispatch();
  const [ehbCallback] = useEhbCallbackMutation();
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = params.get('ehb_token');
    if (!token) {
      setStatus('error');
      setError('Missing EHB token — try signing in from EHB Main again.');
      return;
    }
    (async () => {
      try {
        const res = await ehbCallback({ ehb_token: token }).unwrap();
        dispatch(
          setCredentials({
            user: { id: res.user.ehb_user_id, email: res.user.email },
            role: res.role,
            franchise_id: res.franchise_id,
            access_token: res.access_token,
          }),
        );
        router.replace(`/${res.role}`);
      } catch (e: unknown) {
        const msg =
          (e as { data?: { message?: string } })?.data?.message ??
          'Sign-in failed. Make sure a franchise has been assigned to your EHB account.';
        setStatus('error');
        setError(msg);
      }
    })();
  }, [params, ehbCallback, dispatch, router]);

  if (status === 'error') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card">
          <h1 className="text-base font-semibold text-gray-900">Sign-in failed</h1>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <button
            onClick={() => router.replace('/login')}
            className="mt-6 w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Back to login
          </button>
        </div>
      </main>
    );
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-sm text-gray-500">Signing you in…</div>
    </main>
  );
}

export default function CallbackPage() {
  // useSearchParams() requires Suspense in the App Router.
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-gray-50 px-4"><div className="text-sm text-gray-500">Signing you in…</div></main>}>
      <CallbackBody />
    </Suspense>
  );
}
