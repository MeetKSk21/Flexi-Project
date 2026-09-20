"""
Agent 3: Appliance Optimization Agent.
Specializes in disaggregating load by appliance, identifying flexible vs non-flexible devices,
formulating load-shifting schedules, and calculating potential energy conservation without compromising comfort.
"""

import json
from typing import Dict, Any, Optional
import pandas as pd
from services.optimization import optimize_appliance_schedule
from services.llm_service import llm_service
from utils.prompts import APPLIANCE_ADVICE_PROMPT
from utils.config import TariffConfig
from utils.logging_config import logger

class ApplianceAgent:
    """Agent responsible for device-level optimization and load-shifting strategies."""

    def __init__(self):
        self.name = "Appliance Optimization Agent"
        self.role = "Device Disaggregation & Load-Shifting Scheduler"

    def process(self, appliances_df: pd.DataFrame, tariff: Optional[TariffConfig] = None, call_llm: bool = True) -> Dict[str, Any]:
        """
        Processes appliances inventory, determines optimal schedules, and synthesizes conservation tips.
        """
        logger.info(f"[{self.name}] Analyzing appliance load profiles...")
        
        opt_result = optimize_appliance_schedule(appliances_df, tariff)
        if opt_result.get("status") != "success":
            return {"agent": self.name, "role": self.role, "status": "error", "message": "Appliance optimization failed."}

        top_consumers_summary = [
            f"{c['appliance_name']} ({c['monthly_kwh']} kWh/mo, {tariff.currency_symbol if tariff else '₹'}{c['current_monthly_cost']})"
            for c in opt_result["top_consumers"]
        ]

        fallback_advice = (
            f"• **Top Consumption Drivers**: {', '.join(top_consumers_summary)} represent the primary energy drivers.\n"
            f"• **High-Impact Load Shifting**: Reschedule Washing Machine and EV/Battery charging to off-peak hours (11:00 PM – 06:00 AM) "
            f"to capture significantly lower time-of-day tariff rates.\n"
            f"• **Thermostat Management**: Adjust Air Conditioner setpoint to 24°C–25°C (each 1°C elevation yields ~6% energy savings).\n"
            f"• **Standby Reductions**: Use smart surge protectors to eliminate vampire draw on entertainment and desktop computing setups.\n"
            f"• **Safety Note**: All suggestions operate strictly through standard user appliance controls; no physical wiring alterations required."
        )

        if call_llm:
            prompt = APPLIANCE_ADVICE_PROMPT.format(
                appliance_json=json.dumps({
                    "top_consumers": opt_result["top_consumers"],
                    "total_monthly_kwh": opt_result["total_monthly_kwh"],
                    "potential_saved_kwh": opt_result["total_monthly_saved_kwh"],
                    "savings_pct": opt_result["savings_percentage"]
                }, indent=2)
            )
            ai_advice = llm_service.generate_completion(
                prompt=prompt,
                system_prompt="You are a home energy efficiency specialist. Never give unsafe electrical advice.",
                fallback_text=fallback_advice
            )
        else:
            ai_advice = fallback_advice

        return {
            "agent": self.name,
            "role": self.role,
            "status": "success",
            "top_consumers": opt_result["top_consumers"],
            "total_monthly_kwh": opt_result["total_monthly_kwh"],
            "total_monthly_saved_kwh": opt_result["total_monthly_saved_kwh"],
            "savings_percentage": opt_result["savings_percentage"],
            "appliance_table": opt_result["appliance_table"],
            "ai_advice": ai_advice
        }
