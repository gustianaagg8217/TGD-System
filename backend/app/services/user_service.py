"""
User Service

Service layer for user management operations.
"""

from typing import List, Tuple, Optional
from sqlalchemy.orm import Session, joinedload

from app.models.user import User
from app.models.role import Role
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.core.exceptions import ResourceNotFoundException, DuplicateResourceException
from app.core.security import hash_password
import uuid


class UserService:
    """Service for user management."""

    def __init__(self, db: Session):
        """Initialize user service."""
        self.db = db
        self.repository = UserRepository(db)

    def get_all_users(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[UserResponse], int]:
        """
        Get all users with pagination.

        Args:
            skip: Number of records to skip
            limit: Maximum records to return

        Returns:
            Tuple of (users list, total count)
        """
        query = self.db.query(User).options(joinedload(User.role))
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        return [UserResponse.from_orm(u) for u in users], total

    def get_user_by_id(self, user_id: str) -> UserResponse:
        """
        Get user by ID.

        Args:
            user_id: User ID

        Returns:
            UserResponse: User data

        Raises:
            ResourceNotFoundException: If user not found
        """
        user = self.db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
        if not user:
            raise ResourceNotFoundException(
                resource_type="User",
                resource_id=user_id,
            )
        return UserResponse.from_orm(user)

    def create_user(self, user_in: UserCreate) -> UserResponse:
        """
        Create a new user.

        Args:
            user_in: User creation schema

        Returns:
            UserResponse: Created user

        Raises:
            DuplicateResourceException: If username/email already exists
        """
        # Check if username or email already exists
        if self.repository.username_exists(user_in.username):
            raise DuplicateResourceException(
                resource_type="User",
                field="username",
                value=user_in.username,
            )
        
        if self.repository.email_exists(user_in.email):
            raise DuplicateResourceException(
                resource_type="User",
                field="email",
                value=user_in.email,
            )

        # Verify role exists
        role = self.db.query(Role).filter(Role.id == user_in.role_id).first()
        if not role:
            raise ResourceNotFoundException(
                resource_type="Role",
                resource_id=user_in.role_id,
            )

        # Create new user with hashed password
        new_user = User(
            id=str(uuid.uuid4()),
            username=user_in.username,
            email=user_in.email,
            password_hash=hash_password(user_in.password),
            full_name=user_in.full_name,
            role_id=user_in.role_id,
            is_active=user_in.is_active,
        )
        
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        
        # Eager load role
        new_user = self.db.query(User).options(joinedload(User.role)).filter(User.id == new_user.id).first()
        
        return UserResponse.from_orm(new_user)

    def update_user(self, user_id: str, user_update: UserUpdate) -> UserResponse:
        """
        Update user.

        Args:
            user_id: User ID
            user_update: Update schema

        Returns:
            UserResponse: Updated user

        Raises:
            ResourceNotFoundException: If user not found
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ResourceNotFoundException(
                resource_type="User",
                resource_id=user_id,
            )

        # Check if email is being updated and already exists
        if user_update.email and user_update.email != user.email:
            if self.repository.email_exists(user_update.email):
                raise DuplicateResourceException(
                    resource_type="User",
                    field="email",
                    value=user_update.email,
                )

        # Update user fields
        update_data = user_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        
        # Eager load role
        user = self.db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
        
        return UserResponse.from_orm(user)

    def delete_user(self, user_id: str) -> None:
        """
        Delete user.

        Args:
            user_id: User ID

        Raises:
            ResourceNotFoundException: If user not found
        """
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ResourceNotFoundException(
                resource_type="User",
                resource_id=user_id,
            )
        self.db.delete(user)
        self.db.commit()

    def get_users_by_role(
        self,
        role_id: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[UserResponse], int]:
        """
        Get users by role.

        Args:
            role_id: Role ID
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple of (users list, total count)
        """
        query = self.db.query(User).options(joinedload(User.role)).filter(User.role_id == role_id)
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        return [UserResponse.from_orm(u) for u in users], total

    def get_active_users(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[UserResponse], int]:
        """
        Get active users.

        Args:
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple of (users list, total count)
        """
        query = self.db.query(User).options(joinedload(User.role)).filter(User.is_active.is_(True))
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        return [UserResponse.from_orm(u) for u in users], total
