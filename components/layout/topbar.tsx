'use client';

import { Bell, Settings, UserCircle } from 'lucide-react';
import { getLevelLabel } from '@/lib/utils';
import type { FranchiseLevel } from '@/types/franchises.types';

/**
 * Shared top bar. Profile / notifications / settings stay in a fixed position
 * across every dashboard level so owners never have to relearn the layout.
 */
export function Topbar({ role, email }: { role: FranchiseLevel; email?: string }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="text-sm font-medium text-gray-700">{getLevelLabel(role)} Dashboard</div>
      <div className="flex items-center gap-4 text-gray-500">
        <button aria-label="Notifications" className="hover:text-gray-800">
          <Bell className="h-5 w-5" />
        </button>
        <button aria-label="Settings" className="hover:text-gray-800">
          <Settings className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <UserCircle className="h-6 w-6" />
          <span className="text-sm text-gray-700">{email ?? 'Franchise Owner'}</span>
        </div>
      </div>
    </header>
  );
}
