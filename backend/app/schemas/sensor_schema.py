"""
Sensor Data Validation Schemas

Pydantic models for validating and serializing IoT sensor data.
Provides type safety, validation, and automatic OpenAPI documentation.
"""

from pydantic import BaseModel, Field, validator
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from enum import Enum


class SensorTypeEnum(str, Enum):
    """Supported sensor types"""
    VIBRATION = "vibration"
    TEMPERATURE = "temperature"
    FUEL_LEVEL = "fuel"
    GPS = "gps"
    ELECTRICAL = "electrical"
    PRODUCTION = "production"
    FAULT = "fault"


class SensorStatusEnum(str, Enum):
    """Sensor reading status"""
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"


class SeverityEnum(str, Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class SensorReadingCreate(BaseModel):
    """Schema for creating sensor readings"""
    sensor_id: str = Field(..., description="Physical sensor identifier (e.g., VIBE-EQP-001)")
    asset_id: str = Field(..., description="Asset ID being monitored")
    sensor_type: SensorTypeEnum = Field(..., description="Type of sensor")
    reading_value: Decimal = Field(..., description="The actual measurement value")
    reading_unit: str = Field(..., description="Unit of measurement (°C, mm/s, %, etc.)")
    
    # Optional vibration axes
    x_axis: Optional[Decimal] = Field(None, description="X-axis component (vibration)")
    y_axis: Optional[Decimal] = Field(None, description="Y-axis component (vibration)")
    z_axis: Optional[Decimal] = Field(None, description="Z-axis component (vibration)")
    
    # Threshold info
    threshold_high: Optional[Decimal] = Field(None, description="High alert threshold")
    threshold_low: Optional[Decimal] = Field(None, description="Low alert threshold")
    
    timestamp: datetime = Field(
        ..., 
        description="UTC timestamp of measurement (ISO 8601 format)"
    )

    class Config:
        schema_extra = {
            "example": {
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
            }
        }


class SensorReadingResponse(SensorReadingCreate):
    """Schema for reading sensor data"""
    id: str = Field(..., description="Unique reading ID")
    status: SensorStatusEnum = Field(..., description="Reading status")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SensorBulkIngestRequest(BaseModel):
    """Schema for bulk sensor data import"""
    records: List[SensorReadingCreate] = Field(
        ..., 
        description="List of sensor readings to import"
    )
    override_existing: bool = Field(
        False, 
        description="Whether to override existing readings with same sensor_id+timestamp"
    )


class SensorBulkIngestResponse(BaseModel):
    """Response from bulk ingestion"""
    imported: int = Field(..., description="Number of records successfully imported")
    skipped: int = Field(..., description="Number of records skipped (duplicates)")
    errors: int = Field(..., description="Number of records with errors")
    error_details: Optional[List[dict]] = Field(
        None, 
        description="Details of any errors"
    )


class AlertThresholdViolation(BaseModel):
    """Triggered alert from threshold violation"""
    asset_id: str
    sensor_id: str
    sensor_type: SensorTypeEnum
    violation_type: str  # "high_threshold" or "low_threshold"
    reading_value: Decimal
    threshold: Decimal
    status: str


class SensorAlertCreate(BaseModel):
    """Schema for creating sensor alerts"""
    asset_id: str
    sensor_id: str
    alert_type: str = Field(..., description="threshold_exceeded, anomaly_detected, fault_signal")
    severity: SeverityEnum
    message: str = Field(..., description="Human-readable alert message")
    action_required: Optional[str] = Field(None, description="Recommended action")
    threshold_value: Optional[Decimal] = None
    reading_value: Optional[Decimal] = None


class SensorAlertResponse(SensorAlertCreate):
    """Response for sensor alerts"""
    id: str
    timestamp: datetime
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class IoTDataSyncResponse(BaseModel):
    """Response for IoT data sync status"""
    id: str
    integration_name: str
    integration_type: str
    status: str  # connected, disconnected, degraded, error
    last_successful_sync: Optional[datetime] = None
    records_processed: int
    records_failed: int
    error_message: Optional[str] = None
    next_retry: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AssetSensorsSummary(BaseModel):
    """Summary of all sensors for a single asset"""
    asset_id: str
    asset_name: str
    sensors_active: int
    sensors_warning: int
    sensors_critical: int
    latest_readings: List[SensorReadingResponse] = Field(
        ..., 
        description="Most recent reading from each sensor"
    )
    active_alerts: List[SensorAlertResponse] = Field(
        ..., 
        description="Unresolved alerts for this asset"
    )


class HealthScoreRequest(BaseModel):
    """Request for computing asset health score"""
    asset_id: str
    include_predictive: bool = Field(
        False, 
        description="Include ML-based predictive health score"
    )


class AssetHealthScore(BaseModel):
    """Asset health score based on sensor data"""
    asset_id: str
    asset_name: str
    overall_health_percent: int = Field(
        ..., 
        description="0-100 health score"
    )
    status: str  # "healthy", "warning", "critical"
    key_metrics: dict = Field(..., description="Component scores by sensor type")
    failure_risk_percent: Optional[int] = Field(
        None, 
        description="Predicted failure probability if enabled"
    )
    estimated_ttf_hours: Optional[int] = Field(
        None,
        description="Estimated Time To Failure (hours) if ML enabled"
    )
    last_updated: datetime
