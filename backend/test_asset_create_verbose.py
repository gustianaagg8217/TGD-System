"""Verbose asset creation test with detailed error handling"""
import requests
import json
from datetime import datetime

BASE_URL = 'http://localhost:8000/api/v1'

def test_asset_creation():
    print("\n" + "="*70)
    print("🧪 VERBOSE ASSET CREATION TEST")
    print("="*70)
    
    # Step 1: Login
    print("\n[1️⃣  LOGIN]")
    login_data = {'username': 'admin', 'password': 'admin@123456'}
    print(f"📤 Sending: {login_data}")
    
    auth_resp = requests.post(f'{BASE_URL}/auth/login', json=login_data, timeout=5)
    print(f"📥 Status: {auth_resp.status_code}")
    print(f"📥 Response: {json.dumps(auth_resp.json(), indent=2)}")
    
    if auth_resp.status_code != 200:
        print("❌ LOGIN FAILED!")
        return
    
    token = auth_resp.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    print(f"✅ Token obtained: {token[:20]}...")
    
    # Step 2: Create asset
    print("\n[2️⃣  CREATE ASSET]")
    asset_data = {
        "name": f"Test Asset {datetime.now().strftime('%H:%M:%S')}",
        "type": "Mining Equipment",
        "location": "Block Test",
        "status": "active",
        "acquisition_date": "2026-04-25T00:00:00",
        "value": 5000000,
        "asset_metadata": {
            "manufacturer": "TestCorp",
            "notes": "Test asset for debugging"
        }
    }
    
    print(f"📤 Sending asset data:")
    print(json.dumps(asset_data, indent=2))
    
    resp = requests.post(
        f'{BASE_URL}/assets',
        json=asset_data,
        headers=headers,
        timeout=5
    )
    
    print(f"\n📥 Status: {resp.status_code}")
    print(f"📥 Response:")
    print(json.dumps(resp.json(), indent=2))
    
    if resp.status_code == 201:
        print("\n✅ ASSET CREATED SUCCESSFULLY!")
        created_asset = resp.json()
        print(f"   Asset ID: {created_asset['id']}")
        print(f"   Name: {created_asset['name']}")
        return created_asset
    else:
        print(f"\n❌ FAILED TO CREATE ASSET")
        print(f"   Status Code: {resp.status_code}")
        if 'detail' in resp.json():
            print(f"   Detail: {resp.json()['detail']}")
        return None

    # Step 3: Verify asset was saved
    print("\n[3️⃣  VERIFY ASSET IN DATABASE]")
    verify_resp = requests.get(
        f'{BASE_URL}/assets',
        headers=headers,
        timeout=5
    )
    
    print(f"📥 Get assets status: {verify_resp.status_code}")
    assets = verify_resp.json()
    print(f"📥 Total assets: {assets['total']}")
    
    if assets['total'] > 0:
        latest = assets['items'][-1]
        print(f"✅ Latest asset in DB: {latest['name']} (ID: {latest['id']})")
    else:
        print("❌ No assets found in database")

if __name__ == '__main__':
    test_asset_creation()
