# Phase 1 Testing Guide: IoT Sensor Data Ingestion
## Real-Time Mining Operations Monitoring - PT. ANDA SELALU UNTUNG

**Date:** April 7, 2026  
**Status:** Phase 1 testing procedures  
**Goal:** Validate all 12 API endpoints before Phase 2 deployment

---

## Prerequisites

✅ Backend server running on `http://localhost:8000`  
✅ Sample data generated (`sensor_test_data.json`)  
✅ Postman, cURL, or similar API testing tool  
✅ Database initialized with tables  

---

## Test Data Generation

### Step 1: Generate Test Data

```bash
cd backend
python generate_sensor_test_data.py
```

**Output:**
```
🔧 Generating test sensor data for PT. ANDA SELALU UNTUNG mining operations...
✅ Generated 480 sensor readings
💾 Saved to sensor_test_data.json
```

**Contents of `sensor_test_data.json`:**
```json
{
  "metadata": {
    "generated_at": "2026-04-07T15:48:00Z",
    "total_readings": 480,
    "sensors": {
      "vibration": 100,
      "temperature": 60,
      "fuel": 80,
      "gps": 100,
      "electrical": 70,
      "production": 60,
      "fault": 10
    }
  },
  "records": [
    {
      "sensor_id": "VIBE-EQP-001",
      "asset_id": "EQP-001",
      "sensor_type": "vibration",
      ...
    },
    ...
  ]
}
```

---

## API Endpoint Testing

### TEST 1: Single Sensor Data Ingest

**Endpoint:** `POST /api/v1/sensors/ingest`

**Purpose:** Validate single sensor reading ingestion, threshold checking, and alert auto-generation

**Test Case 1.1: Normal Reading (No Alert)**

```bash
curl -X POST "http://localhost:8000/api/v1/sensors/ingest" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sensor_id": "VIBE-EQP-001",
    "asset_id": "EQP-001",
    "sensor_type": "vibration",
    "reading_value": 3.2,
    "reading_unit": "mm/s",
    "x_axis": 2.1,
    "y_axis": 1.8,
    "z_axis": 2.4,
    "threshold_high": 7.1,
    "threshold_low": 0.0,
    "timestamp": "2026-04-07T15:45:32Z"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "sensor_id": "VIBE-EQP-001",
  "asset_id": "EQP-001",
  "sensor_type": "vibration",
  "reading_value": 3.2,
  "reading_unit": "mm/s",
  "x_axis": 2.1,
  "y_axis": 1.8,
  "z_axis": 2.4,
  "status": "normal",
  "threshold_high": 7.1,
  "threshold_low": 0.0,
  "timestamp": "2026-04-07T15:45:32Z",
  "created_at": "2026-04-07T15:45:35Z",
  "updated_at": "2026-04-07T15:45:35Z"
}
```

**Verify in Database:**
```bash
# Check sensor reading was stored
sqlite3 tgd_system.db "SELECT COUNT(*) FROM sensor_readings WHERE sensor_id='VIBE-EQP-001';"
# Expected: 1

# Check status
sqlite3 tgd_system.db "SELECT status FROM sensor_readings WHERE sensor_id='VIBE-EQP-001';"
# Expected: normal
```

---

**Test Case 1.2: Critical Reading (Should Auto-Alert)**

```bash
curl -X POST "http://localhost:8000/api/v1/sensors/ingest" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sensor_id": "VIBE-EQP-004",
    "asset_id": "EQP-004",
    "sensor_type": "vibration",
    "reading_value": 8.5,
    "reading_unit": "mm/s",
    "threshold_high": 7.1,
    "timestamp": "2026-04-07T15:46:00Z"
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "sensor_id": "VIBE-EQP-004",
  "asset_id": "EQP-004",
  "sensor_type": "vibration",
  "reading_value": 8.5,
  "status": "critical",
  "timestamp": "2026-04-07T15:46:00Z",
  ...
}
```

**Verify Alert Was Created:**
```bash
# Check alerts table
sqlite3 tgd_system.db "SELECT * FROM sensor_alerts WHERE asset_id='EQP-004';"
# Expected: Alert with severity='critical', alert_type='threshold_exceeded'
```

---

### TEST 2: Bulk Sensor Data Import

**Endpoint:** `POST /api/v1/sensors/bulk`

**Purpose:** Import up to 1,000 sensor records in a single request

```bash
# First, extract the records from test data
python3 << 'EOF'
import json

with open('sensor_test_data.json', 'r') as f:
    data = json.load(f)

# Save just the records for bulk import
bulk_payload = {
    "records": data['records'][:100],  # First 100 for testing
    "override_existing": False
}

with open('bulk_import_payload.json', 'w') as f:
    json.dump(bulk_payload, f)

print(f"✅ Created bulk_import_payload.json with {len(bulk_payload['records'])} records")
EOF

# Now POST the bulk data
curl -X POST "http://localhost:8000/api/v1/sensors/bulk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @bulk_import_payload.json
```

**Expected Response (202 Accepted):**
```json
{
  "imported": 95,
  "skipped": 5,
  "errors": 0,
  "error_details": null
}
```

**Verify Count in Database:**
```bash
# Count total sensor readings after bulk import
sqlite3 tgd_system.db "SELECT COUNT(*) FROM sensor_readings;"
# Expected: Should be >= 100 (depending on duplicates)

# Count by sensor type
sqlite3 tgd_system.db "SELECT sensor_type, COUNT(*) FROM sensor_readings GROUP BY sensor_type;"
# Expected sample output:
# vibration|95
# temperature|58
# fuel|78
# gps|98
# electrical|68
# production|59
```

---

### TEST 3: Query Sensor Data with Time Range

**Endpoint:** `GET /api/v1/sensors/data`

**Purpose:** Retrieve historical sensor readings for analytics and reporting

**Test Case 3.1: Get All Vibration Data for Equipment**

```bash
curl -X GET "http://localhost:8000/api/v1/sensors/data" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -G \
  -d "asset_id=EQP-001" \
  -d "sensor_type=vibration" \
  -d "from_date=2026-04-01T00:00:00Z" \
  -d "to_date=2026-04-08T00:00:00Z" \
  -d "limit=10"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "asset_id": "EQP-001",
    "sensor_id": "VIBE-EQP-001",
    "sensor_type": "vibration",
    "reading_value": 3.2,
    "reading_unit": "mm/s",
    "x_axis": 2.1,
    "y_axis": 1.8,
    "z_axis": 2.4,
    "status": "normal",
    "timestamp": "2026-04-07T10:15:32Z",
    ...
  },
  ...
]
```

**Verify:**
```bash
# Count all vibration readings for EQP-001
sqlite3 tgd_system.db "SELECT COUNT(*) FROM sensor_readings WHERE asset_id='EQP-001' AND sensor_type='vibration';"
# Expected: Should match or exceed response count
```

---

**Test Case 3.2: Get All Sensor Data for Asset (No Type Filter)**

```bash
curl -X GET "http://localhost:8000/api/v1/sensors/data" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -G \
  -d "asset_id=HT-001" \
  -d "from_date=2026-04-05T00:00:00Z" \
  -d "to_date=2026-04-07T23:59:59Z" \
  -d "limit=50"
```

**Expected Response:**
```json
[
  {
    "id": "...",
    "asset_id": "HT-001",
    "sensor_id": "FUEL-HT-001",
    "sensor_type": "fuel",
    "reading_value": 280.5,
    ...
  },
  {
    "id": "...",
    "asset_id": "HT-001",
    "sensor_id": "GPS-HT-001",
    "sensor_type": "gps",
    "reading_value": "-6.2088,106.8456",
    ...
  },
  ...
]
```

---

### TEST 4: Get Sensor Alerts

**Endpoint:** `GET /api/v1/sensors/alerts`

**Purpose:** Retrieve triggered alerts for maintenance and operations teams

**Test Case 4.1: Get All Unresolved Critical Alerts**

```bash
curl -X GET "http://localhost:8000/api/v1/sensors/alerts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -G \
  -d "severity=critical" \
  -d "status=unresolved" \
  -d "limit=20"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "650e8400-e29b-41d4-a716-446655440003",
    "asset_id": "EQP-004",
    "sensor_id": "VIBE-EQP-004",
    "alert_type": "threshold_exceeded",
    "severity": "critical",
    "message": "Sensor VIBE-EQP-004 (vibration) reading 8.5 mm/s exceeds critical threshold",
    "action_required": "Stop operations and inspect dredger immediately",
    "threshold_value": 7.1,
    "reading_value": 8.5,
    "timestamp": "2026-04-07T15:46:00Z",
    "resolved_at": null,
    "resolved_by": null,
    ...
  }
]
```

**Verify Count:**
```bash
# Count unresolved critical alerts
sqlite3 tgd_system.db "SELECT COUNT(*) FROM sensor_alerts WHERE severity='critical' AND resolved_at IS NULL;"
```

---

**Test Case 4.2: Get Alerts for Specific Asset**

```bash
curl -X GET "http://localhost:8000/api/v1/sensors/alerts" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -G \
  -d "asset_id=EQP-001" \
  -d "status=unresolved"
```

**Expected Response:** All unresolved alerts for the excavator

---

### TEST 5: Get Integration Status

**Endpoint:** `GET /api/v1/sensors/status`

**Purpose:** Monitor health of all IoT data sources (MQTT, REST APIs, etc.)

```bash
curl -X GET "http://localhost:8000/api/v1/sensors/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": "750e8400-e29b-41d4-a716-446655440001",
    "integration_name": "MQTT Broker - Main (Mosquitto)",
    "integration_type": "mqtt",
    "status": "connected",
    "last_successful_sync": "2026-04-07T15:48:30Z",
    "records_processed": 1250,
    "records_failed": 0,
    "error_message": null,
    "next_retry": null,
    ...
  },
  {
    "id": "750e8400-e29b-41d4-a716-446655440002",
    "integration_name": "REST API Gateway",
    "integration_type": "rest_api",
    "status": "disconnected",
    "last_successful_sync": "2026-04-06T22:15:00Z",
    "records_processed": 580,
    "records_failed": 12,
    "error_message": "Connection timeout",
    "next_retry": "2026-04-07T16:00:00Z",
    ...
  }
]
```

**Purpose:** To quickly identify which integrations need attention

---

### TEST 6: Get Asset Sensor Summary

**Endpoint:** `GET /api/v1/sensors/asset/{asset_id}`

**Purpose:** Quick overview of all sensors and condition for a single asset

```bash
curl -X GET "http://localhost:8000/api/v1/sensors/asset/EQP-001" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "asset_id": "EQP-001",
  "asset_name": "Excavator CAT 390F",
  "sensors_active": 1,
  "sensors_warning": 0,
  "sensors_critical": 0,
  "latest_readings": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "sensor_id": "VIBE-EQP-001",
      "sensor_type": "vibration",
      "reading_value": 3.2,
      "reading_unit": "mm/s",
      "status": "normal",
      "timestamp": "2026-04-07T15:47:00Z",
      ...
    }
  ],
  "active_alerts": []
}
```

**Use Case:** Operations dashboard can fetch this every 30 seconds for real-time status

---

### TEST 7: Compute Asset Health Score

**Endpoint:** `POST /api/v1/sensors/health-score`

**Purpose:** Calculate 0-100% health score based on sensor data and alerts

**Test Case 7.1: Healthy Equipment**

```bash
curl -X POST "http://localhost:8000/api/v1/sensors/health-score" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "asset_id": "EQP-001",
    "include_predictive": false
  }'
```

**Expected Response (200 OK):**
```json
{
  "asset_id": "EQP-001",
  "asset_name": "Excavator CAT 390F",
  "overall_health_percent": 95,
  "status": "healthy",
  "key_metrics": {
    "vibration": 100,
    "temperature": 100
  },
  "failure_risk_percent": null,
  "estimated_ttf_hours": null,
  "last_updated": "2026-04-07T15:48:45Z"
}
```

---

**Test Case 7.2: Equipment with Issues**

```bash
curl -X POST "http://localhost:8000/api/v1/sensors/health-score" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "asset_id": "EQP-004",
    "include_predictive": false
  }'
```

**Expected Response (if equipment has critical readings):**
```json
{
  "asset_id": "EQP-004",
  "asset_name": "Dredger KIP-3000",
  "overall_health_percent": 45,
  "status": "critical",
  "key_metrics": {
    "vibration": 50
  },
  "failure_risk_percent": null,
  "last_updated": "2026-04-07T15:48:50Z"
}
```

---

## Performance Benchmarks

Run these tests to validate performance:

### Benchmark 1: Single Ingest Latency

```bash
time curl -X POST "http://localhost:8000/api/v1/sensors/ingest" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"sensor_id":"BENCH-001","asset_id":"EQP-001",...}'
```

**Target:** < 500ms per request  
**Acceptable:** < 1s per request

---

### Benchmark 2: Bulk Import Throughput

```bash
# Import 1000 records and time it
time curl -X POST "http://localhost:8000/api/v1/sensors/bulk" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @bulk_import_1000_records.json
```

**Target:** > 500 records/second  
**Acceptable:** > 100 records/second

---

### Benchmark 3: Data Query Performance

```bash
# Query 10,000 readings with time range
time curl -X GET "http://localhost:8000/api/v1/sensors/data" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -G \
  -d "asset_id=EQP-001" \
  -d "from_date=2026-01-01T00:00:00Z" \
  -d "to_date=2026-04-07T23:59:59Z" \
  -d "limit=10000"
```

**Target:** < 2s response time  
**Acceptable:** < 5s response time

---

## Validation Checks

### Database Schema Validation

```bash
# Verify all tables exist
sqlite3 tgd_system.db ".tables"
# Expected output: sensor_readings sensor_alerts iot_data_syncs ... (and others)

# Verify indexes
sqlite3 tgd_system.db ".indices"
# Expected: ix_sensor_readings_asset_type_timestamp, ix_sensor_alerts_asset_severity_resolved, etc.

# Check row counts
sqlite3 tgd_system.db "
SELECT 
  'sensor_readings' as table_name, COUNT(*) as row_count FROM sensor_readings
UNION ALL
SELECT 'sensor_alerts', COUNT(*) FROM sensor_alerts
UNION ALL
SELECT 'iot_data_syncs', COUNT(*) FROM iot_data_syncs;
"
```

---

### API Endpoint Validation

```bash
# Get all endpoints and documentation
curl "http://localhost:8000/api/v1/openapi.json"

# View Swagger UI
#   → http://localhost:8000/docs

# View ReDoc
#   → http://localhost:8000/redoc
```

---

## Error Handling Tests

### Test Invalid Asset ID

```bash
curl -X POST "http://localhost:8000/api/v1/sensors/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "sensor_id": "TEST-001",
    "asset_id": "INVALID-ASSET",
    ...
  }'
```

**Expected Response (404 Not Found):**
```json
{
  "detail": "Asset INVALID-ASSET not found"
}
```

---

### Test Missing Required Field

```bash
curl -X POST "http://localhost:8000/api/v1/sensors/ingest" \
  -H "Content-Type: application/json" \
  -d '{
    "sensor_id": "TEST-001",
    // Missing asset_id
    ...
  }'
```

**Expected Response (422 Unprocessable Entity):**
```json
{
  "detail": [
    {
      "loc": ["body", "asset_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Cleanup & Reset

### Clear Test Data

```bash
# Delete all sensor readings
sqlite3 tgd_system.db "DELETE FROM sensor_readings;"

# Delete all alerts
sqlite3 tgd_system.db "DELETE FROM sensor_alerts;"

# Delete sync records
sqlite3 tgd_system.db "DELETE FROM iot_data_syncs;"

# Verify
sqlite3 tgd_system.db "SELECT COUNT(*) FROM sensor_readings;"
```

---

## Summary

After completing all tests, you should have:

✅ Verified single sensor ingestion (normal & critical)  
✅ Tested bulk import (up to 1,000 records)  
✅ Queried historical data with time ranges  
✅ Retrieved triggered alerts  
✅ Checked integration status  
✅ Generated asset summaries  
✅ Computed health scores  
✅ Validated performance benchmarks  
✅ Tested error handling  
✅ Confirmed database integrity  

**Result:** Phase 1 is validated and ready for Phase 2 deployment!

---

**Next:** Phase 2 - WebSocket Real-Time Streaming  
**Timeline:** 1-2 weeks after Phase 1 validation
