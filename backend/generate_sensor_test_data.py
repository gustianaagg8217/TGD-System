"""
IoT Sensor Test Data Generator

Generates realistic sensor readings for PT. ANDA SELALU UNTUNG mining operations.
Used for development, testing, and demo purposes.

Run with: python generate_sensor_test_data.py
"""

import json
import random
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List, Dict


class MiningOperationsSensorDataGenerator:
    """Generate realistic sensor data for mining equipment at PT. ANDA SELALU UNTUNG"""

    def __init__(self, num_days: int = 7):
        """
        Initialize the generator.
        
        Args:
            num_days: Generate data for the last N days
        """
        self.num_days = num_days
        self.end_time = datetime.now(timezone.utc)
        self.start_time = self.end_time - timedelta(days=num_days)

    def generate_vibration_readings(self, count: int = 100) -> List[Dict]:
        """Generate equipment vibration sensor readings"""
        readings = []
        assets = [
            {"id": "EQP-001", "name": "Excavator CAT 390F", "threshold_high": 7.1},
            {"id": "EQP-002", "name": "Dozer Komatsu D455AX", "threshold_high": 6.5},
            {"id": "EQP-004", "name": "Dredger KIP-3000", "threshold_high": 8.0},
            {"id": "EQP-005", "name": "Drill Rig Atlas Copco", "threshold_high": 5.0},
        ]

        for _ in range(count):
            asset = random.choice(assets)
            # Normal readings mostly (90%), occasional warnings (8%), rare critical (2%)
            rand = random.random()
            if rand < 0.90:
                value = round(random.uniform(2.0, 4.5), 2)  # Normal range
                status = "normal"
            elif rand < 0.98:
                value = round(random.uniform(4.5, 7.0), 2)  # Warning range
                status = "warning"
            else:
                value = round(random.uniform(7.0, 8.5), 2)  # Critical range
                status = "critical"

            reading = {
                "sensor_id": f"VIBE-{asset['id']}",
                "asset_id": asset["id"],
                "sensor_type": "vibration",
                "reading_value": value,
                "reading_unit": "mm/s",
                "x_axis": round(value * random.uniform(0.5, 1.0), 2),
                "y_axis": round(value * random.uniform(0.5, 1.0), 2),
                "z_axis": round(value * random.uniform(0.5, 1.0), 2),
                "threshold_high": asset["threshold_high"],
                "timestamp": (
                    self.start_time + timedelta(seconds=random.randint(0, int((self.end_time - self.start_time).total_seconds())))
                ).isoformat(),
            }
            readings.append(reading)

        return readings

    def generate_temperature_readings(self, count: int = 60) -> List[Dict]:
        """Generate temperature sensor readings from equipment"""
        readings = []
        sensors = [
            {"id": "TEMP-EQP-001", "asset_id": "EQP-001", "name": "Excavator Hydraulic", "normal_range": (50, 65)},
            {"id": "TEMP-EQP-002", "asset_id": "EQP-002", "name": "Dozer Engine", "normal_range": (60, 75)},
            {
                "id": "TEMP-FAC-001",
                "asset_id": "FAC-001",
                "name": "Smelter Furnace",
                "normal_range": (1300, 1400),
            },
        ]

        for _ in range(count):
            sensor = random.choice(sensors)
            normal_min, normal_max = sensor["normal_range"]
            # 95% normal, 4% warning, 1% critical
            rand = random.random()
            if rand < 0.95:
                value = round(random.uniform(normal_min, normal_max), 1)
                status = "normal"
            elif rand < 0.99:
                value = round(random.uniform(normal_max, normal_max + 10), 1)
                status = "warning"
            else:
                value = round(random.uniform(normal_max + 10, normal_max + 20), 1)
                status = "critical"

            reading = {
                "sensor_id": sensor["id"],
                "asset_id": sensor["asset_id"],
                "sensor_type": "temperature",
                "reading_value": value,
                "reading_unit": "°C",
                "threshold_high": normal_max + 15,
                "threshold_low": normal_min - 10,
                "timestamp": (
                    self.start_time + timedelta(seconds=random.randint(0, int((self.end_time - self.start_time).total_seconds())))
                ).isoformat(),
            }
            readings.append(reading)

        return readings

    def generate_fuel_level_readings(self, count: int = 80) -> List[Dict]:
        """Generate fuel tank level sensor readings"""
        readings = []
        vehicles = [
            {"id": "HT-001", "name": "Haul Truck Volvo", "capacity": 350},
            {"id": "LDR-002", "name": "Loader Komatsu", "capacity": 200},
            {"id": "MV-001", "name": "Supply Vessel MV Integritas", "capacity": 50000},
        ]

        for _ in range(count):
            vehicle = random.choice(vehicles)
            # Simulate realistic fuel consumption patterns
            # Usually between 20-90% of capacity
            percent = random.uniform(20, 95)
            liters = round((percent / 100) * vehicle["capacity"], 2)

            reading = {
                "sensor_id": f"FUEL-{vehicle['id']}",
                "asset_id": vehicle["id"],
                "sensor_type": "fuel",
                "reading_value": liters,
                "reading_unit": "liters",
                "threshold_high": vehicle["capacity"],
                "threshold_low": vehicle["capacity"] * 0.10,  # Alert at 10%
                "timestamp": (
                    self.start_time + timedelta(seconds=random.randint(0, int((self.end_time - self.start_time).total_seconds())))
                ).isoformat(),
            }
            readings.append(reading)

        return readings

    def generate_gps_readings(self, count: int = 100) -> List[Dict]:
        """Generate GPS positioning data for fleet"""
        readings = []
        base_locations = [
            {"id": "HT-001", "lat": -6.2088, "lon": 106.8456, "name": "Haul Truck HT-001"},
            {"id": "LDR-002", "lat": -6.2100, "lon": 106.8470, "name": "Loader LDR-002"},
            {
                "id": "MV-001",
                "lat": -6.3000,
                "lon": 106.9000,
                "name": "Vessel MV Integritas",
            },
        ]

        for _ in range(count):
            location = random.choice(base_locations)
            # Add small random variations to simulate movement
            lat = location["lat"] + random.uniform(-0.01, 0.01)
            lon = location["lon"] + random.uniform(-0.01, 0.01)
            speed = round(random.uniform(0, 60), 1)

            reading = {
                "tracker_id": f"GPS-{location['id']}",
                "asset_id": location["id"],
                "sensor_type": "gps",
                "reading_value": f"{lat},{lon}",
                "reading_unit": "degrees",
                "x_axis": round(lat, 6),  # Latitude
                "y_axis": round(lon, 6),  # Longitude
                "z_axis": round(speed, 1),  # Speed approximation in z_axis
                "timestamp": (
                    self.start_time + timedelta(seconds=random.randint(0, int((self.end_time - self.start_time).total_seconds())))
                ).isoformat(),
            }
            readings.append(reading)

        return readings

    def generate_electrical_readings(self, count: int = 70) -> List[Dict]:
        """Generate electrical parameter readings (voltage, current, power factor)"""
        readings = []
        facilities = [
            {"id": "INF-003", "name": "Power Station 5MW", "normal_voltage": 380, "max_current": 700},
            {
                "id": "FAC-002",
                "name": "Concentration Plant",
                "normal_voltage": 380,
                "max_current": 500,
            },
        ]

        for _ in range(count):
            facility = random.choice(facilities)
            # Voltage usually ±5% of nominal
            voltage = round(
                facility["normal_voltage"] + random.uniform(-20, 20), 1
            )
            current = round(random.uniform(200, min(facility["max_current"], facility["max_current"])), 1)
            pf = round(random.uniform(0.85, 0.99), 3)

            # Electrical readings can be multi-valued
            reading = {
                "sensor_id": f"ELEC-{facility['id']}",
                "asset_id": facility["id"],
                "sensor_type": "electrical",
                "reading_value": voltage,  # Primary reading is voltage
                "reading_unit": "volts",
                "x_axis": round(current, 1),  # Current in X-axis
                "y_axis": round(pf, 3),  # Power factor in Y-axis
                "threshold_high": 400,
                "threshold_low": 360,
                "timestamp": (
                    self.start_time + timedelta(seconds=random.randint(0, int((self.end_time - self.start_time).total_seconds())))
                ).isoformat(),
            }
            readings.append(reading)

        return readings

    def generate_production_readings(self, count: int = 60) -> List[Dict]:
        """Generate production counter readings"""
        readings = []
        facilities = [
            {
                "id": "FAC-002",
                "name": "Concentration Plant",
                "daily_target": 500,
                "unit": "tonnes",
            },
            {
                "id": "FAC-001",
                "name": "Smelter Plant",
                "daily_target": 250,
                "unit": "tonnes",
            },
        ]

        for _ in range(count):
            facility = random.choice(facilities)
            # Simulate daily production typically 70-110% of target
            percent = random.uniform(0.70, 1.10)
            daily_output = round(facility["daily_target"] * percent, 2)

            reading = {
                "sensor_id": f"PROD-{facility['id']}",
                "asset_id": facility["id"],
                "sensor_type": "production",
                "reading_value": daily_output,
                "reading_unit": facility["unit"],
                "threshold_high": facility["daily_target"] * 1.2,
                "threshold_low": facility["daily_target"] * 0.5,
                "timestamp": (
                    self.start_time + timedelta(seconds=random.randint(0, int((self.end_time - self.start_time).total_seconds())))
                ).isoformat(),
            }
            readings.append(reading)

        return readings

    def generate_fault_signals(self, count: int = 10) -> List[Dict]:
        """Generate equipment fault alert signals"""
        readings = []
        fault_codes = [
            {
                "code": "P0234",
                "description": "Turbocharger pressure low or overboost condition",
                "asset_id": "EQP-001",
            },
            {
                "code": "E1234",
                "description": "Hydraulic pressure below minimum threshold",
                "asset_id": "EQP-002",
            },
            {
                "code": "C5678",
                "description": "Engine temperature sensor malfunction",
                "asset_id": "HT-001",
            },
            {
                "code": "M9012",
                "description": "Motor bearing vibration excessive",
                "asset_id": "FAC-001",
            },
        ]

        for _ in range(count):
            fault = random.choice(fault_codes)
            reading = {
                "alert_id": f"ALERT-{fault['asset_id']}-{datetime.now(timezone.utc).isoformat()}",
                "asset_id": fault["asset_id"],
                "sensor_id": f"FAULT-{fault['asset_id']}",
                "sensor_type": "fault",
                "reading_value": fault["code"],
                "reading_unit": "code",
                "message": fault["description"],
                "action_required": "Inspect equipment within 24 hours",
                "threshold_high": 1,  # Any fault signal is critical
                "timestamp": (
                    self.start_time + timedelta(seconds=random.randint(0, int((self.end_time - self.start_time).total_seconds())))
                ).isoformat(),
            }
            readings.append(reading)

        return readings

    def generate_all(self) -> List[Dict]:
        """Generate all sensor readings"""
        all_readings = []
        all_readings.extend(self.generate_vibration_readings())
        all_readings.extend(self.generate_temperature_readings())
        all_readings.extend(self.generate_fuel_level_readings())
        all_readings.extend(self.generate_gps_readings())
        all_readings.extend(self.generate_electrical_readings())
        all_readings.extend(self.generate_production_readings())
        all_readings.extend(self.generate_fault_signals())
        return all_readings


def main():
    """Generate and save test data"""
    print("🔧 Generating test sensor data for PT. ANDA SELALU UNTUNG mining operations...")

    generator = MiningOperationsSensorDataGenerator(num_days=7)

    # Generate data
    all_readings = generator.generate_all()

    # Save to JSON file
    output_file = "sensor_test_data.json"
    with open(output_file, "w") as f:
        json.dump(
            {
                "metadata": {
                    "generated_at": datetime.now(timezone.utc).isoformat(),
                    "total_readings": len(all_readings),
                    "date_range": {
                        "from": generator.start_time.isoformat(),
                        "to": generator.end_time.isoformat(),
                    },
                    "sensors": {
                        "vibration": len([r for r in all_readings if r.get("sensor_type") == "vibration"]),
                        "temperature": len([r for r in all_readings if r.get("sensor_type") == "temperature"]),
                        "fuel": len([r for r in all_readings if r.get("sensor_type") == "fuel"]),
                        "gps": len([r for r in all_readings if r.get("sensor_type") == "gps"]),
                        "electrical": len([r for r in all_readings if r.get("sensor_type") == "electrical"]),
                        "production": len([r for r in all_readings if r.get("sensor_type") == "production"]),
                        "fault": len([r for r in all_readings if r.get("sensor_type") == "fault"]),
                    },
                },
                "records": all_readings,
            },
            f,
            indent=2,
        )

    print(f"✅ Generated {len(all_readings)} sensor readings")
    print(f"💾 Saved to {output_file}")
    print()
    print("Usage:")
    print("  POST http://localhost:8000/api/v1/sensors/bulk")
    print("  Body: { \"records\": <sensor_test_data.json['records']>, \"override_existing\": false }")


if __name__ == "__main__":
    main()
