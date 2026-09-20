@echo off
chcp 65001 >nul 2>&1
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8
setlocal enabledelayedexpansion
title SmartEnergy AI - Automated Test Suite Runner

echo ============================================================
echo   SmartEnergy AI - Automated Test Suite Runner
echo ============================================================
echo.

cd /d "%~dp0"

set "PYTHON_EXE="
if exist "venv\Scripts\python.exe" (
    set "PYTHON_EXE=venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

echo [*] Running all 24 Pytest unit tests (Validation, Forecasting, Anomaly, Optimization, Security)...
echo.
!PYTHON_EXE! -m pytest tests/ -v

echo.
echo ============================================================
echo   Test Execution Finished
echo ============================================================
pause
