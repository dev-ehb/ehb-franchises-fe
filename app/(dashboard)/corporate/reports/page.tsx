'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Activity, Building2, Layers, Network } from 'lucide-react';
import { useGetCorporateDashboardQuery } from '@/lib/store/api/franchises.api';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { formatDate, getStatusColor } from '@/lib/utils';
import type { Franchise } from '@/types/franchises.types';

/**
 * Corporate franchise -> Reports
 *
 * Network-wide roll-up: KPIs at the top, status/utilisation breakdowns in the
 * middle row, and a per-Master table showing how many Subs / stores live
 * under each Master plus the rolled-up utilisation %.
 */
const SUB_MAX_STORES = 10;

export default function CorporateReportsPage() {
  const { data, isLoading, isError, error } = useGetCorporateDashboardQuery();

  const subsByMaster = useMemo(() => {
    const map: Record<string, Franchise[]> = {};
    if (!data) return map;
    for (const s of data.grandchild_subs) {
      if (!s.parent_id) continue;
      (map[s.parent_id] ??= []).push(s);
    }
    return map;
  }, [data]);

  if (isLoading) return <div className="skeleton h-96 w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load Reports.'}
      </p>
    );
  }

  const { child_masters, grandchild_subs, kpis } = data;

  const totalCapacity = grandchild_subs.length * SUB_MAX_STORES;
  const utilisationPct =
    totalCapacity > 0 ? Math.round((kpis.total_stores / totalCapacity) * 100) : 0;
  const subsAtRisk = grandchild_subs.filter(
    (s) => s.store_count / SUB_MAX_STORES >= 0.9,
  ).length;
  const subsEmpty = grandchild_subs.filter((s) => s.store_count === 0).length;
  const avgSubsPerMaster =
    kpis.master_count > 0
      ? Math.round((kpis.sub_count / kpis.master_count) * 10) / 10
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">
          Network-wide roll-up across every Master and Sub in this territory.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Masters"
          value={kpis.master_count}
          hint={`${kpis.active_masters} active`}
          tone="primary"
        />
        <KpiCard
          label="Sub franchises"
          value={kpis.sub_count}
          hint={`~${avgSubsPerMaster} per Master`}
        />
        <KpiCard
          label="Network utilisation"
          value={`${utilisationPct}%`}
          hint={`${kpis.total_stores} / ${totalCapacity} slots used`}
          tone={utilisationPct >= 90 ? 'warning' : 'default'}
        />
        <KpiCard
          label="Subs at risk"
          value={subsAtRisk}
          hint={subsAtRisk > 0 ? '>=90% capacity used' : 'No Subs near cap'}
          tone={subsAtRisk > 0 ? 'warning' : 'success'}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SubStatusBreakdown subs={grandchild_subs} />
        <UtilisationHistogram subs={grandchild_subs} />
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Activity className="h-4 w-4" />
            Health summary
          </div>
          <ul className="space-y-2 text-sm">
            <SummaryLine
              label="Active Masters"
              value={kpis.active_masters}
              total={kpis.master_count}
              good={kpis.active_masters === kpis.master_count}
            />
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

      <PerMasterTable masters={child_masters} subsByMaster={subsByMaster} />
    </div>
  );
}

function SubStatusBreakdown({ subs }: { subs: Franchise[] }) {
  const counts: Record<string, number> = {};
  for (const s of subs) counts[s.status] = (counts[s.status] ?? 0) + 1;
  const entries = Object.entries(counts);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
        <Layers className="h-4 w-4" />
        Sub status breakdown
      </div>
      {entries.length === 0 ? (
        <p className="text-sm text-gray-400">No Subs yet.</p>
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

function UtilisationHistogram({ subs }: { subs: Franchise[] }) {
  const buckets: { label: string; min: number; max: number; count: number }[] = [
    { label: '0%',     min: 0,      max: 0,    count: 0 },
    { label: '1-25%',  min: 0.0001, max: 0.25, count: 0 },
    { label: '26-50%', min: 0.2501, max: 0.5,  count: 0 },
    { label: '51-75%', min: 0.5001, max: 0.75, count: 0 },
    { label: '76-99%', min: 0.7501, max: 0.99, count: 0 },
    { label: '100%',   min: 1.0,    max: 999,  count: 0 },
  ];
  for (const s of subs) {
    const util = s.store_count / SUB_MAX_STORES;
    const b = buckets.find((b) => util >= b.min && util <= b.max);
    if (b) b.count++;
  }
  const max = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-soft">
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
                className="h-full bg-brand-500"
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

function PerMasterTable({
  masters,
  subsByMaster,
}: {
  masters: Franchise[];
  subsByMaster: Record<string, Franchise[]>;
}) {
  const rows = masters
    .map((m) => {
      const subs = subsByMaster[m.id] ?? [];
      const stores = subs.reduce((sum, s) => sum + s.store_count, 0);
      const capacity = subs.length * SUB_MAX_STORES;
      const util = capacity > 0 ? Math.round((stores / capacity) * 100) : 0;
      return { master: m, subs, stores, capacity, util };
    })
    .sort((a, b) => b.stores - a.stores);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Network className="h-4 w-4" />
          Per-Master roll-up
        </h2>
        <span className="text-xs text-gray-500">{rows.length} Masters</span>
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-400">
          No Masters yet - they appear here once stores start landing in this territory.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Master</th>
              <th className="px-4 py-2 font-medium">Subs</th>
              <th className="px-4 py-2 font-medium">Stores</th>
              <th className="px-4 py-2 font-medium">Utilisation</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ master, subs, stores, capacity, util }) => (
              <tr key={master.id} className="border-b border-gray-100 last:border-0 align-top">
                <td className="px-4 py-2">
                  <Link
                    href={`/franchises/${master.id}`}
                    className="block text-sm font-medium text-gray-800 hover:text-brand-700"
                  >
                    {master.display_name ?? master.name}
                  </Link>
                  {master.code && (
                    <span className="mt-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
                      {master.code}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-700">{subs.length}</td>
                <td className="px-4 py-2 text-gray-700">{stores}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={
                          util >= 90 ? 'h-full bg-amber-500' : 'h-full bg-brand-500'
                        }
                        style={{ width: `${util}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {stores}/{capacity}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(master.status)}`}
                  >
                    {master.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">{formatDate(master.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
