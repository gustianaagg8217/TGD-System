"""
Base Model Class

Provides common fields and utilities for all SQLAlchemy ORM models.
"""

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy models.

    Provides:
    - UUID primary key
    - Automatic timestamps (created_at, updated_at)
    - Common utilities

    Example:
        class User(Base):
            __tablename__ = "users"
            name: Mapped[str]
            email: Mapped[str]
    """

    pass


class TimeStampedModel(Base):
    """
    Base model with timestamp fields.

    Automatically tracks creation and modification times.

    Example:
        class Asset(TimeStampedModel):
            __tablename__ = "assets"
            name: Mapped[str]
    """

    __abstract__ = True

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    def update(self):
        """Mark model as updated."""
        self.updated_at = datetime.now(timezone.utc)
