import React from 'react';
import { TelemetryState } from '../../types';

interface EcoImpactProps {
  telemetry: TelemetryState;
}

export const EcoImpactScreen: React.FC<EcoImpactProps> = ({ telemetry }) => {
  const fuelMix = [
    { name: 'Wind Generation', pct: 44, color: 'bg-emerald-bright', icon: 'air' },
    { name: 'Rooftop & Utility Solar', pct: 36, color: 'bg-cyan-bright', icon: 'solar_power' },
    { name: 'Hydroelectric / Storage', pct: 12, color: 'bg-primary', icon: 'water_drop' },
    { name: 'Fossil Peaker Plants', pct: 8, color: 'bg-outline', icon: 'factory' },
  ];

  return (
    <div className="flex flex-col w-full pb-space-xl pt-space-md">
      {/* Title Header */}
      <div className="mb-space-lg">
        <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-high border border-border-emerald-glow mb-2">
          <span className="material-symbols-outlined text-secondary text-[16px]">nest_eco_leaf</span>
          <span className="font-label-badge text-label-badge text-secondary uppercase tracking-wider font-bold">
            Hyper-Local Grid Decarbonization Index
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-text-primary font-bold tracking-tight">
          Ecological Impact &amp; Carbon Telemetry
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
          Real-time carbon intensity feeds mapping regional wind and hydro production. Shift heavy appliance cycles away from fossil peaker plant dispatches automatically.
        </p>
      </div>

      {/* Top 3 Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-space-lg">
        <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-badge text-label-badge text-on-surface-variant uppercase">
              Current Carbon Intensity
            </span>
            <span className="px-2 py-0.5 rounded bg-secondary-container/30 text-secondary text-xs font-mono font-bold">
              CLEAN TIER
            </span>
          </div>
          <div className="font-label-numeric-lg text-label-numeric-lg text-emerald-bright">
            {telemetry.carbonIntensity} <span className="text-body-sm font-normal text-on-surface-variant">g CO2/kWh</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Regional grid average is 310g CO2/kWh. Your household is 73% cleaner.
          </p>
        </div>

        <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-badge text-label-badge text-on-surface-variant uppercase">
              Lifetime Carbon Avoided
            </span>
            <span className="material-symbols-outlined text-cyan-bright text-[20px]">compost</span>
          </div>
          <div className="font-label-numeric-lg text-label-numeric-lg text-text-primary">
            14.8 <span className="text-body-sm font-normal text-on-surface-variant">Metric Tons</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Equivalent to removing 3.2 gasoline passenger vehicles for 1 full year.
          </p>
        </div>

        <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-badge text-label-badge text-on-surface-variant uppercase">
              Reforestation Equivalent
            </span>
            <span className="material-symbols-outlined text-secondary text-[20px]">forest</span>
          </div>
          <div className="font-label-numeric-lg text-label-numeric-lg text-emerald-bright">
            692 <span className="text-body-sm font-normal text-on-surface-variant">Trees</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            10-year tree seedling carbon absorption equivalent achieved.
          </p>
        </div>
      </div>

      {/* Grid Mix Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-space-xl">
        <div className="lg:col-span-7 bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-xl">
          <h2 className="font-headline-md text-headline-md text-text-primary font-semibold mb-1">
            Regional Grid Generation Fuel Mix
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
            Live telemetry from regional balancing authority interconnection (Wind, Solar, Hydro, Gas).
          </p>

          <div className="space-y-4">
            {fuelMix.map((fuel) => (
              <div key={fuel.name}>
                <div className="flex justify-between font-body-sm text-body-sm mb-1">
                  <span className="text-text-primary flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{fuel.icon}</span>
                    {fuel.name}
                  </span>
                  <span className="font-mono font-bold text-text-primary">{fuel.pct}%</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${fuel.color} rounded-full`} style={{ width: `${fuel.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/10 flex items-center justify-between text-xs font-mono text-on-surface-variant">
            <span>Renewable Penetration: 92%</span>
            <span className="text-emerald-bright">Fossil Peakers Offline</span>
          </div>
        </div>

        {/* Clean Windows Advisor */}
        <div className="lg:col-span-5 bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-xl flex flex-col justify-between">
          <div>
            <span className="font-label-badge text-label-badge text-primary uppercase font-mono block mb-1">
              Autonomous Shifting Engine
            </span>
            <h3 className="font-headline-md text-headline-md text-text-primary font-bold">
              Optimal Clean Windows
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 mb-4">
              Upcoming hours when grid emission factor is at its absolute lowest:
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-surface-container border border-secondary/20 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm font-bold text-emerald-bright block">12:00 - 15:30 (Today)</span>
                  <span className="text-xs text-on-surface-variant">Surplus rooftop &amp; utility solar window</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-secondary-container/40 text-secondary text-xs font-mono font-bold">
                  42g CO2
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <span className="font-mono text-sm font-bold text-cyan-bright block">01:30 - 05:00 (Tonight)</span>
                  <span className="text-xs text-on-surface-variant">High offshore wind generation corridor</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary text-xs font-mono font-bold">
                  58g CO2
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-surface-container-highest/40 text-xs text-on-surface-variant leading-relaxed">
            By deferring heavy appliance runs into these windows, your household eliminates carbon emission equivalents comparable to planting 58 trees monthly.
          </div>
        </div>
      </div>
    </div>
  );
};
