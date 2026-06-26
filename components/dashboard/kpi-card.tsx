'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TONE = {
  default: { soft: 'bg-gray-100', fg: 'text-gray-500' },
  primary: { soft: 'bg-brand-50', fg: 'text-brand-600' },
  brand:   { soft: 'bg-brand-50', fg: 'text-brand-600' },
  success: { soft: 'bg-green-50', fg: 'text-green-600' },
  warning: { soft: 'bg-amber-50', fg: 'text-amber-600' },
  danger:  { soft: 'bg-red-50',   fg: 'text-red-600' },
};

/** KpiCard — numeric tile used across all three franchise dashboards. */
export function KpiCard({ label, value, hint, tone = 'default', icon: Icon }: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: keyof typeof TONE;
  icon?: LucideIcon;
}) {
  const t = TONE[tone];
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-soft transition-shadow hover:shadow-lift">
      <div className="flex items-center justify-between">
        {Icon
          ? <span className={cn('grid h-9 w-9 place-items-center rounded-xl', t.soft, t.fg)}><Icon className="h-[18px] w-[18px]" aria-hidden /></span>
          : <div className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</div>}
        {Icon && <span className="text-gray-300">···</span>}
      </div>
      <div className="mt-3 font-display text-3xl font-extrabold tabular-nums text-ink">{value}</div>
      <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs">
        {Icon && <span className="text-sm text-gray-500">{label}</span>}
        {hint && <span className={cn('font-medium', t.fg)}>{Icon ? '· ' : ''}{hint}</span>}
      </div>
    </div>
  );
}
