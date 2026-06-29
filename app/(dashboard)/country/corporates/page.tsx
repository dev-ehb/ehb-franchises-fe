'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Network } from 'lucide-react';
import { useGetCountryDashboardQuery } from '@/lib/store/api/franchises.api';
import { formatDate, getStatusColor } from '@/lib/utils';

/**
 * Country franchise -> Corporate Franchises
 * Lists every Corporate in the country with its Master count and status.
 */
export default function CountryCorporatesPage() {
  const { data, isLoading, isError, error } = useGetCountryDashboardQuery();
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return data.child_corporates;
    return data.child_corporates.filter(
      (c) =>
        (c.display_name ?? c.name).toLowerCase().includes(needle) ||
        c.code?.toLowerCase().includes(needle) ||
        c.region.toLowerCase().includes(needle),
    );
  }, [data, query]);

  if (isLoading) return <div className="skeleton h-96 w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load Corporate franchises.'}
      </p>
    );
  }

  const { kpis } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Corporate Franchises</h1>
          <p className="text-sm text-gray-500">
            {kpis.corporate_count} Corporates · {kpis.master_count} Masters · {kpis.sub_count} Subs ·{' '}
            {kpis.total_stores} stores in this country.
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

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
        {visible.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No Corporate franchises match.
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
              {visible.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2">
                    <Link
                      href={`/franchises/${c.id}`}
                      className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-brand-700"
                    >
                      <Network className="h-4 w-4 shrink-0 text-blue-700" />
                      {c.display_name ?? c.name}
                    </Link>
                    {c.code && (
                      <span className="mt-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
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
    </div>
  );
}
