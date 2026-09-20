"""
Realistic Synthetic Energy Consumption Data Generator for SmartEnergy AI.
Simulates realistic residential/office smart-meter readings over a configurable period.
Includes morning/evening peaks, weekend variations, temperature correlation, and annotated anomalies.
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_synthetic_energy_data(
    days: int = 45,
    freq: str = "1h",
    output_path: Path = None,
    seed: int = 42
) -> pd.DataFrame:
    """
    Generates synthetic smart-meter consumption data.

    Parameters:
        days (int): Number of days of historical data to simulate.
        freq (str): Time frequency (default '1h' for hourly readings).
        output_path (Path): File path to save CSV.
        seed (int): Random seed for reproducible demonstration.

    Returns:
        pd.DataFrame: Generated dataset.
    """
    np.random.seed(seed)
    start_date = datetime(2026, 8, 1, 0, 0, 0)
    timestamps = pd.date_range(start=start_date, periods=days * 24, freq=freq)

    records = []
    
    # Base baseline idle load (fridge, routers, standby devices in kW)
    base_idle = 0.25

    for ts in timestamps:
        hour = ts.hour
        day_of_week = ts.day_name()
        is_weekend = 1 if ts.dayofweek in [5, 6] else 0

        # Ambient temperature simulation (°C) with diurnal cycle (cooler at night, hot at 14:00)
        temp = 25.0 + 7.0 * np.sin(np.pi * (hour - 8) / 12) + np.random.normal(0, 0.8)

        # Baseline diurnal pattern multiplier
        if 0 <= hour < 6:
            # Deep night: minimum activity, idle load + slight fan/AC sleep mode
            load_factor = 0.35 + (0.15 if is_weekend else 0.05)
        elif 6 <= hour < 9:
            # Morning rush: Geyser, induction, kettle, lights
            load_factor = 1.30 if not is_weekend else 0.90
        elif 9 <= hour < 17:
            # Daytime: lower on weekdays (away at work/school), higher on weekends
            if is_weekend:
                load_factor = 1.20 + (0.25 if temp > 30 else 0.0)
            else:
                load_factor = 0.55 + (0.15 if temp > 30 else 0.0)
        elif 17 <= hour < 22:
            # Evening peak: TV, AC, cooking, family together
            load_factor = 1.85 + (0.30 if is_weekend else 0.15)
        else:
            # Late night winding down
            load_factor = 0.85

        # Calculate base active power in kW
        noise = np.random.normal(0, 0.08)
        power_kw = max(0.12, (base_idle + 1.2 * load_factor + noise))

        # Hourly energy in kWh = power_kw * 1 hour (for 1h frequency)
        energy_kwh = round(power_kw * 1.0, 3)

        # Voltage simulation (nominally 230V with slight drop during heavy load)
        voltage = round(230.0 - (power_kw * 1.8) + np.random.normal(0, 1.2), 1)

        records.append({
            "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
            "energy_kwh": energy_kwh,
            "power_kw": round(power_kw, 3),
            "voltage": voltage,
            "temperature": round(temp, 1),
            "hour": hour,
            "day_of_week": day_of_week,
            "is_weekend": is_weekend
        })

    df = pd.DataFrame(records)

    # Inject realistic, detectable anomalies for college demonstration
    # Anomaly 1: Unattended heavy appliance running during quiet early morning (Day 12, 02:00 to 04:00)
    idx_night_spike = 12 * 24 + 3
    if idx_night_spike < len(df):
        df.loc[idx_night_spike:idx_night_spike + 1, "energy_kwh"] *= 3.8
        df.loc[idx_night_spike:idx_night_spike + 1, "power_kw"] *= 3.8

    # Anomaly 2: Massive simultaneous load spike (Day 25, 19:00)
    idx_evening_surge = 25 * 24 + 19
    if idx_evening_surge < len(df):
        df.loc[idx_evening_surge, "energy_kwh"] = round(df.loc[idx_evening_surge, "energy_kwh"] * 2.4, 3)
        df.loc[idx_evening_surge, "power_kw"] = round(df.loc[idx_evening_surge, "power_kw"] * 2.4, 3)
        df.loc[idx_evening_surge, "voltage"] -= 14.5  # Distinct voltage dip

    # Anomaly 3: Prolonged unexpected daytime surge on weekday (Day 38, 11:00 to 14:00)
    idx_midday_leak = 38 * 24 + 11
    if idx_midday_leak + 3 < len(df):
        df.loc[idx_midday_leak:idx_midday_leak + 3, "energy_kwh"] *= 2.6
        df.loc[idx_midday_leak:idx_midday_leak + 3, "power_kw"] *= 2.6

    if output_path:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"Generated {len(df)} energy records at: {output_path.resolve()}")

    return df

if __name__ == "__main__":
    current_dir = Path(__file__).resolve().parent
    target_csv = current_dir / "energy_consumption.csv"
    generate_synthetic_energy_data(days=45, output_path=target_csv)
