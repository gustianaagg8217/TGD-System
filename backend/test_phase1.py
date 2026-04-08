#!/usr/bin/env python
"""
Phase 1 IoT Endpoint Testing
Quick automated tests for sensor ingestion endpoints
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000/api/v1/sensors"

def test_single_ingest():
    """Test single sensor reading ingest"""
    print("\n📤 TEST 1: Single Sensor Ingest")
    print("-" * 60)
    
    from datetime import datetime, timezone
    
    payload = {
        "asset_id": "EQP-001",
        "sensor_id": "VIBR-EQP-001",
        "sensor_type": "vibration",
        "reading_value": 4.2,
        "reading_unit": "mm/s",
        "x_axis": -0.95,
        "y_axis": 0.31,
        "z_axis": -0.07,
        "threshold_high": 10.0,
        "threshold_low": 0.5,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/ingest",
            json=payload,
            timeout=5
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Ingested sensor reading ID: {data.get('id')}")
            print(f"   Asset: {data.get('asset_id')}")
            print(f"   Status: {data.get('status')}")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def test_query_data():
    """Test querying sensor data"""
    print("\n📊 TEST 2: Query Sensor Data")
    print("-" * 60)
    
    params = {
        "asset_id": "EQP-001",
        "limit": 10
    }
    
    try:
        response = requests.get(
            f"{BASE_URL}/data",
            params=params,
            timeout=5
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Retrieved {len(data)} readings for EQP-001")
            if data:
                print(f"   Latest: {data[0].get('reading_value')} {data[0].get('reading_unit')}")
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Request failed: {e}")
        return False

def test_health_check():
    """Test server health endpoint"""
    print("\n❤️  TEST 0: Health Check")
    print("-" * 60)
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Server healthy: {data.get('service')} v{data.get('version')}")
            return True
        else:
            print(f"❌ Server error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Server not responding: {e}")
        return False

def main():
    print("=" * 60)
    print("🚀 Phase 1 IoT Integration - Quick Test Suite")
    print("=" * 60)
    
    results = []
    
    # Test in order
    results.append(("Health Check", test_health_check()))
    results.append(("Single Ingest", test_single_ingest()))
    results.append(("Query Data", test_query_data()))
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 Test Summary")
    print("=" * 60)
    passed = sum(1 for _, r in results if r)
    total = len(results)
    
    for name, passed_test in results:
        status = "✅ PASS" if passed_test else "❌ FAIL"
        print(f"{status}: {name}")
    
    print(f"\nTotal: {passed}/{total} passed")
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
