"""
Constants Module

Application-wide constants and enumerations.
"""

from enum import Enum


# ===== User Roles =====
class RoleEnum(str, Enum):
    """User role enumeration."""

    ADMIN = "admin"
    ENGINEER = "engineer"
    VIEWER = "viewer"


# ===== Asset Status =====
class AssetStatusEnum(str, Enum):
    """Asset status enumeration."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    RETIRED = "retired"


# ===== Asset Type =====
class AssetTypeEnum(str, Enum):
    """Asset type enumeration."""

    MACHINERY = "machinery"
    VEHICLE = "vehicle"
    FACILITY = "facility"
    EQUIPMENT = "equipment"
    TOOL = "tool"
    OTHER = "other"


# ===== Maintenance Type =====
class MaintenanceTypeEnum(str, Enum):
    """Maintenance type enumeration."""

    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    INSPECTION = "inspection"


# ===== Maintenance Status =====
class MaintenanceStatusEnum(str, Enum):
    """Maintenance log status enumeration."""

    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# ===== Vehicle Type =====
class VehicleTypeEnum(str, Enum):
    """Vehicle type enumeration."""

    TRUCK = "truck"
    CAR = "car"
    FORKLIFT = "forklift"
    MOTORCYCLE = "motorcycle"
    TRAILER = "trailer"
    OTHER = "other"


# ===== Fuel Type =====
class FuelTypeEnum(str, Enum):
    """Vehicle fuel type enumeration."""

    DIESEL = "diesel"
    PETROL = "petrol"
    ELECTRIC = "electric"
    HYBRID = "hybrid"
    LPG = "lpg"


# ===== Vehicle Status =====
class VehicleStatusEnum(str, Enum):
    """Vehicle status enumeration."""

    ACTIVE = "active"
    IDLE = "idle"
    MAINTENANCE = "maintenance"
    RETIRED = "retired"


# ===== Document Type =====
class DocumentTypeEnum(str, Enum):
    """Document type enumeration."""

    PDF = "pdf"
    IMAGE = "image"
    DOCUMENT = "document"
    SPREADSHEET = "spreadsheet"
    VIDEO = "video"
    OTHER = "other"


# ===== Sensor Type =====
class SensorTypeEnum(str, Enum):
    """Sensor type enumeration."""

    TEMPERATURE = "temperature"
    VIBRATION = "vibration"
    PRESSURE = "pressure"
    HUMIDITY = "humidity"
    DISTANCE = "distance"
    WEIGHT = "weight"
    OTHER = "other"


# ===== Sensor Status =====
class SensorStatusEnum(str, Enum):
    """Sensor reading status enumeration."""

    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"


# ===== Pagination Constants =====
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100
DEFAULT_PAGE = 1

# ===== Error Messages =====
ERROR_MESSAGES = {
    "not_found": "Resource not found",
    "unauthorized": "Unauthorized access",
    "forbidden": "Access forbidden",
    "invalid_input": "Invalid input provided",
    "duplicate": "Resource already exists",
    "server_error": "Internal server error",
}
