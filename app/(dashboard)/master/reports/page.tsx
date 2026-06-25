'use client';

import { Activity, Building2, Layers, Store as StoreIcon } from 'lucide-react';
import { useGetMasterDashboardQuery } from '@/lib/store/api/franchises.api';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { formatDate, getStatusColor } from '@/lib/utils';

/**
 * Master franchise → Reports
 *
 * Rolled-up view of every Sub under this Master. KPIs at the top (sub_count,
 * active_subs, total_stores, avg utilisation) plus a per-Sub utilisation
 * breakdown so the Master owner can spot Subs near capacity and Subs that
 * still need stores.
 */
const SUB_MAX_STORES = 10;

export default function MasterReportsPage() {
  const { data, isLoading, isError, error } = useGetMasterDashboardQuery();

  if (isLoading) return <div className="skeleton h-96 w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load Reports.'}
      </p>
    );
  }

  const { child_subs, kpis } = data;

  // Aggregates not exposed on the API surface yet — computed on the client so
  // the Reports view stays purely derived from the existing dashboard data.
  const totalCapacity = child_subs.length * SUB_MAX_STORES;
  const utilisationPct = totalCapacity > 0
    ? Math.round((kpis.total_stores / totalCapacity) * 100)
    : 0;
  const subsAtRisk = child_subs.filter(
    (s) => s.store_count / SUB_MAX_STORES >= 0.9,
  ).length;
  const subsEmpty = child_subs.filter((s) => s.store_count === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">
          Aggregated KPIs across every Sub franchise under this Master.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Sub franchises"
          value={kpis.sub_count}
          hint={`${kpis.active_subs} active`}
          tone="primary"
        />
        <KpiCard
          label="Total stores"
          value={kpis.total_stores}
          hint={`${SUB_MAX_STORES} per Sub max`}
        />
        <KpiCard
          label="Network utilisation"
          value={`${utilisationPct}%`}
          hint={`${kpis.total_stores} of ${totalCapacity} slots used`}
          tone={utilisationPct >= 90 ? 'warning' : 'default'}
        />
        <KpiCard
          label="Subs at risk"
          value={subsAtRisk}
          hint={subsAtRisk > 0 ? '≥90% capacity used' : 'No Subs near cap'}
          tone={subsAtRisk > 0 ? 'warning' : 'success'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StatusBreakdown subs={child_subs} />
        <UtilisationHistogram subs={child_subs} />
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Activity className="h-4 w-4" />
            Health summary
          </div>
          <ul className="space-y-2 text-sm">
            <SummaryLine label="Active Subs" value={kpis.active_subs} total={kpis.sub_count} good />
            <SummaryLine
              label="Subs near capacity"
              value={subsAtRisk}
              total={kpis.sub_count}
              good={subsAtRisk === 0}
            />
            <SummaryLine
              label="Empty Subs"
              value={subsEmpty}
              total={kpis.sub_count}
              good={subsEmpty === 0}
            />
          </ul>
        </div>
      </div>

      <UtilisationTable subs={child_subs} />
    </div>
  );
}

function StatusBreakdown({ subs }: { subs: { status: string; id: string }[] }) {
  const counts: Record<string, number> = {};
  for (const s of subs) counts[s.status] = (counts[s.status] ?? 0) + 1;
  const entries = Object.entries(counts);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Layers className="h-4 w-4" />
        Status breakdown
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">No Subs yet.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {entries.map(([status, count]) => (
            <li key={status} className="flex items-center justify-between">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(status)}`}
              >
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

function UtilisationHistogram({ subs }: { subs: { store_count: number; id: string }[] }) {
  // Bucket Subs by 25 %-utilisation slabs so the Master owner sees the shape
  // of the network at a glance: are most Subs empty, half-full, or stretched?
  const buckets: { label: string; min: number; max: number; count: number }[] = [
    { label: '0%',     min: 0,      max: 0,    count: 0 },
    { label: '1–25%',  min: 0.0001, max: 0.25, count: 0 },
    { label: '26–50%', min: 0.2501, max: 0.5,  count: 0 },
    { label: '51–75%', min: 0.5001, max: 0.75, count: 0 },
    { label: '76–99%', min: 0.7501, max: 0.99, count: 0 },
    { label: '100%',   min: 1.0,    max: 999,  count: 0 },
  ];
  for (const s of subs) {
    const util = s.store_count / SUB_MAX_STORES;
    const b = buckets.find((b) => util >= b.min && util <= b.max);
    if (b) b.count++;
  }
  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Building2 className="h-4 w-4" />
        Capacity distribution
      </div>
      <ul className="space-y-2 text-xs text-gray-600">
        {buckets.map((b) => (
          <li key={b.label} className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-gray-500">{b.label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-primary-500"
                style={{ width: `${(b.count / max) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-gray-700">{b.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  total,
  good,
}: {
  label: string;
  value: number;
  total: number;
  good: boolean;
}) {
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

function UtilisationTable({
  subs,
}: {
  subs: {
    id: string;
    code?: string;
    name: string;
    display_name?: string;
    status: string;
    store_count: number;
    created_at: string;
  }[];
}) {
  const sorted = [...subs].sort((a, b) => b.store_count - a.store_count);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <StoreIcon className="h-4 w-4" />
          Per-Sub utilisation
        </h2>
        <span className="text-xs text-gray-500">{sorted.length} Subs</span>
      </div>
      {sorted.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-400">
          No Subs yet — utilisation will appear here once stores get linked.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Sub</th>
              <th className="px-4 py-2 font-medium">Utilisation</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => {
              const pct = Math.min(
                100,
                Math.round((s.store_count / SUB_MAX_STORES) * 100),
              );
              return (
                <tr key={s.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2">
                    <div className="text-sm font-medium text-gray-800">
                      {s.display_name ?? s.name}
                    </div>
                    {s.code && (
                      <span className="mt-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
                        {s.code}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={
                            pct >= 90
                              ? 'h-full bg-amber-500'
                              : 'h-full bg-primary-500'
                          }
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {s.store_count}/{SUB_MAX_STORES}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">{formatDate(s.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
