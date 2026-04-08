"""
Modbus Adapter for reading data from Modbus TCP devices.
Supports register mapping, data type conversion, and continuous polling.
"""

import asyncio
import logging
import struct
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from enum import Enum

from sqlalchemy.orm import sessionmaker

from app.models.sensor import SensorReading
from app.api.websocket_manager import broadcast_manager

logger = logging.getLogger(__name__)

# Try to import pymodbus
try:
    from pymodbus.client import AsyncModbusTcpClient
    from pymodbus.exceptions import ModbusException
    PYMODBUS_AVAILABLE = True
except ImportError:
    PYMODBUS_AVAILABLE = False
    logger.warning("pymodbus not installed. Modbus adapter will not work.")


class DataType(Enum):
    """Supported Modbus data types."""
    INT16 = "int16"
    UINT16 = "uint16"
    INT32 = "int32"
    UINT32 = "uint32"
    FLOAT32 = "float32"
    FLOAT64 = "float64"


class RegisterMapping:
    """Maps Modbus registers to sensor readings."""

    def __init__(
        self,
        asset_id: str,
        sensor_type: str,
        register_address: int,
        data_type: DataType = DataType.FLOAT32,
        scale: float = 1.0,
        offset: float = 0.0,
        unit: str = "",
        name: str = "",
    ):
        """
        Initialize register mapping.

        Args:
            asset_id: Asset ID for this sensor
            sensor_type: Type of sensor (temperature, pressure, etc.)
            register_address: Modbus register starting address
            data_type: Data type of register value
            scale: Scaling factor for value
            offset: Offset to add to value
            unit: Unit of measurement
            name: Human-readable name
        """
        self.asset_id = asset_id
        self.sensor_type = sensor_type
        self.register_address = register_address
        self.data_type = data_type
        self.scale = scale
        self.offset = offset
        self.unit = unit
        self.name = name

    def register_count(self) -> int:
        """Return number of registers needed for this data type."""
        if self.data_type in [DataType.INT16, DataType.UINT16]:
            return 1
        else:  # 32-bit and 64-bit types
            return 2 if self.data_type != DataType.FLOAT64 else 4

    def convert_value(self, register_values: List[int]) -> float:
        """
        Convert raw register values to scaled value.

        Args:
            register_values: List of register values (16-bit each)

        Returns:
            Scaled value
        """
        if self.data_type == DataType.INT16:
            value = struct.unpack(">h", struct.pack(">H", register_values[0]))[0]
        elif self.data_type == DataType.UINT16:
            value = register_values[0]
        elif self.data_type == DataType.INT32:
            value = struct.unpack(
                ">i", struct.pack(">HH", register_values[0], register_values[1])
            )[0]
        elif self.data_type == DataType.UINT32:
            value = (register_values[0] << 16) | register_values[1]
        elif self.data_type == DataType.FLOAT32:
            value = struct.unpack(
                ">f", struct.pack(">HH", register_values[0], register_values[1])
            )[0]
        elif self.data_type == DataType.FLOAT64:
            value = struct.unpack(
                ">d",
                struct.pack(
                    ">HHHH",
                    register_values[0],
                    register_values[1],
                    register_values[2],
                    register_values[3],
                ),
            )[0]
        else:
            value = float(register_values[0])

        # Apply scale and offset
        return value * self.scale + self.offset


class ModbusAdapter:
    """
    Modbus TCP adapter for reading sensor data from industrial devices.
    Supports multiple register mappings and continuous polling.
    """

    def __init__(
        self,
        host: str = "localhost",
        port: int = 502,
        slave_id: int = 1,
        poll_interval: float = 5.0,
        session_maker: Optional[sessionmaker] = None,
    ):
        """
        Initialize Modbus adapter.

        Args:
            host: Modbus server hostname/IP
            port: Modbus server port
            slave_id: Modbus slave ID (device ID)
            poll_interval: Polling interval in seconds
            session_maker: SQLAlchemy async session maker
        """
        if not PYMODBUS_AVAILABLE:
            raise ImportError("pymodbus is required for Modbus adapter")

        self.host = host
        self.port = port
        self.slave_id = slave_id
        self.poll_interval = poll_interval
        self.session_maker = session_maker
        self.client: Optional[AsyncModbusTcpClient] = None
        self.is_running = False
        self.mappings: Dict[int, RegisterMapping] = {}  # register_address -> mapping

    async def connect(self):
        """Connect to Modbus server."""
        try:
            logger.info(f"Connecting to Modbus TCP server at {self.host}:{self.port}")
            self.client = AsyncModbusTcpClient(
                host=self.host,
                port=self.port,
                auto_open=False,
            )
            await self.client.connect()
            self.is_running = True
            logger.info("Modbus adapter connected successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Modbus server: {e}")
            self.is_running = False
            raise

    async def disconnect(self):
        """Disconnect from Modbus server."""
        if self.client:
            await self.client.close()
            self.is_running = False
            logger.info("Modbus adapter disconnected")

    def add_mapping(self, mapping: RegisterMapping):
        """
        Add register mapping.

        Args:
            mapping: RegisterMapping instance
        """
        self.mappings[mapping.register_address] = mapping
        logger.info(
            f"Added Modbus mapping: {mapping.name or mapping.sensor_type} "
            f"@ {mapping.register_address} (asset: {mapping.asset_id})"
        )

    def remove_mapping(self, register_address: int):
        """Remove register mapping."""
        if register_address in self.mappings:
            del self.mappings[register_address]
            logger.info(f"Removed Modbus mapping for register {register_address}")

    async def _read_registers(self, address: int, count: int) -> Optional[List[int]]:
        """
        Read Modbus registers.

        Args:
            address: Starting register address
            count: Number of registers to read

        Returns:
            List of register values, or None on error
        """
        try:
            result = await self.client.read_holding_registers(
                address=address,
                count=count,
                slave=self.slave_id,
            )

            if result.isError():
                logger.error(f"Modbus error reading registers: {result}")
                return None

            return result.registers
        except Exception as e:
            logger.error(f"Exception reading Modbus registers: {e}")
            return None

    async def _process_reading(self, mapping: RegisterMapping):
        """
        Read, process, and save a single register mapping.

        Args:
            mapping: RegisterMapping to process
        """
        try:
            # Read required registers
            register_count = mapping.register_count()
            registers = await self._read_registers(
                mapping.register_address, register_count
            )

            if registers is None:
                return

            # Convert value
            value = mapping.convert_value(registers)

            # Save to database
            async with self.session_maker() as session:
                sensor_reading = SensorReading(
                    asset_id=mapping.asset_id,
                    sensor_type=mapping.sensor_type,
                    reading_value=value,
                    unit=mapping.unit,
                    status="active",
                    data_source="modbus",
                    modbus_device=f"{self.host}:{self.port}",
                    modbus_register=mapping.register_address,
                    raw_data=str(registers),
                    timestamp=datetime.utcnow(),
                )
                session.add(sensor_reading)
                await session.commit()

                logger.debug(
                    f"Modbus: Saved reading from {mapping.asset_id} "
                    f"({mapping.sensor_type}): {value} {mapping.unit}"
                )

                # Broadcast via WebSocket
                await broadcast_manager.broadcast_to_asset(
                    mapping.asset_id,
                    {
                        "type": "sensor_data",
                        "data": {
                            "asset_id": mapping.asset_id,
                            "sensor_type": mapping.sensor_type,
                            "reading_value": value,
                            "unit": mapping.unit,
                            "timestamp": sensor_reading.timestamp.isoformat(),
                        },
                    },
                )

        except Exception as e:
            logger.error(f"Error processing Modbus mapping {mapping.name}: {e}")

    async def polling_loop(self):
        """
        Main polling loop for reading Modbus registers.
        Runs continuously while connected.
        """
        if not self.client or not self.is_running:
            logger.error("Modbus adapter not connected")
            return

        logger.info(f"Modbus polling loop started (interval: {self.poll_interval}s)")

        while self.is_running:
            try:
                # Process all mappings
                for mapping in self.mappings.values():
                    await self._process_reading(mapping)

                # Wait before next poll
                await asyncio.sleep(self.poll_interval)

            except Exception as e:
                logger.error(f"Error in Modbus polling loop: {e}")
                await asyncio.sleep(self.poll_interval)

    async def start(self):
        """Start Modbus adapter (connect and run polling loop)."""
        await self.connect()
        await self.polling_loop()

    async def stop(self):
        """Stop Modbus adapter."""
        self.is_running = False
        await self.disconnect()


# Global Modbus adapter instance
modbus_adapter: Optional[ModbusAdapter] = None


async def initialize_modbus_adapter(
    session_maker: sessionmaker,
    host: str = "localhost",
    port: int = 502,
    slave_id: int = 1,
    poll_interval: float = 5.0,
) -> Optional[ModbusAdapter]:
    """Initialize and return Modbus adapter."""
    global modbus_adapter

    if not PYMODBUS_AVAILABLE:
        logger.warning("Modbus adapter not available (pymodbus not installed)")
        return None

    modbus_adapter = ModbusAdapter(
        host=host,
        port=port,
        slave_id=slave_id,
        poll_interval=poll_interval,
        session_maker=session_maker,
    )

    return modbus_adapter


async def get_modbus_adapter() -> Optional[ModbusAdapter]:
    """Get global Modbus adapter instance."""
    return modbus_adapter
