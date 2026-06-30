/**
 * Lightweight, dependency-free toast store.
 *
 * A single module-level queue that ANY caller can push to — React components
 * (via the exported `toast` API) and non-React code alike (e.g. the RTK Query
 * base query). The <Toaster> subscribes via useSyncExternalStore and renders
 * the queue. Each toast auto-dismisses after a few seconds.
 */
export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

const AUTO_DISMISS_MS = 4000;

let toasts: Toast[] = [];
const EMPTY: Toast[] = [];
const listeners = new Set<() => void>();
let nextId = 1;

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): Toast[] {
  return toasts;
}

/** Stable empty reference for SSR so useSyncExternalStore stays happy. */
export function getServerSnapshot(): Toast[] {
  return EMPTY;
}

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function push(message: string, variant: ToastVariant) {
  const id = nextId++;
  toasts = [...toasts, { id, message, variant }];
  emit();
  if (typeof window !== 'undefined') {
    window.setTimeout(() => dismissToast(id), AUTO_DISMISS_MS);
  }
}

export const toast = {
  success: (message: string) => push(message, 'success'),
  error: (message: string) => push(message, 'error'),
  info: (message: string) => push(message, 'info'),
};
