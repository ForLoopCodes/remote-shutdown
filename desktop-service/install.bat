@echo off
title Install Remote Shutdown Service
cd /d "%~dp0"

echo ==========================================
echo   Installing Remote Shutdown Service
echo ==========================================
echo.
echo This will install the service to run on startup.
echo Requires Administrator privileges.
echo.

:: Check for admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Please run this as Administrator!
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

:: Build TypeScript first
echo Building TypeScript...
call npm run build
if %errorLevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo Installing service...
node install-service.js

echo.
pause
