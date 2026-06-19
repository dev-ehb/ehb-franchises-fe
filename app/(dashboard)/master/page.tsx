'use client';

import { useMemo } from 'react';
import { useGetMasterDashboardQuery } from '@/lib/store/api/franchises.api';
import { TerritoryMap, type MapCircle } from '@/components/map/territory-map';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { formatDate, getStatusColor } from '@/lib/utils';
import type { Franchise } from '@/types/franchises.types';

/**
 * Master Franchise dashboard.
 *
 * Master sits in the MIDDLE of the Corporate > Master > Sub hierarchy. It
 * directly owns a list of Subs in its slice of the territory and rolls up
 * their store counts. The previous "top of the hierarchy" view lives on the
 * Corporate dashboard now.
 */
export default function MasterDashboardPage() {
  const { data, isLoading, isError, error } = useGetMasterDashboardQuery();

  // Conflict detection: two Subs conflict if their centres are within
  // (radius_a + radius_b) * 0.5 km of each other — i.e. their circles overlap
  // by more than the compliance tolerance.
  const conflicts = useMemo(() => {
    if (!data?.child_subs) return new Set<string>();
    const subs = data.child_subs;
    const flagged = new Set<string>();
    for (let i = 0; i < subs.length; i++) {
      for (let j = i + 1; j < subs.length; j++) {
        const d = haversineKm(
          subs[i].center.coordinates[1],
          subs[i].center.coordinates[0],
          subs[j].center.coordinates[1],
          subs[j].center.coordinates[0],
        );
        const threshold = (subs[i].radius_km + subs[j].radius_km) / 2;
        if (d < threshold) {
          flagged.add(subs[i].id);
          flagged.add(subs[j].id);
        }
      }
    }
    return flagged;
  }, [data]);

  if (isLoading) return <div className="skeleton h-96 w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load your Master dashboard.'}
      </p>
    );
  }

  const { franchise, child_subs, kpis } = data;
  const centerLatLng: [number, number] = [
    franchise.center.coordinates[1],
    franchise.center.coordinates[0],
  ];

  // Masters are organisational containers (no radius of their own), so the
  // dashboard renders only the child Sub circles, with the Master itself shown
  // as a centroid pin.
  const circles: MapCircle[] = child_subs.map((s) => ({
    center: [s.center.coordinates[1], s.center.coordinates[0]],
    radiusKm: s.radius_km,
    color: conflicts.has(s.id) ? '#dc2626' : '#2563eb',
    fillColor: conflicts.has(s.id) ? '#ef4444' : '#3b82f6',
    label: `${s.display_name ?? s.name} • ${s.store_count} stores`,
  }));
  const selfMarker = {
    position: centerLatLng,
    color: '#92400e',
    label: `${franchise.display_name ?? franchise.name} • This Master`,
  };

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
        <KpiCard label="Sub franchises" value={kpis.sub_count} tone="primary" />
        <KpiCard label="Active Subs" value={kpis.active_subs} tone="success" />
        <KpiCard label="Total stores" value={kpis.total_stores} />
        <KpiCard
          label="Territory conflicts"
          value={(conflicts.size / 2) | 0}
          hint="Subs whose circles overlap"
          tone={conflicts.size > 0 ? 'warning' : 'default'}
        />
      </div>

      <TerritoryMap
        center={centerLatLng}
        zoom={11}
        circles={circles}
        markers={[selfMarker]}
        legend={
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-amber-700" />
              This Master (pin)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-primary-600 bg-primary-500/20" />
              Sub territory
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-red-600 bg-red-500/20" />
              Conflict
            </span>
          </div>
        }
      />

      <SubsTable subs={child_subs} conflicts={conflicts} />
    </div>
  );
}

function SubsTable({ subs, conflicts }: { subs: Franchise[]; conflicts: Set<string> }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <h2 className="text-sm font-semibold text-gray-700">Child Sub franchises</h2>
        <span className="text-xs text-gray-500">{subs.length} total</span>
      </div>
      {subs.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-gray-400">
          No Sub franchises yet. They appear here as new ones get auto-created in your region.
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Stores</th>
              <th className="px-4 py-2 font-medium">Radius</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2 text-gray-800">
                  {s.name}
                  {conflicts.has(s.id) && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      conflict
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-600">{s.store_count}</td>
                <td className="px-4 py-2 text-gray-600">{s.radius_km} km</td>
                <td className="px-4 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(s.status)}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-500">{formatDate(s.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Inline haversine — small enough to avoid pulling the backend utils into the browser.
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
