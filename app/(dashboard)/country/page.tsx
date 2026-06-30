'use client';

import { useGetCountryDashboardQuery } from '@/lib/store/api/franchises.api';
import { TerritoryMap, type MapMarker } from '@/components/map/territory-map';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { formatDate, getStatusColor, countryName } from '@/lib/utils';

/**
 * Country Franchise dashboard.
 *
 * Country is the TREE ROOT in the Country > Corporate > Master > Sub hierarchy.
 * It owns every Corporate in its country and rolls up the Master / Sub / store
 * counts beneath them.
 */
export default function CountryDashboardPage() {
  const { data, isLoading, isError, error } = useGetCountryDashboardQuery();

  if (isLoading) return <div className="skeleton h-96 w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load your Country dashboard.'}
      </p>
    );
  }

  const { franchise, child_corporates, kpis } = data;
  const centerLatLng: [number, number] = [
    franchise.center.coordinates[1],
    franchise.center.coordinates[0],
  ];

  const corporateMarkers: MapMarker[] = child_corporates.map((c) => ({
    position: [c.center.coordinates[1], c.center.coordinates[0]],
    color: '#1d4ed8',
    label: `${c.display_name ?? c.name} • Corporate (${c.child_count} Masters)`,
  }));
  const selfMarker: MapMarker = {
    position: centerLatLng,
    color: '#065f46',
    label: `${franchise.display_name ?? franchise.name} • This Country`,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-900">{franchise.name}</h1>
        <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(franchise.status)}`}>
          {franchise.status}
        </span>
        <span className="text-xs text-gray-500">Country {franchise.region} · {countryName(franchise.region)}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Corporate franchises" value={kpis.corporate_count} tone="primary" />
        <KpiCard label="Master franchises" value={kpis.master_count} />
        <KpiCard label="Sub franchises" value={kpis.sub_count} />
        <KpiCard label="Total network stores" value={kpis.total_stores} tone="primary" />
      </div>

      <TerritoryMap
        center={centerLatLng}
        zoom={6}
        markers={[selfMarker, ...corporateMarkers]}
        legend={
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-emerald-800" />
              This Country (pin)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-blue-700" />
              Corporate (pin)
            </span>
          </div>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
          <h2 className="text-sm font-semibold text-gray-700">Corporate franchises</h2>
          <span className="text-xs text-gray-500">
            {kpis.active_corporates} of {kpis.corporate_count} active
          </span>
        </div>
        {child_corporates.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No Corporate franchises yet. They appear here as stores register across
            the country.
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
              {child_corporates.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2 text-gray-800">
                    {c.display_name ?? c.name}
                    {c.code && (
                      <span className="ml-2 inline-block rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
                        {c.code}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{c.child_count}</td>
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
