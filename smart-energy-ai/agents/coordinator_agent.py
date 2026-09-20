"""
Agent 6: Energy Advisor / Coordinator Agent.
The central orchestrator of SmartEnergy AI.
Coordinates the 5 specialized agents, performs intelligent intent routing,
combines analytical outputs, resolves conflicting recommendations, and generates comprehensive reports.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
from agents.monitoring_agent import MonitoringAgent
from agents.forecasting_agent import ForecastingAgent
from agents.appliance_agent import ApplianceAgent
from agents.cost_agent import CostAgent
from agents.anomaly_safety_agent import AnomalySafetyAgent
from services.llm_service import llm_service
from utils.prompts import COORDINATOR_SYSTEM_PROMPT, COORDINATOR_SYNTHESIS_PROMPT
from utils.config import TariffConfig
from utils.logging_config import logger

class CoordinatorAgent:
    """Master agent orchestrating the multi-agent energy management pipeline."""

    def __init__(self):
        self.name = "Energy Advisor / Coordinator Agent"
        self.role = "Multi-Agent Orchestration & Strategic Synthesis"

        # Instantiate specialized agents
        self.monitoring_agent = MonitoringAgent()
        self.forecasting_agent = ForecastingAgent()
        self.appliance_agent = ApplianceAgent()
        self.cost_agent = CostAgent()
        self.anomaly_agent = AnomalySafetyAgent()

    def run_full_analysis(
        self,
        energy_df: pd.DataFrame,
        appliances_df: pd.DataFrame,
        tariff: Optional[TariffConfig] = None,
        call_llm: bool = True
    ) -> Dict[str, Any]:
        """
        Executes the complete multi-agent pipeline across all 5 specialized agents.
        
        Returns:
            Dict[str, Any]: Unified multi-agent system state with individual agent results and final synthesis.
        """
        logger.info(f"[{self.name}] Initiating full multi-agent analysis workflow (call_llm={call_llm})...")

        if tariff is None:
            tariff = TariffConfig()

        # Step 1: Energy Monitoring Agent
        monitoring_res = self.monitoring_agent.process(energy_df, call_llm=call_llm)

        # Step 2: Forecasting Agent
        forecasting_res = self.forecasting_agent.process(energy_df, horizon_hours=24, call_llm=call_llm)

        # Step 3: Appliance Optimization Agent
        appliance_res = self.appliance_agent.process(appliances_df, tariff, call_llm=call_llm)

        # Step 4: Cost Optimization Agent
        cost_res = self.cost_agent.process(energy_df, appliances_df, tariff, call_llm=call_llm)

        # Step 5: Anomaly & Safety Agent
        anomaly_res = self.anomaly_agent.process(energy_df, call_llm=call_llm)

        # Step 6: Coordinator Synthesis
        sym = tariff.currency_symbol
        fallback_synthesis = (
            f"### Comprehensive Energy Management & Optimization Plan\n\n"
            f"**1. Historical Consumption Summary**:\n"
            f"Total observed consumption is **{monitoring_res.get('total_consumption', 0)} kWh** "
            f"({monitoring_res.get('daily_average', 0)} kWh/day). Peak demand occurs around {monitoring_res.get('peak_period', 'N/A')}.\n\n"
            f"**2. Predictive Demand Projection**:\n"
            f"Estimated next 24-hour demand is **{forecasting_res.get('total_predicted_kwh', 0)} kWh**, with peak stress projected at hour "
            f"{forecasting_res.get('peak_predicted_hour', 0):02d}:00.\n\n"
            f"**3. Anomaly & Safety Audit**:\n"
            f"Identified **{anomaly_res.get('anomaly_count', 0)} anomalies** ({anomaly_res.get('night_anomalies_count', 0)} night spikes). "
            f"No electrical hazard is assumed; checking unattended heavy appliances is advised.\n\n"
            f"**4. Financial & Appliance Optimization**:\n"
            f"By shifting flexible loads (Washing Machine, EV Charging, Geyser) away from the 6:00 PM – 10:00 PM peak tariff window "
            f"({sym}{tariff.peak_rate_per_kwh}/kWh) into off-peak hours ({sym}{tariff.off_peak_rate_per_kwh}/kWh), "
            f"projected monthly expenditure can decrease from **{sym}{cost_res.get('current_monthly_cost', 0):.2f}** "
            f"to **{sym}{cost_res.get('optimized_monthly_cost', 0):.2f}**.\n\n"
            f"**Projected Monthly Savings**: **{sym}{cost_res.get('monthly_savings', 0):.2f} ({cost_res.get('savings_percentage', 0)}%)**."
        )

        if call_llm:
            synthesis_prompt = COORDINATOR_SYNTHESIS_PROMPT.format(
                user_query="Conduct a comprehensive multi-agent energy audit and optimization plan.",
                monitoring_summary=monitoring_res.get("ai_summary", ""),
                forecasting_summary=forecasting_res.get("ai_interpretation", ""),
                appliance_summary=appliance_res.get("ai_advice", ""),
                cost_summary=cost_res.get("ai_summary", ""),
                anomaly_summary=anomaly_res.get("ai_explanation", "")
            )
            coordinator_summary = llm_service.generate_completion(
                prompt=synthesis_prompt,
                system_prompt=COORDINATOR_SYSTEM_PROMPT,
                fallback_text=fallback_synthesis
            )
        else:
            coordinator_summary = fallback_synthesis

        pipeline_result = {
            "coordinator_name": self.name,
            "status": "success",
            "monitoring": monitoring_res,
            "forecasting": forecasting_res,
            "appliances": appliance_res,
            "cost": cost_res,
            "anomalies": anomaly_res,
            "coordinator_synthesis": coordinator_summary,
            "tariff_config": {
                "currency": tariff.currency,
                "base_rate": tariff.base_rate_per_kwh,
                "peak_rate": tariff.peak_rate_per_kwh,
                "off_peak_rate": tariff.off_peak_rate_per_kwh
            }
        }

        return pipeline_result

    def route_and_respond_chat(
        self,
        user_message: str,
        system_state: Optional[Dict[str, Any]] = None,
        energy_df: Optional[pd.DataFrame] = None,
        appliances_df: Optional[pd.DataFrame] = None,
        tariff: Optional[TariffConfig] = None
    ) -> str:
        """
        Intelligent intent router that determines which agents need to be queried
        to answer a specific user question in the AI Energy Assistant tab.
        """
        if not user_message or not user_message.strip():
            return "Please ask a question about your energy consumption, electricity bill, appliances, or forecasts."

        msg_lower = user_message.lower()

        # If full state not yet computed, run full analysis
        if system_state is None and energy_df is not None and appliances_df is not None:
            system_state = self.run_full_analysis(energy_df, appliances_df, tariff)

        if not system_state:
            return "Please load or generate an energy dataset first in the Data tab, then click 'Run Full Multi-Agent Analysis'."

        # Extract context snippets from agents based on query keywords
        relevant_agents = []
        context_parts = []

        if any(w in msg_lower for w in ["bill", "cost", "money", "tariff", "rupees", "inr", "rate", "save"]):
            relevant_agents.append("Cost Optimization Agent")
            cost_info = system_state["cost"]
            context_parts.append(
                f"Cost Agent Data: Current Monthly Cost = {cost_info['currency_symbol']}{cost_info['current_monthly_cost']}, "
                f"Optimized = {cost_info['currency_symbol']}{cost_info['optimized_monthly_cost']}, "
                f"Projected Monthly Savings = {cost_info['currency_symbol']}{cost_info['monthly_savings']} ({cost_info['savings_percentage']}%)."
            )

        if any(w in msg_lower for w in ["appliance", "washing", "machine", "ac", "air conditioner", "geyser", "fridge", "refrigerator", "run", "when"]):
            relevant_agents.append("Appliance Optimization Agent")
            app_info = system_state["appliances"]
            top_apps = ", ".join([c["appliance_name"] for c in app_info["top_consumers"]])
            context_parts.append(
                f"Appliance Agent Data: Top energy consumers are {top_apps}. "
                f"Flexible loads should be scheduled during off-peak hours (11 PM - 6 AM)."
            )

        if any(w in msg_lower for w in ["predict", "future", "forecast", "tomorrow", "upcoming", "next"]):
            relevant_agents.append("Forecasting Agent")
            fc_info = system_state["forecasting"]
            context_parts.append(
                f"Forecasting Agent Data: Next 24h demand is predicted at {fc_info['total_predicted_kwh']} kWh. "
                f"Peak expected at {fc_info['peak_predicted_hour']:02d}:00 with {fc_info['peak_predicted_kwh']} kWh. Model MAE is {fc_info['mae']} kWh."
            )

        if any(w in msg_lower for w in ["anomaly", "unusual", "spike", "fault", "high yesterday", "why high", "leak"]):
            relevant_agents.append("Anomaly & Safety Agent")
            anom_info = system_state["anomalies"]
            context_parts.append(
                f"Anomaly Agent Data: Found {anom_info['anomaly_count']} unusual occurrences ({anom_info['night_anomalies_count']} late night spikes). "
                f"Method: {anom_info['method']}. Advice: Check appliances left unattended."
            )

        if any(w in msg_lower for w in ["total", "average", "trend", "usage", "weekend", "history", "yesterday", "summary"]):
            relevant_agents.append("Energy Monitoring Agent")
            mon_info = system_state["monitoring"]
            context_parts.append(
                f"Monitoring Agent Data: Total usage = {mon_info['total_consumption']} kWh, "
                f"Daily Average = {mon_info['daily_average']} kWh/day, Peak Period = {mon_info['peak_period']}, "
                f"Weekend difference = {mon_info['metrics']['weekend_difference_pct']}%, Trend = {mon_info['trend']}."
            )

        # Fallback to general context if routing was broad
        if not relevant_agents:
            relevant_agents = ["Monitoring Agent", "Cost Agent", "Appliance Agent"]
            context_parts.append(f"Summary Context: {system_state['coordinator_synthesis'][:400]}...")

        routing_note = f"*(Consulted Specialized Agents: {', '.join(relevant_agents)})*\n\n"

        prompt = (
            f"User Question: {user_message}\n\n"
            f"Context from Activated Agents:\n"
            f"{chr(10).join(context_parts)}\n\n"
            f"Answer the user's question directly, clearly, and supportively. "
            f"Ground your answer in the real numbers provided above. Do not hallucinate."
        )

        fallback_ans = (
            f"Based on our multi-agent energy audit:\n"
            f"• Current average daily consumption: **{system_state['monitoring']['daily_average']} kWh/day**.\n"
            f"• Peak demand window: **{system_state['monitoring']['peak_period']}**.\n"
            f"• Estimated monthly savings with load-shifting: **{system_state['cost']['currency_symbol']}{system_state['cost']['monthly_savings']}**.\n"
            f"For detailed specifics, please check the individual agent tabs above."
        )

        llm_reply = llm_service.generate_completion(
            prompt=prompt,
            system_prompt="You are the SmartEnergy AI Coordinator Assistant.",
            fallback_text=fallback_ans
        )

        return routing_note + llm_reply

    def generate_full_report_markdown(self, system_state: Dict[str, Any]) -> str:
        """Constructs a comprehensive, downloadable markdown report."""
        if not system_state or system_state.get("status") != "success":
            return "# Energy Report Unavailable\nPlease execute analysis first."

        mon = system_state["monitoring"]
        fc = system_state["forecasting"]
        app = system_state["appliances"]
        cost = system_state["cost"]
        anom = system_state["anomalies"]
        sym = cost["currency_symbol"]

        report = f"""# SmartEnergy AI — Comprehensive Energy Audit & Optimization Report
**Generated by**: SmartEnergy AI Multi-Agent System (Coordinator Agent Orchestrator)  
**System Status**: Verified Deterministic Engine with Multi-Agent Synthesis  

---

## 1. Executive Summary
{system_state.get('coordinator_synthesis', '')}

---

## 2. Historical Energy Consumption Profile (Monitoring Agent)
- **Total Consumption Analyzed**: {mon.get('total_consumption', 'N/A')} kWh
- **Average Hourly Consumption**: {mon.get('average_consumption', 'N/A')} kWh
- **Daily Average Consumption**: {mon.get('daily_average', 'N/A')} kWh/day
- **Peak Consumption Reading**: {mon.get('peak_consumption', 'N/A')} kWh (Occurred at: {mon.get('metrics', {}).get('peak_timestamp', 'N/A')})
- **Typical Daily Peak Window**: {mon.get('peak_period', 'N/A')}
- **Base-Load Trough Window**: {mon.get('metrics', {}).get('trough_period', 'N/A')}
- **Weekend vs Weekday Variance**: {mon.get('metrics', {}).get('weekend_difference_pct', 'N/A')}%
- **Identified Trajectory Trend**: {mon.get('trend', 'N/A')}

**Key Analytical Findings**:
{chr(10).join([f"- {f}" for f in mon.get('key_findings', [])])}

---

## 3. Predictive Demand Forecast (Forecasting Agent)
- **Machine Learning Architecture**: {fc.get('model_name', 'Random Forest Regressor')}
- **Forecast Horizon**: 24 Hours
- **Projected 24-Hour Cumulative Demand**: {fc.get('total_predicted_kwh', 'N/A')} kWh
- **Anticipated Peak Hour**: {fc.get('peak_predicted_hour', 'N/A')}:00 ({fc.get('peak_predicted_kwh', 'N/A')} kWh at {fc.get('peak_predicted_time', 'N/A')})
- **Model Evaluation Metrics**:
  - Mean Absolute Error (MAE): **{fc.get('mae', 'N/A')} kWh**
  - Root Mean Squared Error (RMSE): **{fc.get('rmse', 'N/A')} kWh**
  - Mean Absolute Percentage Error (MAPE): **{fc.get('mape', 'N/A')}%**

---

## 4. Anomaly Detection & Safety Audit (Anomaly & Safety Agent)
- **Detection Algorithm**: {anom.get('method', 'Hybrid Diurnal Z-Score & Isolation Forest')}
- **Total Hourly Records Scanned**: {anom.get('total_evaluated', 'N/A')}
- **Total Flagged Anomalies**: {anom.get('anomaly_count', 'N/A')} ({anom.get('anomaly_percentage', 'N/A')}% of records)
- **High Severity Incidents**: {anom.get('critical_count', 0) + anom.get('high_count', 0)}
- **Late-Night (00:00 - 05:00) Anomalies**: {anom.get('night_anomalies_count', 'N/A')}
- **Safety Advisory**: Identified spikes represent analytical consumption variations, not confirmed hardware failures. Avoid hazardous internal electrical disassembly.

---

## 5. Appliance Load Disaggregation & Optimization (Appliance Agent)
- **Total Monthly Baseline Load**: {app.get('total_monthly_kwh', 'N/A')} kWh
- **Potential Energy Conserved**: {app.get('total_monthly_saved_kwh', 'N/A')} kWh
- **Energy Conservation Percentage**: {app.get('savings_percentage', 'N/A')}%
- **Top Consumption Appliances**:
{chr(10).join([f"  - **{c['appliance_name']}**: {c['monthly_kwh']} kWh/mo ({sym}{c['current_monthly_cost']:.2f})" for c in app.get('top_consumers', [])])}

---

## 6. Financial Tariff & Cost Optimization (Cost Agent)
- **Configured Currency**: {cost.get('currency', 'INR')}
- **Current Monthly Projected Bill**: {sym}{cost.get('current_monthly_cost', 'N/A')}
- **Optimized Monthly Projected Bill**: {sym}{cost.get('optimized_monthly_cost', 'N/A')}
- **Estimated Net Financial Savings**: **{sym}{cost.get('monthly_savings', 'N/A')} / month**
- **Percentage Bill Reduction**: **{cost.get('savings_percentage', 'N/A')}%**

---

## 7. Limitations & Future Scope
1. **Decision Support Nature**: All savings and bills are analytical estimates based on simulation and tariffs. Actual utility billing entails fixed taxes and dynamic utility surcharges.
2. **Hardware Decoupling**: Designed for demonstration without physical IoT smart meters. Can be integrated in future with ESP32 / Modbus / MQTT sensors.
3. **Safety Compliance**: Energy advice targets user thermostat setpoints and duty cycle timing; no physical modifications to wiring or main breakers should ever be undertaken.
"""
        return report

coordinator_agent = CoordinatorAgent()
