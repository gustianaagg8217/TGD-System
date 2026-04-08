"""
Vehicle Model and Usage Log

SQLAlchemy ORM models for vehicle tracking and usage logging.
"""

from sqlalchemy import String, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone

from app.db.base import TimeStampedModel
from app.core.constants import VehicleTypeEnum, FuelTypeEnum, VehicleStatusEnum


class Vehicle(TimeStampedModel):
    """
    Vehicle model for fleet management.

    Attributes:
        id: Unique vehicle identifier
        vehicle_type: Type of vehicle (truck, car, forklift, etc.)
        registration_number: Unique vehicle registration number
        model: Vehicle model/make
        fuel_type: Type of fuel (diesel, petrol, electric, etc.)
        current_mileage: Current mileage
        fuel_capacity: Fuel tank capacity
        status: Vehicle status (active, idle, maintenance, retired)
        created_by: User ID who created this vehicle
        usage_logs: Relationship to usage logs
    """

    __tablename__ = "vehicles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    vehicle_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    registration_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
        index=True,
    )
    model: Mapped[str] = mapped_column(String(255), nullable=True)
    fuel_type: Mapped[str] = mapped_column(String(50), nullable=True)
    current_mileage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    fuel_capacity: Mapped[float] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50),
        default=VehicleStatusEnum.ACTIVE,
        index=True,
    )
    created_by: Mapped[str] = mapped_column(String(36), nullable=True)

    # Relationships
    usage_logs: Mapped[list["VehicleUsageLog"]] = relationship(
        "VehicleUsageLog",
        back_populates="vehicle",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Vehicle(id={self.id}, registration={self.registration_number})>"


class VehicleUsageLog(TimeStampedModel):
    """
    Vehicle Usage Log model for tracking vehicle usage.

    Attributes:
        id: Unique usage log identifier
        vehicle_id: Foreign key to vehicle
        date: Date of usage
        fuel_used: Fuel consumed
        distance: Distance traveled
        driver: Driver name
        trip_purpose: Purpose of trip
        vehicle: Relationship to Vehicle model
    """

    __tablename__ = "vehicle_usage_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    vehicle_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("vehicles.id"),
        nullable=False,
        index=True,
    )
    date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    fuel_used: Mapped[float] = mapped_column(Float, nullable=True)
    distance: Mapped[float] = mapped_column(Float, nullable=True)
    driver: Mapped[str] = mapped_column(String(255), nullable=True)
    trip_purpose: Mapped[str] = mapped_column(String(255), nullable=True)

    # Relationships
    vehicle: Mapped["Vehicle"] = relationship("Vehicle", back_populates="usage_logs")

    def __repr__(self) -> str:
        return f"<VehicleUsageLog(id={self.id}, vehicle_id={self.vehicle_id}, date={self.date})>"
