'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { LatLngExpression } from 'leaflet';
import type { ReactNode } from 'react';
import { MapPin } from 'lucide-react';
import { ErrorBoundary } from '@/components/ui/error-boundary';

/**
 * TerritoryMap - reusable react-leaflet wrapper.
 *
 * Renders the base OpenStreetMap tile layer, an optional list of radius
 * circles (Sub territories, Corporate boundaries, etc.), and an optional list
 * of point markers (store pins, franchise centres). All leaflet imports go
 * through next/dynamic with `ssr: false` because the library touches `window`.
 *
 * Resilience (so the map never blanks the page):
 *   - invalid/missing coordinates short-circuit to a fallback;
 *   - a component-level ErrorBoundary isolates a map crash (rest of page survives);
 *   - tile-load failures (offline / OSM down) surface a non-blocking note.
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

const WRAPPER_CLASS =
  'relative h-80 w-full overflow-hidden rounded-2xl border border-gray-100';

/** Box-filling message shown when the map cannot be rendered. */
function MapMessage({ text }: { text: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-50 text-center">
      <MapPin className="h-6 w-6 text-gray-400" />
      <p className="mt-2 text-sm text-gray-500">{text}</p>
    </div>
  );
}

/** True only for a finite [lat, lng] tuple or { lat, lng } object. */
function isValidCenter(center: LatLngExpression): boolean {
  if (Array.isArray(center)) {
    return Number.isFinite(center[0]) && Number.isFinite(center[1]);
  }
  if (center && typeof center === 'object') {
    const c = center as { lat?: number; lng?: number };
    return Number.isFinite(c.lat) && Number.isFinite(c.lng);
  }
  return false;
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
  const [tilesFailed, setTilesFailed] = useState(false);
  const wrapperClass = className ?? WRAPPER_CLASS;

  // Guard: bad/missing coordinates -> fallback instead of a broken map.
  if (!isValidCenter(center)) {
    return (
      <div className={wrapperClass}>
        <MapMessage text="Location not available." />
      </div>
    );
  }

  const allCircles: MapCircle[] =
    typeof radiusKm === 'number' ? [{ center, radiusKm }, ...circles] : circles;

  return (
    <div className={wrapperClass}>
      <ErrorBoundary fallback={<MapMessage text="Map could not be loaded." />}>
        <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{ tileerror: () => setTilesFailed(true) }}
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
      </ErrorBoundary>

      {tilesFailed && (
        <div className="pointer-events-none absolute left-3 top-3 z-[1100] rounded-md border border-amber-200 bg-amber-50/95 px-2.5 py-1 text-xs text-amber-800 shadow-sm">
          Some map tiles failed to load — check your connection.
        </div>
      )}

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
