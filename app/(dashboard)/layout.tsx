'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useAppSelector } from '@/lib/store/hooks';

/**
 * Shared dashboard shell for all three franchise levels.
 * Identical chrome (sidebar + topbar) for Sub / Corporate / Master — only the
 * role-gated nav items and page content differ. Redirects to /login when there
 * is no owner session.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!auth.access_token || !auth.role) router.replace('/login');
  }, [auth, router]);

  if (!auth.role) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={auth.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar role={auth.role} email={auth.user?.email} />
        <main className="relative flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
