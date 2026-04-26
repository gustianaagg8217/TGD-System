"""
Maintenance Service

Business logic for maintenance log operations.
"""

from typing import Tuple, Optional
from uuid import uuid4
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy import desc, and_

from app.models.maintenance import MaintenanceLog
from app.models.asset import Asset
from app.schemas.maintenance import MaintenanceLogCreate, MaintenanceLogUpdate
from app.core.exceptions import ResourceNotFoundException, ValidationException


class MaintenanceService:
    """Service for maintenance log operations."""

    def __init__(self, db: Session):
        """Initialize service with database session."""
        self.db = db

    def create_maintenance_log(
        self, maintenance_in: MaintenanceLogCreate, user_id: str
    ) -> MaintenanceLog:
        """
        Create a new maintenance log.

        Args:
            maintenance_in: Maintenance log data
            user_id: ID of user creating the log

        Returns:
            Created maintenance log

        Raises:
            ValidationException: If asset doesn't exist or validation fails
        """
        # Verify asset exists
        asset = self.db.query(Asset).filter(Asset.id == maintenance_in.asset_id).first()
        if not asset:
            raise ValidationException(f"Asset with ID {maintenance_in.asset_id} not found")

        # Create maintenance log
        maintenance_log = MaintenanceLog(
            id=str(uuid4()),
            asset_id=maintenance_in.asset_id,
            maintenance_type=maintenance_in.maintenance_type,
            technician=maintenance_in.technician,
            cost=maintenance_in.cost,
            downtime=maintenance_in.downtime or 0,
            description=maintenance_in.description,
            status=maintenance_in.status or "scheduled",
            next_maintenance_date=maintenance_in.next_maintenance_date,
            created_by=user_id,
        )

        self.db.add(maintenance_log)
        self.db.commit()
        self.db.refresh(maintenance_log)

        return maintenance_log

    def list_maintenance_logs(
        self,
        skip: int = 0,
        limit: int = 20,
        asset_id: Optional[str] = None,
        status: Optional[str] = None,
        maintenance_type: Optional[str] = None,
    ) -> Tuple[list, int]:
        """
        List maintenance logs with pagination and filtering.

        Args:
            skip: Number of records to skip
            limit: Max records to return
            asset_id: Filter by asset
            status: Filter by status
            maintenance_type: Filter by type

        Returns:
            Tuple of (logs list, total count)
        """
        query = self.db.query(MaintenanceLog)

        # Apply filters
        if asset_id:
            query = query.filter(MaintenanceLog.asset_id == asset_id)
        if status:
            query = query.filter(MaintenanceLog.status == status)
        if maintenance_type:
            query = query.filter(MaintenanceLog.maintenance_type == maintenance_type)

        total = query.count()
        logs = query.order_by(desc(MaintenanceLog.created_at)).offset(skip).limit(limit).all()

        return logs, total

    def get_maintenance_log(self, log_id: str) -> MaintenanceLog:
        """
        Get a maintenance log by ID.

        Args:
            log_id: Maintenance log ID

        Returns:
            Maintenance log

        Raises:
            ResourceNotFoundException: If log not found
        """
        log = self.db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
        if not log:
            raise ResourceNotFoundException(f"Maintenance log {log_id} not found")
        return log

    def update_maintenance_log(
        self, log_id: str, maintenance_in: MaintenanceLogUpdate
    ) -> MaintenanceLog:
        """
        Update a maintenance log.

        Args:
            log_id: Maintenance log ID
            maintenance_in: Update data

        Returns:
            Updated maintenance log

        Raises:
            ResourceNotFoundException: If log not found
        """
        log = self.get_maintenance_log(log_id)

        # Update fields
        update_data = maintenance_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(log, field, value)

        self.db.commit()
        self.db.refresh(log)

        return log

    def delete_maintenance_log(self, log_id: str) -> None:
        """
        Delete a maintenance log.

        Args:
            log_id: Maintenance log ID

        Raises:
            ResourceNotFoundException: If log not found
        """
        log = self.get_maintenance_log(log_id)
        self.db.delete(log)
        self.db.commit()

    def get_asset_maintenance_history(self, asset_id: str, limit: int = 10) -> list:
        """
        Get maintenance history for an asset.

        Args:
            asset_id: Asset ID
            limit: Max records

        Returns:
            List of maintenance logs
        """
        logs = (
            self.db.query(MaintenanceLog)
            .filter(MaintenanceLog.asset_id == asset_id)
            .order_by(desc(MaintenanceLog.date))
            .limit(limit)
            .all()
        )
        return logs

    def get_maintenance_stats(self, asset_id: Optional[str] = None) -> dict:
        """
        Get maintenance statistics.

        Args:
            asset_id: Filter by asset (optional)

        Returns:
            Statistics dict
        """
        query = self.db.query(MaintenanceLog)
        if asset_id:
            query = query.filter(MaintenanceLog.asset_id == asset_id)

        total_logs = query.count()
        completed = query.filter(MaintenanceLog.status == "completed").count()
        pending = query.filter(MaintenanceLog.status == "scheduled").count()
        in_progress = query.filter(MaintenanceLog.status == "in_progress").count()

        return {
            "total": total_logs,
            "completed": completed,
            "pending": pending,
            "in_progress": in_progress,
        }
