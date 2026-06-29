'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Menu, Settings, UserCircle } from 'lucide-react';
import { getLevelLabel } from '@/lib/utils';
import { useAppDispatch } from '@/lib/store/hooks';
import { clearCredentials } from '@/lib/store/auth.slice';
import type { FranchiseLevel } from '@/types/franchises.types';

/**
 * Shared top bar. Profile / notifications / settings stay in a fixed position
 * across every dashboard level so owners never have to relearn the layout.
 *
 * The avatar is a button that opens a small profile menu (email row + Sign
 * out). Click-outside + Escape close it. Logout clears credentials (which
 * also wipes sessionStorage) and routes to /login.
 */
export function Topbar({ role, email, onMenuClick }: { role: FranchiseLevel; email?: string; onMenuClick: () => void }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function onLogout() {
    dispatch(clearCredentials());
    setOpen(false);
    router.replace('/login');
  }

  return (
    <header className="flex h-16 items-center justify-between gap-2 border-b border-gray-100 bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="truncate font-display text-base font-bold tracking-tight text-ink">{getLevelLabel(role)} Dashboard</div>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-gray-500 sm:gap-4">
        <button aria-label="Notifications" className="hover:text-gray-800">
          <Bell className="h-5 w-5" />
        </button>
        <button aria-label="Settings" className="hover:text-gray-800">
          <Settings className="h-5 w-5" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <UserCircle className="h-6 w-6" />
            <span className="hidden max-w-[160px] truncate sm:inline">{email ?? 'Franchise Owner'}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 top-full z-40 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
            >
              <div className="border-b border-gray-100 px-3 py-2">
                <div className="text-xs uppercase tracking-wide text-gray-400">
                  Signed in as
                </div>
                <div className="truncate text-sm text-gray-800">
                  {email ?? 'Franchise Owner'}
                </div>
                <div className="text-xs text-gray-500">{getLevelLabel(role)}</div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                role="menuitem"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
