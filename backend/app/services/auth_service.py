"""
Auth Service

Authentication and authorization business logic.
"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate, LoginRequest, TokenResponse
from app.repositories.user_repository import UserRepository
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
)
from app.core.exceptions import (
    InvalidCredentialsException,
    DuplicateResourceException,
)


class AuthService:
    """Authentication Service."""

    def __init__(self, db: Session):
        """Initialize Auth Service."""
        self.user_repository = UserRepository(db)
        self.db = db

    def register_user(self, user_in: UserCreate) -> User:
        """
        Register a new user.

        Args:
            user_in: User creation data

        Returns:
            User: Created user

        Raises:
            DuplicateResourceException: If username/email already exists
        """
        # Check if username exists
        if self.user_repository.username_exists(user_in.username):
            raise DuplicateResourceException(
                resource_type="User",
                field="username",
                value=user_in.username,
            )

        # Check if email exists
        if self.user_repository.email_exists(user_in.email):
            raise DuplicateResourceException(
                resource_type="User",
                field="email",
                value=user_in.email,
            )

        # Hash password and create user
        user_data = user_in.model_dump()
        user_data["password_hash"] = hash_password(user_in.password)
        del user_data["password"]
        user_data["id"] = str(__import__("uuid").uuid4())

        from app.schemas.user import UserCreate as UserCreateSchema
        user = self.user_repository.create(
            UserCreateSchema(**{k: v for k, v in user_data.items() if k != "id"}),
            **{"id": user_data["id"]},
        )
        return user

    def authenticate_user(self, login_request: LoginRequest) -> TokenResponse:
        """
        Authenticate user and return tokens.

        Args:
            login_request: Login credentials (username or email + password)

        Returns:
            TokenResponse: Access and refresh tokens

        Raises:
            InvalidCredentialsException: If credentials invalid
        """
        # Find user by username or email
        user = None
        
        if login_request.username:
            user = self.user_repository.get_by_username(login_request.username)
            # Also try as email if username lookup fails
            if not user:
                user = self.user_repository.get_by_email(login_request.username)
        
        if not user and login_request.email:
            user = self.user_repository.get_by_email(login_request.email)

        # Verify user exists and password correct
        if not user or not verify_password(login_request.password, user.password_hash):
            raise InvalidCredentialsException()

        # Update last_login
        user.last_login = datetime.now(timezone.utc)
        self.db.add(user)
        self.db.commit()

        # Generate tokens
        access_token = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=1800,  # 30 minutes
        )

    def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        """
        Generate new access token from refresh token.

        Args:
            refresh_token: Refresh token

        Returns:
            TokenResponse: New tokens

        Raises:
            TokenExpiredException: If token expired
            InvalidTokenException: If token invalid
        """
        from app.core.security import get_subject_from_token

        user_id = get_subject_from_token(refresh_token)
        user = self.user_repository.get_by_id(user_id)

        if not user or not user.is_active:
            raise InvalidCredentialsException()

        access_token = create_access_token(subject=user.id)
        new_refresh_token = create_refresh_token(subject=user.id)

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=1800,
        )

    def get_current_user(self, user_id: str) -> User:
        """
        Get current user by ID.

        Args:
            user_id: User ID

        Returns:
            User: User object

        Raises:
            ResourceNotFoundException: If user not found
        """
        return self.user_repository.get_by_id_or_404(user_id)
