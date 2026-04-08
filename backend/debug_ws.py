"""Debug WebSocket connection issues"""
import asyncio
import websockets
import sys

async def test():
    uri = "ws://127.0.0.1:8000/ws/sensors/test-id"
    print(f"Attempting to connect to: {uri}")
    print("Headers that will be sent:")
    print("  Upgrade: websocket")
    print("  Connection: Upgrade")
    print("")
    
    try:
        async with websockets.connect(uri, ping_interval=None) as ws:
            print("[OK] Connected!")
            msg = await ws.recv()
            print(f"[OK] Received: {msg}")
    except Exception as e:
        print(f"[ERROR] {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
