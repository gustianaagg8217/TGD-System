"""
Authentication Routes

JWT authentication endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import LoginRequest, TokenResponse, UserCreate, UserResponse
from app.services.auth_service import AuthService
from app.core.exceptions import DuplicateResourceException, InvalidCredentialsException
from app.api.deps import get_current_user, get_auth_service

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user",
)
def register(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    """
    Register a new user account.

    - **username**: Unique username (3-50 chars)
    - **email**: Valid email address
    - **password**: Secure password (8+ chars)
    - **full_name**: Full user name
    - **role_id**: Role ID (admin, engineer, viewer)
    """
    auth_service = AuthService(db)
    try:
        user = auth_service.register_user(user_in)
        return UserResponse.from_orm(user)
    except DuplicateResourceException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=e.message,
        )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and get tokens",
)
def login(
    login_request: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticate user and get JWT tokens.

    - **username**: Username or email
    - **password**: Password

    Returns:
    - access_token: JWT access token (30 min)
    - refresh_token: JWT refresh token (7 days)
    """
    auth_service = AuthService(db)
    try:
        token_response = auth_service.authenticate_user(login_request)
        return token_response
    except InvalidCredentialsException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
        )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
)
def refresh_token(
    request_data: dict,
    auth_service: AuthService = Depends(get_auth_service),
):
    """
    Refresh access token using refresh token.

    Body: {"refresh_token": "your_refresh_token"}
    """
    try:
        token_response = auth_service.refresh_access_token(request_data["refresh_token"])
        return token_response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )


@router.get(
    "/me",
    summary="Get current user",
)
def get_me(current_user=Depends(get_current_user)):
    """
    Get current authenticated user information.

    Returns current user details including role.
    """
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role_id": current_user.role_id,
        "role": {
            "id": current_user.role.id,
            "name": current_user.role.name,
        } if current_user.role else None,
        "is_active": current_user.is_active,
        "last_login": current_user.last_login,
    }
