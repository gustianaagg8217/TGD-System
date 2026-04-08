"""
Asset Model

SQLAlchemy ORM model for assets with hierarchical relationships.
"""

from sqlalchemy import String, DateTime, Numeric, ForeignKey, JSON, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from decimal import Decimal

from app.db.base import TimeStampedModel
from app.core.constants import AssetStatusEnum, AssetTypeEnum


class Asset(TimeStampedModel):
    """
    Asset model for tracking physical and digital assets.

    Attributes:
        id: Unique asset identifier (UUID)
        name: Asset name
        type: Asset type (machinery, vehicle, equipment, etc.)
        location: Physical location or grid location
        status: Asset status (active, inactive, maintenance, retired)
        acquisition_date: Date asset was acquired
        value: Asset value in currency
        parent_asset_id: Parent asset ID for hierarchical relationships
        asset_metadata: JSON field for extensible custom fields
        is_deleted: Soft delete flag
        created_by: User ID who created this asset
        parent_asset: Relationship to parent asset
        child_assets: Relationship to child assets
        maintenance_logs: Relationship to maintenance logs
        sensor_logs: Relationship to sensor logs
        documents: Relationship to documents
    """

    __tablename__ = "assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    location: Mapped[str] = mapped_column(String(255), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default=AssetStatusEnum.ACTIVE, index=True)
    acquisition_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    value: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=True)
    parent_asset_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("assets.id"),
        nullable=True,
    )
    asset_metadata: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    created_by: Mapped[str] = mapped_column(String(36), nullable=True)

    # Self-referential relationships for asset hierarchy
    parent_asset: Mapped["Asset"] = relationship(
        "Asset",
        remote_side=[id],
        back_populates="child_assets",
        foreign_keys=[parent_asset_id],
    )
    child_assets: Mapped[list["Asset"]] = relationship(
        "Asset",
        back_populates="parent_asset",
        foreign_keys=[parent_asset_id],
        cascade="all, delete-orphan",
    )

    # Relationships to other entities
    maintenance_logs: Mapped[list["MaintenanceLog"]] = relationship(
        "MaintenanceLog",
        back_populates="asset",
        cascade="all, delete-orphan",
    )
    sensor_logs: Mapped[list["SensorLog"]] = relationship(
        "SensorLog",
        back_populates="asset",
        cascade="all, delete-orphan",
    )
    sensor_readings: Mapped[list["SensorReading"]] = relationship(
        "SensorReading",
        back_populates="asset",
        cascade="all, delete-orphan",
    )
    sensor_alerts: Mapped[list["SensorAlert"]] = relationship(
        "SensorAlert",
        back_populates="asset",
        cascade="all, delete-orphan",
    )
    documents: Mapped[list["Document"]] = relationship(
        "Document",
        back_populates="asset",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Asset(id={self.id}, name={self.name}, type={self.type})>"
