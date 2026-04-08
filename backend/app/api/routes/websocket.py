"""
WebSocket Routes for Real-time Sensor Data Streaming

Provides WebSocket endpoints for streaming real-time sensor data.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json
import logging
from uuid import uuid4

from app.db.session import SessionLocal
from app.models.asset import Asset
from app.models.sensor_reading import SensorReading
from app.api.websocket_manager import manager
from fastapi import Query

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.websocket("/sensors/multi")
async def websocket_multi_sensor_stream(websocket: WebSocket):
    """
    WebSocket endpoint for monitoring multiple assets simultaneously.
    
    Client can:
    - Subscribe to multiple assets at once
    - Receive combined real-time sensor data feed
    - Filter by sensor type or status
    """
    
    # Create database session
    db = SessionLocal()
    
    try:
        await manager.connect(websocket)
        
        subscribed_assets: set = set()
        
        await manager.send_personal_message(websocket, {
            "type": "connection",
            "status": "connected",
            "message": "Connected to multi-asset sensor stream",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        logger.info("Client connected to multi-asset stream")
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "subscribe" and "asset_ids" in message:
                asset_ids = message.get("asset_ids", [])
                for asset_id in asset_ids:
                    asset = db.query(Asset).filter(Asset.id == asset_id).first()
                    if asset and asset_id not in subscribed_assets:
                        await manager.subscribe(websocket, asset_id)
                        subscribed_assets.add(asset_id)
                
                await manager.send_personal_message(websocket, {
                    "type": "subscription",
                    "status": "subscribed",
                    "asset_ids": list(subscribed_assets),
                    "count": len(subscribed_assets),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
            
            elif message.get("type") == "unsubscribe" and "asset_id" in message:
                asset_id = message.get("asset_id")
                await manager.unsubscribe(websocket, asset_id)
                subscribed_assets.discard(asset_id)
                
                await manager.send_personal_message(websocket, {
                    "type": "unsubscribed",
                    "asset_id": asset_id,
                    "remaining": list(subscribed_assets),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
            
            elif message.get("type") == "ping":
                await manager.send_personal_message(websocket, {
                    "type": "pong",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
    
    except WebSocketDisconnect:
        for asset_id in subscribed_assets:
            await manager.unsubscribe(websocket, asset_id)
        await manager.disconnect(websocket)
        logger.info("Client disconnected from multi-asset stream")
    except Exception as e:
        logger.error(f"WebSocket error in multi stream: {str(e)}")
        await manager.disconnect(websocket)
    finally:
        db.close()


@router.websocket("/sensors/{asset_id}")
async def websocket_sensor_stream(websocket: WebSocket, asset_id: str):
    """
    WebSocket endpoint for real-time sensor data streaming.
    
    Client can:
    - Subscribe to sensor data for specific asset
    - Receive real-time updates whenever new sensor readings arrive
    - Unsubscribe from asset
    
    Message format (server->client):
    ```json
    {
        "type": "sensor_data" | "subscription" | "error",
        "asset_id": "...",
        "timestamp": "2026-04-08T...",
        "data": { ... }
    }
    ```
    """
    
    logger.info(f"WebSocket connection attempt for asset: {asset_id}")
    logger.info(f"Client headers: {websocket.headers}")
    
    # Create database session
    db = SessionLocal()
    
    try:
        logger.info(f"Accepting WebSocket connection...")
        # Accept connection first, before any database queries
        await manager.connect(websocket)
        logger.info(f"WebSocket accepted successfully")
        
        # Verify asset exists
        asset = db.query(Asset).filter(Asset.id == asset_id).first()
        if not asset:
            logger.warning(f"Asset not found: {asset_id}")
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Asset not found")
            return
        
        # Subscribe client
        await manager.subscribe(websocket, asset_id)
        logger.info(f"Client subscribed to asset {asset_id}")
        
        # Send subscription confirmation
        await manager.send_personal_message(websocket, {
            "type": "subscription",
            "status": "subscribed",
            "asset_id": asset_id,
            "asset_name": asset.name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": f"Successfully subscribed to sensor data for asset: {asset.name}"
        })
        
        logger.info(f"Client subscribed to asset {asset_id}")
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle subscription commands
            if message.get("type") == "subscribe":
                new_asset_id = message.get("asset_id")
                new_asset = db.query(Asset).filter(Asset.id == new_asset_id).first()
                if new_asset:
                    await manager.unsubscribe(websocket, asset_id)
                    asset_id = new_asset_id
                    await manager.subscribe(websocket, asset_id)
                    await manager.send_personal_message(websocket, {
                        "type": "subscription",
                        "status": "subscribed",
                        "asset_id": asset_id,
                        "asset_name": new_asset.name,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })
                    logger.info(f"Client switched subscription to asset {asset_id}")
                else:
                    await manager.send_personal_message(websocket, {
                        "type": "error",
                        "message": f"Asset {new_asset_id} not found"
                    })
            
            elif message.get("type") == "unsubscribe":
                await manager.unsubscribe(websocket, asset_id)
                await manager.send_personal_message(websocket, {
                    "type": "subscription",
                    "status": "unsubscribed",
                    "asset_id": asset_id,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                })
                logger.info(f"Client unsubscribed from asset {asset_id}")
            
            elif message.get("type") == "ping":
                await manager.send_personal_message(websocket, {
                    "type": "pong",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
            
            elif message.get("type") == "get_stats":
                stats = manager.get_connection_stats()
                await manager.send_personal_message(websocket, {
                    "type": "stats",
                    "data": stats,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                })
    
    except WebSocketDisconnect:
        await manager.disconnect(websocket)
        logger.info(f"Client disconnected from asset {asset_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await manager.disconnect(websocket)
    finally:
        db.close()
