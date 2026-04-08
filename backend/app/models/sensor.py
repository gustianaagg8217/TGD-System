"""
Sensor Log Model

SQLAlchemy ORM model for IoT sensor data logging.
"""

from sqlalchemy import String, DateTime, Float, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from decimal import Decimal

from app.db.base import TimeStampedModel
from app.core.constants import SensorTypeEnum, SensorStatusEnum


class SensorLog(TimeStampedModel):
    """
    Sensor Log model for storing sensor readings from IoT devices.

    Attributes:
        id: Unique sensor log identifier
        asset_id: Foreign key to asset
        sensor_type: Type of sensor (temperature, vibration, pressure, etc.)
        reading_value: Sensor reading value
        unit: Unit of measurement (°C, g, PSI, %, etc.)
        timestamp: Timestamp of reading
        status: Reading status (normal, warning, critical)
        threshold_high: High alert threshold
        threshold_low: Low alert threshold
        asset: Relationship to Asset model
    """

    __tablename__ = "sensor_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    asset_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("assets.id"),
        nullable=False,
        index=True,
    )
    sensor_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    reading_value: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default=SensorStatusEnum.NORMAL, index=True)
    threshold_high: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=True)
    threshold_low: Mapped[Decimal] = mapped_column(Numeric(15, 4), nullable=True)

    # Relationships
    asset: Mapped["Asset"] = relationship("Asset", back_populates="sensor_logs")

    def __repr__(self) -> str:
        return (
            f"<SensorLog(id={self.id}, asset_id={self.asset_id}, "
            f"type={self.sensor_type}, value={self.reading_value})>"
        )
