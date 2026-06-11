import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FranchiseLevel } from '@/types/franchises.types';

interface AuthState {
  user: { id: string; email: string } | null;
  role: FranchiseLevel | null;
  franchise_id: string | null;
  access_token: string | null;
  /**
   * True once the client has read sessionStorage and populated the slice.
   * Server renders see hydrated:false so layouts can defer auth-gated
   * decisions and avoid React hydration mismatches.
   */
  hydrated: boolean;
}

// IMPORTANT: never touch sessionStorage in this initial state. SSR runs this
// once with no window object, then the client first render runs it again
// during hydration. If the two return different shapes (role:null on the
// server, role:"sub" on the client) React throws the "Hydration failed"
// error from the runtime overlay.
const initialState: AuthState = {
  user: null,
  role: null,
  franchise_id: null,
  access_token: null,
  hydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        user: { id: string; email: string };
        role: FranchiseLevel;
        franchise_id: string;
        access_token: string;
      }>,
    ) {
      Object.assign(state, action.payload);
      state.hydrated = true;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('franchises_token', action.payload.access_token);
        sessionStorage.setItem('franchises_role', action.payload.role);
        sessionStorage.setItem('franchises_fid', action.payload.franchise_id);
      }
    },
    clearCredentials(state) {
      state.user = null;
      state.role = null;
      state.franchise_id = null;
      state.access_token = null;
      state.hydrated = true;
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('franchises_token');
        sessionStorage.removeItem('franchises_role');
        sessionStorage.removeItem('franchises_fid');
      }
    },
    /**
     * Client-only hydration from sessionStorage. Called once from a useEffect
     * after mount - keeps SSR output deterministic while still recovering the
     * session on page reload.
     */
    hydrateFromStorage(state) {
      if (typeof window === 'undefined') return;
      const token = sessionStorage.getItem('franchises_token');
      const role = sessionStorage.getItem('franchises_role') as FranchiseLevel | null;
      const fid = sessionStorage.getItem('franchises_fid');
      if (token && role && fid) {
        state.access_token = token;
        state.role = role;
        state.franchise_id = fid;
      }
      state.hydrated = true;
    },
  },
});

export const { setCredentials, clearCredentials, hydrateFromStorage } = authSlice.actions;
export default authSlice.reducer;
