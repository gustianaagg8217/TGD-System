#!/bin/bash
# TGd System - Quick Setup Script for Linux/macOS

set -e

echo ""
echo "====================================="
echo " TGd System - Setup Script"
echo "====================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 is not installed"
    echo "Please install Python 3.8+ first"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js 16+ first"
    exit 1
fi

echo "Python version:"
python3 --version
echo ""
echo "Node.js version:"
node --version
echo ""

# Setup Backend
echo "====================================="
echo "SETTING UP BACKEND"
echo "====================================="
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing Python dependencies..."
pip install -q -r requirements.txt

echo ""
echo "Creating .env file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ".env created. Please edit backend/.env with your database configuration."
fi

echo ""
echo "Running database seed script..."
python seed_data.py

echo ""
echo "Backend setup complete!"
echo ""

# Setup Frontend
echo "====================================="
echo "SETTING UP FRONTEND"
echo "====================================="
cd ../frontend

echo "Installing Node dependencies..."
npm install --silent

echo ""
echo "Creating .env file..."
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

echo ""
echo "Frontend setup complete!"
echo ""

cd ..

echo "====================================="
echo "SETUP COMPLETE"
echo "====================================="
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your database credentials"
echo "2. Run backend:  cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "3. Run frontend: cd frontend && npm run dev"
echo ""
echo "Backend will be at: http://localhost:8000"
echo "Frontend will be at: http://localhost:5173"
echo "API Docs will be at: http://localhost:8000/docs"
echo ""
echo "Default credentials:"
echo "  Email: admin@tgd.com"
echo "  Password: admin@123456"
echo ""
