"""
Adapter Manager - Central hub for managing all data adapters (MQTT, Modbus, etc.)
Coordinates adapter lifecycle, configuration, and integration with main application.
"""

import asyncio
import logging
from typing import Optional, Dict, List
from dataclasses import dataclass

from sqlalchemy.orm import sessionmaker

from app.adapters.mqtt_adapter import (
    MQTTAdapter,
    initialize_mqtt_adapter,
    get_mqtt_adapter,
)
from app.adapters.modbus_adapter import (
    ModbusAdapter,
    initialize_modbus_adapter,
    get_modbus_adapter,
    RegisterMapping,
    DataType,
)

logger = logging.getLogger(__name__)


@dataclass
class MQTTConfig:
    """MQTT adapter configuration."""
    enabled: bool = False
    broker_host: str = "localhost"
    broker_port: int = 1883
    username: Optional[str] = None
    password: Optional[str] = None
    subscriptions: List[Dict] = None  # List of {topic, asset_id, sensor_type}

    def __post_init__(self):
        if self.subscriptions is None:
            self.subscriptions = []


@dataclass
class ModbusConfig:
    """Modbus adapter configuration."""
    enabled: bool = False
    host: str = "localhost"
    port: int = 502
    slave_id: int = 1
    poll_interval: float = 5.0
    mappings: List[Dict] = None  # List of {register_address, asset_id, sensor_type, ...}

    def __post_init__(self):
        if self.mappings is None:
            self.mappings = []


class AdapterManager:
    """
    Central manager for all data adapters.
    Handles initialization, configuration, and lifecycle management.
    """

    def __init__(self, session_maker: sessionmaker):
        """
        Initialize adapter manager.

        Args:
            session_maker: SQLAlchemy async session maker
        """
        self.session_maker = session_maker
        self.mqtt_adapter: Optional[MQTTAdapter] = None
        self.modbus_adapter: Optional[ModbusAdapter] = None
        self.mqtt_config: Optional[MQTTConfig] = None
        self.modbus_config: Optional[ModbusConfig] = None
        self.tasks: List[asyncio.Task] = []
        self.is_running = False

    async def initialize(
        self,
        mqtt_config: Optional[MQTTConfig] = None,
        modbus_config: Optional[ModbusConfig] = None,
    ):
        """
        Initialize configured adapters.

        Args:
            mqtt_config: MQTT configuration (optional)
            modbus_config: Modbus configuration (optional)
        """
        self.mqtt_config = mqtt_config or MQTTConfig()
        self.modbus_config = modbus_config or ModbusConfig()

        logger.info("Initializing adapters...")

        # Initialize MQTT if enabled
        if self.mqtt_config.enabled:
            try:
                self.mqtt_adapter = await initialize_mqtt_adapter(
                    session_maker=self.session_maker,
                    broker_host=self.mqtt_config.broker_host,
                    broker_port=self.mqtt_config.broker_port,
                    username=self.mqtt_config.username,
                    password=self.mqtt_config.password,
                )
                logger.info("MQTT adapter initialized")
            except Exception as e:
                logger.error(f"Failed to initialize MQTT adapter: {e}")
                self.mqtt_adapter = None

        # Initialize Modbus if enabled
        if self.modbus_config.enabled:
            try:
                self.modbus_adapter = await initialize_modbus_adapter(
                    session_maker=self.session_maker,
                    host=self.modbus_config.host,
                    port=self.modbus_config.port,
                    slave_id=self.modbus_config.slave_id,
                    poll_interval=self.modbus_config.poll_interval,
                )
                logger.info("Modbus adapter initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Modbus adapter: {e}")
                self.modbus_adapter = None

    async def configure_mqtt_subscriptions(self):
        """Configure MQTT subscriptions from config."""
        if not self.mqtt_adapter or not self.mqtt_config:
            return

        for sub in self.mqtt_config.subscriptions:
            try:
                await self.mqtt_adapter.subscribe(
                    topic=sub.get("topic"),
                    asset_id=sub.get("asset_id"),
                    sensor_type=sub.get("sensor_type"),
                )
                logger.info(
                    f"Subscribed to MQTT topic: {sub.get('topic')} "
                    f"(asset: {sub.get('asset_id')})"
                )
            except Exception as e:
                logger.error(f"Failed to subscribe to {sub.get('topic')}: {e}")

    async def configure_modbus_mappings(self):
        """Configure Modbus register mappings from config."""
        if not self.modbus_adapter or not self.modbus_config:
            return

        for mapping_cfg in self.modbus_config.mappings:
            try:
                mapping = RegisterMapping(
                    asset_id=mapping_cfg.get("asset_id"),
                    sensor_type=mapping_cfg.get("sensor_type"),
                    register_address=mapping_cfg.get("register_address"),
                    data_type=DataType(
                        mapping_cfg.get("data_type", "float32")
                    ),
                    scale=mapping_cfg.get("scale", 1.0),
                    offset=mapping_cfg.get("offset", 0.0),
                    unit=mapping_cfg.get("unit", ""),
                    name=mapping_cfg.get("name", ""),
                )
                self.modbus_adapter.add_mapping(mapping)
                logger.info(
                    f"Added Modbus mapping: {mapping.name} "
                    f"(asset: {mapping.asset_id})"
                )
            except Exception as e:
                logger.error(
                    f"Failed to add Modbus mapping for "
                    f"{mapping_cfg.get('asset_id')}: {e}"
                )

    async def start(self):
        """Start all enabled adapters."""
        if self.is_running:
            logger.warning("Adapter manager already running")
            return

        logger.info("Starting adapter manager...")
        self.is_running = True

        # Configure subscriptions and mappings
        await self.configure_mqtt_subscriptions()
        await self.configure_modbus_mappings()

        # Start adapters
        if self.mqtt_adapter and self.mqtt_config.enabled:
            try:
                task = asyncio.create_task(self.mqtt_adapter.start())
                self.tasks.append(task)
                logger.info("MQTT adapter started")
            except Exception as e:
                logger.error(f"Failed to start MQTT adapter: {e}")

        if self.modbus_adapter and self.modbus_config.enabled:
            try:
                task = asyncio.create_task(self.modbus_adapter.start())
                self.tasks.append(task)
                logger.info("Modbus adapter started")
            except Exception as e:
                logger.error(f"Failed to start Modbus adapter: {e}")

        logger.info(f"Adapter manager started ({len(self.tasks)} adapters running)")

    async def stop(self):
        """Stop all adapters."""
        logger.info("Stopping adapter manager...")
        self.is_running = False

        # Stop adapters
        if self.mqtt_adapter:
            await self.mqtt_adapter.stop()
        if self.modbus_adapter:
            await self.modbus_adapter.stop()

        # Cancel tasks
        for task in self.tasks:
            if not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass

        self.tasks.clear()
        logger.info("Adapter manager stopped")

    def get_mqtt_adapter(self) -> Optional[MQTTAdapter]:
        """Get MQTT adapter instance."""
        return self.mqtt_adapter

    def get_modbus_adapter(self) -> Optional[ModbusAdapter]:
        """Get Modbus adapter instance."""
        return self.modbus_adapter

    def is_mqtt_enabled(self) -> bool:
        """Check if MQTT is enabled."""
        return self.mqtt_config.enabled if self.mqtt_config else False

    def is_modbus_enabled(self) -> bool:
        """Check if Modbus is enabled."""
        return self.modbus_config.enabled if self.modbus_config else False

    async def get_status(self) -> Dict:
        """Get status of all adapters."""
        return {
            "manager_running": self.is_running,
            "mqtt": {
                "enabled": self.is_mqtt_enabled(),
                "connected": self.mqtt_adapter.is_running
                if self.mqtt_adapter
                else False,
                "subscriptions": len(self.mqtt_config.subscriptions)
                if self.mqtt_config
                else 0,
            },
            "modbus": {
                "enabled": self.is_modbus_enabled(),
                "connected": self.modbus_adapter.is_running
                if self.modbus_adapter
                else False,
                "mappings": len(self.modbus_config.mappings)
                if self.modbus_config
                else 0,
            },
        }


# Global adapter manager instance
_adapter_manager: Optional[AdapterManager] = None


async def initialize_adapter_manager(
    session_maker: sessionmaker,
    mqtt_config: Optional[MQTTConfig] = None,
    modbus_config: Optional[ModbusConfig] = None,
) -> AdapterManager:
    """Initialize and return global adapter manager."""
    global _adapter_manager

    _adapter_manager = AdapterManager(session_maker)
    await _adapter_manager.initialize(mqtt_config, modbus_config)

    return _adapter_manager


def get_adapter_manager() -> Optional[AdapterManager]:
    """Get global adapter manager instance."""
    return _adapter_manager
