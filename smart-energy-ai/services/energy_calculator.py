"""
Deterministic Energy Calculation Engine for SmartEnergy AI.
Computes comprehensive statistical and temporal metrics from energy time-series.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np

def compute_energy_metrics(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes deterministic statistical summaries from validated energy records.
    
    Parameters:
        df (pd.DataFrame): Validated dataframe containing 'timestamp' and 'energy_kwh'.
        
    Returns:
        Dict[str, Any]: Detailed metrics dictionary.
    """
    if df is None or df.empty:
        return {}

    energy_col = df["energy_kwh"]
    total_consumption = float(energy_col.sum())
    total_hours = len(df)
    avg_hourly = float(energy_col.mean())
    min_val = float(energy_col.min())
    max_val = float(energy_col.max())

    min_row = df.loc[energy_col.idxmin()]
    max_row = df.loc[energy_col.idxmax()]

    # Daily aggregation
    daily_totals = df.groupby("date")["energy_kwh"].sum()
    daily_avg = float(daily_totals.mean())
    daily_max = float(daily_totals.max())
    daily_min = float(daily_totals.min())

    # Hourly diurnal profile (0-23 hours)
    hourly_profile = df.groupby("hour")["energy_kwh"].mean().to_dict()
    peak_hour = int(max(hourly_profile, key=hourly_profile.get))
    peak_hour_avg = float(hourly_profile[peak_hour])
    trough_hour = int(min(hourly_profile, key=hourly_profile.get))
    trough_hour_avg = float(hourly_profile[trough_hour])

    # Weekday vs Weekend analysis
    weekday_df = df[df["is_weekend"] == 0]
    weekend_df = df[df["is_weekend"] == 1]
    weekday_avg_hourly = float(weekday_df["energy_kwh"].mean()) if not weekday_df.empty else avg_hourly
    weekend_avg_hourly = float(weekend_df["energy_kwh"].mean()) if not weekend_df.empty else avg_hourly
    weekend_diff_pct = ((weekend_avg_hourly - weekday_avg_hourly) / weekday_avg_hourly * 100) if weekday_avg_hourly > 0 else 0.0

    # Trend detection (simple linear regression slope over chronological index)
    x = np.arange(len(df))
    y = energy_col.values
    slope, _ = np.polyfit(x, y, 1)
    if slope > 0.0005:
        trend_label = "Increasing (+)"
    elif slope < -0.0005:
        trend_label = "Decreasing (-)"
    else:
        trend_label = "Stable / Steady"

    # Latest reading
    latest_record = df.iloc[-1]
    latest_consumption = float(latest_record["energy_kwh"])
    latest_timestamp = str(latest_record["timestamp"])

    key_findings = [
        f"Overall total consumption: {total_consumption:.2f} kWh across {total_hours} hourly records ({len(daily_totals)} days).",
        f"Daily average consumption is {daily_avg:.2f} kWh/day (Min: {daily_min:.2f} kWh, Max: {daily_max:.2f} kWh).",
        f"System peak observed at hour {peak_hour:02d}:00 with an average demand of {peak_hour_avg:.2f} kWh.",
        f"Base load trough occurs at hour {trough_hour:02d}:00 with average demand of {trough_hour_avg:.2f} kWh.",
        f"Weekend usage is {abs(weekend_diff_pct):.1f}% {'higher' if weekend_diff_pct >= 0 else 'lower'} than weekday usage.",
        f"Consumption trend is currently classified as {trend_label}."
    ]

    return {
        "total_consumption": round(total_consumption, 2),
        "average_consumption": round(avg_hourly, 3),
        "daily_average": round(daily_avg, 2),
        "daily_max": round(daily_max, 2),
        "daily_min": round(daily_min, 2),
        "peak_consumption": round(max_val, 3),
        "peak_timestamp": str(max_row["timestamp"]),
        "peak_period": f"{peak_hour:02d}:00 - {(peak_hour+1)%24:02d}:00",
        "trough_period": f"{trough_hour:02d}:00 - {(trough_hour+1)%24:02d}:00",
        "weekday_avg_hourly": round(weekday_avg_hourly, 3),
        "weekend_avg_hourly": round(weekend_avg_hourly, 3),
        "weekend_difference_pct": round(weekend_diff_pct, 1),
        "trend": trend_label,
        "latest_consumption": round(latest_consumption, 3),
        "latest_timestamp": latest_timestamp,
        "hourly_profile": {int(k): round(v, 3) for k, v in hourly_profile.items()},
        "key_findings": key_findings
    }
