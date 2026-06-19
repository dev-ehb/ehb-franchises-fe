'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Store as StoreIcon } from 'lucide-react';
import { useGetMasterDashboardQuery } from '@/lib/store/api/franchises.api';
import { formatDate, getStatusColor } from '@/lib/utils';

/**
 * Master franchise → Sub Franchises
 *
 * Direct child Subs of this Master, with capacity bars, status, and a quick
 * filter. Master sits in the middle of the Corporate > Master > Sub hierarchy,
 * so this is the Master owner's primary roster view.
 */
const SUB_MAX_STORES = 10;

export default function MasterSubsPage() {
  const { data, isLoading, isError, error } = useGetMasterDashboardQuery();
  const [query, setQuery] = useState('');

  if (isLoading) return <div className="skeleton h-96 w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load your Subs.'}
      </p>
    );
  }

  const { child_subs, kpis } = data;
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? child_subs.filter(
        (s) =>
          (s.display_name ?? s.name).toLowerCase().includes(needle) ||
          s.code?.toLowerCase().includes(needle) ||
          s.region.toLowerCase().includes(needle),
      )
    : child_subs;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Sub Franchises</h1>
          <p className="text-sm text-gray-500">
            {kpis.sub_count} Subs · {kpis.active_subs} active · {kpis.total_stores} stores
            across the network.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name, code, or region"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <StoreIcon className="h-4 w-4" />
            Sub franchises under this Master
          </h2>
          <span className="text-xs text-gray-500">
            {visible.length} of {child_subs.length}
          </span>
        </div>
        {visible.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            {child_subs.length === 0
              ? 'No Subs yet. They appear here as stores get auto-allocated into your territory.'
              : 'No Subs match the current filter.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Sub</th>
                <th className="px-4 py-2 font-medium">Stores</th>
                <th className="px-4 py-2 font-medium">Capacity</th>
                <th className="px-4 py-2 font-medium">Radius</th>
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
                        className="block text-sm font-medium text-gray-800 hover:text-primary-700"
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
                                : 'h-full bg-primary-500'
                            }
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{s.radius_km} km</td>
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
    </div>
  );
}
