"""Test assets API endpoint"""
import requests
import json

# Get auth token
auth_resp = requests.post(
    'http://localhost:8000/api/v1/auth/login',
    json={'username': 'admin', 'password': 'admin@123456'},
    timeout=5
)

if auth_resp.status_code != 200:
    print(f"[FAIL] Login failed: {auth_resp.status_code}")
    print(auth_resp.json())
    exit(1)

token = auth_resp.json()['access_token']
headers = {'Authorization': f'Bearer {token}'}

# Test assets endpoint
print("\n[TEST] Checking assets endpoint...\n")

resp = requests.get(
    'http://localhost:8000/api/v1/assets',
    headers=headers,
    timeout=5
)

print(f"Status: {resp.status_code}")
print(f"Response:")
print(json.dumps(resp.json(), indent=2))
