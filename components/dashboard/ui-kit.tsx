'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/* Shared franchise-dashboard kit — green brand, soft rounded surfaces. */

export type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'lav' | 'coral' | 'slate';

const TONE: Record<Tone, { soft: string; fg: string }> = {
  brand:   { soft: 'bg-brand-50',     fg: 'text-brand-700' },
  success: { soft: 'bg-green-50',     fg: 'text-green-700' },
  warning: { soft: 'bg-amber-50',     fg: 'text-amber-600' },
  danger:  { soft: 'bg-red-50',       fg: 'text-red-600' },
  lav:     { soft: 'bg-lav-soft',     fg: 'text-lav-ink' },
  coral:   { soft: 'bg-coral-soft',   fg: 'text-coral-ink' },
  slate:   { soft: 'bg-slate-100',    fg: 'text-slate-500' },
};

export function IconTile({ icon: Icon, tone = 'brand', className = 'h-10 w-10', iconClassName = 'h-5 w-5' }: {
  icon: LucideIcon; tone?: Tone; className?: string; iconClassName?: string;
}) {
  const t = TONE[tone];
  return (
    <span className={cn('grid shrink-0 place-items-center rounded-xl', t.soft, t.fg, className)}>
      <Icon className={iconClassName} aria-hidden />
    </span>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink md:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function SectionCard({ title, subtitle, icon: Icon, action, children, bodyClassName = 'p-5' }: {
  title?: string; subtitle?: string; icon?: LucideIcon; action?: ReactNode; children: ReactNode; bodyClassName?: string;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft">
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-50 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {Icon && <IconTile icon={Icon} tone="brand" className="h-9 w-9" iconClassName="h-4 w-4" />}
            <div className="min-w-0">
              {title && <h2 className="font-display text-base font-bold text-ink">{title}</h2>}
              {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function SoftBadge({ tone = 'slate', dot = false, children }: { tone?: Tone; dot?: boolean; children: ReactNode }) {
  const t = TONE[tone];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', t.soft, t.fg)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon, title, hint, action }: {
  icon: LucideIcon; title: string; hint?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-100 bg-white px-6 py-12 text-center shadow-soft">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="h-7 w-7" aria-hidden />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-xs text-sm text-gray-500">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
