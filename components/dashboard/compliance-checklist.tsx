'use client';

import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Tiny inline compliance checklist for the Sub dashboard. Phase 4 gives owners
 * a clear view of which territory rules they currently satisfy. The checks are
 * derived live from the dashboard payload - never persisted - so they reflect
 * real state at render time.
 */
export interface ComplianceCheck {
  label: string;
  ok: boolean;
  detail?: string;
}

export function ComplianceChecklist({ checks }: { checks: ComplianceCheck[] }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-soft">
      <div className="border-b border-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
        Compliance checklist
      </div>
      <ul className="divide-y divide-gray-100">
        {checks.map((c) => (
          <li key={c.label} className="flex items-start gap-3 px-4 py-3 text-sm">
            <span
              className={cn(
                'mt-0.5 flex h-5 w-5 items-center justify-center rounded-full',
                c.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
              )}
            >
              {c.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </span>
            <div>
              <div className="font-medium text-gray-800">{c.label}</div>
              {c.detail && <div className="text-xs text-gray-500">{c.detail}</div>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
