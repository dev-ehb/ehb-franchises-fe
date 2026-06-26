'use client';

import { MapPin } from 'lucide-react';
import { useGetCorporateDashboardQuery } from '@/lib/store/api/franchises.api';
import { TerritoryMap, type MapCircle, type MapMarker } from '@/components/map/territory-map';

/**
 * Corporate franchise -> Regional Map
 *
 * Full-territory view: the Corporate root as a pin, every child Master as a
 * pin, and every grandchild Sub as a blue circle. Subs all share the anchor
 * centre under the new model, so overlap is intentional and we don't paint
 * conflicts here.
 */
export default function CorporateRegionalMapPage() {
  const { data, isLoading, isError, error } = useGetCorporateDashboardQuery();

  if (isLoading) return <div className="skeleton h-[32rem] w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load the regional map.'}
      </p>
    );
  }

  const { franchise, child_masters, grandchild_subs, kpis } = data;
  const centerLatLng: [number, number] = [
    franchise.center.coordinates[1],
    franchise.center.coordinates[0],
  ];

  const circles: MapCircle[] = grandchild_subs.map((s) => ({
    center: [s.center.coordinates[1], s.center.coordinates[0]],
    radiusKm: s.radius_km,
    color: '#60a5fa',
    fillColor: '#93c5fd',
    label: `${s.display_name ?? s.name} - ${s.store_count} stores`,
  }));
  const masterMarkers: MapMarker[] = child_masters.map((m) => ({
    position: [m.center.coordinates[1], m.center.coordinates[0]],
    color: '#92400e',
    label: `${m.display_name ?? m.name} - Master (${m.child_count} Subs)`,
  }));
  const selfMarker: MapMarker = {
    position: centerLatLng,
    color: '#7c2d12',
    label: `${franchise.display_name ?? franchise.name} - This Corporate`,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Regional Map</h1>
          <p className="text-sm text-gray-500">
            {franchise.display_name ?? franchise.name} - {kpis.master_count} Masters -{' '}
            {kpis.sub_count} Subs - {kpis.total_stores} stores
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          Centred on ({centerLatLng[0].toFixed(4)}, {centerLatLng[1].toFixed(4)})
        </div>
      </div>

      <TerritoryMap
        center={centerLatLng}
        zoom={10}
        circles={circles}
        markers={[selfMarker, ...masterMarkers]}
        className="relative h-[32rem] w-full overflow-hidden rounded-2xl border border-gray-100"
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
              Sub territory
            </span>
          </div>
        }
      />
    </div>
  );
}
