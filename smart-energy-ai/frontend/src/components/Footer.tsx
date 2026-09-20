import React from 'react';
import { LOGO_URL } from './Header';

interface FooterProps {
  onSelectTab?: (tab: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/20 mt-space-xl">
      <div className="max-w-[1440px] mx-auto px-margin-mobile lg:px-margin py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-lg text-on-surface-variant font-body-sm text-body-sm">
        <div className="flex items-center gap-space-sm">
          <img
            alt="VoltIQ Pulse Brand Logo"
            className="h-6 w-auto opacity-70"
            src={LOGO_URL}
          />
          <span className="font-headline-md text-body-md text-text-primary tracking-tight font-semibold">
            VoltIQ Pulse
          </span>
          <span className="text-on-surface-variant/60">—</span>
          <span>Smart Consumer Telemetry Infrastructure</span>
        </div>

        <div className="flex flex-wrap items-center gap-space-lg">
          <button
            onClick={() => onSelectTab?.('ai-agents')}
            className="hover:text-primary transition-colors text-left cursor-pointer text-cyan-bright font-semibold"
          >
            6 AI Agents
          </button>
          <button
            onClick={() => onSelectTab?.('household-intelligence')}
            className="hover:text-primary transition-colors text-left cursor-pointer"
          >
            Telemetry API
          </button>
          <button
            onClick={() => onSelectTab?.('battery-storage')}
            className="hover:text-primary transition-colors text-left cursor-pointer"
          >
            Grid Security
          </button>
          <button
            onClick={() => onSelectTab?.('tariffs-arbitrage')}
            className="hover:text-primary transition-colors text-left cursor-pointer"
          >
            Tariff Exchange
          </button>
          <button
            onClick={() => onSelectTab?.('eco-impact')}
            className="hover:text-primary transition-colors text-left cursor-pointer"
          >
            Eco Impact
          </button>
          <button
            onClick={() => onSelectTab?.('settings')}
            className="hover:text-primary transition-colors text-left cursor-pointer"
          >
            Household Settings
          </button>
        </div>

        <div className="font-label-numeric-md text-label-badge text-on-surface-variant uppercase tracking-wider">
          © 2025 VOLTIQ ENERGY LTD. SECURED GRID PROTOCOL
        </div>
      </div>
    </footer>
  );
};
