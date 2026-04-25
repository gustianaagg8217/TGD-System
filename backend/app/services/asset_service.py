"""
Asset Service

Business logic layer for asset management.
Handles validation, transformation, and complex operations.
"""

from typing import List, Optional, Tuple
from uuid import uuid4

from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetUpdate, AssetResponse, AssetDetailResponse
from app.repositories.asset_repository import AssetRepository
from app.core.exceptions import (
    ResourceNotFoundException,
    DuplicateResourceException,
    ValidationException,
)


class AssetService:
    """
    Asset Service with business logic.

    Handles:
    - Asset CRUD operations with validation
    - Asset hierarchy management
    - Asset statistics and reporting
    - Asset soft deletion
    """

    def __init__(self, db: Session):
        """Initialize Asset Service."""
        self.repository = AssetRepository(db)
        self.db = db

    # ===== CRUD OPERATIONS =====

    def create_asset(self, asset_in: AssetCreate, user_id: str) -> AssetResponse:
        """
        Create a new asset with validation.

        Args:
            asset_in: Asset creation schema
            user_id: User ID creating asset

        Returns:
            AssetResponse: Created asset

        Raises:
            ValidationException: If validation fails
        """
        # Validate parent asset if specified
        if asset_in.parent_asset_id:
            parent = self.repository.get_by_id(asset_in.parent_asset_id)
            if not parent:
                raise ResourceNotFoundException(
                    resource_type="Asset",
                    resource_id=asset_in.parent_asset_id,
                )

            # Prevent circular hierarchy
            if self._has_circular_dependency(asset_in.parent_asset_id, None):
                raise ValidationException(
                    message="Cannot create asset: circular parent-child relationship detected"
                )

        # Create asset with generated ID
        asset_id = str(uuid4())

        asset = self.repository.create(
            asset_in,
            id=asset_id,
            created_by=user_id,
        )
        return AssetResponse.from_orm(asset)

    def get_asset(self, asset_id: str) -> AssetDetailResponse:
        """
        Get asset with details.

        Args:
            asset_id: Asset ID

        Returns:
            AssetDetailResponse: Asset with related data

        Raises:
            ResourceNotFoundException: If asset not found
        """
        asset = self.repository.get_by_id_or_404(asset_id)

        # Load related counts
        maintenance_count = len(asset.maintenance_logs)
        sensor_count = len(asset.sensor_logs)
        documents_count = len(asset.documents)

        response_data = AssetResponse.from_orm(asset).model_dump()
        response_data.update({
            "maintenance_logs_count": maintenance_count,
            "sensor_logs_count": sensor_count,
            "documents_count": documents_count,
            "child_assets": [],
        })

        return AssetDetailResponse(**response_data)

    def update_asset(self, asset_id: str, asset_in: AssetUpdate) -> AssetResponse:
        """
        Update asset with validation.

        Args:
            asset_id: Asset ID
            asset_in: Asset update schema

        Returns:
            AssetResponse: Updated asset

        Raises:
            ResourceNotFoundException: If asset not found
            ValidationException: If validation fails
        """
        asset = self.repository.get_by_id_or_404(asset_id)

        # Validate parent asset change
        if asset_in.parent_asset_id and asset_in.parent_asset_id != asset.parent_asset_id:
            parent = self.repository.get_by_id(asset_in.parent_asset_id)
            if not parent:
                raise ResourceNotFoundException(
                    resource_type="Asset",
                    resource_id=asset_in.parent_asset_id,
                )

            # Check for circular dependency
            if self._has_circular_dependency(asset_in.parent_asset_id, asset_id):
                raise ValidationException(
                    message="Cannot update asset: circular parent-child relationship detected"
                )

        updated_asset = self.repository.update(asset, asset_in)
        return AssetResponse.from_orm(updated_asset)

    def delete_asset(self, asset_id: str, soft_delete: bool = True) -> bool:
        """
        Delete asset (soft or hard delete).

        Args:
            asset_id: Asset ID
            soft_delete: If True, soft delete; else hard delete

        Returns:
            bool: True if deleted

        Raises:
            ResourceNotFoundException: If asset not found
        """
        asset = self.repository.get_by_id_or_404(asset_id)

        if soft_delete:
            self.repository.soft_delete(asset)
        else:
            self.repository.delete(asset)

        return True

    # ===== LISTING & FILTERING =====

    def list_assets(
        self,
        skip: int = 0,
        limit: int = 100,
        asset_type: Optional[str] = None,
        status: Optional[str] = None,
        location: Optional[str] = None,
    ) -> Tuple[List[AssetResponse], int]:
        """
        List assets with optional filtering.

        Args:
            skip: Number to skip
            limit: Max records
            asset_type: Filter by type
            status: Filter by status
            location: Filter by location

        Returns:
            Tuple[List[AssetResponse], int]: Assets and total count
        """
        if asset_type:
            assets, total = self.repository.get_assets_by_type(asset_type, skip, limit)
        elif status:
            assets, total = self.repository.get_assets_by_status(status, skip, limit)
        elif location:
            assets, total = self.repository.get_assets_by_location(location, skip, limit)
        else:
            assets, total = self.repository.get_all(skip, limit)

        return [AssetResponse.from_orm(asset) for asset in assets], total

    def search_assets(
        self,
        query: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[AssetResponse], int]:
        """
        Search assets by name, location, type.

        Args:
            query: Search query
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[AssetResponse], int]: Assets and total count
        """
        assets, total = self.repository.search_assets(query, skip, limit)
        return [AssetResponse.from_orm(asset) for asset in assets], total

    # ===== HIERARCHY OPERATIONS =====

    def get_asset_hierarchy(self, asset_id: str) -> dict:
        """
        Get complete asset hierarchy (parent, children, descendants).

        Args:
            asset_id: Asset ID

        Returns:
            dict: Hierarchy structure

        Raises:
            ResourceNotFoundException: If asset not found
        """
        asset = self.repository.get_by_id_or_404(asset_id)

        ancestors = self.repository.get_asset_ancestors(asset_id)
        children = self.repository.get_child_assets(asset_id)
        descendants = self.repository.get_asset_descendants(asset_id)

        return {
            "asset": AssetResponse.from_orm(asset).model_dump(),
            "ancestors": [AssetResponse.from_orm(a).model_dump() for a in ancestors],
            "children": [AssetResponse.from_orm(c).model_dump() for c in children],
            "descendants": [AssetResponse.from_orm(d).model_dump() for d in descendants],
        }

    def get_root_assets(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[AssetResponse], int]:
        """
        Get root assets (no parent).

        Args:
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[AssetResponse], int]: Assets and total count
        """
        assets, total = self.repository.get_root_assets(skip, limit)
        return [AssetResponse.from_orm(asset) for asset in assets], total

    # ===== STATISTICS =====

    def get_asset_statistics(self) -> dict:
        """
        Get comprehensive asset statistics.

        Returns:
            dict: Statistics summary
        """
        count_by_type = self.repository.get_asset_count_by_type()
        count_by_status = self.repository.get_asset_count_by_status()
        total_value = self.repository.get_total_asset_value()

        return {
            "total_assets": sum(count_by_type.values()),
            "by_type": count_by_type,
            "by_status": count_by_status,
            "total_value": total_value,
        }

    # ===== HELPER METHODS =====

    def _has_circular_dependency(self, parent_id: str, child_id: Optional[str]) -> bool:
        """
        Check for circular parent-child relationships.

        Args:
            parent_id: Potential parent ID
            child_id: Child ID to check

        Returns:
            bool: True if circular dependency exists
        """
        visited = set()
        current = parent_id

        while current:
            if current in visited:
                return True
            visited.add(current)

            asset = self.repository.get_by_id(current)
            if not asset or not asset.parent_asset_id:
                break

            if asset.parent_asset_id == child_id:
                return True

            current = asset.parent_asset_id

        return False
