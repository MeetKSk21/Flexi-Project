import React, { useState } from 'react';

interface TariffSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TariffSimulatorModal: React.FC<TariffSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [offPeakCost, setOffPeakCost] = useState<number>(0.08);
  const [peakSpikePrice, setPeakSpikePrice] = useState<number>(0.46);
  const [dailyDischargeKwh, setDailyDischargeKwh] = useState<number>(10);
  const [negativeHoursPerMonth, setNegativeHoursPerMonth] = useState<number>(12);

  if (!isOpen) return null;

  const dailySpread = peakSpikePrice - offPeakCost;
  const monthlyArbitrage = dailyDischargeKwh * dailySpread * 30;
  const negativePricingCashback = negativeHoursPerMonth * 7.5 * 0.05;
  const totalNetMonthlySavings = monthlyArbitrage + negativePricingCashback;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas-base/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-surface-container-low border border-border-cyan-glow w-full max-w-xl rounded-2xl p-space-lg shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-space-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[24px]">insights</span>
            <h2 className="font-headline-md text-headline-md text-text-primary font-bold">
              Dynamic Tariff Simulator
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
          Simulate how volatile wholesale electricity rates (e.g. Octopus Agile, Amber, ERCOT, CAISO) convert into direct cash yield through automated battery charging and export.
        </p>

        {/* Inputs */}
        <div className="space-y-4 mb-space-lg">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-on-surface-variant uppercase">Night Off-Peak Charge Rate</span>
              <span className="text-cyan-bright font-bold">${offPeakCost.toFixed(2)}/kWh</span>
            </div>
            <input
              type="range"
              min={0.02}
              max={0.20}
              step={0.01}
              value={offPeakCost}
              onChange={(e) => setOffPeakCost(Number(e.target.value))}
              className="w-full accent-cyan-bright cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-on-surface-variant uppercase">Peak Spike Export Rate</span>
              <span className="text-emerald-bright font-bold">${peakSpikePrice.toFixed(2)}/kWh</span>
            </div>
            <input
              type="range"
              min={0.25}
              max={1.50}
              step={0.02}
              value={peakSpikePrice}
              onChange={(e) => setPeakSpikePrice(Number(e.target.value))}
              className="w-full accent-emerald-bright cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-on-surface-variant uppercase">Daily Battery Dispatch Volume</span>
              <span className="text-text-primary font-bold">{dailyDischargeKwh} kWh/day</span>
            </div>
            <input
              type="range"
              min={4}
              max={28}
              step={1}
              value={dailyDischargeKwh}
              onChange={(e) => setDailyDischargeKwh(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-on-surface-variant uppercase">Negative Pricing Windows / Month</span>
              <span className="text-secondary font-bold">{negativeHoursPerMonth} Hours</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              step={2}
              value={negativeHoursPerMonth}
              onChange={(e) => setNegativeHoursPerMonth(Number(e.target.value))}
              className="w-full accent-secondary cursor-pointer"
            />
          </div>
        </div>

        {/* Calculated Results Banner */}
        <div className="p-4 rounded-xl bg-surface-container border border-border-cyan-glow mb-space-md">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-on-surface-variant block uppercase">Simulated Net Monthly Yield</span>
              <span className="font-label-numeric-lg text-[28px] text-emerald-bright font-bold">
                +${totalNetMonthlySavings.toFixed(2)}
                <span className="text-xs text-on-surface-variant font-normal"> / month</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-on-surface-variant block uppercase">Annual Net Return</span>
              <span className="font-label-numeric-md text-body-lg text-text-primary font-bold">
                +${(totalNetMonthlySavings * 12).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-headline-md text-sm font-semibold hover:bg-cyan-bright transition-all cursor-pointer"
          >
            Apply Simulation Model
          </button>
        </div>
      </div>
    </div>
  );
};
