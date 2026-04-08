"""
Asset Schemas

Pydantic models for asset-related requests and responses.
"""

from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class AssetBase(BaseModel):
    """Base asset schema."""

    name: str = Field(min_length=1, max_length=255, description="Asset name")
    type: str = Field(description="Asset type")
    location: Optional[str] = Field(None, max_length=255, description="Asset location")
    status: str = Field(default="active", description="Asset status")
    acquisition_date: Optional[datetime] = Field(None, description="Acquisition date")
    value: Optional[Decimal] = Field(None, ge=0, description="Asset value")
    parent_asset_id: Optional[str] = Field(None, description="Parent asset ID")
    asset_metadata: Optional[dict] = Field(default={}, description="Custom metadata")


class AssetCreate(AssetBase):
    """Asset creation schema."""

    pass


class AssetUpdate(BaseModel):
    """Asset update schema."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    acquisition_date: Optional[datetime] = None
    value: Optional[Decimal] = Field(None, ge=0)
    parent_asset_id: Optional[str] = None
    asset_metadata: Optional[dict] = None


class AssetResponse(AssetBase):
    """Asset response schema."""

    id: str = Field(description="Asset ID")
    created_at: datetime = Field(description="Creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")
    is_deleted: bool = Field(default=False)

    model_config = {"from_attributes": True}


class AssetDetailResponse(AssetResponse):
    """Detailed asset response with relationships."""

    child_assets: List[AssetResponse] = Field(default=[], description="Child assets")
    maintenance_logs_count: int = Field(default=0, description="Number of maintenance logs")
    sensor_logs_count: int = Field(default=0, description="Number of sensor logs")
    documents_count: int = Field(default=0, description="Number of documents")


class AssetHierarchyResponse(BaseModel):
    """Asset hierarchy response."""

    id: str
    name: str
    type: str
    status: str
    level: int = Field(description="Hierarchy level")
    children: List["AssetHierarchyResponse"] = Field(default=[], description="Child assets")

    model_config = {"from_attributes": True}


# Enable forward references
AssetHierarchyResponse.model_rebuild()


# ===== Maintenance Schemas =====


class MaintenanceLogBase(BaseModel):
    """Base maintenance log schema."""

    asset_id: str = Field(description="Asset ID")
    maintenance_type: str = Field(description="Maintenance type")
    date: datetime = Field(description="Maintenance date")
    technician: Optional[str] = Field(None, max_length=255)
    cost: Optional[Decimal] = Field(None, ge=0)
    downtime: Optional[int] = Field(None, ge=0, description="Downtime in minutes")
    description: Optional[str] = None
    status: str = Field(default="scheduled", description="Maintenance status")
    next_maintenance_date: Optional[datetime] = None


class MaintenanceLogCreate(MaintenanceLogBase):
    """Maintenance log creation schema."""

    pass


class MaintenanceLogUpdate(BaseModel):
    """Maintenance log update schema."""

    maintenance_type: Optional[str] = None
    date: Optional[datetime] = None
    technician: Optional[str] = None
    cost: Optional[Decimal] = None
    downtime: Optional[int] = None
    description: Optional[str] = None
    status: Optional[str] = None
    next_maintenance_date: Optional[datetime] = None


class MaintenanceLogResponse(MaintenanceLogBase):
    """Maintenance log response schema."""

    id: str = Field(description="Log ID")
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ===== Inventory Schemas =====


class InventoryItemBase(BaseModel):
    """Base inventory item schema."""

    item_code: str = Field(min_length=1, max_length=100, description="Unique item code")
    name: str = Field(min_length=1, max_length=255, description="Item name")
    quantity: int = Field(default=0, ge=0, description="Current quantity")
    reorder_level: Optional[int] = Field(None, ge=0)
    supplier: Optional[str] = Field(None, max_length=255)
    price: Optional[Decimal] = Field(None, ge=0)
    category: Optional[str] = Field(None, max_length=100)
    location: Optional[str] = Field(None, max_length=255)


class InventoryItemCreate(InventoryItemBase):
    """Inventory item creation schema."""

    pass


class InventoryItemUpdate(BaseModel):
    """Inventory item update schema."""

    name: Optional[str] = None
    quantity: Optional[int] = None
    reorder_level: Optional[int] = None
    supplier: Optional[str] = None
    price: Optional[Decimal] = None
    category: Optional[str] = None
    location: Optional[str] = None


class InventoryItemResponse(InventoryItemBase):
    """Inventory item response schema."""

    id: str
    last_restock_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    is_low_stock: bool = Field(default=False, description="Whether item is below reorder level")

    model_config = {"from_attributes": True}
