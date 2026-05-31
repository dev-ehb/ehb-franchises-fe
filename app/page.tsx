'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Building2, Clock, Crown, MapPin, Network, UserCheck } from 'lucide-react';
import { useGetCatalogQuery } from '@/lib/store/api/catalog.api';
import { useAppSelector } from '@/lib/store/hooks';
import { getStatusColor } from '@/lib/utils';
import type { Franchise, FranchiseLevel } from '@/types/franchises.types';

/**
 * Public franchises landing page.
 *
 * Anyone (signed in or not) can browse the network: Master, Corporate, and
 * Sub franchises in three sections. Each card links to the public detail
 * page with map + hierarchy. The header offers a sign-in link (or a
 * jump-to-dashboard link for already-signed-in owners).
 */
export default function LandingPage() {
  const { data, isLoading, isError } = useGetCatalogQuery();
  const auth = useAppSelector((s) => s.auth);

  // Materialise as a Set once per render so per-card lookups are O(1) rather
  // than O(n) array scans across every section.
  const pendingIds = useMemo(
    () => new Set(data?.pending_request_franchise_ids ?? []),
    [data?.pending_request_franchise_ids],
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <Header authedRole={auth.role} />

      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-2xl font-semibold text-gray-900">EHB Franchises</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Browse every Master, Corporate and Sub franchise in the EHB network.
            Click any card to view its territory on the map and explore its hierarchy
            up to its parent franchise and down to its stores.
          </p>
          {data && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <Badge>Master: {data.counts.master}</Badge>
              <Badge>Corporate: {data.counts.corporate}</Badge>
              <Badge>Sub: {data.counts.sub}</Badge>
              <Badge>Total: {data.counts.total}</Badge>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-6 py-10">
        {isLoading && <div className="skeleton h-40 w-full" />}
        {isError && (
          <p className="text-sm text-red-600">
            Could not load the catalog. Is the franchises API running on port 3010?
          </p>
        )}

        {data && (
          <>
            <FranchiseGroup
              title="Corporate Franchises"
              subtitle="Top of the hierarchy — one per territory. Owns every Master and Sub inside its area."
              icon={Crown}
              level="corporate"
              franchises={data.corporate}
              pendingIds={pendingIds}
            />
            <FranchiseGroup
              title="Master Franchises"
              subtitle="Middle layer. Each Master manages a slice of Subs underneath its Corporate."
              icon={Network}
              level="master"
              franchises={data.master}
              pendingIds={pendingIds}
            />
            <FranchiseGroup
              title="Sub Franchises"
              subtitle="The local operating layer. Each Sub covers a 10 km territory and up to 10 stores."
              icon={Building2}
              level="sub"
              franchises={data.sub}
              pendingIds={pendingIds}
            />
          </>
        )}
      </section>
    </main>
  );
}

// ── pieces ────────────────────────────────────────────────────────────────────

function Header({ authedRole }: { authedRole: string | null }) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-sm font-semibold text-gray-900">
          EHB Franchises
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {authedRole ? (
            <Link
              href={`/${authedRole}`}
              className="rounded-lg bg-primary-600 px-3 py-1.5 font-medium text-white hover:bg-primary-700"
            >
              My dashboard
            </Link>
          ) : (
            <Link href="/login" className="rounded-lg bg-primary-600 px-3 py-1.5 font-medium text-white hover:bg-primary-700">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs">
      {children}
    </span>
  );
}

function FranchiseGroup({
  title,
  subtitle,
  icon: Icon,
  level,
  franchises,
  pendingIds,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  level: FranchiseLevel;
  franchises: Franchise[];
  pendingIds: Set<string>;
}) {
  return (
    <div>
      <div className="mb-4 flex items-start gap-3">
        <div className="rounded-lg bg-primary-50 p-2 text-primary-700">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      {franchises.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
          No {level} franchises yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {franchises.map((f) => (
            <FranchiseCard
              key={f._id}
              franchise={f}
              hasPendingRequest={pendingIds.has(f._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FranchiseCard({
  franchise,
  hasPendingRequest,
}: {
  franchise: Franchise;
  hasPendingRequest: boolean;
}) {
  const [lng, lat] = franchise.center.coordinates;
  // Owned > Pending > nothing. Both badges only ever appear when the franchise
  // is actually unavailable, so the empty/available case stays uncluttered.
  const owned = Boolean(franchise.owner_name || franchise.owner_email);
  return (
    <Link
      href={`/franchises/${franchise._id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-card transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {franchise.display_name ?? franchise.name}
          </h3>
          {franchise.code && (
            <span className="mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
              {franchise.code}
            </span>
          )}
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${getStatusColor(franchise.status)}`}>
          {franchise.status}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
        <MapPin className="h-3 w-3" />
        <span>{lat.toFixed(4)}, {lng.toFixed(4)}</span>
        <span className="ml-auto">{franchise.radius_km} km</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span>Region: <span className="font-medium text-gray-700">{franchise.region}</span></span>
        {franchise.level === 'sub' && (
          <span>Stores: <span className="font-medium text-gray-700">{franchise.store_count}</span></span>
        )}
        {franchise.level !== 'sub' && (
          <span>Children: <span className="font-medium text-gray-700">{franchise.child_count}</span></span>
        )}
      </div>
      {owned ? (
        <div className="mt-3 inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
          <UserCheck className="h-3 w-3" />
          Owned by {franchise.owner_name ?? franchise.owner_email}
        </div>
      ) : hasPendingRequest ? (
        <div className="mt-3 inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800">
          <Clock className="h-3 w-3" />
          Buy request pending review
        </div>
      ) : null}
      <div className="mt-3 text-xs font-medium text-primary-700">View details &amp; map →</div>
    </Link>
  );
}
