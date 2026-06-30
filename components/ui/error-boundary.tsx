'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  /** UI to show when a child throws during render. */
  fallback: ReactNode;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Generic component-level error boundary.
 *
 * Catches render errors in its children and shows `fallback` instead — so one
 * broken widget (e.g. the map) degrades gracefully without taking down the
 * whole page. This complements the route-level `app/error.tsx`, which is
 * coarser: it replaces the entire route. React error boundaries must be class
 * components, hence this small class (no extra dependency).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
