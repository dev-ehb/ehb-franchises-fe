'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Store,
  Map,
  ClipboardCheck,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FranchiseLevel } from '@/types/franchises.types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: FranchiseLevel[];
}

/**
 * Role-gated navigation. The same component renders for every level — items
 * are filtered by the owner's role so the shell stays visually identical
 * (profile/nav in the same position) across Sub/Corporate/Master dashboards.
 */
const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', href: '/sub', icon: LayoutDashboard, roles: ['sub'] },
  { label: 'My Stores', href: '/sub/stores', icon: Store, roles: ['sub'] },
  { label: 'Territory Map', href: '/sub/territory', icon: Map, roles: ['sub'] },
  { label: 'Compliance', href: '/sub/compliance', icon: ClipboardCheck, roles: ['sub'] },
  { label: 'Overview', href: '/corporate', icon: LayoutDashboard, roles: ['corporate'] },
  { label: 'Sub Franchises', href: '/corporate/subs', icon: Store, roles: ['corporate'] },
  { label: 'Regional Map', href: '/corporate/map', icon: Map, roles: ['corporate'] },
  { label: 'Reports', href: '/corporate/reports', icon: BarChart3, roles: ['corporate'] },
  // After the Corporate > Master > Sub hierarchy flip, Master is the middle
  // layer — it owns Subs directly, not Corporates. Old labels ("Corporates",
  // "Multi-Region Map", "Enterprise KPIs") were renamed accordingly so the
  // nav matches what the user actually sees on each page.
  { label: 'Overview', href: '/master', icon: LayoutDashboard, roles: ['master'] },
  { label: 'Sub Franchises', href: '/master/subs', icon: Store, roles: ['master'] },
  { label: 'Territory Map', href: '/master/map', icon: Map, roles: ['master'] },
  { label: 'Reports', href: '/master/reports', icon: BarChart3, roles: ['master'] },
];

export function Sidebar({ role }: { role: FranchiseLevel }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const items = NAV_ITEMS.filter((i) => i.roles.includes(role));

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-200',
        collapsed ? 'w-[60px]' : 'w-[220px]',
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-gray-200 px-4">
        {!collapsed && <span className="text-sm font-semibold text-gray-900">EHB Franchises</span>}
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary-50 font-medium text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 border-t border-gray-200 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50"
      >
        {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
}
