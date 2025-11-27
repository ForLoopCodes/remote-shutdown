@echo off
title Uninstall Remote Shutdown Service
cd /d "%~dp0"

echo ==========================================
echo   Uninstalling Remote Shutdown Service
echo ==========================================
echo.

:: Check for admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Please run this as Administrator!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

echo Uninstalling service...
node uninstall-service.js

echo.
pause
