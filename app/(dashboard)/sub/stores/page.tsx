'use client';

import { useState } from 'react';
import { Store as StoreIcon, Search } from 'lucide-react';
import { useGetSubDashboardQuery } from '@/lib/store/api/franchises.api';
import { formatDate } from '@/lib/utils';

/**
 * Sub franchise → My Stores
 *
 * Focused list of every store currently linked to this Sub franchise. Pulled
 * from the same dashboard endpoint the overview uses, so no extra API surface
 * is needed. Adds a local filter so a Sub owner with dozens of stores can
 * search by store id or name without leaving the page.
 */
export default function SubStoresPage() {
  const { data, isLoading, isError, error } = useGetSubDashboardQuery();
  const [query, setQuery] = useState('');

  if (isLoading) return <div className="skeleton h-96 w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load your stores.'}
      </p>
    );
  }

  const { stores, kpis } = data;
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? stores.filter(
        (s) =>
          s.store_id.toLowerCase().includes(needle) ||
          (s.store_name ?? '').toLowerCase().includes(needle),
      )
    : stores;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">My Stores</h1>
          <p className="text-sm text-gray-500">
            {kpis.assigned_store_count} of {kpis.capacity_max} slots used ·{' '}
            {kpis.capacity_remaining} remaining.
          </p>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name or store id"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <StoreIcon className="h-4 w-4" />
            All stores in this territory
          </h2>
          <span className="text-xs text-gray-500">
            {visible.length} of {stores.length}
          </span>
        </div>
        {visible.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            {stores.length === 0
              ? 'No stores yet. New GoSellr sellers in your territory show up here automatically.'
              : 'No stores match the current filter.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Store</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Location</th>
                <th className="px-4 py-2 font-medium">Linked</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.id} className="border-b border-gray-100 last:border-0 align-top">
                  <td className="px-4 py-2">
                    <div className="text-sm font-medium text-gray-800">
                      {s.store_name ?? 'Unnamed store'}
                    </div>
                    <div className="font-mono text-[11px] text-gray-400">{s.store_id}</div>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{s.source_platform}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {s.store_location.coordinates[1].toFixed(4)},{' '}
                    {s.store_location.coordinates[0].toFixed(4)}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{formatDate(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
