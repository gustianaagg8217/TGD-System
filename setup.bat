@echo off
REM TGd System - Quick Setup Script for Windows

echo.
echo ====================================="
echo  TGd System - Setup Script
echo =====================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo Python version:
python --version
echo.
echo Node.js version:
node --version
echo.

REM Setup Backend
echo =====================================
echo SETTING UP BACKEND
echo =====================================
cd backend

if not exist venv (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing Python dependencies...
pip install -q -r requirements.txt

echo.
echo Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env created. Please edit backend\.env with your database configuration.
)

echo.
echo Running database migrations...
python seed_data.py

echo.
echo Backend setup complete!
echo To start backend: cd backend && venv\Scripts\activate && uvicorn app.main:app --reload
echo.

REM Setup Frontend
echo =====================================
echo SETTING UP FRONTEND
echo =====================================
cd ..\frontend

echo Installing Node dependencies...
call npm install

echo.
echo Creating .env file...
if not exist .env (
    copy .env.example .env
)

echo.
echo Frontend setup complete!
echo To start frontend: cd frontend && npm run dev
echo.

cd ..

echo =====================================
echo SETUP COMPLETE
echo =====================================
echo.
echo Next steps:
echo 1. Edit backend\.env with your database credentials
echo 2. Run backend:  cd backend && venv\Scripts\activate && uvicorn app.main:app --reload
echo 3. Run frontend: cd frontend && npm run dev
echo.
echo Backend will be at: http://localhost:8000
echo Frontend will be at: http://localhost:5173
echo API Docs will be at: http://localhost:8000/docs
echo.
echo Default credentials:
echo   Email: admin@tgd.com
echo   Password: admin@123456
echo.
pause
