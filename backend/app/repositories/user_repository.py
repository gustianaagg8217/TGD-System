"""
User Repository

Repository for User model with specialized queries.
"""

from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    """
    User Repository with specialized queries.

    Provides user-specific queries like:
    - Get user by username
    - Get user by email
    - Get users by role
    """

    def __init__(self, db: Session):
        """Initialize User Repository."""
        super().__init__(User, db)

    def get_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username.

        Args:
            username: Username

        Returns:
            Optional[User]: User or None
        """
        return self.get_by_field("username", username)

    def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email.

        Args:
            email: Email address

        Returns:
            Optional[User]: User or None
        """
        return self.get_by_field("email", email)

    def get_users_by_role(
        self,
        role_id: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[User], int]:
        """
        Get users by role.

        Args:
            role_id: Role ID
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[User], int]: Users and count
        """
        return self.filter(
            skip=skip,
            limit=limit,
            role_id=role_id,
        )

    def get_active_users(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[User], int]:
        """
        Get active users (is_active=True).

        Args:
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[User], int]: Users and count
        """
        query = self.db.query(self.model).filter(self.model.is_active.is_(True))
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        return users, total

    def get_inactive_users(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[User], int]:
        """
        Get inactive users (is_active=False).

        Args:
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[User], int]: Users and count
        """
        query = self.db.query(self.model).filter(self.model.is_active.is_(False))
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        return users, total

    def username_exists(self, username: str) -> bool:
        """
        Check if username exists.

        Args:
            username: Username

        Returns:
            bool: True if exists, False otherwise
        """
        return self.get_by_username(username) is not None

    def email_exists(self, email: str) -> bool:
        """
        Check if email exists.

        Args:
            email: Email address

        Returns:
            bool: True if exists, False otherwise
        """
        return self.get_by_email(email) is not None
