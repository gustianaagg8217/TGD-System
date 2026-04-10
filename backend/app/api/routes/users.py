"""
Users API Routes

CRUD endpoints for user management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.user_service import UserService
from app.api.deps import get_current_user
from app.core.exceptions import ResourceNotFoundException, DuplicateResourceException
from app.models.user import User

router = APIRouter()


@router.get(
    "/",
    response_model=dict,
    summary="Get all users",
)
def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """
    Get all users with pagination.

    - **skip**: Number of records to skip (default: 0)
    - **limit**: Maximum records to return (default: 100, max: 1000)

    Returns paginated list of users.
    """
    service = UserService(db)
    users, total = service.get_all_users(skip=skip, limit=limit)
    return {
        "data": users,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get user by ID",
)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
):
    """
    Get user by ID.

    Args:
        user_id: User ID (UUID)

    Returns:
        UserResponse: User data
    """
    service = UserService(db)
    try:
        user = service.get_user_by_id(user_id)
        return user
    except ResourceNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )


@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new user",
)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new user.

    Required fields:
    - **username**: Unique username (3-50 chars)
    - **email**: Valid email address
    - **password**: Secure password (8+ chars)
    - **full_name**: Full user name
    - **role_id**: Role ID (e.g., admin, engineer, viewer)
    """
    service = UserService(db)
    try:
        user = service.create_user(user_in)
        return user
    except DuplicateResourceException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=e.message,
        )
    except ResourceNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update user",
)
def update_user(
    user_id: str,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
):
    """
    Update user data.

    Updatable fields:
    - **email**: New email address
    - **full_name**: New full name
    - **role_id**: New role ID
    - **is_active**: Active status
    """
    service = UserService(db)
    try:
        user = service.update_user(user_id, user_update)
        return user
    except ResourceNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    except DuplicateResourceException as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=e.message,
        )


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete user",
)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
):
    """
    Delete a user.

    Args:
        user_id: User ID to delete
    """
    service = UserService(db)
    try:
        service.delete_user(user_id)
        return None
    except ResourceNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )


@router.get(
    "/role/{role_id}",
    response_model=dict,
    summary="Get users by role",
)
def get_users_by_role(
    role_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """
    Get users filtered by role.

    Args:
        role_id: Role ID
        skip: Number to skip
        limit: Max records

    Returns paginated list of users.
    """
    service = UserService(db)
    users, total = service.get_users_by_role(
        role_id=role_id,
        skip=skip,
        limit=limit,
    )
    return {
        "data": users,
        "total": total,
        "skip": skip,
        "limit": limit,
    }


@router.get(
    "/status/active",
    response_model=dict,
    summary="Get active users",
)
def get_active_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """
    Get only active users.

    Args:
        skip: Number to skip
        limit: Max records

    Returns paginated list of active users.
    """
    service = UserService(db)
    users, total = service.get_active_users(skip=skip, limit=limit)
    return {
        "data": users,
        "total": total,
        "skip": skip,
        "limit": limit,
    }
