"""
Asset Repository

Repository for Asset model with specialized queries.
"""

from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.asset import Asset
from app.schemas.asset import AssetCreate, AssetUpdate
from app.repositories.base import BaseRepository


class AssetRepository(BaseRepository[Asset, AssetCreate, AssetUpdate]):
    """
    Asset Repository with specialized queries for assets.

    Provides CRUD operations and asset-specific queries like:
    - Asset hierarchy
    - Asset filtering by type, status, location
    - Asset statistics
    """

    def __init__(self, db: Session):
        """Initialize Asset Repository."""
        super().__init__(Asset, db)

    # ===== ASSET HIERARCHY QUERIES =====

    def get_asset_hierarchy(self, asset_id: str, depth: Optional[int] = None) -> Optional[Asset]:
        """
        Get asset with its hierarchy (children and descendants).

        Args:
            asset_id: Asset ID
            depth: Maximum depth to traverse (None = all levels)

        Returns:
            Optional[Asset]: Asset with loaded hierarchy
        """
        asset = self.get_by_id(asset_id)
        if not asset:
            return None
        return asset

    def get_asset_ancestors(self, asset_id: str) -> List[Asset]:
        """
        Get all parent assets (ancestors) for an asset.

        Args:
            asset_id: Asset ID

        Returns:
            List[Asset]: List of parent assets from root to immediate parent
        """
        ancestors = []
        current_asset = self.get_by_id(asset_id)

        while current_asset and current_asset.parent_asset_id:
            parent = self.get_by_id(current_asset.parent_asset_id)
            if parent:
                ancestors.insert(0, parent)
                current_asset = parent
            else:
                break

        return ancestors

    def get_asset_descendants(self, asset_id: str) -> List[Asset]:
        """
        Get all child assets (descendants) recursively.

        Args:
            asset_id: Asset ID

        Returns:
            List[Asset]: List of all descendant assets
        """
        descendants = []
        asset = self.get_by_id(asset_id)

        if not asset:
            return descendants

        # Get direct children
        children = self.get_child_assets(asset_id)
        descendants.extend(children)

        # Recursively get descendants of children
        for child in children:
            descendants.extend(self.get_asset_descendants(child.id))

        return descendants

    def get_child_assets(self, parent_asset_id: str) -> List[Asset]:
        """
        Get direct child assets of a parent.

        Args:
            parent_asset_id: Parent asset ID

        Returns:
            List[Asset]: List of child assets
        """
        return (
            self.db.query(Asset)
            .filter(
                Asset.parent_asset_id == parent_asset_id,
                Asset.is_deleted.is_(False),
            )
            .all()
        )

    def get_root_assets(self, skip: int = 0, limit: int = 100) -> Tuple[List[Asset], int]:
        """
        Get root assets (assets without parent).

        Args:
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[Asset], int]: Root assets and total count
        """
        query = self.db.query(Asset).filter(
            Asset.parent_asset_id.is_(None),
            Asset.is_deleted.is_(False),
        )

        total = query.count()
        assets = query.offset(skip).limit(limit).all()
        return assets, total

    # ===== ASSET FILTERING QUERIES =====

    def get_assets_by_type(
        self,
        asset_type: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Asset], int]:
        """
        Get assets filtered by type.

        Args:
            asset_type: Asset type
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[Asset], int]: Assets and total count
        """
        return self.filter(
            skip=skip,
            limit=limit,
            type=asset_type,
            is_deleted=False,
        )

    def get_assets_by_status(
        self,
        status: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Asset], int]:
        """
        Get assets filtered by status.

        Args:
            status: Asset status
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[Asset], int]: Assets and total count
        """
        return self.filter(
            skip=skip,
            limit=limit,
            status=status,
            is_deleted=False,
        )

    def get_assets_by_location(
        self,
        location: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Asset], int]:
        """
        Get assets filtered by location.

        Args:
            location: Asset location
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[Asset], int]: Assets and total count
        """
        return self.filter(
            skip=skip,
            limit=limit,
            location=location,
            is_deleted=False,
        )

    def search_assets(
        self,
        query_str: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Asset], int]:
        """
        Search assets by name and location.

        Args:
            query_str: Search string
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[Asset], int]: Assets and total count
        """
        return self.search(
            search_fields=["name", "location", "type"],
            query_str=query_str,
            skip=skip,
            limit=limit,
        )

    # ===== ASSET STATISTICS =====

    def get_asset_count_by_type(self) -> dict:
        """
        Get count of assets grouped by type.

        Returns:
            dict: {"machinery": 5, "vehicle": 3, ...}
        """
        from sqlalchemy import func

        results = (
            self.db.query(Asset.type, func.count(Asset.id))
            .filter(Asset.is_deleted.is_(False))
            .group_by(Asset.type)
            .all()
        )
        return {asset_type: count for asset_type, count in results}

    def get_asset_count_by_status(self) -> dict:
        """
        Get count of assets grouped by status.

        Returns:
            dict: {"active": 10, "maintenance": 2, ...}
        """
        from sqlalchemy import func

        results = (
            self.db.query(Asset.status, func.count(Asset.id))
            .filter(Asset.is_deleted.is_(False))
            .group_by(Asset.status)
            .all()
        )
        return {status: count for status, count in results}

    def get_total_asset_value(self) -> float:
        """
        Get total value of all assets.

        Returns:
            float: Sum of all asset values
        """
        from sqlalchemy import func

        result = (
            self.db.query(func.sum(Asset.value))
            .filter(Asset.is_deleted.is_(False))
            .scalar()
        )
        return float(result or 0)

    # ===== SOFT DELETE HANDLING =====

    def get_all(self, skip: int = 0, limit: int = 100, order_by: Optional[str] = None):
        """
        Override get_all to exclude soft-deleted assets.

        Args:
            skip: Number to skip
            limit: Max records
            order_by: Sort field

        Returns:
            Tuple[List[Asset], int]: Assets and total count
        """
        query = self.db.query(self.model).filter(self.model.is_deleted.is_(False))

        total = query.count()

        if order_by:
            if order_by.startswith("-"):
                field = getattr(self.model, order_by[1:], None)
                if field is not None:
                    query = query.order_by(field.desc())
            else:
                field = getattr(self.model, order_by, None)
                if field is not None:
                    query = query.order_by(field)

        records = query.offset(skip).limit(limit).all()
        return records, total

    def get_by_id(self, obj_id: str) -> Optional[Asset]:
        """
        Override to exclude soft-deleted assets.

        Args:
            obj_id: Asset ID

        Returns:
            Optional[Asset]: Asset or None
        """
        return (
            self.db.query(self.model)
            .filter(
                self.model.id == obj_id,
                self.model.is_deleted.is_(False),
            )
            .first()
        )
