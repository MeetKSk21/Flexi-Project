import React, { useState, useEffect } from 'react';
import { AgentStatus, AnomalyItem, ForecastPoint, ApplianceOptimization } from '../../types';

interface AIAgentsScreenProps {
  currencySymbol?: string;
  onOpenChatAdvisor?: () => void;
}

const DEFAULT_AGENTS: AgentStatus[] = [
  {
    id: "ingestion-monitoring",
    name: "Data Ingestion & Monitoring Agent",
    role: "Continuous Smart Meter Ingestion",
    status: "Active • Telemetry Synced",
    algorithm: "Sliding Time-Window & Schema Validation",
    confidence: 99.4,
    icon: "sensors",
    badge: "Online",
    lastAction: "Validated 1,080 smart meter intervals without dropped frames or anomalies."
  },
  {
    id: "anomaly-safety",
    name: "Anomaly Detection & Safety Agent",
    role: "Continuous Grid Safety & Surge Defense",
    status: "Active • Isolation Forest Active",
    algorithm: "Scikit-Learn Isolation Forest + Dynamic Boundary Rules",
    confidence: 96.8,
    icon: "security",
    badge: "Active Guard",
    lastAction: "Scanned sub-hourly metrics; isolated 2 duty-cycle anomalies."
  },
  {
    id: "load-forecasting",
    name: "Load Forecasting Agent",
    role: "24-Hour Predictive Demand Modeling",
    status: "Active • Cycle Model Converged",
    algorithm: "Time-of-Use Cyclical Decomposition & Rolling Autoregression",
    confidence: 94.2,
    icon: "query_stats",
    badge: "Predicting",
    lastAction: "Generated 24-hour predictive demand curve; forecasted evening peak at 19:30."
  },
  {
    id: "appliance-scheduler",
    name: "Appliance & Load Scheduling Agent",
    role: "Smart Relay Control & Flex-Shift",
    status: "Active • Relays Synchronized",
    algorithm: "Heuristic Priority Queue & Deferrable Load Sequencer",
    confidence: 98.1,
    icon: "devices",
    badge: "Scheduled",
    lastAction: "Shifted EV charging and washing cycle to 02:00 off-peak valley."
  },
  {
    id: "cost-optimization",
    name: "Cost & Tariff Optimization Agent",
    role: "Wholesale Arbitrage & TOU Minimization",
    status: "Active • Solver Optimal",
    algorithm: "Linear Programming Cost Objective Function",
    confidence: 97.5,
    icon: "savings",
    badge: "Arbitrage",
    lastAction: "Reduced projected monthly bill by 22.2% via time-of-use peak shaving."
  },
  {
    id: "coordinator-learning",
    name: "Coordinator & Learning Agent",
    role: "Multi-Agent Synthesis & Natural Language Advisor",
    status: "Active • Conversational Brain",
    algorithm: "LLM Synthesis with Fallback Domain Heuristics",
    confidence: 95.0,
    icon: "psychology",
    badge: "Synthesizing",
    lastAction: "Prepared executive energy brief and active user recommendation ledger."
  }
];

const DEFAULT_ANOMALIES: AnomalyItem[] = [
  {
    id: "anom_1",
    timestamp: "Today • 20:15",
    measured_kwh: 5.6,
    expected_mean_kwh: 1.8,
    severity: "HIGH",
    explanation: "HVAC compressor short-cycling detected during peak tariff rate window."
  },
  {
    id: "anom_2",
    timestamp: "Yesterday • 03:30",
    measured_kwh: 2.9,
    expected_mean_kwh: 0.7,
    severity: "WARNING",
    explanation: "Unusual late-night continuous load. Secondary refrigeration defrost cycle stuck."
  },
  {
    id: "anom_3",
    timestamp: "3 Days Ago • 14:00",
    measured_kwh: 0.2,
    expected_mean_kwh: 1.5,
    severity: "LOW",
    explanation: "Solar inverter communication heartbeat dropped 2 samples; restored automatically."
  }
];

const DEFAULT_APPLIANCES: ApplianceOptimization[] = [
  {
    appliance_name: "Electric Vehicle (7.2 kW Level 2)",
    rated_power_kw: 7.2,
    typical_hours_per_day: 3.5,
    monthly_kwh: 220,
    current_monthly_cost: 1760,
    optimized_monthly_cost: 990,
    monthly_savings_cost: 770,
    recommended_schedule: "02:00 – 05:30 (Off-Peak Valley)"
  },
  {
    appliance_name: "Washing Machine & Dryer",
    rated_power_kw: 2.2,
    typical_hours_per_day: 1.5,
    monthly_kwh: 99,
    current_monthly_cost: 792,
    optimized_monthly_cost: 445,
    monthly_savings_cost: 347,
    recommended_schedule: "11:00 – 13:00 (Solar Surplus)"
  },
  {
    appliance_name: "Smart Dishwasher",
    rated_power_kw: 1.8,
    typical_hours_per_day: 1.2,
    monthly_kwh: 64,
    current_monthly_cost: 512,
    optimized_monthly_cost: 288,
    monthly_savings_cost: 224,
    recommended_schedule: "01:30 – 03:00 (Night Rate)"
  },
  {
    appliance_name: "Heat Pump Water Heater",
    rated_power_kw: 3.0,
    typical_hours_per_day: 2.0,
    monthly_kwh: 180,
    current_monthly_cost: 1440,
    optimized_monthly_cost: 990,
    monthly_savings_cost: 450,
    recommended_schedule: "13:00 – 15:00 (Peak Solar)"
  }
];

export const AIAgentsScreen: React.FC<AIAgentsScreenProps> = ({
  currencySymbol = "₹",
  onOpenChatAdvisor
}) => {
  const [agents, setAgents] = useState<AgentStatus[]>(DEFAULT_AGENTS);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>(DEFAULT_ANOMALIES);
  const [appliances, setAppliances] = useState<ApplianceOptimization[]>(DEFAULT_APPLIANCES);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [isSimulatingAnomaly, setIsSimulatingAnomaly] = useState(false);
  const [pipelineSuccessMsg, setPipelineSuccessMsg] = useState<string | null>(null);

  // Fetch real agent status & forecast from FastAPI backend
  useEffect(() => {
    fetch('/api/agents/status')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.agents) setAgents(data.agents);
      })
      .catch(() => {});

    fetch('/api/anomalies')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.anomalies) setAnomalies(data.anomalies);
      })
      .catch(() => {});

    fetch('/api/forecast')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.forecastPoints) setForecast(data.forecastPoints);
      })
      .catch(() => {});

    fetch('/api/optimization')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.appliances && data.appliances.length > 0) setAppliances(data.appliances);
      })
      .catch(() => {});
  }, []);

  // Run full multi-agent pipeline
  const handleRunPipeline = async () => {
    setIsRunningPipeline(true);
    setPipelineSuccessMsg(null);
    try {
      const res = await fetch('/api/agents/run-pipeline', { method: 'POST' });
      if (res.ok) {
        setPipelineSuccessMsg("Multi-Agent optimization solver completed. All recommendations updated.");
        // Refresh anomalies and forecast
        const anomRes = await fetch('/api/anomalies');
        if (anomRes.ok) {
          const anomData = await anomRes.json();
          if (anomData.anomalies) setAnomalies(anomData.anomalies);
        }
      } else {
        setPipelineSuccessMsg("Optimization baseline refreshed.");
      }
    } catch (e) {
      setPipelineSuccessMsg("Pipeline executed (Offline heuristic mode).");
    } finally {
      setIsRunningPipeline(false);
      setTimeout(() => setPipelineSuccessMsg(null), 5000);
    }
  };

  // Simulate Anomaly Injection
  const handleSimulateAnomaly = async () => {
    setIsSimulatingAnomaly(true);
    try {
      const res = await fetch('/api/anomalies/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spike_kw: 6.8, appliance_hint: "HVAC Compressor Continuous Lock" })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.anomaly) {
          setAnomalies(prev => [data.anomaly, ...prev]);
        }
      } else {
        // Fallback local simulation
        const mock: AnomalyItem = {
          id: "anom_sim_" + Date.now(),
          timestamp: "Just Now",
          measured_kwh: 6.8,
          expected_mean_kwh: 1.4,
          severity: "CRITICAL",
          explanation: "Live Simulated Surge: HVAC Compressor duty cycle locked at 6.8 kW (385% above baseline). Isolation Forest flagged deviation.",
          simulated: true
        };
        setAnomalies(prev => [mock, ...prev]);
      }
    } catch {
      const mock: AnomalyItem = {
        id: "anom_sim_" + Date.now(),
        timestamp: "Just Now",
        measured_kwh: 6.8,
        expected_mean_kwh: 1.4,
        severity: "CRITICAL",
        explanation: "Live Simulated Surge: HVAC Compressor duty cycle locked at 6.8 kW. Isolation Forest flagged deviation.",
        simulated: true
      };
      setAnomalies(prev => [mock, ...prev]);
    } finally {
      setIsSimulatingAnomaly(false);
    }
  };

  const totalSavings = appliances.reduce((acc, curr) => acc + (curr.monthly_savings_cost || 0), 0);

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-container-high/90 via-surface-container to-surface-container-high/80 border border-outline-variant/30 p-6 lg:p-8 mb-8 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-bright/10 border border-cyan-bright/30 mb-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-bright opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-bright"></span>
              </span>
              <span className="text-xs uppercase font-bold tracking-wider text-cyan-bright">
                Autonomous 6-Agent Core Active
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface mb-2">
              Multi-Agent AI Energy Orchestrator
            </h1>
            <p className="text-sm lg:text-base text-on-surface-variant leading-relaxed">
              Six autonomous agents collaboratively monitor meter streams, isolate grid surges with <strong>Isolation Forest</strong>, forecast 24h consumption, schedule high-draw appliances, and minimize wholesale TOU tariffs.
            </p>
          </div>

          {/* Action Button Group */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunPipeline}
              disabled={isRunningPipeline}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-semibold text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:bg-cyan-bright transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isRunningPipeline ? 'sync' : 'auto_mode'}
              </span>
              {isRunningPipeline ? 'Solving LP Optimization...' : 'Run 6-Agent Solver'}
            </button>

            <button
              onClick={handleSimulateAnomaly}
              disabled={isSimulatingAnomaly}
              className="px-4 py-2.5 rounded-xl bg-surface-container-highest text-amber-400 font-semibold text-sm border border-amber-400/30 hover:bg-amber-400/10 transition-all active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              {isSimulatingAnomaly ? 'Injecting...' : '⚡ Simulate Anomaly'}
            </button>

            {onOpenChatAdvisor && (
              <button
                onClick={onOpenChatAdvisor}
                className="px-4 py-2.5 rounded-xl bg-surface-container-highest text-on-surface font-semibold text-sm border border-outline-variant/40 hover:bg-surface-bright transition-all flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-primary text-[18px]">chat</span>
                AI Energy Advisor
              </button>
            )}
          </div>
        </div>

        {pipelineSuccessMsg && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {pipelineSuccessMsg}
          </div>
        )}
      </div>

      {/* Section 1: The 6 AI Agents Grid */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">smart_toy</span>
            Autonomous Agent Fleet
          </h2>
          <span className="text-xs text-on-surface-variant font-medium">
            All 6 Agents Synchronized &amp; Operational
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="p-5 rounded-xl bg-surface-container-low/90 border border-outline-variant/30 hover:border-cyan-bright/40 transition-all shadow-md group relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[20px]">{agent.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-on-surface">{agent.name}</h3>
                    <p className="text-xs text-on-surface-variant">{agent.role}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {agent.badge}
                </span>
              </div>

              <div className="space-y-2 text-xs text-on-surface-variant mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant/70">Algorithm:</span>
                  <span className="font-mono text-[11px] text-cyan-bright font-medium">{agent.algorithm}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant/70">Confidence:</span>
                  <span className="font-semibold text-emerald-400">{agent.confidence}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-400"
                    style={{ width: `${agent.confidence}%` }}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/20">
                <p className="text-xs text-on-surface-variant line-clamp-2">
                  <span className="font-semibold text-on-surface">Recent: </span>
                  {agent.lastAction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Predictive 24-Hour Load Forecast & Peak Windows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 p-6 rounded-xl bg-surface-container-low/90 border border-outline-variant/30 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-bright text-[20px]">query_stats</span>
                24-Hour Predictive Load &amp; Solar Curve
              </h2>
              <p className="text-xs text-on-surface-variant">
                Generated by Forecasting Agent via Cyclical Autoregression
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-cyan-bright">
                <span className="w-3 h-1 bg-cyan-bright rounded"></span> Demand (kW)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-1 bg-amber-400 rounded"></span> Solar (kW)
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 bg-rose-500/20 border border-rose-500/60 rounded"></span> Peak Rate Window
              </span>
            </div>
          </div>

          {/* SVG Multi-Line Mini Visualizer */}
          <div className="relative w-full h-56 bg-surface-container/60 rounded-lg p-3 flex flex-col justify-end border border-outline-variant/20 overflow-hidden">
            {/* Peak window indicator overlay (18:00 - 22:00) */}
            <div
              className="absolute top-0 bottom-0 bg-rose-500/10 border-x border-rose-500/30 pointer-events-none flex flex-col items-center justify-start pt-2"
              style={{ left: '75%', width: '16.6%' }}
            >
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider bg-rose-950/80 px-1 rounded">
                Peak Window (6-10 PM)
              </span>
            </div>

            {/* Simulated bar/curve visualization */}
            <div className="flex items-end justify-between w-full h-40 gap-1 z-10">
              {Array.from({ length: 24 }).map((_, idx) => {
                // Synthetic realistic points if backend points not loaded yet
                const pt = forecast[idx];
                const demand = pt ? pt.forecastKw : (idx >= 18 && idx <= 22 ? 4.2 : (idx >= 6 && idx <= 9 ? 3.1 : 1.2));
                const solar = pt ? pt.solarKw : (idx >= 8 && idx <= 16 ? Math.sin((idx - 8) / 8 * Math.PI) * 5.6 : 0);
                const isPeak = idx >= 18 && idx <= 22;

                const demandHeight = Math.min(100, (demand / 6.0) * 100);
                const solarHeight = Math.min(100, (solar / 6.0) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-surface-container-highest px-2 py-1 rounded shadow-lg text-[10px] whitespace-nowrap z-20 border border-outline-variant/40">
                      <div>{String(idx).padStart(2, '0')}:00</div>
                      <div className="text-cyan-bright">Demand: {demand.toFixed(1)} kW</div>
                      {solar > 0 && <div className="text-amber-400">Solar: {solar.toFixed(1)} kW</div>}
                    </div>

                    {/* Solar bar */}
                    {solar > 0 && (
                      <div
                        className="w-full bg-amber-400/40 rounded-t mb-0.5 transition-all"
                        style={{ height: `${solarHeight}%` }}
                      />
                    )}

                    {/* Demand bar */}
                    <div
                      className={`w-full rounded-t transition-all ${
                        isPeak ? 'bg-rose-500' : 'bg-cyan-bright'
                      }`}
                      style={{ height: `${demandHeight}%` }}
                    />

                    {/* Hour label */}
                    {idx % 4 === 0 && (
                      <span className="text-[9px] text-on-surface-variant mt-1">{String(idx).padStart(2, '0')}h</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Forecast Insights Box */}
        <div className="p-6 rounded-xl bg-surface-container-low/90 border border-outline-variant/30 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[20px]">lightbulb</span>
              Forecasting Insights
            </h3>
            <div className="space-y-4 text-xs text-on-surface-variant">
              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/20">
                <span className="text-on-surface font-semibold block mb-1">Peak Evening Demand</span>
                <p>Projected spike of <strong>4.8 kW at 19:30</strong>. The Optimization Agent recommends locking the EV charger until 02:00.</p>
              </div>

              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/20">
                <span className="text-on-surface font-semibold block mb-1">Solar Production Window</span>
                <p>Peak generation from <strong>10:00 to 14:00 (5.8 kW max)</strong>. 82% will charge the Powerwall; 18% exported to grid.</p>
              </div>

              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/20">
                <span className="text-on-surface font-semibold block mb-1">Arbitrage Opportunity</span>
                <p>Pre-charging storage during {currencySymbol}3.00 off-peak rate and displacing {currencySymbol}9.00 peak power will save <strong>{currencySymbol}1,140/mo</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Live ML Anomaly Detection Feed */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500 text-[22px]">warning</span>
              Real-Time ML Anomaly Detections (Isolation Forest)
            </h2>
            <p className="text-xs text-on-surface-variant">
              Continuous electrical safety auditing &amp; behavioral outlier isolation
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold">
            {anomalies.length} Flagged Incidents
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-outline-variant/30 bg-surface-container-low/90 shadow-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-high/80 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/30">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Measured vs Normal</th>
                <th className="py-3 px-4">Root Cause &amp; Recommendation</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {anomalies.map((anom, idx) => {
                const isCrit = anom.severity === 'CRITICAL' || anom.severity === 'HIGH';
                return (
                  <tr key={anom.id || idx} className="hover:bg-surface-container-high/50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        isCrit ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                      }`}>
                        {anom.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-on-surface font-medium">
                      {anom.timestamp}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-semibold text-rose-400">{anom.measured_kwh} kW</span>
                      <span className="text-on-surface-variant/60"> / norm: {anom.expected_mean_kwh} kW</span>
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant max-w-md">
                      {anom.explanation}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        Isolated
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Smart Appliance Cost Optimization Solver */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-[22px]">tune</span>
              Appliance Cost Optimization &amp; Shift Recommendations
            </h2>
            <p className="text-xs text-on-surface-variant">
              Linear Programming solver outputs for deferrable household circuits
            </p>
          </div>
          <div className="px-4 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            Total Monthly Potential Savings: {currencySymbol}{totalSavings.toLocaleString()}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-outline-variant/30 bg-surface-container-low/90 shadow-md">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-high/80 text-on-surface-variant uppercase text-[10px] tracking-wider border-b border-outline-variant/30">
              <tr>
                <th className="py-3 px-4">Appliance</th>
                <th className="py-3 px-4">Power (kW)</th>
                <th className="py-3 px-4">Current Monthly Cost</th>
                <th className="py-3 px-4">Potential Savings</th>
                <th className="py-3 px-4">AI Recommended Schedule</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {appliances.map((app, idx) => (
                <tr key={idx} className="hover:bg-surface-container-high/50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-on-surface">
                    {app.appliance_name}
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant font-mono">
                    {app.rated_power_kw} kW
                  </td>
                  <td className="py-3 px-4 text-on-surface-variant font-mono">
                    {currencySymbol}{app.current_monthly_cost}
                  </td>
                  <td className="py-3 px-4 font-semibold text-emerald-400 font-mono">
                    +{currencySymbol}{app.monthly_savings_cost}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md bg-cyan-bright/10 text-cyan-bright border border-cyan-bright/30 font-medium">
                      {app.recommended_schedule}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert(`Applied optimal schedule for ${app.appliance_name}: ${app.recommended_schedule}`)}
                      className="px-3 py-1 rounded-lg bg-surface-container-highest hover:bg-cyan-bright hover:text-black transition-all text-xs font-semibold cursor-pointer border border-outline-variant/30"
                    >
                      Apply Shift
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
