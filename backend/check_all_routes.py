"""Check all routes including WebSocket"""
from app.main import app

print("All registered routes:")
for route in app.routes:
    if hasattr(route, 'path'):
        print(f"  {route.path} - {type(route).__name__}")
    else:
        print(f"  {route}")
