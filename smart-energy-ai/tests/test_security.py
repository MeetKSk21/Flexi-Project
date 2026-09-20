"""
Unit Tests for Security, Rate Limiting, and Governance Pipeline.
"""

import time
import pytest
from services.security_service import (
    RateLimiter,
    BudgetAndQuotaTracker,
    RequestCache,
    SecurityService,
    security_service
)

def test_rate_limiter_allowance_and_throttling():
    limiter = RateLimiter(max_requests=5, window_seconds=60)
    client = "test_client_1"

    for i in range(5):
        allowed, remaining, retry_after = limiter.is_allowed(client)
        assert allowed is True
        assert remaining == 5 - (i + 1)
        assert retry_after == 0

    # 6th request should be throttled
    allowed, remaining, retry_after = limiter.is_allowed(client)
    assert allowed is False
    assert remaining == 0
    assert retry_after > 0

def test_rate_limiter_sliding_window_expiration():
    limiter = RateLimiter(max_requests=2, window_seconds=1)
    client = "test_client_exp"

    assert limiter.is_allowed(client)[0] is True
    assert limiter.is_allowed(client)[0] is True
    assert limiter.is_allowed(client)[0] is False

    # Sleep for window expiration
    time.sleep(1.1)
    allowed, remaining, _ = limiter.is_allowed(client)
    assert allowed is True
    assert remaining == 1

def test_budget_tracker_token_recording_and_cap():
    tracker = BudgetAndQuotaTracker(spending_cap_usd=0.001)
    assert tracker.check_cap() is True

    # Record typical usage
    prompt = "Analyze smart meter consumption data for anomalous spikes."
    completion = "Peak demand observed at 19:00 hours with 4.2 kWh load."
    tracker.record_usage(prompt, completion)

    status = tracker.get_status()
    assert status["total_tokens_used"] > 0
    assert status["total_cost_usd"] > 0.0
    assert status["total_api_calls"] == 1

    # Force spending cap breach
    tracker.total_cost_usd = 0.005
    assert tracker.check_cap() is False
    assert tracker.blocked_calls == 1

def test_prompt_cache_hit_and_miss():
    cache = RequestCache(max_size=10)
    prompt = "What is my peak consumption hour?"
    sys_prompt = "You are an energy advisor."
    response = "Your peak hour is 20:00 with 3.8 kWh."

    # Cache miss
    assert cache.get(prompt, sys_prompt) is None
    assert cache.misses == 1

    # Store
    cache.set(prompt, sys_prompt, response)

    # Cache hit
    hit_result = cache.get(prompt, sys_prompt)
    assert hit_result == response
    assert cache.hits == 1

def test_prompt_cache_lru_eviction():
    cache = RequestCache(max_size=2)
    cache.set("p1", "sys", "r1")
    cache.set("p2", "sys", "r2")
    cache.set("p3", "sys", "r3")  # Evicts p1

    assert cache.get("p1", "sys") is None
    assert cache.get("p2", "sys") == "r2"
    assert cache.get("p3", "sys") == "r3"

def test_input_sanitizer_xss_and_script_removal():
    svc = SecurityService()
    raw_input = "Hello <script>alert('hack')</script> world <iframe src='malicious.site'></iframe>"
    sanitized = svc.sanitize_input(raw_input)

    assert "<script>" not in sanitized
    assert "<iframe>" not in sanitized
    assert "alert" not in sanitized or "script" not in sanitized

def test_input_sanitizer_length_clipping():
    svc = SecurityService()
    oversized = "A" * 3500
    sanitized = svc.sanitize_input(oversized)
    assert len(sanitized) == 2000

def test_security_diagnostics_structure():
    svc = SecurityService()
    diag = svc.get_health_diagnostics()
    assert "uptime" in diag
    assert "uptime_seconds" in diag
    assert "rate_limiter_active" in diag
    assert "cache_hits" in diag
    assert "cache_misses" in diag
    assert "spending_cap_status" in diag
    assert "security_status" in diag

def test_audit_logging():
    svc = SecurityService()
    initial_len = len(svc.audit_log)
    svc.log_event("INFO", "Test security audit trigger", {"action": "verify"})
    assert len(svc.audit_log) == initial_len + 1
    assert svc.audit_log[-1]["message"] == "Test security audit trigger"
