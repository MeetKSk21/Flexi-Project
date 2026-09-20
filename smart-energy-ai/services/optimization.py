"""
Energy and Cost Optimization Engine for SmartEnergy AI.
Calculates tariff-based electricity expenses, analyzes appliance breakdown,
and models load-shifting strategies to minimize peak tariff expenditures.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from utils.config import TariffConfig

def calculate_energy_costs(
    df: pd.DataFrame,
    tariff: Optional[TariffConfig] = None
) -> Dict[str, Any]:
    """
    Computes deterministic electricity bills using flat, time-of-day (ToD), and tiered slab tariffs.
    
    Parameters:
        df (pd.DataFrame): Validated energy consumption dataframe.
        tariff (TariffConfig): Tariff pricing parameters.
        
    Returns:
        Dict[str, Any]: Detailed cost breakdowns.
    """
    if tariff is None:
        tariff = TariffConfig()

    total_kwh = float(df["energy_kwh"].sum())
    total_days = max(1, len(df["date"].unique()))

    # Categorize hours into Peak, Off-Peak, and Standard
    is_peak = df["hour"].isin(tariff.peak_hours)
    is_off_peak = df["hour"].isin(tariff.off_peak_hours)
    is_standard = ~(is_peak | is_off_peak)

    kwh_peak = float(df.loc[is_peak, "energy_kwh"].sum())
    kwh_off_peak = float(df.loc[is_off_peak, "energy_kwh"].sum())
    kwh_standard = float(df.loc[is_standard, "energy_kwh"].sum())

    # Time-of-Day (ToD) bill calculation
    cost_peak = kwh_peak * tariff.peak_rate_per_kwh
    cost_off_peak = kwh_off_peak * tariff.off_peak_rate_per_kwh
    cost_standard = kwh_standard * tariff.base_rate_per_kwh

    subtotal_energy_cost = cost_peak + cost_off_peak + cost_standard
    fixed_charge_prorated = (tariff.fixed_charge_per_month / 30.0) * total_days
    total_bill = subtotal_energy_cost + fixed_charge_prorated

    # Prorated monthly projections (standard 30-day month)
    daily_avg_kwh = total_kwh / total_days
    monthly_projected_kwh = daily_avg_kwh * 30.0
    daily_avg_cost = total_bill / total_days
    monthly_projected_cost = daily_avg_cost * 30.0

    # Tiered / Slab cost calculation (for reference)
    slab_cost = 0.0
    remaining_kwh = monthly_projected_kwh
    prev_tier = 0.0
    for slab in tariff.slab_rates:
        tier_cap = slab["max_kwh"]
        tier_rate = slab["rate"]
        tier_span = tier_cap - prev_tier
        if remaining_kwh > tier_span:
            slab_cost += tier_span * tier_rate
            remaining_kwh -= tier_span
            prev_tier = tier_cap
        else:
            slab_cost += remaining_kwh * tier_rate
            break
    slab_cost += tariff.fixed_charge_per_month

    return {
        "currency": tariff.currency,
        "currency_symbol": tariff.currency_symbol,
        "total_kwh_analyzed": round(total_kwh, 2),
        "total_days_analyzed": total_days,
        "fixed_charge": round(fixed_charge_prorated, 2),
        "total_cost": round(total_bill, 2),
        "daily_average_cost": round(daily_avg_cost, 2),
        "monthly_projected_cost": round(monthly_projected_cost, 2),
        "peak_kwh": round(kwh_peak, 2),
        "peak_cost": round(cost_peak, 2),
        "off_peak_kwh": round(kwh_off_peak, 2),
        "off_peak_cost": round(cost_off_peak, 2),
        "standard_kwh": round(kwh_standard, 2),
        "standard_cost": round(cost_standard, 2),
        "slab_monthly_estimated_cost": round(slab_cost, 2),
        "peak_rate": tariff.peak_rate_per_kwh,
        "off_peak_rate": tariff.off_peak_rate_per_kwh,
        "base_rate": tariff.base_rate_per_kwh
    }

def optimize_appliance_schedule(
    appliances_df: pd.DataFrame,
    tariff: Optional[TariffConfig] = None
) -> Dict[str, Any]:
    """
    Analyzes appliances, models load-shifting for flexible devices, and projects financial savings.
    """
    if tariff is None:
        tariff = TariffConfig()

    app_df = appliances_df.copy()
    
    # Calculate daily and monthly consumption per appliance
    app_df["daily_kwh"] = app_df["rated_power_kw"] * app_df["typical_hours_per_day"]
    app_df["monthly_kwh"] = app_df["daily_kwh"] * 30.0

    # Baseline cost assuming current unmanaged operation (mostly peak/standard mix)
    # Default unoptimized: 45% during peak hours, 55% during standard hours
    unmanaged_blended_rate = (0.45 * tariff.peak_rate_per_kwh) + (0.55 * tariff.base_rate_per_kwh)
    app_df["current_monthly_cost"] = app_df["monthly_kwh"] * unmanaged_blended_rate

    # Optimized cost: Flexible loads shifted to off-peak hours
    optimized_costs = []
    recommended_schedules = []
    potential_savings_kwh = []

    for _, row in app_df.iterrows():
        is_flexible = bool(row["flexible"])
        monthly_kwh = float(row["monthly_kwh"])
        current_cost = float(row["current_monthly_cost"])

        if is_flexible:
            # Shift 80% of flexible load to off-peak hours
            opt_rate = (0.80 * tariff.off_peak_rate_per_kwh) + (0.20 * tariff.base_rate_per_kwh)
            # Energy conservation benefit (e.g. eco-mode or temperature setpoint optimization: 8% reduction)
            efficiency_gain = 0.08
            opt_kwh = monthly_kwh * (1.0 - efficiency_gain)
            opt_cost = opt_kwh * opt_rate
            saved_kwh = monthly_kwh * efficiency_gain
            schedule = f"Shift flexible operation to off-peak window ({tariff.off_peak_hours[0]}:00 - {tariff.off_peak_hours[-1]+1}:00) or solar midday hours."
        else:
            # Inflexible loads: apply minor standby efficiency improvement (3%)
            efficiency_gain = 0.03
            opt_kwh = monthly_kwh * (1.0 - efficiency_gain)
            opt_cost = opt_kwh * unmanaged_blended_rate
            saved_kwh = monthly_kwh * efficiency_gain
            schedule = "Fixed duty cycle. Enable power-saving/eco standby mode when idle."

        optimized_costs.append(round(opt_cost, 2))
        recommended_schedules.append(schedule)
        potential_savings_kwh.append(round(saved_kwh, 2))

    app_df["optimized_monthly_cost"] = optimized_costs
    app_df["monthly_savings_cost"] = round(app_df["current_monthly_cost"] - app_df["optimized_monthly_cost"], 2)
    app_df["recommended_schedule"] = recommended_schedules

    total_current_cost = float(app_df["current_monthly_cost"].sum())
    total_optimized_cost = float(app_df["optimized_monthly_cost"].sum())
    total_savings_cost = total_current_cost - total_optimized_cost
    savings_pct = (total_savings_cost / total_current_cost * 100) if total_current_cost > 0 else 0.0

    total_current_kwh = float(app_df["monthly_kwh"].sum())
    total_saved_kwh = float(sum(potential_savings_kwh))

    # Top energy consuming appliances
    top_consumers = app_df.sort_values("monthly_kwh", ascending=False).head(4)[
        ["appliance_name", "rated_power_kw", "monthly_kwh", "current_monthly_cost"]
    ].to_dict(orient="records")

    return {
        "status": "success",
        "currency": tariff.currency,
        "currency_symbol": tariff.currency_symbol,
        "total_current_monthly_cost": round(total_current_cost, 2),
        "total_optimized_monthly_cost": round(total_optimized_cost, 2),
        "total_monthly_savings": round(total_savings_cost, 2),
        "savings_percentage": round(savings_pct, 1),
        "total_monthly_kwh": round(total_current_kwh, 2),
        "total_monthly_saved_kwh": round(total_saved_kwh, 2),
        "top_consumers": top_consumers,
        "appliance_table": app_df.to_dict(orient="records")
    }
