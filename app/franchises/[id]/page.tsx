'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ChevronRight,
  Clock,
  Crown,
  MapPin,
  Network,
  Store,
  UserCheck,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import { useGetCatalogDetailQuery } from '@/lib/store/api/catalog.api';
import { useSubmitPurchaseRequestMutation } from '@/lib/store/api/purchase-requests.api';
import { TerritoryMap, type MapCircle, type MapMarker } from '@/components/map/territory-map';
import { useAppSelector } from '@/lib/store/hooks';
import { getLevelLabel, getStatusColor, formatDate } from '@/lib/utils';
import { ErrorState } from '@/components/ui/error-state';
import type { Franchise, FranchiseLevel } from '@/types/franchises.types';

export default function PublicFranchiseDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useGetCatalogDetailQuery(params.id);
  const auth = useAppSelector((s) => s.auth);

  if (isLoading) {
    return (
      <main className="min-h-dvh bg-white">
        <SiteHeader authedRole={auth.role} />
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <div className="skeleton h-96 w-full rounded-4xl" />
        </div>
      </main>
    );
  }
  if (isError || !data) {
    return (
      <main className="min-h-dvh bg-white">
        <SiteHeader authedRole={auth.role} />
        <div className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8">
          <ErrorState
            message="We could not load this franchise. Please try again."
            onRetry={refetch}
          />
          <Link href="/" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to the network
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

  const circles: MapCircle[] = [];
  const markers: MapMarker[] = [];

  const CORPORATE_COLOR = '#7c3a20';
  const MASTER_COLOR = '#4a2f7d';
  const SELF_PIN_COLOR = '#1f6e47';

  for (const p of parents) {
    markers.push({
      position: [p.center.coordinates[1], p.center.coordinates[0]],
      color: p.level === 'master' ? MASTER_COLOR : CORPORATE_COLOR,
      label: `${p.display_name ?? p.name} • ${p.level === 'master' ? 'Master' : 'Corporate'}${p.code ? ` (${p.code})` : ''}`,
    });
  }

  if (franchise.level === 'sub' && franchise.radius_km > 0) {
    circles.push({
      center: centerLatLng,
      radiusKm: franchise.radius_km,
      color: '#1f6e47',
      fillColor: '#2b885b',
      label: `${franchise.display_name ?? franchise.name} • This franchise`,
    });
  } else {
    markers.push({
      position: centerLatLng,
      color: SELF_PIN_COLOR,
      label: `${franchise.display_name ?? franchise.name} • This franchise${franchise.code ? ` (${franchise.code})` : ''}`,
    });
  }

  for (const m of child_masters) {
    markers.push({
      position: [m.center.coordinates[1], m.center.coordinates[0]],
      color: MASTER_COLOR,
      label: `${m.display_name ?? m.name} • Master${m.code ? ` (${m.code})` : ''}`,
    });
  }

  for (const s of child_subs) {
    circles.push({
      center: [s.center.coordinates[1], s.center.coordinates[0]],
      radiusKm: s.radius_km,
      color: '#43a373',
      fillColor: '#71bf95',
      label: `${s.display_name ?? s.name} • Sub${s.code ? ` (${s.code})` : ''}`,
    });
  }

  for (const s of stores) {
    markers.push({
      position: [s.store_location.coordinates[1], s.store_location.coordinates[0]],
      color: '#1f6e47',
      label: `Store ${s.store_id.slice(-6)}`,
    });
  }

  const visibleSubRadii = [
    franchise.level === 'sub' ? franchise.radius_km : 0,
    ...child_subs.map((s) => s.radius_km),
  ];
  const maxRadius = Math.max(0, ...visibleSubRadii);
  let zoom: number;
  if (franchise.level === 'corporate') zoom = 9;
  else if (franchise.level === 'master') zoom = 10;
  else zoom = maxRadius >= 10 ? 12 : 13;

  const tone = LEVEL_TONE[franchise.level];
  const HeadIcon = tone.icon;

  return (
    <main className="min-h-dvh bg-white">
      <SiteHeader authedRole={auth.role} />

      <div className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800">
          <ArrowLeft className="h-4 w-4" /> Back to the network
        </Link>

        {/* Header card */}
        <div className="overflow-hidden rounded-4xl border border-gray-100 bg-white shadow-soft">
          <div className={`h-1.5 w-full ${tone.bar}`} />
          <div className="flex flex-wrap items-start justify-between gap-5 p-6 sm:p-7">
            <div className="space-y-3">
              <div className="flex items-center gap-3.5">
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tone.wrap}`}>
                  <HeadIcon className="h-6 w-6" aria-hidden />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                    {getLevelLabel(franchise.level)}
                  </p>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink">
                    {franchise.display_name ?? franchise.name}
                  </h1>
                  {franchise.code && (
                    <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-500">
                      {franchise.code}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                <span className={`rounded-full px-2.5 py-0.5 font-medium capitalize ${getStatusColor(franchise.status)}`}>
                  {franchise.status}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" aria-hidden />
                  <span className="font-mono">
                    {centerLatLng[0].toFixed(4)}, {centerLatLng[1].toFixed(4)}
                  </span>
                </span>
                <span>Region: <span className="font-semibold text-ink">{franchise.region}</span></span>
                {franchise.level === 'sub' && franchise.radius_km > 0 && (
                  <span>Radius: <span className="font-semibold text-ink">{franchise.radius_km} km</span></span>
                )}
                <span>Created: <span className="font-semibold text-ink">{formatDate(franchise.created_at)}</span></span>
              </div>
              {buyer && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                  <UserCheck className="h-3.5 w-3.5" aria-hidden />
                  Owned by <span className="font-semibold">{buyer.name}</span>
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
        </div>

        {/* Map */}
        <div>
          <h2 className="mb-3 font-display text-lg font-bold text-ink">Territory map</h2>
          <div className="overflow-hidden rounded-4xl border border-gray-100 shadow-soft">
            <TerritoryMap
              center={centerLatLng}
              circles={circles}
              markers={markers}
              zoom={zoom}
              legend={
                <div className="flex flex-col gap-1.5">
                  {parents.some((p) => p.level === 'corporate') && (
                    <LegendItem swatch="bg-[#7c3a20]" label="Parent Corporate (pin)" />
                  )}
                  {parents.some((p) => p.level === 'master') && (
                    <LegendItem swatch="bg-[#4a2f7d]" label="Parent Master (pin)" />
                  )}
                  {franchise.level === 'sub' ? (
                    <LegendItem swatch="border-2 border-brand-600 bg-brand-500/20" label="This Sub (territory)" />
                  ) : (
                    <LegendItem swatch="bg-brand-600" label={`This ${franchise.level === 'corporate' ? 'Corporate' : 'Master'} (pin)`} />
                  )}
                  {child_masters.length > 0 && (
                    <LegendItem swatch="bg-[#4a2f7d]" label="Child Master (pin)" />
                  )}
                  {child_subs.length > 0 && (
                    <LegendItem swatch="border-2 border-brand-400 bg-brand-300/40" label="Child Sub" />
                  )}
                  {stores.length > 0 && <LegendItem swatch="bg-brand-600" label="Stores" />}
                </div>
              }
            />
          </div>
        </div>

        {/* Up: parent chain */}
        {parents.length > 0 && (
          <div>
            <h2 className="mb-3 font-display text-lg font-bold text-ink">Up the hierarchy</h2>
            <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-gray-100 bg-cream p-4">
              <FranchiseChip franchise={franchise} self />
              {parents.map((p) => (
                <span key={p.id} className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden />
                  <FranchiseChip franchise={p} />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Down: children */}
        {child_masters.length > 0 && (
          <Section title="Master franchises under this Corporate" subtitle={`${child_masters.length} total`}>
            <FranchiseGrid franchises={child_masters} />
          </Section>
        )}
        {child_subs.length > 0 && (
          <Section
            title={franchise.level === 'corporate' ? 'Sub franchises in this territory' : 'Sub franchises under this Master'}
            subtitle={`${child_subs.length} total`}
          >
            <FranchiseGrid franchises={child_subs} />
          </Section>
        )}
        {stores.length > 0 && (
          <Section
            title={franchise.level === 'sub' ? 'Stores in this territory' : 'Stores across this network'}
            subtitle={`${stores.length} total`}
          >
            <StoreTable
              stores={stores}
              franchiseLookup={new Map(child_subs.map((s) => [s.id, s.display_name ?? s.name]))}
            />
          </Section>
        )}

        {child_masters.length === 0 && child_subs.length === 0 && stores.length === 0 && (
          <div className="rounded-4xl border border-dashed border-gray-300 p-10 text-center text-sm text-gray-400">
            No children or stores under this franchise yet.
          </div>
        )}
      </div>
    </main>
  );
}

// ── tokens ──────────────────────────────────────────────────────────────────

const LEVEL_TONE: Record<FranchiseLevel, { wrap: string; bar: string; icon: React.ElementType }> = {
  corporate: { wrap: 'bg-brand-50 text-brand-700', bar: 'bg-brand-600', icon: Crown },
  master: { wrap: 'bg-lav-soft text-lav-ink', bar: 'bg-lav', icon: Network },
  sub: { wrap: 'bg-coral-soft text-coral-ink', bar: 'bg-coral', icon: Building2 },
};

// ── pieces ────────────────────────────────────────────────────────────────────

function SiteHeader({ authedRole }: { authedRole: string | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white">
            <Network className="h-4 w-4" aria-hidden />
          </span>
          EHB<span className="text-brand-600">Franchises</span>
        </Link>

        {/* Desktop actions (lg and up) */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <Link href="/" className="rounded-full px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-gray-100">
            Browse network
          </Link>
          <Link
            href={authedRole ? `/${authedRole}` : '/login'}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            {authedRole ? 'My dashboard' : 'Sign in'}
            {authedRole && <ArrowRight className="h-4 w-4" aria-hidden />}
          </Link>
        </div>

        {/* Mobile / tablet hamburger (below lg) */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-ink transition-colors hover:bg-gray-100 lg:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>
    </header>

      {/* Mobile / tablet menu — backdrop + left slide-in drawer (90% width).
          Rendered OUTSIDE <header> because the header's backdrop-blur would
          otherwise become the containing block for these fixed elements. */}
      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden
        className={`fixed inset-0 z-[1900] bg-black/30 transition-opacity duration-300 lg:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed inset-y-0 left-0 z-[2000] flex w-[90%] flex-col bg-white shadow-xl transition-transform duration-300 lg:hidden ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink"
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white">
              <Network className="h-4 w-4" aria-hidden />
            </span>
            EHB<span className="text-brand-600">Franchises</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="grid h-10 w-10 place-items-center rounded-lg text-ink transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-4">
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="rounded-full px-4 py-2.5 text-center text-sm font-semibold text-ink ring-1 ring-inset ring-gray-200 transition-colors hover:bg-gray-50"
          >
            Browse network
          </Link>
          <Link
            href={authedRole ? `/${authedRole}` : '/login'}
            onClick={() => setMenuOpen(false)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-700"
          >
            {authedRole ? 'My dashboard' : 'Sign in'}
            {authedRole && <ArrowRight className="h-4 w-4" aria-hidden />}
          </Link>
        </div>
      </div>
    </>
  );
}

function LegendItem({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-xs text-gray-600">
      <span className={`inline-block h-3 w-3 rounded-full ${swatch}`} aria-hidden />
      {label}
    </span>
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

  if (buyer) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800" title={`Owned by ${buyer.name}`}>
        <UserCheck className="h-4 w-4" aria-hidden />
        Owned by {buyer.name}
      </div>
    );
  }
  if (hasPendingRequest) {
    return (
      <button
        disabled
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800"
        title="An EHB admin is reviewing an existing buy request for this franchise."
      >
        <Clock className="h-4 w-4" aria-hidden />
        Request pending review
      </button>
    );
  }
  if (!available) {
    return (
      <button disabled className="cursor-not-allowed rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white opacity-50" title="Already assigned">
        Already assigned
      </button>
    );
  }
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        Claim this territory
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
    <div className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto bg-brand-950/50 p-4 backdrop-blur-sm sm:items-center">
      <div className="my-auto w-full max-w-md rounded-4xl bg-white p-6 shadow-float sm:p-7">
        {done ? (
          <div className="space-y-3 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-50 text-brand-600">
              <CheckCircle2 className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="font-display text-lg font-bold text-ink">Request sent to admin</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              An EHB staff member will review your request for{' '}
              <strong className="text-ink">{franchiseName}</strong> ({franchiseCode}) and email you a
              temporary password within the next business day.
            </p>
            <button
              onClick={onClose}
              className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-extrabold tracking-tight text-ink">Claim this territory</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {franchiseName}
                  <span className="ml-1.5 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-600">{franchiseCode}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-full px-3 py-1 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-ink"
              >
                Cancel
              </button>
            </div>

            <Field label="Full name *" value={fullName} onChange={setFullName} placeholder="John Doe" />
            <Field label="Email *" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
            <Field label="Phone (optional)" value={phone} onChange={setPhone} placeholder="+92-300-0000000" />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">Message to admin (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Why you want this franchise, your experience, etc."
                className="mt-1.5 w-full rounded-2xl border border-gray-200 px-3.5 py-2.5 text-sm text-ink placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </div>

            <div className="rounded-2xl border border-brand-100 bg-brand-50 p-3.5 text-xs leading-relaxed text-brand-800">
              Payment is not collected yet. Submitting sends a request to EHB admin — they&apos;ll review it and email you a temporary password if approved.
            </div>

            {error && <p className="text-xs font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-brand-600 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {isLoading ? 'Sending…' : 'Send request to admin'}
              {!isLoading && <ArrowRight className="h-4 w-4" aria-hidden />}
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
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-2xl border border-gray-200 px-3.5 py-2.5 text-sm text-ink placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      />
    </div>
  );
}

function FranchiseChip({ franchise, self = false }: { franchise: Franchise; self?: boolean }) {
  return (
    <Link
      href={`/franchises/${franchise.id}`}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
        self ? 'border-brand-300 bg-brand-50 text-brand-800' : 'border-gray-200 bg-white text-gray-700 hover:border-brand-200 hover:bg-brand-50'
      }`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{getLevelLabel(franchise.level)}</span>
      <span className="font-semibold">{franchise.display_name ?? franchise.name}</span>
    </Link>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
        {subtitle && <span className="text-xs font-medium text-gray-400">{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function FranchiseGrid({ franchises }: { franchises: Franchise[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {franchises.map((f) => {
        const tone = LEVEL_TONE[f.level];
        const Icon = tone.icon;
        return (
          <Link
            key={f.id}
            href={`/franchises/${f.id}`}
            className="group flex flex-col rounded-3xl border border-gray-100 bg-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone.wrap}`}>
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <div className="truncate font-display text-sm font-bold text-ink">{f.display_name ?? f.name}</div>
                  {f.code && (
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">{f.code}</span>
                  )}
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getStatusColor(f.status)}`}>
                {f.status}
              </span>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              {f.region} · {f.radius_km} km
              {f.level === 'sub' ? ` · ${f.store_count} stores` : ` · ${f.child_count} children`}
            </div>
            <div className="mt-3 flex items-center gap-1 border-t border-gray-100 pt-2.5 text-xs font-semibold text-brand-700">
              View details
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </div>
          </Link>
        );
      })}
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
    <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-soft">
      {/* Desktop table (lg and up) */}
      <table className="hidden w-full text-sm lg:table">
        <thead className="border-b border-gray-100 bg-cream text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Store</th>
            <th className="px-4 py-3 font-semibold">Sub franchise</th>
            <th className="px-4 py-3 font-semibold">Lat, Lng</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id} className="border-b border-gray-50 align-top last:border-0 hover:bg-brand-50/40">
              <td className="px-4 py-3">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                    <Store className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-ink">{s.store_name ?? 'Unnamed store'}</div>
                    <div className="font-mono text-[11px] text-gray-400">{s.store_id}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600">
                {franchiseLookup.get(s.franchise_id) ?? s.franchise_id.slice(-6)}
              </td>
              <td className="px-4 py-3 font-mono text-gray-600">
                {s.store_location.coordinates[1].toFixed(4)}, {s.store_location.coordinates[0].toFixed(4)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile / tablet stacked cards (below lg) — same data, no horizontal scroll */}
      <ul className="divide-y divide-gray-50 lg:hidden">
        {stores.map((s) => (
          <li key={s.id} className="p-4">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                <Store className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-ink">{s.store_name ?? 'Unnamed store'}</div>
                <div className="font-mono text-[11px] text-gray-400">{s.store_id}</div>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                  <dt className="text-gray-400">Sub franchise</dt>
                  <dd className="text-gray-600">
                    {franchiseLookup.get(s.franchise_id) ?? s.franchise_id.slice(-6)}
                  </dd>
                  <dt className="text-gray-400">Lat, Lng</dt>
                  <dd className="font-mono text-gray-600">
                    {s.store_location.coordinates[1].toFixed(4)}, {s.store_location.coordinates[0].toFixed(4)}
                  </dd>
                </dl>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
