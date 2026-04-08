# Detailed Data Fields per Module

---

## **1. User Management Module**

### **1.1 Users Table**

| Field Name | Type | Description |
|---|---|---|
| id | String (Auto) | Unique ID (UUID) |
| username | Text | Unique username for login |
| email | Text | Unique email address |
| password_hash | Text | bcrypt hashed password |
| full_name | Text | User display name |
| role_id | Foreign Key | Reference to roles table |
| is_active | Boolean | Account status (active/inactive) |
| last_login | DateTime | Timestamp of last login |
| created_by | String | User who created this record |
| created_at | DateTime | Record creation timestamp (UTC) |
| updated_at | DateTime | Last update timestamp (UTC) |

### **1.2 Roles Table (RBAC)**

| Field Name | Type | Description |
|---|---|---|
| id | String (Auto) | Unique ID (UUID) |
| name | Text | Role name (admin, engineer, viewer) |
| description | Text | Role purpose/description |
| permissions | JSON | Array of permission codes |
| created_at | DateTime | Record creation timestamp (UTC) |
| updated_at | DateTime | Last update timestamp (UTC) |

**Default Roles:**
- `admin`: Full system access
- `engineer`: Asset and maintenance access
- `viewer`: Read-only access

---

## **2. Asset Registry Module**

### **2.1 Assets Table**

| Field Name | Type | Description |
|---|---|---|
| id | String (Auto) | Unique ID (QR/Barcode) |
| name | Text | Asset name (e.g., Excavator 320DL) |
| type | Dropdown | Equipment, Building, IT Asset, Vehicle, Machinery, etc. |
| location | Text/GIS | Physical location or plant site, latitude/longitude |
| status | Dropdown | Active, In Service, Under Repair, Retired |
| acquisition_date | Date | Date of purchase or commissioning |
| value | Currency | Current asset value/book value |
| parent_asset_id | Foreign Key | Self-referential for asset hierarchy |
| asset_metadata | JSON | Custom fields (warranty, vendor, etc.) |
| is_deleted | Boolean | Soft delete flag |
| created_by | String | User who created this record |
| created_at | DateTime | Record creation timestamp (UTC) |
| updated_at | DateTime | Last update timestamp (UTC) |

**Asset Types:**
- Machinery, Vehicle, Facility, Equipment, Tool, Other

**Asset Statuses:**
- Active, Inactive, Maintenance, Retired

---

## **3. Maintenance Management Module**

### **3.1 Maintenance Logs Table**

| Field Name | Type | Description |
|---|---|---|
| id | String (Auto) | Unique ID (UUID) |
| asset_id | Foreign Key | Reference to assets table |
| maintenance_type | Dropdown | Preventive, Corrective, Inspection |
| date | DateTime | When maintenance occurred |
| technician | Text | Technician/engineer name |
| cost | Currency | Maintenance cost |
| downtime | Integer | Downtime in minutes |
| description | Text | Maintenance notes/details |
| status | Dropdown | Scheduled, In Progress, Completed, Cancelled |
| next_maintenance_date | DateTime | Scheduled date for next maintenance |
| created_by | String | User who created this record |
| created_at | DateTime | Record creation timestamp (UTC) |
| updated_at | DateTime | Last update timestamp (UTC) |

**Maintenance Types:**
- Preventive, Corrective, Inspection

**Maintenance Statuses:**
- Scheduled, In Progress, Completed, Cancelled

---

## **4. Inventory Management Module**

### **4.1 Inventory Items Table**

| Field Name | Type | Description |
|---|---|---|
| id | String (Auto) | Unique ID (UUID) |
| item_code | Text | SKU/Code (unique, auto-generated) |
| name | Text | Spare part/item name |
| quantity | Integer | Current quantity in stock |
| reorder_level | Integer | Low stock alert threshold |
| supplier | Text | Supplier/manufacturer name |
| price | Currency | Unit price |
| category | Text | Item category (e.g., Electrical, Hydraulic, etc.) |
| location | Text | Storage location/bin |
| last_restock_date | DateTime | Date of last restock |
| created_by | String | User who created this record |
| created_at | DateTime | Record creation timestamp (UTC) |
| updated_at | DateTime | Last update timestamp (UTC) |

---

## **5. Fleet Management Module**

### **5.1 Vehicles Table**

| Field Name | Type | Description |
|---|---|---|
| id | String (Auto) | Unique ID (UUID) |
| vehicle_type | Dropdown | Truck, Car, Forklift, Motorcycle, Other |
| registration_number | Text | Unique license plate/registration |
| model | Text | Vehicle model |
| fuel_type | Dropdown | Diesel, Petrol, Electric, Hybrid |
| current_mileage | Decimal | Current odometer reading |
| fuel_capacity | Decimal | Fuel tank capacity (liters) |
| status | Dropdown | Active, Maintenance, Retired |
| created_by | String | User who created this record |
| created_at | DateTime | Record creation timestamp (UTC) |
| updated_at | DateTime | Last update timestamp (UTC) |

### **5.2 Vehicle Usage Logs Table**

| Field Name | Type | Description |
|---|---|---|
| id | String (Auto) | Unique ID (UUID) |
| vehicle_id | Foreign Key | Reference to vehicles table |
| date | DateTime | Date of usage |
| fuel_used | Decimal | Fuel consumed (liters) |
| distance | Decimal | Distance traveled (km) |
| driver | Text | Driver name |
| trip_purpose | Text | Purpose of trip (delivery, maintenance, etc.) |
| created_at | DateTime | Record creation timestamp (UTC) |
| updated_at | DateTime | Last update timestamp (UTC) |

---

## **6. IoT & Sensor Module**

### **6.1 Sensor Logs Table**

| Field Name | Type | Description |
|---|---|---|
| id | String (Auto) | Unique ID (UUID) |
| asset_id | Foreign Key | Reference to assets table |
| sensor_type | Dropdown | Temperature, Vibration, Pressure, Humidity, Custom |
| reading_value | Decimal | Sensor reading value (4 decimal places) |
| unit | Text | Reading unit (°C, m/s², bar, %, etc.) |
| timestamp | DateTime | When reading was taken |
| status | Dropdown | Normal, Warning, Critical |
| threshold_high | Decimal | High threshold for alerts |
| threshold_low | Decimal | Low threshold for alerts |
| created_at | DateTime | Record creation timestamp (UTC) |

**Sensor Types:**
- Temperature, Vibration, Pressure, Humidity, Custom

**Sensor Statuses:**
- Normal, Warning, Critical

### **6.2 Sensor Readings Table (Additional)**

| Field Name | Type | Description |
|---|---|---|
| id | String (Auto) | Unique ID (UUID) |
| sensor_id | Foreign Key | Reference to sensor device |
| reading_value | Decimal | Measured value |
| unit | Text | Measurement unit |
| timestamp | DateTime | Measurement timestamp |

### **6.3 Sensor Alerts Table**

| Field Name | Type | Description |
|---|---|---|
| id | String (Auto) | Unique ID (UUID) |
| sensor_log_id | Foreign Key | Reference to sensor_logs |
| alert_level | Dropdown | Warning, Critical, Resolved |
| message | Text | Alert message |
| acknowledged | Boolean | Alert acknowledged status |
| created_at | DateTime | Alert creation timestamp (UTC) |

### **6.4 IoT Data Sync Table**

| Field Name | Type | Description |
|---|---|---|
| id | String (Auto) | Unique ID (UUID) |
| device_id | Text | IoT device identifier |
| sync_status | Dropdown | Synced, Pending, Failed |
| last_sync | DateTime | Last synchronization timestamp |
| sync_count | Integer | Number of sync operations |

---

## **7. Document Management Module**

### **7.1 Documents Table**

| Field Name | Type | Description |
|---|---|---|
| id | String (Auto) | Unique ID (UUID) |
| asset_id | Foreign Key | Optional reference to asset |
| file_name | Text | Document filename |
| file_type | Text | File format (PDF, JPG, DOC, etc.) |
| file_size | Integer | File size in bytes |
| s3_url | Text | S3 storage URL |
| uploaded_by | String | User who uploaded document |
| uploaded_date | DateTime | Upload date/time |
| description | Text | Document description |
| tags | JSON | Array of document tags |
| is_deleted | Boolean | Soft delete flag |
| created_by | String | User who created this record |
| created_at | DateTime | Record creation timestamp (UTC) |
| updated_at | DateTime | Last update timestamp (UTC) |

---

## **Data Type Reference**

| Type | Description | Example |
|---|---|---|
| String (Auto) | UUID identifier | `550e8400-e29b-41d4-a716-446655440000` |
| Text | Free text field | `John Engineer`, `Excavator 320DL` |
| Integer | Whole number | `45`, `100` |
| Decimal | Decimal number | `1500.50`, `95.75` |
| Currency | Money value | `$15,000.00`, `Rp 50,000,000` |
| Dropdown | Predefined options | `Active`, `Maintenance`, `Retired` |
| DateTime | Date & Time | `2025-04-08 14:30:00 UTC` |
| Date | Date only | `2025-04-08` |
| Boolean | True/False | `true`, `false` |
| JSON | Structured data | `{"warranty": "24 months", "vendor": "Cat"}` |
| Foreign Key | Reference to another table | Links to users, assets, etc. |
| Text/GIS | Location data | `Plant A Building 2`, `6.2088°S, 106.8509°E` |

---

## **Key Relationships**

```
users (M) ──── (1) roles
assets (1) ──── (M) maintenance_logs
assets (1) ──── (M) sensor_logs
assets (1) ──── (M) documents
vehicles (1) ──── (M) vehicle_usage_logs
```

---

## **Summary**

The TDd System consists of 7 major modules with 17 data tables:

| Module | Tables | Purpose |
|---|---|---|
| User Management | 2 | User authentication and role-based access control |
| Asset Registry | 1 | Physical/digital asset tracking with hierarchy |
| Maintenance | 1 | Maintenance operations and history |
| Inventory | 1 | Spare parts and inventory management |
| Fleet | 2 | Vehicle management and usage tracking |
| IoT & Sensors | 4 | Sensor data, readings, alerts, and sync management |
| Documents | 1 | File storage and metadata management |
| **Total** | **17** | **Complete asset management system** |

Each module maintains data integrity through foreign key relationships, timestamps for audit trails, and soft delete flags for data preservation.
