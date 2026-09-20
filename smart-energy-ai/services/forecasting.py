"""
Machine Learning Forecasting Service for SmartEnergy AI.
Implements feature engineering, chronological train/test splitting, Random Forest regression,
and rigorous evaluation using MAE, RMSE, and MAPE metrics.
"""

from typing import Dict, Any, List, Tuple
import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

def create_forecasting_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
    """
    Creates temporal and autoregressive lag features for time-series forecasting.
    
    Features:
    - hour (0-23)
    - is_weekend (0 or 1)
    - lag_1: Consumption 1 hour prior
    - lag_2: Consumption 2 hours prior
    - lag_24: Consumption same hour yesterday
    - roll_mean_6: 6-hour moving average
    - roll_mean_24: 24-hour daily moving average
    """
    data = df.copy()
    data = data.sort_values("timestamp").reset_index(drop=True)

    data["lag_1"] = data["energy_kwh"].shift(1)
    data["lag_2"] = data["energy_kwh"].shift(2)
    data["lag_24"] = data["energy_kwh"].shift(24)
    data["roll_mean_6"] = data["energy_kwh"].rolling(window=6).mean()
    data["roll_mean_24"] = data["energy_kwh"].rolling(window=24).mean()

    # Optional: include temperature if available
    feature_cols = ["hour", "is_weekend", "lag_1", "lag_2", "lag_24", "roll_mean_6", "roll_mean_24"]
    if "temperature" in data.columns and not data["temperature"].isna().all():
        feature_cols.append("temperature")

    # Drop initial rows with NaN due to lagging
    data_clean = data.dropna(subset=feature_cols + ["energy_kwh"]).reset_index(drop=True)
    return data_clean, feature_cols

def calculate_mape(y_true: np.ndarray, y_pred: np.ndarray, epsilon: float = 0.05) -> float:
    """Calculates Mean Absolute Percentage Error safely without division by zero."""
    y_true_safe = np.maximum(y_true, epsilon)
    return float(np.mean(np.abs((y_true - y_pred) / y_true_safe)) * 100)

def train_and_forecast_energy(
    df: pd.DataFrame,
    forecast_horizon_hours: int = 24
) -> Dict[str, Any]:
    """
    Trains a Random Forest Regressor on historical energy data, evaluates its accuracy,
    and projects upcoming hourly demand.
    
    Parameters:
        df (pd.DataFrame): Validated historical records.
        forecast_horizon_hours (int): Number of future hours to predict (default: 24).
        
    Returns:
        Dict[str, Any]: Structured results containing metrics, forecast profile, and model metadata.
    """
    if df is None or len(df) < 50:
        return {
            "status": "error",
            "message": "Insufficient data. At least 50 hourly records are required for training."
        }

    featured_df, feature_cols = create_forecasting_features(df)
    if len(featured_df) < 30:
        return {
            "status": "error",
            "message": "Not enough valid lagged records to train model."
        }

    # Chronological train/test split (80% train, 20% test)
    split_idx = int(len(featured_df) * 0.8)
    train_df = featured_df.iloc[:split_idx]
    test_df = featured_df.iloc[split_idx:]

    X_train, y_train = train_df[feature_cols], train_df["energy_kwh"]
    X_test, y_test = test_df[feature_cols], test_df["energy_kwh"]

    # Model: Random Forest (n_estimators=75, max_depth=10 for rapid, reliable inference on laptops)
    model = RandomForestRegressor(n_estimators=75, max_depth=10, random_state=42, n_jobs=1)
    model.fit(X_train, y_train)

    # Evaluation on holdout test set
    y_pred_test = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred_test))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred_test)))
    mape = calculate_mape(y_test.values, y_pred_test)

    # Iterative multi-step forecasting for the future horizon
    last_timestamp = pd.to_datetime(df["timestamp"].iloc[-1])
    recent_series = list(df["energy_kwh"].iloc[-30:].values)
    
    # Estimate baseline temp if present
    avg_temp = float(df["temperature"].mean()) if "temperature" in df.columns else 26.0

    future_records = []
    current_ts = last_timestamp

    for step in range(1, forecast_horizon_hours + 1):
        step_ts = current_ts + timedelta(hours=step)
        step_hour = step_ts.hour
        step_is_weekend = 1 if step_ts.dayofweek in [5, 6] else 0

        # Construct features based on lagged buffer
        lag_1 = recent_series[-1]
        lag_2 = recent_series[-2]
        lag_24 = recent_series[-24] if len(recent_series) >= 24 else recent_series[0]
        roll_6 = float(np.mean(recent_series[-6:]))
        roll_24 = float(np.mean(recent_series[-24:]))

        row_feat = [step_hour, step_is_weekend, lag_1, lag_2, lag_24, roll_6, roll_24]
        if "temperature" in feature_cols:
            simulated_temp = avg_temp + 5.0 * np.sin(np.pi * (step_hour - 8) / 12)
            row_feat.append(simulated_temp)

        X_future = pd.DataFrame([row_feat], columns=feature_cols)
        pred_val = max(0.05, float(model.predict(X_future)[0]))
        pred_val = round(pred_val, 3)

        recent_series.append(pred_val)
        future_records.append({
            "timestamp": step_ts.strftime("%Y-%m-%d %H:%M:%S"),
            "hour": step_hour,
            "predicted_kwh": pred_val,
            "is_weekend": step_is_weekend
        })

    future_df = pd.DataFrame(future_records)
    total_forecast_kwh = float(future_df["predicted_kwh"].sum())
    peak_forecast_row = future_df.loc[future_df["predicted_kwh"].idxmax()]

    # Feature importances
    importances = {k: round(float(v), 3) for k, v in zip(feature_cols, model.feature_importances_)}

    return {
        "status": "success",
        "model_name": "Random Forest Time-Series Regressor",
        "features_used": feature_cols,
        "feature_importances": importances,
        "training_samples": len(train_df),
        "test_samples": len(test_df),
        "mae": round(mae, 3),
        "rmse": round(rmse, 3),
        "mape": round(mape, 2),
        "horizon_hours": forecast_horizon_hours,
        "total_predicted_kwh": round(total_forecast_kwh, 2),
        "peak_predicted_hour": int(peak_forecast_row["hour"]),
        "peak_predicted_kwh": round(float(peak_forecast_row["predicted_kwh"]), 3),
        "peak_predicted_time": str(peak_forecast_row["timestamp"]),
        "forecast_records": future_records
    }
