"""
Sensor IoT Data Ingestion API Routes

Real-time sensor data ingestion endpoints for PT. ANDA SELALU UNTUNG mining operations.
Supports 6 sensor types: vibration, temperature, fuel, GPS, electrical, production, fault.

Endpoints:
  POST /api/v1/sensors/ingest          - Single sensor reading
  POST /api/v1/sensors/bulk            - Bulk import (up to 1000 records)
  GET  /api/v1/sensors/data            - Query historical data with time range
  GET  /api/v1/sensors/alerts          - Get unresolved alerts
  GET  /api/v1/sensors/status          - Integration status dashboard
  GET  /api/v1/sensors/asset/{id}      - Asset sensor summary & health
  POST /api/v1/sensors/health-score    - Compute asset health score
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List, Optional
from uuid import uuid4

from app.db.session import get_db
from app.models.sensor_reading import SensorReading, SensorAlert, IoTDataSync
from app.models.asset import Asset
from app.schemas.sensor_schema import (
    SensorReadingCreate,
    SensorReadingResponse,
    SensorBulkIngestRequest,
    SensorBulkIngestResponse,
    SensorAlertResponse,
    SensorAlertCreate,
    IoTDataSyncResponse,
    AssetSensorsSummary,
    AssetHealthScore,
    HealthScoreRequest,
)

router = APIRouter(prefix="/api/v1/sensors", tags=["sensors"])


# ============================================================================
# REAL-TIME DATA INGESTION ENDPOINTS
# ============================================================================

@router.post(
    "/ingest",
    response_model=SensorReadingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest single sensor reading",
    description="Accept real-time sensor data from IoT devices. Validates and stores reading, "
                "checks thresholds, and triggers alerts if needed."
)
async def ingest_sensor_reading(
    reading: SensorReadingCreate,
    db: Session = Depends(get_db)
):
    """
    Ingest a single sensor reading from an IoT device.
    
    - Validates sensor data against schema
    - Checks reading against thresholds
    - Creates alert if thresholds exceeded
    - Returns stored reading with status
    """
    
    # Verify asset exists
    asset = db.query(Asset).filter(Asset.id == reading.asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset {reading.asset_id} not found"
        )
    
    # Determine reading status based on thresholds
    reading_status = "normal"
    if reading.threshold_high and reading.reading_value > reading.threshold_high:
        reading_status = "critical"
    elif reading.threshold_low and reading.reading_value < reading.threshold_low:
        reading_status = "critical"
    
    # Create sensor reading
    db_reading = SensorReading(
        id=str(uuid4()),
        asset_id=reading.asset_id,
        sensor_id=reading.sensor_id,
        sensor_type=reading.sensor_type.value,
        reading_value=reading.reading_value,
        reading_unit=reading.reading_unit,
        x_axis=reading.x_axis,
        y_axis=reading.y_axis,
        z_axis=reading.z_axis,
        threshold_high=reading.threshold_high,
        threshold_low=reading.threshold_low,
        status=reading_status,
        timestamp=reading.timestamp,
    )
    db.add(db_reading)
    
    # Create alert if threshold violated
    if reading_status == "critical":
        alert_message = (
            f"Sensor {reading.sensor_id} ({reading.sensor_type.value}) reading "
            f"{reading.reading_value} {reading.reading_unit} exceeds critical threshold"
        )
        
        db_alert = SensorAlert(
            id=str(uuid4()),
            asset_id=reading.asset_id,
            sensor_id=reading.sensor_id,
            alert_type="threshold_exceeded",
            severity="critical",
            message=alert_message,
            threshold_value=reading.threshold_high or reading.threshold_low,
            reading_value=reading.reading_value,
            timestamp=datetime.now(timezone.utc),
        )
        db.add(db_alert)
    
    db.commit()
    db.refresh(db_reading)
    
    return db_reading


@router.post(
    "/bulk",
    response_model=SensorBulkIngestResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Bulk ingest sensor readings"
)
async def bulk_ingest_sensors(
    request: SensorBulkIngestRequest,
    db: Session = Depends(get_db)
):
    """
    Bulk import sensor readings (up to 1000 records per request).
    
    Useful for:
    - Historical data import
    - Batch uploads from edge devices
    - Daily/weekly sync from external systems
    
    Returns count of imported, skipped, and failed records.
    """
    
    imported = 0
    skipped = 0
    errors = 0
    error_details = []
    
    for idx, reading in enumerate(request.records):
        try:
            # Verify asset exists
            asset = db.query(Asset).filter(Asset.id == reading.asset_id).first()
            if not asset:
                errors += 1
                error_details.append({
                    "record": idx,
                    "error": f"Asset {reading.asset_id} not found"
                })
                continue
            
            # Check for duplicates if not overriding
            if not request.override_existing:
                existing = db.query(SensorReading).filter(
                    SensorReading.sensor_id == reading.sensor_id,
                    SensorReading.timestamp == reading.timestamp,
                ).first()
                if existing:
                    skipped += 1
                    continue
            
            # Determine status
            reading_status = "normal"
            if reading.threshold_high and reading.reading_value > reading.threshold_high:
                reading_status = "critical"
            elif reading.threshold_low and reading.reading_value < reading.threshold_low:
                reading_status = "critical"
            
            # Create reading
            db_reading = SensorReading(
                id=str(uuid4()),
                asset_id=reading.asset_id,
                sensor_id=reading.sensor_id,
                sensor_type=reading.sensor_type.value,
                reading_value=reading.reading_value,
                reading_unit=reading.reading_unit,
                x_axis=reading.x_axis,
                y_axis=reading.y_axis,
                z_axis=reading.z_axis,
                threshold_high=reading.threshold_high,
                threshold_low=reading.threshold_low,
                status=reading_status,
                timestamp=reading.timestamp,
            )
            db.add(db_reading)
            imported += 1
            
        except Exception as e:
            errors += 1
            error_details.append({
                "record": idx,
                "error": str(e)
            })
    
    db.commit()
    
    return SensorBulkIngestResponse(
        imported=imported,
        skipped=skipped,
        errors=errors,
        error_details=error_details if error_details else None
    )


# ============================================================================
# DATA QUERY ENDPOINTS
# ============================================================================

@router.get(
    "/data",
    response_model=List[SensorReadingResponse],
    summary="Query sensor readings with time range"
)
async def get_sensor_data(
    asset_id: str = Query(..., description="Asset ID to filter by"),
    sensor_type: Optional[str] = Query(None, description="Sensor type filter (vibration, fuel, etc.)"),
    from_date: datetime = Query(
        default_factory=lambda: datetime.now(timezone.utc) - timedelta(days=7),
        description="Start of time range (ISO 8601)"
    ),
    to_date: datetime = Query(
        default_factory=lambda: datetime.now(timezone.utc),
        description="End of time range (ISO 8601)"
    ),
    interval: Optional[str] = Query(None, description="Aggregation interval (1h, 1d, etc.) - future"),
    limit: int = Query(1000, ge=1, le=10000, description="Max records to return"),
    db: Session = Depends(get_db),
):
    """
    Query historical sensor data with time range filtering.
    
    Useful for:
    - Trend analysis
    - Report generation
    - Data export
    - Analytics dashboards
    
    Returns readings in chronological order (oldest first).
    """
    
    query = db.query(SensorReading).filter(
        SensorReading.asset_id == asset_id,
        SensorReading.timestamp >= from_date,
        SensorReading.timestamp <= to_date,
    )
    
    if sensor_type:
        query = query.filter(SensorReading.sensor_type == sensor_type)
    
    readings = query.order_by(SensorReading.timestamp.asc()).limit(limit).all()
    
    return readings


@router.get(
    "/alerts",
    response_model=List[SensorAlertResponse],
    summary="Get sensor alerts"
)
async def get_sensor_alerts(
    asset_id: Optional[str] = Query(None, description="Filter by asset ID"),
    severity: Optional[str] = Query(None, description="Filter by severity (info, warning, critical)"),
    status: str = Query("unresolved", description="resolved or unresolved"),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """
    Get sensor alerts (optionally filtered by asset and severity).
    
    Status filter:
    - unresolved: Alerts that need attention
    - resolved: Already acknowledged/handled
    - all: Both resolved and unresolved
    """
    
    query = db.query(SensorAlert)
    
    if asset_id:
        query = query.filter(SensorAlert.asset_id == asset_id)
    
    if severity:
        query = query.filter(SensorAlert.severity == severity)
    
    if status == "unresolved":
        query = query.filter(SensorAlert.resolved_at == None)
    elif status == "resolved":
        query = query.filter(SensorAlert.resolved_at != None)
    # "all" includes both
    
    alerts = query.order_by(SensorAlert.timestamp.desc()).limit(limit).all()
    
    return alerts


# ============================================================================
# STATUS & INTEGRATION MONITORING
# ============================================================================

@router.get(
    "/status",
    response_model=List[IoTDataSyncResponse],
    summary="Get IoT integration status"
)
async def get_integration_status(
    db: Session = Depends(get_db),
):
    """
    Get status of all configured IoT integrations.
    
    Shows:
    - Connection status (connected, disconnected, degraded, error)
    - Last successful sync timestamp
    - Records processed and failed counts
    - Next retry time if applicable
    """
    
    syncs = db.query(IoTDataSync).order_by(
        IoTDataSync.updated_at.desc()
    ).all()
    
    return syncs


# ============================================================================
# ASSET-LEVEL VIEWS
# ============================================================================

@router.get(
    "/asset/{asset_id}",
    response_model=AssetSensorsSummary,
    summary="Get asset sensor summary"
)
async def get_asset_sensors(
    asset_id: str,
    db: Session = Depends(get_db),
):
    """
    Get all sensors and latest readings for a specific asset.
    
    Includes:
    - Count of active sensors by status
    - Latest reading from each sensor
    - Unresolved alerts
    """
    
    # Verify asset exists
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset {asset_id} not found"
        )
    
    # Get latest readings by sensor
    latest_readings = db.query(SensorReading).filter(
        SensorReading.asset_id == asset_id
    ).order_by(
        SensorReading.sensor_id,
        SensorReading.timestamp.desc()
    ).distinct(SensorReading.sensor_id).all()
    
    # Count by status
    active = db.query(SensorReading).filter(
        SensorReading.asset_id == asset_id,
        SensorReading.status == "normal"
    ).distinct(SensorReading.sensor_id).count()
    
    warning = db.query(SensorReading).filter(
        SensorReading.asset_id == asset_id,
        SensorReading.status == "warning"
    ).distinct(SensorReading.sensor_id).count()
    
    critical = db.query(SensorReading).filter(
        SensorReading.asset_id == asset_id,
        SensorReading.status == "critical"
    ).distinct(SensorReading.sensor_id).count()
    
    # Get unresolved alerts
    alerts = db.query(SensorAlert).filter(
        SensorAlert.asset_id == asset_id,
        SensorAlert.resolved_at == None,
    ).order_by(SensorAlert.timestamp.desc()).all()
    
    return AssetSensorsSummary(
        asset_id=asset_id,
        asset_name=asset.name,
        sensors_active=active,
        sensors_warning=warning,
        sensors_critical=critical,
        latest_readings=latest_readings,
        active_alerts=alerts,
    )


@router.post(
    "/health-score",
    response_model=AssetHealthScore,
    summary="Compute asset health score"
)
async def compute_health_score(
    request: HealthScoreRequest,
    db: Session = Depends(get_db),
):
    """
    Compute overall health score (0-100) for an asset.
    
    Based on:
    - Current sensor readings vs thresholds
    - Number and severity of active alerts
    - Historical trend (if available)
    - ML predictions (if enabled - future)
    
    Returns:
    - Overall health percentage
    - Component scores by sensor type
    - Failure risk estimate
    - Estimated time to failure
    """
    
    # Verify asset exists
    asset = db.query(Asset).filter(Asset.id == request.asset_id).first()
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset {request.asset_id} not found"
        )
    
    # Get latest readings
    latest_readings = db.query(SensorReading).filter(
        SensorReading.asset_id == request.asset_id
    ).order_by(
        SensorReading.sensor_id,
        SensorReading.timestamp.desc()
    ).distinct(SensorReading.sensor_id).all()
    
    # Get active alerts
    alerts = db.query(SensorAlert).filter(
        SensorAlert.asset_id == request.asset_id,
        SensorAlert.resolved_at == None,
    ).all()
    
    # Calculate health score
    # Based on severity of readings and alerts
    health_score = 100
    key_metrics = {}
    
    for reading in latest_readings:
        sensor_type = reading.sensor_type
        
        # Each critical reading reduces health by 25%
        if reading.status == "critical":
            health_score -= 25
            key_metrics[sensor_type] = 25
        # Each warning reduces health by 10%
        elif reading.status == "warning":
            health_score -= 10
            key_metrics[sensor_type] = 50
        else:
            key_metrics[sensor_type] = 100
    
    # Critical alerts reduce health by 5% each
    for alert in alerts:
        if alert.severity == "critical":
            health_score -= 5
    
    # Floor at 0%
    health_score = max(0, health_score)
    
    # Determine status
    if health_score >= 80:
        status_text = "healthy"
    elif health_score >= 50:
        status_text = "warning"
    else:
        status_text = "critical"
    
    return AssetHealthScore(
        asset_id=request.asset_id,
        asset_name=asset.name,
        overall_health_percent=health_score,
        status=status_text,
        key_metrics=key_metrics,
        last_updated=datetime.now(timezone.utc),
    )
