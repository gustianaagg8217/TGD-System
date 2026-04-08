"""
WebSocket Test Client with Real Asset IDs

Fetches actual assets from database and tests WebSocket connectivity.
Usage: python test_websocket_client.py
"""

import asyncio
import websockets
import json
from datetime import datetime, timezone
import requests


def get_token():
    """Get auth token for API requests"""
    try:
        resp = requests.post(
            'http://127.0.0.1:8000/api/v1/auth/login',
            json={'username': 'admin', 'password': 'admin@123456'},
            timeout=5
        )
        if resp.status_code == 200:
            return resp.json()['access_token']
    except Exception as e:
        print(f"[ERROR] Failed to get token: {e}")
    return None


def get_assets():
    """Fetch asset IDs from backend"""
    try:
        token = get_token()
        if not token:
            print("[ERROR] Could not authenticate")
            return []
        
        headers = {'Authorization': f'Bearer {token}'}
        resp = requests.get(
            'http://127.0.0.1:8000/api/v1/assets',
            headers=headers,
            timeout=5
        )
        
        if resp.status_code == 200:
            items = resp.json().get('items', [])
            return [(item['name'], item['id']) for item in items]
    except Exception as e:
        print(f"[ERROR] Failed to fetch assets: {e}")
    
    return []


async def test_single_asset_stream(asset_id, asset_name):
    """Test single asset sensor stream."""
    print(f"\n[TEST] Single Asset Stream: {asset_name}")
    print("=" * 60)
    
    try:
        # Connect to WebSocket
        async with websockets.connect(f"ws://127.0.0.1:8000/ws/sensors/{asset_id}") as websocket:
            print(f"[OK] Connected to WebSocket for asset: {asset_name}")
            
            # Receive subscription confirmation
            message = await asyncio.wait_for(websocket.recv(), timeout=5)
            data = json.loads(message)
            print(f"[MSG] {data.get('message', 'Connected')}")
            
            # Send ping message
            await websocket.send(json.dumps({"type": "ping"}))
            
            # Receive pong
            message = await asyncio.wait_for(websocket.recv(), timeout=5)
            data = json.loads(message)
            print(f"[PONG] Received pong")
            
            # Request stats
            await websocket.send(json.dumps({"type": "get_stats"}))
            message = await asyncio.wait_for(websocket.recv(), timeout=5)
            data = json.loads(message)
            print(f"[STATS] {data.get('data', {})}")
            
            print("[OK] Single asset stream test PASSED!")
            return True
    
    except asyncio.TimeoutError:
        print("[ERROR] Timeout waiting for message")
    except ConnectionRefusedError:
        print("[ERROR] Could not connect to WebSocket server!")
    except Exception as e:
        print(f"[ERROR] {str(e)}")
    
    return False


async def test_multi_asset_stream(asset_ids):
    """Test multi-asset sensor stream."""
    print(f"\n[TEST] Multi-Asset Stream ({len(asset_ids)} assets)")
    print("=" * 60)
    
    if not asset_ids:
        print("[SKIP] No assets available")
        return False
    
    try:
        async with websockets.connect("ws://127.0.0.1:8000/ws/sensors/multi") as websocket:
            print("[OK] Connected to multi-asset stream")
            
            # Receive connection message
            message = await asyncio.wait_for(websocket.recv(), timeout=5)
            data = json.loads(message)
            print(f"[MSG] {data.get('message', 'Connected')}")
            
            # Subscribe to multiple assets
            await websocket.send(json.dumps({
                "type": "subscribe",
                "asset_ids": asset_ids
            }))
            
            # Receive subscription confirmation
            message = await asyncio.wait_for(websocket.recv(), timeout=5)
            data = json.loads(message)
            count = data.get('count', len(asset_ids))
            print(f"[OK] Subscribed to {count} assets")
            
            # Send ping
            await websocket.send(json.dumps({"type": "ping"}))
            message = await asyncio.wait_for(websocket.recv(), timeout=5)
            print(f"[PONG] Pong received")
            
            # Unsubscribe from one asset if more than one
            if len(asset_ids) > 1:
                await websocket.send(json.dumps({
                    "type": "unsubscribe",
                    "asset_id": asset_ids[0]
                }))
                message = await asyncio.wait_for(websocket.recv(), timeout=5)
                remaining = len(asset_ids) - 1
                print(f"[OK] Unsubscribed, remaining: {remaining}")
            
            print("[OK] Multi-asset stream test PASSED!")
            return True
    
    except asyncio.TimeoutError:
        print("[ERROR] Timeout waiting for message")
    except ConnectionRefusedError:
        print("[ERROR] Could not connect to WebSocket server!")
    except Exception as e:
        print(f"[ERROR] {str(e)}")
    
    return False


async def test_websocket_performance(asset_id):
    """Test WebSocket client performance."""
    print(f"\n[TEST] WebSocket Performance Test")
    print("=" * 60)
    
    try:
        async with websockets.connect(f"ws://127.0.0.1:8000/ws/sensors/{asset_id}") as websocket:
            # Receive subscription confirmation
            await asyncio.wait_for(websocket.recv(), timeout=5)
            
            print("[START] Testing 10 ping/pong exchanges...")
            
            # Send multiple ping messages and measure response time
            times = []
            for i in range(10):
                start = datetime.now(timezone.utc)
                await websocket.send(json.dumps({"type": "ping"}))
                await asyncio.wait_for(websocket.recv(), timeout=5)
                elapsed = (datetime.now(timezone.utc) - start).total_seconds() * 1000
                times.append(elapsed)
                print(f"  [{i+1}/10] {elapsed:.2f}ms")
            
            avg_time = sum(times) / len(times)
            print(f"[OK] Average: {avg_time:.2f}ms")
            print("[OK] Performance test PASSED!")
            return True
    
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        return False


async def main():
    """Run all tests."""
    print("\n" + "=" * 70)
    print("TGd System - WebSocket Test Suite")
    print("=" * 70)
    
    # Fetch actual assets from database
    assets = get_assets()
    
    if not assets:
        print("\n[ERROR] Could not fetch assets from backend!")
        print("Make sure backend is running and database is seeded.")
        return
    
    print(f"\n[INFO] Found {len(assets)} assets in database:")
    for name, asset_id in assets:
        print(f"  - {name}")
    
    # Run tests
    results = []
    
    # Test 1: Single asset stream
    if assets:
        asset_name, asset_id = assets[0]
        result = await test_single_asset_stream(asset_id, asset_name)
        results.append(("Single Asset Stream", result))
    
    # Test 2: Multi-asset stream
    if assets:
        asset_ids = [a[1] for a in assets[:3]]  # First 3 assets
        result = await test_multi_asset_stream(asset_ids)
        results.append(("Multi-Asset Stream", result))
    
    # Test 3: Performance test
    if assets:
        _, asset_id = assets[0]
        result = await test_websocket_performance(asset_id)
        results.append(("Performance Test", result))
    
    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    
    for test_name, result in results:
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status} {test_name}")
    
    passed = sum(1 for _, r in results if r)
    total = len(results)
    print(f"\nTotal: {passed}/{total} tests passed")
    print("=" * 70)


if __name__ == "__main__":
    print("\n[INIT] WebSocket Test Client")
    print("[INFO] Make sure backend is running on localhost:8000")
    print("[INFO] Install websockets: pip install websockets\n")
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[CANCEL] Tests interrupted by user")
    except Exception as e:
        print(f"\n[FATAL] {str(e)}")
