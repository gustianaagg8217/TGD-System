"""
Inventory Item Model

SQLAlchemy ORM model for inventory management.
"""

from sqlalchemy import String, DateTime, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from decimal import Decimal

from app.db.base import TimeStampedModel


class InventoryItem(TimeStampedModel):
    """
    Inventory Item model for spare parts and inventory tracking.

    Attributes:
        id: Unique inventory item identifier
        item_code: Unique SKU/item code
        name: Item name
        quantity: Current stock quantity
        reorder_level: Minimum quantity before reorder alert
        supplier: Supplier name
        price: Unit price
        category: Item category
        location: Warehouse/storage location
        last_restock_date: Date of last restock
        created_by: User ID who created this item
    """

    __tablename__ = "inventory_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    item_code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reorder_level: Mapped[int] = mapped_column(Integer, nullable=True)
    supplier: Mapped[str] = mapped_column(String(255), nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=True)
    category: Mapped[str] = mapped_column(String(100), nullable=True, index=True)
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    last_restock_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by: Mapped[str] = mapped_column(String(36), nullable=True)

    def __repr__(self) -> str:
        return f"<InventoryItem(id={self.id}, item_code={self.item_code}, quantity={self.quantity})>"
