"""
Agent 5: Anomaly & Energy Safety Agent.
Specializes in behavioral outlier detection, identifying midnight consumption leaks,
and evaluating load spikes using diurnal baselines and Isolation Forest without providing unsafe electrical advice.
"""

import json
from typing import Dict, Any
import pandas as pd
from services.anomaly_detection import detect_energy_anomalies
from services.llm_service import llm_service
from utils.prompts import ANOMALY_EXPLANATION_PROMPT
from utils.logging_config import logger

class AnomalySafetyAgent:
    """Agent responsible for anomaly detection, energy waste identification, and safety advisories."""

    def __init__(self):
        self.name = "Anomaly & Energy Safety Agent"
        self.role = "Anomaly Detection & Energy Waste Auditing"

    def process(self, df: pd.DataFrame, call_llm: bool = True) -> Dict[str, Any]:
        """
        Runs anomaly detection and synthesizes safe, responsible recommendations.
        """
        logger.info(f"[{self.name}] Scanning dataset for load anomalies and spikes...")
        
        result = detect_energy_anomalies(df)
        if result.get("status") != "success":
            return {
                "agent": self.name,
                "role": self.role,
                "status": "error",
                "message": result.get("message", "Anomaly detection failed.")
            }

        fallback_explanation = (
            f"• **Anomalies Identified**: {result['anomaly_count']} readings ({result['anomaly_percentage']}% of records) "
            f"exceeded diurnal statistical bounds or Isolation Forest thresholds.\n"
            f"• **Critical Incidents**: {result['critical_count']} high-magnitude spikes and {result['night_anomalies_count']} "
            f"unusual late-night load events were flagged.\n"
            f"• **Safety & Waste Assessment**: Unusual energy consumption detected. This may indicate appliances left operating unintentionally "
            f"(e.g., continuous HVAC or heating elements) or atypical behavioral routines.\n"
            f"• **Recommended Action**: Perform an appliance walk-through to ensure devices shut down when unattended. "
            f"Do not attempt any hazardous internal electrical disassembly or breaker wiring alterations."
        )

        if call_llm:
            top_anomalies = result["anomalies"][:5]
            prompt = ANOMALY_EXPLANATION_PROMPT.format(
                anomalies_json=json.dumps(top_anomalies, indent=2)
            )
            ai_explanation = llm_service.generate_completion(
                prompt=prompt,
                system_prompt="You are an energy auditor focusing on safety and efficiency. Never advise electrical rewiring.",
                fallback_text=fallback_explanation
            )
        else:
            ai_explanation = fallback_explanation

        return {
            "agent": self.name,
            "role": self.role,
            "status": "success",
            "method": result["method"],
            "total_evaluated": result["total_records_evaluated"],
            "anomaly_count": result["anomaly_count"],
            "anomaly_percentage": result["anomaly_percentage"],
            "critical_count": result["critical_count"],
            "high_count": result["high_count"],
            "night_anomalies_count": result["night_anomalies_count"],
            "anomalies": result["anomalies"],
            "ai_explanation": ai_explanation
        }
