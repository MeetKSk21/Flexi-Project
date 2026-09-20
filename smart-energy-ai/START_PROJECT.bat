@echo off
chcp 65001 >nul 2>&1
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8
setlocal enabledelayedexpansion
title VoltIQ Pulse - Smart Energy AI Unified Service

echo ============================================================
echo   VoltIQ Pulse: Unified 6-Agent AI Smart Energy Platform
echo ============================================================
echo.

cd /d "%~dp0"

set "PYTHON_EXE="
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe -c "import fastapi" >nul 2>&1
    if !errorlevel! equ 0 (
        set "PYTHON_EXE=venv\Scripts\python.exe"
        echo [OK] Using virtual environment (venv).
    )
)
if "!PYTHON_EXE!"=="" (
    set "PYTHON_EXE=python"
    echo [OK] Using system Python environment.
)

:: Verify data exists
if not exist "data\energy_consumption.csv" (
    echo [*] Generating baseline dataset...
    !PYTHON_EXE! data\generate_data.py
)

echo.
echo [*] Initializing 6-Agent AI Orchestrator & Serving VoltIQ Pulse...
echo [*] Single Unified URL: http://localhost:8000
echo [*] Opening your browser in 2 seconds...
echo.

:: Automatically open browser after 2 seconds
start "" cmd /c "timeout /t 2 >nul & start http://localhost:8000"

echo ============================================================
echo   Application is now RUNNING on http://localhost:8000!
echo   Keep this command window OPEN while using the platform.
echo   Press CTRL + C or double-click STOP_PROJECT.bat to shut down.
echo ============================================================
echo.

!PYTHON_EXE! server.py

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] The server stopped unexpectedly with error code %errorlevel%.
    echo Run STOP_PROJECT.bat if port 8000 is currently occupied.
    echo.
)

pause
