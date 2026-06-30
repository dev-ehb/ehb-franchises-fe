'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Store, Map, ClipboardCheck, BarChart3, PanelLeftClose, PanelLeftOpen, Network, X, Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FranchiseLevel } from '@/types/franchises.types';

interface NavItem { label: string; href: string; icon: React.ElementType; roles: FranchiseLevel[]; }

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/sub', icon: LayoutDashboard, roles: ['sub'] },
  { label: 'My Stores', href: '/sub/stores', icon: Store, roles: ['sub'] },
  { label: 'Territory Map', href: '/sub/territory', icon: Map, roles: ['sub'] },
  { label: 'Compliance', href: '/sub/compliance', icon: ClipboardCheck, roles: ['sub'] },
  { label: 'PSS Approvals', href: '/sub/pss-approvals', icon: ClipboardCheck, roles: ['sub'] },
  { label: 'Overview', href: '/corporate', icon: LayoutDashboard, roles: ['corporate'] },
  { label: 'Sub Franchises', href: '/corporate/subs', icon: Store, roles: ['corporate'] },
  { label: 'Regional Map', href: '/corporate/map', icon: Map, roles: ['corporate'] },
  { label: 'Reports', href: '/corporate/reports', icon: BarChart3, roles: ['corporate'] },
  { label: 'PSS Approvals', href: '/corporate/pss-approvals', icon: ClipboardCheck, roles: ['corporate'] },
  { label: 'Overview', href: '/master', icon: LayoutDashboard, roles: ['master'] },
  { label: 'Sub Franchises', href: '/master/subs', icon: Store, roles: ['master'] },
  { label: 'Territory Map', href: '/master/map', icon: Map, roles: ['master'] },
  { label: 'Reports', href: '/master/reports', icon: BarChart3, roles: ['master'] },
  { label: 'PSS Approvals', href: '/master/pss-approvals', icon: ClipboardCheck, roles: ['master'] },
  { label: 'Overview', href: '/country', icon: LayoutDashboard, roles: ['country'] },
  { label: 'Corporate Franchises', href: '/country/corporates', icon: Network, roles: ['country'] },
  { label: 'Country Map', href: '/country/map', icon: Globe, roles: ['country'] },
  { label: 'Reports', href: '/country/reports', icon: BarChart3, roles: ['country'] },
  { label: 'PSS Approvals', href: '/country/pss-approvals', icon: ClipboardCheck, roles: ['country'] },
];

const ROLE_LABEL: Record<FranchiseLevel, string> = {
  sub: 'Sub Franchise', master: 'Master Franchise', corporate: 'Corporate Franchise', country: 'Country Franchise',
};

export function Sidebar({
  role,
  mobileOpen,
  onClose,
}: {
  role: FranchiseLevel;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <>
      {/* Backdrop — mobile/tablet only, when the drawer is open */}
      <div
        onClick={onClose}
        aria-hidden
        className={cn(
          'fixed inset-0 z-[1900] bg-black/30 transition-opacity duration-300 lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      <aside
        className={cn(
          // Below lg: off-canvas slide-in drawer. lg+: static column in flow.
          'fixed inset-y-0 left-0 z-[2000] flex h-full flex-col border-r border-gray-100 bg-white transition-all duration-300 lg:static lg:z-auto lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          // Fixed width as a mobile drawer; collapse-aware width on desktop.
          collapsed ? 'w-[76px] lg:w-[64px]' : 'w-[260px] lg:w-[230px]',
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2.5 border-b border-gray-100 px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
              <Network className="h-4 w-4" />
            </span>
            <div className={cn('leading-tight', collapsed && 'hidden')}>
              <p className="font-display text-sm font-extrabold tracking-tight text-ink">EHB Franchises</p>
              <p className="text-[10px] text-gray-400">{ROLE_LABEL[role]}</p>
            </div>
          </div>
          {/* Close — mobile/tablet only */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden', collapsed && 'hidden')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          <p className={cn('px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400', collapsed && 'hidden')}>Menu</p>
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                  active ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
                )}
              >
                <Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-700')} />
                <span className={cn(collapsed && 'hidden')}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle — desktop only (mobile uses the drawer) */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          <span className={cn(collapsed && 'hidden')}>Collapse</span>
        </button>
      </aside>
    </>
  );
}
