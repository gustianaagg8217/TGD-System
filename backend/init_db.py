#!/usr/bin/env python
"""
Initialize SQLite database for Phase 1 IoT testing
Clears old database and creates fresh schema with test assets
"""

import os
import sys
from datetime import datetime, timezone
from uuid import uuid4

# Remove old database file
db_path = "./tgd_system_phase1.db"
if os.path.exists(db_path):
    os.remove(db_path)
    print(f"[OK] Removed old database: {db_path}")

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Import ALL models to register them with Base
from app.models import (
    Asset, Document, MaintenanceLog, InventoryItem, Vehicle,
    SensorLog, SensorReading, SensorAlert, IoTDataSync
)
from app.models.user import User, Role
from app.models.vehicle import VehicleUsageLog

from app.db.base import Base

# Create fresh engine
engine = create_engine(f"sqlite:///{db_path}")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

print("\n[*] Creating database schema...")
Base.metadata.create_all(bind=engine)
print("[OK] Schema created")

# Create test assets
print("\n[*] Seeding test assets...")
db = SessionLocal()

try:
    # Test assets for Phase 1 testing
    test_assets = [
        Asset(
            id="EQP-001",
            name="Excavator Unit 1",
            type="excavator",
            location="Mine Site A",
            status="active",
            acquisition_date=datetime.now(timezone.utc),
            value=500000.00,
            asset_metadata={"serial_number": "EXC-2024-001"},
            created_by="system",
        ),
        Asset(
            id="EQP-002",
            name="Dozer Unit 1",
            type="dozer",
            location="Mine Site A",
            status="active",
            acquisition_date=datetime.now(timezone.utc),
            value=350000.00,
            asset_metadata={"serial_number": "DOZ-2024-001"},
            created_by="system",
        ),
        Asset(
            id="EQP-003",
            name="Haul Truck 1",
            type="haul_truck",
            location="Mine Site B",
            status="active",
            acquisition_date=datetime.now(timezone.utc),
            value=450000.00,
            asset_metadata={"serial_number": "HT-2024-001"},
            created_by="system",
        ),
        Asset(
            id="FAC-001",
            name="Processing Facility",
            type="facility",
            location="Ore Processing Plant",
            status="active",
            acquisition_date=datetime.now(timezone.utc),
            value=2000000.00,
            asset_metadata={"capacity_tph": 500},
            created_by="system",
        ),
    ]
    
    for asset in test_assets:
        db.add(asset)
    
    db.commit()
    print(f"[OK] Created {len(test_assets)} test assets")
    
    # Verify
    count = db.query(Asset).count()
    print(f"[OK] Database now contains {count} assets")
    
finally:
    db.close()

print("\n" + "=" * 60)
print("Database initialized successfully!")
print(f"Database: {db_path}")
print("=" * 60)
