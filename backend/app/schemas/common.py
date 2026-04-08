"""
Common Schemas

Shared Pydantic models for pagination, filters, and common responses.
"""

from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginationParams(BaseModel):
    """Pagination parameters for list endpoints."""

    skip: int = Field(default=0, ge=0, description="Number of records to skip")
    limit: int = Field(default=20, ge=1, le=100, description="Number of records to return")

    model_config = {"json_schema_extra": {"example": {"skip": 0, "limit": 20}}}


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper."""

    total: int = Field(description="Total number of items")
    skip: int = Field(description="Number of items skipped")
    limit: int = Field(description="Number of items returned")
    items: List[T] = Field(description="List of items")

    @property
    def total_pages(self) -> int:
        """Calculate total pages."""
        return (self.total + self.limit - 1) // self.limit

    @property
    def current_page(self) -> int:
        """Calculate current page number."""
        return (self.skip // self.limit) + 1


class ErrorResponse(BaseModel):
    """Error response model."""

    error: dict = Field(description="Error details")

    model_config = {
        "json_schema_extra": {
            "example": {
                "error": {
                    "code": "NOT_FOUND",
                    "message": "Resource not found",
                    "details": {},
                }
            }
        }
    }


class SuccessResponse(BaseModel, Generic[T]):
    """Generic success response wrapper."""

    data: T = Field(description="Response data")
    message: Optional[str] = Field(default=None, description="Success message")
