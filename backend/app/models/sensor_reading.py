"""
Sensor Reading Model

SQLAlchemy ORM model for real-time IoT sensor data points (time-series).
Supports high-frequency readings from equipment across all 6 sensor types.
"""

from sqlalchemy import String, DateTime, Numeric, ForeignKey, Integer, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from decimal import Decimal
from uuid import uuid4

from app.db.base import TimeStampedModel


class SensorReading(TimeStampedModel):
    """
    Real-time sensor data point from IoT devices.
    
    This model stores individual sensor measurements (high-frequency time-series data).
    Designed for fast insertion and efficient querying by asset + time range.
    
    Attributes:
        id: Unique sensor reading identifier
        asset_id: Foreign key to Asset being monitored
        sensor_id: Physical sensor identifier (unique per device)
        sensor_type: Type of sensor (vibration, temperature, fuel, gps, electrical, 
                     production, fault)
        reading_value: The actual measurement value
        reading_unit: Unit of measurement (°C, mm/s, L, %, bar, etc.)
        x_axis: Optional for vibration (X-axis component)
        y_axis: Optional for vibration (Y-axis component)
        z_axis: Optional for vibration (Z-axis component)
        status: Reading status (normal, warning, critical)
        timestamp: UTC timestamp when measurement was taken
        asset: Relationship to Asset model
    """

    __tablename__ = "sensor_readings"
    
    # Optimize queries by asset_id + sensor_type + timestamp
    __table_args__ = (
        Index("ix_sensor_readings_asset_type_timestamp", 
              "asset_id", "sensor_type", "timestamp"),
        Index("ix_sensor_readings_timestamp", "timestamp"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    asset_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("assets.id"),
        nullable=False,
        index=True,
    )
    sensor_id: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    sensor_type: Mapped[str] = mapped_column(
        String(50), 
        nullable=False, 
        index=True,
    )  # vibration, temperature, fuel, gps, electrical, production, fault
    
    # Reading values
    reading_value: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=False)
    reading_unit: Mapped[str] = mapped_column(String(50), nullable=True)
    
    # Optional for vibration data (X, Y, Z axes)
    x_axis: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=True)
    y_axis: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=True)
    z_axis: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=True)
    
    # Status and thresholds
    status: Mapped[str] = mapped_column(String(50), default="normal", index=True)
    threshold_high: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=True)
    threshold_low: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=True)
    
    # Data source and adapter fields
    data_source: Mapped[str] = mapped_column(String(50), default="api", nullable=True)
    mqtt_topic: Mapped[str] = mapped_column(String(255), nullable=True)
    modbus_device: Mapped[str] = mapped_column(String(255), nullable=True)
    modbus_register: Mapped[int] = mapped_column(nullable=True)
    raw_data: Mapped[str] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    
    # Timestamp of actual measurement (not DB write time)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        nullable=False, 
        index=True,
    )

    # Relationships
    asset: Mapped["Asset"] = relationship("Asset", back_populates="sensor_readings")

    def __repr__(self) -> str:
        return (
            f"<SensorReading(asset={self.asset_id}, sensor={self.sensor_id}, "
            f"type={self.sensor_type}, value={self.reading_value}, status={self.status})>"
        )


class SensorAlert(TimeStampedModel):
    """
    Triggered alerts from sensor threshold violations or anomalies.
    
    When a sensor reading exceeds thresholds or indicates a fault,
    an alert is created to trigger notifications and maintenance workflows.
    
    Attributes:
        id: Unique alert identifier
        asset_id: Foreign key to Asset
        sensor_id: Physical sensor identifier
        alert_type: Type of alert (threshold_exceeded, anomaly_detected, fault_signal)
        severity: Alert severity (info, warning, critical)
        message: Human-readable alert message
        action_required: Recommended action (e.g., "Inspect turbocharger within 24 hours")
        threshold_value: The threshold that was exceeded (if applicable)
        reading_value: The actual sensor value that triggered alert
        timestamp: When alert was triggered
        resolved_at: When alert was acknowledged/resolved
        resolved_by: User ID who resolved the alert
        asset: Relationship to Asset model
    """

    __tablename__ = "sensor_alerts"
    
    # Index for finding unresolved alerts
    __table_args__ = (
        Index("ix_sensor_alerts_asset_severity_resolved", 
              "asset_id", "severity", "resolved_at"),
        Index("ix_sensor_alerts_timestamp", "timestamp"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    asset_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("assets.id"),
        nullable=False,
        index=True,
    )
    sensor_id: Mapped[str] = mapped_column(String(100), nullable=False)
    alert_type: Mapped[str] = mapped_column(
        String(50), 
        nullable=False,
    )  # threshold_exceeded, anomaly_detected, fault_signal
    
    # Severity levels
    severity: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    # info: informational only
    # warning: requires attention soon
    # critical: immediate action required
    
    # Alert details
    message: Mapped[str] = mapped_column(Text, nullable=False)
    action_required: Mapped[str] = mapped_column(Text, nullable=True)
    
    # Values that triggered alert
    threshold_value: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=True)
    reading_value: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=True)
    
    # Timeline
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    resolved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    resolved_by: Mapped[str] = mapped_column(String(36), nullable=True)

    # Relationships
    asset: Mapped["Asset"] = relationship("Asset", back_populates="sensor_alerts")

    def __repr__(self) -> str:
        return (
            f"<SensorAlert(asset={self.asset_id}, severity={self.severity}, "
            f"type={self.alert_type}, resolved={self.resolved_at is not None})>"
        )


class IoTDataSync(TimeStampedModel):
    """
    Track integration sync status with external IoT systems.
    
    Monitors the health of data ingestion from MQTT brokers, REST API gateways,
    Modbus devices, etc. Useful for detecting connectivity issues and data loss.
    
    Attributes:
        id: Unique sync record identifier
        integration_name: Name of external system (e.g., "MQTT Broker Main", "REST API Gateway")
        integration_type: Type of integration (mqtt, rest_api, modbus, opc_ua, database)
        last_successful_sync: Timestamp of last successful data reception
        records_processed: Count of records received
        records_failed: Count of failed records
        error_message: Last error message if applicable
        status: Connection status (connected, disconnected, degraded, error)
        next_retry: When next sync attempt is scheduled
    """

    __tablename__ = "iot_data_syncs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    integration_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    integration_type: Mapped[str] = mapped_column(String(50), nullable=False)
    
    last_successful_sync: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    records_processed: Mapped[int] = mapped_column(Integer, default=0)
    records_failed: Mapped[int] = mapped_column(Integer, default=0)
    
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), 
        default="disconnected",
        index=True,
    )  # connected, disconnected, degraded, error
    
    next_retry: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return (
            f"<IoTDataSync(integration={self.integration_name}, "
            f"status={self.status}, records={self.records_processed})>"
        )
