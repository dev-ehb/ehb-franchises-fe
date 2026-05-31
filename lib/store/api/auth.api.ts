import { baseApi } from './base-api';
import type { FranchiseLevel } from '@/types/franchises.types';

interface EhbCallbackResponse {
  access_token: string;
  user: { ehb_user_id: string; email: string; full_name: string };
  role: FranchiseLevel;
  franchise_id: string;
  must_change_password: false;
}

export interface PasswordLoginResponse {
  access_token: string;
  user: { email: string; full_name: null };
  role: FranchiseLevel;
  franchise_id: string;
  must_change_password: boolean;
}

/**
 * Franchise-owner auth endpoints. Two login paths:
 *   - ehbCallback: EHB SSO (assigned via owner_id by backoffice admin)
 *   - passwordLogin: email + temp password (purchase flow), with a forced
 *                    change-password step on first login.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    ehbCallback: build.mutation<EhbCallbackResponse, { ehb_token: string }>({
      query: (body) => ({ url: '/auth/ehb-callback', method: 'POST', body }),
    }),
    passwordLogin: build.mutation<PasswordLoginResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    changePassword: build.mutation<
      { success: true },
      { current_password: string; new_password: string }
    >({
      query: (body) => ({ url: '/auth/change-password', method: 'POST', body }),
    }),
    getMe: build.query<
      { sub: string; email: string; role: FranchiseLevel; franchise_id: string },
      void
    >({
      query: () => '/auth/me',
    }),
  }),
  overrideExisting: false,
});

export const {
  useEhbCallbackMutation,
  usePasswordLoginMutation,
  useChangePasswordMutation,
  useGetMeQuery,
} = authApi;
