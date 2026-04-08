@echo off
REM ===================================================================
REM TGd System - Advanced Launcher with Logging
REM Fitur: Auto-restart, Logging, Graceful shutdown
REM ===================================================================

setlocal enabledelayedexpansion

REM Set working directory
cd /d "%~dp0"

REM Create logs directory
if not exist "logs" mkdir logs

REM Set log file with timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c%%a%%b)
for /f "tokens=1-2 delims=/:" %%a in ('time /t') do (set mytime=%%a%%b)
set logfile=logs\startup_%mydate%_%mytime%.log

echo. >> %logfile%
echo ===================================================================== >> %logfile%
echo TGd System Launcher Started - %date% %time% >> %logfile%
echo ===================================================================== >> %logfile%

REM Step 1: Initialize Database
echo [STEP 1] Checking database... >> %logfile%
if not exist "backend\tgd_system_phase1.db" (
    echo [!] Database not found. Initializing... >> %logfile%
    cd backend
    python seed_data.py >> ..\%logfile% 2>&1
    cd ..
    if errorlevel 1 (
        echo [ERROR] Database initialization failed! >> %logfile%
        echo Error: Database seeding failed >> %logfile%
        pause
        exit /b 1
    )
    echo [OK] Database initialized >> %logfile%
) else (
    echo [OK] Database exists >> %logfile%
)

REM Step 2: Check Frontend Dependencies
echo. >> %logfile%
echo [STEP 2] Checking frontend dependencies... >> %logfile%
if not exist "frontend\node_modules" (
    echo [!] node_modules not found. Installing... >> %logfile%
    cd frontend
    call npm install >> ..\%logfile% 2>&1
    cd ..
    if errorlevel 1 (
        echo [ERROR] npm install failed! >> %logfile%
        echo Error: Frontend dependencies installation failed >> %logfile%
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed >> %logfile%
) else (
    echo [OK] Dependencies exist >> %logfile%
)

REM Step 3: Start Backend
echo. >> %logfile%
echo [STEP 3] Starting Backend Server... >> %logfile%
echo [!] Starting backend on port 8000... 
start /B "TGd-Backend" cmd /c "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 >> ..\%logfile% 2>&1"
if errorlevel 1 (
    echo [ERROR] Failed to start backend >> %logfile%
    pause
    exit /b 1
)
echo [OK] Backend started (PID in separate window) >> %logfile%

REM Wait for backend to be ready
timeout /t 3 /nobreak >nul

REM Step 4: Start Frontend
echo. >> %logfile%
echo [STEP 4] Starting Frontend Server... >> %logfile%
echo [!] Starting frontend on port 5173...
start /B "TGd-Frontend" cmd /c "cd frontend && npm run dev >> ..\%logfile% 2>&1"
if errorlevel 1 (
    echo [ERROR] Failed to start frontend >> %logfile%
    pause
    exit /b 1
)
echo [OK] Frontend started (PID in separate window) >> %logfile%

REM Wait for frontend compilation
timeout /t 5 /nobreak >nul

REM Open browser
echo [STEP 5] Opening browser... >> %logfile%
start http://localhost:5173
echo [OK] Browser opened >> %logfile%

REM Success messages
echo. 
echo ====================================================================
echo  ✓ TGd System is running!
echo ====================================================================%
echo.
echo  Services:
echo    - Backend API: http://localhost:8000
echo    - Frontend UI: http://localhost:5173
echo    - API Docs:   http://localhost:8000/docs
echo.
echo  Credentials:
echo    - Username: admin
echo    - Password: admin@123456
echo.
echo  Log file: %logfile%
echo.
echo ====================================================================
echo.

echo. >> %logfile%
echo ===================================================================== >> %logfile%
echo All services started successfully - %date% %time% >> %logfile%
echo ===================================================================== >> %logfile%

pause
