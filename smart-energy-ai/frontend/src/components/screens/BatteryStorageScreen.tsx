import React, { useState } from 'react';
import { TelemetryState } from '../../types';

interface BatteryStorageProps {
  telemetry: TelemetryState;
}

export const BatteryStorageScreen: React.FC<BatteryStorageProps> = ({ telemetry }) => {
  const [reserveMargin, setReserveMargin] = useState<number>(20);
  const [cRateLimit, setCRateLimit] = useState<number>(0.5);
  const [cellHealthProtection, setCellHealthProtection] = useState<boolean>(true);

  return (
    <div className="flex flex-col w-full pb-space-xl pt-space-md">
      {/* Title Header */}
      <div className="mb-space-lg">
        <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-high border border-border-cyan-glow mb-2">
          <span className="material-symbols-outlined text-primary text-[16px]">battery_charging_full</span>
          <span className="font-label-badge text-label-badge text-primary uppercase tracking-wider font-bold">
            Electrochemical Cell Health &amp; Dispatch
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-text-primary font-bold tracking-tight">
          Battery Storage Architecture
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
          Powerwall 3 split-phase inverter telemetry with intelligent C-rate modulation, state-of-charge micro-buffers, and active thermal management reducing long-term cell degradation by 34%.
        </p>
      </div>

      {/* Main Battery Status Card */}
      <div className="bg-surface-container-low rounded-2xl p-space-lg border border-outline-variant/30 shadow-2xl mb-space-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-center">
          {/* Left: Graphic Battery Visualizer */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-space-md">
            <div className="w-56 h-80 rounded-3xl bg-surface-container-lowest border-4 border-outline-variant/40 relative p-3 flex flex-col justify-end shadow-2xl">
              {/* Battery Terminal Pin */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-3 bg-outline-variant/60 rounded-t-lg"></div>

              {/* Liquid Charge Fluid */}
              <div
                className="w-full bg-gradient-to-t from-emerald-bright via-primary to-cyan-bright rounded-2xl transition-all duration-700 relative overflow-hidden flex items-center justify-center shadow-[0_0_24px_rgba(34,211,238,0.4)]"
                style={{ height: `${telemetry.powerwallSoc}%` }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 to-transparent"></div>
                <span className="font-label-numeric-lg text-[40px] text-canvas-base font-extrabold z-10 select-none">
                  {telemetry.powerwallSoc.toFixed(0)}%
                </span>
              </div>

              {/* Status footer inside battery */}
              <div className="text-center pt-2 font-mono text-xs text-on-surface-variant">
                13.5 kWh Tesla Powerwall 3
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-bright opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-bright"></span>
              </span>
              <span className="font-mono text-sm text-emerald-bright font-bold">
                Exporting +{telemetry.powerwallFlow.toFixed(1)} kW to Grid
              </span>
            </div>
          </div>

          {/* Right: Key Battery Health Diagnostics */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-badge text-label-badge text-on-surface-variant uppercase font-mono">
                  Module Diagnostics
                </span>
                <span className="px-2.5 py-1 rounded-full bg-secondary-container/30 text-secondary text-xs font-mono font-bold uppercase">
                  Health 98.2%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-3.5 rounded-xl bg-surface-container">
                  <span className="text-xs text-on-surface-variant block font-mono uppercase">Core Temperature</span>
                  <span className="font-label-numeric-md text-headline-md text-text-primary font-bold">
                    {telemetry.batteryTemp}°C
                  </span>
                  <span className="text-[11px] text-emerald-bright block mt-0.5">Liquid Loop Active</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container">
                  <span className="text-xs text-on-surface-variant block font-mono uppercase">Discharge Rate</span>
                  <span className="font-label-numeric-md text-headline-md text-cyan-bright font-bold">
                    0.38 C
                  </span>
                  <span className="text-[11px] text-text-primary block mt-0.5">Below 0.8C Max</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container">
                  <span className="text-xs text-on-surface-variant block font-mono uppercase">Round-Trip Eff.</span>
                  <span className="font-label-numeric-md text-headline-md text-text-primary font-bold">
                    92.4%
                  </span>
                  <span className="text-[11px] text-secondary block mt-0.5">DC Coupled</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container">
                  <span className="text-xs text-on-surface-variant block font-mono uppercase">Lifetime Cycles</span>
                  <span className="font-label-numeric-md text-headline-md text-text-primary font-bold">
                    412
                  </span>
                  <span className="text-[11px] text-on-surface-variant block mt-0.5">Est. 4,200 Rating</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container">
                  <span className="text-xs text-on-surface-variant block font-mono uppercase">Inverter Power</span>
                  <span className="font-label-numeric-md text-headline-md text-text-primary font-bold">
                    11.5 kW
                  </span>
                  <span className="text-[11px] text-cyan-bright block mt-0.5">Continuous Rating</span>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container">
                  <span className="text-xs text-on-surface-variant block font-mono uppercase">Cell Degradation</span>
                  <span className="font-label-numeric-md text-headline-md text-emerald-bright font-bold">
                    -34% Low
                  </span>
                  <span className="text-[11px] text-emerald-bright block mt-0.5">Buffer Protected</span>
                </div>
              </div>

              {/* Micro-buffer explanation */}
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 mb-6">
                <div className="flex items-center gap-2 text-primary font-bold mb-1">
                  <span className="material-symbols-outlined text-[18px]">security</span>
                  <span className="font-headline-md text-body-md">SoC Micro-Buffer Algorithm</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  Standard factory setups let batteries sit at 100% saturation in high ambient heat, degrading NMC/LFP cathode lattices. VoltIQ floats between 15% and 88% until 30 minutes before high-tariff export events, dramatically extending useful pack lifespan.
                </p>
              </div>
            </div>

            {/* Interactive Reserve Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-outline-variant/20">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-on-surface-variant uppercase">Emergency Outage Reserve</span>
                  <span className="text-cyan-bright font-bold">{reserveMargin}% (2.7 kWh)</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  value={reserveMargin}
                  onChange={(e) => setReserveMargin(Number(e.target.value))}
                  className="w-full accent-cyan-bright cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-on-surface-variant uppercase">Max C-Rate Throttling</span>
                  <span className="text-emerald-bright font-bold">{cRateLimit}C (Thermal Safe)</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={1.0}
                  step={0.1}
                  value={cRateLimit}
                  onChange={(e) => setCRateLimit(Number(e.target.value))}
                  className="w-full accent-emerald-bright cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
