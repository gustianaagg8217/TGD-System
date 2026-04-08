# ===================================================================
# TGd System - PowerShell One-Click Launcher
# Menjalankan: Backend (FastAPI), Frontend (React), Database
# ===================================================================

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  TGd System - Starting All Services" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

# Set working directory
Set-Location $PSScriptRoot

# Step 1: Check and seed database
if (-not (Test-Path "backend\tgd_system_phase1.db")) {
    Write-Host "[1/4] Initializing database..." -ForegroundColor Yellow
    Push-Location backend
    python seed_data.py
    Pop-Location
    Write-Host ""
}

# Step 2: Check frontend dependencies
if (-not (Test-Path "frontend\node_modules")) {
    Write-Host "[2/4] Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location frontend
    npm install
    Pop-Location
    Write-Host ""
}

# Step 3: Start backend server
Write-Host "[3/4] Starting Backend Server (FastAPI) on http://localhost:8000..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList {
    Set-Location $args[0]
    Write-Host "Backend Server is starting..."
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
} -PassThru -NoNewWindow -ArgumentList (Get-Location).Path\backend
Start-Sleep -Seconds 3

# Step 4: Start frontend server
Write-Host "[4/4] Starting Frontend Server (React) on http://localhost:5173..." -ForegroundColor Yellow
$frontendProcess = Start-Process powershell -ArgumentList {
    Set-Location $args[0]
    Write-Host "Frontend Server is starting..."
    npm run dev
} -PassThru -NoNewWindow -ArgumentList (Get-Location).Path\frontend
Start-Sleep -Seconds 3

# Open browser
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "  All servers starting... Opening browser in 5 seconds" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "All services are running!" -ForegroundColor Green
Write-Host "  - Backend API: http://localhost:8000" -ForegroundColor White
Write-Host "  - Frontend UI: http://localhost:5173" -ForegroundColor White
Write-Host "  - API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Processes:" -ForegroundColor Cyan
Write-Host "  Backend PID: $($backendProcess.Id)"
Write-Host "  Frontend PID: $($frontendProcess.Id)"
Write-Host ""

# Wait for processes to complete
$backendProcess, $frontendProcess | Wait-Process
