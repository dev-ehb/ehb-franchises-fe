'use client';
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { hydrateFromStorage } from './store/auth.slice';
import { Toaster } from '@/components/ui/toaster';

/**
 * Hydrates auth from sessionStorage exactly once on the client. Lives here
 * (not inside the dashboard layout) so the public landing page and the public
 * franchise detail page also recover the session - e.g. so a signed-in owner
 * sees "My dashboard" instead of "Sign in" after a hard refresh.
 */
function AuthHydrator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!store.getState().auth.hydrated) {
      store.dispatch(hydrateFromStorage());
    }
  }, []);
  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator>{children}</AuthHydrator>
      <Toaster />
    </Provider>
  );
}
