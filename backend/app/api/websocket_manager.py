"""
WebSocket Connection Manager for Real-time Sensor Streaming

Manages WebSocket connections for real-time sensor data streaming.
Handles connection registration, broadcasting, and cleanup.
"""

from typing import List, Set, Dict
from fastapi import WebSocket, WebSocketDisconnect, status
import json
import logging

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages WebSocket connections for real-time sensor data streaming.
    
    Features:
    - Track active WebSocket connections
    - Broadcast sensor data to subscribed clients
    - Handle connection/disconnection with cleanup
    - Support for asset-specific subscriptions
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.subscriptions: Dict[str, Set[WebSocket]] = {}  # asset_id -> set of websockets

    async def connect(self, websocket: WebSocket):
        """Accept WebSocket connection and add to active connections."""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected. Total connections: {len(self.active_connections)}")

    async def disconnect(self, websocket: WebSocket):
        """Remove WebSocket connection from active list and all subscriptions."""
        self.active_connections.remove(websocket)
        
        # Remove from all subscriptions
        for asset_id, connections in self.subscriptions.items():
            if websocket in connections:
                connections.discard(websocket)
        
        logger.info(f"WebSocket disconnected. Total connections: {len(self.active_connections)}")

    async def subscribe(self, websocket: WebSocket, asset_id: str):
        """Subscribe WebSocket to asset-specific sensor data."""
        if asset_id not in self.subscriptions:
            self.subscriptions[asset_id] = set()
        self.subscriptions[asset_id].add(websocket)
        logger.info(f"Client subscribed to asset: {asset_id}")

    async def unsubscribe(self, websocket: WebSocket, asset_id: str):
        """Unsubscribe WebSocket from asset-specific sensor data."""
        if asset_id in self.subscriptions:
            self.subscriptions[asset_id].discard(websocket)
            logger.info(f"Client unsubscribed from asset: {asset_id}")

    async def broadcast_to_asset(self, asset_id: str, message: dict):
        """Broadcast message to all clients subscribed to specific asset."""
        if asset_id in self.subscriptions:
            disconnected: Set[WebSocket] = set()
            for connection in self.subscriptions[asset_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.warning(f"Error sending to client: {e}")
                    disconnected.add(connection)
            
            # Remove disconnected clients
            for connection in disconnected:
                await self.disconnect(connection)

    async def broadcast_to_all(self, message: dict):
        """Broadcast message to all connected clients."""
        disconnected: Set[WebSocket] = set()
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Error sending to client: {e}")
                disconnected.add(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            await self.disconnect(connection)

    async def send_personal_message(self, websocket: WebSocket, message: dict):
        """Send message to specific client."""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.warning(f"Error sending personal message: {e}")

    def get_connection_stats(self) -> dict:
        """Get current connection statistics."""
        return {
            "total_connections": len(self.active_connections),
            "subscriptions": {
                asset_id: len(connections) 
                for asset_id, connections in self.subscriptions.items()
            }
        }


# Global connection manager instance
manager = ConnectionManager()
