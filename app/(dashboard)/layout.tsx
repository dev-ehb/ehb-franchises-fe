'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { hydrateFromStorage } from '@/lib/store/auth.slice';

/**
 * Shared dashboard shell for all three franchise levels.
 *
 * Auth flow on mount:
 *   1. SSR + client first render -> `hydrated: false`, render the same
 *      skeleton on both sides so hydration matches.
 *   2. After mount, dispatch `hydrateFromStorage` to pull the token + role
 *      out of sessionStorage. Flips `hydrated: true`.
 *   3. Once hydrated, either render the dashboard or redirect to /login.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Re-populate auth from sessionStorage exactly once after the first paint.
  useEffect(() => {
    if (!auth.hydrated) dispatch(hydrateFromStorage());
  }, [auth.hydrated, dispatch]);

  // Defer the login redirect until hydration is finished, otherwise a freshly
  // reloaded page would bounce to /login before we'd had a chance to read
  // sessionStorage.
  useEffect(() => {
    if (auth.hydrated && (!auth.access_token || !auth.role)) {
      router.replace('/login');
    }
  }, [auth.hydrated, auth.access_token, auth.role, router]);

  // SSR + the pre-hydration client paint render this exact same skeleton, so
  // React's hydration check is happy. The skeleton is shaped like the real
  // shell to avoid layout shift once auth comes back.
  if (!auth.hydrated || !auth.role) {
    return (
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden w-[230px] border-r border-gray-100 bg-white lg:block" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="h-16 border-b border-gray-100 bg-white" />
          <main className="relative flex-1 overflow-y-auto bg-[#f6f8f6] p-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role={auth.role}
        mobileOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          role={auth.role}
          email={auth.user?.email}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="relative flex-1 overflow-y-auto bg-[#f6f8f6] p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
