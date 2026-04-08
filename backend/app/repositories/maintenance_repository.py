"""
Maintenance Log Repository

Repository for MaintenanceLog model with specialized queries.
"""

from typing import List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.maintenance import MaintenanceLog
from app.schemas.asset import MaintenanceLogCreate, MaintenanceLogUpdate
from app.repositories.base import BaseRepository


class MaintenanceLogRepository(
    BaseRepository[MaintenanceLog, MaintenanceLogCreate, MaintenanceLogUpdate]
):
    """
    Maintenance Log Repository with specialized queries.

    Provides maintenance-specific queries like:
    - Maintenance logs by asset
    - Pending maintenance schedules
    - Maintenance statistics and costs
    """

    def __init__(self, db: Session):
        """Initialize Maintenance Log Repository."""
        super().__init__(MaintenanceLog, db)

    def get_maintenance_by_asset(
        self,
        asset_id: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[MaintenanceLog], int]:
        """
        Get all maintenance logs for a specific asset.

        Args:
            asset_id: Asset ID
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[MaintenanceLog], int]: Logs and total count
        """
        return self.filter(
            skip=skip,
            limit=limit,
            asset_id=asset_id,
            order_by="-date",
        )

    def get_pending_maintenance(
        self,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[MaintenanceLog], int]:
        """
        Get pending/scheduled maintenance tasks.

        Args:
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[MaintenanceLog], int]: Pending logs and count
        """
        query = self.db.query(MaintenanceLog).filter(
            MaintenanceLog.status.in_(["scheduled", "in_progress"])
        )

        total = query.count()
        logs = query.offset(skip).limit(limit).all()
        return logs, total

    def get_overdue_maintenance(self) -> List[MaintenanceLog]:
        """
        Get overdue maintenance (scheduled date has passed).

        Returns:
            List[MaintenanceLog]: Overdue maintenance logs
        """
        now = datetime.utcnow()
        return self.db.query(MaintenanceLog).filter(
            MaintenanceLog.next_maintenance_date < now,
            MaintenanceLog.status == "completed",
        ).all()

    def get_maintenance_by_type(
        self,
        maintenance_type: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[MaintenanceLog], int]:
        """
        Get maintenance logs filtered by type.

        Args:
            maintenance_type: Type (preventive, corrective, inspection)
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[MaintenanceLog], int]: Logs and count
        """
        return self.filter(
            skip=skip,
            limit=limit,
            maintenance_type=maintenance_type,
        )

    def get_maintenance_between_dates(
        self,
        start_date: datetime,
        end_date: datetime,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[MaintenanceLog], int]:
        """
        Get maintenance logs within date range.

        Args:
            start_date: Start date
            end_date: End date
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[MaintenanceLog], int]: Logs and count
        """
        query = self.db.query(MaintenanceLog).filter(
            MaintenanceLog.date >= start_date,
            MaintenanceLog.date <= end_date,
        )

        total = query.count()
        logs = query.offset(skip).limit(limit).all()
        return logs, total

    # ===== STATISTICS =====

    def get_maintenance_cost_by_asset(self, asset_id: str) -> float:
        """
        Get total maintenance cost for an asset.

        Args:
            asset_id: Asset ID

        Returns:
            float: Total cost
        """
        result = self.db.query(func.sum(MaintenanceLog.cost)).filter(
            MaintenanceLog.asset_id == asset_id
        ).scalar()
        return float(result or 0)

    def get_total_maintenance_cost(self) -> float:
        """
        Get total maintenance cost across all assets.

        Returns:
            float: Total cost
        """
        result = self.db.query(func.sum(MaintenanceLog.cost)).scalar()
        return float(result or 0)

    def get_average_downtime(self, asset_id: str) -> float:
        """
        Get average downtime for an asset.

        Args:
            asset_id: Asset ID

        Returns:
            float: Average downtime in minutes
        """
        result = self.db.query(func.avg(MaintenanceLog.downtime)).filter(
            MaintenanceLog.asset_id == asset_id
        ).scalar()
        return float(result or 0)

    def get_maintenance_count_this_month(self) -> int:
        """
        Get maintenance count for current month.

        Returns:
            int: Count
        """
        now = datetime.utcnow()
        first_day = now.replace(day=1)
        last_day = (first_day + timedelta(days=32)).replace(day=1) - timedelta(days=1)

        return self.db.query(MaintenanceLog).filter(
            MaintenanceLog.date >= first_day,
            MaintenanceLog.date <= last_day,
        ).count()

    def get_maintenance_by_technician(
        self,
        technician: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[MaintenanceLog], int]:
        """
        Get maintenance logs by technician.

        Args:
            technician: Technician name
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[MaintenanceLog], int]: Logs and count
        """
        return self.filter(
            skip=skip,
            limit=limit,
            technician=technician,
        )
