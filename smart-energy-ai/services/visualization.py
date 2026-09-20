"""
Data Visualization Service for SmartEnergy AI.
Generates responsive Plotly figures with high-contrast, clean typography,
solid functional palette, and WCAG-compliant legibility.
"""

from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px

PLOTLY_TEMPLATE = "plotly_white"
FONT_FAMILY = "'Plus Jakarta Sans', 'Space Grotesk', -apple-system, sans-serif"

# VoltIQ Pulse Stitch Design System Palette
COLOR_SLATE_DARK = "#0f172a"
COLOR_SLATE_LINE = "#64748b"
COLOR_CYAN_PRIMARY = "#0891b2"    # Electric Cyan
COLOR_OFF_PEAK = "#059669"        # Neon Emerald (Sustainable off-peak)
COLOR_PEAK = "#d97706"            # Amber (Peak tariff)
COLOR_CRITICAL = "#dc2626"        # Red (Unusual anomaly marker)
COLOR_GRID = "rgba(148, 163, 184, 0.2)" # Adaptive neutral grid

def plot_time_series(df: pd.DataFrame) -> go.Figure:
    """Plots chronological hourly energy consumption with 24h rolling trendline."""
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=df["timestamp"],
        y=df["energy_kwh"],
        mode="lines",
        name="Hourly Demand (kWh)",
        line=dict(color=COLOR_CYAN_PRIMARY, width=1.4),
        opacity=0.60
    ))

    rolling_24 = df["energy_kwh"].rolling(window=24, min_periods=1).mean()
    fig.add_trace(go.Scatter(
        x=df["timestamp"],
        y=rolling_24,
        mode="lines",
        name="24-Hour Moving Average (kWh)",
        line=dict(color=COLOR_SLATE_DARK, width=2.5)
    ))

    fig.update_layout(
        title=dict(text="Electricity Usage Over Time", font=dict(family=FONT_FAMILY, size=14, color=COLOR_SLATE_DARK)),
        xaxis=dict(title="Timeline", gridcolor=COLOR_GRID, tickfont=dict(family=FONT_FAMILY, size=11)),
        yaxis=dict(title="Usage (kWh)", gridcolor=COLOR_GRID, tickfont=dict(family=FONT_FAMILY, size=11)),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        template=PLOTLY_TEMPLATE,
        hovermode="x unified",
        margin=dict(l=40, r=40, t=40, b=40),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1, font=dict(family=FONT_FAMILY, size=11))
    )
    return fig

def plot_hourly_profile(hourly_profile: Dict[int, float]) -> go.Figure:
    """Plots 24-hour diurnal profile showing off-peak, standard, and peak hours."""
    hours = list(range(24))
    values = [hourly_profile.get(h, 0.0) for h in hours]
    
    colors = []
    for h in hours:
        if 18 <= h <= 22:
            colors.append(COLOR_PEAK)      # Peak tariff
        elif 23 <= h or h <= 5:
            colors.append(COLOR_OFF_PEAK)  # Off-peak
        else:
            colors.append(COLOR_CYAN_PRIMARY) # Standard

    fig = go.Figure(data=[
        go.Bar(
            x=[f"{h:02d}:00" for h in hours],
            y=values,
            marker_color=colors,
            text=[f"{v:.2f}" for v in values],
            textposition="auto",
            textfont=dict(family=FONT_FAMILY, size=10)
        )
    ])
    fig.update_layout(
        title=dict(text="Average Hourly Usage (Green: Off-Peak, Blue: Normal, Red: Peak Hours)", font=dict(family=FONT_FAMILY, size=14, color=COLOR_SLATE_DARK)),
        xaxis=dict(title="Hour of the Day", gridcolor=COLOR_GRID, tickfont=dict(family=FONT_FAMILY, size=11)),
        yaxis=dict(title="Average Usage (kWh)", gridcolor=COLOR_GRID, tickfont=dict(family=FONT_FAMILY, size=11)),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        template=PLOTLY_TEMPLATE,
        margin=dict(l=40, r=40, t=40, b=40)
    )
    return fig

def plot_daily_consumption(df: pd.DataFrame) -> go.Figure:
    """Bar chart of daily cumulative consumption."""
    daily_df = df.groupby("date")["energy_kwh"].sum().reset_index()
    fig = go.Figure(data=[
        go.Bar(
            x=daily_df["date"],
            y=daily_df["energy_kwh"],
            marker_color=COLOR_SLATE_LINE
        )
    ])
    fig.update_layout(
        title=dict(text="Daily Electricity Usage (kWh)", font=dict(family=FONT_FAMILY, size=14, color=COLOR_SLATE_DARK)),
        xaxis=dict(title="Date", gridcolor=COLOR_GRID, tickfont=dict(family=FONT_FAMILY, size=11)),
        yaxis=dict(title="Daily Total (kWh)", gridcolor=COLOR_GRID, tickfont=dict(family=FONT_FAMILY, size=11)),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        template=PLOTLY_TEMPLATE,
        margin=dict(l=40, r=40, t=40, b=40)
    )
    return fig

def plot_forecast(df_hist: pd.DataFrame, forecast_records: List[Dict[str, Any]]) -> go.Figure:
    """Plots observed consumption alongside 24h predictive horizon."""
    recent_hist = df_hist.iloc[-48:].copy()
    future_df = pd.DataFrame(forecast_records)

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=recent_hist["timestamp"],
        y=recent_hist["energy_kwh"],
        mode="lines+markers",
        name="Past 48 Hours",
        line=dict(color="#64748b", width=1.8),
        marker=dict(size=4)
    ))

    fig.add_trace(go.Scatter(
        x=future_df["timestamp"],
        y=future_df["predicted_kwh"],
        mode="lines+markers",
        name="Tomorrow's Projected Usage",
        line=dict(color=COLOR_OFF_PEAK, width=2.2, dash="dash"),
        marker=dict(size=5, symbol="square")
    ))

    fig.update_layout(
        title=dict(text="Recent Electricity Usage and Tomorrow's Projected Demand", font=dict(family=FONT_FAMILY, size=14, color=COLOR_SLATE_DARK)),
        xaxis=dict(title="Timeline", gridcolor=COLOR_GRID, tickfont=dict(family=FONT_FAMILY, size=11)),
        yaxis=dict(title="Usage (kWh)", gridcolor=COLOR_GRID, tickfont=dict(family=FONT_FAMILY, size=11)),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        template=PLOTLY_TEMPLATE,
        hovermode="x unified",
        margin=dict(l=40, r=40, t=40, b=40),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1, font=dict(family=FONT_FAMILY, size=11))
    )
    return fig

def plot_anomalies(df: pd.DataFrame, anomaly_records: List[Dict[str, Any]]) -> go.Figure:
    """Plots baseline load with flagged anomalies clearly distinguished."""
    fig = go.Figure()
    
    fig.add_trace(go.Scatter(
        x=df["timestamp"],
        y=df["energy_kwh"],
        mode="lines",
        name="Normal Usage",
        line=dict(color="#94a3b8", width=1.2)
    ))

    if anomaly_records:
        anom_ts = [a["timestamp"] for a in anomaly_records]
        anom_vals = [a["measured_kwh"] for a in anomaly_records]
        anom_text = [f"{a['severity'].upper()}: {a['explanation']}" for a in anomaly_records]

        fig.add_trace(go.Scatter(
            x=anom_ts,
            y=anom_vals,
            mode="markers",
            name="Unusual Spikes",
            marker=dict(color=COLOR_CRITICAL, size=9, symbol="diamond", line=dict(width=1.5, color="#7f1d1d")),
            text=anom_text,
            hoverinfo="x+y+text"
        ))

    fig.update_layout(
        title=dict(text="Electricity Usage with Unusual Spikes Highlighted", font=dict(family=FONT_FAMILY, size=14, color=COLOR_SLATE_DARK)),
        xaxis=dict(title="Timeline", gridcolor=COLOR_GRID, tickfont=dict(family=FONT_FAMILY, size=11)),
        yaxis=dict(title="Usage (kWh)", gridcolor=COLOR_GRID, tickfont=dict(family=FONT_FAMILY, size=11)),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        template=PLOTLY_TEMPLATE,
        margin=dict(l=40, r=40, t=40, b=40),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1, font=dict(family=FONT_FAMILY, size=11))
    )
    return fig

def plot_appliance_pie(appliance_table: List[Dict[str, Any]]) -> go.Figure:
    """Donut chart showing appliance energy disaggregation."""
    df_app = pd.DataFrame(appliance_table)
    fig = px.pie(
        df_app,
        names="appliance_name",
        values="monthly_kwh",
        title="Where Your Energy Goes (Appliance Share)",
        hole=0.45,
        template=PLOTLY_TEMPLATE,
        color_discrete_sequence=["#0f172a", "#1e293b", "#334155", "#475569", "#64748b", "#0284c7", "#0d9488", "#059669", "#d97706", "#dc2626"]
    )
    fig.update_traces(textinfo="percent+label", textfont=dict(family=FONT_FAMILY, size=11))
    fig.update_layout(
        title=dict(font=dict(family=FONT_FAMILY, size=14, color=COLOR_SLATE_DARK)),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=20, r=20, t=40, b=20),
        showlegend=False
    )
    return fig

def plot_cost_comparison(current_cost: float, optimized_cost: float, currency_symbol: str = "₹") -> go.Figure:
    """Bar chart contrasting current vs load-shifted monthly bills."""
    fig = go.Figure(data=[
        go.Bar(
            name="Current Bill",
            x=["Monthly Projected Bill"],
            y=[current_cost],
            marker_color=COLOR_PEAK,
            text=[f"{currency_symbol}{current_cost:.2f}"],
            textposition="auto",
            textfont=dict(family=FONT_FAMILY, size=12, color="#ffffff")
        ),
        go.Bar(
            name="Optimized Bill (After Shifting Heavy Loads)",
            x=["Monthly Projected Bill"],
            y=[optimized_cost],
            marker_color=COLOR_OFF_PEAK,
            text=[f"{currency_symbol}{optimized_cost:.2f}"],
            textposition="auto",
            textfont=dict(family=FONT_FAMILY, size=12, color="#ffffff")
        )
    ])
    fig.update_layout(
        title=dict(text="Monthly Bill: Current Schedule vs After Shifting Heavy Appliances", font=dict(family=FONT_FAMILY, size=14, color=COLOR_SLATE_DARK)),
        yaxis=dict(title=f"Cost ({currency_symbol})", gridcolor=COLOR_GRID, tickfont=dict(family=FONT_FAMILY, size=11)),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        barmode="group",
        template=PLOTLY_TEMPLATE,
        margin=dict(l=40, r=40, t=40, b=40),
        legend=dict(font=dict(family=FONT_FAMILY, size=11))
    )
    return fig
