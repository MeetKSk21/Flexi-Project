"""
Agent 2: Forecasting Agent.
Specializes in predictive modeling of future energy demand using supervised machine learning,
lag feature extraction, and empirical evaluation (MAE, RMSE, MAPE).
"""

import json
from typing import Dict, Any
import pandas as pd
from services.forecasting import train_and_forecast_energy
from services.llm_service import llm_service
from utils.prompts import FORECAST_INTERPRETATION_PROMPT
from utils.logging_config import logger

class ForecastingAgent:
    """Agent responsible for projecting upcoming energy demand and load peaks."""

    def __init__(self):
        self.name = "Forecasting Agent"
        self.role = "Time-Series Machine Learning & Demand Projection"

    def process(self, df: pd.DataFrame, horizon_hours: int = 24, call_llm: bool = True) -> Dict[str, Any]:
        """
        Trains model, forecasts upcoming hours, and synthesizes actionable predictive guidance.
        """
        logger.info(f"[{self.name}] Training ML forecasting model for {horizon_hours}h horizon...")
        
        forecast_result = train_and_forecast_energy(df, forecast_horizon_hours=horizon_hours)
        if forecast_result.get("status") != "success":
            return {
                "agent": self.name,
                "role": self.role,
                "status": "error",
                "message": forecast_result.get("message", "Forecasting failed.")
            }

        fallback_interpretation = (
            f"• **Projected 24-Hour Demand**: {forecast_result['total_predicted_kwh']} kWh.\n"
            f"• **Upcoming Peak Demand**: Expected at hour {forecast_result['peak_predicted_hour']:02d}:00 "
            f"({forecast_result['peak_predicted_kwh']} kWh).\n"
            f"• **Model Performance**: Evaluated on holdout data with MAE = {forecast_result['mae']} kWh, "
            f"RMSE = {forecast_result['rmse']} kWh, and MAPE = {forecast_result['mape']}%.\n"
            f"• **Operational Advisory**: Consider pre-cooling living spaces or running water heaters prior to {forecast_result['peak_predicted_hour']:02d}:00 "
            f"to prevent coincident peak strain."
        )

        if call_llm:
            prompt = FORECAST_INTERPRETATION_PROMPT.format(
                forecast_json=json.dumps({
                    "model": forecast_result["model_name"],
                    "mae": forecast_result["mae"],
                    "rmse": forecast_result["rmse"],
                    "mape_pct": forecast_result["mape"],
                    "total_predicted_kwh": forecast_result["total_predicted_kwh"],
                    "peak_hour": forecast_result["peak_predicted_hour"],
                    "peak_kwh": forecast_result["peak_predicted_kwh"],
                    "peak_timestamp": forecast_result["peak_predicted_time"]
                }, indent=2)
            )
            ai_interpretation = llm_service.generate_completion(
                prompt=prompt,
                system_prompt="You are a load forecasting specialist for power utility systems.",
                fallback_text=fallback_interpretation
            )
        else:
            ai_interpretation = fallback_interpretation

        return {
            "agent": self.name,
            "role": self.role,
            "status": "success",
            "model_name": forecast_result["model_name"],
            "mae": forecast_result["mae"],
            "rmse": forecast_result["rmse"],
            "mape": forecast_result["mape"],
            "features_used": forecast_result["features_used"],
            "feature_importances": forecast_result["feature_importances"],
            "total_predicted_kwh": forecast_result["total_predicted_kwh"],
            "peak_predicted_hour": forecast_result["peak_predicted_hour"],
            "peak_predicted_kwh": forecast_result["peak_predicted_kwh"],
            "peak_predicted_time": forecast_result["peak_predicted_time"],
            "forecast_records": forecast_result["forecast_records"],
            "ai_interpretation": ai_interpretation
        }
