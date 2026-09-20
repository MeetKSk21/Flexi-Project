import { CircuitTelemetry, ApplianceRelay, OptimizationEvent, TariffDataPoint } from '../types';

export const INITIAL_CIRCUITS: CircuitTelemetry[] = [
  { id: 'c1', name: 'Heat Pump (Daikin VRV)', category: 'hvac', power: 1.8, maxCapacity: 3.5, status: 'optimized', phantomLoad: 12 },
  { id: 'c2', name: 'Kitchen & Induction Hub', category: 'kitchen', power: 0.9, maxCapacity: 4.0, status: 'normal', phantomLoad: 4 },
  { id: 'c3', name: 'Living Zone & Media Rack', category: 'living', power: 0.4, maxCapacity: 2.0, status: 'optimized', phantomLoad: 0 },
  { id: 'c4', name: 'EV Wallbox (Gen 3)', category: 'ev', power: 0.0, maxCapacity: 11.5, status: 'idle', phantomLoad: 2 },
  { id: 'c5', name: 'Water Heater Heat Pump', category: 'utility', power: 0.6, maxCapacity: 2.2, status: 'optimized', phantomLoad: 3 },
  { id: 'c6', name: 'Master Suite AC & ERV', category: 'hvac', power: 0.3, maxCapacity: 2.5, status: 'normal', phantomLoad: 8 },
  { id: 'c7', name: 'Home Lab & Networking Rack', category: 'living', power: 0.25, maxCapacity: 1.2, status: 'normal', phantomLoad: 0 },
  { id: 'c8', name: 'Sub-Chiller & Wine Vault', category: 'kitchen', power: 0.15, maxCapacity: 0.8, status: 'optimized', phantomLoad: 5 },
];

export const INITIAL_RELAYS: ApplianceRelay[] = [
  { id: 'r1', name: 'Heat Pump', category: 'HVAC', icon: 'hvac', active: true, powerKw: 1.8, mode: 'autonomous', scheduleInfo: 'Pre-cooled 69°F' },
  { id: 'r2', name: 'EV Wallbox', category: 'EV Charging', icon: 'ev_station', active: false, powerKw: 0.0, mode: 'scheduled', scheduleInfo: 'Slot: 02:00-06:00' },
  { id: 'r3', name: 'Water Heater', category: 'Thermodynamic', icon: 'water_heater', active: true, powerKw: 0.6, mode: 'autonomous', scheduleInfo: 'Solar surplus soak' },
  { id: 'r4', name: 'Induction Hub', category: 'Kitchen', icon: 'microwave', active: true, powerKw: 0.9, mode: 'manual', scheduleInfo: 'Active cooking' },
];

export const INITIAL_OPTIMIZATION_EVENTS: OptimizationEvent[] = [
  {
    id: 'e1',
    title: 'Exported 4.2 kWh to grid at peak premium ($0.46/kWh)',
    description: 'High-demand grid dispatch event triggered by ERCOT regional spike',
    timestamp: '14:22:04',
    tag: '+$1.93 Saved',
    tagType: 'emerald',
    icon: 'sell',
    valueSaved: '+$1.93',
  },
  {
    id: 'e2',
    title: 'Rescheduled Miele Dishwasher sanitization cycle to 13:15',
    description: 'Matched peak solar generation roof surplus (5.8 kW production ceiling)',
    timestamp: '13:15:00',
    tag: '100% Solar',
    tagType: 'primary',
    icon: 'schedule',
    valueSaved: '100% Green',
  },
  {
    id: 'e3',
    title: 'Pre-cooled master thermal envelope to 69°F before tariff spike',
    description: 'Heat pump curtailed at 16:00 to avoid high tier $0.38/kWh utility window',
    timestamp: '15:45:12',
    tag: 'Peak Curtailed',
    tagType: 'cyan',
    icon: 'ac_unit',
    valueSaved: '-$0.84',
  },
  {
    id: 'e4',
    title: 'Absorbed 11.2 kWh negative pricing wholesale power into EV',
    description: 'Utility credit awarded to vehicle battery storage buffer ($ -0.04/kWh)',
    timestamp: '03:10:00',
    tag: 'Negative Cashout',
    tagType: 'emerald',
    icon: 'electric_car',
    valueSaved: '+$0.45',
  },
  {
    id: 'e5',
    title: 'Detected 45W parasitic standby draw in A/V amplifier rack',
    description: 'Engaged zero-leak smart circuit isolation relay automatically',
    timestamp: '01:05:30',
    tag: 'Leak Isolated',
    tagType: 'cyan',
    icon: 'radar',
    valueSaved: '0.00 W Leak',
  },
];

export const INITIAL_TARIFF_SCHEDULE: TariffDataPoint[] = [
  { time: '00:00', rate: 0.09, type: 'off-peak' },
  { time: '02:00', rate: 0.06, type: 'off-peak' },
  { time: '04:00', rate: -0.02, type: 'negative' },
  { time: '06:00', rate: 0.12, type: 'standard' },
  { time: '08:00', rate: 0.18, type: 'standard' },
  { time: '10:00', rate: 0.14, type: 'standard' },
  { time: '12:00', rate: 0.08, type: 'off-peak' },
  { time: '14:00', rate: 0.44, type: 'spike', isCurrent: true },
  { time: '16:00', rate: 0.48, type: 'spike' },
  { time: '18:00', rate: 0.38, type: 'peak' },
  { time: '20:00', rate: 0.24, type: 'standard' },
  { time: '22:00', rate: 0.11, type: 'off-peak' },
];

export const FAQ_ITEMS = [
  {
    q: 'How does VoltIQ preserve battery health during frequent arbitrage cycles?',
    a: 'VoltIQ leverages dynamic C-rate modulation and state-of-charge (SoC) micro-buffers. By preventing prolonged exposure to 100% saturation and excessive heat thresholds, cell degradation is reduced by up to 34% compared to dumb factory timers.',
    icon: 'verified_user',
    colorClass: 'text-primary bg-primary/20',
  },
  {
    q: 'What happens during volatile wholesale negative pricing?',
    a: 'When wholesale tariffs plunge into negative dollar amounts (where utilities pay consumers to absorb surplus power), VoltIQ automatically throttles solar export and dumps max load into EV batteries and thermal reservoirs, maximizing cash payouts.',
    icon: 'smart_toy',
    colorClass: 'text-secondary bg-secondary/20',
  },
  {
    q: 'Does this require physical electrician installation?',
    a: 'VoltIQ works via non-invasive split-core CT current clamps inside your panel or directly over local REST/Matter APIs with Tesla Gateway, Enphase Envoy, SolarEdge, GivEnergy, and smart cloud meters like Sense or Emporia.',
    icon: 'sensors',
    colorClass: 'text-tertiary bg-tertiary/20',
  },
];
