import React from 'react';
import { TelemetryState, CircuitTelemetry, ApplianceRelay, MicrogridMode, NavigationTab } from '../../types';
import { HOLOGRAM_3D_URL } from '../Header';
import { FAQ_ITEMS } from '../../data/initialData';

interface LiveGridScreenProps {
  telemetry: TelemetryState;
  circuits: CircuitTelemetry[];
  relays: ApplianceRelay[];
  activeMode: MicrogridMode;
  onModeChange: (mode: MicrogridMode) => void;
  onToggleRelay: (id: string) => void;
  onOpenAutonomousModal: () => void;
  onOpenSimulatorModal: () => void;
  onOpenInverterModal: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
  optimizationEvents: any[];
}

export const LiveGridScreen: React.FC<LiveGridScreenProps> = ({
  telemetry,
  circuits,
  relays,
  activeMode,
  onModeChange,
  onToggleRelay,
  onOpenAutonomousModal,
  onOpenSimulatorModal,
  onOpenInverterModal,
  onNavigateTab,
  optimizationEvents,
}) => {
  return (
    <div className="flex flex-col w-full">
      {/* Subtle Ambient Glow Background Highlights */}
      <div className="relative w-full overflow-hidden pb-space-xl">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-[140px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-electric/10 rounded-full blur-[130px] pointer-events-none"></div>

        {/* Section 1: Hero & Command Overview */}
        <section className="relative pt-space-lg lg:pt-space-xl">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-space-xl">
            {/* Top Status Pill */}
            <div className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-full bg-surface-container-high shadow-lg mb-space-lg border border-border-cyan-glow">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-bright opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-bright"></span>
              </span>
              <span className="font-label-badge text-label-badge uppercase tracking-widest text-primary">
                Autonomous Grid Arbitrage Engine 3.4
              </span>
              <span className="text-outline-variant font-label-badge text-label-badge px-1">|</span>
              <span className="font-label-badge text-label-badge text-secondary uppercase">
                Active Sync
              </span>
            </div>

            <h1 className="font-headline-lg lg:font-display-lg text-headline-lg lg:text-display-lg text-text-primary tracking-tight mb-space-md font-bold">
              Energy Visibility &amp; Intelligence <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-cyan-bright to-secondary bg-clip-text text-transparent">
                For The Modern Household
              </span>
            </h1>

            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-space-xl">
              VoltIQ uncovers phantom appliance loads, maps invisible energy consumption inside your circuits, and brings battery storage, dynamic wholesale tariffs, and EV fast-charging under autonomous, algorithmic control.
            </p>

            {/* Command CTA Row */}
            <div className="flex flex-wrap items-center justify-center gap-space-md">
              <button
                onClick={onOpenAutonomousModal}
                className="px-space-xl py-3.5 rounded-xl bg-primary-container text-on-primary-container font-headline-md text-body-md font-semibold shadow-[0_0_28px_rgba(6,182,212,0.4)] hover:bg-cyan-bright transition-all active:scale-[0.98] flex items-center gap-space-sm cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">tune</span>
                Launch Autonomous Mode
              </button>

              <button
                onClick={onOpenSimulatorModal}
                className="px-space-lg py-3.5 rounded-xl bg-surface-container-high text-text-primary font-body-md text-body-md hover:bg-surface-bright transition-all shadow-md flex items-center gap-space-sm border border-outline-variant/30 cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">insights</span>
                Simulate Wholesale Tariffs
              </button>
            </div>
          </div>

          {/* Orchid-Inspired Metric Ribbon (4 Key Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-space-xl">
            {/* Stat 1: Net Monthly Bill */}
            <div
              onClick={() => onNavigateTab('tariffs-arbitrage')}
              className="bg-surface-container-low/90 backdrop-blur-xl p-space-lg rounded-xl shadow-lg relative overflow-hidden group hover:bg-surface-container transition-all cursor-pointer border border-outline-variant/10"
            >
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary/10 rounded-full blur-xl group-hover:bg-primary/20 transition-all"></div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">
                  Net Monthly Bill
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container/30 text-secondary font-label-badge text-label-badge font-bold">
                  -42% CUT
                </span>
              </div>
              <div className="font-label-numeric-lg text-label-numeric-lg text-text-primary mb-1">
                ${telemetry.netMonthlyBill.toFixed(0)}
                <span className="text-body-sm font-body-sm text-on-surface-variant font-normal">/mo</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Down from $280/mo baseline through adaptive algorithmic shifting.
              </p>
            </div>

            {/* Stat 2: Self-Sufficiency */}
            <div
              onClick={() => onNavigateTab('eco-impact')}
              className="bg-surface-container-low/90 backdrop-blur-xl p-space-lg rounded-xl shadow-lg relative overflow-hidden group hover:bg-surface-container transition-all cursor-pointer border border-outline-variant/10"
            >
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary/10 rounded-full blur-xl group-hover:bg-secondary/20 transition-all"></div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">
                  Self-Sufficiency
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-badge text-label-badge font-bold">
                  PEAK SHAVED
                </span>
              </div>
              <div className="font-label-numeric-lg text-label-numeric-lg text-emerald-bright mb-1">
                {telemetry.selfSufficiency.toFixed(1)}%
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Solar array direct generation + smart Powerwall peak dispatch.
              </p>
            </div>

            {/* Stat 3: Arbitrage Yield */}
            <div
              onClick={() => onNavigateTab('tariffs-arbitrage')}
              className="bg-surface-container-low/90 backdrop-blur-xl p-space-lg rounded-xl shadow-lg relative overflow-hidden group hover:bg-surface-container transition-all cursor-pointer border border-outline-variant/10"
            >
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-cyan-bright/10 rounded-full blur-xl group-hover:bg-cyan-bright/20 transition-all"></div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">
                  Arbitrage Yield
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container/30 text-secondary font-label-badge text-label-badge font-bold">
                  LIVE CYC
                </span>
              </div>
              <div className="font-label-numeric-lg text-label-numeric-lg text-text-primary mb-1">
                +${telemetry.arbitrageYield.toFixed(2)}
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Stored at off-peak $0.08/kWh → sold to spot grid at $0.44/kWh.
              </p>
            </div>

            {/* Stat 4: Vampire Drain */}
            <div
              onClick={() => onNavigateTab('household-intelligence')}
              className="bg-surface-container-low/90 backdrop-blur-xl p-space-lg rounded-xl shadow-lg relative overflow-hidden group hover:bg-surface-container transition-all cursor-pointer border border-outline-variant/10"
            >
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-tertiary/10 rounded-full blur-xl group-hover:bg-tertiary/20 transition-all"></div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-label-badge text-label-badge text-on-surface-variant uppercase tracking-wider">
                  Vampire Drain
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-cyan-bright font-label-badge text-label-badge font-bold">
                  ZERO LEAK
                </span>
              </div>
              <div className="font-label-numeric-lg text-label-numeric-lg text-text-primary mb-1">
                {telemetry.vampireDrain.toFixed(2)}
                <span className="text-body-sm font-body-sm text-on-surface-variant font-normal"> W unmonitored</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Neutralized 320W continuous phantom idle draw across 14 circuits.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Interactive Centerpiece Visual Model & Telemetry HUD */}
        <section className="mb-space-xl">
          <div className="bg-surface-container-low/80 backdrop-blur-2xl rounded-2xl p-space-md lg:p-space-lg shadow-2xl relative border border-outline-variant/20">
            {/* Centerpiece Top bar */}
            <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-md mb-space-md border-b border-outline-variant/20">
              <div className="flex items-center gap-space-sm">
                <div className="w-3 h-3 rounded-full bg-secondary animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]"></div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-text-primary leading-tight font-semibold">
                    Digital Microgrid Command Nexus
                  </h2>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Real-time vector bus: 240V / 60Hz split-phase harmonic sync
                  </span>
                </div>
              </div>

              {/* Dynamic Mode Selector */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container-highest shadow-inner">
                <button
                  onClick={() => onModeChange('sentinel')}
                  className={`px-space-md py-1.5 rounded-lg text-body-sm font-body-sm font-semibold transition-all cursor-pointer ${
                    activeMode === 'sentinel'
                      ? 'bg-primary-container text-on-primary-container shadow-md'
                      : 'text-on-surface-variant hover:text-text-primary'
                  }`}
                  type="button"
                >
                  Eco Sentinel
                </button>
                <button
                  onClick={() => onModeChange('independence')}
                  className={`px-space-md py-1.5 rounded-lg text-body-sm font-body-sm font-medium transition-all cursor-pointer ${
                    activeMode === 'independence'
                      ? 'bg-primary-container text-on-primary-container shadow-md font-semibold'
                      : 'text-on-surface-variant hover:text-text-primary'
                  }`}
                  type="button"
                >
                  Grid Independence
                </button>
                <button
                  onClick={() => onModeChange('storm')}
                  className={`px-space-md py-1.5 rounded-lg text-body-sm font-body-sm font-medium transition-all cursor-pointer ${
                    activeMode === 'storm'
                      ? 'bg-primary-container text-on-primary-container shadow-md font-semibold'
                      : 'text-on-surface-variant hover:text-text-primary'
                  }`}
                  type="button"
                >
                  Storm Shield
                </button>
              </div>
            </div>

            {/* Layout Grid: Interactive Visual Center & Realtime Telemetry */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch">
              {/* Main 3D Iso Interactive Twin View */}
              <div className="lg:col-span-8 relative rounded-xl overflow-hidden bg-surface-container-lowest min-h-[420px] lg:min-h-[500px] flex items-center justify-center shadow-inner group border border-outline-variant/20">
                <img
                  alt="Home Energy Intelligence Hologram 3D Isometric View"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 select-none"
                  src={HOLOGRAM_3D_URL}
                />
                {/* Scrim Overlay for Contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-canvas-base/90 via-transparent to-canvas-base/40 pointer-events-none"></div>

                {/* Overlaid Live Telemetry Markers */}
                {/* Marker 1: Solar Roof */}
                <div
                  onClick={() => onNavigateTab('eco-impact')}
                  className="absolute top-6 left-6 bg-surface-container/90 backdrop-blur-md p-space-sm rounded-lg shadow-xl flex items-center gap-space-sm border border-secondary/30 hover:border-secondary transition-all cursor-pointer hover:scale-105"
                  title="Click to view Solar Generation details"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[18px]">solar_power</span>
                  </div>
                  <div>
                    <span className="font-label-badge text-label-badge text-on-surface-variant block uppercase">
                      Solar Array
                    </span>
                    <span className="font-label-numeric-md text-label-numeric-md text-emerald-bright font-bold">
                      {telemetry.solarGeneration.toFixed(1)} kW
                    </span>
                  </div>
                </div>

                {/* Marker 2: Powerwall */}
                <div
                  onClick={() => onNavigateTab('battery-storage')}
                  className="absolute bottom-6 left-6 bg-surface-container/90 backdrop-blur-md p-space-sm rounded-lg shadow-xl flex items-center gap-space-sm border border-primary/30 hover:border-primary transition-all cursor-pointer hover:scale-105"
                  title="Click to view Powerwall storage health"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">battery_charging_full</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-label-badge text-label-badge text-on-surface-variant uppercase">
                        Powerwall 3
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-bright animate-ping"></span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-label-numeric-md text-label-numeric-md text-text-primary font-bold">
                        {telemetry.powerwallSoc.toFixed(0)}%
                      </span>
                      <span className="font-body-sm text-body-sm text-secondary font-semibold">
                        Exporting +{telemetry.powerwallFlow.toFixed(1)} kW
                      </span>
                    </div>
                  </div>
                </div>

                {/* Marker 3: EV Charger */}
                <div
                  onClick={() => onNavigateTab('appliances-ev')}
                  className="absolute bottom-6 right-6 bg-surface-container/90 backdrop-blur-md p-space-sm rounded-lg shadow-xl flex items-center gap-space-sm border border-tertiary/30 hover:border-tertiary transition-all cursor-pointer hover:scale-105"
                  title="Click to manage EV Charging schedules"
                >
                  <div className="w-8 h-8 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[18px]">electric_car</span>
                  </div>
                  <div>
                    <span className="font-label-badge text-label-badge text-on-surface-variant block uppercase">
                      Tesla Model Y
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-label-numeric-md text-label-numeric-md text-text-primary font-bold">
                        {telemetry.evSoc.toFixed(0)}%
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {telemetry.evStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Marker 4: Live Score Badge */}
                <div
                  onClick={() => onNavigateTab('household-intelligence')}
                  className="absolute top-6 right-6 bg-surface-container-high/90 backdrop-blur-md px-space-md py-space-xs rounded-full shadow-xl flex items-center gap-2 border border-border-cyan-glow cursor-pointer hover:scale-105 transition-all"
                  title="Click to analyze Household sub-circuits"
                >
                  <span className="font-label-badge text-label-badge text-on-surface-variant uppercase">
                    Household Load:
                  </span>
                  <span className="font-label-numeric-md text-body-md text-text-primary font-bold">
                    {telemetry.householdLoad.toFixed(1)} kW
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-secondary-container/40 text-secondary text-label-badge font-bold">
                    OPTIMIZED
                  </span>
                </div>
              </div>

              {/* Right Telemetry & Instant Control Stack */}
              <div className="lg:col-span-4 flex flex-col gap-space-md">
                {/* Dynamic Sub-Circuit Telemetry */}
                <div className="bg-surface-container p-space-md rounded-xl shadow-md border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-space-sm">
                    <button
                      onClick={() => onNavigateTab('household-intelligence')}
                      className="font-headline-md text-body-md text-text-primary font-semibold flex items-center gap-1.5 hover:text-primary transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-primary text-[18px]">account_tree</span>
                      Sub-Circuit Telemetry
                    </button>
                    <span className="font-label-badge text-label-badge text-cyan-bright">
                      REAL-TIME
                    </span>
                  </div>

                  {/* Circuit Breakdown Items */}
                  <div className="space-y-space-sm">
                    {circuits.slice(0, 4).map((circuit, idx) => {
                      const percentage = Math.min(100, Math.round((circuit.power / circuit.maxCapacity) * 100));
                      const barColor = 
                        idx === 0 ? 'bg-cyan-bright' :
                        idx === 1 ? 'bg-primary' :
                        idx === 2 ? 'bg-tertiary-container' : 'bg-secondary';

                      return (
                        <div key={circuit.id}>
                          <div className="flex justify-between font-body-sm text-body-sm mb-1">
                            <span className="text-on-surface">{circuit.name}</span>
                            <span className="font-label-numeric-md text-body-sm text-text-primary font-bold">
                              {circuit.power.toFixed(1)} kW
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                            <div
                              className={`h-full ${barColor} rounded-full transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 pt-2 border-t border-outline-variant/10 text-right">
                    <button
                      onClick={() => onNavigateTab('household-intelligence')}
                      className="text-xs text-primary hover:underline font-mono uppercase tracking-wider"
                    >
                      View all 14 monitored circuits →
                    </button>
                  </div>
                </div>

                {/* Fast Appliance Grid Interrupters */}
                <div className="bg-surface-container p-space-md rounded-xl shadow-md flex-1 flex flex-col justify-between border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-headline-md text-body-md text-text-primary font-semibold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-secondary text-[18px]">power_settings_new</span>
                      Autonomous Relays
                    </span>
                    <span className="font-label-badge text-label-badge text-on-surface-variant">
                      {relays.filter(r => r.active).length} ONLINE
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-space-sm">
                    {relays.map((relay) => (
                      <div
                        key={relay.id}
                        className="p-space-sm rounded-lg bg-surface-container-low flex flex-col justify-between h-20 border border-outline-variant/10"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`material-symbols-outlined text-[18px] ${relay.active ? 'text-cyan-bright' : 'text-on-surface-variant'}`}>
                            {relay.icon}
                          </span>
                          <button
                            onClick={() => onToggleRelay(relay.id)}
                            className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
                              relay.active ? 'bg-secondary-container' : 'bg-surface-container-highest'
                            }`}
                            type="button"
                            aria-label={`Toggle ${relay.name}`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                                relay.active ? 'right-0.5 bg-text-primary' : 'left-0.5 bg-outline-variant'
                              }`}
                            ></span>
                          </button>
                        </div>
                        <span className={`font-body-sm text-body-sm font-medium ${relay.active ? 'text-text-primary' : 'text-on-surface-variant'}`}>
                          {relay.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Optimization event quick tracker */}
                  <div className="mt-space-sm pt-space-sm bg-surface-container-highest/40 p-2 rounded-lg">
                    <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-secondary text-[16px]">bolt</span>
                      <span className="truncate">
                        Next tariff shift: <strong>-$0.22/kWh</strong> at 23:00 tonight
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Orchid-Style 'Energy Dark Matter' Discovery Breakdown */}
        <section className="mb-space-xl">
          <div className="mb-space-lg">
            <div className="flex items-center gap-space-xs mb-space-xs">
              <span className="font-label-badge text-label-badge text-primary uppercase tracking-wider font-bold">
                Architecture &amp; Intelligence
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-text-primary font-bold">
              Exposing The Energy Dark Matter
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
              Standard smart meters report gross kilowatts after the fact. VoltIQ continuously decomposes household current at the millisecond frequency, turning opaque power draw into active financial savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Feature 1: Dark Matter Standby Leakage */}
            <div
              onClick={() => onNavigateTab('household-intelligence')}
              className="bg-surface-container-low p-space-lg rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between border border-outline-variant/20 hover:border-primary/40 transition-all cursor-pointer group"
            >
              <div className="absolute top-0 right-0 p-space-lg opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-primary">radar</span>
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-space-md shadow-[0_0_16px_rgba(6,182,212,0.2)]">
                  <span className="material-symbols-outlined text-[24px]">visibility</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-text-primary mb-space-xs font-semibold group-hover:text-primary transition-colors">
                  Discover Hidden Energy Leakage
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                  Uncover ghost draws and parasitic loads from continuous HVAC dampers, sub-chillers, audio racks, and unconfigured smart transformers lingering in standby. VoltIQ isolates circuit harmonics without requiring physical re-wiring.
                </p>
              </div>
              <div className="bg-surface-container p-space-sm rounded-xl">
                <div className="flex items-center justify-between font-label-badge text-label-badge text-on-surface-variant uppercase mb-1">
                  <span>Telemetry Precision</span>
                  <span className="text-primary font-mono">0.1W SENSITIVITY</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>

            {/* Feature 2: Wholesale Tariff Arbitrage */}
            <div
              onClick={() => onNavigateTab('tariffs-arbitrage')}
              className="bg-surface-container-low p-space-lg rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between border border-outline-variant/20 hover:border-secondary/40 transition-all cursor-pointer group"
            >
              <div className="absolute top-0 right-0 p-space-lg opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-secondary">currency_exchange</span>
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-space-md shadow-[0_0_16px_rgba(16,185,129,0.2)]">
                  <span className="material-symbols-outlined text-[24px]">price_change</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-text-primary mb-space-xs font-semibold group-hover:text-secondary transition-colors">
                  Autonomous Dynamic Tariff Arbitrage
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                  Direct API handshake with Octopus Agile, Amber, NordPool, and CAISO real-time wholesale pricing. Charge high-capacity residential batteries during negative pricing windows, then export at 5x premium rates during peak spikes.
                </p>
              </div>
              <div className="bg-surface-container p-space-sm rounded-xl">
                <div className="flex items-center justify-between font-label-badge text-label-badge text-on-surface-variant uppercase mb-1">
                  <span>Arbitrage Automation</span>
                  <span className="text-secondary font-mono">OCTOPUS / AMBER SYNC</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>

            {/* Feature 3: Sub-circuit & EV Orchestration */}
            <div
              onClick={() => onNavigateTab('appliances-ev')}
              className="bg-surface-container-low p-space-lg rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between border border-outline-variant/20 hover:border-cyan-bright/40 transition-all cursor-pointer group"
            >
              <div className="absolute top-0 right-0 p-space-lg opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-cyan-bright">speed</span>
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-bright/10 flex items-center justify-center text-cyan-bright mb-space-md shadow-[0_0_16px_rgba(34,211,238,0.2)]">
                  <span className="material-symbols-outlined text-[24px]">electric_bolt</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-text-primary mb-space-xs font-semibold group-hover:text-cyan-bright transition-colors">
                  Sub-Circuit Telemetry &amp; EV Orchestration
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                  Synchronize heat pumps and heavy electric vehicle chargers with localized solar excess. Prevent main breaker trippings through instant micro-curtailment while accelerating EV range replenishment at the lowest net cost per mile.
                </p>
              </div>
              <div className="bg-surface-container p-space-sm rounded-xl">
                <div className="flex items-center justify-between font-label-badge text-label-badge text-on-surface-variant uppercase mb-1">
                  <span>Peak Breaker Headroom</span>
                  <span className="text-cyan-bright font-mono">14.4 kW PROTECTED</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-bright h-full rounded-full" style={{ width: '82%' }}></div>
                </div>
              </div>
            </div>

            {/* Feature 4: Grid Decarbonization Baseline */}
            <div
              onClick={() => onNavigateTab('eco-impact')}
              className="bg-surface-container-low p-space-lg rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between border border-outline-variant/20 hover:border-tertiary/40 transition-all cursor-pointer group"
            >
              <div className="absolute top-0 right-0 p-space-lg opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px] text-tertiary">eco</span>
              </div>
              <div>
                <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-space-md shadow-[0_0_16px_rgba(192,193,255,0.2)]">
                  <span className="material-symbols-outlined text-[24px]">nest_eco_leaf</span>
                </div>
                <h3 className="font-headline-md text-headline-md text-text-primary mb-space-xs font-semibold group-hover:text-tertiary transition-colors">
                  Grid Decarbonization Baseline
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
                  Calculate hyper-local carbon intensity from regional wind and hydro feeds in real time. Shift carbon-intensive cycles into clean-generation windows, eliminating reliance on fossil peaker plants during high-stress hours.
                </p>
              </div>
              <div className="bg-surface-container p-space-sm rounded-xl">
                <div className="flex items-center justify-between font-label-badge text-label-badge text-on-surface-variant uppercase mb-1">
                  <span>Grid Carbon Intensity</span>
                  <span className="text-emerald-bright font-mono">84g CO2/kWh (GREEN)</span>
                </div>
                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-bright h-full rounded-full" style={{ width: '88%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Live Optimization Event Log Stream */}
        <section className="mb-space-xl bg-surface-container-low/90 backdrop-blur-xl p-space-lg rounded-2xl shadow-xl border border-outline-variant/20">
          <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
            <div>
              <h2 className="font-headline-md text-headline-md text-text-primary flex items-center gap-2 font-semibold">
                <span className="material-symbols-outlined text-secondary text-[22px]">history</span>
                Autonomous Optimization Ledger
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Real-time decisions audited by the VoltIQ edge coprocessor
              </p>
            </div>
            <span className="px-space-sm py-1 rounded-md bg-surface-container-high text-on-surface font-label-badge text-label-badge uppercase border border-outline-variant/20">
              24-Hour Cycle
            </span>
          </div>

          <div className="divide-y divide-transparent space-y-space-xs">
            {optimizationEvents.map((evt) => {
              const tagColorClass =
                evt.tagType === 'emerald'
                  ? 'text-emerald-bright font-bold'
                  : evt.tagType === 'primary'
                  ? 'text-primary font-bold'
                  : 'text-cyan-bright font-bold';

              const iconBg =
                evt.tagType === 'emerald'
                  ? 'bg-secondary/20 text-secondary'
                  : evt.tagType === 'primary'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-tertiary/20 text-tertiary';

              return (
                <div
                  key={evt.id}
                  className="p-space-sm rounded-xl bg-surface-container flex items-center justify-between gap-space-md hover:bg-surface-container-high transition-colors border border-outline-variant/10"
                >
                  <div className="flex items-center gap-space-sm">
                    <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
                      <span className="material-symbols-outlined text-[18px]">{evt.icon}</span>
                    </div>
                    <div>
                      <div className="font-body-md text-body-md text-text-primary font-medium">
                        {evt.title}
                      </div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">
                        {evt.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`font-label-numeric-md text-body-md ${tagColorClass}`}>
                      {evt.tag}
                    </span>
                    <span className="block font-label-badge text-label-badge text-on-surface-variant font-mono">
                      {evt.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 5: Technical Architecture FAQ */}
        <section className="mb-space-xl">
          <div className="text-center max-w-2xl mx-auto mb-space-lg">
            <span className="font-label-badge text-label-badge text-primary uppercase tracking-widest font-bold">
              Protocol Transparency
            </span>
            <h2 className="font-headline-lg text-headline-lg text-text-primary mt-1 font-bold">
              Frequently Asked Questions
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Engineered for absolute grid safety, battery longevity, and rapid utility compatibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {FAQ_ITEMS.map((faq, index) => (
              <div
                key={index}
                className="bg-surface-container-low p-space-lg rounded-xl shadow-md border border-outline-variant/20 hover:border-outline-variant/40 transition-all"
              >
                <div className={`w-9 h-9 rounded-lg ${faq.colorClass} flex items-center justify-center mb-space-sm`}>
                  <span className="material-symbols-outlined text-[20px]">{faq.icon}</span>
                </div>
                <h3 className="font-headline-md text-body-md text-text-primary font-bold mb-2">
                  {faq.q}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 6: High-Security Bottom CTA Conversion Anchor */}
        <section className="bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low p-space-xl rounded-2xl shadow-2xl relative overflow-hidden text-center border border-outline-variant/30">
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-primary/20 rounded-full blur-[90px] pointer-events-none"></div>
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary/20 rounded-full blur-[90px] pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <span className="font-label-badge text-label-badge text-emerald-bright uppercase tracking-widest mb-space-xs font-bold">
              Grid Autonomy Guaranteed
            </span>
            <h2 className="font-headline-lg text-headline-lg text-text-primary mb-space-sm font-bold">
              Take Command of Your Household Voltage
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
              Join over 12,000 self-sufficient homes saving millions in power expenses while defending the grid against rolling blackouts.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-space-md">
              <button
                onClick={onOpenInverterModal}
                className="px-space-xl py-3.5 rounded-xl bg-primary-container text-on-primary-container font-headline-md text-body-md font-semibold shadow-[0_0_24px_rgba(6,182,212,0.4)] hover:bg-cyan-bright transition-all cursor-pointer"
                type="button"
              >
                Connect Your Smart Inverter
              </button>
              <button
                onClick={() => onNavigateTab('household-intelligence')}
                className="px-space-lg py-3.5 rounded-xl bg-surface-container-high text-on-surface font-body-md text-body-md hover:bg-surface-bright transition-all border border-outline-variant/30 cursor-pointer"
                type="button"
              >
                Explore Documentation
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
