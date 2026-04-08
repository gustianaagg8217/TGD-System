"""Check registered routes"""
import requests
import json

resp = requests.get('http://127.0.0.1:8000/openapi.json')
if resp.status_code == 200:
    spec = resp.json()
    print("Registered paths in OpenAPI spec:")
    for path in sorted(spec.get('paths', {}).keys()):
        print(f"  {path}")
else:
    print(f"Error: {resp.status_code}")
