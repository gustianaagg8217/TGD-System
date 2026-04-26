"""
Maintenance Routes

API endpoints for maintenance log management.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.schemas.maintenance import (
    MaintenanceLogCreate,
    MaintenanceLogUpdate,
    MaintenanceLogResponse,
    MaintenanceLogDetailResponse,
)
from app.schemas.common import PaginatedResponse
from app.services.maintenance_service import MaintenanceService
from app.core.exceptions import ResourceNotFoundException, ValidationException
from app.api.deps import get_current_user, require_engineer
from app.db.session import get_db
from sqlalchemy.orm import Session

router = APIRouter()


def get_maintenance_service(db: Session = Depends(get_db)) -> MaintenanceService:
    """Dependency to get maintenance service."""
    return MaintenanceService(db)


@router.post(
    "",
    response_model=MaintenanceLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create maintenance log",
)
def create_maintenance_log(
    maintenance_in: MaintenanceLogCreate,
    maintenance_service: MaintenanceService = Depends(get_maintenance_service),
    current_user=Depends(require_engineer),
):
    """
    Create a new maintenance log.

    Required fields:
    - **asset_id**: Asset ID
    - **maintenance_type**: Type (preventive, corrective)
    - **technician**: Technician name
    - **cost**: Maintenance cost

    Optional fields:
    - **downtime**: Downtime in minutes
    - **description**: Description
    - **status**: Status (scheduled, in_progress, completed)
    - **next_maintenance_date**: Next maintenance date
    """
    try:
        return maintenance_service.create_maintenance_log(maintenance_in, current_user.id)
    except ValidationException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)


@router.get("", response_model=PaginatedResponse, summary="List maintenance logs")
def list_maintenance_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    asset_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    maintenance_type: Optional[str] = Query(None, alias="type"),
    maintenance_service: MaintenanceService = Depends(get_maintenance_service),
    current_user=Depends(get_current_user),
):
    """
    List all maintenance logs with pagination and filtering.

    Query parameters:
    - **skip**: Number of records to skip (default: 0)
    - **limit**: Max records to return (default: 20, max: 100)
    - **asset_id**: Filter by asset
    - **status**: Filter by status
    - **type**: Filter by maintenance type
    """
    logs, total = maintenance_service.list_maintenance_logs(
        skip=skip,
        limit=limit,
        asset_id=asset_id,
        status=status_filter,
        maintenance_type=maintenance_type,
    )

    return PaginatedResponse(
        total=total,
        skip=skip,
        limit=limit,
        items=logs,
    )


@router.get("/{log_id}", response_model=MaintenanceLogResponse, summary="Get maintenance log")
def get_maintenance_log(
    log_id: str,
    maintenance_service: MaintenanceService = Depends(get_maintenance_service),
    current_user=Depends(get_current_user),
):
    """Get a specific maintenance log by ID."""
    try:
        return maintenance_service.get_maintenance_log(log_id)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.patch(
    "/{log_id}",
    response_model=MaintenanceLogResponse,
    summary="Update maintenance log",
)
def update_maintenance_log(
    log_id: str,
    maintenance_in: MaintenanceLogUpdate,
    maintenance_service: MaintenanceService = Depends(get_maintenance_service),
    current_user=Depends(require_engineer),
):
    """Update a maintenance log."""
    try:
        return maintenance_service.update_maintenance_log(log_id, maintenance_in)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete maintenance log")
def delete_maintenance_log(
    log_id: str,
    maintenance_service: MaintenanceService = Depends(get_maintenance_service),
    current_user=Depends(require_engineer),
):
    """Delete a maintenance log."""
    try:
        maintenance_service.delete_maintenance_log(log_id)
    except ResourceNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.get("/asset/{asset_id}/history", summary="Get asset maintenance history")
def get_asset_maintenance_history(
    asset_id: str,
    limit: int = Query(10, ge=1, le=100),
    maintenance_service: MaintenanceService = Depends(get_maintenance_service),
    current_user=Depends(get_current_user),
):
    """Get maintenance history for a specific asset."""
    logs = maintenance_service.get_asset_maintenance_history(asset_id, limit)
    return {"items": logs, "total": len(logs)}


@router.get("/stats/overview", summary="Get maintenance statistics")
def get_maintenance_stats(
    asset_id: Optional[str] = Query(None),
    maintenance_service: MaintenanceService = Depends(get_maintenance_service),
    current_user=Depends(get_current_user),
):
    """Get maintenance statistics."""
    stats = maintenance_service.get_maintenance_stats(asset_id)
    return stats
