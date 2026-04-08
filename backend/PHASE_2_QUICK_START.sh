#!/bin/bash
# Phase 2 WebSocket Quick Start Guide
# Usage: Run commands below in sequence

echo "================================"
echo "Phase 2: WebSocket Setup"
echo "================================"
echo ""

# Step 1: Verify backend is running
echo "Step 1: Start Backend Server"
echo "Command: python run_server.py"
echo "Expected: 'Application startup complete' on port 8000"
echo ""

# Step 2: Generate test data
echo "Step 2: Start Sensor Data Simulator"
echo "Command: python simulate_sensor_data.py"
echo "Expected: Real-time sensor readings sent every 3 seconds"
echo ""

# Step 3: Monitor WebSocket
echo "Step 3: Monitor WebSocket in Real-time"
echo "Option A - Using test client:"
echo "  Command: python test_websocket_client.py"
echo "  Expected: 3 test suites run successfully"
echo ""
echo "Option B - Using wscat (requires: npm install -g wscat):"
echo "  Command: wscat -c ws://localhost:8000/ws/sensors/{asset-id}"
echo "  Expected: Real-time sensor messages appear"
echo ""

# Step 4: Check dashboard
echo "Step 4: Monitor Dashboard (Open in Browser)"
echo "URL: http://localhost:5173"
echo "Navigate to: Sensors tab"
echo "Expected: Real-time sensor values updating"
echo ""

echo "================================"
echo "Testing Checklist"
echo "================================"
echo "□ Backend server running"
echo "□ Sensor simulator sending data"
echo "□ WebSocket test client passes all tests"
echo "□ Frontend displaying real-time data"
echo "□ Alerts triggering on threshold violations"
echo ""

# Available endpoints
echo "================================"
echo "WebSocket Endpoints"
echo "================================"
echo "Single Asset: ws://localhost:8000/ws/sensors/{asset-id}"
echo "Multi Asset:  ws://localhost:8000/ws/sensors/multi"
echo ""

# Troubleshooting
echo "================================"
echo "Troubleshooting"
echo "================================"
echo "Issue: Connection refused"
echo "  Fix: Make sure backend is running (python run_server.py)"
echo ""
echo "Issue: Asset not found error"
echo "  Fix: Get actual asset ID from database:"
echo "       SELECT id, name FROM assets LIMIT 1;"
echo ""
echo "Issue: No data in WebSocket"
echo "  Fix: Start sensor simulator to generate data"
echo ""
echo "Issue: Frontend not updating"
echo "  Fix: Check WebSocket URL in frontend env"
echo ""

echo "✅ Phase 2 Setup Complete!"
echo ""
