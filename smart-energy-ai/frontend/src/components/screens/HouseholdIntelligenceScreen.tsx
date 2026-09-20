import React, { useState } from 'react';
import { CircuitTelemetry } from '../../types';

interface HouseholdIntelligenceProps {
  circuits: CircuitTelemetry[];
  vampireDrain: number;
  onNeutralizeVampireDrain: () => void;
}

export const HouseholdIntelligenceScreen: React.FC<HouseholdIntelligenceProps> = ({
  circuits,
  vampireDrain,
  onNeutralizeVampireDrain,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitTelemetry>(circuits[0]);
  const [neutralizedSuccess, setNeutralizedSuccess] = useState<boolean>(false);

  const filteredCircuits = circuits.filter((c) => {
    if (activeFilter === 'all') return true;
    return c.category === activeFilter;
  });

  const totalMonitoredPower = circuits.reduce((sum, c) => sum + c.power, 0);
  const totalPhantomWatts = circuits.reduce((sum, c) => sum + c.phantomLoad, 0);

  const handleNeutralize = () => {
    onNeutralizeVampireDrain();
    setNeutralizedSuccess(true);
    setTimeout(() => setNeutralizedSuccess(false), 3500);
  };

  return (
    <div className="flex flex-col w-full pb-space-xl pt-space-md">
      {/* Header Banner */}
      <div className="mb-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-high border border-border-cyan-glow mb-2">
            <span className="material-symbols-outlined text-primary text-[16px]">radar</span>
            <span className="font-label-badge text-label-badge text-primary uppercase tracking-wider font-bold">
              Sub-Cycle Current Decomposition (0.1W Precision)
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary font-bold tracking-tight">
            Household Energy Intelligence
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
            Millisecond-frequency CT clamp harmonic telemetry isolating ghost draws, vampire leakage, and circuit degradation across all home distribution panels.
          </p>
        </div>

        {/* Action Button: Neutralize */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleNeutralize}
            disabled={vampireDrain === 0}
            className={`px-space-lg py-3 rounded-xl font-headline-md text-body-md font-semibold flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
              vampireDrain === 0
                ? 'bg-surface-container-high text-outline cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-bright to-primary text-on-primary shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:brightness-110 active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {vampireDrain === 0 ? 'check_circle' : 'bolt'}
            </span>
            {vampireDrain === 0 ? 'Phantom Draws Neutralized' : 'Neutralize Phantom Leakage'}
          </button>
        </div>
      </div>

      {neutralizedSuccess && (
        <div className="mb-space-md p-4 rounded-xl bg-secondary-container/20 border border-secondary text-secondary flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">verified</span>
            <span className="font-body-md text-body-md font-medium">
              Zero-leak pulse applied: Standby relays isolated 320W continuous phantom draw. Annual savings: ~$324.00.
            </span>
          </div>
          <span className="font-label-badge text-label-badge uppercase bg-secondary text-on-secondary px-2 py-0.5 rounded font-bold">
            Resolved
          </span>
        </div>
      )}

      {/* Top 3 Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-space-lg">
        {/* Card 1: Aggregate Monitored Draw */}
        <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-badge text-label-badge text-on-surface-variant uppercase">
              Active Load Monitored
            </span>
            <span className="material-symbols-outlined text-primary text-[20px]">insights</span>
          </div>
          <div className="font-label-numeric-lg text-label-numeric-lg text-text-primary">
            {totalMonitoredPower.toFixed(2)} <span className="text-body-sm font-normal text-on-surface-variant">kW</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Across 14 smart CT split-phase inductors with 99.8% precision.
          </p>
        </div>

        {/* Card 2: Vampire Drain */}
        <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-badge text-label-badge text-on-surface-variant uppercase">
              Standby Vampire Drain
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-cyan-bright font-label-badge text-label-badge font-bold">
              {vampireDrain === 0 ? 'ZERO LEAK' : 'LEAK DETECTED'}
            </span>
          </div>
          <div className="font-label-numeric-lg text-label-numeric-lg text-cyan-bright">
            {vampireDrain.toFixed(1)} <span className="text-body-sm font-normal text-on-surface-variant">Watts</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Unmonitored transformers, standby audio subwoofers, and HVAC dampers.
          </p>
        </div>

        {/* Card 3: Harmonic Distortion THD */}
        <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-badge text-label-badge text-on-surface-variant uppercase">
              Total Harmonic Distortion (THD)
            </span>
            <span className="px-2 py-0.5 rounded bg-secondary-container/30 text-secondary font-label-badge text-label-badge font-bold">
              CLEAN SINE
            </span>
          </div>
          <div className="font-label-numeric-lg text-label-numeric-lg text-emerald-bright">
            1.82% <span className="text-body-sm font-normal text-on-surface-variant">/ 60.01 Hz</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Split-phase voltage balance within IEEE 519 grid tolerance.
          </p>
        </div>
      </div>

      {/* Main Breakdown: Circuit Table & Live Waveform Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left: Circuit Matrix */}
        <div className="lg:col-span-8 bg-surface-container-low rounded-xl p-space-md border border-outline-variant/20 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-space-md">
            <h2 className="font-headline-md text-headline-md text-text-primary font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">account_tree</span>
              Monitored Circuit Matrix
            </h2>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-surface-container-highest p-1 rounded-lg">
              {['all', 'hvac', 'kitchen', 'living', 'ev', 'utility'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1 rounded-md text-xs font-mono uppercase transition-colors cursor-pointer ${
                    activeFilter === cat
                      ? 'bg-primary-container text-on-primary-container font-bold'
                      : 'text-on-surface-variant hover:text-text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20 font-label-badge text-label-badge text-on-surface-variant uppercase">
                  <th className="py-2.5 px-3">Circuit / Sub-Load</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Live Draw</th>
                  <th className="py-2.5 px-3">Headroom</th>
                  <th className="py-2.5 px-3">Phantom Leak</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 font-body-sm text-body-sm">
                {filteredCircuits.map((circuit) => {
                  const isSelected = selectedCircuit.id === circuit.id;
                  const usagePercent = Math.min(100, Math.round((circuit.power / circuit.maxCapacity) * 100));

                  return (
                    <tr
                      key={circuit.id}
                      onClick={() => setSelectedCircuit(circuit)}
                      className={`hover:bg-surface-container cursor-pointer transition-colors ${
                        isSelected ? 'bg-surface-container border-l-2 border-primary' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-medium text-text-primary">
                        {circuit.name}
                      </td>
                      <td className="py-3 px-3 uppercase text-xs font-mono text-on-surface-variant">
                        {circuit.category}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-text-primary">
                        {circuit.power.toFixed(2)} kW
                      </td>
                      <td className="py-3 px-3">
                        <div className="w-24">
                          <div className="flex justify-between text-[11px] text-on-surface-variant mb-0.5">
                            <span>{usagePercent}%</span>
                            <span>{circuit.maxCapacity}kW</span>
                          </div>
                          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${usagePercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-cyan-bright">
                        {circuit.phantomLoad} W
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-bold ${
                            circuit.status === 'optimized'
                              ? 'bg-secondary-container/30 text-secondary'
                              : circuit.status === 'normal'
                              ? 'bg-surface-container-high text-primary'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {circuit.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Selected Circuit Deep Telemetry */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant/20 shadow-xl">
            <span className="font-label-badge text-label-badge text-primary uppercase block mb-1">
              Active Inspector
            </span>
            <h3 className="font-headline-md text-body-lg font-bold text-text-primary">
              {selectedCircuit.name}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Category: <span className="uppercase text-text-primary font-mono">{selectedCircuit.category}</span> | Circuit Breaker: 30A Dual-Pole
            </p>

            <div className="mt-4 pt-4 border-t border-outline-variant/20 space-y-3">
              <div className="flex justify-between font-body-sm text-body-sm">
                <span className="text-on-surface-variant">Real-Time Power:</span>
                <span className="font-mono text-text-primary font-bold">{selectedCircuit.power.toFixed(2)} kW</span>
              </div>
              <div className="flex justify-between font-body-sm text-body-sm">
                <span className="text-on-surface-variant">Nominal Voltage:</span>
                <span className="font-mono text-text-primary">240.2 V AC</span>
              </div>
              <div className="flex justify-between font-body-sm text-body-sm">
                <span className="text-on-surface-variant">Instant Amperage:</span>
                <span className="font-mono text-text-primary">{((selectedCircuit.power * 1000) / 240).toFixed(1)} Amps</span>
              </div>
              <div className="flex justify-between font-body-sm text-body-sm">
                <span className="text-on-surface-variant">Power Factor (cos φ):</span>
                <span className="font-mono text-emerald-bright font-bold">0.97 (Optimal)</span>
              </div>
              <div className="flex justify-between font-body-sm text-body-sm">
                <span className="text-on-surface-variant">Estimated Daily Draw:</span>
                <span className="font-mono text-text-primary">{(selectedCircuit.power * 7.5).toFixed(1)} kWh/day</span>
              </div>
            </div>

            {/* Simulated Sine Wave Waveform Visualizer */}
            <div className="mt-4 pt-4 border-t border-outline-variant/20">
              <span className="font-label-badge text-label-badge text-on-surface-variant uppercase block mb-2">
                Sine Wave Harmonic Decomposition
              </span>
              <div className="h-20 w-full bg-surface-container-lowest rounded-lg p-2 flex items-center justify-center relative overflow-hidden border border-outline-variant/10">
                <svg className="w-full h-full text-cyan-bright" viewBox="0 0 300 60">
                  <path
                    d="M 0,30 Q 37.5,5 75,30 T 150,30 T 225,30 T 300,30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M 0,30 Q 37.5,15 75,30 T 150,30 T 225,30 T 300,30"
                    fill="none"
                    stroke="rgba(52, 211, 153, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                </svg>
                <span className="absolute bottom-1 right-2 text-[10px] font-mono text-on-surface-variant">
                  60.00 Hz • Zero Phase Jitter
                </span>
              </div>
            </div>
          </div>

          {/* Smart Alert Tile */}
          <div className="bg-surface-container p-space-md rounded-xl border border-border-cyan-glow">
            <div className="flex items-center gap-2 text-cyan-bright mb-1">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span className="font-headline-md text-body-md font-bold">Algorithmic Noise Guard</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              VoltIQ’s non-invasive harmonic analysis decodes the signature high-frequency switching hash of inverter compressors and LED driver degradation before equipment failure occurs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
