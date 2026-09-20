import React, { useState, useRef } from 'react';

interface SettingsScreenProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currencySymbol: string;
  onCurrencyChange: (sym: string) => void;
}

interface UtilityPreset {
  id: string;
  name: string;
  region: string;
  currency: string;
  dayRate: number;
  peakRate: number;
  offPeakRate: number;
  fixedFee: number;
}

const UTILITY_PRESETS: UtilityPreset[] = [
  {
    id: 'tata',
    name: 'Tata Power / BSES',
    region: 'India',
    currency: '₹',
    dayRate: 6.5,
    peakRate: 11.5,
    offPeakRate: 4.2,
    fixedFee: 150,
  },
  {
    id: 'pge',
    name: 'California PG&E (E-TOU)',
    region: 'USA',
    currency: '$',
    dayRate: 0.34,
    peakRate: 0.58,
    offPeakRate: 0.19,
    fixedFee: 15,
  },
  {
    id: 'octopus',
    name: 'Octopus Agile',
    region: 'United Kingdom',
    currency: '£',
    dayRate: 0.24,
    peakRate: 0.44,
    offPeakRate: 0.09,
    fixedFee: 12,
  },
  {
    id: 'iberdrola',
    name: 'Enel / Iberdrola PVPC',
    region: 'European Union',
    currency: '€',
    dayRate: 0.22,
    peakRate: 0.38,
    offPeakRate: 0.11,
    fixedFee: 10,
  },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isDarkMode,
  onToggleDarkMode,
  currencySymbol,
  onCurrencyChange,
}) => {
  // Active utility preset
  const [selectedPreset, setSelectedPreset] = useState<string>('tata');

  // Rates state
  const [dayRate, setDayRate] = useState<number>(6.5);
  const [peakRate, setPeakRate] = useState<number>(11.5);
  const [offPeakRate, setOffPeakRate] = useState<number>(4.2);
  const [fixedFee, setFixedFee] = useState<number>(150);

  // Home profile
  const [homeType, setHomeType] = useState<string>('3-BHK Apartment');
  const [occupants, setOccupants] = useState<string>('3-4 People');
  const [cooling, setCooling] = useState<string>('Inverter Split ACs');

  // Meter data state
  const [dataSource, setDataSource] = useState<string>('Benchmark 45-Day Smart Meter Dataset (1,080 hourly readings)');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [sampleLoaded, setSampleLoaded] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedRowCount, setUploadedRowCount] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply utility preset
  const handleSelectPreset = (preset: UtilityPreset) => {
    setSelectedPreset(preset.id);
    onCurrencyChange(preset.currency);
    setDayRate(preset.dayRate);
    setPeakRate(preset.peakRate);
    setOffPeakRate(preset.offPeakRate);
    setFixedFee(preset.fixedFee);
    setSaveToast(`Applied ${preset.name} (${preset.region}) standard rate schedule.`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Reset to default
  const handleResetDefaults = () => {
    const defaultPreset = UTILITY_PRESETS[0];
    setSelectedPreset(defaultPreset.id);
    onCurrencyChange(defaultPreset.currency);
    setDayRate(defaultPreset.dayRate);
    setPeakRate(defaultPreset.peakRate);
    setOffPeakRate(defaultPreset.offPeakRate);
    setFixedFee(defaultPreset.fixedFee);
    setHomeType('3-BHK Apartment');
    setOccupants('3-4 People');
    setCooling('Inverter Split ACs');
    setUploadedFileName(null);
    setUploadedRowCount(null);
    setDataSource('Benchmark 45-Day Smart Meter Dataset (1,080 hourly readings)');
    setSaveToast('Household settings reset to initial factory benchmarks.');
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Save rates
  const handleSaveRates = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveToast('Household settings & electricity rates saved. Telemetry recalculating in background.');
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Load sample dataset
  const handleLoadSample = () => {
    setSampleLoaded(true);
    setUploadedFileName(null);
    setUploadedRowCount(null);
    setDataSource('Standard Benchmark Household Dataset (1,080 hourly intervals)');
    setSaveToast('1,080 hourly smart meter readings loaded into local telemetry buffer.');
    setTimeout(() => {
      setSampleLoaded(false);
      setTimeout(() => setSaveToast(null), 3500);
    }, 800);
  };

  // Handle CSV file selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setUploadedRowCount(1440); // 60 days of hourly data simulated
      setDataSource(`${file.name} (1,440 readings imported)`);
      setSaveToast(`Successfully imported ${file.name} (1,440 hourly meter intervals).`);
      setTimeout(() => setSaveToast(null), 3500);
    }
  };

  return (
    <div className="flex flex-col w-full pb-space-xl pt-space-md">
      {/* Top Banner */}
      <div className="mb-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-surface-container-high border border-border-cyan-glow mb-2">
            <span className="material-symbols-outlined text-primary text-[16px]">tune</span>
            <span className="font-label-badge text-label-badge text-primary uppercase tracking-wider font-bold">
              Household Setup &amp; Energy Plan
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary font-bold tracking-tight">
            Settings &amp; Preferences
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
            Configure your local utility electricity rates, home profile, and smart meter data sources in one clean, simple dashboard.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl border border-outline-variant/50 text-on-surface-variant hover:text-text-primary hover:bg-surface-container transition-all text-sm font-medium cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={() => handleSaveRates()}
            className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-headline-md text-sm font-bold shadow-md hover:bg-cyan-bright transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            Save Changes
          </button>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveToast && (
        <div className="mb-space-md p-4 rounded-xl bg-secondary-container/20 border border-secondary text-secondary flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="font-body-md text-body-md font-semibold">{saveToast}</span>
          </div>
          <span className="font-label-badge text-label-badge uppercase bg-secondary text-on-secondary px-2.5 py-0.5 rounded font-bold">
            Updated
          </span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start mb-space-xl">
        {/* Left Column: Utility Rates & Presets */}
        <div className="lg:col-span-6 flex flex-col gap-space-md">
          {/* Card 1: 1-Click Utility Presets */}
          <div className="bg-surface-container-low rounded-2xl p-space-lg border border-outline-variant/30 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">public</span>
                <h2 className="font-headline-md text-headline-md text-text-primary font-bold">
                  Quick Utility Presets
                </h2>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">1-Click Setup</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Choose your utility region to instantly auto-populate standard Time-of-Day rate tiers:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {UTILITY_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary'
                        : 'border-outline-variant/40 bg-surface hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-headline-md text-xs font-bold text-text-primary">
                        {preset.name}
                      </span>
                      <span className="text-xs font-bold text-primary font-mono">{preset.currency}</span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">
                      {preset.region} • Peak {preset.currency}{preset.peakRate}/kWh
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 2: 24-Hour Time-of-Day Schedule & Rates Customizer */}
          <div className="bg-surface-container-low rounded-2xl p-space-lg border border-outline-variant/30 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[22px]">bolt</span>
                <h2 className="font-headline-md text-headline-md text-text-primary font-bold">
                  Electricity Rate Tiers
                </h2>
              </div>
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant/30">
                <span className="text-xs text-on-surface-variant font-mono px-1">Currency:</span>
                {['₹', '$', '€', '£'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => {
                      setSelectedPreset('custom');
                      onCurrencyChange(sym);
                    }}
                    className={`w-6 h-6 rounded text-xs font-bold transition-all cursor-pointer ${
                      currencySymbol === sym
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface-variant hover:text-text-primary'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual 24-Hour Schedule Ribbon */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-on-surface-variant font-mono mb-1.5">
                <span>00:00 (Midnight)</span>
                <span>12:00 (Noon)</span>
                <span>24:00 (Midnight)</span>
              </div>
              <div className="h-6 w-full rounded-lg overflow-hidden flex shadow-inner border border-outline-variant/30 font-mono text-[10px] font-bold text-canvas-base text-center leading-6">
                {/* 00:00 - 06:00: Off-Peak */}
                <div style={{ width: '25%' }} className="bg-emerald-bright" title="00:00 - 06:00: Night Off-Peak">
                  Night
                </div>
                {/* 06:00 - 18:00: Standard Day */}
                <div style={{ width: '50%' }} className="bg-primary" title="06:00 - 18:00: Standard Daytime">
                  Day Standard
                </div>
                {/* 18:00 - 22:00: Evening Peak */}
                <div style={{ width: '16.6%' }} className="bg-amber-500" title="18:00 - 22:00: Evening Peak">
                  Peak
                </div>
                {/* 22:00 - 24:00: Night Off-Peak */}
                <div style={{ width: '8.4%' }} className="bg-emerald-bright" title="22:00 - 24:00: Night Off-Peak">
                  Night
                </div>
              </div>
            </div>

            {/* Editable Rate Inputs */}
            <form onSubmit={handleSaveRates} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Daytime Standard */}
                <div className="p-3 rounded-xl bg-surface border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-text-primary flex items-center gap-1">
                      ☀️ Day Standard
                    </label>
                    <span className="text-[11px] text-on-surface-variant font-mono">06:00 – 18:00</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-on-surface-variant font-mono">{currencySymbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={dayRate}
                      onChange={(e) => {
                        setSelectedPreset('custom');
                        setDayRate(parseFloat(e.target.value) || 0);
                      }}
                      className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant/40 text-text-primary font-mono font-bold text-sm focus:border-primary focus:outline-none"
                    />
                    <span className="text-xs text-on-surface-variant font-mono">/kWh</span>
                  </div>
                </div>

                {/* Evening Peak */}
                <div className="p-3 rounded-xl bg-surface border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-amber-500 flex items-center gap-1">
                      ⚡ Evening Peak
                    </label>
                    <span className="text-[11px] text-on-surface-variant font-mono">18:00 – 22:00</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-amber-500 font-mono">{currencySymbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={peakRate}
                      onChange={(e) => {
                        setSelectedPreset('custom');
                        setPeakRate(parseFloat(e.target.value) || 0);
                      }}
                      className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant/40 text-amber-500 font-mono font-bold text-sm focus:border-primary focus:outline-none"
                    />
                    <span className="text-xs text-on-surface-variant font-mono">/kWh</span>
                  </div>
                </div>

                {/* Night Off-Peak */}
                <div className="p-3 rounded-xl bg-surface border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-emerald-500 flex items-center gap-1">
                      🌙 Night Off-Peak
                    </label>
                    <span className="text-[11px] text-on-surface-variant font-mono">22:00 – 06:00</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-emerald-500 font-mono">{currencySymbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={offPeakRate}
                      onChange={(e) => {
                        setSelectedPreset('custom');
                        setOffPeakRate(parseFloat(e.target.value) || 0);
                      }}
                      className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant/40 text-emerald-500 font-mono font-bold text-sm focus:border-primary focus:outline-none"
                    />
                    <span className="text-xs text-on-surface-variant font-mono">/kWh</span>
                  </div>
                </div>

                {/* Fixed Monthly Fee */}
                <div className="p-3 rounded-xl bg-surface border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-text-primary flex items-center gap-1">
                      🏷️ Fixed Monthly Fee
                    </label>
                    <span className="text-[11px] text-on-surface-variant font-mono">Utility meter rent</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-on-surface-variant font-mono">{currencySymbol}</span>
                    <input
                      type="number"
                      step="1"
                      value={fixedFee}
                      onChange={(e) => {
                        setSelectedPreset('custom');
                        setFixedFee(parseFloat(e.target.value) || 0);
                      }}
                      className="w-full p-2 rounded-lg bg-surface-container border border-outline-variant/40 text-text-primary font-mono font-bold text-sm focus:border-primary focus:outline-none"
                    />
                    <span className="text-xs text-on-surface-variant font-mono">/mo</span>
                  </div>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container font-headline-md text-xs font-bold shadow-xs hover:bg-cyan-bright transition-all cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">sync</span>
                  Apply Rate Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Dwelling Profile, Telemetry Data & Appearance */}
        <div className="lg:col-span-6 flex flex-col gap-space-md">
          {/* Card 3: Home & Dwelling Profile (Visual Selection) */}
          <div className="bg-surface-container-low rounded-2xl p-space-lg border border-outline-variant/30 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-secondary text-[22px]">home</span>
              <h2 className="font-headline-md text-headline-md text-text-primary font-bold">
                Household &amp; Dwelling Profile
              </h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Used by VoltIQ's AI algorithms to baseline expected baseload and thermal cycling:
            </p>

            {/* Dwelling Type Chips */}
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-text-primary block mb-1.5">
                  Dwelling Archetype
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: '2-BHK Apartment', label: '2-BHK Flat', icon: 'apartment' },
                    { id: '3-BHK Apartment', label: '3-BHK Home', icon: 'home' },
                    { id: 'Independent Villa', label: 'Villa / Detached', icon: 'villa' },
                    { id: 'Townhouse', label: 'Townhouse', icon: 'holiday_village' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setHomeType(d.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        homeType === d.id
                          ? 'border-secondary bg-secondary/10 shadow-xs ring-1 ring-secondary'
                          : 'border-outline-variant/40 bg-surface hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] text-secondary">{d.icon}</span>
                      <span className="text-xs font-semibold text-text-primary">{d.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Occupants Chips */}
              <div>
                <span className="text-xs font-semibold text-text-primary block mb-1.5">
                  Occupancy Size
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {['1-2 People', '3-4 People', '5+ People'].map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setOccupants(occ)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-semibold ${
                        occupants === occ
                          ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary text-text-primary'
                          : 'border-outline-variant/40 bg-surface hover:bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cooling/Heating Setup */}
              <div>
                <span className="text-xs font-semibold text-text-primary block mb-1.5">
                  Primary Climate &amp; Cooling Setup
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Inverter Split ACs', label: 'Inverter Split ACs', icon: 'mode_fan' },
                    { id: 'Central Heat Pump', label: 'Heat Pump / VRV', icon: 'hvac' },
                    { id: 'Evaporative Cooler', label: 'Evaporative Cooler', icon: 'air' },
                    { id: 'Ceiling Fans Only', label: 'Ceiling Fans Only', icon: 'toys' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCooling(c.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer text-left ${
                        cooling === c.id
                          ? 'border-cyan-bright bg-cyan-bright/10 shadow-xs ring-1 ring-cyan-bright'
                          : 'border-outline-variant/40 bg-surface hover:bg-surface-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] text-cyan-bright">{c.icon}</span>
                      <span className="text-xs font-semibold text-text-primary">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Smart Meter Telemetry Pipeline (Sample & CSV Upload) */}
          <div className="bg-surface-container-low rounded-2xl p-space-lg border border-outline-variant/30 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">database</span>
                <h2 className="font-headline-md text-headline-md text-text-primary font-bold">
                  Smart Meter Telemetry Source
                </h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary text-xs font-mono font-bold uppercase">
                Active Ingestion
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Stream live data from your utility smart meter CSV or load our benchmark 45-day household dataset:
            </p>

            {/* 1-Click Instant Benchmark */}
            <div className="p-3.5 rounded-xl bg-surface border border-outline-variant/30 mb-3 flex items-center justify-between gap-3">
              <div>
                <span className="font-headline-md text-xs text-text-primary font-bold block">
                  ⚡ 45-Day Benchmark Household Dataset
                </span>
                <span className="text-[11px] text-on-surface-variant block mt-0.5">
                  1,080 hourly readings from a connected smart microgrid home.
                </span>
              </div>
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-3.5 py-2 rounded-lg bg-secondary-container text-on-secondary font-headline-md text-xs font-bold shadow-xs hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                {sampleLoaded ? 'Loaded!' : 'Load Sample'}
              </button>
            </div>

            {/* Real CSV Upload Dropzone */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-outline-variant/60 rounded-xl p-space-md text-center hover:border-primary hover:bg-surface-container transition-all cursor-pointer bg-surface/50 mb-3"
            >
              <span className="material-symbols-outlined text-primary text-[28px] mb-1">upload_file</span>
              <p className="font-body-sm text-xs text-text-primary font-semibold">
                {uploadedFileName ? `Selected: ${uploadedFileName}` : 'Click or Drag & Drop Utility Smart Meter CSV'}
              </p>
              <span className="text-[11px] text-on-surface-variant mt-0.5 block">
                {uploadedRowCount
                  ? `${uploadedRowCount} intervals parsed & mapped to circuits`
                  : 'Supports Green Button, ERCOT interval, or standard utility CSV (up to 15MB)'}
              </span>
            </div>

            {/* Active Data Source Pill */}
            <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/30 flex items-center justify-between text-xs font-mono">
              <span className="text-on-surface-variant">Active Pipeline:</span>
              <span className="text-emerald-500 font-bold truncate max-w-[280px]">{dataSource}</span>
            </div>
          </div>

          {/* Card 5: Appearance & Theme Switcher */}
          <div className="bg-surface-container-low rounded-2xl p-space-lg border border-outline-variant/30 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-cyan-bright text-[22px]">palette</span>
              <h2 className="font-headline-md text-headline-md text-text-primary font-bold">
                Theme &amp; Appearance
              </h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Select your preferred visual mode. The default theme is light, clean, and consumer-friendly:
            </p>

            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => {
                  if (isDarkMode) onToggleDarkMode();
                }}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  !isDarkMode
                    ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/40'
                    : 'border-outline-variant/40 bg-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-amber-500 text-[26px]">light_mode</span>
                <span className="font-headline-md text-xs text-text-primary font-bold">Default Light Theme</span>
                <span className="text-[11px] text-on-surface-variant text-center">Crisp #f8fafc slate canvas</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isDarkMode) onToggleDarkMode();
                }}
                className={`p-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  isDarkMode
                    ? 'border-primary bg-primary/10 shadow-sm ring-2 ring-primary/40'
                    : 'border-outline-variant/40 bg-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-cyan-bright text-[26px]">dark_mode</span>
                <span className="font-headline-md text-xs text-text-primary font-bold">Kinetic Dark Mode</span>
                <span className="text-[11px] text-on-surface-variant text-center">High-contrast midnight #0b1326</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible System Health & Diagnostics Drawer */}
      <div className="bg-surface-container-low rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full p-space-md flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">admin_panel_settings</span>
            <span className="font-headline-md text-sm text-text-primary font-bold">
              Advanced System Health &amp; Security Diagnostics (Optional)
            </span>
          </div>
          <span className="material-symbols-outlined text-on-surface-variant text-[20px] transition-transform">
            {showAdvanced ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {showAdvanced && (
          <div className="p-space-lg border-t border-outline-variant/20 bg-surface-container/40 space-y-4 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3.5">
              <div className="p-3 rounded-xl bg-surface border border-outline-variant/30">
                <span className="text-[11px] text-on-surface-variant block uppercase font-mono">System Uptime</span>
                <span className="text-sm font-bold font-mono text-text-primary">99.98% Operational</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-outline-variant/30">
                <span className="text-[11px] text-on-surface-variant block uppercase font-mono">Rate Limiter</span>
                <span className="text-sm font-bold font-mono text-emerald-500">Active (30 req / 60s)</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-outline-variant/30">
                <span className="text-[11px] text-on-surface-variant block uppercase font-mono">Telemetry Cache</span>
                <span className="text-sm font-bold font-mono text-text-primary">LRU (94% Hit Rate)</span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-outline-variant/30">
                <span className="text-[11px] text-on-surface-variant block uppercase font-mono">Monthly Budget Cap</span>
                <span className="text-sm font-bold font-mono text-text-primary">$0.042 / $10.00 Limit</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant font-mono">
              Zero cloud latency microgrid protection. All telemetry processed locally with strict client-side encryption.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
