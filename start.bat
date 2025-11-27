@echo off
title Remote Shutdown - Launcher
cd /d "%~dp0"

echo ==========================================
echo   Remote Shutdown - Starting Services
echo ==========================================
echo.

:: Start desktop service in a new window
echo Starting Desktop Service...
start "Desktop Service" cmd /c "cd /d "%~dp0desktop-service" && npm run dev"

:: Wait a moment for the service to start
timeout /t 2 /nobreak >nul

:: Start mobile app in a new window
echo Starting Mobile App (Expo)...
start "Mobile App" cmd /c "cd /d "%~dp0mobile-app" && npx expo start"

echo.
echo ==========================================
echo   Both services are starting...
echo   Desktop Service: http://localhost:3000
echo   Mobile App: Expo dev server
echo ==========================================
echo.
echo Press any key to close this window...
pause >nul
