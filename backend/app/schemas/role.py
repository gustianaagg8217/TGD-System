"""
Role Schemas

Pydantic models for role-related requests and responses.
"""

from typing import Optional
from pydantic import BaseModel, Field


class RoleBase(BaseModel):
    """Base role schema."""

    name: str = Field(min_length=1, max_length=50, description="Role name")
    description: Optional[str] = Field(None, max_length=255, description="Role description")


class RoleCreate(RoleBase):
    """Role creation schema."""

    pass


class RoleUpdate(BaseModel):
    """Role update schema."""

    name: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = Field(None, max_length=255)


class RoleResponse(RoleBase):
    """Role response schema."""

    id: str = Field(description="Role ID")
    permissions: dict = Field(default_factory=dict, description="Role permissions")

    model_config = {"from_attributes": True}
