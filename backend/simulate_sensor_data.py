"""
Sensor Data Simulator for WebSocket Testing

Simulates real-time sensor data generation and ingestion.
Used for testing WebSocket real-time streaming functionality.

Usage:
    python simulate_sensor_data.py
"""

import asyncio
import requests
import random
from datetime import datetime, timezone
from uuid import uuid4
import json
import time

# Backend API configuration
API_URL = "http://localhost:8000/api/v1/sensors"
AUTH_URL = "http://localhost:8000/api/v1/auth/login"

# Global token storage
AUTH_TOKEN = None
TOKEN_EXPIRATION = 0

# Sample sensor configuration (match your assets in database)
SENSORS = [
    {
        "asset_id": None,  # Will be populated with actual asset ID
        "sensor_id": "VIBR-001",
        "sensor_type": "vibration",
        "unit": "g",
        "min_value": 0.5,
        "max_value": 3.0,
        "normal_range": (1.0, 2.0),
        "threshold_low": 0.5,
        "threshold_high": 3.0,
    },
    {
        "asset_id": None,
        "sensor_id": "TEMP-001",
        "sensor_type": "temperature",
        "unit": "°C",
        "min_value": 20.0,
        "max_value": 80.0,
        "normal_range": (40.0, 60.0),
        "threshold_low": 20.0,
        "threshold_high": 80.0,
    },
    {
        "asset_id": None,
        "sensor_id": "FUEL-001",
        "sensor_type": "fuel",
        "unit": "L/h",
        "min_value": 0.0,
        "max_value": 150.0,
        "normal_range": (80.0, 120.0),
        "threshold_low": 0.0,
        "threshold_high": 150.0,
    },
]


async def login() -> bool:
    """
    Login to backend and store authentication token.
    
    Returns:
        bool: True if login successful, False otherwise
    """
    global AUTH_TOKEN, TOKEN_EXPIRATION
    
    try:
        print("[LOCK] Authenticating with backend...")
        resp = requests.post(
            AUTH_URL,
            json={"username": "admin", "password": "admin@123456"},
            timeout=5
        )
        
        if resp.status_code == 200:
            data = resp.json()
            AUTH_TOKEN = data.get("access_token")
            TOKEN_EXPIRATION = time.time() + data.get("expires_in", 1800)
            print(f"[OK] Authenticated successfully (expires in {data.get('expires_in')} seconds)")
            return True
        else:
            print(f"[FAIL] Authentication failed: {resp.status_code}")
            print(f"  Response: {resp.json()}")
            return False
    except Exception as e:
        print(f"[ERROR] Authentication error: {str(e)}")
        return False


def get_headers() -> dict:
    """Get request headers with auth token."""
    headers = {"Content-Type": "application/json"}
    if AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {AUTH_TOKEN}"
    return headers


def get_sensor_value(sensor_type: str, normal_range: tuple) -> float:
    """
    Generate realistic sensor value with occasional anomalies.
    
    80% of time: normal range
    15% of time: slight deviation
    5% of time: critical value (anomaly)
    """
    rand = random.random()
    
    if rand < 0.80:
        # Normal operation
        return random.uniform(normal_range[0], normal_range[1])
    elif rand < 0.95:
        # Slight deviation (±10%)
        deviation = (normal_range[1] - normal_range[0]) * 0.1
        return random.uniform(
            normal_range[0] - deviation,
            normal_range[1] + deviation
        )
    else:
        # Anomaly (critical value)
        if random.choice([True, False]):
            return normal_range[1] * 1.1
        else:
            return normal_range[0] * 0.9


async def ingest_sensor_reading(sensor: dict, asset_id: str) -> bool:
    """
    Send sensor reading to backend API via POST /api/v1/sensors/ingest
    
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        value = get_sensor_value(sensor["sensor_type"], sensor["normal_range"])
        
        payload = {
            "asset_id": asset_id,
            "sensor_id": sensor["sensor_id"],
            "sensor_type": sensor["sensor_type"],
            "reading_value": round(value, 2),
            "reading_unit": sensor["unit"],
            "threshold_high": sensor["threshold_high"],
            "threshold_low": sensor["threshold_low"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        
        response = requests.post(
            f"{API_URL}/ingest",
            json=payload,
            headers=get_headers(),
            timeout=5
        )
        
        if response.status_code == 201:
            data = response.json()
            print(
                f"[OK] {sensor['sensor_id']:12} | "
                f"Value: {value:6.2f} {sensor['unit']:5} | "
                f"Status: {data.get('status', 'unknown'):10}"
            )
            return True
        else:
            print(f"[FAIL] {response.status_code} - {response.text}")
            return False
    
    except Exception as e:
        print(f"[ERROR] Ingesting {sensor['sensor_id']}: {str(e)}")
        return False


async def get_assets() -> list:
    """
    Fetch list of assets from backend.
    
    Returns:
        list: Asset data from API
    """
    try:
        response = requests.get(
            "http://localhost:8000/api/v1/assets",
            headers=get_headers(),
            timeout=5
        )
        if response.status_code == 200:
            return response.json().get("items", [])
    except Exception as e:
        print(f"Error fetching assets: {str(e)}")
    
    return []


async def simulate_continuous_stream(asset_id: str, duration_seconds: int = 60):
    """
    Simulate continuous sensor data stream for testing WebSocket.
    
    Args:
        asset_id: Asset ID to send data for
        duration_seconds: How long to stream (default 60 seconds)
    """
    
    print(f"\n{'='*70}")
    print(f"[START] Sensor simulation for {duration_seconds}s")
    print(f"{'='*70}")
    
    start_time = time.time()
    reading_count = 0
    
    try:
        while time.time() - start_time < duration_seconds:
            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Reading batch:")
            
            for sensor in SENSORS:
                sensor["asset_id"] = asset_id
                success = await ingest_sensor_reading(sensor, asset_id)
                if success:
                    reading_count += 1
            
            # Wait before next batch
            elapsed = time.time() - start_time
            remaining = duration_seconds - elapsed
            
            if remaining > 0:
                wait_time = min(3.0, remaining)  # Send every 3 seconds
                print(f"[WAIT] {wait_time:.1f}s before next batch...")
                await asyncio.sleep(wait_time)
    
    except KeyboardInterrupt:
        print("\n\n[WARN] Simulation interrupted by user")
    
    print(f"\n{'='*70}")
    print(f"[DONE] Simulation complete!")
    print(f"  Total readings sent: {reading_count}")
    print(f"  Duration: {time.time() - start_time:.1f}s")
    print(f"  Rate: {reading_count / (time.time() - start_time):.1f} readings/sec")
    print(f"{'='*70}")


async def bulk_historical_data(asset_id: str, num_readings: int = 100):
    """
    Import bulk historical sensor data for testing.
    
    Args:
        asset_id: Asset ID to import data for
        num_readings: Number of readings to generate
    """
    
    print(f"\n{'='*70}")
    print(f"[IMPORT] {num_readings} historical readings")
    print(f"{'='*70}")
    
    readings = []
    base_time = datetime.now(timezone.utc)
    
    # Generate readings with 1-minute intervals
    for i in range(num_readings):
        for sensor in SENSORS:
            timestamp = base_time.timestamp() - (num_readings - i) * 60
            timestamp_iso = datetime.fromtimestamp(timestamp, tz=timezone.utc).isoformat()
            
            value = get_sensor_value(sensor["sensor_type"], sensor["normal_range"])
            
            readings.append({
                "asset_id": asset_id,
                "sensor_id": sensor["sensor_id"],
                "sensor_type": sensor["sensor_type"],
                "reading_value": round(value, 2),
                "reading_unit": sensor["unit"],
                "threshold_high": sensor["threshold_high"],
                "threshold_low": sensor["threshold_low"],
                "timestamp": timestamp_iso,
            })
    
    # Send in batches
    batch_size = 100
    for i in range(0, len(readings), batch_size):
        batch = readings[i:i + batch_size]
        
        try:
            response = requests.post(
                f"{API_URL}/bulk",
                json={"readings": batch}
            )
            
            if response.status_code in [201, 202]:
                result = response.json()
                print(f"[OK] Batch {i // batch_size + 1}: {len(batch)} readings")
            else:
                print(f"[FAIL] Batch {i // batch_size + 1}: {response.status_code}")
        
        except Exception as e:
            print(f"[ERROR] Batch error: {str(e)}")


async def main():
    """Main entry point."""
    
    print("\n" + "="*70)
    print("TGd System - Sensor Data Simulator")
    print("="*70)
    print("\nMake sure:")
    print("  1. Backend server is running (localhost:8000)")
    print("  2. Database is seeded with assets")
    print("  3. WebSocket test client is ready to receive data")
    print("="*70)
    
    # Authenticate first
    if not await login():
        print("[FAIL] Failed to authenticate. Exiting.")
        return
    
    # Fetch available assets
    print("\nFetching assets from backend...")
    assets = await get_assets()
    
    if not assets:
        print("[FAIL] No assets found. Please seed the database first.")
        print("   Run: python seed_data.py")
        return
    
    print(f"[OK] Found {len(assets)} assets:")
    for i, asset in enumerate(assets, 1):
        print(f"  {i}. {asset.get('name', 'Unknown')} ({asset.get('id')})")
    
    # Select asset
    print(f"\nUsing first asset for simulation: {assets[0]['name']}")
    asset_id = assets[0]['id']
    
    # Run simulation
    print("\n[STREAM] Starting continuous sensor stream simulation...")
    print("   Open WebSocket connection to receive real-time updates")
    print("   Command: wscat -c ws://localhost:8000/ws/sensors/{asset_id}")
    print()
    
    await simulate_continuous_stream(asset_id, duration_seconds=120)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\n[WARN] Simulator interrupted")
    except Exception as e:
        print(f"\n[FATAL] Fatal error: {str(e)}")
