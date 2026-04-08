"""
User Schemas

Pydantic models for user-related requests and responses.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr


class UserBase(BaseModel):
    """Base user schema."""

    username: str = Field(min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(description="Email address")
    full_name: str = Field(min_length=1, max_length=255, description="Full name")
    role_id: str = Field(description="Role ID")
    is_active: bool = Field(default=True, description="Is user active")


class UserCreate(UserBase):
    """User creation schema."""

    password: str = Field(min_length=8, max_length=255, description="Password")


class UserUpdate(BaseModel):
    """User update schema."""

    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    role_id: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    """User response schema."""

    id: str = Field(description="User ID")
    last_login: Optional[datetime] = Field(description="Last login timestamp")
    created_at: datetime = Field(description="Creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")

    model_config = {"from_attributes": True}


# ===== Authentication Schemas =====


class LoginRequest(BaseModel):
    """Login request schema."""

    username: Optional[str] = Field(None, min_length=3, max_length=50, description="Username")
    email: Optional[EmailStr] = Field(None, description="Email address")
    password: str = Field(min_length=8, max_length=255, description="Password")
    
    def __init__(self, **data):
        super().__init__(**data)
        if not self.username and not self.email:
            raise ValueError("Either username or email must be provided")


class TokenResponse(BaseModel):
    """Token response schema."""

    access_token: str = Field(description="JWT access token")
    refresh_token: str = Field(description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(description="Expiration time in seconds")


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema."""

    refresh_token: str = Field(description="JWT refresh token")


class CurrentUserResponse(BaseModel):
    """Current user response schema."""

    id: str = Field(description="User ID")
    username: str
    email: str
    full_name: str
    role_id: str
    is_active: bool
    last_login: Optional[datetime]

    model_config = {"from_attributes": True}


# ===== Role Schemas =====

class RoleBase(BaseModel):
    """Base role schema."""

    name: str = Field(min_length=1, max_length=50, description="Role name")
    description: Optional[str] = Field(None, max_length=255, description="Role description")
    permissions: Optional[dict] = Field(default_factory=dict, description="Role permissions")


class RoleCreate(RoleBase):
    """Role creation schema."""

    pass


class RoleUpdate(BaseModel):
    """Role update schema."""

    name: Optional[str] = Field(None, min_length=1, max_length=50, description="Role name")
    description: Optional[str] = Field(None, max_length=255, description="Role description")
    permissions: Optional[dict] = Field(None, description="Role permissions")


class RoleResponse(RoleBase):
    """Role response schema."""

    id: str = Field(description="Role ID")
    created_at: datetime = Field(description="Creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")

    model_config = {"from_attributes": True}


class RoleWithUsersResponse(RoleResponse):
    """Role response with user count."""

    user_count: int = Field(default=0, description="Number of users with this role")

    model_config = {"from_attributes": True}
