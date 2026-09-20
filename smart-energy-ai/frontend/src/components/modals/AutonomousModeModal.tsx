import React, { useState } from 'react';
import { MicrogridMode } from '../../types';

interface AutonomousModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: MicrogridMode;
  onSaveMode: (mode: MicrogridMode) => void;
}

export const AutonomousModeModal: React.FC<AutonomousModeModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSaveMode,
}) => {
  const [selectedMode, setSelectedMode] = useState<MicrogridMode>(currentMode);
  const [aiSensitivity, setAiSensitivity] = useState<string>('high');
  const [maxDischargeKw, setMaxDischargeKw] = useState<number>(5.0);
  const [activeSuccess, setActiveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleActivate = () => {
    onSaveMode(selectedMode);
    setActiveSuccess(true);
    setTimeout(() => {
      setActiveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-base/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface-container-low border border-border-cyan-glow w-full max-w-xl rounded-2xl p-space-lg shadow-2xl relative overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-space-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
            <h2 className="font-headline-md text-headline-md text-text-primary font-bold">
              Autonomous Grid Arbitrage Engine
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-text-primary hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Strategies */}
        <div className="space-y-3 mb-space-md">
          <span className="font-label-badge text-label-badge text-on-surface-variant uppercase font-mono block">
            Select Autonomous Strategy
          </span>

          {[
            {
              id: 'sentinel' as MicrogridMode,
              title: 'Eco Sentinel (Recommended)',
              desc: 'Balanced solar self-consumption, battery longevity micro-buffers, and dynamic tariff peak shaving.',
              icon: 'eco',
              badge: 'OPTIMAL CO2',
            },
            {
              id: 'independence' as MicrogridMode,
              title: 'Grid Independence Priority',
              desc: 'Locks Powerwall to minimum 50% state-of-charge for maximum autonomy during unexpected brownouts.',
              icon: 'shield_moon',
              badge: 'ZERO IMPORT',
            },
            {
              id: 'storm' as MicrogridMode,
              title: 'Storm Shield Mode',
              desc: 'Charges all battery systems to 100% immediately from grid & solar before severe weather landfall.',
              icon: 'thunderstorm',
              badge: '100% BACKUP',
            },
          ].map((strat) => (
            <div
              key={strat.id}
              onClick={() => setSelectedMode(strat.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                selectedMode === strat.id
                  ? 'bg-surface-container border-primary shadow-[0_0_16px_rgba(6,182,212,0.2)]'
                  : 'bg-surface-container-lowest border-outline-variant/20 hover:border-outline-variant/40'
              }`}
            >
              <div className={`p-2 rounded-lg ${selectedMode === strat.id ? 'bg-primary/20 text-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                <span className="material-symbols-outlined text-[22px]">{strat.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-headline-md text-body-md font-bold text-text-primary">
                    {strat.title}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface-container-high text-cyan-bright font-bold">
                    {strat.badge}
                  </span>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                  {strat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Parameter Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-space-lg pt-2 border-t border-outline-variant/20">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-on-surface-variant uppercase">Max Peak Export</span>
              <span className="text-cyan-bright font-bold">{maxDischargeKw} kW</span>
            </div>
            <input
              type="range"
              min={1}
              max={11}
              step={0.5}
              value={maxDischargeKw}
              onChange={(e) => setMaxDischargeKw(Number(e.target.value))}
              className="w-full accent-cyan-bright cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-on-surface-variant uppercase">AI Lookahead Horizon</span>
              <span className="text-emerald-bright font-bold">24 Hours (LMP)</span>
            </div>
            <select
              value={aiSensitivity}
              onChange={(e) => setAiSensitivity(e.target.value)}
              className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-xs font-mono text-text-primary focus:outline-none focus:border-cyan-bright"
            >
              <option value="high">High Precision (5-Min Intervals)</option>
              <option value="medium">Balanced (30-Min Intervals)</option>
              <option value="low">Conservative (Hourly Day-Ahead)</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-on-surface-variant hover:text-text-primary font-body-md text-sm transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleActivate}
            className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-headline-md text-sm font-semibold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:bg-cyan-bright transition-all cursor-pointer"
          >
            {activeSuccess ? 'Engine Engaged!' : 'Activate Autonomous Engine'}
          </button>
        </div>
      </div>
    </div>
  );
};
