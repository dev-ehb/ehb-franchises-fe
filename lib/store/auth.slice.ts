import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FranchiseLevel } from '@/types/franchises.types';

interface AuthState {
  user: { id: string; email: string } | null;
  role: FranchiseLevel | null;
  franchise_id: string | null;
  access_token: string | null;
}

const read = (k: string) =>
  typeof window !== 'undefined' ? sessionStorage.getItem(k) : null;

const initialState: AuthState = {
  user: null,
  role: (read('franchises_role') as FranchiseLevel | null) ?? null,
  franchise_id: read('franchises_fid'),
  access_token: read('franchises_token'),
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
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('franchises_token');
        sessionStorage.removeItem('franchises_role');
        sessionStorage.removeItem('franchises_fid');
      }
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
