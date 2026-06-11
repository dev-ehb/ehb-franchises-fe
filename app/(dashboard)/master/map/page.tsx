'use client';

import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { useGetMasterDashboardQuery } from '@/lib/store/api/franchises.api';
import { TerritoryMap, type MapCircle, type MapMarker } from '@/components/map/territory-map';

/**
 * Master franchise → Territory Map
 *
 * Full-bleed view of the Master's slice of the territory: a pin for the
 * Master itself plus a circle per child Sub. Overlapping Subs are highlighted
 * in red using the same heuristic as the overview's conflict detector so the
 * two views never disagree.
 */
export default function MasterTerritoryMapPage() {
  const { data, isLoading, isError, error } = useGetMasterDashboardQuery();

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
          flagged.add(subs[i]._id);
          flagged.add(subs[j]._id);
        }
      }
    }
    return flagged;
  }, [data]);

  if (isLoading) return <div className="skeleton h-[32rem] w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load your territory map.'}
      </p>
    );
  }

  const { franchise, child_subs, kpis } = data;
  const centerLatLng: [number, number] = [
    franchise.center.coordinates[1],
    franchise.center.coordinates[0],
  ];

  const circles: MapCircle[] = child_subs.map((s) => ({
    center: [s.center.coordinates[1], s.center.coordinates[0]],
    radiusKm: s.radius_km,
    color: conflicts.has(s._id) ? '#dc2626' : '#2563eb',
    fillColor: conflicts.has(s._id) ? '#ef4444' : '#3b82f6',
    label: `${s.display_name ?? s.name} • ${s.store_count} stores`,
  }));
  const markers: MapMarker[] = [
    {
      position: centerLatLng,
      color: '#92400e',
      label: `${franchise.display_name ?? franchise.name} • This Master`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Territory Map</h1>
          <p className="text-sm text-gray-500">
            {franchise.display_name ?? franchise.name} · {kpis.sub_count} Subs ·{' '}
            {kpis.total_stores} stores
            {conflicts.size > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                {conflicts.size / 2 | 0} territory conflicts
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          Centred on ({centerLatLng[0].toFixed(4)}, {centerLatLng[1].toFixed(4)})
        </div>
      </div>

      <TerritoryMap
        center={centerLatLng}
        zoom={11}
        circles={circles}
        markers={markers}
        // Override the default h-80 so the dedicated map page can breathe and
        // the legend doesn't crowd the markers.
        className="relative h-[32rem] w-full overflow-hidden rounded-xl border border-gray-200"
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
              {conflicts.size > 0 && (
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-red-600 bg-red-500/20" />
                  Conflict
                </span>
              )}
          </div>
        }
      />
    </div>
  );
}

// Inline haversine — kept private to the page to avoid pulling backend utils.
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
