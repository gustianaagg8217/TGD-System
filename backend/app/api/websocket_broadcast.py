"""
WebSocket Broadcasting Integration

Integrates WebSocket broadcasting with sensor data ingestion.
When new sensor readings arrive, they are broadcast to subscribed clients in real-time.
"""

from datetime import datetime, timezone
from typing import Dict, Any
import json
import asyncio
from app.api.websocket_manager import manager
from app.schemas.sensor_schema import SensorReadingResponse


async def broadcast_sensor_data(asset_id: str, reading: Dict[str, Any]):
    """
    Broadcast new sensor reading to all WebSocket clients subscribed to asset.
    
    Args:
        asset_id: ID of the asset with new sensor data
        reading: Sensor reading data to broadcast
    """
    message = {
        "type": "sensor_data",
        "asset_id": asset_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": reading
    }
    
    # Broadcast to all clients subscribed to this asset
    await manager.broadcast_to_asset(asset_id, message)


async def broadcast_sensor_alert(asset_id: str, sensor_id: str, alert: Dict[str, Any]):
    """
    Broadcast sensor alert to all WebSocket clients subscribed to asset.
    
    Args:
        asset_id: ID of the asset with alert
        sensor_id: ID of the sensor that triggered alert
        alert: Alert data to broadcast
    """
    message = {
        "type": "sensor_alert",
        "asset_id": asset_id,
        "sensor_id": sensor_id,
        "severity": alert.get("severity", "warning"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": alert
    }
    
    await manager.broadcast_to_asset(asset_id, message)


async def broadcast_bulk_import_progress(asset_ids: list, progress: Dict[str, Any]):
    """
    Broadcast bulk import progress to all connected clients.
    
    Args:
        asset_ids: List of asset IDs being imported
        progress: Progress data (imported, skipped, errors, total)
    """
    message = {
        "type": "bulk_import_progress",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": progress
    }
    
    # Broadcast to all clients
    for asset_id in asset_ids:
        await manager.broadcast_to_asset(asset_id, message)


async def broadcast_system_status(status: str, message_text: str, data: Dict[str, Any] = None):
    """
    Broadcast system status message to all connected clients.
    
    Args:
        status: Status type (online, offline, maintenance, etc.)
        message_text: Status message
        data: Additional status data
    """
    message = {
        "type": "system_status",
        "status": status,
        "message": message_text,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": data or {}
    }
    
    await manager.broadcast_to_all(message)
