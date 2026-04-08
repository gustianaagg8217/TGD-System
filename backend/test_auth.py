"""Quick auth test"""
import requests

resp = requests.post(
    'http://localhost:8000/api/v1/auth/login',
    json={'username': 'admin', 'password': 'admin@123456'},
    timeout=5
)
print(f'Status: {resp.status_code}')
data = resp.json()
if resp.status_code == 200:
    token = data.get('access_token', '')
    print(f'✓ Token: {token[:50]}...')
    print(f'Token Type: {data.get("token_type")}')
else:
    print(f'✗ Error: {data}')
