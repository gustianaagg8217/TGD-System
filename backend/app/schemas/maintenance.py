"""
Maintenance Schema

Pydantic models for maintenance log request/response validation.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field


class MaintenanceLogBase(BaseModel):
    """Base maintenance log schema."""

    asset_id: str = Field(..., description="Asset ID")
    maintenance_type: str = Field(..., description="Type of maintenance (preventive, corrective)")
    technician: str = Field(..., description="Technician name")
    cost: Decimal = Field(..., ge=0, description="Maintenance cost")
    downtime: Optional[int] = Field(None, ge=0, description="Downtime in minutes")
    description: Optional[str] = Field(None, description="Description")
    status: Optional[str] = Field("scheduled", description="Status")
    next_maintenance_date: Optional[datetime] = Field(None, description="Next maintenance date")


class MaintenanceLogCreate(MaintenanceLogBase):
    """Create maintenance log schema."""

    pass


class MaintenanceLogUpdate(BaseModel):
    """Update maintenance log schema."""

    maintenance_type: Optional[str] = None
    technician: Optional[str] = None
    cost: Optional[Decimal] = None
    downtime: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None
    next_maintenance_date: Optional[datetime] = None


class MaintenanceLogResponse(MaintenanceLogBase):
    """Maintenance log response schema."""

    id: str
    created_at: datetime
    updated_at: datetime
    asset_id: str
    created_by: Optional[str] = None

    class Config:
        from_attributes = True


class MaintenanceLogDetailResponse(MaintenanceLogResponse):
    """Detailed maintenance log response with asset info."""

    asset_name: Optional[str] = Field(None, description="Asset name")
    asset_type: Optional[str] = Field(None, description="Asset type")

    class Config:
        from_attributes = True
