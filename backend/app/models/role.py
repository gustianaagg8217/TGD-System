"""
Role Model

SQLAlchemy ORM model for roles and role-based access control (RBAC).
"""

from sqlalchemy import String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import TimeStampedModel


class Role(TimeStampedModel):
    """
    Role model for role-based access control (RBAC).

    Attributes:
        id: Unique role identifier
        name: Role name (admin, engineer, viewer)
        description: Role description
        permissions: JSON array of permission codes
        users: Relationship to User model
    """

    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    permissions: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)

    # Relationships
    users: Mapped[list["User"]] = relationship("User", back_populates="role")

    def __repr__(self) -> str:
        return f"<Role(id={self.id}, name={self.name})>"
