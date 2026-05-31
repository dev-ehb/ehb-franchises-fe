'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import {
  useGetSubDashboardQuery,
  useRenameMyDisplayNameMutation,
} from '@/lib/store/api/franchises.api';
import { TerritoryMap, type MapMarker } from '@/components/map/territory-map';
import { KpiCard } from '@/components/dashboard/kpi-card';
import {
  ComplianceChecklist,
  type ComplianceCheck,
} from '@/components/dashboard/compliance-checklist';
import { formatDate, getStatusColor } from '@/lib/utils';

/**
 * Sub Franchise dashboard.
 *
 *   Shows the owner's franchise card, capacity KPIs, the 10 km local territory
 *   map with each assigned store pinned, the full store list, and a live
 *   compliance checklist derived from territory + capacity state.
 */
export default function SubDashboardPage() {
  const { data, isLoading, isError, error } = useGetSubDashboardQuery();

  if (isLoading) return <div className="skeleton h-96 w-full" />;
  if (isError || !data) {
    return (
      <p className="text-sm text-red-600">
        {((error as { data?: { message?: string } } | undefined)?.data?.message) ??
          'Could not load your Sub dashboard.'}
      </p>
    );
  }

  const { franchise, stores, kpis } = data;
  const centerLatLng: [number, number] = [
    franchise.center.coordinates[1],
    franchise.center.coordinates[0],
  ];

  const markers: MapMarker[] = stores.map((s) => ({
    position: [s.store_location.coordinates[1], s.store_location.coordinates[0]],
    label: `Store ${s.store_id.slice(-6)}`,
  }));

  const capacityPercent = Math.round((kpis.assigned_store_count / kpis.capacity_max) * 100);
  const checks: ComplianceCheck[] = [
    {
      label: 'Within capacity',
      ok: kpis.capacity_remaining > 0,
      detail: `${kpis.assigned_store_count} / ${kpis.capacity_max} stores (${capacityPercent}%)`,
    },
    {
      label: 'Territory radius set',
      ok: franchise.radius_km > 0,
      detail: `${franchise.radius_km} km radius around the franchise centre`,
    },
    {
      label: 'Franchise active',
      ok: franchise.status === 'Active',
      detail: `Current status: ${franchise.status}`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <DisplayNameWithEdit
          displayName={franchise.display_name ?? franchise.name}
          code={franchise.code}
          lastRenamedAt={franchise.display_name_updated_at ?? null}
        />
        <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(franchise.status)}`}>
          {franchise.status}
        </span>
        <span className="text-xs text-gray-500">Activated {formatDate(franchise.updated_at)}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Assigned stores"
          value={kpis.assigned_store_count}
          hint={`${kpis.capacity_remaining} slots remaining`}
          tone="primary"
        />
        <KpiCard
          label="Capacity used"
          value={`${capacityPercent}%`}
          hint={`Max ${kpis.capacity_max} per Sub`}
          tone={capacityPercent >= 90 ? 'warning' : 'default'}
        />
        <KpiCard label="Territory radius" value={`${franchise.radius_km} km`} />
        <KpiCard label="Region" value={franchise.region} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TerritoryMap
            center={centerLatLng}
            radiusKm={franchise.radius_km}
            markers={markers}
            zoom={12}
            legend={
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full bg-primary-600" />
                  Stores
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-full border-2 border-primary-600 bg-primary-500/20" />
                  Territory
                </span>
              </div>
            }
          />
        </div>
        <ComplianceChecklist checks={checks} />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
          <h2 className="text-sm font-semibold text-gray-700">My stores</h2>
          <span className="text-xs text-gray-500">{stores.length} active</span>
        </div>
        {stores.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No stores yet. New GoSellr sellers in your territory show up here automatically.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-2 font-medium">Store</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Lat, Lng</th>
                <th className="px-4 py-2 font-medium">Linked</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s._id} className="border-b border-gray-100 last:border-0 align-top">
                  <td className="px-4 py-2">
                    <div className="text-sm font-medium text-gray-800">
                      {s.store_name ?? 'Unnamed store'}
                    </div>
                    <div className="font-mono text-[11px] text-gray-400">{s.store_id}</div>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{s.source_platform}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {s.store_location.coordinates[1].toFixed(4)},{' '}
                    {s.store_location.coordinates[0].toFixed(4)}
                  </td>
                  <td className="px-4 py-2 text-gray-500">{formatDate(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/**
 * Header title with an inline pencil. Click to enter rename mode. Server enforces
 * the 30-day cooldown; we surface the error message as-is when it returns.
 */
function DisplayNameWithEdit({
  displayName,
  code,
  lastRenamedAt,
}: {
  displayName: string;
  code?: string;
  lastRenamedAt: string | null;
}) {
  const [rename, { isLoading }] = useRenameMyDisplayNameMutation();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(displayName);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setError(null);
    const next = value.trim();
    if (next.length < 2 || next.length > 60) {
      setError('Display name must be 2–60 characters');
      return;
    }
    try {
      await rename({ display_name: next }).unwrap();
      setEditing(false);
    } catch (e: unknown) {
      const message =
        (e as { data?: { message?: string } } | undefined)?.data?.message ??
        'Rename failed';
      setError(message);
    }
  }

  if (editing) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          onClick={onSave}
          disabled={isLoading}
          className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {isLoading ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setValue(displayName);
            setError(null);
          }}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        {error && <p className="basis-full text-xs text-red-600">{error}</p>}
        {lastRenamedAt && !error && (
          <p className="basis-full text-xs text-gray-500">
            Last renamed {formatDate(lastRenamedAt)} · soft cap of one rename per 30 days.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <h1 className="text-lg font-semibold text-gray-900">{displayName}</h1>
      {code && (
        <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
          {code}
        </span>
      )}
      <button
        onClick={() => setEditing(true)}
        title="Rename display name"
        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}
