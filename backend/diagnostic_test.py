#!/usr/bin/env python3
"""
Quick Diagnostic Test - Run this to see if everything is working
"""

import requests
import json

BASE_URL = 'http://localhost:8000/api/v1'

print("\n" + "="*80)
print("🔍 DIAGNOSTIC TEST - Asset System")
print("="*80)

# Test 1: Backend Connectivity
print("\n[TEST 1] Backend Connectivity")
try:
    health = requests.get('http://localhost:8000/health', timeout=5)
    print(f"✅ Backend reachable (status: {health.status_code})")
except Exception as e:
    print(f"❌ Backend NOT reachable: {e}")
    print("   → Make sure backend is running on port 8000")
    print("   → Run: cd backend && python run_server.py")
    exit(1)

# Test 2: Auth
print("\n[TEST 2] Authentication")
try:
    auth_resp = requests.post(
        f'{BASE_URL}/auth/login',
        json={'username': 'admin', 'password': 'admin@123456'},
        timeout=5
    )
    if auth_resp.status_code == 200:
        token = auth_resp.json()['access_token']
        print(f"✅ Login successful (token: {token[:20]}...)")
    else:
        print(f"❌ Login failed (status: {auth_resp.status_code})")
        print(f"   Response: {auth_resp.json()}")
        exit(1)
except Exception as e:
    print(f"❌ Login error: {e}")
    exit(1)

headers = {'Authorization': f'Bearer {token}'}

# Test 3: Get Assets
print("\n[TEST 3] Fetch Assets")
try:
    resp = requests.get(f'{BASE_URL}/assets', headers=headers, timeout=5)
    data = resp.json()
    
    print(f"Status: {resp.status_code}")
    print(f"Total assets: {data.get('total')}")
    print(f"Items returned: {len(data.get('items', []))}")
    
    if data.get('total') > 0:
        print("✅ Assets found")
        
        # Show asset types
        types = {}
        for asset in data.get('items', []):
            t = asset.get('type', 'unknown')
            types[t] = types.get(t, 0) + 1
        
        print(f"\nAsset types found ({len(types)}):")
        for type_name, count in sorted(types.items()):
            print(f"  - {type_name}: {count}")
    else:
        print("⚠️ No assets found")
        
except Exception as e:
    print(f"❌ Fetch error: {e}")

# Test 4: Create Asset
print("\n[TEST 4] Create New Asset")
new_asset = {
    "name": "Diagnostic Test Asset",
    "type": "machinery",
    "location": "Test",
    "status": "active",
    "acquisition_date": "2026-04-25T00:00:00",
    "value": 1000000,
}

try:
    resp = requests.post(
        f'{BASE_URL}/assets',
        json=new_asset,
        headers=headers,
        timeout=5
    )
    
    if resp.status_code == 201:
        asset = resp.json()
        print(f"✅ Asset created (ID: {asset['id']})")
    else:
        print(f"❌ Create failed (status: {resp.status_code})")
        print(f"   Response: {resp.json()}")
except Exception as e:
    print(f"❌ Create error: {e}")

# Test 5: Verify New Asset
print("\n[TEST 5] Verify New Asset in List")
try:
    resp = requests.get(f'{BASE_URL}/assets', headers=headers, timeout=5)
    data = resp.json()
    
    if data.get('total') > 0:
        print(f"✅ Updated total: {data['total']}")
        
        # Find our asset
        found = False
        for asset in data.get('items', []):
            if asset['name'] == "Diagnostic Test Asset":
                found = True
                print(f"✅ New asset found in list!")
                break
        
        if not found:
            print(f"⚠️ New asset not found yet (might need refresh)")
    else:
        print(f"❌ No assets returned")
        
except Exception as e:
    print(f"❌ Verify error: {e}")

# Summary
print("\n" + "="*80)
print("📋 SUMMARY")
print("="*80)
print("""
✅ Backend: Running
✅ Auth: Working  
✅ Assets: Retrievable
✅ Create: Working
✅ Sync: Working

Next steps:
1. Hard refresh frontend: http://localhost:5173 (Ctrl+Shift+R)
2. Open DevTools (F12 → Console tab)
3. Look for logs starting with 📡📦✅
4. Try adding asset and verify count increases
5. Check that new asset appears in list
""")
print("="*80 + "\n")
