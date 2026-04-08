"""
API Dependencies

Dependency injection setup for FastAPI endpoints.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.security import get_subject_from_token
from app.core.exceptions import AuthenticationException, AuthorizationException
from app.services.auth_service import AuthService
from app.services.asset_service import AssetService
from app.repositories.user_repository import UserRepository


def get_current_user_id(authorization: Optional[str] = Header(None)) -> str:
    """
    Extract current user ID from JWT token.

    Args:
        authorization: Bearer token from Authorization header

    Returns:
        str: User ID

    Raises:
        HTTPException: If token invalid or missing
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )

    token = parts[1]

    try:
        user_id = get_subject_from_token(token)
        return user_id
    except AuthenticationException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
        )


def get_current_user(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    """
    Get current authenticated user.

    Args:
        db: Database session
        user_id: Current user ID

    Returns:
        User: Current user object

    Raises:
        HTTPException: If user not found or inactive
    """
    auth_service = AuthService(db)
    try:
        user = auth_service.get_current_user(user_id)
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user",
        )


def get_asset_service(db: Session = Depends(get_db)) -> AssetService:
    """
    Get asset service instance.

    Args:
        db: Database session

    Returns:
        AssetService: Asset service instance
    """
    return AssetService(db)


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    """
    Get auth service instance.

    Args:
        db: Database session

    Returns:
        AuthService: Auth service instance
    """
    return AuthService(db)


# Role-based access control
def require_admin(current_user=Depends(get_current_user)):
    """Require admin role."""
    if current_user.role.name != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin role required",
        )
    return current_user


def require_engineer(current_user=Depends(get_current_user)):
    """Require engineer or admin role."""
    if current_user.role.name not in ["engineer", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Engineer role required",
        )
    return current_user
