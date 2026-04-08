"""
MQTT Adapter for ingesting data from MQTT-enabled smart sensors.
Connects to MQTT broker, subscribes to sensor topics, and saves readings to database.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Optional, Callable, List
import aiomqtt

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

from app.models.sensor import SensorReading, SensorAlert
from app.schemas.sensor import SensorReadingCreate, SensorAlertCreate
from app.api.websocket_manager import broadcast_manager

logger = logging.getLogger(__name__)


class MQTTAdapter:
    """
    MQTT adapter for connecting to MQTT broker and consuming sensor data.
    Supports dynamic topic subscriptions and automatic data ingestion.
    """

    def __init__(
        self,
        broker_host: str = "localhost",
        broker_port: int = 1883,
        username: Optional[str] = None,
        password: Optional[str] = None,
        client_id: str = "tgd-system-mqtt",
        session_maker: Optional[sessionmaker] = None,
    ):
        """
        Initialize MQTT adapter.

        Args:
            broker_host: MQTT broker hostname
            broker_port: MQTT broker port
            username: MQTT username (optional)
            password: MQTT password (optional)
            client_id: MQTT client ID
            session_maker: SQLAlchemy async session maker
        """
        self.broker_host = broker_host
        self.broker_port = broker_port
        self.username = username
        self.password = password
        self.client_id = client_id
        self.session_maker = session_maker
        self.client = None
        self.is_running = False
        self.subscriptions: Dict[str, str] = {}  # topic -> asset_id_sensor_map
        self.subscription_callbacks: Dict[str, Callable] = {}

    async def connect(self):
        """Connect to MQTT broker."""
        try:
            logger.info(
                f"Connecting to MQTT broker at {self.broker_host}:{self.broker_port}"
            )

            # Build client kwargs
            client_kwargs = {}
            if self.username and self.password:
                client_kwargs["username"] = self.username
                client_kwargs["password"] = self.password

            self.client = aiomqtt.Client(
                hostname=self.broker_host,
                port=self.broker_port,
                client_id=self.client_id,
                **client_kwargs,
            )

            await self.client.connect()
            self.is_running = True
            logger.info("MQTT adapter connected successfully")

        except Exception as e:
            logger.error(f"Failed to connect to MQTT broker: {e}")
            self.is_running = False
            raise

    async def disconnect(self):
        """Disconnect from MQTT broker."""
        if self.client:
            await self.client.disconnect()
            self.is_running = False
            logger.info("MQTT adapter disconnected")

    async def subscribe(
        self,
        topic: str,
        asset_id: str,
        sensor_type: str,
        callback: Optional[Callable] = None,
    ):
        """
        Subscribe to MQTT topic and map to asset sensor.

        Args:
            topic: MQTT topic pattern (e.g., "sensors/factory1/temperature")
            asset_id: Asset ID to associate with readings
            sensor_type: Type of sensor (temperature, humidity, pressure, etc.)
            callback: Optional callback when message received
        """
        if not self.is_running:
            logger.warning("MQTT adapter not connected, skipping subscription")
            return

        try:
            await self.client.subscribe(topic)
            self.subscriptions[topic] = {
                "asset_id": asset_id,
                "sensor_type": sensor_type,
            }
            if callback:
                self.subscription_callbacks[topic] = callback
            logger.info(f"Subscribed to MQTT topic: {topic} (asset: {asset_id})")
        except Exception as e:
            logger.error(f"Failed to subscribe to topic {topic}: {e}")

    def unsubscribe(self, topic: str):
        """Unsubscribe from MQTT topic."""
        if topic in self.subscriptions:
            del self.subscriptions[topic]
            if topic in self.subscription_callbacks:
                del self.subscription_callbacks[topic]
            logger.info(f"Unsubscribed from MQTT topic: {topic}")

    async def message_loop(self):
        """
        Main message loop for consuming MQTT messages.
        Runs continuously while connected.
        """
        if not self.client or not self.is_running:
            logger.error("MQTT adapter not connected")
            return

        try:
            async with self.client.messages() as messages:
                logger.info("MQTT message loop started")
                async for message in messages:
                    await self._handle_message(message.topic, message.payload)
        except Exception as e:
            logger.error(f"Error in MQTT message loop: {e}")
            self.is_running = False

    async def _handle_message(self, topic: str, payload: bytes):
        """
        Handle incoming MQTT message.

        Args:
            topic: MQTT topic
            payload: Message payload (bytes)
        """
        try:
            # Check if this topic has a subscription mapping
            topic_match = None
            for sub_topic, mapping in self.subscriptions.items():
                # Simple topic matching (support # wildcard)
                if self._topic_matches(topic, sub_topic):
                    topic_match = mapping
                    break

            if not topic_match:
                return

            # Parse payload
            try:
                data = json.loads(payload.decode())
            except json.JSONDecodeError:
                # Try to parse as simple number
                try:
                    value = float(payload.decode())
                    data = {"value": value}
                except ValueError:
                    logger.warning(f"Could not parse MQTT payload: {payload}")
                    return

            # Extract reading value
            reading_value = data.get("value") or data.get("reading") or data

            # Create sensor reading
            async with self.session_maker() as session:
                sensor_reading = SensorReading(
                    asset_id=topic_match["asset_id"],
                    sensor_type=topic_match["sensor_type"],
                    reading_value=reading_value,
                    unit=data.get("unit", ""),
                    location=data.get("location", ""),
                    status="active",
                    data_source="mqtt",
                    mqtt_topic=str(topic),
                    raw_data=json.dumps(data),
                    timestamp=datetime.utcnow(),
                )
                session.add(sensor_reading)
                await session.commit()

                logger.debug(
                    f"MQTT: Saved reading from {topic_match['asset_id']} "
                    f"({topic_match['sensor_type']}): {reading_value}"
                )

                # Broadcast via WebSocket
                await broadcast_manager.broadcast_to_asset(
                    topic_match["asset_id"],
                    {
                        "type": "sensor_data",
                        "data": {
                            "asset_id": topic_match["asset_id"],
                            "sensor_type": topic_match["sensor_type"],
                            "reading_value": reading_value,
                            "unit": data.get("unit", ""),
                            "timestamp": sensor_reading.timestamp.isoformat(),
                        },
                    },
                )

            # Call custom callback if registered
            if topic in self.subscription_callbacks:
                callback = self.subscription_callbacks[topic]
                if asyncio.iscoroutinefunction(callback):
                    await callback(topic_match["asset_id"], data)
                else:
                    callback(topic_match["asset_id"], data)

        except Exception as e:
            logger.error(f"Error handling MQTT message from {topic}: {e}")

    @staticmethod
    def _topic_matches(topic: str, pattern: str) -> bool:
        """
        Check if MQTT topic matches subscription pattern.
        Supports # (multi-level) and + (single-level) wildcards.

        Args:
            topic: Actual topic path
            pattern: Subscription pattern

        Returns:
            True if topic matches pattern
        """
        if pattern == "#":
            return True

        topic_parts = topic.split("/")
        pattern_parts = pattern.split("/")

        i, j = 0, 0
        while i < len(topic_parts) and j < len(pattern_parts):
            if pattern_parts[j] == "#":
                return True
            elif pattern_parts[j] == "+":
                i += 1
                j += 1
            elif pattern_parts[j] == topic_parts[i]:
                i += 1
                j += 1
            else:
                return False

        return i == len(topic_parts) and j == len(pattern_parts)

    async def start(self):
        """Start MQTT adapter (connect and run message loop)."""
        await self.connect()
        await self.message_loop()

    async def stop(self):
        """Stop MQTT adapter."""
        await self.disconnect()


# Global MQTT adapter instance
mqtt_adapter: Optional[MQTTAdapter] = None


async def initialize_mqtt_adapter(
    session_maker: sessionmaker,
    broker_host: str = "localhost",
    broker_port: int = 1883,
    username: Optional[str] = None,
    password: Optional[str] = None,
) -> MQTTAdapter:
    """Initialize and return MQTT adapter."""
    global mqtt_adapter

    mqtt_adapter = MQTTAdapter(
        broker_host=broker_host,
        broker_port=broker_port,
        username=username,
        password=password,
        session_maker=session_maker,
    )

    return mqtt_adapter


async def get_mqtt_adapter() -> Optional[MQTTAdapter]:
    """Get global MQTT adapter instance."""
    return mqtt_adapter
