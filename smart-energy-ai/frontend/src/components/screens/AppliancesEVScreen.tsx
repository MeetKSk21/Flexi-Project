import React, { useState } from 'react';
import { ApplianceRelay, TelemetryState } from '../../types';

interface AppliancesEVProps {
  relays: ApplianceRelay[];
  telemetry: TelemetryState;
  onToggleRelay: (id: string) => void;
}

export const AppliancesEVScreen: React.FC<AppliancesEVProps> = ({
  relays,
  telemetry,
  onToggleRelay,
}) => {
  const [chargingMode, setChargingMode] = useState<'surplus' | 'scheduled' | 'boost'>('scheduled');
  const [targetSoc, setTargetSoc] = useState<number>(80);
  const [chargeLimitAmps, setChargeLimitAmps] = useState<number>(32);

  return (
    <div className="flex flex-col w-full pb-space-xl pt-space-md">
      {/* Header Banner */}
      <div className="mb-space-lg">
        <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-high border border-border-cyan-glow mb-2">
          <span className="material-symbols-outlined text-primary text-[16px]">electric_bolt</span>
          <span className="font-label-badge text-label-badge text-primary uppercase tracking-wider font-bold">
            Dynamic Load Shifting &amp; Breaker Protection
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-text-primary font-bold tracking-tight">
          Appliances &amp; EV Orchestration
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
          Synchronize heavy residential loads with localized rooftop generation and wholesale tariffs while guaranteeing main breaker headroom through millisecond micro-curtailment.
        </p>
      </div>

      {/* EV Wallbox Hero Banner */}
      <div className="bg-gradient-to-r from-surface-container-low via-surface-container to-surface-container-low rounded-2xl p-space-lg border border-outline-variant/30 shadow-2xl mb-space-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-tertiary/10 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-lg">
          {/* Vehicle Info */}
          <div className="flex items-center gap-space-md">
            <div className="w-16 h-16 rounded-2xl bg-tertiary-container/20 border border-tertiary/30 flex items-center justify-center text-tertiary shadow-lg">
              <span className="material-symbols-outlined text-[36px]">electric_car</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-md text-headline-md text-text-primary font-bold">
                  Tesla Model Y Long Range
                </span>
                <span className="px-2 py-0.5 rounded-full bg-secondary-container/30 text-secondary text-xs font-mono font-bold uppercase">
                  Connected
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Wall Connector Gen 3 • 240V Split-Phase • Connected to Port 1
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6">
            <div>
              <span className="font-label-badge text-label-badge text-on-surface-variant uppercase block">Current Battery</span>
              <span className="font-label-numeric-lg text-label-numeric-lg text-text-primary font-bold">
                {telemetry.evSoc.toFixed(0)}%
              </span>
            </div>
            <div className="h-10 w-px bg-outline-variant/30"></div>
            <div>
              <span className="font-label-badge text-label-badge text-on-surface-variant uppercase block">Target Limit</span>
              <span className="font-label-numeric-lg text-label-numeric-lg text-cyan-bright font-bold">
                {targetSoc}%
              </span>
            </div>
            <div className="h-10 w-px bg-outline-variant/30"></div>
            <div>
              <span className="font-label-badge text-label-badge text-on-surface-variant uppercase block">Next Slot</span>
              <span className="font-label-numeric-md text-body-md text-emerald-bright font-bold">
                02:00 - 06:00
              </span>
            </div>
          </div>
        </div>

        {/* Interactive EV Controller Controls */}
        <div className="mt-space-lg pt-space-md border-t border-outline-variant/20 grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {/* Charging Mode Selector */}
          <div className="bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/20">
            <span className="font-label-badge text-label-badge text-on-surface-variant uppercase block mb-2">
              Optimization Strategy
            </span>
            <div className="grid grid-cols-3 gap-1 bg-surface-container-highest p-1 rounded-lg">
              <button
                onClick={() => setChargingMode('surplus')}
                className={`py-1.5 text-xs font-mono uppercase rounded transition-colors cursor-pointer ${
                  chargingMode === 'surplus'
                    ? 'bg-secondary-container text-text-primary font-bold'
                    : 'text-on-surface-variant hover:text-text-primary'
                }`}
              >
                Solar Only
              </button>
              <button
                onClick={() => setChargingMode('scheduled')}
                className={`py-1.5 text-xs font-mono uppercase rounded transition-colors cursor-pointer ${
                  chargingMode === 'scheduled'
                    ? 'bg-primary-container text-on-primary-container font-bold'
                    : 'text-on-surface-variant hover:text-text-primary'
                }`}
              >
                Off-Peak
              </button>
              <button
                onClick={() => setChargingMode('boost')}
                className={`py-1.5 text-xs font-mono uppercase rounded transition-colors cursor-pointer ${
                  chargingMode === 'boost'
                    ? 'bg-tertiary-container text-on-tertiary font-bold'
                    : 'text-on-surface-variant hover:text-text-primary'
                }`}
              >
                Boost Now
              </button>
            </div>
          </div>

          {/* SoC Slider */}
          <div className="bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/20">
            <div className="flex justify-between items-center mb-1">
              <span className="font-label-badge text-label-badge text-on-surface-variant uppercase">
                Charge Limit (Daily SoC)
              </span>
              <span className="font-mono text-cyan-bright font-bold text-sm">{targetSoc}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              value={targetSoc}
              onChange={(e) => setTargetSoc(Number(e.target.value))}
              className="w-full accent-cyan-bright cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-outline mt-1 font-mono">
              <span>50% (Long life)</span>
              <span>80% (Daily rec.)</span>
              <span>100% (Trip)</span>
            </div>
          </div>

          {/* Breaker Micro-Curtailment Limit */}
          <div className="bg-surface-container-low p-space-sm rounded-xl border border-outline-variant/20">
            <div className="flex justify-between items-center mb-1">
              <span className="font-label-badge text-label-badge text-on-surface-variant uppercase">
                Max Wallbox Current
              </span>
              <span className="font-mono text-emerald-bright font-bold text-sm">{chargeLimitAmps} Amps (7.7 kW)</span>
            </div>
            <input
              type="range"
              min={12}
              max={48}
              value={chargeLimitAmps}
              onChange={(e) => setChargeLimitAmps(Number(e.target.value))}
              className="w-full accent-emerald-bright cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-outline mt-1 font-mono">
              <span>12A (Safe)</span>
              <span>32A (Balanced)</span>
              <span>48A (Fast 11.5kW)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breaker Headroom & Smart Relays */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left: Breaker Headroom Visualizer */}
        <div className="lg:col-span-5 bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-headline-md text-headline-md text-text-primary font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-bright text-[22px]">speed</span>
                Main Breaker Headroom
              </h2>
              <span className="font-label-badge text-label-badge text-emerald-bright uppercase font-mono">
                14.4 kW PROTECTED
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Instant micro-curtailment throttles EV charging or heat pump in &lt;16ms if kitchen cooktops or clothes dryers create an aggregate surge near panel limits.
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between font-body-sm text-body-sm mb-1">
                  <span className="text-on-surface">Household Current Load</span>
                  <span className="font-mono font-bold text-text-primary">{telemetry.householdLoad.toFixed(1)} kW / 24.0 kW Capacity</span>
                </div>
                <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-bright via-cyan-bright to-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${(telemetry.householdLoad / 24.0) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-surface-container">
                <div>
                  <span className="text-xs text-outline block font-mono uppercase">Trip Risk</span>
                  <span className="font-headline-md text-body-md text-emerald-bright font-bold">0.0% (Guaranteed)</span>
                </div>
                <div>
                  <span className="text-xs text-outline block font-mono uppercase">Curtailment Slew</span>
                  <span className="font-headline-md text-body-md text-text-primary font-bold">16 ms Edge Coprocessor</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/10 text-xs text-on-surface-variant leading-relaxed">
            Meets NFPA 70 / NEC 705.13 Energy Management System (EMS) standards for continuous branch overload protection.
          </div>
        </div>

        {/* Right: Appliance Relays & Schedules */}
        <div className="lg:col-span-7 bg-surface-container-low p-space-lg rounded-xl border border-outline-variant/20 shadow-xl">
          <div className="flex items-center justify-between mb-space-md">
            <div>
              <h2 className="font-headline-md text-headline-md text-text-primary font-semibold">
                Autonomous Appliance Relays
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Smart relays wired to dry contacts or local Matter / Zigbee bridge
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-xs font-mono text-primary font-bold">
              4 Relays Active
            </span>
          </div>

          <div className="space-y-space-sm">
            {relays.map((relay) => (
              <div
                key={relay.id}
                className="p-space-md rounded-xl bg-surface-container flex items-center justify-between gap-space-md border border-outline-variant/10 hover:border-outline-variant/30 transition-all"
              >
                <div className="flex items-center gap-space-md">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    relay.active ? 'bg-primary-container/20 text-primary' : 'bg-surface-container-highest text-outline'
                  }`}>
                    <span className="material-symbols-outlined text-[22px]">{relay.icon}</span>
                  </div>
                  <div>
                    <div className="font-headline-md text-body-md font-bold text-text-primary flex items-center gap-2">
                      {relay.name}
                      <span className="text-xs font-mono font-normal text-outline">({relay.category})</span>
                    </div>
                    <div className="font-body-sm text-xs text-on-surface-variant">
                      Rule: <span className="text-cyan-bright font-mono">{relay.scheduleInfo}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono font-bold text-text-primary text-sm block">
                      {relay.active ? `${relay.powerKw.toFixed(1)} kW` : '0.0 kW'}
                    </span>
                    <span className={`text-[11px] font-mono uppercase ${relay.active ? 'text-secondary font-bold' : 'text-outline'}`}>
                      {relay.active ? 'Running' : 'Standby'}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleRelay(relay.id)}
                    className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                      relay.active ? 'bg-secondary-container' : 'bg-surface-container-highest'
                    }`}
                    type="button"
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full shadow-md transform transition-transform ${
                        relay.active ? 'right-0.5 bg-text-primary' : 'left-0.5 bg-outline'
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
