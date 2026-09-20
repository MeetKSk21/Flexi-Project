"""
Agent 1: Energy Monitoring & Analysis Agent.
Specializes in deterministic calculation of consumption statistics, temporal peak/trough analysis,
diurnal patterns, weekday/weekend variations, and high-level analytical summaries.
"""

import json
from typing import Dict, Any
import pandas as pd
from services.energy_calculator import compute_energy_metrics
from services.llm_service import llm_service
from utils.prompts import MONITORING_SUMMARY_PROMPT
from utils.logging_config import logger

class MonitoringAgent:
    """Agent responsible for understanding historical energy consumption patterns."""

    def __init__(self):
        self.name = "Energy Monitoring & Analysis Agent"
        self.role = "Historical Data Analytics & Temporal Profiling"

    def process(self, df: pd.DataFrame, call_llm: bool = True) -> Dict[str, Any]:
        """
        Executes deterministic energy analysis and enriches findings with LLM interpretation.
        
        Parameters:
            df (pd.DataFrame): Validated consumption data.
            call_llm (bool): Whether to invoke external cloud LLM or use deterministic summary.
            
        Returns:
            Dict[str, Any]: Structured output dictionary.
        """
        logger.info(f"[{self.name}] Executing analytical calculations...")
        
        # 1. Deterministic calculation
        metrics = compute_energy_metrics(df)
        if not metrics:
            return {"status": "error", "message": "No metrics could be calculated."}

        # 2. Summary generation
        fallback_summary = (
            f"• **Total Consumption**: {metrics['total_consumption']} kWh ({metrics['daily_average']} kWh/day average).\n"
            f"• **Peak Window**: Maximum demand concentrated around {metrics['peak_period']} ({metrics['peak_consumption']} kWh).\n"
            f"• **Temporal Variation**: Weekend consumption exhibits a {abs(metrics['weekend_difference_pct'])}% "
            f"{'elevation' if metrics['weekend_difference_pct'] >= 0 else 'reduction'} relative to business weekdays.\n"
            f"• **Overall Trend**: The energy trajectory is currently evaluated as **{metrics['trend']}**."
        )

        if call_llm:
            prompt = MONITORING_SUMMARY_PROMPT.format(
                metrics_json=json.dumps({
                    "total_kwh": metrics["total_consumption"],
                    "daily_average_kwh": metrics["daily_average"],
                    "peak_period": metrics["peak_period"],
                    "peak_kwh": metrics["peak_consumption"],
                    "weekend_vs_weekday_diff_pct": metrics["weekend_difference_pct"],
                    "trend": metrics["trend"]
                }, indent=2)
            )
            ai_summary = llm_service.generate_completion(
                prompt=prompt,
                system_prompt="You are an expert energy auditor summarizing smart meter data.",
                fallback_text=fallback_summary
            )
        else:
            ai_summary = fallback_summary

        output = {
            "agent": self.name,
            "role": self.role,
            "status": "success",
            "metrics": metrics,
            "ai_summary": ai_summary,
            "total_consumption": metrics["total_consumption"],
            "average_consumption": metrics["average_consumption"],
            "peak_consumption": metrics["peak_consumption"],
            "peak_period": metrics["peak_period"],
            "daily_average": metrics["daily_average"],
            "trend": metrics["trend"],
            "key_findings": metrics["key_findings"]
        }

        return output
