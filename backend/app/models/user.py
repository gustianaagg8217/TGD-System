"""
User Model

SQLAlchemy ORM model for users with role-based access control.
"""

from sqlalchemy import Boolean, DateTime, String, ForeignKey, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone

from app.db.base import TimeStampedModel
from app.core.constants import RoleEnum


class User(TimeStampedModel):
    """
    User model for authentication and authorization.

    Attributes:
        id: Unique user identifier (UUID)
        username: Unique username
        email: Unique email address
        password_hash: Bcrypt hashed password
        full_name: User's full name
        role_id: Foreign key to roles table
        is_active: Whether user account is active
        last_login: Timestamp of last login
        created_by: User ID who created this user
        role: Relationship to Role model
    """

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role_id: Mapped[str] = mapped_column(String(36), ForeignKey("roles.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )
    created_by: Mapped[str] = mapped_column(String(36), nullable=True)

    # Relationships
    role: Mapped["Role"] = relationship("Role", back_populates="users")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"


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
