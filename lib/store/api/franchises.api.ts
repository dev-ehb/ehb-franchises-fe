import { baseApi } from './base-api';
import type {
  Franchise,
  SubDashboardData,
  CorporateDashboardData,
  MasterDashboardData,
} from '@/types/franchises.types';

/**
 * Role-scoped dashboard endpoints. The backend uses the franchise-owner JWT
 * to scope each call to the caller's own franchise, so the frontend doesn't
 * pass an id — calling the wrong endpoint for your role is a 403.
 */
export const franchisesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getChildren: build.query<Franchise[], string>({
      query: (id) => `/franchises/${id}/children`,
      providesTags: ['Franchise'],
    }),
    getSubDashboard: build.query<SubDashboardData, void>({
      query: () => '/dashboard/sub',
      providesTags: ['Dashboard'],
    }),
    getCorporateDashboard: build.query<CorporateDashboardData, void>({
      query: () => '/dashboard/corporate',
      providesTags: ['Dashboard'],
    }),
    getMasterDashboard: build.query<MasterDashboardData, void>({
      query: () => '/dashboard/master',
      providesTags: ['Dashboard'],
    }),
    /**
     * Owner-side rename. Backend scopes to the caller's franchise via the JWT,
     * applies the OWNER_RENAME_MIN_INTERVAL_DAYS cap, and writes an audit row.
     */
    renameMyDisplayName: build.mutation<Franchise, { display_name: string }>({
      query: (body) => ({
        url: '/franchises/me/display-name',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Franchise', 'Dashboard'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetChildrenQuery,
  useGetSubDashboardQuery,
  useGetCorporateDashboardQuery,
  useGetMasterDashboardQuery,
  useRenameMyDisplayNameMutation,
} = franchisesApi;
