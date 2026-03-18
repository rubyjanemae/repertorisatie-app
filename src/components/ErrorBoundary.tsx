'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-parchment flex items-center justify-center p-6">
          <div className="card-materia max-w-lg w-full p-8 text-center">
            <h2 className="font-display text-xl text-warm-text mb-3">
              Er ging iets mis
            </h2>
            <p className="text-sm text-warm-text-muted font-body mb-4">
              {this.state.error?.message || 'Onbekende fout'}
            </p>
            <pre className="text-[10px] text-left bg-parchment/50 p-3 rounded-lg overflow-auto max-h-40 mb-4 text-warm-text-muted font-mono">
              {this.state.error?.stack}
            </pre>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="btn-primary"
              >
                Opnieuw laden
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="btn-secondary"
              >
                Reset data &amp; herlaad
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
