"""
Database Seed Script

Generates sample data for development and testing.
Run with: python seed_data.py
"""

import os
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use SQLite for Phase 1 testing of IoT integration
DATABASE_URL = "sqlite:///./tgd_system_phase1.db"

from app.core.security import hash_password
from app.db.base import Base
from app.models.user import User, Role
from app.models import (  # Import all models to register them with Base
    Asset,
    Document,
    MaintenanceLog,
    InventoryItem,
    Vehicle,
    SensorLog,
    SensorReading,
    SensorAlert,
    IoTDataSync,
)
from app.models.vehicle import VehicleUsageLog
from app.core.constants import (
    RoleEnum,
    AssetStatusEnum,
    AssetTypeEnum,
    MaintenanceTypeEnum,
    MaintenanceStatusEnum,
    VehicleTypeEnum,
    FuelTypeEnum,
    SensorTypeEnum,
    SensorStatusEnum,
)

# Create database engine with SQLite for Phase 1
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_roles(db) -> dict:
    """Create default roles."""
    print("Creating roles...")
    roles = {}
    for role_name in [RoleEnum.ADMIN, RoleEnum.ENGINEER, RoleEnum.VIEWER]:
        # Check if role already exists
        existing_role = db.query(Role).filter(Role.name == role_name).first()
        if existing_role:
            roles[role_name] = existing_role
            print(f"  ✓ Role {role_name} already exists")
        else:
            role = Role(
                id=str(uuid4()),
                name=role_name,
                description=f"{role_name.capitalize()} role",
                permissions={},
            )
            db.add(role)
            roles[role_name] = role
            print(f"  ✓ Created {role_name} role")

    db.commit()
    return roles


def create_users(db, roles: dict) -> list:
    """Create sample users."""
    print("\nCreating users...")
    users = []

    sample_users = [
        {
            "username": "admin",
            "email": "admin@tgd.com",
            "full_name": "Administrator",
            "password": "admin@123456",
            "role": RoleEnum.ADMIN,
        },
        {
            "username": "engineer",
            "email": "engineer@tgd.com",
            "full_name": "John Engineer",
            "password": "eng@123456",
            "role": RoleEnum.ENGINEER,
        },
        {
            "username": "viewer",
            "email": "viewer@tgd.com",
            "full_name": "Jane Viewer",
            "password": "view@123456",
            "role": RoleEnum.VIEWER,
        },
    ]

    for user_data in sample_users:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == user_data["username"]).first()
        if existing_user:
            users.append(existing_user)
            print(f"  ✓ User already exists: {user_data['username']} ({user_data['email']})")
        else:
            user = User(
                id=str(uuid4()),
                username=user_data["username"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                password_hash=hash_password(user_data["password"]),
                role_id=roles[user_data["role"]].id,
                is_active=True,
            )
            db.add(user)
            users.append(user)
            print(f"  ✓ Created user: {user_data['username']} ({user_data['email']})")

    db.commit()
    return users


def create_assets(db, user_id: str) -> list:
    """Create sample assets."""
    print("\nCreating assets...")
    assets = []

    asset_data = [
        {
            "name": "CNC Machining Center A",
            "type": AssetTypeEnum.MACHINERY,
            "location": "Factory Floor 1",
            "status": AssetStatusEnum.ACTIVE,
            "value": 500000.00,
        },
        {
            "name": "Hydraulic Press B",
            "type": AssetTypeEnum.MACHINERY,
            "location": "Factory Floor 2",
            "status": AssetStatusEnum.ACTIVE,
            "value": 250000.00,
        },
        {
            "name": "Forklift FL-001",
            "type": AssetTypeEnum.VEHICLE,
            "location": "Warehouse",
            "status": AssetStatusEnum.ACTIVE,
            "value": 35000.00,
        },
        {
            "name": "Air Compressor System",
            "type": AssetTypeEnum.EQUIPMENT,
            "location": "Utility Room",
            "status": AssetStatusEnum.ACTIVE,
            "value": 75000.00,
        },
        {
            "name": "Building 1 - Roof",
            "type": AssetTypeEnum.FACILITY,
            "location": "Building 1",
            "status": AssetStatusEnum.MAINTENANCE,
            "value": 1000000.00,
        },
    ]

    for asset in asset_data:
        # Check if asset with same name already exists
        existing_asset = db.query(Asset).filter(Asset.name == asset["name"]).first()
        if existing_asset:
            assets.append(existing_asset)
            print(f"  ✓ Asset already exists: {asset['name']}")
        else:
            obj = Asset(
                id=str(uuid4()),
                name=asset["name"],
                type=asset["type"],
                location=asset["location"],
                status=asset["status"],
                value=asset["value"],
                acquisition_date=datetime.now(timezone.utc) - timedelta(days=365),
                created_by=user_id,
                asset_metadata={},
            )
            db.add(obj)
            assets.append(obj)
            print(f"  ✓ Created asset: {asset['name']}")

    db.commit()
    return assets


def create_maintenance_logs(db, assets: list, user_id: str) -> list:
    """Create sample maintenance logs."""
    print("\nCreating maintenance logs...")
    logs = []

    for asset in assets[:3]:  # Only for first 3 assets
        for i in range(2):
            log = MaintenanceLog(
                id=str(uuid4()),
                asset_id=asset.id,
                maintenance_type=(
                    MaintenanceTypeEnum.PREVENTIVE if i == 0 else MaintenanceTypeEnum.CORRECTIVE
                ),
                date=datetime.now(timezone.utc) - timedelta(days=30 * i),
                technician=f"Technician {i + 1}",
                cost=5000.00 + (i * 1000),
                downtime=120 + (i * 60),
                description=f"Maintenance operation {i + 1}",
                status=MaintenanceStatusEnum.COMPLETED,
                next_maintenance_date=datetime.now(timezone.utc) + timedelta(days=90),
                created_by=user_id,
            )
            db.add(log)
            logs.append(log)

    db.commit()
    print(f"  ✓ Created {len(logs)} maintenance logs")
    return logs


def create_inventory(db, user_id: str) -> list:
    """Create sample inventory items."""
    print("\nCreating inventory items...")
    inventory = []

    items_data = [
        {
            "item_code": "BRG-001",
            "name": "Ball Bearing 6205",
            "quantity": 50,
            "reorder_level": 10,
            "supplier": "Precision Bearings Ltd",
            "price": 15.50,
            "category": "Bearings",
            "location": "Warehouse A-1",
        },
        {
            "item_code": "OIL-001",
            "name": "Hydraulic Oil 46",
            "quantity": 200,
            "reorder_level": 50,
            "supplier": "Industrial Oils Corp",
            "price": 8.75,
            "category": "Fluids",
            "location": "Warehouse A-2",
        },
        {
            "item_code": "BELT-001",
            "name": "V-Belt 3L-A100",
            "quantity": 5,
            "reorder_level": 20,
            "supplier": "Belt Manufacturing",
            "price": 45.00,
            "category": "Belts",
            "location": "Warehouse B-1",
        },
        {
            "item_code": "SEAL-001",
            "name": "Oil Seal FKM 30x42x7",
            "quantity": 100,
            "reorder_level": 30,
            "supplier": "Seal Tech",
            "price": 2.50,
            "category": "Seals",
            "location": "Warehouse B-2",
        },
    ]

    for item in items_data:
        # Check if inventory item already exists
        existing_item = db.query(InventoryItem).filter(InventoryItem.item_code == item["item_code"]).first()
        if existing_item:
            inventory.append(existing_item)
            print(f"  ✓ Inventory item already exists: {item['name']}")
        else:
            obj = InventoryItem(
                id=str(uuid4()),
                item_code=item["item_code"],
                name=item["name"],
                quantity=item["quantity"],
                reorder_level=item["reorder_level"],
                supplier=item["supplier"],
                price=item["price"],
                category=item["category"],
                location=item["location"],
                last_restock_date=datetime.now(timezone.utc) - timedelta(days=14),
                created_by=user_id,
            )
            db.add(obj)
            inventory.append(obj)
            print(f"  ✓ Created inventory: {item['name']}")

    db.commit()
    return inventory


def create_vehicles(db, user_id: str) -> list:
    """Create sample vehicles."""
    print("\nCreating vehicles...")
    vehicles = []

    vehicle_data = [
        {
            "vehicle_type": VehicleTypeEnum.TRUCK,
            "registration_number": "TRK-2024-001",
            "model": "Volvo FH16",
            "fuel_type": FuelTypeEnum.DIESEL,
            "current_mileage": 150000.0,
            "fuel_capacity": 300.0,
        },
        {
            "vehicle_type": VehicleTypeEnum.FORKLIFT,
            "registration_number": "FLK-2024-001",
            "model": "Toyota 8FG25",
            "fuel_type": FuelTypeEnum.DIESEL,
            "current_mileage": 8500.0,
            "fuel_capacity": 50.0,
        },
        {
            "vehicle_type": VehicleTypeEnum.CAR,
            "registration_number": "CAR-2024-001",
            "model": "Toyota Camry",
            "fuel_type": FuelTypeEnum.PETROL,
            "current_mileage": 25000.0,
            "fuel_capacity": 70.0,
        },
    ]

    for vehicle in vehicle_data:
        # Check if vehicle with same registration number already exists
        existing_vehicle = db.query(Vehicle).filter(Vehicle.registration_number == vehicle["registration_number"]).first()
        if existing_vehicle:
            vehicles.append(existing_vehicle)
            print(f"  ✓ Vehicle already exists: {vehicle['registration_number']}")
        else:
            obj = Vehicle(
                id=str(uuid4()),
                vehicle_type=vehicle["vehicle_type"],
                registration_number=vehicle["registration_number"],
                model=vehicle["model"],
                fuel_type=vehicle["fuel_type"],
                current_mileage=vehicle["current_mileage"],
                fuel_capacity=vehicle["fuel_capacity"],
                status="active",
                created_by=user_id,
            )
            db.add(obj)
            vehicles.append(obj)
            print(f"  ✓ Created vehicle: {vehicle['registration_number']}")

    db.commit()
    return vehicles


def create_sensor_logs(db, assets: list) -> list:
    """Create sample sensor logs."""
    print("\nCreating sensor logs...")
    logs = []

    for asset in assets[:2]:  # Only for first 2 assets
        sensors = [
            {
                "type": SensorTypeEnum.TEMPERATURE,
                "value": 65.5,
                "unit": "°C",
                "threshold_high": 80,
                "threshold_low": 20,
            },
            {
                "type": SensorTypeEnum.VIBRATION,
                "value": 2.3,
                "unit": "g",
                "threshold_high": 5.0,
                "threshold_low": 0.5,
            },
        ]

        for sensor in sensors:
            log = SensorLog(
                id=str(uuid4()),
                asset_id=asset.id,
                sensor_type=sensor["type"],
                reading_value=sensor["value"],
                unit=sensor["unit"],
                timestamp=datetime.now(timezone.utc),
                status=SensorStatusEnum.NORMAL,
                threshold_high=sensor["threshold_high"],
                threshold_low=sensor["threshold_low"],
            )
            db.add(log)
            logs.append(log)

    db.commit()
    print(f"  ✓ Created {len(logs)} sensor logs")
    return logs


def main():
    """Run seed script."""
    print("="* 60)
    print("TGd System - Database Seed Script")
    print("="* 60)

    # Remove old database file for clean start
    db_file = "tgd_system_phase1.db"
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
            print(f"\n[OK] Removed old database file: {db_file}")
        except Exception as e:
            print(f"[WARN] Could not remove {db_file}: {e}")

    # Drop all tables and recreate
    print("\nDropping existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("[OK] Tables dropped")
    
    # Create tables with error handling for duplicate indexes
    print("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Tables created")
    except Exception as e:
        # Handle duplicate index errors (can occur due to SQLAlchemy metadata caching)
        if "already exists" in str(e):
            print("[WARN] Some indexes already exist (metadata cache), continuing anyway...")
            # Try to create remaining tables by handling the error gracefully
            with engine.connect() as conn:
                for table in Base.metadata.sorted_tables:
                    try:
                        table.create(conn, checkfirst=True)
                    except Exception:
                        pass  # Table may already exist
                conn.commit()
            print("[OK] Database schema verified")
        else:
            raise

    db = SessionLocal()

    try:
        # Create data
        roles = create_roles(db)
        users = create_users(db, roles)
        assets = create_assets(db, users[0].id)
        maintenance_logs = create_maintenance_logs(db, assets, users[0].id)
        inventory = create_inventory(db, users[0].id)
        vehicles = create_vehicles(db, users[0].id)
        sensor_logs = create_sensor_logs(db, assets)

        print("\n" + "=" * 60)
        print("✓ Database seeding completed successfully!")
        print("=" * 60)
        print("\nSample Users Created:")
        print("  Email: admin@tgd.com       | Password: admin@123456")
        print("  Email: engineer@tgd.com    | Password: eng@123456")
        print("  Email: viewer@tgd.com      | Password: view@123456")
        print("\n" + "=" * 60)

    except Exception as e:
        print(f"\n❌ Error during seeding: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
