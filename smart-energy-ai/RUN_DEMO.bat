@echo off
chcp 65001 >nul 2>&1
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8
setlocal enabledelayedexpansion
title SmartEnergy AI - College Demonstration Launcher

echo ============================================================
echo   SmartEnergy AI - College Demonstration Mode
echo ============================================================
echo.

cd /d "%~dp0"

echo [*] Initializing demo data environment...
if exist "venv\Scripts\python.exe" (
    set "PYTHON_EXE=venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

!PYTHON_EXE! data\generate_data.py
start "" http://127.0.0.1:7860
!PYTHON_EXE! app.py

pause
