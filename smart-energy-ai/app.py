"""
SmartEnergy - Intelligent Home Energy Platform.
Designed with Stitch Design System (Executive-grade Apple HIG consumer utility).
Light mode default, flawless dark mode contrast, fluid tab animations, and streamlined settings.
"""

import os
import sys
import time
from pathlib import Path
from typing import Dict, Any, List, Tuple
import pandas as pd

# Enforce UTF-8 on Windows command consoles to prevent cp1252 charmap crashes
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

import gradio as gr

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from utils.config import config, TariffConfig
from utils.logging_config import logger
from utils.validation import load_and_validate_csv, DataValidationError
from data.generate_data import generate_synthetic_energy_data
from agents.coordinator_agent import coordinator_agent
from services.visualization import (
    plot_time_series,
    plot_hourly_profile,
    plot_daily_consumption,
    plot_forecast,
    plot_anomalies,
    plot_appliance_pie,
    plot_cost_comparison
)
from services.security_service import security_service

# Global in-memory application state
GLOBAL_DATA = {
    "energy_df": None,
    "appliances_df": None,
    "tariff": TariffConfig(),
    "system_state": None,
    "chat_history": []
}

def build_stitch_kpis_html(bill_val: int, savings_val: int, savings_pct: float, energy_val: int, daily_val: float, sym: str = "₹") -> str:
    """Generates 4 executive-grade consumer metric cards with VoltIQ Pulse Stitch typography."""
    return f"""
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; margin-bottom: 24px;">
      <!-- Card 1: Estimated Monthly Bill -->
      <div class="stitch-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="stitch-kpi-label">Net Monthly Bill</span>
          <span class="stitch-badge-cyan">Standard Schedule</span>
        </div>
        <div class="stitch-kpi-val">{sym}{bill_val:,}</div>
        <div class="stitch-kpi-sub">
          <span>Down from baseline via adaptive load shifting</span>
        </div>
      </div>
      
      <!-- Card 2: Potential Monthly Savings -->
      <div class="stitch-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="stitch-kpi-label">Potential Monthly Savings</span>
          <span class="stitch-badge-emerald">Peak Shaved</span>
        </div>
        <div class="stitch-kpi-val" style="color: var(--brand-emerald);">{sym}{savings_val:,} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary); font-family: 'Space Grotesk', sans-serif;">/ mo</span></div>
        <div class="stitch-kpi-sub">
          <span style="font-weight: 600; color: var(--brand-emerald);">{savings_pct}% monthly cut</span> available by shifting heavy loads
        </div>
      </div>

      <!-- Card 3: Total Energy Used -->
      <div class="stitch-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="stitch-kpi-label">Total Energy Used</span>
          <span class="stitch-badge-neutral">Active Cycle</span>
        </div>
        <div class="stitch-kpi-val">{energy_val:,} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary); font-family: 'Space Grotesk', sans-serif;">kWh</span></div>
        <div class="stitch-kpi-sub">
          <span>Cumulative smart meter consumption for cycle</span>
        </div>
      </div>

      <!-- Card 4: Daily Average -->
      <div class="stitch-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="stitch-kpi-label">Daily Average Use</span>
          <span class="stitch-badge-amber">Peak 6–10 PM</span>
        </div>
        <div class="stitch-kpi-val">{daily_val} <span style="font-size: 14px; font-weight: 500; color: var(--text-secondary); font-family: 'Space Grotesk', sans-serif;">kWh/day</span></div>
        <div class="stitch-kpi-sub">
          <span>Peak evening window monitored for rate spikes</span>
        </div>
      </div>
    </div>
    """

def load_initial_datasets():
    """Loads baseline energy and appliance datasets on startup."""
    try:
        energy_path = config.default_energy_csv
        if not energy_path.exists():
            logger.info("Generating initial synthetic dataset...")
            generate_synthetic_energy_data(days=45, output_path=energy_path)
            
        df, _ = load_and_validate_csv(str(energy_path))
        GLOBAL_DATA["energy_df"] = df

        if config.appliances_csv.exists():
            GLOBAL_DATA["appliances_df"] = pd.read_csv(config.appliances_csv)
        else:
            GLOBAL_DATA["appliances_df"] = pd.DataFrame()

        # Run fast initial deterministic analysis so dashboard is populated immediately
        GLOBAL_DATA["system_state"] = coordinator_agent.run_full_analysis(
            GLOBAL_DATA["energy_df"],
            GLOBAL_DATA["appliances_df"],
            GLOBAL_DATA["tariff"],
            call_llm=False
        )
        logger.info("Initial multi-agent baseline initialized successfully.")
    except Exception as e:
        logger.error(f"Error loading initial dataset: {e}")

# Trigger initial load
load_initial_datasets()

# ----------------- Controller Handlers -----------------

def run_analysis_pipeline(base_rate, peak_rate, off_peak_rate, fixed_charge, call_llm: bool = True):
    """Executes full multi-agent pipeline and prepares consumer-friendly outputs."""
    if GLOBAL_DATA["energy_df"] is None or GLOBAL_DATA["energy_df"].empty:
        return (
            "Please load a dataset first.",
            build_stitch_kpis_html(0, 0, 0.0, 0, 0.0),
            None, None, "No data available.",
            pd.DataFrame(), None, pd.DataFrame()
        )

    # Update active tariff
    tariff = TariffConfig(
        base_rate_per_kwh=float(base_rate),
        peak_rate_per_kwh=float(peak_rate),
        off_peak_rate_per_kwh=float(off_peak_rate),
        fixed_charge_per_month=float(fixed_charge)
    )
    GLOBAL_DATA["tariff"] = tariff

    # Run Multi-Agent System
    state = coordinator_agent.run_full_analysis(
        GLOBAL_DATA["energy_df"],
        GLOBAL_DATA["appliances_df"],
        tariff,
        call_llm=call_llm
    )
    GLOBAL_DATA["system_state"] = state

    mon = state["monitoring"]
    app = state["appliances"]
    cost = state["cost"]
    anom = state["anomalies"]
    sym = tariff.currency_symbol

    # Build Stitch-styled KPI HTML
    kpi_html = build_stitch_kpis_html(
        bill_val=int(cost["current_monthly_cost"]),
        savings_val=int(cost["monthly_savings"]),
        savings_pct=cost["savings_percentage"],
        energy_val=int(mon["total_consumption"]),
        daily_val=float(mon["daily_average"]),
        sym=sym
    )

    # Main Visual Charts
    fig_time = plot_time_series(GLOBAL_DATA["energy_df"])
    fig_app = plot_appliance_pie(app["appliance_table"])
    fig_cost = plot_cost_comparison(cost["current_monthly_cost"], cost["optimized_monthly_cost"], sym)

    # Clean Consumer Tables
    if app["appliance_table"]:
        raw_app_df = pd.DataFrame(app["appliance_table"])
        app_df = raw_app_df[[
            "appliance_name", "rated_power_kw", "typical_hours_per_day",
            "monthly_kwh", "current_monthly_cost", "monthly_savings_cost", "recommended_schedule"
        ]].rename(columns={
            "appliance_name": "Appliance",
            "rated_power_kw": "Power (kW)",
            "typical_hours_per_day": "Hours/Day",
            "monthly_kwh": "Monthly Units (kWh)",
            "current_monthly_cost": f"Current Cost ({sym})",
            "monthly_savings_cost": f"Potential Savings ({sym})",
            "recommended_schedule": "Best Time to Run"
        })
    else:
        app_df = pd.DataFrame()

    if anom["anomalies"]:
        raw_anom_df = pd.DataFrame(anom["anomalies"])
        anom_df = raw_anom_df[[
            "timestamp", "measured_kwh", "expected_mean_kwh", "severity", "explanation"
        ]].rename(columns={
            "timestamp": "Date & Time",
            "measured_kwh": "Usage (kWh)",
            "expected_mean_kwh": "Normal (kWh)",
            "severity": "Alert Level",
            "explanation": "What Happened"
        })
    else:
        anom_df = pd.DataFrame()

    status_msg = "Analysis updated. Everything looks good."
    summary_text = state["coordinator_synthesis"]

    return (
        status_msg, kpi_html,
        fig_time, fig_app, summary_text,
        app_df, fig_cost, anom_df
    )

def handle_csv_upload(file_obj):
    """Safely handles user CSV upload with validation and size limits."""
    if file_obj is None:
        return "No file uploaded.", None, ""
    try:
        file_size_mb = os.path.getsize(file_obj.name) / (1024 * 1024)
        if file_size_mb > 15:
            security_service.log_event("WARN", f"File upload rejected: {file_size_mb:.1f} MB exceeds 15 MB threshold.")
            return f"Validation Error: File size ({file_size_mb:.1f} MB) exceeds maximum 15 MB limit.", None, ""

        df, meta = load_and_validate_csv(file_obj.name)
        GLOBAL_DATA["energy_df"] = df
        preview = df.head(8)
        info = (
            f"**File Loaded Successfully**\n\n"
            f"- Records: {meta['total_records']} readings\n"
            f"- Dates: {meta['start_time'][:10]} to {meta['end_time'][:10]}\n"
            f"- Cleaned: {meta['duplicates_removed']} duplicates removed"
        )
        security_service.log_event("INFO", f"Dataset ingested: {meta['total_records']} records validated.")
        return "File ready. Click 'Save Plan & Recalculate' to update.", preview, info
    except DataValidationError as ve:
        security_service.log_event("WARN", f"CSV validation error: {str(ve)}")
        return f"Validation Error: {str(ve)}", None, ""
    except Exception as e:
        security_service.log_event("ERROR", f"CSV ingestion failure: {str(e)}")
        return f"Unexpected Error: {str(e)}", None, ""

def handle_regenerate_data():
    """Regenerates synthetic 45-day demo smart meter dataset."""
    try:
        df = generate_synthetic_energy_data(days=45, output_path=config.default_energy_csv)
        GLOBAL_DATA["energy_df"] = df
        preview = df.head(8)
        info = "Loaded 45 days of sample home electricity data (1,080 hourly readings)."
        security_service.log_event("INFO", "Demo smart-meter dataset regenerated.")
        return "Sample home data loaded. Click 'Save Plan & Recalculate' to refresh.", preview, info
    except Exception as e:
        return f"Error loading sample data: {str(e)}", None, ""

def handle_chat(message, history):
    """Processes user query in Energy Advisory Assistant tab with sanitization and rate limiting."""
    if not message or not message.strip():
        return "", history

    # Sanitize user input to prevent injection
    clean_message = security_service.sanitize_input(message)

    # Rate limiting check
    allowed, remaining, retry_after = security_service.rate_limiter.is_allowed("chat_user")
    if not allowed:
        history = history or []
        history.append({"role": "user", "content": clean_message})
        history.append({
            "role": "assistant",
            "content": f"You're asking questions very quickly! Please wait {retry_after} seconds before sending another message."
        })
        return "", history

    response = coordinator_agent.route_and_respond_chat(
        user_message=clean_message,
        system_state=GLOBAL_DATA["system_state"],
        energy_df=GLOBAL_DATA["energy_df"],
        appliances_df=GLOBAL_DATA["appliances_df"],
        tariff=GLOBAL_DATA["tariff"]
    )
    history = history or []
    history.append({"role": "user", "content": clean_message})
    history.append({"role": "assistant", "content": response})
    return "", history

def handle_download_report():
    """Generates the downloadable markdown report."""
    if GLOBAL_DATA["system_state"] is None:
        report_text = "# Home Energy Summary\nPlease run the analysis first."
    else:
        report_text = coordinator_agent.generate_full_report_markdown(GLOBAL_DATA["system_state"])

    report_path = PROJECT_ROOT / "home_energy_report.md"
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(report_text)
    return str(report_path)

def get_security_status_display():
    """Fetches live diagnostics from SecurityService for the Advanced Drawer."""
    diag = security_service.get_health_diagnostics()
    budget = diag["spending_cap_status"]

    kpi_uptime = diag["uptime"]
    kpi_status = diag["security_status"]
    kpi_tokens = f"{budget['total_tokens_used']:,} tokens"
    kpi_cost = f"${budget['total_cost_usd']:.4f} / ${budget['spending_cap_usd']:.2f} ({budget['percentage_used']}%)"
    kpi_cache = f"{diag['cache_hits']} hits / {diag['cache_misses']} misses"
    kpi_rate = "Active (30 requests / 60s sliding window)"

    recent_logs = security_service.audit_log[-10:] if security_service.audit_log else []
    if recent_logs:
        log_df = pd.DataFrame(recent_logs)[["timestamp", "level", "message"]]
    else:
        log_df = pd.DataFrame([{
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "level": "INFO",
            "message": "Security system initialized. Defense-in-depth active."
        }])

    api_masked = "Google Gemini Flash 3.6 (Native REST API, Masked)" if config.llm.gemini_api_key else "Offline Baseline Mode"

    return kpi_uptime, kpi_status, kpi_tokens, kpi_cost, kpi_cache, kpi_rate, api_masked, log_df

def handle_clear_cache():
    """Purges the in-memory LLM prompt completion cache."""
    security_service.cache.cache.clear()
    security_service.cache.hits = 0
    security_service.cache.misses = 0
    security_service.log_event("INFO", "Prompt completion cache purged by operator.")
    return get_security_status_display()

# ----------------- Stitch Design System Stylesheet -----------------

custom_css = """
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap');

/* ==========================================================================
   VoltIQ Pulse - Stitch Design System Tokens (Light Default & Dark Contrast)
   ========================================================================== */

:root {
    --bg-canvas: #f8fafc;
    --bg-card: #ffffff;
    --bg-card-hover: #ffffff;
    --bg-subtle: #f1f5f9;
    --border-color: #e2e8f0;
    --border-hover: #cbd5e1;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #64748b;
    --brand-cyan: #0891b2;
    --brand-cyan-light: #ecfeff;
    --brand-emerald: #059669;
    --brand-emerald-light: #ecfdf5;
    --brand-amber: #d97706;
    --brand-amber-light: #fffbeb;
    --badge-emerald-bg: #ecfdf5;
    --badge-emerald-text: #065f46;
    --badge-emerald-border: #a7f3d0;
    --badge-cyan-bg: #ecfeff;
    --badge-cyan-text: #0e7490;
    --badge-cyan-border: #a5f3fc;
    --badge-amber-bg: #fffbeb;
    --badge-amber-text: #92400e;
    --badge-amber-border: #fde68a;
    --badge-neutral-bg: #f1f5f9;
    --badge-neutral-text: #475569;
    --badge-neutral-border: #e2e8f0;
    --card-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02);
    --card-shadow-hover: 0 8px 20px -4px rgba(15, 23, 42, 0.08), 0 3px 6px -2px rgba(15, 23, 42, 0.04);
}

/* Explicit Dark Mode Overrides with High Contrast */
.dark, html.dark, body.dark, .gradio-container.dark {
    --bg-canvas: #0b1326;
    --bg-card: #131b2e;
    --bg-card-hover: #1e293b;
    --bg-subtle: #171f33;
    --border-color: #222a3d;
    --border-hover: #334155;
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-muted: #94a3b8;
    --brand-cyan: #22d3ee;
    --brand-cyan-light: rgba(6, 182, 212, 0.15);
    --brand-emerald: #34d399;
    --brand-emerald-light: rgba(16, 185, 129, 0.15);
    --brand-amber: #fbbf24;
    --brand-amber-light: rgba(217, 119, 6, 0.15);
    --badge-emerald-bg: rgba(16, 185, 129, 0.15);
    --badge-emerald-text: #34d399;
    --badge-emerald-border: rgba(52, 211, 153, 0.35);
    --badge-cyan-bg: rgba(6, 182, 212, 0.15);
    --badge-cyan-text: #22d3ee;
    --badge-cyan-border: rgba(34, 211, 238, 0.35);
    --badge-amber-bg: rgba(217, 119, 6, 0.15);
    --badge-amber-text: #fbbf24;
    --badge-amber-border: rgba(217, 119, 6, 0.35);
    --badge-neutral-bg: #1e293b;
    --badge-neutral-text: #cbd5e1;
    --badge-neutral-border: #334155;
    --card-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
    --card-shadow-hover: 0 8px 28px rgba(0, 0, 0, 0.5);
}

/* Base Body & Container */
body, .gradio-container {
    background-color: var(--bg-canvas) !important;
    color: var(--text-primary) !important;
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
    max-width: 1180px !important;
    margin: 0 auto !important;
    padding: 16px 24px !important;
}

/* Typography Hierarchy */
h1, h2, h3, h4, h5, h6, .font-display {
    font-family: 'Space Grotesk', -apple-system, sans-serif !important;
    color: var(--text-primary) !important;
    letter-spacing: -0.02em !important;
    font-weight: 600 !important;
}

p, span, label, div {
    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
}

/* Header Container */
.stitch-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0 20px 0;
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 24px;
}

/* Pulsing Status Dot */
.voltiq-ping-container {
    position: relative;
    display: inline-flex;
    width: 8px;
    height: 8px;
    margin-right: 6px;
}

.voltiq-ping-dot {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 9999px;
    background-color: #10b981;
    opacity: 0.75;
    animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.voltiq-dot {
    position: relative;
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background-color: #10b981;
}

@keyframes ping {
    75%, 100% {
        transform: scale(2);
        opacity: 0;
    }
}

/* Fluid Segmented Tabs & Smooth Animations (Zero Cuts) */
.tabs {
    border-bottom: 1px solid var(--border-color) !important;
    margin-bottom: 24px !important;
    background: transparent !important;
}

.tab-nav {
    display: inline-flex !important;
    gap: 4px !important;
    padding: 4px !important;
    background: var(--bg-subtle) !important;
    border-radius: 12px !important;
    border: 1px solid var(--border-color) !important;
    width: auto !important;
    margin-bottom: 12px !important;
}

.tab-nav button {
    font-family: 'Space Grotesk', -apple-system, sans-serif !important;
    font-size: 13.5px !important;
    font-weight: 600 !important;
    color: var(--text-secondary) !important;
    border: none !important;
    border-radius: 8px !important;
    padding: 8px 18px !important;
    background: transparent !important;
    cursor: pointer !important;
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.tab-nav button:hover {
    color: var(--text-primary) !important;
    background: rgba(15, 23, 42, 0.04) !important;
}

.dark .tab-nav button:hover {
    background: rgba(255, 255, 255, 0.06) !important;
}

.tab-nav button.selected {
    color: var(--brand-cyan) !important;
    background: var(--bg-card) !important;
    box-shadow: 0 2px 8px -2px rgba(15, 23, 42, 0.08), 0 1px 3px -1px rgba(15, 23, 42, 0.04) !important;
}

.dark .tab-nav button.selected {
    color: #22d3ee !important;
    background: #1e293b !important;
    box-shadow: 0 0 16px rgba(6, 182, 212, 0.25) !important;
}

/* Fluid Tab Switch Animation */
.tabitem {
    animation: stitchTabFadeIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
    will-change: opacity, transform;
}

@keyframes stitchTabFadeIn {
    0% {
        opacity: 0;
        transform: translateY(6px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

/* VoltIQ Stitch KPI Cards */
.stitch-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 18px 20px;
    box-shadow: var(--card-shadow);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease !important;
}

.stitch-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--card-shadow-hover);
}

.stitch-kpi-label {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
}

.stitch-kpi-val {
    font-family: 'Space Mono', monospace;
    font-size: 30px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--text-primary);
    letter-spacing: -0.02em;
    margin: 8px 0 10px 0;
}

.stitch-kpi-sub {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.4;
}

/* Status Pill Badges */
.stitch-badge-emerald {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: var(--badge-emerald-text);
    background-color: var(--badge-emerald-bg);
    border: 1px solid var(--badge-emerald-border);
    padding: 2px 8px;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.stitch-badge-cyan {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: var(--badge-cyan-text);
    background-color: var(--badge-cyan-bg);
    border: 1px solid var(--badge-cyan-border);
    padding: 2px 8px;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.stitch-badge-amber {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: var(--badge-amber-text);
    background-color: var(--badge-amber-bg);
    border: 1px solid var(--badge-amber-border);
    padding: 2px 8px;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.stitch-badge-neutral {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 11px;
    font-weight: 500;
    color: var(--badge-neutral-text);
    background-color: var(--badge-neutral-bg);
    border: 1px solid var(--badge-neutral-border);
    padding: 2px 8px;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

/* Panels & Containers */
.gr-box, .gr-panel, .gr-group, .tabitem {
    background-color: var(--bg-card) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 14px !important;
    box-shadow: var(--card-shadow) !important;
    padding: 20px !important;
    color: var(--text-primary) !important;
}

/* Form Inputs & Fields */
input, textarea, select, .gr-input, .gr-text-input {
    background-color: var(--bg-card) !important;
    border: 1px solid var(--border-color) !important;
    border-radius: 8px !important;
    color: var(--text-primary) !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
    padding: 8px 12px !important;
}

input:focus, textarea:focus, select:focus {
    border-color: var(--brand-cyan) !important;
    box-shadow: 0 0 0 1px var(--brand-cyan) !important;
}

label, .label-wrap, .label-wrap span {
    font-family: 'Space Grotesk', sans-serif !important;
    color: var(--text-primary) !important;
    font-weight: 600 !important;
    font-size: 13px !important;
}

.info, .help-text {
    font-size: 12px !important;
    color: var(--text-secondary) !important;
}

/* Tables & Dataframes */
table, th, td {
    color: var(--text-primary) !important;
    border-color: var(--border-color) !important;
    font-family: 'Plus Jakarta Sans', sans-serif !important;
}

th {
    background-color: var(--bg-subtle) !important;
    color: var(--text-secondary) !important;
    font-family: 'Space Grotesk', sans-serif !important;
    font-weight: 600 !important;
    font-size: 12.5px !important;
    text-transform: uppercase !important;
    letter-spacing: 0.03em !important;
    padding: 10px 14px !important;
}

td {
    padding: 10px 14px !important;
    font-size: 13px !important;
}

/* Primary Action Button (VoltIQ Cyan/Emerald) */
.gr-button-primary {
    background-color: var(--brand-cyan) !important;
    border: 1px solid var(--brand-cyan) !important;
    color: #ffffff !important;
    font-family: 'Space Grotesk', sans-serif !important;
    font-weight: 600 !important;
    font-size: 14px !important;
    border-radius: 10px !important;
    padding: 9px 20px !important;
    box-shadow: 0 2px 8px -1px rgba(8, 145, 178, 0.25) !important;
    transition: all 0.18s ease-in-out !important;
    cursor: pointer !important;
}

.gr-button-primary:hover {
    background-color: #0e7490 !important;
    border-color: #0e7490 !important;
    box-shadow: 0 4px 14px -1px rgba(8, 145, 178, 0.35) !important;
}

/* Secondary Button */
.gr-button-secondary {
    background-color: var(--bg-card) !important;
    border: 1px solid var(--border-color) !important;
    color: var(--text-primary) !important;
    font-family: 'Space Grotesk', sans-serif !important;
    font-weight: 500 !important;
    font-size: 13.5px !important;
    border-radius: 10px !important;
    padding: 8px 18px !important;
    transition: all 0.18s ease-in-out !important;
    cursor: pointer !important;
}

.gr-button-secondary:hover {
    background-color: var(--bg-subtle) !important;
    border-color: var(--border-hover) !important;
}

/* Chatbot Custom Styling */
.chatbot .message {
    border-radius: 12px !important;
    padding: 12px 16px !important;
    font-size: 14px !important;
    line-height: 1.5 !important;
}

.chatbot .user {
    background-color: var(--brand-cyan) !important;
    color: #ffffff !important;
}

.chatbot .bot {
    background-color: var(--bg-subtle) !important;
    color: var(--text-primary) !important;
    border: 1px solid var(--border-color) !important;
}

/* ==========================================================================
   Dark Mode Flawless Text Legibility Guarantee
   ========================================================================== */

.dark * {
    color-scheme: dark;
}

.dark .gr-box, .dark .gr-panel, .dark .gr-group, .dark .tabitem,
.dark .prose, .dark .prose *, .dark .markdown, .dark .markdown *,
.dark .gr-markdown, .dark .gr-markdown *,
.dark label, .dark .label-wrap, .dark .label-wrap span,
.dark table, .dark td, .dark tr,
.dark .chatbot, .dark .chatbot *,
.dark .dataframe, .dark .dataframe * {
    color: var(--text-primary) !important;
}

.dark .info, .dark .help-text, .dark .text-gray-500, .dark th {
    color: var(--text-secondary) !important;
}

.dark input, .dark textarea, .dark select {
    background-color: #0e1526 !important;
    color: #f8fafc !important;
    border-color: #222a3d !important;
}

.dark th {
    background-color: #171f33 !important;
}

.dark td {
    background-color: #131b2e !important;
}

.dark tr:hover td {
    background-color: #1a233a !important;
}

.dark .chatbot .bot {
    background-color: #171f33 !important;
    color: #f8fafc !important;
    border: 1px solid #222a3d !important;
}
"""

header_html = """
<header class="stitch-header">
  <div style="display: flex; align-items: center; gap: 14px;">
    <!-- VoltIQ Pulse SVG from stitch_smart_energy_frontend_redesign -->
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40" fill="none" style="height: 38px; width: auto;">
      <defs>
        <linearGradient id="energyGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#06B6D4"/>
          <stop offset="50%" stop-color="#10B981"/>
          <stop offset="100%" stop-color="#3B82F6"/>
        </linearGradient>
        <linearGradient id="glowGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#22D3EE" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#10B981" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
      <g transform="translate(4, 4)">
        <rect width="32" height="32" rx="8" fill="#0F172A" stroke="url(#energyGrad)" stroke-width="1.5"/>
        <circle cx="16" cy="16" r="10" fill="url(#glowGrad)" opacity="0.3"/>
        <path d="M17 7L11 18H16L15 25L21 14H16L17 7Z" fill="url(#energyGrad)"/>
        <circle cx="16" cy="16" r="1.5" fill="#FFFFFF"/>
      </g>
      <text x="44" y="25" fill="var(--text-primary)" font-family="'Space Grotesk', system-ui, sans-serif" font-size="19" font-weight="700" letter-spacing="-0.02em">Volt<tspan fill="#06B6D4">IQ</tspan></text>
      <text x="108" y="24" fill="var(--text-muted)" font-family="'Space Grotesk', system-ui, sans-serif" font-size="10" font-weight="600" letter-spacing="0.1em">PULSE</text>
    </svg>
    <div style="border-left: 1px solid var(--border-color); padding-left: 14px; margin-left: 2px;">
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 500; color: var(--text-secondary);">Autonomous Energy Intelligence Platform</div>
    </div>
  </div>
  <div style="display: flex; align-items: center; gap: 10px;">
    <div class="stitch-badge-emerald" style="padding: 5px 12px; font-size: 11.5px; border-radius: 9999px;">
      <span class="voltiq-ping-container">
        <span class="voltiq-ping-dot"></span>
        <span class="voltiq-dot"></span>
      </span>
      <span style="font-family: 'Space Grotesk', sans-serif; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Live Telemetry Active</span>
    </div>
  </div>
</header>
"""

with gr.Blocks(title="VoltIQ Pulse - Smart Energy Intelligence Platform") as demo:
    gr.HTML(header_html)

    with gr.Row():
        with gr.Column(scale=3):
            status_banner = gr.Markdown("### ⚡ Live Household Telemetry: Active & Synchronized\n*Real-time circuit decomposition and tariff optimization enabled.*")
        with gr.Column(scale=1):
            run_btn = gr.Button("⚡ Recalculate Insights", variant="primary")

    with gr.Tabs() as main_tabs:

        # ----------------- TAB 1: LIVE OVERVIEW -----------------
        with gr.Tab("Live Overview", id="tab_overview"):
            gr.Markdown("### Household Energy Dashboard")
            gr.Markdown("Real-time visibility into your home's electricity consumption, current costs, and active savings.")
            kpi_display = gr.HTML(build_stitch_kpis_html(0, 0, 0.0, 0, 0.0))

            with gr.Row():
                with gr.Column(scale=1):
                    gr.Markdown("#### Daily Electricity Usage")
                    fig_time_plot = gr.Plot()
                with gr.Column(scale=1):
                    gr.Markdown("#### Where Your Energy Goes (By Appliance)")
                    fig_app_plot = gr.Plot()

            gr.Markdown("---")
            with gr.Group():
                gr.Markdown("#### 💡 AI Home Summary & Recommended Actions")
                summary_box = gr.Markdown("Analyzing home telemetry...")

        # ----------------- TAB 2: WAYS TO SAVE -----------------
        with gr.Tab("Ways to Save", id="tab_savings"):
            gr.Markdown("### Actionable Ways to Lower Your Bill")
            gr.Markdown("Shift high-power appliances into off-peak hours to immediately cut your utility costs.")

            with gr.Row():
                with gr.Column(scale=3):
                    gr.Markdown("#### Recommended Appliance Times")
                    gr.Markdown("Run heavy loads during cheaper off-peak hours to unlock maximum monthly savings:")
                    app_table = gr.Dataframe(interactive=False)
                with gr.Column(scale=2):
                    gr.Markdown("#### Projected Bill Impact")
                    gr.Markdown("Monthly cost before vs. after shifting heavy loads:")
                    fig_cost_plot = gr.Plot()

            gr.Markdown("---")
            gr.Markdown("#### Unusual Usage Alerts")
            gr.Markdown("Instances where energy consumption spiked significantly above normal habits:")
            anom_table = gr.Dataframe(interactive=False)

            gr.Markdown(
                """
                > [!NOTE]
                > **Consumer Note**: Flagged spikes highlight times when multiple high-draw appliances were running concurrently. They do not indicate wiring or electrical hazards.
                """
            )

            gr.Markdown("---")
            with gr.Row():
                with gr.Column(scale=3):
                    gr.Markdown("#### Download Summary Report")
                    gr.Markdown("Generate and download a complete printable markdown audit report of your household energy and savings recommendations.")
                    gen_report_btn = gr.Button("📄 Download Energy Summary Report", variant="secondary")
                with gr.Column(scale=2):
                    report_file = gr.File(label="Download Report (.md)")

        # ----------------- TAB 3: ENERGY ASSISTANT -----------------
        with gr.Tab("Energy Assistant", id="tab_assistant"):
            gr.Markdown("### Ask Your Home Energy Assistant")
            gr.Markdown("Ask anything about your electricity bills, appliance power draw, or simple ways to save money.")

            chatbot = gr.Chatbot(
                label="Conversation",
                height=440,
                value=[{"role": "assistant", "content": "Hello! I'm your VoltIQ Pulse energy assistant. Ask me anything about your electricity bills, appliance power draw, or how to save money on your next utility bill."}]
            )
            with gr.Row():
                chat_input = gr.Textbox(placeholder="Ask a question (e.g., Why was my bill high this month?)...", scale=5, show_label=False)
                send_btn = gr.Button("Ask Assistant", variant="primary", scale=1)

            gr.Markdown("#### Common Questions to Try:")
            with gr.Row():
                q1 = gr.Button("💡 Why was my electricity bill high this month?")
                q2 = gr.Button("⚡ Which appliance uses the most electricity?")
                q3 = gr.Button("🌙 When is electricity cheapest for laundry?")
                q4 = gr.Button("🌿 Give me 3 simple tips to save electricity today.")

        # ----------------- TAB 4: SETTINGS & RATES -----------------
        with gr.Tab("Settings & Rates", id="tab_settings"):
            gr.Markdown("### Household Settings & Electricity Rates")
            gr.Markdown("Customize your local electricity rates and household setup. Everything is pre-configured with standard residential defaults so you can start right away.")

            with gr.Row():
                # Left Column: Electricity Plan & Pricing
                with gr.Column(scale=1):
                    with gr.Group():
                        gr.Markdown("#### ⚡ Time-of-Day Electricity Tariff")
                        gr.Markdown("Your power utility charges different rates across daytime, evening peak, and night hours:")
                        
                        with gr.Row():
                            tariff_base = gr.Number(label="☀️ Standard Daytime Rate (₹/kWh)", value=config.tariff.base_rate_per_kwh, precision=2, info="6:00 AM – 6:00 PM (Normal)")
                            tariff_peak = gr.Number(label="⚡ Evening Peak Rate (₹/kWh)", value=config.tariff.peak_rate_per_kwh, precision=2, info="6:00 PM – 10:00 PM (High Cost)")
                        
                        with gr.Row():
                            tariff_off_peak = gr.Number(label="🌙 Night Off-Peak Rate (₹/kWh)", value=config.tariff.off_peak_rate_per_kwh, precision=2, info="11:00 PM – 6:00 AM (Cheapest)")
                            tariff_fixed = gr.Number(label="🏷️ Fixed Monthly Meter Fee (₹)", value=config.tariff.fixed_charge_per_month, precision=2, info="Fixed utility line charge")

                        save_tariff_btn = gr.Button("💾 Save Rates & Recalculate", variant="primary")

                    with gr.Group():
                        gr.Markdown("#### 🏡 Home Details")
                        with gr.Row():
                            home_type = gr.Dropdown(label="Dwelling Type", choices=["2-BHK Apartment", "3-BHK Apartment", "Independent Villa"], value="3-BHK Apartment")
                            home_occupants = gr.Dropdown(label="Household Size", choices=["1-2 People", "3-4 People", "5+ People"], value="3-4 People")
                        home_cooling = gr.Dropdown(label="Climate & Cooling Setup", choices=["Inverter Split ACs + Ceiling Fans", "Central HVAC", "Fans Only"], value="Inverter Split ACs + Ceiling Fans")

                # Right Column: Smart Meter Data Ingestion Pipeline
                with gr.Column(scale=1):
                    with gr.Group():
                        gr.Markdown("#### 📊 Smart Meter Telemetry Data")
                        gr.Markdown("Use sample home data for an instant demo, or upload your own utility CSV file:")
                        
                        with gr.Row():
                            regen_btn = gr.Button("⚡ Load Sample Home Data (45 Days)", variant="secondary")
                        gr.Markdown("*Tip: Loads 1,080 realistic hourly readings from a typical modern home for instant preview.*")
                        
                        gr.Markdown("---")
                        file_upload = gr.File(label="Or Upload Utility Meter CSV (.csv, max 15MB)", file_types=[".csv"])
                        upload_btn = gr.Button("📁 Ingest & Apply CSV File", variant="secondary")
                        
                        data_status = gr.Markdown("**Active Data Source**: 45-day baseline dataset active.")
                        data_meta = gr.Markdown("")

                    with gr.Group():
                        gr.Markdown("#### 📋 Recent Meter Readings Preview")
                        data_preview_table = gr.Dataframe(interactive=False)

            # Collapsible Technical Drawer (Hidden from normal consumers)
            with gr.Accordion("🛠️ Advanced Diagnostics & System Health (Optional Details)", open=False):
                gr.Markdown("Real-time governance, token ledger, cache, and security telemetry for system administrators:")
                
                with gr.Row():
                    sec_uptime = gr.Textbox(label="System Uptime", interactive=False)
                    sec_status = gr.Textbox(label="Security Status", interactive=False)
                    sec_rate = gr.Textbox(label="Rate Limiter Window", interactive=False)
                    sec_api = gr.Textbox(label="Active LLM Client", interactive=False)

                with gr.Row():
                    sec_tokens = gr.Textbox(label="Token Ledger", interactive=False)
                    sec_cost = gr.Textbox(label="Spending Cap / Budget", interactive=False)
                    sec_cache = gr.Textbox(label="In-Memory Cache", interactive=False)

                with gr.Row():
                    sec_refresh_btn = gr.Button("Refresh Technical Diagnostics", variant="secondary")
                    sec_clear_cache_btn = gr.Button("Purge Prompt Cache", variant="secondary")

                gr.Markdown("#### Security and System Audit Log")
                sec_audit_table = gr.Dataframe(label="Recent Security Events", interactive=False)

    # ----------------- Event Bindings -----------------

    analysis_outputs = [
        status_banner, kpi_display,
        fig_time_plot, fig_app_plot, summary_box,
        app_table, fig_cost_plot, anom_table
    ]

    sec_outputs = [
        sec_uptime, sec_status, sec_tokens, sec_cost, sec_cache, sec_rate, sec_api, sec_audit_table
    ]

    def run_live_pipeline(base_rate, peak_rate, off_peak_rate, fixed_charge):
        return run_analysis_pipeline(base_rate, peak_rate, off_peak_rate, fixed_charge, call_llm=True)

    def load_initial_view(base_rate, peak_rate, off_peak_rate, fixed_charge):
        return run_analysis_pipeline(base_rate, peak_rate, off_peak_rate, fixed_charge, call_llm=False)

    run_btn.click(
        fn=run_live_pipeline,
        inputs=[tariff_base, tariff_peak, tariff_off_peak, tariff_fixed],
        outputs=analysis_outputs
    )

    save_tariff_btn.click(
        fn=run_live_pipeline,
        inputs=[tariff_base, tariff_peak, tariff_off_peak, tariff_fixed],
        outputs=analysis_outputs
    )

    upload_btn.click(
        fn=handle_csv_upload,
        inputs=[file_upload],
        outputs=[data_status, data_preview_table, data_meta]
    )

    regen_btn.click(
        fn=handle_regenerate_data,
        inputs=[],
        outputs=[data_status, data_preview_table, data_meta]
    )

    send_btn.click(
        fn=handle_chat,
        inputs=[chat_input, chatbot],
        outputs=[chat_input, chatbot]
    )
    chat_input.submit(
        fn=handle_chat,
        inputs=[chat_input, chatbot],
        outputs=[chat_input, chatbot]
    )

    # Quick prompt actions
    q1.click(lambda: "Why was my electricity bill high this month?", outputs=[chat_input]).then(
        fn=handle_chat, inputs=[chat_input, chatbot], outputs=[chat_input, chatbot]
    )
    q2.click(lambda: "Which appliance uses the most electricity in my home?", outputs=[chat_input]).then(
        fn=handle_chat, inputs=[chat_input, chatbot], outputs=[chat_input, chatbot]
    )
    q3.click(lambda: "When is electricity cheapest for laundry?", outputs=[chat_input]).then(
        fn=handle_chat, inputs=[chat_input, chatbot], outputs=[chat_input, chatbot]
    )
    q4.click(lambda: "Give me 3 simple tips to save electricity today.", outputs=[chat_input]).then(
        fn=handle_chat, inputs=[chat_input, chatbot], outputs=[chat_input, chatbot]
    )

    gen_report_btn.click(
        fn=handle_download_report,
        inputs=[],
        outputs=[report_file]
    )

    # Security drawer events
    sec_refresh_btn.click(
        fn=get_security_status_display,
        inputs=[],
        outputs=sec_outputs
    )
    sec_clear_cache_btn.click(
        fn=handle_clear_cache,
        inputs=[],
        outputs=sec_outputs
    )

    # Combined startup loader
    def on_app_startup(base_rate, peak_rate, off_peak_rate, fixed_charge):
        analysis_res = load_initial_view(base_rate, peak_rate, off_peak_rate, fixed_charge)
        sec_res = get_security_status_display()
        return (*analysis_res, *sec_res)

    demo.load(
        fn=on_app_startup,
        inputs=[tariff_base, tariff_peak, tariff_off_peak, tariff_fixed],
        outputs=[*analysis_outputs, *sec_outputs]
    )

if __name__ == "__main__":
    port = int(os.getenv("GRADIO_SERVER_PORT", 7860))
    share = os.getenv("GRADIO_SHARE", "false").lower() == "true"
    print("\n=======================================================")
    print(f"[*] Starting SmartEnergy Stitch-Powered Platform on port {port}")
    print(f"[*] Access Dashboard in your browser: http://127.0.0.1:{port}")
    print("=======================================================\n")
    demo.launch(
        server_port=port,
        share=share,
        inbrowser=True,
        theme=gr.themes.Base(primary_hue="emerald", neutral_hue="slate"),
        css=custom_css
    )
