@echo off
setlocal enabledelayedexpansion
title VoltIQ Pulse - Safe Shutdown Utility

echo ============================================================
echo   VoltIQ Pulse Smart Energy AI - Application Shutdown
echo ============================================================
echo.

set FOUND=0

for %%P in (8000 7860 3000) do (
    echo [*] Checking for active processes on port %%P...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%%P "') do (
        set PID=%%a
        if not "!PID!"=="0" (
            echo [*] Terminating process ID !PID! on port %%P...
            taskkill /F /PID !PID! >nul 2>&1
            set FOUND=1
        )
    )
)

if "!FOUND!"=="1" (
    echo.
    echo [SUCCESS] Application services have been stopped cleanly.
) else (
    echo.
    echo [INFO] No active application instances found running on ports 8000, 7860, or 3000.
)

echo.
pause
