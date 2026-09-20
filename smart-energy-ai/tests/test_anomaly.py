"""
Unit Tests for Anomaly Detection and Safety Auditing.
"""

import pytest
import pandas as pd
import numpy as np
from services.anomaly_detection import detect_energy_anomalies
from agents.anomaly_safety_agent import AnomalySafetyAgent

@pytest.fixture
def baseline_with_spike_df():
    # 48 hours baseline
    timestamps = pd.date_range("2026-08-01 00:00:00", periods=48, freq="1h")
    values = [0.4 if ts.hour < 6 else 1.2 for ts in timestamps]
    df = pd.DataFrame({
        "timestamp": timestamps,
        "energy_kwh": values,
        "hour": [ts.hour for ts in timestamps],
        "is_weekend": [0] * 48
    })
    # Inject severe night spike at 03:00 on second day
    df.loc[27, "energy_kwh"] = 4.8
    return df

def test_anomaly_detection_identifies_spike(baseline_with_spike_df):
    result = detect_energy_anomalies(baseline_with_spike_df)
    assert result["status"] == "success"
    assert result["anomaly_count"] >= 1
    # Check that the injected timestamp is flagged
    injected_ts = str(baseline_with_spike_df.loc[27, "timestamp"])
    flagged_timestamps = [a["timestamp"] for a in result["anomalies"]]
    assert injected_ts in flagged_timestamps

def test_anomaly_agent_process(baseline_with_spike_df):
    agent = AnomalySafetyAgent()
    out = agent.process(baseline_with_spike_df)
    assert out["status"] == "success"
    assert "ai_explanation" in out
    assert out["anomaly_count"] >= 1
