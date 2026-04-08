@echo off
REM ===================================================================
REM TGd System - One-Click Launcher
REM Menjalankan semua server: Backend, Frontend, dan Database
REM ===================================================================

setlocal enabledelayedexpansion

echo.
echo ====================================================================
echo  TGd System - Starting All Services
echo ====================================================================
echo.

REM Set working directory
cd /d "%~dp0"

REM Check if backend database exists, if not seed it
if not exist "backend\tgd_system_phase1.db" (
    echo [1/4] Initializing database...
    cd backend
    python seed_data.py
    cd ..
    echo.
)

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo [2/4] Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
    echo.
)

REM Start backend server in a new window
echo [3/4] Starting Backend Server (FastAPI) on http://localhost:8000...
start "TGd Backend Server" cmd /k "cd backend && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000"
timeout /t 3 /nobreak >nul

REM Start frontend server in a new window
echo [4/4] Starting Frontend Server (React) on http://localhost:5173...
start "TGd Frontend Server" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

REM Open browser
echo.
echo ====================================================================
echo  All servers starting... Opening browser in 5 seconds
echo ====================================================================
echo.
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo All services are running!
echo  - Backend API: http://localhost:8000
echo  - Frontend UI: http://localhost:5173
echo  - API Docs: http://localhost:8000/docs
echo.
echo Close this window anytime - individual server windows will remain open
echo.
pause
