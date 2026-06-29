'use client';

import { Activity, Layers, Network } from 'lucide-react';
import { useGetCountryDashboardQuery } from '@/lib/store/api/franchises.api';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { formatDate, getStatusColor } from '@/lib/utils';
import type { Franchise } from '@/types/franchises.types';

/**
 * Country franchise -> Reports
 * Country-wide roll-up: KPIs + Corporate status breakdown + per-Corporate table.
 */
export default function CountryReportsPage() {
  const { data, isLoading, isError, error } = useGetCountryDashboardQuery();

  if (isLoading) return <div className="skeleton h-96 w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load Reports.'}
      </p>
    );
  }

  const { child_corporates, kpis } = data;
  const avgMastersPerCorp =
    kpis.corporate_count > 0
      ? Math.round((kpis.master_count / kpis.corporate_count) * 10) / 10
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">
          Country-wide roll-up across every Corporate, Master and Sub.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Corporates"
          value={kpis.corporate_count}
          hint={`${kpis.active_corporates} active`}
          tone="primary"
        />
        <KpiCard label="Masters" value={kpis.master_count} hint={`~${avgMastersPerCorp} per Corporate`} />
        <KpiCard label="Sub franchises" value={kpis.sub_count} />
        <KpiCard label="Total stores" value={kpis.total_stores} tone="primary" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CorporateStatusBreakdown corporates={child_corporates} />
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-soft lg:col-span-2">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Activity className="h-4 w-4" />
            Health summary
          </div>
          <ul className="space-y-2 text-sm">
            <SummaryLine
              label="Active Corporates"
              value={kpis.active_corporates}
              total={kpis.corporate_count}
              good={kpis.active_corporates === kpis.corporate_count}
            />
            <SummaryLine label="Masters in country" value={kpis.master_count} total={0} good />
            <SummaryLine label="Subs in country" value={kpis.sub_count} total={0} good />
          </ul>
        </div>
      </div>

      <PerCorporateTable corporates={child_corporates} />
    </div>
  );
}

function CorporateStatusBreakdown({ corporates }: { corporates: Franchise[] }) {
  const counts: Record<string, number> = {};
  for (const c of corporates) counts[c.status] = (counts[c.status] ?? 0) + 1;
  const entries = Object.entries(counts);
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Layers className="h-4 w-4" />
        Corporate status breakdown
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">No Corporates yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {entries.map(([status, count]) => (
            <li key={status} className="flex items-center justify-between">
              <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(status)}`}>
                {status}
              </span>
              <span className="text-gray-700">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SummaryLine({
  label, value, total, good,
}: { label: string; value: number; total: number; good: boolean }) {
  return (
    <li className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span
        className={
          good
            ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700'
            : 'rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700'
        }
      >
        {value}
        {total > 0 && <> / {total}</>}
      </span>
    </li>
  );
}

function PerCorporateTable({ corporates }: { corporates: Franchise[] }) {
  const rows = [...corporates].sort((a, b) => b.child_count - a.child_count);
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Network className="h-4 w-4" />
          Per-Corporate roll-up
        </h2>
        <span className="text-xs text-gray-500">{rows.length} Corporates</span>
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-400">
          No Corporates yet - they appear here as stores register across the country.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Corporate</th>
              <th className="px-4 py-2 font-medium">Masters</th>
              <th className="px-4 py-2 font-medium">Region</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2 text-gray-800">
                  {c.display_name ?? c.name}
                  {c.code && (
                    <span className="ml-2 inline-block rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
                      {c.code}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-700">{c.child_count}</td>
                <td className="px-4 py-2 text-gray-600">{c.region}</td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">{formatDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
