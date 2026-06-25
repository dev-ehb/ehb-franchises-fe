'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Building2, ChevronRight, Clock, Crown, MapPin, Network, Store, UserCheck } from 'lucide-react';
import { useGetCatalogDetailQuery } from '@/lib/store/api/catalog.api';
import { useSubmitPurchaseRequestMutation } from '@/lib/store/api/purchase-requests.api';
import { TerritoryMap, type MapCircle, type MapMarker } from '@/components/map/territory-map';
import { useAppSelector } from '@/lib/store/hooks';
import { getLevelLabel, getStatusColor, formatDate } from '@/lib/utils';
import type { Franchise } from '@/types/franchises.types';

/**
 * Public franchise detail page.
 *
 *   Top:    Name, status, "Buy now" button (PAYMENT_HOOK)
 *   Map:    Territory circle + child Sub/Corporate territories layered in
 *   Up:     Parent corporate / master chain
 *   Down:   Child franchises and stores under this franchise's subtree
 */
export default function PublicFranchiseDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetCatalogDetailQuery(params.id);
  const auth = useAppSelector((s) => s.auth);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <SimpleHeader authedRole={auth.role} />
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="skeleton h-96 w-full" />
        </div>
      </main>
    );
  }
  if (isError || !data) {
    return (
      <main className="min-h-screen bg-gray-50">
        <SimpleHeader authedRole={auth.role} />
        <div className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-sm text-red-600">Franchise not found.</p>
          <Link href="/" className="mt-4 inline-flex items-center gap-1 text-sm text-primary-700 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to listing
          </Link>
        </div>
      </main>
    );
  }

  const {
    franchise,
    parents,
    child_masters,
    child_subs,
    stores,
    is_available_for_purchase,
    has_pending_request,
    buyer,
  } = data;
  const centerLatLng: [number, number] = [
    franchise.center.coordinates[1],
    franchise.center.coordinates[0],
  ];

  // Only Subs have a territory (radius). Corporate + Master are organisational
  // layers — they get a pin at their centre instead of a circle. The map
  // therefore mixes circles (Subs) and markers (Corporates/Masters + stores).
  const circles: MapCircle[] = [];
  const markers: MapMarker[] = [];

  const CORPORATE_COLOR = '#7c2d12'; // orange-ish
  const MASTER_COLOR    = '#92400e'; // amber-ish
  const SELF_PIN_COLOR  = '#1d4ed8'; // bold blue for "this" pin if non-Sub

  // PARENT pins — Corporate/Master have no radius, just a labelled pin.
  for (const p of parents) {
    markers.push({
      position: [p.center.coordinates[1], p.center.coordinates[0]],
      color: p.level === 'master' ? MASTER_COLOR : CORPORATE_COLOR,
      label: `${p.display_name ?? p.name} • ${p.level === 'master' ? 'Master' : 'Corporate'}${p.code ? ` (${p.code})` : ''}`,
    });
  }

  // SELF — Sub gets a blue circle; Corporate/Master get a pin only.
  if (franchise.level === 'sub' && franchise.radius_km > 0) {
    circles.push({
      center: centerLatLng,
      radiusKm: franchise.radius_km,
      color: '#2563eb',
      fillColor: '#3b82f6',
      label: `${franchise.display_name ?? franchise.name} • This franchise`,
    });
  } else {
    markers.push({
      position: centerLatLng,
      color: SELF_PIN_COLOR,
      label: `${franchise.display_name ?? franchise.name} • This franchise${franchise.code ? ` (${franchise.code})` : ''}`,
    });
  }

  // CHILD Master pins (visible on a Corporate's page).
  for (const m of child_masters) {
    markers.push({
      position: [m.center.coordinates[1], m.center.coordinates[0]],
      color: MASTER_COLOR,
      label: `${m.display_name ?? m.name} • Master${m.code ? ` (${m.code})` : ''}`,
    });
  }

  // CHILD Sub circles (visible on a Master's or Corporate's page).
  for (const s of child_subs) {
    circles.push({
      center: [s.center.coordinates[1], s.center.coordinates[0]],
      radiusKm: s.radius_km,
      color: '#60a5fa',
      fillColor: '#93c5fd',
      label: `${s.display_name ?? s.name} • Sub${s.code ? ` (${s.code})` : ''}`,
    });
  }

  // STORE pins. Pushed last so they render on top of every circle and parent pin.
  for (const s of stores) {
    markers.push({
      position: [s.store_location.coordinates[1], s.store_location.coordinates[0]],
      label: `Store ${s.store_id.slice(-6)}`,
    });
  }

  // Zoom heuristic — driven by the LARGEST visible Sub radius (since only Subs
  // have territory now). For a Corporate/Master page, that's the biggest child
  // or grandchild Sub. For a Sub page, it's the Sub itself.
  const visibleSubRadii = [
    franchise.level === 'sub' ? franchise.radius_km : 0,
    ...child_subs.map((s) => s.radius_km),
  ];
  const maxRadius = Math.max(0, ...visibleSubRadii);
  let zoom: number;
  if (franchise.level === 'corporate') zoom = 9;
  else if (franchise.level === 'master') zoom = 10;
  else zoom = maxRadius >= 10 ? 12 : 13;

  return (
    <main className="min-h-screen bg-gray-50">
      <SimpleHeader authedRole={auth.role} />

      <div className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        {/* Back link */}
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-primary-700 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to all franchises
        </Link>

        {/* Header card */}
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-white p-6 shadow-card">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <LevelIcon level={franchise.level} />
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  {getLevelLabel(franchise.level)}
                </p>
                <h1 className="text-xl font-semibold text-gray-900">
                  {franchise.display_name ?? franchise.name}
                </h1>
                {franchise.code && (
                  <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-600">
                    {franchise.code}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className={`rounded-full px-2 py-0.5 ${getStatusColor(franchise.status)}`}>
                {franchise.status}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {centerLatLng[0].toFixed(4)}, {centerLatLng[1].toFixed(4)}
              </span>
              <span>Region: <span className="font-medium text-gray-700">{franchise.region}</span></span>
              {franchise.level === 'sub' && franchise.radius_km > 0 && (
                <span>Radius: <span className="font-medium text-gray-700">{franchise.radius_km} km</span></span>
              )}
              <span>Created: <span className="font-medium text-gray-700">{formatDate(franchise.created_at)}</span></span>
            </div>
            {buyer && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
                <UserCheck className="h-3.5 w-3.5" />
                <span>
                  Owned by <span className="font-semibold">{buyer.name}</span>
                </span>
              </div>
            )}
          </div>
          <BuyNowButton
            available={is_available_for_purchase}
            hasPendingRequest={has_pending_request}
            buyer={buyer}
            franchiseId={franchise.id}
            franchiseCode={franchise.code}
            franchiseName={franchise.display_name ?? franchise.name}
          />
        </div>

        {/* Map location */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Map location</h2>
          <TerritoryMap
            center={centerLatLng}
            circles={circles}
            markers={markers}
            zoom={zoom}
            legend={
              <div className="flex flex-col gap-1">
                {parents.some((p) => p.level === 'corporate') && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-full bg-orange-800" />
                    Parent Corporate (pin)
                  </span>
                )}
                {parents.some((p) => p.level === 'master') && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-full bg-amber-700" />
                    Parent Master (pin)
                  </span>
                )}
                {franchise.level === 'sub' ? (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-full border-2 border-primary-600 bg-primary-500/20" />
                    This Sub
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-full bg-blue-700" />
                    This {franchise.level === 'corporate' ? 'Corporate' : 'Master'} (pin)
                  </span>
                )}
                {child_masters.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-full bg-amber-700" />
                    Child Master (pin)
                  </span>
                )}
                {child_subs.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-full border-2 border-blue-400 bg-blue-300/30" />
                    Child Sub
                  </span>
                )}
                {stores.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded-full bg-primary-600" />
                    Stores
                  </span>
                )}
              </div>
            }
          />
        </div>

        {/* Up: parent chain */}
        {parents.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Up the hierarchy</h2>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-card">
              <FranchiseChip franchise={franchise} self />
              {parents.map((p) => (
                <span key={p.id} className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                  <FranchiseChip franchise={p} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Down: children (Masters → Subs → Stores) */}
        {child_masters.length > 0 && (
          <Section title="Master franchises under this Corporate" subtitle={`${child_masters.length} total`}>
            <FranchiseGrid franchises={child_masters} />
          </Section>
        )}
        {child_subs.length > 0 && (
          <Section
            title={
              franchise.level === 'corporate' ? 'Sub franchises in this territory' : 'Sub franchises under this Master'
            }
            subtitle={`${child_subs.length} total`}
          >
            <FranchiseGrid franchises={child_subs} />
          </Section>
        )}
        {stores.length > 0 && (
          <Section
            title={
              franchise.level === 'sub' ? 'Stores in this territory' : 'Stores across this network'
            }
            subtitle={`${stores.length} total`}
          >
            <StoreTable
              stores={stores}
              franchiseLookup={new Map(child_subs.map((s) => [s.id, s.display_name ?? s.name]))}
            />
          </Section>
        )}

        {/* Empty state — only a Sub with no stores or a fresh Corporate/Master */}
        {child_masters.length === 0 && child_subs.length === 0 && stores.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400">
            No children or stores under this franchise yet.
          </div>
        )}
      </div>
    </main>
  );
}

// ── pieces ────────────────────────────────────────────────────────────────────

function SimpleHeader({ authedRole }: { authedRole: string | null }) {
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

function LevelIcon({ level }: { level: 'sub' | 'corporate' | 'master' }) {
  // Corporate is now the territory root, so it gets the crown; Master sits in
  // the middle and gets the network glyph; Sub stays a building.
  const Icon = level === 'corporate' ? Crown : level === 'master' ? Network : Building2;
  return (
    <div className="rounded-lg bg-primary-50 p-2 text-primary-700">
      <Icon className="h-5 w-5" />
    </div>
  );
}

function BuyNowButton({
  available,
  hasPendingRequest,
  buyer,
  franchiseId,
  franchiseCode,
  franchiseName,
}: {
  available: boolean;
  hasPendingRequest: boolean;
  buyer: { name: string; email: string } | null;
  franchiseId: string;
  franchiseCode: string;
  franchiseName: string;
}) {
  const [open, setOpen] = useState(false);

  // Priority order:
  //   1. Already owned (buyer present)  -> hard "Owned" pill
  //   2. Pending purchase request       -> disabled "Request pending review"
  //                                         (locks the franchise for everyone)
  //   3. Otherwise unavailable          -> "Already assigned" (legacy SSO path)
  //   4. Available                      -> "Buy now" opens the modal
  if (buyer) {
    return (
      <div
        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800"
        title={`Owned by ${buyer.name}`}
      >
        <UserCheck className="h-4 w-4" />
        Owned by {buyer.name}
      </div>
    );
  }
  if (hasPendingRequest) {
    return (
      <button
        disabled
        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800"
        title="An EHB admin is reviewing an existing buy request for this franchise. New requests are blocked until that one is resolved."
      >
        <Clock className="h-4 w-4" />
        Request pending review
      </button>
    );
  }
  if (!available) {
    return (
      <button
        disabled
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white opacity-60"
        title="Already assigned"
      >
        Already assigned
      </button>
    );
  }
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
      >
        Buy now
      </button>
      {open && (
        <BuyForm
          franchiseId={franchiseId}
          franchiseCode={franchiseCode}
          franchiseName={franchiseName}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

/**
 * Modal "Buy now" form. Submits a POST /purchase-requests and shows a success
 * state. Payment is intentionally out of scope right now — admin reviews the
 * request in backoffice and forwards a temp password to the buyer manually.
 */
function BuyForm({
  franchiseId,
  franchiseCode,
  franchiseName,
  onClose,
}: {
  franchiseId: string;
  franchiseCode: string;
  franchiseName: string;
  onClose: () => void;
}) {
  const [submit, { isLoading }] = useSubmitPurchaseRequestMutation();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (fullName.trim().length < 2 || !email.trim()) {
      setError('Name and email are required.');
      return;
    }
    try {
      await submit({
        franchise_id: franchiseId,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim() || undefined,
      }).unwrap();
      setDone(true);
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string | string[] } } | undefined)?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Submission failed. Please try again.');
    }
  }

  return (
    // z-[2000] sits above react-leaflet's controls (which use z-index 1000).
    // overflow-y-auto on the outer wrapper lets the modal scroll on short
    // viewports so the submit button is always reachable.
    <div className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <div className="my-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {done ? (
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl">
              ✓
            </div>
            <h2 className="text-base font-semibold text-gray-900">Request sent to admin</h2>
            <p className="text-sm text-gray-600">
              An EHB staff member will review your request for{' '}
              <strong>{franchiseName}</strong> ({franchiseCode}) and email you a temporary
              password within the next business day. With that password you can sign in at
              the franchises portal and start managing your territory.
            </p>
            <button
              onClick={onClose}
              className="mt-2 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Buy this franchise</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Submitting <span className="font-medium text-gray-700">{franchiseName}</span>
              <span className="ml-1 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
                {franchiseCode}
              </span>
            </p>

            <Field label="Full name *" value={fullName} onChange={setFullName} placeholder="john doe" />
            <Field
              label="Email *"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="you@example.com"
            />
            <Field
              label="Phone (optional)"
              value={phone}
              onChange={setPhone}
              placeholder="+92-300-0000000"
            />
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                Message to admin (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Why you want this franchise, your experience, etc."
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Payment is not collected yet. Submitting sends a request to EHB admin — they&apos;ll
              review it and email you a temporary password if approved.
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {isLoading ? 'Sending…' : 'Send request to admin'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
      />
    </div>
  );
}

function FranchiseChip({ franchise, self = false }: { franchise: Franchise; self?: boolean }) {
  return (
    <Link
      href={`/franchises/${franchise.id}`}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
        self ? 'border-primary-300 bg-primary-50 text-primary-800' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span className="text-[10px] uppercase tracking-wide text-gray-400">
        {getLevelLabel(franchise.level)}
      </span>
      <span className="font-medium">{franchise.display_name ?? franchise.name}</span>
    </Link>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function FranchiseGrid({ franchises }: { franchises: Franchise[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {franchises.map((f) => (
        <Link
          key={f.id}
          href={`/franchises/${f.id}`}
          className="block rounded-xl border border-gray-200 bg-white p-3 shadow-card hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="truncate text-sm font-medium text-gray-900">
                {f.display_name ?? f.name}
              </div>
              {f.code && (
                <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">
                  {f.code}
                </span>
              )}
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${getStatusColor(f.status)}`}>
              {f.status}
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {f.region} · {f.radius_km} km
            {f.level === 'sub' ? ` · ${f.store_count} stores` : ` · ${f.child_count} children`}
          </div>
        </Link>
      ))}
    </div>
  );
}

function StoreTable({
  stores,
  franchiseLookup,
}: {
  stores: {
    id: string;
    store_id: string;
    store_name?: string | null;
    franchise_id: string;
    store_location: { coordinates: [number, number] };
  }[];
  franchiseLookup: Map<string, string>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-card">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
          <tr>
            <th className="px-4 py-2 font-medium">Store</th>
            <th className="px-4 py-2 font-medium">Sub franchise</th>
            <th className="px-4 py-2 font-medium">Lat, Lng</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id} className="border-b border-gray-100 last:border-0 align-top">
              <td className="px-4 py-2">
                <div className="flex items-start gap-2">
                  <Store className="mt-0.5 h-3 w-3 shrink-0 text-gray-400" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-gray-800">
                      {s.store_name ?? 'Unnamed store'}
                    </div>
                    <div className="font-mono text-[11px] text-gray-400">{s.store_id}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2 text-gray-600">
                {franchiseLookup.get(s.franchise_id) ?? s.franchise_id.slice(-6)}
              </td>
              <td className="px-4 py-2 text-gray-600">
                {s.store_location.coordinates[1].toFixed(4)}, {s.store_location.coordinates[0].toFixed(4)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
