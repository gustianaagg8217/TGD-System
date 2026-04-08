"""Debug multi-asset stream issue"""
import asyncio
import websockets
import json
import requests

async def test():
    # Get a real asset ID
    print("[1] Getting auth token...")
    resp = requests.post(
        'http://127.0.0.1:8000/api/v1/auth/login',
        json={'username': 'admin', 'password': 'admin@123456'},
        timeout=5
    )
    token = resp.json()['access_token']
    
    print("[2] Getting asset list...")
    headers = {'Authorization': f'Bearer {token}'}
    resp = requests.get(
        'http://127.0.0.1:8000/api/v1/assets',
        headers=headers,
        timeout=5
    )
    assets = resp.json().get('items', [])
    asset_ids = [a['id'] for a in assets[:3]]
    print(f"[OK] Got {len(asset_ids)} asset IDs: {asset_ids[:2]}...")
    
    print(f"[3] Connecting to multi-asset stream...")
    
    try:
        async with websockets.connect("ws://127.0.0.1:8000/ws/sensors/multi", ping_interval=None) as ws:
            print("[OK] Connected!")
            
            # Receive connection message
            msg = await ws.recv()
            data = json.loads(msg)
            print(f"[OK] Connection message: {data.get('message')}")
            
            # Subscribe to assets
            print(f"[SEND] Subscribing to {len(asset_ids)} assets...")
            await ws.send(json.dumps({
                "type": "subscribe",
                "asset_ids": asset_ids
            }))
            
            # Wait for subscription confirmation
            msg = await ws.recv()
            data = json.loads(msg)
            print(f"[OK] Subscription response: {data}")
            
    except Exception as e:
        print(f"[ERROR] {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test())
