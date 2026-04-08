# TGd System - Database Schema Documentation

Complete database schema reference for TGd System.

## Database Type

**PostgreSQL 12+** with SQLAlchemy 2.0 ORM

## Tables Overview

| Table | Purpose | Rows |
|-------|---------|------|
| users | User accounts | 3 (default) |
| roles | User roles (RBAC) | 3 (admin, engineer, viewer) |
| assets | Physical/digital assets | 5 (sample) |
| maintenance_logs | Maintenance operations | 6 (sample) |
| inventory_items | Spare parts inventory | 4 (sample) |
| vehicles | Fleet vehicles | 3 (sample) |
| vehicle_usage_logs | Vehicle usage tracking | 3+ (sample) |
| documents | File metadata | 0 (empty) |
| sensor_logs | IoT sensor readings | 4 (sample) |

## Detailed Schema

### users

User accounts with authentication.

```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role_id VARCHAR(36) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

**Columns:**
- `id`: UUID primary key
- `username`: Unique username for login
- `email`: Unique email address
- `password_hash`: bcrypt hashed password
- `full_name`: User display name
- `role_id`: Reference to roles table
- `is_active`: Account status
- `last_login`: Last login timestamp
- `created_by`: User who created this record
- `created_at`, `updated_at`: Timestamps (UTC)

### roles

User roles for role-based access control.

```sql
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    permissions JSON DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_name ON roles(name);
```

**Columns:**
- `id`: UUID primary key
- `name`: Role name (admin, engineer, viewer)
- `description`: Role description
- `permissions`: JSON array of permission codes
- `created_at`, `updated_at`: Timestamps

**Default Roles:**
- `admin`: Full system access
- `engineer`: Asset and maintenance access
- `viewer`: Read-only access

### assets

Physical and digital assets with hierarchical support.

```sql
CREATE TABLE assets (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    acquisition_date TIMESTAMP WITH TIME ZONE,
    value NUMERIC(15,2),
    parent_asset_id VARCHAR(36),
    asset_metadata JSON DEFAULT '{}',
    is_deleted BOOLEAN DEFAULT false,
    created_by VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_asset_id) REFERENCES assets(id)
);

CREATE INDEX idx_assets_name ON assets(name);
CREATE INDEX idx_assets_type ON assets(type);
CREATE INDEX idx_assets_location ON assets(location);
CREATE INDEX idx_assets_status ON assets(status);
CREATE INDEX idx_assets_parent_asset_id ON assets(parent_asset_id);
CREATE INDEX idx_assets_is_deleted ON assets(is_deleted);
```

**Columns:**
- `id`: UUID primary key
- `name`: Asset name
- `type`: Asset type (machinery, vehicle, facility, equipment, tool, other)
- `location`: Physical/grid location
- `status`: Asset status (active, inactive, maintenance, retired)
- `acquisition_date`: When asset was acquired
- `value`: Asset value in currency
- `parent_asset_id`: Self-referential FK for hierarchy
- `asset_metadata`: Custom JSON fields
- `is_deleted`: Soft delete flag
- `created_by`: User who created this record

**Relationships:**
- Self-referential (parent-child hierarchy)
- Has many maintenance_logs
- Has many sensor_logs
- Has many documents

### maintenance_logs

Maintenance operations and history.

```sql
CREATE TABLE maintenance_logs (
    id VARCHAR(36) PRIMARY KEY,
    asset_id VARCHAR(36) NOT NULL,
    maintenance_type VARCHAR(50) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    technician VARCHAR(255),
    cost NUMERIC(15,2),
    downtime INTEGER,
    description TEXT,
    status VARCHAR(50),
    next_maintenance_date TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE INDEX idx_maintenance_asset_id ON maintenance_logs(asset_id);
```

**Columns:**
- `id`: UUID primary key
- `asset_id`: Reference to assets table
- `maintenance_type`: Type (preventive, corrective, inspection)
- `date`: When maintenance occurred
- `technician`: Technician name
- `cost`: Maintenance cost
- `downtime`: Downtime in minutes
- `description`: Maintenance notes
- `status`: Status (scheduled, in_progress, completed, cancelled)
- `next_maintenance_date`: Scheduled next maintenance

### inventory_items

Spare parts and inventory tracking.

```sql
CREATE TABLE inventory_items (
    id VARCHAR(36) PRIMARY KEY,
    item_code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL,
    reorder_level INTEGER,
    supplier VARCHAR(255),
    price NUMERIC(15,2),
    category VARCHAR(100),
    location VARCHAR(255),
    last_restock_date TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_item_code ON inventory_items(item_code);
CREATE INDEX idx_inventory_name ON inventory_items(name);
CREATE INDEX idx_inventory_reorder ON inventory_items(quantity, reorder_level);
```

**Columns:**
- `id`: UUID primary key
- `item_code`: SKU/code (unique)
- `name`: Item name
- `quantity`: Current quantity
- `reorder_level`: Low stock threshold
- `supplier`: Supplier name
- `price`: Unit price
- `category`: Item category
- `location`: Storage location
- `last_restock_date`: Last restock timestamp

### vehicles

Fleet vehicle management.

```sql
CREATE TABLE vehicles (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_type VARCHAR(50) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    model VARCHAR(255),
    fuel_type VARCHAR(50),
    current_mileage NUMERIC(15,2),
    fuel_capacity NUMERIC(10,2),
    status VARCHAR(50),
    created_by VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicles_registration ON vehicles(registration_number);
CREATE INDEX idx_vehicles_status ON vehicles(status);
```

**Columns:**
- `id`: UUID primary key
- `vehicle_type`: Type (truck, car, forklift, motorcycle, other)
- `registration_number`: Unique registration/license plate
- `model`: Vehicle model
- `fuel_type`: Fuel type (diesel, petrol, electric, hybrid)
- `current_mileage`: Current mileage
- `fuel_capacity`: Fuel tank capacity
- `status`: Vehicle status (active, maintenance, retired)

### vehicle_usage_logs

Vehicle usage tracking.

```sql
CREATE TABLE vehicle_usage_logs (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    fuel_used NUMERIC(10,2),
    distance NUMERIC(15,2),
    driver VARCHAR(255),
    trip_purpose VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicle_usage_vehicle_id ON vehicle_usage_logs(vehicle_id);
```

**Columns:**
- `id`: UUID primary key
- `vehicle_id`: Reference to vehicles table
- `date`: Date of usage
- `fuel_used`: Fuel consumed
- `distance`: Distance traveled
- `driver`: Driver name
- `trip_purpose`: Purpose of trip

### documents

File storage metadata.

```sql
CREATE TABLE documents (
    id VARCHAR(36) PRIMARY KEY,
    asset_id VARCHAR(36),
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    s3_url VARCHAR(511),
    uploaded_by VARCHAR(36),
    uploaded_date TIMESTAMP WITH TIME ZONE,
    description TEXT,
    tags JSON DEFAULT '[]',
    is_deleted BOOLEAN DEFAULT false,
    created_by VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL
);

CREATE INDEX idx_documents_asset_id ON documents(asset_id);
CREATE INDEX idx_documents_is_deleted ON documents(is_deleted);
```

**Columns:**
- `id`: UUID primary key
- `asset_id`: Optional reference to assets (nullable)
- `file_name`: File name
- `file_type`: File type (pdf, jpg, doc, etc.)
- `file_size`: File size in bytes
- `s3_url`: S3 storage URL
- `uploaded_by`: User who uploaded
- `uploaded_date`: Upload timestamp
- `description`: File description
- `tags`: JSON array of tags
- `is_deleted`: Soft delete flag

### sensor_logs

IoT sensor data and readings.

```sql
CREATE TABLE sensor_logs (
    id VARCHAR(36) PRIMARY KEY,
    asset_id VARCHAR(36) NOT NULL,
    sensor_type VARCHAR(50) NOT NULL,
    reading_value NUMERIC(15,4),
    unit VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50),
    threshold_high NUMERIC(15,4),
    threshold_low NUMERIC(15,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

CREATE INDEX idx_sensor_logs_asset_id ON sensor_logs(asset_id);
CREATE INDEX idx_sensor_logs_timestamp ON sensor_logs(timestamp);
```

**Columns:**
- `id`: UUID primary key
- `asset_id`: Reference to assets table
- `sensor_type`: Type (temperature, vibration, pressure, humidity, etc.)
- `reading_value`: Sensor reading value
- `unit`: Reading unit
- `timestamp`: When reading was taken
- `status`: Status (normal, warning, critical)
- `threshold_high`: High threshold for alert
- `threshold_low`: Low threshold for alert

**Sensor Types:**
- TEMPERATURE: Temperature readings
- VIBRATION: Vibration/motion data
- PRESSURE: Pressure readings
- HUMIDITY: Humidity readings
- CUSTOM: Custom sensor type

## Relationships Diagram

```
users (M) ---------- (1) roles
             role_id

assets (M) ---------- (1) assets (self-referential)
         parent_asset_id

maintenance_logs (M) ---------- (1) assets
                    asset_id

inventory_items (standalone)

vehicles (1) ---------- (M) vehicle_usage_logs
    id            vehicle_id

documents (M) ---------> (1) assets (nullable)
          asset_id

sensor_logs (M) ---------- (1) assets
             asset_id
```

## Data Types

| SQLAlchemy | PostgreSQL | Python |
|-----------|-----------|--------|
| String(255) | VARCHAR(255) | str |
| Integer | INTEGER | int |
| Numeric(15,2) | NUMERIC(15,2) | Decimal |
| Boolean | BOOLEAN | bool |
| DateTime(timezone=True) | TIMESTAMP WITH TIME ZONE | datetime |
| JSON | JSON | dict |

## Constraints

- **Primary Keys**: UUID (36 chars) on all tables
- **Foreign Keys**: Cascade delete for related records
- **Unique Constraints**: username, email, item_code, registration_number
- **Not Null**: Required fields (name, type, status, etc.)
- **Soft Delete**: is_deleted flag on users, assets, documents

## Timestamps

All tables include:
- `created_at`: Creation timestamp (UTC)
- `updated_at`: Last update timestamp (UTC)

These are automatically managed by the ORM.

## Indexes

Strategic indexes created on:
- Primary keys (auto)
- Foreign keys
- Frequently queried fields (name, type, status, location)
- Filter criteria (is_deleted, parent_asset_id)
- Unique fields (username, email, item_code)

## Sample Data

The seed script (`seed_data.py`) populates:
- 1 admin user
- 1 engineer user
- 1 viewer user
- 5 assets with hierarchy
- 6 maintenance logs
- 4 inventory items
- 3 vehicles with usage logs
- 4 sensor readings

## Connection String

```env
DATABASE_URL=postgresql://tgd_user:tgd_password@localhost:5432/tgd_system
```

## Migrations

Database schema is managed through SQLAlchemy ORM. To create/reset database:

```bash
# Using seed script (recommended for dev)
python seed_data.py

# Using Alembic (for production)
alembic upgrade head
```

## Performance Considerations

1. **Indexes**: Strategic indexes on frequently queried columns
2. **Soft Delete**: is_deleted flag filters automatically
3. **Pagination**: Always use skip/limit for list queries
4. **Relationships**: Lazy loading to minimize N+1 queries
5. **JSON Fields**: Efficient for semi-structured data

## Security

- **Password Hashing**: bcrypt (min 10 rounds)
- **Timestamps**: UTC timezone for consistency
- **Soft Delete**: Audit trail preservation
- **RBAC**: Role-based access implemented in application layer
- **Foreign Keys**: Referential integrity with cascade rules

---

For ORM details, see `backend/app/models/`
For migrations, see `alembic/`
