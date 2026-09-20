"""
Agent 4: Cost Optimization Agent.
Specializes in electricity tariff modeling, time-of-day (ToD) expenditure analysis,
slab rate comparisons, and financial savings quantification.
"""

from typing import Dict, Any, Optional
import pandas as pd
from services.optimization import calculate_energy_costs, optimize_appliance_schedule
from services.llm_service import llm_service
from utils.config import TariffConfig
from utils.logging_config import logger

class CostAgent:
    """Agent responsible for tariff modeling and utility expenditure optimization."""

    def __init__(self):
        self.name = "Cost Optimization Agent"
        self.role = "Tariff Modeling & Bill Optimization"

    def process(
        self,
        energy_df: pd.DataFrame,
        appliances_df: Optional[pd.DataFrame] = None,
        tariff: Optional[TariffConfig] = None,
        call_llm: bool = True
    ) -> Dict[str, Any]:
        """
        Calculates current tariff costs, compares with optimized load-shifting costs,
        and provides transparent financial projections.
        """
        logger.info(f"[{self.name}] Modeling electricity tariffs and financial savings...")
        
        if tariff is None:
            tariff = TariffConfig()

        cost_metrics = calculate_energy_costs(energy_df, tariff)
        sym = tariff.currency_symbol

        # Optimization comparison
        if appliances_df is not None and not appliances_df.empty:
            app_opt = optimize_appliance_schedule(appliances_df, tariff)
            cur_monthly = app_opt["total_current_monthly_cost"]
            opt_monthly = app_opt["total_optimized_monthly_cost"]
            savings_monthly = app_opt["total_monthly_savings"]
            savings_pct = app_opt["savings_percentage"]
        else:
            # Fallback estimation based on time-of-day shifting 30% of peak load
            peak_shift_kwh = cost_metrics["peak_kwh"] * 0.35
            rate_delta = tariff.peak_rate_per_kwh - tariff.off_peak_rate_per_kwh
            savings_monthly = (peak_shift_kwh * rate_delta) / cost_metrics["total_days_analyzed"] * 30.0
            cur_monthly = cost_metrics["monthly_projected_cost"]
            opt_monthly = max(0.0, cur_monthly - savings_monthly)
            savings_pct = (savings_monthly / cur_monthly * 100) if cur_monthly > 0 else 0.0

        fallback_financial_summary = (
            f"• **Current Projected Monthly Bill**: {sym}{cur_monthly:.2f} "
            f"(including {sym}{tariff.fixed_charge_per_month:.2f} fixed meter charge).\n"
            f"• **Optimized Projected Monthly Bill**: {sym}{opt_monthly:.2f}.\n"
            f"• **Projected Financial Savings**: **{sym}{savings_monthly:.2f} / month** "
            f"(~{savings_pct:.1f}% reduction).\n"
            f"• **Peak Tariff Impact**: Currently {sym}{cost_metrics['peak_cost']:.2f} is spent during peak hours "
            f"at {sym}{tariff.peak_rate_per_kwh}/kWh compared to off-peak rate of {sym}{tariff.off_peak_rate_per_kwh}/kWh.\n"
            f"• **Disclaimer**: Figures reflect analytical projections based on simulated/uploaded usage and configured tariffs. "
            f"Actual utility bills may vary with taxes, surcharges, and utility power-factor penalties."
        )

        if call_llm:
            prompt = (
                f"You are the Cost Optimization Agent. Present an executive financial summary for electricity expenses:\n"
                f"Current Monthly Estimate: {sym}{cur_monthly:.2f}\n"
                f"Optimized Monthly Estimate: {sym}{opt_monthly:.2f}\n"
                f"Monthly Savings: {sym}{savings_monthly:.2f} ({savings_pct:.1f}%)\n"
                f"Peak Rate: {sym}{tariff.peak_rate_per_kwh}/kWh vs Off-Peak Rate: {sym}{tariff.off_peak_rate_per_kwh}/kWh\n"
                f"Highlight practical financial takeaways clearly."
            )
            ai_summary = llm_service.generate_completion(
                prompt=prompt,
                system_prompt="You are a utility tariff and financial analyst.",
                fallback_text=fallback_financial_summary
            )
        else:
            ai_summary = fallback_financial_summary

        return {
            "agent": self.name,
            "role": self.role,
            "status": "success",
            "currency": tariff.currency,
            "currency_symbol": sym,
            "current_monthly_cost": round(cur_monthly, 2),
            "optimized_monthly_cost": round(opt_monthly, 2),
            "monthly_savings": round(savings_monthly, 2),
            "savings_percentage": round(savings_pct, 1),
            "cost_metrics": cost_metrics,
            "ai_summary": ai_summary
        }
