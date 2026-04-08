"""
Modbus TCP Simulator
Simple Modbus server for testing Modbus adapter without requiring real hardware
"""

import time
import struct
import logging
from datetime import datetime
import asyncio

try:
    from pymodbus.server import AsyncModbusTcpServer
    from pymodbus.datastore import ModbusSlaveContext, ModbusServerContext
    from pymodbus.datastore import ModbusSequentialDataBlock
    PYMODBUS_AVAILABLE = True
except ImportError:
    PYMODBUS_AVAILABLE = False
    print("Warning: pymodbus not installed. Simulator will not work.")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ModbusSimulator:
    """
    Simple Modbus TCP server that simulates sensor readings.
    Updates register values with synthetic data for testing.
    """

    def __init__(self, host: str = "0.0.0.0", port: int = 502):
        """
        Initialize Modbus simulator.

        Args:
            host: Server bind address
            port: Server port
        """
        if not PYMODBUS_AVAILABLE:
            raise ImportError("pymodbus is required for simulator")

        self.host = host
        self.port = port
        self.server = None

    async def start(self):
        """Start Modbus simulator server."""
        try:
            logger.info(f"Starting Modbus simulator on {self.host}:{self.port}")

            # Create data blocks for holding registers
            datablock = ModbusSequentialDataBlock(0, [0] * 100)

            # Create slave context
            context = ModbusSlaveContext(
                di=ModbusSequentialDataBlock(0, [0] * 100),
                co=ModbusSequentialDataBlock(0, [0] * 100),
                hr=datablock,  # Holding registers
                ir=ModbusSequentialDataBlock(0, [0] * 100),
            )

            # Create server context
            server_context = ModbusServerContext(
                {1: context},  # Slave ID 1
                single=False,
            )

            # Create and start server
            self.server = await AsyncModbusTcpServer(
                context=server_context,
                host=self.host,
                port=self.port,
            )

            # Start data update task
            asyncio.create_task(self.update_sensor_data(context))

            logger.info("✅ Modbus simulator started successfully")

            # Keep server running
            await self.server.serve_forever()

        except Exception as e:
            logger.error(f"❌ Error starting Modbus simulator: {e}")
            raise

    async def update_sensor_data(self, context):
        """
        Periodically update sensor data (holding registers).
        Simulates temperature, vibration, and pressure readings.
        """
        logger.info("Starting sensor data updates...")

        while True:
            try:
                # Register 0-1: Temperature (float32) - 20-30°C
                temp_value = 22.5 + (5 * (time.time() % 10) / 10)
                temp_bytes = struct.pack(">f", temp_value)
                temp_regs = struct.unpack(">HH", temp_bytes)
                context.setValues(3, 0, list(temp_regs))

                # Register 2-3: Vibration (float32) - 0-10 mm/s
                vib_value = 3.2 + (7 * ((time.time() % 5) / 5))
                vib_bytes = struct.pack(">f", vib_value)
                vib_regs = struct.unpack(">HH", vib_bytes)
                context.setValues(3, 2, list(vib_regs))

                # Register 4-5: Pressure (float32) - 7-10 bar
                pres_value = 8.5 + (1.5 * ((time.time() % 8) / 8))
                pres_bytes = struct.pack(">f", pres_value)
                pres_regs = struct.unpack(">HH", pres_bytes)
                context.setValues(3, 4, list(pres_regs))

                # Register 6-7: Humidity (float32) - 30-70%
                humid_value = 50 + (20 * ((time.time() % 12) / 12))
                humid_bytes = struct.pack(">f", humid_value)
                humid_regs = struct.unpack(">HH", humid_bytes)
                context.setValues(3, 6, list(humid_regs))

                logger.debug(
                    f"Updated registers - Temp: {temp_value:.1f}°C, "
                    f"Vib: {vib_value:.1f} mm/s, "
                    f"Pressure: {pres_value:.1f} bar, "
                    f"Humidity: {humid_value:.1f}%"
                )

                # Update every 3 seconds
                await asyncio.sleep(3)

            except Exception as e:
                logger.error(f"Error updating sensor data: {e}")
                await asyncio.sleep(5)  # Retry after 5 seconds


async def main():
    """Main entry point."""
    simulator = ModbusSimulator(host="0.0.0.0", port=502)
    await simulator.start()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Shutting down Modbus simulator...")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
