"""
Unit Tests for Data Validation and Ingestion Pipeline.
"""

import pytest
import pandas as pd
from pathlib import Path
from utils.validation import (
    validate_uploaded_file,
    clean_and_validate_energy_dataframe,
    DataValidationError
)

def test_valid_energy_dataframe():
    data = {
        "timestamp": ["2026-08-01 00:00:00", "2026-08-01 01:00:00", "2026-08-01 02:00:00"],
        "energy_kwh": [1.2, 0.8, 0.6]
    }
    df = pd.DataFrame(data)
    clean_df, meta = clean_and_validate_energy_dataframe(df)
    assert len(clean_df) == 3
    assert "hour" in clean_df.columns
    assert "is_weekend" in clean_df.columns
    assert meta["total_records"] == 3

def test_missing_required_column():
    data = {
        "timestamp": ["2026-08-01 00:00:00"],
        "voltage": [230.0]
    }
    df = pd.DataFrame(data)
    with pytest.raises(DataValidationError) as excinfo:
        clean_and_validate_energy_dataframe(df)
    assert "Missing required column" in str(excinfo.value)

def test_negative_energy_clipping():
    data = {
        "timestamp": ["2026-08-01 00:00:00", "2026-08-01 01:00:00"],
        "energy_kwh": [-2.5, 1.4]
    }
    df = pd.DataFrame(data)
    clean_df, _ = clean_and_validate_energy_dataframe(df)
    assert clean_df["energy_kwh"].iloc[0] == 0.0
    assert clean_df["energy_kwh"].iloc[1] == 1.4

def test_empty_dataframe():
    df = pd.DataFrame()
    with pytest.raises(DataValidationError):
        clean_and_validate_energy_dataframe(df)

def test_invalid_file_extension(tmp_path):
    invalid_file = tmp_path / "test.txt"
    invalid_file.write_text("dummy")
    with pytest.raises(DataValidationError) as exc:
        validate_uploaded_file(str(invalid_file))
    assert "Only .csv files are supported" in str(exc.value)
