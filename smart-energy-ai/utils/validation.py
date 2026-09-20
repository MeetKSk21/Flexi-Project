"""
Validation and data hygiene utilities for SmartEnergy AI.
Performs strict schema validation, bounds checking, and CSV sanitization.
"""

from pathlib import Path
from typing import Tuple, Dict, Any, Optional
import pandas as pd
import numpy as np
from utils.logging_config import logger

REQUIRED_MINIMAL_COLUMNS = ["timestamp", "energy_kwh"]
OPTIONAL_RECOGNIZED_COLUMNS = ["power_kw", "voltage", "temperature", "hour", "day_of_week", "is_weekend"]

class DataValidationError(Exception):
    """Raised when uploaded or provided energy data fails integrity checks."""
    pass

def validate_uploaded_file(file_path: str, max_size_mb: int = 15) -> Path:
    """
    Validates file existence, extension, and size limits to prevent DoS or unsafe files.
    """
    path = Path(file_path)
    if not path.exists():
        raise DataValidationError(f"File does not exist: {file_path}")
    
    if path.suffix.lower() not in [".csv"]:
        raise DataValidationError(f"Invalid file type '{path.suffix}'. Only .csv files are supported.")
    
    file_size_mb = path.stat().st_size / (1024 * 1024)
    if file_size_mb > max_size_mb:
        raise DataValidationError(f"File size ({file_size_mb:.1f} MB) exceeds maximum allowed {max_size_mb} MB.")
    
    return path

def clean_and_validate_energy_dataframe(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Validates, sanitizes, and prepares an energy consumption DataFrame.
    
    Checks:
    - Non-empty dataframe
    - Required columns present ('timestamp' and 'energy_kwh')
    - Timestamp parsing and sorting
    - Non-negative energy values
    - Handling missing values
    - Deriving hour, day_of_week, and is_weekend if absent
    
    Returns:
        Tuple[pd.DataFrame, Dict[str, Any]]: Cleaned dataframe and metadata summary.
    """
    if df is None or df.empty:
        raise DataValidationError("The dataset is empty. Please provide a CSV with valid records.")
    
    # Strip whitespace from column names and lowercase
    df = df.copy()
    df.columns = [str(c).strip().lower() for c in df.columns]
    
    # Check required columns
    missing_cols = [col for col in REQUIRED_MINIMAL_COLUMNS if col not in df.columns]
    if missing_cols:
        raise DataValidationError(
            f"Missing required column(s): {missing_cols}. "
            f"Your CSV must include at least: {REQUIRED_MINIMAL_COLUMNS}."
        )
    
    # Sanitize and parse timestamps
    try:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    except Exception as e:
        raise DataValidationError(f"Failed to parse 'timestamp' column: {str(e)}")
    
    invalid_dates_count = df["timestamp"].isna().sum()
    if invalid_dates_count > 0:
        logger.warning(f"Dropping {invalid_dates_count} records with invalid timestamp format.")
        df = df.dropna(subset=["timestamp"])
        
    if df.empty:
        raise DataValidationError("All rows had invalid timestamp values.")

    # Sort chronologically and drop duplicates
    initial_rows = len(df)
    df = df.drop_duplicates(subset=["timestamp"]).sort_values("timestamp").reset_index(drop=True)
    duplicates_removed = initial_rows - len(df)

    # Convert numeric fields
    for col in ["energy_kwh", "power_kw", "voltage", "temperature"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # Validate energy_kwh bounds: strictly non-negative
    if (df["energy_kwh"] < 0).any():
        negative_count = (df["energy_kwh"] < 0).sum()
        logger.warning(f"Found {negative_count} negative energy readings. Clipping to 0.0.")
        df.loc[df["energy_kwh"] < 0, "energy_kwh"] = 0.0

    # Missing value imputation for energy_kwh
    if df["energy_kwh"].isna().any():
        df["energy_kwh"] = df["energy_kwh"].interpolate(method="linear").fillna(0.0)

    # If power_kw is missing or not provided, approximate using 1-hour intervals: kWh ≈ kW
    if "power_kw" not in df.columns or df["power_kw"].isna().all():
        df["power_kw"] = df["energy_kwh"]
    else:
        df["power_kw"] = df["power_kw"].fillna(df["energy_kwh"])

    # Feature extraction if not already present
    df["hour"] = df["timestamp"].dt.hour
    df["day_of_week"] = df["timestamp"].dt.day_name()
    df["is_weekend"] = df["timestamp"].dt.dayofweek.isin([5, 6]).astype(int)
    df["date"] = df["timestamp"].dt.date.astype(str)

    metadata = {
        "total_records": len(df),
        "start_time": str(df["timestamp"].min()),
        "end_time": str(df["timestamp"].max()),
        "duplicates_removed": duplicates_removed,
        "features_present": list(df.columns)
    }

    return df, metadata

def load_and_validate_csv(file_path: str) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Loads a CSV safely from disk and applies validation."""
    path = validate_uploaded_file(file_path)
    try:
        # Read with limited row check to prevent memory bombs
        df = pd.read_csv(path, nrows=50000)
    except Exception as e:
        raise DataValidationError(f"Unable to read CSV file: {str(e)}")
    
    return clean_and_validate_energy_dataframe(df)
