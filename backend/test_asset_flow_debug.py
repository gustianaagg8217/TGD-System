"""Debug test - check full asset flow with detailed output"""
import requests
import json
from datetime import datetime

BASE_URL = 'http://localhost:8000/api/v1'

def test_asset_flow():
    print("\n" + "="*80)
    print("🔍 COMPLETE ASSET FLOW DEBUG TEST")
    print("="*80)
    
    # Login
    print("\n[1] LOGIN")
    auth = requests.post(f'{BASE_URL}/auth/login', 
        json={'username': 'admin', 'password': 'admin@123456'})
    if auth.status_code != 200:
        print(f"❌ Login failed: {auth.status_code}")
        return
    token = auth.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    print(f"✅ Logged in")
    
    # Get initial assets
    print("\n[2] GET INITIAL ASSETS")
    resp = requests.get(f'{BASE_URL}/assets', headers=headers)
    print(f"Status: {resp.status_code}")
    initial_data = resp.json()
    
    print(f"Response keys: {list(initial_data.keys())}")
    print(f"Total: {initial_data.get('total')}")
    print(f"Items count: {len(initial_data.get('items', []))}")
    
    initial_count = initial_data.get('total', 0)
    print(f"✅ Initial asset count: {initial_count}")
    
    # Show first 3 asset types
    print(f"\nFirst 3 asset types:")
    for i, asset in enumerate(initial_data.get('items', [])[:3]):
        print(f"  {i+1}. name='{asset.get('name')}', type='{asset.get('type')}'")
    
    # Create new asset
    print("\n[3] CREATE NEW ASSET")
    new_asset = {
        "name": f"Debug Test Asset {datetime.now().strftime('%H:%M:%S')}",
        "type": "machinery",  # Use simple type like API returns
        "location": "Test Location",
        "status": "active",
        "acquisition_date": "2026-04-25T00:00:00",
        "value": 1500000,
    }
    print(f"Creating: {json.dumps(new_asset, indent=2)}")
    
    create_resp = requests.post(f'{BASE_URL}/assets', 
        json=new_asset, headers=headers)
    print(f"Status: {create_resp.status_code}")
    
    if create_resp.status_code != 201:
        print(f"❌ Create failed!")
        print(f"Response: {create_resp.json()}")
        return
    
    created_asset = create_resp.json()
    asset_id = created_asset['id']
    print(f"✅ Asset created: {asset_id}")
    print(f"Response keys: {list(created_asset.keys())}")
    
    # Get updated assets
    print("\n[4] GET UPDATED ASSETS")
    resp2 = requests.get(f'{BASE_URL}/assets', headers=headers)
    updated_data = resp2.json()
    updated_count = updated_data.get('total', 0)
    
    print(f"Updated total: {updated_count}")
    print(f"Previous total: {initial_count}")
    print(f"Difference: {updated_count - initial_count}")
    
    if updated_count > initial_count:
        print(f"✅ NEW ASSET VISIBLE IN API!")
    else:
        print(f"❌ NEW ASSET NOT VISIBLE!")
    
    # Find our created asset
    print("\n[5] VERIFY ASSET IN LIST")
    found = False
    for asset in updated_data.get('items', []):
        if asset['id'] == asset_id:
            found = True
            print(f"✅ Found created asset in list!")
            print(f"   Name: {asset['name']}")
            print(f"   Type: {asset['type']}")
            print(f"   Value: {asset['value']}")
            break
    
    if not found:
        print(f"❌ Created asset NOT found in list!")
        print(f"First 5 items in response:")
        for i, asset in enumerate(updated_data.get('items', [])[:5]):
            print(f"  {i+1}. {asset['id']}: {asset['name']}")
    
    # Test categorization logic
    print("\n[6] TEST CATEGORIZATION")
    all_items = updated_data.get('items', [])
    types = {}
    for asset in all_items:
        t = asset.get('type', 'unknown')
        types[t] = types.get(t, 0) + 1
    
    print(f"Asset types found: {types}")
    print(f"Total unique types: {len(types)}")
    
    print("\n" + "="*80)
    if found and updated_count > initial_count:
        print("✅ TEST PASSED - Asset creation and retrieval working!")
    else:
        print("❌ TEST FAILED - Issue with asset flow")
    print("="*80)

if __name__ == '__main__':
    test_asset_flow()
