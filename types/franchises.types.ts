// ─── ehb-franchises frontend types ────────────────────────────────────────────
// Mirrors the backend libs/franchises-types contract for the parts the UI needs.

export type FranchiseLevel = 'sub' | 'corporate' | 'master';

export type FranchiseStatus = 'Auto-Created' | 'Available' | 'Assigned' | 'Active';

export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface Franchise {
  id: string;
  level: FranchiseLevel;
  parent_id: string | null;
  /** Immutable identity, e.g. "SUB-LHR-001". */
  code: string;
  /** Mutable display label; owner-editable post-assignment. */
  display_name: string;
  /** @deprecated mirror of display_name kept for one release. */
  name: string;
  region: string;
  region_label?: string;
  center: GeoPoint;
  radius_km: number;
  store_count: number;
  child_count: number;
  status: FranchiseStatus;
  owner_id: string | null;
  /** Buyer email — set once an admin approves the purchase request. */
  owner_email?: string | null;
  /** Buyer display name copied from the approved purchase request. */
  owner_name?: string | null;
  display_name_updated_at?: string | null;
  created_by: 'auto' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface FranchiseOwnerSession {
  sub: string;
  email: string;
  role: FranchiseLevel;
  franchise_id: string;
}

// ─── Dashboard payloads (match backend DashboardService) ───────────────────────

export interface StoreLink {
  id: string;
  store_id: string;
  /** Cached display name from the source platform (e.g. GoSellr business_name). */
  store_name?: string | null;
  source_platform: 'gosellr';
  franchise_id: string;
  store_location: GeoPoint;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubDashboardData {
  franchise: Franchise;
  stores: StoreLink[];
  kpis: {
    assigned_store_count: number;
    capacity_remaining: number;
    capacity_max: number;
  };
}

/**
 * Master sits in the middle of the Corporate > Master > Sub hierarchy and
 * directly owns the list of Subs that live in its slice of the territory.
 */
export interface MasterDashboardData {
  franchise: Franchise;
  child_subs: Franchise[];
  kpis: {
    sub_count: number;
    total_stores: number;
    active_subs: number;
  };
}

/**
 * Corporate is the territory root — it owns every Master in its territory and
 * (via grandchild_subs) every Sub.
 */
export interface CorporateDashboardData {
  franchise: Franchise;
  child_masters: Franchise[];
  grandchild_subs: Franchise[];
  kpis: {
    master_count: number;
    sub_count: number;
    total_stores: number;
    active_masters: number;
  };
}

// ─── Public catalog payloads (match backend CatalogService) ───────────────────

export interface CatalogListPayload {
  master: Franchise[];
  corporate: Franchise[];
  sub: Franchise[];
  counts: { master: number; corporate: number; sub: number; total: number };
  /** Franchise _ids with an in-flight purchase request — used to badge cards. */
  pending_request_franchise_ids: string[];
}

export interface CatalogDetailPayload {
  franchise: Franchise;
  /** Ordered from immediate parent up to the root. Empty for a Corporate. */
  parents: Franchise[];
  child_masters: Franchise[];
  child_subs: Franchise[];
  stores: StoreLink[];
  is_available_for_purchase: boolean;
  has_pending_request: boolean;
  buyer: { name: string; email: string } | null;
}
