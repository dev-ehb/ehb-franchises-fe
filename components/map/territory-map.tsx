'use client';

import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';
import type { ReactNode } from 'react';

/**
 * TerritoryMap - reusable react-leaflet wrapper.
 *
 * Renders the base OpenStreetMap tile layer, an optional list of radius
 * circles (Sub territories, Corporate boundaries, etc.), and an optional list
 * of point markers (store pins, franchise centres). All leaflet imports go
 * through next/dynamic with `ssr: false` because the library touches `window`.
 */
const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then((m) => m.Circle), { ssr: false });
const CircleMarker = dynamic(() => import('react-leaflet').then((m) => m.CircleMarker), { ssr: false });
const Tooltip = dynamic(() => import('react-leaflet').then((m) => m.Tooltip), { ssr: false });

export interface MapCircle {
  center: LatLngExpression;
  /** Radius in kilometres. */
  radiusKm: number;
  color?: string;
  fillColor?: string;
  label?: string;
}

export interface MapMarker {
  position: LatLngExpression;
  color?: string;
  label?: string;
}

interface TerritoryMapProps {
  center: LatLngExpression;
  zoom?: number;
  /** Backward-compatible single-circle prop. If you pass `radiusKm` we draw a
   *  circle at `center` with that radius. Prefer `circles[]` for richer cases. */
  radiusKm?: number;
  circles?: MapCircle[];
  markers?: MapMarker[];
  /** Optional class to override the default fixed height. */
  className?: string;
  /** Optional content rendered into the map's bottom-right corner. */
  legend?: ReactNode;
}

export function TerritoryMap({
  center,
  zoom = 12,
  radiusKm,
  circles = [],
  markers = [],
  className,
  legend,
}: TerritoryMapProps) {
  const allCircles: MapCircle[] =
    typeof radiusKm === 'number' ? [{ center, radiusKm }, ...circles] : circles;

  return (
    <div
      className={
        className ??
        'relative h-80 w-full overflow-hidden rounded-2xl border border-gray-100'
      }
    >
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {allCircles.map((c, i) => (
          <Circle
            key={`c-${i}`}
            center={c.center}
            radius={c.radiusKm * 1000}
            pathOptions={{
              color: c.color ?? '#2563eb',
              fillColor: c.fillColor ?? '#3b82f6',
              fillOpacity: 0.12,
              weight: 2,
            }}
          >
            {c.label && <Tooltip>{c.label}</Tooltip>}
          </Circle>
        ))}
        {markers.map((m, i) => (
          <CircleMarker
            key={`m-${i}`}
            center={m.position}
            radius={6}
            pathOptions={{
              color: m.color ?? '#1d4ed8',
              fillColor: m.color ?? '#1d4ed8',
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            {m.label && <Tooltip>{m.label}</Tooltip>}
          </CircleMarker>
        ))}
      </MapContainer>
      {legend && (
        // Leaflet's panes go up to z-index 1000 (controls). The legend needs
        // to sit above all of them or it disappears behind the tile / marker
        // / control layers. pointer-events-auto keeps the legend interactive
        // even though the outer wrapper sits over the map.
        <div className="pointer-events-auto absolute bottom-3 right-3 z-[1100] rounded-lg border border-gray-100 bg-white/95 px-3 py-2 text-xs shadow-md backdrop-blur-sm">
          {legend}
        </div>
      )}
    </div>
  );
}
