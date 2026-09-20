export type NavigationTab = 
  | 'live-grid'
  | 'ai-agents'
  | 'household-intelligence'
  | 'appliances-ev'
  | 'tariffs-arbitrage'
  | 'battery-storage'
  | 'eco-impact'
  | 'settings';

export interface AgentStatus {
  id: string;
  name: string;
  role: string;
  status: string;
  algorithm: string;
  confidence: number;
  icon: string;
  badge: string;
  lastAction: string;
}

export interface AnomalyItem {
  id?: string;
  timestamp: string;
  measured_kwh: number;
  expected_mean_kwh: number;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'LOW' | string;
  explanation: string;
  simulated?: boolean;
}

export interface ForecastPoint {
  hour: string;
  forecastKw: number;
  solarKw: number;
  isPeakWindow: boolean;
  tariffRate: number;
}

export interface ApplianceOptimization {
  appliance_name: string;
  rated_power_kw: number;
  typical_hours_per_day: number;
  monthly_kwh: number;
  current_monthly_cost: number;
  optimized_monthly_cost?: number;
  monthly_savings_cost: number;
  recommended_schedule: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export type MicrogridMode = 'sentinel' | 'independence' | 'storm';

export interface TelemetryState {
  householdLoad: number; // kW
  solarGeneration: number; // kW
  powerwallSoc: number; // %
  powerwallFlow: number; // kW (+ exporting, - charging)
  evSoc: number; // %
  evStatus: string;
  gridFlow: number; // kW (+ importing, - exporting)
  selfSufficiency: number; // %
  netMonthlyBill: number; // $
  arbitrageYield: number; // $
  vampireDrain: number; // W
  carbonIntensity: number; // g CO2/kWh
  efficiencyScore: number; // %
  batteryHealth: number; // %
  batteryTemp: number; // °C
}

export interface CircuitTelemetry {
  id: string;
  name: string;
  category: 'hvac' | 'kitchen' | 'living' | 'ev' | 'utility';
  power: number; // kW
  maxCapacity: number; // kW
  status: 'normal' | 'optimized' | 'idle' | 'warning';
  phantomLoad: number; // W
}

export interface ApplianceRelay {
  id: string;
  name: string;
  category: string;
  icon: string;
  active: boolean;
  powerKw: number;
  mode: 'autonomous' | 'manual' | 'scheduled';
  scheduleInfo?: string;
}

export interface OptimizationEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  tag: string;
  tagType: 'emerald' | 'cyan' | 'primary';
  icon: string;
  valueSaved?: string;
}

export interface TariffDataPoint {
  time: string;
  rate: number; // $/kWh
  type: 'off-peak' | 'standard' | 'peak' | 'negative' | 'spike';
  isCurrent?: boolean;
}
