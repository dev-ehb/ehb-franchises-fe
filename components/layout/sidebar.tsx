'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, Store, Map, ClipboardCheck, BarChart3, PanelLeftClose, PanelLeftOpen, Network, Globe,
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

export function Sidebar({ role }: { role: FranchiseLevel }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <aside className={cn('flex h-full flex-col border-r border-gray-100 bg-white transition-all duration-200', collapsed ? 'w-[64px]' : 'w-[230px]')}>
      <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
          <Network className="h-4 w-4" />
        </span>
        {!collapsed && (
          <div className="leading-tight">
            <p className="font-display text-sm font-extrabold tracking-tight text-ink">EHB Franchises</p>
            <p className="text-[10px] text-gray-400">{ROLE_LABEL[role]}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {!collapsed && <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Menu</p>}
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                active ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
              )}
            >
              <Icon className={cn('h-[18px] w-[18px] shrink-0', active ? 'text-brand-600' : 'text-gray-400 group-hover:text-gray-700')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50"
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
