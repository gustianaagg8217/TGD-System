"""
Role Management Routes

Endpoints for managing roles and permissions.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.db.session import get_db
from app.models.user import Role, User
from app.schemas.user import RoleResponse, RoleUpdate, RoleCreate, RoleWithUsersResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/api/v1/roles", tags=["roles"])


@router.get(
    "",
    response_model=List[RoleWithUsersResponse],
    summary="Get all roles",
    description="Retrieve all available roles with user counts"
)
def get_roles(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all roles with user counts."""
    roles = db.query(Role).offset(skip).limit(limit).all()
    
    # Add user count to each role
    result = []
    for role in roles:
        user_count = db.query(User).filter(User.role_id == role.id).count()
        result.append({
            **RoleResponse.from_orm(role).model_dump(),
            "user_count": user_count
        })
    
    return result


@router.get(
    "/{role_id}",
    response_model=RoleWithUsersResponse,
    summary="Get role by ID",
    description="Retrieve a specific role with user count"
)
def get_role(
    role_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific role by ID."""
    role = db.query(Role).filter(Role.id == role_id).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role {role_id} not found"
        )
    
    user_count = db.query(User).filter(User.role_id == role_id).count()
    return {
        **RoleResponse.from_orm(role).model_dump(),
        "user_count": user_count
    }


@router.post(
    "",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new role",
    description="Create a new role with permissions"
)
def create_role(
    role_in: RoleCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new role."""
    # Check if role already exists
    existing_role = db.query(Role).filter(Role.name == role_in.name).first()
    if existing_role:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Role '{role_in.name}' already exists"
        )
    
    role = Role(
        name=role_in.name,
        description=role_in.description,
        permissions=role_in.permissions or {}
    )
    
    db.add(role)
    db.commit()
    db.refresh(role)
    
    return RoleResponse.from_orm(role)


@router.put(
    "/{role_id}",
    response_model=RoleResponse,
    summary="Update role",
    description="Update role details and permissions"
)
def update_role(
    role_id: str,
    role_in: RoleUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update a role."""
    role = db.query(Role).filter(Role.id == role_id).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role {role_id} not found"
        )
    
    # Check if new name conflicts with existing role
    if role_in.name and role_in.name != role.name:
        existing_role = db.query(Role).filter(
            Role.name == role_in.name,
            Role.id != role_id
        ).first()
        if existing_role:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Role '{role_in.name}' already exists"
            )
    
    # Update fields
    if role_in.name is not None:
        role.name = role_in.name
    if role_in.description is not None:
        role.description = role_in.description
    if role_in.permissions is not None:
        role.permissions = role_in.permissions
    
    db.commit()
    db.refresh(role)
    
    return RoleResponse.from_orm(role)


@router.delete(
    "/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete role",
    description="Delete a role (only if no users assigned)"
)
def delete_role(
    role_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete a role."""
    role = db.query(Role).filter(Role.id == role_id).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role {role_id} not found"
        )
    
    # Check if users are assigned to this role
    user_count = db.query(User).filter(User.role_id == role_id).count()
    if user_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete role with {user_count} assigned users"
        )
    
    db.delete(role)
    db.commit()


@router.get(
    "/{role_id}/users",
    response_model=dict,
    summary="Get users by role",
    description="Get all users assigned to a specific role"
)
def get_role_users(
    role_id: str,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all users assigned to a role."""
    role = db.query(Role).filter(Role.id == role_id).first()
    
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role {role_id} not found"
        )
    
    users = db.query(User).filter(User.role_id == role_id).offset(skip).limit(limit).all()
    total = db.query(User).filter(User.role_id == role_id).count()
    
    return {
        "role_id": role_id,
        "role_name": role.name,
        "total": total,
        "users": users
    }
