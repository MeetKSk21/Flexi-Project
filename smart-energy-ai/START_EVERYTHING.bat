@echo off
chcp 65001 >nul 2>&1
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8
setlocal enabledelayedexpansion
title VoltIQ Pulse - Master Launcher

echo ============================================================
echo   VoltIQ Pulse: 1-Click Master Launcher (Unified Service)
echo ============================================================
echo.
echo [*] Launching the Unified Smart Energy AI Web Service on port 8000...
echo.

cd /d "%~dp0"

:: Launch START_PROJECT.bat
call START_PROJECT.bat
