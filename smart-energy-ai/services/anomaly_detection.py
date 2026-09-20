"""
Anomaly Detection Service for SmartEnergy AI.
Employs diurnal-aware statistical thresholding (Hour-specific Z-Score & IQR bounds)
and scikit-learn Isolation Forest to detect abnormal load profiles and consumption surges.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

def detect_energy_anomalies(
    df: pd.DataFrame,
    contamination: float = 0.03,
    z_threshold: float = 2.8
) -> Dict[str, Any]:
    """
    Identifies consumption anomalies using a hybrid diurnal statistical and Isolation Forest approach.

    Parameters:
        df (pd.DataFrame): Validated historical energy dataframe.
        contamination (float): Expected anomaly fraction for Isolation Forest.
        z_threshold (float): Hourly Z-score threshold for extreme deviations.

    Returns:
        Dict[str, Any]: Detailed dictionary of detected anomalies, severity levels, and context.
    """
    if df is None or len(df) < 24:
        return {
            "status": "insufficient_data",
            "anomaly_count": 0,
            "anomalies": []
        }

    data = df.copy().reset_index(drop=True)

    # 1. Compute diurnal baseline statistics (Hour-of-day mean and std)
    hourly_stats = data.groupby("hour")["energy_kwh"].agg(["mean", "std", "median"]).reset_index()
    hourly_stats.columns = ["hour", "hour_mean", "hour_std", "hour_median"]
    hourly_stats["hour_std"] = hourly_stats["hour_std"].replace(0, 0.05).fillna(0.05)

    data = data.merge(hourly_stats, on="hour", how="left")
    data["z_score"] = (data["energy_kwh"] - data["hour_mean"]) / data["hour_std"]

    # 2. Isolation Forest algorithm
    features_for_if = ["energy_kwh", "hour", "is_weekend"]
    if "temperature" in data.columns:
        features_for_if.append("temperature")

    iso_forest = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=100
    )
    iso_labels = iso_forest.fit_predict(data[features_for_if].fillna(0))
    data["is_iso_outlier"] = (iso_labels == -1).astype(int)

    # Combine statistical surge & isolation forest
    data["is_anomaly"] = ((data["z_score"].abs() >= z_threshold) | (data["is_iso_outlier"] == 1)).astype(int)

    anomalous_rows = data[data["is_anomaly"] == 1].copy()

    anomaly_records = []
    for _, row in anomalous_rows.iterrows():
        measured = float(row["energy_kwh"])
        h_mean = float(row["hour_mean"])
        h_std = float(row["hour_std"])
        z = float(row["z_score"])
        hour = int(row["hour"])
        ts = str(row["timestamp"])

        normal_min = max(0.0, round(h_mean - 2.0 * h_std, 2))
        normal_max = round(h_mean + 2.0 * h_std, 2)

        # Categorize type and severity
        if z >= 3.5:
            severity = "Critical"
        elif z >= 2.5:
            severity = "High"
        elif z >= 1.8 or row["is_iso_outlier"] == 1:
            severity = "Medium"
        else:
            severity = "Low"

        # Contextual explanation
        if 0 <= hour <= 5 and z > 1.8:
            context = f"Late-night demand surge ({measured:.2f} kWh). Normal night baseline is ~{h_mean:.2f} kWh."
            possible_cause = "Appliance left running overnight (e.g. AC set low, continuous water heater, or electronics)."
        elif z >= 3.0:
            context = f"Sudden extreme demand spike ({measured:.2f} kWh vs typical {h_mean:.2f} kWh)."
            possible_cause = "Multiple high-wattage appliances operating concurrently."
        elif z <= -2.0:
            context = f"Unusually low demand ({measured:.2f} kWh). Expected ~{h_mean:.2f} kWh."
            possible_cause = "Possible absence from premises, power outage, or meter disconnection."
        else:
            context = f"Statistical outlier detected by Isolation Forest ({measured:.2f} kWh at hour {hour:02d}:00)."
            possible_cause = "Uncharacteristic daily usage pattern."

        # Check voltage irregularity if voltage column exists
        voltage_note = ""
        if "voltage" in row and not pd.isna(row["voltage"]):
            v = float(row["voltage"])
            if v < 215.0:
                voltage_note = f" Note: Correlated with low grid voltage ({v:.1f}V)."

        anomaly_records.append({
            "timestamp": ts,
            "hour": hour,
            "measured_kwh": round(measured, 3),
            "expected_mean_kwh": round(h_mean, 3),
            "normal_range": f"{normal_min:.2f} - {normal_max:.2f} kWh",
            "z_score": round(z, 2),
            "severity": severity,
            "explanation": context + voltage_note,
            "possible_cause": possible_cause,
            "recommended_action": "Check whether heavy appliances were inadvertently operating. Do not perform physical electrical modifications."
        })

    # Summary metrics
    critical_count = sum(1 for a in anomaly_records if a["severity"] == "Critical")
    high_count = sum(1 for a in anomaly_records if a["severity"] == "High")
    night_count = sum(1 for a in anomaly_records if 0 <= a["hour"] <= 5)

    return {
        "status": "success",
        "method": "Hybrid Diurnal Z-Score (Threshold: 2.8) & Isolation Forest (Contamination: 3%)",
        "total_records_evaluated": len(data),
        "anomaly_count": len(anomaly_records),
        "anomaly_percentage": round(len(anomaly_records) / len(data) * 100, 2),
        "critical_count": critical_count,
        "high_count": high_count,
        "night_anomalies_count": night_count,
        "anomalies": anomaly_records
    }
