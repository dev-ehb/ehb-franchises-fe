'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Store as StoreIcon, Network } from 'lucide-react';
import { useGetCorporateDashboardQuery } from '@/lib/store/api/franchises.api';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, getStatusColor } from '@/lib/utils';
import type { Franchise } from '@/types/franchises.types';

/**
 * Corporate franchise -> Sub Franchises
 *
 * Corporate is the TERRITORY ROOT, so the natural list view is every Sub in
 * the network grouped by its parent Master. Each Master gets its own card,
 * with its child Subs in a table and a filter that matches name / code /
 * region. Empty Masters still show as cards so the owner can see them.
 */
const SUB_MAX_STORES = 10;

export default function CorporateSubsPage() {
  const { data, isLoading, isError, refetch } = useGetCorporateDashboardQuery();
  const [query, setQuery] = useState('');

  const subsByMaster = useMemo(() => {
    const map: Record<string, Franchise[]> = {};
    if (!data) return map;
    for (const s of data.grandchild_subs) {
      if (!s.parent_id) continue;
      (map[s.parent_id] ??= []).push(s);
    }
    return map;
  }, [data]);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !data) {
    return <ErrorState onRetry={refetch} message="Could not load Sub franchises." />;
  }

  const { child_masters, grandchild_subs, kpis } = data;
  const needle = query.trim().toLowerCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Sub Franchises</h1>
          <p className="text-sm text-gray-500">
            {kpis.sub_count} Subs across {kpis.master_count} Masters in this territory.
            {kpis.total_stores} total stores.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, code, or region"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {child_masters.length === 0 && grandchild_subs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-400">
          No Masters or Subs in this territory yet. They will appear here once stores
          start registering inside your radius.
        </div>
      ) : (
        <div className="space-y-4">
          {child_masters.map((m) => {
            const subs = subsByMaster[m.id] ?? [];
            const visible = needle
              ? subs.filter(
                  (s) =>
                    (s.display_name ?? s.name).toLowerCase().includes(needle) ||
                    s.code?.toLowerCase().includes(needle) ||
                    s.region.toLowerCase().includes(needle),
                )
              : subs;
            const totalStores = subs.reduce((sum, s) => sum + s.store_count, 0);

            // Skip Masters whose Subs are all filtered out (keeps the page
            // tight when a search returns a small set).
            if (needle && visible.length === 0) return null;

            return (
              <div
                key={m.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 bg-amber-50/40 px-4 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <Network className="h-4 w-4 shrink-0 text-amber-700" />
                    <Link
                      href={`/franchises/${m.id}`}
                      className="truncate text-sm font-semibold text-gray-800 hover:text-brand-700"
                    >
                      {m.display_name ?? m.name}
                    </Link>
                    {m.code && (
                      <span className="shrink-0 rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
                        {m.code}
                      </span>
                    )}
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${getStatusColor(m.status)}`}>
                      {m.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {subs.length} Subs · {totalStores} stores
                  </div>
                </div>

                {visible.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-400">
                    No Subs under this Master yet.
                  </div>
                ) : (
                  <>
                    {/* Desktop table (lg and up) */}
                    <table className="hidden w-full text-sm lg:table">
                      <thead className="border-b border-gray-100 bg-gray-50 text-left text-gray-500">
                        <tr>
                          <th className="px-4 py-2 font-medium">Sub</th>
                          <th className="px-4 py-2 font-medium">Stores</th>
                          <th className="px-4 py-2 font-medium">Capacity</th>
                          <th className="px-4 py-2 font-medium">Region</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 font-medium">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visible.map((s) => {
                          const pct = Math.min(
                            100,
                            Math.round((s.store_count / SUB_MAX_STORES) * 100),
                          );
                          return (
                            <tr key={s.id} className="border-b border-gray-100 last:border-0 align-top">
                              <td className="px-4 py-2">
                                <Link
                                  href={`/franchises/${s.id}`}
                                  className="block text-sm font-medium text-gray-800 hover:text-brand-700"
                                >
                                  {s.display_name ?? s.name}
                                </Link>
                                {s.code && (
                                  <span className="mt-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
                                    {s.code}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-gray-700">{s.store_count}</td>
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                      className={
                                        pct >= 90
                                          ? 'h-full bg-amber-500'
                                          : 'h-full bg-brand-500'
                                      }
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500">{pct}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-gray-600">{s.region}</td>
                              <td className="px-4 py-2">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(s.status)}`}
                                >
                                  {s.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-gray-500">
                                {formatDate(s.created_at)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Mobile / tablet stacked cards (below lg) — same data, no clipping */}
                    <ul className="divide-y divide-gray-100 lg:hidden">
                      {visible.map((s) => {
                        const pct = Math.min(
                          100,
                          Math.round((s.store_count / SUB_MAX_STORES) * 100),
                        );
                        return (
                          <li key={s.id} className="px-4 py-3">
                            <Link
                              href={`/franchises/${s.id}`}
                              className="block text-sm font-medium text-gray-800 hover:text-brand-700"
                            >
                              {s.display_name ?? s.name}
                            </Link>
                            {s.code && (
                              <span className="mt-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
                                {s.code}
                              </span>
                            )}
                            <dl className="mt-2 grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 text-xs">
                              <dt className="text-gray-400">Stores</dt>
                              <dd className="text-gray-700">{s.store_count}</dd>
                              <dt className="text-gray-400">Capacity</dt>
                              <dd>
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                      className={pct >= 90 ? 'h-full bg-amber-500' : 'h-full bg-brand-500'}
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="text-gray-500">{pct}%</span>
                                </div>
                              </dd>
                              <dt className="text-gray-400">Region</dt>
                              <dd className="text-gray-600">{s.region}</dd>
                              <dt className="text-gray-400">Status</dt>
                              <dd>
                                <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(s.status)}`}>
                                  {s.status}
                                </span>
                              </dd>
                              <dt className="text-gray-400">Created</dt>
                              <dd className="text-gray-500">{formatDate(s.created_at)}</dd>
                            </dl>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <SummaryCard
        label="Network total"
        masters={kpis.master_count}
        subs={kpis.sub_count}
        stores={kpis.total_stores}
        activeMasters={kpis.active_masters}
      />
    </div>
  );
}

function SummaryCard({
  label,
  masters,
  subs,
  stores,
  activeMasters,
}: {
  label: string;
  masters: number;
  subs: number;
  stores: number;
  activeMasters: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-soft">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
        <StoreIcon className="h-4 w-4" />
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <span>
          Masters: <span className="font-medium text-gray-800">{masters}</span>{' '}
          <span className="text-gray-400">({activeMasters} active)</span>
        </span>
        <span>
          Subs: <span className="font-medium text-gray-800">{subs}</span>
        </span>
        <span>
          Stores: <span className="font-medium text-gray-800">{stores}</span>
        </span>
      </div>
    </div>
  );
}
