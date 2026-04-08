"""
Vehicle Repository

Repository for Vehicle model with specialized queries.
"""

from typing import List, Optional, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.vehicle import Vehicle, VehicleUsageLog
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleUsageLogCreate
from app.repositories.base import BaseRepository


class VehicleRepository(BaseRepository[Vehicle, VehicleCreate, VehicleUpdate]):
    """
    Vehicle Repository with specialized queries.

    Provides vehicle-specific queries like:
    - Vehicle by registration number
    - Vehicles by status
    - Vehicle statistics
    """

    def __init__(self, db: Session):
        """Initialize Vehicle Repository."""
        super().__init__(Vehicle, db)

    def get_by_registration(self, registration_number: str) -> Optional[Vehicle]:
        """
        Get vehicle by registration number.

        Args:
            registration_number: Registration number

        Returns:
            Optional[Vehicle]: Vehicle or None
        """
        return self.get_by_field("registration_number", registration_number)

    def get_vehicles_by_status(
        self,
        status: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Vehicle], int]:
        """
        Get vehicles filtered by status.

        Args:
            status: Vehicle status
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[Vehicle], int]: Vehicles and count
        """
        return self.filter(
            skip=skip,
            limit=limit,
            status=status,
        )

    def get_vehicles_by_type(
        self,
        vehicle_type: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Vehicle], int]:
        """
        Get vehicles filtered by type.

        Args:
            vehicle_type: Vehicle type
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[Vehicle], int]: Vehicles and count
        """
        return self.filter(
            skip=skip,
            limit=limit,
            vehicle_type=vehicle_type,
        )

    def get_vehicles_by_fuel_type(
        self,
        fuel_type: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Vehicle], int]:
        """
        Get vehicles filtered by fuel type.

        Args:
            fuel_type: Fuel type
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[Vehicle], int]: Vehicles and count
        """
        return self.filter(
            skip=skip,
            limit=limit,
            fuel_type=fuel_type,
        )

    def search_vehicles(
        self,
        query_str: str,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[Vehicle], int]:
        """
        Search vehicles by registration number and model.

        Args:
            query_str: Search string
            skip: Number to skip
            limit: Max records

        Returns:
            Tuple[List[Vehicle], int]: Vehicles and count
        """
        return self.search(
            search_fields=["registration_number", "model"],
            query_str=query_str,
            skip=skip,
            limit=limit,
        )

    # ===== USAGE STATISTICS =====

    def get_total_mileage(self, vehicle_id: str) -> float:
        """
        Get total mileage from usage logs.

        Args:
            vehicle_id: Vehicle ID

        Returns:
            float: Total mileage
        """
        result = self.db.query(func.sum(VehicleUsageLog.distance)).filter(
            VehicleUsageLog.vehicle_id == vehicle_id
        ).scalar()
        return float(result or 0)

    def get_total_fuel_consumption(self, vehicle_id: str) -> float:
        """
        Get total fuel consumed from usage logs.

        Args:
            vehicle_id: Vehicle ID

        Returns:
            float: Total fuel consumed
        """
        result = self.db.query(func.sum(VehicleUsageLog.fuel_used)).filter(
            VehicleUsageLog.vehicle_id == vehicle_id
        ).scalar()
        return float(result or 0)

    def get_efficiency(self, vehicle_id: str) -> float:
        """
        Calculate fuel efficiency (km per liter).

        Args:
            vehicle_id: Vehicle ID

        Returns:
            float: Fuel efficiency (km/L)
        """
        total_distance = self.get_total_mileage(vehicle_id)
        total_fuel = self.get_total_fuel_consumption(vehicle_id)

        if total_fuel == 0:
            return 0

        return total_distance / total_fuel

    def get_usage_this_month(self, vehicle_id: str) -> dict:
        """
        Get vehicle usage statistics for current month.

        Args:
            vehicle_id: Vehicle ID

        Returns:
            dict: Usage stats with distance, fuel, trips
        """
        from sqlalchemy import and_

        now = datetime.utcnow()
        first_day = now.replace(day=1)
        last_day = (first_day + timedelta(days=32)).replace(day=1) - timedelta(days=1)

        query = self.db.query(VehicleUsageLog).filter(
            and_(
                VehicleUsageLog.vehicle_id == vehicle_id,
                VehicleUsageLog.date >= first_day,
                VehicleUsageLog.date <= last_day,
            )
        )

        total_distance = self.db.query(func.sum(VehicleUsageLog.distance)).filter(
            and_(
                VehicleUsageLog.vehicle_id == vehicle_id,
                VehicleUsageLog.date >= first_day,
                VehicleUsageLog.date <= last_day,
            )
        ).scalar() or 0

        total_fuel = self.db.query(func.sum(VehicleUsageLog.fuel_used)).filter(
            and_(
                VehicleUsageLog.vehicle_id == vehicle_id,
                VehicleUsageLog.date >= first_day,
                VehicleUsageLog.date <= last_day,
            )
        ).scalar() or 0

        return {
            "trips": query.count(),
            "distance": float(total_distance),
            "fuel": float(total_fuel),
            "efficiency": float(total_distance / total_fuel) if total_fuel > 0 else 0,
        }
