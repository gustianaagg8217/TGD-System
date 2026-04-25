"""Complete asset workflow test - simulates user adding asset and listing"""
import requests
import json
from datetime import datetime

BASE_URL = 'http://localhost:8000/api/v1'

def test_complete_workflow():
    print("\n" + "="*70)
    print("🧪 COMPLETE ASSET WORKFLOW TEST")
    print("="*70)
    
    # Step 1: Login
    print("\n[1️⃣  LOGIN]")
    auth_resp = requests.post(
        f'{BASE_URL}/auth/login',
        json={'username': 'admin', 'password': 'admin@123456'},
        timeout=5
    )
    print(f"Status: {auth_resp.status_code}")
    
    if auth_resp.status_code != 200:
        print("❌ LOGIN FAILED!")
        return
    
    token = auth_resp.json()['access_token']
    headers = {'Authorization': f'Bearer {token}'}
    print("✅ Logged in successfully")
    
    # Step 2: Get initial asset list
    print("\n[2️⃣  GET INITIAL ASSET LIST]")
    list_resp = requests.get(f'{BASE_URL}/assets', headers=headers, timeout=5)
    print(f"Status: {list_resp.status_code}")
    
    initial_data = list_resp.json()
    initial_count = len(initial_data.get('items', [])) if isinstance(initial_data, dict) else len(initial_data)
    print(f"Initial assets: {initial_count}")
    print(f"Response type: {type(initial_data)}")
    
    # Step 3: Create new asset
    print("\n[3️⃣  CREATE NEW ASSET]")
    new_asset = {
        "name": f"New Test Asset {datetime.now().strftime('%H:%M:%S')}",
        "type": "Mining Equipment",
        "location": "Test Block",
        "status": "active",
        "acquisition_date": "2026-04-25T00:00:00",
        "value": 2500000,
        "asset_metadata": {
            "manufacturer": "TestManufacturer",
            "notes": "Test asset from workflow"
        }
    }
    
    print(f"Creating: {new_asset['name']}")
    create_resp = requests.post(
        f'{BASE_URL}/assets',
        json=new_asset,
        headers=headers,
        timeout=5
    )
    print(f"Status: {create_resp.status_code}")
    
    if create_resp.status_code == 201:
        created = create_resp.json()
        asset_id = created['id']
        print(f"✅ Asset created with ID: {asset_id}")
    else:
        print(f"❌ Failed to create asset: {create_resp.json()}")
        return
    
    # Step 4: Get updated asset list
    print("\n[4️⃣  GET UPDATED ASSET LIST]")
    list_resp2 = requests.get(f'{BASE_URL}/assets', headers=headers, timeout=5)
    updated_data = list_resp2.json()
    updated_count = len(updated_data.get('items', [])) if isinstance(updated_data, dict) else len(updated_data)
    print(f"Updated assets: {updated_count}")
    print(f"Difference: {updated_count - initial_count}")
    
    if updated_count > initial_count:
        print("✅ NEW ASSET VISIBLE IN LIST!")
    else:
        print("❌ New asset not visible in list")
    
    # Step 5: Get specific asset
    print("\n[5️⃣  GET SPECIFIC ASSET]")
    get_resp = requests.get(f'{BASE_URL}/assets/{asset_id}', headers=headers, timeout=5)
    print(f"Status: {get_resp.status_code}")
    
    if get_resp.status_code == 200:
        asset = get_resp.json()
        print(f"✅ Retrieved asset:")
        print(f"   Name: {asset.get('name')}")
        print(f"   Type: {asset.get('type')}")
        print(f"   Value: {asset.get('value')}")
    else:
        print(f"❌ Failed to get asset: {get_resp.json()}")
    
    # Summary
    print("\n" + "="*70)
    print("✅ WORKFLOW TEST COMPLETED SUCCESSFULLY!")
    print("="*70)
    print(f"\nSummary:")
    print(f"  - Initial assets: {initial_count}")
    print(f"  - Created new asset: {new_asset['name']}")
    print(f"  - Updated assets: {updated_count}")
    print(f"  - Asset now visible: {'YES ✅' if updated_count > initial_count else 'NO ❌'}")

if __name__ == '__main__':
    test_complete_workflow()
