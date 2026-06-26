'use client';

import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useGetSubDashboardQuery } from '@/lib/store/api/franchises.api';
import {
  ComplianceChecklist,
  type ComplianceCheck,
} from '@/components/dashboard/compliance-checklist';

/**
 * Sub franchise → Compliance
 *
 * Standalone view of the same live checklist that sits on the overview page,
 * with a roll-up banner at the top so a Sub owner can see "all clear / X
 * issues" at a glance. Rules stay derived from the dashboard payload so the
 * two views can never disagree.
 */
export default function SubCompliancePage() {
  const { data, isLoading, isError, error } = useGetSubDashboardQuery();

  if (isLoading) return <div className="skeleton h-96 w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load compliance status.'}
      </p>
    );
  }

  const { franchise, kpis } = data;
  const capacityPercent = Math.round(
    (kpis.assigned_store_count / kpis.capacity_max) * 100,
  );

  const checks: ComplianceCheck[] = [
    {
      label: 'Within capacity',
      ok: kpis.capacity_remaining > 0,
      detail: `${kpis.assigned_store_count} / ${kpis.capacity_max} stores (${capacityPercent}%). New stores stop being routed to this Sub once the cap is hit.`,
    },
    {
      label: 'Territory radius set',
      ok: franchise.radius_km > 0,
      detail: `${franchise.radius_km} km radius around the franchise centre.`,
    },
    {
      label: 'Franchise active',
      ok: franchise.status === 'Active',
      detail: `Current status: ${franchise.status}. Only 'Active' Subs receive new store allocations from the engine.`,
    },
    {
      label: 'Capacity headroom',
      ok: capacityPercent < 90,
      detail:
        capacityPercent < 90
          ? `Comfortable headroom (${capacityPercent}% used).`
          : `Near capacity (${capacityPercent}%). A parallel Sub will be auto-minted in this territory once it fills.`,
    },
  ];

  const failing = checks.filter((c) => !c.ok).length;
  const allClear = failing === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Compliance</h1>
        <p className="text-sm text-gray-500">
          Rules evaluated from your current capacity, territory, and lifecycle state.
        </p>
      </div>

      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 ${
          allClear
            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
            : 'border-amber-200 bg-amber-50 text-amber-900'
        }`}
      >
        {allClear ? (
          <ShieldCheck className="h-5 w-5 shrink-0" />
        ) : (
          <ShieldAlert className="h-5 w-5 shrink-0" />
        )}
        <div className="space-y-1">
          <div className="text-sm font-semibold">
            {allClear ? 'All checks passing' : `${failing} attention point${failing > 1 ? 's' : ''}`}
          </div>
          <div className="text-xs">
            {allClear
              ? 'No action required right now. This view re-runs whenever the dashboard data changes.'
              : 'Review the items below. None of these block your franchise — they highlight conditions that may affect new store allocation.'}
          </div>
        </div>
      </div>

      <ComplianceChecklist checks={checks} />
    </div>
  );
}
