"""
Asset Routes

Asset management endpoints.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.asset import (
    AssetCreate,
    AssetUpdate,
    AssetResponse,
    AssetDetailResponse,
)
from app.schemas.common import PaginatedResponse
from app.services.asset_service import AssetService
from app.core.exceptions import ResourceNotFoundException, ValidationException
from app.api.deps import get_current_user, get_asset_service, require_engineer

router = APIRouter()


@router.post(
    "",
    response_model=AssetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create new asset",
)
def create_asset(
    asset_in: AssetCreate,
    asset_service: AssetService = Depends(get_asset_service),
    current_user=Depends(require_engineer),
):
    """
    Create a new asset.

    Required fields:
    - **name**: Asset name
    - **type**: Asset type (machinery, vehicle, equipment, etc.)
    - **status**: Asset status (active, inactive, maintenance, retired)

    Optional fields:
    - **location**: Physical location
    - **acquisition_date**: When asset was acquired
    - **value**: Asset value
    - **parent_asset_id**: Parent asset for hierarchy
    - **asset_metadata**: Custom fields (JSON)
    """
    try:
        return asset_service.create_asset(asset_in, current_user.id)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get("", response_model=PaginatedResponse, summary="List assets")
def list_assets(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    asset_type: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    location: Optional[str] = Query(None),
    asset_service: AssetService = Depends(get_asset_service),
    current_user=Depends(get_current_user),
):
    """
    List all assets with pagination and filtering.

    Query parameters:
    - **skip**: Number of records to skip (default: 0)
    - **limit**: Max records to return (default: 20, max: 100)
    - **asset_type**: Filter by type
    - **status**: Filter by status
    - **location**: Filter by location
    """
    assets, total = asset_service.list_assets(
        skip=skip,
        limit=limit,
        asset_type=asset_type,
        status=status_filter,
        location=location,
    )

    return PaginatedResponse(
        total=total,
        skip=skip,
        limit=limit,
        items=assets,
    )


@router.get("/search", response_model=PaginatedResponse, summary="Search assets")
def search_assets(
    q: str = Query(..., description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    asset_service: AssetService = Depends(get_asset_service),
    current_user=Depends(get_current_user),
):
    """
    Search assets by name, location, type.

    - **q**: Search query (required)
    - **skip**: Number of records to skip
    - **limit**: Max records to return
    """
    assets, total = asset_service.search_assets(q, skip, limit)

    return PaginatedResponse(
        total=total,
        skip=skip,
        limit=limit,
        items=assets,
    )


@router.get("/{asset_id}", response_model=AssetDetailResponse, summary="Get asset details")
def get_asset(
    asset_id: str,
    asset_service: AssetService = Depends(get_asset_service),
    current_user=Depends(get_current_user),
):
    """
    Get detailed information about a specific asset.

    Includes:
    - Asset basic information
    - Related maintenance logs count
    - Related sensor logs count
    - Related documents count
    - Asset hierarchy info
    """
    try:
        return asset_service.get_asset(asset_id)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.put("/{asset_id}", response_model=AssetResponse, summary="Update asset")
def update_asset(
    asset_id: str,
    asset_in: AssetUpdate,
    asset_service: AssetService = Depends(get_asset_service),
    current_user=Depends(require_engineer),
):
    """
    Update an existing asset.

    All fields are optional. Only provided fields will be updated.
    """
    try:
        return asset_service.update_asset(asset_id, asset_in)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.delete("/{asset_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete asset")
def delete_asset(
    asset_id: str,
    hard_delete: bool = Query(False),
    asset_service: AssetService = Depends(get_asset_service),
    current_user=Depends(require_engineer),
):
    """
    Delete an asset.

    By default, performs a soft delete (marks as deleted).
    Use hard_delete=true to permanently remove from database.

    - **hard_delete**: If true, permanently delete (default: false)
    """
    try:
        asset_service.delete_asset(asset_id, soft_delete=not hard_delete)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.get("/{asset_id}/hierarchy", summary="Get asset hierarchy")
def get_asset_hierarchy(
    asset_id: str,
    asset_service: AssetService = Depends(get_asset_service),
    current_user=Depends(get_current_user),
):
    """
    Get asset hierarchy (parents, children, descendants).

    Returns:
    - **asset**: The asset itself
    - **ancestors**: List of parent assets
    - **children**: Direct child assets
    - **descendants**: All descendant assets
    """
    try:
        return asset_service.get_asset_hierarchy(asset_id)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
