'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * KpiCard — small numeric tile used across all three dashboards. Same shell so
 * the layout never shifts between Sub / Corporate / Master, only the numbers.
 */
export function KpiCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: 'default' | 'primary' | 'success' | 'warning';
}) {
  const toneClass = {
    default: 'text-gray-900',
    primary: 'text-primary-700',
    success: 'text-green-700',
    warning: 'text-amber-700',
  }[tone];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-card">
      <div className="text-xs uppercase tracking-wide text-gray-400">{label}</div>
      <div className={cn('mt-2 text-3xl font-semibold tabular-nums', toneClass)}>{value}</div>
      {hint && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
    </div>
  );
}
