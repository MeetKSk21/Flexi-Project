"""
Unit Tests for Deterministic Energy Calculator Engine.
"""

import pytest
import pandas as pd
from services.energy_calculator import compute_energy_metrics
from agents.monitoring_agent import MonitoringAgent

@pytest.fixture
def sample_energy_df():
    # 24-hour sample dataset
    timestamps = pd.date_range("2026-08-01 00:00:00", periods=24, freq="1h")
    values = [0.5] * 6 + [1.8] * 3 + [1.0] * 8 + [2.4] * 5 + [0.8] * 2
    df = pd.DataFrame({
        "timestamp": timestamps,
        "energy_kwh": values,
        "date": [str(ts.date()) for ts in timestamps],
        "hour": [ts.hour for ts in timestamps],
        "is_weekend": [0] * 24
    })
    return df

def test_compute_energy_metrics(sample_energy_df):
    metrics = compute_energy_metrics(sample_energy_df)
    assert "total_consumption" in metrics
    assert "daily_average" in metrics
    assert "peak_consumption" in metrics
    assert metrics["peak_consumption"] == 2.4
    assert metrics["total_consumption"] > 0
    assert isinstance(metrics["key_findings"], list)
    assert len(metrics["key_findings"]) >= 4

def test_monitoring_agent_execution(sample_energy_df):
    agent = MonitoringAgent()
    result = agent.process(sample_energy_df)
    assert result["status"] == "success"
    assert result["agent"] == "Energy Monitoring & Analysis Agent"
    assert "ai_summary" in result
    assert result["total_consumption"] > 0
