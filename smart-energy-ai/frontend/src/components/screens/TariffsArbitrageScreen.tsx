import React, { useState } from 'react';
import { TelemetryState, TariffDataPoint } from '../../types';
import { INITIAL_TARIFF_SCHEDULE } from '../../data/initialData';

interface TariffsArbitrageProps {
  telemetry: TelemetryState;
  onOpenSimulatorModal: () => void;
}

export const TariffsArbitrageScreen: React.FC<TariffsArbitrageProps> = ({
  telemetry,
  onOpenSimulatorModal,
}) => {
  const [provider, setProvider] = useState<string>('octopus');
  const [batteryKwh, setBatteryKwh] = useState<number>(13.5);
  const [cyclesPerDay, setCyclesPerDay] = useState<number>(1.2);
  const [negativePricingAutoAbsorb, setNegativePricingAutoAbsorb] = useState<boolean>(true);

  // Calculate live yield based on slider inputs
  const estimatedAnnualYield = batteryKwh * cyclesPerDay * 365 * 0.28;
  const estimatedMonthlyYield = estimatedAnnualYield / 12;

  return (
    <div className="flex flex-col w-full pb-space-xl pt-space-md">
      {/* Top Title Banner */}
      <div className="mb-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-high border border-border-cyan-glow mb-2">
            <span className="material-symbols-outlined text-secondary text-[16px]">price_change</span>
            <span className="font-label-badge text-label-badge text-secondary uppercase tracking-wider font-bold">
              Autonomous Wholesale Arbitrage Engine
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary font-bold tracking-tight">
            Tariffs &amp; Wholesale Arbitrage
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
            Direct API connectivity with real-time wholesale energy exchanges. Buy in negative-rate windows when utilities pay you to charge, then dispatch to grid at peak premium rates.
          </p>
        </div>

        <button
          onClick={onOpenSimulatorModal}
          className="px-space-lg py-3 rounded-xl bg-primary-container text-on-primary-container font-headline-md text-body-md font-semibold shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:bg-cyan-bright transition-all flex items-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">insights</span>
          Open Interactive Simulator
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-space-lg">
        <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-lg">
          <span className="font-label-badge text-label-badge text-on-surface-variant uppercase block mb-1">
            Current Spot Tariff
          </span>
          <div className="font-label-numeric-lg text-label-numeric-lg text-cyan-bright">
            $0.44 <span className="text-body-sm font-normal text-on-surface-variant">/kWh</span>
          </div>
          <p className="font-body-sm text-body-sm text-secondary font-semibold mt-1">
            High Peak Spike Window (Dispatch Active)
          </p>
        </div>

        <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-lg">
          <span className="font-label-badge text-label-badge text-on-surface-variant uppercase block mb-1">
            30-Day Arbitrage Yield
          </span>
          <div className="font-label-numeric-lg text-label-numeric-lg text-emerald-bright">
            +${telemetry.arbitrageYield.toFixed(2)}
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Net cash balance returned to utility account
          </p>
        </div>

        <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-lg">
          <span className="font-label-badge text-label-badge text-on-surface-variant uppercase block mb-1">
            Next Negative Window
          </span>
          <div className="font-label-numeric-lg text-label-numeric-lg text-text-primary">
            03:30 - 05:00
          </div>
          <p className="font-body-sm text-body-sm text-emerald-bright font-semibold mt-1">
            -$0.04/kWh (Credit to Consumer)
          </p>
        </div>

        <div className="bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-lg">
          <span className="font-label-badge text-label-badge text-on-surface-variant uppercase block mb-1">
            Arbitrage Spread (24h)
          </span>
          <div className="font-label-numeric-lg text-label-numeric-lg text-text-primary">
            $0.52 <span className="text-body-sm font-normal text-on-surface-variant">delta</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Min -$0.04/kWh vs Max +$0.48/kWh
          </p>
        </div>
      </div>

      {/* 24-Hour Tariff Chart Visualizer */}
      <div className="bg-surface-container-low rounded-2xl p-space-lg border border-outline-variant/20 shadow-xl mb-space-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-space-md">
          <div>
            <h2 className="font-headline-md text-headline-md text-text-primary font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">ssid_chart</span>
              Wholesale Spot Price Horizon (24 Hours)
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Feed source: <span className="text-cyan-bright font-mono uppercase">Octopus Agile / ERCOT Real-Time Locational Marginal Pricing (LMP)</span>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-highest p-1 rounded-lg">
            {[
              { id: 'octopus', name: 'Octopus Agile' },
              { id: 'amber', name: 'Amber Smart' },
              { id: 'caiso', name: 'CAISO LMP' },
              { id: 'ercot', name: 'ERCOT RTM' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setProvider(p.id)}
                className={`px-3 py-1.5 rounded text-xs font-mono uppercase transition-colors cursor-pointer ${
                  provider === p.id
                    ? 'bg-primary-container text-on-primary-container font-bold'
                    : 'text-on-surface-variant hover:text-text-primary'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* CSS/SVG Bar Chart of Rates */}
        <div className="pt-6 pb-2">
          <div className="h-56 flex items-end justify-between gap-2 md:gap-4 px-2 border-b border-outline-variant/30 relative">
            {/* Zero Dollar Baseline */}
            <div className="absolute left-0 right-0 bottom-12 h-px bg-outline-variant/40 border-dashed border-t"></div>
            <span className="absolute left-1 bottom-13 text-[10px] font-mono text-on-surface-variant">$0.00 Base</span>

            {INITIAL_TARIFF_SCHEDULE.map((point, index) => {
              const heightMultiplier = Math.max(15, Math.min(180, (point.rate + 0.05) * 320));
              const isNegative = point.rate < 0;

              const barColor = isNegative
                ? 'bg-emerald-bright shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                : point.type === 'spike'
                ? 'bg-gradient-to-t from-primary to-cyan-bright shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                : point.type === 'peak'
                ? 'bg-primary'
                : 'bg-surface-container-highest hover:bg-surface-bright';

              return (
                <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest px-2 py-1 rounded text-[11px] font-mono whitespace-nowrap shadow-lg z-20 pointer-events-none">
                    {point.time}: ${point.rate.toFixed(2)}/kWh ({point.type})
                  </div>

                  <div
                    className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${barColor} ${
                      point.isCurrent ? 'ring-2 ring-cyan-bright animate-pulse' : ''
                    }`}
                    style={{ height: `${heightMultiplier}px` }}
                  ></div>

                  <span className="text-[10px] font-mono text-on-surface-variant mt-2 whitespace-nowrap">
                    {point.time}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-on-surface-variant mt-4 font-mono">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-bright"></span> Negative ($ Credit)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-surface-container-highest"></span> Off-Peak ($0.06 - $0.12)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-bright"></span> Peak Spike ($0.40+)
              </span>
            </div>
            <span className="text-primary font-bold">● Current Time: 14:24 (Peak Window)</span>
          </div>
        </div>
      </div>

      {/* Interactive Yield Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-7 bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-xl">
          <h3 className="font-headline-md text-headline-md text-text-primary font-bold mb-1">
            Arbitrage Yield Calculator
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
            Model your home battery capacity and daily cycling intensity to calculate annualized utility savings.
          </p>

          <div className="space-y-space-md">
            <div>
              <div className="flex justify-between font-body-sm text-body-sm mb-1">
                <span className="text-on-surface">Usable Battery Capacity</span>
                <span className="font-mono text-cyan-bright font-bold">{batteryKwh} kWh</span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                step={0.5}
                value={batteryKwh}
                onChange={(e) => setBatteryKwh(Number(e.target.value))}
                className="w-full accent-cyan-bright cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
                <span>5 kWh (Small)</span>
                <span>13.5 kWh (Powerwall 3)</span>
                <span>40 kWh (Multi-pack)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-body-sm text-body-sm mb-1">
                <span className="text-on-surface">Daily Micro-Arbitrage Cycles</span>
                <span className="font-mono text-emerald-bright font-bold">{cyclesPerDay.toFixed(1)} Cycles / day</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.5}
                step={0.1}
                value={cyclesPerDay}
                onChange={(e) => setCyclesPerDay(Number(e.target.value))}
                className="w-full accent-emerald-bright cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
                <span>0.5 (Conservative)</span>
                <span>1.2 (Optimized with Micro-buffers)</span>
                <span>2.5 (Aggressive)</span>
              </div>
            </div>

            <div className="p-space-md rounded-xl bg-surface-container flex items-center justify-between border border-outline-variant/20">
              <div>
                <span className="font-body-md text-body-md font-medium text-text-primary block">
                  Negative Wholesale Pricing Auto-Absorb
                </span>
                <span className="text-xs text-on-surface-variant">
                  Force maximum charge into battery &amp; water tank when rates drop below $0.00
                </span>
              </div>
              <button
                onClick={() => setNegativePricingAutoAbsorb(!negativePricingAutoAbsorb)}
                className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                  negativePricingAutoAbsorb ? 'bg-secondary-container' : 'bg-surface-container-highest'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md transform transition-transform ${
                    negativePricingAutoAbsorb ? 'right-0.5 bg-text-primary' : 'left-0.5 bg-outline'
                  }`}
                ></span>
              </button>
            </div>
          </div>
        </div>

        {/* Projected Returns Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-high p-space-lg rounded-xl border border-border-cyan-glow shadow-xl flex flex-col justify-between">
          <div>
            <span className="font-label-badge text-label-badge text-primary uppercase font-mono tracking-wider block mb-1">
              Forecasted Economics
            </span>
            <h4 className="font-headline-md text-headline-md text-text-primary font-bold">
              Projected Arbitrage Profit
            </h4>

            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20">
                <span className="text-xs font-mono text-outline block uppercase">Est. Monthly Arbitrage</span>
                <span className="font-label-numeric-lg text-label-numeric-lg text-emerald-bright font-bold">
                  +${estimatedMonthlyYield.toFixed(2)}
                  <span className="text-body-sm font-normal text-outline"> / mo</span>
                </span>
              </div>

              <div className="p-4 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/20">
                <span className="text-xs font-mono text-outline block uppercase">Est. Annual Net Return</span>
                <span className="font-label-numeric-lg text-label-numeric-lg text-text-primary font-bold">
                  +${estimatedAnnualYield.toFixed(2)}
                  <span className="text-body-sm font-normal text-outline"> / year</span>
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-on-surface-variant font-mono leading-relaxed">
            *Modeled assuming average spread of $0.28/kWh between night off-peak charging and evening ERCOT/CAISO/Octopus spike dispatch.
          </div>
        </div>
      </div>
    </div>
  );
};
