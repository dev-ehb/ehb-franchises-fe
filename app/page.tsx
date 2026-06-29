'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Building2,
  Clock,
  Crown,
  MapPin,
  Network,
  UserCheck,
  ArrowRight,
  Check,
  Star,
  ShieldCheck,
  TrendingUp,
  Users,
  Store,
  Globe,
  BadgeCheck,
  Sparkles,
  Map as MapIcon,
  Wallet,
  Phone,
} from 'lucide-react';
import { useGetCatalogQuery } from '@/lib/store/api/catalog.api';
import { useAppSelector } from '@/lib/store/hooks';
import { getStatusColor } from '@/lib/utils';
import type { Franchise, FranchiseLevel } from '@/types/franchises.types';

/**
 * Public franchises landing page.
 *
 * A marketing-grade landing experience for the EHB franchise network, layered
 * on top of the live catalog. Anyone (signed in or not) can read the pitch and
 * then browse the real Master, Corporate and Sub franchises pulled from the
 * franchises API. Every live card still links to its public detail page
 * (map + hierarchy), and the header keeps the sign-in / dashboard shortcut.
 */
export default function LandingPage() {
  const { data, isLoading, isError } = useGetCatalogQuery();
  const auth = useAppSelector((s) => s.auth);

  // Materialise as a Set once per render so per-card lookups are O(1).
  const pendingIds = useMemo(
    () => new Set(data?.pending_request_franchise_ids ?? []),
    [data?.pending_request_franchise_ids],
  );

  return (
    <main className="min-h-dvh bg-white">
      <SiteHeader authedRole={auth.role} />
      <Hero authedRole={auth.role} counts={data?.counts} />
      <TrustBar />
      <ValueProps />
      <TierShowcase />
      <FeatureBlocks />
      <LiveNetwork
        data={data}
        pendingIds={pendingIds}
        isLoading={isLoading}
        isError={isError}
      />
      <StatsBand counts={data?.counts} />
      <Insights />
      <CtaBand authedRole={auth.role} />
      <SiteFooter />
    </main>
  );
}

// ── Shared bits ───────────────────────────────────────────────────────────────

const CTA_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';
const CTA_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-full border border-brand-200 bg-white px-5 py-3 text-sm font-semibold text-brand-800 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
      {children}
    </p>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-800">
      <Sparkles className="h-4 w-4 text-brand-500" aria-hidden />
      {children}
    </span>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────

function SiteHeader({ authedRole }: { authedRole: string | null }) {
  const nav = [
    { label: 'The Network', href: '#network' },
    { label: 'Tiers', href: '#tiers' },
    { label: 'Why EHB', href: '#features' },
    { label: 'Insights', href: '#insights' },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink"
        >
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white">
            <Network className="h-4 w-4" aria-hidden />
          </span>
          EHB<span className="text-brand-600">Franchises</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-gray-600 transition-colors hover:text-ink"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href="tel:+18448783243"
            className="hidden items-center gap-2 text-sm font-semibold text-ink sm:inline-flex"
          >
            <Phone className="h-4 w-4 text-brand-600" aria-hidden />
            (000) 000-000
          </a>
          {authedRole ? (
            <Link href={`/${authedRole}`} className={CTA_PRIMARY}>
              My dashboard
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-gray-100 sm:inline-flex"
              >
                Sign in
              </Link>
              <a href="#tiers" className={CTA_PRIMARY}>
                Become a Franchise
              </a>you
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero({
  authedRole,
  counts,
}: {
  authedRole: string | null;
  counts?: { master: number; corporate: number; sub: number; total: number };
}) {
  return (
    <section className="relative overflow-hidden bg-dots">
      {/* soft pastel blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-lav-soft blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-40 h-72 w-72 rounded-full bg-coral-soft blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <Pill>Own your territory with EHB</Pill>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Own a Territory.
            <br />
            Build a Local Empire.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
            EHB hands verified entrepreneurs a map-locked franchise territory — with
            ready buyer demand, live revenue dashboards, and PSS-compliant onboarding.
            Pick your tier and start earning from day one.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#tiers" className={CTA_PRIMARY}>
              Apply for a Franchise
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <a href="#network" className={CTA_GHOST}>
              Explore the Network
            </a>
          </div>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-gray-500">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
            <span className="font-semibold text-ink">4.7/5</span>
            from {counts?.total ? `${counts.total}+ ` : ''}franchise owners · No setup fee to apply
          </p>
        </div>

        <HeroVisual counts={counts} />
      </div>
    </section>
  );
}

function HeroVisual({
  counts,
}: {
  counts?: { master: number; corporate: number; sub: number; total: number };
}) {
  return (
    <div className="relative mx-auto mt-12 max-w-4xl">
      {/* Centerpiece: territory dashboard preview */}
      <div className="relative z-10 mx-auto max-w-2xl overflow-hidden rounded-4xl border border-gray-100 bg-white shadow-float">
        <div className="flex items-center justify-between border-b border-gray-100 bg-brand-900 px-5 py-3.5 text-white">
          <div className="flex items-center gap-2">
            <MapIcon className="h-4 w-4 text-brand-200" aria-hidden />
            <span className="font-display text-sm font-bold">Territory Control · Lahore-North</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-700/60 px-2.5 py-1 text-[11px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" aria-hidden /> Active
          </span>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-5">
          {/* map zone */}
          <div className="relative sm:col-span-3">
            <div className="relative h-44 overflow-hidden rounded-2xl bg-brand-50 ring-1 ring-brand-100">
              <div
                aria-hidden
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(31,110,71,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(31,110,71,.12) 1px, transparent 1px)',
                  backgroundSize: '26px 26px',
                }}
              />
              <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-brand-400/70 bg-brand-400/10" />
              <span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-600 text-white shadow-lift">
                <MapPin className="h-4 w-4" aria-hidden />
              </span>
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-800 shadow-soft">
                10 km protected zone
              </span>
            </div>
          </div>
          {/* mini stats */}
          <div className="space-y-3 sm:col-span-2">
            <MiniStat label="Stores onboarded" value="8 / 10" icon={Store} tone="brand" />
            <MiniStat label="Leads this week" value="142" icon={Users} tone="lav" />
            <MiniStat label="Revenue lift" value="+30%" icon={TrendingUp} tone="coral" />
          </div>
        </div>
      </div>

      {/* Floating card — revenue */}
      <div className="absolute -left-3 -top-6 z-20 hidden w-52 rounded-3xl border border-gray-100 bg-white p-4 shadow-float animate-floaty sm:block">
        <p className="text-xs font-medium text-gray-500">Monthly payout</p>
        <p className="mt-1 font-display text-2xl font-extrabold text-ink">$24,180</p>
        <div className="mt-3 flex items-end gap-1.5" aria-hidden>
          {[40, 62, 48, 80, 95].map((h, i) => (
            <span
              key={i}
              className="w-3 rounded-t bg-brand-500"
              style={{ height: `${h * 0.4}px`, opacity: 0.5 + i * 0.1 }}
            />
          ))}
        </div>
        <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-600">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden /> +30% vs last quarter
        </p>
      </div>

      {/* Floating card — verified owner */}
      <div className="absolute -right-2 bottom-4 z-20 hidden w-60 rounded-3xl border border-gray-100 bg-white p-4 shadow-float animate-floaty [animation-delay:1.5s] sm:block">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-lav-soft font-display font-bold text-lav-ink">
            AR
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">Ayesha Raza</p>
            <p className="text-xs text-gray-500">Master Franchise · Punjab</p>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
          <BadgeCheck className="h-3.5 w-3.5" aria-hidden /> PSS verified owner
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone: 'brand' | 'lav' | 'coral';
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-700',
    lav: 'bg-lav-soft text-lav-ink',
    coral: 'bg-coral-soft text-coral-ink',
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] text-gray-500">{label}</p>
        <p className="font-display text-base font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}

// ── Trust bar ─────────────────────────────────────────────────────────────────

function TrustBar() {
  const certs = ['PSS Verified', 'ISO 27001', 'PTA Compliant', 'SOC 2 Type II'];
  return (
    <section className="border-y border-gray-100 bg-cream">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-6 sm:px-8 md:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Rating source="Google" />
          <span className="hidden h-5 w-px bg-gray-200 md:block" aria-hidden />
          <Rating source="Trustpilot" />
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Proudly certified
          </span>
          {certs.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" aria-hidden />
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Rating({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-gray-600">
      <span className="inline-flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
        ))}
      </span>
      <span className="font-semibold text-ink">4.7</span> on {source}
    </span>
  );
}

// ── Value props ───────────────────────────────────────────────────────────────

function ValueProps() {
  const features = [
    { icon: MapPin, label: 'Territory-locked rights' },
    { icon: Users, label: 'Verified buyer leads' },
    { icon: TrendingUp, label: 'Live revenue dashboards' },
    { icon: ShieldCheck, label: 'PSS-compliant onboarding' },
  ];
  return (
    <section id="features" className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8 sm:py-24">
      <Eyebrow>Why owners choose EHB</Eyebrow>
      <h2 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
        Everything you need to run a profitable territory — built in.
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
        We handle demand, compliance and payouts so you can focus on growing stores
        and serving customers in your protected zone.
      </p>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {features.map((f) => (
          <div
            key={f.label}
            className="flex flex-col items-start gap-3 rounded-3xl border border-gray-100 bg-white p-5 text-left shadow-soft transition-shadow hover:shadow-lift"
          >
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
              <f.icon className="h-5 w-5" aria-hidden />
            </span>
            <p className="text-sm font-semibold text-ink">{f.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Tier showcase (redesigned franchise tier cards) ───────────────────────────

type Tier = {
  level: FranchiseLevel;
  name: string;
  icon: React.ElementType;
  tagline: string;
  scope: string;
  features: string[];
  cta: string;
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    level: 'sub',
    name: 'Sub Franchise',
    icon: Building2,
    tagline: 'The local operator',
    scope: '10 km zone · up to 10 stores',
    features: [
      'One protected 10 km territory',
      'Onboard up to 10 partner stores',
      'Verified buyer leads in your area',
      'Mobile owner app + live dashboard',
      'PSS-guided onboarding',
    ],
    cta: 'Apply for a Sub',
  },
  {
    level: 'master',
    name: 'Master Franchise',
    icon: Network,
    tagline: 'The regional builder',
    scope: 'Manages a slice of Subs',
    features: [
      'Manage 10–40 Sub franchises',
      'Regional revenue share',
      'Sub-recruitment & training tools',
      'Priority lead routing',
      'Dedicated success manager',
    ],
    cta: 'Apply for a Master',
    featured: true,
  },
  {
    level: 'corporate',
    name: 'Corporate Franchise',
    icon: Crown,
    tagline: 'The territory owner',
    scope: 'One per territory · owns all below',
    features: [
      'Exclusive territory rights',
      'Owns every Master & Sub inside it',
      'Top revenue tier + overrides',
      'Executive multi-region dashboards',
      'White-glove onboarding',
    ],
    cta: 'Talk to our team',
  },
];

function TierShowcase() {
  return (
    <section id="tiers" className="bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>The Network</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            Three ways to own the EHB network
          </h2>
          <p className="mt-4 text-base text-gray-600">
            From a single neighbourhood to a whole territory — pick the tier that
            matches your ambition and capital.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-3">
          {TIERS.map((t) => (
            <TierCard key={t.level} tier={t} />
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          Not sure which fits?{' '}
          <a href="#network" className="font-semibold text-brand-700 hover:underline">
            Browse the live network →
          </a>
        </p>
      </div>
    </section>
  );
}

function TierCard({ tier }: { tier: Tier }) {
  const { icon: Icon, featured } = tier;
  if (featured) {
    return (
      <div className="relative overflow-hidden rounded-4xl bg-brand-900 p-7 text-white shadow-float ring-1 ring-brand-800 lg:-mt-4 lg:pb-9">
        <span className="absolute right-6 top-6 rounded-full bg-brand-700/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-100">
          Most popular
        </span>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-700 text-white">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
        <h3 className="mt-5 font-display text-2xl font-extrabold">{tier.name}</h3>
        <p className="mt-1 text-sm text-brand-200">{tier.tagline}</p>
        <p className="mt-4 inline-flex rounded-full bg-brand-800 px-3 py-1 text-xs font-medium text-brand-100">
          {tier.scope}
        </p>
        <ul className="mt-6 space-y-3">
          {tier.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm text-brand-50">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
              {f}
            </li>
          ))}
        </ul>
        <a
          href="#network"
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-900 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
        >
          {tier.cta}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
    );
  }
  return (
    <div className="rounded-4xl border border-gray-100 bg-white p-7 shadow-soft transition-shadow hover:shadow-lift">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h3 className="mt-5 font-display text-2xl font-extrabold text-ink">{tier.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{tier.tagline}</p>
      <p className="mt-4 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
        {tier.scope}
      </p>
      <ul className="mt-6 space-y-3">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-700">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
            {f}
          </li>
        ))}
      </ul>
      <a
        href="#network"
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-200 px-5 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {tier.cta}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </a>
    </div>
  );
}

// ── Feature blocks (colored, with mockups) ────────────────────────────────────

function FeatureBlocks() {
  return (
    <section className="mx-auto max-w-7xl space-y-5 px-5 py-8 sm:px-8 sm:py-12">
      {/* Lavender — territory mapping */}
      <div className="grid items-center gap-8 overflow-hidden rounded-5xl bg-lav-soft p-7 sm:p-10 lg:grid-cols-2">
        <div>
          <Eyebrow>Smart territory mapping</Eyebrow>
          <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink sm:text-3xl">
            Map-locked territories you actually own
          </h3>
          <p className="mt-4 max-w-md text-base text-gray-700">
            Every franchise gets a GPS-locked zone with a guaranteed no-overlap radius.
            See your boundaries, stores and demand on one live map.
          </p>
          <ul className="mt-6 space-y-3">
            {['GPS-locked 10 km zones', 'No-overlap guarantee', 'Live territory & store status'].map(
              (f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-medium text-ink">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-lav-ink">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  {f}
                </li>
              ),
            )}
          </ul>
        </div>
        <div className="relative">
          <div className="relative h-60 overflow-hidden rounded-4xl bg-white shadow-float ring-1 ring-black/5">
            <div
              aria-hidden
              className="absolute inset-0 opacity-70"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(74,47,125,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(74,47,125,.10) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }}
            />
            {[
              { t: '22%', l: '28%', c: 'bg-brand-500' },
              { t: '58%', l: '62%', c: 'bg-lav' },
              { t: '40%', l: '48%', c: 'bg-coral' },
            ].map((p, i) => (
              <span
                key={i}
                className={`absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ${p.c} text-white shadow-lift`}
                style={{ top: p.t, left: p.l }}
              >
                <MapPin className="h-4 w-4" aria-hidden />
              </span>
            ))}
            <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-lav-ink shadow-soft">
              3 zones · 0 overlaps
            </span>
          </div>
        </div>
      </div>

      {/* Forest green — compliance & payouts */}
      <div className="grid items-center gap-8 overflow-hidden rounded-5xl bg-brand-900 p-7 text-white sm:p-10 lg:grid-cols-2">
        <div className="order-2 lg:order-1">
          <div className="relative rounded-4xl bg-brand-800/60 p-5 ring-1 ring-brand-700">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-bold text-brand-100">Payout schedule</p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-700/70 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                <Wallet className="h-3.5 w-3.5" aria-hidden /> Auto
              </span>
            </div>
            {/* tiny line chart */}
            <svg viewBox="0 0 240 70" className="mt-4 h-20 w-full" aria-hidden>
              <polyline
                points="0,55 40,48 80,52 120,30 160,34 200,16 240,12"
                fill="none"
                stroke="#71bf95"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-3 space-y-2">
              {[
                { n: 'Sub · Gulberg', v: '$3,120' },
                { n: 'Sub · Model Town', v: '$2,540' },
                { n: 'Master override', v: '$1,980' },
              ].map((r) => (
                <div
                  key={r.n}
                  className="flex items-center justify-between rounded-xl bg-brand-900/50 px-3 py-2 text-sm"
                >
                  <span className="text-brand-100">{r.n}</span>
                  <span className="font-semibold text-white">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <Eyebrow>
            <span className="text-brand-200">Automated operations</span>
          </Eyebrow>
          <h3 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
            Compliance &amp; payouts on autopilot
          </h3>
          <p className="mt-4 max-w-md text-base text-brand-100">
            PSS verifies every owner and store, commissions split automatically across
            the hierarchy, and payouts land in your wallet — no spreadsheets, no chasing.
          </p>
          <ul className="mt-6 space-y-3">
            {['PSS-verified onboarding', 'Automated commission splits', 'Instant wallet payouts'].map(
              (f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-medium text-white">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-700 text-emerald-200">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  {f}
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ── Live network (real catalog data, redesigned cards) ────────────────────────

function LiveNetwork({
  data,
  pendingIds,
  isLoading,
  isError,
}: {
  data: ReturnType<typeof useGetCatalogQuery>['data'];
  pendingIds: Set<string>;
  isLoading: boolean;
  isError: boolean;
}) {
  return (
    <section id="network" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <Eyebrow>Live network</Eyebrow>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            Explore every franchise on the map
          </h2>
          <p className="mt-4 text-base text-gray-600">
            Browse real Country, Corporate, Master and Sub franchises across the network.
            Open any card to see its territory on the map and its full hierarchy.
          </p>
        </div>
        {data && (
          <div className="flex shrink-0 flex-wrap gap-2">
            <CountChip icon={Globe} label="Country" value={data.counts.country} />
            <CountChip icon={Crown} label="Corporate" value={data.counts.corporate} />
            <CountChip icon={Network} label="Master" value={data.counts.master} />
            <CountChip icon={Building2} label="Sub" value={data.counts.sub} />
          </div>
        )}
      </div>

      <div className="mt-10 space-y-12">
        {isLoading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-44 w-full rounded-3xl" />
            ))}
          </div>
        )}
        {isError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-700">
            Could not load the catalog. Is the franchises API running on port 3010?
          </div>
        )}

        {data && (
          <>
            <FranchiseGroup
              title="Country Franchises"
              subtitle="Root of the network — one per country. Owns every Corporate, Master and Sub inside that country."
              icon={Globe}
              level="country"
              franchises={data.country}
              pendingIds={pendingIds}
            />
            <FranchiseGroup
              title="Corporate Franchises"
              subtitle="One per territory. Owns every Master and Sub inside its area."
              icon={Crown}
              level="corporate"
              franchises={data.corporate}
              pendingIds={pendingIds}
            />
            <FranchiseGroup
              title="Master Franchises"
              subtitle="The middle layer — each Master manages a slice of Subs underneath its Corporate."
              icon={Network}
              level="master"
              franchises={data.master}
              pendingIds={pendingIds}
            />
            <FranchiseGroup
              title="Sub Franchises"
              subtitle="The local operating layer — each Sub covers a 10 km territory and up to 10 stores."
              icon={Building2}
              level="sub"
              franchises={data.sub}
              pendingIds={pendingIds}
            />
          </>
        )}
      </div>
    </section>
  );
}

function CountChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm">
      <Icon className="h-4 w-4 text-brand-600" aria-hidden />
      <span className="text-gray-500">{label}</span>
      <span className="font-display font-bold text-ink">{value}</span>
    </span>
  );
}

const LEVEL_TONE: Record<FranchiseLevel, { wrap: string; icon: React.ElementType }> = {
  country: { wrap: 'bg-emerald-50 text-emerald-700', icon: Globe },
  corporate: { wrap: 'bg-brand-50 text-brand-700', icon: Crown },
  master: { wrap: 'bg-lav-soft text-lav-ink', icon: Network },
  sub: { wrap: 'bg-coral-soft text-coral-ink', icon: Building2 },
};

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
      <div className="mb-5 flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${LEVEL_TONE[level].wrap}`}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
          <p className="mt-0.5 max-w-2xl text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      {franchises.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-300 px-4 py-10 text-center text-sm text-gray-400">
          No {level} franchises yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {franchises.map((f) => (
            <FranchiseCard
              key={f.id}
              franchise={f}
              hasPendingRequest={pendingIds.has(f.id)}
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
  const owned = Boolean(franchise.owner_name || franchise.owner_email);
  const tone = LEVEL_TONE[franchise.level];
  const Icon = tone.icon;

  return (
    <Link
      href={`/franchises/${franchise.id}`}
      className="group flex flex-col rounded-3xl border border-gray-100 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ${tone.wrap}`}>
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h4 className="truncate font-display text-base font-bold text-ink">
              {franchise.display_name ?? franchise.name}
            </h4>
            {franchise.code && (
              <span className="mt-0.5 inline-block rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] text-gray-500">
                {franchise.code}
              </span>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(
            franchise.status,
          )}`}
        >
          {franchise.status}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-500">
        <MapPin className="h-3.5 w-3.5 text-gray-400" aria-hidden />
        <span className="font-mono">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
        <span className="ml-auto rounded-full bg-gray-50 px-2 py-0.5 font-medium text-gray-600">
          {franchise.radius_km} km
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>
          Region: <span className="font-semibold text-ink">{franchise.region}</span>
        </span>
        {franchise.level === 'sub' ? (
          <span>
            Stores: <span className="font-semibold text-ink">{franchise.store_count}</span>
          </span>
        ) : (
          <span>
            Children: <span className="font-semibold text-ink">{franchise.child_count}</span>
          </span>
        )}
      </div>

      {owned ? (
        <div className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
          <UserCheck className="h-3.5 w-3.5" aria-hidden />
          Owned by {franchise.owner_name ?? franchise.owner_email}
        </div>
      ) : hasPendingRequest ? (
        <div className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-800">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          Buy request pending review
        </div>
      ) : (
        <div className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Available to claim
        </div>
      )}

      <div className="mt-4 flex items-center gap-1 border-t border-gray-100 pt-3 text-sm font-semibold text-brand-700">
        View details &amp; map
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </div>
    </Link>
  );
}

// ── Stats band ────────────────────────────────────────────────────────────────

function StatsBand({
  counts,
}: {
  counts?: { master: number; corporate: number; sub: number; total: number };
}) {
  const stats = [
    { label: 'Active territories', value: counts?.total ? `${counts.total}+` : '1,200+' },
    { label: 'Stores onboarded', value: '5,000+' },
    { label: 'Avg owner revenue lift', value: '+30%' },
    { label: 'Cities live', value: '100+' },
  ];
  return (
    <section className="bg-brand-950">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <h2 className="max-w-md font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            Scaling the network, without the roadblocks
          </h2>
          <div className="flex items-center gap-3 text-brand-200">
            <span className="text-xs font-semibold uppercase tracking-widest">Proudly certified</span>
            <ShieldCheck className="h-6 w-6" aria-hidden />
            <BadgeCheck className="h-6 w-6" aria-hidden />
          </div>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-8 border-t border-brand-800 pt-10 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm text-brand-200">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Insights ──────────────────────────────────────────────────────────────────

function Insights() {
  const posts = [
    {
      tag: 'Press release',
      tone: 'from-brand-500 to-brand-700',
      title: 'EHB crosses 1,200 active franchise territories across the region',
      read: '5 min read',
      date: 'Jun 2, 2026',
    },
    {
      tag: 'Owner playbook',
      tone: 'from-lav to-lav-ink',
      title: 'How a Sub-franchise owner grew revenue +42% in two quarters',
      read: '6 min read',
      date: 'May 28, 2026',
    },
    {
      tag: 'Tier guide',
      tone: 'from-coral to-coral-ink',
      title: 'Master vs Corporate: choosing the right tier for your capital',
      read: '7 min read',
      date: 'May 20, 2026',
    },
  ];
  return (
    <section id="insights" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>Industry insights</Eyebrow>
        <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
          The Pulse of the Network — News &amp; Updates
        </h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {posts.map((p) => (
          <article
            key={p.title}
            className="group flex flex-col overflow-hidden rounded-4xl border border-gray-100 bg-white shadow-soft transition-shadow hover:shadow-lift"
          >
            <div className={`relative h-44 bg-gradient-to-br ${p.tone}`}>
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-ink">
                {p.tag}
              </span>
              <Globe className="absolute bottom-4 right-4 h-8 w-8 text-white/40" aria-hidden />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-display text-lg font-bold leading-snug text-ink group-hover:text-brand-700">
                {p.title}
              </h3>
              <div className="mt-auto flex items-center gap-2 pt-4 text-xs text-gray-400">
                <span>{p.date}</span>
                <span aria-hidden>·</span>
                <span>{p.read}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ── CTA band ──────────────────────────────────────────────────────────────────

function CtaBand({ authedRole }: { authedRole: string | null }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
      <div className="relative overflow-hidden rounded-5xl bg-brand-900 px-6 py-14 text-center sm:px-10 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-brand-700/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-10 -left-10 h-56 w-56 rounded-full bg-lav/20 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
            Ready to own your territory?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-brand-100">
            Applications are open across 100+ cities. Claim an available zone from the
            live network and our team will guide you through PSS onboarding.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#network"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-brand-900 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
            >
              Claim a Territory
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href={authedRole ? `/${authedRole}` : '/login'}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-700 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
            >
              {authedRole ? 'Go to dashboard' : 'Owner sign in'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function SiteFooter() {
  const cols = [
    { title: 'Network', links: ['Corporate', 'Master', 'Sub', 'Live map'] },
    { title: 'Company', links: ['About EHB', 'Careers', 'Press', 'Contact'] },
    { title: 'Resources', links: ['Owner playbook', 'PSS compliance', 'Help center', 'Status'] },
  ];
  return (
    <footer className="border-t border-gray-100 bg-cream">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-600 text-white">
                <Network className="h-4 w-4" aria-hidden />
              </span>
              EHB<span className="text-brand-600">Franchises</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-gray-600">
              Territory-locked franchise ownership across the EHB ecosystem —
              Education, Health &amp; Business, one network.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {c.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-gray-600 transition-colors hover:text-brand-700">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} EHB Technologies (Pvt.) Ltd. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-ink">Privacy</a>
            <a href="#" className="hover:text-ink">Terms</a>
            <a href="#" className="hover:text-ink">PSS compliance</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
