"""
Logging configuration for SmartEnergy AI.
Masks API keys and provides clean, structured console and file logs.
"""

import logging
import re
import sys
from pathlib import Path

# Pattern to detect Gemini, Groq, and OpenAI keys
KEY_PATTERNS = [
    re.compile(r"AQ\.[a-zA-Z0-9_-]{20,}", re.IGNORECASE),
    re.compile(r"gsk_[a-zA-Z0-9]{20,}", re.IGNORECASE),
    re.compile(r"sk-[a-zA-Z0-9]{20,}", re.IGNORECASE),
]

class SensitiveDataFilter(logging.Filter):
    """Filters out API keys and credentials from log records."""
    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            for pattern in KEY_PATTERNS:
                record.msg = pattern.sub("[REDACTED_API_KEY]", record.msg)
        return True

def setup_logger(name: str = "SmartEnergyAI", log_level: str = "INFO") -> logging.Logger:
    """Configures and returns a thread-safe sanitized logger."""
    logger = logging.getLogger(name)
    level = getattr(logging, log_level.upper(), logging.INFO)
    logger.setLevel(level)

    # Avoid duplicate handlers
    if not logger.handlers:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(level)
        formatter = logging.Formatter(
            "[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        console_handler.setFormatter(formatter)
        console_handler.addFilter(SensitiveDataFilter())
        logger.addHandler(console_handler)

    return logger

logger = setup_logger()
