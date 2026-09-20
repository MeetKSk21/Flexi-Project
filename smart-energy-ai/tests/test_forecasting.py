"""
Unit Tests for Machine Learning Forecasting Engine.
"""

import pytest
import pandas as pd
import numpy as np
from services.forecasting import train_and_forecast_energy, create_forecasting_features
from agents.forecasting_agent import ForecastingAgent

@pytest.fixture
def multi_day_df():
    # 72 hours of synthetic data
    timestamps = pd.date_range("2026-08-01 00:00:00", periods=72, freq="1h")
    hours = np.array([ts.hour for ts in timestamps])
    # Sinusoidal baseline
    kwh = 1.0 + 0.8 * np.sin(2 * np.pi * hours / 24) + np.random.normal(0, 0.05, len(timestamps))
    df = pd.DataFrame({
        "timestamp": timestamps,
        "energy_kwh": np.maximum(0.2, kwh),
        "hour": hours,
        "is_weekend": [1 if ts.dayofweek in [5, 6] else 0 for ts in timestamps],
        "temperature": 28.0 + 5.0 * np.sin(2 * np.pi * hours / 24)
    })
    return df

def test_feature_creation(multi_day_df):
    clean_df, feature_cols = create_forecasting_features(multi_day_df)
    assert "lag_1" in feature_cols
    assert "lag_24" in feature_cols
    assert "roll_mean_6" in feature_cols
    assert len(clean_df) > 0

def test_forecasting_service(multi_day_df):
    res = train_and_forecast_energy(multi_day_df, forecast_horizon_hours=24)
    assert res["status"] == "success"
    assert "mae" in res
    assert "rmse" in res
    assert "mape" in res
    assert res["mae"] >= 0
    assert len(res["forecast_records"]) == 24

def test_forecasting_agent(multi_day_df):
    agent = ForecastingAgent()
    out = agent.process(multi_day_df, horizon_hours=24)
    assert out["status"] == "success"
    assert out["agent"] == "Forecasting Agent"
    assert "ai_interpretation" in out
    assert out["total_predicted_kwh"] > 0
