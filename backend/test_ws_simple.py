"""Simple WebSocket debug test"""
import asyncio
import websockets
import json

async def test_ws():
    """Test a single WebSocket connection"""
    print("[TEST] Testing WebSocket at ws://127.0.0.1:8000/ws/sensors/test-id")
    
    try:
        async with websockets.connect('ws://127.0.0.1:8000/ws/sensors/test-id', ping_interval=None) as ws:
            print("[OK] Connected!")
            msg = await asyncio.wait_for(ws.recv(), timeout=3)
            print(f"[MSG] {msg}")
    except Exception as e:
        print(f"[ERROR] {e}")

asyncio.run(test_ws())
