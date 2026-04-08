"""
Maintenance Log Model

SQLAlchemy ORM model for tracking maintenance operations.
"""

from sqlalchemy import String, DateTime, Numeric, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from decimal import Decimal

from app.db.base import TimeStampedModel
from app.core.constants import MaintenanceTypeEnum, MaintenanceStatusEnum


class MaintenanceLog(TimeStampedModel):
    """
    Maintenance Log model for tracking maintenance operations.

    Attributes:
        id: Unique maintenance log identifier
        asset_id: Foreign key to asset
        maintenance_type: Type of maintenance (preventive, corrective, inspection)
        date: Date maintenance was performed
        technician: Name of technician
        cost: Maintenance cost
        downtime: Downtime in minutes
        description: Detailed description
        status: Maintenance status (scheduled, in-progress, completed, cancelled)
        next_maintenance_date: Scheduled date for next maintenance
        created_by: User ID who created this log
        asset: Relationship to Asset model
    """

    __tablename__ = "maintenance_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    asset_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("assets.id"),
        nullable=False,
        index=True,
    )
    maintenance_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    technician: Mapped[str] = mapped_column(String(255), nullable=True)
    cost: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=True)
    downtime: Mapped[int] = mapped_column(Integer, nullable=True)  # in minutes
    description: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50),
        default=MaintenanceStatusEnum.SCHEDULED,
        index=True,
    )
    next_maintenance_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[str] = mapped_column(String(36), nullable=True)

    # Relationships
    asset: Mapped["Asset"] = relationship("Asset", back_populates="maintenance_logs")

    def __repr__(self) -> str:
        return f"<MaintenanceLog(id={self.id}, asset_id={self.asset_id}, type={self.maintenance_type})>"
