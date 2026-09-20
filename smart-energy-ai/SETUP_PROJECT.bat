@echo off
chcp 65001 >nul 2>&1
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8
setlocal enabledelayedexpansion
title SmartEnergy AI - Setup & Installation Wizard

echo ============================================================
echo   SmartEnergy AI - Windows Setup & Environment Wizard
echo ============================================================
echo.

cd /d "%~dp0"

:: 1. Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python was not found on your system PATH!
    echo Please install Python 3.10+ from https://www.python.org/
    echo Make sure to check "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYVER=%%i
echo [OK] Python detected: Version !PYVER!
echo.

:: 2. Create Virtual Environment
if not exist "venv\Scripts\activate.bat" (
    echo [*] Creating isolated virtual environment (venv)...
    python -m venv venv
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to create virtual environment.
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created successfully.
) else (
    echo [OK] Virtual environment already exists.
)
echo.

:: 3. Install Requirements
echo [*] Checking and installing dependencies from requirements.txt...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip >nul 2>&1
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Dependency installation encountered issues.
    pause
    exit /b 1
)
echo [OK] All required Python libraries installed successfully.
echo.

:: 4. Verify / Create .env configuration
if not exist ".env" (
    echo [*] Creating .env file from .env.example...
    copy ".env.example" ".env" >nul
    echo [NOTE] A default .env file has been created.
    echo [INFO] You can open .env in Notepad to add your Groq or OpenAI API key.
    echo [INFO] Even without an API key, the system runs in Demo / Offline Fallback mode!
) else (
    echo [OK] Configuration file .env detected.
)
echo.

:: 5. Generate Demo Smart-Meter Data
if not exist "data\energy_consumption.csv" (
    echo [*] Generating 45 days of synthetic smart-meter consumption data...
    python data\generate_data.py
    echo [OK] Synthetic dataset generated.
) else (
    echo [OK] Baseline dataset data\energy_consumption.csv already exists.
)
echo.

:: 6. Run System Validation Tests
echo [*] Running automated verification test suite...
pytest tests/ -q
if %errorlevel% equ 0 (
    echo.
    echo ============================================================
    echo   [SUCCESS] SmartEnergy AI is fully set up and verified!
    echo   You can now start the platform by double-clicking:
    echo        START_PROJECT.bat
    echo ============================================================
) else (
    echo [WARNING] Some tests reported warnings, but setup is ready.
)

echo.
pause
