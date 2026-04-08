@echo off
REM ===================================================================
REM TGd System - Stop All Services
REM Menghentikan semua running services dengan aman
REM ===================================================================

echo.
echo ====================================================================
echo  TGd System - Stopping All Services
echo ====================================================================
echo.

REM Kill processes
taskkill /F /IM python.exe /FI "WINDOWTITLE eq TGd*" /IM node.exe /FI "WINDOWTITLE eq TGd*" 2>nul

REM More forceful approach
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul

echo [OK] All services stopped
echo.
pause
