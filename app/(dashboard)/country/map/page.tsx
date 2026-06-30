'use client';

import { MapPin } from 'lucide-react';
import { useGetCountryDashboardQuery } from '@/lib/store/api/franchises.api';
import { TerritoryMap, type MapMarker } from '@/components/map/territory-map';

/**
 * Country franchise -> Country Map
 * The Country root as a pin plus every child Corporate as a pin.
 */
export default function CountryMapPage() {
  const { data, isLoading, isError, error } = useGetCountryDashboardQuery();

  if (isLoading) return <div className="skeleton h-[32rem] w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load the country map.'}
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
    label: `${c.display_name ?? c.name} - Corporate (${c.child_count} Masters)`,
  }));
  const selfMarker: MapMarker = {
    position: centerLatLng,
    color: '#065f46',
    label: `${franchise.display_name ?? franchise.name} - This Country`,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Country Map</h1>
          <p className="text-sm text-gray-500">
            {franchise.display_name ?? franchise.name} - {kpis.corporate_count} Corporates -{' '}
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
        zoom={6}
        markers={[selfMarker, ...corporateMarkers]}
        className="relative h-[32rem] w-full overflow-hidden rounded-2xl border border-gray-100"
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
    </div>
  );
}
