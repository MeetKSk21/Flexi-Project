"""
Configuration module for SmartEnergy AI.
Loads settings from environment variables and sets safe defaults for college demonstration.
"""

import os
from pathlib import Path
from dataclasses import dataclass, field
from typing import Dict, Any, List
from dotenv import load_dotenv

# Base paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(PROJECT_ROOT / ".env")

@dataclass
class TariffConfig:
    """Configurable electricity tariff system (Default: INR for Indian Academic Demonstrations)."""
    currency: str = "INR (₹)"
    currency_symbol: str = "₹"
    fixed_charge_per_month: float = 150.0  # Base meter charge
    base_rate_per_kwh: float = 7.50       # Flat / standard rate
    peak_rate_per_kwh: float = 11.00      # Peak hour rate (6 PM to 10 PM)
    off_peak_rate_per_kwh: float = 5.20   # Off-peak rate (11 PM to 6 AM)
    peak_hours: List[int] = field(default_factory=lambda: [18, 19, 20, 21, 22])
    off_peak_hours: List[int] = field(default_factory=lambda: [23, 0, 1, 2, 3, 4, 5])
    
    # Slab rates (Tiers of consumption in kWh)
    slab_rates: List[Dict[str, Any]] = field(default_factory=lambda: [
        {"max_kwh": 100, "rate": 4.50},
        {"max_kwh": 300, "rate": 7.50},
        {"max_kwh": float("inf"), "rate": 10.00}
    ])


@dataclass
class LLMConfig:
    """Settings for external LLM API."""
    provider: str = os.getenv("LLM_PROVIDER", "gemini").lower()
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    timeout_seconds: int = 15
    max_retries: int = 2
    temperature: float = 0.3


@dataclass
class SystemConfig:
    """Global system configuration."""
    project_root: Path = PROJECT_ROOT
    data_dir: Path = PROJECT_ROOT / "data"
    default_energy_csv: Path = PROJECT_ROOT / "data" / "energy_consumption.csv"
    appliances_csv: Path = PROJECT_ROOT / "data" / "appliances.csv"
    max_upload_size_mb: int = 15
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    tariff: TariffConfig = field(default_factory=TariffConfig)
    llm: LLMConfig = field(default_factory=LLMConfig)

config = SystemConfig()
