"""Get full auth token"""
import requests, json

resp = requests.post(
    'http://localhost:8000/api/v1/auth/login',
    json={'username': 'admin', 'password': 'admin@123456'},
    timeout=5
)
data = resp.json()
print(json.dumps(data, indent=2))
