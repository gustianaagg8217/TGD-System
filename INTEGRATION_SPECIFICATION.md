# TGd System - Real-Time IoT Integration Specification
## PT. ANDA SELALU UNTUNG Mining Operations Data Integration

**Date:** April 7, 2026  
**Status:** Specification & Implementation Plan  
**Scope:** Real-time sensor data ingestion from 6 sensor types across mixed protocols

---

## Executive Summary

This document specifies the integration of real-time IoT sensor data into the TGd System Dashboard. The mining operations at PT. ANDA SELALU UNTUNG deploy **6 sensor types** across **multiple protocols**, requiring **sub-minute update frequency** for operational visibility.

### Deployment Architecture

```
Sensor Network (Field)
    ├─ Equipment Sensors (Vibration, Temperature, Pressure)
    ├─ Fuel Level Monitors
    ├─ GPS Trackers (Fleet + Equipment)
    ├─ Electrical Monitors (Voltage, Current, Power Factor)
    ├─ Production Counters (Ore output, tonnage, cycles)
    └─ Fault/Alert Signals
        │
        ├─ REST/HTTP APIs
        ├─ MQTT Brokers
        ├─ OPC-UA Gateways
        └─ Direct DB Writes
                │
                ▼
    IoT Integration Layer (Backend)
    ├─ Multiple Protocol Adapters
    ├─ Data Normalization & Validation
    ├─ Time-Series Data Persistence
    └─ Real-Time Event Publishing
                │
                ├─ WebSocket/SSE to Frontend
                └─ Historical Analytics Database
                │
                ▼
    TGd System Dashboard (Frontend)
    ├─ Real-Time Metrics Display
    ├─ Sensor Status & Alerts
    ├─ Equipment Condition Aggregation
    ├─ Live Charts & Trends
    └─ Predictive Maintenance Triggers
```

---

## 1. SENSOR TYPE SPECIFICATIONS

### 1.1 Equipment Vibration & Temperature

**Business Purpose:** Detect equipment anomalies before failure  
**Update Frequency:** 30-60 seconds  
**Typical Devices:** Siemens SITRANS sensors, SKF Bearing sensors  

**Data Schema:**
```json
{
  "sensor_id": "VIBE-EQP-001",
  "asset_id": "EQP-001",
  "asset_name": "Excavator CAT 390F",
  "sensor_type": "vibration",
  "readings": {
    "vibration_mm_s": 3.2,
    "temperature_celsius": 62.5,
    "timestamp": "2026-04-07T15:45:32Z"
  },
  "thresholds": {
    "vibration_warning": 5.0,
    "vibration_critical": 7.1,
    "temperature_warning": 70,
    "temperature_critical": 85
  },
  "status": "normal"
}
```

**Integration Methods:**
- Direct REST API from equipment gateway
- MQTT topic: `mining/equipment/{asset_id}/vibration`
- OPC-UA node: `ns=2;s=Equipment.{asset_id}.Vibration`

**Alert Triggers:**
- ⚠️ Vibration > warning threshold → Maintenance alert in 2 weeks
- 🔴 Vibration > critical threshold → Immediate inspection required
- 🔴 Temperature > critical → Stop operations, activate emergency protocol

---

### 1.2 Fuel & Oil Level Sensors

**Business Purpose:** Prevent equipment shutdown due to fuel loss; track consumption  
**Update Frequency:** 5-15 minutes  
**Typical Devices:** Capacitive + float-type fuel sensors, RS-485 output  

**Data Schema:**
```json
{
  "sensor_id": "FUEL-HT-001",
  "asset_id": "HT-001",
  "asset_name": "Haul Truck Volvo FMX",
  "sensor_type": "fuel_level",
  "readings": {
    "fuel_liters": 280,
    "fuel_percent": 80.0,
    "oil_liters": 45,
    "oil_percent": 89.0,
    "timestamp": "2026-04-07T15:45:00Z"
  },
  "thresholds": {
    "fuel_critical_liters": 50,
    "oil_critical_percent": 20
  },
  "daily_consumption": 35.5,
  "status": "normal"
}
```

**Integration Methods:**
- REST API from FMS (Fleet Management System) gateway
- MQTT: `mining/vehicles/{asset_id}/fuel`
- Direct Modbus TCP from device controller

**Alert Triggers:**
- ⚠️ Fuel < 100L → Schedule refueling
- 🔴 Fuel < 50L → Driver alert + dispatch instructions
- 🔴 Oil < 20% → Maintenance warning

---

### 1.3 GPS / Positioning Data

**Business Purpose:** Real-time location tracking for equipment & vehicles  
**Update Frequency:** 30 seconds to 2 minutes  
**Typical Devices:** Garmin/u-blox GPS modules, 4G LTE trackers  

**Data Schema:**
```json
{
  "tracker_id": "GPS-HT-001",
  "asset_id": "HT-001",
  "asset_name": "Haul Truck Volvo FMX",
  "asset_type": "vehicle",
  "location": {
    "latitude": -6.2088,
    "longitude": 106.8456,
    "accuracy_meters": 5,
    "altitude_meters": 125,
    "timestamp": "2026-04-07T15:45:30Z"
  },
  "movement": {
    "speed_kmh": 45.2,
    "heading_degrees": 234,
    "trip_distance_km": 12.5,
    "idle_minutes": 2
  },
  "status": "in-transit"
}
```

**Integration Methods:**
- REST API from GPS service (Garmin, Samsara, etc.)
- MQTT: `mining/gps/{asset_id}/location`
- GPRS/4G direct socket connection

**Alert Triggers:**
- 🚨 Geofence breach → Alert dispatcher
- ⚠️ Excessive idling (>5 min) → Driver notification
- 🔴 No update for 5 minutes → Communication lost alarm

---

### 1.4 Electrical Parameters (Voltage, Current, Power Factor)

**Business Purpose:** Monitor power quality and electrical equipment health  
**Update Frequency:** 1-5 minutes  
**Typical Devices:** Schneider Electric Power Monitor, Siemens PAC  

**Data Schema:**
```json
{
  "meter_id": "ELEC-PS-001",
  "asset_id": "INF-003",
  "asset_name": "Power Station (5MW)",
  "sensor_type": "electrical",
  "readings": {
    "voltage_l1_volts": 380.5,
    "voltage_l2_volts": 381.2,
    "voltage_l3_volts": 380.8,
    "current_l1_amps": 520,
    "current_l2_amps": 530,
    "current_l3_amps": 515,
    "power_factor": 0.95,
    "frequency_hz": 50.0,
    "power_kw": 950,
    "timestamp": "2026-04-07T15:45:15Z"
  },
  "thresholds": {
    "voltage_min": 360,
    "voltage_max": 400,
    "pf_min": 0.85,
    "current_max": 600
  },
  "status": "normal"
}
```

**Integration Methods:**
- REST API from power monitoring system
- MQTT: `mining/electrical/{asset_id}/power`
- Modbus RTU over RS-485 serial

**Alert Triggers:**
- ⚠️ Power factor < 0.90 → Efficiency warning
- 🔴 Voltage outside range → Equipment at risk
- 🔴 Current imbalance > 10% → Phase failure risk

---

### 1.5 Production / Output Counters

**Business Purpose:** Track operational output (ore processed, units produced)  
**Update Frequency:** 1-5 minutes  
**Typical Devices:** PLC counters, production monitors  

**Data Schema:**
```json
{
  "counter_id": "PROD-CONC-001",
  "asset_id": "FAC-002",
  "asset_name": "Concentration Plant",
  "sensor_type": "production_counter",
  "readings": {
    "ore_processed_tonnes": 245.8,
    "daily_target_tonnes": 500,
    "utilization_percent": 49.2,
    "production_rate_tpd": 500,
    "active_since": "2026-04-07T06:00:00Z",
    "runtime_hours_today": 9.5,
    "timestamp": "2026-04-07T15:45:00Z"
  },
  "efficiency_metrics": {
    "recovery_rate_percent": 97.2,
    "cycle_time_minutes": 18.5,
    "output_variance_percent": 2.1
  },
  "status": "operating"
}
```

**Integration Methods:**
- REST API from production monitoring system
- MQTT: `mining/production/{asset_id}/output`
- Direct OLE DB read from PLC database

**Alert Triggers:**
- ⚠️ Utilization < 85% of target → Production lag alarm
- ⚠️ Recovery rate decline > 3% → Process optimization needed
- 🔴 Multiple failures detected → Quality check required

---

### 1.6 Equipment Fault / Alert Signals

**Business Purpose:** Capture equipment-generated fault codes and maintenance alerts  
**Update Frequency:** Immediate (event-driven)  
**Typical Devices:** PLC fault outputs, equipment built-in diagnostics  

**Data Schema:**
```json
{
  "alert_id": "ALERT-EQP-001-2026-04-07-154545",
  "asset_id": "EQP-001",
  "asset_name": "Excavator CAT 390F",
  "sensor_type": "fault_alert",
  "fault": {
    "code": "P0234",
    "description": "Turbocharger pressure low or overboost condition",
    "severity": "warning",
    "action_required": "Check turbocharger health within 24 hours",
    "timestamp": "2026-04-07T15:45:45Z"
  },
  "maintenance_implication": {
    "priority": "high",
    "estimated_downtime_hours": 4,
    "recommended_action": "Inspect turbocharger seals and wastegate valve",
    "spare_parts_needed": ["Turbo rebuild kit", "Gasket set"]
  },
  "status": "unresolved"
}
```

**Integration Methods:**
- REST API from equipment telematics
- MQTT: `mining/equipment/{asset_id}/faults` (event topic)
- WebSocket push from maintenance system

**Alert Triggers:**
- 🔴 Immediate notification to maintenance team
- 🔴 Create corrective maintenance work order
- 🔴 Block equipment usage until resolved (if critical)

---

## 2. BACKEND INTEGRATION ARCHITECTURE

### 2.1 Data Ingestion Layer Structure

```
Backend Service Architecture:
┌─────────────────────────────────────────────────────┐
│ FastAPI IoT Ingestion Gateway                       │
│ ├─ /api/sensors/ingest (POST)                       │
│ ├─ ws://sensors/live (WebSocket subscriptions)      │
│ └─ /api/sensors/bulk (Batch import)                 │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
    ┌───▼─┐  ┌──▼───┐  ┌──▼────┐
    │REST │  │MQTT  │  │Modbus │
    │API  │  │Broker│  │TCP/RTU│
    └─────┘  └──────┘  └───────┘
        │
    ┌───▼──────────────────────┐
    │ Data Validation & Schema  │
    │ • Type checking           │
    │ • Range validation        │
    │ • Threshold logic         │
    │ • Anomaly detection       │
    └───┬──────────────────────┘
        │
    ┌───▼──────────────────────┐
    │ Time-Series Data Store   │
    │ • InfluxDB or PostgreSQL  │
    │ • Compressed retention    │
    │ • Fast query optimization │
    └───┬──────────────────────┘
        │
    ┌───▼──────────────────────┐
    │ Real-Time Event Bus       │
    │ • WebSocket to frontend   │
    │ • Alert notifications     │
    │ • Predictive triggers     │
    └──────────────────────────┘
```

### 2.2 New Backend Models Required

**File:** `backend/app/models/sensor_reading.py`

```python
class SensorReading(TimeStampedModel):
    """Real-time sensor data point (high-frequency time-series)"""
    id: str  # UUID
    asset_id: str  # FK to Asset
    sensor_id: str  # Physical sensor identifier
    sensor_type: str  # vibration, temperature, fuel, gps, electrical, production, fault
    reading_value: Decimal  # The actual measurement
    reading_unit: str  # °C, mm/s, L, %, bar, etc.
    status: str  # normal, warning, critical
    timestamp: datetime  # UTC timestamp of reading
    
class SensorAlert(TimeStampedModel):
    """Triggered alerts from sensor thresholds"""
    id: str
    asset_id: str
    sensor_id: str
    alert_type: str  # threshold_exceeded, anomaly_detected, fault_signal
    severity: str  # info, warning, critical
    message: str
    action_required: str
    created_at: datetime
    resolved_at: Optional[datetime]
    
class IoTDataSync(TimeStampedModel):
    """Track integration sync status with external IoT systems"""
    id: str
    integration_name: str  # "MQTT Broker", "REST API Gateway", etc.
    last_sync: datetime
    records_processed: int
    errors: int
    status: str  # connected, disconnected, degraded
    next_retry: Optional[datetime]
```

### 2.3 New Backend API Endpoints

**File:** `backend/app/routes/sensors_iot.py`

```python
# Real-time sensor data ingestion
POST /api/v1/sensors/ingest
    Body: {
        "sensor_id": "VIBE-EQP-001",
        "asset_id": "EQP-001",
        "readings": {...},
        "timestamp": "2026-04-07T15:45:32Z"
    }
    Response: { "status": "received", "reading_id": "..." }

# WebSocket subscription for real-time updates
WS /api/v1/sensors/live
    Subscribe: { "asset_ids": ["EQP-001", "HT-001"] }
    Stream: { "asset_id": "EQP-001", "readings": {...}, "timestamp": "..." }

# Bulk historical import
POST /api/v1/sensors/bulk
    Body: { "records": [...], "override_existing": false }
    Response: { "imported": 1250, "skipped": 15, "errors": 0 }

# Download sensor readings (for analytics)
GET /api/v1/sensors/data
    Params: ?asset_id=EQP-001&from=2026-04-01&to=2026-04-07&interval=1h
    Response: CSV or JSON time-series data

# Alert history & status
GET /api/v1/sensors/alerts
    Params: ?asset_id=EQP-001&status=unresolved&limit=10
    Response: List of triggered alerts with resolution status
```

---

## 3. FRONTEND REAL-TIME DASHBOARD UPDATES

### 3.1 Enhanced SensorsPage Features

**New Components:**
- Real-time metric cards (updating every 30 seconds from WebSocket)
- Live trend charts (6-hour rolling window)
- Asset health scorecard per equipment
- Alert notification queue (dismissible popups)
- Sensor connection status indicators

**Updated Data Flow:**
```
TGd Dashboard Frontend
    ├─ Component Mount
    ├─ Open WebSocket: ws://api/sensors/live
    ├─ Subscribe to asset_ids: ["EQP-001", "HT-001", ...]
    └─ Render static baseline (from REST API)
        │
        ├─ WebSocket Message (every 30-60 sec)
        └─ Update state: { ...prevState, [sensorId]: newReading }
            ├─ Re-render metric cards
            ├─ Append to trend chart (drop older data)
            ├─ Check thresholds → trigger alerts
            └─ Push notification to user

```

### 3.2 New AssetConditionPage (Unified View)

**Purpose:** Single dashboard showing all 9 asset categories with live condition data

**Layout:**
```
Asset Condition Monit
┌─────────────────────────────────────┐
│ Live Equipment Health Dashboard      │
├─────────────────────────────────────┤
│ ▶ Equipment Status                  │
│   ├─ EQP-001 Excavator    🟢 Good   │
│   ├─ EQP-002 Dozer        🟢 Good   │
│   ├─ EQP-004 Dredger      🟡 Warn   │
│   └─ EQP-005 Drill        🟢 Good   │
│                                     │
│ ▶ Fleet Status                      │
│   ├─ HT-001 Haul Truck    🟢 Good   │
│   ├─ LDR-002 Loader       🟢 Good   │
│   └─ MV Integritas        🟢 Good   │
│                                     │
│ ▶ Facility Status                   │
│   ├─ FAC-001 Smelter      🟡 Warn   │
│   └─ FAC-002 Conc Plant   🟢 Good   │
│                                     │
│ ▶ Active Alerts (4)                 │
│   ├─ 🔴 Dredger vibration high      │
│   ├─ ⚠️ Smelter maintenance due     │
│   └─ ⚠️ Haul truck fuel low         │
└─────────────────────────────────────┘
```

---

## 4. IMPLEMENTATION PHASES

### Phase 1: Data Ingestion Backend (Week 1)
- [ ] Create SensorReading, SensorAlert, IoTDataSync models
- [ ] Build REST API ingestion endpoint (/api/v1/sensors/ingest)
- [ ] Implement data validation schema
- [ ] Create test data generator
- [ ] Deploy to staging environment

### Phase 2: Real-Time Streaming (Week 2)
- [ ] Set up WebSocket server infrastructure
- [ ] Build MQTT client connector (for multi-protocol support)
- [ ] Implement alert threshold logic
- [ ] Create historical data query endpoints
- [ ] Build data sync status monitor

### Phase 3: Frontend Dashboards (Week 2-3)
- [ ] Update SensorsPage with WebSocket real-time updates
- [ ] Create AssetConditionPage (unified view)
- [ ] Built responsive charts with live updates
- [ ] Implement alert notification toast messages
- [ ] Add asset health scoring algorithm

### Phase 4: Integration Adapters (Week 3-4)
- [ ] Build MQTT broker connector
- [ ] Create OPC-UA client interface
- [ ] Implement CSV/Excel batch import
- [ ] Add integration status monitoring
- [ ] Create integration documentation

### Phase 5: Production Deployment (Week 4)
- [ ] Performance testing & optimization
- [ ] Security hardening (auth, encryption)
- [ ] Data retention & archival policies
- [ ] Disaster recovery for time-series database
- [ ] Go-Live with monitoring

---

## 5. TECHNOLOGY STACK

**Backend:**
- FastAPI (async HTTP server)
- WebSockets (python-websockets)
- Pydantic (data validation)
- SQLAlchemy (relational DB)
- InfluxDB or TimescaleDB (time-series data)
- MQTT client (paho-mqtt for async ingestion)

**Frontend:**
- React 18.2 (real-time state management)
- Chart.js or Recharts (live trend visualization)
- Socket.io or native WebSockets (streaming)
- TailwindCSS (responsive design)

**Infrastructure:**
- Redis (caching, pub/sub for alerts)
- NGINX (reverse proxy for WebSocket)
- Docker (containerization)
- Kubernetes (orchestration, optional)

---

## 6. INTEGRATION CHECKLIST

- [ ] Confirm IoT sensor API/protocol specifications with IT team
- [ ] Establish network connectivity (VPN, firewall rules for miner ops)
- [ ] Test each sensor type in staging environment
- [ ] Create integration documentation for mining operations team
- [ ] Set up monitoring & alerting infrastructure
- [ ] Define data retention policies (30-day hot, 2-year archive)
- [ ] Establish SLA for sensor data latency (< 2 minutes acceptable)
- [ ] Create runbook for common issues (sensor offline, data loss)
- [ ] Train operations team on dashboard functionality
- [ ] Establish feedback loop for continuous improvement

---

**Status:** Ready for Phase 1 Implementation  
**Effort Estimate:** 4-5 weeks full implementation  
**Dependencies:** IoT sensor specifications, network connectivity, staging environment  
**Owner:** TGd System Development Team
