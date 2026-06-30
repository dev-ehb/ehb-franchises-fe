import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import { clearCredentials } from '../auth.slice';
import { toast } from '../../toast';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_FRANCHISES_API_URL ?? 'http://localhost:3010',
  prepareHeaders: (headers, { getState }) => {
    const token =
      (getState() as RootState).auth.access_token ??
      (typeof window !== 'undefined' ? sessionStorage.getItem('franchises_token') : null);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

/**
 * Wraps the base query so error handling lives in ONE place:
 *
 *   - 401 (invalid/expired session) with an existing token -> clear credentials
 *     + bounce to /login. The "had a token" guard keeps the public landing/detail
 *     and login pages unaffected (no token there, so a 401 never redirects).
 *     A 403 is left as a normal error (NOT a logout): it means "logged in but
 *     this role can't do that", not a dead session.
 *   - network / 5xx on a MUTATION       -> a non-blocking error toast, so a
 *     failed action is never silent. Query failures are intentionally left to
 *     each page's <ErrorState> (no duplicate toast).
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;

    if (
      status === 401 &&
      Boolean((api.getState() as RootState).auth.access_token)
    ) {
      api.dispatch(clearCredentials());
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    } else if (
      api.type === 'mutation' &&
      (status === 'FETCH_ERROR' ||
        status === 'TIMEOUT_ERROR' ||
        (typeof status === 'number' && status >= 500))
    ) {
      toast.error('Something went wrong. Please try again.');
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Franchise', 'Dashboard', 'PssApproval'],
  endpoints: () => ({}),
});
