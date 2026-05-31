'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChangePasswordMutation } from '@/lib/store/api/auth.api';
import { useAppSelector } from '@/lib/store/hooks';

/**
 * Forced change-password screen for buyers who just signed in with a temp
 * password from the admin. After a successful rotation, redirects to the
 * owner's role-specific dashboard.
 */
export default function ChangePasswordPage() {
  const router = useRouter();
  const auth = useAppSelector((s) => s.auth);
  const [change, { isLoading }] = useChangePasswordMutation();

  const [current, setCurrent] = useState('');
  const [next1, setNext1] = useState('');
  const [next2, setNext2] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next1.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (next1 !== next2) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (next1 === current) {
      setError('Pick a new password different from the temp one.');
      return;
    }
    try {
      await change({ current_password: current, new_password: next1 }).unwrap();
      router.replace(auth.role ? `/${auth.role}` : '/login');
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string | string[] } } | undefined)?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Could not change password.');
    }
  }

  if (!auth.access_token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-sm text-gray-500">
          You&apos;re not signed in. <a href="/login" className="text-primary-700 hover:underline">Go to login</a>
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-8 shadow-card">
        <h1 className="text-xl font-semibold text-gray-900">Set a new password</h1>
        <p className="text-sm text-gray-500">
          You&apos;re using a temporary password from the EHB admin. Pick something only you know to
          continue to your franchise dashboard.
        </p>

        <Field
          label="Temp password (from admin)"
          value={current}
          onChange={setCurrent}
          type="password"
        />
        <Field
          label="New password (min 8 chars)"
          value={next1}
          onChange={setNext1}
          type="password"
        />
        <Field
          label="Confirm new password"
          value={next2}
          onChange={setNext2}
          type="password"
        />

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {isLoading ? 'Updating…' : 'Update password & continue'}
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">{label}</label>
      <input
        type={type}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}
