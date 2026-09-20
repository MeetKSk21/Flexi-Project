"""
Unit Tests for Cost Optimization and Appliance Load Shifting.
"""

import pytest
import pandas as pd
from utils.config import TariffConfig
from services.optimization import calculate_energy_costs, optimize_appliance_schedule
from agents.cost_agent import CostAgent
from agents.appliance_agent import ApplianceAgent

@pytest.fixture
def sample_appliances_df():
    data = [
        {"appliance_name": "AC", "rated_power_kw": 1.5, "typical_hours_per_day": 6.0, "flexible": True},
        {"appliance_name": "Fridge", "rated_power_kw": 0.2, "typical_hours_per_day": 24.0, "flexible": False},
        {"appliance_name": "Washing Machine", "rated_power_kw": 1.0, "typical_hours_per_day": 1.5, "flexible": True}
    ]
    return pd.DataFrame(data)

def test_cost_calculation():
    timestamps = pd.date_range("2026-08-01 00:00:00", periods=24, freq="1h")
    df = pd.DataFrame({
        "timestamp": timestamps,
        "energy_kwh": [1.0] * 24,
        "date": ["2026-08-01"] * 24,
        "hour": [ts.hour for ts in timestamps]
    })
    tariff = TariffConfig(base_rate_per_kwh=7.0, peak_rate_per_kwh=10.0, off_peak_rate_per_kwh=5.0)
    costs = calculate_energy_costs(df, tariff)
    assert costs["total_cost"] > 0
    assert costs["peak_cost"] > 0
    assert costs["off_peak_cost"] > 0

def test_appliance_optimization(sample_appliances_df):
    opt = optimize_appliance_schedule(sample_appliances_df)
    assert opt["status"] == "success"
    assert opt["total_monthly_savings"] > 0
    assert opt["savings_percentage"] > 0
    assert len(opt["top_consumers"]) > 0

def test_cost_agent_execution(sample_appliances_df):
    timestamps = pd.date_range("2026-08-01 00:00:00", periods=24, freq="1h")
    df = pd.DataFrame({
        "timestamp": timestamps,
        "energy_kwh": [1.0] * 24,
        "date": ["2026-08-01"] * 24,
        "hour": [ts.hour for ts in timestamps]
    })
    agent = CostAgent()
    res = agent.process(df, sample_appliances_df)
    assert res["status"] == "success"
    assert res["monthly_savings"] > 0
    assert "ai_summary" in res
