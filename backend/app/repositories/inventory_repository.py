"""
Inventory Repository

Repository for InventoryItem model with specialized queries.
"""

from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.inventory import InventoryItem
from app.schemas.asset import InventoryItemCreate, InventoryItemUpdate
from app.repositories.base import BaseRepository


class InventoryRepository(BaseRepository[InventoryItem, InventoryItemCreate, InventoryItemUpdate]):
    """
    Inventory Repository with specialized queries.

    Provides inventory-specific queries like:
    - Low stock items
    - Inventory by category
    - Stock levels
    """

    def __init__(self, db: Session):
        """Initialize Inventory Repository."""
        super().__init__(InventoryItem, db)

    def get_low_stock_items(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[InventoryItem], int]:
        """
        Get items with quantity below reorder level.

        Args:
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[InventoryItem], int]: Items and count
        """
        from sqlalchemy import and_

        query = self.db.query(InventoryItem).filter(
            and_(
                InventoryItem.quantity <= InventoryItem.reorder_level,
                InventoryItem.reorder_level.isnot(None),
            )
        )

        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return items, total

    def get_items_by_category(
        self,
        category: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[InventoryItem], int]:
        """
        Get inventory items by category.

        Args:
            category: Item category
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[InventoryItem], int]: Items and count
        """
        return self.filter(
            skip=skip,
            limit=limit,
            category=category,
        )

    def get_items_by_supplier(
        self,
        supplier: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[InventoryItem], int]:
        """
        Get inventory items by supplier.

        Args:
            supplier: Supplier name
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[InventoryItem], int]: Items and count
        """
        return self.filter(
            skip=skip,
            limit=limit,
            supplier=supplier,
        )

    def search_items(
        self,
        query_str: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[InventoryItem], int]:
        """
        Search inventory items.

        Args:
            query_str: Search string
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[InventoryItem], int]: Items and count
        """
        return self.search(
            search_fields=["item_code", "name", "category"],
            query_str=query_str,
            skip=skip,
            limit=limit,
        )

    def get_item_by_code(self, item_code: str) -> Optional[InventoryItem]:
        """
        Get inventory item by unique code.

        Args:
            item_code: Item code/SKU

        Returns:
            Optional[InventoryItem]: Item or None
        """
        return self.get_by_field("item_code", item_code)

    # ===== STATISTICS =====

    def get_total_inventory_value(self) -> float:
        """
        Get total value of all inventory.

        Returns:
            float: Total value
        """
        from sqlalchemy import func

        result = self.db.query(
            func.sum(InventoryItem.quantity * InventoryItem.price)
        ).scalar()
        return float(result or 0)

    def get_low_stock_count(self) -> int:
        """
        Get count of items below reorder level.

        Returns:
            int: Count
        """
        from sqlalchemy import and_

        return self.db.query(InventoryItem).filter(
            and_(
                InventoryItem.quantity <= InventoryItem.reorder_level,
                InventoryItem.reorder_level.isnot(None),
            )
        ).count()

    def get_categories(self) -> List[str]:
        """
        Get all unique categories.

        Returns:
            List[str]: List of categories
        """
        results = self.db.query(InventoryItem.category).distinct().all()
        return [cat[0] for cat in results if cat[0]]

    def get_inventory_summary(self) -> dict:
        """
        Get summary statistics for inventory.

        Returns:
            dict: Summary with total_items, low_stock_count, total_value
        """
        from sqlalchemy import func, and_

        total_items = self.count()
        low_stock_count = self.db.query(InventoryItem).filter(
            and_(
                InventoryItem.quantity <= InventoryItem.reorder_level,
                InventoryItem.reorder_level.isnot(None),
            )
        ).count()
        total_value = float(
            self.db.query(func.sum(InventoryItem.quantity * InventoryItem.price)).scalar() or 0
        )

        return {
            "total_items": total_items,
            "low_stock_count": low_stock_count,
            "total_value": total_value,
        }
