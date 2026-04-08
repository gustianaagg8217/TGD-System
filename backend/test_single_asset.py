"""Debug single asset stream connection"""
import asyncio
import websockets
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
    print(f"[OK] Got token: {token[:20]}...")
    
    print("[2] Getting asset list...")
    headers = {'Authorization': f'Bearer {token}'}
    resp = requests.get(
        'http://127.0.0.1:8000/api/v1/assets',
        headers=headers,
        timeout=5
    )
    assets = resp.json().get('items', [])
    asset_id = assets[0]['id']
    print(f"[OK] Got asset ID: {asset_id}")
    
    print(f"[3] Connecting to WebSocket for asset {asset_id}...")
    uri = f"ws://127.0.0.1:8000/ws/sensors/{asset_id}"
    
    try:
        async with websockets.connect(uri, ping_interval=None) as ws:
            print("[OK] Connected!")
            msg = await ws.recv()
            print(f"[OK] Received: {msg}")
    except Exception as e:
        print(f"[ERROR] {type(e).__name__}: {e}")

if __name__ == "__main__":
    asyncio.run(test())
