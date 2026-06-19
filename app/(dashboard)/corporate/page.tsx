'use client';

import { useGetCorporateDashboardQuery } from '@/lib/store/api/franchises.api';
import { TerritoryMap, type MapCircle } from '@/components/map/territory-map';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { formatDate, getStatusColor } from '@/lib/utils';
import type { Franchise } from '@/types/franchises.types';

/**
 * Corporate Franchise dashboard.
 *
 * Corporate is the TERRITORY ROOT in the Corporate > Master > Sub hierarchy.
 * It owns a list of child Masters plus a flat list of every grandchild Sub.
 * This view used to live under /master before the hierarchy flip.
 */
const STANDARD_RADIUS_KM = 10;

export default function CorporateDashboardPage() {
  const { data, isLoading, isError, error } = useGetCorporateDashboardQuery();

  if (isLoading) return <div className="skeleton h-96 w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load your Corporate dashboard.'}
      </p>
    );
  }

  const { franchise, child_masters, grandchild_subs, kpis } = data;
  const centerLatLng: [number, number] = [
    franchise.center.coordinates[1],
    franchise.center.coordinates[0],
  ];

  // Only Subs have radius — Masters and the Corporate itself are pins.
  const subCircles: MapCircle[] = grandchild_subs.map((s) => ({
    center: [s.center.coordinates[1], s.center.coordinates[0]],
    radiusKm: s.radius_km,
    color: '#60a5fa',
    fillColor: '#93c5fd',
    label: `${s.display_name ?? s.name} • ${s.store_count} stores`,
  }));
  const masterMarkers = child_masters.map((m) => ({
    position: [m.center.coordinates[1], m.center.coordinates[0]] as [number, number],
    color: '#92400e',
    label: `${m.display_name ?? m.name} • Master (${m.child_count} Subs)`,
  }));
  const selfMarker = {
    position: centerLatLng,
    color: '#7c2d12',
    label: `${franchise.display_name ?? franchise.name} • This Corporate`,
  };

  // Group Subs by their parent Master so the standardisation matrix can
  // render one row per Master with its Sub roll-up.
  const subsByParent: Record<string, Franchise[]> = {};
  for (const s of grandchild_subs) {
    if (!s.parent_id) continue;
    (subsByParent[s.parent_id] ??= []).push(s);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-semibold text-gray-900">{franchise.name}</h1>
        <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(franchise.status)}`}>
          {franchise.status}
        </span>
        <span className="text-xs text-gray-500">Region {franchise.region}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Master franchises" value={kpis.master_count} tone="primary" />
        <KpiCard label="Sub franchises" value={kpis.sub_count} />
        <KpiCard label="Total network stores" value={kpis.total_stores} tone="primary" />
        <KpiCard
          label="Active Masters"
          value={kpis.active_masters}
          tone="success"
          hint={`of ${kpis.master_count} total`}
        />
      </div>

      <TerritoryMap
        center={centerLatLng}
        zoom={9}
        circles={subCircles}
        markers={[selfMarker, ...masterMarkers]}
        legend={
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-orange-800" />
              This Corporate (pin)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-amber-700" />
              Master (pin)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-blue-400 bg-blue-300/30" />
              Sub
            </span>
          </div>
        }
      />

      <BrandStandardisationMatrix
        masters={child_masters}
        subsByParent={subsByParent}
      />
    </div>
  );
}

function BrandStandardisationMatrix({
  masters,
  subsByParent,
}: {
  masters: Franchise[];
  subsByParent: Record<string, Franchise[]>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <h2 className="text-sm font-semibold text-gray-700">Brand standardisation</h2>
        <span className="text-xs text-gray-500">
          Standard Sub radius: {STANDARD_RADIUS_KM} km
        </span>
      </div>
      {masters.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-400">
          No Master franchises yet. They appear here once the region exceeds the
          escalation threshold.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Master</th>
              <th className="px-4 py-2 font-medium">Subs</th>
              <th className="px-4 py-2 font-medium">Stores</th>
              <th className="px-4 py-2 font-medium">Standardised</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {masters.map((m) => {
              const subs = subsByParent[m.id] ?? [];
              const nonStandard = subs.filter((s) => s.radius_km !== STANDARD_RADIUS_KM).length;
              const totalStores = subs.reduce((sum, s) => sum + s.store_count, 0);
              return (
                <tr key={m.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-2 text-gray-800">{m.name}</td>
                  <td className="px-4 py-2 text-gray-600">{subs.length}</td>
                  <td className="px-4 py-2 text-gray-600">{totalStores}</td>
                  <td className="px-4 py-2">
                    {nonStandard === 0 ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        all on standard
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                        {nonStandard} non-standard
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(m.status)}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-500">{formatDate(m.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
