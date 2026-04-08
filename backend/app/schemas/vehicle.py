"""
Vehicle Schemas

Pydantic models for vehicle-related requests and responses.
"""

from typing import Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class VehicleBase(BaseModel):
    """Base vehicle schema."""

    vehicle_type: str = Field(description="Vehicle type")
    registration_number: str = Field(min_length=1, max_length=50, description="Registration number")
    model: Optional[str] = Field(None, max_length=255, description="Vehicle model")
    fuel_type: Optional[str] = Field(None, description="Fuel type")
    fuel_capacity: Optional[float] = Field(None, gt=0)
    status: str = Field(default="active", description="Vehicle status")


class VehicleCreate(VehicleBase):
    """Vehicle creation schema."""

    current_mileage: float = Field(default=0, ge=0)


class VehicleUpdate(BaseModel):
    """Vehicle update schema."""

    vehicle_type: Optional[str] = None
    registration_number: Optional[str] = None
    model: Optional[str] = None
    fuel_type: Optional[str] = None
    current_mileage: Optional[float] = None
    fuel_capacity: Optional[float] = None
    status: Optional[str] = None


class VehicleResponse(VehicleBase):
    """Vehicle response schema."""

    id: str
    current_mileage: float = Field(description="Current mileage")
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== Vehicle Usage Log Schemas =====


class VehicleUsageLogBase(BaseModel):
    """Base vehicle usage log schema."""

    vehicle_id: str = Field(description="Vehicle ID")
    date: datetime = Field(description="Usage date")
    fuel_used: Optional[float] = Field(None, ge=0)
    distance: Optional[float] = Field(None, ge=0)
    driver: Optional[str] = Field(None, max_length=255)
    trip_purpose: Optional[str] = Field(None, max_length=255)


class VehicleUsageLogCreate(VehicleUsageLogBase):
    """Vehicle usage log creation schema."""

    pass


class VehicleUsageLogResponse(VehicleUsageLogBase):
    """Vehicle usage log response schema."""

    id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
