"""Check asset API response"""
import requests

token_r = requests.post('http://127.0.0.1:8000/api/v1/auth/login',
    json={'username': 'admin', 'password': 'admin@123456'})
token = token_r.json()['access_token']

resp = requests.get('http://127.0.0.1:8000/api/v1/assets',
    headers={'Authorization': f'Bearer {token}'})

items = resp.json().get('items', [])[:2]
for item in items:
    print(f'ID: {item["id"][:8]}...')
    print(f'Name: {item["name"]}')
    print()
