import React from 'react';
import { OptimizationEvent } from '../../types';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: OptimizationEvent[];
  onClearAll: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  events,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-canvas-base/70 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-container-low border-l border-border-cyan-glow shadow-2xl p-space-lg flex flex-col justify-between">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">notifications_active</span>
                <h2 className="font-headline-md text-headline-md text-text-primary font-bold">
                  Grid Optimization Ledger
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="font-label-badge text-label-badge text-on-surface-variant uppercase font-mono">
                {events.length} Live Alerts
              </span>
              <button
                onClick={onClearAll}
                className="text-xs font-mono text-primary hover:underline cursor-pointer"
              >
                Clear Ledger
              </button>
            </div>

            {/* List */}
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
              {events.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant font-mono text-xs">
                  No active optimization alerts in current cycle.
                </div>
              ) : (
                events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-surface-container border border-outline-variant/10 hover:border-outline-variant/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="font-body-md text-sm font-semibold text-text-primary">
                        {evt.title}
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant whitespace-nowrap">
                        {evt.timestamp}
                      </span>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      {evt.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-surface-container-highest text-[10px] font-mono font-bold text-cyan-bright">
                        {evt.tag}
                      </span>
                      {evt.valueSaved && (
                        <span className="text-xs font-mono text-emerald-bright font-bold">
                          {evt.valueSaved}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-between text-xs font-mono text-on-surface-variant">
            <span>Harmonic sync active</span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-surface-container-high text-text-primary hover:bg-surface-bright transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
