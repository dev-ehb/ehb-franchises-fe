'use client';

import { MapPin } from 'lucide-react';
import { useGetSubDashboardQuery } from '@/lib/store/api/franchises.api';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { TerritoryMap, type MapMarker } from '@/components/map/territory-map';

/**
 * Sub franchise → Territory Map
 *
 * Dedicated, larger map view of this Sub's territory + every store currently
 * pinned inside it. Same data source as the overview page — this page just
 * gives the map a full-bleed canvas with a denser legend.
 */
export default function SubTerritoryPage() {
  const { data, isLoading, isError, refetch } = useGetSubDashboardQuery();

  if (isLoading) return <Skeleton className="h-[32rem] w-full" />;
  if (isError || !data) {
    return <ErrorState onRetry={refetch} message="Could not load your territory map." />;
  }

  const { franchise, stores, kpis } = data;
  const centerLatLng: [number, number] = [
    franchise.center.coordinates[1],
    franchise.center.coordinates[0],
  ];

  const markers: MapMarker[] = stores.map((s) => ({
    position: [s.store_location.coordinates[1], s.store_location.coordinates[0]],
    label: `${s.store_name ?? 'Unnamed store'} • ${s.store_id.slice(-6)}`,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Territory Map</h1>
          <p className="text-sm text-gray-500">
            {franchise.display_name ?? franchise.name} · {franchise.radius_km} km radius around
            ({centerLatLng[0].toFixed(4)}, {centerLatLng[1].toFixed(4)}).
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          {stores.length} stores plotted · {kpis.capacity_remaining} slots remaining
        </div>
      </div>

      <TerritoryMap
        center={centerLatLng}
        radiusKm={franchise.radius_km}
        markers={markers}
        zoom={12}
        legend={
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-brand-600 bg-brand-500/20" />
              Your territory ({franchise.radius_km} km)
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-3 w-3 rounded-full bg-brand-600" />
              Linked store
            </span>
          </div>
        }
      />
    </div>
  );
}
